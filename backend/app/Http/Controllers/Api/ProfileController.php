<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateFotoPerfilRequest;
use App\Http\Requests\UpdateProfilePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\ProfileService;
use App\Services\ResponseService;
use App\Services\UserService;
use App\Services\ProfileColorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        private ProfileService $service
    ) {}

    public function show(Request $request): JsonResponse
    {
        return ResponseService::success([
            'user' => $this->service->getProfile($request->user()),
        ]);
    }

    public function availableColors(Request $request, ProfileColorService $colors): JsonResponse
    {
        return response()->json([
            'data' => $colors->choices($request->user()->id),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        return ResponseService::success(
            [
                'user' => $this->service->updateProfile(
                    $request->user(),
                    $request->validated()
                ),
            ],
            'Perfil atualizado.'
        );
    }

    public function updatePhoto(UpdateFotoPerfilRequest $request, UserService $users): JsonResponse
    {
        $user = $users->atualizarFotoPerfil($request->user(), $request->file('foto_perfil'));

        return ResponseService::success(['user' => $this->service->getProfile($user)]);
    }

    public function updatePassword(
        UpdateProfilePasswordRequest $request
    ): JsonResponse {
        $this->service->updatePassword(
            $request->user(),
            $request->validated()
        );

        return ResponseService::success([], 'Senha atualizada com sucesso.');
    }
}
