<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ResponseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    private function serialize(User $client): array
    {
        $status = $client->client_status ?: (($client->is_active ?? true) ? 'Ativo' : 'Inativo');

        return [
            'id' => $client->id,
            'name' => $client->name,
            'cpfCnpj' => $client->cpf,
            'cpf_cnpj' => $client->cpf,
            'email' => $client->email,
            'phone' => $client->phone,
            'contactName' => $client->contact_name,
            'contact_name' => $client->contact_name,
            'status' => $status,
            'address' => $client->address,
            'notes' => $client->notes,
            'slug' => Str::slug($client->name ?: (string) $client->id),
            'created_at' => optional($client->created_at)->toISOString(),
            'updated_at' => optional($client->updated_at)->toISOString(),
        ];
    }

    private function normalizeStatus(?string $status): string
    {
        $normalized = trim((string) $status);

        return match (mb_strtolower($normalized)) {
            'ativo', 'active' => 'Ativo',
            'inativo', 'inactive' => 'Inativo',
            'prospect' => 'Prospect',
            default => 'Ativo',
        };
    }

    private function onlyDigits(?string $value): ?string
    {
        $digits = preg_replace('/\D/', '', (string) $value);

        return $digits !== '' ? $digits : null;
    }

    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status');
        $limit = (int) $request->query('limit', 20);
        $limit = $limit > 0 ? min($limit, 100) : 20;

        $query = User::query()->role('cliente')->orderBy('name');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('cpf', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%");
            });
        }

        if (is_string($status) && trim($status) !== '') {
            $query->where('client_status', $this->normalizeStatus($status));
        }

        $paginator = $query->paginate($limit);

        return ResponseService::success(
            collect($paginator->items())->map(fn (User $client) => $this->serialize($client))->all(),
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

    public function show(User $client): JsonResponse
    {
        if (! $client->hasRole('cliente')) {
            return ResponseService::error('Cliente não encontrado.', 404);
        }

        return ResponseService::success($this->serialize($client));
    }

    public function store(Request $request): JsonResponse
    {
        if (! $request->filled('cpfCnpj') && $request->filled('cpf_cnpj')) {
            $request->merge(['cpfCnpj' => $request->input('cpf_cnpj')]);
        }

        if (! $request->filled('contactName') && $request->filled('contact_name')) {
            $request->merge(['contactName' => $request->input('contact_name')]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'cpfCnpj' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'contactName' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['Ativo', 'Inativo', 'Prospect', 'ativo', 'inativo', 'prospect'])],
            'address' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $cpf = $this->onlyDigits($validated['cpfCnpj']);

        if (! $cpf) {
            return ResponseService::error('CPF/CNPJ é obrigatório.', 422);
        }

        if (User::where('cpf', $cpf)->exists()) {
            return ResponseService::error('CPF/CNPJ já cadastrado.', 422);
        }

        $status = $this->normalizeStatus($validated['status'] ?? null);

        $client = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'cpf' => $cpf,
            'phone' => $validated['phone'] ?? null,
            'contact_name' => $validated['contactName'] ?? null,
            'client_status' => $status,
            'address' => $validated['address'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'is_active' => $status !== 'Inativo',
            'password' => Hash::make(Str::random(16)),
        ]);

        $client->syncRoles(['cliente']);

        return ResponseService::success($this->serialize($client), 'Cliente criado.', 201);
    }

    public function update(Request $request, User $client): JsonResponse
    {
        if (! $client->hasRole('cliente')) {
            return ResponseService::error('Cliente não encontrado.', 404);
        }

        if (! $request->filled('cpfCnpj') && $request->filled('cpf_cnpj')) {
            $request->merge(['cpfCnpj' => $request->input('cpf_cnpj')]);
        }

        if (! $request->filled('contactName') && $request->filled('contact_name')) {
            $request->merge(['contactName' => $request->input('contact_name')]);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'cpfCnpj' => ['sometimes', 'required', 'string', 'max:30'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($client->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'contactName' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'nullable', Rule::in(['Ativo', 'Inativo', 'Prospect', 'ativo', 'inativo', 'prospect'])],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ]);

        if (array_key_exists('cpfCnpj', $validated)) {
            $cpf = $this->onlyDigits($validated['cpfCnpj']);

            if (! $cpf) {
                return ResponseService::error('CPF/CNPJ é obrigatório.', 422);
            }

            if (User::where('cpf', $cpf)->where('id', '!=', $client->id)->exists()) {
                return ResponseService::error('CPF/CNPJ já cadastrado.', 422);
            }

            $validated['cpf'] = $cpf;
            unset($validated['cpfCnpj']);
        }

        if (array_key_exists('contactName', $validated)) {
            $validated['contact_name'] = $validated['contactName'];
            unset($validated['contactName']);
        }

        if (array_key_exists('status', $validated)) {
            $status = $this->normalizeStatus($validated['status']);
            $validated['client_status'] = $status;
            $validated['is_active'] = $status !== 'Inativo';
            unset($validated['status']);
        }

        $client->fill($validated);
        $client->save();

        return ResponseService::success($this->serialize($client->refresh()), 'Cliente atualizado.');
    }

    public function destroy(User $client): JsonResponse
    {
        if (! $client->hasRole('cliente')) {
            return ResponseService::error('Cliente não encontrado.', 404);
        }

        $client->delete();

        return ResponseService::success([], 'Cliente removido.');
    }
}
