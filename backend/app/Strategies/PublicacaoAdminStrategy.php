<?php

namespace App\Strategies;

use App\Enums\StatusPublicacao;
use App\Interfaces\PublicationStrategyInterface;
use App\Models\Publicacao;
use Illuminate\Support\Facades\Auth;

class PublicacaoAdminStrategy implements PublicationStrategyInterface
{
    public function getAll()
    {
        return Publicacao::query()
            ->where('user_id', Auth::id())
            ->with('categoria')
            ->latest()
            ->get();
    }

    public function getById(string $id)
    {
        return Publicacao::query()
            ->where('user_id', Auth::id())
            ->where('id', $id)
            ->with('categoria')
            ->firstOrFail();
    }

    public function create(array $data)
    {
        $data['user_id'] = Auth::id();

        $this->handlePublishedAt($data);

        return Publicacao::create($data);
    }

    public function update(string $id, array $data)
    {
        $publicacao = Publicacao::query()
            ->where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $this->handlePublishedAt($data, $publicacao);

        $publicacao->update($data);

        return $publicacao->fresh([
            'categoria',
            'user'
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
}
