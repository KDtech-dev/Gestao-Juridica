<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cases', function (Blueprint $table) {
            if (! Schema::hasColumn('cases', 'process_number')) {
                $table->string('process_number')->nullable()->after('title');
            }

            if (! Schema::hasColumn('cases', 'practice_area')) {
                $table->string('practice_area')->nullable()->after('process_number');
            }

            if (! Schema::hasColumn('cases', 'next_hearing')) {
                $table->string('next_hearing')->nullable()->after('practice_area');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cases', function (Blueprint $table) {
            foreach (['process_number', 'practice_area', 'next_hearing'] as $column) {
                if (Schema::hasColumn('cases', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
