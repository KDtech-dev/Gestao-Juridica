<?php

namespace App\Exceptions;

use RuntimeException;

class DjenIndisponivelException extends RuntimeException
{
    public static function bloqueioGeografico(): self
    {
        return new self('O DJEN recusou a requisição (403). Verifique se o servidor está em região brasileira.');
    }

    public static function falhaHttp(int $status): self
    {
        return new self("O DJEN respondeu com erro HTTP {$status}.");
    }
}