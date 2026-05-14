<?php

namespace App\Strategies;

use App\Interfaces\PublicationStrategyInterface;
use Illuminate\Support\Facades\Auth;
use App\Models\Publicacao;

class PublicacaoAdminStrategy implements PublicationStrategyInterface
{
    public function getAll()
    {
        return Publicacao::where(
            'user_id',
            Auth::id()
        )->latest()->get();
    }

    public function getById(string $id)
    {
        return Publicacao::where(
            'user_id',
            Auth::id()
        )->where('id', $id)
            ->firstOrFail();
    }

    public function create(array $data)
    {
        $data['user_id'] = Auth::id();

        return Publicacao::create($data);
    }

    public function update(string $id, array $data)
    {
        $publicacao = Publicacao::where(
            'user_id',
            Auth::id()
        )->where('id', $id)
            ->firstOrFail();

        $publicacao->update($data);

        return $publicacao;
    }

    public function delete(string $id)
    {
        return Publicacao::where(
            'user_id',
            Auth::id()
        )->where('id', $id)
            ->firstOrFail()
            ->delete();
    }
}
