<?php

namespace App\Providers;

use App\Models\Caso;
use App\Models\Cliente;
use App\Models\Compromisso;
use App\Models\Advogado;
use App\Models\Funcionario;
use App\Models\Publicacao;
use App\Models\User;
use App\Observers\AuditableObserver;
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
        foreach ([User::class, Advogado::class, Funcionario::class, Cliente::class, Caso::class, Compromisso::class, Publicacao::class] as $model) {
            $model::observe(AuditableObserver::class);
        }

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url') . '/reset-password?token=' . $token
                . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
