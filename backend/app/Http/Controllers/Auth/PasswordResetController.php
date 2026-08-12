<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function sendResetLink(ForgotPasswordRequest $request)
    {
        Password::sendResetLink($request->only('email'));

        return response()->json([
            'success' => true,
            'message' => 'auth.forgotPassword.success',
        ]);
    }

    public function reset(ResetPasswordRequest $request)
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'auth.resetPassword.success',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $this->mapStatusToKey($status),
        ], 400);
    }

    private function mapStatusToKey(string $status): string
    {
        return match ($status) {
            Password::INVALID_TOKEN => 'auth.resetPassword.invalidToken',
            Password::INVALID_USER  => 'auth.resetPassword.invalidUser',
            Password::RESET_THROTTLED => 'auth.resetPassword.throttled',
            default => 'auth.resetPassword.error',
        };
    }
}
