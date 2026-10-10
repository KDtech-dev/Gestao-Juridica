<?php

namespace App\Services\WhatsApp;

use Illuminate\Validation\ValidationException;

class Phone
{
    public static function normalize(string $phone): string
    {
        $phone = preg_replace('/[\s().-]/', '', trim($phone));
        if (! preg_match('/^\+[1-9][0-9]{7,14}$/D', $phone)) {
            throw ValidationException::withMessages(['phone' => 'Informe o número internacional com + e código do país.']);
        }

        return $phone;
    }

    public static function allowed(string $phone): bool
    {
        foreach (config('whatsapp.test_recipients', []) as $allowed) {
            try {
                if (self::normalize($allowed) === $phone) {
                    return true;
                }
            } catch (ValidationException) { /* Invalid entries never authorize a recipient. */
            }
        }

        return false;
    }
}
