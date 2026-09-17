<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Exclusao extends Model
{
    use HasUuids;

    protected $table = 'exclusoes';

    protected $guarded = [];

    protected $hidden = ['conteudo'];

    protected function casts(): array
    {
        return [
            'conteudo' => 'encrypted:array',
            'expira_em' => 'datetime',
            'restaurado_em' => 'datetime',
            'eliminado_em' => 'datetime',
        ];
    }
}
