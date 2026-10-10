<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditoriaArquivo;
use App\Models\AuditoriaLog;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AuditoriaController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'usuario' => 'nullable|string|max:255',
            'acao' => 'nullable|string|max:40',
            'modulo' => 'nullable|string|max:60',
            'resultado' => 'nullable|in:sucesso,falha',
            'inicio' => 'nullable|date',
            'fim' => 'nullable|date|after_or_equal:inicio',
            'page' => 'nullable|integer|min:1',
        ]);

        return AuditoriaLog::query()
            ->where('acao', '!=', 'consultar')
            ->when($data['usuario'] ?? null, fn ($q, $name) => $q->where('usuario_nome', 'like', '%'.$name.'%'))
            ->when($data['acao'] ?? null, fn ($q, $action) => $q->where('acao', $action))
            ->when($data['modulo'] ?? null, fn ($q, $module) => $q->where('modulo', $module))
            ->when($data['resultado'] ?? null, fn ($q, $result) => $q->where('status_http', $result === 'sucesso' ? '<' : '>=', 400))
            ->when($data['inicio'] ?? null, fn ($q, $start) => $q->where('ocorrido_em', '>=', CarbonImmutable::parse($start)->utc()))
            ->when($data['fim'] ?? null, fn ($q, $end) => $q->where('ocorrido_em', '<', CarbonImmutable::parse($end)->utc()))
            ->orderByDesc('id')->paginate(25);
    }

    public function arquivos()
    {
        $files = AuditoriaArquivo::orderByDesc('inicio_em')->paginate(15);
        $cycle = DB::table('auditoria_ciclos')->where('id', 1)->value('inicio_em');

        return response()->json([
            'arquivos' => $files,
            'proximo_arquivamento' => $cycle ? CarbonImmutable::parse($cycle)->addDays(30)->toIso8601String() : null,
        ]);
    }

    public function download(AuditoriaArquivo $arquivo)
    {
        abort_unless(Storage::disk('auditoria')->exists($arquivo->caminho), 404, 'Arquivo de auditoria indisponível.');

        return Storage::disk('auditoria')->download($arquivo->caminho,
            'auditoria-'.$arquivo->inicio_em->format('Y-m-d').'-'.$arquivo->fim_em->format('Y-m-d').'.jsonl', [
                'Content-Type' => 'application/x-ndjson',
                'Cache-Control' => 'private, no-store',
                'X-Content-Type-Options' => 'nosniff',
            ]);
    }
}
