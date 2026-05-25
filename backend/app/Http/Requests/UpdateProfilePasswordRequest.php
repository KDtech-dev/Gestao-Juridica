<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfilePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6'],
            'confirm_password' => ['required', 'same:new_password'],
        ];
    }

    public function messages(): array
    {
        return [
            'confirm_password.same' => 'As senhas precisam ser iguais.',
        ];
    }
}
