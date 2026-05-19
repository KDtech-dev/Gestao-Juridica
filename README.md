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
- [Configuração do ambiente](#configuração-do-ambiente)
- [Como executar](#como-executar)
- [Usuários de teste](#usuários-de-teste)
- [Rotas da aplicação](#rotas-da-aplicação)
- [API REST](#api-rest)
- [Scripts úteis](#scripts-úteis)
- [Testes e qualidade](#testes-e-qualidade)
- [Deploy](#deploy)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Observações do estado atual](#observações-do-estado-atual)
- [Solução de problemas](#solução-de-problemas)

## Visão geral

O sistema atende dois contextos principais:

1. **Site público do escritório**: página inicial, equipe, publicações/artigos jurídicos e detalhes de publicações.
2. **Dashboard interno**: autenticação, gestão de clientes, agenda, compromissos, publicações, notificações e áreas administrativas.

A autenticação é feita pela API Laravel usando Laravel Sanctum. O frontend armazena o token no navegador e envia as requisições autenticadas com `Authorization: Bearer <token>`.

## Funcionalidades

### Área pública

- Página institucional com apresentação do escritório.
- Listagem de publicações públicas.
- Página de detalhe de publicação.
- Página de equipe.
- Suporte a internacionalização base (`pt`, `en`, `es`).

### Área autenticada

- Login com CPF ou e-mail.
- Redirecionamento por perfil de usuário.
- Gestão de clientes.
- Gestão de publicações com status:
  - `rascunho`
  - `publicado`
  - `arquivado`
- Cadastro de categorias jurídicas.
- Agenda de compromissos.
- Notificações de compromissos do dia/semana.
- Layout administrativo com sidebar, header, tema e toast.
- Telas administrativas para usuários e equipe no frontend.

### Perfis de acesso

O backend trabalha com os papéis:

- `admin`
- `advogado`
- `funcionario`

## Tecnologias

### Backend

- PHP `^8.2`
- Laravel `^12.0`
- Laravel Sanctum `^4.3`
- Laravel Reverb `^1.10`
- Spatie Laravel Permission `^7.2`
- Kra8 Laravel Snowflake `^2.5`
- PHPUnit `^11.5`
- Laravel Pint
- Banco relacional via Eloquent: MySQL 
### Frontend

- Next.js `16.2.0`
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
  | - cases
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

## Configuração do ambiente

### 1. Clonar o projeto

```bash
git clone <url-do-repositorio>
cd advocacia-gestao
```
### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
```bash
touch database/database.sqlite
```

Depois rode migrations e seeders:

```bash
php artisan migrate --seed
php artisan storage:link
```

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
```

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Se `NEXT_PUBLIC_API_URL` não for definido, o Next usa rewrites locais para encaminhar `/api/*` e `/sanctum/*` para `http://127.0.0.1:8000`.

## Como executar

### Terminal 1: API Laravel

```bash
cd backend
php artisan serve
```

API disponível em:

```text
http://127.0.0.1:8000
```

### Terminal 2: Frontend Next.js

## Autor

**Diego André Afonso**

Estudante de Análise e Desenvolvimento de Sistemas

## Licença

Este projeto informa licença MIT nos manifestos do backend. Caso o repositório precise de distribuição formal, adicione um arquivo `LICENSE` na raiz.
