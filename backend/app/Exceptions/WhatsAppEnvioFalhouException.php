<?php

namespace App\Exceptions;

use Exception;

class WhatsAppEnvioFalhouException extends Exception
{
    public function __construct(
        string $respostaApi,
        public readonly bool $retryable = true,
        public readonly ?int $httpStatus = null,
    ) {
        parent::__construct("Falha ao enviar WhatsApp: {$respostaApi}");
    }
}
