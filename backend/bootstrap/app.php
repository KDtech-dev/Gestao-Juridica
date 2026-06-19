<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Auth\AuthenticationException;
use App\Providers\ServiceServiceProvider;
use App\Http\Middleware\CorsHeaders;
use App\Http\Middleware\TrustProxies;
use App\Exceptions\DomainException;
use App\Services\ResponseService;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->use([
            TrustProxies::class,
            CorsHeaders::class,
        ]);
        $middleware->alias([
            'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
        $middleware->redirectGuestsTo(fn() => null);
    })
    ->withProviders([
        ServiceServiceProvider::class,
    ])
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (ValidationException $e, Request $request) {
            if (!$request->is('api/*')) return;
            return ResponseService::exception(
                $e,
                Response::HTTP_UNPROCESSABLE_ENTITY,
                $e->getMessage(),
                $e->errors()
            );
        });

        $exceptions->renderable(function (DomainException $e, Request $request) {
            if (!$request->is('api/*')) return;
            $code = $e->getCode() >= 400 && $e->getCode() < 600
                ? $e->getCode()
                : Response::HTTP_BAD_REQUEST;
            return ResponseService::exception($e, $code, $e->getMessage());
        });

        $exceptions->renderable(function (ModelNotFoundException $e, Request $request) {
            if (!$request->is('api/*')) return;
            return ResponseService::exception($e, Response::HTTP_NOT_FOUND, 'Recurso não encontrado.');
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if (!$request->is('api/*') && !$request->expectsJson()) {
                return redirect()->guest(route('login'));
            }
            return ResponseService::exception($e, Response::HTTP_UNAUTHORIZED, 'Não autenticado.');
        });
    })
    ->create();
