<?php

return [
    'horario_lembrete_whatsapp' => env('COMPROMISSO_LEMBRETE_HORARIO', '07:00'),
    'mensagem_whatsapp' => [
        'incluir_nome' => true,
        'incluir_tipo' => true,
        'incluir_data' => true,
        'incluir_hora' => true,
    ],
];
