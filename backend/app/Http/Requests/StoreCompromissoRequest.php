<?php

namespace App\Http\Requests;

use App\Enums\StatusCompromisso;
use App\Enums\TipoCompromisso;
use Carbon\CarbonImmutable;
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
            'starts_at' => ['nullable', 'date'],
            'tipo' => ['required', Rule::enum(TipoCompromisso::class)],
            'status' => ['sometimes', Rule::enum(StatusCompromisso::class)],
            'anexo' => ['nullable', 'file'],
            'user_id' => ['nullable', 'string', 'uuid', 'exists:users,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $startsAt = $this->input('starts_at', $this->input('startsAt'));

        if (!$startsAt) {
            return;
        }

        $dataHora = CarbonImmutable::parse($startsAt);

        $this->merge([
            'data' => $dataHora->toDateString(),
            'hora' => $dataHora->format('H:i'),
        ]);
    }
}
