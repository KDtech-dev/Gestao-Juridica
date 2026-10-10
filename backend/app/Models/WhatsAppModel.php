<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/** WhatsApp timestamps are stored and interpreted in UTC, independent of the legacy app timezone. */
abstract class WhatsAppModel extends Model
{
    protected function asDateTime($value)
    {
        return is_numeric($value)
            ? Carbon::createFromTimestampUTC($value)
            : Carbon::parse($value, 'UTC')->utc();
    }

    public function freshTimestamp()
    {
        return Carbon::now('UTC');
    }
}
