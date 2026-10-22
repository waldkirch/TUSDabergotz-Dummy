<?php
/**
 * Vermittler für fussball.de-Daten (Weg B aus assets/js/fussballde.js)
 *
 * Warum ein Vermittler nötig ist: fussball.de liefert keinen CORS-Header,
 * ein fetch() direkt aus dem Browser wird deshalb blockiert. Dieser Endpunkt
 * läuft auf der eigenen Domain, holt die Seiten serverseitig, zerlegt sie und
 * gibt sauberes JSON zurück. Dadurch sieht der Browser nur die eigene Domain.
 *
 * EINBINDUNG IN WORDPRESS
 *   Diesen Code in die functions.php des Themes oder in ein kleines Plugin
 *   übernehmen. Danach steht der Endpunkt bereit unter:
 *     https://DEINE-DOMAIN/wp-json/tus/v1/spiele
 *   Diese URL in index.html eintragen:
 *     <section id="spielergebnisse" data-fussballde data-endpoint="/wp-json/tus/v1/spiele">
 *
 * ALS EINZELNE DATEI (ohne WordPress)
 *   Die Datei auf den Server legen und direkt aufrufen. Dann den unteren
 *   Block "Standalone" einkommentieren und den WordPress-Block entfernen.
 *
 * WICHTIG ZUM PARSEN
 *   Die drei Regex-Muster unten sind an das HTML von fussball.de angelehnt,
 *   das sich jederzeit ändern kann. Vor dem Produktivgang einmal gegen die
 *   echte Seite prüfen und bei Bedarf nachziehen. Liefert der Parser nichts,
 *   gibt der Endpunkt eine leere Liste zurück und die Seite zeigt weiter den
 *   im HTML hinterlegten Stand – sie bleibt also in jedem Fall benutzbar.
 *
 * RECHTLICHES
 *   Die Daten gehören dem DFB. Für die Anzeige auf der Vereinsseite ist das
 *   offizielle Widget (Weg A) der vom DFB vorgesehene Weg. Dieser Vermittler
 *   ist die technische Alternative, wenn die Darstellung ins eigene Design
 *   passen soll. Im Zweifel beim Verband nachfragen.
 */

// ---------------------------------------------------------------------------
// Konfiguration: die beiden Mannschaften des TuS Dabergotz
// ---------------------------------------------------------------------------

const TUS_TEAMS = [
    'b-jugend' => [
        'name' => 'B-Junioren',
        'url'  => 'https://www.fussball.de/mannschaft/tus-dabergotz-9-tus-dabergotz-1929-brandenburg/-/saison/2627/team-id/02TBNV33O4000000VS5489BSVV9JRPRB',
        'match' => 'TuS Dabergotz',
    ],
    'ue35' => [
        'name' => 'Herren Ü35',
        'url'  => 'https://www.fussball.de/mannschaft/spg-msv-neuruppin-tus-dabergotz-msv-1919-neuruppin-brandenburg/-/saison/2627/team-id/02PNA3D80O000000VS5489B2VT4FEOV2',
        'match' => 'Neuruppin/TuS Dabergotz',
    ],
];

const TUS_CACHE_MINUTES = 15;

// ---------------------------------------------------------------------------
// Abruf und Auswertung
// ---------------------------------------------------------------------------

function tus_fetch_html(string $url): string {
    if (function_exists('wp_remote_get')) {
        $response = wp_remote_get($url, [
            'timeout'    => 15,
            'user-agent' => 'TuS-Dabergotz-Website/1.0 (+https://tus-dabergotz.de)',
        ]);
        if (is_wp_error($response)) {
            return '';
        }
        return (string) wp_remote_retrieve_body($response);
    }

    $context = stream_context_create([
        'http' => [
            'timeout' => 15,
            'header'  => "User-Agent: TuS-Dabergotz-Website/1.0\r\n",
        ],
    ]);
    $body = @file_get_contents($url, false, $context);

    return $body === false ? '' : $body;
}

function tus_clean(string $value): string {
    $value = html_entity_decode(strip_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8');

    return trim(preg_replace('/\s+/u', ' ', $value));
}

/**
 * Liest die Begegnungen aus dem Spielplan der Mannschaftsseite.
 * Erwartet Zeilen mit Datum, beiden Mannschaften und – falls gespielt –
 * einem Ergebnis in der Form "2 : 1".
 */
function tus_parse_matches(string $html, string $ownNeedle): array {
    $matches = [];

    if (!preg_match_all('#<tr[^>]*>(.*?)</tr>#su', $html, $rows)) {
        return $matches;
    }

    $current = null;

    foreach ($rows[1] as $row) {
        // Datumszeile: 14.10.2026 19:00
        if (preg_match('#(\d{2})\.(\d{2})\.(\d{4}).{0,40}?(\d{2}):(\d{2})#su', $row, $when)) {
            $current = sprintf(
                '%s-%s-%sT%s:%s:00+01:00',
                $when[3], $when[2], $when[1], $when[4], $when[5]
            );
        }

        if (!preg_match_all('#class="club-name"[^>]*>(.*?)<#su', $row, $clubs) || count($clubs[1]) < 2) {
            continue;
        }

        $home = tus_clean($clubs[1][0]);
        $away = tus_clean($clubs[1][1]);
        if ($home === '' || $away === '') {
            continue;
        }

        $entry = [
            'datum'      => $current,
            'wettbewerb' => '',
            'heim'       => $home,
            'gast'       => $away,
            'tore_heim'  => null,
            'tore_gast'  => null,
        ];

        if (preg_match('#>\s*(\d{1,2})\s*<[^>]*>\s*:\s*<[^>]*>\s*(\d{1,2})\s*<#su', $row, $score)) {
            $entry['tore_heim'] = (int) $score[1];
            $entry['tore_gast'] = (int) $score[2];
        }

        if (preg_match('#class="competition[^"]*"[^>]*>(.*?)</#su', $row, $comp)) {
            $entry['wettbewerb'] = tus_clean($comp[1]);
        }

        $matches[] = $entry;
    }

    // gespielte Partien zuerst, neueste oben; danach die kommenden
    usort($matches, static function ($a, $b) {
        $aPlayed = $a['tore_heim'] !== null;
        $bPlayed = $b['tore_heim'] !== null;
        if ($aPlayed !== $bPlayed) {
            return $aPlayed ? -1 : 1;
        }

        return $aPlayed
            ? strcmp((string) $b['datum'], (string) $a['datum'])
            : strcmp((string) $a['datum'], (string) $b['datum']);
    });

    return $matches;
}

/**
 * Liest die Tabelle. Spalten auf fussball.de: Platz, Mannschaft, Spiele,
 * Tore, Punkte (Reihenfolge je Wettbewerb leicht abweichend).
 */
function tus_parse_table(string $html, string $ownNeedle): array {
    $table = [];

    if (!preg_match('#<table[^>]*class="[^"]*table-standings[^"]*".*?</table>#su', $html, $block)) {
        return $table;
    }

    if (!preg_match_all('#<tr[^>]*>(.*?)</tr>#su', $block[0], $rows)) {
        return $table;
    }

    foreach ($rows[1] as $row) {
        if (!preg_match_all('#<td[^>]*>(.*?)</td>#su', $row, $cells) || count($cells[1]) < 5) {
            continue;
        }

        $values = array_map('tus_clean', $cells[1]);
        $values = array_values(array_filter($values, static fn($v) => $v !== ''));
        if (count($values) < 5 || !ctype_digit($values[0])) {
            continue;
        }

        $team = $values[1];
        $table[] = [
            'platz'      => (int) $values[0],
            'mannschaft' => $team,
            'spiele'     => (int) $values[2],
            'tore'       => $values[count($values) - 2],
            'punkte'     => (int) $values[count($values) - 1],
            'eigen'      => stripos($team, $ownNeedle) !== false,
        ];
    }

    return $table;
}

function tus_build_payload(): array {
    $payload = [
        'stand' => date('c'),
        'teams' => [],
    ];

    foreach (TUS_TEAMS as $key => $team) {
        $html = tus_fetch_html($team['url']);
        $payload['teams'][$key] = [
            'name'    => $team['name'],
            'spiele'  => $html ? tus_parse_matches($html, $team['match']) : [],
            'tabelle' => $html ? tus_parse_table($html, $team['match']) : [],
        ];
    }

    return $payload;
}

// ---------------------------------------------------------------------------
// WordPress: Endpunkt /wp-json/tus/v1/spiele mit Zwischenspeicher
// ---------------------------------------------------------------------------

if (function_exists('add_action')) {
    add_action('rest_api_init', static function () {
        register_rest_route('tus/v1', '/spiele', [
            'methods'             => 'GET',
            'permission_callback' => '__return_true',
            'callback'            => static function () {
                $cached = get_transient('tus_spiele');
                if ($cached !== false) {
                    return rest_ensure_response($cached);
                }

                $payload = tus_build_payload();
                set_transient('tus_spiele', $payload, TUS_CACHE_MINUTES * MINUTE_IN_SECONDS);

                return rest_ensure_response($payload);
            },
        ]);
    });

    return;
}

// ---------------------------------------------------------------------------
// Standalone: Datei direkt aufrufen (ohne WordPress)
// ---------------------------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=' . (TUS_CACHE_MINUTES * 60));

$cacheFile = sys_get_temp_dir() . '/tus-spiele.json';
if (is_readable($cacheFile) && (time() - filemtime($cacheFile)) < TUS_CACHE_MINUTES * 60) {
    readfile($cacheFile);
    exit;
}

$json = json_encode(tus_build_payload(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
@file_put_contents($cacheFile, $json);
echo $json;
