<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class ProfileService
{
    public function getProfile(User $user): array
    {
        return $this->formatProfile($user);
    }

    public function updateProfile(User $user, array $data): array
    {
        $data = array_filter(
            $data,
            fn ($value) => $value !== null
        );

        $allowedColumns = array_filter(
            array_keys($data),
            fn (string $column) => Schema::hasColumn('users', $column)
        );

        $user->fill(array_intersect_key($data, array_flip($allowedColumns)));
        $user->save();

        return $this->formatProfile($user->fresh());
    }

    public function updatePassword(User $user, array $data): void
    {
        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'A senha atual está incorreta.',
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($data['new_password']),
        ])->save();
    }

    private function formatProfile(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'cpf' => $user->cpf,
            'roles' => $user->getRoleNames(),
        ];
    }
}
