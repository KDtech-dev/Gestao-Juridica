<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CompromissoController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PublicacaoController;
use App\Http\Controllers\Api\CategoriaController;


Route::prefix('auth')->group(function () {

    Route::post('login', [
        AuthController::class,
        'login'
    ]);

    Route::post('forgot-password', [
        PasswordController::class,
        'sendResetLinkEmail'
    ]);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('logout', [
            AuthController::class,
            'logout'
        ]);

        Route::post('refresh', [
            AuthController::class,
            'refresh'
        ]);
    });
});

Route::prefix('posts')->group(function () {

    Route::get('/', [
        PostController::class,
        'index'
    ]);

    Route::get('/{id}', [
        PostController::class,
        'show'
    ]);
});

Route::get('categorias', [
    CategoriaController::class,
    'index'
]);

Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource(
        'publicacoes',
        PublicacaoController::class
    );

    Route::apiResource(
        'compromissos',
        CompromissoController::class
    )->except(['create', 'edit']);


    Route::middleware(
        'role:admin|advogado|funcionario'
    )->group(function () {


        Route::apiResource(
            'clients',
            ClientController::class
        );
    });
});
