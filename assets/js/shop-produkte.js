/* =============================================================================
   Produktfotos des Vereinsshops (tus-dabergotz.fan12.de)

   WARUM DIESE DATEI EXISTIERT
   Der Shop lädt seine Produktfotos per JavaScript nach. Im ausgelieferten
   HTML stehen sie nicht, sie ließen sich deshalb nicht automatisch übernehmen.
   Namen und Links der Artikel stehen direkt in index.html (sichtbar, von
   Suchmaschinen lesbar). Nur die Bildadressen fehlen – und die werden hier
   eingetragen, an genau einer Stelle.

   SO TRÄGST DU EIN BILD NACH
     1. Artikel im Shop öffnen.
     2. Rechtsklick auf das Produktfoto → "Bildadresse kopieren"
        (Firefox: "Grafik-Adresse kopieren").
     3. Adresse unten zwischen die Anführungszeichen setzen.
        Sie beginnt voraussichtlich mit https://cdn.fan12.de/ oder
        https://media.fan12.de/.

   BESSER FÜR DEN LIVEBETRIEB
   Bilder herunterladen, nach assets/img/fanshop/ legen und den lokalen Pfad
   eintragen, etwa "assets/img/fanshop/fanschal.jpg". Dann hängt die
   Vereinsseite nicht an einem fremden Server und lädt schneller.

   Solange ein Eintrag leer bleibt, zeigt die Kachel das Vereinswappen auf
   hellem Grund. Die Seite bleibt also in jedem Fall vollständig benutzbar.
   ========================================================================== */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TUSD_SHOP_BILDER = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    'weihnachtstasse':      '',
    'schluesselanhaenger':  '',
    'beanie':               '',
    'fanschal':             '',
    'kabinenposter':        '',
    'shirt-forza':          '',

    /* Die vier Artikel des oberen Blocks „Unsere Hingucker“ */
    'hoodie-oversize':      '',
    'hoodie-hometown':      '',
    'zipper-kids':          '',
    'brotdose':             ''
  };
});
