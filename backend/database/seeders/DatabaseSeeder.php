<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,
            TestUsersSeeder::class,
            CategoriaSeeder::class,
            PublicacaoSeeder::class,
            CompromissoSeeder::class,
            NotificacaoSeeder::class,
            ClienteSeeder::class,
            CasoSeeder::class,
            DjenTriageSeeder::class,
        ]);
    }
}
