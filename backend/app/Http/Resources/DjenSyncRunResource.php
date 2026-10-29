<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DjenSyncRunResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'target_type' => $this->target_type,
            'target_id' => $this->target_id,
            'status' => $this->status,
            'from_date' => $this->from_date?->toDateString(),
            'checkpoint_at' => $this->checkpoint_at?->toISOString(),
            'pages_completed' => $this->pages_completed,
            'items_processed' => $this->items_processed,
            'items_created' => $this->items_created,
            'items_updated' => $this->items_updated,
            'last_error' => $this->last_error,
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
        ];
    }
}
