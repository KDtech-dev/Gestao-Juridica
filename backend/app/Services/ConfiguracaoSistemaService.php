<?php

namespace App\Services;

use App\Models\ConfiguracaoSistema;

class ConfiguracaoSistemaService
{
    private const HORARIO_LEMBRETE_WHATSAPP = 'compromisso_horario_lembrete_whatsapp';

    public function horarioLembreteWhatsapp(): string
    {
        return ConfiguracaoSistema::query()
            ->whereKey(self::HORARIO_LEMBRETE_WHATSAPP)
            ->value('valor')
            ?? config('compromissos.horario_lembrete_whatsapp', '07:00');
    }

    public function atualizarHorarioLembreteWhatsapp(string $horario): string
    {
        ConfiguracaoSistema::query()->updateOrCreate(
            ['chave' => self::HORARIO_LEMBRETE_WHATSAPP],
            ['valor' => $horario],
        );

        return $horario;
    }
}
