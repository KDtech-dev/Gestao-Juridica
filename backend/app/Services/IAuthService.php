<?php
namespace App\Services;

interface IAuthService
{
    /**
     * @param array{email:string,password:string} $credentials
     * @return array{token:string,user:array{id:int,name:string,email:string}}
     */
    public function login(array $credentials): array;

    public function logout(string $token): void;

    /**
     * @return array{token:string,user:array{id:int,name:string,email:string}}
     */
    public function refresh(string $token): array;
}