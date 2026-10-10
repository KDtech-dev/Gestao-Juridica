<?php

namespace App\Models;

class WhatsAppDeliveryEvent extends WhatsAppModel
{
    protected $table = 'whatsapp_delivery_events';

    public $timestamps = false;

    protected $guarded = [];

    protected $casts = ['occurred_at' => 'immutable_datetime'];
}
