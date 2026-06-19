<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AuthLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'identifier.required' => 'validation.identifier.required',
            'password.required'   => 'validation.password.required',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $identifier = $this->input('identifier');

            $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
            $cleanCpf = preg_replace('/\D/', '', $identifier);
            $isCpf = preg_match('/^\d{11}$/', $cleanCpf);

            if (!$isEmail && !$isCpf) {
                $validator->errors()->add('identifier', 'validation.identifier.invalid');
            }
        });
    }
}
