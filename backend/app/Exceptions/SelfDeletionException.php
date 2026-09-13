<?php

namespace App\Exceptions;

use Exception;

class SelfDeletionException extends Exception
{
    public function __construct(string $message = 'Você não pode excluir sua própria conta.')
    {
        parent::__construct($message);
    }
}