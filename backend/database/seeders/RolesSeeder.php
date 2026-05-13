<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Kra8\Snowflake\Snowflake;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $snowflake = app(Snowflake::class);

        foreach (['admin', 'advogado', 'funcionario', 'cliente'] as $roleName) {
            Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'api'],
                ['id' => $snowflake->next()]
            );
        }
    }
}
