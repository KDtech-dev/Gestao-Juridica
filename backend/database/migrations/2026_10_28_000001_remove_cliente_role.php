<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        Role::query()
            ->where('name', 'cliente')
            ->where('guard_name', 'api')
            ->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        Role::firstOrCreate([
            'name' => 'cliente',
            'guard_name' => 'api',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
