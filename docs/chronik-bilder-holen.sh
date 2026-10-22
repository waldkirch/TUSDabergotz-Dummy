#!/usr/bin/env bash
# Lädt die Chronikbilder von tusdabergotz.wordpress.com herunter und legt sie
# unter assets/img/chronik/ ab. Danach die Pfade in index.html ersetzen:
#
#   sed -i 's#https://tusdabergotz.wordpress.com/wp-content/uploads/[0-9]*/[0-9]*/#assets/img/chronik/#g' index.html
#
# Grund: Solange die Bilder von wordpress.com kommen, hängt die Ladezeit an
# einem fremden Server, und ein Hotlink-Schutz dort würde sie ausfallen lassen.

set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/img/chronik

BASE="https://tusdabergotz.wordpress.com/wp-content/uploads"

BILDER=(
  "2018/09/parieshausneuwp.jpg"
  "2018/10/erste1936beitrag.jpg"
  "2018/10/cherste1940wp.jpg"
  "2018/10/cherste1948wp.jpg"
  "2018/10/cherste1952wp.jpg"
  "2018/09/goldenertraktorwp.jpg"
  "2018/10/cherste1957wp.jpg"
  "2018/10/cherste1986wp.jpg"
  "2018/10/mamerste1990ebeitrag.jpg"
  "2018/10/cherste1992wp.jpg"
  "2018/09/platz1bwp.jpg"
  "2018/10/chsportplatz2006wp.jpg"
  "2018/09/sanierungwp.jpg"
  "2018/09/gasthaus2015wp.jpg"
)

for pfad in "${BILDER[@]}"; do
  datei="assets/img/chronik/$(basename "$pfad")"
  if [ -f "$datei" ]; then
    echo "vorhanden: $datei"
    continue
  fi
  echo "lade: $datei"
  curl -fsSL "$BASE/$pfad" -o "$datei"
done

echo
echo "Fertig. $(ls -1 assets/img/chronik | wc -l) Dateien in assets/img/chronik/"
