<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClienteRequest;
use App\Http\Requests\UpdateClienteRequest;
use App\Http\Resources\ClienteResource;
use App\Models\Cliente;
use App\Services\ClienteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClienteController extends Controller
{
    public function __construct(
        protected ClienteService $clienteService
    ) {}


    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
        ]);

        $clientes = $this->clienteService->getClientes(
            filters: $filters,
            perPage: $request->integer('per_page', 15),
        );

        return ClienteResource::collection($clientes);
    }


    public function store(StoreClienteRequest $request): JsonResponse
    {
        $cliente = $this->clienteService->createCliente($request->validated());

        return (new ClienteResource($cliente))
            ->response()
            ->setStatusCode(201);
    }


    public function show(Cliente $cliente): ClienteResource
    {
        $cliente->loadMissing('endereco');

        return new ClienteResource($cliente);
    }


    public function update(UpdateClienteRequest $request, Cliente $cliente): ClienteResource
    {
        $cliente = $this->clienteService->updateCliente($cliente, $request->validated());

        return new ClienteResource($cliente);
    }


    public function destroy(Cliente $cliente): JsonResponse
    {
        $this->clienteService->deleteCliente($cliente);

        return response()->json(['message' => 'Cliente removido com sucesso.'], 200);
    }
}
