<?php

namespace Database\Seeders;

use App\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $djenVisualizar = Permission::firstOrCreate([
            'name' => 'djen.visualizar',
            'guard_name' => 'api',
        ]);
        $djenSincronizar = Permission::firstOrCreate([
            'name' => 'djen.sincronizar',
            'guard_name' => 'api',
        ]);

        foreach (['admin', 'advogado', 'funcionario', 'cliente'] as $roleName) {
            $role = Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'api'],
            );

            if (in_array($roleName, ['admin', 'advogado', 'funcionario'], true)) {
                $role->givePermissionTo($djenVisualizar, $djenSincronizar);
            }
        }
    }
}
