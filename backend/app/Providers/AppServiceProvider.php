<?php

namespace App\Providers;

use App\Builders\ResponseBuilder;
use App\Builders\UploadBuilder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('api-response', function () {
            return new ResponseBuilder();
        });

        $this->app->singleton('api-upload', function () {
            return new UploadBuilder();
        });
    }

    public function boot(): void
    {
        \App\Models\Compromisso::observe(\App\Observers\WhatsAppCompromissoObserver::class);
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url') . '/reset-password?token=' . $token
                . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
