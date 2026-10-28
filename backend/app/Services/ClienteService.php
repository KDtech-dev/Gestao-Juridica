<?php

namespace App\Services;

use App\Models\Cliente;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ClienteService
{

    public function getClientes(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $documentSearch = preg_replace('/\D/', '', $search);

        return Cliente::query()
            ->with('endereco')
            ->when($search !== '', fn($query) => $query->where(function ($query) use ($search, $documentSearch) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");

                if ($documentSearch !== '') {
                    $query->orWhere('cpf_cnpj', 'like', "%{$documentSearch}%");
                }
            }))
            ->latest()
            ->paginate($perPage);
    }

    public function getClienteById(string $id): Cliente
    {
        return Cliente::with('endereco')->findOrFail($id);
    }

    public function createCliente(array $data): Cliente
    {
        if (isset($data['foto_perfil']) && $data['foto_perfil'] instanceof UploadedFile) {
            $data['foto_perfil'] = $this->storeFotoPerfil($data['foto_perfil']);
        }

        try {
            return DB::transaction(fn() => Cliente::create($data));
        } catch (\Throwable $e) {
            if (isset($data['foto_perfil'])) {
                Storage::disk('public')->delete($data['foto_perfil']);
            }

            throw $e;
        }
    }

    public function updateCliente(Cliente $cliente, array $data): Cliente
    {
        $fotoAntiga = $cliente->foto_perfil;
        $novaFoto   = null;

        if (isset($data['foto_perfil']) && $data['foto_perfil'] instanceof UploadedFile) {
            $novaFoto        = $this->storeFotoPerfil($data['foto_perfil']);
            $data['foto_perfil'] = $novaFoto;
        }

        if (array_key_exists('foto_perfil', $data) && is_null($data['foto_perfil'])) {
            $data['foto_perfil'] = null;
        }

        try {
            DB::transaction(function () use ($cliente, $data) {
                $cliente->update($data);
            });

            if ($novaFoto && $fotoAntiga) {
                Storage::disk('public')->delete($fotoAntiga);
            }

            if (array_key_exists('foto_perfil', $data) && is_null($data['foto_perfil']) && $fotoAntiga) {
                Storage::disk('public')->delete($fotoAntiga);
            }
        } catch (\Throwable $e) {
            if ($novaFoto) {
                Storage::disk('public')->delete($novaFoto);
            }

            throw $e;
        }

        return $cliente->fresh();
    }


    public function deleteCliente(Cliente $cliente): void
    {
        DB::transaction(function () use ($cliente) {
            $foto = $cliente->foto_perfil;

            $cliente->delete();

            if ($foto) {
                Storage::disk('public')->delete($foto);
            }
        });
    }

    protected function storeFotoPerfil(UploadedFile $file): string
    {
        return $file->store('clientes/fotos', 'public');
    }
}
