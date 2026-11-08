// Baut die auslieferbare Seite nach dist/: Tailwind-CSS erzeugen, dann nur die
// Dateien kopieren, die live gehören (kein docs/, node_modules, Konfiguration).
import { execSync } from 'node:child_process';
import { cpSync, rmSync, mkdirSync, readdirSync, existsSync } from 'node:fs';

execSync('npx tailwindcss -i ./src/css/tailwind.css -o ./assets/css/tailwind.css --minify', { stdio: 'inherit' });

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');

for (const f of readdirSync('.')) {
  if (/\.html$/.test(f) || f === 'robots.txt' || f === '_headers') cpSync(f, `dist/${f}`);
}
cpSync('assets', 'dist/assets', {
  recursive: true,
  filter: (src) => !/README\.txt$/.test(src)
});
console.log('dist/ ist fertig.');

// PHP (Kontaktformular + Nachrichtenseite) braucht eine Konfiguration mit Passwort.
if (!existsSync('server/php/inc/config.php')) {
  console.error('server/php/inc/config.php fehlt. Erst "npm run passwort" ausführen.');
  process.exit(1);
}

// Upload-Ordner für ISPConfig: Inhalt von dist/ ohne Netlify-Datei, plus .htaccess.
rmSync('ispconfig/web', { recursive: true, force: true });  // ispconfig/private (lokale Testdaten) bleibt erhalten
cpSync('dist', 'ispconfig/web', { recursive: true });
rmSync('ispconfig/web/_headers', { force: true });
cpSync('server/.htaccess', 'ispconfig/web/.htaccess');
for (const dir of ['api', 'admin', 'inc']) {
  cpSync(`server/php/${dir}`, `ispconfig/web/${dir}`, {
    recursive: true,
    filter: (src) => !/config\.example\.php$/.test(src)
  });
}
cpSync('server/nginx-directives.txt', 'ispconfig/nginx-directives.txt');
console.log('ispconfig/web ist fertig.');
