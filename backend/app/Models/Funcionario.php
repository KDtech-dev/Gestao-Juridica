<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Funcionario extends Model
{
    use HasUuids, HasFactory, SoftDeletes;

    protected $casts = [
        'data_nascimento' => 'date',
    ];

    protected $fillable = [
        'user_id',
        'data_nascimento',
        'sexo',
        'celular',
        'resumo_pessoal',
        'foto_perfil',
        'endereco_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function endereco()
    {
        return $this->belongsTo(Endereco::class);
    }
    protected function fotoPerfisUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->foto_perfil
                ? Storage::url($this->foto_perfil)
                : null,
        );
    }
}
