<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anexos', function (Blueprint $table) {
            if (!Schema::hasColumn('anexos', 'publicacao_id')) {
                $table->foreignUuid('publicacao_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('publicacoes')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('anexos', function (Blueprint $table) {
            if (Schema::hasColumn('anexos', 'publicacao_id')) {
                $table->dropConstrainedForeignId('publicacao_id');
            }
        });
    }
};
