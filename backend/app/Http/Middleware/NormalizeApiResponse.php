<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NormalizeApiResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!str_contains((string) $response->headers->get('Content-Type'), 'application/json')) {
            return $response;
        }

        $payload = json_decode((string) $response->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($payload)) {
            return $response;
        }

        $httpSuccess = $response->getStatusCode() >= 200 && $response->getStatusCode() < 300;
        $success = $payload['success'] ?? $httpSuccess;
        if (isset($payload['status']) && !isset($payload['success'])) {
            $success = $payload['status'];
            unset($payload['status']);
        }

        if (!array_key_exists('data', $payload)) {
            $isResponseMetadata = array_diff(
                array_keys($payload),
                ['success', 'message', 'code', 'errors', 'error_code']
            ) === [];

            $payload['data'] = $isResponseMetadata ? null : $payload;
            if (!$isResponseMetadata) {
                foreach (['success', 'message', 'code', 'errors', 'error_code'] as $key) {
                    unset($payload['data'][$key]);
                }
            }
        }

        $payload['success'] = (bool) $success;
        $payload['message'] = isset($payload['message']) && is_string($payload['message'])
            ? $payload['message']
            : null;
        $payload['meta'] ??= null;

        if (!$payload['success']) {
            $payload['code'] ??= $response->getStatusCode();
        }

        $response->headers->remove('Content-Length');
        $response->setContent(json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        return $response;
    }
}
