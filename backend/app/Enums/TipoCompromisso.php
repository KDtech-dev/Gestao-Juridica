<?php

namespace App\Enums;

enum TipoCompromisso: string
{
    case COMPROMISSO = 'COMPROMISSO';
    case LEMBRETE = 'LEMBRETE';
    case AUDIENCIA = 'AUDIENCIA';
    case PRAZO = 'PRAZO';
    case REUNIAO = 'REUNIAO';
}