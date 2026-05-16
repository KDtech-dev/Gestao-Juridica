## 🧠 Sistema de Gestão para Advocacia

Sistema web desenvolvido para auxiliar na gestão de escritórios de advocacia, permitindo o controle de processos, clientes e atividades administrativas de forma centralizada.

---

## 📌 Descrição

O projeto tem como objetivo facilitar a organização de escritórios jurídicos, oferecendo funcionalidades essenciais para o dia a dia da advocacia, como controle de informações, acompanhamento de dados e estruturação de processos internos.

Sistemas desse tipo são fundamentais, pois a gestão eficiente é um dos pilares para o sucesso na advocacia — não basta apenas conhecimento jurídico, é necessário organização e controle operacional. ([Reddit][1])

---

## 🚀 Funcionalidades

* 📁 Cadastro e gerenciamento de clientes
* ⚖️ Controle de processos jurídicos
* 📅 Organização de atividades e registros
* 📊 Estrutura base para expansão (financeiro, relatórios, etc.)
* 🔐 Sistema com foco em organização e controle de dados

---

## 🛠️ Tecnologias Utilizadas

* **Back-end:** PHP / LARAVEL
* **Banco de dados:** MySQL
* **Front-end:** TypeScript / React
* **Controle de versão:** Git / GitHub

---

## 📁 Estrutura do Projeto

```bash
advocacia-gestao/
│
├── backend/                 # API e regras de negócio (Laravel)
│   ├── app/                 # Models, Controllers, Services
│   ├── routes/              # Rotas da API
│   ├── database/            # Migrations e seeders
│   ├── config/              # Configurações do sistema
│   ├── public/              # Entrada pública (index.php)
│   └── tests/               # Testes automatizados
│
├── frontend/                # Interface do usuário (Next.js)
│   ├── app/                 # Páginas e rotas
│   ├── components/          # Componentes reutilizáveis
│   ├── services/            # Comunicação com API
│   ├── hooks/               # Hooks personalizados
│   ├── utils/               # Funções auxiliares
│   ├── public/              # Arquivos estáticos
│   └── styles/              # Estilização
│
└── README.md
```
---

## ⚙️ Como Executar o Projeto

### 🔹 Back-end (Laravel)

Acesse a pasta do back-end:

```bash
cd backend
```

Instale as dependências:

```bash
composer install
```

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

Gere a chave da aplicação:

```bash
php artisan key:generate
```

Crie o link simbólico do storage:

```bash
php artisan storage:link
```

Execute as migrations:

```bash
php artisan migrate
```

Inicie o servidor Laravel:

```bash
php artisan serve
```

Servidor disponível em:

```txt
http://127.0.0.1:8000
```
---

### 🔹 Front-end (Next.js)

Acesse a pasta do front-end:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Aplicação disponível em:

```txt
http://localhost:3000
```

---

## 🔗 Integração Front-end e Back-end

O front-end em Next.js consome a API desenvolvida em Laravel.

Exemplo de URL da API:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Essa variável pode ser adicionada no arquivo:

```txt
frontend/.env.local
```
---
## 👨‍💻 Autor

**Diego André Afonso**
Estudante de Análise e Desenvolvimento de Sistemas

---

## 📄 Licença

Este projeto está sob a licença MIT.

---
