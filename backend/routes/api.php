<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\PublicationController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\LawyerController;
use App\Http\Controllers\Api\CaseController;


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

Route::middleware(['auth:sanctum', 'role:admin|advogado|funcionario'])->group(function () {
    Route::apiResource('appointments', AppointmentController::class);
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('cases', CaseController::class)->only(['index', 'store', 'show']);
    Route::get('lawyers', [LawyerController::class, 'index']);
});

// 🌍 ROTAS PÚBLICAS (SEM LOGIN)
Route::get('posts', [PublicationController::class, 'index']);
Route::get('posts/{slug}', [PublicationController::class, 'show']);
