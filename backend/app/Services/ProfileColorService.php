<?php

namespace App\Services;

use App\Models\User;
use App\Support\ProfileColors;

class ProfileColorService
{
    public function choices(?string $exceptUserId = null): array
    {
        $used = User::query()
            ->whereNotNull('cor_perfil')
            ->when($exceptUserId, fn ($query) => $query->where('id', '!=', $exceptUserId))
            ->pluck('cor_perfil')
            ->map(fn (string $color) => strtolower($color));

        return [
            'colors' => ProfileColors::OPTIONS,
            'used' => $used->values(),
        ];
    }

    public function nextAvailable(): ?string
    {
        $used = User::query()
            ->whereNotNull('cor_perfil')
            ->pluck('cor_perfil')
            ->map(fn (string $color) => strtolower($color));

        return collect(ProfileColors::OPTIONS)
            ->first(fn (string $color) => !$used->contains($color));
    }
}
