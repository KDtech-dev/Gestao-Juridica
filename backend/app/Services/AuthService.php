<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService implements IAuthService
{
    public function __construct(private readonly ActivityLogger $activityLogger) {}

    /**
     * @param array{email:string,password:string,cpf:string} $credentials
     */
    public function login(array $credentials): array
    {
        $identifier = $credentials['identifier'] ?? null;

        if (!$identifier) {
            throw ValidationException::withMessages([
                'login' => 'Informe CPF ou e-mail.',
            ]);
        }

        $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'cpf';
        $user = User::where($field, $identifier)->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'login' => 'Credenciais inválidas.',
            ]);
        }

        if ($user->is_active === false) {
            throw ValidationException::withMessages([
                'login' => 'Usuário inativo.',
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;
        $this->activityLogger->record('signed_in', 'auth', $user, actor: $user);

        return [
            'token' => $token,
            'user'  => new UserResource($user),
        ];
    }

    public function logout(string $token): void
    {
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            throw new AuthenticationException('Não autenticado');
        }

        if ($accessToken->tokenable instanceof User) {
            $this->activityLogger->record('signed_out', 'auth', $accessToken->tokenable, actor: $accessToken->tokenable);
        }

        $accessToken->delete();
    }

    /**
     * @return array{token:string,user:UserResource}
     */
    public function refresh(string $token): array
    {
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            throw new AuthenticationException('Não autenticado');
        }

        $user = $accessToken->tokenable;
        $accessToken->delete();

        $newToken = $user->createToken('api-token')->plainTextToken;

        return [
            'token' => $newToken,
            'user'  => new UserResource($user),
        ];
    }
}
