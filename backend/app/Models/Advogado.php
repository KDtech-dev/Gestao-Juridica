<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Advogado extends Model
{
    use HasUuids;
protected $fillable = [
    'user_id',
    'data_nascimento',
    'sexo',
    'celular',
    'resumo_pessoal',
    'foto_perfil',
    'oab_numero',
    'oab_uf',
    'endereco_id',
];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

  protected function casts(): array
{
    return [
        'data_nascimento' => 'date',
    ];
}
  public function endereco()
    {
        return $this->belongsTo(Endereco::class);
    }

    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'advogado_categoria');
    }
    protected function fotoPerfilUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->foto_perfil
                ? Storage::url($this->foto_perfil)
                : null,
        );
    }
}
