<?php

namespace App\Exceptions;

use Exception;

class LastAdminException extends Exception
{
    public function __construct(string $message = "Este usuário é o único administrador do sistema.")
    {
        parent::__construct($message);
    }
}