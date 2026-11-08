// Setzt das Admin-Passwort für die Nachrichtenseite.
//   npm run passwort                 -> erzeugt ein zufälliges Passwort und zeigt es einmal an
//   npm run passwort -- "meinPasswort" -> setzt genau dieses Passwort (mindestens 10 Zeichen)
// Schreibt den bcrypt-Hash nach server/php/inc/config.php (Klartext wird nirgends gespeichert).
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const target = 'server/php/inc/config.php';
const example = 'server/php/inc/config.example.php';

let password = process.argv[2];
const generated = !password;
if (generated) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  password = Array.from(randomBytes(16), (b) => alphabet[b % alphabet.length]).join('');
} else if (password.length < 10) {
  console.error('Das Passwort muss mindestens 10 Zeichen lang sein.');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
let config;
if (existsSync(target)) {
  // Funktionen als Ersatz: der bcrypt-Hash enthält "$", das replace() sonst als Platzhalter liest.
  config = readFileSync(target, 'utf8').replace(/('admin_password_hash'\s*=>\s*)'[^']*'/, (_m, key) => `${key}'${hash}'`);
} else {
  config = readFileSync(example, 'utf8')
    .replace('__HASH__', () => hash)
    .replace('__SECRET__', () => randomBytes(32).toString('hex'));
}
writeFileSync(target, config);

console.log(`Passwort gesetzt (${target}).`);
if (generated) console.log(`\nNeues Passwort: ${password}\n\nJetzt notieren – es wird nicht gespeichert. Danach: npm run build`);
else console.log('Jetzt: npm run build');
