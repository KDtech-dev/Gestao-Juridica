<?php

namespace App\Exceptions;

use Exception;

class WhatsAppEnvioFalhouException extends Exception
{
    public function __construct(string $respostaApi)
    {
        parent::__construct("Falha ao enviar WhatsApp: {$respostaApi}");
    }
}