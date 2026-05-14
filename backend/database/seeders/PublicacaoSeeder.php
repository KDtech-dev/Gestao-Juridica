<?php


namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Publicacao;
use Illuminate\Database\Seeder;

class PublicacaoSeeder extends Seeder
{
    public function run(): void
    {
        if (Categoria::count() === 0) {
            Categoria::factory()->count(5)->create();
        }

        Publicacao::factory()->count(10)->publicado()->create();
        Publicacao::factory()->count(5)->rascunho()->create();
        Publicacao::factory()->count(3)->arquivado()->create();
    }
}