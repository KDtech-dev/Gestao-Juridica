<?php

namespace Database\Seeders;

use App\Models\Cliente;
use Illuminate\Database\Seeder;

class ClienteSeeder extends Seeder
{
    public function run(): void
    {
        $clientes = [
            ['name' => 'Helena Martins Pereira', 'cpf_cnpj' => '12345678901', 'email' => 'helena.martins@example.com', 'telefone' => '31988880001', 'data_nascimento' => '1984-03-18'],
            ['name' => 'Construtora Horizonte Ltda', 'cpf_cnpj' => '11222333000181', 'email' => 'juridico@horizonte.example.com', 'telefone' => '3133554400', 'data_nascimento' => null],
            ['name' => 'Paulo Henrique Alves', 'cpf_cnpj' => '23456789012', 'email' => 'paulo.alves@example.com', 'telefone' => '11977770002', 'data_nascimento' => '1976-11-02'],
            ['name' => 'Clínica Vida Plena S/A', 'cpf_cnpj' => '22333444000172', 'email' => 'administrativo@vidaplena.example.com', 'telefone' => '2133221100', 'data_nascimento' => null],
            ['name' => 'Mariana Costa Ribeiro', 'cpf_cnpj' => '34567890123', 'email' => 'mariana.ribeiro@example.com', 'telefone' => '61966660003', 'data_nascimento' => '1991-07-25'],
        ];

        foreach ($clientes as $cliente) {
            $registro = Cliente::withTrashed()->updateOrCreate(
                ['cpf_cnpj' => $cliente['cpf_cnpj']],
                $cliente
            );

            if ($registro->trashed()) {
                $registro->restore();
            }
        }
    }
}
