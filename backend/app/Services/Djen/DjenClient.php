<?php

namespace App\Services\Djen;

use App\Exceptions\DjenIndisponivelException;
use Illuminate\Support\Facades\Http;

class DjenClient
{
    public function consultar(array $filtros): array
    {
        $resposta = Http::baseUrl(config('services.djen.base_url'))
            ->acceptJson()
            ->timeout(config('services.djen.timeout'))
            ->retry(3, 1000, throw: false)
            ->get('/comunicacao', $filtros);

        if ($resposta->status() === 403) {
            throw DjenIndisponivelException::bloqueioGeografico();
        }

        if ($resposta->failed()) {
            throw DjenIndisponivelException::falhaHttp($resposta->status());
        }

        return $resposta->json() ?? [];
    }
}
