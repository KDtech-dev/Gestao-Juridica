<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ActivityLogQueryService
{
    public function list(array $filters = [], int $perPage = 25): LengthAwarePaginator
    {
        return ActivityLog::query()
            ->when($filters['date'] ?? null, fn ($query, $date) => $query->whereDate('created_at', $date))
            ->when($filters['from'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['to'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '<=', $date))
            ->when($filters['module'] ?? null, fn ($query, $module) => $query->where('module', $module))
            ->when($filters['event'] ?? null, fn ($query, $event) => $query->where('event', $event))
            ->when(($filters['actor'] ?? '') !== '', fn ($query) =>
                $query->where('actor_name', 'like', '%' . trim($filters['actor']) . '%')
            )
            ->when(($filters['search'] ?? '') !== '', fn ($query) => $query->where(function ($nested) use ($filters) {
                $search = trim($filters['search']);
                $nested->where('subject_label', 'like', "%{$search}%")
                    ->orWhere('subject_type', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%")
                    ->orWhere('module', 'like', "%{$search}%");
            }))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }
}
