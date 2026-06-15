<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use HasUuids, SoftDeletes, HasFactory;

    protected $table = 'clientes';

    protected $fillable = [
        'name',
        'cpf_cnpj',
        'email',
        'telefone',
        'endereco_id',
        'data_nascimento',
        'foto_perfil',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
    ];

    public function endereco()
    {
        return $this->belongsTo(Endereco::class);
    }

    public function processos()
    {
        return $this->hasMany(Processo::class);
    }

    public function anexos()
    {
        return $this->morphMany(Anexo::class, 'anexavel');
    }

    public function casos(): BelongsToMany
    {
        return $this->belongsToMany(Caso::class, 'caso_cliente')
            ->withPivot('papel');
    }
}
