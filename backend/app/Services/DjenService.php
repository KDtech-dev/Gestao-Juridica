<?php

namespace App\Services;

use App\Exceptions\AdvogadoSemOabException;
use App\Exceptions\CasoSemNumeroProcessoException;
use App\Models\Advogado;
use App\Models\Caso;
use App\Models\ComunicacaoDjen;
use App\Services\Djen\DjenClient;
use Carbon\Carbon;
use NumeroCnj as GlobalNumeroCnj;

class DjenService
{
    private const MAX_PAGINAS = 20;

    private const SUFIXOS_OAB = ['', 'A', 'B', 'O'];

    public function __construct(private DjenClient $client) {}



    public function sincronizarCaso(Caso $caso, ?Carbon $desde = null): int
    {
        $numero = $caso->numero_processo_limpo;

        if (! $numero) {
            throw new CasoSemNumeroProcessoException;
        }

        $filtros = array_filter([
            'numeroProcesso' => $numero,
            'siglaTribunal' => GlobalNumeroCnj::siglaTribunal($numero),
            'dataDisponibilizacaoInicio' => $desde?->format('Y-m-d'),
            'itensPorPagina' => config('services.djen.per_page'),
        ]);

        return $this->buscarEGravar($filtros, $caso);
    }

    private function buscarEGravar(array $filtros, ?Caso $caso = null): int
    {
        $total = 0;
        $porPagina = (int) config('services.djen.per_page');

        for ($pagina = 1; $pagina <= self::MAX_PAGINAS; $pagina++) {
            $resposta = $this->client->consultar($filtros + ['pagina' => $pagina]);
            $itens = $resposta['items'] ?? [];

            foreach ($itens as $item) {
                $this->gravar($item, $caso);
                $total++;
            }

            if (count($itens) < $porPagina) {
                break;
            }

            usleep(500_000);
        }

        return $total;
    }

    private function gravar(array $item, ?Caso $caso): ComunicacaoDjen
    {
        $dados = $this->mapear($item);

        $dados['caso_id'] = $caso?->id
            ?? ($dados['numero_processo']
                ? Caso::where('numero_processo_limpo', $dados['numero_processo'])->value('id')
                : null);


        return ComunicacaoDjen::withTrashed()->updateOrCreate(
            ['djen_id' => $dados['djen_id']],
            $dados
        );
    }


    private function mapear(array $item): array
    {
        return [
            'djen_id' => (string) ($item['id'] ?? $item['hash']),
            'numero_processo' => GlobalNumeroCnj::limpar($item['numero_processo'] ?? $item['numeroprocessocommascara'] ?? null),
            'sigla_tribunal' => $item['siglaTribunal'] ?? null,
            'nome_orgao' => $item['nomeOrgao'] ?? null,
            'tipo_comunicacao' => $item['tipoComunicacao'] ?? null,
            'data_disponibilizacao' => $this->parseData($item['data_disponibilizacao'] ?? $item['datadisponibilizacao'] ?? null),
            'texto' => $item['texto'] ?? null,
            'link' => $item['link'] ?? null,
            'status_djen' => $item['status'] ?? null,
            'motivo_cancelamento' => $item['motivo_cancelamento'] ?? null,
            'data_cancelamento' => $this->parseData($item['data_cancelamento'] ?? null),
            'payload' => $item,
        ];
    }

    private function parseData(?string $valor): ?string
    {
        if (! $valor) {
            return null;
        }

        try {
            $data = str_contains($valor, '/')
                ? Carbon::createFromFormat('d/m/Y', substr($valor, 0, 10))
                : Carbon::parse($valor);

            return $data->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }

    public function sincronizarAdvogado(Advogado $advogado, ?Carbon $desde = null): int
    {
        $numero = preg_replace('/\D/', '', (string) $advogado->oab_numero);

        if (! $numero || ! $advogado->oab_uf) {
            throw new AdvogadoSemOabException;
        }

        $total = 0;

        foreach (self::SUFIXOS_OAB as $sufixo) {
            $filtros = array_filter([
                'numeroOab' => $sufixo ? "{$numero}-{$sufixo}" : $numero,
                'ufOab' => $advogado->oab_uf,
                'dataDisponibilizacaoInicio' => $desde?->format('Y-m-d'),
                'itensPorPagina' => config('services.djen.per_page'),
            ]);

            $total += $this->buscarEGravar($filtros);

            usleep(500_000);
        }

        return $total;
    }
}
