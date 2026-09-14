<?php

namespace App\Policies;

use App\Models\Compromisso;
use App\Models\User;

class CompromissoPolicy
{
    public function update(User $user, Compromisso $compromisso): bool
    {
        return $user->hasRole('admin') || (string) $compromisso->user_id === (string) $user->id;
    }

    public function delete(User $user, Compromisso $compromisso): bool
    {
        return $this->update($user, $compromisso);
    }
}
