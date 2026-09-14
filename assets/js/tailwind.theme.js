/* =============================================================================
   Tailwind-Theme – einzige Quelle für Farben, Schriften, Größen, Abstände.
   Wird von beiden Wegen genutzt:
     · Entwicklung: assets/js/tailwind-cdn.js reicht das Objekt ans Play-CDN
     · Produktion:  tailwind.config.js importiert es für den Build
   Alle Werte sind an der Designvorlage gemessen (Canvas 1366 px).
   ========================================================================== */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TUSD_THEME = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px'
    },
    extend: {
      colors: {
        club: {
          red: '#F51A21',        // Primärfläche
          'red-dark': '#D2141A', // zweite Fläche zur Sektionstrennung
          'red-tint': '#FF5158'
        },
        ink: '#111111',
        'ink-soft': '#4A4A4A',
        shelf: '#F7F7F7',        // Produktbild-Hintergrund im Fanshop
        chalk: '#FFFFFF'
      },
      fontFamily: {
        display: ['"Gochi Hand"', 'ui-rounded', 'cursive'],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI',
               'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      fontSize: {
        // gemessene Versalhöhen: H1 48 px, H2 37 px, Fließtext 20 px
        hero:    ['clamp(2.25rem, 5.4vw, 4.125rem)', { lineHeight: '1.1',  letterSpacing: '0.06em' }],
        section: ['clamp(1.875rem, 3.6vw, 3.125rem)', { lineHeight: '1.15', letterSpacing: '0.06em' }],
        badge:   ['clamp(1.25rem, 2.8vw, 2.375rem)',  { lineHeight: '1.05', letterSpacing: '0.04em' }],
        shop:    ['clamp(1.375rem, 2.4vw, 1.875rem)', { lineHeight: '1.2',  letterSpacing: '0.04em' }],
        lead:  ['1.25rem',   { lineHeight: '1.42' }],
        body:  ['1.0625rem', { lineHeight: '1.5' }],
        nav:   ['1.25rem',   { lineHeight: '1' }],
        card:  ['1rem',      { lineHeight: '1.3' }],
        small: ['0.9375rem', { lineHeight: '1.35' }],
        micro: ['0.875rem',  { lineHeight: '1.4' }]
      },
      spacing: {
        gutter: '1.5rem',
        nav: '4.75rem',          // 76 px Kopfleiste
        band: '1.75rem',         // Bildband → Überschrift
        'section-sm': '3rem',
        section: '4rem',
        'section-lg': '6rem'
      },
      maxWidth: {
        content: '1200px',
        text: '62ch',
        narrow: '34rem'
      },
      borderRadius: { pill: '9999px', note: '3px' },
      boxShadow: { card: '0 12px 32px rgba(0,0,0,0.18)' }
    }
  };
});
