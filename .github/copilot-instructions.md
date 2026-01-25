# Instructions Copilot - KFS BTP

## Aperçu du Projet
Site web vitrine + admin pour **KFS BTP**, entreprise de BTP/immobilier au Sénégal. Site statique avec stockage localStorage, PWA supportée.

## Architecture

### Structure des fichiers
- **Pages HTML** : Une page par service métier (vente, location, rénovation, contact, etc.)
- **`admin.html` + `admin.js`** : Dashboard admin complet (~1500 lignes) avec modules : catalogue, témoignages, comptabilité, CRM, RDV
- **`fragments.js`** : Composants réutilisables (nav, footer) injectés dynamiquement dans les `<header>` et footer
- **`script.js`** : Logique page d'accueil (formulaires, carrousel Swiper)
- **`utils.js`** : Utilitaires communs (menu mobile, année dynamique, effets hover)
- **`assets/`** : Images du projet (format WhatsApp JPEG)

### Stack technique
- **Tailwind CSS** via CDN (pas de build)
- **Animate.css** pour animations
- **Swiper.js** pour carrousels
- **Chart.js** dans l'admin pour statistiques
- **Pas de backend** : tout en `localStorage`

## Conventions de Code

### JavaScript
- Pattern IIFE pour isolation dans `utils.js` et `script.js`
- Modules admin initialisés via fonctions `init*()` au DOMContentLoaded
- Données stockées en JSON dans localStorage : `annonces`, `messages`, `temoignages`, `media`
- Fonctions globales pour actions UI (ex: `markAsRead(index)`, `deleteMessage(index)`)

```javascript
// Pattern type pour nouveau module admin
function initNouveauModule() {
    renderNouveauModule();
    // Event listeners sur formulaires
    document.getElementById('nouveau-form').addEventListener('submit', ...);
}
```

### HTML
- Un seul `<h1>` par page
- Attributs `alt` descriptifs sur toutes les images
- Classes Tailwind : `bg-blue-*`, `text-yellow-*` pour la palette KFS
- Animations : `animate__animated animate__fadeInUp`

### CSS
- Styles custom dans `style.css` (formulaires, hero)
- Palette : bleu (`#1e3a8a`, `#2563eb`), jaune (`yellow-400/500`), blanc/gris

## Patterns Importants

### Injection des fragments
```javascript
// Dans chaque page HTML, le header/footer sont injectés via fragments.js
document.querySelector('header').innerHTML = mainNav;
```

### Stockage localStorage admin
```javascript
// Lecture/écriture type
const items = JSON.parse(localStorage.getItem('key') || '[]');
items.push(newItem);
localStorage.setItem('key', JSON.stringify(items));
```

### Authentification admin (côté client)
- Mot de passe encodé en base64 dans `localStorage.adminPassword`
- Session via `sessionStorage.adminAuth`

## Pour Ajouter du Code

### Nouvelle page HTML
1. Copier structure d'une page existante (ex: `vente.html`)
2. Modifier `<title>`, `<meta>`, `<h1>`
3. Inclure scripts : `utils.js`, `fragments.js`
4. Ajouter lien dans `fragments.js` (navLinks)

### Nouveau module admin
1. Ajouter fonction `initNouveauModule()` dans `admin.js`
2. Appeler dans le DOMContentLoaded
3. Créer section HTML `<section id="module-nouveau" class="module-section">`
4. Ajouter entrée navigation dans `titles` object

## Commandes Utiles
```sh
# Compression images
npx @squoosh/cli --webp auto -d ./assets ./assets/image.jpeg

# Test local
# Ouvrir index.html avec Live Server ou serveur HTTP local
```

## À Éviter
- Ne pas utiliser de bundler (pas de npm run build)
- Ne pas modifier les CDN externes sans tester la compatibilité
- Pas d'async/await complexe (support navigateurs anciens)
- Images > 500KB à compresser avant ajout
