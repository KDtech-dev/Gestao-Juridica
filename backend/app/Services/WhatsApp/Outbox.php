<?php

namespace App\Services\WhatsApp;

use App\Jobs\SendWhatsAppMessage;
use App\Models\Compromisso;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppPreference;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Throwable;

class Outbox
{
    public static function now(): CarbonImmutable
    {
        return CarbonImmutable::now('UTC');
    }

    public function eligible(WhatsAppPreference $p): bool
    {
        $user = $p->user;

        return $user && $user->is_active && $user->isAdvogado() && $user->advogado()->exists()
            && $p->phone && $p->verified_at && $p->consented_at && ! $p->revoked_at
            && (config('whatsapp.mode') === 'simulation' || $p->verification_mode === 'real');
    }

    public function startsAt(Compromisso $c): CarbonImmutable
    {
        return CarbonImmutable::parse($c->data->format('Y-m-d').' '.($c->hora ?: '23:59:59'), config('whatsapp.timezone'))->utc();
    }

    public function preferences()
    {
        return WhatsAppPreference::with('user')->whereNotNull('verified_at')->whereNotNull('consented_at')->whereNull('revoked_at');
    }

    public function changed(Compromisso $c, string $kind): void
    {
        WhatsAppMessage::where('compromisso_id', $c->id)->where('state', 'pending')
            ->update(['state' => 'cancelled', 'error_code' => 'event_changed']);
        if (! config('whatsapp.enabled')) {
            return;
        }
        foreach ($this->preferences()->cursor() as $p) {
            if (! $this->eligible($p) || ! $p->events_enabled || ! Gate::forUser($p->user)->allows('view', $c)) {
                continue;
            }
            if ($kind === 'cancelled' || $c->status === 'CANCELADO' || $c->trashed()) {
                $kind = 'cancelled';
            }
            if ($c->status === 'CONCLUIDO') {
                continue;
            }
            $this->intent($p, $kind, self::now(), self::now()->addHours(24), $c);
            if ($kind !== 'cancelled') {
                $this->reminders($p, $c);
            }
        }
    }

    public function reminders(WhatsAppPreference $p, Compromisso $c): void
    {
        // Date-only deadlines belong in the digest; never invent a reminder time.
        if (! $c->hora || $c->status !== 'PENDENTE' || $c->trashed()) {
            return;
        }
        $start = $this->startsAt($c);
        foreach ($p->reminder_minutes ?? config('whatsapp.reminder_minutes') as $minutes) {
            $due = $start->subMinutes($minutes);
            $expiry = $due->addMinutes(30)->min($start);
            if ($expiry->lte(self::now())) {
                continue;
            }
            $this->intent($p, 'reminder', $due, $expiry, $c, ['reminder_minutes' => $minutes]);
        }
    }

    public function intent(WhatsAppPreference $p, string $kind, CarbonImmutable $due, CarbonImmutable $expiry, ?Compromisso $c = null, array $extra = []): WhatsAppMessage
    {
        $key = implode('|', [$p->user_id, $kind, $c?->id, $c?->whatsapp_revision, $extra['local_date'] ?? '', $extra['reminder_minutes'] ?? '']);
        $message = WhatsAppMessage::firstOrCreate(['dedupe_key' => hash('sha256', $key)], $extra + [
            'user_id' => $p->user_id, 'compromisso_id' => $c?->id, 'revision' => $c?->whatsapp_revision,
            'kind' => $kind, 'mode' => config('whatsapp.mode'), 'phone' => $p->phone,
            'due_at' => $due, 'expires_at' => $expiry, 'next_attempt_at' => $due,
        ]);
        if ($message->wasRecentlyCreated && $due->lte(self::now())) {
            $this->dispatch($message);
        }

        return $message;
    }

    public function dispatch(WhatsAppMessage $m): void
    {
        DB::afterCommit(function () use ($m) {
            try {
                SendWhatsAppMessage::dispatch($m->id)->onQueue(config('whatsapp.queue'));
            } catch (Throwable) { /* Durable pending intent is recovered by the minute sweep. */
            }
        });
    }

    public function sweep(): void
    {
        // A worker may have died after the provider accepted the request. Do not retry blindly.
        WhatsAppMessage::where('state', 'processing')->where('claimed_at', '<', self::now()->subMinutes(5))
            ->update(['state' => 'indeterminate', 'error_code' => 'worker_interrupted']);
        WhatsAppMessage::where('state', 'pending')->where('expires_at', '<=', self::now())
            ->update(['state' => 'expired']);
        if (! config('whatsapp.enabled')) {
            return;
        }
        foreach ($this->preferences()->cursor() as $p) {
            if (! $this->eligible($p)) {
                continue;
            }
            $local = self::now()->setTimezone($p->timezone);
            if ($p->daily_enabled) {
                $due = CarbonImmutable::parse($local->toDateString().' '.$p->daily_time, $p->timezone)->utc();
                if ($due->lte(self::now()) && self::now()->lt($due->addHours(4))) {
                    $this->intent($p, 'daily', $due, $due->addHours(4), extra: ['local_date' => $local->toDateString()]);
                }
            }
            if ($p->events_enabled) {
                foreach (Compromisso::where('status', 'PENDENTE')->whereBetween('data', [
                    self::now()->setTimezone(config('whatsapp.timezone'))->toDateString(),
                    self::now()->addDays(8)->setTimezone(config('whatsapp.timezone'))->toDateString(),
                ])->cursor() as $c) {
                    if (Gate::forUser($p->user)->allows('view', $c)) {
                        $this->reminders($p, $c);
                    }
                }
            }
        }
        WhatsAppMessage::where('state', 'pending')->where('next_attempt_at', '<=', self::now())
            ->where('due_at', '<=', self::now())->each(fn ($m) => $this->dispatch($m));
    }

    /** Recomputed immediately before sending; no titles, client names or case details leave the app. */
    public function content(WhatsAppMessage $m, WhatsAppPreference $p): ?array
    {
        $link = rtrim(config('app.frontend_url'), '/').'/agenda';
        if ($m->kind === 'daily') {
            if (! $p->daily_enabled || self::now()->setTimezone($p->timezone)->toDateString() !== $m->local_date) {
                return null;
            }
            $items = Compromisso::where('status', 'PENDENTE')->whereBetween('data', [
                CarbonImmutable::parse($m->local_date, $p->timezone)->subDay()->toDateString(),
                CarbonImmutable::parse($m->local_date, $p->timezone)->addDay()->toDateString(),
            ])->get()->filter(fn ($c) => Gate::forUser($p->user)->allows('view', $c)
                && ($c->hora ? $this->startsAt($c)->setTimezone($p->timezone)->toDateString() : $c->data->format('Y-m-d')) === $m->local_date);
            if ($items->isEmpty() && ! config('whatsapp.send_empty_digest')) {
                return null;
            }

            return [$m->local_date, (string) $items->count(), (string) $items->where('tipo', 'PRAZO')->count(), $link];
        }
        if (! $p->events_enabled) {
            return null;
        }
        $c = Compromisso::withTrashed()->find($m->compromisso_id);
        if (! $c || ! Gate::forUser($p->user)->allows('view', $c) || $c->whatsapp_revision !== $m->revision) {
            return null;
        }
        if ($m->kind === 'cancelled') {
            if (! $c->trashed() && $c->status !== 'CANCELADO') {
                return null;
            }
        } elseif ($c->trashed() || $c->status !== 'PENDENTE' || $this->startsAt($c)->lte(self::now())) {
            return null;
        }
        if ($m->kind === 'reminder' && ! in_array($m->reminder_minutes, $p->reminder_minutes ?? config('whatsapp.reminder_minutes'))) {
            return null;
        }
        $when = $c->hora ? $this->startsAt($c)->setTimezone($p->timezone)->format('d/m/Y H:i') : $c->data->format('d/m/Y');
        if ($m->kind === 'reminder') {
            return [$when, $link];
        }
        $labels = ['pt' => ['created' => 'criado', 'updated' => 'alterado', 'cancelled' => 'cancelado'], 'en' => ['created' => 'created', 'updated' => 'changed', 'cancelled' => 'cancelled'], 'es' => ['created' => 'creado', 'updated' => 'modificado', 'cancelled' => 'cancelado']];

        return [$labels[$p->locale][$m->kind], $when, $link];
    }
}
