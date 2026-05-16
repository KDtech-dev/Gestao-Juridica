<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compromissos', function (Blueprint $table) {
            $table->id();

            $table->foreignUuid('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descricao')
                ->nullable();
            $table->date('data');
            $table->time('hora')
                ->nullable();
            $table->string('tipo')
                ->default('COMPROMISSO');
            $table->string('status')
                ->default('PENDENTE');
            $table->string('anexo')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compromissos');
    }
};
