# Auditoria de responsividade

## Escopo

Foi feita inspeção estática dos layouts, páginas e componentes do frontend, seguida de verificação real no navegador local. As rotas públicas verificadas visualmente foram `/`, `/posts`, `/equipe` e `/publicacoes`; também foram abertas `/login`, um detalhe de publicação e um perfil público. As áreas autenticadas foram revisadas por código, mas não puderam ser exercitadas sem uma sessão de demonstração.

Na inspeção estática foram incluídas as rotas de autenticação (`/login`, `/register`, `/forgot-password`), conteúdo público (`/posts`, `/publicacoes`, `/equipe`, perfis de advogado e detalhes de publicação), gestão (`/clientes`, `/casos`, `/agenda`, `/users`, `/publicacoes/nova`, edição e lixeira), perfil (`/profile`, alteração de senha e perfil público), notificações, anexos e administração (`/admin/logs`, equipe). Também foram revisados `Header`, `HeaderADM`, `Sidebar`, `Footer`, DataGrid/Tables, gráfico financeiro, calendário, formulários e diálogos compartilhados.

## Viewports medidos

| Largura |        Home `/`         |        `/posts`         |        `/equipe`        |     `/publicacoes`      |
| ------: | :---------------------: | :---------------------: | :---------------------: | :---------------------: |
|  320 px | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal |
|  375 px | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal |
|  430 px | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal |
|  768 px | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal |
| 1024 px | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal |
| 1366 px | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal |
| 1920 px | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal |
| 2560 px | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal | sem overflow horizontal |

Login, perfil público e detalhe de publicação também foram abertos em 320 px sem overflow horizontal. No perfil, o conteúdo e o nome sintético apareceram na página; o login foi verificado sem submeter credenciais.

## Correções implementadas

- A antiga home da banca demonstrativa foi substituída pela apresentação responsiva do produto, com CTAs e cartões que reorganizam por breakpoint.
- O cabeçalho da home identifica Gestão Jurídica/KDTech e mantém navegação, idioma, tema e acessibilidade em alvos de toque de pelo menos 44 px. No celular, o controle de acessibilidade foi incorporado à navegação para não cobrir links nem CTAs.
- O aviso demo, as mensagens da home e os novos cartões foram conferidos em PT, EN e ES. Tema claro e escuro foram alternados no navegador.
- A navegação pública `/equipe` e `/publicacoes` estava sendo redirecionada ao chegar sem autenticação. As duas rotas foram adicionadas à lista pública de `AuthGate`.
- Sidebar autenticada usa Drawer MUI em telas menores; tabelas de clientes, processos, usuários e logs mantêm a largura de leitura em rolagem local do DataGrid/TableContainer; o gráfico financeiro usa `ResponsiveContainer` do Recharts.
- Menus de notificação e usuário limitam a largura ao viewport. Campos, cartões, formulários e diálogos usam breakpoints e contenção MUI nos componentes revisados.

## Verificações que faltam

O navegador não tinha sessão autenticada disponível. Portanto, DataGrid de clientes/processos/usuários, agenda, financeiro, perfil privado, anexos e diálogos internos foram inspecionados no código, mas não foram medidos visualmente nos oito viewports nem testados com mouse/teclado/toque. Isso requer uma conta e uma instalação de demonstração isolada. O relatório não afirma que essas telas passaram por teste visual.

## Validação automatizada

- `npx tsc --noEmit`: passou.
- `composer test`: 67 testes passaram, com 408 assertions.
- `npm run lint`: falhou com 9 erros já presentes em arquivos fora das alterações desta tarefa (`PickColor.tsx`, `LanguageContext.tsx`, `useDeleteUser.ts`, `UserSchema.ts`, `translateApiErrors.ts`, `views/Publicacoes/index.tsx` e `views/Users/Users.tsx`); também reportou 14 warnings.
- `npm run build`: não concluiu porque os workers do Turbopack foram bloqueados pelo ambiente ao tentar abrir uma porta local (`Operation not permitted`). `npx next build --webpack` também não concluiu: o Next não conseguiu interpretar a saída de `tsc --showConfig`, embora `npx tsc --noEmit` passe.
- `git diff --check` e parse JSON das mensagens PT/EN/ES: passaram.
