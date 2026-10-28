<?php

namespace App\Observers;

use App\Services\ActivityLogger;
use Illuminate\Database\Eloquent\Model;

class AuditableObserver
{
    public function __construct(private readonly ActivityLogger $logger) {}

    public function created(Model $model): void
    {
        $this->logger->modelEvent($model, 'created');
    }

    public function updated(Model $model): void
    {
        $this->logger->modelEvent($model, 'updated');
    }

    public function deleted(Model $model): void
    {
        $this->logger->modelEvent($model, 'deleted');
    }
}
