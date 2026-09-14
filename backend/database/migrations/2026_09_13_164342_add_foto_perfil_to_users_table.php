<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'foto_perfil')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('foto_perfil')
                    ->nullable()
                    ->after('cor_perfil');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'foto_perfil')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('foto_perfil');
            });
        }
    }
};
