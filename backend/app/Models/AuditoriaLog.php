<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditoriaLog extends Model
{
    protected $table = 'auditoria_logs';

    public $timestamps = false;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['id' => 'string', 'perfis' => 'array', 'registros' => 'array', 'ocorrido_em' => 'datetime'];
    }
}
