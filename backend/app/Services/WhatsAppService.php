<?php

namespace App\Services;

use App\Exceptions\WhatsAppEnvioFalhouException;
use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    public function enviar(string $telefone, string $mensagem): void
    {
        $response = Http::withHeaders([
            'apikey' => config('services.evolution.api_key'),
        ])->post(
            config('services.evolution.url') . '/message/sendText/' . config('services.evolution.instance'),
            [
                'number' => $this->formatarNumero($telefone),
                'text' => $mensagem,
            ]
        );

        if ($response->failed()) {
            throw new WhatsAppEnvioFalhouException($response->body());
        }
    }

    private function formatarNumero(string $telefone): string
    {
        return '55' . preg_replace('/\D/', '', $telefone);
    }
}