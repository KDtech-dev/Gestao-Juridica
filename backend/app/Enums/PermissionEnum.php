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
    case PermissoesGerenciar = 'permissoes.gerenciar';

    public function group(): string
    {
        return explode('.', $this->value, 2)[0];
    }

    public function groupLabel(): string
    {
        return match ($this->group()) {
            'usuarios' => 'Usuários',
            'clientes' => 'Clientes',
            'casos' => 'Casos',
            'compromissos' => 'Compromissos',
            'publicacoes' => 'Publicações',
            'notificacoes' => 'Notificações',
            'djen' => 'DJEN',
            'permissoes' => 'Permissões',
            default => 'Outros',
        };
    }

    public function action(): string
    {
        return explode('.', $this->value, 2)[1];
    }

    public function actionLabel(): string
    {
        return match ($this->action()) {
            'visualizar' => 'Visualizar',
            'criar' => 'Criar',
            'editar' => 'Editar',
            'excluir' => 'Excluir',
            'sincronizar' => 'Sincronizar',
            'gerenciar' => 'Gerenciar permissões',
            default => ucfirst($this->action()),
        };
    }

    /** Retorno serializável para catálogo e gerenciamento de acesso. */
    public function toArray(): array
    {
        return [
            'name' => $this->value,
            'group' => $this->group(),
            'group_label' => $this->groupLabel(),
            'action' => $this->action(),
            'action_label' => $this->actionLabel(),
        ];
    }

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
