<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->cpf) {
            $this->merge([
                'cpf' => preg_replace('/\D/', '', $this->cpf),
            ]);
        }
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'cpf' => [
                'nullable',
                'string',
                'size:11',
                Rule::unique('users', 'cpf')->ignore($userId),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'location' => ['nullable', 'string', 'max:255'],
            'oab_number' => ['nullable', 'string', 'max:100'],
            'areas' => ['nullable', 'string'],
            'position' => ['nullable', 'string', 'max:100'],
        ];
    }
}
