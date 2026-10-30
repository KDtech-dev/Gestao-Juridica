# Serviço WhatsApp com Baileys

Este processo Node mantém a sessão do WhatsApp e envia mensagens solicitadas pela fila Laravel. Ele não deve ser executado no navegador nem exposto diretamente à internet.

## Configuração local

Requer Node.js 20 ou superior. Configure um token longo e aleatório em `backend/.env` (`BAILEYS_SERVICE_TOKEN`). O serviço lê esse arquivo ao iniciar; uma variável `BAILEYS_SERVICE_TOKEN` exportada no processo tem prioridade.

```bash
cd backend/whatsapp
npm install
npm start
```

Por padrão, o serviço escuta apenas em `127.0.0.1:3100` e guarda credenciais em `backend/whatsapp/storage/auth`. Mantenha esse diretório persistente e privado. Para outro host/porta, defina `HOST`, `PORT` e `BAILEYS_AUTH_DIR`; atualize também `BAILEYS_SERVICE_URL` no Laravel. Se a API Laravel estiver em outro endereço, defina `BAILEYS_CALLBACK_URL` no ambiente do processo Node (padrão `http://127.0.0.1:8000/api/internal/whatsapp/delivery`). Em produção, configure o serviço como processo supervisionado e forneça armazenamento persistente protegido.

## Pareamento

1. Inicie o serviço Node.
2. Autentique como administrador e consulte `GET /api/admin/whatsapp/status`.
3. Enquanto o status indicar `connecting`, abra a tela **WhatsApp** no menu administrativo ou consulte `GET /api/admin/whatsapp/qr`; escaneie a imagem do QR usando **Aparelhos conectados** no WhatsApp.
4. Consulte o status até retornar `connected`.

O QR é sensível: trate a resposta como credencial de acesso e não a compartilhe. A sessão pareada persiste no diretório de autenticação e não deve ser versionada.

## Mensagens

O endpoint interno `POST /messages` aceita `{ "phone": "5511999999999", "message": "..." }`. Ele exige Bearer token, valida se o telefone está registrado no WhatsApp e retorna `202` após o envio. No Laravel, os lembretes de compromisso para hoje são enfileirados na fila `whatsapp`; mantenha ativo um worker que consuma essa fila.

O projeto usa a integração não oficial Baileys sobre WhatsApp Web. Use somente para mensagens esperadas pelos destinatários, mantenha o serviço privado e respeite os termos e limites aplicáveis do WhatsApp. Para operação comercial crítica, avalie a WhatsApp Business Platform oficial.
