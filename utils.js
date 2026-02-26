// Script utilitaire commun pour KFS BTP

// ===================================================
// OPTIMISATION DES PERFORMANCES
// ===================================================
(function() {
    // Lazy loading natif pour les images
    document.addEventListener('DOMContentLoaded', function() {
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.setAttribute('loading', 'lazy');
            img.setAttribute('decoding', 'async');
        });
    });
    
    // Prefetch des pages principales au survol des liens
    document.addEventListener('DOMContentLoaded', function() {
        const links = document.querySelectorAll('a[href$=".html"]');
        links.forEach(link => {
            link.addEventListener('mouseenter', function() {
                const href = this.getAttribute('href');
                if (href && !document.querySelector(`link[href="${href}"]`)) {
                    const prefetch = document.createElement('link');
                    prefetch.rel = 'prefetch';
                    prefetch.href = href;
                    document.head.appendChild(prefetch);
                }
            }, { once: true });
        });
    });
})();

// ===================================================
// RECHERCHE GLOBALE
// ===================================================
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('global-search');
        const searchResults = document.getElementById('search-results');
        
        if (!searchInput || !searchResults) return;
        
        // Pages du site avec mots-clés
        const sitePages = [
            { title: 'Accueil', url: 'index.html', keywords: ['accueil', 'kfs', 'btp', 'construction', 'sénégal', 'dakar'] },
            { title: 'À Propos', url: 'about.html', keywords: ['propos', 'histoire', 'équipe', 'entreprise', 'qui sommes'] },
            { title: 'Vente Immobilière', url: 'vente.html', keywords: ['vente', 'achat', 'maison', 'appartement', 'terrain', 'immobilier'] },
            { title: 'Location Courte Durée', url: 'location-courte.html', keywords: ['location', 'courte', 'meublé', 'vacances', 'temporaire'] },
            { title: 'Location Longue Durée', url: 'location-longue.html', keywords: ['location', 'longue', 'bail', 'louer', 'appartement'] },
            { title: 'Gestion Locative', url: 'gestion-locative.html', keywords: ['gestion', 'locative', 'propriétaire', 'gérer', 'loyer'] },
            { title: 'Rénovation', url: 'renovation-interieur.html', keywords: ['rénovation', 'travaux', 'intérieur', 'aménagement', 'décoration'] },
            { title: 'Apporteur d\'Affaires', url: 'apporteur-affaire.html', keywords: ['apporteur', 'affaires', 'commission', 'partenaire', 'recommander'] },
            { title: 'Contact', url: 'contact.html', keywords: ['contact', 'téléphone', 'email', 'message', 'devis'] }
        ];
        
        let debounceTimer;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => performSearch(this.value), 200);
        });
        
        searchInput.addEventListener('focus', function() {
            if (this.value.length >= 2) {
                searchResults.classList.remove('hidden');
            }
        });
        
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
        
        function performSearch(query) {
            if (query.length < 2) {
                searchResults.classList.add('hidden');
                return;
            }
            
            const q = query.toLowerCase().trim();
            let results = [];
            
            // Chercher dans les pages
            sitePages.forEach(page => {
                const matchTitle = page.title.toLowerCase().includes(q);
                const matchKeywords = page.keywords.some(k => k.includes(q));
                if (matchTitle || matchKeywords) {
                    results.push({
                        type: 'page',
                        title: page.title,
                        url: page.url,
                        icon: '📄'
                    });
                }
            });
            
            // Chercher dans les annonces (localStorage)
            const annonces = JSON.parse(localStorage.getItem('annonces') || '[]');
            annonces.filter(a => a.status === 'actif').forEach(annonce => {
                const title = (annonce.title || '').toLowerCase();
                const desc = (annonce.description || annonce.desc || '').toLowerCase();
                const location = (annonce.location || '').toLowerCase();
                
                if (title.includes(q) || desc.includes(q) || location.includes(q)) {
                    results.push({
                        type: 'annonce',
                        title: annonce.title || 'Annonce',
                        subtitle: annonce.price || annonce.location || '',
                        url: getCategoryUrl(annonce.category),
                        icon: '🏠'
                    });
                }
            });
            
            // Afficher les résultats
            if (results.length > 0) {
                searchResults.innerHTML = results.slice(0, 8).map(r => `
                    <a href="${r.url}" class="flex items-center px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-0">
                        <span class="text-2xl mr-3">${r.icon}</span>
                        <div>
                            <div class="font-medium text-blue-900">${highlightMatch(r.title, q)}</div>
                            ${r.subtitle ? `<div class="text-sm text-gray-500">${r.subtitle}</div>` : ''}
                        </div>
                    </a>
                `).join('');
                searchResults.classList.remove('hidden');
            } else {
                searchResults.innerHTML = `
                    <div class="px-4 py-6 text-center text-gray-500">
                        <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Aucun résultat pour "${query}"
                    </div>
                `;
                searchResults.classList.remove('hidden');
            }
        }
        
        function getCategoryUrl(category) {
            switch(category) {
                case 'vente': return 'vente.html';
                case 'location-courte': return 'location-courte.html';
                case 'location-longue': return 'location-longue.html';
                default: return 'vente.html';
            }
        }
        
        function highlightMatch(text, query) {
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escaped})`, 'gi');
            return text.replace(regex, '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>');
        }
    });
})();

// ===================================================
// ACCESSIBILITÉ AMÉLIORÉE
// ===================================================
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Ajouter le lien "Aller au contenu" si pas déjà présent
        if (!document.querySelector('a[href="#main-content"]')) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-800 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg';
            skipLink.textContent = 'Aller au contenu principal';
            document.body.insertBefore(skipLink, document.body.firstChild);
        }
        
        // Assurer que le main a l'id main-content
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main-content';
        }
        
        // Note: Le menu mobile est géré par fragments.js après injection du header
        
        // Focus visible amélioré pour la navigation au clavier
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        document.addEventListener('mousedown', function() {
            document.body.classList.remove('keyboard-navigation');
        });
    });
})();

// Note: Le menu mobile et l'année sont gérés par fragments.js après injection du header

// Effet de survol accentué sur tous les boutons (pour toutes les pages)
(function() {
    document.querySelectorAll('a, button, input[type="submit"]').forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.classList.add('ring', 'ring-yellow-400', 'scale-105');
        });
        el.addEventListener('mouseleave', function() {
            this.classList.remove('ring', 'ring-yellow-400', 'scale-105');
        });
    });
})();
// ===================================================
// AFFICHAGE DES ANNONCES PUBLIQUES (depuis localStorage)
// ===================================================
(function() {
    // Détermine la catégorie selon la page actuelle
    function getCurrentCategory() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('location-courte')) return 'location-courte';
        if (path.includes('location-longue') || path.includes('gestion-locative')) return 'location-longue';
        if (path.includes('vente')) return 'vente';
        return null; // Page d'accueil ou autre
    }
    
    // Extrait le prix numérique depuis une chaîne
    function extractPrice(priceStr) {
        if (!priceStr) return 0;
        const numbers = priceStr.replace(/[^0-9]/g, '');
        return parseInt(numbers) || 0;
    }
    
    // Rend les annonces dans un conteneur avec filtres
    function renderPublicAnnonces(container, category, filters = {}) {
        const annonces = JSON.parse(localStorage.getItem('annonces') || '[]');
        
        // Filtre: seulement les annonces actives de la catégorie
        let filtered = annonces.filter(a => a.status === 'actif');
        if (category) {
            filtered = filtered.filter(a => a.category === category);
        }
        
        // Appliquer les filtres utilisateur
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(a => 
                (a.title || '').toLowerCase().includes(searchLower) ||
                (a.description || a.desc || '').toLowerCase().includes(searchLower) ||
                (a.location || '').toLowerCase().includes(searchLower)
            );
        }
        
        if (filters.type) {
            filtered = filtered.filter(a => a.type === filters.type);
        }
        
        if (filters.budget) {
            const maxBudget = parseInt(filters.budget);
            filtered = filtered.filter(a => extractPrice(a.price) <= maxBudget);
        }
        
        // Mettre à jour le compteur
        const countEl = document.getElementById('results-count');
        if (countEl) {
            countEl.textContent = `${filtered.length} bien${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`;
        }
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">🏠</div>
                    <p class="text-gray-500 text-lg mb-4">Aucune annonce ne correspond à vos critères.</p>
                    <p class="text-gray-400">Essayez de modifier vos filtres ou contactez-nous.</p>
                </div>
            `;
            return;
        }
        
        // Génère le HTML des annonces avec support multi-images
        const html = filtered.map((a, idx) => {
            const images = a.images || (a.image ? [a.image] : []);
            const mainImage = images[0] || '';
            const imageCount = images.length;
            const uniqueId = `annonce-${idx}-${Date.now()}`;
            
            return `
            <div class="bg-white p-6 rounded-2xl shadow-2xl border border-blue-100 flex flex-col items-center animate__animated animate__fadeInUp">
                <div class="relative w-full mb-4">
                    ${mainImage ? `
                        <div class="relative overflow-hidden rounded-lg group">
                            <img id="${uniqueId}-img" src="${mainImage}" alt="${a.title || 'Annonce KFS BTP'}" 
                                class="w-full h-48 object-cover shadow-md transition-transform duration-300 cursor-pointer hover:scale-105" 
                                loading="lazy"
                                onclick="openPublicLightbox(${JSON.stringify(images).replace(/"/g, '&quot;')}, 0, '${(a.title || 'Annonce').replace(/'/g, "\\'")}')"
                                title="Cliquez pour agrandir">
                            <!-- Icône zoom au survol -->
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
                                <span class="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2 rounded-full shadow-lg">
                                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                                    </svg>
                                </span>
                            </div>
                            ${imageCount > 1 ? `
                                <div class="absolute bottom-2 right-2 flex gap-1 z-10">
                                    <button onclick="event.stopPropagation(); changeAnnonceImage('${uniqueId}', ${JSON.stringify(images).replace(/"/g, '&quot;')}, -1)" class="bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                                    </button>
                                    <button onclick="event.stopPropagation(); changeAnnonceImage('${uniqueId}', ${JSON.stringify(images).replace(/"/g, '&quot;')}, 1)" class="bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                                    </button>
                                </div>
                                <span class="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">${imageCount} photos</span>
                            ` : ''}
                        </div>
                    ` : `<div class="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center"><span class="text-gray-400 text-4xl">🏠</span></div>`}
                </div>
                ${a.type ? `<span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full mb-2">${a.type}</span>` : ''}
                <h3 class="text-xl font-bold mb-2 text-blue-900 text-center">${a.title || 'Annonce'}</h3>
                ${a.location ? `<p class="text-sm text-gray-500 mb-2">📍 ${a.location}</p>` : ''}
                <p class="text-gray-700 mb-4 text-center line-clamp-3">${a.description || a.desc || ''}</p>
                <p class="text-blue-700 font-bold text-lg mb-4">${a.price || 'Prix sur demande'}</p>
                <a href="#contact" class="bg-gradient-to-r from-blue-700 via-blue-500 to-yellow-400 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:from-yellow-400 hover:to-blue-700 hover:text-blue-900 transition duration-300">Demander un Devis</a>
            </div>
        `}).join('');
        
        container.innerHTML = html;
    }
    
    // Fonction globale pour naviguer entre les images d'une annonce
    window.changeAnnonceImage = function(uniqueId, images, direction) {
        const imgEl = document.getElementById(`${uniqueId}-img`);
        if (!imgEl || !images || images.length <= 1) return;
        
        const currentSrc = imgEl.src;
        let currentIndex = images.findIndex(img => currentSrc.includes(img.split('?')[0]) || img === currentSrc);
        if (currentIndex === -1) currentIndex = 0;
        
        const newIndex = (currentIndex + direction + images.length) % images.length;
        imgEl.src = images[newIndex];
        imgEl.style.transform = 'scale(1.02)';
        setTimeout(() => imgEl.style.transform = 'scale(1)', 200);
    };
    
    // ===================================================
    // LIGHTBOX PUBLIQUE POUR VOIR LES IMAGES EN GRAND
    // ===================================================
    let currentLightboxImages = [];
    let currentLightboxIndex = 0;
    
    window.openPublicLightbox = function(images, startIndex = 0, title = '') {
        if (!images || images.length === 0) return;
        
        currentLightboxImages = images;
        currentLightboxIndex = startIndex;
        
        // Créer la lightbox si elle n'existe pas
        let lightbox = document.getElementById('public-lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'public-lightbox';
            lightbox.className = 'fixed inset-0 z-[9999] bg-black/95 hidden';
            lightbox.innerHTML = `
                <div class="absolute inset-0 flex flex-col">
                    <!-- Header -->
                    <div class="flex justify-between items-center p-4 text-white">
                        <div>
                            <h3 id="lightbox-title" class="text-lg font-semibold"></h3>
                            <span id="lightbox-counter" class="text-sm text-gray-300"></span>
                        </div>
                        <button onclick="closePublicLightbox()" class="p-2 hover:bg-white/10 rounded-full transition" title="Fermer (Échap)">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Image principale -->
                    <div class="flex-1 flex items-center justify-center p-4 relative">
                        <!-- Bouton précédent -->
                        <button id="lightbox-prev" onclick="lightboxNavigate(-1)" 
                            class="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-10" title="Image précédente">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                        </button>
                        
                        <!-- Image -->
                        <img id="lightbox-main-image" src="" alt="" 
                            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-300">
                        
                        <!-- Bouton suivant -->
                        <button id="lightbox-next" onclick="lightboxNavigate(1)" 
                            class="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-10" title="Image suivante">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Vignettes -->
                    <div id="lightbox-thumbnails" class="flex justify-center gap-2 p-4 overflow-x-auto"></div>
                    
                    <!-- Instructions -->
                    <div class="text-center text-gray-400 text-sm pb-4">
                        <span class="hidden md:inline">← → pour naviguer • Échap pour fermer</span>
                        <span class="md:hidden">Glissez pour naviguer</span>
                    </div>
                </div>
            `;
            document.body.appendChild(lightbox);
            
            // Fermer en cliquant sur le fond
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox || e.target.classList.contains('flex-1')) {
                    closePublicLightbox();
                }
            });
        }
        
        // Mettre à jour le titre
        document.getElementById('lightbox-title').textContent = title;
        
        // Afficher la lightbox
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Afficher l'image
        updateLightboxImage();
        
        // Générer les vignettes
        renderLightboxThumbnails();
        
        // Écouter les touches clavier
        document.addEventListener('keydown', handleLightboxKeydown);
    };
    
    window.closePublicLightbox = function() {
        const lightbox = document.getElementById('public-lightbox');
        if (lightbox) {
            lightbox.classList.add('hidden');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleLightboxKeydown);
        }
    };
    
    window.lightboxNavigate = function(direction) {
        if (currentLightboxImages.length <= 1) return;
        currentLightboxIndex = (currentLightboxIndex + direction + currentLightboxImages.length) % currentLightboxImages.length;
        updateLightboxImage();
        updateLightboxThumbnailsActive();
    };
    
    function updateLightboxImage() {
        const img = document.getElementById('lightbox-main-image');
        const counter = document.getElementById('lightbox-counter');
        const prevBtn = document.getElementById('lightbox-prev');
        const nextBtn = document.getElementById('lightbox-next');
        
        if (img) {
            img.style.opacity = '0';
            setTimeout(() => {
                img.src = currentLightboxImages[currentLightboxIndex];
                img.style.opacity = '1';
            }, 150);
        }
        
        if (counter) {
            counter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxImages.length}`;
        }
        
        // Masquer les boutons si une seule image
        const showNav = currentLightboxImages.length > 1;
        if (prevBtn) prevBtn.style.display = showNav ? '' : 'none';
        if (nextBtn) nextBtn.style.display = showNav ? '' : 'none';
    }
    
    function renderLightboxThumbnails() {
        const container = document.getElementById('lightbox-thumbnails');
        if (!container || currentLightboxImages.length <= 1) {
            if (container) container.innerHTML = '';
            return;
        }
        
        container.innerHTML = currentLightboxImages.map((img, i) => `
            <img src="${img}" alt="Vignette ${i + 1}" 
                class="w-16 h-16 object-cover rounded-lg cursor-pointer transition-all border-2 ${i === currentLightboxIndex ? 'border-yellow-400 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}"
                onclick="lightboxGoTo(${i})">
        `).join('');
    }
    
    function updateLightboxThumbnailsActive() {
        const thumbnails = document.querySelectorAll('#lightbox-thumbnails img');
        thumbnails.forEach((thumb, i) => {
            if (i === currentLightboxIndex) {
                thumb.classList.add('border-yellow-400', 'opacity-100');
                thumb.classList.remove('border-transparent', 'opacity-50');
            } else {
                thumb.classList.remove('border-yellow-400', 'opacity-100');
                thumb.classList.add('border-transparent', 'opacity-50');
            }
        });
    }
    
    window.lightboxGoTo = function(index) {
        currentLightboxIndex = index;
        updateLightboxImage();
        updateLightboxThumbnailsActive();
    };
    
    function handleLightboxKeydown(e) {
        if (e.key === 'Escape') {
            closePublicLightbox();
        } else if (e.key === 'ArrowLeft') {
            lightboxNavigate(-1);
        } else if (e.key === 'ArrowRight') {
            lightboxNavigate(1);
        }
    }
    window.resetFilters = function() {
        const searchInput = document.getElementById('filter-search');
        const typeSelect = document.getElementById('filter-type');
        const budgetSelect = document.getElementById('filter-budget');
        
        if (searchInput) searchInput.value = '';
        if (typeSelect) typeSelect.value = '';
        if (budgetSelect) budgetSelect.value = '';
        
        // Re-render
        const category = getCurrentCategory();
        const catalogueSection = document.getElementById('catalogue');
        if (catalogueSection) {
            const grid = catalogueSection.querySelector('.grid');
            if (grid) renderPublicAnnonces(grid, category, {});
        }
    };
    
    // Fonction pour appliquer les filtres
    function applyFilters() {
        const filters = {
            search: document.getElementById('filter-search')?.value || '',
            type: document.getElementById('filter-type')?.value || '',
            budget: document.getElementById('filter-budget')?.value || ''
        };
        
        const category = getCurrentCategory();
        const catalogueSection = document.getElementById('catalogue');
        if (catalogueSection) {
            const grid = catalogueSection.querySelector('.grid');
            if (grid) renderPublicAnnonces(grid, category, filters);
        }
    }
    
    // Fonction centrale de rendu des annonces
    function renderAll() {
        const category = getCurrentCategory();
        
        // Cherche le conteneur de catalogue
        const catalogueSection = document.getElementById('catalogue');
        if (catalogueSection) {
            const grid = catalogueSection.querySelector('.grid');
            if (grid) renderPublicAnnonces(grid, category, {});
        }
        
        // Pour la page d'accueil
        const indexCatalogue = document.getElementById('index-catalogue');
        if (indexCatalogue) {
            const grid = indexCatalogue.querySelector('.grid');
            if (grid) renderPublicAnnonces(grid, null, {});
        }
    }

    // Attend le chargement du DOM
    document.addEventListener('DOMContentLoaded', function() {
        renderAll();
        
        // Ajouter les event listeners pour les filtres
        const searchInput = document.getElementById('filter-search');
        const typeSelect = document.getElementById('filter-type');
        const budgetSelect = document.getElementById('filter-budget');
        
        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (typeSelect) typeSelect.addEventListener('change', applyFilters);
        if (budgetSelect) budgetSelect.addEventListener('change', applyFilters);
    });

    // Re-render quand les données Firebase arrivent
    window.addEventListener('firebase-data-loaded', function() {
        console.log('🔄 Re-rendu des annonces (données Firebase)');
        renderAll();
    });
})();

// ===================================================
// AFFICHAGE DES TÉMOIGNAGES - Géré dans index.html
// ===================================================

// ===================================================
// AFFICHAGE DES FAQ PUBLIQUES (depuis localStorage)
// ===================================================
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const faqSection = document.getElementById('faq');
        if (!faqSection) return;
        
        const container = faqSection.querySelector('.space-y-6, .max-w-3xl, .max-w-2xl');
        if (!container) return;
        
        function renderFAQ() {
            const faqs = JSON.parse(localStorage.getItem('faq') || '[]');
            // Seulement les FAQ visibles
            const filtered = faqs.filter(f => f.visible === true || (f.status !== 'inactif' && f.actif !== false));
            
            if (filtered.length === 0) return; // Garder le contenu existant
            
            container.innerHTML = filtered.map(f => {
                const question = f.question || '';
                const reponse = f.reponse || f.answer || '';
                
                return `
                    <div class="bg-blue-100 rounded-xl p-6 shadow animate__animated animate__fadeInUp">
                        <h3 class="font-semibold text-blue-800 mb-2">${question}</h3>
                        <p class="text-gray-700">${reponse}</p>
                    </div>
                `;
            }).join('');
        }

        renderFAQ();

        // Re-render quand les données Firebase arrivent
        window.addEventListener('firebase-data-loaded', function() {
            renderFAQ();
        });
    });
})();

// ===================================================
// AFFICHAGE DU CARROUSEL DYNAMIQUE (depuis localStorage)
// ===================================================
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        if (!swiperWrapper) return;
        
        const slides = JSON.parse(localStorage.getItem('carousel') || '[]');
        
        function renderCarousel(slidesData) {
            if (!slidesData || slidesData.length === 0) return;
            swiperWrapper.innerHTML = slidesData.map(s => {
                const image = s.image || s.imageUrl || '';
                const title = s.title || '';
                const subtitle = s.subtitle || '';
                
                return `
                    <div class="swiper-slide">
                        <div class="relative">
                            <img src="${image}" alt="${title || 'Projet KFS BTP'}" class="w-full h-80 object-contain rounded-lg transition-transform duration-300 hover:scale-105 shadow-xl" loading="lazy">
                            ${title ? `
                                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
                                    <h3 class="text-white font-bold text-lg">${title}</h3>
                                    ${subtitle ? `<p class="text-white/80 text-sm">${subtitle}</p>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            // Réinitialiser Swiper si disponible
            if (typeof Swiper !== 'undefined') {
                // Détruire l'instance précédente si elle existe
                var swiperEl = document.querySelector('.mySwiper');
                if (swiperEl && swiperEl.swiper) {
                    swiperEl.swiper.destroy(true, true);
                }
                new Swiper('.mySwiper', {
                    loop: true,
                    autoplay: { delay: 3000, disableOnInteraction: false },
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                    effect: 'fade',
                    fadeEffect: { crossFade: true }
                });
            }
        }

        // Si des slides sont définis dans l'admin, les utiliser
        if (slides.length > 0) {
            renderCarousel(slides);
        }

        // Re-render quand les données Firebase arrivent
        window.addEventListener('firebase-data-loaded', function() {
            var freshSlides = JSON.parse(localStorage.getItem('carousel') || '[]');
            if (freshSlides.length > 0) {
                console.log('🔄 Re-rendu du carrousel (données Firebase)');
                renderCarousel(freshSlides);
            }
        });
    });
})();

// ===================================================
// GESTION DES FORMULAIRES DE CONTACT (FALLBACK)
// Note: script.js gère les formulaires WhatsApp Direct
// Ce code sert uniquement de fallback pour les pages sans script.js
// ===================================================
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Ne pas exécuter si script.js est présent (gère WhatsApp Direct)
        if (typeof window.whatsappFormHandlerActive !== 'undefined') return;
        
        // Trouver tous les formulaires de contact
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Ignorer les formulaires admin, recherche ou déjà gérés
            if (form.closest('#dashboard-container') || form.closest('.filters')) return;
            if (form.dataset.handled === 'true') return;
            
            form.addEventListener('submit', function(e) {
                // Si le formulaire a déjà un handler WhatsApp, ne pas interférer
                if (form.dataset.whatsapp === 'true') return;
                
                e.preventDefault();
                
                // Collecter les données du formulaire
                const formData = new FormData(form);
                const data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });
                
                // Récupérer les champs par ID ou name
                const nom = form.querySelector('[name="nom"], [id*="nom"]')?.value || '';
                const email = form.querySelector('[name="email"], [id*="email"], [type="email"]')?.value || '';
                const tel = form.querySelector('[name="telephone"], [name="tel"], [id*="tel"], [type="tel"]')?.value || '';
                const sujet = form.querySelector('[name="sujet"], select')?.value || 'Contact';
                const message = form.querySelector('[name="message"], textarea')?.value || '';
                
                // Sauvegarder dans localStorage pour l'admin
                const messages = JSON.parse(localStorage.getItem('messages') || '[]');
                const msgData = {
                    nom: nom,
                    email: email,
                    telephone: tel,
                    sujet: sujet,
                    message: message,
                    date: new Date().toISOString(),
                    lu: false,
                    source: window.location.pathname
                };
                messages.push(msgData);
                localStorage.setItem('messages', JSON.stringify(messages));
                
                // Envoyer aussi à Firebase
                if (typeof window.saveMessageToFirebase === 'function') {
                    window.saveMessageToFirebase(msgData);
                }
                
                // Afficher le succès
                const successEl = form.querySelector('#contact-success, .success-message');
                const errorEl = form.querySelector('#contact-error, .error-message');
                const submitBtn = form.querySelector('[type="submit"]');
                const submitText = form.querySelector('#submit-text');
                const submitLoading = form.querySelector('#submit-loading');
                
                if (submitText) submitText.classList.add('hidden');
                if (submitLoading) submitLoading.classList.remove('hidden');
                if (submitBtn) submitBtn.disabled = true;
                
                // Simuler un délai d'envoi
                setTimeout(() => {
                    if (submitText) submitText.classList.remove('hidden');
                    if (submitLoading) submitLoading.classList.add('hidden');
                    if (submitBtn) submitBtn.disabled = false;
                    
                    if (successEl) {
                        successEl.classList.remove('hidden');
                        setTimeout(() => successEl.classList.add('hidden'), 5000);
                    } else {
                        alert('✅ Message envoyé avec succès ! Nous vous répondrons rapidement.');
                    }
                    
                    form.reset();
                }, 1000);
            });
        });
    });
})();