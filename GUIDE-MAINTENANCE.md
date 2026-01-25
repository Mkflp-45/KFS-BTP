# 🔧 GUIDE DE MAINTENANCE ET DÉPANNAGE - KFS BTP

## 📋 Table des matières
1. [Activer le mode maintenance](#-activer-le-mode-maintenance)
2. [Problèmes courants et solutions](#-problèmes-courants-et-solutions)
3. [Monitoring et logs](#-monitoring-et-logs)
4. [Sauvegarde et restauration](#-sauvegarde-et-restauration)
5. [Contacts d'urgence](#-contacts-durgence)

---

## 🚧 Activer le mode maintenance

### Méthode 1 : Redirection côté hébergeur (recommandé)

**Sur Vercel :**
Créez un fichier `vercel.json` avec :
```json
{
  "redirects": [
    { "source": "/((?!maintenance.html|assets/).*)", "destination": "/maintenance.html" }
  ]
}
```

**Sur Netlify :**
Créez un fichier `_redirects` avec :
```
/*    /maintenance.html   302
/maintenance.html  /maintenance.html  200
/assets/*  /assets/:splat  200
```

### Méthode 2 : Via le health-check.json

1. Modifiez `health-check.json` :
```json
{
    "status": "maintenance",
    "message": "Maintenance en cours",
    "estimatedEnd": "2026-01-24T08:00:00Z"
}
```

2. Le script de la page maintenance vérifiera automatiquement ce fichier.

### Méthode 3 : Via le dashboard admin

1. Connectez-vous à `/admin.html`
2. Allez dans **Paramètres** > **Maintenance**
3. Activez le mode maintenance

---

## 🔴 Problèmes courants et solutions

### 1. Le site ne s'affiche pas (page blanche)

**Causes possibles :**
- Erreur JavaScript
- CDN indisponible (Tailwind, Swiper...)
- Fichier manquant

**Solutions :**
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs dans l'onglet "Console"
3. Testez avec un autre navigateur
4. Videz le cache : `Ctrl+Shift+R`

**Vérification rapide :**
```javascript
// Dans la console du navigateur
ErrorHandler.healthCheck().then(console.log);
```

### 2. Les images ne s'affichent pas

**Causes possibles :**
- Chemin incorrect
- Image supprimée
- Cache navigateur

**Solutions :**
1. Vérifiez que l'image existe dans `/assets/`
2. Vérifiez le chemin dans le code HTML
3. Les noms d'images valides :
   - `logo-kfs-btp.jpeg`
   - `projet-renovation-1.jpeg`
   - `appartement-dakar-1.jpeg`
   - etc.

### 3. Le formulaire de contact ne fonctionne pas

**Causes possibles :**
- EmailJS non configuré
- Quota dépassé
- Erreur de configuration

**Solutions :**
1. Vérifiez la console pour les erreurs
2. Vérifiez `emailjs-config.js` :
   - `PUBLIC_KEY` correcte ?
   - `SERVICE_ID` correcte ?
   - `TEMPLATE_ID` correcte ?
3. Connectez-vous à https://www.emailjs.com/ et vérifiez votre quota

### 4. Le dashboard admin ne se charge pas

**Causes possibles :**
- Erreur JavaScript dans admin.js
- localStorage corrompu

**Solutions :**
1. Videz le localStorage :
```javascript
// Dans la console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

2. Réinitialisez l'admin via `/reset-admin.html`

3. Vérifiez les erreurs :
```javascript
ErrorHandler.getErrors();
```

### 5. Le site est lent

**Causes possibles :**
- Images trop lourdes
- Trop de requêtes
- localStorage saturé

**Solutions :**
1. Compressez les images (utilisez `optimize-images.ps1`)
2. Vérifiez la taille du localStorage :
```javascript
// Dans la console
let total = 0;
for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length * 2; // UTF-16
    }
}
console.log('LocalStorage:', (total / 1024).toFixed(2) + ' KB');
```

3. Nettoyez les vieilles données dans l'admin

### 6. PWA ne s'installe pas

**Causes possibles :**
- HTTPS non activé
- manifest.json invalide
- Service Worker en erreur

**Solutions :**
1. Le site DOIT être en HTTPS
2. Vérifiez le manifest : https://web.dev/manifest-validator/
3. Réinitialisez le Service Worker :
```javascript
// Dans la console
navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
});
caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
});
```

### 7. Erreur 404 sur certaines pages

**Causes possibles :**
- Fichier manquant
- Mauvais lien
- Configuration serveur

**Solutions :**
1. Vérifiez que le fichier existe
2. Vérifiez les liens dans `fragments.js`
3. Sur Vercel/Netlify, les fichiers HTML sont accessibles sans extension

---

## 📊 Monitoring et logs

### Consulter les erreurs

**Via la console :**
```javascript
// Voir toutes les erreurs
ErrorHandler.getErrors();

// Vérifier la santé du site
ErrorHandler.healthCheck().then(console.log);

// Exporter les erreurs (télécharge un fichier JSON)
ErrorHandler.exportErrors();

// Effacer les erreurs
ErrorHandler.clearErrors();
```

**Via le dashboard admin :**
1. Connectez-vous à `/admin.html`
2. Allez dans **Paramètres** > **Sécurité**
3. Consultez les logs de connexion et d'erreurs

### Activer le monitoring automatique

Ajoutez ce script dans `index.html` (déjà fait si vous utilisez `error-handler.js`) :
```html
<script src="error-handler.js"></script>
```

---

## 💾 Sauvegarde et restauration

### Sauvegarder les données

**Via le dashboard admin :**
1. Connectez-vous à `/admin.html`
2. Allez dans **Paramètres** > **Sauvegarde**
3. Cliquez sur **Exporter les données**

**Via la console :**
```javascript
// Exporter tout le localStorage
const backup = {};
for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
        backup[key] = localStorage[key];
    }
}
const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'kfs-btp-backup-' + new Date().toISOString().split('T')[0] + '.json';
a.click();
```

### Restaurer les données

**Via le dashboard admin :**
1. Allez dans **Paramètres** > **Sauvegarde**
2. Cliquez sur **Importer les données**
3. Sélectionnez votre fichier de sauvegarde

**Via la console :**
```javascript
// Collez votre backup JSON ici
const backup = { /* votre backup */ };
for (let key in backup) {
    localStorage.setItem(key, backup[key]);
}
location.reload();
```

### Réinitialisation complète

⚠️ **ATTENTION : Ceci effacera TOUTES les données !**

```javascript
localStorage.clear();
sessionStorage.clear();
// Déconnexion du Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
});
// Vider le cache
caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
});
// Recharger
location.reload(true);
```

---

## 🆘 Contacts d'urgence

### Support technique
- **Développeur** : [Votre contact]
- **Email** : contact@kfs-btp.sn
- **Téléphone** : +221 78 584 28 71

### Hébergeur
- **Vercel** : https://vercel.com/support
- **Netlify** : https://www.netlify.com/support/
- **OVH** : https://www.ovh.com/support/

### Services tiers
- **EmailJS** : https://www.emailjs.com/docs/
- **Google Analytics** : https://support.google.com/analytics
- **Firebase** : https://firebase.google.com/support

---

## 📅 Planning de maintenance recommandé

| Fréquence | Tâche |
|-----------|-------|
| Quotidien | Vérifier les messages/demandes |
| Hebdomadaire | Vérifier les logs d'erreurs |
| Mensuel | Sauvegarder les données |
| Mensuel | Mettre à jour les annonces |
| Trimestriel | Vérifier les liens cassés |
| Annuel | Renouveler le domaine et SSL |

---

*Guide de maintenance KFS BTP - Version 1.0 - Janvier 2026*
