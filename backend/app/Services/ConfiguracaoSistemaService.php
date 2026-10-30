<?php

namespace App\Services;

use App\Models\ConfiguracaoSistema;
use App\Models\Notificacao;
use Illuminate\Support\Facades\DB;

class ConfiguracaoSistemaService
{
    private const HORARIO_LEMBRETE_WHATSAPP = 'compromisso_horario_lembrete_whatsapp';
    private const LEMBRETES_WHATSAPP_ATIVOS = 'whatsapp_lembretes_ativos';
    private const OPCOES_MENSAGEM_WHATSAPP = [
        'incluir_nome' => 'whatsapp_mensagem_incluir_nome',
        'incluir_tipo' => 'whatsapp_mensagem_incluir_tipo',
        'incluir_data' => 'whatsapp_mensagem_incluir_data',
        'incluir_hora' => 'whatsapp_mensagem_incluir_hora',
    ];

    public function horarioLembreteWhatsapp(): string
    {
        return ConfiguracaoSistema::query()
            ->whereKey(self::HORARIO_LEMBRETE_WHATSAPP)
            ->value('valor')
            ?? config('compromissos.horario_lembrete_whatsapp', '07:00');
    }

    public function lembretesWhatsappAtivos(): bool
    {
        return ConfiguracaoSistema::query()
            ->whereKey(self::LEMBRETES_WHATSAPP_ATIVOS)
            ->value('valor') !== '0';
    }

    public function atualizarLembretesWhatsappAtivos(bool $ativo): bool
    {
        DB::transaction(function () use ($ativo): void {
            ConfiguracaoSistema::query()->updateOrCreate(
                ['chave' => self::LEMBRETES_WHATSAPP_ATIVOS],
                ['valor' => $ativo ? '1' : '0'],
            );

            if (!$ativo) {
                Notificacao::query()
                    ->where('whatsapp_status', 'queued')
                    ->whereNull('whatsapp_enviado_em')
                    ->update([
                        'whatsapp_status' => 'paused',
                        'whatsapp_enfileirado_em' => null,
                        'whatsapp_erro' => null,
                    ]);
            }
        });

        return $ativo;
    }

    public function atualizarHorarioLembreteWhatsapp(string $horario): string
    {
        ConfiguracaoSistema::query()->updateOrCreate(
            ['chave' => self::HORARIO_LEMBRETE_WHATSAPP],
            ['valor' => $horario],
        );

        return $horario;
    }

    public function opcoesMensagemWhatsapp(): array
    {
        $valores = ConfiguracaoSistema::query()
            ->whereIn('chave', array_values(self::OPCOES_MENSAGEM_WHATSAPP))
            ->pluck('valor', 'chave');

        $padroes = config('compromissos.mensagem_whatsapp', []);

        $opcoes = [];
        foreach (self::OPCOES_MENSAGEM_WHATSAPP as $opcao => $chave) {
            $opcoes[$opcao] = $valores->has($chave)
                ? $valores->get($chave) === '1'
                : (bool) ($padroes[$opcao] ?? true);
        }

        return $opcoes;
    }

    public function atualizarOpcoesMensagemWhatsapp(array $opcoes): array
    {
        DB::transaction(function () use ($opcoes): void {
            foreach (self::OPCOES_MENSAGEM_WHATSAPP as $opcao => $chave) {
                ConfiguracaoSistema::query()->updateOrCreate(
                    ['chave' => $chave],
                    ['valor' => $opcoes[$opcao] ? '1' : '0'],
                );
            }
        });

        return $this->opcoesMensagemWhatsapp();
    }
}
