# TuS Dabergotz – Onepager

Statisches Frontend des Vereins-Onepagers. Dient als pixelgenaue Vorstufe zum
späteren WordPress-Theme: HTML5, Tailwind CSS, Vanilla JavaScript (ES6), ohne
Build-Zwang lauffähig.

## Schnellstart

```bash
git clone <repo-url>
cd tus-dabergotz
npx serve .          # oder: python3 -m http.server 8000
```

Danach `http://localhost:3000` (bzw. `:8000`) öffnen. In dieser Variante lädt
Tailwind über das Play-CDN – ideal zum Anschauen und Weiterbauen, nicht für den
Livebetrieb.

> Die Seite muss über einen Server laufen oder mit dem kompletten Ordner geöffnet
> werden. Wird nur `index.html` allein weitergegeben, fehlen Bilder, CSS und JS.

## Produktions-Build

```bash
npm install
npm run build        # erzeugt assets/css/tailwind.css (minifiziert)
```

Danach in `index.html` die drei CDN-Zeilen im `<head>` löschen und ersetzen durch:

```html
<link rel="stylesheet" href="assets/css/tailwind.css">
```

`npm run dev` startet denselben Build im Watch-Modus.

## Struktur

```
.
├── index.html                  Seitenstruktur, alle Sektionen
├── assets/
│   ├── css/site.css            eigene Stile (reines CSS, kein @apply)
│   ├── js/site.js              Navigation, Scroll-Effekte, Zeitstrahl
│   ├── js/tailwind.theme.js    Farben, Schriften, Größen – einzige Quelle
│   ├── js/tailwind-cdn.js      reicht das Theme ans Play-CDN (nur Dev)
│   ├── img/                    Bilder (aktuell Platzhalter)
│   └── dokumente/              PDFs der Formulare
├── src/css/tailwind.css        Eingang für den Tailwind-Build
├── tailwind.config.js          Build-Konfiguration
├── postcss.config.js
└── docs/design-notes.md        Messwerte, Bildzuordnung, WordPress-Mapping
```

Farben, Schriftgrößen und Abstände stehen **einmal** in
`assets/js/tailwind.theme.js` und werden von CDN und Build gemeinsam genutzt.
`assets/css/site.css` spiegelt dieselben Werte als CSS-Variablen unter `:root`,
weil dort auch ohne Tailwind gearbeitet wird.

## Sektionen

| # | Sektion | Anker | Fläche |
|---|---------|-------|--------|
| 01 | Hero | `#top` | Bild |
| 02 | Aktuelles (TUS-Maske) | `#aktuelles` | Rot |
| 03 | B-Jugend | `#b-jugend` | Rot |
| 04 | Ü35 – Altherren | `#ue35` | Dunkelrot |
| 05 | Vereinsgeschichte | `#chronik` | Weiß, roter Inhalt |
| 06 | Formulare | `#formulare` | Rot |
| 07 | Fanshop | `#fanshop` | Weiß |
| 08 | Spielergebnisse | `#spielergebnisse` | Rot |
| 09 | Partner | `#partner` | Dunkelrot |

## Besonderheiten

**TUS-Maske (Sektion 02).** Jeder Buchstabe ist echter Text; das Bild liegt als
Hintergrund dahinter und wird über `background-clip: text` auf die Glyphe
zugeschnitten. `background-attachment: fixed` verankert das Motiv am Viewport,
beim Scrollen wandert nur der Buchstabe darüber. Unterhalb 1024 px und bei
`prefers-reduced-motion` schaltet es auf `scroll` um, weil iOS `fixed` nicht
zuverlässig umsetzt. Wichtig: kein `transform` oder `filter` auf einem
Elternelement, das bricht den Fixed-Bezug.

**Zeitstrahl (Sektion 05).** `--progress` (0…1) wird stufenlos aus der
Scrollposition berechnet und treibt vier Dinge gleichzeitig: die gestrichelte
Bahn wird über ein Clip-Rechteck aufgedeckt, ein Ball rollt per
`getPointAtLength()` exakt auf der Kurve, Jahreszahlen skalieren, Fotos gehen von
entsättigt auf farbig. Weil alles am Scrollwert hängt, läuft es rückwärts
genauso sauber.

**Barrierefreiheit.** Skip-Link, sichtbare Fokusringe in beiden Farbwelten,
`aria-expanded`/`aria-controls` am Burgermenü mit Escape-Ausstieg, eine `<h1>`
und danach eine durchgehende Überschriftenhierarchie, Alt-Texte an allen Bildern.
`prefers-reduced-motion` schaltet sämtliche Bewegung ab.

## Offene Punkte

- Echte Bilder ersetzen die Platzhalter in `assets/img/` (Namensschema
  `TUSD-Web-img-*.jpg`, siehe `docs/design-notes.md`).
- Die fünf Formular-PDFs gehören nach `assets/dokumente/`.
- Partnerlogos liegen noch nicht vor.
- Die Spielergebnisse werden später vom Plugin gerendert; im Markup steht an der
  Stelle ein Kommentar mit dem vorgesehenen Shortcode.
- Zielseiten `/kontakt`, `/fanshop`, `/chronik-lang`, `/impressum`,
  `/datenschutz` existieren noch nicht.

## Lizenz

Code: frei zur Verwendung durch den TuS Dabergotz. Bildrechte liegen beim Verein
bzw. den jeweiligen Urhebern – die aktuell enthaltenen Dateien sind Platzhalter.
