<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Publicacao;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class PublicacaoSeeder extends Seeder
{
    public function run(): void
    {
        $this->ensureDefaultPublicationImage();

        if (User::count() === 0) {
            User::factory()->count(5)->create();
        }

        if (Categoria::count() === 0) {
            $this->call(CategoriaSeeder::class);
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

    private function ensureDefaultPublicationImage(): void
    {
        $targetPath = 'publicacoes/default-publication.png';

        if (Storage::disk('public')->exists($targetPath)) {
            return;
        }

        $sourcePath = database_path('seeders/assets/default-publication.png');

        if (file_exists($sourcePath)) {
            Storage::disk('public')->put($targetPath, file_get_contents($sourcePath));
        }
    }
}
