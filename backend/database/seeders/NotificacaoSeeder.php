<?php

namespace Database\Seeders;

use App\Models\Notificacao;
use App\Models\User;
use App\Services\NotificacaoService;
use Illuminate\Database\Seeder;

class NotificacaoSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = User::query()
            ->whereIn('email', [
                'teste@email.com',
                'advogado@example.com',
                'funcionario@example.com',
            ])
            ->get();

        if ($usuarios->isEmpty()) {
            return;
        }

        $service = app(NotificacaoService::class);

        $usuarios->each(function (User $usuario) use ($service) {
            Notificacao::query()
                ->where('usuario_id', $usuario->id)
                ->whereIn('tipo', [
                    'COMPROMISSO_HOJE',
                    'COMPROMISSO_SEMANA',
                ])
                ->delete();

            $service->sincronizarLembretesCompromissos($usuario);
        });
    }
}
