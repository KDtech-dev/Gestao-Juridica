<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Advogado extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
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

    public function endereco()
    {
        return $this->belongsTo(Endereco::class);
    }

    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'advogado_categoria');
    }
}