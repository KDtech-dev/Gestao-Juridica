<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacao extends Model
{
    use HasFactory, HasUuids, \Illuminate\Database\Eloquent\SoftDeletes;

    protected $table = 'notificacoes';

    protected $fillable = [
        'usuario_id',
        'compromisso_id',
        'tipo',
        'titulo',
        'mensagem',
        'dados',
        'lida_em',
    ];

    protected $casts = [
        'dados' => 'array',
        'lida_em' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function compromisso()
    {
        return $this->belongsTo(Compromisso::class);
    }
}
