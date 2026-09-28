<?php


class NumeroCnj
{
    private const TJ = [
        '01' => 'AC', '02' => 'AL', '03' => 'AP', '04' => 'AM', '05' => 'BA', '06' => 'CE', '07' => 'DF',
        '08' => 'ES', '09' => 'GO', '10' => 'MA', '11' => 'MT', '12' => 'MS', '13' => 'MG', '14' => 'PA',
        '15' => 'PB', '16' => 'PR', '17' => 'PE', '18' => 'PI', '19' => 'RJ', '20' => 'RN', '21' => 'RS',
        '22' => 'RO', '23' => 'RR', '24' => 'SC', '25' => 'SE', '26' => 'SP', '27' => 'TO',
    ];

    public static function limpar(?string $numero): ?string
    {
        $limpo = preg_replace('/\D/', '', (string) $numero);

        return strlen($limpo) === 20 ? $limpo : null;
    }


    public static function siglaTribunal(?string $numero): ?string
    {
        $limpo = self::limpar($numero);

        if (! $limpo) {
            return null;
        }

        $j = $limpo[13];
        $tr = substr($limpo, 14, 2);

        return match ($j) {
            '8' => isset(self::TJ[$tr]) ? 'TJ'.self::TJ[$tr] : null,
            '4' => (int) $tr >= 1 && (int) $tr <= 6 ? 'TRF'.(int) $tr : null,
            '5' => (int) $tr >= 1 && (int) $tr <= 24 ? 'TRT'.(int) $tr : null,
            default => null,
        };
    }
}