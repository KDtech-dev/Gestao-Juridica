<?php

namespace App\Models;

use App\Enums\StatusPublicacao;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Model;

class Publicacao extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'publicacoes';

    protected $fillable = [
        'titulo',
        'user_id',
        'categoria_id',
        'imagem_caminho',
        'autor',
        'resumo',
        'conteudo',
        'status',
        'publicado_em',
    ];

    protected function casts(): array
    {
        return [
            'status'       => StatusPublicacao::class,
            'publicado_em' => 'datetime',
        ];
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function anexos()
    {
        return $this->hasMany(Anexo::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected function imagemUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->imagem_caminho
                ? Storage::disk('public')->url($this->imagem_caminho)
                : asset('images/publicacao-default.jpg'),
        );
    }
}
