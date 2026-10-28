<?php

use App\Support\ProfileColors;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

return new class extends Migration
{
    public function up(): void
    {
        $used = [];
        $users = DB::table('users')->orderBy('created_at')->orderBy('id')->get(['id', 'cor_perfil']);

        foreach ($users as $user) {
            $current = strtolower((string) $user->cor_perfil);
            $color = in_array($current, ProfileColors::OPTIONS, true) && !isset($used[$current])
                ? $current
                : collect(ProfileColors::OPTIONS)->first(fn (string $option) => !isset($used[$option]));

            if (!$color) {
                throw new RuntimeException('A paleta de cores é menor que a quantidade de usuários existentes.');
            }

            DB::table('users')->where('id', $user->id)->update(['cor_perfil' => $color]);
            $used[$color] = true;
        }

        Schema::table('users', function ($table) {
            $table->string('cor_perfil', 7)->default('#2563eb')->nullable(false)->change();
            $table->unique('cor_perfil');
        });
    }

    public function down(): void
    {
        Schema::table('users', function ($table) {
            $table->dropUnique(['cor_perfil']);
            $table->string('cor_perfil', 7)->nullable()->default(null)->change();
        });
    }
};
