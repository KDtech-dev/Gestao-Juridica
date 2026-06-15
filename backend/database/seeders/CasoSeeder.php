<?php
namespace Database\Seeders;

use App\Models\Caso;
use App\Models\Categoria;
use App\Models\Cliente;
use Illuminate\Database\Seeder;

class CasoSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = Categoria::all();
        $clientes   = Cliente::all();

        if ($clientes->isEmpty()) {
            $clientes = Cliente::factory()->count(20)->create();
        }

        Caso::factory()->count(30)->create()->each(function (Caso $caso) use ($categorias, $clientes) {

            if ($categorias->isNotEmpty()) {
                $caso->categorias()->attach(
                    $categorias->random(min(rand(1, 3), $categorias->count()))->pluck('id')
                );
            }

            $papeis = ['autor', 'réu', 'interveniente', 'testemunha'];

            $clientesDoCaso = $clientes->random(min(rand(1, 3), $clientes->count()));

            foreach ($clientesDoCaso as $cliente) {
                $caso->clientes()->attach($cliente->id, [
                    'papel' => fake()->randomElement($papeis),
                ]);
            }
        });
    }
}