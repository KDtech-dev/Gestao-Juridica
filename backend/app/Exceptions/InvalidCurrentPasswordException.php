<?php

namespace App\Exceptions;

use Exception;

class InvalidCurrentPasswordException extends Exception
{
    public function __construct(string $message = 'Senha atual incorreta.')
    {
        parent::__construct($message);
    }
}