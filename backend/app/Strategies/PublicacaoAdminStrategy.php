<?php

namespace App\Strategies;

use App\Enums\StatusPublicacao;
use App\Interfaces\PublicationStrategyInterface;
use App\Models\Publicacao;
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
        unset($data['anexos']);

        $data['user_id'] = Auth::id();

        $this->handlePublishedAt($data);

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
        unset($data['anexos']);

        $publicacao = Publicacao::query()
            ->where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $this->handlePublishedAt($data, $publicacao);

        $publicacao->update($data);

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
            if (!$anexo) {
                continue;
            }

            $path = $anexo->store(
                "publicacoes/{$publicacao->id}/anexos",
                'public'
            );

            $publicacao->anexos()->create([
                'descricao' => 'Anexo da publicação',
                'arquivo' => $path,
                'nome_arquivo' => $anexo->getClientOriginalName(),
                'url' => Storage::disk('public')->url($path),
            ]);
        }
    }
}
