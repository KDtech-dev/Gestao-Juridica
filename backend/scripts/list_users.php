<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$users = User::with('roles')->get();
foreach ($users as $u) {
    $roles = $u->roles->pluck('name')->toArray();
    echo $u->id . ' | ' . ($u->email ?? '<no-email>') . ' | roles: ' . json_encode($roles, JSON_UNESCAPED_UNICODE) . PHP_EOL;
}
