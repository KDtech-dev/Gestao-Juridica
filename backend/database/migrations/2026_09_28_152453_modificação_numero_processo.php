<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('casos', function (Blueprint $table) {
            $table->string('numero_processo_limpo', 20)->nullable()->index()->after('numero_processo');
        });

        DB::table('casos')->whereNotNull('numero_processo')->orderBy('id')->each(function ($caso) {
            $limpo = preg_replace('/\D/', '', $caso->numero_processo);

            DB::table('casos')->where('id', $caso->id)->update([
                'numero_processo_limpo' => strlen($limpo) === 20 ? $limpo : null,
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('casos', function (Blueprint $table) {
            $table->dropIndex(['numero_processo_limpo']);
            $table->dropColumn('numero_processo_limpo');
        });
    }
};
