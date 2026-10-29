<?php

namespace App\Exceptions;

use RuntimeException;

class DjenPageLimitReachedException extends RuntimeException
{
    public static function forLimit(int $limit): self
    {
        return new self("O DJEN atingiu o limite configurado de {$limit} páginas. A execução foi interrompida sem avançar o checkpoint; aumente DJEN_MAX_PAGES e tente novamente.");
    }
}
