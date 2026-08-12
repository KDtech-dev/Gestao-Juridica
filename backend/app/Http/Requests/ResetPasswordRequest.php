<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token'                 => ['required', 'string'],
            'email'                 => ['required', 'email', 'max:255'],
            'password'              => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'password_confirmation' => ['required'],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required'                 => 'validation.token.required',
            'email.required'                 => 'validation.email.required',
            'email.email'                    => 'validation.email.invalid',
            'password.required'              => 'validation.password.required',
            'password.confirmed'             => 'validation.password_confirmation.same',
            'password_confirmation.required' => 'validation.password_confirmation.required',
        ];
    }
}
