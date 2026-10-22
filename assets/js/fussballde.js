/* =============================================================================
   Spielergebnisse vom DFB-Portal fussball.de

   WARUM NICHT EINFACH fetch('https://www.fussball.de/...')?
   fussball.de setzt keinen CORS-Header (Access-Control-Allow-Origin). Ein
   fetch() aus dem Browser heraus wird deshalb vom Browser selbst blockiert,
   egal wie der Code aussieht. Das ist keine Einstellungssache, sondern die
   Grundregel der Same-Origin-Policy. Es gibt genau zwei saubere Wege:

   WEG A – offizielles Widget von fussball.de (ohne eigenen Server):
     Auf fussball.de über den Widget-Generator (Vereinsbereich) je Mannschaft
     einen Schlüssel für die eigene Domain erzeugen. Der Schlüssel wird an die
     Domain gebunden und funktioniert nur dort. Einbindung laut DFB-Doku:
       <script src="https://www.fussball.de/export.widget.js/-/schluessel/KEY"></script>
     und pro Widget ein Ziel-DIV plus Aufruf von zeigeBegegnungen() bzw.
     zeigeTabelle(). Diese Datei stößt das automatisch an, sobald in
     index.html ein Schlüssel hinterlegt ist (data-fussballde-key am <body>).
     Die Widgets aktualisieren sich bei jedem Seitenaufruf selbst.

   WEG B – eigener Server als Vermittler (empfohlen für WordPress):
     docs/fussballde-proxy.php holt die Daten serverseitig, legt sie 15 Minuten
     in den Cache und liefert sie als JSON an die eigene Domain aus. Dann greift
     der Code unten und rendert Spiele und Tabelle im Seitendesign.
     Endpunkt eintragen: data-endpoint am Abschnitt <section id="spielergebnisse">.

   OHNE beides bleibt der im HTML hinterlegte Stand stehen. Der ist aus dem
   Markup lesbar, von Suchmaschinen indizierbar und trägt ein Datum – besser
   als ein leerer Kasten.
   ========================================================================== */

(() => {
  'use strict';

  const root = document.querySelector('[data-fussballde]');
  if (!root) return;

  const endpoint = root.dataset.endpoint || '';
  const widgetKey = document.body.dataset.fussballdeKey || '';
  const teams = Array.from(root.querySelectorAll('[data-team-id]'));

  const setState = (host, kind, text) => {
    const box = host.querySelector('[data-feed-state]');
    if (!box) return;
    box.hidden = !text;
    box.innerHTML = '';
    if (!text) return;
    if (kind === 'loading') {
      const spinner = document.createElement('span');
      spinner.className = 'feed-spinner';
      box.appendChild(spinner);
    }
    box.appendChild(document.createTextNode(text));
  };

  /* ── Weg A: offizielles Widget ──────────────────────────────────────────
     Wird nur aktiv, wenn ein Schlüssel hinterlegt ist. Das Widget bringt sein
     eigenes Markup mit und ersetzt den statischen Stand.
     --------------------------------------------------------------------- */

  const startWidgets = () => {
    const script = document.createElement('script');
    script.src = `https://www.fussball.de/export.widget.js/-/schluessel/${encodeURIComponent(widgetKey)}`;
    script.async = true;

    script.onload = () => {
      if (typeof window.fussballdeAPI !== 'function') return;
      teams.forEach((team) => {
        const matchesId = team.querySelector('[data-widget-matches]')?.id;
        const tableId = team.querySelector('[data-widget-table]')?.id;
        const competition = team.dataset.competition;
        if (!competition) return;
        try {
          const api = new window.fussballdeAPI();
          api.setzeWettbewerb(competition);
          if (matchesId) api.zeigeBegegnungen(matchesId);
          if (tableId) api.zeigeTabelle(tableId);
          team.querySelectorAll('[data-static]').forEach((el) => el.remove());
          setState(team, 'ok', '');
        } catch (error) {
          setState(team, 'error', 'Widget konnte nicht geladen werden, angezeigt wird der gespeicherte Stand.');
        }
      });
    };

    script.onerror = () => {
      teams.forEach((team) =>
        setState(team, 'error', 'fussball.de ist gerade nicht erreichbar, angezeigt wird der gespeicherte Stand.')
      );
    };

    document.head.appendChild(script);
  };

  /* ── Weg B: eigener Endpunkt ────────────────────────────────────────────
     Erwartetes JSON je Mannschaft:
     { "stand": "2026-10-20T17:00:00+02:00",
       "teams": { "<team-id>": {
           "spiele":  [{ "datum": "2026-10-14T19:00:00+02:00",
                         "wettbewerb": "Kreispokal",
                         "heim": "...", "gast": "...",
                         "tore_heim": 2, "tore_gast": 1 }],
           "tabelle": [{ "platz": 1, "mannschaft": "...", "spiele": 6,
                         "tore": "18:7", "punkte": 15, "eigen": true }] } } }
     --------------------------------------------------------------------- */

  const fmtDate = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.valueOf())) return '';
    return d.toLocaleString('de-DE', {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', ',');
  };

  const renderMatches = (host, matches) => {
    const list = host.querySelector('[data-matches]');
    if (!list || !Array.isArray(matches) || !matches.length) return;
    list.innerHTML = '';

    matches.slice(0, 8).forEach((m) => {
      const played = Number.isFinite(m.tore_heim) && Number.isFinite(m.tore_gast);
      const li = document.createElement('li');
      li.className = 'match' + (!played ? ' match--next' : '');

      const when = document.createElement('span');
      const time = document.createElement('time');
      time.dateTime = m.datum || '';
      time.textContent = fmtDate(m.datum);
      when.appendChild(time);

      const who = document.createElement('span');
      who.textContent = `${m.heim} – ${m.gast}`;

      const what = document.createElement('span');
      if (played) {
        what.className = 'match__score';
        what.textContent = `${m.tore_heim}:${m.tore_gast}`;
      } else {
        what.className = 'text-micro opacity-80';
        what.textContent = m.wettbewerb || 'noch offen';
      }

      li.append(when, who, what);
      list.appendChild(li);
    });
  };

  const renderTable = (host, rows) => {
    const body = host.querySelector('[data-table]');
    if (!body || !Array.isArray(rows) || !rows.length) return;
    body.innerHTML = '';

    rows.forEach((r) => {
      const tr = document.createElement('tr');
      if (r.eigen) tr.setAttribute('data-own', '');
      [
        [r.platz, ''],
        [r.mannschaft, ''],
        [r.spiele, 'num'],
        [r.tore, 'num'],
        [r.punkte, 'num']
      ].forEach(([value, cls]) => {
        const td = document.createElement('td');
        if (cls) td.className = cls;
        td.textContent = value ?? '';
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  };

  const loadFromEndpoint = async () => {
    teams.forEach((team) => setState(team, 'loading', 'Daten werden geladen …'));

    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      teams.forEach((team) => {
        const payload = data.teams?.[team.dataset.teamId];
        if (!payload) {
          setState(team, 'error', 'Für diese Mannschaft liegen gerade keine Daten vor.');
          return;
        }
        renderMatches(team, payload.spiele);
        renderTable(team, payload.tabelle);
        setState(team, 'ok', '');
      });

      const stamp = root.querySelector('[data-stand]');
      if (stamp && data.stand) {
        stamp.textContent = fmtDate(data.stand);
        if (stamp.tagName === 'TIME') stamp.dateTime = data.stand;
      }
    } catch (error) {
      teams.forEach((team) =>
        setState(team, 'error', 'Live-Abruf nicht möglich, angezeigt wird der gespeicherte Stand.')
      );
    }
  };

  if (widgetKey) startWidgets();
  else if (endpoint) loadFromEndpoint();
  else teams.forEach((team) => setState(team, 'ok', ''));
})();
