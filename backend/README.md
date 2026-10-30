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

### Movimentações e auditoria

Administradores podem consultar a tela **Movimentações** em `/admin/logs`. Ela lista as ações mais recentes e permite filtrar por dia, intervalo de datas, módulo, ação, responsável e registro. A tela consome `GET /api/activity-logs`, endpoint autenticado e restrito ao papel `admin`.

A trilha registra criação, edição e exclusão de usuários, clientes, casos, compromissos e publicações, além de entradas/saídas de sessão e alterações de papéis e permissões. Cada item contém responsável, data/hora, módulo, ação, registro afetado, nomes dos campos alterados e metadados técnicos da requisição. Valores sensíveis dos campos não são armazenados. A tabela `activity_logs` é criada pela migration `2026_10_28_000002_create_activity_logs_table.php`; em uma instalação nova, `php artisan migrate --seed` cria a tabela junto das demais.

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

## Testes

Execute a suíte Laravel com:

```bash
php artisan test
```

Os testes de integração usam SQLite em memória para não alterar o banco de desenvolvimento. O PHP precisa ter `pdo_sqlite` habilitado. A suíte inclui verificações de autorização e filtros para movimentações, além de fluxos de perfil, publicações, anexos e dados públicos.

Os testes de DJEN simulam as respostas HTTP e verificam paginação, retry de erro temporário, idempotência, checkpoint incremental, enfileiramento e consulta de progresso sem acessar o serviço externo.

### Worker DJEN

Com `QUEUE_CONNECTION=database`, mantenha um worker em execução para processar sincronizações, envios WhatsApp e tentativas:

```bash
php artisan queue:work --queue=djen,whatsapp,default --tries=3 --timeout=1800
```

O envio de lembretes usa um serviço Node separado com Baileys. Consulte [`whatsapp/README.md`](whatsapp/README.md) para instalar, iniciar e parear a sessão. Os endpoints administrativos da API exibem o estado e o QR da conexão.

O horário padrão do lembrete WhatsApp é definido na tela administrativa `/admin/whatsapp`; antes da primeira alteração, usa `COMPROMISSO_LEMBRETE_HORARIO` (padrão `07:00`). O horário usa o fuso `APP_TIMEZONE`. A sincronização ao abrir a tela de notificações não envia WhatsApp; o envio é disparado pelo comando agendado nesse horário. Em desenvolvimento, mantenha `php artisan schedule:work` e o worker da fila em execução; em produção, configure o cron do Laravel Scheduler para rodar a cada minuto. Se alterar o valor de fallback no `.env`, limpe o cache de configuração (`php artisan config:clear`).

O estado do WhatsApp é mantido na notificação: fila, envio, confirmação de entrega/leitura e falha. A tela administrativa lista os envios recentes e permite reenfileirar falhas quando há celular cadastrado. A reivindicação atômica evita que execuções concorrentes enfileirem a mesma notificação.

Falhas temporárias de conexão, HTTP 408, 425, 429 e respostas 5xx recebem até três novas tentativas, após 15 segundos, 1 minuto e 3 minutos. Erros permanentes (outras respostas 4xx e serviço sem configuração) encerram o job imediatamente e ficam disponíveis para reenvio manual depois da correção. O limite é quatro tentativas no total, contando a inicial.

Por privacidade, o job persistido na fila contém somente o ID da notificação; telefone e texto são carregados no momento do envio. O rastreamento WhatsApp e registros antigos de falhas de fila são removidos após 90 dias (`WHATSAPP_RETENTION_DAYS`), diariamente às 03:30. A limpeza mantém a notificação e seu texto para o histórico interno do usuário, e não apaga o telefone do cadastro de contato. O painel de envios é restrito a administradores.

Na mesma tela administrativa, o conteúdo dos lembretes pode incluir ou ocultar o primeiro nome do responsável, o tipo, a data e o horário do compromisso. O título do compromisso e o período do lembrete permanecem na mensagem; a descrição não é enviada.

O comando agendado `php artisan djen:sincronizar` cria uma execução por caso aberto e advogado com OAB válida. A tabela `djen_sync_runs` mantém status, início/fim, data inicial consultada, progresso, contagens e erro da última tentativa. Consulte o estado pela API `GET /api/djen-sync-runs/{id}`.

O limite padrão é de 20 páginas por consulta (`DJEN_MAX_PAGES`). Se a última página vier cheia, a execução fica `failed`, mostra o limite em `last_error` e preserva o checkpoint para que a sincronização não aparente sucesso parcial. Ajuste o limite conforme o volume esperado. `DB_QUEUE_RETRY_AFTER` deve ficar acima do timeout do worker.

## Anexos privados

Novos anexos de casos e compromissos são gravados no disco privado e servidos pelas rotas autenticadas documentadas na API. Para localizar os arquivos legados que ainda estão no disco público, rode `php artisan anexos:privatizar` (prévia sem alterações). Depois de revisar a saída, `php artisan anexos:privatizar --apply` copia e valida os arquivos privados antes de remover as cópias públicas.
