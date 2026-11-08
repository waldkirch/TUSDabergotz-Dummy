<?php
if (!defined('TUSD')) { http_response_code(404); exit; }

/* Einstellungen. "npm run passwort" erzeugt daraus config.php. */
return [
    // bcrypt-Hash des Admin-Passworts (nicht von Hand ändern, sondern: npm run passwort)
    'admin_password_hash' => '__HASH__',

    // Zufälliger Schlüssel für den Spamschutz
    'secret' => '__SECRET__',

    // E-Mail-Benachrichtigung bei neuer Nachricht. Leer lassen = keine Mail.
    'notify_email' => '',
    // Absenderadresse der Benachrichtigung (am besten eine Adresse der eigenen Domain)
    'mail_from' => 'website@example.de',

    // Speicherort der Nachrichten. Leer = Ordner "private/tus-submissions" neben dem web-Ordner.
    'data_dir' => '',
];
