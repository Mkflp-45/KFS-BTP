// fragments.js
// Fragments HTML communs pour injection dynamique

const mainNav = `
<nav class="bg-white shadow-2xl rounded-b-3xl border-b border-blue-100 mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between relative animate__animated animate__fadeInDown" role="navigation" aria-label="Navigation principale">
  <div class="flex items-center space-x-4 md:space-x-6 justify-center md:justify-start w-full md:w-auto mb-2 md:mb-0">
    <a href="index.html" aria-label="Accueil KFS BTP">
      <img src="assets/logo-kfs-btp.jpeg" alt="Logo KFS BTP - Entreprise de BTP au Sénégal" class="h-14 w-14 rounded-full shadow-xl border-4 border-white bg-white object-cover">
    </a>
    <span class="font-extrabold text-2xl tracking-widest text-blue-900" style="font-family: 'Montserrat', Arial, sans-serif; letter-spacing: 0.1em;">KFS BTP</span>
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
  
  <ul class="flex flex-col md:flex-row md:space-x-4 text-base font-semibold w-full md:w-auto justify-center md:justify-center items-center md:items-center" role="menubar">
    <li role="none"><a href="index.html" role="menuitem" class="group relative px-2 py-2 transition text-blue-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><span>Accueil</span><span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-700 to-yellow-400 group-hover:w-full transition-all duration-300"></span></a></li>
    <li role="none"><a href="about.html" role="menuitem" class="group relative px-2 py-2 transition text-blue-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><span>À Propos</span><span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-700 to-yellow-400 group-hover:w-full transition-all duration-300"></span></a></li>
    <li role="none"><a href="vente.html" role="menuitem" class="group relative px-2 py-2 transition text-blue-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><span>Vente</span><span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-700 to-yellow-400 group-hover:w-full transition-all duration-300"></span></a></li>
    <li role="none"><a href="gestion-locative.html" role="menuitem" class="group relative px-2 py-2 transition text-blue-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><span>Location</span><span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-700 to-yellow-400 group-hover:w-full transition-all duration-300"></span></a></li>
    <li role="none"><a href="renovation-interieur.html" role="menuitem" class="group relative px-2 py-2 transition text-blue-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><span>Rénovation</span><span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-700 to-yellow-400 group-hover:w-full transition-all duration-300"></span></a></li>
    <li role="none"><a href="contact.html" role="menuitem" class="group relative px-2 py-2 transition text-blue-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><span>Contact</span><span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-700 to-yellow-400 group-hover:w-full transition-all duration-300"></span></a></li>
  </ul>
  <div class="md:hidden flex items-center justify-center w-full md:w-auto mt-2 md:mt-0">
    <button id="menu-toggle" class="text-blue-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded p-2" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-menu">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>
  </div>
</nav>
`;


const navLinks = `
    <li><a href="index.html" class="px-3 py-2 rounded transition duration-200 hover:bg-yellow-400 hover:text-blue-900">Accueil</a></li>
    <li><a href="about.html" class="px-3 py-2 rounded transition duration-200 hover:bg-yellow-400 hover:text-blue-900">À Propos</a></li>
    <li><a href="vente.html" class="px-3 py-2 rounded transition duration-200 hover:bg-yellow-400 hover:text-blue-900">Vente & Achat</a></li>
    <li><a href="gestion-locative.html" class="px-3 py-2 rounded transition duration-200 hover:bg-yellow-400 hover:text-blue-900">Gestion Locative</a></li>
    <li><a href="renovation-interieur.html" class="px-3 py-2 rounded transition duration-200 hover:bg-yellow-400 hover:text-blue-900">Rénovation</a></li>
    <li><a href="apporteur-affaire.html" class="px-3 py-2 rounded transition duration-200 hover:bg-yellow-400 hover:text-blue-900">Apporteur d'Affaires</a></li>
    <li><a href="contact.html" class="px-3 py-2 rounded transition duration-200 hover:bg-yellow-400 hover:text-blue-900">Contact</a></li>
    <li><a href="admin.html" class="px-3 py-2 rounded transition duration-200 hover:bg-yellow-400 hover:text-blue-900">Admin</a></li>
`;

const mobileNav = `
<div id="mobile-menu" class="hidden md:hidden bg-blue-800 bg-opacity-95 px-4 py-2 border-t border-blue-300 shadow-lg">
    <ul class="space-y-2">
        ${navLinks.replaceAll('px-3 py-2', 'block px-3 py-2')}
    </ul>
</div>
`;

const footer = `
<footer class="mt-16 rounded-t-3xl shadow-2xl border-t border-blue-200 animate__animated animate__fadeInUp" role="contentinfo" aria-label="Pied de page" style="background: linear-gradient(120deg, #1e3a8a 0%, #2563eb 60%, #0ea5e9 100%);">
  <div class="container mx-auto px-4 py-12 flex flex-col md:flex-row md:justify-between md:items-start text-white gap-8">
    <div class="flex-1 flex flex-col items-center md:items-start mb-8 md:mb-0">
      <div class="flex items-center space-x-3 mb-3">
        <img src="assets/logo-kfs-btp.jpeg" alt="Logo KFS BTP - Entreprise de BTP au Sénégal" class="h-14 w-14 rounded-full shadow-lg border-2 border-white bg-white object-cover">
        <span class="font-extrabold text-2xl tracking-widest" style="font-family: 'Montserrat', Arial, sans-serif; letter-spacing: 0.1em;">KFS BTP</span>
      </div>
      <span class="text-sm opacity-80 mb-2">Bâtir l'avenir au Sénégal</span>
      <div class="flex space-x-3 mt-2" role="group" aria-label="Réseaux sociaux">
        <a href="#" aria-label="Suivez-nous sur Facebook" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5 3.657 9.127 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.127 22 17 22 12z"/></svg></a>
        <a href="#" aria-label="Suivez-nous sur Instagram" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25 1.25a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"/></svg></a>
        <a href="#" aria-label="Suivez-nous sur LinkedIn" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.88v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg></a>
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
      <span class="text-sm"><span class="sr-only">Adresse :</span>Dakar, Sénégal</span>
      <span class="text-sm"><span class="sr-only">Email :</span><a href="mailto:contact@kfs-btp.sn" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">contact@kfs-btp.sn</a></span>
      <span class="text-sm"><span class="sr-only">Téléphone :</span><a href="tel:+221785842871" class="hover:text-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded">+221 78 584 28 71</a></span>
      <a href="https://wa.me/221785842871" aria-label="Nous contacter sur WhatsApp" class="mt-4 inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-yellow-400"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A12.07 12.07 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.25-1.44l-.38-.22-3.67.96.98-3.58-.25-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.41-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43s1.02 2.82 1.16 3.02c.14.2 2.01 3.07 4.88 4.19.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/></svg>WhatsApp</a>
    </address>
  </div>
  <div class="border-t border-blue-300 mt-8 pt-4 text-center text-sm text-white/80">
    &copy; <span id="year"></span> KFS BTP. Tous droits réservés.
  </div>
</footer>
`;

function injectFragments() {
    const header = document.querySelector('header');
    if (header) {
        header.innerHTML = mainNav + mobileNav;
    }
    const footerDiv = document.getElementById('main-footer');
    if (footerDiv) {
        footerDiv.innerHTML = footer;
    }
    // Mise à jour de l'année
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Menu mobile toggle - DOIT être ici après l'injection du header
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = !mobileMenu.classList.contains('hidden');
            menuBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            menuBtn.setAttribute('aria-label', isExpanded ? 'Fermer le menu' : 'Ouvrir le menu');
        });
        
        // Fermer le menu quand on clique sur un lien
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.setAttribute('aria-label', 'Ouvrir le menu');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', injectFragments);
