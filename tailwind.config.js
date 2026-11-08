/** @type {import('tailwindcss').Config} */
const theme = require('./assets/js/tailwind.theme.js');

module.exports = {
  content: [
    './*.html',
    './assets/js/**/*.js'
  ],
  theme,
  plugins: [require('@tailwindcss/forms')]
};
