<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracaoSistema extends Model
{
    protected $table = 'configuracoes_sistema';
    protected $primaryKey = 'chave';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['chave', 'valor'];
}
