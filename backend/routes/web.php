<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\PostController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/posts/anexos/{anexo}', [
    PostController::class,
    'anexo'
])->name('posts.anexos.show');

// API routes moved to routes/api.php to avoid CSRF protection for API clients.
