<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncClientesCasoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'clientes'         => 'required|array',
            'clientes.*.id'    => 'required|uuid|exists:clientes,id',
            'clientes.*.papel' => 'nullable|in:autor,réu,interveniente,testemunha',
        ];
    }
}
