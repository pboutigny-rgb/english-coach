#!/usr/bin/env bash
# Produit ./site : version invités à la racine, version propriétaire dans un sous-dossier secret.
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
OUT="$SRC/site"
SECRET="p-$(head -c 5 /dev/urandom | od -An -tx1 | tr -d ' \n')"
rm -rf "$OUT"; mkdir -p "$OUT/$SECRET"
FILES="index.html app.css app.js companion.js progress.js profile.js qrcode.js edition.js sw.js manifest.webmanifest icons"
for f in $FILES; do cp -r "$SRC/$f" "$OUT/$SECRET/"; cp -r "$SRC/$f" "$OUT/"; done
sed -i "s/EC_EDITION = 'owner'/EC_EDITION = 'guest'/" "$OUT/edition.js"
sed -i "s/const CACHE = '[^']*'/const CACHE = 'english-coach-invites'/" "$OUT/sw.js"
sed -i "s/const CACHE = '[^']*'/const CACHE = 'english-coach-owner'/" "$OUT/$SECRET/sw.js"
echo "Version invités : /   |   Version propriétaire (à garder secrète) : /$SECRET/"
