<?php

use App\Support\ProfileColors;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use RuntimeException;

return new class extends Migration
{
    public function up(): void
    {
        $users = DB::table('users')->orderBy('created_at')->orderBy('id')->get(['id', 'cor_perfil']);
        $assigned = [];
        $needsColor = [];

        foreach ($users as $user) {
            $current = strtolower((string) $user->cor_perfil);
            if (in_array($current, ProfileColors::OPTIONS, true) && !isset($assigned[$current])) {
                $assigned[$current] = $user->id;
            } else {
                $needsColor[] = $user;
            }
        }

        foreach ($needsColor as $user) {
            $color = collect(ProfileColors::OPTIONS)
                ->first(fn (string $option) => !isset($assigned[$option]));

            if (!$color) {
                throw new RuntimeException('A paleta atual não comporta todos os usuários cadastrados.');
            }

            DB::table('users')->where('id', $user->id)->update(['cor_perfil' => $color]);
            $assigned[$color] = $user->id;
        }
    }

    public function down(): void
    {
        // As cores são dados de preferência; não há um valor anterior seguro para restaurar.
    }
};
