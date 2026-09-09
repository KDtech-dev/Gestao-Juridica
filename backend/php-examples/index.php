<?php

declare(strict_types=1);

require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

function json_input(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function bearer_token(): ?string
{
    $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!is_string($hdr) || $hdr === '') return null;
    if (stripos($hdr, 'Bearer ') !== 0) return null;
    return trim(substr($hdr, 7));
}

function auth_user(): ?array
{
    $token = bearer_token();
    if (!$token) return null;

    $pdo = db();
    $stmt = $pdo->prepare('SELECT u.* FROM auth_tokens t JOIN users u ON u.id = t.user_id WHERE t.token = :t LIMIT 1');
    $stmt->execute([':t' => $token]);
    $row = $stmt->fetch();
    if (!$row) return null;

    unset($row['password_hash']);
    return $row;
}

function require_auth(): array
{
    $u = auth_user();
    if (!$u) respond(401, ['success' => false, 'message' => 'Nao autenticado.']);
    return $u;
}

function require_admin(array $u): void
{
    if (($u['role'] ?? '') !== 'admin') {
        respond(403, ['success' => false, 'message' => 'Acesso restrito (admin).']);
    }
}

function validate_email(?string $email): bool
{
    if ($email === null || $email === '') return true;
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function normalize_cpf(?string $cpf): ?string
{
    if ($cpf === null) return null;
    $digits = preg_replace('/\\D/', '', $cpf);
    if (!is_string($digits)) return null;
    $digits = substr($digits, 0, 11);
    return $digits === '' ? null : $digits;
}

function serialize_user_row(array $row): array
{
    unset($row['password_hash']);
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'cpf' => $row['cpf'],
        'phone' => $row['phone'],
        'role' => $row['role'],
        'oab' => $row['oab'],
        'cargo' => $row['cargo'],
        'is_active' => (bool) $row['is_active'],
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

if ($method === 'POST' && $path === '/auth/login') {
    $body = json_input();
    $identifier = trim((string) ($body['identifier'] ?? ''));
    $password = (string) ($body['password'] ?? '');

    if ($identifier === '' || $password === '') {
        respond(422, ['success' => false, 'message' => 'Identifier e senha sao obrigatorios.']);
    }

    $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'cpf';
    $identifierValue = $field === 'cpf' ? (normalize_cpf($identifier) ?? '') : $identifier;

    $pdo = db();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE {$field} = :v LIMIT 1");
    $stmt->execute([':v' => $identifierValue]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, (string) $user['password_hash'])) {
        respond(422, ['success' => false, 'message' => 'Credenciais invalidas.']);
    }

    if (!(bool) $user['is_active']) {
        respond(403, ['success' => false, 'message' => 'Usuario inativo.']);
    }

    $token = bin2hex(random_bytes(32));
    $stmt = $pdo->prepare('INSERT INTO auth_tokens (user_id, token) VALUES (:uid, :t)');
    $stmt->execute([':uid' => $user['id'], ':t' => $token]);

    respond(200, [
        'success' => true,
        'data' => [
            'token' => $token,
            'user' => serialize_user_row($user),
        ],
    ]);
}

if ($path === '/usuarios' && $method === 'GET') {
    $u = require_auth();
    require_admin($u);

    $pdo = db();
    $stmt = $pdo->query("SELECT * FROM users ORDER BY name ASC");
    $rows = $stmt->fetchAll();

    respond(200, [
        'success' => true,
        'data' => array_map('serialize_user_row', $rows ?: []),
        'meta' => ['total' => is_array($rows) ? count($rows) : 0],
    ]);
}

if ($path === '/usuarios' && $method === 'POST') {
    $u = require_auth();
    require_admin($u);

    $body = json_input();
    $name = trim((string) ($body['name'] ?? ''));
    $email = isset($body['email']) ? trim((string) $body['email']) : null;
    $cpf = normalize_cpf(isset($body['cpf']) ? (string) $body['cpf'] : null);
    $phone = isset($body['phone']) ? trim((string) $body['phone']) : null;
    $password = (string) ($body['password'] ?? '');
    $role = trim((string) ($body['role'] ?? ''));
    $oab = isset($body['oab']) ? trim((string) $body['oab']) : null;
    $cargo = isset($body['cargo']) ? trim((string) $body['cargo']) : null;

    if ($name === '') respond(422, ['success' => false, 'message' => 'Nome e obrigatorio.']);
    if (($email === null || $email === '') && ($cpf === null || $cpf === '')) {
        respond(422, ['success' => false, 'message' => 'Informe email ou CPF.']);
    }
    if (!validate_email($email)) respond(422, ['success' => false, 'message' => 'Email invalido.']);
    if (strlen($password) < 6) respond(422, ['success' => false, 'message' => 'Senha minima: 6 caracteres.']);
    if (!in_array($role, ['admin', 'advogado', 'funcionario', 'cliente'], true)) {
        respond(422, ['success' => false, 'message' => 'Role invalida.']);
    }

    $pdo = db();
    if ($email) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :e LIMIT 1');
        $stmt->execute([':e' => $email]);
        if ($stmt->fetch()) respond(409, ['success' => false, 'message' => 'Email ja cadastrado.']);
    }
    if ($cpf) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE cpf = :c LIMIT 1');
        $stmt->execute([':c' => $cpf]);
        if ($stmt->fetch()) respond(409, ['success' => false, 'message' => 'CPF ja cadastrado.']);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (name, email, cpf, phone, role, oab, cargo, password_hash) VALUES (:n,:e,:c,:p,:r,:o,:g,:h)');
    $stmt->execute([
        ':n' => $name,
        ':e' => $email ?: null,
        ':c' => $cpf ?: null,
        ':p' => $phone ?: null,
        ':r' => $role,
        ':o' => $oab ?: null,
        ':g' => $cargo ?: null,
        ':h' => $hash,
    ]);

    $id = (int) $pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $created = $stmt->fetch();

    respond(201, ['success' => true, 'data' => serialize_user_row($created ?: ['id' => $id, 'name' => $name])]);
}

if (preg_match('#^/usuarios/(\\d+)$#', $path, $m) === 1) {
    $u = require_auth();
    require_admin($u);

    $id = (int) $m[1];
    $pdo = db();

    if ($method === 'DELETE') {
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = :id');
        $stmt->execute([':id' => $id]);
        respond(200, ['success' => true, 'data' => []]);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $body = json_input();

        $fields = [];
        $params = [':id' => $id];

        foreach (['name', 'email', 'cpf', 'phone', 'role', 'oab', 'cargo', 'is_active'] as $key) {
            if (!array_key_exists($key, $body)) continue;
            $fields[] = "{$key} = :{$key}";
            $params[":{$key}"] = $key === 'cpf' ? (normalize_cpf((string) $body[$key]) ?: null) : $body[$key];
        }

        if (array_key_exists('password', $body) && is_string($body['password']) && $body['password'] !== '') {
            if (strlen($body['password']) < 6) {
                respond(422, ['success' => false, 'message' => 'Senha minima: 6 caracteres.']);
            }
            $fields[] = "password_hash = :password_hash";
            $params[':password_hash'] = password_hash($body['password'], PASSWORD_DEFAULT);
        }

        if (!$fields) respond(422, ['success' => false, 'message' => 'Nada para atualizar.']);

        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $updated = $stmt->fetch();
        respond(200, ['success' => true, 'data' => serialize_user_row($updated ?: ['id' => $id])]);
    }
}

respond(404, ['success' => false, 'message' => 'Rota nao encontrada.']);

