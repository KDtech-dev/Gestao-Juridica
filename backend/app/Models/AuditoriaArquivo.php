<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditoriaArquivo extends Model
{
    use HasUuids;

    protected $table = 'auditoria_arquivos';

    public $timestamps = false;

    protected $guarded = [];

    protected $hidden = ['caminho'];

    protected function casts(): array
    {
        return ['inicio_em' => 'datetime', 'fim_em' => 'datetime', 'criado_em' => 'datetime'];
    }
}
