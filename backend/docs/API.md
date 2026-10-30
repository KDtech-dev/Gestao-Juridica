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

### Auditoria do sistema (somente `admin`)

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/api/activity-logs` | Lista movimentações com paginação `page`, `per_page` (1–100) e filtros opcionais `date` (dia `YYYY-MM-DD`), `from`, `to`, `module`, `event`, `actor` (nome) e `search` (registro). |

Cada item informa responsável, módulo, ação, registro relacionado, nomes dos campos alterados, IP, agente do navegador e horário. O histórico não guarda valores de senhas, documentos ou conteúdo dos casos.

São registrados eventos de criação, edição e exclusão em usuários, clientes, casos, compromissos e publicações, login/logout e mudanças de papéis e permissões. As consultas retornam os registros do mais recente para o mais antigo. A API não expõe operações para editar ou apagar o histórico.

Exemplo de consulta para ver todas as movimentações de um dia:

```http
GET /api/activity-logs?date=2026-10-28&per_page=25
Authorization: Bearer <token>
Accept: application/json
```

Os filtros podem ser combinados, por exemplo `?from=2026-10-01&to=2026-10-28&module=cases&event=updated&actor=Maria&search=contrato`. A resposta segue a paginação Laravel (`data`, `meta` e `links`); cada item inclui `actor_name`, `module`, `event`, `subject_label`, `changed_fields`, `ip_address` e `created_at`.

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

Tipos: `COMPROMISSO`, `LEMBRETE`, `AUDIENCIA`, `PRAZO`, `REUNIAO`. Status: `PENDENTE`, `CONCLUIDO`, `CANCELADO`. A passagem da data ou do horário não altera o status automaticamente: o compromisso permanece pendente até um usuário autorizado marcá-lo como concluído ou cancelado. `starts_at` é aceito em ISO 8601 e preenche `data` e `hora`.

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

### Integração WhatsApp (somente `admin`)

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/api/admin/whatsapp/settings` | Consulta o horário padrão `HH:MM` e as opções de conteúdo da mensagem. |
| `PUT` | `/api/admin/whatsapp/settings` | Atualiza o horário padrão e os booleanos `mensagem.incluir_nome`, `incluir_tipo`, `incluir_data` e `incluir_hora`. |
| `GET` | `/api/admin/whatsapp/messages` | Lista os últimos 30 lembretes com status, destinatário e horários de envio, entrega ou leitura. |
| `POST` | `/api/admin/whatsapp/messages/{notificacao}/retry` | Reenfileira um lembrete que falhou, se o responsável tiver celular. |
| `GET` | `/api/admin/whatsapp/status` | Estado da conexão Baileys e telefone pareado. |
| `GET` | `/api/admin/whatsapp/qr` | QR temporário para parear a sessão; disponível enquanto o serviço aguarda leitura. |
| `POST` | `/api/admin/whatsapp/test-message` | Envia uma mensagem de teste; corpo `phone` com DDI e DDD e `message` com o texto. |

Os lembretes de compromisso do dia são enviados ao responsável por meio da fila `whatsapp`. O horário padrão pode ser alterado na tela administrativa do WhatsApp; antes da primeira alteração, o sistema usa `COMPROMISSO_LEMBRETE_HORARIO` (padrão `07:00`). Configure também `BAILEYS_SERVICE_URL` e `BAILEYS_SERVICE_TOKEN` no Laravel e no processo Node em `backend/whatsapp`. Instruções para iniciar o serviço e parear a sessão estão em [`whatsapp/README.md`](../whatsapp/README.md).

O processo Baileys envia confirmações de status para `POST /api/internal/whatsapp/delivery`, autenticado pelo mesmo token compartilhado. Configure `BAILEYS_CALLBACK_URL` no ambiente Node se a API Laravel não estiver em `http://127.0.0.1:8000`.

### DJEN

| Método | Caminho | Permissão/descrição |
| --- | --- | --- |
| `GET` | `/api/comunicacoes-djen` | `djen.visualizar`; filtros: `por_pagina` (1–100), `caso_id`, `sigla_tribunal`, `data_inicio`, `data_fim`, `somente_nao_lidas`. |
| `GET` | `/api/comunicacoes-djen/{comunicacaoDjen}` | `djen.visualizar`. |
| `PATCH` | `/api/comunicacoes-djen/{comunicacaoDjen}/lida` | `djen.visualizar`; marca como lida. |
| `POST` | `/api/comunicacoes-djen/{comunicacaoDjen}/vincular` | `djen.vincular`; corpo `caso_id` UUID existente. |
| `POST` | `/api/casos/{caso}/sincronizar-djen` | `djen.sincronizar`; enfileira a sincronização do caso e retorna HTTP `202` com a execução criada. Uma execução pendente/em andamento existente é retornada com HTTP `200`. |
| `POST` | `/api/advogados/{advogado}/sincronizar-djen` | `djen.sincronizar`; enfileira a sincronização do advogado; limita a 6 solicitações por minuto. |
| `GET` | `/api/djen-sync-runs/{djenSyncRun}` | `djen.visualizar` ou `djen.sincronizar`; consulta progresso e resultado da execução. Somente o iniciador ou um administrador pode consultar. |

Listagem DJEN retorna `data.items` e `data.pagination` (`current_page`, `per_page`, `last_page`, `total`).

As execuções têm status `queued`, `running`, `completed` ou `failed`, contadores de páginas/comunicações criadas/atualizadas e `last_error` quando falham. Após uma execução bem-sucedida, o próximo pedido usa o checkpoint concluído com sobreposição de três dias para capturar publicações atrasadas; a chave externa `djen_id` mantém a gravação idempotente. Os jobs usam a fila `djen`, com até três tentativas e espera progressiva. O padrão limita cada consulta a 20 páginas; se esse limite for atingido, a execução falha explicitamente e não avança o checkpoint.

Para processar os jobs, configure `QUEUE_CONNECTION=database`, aplique as migrations e mantenha um worker ativo, por exemplo `php artisan queue:work --queue=djen,default --tries=3 --timeout=1800`. O comando diário `php artisan djen:sincronizar` também apenas enfileira as execuções.

## Exemplos

Os exemplos abaixo mostram o envelope JSON produzido pela API. Troque `{id}` pelos identificadores retornados e use `Authorization: Bearer <token>` nas operações protegidas.

### Clientes

#### `POST /api/clientes` — cadastrar cliente

Requer `clientes.criar`. Envie JSON para os campos textuais; para enviar `foto_perfil`, use `multipart/form-data`.

Entrada (`application/json`):

```json
{
  "name": "Ana Silva",
  "cpf_cnpj": "12345678901",
  "email": "ana.silva@example.com",
  "telefone": "+55 11 99999-1234",
  "data_nascimento": "1992-06-15",
  "endereco_id": null
}
```

Saída (`201 Created`):

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "8f5f4f87-5c84-4f57-a184-12213344abcd",
    "name": "Ana Silva",
    "cpf_cnpj": "12345678901",
    "email": "ana.silva@example.com",
    "telefone": "+55 11 99999-1234",
    "data_nascimento": "1992-06-15",
    "foto_perfil_url": null,
    "created_at": "28/10/2026 14:30"
  },
  "meta": null
}
```

#### `GET /api/clientes` — listar e buscar

Parâmetros opcionais: `page`, `per_page` (padrão `15`, máximo `100`) e `search`. A busca é feita no servidor e considera nome, e-mail e CPF/CNPJ.

Exemplo: `GET /api/clientes?page=1&per_page=10&search=ana`.

Saída resumida: `data` contém a página de clientes; `meta.total` informa quantos resultados correspondem à busca e `links` traz as URLs de paginação.

#### `GET /api/clientes/{cliente}` — consultar cliente

Resposta `200 OK`: envelope `success`, `message`, `data` e `meta`. `data` tem os campos do recurso de cliente e inclui `endereco` quando a relação foi carregada; um cliente sem endereço pode retornar `endereco: null`.

#### `PUT /api/clientes/{cliente}` — atualizar cliente

Requer `clientes.editar`. Envie somente os campos que deseja alterar. Exemplo:

```json
{
  "telefone": "+55 11 98888-4321",
  "data_nascimento": null
}
```

Retorna `200 OK` com o recurso atualizado em `data`, no mesmo formato de `GET /api/clientes/{cliente}`.

#### `DELETE /api/clientes/{cliente}` — remover cliente

Requer `clientes.excluir`. Retorna `200 OK`:

```json
{
  "success": true,
  "message": "Cliente removido com sucesso.",
  "data": null,
  "meta": null
}
```

### Casos

#### `POST /api/casos` — criar caso

Requer `casos.criar`. O exemplo sem arquivos pode ser enviado como JSON. Para anexos, envie `multipart/form-data` com cada arquivo em `anexos[]`.

Entrada:

```json
{
  "titulo": "Ação de cobrança",
  "numero_processo": "0000000-00.2026.8.26.0100",
  "descricao": "Cobrança contratual.",
  "status": "aberto",
  "data_abertura": "2026-10-28",
  "data_encerramento": null,
  "advogado_id": "0c2fecec-2e9c-4b42-8aca-267db77ce001",
  "categorias": [1],
  "clientes": [
    { "id": "8f5f4f87-5c84-4f57-a184-12213344abcd", "papel": "autor" }
  ]
}
```

Resposta (`201 Created`):

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "d010d37b-4485-42a4-a010-000000000001",
    "numero_processo": "00000000020268260100",
    "titulo": "Ação de cobrança",
    "descricao": "Cobrança contratual.",
    "status": "aberto",
    "data_abertura": "2026-10-28",
    "data_encerramento": null,
    "advogado": { "id": "0c2fecec-2e9c-4b42-8aca-267db77ce001", "name": "João Advogado" },
    "categorias": [{ "id": 1, "nome": "Direito Civil" }],
    "clientes": [{
      "id": "8f5f4f87-5c84-4f57-a184-12213344abcd",
      "name": "Ana Silva",
      "email": "ana.silva@example.com",
      "telefone": "+55 11 99999-1234",
      "papel": "autor"
    }],
    "anexos": [],
    "created_at": "2026-10-28 14:30:00",
    "updated_at": "2026-10-28 14:30:00"
  },
  "meta": null
}
```

Quando houver anexos, `data.anexos` inclui nome e URLs autenticadas de visualização e download.

### Compromissos

#### `POST /api/compromissos` — cadastrar compromisso

Requer `compromissos.criar`. Entrada JSON:

```json
{
  "titulo": "Reunião com cliente",
  "descricao": "Analisar documentos do caso.",
  "data": "2026-11-02",
  "hora": "14:30",
  "tipo": "REUNIAO",
  "status": "PENDENTE"
}
```

Resposta `200 OK`:

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "4b1eb141-310e-4ff9-a622-ef02003e3134",
    "titulo": "Reunião com cliente",
    "descricao": "Analisar documentos do caso.",
    "data": "2026-11-02",
    "hora": "14:30",
    "tipo": "REUNIAO",
    "status": "PENDENTE",
    "anexo": null,
    "criador": {
      "id": "0c2fecec-2e9c-4b42-8aca-267db77ce001",
      "nome": "João Advogado",
      "cor_perfil": "#3b82f6"
    },
    "can": { "update": true, "delete": true }
  },
  "meta": null
}
```

Para enviar um anexo, use `multipart/form-data` com o campo `anexo`. A URL retornada aponta para a rota autenticada de visualização do arquivo.

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
