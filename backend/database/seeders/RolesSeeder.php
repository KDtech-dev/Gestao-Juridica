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
                PermissionEnum::DjenVisualizar, PermissionEnum::DjenVincular, PermissionEnum::DjenSincronizar,
            ],
            'funcionario' => [
                PermissionEnum::ClientesVisualizar, PermissionEnum::ClientesCriar, PermissionEnum::ClientesEditar,
                PermissionEnum::CasosVisualizar, PermissionEnum::CasosCriar, PermissionEnum::CasosEditar,
                PermissionEnum::CompromissosVisualizar, PermissionEnum::CompromissosCriar, PermissionEnum::CompromissosEditar,
                PermissionEnum::PublicacoesVisualizar, PermissionEnum::PublicacoesCriar, PermissionEnum::PublicacoesEditar,
                PermissionEnum::DjenVisualizar,
            ],
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

            $permissoesDoPapel = $permissoes->only($nomesPermissoes)->values();

            if ($nomePapel === 'admin') {
                // O papel admin sempre recebe todo o catálogo conhecido pelo sistema.
                // syncPermissions também corrige permissões faltantes em bancos já existentes.
                $papel->syncPermissions($permissoesDoPapel);
            } else {
                $papel->givePermissionTo($permissoesDoPapel);
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
