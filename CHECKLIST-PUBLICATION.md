# ✅ CHECKLIST DE PUBLICATION - KFS BTP

## 🎉 CE QUI A ÉTÉ FAIT AUTOMATIQUEMENT

### Images
- [x] ✅ Renommage de toutes les images (29 fichiers) avec noms SEO-friendly
- [x] ✅ Mise à jour des références dans tous les fichiers HTML/JS

### URLs et SEO
- [x] ✅ Unification du domaine vers `https://kfs-btp.com`
- [x] ✅ Mise à jour de sitemap.xml avec dates et fréquences
- [x] ✅ Mise à jour de robots.txt
- [x] ✅ Suppression de admin.html du sitemap (pages publiques uniquement)
- [x] ✅ Ajout des pages légales au sitemap

### PWA
- [x] ✅ Correction de manifest.json (start_url: /index.html)
- [x] ✅ Ajout de toutes les tailles d'icônes requises

### Contact
- [x] ✅ Numéro de téléphone mis à jour : +221 78 584 28 71
- [x] ✅ Email mis à jour : contact@kfs-btp.com
- [x] ✅ WhatsApp mis à jour

### Pages légales
- [x] ✅ Mentions légales améliorées (structure entreprise)
- [x] ✅ Politique de confidentialité mise à jour

### Configuration
- [x] ✅ Fichier site-config.js créé (configuration centralisée)

---

## ⚠️ CE QUE VOUS DEVEZ FAIRE MANUELLEMENT

### 1. Acheter et configurer le domaine
- [ ] Acheter le domaine `kfs-btp.com` (ou utiliser un autre)
- [ ] Configurer le DNS vers votre hébergeur

### 2. Choisir un hébergeur et déployer
**Options gratuites recommandées :**
- **Vercel** : https://vercel.com (idéal, gratuit)
- **Netlify** : https://netlify.com (gratuit)
- **GitHub Pages** : gratuit si vous utilisez GitHub

**Déploiement Vercel (recommandé) :**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3. Configurer Google Analytics
1. Allez sur https://analytics.google.com/
2. Créez un compte et une propriété
3. Copiez l'ID de mesure (format: G-XXXXXXXXXX)
4. Remplacez `G-XXXXXXXXXX` dans tous les fichiers HTML

### 4. Configurer Google Search Console
1. Allez sur https://search.google.com/search-console
2. Ajoutez votre propriété (domaine)
3. Vérifiez avec la balise HTML
4. ✅ **DÉJÀ FAIT** - Code de vérification: `oy3NvVwRaOri6w8iCcRwmjWWKlH3Y70VtY6vdrThE04`
5. Soumettez votre sitemap: `https://kfs-btp.com/sitemap.xml`

### 5. Configurer EmailJS (pour les formulaires)
1. Créez un compte sur https://www.emailjs.com/
2. Ajoutez un service email (Gmail recommandé)
3. Créez un template
4. Mettez à jour `emailjs-config.js` avec vos identifiants

### 6. Compléter les informations légales
Dans `mentions-legales.html` et `site-config.js` :
- [x] NINEA de l'entreprise: `009468499` ✅
- [x] Numéro RCCM: `SN TBC 2025 M 1361` ✅
- [x] Adresse: Villa 123 MC, Quartier Medinacoura, Tambacounda ✅
- [x] Nom du responsable: Directeur Général ✅
- [ ] Informations de l'hébergeur (après déploiement)

### 7. Réseaux sociaux
Créez les pages et mettez à jour les liens dans `fragments.js` :
- [ ] Page Facebook : https://facebook.com/kfsbtp
- [ ] Page Instagram : https://instagram.com/kfsbtp
- [ ] Page LinkedIn : https://linkedin.com/company/kfsbtp

### 8. Sécurité (IMPORTANT !)
- [ ] **Changez le mot de passe admin par défaut**
  - Connectez-vous à `/admin.html` avec `admin123`
  - Allez dans Paramètres > Sécurité
  - Changez le mot de passe

---

## 📱 TEST AVANT PUBLICATION

### Vérifications à faire :
- [ ] Ouvrir le site sur mobile (responsive)
- [ ] Tester tous les formulaires de contact
- [ ] Vérifier toutes les images s'affichent
- [ ] Tester le lien WhatsApp
- [ ] Vérifier la navigation (menu mobile)
- [ ] Tester le dashboard admin
- [ ] Installer la PWA sur mobile

### Outils de test :
- **Performance** : https://pagespeed.web.dev/
- **SEO** : https://seositecheckup.com/
- **Mobile** : https://search.google.com/test/mobile-friendly
- **Accessibilité** : https://wave.webaim.org/

---

## 📞 CONTACTS UTILES

- **Téléphone** : +221 78 584 28 71
- **Email** : contact@kfs-btp.com
- **WhatsApp** : https://wa.me/221785842871

---

*Checklist générée le 23 janvier 2026*
