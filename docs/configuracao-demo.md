# Configuração da demonstração

## Dados do escritório fictício

Edite `frontend/src/configs/demoOffice.ts` para atualizar o nome, nome abreviado, e-mail, telefone, endereço, cores, redes sociais, equipe e logo usados nas rotas públicas do escritório demonstrativo. Os contatos atuais usam o domínio reservado `.example` e telefone fictício. Mantenha esses valores sem links de envio de mensagens.

A descrição traduzível da banca fica em `frontend/src/messages/pt.json`, `en.json` e `es.json`. A página raiz `/` é a apresentação do produto Gestão Jurídica/KDTech, em `frontend/src/views/ProductHome.tsx`; ela não deve ser usada para apresentar a banca.

## Logos

- `frontend/public/images/demo-office.svg`: logo genérico do escritório fictício; o caminho é configurado por `demoOffice.logo`.
- `frontend/public/images/gestao-juridica.svg`: logo do produto usado nos metadados.
- `frontend/src/app/icon.svg`: ícone do produto no navegador.

Troque os arquivos SVG ou atualize os caminhos centralizados ao aplicar uma identidade visual.

## Ativar ou desativar o modo demo

No frontend, configure `NEXT_PUBLIC_DEMO_MODE`:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

`true` é o padrão quando a variável não existe. Nesse modo, `/posts`, `/publicacoes`, `/equipe` e os detalhes públicos usam os registros sintéticos de `frontend/src/data/publicDemo.ts`, e o aviso de demonstração aparece nos idiomas PT/EN/ES.

Defina `NEXT_PUBLIC_DEMO_MODE=false` para ocultar o aviso e permitir que as rotas públicas de conteúdo consultem as APIs normais. A página `/` continua sendo a apresentação do produto.

## Limite de segurança

O modo demo do frontend não cria nem anonimiza dados no backend e não torna segura uma base conectada com registros reais. Não habilite login demonstrativo contra produção. Use uma instalação isolada, banco de demonstração e contas fictícias. Não execute `AdvogadosReaisSeeder.php` nesse ambiente.
