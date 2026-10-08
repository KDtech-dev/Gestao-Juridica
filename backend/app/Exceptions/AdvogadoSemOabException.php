<?php

namespace App\Exceptions;

use RuntimeException;

class AdvogadoSemOabException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('O advogado não possui número de OAB e UF cadastrados.');
    }
}
