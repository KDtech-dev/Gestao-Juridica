<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Throwable;

class WhatsAppController extends Controller
{
    public function status(): JsonResponse
    {
        return $this->consultarServico('/status');
    }

    public function qr(): JsonResponse
    {
        return $this->consultarServico('/qr');
    }

    public function enviarTeste(Request $request, WhatsAppService $whatsApp): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:30', 'regex:/^[+0-9().\s-]+$/'],
            'message' => ['required', 'string', 'max:4096'],
        ]);
        $digitos = preg_replace('/\D/', '', $validated['phone']);

        if (strlen($digitos) < 10 || strlen($digitos) > 15) {
            return response()->json([
                'success' => false,
                'message' => 'Informe um número com código do país e DDD.',
            ], 422);
        }

        $url = rtrim((string) config('services.baileys.url'), '/');
        $token = (string) config('services.baileys.token');

        if ($url === '' || $token === '') {
            return response()->json([
                'success' => false,
                'message' => 'Serviço Baileys não configurado.',
            ], 503);
        }

        try {
            $status = Http::acceptJson()
                ->withToken($token)
                ->connectTimeout(3)
                ->timeout(5)
                ->get($url . '/status');

            if (!$status->successful() || $status->json('status') !== 'connected') {
                return response()->json([
                    'success' => false,
                    'message' => 'Conecte um número de WhatsApp antes de enviar a mensagem de teste.',
                ], 409);
            }

            $whatsApp->enviar($validated['phone'], $validated['message']);
        } catch (Throwable) {
            return response()->json([
                'success' => false,
                'message' => 'Não foi possível enviar a mensagem de teste pelo WhatsApp.',
            ], 503);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mensagem de teste enviada para o número informado.',
        ]);
    }

    private function consultarServico(string $path): JsonResponse
    {
        $url = rtrim((string) config('services.baileys.url'), '/');
        $token = (string) config('services.baileys.token');

        if ($url === '' || $token === '') {
            return response()->json([
                'success' => false,
                'message' => 'Serviço Baileys não configurado.',
            ], 503);
        }

        try {
            $response = Http::acceptJson()
                ->withToken($token)
                ->connectTimeout(3)
                ->timeout(5)
                ->get($url . $path);
        } catch (\Throwable) {
            return response()->json([
                'success' => false,
                'message' => 'Não foi possível acessar o serviço Baileys.',
            ], 503);
        }

        return response()->json($response->json() ?? [
            'success' => false,
            'message' => 'Resposta inválida do serviço Baileys.',
        ], $response->status())->header('Cache-Control', 'no-store');
    }
}
