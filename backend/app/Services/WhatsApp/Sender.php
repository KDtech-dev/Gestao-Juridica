<?php

namespace App\Services\WhatsApp;

use App\Models\WhatsAppDeliveryEvent;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppPreference;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Throwable;

class Sender
{
    public function ready(): bool
    {
        return config('whatsapp.access_token') && config('whatsapp.phone_number_id') && config('whatsapp.waba_id')
            && preg_match('/^v[0-9]+\.0$/D', config('whatsapp.graph_version') ?? '');
    }

    public function send(string $id): void
    {
        $outbox = app(Outbox::class);
        $payload = null;
        $m = DB::transaction(function () use ($id, $outbox, &$payload) {
            $m = WhatsAppMessage::lockForUpdate()->find($id);
            if (! $m || $m->state !== 'pending' || $m->next_attempt_at->gt(Outbox::now()) || $m->due_at->gt(Outbox::now())) {
                return null;
            }
            if ($m->expires_at->lte(Outbox::now())) {
                $m->update(['state' => 'expired']);

                return null;
            }
            if (! config('whatsapp.enabled')) {
                return null;
            }
            $mode = config('whatsapp.mode');
            if (! in_array($mode, ['simulation', 'test', 'production']) || $m->mode !== $mode) {
                $m->update(['state' => 'cancelled', 'error_code' => 'mode_changed']);

                return null;
            }
            if (($mode === 'test' || $m->kind === 'diagnostic') && ! Phone::allowed($m->phone)) {
                $m->update(['state' => 'cancelled', 'error_code' => 'test_recipient_blocked']);

                return null;
            }
            $p = WhatsAppPreference::where('user_id', $m->user_id)->lockForUpdate()->first();
            if ($m->kind === 'diagnostic') {
                if ($mode === 'production' || ! $m->user?->is_active || ! $m->user?->isAdmin()) {
                    $m->update(['state' => 'cancelled', 'error_code' => 'diagnostic_blocked']);

                    return null;
                }
                $template = ['name' => config('whatsapp.diagnostic_template'), 'language' => ['code' => 'en_US']];
                $content = [];
            } else {
                if (! $p || ! $outbox->eligible($p) || $p->phone !== $m->phone || ($content = $outbox->content($m, $p)) === null) {
                    $m->update(['state' => 'cancelled', 'error_code' => 'ineligible_or_empty']);

                    return null;
                }
                $category = in_array($m->kind, ['daily', 'reminder']) ? $m->kind : 'change';
                $template = ['name' => config("whatsapp.templates.$category.$p->locale"),
                    'language' => ['code' => config("whatsapp.languages.$p->locale")],
                    'components' => [['type' => 'body', 'parameters' => array_map(fn ($s) => ['type' => 'text', 'text' => $s], $content)]]];
            }
            $m->preview = ['parameters' => $content, 'template' => $template['name'], 'language' => $template['language']['code']];
            if ($mode === 'simulation') {
                $m->state = 'simulated';
                $m->attempts++;
                $m->save();

                return null;
            }
            if (! $this->ready() || ! $template['name']) {
                $m->state = 'failed';
                $m->error_code = 'configuration_or_template_missing';
                $m->save();

                return null;
            }
            $m->fill(['state' => 'processing', 'claimed_at' => Outbox::now(), 'attempts' => $m->attempts + 1,
                'phone_number_id' => config('whatsapp.phone_number_id'), 'waba_id' => config('whatsapp.waba_id')])->save();
            $payload = ['messaging_product' => 'whatsapp', 'recipient_type' => 'individual', 'to' => ltrim($m->phone, '+'),
                'type' => 'template', 'template' => $template, 'biz_opaque_callback_data' => $m->id];

            return $m;
        });
        if (! $m || ! $payload) {
            return;
        }

        // No automatic HTTP retry: a transport failure can hide an accepted message.
        try {
            $response = Http::withToken(config('whatsapp.access_token'))->acceptJson()->connectTimeout(5)->timeout(20)
                ->post('https://graph.facebook.com/'.config('whatsapp.graph_version').'/'.$m->phone_number_id.'/messages', $payload);
            $metaId = $response->json('messages.0.id');
            if ($response->successful() && is_string($metaId) && $metaId !== '') {
                $this->finish($m, 'accepted', null, $metaId);
            } elseif ($response->status() === 429) {
                $this->finish($m, $m->attempts < 3 ? 'pending' : 'failed', 'rate_limited');
            } elseif ($response->serverError() || $response->successful()) {
                $this->finish($m, 'indeterminate', 'ambiguous_response');
            } else {
                $code = $response->json('error.code');
                $this->finish($m, 'failed', is_numeric($code) ? 'meta_'.(int) $code : 'request_rejected');
            }
        } catch (ConnectionException) {
            $this->finish($m, 'indeterminate', 'transport_timeout');
        } catch (Throwable) {
            // Do not log exception bodies, tokens, request payloads or recipients.
            $this->finish($m, 'indeterminate', 'transport_or_persistence_error');
        }
    }

    private function finish(WhatsAppMessage $original, string $state, ?string $error = null, ?string $metaId = null): void
    {
        DB::transaction(function () use ($original, $state, $error, $metaId) {
            $m = WhatsAppMessage::lockForUpdate()->findOrFail($original->id);
            WhatsAppDeliveryEvent::firstOrCreate(['event_key' => hash('sha256', $m->id.'|attempt|'.$original->attempts)], [
                'message_id' => $m->id, 'state' => $state, 'occurred_at' => Outbox::now(), 'error_code' => $error,
            ]);
            // A webhook can arrive before the POST returns. Never overwrite that confirmation.
            if ($m->state !== 'processing') {
                return;
            }
            $m->fill(['state' => $state, 'error_code' => $error, 'meta_id' => $metaId,
                'next_attempt_at' => Outbox::now()->addSeconds([1 => 60, 2 => 300, 3 => 900][$m->attempts] ?? 900)])->save();
        });
    }
}
