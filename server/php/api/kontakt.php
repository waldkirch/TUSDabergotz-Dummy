<?php
declare(strict_types=1);
define('TUSD', 1);
require __DIR__ . '/../inc/lib.php';

header('X-Robots-Tag: noindex');
$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function respond(bool $ok, string $message, int $status = 200, array $errors = []): never {
    global $wantsJson;
    http_response_code($status);
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message, 'errors' => $errors], JSON_UNESCAPED_UNICODE);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        echo '<!DOCTYPE html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<title>Kontakt – TuS Dabergotz</title><body style="font-family:system-ui;background:#F51A21;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;padding:1rem;text-align:center">'
           . '<main><h1>' . h($message) . '</h1><p><a style="color:#fff" href="../index.html">Zurück zur Startseite</a></p></main>';
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Nur POST erlaubt.', 405);
}

try {
    // Spamschutz: Honigtopf-Feld und Mindestzeit zwischen Seitenaufruf und Absenden
    if (trim((string) ($_POST['website'] ?? '')) !== '') {
        respond(true, 'Danke, deine Nachricht ist angekommen.'); // Bots merken nichts
    }
    $ts = (int) ($_POST['ts'] ?? 0);
    if ($ts > 0 && (microtime(true) * 1000 - $ts) < 3000) {
        respond(false, 'Das ging etwas schnell. Bitte versuche es noch einmal.', 429);
    }
    if (!rate_allow('kontakt', 5, 3600)) {
        respond(false, 'Zu viele Nachrichten in kurzer Zeit. Bitte versuche es später noch einmal.', 429);
    }

    $clean = fn(string $k, int $max) => mb_substr(trim((string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', mb_scrub((string) ($_POST[$k] ?? '')))), 0, $max);
    $vorname = $clean('vorname', 100);
    $name = $clean('name', 100);
    $email = $clean('email', 254);
    $nachricht = $clean('nachricht', 5000);

    $errors = [];
    if ($vorname === '') $errors['vorname'] = 'Bitte trag deinen Vornamen ein.';
    if ($name === '') $errors['name'] = 'Bitte trag deinen Namen ein.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Bitte prüf die E-Mail-Adresse.';
    if ($nachricht === '') $errors['nachricht'] = 'Schreib uns kurz, worum es geht.';
    if (empty($_POST['datenschutz'])) $errors['datenschutz'] = 'Ohne diese Zustimmung dürfen wir die Nachricht nicht verarbeiten.';
    if ($errors) respond(false, 'Bitte prüf deine Angaben.', 422, $errors);

    save_submission([
        'vorname' => $vorname,
        'name' => $name,
        'email' => $email,
        'nachricht' => $nachricht,
        'datenschutz_zugestimmt' => true,
    ]);

    $to = trim((string) cfg()['notify_email']);
    if ($to !== '' && filter_var($to, FILTER_VALIDATE_EMAIL)) {
        $from = trim((string) cfg()['mail_from']);
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Reply-To: ' . $email,
        ];
        if (filter_var($from, FILTER_VALIDATE_EMAIL)) $headers[] = 'From: ' . $from;
        $body = "Neue Nachricht über die Website\n\nVon: $vorname $name <$email>\n\n$nachricht\n";
        @mail($to, '=?UTF-8?B?' . base64_encode('Neue Nachricht über die Website') . '?=', $body, implode("\r\n", $headers));
    }

    respond(true, 'Danke, deine Nachricht ist angekommen. Wir melden uns bei dir.');
} catch (Throwable $e) {
    error_log('kontakt.php: ' . $e->getMessage());
    respond(false, 'Das Senden hat leider nicht geklappt. Bitte versuche es später noch einmal.', 500);
}
