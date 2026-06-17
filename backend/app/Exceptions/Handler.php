<?php

namespace App\Exceptions;

use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;


class Handler extends ExceptionHandler
{
    public function register(): void
    {
        $this->renderable(function (ValidationException $e, Request $request) {
            if (!$request->is('api/*')) return;

            return ResponseService::exception(
                $e,
                Response::HTTP_UNPROCESSABLE_ENTITY,
                $e->getMessage(),
                $e->errors()
            );
        });

        $this->renderable(function (DomainException $e, Request $request) {
            if (!$request->is('api/*')) return;

            if ($e->isError()) {
                return ResponseService::exception(
                    $e,
                    $e->getCode(),
                    $e->getMessage()
                );
            }

            return ResponseService::success(
                [],
                $e->getMessage(),
                $e->getCode()
            );
        });
    }
   
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        return ResponseService::exception(
            $exception,
            Response::HTTP_UNAUTHORIZED,
            'Não autenticado.'
        );
    }
}
