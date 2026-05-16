<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Anexo extends Model
{
    use SoftDeletes;

    protected $table = 'anexos';

    protected $fillable = [
        'publicacao_id',
        'descricao',
        'arquivo',
        'nome_arquivo',
        'url',
    ];

    public function publicacao()
    {
        return $this->belongsTo(Publicacao::class);
    }
}
