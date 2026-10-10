<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppWebhook;
use App\Services\WhatsApp\Webhooks;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WhatsAppWebhookController extends Controller
{
    public function verify(Request $request)
    {
        $token = config('whatsapp.verify_token');
        abort_unless($token && $request->query('hub_mode') === 'subscribe'
            && hash_equals($token, (string) $request->query('hub_verify_token')), 403);

        return response((string) $request->query('hub_challenge'), 200)->header('Content-Type', 'text/plain');
    }

    public function receive(Request $request, Webhooks $webhooks)
    {
        $secret = config('whatsapp.app_secret');
        $raw = $request->getContent();
        abort_unless($secret && hash_equals('sha256='.hash_hmac('sha256', $raw, $secret), (string) $request->header('X-Hub-Signature-256')), 403);
        $payload = json_decode($raw, true);
        abort_unless(is_array($payload) && ($payload['object'] ?? '') === 'whatsapp_business_account' && is_array($payload['entry'] ?? null), 400);
        validator($payload, [
            'entry.*' => 'array', 'entry.*.id' => 'required|string|max:100',
            'entry.*.changes' => 'present|array', 'entry.*.changes.*' => 'array',
            'entry.*.changes.*.field' => 'required|string', 'entry.*.changes.*.value' => 'required|array',
            'entry.*.changes.*.value.metadata' => 'sometimes|array',
            'entry.*.changes.*.value.metadata.phone_number_id' => 'sometimes|string|max:100',
            'entry.*.changes.*.value.statuses' => 'sometimes|array',
            'entry.*.changes.*.value.statuses.*' => 'array',
            'entry.*.changes.*.value.statuses.*.id' => 'required|string|max:255',
            'entry.*.changes.*.value.statuses.*.status' => 'required|string|max:32',
            'entry.*.changes.*.value.statuses.*.timestamp' => 'required|integer|min:0|max:4102444800',
            'entry.*.changes.*.value.statuses.*.recipient_id' => 'required|string|max:32',
            'entry.*.changes.*.value.statuses.*.biz_opaque_callback_data' => 'sometimes|string|max:512',
            'entry.*.changes.*.value.statuses.*.errors' => 'sometimes|array',
            'entry.*.changes.*.value.statuses.*.errors.*' => 'array',
            'entry.*.changes.*.value.messages' => 'sometimes|array',
            'entry.*.changes.*.value.messages.*' => 'array',
            'entry.*.changes.*.value.messages.*.from' => 'required|string|max:32',
            'entry.*.changes.*.value.messages.*.timestamp' => 'required|integer|min:0|max:4102444800',
            'entry.*.changes.*.value.messages.*.text' => 'sometimes|array',
            'entry.*.changes.*.value.messages.*.text.body' => 'sometimes|string|max:4096',
            'entry.*.changes.*.value.messages.*.button' => 'sometimes|array',
            'entry.*.changes.*.value.messages.*.button.text' => 'sometimes|string|max:4096',
            'entry.*.changes.*.value.messages.*.interactive' => 'sometimes|array',
            'entry.*.changes.*.value.messages.*.interactive.button_reply' => 'sometimes|array',
            'entry.*.changes.*.value.messages.*.interactive.button_reply.title' => 'sometimes|string|max:4096',
        ])->validate();
        // Persist the signed envelope before acknowledging. Raw payload is encrypted at rest.
        DB::transaction(function () use ($raw, $payload, $webhooks) {
            $event = WhatsAppWebhook::firstOrCreate(['event_key' => hash('sha256', $raw)], ['payload' => $payload]);
            if (! $event->processed_at) {
                $webhooks->dispatch($event);
            }
        });

        return response()->json(['received' => true]);
    }
}
