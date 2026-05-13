<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use App\Services\ResponseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    private function serialize(Appointment $appointment): array
    {
        $appointment->loadMissing('lawyers');

        return [
            'id' => $appointment->id,
            'created_by_id' => $appointment->created_by_id,
            'client_id' => $appointment->client_id,
            'client_name' => $appointment->client_name,
            'title' => $appointment->title,
            'type' => $appointment->type,
            'location' => $appointment->location,
            'video_url' => $appointment->video_url,
            'starts_at' => optional($appointment->starts_at)->toISOString(),
            'status' => $appointment->status,
            'description' => $appointment->description,
            'lawyer_ids' => $appointment->lawyers->pluck('id')->values()->all(),
            'lawyers' => $appointment->lawyers->map(fn (User $lawyer) => [
                'id' => $lawyer->id,
                'name' => $lawyer->name,
                'email' => $lawyer->email,
                'oab_number' => $lawyer->oab_number,
            ])->values()->all(),
            'created_at' => optional($appointment->created_at)->toISOString(),
            'updated_at' => optional($appointment->updated_at)->toISOString(),
        ];
    }

    private function resolveLawyerIds(Request $request, array $validated): array
    {
        $lawyerIds = collect($validated['lawyer_ids'] ?? [])
            ->map(fn ($id) => (string) $id)
            ->filter()
            ->unique()
            ->values();

        $user = $request->user();

        if ($user?->hasRole('advogado')) {
            $lawyerIds->push((string) $user->id);
        }

        $lawyerIds = $lawyerIds->unique()->values();

        if ($lawyerIds->isEmpty()) {
            return [];
        }

        return User::query()
            ->role('advogado')
            ->whereIn('id', $lawyerIds->all())
            ->pluck('id')
            ->map(fn ($id) => (string) $id)
            ->all();
    }

    public function index(Request $request): JsonResponse
    {
        $query = Appointment::query()->with('lawyers')->orderBy('starts_at');

        if ($request->filled('from')) {
            $query->where('starts_at', '>=', $request->query('from'));
        }

        if ($request->filled('to')) {
            $query->where('starts_at', '<=', $request->query('to'));
        }

        $appointments = $query->get()->map(fn (Appointment $appointment) => $this->serialize($appointment));

        return ResponseService::success($appointments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['presencial', 'online'])],
            'client_id' => ['nullable', 'integer', 'exists:users,id'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'video_url' => ['nullable', 'string', 'max:255'],
            'starts_at' => ['required', 'date'],
            'status' => ['nullable', Rule::in(['Confirmado', 'Pendente'])],
            'description' => ['nullable', 'string'],
            'lawyer_ids' => ['nullable', 'array'],
            'lawyer_ids.*' => ['integer', 'exists:users,id'],
        ]);

        if ($validated['type'] === 'presencial' && empty(trim((string) ($validated['location'] ?? '')))) {
            return ResponseService::error('Local é obrigatório para compromisso presencial.', 422);
        }

        if ($validated['type'] === 'online' && empty(trim((string) ($validated['video_url'] ?? '')))) {
            return ResponseService::error('Link da videoconferência é obrigatório para compromisso online.', 422);
        }

        $lawyerIds = $this->resolveLawyerIds($request, $validated);
        unset($validated['lawyer_ids']);

        $appointment = Appointment::create([
            ...$validated,
            'created_by_id' => $request->user()?->id,
            'status' => $validated['status'] ?? 'Pendente',
        ]);

        $appointment->lawyers()->sync($lawyerIds);

        return ResponseService::success($this->serialize($appointment->refresh()), 'Compromisso criado.', 201);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        return ResponseService::success($this->serialize($appointment));
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'type' => ['sometimes', 'required', Rule::in(['presencial', 'online'])],
            'client_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'client_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'video_url' => ['sometimes', 'nullable', 'string', 'max:255'],
            'starts_at' => ['sometimes', 'required', 'date'],
            'status' => ['sometimes', Rule::in(['Confirmado', 'Pendente'])],
            'description' => ['sometimes', 'nullable', 'string'],
            'lawyer_ids' => ['sometimes', 'array'],
            'lawyer_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $nextType = $validated['type'] ?? $appointment->type;
        $nextLocation = array_key_exists('location', $validated) ? $validated['location'] : $appointment->location;
        $nextVideoUrl = array_key_exists('video_url', $validated) ? $validated['video_url'] : $appointment->video_url;

        if ($nextType === 'presencial' && empty(trim((string) ($nextLocation ?? '')))) {
            return ResponseService::error('Local é obrigatório para compromisso presencial.', 422);
        }

        if ($nextType === 'online' && empty(trim((string) ($nextVideoUrl ?? '')))) {
            return ResponseService::error('Link da videoconferência é obrigatório para compromisso online.', 422);
        }

        $shouldSyncLawyers = array_key_exists('lawyer_ids', $validated);
        $lawyerIds = $this->resolveLawyerIds($request, $validated);
        unset($validated['lawyer_ids']);

        $appointment->update($validated);

        if ($shouldSyncLawyers) {
            $appointment->lawyers()->sync($lawyerIds);
        }

        return ResponseService::success($this->serialize($appointment->refresh()), 'Compromisso atualizado.');
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return ResponseService::success([], 'Compromisso removido.');
    }
}
