import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';

const port = Number(process.env.PORT || 3100);
const host = process.env.HOST || '127.0.0.1';
async function readBackendEnvValue(name) {
  try {
    const laravelEnv = await readFile(path.resolve('../.env'), 'utf8');
    const line = laravelEnv.split(/\r?\n/).find((entry) => new RegExp(`^\\s*${name}\\s*=`).test(entry));
    const value = line?.slice(line.indexOf('=') + 1).trim() || '';
    return value.replace(/^("([\s\S]*)"|'([\s\S]*)')$/, (_, _quoted, doubleQuoted, singleQuoted) => doubleQuoted ?? singleQuoted ?? '');
  } catch {
    return '';
  }
}

const token = process.env.BAILEYS_SERVICE_TOKEN || await readBackendEnvValue('BAILEYS_SERVICE_TOKEN');
const callbackUrl = process.env.BAILEYS_CALLBACK_URL
  || await readBackendEnvValue('BAILEYS_CALLBACK_URL')
  || 'http://127.0.0.1:8000/api/internal/whatsapp/delivery';
const authDirectory = path.resolve(process.env.BAILEYS_AUTH_DIR || './storage/auth');
const state = { status: 'starting', qr: null, phone: null, lastError: null };
let socket;
let reconnectTimer;
let resetting = false;

if (!token) {
  throw new Error('Configure BAILEYS_SERVICE_TOKEN no backend/.env ou exporte a variável antes de iniciar o serviço.');
}

await mkdir(authDirectory, { recursive: true, mode: 0o700 });

function tokenIsValid(request) {
  const supplied = request.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(token);

  return suppliedBuffer.length === expectedBuffer.length
    && timingSafeEqual(suppliedBuffer, expectedBuffer);
}

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16_384) throw new Error('Corpo da requisição excede o limite.');
  }
  return JSON.parse(body || '{}');
}

async function connect() {
  clearTimeout(reconnectTimer);
  state.status = 'connecting';
  state.lastError = null;
  state.qr = null; 

  const { state: auth, saveCreds } = await useMultiFileAuthState(authDirectory);
  const sock = makeWASocket({
    auth,
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });
  socket = sock;

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('messages.update', (updates) => {
    for (const { key, update } of updates) {
      const status = Number(update?.status);
      if (key?.fromMe && key.id && [1, 2, 3].includes(status)) {
        void reportMessageStatus(key.id, status);
      }
    }
  });
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (socket !== sock) return; 

    if (qr) state.qr = qr;
    if (connection === 'open') {
      state.status = 'connected';
      state.qr = null;
      state.phone = sock.user?.id?.split(':')[0] || null;
      state.lastError = null;
    }
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      state.phone = null;
      state.lastError = statusCode ? `connection_closed_${statusCode}` : 'connection_closed';

      if (statusCode === DisconnectReason.loggedOut) {
        
        state.status = 'logged_out';
        void resetSession();
      } else {
        state.status = 'disconnected';
        reconnectTimer = setTimeout(() => void connect(), 5_000);
      }
    }
  });
}

async function resetSession() {
  if (resetting) return;
  resetting = true;

  try {
    clearTimeout(reconnectTimer);
    const current = socket;
    socket = undefined;
    state.status = 'connecting';
    state.qr = null;
    state.phone = null;
    state.lastError = null;

    if (current) {
      
      current.ev.removeAllListeners('creds.update');
      current.ev.removeAllListeners('connection.update');
      try {
        await current.logout();
      } catch {
        try { current.end(undefined); } catch {  }
      }
    }

    await rm(authDirectory, { recursive: true, force: true });
    await mkdir(authDirectory, { recursive: true, mode: 0o700 });
    await connect();
  } finally {
    resetting = false;
  }
}

async function reportMessageStatus(messageId, status) {
  const retryDelays = [0, 500, 2_000, 5_000, 15_000];

  for (const delay of retryDelays) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ message_id: messageId, status }),
        signal: AbortSignal.timeout(5_000),
      });

      if (response.ok) return;
      if (response.status !== 404 && response.status < 500) break;
    } catch {
    }
  }

  console.warn(`Não foi possível sincronizar o status da mensagem ${messageId} com o Laravel.`);
}

const server = createServer(async (request, response) => {
  if (!tokenIsValid(request)) {
    json(response, 401, { success: false, message: 'Não autorizado.' });
    return;
  }

  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  if (request.method === 'GET' && url.pathname === '/status') {
    json(response, 200, {
      success: true,
      status: state.status,
      phone: state.phone,
      last_error: state.lastError,
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/qr') {
    const qrImage = state.qr ? await QRCode.toDataURL(state.qr, { margin: 2, width: 320 }) : null;
    json(response, 200, {
      success: true,
      status: state.status,
      qr: state.qr,
      qr_image: qrImage,
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/logout') {
    try {
      await resetSession();
      json(response, 200, { success: true, status: state.status });
    } catch (error) {
      state.lastError = 'reset_failed';
      json(response, 500, { success: false, message: error.message || 'Falha ao desconectar.' });
    }
    return;
  }

  if (request.method === 'POST' && url.pathname === '/messages') {
    try {
      const payload = await readJson(request);
      const phone = String(payload.phone || '').replace(/\D/g, '');
      const message = String(payload.message || '').trim();

      if (phone.length < 10 || phone.length > 15 || !message || message.length > 4096) {
        json(response, 422, { success: false, message: 'Telefone ou mensagem inválidos.' });
        return;
      }
      if (state.status !== 'connected' || !socket) {
        json(response, 503, { success: false, message: 'WhatsApp desconectado.' });
        return;
      }

      const [recipient] = await socket.onWhatsApp(`${phone}@s.whatsapp.net`);
      if (!recipient?.exists) {
        json(response, 422, { success: false, message: 'O telefone não possui uma conta WhatsApp.' });
        return;
      }

      const result = await socket.sendMessage(recipient.jid, { text: message });
      json(response, 202, { success: true, message_id: result?.key?.id || null });
    } catch (error) {
      json(response, 400, { success: false, message: error.message || 'Falha ao processar a requisição.' });
    }
    return;
  }

  json(response, 404, { success: false, message: 'Rota não encontrada.' });
});

await connect();
server.listen(port, host, () => {
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    clearTimeout(reconnectTimer);
    server.close(() => process.exit(0));
  });
}
  