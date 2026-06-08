<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['admin', 'advogado', 'funcionario', 'cliente'] as $roleName) {
            Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'api'],
            );
        }
    }
}