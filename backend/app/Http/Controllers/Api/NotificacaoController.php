<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificacaoResource;
use App\Models\Notificacao;
use App\Services\NotificacaoService;
use Illuminate\Http\JsonResponse; 
use Illuminate\Http\Request;

class NotificacaoController extends Controller
{
    public function __construct(
        protected NotificacaoService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $usuario = $request->user();

        $this->service->sincronizarLembretesCompromissos($usuario);

        $notificacoes = Notificacao::query()
            ->where('usuario_id', $usuario->id)
            ->where('tipo', '!=', 'COMPROMISSO_CRIADO')
            ->latest()
            ->limit(30)
            ->get();

        return response()->json([
            'success' => true,
            'data' => NotificacaoResource::collection($notificacoes),
        ]);
    }

    public function marcarComoLida(Request $request, Notificacao $notificacao): JsonResponse
    {
        abort_unless($notificacao->usuario_id === $request->user()->id, 403);

        $notificacao->update([
            'lida_em' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => new NotificacaoResource($notificacao),
        ]);
    }

    public function marcarTodasComoLidas(Request $request): JsonResponse
    {
        Notificacao::query()
            ->where('usuario_id', $request->user()->id)
            ->whereNull('lida_em')
            ->update(['lida_em' => now()]);

        return response()->json([
            'success' => true,
        ]);
    }

    public function limpar(Request $request): JsonResponse
    {
        $ids = $request->input('ids');

        $query = Notificacao::query()
            ->where('usuario_id', $request->user()->id);

        if (is_array($ids) && count($ids) > 0) {
            $query->whereIn('id', $ids);
        }

        $query->each(fn (Notificacao $item) => app(\App\Services\LixeiraService::class)->excluir($item));

        return response()->json([
            'success' => true,
        ]);
    }
}
