<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('advogados', function (Blueprint $table) {
            $table->date('data_nascimento')
                ->nullable()
                ->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('advogados', function (Blueprint $table) {
            $table->dropColumn('data_nascimento');
        });
    }
};
