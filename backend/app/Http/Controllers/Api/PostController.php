<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatusPublicacao;
use App\Http\Controllers\Controller;
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
        return response()->json(
            $this->service->getPublicacoesPublicas()
        );
    }

    public function show(string $id)
    {
        return response()->json(
            $this->service->getPublicacaoPublicaById($id)
        );
    }

    public function anexo(Anexo $anexo)
    {
        $anexo->loadMissing('publicacao');

        abort_unless(
            $anexo->arquivo
            && $anexo->publicacao
            && $anexo->publicacao->status === StatusPublicacao::PUBLICADO
            && Storage::disk('public')->exists($anexo->arquivo),
            404
        );

        return Storage::disk('public')->response(
            $anexo->arquivo,
            $anexo->nome_arquivo,
            [
                'Content-Disposition' => 'inline; filename="' . addslashes($anexo->nome_arquivo) . '"',
            ]
        );
    }
}
