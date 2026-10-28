<?php

namespace App\Console\Commands;

use App\Models\Anexo;
use App\Models\Caso;
use App\Models\Compromisso;
use Illuminate\Console\Command;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

class PrivatizarAnexosCommand extends Command
{
    protected $signature = 'anexos:privatizar {--apply : Copia para o disco privado e remove a cópia pública}';

    protected $description = 'Move anexos existentes de casos e compromissos para o disco privado';

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $total = 0;
        $falhas = 0;

        Anexo::withTrashed()
            ->where('anexavel_type', Caso::class)
            ->whereNotNull('arquivo')
            ->where('arquivo', 'like', 'casos/%')
            ->each(function (Anexo $anexo) use ($apply, &$total, &$falhas): void {
                $total++;
                $this->privatizarArquivo($anexo->arquivo, $apply, $falhas);
            });

        Compromisso::query()
            ->whereNotNull('anexo')
            ->where('anexo', 'like', 'compromissos/%')
            ->each(function (Compromisso $compromisso) use ($apply, &$total, &$falhas): void {
                $total++;
                $this->privatizarArquivo($compromisso->anexo, $apply, $falhas);
            });

        if (!$apply) {
            $this->info("{$total} anexo(s) encontrado(s). Nenhum arquivo foi alterado; execute novamente com --apply para mover e remover as cópias públicas.");

            return $falhas > 0 ? self::FAILURE : self::SUCCESS;
        }

        $this->info(($total - $falhas) . " anexo(s) privado(s). {$falhas} falha(s).");

        return $falhas > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function privatizarArquivo(string $path, bool $apply, int &$falhas): void
    {
        /** @var FilesystemAdapter $public */
        $public = Storage::disk('public');
        /** @var FilesystemAdapter $private */
        $private = Storage::disk('local');

        $existePublico = $public->exists($path);
        $existePrivado = $private->exists($path);

        if (!$existePublico && !$existePrivado) {
            $falhas++;
            $this->error("Arquivo ausente nos dois discos: {$path}");

            return;
        }

        if (!$apply) {
            $acao = $existePublico
                ? ($existePrivado ? 'remover cópia pública duplicada' : 'mover para o disco privado')
                : 'já está privado';
            $this->line("{$acao}: {$path}");

            return;
        }

        if ($existePublico && !$existePrivado) {
            $stream = $public->readStream($path);
            if (!is_resource($stream)) {
                $falhas++;
                $this->error("Não foi possível ler o arquivo público: {$path}");

                return;
            }

            try {
                $gravado = $private->writeStream($path, $stream);
            } catch (\Throwable $exception) {
                $falhas++;
                $this->error("Falha ao copiar o arquivo para o disco privado: {$path}");

                return;
            } finally {
                fclose($stream);
            }

            if (!$gravado || !$private->exists($path) || !$this->sameContents($public, $private, $path)) {
                $private->delete($path);
                $falhas++;
                $this->error("A cópia privada não foi validada; o original público foi mantido: {$path}");

                return;
            }

            $existePrivado = true;
        } elseif ($existePublico && $existePrivado && !$this->sameContents($public, $private, $path)) {
            $falhas++;
            $this->error("Os arquivos público e privado diferem; o original foi mantido: {$path}");

            return;
        }

        if ($existePublico && $existePrivado && !$public->delete($path)) {
            $falhas++;
            $this->error("O arquivo foi copiado, mas a cópia pública não pôde ser removida: {$path}");

            return;
        }

        $this->line("Privatizado: {$path}");
    }

    private function sameContents(
        FilesystemAdapter $first,
        FilesystemAdapter $second,
        string $path,
    ): bool {
        $firstStream = $first->readStream($path);
        $secondStream = $second->readStream($path);

        if (!is_resource($firstStream) || !is_resource($secondStream)) {
            if (is_resource($firstStream)) {
                fclose($firstStream);
            }
            if (is_resource($secondStream)) {
                fclose($secondStream);
            }

            return false;
        }

        try {
            $firstHash = hash_init('sha256');
            $secondHash = hash_init('sha256');
            hash_update_stream($firstHash, $firstStream);
            hash_update_stream($secondHash, $secondStream);

            return hash_equals(hash_final($firstHash), hash_final($secondHash));
        } finally {
            fclose($firstStream);
            fclose($secondStream);
        }
    }
}
