// fragments.js
// Fragments HTML communs pour injection dynamique
// Les paramètres sont chargés depuis localStorage (siteSettings)

// Charger les paramètres du site
function getSiteSettings() {
    const defaultSettings = {
        company: 'KFS BTP IMMO',
        slogan: 'Bâtir l\'avenir au Sénégal',
        phone: '+221 78 584 28 71',
        phoneFrance: '+33 6 05 84 68 07',
        whatsapp: '221785842871',
        email: 'kfsbtpproimmo@gmail.com',
        address: 'Villa 123 MC, Quartier Medinacoura, Tambacounda',
        city: 'Tambacounda, Sénégal',
        ninea: '009468499',
        rccm: 'SN TBC 2025 M 1361',
        facebook: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        twitter: '',
        tiktok: '',
        colorPrimary: '#1e3a8a',
        colorSecondary: '#facc15',
        showWhatsappBtn: true,
        logo: 'assets/logo-kfs-btp.jpeg'
    };
    
    try {
        const stored = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        return { ...defaultSettings, ...stored };
    } catch (e) {
        return defaultSettings;
    }
}

// Générer la navigation principale avec les paramètres
function generateMainNav() {
    const s = getSiteSettings();
    return `
<nav class="bg-white shadow-2xl rounded-b-3xl border-b border-blue-100 mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between relative animate__animated animate__fadeInDown" role="navigation" aria-label="Navigation principale">
  <div class="flex items-center space-x-4 md:space-x-6 justify-center md:justify-start w-full md:w-auto mb-2 md:mb-0">
    <a href="index.html" aria-label="Accueil ${s.company}">
      <img src="${s.logo || 'assets/logo-kfs-btp.jpeg'}" alt="Logo ${s.company}" class="h-14 w-14 rounded-full shadow-xl border-4 border-white bg-white object-cover">
    </a>
    <span class="font-extrabold text-2xl tracking-widest text-blue-900" style="font-family: 'Montserrat', Arial, sans-serif; letter-spacing: 0.1em;">${s.company}</span>
  </div>
  
  <!-- Barre de recherche globale -->
  <div class="hidden md:flex items-center mx-4 flex-1 max-w-md">
    <div class="relative w-full">
      <input type="search" id="global-search" placeholder="Rechercher un bien, service..." 
        class="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
        aria-label="Rechercher sur le site">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <div id="search-results" class="hidden absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-blue-100 max-h-96 overflow-y-auto z-50"></div>
    </div>
  </div>
  
  <ul class="flex flex-row flex-wrap gap-1 md:gap-0 md:space-x-4 text-xs md:text-base font-semibold w-full md:w-auto justify-center items-center" role="menubar">
    <li role="none"><a href="index.html" role="menuitem" class="group relative px-2 py-1 md:py-2 transition text-blue-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><span>Accueil</span><span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-700 to-yellow-400 group-hover:w-full transition-all duration-300"></span></a></li>
    <li role="none"><a href="vente.html" role="menuitem" class="group relative px-2 py-1 md:py-2 transition text-blue-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><span>Vente</span><span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-700 to-yellow-400 group-hover:w-full transition-all duration-300"></span></a></li>
    <li role="none"><a href="gestion-locative.html" role="menuitem" class="group relative px-2 py-1 md:py-2 transition text-blue-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><span>Location</span><span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-700 to-yellow-400 group-hover:w-full transition-all duration-300"></span></a></li>
    <li role="none"><a href="renovation-interieur.html" role="menuitem" class="group relative px-2 py-1 md:py-2 transition text-blue-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><span>Rénovation</span><span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-700 to-yellow-400 group-hover:w-full transition-all duration-300"></span></a></li>
    <li role="none"><a href="contact.html" role="menuitem" class="group relative px-2 py-1 md:py-2 transition text-blue-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><span>Contact</span><span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-700 to-yellow-400 group-hover:w-full transition-all duration-300"></span></a></li>
  </ul>
</nav>
`;
}

// Pour compatibilité avec l'ancien code
const mainNav = generateMainNav();


// navLinks et mobileNav supprimés (le hamburger donnait accès au panneau admin)

// Générer le footer dynamiquement avec les paramètres
function generateFooter() {
    const s = getSiteSettings();
    
    // Générer les icônes de réseaux sociaux
    let socialIcons = '';
    if (s.facebook) {
        socialIcons += `<a href="${s.facebook}" target="_blank" rel="noopener" aria-label="Suivez-nous sur Facebook" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5 3.657 9.127 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.127 22 17 22 12z"/></svg></a>`;
    }
    if (s.instagram) {
        socialIcons += `<a href="${s.instagram}" target="_blank" rel="noopener" aria-label="Suivez-nous sur Instagram" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25 1.25a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"/></svg></a>`;
    }
    if (s.linkedin) {
        socialIcons += `<a href="${s.linkedin}" target="_blank" rel="noopener" aria-label="Suivez-nous sur LinkedIn" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.88v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg></a>`;
    }
    if (s.youtube) {
        socialIcons += `<a href="${s.youtube}" target="_blank" rel="noopener" aria-label="Suivez-nous sur YouTube" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>`;
    }
    if (s.tiktok) {
        socialIcons += `<a href="${s.tiktok}" target="_blank" rel="noopener" aria-label="Suivez-nous sur TikTok" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>`;
    }
    
    // Si pas de réseaux sociaux configurés, afficher des placeholders
    if (!socialIcons) {
        socialIcons = `
            <a href="#" aria-label="Facebook" class="hover:text-yellow-400 transition"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5 3.657 9.127 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.127 22 17 22 12z"/></svg></a>
            <a href="#" aria-label="Instagram" class="hover:text-yellow-400 transition"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25 1.25a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"/></svg></a>
            <a href="#" aria-label="LinkedIn" class="hover:text-yellow-400 transition"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.88v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg></a>
        `;
    }
    
    return `
<footer class="mt-16 rounded-t-3xl shadow-2xl border-t border-blue-200 animate__animated animate__fadeInUp" role="contentinfo" aria-label="Pied de page" style="background: linear-gradient(120deg, #1e3a8a 0%, #2563eb 60%, #0ea5e9 100%);">
  <div class="container mx-auto px-4 py-12 flex flex-col md:flex-row md:justify-between md:items-start text-white gap-8">
    <div class="flex-1 flex flex-col items-center md:items-start mb-8 md:mb-0">
      <div class="flex items-center space-x-3 mb-3">
        <img src="${s.logo || 'assets/logo-kfs-btp.jpeg'}" alt="Logo ${s.company}" class="h-14 w-14 rounded-full shadow-lg border-2 border-white bg-white object-cover">
        <span class="font-extrabold text-2xl tracking-widest" style="font-family: 'Montserrat', Arial, sans-serif; letter-spacing: 0.1em;">${s.company}</span>
      </div>
      <span class="text-sm opacity-80 mb-2">${s.slogan}</span>
      <div class="flex space-x-3 mt-2" role="group" aria-label="Réseaux sociaux">
        ${socialIcons}
      </div>
    </div>
    <nav class="flex-1 flex flex-col items-center mb-8 md:mb-0" aria-label="Liens du pied de page">
      <span class="font-semibold mb-2 text-lg" id="footer-nav-title">Navigation</span>
      <ul class="space-y-2 text-base" aria-labelledby="footer-nav-title">
        <li><a href="index.html" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">Accueil</a></li>
        <li><a href="about.html" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">À Propos</a></li>
        <li><a href="vente.html" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">Vente & Achat</a></li>
        <li><a href="gestion-locative.html" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">Gestion Locative</a></li>
        <li><a href="renovation-interieur.html" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">Rénovation</a></li>
        <li><a href="apporteur-affaire.html" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">Apporteur d'Affaires</a></li>
        <li><a href="contact.html" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">Contact</a></li>
        <li><a href="mentions-legales.html" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">Mentions légales</a></li>
        <li><a href="politique-confidentialite.html" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">Politique de confidentialité</a></li>
      </ul>
    </nav>
    <address class="flex-1 flex flex-col items-center md:items-end not-italic">
      <span class="font-semibold mb-2 text-lg">Contact</span>
      <span class="text-sm"><span class="sr-only">Adresse :</span>${s.address}</span>
      <span class="text-sm"><span class="sr-only">Email :</span><a href="mailto:${s.email}" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">${s.email}</a></span>
      <span class="text-sm"><span class="sr-only">Téléphone :</span><a href="tel:${s.phone.replace(/\s/g, '')}" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">${s.phone}</a></span>
      ${s.phoneFrance ? `<span class="text-sm"><span class="sr-only">Téléphone France :</span><a href="tel:${s.phoneFrance.replace(/\s/g, '')}" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">${s.phoneFrance}</a></span>` : ''}
      <span class="text-sm"><span class="sr-only">WhatsApp :</span><a href="https://wa.me/${s.whatsapp}" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">WhatsApp</a></span>
      ${s.ninea ? `<span class="text-sm">NINEA : ${s.ninea}</span>` : ''}
      ${s.rccm ? `<span class="text-sm">RCCM : ${s.rccm}</span>` : ''}
    </address>
  </div>
  <div class="border-t border-blue-300 mt-8 pt-4 text-center text-sm text-white/80">
    &copy; <span id="year"></span> ${s.company}. Tous droits réservés.
  </div>
</footer>
`;
}

// Pour compatibilité
const footer = generateFooter();

function injectFragments() {
    const s = getSiteSettings();
    
    const header = document.querySelector('header');
    if (header) {
        header.innerHTML = generateMainNav();
    }
    const footerDiv = document.getElementById('main-footer');
    if (footerDiv) {
        footerDiv.innerHTML = generateFooter();
    }
    // Mise à jour de l'année
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Ajouter le bouton WhatsApp flottant si activé
    if (s.showWhatsappBtn && s.whatsapp) {
        addWhatsAppButton(s.whatsapp);
    }
    
    // Menu hamburger supprimé - les liens sont directement visibles en flex-wrap
}

// Ajouter le bouton WhatsApp flottant
function addWhatsAppButton(whatsappNumber) {
    // Vérifier si le bouton existe déjà
    if (document.getElementById('whatsapp-float-btn')) return;
    
    const btn = document.createElement('a');
    btn.id = 'whatsapp-float-btn';
    btn.href = `https://wa.me/${whatsappNumber}`;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.className = 'fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 animate-bounce';
    btn.setAttribute('aria-label', 'Nous contacter sur WhatsApp');
    btn.innerHTML = `
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
    `;
    
    // Ajouter une animation personnalisée
    const style = document.createElement('style');
    style.textContent = `
        #whatsapp-float-btn {
            animation: whatsapp-pulse 2s infinite;
        }
        @keyframes whatsapp-pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
        }
        #whatsapp-float-btn:hover {
            animation: none;
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(btn);
}

document.addEventListener('DOMContentLoaded', injectFragments);
