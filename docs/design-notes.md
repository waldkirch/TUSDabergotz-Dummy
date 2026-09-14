# Designnotizen

Alle Werte wurden aus der Vorlage `Dabergotz.png` gemessen (Canvas 1366 px breit).

## Farben

| Token | Wert | Verwendung |
|-------|------|------------|
| `club-red` | `#F51A21` | Primärfläche, Kopfleiste, die meisten Sektionen |
| `club-red-dark` | `#D2141A` | zweite Fläche (Ü35, Partner, Footer), Bildplatzhalter |
| `chalk` | `#FFFFFF` | Schrift auf Rot, Flächen von Chronik und Fanshop |
| `ink` | `#111111` | Schrift auf Weiß |
| `ink-soft` | `#4A4A4A` | Nebentexte im Fanshop |
| `shelf` | `#F7F7F7` | Bühne hinter den Produktbildern |

## Maße

| Element | Messwert | Umsetzung |
|---------|----------|-----------|
| Kopfleiste | 76 px | `h-nav` |
| Menüabstand | 52 px | `xl:gap-[52px]` |
| Menü- und Fließtext | 20 px, Regular | `text-nav` / `text-lead` |
| Bühnenbild | 565 px, Ratio 2.418:1 | `lg:h-[clamp(480px,41.4vw,565px)]` |
| H1 | Versalhöhe 48 px → 66 px Grad | `text-hero` |
| H2 | Versalhöhe 37 px → 51 px Grad | `text-section` |
| Kontakt-Badge | Ø 260 px, Text 38 px | `w-[clamp(11rem,19vw,16.25rem)]`, `text-badge` |
| TUS-Buchstaben | Versalhöhe 496 px | `font-size: clamp(9rem, 49vw, 42rem)` |
| Bildbänder | 560 px | `.band-photo` |
| Trainerporträt | Ø 236 px | `w-[14.75rem]` |
| Formular-Pille | 66 px hoch, Abstände 40/38 px | `.btn-pill`, `gap-x-10 gap-y-9` |
| Produktbilder | 248 × 333 px, Abstand 14 px | `aspect-[3/4]`, `gap-3.5` |
| Abstand Bildband → Überschrift | 29–38 px | `pt-band` |
| Sektionsende | 69–72 px | `pb-section` |

## Schriften

Die Vorlage stammt aus Canva, die Originalschnitte sind dort nicht benannt.
Gewählte freie Entsprechungen:

- **Gochi Hand** – handschriftliche Versalien (Überschriften, Kontakt-Ruf)
- **Figtree** – Fließtext (400), Teasertitel (700), TUS-Maske (900)

Austausch an zwei Stellen: der Fonts-Link in `index.html` und `fontFamily` in
`assets/js/tailwind.theme.js` (plus `--font-*` in `assets/css/site.css`).

## Bildzuordnung der Platzhalter

| Datei | Verwendet in |
|-------|--------------|
| `TUSD-Web-img-Header-01.jpg` | Hero, Maske „T“, Fanshop 3, Spielergebnisse, Partner 1+5 |
| `TUSD-Web-img-MannschaftU30-01.jpg` | Maske „U“, beide Mannschaftsbänder, Fanshop 2, Chronik 1990er, Partner 2+6 |
| `TUSD-Web-img-TrainerU30-01.jpg` | beide Trainerporträts, Fanshop 1, Partner 3 |
| `TUSD-Web-img-MannschaftHistorisch-01.jpg` | Maske „S“, Chronik-Band, Chronik 1929/1947/1953, Fanshop 4, Partner 4 |

Empfohlene Maße der finalen Dateien: Bildbänder 2732 × 1122, Hero 2732 × 1130,
Porträts 472 × 472, Produktbilder 744 × 999, Chronik-Kreise 400 × 400.

## Bewusste Abweichungen von der Vorlage

1. **Rechter Menürand** – in der Vorlage endet „Fanshop“ 180 px vor der Kante,
   das sieht nach Canva-Platzierung aus. Das Menü steht jetzt bündig rechts.
2. **Abdunklung im Bühnenbild** – Weiß auf hellem Himmel liegt bei etwa 1,5:1.
   Ein Verlauf über dem oberen Bilddrittel bringt die Headline über 3:1
   (WCAG 1.4.3, große Schrift).
3. **Kontakt-Badge als Kreis** – Vorlage 260 × 234 px, vermutlich ein
   Verzerrungsartefakt.
4. **Zeitstrahl als `<ol>`** statt loser Fotocollage, damit er responsiv bleibt.
5. **Klebezettel entfernt** – waren Produktionsnotizen, keine Inhalte.
6. **Textlinks als Buttons** – „lesen“ und „die ganze Chronik lesen“ nutzen
   dieselbe Pillenform wie die Formulare.

## WordPress-Mapping

| Sektion | Zielkomponente |
|---------|----------------|
| Kopfleiste | `header.php` → `template-parts/header/site-nav.php` |
| Hero | ACF-Block `acf/tus-hero` |
| Aktuelles | ACF-Block `acf/tus-news` (später `WP_Query` auf Beiträge) |
| B-Jugend / Ü35 | ACF-Block `acf/tus-team`, zwei Instanzen |
| Vereinsgeschichte | ACF-Block `acf/tus-chronik` mit Repeater für den Zeitstrahl |
| Formulare | ACF-Block `acf/tus-downloads` (Repeater) |
| Fanshop | ACF-Block `acf/tus-fanshop` |
| Spielergebnisse | Shortcode des Ergebnis-Plugins |
| Partner | ACF-Block `acf/tus-partner` |
| Footer | `footer.php` |

Beim Umbau `content` in `tailwind.config.js` um den Theme-Pfad erweitern, sonst
werden die Klassen aus den PHP-Dateien wegoptimiert.
