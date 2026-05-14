<?php

namespace Database\Factories;

use App\Enums\StatusPublicacao;
use App\Models\Categoria;
use App\Models\Publicacao;
use Illuminate\Database\Eloquent\Factories\Factory;

class PublicacaoFactory extends Factory
{
    protected $model = Publicacao::class;

    public function definition(): array
    {
        $status = $this->faker->randomElement(StatusPublicacao::cases());

        return [
            'titulo'         => $this->faker->sentence(6),
            'categoria_id'   => Categoria::inRandomOrder()->value('id'),
            'imagem_caminho' => $this->faker->boolean(70)
                                    ? 'publicacoes/' . $this->faker->uuid() . '.jpg'
                                    : null,
            'autor'          => $this->faker->name(),
            'resumo'         => $this->faker->paragraph(2),
            'conteudo'       => $this->faker->paragraphs(5, true),
            'status'         => $status,
            'publicado_em'   => $status === StatusPublicacao::Publicado
                                    ? $this->faker->dateTimeBetween('-1 year', 'now')
                                    : null,
        ];
    }

    public function publicado(): static
    {
        return $this->state(fn () => [
            'status'       => StatusPublicacao::Publicado,
            'publicado_em' => now(),
        ]);
    }

    public function rascunho(): static
    {
        return $this->state(fn () => [
            'status'      => StatusPublicacao::Rascunho,
            'publicado_em' => null,
        ]);
    }

    public function arquivado(): static
    {
        return $this->state(fn () => [
            'status'      => StatusPublicacao::Arquivado,
            'publicado_em' => null,
        ]);
    }
}