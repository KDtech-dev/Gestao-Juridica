<?php

namespace App\Services\WhatsApp;

use App\Jobs\ProcessWhatsAppWebhook;
use App\Models\WhatsAppDeliveryEvent;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppPreference;
use App\Models\WhatsAppWebhook;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Throwable;

class Webhooks
{
    public function dispatch(WhatsAppWebhook $event): void
    {
        // Never execute HTTP webhook processing inline, even when QUEUE_CONNECTION=sync.
        if (in_array(config('queue.default'), ['sync', 'null', 'deferred', 'background'])) {
            return;
        }
        DB::afterCommit(function () use ($event) {
            try {
                ProcessWhatsAppWebhook::dispatch($event->id)->onQueue(config('whatsapp.queue'));
            } catch (Throwable) { /* The scheduler recovers durable inbox entries. */
            }
        });
    }

    public function process(int $id): void
    {
        DB::transaction(function () use ($id) {
            $event = WhatsAppWebhook::lockForUpdate()->findOrFail($id);
            if ($event->processed_at) {
                return;
            }
            $p = $event->payload;
            $unmatched = false;
            foreach ($p['entry'] ?? [] as $entry) {
                if ((string) ($entry['id'] ?? '') !== (string) config('whatsapp.waba_id')) {
                    continue;
                }
                foreach ($entry['changes'] ?? [] as $change) {
                    $v = $change['value'] ?? [];
                    if (($change['field'] ?? '') !== 'messages' || (string) ($v['metadata']['phone_number_id'] ?? '') !== (string) config('whatsapp.phone_number_id')) {
                        continue;
                    }
                    foreach ($v['statuses'] ?? [] as $status) {
                        if (! $this->status($status, (string) $entry['id'], (string) $v['metadata']['phone_number_id'])) {
                            $unmatched = true;
                        }
                    }
                    foreach ($v['messages'] ?? [] as $message) {
                        $this->incoming($message);
                    }
                }
            }
            // A status without opaque callback data can precede the POST response that saves meta_id.
            if (! $unmatched || $event->created_at->lt(Outbox::now()->subDay())) {
                $event->update(['processed_at' => Outbox::now()]);
            }
        });
    }

    private function status(array $s, string $waba, string $phoneId): bool
    {
        if (! is_string($s['id'] ?? null) || ! is_numeric($s['timestamp'] ?? null)) {
            return true;
        }
        $state = $s['status'] ?? '';
        if (! in_array($state, ['sent', 'delivered', 'read', 'failed'])) {
            return true;
        }
        $query = WhatsAppMessage::where('waba_id', $waba)->where('phone_number_id', $phoneId)->where('mode', '!=', 'simulation');
        $m = (clone $query)->where('meta_id', $s['id'])->lockForUpdate()->first();
        if (! $m && is_string($s['biz_opaque_callback_data'] ?? null)) {
            $m = (clone $query)->whereKey($s['biz_opaque_callback_data'])->whereNull('meta_id')
                ->whereIn('state', ['processing', 'indeterminate'])->lockForUpdate()->first();
        }
        if (! $m) {
            return false;
        }
        if (ltrim($m->phone, '+') !== (string) ($s['recipient_id'] ?? '')) {
            return true;
        }
        $key = hash('sha256', $waba.'|'.$phoneId.'|'.$s['id'].'|'.$state.'|'.$s['timestamp']);
        $code = $s['errors'][0]['code'] ?? null;
        WhatsAppDeliveryEvent::firstOrCreate(['event_key' => $key], ['message_id' => $m->id, 'state' => $state,
            'occurred_at' => CarbonImmutable::createFromTimestampUTC((int) $s['timestamp']), 'error_code' => is_numeric($code) ? 'meta_'.(int) $code : null]);
        $ranks = ['pending' => 0, 'processing' => 0, 'indeterminate' => 0, 'accepted' => 1, 'failed' => 1, 'sent' => 2, 'delivered' => 3, 'read' => 4];
        if ($state === 'failed' ? ($ranks[$m->state] ?? 9) <= 1 : ($ranks[$state] > ($ranks[$m->state] ?? 9))) {
            $m->state = $state;
            $m->error_code = $state === 'failed' && is_numeric($code) ? 'meta_'.(int) $code : null;
        }
        $m->meta_id = $s['id'];
        $m->save();

        return true;
    }

    private function incoming(array $message): void
    {
        if (! is_numeric($message['timestamp'] ?? null) || ! preg_match('/^[1-9][0-9]{7,14}$/D', $message['from'] ?? '')) {
            return;
        }
        $phone = '+'.$message['from'];
        $p = WhatsAppPreference::where('phone', $phone)->lockForUpdate()->first();
        if (! $p) {
            return;
        }
        $at = CarbonImmutable::createFromTimestampUTC((int) $message['timestamp']);
        $body = mb_strtoupper(trim($message['text']['body'] ?? $message['button']['text'] ?? $message['interactive']['button_reply']['title'] ?? ''));
        if (preg_match('/^VERIFICAR ([A-F0-9]{12})$/D', $body, $match) && $p->verification_hash
            && $p->verification_expires_at?->gt(Outbox::now()) && $at->gte($p->verification_expires_at->subMinutes(15))
            && hash_equals($p->verification_hash, hash('sha256', $match[1]))) {
            // Use the signed message timestamp so a queued opt-out sent after verification is not discarded.
            $p->update(['verified_at' => $at, 'verification_mode' => 'real', 'verification_hash' => null, 'verification_expires_at' => null]);
        }
        if (in_array($body, ['SAIR', 'PARAR', 'STOP', 'SALIR']) && $p->verified_at && $p->verification_mode === 'real'
            && $at->gte($p->verified_at) && (! $p->consented_at || $at->gte($p->consented_at))) {
            $p->update(['revoked_at' => $at, 'consented_at' => null, 'daily_enabled' => false, 'events_enabled' => false]);
            WhatsAppMessage::where('user_id', $p->user_id)->where('kind', '!=', 'diagnostic')->where('state', 'pending')
                ->update(['state' => 'cancelled', 'error_code' => 'opt_out']);
        }
    }
}
