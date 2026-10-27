<?php

namespace App\Enums;

enum PermissionEnum: string
{
    case UsuariosVisualizar = 'usuarios.visualizar';
    case UsuariosCriar = 'usuarios.criar';
    case UsuariosEditar = 'usuarios.editar';
    case UsuariosExcluir = 'usuarios.excluir';

    case ClientesVisualizar = 'clientes.visualizar';
    case ClientesCriar = 'clientes.criar';
    case ClientesEditar = 'clientes.editar';
    case ClientesExcluir = 'clientes.excluir';

    case CasosVisualizar = 'casos.visualizar';
    case CasosCriar = 'casos.criar';
    case CasosEditar = 'casos.editar';
    case CasosExcluir = 'casos.excluir';

    case CompromissosVisualizar = 'compromissos.visualizar';
    case CompromissosCriar = 'compromissos.criar';
    case CompromissosEditar = 'compromissos.editar';
    case CompromissosExcluir = 'compromissos.excluir';

    case PublicacoesVisualizar = 'publicacoes.visualizar';
    case PublicacoesCriar = 'publicacoes.criar';
    case PublicacoesEditar = 'publicacoes.editar';
    case PublicacoesExcluir = 'publicacoes.excluir';

    case NotificacoesVisualizar = 'notificacoes.visualizar';

    case DjenVisualizar = 'djen.visualizar';
    case DjenSincronizar = 'djen.sincronizar';

    /** Permite acesso quando o usuário possui pelo menos uma das permissões. */
    public static function middlewareAny(self ...$permissions): string
    {
        if ($permissions === []) {
            throw new \InvalidArgumentException('Informe ao menos uma permissão.');
        }

        return 'permission:' . implode('|', array_unique(array_map(
            static fn (self $permission): string => $permission->value,
            $permissions,
        )));
    }

    /** Exige todas as permissões, aplicando cada uma como middleware. */
    public static function middlewareAll(self ...$permissions): array
    {
        if ($permissions === []) {
            throw new \InvalidArgumentException('Informe ao menos uma permissão.');
        }

        return array_map(
            static fn (self $permission): string => 'permission:' . $permission->value,
            array_values(array_unique($permissions, SORT_REGULAR)),
        );
    }
}
