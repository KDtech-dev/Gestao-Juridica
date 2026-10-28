<?php

namespace App\Services;

use Illuminate\Http\Response;

class ResponseService
{
    public static function success($data, ?string $message = null, int $code = 200, $meta = null)
    {
        return response()->json(
            [
                'success' => true,
                'message' => $message,
                'data' => $data,
                'meta' => $meta,
            ],
            $code,
            options: JSON_UNESCAPED_SLASHES
        );
    }

    public static function error(string $message, int $code)
    {
        return response()->json(
            [
                'success' => false,
                'message' => $message,
                'code' => $code,
                'data' => null,
                'meta' => null,
            ],
            $code,
            options: JSON_UNESCAPED_SLASHES
        );
    }

    public static function exception(
        \Throwable $exception,
        ?int $code = null,
        ?string $message = null,
        ?array $errors = null
    ) {
        $status = $code ?? Response::HTTP_INTERNAL_SERVER_ERROR;

        return response()->json(
            [
                'success' => false,
                'message' => $message ?? $exception->getMessage(),
                'code' => $status,
                'errors' => $errors,
                'data' => null,
                'meta' => null,
            ],
            $status
        );
    }
}
