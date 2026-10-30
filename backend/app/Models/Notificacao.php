<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacao extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'notificacoes';

    protected $fillable = [
        'usuario_id',
        'compromisso_id',
        'tipo',
        'titulo',
        'mensagem',
        'dados',
        'lida_em',
        'whatsapp_enviado_em',
        'whatsapp_enfileirado_em',
        'whatsapp_erro',
        'whatsapp_status',
        'whatsapp_message_id',
        'whatsapp_entregue_em',
        'whatsapp_lido_em',
    ];

    protected $casts = [
        'dados' => 'array',
        'lida_em' => 'datetime',
        'whatsapp_enviado_em' => 'datetime',
        'whatsapp_enfileirado_em' => 'datetime',
        'whatsapp_entregue_em' => 'datetime',
        'whatsapp_lido_em' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function compromisso()
    {
        return $this->belongsTo(Compromisso::class);
    }
}
