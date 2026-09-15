<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Models\Endereco;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileService
{
    public function getProfile(User $user): array
    {
        return $this->formatProfile($user);
    }

    public function updateProfile(User $user, array $data): array
    {
        return DB::transaction(function () use ($user, $data) {
            $user->update(Arr::only($data, ['name', 'email', 'cpf', 'cor_perfil']));

            foreach (['advogado', 'funcionario'] as $relation) {
                $profile = $user->{$relation};
                if (! $profile || ! isset($data[$relation])) {
                    continue;
                }
                $fields = ['data_nascimento', 'sexo', 'celular', 'resumo_pessoal'];
                if ($relation === 'advogado') {
                    $fields = array_merge($fields, ['oab_numero', 'oab_uf']);
                }
                $profile->update(Arr::only($data[$relation], $fields));
                if ($relation === 'advogado' && array_key_exists('categorias', $data[$relation])) {
                    $profile->categorias()->sync($data[$relation]['categorias'] ?? []);
                }
            }

            if (array_key_exists('endereco', $data)) {
                $profile = $user->funcionario ?? $user->advogado;
                if ($profile) {
                    if ($data['endereco'] === null) {
                        $profile->update(['endereco_id' => null]);
                    } elseif ($profile->endereco) {
                        $profile->endereco->update($data['endereco']);
                    } else {
                        $address = Endereco::create($data['endereco']);
                        $profile->update(['endereco_id' => $address->id]);
                    }
                }
            }

            return $this->formatProfile($user->fresh());
        });
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
        $user->load(['advogado.categorias', 'advogado.endereco', 'funcionario.endereco']);

        return (new UserResource($user))->resolve();
    }
}
