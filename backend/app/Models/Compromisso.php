<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Compromisso extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'titulo',
        'descricao',
        'data',
        'hora',
        'tipo',
        'status',
        'anexo',
    ];

    protected $casts = [
        'data' => 'date:Y-m-d',
    ];

    public function criador()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
