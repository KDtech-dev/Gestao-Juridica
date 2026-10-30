<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use App\Services\WhatsAppService;
use App\Services\ConfiguracaoSistemaService;
use App\Services\NotificacaoService;
use App\Models\Notificacao;
use Illuminate\Http\Request;
use Throwable;

class WhatsAppController extends Controller
{
    public function messageStatuses(NotificacaoService $notificacoes): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $notificacoes->listarEnviosWhatsApp(),
        ]);
    }

    public function retryMessage(Notificacao $notificacao, NotificacaoService $notificacoes): JsonResponse
    {
        if (!$notificacoes->reenviarWhatsApp($notificacao)) {
            return response()->json([
                'success' => false,
                'message' => 'Esta mensagem não pode ser reenviada. Verifique se está com falha e se o destinatário tem celular cadastrado.',
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mensagem colocada novamente na fila.',
        ], 202);
    }

    public function deliveryUpdate(Request $request): JsonResponse
    {
        $expectedToken = (string) config('services.baileys.token');
        $providedToken = (string) $request->bearerToken();

        abort_unless(
            $expectedToken !== ''
                && $providedToken !== ''
                && hash_equals($expectedToken, $providedToken),
            401,
            'Não autorizado.'
        );

        $validated = $request->validate([
            'message_id' => ['required', 'string', 'max:150'],
            'status' => ['required', 'integer', 'in:1,2,3'],
        ]);

        $notificacao = Notificacao::query()
            ->where('whatsapp_message_id', $validated['message_id'])
            ->first();

        abort_unless($notificacao, 404, 'Mensagem ainda não registrada.');

        $status = (int) $validated['status'];
        $ordem = ['pending' => 0, 'queued' => 0, 'sent' => 1, 'delivered' => 2, 'read' => 3];
        $statusAtual = $notificacao->whatsapp_status ?? 'pending';
        $atualizacoes = [];

        if (($ordem[$statusAtual] ?? 0) <= $status) {
            $atualizacoes['whatsapp_status'] = match ($status) {
                3 => 'read',
                2 => 'delivered',
                default => 'sent',
            };
        }

        if ($status >= 2 && !$notificacao->whatsapp_entregue_em) {
            $atualizacoes['whatsapp_entregue_em'] = now();
        }
        if ($status >= 3 && !$notificacao->whatsapp_lido_em) {
            $atualizacoes['whatsapp_lido_em'] = now();
        }

        $notificacao->update($atualizacoes);

        return response()->json(['success' => true]);
    }

    public function settings(ConfiguracaoSistemaService $configuracoes): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'lembretes_ativos' => $configuracoes->lembretesWhatsappAtivos(),
                'horario_lembrete' => $configuracoes->horarioLembreteWhatsapp(),
                'mensagem' => $configuracoes->opcoesMensagemWhatsapp(),
            ],
        ]);
    }

    public function updateSettings(Request $request, ConfiguracaoSistemaService $configuracoes): JsonResponse
    {
        $validated = $request->validate([
            'horario_lembrete' => ['required', 'date_format:H:i'],
            'lembretes_ativos' => ['required', 'boolean'],
            'mensagem' => ['required', 'array'],
            'mensagem.incluir_nome' => ['required', 'boolean'],
            'mensagem.incluir_tipo' => ['required', 'boolean'],
            'mensagem.incluir_data' => ['required', 'boolean'],
            'mensagem.incluir_hora' => ['required', 'boolean'],
        ]);

        $opcoesMensagem = $configuracoes->atualizarOpcoesMensagemWhatsapp($validated['mensagem']);
        $lembretesAtivos = $configuracoes->atualizarLembretesWhatsappAtivos($validated['lembretes_ativos']);

        return response()->json([
            'success' => true,
            'message' => 'Configurações do WhatsApp atualizadas.',
            'data' => [
                'lembretes_ativos' => $lembretesAtivos,
                'horario_lembrete' => $configuracoes->atualizarHorarioLembreteWhatsapp(
                    $validated['horario_lembrete']
                ),
                'mensagem' => $opcoesMensagem,
            ],
        ]);
    }

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

        $data = $response->json() ?? [
            'success' => false,
            'message' => 'Resposta inválida do serviço Baileys.',
        ];

        if (is_array($data)) {
            unset($data['last_error']);
        }

        return response()->json($data, $response->status())->header('Cache-Control', 'no-store');
    }
}
