/* Nur für die Entwicklung: übergibt das Theme an das Tailwind-Play-CDN.
   Muss nach cdn.tailwindcss.com und nach tailwind.theme.js geladen werden. */
if (typeof tailwind !== 'undefined' && typeof TUSD_THEME !== 'undefined') {
  tailwind.config = { theme: TUSD_THEME };
}
