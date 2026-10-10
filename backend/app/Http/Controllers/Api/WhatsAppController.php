<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppPreference;
use App\Services\WhatsApp\Outbox;
use App\Services\WhatsApp\Phone;
use App\Services\WhatsApp\Sender;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class WhatsAppController extends Controller
{
    private function lawyer(Request $r): void
    {
        abort_unless($r->user()->is_active && $r->user()->isAdvogado() && $r->user()->advogado()->exists(), 403);
    }

    public function show(Request $r, Sender $sender)
    {
        abort_unless($r->user()->is_active && ($r->user()->isAdvogado() || $r->user()->isAdmin()), 403);
        $p = WhatsAppPreference::firstOrCreate(['user_id' => $r->user()->id], [
            'daily_time' => config('whatsapp.daily_time'), 'timezone' => config('whatsapp.timezone'),
            'reminder_minutes' => config('whatsapp.reminder_minutes'),
        ]);

        return response()->json(['preferences' => $p, 'enabled' => config('whatsapp.enabled'), 'mode' => config('whatsapp.mode'),
            'diagnostic_ready' => $r->user()->isAdmin() && config('whatsapp.enabled') && config('whatsapp.mode') === 'test'
                && $sender->ready() && config('whatsapp.diagnostic_template') && count(config('whatsapp.test_recipients')) > 0]);
    }

    public function update(Request $r)
    {
        $this->lawyer($r);
        $data = $r->validate([
            'phone' => ['required', 'string', 'max:32'], 'consent' => ['required', 'boolean'],
            'daily_enabled' => ['required', 'boolean'], 'events_enabled' => ['required', 'boolean'],
            'daily_time' => ['required', 'date_format:H:i'], 'timezone' => ['required', 'timezone:all'],
            'locale' => ['required', Rule::in(['pt', 'en', 'es'])],
            'reminder_minutes' => ['required', 'array', 'max:5'], 'reminder_minutes.*' => ['integer', 'min:1', 'max:10080', 'distinct'],
        ]);
        $data['phone'] = Phone::normalize($data['phone']);
        $r->merge(['phone' => $data['phone']]);
        $r->validate(['phone' => [Rule::unique('whatsapp_preferences')->ignore($r->user()->id, 'user_id')]]);
        DB::transaction(function () use ($r, $data) {
            $p = WhatsAppPreference::firstOrCreate(['user_id' => $r->user()->id]);
            $p = WhatsAppPreference::lockForUpdate()->findOrFail($p->id);
            if ($p->phone !== $data['phone']) {
                $p->fill(['verified_at' => null, 'verification_mode' => null, 'verification_hash' => null, 'verification_expires_at' => null, 'consented_at' => null]);
            }
            if ($data['consent']) {
                $p->consented_at ??= Outbox::now();
                $p->revoked_at = null;
            } else {
                $p->consented_at = null;
                $p->revoked_at = Outbox::now();
                $data['daily_enabled'] = false;
                $data['events_enabled'] = false;
            }
            unset($data['consent']);
            $p->fill($data)->save();
            WhatsAppMessage::where('user_id', $p->user_id)->where('kind', 'daily')->where('state', 'pending')->each(function ($m) use ($p) {
                $due = CarbonImmutable::parse($m->local_date.' '.$p->daily_time, $p->timezone)->utc();
                $m->update(['due_at' => $due, 'expires_at' => $due->addHours(4),
                    'next_attempt_at' => $m->attempts ? $due->max($m->next_attempt_at) : $due]);
            });
        });

        return $this->show($r, app(Sender::class));
    }

    public function verification(Request $r)
    {
        $this->lawyer($r);
        $p = WhatsAppPreference::where('user_id', $r->user()->id)->firstOrFail();
        abort_unless($p->phone, 422);
        $code = strtoupper(bin2hex(random_bytes(6)));
        $p->update(['verification_hash' => hash('sha256', $code), 'verification_expires_at' => Outbox::now()->addMinutes(15)]);

        return response()->json(['instruction' => 'VERIFICAR '.$code, 'expires_in_minutes' => 15]);
    }

    public function history(Request $r)
    {
        abort_unless($r->user()->is_active && ($r->user()->isAdmin() || $r->user()->isAdvogado()), 403);
        $query = WhatsAppMessage::with('deliveries')->latest();
        if (! $r->user()->isAdmin()) {
            $query->where('user_id', $r->user()->id);
        }
        if ($r->filled('state')) {
            $query->where('state', $r->query('state'));
        }
        if ($r->user()->isAdmin() && $r->filled('user_id')) {
            $query->where('user_id', $r->query('user_id'));
        }
        $page = $query->paginate(20);
        $page->getCollection()->transform(function ($m) {
            $data = $m->only(['id', 'user_id', 'kind', 'mode', 'state', 'due_at', 'attempts', 'meta_id', 'error_code', 'created_at']);
            $data['phone'] = '••••'.substr($m->phone, -4);
            $data['deliveries'] = $m->deliveries->map->only(['state', 'occurred_at', 'error_code']);

            return $data;
        });

        return response()->json($page);
    }

    public function diagnostic(Request $r, Outbox $outbox, Sender $sender)
    {
        abort_unless($r->user()->isAdmin() && $r->user()->is_active, 403);
        $phone = Phone::normalize($r->validate(['phone' => ['required', 'string', 'max:32']])['phone']);
        abort_unless(config('whatsapp.enabled') && in_array(config('whatsapp.mode'), ['simulation', 'test']) && Phone::allowed($phone), 422);
        abort_unless(config('whatsapp.mode') === 'simulation' || ($sender->ready() && config('whatsapp.diagnostic_template')), 422);
        $m = DB::transaction(function () use ($phone, $r, $outbox) {
            $m = WhatsAppMessage::create(['dedupe_key' => hash('sha256', (string) Str::uuid()), 'user_id' => $r->user()->id,
                'kind' => 'diagnostic', 'mode' => config('whatsapp.mode'), 'phone' => $phone, 'due_at' => Outbox::now(),
                'expires_at' => Outbox::now()->addMinutes(15), 'next_attempt_at' => Outbox::now()]);
            $outbox->dispatch($m);

            return $m;
        });

        return response()->json(['id' => $m->id], 202);
    }
}
