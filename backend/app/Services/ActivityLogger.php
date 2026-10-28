<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Advogado;
use App\Models\Caso;
use App\Models\Cliente;
use App\Models\Compromisso;
use App\Models\Funcionario;
use App\Models\Publicacao;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ActivityLogger
{
    private const PRIVATE_FIELDS = [
        'password',
        'remember_token',
        'api_token',
        'cpf',
        'cpf_cnpj',
        'email',
        'telefone',
        'celular',
        'data_nascimento',
        'foto_perfil',
        'anexo',
        'conteudo',
        'descricao',
        'resumo',
        'resumo_pessoal',
        'endereco_id',
        'oab_numero',
    ];

    public function modelEvent(Model $subject, string $event): void
    {
        $changedFields = array_keys($subject->getChanges());
        $changedFields = array_values(array_diff($changedFields, ['created_at', 'updated_at', 'deleted_at']));

        if ($event === 'updated' && $changedFields === []) {
            return;
        }

        $this->record(
            event: $event,
            module: $this->moduleFor($subject),
            subject: $subject,
            changedFields: $changedFields,
        );
    }

    /**
     * @param array<int, string> $changedFields
     * @param array<string, mixed> $details
     */
    public function record(
        string $event,
        string $module,
        ?Model $subject = null,
        array $changedFields = [],
        ?User $actor = null,
        array $details = [],
    ): void {
        $actor ??= Auth::user();

        // Seeders, scheduled jobs, and unauthenticated failures are not user activity.
        if (!$actor instanceof User) {
            return;
        }

        $request = app()->bound('request') ? request() : null;
        $label = $this->subjectLabel($subject);

        ActivityLog::query()->create([
            'actor_id' => $actor->id,
            'actor_name' => Str::limit($actor->name, 255, ''),
            'module' => $module,
            'event' => $event,
            'subject_type' => $subject ? class_basename($subject) : null,
            'subject_id' => $subject?->getKey() === null ? null : (string) $subject->getKey(),
            'subject_label' => $label,
            'changed_fields' => array_values(array_unique(array_diff(
                $changedFields,
                self::PRIVATE_FIELDS,
            ))),
            'details' => $details === [] ? null : $details,
            'ip_address' => $request?->ip(),
            'user_agent' => $request ? Str::limit((string) $request->userAgent(), 1000, '') : null,
            'created_at' => now(),
        ]);
    }

    private function moduleFor(Model $subject): string
    {
        return match (true) {
            $subject instanceof Role => 'access_control',
            $subject instanceof User => 'users',
            $subject instanceof Advogado,
            $subject instanceof Funcionario => 'users',
            $subject instanceof Cliente => 'clients',
            $subject instanceof Caso => 'cases',
            $subject instanceof Compromisso => 'appointments',
            $subject instanceof Publicacao => 'publications',
            default => 'other',
        };
    }

    private function subjectLabel(?Model $subject): ?string
    {
        if (!$subject) {
            return null;
        }

        $label = match (true) {
            $subject instanceof User,
            $subject instanceof Cliente,
            $subject instanceof Role => $subject->name ?? null,
            $subject instanceof Advogado,
            $subject instanceof Funcionario => $subject->user?->name,
            $subject instanceof Caso,
            $subject instanceof Compromisso,
            $subject instanceof Publicacao => $subject->titulo ?? null,
            default => null,
        };

        return $label ? Str::limit(strip_tags((string) $label), 255, '') : null;
    }
}
