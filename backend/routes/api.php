<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\PublicationController;


Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [PasswordController::class, 'sendResetLinkEmail']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('usuarios', UsuarioController::class);

    // 🔐 PUBLICAÇÕES (APENAS ADMIN)
    Route::post('posts', [PublicationController::class, 'store']);
    Route::put('posts/{id}', [PublicationController::class, 'update']);
    Route::delete('posts/{id}', [PublicationController::class, 'destroy']);
});

// 🌍 ROTAS PÚBLICAS (SEM LOGIN)
Route::get('posts', [PublicationController::class, 'index']);
Route::get('posts/{slug}', [PublicationController::class, 'show']);