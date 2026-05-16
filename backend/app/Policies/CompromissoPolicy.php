<?php

namespace App\Policies;

use App\Models\Compromisso;
use App\Models\User;

class CompromissoPolicy
{
    public function update(User $user, Compromisso $compromisso): bool
    {
        return true;
    }

    public function delete(User $user, Compromisso $compromisso): bool
    {
        return $this->update($user, $compromisso);
    }
}
