<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Caso extends Model
{
    use HasUuids, SoftDeletes, HasFactory;

    protected $fillable = [
        'numero_processo',
        'titulo',
        'descricao',
        'status',
        'area_direito',
        'data_abertura',
        'data_encerramento',
        'advogado_id',
    ];

    protected $casts = [
        'data_abertura'     => 'date',
        'data_encerramento' => 'date',
    ];

    public function advogado(): BelongsTo
    {
        return $this->belongsTo(User::class, 'advogado_id');
    }

    public function clientes(): BelongsToMany
    {
        return $this->belongsToMany(Cliente::class, 'caso_cliente')
            ->withPivot('papel');
    }

    public function categorias(): BelongsToMany
    {
        return $this->belongsToMany(Categoria::class, 'caso_categoria');
    }
}
