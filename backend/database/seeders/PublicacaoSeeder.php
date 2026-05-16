<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Publicacao;
use App\Models\User;
use Illuminate\Database\Seeder;

class PublicacaoSeeder extends Seeder
{
    public function run(): void
    {
        if (User::count() === 0) {
            User::factory()->count(5)->create();
        }

        if (Categoria::count() === 0) {
            Categoria::factory()->count(5)->create();
        }

        Publicacao::factory()
            ->count(15)
            ->publicado()
            ->create();

        Publicacao::factory()
            ->count(15)
            ->rascunho()
            ->create();

        Publicacao::factory()
            ->count(13)
            ->arquivado()
            ->create();
    }
}