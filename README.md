# Toutes les pages principales du site ont été mises à jour avec le nouveau footer moderne (janvier 2026).
# KFS BTP – Guide de maintenance et bonnes pratiques

## Structure du projet
- Chaque page HTML correspond à une section métier (accueil, admin, contact, etc.).
- Les images sont dans le dossier `assets/`.
- Les scripts communs sont centralisés dans `utils.js`.
- Les styles personnalisés sont dans `style.css` (complétés par Tailwind).

## Scripts et automatisations
- `utils.js` : gère le menu mobile, l’année dynamique, et les effets de survol sur tous les boutons.
- `script.js` : logique spécifique à l’accueil (formulaires, carrousel, témoignages dynamiques).
- `admin.js` : gestion dynamique des annonces, témoignages, infos entreprise (stockage localStorage).

## Administration
- Accès protégé par mot de passe côté client (modifiable dans `admin.html`).
- Ajout d’annonces possible avec image (fichier ou URL, stocké en base64 dans localStorage).

## Accessibilité et SEO
- Toutes les images ont des attributs alt descriptifs.
- Un seul `<h1>` par page, titres structurés.
- Balises meta optimisées pour le référencement.
- Favicon défini dans le `<head>`.

## Conseils de maintenance
- Compressez les images avant de les placer dans `assets/`.
- Pour ajouter une nouvelle page, copiez la structure d’une page existante et adaptez le contenu.
- Pour modifier le mot de passe admin, changez la valeur dans le script de `admin.html`.

## Déploiement
- Hébergez le dossier sur un serveur web (ex : Netlify, Vercel, OVH, etc.).
- Testez le site sur mobile et desktop pour vérifier le responsive.

## Outils utiles
- Pour compresser les images : TinyPNG, Squoosh, ou la commande suivante :
```sh
npx @squoosh/cli --webp auto -d ./assets ./assets/WhatsApp\ Image\ 2026-01-07\ at\ 19.53.34.jpeg
```
- Pour tester la performance : https://pagespeed.web.dev/

## Contact
Pour toute question technique, contactez l’équipe KFS BTP ou le développeur référent.
