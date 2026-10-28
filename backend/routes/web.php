<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use App\Http\Controllers\Api\PostController;

Route::get('/posts/anexos/{anexo}', [
    PostController::class,
    'anexo'
])->name('posts.anexos.show');

Route::get('/api/docs', function () {
    $markdown = file_get_contents(base_path('docs/API.md'));

    abort_if($markdown === false, 404, 'Documentação da API indisponível.');

    return response()->view('api-docs', [
        'documentation' => Str::markdown($markdown, [
            'html_input' => 'escape',
            'allow_unsafe_links' => false,
        ]),
    ]);
})->name('api.docs');
