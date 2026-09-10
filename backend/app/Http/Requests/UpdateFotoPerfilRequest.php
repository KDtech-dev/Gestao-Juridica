<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFotoPerfilRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'foto_perfil' => ['required', 'image', 'max:5120', 'mimes:jpg,jpeg,png,webp'],
        ];
    }
}