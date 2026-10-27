<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $catalogo = [
            'usuarios.visualizar',
            'usuarios.criar',
            'usuarios.editar',
            'usuarios.excluir',
            'clientes.visualizar',
            'clientes.criar',
            'clientes.editar',
            'clientes.excluir',
            'casos.visualizar',
            'casos.criar',
            'casos.editar',
            'casos.excluir',
            'compromissos.visualizar',
            'compromissos.criar',
            'compromissos.editar',
            'compromissos.excluir',
            'publicacoes.visualizar',
            'publicacoes.criar',
            'publicacoes.editar',
            'publicacoes.excluir',
            'notificacoes.visualizar',
            'djen.visualizar',
            'djen.sincronizar',
        ];

        $permissoes = collect($catalogo)
            ->mapWithKeys(fn (string $nome) => [
                $nome => Permission::firstOrCreate([
                    'name' => $nome,
                    'guard_name' => 'api',
                ]),
            ]);

        $permissoesPorPapel = [
            'admin' => $catalogo,
            'advogado' => [
                'clientes.visualizar', 'clientes.criar', 'clientes.editar',
                'casos.visualizar', 'casos.criar', 'casos.editar',
                'compromissos.visualizar', 'compromissos.criar', 'compromissos.editar',
                'publicacoes.visualizar', 'publicacoes.criar', 'publicacoes.editar',
                'notificacoes.visualizar', 'djen.visualizar', 'djen.sincronizar',
            ],
            'funcionario' => [
                'clientes.visualizar', 'clientes.criar', 'clientes.editar',
                'casos.visualizar', 'casos.criar', 'casos.editar',
                'compromissos.visualizar', 'compromissos.criar', 'compromissos.editar',
                'publicacoes.visualizar', 'publicacoes.criar', 'publicacoes.editar',
                'notificacoes.visualizar', 'djen.visualizar',
            ],
            'cliente' => [],
        ];

        foreach ($permissoesPorPapel as $nomePapel => $nomesPermissoes) {
            $papel = Role::firstOrCreate([
                'name' => $nomePapel,
                'guard_name' => 'api',
            ]);

            $papel->syncPermissions($permissoes->only($nomesPermissoes)->values());
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}