<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\InvalidCurrentPasswordException;
use App\Exceptions\LastAdminException;
use App\Http\Controllers\Controller;
use App\Http\Requests\ResetUserPasswordRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UpdateFotoPerfilRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use App\Services\ProfileColorService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected UserService $userService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'role' => ['sometimes', 'nullable', 'in:admin,advogado,funcionario'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
        ]);
        $users = $this->userService->listar(
            porPagina: (int) ($filters['per_page'] ?? 15),
            excluirUsuarioId: Auth::id(),
            filters: $filters,
        );

        return UserResource::collection($users);
    }

    public function availableColors(\Illuminate\Http\Request $request, ProfileColorService $colors): JsonResponse
    {
        return response()->json([
            'data' => $colors->choices($request->query('exclude_user_id')),
        ]);
    }

    public function show(User $user): UserResource
    {
        $user = $this->userService->buscar($user);

        return new UserResource($user);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->criar($request->validated());

        return (new UserResource($user))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $user = $this->userService->atualizar($user, $request->validated());

        return new UserResource($user);
    }

    public function atualizarFoto(UpdateFotoPerfilRequest $request, User $user): UserResource
    {
        $user = $this->userService->atualizarFotoPerfil($user, $request->file('foto_perfil'));

        return new UserResource($user);
    }

    public function removerFoto(User $user): UserResource
    {
        $user = $this->userService->removerFotoPerfil($user);

        return new UserResource($user);
    }

    public function destroy(User $user)
    {
        try {
            $this->userService->deletar($user);

            return response()->json([
                'message' => 'Usuário removido com sucesso.',
            ]);
        } catch (LastAdminException) {
            return response()->json([
                'error_code' => 'last_admin',
            ], 422);
        }
    }

    public function resetPassword(ResetUserPasswordRequest $request, User $user): JsonResponse
    {
        try {
            $this->userService->resetarSenhaComoAdmin(
                Auth::user(),
                $user,
                $request->validated('admin_password'),
                $request->validated('new_password'),
            );

            return response()->json([
                'message' => 'Senha do usuário atualizada com sucesso.',
            ]);
        } catch (InvalidCurrentPasswordException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
