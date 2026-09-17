<?php

namespace App\Services;

use App\Models\AuditoriaArquivo;
use App\Models\AuditoriaLog;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class ArquivarAuditoriaService
{
    public function executar(): int
    {
        $count = 0;
        while ($this->arquivarProximoPeriodo()) {
            $count++;
        }

        return $count;
    }

    private function arquivarProximoPeriodo(): bool
    {
        $path = null;
        try {
            return DB::transaction(function () use (&$path) {
                $cycle = DB::table('auditoria_ciclos')->where('id', 1)->lockForUpdate()->first();
                if (! $cycle) {
                    throw new RuntimeException('Ciclo de auditoria não inicializado. Aplique a migration.');
                }
                $start = CarbonImmutable::parse($cycle->inicio_em);
                $end = $start->addDays(30);
                if ($end->isFuture()) {
                    return false;
                }
                $id = (string) Str::uuid();
                $path = $id.'.jsonl';
                $stream = tmpfile();
                if ($stream === false) {
                    throw new RuntimeException('Não foi possível criar o arquivo temporário de auditoria.');
                }
                $hash = hash_init('sha256');
                $quantity = 0;
                try {
                    $metadata = json_encode([
                        'formato' => 'auditoria-v1', 'inicio_inclusivo' => $start->toIso8601String(),
                        'fim_exclusivo' => $end->toIso8601String(),
                    ], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE)."\n";
                    $this->write($stream, $hash, $metadata);
                    foreach (AuditoriaLog::where('ocorrido_em', '>=', $start)->where('ocorrido_em', '<', $end)->lazyById(500) as $log) {
                        $this->write($stream, $hash, $log->toJson(JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE)."\n");
                        $quantity++;
                    }
                    rewind($stream);
                    if (! Storage::disk('auditoria')->put($path, $stream)) {
                        throw new RuntimeException('Não foi possível gravar o arquivo privado de auditoria.');
                    }
                } finally {
                    fclose($stream);
                }
                AuditoriaArquivo::create([
                    'id' => $id, 'inicio_em' => $start, 'fim_em' => $end, 'caminho' => $path,
                    'quantidade' => $quantity, 'sha256' => hash_final($hash), 'criado_em' => now(),
                ]);
                DB::table('auditoria_ciclos')->where('id', 1)->update(['inicio_em' => $end]);

                return true;
            });
        } catch (\Throwable $e) {
            if ($path) {
                Storage::disk('auditoria')->delete($path);
            }
            throw $e;
        }
    }

    private function write($stream, $hash, string $line): void
    {
        if (fwrite($stream, $line) !== strlen($line)) {
            throw new RuntimeException('Falha ao escrever o arquivo de auditoria.');
        }
        hash_update($hash, $line);
    }
}
