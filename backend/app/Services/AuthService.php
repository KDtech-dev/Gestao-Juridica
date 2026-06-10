<?php
namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService implements IAuthService
{
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

        return [
            'token' => $token,
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ],
        ];
    }

    public function logout(string $token): void
    {
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            throw new AuthenticationException('Não autenticado');
        }

        $accessToken->delete();
    }

    /**
     * @return array{token:string,user:array{id:int,name:string,email:string}}
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
            'user'  => $user->only(['id', 'name', 'email']),
        ];
    }
}