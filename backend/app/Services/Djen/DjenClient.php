<?php

namespace App\Services\Djen;

use App\Exceptions\DjenIndisponivelException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class DjenClient
{
    public function consultar(array $filtros): array
    {
        $resposta = Http::baseUrl(config('services.djen.base_url'))
            ->acceptJson()
            ->timeout(config('services.djen.timeout'))
            ->retry(
                config('services.djen.retry_attempts', 3),
                config('services.djen.retry_delay_ms', 1000),
                when: static fn ($exception): bool => ! $exception instanceof RequestException
                    || $exception->response->status() === 429
                    || $exception->response->serverError(),
                throw: false,
            )
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
