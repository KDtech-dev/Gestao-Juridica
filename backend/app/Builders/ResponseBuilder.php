<?php

namespace App\Builders;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ResponseBuilder
{
    protected bool $success = true;
    protected string $message = '';
    protected mixed $data = null;
    protected int $status = 200;

    public function success(): self
    {
        $this->success = true;
        $this->status = SymfonyResponse::HTTP_OK;
        return $this;
    }

    public function error(): self
    {
        $this->success = false;
        $this->status = SymfonyResponse::HTTP_INTERNAL_SERVER_ERROR;
        return $this;
    }

    public function message(string $message): self
    {
        $this->message = $message;
        return $this;
    }

    public function data(mixed $data): self
    {
        $this->data = $data;
        return $this;
    }


    public function status(int $status): self
    {
        if ($status < 100 || $status > 599) {
            $status = $this->success
                ? SymfonyResponse::HTTP_OK
                : SymfonyResponse::HTTP_INTERNAL_SERVER_ERROR;
        }

        $this->status = $status;
        return $this;
    }

    public function send(): JsonResponse
    {
        return response()->json([
            'success' => $this->success,
            'message' => $this->message !== '' ? $this->message : null,
            'data'    => $this->success ? $this->data : null,
            'meta'    => null,
            ...(!$this->success ? ['code' => $this->status] : []),
        ], $this->status, options: JSON_UNESCAPED_SLASHES);
    }
}
