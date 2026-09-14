/** @type {import('tailwindcss').Config} */
const theme = require('./assets/js/tailwind.theme.js');

module.exports = {
  content: [
    './index.html',
    './assets/js/**/*.js',
    // WordPress-Theme später hier ergänzen:
    // '../wp-content/themes/tus-dabergotz/**/*.php'
  ],
  theme,
  plugins: [
    require('@tailwindcss/forms')
  ]
};
