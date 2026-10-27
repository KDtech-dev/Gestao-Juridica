<?php

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissoes = collect(PermissionEnum::cases())
            ->mapWithKeys(fn (PermissionEnum $permissao) => [
                $permissao->value => Permission::firstOrCreate([
                    'name' => $permissao->value,
                    'guard_name' => 'api',
                ]),
            ]);

        $permissoesPorPapel = [
            'admin' => PermissionEnum::cases(),
            'advogado' => [
                PermissionEnum::ClientesVisualizar, PermissionEnum::ClientesCriar, PermissionEnum::ClientesEditar,
                PermissionEnum::CasosVisualizar, PermissionEnum::CasosCriar, PermissionEnum::CasosEditar,
                PermissionEnum::CompromissosVisualizar, PermissionEnum::CompromissosCriar, PermissionEnum::CompromissosEditar,
                PermissionEnum::PublicacoesVisualizar, PermissionEnum::PublicacoesCriar, PermissionEnum::PublicacoesEditar,
                PermissionEnum::NotificacoesVisualizar, PermissionEnum::DjenVisualizar, PermissionEnum::DjenSincronizar,
            ],
            'funcionario' => [
                PermissionEnum::ClientesVisualizar, PermissionEnum::ClientesCriar, PermissionEnum::ClientesEditar,
                PermissionEnum::CasosVisualizar, PermissionEnum::CasosCriar, PermissionEnum::CasosEditar,
                PermissionEnum::CompromissosVisualizar, PermissionEnum::CompromissosCriar, PermissionEnum::CompromissosEditar,
                PermissionEnum::PublicacoesVisualizar, PermissionEnum::PublicacoesCriar, PermissionEnum::PublicacoesEditar,
                PermissionEnum::NotificacoesVisualizar, PermissionEnum::DjenVisualizar,
            ],
            'cliente' => [],
        ];

        foreach ($permissoesPorPapel as $nomePapel => $permissoesPapel) {
            $papel = Role::firstOrCreate([
                'name' => $nomePapel,
                'guard_name' => 'api',
            ]);

            $nomesPermissoes = array_map(
                static fn (PermissionEnum $permissao): string => $permissao->value,
                $permissoesPapel,
            );

            $papel->givePermissionTo($permissoes->only($nomesPermissoes)->values());
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
