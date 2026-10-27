<?php

namespace App\Http\Middleware;

use App\Enums\PermissionEnum;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCanManagePermissions
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(
            $request->user()?->can(PermissionEnum::PermissoesGerenciar->value),
            Response::HTTP_FORBIDDEN,
            'Você não tem permissão para gerenciar acessos.'
        );

        return $next($request);
    }
}
