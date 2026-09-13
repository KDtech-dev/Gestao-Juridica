<?php

namespace App\Exceptions;

use Exception;

class SelfRoleChangeException extends Exception
{
    public function __construct(string $message = 'Você não pode alterar sua própria role.')
    {
        parent::__construct($message);
    }
}