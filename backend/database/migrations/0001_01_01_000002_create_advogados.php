<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advogados', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('pessoa_id')->unique();
            $table->foreign('pessoa_id')
                ->references('id')
                ->on('pessoas')
                ->cascadeOnDelete();

            $table->string('oab_numero', 20)->unique();
            $table->string('oab_uf', 2);
            $table->string('especialidade')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advogados');
    }
};