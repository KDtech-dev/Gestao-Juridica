<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PostController;

Route::get('/posts/anexos/{anexo}', [
    PostController::class,
    'anexo'
])->name('posts.anexos.show');