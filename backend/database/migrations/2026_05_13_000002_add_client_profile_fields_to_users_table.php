<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('cpf');
            }

            if (! Schema::hasColumn('users', 'contact_name')) {
                $table->string('contact_name')->nullable()->after('phone');
            }

            if (! Schema::hasColumn('users', 'client_status')) {
                $table->string('client_status')->default('Ativo')->after('contact_name');
            }

            if (! Schema::hasColumn('users', 'address')) {
                $table->string('address')->nullable()->after('client_status');
            }

            if (! Schema::hasColumn('users', 'notes')) {
                $table->text('notes')->nullable()->after('address');
            }

            if (! Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('notes');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            foreach (['phone', 'contact_name', 'client_status', 'address', 'notes', 'is_active'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
