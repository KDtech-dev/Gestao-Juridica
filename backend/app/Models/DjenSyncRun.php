<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DjenSyncRun extends Model
{
    use HasUuids;

    public const STATUS_QUEUED = 'queued';
    public const STATUS_RUNNING = 'running';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'target_type',
        'target_id',
        'initiated_by',
        'status',
        'from_date',
        'checkpoint_at',
        'pages_completed',
        'items_processed',
        'items_created',
        'items_updated',
        'last_error',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'from_date' => 'date',
            'checkpoint_at' => 'immutable_datetime',
            'started_at' => 'immutable_datetime',
            'completed_at' => 'immutable_datetime',
        ];
    }

    public function initiator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }
}
