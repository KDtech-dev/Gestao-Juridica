<?php

return [
    'enabled' => (bool) env('WHATSAPP_ENABLED', false),
    'mode' => env('WHATSAPP_MODE', 'simulation'),
    'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
    'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
    'waba_id' => env('WHATSAPP_WABA_ID'),
    // Required explicitly: select a supported version from the Meta dashboard.
    'graph_version' => env('WHATSAPP_GRAPH_VERSION'),
    'app_secret' => env('WHATSAPP_APP_SECRET'),
    'verify_token' => env('WHATSAPP_VERIFY_TOKEN'),
    'test_recipients' => array_values(array_filter(array_map('trim', explode(',', env('WHATSAPP_TEST_RECIPIENTS', ''))))),
    'timezone' => env('WHATSAPP_TIMEZONE', 'America/Sao_Paulo'),
    'daily_time' => env('WHATSAPP_DAILY_TIME', '08:00'),
    'reminder_minutes' => [1440, 60],
    'send_empty_digest' => false,
    'queue' => 'default',
    'diagnostic_template' => env('WHATSAPP_DIAGNOSTIC_TEMPLATE', 'hello_world'),
    // Only configure names AFTER approval in the target WABA. No free-text fallback.
    'templates' => [
        'daily' => ['pt' => env('WHATSAPP_TEMPLATE_DAILY_PT'), 'en' => env('WHATSAPP_TEMPLATE_DAILY_EN'), 'es' => env('WHATSAPP_TEMPLATE_DAILY_ES')],
        'reminder' => ['pt' => env('WHATSAPP_TEMPLATE_REMINDER_PT'), 'en' => env('WHATSAPP_TEMPLATE_REMINDER_EN'), 'es' => env('WHATSAPP_TEMPLATE_REMINDER_ES')],
        'change' => ['pt' => env('WHATSAPP_TEMPLATE_CHANGE_PT'), 'en' => env('WHATSAPP_TEMPLATE_CHANGE_EN'), 'es' => env('WHATSAPP_TEMPLATE_CHANGE_ES')],
    ],
    'languages' => ['pt' => 'pt_BR', 'en' => 'en_US', 'es' => 'es'],
];
