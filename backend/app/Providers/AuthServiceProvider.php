<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Compromisso;
use App\Policies\CompromissoPolicy;
use App\Policies\RolePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    protected $policies = [
        User::class => RolePolicy::class,
        Compromisso::class => CompromissoPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
