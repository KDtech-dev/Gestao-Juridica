<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class Processo extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'processos';

    protected $fillable = [
        'cliente_id',
        'numero_processo',
        'titulo',
        'descricao',
        'vara',
        'comarca',
        'tribunal',
        'status',
        'data_abertura',
        'data_encerramento',
    ];

    protected $casts = [
        'data_abertura' => 'date',
        'data_encerramento' => 'date',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function anexos()
    {
        return $this->morphMany(Anexo::class, 'anexavel');
    }
}