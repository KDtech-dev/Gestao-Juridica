<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ResponseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    private function isTeamUser(User $user): bool
    {
        return $user->hasRole('admin')
            || $user->hasRole('advogado')
            || $user->hasRole('funcionario');
    }

    private function parseAreas(?string $areas): array
    {
        if (! $areas) return [];
        return collect(explode(',', $areas))
            ->map(fn ($s) => trim((string) $s))
            ->filter()
            ->values()
            ->all();
    }

    private function serializeUser(User $user): array
    {
        $roles = $user->getRoleNames()->values()->all();
        $type = in_array('admin', $roles, true)
            ? 'admin'
            : (in_array('advogado', $roles, true)
                ? 'advogado'
                : (in_array('funcionario', $roles, true) ? 'funcionario' : null));

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'cpf' => $user->cpf,
            'phone' => $user->phone,
            'type' => $type,
            'roles' => $roles,
            'is_active' => (bool) ($user->is_active ?? true),
            'oab_number' => $user->oab_number,
            'areas' => $this->parseAreas($user->areas),
            'position' => $user->position,
            'created_at' => optional($user->created_at)->toISOString(),
            'updated_at' => optional($user->updated_at)->toISOString(),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $type = $request->query('type');
        $search = trim((string) $request->query('search', ''));

        $sortBy = $request->query('sort_by', 'name');
        $sortDir = strtolower((string) $request->query('sort_dir', 'asc')) === 'desc' ? 'desc' : 'asc';

        $limit = (int) $request->query('limit', 20);
        $limit = $limit > 0 ? min($limit, 100) : 20;

        $query = User::query()->with('roles');

        if ($type === 'admin' || $type === 'advogado' || $type === 'funcionario') {
            $query->role($type);
        } else {
            $query->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'advogado', 'funcionario']));
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $allowedSort = ['name', 'email', 'phone', 'is_active', 'created_at'];
        if (in_array($sortBy, $allowedSort, true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('name', 'asc');
        }

        $paginator = $query->paginate($limit);

        return ResponseService::success(
            collect($paginator->items())->map(fn (User $u) => $this->serializeUser($u))->all(),
            null,
            200,
            [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ]
        );
    }

    public function show(User $usuario): JsonResponse
    {
        if (! $this->isTeamUser($usuario)) {
            return ResponseService::error('Usuário não encontrado.', 404);
        }

        $usuario->loadMissing('roles');

        return ResponseService::success($this->serializeUser($usuario));
    }

    public function store(Request $request): JsonResponse
    {
        // Backwards-compatibility aliases for clients that send `role`, `oab`, `cargo`.
        if (! $request->filled('type') && $request->filled('role')) {
            $request->merge(['type' => $request->input('role')]);
        }
        if (! $request->filled('oab_number') && $request->filled('oab')) {
            $request->merge(['oab_number' => $request->input('oab')]);
        }
        if (! $request->filled('position') && $request->filled('cargo')) {
            $request->merge(['position' => $request->input('cargo')]);
        }

        $validated = $request->validate([
            'type' => ['required', Rule::in(['admin', 'advogado', 'funcionario'])],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'cpf' => ['required', 'string', 'regex:/^\\d{11}$/', 'unique:users,cpf'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:6'],
            'is_active' => ['sometimes', 'boolean'],
            'oab_number' => ['nullable', 'string', 'max:50'],
            'areas' => ['nullable', 'array'],
            'areas.*' => ['string', 'max:80'],
            'position' => ['nullable', 'string', 'max:120'],
        ]);

        if ($validated['type'] === 'funcionario' && empty(trim((string) ($validated['position'] ?? '')))) {
            return ResponseService::error('Cargo/Função é obrigatório para funcionários.', 422);
        }

        $areas = $validated['areas'] ?? null;
        $areasString = is_array($areas)
            ? collect($areas)->map(fn ($s) => trim((string) $s))->filter()->unique()->implode(', ')
            : null;

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'cpf' => $validated['cpf'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'oab_number' => $validated['type'] === 'advogado' ? ($validated['oab_number'] ?? null) : null,
            'areas' => $validated['type'] === 'advogado' ? $areasString : null,
            'position' => $validated['type'] === 'funcionario' ? ($validated['position'] ?? null) : null,
            'password' => $validated['password'],
        ]);

        $user->syncRoles([$validated['type']]);

        $user->loadMissing('roles');

        return ResponseService::success($this->serializeUser($user), 'Usuário criado.', 201);
    }

    public function update(Request $request, User $usuario): JsonResponse
    {
        if (! $this->isTeamUser($usuario)) {
            return ResponseService::error('Usuário não encontrado.', 404);
        }

        // Backwards-compatibility aliases for clients that send `role`, `oab`, `cargo`.
        if (! $request->filled('type') && $request->filled('role')) {
            $request->merge(['type' => $request->input('role')]);
        }
        if (! $request->filled('oab_number') && $request->filled('oab')) {
            $request->merge(['oab_number' => $request->input('oab')]);
        }
        if (! $request->filled('position') && $request->filled('cargo')) {
            $request->merge(['position' => $request->input('cargo')]);
        }

        $validated = $request->validate([
            'type' => ['sometimes', Rule::in(['admin', 'advogado', 'funcionario'])],
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($usuario->id)],
            'cpf' => ['sometimes', 'string', 'regex:/^\\d{11}$/', Rule::unique('users', 'cpf')->ignore($usuario->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'is_active' => ['sometimes', 'boolean'],
            'oab_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'areas' => ['sometimes', 'nullable', 'array'],
            'areas.*' => ['string', 'max:80'],
            'position' => ['sometimes', 'nullable', 'string', 'max:120'],
        ]);

        $typeToSync = $validated['type'] ?? null;
        $nextType = $typeToSync ?? (
            $usuario->hasRole('admin')
                ? 'admin'
                : ($usuario->hasRole('advogado') ? 'advogado' : 'funcionario')
        );

        if ($nextType === 'funcionario') {
            $position = array_key_exists('position', $validated) ? $validated['position'] : $usuario->position;
            if (empty(trim((string) ($position ?? '')))) {
                return ResponseService::error('Cargo/Função é obrigatório para funcionários.', 422);
            }
        }

        if (array_key_exists('password', $validated) && empty($validated['password'])) {
            unset($validated['password']);
        }

        if (array_key_exists('areas', $validated)) {
            $areas = $validated['areas'];
            $validated['areas'] = is_array($areas)
                ? collect($areas)->map(fn ($s) => trim((string) $s))->filter()->unique()->implode(', ')
                : null;
        }

        if ($typeToSync === 'advogado') {
            $validated['position'] = null;
        }

        if ($typeToSync === 'funcionario') {
            $validated['oab_number'] = null;
            $validated['areas'] = null;
        }

        if ($typeToSync === 'admin') {
            $validated['oab_number'] = null;
            $validated['areas'] = null;
            $validated['position'] = null;
        }

        unset($validated['type']);

        $usuario->fill($validated);

        if ($typeToSync) {
            $usuario->syncRoles([$typeToSync]);
        }

        $usuario->save();

        $usuario->loadMissing('roles');

        return ResponseService::success($this->serializeUser($usuario), 'Usuário atualizado.');
    }

    public function destroy(User $usuario): JsonResponse
    {
        if (! $this->isTeamUser($usuario)) {
            return ResponseService::error('Usuário não encontrado.', 404);
        }

        $usuario->delete();

        return ResponseService::success([], 'Usuário removido.');
    }
}
