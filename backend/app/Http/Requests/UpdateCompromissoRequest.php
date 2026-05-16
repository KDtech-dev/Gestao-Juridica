<?php

namespace App\Http\Requests;

use App\Enums\StatusCompromisso;
use App\Enums\TipoCompromisso;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompromissoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['sometimes', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'data' => ['sometimes', 'date'],
            'hora' => ['nullable'],
            'tipo' => ['sometimes', Rule::enum(TipoCompromisso::class)],
            'status' => ['sometimes', Rule::enum(StatusCompromisso::class)],
            'anexo' => ['nullable', 'file'],
        ];
    }
}
