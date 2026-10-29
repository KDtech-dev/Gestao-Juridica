<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (!extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('The pdo_sqlite extension is required.');
        }

        parent::setUp();
    }

    public function test_activity_log_endpoint_requires_an_admin(): void
    {
        $this->getJson('/api/activity-logs')->assertUnauthorized();

        $user = User::factory()->create();
        $user->syncRoles([Role::findOrCreate('funcionario', 'api')]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/activity-logs')
            ->assertForbidden();
    }

    public function test_admin_can_filter_activity_logs_by_day_and_module(): void
    {
        $admin = User::factory()->create();
        $admin->syncRoles([Role::findOrCreate('admin', 'api')]);

        ActivityLog::query()->create($this->logData($admin, [
            'module' => 'cases',
            'event' => 'updated',
            'created_at' => '2026-10-28 10:00:00',
        ]));
        ActivityLog::query()->create($this->logData($admin, [
            'module' => 'clients',
            'event' => 'created',
            'created_at' => '2026-10-28 11:00:00',
        ]));
        ActivityLog::query()->create($this->logData($admin, [
            'module' => 'cases',
            'event' => 'created',
            'created_at' => '2026-10-27 11:00:00',
        ]));

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/activity-logs?date=2026-10-28&module=cases');

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.module', 'cases')
            ->assertJsonPath('data.0.event', 'updated');
    }

    public function test_model_updates_are_logged_without_sensitive_field_values(): void
    {
        $admin = User::factory()->create();
        $admin->syncRoles([Role::findOrCreate('admin', 'api')]);
        $subject = User::factory()->create(['name' => 'Nome original']);

        $this->actingAs($admin, 'sanctum');
        $subject->update([
            'name' => 'Nome alterado',
            'email' => 'alterado@example.test',
            'password' => 'nova-senha-segura',
        ]);

        $log = ActivityLog::query()
            ->where('actor_id', $admin->id)
            ->where('subject_id', $subject->id)
            ->where('event', 'updated')
            ->latest('id')
            ->firstOrFail();

        $this->assertContains('name', $log->changed_fields);
        $this->assertNotContains('email', $log->changed_fields);
        $this->assertNotContains('password', $log->changed_fields);
        $this->assertSame('Nome alterado', $log->subject_label);
    }

    private function logData(User $actor, array $overrides = []): array
    {
        return array_merge([
            'actor_id' => $actor->id,
            'actor_name' => $actor->name,
            'module' => 'cases',
            'event' => 'updated',
            'subject_type' => 'Caso',
            'subject_id' => 'caso-1',
            'subject_label' => 'Caso de teste',
            'changed_fields' => ['titulo'],
            'details' => null,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'phpunit',
            'created_at' => now(),
        ], $overrides);
    }
}
