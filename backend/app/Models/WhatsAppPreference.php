<?php

namespace App\Models;

class WhatsAppPreference extends WhatsAppModel
{
    protected $table = 'whatsapp_preferences';

    protected $guarded = [];

    protected $hidden = ['verification_hash'];

    protected $casts = ['verified_at' => 'immutable_datetime', 'verification_expires_at' => 'immutable_datetime', 'consented_at' => 'immutable_datetime', 'revoked_at' => 'immutable_datetime', 'daily_enabled' => 'boolean', 'events_enabled' => 'boolean', 'reminder_minutes' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
