# Perfis públicos de advogados

## Implementação

- Nova rota Next SSR: `/advogados/[slug]`.
- Slug calculado no frontend: `nome-normalizado-UUID`. Reutiliza o UUID do usuário já exposto pela API, sem novo identificador público e sem migration.
- O UUID distingue homônimos. Um link com nome antigo e UUID válido recebe redirecionamento permanente para o nome atual. Slug inválido ou UUID inexistente usa `notFound()` (HTTP 404).
- Reutiliza `GET /api/advogados`, inclusive o filtro de categorias já usado na Home. Busca no servidor compartilhada entre metadata e página por `React.cache`, limitada à requisição.
- Mantém o Resource Laravel, models, rotas e autenticação do backend. No frontend, apenas acrescenta o padrão exato da nova página à lista de rotas públicas do AuthGate.
- Hero, apresentação, especialidades, OAB, contato institucional e até três outros profissionais. Conteúdo ausente não gera seções vazias. Não há formação, cargo ou experiência no contrato público atual.
- Reutiliza Header, Footer, Avatar e LawyerProfileCard; mantém a interface MUI e o provider de next-intl existente. Busca, identificação, 404, redirecionamento e metadata permanecem no servidor; a apresentação segue o padrão cliente MUI/next-intl do projeto.
- Cards da Home são links completos, com foco visível e hover, sem texto “Ver perfil”. Cards relacionados têm essa ação textual.
- Usa a marca real configurada no projeto, “Central Jurídica”, no título SEO. Descrição vem do resumo, limitada a 160 caracteres. Open Graph inclui foto quando há URL pública absoluta; omite quando ausente ou relativa.
- URLs de fotos locais são convertidas para `/storage/...`, servido pelo proxy existente; esquemas inválidos são descartados. Avatar reutiliza o fallback nativo em fotos ausentes/quebradas.
- O telefone que já estava no Footer foi extraído para configuração compartilhada, sem trocar o número. Os botões usam a mensagem traduzida existente.

## Campos utilizados

`uuid`, `name`, `foto_perfil_url`, `oab_numero`, `oab_uf`, `resumo_pessoal`, `categorias`.

Não foram adicionados campos públicos, endpoints Laravel, dependências ou migrations. O teste de contrato confirma que CPF, e-mail, celular e quaisquer chaves além da lista pública não aparecem na resposta.

## Arquivos criados

- `frontend/src/app/advogados/[slug]/page.tsx`
- `frontend/src/app/advogados/[slug]/not-found.tsx`
- `frontend/src/app/advogados/[slug]/error.tsx`
- `frontend/src/views/AdvogadoPublico/index.tsx`
- `frontend/src/views/AdvogadoPublico/Status.tsx`
- `frontend/src/utils/advogadoPublico.ts`
- `frontend/src/configs/publicContact.ts`
- `backend/tests/Feature/AdvogadoPublicoTest.php`
- `docs/perfis-publicos-advogados.md`

## Arquivos modificados

- `frontend/src/@core/types.ts`
- `frontend/src/api/ApiAdvogados.ts`
- `frontend/src/components/Footer.tsx`
- `frontend/src/components/SpecialtiesSection.tsx`
- `frontend/src/components/SpecialtyLawyersCarousel.tsx`
- `frontend/src/components/auth/AuthGate.tsx`
- `frontend/src/components/team/LawyerProfileCard.tsx`
- `frontend/src/messages/pt.json`
- `frontend/src/messages/en.json`
- `frontend/src/messages/es.json`

## Validação

- Build de produção e TypeScript aprovados.
- Lint dos arquivos alterados aprovado.
- `npm run lint` geral: 10 erros e 14 avisos preexistentes fora dos arquivos alterados; não foram modificadas telas administrativas para resolver esses problemas.
- Teste Laravel em SQLite em memória: 1 teste, 9 asserções aprovadas, sem tocar nos dados existentes.
- Verificação dos utilitários: 11 asserções para homônimos, extração de UUID, OAB ausente, URLs públicas e rejeição/conversão de URLs locais.
- API real consultada anonimamente; perfil SSR retorna 200; UUID inexistente retorna 404; nome antigo com UUID válido retorna 308 para o slug canônico.
- Navegação Home → perfil e outros profissionais → perfil verificada com Enter no navegador.
- Textos em PT/EN/ES conferidos no navegador; nomes, OAB e especialidades cadastradas permanecem intactos.
- Perfil sem biografia/especialidades conferido; seções correspondentes ausentes.
- Layout mobile em 390 px e tablet em 768 px conferidos sem overflow horizontal; temas claro e escuro inspecionados; fallback de iniciais visível porque as fotos da base local estão nulas.
- Metadata e HTML SSR inspecionados: título/descrição corretos, sem URL de loopback serializada no perfil. A varredura geral dos bundles encontra apenas literais preexistentes do componente administrativo InputImage e da biblioteca Axios; nenhum literal de URL local foi introduzido pela funcionalidade.

## Deploy

Utilizar o ambiente Node/Next do projeto; esta rota é dinâmica e não é compatível com exportação estática para GitHub Pages.

```bash
cd /home/diego/advocacia-gestao/frontend
npm ci
npm run build
npm run start
```

Em produção, reinicie o processo Next pelo supervisor já utilizado no servidor após o build. Preserve a configuração existente de acesso à API e o proxy `/storage`. Não configure uma origem de loopback em variáveis destinadas ao navegador.

Não é necessário executar migrations, seeders, gerar chave Laravel ou alterar o banco. Nenhum commit ou push foi executado.


## Revisão: edição pelo próprio advogado

- A apresentação foi retirada do Hero e permanece somente em “Sobre o profissional”, eliminando a duplicação.
- No perfil interno, o atalho “Editar página pública” leva à seção “Minha página pública”, com apresentação, OAB e especialidades. O nome continua nos dados pessoais; a foto também pode ser alterada pelo botão dessa seção. “Salvar alterações” publica os dados; a foto é salva no upload. O link de visualização abre a página publicada em outra aba.
- O frontend deixou de usar `/users/{id}` (administrativo) para carregar/salvar o perfil do próprio usuário. Usa `GET /api/profile`, `PUT /api/profile` e o novo `POST /api/profile/foto`, todos protegidos por Sanctum e sempre vinculados ao usuário autenticado.
- A atualização própria valida os campos, permite limpar apresentação/especialidades e impede alterar papel, ID ou proprietário das relações. As rotas administrativas continuam restritas ao administrador. Nenhuma migration.
- Arquivos adicionais criados: `frontend/src/api/ApiProfile.ts`, `backend/tests/Feature/OwnLawyerProfileTest.php`.
- Alterados nesta revisão: `ProfileController.php`, `UpdateProfileRequest.php`, `UpdateUserRequest.php`, `ProfileService.php`, `backend/routes/api.php`, `Profile.tsx`, `CardDadosPessoais.tsx`, `CardDadosProfissionais.tsx`, a view pública e as traduções PT/EN/ES.
- Validação: build e TypeScript aprovados; lint dos arquivos frontend alterados aprovado; 7 testes Laravel com 44 asserções aprovadas (edição própria, visibilidade pública, limpeza de campos, foto, negação de acesso a terceiros/anônimos e regressão de perfil/senha). Testes usam SQLite em memória e armazenamento de fotos simulado.
- Deploy desta revisão: atualizar backend e frontend juntos. Se houver cache de rotas Laravel, executar `php artisan route:cache` no backend para registrar `/api/profile/foto`. Compilar o frontend e reiniciar o processo existente. Não executar seeders ou migrations.

### Edição pública em tela separada

O botão “Editar página pública” do perfil privado agora abre `/profile/publico`, uma rota protegida com formulário próprio. A edição pública reúne nome, foto, apresentação, OAB e especialidades uma única vez. Nome e foto continuam compartilhados com o cadastro, sem criar cópias no banco. O formulário privado não reenvia apresentação/OAB/especialidades ocultas, evitando sobrescrever o conteúdo público ao salvar dados privados.

Na página pública, a OAB aparece somente no Hero, a apresentação somente em “Sobre o profissional” e as categorias somente em “Áreas de atuação”. Foi retirado o bloco de informações profissionais que repetia a OAB. Novos arquivos: `frontend/src/app/profile/publico/page.tsx` e `frontend/src/views/PublicProfileEditor.tsx`. As rotas de edição continuam usando o usuário autenticado, sem ID de terceiro na URL.
