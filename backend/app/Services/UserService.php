<?php

namespace App\Services;

use App\Models\User;
use App\Models\Funcionario;
use App\Models\Advogado;
use App\Models\Endereco;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserService
{
    public function criar(array $dados): User
    {
        return DB::transaction(function () use ($dados) {
            $enderecoId = null;
            if (!empty($dados['endereco'])) {
                $enderecoId = Endereco::create($dados['endereco'])->id;
            }

            $user = User::create([
                'name'     => $dados['name'],
                'email'    => $dados['email'],
                'cpf'      => $dados['cpf'],
                'password' => Hash::make($dados['password']),
            ]);

            $this->criarPerfil($user, $dados['role'], $dados, $enderecoId);

            $user->assignRole($dados['role']);

            return $this->carregarRelacoes($user, $dados['role']);
        });
    }

    private function criarPerfil(User $user, string $role, array $dados, ?string $enderecoId): void
    {
        if ($role === 'funcionario') {
            Funcionario::create([
                'user_id'         => $user->id,
                'data_nascimento' => $dados['funcionario']['data_nascimento'] ?? null,
                'sexo'            => $dados['funcionario']['sexo'] ?? null,
                'celular'         => $dados['funcionario']['celular'] ?? null,
                'resumo_pessoal'  => $dados['funcionario']['resumo_pessoal'] ?? null,
                'foto_perfil'     => $dados['funcionario']['foto_perfil'] ?? null,
                'endereco_id'     => $enderecoId,
            ]);
            return;
        }

        if ($role === 'advogado') {
            $advogado = Advogado::create([
                'user_id'        => $user->id,
                'sexo'           => $dados['advogado']['sexo'] ?? null,
                'celular'        => $dados['advogado']['celular'] ?? null,
                'resumo_pessoal' => $dados['advogado']['resumo_pessoal'] ?? null,
                'foto_perfil'    => $dados['advogado']['foto_perfil'] ?? null,
                'oab_numero'     => $dados['advogado']['oab_numero'],
                'oab_uf'         => $dados['advogado']['oab_uf'],
                'endereco_id'    => $enderecoId,
            ]);

            if (!empty($dados['advogado']['categorias'])) {
                $advogado->categorias()->sync($dados['advogado']['categorias']);
            }
        }
    }

    public function atualizar(User $user, array $dados): User
    {
        return DB::transaction(function () use ($user, $dados) {
            $dadosUser = array_filter([
                'name'  => $dados['name'] ?? null,
                'email' => $dados['email'] ?? null,
                'cpf'   => $dados['cpf'] ?? null,
                'cor_perfil' => $dados['cor_perfil'] ?? null,
            ]);

            if (!empty($dados['password'])) {
                $dadosUser['password'] = Hash::make($dados['password']);
            }

            if (!empty($dadosUser)) {
                $user->update($dadosUser);
            }

            if (array_key_exists('endereco', $dados)) {
                $this->sincronizarEndereco($user, $dados['endereco']);
            }

            $roleAlvo = $dados['role'] ?? $user->getRoleNames()->first();
            $this->atualizarPerfil($user, $roleAlvo, $dados);

            if (isset($dados['role']) && !$user->hasRole($dados['role'])) {
                $user->syncRoles([$dados['role']]);
            }

            return $this->carregarRelacoes($user->fresh(), $roleAlvo);
        });
    }

    private function atualizarPerfil(User $user, string $role, array $dados): void
    {
        match ($role) {
            'funcionario' => $this->atualizarFuncionario($user, $dados['funcionario'] ?? []),
            'advogado'    => $this->atualizarAdvogado($user, $dados['advogado'] ?? []),
            default       => null,
        };
    }
    public function atualizarFotoPerfil(User $user, UploadedFile $foto): string
    {
        $perfil = $user->advogado ?? $user->funcionario;

        if (!$perfil) {
            throw new \Exception('Usuário sem perfil vinculado.');
        }

        if ($perfil->foto_perfil) {
            Storage::disk('public')->delete($perfil->foto_perfil);
        }

        $path = $foto->store('fotos-perfil', 'public');
        $perfil->update(['foto_perfil' => $path]);

        return Storage::url($path);
    }

    private function atualizarFuncionario(User $user, array $dados): void
    {
        if (empty($dados)) {
            return;
        }

        $campos = array_filter([
            'data_nascimento' => $dados['data_nascimento'] ?? null,
            'sexo'            => $dados['sexo'] ?? null,
            'celular'         => $dados['celular'] ?? null,
            'resumo_pessoal'  => $dados['resumo_pessoal'] ?? null,
            'foto_perfil'     => $dados['foto_perfil'] ?? null,
        ], fn($v) => $v !== null);

        $user->funcionario()->updateOrCreate(
            ['user_id' => $user->id],
            $campos
        );
    }

    private function atualizarAdvogado(User $user, array $dados): void
    {
        if (empty($dados)) return;

        $campos = array_filter([
            'sexo'           => $dados['sexo'] ?? null,
            'celular'        => $dados['celular'] ?? null,
            'resumo_pessoal' => $dados['resumo_pessoal'] ?? null,
            'foto_perfil'    => $dados['foto_perfil'] ?? null,
            'oab_numero'     => $dados['oab_numero'] ?? null,
            'oab_uf'         => $dados['oab_uf'] ?? null,
        ], fn($v) => $v !== null);

        $advogado = $user->advogado()->updateOrCreate(
            ['user_id' => $user->id],
            $campos
        );

        if (array_key_exists('categorias', $dados)) {
            $advogado->categorias()->sync($dados['categorias'] ?? []);
        }
    }
    private function sincronizarEndereco(User $user, ?array $dadosEndereco): void
    {
        if (is_null($dadosEndereco)) {
            $this->desvincularEndereco($user);
            return;
        }

        $perfil = $user->funcionario ?? $user->advogado;

        if ($perfil === null) {
            return;
        }

        if ($perfil->endereco_id) {
            $perfil->endereco()->update($dadosEndereco);
        } else {
            $endereco = Endereco::create($dadosEndereco);
            $perfil->update(['endereco_id' => $endereco->id]);
        }
    }

    private function desvincularEndereco(User $user): void
    {
        $perfil = $user->funcionario ?? $user->advogado;

        if ($perfil?->endereco_id) {
            $enderecoId = $perfil->endereco_id;
            $perfil->update(['endereco_id' => null]);
            Endereco::destroy($enderecoId);
        }
    }

    public function listar(int $porPagina = 15)
    {
        return User::with([
            'funcionario.endereco',
            'advogado.endereco',
            'roles',
        ])->paginate($porPagina);
    }

    public function buscar(User $user): User
    {
        $role = $user->getRoleNames()->first();

        return $this->carregarRelacoes($user, $role);
    }

    private function carregarRelacoes(User $user, ?string $role): User
    {
        return match ($role) {
            'funcionario' => $user->load('funcionario.endereco', 'roles'),
            'advogado'    => $user->load('advogado.endereco', 'advogado.categorias', 'roles'),
            default       => $user->load('roles'),
        };
    }
}
