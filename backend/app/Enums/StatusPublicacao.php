<?php

namespace App\Enums;

enum StatusPublicacao: string
{
    case Rascunho   = 'rascunho';
    case Publicado  = 'publicado';
    case Arquivado  = 'arquivado';

    public function label(): string
    {
        return match ($this) {
            self::Rascunho  => 'Rascunho',
            self::Publicado => 'Publicado',
            self::Arquivado => 'Arquivado',
        };
    }

    public function isPublicado(): bool
    {
        return $this === self::Publicado;
    }
}
