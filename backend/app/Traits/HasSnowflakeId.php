<?php

namespace App\Traits;

use Kra8\Snowflake\Snowflake;

trait HasSnowflakeId 
{
    protected static function bootHasSnowflakeId()
    {
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = app(Snowflake::class)->next();
            }
        });
    }
}