# Backend

Backend HTTP do sistema, implementado em Laravel 12. Expõe a API REST consumida pelo frontend Next.js e concentra autenticação, autorização, validação, acesso a dados, uploads e integrações.

## Documentação

- [Referência da API](docs/API.md): endpoints, autenticação, permissões, parâmetros, formatos e exemplos.
- [`routes/api.php`](routes/api.php): fonte executável da tabela de rotas.
- `app/Http/Requests`: regras de entrada e validação.
- `app/Http/Resources`: estrutura serializada das respostas.
- `app/Services`: regras de aplicação e coordenação de persistência.
- `app/Enums`: papéis, permissões e estados de domínio.

## Organização

```text
app/
  Console/Commands/    comandos de manutenção
  Enums/               papéis, permissões e estados
  Http/Controllers/Api endpoints HTTP
  Http/Requests/       validação das entradas
  Http/Resources/      contratos de saída
  Models/              modelos Eloquent
  Services/            lógica de aplicação e integrações
database/
  migrations/          evolução do esquema
  seeders/             dados iniciais
routes/api.php         rotas versionadas pelo prefixo /api
tests/                 testes Laravel
```

Os papéis de usuário atuais são `admin`, `advogado` e `funcionario`. A API usa Sanctum para bearer tokens e Spatie Permission para permissões granulares.

## Desenvolvimento local

Requisitos: PHP 8.2+, Composer e um banco compatível com a configuração Laravel.

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

A API fica disponível em `http://127.0.0.1:8000`; suas rotas começam com `/api`. Configure conexão de banco, URL da aplicação, e-mail e integrações no `.env` conforme o ambiente. Para listar rotas instaladas:

```bash
php artisan route:list --path=api
```

Para desenvolvimento com o frontend, veja [`../README.md`](../README.md). Antes de alterar um endpoint, atualize as Requests/Resources correspondentes e a [referência da API](docs/API.md).

## Anexos privados

Novos anexos de casos e compromissos são gravados no disco privado e servidos pelas rotas autenticadas documentadas na API. Para localizar os arquivos legados que ainda estão no disco público, rode `php artisan anexos:privatizar` (prévia sem alterações). Depois de revisar a saída, `php artisan anexos:privatizar --apply` copia e valida os arquivos privados antes de remover as cópias públicas.
