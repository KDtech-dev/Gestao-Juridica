# WhatsApp — primeira versão da Central Jurídica

## Escopo e decisões

Backend Laravel 12.62.0 (composer.lock), Sanctum, Spatie Permission, filas Laravel e Cloud API oficial. Frontend Next.js 16.3.5, React 19.2.4, MUI 7 e next-intl 4. O cartão fica em **Perfil → Avisos pelo WhatsApp**, em pt/en/es. Não há nova central de notificações nem atendimento por chat.

A agenda real é `Compromisso`, com tipos `COMPROMISSO`, `LEMBRETE`, `AUDIENCIA`, `PRAZO`, `REUNIAO` e estados `PENDENTE`, `CONCLUIDO`, `CANCELADO`. Prazos são registros cadastrados: não há cálculo jurídico ou fonte de movimentações processuais.

A agenda geral existente é compartilhada. A leitura está agora explícita em `CompromissoPolicy::view/viewAny`: usuários ativos com papel admin, advogado ou funcionario. A API e os envios usam essa política. A visão pessoal continua filtrando pelo criador. Os avisos de negócio vão **somente para advogados ativos com cadastro Advogado**, telefone verificado, consentimento e categoria habilitada. Podem incluir registros de outros criadores, conforme a agenda compartilhada. Clientes e usuários sem papel advogado não são destinatários de negócio.

`User` já tinha cast/verificação de `is_active` no login, mas a coluna não existia nas migrations. A migration acrescenta a coluna com padrão `true`, preservando contas existentes. Exclusão lógica também impede envio. Não foi criada outra interface de gestão de atividade de contas.

`NotificacaoService` continua alimentando o painel e seu `NotificationsProvider`. Criação/alteração/exclusão/restauração usam observer para o WhatsApp; operações do serviço são transacionais. Recibos de leitura não alteram compromissos nem notificações do painel. O histórico é restrito ao próprio advogado e administradores ativos; estes podem consultar todos e disparar diagnóstico separado.

## Instalação e configuração

Não foram executadas migrations no banco de uso do projeto, alterações na Meta ou mudanças na infraestrutura. Os testes usam SQLite em memória e HTTP simulado.

No ambiente escolhido, após revisar a configuração:

```bash
cd backend
php artisan migrate
php artisan config:clear
```

A migration incremental cria `whatsapp_preferences`, `whatsapp_messages`, `whatsapp_webhooks`, `whatsapp_delivery_events`, `compromissos.whatsapp_revision` e `users.is_active`. Aplique antes de atender requisições com o novo código. Preserve a `APP_KEY` para ler envelopes criptografados. Reutiliza o banco transacional do projeto e suas tabelas `jobs`/`failed_jobs`.

Variáveis documentadas em `backend/.env.example`; segredos ficam exclusivamente no backend, nunca em `NEXT_PUBLIC`, respostas, logs ou commits:

| Variável | Finalidade |
| --- | --- |
| `WHATSAPP_ENABLED` | `false` por padrão. Desliga todos os envios; webhooks ainda recebem opt-out e recibos. |
| `WHATSAPP_MODE` | `simulation`, `test`, `production`; valor desconhecido bloqueia envio. |
| `WHATSAPP_ACCESS_TOKEN` | Token da Cloud API, com permissão de envio e acesso ao ativo. |
| `WHATSAPP_PHONE_NUMBER_ID` | ID Meta do número remetente, não telefone do destinatário. |
| `WHATSAPP_WABA_ID` | Conta WhatsApp Business esperada nos webhooks. |
| `WHATSAPP_GRAPH_VERSION` | Versão explícita, por exemplo `v26.0`; vazia bloqueia envio real. |
| `WHATSAPP_APP_SECRET` | Segredo do aplicativo para a assinatura do POST. |
| `WHATSAPP_VERIFY_TOKEN` | Segredo independente escolhido para o desafio GET. |
| `WHATSAPP_TEST_RECIPIENTS` | Lista com `+` e DDI, separada por vírgulas. Vazia bloqueia todos os testes e diagnósticos. |
| `WHATSAPP_TIMEZONE` | Fuso da agenda legada e padrão das preferências: `America/Sao_Paulo`. |
| `WHATSAPP_DAILY_TIME` | Horário inicial de novas preferências: `08:00`. |
| `WHATSAPP_DIAGNOSTIC_TEMPLATE` | `hello_world`, quando disponível na conta de testes, idioma `en_US`. |
| `WHATSAPP_TEMPLATE_DAILY_PT/EN/ES` | Nomes aprovados do resumo por idioma, inicialmente vazios. |
| `WHATSAPP_TEMPLATE_REMINDER_PT/EN/ES` | Nomes aprovados do lembrete, inicialmente vazios. |
| `WHATSAPP_TEMPLATE_CHANGE_PT/EN/ES` | Nomes aprovados de criação/alteração/cancelamento, inicialmente vazios. |
| `FRONTEND_URL` | Origem da área autenticada; usar HTTPS fora do desenvolvimento local. |

Idioma: pt → pt_BR, en → en_US, es → es. Ajustar `config/whatsapp.php` se as traduções aprovadas usarem códigos diferentes. Antecedências iniciais `[1440, 60]` minutos; até cinco valores de 1 a 10080 por advogado. Resumo vazio é omitido (`send_empty_digest=false`).

Após mudar configuração, atualizar o cache (`php artisan config:cache`, quando usado) e reiniciar graciosamente workers (`php artisan queue:restart`). Processos persistentes precisam recarregar inclusive interruptor, modo e allowlist.

## Telefone, verificação e consentimento

1. Informar no perfil o telefone completo com `+` e DDI. Só são removidos espaços, parênteses, pontos e hífens; nenhum DDI ou nono dígito brasileiro é acrescentado. Cada telefone só pode estar associado a uma preferência.
2. Registrar consentimento, escolher categorias e salvar. Desligar consentimento desliga ambas. Trocar telefone invalida a verificação e exige registrar autorização para o novo número.
3. Gerar código e, do telefone salvo, enviar `VERIFICAR <código>` ao número remetente configurado em até 15 minutos. É mensagem iniciada pelo usuário, sem OTP enviado automaticamente. O banco guarda apenas o hash do código.
4. O webhook assinado verifica código e remetente. Atualizar a tela para conferir o resultado.
5. `SAIR`, `PARAR`, `STOP`, `SALIR` do telefone verificado revogam consentimento e cancelam pendências. Mensagens anteriores à verificação/novo consentimento não desfazem uma autorização posterior. Também é possível desabilitar no perfil.

Para simulação, depois de salvar telefone e consentimento:

```bash
cd backend
php artisan whatsapp:simulate-verification advogado@example.test
```

Só funciona em `APP_ENV=local/testing` e modo `simulation`. A verificação simulada **não autoriza envio real**; para isso, verificar pelo webhook. O diagnóstico não verifica telefone nem concede consentimento.

## Fila, Scheduler e site fechado

Reutiliza a fila `default` do Laravel. O arquivo `/etc/systemd/system/advocacia-queue.service` e unidades equivalentes locais não foram encontrados; o bus systemd não estava acessível. Não há comprovação de worker/Scheduler operacional neste ambiente.

Desenvolvimento, em terminais separados:

```bash
cd backend
php artisan queue:work --queue=default --sleep=1 --tries=3 --timeout=60
```

```bash
cd backend
php artisan schedule:work
```

No servidor, conferir `systemctl cat/status advocacia-queue.service`, usuário, diretório, PHP, ambiente, banco, fila e restart antes de criar outra unidade. O job limita suas próprias tentativas. Timeout do worker deve ser menor que `retry_after` da fila (database: 90 segundos por padrão).

Cron convencional, **a instalar pelo responsável pela infraestrutura**, uma vez por minuto:

```cron
* * * * * cd /caminho/advocacia-gestao/backend && php artisan schedule:run >> /caminho/logs/scheduler.log 2>&1
```

`routes/console.php` executa `whatsapp:dispatch` a cada minuto, com `withoutOverlapping`. Processa primeiro webhooks pendentes, depois intenções vencidas por `<= agora`. Para conferência manual:

```bash
php artisan whatsapp:dispatch
php artisan schedule:list
```

Intenções são persistidas e jobs despachados após commit. Falhas de fila deixam a intenção recuperável pelo Scheduler e não derrubam o painel. A varredura pode despachar jobs repetidos; chave única e bloqueio transacional por intenção impedem duas tentativas simultâneas. Resumo usa usuário/data local; eventos usam usuário/compromisso/revisão/tipo/antecedência. Alterações cancelam pendências e recalculam lembretes; conclusão impede avisos; restauração cria outra revisão.

`data`/`hora` legados são interpretados em `WHATSAPP_TIMEZONE`. Datas do módulo são persistidas e interpretadas em UTC, independentemente de `APP_TIMEZONE`. Registros sem hora mantêm sua data de calendário e não geram lembretes em horário inventado.

O resumo agrega quantidades de compromissos pendentes acessíveis e de prazos na data local, com link `/agenda`. Não envia títulos, clientes, processos ou descrições. A API da agenda verifica autenticação/autorização ao abrir o link.

| Aviso | Validade |
| --- | --- |
| Resumo | Quatro horas após horário configurado, na mesma data local. |
| Lembrete | 30 minutos após horário lógico, limitado ao início do evento. |
| Criação/alteração/cancelamento | 24 horas; criação/alteração também bloqueadas após início do evento. |
| Diagnóstico | 15 minutos. |

Não há envio acumulado após indisponibilidade além dessas janelas. Um resumo não se repete na data, inclusive após simulação, mudança de modo ou cancelamento por estar vazio. Alterar horário/fuso atualiza resumos pendentes, sem reviver os já concluídos.

## Estados, falhas e reconciliação

Estados: `pending`, `processing`, `accepted`, `sent`, `delivered`, `read`, `failed`, `cancelled`, `expired`, `simulated`, `indeterminate`. Histórico traduz estados, modo, horário, destinatário mascarado, tentativas, erros sanitizados e recibos. `accepted` não significa entregue; `simulated` nunca significa entrega.

- Cada execução revalida interruptor, modo, allowlist, papel/atividade, telefone, consentimento, categoria, política do registro, revisão e validade. Uma intenção de outro modo é cancelada, evitando transformar simulação em envio real.
- HTTP 429: até três tentativas totais, intervalos de 60 e 300 segundos, dentro da validade. Rejeições definitivas falham; não há texto livre como fallback.
- Timeout, falha de transporte, resposta ambígua/5xx e worker interrompido por mais de cinco minutos ficam `indeterminate`, sem retry automático: a Meta pode ter aceitado antes da falha.
- `biz_opaque_callback_data` carrega o UUID da intenção. Recibo posterior pode associar `wamid` e reconciliar, validando WABA, Phone Number ID e destinatário.
- Recibos anteriores à resposta HTTP não são sobrescritos por ela. Sem callback opaco, um recibo ainda sem correspondência fica recuperável por 24 horas para aguardar persistência do `wamid`.
- Recibos são deduplicados. Estados positivos só avançam; falha atrasada fica no histórico sem apagar envio/entrega/leitura confirmados.

Sem recibo correlacionável, investigar no histórico e na Meta. **Não** alterar indeterminado para pendente ou presumir falha de entrega. Não há promessa de exatamente uma vez. Mensagem já aceita não pode ser desfeita após revogação.

Monitorar pendências antigas, indeterminados, falhas, `failed_jobs`, ausência de recibos e execução do Scheduler. Envelopes são criptografados, mas podem conter mensagens recebidas: restringir banco, backups e APP_KEY. Não há expurgo automático nesta primeira versão; definir retenção/arquivamento do histórico antes da operação prolongada.

## Webhook HTTPS

Callback: `https://SEU_BACKEND/api/whatsapp/webhook`.

- GET exige `hub.mode=subscribe` e `hub.verify_token` correto, respondendo `hub.challenge`. PHP normaliza pontos desses parâmetros para sublinhados.
- POST exige `X-Hub-Signature-256`: `sha256=` + HMAC-SHA256 do **corpo original**, com `WHATSAPP_APP_SECRET`, comparado em tempo constante. Verify token e App Secret são distintos.
- Persiste envelope autenticado/criptografado antes do 200. Falha de banco não confirma recebimento. Processa por job; fila indisponível ou `sync` deixa a caixa de entrada para o Scheduler, sem processamento dentro da resposta.
- Conta/número/campo/destinatário inesperados não alteram dados. O envelope fica no banco para investigação.
- Configurar callback, confirmar desafio, assinar campo `messages` e aplicativo na WABA correta. Proxy deve preservar corpo/cabeçalho. Excluir tokens, corpos e queries com verify token dos access logs.
- Demais rotas permanecem sob Sanctum; apenas GET/POST de webhook são públicos, com POST autenticado criptograficamente.

## Templates próprios a aprovar

Os nomes abaixo são **propostas**, não templates aprovados. Submeter na WABA de destino com traduções e parâmetros; preencher `.env` somente após aprovação. Não há registro automático de templates. Todos os avisos usam templates, mesmo dentro da janela; nunca há fallback para texto livre.

| Proposta | Parâmetros BODY posicionais, todos `text` |
| --- | --- |
| `central_resumo_v1` | `{{1}}` data local; `{{2}}` total; `{{3}}` prazos; `{{4}}` URL autenticada. |
| `central_lembrete_v1` | `{{1}}` data/hora local; `{{2}}` URL autenticada. |
| `central_alteracao_v1` | `{{1}}` ação traduzida; `{{2}}` data/hora ou data; `{{3}}` URL autenticada. |

Textos propostos, utilidade sujeita à classificação/aprovação da Meta:

| Idioma | Resumo |
| --- | --- |
| pt_BR | Central Jurídica — resumo de {{1}}: {{2}} compromissos pendentes, incluindo {{3}} prazos. Consulte a agenda: {{4}}. Para interromper, responda SAIR. |
| en_US | Central Jurídica — summary for {{1}}: {{2}} pending appointments, including {{3}} deadlines. Open your calendar: {{4}}. Reply STOP to opt out. |
| es | Central Jurídica — resumen de {{1}}: {{2}} compromisos pendientes, incluidos {{3}} plazos. Consulta tu agenda: {{4}}. Responde SALIR para dejar de recibir avisos. |

| Idioma | Lembrete |
| --- | --- |
| pt_BR | Central Jurídica — lembrete de compromisso em {{1}}. Detalhes: {{2}}. Para interromper, responda SAIR. |
| en_US | Central Jurídica — appointment reminder for {{1}}. Details: {{2}}. Reply STOP to opt out. |
| es | Central Jurídica — recordatorio de compromiso para {{1}}. Detalles: {{2}}. Responde SALIR para dejar de recibir avisos. |

| Idioma | Criação/alteração/cancelamento |
| --- | --- |
| pt_BR | Central Jurídica — compromisso {{1}}, referente a {{2}}. Consulte a agenda: {{3}}. Para interromper, responda SAIR. |
| en_US | Central Jurídica — appointment {{1}}, scheduled for {{2}}. Open your calendar: {{3}}. Reply STOP to opt out. |
| es | Central Jurídica — compromiso {{1}}, previsto para {{2}}. Consulta la agenda: {{3}}. Responde SALIR para dejar de recibir avisos. |

Envia `POST /{versão}/{Phone Number ID}/messages`, `messaging_product=whatsapp`, destinatário individual, `type=template`, nome/idioma/BODY. Não incluir cabeçalhos/botões obrigatórios sem ajustar o sender. `hello_world` não usa parâmetros, usa `en_US` e é reservado ao diagnóstico.

## Primeiro envio real, executado pelo administrador

1. No painel de desenvolvedores Meta, criar/selecionar aplicativo com caso de uso WhatsApp e abrir configuração/testes da API.
2. Usar **número de teste fornecido pela Meta como remetente**. Cadastrar seu WhatsApp pessoal apenas como **destinatário de teste**, concluindo a confirmação da Meta. Não cadastrá-lo/migrá-lo como número comercial remetente na Cloud API.
3. Obter token, Phone Number ID, WABA ID e App Secret do teste. Configurar somente no backend. Selecionar versão suportada revisada, por exemplo `v26.0`, e verify token próprio.
4. Configurar/assinar webhook HTTPS. Preencher também a lista local `WHATSAPP_TEST_RECIPIENTS=+SEU_NUMERO_COMPLETO`; ela é adicional à autorização da Meta.
5. Definir `WHATSAPP_MODE=test`, `WHATSAPP_ENABLED=true` e confirmar `hello_world` disponível em `en_US`. Recarregar configuração/workers.
6. Entrar como administrador em **Perfil → Avisos pelo WhatsApp → Diagnóstico do administrador**, informar o número e clicar **Enviar diagnóstico real**. Esse é o procedimento explícito para a primeira mensagem; não foi executado durante a implementação. Servidor e job exigem allowlist e configuração.
7. Atualizar histórico: conferir aceitação e depois recibos de envio/entrega/leitura. Indeterminado exige investigação antes de nova tentativa.
8. Para negócio, verificar telefone no perfil de advogado, consentir e configurar templates próprios aprovados. Criar evento futuro, alterar/cancelar e conferir resumo/lembretes. Diagnóstico não verifica nem autoriza telefone automaticamente.

Diagnóstico é proibido em produção. O botão só permite envio real quando backend está configurado para teste.

## Passagem para produção

Não é apenas trocar um telefone:

1. Escolher número definitivo do escritório; cumprir requisitos aplicáveis de conta comercial, nome de exibição, propriedade e verificação.
2. Cadastrar/verificar e registrar na Cloud API, com PIN de duas etapas quando exigido. Não usar o número pessoal destinatário. Revisar requisitos específicos de migração/coexistência se já houver uso comercial.
3. Obter IDs definitivos e token apropriado de usuário de sistema com ativos/permissões necessários; definir rotação, expiração e acesso restrito.
4. Configurar cobrança; revisar preços, limites e qualidade. Confirmar categoria/aprovação de templates, que podem ser reclassificados pela Meta.
5. Confirmar templates/traduções aprovados **na WABA de destino**, sem presumir migração dos modelos de teste.
6. Assinar aplicativo/campo `messages` na conta definitiva; confirmar callback HTTPS, App Secret e recibos com IDs definitivos.
7. Revisar consentimentos, verificação real, acesso, fila, Scheduler, monitoramento e retenção. Habilitar `production`, recarregar workers e realizar teste controlado autorizado.

## Validação e arquivos

```bash
cd backend
php artisan test --compact
```

```bash
cd frontend
npx tsc --noEmit
npx eslint src/components/users/CardWhatsApp.tsx src/views/Profile.tsx
npm run build -- --webpack
```

Testes cobrem simulação, templates, allowlist em execução, preferências/permissões, duplicações, cancelamento/restauração, commit/rollback, recuperação, UTC/fusos, validade, timeout, retries, assinatura, criptografia, eventos fora de ordem, conta/número inesperado, verificação/opt-out e acesso ao histórico. SQLite não substitui ensaio de concorrência com banco/workers de produção. A implementação usa chave única e bloqueio transacional, sem garantia de exatamente uma vez no provedor.

Build Webpack passou. Turbopack encontrou `binding to a port: Operation not permitted`, inclusive com permissão ampliada; a configuração não foi alterada para ocultar a limitação. Há avisos preexistentes de `middleware` e Edge Runtime.

Novos arquivos:

- `backend/config/whatsapp.php`; migration `2026_09_22_000000_create_whatsapp_module.php`.
- Modelos `WhatsAppModel`, `WhatsAppPreference`, `WhatsAppMessage`, `WhatsAppWebhook`, `WhatsAppDeliveryEvent`.
- Serviços `app/Services/WhatsApp/{Phone,Outbox,Sender,Webhooks}.php`.
- Jobs `SendWhatsAppMessage`, `ProcessWhatsAppWebhook`; observer `WhatsAppCompromissoObserver`.
- Controllers `Api/WhatsAppController`, `Api/WhatsAppWebhookController`.
- Comandos `DispatchWhatsApp`, `SimulateWhatsAppVerification`; `tests/Feature/WhatsAppTest.php`.
- `frontend/src/components/users/CardWhatsApp.tsx` e este guia.

Integrados: `.env.example`, `User.php`, `CompromissoPolicy.php`, `CompromissoController.php`, `CompromissoService.php`, `AppServiceProvider.php`, `routes/api.php`, `routes/console.php`, `frontend/src/views/Profile.tsx`, mensagens pt/en/es. Alterações anteriores em auditoria, seeders e tela de logs foram preservadas.

Pendências externas: migrations no ambiente escolhido; credenciais/conta e destinatário de teste; aprovação de templates; webhook HTTPS; worker/Scheduler operacionais; diagnóstico autorizado e confirmação no aparelho. Não foram validados entrega real, cobrança ou configuração da conta.

## Fontes oficiais consultadas em 22/09/2026

- [Versões Graph](https://developers.facebook.com/docs/graph-api/changelog/versions/): v26.0 lançada em 29/07/2026, mantendo versão configurável.
- [Ambiente de testes](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started): aplicativo, hello_world, tokens e webhook.
- [Mensagens e janela de atendimento](https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages): janela de 24 horas, opt-in e templates fora dela.
- [Templates de utilidade](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/utility-templates/utility-templates): componentes, aprovação e envio.
- [Assinatura e desafio](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/): validação do corpo com App Secret.
- [Recibos de status](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/status): estados e callback opaco.
- [Coleção oficial Meta](https://www.postman.com/meta/whatsapp-business-platform/folder/o48mro7/messages): endpoint e rastreamento por ID.
