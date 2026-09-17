<?php

namespace App\Http\Middleware;

use App\Models\AuditoriaLog;
use Closure;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class RegistrarAuditoria
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->is('api/*') || $request->isMethod('OPTIONS')) {
            return $next($request);
        }
        try {
            $response = $next($request);
        } catch (Throwable $exception) {
            $handler = app(ExceptionHandler::class);
            $handler->report($exception);
            $response = $handler->render($request, $exception);
        }
        $user = $request->attributes->get('auditoria_usuario') ?? $request->user();
        // Anonymous browsing is not user activity; authentication attempts are audited.
        if (! $user && ! $request->is('api/auth/*')) {
            return $response;
        }
        $route = $request->route();
        $uri = $route?->uri() ?? 'api/rota-nao-encontrada';
        $module = explode('/', $uri)[1] ?? 'sistema';
        $action = match (true) {
            $request->is('api/auth/login') => 'login',
            $request->is('api/auth/logout') => 'logout',
            $request->is('api/auth/refresh') => 'renovar_sessao',
            $request->is('api/auth/*password*') => 'recuperar_senha',
            str_contains($uri, 'password') => 'alterar_senha',
            str_ends_with($uri, '/restaurar') => 'restaurar',
            str_ends_with($uri, '/download'), str_ends_with($uri, '/arquivo') => 'baixar_arquivo',
            $request->isMethod('GET'), $request->isMethod('HEAD') => 'consultar',
            $request->isMethod('DELETE') => 'excluir',
            $request->isMethod('PUT'), $request->isMethod('PATCH') => 'alterar',
            default => 'criar',
        };
        $records = [];
        foreach ($route?->parameters() ?? [] as $key => $value) {
            $id = $value instanceof Model ? $value->getKey() : $value;
            if (is_scalar($id) && preg_match('/^(?:[0-9]+|[a-f0-9]{8}-[a-f0-9-]{27})$/i', (string) $id)) {
                $records[$key] = (string) $id;
            }
        }
        if ($request->isMethod('POST') && $response->isSuccessful() && $response instanceof JsonResponse) {
            $body = $response->getData(true);
            $createdId = data_get($body, 'data.id') ?? data_get($body, 'id');
            if (is_scalar($createdId) && preg_match('/^(?:[0-9]+|[a-f0-9]{8}-[a-f0-9-]{27})$/i', (string) $createdId)) {
                $records['criado'] = (string) $createdId;
            }
        }
        $data = [
            'usuario_id' => $user?->id,
            'usuario_nome' => $user?->name,
            'perfis' => $user?->getRoleNames()->all() ?? [],
            'acao' => $action,
            'modulo' => $module,
            'metodo' => $request->method(),
            // Only the route template and record IDs, never URL queries or request bodies.
            'rota' => $uri,
            'registros' => $records,
            'status_http' => $response->getStatusCode(),
            'ocorrido_em' => now(),
        ];
        try {
            AuditoriaLog::create($data);
        } catch (Throwable) {
            // Preserve a restricted fallback record without leaking SQL/bindings or credentials.
            Log::build(['driver' => 'daily', 'path' => storage_path('logs/auditoria-fallback.log'), 'days' => 0])
                ->critical('Falha ao persistir auditoria; recuperar este evento do arquivo de contingência.', $data);
        }

        return $response;
    }
}
