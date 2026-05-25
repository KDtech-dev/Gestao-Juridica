<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\CompromissoController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PublicacaoController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\NotificacaoController;


Route::prefix('auth')->group(function () {
    Route::post('login',          [AuthController::class, 'login']);
    Route::post('forgot-password',[PasswordController::class, 'sendResetLinkEmail']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
});

Route::get('categorias', [CategoriaController::class, 'index']);

Route::prefix('posts')->group(function () {
    Route::get('/',                        [PostController::class, 'index']);
    Route::get('/{post}',                  [PostController::class, 'show']);
    Route::get('/{post}/anexos/{anexo}',   [PostController::class, 'anexo'])->name('api.posts.anexos.show');
});

Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('profile')->group(function () {
        Route::get('/',         [ProfileController::class, 'show']);
        Route::put('/',         [ProfileController::class, 'update']);
        Route::put('/password', [ProfileController::class, 'updatePassword']);
    });

    Route::prefix('clientes')->group(function () {
        Route::get('/',               [ClienteController::class, 'index']);
        Route::post('/',              [ClienteController::class, 'store']);
        Route::get('/{cliente}',      [ClienteController::class, 'show']);
        Route::put('/{cliente}',      [ClienteController::class, 'update']);
        Route::delete('/{cliente}',   [ClienteController::class, 'destroy']);
    });

    Route::prefix('publicacoes')->group(function () {
        Route::get('/',                  [PublicacaoController::class, 'index'])->name('publicacoes.index');
        Route::post('/',                 [PublicacaoController::class, 'store'])->name('publicacoes.store');
        Route::get('/{publicacao}',      [PublicacaoController::class, 'show'])->name('publicacoes.show');
        Route::put('/{publicacao}',      [PublicacaoController::class, 'update'])->name('publicacoes.update');
        Route::delete('/{publicacao}',   [PublicacaoController::class, 'destroy'])->name('publicacoes.destroy');
    });

    Route::prefix('compromissos')->group(function () {
        Route::get('/',                   [CompromissoController::class, 'index'])->name('compromissos.index');
        Route::post('/',                  [CompromissoController::class, 'store'])->name('compromissos.store');
        Route::get('/{compromisso}',      [CompromissoController::class, 'show'])->name('compromissos.show');
        Route::put('/{compromisso}',      [CompromissoController::class, 'update'])->name('compromissos.update');
        Route::delete('/{compromisso}',   [CompromissoController::class, 'destroy'])->name('compromissos.destroy');
    });

    Route::prefix('notificacoes')->group(function () {
        Route::get('/',                        [NotificacaoController::class, 'index']);
        Route::patch('/lidas',                 [NotificacaoController::class, 'marcarTodasComoLidas']);
        Route::patch('/{notificacao}/lida',    [NotificacaoController::class, 'marcarComoLida']);
        Route::delete('/',                     [NotificacaoController::class, 'limpar']);
    });
});