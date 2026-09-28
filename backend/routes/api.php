<?php

use App\Http\Controllers\Api\AdvogadoPublicoController;
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
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CasoController;
use App\Http\Controllers\Api\AnexoController;
use App\Http\Controllers\Api\ComunicacaoDjenController;
use App\Http\Controllers\Auth\PasswordResetController;

Route::prefix('auth')->group(function () {
    Route::post('login',          [AuthController::class, 'login']);
    Route::post('forgot-password', [PasswordController::class, 'sendResetLinkEmail']);
    Route::post('reset-password', [PasswordResetController::class, 'reset']);


    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
});

Route::get('categorias', [CategoriaController::class, 'index']);
Route::get('/advogados', [AdvogadoPublicoController::class, 'index']);



Route::prefix('posts')->group(function () {
    Route::get('/',                          [PostController::class, 'index']);
    Route::get('/{post}',                    [PostController::class, 'show']);
    Route::get('/{post}/anexos/{anexo}',              [PostController::class, 'anexo'])->name('api.posts.anexos.show'); // visualizar
    Route::get('/{post}/anexos/{anexo}/download',     [PostController::class, 'anexoDownload'])->name('api.posts.anexos.download');
});

Route::middleware('auth:sanctum')->group(function () {

    Route::put('/profile/password', [UserController::class, 'updateOwnPassword']);
    Route::put('/users/{user}/reset-password', [UserController::class, 'resetPassword'])
        ->middleware('role:admin');

    Route::get('/anexos/{anexo}/visualizar', [AnexoController::class, 'visualizar']);
    Route::get('/anexos/{anexo}/download', [AnexoController::class, 'download']);

    Route::prefix('profile')->group(function () {
        Route::get('/',         [ProfileController::class, 'show']);
        Route::post('/foto', [ProfileController::class, 'updatePhoto']);
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

        Route::get('/',                [PublicacaoController::class, 'index']);
        Route::post('/',               [PublicacaoController::class, 'store']);
        Route::get('/{publicacao}',    [PublicacaoController::class, 'show']);
        Route::put('/{publicacao}',    [PublicacaoController::class, 'update']);
        Route::delete('/{publicacao}', [PublicacaoController::class, 'destroy']);

        Route::prefix('{publicacao}/anexos')->group(function () {
            Route::get('/',           [PublicacaoController::class, 'indexAnexos']);
            Route::post('/',          [PublicacaoController::class, 'storeAnexo']);
            Route::delete('/{anexo}', [PublicacaoController::class, 'destroyAnexo']);
        });

        Route::post(
            '/{publicacao}/banner',
            [PublicacaoController::class, 'storeBanner']
        );
    });

    Route::prefix('comunicacoes-djen')->group(function () {
        Route::get('/', [ComunicacaoDjenController::class, 'index'])
            ->middleware('permission:djen.visualizar');
        Route::get('{comunicacaoDjen}', [ComunicacaoDjenController::class, 'show'])
            ->middleware('permission:djen.visualizar');
        Route::patch('{comunicacaoDjen}/lida', [ComunicacaoDjenController::class, 'marcarLida'])
            ->middleware('permission:djen.visualizar');
        Route::post('{comunicacaoDjen}/vincular', [ComunicacaoDjenController::class, 'vincular'])
            ->middleware('permission:djen.visualizar');
    });

    Route::prefix('advogados')->group(function () {
        Route::post('/{advogado}/sincronizar-djen', [ComunicacaoDjenController::class, 'sincronizarAdvogado'])
            ->middleware(['permission:djen.sincronizar', 'throttle:6,1']);
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

    Route::prefix('users')->middleware('role:admin')->group(function () {
        Route::get('/',               [UserController::class, 'index']);
        Route::post('/',              [UserController::class, 'store']);
        Route::get('/{user}',        [UserController::class, 'show']);
        Route::put('/{user}',        [UserController::class, 'update']);
        Route::delete('/{user}',     [UserController::class, 'destroy']);

        Route::post('{user}/foto', [UserController::class, 'atualizarFoto']);
        Route::delete('{user}/foto', [UserController::class, 'removerFoto']);
    });

    Route::prefix('casos')->group(function () {
        Route::get('/',            [CasoController::class, 'index']);
        Route::post('/',           [CasoController::class, 'store']);
        Route::get('/{caso}',      [CasoController::class, 'show']);
        Route::put('/{caso}',      [CasoController::class, 'update']);
        Route::delete('/{caso}',   [CasoController::class, 'destroy']);

        Route::post('/{caso}/sincronizar-djen', [ComunicacaoDjenController::class, 'sincronizarCaso'])
            ->middleware(['permission:djen.sincronizar', 'throttle:6,1']);

        Route::prefix('{caso}/clientes')->group(function () {
            Route::post('/',             [CasoController::class, 'attachClientes']);
            Route::put('/',              [CasoController::class, 'syncClientes']);
            Route::delete('/{cliente}',  [CasoController::class, 'detachCliente']);
        });
        Route::get(
            '/{caso}/anexos/{anexo}',
            [CasoController::class, 'visualizarAnexo']
        );

        Route::get(
            '/{caso}/anexos/{anexo}/download',
            [CasoController::class, 'downloadAnexo']
        );
    });
});
