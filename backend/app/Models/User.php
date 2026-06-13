<?php

namespace App\Models;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids; // <-- adicionar
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * @method \Laravel\Sanctum\NewAccessToken createToken(string $name, array $abilities = ['*'])
 * @method \Laravel\Sanctum\PersonalAccessToken|null currentAccessToken()
 * @method \Illuminate\Support\Collection getRoleNames()
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, HasUuids;

    protected $guard_name = 'api';

    protected $fillable = [
        'id',
        'name',
        'email',
        'cpf',
        'api_token',
        'password',
        'cor_perfil',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'api_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function getRoleEnumAttribute(): ?RoleEnum
    {
        $roleName = $this->getRoleNames()->first();

        return match ($roleName) {
            'admin'       => RoleEnum::ADMIN,
            'funcionario' => RoleEnum::FUNCIONARIO,
            'advogado'    => RoleEnum::ADVOGADO,
            default       => null,
        };
    }
    public function funcionario()
    {
        return $this->hasOne(Funcionario::class);
    }
    public function advogado()
    {
        return $this->hasOne(Advogado::class);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isFuncionario(): bool
    {
        return $this->hasRole('funcionario');
    }

    public function isAdvogado(): bool
    {
        return $this->hasRole('advogado');
    }

    public function notificacoes()
    {
        return $this->hasMany(Notificacao::class, 'usuario_id');
    }
}
