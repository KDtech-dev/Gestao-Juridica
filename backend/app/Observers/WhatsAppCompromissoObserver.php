<?php

namespace App\Observers;

use App\Models\Compromisso;
use App\Services\WhatsApp\Outbox;
use Illuminate\Support\Str;

class WhatsAppCompromissoObserver
{
    public function saving(Compromisso $c): void
    {
        if ($c->isDirty(['data', 'hora', 'status', 'titulo', 'descricao', 'tipo', 'user_id']) || ! $c->whatsapp_revision) {
            $c->whatsapp_revision = (string) Str::uuid();
        }
    }

    public function created(Compromisso $c): void
    {
        app(Outbox::class)->changed($c, 'created');
    }

    public function updated(Compromisso $c): void
    {
        if ($c->wasChanged('whatsapp_revision')) {
            app(Outbox::class)->changed($c, 'updated');
        }
    }

    public function deleting(Compromisso $c): void
    {
        if (! $c->isForceDeleting()) {
            $c->whatsapp_revision = (string) Str::uuid();
            $c->saveQuietly();
        }
    }

    public function deleted(Compromisso $c): void
    {
        if (! $c->isForceDeleting()) {
            app(Outbox::class)->changed($c, 'cancelled');
        }
    }

    public function restored(Compromisso $c): void
    {
        $c->whatsapp_revision = (string) Str::uuid();
        $c->save();
    }
}
