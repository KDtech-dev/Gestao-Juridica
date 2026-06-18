<?php

namespace App\Exceptions;

use Exception;

class DomainException extends Exception
{
    public function __construct(string $message, int $code, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
