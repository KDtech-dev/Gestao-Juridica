<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exclusao;
use App\Services\LixeiraService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LixeiraController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['status' => 'nullable|in:disponiveis,historico']);

        return Exclusao::query()
            ->when($request->input('status', 'disponiveis') === 'disponiveis', fn ($q) => $q
                ->whereNull('restaurado_em')->whereNull('eliminado_em')->where('expira_em', '>', now()))
            ->latest()->paginate(20);
    }

    public function restaurar(Exclusao $exclusao, LixeiraService $service)
    {
        $service->restaurar($exclusao);

        return response()->json(['message' => 'Item restaurado com sucesso.']);
    }

    public function arquivo(Exclusao $exclusao, LixeiraService $service)
    {
        $service->assertAvailable($exclusao);
        abort_unless($exclusao->tipo === 'arquivo', 404);
        $file = $exclusao->conteudo['files'][0];

        return Storage::disk('lixeira')->download($file['backup'], basename($file['path']), [
            'Cache-Control' => 'private, no-store',
            'Content-Type' => 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
