<?php

namespace App\Services;

use App\Interfaces\PublicationStrategyInterface;

class PublicacaoService
{
    public function __construct(
        protected PublicationStrategyInterface $strategy
    ) {}

    public function getPublicacoes()
    {
        return $this->strategy->getAll();
    }

    public function getPublicacaoById(string $id)
    {
        return $this->strategy->getById($id);
    }

    public function createPublicacao(array $data)
    {
        return $this->strategy->create($data);
    }

    public function updatePublicacao(string $id, array $data)
    {
        return $this->strategy->update($id, $data);
    }

    public function deletePublicacao(string $id)
    {
        return $this->strategy->delete($id);
    }
}