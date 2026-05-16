<?php

namespace App\Enums;

enum StatusCompromisso: string
{
    case PENDENTE = 'PENDENTE';
    case CONCLUIDO = 'CONCLUIDO';
    case CANCELADO = 'CANCELADO';
}