<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        $permission = Permission::findOrCreate('djen.vincular', 'api');

        Role::query()
            ->where('guard_name', 'api')
            ->whereIn('name', ['admin', 'advogado'])
            ->get()
            ->each(fn (Role $role) => $role->givePermissionTo($permission));

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        Permission::query()
            ->where('name', 'djen.vincular')
            ->where('guard_name', 'api')
            ->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
