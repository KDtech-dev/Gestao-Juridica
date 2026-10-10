<?php

namespace Tests\Feature;

use App\Jobs\SendWhatsAppMessage;
use App\Models\Advogado;
use App\Models\Compromisso;
use App\Models\User;
use App\Models\WhatsAppDeliveryEvent;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppPreference;
use App\Models\WhatsAppWebhook;
use App\Services\CompromissoService;
use App\Services\WhatsApp\Outbox;
use App\Services\WhatsApp\Phone;
use App\Services\WhatsApp\Sender;
use App\Services\WhatsApp\Webhooks;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class WhatsAppTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Isolated in-memory database, without an outer transaction, to exercise real afterCommit.
        $this->artisan('migrate:fresh')->assertExitCode(0);
        CarbonImmutable::setTestNow('2026-09-22 11:05:00 UTC');
        config(['whatsapp.enabled' => true, 'whatsapp.mode' => 'simulation', 'whatsapp.app_secret' => 'test-secret',
            'whatsapp.verify_token' => 'test-verify', 'whatsapp.phone_number_id' => '1234', 'whatsapp.waba_id' => '5678',
            'whatsapp.graph_version' => 'v26.0', 'whatsapp.access_token' => 'test-token', 'whatsapp.templates.change.pt' => 'approved_test_fixture',
            'whatsapp.test_recipients' => ['+5511999999999']]);
        Http::preventStrayRequests();
        Queue::fake();
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    private function lawyer(string $phone = '+5511999999999'): WhatsAppPreference
    {
        $user = User::factory()->create();
        $user->syncRoles(['advogado']);
        Advogado::create(['user_id' => $user->id, 'oab_numero' => (string) random_int(10000, 99999), 'oab_uf' => 'SP']);

        return WhatsAppPreference::create(['user_id' => $user->id, 'phone' => $phone, 'verified_at' => Outbox::now()->subHour(),
            'verification_mode' => 'real', 'consented_at' => Outbox::now()->subHour(), 'daily_enabled' => true,
            'events_enabled' => true, 'daily_time' => '08:00', 'timezone' => 'America/Sao_Paulo', 'locale' => 'pt', 'reminder_minutes' => [1440, 60]])->fresh();
    }

    private function appointment(WhatsAppPreference $p, array $extra = []): Compromisso
    {
        return Compromisso::withoutEvents(fn () => Compromisso::create($extra + ['user_id' => $p->user_id, 'titulo' => 'Dado sigiloso',
            'data' => '2026-09-23', 'hora' => '09:00', 'tipo' => 'PRAZO', 'status' => 'PENDENTE', 'whatsapp_revision' => null]));
    }

    private function intent(WhatsAppPreference $p, ?Compromisso $c = null): WhatsAppMessage
    {
        return app(Outbox::class)->intent($p, 'created', Outbox::now(), Outbox::now()->addHour(), $c ?? $this->appointment($p));
    }

    private function webhook(array $value, string $waba = '5678', string $phoneId = '1234')
    {
        $raw = json_encode(['object' => 'whatsapp_business_account', 'entry' => [['id' => $waba, 'changes' => [['field' => 'messages',
            'value' => ['metadata' => ['phone_number_id' => $phoneId]] + $value]]]]]);

        return $this->call('POST', '/api/whatsapp/webhook', [], [], [], ['CONTENT_TYPE' => 'application/json',
            'HTTP_X_HUB_SIGNATURE_256' => 'sha256='.hash_hmac('sha256', $raw, 'test-secret')], $raw);
    }

    private function processWebhooks(): void
    {
        WhatsAppWebhook::whereNull('processed_at')->each(fn ($e) => app(Webhooks::class)->process($e->id));
    }

    public function test_simulation_is_identified_without_http_and_jobs_cannot_duplicate_a_send(): void
    {
        $p = $this->lawyer();
        $c = $this->appointment($p);
        $m = $this->intent($p, $c);
        $this->assertSame($m->id, $this->intent($p, $c)->id);
        app(Sender::class)->send($m->id);
        app(Sender::class)->send($m->id);
        $this->assertSame('simulated', $m->fresh()->state);
        $this->assertSame(1, $m->fresh()->attempts);
        $this->assertStringNotContainsString('Dado sigiloso', json_encode($m->fresh()->preview));
        Http::assertNothingSent();
    }

    public function test_test_allowlist_is_checked_at_execution_and_empty_list_denies_all(): void
    {
        config(['whatsapp.mode' => 'test']);
        $p = $this->lawyer();
        $m = $this->intent($p);
        config(['whatsapp.test_recipients' => []]);
        app(Sender::class)->send($m->id);
        $this->assertSame('test_recipient_blocked', $m->fresh()->error_code);
        Http::assertNothingSent();
    }

    public function test_real_request_is_a_template_and_acceptance_is_not_delivery(): void
    {
        config(['whatsapp.mode' => 'test']);
        $p = $this->lawyer();
        $m = $this->intent($p);
        Http::fake(['*' => Http::response(['messages' => [['id' => 'wamid.1']]], 200)]);
        app(Sender::class)->send($m->id);
        app(Sender::class)->send($m->id);
        $this->assertSame('accepted', $m->fresh()->state);
        Http::assertSentCount(1);
        Http::assertSent(fn ($r) => $r['type'] === 'template' && $r['to'] === '5511999999999' && $r['biz_opaque_callback_data'] === $m->id);
    }

    public function test_preferences_active_role_phone_and_permissions_are_rechecked(): void
    {
        foreach (['consent', 'active', 'role', 'phone', 'verification', 'category', 'permission'] as $reason) {
            $p = $this->lawyer('+55119'.str_pad((string) random_int(1, 99999999), 8, '0', STR_PAD_LEFT));
            $m = $this->intent($p);
            match ($reason) {
                'consent' => $p->update(['consented_at' => null]),
                'active' => $p->user->forceFill(['is_active' => false])->save(),
                'role' => $p->user->syncRoles(['funcionario']),
                'phone' => $p->update(['phone' => '+55219'.random_int(10000000, 99999999)]),
                'permission' => Gate::before(fn ($user, $ability) => $ability === 'view' ? false : null),
                'verification' => $p->update(['verified_at' => null]),
                'category' => $p->update(['events_enabled' => false]),
            };
            app(Sender::class)->send($m->id);
            $this->assertSame('cancelled', $m->fresh()->state, $reason);
        }
        Http::assertNothingSent();
    }

    public function test_simulated_verification_cannot_authorize_real_messages(): void
    {
        config(['whatsapp.mode' => 'test']);
        $p = $this->lawyer();
        $p->update(['verification_mode' => 'simulation']);
        $m = $this->intent($p);
        app(Sender::class)->send($m->id);
        $this->assertSame('cancelled', $m->fresh()->state);
        Http::assertNothingSent();
    }

    public function test_changed_and_cancelled_appointments_replace_reminders(): void
    {
        $p = $this->lawyer();
        $c = $this->appointment($p);
        app(Outbox::class)->reminders($p, $c);
        $old = WhatsAppMessage::pluck('id');
        $this->assertCount(2, $old);
        DB::transaction(fn () => $c->update(['hora' => '11:00']));
        $this->assertSame(2, WhatsAppMessage::whereIn('id', $old)->where('state', 'cancelled')->count());
        $this->assertSame(2, WhatsAppMessage::where('kind', 'reminder')->where('state', 'pending')->count());
        DB::transaction(fn () => $c->update(['status' => 'CANCELADO']));
        $this->assertSame(0, WhatsAppMessage::where('kind', 'reminder')->where('state', 'pending')->count());
        $m = WhatsAppMessage::where('kind', 'cancelled')->firstOrFail();
        app(Sender::class)->send($m->id);
        $this->assertSame('simulated', $m->fresh()->state);
    }

    public function test_soft_deletion_and_restoration_do_not_revive_old_reminders(): void
    {
        $p = $this->lawyer();
        $c = $this->appointment($p);
        app(Outbox::class)->reminders($p, $c);
        DB::transaction(fn () => $c->delete());
        $this->assertSame(0, WhatsAppMessage::where('kind', 'reminder')->where('state', 'pending')->count());
        DB::transaction(fn () => $c->restore());
        $this->assertSame(2, WhatsAppMessage::where('kind', 'reminder')->where('state', 'pending')->count());
        $this->assertSame(0, WhatsAppMessage::where('kind', 'cancelled')->where('state', 'pending')->count());
    }

    public function test_job_dispatch_waits_for_commit_and_rollback_removes_the_intent(): void
    {
        $p = $this->lawyer();
        $c = $this->appointment($p);
        DB::beginTransaction();
        $this->intent($p, $c);
        Queue::assertNothingPushed();
        DB::rollBack();
        $this->assertSame(0, WhatsAppMessage::count());
        Queue::assertNothingPushed();
        DB::beginTransaction();
        $this->intent($p, $c);
        Queue::assertNothingPushed();
        DB::commit();
        Queue::assertPushed(SendWhatsAppMessage::class, 1);
    }

    public function test_sweep_recovers_intents_if_queue_dispatch_fails(): void
    {
        $p = $this->lawyer();
        $dispatcher = app(Dispatcher::class);
        $broken = \Mockery::mock(Dispatcher::class);
        $broken->shouldReceive('dispatch')->once()->andThrow(new \RuntimeException('queue unavailable'));
        app()->instance(Dispatcher::class, $broken);
        try {
            $m = $this->intent($p);
            $this->assertSame('pending', $m->fresh()->state);
        } finally {
            app()->instance(Dispatcher::class, $dispatcher);
        }
        Queue::fake();
        app(Outbox::class)->sweep();
        Queue::assertPushed(SendWhatsAppMessage::class, fn ($job) => $job->messageId === $m->id);
    }

    public function test_summary_uses_local_day_and_catches_overdue_minute_once(): void
    {
        $p = $this->lawyer();
        $this->appointment($p, ['data' => '2026-09-22', 'hora' => '18:00']);
        app(Outbox::class)->sweep();
        app(Outbox::class)->sweep();
        $m = WhatsAppMessage::where('kind', 'daily')->sole();
        $this->assertSame('2026-09-22 11:00:00', DB::table('whatsapp_messages')->where('id', $m->id)->value('due_at'));
        app(Sender::class)->send($m->id);
        $this->assertSame('simulated', $m->fresh()->state);
        $this->assertSame(['2026-09-22', '1', '1'], array_slice($m->fresh()->preview['parameters'], 0, 3));
    }

    public function test_empty_digest_and_obsolete_reminders_are_not_sent(): void
    {
        $p = $this->lawyer();
        app(Outbox::class)->sweep();
        $m = WhatsAppMessage::where('kind', 'daily')->sole();
        app(Sender::class)->send($m->id);
        $this->assertSame('cancelled', $m->fresh()->state);
        $c = $this->appointment($p, ['data' => '2026-09-22', 'hora' => '08:10']);
        app(Outbox::class)->reminders($p, $c);
        $this->assertSame(0, WhatsAppMessage::where('kind', 'reminder')->count());
        $m = $this->intent($p, $c);
        $m->update(['expires_at' => Outbox::now()->subSecond()]);
        app(Sender::class)->send($m->id);
        $this->assertSame('expired', $m->fresh()->state);
        Http::assertNothingSent();
    }

    public function test_timeout_is_indeterminate_and_reconciled_by_signed_webhook_without_retry(): void
    {
        config(['whatsapp.mode' => 'test']);
        $p = $this->lawyer();
        $m = $this->intent($p);
        Http::fake(fn () => throw new ConnectionException('timeout'));
        app(Sender::class)->send($m->id);
        $this->assertSame('indeterminate', $m->fresh()->state);
        app(Sender::class)->send($m->id);
        $this->assertSame(1, $m->fresh()->attempts);
        $this->webhook(['statuses' => [['id' => 'wamid.late', 'status' => 'delivered', 'recipient_id' => '5511999999999',
            'timestamp' => Outbox::now()->timestamp, 'biz_opaque_callback_data' => $m->id]]])->assertOk();
        $this->processWebhooks();
        $this->assertSame('delivered', $m->fresh()->state);
        $this->assertSame('wamid.late', $m->fresh()->meta_id);
    }

    public function test_rate_limit_retries_are_delayed_bounded_and_job_duplicates_do_not_bypass_delay(): void
    {
        config(['whatsapp.mode' => 'test']);
        $p = $this->lawyer();
        $m = $this->intent($p);
        Http::fake(['*' => Http::response(['error' => ['code' => 130429]], 429)]);
        app(Sender::class)->send($m->id);
        app(Sender::class)->send($m->id);
        Http::assertSentCount(1);
        CarbonImmutable::setTestNow(Outbox::now()->addMinute());
        app(Sender::class)->send($m->id);
        CarbonImmutable::setTestNow(Outbox::now()->addMinutes(5));
        app(Sender::class)->send($m->id);
        $this->assertSame('failed', $m->fresh()->state);
        $this->assertSame(3, $m->fresh()->attempts);
        Http::assertSentCount(3);
    }

    public function test_webhook_signature_challenge_and_persistence_before_processing(): void
    {
        $this->get('/api/whatsapp/webhook?hub_mode=subscribe&hub_verify_token=test-verify&hub_challenge=hello')->assertOk()->assertSee('hello');
        $this->get('/api/whatsapp/webhook?hub_mode=subscribe&hub_verify_token=test-secret')->assertForbidden();
        $this->postJson('/api/whatsapp/webhook', ['object' => 'whatsapp_business_account'])->assertForbidden();
        $this->webhook(['statuses' => []])->assertOk();
        $e = WhatsAppWebhook::sole();
        $this->assertNull($e->processed_at);
        $this->assertStringNotContainsString('whatsapp_business_account', DB::table('whatsapp_webhooks')->value('payload'));
        $this->webhook(['statuses' => []])->assertOk();
        $this->assertSame(1, WhatsAppWebhook::count());
    }

    public function test_out_of_order_and_duplicate_statuses_never_regress_or_update_panel(): void
    {
        config(['whatsapp.mode' => 'test']);
        $p = $this->lawyer();
        $c = $this->appointment($p);
        $m = $this->intent($p, $c);
        $m->update(['state' => 'accepted', 'meta_id' => 'wamid.1', 'waba_id' => '5678', 'phone_number_id' => '1234']);
        foreach (['read', 'sent', 'delivered', 'read', 'failed'] as $status) {
            $this->webhook(['statuses' => [['id' => 'wamid.1', 'status' => $status, 'recipient_id' => '5511999999999', 'timestamp' => Outbox::now()->timestamp]]])->assertOk();
            $this->processWebhooks();
        }
        $this->assertSame('read', $m->fresh()->state);
        $this->assertSame(4, WhatsAppDeliveryEvent::count());
        $this->assertSame('PENDENTE', $c->fresh()->status);
        $this->assertDatabaseCount('notificacoes', 0);
    }

    public function test_wrong_account_phone_or_recipient_cannot_update_delivery(): void
    {
        config(['whatsapp.mode' => 'test']);
        $p = $this->lawyer();
        $m = $this->intent($p);
        $m->update(['state' => 'accepted', 'meta_id' => 'wamid.1', 'waba_id' => '5678', 'phone_number_id' => '1234']);
        $value = ['statuses' => [['id' => 'wamid.1', 'status' => 'read', 'recipient_id' => '5511999999999', 'timestamp' => Outbox::now()->timestamp]]];
        $this->webhook($value, 'other')->assertOk();
        $this->webhook($value, '5678', 'other')->assertOk();
        $value['statuses'][0]['recipient_id'] = '5511888888888';
        $this->webhook($value)->assertOk();
        $this->processWebhooks();
        $this->assertSame('accepted', $m->fresh()->state);
    }

    public function test_phone_is_verified_by_signed_inbound_code_and_stop_revokes_consent(): void
    {
        $p = $this->lawyer();
        $p->update(['verified_at' => null]);
        $code = $this->actingAs($p->user, 'sanctum')->postJson('/api/whatsapp/verification')->assertOk()->json('instruction');
        $this->webhook(['messages' => [['id' => 'in.1', 'from' => '5511999999999', 'timestamp' => Outbox::now()->timestamp, 'text' => ['body' => $code]]]])->assertOk();
        $this->processWebhooks();
        $this->assertNotNull($p->fresh()->verified_at);
        $m = $this->intent($p->fresh());
        $this->webhook(['messages' => [['id' => 'in.2', 'from' => '5511999999999', 'timestamp' => Outbox::now()->addSecond()->timestamp, 'text' => ['body' => ' PARAR ']]]])->assertOk();
        $this->processWebhooks();
        $this->assertNull($p->fresh()->consented_at);
        $this->assertSame('cancelled', $m->fresh()->state);
    }

    public function test_history_is_private_and_diagnostic_is_admin_only_and_allowlisted(): void
    {
        $p = $this->lawyer();
        $other = $this->lawyer('+5511888888888');
        $this->intent($p);
        $this->intent($other);
        $this->actingAs($p->user, 'sanctum')->getJson('/api/whatsapp/history')->assertOk()->assertJsonCount(1, 'data');
        $this->postJson('/api/whatsapp/diagnostic', ['phone' => $p->phone])->assertForbidden();
        $admin = User::factory()->create();
        $admin->syncRoles(['admin']);
        $this->actingAs($admin->fresh(), 'sanctum')->getJson('/api/whatsapp/history')->assertOk()->assertJsonCount(2, 'data');
        $this->postJson('/api/whatsapp/diagnostic', ['phone' => $other->phone])->assertUnprocessable();
        $this->postJson('/api/whatsapp/diagnostic', ['phone' => $p->phone])->assertAccepted();
        config(['whatsapp.test_recipients' => []]);
        $m = WhatsAppMessage::where('kind', 'diagnostic')->sole();
        app(Sender::class)->send($m->id);
        $this->assertSame('cancelled', $m->fresh()->state);
        Http::assertNothingSent();
    }

    public function test_phone_normalization_never_inserts_or_removes_brazilian_digits(): void
    {
        $this->assertSame('+5511987654321', Phone::normalize('+55 (11) 98765-4321'));
        $this->assertSame('+551187654321', Phone::normalize('+55 (11) 8765-4321'));
        $this->expectException(ValidationException::class);
        Phone::normalize('11987654321');
    }

    public function test_early_status_without_callback_is_retried_after_meta_id_is_persisted(): void
    {
        config(['whatsapp.mode' => 'test']);
        $p = $this->lawyer();
        $m = $this->intent($p);
        $m->update(['state' => 'processing', 'phone_number_id' => '1234', 'waba_id' => '5678']);
        $this->webhook(['statuses' => [['id' => 'wamid.early', 'status' => 'delivered', 'recipient_id' => '5511999999999', 'timestamp' => Outbox::now()->timestamp]]])->assertOk();
        $this->processWebhooks();
        $this->assertNull(WhatsAppWebhook::sole()->processed_at);
        $m->update(['meta_id' => 'wamid.early', 'state' => 'accepted']);
        $this->processWebhooks();
        $this->assertNotNull(WhatsAppWebhook::sole()->processed_at);
        $this->assertSame('delivered', $m->fresh()->state);
    }

    public function test_preference_update_normalizes_phone_and_invalidates_verification_when_changed(): void
    {
        $p = $this->lawyer();
        $body = ['phone' => '+55 (11) 98888-7777', 'consent' => true, 'daily_enabled' => true, 'events_enabled' => false,
            'daily_time' => '09:30', 'timezone' => 'America/Sao_Paulo', 'locale' => 'es', 'reminder_minutes' => [60]];
        $this->actingAs($p->user, 'sanctum')->putJson('/api/whatsapp/preferences', $body)->assertOk()
            ->assertJsonPath('preferences.phone', '+5511988887777')->assertJsonPath('preferences.verified_at', null);
        $this->assertNull($p->fresh()->verification_mode);
        $this->assertNotNull($p->fresh()->consented_at);
        $body['consent'] = false;
        $this->putJson('/api/whatsapp/preferences', $body)->assertOk()->assertJsonPath('preferences.daily_enabled', false);
        $this->assertNull($p->fresh()->consented_at);
    }

    public function test_anonymous_and_non_lawyer_accounts_cannot_manage_preferences(): void
    {
        $this->getJson('/api/whatsapp/history')->assertUnauthorized();
        $user = User::factory()->create();
        $user->syncRoles(['funcionario']);
        $this->actingAs($user->fresh(), 'sanctum')->getJson('/api/whatsapp/preferences')->assertForbidden();
        $this->putJson('/api/whatsapp/preferences', [])->assertForbidden();
        $this->postJson('/api/whatsapp/verification')->assertForbidden();
        $this->getJson('/api/whatsapp/history')->assertForbidden();
    }

    public function test_dead_worker_is_indeterminate_and_not_requeued(): void
    {
        $p = $this->lawyer();
        $m = $this->intent($p);
        $m->update(['state' => 'processing', 'claimed_at' => Outbox::now()->subMinutes(6)]);
        Queue::fake();
        app(Outbox::class)->sweep();
        $this->assertSame('indeterminate', $m->fresh()->state);
        Queue::assertNotPushed(SendWhatsAppMessage::class, fn ($job) => $job->messageId === $m->id);
    }

    public function test_digest_uses_recipient_date_across_midnight_and_date_only_deadlines_have_no_reminders(): void
    {
        CarbonImmutable::setTestNow('2026-09-22 23:10:00 UTC');
        $p = $this->lawyer();
        $p->update(['timezone' => 'Asia/Tokyo']);
        $this->appointment($p, ['data' => '2026-09-22', 'hora' => '22:00']);
        $c = $this->appointment($p, ['data' => '2026-09-23', 'hora' => null]);
        app(Outbox::class)->reminders($p, $c);
        $this->assertSame(0, WhatsAppMessage::count());
        app(Outbox::class)->sweep();
        $m = WhatsAppMessage::where('kind', 'daily')->sole();
        $this->assertSame('2026-09-23', $m->local_date);
        app(Sender::class)->send($m->id);
        $this->assertSame('2', $m->fresh()->preview['parameters'][1]);
    }

    public function test_creation_service_persists_business_intents_inside_transaction(): void
    {
        $p = $this->lawyer();
        $this->actingAs($p->user, 'sanctum');
        $c = app(CompromissoService::class)->criar(['titulo' => 'Agenda', 'data' => '2026-09-23', 'hora' => '09:00', 'tipo' => 'PRAZO', 'status' => 'PENDENTE']);
        $this->assertNotNull($c->whatsapp_revision);
        $this->assertSame(3, WhatsAppMessage::where('compromisso_id', $c->id)->count());
        Queue::assertPushed(SendWhatsAppMessage::class, 1);
        $this->getJson('/api/compromissos/'.$c->id)->assertOk();
        $p->user->forceFill(['is_active' => false])->save();
        $this->actingAs($p->user, 'sanctum')->getJson('/api/compromissos/'.$c->id)->assertForbidden();
    }

    public function test_missing_template_never_falls_back_to_free_text_and_switch_is_off_safe(): void
    {
        config(['whatsapp.mode' => 'test', 'whatsapp.templates.change.pt' => null]);
        $p = $this->lawyer();
        $m = $this->intent($p);
        config(['whatsapp.enabled' => false]);
        app(Sender::class)->send($m->id);
        $this->assertSame('pending', $m->fresh()->state);
        config(['whatsapp.enabled' => true]);
        app(Sender::class)->send($m->id);
        $this->assertSame('failed', $m->fresh()->state);
        Http::assertNothingSent();
    }

    public function test_opt_out_sent_after_verification_is_honored_even_when_inbox_processing_is_delayed(): void
    {
        $p = $this->lawyer();
        $p->update(['verified_at' => null]);
        $code = $this->actingAs($p->user, 'sanctum')->postJson('/api/whatsapp/verification')->assertOk()->json('instruction');
        $sentAt = Outbox::now()->timestamp;
        $this->webhook(['messages' => [['id' => 'verify', 'from' => '5511999999999', 'timestamp' => $sentAt, 'text' => ['body' => $code]]]])->assertOk();
        $this->webhook(['messages' => [['id' => 'stop', 'from' => '5511999999999', 'timestamp' => $sentAt + 1, 'text' => ['body' => 'SAIR']]]])->assertOk();
        CarbonImmutable::setTestNow(Outbox::now()->addMinutes(5));
        $this->processWebhooks();
        $this->assertNotNull($p->fresh()->verified_at);
        $this->assertNull($p->fresh()->consented_at);
        $this->assertFalse($p->fresh()->events_enabled);
    }
}
