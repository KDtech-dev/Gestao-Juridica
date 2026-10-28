# Sistema de Gestão para Advocacia

Plataforma web para gestão administrativa de escritórios de advocacia, com área pública institucional, autenticação por perfil e módulos internos para clientes, publicações, agenda/compromissos e notificações.

O projeto está organizado como um monorepo com:

- `backend/`: API REST em Laravel 12.
- `frontend/`: aplicação web em Next.js 16.

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Configuração e execução](#configuração-e-execução)
- [Documentação da API](#documentação-da-api)
- [Documentação adicional](#documentação-adicional)

## Visão geral

O sistema atende dois contextos principais:

1. **Site público do escritório**: página inicial, publicações/artigos jurídicos e perfis públicos individuais de advogados. A rota `/equipe` ainda existe, mas não está disponível para visitantes anônimos pelo `AuthGate` e foi removida da navegação pública.
2. **Dashboard interno**: autenticação, gestão de clientes, agenda, compromissos, publicações, notificações e áreas administrativas.

A autenticação é feita pela API Laravel usando Laravel Sanctum. O frontend armazena o token no navegador e envia as requisições autenticadas com `Authorization: Bearer <token>`.

## Funcionalidades

### Área pública

- Página institucional com apresentação do escritório.
- Listagem de publicações públicas.
- Página de detalhe de publicação.
- Perfis públicos individuais de advogados.
- Suporte a internacionalização base (`pt`, `en`, `es`).

### Área autenticada

- Login com CPF ou e-mail.
- Redirecionamento por perfil de usuário.
- Gestão de clientes.
- Gestão de publicações com status:
  - `rascunho`
  - `publicado`
  - `arquivado`
- Categorias jurídicas para classificar casos e publicações.
- Agenda de compromissos.
- Notificações de compromissos do dia/semana.
- Layout administrativo com sidebar, header, tema e toast.
- Telas administrativas para usuários e equipe no frontend.
- Auditoria de movimentações acessível a administradores em `/admin/logs`, com filtros por dia, módulo, ação, responsável e registro.

### Perfis de acesso

O backend trabalha com os papéis:

- `admin`
- `advogado`
- `funcionario`

O histórico administrativo registra criação, edição e exclusão de registros dos módulos principais, entradas e saídas de sessão e mudanças de papel e permissões. Ele armazena os nomes dos campos alterados, sem guardar valores de campos sensíveis. A tabela `activity_logs` é criada pelas migrations do backend.

## Tecnologias

### Backend

- PHP `^8.2`
- Laravel `^12.0`
- Laravel Sanctum `^4.3`
- Laravel Reverb `^1.10`
- Spatie Laravel Permission `^7.2`
- PHPUnit `^11.5`
- Laravel Pint
- Banco relacional via Eloquent: MySQL
### Frontend

- Next.js `^16.3.6`
- React `19.2.4`
- TypeScript `^5`
- Material UI `^7.3`
- MUI X Date Pickers `^9.2`
- Axios `^1.13`
- React Hook Form `^7.75`
- Zod `^4.4`
- next-intl `^4.11`
- Recharts `^3.8`
- Tailwind CSS `^4`
- ESLint `^9`
- Prettier `^3.8`

## Arquitetura

```text
Browser
  |
  | Next.js App Router
  | - páginas públicas
  | - dashboard protegido
  | - rewrites /api e /sanctum
  v
Laravel API
  | - Sanctum
  | - Spatie roles
  | - services/resources/requests
  v
Banco de dados
  | - users
  | - roles/permissions
  | - publicacoes
  | - categorias
  | - anexos
  | - compromissos
  | - notificacoes
  | - casos
```

Fluxo principal de autenticação:

1. Usuário acessa `/login`.
2. Frontend envia `POST /api/auth/login` com CPF/e-mail e senha.
3. Backend valida credenciais e retorna token Sanctum.
4. Frontend salva o token em `localStorage` ou `sessionStorage`.
5. Requisições privadas enviam `Authorization: Bearer <token>`.

## Pré-requisitos

Instale na máquina:

- PHP 8.2 ou superior.
- Composer.
- Node.js compatível com Next.js 16.
- npm.
- MySQL/MariaDB, caso use `DB_CONNECTION=mysql`.
- Extensões PHP comuns do Laravel, como `pdo`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `fileinfo`.

## Configuração e execução

### 1. Clonar o projeto

```bash
git clone <git@github.com:DiegoAndreAfonso/advocacia-gestao.git>
cd advocacia-gestao
```
### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
O `.env.example` está configurado para MySQL. Para usar SQLite, selecione `DB_CONNECTION=sqlite` no `.env` e crie o arquivo antes de executar as migrations:

```bash
touch database/database.sqlite
```

Para MySQL, configure as credenciais e não crie o arquivo SQLite.

Depois rode migrations e seeders:

```bash
php artisan migrate --seed
php artisan storage:link
```

### Frontend

Em outro terminal, instale e inicie:

```bash
cd frontend
npm install
npm run dev
```

Se `NEXT_PUBLIC_API_URL` não for definido, o Next usa rewrites locais para encaminhar `/api/*` e `/sanctum/*` para `http://127.0.0.1:8000`.

API disponível em `http://127.0.0.1:8000`; frontend em `http://localhost:3000`.

## Documentação da API

A referência dos endpoints, autenticação, permissões, parâmetros e formatos está em [backend/docs/API.md](backend/docs/API.md). A mesma referência é exibida pelo backend em [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/) depois de iniciar a API. A documentação da organização e operação do backend está em [backend/README.md](backend/README.md).

Na página, abra os accordions por grupo e depois a operação desejada para ver método, caminho, permissão, parâmetros e exemplos de entrada/saída. Para testar uma rota protegida, faça login em `POST /api/auth/login` e use o token retornado no cabeçalho `Authorization: Bearer <token>` via Postman, curl ou outro cliente HTTP. A página é uma referência de leitura; as chamadas não são executadas nela.

## Documentação adicional

- [Perfis públicos de advogados](docs/perfis-publicos-advogados.md)

## Autor

**Diego André Afonso**

Estudante de Análise e Desenvolvimento de Sistemas

## Licença

Este projeto informa licença MIT nos manifestos do backend. Caso o repositório precise de distribuição formal, adicione um arquivo `LICENSE` na raiz.
