<?php

namespace Database\Factories;

use App\Enums\StatusCompromisso;
use App\Enums\TipoCompromisso;
use App\Models\Compromisso;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class CompromissoFactory extends Factory
{
    protected $model = Compromisso::class;

    public function definition(): array
    {
        return [
            'user_id' => User::query()->inRandomOrder()->value('id'),
            'titulo' => $this->faker->randomElement([
                'Reunião de alinhamento processual',
                'Prazo para protocolo',
                'Audiência de conciliação',
                'Revisão de documentos',
                'Lembrete de contato com cliente',
            ]),
            'descricao' => $this->faker->sentence(12),
            'data' => Carbon::today()
                ->addDays($this->faker->numberBetween(0, 14))
                ->toDateString(),
            'hora' => $this->faker->time('H:i'),
            'tipo' => $this->faker->randomElement(
                array_map(fn (TipoCompromisso $tipo) => $tipo->value, TipoCompromisso::cases())
            ),
            'status' => StatusCompromisso::PENDENTE->value,
            'anexo' => null,
        ];
    }

    public function paraUsuario(User $user): static
    {
        return $this->state(fn () => [
            'user_id' => $user->id,
        ]);
    }

    public function hoje(): static
    {
        return $this->state(fn () => [
            'data' => Carbon::today()->toDateString(),
            'status' => StatusCompromisso::PENDENTE->value,
        ]);
    }

    public function estaSemana(): static
    {
        return $this->state(function () {
            $hoje = Carbon::today();
            $fimDaSemana = $hoje->copy()->endOfWeek();
            $diasAteFimDaSemana = max(1, $hoje->diffInDays($fimDaSemana));

            return [
                'data' => $hoje->copy()
                    ->addDays($this->faker->numberBetween(1, $diasAteFimDaSemana))
                    ->toDateString(),
                'status' => StatusCompromisso::PENDENTE->value,
            ];
        });
    }

    public function proximaSemana(): static
    {
        return $this->state(fn () => [
            'data' => Carbon::today()
                ->addWeek()
                ->addDays($this->faker->numberBetween(1, 5))
                ->toDateString(),
            'status' => StatusCompromisso::PENDENTE->value,
        ]);
    }

    public function concluido(): static
    {
        return $this->state(fn () => [
            'status' => StatusCompromisso::CONCLUIDO->value,
        ]);
    }

    public function cancelado(): static
    {
        return $this->state(fn () => [
            'status' => StatusCompromisso::CANCELADO->value,
        ]);
    }
}
