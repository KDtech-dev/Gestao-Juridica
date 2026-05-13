<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LegalCase;
use App\Models\User;
use App\Services\ResponseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CaseController extends Controller
{
    private function serialize(LegalCase $case): array
    {
        $case->loadMissing(['client', 'assignedLawyer']);

        return [
            'id' => $case->id,
            'client_id' => $case->client_id,
            'client_name' => $case->client?->name,
            'client_slug' => $case->client ? Str::slug($case->client->name ?: (string) $case->client->id) : null,
            'assigned_lawyer_id' => $case->assigned_lawyer_id,
            'lawyer_name' => $case->assignedLawyer?->name,
            'title' => $case->title,
            'case_title' => $case->title,
            'case_slug' => Str::slug($case->title ?: (string) $case->id),
            'process_number' => $case->process_number,
            'practice_area' => $case->practice_area,
            'next_hearing' => $case->next_hearing,
            'description' => $case->description,
            'status' => $case->status,
            'created_at' => optional($case->created_at)->toISOString(),
            'updated_at' => optional($case->updated_at)->toISOString(),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $limit = (int) $request->query('limit', 20);
        $limit = $limit > 0 ? min($limit, 100) : 20;

        $query = LegalCase::query()
            ->with(['client', 'assignedLawyer'])
            ->latest();

        $user = $request->user();

        if ($user?->hasRole('cliente')) {
            $query->where('client_id', $user->id);
        } elseif ($user?->hasRole('advogado')) {
            $query->where('assigned_lawyer_id', $user->id);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('process_number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($clientQuery) => $clientQuery->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->query('client_id'));
        }

        $paginator = $query->paginate($limit);

        return ResponseService::success(
            collect($paginator->items())->map(fn (LegalCase $case) => $this->serialize($case))->all(),
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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'process_number' => ['nullable', 'string', 'max:120'],
            'client_id' => ['required', 'integer', 'exists:users,id'],
            'practice_area' => ['nullable', 'string', 'max:120'],
            'assigned_lawyer_id' => ['nullable', 'integer', 'exists:users,id'],
            'next_hearing' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['open', 'pending', 'closed', 'Em Andamento', 'Pendente', 'Concluído'])],
        ]);

        $client = User::find($validated['client_id']);

        if (! $client?->hasRole('cliente')) {
            return ResponseService::error('Cliente inválido.', 422);
        }

        if (! empty($validated['assigned_lawyer_id'])) {
            $lawyer = User::find($validated['assigned_lawyer_id']);

            if (! $lawyer?->hasRole('advogado')) {
                return ResponseService::error('Advogado inválido.', 422);
            }
        }

        $user = $request->user();
        if ($user?->hasRole('advogado')) {
            $validated['assigned_lawyer_id'] = $user->id;
        }

        $case = LegalCase::create([
            'client_id' => $validated['client_id'],
            'assigned_lawyer_id' => $validated['assigned_lawyer_id'] ?? null,
            'title' => $validated['title'],
            'process_number' => $validated['process_number'] ?? null,
            'practice_area' => $validated['practice_area'] ?? null,
            'next_hearing' => $validated['next_hearing'] ?? null,
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'open',
        ]);

        return ResponseService::success($this->serialize($case), 'Caso criado.', 201);
    }

    public function show(LegalCase $case): JsonResponse
    {
        return ResponseService::success($this->serialize($case));
    }
}
