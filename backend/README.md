# Backend

Backend HTTP do sistema, implementado em Laravel 12. Expõe a API REST consumida pelo frontend Next.js e concentra autenticação, autorização, validação, acesso a dados, uploads e integrações.

## Documentação

- [Referência da API](docs/API.md): endpoints, autenticação, permissões, parâmetros, formatos e exemplos.
- Interface web local: [`http://localhost:8000/api/docs/`](http://localhost:8000/api/docs/), servida pelo Laravel durante o desenvolvimento.
- [`routes/api.php`](routes/api.php): fonte executável da tabela de rotas.
- `app/Http/Requests`: regras de entrada e validação.
- `app/Http/Resources`: estrutura serializada das respostas.
- `app/Services`: regras de aplicação e coordenação de persistência.
- `app/Enums`: papéis, permissões e estados de domínio.

### Como consultar e usar

1. Inicie o backend com `php artisan serve`.
2. Abra `http://localhost:8000/api/docs/` e expanda o grupo (por exemplo, **Clientes**) e a operação (por exemplo, **POST /api/clientes**).
3. Confira permissão exigida, parâmetros, formato do corpo e os exemplos JSON de resposta.
4. Para endpoints autenticados, obtenha um token em `POST /api/auth/login` e envie `Authorization: Bearer <token>` no Postman, curl ou cliente HTTP equivalente.

A página apresenta a documentação para leitura; ela não executa chamadas nem substitui um cliente HTTP. O arquivo `docs/API.md` é a fonte textual que alimenta a página.

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

O módulo de movimentações registra para administradores alterações de registros, autenticações e mudanças de permissões. A trilha inclui dia, usuário responsável, módulo, ação e item afetado; mantém nomes de campos alterados sem guardar seus valores sensíveis.

## Desenvolvimento local

Requisitos: PHP 8.2+, Composer e um banco compatível com a configuração Laravel.

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

A API fica disponível em `http://127.0.0.1:8000`; suas rotas começam com `/api` e a documentação fica em `/api/docs/`. Configure conexão de banco, URL da aplicação, e-mail e integrações no `.env` conforme o ambiente. Para listar rotas instaladas:

```bash
php artisan route:list --path=api
```

Para desenvolvimento com o frontend, veja [`../README.md`](../README.md). Ao criar ou alterar um endpoint, atualize `routes/api.php`, as Requests e Resources aplicáveis e os exemplos correspondentes em `docs/API.md`; a página `/api/docs/` usa esse Markdown.

## Anexos privados

Novos anexos de casos e compromissos são gravados no disco privado e servidos pelas rotas autenticadas documentadas na API. Para localizar os arquivos legados que ainda estão no disco público, rode `php artisan anexos:privatizar` (prévia sem alterações). Depois de revisar a saída, `php artisan anexos:privatizar --apply` copia e valida os arquivos privados antes de remover as cópias públicas.
