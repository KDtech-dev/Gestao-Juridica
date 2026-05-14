<?php

namespace App\Enums;

enum StatusPublicacao: string
{
    case RASCUNHO   = 'rascunho';
    case PUBLICADO  = 'publicado';
    case ARQUIVADO  = 'arquivado';

    public function label(): string
    {
        return match ($this) {
            self::RASCUNHO  => 'Rascunho',
            self::PUBLICADO => 'Publicado',
            self::ARQUIVADO => 'Arquivado',
        };
    }

    public function isPublicado(): bool
    {
        return $this === self::PUBLICADO;
    }
}
