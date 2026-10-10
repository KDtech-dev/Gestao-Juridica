<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WhatsAppMessage extends WhatsAppModel
{
    protected $table = 'whatsapp_messages';

    use HasUuids;

    protected $guarded = [];

    protected $casts = ['due_at' => 'immutable_datetime', 'expires_at' => 'immutable_datetime', 'next_attempt_at' => 'immutable_datetime', 'claimed_at' => 'immutable_datetime', 'preview' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function deliveries()
    {
        return $this->hasMany(WhatsAppDeliveryEvent::class, 'message_id');
    }
}
