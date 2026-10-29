<?php

namespace App\Services;

use App\Jobs\SyncDjenRunJob;
use App\Models\Advogado;
use App\Models\Caso;
use App\Models\DjenSyncRun;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class DjenSyncCoordinator
{
    public function enqueue(Model $target, ?User $actor = null): array
    {
        [$type, $fromDate] = match (true) {
            $target instanceof Caso => ['caso', $this->checkpointDate('caso', (string) $target->getKey())],
            $target instanceof Advogado => ['advogado', $this->checkpointDate('advogado', (string) $target->getKey())],
            default => throw new \InvalidArgumentException('Tipo de destino DJEN inválido.'),
        };

        $active = DjenSyncRun::query()
            ->where('target_type', $type)
            ->where('target_id', (string) $target->getKey())
            ->whereIn('status', [DjenSyncRun::STATUS_QUEUED, DjenSyncRun::STATUS_RUNNING])
            ->latest('created_at')
            ->first();

        if ($active) {
            return [$active, false];
        }

        if ($target instanceof Caso && ! $target->numero_processo_limpo) {
            throw new \App\Exceptions\CasoSemNumeroProcessoException;
        }

        if ($target instanceof Advogado && (! preg_replace('/\D/', '', (string) $target->oab_numero) || ! $target->oab_uf)) {
            throw new \App\Exceptions\AdvogadoSemOabException;
        }

        $run = DjenSyncRun::query()->create([
            'target_type' => $type,
            'target_id' => (string) $target->getKey(),
            'initiated_by' => $actor?->id,
            'status' => DjenSyncRun::STATUS_QUEUED,
            'from_date' => $fromDate,
        ]);

        SyncDjenRunJob::dispatch($run->id)->afterCommit()->onQueue('djen');

        return [$run->fresh(), true];
    }

    private function checkpointDate(string $type, string $targetId): string
    {
        $checkpoint = DjenSyncRun::query()
            ->where('target_type', $type)
            ->where('target_id', $targetId)
            ->where('status', DjenSyncRun::STATUS_COMPLETED)
            ->whereNotNull('checkpoint_at')
            ->latest('checkpoint_at')
            ->value('checkpoint_at');

        return $checkpoint
            ? Carbon::parse($checkpoint)->subDays(3)->toDateString()
            : now()->subDays(3)->toDateString();
    }
}
