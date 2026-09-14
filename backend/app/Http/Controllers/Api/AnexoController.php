<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anexo;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnexoController extends Controller
{
    public function visualizar(Anexo $anexo): StreamedResponse
    {
        return $this->responder($anexo, disposition: 'inline');
    }

    public function download(Anexo $anexo): StreamedResponse
    {
        return $this->responder($anexo, disposition: 'attachment');
    }

    private function responder(Anexo $anexo, string $disposition): StreamedResponse
    {
        abort_unless(auth()->user()?->hasRole('admin'), 403);

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
