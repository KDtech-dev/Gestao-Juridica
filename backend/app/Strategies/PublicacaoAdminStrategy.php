<?php

namespace App\Strategies;

use App\Enums\StatusPublicacao;
use App\Interfaces\PublicationStrategyInterface;
use App\Models\Publicacao;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PublicacaoAdminStrategy implements PublicationStrategyInterface
{
    public function getAll()
    {
        return Publicacao::query()
            ->where('user_id', Auth::id())
            ->with(['categoria', 'anexos'])
            ->latest()
            ->get();
    }

    public function getById(string $id)
    {
        return Publicacao::query()
            ->where('user_id', Auth::id())
            ->where('id', $id)
            ->with(['categoria', 'anexos'])
            ->firstOrFail();
    }

    public function create(array $data)
    {
        $anexos = $data['anexos'] ?? [];
        $imagem = $data['imagem'] ?? null;
        unset($data['anexos']);
        unset($data['imagem']);

        $data['user_id'] = Auth::id();

        $this->handlePublishedAt($data);

        $this->storeImagem($data, $imagem);

        $publicacao = Publicacao::create($data);

        $this->storeAnexos($publicacao, $anexos);

        return $publicacao->fresh([
            'categoria',
            'user',
            'anexos'
        ]);
    }

    public function update(string $id, array $data)
    {
        $anexos = $data['anexos'] ?? [];
        $anexosRemover = $data['anexos_remover'] ?? [];
        $imagem = $data['imagem'] ?? null;
        unset($data['anexos']);
        unset($data['anexos_remover']);
        unset($data['imagem']);

        $publicacao = Publicacao::query()
            ->where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $this->handlePublishedAt($data, $publicacao);

        $this->storeImagem($data, $imagem);

        $publicacao->update($data);

        $this->removeAnexos($publicacao, $anexosRemover);
        $this->storeAnexos($publicacao, $anexos);

        return $publicacao->fresh([
            'categoria',
            'user',
            'anexos'
        ]);
    }
    public function delete(string $id)
    {
        $publicacao = Publicacao::query()
            ->where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        return $publicacao->delete();
    }

    private function handlePublishedAt(
        array &$data,
        ?Publicacao $publicacao = null
    ): void {

        $status = $data['status']
            ?? $publicacao?->status?->value;
        if (
            $status === StatusPublicacao::PUBLICADO->value
            && empty($data['publicado_em'])
            && empty($publicacao?->publicado_em)
        ) {
            $data['publicado_em'] = now();
        }
        if (
            in_array($status, [
                StatusPublicacao::RASCUNHO->value,
                StatusPublicacao::ARQUIVADO->value
            ])
        ) {
            $data['publicado_em'] = null;
        }
    }

    private function storeAnexos(Publicacao $publicacao, array $anexos): void
    {
        foreach ($anexos as $anexo) {
            if (!$anexo instanceof UploadedFile) {
                continue;
            }

            $path = $anexo->storePublicly(
                "publicacoes/{$publicacao->id}/anexos",
                'public'
            );

            $publicacao->anexos()->create([
                'descricao' => 'Anexo da publicação',
                'arquivo' => $path,
                'nome_arquivo' => $anexo->getClientOriginalName(),
            ]);
        }
    }

    private function storeImagem(array &$data, ?UploadedFile $imagem): void
    {
        if (!$imagem) {
            return;
        }

        $path = $imagem->storePublicly(
            'publicacoes/banners',
            'public'
        );

        $data['imagem_caminho'] = asset("storage/{$path}");
    }

    private function replaceAnexos(Publicacao $publicacao): void
    {
        $publicacao->loadMissing('anexos');

        foreach ($publicacao->anexos as $anexo) {
            if ($anexo->arquivo) {
                Storage::disk('public')->delete($anexo->arquivo);
            }

            $anexo->delete();
        }
    }

    private function removeAnexos(Publicacao $publicacao, array $anexoIds): void
    {
        if (empty($anexoIds)) {
            return;
        }

        $publicacao->anexos()
            ->whereIn('id', $anexoIds)
            ->get()
            ->each(function ($anexo): void {
                if ($anexo->arquivo) {
                    Storage::disk('public')->delete($anexo->arquivo);
                }

                $anexo->delete();
            });
    }
}
