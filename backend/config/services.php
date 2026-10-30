<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'translate' => [
        // e.g. https://libretranslate.com/translate or your own instance.
        'url' => env('TRANSLATION_API_URL', ''),
        // Optional api key if your provider requires it.
        'key' => env('TRANSLATION_API_KEY', ''),
    ],
    'baileys' => [
        'url' => env('BAILEYS_SERVICE_URL', 'http://127.0.0.1:3100'),
        'token' => env('BAILEYS_SERVICE_TOKEN'),
    ],
    'djen' => [
        'base_url' => env('DJEN_BASE_URL', 'https://comunicaapi.pje.jus.br/api/v1'),
        'timeout' => env('DJEN_TIMEOUT', 20),
        'per_page' => (int) env('DJEN_PER_PAGE', 50),
        'max_pages' => (int) env('DJEN_MAX_PAGES', 20),
        'page_delay_us' => (int) env('DJEN_PAGE_DELAY_US', 500000),
        'retry_attempts' => (int) env('DJEN_RETRY_ATTEMPTS', 3),
        'retry_delay_ms' => (int) env('DJEN_RETRY_DELAY_MS', 1000),
    ],

];
