<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Anexo extends Model
{
    use SoftDeletes;

    protected $table = 'anexos';

    protected $fillable = [
        'uuid',
        'publicacao_id',
        'anexavel_id',
        'anexavel_type',
        'descricao',
        'arquivo',
        'nome_arquivo',
        'url',
    ];

    protected static function booted(): void
    {
        static::creating(function (Anexo $anexo): void {
            if (!$anexo->uuid) {
                $anexo->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function publicacao()
    {
        return $this->belongsTo(Publicacao::class);
    }

    public function anexavel()
    {
        return $this->morphTo();
    }

    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $this->exists
                ? route(
                    'posts.anexos.show',
                    ['anexo' => $this->uuid],
                    false
                )
                : $value
        );
    }
}
