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
        return Cliente::query()
            ->with('endereco')
            ->when(
                isset($filters['search']),
                fn($q) => $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('cpf_cnpj', 'like', "%{$filters['search']}%")
                    ->orWhere('email', 'like', "%{$filters['search']}%")
            )
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

        $original = $cliente->getAttributes();
        try {
            DB::transaction(function () use ($cliente, $data) {
                $cliente->update($data);
            });

            if ($novaFoto && $fotoAntiga) {
                app(LixeiraService::class)->guardarArquivo('public', $fotoAntiga, 0);
            }

            if (array_key_exists('foto_perfil', $data) && is_null($data['foto_perfil']) && $fotoAntiga) {
                app(LixeiraService::class)->guardarArquivo('public', $fotoAntiga, 0);
            }
        } catch (\Throwable $e) {
            $cliente->setRawAttributes($original);
            $cliente->save();
            if ($novaFoto) {
                Storage::disk('public')->delete($novaFoto);
            }

            throw $e;
        }

        return $cliente->fresh();
    }


    public function deleteCliente(Cliente $cliente): void
    {
        app(LixeiraService::class)->excluir($cliente);
    }

    protected function storeFotoPerfil(UploadedFile $file): string
    {
        return $file->store('clientes/fotos', 'public');
    }
}
