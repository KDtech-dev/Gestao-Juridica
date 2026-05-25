<?php

namespace Database\Factories;

use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cliente>
 */
class ClienteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'            => fake()->name(),
            'cpf_cnpj'        => fake()->numerify('###########'),
            'email'           => fake()->unique()->safeEmail(),
            'telefone'        => fake()->phoneNumber(),
            'data_nascimento' => fake()->date(),
        ];
    }
}
