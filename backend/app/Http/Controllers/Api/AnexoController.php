<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Models\Anexo;
use App\Models\Caso;
use App\Models\Cliente;
use App\Models\Publicacao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnexoController extends Controller
{
    public function visualizar(Request $request, Anexo $anexo): StreamedResponse
    {
        $this->authorizeRead($request, $anexo);

        return $this->responder($anexo, disposition: 'inline');
    }

    public function download(Request $request, Anexo $anexo): StreamedResponse
    {
        $this->authorizeRead($request, $anexo);

        return $this->responder($anexo, disposition: 'attachment');
    }

    private function authorizeRead(Request $request, Anexo $anexo): void
    {
        $permission = match ($anexo->anexavel_type) {
            Caso::class => PermissionEnum::CasosVisualizar,
            Cliente::class => PermissionEnum::ClientesVisualizar,
            Publicacao::class => PermissionEnum::PublicacoesVisualizar,
            default => null,
        };

        abort_unless(
            $permission && $request->user()?->can($permission->value),
            403
        );
    }

    private function responder(Anexo $anexo, string $disposition): StreamedResponse
    {
        $disk = str_starts_with((string) $anexo->arquivo, 'casos/')
            ? 'local'
            : 'public';

        abort_unless(Storage::disk($disk)->exists($anexo->arquivo), 404);

        $mime = Storage::disk($disk)->mimeType($anexo->arquivo);
        $nome = $anexo->nome_arquivo ?? basename($anexo->arquivo);

        return Storage::disk($disk)->response($anexo->arquivo, $nome, [
            'Content-Type' => $mime,
            'Content-Disposition' => $disposition . '; filename="' . addslashes($nome) . '"',
        ]);
    }
}
