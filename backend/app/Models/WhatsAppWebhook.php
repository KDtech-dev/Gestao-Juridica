<?php

namespace App\Models;

class WhatsAppWebhook extends WhatsAppModel
{
    protected $table = 'whatsapp_webhooks';

    protected $guarded = [];

    protected $casts = ['payload' => 'encrypted:array', 'processed_at' => 'immutable_datetime'];
}
