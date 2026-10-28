<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $permissionsTable = config('permission.table_names.permissions', 'permissions');

        DB::table($permissionsTable)
            ->where('name', 'notificacoes.visualizar')
            ->delete();
    }

    public function down(): void
    {
        $permissionsTable = config('permission.table_names.permissions', 'permissions');

        DB::table($permissionsTable)->insertOrIgnore([
            'name' => 'notificacoes.visualizar',
            'guard_name' => 'api',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
