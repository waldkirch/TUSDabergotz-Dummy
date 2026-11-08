<?php
declare(strict_types=1);
if (!defined('TUSD')) { http_response_code(404); exit; }

/* Gemeinsame Helfer für Kontaktformular und Admin-Bereich. */

function cfg(): array {
    static $c = null;
    if ($c === null) {
        $file = __DIR__ . '/config.php';
        if (!is_file($file)) throw new RuntimeException('inc/config.php fehlt auf dem Server');
        if (!is_readable($file)) throw new RuntimeException('inc/config.php ist nicht lesbar (Dateirechte)');
        $c = require $file;
        if (!is_array($c)) throw new RuntimeException('inc/config.php ist fehlerhaft');
    }
    return $c;
}

function h(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Datenordner liegt standardmäßig NEBEN dem web-Ordner (ISPConfig: .../webN/private/). */
function data_dir(string $sub = ''): string {
    $base = cfg()['data_dir'] ?: dirname(__DIR__, 2) . '/private/tus-submissions';
    $dir = rtrim($base, '/\\') . ($sub !== '' ? '/' . $sub : '');
    if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) {
        throw new RuntimeException('Datenordner nicht beschreibbar: ' . $dir);
    }
    return $dir;
}

/** Anonymisierter Schlüssel der Besucher-IP (nur für Spamschutz, nie im Klartext gespeichert). */
function client_key(): string {
    return hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', cfg()['secret']);
}

/** Erlaubt höchstens $max Aufrufe je $window Sekunden. Gibt false zurück, wenn das Limit erreicht ist. */
function rate_allow(string $bucket, int $max, int $window): bool {
    $file = data_dir('ratelimit') . '/' . $bucket . '-' . substr(client_key(), 0, 32) . '.json';
    $fh = fopen($file, 'c+');
    if (!$fh) return true;
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $hits = array_values(array_filter(json_decode($raw ?: '[]', true) ?: [], fn($t) => $t > time() - $window));
    $allowed = count($hits) < $max;
    if ($allowed) $hits[] = time();
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($hits));
    flock($fh, LOCK_UN);
    fclose($fh);
    return $allowed;
}

function save_submission(array $data): string {
    $id = date('Ymd-His') . '-' . bin2hex(random_bytes(4));
    $data['id'] = $id;
    $data['created'] = date('c');
    $data['read'] = false;
    $path = data_dir('submissions') . '/' . $id . '.json';
    if (file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX) === false) {
        throw new RuntimeException('Speichern fehlgeschlagen');
    }
    @chmod($path, 0640);
    return $id;
}

function valid_id(string $id): bool {
    return (bool) preg_match('/^\d{8}-\d{6}-[a-f0-9]{8}$/', $id);
}

function list_submissions(): array {
    $out = [];
    foreach (glob(data_dir('submissions') . '/*.json') ?: [] as $f) {
        $d = json_decode((string) file_get_contents($f), true);
        if (is_array($d)) $out[] = $d;
    }
    usort($out, fn($a, $b) => strcmp($b['id'] ?? '', $a['id'] ?? ''));
    return $out;
}

function update_submission(string $id, callable $fn): void {
    if (!valid_id($id)) return;
    $path = data_dir('submissions') . '/' . $id . '.json';
    $d = is_file($path) ? json_decode((string) file_get_contents($path), true) : null;
    if (!is_array($d)) return;
    file_put_contents($path, json_encode($fn($d), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX);
}

function delete_submission(string $id): void {
    if (!valid_id($id)) return;
    @unlink(data_dir('submissions') . '/' . $id . '.json');
}

function is_https(): bool {
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}
