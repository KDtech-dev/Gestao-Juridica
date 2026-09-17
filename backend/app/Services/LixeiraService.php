<?php

namespace App\Services;

use App\Models\Advogado;
use App\Models\Anexo;
use App\Models\Caso;
use App\Models\Cliente;
use App\Models\Compromisso;
use App\Models\Exclusao;
use App\Models\Funcionario;
use App\Models\Notificacao;
use App\Models\Publicacao;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class LixeiraService
{
    private const MODELS = [
        'cliente' => Cliente::class, 'caso' => Caso::class,
        'publicacao' => Publicacao::class, 'compromisso' => Compromisso::class,
        'anexo' => Anexo::class, 'usuario' => User::class, 'notificacao' => Notificacao::class,
    ];

    public function excluir(Model $model): Exclusao
    {
        $files = [];
        try {
            return DB::transaction(function () use ($model, &$files) {
                $model = $model->newQuery()->lockForUpdate()->findOrFail($model->getKey());
                $members = $this->members($model);
                $id = (string) Str::uuid();
                foreach ($members as $member) {
                    foreach ($this->files($member) as [$disk, $path]) {
                        $key = $disk.':'.$path;
                        if (! isset($files[$key])) {
                            $files[$key] = $this->backup($id, $disk, $path);
                        }
                    }
                }
                $entry = Exclusao::create([
                    'id' => $id,
                    'tipo' => $this->type($model),
                    'registro_id' => (string) $model->getKey(),
                    'descricao' => Str::limit($model->titulo ?? $model->name ?? $model->nome_arquivo ?? 'Registro excluído', 250),
                    'excluido_por' => Auth::id(),
                    'expira_em' => now()->addDays(30),
                    'conteudo' => [
                        'members' => array_map(fn ($item) => ['type' => $this->type($item), 'id' => $item->getKey()], $members),
                        'files' => array_values($files),
                    ],
                ]);
                foreach (array_reverse($members) as $member) {
                    if ($member instanceof User) {
                        $member->tokens()->delete();
                        $member->forceFill(['remember_token' => null, 'api_token' => null])->save();
                        DB::table('sessions')->where('user_id', $member->id)->delete();
                    }
                    $member->delete();
                }
                $this->removeOriginals($files);

                return $entry;
            });
        } catch (\Throwable $e) {
            $this->undoFileRemoval($files);
            throw $e;
        }
    }

    /** Retain replaced/removed photos and banners as downloadable versions. */
    public function guardarArquivo(string $disk, ?string $path, int $remainingOwnerReferences = 1): void
    {
        if (! $path) {
            return;
        }
        $files = [];
        try {
            DB::transaction(function () use ($disk, $path, $remainingOwnerReferences, &$files) {
                $id = (string) Str::uuid();
                $files[] = $this->backup($id, $disk, $path);
                Exclusao::create([
                    'id' => $id, 'tipo' => 'arquivo', 'descricao' => Str::limit(basename($path), 250),
                    'excluido_por' => Auth::id(), 'expira_em' => now()->addDays(30),
                    'conteudo' => ['members' => [], 'files' => $files],
                ]);
                $this->removeOriginals($files, $remainingOwnerReferences);
            });
        } catch (\Throwable $e) {
            $this->undoFileRemoval($files);
            throw $e;
        }
    }

    public function desvincularCliente(Caso $caso, string $clienteId): void
    {
        DB::transaction(function () use ($caso, $clienteId) {
            $pivot = DB::table('caso_cliente')->where('caso_id', $caso->id)->where('cliente_id', $clienteId)->lockForUpdate()->first();
            if (! $pivot) {
                return;
            }
            Exclusao::create([
                'tipo' => 'vinculo_cliente', 'registro_id' => $caso->id,
                'descricao' => Str::limit('Cliente desvinculado: '.$caso->titulo, 250),
                'excluido_por' => Auth::id(), 'expira_em' => now()->addDays(30),
                'conteudo' => ['members' => [], 'files' => [], 'pivot' => (array) $pivot],
            ]);
            $caso->clientes()->detach($clienteId);
        });
    }

    public function restaurar(Exclusao $entry): void
    {
        $written = [];
        try {
            DB::transaction(function () use ($entry, &$written) {
                $entry = Exclusao::lockForUpdate()->findOrFail($entry->id);
                $this->assertAvailable($entry);
                abort_if($entry->tipo === 'arquivo', 409, 'Recupere esta versão pelo botão Baixar arquivo.');
                $payload = $entry->conteudo;
                if ($entry->tipo === 'vinculo_cliente') {
                    $pivot = $payload['pivot'];
                    abort_unless(Caso::whereKey($pivot['caso_id'])->exists() && Cliente::whereKey($pivot['cliente_id'])->exists(), 409,
                        'Restaure primeiro o caso e o cliente.');
                    abort_if(DB::table('caso_cliente')->where('caso_id', $pivot['caso_id'])->where('cliente_id', $pivot['cliente_id'])->exists(), 409,
                        'O cliente já está vinculado ao caso.');
                    DB::table('caso_cliente')->insert($pivot);
                    $entry->update(['restaurado_em' => now(), 'restaurado_por' => Auth::id()]);

                    return;
                }
                $members = [];
                foreach ($payload['members'] as $item) {
                    $class = self::MODELS[$item['type']];
                    $member = $class::onlyTrashed()->lockForUpdate()->find($item['id']);
                    abort_unless($member, 409, 'O registro não está mais disponível para restauração.');
                    $members[] = $member;
                }
                foreach ($members as $member) {
                    $this->assertParentsAvailable($member, $members);
                }
                foreach ($payload['files'] as $file) {
                    $disk = Storage::disk($file['disk']);
                    if ($disk->exists($file['path'])) {
                        abort_unless($this->checksum($file['disk'], $file['path']) === $this->checksum('lixeira', $file['backup']),
                            409, 'Já existe outro arquivo no destino. A restauração não sobrescreve arquivos.');

                        continue;
                    }
                    // Record before writing so a partially failed stream is also removed.
                    $written[] = $file;
                    $this->copy('lixeira', $file['backup'], $file['disk'], $file['path']);
                }
                foreach ($members as $member) {
                    $member->restore();
                }
                $entry->update(['restaurado_em' => now(), 'restaurado_por' => Auth::id()]);
            });
        } catch (\Throwable $e) {
            foreach ($written as $file) {
                Storage::disk($file['disk'])->delete($file['path']);
            }
            throw $e;
        }
    }

    public function assertAvailable(Exclusao $entry): void
    {
        abort_if($entry->restaurado_em || $entry->eliminado_em || $entry->expira_em->lte(now()), 410,
            'O prazo de recuperação terminou ou o item já foi restaurado.');
    }

    /** Expired archives are removed; the small audit record remains. */
    public function limpar(): int
    {
        $count = 0;
        Exclusao::whereNull('eliminado_em')->where('expira_em', '<=', now())
            ->orderBy('expira_em')->each(function ($entry) use (&$count) {
                DB::transaction(function () use ($entry, &$count) {
                    $entry = Exclusao::lockForUpdate()->findOrFail($entry->id);
                    if ($entry->eliminado_em || $entry->expira_em->isFuture()) {
                        return;
                    }
                    if (! $entry->restaurado_em) {
                        foreach (array_reverse($entry->conteudo['members']) as $item) {
                            $class = self::MODELS[$item['type']];
                            $member = $class::onlyTrashed()->lockForUpdate()->find($item['id']);
                            if ($member) {
                                // Never cascade into a separately retained archive.
                                if ($member instanceof User && (
                                    Publicacao::withTrashed()->where('user_id', $member->id)->exists()
                                    || Compromisso::withTrashed()->where('user_id', $member->id)->exists()
                                )) {
                                    return;
                                }
                                $addresses = [];
                                if ($member instanceof User) {
                                    $addresses = array_filter([$member->advogado?->endereco_id, $member->funcionario?->endereco_id]);
                                } elseif ($member instanceof Cliente && $member->endereco_id) {
                                    $addresses = [$member->endereco_id];
                                }
                                $member->forceDelete();
                                foreach (array_unique($addresses) as $address) {
                                    if (! DB::table('clientes')->where('endereco_id', $address)->exists()
                                        && ! DB::table('advogados')->where('endereco_id', $address)->exists()
                                        && ! DB::table('funcionarios')->where('endereco_id', $address)->exists()) {
                                        DB::table('enderecos')->where('id', $address)->delete();
                                    }
                                }
                            }
                        }
                    }
                    if (! Storage::disk('lixeira')->deleteDirectory($entry->id)) {
                        throw new RuntimeException('Não foi possível limpar os arquivos da lixeira.');
                    }
                    $entry->update(['conteudo' => null, 'descricao' => 'Conteúdo eliminado após 30 dias', 'eliminado_em' => now()]);
                    $count++;
                });
            });

        return $count;
    }

    private function members(Model $model): array
    {
        $members = [$model];
        if ($model instanceof Caso || $model instanceof Publicacao || $model instanceof Cliente) {
            $members = array_merge($members, $model->anexos()->lockForUpdate()->get()->all());
        }
        if ($model instanceof Compromisso) {
            $members = array_merge($members, $model->notificacoes()->lockForUpdate()->get()->all());
        }
        if ($model instanceof User) {
            $members = array_merge($members, $model->notificacoes()->lockForUpdate()->get()->all());
            foreach ([Publicacao::class, Compromisso::class] as $class) {
                foreach ($class::where('user_id', $model->id)->lockForUpdate()->get() as $child) {
                    $members = array_merge($members, $this->members($child));
                }
            }
        }

        return collect($members)->unique(fn ($item) => $item::class.':'.$item->getKey())->values()->all();
    }

    private function type(Model $model): string
    {
        $type = array_search($model::class, self::MODELS, true);
        if ($type === false) {
            throw new RuntimeException('Tipo de registro não suportado pela lixeira.');
        }

        return $type;
    }

    private function files(Model $model): array
    {
        $files = [];
        foreach (['foto_perfil', 'imagem_caminho', 'anexo'] as $field) {
            if ($model->getAttribute($field)) {
                $files[] = ['public', $model->getAttribute($field)];
            }
        }
        if ($model instanceof Anexo && $model->arquivo) {
            $files[] = [str_starts_with($model->arquivo, 'casos/') ? 'local' : 'public', $model->arquivo];
        }
        if ($model instanceof User) {
            foreach ([$model->advogado, $model->funcionario] as $profile) {
                if ($profile?->foto_perfil) {
                    $files[] = ['public', $profile->foto_perfil];
                }
            }
        }

        return $files;
    }

    private function backup(string $id, string $disk, string $path): array
    {
        $backup = $id.'/'.hash('sha256', $disk.':'.$path);
        try {
            $this->copy($disk, $path, 'lixeira', $backup);
        } catch (\Throwable $e) {
            Storage::disk('lixeira')->delete($backup);
            throw $e;
        }

        return compact('disk', 'path', 'backup');
    }

    private function copy(string $fromDisk, string $from, string $toDisk, string $to): void
    {
        $stream = Storage::disk($fromDisk)->readStream($from);
        if (! is_resource($stream)) {
            throw new RuntimeException('Não foi possível ler o arquivo. A operação foi cancelada para preservar os dados.');
        }
        try {
            if (! Storage::disk($toDisk)->put($to, $stream)) {
                throw new RuntimeException('Não foi possível preservar o arquivo.');
            }
        } finally {
            fclose($stream);
        }
    }

    private function removeOriginals(array $files, int $allowedReferences = 0): void
    {
        foreach ($files as $file) {
            if ($this->references($file['path']) > $allowedReferences) {
                continue;
            }
            if (! Storage::disk($file['disk'])->delete($file['path'])) {
                throw new RuntimeException('Não foi possível retirar o arquivo original.');
            }
        }
    }

    private function checksum(string $disk, string $path): string
    {
        $stream = Storage::disk($disk)->readStream($path);
        if (! is_resource($stream)) {
            throw new RuntimeException('Não foi possível verificar o arquivo.');
        }
        try {
            $hash = hash_init('sha256');
            hash_update_stream($hash, $stream);

            return hash_final($hash);
        } finally {
            fclose($stream);
        }
    }

    private function references(string $path): int
    {
        return Cliente::where('foto_perfil', $path)->count()
            + User::where('foto_perfil', $path)->count()
            + Publicacao::where('imagem_caminho', $path)->count()
            + Compromisso::where('anexo', $path)->count()
            + Anexo::where('arquivo', $path)->count()
            + Advogado::whereHas('user')->where('foto_perfil', $path)->count()
            + Funcionario::whereHas('user')->where('foto_perfil', $path)->count();
    }

    private function undoFileRemoval(array $files): void
    {
        foreach ($files as $file) {
            if (! Storage::disk($file['disk'])->exists($file['path'])) {
                $this->copy('lixeira', $file['backup'], $file['disk'], $file['path']);
            }
            Storage::disk('lixeira')->delete($file['backup']);
        }
    }

    private function assertParentsAvailable(Model $model, array $members): void
    {
        $parents = [];
        if ($model instanceof Publicacao || $model instanceof Compromisso) {
            $parents[] = [User::class, $model->user_id];
        }
        if ($model instanceof Notificacao) {
            $parents[] = [User::class, $model->usuario_id];
            if ($model->compromisso_id) {
                $parents[] = [Compromisso::class, $model->compromisso_id];
            }
        }
        if ($model instanceof Anexo) {
            if ($model->publicacao_id) {
                $parents[] = [Publicacao::class, $model->publicacao_id];
            } elseif (in_array($model->anexavel_type, [Caso::class, Cliente::class], true)) {
                $parents[] = [$model->anexavel_type, $model->anexavel_id];
            }
        }
        foreach ($parents as [$class, $id]) {
            $included = collect($members)->contains(fn ($item) => $item instanceof $class && (string) $item->getKey() === (string) $id);
            abort_unless($included || $class::whereKey($id)->exists(), 409, 'Restaure primeiro o cadastro ao qual este item pertence.');
        }
    }
}
