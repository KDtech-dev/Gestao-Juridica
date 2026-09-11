<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatusPublicacao;
use App\Http\Controllers\Controller;
use App\Http\Resources\PublicacaoPublicaResource;
use App\Models\Anexo;
use App\Services\PublicacaoService;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function __construct(
        protected PublicacaoService $service
    ) {}

    public function index()
    {
        return response()->json([
            'success' => true,
            'data'    => PublicacaoPublicaResource::collection($this->service->getPublicacoesPublicas()),
        ]);
    }

    public function show(string $id)
    {
        return response()->json([
            'success' => true,
            'data'    => new PublicacaoPublicaResource($this->service->getPublicacaoPublicaById($id)),
        ]);
    }

    public function anexo(string $post, string $anexo)
    {
        $anexo = Anexo::where('uuid', $anexo)->firstOrFail();
        $anexo->loadMissing('publicacao');

        abort_unless(
            $anexo->arquivo
                && $anexo->publicacao
                && $anexo->publicacao->id === $post
                && $anexo->publicacao->status === StatusPublicacao::PUBLICADO
                && Storage::disk('public')->exists($anexo->arquivo),
            404
        );

        return Storage::disk('public')->response(
            $anexo->arquivo,
            $anexo->nome_arquivo,
            [
                'Content-Disposition' =>
                'inline; filename="' . addslashes($anexo->nome_arquivo) . '"'
            ]
        );
    }

    public function anexoDownload(string $post, string $anexo)
    {
        $anexo = Anexo::where('uuid', $anexo)->firstOrFail();
        $anexo->loadMissing('publicacao');

        abort_unless(
            $anexo->arquivo
                && $anexo->publicacao
                && $anexo->publicacao->id === $post
                && $anexo->publicacao->status === StatusPublicacao::PUBLICADO
                && Storage::disk('public')->exists($anexo->arquivo),
            404
        );

        return Storage::disk('public')->response(
            $anexo->arquivo,
            $anexo->nome_arquivo,
            [
                'Content-Disposition' =>
                'attachment; filename="' . addslashes($anexo->nome_arquivo) . '"'
            ]
        );
    }
}
