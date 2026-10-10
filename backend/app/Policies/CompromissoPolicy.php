<?php

namespace App\Policies;

use App\Models\Compromisso;
use App\Models\User;

class CompromissoPolicy
{
    // The existing calendar is shared with authenticated staff. Reuse this rule in WhatsApp.
    public function viewAny(User $user): bool
    {
        return $user->is_active && $user->hasAnyRole(['admin', 'advogado', 'funcionario']);
    }

    public function view(User $user, Compromisso $compromisso): bool
    {
        return $this->viewAny($user);
    }

    public function update(User $user, Compromisso $compromisso): bool
    {
        return true;
    }

    public function delete(User $user, Compromisso $compromisso): bool
    {
        return $this->update($user, $compromisso);
    }
}
