<?php

namespace App\Services;

use App\Exceptions\WhatsAppEnvioFalhouException;
use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    public function enviar(string $telefone, string $mensagem): ?string
    {
        $url = rtrim((string) config('services.baileys.url'), '/');
        $token = (string) config('services.baileys.token');

        if ($url === '' || $token === '') {
            throw new WhatsAppEnvioFalhouException('Serviço Baileys não configurado.', false);
        }

        $response = Http::acceptJson()
            ->withToken($token)
            ->connectTimeout(5)
            ->timeout(20)
            ->post($url . '/messages', [
                'phone' => $this->formatarNumero($telefone),
                'message' => $mensagem,
            ]);

        if ($response->failed()) {
            $status = $response->status();
            $temporario = $status === 408 || $status === 425 || $status === 429 || $status >= 500;

            throw new WhatsAppEnvioFalhouException(
                "Serviço Baileys retornou HTTP {$status}.",
                $temporario,
                $status,
            );
        }

        return $response->json('message_id');
    }

    private function formatarNumero(string $telefone): string
    {
        $numero = preg_replace('/\D/', '', $telefone);

        $informouCodigoPais = str_starts_with(trim($telefone), '+') || str_starts_with($numero, '55');

        return $informouCodigoPais || strlen($numero) > 11 ? $numero : '55' . $numero;
    }
}
