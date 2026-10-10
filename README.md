# TuS Dabergotz – Onepager

Statisches Frontend des Vereins-Onepagers. Vorstufe zum späteren WordPress-Theme:
HTML5, Tailwind CSS, Vanilla JavaScript (ES6), ohne Build-Zwang lauffähig.

## Schnellstart

```bash
npx serve .          # oder: python3 -m http.server 8000
```

Die Seite muss über einen Server laufen oder mit dem kompletten Ordner geöffnet
werden – wird nur `index.html` weitergegeben, fehlen Bilder, CSS und JS.

## Produktions-Build

```bash
npm install
npm run build        # erzeugt assets/css/tailwind.css
```

Danach im `<head>` die drei CDN-Zeilen löschen und ersetzen durch
`<link rel="stylesheet" href="assets/css/tailwind.css">`.

## Struktur

```
.
├── index.html                  elf Sektionen plus Header und Footer
├── assets/
│   ├── css/site.css            eigene Stile (reines CSS, kein @apply)
│   ├── js/site.js              Navigation, Aufklappbereiche, Formular, Scroll-Effekte
│   ├── js/tailwind.theme.js    Farben, Schriften, Größen – einzige Quelle
│   ├── js/tailwind-cdn.js      reicht das Theme ans Play-CDN (nur Dev)
│   ├── img/                    Bilder und Logo
│   └── dokumente/              PDFs und Word-Datei der Formulare
├── src/css/tailwind.css        Eingang für den Tailwind-Build
├── tailwind.config.js
├── postcss.config.js
└── docs/design-notes.md        Messwerte, Bildzuordnung, WordPress-Mapping
```

## Sektionen

| # | Sektion | Anker | Fläche |
|---|---------|-------|--------|
| 01 | Hero | `#top` | Bild |
| 02 | Aktuelles (TUS-Maske) | `#aktuelles` | Rot |
| 03 | B-Jugend | `#b-jugend` | Rot |
| 04 | Ü35 – Altherren | `#ue35` | Dunkelrot |
| 05 | Vereinsgeschichte + lange Chronik | `#chronik`, `#chronik-lang` | Weiß, roter Inhalt |
| 06 | Formulare (Direktdownloads) | `#formulare` | Rot |
| 07 | Fanshop – Hingucker | `#fanshop` | Weiß |
| 08 | Fanshop – direkt aus dem Shop | `#fanshop-shop` | Weiß |
| 09 | Spielergebnisse | `#spielergebnisse` | Rot |
| 10 | Partner | `#partner` | Dunkelrot |
| 11 | Kontakt mit Formular | `#kontakt`, `#kontakt-formular` | Rot |

## Dateien, die noch fehlen

**Dokumente** – gehören nach `assets/dokumente/`, exakt mit diesen Namen
(die Links sind URL-codiert, Leerzeichen und Umlaute funktionieren also):

```
1012726 - Beitrittserklärung_Aufnahmevertrag.docx
Datenschutzerklärung TuS.pdf
unfallmeldung_TuS_.pdf
Einverständniserklärung Spielerbild TuS.pdf
antrag_zweitspielrecht_fuer_altherren-31-08-15.pdf
003_antrag_spielrecht_fussball_2022.pdf
```

**Bilder** – in `assets/img/` liegen Platzhalter unter den Zielnamen:

| Datei | Status |
|-------|--------|
| `TUSDabergotz_Logo.svg` | Platzhalter (weißer Ring mit Monogramm), einfach überschreiben |
| `B Jugend.jpg` | Platzhalter, aktuell Kopie des Mannschaftsbilds |
| `Ü35.jpg` | Platzhalter, aktuell Kopie des Mannschaftsbilds |
| `TUSD-Web-img-*.jpg` | Arbeitsbilder aus dem Projekt |

Empfehlung für den Livegang: Datei- und Dokumentnamen auf ASCII ohne
Leerzeichen umstellen und die Pfade in `index.html` entsprechend anpassen.

## Besonderheiten

**TUS-Maske (02).** Jeder Buchstabe ist echter Text; das Bild liegt als Hintergrund
dahinter und wird über `background-clip: text` auf die Glyphe zugeschnitten,
`background-attachment: fixed` hält es beim Scrollen still. Der Schriftgrad hängt
an der Spaltenbreite (`--mask-fit` in `site.css`), damit zwischen den Buchstaben
immer Abstand bleibt. Kein `transform`, `filter` oder `container-type` auf einem
Elternelement – das bricht den Fixed-Bezug.

**Zeitstrahl (05).** `--progress` (0…1) kommt stufenlos aus der Scrollposition und
treibt Linie, rollenden Ball, Jahreszahlen und Fotos. Läuft rückwärts genauso.

**Aufklappbereiche.** Lange Chronik und Kontaktformular nutzen dieselbe Mechanik:
`grid-template-rows: 0fr → 1fr`, also ohne feste Maxhöhe. Geschlossen bekommt der
Bereich `inert` und ist damit nicht per Tabulator erreichbar. Das Icon im Button
wechselt zwischen Pfeil und Kreuz, gesteuert über `aria-expanded`.

**Kontaktformular.** Prüft im Browser und zeigt Fehlermeldungen pro Feld. Es
versendet noch nichts – der Submit-Handler blendet einen Hinweis ein. In
WordPress übernimmt Contact Form 7, WPForms oder ein eigener Endpunkt; die
Feldnamen (`vorname`, `name`, `email`, `nachricht`, `datenschutz`) bleiben gleich.

**Externe Verlinkungen.** Fanshop → `https://tus-dabergotz.fan12.de/` inklusive
der fünf aktuellen Artikel und der Kollektionen. Spielergebnisse → die
Vereinsseite auf fussball.de. Ein `<iframe>` auf fussball.de funktioniert nicht
(X-Frame-Options); für eine echte Einbettung braucht es das offizielle
Vereinswidget, die Stelle ist in `index.html` kommentiert.

**Barrierefreiheit.** Skip-Link, sichtbare Fokusringe in beiden Farbwelten,
`aria-expanded`/`aria-controls` an Burgermenü und Aufklappbereichen, durchgehende
Überschriftenhierarchie, Alt-Texte überall. Fließtext auf Weiß nutzt ein leicht
abgedunkeltes Rot (`--club-red-text`, 6,0:1) – das Markenrot erreicht auf Weiß nur
4,16:1 und fällt bei WCAG 1.4.3 durch. Überschriften und Buttons behalten das
volle Markenrot, dort genügt 3:1. `prefers-reduced-motion` schaltet alle Bewegung ab.

## Offene Punkte

- Lange Chronik enthält rund 1.260 Wörter Platzhaltertext und drei Platzhalterbilder.
- Partnerlogos fehlen.
- Zielseiten `/datenschutz`, `/impressum` und die Beitragsseiten unter
  `/aktuelles/…` existieren noch nicht.
