<?php

namespace App\Services;

use App\Enums\StatusPublicacao;
use App\Models\Anexo;
use App\Models\Publicacao;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Interfaces\ImageManagerInterface;
use Intervention\Image\Encoders\JpegEncoder;

class PublicacaoService
{
    public function __construct(
        protected ImageManagerInterface $imageManager
    ) {}

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
        $imagem = $data['imagem'] ?? null;
        $anexos = $data['anexos'] ?? [];

        unset(
            $data['anexos'],
            $data['imagem'],
            $data['anexos_remover']
        );

        $data['user_id'] = Auth::id();
        $this->handlePublishedAt($data);

        $publicacao = Publicacao::create($data);

        if ($imagem instanceof UploadedFile) {
            $path = $this->processImagem($imagem, $publicacao->id);
            $publicacao->update(['imagem_caminho' => $path]);
        }

        if (!empty($anexos)) {
            $this->storeAnexos($publicacao, $anexos);
        }

        return $publicacao->fresh([
            'categoria',
            'user',
            'anexos',
        ]);
    }

    public function updatePublicacao(string $id, array $data)
    {
        $imagem = $data['imagem'] ?? null;
        $anexosNovos = $data['anexos'] ?? [];
        $anexosRemover = $data['anexos_remover'] ?? [];

        unset($data['anexos'], $data['imagem'], $data['anexos_remover'], $data['imagem_caminho']);

        $publicacao = Publicacao::query()
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        $this->handlePublishedAt($data, $publicacao);

        if ($imagem instanceof UploadedFile) {
            $this->deleteImagemAtual($publicacao);
            $data['imagem_caminho'] = $this->processImagem($imagem, $publicacao->id);
        }

        $publicacao->update($data);

        if (!empty($anexosNovos)) {
            $this->storeAnexos($publicacao, $anexosNovos);
        }

        if (!empty($anexosRemover)) {
            $this->removeAnexos($publicacao, $anexosRemover);
        }

        return $publicacao->fresh(['categoria', 'user', 'anexos']);
    }

    public function deletePublicacao(string $id)
    {
        $publicacao = Publicacao::query()
            ->where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $this->deleteImagemAtual($publicacao);

        return $publicacao->delete();
    }

    public function uploadBanner(
        Publicacao $publicacao,
        UploadedFile $imagem
    ): Publicacao {
        $this->deleteImagemAtual($publicacao);

        $path = $this->processImagem($imagem, $publicacao->id);

        $publicacao->update(['imagem_caminho' => $path]);

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
            Storage::disk('public')->delete($anexo->arquivo);
        }

        $anexo->delete();
    }

    private function publicQuery()
    {
        return Publicacao::query()
            ->select([
                'id',
                'titulo',
                'user_id',
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

    private function processImagem(UploadedFile $imagem, string $publicacaoId): string
    {
        $image = $this->imageManager
            ->decode(file_get_contents($imagem->getRealPath()))
            ->scale(width: 1600);

        $encoded = $image->encode(new JpegEncoder(quality: 82));

        $hash = sha1($encoded->toString());
        $filename = "{$hash}.jpg";
        $directory = "publicacoes/{$publicacaoId}/banner";

        Storage::disk('public')->put(
            "{$directory}/{$filename}",
            (string) $encoded
        );

        return "{$directory}/{$filename}";
    }

    private function deleteImagemAtual(Publicacao $publicacao): void
    {
        if ($publicacao->imagem_caminho) {
            Storage::disk('public')->delete($publicacao->imagem_caminho);
        }
    }
}
