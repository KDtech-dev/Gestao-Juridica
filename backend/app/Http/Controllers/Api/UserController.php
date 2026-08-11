<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\LastAdminException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;


class UserController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected UserService $userService) {}


    public function index(): AnonymousResourceCollection
    {
        $users = $this->userService->listar();

        return UserResource::collection($users);
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
}
