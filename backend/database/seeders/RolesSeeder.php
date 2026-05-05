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

        Role::updateOrCreate(
            ['name' => 'admin'],
            [
                'id' => $snowflake->next(),
                'guard_name' => 'api'
            ]
        );
        Role::updateOrCreate(
            ['name' => 'advogado'],
            [
                'id' => $snowflake->next(),
                'guard_name' => 'api'
            ]
        );
        Role::updateOrCreate(
            ['name' => 'funcionario'],
            [
                'id' => $snowflake->next(),
                'guard_name' => 'api'
            ]
        );
    }
}
