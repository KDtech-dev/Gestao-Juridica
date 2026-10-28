<?php

namespace App\Services;

use App\Models\Caso;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CasoService
{
    public function getCasos(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $search = trim((string) ($filters['search'] ?? ''));

        return Caso::query()
            ->with(['clientes', 'advogado', 'categorias'])
            ->when(
                $search !== '',
                fn($q) => $q->where(function ($query) use ($search) {
                    $query->where('titulo', 'like', "%{$search}%")
                        ->orWhere('numero_processo', 'like', "%{$search}%")
                        ->orWhereHas('categorias', fn($categoryQuery) =>
                            $categoryQuery->where('nome', 'like', "%{$search}%")
                        );
                })
            )
            ->when(
                isset($filters['status']),
                fn($q) => $q->where('status', $filters['status'])
            )
            ->when(
                isset($filters['area_direito']),
                fn($q) => $q->where('area_direito', $filters['area_direito'])
            )
            ->when(
                isset($filters['categoria_id']),
                fn($q) => $q->whereHas(
                    'categorias',
                    fn($cq) => $cq->where('categorias.id', $filters['categoria_id'])
                )
            )
            ->when(
                isset($filters['advogado_id']),
                fn($q) => $q->where('advogado_id', $filters['advogado_id'])
            )
            ->latest()
            ->orderBy('id')
            ->paginate($perPage);
    }

    public function getCasoById(string $id): Caso
    {
        return Caso::with(['clientes', 'advogado', 'categorias', 'anexos'])->findOrFail($id);
    }

    public function createCaso(array $data): Caso
    {
        return DB::transaction(function () use ($data) {
            $clientes = $data['clientes'] ?? [];
            $categorias = $data['categorias'] ?? null;
            $anexos = $data['anexos'] ?? [];
            unset($data['clientes'], $data['categorias'], $data['anexos'], $data['anexos_remover']);

            $caso = Caso::create($data);

            if (!empty($clientes)) {
                $this->syncClientes($caso, $clientes);
            }

            if ($categorias !== null) {
                $this->syncCategorias($caso, $categorias);
            }

            if (!empty($anexos)) {
                $this->storeAnexos($caso, $anexos);
            }

            return $caso->load(['clientes', 'advogado', 'categorias', 'anexos']);
        });
    }

    public function updateCaso(Caso $caso, array $data): Caso
    {
        return DB::transaction(function () use ($caso, $data) {
            $categorias = $data['categorias'] ?? null;
            $anexosNovos = $data['anexos'] ?? [];
            $anexosRemover = $data['anexos_remover'] ?? [];

            unset($data['categorias'], $data['clientes'], $data['anexos'], $data['anexos_remover']);

            $caso->update($data);

            if ($categorias !== null) {
                $this->syncCategorias($caso, $categorias);
            }

            if (!empty($anexosNovos)) {
                $this->storeAnexos($caso, $anexosNovos);
            }

            if (!empty($anexosRemover)) {
                $this->removeAnexos($caso, $anexosRemover);
            }

            return $caso->fresh(['clientes', 'advogado', 'categorias', 'anexos']);
        });
    }

    public function deleteCaso(Caso $caso): void
    {
        DB::transaction(fn() => $caso->delete());
    }

    public function syncClientes(Caso $caso, array $clientes): Caso
    {
        $payload = collect($clientes)->mapWithKeys(fn($item) => [
            $item['id'] => ['papel' => $item['papel'] ?? 'autor'],
        ])->toArray();

        $caso->clientes()->sync($payload);

        return $caso->load(['clientes', 'advogado', 'categorias', 'anexos']);
    }

    public function attachClientes(Caso $caso, array $clientes): Caso
    {
        $payload = collect($clientes)->mapWithKeys(fn($item) => [
            $item['id'] => ['papel' => $item['papel'] ?? 'autor'],
        ])->toArray();

        $caso->clientes()->syncWithoutDetaching($payload);

        return $caso->load(['clientes', 'advogado', 'categorias', 'anexos']);
    }

    public function detachCliente(Caso $caso, string $clienteId): void
    {
        $caso->clientes()->detach($clienteId);
    }

    public function syncCategorias(Caso $caso, array $categorias): Caso
    {
        $caso->categorias()->sync($categorias);

        return $caso->load(['clientes', 'advogado', 'categorias', 'anexos']);
    }

    private function storeAnexos(Caso $caso, array $anexos): void
    {
        foreach ($anexos as $anexo) {
            if (!$anexo instanceof UploadedFile) {
                continue;
            }

            $path = $anexo->store("casos/{$caso->id}/anexos", 'local');

            $caso->anexos()->create([
                'nome_arquivo' => $anexo->getClientOriginalName(),
                'arquivo'      => $path,
            ]);
        }
    }

    private function removeAnexos(Caso $caso, array $anexoIds): void
    {
        if (empty($anexoIds)) {
            return;
        }

        $caso->anexos()
            ->whereIn('uuid', $anexoIds)
            ->get()
            ->each(function ($anexo): void {
                if ($anexo->arquivo) {
                    Storage::disk('local')->delete($anexo->arquivo);
                    Storage::disk('public')->delete($anexo->arquivo);
                }

                $anexo->delete();
            });
    }
}
