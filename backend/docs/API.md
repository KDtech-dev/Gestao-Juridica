# API do sistema

Referência da API Laravel. A definição executável das rotas está em [`routes/api.php`](../routes/api.php); validações completas estão em `app/Http/Requests`, formatos de saída em `app/Http/Resources` e regras de aplicação em `app/Services`.

## Convenções

- Prefixo padrão: `/api` (por exemplo, `GET /api/casos`).
- JSON: envie `Accept: application/json` e `Content-Type: application/json` para corpos JSON.
- Autenticação: Sanctum por token bearer. Envie `Authorization: Bearer <token>` nas rotas autenticadas.
- Uploads: envie `multipart/form-data`; os nomes aceitos estão descritos por endpoint e nos Form Requests.
- Datas de domínio usam ISO (`YYYY-MM-DD`); datas com horário usam ISO 8601 quando o campo se chama `starts_at`.
- A API normaliza respostas JSON com `success`, `message`, `data` e `meta`. Recursos paginados também retornam `links` e metadados Laravel. Alguns endpoints, como DJEN, têm estrutura própria descrita abaixo.

### Erros

Erros de validação retornam HTTP `422` e o envelope:

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "code": 422,
  "errors": { "campo": ["mensagem ou chave de tradução"] },
  "data": null,
  "meta": null
}
```

Não autenticado retorna `401`; falta de permissão retorna `403`; recurso inexistente retorna `404`. Algumas mensagens de validação são chaves de tradução (`validation.*`), e o frontend resolve essas chaves via i18n.

### Papéis e permissões

Papéis atuais: `admin`, `advogado`, `funcionario`. Permissões granulares são verificadas por ação; possuir um papel por si só não garante todas as rotas, salvo rotas explicitamente limitadas a `admin` ou ao gerenciamento de permissões.

| Grupo | Permissões |
| --- | --- |
| Usuários | `usuarios.visualizar`, `usuarios.criar`, `usuarios.editar`, `usuarios.excluir` |
| Clientes | `clientes.visualizar`, `clientes.criar`, `clientes.editar`, `clientes.excluir` |
| Casos | `casos.visualizar`, `casos.criar`, `casos.editar`, `casos.excluir` |
| Compromissos | `compromissos.visualizar`, `compromissos.criar`, `compromissos.editar`, `compromissos.excluir` |
| Publicações | `publicacoes.visualizar`, `publicacoes.criar`, `publicacoes.editar`, `publicacoes.excluir` |
| DJEN | `djen.visualizar`, `djen.vincular`, `djen.sincronizar` |
| Controle de acesso | `permissoes.gerenciar` |

## Rotas públicas

| Método | Caminho | Descrição e parâmetros |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Login com `identifier` (e-mail ou CPF) e `password`. CPF pode ser formatado. Retorna `data.token` e `data.user`. |
| `POST` | `/api/auth/forgot-password` | Solicita link de redefinição; corpo `email`. |
| `POST` | `/api/auth/reset-password` | Redefine senha; corpo `token`, `email`, `password` e `password_confirmation`. |
| `GET` | `/api/categorias` | Lista categorias. |
| `GET` | `/api/advogados` | Lista dados públicos de advogados; filtro opcional `categoria`. |
| `GET` | `/api/posts` | Lista publicações públicas. |
| `GET` | `/api/posts/{post}` | Detalhe de publicação pública. |
| `GET` | `/api/posts/{post}/anexos/{anexo}` | Visualiza anexo de publicação publicada. |
| `GET` | `/api/posts/{post}/anexos/{anexo}/download` | Baixa anexo de publicação publicada. |

## Rotas autenticadas

### Sessão e perfil

| Método | Caminho | Permissão/descrição |
| --- | --- | --- |
| `POST` | `/api/auth/logout` | Sanctum. Revoga o token bearer atual. |
| `POST` | `/api/auth/refresh` | Sanctum. Revoga o token atual e retorna outro. |
| `GET` | `/api/profile` | Perfil do usuário autenticado. |
| `PUT` | `/api/profile` | Atualiza os dados permitidos do próprio perfil. Não aceita alteração de papel, ID ou perfil de outro usuário. |
| `POST` | `/api/profile/foto` | Atualiza a própria foto (`foto_perfil`, imagem). |
| `PUT` | `/api/profile/password` | Altera a própria senha; consulte `UpdateProfilePasswordRequest`. |
| `GET` | `/api/profile/available-colors` | Retorna paleta e cores em uso, excluindo a do usuário autenticado. |
| `GET` | `/api/anexos/{anexo}/visualizar` | Visualiza anexo autorizado de caso, cliente ou publicação. |
| `GET` | `/api/anexos/{anexo}/download` | Baixa anexo autorizado de caso, cliente ou publicação. |

Logout e refresh extraem o token do cabeçalho bearer; o corpo pode ser vazio.

### Usuários (somente `admin`)

| Método | Caminho | Permissão/descrição |
| --- | --- | --- |
| `GET` | `/api/users` | Lista usuários, exceto o usuário autenticado. Aceita `page`, `per_page` (1–100), `search` (nome, e-mail ou CPF) e `role` (`admin`, `advogado`, `funcionario`). |
| `POST` | `/api/users` | Cria usuário. Campos-base: `name`, `email`, `cpf`, `password`, `password_confirmation`, `role`, `cor_perfil`; aceita objetos `endereco`, `funcionario` ou `advogado` conforme o papel. |
| `GET` | `/api/users/{user}` | Detalhe de usuário. |
| `PUT` | `/api/users/{user}` | Atualiza usuário; consulte `UpdateUserRequest`. |
| `DELETE` | `/api/users/{user}` | Remove usuário (não permite remover a própria conta nem o último administrador). |
| `GET` | `/api/users/available-colors` | Paleta e cores usadas; query opcional `exclude_user_id`. |
| `POST` | `/api/users/{user}/foto` | Atualiza foto de usuário (`foto_perfil`). |
| `DELETE` | `/api/users/{user}/foto` | Remove foto de usuário. |
| `PUT` | `/api/users/{user}/reset-password` | Administrador redefine senha; corpo validado por `ResetUserPasswordRequest`. |

### Controle de acesso (`permissoes.gerenciar`)

| Método | Caminho | Corpo/retorno |
| --- | --- | --- |
| `GET` | `/api/access-control/permissions` | Catálogo de permissões. |
| `GET` | `/api/access-control/roles` | Papéis e permissões associadas. |
| `GET` | `/api/access-control/roles/{role}/permissions` | Permissões do papel. |
| `PUT` | `/api/access-control/roles/{role}/permissions` | Sincroniza lista `permissions: string[]`. |
| `POST` | `/api/access-control/roles/{role}/permissions` | Adiciona `permission: string`. |
| `DELETE` | `/api/access-control/roles/{role}/permissions/{permission}` | Remove uma permissão do papel. |
| `GET` | `/api/access-control/users/{user}/permissions` | Permissões diretas do usuário. |
| `PUT` | `/api/access-control/users/{user}/permissions` | Sincroniza `permissions: string[]`. |
| `POST` | `/api/access-control/users/{user}/permissions` | Adiciona `permission: string`. |
| `DELETE` | `/api/access-control/users/{user}/permissions/{permission}` | Remove permissão direta do usuário. |

### Clientes

| Método | Caminho | Permissão/descrição |
| --- | --- | --- |
| `GET` | `/api/clientes` | `clientes.visualizar`; aceita `page`, `per_page` (1–100) e `search` (nome, e-mail ou CPF/CNPJ). |
| `POST` | `/api/clientes` | `clientes.criar`; campos definidos em `StoreClienteRequest`; aceita `foto_perfil` em multipart. |
| `GET` | `/api/clientes/{cliente}` | `clientes.visualizar`. |
| `PUT` | `/api/clientes/{cliente}` | `clientes.editar`; campos parciais definidos em `UpdateClienteRequest`. |
| `DELETE` | `/api/clientes/{cliente}` | `clientes.excluir`. |

### Casos

| Método | Caminho | Permissão/descrição |
| --- | --- | --- |
| `GET` | `/api/casos` | `casos.visualizar`; paginação `page`, `per_page` (1–100), busca `search` (título, número CNJ ou categoria), filtros `status`, `area_direito`, `categoria_id`, `advogado_id`. |
| `POST` | `/api/casos` | `casos.criar`; campos em `StoreCasoRequest`. Para anexos use multipart `anexos[]`; pode incluir `categorias[]` e `clientes[index][id/papel]`. |
| `GET` | `/api/casos/{caso}` | `casos.visualizar`. |
| `PUT` | `/api/casos/{caso}` | `casos.editar`; aceita os campos de atualização, `anexos[]` e `anexos_remover[]`. |
| `DELETE` | `/api/casos/{caso}` | `casos.excluir`. |
| `POST` | `/api/casos/{caso}/clientes` | `casos.editar`; associa clientes usando `clientes: [{id, papel}]`. |
| `PUT` | `/api/casos/{caso}/clientes` | `casos.editar`; sincroniza a lista de clientes (a lista pode ser vazia). |
| `DELETE` | `/api/casos/{caso}/clientes/{cliente}` | `casos.editar`; desvincula cliente. |
| `GET` | `/api/casos/{caso}/anexos/{anexo}` | `casos.visualizar`; visualiza anexo protegido. |
| `GET` | `/api/casos/{caso}/anexos/{anexo}/download` | `casos.visualizar`; baixa anexo protegido. |
| `POST` | `/api/casos/{caso}/sincronizar-djen` | `djen.sincronizar`; limita a 6 solicitações por minuto. |

Status de caso: `aberto`, `em_andamento`, `encerrado`, `arquivado`. Papéis de cliente no caso: `autor`, `réu`, `interveniente`, `testemunha`.

### Compromissos

| Método | Caminho | Permissão/descrição |
| --- | --- | --- |
| `GET` | `/api/compromissos` | `compromissos.visualizar`; aceita `visao=pessoal` e `periodo=today|week|month`. |
| `POST` | `/api/compromissos` | `compromissos.criar`; requer `titulo`, `data`, `tipo`; aceita `descricao`, `hora`, `status`, `user_id`, `anexo` ou `starts_at`. |
| `GET` | `/api/compromissos/{compromisso}` | `compromissos.visualizar`. |
| `PUT` | `/api/compromissos/{compromisso}` | `compromissos.editar`; campos parciais equivalentes ao cadastro. |
| `DELETE` | `/api/compromissos/{compromisso}` | `compromissos.excluir`. |
| `GET` | `/api/compromissos/{compromisso}/anexo/visualizar` | `compromissos.visualizar`; transmite o arquivo privado. |
| `GET` | `/api/compromissos/{compromisso}/anexo/download` | `compromissos.visualizar`; baixa o arquivo privado. |

Tipos: `COMPROMISSO`, `LEMBRETE`, `AUDIENCIA`, `PRAZO`, `REUNIAO`. Status: `PENDENTE`, `CONCLUIDO`, `CANCELADO`. `starts_at` é aceito em ISO 8601 e preenche `data` e `hora`.

### Publicações internas

Estas rotas são autenticadas e usam permissões `publicacoes.*`. Para leitura pública use `/api/posts`.

| Método | Caminho | Permissão/descrição |
| --- | --- | --- |
| `GET` | `/api/publicacoes` | `publicacoes.visualizar`. |
| `POST` | `/api/publicacoes` | `publicacoes.criar`; consulte `StorePublicacaoRequest`. |
| `GET` | `/api/publicacoes/{publicacao}` | `publicacoes.visualizar`. |
| `PUT` | `/api/publicacoes/{publicacao}` | `publicacoes.editar`; pode receber anexos e lista `anexos_remover`. |
| `DELETE` | `/api/publicacoes/{publicacao}` | `publicacoes.excluir`. |
| `GET` | `/api/publicacoes/{publicacao}/anexos` | `publicacoes.visualizar`; lista anexos da publicação proprietária. |
| `POST` | `/api/publicacoes/{publicacao}/anexos` | `publicacoes.editar`; upload `arquivo`. |
| `DELETE` | `/api/publicacoes/{publicacao}/anexos/{anexo}` | `publicacoes.editar`. |
| `POST` | `/api/publicacoes/{publicacao}/banner` | `publicacoes.editar`; upload de imagem `imagem`. |

Status: `rascunho`, `publicado`, `arquivado`. Limites e formatos de arquivos estão nos Form Requests e no controller.

### Notificações (sempre do usuário autenticado)

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/api/notificacoes` | Lista até 30 notificações recentes e sincroniza lembretes de compromissos. |
| `PATCH` | `/api/notificacoes/{notificacao}/lida` | Marca uma notificação própria como lida. |
| `PATCH` | `/api/notificacoes/lidas` | Marca todas as notificações próprias como lidas. |
| `DELETE` | `/api/notificacoes` | Apaga notificações próprias; corpo opcional `ids: string[]`. Sem `ids`, apaga todas as próprias. |

### DJEN

| Método | Caminho | Permissão/descrição |
| --- | --- | --- |
| `GET` | `/api/comunicacoes-djen` | `djen.visualizar`; filtros: `por_pagina` (1–100), `caso_id`, `sigla_tribunal`, `data_inicio`, `data_fim`, `somente_nao_lidas`. |
| `GET` | `/api/comunicacoes-djen/{comunicacaoDjen}` | `djen.visualizar`. |
| `PATCH` | `/api/comunicacoes-djen/{comunicacaoDjen}/lida` | `djen.visualizar`; marca como lida. |
| `POST` | `/api/comunicacoes-djen/{comunicacaoDjen}/vincular` | `djen.vincular`; corpo `caso_id` UUID existente. |
| `POST` | `/api/casos/{caso}/sincronizar-djen` | `djen.sincronizar`; sincroniza comunicações do caso. |
| `POST` | `/api/advogados/{advogado}/sincronizar-djen` | `djen.sincronizar`; limita a 6 solicitações por minuto. |

Listagem DJEN retorna `data.items` e `data.pagination` (`current_page`, `per_page`, `last_page`, `total`).

## Exemplos

### Login

```bash
curl -X POST "$API_URL/api/auth/login" \
  -H 'Accept: application/json' -H 'Content-Type: application/json' \
  -d '{"identifier":"usuario@exemplo.com","password":"senha"}'
```

### Chamada autenticada

```bash
curl "$API_URL/api/casos?page=1&per_page=10&search=contrato" \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer $TOKEN"
```

### Sincronização de clientes em um caso

```json
{
  "clientes": [
    { "id": "UUID-DO-CLIENTE", "papel": "autor" }
  ]
}
```

## Paginação e fontes do contrato

Use os parâmetros `page` e `per_page` e leia o total em `meta.total`. Limite atual de `per_page`: 100 nas listagens que aceitam paginação. `GET /api/compromissos` e `GET /api/notificacoes` têm regras próprias; compromissos não expõe paginação nesta versão e notificações limita a lista a 30.

Para conferir as rotas instaladas no ambiente:

```bash
cd backend
php artisan route:list --path=api
```

Ao alterar rotas, validações, resources, permissões ou enums, atualize esta referência junto da implementação.
