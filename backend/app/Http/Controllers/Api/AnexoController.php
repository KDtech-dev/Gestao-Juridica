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
        abort_unless(Storage::disk('public')->exists($anexo->arquivo), 404);

        $mime = Storage::disk('public')->mimeType($anexo->arquivo);
        $nome = $anexo->nome_arquivo ?? basename($anexo->arquivo);

        return Storage::disk('public')->response($anexo->arquivo, $nome, [
            'Content-Type' => $mime,
            'Content-Disposition' => $disposition . '; filename="' . $nome . '"',
        ]);
    }
}