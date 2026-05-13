<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 50)->nullable()->after('cpf');
            $table->boolean('is_active')->default(true)->after('phone');
            $table->string('oab_number', 50)->nullable()->after('is_active');
            $table->text('areas')->nullable()->after('oab_number');
            $table->string('position', 120)->nullable()->after('areas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'is_active', 'oab_number', 'areas', 'position']);
        });
    }
};
