<?php
namespace Database\Factories;

use App\Models\Caso;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Caso>
 */
class CasoFactory extends Factory
{
    public function definition(): array
    {
        $dataAbertura = fake()->dateTimeBetween('-2 years', 'now');

        return [
            'numero_processo'   => fake()->boolean(70)
                ? fake()->numerify('#######-##.####.#.##.####')
                : null,
            'titulo'            => fake()->sentence(4),
            'descricao'         => fake()->boolean(80)
                ? fake()->paragraph(3)
                : null,
            'status'            => fake()->randomElement([
                'aberto',
                'em_andamento',
                'encerrado',
                'arquivado',
            ]),
            'data_abertura'     => $dataAbertura,
            'data_encerramento' => fake()->boolean(30)
                ? fake()->dateTimeBetween($dataAbertura, 'now')
                : null,
            'advogado_id'       => fake()->boolean(80)
                ? User::inRandomOrder()->first()?->id
                : null,
        ];
    }

    public function aberto(): static
    {
        return $this->state(['status' => 'aberto', 'data_encerramento' => null]);
    }

    public function encerrado(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status'            => 'encerrado',
                'data_encerramento' => fake()->dateTimeBetween(
                    $attributes['data_abertura'],
                    'now'
                ),
            ];
        });
    }
}