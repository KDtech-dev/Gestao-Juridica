<?php

namespace App\Http\Requests;

use App\Enums\StatusCompromisso;
use App\Enums\TipoCompromisso;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompromissoRequest extends FormRequest
{
   
   public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'data' => ['required', 'date'],
            'hora' => ['nullable'],
            'tipo' => ['required', Rule::enum(TipoCompromisso::class)],
            'status' => ['sometimes', Rule::enum(StatusCompromisso::class)],
            'anexo' => ['nullable', 'file'],
        ];
    }
}
