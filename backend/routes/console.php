<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('compromissos:sincronizar-lembretes')
    ->dailyAt(config('compromissos.horario_lembrete_whatsapp'))
    ->timezone(config('app.timezone'))
    ->withoutOverlapping();


Schedule::command('djen:sincronizar')
    ->dailyAt('07:00')
    ->timezone('America/Sao_Paulo')
    ->withoutOverlapping();
