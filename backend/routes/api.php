<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\LawyerController;
use App\Http\Controllers\Api\CaseController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PublicacaoController;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [PasswordController::class, 'sendResetLinkEmail']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
});

Route::middleware(['auth:sanctum', 'role:admin|advogado|funcionario'])->group(function () {
    Route::apiResource('appointments', AppointmentController::class);
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('cases', CaseController::class)->only(['index', 'store', 'show']);
    Route::get('lawyers', [LawyerController::class, 'index']);
});

Route::prefix('posts')->group(function () {
    Route::get('/', [PostController::class, 'index']);
    Route::get('/{id}', [PostController::class, 'show']);
});


Route::middleware('auth:sanctum')
    ->prefix('publicacoes')
    ->group(function () {
        Route::get('/', [PublicacaoController::class, 'index']);
        Route::post('/', [PublicacaoController::class, 'store']);
        Route::get('/{id}', [PublicacaoController::class, 'show']);
        Route::put('/{id}', [PublicacaoController::class, 'update']);
        Route::delete('/{id}', [PublicacaoController::class, 'destroy']);
    });
