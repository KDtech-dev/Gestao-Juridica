<?php

namespace App\Enums;

enum RoleEnum: string
{
    case ADMIN = 'admin';
    case ADVOGADO = 'advogado';
    case FUNCIONARIO = 'funcionario';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Administrador',
            self::ADVOGADO => 'Advogado',
            self::FUNCIONARIO => 'Funcionário',
        };
    }
}
