# TuS Dabergotz – Onepager

Statisches Frontend des Vereins-Onepagers. Vorstufe zum späteren WordPress-Theme:
HTML5, Tailwind CSS, Vanilla JavaScript (ES6), ohne Build-Zwang lauffähig.

## Hosting

```bash
npm install
npm run build      # erzeugt dist/ (fertiges CSS + nur die auslieferbaren Dateien)
npm run preview    # dist/ lokal auf http://localhost:8080 ansehen
```

Der Inhalt von `dist/` ist die komplette Seite und kann auf jeden statischen
Webspace (Netlify, Cloudflare Pages, GitHub Pages, Apache/nginx, Strato, IONOS …).
Für Netlify liegt `netlify.toml` bereit (Build `npm run build`, Ordner `dist`);
`_headers` setzt Sicherheits- und Cache-Header (Netlify/Cloudflare Pages).
Bei Apache/nginx den Ordner `dist/` als Webroot verwenden und `404.html` als
Fehlerseite eintragen.

**ISPConfig:** `npm run build` erzeugt zusätzlich `ispconfig/web/`. Dessen Inhalt
(inklusive der versteckten `.htaccess`) per SFTP in das `web`-Verzeichnis der
Website laden. Läuft die Seite auf nginx, den Text aus `ispconfig/nginx-directives.txt`
in ISPConfig unter „nginx Directives“ eintragen. Quelle beider Dateien: `server/`.

**Kontaktformular und Nachrichtenseite (PHP):**
- Das Formular sendet an `api/kontakt.php`. Die Nachrichten landen als Dateien im
  Ordner `private/tus-submissions/` **neben** dem `web`-Ordner (bei ISPConfig
  `.../webN/private/`, also nicht öffentlich abrufbar).
- Ansehen unter `/admin/`: Passwort-Anmeldung, Liste, gelesen/ungelesen, Löschen,
  CSV-Export.
- Passwort setzen oder ändern: `npm run passwort` (zufälliges Passwort) oder
  `npm run passwort -- "EigenesPasswort"` (mind. 10 Zeichen), danach `npm run build`
  und neu hochladen. Es wird nur der Hash gespeichert, in `server/php/inc/config.php`.
- E-Mail bei neuer Nachricht: in `server/php/inc/config.php` `notify_email` und
  `mail_from` eintragen, bauen, hochladen.
- Spamschutz: Honigtopf-Feld, Mindestzeit, höchstens 5 Nachrichten je Stunde und
  Besucher; Anmeldung: höchstens 5 Versuche je 15 Minuten.
- Lokal testen: `npm run build`, dann `npm run preview` (braucht PHP im Pfad).
- In der Datenschutzerklärung die Speicherung der Kontaktanfragen ergänzen.
  Eingegangene Nachrichten regelmäßig löschen, wenn sie nicht mehr gebraucht werden.

- Schriften (Figtree, Gochi Hand) liegen lokal in `assets/fonts/` – kein Abruf bei Google.
- Tailwind wird beim Build erzeugt; das CDN-Skript ist entfernt.
- `impressum.html` und `datenschutz.html` sind **Platzhalter** und müssen vor
  dem Livegang mit echten Angaben gefüllt werden. Die Kurztexte unter „Aktuelles“ (Aufklapp-Buttons) sind Platzhaltertexte, und der
  Social-Media-Buttons führen zu Instagram und Facebook des Vereins.
- Vor dem Livegang `<link rel="canonical">` und Open-Graph-URL mit der echten Domain ergänzen.

Entwicklung: `npm run dev` hält `assets/css/tailwind.css` aktuell, dazu
`npx serve .` in einem zweiten Terminal.

## Struktur

```
.
├── index.html                  elf Sektionen plus Header und Footer
├── assets/
│   ├── css/site.css            eigene Stile (reines CSS, kein @apply)
│   ├── js/site.js              Navigation, Aufklappbereiche, Formular, Scroll-Effekte
│   ├── js/fussballde.js        Spiele und Tabellen von fussball.de
│   ├── js/shop-produkte.js     Bildadressen der Shop-Artikel
│   ├── js/tailwind.theme.js    Farben, Schriften, Größen – einzige Quelle
│   ├── js/tailwind-cdn.js      reicht das Theme ans Play-CDN (nur Dev)
│   ├── img/                    Bilder, Logo, Partnerlogos, Avatar
│   └── dokumente/              PDFs und Word-Datei der Formulare
├── src/css/tailwind.css        Eingang für den Tailwind-Build
├── tailwind.config.js
├── postcss.config.js
└── docs/
    ├── design-notes.md         Messwerte, Bildzuordnung, WordPress-Mapping
    └── fussballde-proxy.php    Server-Vermittler für die Spieldaten
```

## Sektionen

| # | Sektion | Anker | Fläche |
|---|---------|-------|--------|
| 01 | Hero | `#top` | Bild |
| 02 | Aktuelles (TUS-Maske) | `#aktuelles` | Rot |
| 03 | B-Jugend | `#b-jugend` | Rot |
| 04 | Ü35 – Altherren | `#ue35` | Dunkelrot |
| 05 | Vereinsgeschichte + ganze Chronik | `#chronik`, `#chronik-lang` | Weiß, roter Inhalt |
| 06 | Formulare (Direktdownloads) | `#formulare` | Rot |
| 07 | Fanshop – Hingucker | `#fanshop` | Weiß |
| 08 | Fanshop – direkt aus dem Shop | `#fanshop-shop` | Weiß |
| 09 | Spielergebnisse | `#spielergebnisse` | Rot |
| 10 | Partner | `#partner` | Dunkelrot |
| 11 | Kontakt mit Formular | `#kontakt`, `#kontakt-formular` | Rot |

## Spielergebnisse von fussball.de

Ein `fetch()` aus dem Browser direkt auf fussball.de wird vom Browser
blockiert: fussball.de setzt keinen CORS-Header. Das ist keine Einstellungs-,
sondern eine Grundregel des Webs. Es gibt zwei saubere Wege, und beide sind
vorbereitet:

**Weg A – offizielles Widget, ohne eigenen Server.**
Auf fussball.de im Vereinsbereich über den Widget-Generator je Mannschaft
einen Schlüssel für die eigene Domain erzeugen (er gilt nur dort). Schlüssel
in `index.html` eintragen:

```html
<body data-fussballde-key="DEIN-SCHLUESSEL">
```

Dazu in `index.html` bei jeder `<article data-team-id="…">` die
Wettbewerbsnummer in `data-competition` setzen. Den Rest erledigt
`assets/js/fussballde.js`: Es lädt das Widget-Skript, rendert Spiele und
Tabelle und entfernt den gespeicherten Stand. Die Daten sind dann bei jedem
Seitenaufruf aktuell.

**Weg B – eigener Server als Vermittler, empfohlen für WordPress.**
`docs/fussballde-proxy.php` in die `functions.php` übernehmen. Der Endpunkt
steht dann unter `/wp-json/tus/v1/spiele`, holt die Daten serverseitig und
hält sie 15 Minuten im Cache. Endpunkt in `index.html` eintragen:

```html
<section id="spielergebnisse" data-fussballde data-endpoint="/wp-json/tus/v1/spiele">
```

Dann rendert `fussballde.js` Spiele und Tabelle im Seitendesign. Vorteil:
eigenes Aussehen, eigene Ladezeit. Nachteil: Die Regex-Muster im Proxy hängen
am HTML von fussball.de und müssen gelegentlich nachgezogen werden.

**Ohne beides** bleibt der im Markup hinterlegte Stand stehen – lesbar für
Suchmaschinen und für Besucher ohne JavaScript, mit sichtbarem Datum. Ein
`<iframe>` direkt auf die Vereinsseite funktioniert nicht, fussball.de
unterbindet das Einbetten per `X-Frame-Options`.

Hinterlegt sind beide Mannschaften:
B-Junioren (`02TBNV33O4000000VS5489BSVV9JRPRB`) und
Herren Ü35 als SpG mit MSV Neuruppin (`02PNA3D80O000000VS5489B2VT4FEOV2`).

## Dateien, die noch fehlen

**Dokumente** – nach `assets/dokumente/`, exakt mit diesen Namen:

```
1012726 - Beitrittserklärung_Aufnahmevertrag.docx
Datenschutzerklärung TuS.pdf
unfallmeldung_TuS_.pdf
Einverständniserklärung Spielerbild TuS.pdf
antrag_zweitspielrecht_fuer_altherren-31-08-15.pdf
003_antrag_spielrecht_fussball_2022.pdf
```

**Trainerfotos** – nach `assets/img/trainer/` als `B-Jugend-Trainer.jpg` und
`Ue35-Trainer.jpg`, quadratisch ab 472 px. Fehlen sie, zeigt die Seite den
Standardavatar mit Vereinswappen.

**Shop-Produktfotos** – Bildadressen in `assets/js/shop-produkte.js`
eintragen, siehe `assets/img/fanshop/README.txt`.

**Mannschaftsbilder** – `b-jugend.jpg` und `ue35.jpg` liegen bereits, sind aber
noch Kopien desselben Motivs.

## Besonderheiten

**TUS-Maske (02).** Jeder Buchstabe ist echter Text; das Bild liegt als
Hintergrund dahinter und wird über `background-clip: text` auf die Glyphe
zugeschnitten, `background-attachment: fixed` hält es beim Scrollen still. Der
Schriftgrad hängt an der Spaltenbreite (`--mask-fit` in `site.css`), damit
zwischen den Buchstaben immer Abstand bleibt. Kein `transform`, `filter` oder
`container-type` auf einem Elternelement – das bricht den Fixed-Bezug.

**Ganze Chronik (05).** Der Button „ganze Chronik“ öffnet die Langfassung,
darin liegen drei einzeln aufklappbare Epochen: bis 1945, 1945 bis 1990, ab
1990. Inhalt und Bilder stammen aus der Vereinschronik auf
`tusdabergotz.wordpress.com`, jeder Abschnitt nennt seine Quelle. Die Bilder
sind derzeit direkt von dort verlinkt – für den Livebetrieb herunterladen,
nach `assets/img/chronik/` legen und die Pfade ersetzen, sonst hängt die Seite
an einem fremden Server.

**Zeitstrahl (05).** `--progress` (0…1) kommt stufenlos aus der Scrollposition
und treibt Linie, rollenden Ball, Jahreszahlen und Fotos. Läuft rückwärts
genauso.

**Aufklappbereiche.** Chronik, Epochen und Kontaktformular nutzen dieselbe
Mechanik: `grid-template-rows: 0fr → 1fr`, also ohne feste Maxhöhe.
Geschlossen bekommt der Bereich `inert` und ist nicht per Tabulator
erreichbar.

**Burgermenü.** Hover öffnet das Panel, ein Klick hält es fest, der nächste
schließt es. Ohne diese Unterscheidung würde der Klick das gerade per Hover
geöffnete Menü sofort wieder schließen.

**Kontaktformular.** Prüft im Browser, zeigt Fehlermeldungen pro Feld und sendet
per `fetch` an `api/kontakt.php` (siehe Abschnitt Hosting). Für ein späteres
WordPress-Theme bleiben die Feldnamen (`vorname`, `name`, `email`, `nachricht`,
`datenschutz`) gleich.

**Barrierefreiheit.** Skip-Link, sichtbare Fokusringe in beiden Farbwelten,
`aria-expanded`/`aria-controls` an Burgermenü und allen Aufklappbereichen,
durchgehende Überschriftenhierarchie, Alt-Texte überall. Fließtext auf Weiß
nutzt ein leicht abgedunkeltes Rot (`--club-red-text`, 6,0:1) – das Markenrot
erreicht auf Weiß nur 4,16:1 und fällt bei WCAG 1.4.3 durch. Überschriften und
Buttons behalten das volle Markenrot, dort genügt 3:1.
`prefers-reduced-motion` schaltet alle Bewegung ab.

## Offene Punkte

- Chronikbilder liegen noch auf wordpress.com statt lokal.
- Shop-Produktfotos liegen lokal in `assets/img/fanshop/` (Stand der Shop-Seite beim Kopieren; bei neuen Artikeln Bild nachladen und in `assets/js/shop-produkte.js` eintragen).
- Partnerlinks sind vermutete Adressen und sollten geprüft werden; für HUCH
  war keine zu ermitteln.
- Zielseiten `/impressum` und die Beitragsseiten unter `/aktuelles/…`
  existieren noch nicht.
