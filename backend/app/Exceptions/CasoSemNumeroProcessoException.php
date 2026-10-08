<?php

namespace App\Exceptions;

use RuntimeException;

class CasoSemNumeroProcessoException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('O caso não possui um número de processo válido (20 dígitos).');
    }
}