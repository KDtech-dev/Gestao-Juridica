<?php

namespace App\Services;

use App\Enums\StatusPublicacao;
use App\Models\Anexo;
use App\Models\Publicacao;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PublicacaoService
{
    public function getPublicacoes()
    {
        return Publicacao::query()
            ->where('user_id', Auth::id())
            ->with(['categoria', 'anexos'])
            ->latest()
            ->get();
    }

    public function getPublicacaoById(string $id)
    {
        return Publicacao::query()
            ->where('user_id', Auth::id())
            ->where('id', $id)
            ->with(['categoria', 'anexos'])
            ->firstOrFail();
    }

    public function getPublicacoesPublicas()
    {
        return $this->publicQuery()
            ->orderByDesc('publicado_em')
            ->get();
    }

    public function getPublicacaoPublicaById(string $id)
    {
        return $this->publicQuery()
            ->where('id', $id)
            ->firstOrFail();
    }

    public function createPublicacao(array $data)
    {
        unset(
            $data['anexos'],
            $data['imagem'],
            $data['anexos_remover']
        );

        $data['user_id'] = Auth::id();

        $this->handlePublishedAt($data);

        return Publicacao::create($data)
            ->fresh([
                'categoria',
                'user',
                'anexos',
            ]);
    }


    public function updatePublicacao(string $id, array $data)
    {
        unset(
            $data['anexos'],
            $data['imagem'],
            $data['anexos_remover']
        );

        $publicacao = Publicacao::query()
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        $this->handlePublishedAt(
            $data,
            $publicacao
        );

        $publicacao->update($data);

        return $publicacao->fresh([
            'categoria',
            'user',
            'anexos',
        ]);
    }

    public function deletePublicacao(string $id)
    {
        $publicacao = Publicacao::query()
            ->where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        return $publicacao->delete();
    }

    private function publicQuery()
    {
        return Publicacao::query()
            ->select([
                'id',
                'titulo',
                'categoria_id',
                'imagem_caminho',
                'autor',
                'resumo',
                'conteudo',
                'status',
                'publicado_em',
                'created_at',
                'updated_at',
            ])
            ->where('status', StatusPublicacao::PUBLICADO->value)
            ->with(['categoria', 'anexos']);
    }

    private function handlePublishedAt(
        array &$data,
        ?Publicacao $publicacao = null
    ): void {
        $status = $data['status'] ?? $publicacao?->status?->value;

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
                StatusPublicacao::ARQUIVADO->value,
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
    public function uploadBanner(
        Publicacao $publicacao,
        UploadedFile $imagem
    ): Publicacao {

        if ($publicacao->imagem_caminho) {
            $oldPath = str_replace(
                asset('storage/') . '/',
                '',
                $publicacao->imagem_caminho
            );

            Storage::disk('public')->delete($oldPath);
        }

        $path = $imagem->storePublicly(
            'publicacoes/banners',
            'public'
        );

        $publicacao->update([
            'imagem_caminho' => asset("storage/{$path}")
        ]);

        return $publicacao->fresh([
            'categoria',
            'user',
            'anexos',
        ]);
    }

    public function uploadAnexo(
        Publicacao $publicacao,
        UploadedFile $arquivo
    ): Anexo {

        $path = $arquivo->storePublicly(
            "publicacoes/{$publicacao->id}/anexos",
            'public'
        );

        return $publicacao->anexos()->create([
            'descricao' => 'Anexo da publicação',
            'arquivo' => $path,
            'nome_arquivo' => $arquivo->getClientOriginalName(),
        ]);
    }

    public function deleteAnexo(
        Publicacao $publicacao,
        Anexo $anexo
    ): void {

        if ($anexo->arquivo) {
            Storage::disk('public')->delete(
                $anexo->arquivo
            );
        }

        $anexo->delete();
    }
}
