# Designnotizen

Alle Werte wurden aus der Vorlage `Dabergotz.png` gemessen (Canvas 1366 px breit).

## Farben

| Token | Wert | Verwendung |
|-------|------|------------|
| `club-red` | `#F51A21` | Primärfläche, Kopfleiste, Überschriften, Buttons |
| `club-red-dark` | `#D2141A` | zweite Fläche (Ü35, Partner, Footer) |
| `--club-red-text` | `#C6121A` | Fließtext auf Weiß (Kontrast 6,0:1 statt 4,16:1) |
| `chalk` | `#FFFFFF` | Schrift auf Rot, Flächen von Chronik und Fanshop |
| `ink` | `#111111` | Schrift auf Weiß im Fanshop |
| `ink-soft` | `#4A4A4A` | Nebentexte |
| `shelf` | `#F7F7F7` | Bühne hinter den Produktbildern |

## Maße

| Element | Messwert | Umsetzung |
|---------|----------|-----------|
| Kopfleiste | 76 px | `h-nav` |
| Menü- und Fließtext | 20 px, Regular | `text-nav` / `text-lead` |
| Bühnenbild | 565 px, Ratio 2.418:1 | `lg:h-[clamp(480px,41.4vw,565px)]` |
| H1 | Versalhöhe 48 px → 66 px Grad | `text-hero` |
| H2 | Versalhöhe 37 px → 51 px Grad | `text-section` |
| Kontakt-Badge | Ø 260 px, Text 38 px | `.badge-round` |
| TUS-Buchstaben | Versalhöhe 496 px in der Vorlage | `--mask-fit` × Spaltenbreite |
| Bildbänder | 560 px | `.band-photo` |
| Trainerporträt | Ø 236 px | `w-[14.75rem]` |
| Formular-Pille | 66 px hoch, Abstände 40/38 px | `.btn-pill`, `gap-x-10 gap-y-9` |
| Produktbilder | 248 × 333 px, Abstand 14 px | `aspect-[3/4]`, `gap-3.5` |
| Abstand Bildband → Überschrift | 29–38 px | `pt-band` |
| Sektionsende | 69–72 px | `pb-section` |

## Schriften

Die Vorlage stammt aus Canva, die Originalschnitte sind dort nicht benannt.
Freie Entsprechungen: **Gochi Hand** für die handschriftlichen Versalien,
**Figtree** für Fließtext (400), Teasertitel (700) und die TUS-Maske (900).
Austausch an zwei Stellen: Fonts-Link in `index.html` und `fontFamily` in
`assets/js/tailwind.theme.js` (plus `--font-*` in `assets/css/site.css`).

Weil Figtree Black pro Versalhöhe deutlich breiter ist als die Originalschrift,
erreicht die TUS-Maske nicht die 496 px der Vorlage, ohne dass sich die
Buchstaben berühren. `--mask-fit: 1.28` hält rund 85 % der Spaltenbreite als
Glyphe und den Rest als Luft.

## Bildzuordnung

| Datei | Verwendet in |
|-------|--------------|
| `TUSDabergotz_Logo.svg` | Kopfleiste, Footer, Favicon |
| `B Jugend.jpg` | Bildband B-Jugend |
| `Ü35.jpg` | Bildband Ü35 |
| `TUSD-Web-img-Header-01.jpg` | Hero, Maske „T“, Fanshop, Partner |
| `TUSD-Web-img-MannschaftU30-01.jpg` | Maske „U“, Chronik 1990er, Fanshop, Partner |
| `TUSD-Web-img-TrainerU30-01.jpg` | beide Trainerporträts, Fanshop, Partner |
| `TUSD-Web-img-MannschaftHistorisch-01.jpg` | Maske „S“, Chronik-Band und -Kreise |

Empfohlene Maße: Bildbänder 2732 × 1122, Hero 2732 × 1130, Porträts 472 × 472,
Produktbilder 744 × 999, Chronik-Kreise 400 × 400.

## Bewusste Abweichungen von der Vorlage

1. **Rechter Menürand** – in der Vorlage endet „Fanshop“ 180 px vor der Kante,
   das Menü steht jetzt bündig rechts.
2. **Abdunklung im Bühnenbild** – bringt Weiß auf hellem Himmel über 3:1.
3. **Kontakt-Badge als Kreis** – Vorlage 260 × 234 px, vermutlich verzerrt.
4. **Zeitstrahl als `<ol>`** statt Fotocollage, damit er responsiv bleibt.
5. **Klebezettel entfernt** – waren Produktionsnotizen.
6. **Textlinks als Buttons** – gleiche Pillenform wie die Formulare.
7. **Fließtext auf Weiß** in abgedunkeltem Rot, siehe Farbtabelle.

## WordPress-Mapping

| Sektion | Zielkomponente |
|---------|----------------|
| Kopfleiste | `header.php` → `template-parts/header/site-nav.php` |
| Hero | ACF-Block `acf/tus-hero` |
| Aktuelles | ACF-Block `acf/tus-news` (später `WP_Query` auf Beiträge) |
| B-Jugend / Ü35 | ACF-Block `acf/tus-team`, zwei Instanzen |
| Vereinsgeschichte | ACF-Block `acf/tus-chronik`, Repeater für den Zeitstrahl, WYSIWYG für die Langfassung |
| Formulare | ACF-Block `acf/tus-downloads` (Repeater mit Datei-Feld) |
| Fanshop (beide Blöcke) | ACF-Block `acf/tus-fanshop`, zwei Instanzen |
| Spielergebnisse | fussball.de-Vereinswidget oder Shortcode des Ergebnis-Plugins |
| Partner | ACF-Block `acf/tus-partner` |
| Kontakt | ACF-Block `acf/tus-kontakt` + Contact Form 7 / WPForms |
| Footer | `footer.php` |

Beim Umbau `content` in `tailwind.config.js` um den Theme-Pfad erweitern, sonst
werden die Klassen aus den PHP-Dateien wegoptimiert.


## Chronik

Die Langfassung ist in drei aufklappbare Epochen geteilt: bis 1945,
1945 bis 1990, ab 1990. Inhalt und Bilder stammen aus der Vereinschronik auf
tusdabergotz.wordpress.com; jede Epoche verweist am Ende auf ihre Quellseite.

Die Bilder sind aktuell direkt von wordpress.com eingebunden. Für den
Livebetrieb herunterladen, nach `assets/img/chronik/` legen und die Pfade in
`index.html` ersetzen – sonst hängt die Ladezeit an einem fremden Server, und
ein Hotlink-Schutz dort würde die Bilder ausfallen lassen.

## Spieldaten

Warum kein direktes `fetch()`: fussball.de sendet keinen CORS-Header, der
Browser blockiert die Anfrage. Vorbereitet sind daher zwei Wege – das
offizielle Widget (Schlüssel am `<body>`) und ein eigener Server-Vermittler
(`docs/fussballde-proxy.php`). Details stehen in der README und im
Kopfkommentar von `assets/js/fussballde.js`.

Mannschafts-Kennungen:

| Mannschaft | team-id |
|------------|---------|
| B-Junioren, TuS Dabergotz (9) | `02TBNV33O4000000VS5489BSVV9JRPRB` |
| Herren Ü35, SpG MSV Neuruppin/TuS Dabergotz | `02PNA3D80O000000VS5489B2VT4FEOV2` |

Stand 20.10.2026 führt fussball.de für die Saison 2026/27 noch keine
Ergebnisse und keine Tabellen – nur Ansetzungen, und auch die sind laut
Portal vom Staffelleiter noch nicht freigegeben.
