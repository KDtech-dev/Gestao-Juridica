<?php

namespace App\Jobs;

use App\Models\Advogado;
use App\Models\Caso;
use App\Models\DjenSyncRun;
use App\Exceptions\DjenPageLimitReachedException;
use App\Services\DjenService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Throwable;

class SyncDjenRunJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 1800;

    public function __construct(public readonly string $runId) {}

    public function backoff(): array
    {
        return [30, 120, 300];
    }

    public function handle(DjenService $service): void
    {
        $run = DjenSyncRun::query()->findOrFail($this->runId);
        if ($run->status === DjenSyncRun::STATUS_COMPLETED) {
            return;
        }

        $run->forceFill([
            'status' => DjenSyncRun::STATUS_RUNNING,
            'started_at' => $run->started_at ?? now(),
            'completed_at' => null,
            'last_error' => null,
            'pages_completed' => 0,
            'items_processed' => 0,
            'items_created' => 0,
            'items_updated' => 0,
        ])->save();

        $progress = static function (array $stats) use ($run): void {
            $run->forceFill($stats)->save();
        };
        $from = Carbon::parse($run->from_date)->startOfDay();

        try {
            if ($run->target_type === 'caso') {
                $caso = Caso::query()->findOrFail($run->target_id);
                $service->sincronizarCaso($caso, $from, $progress);
            } elseif ($run->target_type === 'advogado') {
                $advogado = Advogado::query()->findOrFail($run->target_id);
                $service->sincronizarAdvogado($advogado, $from, $progress);
            } else {
                throw new \InvalidArgumentException('Tipo de sincronização DJEN inválido.');
            }
        } catch (DjenPageLimitReachedException $exception) {
            $run->forceFill([
                'status' => DjenSyncRun::STATUS_FAILED,
                'completed_at' => now(),
                'last_error' => $exception->getMessage(),
            ])->save();

            return;
        }

        $run->forceFill([
            'status' => DjenSyncRun::STATUS_COMPLETED,
            'checkpoint_at' => now(),
            'completed_at' => now(),
            'last_error' => null,
        ])->save();
    }

    public function failed(Throwable $exception): void
    {
        DjenSyncRun::query()->whereKey($this->runId)->update([
            'status' => DjenSyncRun::STATUS_FAILED,
            'completed_at' => now(),
            'last_error' => Str::limit($exception->getMessage(), 2000, ''),
            'updated_at' => now(),
        ]);
    }
}
