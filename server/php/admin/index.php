<?php
declare(strict_types=1);
define('TUSD', 1);
require __DIR__ . '/../inc/lib.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data:; form-action 'self'; base-uri 'none'");

$base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/';
session_name('tusd_admin');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => $base,
    'secure' => is_https(),
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

const IDLE_LIMIT = 7200; // 2 Stunden ohne Aktivität -> abmelden

if (isset($_SESSION['auth'], $_SESSION['last']) && time() - $_SESSION['last'] > IDLE_LIMIT) {
    $_SESSION = [];
}
if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(16));
}
$csrf = $_SESSION['csrf'];
$authed = !empty($_SESSION['auth']);
if ($authed) $_SESSION['last'] = time();

$error = '';
try {
    $hash = (string) cfg()['admin_password_hash'];
} catch (Throwable $e) {
    error_log('admin: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Einrichtungsfehler: ' . $e->getMessage());
}
$configured = $hash !== '' && $hash !== '__HASH__';

function csrf_ok(): bool {
    return hash_equals($_SESSION['csrf'] ?? '', (string) ($_POST['csrf'] ?? ''));
}
function redirect(string $to = ''): never {
    global $base;
    header('Location: ' . $base . $to);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $action = (string) ($_POST['action'] ?? '');

    if (!csrf_ok()) {
        http_response_code(400);
        $error = 'Die Sitzung ist abgelaufen. Bitte noch einmal versuchen.';
    } elseif ($action === 'login') {
        if (!$configured) {
            $error = 'Es ist noch kein Passwort gesetzt (npm run passwort).';
        } elseif (!rate_allow('login', 5, 900)) {
            http_response_code(429);
            $error = 'Zu viele Versuche. Bitte in 15 Minuten noch einmal probieren.';
        } elseif (password_verify((string) ($_POST['passwort'] ?? ''), $hash)) {
            session_regenerate_id(true);
            $_SESSION['auth'] = true;
            $_SESSION['last'] = time();
            $_SESSION['csrf'] = bin2hex(random_bytes(16));
            redirect();
        } else {
            usleep(500000);
            $error = 'Passwort stimmt nicht.';
        }
    } elseif ($authed) {
        $id = (string) ($_POST['id'] ?? '');
        if ($action === 'logout') {
            $_SESSION = [];
            session_destroy();
            redirect();
        } elseif ($action === 'delete') {
            delete_submission($id);
            redirect();
        } elseif ($action === 'toggle') {
            update_submission($id, function (array $d) { $d['read'] = empty($d['read']); return $d; });
            redirect('#m-' . $id);
        }
    }
}

// CSV-Export (Semikolon-getrennt, öffnet direkt in deutschem Excel)
if ($authed && ($_GET['export'] ?? '') === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="nachrichten-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    $safe = fn($v) => preg_match('/^[=+\-@\t\r]/', (string) $v) ? "'" . $v : (string) $v;
    fputcsv($out, ['Eingegangen', 'Vorname', 'Name', 'E-Mail', 'Nachricht', 'Gelesen'], ';');
    foreach (list_submissions() as $m) {
        fputcsv($out, [
            date('d.m.Y H:i', strtotime($m['created'] ?? 'now')),
            $safe($m['vorname'] ?? ''), $safe($m['name'] ?? ''), $safe($m['email'] ?? ''),
            $safe($m['nachricht'] ?? ''), !empty($m['read']) ? 'ja' : 'nein',
        ], ';');
    }
    exit;
}

$messages = [];
$loadError = '';
if ($authed) {
    try {
        $messages = list_submissions();
    } catch (Throwable $e) {
        error_log('admin: ' . $e->getMessage());
        $loadError = 'Der Datenordner ist nicht lesbar. Bitte Schreibrechte für den Ordner "private" prüfen.';
    }
}
$unread = count(array_filter($messages, fn($m) => empty($m['read'])));
?>
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Nachrichten – TuS Dabergotz</title>
<style>
  :root { --red:#F51A21; --dark:#D2141A; --ink:#111; --soft:#4A4A4A; --shelf:#F7F7F7; }
  * { box-sizing: border-box; }
  body { margin:0; font:16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color:var(--ink); background:var(--shelf); }
  header { background:var(--red); color:#fff; }
  header div { max-width:60rem; margin:0 auto; padding:1rem; display:flex; gap:1rem; align-items:center; justify-content:space-between; flex-wrap:wrap; }
  header h1 { margin:0; font-size:1.25rem; }
  main { max-width:60rem; margin:0 auto; padding:1.5rem 1rem 4rem; }
  a { color:var(--dark); }
  .btn { display:inline-block; padding:.5rem 1rem; border:0; border-radius:999px; background:#fff; color:var(--dark); font:inherit; font-weight:700; cursor:pointer; text-decoration:none; }
  .btn--red { background:var(--red); color:#fff; }
  .btn--ghost { background:transparent; color:var(--dark); border:2px solid currentColor; }
  .card { background:#fff; border-radius:1rem; padding:1.25rem; box-shadow:0 2px 12px rgba(0,0,0,.08); margin-bottom:1rem; }
  .card.unread { border-left:6px solid var(--red); }
  .meta { color:var(--soft); font-size:.9rem; }
  .msg { white-space:pre-wrap; margin:.75rem 0 1rem; }
  .row { display:flex; gap:.5rem; flex-wrap:wrap; align-items:center; }
  label { display:block; font-weight:700; margin-bottom:.35rem; }
  input[type=password] { width:100%; padding:.7rem; font:inherit; border:2px solid #ccc; border-radius:.5rem; }
  .err { background:#fde8e8; color:#8a1015; padding:.75rem 1rem; border-radius:.5rem; margin-bottom:1rem; }
  .login { max-width:24rem; margin:4rem auto; }
  .badge { display:inline-block; background:var(--red); color:#fff; border-radius:999px; padding:.05rem .6rem; font-size:.8rem; font-weight:700; }
  form { margin:0; }
</style>
</head>
<body>
<?php if (!$authed): ?>
  <main class="login">
    <div class="card">
      <h1 style="margin-top:0">Nachrichten</h1>
      <?php if ($error): ?><p class="err" role="alert"><?= h($error) ?></p><?php endif; ?>
      <form method="post" autocomplete="off">
        <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
        <input type="hidden" name="action" value="login">
        <label for="pw">Passwort</label>
        <input id="pw" type="password" name="passwort" required autofocus autocomplete="current-password">
        <p><button class="btn btn--red" type="submit">Anmelden</button></p>
      </form>
    </div>
  </main>
<?php else: ?>
  <header>
    <div>
      <h1>Nachrichten von der Website <?php if ($unread): ?><span class="badge"><?= $unread ?> neu</span><?php endif; ?></h1>
      <div class="row" style="padding:0">
        <a class="btn" href="?export=csv">CSV-Export</a>
        <form method="post">
          <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
          <input type="hidden" name="action" value="logout">
          <button class="btn" type="submit">Abmelden</button>
        </form>
      </div>
    </div>
  </header>
  <main>
    <?php if ($loadError): ?><p class="err" role="alert"><?= h($loadError) ?></p><?php endif; ?>
    <?php if ($error): ?><p class="err" role="alert"><?= h($error) ?></p><?php endif; ?>
    <?php if (!$messages && !$loadError): ?>
      <p class="card">Noch keine Nachrichten eingegangen.</p>
    <?php endif; ?>
    <?php foreach ($messages as $m): $isNew = empty($m['read']); ?>
      <article class="card<?= $isNew ? ' unread' : '' ?>" id="m-<?= h($m['id']) ?>">
        <div class="row" style="justify-content:space-between">
          <strong><?= h(($m['vorname'] ?? '') . ' ' . ($m['name'] ?? '')) ?></strong>
          <span class="meta"><?= h(date('d.m.Y, H:i', strtotime($m['created'] ?? 'now'))) ?> Uhr</span>
        </div>
        <div class="meta"><a href="mailto:<?= h($m['email'] ?? '') ?>"><?= h($m['email'] ?? '') ?></a></div>
        <p class="msg"><?= h($m['nachricht'] ?? '') ?></p>
        <div class="row">
          <form method="post">
            <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
            <input type="hidden" name="action" value="toggle">
            <input type="hidden" name="id" value="<?= h($m['id']) ?>">
            <button class="btn btn--ghost" type="submit"><?= $isNew ? 'Als gelesen markieren' : 'Als ungelesen markieren' ?></button>
          </form>
          <form method="post" onsubmit="return confirm('Diese Nachricht endgültig löschen?');">
            <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= h($m['id']) ?>">
            <button class="btn btn--ghost" type="submit">Löschen</button>
          </form>
        </div>
      </article>
    <?php endforeach; ?>
  </main>
<?php endif; ?>
</body>
</html>
