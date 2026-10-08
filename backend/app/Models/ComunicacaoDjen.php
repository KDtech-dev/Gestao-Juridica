<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComunicacaoDjen extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'comunicacoes_djen';

    protected $fillable = [
        'djen_id',
        'caso_id',
        'numero_processo',
        'sigla_tribunal',
        'nome_orgao',
        'tipo_comunicacao',
        'data_disponibilizacao',
        'texto',
        'link',
        'payload',
        'lida_em',
    ];

    protected $casts = [
        'payload' => 'array',
        'data_disponibilizacao' => 'date',
        'lida_em' => 'datetime',
    ];

    public function caso(): BelongsTo
    {
        return $this->belongsTo(Caso::class);
    }
}