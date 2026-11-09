# English Coach

Application web installable (PWA), gratuite, pour s'entraîner à l'oral en anglais, espagnol, allemand et italien par conversation vocale mains libres avec l'API Gemini Live. Un interlocuteur unique et configurable, une mémoire à long terme, un test de niveau aligné sur le CECRL, un mode traduction en direct et un suivi de progression.

Aucune dépendance de build : HTML, CSS et JavaScript simples.

## Utilisation

1. Crée une clé API Gemini gratuite dans Google AI Studio (https://aistudio.google.com/api-keys).
2. Publie le dossier sur un hébergement statique en HTTPS (Netlify, GitHub Pages, etc.), ou lance `python3 -m http.server` en local.
3. Ouvre l'adresse sur le téléphone, installe l'appli (iPhone : Partager puis « Sur l'écran d'accueil »), puis colle ta clé dans Réglages.

La clé et toutes les données restent dans le stockage du navigateur de l'appareil. Rien n'est envoyé ailleurs qu'à l'API Google.

## Deux éditions

`edition.js` définit l'édition : `owner` (onglet QR pour inviter un proche) ou `guest` (sans création d'invitation). Le script `build-site.sh` produit un dossier `site/` avec la version invités à la racine et la version propriétaire dans un sous-dossier au nom aléatoire.

```
./build-site.sh
```

L'invitation ne transmet jamais la clé API : chaque invité crée la sienne.

## Guide

Voir `docs-guide.md` (en français).

## Licences et crédits

- `qrcode.js` : qrcode-generator (MIT), https://github.com/kazuhikoarase/qrcode-generator
- Le reste du code n'a pas encore de licence : sans licence, tous droits sont réservés à l'auteur.
