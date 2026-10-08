<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('comunicacoes_djen', function (Blueprint $table) {
            $table->string('status_djen', 5)->nullable()->after('tipo_comunicacao'); // "P" no exemplo
            $table->string('motivo_cancelamento')->nullable()->after('status_djen');
            $table->date('data_cancelamento')->nullable()->after('motivo_cancelamento');
        });
    }

    public function down(): void
    {
        Schema::table('comunicacoes_djen', function (Blueprint $table) {
            $table->dropColumn(['status_djen', 'motivo_cancelamento', 'data_cancelamento']);
        });
    }
};
