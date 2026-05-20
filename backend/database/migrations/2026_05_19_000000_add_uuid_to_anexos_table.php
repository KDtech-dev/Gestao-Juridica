<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anexos', function (Blueprint $table) {
            if (!Schema::hasColumn('anexos', 'uuid')) {
                $table->uuid('uuid')
                    ->nullable()
                    ->unique()
                    ->after('id');
            }
        });

        DB::table('anexos')
            ->whereNull('uuid')
            ->orderBy('id')
            ->each(function (object $anexo): void {
                DB::table('anexos')
                    ->where('id', $anexo->id)
                    ->update(['uuid' => (string) Str::uuid()]);
            });
    }

    public function down(): void
    {
        Schema::table('anexos', function (Blueprint $table) {
            if (Schema::hasColumn('anexos', 'uuid')) {
                $table->dropUnique(['uuid']);
                $table->dropColumn('uuid');
            }
        });
    }
};
