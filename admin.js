// ===================================================
// ADMIN DASHBOARD - KFS BTP
// Script complet pour la gestion du site
// Version 3.1 - Avec Comptabilité avancée, IA, CRM, Gestion entreprise, Monitoring
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // === INITIALISATION ===
    initLogin();
    initNavigation();
    initDashboard();
    initMessages();
    initCatalogue();
    initCarousel();
    initTemoignages();
    initFaq();
    initMedia();
    initSettings();
    initSeo();
    initBackup();
    initSecurity();
    initRdv();
    initAnalytics();
    initNotifications();
    initPWA();
    initUpdates(); // Module mises à jour
    initMaintenance(); // Module maintenance
    
    // Nouveaux modules Gestion Entreprise
    initComptabilite();
    initBilans();
    initClients();
    initProjets();
    initEmployes();
    initStocks();
    initDocuments();
    
    // Date actuelle
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
});

// ===================================================
// MODULE: LOGIN / AUTHENTIFICATION (SÉCURISÉE)
// ===================================================

// Fonction de hachage SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'KFS_BTP_SALT_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function initLogin() {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Vérifier si déjà connecté
    if (sessionStorage.getItem('adminAuth') === 'true') {
        loginScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
    }
    
    // Migration : convertir ancien mot de passe base64 vers SHA-256
    (async function migratePassword() {
        const oldPassword = localStorage.getItem('adminPassword');
        if (oldPassword && !localStorage.getItem('adminPasswordHash')) {
            // Ancien format base64, migrer vers SHA-256
            try {
                const decoded = atob(oldPassword);
                const hash = await hashPassword(decoded);
                localStorage.setItem('adminPasswordHash', hash);
                console.log('✅ Mot de passe migré vers SHA-256');
            } catch(e) {
                // Déjà en nouveau format ou erreur
            }
        }
        // Mot de passe par défaut si aucun n'existe
        if (!localStorage.getItem('adminPasswordHash')) {
            const defaultHash = await hashPassword('admin123');
            localStorage.setItem('adminPasswordHash', defaultHash);
        }
    })();
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const password = document.getElementById('login-password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        // UI loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-pulse">Connexion...</span>';
        
        const hash = await hashPassword(password);
        
        // Vérifier aussi avec Firebase si configuré
        if (typeof Auth !== 'undefined' && window.isFirebaseConfigured && window.isFirebaseConfigured()) {
            const emailInput = document.getElementById('login-email');
            const email = emailInput ? emailInput.value : 'admin@kfs-btp.sn';
            const result = await Auth.login(email, password);
            
            if (result.success) {
                loginScreen.classList.add('hidden');
                dashboard.classList.remove('hidden');
                loginError.classList.add('hidden');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Connexion';
                return;
            }
        }
        
        // Vérification locale avec SHA-256
        if (hash === localStorage.getItem('adminPasswordHash')) {
            sessionStorage.setItem('adminAuth', 'true');
            loginScreen.classList.add('hidden');
            dashboard.classList.remove('hidden');
            loginError.classList.add('hidden');
            
            // Log de connexion
            const loginLogs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
            loginLogs.unshift({
                date: new Date().toISOString(),
                success: true,
                ip: 'local'
            });
            localStorage.setItem('loginLogs', JSON.stringify(loginLogs.slice(0, 50)));
            
        } else {
            loginError.classList.remove('hidden');
            document.getElementById('login-password').value = '';
            
            // Log tentative échouée
            const loginLogs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
            loginLogs.unshift({
                date: new Date().toISOString(),
                success: false,
                ip: 'local'
            });
            localStorage.setItem('loginLogs', JSON.stringify(loginLogs.slice(0, 50)));
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Connexion';
    });
    
    logoutBtn.addEventListener('click', async function() {
        sessionStorage.removeItem('adminAuth');
        if (typeof Auth !== 'undefined') {
            await Auth.logout();
        }
        window.location.reload();
    });
}

// ===================================================
// MODULE: NAVIGATION
// ===================================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const modules = document.querySelectorAll('.module-section');
    const pageTitle = document.getElementById('page-title');
    
    const titles = {
        'dashboard': 'Tableau de bord',
        'messages': 'Boîte de réception',
        'catalogue': 'Gestion du catalogue',
        'carousel': 'Gestion du carrousel',
        'temoignages': 'Témoignages clients',
        'faq': 'Questions fréquentes',
        'media': 'Bibliothèque de médias',
        'settings': 'Paramètres du site',
        'seo': 'Optimisation SEO',
        'updates': 'Mises à jour',
        'maintenance': 'Maintenance & Monitoring',
        'backup': 'Sauvegarde & Restauration',
        'security': 'Sécurité',
        'rdv': 'Gestion des Rendez-vous',
        'analytics': 'Analytics & Statistiques',
        'comptabilite': 'Comptabilité',
        'bilans': 'Bilans Financiers',
        'clients': 'CRM Clients',
        'projets': 'Projets & Chantiers',
        'employes': 'Gestion des Employés',
        'stocks': 'Gestion des Stocks',
        'documents': 'Documents'
    };
    
    function showModule(moduleId) {
        modules.forEach(m => m.classList.remove('active'));
        navLinks.forEach(l => l.classList.remove('active'));
        
        const targetModule = document.getElementById('module-' + moduleId);
        const targetLink = document.querySelector(`[data-module="${moduleId}"]`);
        
        if (targetModule) targetModule.classList.add('active');
        if (targetLink) targetLink.classList.add('active');
        if (titles[moduleId]) pageTitle.textContent = titles[moduleId];
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const moduleId = this.dataset.module;
            showModule(moduleId);
        });
    });
    
    // Actions rapides
    document.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', function() {
            showModule(this.dataset.goto);
        });
    });
    
    // Quick actions
    document.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', function() {
            const moduleId = this.dataset.goto;
            showModule(moduleId);
        });
    });
}

// ===================================================
// MODULE: DASHBOARD
// ===================================================
function initDashboard() {
    updateStats();
    renderRecentMessages();
}

function updateStats() {
    const annonces = JSON.parse(localStorage.getItem('annonces') || '[]');
    const temoignages = JSON.parse(localStorage.getItem('temoignages') || '[]');
    const media = JSON.parse(localStorage.getItem('media') || '[]');
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    document.getElementById('stat-annonces').textContent = annonces.length;
    document.getElementById('stat-temoignages').textContent = temoignages.length;
    document.getElementById('stat-media').textContent = media.length;
    document.getElementById('stat-messages').textContent = messages.length;
    
    // Badge messages non lus
    const unread = messages.filter(m => !m.read).length;
    const badge = document.getElementById('messages-badge');
    if (unread > 0) {
        badge.textContent = unread;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderRecentMessages() {
    const container = document.getElementById('recent-messages');
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    if (messages.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Aucun message pour le moment</p>';
        return;
    }
    
    container.innerHTML = messages.slice(0, 3).map(msg => `
        <div class="p-3 bg-gray-50 rounded-lg ${!msg.read ? 'border-l-4 border-yellow-400' : ''}">
            <div class="flex justify-between items-start">
                <p class="font-medium text-gray-800">${msg.name}</p>
                <span class="text-xs text-gray-400">${new Date(msg.date).toLocaleDateString('fr-FR')}</span>
            </div>
            <p class="text-sm text-gray-600 truncate">${msg.message}</p>
        </div>
    `).join('');
}

// ===================================================
// MODULE: MESSAGES
// ===================================================
function initMessages() {
    renderMessages();
    
    document.getElementById('mark-all-read').addEventListener('click', function() {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.forEach(m => m.read = true);
        localStorage.setItem('messages', JSON.stringify(messages));
        renderMessages();
        updateStats();
        renderRecentMessages();
    });
    
    document.getElementById('clear-messages').addEventListener('click', function() {
        if (confirm('Supprimer tous les messages ?')) {
            localStorage.removeItem('messages');
            renderMessages();
            updateStats();
            renderRecentMessages();
        }
    });
}

function renderMessages() {
    const container = document.getElementById('messages-list');
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    if (messages.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-12">Aucun message reçu</p>';
        return;
    }
    
    container.innerHTML = messages.map((msg, i) => `
        <div class="message-card ${!msg.read ? 'unread' : ''} bg-white p-5 rounded-xl shadow-sm">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="font-bold text-gray-800">${msg.name}</h4>
                    <p class="text-sm text-gray-500">${msg.email} • ${msg.phone || 'N/A'}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-400">${new Date(msg.date).toLocaleString('fr-FR')}</span>
                    ${!msg.read ? '<span class="bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded-full">Nouveau</span>' : ''}
                </div>
            </div>
            <p class="text-gray-700 mb-3">${msg.message}</p>
            <p class="text-sm text-blue-600 mb-3"><strong>Besoin :</strong> ${msg.service || 'Non spécifié'}</p>
            <div class="flex space-x-2">
                ${!msg.read ? `<button onclick="markAsRead(${i})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">Marquer lu</button>` : ''}
                <button onclick="deleteMessage(${i})" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">Supprimer</button>
                <a href="mailto:${msg.email}" class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">Répondre</a>
            </div>
        </div>
    `).join('');
}

function markAsRead(index) {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages[index].read = true;
    localStorage.setItem('messages', JSON.stringify(messages));
    renderMessages();
    updateStats();
    renderRecentMessages();
}

function deleteMessage(index) {
    if (confirm('Supprimer ce message ?')) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.splice(index, 1);
        localStorage.setItem('messages', JSON.stringify(messages));
        renderMessages();
        updateStats();
        renderRecentMessages();
    }
}

// ===================================================
// MODULE: CATALOGUE
// ===================================================
// Variable globale pour stocker les images temporaires
let catalogueTempImages = [];
let catalogueExistingImages = [];

function initCatalogue() {
    renderCatalogue();
    initCatalogueDropzone();
    
    const form = document.getElementById('catalogue-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editIndex = document.getElementById('catalogue-edit-index').value;
        
        // Combiner images existantes et nouvelles
        const allImages = [...catalogueExistingImages, ...catalogueTempImages];
        
        const saveAnnonce = () => {
            const annonces = JSON.parse(localStorage.getItem('annonces') || '[]');
            const annonce = {
                title: document.getElementById('catalogue-title').value || '',
                description: document.getElementById('catalogue-desc').value || '',
                price: document.getElementById('catalogue-price').value || '',
                location: document.getElementById('catalogue-location')?.value || '',
                category: document.getElementById('catalogue-category').value || 'vente',
                type: document.getElementById('catalogue-type')?.value || 'maison',
                status: document.getElementById('catalogue-status').value || 'actif',
                images: allImages, // Tableau d'images
                image: allImages[0] || '', // Compatibilité: première image
                date: new Date().toISOString()
            };
            
            if (editIndex !== '') {
                annonces[parseInt(editIndex)] = annonce;
                showNotification('Annonce modifiée', annonce.title, 'success');
            } else {
                annonces.push(annonce);
                showNotification('Annonce ajoutée', annonce.title, 'success');
            }
            
            localStorage.setItem('annonces', JSON.stringify(annonces));
            form.reset();
            document.getElementById('catalogue-edit-index').value = '';
            catalogueTempImages = [];
            catalogueExistingImages = [];
            closeCatalogueModal();
            renderCatalogue();
            updateStats();
        };
        
        saveAnnonce();
    });
}

// Initialiser le drag & drop
function initCatalogueDropzone() {
    const dropzone = document.getElementById('catalogue-dropzone');
    if (!dropzone) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.add('border-blue-500', 'bg-blue-50');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.remove('border-blue-500', 'bg-blue-50');
        });
    });
    
    dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        handleCatalogueFiles(files);
    });
}

// Gérer les fichiers sélectionnés
function handleCatalogueFiles(files) {
    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    Array.from(files).forEach(file => {
        if (catalogueTempImages.length + catalogueExistingImages.length >= maxFiles) {
            showNotification('Limite atteinte', 'Maximum 10 images par annonce', 'warning');
            return;
        }
        
        if (file.size > maxSize) {
            showNotification('Fichier trop volumineux', `${file.name} dépasse 5MB`, 'error');
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            showNotification('Format invalide', `${file.name} n'est pas une image`, 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            catalogueTempImages.push(e.target.result);
            renderCatalogueImagesPreview();
        };
        reader.readAsDataURL(file);
    });
}

// Afficher les previews des nouvelles images
function renderCatalogueImagesPreview() {
    const container = document.getElementById('catalogue-images-preview');
    if (!container) return;
    
    if (catalogueTempImages.length === 0) {
        container.classList.add('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    container.innerHTML = catalogueTempImages.map((img, i) => `
        <div class="relative group">
            <img src="${img}" alt="Preview ${i+1}" class="w-full h-20 object-cover rounded-lg border-2 border-gray-200">
            <button type="button" onclick="removeCatalogueTempImage(${i})" 
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-lg">
                <span class="material-icons text-sm">close</span>
            </button>
            ${i === 0 ? '<span class="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">Principal</span>' : ''}
        </div>
    `).join('');
}

// Supprimer une nouvelle image
window.removeCatalogueTempImage = function(index) {
    catalogueTempImages.splice(index, 1);
    renderCatalogueImagesPreview();
};

// Supprimer une image existante
window.removeCatalogueExistingImage = function(index) {
    catalogueExistingImages.splice(index, 1);
    renderCatalogueExistingImages();
};

// Afficher les images existantes (en édition)
function renderCatalogueExistingImages() {
    const container = document.getElementById('catalogue-existing-images');
    const grid = document.getElementById('catalogue-existing-images-grid');
    if (!container || !grid) return;
    
    if (catalogueExistingImages.length === 0) {
        container.classList.add('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    grid.innerHTML = catalogueExistingImages.map((img, i) => `
        <div class="relative group">
            <img src="${img}" alt="Image ${i+1}" class="w-full h-20 object-cover rounded-lg border-2 border-green-200">
            <button type="button" onclick="removeCatalogueExistingImage(${i})" 
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-lg">
                <span class="material-icons text-sm">close</span>
            </button>
            ${i === 0 ? '<span class="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-1 rounded">Principal</span>' : ''}
        </div>
    `).join('');
}

function renderCatalogue() {
    const container = document.getElementById('catalogue-list');
    const annonces = JSON.parse(localStorage.getItem('annonces') || '[]');
    
    if (annonces.length === 0) {
        container.innerHTML = '<p class="text-gray-400 col-span-2 text-center py-8">Aucune annonce</p>';
        return;
    }
    
    const categoryLabels = {
        'vente': '🏠 Vente',
        'location-courte': '⏱️ Courte durée',
        'location-longue': '📅 Longue durée'
    };
    
    const categoryColors = {
        'vente': 'bg-blue-100 text-blue-700',
        'location-courte': 'bg-orange-100 text-orange-700',
        'location-longue': 'bg-purple-100 text-purple-700'
    };
    
    container.innerHTML = annonces.map((a, i) => {
        // Support multi-images et rétrocompatibilité
        const images = a.images || (a.image ? [a.image] : []);
        const imageCount = images.length;
        const mainImage = images[0] || '';
        
        return `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">
            <div class="relative">
                ${mainImage ? `
                    <img src="${mainImage}" alt="${a.title || 'Annonce'}" class="w-full h-40 object-cover cursor-pointer" onclick="openImageGallery(${i})">
                    ${imageCount > 1 ? `<span class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <span class="material-icons text-sm">photo_library</span>${imageCount}
                    </span>` : ''}
                ` : '<div class="w-full h-40 bg-gray-200 flex items-center justify-center"><span class="material-icons text-gray-400 text-4xl">image</span></div>'}
            </div>
            <div class="p-4">
                <div class="flex flex-wrap gap-1 mb-2">
                    <span class="text-xs px-2 py-1 rounded-full ${categoryColors[a.category] || 'bg-gray-100 text-gray-600'}">${categoryLabels[a.category] || 'Vente'}</span>
                    <span class="text-xs px-2 py-1 rounded-full ${a.status === 'actif' ? 'bg-green-100 text-green-700' : a.status === 'vendu' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}">${a.status || 'actif'}</span>
                </div>
                <h4 class="font-bold text-gray-800 mb-1">${a.title || 'Sans titre'}</h4>
                ${a.location ? `<p class="text-xs text-gray-500 mb-1">📍 ${a.location}</p>` : ''}
                <p class="text-sm text-gray-600 mb-2 line-clamp-2">${a.description || a.desc || ''}</p>
                <p class="font-bold text-blue-600 mb-3">${a.price || 'Prix non défini'}</p>
                <div class="flex space-x-2">
                    <button onclick="editAnnonce(${i})" class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">Modifier</button>
                    <button onclick="deleteAnnonce(${i})" class="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                        <span class="material-icons text-sm">delete</span>
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
}

function editAnnonce(index) {
    openCatalogueModal(index);
}

function deleteAnnonce(index) {
    if (confirm('Supprimer cette annonce ?')) {
        const annonces = JSON.parse(localStorage.getItem('annonces') || '[]');
        annonces.splice(index, 1);
        localStorage.setItem('annonces', JSON.stringify(annonces));
        renderCatalogue();
        updateStats();
        showNotification('Annonce supprimée', '', 'success');
    }
}

// ===================================================
// MODULE: CARROUSEL
// ===================================================
function initCarousel() {
    renderCarousel();
    
    const form = document.getElementById('carousel-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editIndex = document.getElementById('carousel-edit-index').value;
        const imageFile = document.getElementById('carousel-image').files[0];
        const imageUrl = document.getElementById('carousel-image-url').value;
        
        const saveSlide = (imageData) => {
            const slides = JSON.parse(localStorage.getItem('carousel') || '[]');
            const slide = {
                title: document.getElementById('carousel-title').value,
                subtitle: document.getElementById('carousel-subtitle').value,
                image: imageData || imageUrl || (editIndex !== '' ? slides[editIndex]?.image : ''),
                imageUrl: imageUrl,
                link: document.getElementById('carousel-link').value || '#contact'
            };
            
            if (editIndex !== '') {
                slides[parseInt(editIndex)] = slide;
                showNotification('Slide modifié', slide.title, 'success');
            } else {
                slides.push(slide);
                showNotification('Slide ajouté', slide.title, 'success');
            }
            
            localStorage.setItem('carousel', JSON.stringify(slides));
            form.reset();
            closeCarouselModal();
            renderCarousel();
        };
        
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => saveSlide(e.target.result);
            reader.readAsDataURL(imageFile);
        } else {
            saveSlide(null);
        }
    });
}

function renderCarousel() {
    const container = document.getElementById('carousel-list');
    const slides = JSON.parse(localStorage.getItem('carousel') || '[]');
    
    if (slides.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Aucun slide configuré</p>';
        return;
    }
    
    container.innerHTML = slides.map((s, i) => `
        <div class="flex items-center bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition" draggable="true" data-index="${i}">
            <span class="material-icons text-gray-400 mr-4 cursor-move">drag_indicator</span>
            ${s.image ? `<img src="${s.image}" alt="${s.title}" class="w-24 h-16 object-cover rounded-lg mr-4">` : '<div class="w-24 h-16 bg-gray-200 rounded-lg mr-4 flex items-center justify-center"><span class="material-icons text-gray-400">image</span></div>'}
            <div class="flex-1">
                <h4 class="font-bold text-gray-800">${s.title}</h4>
                <p class="text-sm text-gray-500">${s.subtitle || 'Sans sous-titre'}</p>
            </div>
            <div class="flex space-x-2">
                <button onclick="editSlide(${i})" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                    <span class="material-icons">edit</span>
                </button>
                <button onclick="deleteSlide(${i})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        </div>
    `).join('');
}

function editSlide(index) {
    openCarouselModal(index);
}

function deleteSlide(index) {
    if (confirm('Supprimer ce slide ?')) {
        const slides = JSON.parse(localStorage.getItem('carousel') || '[]');
        slides.splice(index, 1);
        localStorage.setItem('carousel', JSON.stringify(slides));
        renderCarousel();
        showNotification('Slide supprimé', '', 'success');
    }
}

// ===================================================
// MODULE: TÉMOIGNAGES
// ===================================================
function initTemoignages() {
    renderTemoignages();
    
    const form = document.getElementById('temoignage-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editIndex = document.getElementById('temoignage-edit-index').value;
        const temoignages = JSON.parse(localStorage.getItem('temoignages') || '[]');
        
        // Get note from radio buttons
        const noteRadio = document.querySelector('input[name="temoignage-note"]:checked');
        const note = noteRadio ? noteRadio.value : '5';
        
        const temoignage = {
            nom: document.getElementById('temoignage-nom').value,
            fonction: document.getElementById('temoignage-fonction')?.value || '',
            texte: document.getElementById('temoignage-texte').value,
            note: note,
            visible: document.getElementById('temoignage-visible').checked,
            date: new Date().toISOString()
        };
        
        if (editIndex !== '') {
            temoignages[parseInt(editIndex)] = temoignage;
            showNotification('Témoignage modifié', temoignage.nom, 'success');
        } else {
            temoignages.push(temoignage);
            showNotification('Témoignage ajouté', temoignage.nom, 'success');
        }
        
        localStorage.setItem('temoignages', JSON.stringify(temoignages));
        form.reset();
        document.getElementById('temoignage-edit-index').value = '';
        closeTemoignageModal();
        renderTemoignages();
        updateStats();
    });
}

function renderTemoignages() {
    const container = document.getElementById('temoignages-list');
    const temoignages = JSON.parse(localStorage.getItem('temoignages') || '[]');
    
    if (temoignages.length === 0) {
        container.innerHTML = '<p class="text-gray-400 col-span-3 text-center py-8">Aucun témoignage</p>';
        return;
    }
    
    container.innerHTML = temoignages.map((t, i) => `
        <div class="bg-white rounded-lg shadow-sm p-2 border border-gray-100 hover:shadow transition text-xs">
            <div class="flex justify-between items-center mb-1">
                <span class="font-semibold text-gray-800 truncate" title="${t.nom || 'Client'}">${t.nom || 'Client'}</span>
                <span class="${t.visible ? 'text-green-500' : 'text-gray-400'}">${t.visible ? '●' : '○'}</span>
            </div>
            <div class="text-yellow-500 mb-1" style="font-size:10px">${'★'.repeat(t.note || 5)}</div>
            <p class="text-gray-500 mb-1 line-clamp-2" style="font-size:11px">"${t.texte || ''}"</p>
            <div class="flex gap-1 pt-1 border-t border-gray-100">
                <button onclick="editTemoignage(${i})" class="flex-1 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Modifier">✎</button>
                <button onclick="toggleTemoignage(${i})" class="flex-1 py-0.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100" title="${t.visible ? 'Masquer' : 'Afficher'}">${t.visible ? '👁' : '○'}</button>
                <button onclick="deleteTemoignage(${i})" class="flex-1 py-0.5 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Supprimer">✕</button>
            </div>
        </div>
    `).join('');
}

function editTemoignage(index) {
    openTemoignageModal(index);
}

function toggleTemoignage(index) {
    const temoignages = JSON.parse(localStorage.getItem('temoignages') || '[]');
    temoignages[index].visible = !temoignages[index].visible;
    localStorage.setItem('temoignages', JSON.stringify(temoignages));
    renderTemoignages();
    showNotification('Visibilité modifiée', '', 'info');
}

function deleteTemoignage(index) {
    if (confirm('Supprimer ce témoignage ?')) {
        const temoignages = JSON.parse(localStorage.getItem('temoignages') || '[]');
        temoignages.splice(index, 1);
        localStorage.setItem('temoignages', JSON.stringify(temoignages));
        renderTemoignages();
        updateStats();
        showNotification('Témoignage supprimé', '', 'success');
    }
}

// ===================================================
// MODULE: FAQ
// ===================================================
function initFaq() {
    renderFaq();
    
    const form = document.getElementById('faq-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editIndex = document.getElementById('faq-edit-index').value;
        const faqs = JSON.parse(localStorage.getItem('faq') || '[]');
        
        const faq = {
            question: document.getElementById('faq-question').value,
            reponse: document.getElementById('faq-reponse').value,
            categorie: document.getElementById('faq-categorie')?.value || 'general',
            visible: document.getElementById('faq-visible').checked,
            date: new Date().toISOString()
        };
        
        if (editIndex !== '') {
            faqs[parseInt(editIndex)] = faq;
            showNotification('Question modifiée', '', 'success');
        } else {
            faqs.push(faq);
            showNotification('Question ajoutée', '', 'success');
        }
        
        localStorage.setItem('faq', JSON.stringify(faqs));
        form.reset();
        document.getElementById('faq-edit-index').value = '';
        closeFaqModal();
        renderFaq();
    });
}

function renderFaq() {
    const container = document.getElementById('faq-list');
    const faqs = JSON.parse(localStorage.getItem('faq') || '[]');
    
    if (faqs.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Aucune FAQ</p>';
        return;
    }
    
    container.innerHTML = faqs.map((f, i) => `
        <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-gray-800 flex-1">${f.question}</h4>
                <span class="text-xs px-2 py-1 rounded-full ml-2 ${f.visible !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">${f.visible !== false ? 'Visible' : 'Masqué'}</span>
            </div>
            <p class="text-gray-600 text-sm mb-4 line-clamp-3">${f.reponse}</p>
            <div class="flex space-x-2">
                <button onclick="editFaq(${i})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">Modifier</button>
                <button onclick="toggleFaq(${i})" class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200">${f.visible !== false ? 'Masquer' : 'Afficher'}</button>
                <button onclick="deleteFaq(${i})" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">Supprimer</button>
            </div>
        </div>
    `).join('');
}

function editFaq(index) {
    openFaqModal(index);
}

function toggleFaq(index) {
    const faqs = JSON.parse(localStorage.getItem('faq') || '[]');
    faqs[index].visible = faqs[index].visible === false ? true : false;
    localStorage.setItem('faq', JSON.stringify(faqs));
    renderFaq();
    showNotification('Visibilité modifiée', '', 'info');
}

function deleteFaq(index) {
    if (confirm('Supprimer cette question ?')) {
        const faqs = JSON.parse(localStorage.getItem('faq') || '[]');
        faqs.splice(index, 1);
        localStorage.setItem('faq', JSON.stringify(faqs));
        renderFaq();
        showNotification('Question supprimée', '', 'success');
    }
}

// ===================================================
// MODULE: MÉDIAS
// ===================================================
function initMedia() {
    renderMedia();
    
    const form = document.getElementById('media-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const file = document.getElementById('media-file').files[0];
        const type = document.getElementById('media-type').value;
        const categorie = document.getElementById('media-categorie')?.value || 'general';
        const titre = document.getElementById('media-titre')?.value || '';
        
        if (!file) {
            showNotification('Erreur', 'Sélectionnez un fichier', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            let media = JSON.parse(localStorage.getItem('media') || '[]');
            
            // Un seul logo possible
            if (type === 'logo') {
                media = media.filter(m => m.type !== 'logo');
            }
            
            media.push({
                data: e.target.result,
                type: type,
                categorie: categorie,
                titre: titre,
                name: file.name,
                date: new Date().toISOString()
            });
            
            localStorage.setItem('media', JSON.stringify(media));
            form.reset();
            closeMediaModal();
            renderMedia();
            updateStats();
            showNotification('Média ajouté', file.name, 'success');
        };
        reader.readAsDataURL(file);
    });
}

function renderMedia() {
    const container = document.getElementById('media-list');
    const media = JSON.parse(localStorage.getItem('media') || '[]');
    
    if (media.length === 0) {
        container.innerHTML = '<p class="text-gray-400 col-span-6 text-center py-8">Aucun média</p>';
        return;
    }
    
    container.innerHTML = media.map((m, i) => `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group relative hover:shadow-md transition">
            ${m.type === 'video' ? 
                `<video src="${m.data}" class="w-full h-32 object-cover" controls></video>` :
                `<img src="${m.data}" alt="${m.name}" class="w-full h-32 object-cover">`
            }
            <div class="p-2">
                <span class="text-xs px-2 py-1 rounded-full ${m.type === 'logo' ? 'bg-yellow-100 text-yellow-700' : m.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${m.type}</span>
                ${m.titre ? `<p class="text-xs text-gray-500 mt-1 truncate">${m.titre}</p>` : ''}
            </div>
            <button onclick="deleteMedia(${i})" class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition">
                <span class="material-icons text-sm">close</span>
            </button>
        </div>
    `).join('');
}

function deleteMedia(index) {
    if (confirm('Supprimer ce média ?')) {
        const media = JSON.parse(localStorage.getItem('media') || '[]');
        media.splice(index, 1);
        localStorage.setItem('media', JSON.stringify(media));
        renderMedia();
        updateStats();
        showNotification('Média supprimé', '', 'success');
    }
}

// ===================================================
// MODULE: PARAMÈTRES
// ===================================================
function initSettings() {
    // Charger les paramètres existants
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    
    if (settings.company) document.getElementById('settings-company').value = settings.company;
    if (settings.slogan) document.getElementById('settings-slogan').value = settings.slogan;
    if (settings.email) document.getElementById('settings-email').value = settings.email;
    if (settings.phone) document.getElementById('settings-phone').value = settings.phone;
    if (settings.whatsapp) document.getElementById('settings-whatsapp').value = settings.whatsapp;
    if (settings.address) document.getElementById('settings-address').value = settings.address;
    if (settings.hours) document.getElementById('settings-hours').value = settings.hours;
    if (settings.facebook) document.getElementById('settings-facebook').value = settings.facebook;
    if (settings.instagram) document.getElementById('settings-instagram').value = settings.instagram;
    if (settings.linkedin) document.getElementById('settings-linkedin').value = settings.linkedin;
    
    document.getElementById('settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = {
            company: document.getElementById('settings-company').value,
            slogan: document.getElementById('settings-slogan').value,
            email: document.getElementById('settings-email').value,
            phone: document.getElementById('settings-phone').value,
            whatsapp: document.getElementById('settings-whatsapp').value,
            address: document.getElementById('settings-address').value,
            hours: document.getElementById('settings-hours').value,
            facebook: document.getElementById('settings-facebook').value,
            instagram: document.getElementById('settings-instagram').value,
            linkedin: document.getElementById('settings-linkedin').value
        };
        
        localStorage.setItem('siteSettings', JSON.stringify(settings));
        alert('Paramètres sauvegardés !');
    });
}

// ===================================================
// MODULE: SEO
// ===================================================
function initSeo() {
    const seo = JSON.parse(localStorage.getItem('seoSettings') || '{}');
    
    if (seo.analytics) document.getElementById('seo-analytics').value = seo.analytics;
    if (seo.searchConsole) document.getElementById('seo-search-console').value = seo.searchConsole;
    if (seo.description) document.getElementById('seo-description').value = seo.description;
    if (seo.keywords) document.getElementById('seo-keywords').value = seo.keywords;
    
    // Mise à jour de l'aperçu en temps réel
    document.getElementById('seo-description').addEventListener('input', function() {
        document.getElementById('seo-preview-desc').textContent = this.value || 'Entreprise de BTP au Sénégal...';
    });
    
    document.getElementById('seo-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const seo = {
            analytics: document.getElementById('seo-analytics').value,
            searchConsole: document.getElementById('seo-search-console').value,
            description: document.getElementById('seo-description').value,
            keywords: document.getElementById('seo-keywords').value
        };
        
        localStorage.setItem('seoSettings', JSON.stringify(seo));
        alert('Paramètres SEO sauvegardés !');
    });
}

// ===================================================
// MODULE: SAUVEGARDE
// ===================================================
function initBackup() {
    document.getElementById('backup-export').addEventListener('click', function() {
        const data = {
            annonces: localStorage.getItem('annonces'),
            temoignages: localStorage.getItem('temoignages'),
            faq: localStorage.getItem('faq'),
            media: localStorage.getItem('media'),
            carousel: localStorage.getItem('carousel'),
            messages: localStorage.getItem('messages'),
            siteSettings: localStorage.getItem('siteSettings'),
            seoSettings: localStorage.getItem('seoSettings'),
            adminPassword: localStorage.getItem('adminPassword'),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-kfsbtp-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        document.getElementById('backup-message').textContent = 'Sauvegarde téléchargée !';
        document.getElementById('backup-message').className = 'text-sm text-green-600';
    });
    
    document.getElementById('backup-import').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const data = JSON.parse(evt.target.result);
                
                if (data.annonces) localStorage.setItem('annonces', data.annonces);
                if (data.temoignages) localStorage.setItem('temoignages', data.temoignages);
                if (data.faq) localStorage.setItem('faq', data.faq);
                if (data.media) localStorage.setItem('media', data.media);
                if (data.carousel) localStorage.setItem('carousel', data.carousel);
                if (data.messages) localStorage.setItem('messages', data.messages);
                if (data.siteSettings) localStorage.setItem('siteSettings', data.siteSettings);
                if (data.seoSettings) localStorage.setItem('seoSettings', data.seoSettings);
                if (data.adminPassword) localStorage.setItem('adminPassword', data.adminPassword);
                
                document.getElementById('backup-message').textContent = 'Importation réussie ! Rechargez la page.';
                document.getElementById('backup-message').className = 'text-sm text-green-600';
                
                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                document.getElementById('backup-message').textContent = 'Erreur lors de l\'importation';
                document.getElementById('backup-message').className = 'text-sm text-red-600';
            }
        };
        reader.readAsText(file);
    });
    
    document.getElementById('backup-reset').addEventListener('click', function() {
        if (confirm('⚠️ ATTENTION : Toutes vos données seront supprimées. Continuer ?')) {
            if (confirm('Êtes-vous vraiment sûr ? Cette action est irréversible.')) {
                localStorage.removeItem('annonces');
                localStorage.removeItem('temoignages');
                localStorage.removeItem('faq');
                localStorage.removeItem('media');
                localStorage.removeItem('carousel');
                localStorage.removeItem('messages');
                localStorage.removeItem('siteSettings');
                localStorage.removeItem('seoSettings');
                
                alert('Toutes les données ont été supprimées.');
                window.location.reload();
            }
        }
    });
}

// ===================================================
// MODULE: SÉCURITÉ
// ===================================================
function initSecurity() {
    document.getElementById('security-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = document.getElementById('security-password').value;
        const confirm = document.getElementById('security-password-confirm').value;
        const message = document.getElementById('security-message');
        
        if (password.length < 6) {
            message.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
            message.className = 'text-sm text-red-600';
            return;
        }
        
        if (password !== confirm) {
            message.textContent = 'Les mots de passe ne correspondent pas';
            message.className = 'text-sm text-red-600';
            return;
        }
        
        localStorage.setItem('adminPassword', btoa(password));
        message.textContent = 'Mot de passe modifié avec succès !';
        message.className = 'text-sm text-green-600';
        this.reset();
    });
    
    document.getElementById('security-reset').addEventListener('click', function() {
        if (confirm('Réinitialiser le mot de passe à "admin123" ?')) {
            localStorage.setItem('adminPassword', btoa('admin123'));
            document.getElementById('security-message').textContent = 'Mot de passe réinitialisé à "admin123"';
            document.getElementById('security-message').className = 'text-sm text-green-600';
        }
    });
}

// ===================================================
// FONCTION GLOBALE: Enregistrer un message depuis le formulaire public
// ===================================================
window.saveContactMessage = function(data) {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.unshift({
        ...data,
        date: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // Notification pour nouveau message
    showNotification('Nouveau message', `Message de ${data.name}`, 'info');
    updateStats();
    renderRecentMessages();
};

// ===================================================
// MODULE: RENDEZ-VOUS
// ===================================================
let currentCalendarDate = new Date();
let selectedDate = null;

function initRdv() {
    renderCalendar();
    renderUpcomingRdv();
    updateRdvBadge();
    
    // Navigation calendrier
    document.getElementById('cal-prev').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('cal-next').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Formulaire RDV
    const form = document.getElementById('rdv-form');
    const cancelBtn = document.getElementById('rdv-cancel');
    
    // Date par défaut = aujourd'hui
    document.getElementById('rdv-date').value = new Date().toISOString().split('T')[0];
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editIndex = document.getElementById('rdv-edit-index').value;
        const rdvs = JSON.parse(localStorage.getItem('rdvs') || '[]');
        
        const rdv = {
            client: document.getElementById('rdv-client').value,
            phone: document.getElementById('rdv-phone').value,
            date: document.getElementById('rdv-date').value,
            time: document.getElementById('rdv-time').value,
            service: document.getElementById('rdv-service').value,
            notes: document.getElementById('rdv-notes').value,
            status: document.getElementById('rdv-status').value,
            createdAt: new Date().toISOString()
        };
        
        if (editIndex !== '') {
            rdvs[parseInt(editIndex)] = rdv;
            showNotification('RDV modifié', `RDV avec ${rdv.client} mis à jour`, 'success');
        } else {
            rdvs.push(rdv);
            showNotification('Nouveau RDV', `RDV créé avec ${rdv.client}`, 'success');
        }
        
        localStorage.setItem('rdvs', JSON.stringify(rdvs));
        form.reset();
        document.getElementById('rdv-edit-index').value = '';
        document.getElementById('rdv-date').value = new Date().toISOString().split('T')[0];
        cancelBtn.classList.add('hidden');
        
        renderCalendar();
        renderUpcomingRdv();
        renderDayRdv(selectedDate || new Date().toISOString().split('T')[0]);
        updateRdvBadge();
    });
    
    cancelBtn.addEventListener('click', function() {
        form.reset();
        document.getElementById('rdv-edit-index').value = '';
        document.getElementById('rdv-date').value = new Date().toISOString().split('T')[0];
        cancelBtn.classList.add('hidden');
    });
    
    // Afficher RDV du jour par défaut
    const today = new Date().toISOString().split('T')[0];
    selectedDate = today;
    renderDayRdv(today);
}

function renderCalendar() {
    const container = document.getElementById('calendar-days');
    const monthYear = document.getElementById('cal-month-year');
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    monthYear.textContent = `${months[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7; // Lundi = 0
    
    const rdvs = JSON.parse(localStorage.getItem('rdvs') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    let html = '';
    
    // Jours vides avant le 1er
    for (let i = 0; i < startDay; i++) {
        html += '<div class="calendar-day text-gray-300"></div>';
    }
    
    // Jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasEvent = rdvs.some(r => r.date === dateStr && r.status !== 'annule');
        const isToday = dateStr === today;
        const isSelected = dateStr === selectedDate;
        
        let classes = 'calendar-day text-gray-700';
        if (isToday) classes += ' today';
        if (hasEvent) classes += ' has-event';
        if (isSelected) classes += ' selected';
        
        html += `<div class="${classes}" data-date="${dateStr}" onclick="selectCalendarDay('${dateStr}')">${day}</div>`;
    }
    
    container.innerHTML = html;
}

window.selectCalendarDay = function(dateStr) {
    selectedDate = dateStr;
    renderCalendar();
    renderDayRdv(dateStr);
    document.getElementById('rdv-date').value = dateStr;
};

function renderDayRdv(dateStr) {
    const container = document.getElementById('rdv-day-list');
    const dateTitle = document.getElementById('rdv-selected-date');
    
    const date = new Date(dateStr);
    dateTitle.textContent = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    
    const rdvs = JSON.parse(localStorage.getItem('rdvs') || '[]');
    const dayRdvs = rdvs.filter(r => r.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
    
    if (dayRdvs.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-4">Aucun RDV ce jour</p>';
        return;
    }
    
    const statusColors = {
        'confirme': 'bg-green-100 text-green-700 border-green-300',
        'attente': 'bg-yellow-100 text-yellow-700 border-yellow-300',
        'annule': 'bg-red-100 text-red-700 border-red-300'
    };
    
    const serviceLabels = {
        'visite': 'Visite de bien',
        'estimation': 'Estimation',
        'signature': 'Signature',
        'travaux': 'Devis travaux',
        'autre': 'Autre'
    };
    
    container.innerHTML = dayRdvs.map((rdv, i) => {
        const globalIndex = rdvs.findIndex(r => r === rdv);
        return `
            <div class="p-4 rounded-xl border ${statusColors[rdv.status] || 'bg-gray-50 border-gray-200'}">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="font-bold text-lg">${rdv.time}</span>
                        <span class="ml-2 text-sm px-2 py-1 bg-white/50 rounded-full">${serviceLabels[rdv.service] || rdv.service}</span>
                    </div>
                    <div class="flex space-x-1">
                        <button onclick="editRdv(${globalIndex})" class="p-1 hover:bg-white/50 rounded">
                            <span class="material-icons text-sm">edit</span>
                        </button>
                        <button onclick="deleteRdv(${globalIndex})" class="p-1 hover:bg-white/50 rounded text-red-600">
                            <span class="material-icons text-sm">delete</span>
                        </button>
                    </div>
                </div>
                <p class="font-semibold">${rdv.client}</p>
                ${rdv.phone ? `<p class="text-sm"><span class="material-icons text-xs align-middle">phone</span> ${rdv.phone}</p>` : ''}
                ${rdv.notes ? `<p class="text-sm mt-1 opacity-75">${rdv.notes}</p>` : ''}
            </div>
        `;
    }).join('');
}

function renderUpcomingRdv() {
    const container = document.getElementById('rdv-upcoming');
    const rdvs = JSON.parse(localStorage.getItem('rdvs') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    const upcoming = rdvs
        .filter(r => r.date >= today && r.status !== 'annule')
        .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        })
        .slice(0, 5);
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-4">Aucun RDV à venir</p>';
        return;
    }
    
    container.innerHTML = upcoming.map(rdv => {
        const date = new Date(rdv.date);
        const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
        return `
            <div class="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" onclick="selectCalendarDay('${rdv.date}')">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span class="material-icons text-blue-600">event</span>
                </div>
                <div class="flex-1">
                    <p class="font-medium text-gray-800">${rdv.client}</p>
                    <p class="text-sm text-gray-500">${dateStr} à ${rdv.time}</p>
                </div>
            </div>
        `;
    }).join('');
}

window.editRdv = function(index) {
    openRdvModal(index);
};

window.deleteRdv = function(index) {
    if (confirm('Supprimer ce rendez-vous ?')) {
        const rdvs = JSON.parse(localStorage.getItem('rdvs') || '[]');
        const rdv = rdvs[index];
        rdvs.splice(index, 1);
        localStorage.setItem('rdvs', JSON.stringify(rdvs));
        
        showNotification('RDV supprimé', `RDV avec ${rdv.client} supprimé`, 'warning');
        
        renderCalendar();
        renderUpcomingRdv();
        renderDayRdv(selectedDate || new Date().toISOString().split('T')[0]);
        updateRdvBadge();
    }
};

function updateRdvBadge() {
    const rdvs = JSON.parse(localStorage.getItem('rdvs') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayRdvs = rdvs.filter(r => r.date === today && r.status !== 'annule').length;
    
    const badge = document.getElementById('rdv-badge');
    if (todayRdvs > 0) {
        badge.textContent = todayRdvs;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ===================================================
// MODULE: ANALYTICS
// ===================================================
let messagesChart = null;
let servicesChart = null;

function initAnalytics() {
    renderAnalyticsCharts();
    updateAnalyticsStats();
    initExportButtons();
}

function renderAnalyticsCharts() {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    // Graphique des messages par semaine
    const messagesCtx = document.getElementById('chart-messages');
    if (messagesCtx) {
        const last7Days = [];
        const messageCounts = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push(date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }));
            
            const count = messages.filter(m => m.date && m.date.startsWith(dateStr)).length;
            messageCounts.push(count);
        }
        
        if (messagesChart) messagesChart.destroy();
        
        messagesChart = new Chart(messagesCtx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Messages',
                    data: messageCounts,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
    
    // Graphique des services demandés
    const servicesCtx = document.getElementById('chart-services');
    if (servicesCtx) {
        const serviceCount = {};
        messages.forEach(m => {
            const service = m.service || 'Non spécifié';
            serviceCount[service] = (serviceCount[service] || 0) + 1;
        });
        
        if (servicesChart) servicesChart.destroy();
        
        servicesChart = new Chart(servicesCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(serviceCount),
                datasets: [{
                    data: Object.values(serviceCount),
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20 }
                    }
                }
            }
        });
    }
}

function updateAnalyticsStats() {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const rdvs = JSON.parse(localStorage.getItem('rdvs') || '[]');
    
    document.getElementById('analytics-total-messages').textContent = messages.length;
    document.getElementById('analytics-total-rdv').textContent = rdvs.length;
    
    // Taux de conversion = RDV / Messages * 100
    const conversion = messages.length > 0 ? Math.round((rdvs.length / messages.length) * 100) : 0;
    document.getElementById('analytics-conversion').textContent = conversion + '%';
}

function initExportButtons() {
    // Export Messages CSV
    document.getElementById('export-messages-csv')?.addEventListener('click', () => {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        exportToCSV(messages, 'messages', ['name', 'email', 'phone', 'service', 'message', 'date', 'read']);
    });
    
    // Export RDV CSV
    document.getElementById('export-rdv-csv')?.addEventListener('click', () => {
        const rdvs = JSON.parse(localStorage.getItem('rdvs') || '[]');
        exportToCSV(rdvs, 'rendez-vous', ['client', 'phone', 'date', 'time', 'service', 'notes', 'status']);
    });
    
    // Export Annonces CSV
    document.getElementById('export-annonces-csv')?.addEventListener('click', () => {
        const annonces = JSON.parse(localStorage.getItem('annonces') || '[]');
        exportToCSV(annonces, 'annonces', ['title', 'desc', 'price', 'status', 'date']);
    });
    
    // Export All Excel (CSV multi-feuilles simulé)
    document.getElementById('export-all-excel')?.addEventListener('click', () => {
        const data = {
            messages: JSON.parse(localStorage.getItem('messages') || '[]'),
            rdvs: JSON.parse(localStorage.getItem('rdvs') || '[]'),
            annonces: JSON.parse(localStorage.getItem('annonces') || '[]'),
            temoignages: JSON.parse(localStorage.getItem('temoignages') || '[]')
        };
        
        let content = '';
        
        // Messages
        content += '=== MESSAGES ===\n';
        content += 'Nom;Email;Téléphone;Service;Message;Date;Lu\n';
        data.messages.forEach(m => {
            content += `${m.name || ''};${m.email || ''};${m.phone || ''};${m.service || ''};${(m.message || '').replace(/;/g, ',')};${m.date || ''};${m.read ? 'Oui' : 'Non'}\n`;
        });
        
        content += '\n=== RENDEZ-VOUS ===\n';
        content += 'Client;Téléphone;Date;Heure;Service;Notes;Statut\n';
        data.rdvs.forEach(r => {
            content += `${r.client || ''};${r.phone || ''};${r.date || ''};${r.time || ''};${r.service || ''};${(r.notes || '').replace(/;/g, ',')};${r.status || ''}\n`;
        });
        
        content += '\n=== ANNONCES ===\n';
        content += 'Titre;Description;Prix;Statut;Date\n';
        data.annonces.forEach(a => {
            content += `${a.title || ''};${(a.desc || '').replace(/;/g, ',')};${a.price || ''};${a.status || ''};${a.date || ''}\n`;
        });
        
        content += '\n=== TÉMOIGNAGES ===\n';
        content += 'Nom;Texte;Note;Visible;Date\n';
        data.temoignages.forEach(t => {
            content += `${t.nom || ''};${(t.texte || '').replace(/;/g, ',')};${t.note || ''};${t.visible ? 'Oui' : 'Non'};${t.date || ''}\n`;
        });
        
        downloadFile(content, `export-complet-kfsbtp-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8');
        showNotification('Export réussi', 'Toutes les données ont été exportées', 'success');
    });
}

function exportToCSV(data, filename, columns) {
    if (data.length === 0) {
        showNotification('Export vide', 'Aucune donnée à exporter', 'warning');
        return;
    }
    
    let csv = columns.join(';') + '\n';
    
    data.forEach(item => {
        const row = columns.map(col => {
            let val = item[col] || '';
            if (typeof val === 'string') val = val.replace(/;/g, ',').replace(/\n/g, ' ');
            return val;
        });
        csv += row.join(';') + '\n';
    });
    
    downloadFile(csv, `${filename}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8');
    showNotification('Export réussi', `${data.length} ${filename} exportés`, 'success');
}

function downloadFile(content, filename, mimeType) {
    const BOM = '\uFEFF'; // Pour supporter les accents dans Excel
    const blob = new Blob([BOM + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ===================================================
// MODULE: NOTIFICATIONS
// ===================================================
let notificationSound = null;
let notificationEnabled = true;

function initNotifications() {
    // Demander la permission pour les notifications navigateur
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Créer un son de notification
    notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQwAVL3ioH9PCwBew+S+kl8PBVXB5bF+UwIBWsHopnVGAARdxOzDiloABFvB6rZ8SgACW8TwwYZQAANdxvHCh1EAAV3H8r6CSgACXcjzvH5DAAFfyvS5ej4AAF7K9LZ3OQABXsz1s3QzAABez/axcC8AAF3Q9q5uLAABXdP2q2ooAAFc1fepZyQAAVzY+KZjHwAAXNr5o2AcAABc3PqgXRgAAFzf+51aFQAAW+L8mlYSAABb5P2XUw8AAFrn/pRQDAAAWur/kU0JAABa7ACOSgYAAFnuAYtHAwAAWPECiEQAAABY8wOFQf0AF/UFgj35ABf3Bn879gAY+Qd6OPMAGfsIdzXwABr9CnQy7QAb/wtxL+oAHP8Mbizn');
}

function showNotification(title, message, type = 'info') {
    // Toast notification dans l'interface
    const container = document.getElementById('notifications-container');
    if (!container) return;
    
    const colors = {
        'info': 'bg-blue-500',
        'success': 'bg-green-500',
        'warning': 'bg-yellow-500',
        'error': 'bg-red-500'
    };
    
    const icons = {
        'info': 'info',
        'success': 'check_circle',
        'warning': 'warning',
        'error': 'error'
    };
    
    const toast = document.createElement('div');
    toast.className = `notification-toast flex items-center p-4 mb-3 rounded-xl shadow-2xl ${colors[type]} text-white max-w-sm`;
    toast.innerHTML = `
        <span class="material-icons mr-3">${icons[type]}</span>
        <div class="flex-1">
            <p class="font-bold">${title}</p>
            <p class="text-sm opacity-90">${message}</p>
        </div>
        <button class="ml-3 hover:bg-white/20 rounded-full p-1" onclick="this.parentElement.remove()">
            <span class="material-icons text-sm">close</span>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Jouer le son
    if (notificationSound && notificationEnabled) {
        notificationSound.play().catch(() => {});
    }
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
    
    // Notification navigateur (si autorisé)
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { 
            body: message,
            icon: 'assets/logo-kfs-btp.jpeg'
        });
    }
    
    // Mettre à jour le titre de l'onglet
    updateTabTitle();
}

function updateTabTitle() {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const unread = messages.filter(m => !m.read).length;
    
    if (unread > 0) {
        document.title = `(${unread}) Administration - KFS BTP`;
    } else {
        document.title = 'Administration - KFS BTP';
    }
}

// ===================================================
// MODULE: COMPTABILITÉ
// ===================================================
function initComptabilite() {
    renderComptabilite();
    updateComptaDashboard();
    
    const form = document.getElementById('compta-form');
    const cancelBtn = document.getElementById('compta-cancel');
    
    if (!form) return;
    
    // Date par défaut = aujourd'hui
    const dateInput = document.getElementById('compta-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editIndex = document.getElementById('compta-edit-index').value;
        const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
        
        const transaction = {
            type: document.getElementById('compta-type').value,
            categorie: document.getElementById('compta-categorie').value,
            montant: parseFloat(document.getElementById('compta-montant').value),
            description: document.getElementById('compta-description').value,
            date: document.getElementById('compta-date').value,
            createdAt: new Date().toISOString()
        };
        
        if (editIndex !== '') {
            transactions[parseInt(editIndex)] = transaction;
            showNotification('Transaction modifiée', 'La transaction a été mise à jour', 'success');
        } else {
            transactions.push(transaction);
            showNotification('Transaction ajoutée', `${transaction.type === 'recette' ? 'Recette' : 'Dépense'} de ${transaction.montant.toLocaleString('fr-FR')} FCFA`, 'success');
        }
        
        localStorage.setItem('comptabilite', JSON.stringify(transactions));
        form.reset();
        document.getElementById('compta-edit-index').value = '';
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        if (cancelBtn) cancelBtn.classList.add('hidden');
        
        renderComptabilite();
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            form.reset();
            document.getElementById('compta-edit-index').value = '';
            if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
            cancelBtn.classList.add('hidden');
        });
    }
    
    // Filtres
    document.getElementById('compta-filter-type')?.addEventListener('change', renderComptabilite);
    document.getElementById('compta-filter-mois')?.addEventListener('change', renderComptabilite);
}

function renderComptabilite() {
    const container = document.getElementById('compta-list');
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    
    // Filtres
    const filterType = document.getElementById('compta-filter-type')?.value || 'all';
    const filterMois = document.getElementById('compta-filter-mois')?.value || 'all';
    
    let filtered = transactions;
    
    if (filterType !== 'all') {
        filtered = filtered.filter(t => t.type === filterType);
    }
    
    if (filterMois !== 'all') {
        const [year, month] = filterMois.split('-');
        filtered = filtered.filter(t => t.date && t.date.startsWith(`${year}-${month}`));
    }
    
    // Trier par date décroissante
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calcul des totaux
    const totalRecettes = transactions.filter(t => t.type === 'recette').reduce((sum, t) => sum + t.montant, 0);
    const totalDepenses = transactions.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.montant, 0);
    const solde = totalRecettes - totalDepenses;
    
    // Afficher les totaux
    const recettesEl = document.getElementById('compta-total-recettes');
    const depensesEl = document.getElementById('compta-total-depenses');
    const soldeEl = document.getElementById('compta-solde');
    
    if (recettesEl) recettesEl.textContent = totalRecettes.toLocaleString('fr-FR') + ' FCFA';
    if (depensesEl) depensesEl.textContent = totalDepenses.toLocaleString('fr-FR') + ' FCFA';
    if (soldeEl) {
        soldeEl.textContent = solde.toLocaleString('fr-FR') + ' FCFA';
        soldeEl.className = solde >= 0 ? 'text-2xl font-bold text-green-600' : 'text-2xl font-bold text-red-600';
    }
    
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Aucune transaction</p>';
        return;
    }
    
    container.innerHTML = filtered.map((t, i) => {
        const globalIndex = transactions.indexOf(t);
        const isRecette = t.type === 'recette';
        return `
            <div class="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border-l-4 ${isRecette ? 'border-green-500' : 'border-red-500'}">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isRecette ? 'bg-green-100' : 'bg-red-100'}">
                        <span class="material-icons ${isRecette ? 'text-green-600' : 'text-red-600'}">${isRecette ? 'arrow_downward' : 'arrow_upward'}</span>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${t.description || t.categorie}</p>
                        <p class="text-sm text-gray-500">${t.categorie} • ${new Date(t.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                <div class="flex items-center">
                    <span class="font-bold text-lg mr-4 ${isRecette ? 'text-green-600' : 'text-red-600'}">
                        ${isRecette ? '+' : '-'}${t.montant.toLocaleString('fr-FR')} FCFA
                    </span>
                    <button onclick="editCompta(${globalIndex})" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                        <span class="material-icons text-sm">edit</span>
                    </button>
                    <button onclick="deleteCompta(${globalIndex})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <span class="material-icons text-sm">delete</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.editCompta = function(index) {
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    const t = transactions[index];
    
    document.getElementById('compta-edit-index').value = index;
    document.getElementById('compta-type').value = t.type;
    document.getElementById('compta-categorie').value = t.categorie;
    document.getElementById('compta-montant').value = t.montant;
    document.getElementById('compta-description').value = t.description || '';
    document.getElementById('compta-date').value = t.date;
    document.getElementById('compta-cancel')?.classList.remove('hidden');
    
    document.getElementById('compta-form')?.scrollIntoView({ behavior: 'smooth' });
};

window.deleteCompta = function(index) {
    if (confirm('Supprimer cette transaction ?')) {
        const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
        transactions.splice(index, 1);
        localStorage.setItem('comptabilite', JSON.stringify(transactions));
        renderComptabilite();
        showNotification('Transaction supprimée', 'La transaction a été supprimée', 'warning');
    }
};

// ===================================================
// MODULE: FACTURES & DEVIS
// ===================================================
let factureLines = [];

function initFactures() {
    renderFactures();
    
    const form = document.getElementById('facture-form');
    if (!form) return;
    
    // Initialiser les lignes
    factureLines = [];
    renderFactureLines();
    
    // Charger les clients avec le sélecteur amélioré pour auto-remplissage
    populateClientSelector('facture-client');
    
    // Date par défaut
    const dateInput = document.getElementById('facture-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    
    // Ajouter une ligne
    document.getElementById('facture-add-line')?.addEventListener('click', () => {
        factureLines.push({ description: '', quantite: 1, prixUnit: 0 });
        renderFactureLines();
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (factureLines.length === 0) {
            showNotification('Erreur', 'Ajoutez au moins une ligne', 'error');
            return;
        }
        
        const factures = JSON.parse(localStorage.getItem('factures') || '[]');
        const type = document.getElementById('facture-type').value;
        
        // Générer numéro
        const year = new Date().getFullYear();
        const count = factures.filter(f => f.type === type && f.numero?.includes(year)).length + 1;
        const prefix = type === 'facture' ? 'FAC' : 'DEV';
        const numero = `${prefix}-${year}-${String(count).padStart(4, '0')}`;
        
        // Calculer totaux
        const totalHT = factureLines.reduce((sum, l) => sum + (l.quantite * l.prixUnit), 0);
        const tva = document.getElementById('facture-tva').value === 'oui' ? totalHT * 0.18 : 0;
        const totalTTC = totalHT + tva;
        
        const facture = {
            numero: numero,
            type: type,
            clientIndex: document.getElementById('facture-client').value,
            clientNom: document.getElementById('facture-client-nom')?.value || '',
            clientEmail: document.getElementById('facture-client-email')?.value || '',
            clientTel: document.getElementById('facture-client-tel')?.value || '',
            clientAdresse: document.getElementById('facture-client-adresse')?.value || '',
            date: document.getElementById('facture-date').value,
            echeance: document.getElementById('facture-echeance')?.value || '',
            lignes: [...factureLines],
            totalHT: totalHT,
            tva: tva,
            totalTTC: totalTTC,
            status: 'en_attente',
            notes: document.getElementById('facture-notes')?.value || '',
            createdAt: new Date().toISOString()
        };
        
        factures.push(facture);
        localStorage.setItem('factures', JSON.stringify(factures));
        
        showNotification(`${type === 'facture' ? 'Facture' : 'Devis'} créé`, `N° ${numero}`, 'success');
        
        form.reset();
        factureLines = [];
        renderFactureLines();
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        closeFactureModal();
        renderFactures();
    });
}

function renderFactureLines() {
    const container = document.getElementById('facture-lines');
    if (!container) return;
    
    if (factureLines.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-4">Cliquez sur "Ajouter une ligne" pour commencer</p>';
        updateFactureTotal();
        return;
    }
    
    container.innerHTML = factureLines.map((line, i) => `
        <div class="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-lg">
            <div class="col-span-6">
                <input type="text" placeholder="Description" value="${line.description}" 
                    onchange="updateFactureLine(${i}, 'description', this.value)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            </div>
            <div class="col-span-2">
                <input type="number" placeholder="Qté" value="${line.quantite}" min="1"
                    onchange="updateFactureLine(${i}, 'quantite', this.value)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center">
            </div>
            <div class="col-span-3">
                <input type="number" placeholder="Prix unit." value="${line.prixUnit}" min="0"
                    onchange="updateFactureLine(${i}, 'prixUnit', this.value)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right">
            </div>
            <div class="col-span-1">
                <button type="button" onclick="removeFactureLine(${i})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <span class="material-icons text-sm">close</span>
                </button>
            </div>
        </div>
    `).join('');
    
    updateFactureTotal();
}

window.updateFactureLine = function(index, field, value) {
    if (field === 'quantite' || field === 'prixUnit') {
        factureLines[index][field] = parseFloat(value) || 0;
    } else {
        factureLines[index][field] = value;
    }
    updateFactureTotal();
};

window.removeFactureLine = function(index) {
    factureLines.splice(index, 1);
    renderFactureLines();
};

function updateFactureTotal() {
    const totalHT = factureLines.reduce((sum, l) => sum + (l.quantite * l.prixUnit), 0);
    const hasTva = document.getElementById('facture-tva')?.value === 'oui';
    const tva = hasTva ? totalHT * 0.18 : 0;
    const totalTTC = totalHT + tva;
    
    const htEl = document.getElementById('facture-total-ht');
    const tvaEl = document.getElementById('facture-total-tva');
    const ttcEl = document.getElementById('facture-total-ttc');
    
    if (htEl) htEl.textContent = totalHT.toLocaleString('fr-FR') + ' FCFA';
    if (tvaEl) tvaEl.textContent = tva.toLocaleString('fr-FR') + ' FCFA';
    if (ttcEl) ttcEl.textContent = totalTTC.toLocaleString('fr-FR') + ' FCFA';
}

function renderFactures() {
    const container = document.getElementById('factures-list');
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    
    // Filtres
    const filterType = document.getElementById('facture-filter-type')?.value || 'all';
    const filterStatus = document.getElementById('facture-filter-status')?.value || 'all';
    
    let filtered = factures;
    
    if (filterType !== 'all') {
        filtered = filtered.filter(f => f.type === filterType);
    }
    if (filterStatus !== 'all') {
        filtered = filtered.filter(f => f.status === filterStatus);
    }
    
    // Trier par date décroissante
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Aucune facture ou devis</p>';
        return;
    }
    
    const statusColors = {
        'en_attente': 'bg-yellow-100 text-yellow-700',
        'payee': 'bg-green-100 text-green-700',
        'annulee': 'bg-red-100 text-red-700',
        'accepte': 'bg-green-100 text-green-700',
        'refuse': 'bg-red-100 text-red-700'
    };
    
    const statusLabels = {
        'en_attente': 'En attente',
        'payee': 'Payée',
        'annulee': 'Annulée',
        'accepte': 'Accepté',
        'refuse': 'Refusé'
    };
    
    container.innerHTML = filtered.map((f, i) => {
        const globalIndex = factures.indexOf(f);
        const clientName = f.clientNom || f.client || 'Non spécifié';
        return `
            <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <span class="text-xs px-2 py-1 rounded-full ${f.type === 'facture' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">
                            ${f.type === 'facture' ? 'Facture' : 'Devis'}
                        </span>
                        <h4 class="font-bold text-gray-800 mt-1">${f.numero}</h4>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full ${statusColors[f.status] || 'bg-gray-100 text-gray-600'}">
                        ${statusLabels[f.status] || f.status}
                    </span>
                </div>
                <p class="text-gray-600 mb-1"><strong>Client:</strong> ${clientName}</p>
                <p class="text-sm text-gray-500 mb-3">Date: ${new Date(f.date).toLocaleDateString('fr-FR')}</p>
                <p class="text-xl font-bold text-blue-600 mb-4">${f.totalTTC.toLocaleString('fr-FR')} FCFA</p>
                <div class="flex flex-wrap gap-2">
                    <button onclick="viewFacture(${globalIndex})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        <span class="material-icons text-sm align-middle">visibility</span> Voir
                    </button>
                    <button onclick="printFacture(${globalIndex})" class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                        <span class="material-icons text-sm align-middle">print</span> Imprimer
                    </button>
                    <button onclick="changeFactureStatus(${globalIndex})" class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200">
                        <span class="material-icons text-sm align-middle">edit</span> Statut
                    </button>
                    <button onclick="deleteFacture(${globalIndex})" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                        <span class="material-icons text-sm align-middle">delete</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.viewFacture = function(index) {
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    const f = factures[index];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">${f.type === 'facture' ? 'Facture' : 'Devis'} ${f.numero}</h2>
                    <p class="text-gray-500">Date: ${new Date(f.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="p-2 hover:bg-gray-100 rounded-full">
                    <span class="material-icons">close</span>
                </button>
            </div>
            
            <div class="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 class="font-semibold text-gray-700 mb-2">Client</h3>
                <p class="font-bold">${f.client}</p>
                ${f.clientEmail ? `<p class="text-sm text-gray-600">${f.clientEmail}</p>` : ''}
                ${f.clientTel ? `<p class="text-sm text-gray-600">${f.clientTel}</p>` : ''}
                ${f.clientAdresse ? `<p class="text-sm text-gray-600">${f.clientAdresse}</p>` : ''}
            </div>
            
            <table class="w-full mb-6">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="text-left p-3 rounded-tl-lg">Description</th>
                        <th class="text-center p-3">Qté</th>
                        <th class="text-right p-3">P.U.</th>
                        <th class="text-right p-3 rounded-tr-lg">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${f.lignes.map(l => `
                        <tr class="border-b">
                            <td class="p-3">${l.description}</td>
                            <td class="text-center p-3">${l.quantite}</td>
                            <td class="text-right p-3">${l.prixUnit.toLocaleString('fr-FR')}</td>
                            <td class="text-right p-3 font-semibold">${(l.quantite * l.prixUnit).toLocaleString('fr-FR')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="text-right space-y-2 mb-6">
                <p class="text-gray-600">Total HT: <strong>${f.totalHT.toLocaleString('fr-FR')} FCFA</strong></p>
                <p class="text-gray-600">TVA (18%): <strong>${f.tva.toLocaleString('fr-FR')} FCFA</strong></p>
                <p class="text-xl font-bold text-blue-600">Total TTC: ${f.totalTTC.toLocaleString('fr-FR')} FCFA</p>
            </div>
            
            ${f.notes ? `<div class="p-4 bg-yellow-50 rounded-xl"><p class="text-sm text-gray-600"><strong>Notes:</strong> ${f.notes}</p></div>` : ''}
        </div>
    `;
    document.body.appendChild(modal);
};

window.printFacture = function(index) {
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    const f = factures[index];
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${f.type === 'facture' ? 'Facture' : 'Devis'} ${f.numero}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                .company { font-size: 24px; font-weight: bold; color: #1e3a8a; }
                .doc-info { text-align: right; }
                .doc-type { font-size: 28px; font-weight: bold; color: #1e3a8a; }
                .client { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { background: #1e3a8a; color: white; padding: 12px; text-align: left; }
                td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
                .totals { text-align: right; }
                .total-ttc { font-size: 24px; font-weight: bold; color: #1e3a8a; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="company">${settings.company || 'KFS BTP'}</div>
                    <p>${settings.address || 'Dakar, Sénégal'}</p>
                    <p>${settings.phone || ''}</p>
                    <p>${settings.email || ''}</p>
                </div>
                <div class="doc-info">
                    <div class="doc-type">${f.type === 'facture' ? 'FACTURE' : 'DEVIS'}</div>
                    <p><strong>N°:</strong> ${f.numero}</p>
                    <p><strong>Date:</strong> ${new Date(f.date).toLocaleDateString('fr-FR')}</p>
                    ${f.echeance ? `<p><strong>Échéance:</strong> ${new Date(f.echeance).toLocaleDateString('fr-FR')}</p>` : ''}
                </div>
            </div>
            
            <div class="client">
                <strong>Client:</strong><br>
                ${f.client}<br>
                ${f.clientAdresse || ''}<br>
                ${f.clientTel || ''} ${f.clientEmail || ''}
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align:center">Qté</th>
                        <th style="text-align:right">Prix Unit.</th>
                        <th style="text-align:right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${f.lignes.map(l => `
                        <tr>
                            <td>${l.description}</td>
                            <td style="text-align:center">${l.quantite}</td>
                            <td style="text-align:right">${l.prixUnit.toLocaleString('fr-FR')} FCFA</td>
                            <td style="text-align:right">${(l.quantite * l.prixUnit).toLocaleString('fr-FR')} FCFA</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <p>Total HT: <strong>${f.totalHT.toLocaleString('fr-FR')} FCFA</strong></p>
                <p>TVA (18%): <strong>${f.tva.toLocaleString('fr-FR')} FCFA</strong></p>
                <p class="total-ttc">Total TTC: ${f.totalTTC.toLocaleString('fr-FR')} FCFA</p>
            </div>
            
            ${f.notes ? `<p style="margin-top:30px;padding:15px;background:#fef3c7;border-radius:8px"><strong>Notes:</strong> ${f.notes}</p>` : ''}
            
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

window.changeFactureStatus = function(index) {
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    const f = factures[index];
    
    const statusOptions = f.type === 'facture' 
        ? ['en_attente', 'payee', 'annulee']
        : ['en_attente', 'accepte', 'refuse'];
    
    const statusLabels = {
        'en_attente': 'En attente',
        'payee': 'Payée',
        'annulee': 'Annulée',
        'accepte': 'Accepté',
        'refuse': 'Refusé'
    };
    
    const newStatus = prompt(`Nouveau statut pour ${f.numero}:\n${statusOptions.map(s => `- ${s} (${statusLabels[s]})`).join('\n')}\n\nEntrez le statut:`, f.status);
    
    if (newStatus && statusOptions.includes(newStatus)) {
        factures[index].status = newStatus;
        localStorage.setItem('factures', JSON.stringify(factures));
        renderFactures();
        showNotification('Statut modifié', `${f.numero} → ${statusLabels[newStatus]}`, 'success');
    }
};

window.deleteFacture = function(index) {
    if (confirm('Supprimer cette facture/devis ?')) {
        const factures = JSON.parse(localStorage.getItem('factures') || '[]');
        const f = factures[index];
        factures.splice(index, 1);
        localStorage.setItem('factures', JSON.stringify(factures));
        renderFactures();
        showNotification('Supprimé', `${f.numero} a été supprimé`, 'warning');
    }
};

// ===================================================
// MODULE: BILANS FINANCIERS
// ===================================================
let bilanChart = null;
let bilanCategoriesChart = null;

function initBilans() {
    renderBilans();
    
    // Filtres
    document.getElementById('bilan-annee')?.addEventListener('change', renderBilans);
    document.getElementById('bilan-periode')?.addEventListener('change', renderBilans);
}

function renderBilans() {
    const anneeSelect = document.getElementById('bilan-annee');
    const periodeSelect = document.getElementById('bilan-periode');
    
    // Remplir les années disponibles
    if (anneeSelect && anneeSelect.options.length <= 1) {
        const currentYear = new Date().getFullYear();
        for (let y = currentYear; y >= currentYear - 5; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            anneeSelect.appendChild(opt);
        }
    }
    
    const annee = anneeSelect?.value || new Date().getFullYear();
    const periode = periodeSelect?.value || 'annuel';
    
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    
    // Filtrer par année
    const transAnnee = transactions.filter(t => t.date && t.date.startsWith(annee));
    const facturesAnnee = factures.filter(f => f.date && f.date.startsWith(annee));
    
    // Calculs globaux
    const totalRecettes = transAnnee.filter(t => t.type === 'recette').reduce((sum, t) => sum + t.montant, 0);
    const totalDepenses = transAnnee.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.montant, 0);
    const benefice = totalRecettes - totalDepenses;
    const facturesPayees = facturesAnnee.filter(f => f.status === 'payee').reduce((sum, f) => sum + f.totalTTC, 0);
    const facturesEnAttente = facturesAnnee.filter(f => f.status === 'en_attente').reduce((sum, f) => sum + f.totalTTC, 0);
    
    // Afficher les KPIs
    document.getElementById('bilan-recettes')?.setAttribute('data-value', totalRecettes);
    document.getElementById('bilan-depenses')?.setAttribute('data-value', totalDepenses);
    document.getElementById('bilan-benefice')?.setAttribute('data-value', benefice);
    document.getElementById('bilan-factures-payees')?.setAttribute('data-value', facturesPayees);
    
    const recettesEl = document.getElementById('bilan-recettes');
    const depensesEl = document.getElementById('bilan-depenses');
    const beneficeEl = document.getElementById('bilan-benefice');
    const facturesEl = document.getElementById('bilan-factures-payees');
    const attenteEl = document.getElementById('bilan-factures-attente');
    
    if (recettesEl) recettesEl.textContent = totalRecettes.toLocaleString('fr-FR') + ' FCFA';
    if (depensesEl) depensesEl.textContent = totalDepenses.toLocaleString('fr-FR') + ' FCFA';
    if (beneficeEl) {
        beneficeEl.textContent = benefice.toLocaleString('fr-FR') + ' FCFA';
        beneficeEl.className = benefice >= 0 ? 'text-3xl font-bold text-green-600' : 'text-3xl font-bold text-red-600';
    }
    if (facturesEl) facturesEl.textContent = facturesPayees.toLocaleString('fr-FR') + ' FCFA';
    if (attenteEl) attenteEl.textContent = facturesEnAttente.toLocaleString('fr-FR') + ' FCFA';
    
    // Graphique évolution mensuelle
    renderBilanChart(transAnnee, annee, periode);
    
    // Graphique catégories
    renderBilanCategoriesChart(transAnnee);
    
    // Tableau récapitulatif mensuel
    renderBilanTable(transAnnee, annee);
}

function renderBilanChart(transactions, annee, periode) {
    const ctx = document.getElementById('bilan-chart');
    if (!ctx) return;
    
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const recettesParMois = Array(12).fill(0);
    const depensesParMois = Array(12).fill(0);
    
    transactions.forEach(t => {
        if (t.date) {
            const month = parseInt(t.date.split('-')[1]) - 1;
            if (t.type === 'recette') {
                recettesParMois[month] += t.montant;
            } else {
                depensesParMois[month] += t.montant;
            }
        }
    });
    
    if (bilanChart) bilanChart.destroy();
    
    bilanChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: mois,
            datasets: [
                {
                    label: 'Recettes',
                    data: recettesParMois,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1
                },
                {
                    label: 'Dépenses',
                    data: depensesParMois,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Évolution ${annee}`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('fr-FR') + ' F';
                        }
                    }
                }
            }
        }
    });
}

function renderBilanCategoriesChart(transactions) {
    const ctx = document.getElementById('bilan-categories-chart');
    if (!ctx) return;
    
    // Grouper les dépenses par catégorie
    const categories = {};
    transactions.filter(t => t.type === 'depense').forEach(t => {
        const cat = t.categorie || 'Autre';
        categories[cat] = (categories[cat] || 0) + t.montant;
    });
    
    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    if (bilanCategoriesChart) bilanCategoriesChart.destroy();
    
    if (labels.length === 0) {
        ctx.parentElement.innerHTML = '<p class="text-gray-400 text-center py-8">Aucune dépense enregistrée</p>';
        return;
    }
    
    const colors = [
        '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', 
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];
    
    bilanCategoriesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Répartition des dépenses'
                }
            }
        }
    });
}

function renderBilanTable(transactions, annee) {
    const container = document.getElementById('bilan-table');
    if (!container) return;
    
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    const data = mois.map((nom, i) => {
        const monthStr = String(i + 1).padStart(2, '0');
        const monthTrans = transactions.filter(t => t.date && t.date.startsWith(`${annee}-${monthStr}`));
        
        const recettes = monthTrans.filter(t => t.type === 'recette').reduce((sum, t) => sum + t.montant, 0);
        const depenses = monthTrans.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.montant, 0);
        const solde = recettes - depenses;
        
        return { nom, recettes, depenses, solde };
    });
    
    container.innerHTML = `
        <table class="w-full">
            <thead class="bg-gray-100">
                <tr>
                    <th class="text-left p-3">Mois</th>
                    <th class="text-right p-3">Recettes</th>
                    <th class="text-right p-3">Dépenses</th>
                    <th class="text-right p-3">Solde</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(d => `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-3 font-medium">${d.nom}</td>
                        <td class="p-3 text-right text-green-600">${d.recettes.toLocaleString('fr-FR')}</td>
                        <td class="p-3 text-right text-red-600">${d.depenses.toLocaleString('fr-FR')}</td>
                        <td class="p-3 text-right font-bold ${d.solde >= 0 ? 'text-green-600' : 'text-red-600'}">
                            ${d.solde.toLocaleString('fr-FR')}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot class="bg-blue-50 font-bold">
                <tr>
                    <td class="p-3">TOTAL</td>
                    <td class="p-3 text-right text-green-600">${data.reduce((s, d) => s + d.recettes, 0).toLocaleString('fr-FR')}</td>
                    <td class="p-3 text-right text-red-600">${data.reduce((s, d) => s + d.depenses, 0).toLocaleString('fr-FR')}</td>
                    <td class="p-3 text-right ${data.reduce((s, d) => s + d.solde, 0) >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${data.reduce((s, d) => s + d.solde, 0).toLocaleString('fr-FR')}
                    </td>
                </tr>
            </tfoot>
        </table>
    `;
}

// ===================================================
// MODULE: IA COMPTABLE
// ===================================================
function initIAComptable() {
    renderIAAnalyse();
    
    document.getElementById('ia-refresh')?.addEventListener('click', renderIAAnalyse);
}

function renderIAAnalyse() {
    const container = document.getElementById('ia-results');
    if (!container) return;
    
    // Récupérer toutes les données
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    const analyses = [];
    const alertes = [];
    const conseils = [];
    
    // Analyse des transactions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Transactions ce mois vs mois dernier
    const thisMonthTrans = transactions.filter(t => {
        if (!t.date) return false;
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const lastMonthTrans = transactions.filter(t => {
        if (!t.date) return false;
        const d = new Date(t.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });
    
    const thisMonthRecettes = thisMonthTrans.filter(t => t.type === 'recette').reduce((s, t) => s + t.montant, 0);
    const thisMonthDepenses = thisMonthTrans.filter(t => t.type === 'depense').reduce((s, t) => s + t.montant, 0);
    const lastMonthRecettes = lastMonthTrans.filter(t => t.type === 'recette').reduce((s, t) => s + t.montant, 0);
    const lastMonthDepenses = lastMonthTrans.filter(t => t.type === 'depense').reduce((s, t) => s + t.montant, 0);
    
    // Analyse tendance recettes
    if (lastMonthRecettes > 0) {
        const evolution = ((thisMonthRecettes - lastMonthRecettes) / lastMonthRecettes * 100).toFixed(1);
        if (evolution > 10) {
            analyses.push({
                type: 'success',
                icon: 'trending_up',
                title: 'Recettes en hausse',
                text: `Vos recettes ont augmenté de ${evolution}% par rapport au mois dernier. Excellente performance !`
            });
        } else if (evolution < -10) {
            alertes.push({
                type: 'warning',
                icon: 'trending_down',
                title: 'Baisse des recettes',
                text: `Vos recettes ont diminué de ${Math.abs(evolution)}% par rapport au mois dernier. Analysez les causes possibles.`
            });
        }
    }
    
    // Analyse tendance dépenses
    if (lastMonthDepenses > 0) {
        const evolution = ((thisMonthDepenses - lastMonthDepenses) / lastMonthDepenses * 100).toFixed(1);
        if (evolution > 20) {
            alertes.push({
                type: 'error',
                icon: 'warning',
                title: 'Dépenses en forte hausse',
                text: `Vos dépenses ont augmenté de ${evolution}% ce mois. Vérifiez les postes de dépenses inhabituels.`
            });
        } else if (evolution < -10) {
            analyses.push({
                type: 'success',
                icon: 'savings',
                title: 'Économies réalisées',
                text: `Vos dépenses ont diminué de ${Math.abs(evolution)}% par rapport au mois dernier. Bonne gestion !`
            });
        }
    }
    
    // Analyse ratio dépenses/recettes
    if (thisMonthRecettes > 0) {
        const ratio = (thisMonthDepenses / thisMonthRecettes * 100).toFixed(1);
        if (ratio > 80) {
            alertes.push({
                type: 'error',
                icon: 'account_balance',
                title: 'Marge faible',
                text: `Vos dépenses représentent ${ratio}% de vos recettes. Votre marge bénéficiaire est très réduite.`
            });
        } else if (ratio < 50) {
            analyses.push({
                type: 'success',
                icon: 'account_balance_wallet',
                title: 'Excellente marge',
                text: `Vos dépenses ne représentent que ${ratio}% de vos recettes. Très bonne rentabilité !`
            });
        }
    }
    
    // Analyse catégories de dépenses
    const categoriesDepenses = {};
    transactions.filter(t => t.type === 'depense').forEach(t => {
        const cat = t.categorie || 'Autre';
        categoriesDepenses[cat] = (categoriesDepenses[cat] || 0) + t.montant;
    });
    
    const totalDepenses = Object.values(categoriesDepenses).reduce((s, v) => s + v, 0);
    Object.entries(categoriesDepenses).forEach(([cat, montant]) => {
        const pct = (montant / totalDepenses * 100).toFixed(1);
        if (pct > 40) {
            alertes.push({
                type: 'warning',
                icon: 'pie_chart',
                title: `Concentration des dépenses`,
                text: `La catégorie "${cat}" représente ${pct}% de vos dépenses totales. Diversifiez vos postes.`
            });
        }
    });
    
    // Analyse factures impayées
    const facturesImpayees = factures.filter(f => f.status === 'en_attente');
    const montantImpaye = facturesImpayees.reduce((s, f) => s + f.totalTTC, 0);
    
    if (facturesImpayees.length > 0) {
        alertes.push({
            type: 'warning',
            icon: 'receipt_long',
            title: `${facturesImpayees.length} facture(s) impayée(s)`,
            text: `Vous avez ${montantImpaye.toLocaleString('fr-FR')} FCFA de factures en attente de paiement. Relancez vos clients.`
        });
    }
    
    // Factures en retard (plus de 30 jours)
    const facturesRetard = facturesImpayees.filter(f => {
        const dateFacture = new Date(f.date);
        const diffDays = Math.floor((now - dateFacture) / (1000 * 60 * 60 * 24));
        return diffDays > 30;
    });
    
    if (facturesRetard.length > 0) {
        alertes.push({
            type: 'error',
            icon: 'schedule',
            title: `${facturesRetard.length} facture(s) en retard`,
            text: `Ces factures datent de plus de 30 jours. Action urgente recommandée !`
        });
    }
    
    // Conseils personnalisés
    if (transactions.length < 10) {
        conseils.push({
            icon: 'lightbulb',
            text: 'Enregistrez régulièrement vos transactions pour un suivi précis de votre activité.'
        });
    }
    
    if (thisMonthRecettes > thisMonthDepenses * 1.5) {
        conseils.push({
            icon: 'savings',
            text: 'Votre trésorerie est saine. Pensez à investir dans de nouveaux équipements ou à épargner.'
        });
    }
    
    if (clients.length === 0) {
        conseils.push({
            icon: 'people',
            text: 'Utilisez le module CRM pour suivre vos clients et améliorer votre relation commerciale.'
        });
    }
    
    const moisNoms = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    // Prévision simple basée sur la moyenne
    const avgRecettes = transactions.filter(t => t.type === 'recette').reduce((s, t) => s + t.montant, 0) / Math.max(1, new Set(transactions.map(t => t.date?.substring(0, 7))).size);
    const avgDepenses = transactions.filter(t => t.type === 'depense').reduce((s, t) => s + t.montant, 0) / Math.max(1, new Set(transactions.map(t => t.date?.substring(0, 7))).size);
    
    if (transactions.length >= 5) {
        conseils.push({
            icon: 'auto_graph',
            text: `Prévision mois prochain : ~${avgRecettes.toLocaleString('fr-FR', {maximumFractionDigits: 0})} FCFA de recettes, ~${avgDepenses.toLocaleString('fr-FR', {maximumFractionDigits: 0})} FCFA de dépenses (basé sur votre historique).`
        });
    }
    
    // Rendu HTML
    let html = `
        <div class="mb-6">
            <p class="text-sm text-gray-500 mb-4">
                <span class="material-icons text-sm align-middle">update</span>
                Analyse effectuée le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}
            </p>
        </div>
    `;
    
    // Alertes
    if (alertes.length > 0) {
        html += `
            <div class="mb-6">
                <h3 class="text-lg font-bold text-red-600 mb-3">
                    <span class="material-icons align-middle">notification_important</span> Alertes (${alertes.length})
                </h3>
                <div class="space-y-3">
                    ${alertes.map(a => `
                        <div class="p-4 rounded-xl ${a.type === 'error' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-yellow-50 border-l-4 border-yellow-500'}">
                            <div class="flex items-start">
                                <span class="material-icons mr-3 ${a.type === 'error' ? 'text-red-500' : 'text-yellow-500'}">${a.icon}</span>
                                <div>
                                    <p class="font-semibold ${a.type === 'error' ? 'text-red-700' : 'text-yellow-700'}">${a.title}</p>
                                    <p class="text-sm ${a.type === 'error' ? 'text-red-600' : 'text-yellow-600'}">${a.text}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Analyses positives
    if (analyses.length > 0) {
        html += `
            <div class="mb-6">
                <h3 class="text-lg font-bold text-green-600 mb-3">
                    <span class="material-icons align-middle">insights</span> Points positifs (${analyses.length})
                </h3>
                <div class="space-y-3">
                    ${analyses.map(a => `
                        <div class="p-4 rounded-xl bg-green-50 border-l-4 border-green-500">
                            <div class="flex items-start">
                                <span class="material-icons mr-3 text-green-500">${a.icon}</span>
                                <div>
                                    <p class="font-semibold text-green-700">${a.title}</p>
                                    <p class="text-sm text-green-600">${a.text}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Conseils
    if (conseils.length > 0) {
        html += `
            <div class="mb-6">
                <h3 class="text-lg font-bold text-blue-600 mb-3">
                    <span class="material-icons align-middle">tips_and_updates</span> Conseils & Prévisions
                </h3>
                <div class="space-y-3">
                    ${conseils.map(c => `
                        <div class="p-4 rounded-xl bg-blue-50 border-l-4 border-blue-500">
                            <div class="flex items-start">
                                <span class="material-icons mr-3 text-blue-500">${c.icon}</span>
                                <p class="text-sm text-blue-700">${c.text}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Résumé rapide
    html += `
        <div class="mt-8 p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl text-white">
            <h3 class="text-xl font-bold mb-4">📊 Résumé ${moisNoms[currentMonth]} ${currentYear}</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                    <p class="text-3xl font-bold">${thisMonthRecettes.toLocaleString('fr-FR')}</p>
                    <p class="text-sm opacity-75">Recettes (FCFA)</p>
                </div>
                <div class="text-center">
                    <p class="text-3xl font-bold">${thisMonthDepenses.toLocaleString('fr-FR')}</p>
                    <p class="text-sm opacity-75">Dépenses (FCFA)</p>
                </div>
                <div class="text-center">
                    <p class="text-3xl font-bold ${thisMonthRecettes - thisMonthDepenses >= 0 ? 'text-green-300' : 'text-red-300'}">
                        ${(thisMonthRecettes - thisMonthDepenses).toLocaleString('fr-FR')}
                    </p>
                    <p class="text-sm opacity-75">Solde (FCFA)</p>
                </div>
                <div class="text-center">
                    <p class="text-3xl font-bold">${thisMonthTrans.length}</p>
                    <p class="text-sm opacity-75">Transactions</p>
                </div>
            </div>
        </div>
    `;
    
    if (alertes.length === 0 && analyses.length === 0 && transactions.length === 0) {
        html = `
            <div class="text-center py-12">
                <span class="material-icons text-6xl text-gray-300 mb-4">analytics</span>
                <p class="text-gray-500">Commencez à enregistrer des transactions pour voir l'analyse IA.</p>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// ===================================================
// MODULE: CRM CLIENTS
// ===================================================

// Fonction pour basculer entre formulaire Particulier et Entreprise
window.toggleClientType = function() {
    const selectedType = document.querySelector('input[name="client-type-radio"]:checked')?.value || 'particulier';
    const particulierFields = document.getElementById('client-particulier-fields');
    const entrepriseFields = document.getElementById('client-entreprise-fields');
    const typeInput = document.getElementById('client-type');
    
    if (typeInput) typeInput.value = selectedType;
    
    if (selectedType === 'particulier') {
        if (particulierFields) particulierFields.classList.remove('hidden');
        if (entrepriseFields) entrepriseFields.classList.add('hidden');
    } else {
        if (particulierFields) particulierFields.classList.add('hidden');
        if (entrepriseFields) entrepriseFields.classList.remove('hidden');
    }
};

function initClients() {
    renderClients();
    
    const form = document.getElementById('client-form');
    const cancelBtn = document.getElementById('client-cancel');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editId = document.getElementById('client-edit-id')?.value || '';
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        
        // Récupérer le type de client
        const clientType = document.getElementById('client-type')?.value || 'particulier';
        
        // Récupérer les services sélectionnés
        const services = [];
        document.querySelectorAll('input[name="client-services"]:checked').forEach(cb => {
            services.push(cb.value);
        });
        
        // Construire le nom complet
        let nomComplet = '';
        if (clientType === 'particulier') {
            const prenom = document.getElementById('client-prenom')?.value || '';
            const nom = document.getElementById('client-nom')?.value || '';
            nomComplet = `${prenom} ${nom}`.trim();
        } else {
            nomComplet = document.getElementById('client-raison-sociale')?.value || document.getElementById('client-nom')?.value || '';
        }
        
        const client = {
            id: editId !== '' ? clients.find(c => c.id == editId)?.id || Date.now() : Date.now(),
            type: clientType,
            // Infos particulier
            civilite: document.getElementById('client-civilite')?.value || '',
            prenom: document.getElementById('client-prenom')?.value || '',
            nom: nomComplet,
            dateNaissance: document.getElementById('client-naissance')?.value || '',
            cni: document.getElementById('client-cni')?.value || '',
            profession: document.getElementById('client-profession')?.value || '',
            // Infos entreprise
            raisonSociale: document.getElementById('client-raison-sociale')?.value || '',
            ninea: document.getElementById('client-ninea')?.value || '',
            rccm: document.getElementById('client-rccm')?.value || '',
            secteur: document.getElementById('client-secteur')?.value || '',
            contactPrincipal: document.getElementById('client-contact-principal')?.value || '',
            fonctionContact: document.getElementById('client-fonction-contact')?.value || '',
            // Coordonnées
            telephone: document.getElementById('client-tel')?.value || '',
            telephone2: document.getElementById('client-tel2')?.value || '',
            email: document.getElementById('client-email')?.value || '',
            whatsapp: document.getElementById('client-whatsapp')?.value || '',
            // Adresse
            adresse: document.getElementById('client-adresse')?.value || '',
            ville: document.getElementById('client-ville')?.value || 'Dakar',
            pays: document.getElementById('client-pays')?.value || 'Sénégal',
            // Intérêts
            services: services,
            budgetEstime: document.getElementById('client-budget')?.value || '',
            source: document.getElementById('client-source')?.value || '',
            // Statut
            statut: document.getElementById('client-statut')?.value || 'prospect',
            priorite: document.getElementById('client-priorite')?.value || 'normale',
            notes: document.getElementById('client-notes')?.value || '',
            // Métadonnées
            createdAt: editId !== '' ? (clients.find(c => c.id == editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (editId !== '') {
            const index = clients.findIndex(c => c.id == editId);
            if (index >= 0) {
                client.historique = clients[index].historique || [];
                clients[index] = client;
            }
            showNotification('Client modifié', `${client.nom} a été mis à jour`, 'success');
        } else {
            client.historique = [];
            clients.push(client);
            showNotification('Client ajouté', `${client.nom} a été ajouté au CRM`, 'success');
        }
        
        localStorage.setItem('clients', JSON.stringify(clients));
        form.reset();
        document.getElementById('client-edit-id').value = '';
        
        // Reset type radio
        const particulierRadio = document.querySelector('input[name="client-type-radio"][value="particulier"]');
        if (particulierRadio) {
            particulierRadio.checked = true;
            toggleClientType();
        }
        
        if (cancelBtn) cancelBtn.classList.add('hidden');
        
        renderClients();
        updateClientStats();
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            form.reset();
            document.getElementById('client-edit-id').value = '';
            cancelBtn.classList.add('hidden');
            
            const particulierRadio = document.querySelector('input[name="client-type-radio"][value="particulier"]');
            if (particulierRadio) {
                particulierRadio.checked = true;
                toggleClientType();
            }
        });
    }
    
    // Filtres et recherche
    document.getElementById('client-search')?.addEventListener('input', renderClients);
    document.getElementById('client-filter-statut')?.addEventListener('change', renderClients);
    
    updateClientStats();
}

function updateClientStats() {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    const totalEl = document.getElementById('clients-total');
    const prospectsEl = document.getElementById('clients-prospects');
    const actifsEl = document.getElementById('clients-actifs');
    
    if (totalEl) totalEl.textContent = clients.length;
    if (prospectsEl) prospectsEl.textContent = clients.filter(c => c.statut === 'prospect').length;
    if (actifsEl) actifsEl.textContent = clients.filter(c => c.statut === 'actif').length;
}

function renderClients() {
    const container = document.getElementById('clients-list');
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    // Filtres
    const search = document.getElementById('client-search')?.value?.toLowerCase() || '';
    const filterStatut = document.getElementById('client-filter-statut')?.value || 'all';
    
    let filtered = clients;
    
    if (search) {
        filtered = filtered.filter(c => 
            c.nom.toLowerCase().includes(search) ||
            c.email.toLowerCase().includes(search) ||
            c.telephone.includes(search) ||
            (c.entreprise && c.entreprise.toLowerCase().includes(search))
        );
    }
    
    if (filterStatut !== 'all') {
        filtered = filtered.filter(c => c.statut === filterStatut);
    }
    
    // Trier par date de mise à jour
    filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <span class="material-icons text-6xl text-gray-300 mb-4">people</span>
                <p class="text-gray-500">${search || filterStatut !== 'all' ? 'Aucun client trouvé' : 'Aucun client enregistré'}</p>
            </div>
        `;
        return;
    }
    
    const statutColors = {
        'prospect': 'bg-yellow-100 text-yellow-700',
        'actif': 'bg-green-100 text-green-700',
        'inactif': 'bg-gray-100 text-gray-600',
        'perdu': 'bg-red-100 text-red-700'
    };
    
    const statutLabels = {
        'prospect': 'Prospect',
        'actif': 'Client actif',
        'inactif': 'Inactif',
        'perdu': 'Perdu'
    };
    
    container.innerHTML = filtered.map((c, i) => {
        const globalIndex = clients.indexOf(c);
        const initials = c.nom.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        return `
            <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold mr-3">
                            ${initials}
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800">${c.nom}</h4>
                            ${c.entreprise ? `<p class="text-sm text-gray-500">${c.entreprise}</p>` : ''}
                        </div>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full ${statutColors[c.statut] || 'bg-gray-100'}">
                        ${statutLabels[c.statut] || c.statut}
                    </span>
                </div>
                
                <div class="space-y-1 mb-4">
                    <p class="text-sm text-gray-600 flex items-center">
                        <span class="material-icons text-sm mr-2 text-gray-400">email</span>
                        <a href="mailto:${c.email}" class="hover:text-blue-600">${c.email}</a>
                    </p>
                    <p class="text-sm text-gray-600 flex items-center">
                        <span class="material-icons text-sm mr-2 text-gray-400">phone</span>
                        <a href="tel:${c.telephone}" class="hover:text-blue-600">${c.telephone}</a>
                    </p>
                    ${c.adresse ? `
                        <p class="text-sm text-gray-600 flex items-center">
                            <span class="material-icons text-sm mr-2 text-gray-400">location_on</span>
                            ${c.adresse}
                        </p>
                    ` : ''}
                </div>
                
                ${c.notes ? `<p class="text-sm text-gray-500 italic mb-3 line-clamp-2">"${c.notes}"</p>` : ''}
                
                <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <button onclick="editClient(${globalIndex})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        <span class="material-icons text-sm align-middle">edit</span> Modifier
                    </button>
                    <button onclick="viewClientHistory(${globalIndex})" class="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                        <span class="material-icons text-sm align-middle">history</span> Historique
                    </button>
                    <button onclick="addClientInteraction(${globalIndex})" class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                        <span class="material-icons text-sm align-middle">add</span> Interaction
                    </button>
                    <button onclick="deleteClient(${globalIndex})" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                        <span class="material-icons text-sm align-middle">delete</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.editClient = function(index) {
    openClientModal(index);
};

window.deleteClient = function(index) {
    if (confirm('Supprimer ce client ?')) {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const c = clients[index];
        clients.splice(index, 1);
        localStorage.setItem('clients', JSON.stringify(clients));
        renderClients();
        updateClientStats();
        showNotification('Client supprimé', `${c.nom} a été supprimé`, 'warning');
    }
};

window.addClientInteraction = function(index) {
    const type = prompt('Type d\'interaction:\n- appel\n- email\n- rdv\n- devis\n- autre\n\nEntrez le type:');
    if (!type) return;
    
    const note = prompt('Note sur cette interaction:');
    if (note === null) return;
    
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    if (!clients[index].historique) {
        clients[index].historique = [];
    }
    
    clients[index].historique.unshift({
        type: type,
        note: note,
        date: new Date().toISOString()
    });
    
    clients[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem('clients', JSON.stringify(clients));
    renderClients();
    showNotification('Interaction ajoutée', `Nouvelle interaction avec ${clients[index].nom}`, 'success');
};

window.viewClientHistory = function(index) {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const c = clients[index];
    const historique = c.historique || [];
    
    const typeIcons = {
        'appel': 'phone',
        'email': 'email',
        'rdv': 'event',
        'devis': 'description',
        'autre': 'notes'
    };
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto p-6">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">Historique - ${c.nom}</h2>
                    <p class="text-sm text-gray-500">Client depuis ${new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="p-2 hover:bg-gray-100 rounded-full">
                    <span class="material-icons">close</span>
                </button>
            </div>
            
            ${historique.length === 0 ? `
                <div class="text-center py-8">
                    <span class="material-icons text-4xl text-gray-300 mb-2">history</span>
                    <p class="text-gray-500">Aucune interaction enregistrée</p>
                </div>
            ` : `
                <div class="space-y-4">
                    ${historique.map(h => `
                        <div class="flex items-start p-3 bg-gray-50 rounded-xl">
                            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <span class="material-icons text-blue-600">${typeIcons[h.type] || 'notes'}</span>
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start">
                                    <span class="font-medium text-gray-800 capitalize">${h.type}</span>
                                    <span class="text-xs text-gray-400">${new Date(h.date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <p class="text-sm text-gray-600 mt-1">${h.note || 'Pas de note'}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
            
            <div class="mt-6 pt-4 border-t">
                <button onclick="addClientInteraction(${index}); this.closest('.fixed').remove();" 
                    class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                    <span class="material-icons align-middle mr-2">add</span>
                    Ajouter une interaction
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// ===================================================
// MODULE: PROJETS & CHANTIERS
// ===================================================
function initProjets() {
    renderProjets();
    populateClientSelect();
    
    const form = document.getElementById('projet-form');
    
    if (!form) return;
    
    // Dates par défaut
    const dateDebut = document.getElementById('projet-debut');
    if (dateDebut) dateDebut.value = new Date().toISOString().split('T')[0];
    
    // Slider avancement
    const avancementSlider = document.getElementById('projet-avancement');
    const avancementValue = document.getElementById('avancement-value');
    if (avancementSlider && avancementValue) {
        avancementSlider.addEventListener('input', function() {
            avancementValue.textContent = this.value + '%';
        });
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editIndex = document.getElementById('projet-edit-index').value;
        const projets = JSON.parse(localStorage.getItem('projets') || '[]');
        
        // Générer une référence si non fournie
        let reference = document.getElementById('projet-reference')?.value || '';
        if (!reference) {
            const maxNum = projets.reduce((max, p) => {
                const num = parseInt(p.reference?.replace('PRJ-', '') || '0');
                return num > max ? num : max;
            }, 0);
            reference = 'PRJ-' + String(maxNum + 1).padStart(3, '0');
        }
        
        const projet = {
            // Infos générales
            nom: document.getElementById('projet-nom')?.value || '',
            reference: reference,
            type: document.getElementById('projet-type')?.value || '',
            client: document.getElementById('projet-client')?.value || '',
            
            // Localisation
            adresse: document.getElementById('projet-adresse')?.value || '',
            ville: document.getElementById('projet-ville')?.value || '',
            surface: parseFloat(document.getElementById('projet-surface')?.value) || 0,
            
            // Planification
            dateDebut: document.getElementById('projet-debut')?.value || '',
            dateFin: document.getElementById('projet-fin')?.value || '',
            duree: parseInt(document.getElementById('projet-duree')?.value) || 0,
            avancement: parseInt(document.getElementById('projet-avancement')?.value) || 0,
            
            // Budget
            budget: parseFloat(document.getElementById('projet-budget')?.value) || 0,
            depenses: editIndex !== '' ? (projets[parseInt(editIndex)].depenses || parseFloat(document.getElementById('projet-depense')?.value) || 0) : parseFloat(document.getElementById('projet-depense')?.value) || 0,
            marge: parseFloat(document.getElementById('projet-marge')?.value) || 15,
            acompte: parseFloat(document.getElementById('projet-acompte')?.value) || 0,
            
            // Équipe
            chefChantier: document.getElementById('projet-chef')?.value || '',
            nombreOuvriers: parseInt(document.getElementById('projet-ouvriers')?.value) || 0,
            
            // Statut
            statut: document.getElementById('projet-statut')?.value || 'prospection',
            priorite: document.getElementById('projet-priorite')?.value || 'normale',
            
            // Notes
            notes: document.getElementById('projet-notes')?.value || '',
            
            // Métadonnées
            taches: editIndex !== '' ? (projets[parseInt(editIndex)].taches || []) : [],
            createdAt: editIndex !== '' ? projets[parseInt(editIndex)].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (editIndex !== '') {
            projets[parseInt(editIndex)] = projet;
            showNotification('Projet modifié', `${projet.nom} mis à jour`, 'success');
        } else {
            projets.push(projet);
            showNotification('Projet créé', `${projet.nom} ajouté`, 'success');
        }
        
        localStorage.setItem('projets', JSON.stringify(projets));
        form.reset();
        document.getElementById('projet-edit-index').value = '';
        if (dateDebut) dateDebut.value = new Date().toISOString().split('T')[0];
        if (avancementSlider) avancementSlider.value = 0;
        if (avancementValue) avancementValue.textContent = '0%';
        
        renderProjets();
        updateProjetStats();
    });
    
    // Filtres
    document.getElementById('projet-filter-statut')?.addEventListener('change', renderProjets);
    document.getElementById('projet-filter-type')?.addEventListener('change', renderProjets);
    
    updateProjetStats();
}

function populateClientSelect() {
    const select = document.getElementById('projet-client');
    if (!select) return;
    
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    // Garder la première option
    select.innerHTML = '<option value="">-- Sélectionner un client --</option>';
    
    clients.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.nom;
        opt.textContent = c.entreprise ? `${c.nom} (${c.entreprise})` : c.nom;
        select.appendChild(opt);
    });
}

function updateProjetStats() {
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    
    const totalEl = document.getElementById('projets-total');
    const enCoursEl = document.getElementById('projets-en-cours');
    const terminesEl = document.getElementById('projets-termines');
    const budgetEl = document.getElementById('projets-budget-total');
    
    const enCours = projets.filter(p => p.statut === 'en_cours');
    const termines = projets.filter(p => p.statut === 'termine');
    const budgetTotal = projets.reduce((s, p) => s + (p.budget || 0), 0);
    
    if (totalEl) totalEl.textContent = projets.length;
    if (enCoursEl) enCoursEl.textContent = enCours.length;
    if (terminesEl) terminesEl.textContent = termines.length;
    if (budgetEl) budgetEl.textContent = budgetTotal.toLocaleString('fr-FR') + ' FCFA';
}

function renderProjets() {
    const container = document.getElementById('projets-list');
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    
    // Filtres
    const filterStatut = document.getElementById('projet-filter-statut')?.value || 'all';
    const filterType = document.getElementById('projet-filter-type')?.value || 'all';
    
    let filtered = projets;
    
    if (filterStatut !== 'all') {
        filtered = filtered.filter(p => p.statut === filterStatut);
    }
    if (filterType !== 'all') {
        filtered = filtered.filter(p => p.type === filterType);
    }
    
    // Trier par date de mise à jour
    filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <span class="material-icons text-6xl text-gray-300 mb-4">engineering</span>
                <p class="text-gray-500">Aucun projet</p>
            </div>
        `;
        return;
    }
    
    const statutColors = {
        'devis': 'bg-purple-100 text-purple-700 border-purple-300',
        'planifie': 'bg-blue-100 text-blue-700 border-blue-300',
        'en_cours': 'bg-yellow-100 text-yellow-700 border-yellow-300',
        'en_pause': 'bg-orange-100 text-orange-700 border-orange-300',
        'termine': 'bg-green-100 text-green-700 border-green-300',
        'annule': 'bg-red-100 text-red-700 border-red-300'
    };
    
    const statutLabels = {
        'devis': 'Devis',
        'planifie': 'Planifié',
        'en_cours': 'En cours',
        'en_pause': 'En pause',
        'termine': 'Terminé',
        'annule': 'Annulé'
    };
    
    const typeLabels = {
        'construction': 'Construction',
        'renovation': 'Rénovation',
        'amenagement': 'Aménagement',
        'gestion': 'Gestion locative',
        'autre': 'Autre'
    };
    
    const prioriteColors = {
        'basse': 'text-gray-500',
        'normale': 'text-blue-500',
        'haute': 'text-orange-500',
        'urgente': 'text-red-500'
    };
    
    container.innerHTML = filtered.map((p, i) => {
        const globalIndex = projets.indexOf(p);
        const progression = p.budget > 0 ? Math.min(100, Math.round((p.depenses / p.budget) * 100)) : 0;
        const depassement = p.depenses > p.budget;
        
        // Calculer les jours restants
        let joursRestants = '';
        if (p.dateFin && p.statut === 'en_cours') {
            const fin = new Date(p.dateFin);
            const now = new Date();
            const diff = Math.ceil((fin - now) / (1000 * 60 * 60 * 24));
            if (diff < 0) {
                joursRestants = `<span class="text-red-500 text-xs">En retard de ${Math.abs(diff)} jours</span>`;
            } else if (diff <= 7) {
                joursRestants = `<span class="text-orange-500 text-xs">${diff} jours restants</span>`;
            } else {
                joursRestants = `<span class="text-gray-500 text-xs">${diff} jours restants</span>`;
            }
        }
        
        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden">
                <div class="p-5">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <span class="text-xs px-2 py-1 rounded-full ${statutColors[p.statut] || 'bg-gray-100'}">
                                ${statutLabels[p.statut] || p.statut}
                            </span>
                            <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full ml-1">
                                ${typeLabels[p.type] || p.type}
                            </span>
                        </div>
                        <span class="material-icons ${prioriteColors[p.priorite] || 'text-gray-400'}" title="Priorité ${p.priorite}">
                            ${p.priorite === 'urgente' ? 'priority_high' : 'flag'}
                        </span>
                    </div>
                    
                    <h4 class="font-bold text-lg text-gray-800 mb-1">${p.nom}</h4>
                    ${p.client ? `<p class="text-sm text-blue-600 mb-2"><span class="material-icons text-sm align-middle">person</span> ${p.client}</p>` : ''}
                    ${p.adresse ? `<p class="text-sm text-gray-500 mb-2"><span class="material-icons text-sm align-middle">location_on</span> ${p.adresse}</p>` : ''}
                    
                    <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span><span class="material-icons text-sm align-middle">calendar_today</span> ${new Date(p.dateDebut).toLocaleDateString('fr-FR')}</span>
                        ${p.dateFin ? `<span>→ ${new Date(p.dateFin).toLocaleDateString('fr-FR')}</span>` : ''}
                    </div>
                    ${joursRestants ? `<div class="mb-3">${joursRestants}</div>` : ''}
                    
                    <!-- Budget -->
                    <div class="mb-4">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600">Budget</span>
                            <span class="${depassement ? 'text-red-600 font-bold' : 'text-gray-800'}">
                                ${p.depenses.toLocaleString('fr-FR')} / ${p.budget.toLocaleString('fr-FR')} FCFA
                            </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="h-2 rounded-full ${depassement ? 'bg-red-500' : progression > 80 ? 'bg-orange-500' : 'bg-blue-500'}" 
                                style="width: ${Math.min(100, progression)}%"></div>
                        </div>
                    </div>
                    
                    <!-- Tâches -->
                    ${p.taches && p.taches.length > 0 ? `
                        <div class="text-sm text-gray-500 mb-3">
                            <span class="material-icons text-sm align-middle">task_alt</span>
                            ${p.taches.filter(t => t.fait).length}/${p.taches.length} tâches
                        </div>
                    ` : ''}
                </div>
                
                <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                    <button onclick="viewProjet(${globalIndex})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        <span class="material-icons text-sm align-middle">visibility</span> Détails
                    </button>
                    <button onclick="editProjet(${globalIndex})" class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200">
                        <span class="material-icons text-sm align-middle">edit</span>
                    </button>
                    <button onclick="addProjetDepense(${globalIndex})" class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                        <span class="material-icons text-sm align-middle">payments</span>
                    </button>
                    <button onclick="deleteProjet(${globalIndex})" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                        <span class="material-icons text-sm align-middle">delete</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.editProjet = function(index) {
    openProjetModal(index);
};

window.deleteProjet = function(index) {
    if (confirm('Supprimer ce projet ?')) {
        const projets = JSON.parse(localStorage.getItem('projets') || '[]');
        const p = projets[index];
        projets.splice(index, 1);
        localStorage.setItem('projets', JSON.stringify(projets));
        renderProjets();
        updateProjetStats();
        showNotification('Projet supprimé', `${p.nom} a été supprimé`, 'warning');
    }
};

window.addProjetDepense = function(index) {
    const montant = prompt('Montant de la dépense (FCFA):');
    if (!montant || isNaN(montant)) return;
    
    const description = prompt('Description de la dépense:') || 'Dépense projet';
    
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    projets[index].depenses = (projets[index].depenses || 0) + parseFloat(montant);
    projets[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem('projets', JSON.stringify(projets));
    
    // Ajouter aussi en comptabilité
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    transactions.push({
        type: 'depense',
        categorie: 'Chantier',
        montant: parseFloat(montant),
        description: `${projets[index].nom} - ${description}`,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('comptabilite', JSON.stringify(transactions));
    
    renderProjets();
    showNotification('Dépense ajoutée', `${parseFloat(montant).toLocaleString('fr-FR')} FCFA ajoutés au projet`, 'success');
};

window.viewProjet = function(index) {
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    const p = projets[index];
    
    const statutLabels = {
        'devis': 'Devis', 'planifie': 'Planifié', 'en_cours': 'En cours',
        'en_pause': 'En pause', 'termine': 'Terminé', 'annule': 'Annulé'
    };
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">${p.nom}</h2>
                    <p class="text-gray-500">${statutLabels[p.statut] || p.statut}</p>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="p-2 hover:bg-gray-100 rounded-full">
                    <span class="material-icons">close</span>
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="p-4 bg-gray-50 rounded-xl">
                    <p class="text-sm text-gray-500">Client</p>
                    <p class="font-semibold">${p.client || 'Non assigné'}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                    <p class="text-sm text-gray-500">Adresse</p>
                    <p class="font-semibold">${p.adresse || 'Non renseignée'}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                    <p class="text-sm text-gray-500">Date début</p>
                    <p class="font-semibold">${new Date(p.dateDebut).toLocaleDateString('fr-FR')}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                    <p class="text-sm text-gray-500">Date fin prévue</p>
                    <p class="font-semibold">${p.dateFin ? new Date(p.dateFin).toLocaleDateString('fr-FR') : 'Non définie'}</p>
                </div>
            </div>
            
            <div class="p-4 bg-blue-50 rounded-xl mb-6">
                <div class="flex justify-between mb-2">
                    <span class="font-semibold text-blue-800">Budget</span>
                    <span class="font-bold text-blue-800">${p.budget.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-blue-700">Dépenses</span>
                    <span class="${p.depenses > p.budget ? 'text-red-600 font-bold' : 'text-blue-700'}">${p.depenses.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-blue-700">Reste</span>
                    <span class="${p.budget - p.depenses < 0 ? 'text-red-600' : 'text-green-600'} font-bold">
                        ${(p.budget - p.depenses).toLocaleString('fr-FR')} FCFA
                    </span>
                </div>
            </div>
            
            ${p.description ? `<div class="mb-6"><h3 class="font-semibold mb-2">Description</h3><p class="text-gray-600">${p.description}</p></div>` : ''}
            
            ${p.notes ? `<div class="p-4 bg-yellow-50 rounded-xl"><p class="text-sm text-gray-600"><strong>Notes:</strong> ${p.notes}</p></div>` : ''}
            
            <div class="mt-6 flex gap-2">
                <button onclick="addProjetDepense(${index}); this.closest('.fixed').remove();" 
                    class="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition">
                    <span class="material-icons align-middle mr-2">payments</span> Ajouter dépense
                </button>
                <button onclick="editProjet(${index}); this.closest('.fixed').remove();" 
                    class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                    <span class="material-icons align-middle mr-2">edit</span> Modifier
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// ===================================================
// MODULE: GESTION DES EMPLOYÉS
// ===================================================
function initEmployes() {
    renderEmployes();
    
    const form = document.getElementById('employe-form');
    
    if (!form) return;
    
    // Date d'embauche par défaut
    const dateEmbauche = document.getElementById('employe-embauche');
    if (dateEmbauche) dateEmbauche.value = new Date().toISOString().split('T')[0];
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editId = document.getElementById('employe-edit-id').value;
        const employes = JSON.parse(localStorage.getItem('employes') || '[]');
        
        // Générer un matricule si non fourni
        const matriculeInput = document.getElementById('employe-matricule');
        let matricule = matriculeInput?.value || '';
        if (!matricule) {
            const maxNum = employes.reduce((max, emp) => {
                const num = parseInt(emp.matricule?.replace('EMP-', '') || '0');
                return num > max ? num : max;
            }, 0);
            matricule = 'EMP-' + String(maxNum + 1).padStart(3, '0');
        }
        
        const employe = {
            // Identité
            civilite: document.getElementById('employe-civilite')?.value || 'M.',
            prenom: document.getElementById('employe-prenom')?.value || '',
            nom: document.getElementById('employe-nom')?.value || '',
            dateNaissance: document.getElementById('employe-naissance')?.value || '',
            lieuNaissance: document.getElementById('employe-lieu-naissance')?.value || '',
            cni: document.getElementById('employe-cni')?.value || '',
            nationalite: document.getElementById('employe-nationalite')?.value || 'Sénégalaise',
            situationFamiliale: document.getElementById('employe-situation')?.value || 'celibataire',
            enfants: parseInt(document.getElementById('employe-enfants')?.value) || 0,
            
            // Coordonnées
            telephone: document.getElementById('employe-tel')?.value || '',
            email: document.getElementById('employe-email')?.value || '',
            adresse: document.getElementById('employe-adresse')?.value || '',
            contactUrgenceNom: document.getElementById('employe-urgence-nom')?.value || '',
            contactUrgenceTel: document.getElementById('employe-urgence-tel')?.value || '',
            
            // Informations professionnelles
            matricule: matricule,
            poste: document.getElementById('employe-poste')?.value || '',
            departement: document.getElementById('employe-departement')?.value || '',
            contrat: document.getElementById('employe-contrat')?.value || 'cdi',
            dateEmbauche: document.getElementById('employe-embauche')?.value || '',
            finContrat: document.getElementById('employe-fin-contrat')?.value || '',
            
            // Rémunération
            salaire: parseFloat(document.getElementById('employe-salaire')?.value) || 0,
            modePaiement: document.getElementById('employe-mode-paiement')?.value || 'virement',
            rib: document.getElementById('employe-rib')?.value || '',
            ipres: document.getElementById('employe-ipres')?.value || '',
            
            // Statut
            statut: document.getElementById('employe-statut')?.value || 'actif',
            congesRestants: parseInt(document.getElementById('employe-conges')?.value) || 24,
            
            // Notes
            notes: document.getElementById('employe-notes')?.value || '',
            
            // Métadonnées
            createdAt: editId !== '' ? employes.find(emp => emp.matricule === editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (editId !== '') {
            const index = employes.findIndex(emp => emp.matricule === editId);
            if (index !== -1) {
                employes[index] = employe;
                showNotification('Employé modifié', `${employe.prenom} ${employe.nom} mis à jour`, 'success');
            }
        } else {
            employes.push(employe);
            showNotification('Employé ajouté', `${employe.prenom} ${employe.nom} ajouté à l'équipe`, 'success');
        }
        
        localStorage.setItem('employes', JSON.stringify(employes));
        form.reset();
        document.getElementById('employe-edit-id').value = '';
        if (dateEmbauche) dateEmbauche.value = new Date().toISOString().split('T')[0];
        document.getElementById('employe-conges').value = '24';
        document.getElementById('employe-nationalite').value = 'Sénégalaise';
        
        renderEmployes();
        updateEmployeStats();
    });
    
    // Filtres
    document.getElementById('employe-filter-departement')?.addEventListener('change', renderEmployes);
    document.getElementById('employe-filter-statut')?.addEventListener('change', renderEmployes);
    document.getElementById('employe-search')?.addEventListener('input', renderEmployes);
    
    updateEmployeStats();
}

function updateEmployeStats() {
    const employes = JSON.parse(localStorage.getItem('employes') || '[]');
    
    const totalEl = document.getElementById('employes-total');
    const actifsEl = document.getElementById('employes-actifs');
    const masseSalarialeEl = document.getElementById('employes-masse-salariale');
    
    const actifs = employes.filter(e => e.statut === 'actif');
    const masseSalariale = actifs.reduce((s, e) => s + (e.salaire || 0), 0);
    
    if (totalEl) totalEl.textContent = employes.length;
    if (actifsEl) actifsEl.textContent = actifs.length;
    if (masseSalarialeEl) masseSalarialeEl.textContent = masseSalariale.toLocaleString('fr-FR') + ' FCFA';
}

function renderEmployes() {
    const container = document.getElementById('employes-list');
    const employes = JSON.parse(localStorage.getItem('employes') || '[]');
    
    // Filtres
    const search = document.getElementById('employe-search')?.value?.toLowerCase() || '';
    const filterDept = document.getElementById('employe-filter-departement')?.value || 'all';
    const filterStatut = document.getElementById('employe-filter-statut')?.value || 'all';
    
    let filtered = employes;
    
    if (search) {
        filtered = filtered.filter(e => 
            e.nom.toLowerCase().includes(search) ||
            e.prenom.toLowerCase().includes(search) ||
            e.poste.toLowerCase().includes(search) ||
            e.telephone.includes(search)
        );
    }
    
    if (filterDept !== 'all') {
        filtered = filtered.filter(e => e.departement === filterDept);
    }
    
    if (filterStatut !== 'all') {
        filtered = filtered.filter(e => e.statut === filterStatut);
    }
    
    // Trier par nom
    filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <span class="material-icons text-6xl text-gray-300 mb-4">badge</span>
                <p class="text-gray-500">${search || filterDept !== 'all' || filterStatut !== 'all' ? 'Aucun employé trouvé' : 'Aucun employé enregistré'}</p>
            </div>
        `;
        return;
    }
    
    const statutColors = {
        'actif': 'bg-green-100 text-green-700',
        'conge': 'bg-blue-100 text-blue-700',
        'maladie': 'bg-orange-100 text-orange-700',
        'parti': 'bg-red-100 text-red-700'
    };
    
    const statutLabels = {
        'actif': 'Actif',
        'conge': 'En congé',
        'maladie': 'Arrêt maladie',
        'parti': 'Parti'
    };
    
    const deptColors = {
        'direction': 'bg-purple-500',
        'commercial': 'bg-blue-500',
        'technique': 'bg-orange-500',
        'administratif': 'bg-green-500',
        'chantier': 'bg-yellow-500'
    };
    
    container.innerHTML = filtered.map((e, i) => {
        const globalIndex = employes.indexOf(e);
        const initials = `${e.prenom[0]}${e.nom[0]}`.toUpperCase();
        
        // Calculer l'ancienneté
        const embauche = new Date(e.dateEmbauche);
        const now = new Date();
        const anciennete = Math.floor((now - embauche) / (1000 * 60 * 60 * 24 * 365));
        
        return `
            <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center">
                        <div class="w-14 h-14 rounded-full ${deptColors[e.departement] || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-lg mr-4">
                            ${initials}
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800">${e.prenom} ${e.nom}</h4>
                            <p class="text-sm text-blue-600">${e.poste}</p>
                        </div>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full ${statutColors[e.statut] || 'bg-gray-100'}">
                        ${statutLabels[e.statut] || e.statut}
                    </span>
                </div>
                
                <div class="space-y-2 mb-4">
                    <p class="text-sm text-gray-600 flex items-center">
                        <span class="material-icons text-sm mr-2 text-gray-400">business</span>
                        ${e.departement.charAt(0).toUpperCase() + e.departement.slice(1)}
                    </p>
                    <p class="text-sm text-gray-600 flex items-center">
                        <span class="material-icons text-sm mr-2 text-gray-400">phone</span>
                        <a href="tel:${e.telephone}" class="hover:text-blue-600">${e.telephone}</a>
                    </p>
                    ${e.email ? `
                        <p class="text-sm text-gray-600 flex items-center">
                            <span class="material-icons text-sm mr-2 text-gray-400">email</span>
                            <a href="mailto:${e.email}" class="hover:text-blue-600">${e.email}</a>
                        </p>
                    ` : ''}
                    <p class="text-sm text-gray-600 flex items-center">
                        <span class="material-icons text-sm mr-2 text-gray-400">calendar_today</span>
                        Depuis ${new Date(e.dateEmbauche).toLocaleDateString('fr-FR')} (${anciennete > 0 ? anciennete + ' an' + (anciennete > 1 ? 's' : '') : 'Nouveau'})
                    </p>
                </div>
                
                <div class="p-3 bg-gray-50 rounded-lg mb-4">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Salaire mensuel</span>
                        <span class="font-bold text-gray-800">${e.salaire.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <button onclick="editEmploye(${globalIndex})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        <span class="material-icons text-sm align-middle">edit</span> Modifier
                    </button>
                    <button onclick="viewEmploye(${globalIndex})" class="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                        <span class="material-icons text-sm align-middle">visibility</span> Détails
                    </button>
                    <button onclick="payerSalaire(${globalIndex})" class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                        <span class="material-icons text-sm align-middle">payments</span> Payer
                    </button>
                    <button onclick="deleteEmploye(${globalIndex})" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                        <span class="material-icons text-sm align-middle">delete</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.editEmploye = function(index) {
    openEmployeModal(index);
};

window.deleteEmploye = function(index) {
    if (confirm('Supprimer cet employé ?')) {
        const employes = JSON.parse(localStorage.getItem('employes') || '[]');
        const e = employes[index];
        employes.splice(index, 1);
        localStorage.setItem('employes', JSON.stringify(employes));
        renderEmployes();
        updateEmployeStats();
        showNotification('Employé supprimé', `${e.prenom} ${e.nom} a été supprimé`, 'warning');
    }
};

window.payerSalaire = function(index) {
    const employes = JSON.parse(localStorage.getItem('employes') || '[]');
    const e = employes[index];
    
    const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const now = new Date();
    const moisActuel = moisNoms[now.getMonth()];
    
    if (confirm(`Enregistrer le paiement du salaire de ${e.prenom} ${e.nom} pour ${moisActuel} ${now.getFullYear()} ?\n\nMontant: ${e.salaire.toLocaleString('fr-FR')} FCFA`)) {
        // Ajouter en comptabilité
        const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
        transactions.push({
            type: 'depense',
            categorie: 'Salaires',
            montant: e.salaire,
            description: `Salaire ${moisActuel} ${now.getFullYear()} - ${e.prenom} ${e.nom}`,
            date: now.toISOString().split('T')[0],
            createdAt: now.toISOString()
        });
        localStorage.setItem('comptabilite', JSON.stringify(transactions));
        
        showNotification('Salaire payé', `${e.salaire.toLocaleString('fr-FR')} FCFA pour ${e.prenom} ${e.nom}`, 'success');
    }
};

window.viewEmploye = function(index) {
    const employes = JSON.parse(localStorage.getItem('employes') || '[]');
    const e = employes[index];
    
    const statutLabels = {
        'actif': 'Actif', 'conge': 'En congé', 'maladie': 'Arrêt maladie', 'parti': 'Parti'
    };
    
    const contratLabels = {
        'cdi': 'CDI', 'cdd': 'CDD', 'stage': 'Stage', 'freelance': 'Freelance'
    };
    
    // Calculer l'ancienneté
    const embauche = new Date(e.dateEmbauche);
    const now = new Date();
    const diffMs = now - embauche;
    const annees = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
    const mois = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto p-6">
            <div class="flex justify-between items-start mb-6">
                <div class="flex items-center">
                    <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl mr-4">
                        ${e.prenom[0]}${e.nom[0]}
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">${e.prenom} ${e.nom}</h2>
                        <p class="text-blue-600">${e.poste}</p>
                    </div>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="p-2 hover:bg-gray-100 rounded-full">
                    <span class="material-icons">close</span>
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="p-4 bg-gray-50 rounded-xl">
                    <p class="text-sm text-gray-500">Département</p>
                    <p class="font-semibold capitalize">${e.departement}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                    <p class="text-sm text-gray-500">Statut</p>
                    <p class="font-semibold">${statutLabels[e.statut] || e.statut}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                    <p class="text-sm text-gray-500">Contrat</p>
                    <p class="font-semibold">${contratLabels[e.contrat] || e.contrat}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                    <p class="text-sm text-gray-500">Ancienneté</p>
                    <p class="font-semibold">${annees > 0 ? annees + ' an' + (annees > 1 ? 's' : '') + ' ' : ''}${mois} mois</p>
                </div>
            </div>
            
            <div class="p-4 bg-blue-50 rounded-xl mb-6">
                <div class="flex justify-between items-center">
                    <span class="text-blue-700">Salaire mensuel</span>
                    <span class="text-2xl font-bold text-blue-800">${e.salaire.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <p class="text-sm text-blue-600 mt-1">Salaire annuel: ${(e.salaire * 12).toLocaleString('fr-FR')} FCFA</p>
            </div>
            
            <div class="space-y-3 mb-6">
                <p class="flex items-center text-gray-600">
                    <span class="material-icons mr-3 text-gray-400">phone</span>
                    <a href="tel:${e.telephone}" class="hover:text-blue-600">${e.telephone}</a>
                </p>
                ${e.email ? `
                    <p class="flex items-center text-gray-600">
                        <span class="material-icons mr-3 text-gray-400">email</span>
                        <a href="mailto:${e.email}" class="hover:text-blue-600">${e.email}</a>
                    </p>
                ` : ''}
                ${e.adresse ? `
                    <p class="flex items-center text-gray-600">
                        <span class="material-icons mr-3 text-gray-400">location_on</span>
                        ${e.adresse}
                    </p>
                ` : ''}
                <p class="flex items-center text-gray-600">
                    <span class="material-icons mr-3 text-gray-400">calendar_today</span>
                    Embauché le ${new Date(e.dateEmbauche).toLocaleDateString('fr-FR')}
                </p>
            </div>
            
            ${e.notes ? `<div class="p-4 bg-yellow-50 rounded-xl mb-6"><p class="text-sm text-gray-600"><strong>Notes:</strong> ${e.notes}</p></div>` : ''}
            
            <div class="flex gap-2">
                <button onclick="payerSalaire(${index}); this.closest('.fixed').remove();" 
                    class="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition">
                    <span class="material-icons align-middle mr-2">payments</span> Payer salaire
                </button>
                <button onclick="editEmploye(${index}); this.closest('.fixed').remove();" 
                    class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                    <span class="material-icons align-middle mr-2">edit</span> Modifier
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// ===================================================
// MODULE: GESTION DES STOCKS
// ===================================================
function initStocks() {
    renderStocks();
    
    const form = document.getElementById('stock-form');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editIndex = document.getElementById('stock-edit-index').value;
        const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
        
        // Générer une référence si non fournie
        let reference = document.getElementById('stock-reference')?.value || '';
        if (!reference) {
            const maxNum = stocks.reduce((max, s) => {
                const num = parseInt(s.reference?.replace('ART-', '') || '0');
                return num > max ? num : max;
            }, 0);
            reference = 'ART-' + String(maxNum + 1).padStart(3, '0');
        }
        
        const stock = {
            // Identification
            reference: reference,
            nom: document.getElementById('stock-nom')?.value || '',
            description: document.getElementById('stock-description')?.value || '',
            categorie: document.getElementById('stock-categorie')?.value || '',
            
            // Stock
            quantite: parseInt(document.getElementById('stock-quantite')?.value) || 0,
            unite: document.getElementById('stock-unite')?.value || 'pcs',
            seuilAlerte: parseInt(document.getElementById('stock-seuil')?.value) || 5,
            stockMax: parseInt(document.getElementById('stock-max')?.value) || 0,
            emplacement: document.getElementById('stock-emplacement')?.value || '',
            
            // Prix
            prixAchat: parseFloat(document.getElementById('stock-prix-achat')?.value) || 0,
            prixUnitaire: parseFloat(document.getElementById('stock-prix')?.value) || 0,
            tva: parseInt(document.getElementById('stock-tva')?.value) || 18,
            
            // Fournisseur
            fournisseur: document.getElementById('stock-fournisseur')?.value || '',
            fournisseurTel: document.getElementById('stock-fournisseur-tel')?.value || '',
            delaiLivraison: parseInt(document.getElementById('stock-delai')?.value) || 0,
            
            // Notes
            notes: document.getElementById('stock-notes')?.value || '',
            
            // Mouvements et métadonnées
            mouvements: editIndex !== '' ? (stocks[parseInt(editIndex)].mouvements || []) : [],
            createdAt: editIndex !== '' ? stocks[parseInt(editIndex)].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (editIndex !== '') {
            stocks[parseInt(editIndex)] = stock;
            showNotification('Article modifié', `${stock.nom} mis à jour`, 'success');
        } else {
            // Ajouter mouvement initial
            stock.mouvements.push({
                type: 'entree',
                quantite: stock.quantite,
                date: new Date().toISOString(),
                motif: 'Stock initial'
            });
            stocks.push(stock);
            showNotification('Article ajouté', `${stock.nom} ajouté au stock`, 'success');
        }
        
        localStorage.setItem('stocks', JSON.stringify(stocks));
        form.reset();
        document.getElementById('stock-edit-index').value = '';
        
        renderStocks();
        renderStockAlertes();
        updateStockStats();
    });
    
    // Filtres
    document.getElementById('stock-filter')?.addEventListener('change', renderStocks);
    document.getElementById('stock-search')?.addEventListener('input', renderStocks);
    
    renderStockAlertes();
    updateStockStats();
}

// Fonction pour afficher les alertes stock
function renderStockAlertes() {
    const container = document.getElementById('stock-alertes');
    if (!container) return;
    
    const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    const enAlerte = stocks.filter(s => s.quantite <= s.seuilAlerte && s.quantite > 0);
    const epuises = stocks.filter(s => s.quantite === 0);
    
    if (enAlerte.length === 0 && epuises.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-4">Aucune alerte</p>';
        return;
    }
    
    container.innerHTML = [
        ...epuises.map(s => `
            <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div class="flex items-center">
                    <span class="material-icons text-red-500 mr-2">error</span>
                    <div>
                        <span class="font-medium text-red-800">${s.nom}</span>
                        <span class="text-red-600 text-sm ml-2">ÉPUISÉ</span>
                    </div>
                </div>
                <button onclick="editStock(${stocks.indexOf(s)})" class="text-red-600 hover:text-red-800">
                    <span class="material-icons">add_shopping_cart</span>
                </button>
            </div>
        `),
        ...enAlerte.map(s => `
            <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div class="flex items-center">
                    <span class="material-icons text-yellow-500 mr-2">warning</span>
                    <div>
                        <span class="font-medium text-yellow-800">${s.nom}</span>
                        <span class="text-yellow-600 text-sm ml-2">${s.quantite} ${s.unite} restants</span>
                    </div>
                </div>
                <button onclick="editStock(${stocks.indexOf(s)})" class="text-yellow-600 hover:text-yellow-800">
                    <span class="material-icons">add_shopping_cart</span>
                </button>
            </div>
        `)
    ].join('');
}

function updateStockStats() {
    const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    
    const totalEl = document.getElementById('stocks-total');
    const alerteEl = document.getElementById('stocks-alerte');
    const valeurEl = document.getElementById('stocks-valeur');
    
    const enAlerte = stocks.filter(s => s.quantite <= s.seuilAlerte);
    const valeurTotale = stocks.reduce((s, item) => s + (item.quantite * item.prixUnitaire), 0);
    
    if (totalEl) totalEl.textContent = stocks.length;
    if (alerteEl) {
        alerteEl.textContent = enAlerte.length;
        alerteEl.className = enAlerte.length > 0 ? 'text-3xl font-bold text-red-600' : 'text-3xl font-bold text-green-600';
    }
    if (valeurEl) valeurEl.textContent = valeurTotale.toLocaleString('fr-FR') + ' FCFA';
}

function renderStocks() {
    const container = document.getElementById('stocks-list');
    const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    
    // Filtres
    const search = document.getElementById('stock-search')?.value?.toLowerCase() || '';
    const filterCat = document.getElementById('stock-filter-categorie')?.value || 'all';
    const filterAlerte = document.getElementById('stock-filter-alerte')?.value || 'all';
    
    let filtered = stocks;
    
    if (search) {
        filtered = filtered.filter(s => 
            s.nom.toLowerCase().includes(search) ||
            (s.reference && s.reference.toLowerCase().includes(search)) ||
            (s.fournisseur && s.fournisseur.toLowerCase().includes(search))
        );
    }
    
    if (filterCat !== 'all') {
        filtered = filtered.filter(s => s.categorie === filterCat);
    }
    
    if (filterAlerte === 'alerte') {
        filtered = filtered.filter(s => s.quantite <= s.seuilAlerte);
    } else if (filterAlerte === 'rupture') {
        filtered = filtered.filter(s => s.quantite === 0);
    }
    
    // Trier par nom
    filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <span class="material-icons text-6xl text-gray-300 mb-4">inventory_2</span>
                <p class="text-gray-500">${search || filterCat !== 'all' || filterAlerte !== 'all' ? 'Aucun article trouvé' : 'Aucun article en stock'}</p>
            </div>
        `;
        return;
    }
    
    const catColors = {
        'materiaux': 'bg-orange-500',
        'outillage': 'bg-blue-500',
        'equipement': 'bg-purple-500',
        'consommable': 'bg-green-500',
        'securite': 'bg-red-500',
        'autre': 'bg-gray-500'
    };
    
    const catLabels = {
        'materiaux': 'Matériaux',
        'outillage': 'Outillage',
        'equipement': 'Équipement',
        'consommable': 'Consommable',
        'securite': 'Sécurité',
        'autre': 'Autre'
    };
    
    container.innerHTML = filtered.map((s, i) => {
        const globalIndex = stocks.indexOf(s);
        const enAlerte = s.quantite <= s.seuilAlerte;
        const enRupture = s.quantite === 0;
        const valeur = s.quantite * s.prixUnitaire;
        
        return `
            <div class="bg-white rounded-xl shadow-sm border ${enRupture ? 'border-red-300 bg-red-50' : enAlerte ? 'border-orange-300 bg-orange-50' : 'border-gray-100'} hover:shadow-md transition overflow-hidden">
                <div class="p-5">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center">
                            <div class="w-10 h-10 rounded-lg ${catColors[s.categorie] || 'bg-gray-500'} flex items-center justify-center text-white mr-3">
                                <span class="material-icons">${s.categorie === 'materiaux' ? 'construction' : s.categorie === 'outillage' ? 'build' : s.categorie === 'equipement' ? 'precision_manufacturing' : s.categorie === 'securite' ? 'health_and_safety' : 'inventory_2'}</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800">${s.nom}</h4>
                                ${s.reference ? `<p class="text-xs text-gray-500">Réf: ${s.reference}</p>` : ''}
                            </div>
                        </div>
                        ${enRupture ? `
                            <span class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">RUPTURE</span>
                        ` : enAlerte ? `
                            <span class="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">Stock bas</span>
                        ` : ''}
                    </div>
                    
                    <div class="flex items-center justify-between mb-4">
                        <div class="text-center">
                            <p class="text-3xl font-bold ${enRupture ? 'text-red-600' : enAlerte ? 'text-orange-600' : 'text-gray-800'}">${s.quantite}</p>
                            <p class="text-xs text-gray-500">${s.unite}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-500">Valeur stock</p>
                            <p class="font-bold text-blue-600">${valeur.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                    </div>
                    
                    <div class="text-sm text-gray-500 space-y-1 mb-3">
                        <p><span class="material-icons text-xs align-middle">sell</span> ${s.prixUnitaire.toLocaleString('fr-FR')} FCFA / ${s.unite}</p>
                        ${s.emplacement ? `<p><span class="material-icons text-xs align-middle">location_on</span> ${s.emplacement}</p>` : ''}
                        ${s.fournisseur ? `<p><span class="material-icons text-xs align-middle">local_shipping</span> ${s.fournisseur}</p>` : ''}
                        <p><span class="material-icons text-xs align-middle">warning</span> Seuil alerte: ${s.seuilAlerte} ${s.unite}</p>
                    </div>
                </div>
                
                <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                    <button onclick="ajouterStock(${globalIndex})" class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                        <span class="material-icons text-sm align-middle">add</span> Entrée
                    </button>
                    <button onclick="retirerStock(${globalIndex})" class="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200">
                        <span class="material-icons text-sm align-middle">remove</span> Sortie
                    </button>
                    <button onclick="viewStockHistory(${globalIndex})" class="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                        <span class="material-icons text-sm align-middle">history</span>
                    </button>
                    <button onclick="editStock(${globalIndex})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                        <span class="material-icons text-sm align-middle">edit</span>
                    </button>
                    <button onclick="deleteStock(${globalIndex})" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                        <span class="material-icons text-sm align-middle">delete</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.editStock = function(index) {
    openStockModal(index);
};

window.deleteStock = function(index) {
    if (confirm('Supprimer cet article du stock ?')) {
        const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
        const s = stocks[index];
        stocks.splice(index, 1);
        localStorage.setItem('stocks', JSON.stringify(stocks));
        renderStocks();
        updateStockStats();
        showNotification('Article supprimé', `${s.nom} a été supprimé`, 'warning');
    }
};

window.ajouterStock = function(index) {
    const quantite = prompt('Quantité à ajouter:');
    if (!quantite || isNaN(quantite) || parseInt(quantite) <= 0) return;
    
    const motif = prompt('Motif (optionnel):', 'Réapprovisionnement') || 'Réapprovisionnement';
    
    const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    stocks[index].quantite += parseInt(quantite);
    stocks[index].updatedAt = new Date().toISOString();
    
    if (!stocks[index].mouvements) stocks[index].mouvements = [];
    stocks[index].mouvements.unshift({
        type: 'entree',
        quantite: parseInt(quantite),
        date: new Date().toISOString(),
        motif: motif
    });
    
    localStorage.setItem('stocks', JSON.stringify(stocks));
    renderStocks();
    updateStockStats();
    showNotification('Stock ajouté', `+${quantite} ${stocks[index].unite} de ${stocks[index].nom}`, 'success');
};

window.retirerStock = function(index) {
    const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    const s = stocks[index];
    
    const quantite = prompt(`Quantité à retirer (disponible: ${s.quantite} ${s.unite}):`);
    if (!quantite || isNaN(quantite) || parseInt(quantite) <= 0) return;
    
    if (parseInt(quantite) > s.quantite) {
        showNotification('Erreur', `Stock insuffisant (disponible: ${s.quantite})`, 'error');
        return;
    }
    
    const motif = prompt('Motif:', 'Utilisation chantier') || 'Utilisation chantier';
    
    stocks[index].quantite -= parseInt(quantite);
    stocks[index].updatedAt = new Date().toISOString();
    
    if (!stocks[index].mouvements) stocks[index].mouvements = [];
    stocks[index].mouvements.unshift({
        type: 'sortie',
        quantite: parseInt(quantite),
        date: new Date().toISOString(),
        motif: motif
    });
    
    localStorage.setItem('stocks', JSON.stringify(stocks));
    renderStocks();
    updateStockStats();
    showNotification('Stock retiré', `-${quantite} ${s.unite} de ${s.nom}`, 'warning');
    
    // Alerte si stock bas
    if (stocks[index].quantite <= stocks[index].seuilAlerte) {
        showNotification('⚠️ Stock bas', `${s.nom}: seulement ${stocks[index].quantite} ${s.unite} restants`, 'error');
    }
};

window.viewStockHistory = function(index) {
    const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    const s = stocks[index];
    const mouvements = s.mouvements || [];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto p-6">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">Historique - ${s.nom}</h2>
                    <p class="text-sm text-gray-500">Stock actuel: ${s.quantite} ${s.unite}</p>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="p-2 hover:bg-gray-100 rounded-full">
                    <span class="material-icons">close</span>
                </button>
            </div>
            
            ${mouvements.length === 0 ? `
                <div class="text-center py-8">
                    <span class="material-icons text-4xl text-gray-300 mb-2">history</span>
                    <p class="text-gray-500">Aucun mouvement enregistré</p>
                </div>
            ` : `
                <div class="space-y-3">
                    ${mouvements.slice(0, 20).map(m => `
                        <div class="flex items-center p-3 rounded-xl ${m.type === 'entree' ? 'bg-green-50' : 'bg-red-50'}">
                            <div class="w-10 h-10 rounded-full ${m.type === 'entree' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center mr-3">
                                <span class="material-icons ${m.type === 'entree' ? 'text-green-600' : 'text-red-600'}">
                                    ${m.type === 'entree' ? 'add' : 'remove'}
                                </span>
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start">
                                    <span class="font-semibold ${m.type === 'entree' ? 'text-green-700' : 'text-red-700'}">
                                        ${m.type === 'entree' ? '+' : '-'}${m.quantite} ${s.unite}
                                    </span>
                                    <span class="text-xs text-gray-400">${new Date(m.date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <p class="text-sm text-gray-600">${m.motif || 'Non spécifié'}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${mouvements.length > 20 ? `<p class="text-center text-sm text-gray-400 mt-4">Et ${mouvements.length - 20} autres mouvements...</p>` : ''}
            `}
        </div>
    `;
    document.body.appendChild(modal);
};

// ===================================================
// MODULE: DOCUMENTS
// ===================================================
function initDocuments() {
    renderDocuments();
    renderCustomTemplates(); // Afficher les modèles personnalisés
    
    const form = document.getElementById('document-form');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('document-file');
        const file = fileInput.files[0];
        
        if (!file) {
            showNotification('Erreur', 'Veuillez sélectionner un fichier', 'error');
            return;
        }
        
        // Vérifier la taille (max 5MB pour localStorage)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Erreur', 'Le fichier est trop volumineux (max 5MB)', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(evt) {
            const documents = JSON.parse(localStorage.getItem('documents') || '[]');
            
            const doc = {
                nom: document.getElementById('document-nom').value || file.name,
                categorie: document.getElementById('document-categorie').value,
                description: document.getElementById('document-description')?.value || '',
                fichier: {
                    nom: file.name,
                    type: file.type,
                    taille: file.size,
                    data: evt.target.result
                },
                tags: document.getElementById('document-tags')?.value?.split(',').map(t => t.trim()).filter(t => t) || [],
                createdAt: new Date().toISOString()
            };
            
            documents.push(doc);
            localStorage.setItem('documents', JSON.stringify(documents));
            
            form.reset();
            renderDocuments();
            updateDocumentStats();
            showNotification('Document ajouté', `${doc.nom} a été enregistré`, 'success');
        };
        
        reader.onerror = function() {
            showNotification('Erreur', 'Impossible de lire le fichier', 'error');
        };
        
        reader.readAsDataURL(file);
    });
    
    // Filtres
    document.getElementById('document-filter-categorie')?.addEventListener('change', renderDocuments);
    document.getElementById('document-search')?.addEventListener('input', renderDocuments);
    
    updateDocumentStats();
}

function updateDocumentStats() {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    
    const totalEl = document.getElementById('documents-total');
    const tailleEl = document.getElementById('documents-taille');
    
    const tailleTotale = documents.reduce((s, d) => s + (d.fichier?.taille || 0), 0);
    
    if (totalEl) totalEl.textContent = documents.length;
    if (tailleEl) tailleEl.textContent = formatFileSize(tailleTotale);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function renderDocuments() {
    const container = document.getElementById('documents-list');
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    
    // Filtres
    const search = document.getElementById('document-search')?.value?.toLowerCase() || '';
    const filterCat = document.getElementById('document-filter-categorie')?.value || 'all';
    
    let filtered = documents;
    
    if (search) {
        filtered = filtered.filter(d => 
            d.nom.toLowerCase().includes(search) ||
            (d.description && d.description.toLowerCase().includes(search)) ||
            (d.tags && d.tags.some(t => t.toLowerCase().includes(search))) ||
            (d.fichier?.nom && d.fichier.nom.toLowerCase().includes(search))
        );
    }
    
    if (filterCat !== 'all') {
        filtered = filtered.filter(d => d.categorie === filterCat);
    }
    
    // Trier par date décroissante
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <span class="material-icons text-6xl text-gray-300 mb-4">folder_open</span>
                <p class="text-gray-500">${search || filterCat !== 'all' ? 'Aucun document trouvé' : 'Aucun document enregistré'}</p>
            </div>
        `;
        return;
    }
    
    const catColors = {
        'administratif': 'bg-blue-500',
        'technique': 'bg-orange-500',
        'commercial': 'bg-green-500',
        'juridique': 'bg-red-500',
        'comptable': 'bg-purple-500',
        'projet': 'bg-yellow-500',
        'autre': 'bg-gray-500'
    };
    
    const catLabels = {
        'administratif': 'Administratif',
        'technique': 'Technique',
        'commercial': 'Commercial',
        'juridique': 'Juridique',
        'comptable': 'Comptable',
        'projet': 'Projet',
        'autre': 'Autre'
    };
    
    const getFileIcon = (type) => {
        if (!type) return 'description';
        if (type.includes('pdf')) return 'picture_as_pdf';
        if (type.includes('image')) return 'image';
        if (type.includes('word') || type.includes('document')) return 'article';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'table_chart';
        if (type.includes('powerpoint') || type.includes('presentation')) return 'slideshow';
        if (type.includes('zip') || type.includes('rar')) return 'folder_zip';
        if (type.includes('video')) return 'movie';
        if (type.includes('audio')) return 'audio_file';
        return 'description';
    };
    
    container.innerHTML = filtered.map((d, i) => {
        const globalIndex = documents.indexOf(d);
        const fileIcon = getFileIcon(d.fichier?.type);
        const isImage = d.fichier?.type?.includes('image');
        const isPdf = d.fichier?.type?.includes('pdf');
        
        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden">
                ${isImage ? `
                    <div class="h-40 bg-gray-100 overflow-hidden">
                        <img src="${d.fichier.data}" alt="${d.nom}" class="w-full h-full object-cover">
                    </div>
                ` : `
                    <div class="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span class="material-icons text-6xl ${catColors[d.categorie] ? 'text-' + catColors[d.categorie].replace('bg-', '') : 'text-gray-400'}">${fileIcon}</span>
                    </div>
                `}
                
                <div class="p-4">
                    <div class="flex items-start justify-between mb-2">
                        <span class="text-xs px-2 py-1 rounded-full ${catColors[d.categorie] || 'bg-gray-500'} text-white">
                            ${catLabels[d.categorie] || d.categorie}
                        </span>
                        <span class="text-xs text-gray-400">${formatFileSize(d.fichier?.taille || 0)}</span>
                    </div>
                    
                    <h4 class="font-bold text-gray-800 mb-1 line-clamp-1" title="${d.nom}">${d.nom}</h4>
                    <p class="text-xs text-gray-500 mb-2">${d.fichier?.nom || 'Fichier'}</p>
                    
                    ${d.description ? `<p class="text-sm text-gray-600 mb-2 line-clamp-2">${d.description}</p>` : ''}
                    
                    ${d.tags && d.tags.length > 0 ? `
                        <div class="flex flex-wrap gap-1 mb-3">
                            ${d.tags.slice(0, 3).map(t => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">${t}</span>`).join('')}
                            ${d.tags.length > 3 ? `<span class="text-xs text-gray-400">+${d.tags.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                    
                    <p class="text-xs text-gray-400 mb-3">
                        <span class="material-icons text-xs align-middle">calendar_today</span>
                        ${new Date(d.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    
                    <div class="flex gap-2">
                        ${isImage || isPdf ? `
                            <button onclick="viewDocument(${globalIndex})" class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                                <span class="material-icons text-sm align-middle">visibility</span> Voir
                            </button>
                        ` : ''}
                        <button onclick="downloadDocument(${globalIndex})" class="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                            <span class="material-icons text-sm align-middle">download</span> Télécharger
                        </button>
                        <button onclick="deleteDocument(${globalIndex})" class="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                            <span class="material-icons text-sm align-middle">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.viewDocument = function(index) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const d = documents[index];
    
    // Si c'est un document HTML généré (contrat, bail, devis)
    if (d.contenuHTML) {
        const previewWindow = window.open('', '_blank', 'width=900,height=700');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${d.nom}</title>
                <style>
                    body { margin: 0; padding: 20px; background: #f0f0f0; font-family: 'Segoe UI', Arial, sans-serif; }
                    .document-professionnel { box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                    .no-print { margin-top: 20px; text-align: center; }
                    .no-print button { 
                        padding: 12px 30px; 
                        margin: 5px;
                        border: none; 
                        border-radius: 8px; 
                        cursor: pointer; 
                        font-size: 14px;
                        font-weight: 600;
                    }
                    .btn-print { background: #3b82f6; color: white; }
                    .btn-print:hover { background: #2563eb; }
                    .btn-pdf { background: #ef4444; color: white; }
                    .btn-pdf:hover { background: #dc2626; }
                    @media print { 
                        body { background: white; padding: 0; }
                        .document-professionnel { box-shadow: none; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${d.contenuHTML}
                <div class="no-print">
                    <button class="btn-print" onclick="window.print()">🖨️ Imprimer</button>
                    <button class="btn-pdf" onclick="alert('Pour sauvegarder en PDF, utilisez Imprimer > Enregistrer en PDF')">📄 Sauvegarder PDF</button>
                </div>
            </body>
            </html>
        `);
        return;
    }
    
    // Si c'est un fichier uploadé
    if (!d.fichier?.data) {
        showNotification('Erreur', 'Fichier non disponible', 'error');
        return;
    }
    
    const isImage = d.fichier?.type?.includes('image');
    const isPdf = d.fichier?.type?.includes('pdf');
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div class="flex justify-between items-center p-4 border-b">
                <h2 class="text-lg font-bold text-gray-800">${d.nom}</h2>
                <div class="flex gap-2">
                    <button onclick="downloadDocument(${index})" class="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                        <span class="material-icons text-sm align-middle">download</span> Télécharger
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="p-2 hover:bg-gray-100 rounded-full">
                        <span class="material-icons">close</span>
                    </button>
                </div>
            </div>
            <div class="p-4">
                ${isImage ? `
                    <img src="${d.fichier.data}" alt="${d.nom}" class="max-w-full max-h-[70vh] mx-auto rounded-lg">
                ` : isPdf ? `
                    <iframe src="${d.fichier.data}" class="w-full h-[70vh] rounded-lg border"></iframe>
                ` : `
                    <div class="text-center py-12">
                        <span class="material-icons text-6xl text-gray-300 mb-4">description</span>
                        <p class="text-gray-500">Aperçu non disponible pour ce type de fichier</p>
                        <button onclick="downloadDocument(${index})" class="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                            Télécharger le fichier
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Fermer en cliquant sur le fond
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });
};

window.downloadDocument = function(index) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const d = documents[index];
    
    // Si c'est un document HTML généré
    if (d.contenuHTML) {
        // Créer un fichier HTML à télécharger
        const blob = new Blob([`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${d.nom}</title>
            </head>
            <body>
                ${d.contenuHTML}
            </body>
            </html>
        `], { type: 'text/html' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${d.numero || d.nom}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Téléchargement', `${d.nom} téléchargé`, 'success');
        return;
    }
    
    if (!d.fichier?.data) {
        showNotification('Erreur', 'Fichier non disponible', 'error');
        return;
    }
    
    const a = document.createElement('a');
    a.href = d.fichier.data;
    a.download = d.fichier.nom || d.nom;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification('Téléchargement', `${d.nom} téléchargé`, 'success');
};

window.deleteDocument = function(index) {
    if (confirm('Supprimer ce document ?')) {
        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        const d = documents[index];
        documents.splice(index, 1);
        localStorage.setItem('documents', JSON.stringify(documents));
        renderDocuments();
        updateDocumentStats();
        showNotification('Document supprimé', `${d.nom} a été supprimé`, 'warning');
    }
};

// ===================================================
// FONCTIONS UTILITAIRES COMPTABILITÉ (MODAL)
// ===================================================
window.openTransactionModal = function(type) {
    const modal = document.getElementById('transaction-modal');
    const title = document.getElementById('transaction-modal-title');
    const header = document.getElementById('trans-modal-header');
    const typeInput = document.getElementById('trans-type');
    const categorieSelect = document.getElementById('trans-categorie');
    const projetSelect = document.getElementById('trans-projet');
    const dateInput = document.getElementById('trans-date');
    const submitBtn = document.getElementById('trans-submit-btn');
    
    if (!modal) return;
    
    // Charger les projets
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    if (projetSelect) {
        projetSelect.innerHTML = '<option value="">-- Aucun projet --</option>' + 
            projets.map(p => `<option value="${p.id || p.nom}">${p.nom}</option>`).join('');
    }
    
    // Charger le sélecteur de clients pour auto-remplissage
    populateClientSelector('trans-client-select');
    
    // Configurer le modal selon le type
    if (type === 'revenu') {
        title.textContent = 'Nouveau revenu';
        header.className = 'sticky top-0 z-10 px-6 py-4 border-b bg-gradient-to-r from-green-600 to-green-800';
        submitBtn.className = 'px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition shadow-lg';
        submitBtn.innerHTML = '<span class="material-icons align-middle text-sm mr-1">add_circle</span>Ajouter le revenu';
        categorieSelect.innerHTML = `
            <option value="vente">Vente immobilière</option>
            <option value="location">Loyer / Location</option>
            <option value="commission">Commission</option>
            <option value="renovation">Travaux de rénovation</option>
            <option value="gestion">Frais de gestion locative</option>
            <option value="service">Prestation de service</option>
            <option value="avance">Avance / Acompte reçu</option>
            <option value="remboursement">Remboursement reçu</option>
            <option value="autre">Autre recette</option>
        `;
    } else {
        title.textContent = 'Nouvelle dépense';
        header.className = 'sticky top-0 z-10 px-6 py-4 border-b bg-gradient-to-r from-red-600 to-red-800';
        submitBtn.className = 'px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition shadow-lg';
        submitBtn.innerHTML = '<span class="material-icons align-middle text-sm mr-1">remove_circle</span>Ajouter la dépense';
        categorieSelect.innerHTML = `
            <option value="materiel">Matériaux de construction</option>
            <option value="main-oeuvre">Main d'œuvre</option>
            <option value="salaire">Salaires</option>
            <option value="loyer">Loyer bureau/local</option>
            <option value="charges">Charges (eau, électricité)</option>
            <option value="transport">Transport / Carburant</option>
            <option value="marketing">Marketing / Publicité</option>
            <option value="fournitures">Fournitures de bureau</option>
            <option value="equipement">Équipement / Outillage</option>
            <option value="sous-traitance">Sous-traitance</option>
            <option value="assurance">Assurance</option>
            <option value="impots">Impôts et taxes</option>
            <option value="frais-bancaires">Frais bancaires</option>
            <option value="autre">Autre dépense</option>
        `;
    }
    
    typeInput.value = type === 'revenu' ? 'recette' : 'depense';
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Reset tous les champs
    document.getElementById('trans-edit-id').value = '';
    document.getElementById('trans-desc').value = '';
    document.getElementById('trans-montant').value = '';
    document.getElementById('trans-notes').value = '';
    document.getElementById('trans-reference')?.value && (document.getElementById('trans-reference').value = '');
    document.getElementById('trans-facture')?.value && (document.getElementById('trans-facture').value = '');
    document.getElementById('trans-tiers')?.value && (document.getElementById('trans-tiers').value = '');
    document.getElementById('trans-tva')?.value && (document.getElementById('trans-tva').value = '0');
    document.getElementById('trans-statut')?.value && (document.getElementById('trans-statut').value = 'effectue');
    document.getElementById('trans-justificatif')?.checked && (document.getElementById('trans-justificatif').checked = false);
    // Reset client selector
    if (document.getElementById('trans-client-select')) document.getElementById('trans-client-select').value = '';
    
    // Reset mode paiement
    const especes = document.querySelector('input[name="trans-mode-paiement"][value="especes"]');
    if (especes) especes.checked = true;
    
    modal.classList.remove('hidden');
    
    // Gérer affichage détails chèque
    document.querySelectorAll('input[name="trans-mode-paiement"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const chequeDetails = document.getElementById('trans-cheque-details');
            if (chequeDetails) {
                chequeDetails.classList.toggle('hidden', this.value !== 'cheque');
            }
        });
    });
};

window.closeTransactionModal = function() {
    const modal = document.getElementById('transaction-modal');
    if (modal) modal.classList.add('hidden');
};

// ===================================================
// FONCTIONS MODALS - EMPLOYÉS
// ===================================================
window.openEmployeModal = function(index = null) {
    const modal = document.getElementById('employe-modal');
    const title = document.getElementById('employe-modal-title');
    const form = document.getElementById('employe-form');
    
    if (!modal) return;
    
    // Reset le formulaire
    form.reset();
    document.getElementById('employe-edit-id').value = '';
    
    // Date embauche par défaut = aujourd'hui
    const dateEmbauche = document.getElementById('employe-embauche');
    if (dateEmbauche) dateEmbauche.value = new Date().toISOString().split('T')[0];
    
    // Valeurs par défaut
    if (document.getElementById('employe-nationalite')) {
        document.getElementById('employe-nationalite').value = 'Sénégalaise';
    }
    
    if (index !== null) {
        // Mode édition
        title.textContent = 'Modifier l\'employé';
        const employes = JSON.parse(localStorage.getItem('employes') || '[]');
        const e = employes[index];
        
        if (e) {
            document.getElementById('employe-edit-id').value = e.matricule || index;
            
            // Remplir les champs
            if (document.getElementById('employe-civilite')) document.getElementById('employe-civilite').value = e.civilite || 'M.';
            if (document.getElementById('employe-prenom')) document.getElementById('employe-prenom').value = e.prenom || '';
            if (document.getElementById('employe-nom')) document.getElementById('employe-nom').value = e.nom || '';
            if (document.getElementById('employe-naissance')) document.getElementById('employe-naissance').value = e.dateNaissance || '';
            if (document.getElementById('employe-lieu-naissance')) document.getElementById('employe-lieu-naissance').value = e.lieuNaissance || '';
            if (document.getElementById('employe-cni')) document.getElementById('employe-cni').value = e.cni || '';
            if (document.getElementById('employe-nationalite')) document.getElementById('employe-nationalite').value = e.nationalite || 'Sénégalaise';
            if (document.getElementById('employe-tel')) document.getElementById('employe-tel').value = e.telephone || '';
            if (document.getElementById('employe-email')) document.getElementById('employe-email').value = e.email || '';
            if (document.getElementById('employe-adresse')) document.getElementById('employe-adresse').value = e.adresse || '';
            if (document.getElementById('employe-urgence-nom')) document.getElementById('employe-urgence-nom').value = e.contactUrgenceNom || '';
            if (document.getElementById('employe-urgence-tel')) document.getElementById('employe-urgence-tel').value = e.contactUrgenceTel || '';
            if (document.getElementById('employe-matricule')) document.getElementById('employe-matricule').value = e.matricule || '';
            if (document.getElementById('employe-departement')) document.getElementById('employe-departement').value = e.departement || '';
            if (document.getElementById('employe-poste')) document.getElementById('employe-poste').value = e.poste || '';
            if (document.getElementById('employe-contrat')) document.getElementById('employe-contrat').value = e.contrat || 'cdi';
            if (document.getElementById('employe-embauche')) document.getElementById('employe-embauche').value = e.dateEmbauche || '';
            if (document.getElementById('employe-fin-contrat')) document.getElementById('employe-fin-contrat').value = e.finContrat || '';
            if (document.getElementById('employe-salaire')) document.getElementById('employe-salaire').value = e.salaire || 0;
            if (document.getElementById('employe-mode-paiement')) document.getElementById('employe-mode-paiement').value = e.modePaiement || 'virement';
            if (document.getElementById('employe-statut')) document.getElementById('employe-statut').value = e.statut || 'actif';
            if (document.getElementById('employe-notes')) document.getElementById('employe-notes').value = e.notes || '';
        }
    } else {
        title.textContent = 'Nouvel employé';
    }
    
    modal.classList.remove('hidden');
};

window.closeEmployeModal = function() {
    const modal = document.getElementById('employe-modal');
    if (modal) modal.classList.add('hidden');
};

// ===================================================
// FONCTIONS MODALS - STOCKS
// ===================================================
window.openStockModal = function(index = null) {
    const modal = document.getElementById('stock-modal');
    const title = document.getElementById('stock-modal-title');
    const form = document.getElementById('stock-form');
    
    if (!modal) return;
    
    // Reset le formulaire
    form.reset();
    document.getElementById('stock-edit-index').value = '';
    
    // Valeurs par défaut
    if (document.getElementById('stock-seuil')) document.getElementById('stock-seuil').value = '5';
    if (document.getElementById('stock-tva')) document.getElementById('stock-tva').value = '18';
    
    if (index !== null) {
        // Mode édition
        title.textContent = 'Modifier l\'article';
        const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
        const s = stocks[index];
        
        if (s) {
            document.getElementById('stock-edit-index').value = index;
            
            // Remplir les champs
            if (document.getElementById('stock-reference')) document.getElementById('stock-reference').value = s.reference || '';
            if (document.getElementById('stock-categorie')) document.getElementById('stock-categorie').value = s.categorie || '';
            if (document.getElementById('stock-nom')) document.getElementById('stock-nom').value = s.nom || '';
            if (document.getElementById('stock-description')) document.getElementById('stock-description').value = s.description || '';
            if (document.getElementById('stock-quantite')) document.getElementById('stock-quantite').value = s.quantite || 0;
            if (document.getElementById('stock-unite')) document.getElementById('stock-unite').value = s.unite || 'pcs';
            if (document.getElementById('stock-seuil')) document.getElementById('stock-seuil').value = s.seuilAlerte || 5;
            if (document.getElementById('stock-emplacement')) document.getElementById('stock-emplacement').value = s.emplacement || '';
            if (document.getElementById('stock-prix-achat')) document.getElementById('stock-prix-achat').value = s.prixAchat || 0;
            if (document.getElementById('stock-prix')) document.getElementById('stock-prix').value = s.prixUnitaire || 0;
            if (document.getElementById('stock-tva')) document.getElementById('stock-tva').value = s.tva || 18;
            if (document.getElementById('stock-fournisseur')) document.getElementById('stock-fournisseur').value = s.fournisseur || '';
            if (document.getElementById('stock-fournisseur-tel')) document.getElementById('stock-fournisseur-tel').value = s.fournisseurTel || '';
            if (document.getElementById('stock-delai')) document.getElementById('stock-delai').value = s.delaiLivraison || 0;
            if (document.getElementById('stock-notes')) document.getElementById('stock-notes').value = s.notes || '';
        }
    } else {
        title.textContent = 'Nouvel article';
    }
    
    modal.classList.remove('hidden');
};

window.closeStockModal = function() {
    const modal = document.getElementById('stock-modal');
    if (modal) modal.classList.add('hidden');
};

// ===================================================
// FONCTIONS MODALS - PROJETS
// ===================================================
window.openProjetModal = function(index = null) {
    const modal = document.getElementById('projet-modal');
    const title = document.getElementById('projet-modal-title');
    const form = document.getElementById('projet-form');
    
    if (!modal) return;
    
    // Reset le formulaire
    form.reset();
    document.getElementById('projet-edit-index').value = '';
    
    // Charger les clients avec le sélecteur amélioré
    populateClientSelector('projet-client');
    
    // Ajouter le listener pour auto-remplissage quand on change de client
    const clientSelect = document.getElementById('projet-client');
    if (clientSelect) {
        clientSelect.onchange = function() {
            if (this.value) {
                fillClientInfo(this.value, 'projet');
            }
        };
    }
    
    // Charger les employés pour chef de chantier
    const employes = JSON.parse(localStorage.getItem('employes') || '[]');
    const chefSelect = document.getElementById('projet-chef');
    if (chefSelect) {
        chefSelect.innerHTML = '<option value="">-- Sélectionner --</option>';
        employes.filter(e => e.statut === 'actif').forEach((e, i) => {
            chefSelect.innerHTML += `<option value="${e.matricule || i}">${e.prenom} ${e.nom}</option>`;
        });
    }
    
    // Valeurs par défaut
    if (document.getElementById('projet-avancement')) {
        document.getElementById('projet-avancement').value = 0;
        document.getElementById('projet-avancement-val').textContent = '0%';
    }
    
    if (index !== null) {
        // Mode édition
        title.innerHTML = '<span class="material-icons mr-2">edit</span>Modifier le projet';
        const projets = JSON.parse(localStorage.getItem('projets') || '[]');
        const p = projets[index];
        
        if (p) {
            document.getElementById('projet-edit-index').value = index;
            
            // Remplir les champs
            if (document.getElementById('projet-nom')) document.getElementById('projet-nom').value = p.nom || '';
            if (document.getElementById('projet-reference')) document.getElementById('projet-reference').value = p.reference || '';
            if (document.getElementById('projet-type')) document.getElementById('projet-type').value = p.type || 'renovation';
            if (document.getElementById('projet-client')) document.getElementById('projet-client').value = p.clientIndex || '';
            if (document.getElementById('projet-adresse')) document.getElementById('projet-adresse').value = p.adresse || '';
            if (document.getElementById('projet-ville')) document.getElementById('projet-ville').value = p.ville || 'Dakar';
            if (document.getElementById('projet-surface')) document.getElementById('projet-surface').value = p.surface || '';
            if (document.getElementById('projet-debut')) document.getElementById('projet-debut').value = p.dateDebut || '';
            if (document.getElementById('projet-fin')) document.getElementById('projet-fin').value = p.dateFin || '';
            if (document.getElementById('projet-avancement')) {
                document.getElementById('projet-avancement').value = p.avancement || 0;
                document.getElementById('projet-avancement-val').textContent = (p.avancement || 0) + '%';
            }
            if (document.getElementById('projet-budget')) document.getElementById('projet-budget').value = p.budget || '';
            if (document.getElementById('projet-depense')) document.getElementById('projet-depense').value = p.depense || '';
            if (document.getElementById('projet-marge')) document.getElementById('projet-marge').value = p.marge || 15;
            if (document.getElementById('projet-acompte')) document.getElementById('projet-acompte').value = p.acompte || '';
            if (document.getElementById('projet-chef')) document.getElementById('projet-chef').value = p.chef || '';
            if (document.getElementById('projet-nb-ouvriers')) document.getElementById('projet-nb-ouvriers').value = p.nbOuvriers || '';
            if (document.getElementById('projet-statut')) document.getElementById('projet-statut').value = p.statut || 'planifie';
            if (document.getElementById('projet-priorite')) document.getElementById('projet-priorite').value = p.priorite || 'normale';
            if (document.getElementById('projet-desc')) document.getElementById('projet-desc').value = p.description || '';
        }
    } else {
        title.innerHTML = '<span class="material-icons mr-2">construction</span>Nouveau projet';
    }
    
    modal.classList.remove('hidden');
};

window.closeProjetModal = function() {
    const modal = document.getElementById('projet-modal');
    if (modal) modal.classList.add('hidden');
};

// ===================================================
// FONCTIONS MODALS - DOCUMENTS
// ===================================================
window.openDocumentModal = function(index = null) {
    const modal = document.getElementById('document-modal');
    const title = document.getElementById('document-modal-title');
    const form = document.getElementById('document-form');
    
    if (!modal) return;
    
    // Reset le formulaire
    form.reset();
    document.getElementById('doc-edit-id').value = '';
    document.getElementById('doc-fichier-nom')?.classList.add('hidden');
    
    // Charger les clients avec le sélecteur amélioré
    populateClientSelector('doc-client');
    
    // Ajouter listener auto-remplissage
    const clientSelect = document.getElementById('doc-client');
    if (clientSelect) {
        clientSelect.onchange = function() {
            if (this.value) {
                fillClientInfo(this.value, 'doc');
            }
        };
    }
    
    // Charger les projets
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    const projetSelect = document.getElementById('doc-projet');
    if (projetSelect) {
        projetSelect.innerHTML = '<option value="">-- Aucun --</option>';
        projets.forEach((p, i) => {
            projetSelect.innerHTML += `<option value="${i}">${p.nom}</option>`;
        });
    }
    
    // Listener pour afficher le nom du fichier
    const fichierInput = document.getElementById('doc-fichier');
    if (fichierInput) {
        fichierInput.onchange = function() {
            const nomEl = document.getElementById('doc-fichier-nom');
            if (this.files[0] && nomEl) {
                nomEl.textContent = '✓ ' + this.files[0].name;
                nomEl.classList.remove('hidden');
            }
        };
    }
    
    if (index !== null) {
        // Mode édition
        title.innerHTML = '<span class="material-icons mr-2">edit</span>Modifier le document';
        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        const d = documents[index];
        
        if (d) {
            document.getElementById('doc-edit-id').value = index;
            if (document.getElementById('doc-titre')) document.getElementById('doc-titre').value = d.titre || '';
            if (document.getElementById('doc-categorie')) document.getElementById('doc-categorie').value = d.categorie || 'autre';
            if (document.getElementById('doc-client')) document.getElementById('doc-client').value = d.clientIndex || '';
            if (document.getElementById('doc-projet')) document.getElementById('doc-projet').value = d.projetIndex || '';
            if (document.getElementById('doc-expiration')) document.getElementById('doc-expiration').value = d.expiration || '';
            if (document.getElementById('doc-notes')) document.getElementById('doc-notes').value = d.notes || '';
        }
    } else {
        title.innerHTML = '<span class="material-icons mr-2">upload_file</span>Nouveau document';
    }
    
    modal.classList.remove('hidden');
};

window.closeDocumentModal = function() {
    const modal = document.getElementById('document-modal');
    if (modal) modal.classList.add('hidden');
};

// ===================================================
// FONCTIONS MODALS - CLIENTS (CRM)
// ===================================================
window.openClientModal = function(index = null) {
    const modal = document.getElementById('client-modal');
    const title = document.getElementById('client-modal-title');
    const form = document.getElementById('client-form');
    
    if (!modal) return;
    
    // Reset le formulaire
    form.reset();
    document.getElementById('client-edit-id').value = '';
    
    // Reset type client
    document.querySelectorAll('input[name="client-type-radio"]').forEach(r => {
        r.checked = r.value === 'particulier';
    });
    document.getElementById('client-type').value = 'particulier';
    document.getElementById('client-particulier-fields')?.classList.remove('hidden');
    document.getElementById('client-entreprise-fields')?.classList.add('hidden');
    
    // Valeurs par défaut
    if (document.getElementById('client-ville')) document.getElementById('client-ville').value = 'Dakar';
    if (document.getElementById('client-pays')) document.getElementById('client-pays').value = 'Sénégal';
    
    // Reset checkboxes services
    document.querySelectorAll('input[name="client-services"]').forEach(cb => cb.checked = false);
    
    if (index !== null) {
        // Mode édition
        title.innerHTML = '<span class="material-icons mr-2">edit</span>Modifier le client';
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const c = clients[index];
        
        if (c) {
            document.getElementById('client-edit-id').value = index;
            
            // Type client
            const type = c.type || 'particulier';
            document.querySelectorAll('input[name="client-type-radio"]').forEach(r => {
                r.checked = r.value === type;
            });
            document.getElementById('client-type').value = type;
            if (type === 'entreprise') {
                document.getElementById('client-particulier-fields')?.classList.add('hidden');
                document.getElementById('client-entreprise-fields')?.classList.remove('hidden');
            }
            
            // Particulier
            if (document.getElementById('client-civilite')) document.getElementById('client-civilite').value = c.civilite || 'M.';
            if (document.getElementById('client-prenom')) document.getElementById('client-prenom').value = c.prenom || '';
            if (document.getElementById('client-nom')) document.getElementById('client-nom').value = c.nom || '';
            if (document.getElementById('client-naissance')) document.getElementById('client-naissance').value = c.dateNaissance || '';
            if (document.getElementById('client-cni')) document.getElementById('client-cni').value = c.cni || '';
            if (document.getElementById('client-profession')) document.getElementById('client-profession').value = c.profession || '';
            
            // Entreprise
            if (document.getElementById('client-raison-sociale')) document.getElementById('client-raison-sociale').value = c.raisonSociale || '';
            if (document.getElementById('client-ninea')) document.getElementById('client-ninea').value = c.ninea || '';
            if (document.getElementById('client-rccm')) document.getElementById('client-rccm').value = c.rccm || '';
            if (document.getElementById('client-secteur')) document.getElementById('client-secteur').value = c.secteur || '';
            if (document.getElementById('client-contact-principal')) document.getElementById('client-contact-principal').value = c.contactPrincipal || '';
            
            // Coordonnées
            if (document.getElementById('client-tel')) document.getElementById('client-tel').value = c.telephone || '';
            if (document.getElementById('client-tel2')) document.getElementById('client-tel2').value = c.telephone2 || '';
            if (document.getElementById('client-email')) document.getElementById('client-email').value = c.email || '';
            if (document.getElementById('client-whatsapp')) document.getElementById('client-whatsapp').value = c.whatsapp || '';
            
            // Adresse
            if (document.getElementById('client-adresse')) document.getElementById('client-adresse').value = c.adresse || '';
            if (document.getElementById('client-ville')) document.getElementById('client-ville').value = c.ville || 'Dakar';
            if (document.getElementById('client-pays')) document.getElementById('client-pays').value = c.pays || 'Sénégal';
            
            // Intérêts
            if (c.services && Array.isArray(c.services)) {
                document.querySelectorAll('input[name="client-services"]').forEach(cb => {
                    cb.checked = c.services.includes(cb.value);
                });
            }
            if (document.getElementById('client-budget')) document.getElementById('client-budget').value = c.budget || '';
            if (document.getElementById('client-source')) document.getElementById('client-source').value = c.source || '';
            
            // Statut
            if (document.getElementById('client-statut')) document.getElementById('client-statut').value = c.statut || 'prospect';
            if (document.getElementById('client-priorite')) document.getElementById('client-priorite').value = c.priorite || 'normale';
            if (document.getElementById('client-notes')) document.getElementById('client-notes').value = c.notes || '';
        }
    } else {
        title.innerHTML = '<span class="material-icons mr-2">person_add</span>Nouveau client';
    }
    
    modal.classList.remove('hidden');
};

window.closeClientModal = function() {
    const modal = document.getElementById('client-modal');
    if (modal) modal.classList.add('hidden');
};

// Toggle type client (particulier / entreprise)
window.toggleClientType = function() {
    const type = document.querySelector('input[name="client-type-radio"]:checked')?.value || 'particulier';
    document.getElementById('client-type').value = type;
    
    const particulierFields = document.getElementById('client-particulier-fields');
    const entrepriseFields = document.getElementById('client-entreprise-fields');
    
    if (type === 'entreprise') {
        particulierFields?.classList.add('hidden');
        entrepriseFields?.classList.remove('hidden');
    } else {
        particulierFields?.classList.remove('hidden');
        entrepriseFields?.classList.add('hidden');
    }
};

// ===================================================
// FONCTIONS MODALS - RDV (RENDEZ-VOUS)
// ===================================================
window.openRdvModal = function(index = null, presetDate = null) {
    const modal = document.getElementById('rdv-modal');
    const title = document.getElementById('rdv-modal-title');
    const form = document.getElementById('rdv-form');
    
    if (!modal) return;
    
    // Reset le formulaire
    form.reset();
    document.getElementById('rdv-edit-index').value = '';
    
    // Charger les clients pour le sélecteur auto-remplissage
    populateClientSelector('rdv-client-select');
    
    // Date par défaut = aujourd'hui ou date présélectionnée
    const dateInput = document.getElementById('rdv-date');
    if (dateInput) {
        dateInput.value = presetDate || new Date().toISOString().split('T')[0];
    }
    
    // Heure par défaut = 9h
    const timeInput = document.getElementById('rdv-time');
    if (timeInput) timeInput.value = '09:00';
    
    if (index !== null) {
        // Mode édition
        title.innerHTML = '<span class="material-icons mr-2">edit</span>Modifier le RDV';
        const rdvs = JSON.parse(localStorage.getItem('rdvs') || '[]');
        const r = rdvs[index];
        
        if (r) {
            document.getElementById('rdv-edit-index').value = index;
            
            // Si le RDV a un clientIndex, le sélectionner
            if (r.clientIndex !== undefined && r.clientIndex !== '') {
                document.getElementById('rdv-client-select').value = r.clientIndex;
            }
            
            if (document.getElementById('rdv-client')) document.getElementById('rdv-client').value = r.client || '';
            if (document.getElementById('rdv-phone')) document.getElementById('rdv-phone').value = r.phone || '';
            if (document.getElementById('rdv-email')) document.getElementById('rdv-email').value = r.email || '';
            if (document.getElementById('rdv-date')) document.getElementById('rdv-date').value = r.date || '';
            if (document.getElementById('rdv-time')) document.getElementById('rdv-time').value = r.time || '';
            if (document.getElementById('rdv-duree')) document.getElementById('rdv-duree').value = r.duree || '60';
            if (document.getElementById('rdv-service')) document.getElementById('rdv-service').value = r.service || 'visite';
            if (document.getElementById('rdv-status')) document.getElementById('rdv-status').value = r.status || 'confirme';
            if (document.getElementById('rdv-lieu')) document.getElementById('rdv-lieu').value = r.lieu || '';
            if (document.getElementById('rdv-notes')) document.getElementById('rdv-notes').value = r.notes || '';
            if (document.getElementById('rdv-rappel')) document.getElementById('rdv-rappel').checked = r.rappel || false;
        }
    } else {
        title.innerHTML = '<span class="material-icons mr-2">event_available</span>Nouveau rendez-vous';
    }
    
    modal.classList.remove('hidden');
};

window.closeRdvModal = function() {
    const modal = document.getElementById('rdv-modal');
    if (modal) modal.classList.add('hidden');
};

// ===================================================
// FONCTIONS MODALS - CATALOGUE (ANNONCES)
// ===================================================
window.openCatalogueModal = function(index = null) {
    const modal = document.getElementById('catalogue-modal');
    const title = document.getElementById('catalogue-modal-title');
    const form = document.getElementById('catalogue-form');
    
    if (!modal) return;
    
    form.reset();
    document.getElementById('catalogue-edit-index').value = '';
    
    // Reset des images
    catalogueTempImages = [];
    catalogueExistingImages = [];
    const previewContainer = document.getElementById('catalogue-images-preview');
    const existingContainer = document.getElementById('catalogue-existing-images');
    if (previewContainer) {
        previewContainer.innerHTML = '';
        previewContainer.classList.add('hidden');
    }
    if (existingContainer) existingContainer.classList.add('hidden');
    
    if (index !== null) {
        title.innerHTML = '<span class="material-icons mr-2">edit</span>Modifier l\'annonce';
        const annonces = JSON.parse(localStorage.getItem('annonces') || '[]');
        const a = annonces[index];
        if (a) {
            document.getElementById('catalogue-edit-index').value = index;
            if (document.getElementById('catalogue-title')) document.getElementById('catalogue-title').value = a.title || '';
            if (document.getElementById('catalogue-desc')) document.getElementById('catalogue-desc').value = a.description || a.desc || '';
            if (document.getElementById('catalogue-price')) document.getElementById('catalogue-price').value = a.price || '';
            if (document.getElementById('catalogue-location')) document.getElementById('catalogue-location').value = a.location || '';
            if (document.getElementById('catalogue-category')) document.getElementById('catalogue-category').value = a.category || 'vente';
            if (document.getElementById('catalogue-type')) document.getElementById('catalogue-type').value = a.type || 'maison';
            if (document.getElementById('catalogue-status')) document.getElementById('catalogue-status').value = a.status || 'actif';
            
            // Charger les images existantes (multi-images ou image unique)
            if (a.images && a.images.length > 0) {
                catalogueExistingImages = [...a.images];
            } else if (a.image) {
                catalogueExistingImages = [a.image];
            }
            renderCatalogueExistingImages();
        }
    } else {
        title.innerHTML = '<span class="material-icons mr-2">home_work</span>Nouvelle annonce';
    }
    
    modal.classList.remove('hidden');
};

window.closeCatalogueModal = function() {
    const modal = document.getElementById('catalogue-modal');
    if (modal) modal.classList.add('hidden');
    // Reset des images temporaires
    catalogueTempImages = [];
    catalogueExistingImages = [];
};

// Nouvelle fonction pour multi-images
window.previewCatalogueImages = function(input) {
    if (input.files && input.files.length > 0) {
        handleCatalogueFiles(input.files);
    }
};

// Galerie d'images (visualisation)
window.openImageGallery = function(annonceIndex) {
    const annonces = JSON.parse(localStorage.getItem('annonces') || '[]');
    const a = annonces[annonceIndex];
    if (!a) return;
    
    const images = a.images || (a.image ? [a.image] : []);
    if (images.length === 0) return;
    
    // Créer le modal de galerie s'il n'existe pas
    let gallery = document.getElementById('image-gallery-modal');
    if (!gallery) {
        gallery = document.createElement('div');
        gallery.id = 'image-gallery-modal';
        gallery.className = 'fixed inset-0 z-[100] hidden bg-black/90 flex items-center justify-center';
        gallery.innerHTML = `
            <button onclick="closeImageGallery()" class="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
                <span class="material-icons text-4xl">close</span>
            </button>
            <button id="gallery-prev" class="absolute left-4 text-white hover:text-gray-300 z-10">
                <span class="material-icons text-4xl">chevron_left</span>
            </button>
            <button id="gallery-next" class="absolute right-4 text-white hover:text-gray-300 z-10">
                <span class="material-icons text-4xl">chevron_right</span>
            </button>
            <img id="gallery-main-image" src="" alt="Image" class="max-h-[80vh] max-w-[90vw] object-contain rounded-lg">
            <div id="gallery-thumbnails" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto p-2"></div>
            <div id="gallery-counter" class="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm"></div>
        `;
        document.body.appendChild(gallery);
    }
    
    let currentIndex = 0;
    const mainImage = document.getElementById('gallery-main-image');
    const thumbnails = document.getElementById('gallery-thumbnails');
    const counter = document.getElementById('gallery-counter');
    
    function showImage(index) {
        currentIndex = index;
        mainImage.src = images[index];
        counter.textContent = `${index + 1} / ${images.length}`;
        
        // Mettre à jour les thumbnails
        thumbnails.querySelectorAll('img').forEach((thumb, i) => {
            thumb.classList.toggle('ring-2', i === index);
            thumb.classList.toggle('ring-white', i === index);
            thumb.classList.toggle('opacity-50', i !== index);
        });
    }
    
    // Générer thumbnails
    thumbnails.innerHTML = images.map((img, i) => `
        <img src="${img}" alt="Thumb ${i+1}" 
            class="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-100 transition ${i === 0 ? 'ring-2 ring-white' : 'opacity-50'}"
            onclick="event.stopPropagation(); document.getElementById('gallery-main-image').src='${img}'; this.parentNode.querySelectorAll('img').forEach((t,j)=>{t.classList.toggle('ring-2',j===${i});t.classList.toggle('ring-white',j===${i});t.classList.toggle('opacity-50',j!==${i});}); document.getElementById('gallery-counter').textContent='${i+1} / ${images.length}';">
    `).join('');
    
    // Navigation
    document.getElementById('gallery-prev').onclick = () => showImage((currentIndex - 1 + images.length) % images.length);
    document.getElementById('gallery-next').onclick = () => showImage((currentIndex + 1) % images.length);
    
    // Afficher/cacher boutons si une seule image
    document.getElementById('gallery-prev').style.display = images.length > 1 ? 'block' : 'none';
    document.getElementById('gallery-next').style.display = images.length > 1 ? 'block' : 'none';
    thumbnails.style.display = images.length > 1 ? 'flex' : 'none';
    
    showImage(0);
    gallery.classList.remove('hidden');
    
    // Fermer avec Escape
    const escHandler = (e) => {
        if (e.key === 'Escape') closeImageGallery();
    };
    document.addEventListener('keydown', escHandler);
    gallery.dataset.escHandler = 'true';
};

window.closeImageGallery = function() {
    const gallery = document.getElementById('image-gallery-modal');
    if (gallery) gallery.classList.add('hidden');
};

// ===================================================
// FONCTIONS MODALS - CAROUSEL (SLIDES)
// ===================================================
window.openCarouselModal = function(index = null) {
    const modal = document.getElementById('carousel-modal');
    const title = document.getElementById('carousel-modal-title');
    const form = document.getElementById('carousel-form');
    
    if (!modal) return;
    
    form.reset();
    document.getElementById('carousel-edit-index').value = '';
    
    if (index !== null) {
        title.innerHTML = '<span class="material-icons mr-2">edit</span>Modifier le slide';
        const slides = JSON.parse(localStorage.getItem('carousel') || '[]');
        const s = slides[index];
        if (s) {
            document.getElementById('carousel-edit-index').value = index;
            if (document.getElementById('carousel-title')) document.getElementById('carousel-title').value = s.title || '';
            if (document.getElementById('carousel-subtitle')) document.getElementById('carousel-subtitle').value = s.subtitle || '';
            if (document.getElementById('carousel-image-url')) document.getElementById('carousel-image-url').value = s.imageUrl || '';
            if (document.getElementById('carousel-link')) document.getElementById('carousel-link').value = s.link || '';
        }
    } else {
        title.innerHTML = '<span class="material-icons mr-2">view_carousel</span>Nouveau slide';
    }
    
    modal.classList.remove('hidden');
};

window.closeCarouselModal = function() {
    const modal = document.getElementById('carousel-modal');
    if (modal) modal.classList.add('hidden');
};

// ===================================================
// FONCTIONS MODALS - TÉMOIGNAGES
// ===================================================
window.openTemoignageModal = function(index = null) {
    const modal = document.getElementById('temoignage-modal');
    const title = document.getElementById('temoignage-modal-title');
    const form = document.getElementById('temoignage-form');
    
    if (!modal) return;
    
    form.reset();
    document.getElementById('temoignage-edit-index').value = '';
    // Reset note to 5 stars
    const note5 = document.querySelector('input[name="temoignage-note"][value="5"]');
    if (note5) note5.checked = true;
    
    if (index !== null) {
        title.innerHTML = '<span class="material-icons mr-2">edit</span>Modifier le témoignage';
        const temoignages = JSON.parse(localStorage.getItem('temoignages') || '[]');
        const t = temoignages[index];
        if (t) {
            document.getElementById('temoignage-edit-index').value = index;
            if (document.getElementById('temoignage-nom')) document.getElementById('temoignage-nom').value = t.nom || '';
            if (document.getElementById('temoignage-fonction')) document.getElementById('temoignage-fonction').value = t.fonction || '';
            if (document.getElementById('temoignage-texte')) document.getElementById('temoignage-texte').value = t.texte || '';
            if (document.getElementById('temoignage-visible')) document.getElementById('temoignage-visible').checked = t.visible !== false;
            // Set note
            const noteRadio = document.querySelector(`input[name="temoignage-note"][value="${t.note || 5}"]`);
            if (noteRadio) noteRadio.checked = true;
        }
    } else {
        title.innerHTML = '<span class="material-icons mr-2">format_quote</span>Nouveau témoignage';
    }
    
    modal.classList.remove('hidden');
};

window.closeTemoignageModal = function() {
    const modal = document.getElementById('temoignage-modal');
    if (modal) modal.classList.add('hidden');
};

// ===================================================
// FONCTIONS MODALS - FAQ
// ===================================================
window.openFaqModal = function(index = null) {
    const modal = document.getElementById('faq-modal');
    const title = document.getElementById('faq-modal-title');
    const form = document.getElementById('faq-form');
    
    if (!modal) return;
    
    form.reset();
    document.getElementById('faq-edit-index').value = '';
    if (document.getElementById('faq-visible')) document.getElementById('faq-visible').checked = true;
    
    if (index !== null) {
        title.innerHTML = '<span class="material-icons mr-2">edit</span>Modifier la question';
        const faqs = JSON.parse(localStorage.getItem('faqs') || '[]');
        const f = faqs[index];
        if (f) {
            document.getElementById('faq-edit-index').value = index;
            if (document.getElementById('faq-question')) document.getElementById('faq-question').value = f.question || '';
            if (document.getElementById('faq-reponse')) document.getElementById('faq-reponse').value = f.reponse || '';
            if (document.getElementById('faq-categorie')) document.getElementById('faq-categorie').value = f.categorie || 'general';
            if (document.getElementById('faq-visible')) document.getElementById('faq-visible').checked = f.visible !== false;
        }
    } else {
        title.innerHTML = '<span class="material-icons mr-2">help_outline</span>Nouvelle question FAQ';
    }
    
    modal.classList.remove('hidden');
};

window.closeFaqModal = function() {
    const modal = document.getElementById('faq-modal');
    if (modal) modal.classList.add('hidden');
};

// ===================================================
// FONCTIONS MODALS - MÉDIAS
// ===================================================
window.openMediaModal = function() {
    const modal = document.getElementById('media-modal');
    const form = document.getElementById('media-form');
    
    if (!modal) return;
    
    form.reset();
    const preview = document.getElementById('media-preview');
    if (preview) preview.classList.add('hidden');
    
    modal.classList.remove('hidden');
};

window.closeMediaModal = function() {
    const modal = document.getElementById('media-modal');
    if (modal) modal.classList.add('hidden');
};

window.previewMediaFile = function(input) {
    const preview = document.getElementById('media-preview');
    const filename = document.getElementById('media-filename');
    if (input.files && input.files[0] && preview) {
        const file = input.files[0];
        if (filename) filename.textContent = file.name;
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.querySelector('img').src = e.target.result;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            preview.querySelector('img').src = '';
            preview.classList.remove('hidden');
        }
    }
};

// ===================================================
// FONCTIONS MODALS - FACTURES
// ===================================================
window.openFactureModal = function(index = null) {
    const modal = document.getElementById('facture-modal');
    const title = document.getElementById('facture-modal-title');
    const form = document.getElementById('facture-form');
    
    if (!modal) return;
    
    form.reset();
    if (document.getElementById('facture-edit-id')) document.getElementById('facture-edit-id').value = '';
    
    // Date par défaut
    if (document.getElementById('facture-date')) {
        document.getElementById('facture-date').value = new Date().toISOString().split('T')[0];
    }
    
    // Charger les clients
    populateClientSelector('facture-client');
    
    // Reset les lignes de facture
    if (typeof factureLines !== 'undefined') {
        factureLines = [];
        if (typeof renderFactureLines === 'function') renderFactureLines();
    }
    
    if (index !== null) {
        title.innerHTML = '<span class="material-icons mr-2">edit</span>Modifier la facture';
        const factures = JSON.parse(localStorage.getItem('factures') || '[]');
        const f = factures[index];
        if (f) {
            document.getElementById('facture-edit-id').value = index;
            if (document.getElementById('facture-type')) document.getElementById('facture-type').value = f.type || 'facture';
            if (document.getElementById('facture-date')) document.getElementById('facture-date').value = f.date || '';
            if (document.getElementById('facture-echeance')) document.getElementById('facture-echeance').value = f.echeance || '';
            if (document.getElementById('facture-client-nom')) document.getElementById('facture-client-nom').value = f.clientNom || '';
            if (document.getElementById('facture-client-email')) document.getElementById('facture-client-email').value = f.clientEmail || '';
            if (document.getElementById('facture-client-tel')) document.getElementById('facture-client-tel').value = f.clientTel || '';
            if (document.getElementById('facture-client-adresse')) document.getElementById('facture-client-adresse').value = f.clientAdresse || '';
            if (document.getElementById('facture-notes')) document.getElementById('facture-notes').value = f.notes || '';
            
            // Charger les lignes
            if (f.lignes && typeof factureLines !== 'undefined') {
                factureLines = [...f.lignes];
                if (typeof renderFactureLines === 'function') renderFactureLines();
            }
        }
    } else {
        title.innerHTML = '<span class="material-icons mr-2">receipt_long</span>Nouvelle facture';
    }
    
    modal.classList.remove('hidden');
};

window.closeFactureModal = function() {
    const modal = document.getElementById('facture-modal');
    if (modal) modal.classList.add('hidden');
};

// ===================================================
// FONCTION AUTO-REMPLISSAGE CLIENT
// ===================================================
// Remplit automatiquement les champs d'un formulaire avec les données d'un client existant
window.fillClientInfo = function(clientIndex, prefix) {
    if (clientIndex === '' || clientIndex === null || clientIndex === undefined) {
        // Si aucun client sélectionné, vider les champs
        clearClientFields(prefix);
        return;
    }
    
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const client = clients[clientIndex];
    
    if (!client) return;
    
    // Mapping des champs selon le préfixe du formulaire
    const fieldMappings = {
        'rdv': {
            'client': client.type === 'entreprise' ? client.raisonSociale : `${client.prenom || ''} ${client.nom || ''}`.trim(),
            'phone': client.telephone || '',
            'email': client.email || '',
            'lieu': client.adresse || ''
        },
        'projet': {
            'adresse': client.adresse || '',
            'ville': client.ville || 'Dakar'
        },
        'doc': {
        },
        'trans': {
            'tiers': client.type === 'entreprise' ? client.raisonSociale : `${client.prenom || ''} ${client.nom || ''}`.trim()
        },
        'facture': {
            'client-nom': client.type === 'entreprise' ? client.raisonSociale : `${client.civilite || ''} ${client.prenom || ''} ${client.nom || ''}`.trim(),
            'client-adresse': client.adresse || '',
            'client-tel': client.telephone || '',
            'client-email': client.email || ''
        }
    };
    
    const mapping = fieldMappings[prefix];
    if (!mapping) return;
    
    // Remplir les champs
    for (const [field, value] of Object.entries(mapping)) {
        const element = document.getElementById(`${prefix}-${field}`);
        if (element) {
            element.value = value;
            // Animation de remplissage
            element.classList.add('bg-green-50');
            setTimeout(() => element.classList.remove('bg-green-50'), 500);
        }
    }
    
    // Notification
    const clientName = client.type === 'entreprise' ? client.raisonSociale : `${client.prenom || ''} ${client.nom || ''}`.trim();
    showNotification('Auto-remplissage', `Informations de ${clientName} chargées`, 'info');
};

// Vider les champs client
function clearClientFields(prefix) {
    const fieldsToClear = {
        'rdv': ['client', 'phone', 'email', 'lieu'],
        'projet': ['adresse', 'ville'],
        'doc': [],
        'trans': ['tiers'],
        'facture': ['client-nom', 'client-adresse', 'client-tel', 'client-email']
    };
    
    const fields = fieldsToClear[prefix];
    if (!fields) return;
    
    fields.forEach(field => {
        const element = document.getElementById(`${prefix}-${field}`);
        if (element) element.value = '';
    });
}

// Créer un sélecteur de clients existants
window.populateClientSelector = function(selectId, includeEmpty = true) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    select.innerHTML = includeEmpty ? '<option value="">-- Nouveau client / Saisie manuelle --</option>' : '';
    
    // Grouper par type
    const particuliers = clients.map((c, i) => ({...c, index: i})).filter(c => c.type !== 'entreprise');
    const entreprises = clients.map((c, i) => ({...c, index: i})).filter(c => c.type === 'entreprise');
    
    if (particuliers.length > 0) {
        const groupPart = document.createElement('optgroup');
        groupPart.label = '👤 Particuliers';
        particuliers.forEach(c => {
            const option = document.createElement('option');
            option.value = c.index;
            option.textContent = `${c.prenom || ''} ${c.nom || ''}`.trim() + (c.telephone ? ` - ${c.telephone}` : '');
            groupPart.appendChild(option);
        });
        select.appendChild(groupPart);
    }
    
    if (entreprises.length > 0) {
        const groupEnt = document.createElement('optgroup');
        groupEnt.label = '🏢 Entreprises';
        entreprises.forEach(c => {
            const option = document.createElement('option');
            option.value = c.index;
            option.textContent = c.raisonSociale + (c.telephone ? ` - ${c.telephone}` : '');
            groupEnt.appendChild(option);
        });
        select.appendChild(groupEnt);
    }
    
    if (clients.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Aucun client enregistré';
        option.disabled = true;
        select.appendChild(option);
    }
};

// Fonction pour aller à aujourd'hui dans le calendrier
window.goToToday = function() {
    const today = new Date();
    if (typeof currentMonth !== 'undefined' && typeof currentYear !== 'undefined') {
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        if (typeof renderCalendar === 'function') {
            renderCalendar();
        }
    }
};

// Soumission du formulaire transaction
document.getElementById('transaction-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    const editId = document.getElementById('trans-edit-id').value;
    
    // Récupérer le mode de paiement sélectionné
    const modePaiement = document.querySelector('input[name="trans-mode-paiement"]:checked')?.value || 'especes';
    
    const transaction = {
        id: editId !== '' ? transactions[parseInt(editId)]?.id : Date.now(),
        type: document.getElementById('trans-type').value,
        categorie: document.getElementById('trans-categorie').value,
        montant: parseFloat(document.getElementById('trans-montant').value),
        description: document.getElementById('trans-desc').value,
        date: document.getElementById('trans-date').value,
        reference: document.getElementById('trans-reference')?.value || '',
        factureAssociee: document.getElementById('trans-facture')?.value || '',
        tiers: document.getElementById('trans-tiers')?.value || '',
        projet: document.getElementById('trans-projet')?.value || '',
        modePaiement: modePaiement,
        numCheque: modePaiement === 'cheque' ? document.getElementById('trans-num-cheque')?.value || '' : '',
        banque: modePaiement === 'cheque' ? document.getElementById('trans-banque')?.value || '' : '',
        tva: parseFloat(document.getElementById('trans-tva')?.value) || 0,
        statut: document.getElementById('trans-statut')?.value || 'effectue',
        justificatif: document.getElementById('trans-justificatif')?.checked || false,
        notes: document.getElementById('trans-notes').value,
        createdAt: editId !== '' ? transactions[parseInt(editId)]?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Calculer montant TTC si TVA
    if (transaction.tva > 0) {
        transaction.montantHT = transaction.montant;
        transaction.montantTVA = transaction.montant * (transaction.tva / 100);
        transaction.montantTTC = transaction.montant + transaction.montantTVA;
    } else {
        transaction.montantHT = transaction.montant;
        transaction.montantTVA = 0;
        transaction.montantTTC = transaction.montant;
    }
    
    if (editId !== '') {
        transactions[parseInt(editId)] = transaction;
        showNotification('Transaction modifiée', 'La transaction a été mise à jour', 'success');
    } else {
        transactions.push(transaction);
        const typeLabel = transaction.type === 'recette' ? 'Revenu' : 'Dépense';
        showNotification(`${typeLabel} ajouté`, `${transaction.montantTTC.toLocaleString('fr-FR')} FCFA`, 'success');
    }
    
    localStorage.setItem('comptabilite', JSON.stringify(transactions));
    closeTransactionModal();
    renderComptabilite();
    updateComptaDashboard();
});

function updateComptaDashboard() {
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Transactions du mois
    const thisMonth = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const revenus = thisMonth.filter(t => t.type === 'recette').reduce((sum, t) => sum + t.montant, 0);
    const depenses = thisMonth.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.montant, 0);
    const benefice = revenus - depenses;
    
    // Nombre de transactions ce mois
    const nbTransactions = thisMonth.length;
    
    const elRevenus = document.getElementById('compta-revenus-mois');
    const elDepenses = document.getElementById('compta-depenses-mois');
    const elBenefice = document.getElementById('compta-benefice');
    const elTransactions = document.getElementById('compta-transactions');
    
    if (elRevenus) elRevenus.textContent = revenus.toLocaleString('fr-FR') + ' FCFA';
    if (elDepenses) elDepenses.textContent = depenses.toLocaleString('fr-FR') + ' FCFA';
    if (elBenefice) elBenefice.textContent = benefice.toLocaleString('fr-FR') + ' FCFA';
    if (elTransactions) elTransactions.textContent = nbTransactions;
    
    // Mettre à jour les listes séparées de revenus/dépenses
    renderRevenusDepensesLists();
}

function renderRevenusDepensesLists() {
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    const revenusContainer = document.getElementById('revenus-list');
    const depensesContainer = document.getElementById('depenses-list');
    
    const revenus = transactions.filter(t => t.type === 'recette').sort((a, b) => new Date(b.date) - new Date(a.date));
    const depenses = transactions.filter(t => t.type === 'depense').sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (revenusContainer) {
        if (revenus.length === 0) {
            revenusContainer.innerHTML = '<p class="text-gray-400 text-center py-8">Aucun revenu enregistré</p>';
        } else {
            revenusContainer.innerHTML = revenus.slice(0, 10).map((t, i) => {
                const globalIndex = transactions.indexOf(t);
                return `
                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <div>
                            <p class="font-medium text-gray-800">${t.description || t.categorie}</p>
                            <p class="text-xs text-gray-500">${new Date(t.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div class="flex items-center">
                            <span class="font-bold text-green-600 mr-3">+${t.montant.toLocaleString('fr-FR')}</span>
                            <button onclick="deleteCompta(${globalIndex})" class="p-1 text-red-400 hover:text-red-600">
                                <span class="material-icons text-sm">delete</span>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    if (depensesContainer) {
        if (depenses.length === 0) {
            depensesContainer.innerHTML = '<p class="text-gray-400 text-center py-8">Aucune dépense enregistrée</p>';
        } else {
            depensesContainer.innerHTML = depenses.slice(0, 10).map((t, i) => {
                const globalIndex = transactions.indexOf(t);
                return `
                    <div class="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                        <div>
                            <p class="font-medium text-gray-800">${t.description || t.categorie}</p>
                            <p class="text-xs text-gray-500">${new Date(t.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div class="flex items-center">
                            <span class="font-bold text-red-600 mr-3">-${t.montant.toLocaleString('fr-FR')}</span>
                            <button onclick="deleteCompta(${globalIndex})" class="p-1 text-red-400 hover:text-red-600">
                                <span class="material-icons text-sm">delete</span>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// ===================================================
// FONCTIONS UTILITAIRES FACTURES
// ===================================================
window.addFactureLigne = function() {
    factureLines.push({ description: '', quantite: 1, prixUnit: 0 });
    renderFactureLines();
};

window.closeFacturePreview = function() {
    const modal = document.getElementById('facture-preview-modal');
    if (modal) modal.classList.add('hidden');
};

window.downloadFacturePDF = function() {
    showNotification('Téléchargement', 'Fonctionnalité PDF disponible avec bibliothèque externe', 'info');
};

// ===================================================
// FONCTIONS UTILITAIRES BILANS
// ===================================================
window.generateBilan = function() {
    const periode = document.getElementById('bilan-periode')?.value || 'mois';
    const dateDebut = document.getElementById('bilan-date-debut')?.value;
    const dateFin = document.getElementById('bilan-date-fin')?.value;
    
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    let filtered = transactions;
    
    const now = new Date();
    
    if (periode === 'custom' && dateDebut && dateFin) {
        filtered = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(dateDebut) && d <= new Date(dateFin);
        });
    } else if (periode === 'mois') {
        filtered = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
    } else if (periode === 'trimestre') {
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        filtered = transactions.filter(t => new Date(t.date) >= quarterStart);
    } else if (periode === 'annee') {
        filtered = transactions.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
    }
    
    const revenus = filtered.filter(t => t.type === 'recette').reduce((sum, t) => sum + t.montant, 0);
    const depenses = filtered.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.montant, 0);
    const resultat = revenus - depenses;
    const marge = revenus > 0 ? ((resultat / revenus) * 100).toFixed(1) : 0;
    
    const nbRevenus = filtered.filter(t => t.type === 'recette').length;
    const nbDepenses = filtered.filter(t => t.type === 'depense').length;
    
    // Mettre à jour l'affichage
    document.getElementById('bilan-total-revenus').textContent = revenus.toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('bilan-total-depenses').textContent = depenses.toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('bilan-resultat').textContent = resultat.toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('bilan-resultat').className = `text-3xl font-bold ${resultat >= 0 ? 'text-green-600' : 'text-red-600'}`;
    document.getElementById('bilan-marge').textContent = `Marge: ${marge}%`;
    document.getElementById('bilan-nb-revenus').textContent = `${nbRevenus} transactions`;
    document.getElementById('bilan-nb-depenses').textContent = `${nbDepenses} transactions`;
    
    // Catégories revenus
    const revenusCat = {};
    const depensesCat = {};
    
    filtered.filter(t => t.type === 'recette').forEach(t => {
        revenusCat[t.categorie] = (revenusCat[t.categorie] || 0) + t.montant;
    });
    
    filtered.filter(t => t.type === 'depense').forEach(t => {
        depensesCat[t.categorie] = (depensesCat[t.categorie] || 0) + t.montant;
    });
    
    const revenusCatEl = document.getElementById('bilan-revenus-categories');
    const depensesCatEl = document.getElementById('bilan-depenses-categories');
    
    if (revenusCatEl) {
        revenusCatEl.innerHTML = Object.entries(revenusCat).map(([cat, montant]) => `
            <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span class="capitalize text-gray-700">${cat}</span>
                <span class="font-semibold text-green-600">${montant.toLocaleString('fr-FR')} FCFA</span>
            </div>
        `).join('') || '<p class="text-gray-400 text-sm">Aucun revenu</p>';
    }
    
    if (depensesCatEl) {
        depensesCatEl.innerHTML = Object.entries(depensesCat).map(([cat, montant]) => `
            <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span class="capitalize text-gray-700">${cat}</span>
                <span class="font-semibold text-red-600">${montant.toLocaleString('fr-FR')} FCFA</span>
            </div>
        `).join('') || '<p class="text-gray-400 text-sm">Aucune dépense</p>';
    }
    
    showNotification('Bilan généré', `Période: ${periode}`, 'success');
};

// Toggle période personnalisée
document.getElementById('bilan-periode')?.addEventListener('change', function() {
    const customDates = document.getElementById('bilan-custom-dates');
    if (this.value === 'custom') {
        customDates?.classList.remove('hidden');
    } else {
        customDates?.classList.add('hidden');
        generateBilan();
    }
});

// ===================================================
// FONCTIONS UTILITAIRES IA COMPTABLE
// ===================================================
window.iaQuickQuestion = function(type) {
    const chatContainer = document.getElementById('ia-chat-messages');
    const questions = {
        'bilan': 'Quel est mon bilan financier du mois ?',
        'tresorerie': 'Quelle est ma situation de trésorerie actuelle ?',
        'impayes': 'Quelles sont mes factures impayées ?',
        'conseil': 'Quels conseils pouvez-vous me donner pour optimiser mes finances ?'
    };
    
    const question = questions[type];
    
    // Ajouter la question de l'utilisateur
    chatContainer.innerHTML += `
        <div class="ia-message user text-white rounded-2xl rounded-tr-none p-4 mb-4 ml-auto max-w-[80%]">
            <p>${question}</p>
        </div>
    `;
    
    // Simuler le chargement
    chatContainer.innerHTML += `
        <div class="ia-message assistant text-white rounded-2xl rounded-tl-none p-4 mb-4" id="ia-loading">
            <p>⏳ Analyse en cours...</p>
        </div>
    `;
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Simuler une réponse IA après délai
    setTimeout(() => {
        const loadingEl = document.getElementById('ia-loading');
        if (loadingEl) loadingEl.remove();
        
        const response = generateIAResponse(type);
        chatContainer.innerHTML += `
            <div class="ia-message assistant text-white rounded-2xl rounded-tl-none p-4 mb-4">
                ${response}
            </div>
        `;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1500);
};

function generateIAResponse(type) {
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    
    const now = new Date();
    const thisMonth = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    
    const revenus = thisMonth.filter(t => t.type === 'recette').reduce((sum, t) => sum + t.montant, 0);
    const depenses = thisMonth.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.montant, 0);
    const solde = revenus - depenses;
    
    const facturesImpayees = factures.filter(f => f.type === 'facture' && f.status !== 'payee');
    const totalImpayes = facturesImpayees.reduce((sum, f) => sum + f.totalTTC, 0);
    
    switch(type) {
        case 'bilan':
            return `
                <p>📊 <strong>Bilan du mois de ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</strong></p>
                <ul class="mt-2 ml-4 space-y-1">
                    <li>💰 Revenus: <span class="text-green-300">${revenus.toLocaleString('fr-FR')} FCFA</span></li>
                    <li>📤 Dépenses: <span class="text-red-300">${depenses.toLocaleString('fr-FR')} FCFA</span></li>
                    <li>📈 Résultat: <span class="${solde >= 0 ? 'text-green-300' : 'text-red-300'}">${solde.toLocaleString('fr-FR')} FCFA</span></li>
                </ul>
                ${solde >= 0 ? '<p class="mt-2">✅ Félicitations, votre mois est positif !</p>' : '<p class="mt-2">⚠️ Attention, votre mois est déficitaire.</p>'}
            `;
        case 'tresorerie':
            const totalRevenus = transactions.filter(t => t.type === 'recette').reduce((sum, t) => sum + t.montant, 0);
            const totalDepenses = transactions.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.montant, 0);
            const tresorerie = totalRevenus - totalDepenses;
            return `
                <p>💰 <strong>Situation de trésorerie</strong></p>
                <ul class="mt-2 ml-4 space-y-1">
                    <li>Total des revenus: ${totalRevenus.toLocaleString('fr-FR')} FCFA</li>
                    <li>Total des dépenses: ${totalDepenses.toLocaleString('fr-FR')} FCFA</li>
                    <li>Solde actuel: <strong class="${tresorerie >= 0 ? 'text-green-300' : 'text-red-300'}">${tresorerie.toLocaleString('fr-FR')} FCFA</strong></li>
                </ul>
                ${tresorerie > 1000000 ? '<p class="mt-2">✅ Votre trésorerie est saine.</p>' : '<p class="mt-2">⚠️ Surveillez votre trésorerie.</p>'}
            `;
        case 'impayes':
            if (facturesImpayees.length === 0) {
                return '<p>✅ <strong>Aucune facture impayée !</strong></p><p class="mt-2">Toutes vos factures sont réglées. Excellent !</p>';
            }
            return `
                <p>⚠️ <strong>Factures impayées</strong></p>
                <p class="mt-2">Vous avez <strong>${facturesImpayees.length} facture(s)</strong> en attente pour un total de <strong class="text-yellow-300">${totalImpayes.toLocaleString('fr-FR')} FCFA</strong>.</p>
                <ul class="mt-2 ml-4 space-y-1">
                    ${facturesImpayees.slice(0, 3).map(f => `<li>• ${f.numero}: ${f.totalTTC.toLocaleString('fr-FR')} FCFA</li>`).join('')}
                </ul>
                <p class="mt-2">💡 Conseil: Relancez vos clients pour accélérer les paiements.</p>
            `;
        case 'conseil':
            const conseils = [];
            if (solde < 0) conseils.push('📉 Réduisez vos dépenses ce mois-ci');
            if (totalImpayes > 0) conseils.push('📧 Relancez vos factures impayées');
            if (depenses > revenus * 0.8) conseils.push('⚖️ Vos dépenses représentent plus de 80% de vos revenus');
            if (thisMonth.length < 5) conseils.push('📝 Enregistrez toutes vos transactions régulièrement');
            if (conseils.length === 0) conseils.push('✅ Votre gestion financière semble optimale !');
            
            return `
                <p>💡 <strong>Conseils personnalisés</strong></p>
                <ul class="mt-2 ml-4 space-y-2">
                    ${conseils.map(c => `<li>${c}</li>`).join('')}
                </ul>
                <p class="mt-3">N'hésitez pas à me poser d'autres questions !</p>
            `;
        default:
            return '<p>Je n\'ai pas compris votre question. Essayez une des questions rapides ci-dessous.</p>';
    }
}

window.iaGenerateReport = function(type) {
    const chatContainer = document.getElementById('ia-chat-messages');
    
    chatContainer.innerHTML += `
        <div class="ia-message assistant text-white rounded-2xl rounded-tl-none p-4 mb-4">
            <p>📄 Génération du rapport <strong>${type}</strong> en cours...</p>
        </div>
    `;
    
    setTimeout(() => {
        const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
        const factures = JSON.parse(localStorage.getItem('factures') || '[]');
        
        let report = '';
        
        switch(type) {
            case 'mensuel':
                const now = new Date();
                const thisMonth = transactions.filter(t => {
                    const d = new Date(t.date);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                });
                const rev = thisMonth.filter(t => t.type === 'recette').reduce((sum, t) => sum + t.montant, 0);
                const dep = thisMonth.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.montant, 0);
                
                report = `
                    <h3 class="font-bold mb-3">📊 Rapport mensuel - ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
                    <div class="bg-white/10 rounded-lg p-4 mb-3">
                        <p><strong>Revenus:</strong> ${rev.toLocaleString('fr-FR')} FCFA</p>
                        <p><strong>Dépenses:</strong> ${dep.toLocaleString('fr-FR')} FCFA</p>
                        <p><strong>Résultat:</strong> ${(rev - dep).toLocaleString('fr-FR')} FCFA</p>
                        <p><strong>Transactions:</strong> ${thisMonth.length}</p>
                    </div>
                `;
                break;
            case 'previsions':
                const avg = transactions.length > 0 
                    ? transactions.filter(t => t.type === 'recette').reduce((sum, t) => sum + t.montant, 0) / Math.max(1, new Set(transactions.map(t => t.date?.substring(0, 7))).size)
                    : 0;
                report = `
                    <h3 class="font-bold mb-3">📈 Prévisions financières</h3>
                    <p class="mb-2">Basé sur votre historique:</p>
                    <div class="bg-white/10 rounded-lg p-4">
                        <p><strong>Revenu mensuel moyen:</strong> ${avg.toLocaleString('fr-FR')} FCFA</p>
                        <p><strong>Projection trimestre:</strong> ${(avg * 3).toLocaleString('fr-FR')} FCFA</p>
                        <p><strong>Projection annuelle:</strong> ${(avg * 12).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                `;
                break;
            case 'alerte':
                const alertes = [];
                const impayes = factures.filter(f => f.status !== 'payee');
                if (impayes.length > 0) alertes.push(`⚠️ ${impayes.length} facture(s) impayée(s)`);
                
                const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
                const stockBas = stocks.filter(s => s.quantite <= (s.seuil || 5));
                if (stockBas.length > 0) alertes.push(`📦 ${stockBas.length} article(s) en stock bas`);
                
                report = `
                    <h3 class="font-bold mb-3">🔔 Alertes financières</h3>
                    ${alertes.length > 0 
                        ? '<ul class="space-y-2">' + alertes.map(a => `<li>${a}</li>`).join('') + '</ul>'
                        : '<p class="text-green-300">✅ Aucune alerte à signaler !</p>'}
                `;
                break;
            case 'optimisation':
                report = `
                    <h3 class="font-bold mb-3">💰 Optimisation fiscale</h3>
                    <ul class="space-y-2 mt-2">
                        <li>📋 Conservez toutes vos factures de dépenses</li>
                        <li>🧾 Déduisez les frais professionnels éligibles</li>
                        <li>📅 Anticipez vos déclarations fiscales</li>
                        <li>💼 Consultez un expert-comptable pour les montants importants</li>
                    </ul>
                `;
                break;
        }
        
        chatContainer.innerHTML += `
            <div class="ia-message assistant text-white rounded-2xl rounded-tl-none p-4 mb-4">
                ${report}
            </div>
        `;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        showNotification('Rapport généré', `Rapport ${type} créé`, 'success');
    }, 1000);
};

// Envoyer message IA
document.getElementById('ia-send')?.addEventListener('click', function() {
    const input = document.getElementById('ia-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatContainer = document.getElementById('ia-chat-messages');
    
    // Ajouter message utilisateur
    chatContainer.innerHTML += `
        <div class="ia-message user text-white rounded-2xl rounded-tr-none p-4 mb-4 ml-auto max-w-[80%]">
            <p>${message}</p>
        </div>
    `;
    
    input.value = '';
    
    // Réponse IA générique
    setTimeout(() => {
        const keywords = message.toLowerCase();
        let responseType = 'conseil';
        
        if (keywords.includes('bilan') || keywords.includes('mois')) responseType = 'bilan';
        else if (keywords.includes('trésor') || keywords.includes('cash')) responseType = 'tresorerie';
        else if (keywords.includes('impay') || keywords.includes('facture')) responseType = 'impayes';
        
        const response = generateIAResponse(responseType);
        
        chatContainer.innerHTML += `
            <div class="ia-message assistant text-white rounded-2xl rounded-tl-none p-4 mb-4">
                ${response}
            </div>
        `;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1000);
});

document.getElementById('ia-input')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('ia-send')?.click();
    }
});

// ===================================================
// FONCTIONS UTILITAIRES DOCUMENTS - SYSTÈME PROFESSIONNEL
// ===================================================

// Informations entreprise KFS BTP (personnalisables dans settings)
function getCompanyInfo() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    return {
        nom: settings.companyName || 'KFS BTP',
        slogan: settings.companySlogan || 'Bâtir l\'avenir au Sénégal',
        adresse: settings.companyAddress || 'Dakar, Sénégal',
        telephone: settings.companyPhone || '+221 78 584 28 71',
        email: settings.companyEmail || 'contact@kfs-btp.sn',
        site: settings.companySite || 'www.kfs-btp.sn',
        capital: settings.companyCapital || '',
        banque: settings.companyBank || '',
        logo: settings.companyLogo || 'assets/logo-kfs-btp.jpeg'
    };
}

// Obtenir les infos d'un client par ID ou nom
function getClientInfo(clientId) {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const client = clients.find(c => c.id === clientId || c.nom === clientId) || {};
    return {
        nom: client.nom || '',
        email: client.email || '',
        telephone: client.telephone || '',
        adresse: client.adresse || '',
        type: client.type || 'particulier',
        ninea: client.ninea || '',
        ville: client.ville || 'Dakar',
        pays: client.pays || 'Sénégal'
    };
}

// Obtenir les infos d'un projet
function getProjetInfo(projetId) {
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    const projet = projets.find(p => p.id === projetId || p.nom === projetId) || {};
    return {
        nom: projet.nom || '',
        description: projet.description || '',
        budget: projet.budget || 0,
        dateDebut: projet.dateDebut || '',
        dateFin: projet.dateFin || '',
        adresse: projet.adresse || '',
        client: projet.client || ''
    };
}

// Générer un numéro de document unique
function generateDocNumber(type) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const year = new Date().getFullYear();
    const prefix = {
        'contrat': 'CTR',
        'bail': 'BAIL',
        'devis': 'DEV',
        'facture': 'FAC',
        'attestation': 'ATT',
        'avenant': 'AVN',
        'pv': 'PV'
    }[type] || 'DOC';
    
    const count = documents.filter(d => 
        d.numero && d.numero.startsWith(`${prefix}-${year}`)
    ).length + 1;
    
    return `${prefix}-${year}-${String(count).padStart(4, '0')}`;
}

// Formater un montant en FCFA
function formatMontant(montant) {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
}

// Convertir un nombre en lettres (pour les montants)
function nombreEnLettres(nombre) {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
    
    if (nombre === 0) return 'zéro';
    if (nombre < 0) return 'moins ' + nombreEnLettres(-nombre);
    
    let result = '';
    
    // Milliards
    if (nombre >= 1000000000) {
        const milliards = Math.floor(nombre / 1000000000);
        result += nombreEnLettres(milliards) + ' milliard' + (milliards > 1 ? 's ' : ' ');
        nombre %= 1000000000;
    }
    
    // Millions
    if (nombre >= 1000000) {
        const millions = Math.floor(nombre / 1000000);
        result += nombreEnLettres(millions) + ' million' + (millions > 1 ? 's ' : ' ');
        nombre %= 1000000;
    }
    
    // Milliers
    if (nombre >= 1000) {
        const milliers = Math.floor(nombre / 1000);
        if (milliers === 1) {
            result += 'mille ';
        } else {
            result += nombreEnLettres(milliers) + ' mille ';
        }
        nombre %= 1000;
    }
    
    // Centaines
    if (nombre >= 100) {
        const centaines = Math.floor(nombre / 100);
        if (centaines === 1) {
            result += 'cent ';
        } else {
            result += units[centaines] + ' cent' + (nombre % 100 === 0 && centaines > 1 ? 's ' : ' ');
        }
        nombre %= 100;
    }
    
    // Dizaines et unités
    if (nombre >= 10 && nombre < 20) {
        result += teens[nombre - 10];
    } else if (nombre >= 20) {
        const dizaine = Math.floor(nombre / 10);
        const unite = nombre % 10;
        
        if (dizaine === 7 || dizaine === 9) {
            if (unite < 10) {
                result += tens[dizaine] + '-' + teens[unite];
            }
        } else {
            result += tens[dizaine];
            if (unite === 1 && dizaine !== 8) {
                result += '-et-un';
            } else if (unite > 0) {
                result += '-' + units[unite];
            } else if (dizaine === 8) {
                result += 's';
            }
        }
    } else if (nombre > 0) {
        result += units[nombre];
    }
    
    return result.trim();
}

// ===================================================
// EN-TÊTE ET FOOTER PROFESSIONNELS POUR DOCUMENTS PDF
// ===================================================

// Générer l'en-tête professionnel d'un document
function generateDocumentHeader(company, docInfo) {
    const { numero, type, titre, dateCreation } = docInfo;
    const dateJour = dateCreation ? new Date(dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
                                  : new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const typeColors = {
        'contrat': '#1e3a8a',
        'bail': '#047857',
        'devis': '#7c3aed',
        'facture': '#dc2626',
        'attestation': '#0891b2',
        'fiche-paie': '#ea580c'
    };
    const color = typeColors[type] || '#1e3a8a';
    
    const typeLabels = {
        'contrat': 'CONTRAT',
        'bail': 'BAIL',
        'devis': 'DEVIS',
        'facture': 'FACTURE',
        'attestation': 'ATTESTATION',
        'fiche-paie': 'BULLETIN DE PAIE'
    };
    
    return `
    <!-- EN-TÊTE PROFESSIONNEL -->
    <div style="border-bottom: 3px double ${color}; padding-bottom: 25px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <!-- Logo et infos entreprise -->
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    ${company.logo ? `<img src="${company.logo}" alt="Logo" style="height: 60px; width: auto; object-fit: contain;" onerror="this.style.display='none'">` : ''}
                    <div>
                        <h1 style="color: ${color}; font-size: 28px; margin: 0; font-weight: bold; letter-spacing: 1px;">${company.nom}</h1>
                        <p style="color: #666; font-style: italic; margin: 3px 0 0 0; font-size: 13px;">${company.slogan}</p>
                    </div>
                </div>
                <div style="margin-top: 15px; font-size: 11px; color: #555; line-height: 1.6;">
                    <p style="margin: 0;">📍 ${company.adresse}</p>
                    <p style="margin: 3px 0;">📞 ${company.telephone} | ✉️ ${company.email}</p>
                    <p style="margin: 3px 0;">🌐 ${company.site}</p>
                    ${company.capital ? `<p style="margin: 3px 0;">Capital: ${company.capital}</p>` : ''}
                </div>
            </div>
            
            <!-- Numéro et type de document -->
            <div style="text-align: right;">
                <div style="background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)}); color: white; padding: 18px 28px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
                    <p style="margin: 0; font-size: 11px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">${typeLabels[type] || 'DOCUMENT'} N°</p>
                    <p style="margin: 8px 0 0 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">${numero}</p>
                </div>
                <p style="margin-top: 12px; font-size: 12px; color: #666;">
                    📅 ${dateJour}
                </p>
            </div>
        </div>
    </div>
    `;
}

// Générer le footer professionnel avec zones de signature
function generateDocumentFooter(company, options = {}) {
    const { 
        showSignatures = true, 
        signatureLabels = ['Le Prestataire', 'Le Client'],
        showMentions = true,
        showBankInfo = true,
        customMentions = ''
    } = options;
    
    return `
    <!-- PIED DE PAGE PROFESSIONNEL -->
    <div style="margin-top: 50px; page-break-inside: avoid;">
        
        ${showSignatures ? `
        <!-- ZONE DE SIGNATURES -->
        <div style="margin: 40px 0; padding: 30px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h4 style="text-align: center; color: #475569; margin: 0 0 25px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                Signatures des Parties
            </h4>
            <div style="display: flex; justify-content: space-between; gap: 40px;">
                ${signatureLabels.map((label, i) => `
                <div style="flex: 1; text-align: center;">
                    <p style="font-weight: 600; color: #1e3a8a; margin: 0 0 8px 0; font-size: 13px;">${label}</p>
                    <div style="border: 2px dashed #cbd5e1; border-radius: 8px; height: 100px; display: flex; align-items: center; justify-content: center; background: white; margin: 10px 0;">
                        <span style="color: #94a3b8; font-size: 11px; font-style: italic;">Signature + Cachet</span>
                    </div>
                    <p style="font-size: 11px; color: #64748b; margin: 8px 0 0 0;">
                        Fait à ______________, le ____ / ____ / ________
                    </p>
                    <p style="font-size: 10px; color: #94a3b8; margin: 5px 0 0 0; font-style: italic;">
                        Précédé de la mention "Lu et approuvé"
                    </p>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${showBankInfo ? `
        <!-- COORDONNÉES BANCAIRES -->
        <div style="margin: 25px 0; padding: 20px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 10px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-weight: 600; color: #92400e; font-size: 12px;">
                🏦 COORDONNÉES BANCAIRES
            </p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #78350f;">
                ${company.banque}
            </p>
        </div>
        ` : ''}
        
        ${showMentions ? `
        <!-- MENTIONS LÉGALES -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 9px; color: #94a3b8; text-align: center; line-height: 1.6; margin: 0;">
                ${customMentions || `
                ${company.nom}${company.capital ? ` - Capital: ${company.capital}` : ''}<br>
                Siège social: ${company.adresse} | Tél: ${company.telephone} | Email: ${company.email}<br>
                Document généré électroniquement - Valide sans signature si transmis électroniquement conformément à la législation en vigueur
                `}
            </p>
        </div>
        ` : ''}
        
        <!-- NUMÉRO DE PAGE (à utiliser avec @page CSS) -->
        <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #cbd5e1;">
            Document officiel - ${company.nom} - ${new Date().getFullYear()}
        </div>
    </div>
    `;
}

// Fonction utilitaire pour ajuster la luminosité d'une couleur hex
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Style CSS commun pour tous les documents PDF
function getDocumentStyles() {
    return `
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        @media print {
            body { 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
        }
        .document-professionnel {
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            max-width: 210mm;
            margin: 0 auto;
            padding: 15mm;
            background: white;
            color: #333;
            line-height: 1.6;
            box-sizing: border-box;
        }
        .document-professionnel h1, 
        .document-professionnel h2, 
        .document-professionnel h3, 
        .document-professionnel h4 {
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        .document-professionnel table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .document-professionnel th,
        .document-professionnel td {
            padding: 10px 12px;
            text-align: left;
            border: 1px solid #e2e8f0;
        }
        .document-professionnel th {
            background: #f1f5f9;
            font-weight: 600;
            color: #475569;
        }
        .document-professionnel .article {
            margin: 25px 0;
            padding: 20px;
            background: #fafafa;
            border-left: 4px solid #1e3a8a;
            border-radius: 0 8px 8px 0;
        }
        .document-professionnel .article-title {
            color: #1e3a8a;
            font-weight: 700;
            margin: 0 0 12px 0;
            font-size: 14px;
            text-transform: uppercase;
        }
        .document-professionnel .highlight-box {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            padding: 15px 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            margin: 15px 0;
        }
        .document-professionnel .total-box {
            background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: right;
        }
    </style>
    `;
}

// ===================================================
// MODÈLE: CONTRAT DE PRESTATION BTP PROFESSIONNEL
// ===================================================
function generateContratPrestation(data) {
    const company = getCompanyInfo();
    const client = data.client ? getClientInfo(data.client) : data.clientInfo || {};
    const numero = generateDocNumber('contrat');
    const dateJour = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const montantHT = parseFloat(data.montantHT) || 0;
    const tva = data.avecTVA ? montantHT * 0.18 : 0;
    const montantTTC = montantHT + tva;
    const acompte = montantTTC * (parseFloat(data.pourcentageAcompte) || 30) / 100;
    
    return {
        numero: numero,
        type: 'contrat',
        categorie: 'contrat',
        titre: `Contrat de Prestation N° ${numero}`,
        client: client.nom,
        montant: montantTTC,
        dateCreation: new Date().toISOString(),
        data: data,
        contenuHTML: `
<div class="document-professionnel" style="font-family: 'Times New Roman', serif; max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; color: #333; line-height: 1.6;">
    
    <!-- EN-TÊTE -->
    <div style="border-bottom: 3px double #1e3a8a; padding-bottom: 20px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h1 style="color: #1e3a8a; font-size: 28px; margin: 0; font-weight: bold;">${company.nom}</h1>
                <p style="color: #666; font-style: italic; margin: 5px 0;">${company.slogan}</p>
                <p style="font-size: 12px; color: #555; margin: 10px 0 0 0;">
                    ${company.adresse}<br>
                    Tél: ${company.telephone} | Email: ${company.email}
                </p>
            </div>
            <div style="text-align: right;">
                <div style="background: #1e3a8a; color: white; padding: 15px 25px; border-radius: 8px;">
                    <p style="margin: 0; font-size: 12px; opacity: 0.9;">CONTRAT N°</p>
                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${numero}</p>
                </div>
                <p style="margin-top: 10px; font-size: 12px; color: #666;">Date: ${dateJour}</p>
            </div>
        </div>
    </div>

    <!-- TITRE DU DOCUMENT -->
    <div style="text-align: center; margin: 40px 0; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 10px;">
        <h2 style="color: #1e3a8a; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
            Contrat de Prestation de Services
        </h2>
        <p style="color: #64748b; margin: 10px 0 0 0; font-size: 14px;">Secteur Bâtiment et Travaux Publics</p>
    </div>

    <!-- PARTIES CONTRACTANTES -->
    <div style="margin: 30px 0;">
        <h3 style="color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 16px;">
            ENTRE LES SOUSSIGNÉS
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px;">
            <!-- LE PRESTATAIRE -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #1e3a8a;">
                <h4 style="color: #1e3a8a; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">Le Prestataire</h4>
                <p style="margin: 5px 0;"><strong>${company.nom}</strong></p>
                <p style="margin: 5px 0; font-size: 13px;">Siège social: ${company.adresse}</p>
                <p style="margin: 5px 0; font-size: 13px;">Tél: ${company.telephone}</p>
                <p style="margin: 5px 0; font-size: 13px;">Email: ${company.email}</p>
                <p style="margin: 10px 0 0 0; font-size: 13px;">
                    Représenté par: <strong>${data.representantPrestataire || 'Le Directeur Général'}</strong><br>
                    Fonction: ${data.fonctionPrestataire || 'Directeur Général'}
                </p>
                <p style="margin-top: 10px; font-style: italic; color: #666; font-size: 12px;">Ci-après dénommé "LE PRESTATAIRE"</p>
            </div>
            
            <!-- LE CLIENT -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                <h4 style="color: #10b981; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">Le Client</h4>
                <p style="margin: 5px 0;"><strong>${client.nom || data.clientNom || '___________________'}</strong></p>
                <p style="margin: 5px 0; font-size: 13px;">Adresse: ${client.adresse || data.clientAdresse || '___________________'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Téléphone: ${client.telephone || data.clientTel || '___________________'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Email: ${client.email || data.clientEmail || '___________________'}</p>
                ${client.type === 'entreprise' || data.clientType === 'entreprise' ? `
                <p style="margin: 5px 0; font-size: 13px;">NINEA: ${client.ninea || data.clientNinea || '___________________'}</p>
                ` : ''}
                <p style="margin-top: 10px; font-style: italic; color: #666; font-size: 12px;">Ci-après dénommé "LE CLIENT"</p>
            </div>
        </div>
        
        <p style="text-align: center; margin-top: 20px; font-style: italic; color: #666;">
            Ci-après désignés ensemble "Les Parties" ou individuellement "La Partie"
        </p>
    </div>

    <!-- PRÉAMBULE -->
    <div style="margin: 30px 0; padding: 20px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h3 style="color: #b45309; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">Préambule</h3>
        <p style="text-align: justify; font-size: 13px; margin: 0;">
            ${data.preambule || `Le Client souhaite faire réaliser des travaux de ${data.typeTravauxDesc || 'construction/rénovation'} et a sollicité le Prestataire, 
            entreprise spécialisée dans le secteur du Bâtiment et des Travaux Publics, pour l'exécution desdits travaux. 
            Le Prestataire a accepté cette mission aux conditions définies ci-après.`}
        </p>
    </div>

    <!-- IL A ÉTÉ CONVENU CE QUI SUIT -->
    <div style="text-align: center; margin: 30px 0; padding: 15px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
        <p style="font-weight: bold; font-size: 16px; color: #1e3a8a; margin: 0; letter-spacing: 3px;">IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT</p>
    </div>

    <!-- ARTICLE 1: OBJET -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 1</span>
            OBJET DU CONTRAT
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            Le présent contrat a pour objet de définir les conditions dans lesquelles le Prestataire s'engage à réaliser 
            pour le compte du Client les travaux suivants:
        </p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="font-weight: bold; margin: 0 0 10px 0;">Nature des travaux:</p>
            <p style="margin: 0; white-space: pre-line;">${data.descriptionTravaux || '• À définir'}</p>
        </div>
        <p style="font-size: 13px;">
            <strong>Lieu d'exécution:</strong> ${data.lieuTravaux || '___________________'}
        </p>
    </div>

    <!-- ARTICLE 2: DURÉE -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 2</span>
            DURÉE ET DÉLAIS D'EXÉCUTION
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.1.</strong> Le présent contrat est conclu pour une durée de <strong>${data.dureeContrat || '___'} ${data.uniteDuree || 'mois'}</strong> 
            à compter de la date de signature des présentes.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.2.</strong> Date prévisionnelle de début des travaux: <strong>${data.dateDebut ? new Date(data.dateDebut).toLocaleDateString('fr-FR') : '___________________'}</strong>
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.3.</strong> Date prévisionnelle de fin des travaux: <strong>${data.dateFin ? new Date(data.dateFin).toLocaleDateString('fr-FR') : '___________________'}</strong>
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.4.</strong> En cas de retard non imputable au Prestataire (intempéries, modifications demandées par le Client, 
            cas de force majeure), les délais seront prolongés d'une durée équivalente au retard subi.
        </p>
    </div>

    <!-- ARTICLE 3: PRIX ET PAIEMENT -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 3</span>
            PRIX ET CONDITIONS DE PAIEMENT
        </h3>
        
        <p style="text-align: justify; font-size: 13px;"><strong>3.1. Montant des travaux</strong></p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #bbf7d0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                    <td style="padding: 8px 0;">Montant Hors Taxes (HT)</td>
                    <td style="text-align: right; font-weight: bold;">${formatMontant(montantHT)}</td>
                </tr>
                ${data.avecTVA ? `
                <tr>
                    <td style="padding: 8px 0;">TVA (18%)</td>
                    <td style="text-align: right;">${formatMontant(tva)}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #10b981;">
                    <td style="padding: 12px 0; font-weight: bold; font-size: 15px;">MONTANT TOTAL ${data.avecTVA ? 'TTC' : ''}</td>
                    <td style="text-align: right; font-weight: bold; font-size: 15px; color: #059669;">${formatMontant(montantTTC)}</td>
                </tr>
            </table>
            <p style="margin: 15px 0 0 0; font-style: italic; font-size: 12px; color: #666;">
                Arrêté le présent montant à la somme de: <strong>${nombreEnLettres(Math.round(montantTTC))} francs CFA</strong>
            </p>
        </div>
        
        <p style="text-align: justify; font-size: 13px;"><strong>3.2. Modalités de paiement</strong></p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <table style="width: 100%; font-size: 13px;">
                <tr>
                    <td style="padding: 8px 0;">▸ Acompte à la signature (${data.pourcentageAcompte || 30}%)</td>
                    <td style="text-align: right; font-weight: bold;">${formatMontant(acompte)}</td>
                </tr>
                ${data.echeancier ? data.echeancier.split('\n').map(e => `<tr><td style="padding: 8px 0;">▸ ${e}</td><td></td></tr>`).join('') : `
                <tr>
                    <td style="padding: 8px 0;">▸ Solde à la réception des travaux (${100 - (parseFloat(data.pourcentageAcompte) || 30)}%)</td>
                    <td style="text-align: right; font-weight: bold;">${formatMontant(montantTTC - acompte)}</td>
                </tr>
                `}
            </table>
        </div>
        
        <p style="text-align: justify; font-size: 13px;">
            <strong>3.3.</strong> Les paiements seront effectués par ${data.moyenPaiement || 'virement bancaire, chèque ou espèces'}.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>3.4.</strong> Coordonnées bancaires du Prestataire: ${company.banque}
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>3.5.</strong> En cas de retard de paiement, des pénalités de retard au taux de ${data.tauxPenalite || '1,5'}% par mois 
            seront appliquées de plein droit.
        </p>
    </div>

    <!-- ARTICLE 4: OBLIGATIONS DU PRESTATAIRE -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 4</span>
            OBLIGATIONS DU PRESTATAIRE
        </h3>
        <p style="text-align: justify; font-size: 13px;">Le Prestataire s'engage à:</p>
        <ul style="font-size: 13px; line-height: 1.8;">
            <li>Exécuter les travaux conformément aux règles de l'art et aux normes en vigueur au Sénégal</li>
            <li>Fournir la main d'œuvre qualifiée nécessaire à la bonne réalisation des travaux</li>
            <li>Respecter les délais convenus sauf cas de force majeure</li>
            <li>Informer le Client de l'avancement des travaux et de toute difficulté rencontrée</li>
            <li>Livrer un ouvrage conforme aux spécifications techniques convenues</li>
            <li>Garantir la conformité des travaux pendant une durée de ${data.dureeGarantie || '12'} mois après réception</li>
            <li>Souscrire et maintenir une assurance responsabilité civile professionnelle</li>
        </ul>
    </div>

    <!-- ARTICLE 5: OBLIGATIONS DU CLIENT -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 5</span>
            OBLIGATIONS DU CLIENT
        </h3>
        <p style="text-align: justify; font-size: 13px;">Le Client s'engage à:</p>
        <ul style="font-size: 13px; line-height: 1.8;">
            <li>Permettre l'accès au site de réalisation des travaux</li>
            <li>Fournir les informations et documents nécessaires à la réalisation des travaux</li>
            <li>Régler les sommes dues aux échéances prévues</li>
            <li>Réceptionner les travaux à leur achèvement</li>
            <li>Signaler tout désaccord ou réserve dans les meilleurs délais</li>
        </ul>
    </div>

    <!-- ARTICLE 6: RÉCEPTION DES TRAVAUX -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 6</span>
            RÉCEPTION DES TRAVAUX
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>6.1.</strong> À l'achèvement des travaux, une réception contradictoire sera organisée en présence des deux Parties.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>6.2.</strong> Un procès-verbal de réception sera établi, mentionnant soit la réception sans réserve, 
            soit la réception avec réserves à lever dans un délai convenu.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>6.3.</strong> La réception transfère la garde de l'ouvrage au Client.
        </p>
    </div>

    <!-- ARTICLE 7: GARANTIES -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 7</span>
            GARANTIES
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>7.1.</strong> Le Prestataire accorde au Client une garantie de parfait achèvement d'une durée de 
            <strong>${data.dureeGarantie || '12'} mois</strong> à compter de la réception.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>7.2.</strong> Cette garantie couvre les désordres signalés par le Client pendant cette période, 
            à l'exception de ceux résultant d'un usage anormal ou d'un défaut d'entretien.
        </p>
    </div>

    <!-- ARTICLE 8: RÉSILIATION -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 8</span>
            RÉSILIATION
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>8.1.</strong> En cas de manquement grave d'une Partie à ses obligations, l'autre Partie pourra résilier 
            le présent contrat de plein droit, après mise en demeure restée infructueuse pendant ${data.delaiMiseEnDemeure || '15'} jours.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>8.2.</strong> En cas de résiliation du fait du Client, celui-ci devra régler au Prestataire les travaux 
            déjà réalisés majorés d'une indemnité de ${data.indemnitesResiliation || '10'}%.
        </p>
    </div>

    <!-- ARTICLE 9: LITIGES -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 9</span>
            RÈGLEMENT DES LITIGES
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>9.1.</strong> Les Parties s'efforceront de résoudre à l'amiable tout différend né de l'interprétation 
            ou de l'exécution du présent contrat.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>9.2.</strong> À défaut d'accord amiable dans un délai de ${data.delaiAmiable || '30'} jours, 
            le litige sera soumis aux tribunaux compétents de ${data.tribunalCompetent || 'Dakar, Sénégal'}.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>9.3.</strong> Le présent contrat est soumis au droit ${data.droitApplicable || 'sénégalais et aux Actes Uniformes OHADA'}.
        </p>
    </div>

    <!-- ARTICLE 10: DISPOSITIONS DIVERSES -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 10</span>
            DISPOSITIONS DIVERSES
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>10.1.</strong> Le présent contrat constitue l'intégralité de l'accord entre les Parties et 
            remplace tout accord antérieur écrit ou verbal.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>10.2.</strong> Toute modification du présent contrat devra faire l'objet d'un avenant signé par les deux Parties.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>10.3.</strong> Si l'une des clauses du présent contrat était déclarée nulle, les autres clauses 
            conserveraient leur plein effet.
        </p>
    </div>

    ${data.clausesParticulieres ? `
    <!-- CLAUSES PARTICULIÈRES -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #f59e0b; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ANNEXE</span>
            CLAUSES PARTICULIÈRES
        </h3>
        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="font-size: 13px; white-space: pre-line;">${data.clausesParticulieres}</p>
        </div>
    </div>
    ` : ''}

    <!-- SIGNATURES -->
    <div style="margin-top: 50px; page-break-inside: avoid;">
        <p style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 13px;">
            Fait à ${data.lieuSignature || 'Dakar'}, le ${dateJour}, en deux (2) exemplaires originaux.
        </p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px;">
            <div style="text-align: center;">
                <p style="font-weight: bold; color: #1e3a8a; margin-bottom: 15px; font-size: 13px;">LE PRESTATAIRE</p>
                <p style="font-size: 12px; color: #666; margin-bottom: 10px;">${company.nom}</p>
                <p style="font-size: 12px; margin-bottom: 80px;">${data.representantPrestataire || '___________________'}</p>
                <div style="border-top: 1px solid #333; padding-top: 10px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Signature et cachet</p>
                    <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">(Précédé de la mention "Lu et approuvé")</p>
                </div>
            </div>
            <div style="text-align: center;">
                <p style="font-weight: bold; color: #10b981; margin-bottom: 15px; font-size: 13px;">LE CLIENT</p>
                <p style="font-size: 12px; color: #666; margin-bottom: 10px;">${client.nom || data.clientNom || '___________________'}</p>
                <p style="font-size: 12px; margin-bottom: 80px;">&nbsp;</p>
                <div style="border-top: 1px solid #333; padding-top: 10px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Signature</p>
                    <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">(Précédé de la mention "Lu et approuvé")</p>
                </div>
            </div>
        </div>
    </div>

    <!-- PIED DE PAGE -->
    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #999;">
        <p style="margin: 0;">
            ${company.nom} - ${company.adresse} | Tél: ${company.telephone} | ${company.email}
        </p>
        <p style="margin: 10px 0 0 0; font-style: italic;">
            Document généré le ${new Date().toLocaleString('fr-FR')} - Page 1/1
        </p>
    </div>

</div>
        `
    };
}

// ===================================================
// MODÈLE: CONTRAT DE BAIL PROFESSIONNEL
// ===================================================
function generateContratBail(data) {
    const company = getCompanyInfo();
    const client = data.client ? getClientInfo(data.client) : data.clientInfo || {};
    const numero = generateDocNumber('bail');
    const dateJour = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const loyer = parseFloat(data.loyer) || 0;
    const charges = parseFloat(data.charges) || 0;
    const loyerTotal = loyer + charges;
    const depot = parseFloat(data.depotGarantie) || loyer * 2;
    
    return {
        numero: numero,
        type: 'bail',
        categorie: 'bail',
        titre: `Contrat de Bail N° ${numero}`,
        client: client.nom,
        montant: loyer,
        dateCreation: new Date().toISOString(),
        data: data,
        contenuHTML: `
<div class="document-professionnel" style="font-family: 'Times New Roman', serif; max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; color: #333; line-height: 1.6;">
    
    <!-- EN-TÊTE -->
    <div style="border-bottom: 3px double #10b981; padding-bottom: 20px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h1 style="color: #10b981; font-size: 28px; margin: 0; font-weight: bold;">${company.nom}</h1>
                <p style="color: #666; font-style: italic; margin: 5px 0;">Gestion Immobilière & Location</p>
                <p style="font-size: 12px; color: #555; margin: 10px 0 0 0;">
                    ${company.adresse}<br>
                    Tél: ${company.telephone} | Email: ${company.email}
                </p>
            </div>
            <div style="text-align: right;">
                <div style="background: #10b981; color: white; padding: 15px 25px; border-radius: 8px;">
                    <p style="margin: 0; font-size: 12px; opacity: 0.9;">BAIL N°</p>
                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${numero}</p>
                </div>
                <p style="margin-top: 10px; font-size: 12px; color: #666;">Date: ${dateJour}</p>
            </div>
        </div>
    </div>

    <!-- TITRE DU DOCUMENT -->
    <div style="text-align: center; margin: 40px 0; padding: 25px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 10px; border: 2px solid #10b981;">
        <h2 style="color: #059669; font-size: 26px; margin: 0; text-transform: uppercase; letter-spacing: 3px;">
            Contrat de Bail ${data.typeBail === 'commercial' ? 'Commercial' : data.typeBail === 'professionnel' ? 'Professionnel' : "d'Habitation"}
        </h2>
        <p style="color: #64748b; margin: 10px 0 0 0; font-size: 14px;">
            ${data.typeBail === 'meuble' ? 'Location Meublée' : 'Location Vide'}
        </p>
    </div>

    <!-- PARTIES CONTRACTANTES -->
    <div style="margin: 30px 0;">
        <h3 style="color: #059669; border-bottom: 2px solid #dcfce7; padding-bottom: 10px; font-size: 16px;">
            ENTRE LES SOUSSIGNÉS
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px;">
            <!-- LE BAILLEUR -->
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                <h4 style="color: #059669; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">Le Bailleur</h4>
                <p style="margin: 5px 0;"><strong>${company.nom}</strong></p>
                <p style="margin: 5px 0; font-size: 13px;">Siège: ${company.adresse}</p>
                <p style="margin: 5px 0; font-size: 13px;">Tél: ${company.telephone}</p>
                <p style="margin: 5px 0; font-size: 13px;">Email: ${company.email}</p>
                <p style="margin: 10px 0 0 0; font-size: 13px;">
                    Représenté par: <strong>${data.representantBailleur || 'Le Gérant'}</strong>
                </p>
                <p style="margin-top: 10px; font-style: italic; color: #666; font-size: 12px;">Ci-après dénommé "LE BAILLEUR"</p>
            </div>
            
            <!-- LE LOCATAIRE -->
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h4 style="color: #b45309; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">Le Locataire</h4>
                <p style="margin: 5px 0;"><strong>${client.nom || data.locataireNom || '___________________'}</strong></p>
                <p style="margin: 5px 0; font-size: 13px;">Né(e) le: ${data.locataireDateNaissance || '___________________'}</p>
                <p style="margin: 5px 0; font-size: 13px;">CNI/Passeport: ${data.locataireCNI || '___________________'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Téléphone: ${client.telephone || data.locataireTel || '___________________'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Email: ${client.email || data.locataireEmail || '___________________'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Profession: ${data.locataireProfession || '___________________'}</p>
                <p style="margin-top: 10px; font-style: italic; color: #666; font-size: 12px;">Ci-après dénommé "LE LOCATAIRE"</p>
            </div>
        </div>
    </div>

    <!-- IL A ÉTÉ CONVENU -->
    <div style="text-align: center; margin: 30px 0; padding: 15px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
        <p style="font-weight: bold; font-size: 16px; color: #059669; margin: 0; letter-spacing: 3px;">IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT</p>
    </div>

    <!-- ARTICLE 1: DÉSIGNATION DU BIEN -->
    <div style="margin: 25px 0;">
        <h3 style="color: #059669; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #10b981; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 1</span>
            DÉSIGNATION DES LIEUX LOUÉS
        </h3>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <table style="width: 100%; font-size: 13px;">
                <tr>
                    <td style="padding: 10px 0; width: 35%; font-weight: bold;">Adresse du bien:</td>
                    <td style="padding: 10px 0;">${data.adresseBien || '___________________'}</td>
                </tr>
                <tr style="background: #f0fdf4;">
                    <td style="padding: 10px; font-weight: bold;">Ville:</td>
                    <td style="padding: 10px;">${data.villeBien || 'Dakar'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-weight: bold;">Type de bien:</td>
                    <td style="padding: 10px 0;">${data.typeBien || 'Appartement'}</td>
                </tr>
                <tr style="background: #f0fdf4;">
                    <td style="padding: 10px; font-weight: bold;">Étage:</td>
                    <td style="padding: 10px;">${data.etage || 'RDC'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-weight: bold;">Surface habitable:</td>
                    <td style="padding: 10px 0;"><strong>${data.surface || '___'} m²</strong></td>
                </tr>
                <tr style="background: #f0fdf4;">
                    <td style="padding: 10px; font-weight: bold;">Nombre de pièces:</td>
                    <td style="padding: 10px;">${data.nombrePieces || '___'} pièces</td>
                </tr>
            </table>
        </div>
        
        <p style="font-size: 13px; margin-top: 15px;"><strong>Composition du logement:</strong></p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <p style="font-size: 13px; margin: 0; white-space: pre-line;">${data.compositionLogement || `• Séjour/Salon
• Chambre(s)
• Cuisine
• Salle de bain/WC
• Balcon/Terrasse (le cas échéant)`}</p>
        </div>
        
        ${data.dependances ? `
        <p style="font-size: 13px; margin-top: 15px;"><strong>Dépendances et annexes:</strong></p>
        <p style="font-size: 13px;">${data.dependances}</p>
        ` : ''}
    </div>

    <!-- ARTICLE 2: DURÉE -->
    <div style="margin: 25px 0;">
        <h3 style="color: #059669; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #10b981; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 2</span>
            DURÉE DU BAIL
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.1.</strong> Le présent bail est consenti et accepté pour une durée de <strong>${data.dureeBail || '12'} mois</strong>,
            soit <strong>${data.dureeBail ? Math.floor(data.dureeBail/12) : '1'} an(s)</strong>.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.2.</strong> Date de prise d'effet: <strong>${data.dateEntree ? new Date(data.dateEntree).toLocaleDateString('fr-FR') : '___________________'}</strong>
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.3.</strong> Date d'expiration: <strong>${data.dateFin ? new Date(data.dateFin).toLocaleDateString('fr-FR') : '___________________'}</strong>
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.4.</strong> Le bail sera ${data.renouvellement === 'tacite' ? 'renouvelé par tacite reconduction pour des périodes successives de même durée, sauf dénonciation par l\'une des parties avec un préavis de ' + (data.preavis || '3') + ' mois' : 'à durée déterminée sans reconduction tacite'}.
        </p>
    </div>

    <!-- ARTICLE 3: LOYER ET CHARGES -->
    <div style="margin: 25px 0;">
        <h3 style="color: #059669; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #10b981; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 3</span>
            LOYER ET CHARGES
        </h3>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 15px 0; border: 2px solid #10b981;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                    <td style="padding: 12px 0;">Loyer mensuel hors charges</td>
                    <td style="text-align: right; font-weight: bold; font-size: 16px;">${formatMontant(loyer)}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0;">Provisions sur charges</td>
                    <td style="text-align: right;">${formatMontant(charges)}</td>
                </tr>
                <tr style="border-top: 2px solid #10b981; background: #dcfce7;">
                    <td style="padding: 15px 0; font-weight: bold; font-size: 16px;">TOTAL MENSUEL</td>
                    <td style="text-align: right; font-weight: bold; font-size: 20px; color: #059669;">${formatMontant(loyerTotal)}</td>
                </tr>
            </table>
            <p style="margin: 15px 0 0 0; font-style: italic; font-size: 12px; color: #666; text-align: center;">
                Soit en lettres: <strong>${nombreEnLettres(Math.round(loyerTotal))} francs CFA par mois</strong>
            </p>
        </div>
        
        <p style="text-align: justify; font-size: 13px;">
            <strong>3.1.</strong> Le loyer est payable <strong>${data.periodicite || 'mensuellement'}</strong>, d'avance, 
            le <strong>${data.jourPaiement || 'premier (1er)'}</strong> de chaque mois.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>3.2.</strong> Mode de paiement accepté: ${data.modePaiement || 'Virement bancaire, espèces, Wave, Orange Money'}.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>3.3.</strong> Les charges comprennent: ${data.detailCharges || 'eau, électricité des parties communes, enlèvement des ordures ménagères, entretien des espaces communs'}.
        </p>
        ${data.revisionLoyer ? `
        <p style="text-align: justify; font-size: 13px;">
            <strong>3.4.</strong> Le loyer pourra être révisé annuellement selon l'indice de référence, avec un maximum de ${data.tauxRevision || '5'}% par an.
        </p>
        ` : ''}
    </div>

    <!-- ARTICLE 4: DÉPÔT DE GARANTIE -->
    <div style="margin: 25px 0;">
        <h3 style="color: #059669; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #10b981; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 4</span>
            DÉPÔT DE GARANTIE
        </h3>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 14px;">
                Montant du dépôt de garantie: <strong style="font-size: 18px; color: #b45309;">${formatMontant(depot)}</strong>
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
                Correspondant à <strong>${data.moisGarantie || '2'} mois</strong> de loyer hors charges
            </p>
        </div>
        
        <p style="text-align: justify; font-size: 13px;">
            <strong>4.1.</strong> Ce dépôt est versé à la signature du présent bail et sera restitué au Locataire 
            dans un délai de <strong>${data.delaiRestitution || '2'} mois</strong> après la remise des clés, déduction faite 
            des sommes dues au Bailleur (loyers impayés, réparations locatives, etc.).
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>4.2.</strong> Ce dépôt ne porte pas intérêt et ne peut en aucun cas être utilisé comme paiement 
            du dernier mois de loyer.
        </p>
    </div>

    <!-- ARTICLE 5: ÉTAT DES LIEUX -->
    <div style="margin: 25px 0;">
        <h3 style="color: #059669; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #10b981; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 5</span>
            ÉTAT DES LIEUX
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>5.1.</strong> Un état des lieux contradictoire sera établi lors de l'entrée et de la sortie du Locataire.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>5.2.</strong> À défaut d'état des lieux d'entrée, le Locataire est présumé avoir reçu les lieux en bon état.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>5.3.</strong> Le Locataire devra restituer les lieux dans l'état où il les aura reçus, 
            sauf vétusté normale due à l'usage.
        </p>
    </div>

    <!-- ARTICLE 6: OBLIGATIONS DU BAILLEUR -->
    <div style="margin: 25px 0;">
        <h3 style="color: #059669; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #10b981; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 6</span>
            OBLIGATIONS DU BAILLEUR
        </h3>
        <p style="text-align: justify; font-size: 13px;">Le Bailleur s'engage à:</p>
        <ul style="font-size: 13px; line-height: 1.8;">
            <li>Délivrer au Locataire un logement décent et en bon état d'usage</li>
            <li>Assurer au Locataire la jouissance paisible du logement</li>
            <li>Entretenir les locaux en état de servir à l'usage prévu</li>
            <li>Effectuer les réparations autres que locatives (gros œuvre, toiture, installations principales)</li>
            <li>Fournir au Locataire les quittances de loyer sur demande</li>
            <li>Ne pas s'opposer aux aménagements réalisés par le Locataire (sauf transformation)</li>
        </ul>
    </div>

    <!-- ARTICLE 7: OBLIGATIONS DU LOCATAIRE -->
    <div style="margin: 25px 0;">
        <h3 style="color: #059669; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #10b981; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 7</span>
            OBLIGATIONS DU LOCATAIRE
        </h3>
        <p style="text-align: justify; font-size: 13px;">Le Locataire s'engage à:</p>
        <ul style="font-size: 13px; line-height: 1.8;">
            <li>Payer le loyer et les charges aux termes convenus</li>
            <li>User paisiblement des locaux suivant la destination prévue au bail (${data.destination || 'usage d\'habitation'})</li>
            <li>Répondre des dégradations survenues pendant la durée du bail</li>
            <li>Effectuer les réparations locatives et d'entretien courant</li>
            <li>Ne pas transformer les lieux sans l'accord écrit du Bailleur</li>
            <li>Laisser exécuter les travaux d'amélioration ou d'entretien</li>
            <li>S'assurer contre les risques locatifs (incendie, dégât des eaux)</li>
            <li>Ne pas sous-louer sans accord écrit du Bailleur</li>
            <li>Signaler immédiatement tout sinistre ou dégradation</li>
        </ul>
    </div>

    <!-- ARTICLE 8: RÉSILIATION -->
    <div style="margin: 25px 0;">
        <h3 style="color: #059669; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #10b981; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 8</span>
            RÉSILIATION DU BAIL
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>8.1. Congé par le Locataire:</strong> Le Locataire peut donner congé à tout moment avec un préavis de 
            <strong>${data.preavicLocataire || '3'} mois</strong>, réduit à <strong>${data.preavicReduit || '1'} mois</strong> 
            en cas de mutation professionnelle, perte d'emploi ou raison de santé.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>8.2. Congé par le Bailleur:</strong> Le Bailleur peut donner congé avec un préavis de 
            <strong>${data.preavicBailleur || '6'} mois</strong> avant l'échéance du bail, pour motif légitime et sérieux.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>8.3. Clause résolutoire:</strong> Le présent bail sera résilié de plein droit en cas de:
        </p>
        <ul style="font-size: 13px;">
            <li>Non-paiement du loyer ou des charges après commandement resté infructueux pendant ${data.delaiCommandement || '2'} mois</li>
            <li>Non-paiement du dépôt de garantie</li>
            <li>Défaut d'assurance</li>
            <li>Troubles de voisinage constatés par décision de justice</li>
        </ul>
    </div>

    <!-- ARTICLE 9: CLAUSES PARTICULIÈRES -->
    <div style="margin: 25px 0;">
        <h3 style="color: #059669; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #10b981; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 9</span>
            CLAUSES PARTICULIÈRES
        </h3>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <ul style="font-size: 13px; line-height: 1.8; margin: 0;">
                ${data.animauxAutorises ? '<li>✅ Les animaux domestiques sont autorisés</li>' : '<li>❌ Les animaux domestiques ne sont pas autorisés</li>'}
                ${data.fumeurAutorise ? '<li>✅ Fumer est autorisé dans les lieux</li>' : '<li>❌ Il est interdit de fumer dans les lieux</li>'}
                ${data.activiteProfessionnelle ? '<li>✅ L\'exercice d\'une activité professionnelle libérale est autorisé</li>' : ''}
                ${data.clausesParticulieres ? `<li>${data.clausesParticulieres}</li>` : ''}
            </ul>
        </div>
    </div>

    <!-- ARTICLE 10: ÉLECTION DE DOMICILE ET LITIGES -->
    <div style="margin: 25px 0;">
        <h3 style="color: #059669; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #10b981; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 10</span>
            ÉLECTION DE DOMICILE ET LITIGES
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>10.1.</strong> Pour l'exécution des présentes, les parties élisent domicile:
        </p>
        <ul style="font-size: 13px;">
            <li>Le Bailleur: ${company.adresse}</li>
            <li>Le Locataire: à l'adresse des lieux loués</li>
        </ul>
        <p style="text-align: justify; font-size: 13px;">
            <strong>10.2.</strong> En cas de litige, les parties s'efforceront de trouver une solution amiable. 
            À défaut, les tribunaux de ${data.tribunalCompetent || 'Dakar'} seront seuls compétents.
        </p>
    </div>

    <!-- RÉCAPITULATIF FINANCIER -->
    <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 10px; border: 2px solid #10b981;">
        <h3 style="color: #059669; margin: 0 0 20px 0; text-align: center; font-size: 16px; text-transform: uppercase;">
            📋 Récapitulatif des sommes à verser à l'entrée
        </h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #bbf7d0;">Premier mois de loyer</td>
                <td style="padding: 10px; border-bottom: 1px solid #bbf7d0; text-align: right; font-weight: bold;">${formatMontant(loyerTotal)}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #bbf7d0;">Dépôt de garantie (${data.moisGarantie || '2'} mois)</td>
                <td style="padding: 10px; border-bottom: 1px solid #bbf7d0; text-align: right; font-weight: bold;">${formatMontant(depot)}</td>
            </tr>
            ${data.fraisAgence ? `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #bbf7d0;">Frais d'agence</td>
                <td style="padding: 10px; border-bottom: 1px solid #bbf7d0; text-align: right; font-weight: bold;">${formatMontant(parseFloat(data.fraisAgence))}</td>
            </tr>
            ` : ''}
            <tr style="background: #dcfce7;">
                <td style="padding: 15px; font-weight: bold; font-size: 16px;">TOTAL À L'ENTRÉE</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 20px; color: #059669;">
                    ${formatMontant(loyerTotal + depot + (parseFloat(data.fraisAgence) || 0))}
                </td>
            </tr>
        </table>
    </div>

    <!-- SIGNATURES -->
    <div style="margin-top: 50px; page-break-inside: avoid;">
        <p style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 13px;">
            Fait à ${data.lieuSignature || 'Dakar'}, le ${dateJour}, en deux (2) exemplaires originaux,
            dont un pour chaque partie.
        </p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px;">
            <div style="text-align: center;">
                <p style="font-weight: bold; color: #059669; margin-bottom: 15px; font-size: 14px;">LE BAILLEUR</p>
                <p style="font-size: 12px; color: #666; margin-bottom: 10px;">${company.nom}</p>
                <p style="font-size: 12px; margin-bottom: 80px;">${data.representantBailleur || '___________________'}</p>
                <div style="border-top: 1px solid #333; padding-top: 10px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Signature et cachet</p>
                    <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">(Précédé de la mention "Lu et approuvé")</p>
                </div>
            </div>
            <div style="text-align: center;">
                <p style="font-weight: bold; color: #b45309; margin-bottom: 15px; font-size: 14px;">LE LOCATAIRE</p>
                <p style="font-size: 12px; color: #666; margin-bottom: 10px;">${client.nom || data.locataireNom || '___________________'}</p>
                <p style="font-size: 12px; margin-bottom: 80px;">&nbsp;</p>
                <div style="border-top: 1px solid #333; padding-top: 10px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Signature</p>
                    <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">(Précédé de la mention "Lu et approuvé")</p>
                </div>
            </div>
        </div>
    </div>

    <!-- PIED DE PAGE -->
    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #999;">
        <p style="margin: 0;">
            ${company.nom} - ${company.adresse} | Tél: ${company.telephone} | ${company.email}
        </p>
        <p style="margin: 10px 0 0 0; font-style: italic;">
            Contrat de bail N° ${numero} - Généré le ${new Date().toLocaleString('fr-FR')}
        </p>
    </div>

</div>
        `
    };
}

// ===================================================
// MODÈLE: DEVIS PROFESSIONNEL BTP
// ===================================================
function generateDevisProfessionnel(data) {
    const company = getCompanyInfo();
    const client = data.client ? getClientInfo(data.client) : data.clientInfo || {};
    const numero = generateDocNumber('devis');
    const dateJour = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Calculer les totaux
    const lignes = data.lignes || [];
    const totalHT = lignes.reduce((sum, l) => sum + ((parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnit) || 0)), 0);
    const remise = data.remise ? totalHT * parseFloat(data.remise) / 100 : 0;
    const totalApresRemise = totalHT - remise;
    const tva = data.avecTVA ? totalApresRemise * 0.18 : 0;
    const totalTTC = totalApresRemise + tva;
    
    // Grouper les lignes par catégorie
    const categories = {};
    lignes.forEach(l => {
        const cat = l.categorie || 'Général';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(l);
    });
    
    return {
        numero: numero,
        type: 'devis',
        categorie: 'devis',
        titre: `Devis N° ${numero}`,
        client: client.nom,
        montant: totalTTC,
        dateCreation: new Date().toISOString(),
        data: data,
        contenuHTML: `
<div class="document-professionnel" style="font-family: 'Arial', sans-serif; max-width: 210mm; margin: 0 auto; padding: 15mm; background: white; color: #333; line-height: 1.5;">
    
    <!-- EN-TÊTE -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
        <!-- Logo et infos entreprise -->
        <div style="flex: 1;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 10px; display: inline-block;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${company.nom}</h1>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">${company.slogan}</p>
            </div>
            <div style="margin-top: 15px; font-size: 11px; color: #666;">
                <p style="margin: 3px 0;">📍 ${company.adresse}</p>
                <p style="margin: 3px 0;">📞 ${company.telephone}</p>
                <p style="margin: 3px 0;">✉️ ${company.email}</p>
                <p style="margin: 3px 0;">🌐 ${company.site}</p>
            </div>
        </div>
        
        <!-- Bloc DEVIS -->
        <div style="text-align: right;">
            <div style="background: #f59e0b; color: white; padding: 20px 30px; border-radius: 10px; display: inline-block;">
                <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Devis</p>
                <p style="margin: 5px 0 0 0; font-size: 22px; font-weight: bold;">${numero}</p>
            </div>
            <div style="margin-top: 15px; text-align: right; font-size: 12px; color: #666;">
                <p style="margin: 3px 0;"><strong>Date:</strong> ${dateJour}</p>
                <p style="margin: 3px 0;"><strong>Validité:</strong> ${data.validite || '30'} jours</p>
                <p style="margin: 3px 0;"><strong>Référence:</strong> ${data.reference || '-'}</p>
            </div>
        </div>
    </div>

    <!-- INFORMATIONS CLIENT -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        <div></div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b;">
            <h3 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #f59e0b; letter-spacing: 1px;">Client</h3>
            <p style="margin: 5px 0; font-weight: bold; font-size: 16px;">${client.nom || data.clientNom || '___________________'}</p>
            ${client.type === 'entreprise' || data.clientType === 'entreprise' ? `<p style="margin: 3px 0; font-size: 12px;">NINEA: ${client.ninea || data.clientNinea || '-'}</p>` : ''}
            <p style="margin: 3px 0; font-size: 12px;">${client.adresse || data.clientAdresse || '___________________'}</p>
            <p style="margin: 3px 0; font-size: 12px;">Tél: ${client.telephone || data.clientTel || '___________________'}</p>
            <p style="margin: 3px 0; font-size: 12px;">Email: ${client.email || data.clientEmail || '___________________'}</p>
        </div>
    </div>

    <!-- OBJET DU DEVIS -->
    <div style="margin-bottom: 25px; padding: 15px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #b45309;">OBJET DU DEVIS</h3>
        <p style="margin: 0; font-size: 14px;">${data.objetDevis || 'Travaux de construction / rénovation'}</p>
        ${data.lieuTravaux ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">📍 Lieu: ${data.lieuTravaux}</p>` : ''}
    </div>

    <!-- TABLEAU DES PRESTATIONS -->
    <div style="margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
                <tr style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white;">
                    <th style="padding: 12px; text-align: left; border-radius: 8px 0 0 0;">Désignation</th>
                    <th style="padding: 12px; text-align: center; width: 80px;">Qté</th>
                    <th style="padding: 12px; text-align: center; width: 60px;">Unité</th>
                    <th style="padding: 12px; text-align: right; width: 120px;">P.U. HT</th>
                    <th style="padding: 12px; text-align: right; width: 120px; border-radius: 0 8px 0 0;">Total HT</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(categories).map(([cat, items], catIndex) => `
                    ${Object.keys(categories).length > 1 ? `
                    <tr style="background: #f1f5f9;">
                        <td colspan="5" style="padding: 10px; font-weight: bold; color: #1e3a8a; font-size: 13px;">
                            📁 ${cat}
                        </td>
                    </tr>
                    ` : ''}
                    ${items.map((ligne, index) => `
                    <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 12px;">
                            <strong>${ligne.designation || ligne.description || '-'}</strong>
                            ${ligne.detail ? `<br><span style="font-size: 11px; color: #666;">${ligne.detail}</span>` : ''}
                        </td>
                        <td style="padding: 12px; text-align: center;">${ligne.quantite || 0}</td>
                        <td style="padding: 12px; text-align: center;">${ligne.unite || 'u'}</td>
                        <td style="padding: 12px; text-align: right;">${formatMontant(parseFloat(ligne.prixUnit) || 0)}</td>
                        <td style="padding: 12px; text-align: right; font-weight: bold;">${formatMontant((parseFloat(ligne.quantite) || 0) * (parseFloat(ligne.prixUnit) || 0))}</td>
                    </tr>
                    `).join('')}
                `).join('')}
            </tbody>
        </table>
    </div>

    <!-- RÉCAPITULATIF -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
        <div style="width: 300px;">
            <table style="width: 100%; font-size: 13px;">
                <tr>
                    <td style="padding: 8px;">Total HT</td>
                    <td style="padding: 8px; text-align: right;">${formatMontant(totalHT)}</td>
                </tr>
                ${remise > 0 ? `
                <tr style="color: #059669;">
                    <td style="padding: 8px;">Remise (${data.remise}%)</td>
                    <td style="padding: 8px; text-align: right;">- ${formatMontant(remise)}</td>
                </tr>
                <tr>
                    <td style="padding: 8px;">Net HT</td>
                    <td style="padding: 8px; text-align: right;">${formatMontant(totalApresRemise)}</td>
                </tr>
                ` : ''}
                ${data.avecTVA ? `
                <tr>
                    <td style="padding: 8px;">TVA (18%)</td>
                    <td style="padding: 8px; text-align: right;">${formatMontant(tva)}</td>
                </tr>
                ` : ''}
                <tr style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; font-weight: bold; font-size: 16px;">
                    <td style="padding: 12px; border-radius: 8px 0 0 8px;">TOTAL ${data.avecTVA ? 'TTC' : 'HT'}</td>
                    <td style="padding: 12px; text-align: right; border-radius: 0 8px 8px 0;">${formatMontant(totalTTC)}</td>
                </tr>
            </table>
            <p style="text-align: center; font-size: 11px; color: #666; margin-top: 10px; font-style: italic;">
                Arrêté à la somme de:<br><strong>${nombreEnLettres(Math.round(totalTTC))} francs CFA</strong>
            </p>
        </div>
    </div>

    <!-- CONDITIONS -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #1e3a8a; text-transform: uppercase;">💰 Conditions de paiement</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 11px; color: #555;">
                <li>Acompte à la commande: <strong>${data.acompte || '30'}%</strong> soit ${formatMontant(totalTTC * (parseFloat(data.acompte) || 30) / 100)}</li>
                ${data.echeancier ? data.echeancier.split('\n').map(e => `<li>${e}</li>`).join('') : `
                <li>Situation intermédiaire: <strong>40%</strong></li>
                <li>Solde à la réception: <strong>30%</strong></li>
                `}
            </ul>
            <p style="margin: 10px 0 0 0; font-size: 11px; color: #666;">
                Mode de paiement: ${data.modePaiement || 'Virement, chèque, espèces, Wave, Orange Money'}
            </p>
        </div>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #1e3a8a; text-transform: uppercase;">📅 Délais d'exécution</h4>
            <p style="margin: 0; font-size: 11px; color: #555;">
                <strong>Durée estimée:</strong> ${data.delaiExecution || '___'} ${data.uniteDelai || 'jours ouvrés'}<br>
                <strong>Début prévisionnel:</strong> ${data.dateDebut ? new Date(data.dateDebut).toLocaleDateString('fr-FR') : 'À convenir'}<br>
                <strong>Validité du devis:</strong> ${data.validite || '30'} jours
            </p>
        </div>
    </div>

    <!-- NOTES ET CONDITIONS GÉNÉRALES -->
    ${data.notes ? `
    <div style="margin-bottom: 20px; padding: 15px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #b45309;">📝 Notes</h4>
        <p style="margin: 0; font-size: 11px; white-space: pre-line;">${data.notes}</p>
    </div>
    ` : ''}

    <div style="margin-bottom: 30px; padding: 15px; background: #f1f5f9; border-radius: 8px; font-size: 10px; color: #666;">
        <h4 style="margin: 0 0 10px 0; font-size: 11px; color: #475569; text-transform: uppercase;">Conditions générales</h4>
        <ul style="margin: 0; padding-left: 15px; columns: 2; column-gap: 30px;">
            <li>Ce devis est valable ${data.validite || '30'} jours à compter de sa date d'émission.</li>
            <li>Tout travail supplémentaire fera l'objet d'un avenant.</li>
            <li>Les prix s'entendent ${data.avecTVA ? 'TTC' : 'HT'}, hors frais de déplacement exceptionnels.</li>
            <li>Garantie décennale et responsabilité civile professionnelle souscrites.</li>
            <li>Le client s'engage à permettre l'accès au chantier.</li>
            <li>Tout retard de paiement entraînera des pénalités de ${data.penaliteRetard || '1,5'}% par mois.</li>
        </ul>
    </div>

    <!-- SIGNATURE BON POUR ACCORD -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px;">
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 10px;">
            <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">Pour ${company.nom}</p>
            <p style="font-weight: bold; margin: 0 0 60px 0;">${data.commercial || 'Le service commercial'}</p>
            <div style="border-top: 1px dashed #ccc; padding-top: 10px;">
                <p style="font-size: 10px; color: #999; margin: 0;">Signature</p>
            </div>
        </div>
        <div style="text-align: center; padding: 20px; background: #f0fdf4; border-radius: 10px; border: 2px dashed #10b981;">
            <p style="font-size: 12px; color: #059669; margin: 0 0 5px 0; font-weight: bold;">✅ BON POUR ACCORD</p>
            <p style="font-size: 11px; color: #666; margin: 0 0 10px 0;">Date et signature du client</p>
            <p style="font-size: 10px; color: #666; margin: 0 0 50px 0;">(précédé de la mention manuscrite "Bon pour accord")</p>
            <div style="border-top: 1px dashed #10b981; padding-top: 10px;">
                <p style="font-size: 10px; color: #666; margin: 0;">Signature client: ${client.nom || '_________________'}</p>
            </div>
        </div>
    </div>

    <!-- PIED DE PAGE -->
    <div style="margin-top: 40px; padding-top: 15px; border-top: 2px solid #e2e8f0; text-align: center; font-size: 9px; color: #999;">
        <p style="margin: 0;">
            <strong>${company.nom}</strong> - ${company.adresse} | Tél: ${company.telephone} | ${company.email} | ${company.site}
        </p>
        ${company.banque ? `<p style="margin: 5px 0 0 0;">Banque: ${company.banque}</p>` : ''}
        <p style="margin: 10px 0 0 0; font-style: italic; color: #b0b0b0;">
            Devis N° ${numero} - Page 1/1 - Généré le ${new Date().toLocaleString('fr-FR')}
        </p>
    </div>

</div>
        `
    };
}

// ===================================================
// GESTION DES MODÈLES PERSONNALISÉS
// ===================================================

// Icônes et couleurs disponibles pour les modèles
const templateIcons = [
    { icon: 'description', color: 'blue', label: 'Document' },
    { icon: 'home', color: 'green', label: 'Immobilier' },
    { icon: 'request_quote', color: 'orange', label: 'Devis' },
    { icon: 'verified', color: 'purple', label: 'Attestation' },
    { icon: 'gavel', color: 'red', label: 'Juridique' },
    { icon: 'handshake', color: 'teal', label: 'Contrat' },
    { icon: 'engineering', color: 'amber', label: 'Travaux' },
    { icon: 'receipt', color: 'indigo', label: 'Facture' },
    { icon: 'assignment', color: 'pink', label: 'Rapport' },
    { icon: 'folder', color: 'gray', label: 'Autre' }
];

// Afficher les modèles personnalisés
function renderCustomTemplates() {
    const container = document.getElementById('custom-templates-list');
    if (!container) return;
    
    const templates = JSON.parse(localStorage.getItem('documentTemplates') || '[]');
    
    if (templates.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-6 col-span-full">Aucun modèle personnalisé. Cliquez sur "Créer un modèle" pour commencer.</p>';
        return;
    }
    
    container.innerHTML = templates.map((tpl, index) => {
        const iconConfig = templateIcons.find(i => i.icon === tpl.icon) || templateIcons[0];
        return `
            <div class="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-${iconConfig.color}-300 hover:shadow-lg transition group">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-${iconConfig.color}-100 rounded-xl flex items-center justify-center mr-3">
                            <span class="material-icons text-${iconConfig.color}-600 text-xl">${tpl.icon}</span>
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800">${tpl.nom}</h4>
                            <p class="text-xs text-gray-500">${tpl.categorie || 'Sans catégorie'}</p>
                        </div>
                    </div>
                    <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                        <button onclick="editCustomTemplate(${index})" class="p-1.5 hover:bg-blue-100 rounded-lg" title="Modifier">
                            <span class="material-icons text-blue-600 text-sm">edit</span>
                        </button>
                        <button onclick="deleteCustomTemplate(${index})" class="p-1.5 hover:bg-red-100 rounded-lg" title="Supprimer">
                            <span class="material-icons text-red-600 text-sm">delete</span>
                        </button>
                    </div>
                </div>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">${tpl.description || 'Pas de description'}</p>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-400">Créé le ${new Date(tpl.createdAt).toLocaleDateString('fr-FR')}</span>
                    <button onclick="useCustomTemplate(${index})" class="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium">
                        <span class="material-icons text-sm align-middle mr-1">play_arrow</span>Utiliser
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Ouvrir l'éditeur de modèle (création ou modification)
window.openTemplateEditor = function(editIndex = null) {
    const templates = JSON.parse(localStorage.getItem('documentTemplates') || '[]');
    const template = editIndex !== null ? templates[editIndex] : null;
    const isEdit = template !== null;
    
    const modal = document.createElement('div');
    modal.id = 'template-editor-modal';
    modal.className = 'fixed inset-0 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" onclick="closeTemplateEditor()"></div>
        <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 z-10">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold">${isEdit ? 'Modifier le modèle' : 'Créer un modèle'}</h2>
                            <p class="text-blue-200 text-sm mt-1">Personnalisez votre modèle de document</p>
                        </div>
                        <button onclick="closeTemplateEditor()" class="p-2 hover:bg-white/20 rounded-full transition">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 180px);">
                    <form id="template-editor-form" class="space-y-6">
                        <input type="hidden" id="template-edit-index" value="${editIndex !== null ? editIndex : ''}">
                        
                        <!-- Informations de base -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du modèle *</label>
                                <input type="text" id="template-nom" value="${template?.nom || ''}" required
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    placeholder="Ex: Contrat de location meublée">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
                                <select id="template-categorie" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                                    <option value="contrat" ${template?.categorie === 'contrat' ? 'selected' : ''}>Contrat</option>
                                    <option value="bail" ${template?.categorie === 'bail' ? 'selected' : ''}>Bail</option>
                                    <option value="devis" ${template?.categorie === 'devis' ? 'selected' : ''}>Devis</option>
                                    <option value="attestation" ${template?.categorie === 'attestation' ? 'selected' : ''}>Attestation</option>
                                    <option value="facture" ${template?.categorie === 'facture' ? 'selected' : ''}>Facture</option>
                                    <option value="rapport" ${template?.categorie === 'rapport' ? 'selected' : ''}>Rapport</option>
                                    <option value="autre" ${template?.categorie === 'autre' ? 'selected' : ''}>Autre</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea id="template-description" rows="2"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                placeholder="Description courte du modèle...">${template?.description || ''}</textarea>
                        </div>
                        
                        <!-- Icône -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Icône</label>
                            <div class="grid grid-cols-5 md:grid-cols-10 gap-2" id="template-icons-grid">
                                ${templateIcons.map(ic => `
                                    <button type="button" onclick="selectTemplateIcon('${ic.icon}')" 
                                        class="template-icon-btn p-3 rounded-xl border-2 transition ${template?.icon === ic.icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}"
                                        data-icon="${ic.icon}">
                                        <span class="material-icons text-${ic.color}-600">${ic.icon}</span>
                                    </button>
                                `).join('')}
                            </div>
                            <input type="hidden" id="template-icon" value="${template?.icon || 'description'}">
                        </div>
                        
                        <!-- Champs personnalisés -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <label class="block text-sm font-semibold text-gray-700">Champs du formulaire</label>
                                <button type="button" onclick="addTemplateField()" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    <span class="material-icons align-middle text-sm">add</span> Ajouter un champ
                                </button>
                            </div>
                            <div id="template-fields-container" class="space-y-3">
                                ${(template?.fields || []).map((field, i) => generateFieldRow(field, i)).join('') || ''}
                            </div>
                            <p class="text-xs text-gray-500 mt-2">Définissez les champs qui seront demandés lors de l'utilisation du modèle</p>
                        </div>
                        
                        <!-- Contenu du modèle -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Contenu du modèle (HTML)</label>
                            <p class="text-xs text-gray-500 mb-2">Utilisez {{nom_du_champ}} pour insérer les valeurs des champs. Variables disponibles: {{date}}, {{entreprise}}</p>
                            <textarea id="template-content" rows="12"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                placeholder="<h1>Titre du document</h1>
<p>Date: {{date}}</p>
<p>Client: {{client_nom}}</p>
...">${template?.content || getDefaultTemplateContent()}</textarea>
                        </div>
                    </form>
                </div>
                
                <!-- Footer -->
                <div class="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-between items-center">
                    <button type="button" onclick="closeTemplateEditor()" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition">
                        Annuler
                    </button>
                    <div class="flex space-x-3">
                        <button type="button" onclick="previewTemplateContent()" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition">
                            <span class="material-icons align-middle text-sm mr-1">visibility</span>Aperçu
                        </button>
                        <button type="button" onclick="saveTemplate()" class="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition font-semibold">
                            <span class="material-icons align-middle text-sm mr-1">save</span>${isEdit ? 'Mettre à jour' : 'Enregistrer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Si pas de champs, en ajouter un par défaut
    if (!template?.fields || template.fields.length === 0) {
        addTemplateField();
    }
};

// Générer une ligne de champ
function generateFieldRow(field = {}, index = 0) {
    return `
        <div class="template-field-row flex items-center gap-3 p-3 bg-gray-50 rounded-xl" data-index="${index}">
            <input type="text" placeholder="Nom du champ" value="${field.name || ''}"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm template-field-name">
            <select class="px-3 py-2 border border-gray-300 rounded-lg text-sm template-field-type">
                <option value="text" ${field.type === 'text' ? 'selected' : ''}>Texte</option>
                <option value="number" ${field.type === 'number' ? 'selected' : ''}>Nombre</option>
                <option value="date" ${field.type === 'date' ? 'selected' : ''}>Date</option>
                <option value="email" ${field.type === 'email' ? 'selected' : ''}>Email</option>
                <option value="tel" ${field.type === 'tel' ? 'selected' : ''}>Téléphone</option>
                <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>Texte long</option>
                <option value="select" ${field.type === 'select' ? 'selected' : ''}>Liste déroulante</option>
            </select>
            <input type="text" placeholder="Placeholder" value="${field.placeholder || ''}"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm template-field-placeholder">
            <label class="flex items-center text-sm">
                <input type="checkbox" ${field.required ? 'checked' : ''} class="mr-1 template-field-required">
                Requis
            </label>
            <button type="button" onclick="removeTemplateField(this)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <span class="material-icons text-sm">close</span>
            </button>
        </div>
    `;
}

// Ajouter un champ
window.addTemplateField = function() {
    const container = document.getElementById('template-fields-container');
    const index = container.querySelectorAll('.template-field-row').length;
    container.insertAdjacentHTML('beforeend', generateFieldRow({}, index));
};

// Supprimer un champ
window.removeTemplateField = function(btn) {
    btn.closest('.template-field-row').remove();
};

// Sélectionner une icône
window.selectTemplateIcon = function(icon) {
    document.querySelectorAll('.template-icon-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-50');
        btn.classList.add('border-gray-200');
    });
    const selectedBtn = document.querySelector(`.template-icon-btn[data-icon="${icon}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('border-blue-500', 'bg-blue-50');
        selectedBtn.classList.remove('border-gray-200');
    }
    document.getElementById('template-icon').value = icon;
};

// Contenu par défaut
function getDefaultTemplateContent() {
    return `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
    <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #1e3a8a; margin: 0;">KFS BTP</h1>
        <p style="color: #666;">Dakar, Sénégal</p>
    </div>
    
    <h2 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">{{titre}}</h2>
    
    <p><strong>Date:</strong> {{date}}</p>
    
    <div style="margin: 30px 0;">
        <!-- Votre contenu ici -->
        <p>{{contenu}}</p>
    </div>
    
    <div style="margin-top: 50px; display: flex; justify-content: space-between;">
        <div>
            <p><strong>Signature KFS BTP</strong></p>
        </div>
        <div>
            <p><strong>Signature Client</strong></p>
        </div>
    </div>
</div>`;
}

// Sauvegarder le modèle
window.saveTemplate = function() {
    const nom = document.getElementById('template-nom').value.trim();
    if (!nom) {
        showNotification('Erreur', 'Le nom du modèle est requis', 'error');
        return;
    }
    
    // Récupérer les champs
    const fields = [];
    document.querySelectorAll('.template-field-row').forEach(row => {
        const name = row.querySelector('.template-field-name').value.trim();
        if (name) {
            fields.push({
                name: name,
                type: row.querySelector('.template-field-type').value,
                placeholder: row.querySelector('.template-field-placeholder').value,
                required: row.querySelector('.template-field-required').checked
            });
        }
    });
    
    const template = {
        nom: nom,
        categorie: document.getElementById('template-categorie').value,
        description: document.getElementById('template-description').value.trim(),
        icon: document.getElementById('template-icon').value || 'description',
        fields: fields,
        content: document.getElementById('template-content').value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    const templates = JSON.parse(localStorage.getItem('documentTemplates') || '[]');
    const editIndex = document.getElementById('template-edit-index').value;
    
    if (editIndex !== '') {
        // Mise à jour
        template.createdAt = templates[editIndex].createdAt;
        templates[editIndex] = template;
        showNotification('Modèle mis à jour', `"${nom}" a été modifié`, 'success');
    } else {
        // Nouveau
        templates.push(template);
        showNotification('Modèle créé', `"${nom}" a été enregistré`, 'success');
    }
    
    localStorage.setItem('documentTemplates', JSON.stringify(templates));
    closeTemplateEditor();
    renderCustomTemplates();
};

// Fermer l'éditeur
window.closeTemplateEditor = function() {
    const modal = document.getElementById('template-editor-modal');
    if (modal) modal.remove();
};

// Modifier un modèle
window.editCustomTemplate = function(index) {
    openTemplateEditor(index);
};

// Supprimer un modèle
window.deleteCustomTemplate = function(index) {
    if (!confirm('Supprimer ce modèle ?')) return;
    
    const templates = JSON.parse(localStorage.getItem('documentTemplates') || '[]');
    const nom = templates[index].nom;
    templates.splice(index, 1);
    localStorage.setItem('documentTemplates', JSON.stringify(templates));
    
    showNotification('Modèle supprimé', `"${nom}" a été supprimé`, 'warning');
    renderCustomTemplates();
};

// Utiliser un modèle personnalisé
window.useCustomTemplate = function(index) {
    const templates = JSON.parse(localStorage.getItem('documentTemplates') || '[]');
    const template = templates[index];
    
    if (!template) return;
    
    // Créer un modal avec le formulaire basé sur les champs du modèle
    const modal = document.createElement('div');
    modal.id = 'use-template-modal';
    modal.className = 'fixed inset-0 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" onclick="closeUseTemplateModal()"></div>
        <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 z-10">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-bold">${template.nom}</h2>
                            <p class="text-blue-200 text-sm mt-1">Remplissez les informations pour générer le document</p>
                        </div>
                        <button onclick="closeUseTemplateModal()" class="p-2 hover:bg-white/20 rounded-full transition">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 180px);">
                    <form id="use-template-form" class="space-y-4">
                        <input type="hidden" id="use-template-index" value="${index}">
                        
                        ${template.fields.map(field => `
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    ${field.name} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                                </label>
                                ${field.type === 'textarea' ? 
                                    `<textarea id="tpl-field-${field.name.replace(/\s+/g, '_')}" 
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition"
                                        placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} rows="3"></textarea>` :
                                    `<input type="${field.type}" id="tpl-field-${field.name.replace(/\s+/g, '_')}"
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition"
                                        placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`
                                }
                            </div>
                        `).join('')}
                    </form>
                </div>
                
                <!-- Footer -->
                <div class="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end space-x-3">
                    <button type="button" onclick="closeUseTemplateModal()" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition">
                        Annuler
                    </button>
                    <button type="button" onclick="generateFromTemplate(${index})" class="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition font-semibold">
                        <span class="material-icons align-middle text-sm mr-1">print</span>Générer le document
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.closeUseTemplateModal = function() {
    const modal = document.getElementById('use-template-modal');
    if (modal) modal.remove();
};

// Générer le document à partir du modèle
window.generateFromTemplate = function(index) {
    const templates = JSON.parse(localStorage.getItem('documentTemplates') || '[]');
    const template = templates[index];
    
    // Récupérer les valeurs des champs
    let content = template.content;
    
    // Remplacer les variables système
    content = content.replace(/\{\{date\}\}/g, new Date().toLocaleDateString('fr-FR'));
    content = content.replace(/\{\{entreprise\}\}/g, 'KFS BTP');
    
    // Remplacer les champs personnalisés
    template.fields.forEach(field => {
        const fieldId = `tpl-field-${field.name.replace(/\s+/g, '_')}`;
        const input = document.getElementById(fieldId);
        const value = input ? input.value : '';
        const regex = new RegExp(`\\{\\{${field.name}\\}\\}`, 'g');
        content = content.replace(regex, value);
    });
    
    // Ouvrir le document généré
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${template.nom}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                @media print { body { margin: 20px; } }
            </style>
        </head>
        <body>
            ${content}
            <script>
                setTimeout(() => window.print(), 500);
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
    
    closeUseTemplateModal();
    showNotification('Document généré', `"${template.nom}" a été créé`, 'success');
};

// Aperçu du contenu du modèle
window.previewTemplateContent = function() {
    const content = document.getElementById('template-content').value;
    
    // Remplacer les variables par des exemples
    let preview = content
        .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('fr-FR'))
        .replace(/\{\{entreprise\}\}/g, 'KFS BTP')
        .replace(/\{\{[^}]+\}\}/g, '<span style="background: #fef3c7; padding: 2px 6px; border-radius: 4px;">[Valeur]</span>');
    
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Aperçu du modèle</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .preview-header { background: #1e3a8a; color: white; padding: 15px; margin: -20px -20px 20px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="preview-header">
                <h2 style="margin: 0;">Aperçu du modèle</h2>
                <p style="margin: 5px 0 0; opacity: 0.8;">Les zones en jaune seront remplacées par les valeurs réelles</p>
            </div>
            ${preview}
        </body>
        </html>
    `);
    previewWindow.document.close();
};

// ===================================================
// INTERFACE DE CRÉATION DE DOCUMENTS PROFESSIONNELS
// ===================================================

// Fonction principale appelée depuis le HTML
window.generateDocTemplate = function(type) {
    openDocumentCreationModal(type);
};

// Ouvrir le modal de création de document
function openDocumentCreationModal(type) {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    
    const titles = {
        'contrat': 'Nouveau Contrat de Prestation',
        'bail': 'Nouveau Contrat de Bail',
        'devis': 'Nouveau Devis',
        'attestation': 'Nouvelle Attestation'
    };
    
    const modal = document.createElement('div');
    modal.id = 'doc-creation-modal';
    modal.className = 'fixed inset-0 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" onclick="closeDocCreationModal()"></div>
        <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 z-10">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold">${titles[type] || 'Nouveau Document'}</h2>
                            <p class="text-blue-200 text-sm mt-1">Remplissez les informations ci-dessous</p>
                        </div>
                        <button onclick="closeDocCreationModal()" class="p-2 hover:bg-white/20 rounded-full transition">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 180px);">
                    <form id="doc-creation-form" class="space-y-6">
                        <input type="hidden" id="doc-type" value="${type}">
                        
                        ${type === 'contrat' ? generateContratForm(clients, projets) : ''}
                        ${type === 'bail' ? generateBailForm(clients) : ''}
                        ${type === 'devis' ? generateDevisForm(clients, projets) : ''}
                        ${type === 'attestation' ? generateAttestationForm(clients) : ''}
                    </form>
                </div>
                
                <!-- Footer -->
                <div class="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-between items-center">
                    <button type="button" onclick="closeDocCreationModal()" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition">
                        Annuler
                    </button>
                    <div class="flex space-x-3">
                        <button type="button" onclick="previewDocument()" class="px-6 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition">
                            <span class="material-icons align-middle text-sm mr-1">visibility</span>Aperçu
                        </button>
                        <button type="button" onclick="saveAndGenerateDocument()" class="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition font-semibold">
                            <span class="material-icons align-middle text-sm mr-1">save</span>Générer le document
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialiser les lignes du devis si nécessaire
    if (type === 'devis') {
        window.devisLignes = [{ designation: '', quantite: 1, unite: 'u', prixUnit: 0, categorie: 'Général' }];
        renderDevisLignes();
    }
}

// Formulaire Contrat
function generateContratForm(clients, projets) {
    return `
        <!-- Section Client -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-blue-600">person</span>Informations Client
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Client existant</label>
                    <select id="doc-client-select" onchange="fillClientInfo()" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500">
                        <option value="">-- Nouveau client --</option>
                        ${clients.map(c => `<option value="${c.id || c.nom}">${c.nom} ${c.type === 'entreprise' ? '(Entreprise)' : ''}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Type de client</label>
                    <select id="doc-client-type" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="particulier">Particulier</option>
                        <option value="entreprise">Entreprise</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Nom complet / Raison sociale *</label>
                    <input type="text" id="doc-client-nom" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Téléphone *</label>
                    <input type="tel" id="doc-client-tel" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Email</label>
                    <input type="email" id="doc-client-email" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Adresse</label>
                    <input type="text" id="doc-client-adresse" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div id="doc-client-ninea-container" class="hidden">
                    <label class="block text-gray-700 text-sm font-medium mb-1">NINEA</label>
                    <input type="text" id="doc-client-ninea" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
            </div>
        </div>
        
        <!-- Section Travaux -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-orange-600">construction</span>Description des Travaux
            </h3>
            <div class="grid grid-cols-1 gap-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Projet existant (optionnel)</label>
                    <select id="doc-projet-select" onchange="fillProjetInfo()" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="">-- Sélectionner un projet --</option>
                        ${projets.map(p => `<option value="${p.id || p.nom}">${p.nom}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Description détaillée des travaux *</label>
                    <textarea id="doc-description-travaux" required rows="4" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="• Démolition des cloisons existantes&#10;• Construction mur en parpaing&#10;• Revêtement carrelage 60x60&#10;• Peinture 2 couches"></textarea>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Lieu d'exécution *</label>
                    <input type="text" id="doc-lieu-travaux" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="Adresse du chantier">
                </div>
            </div>
        </div>
        
        <!-- Section Durée -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-purple-600">schedule</span>Durée & Délais
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Durée du contrat</label>
                    <div class="flex">
                        <input type="number" id="doc-duree" value="3" min="1" class="w-20 px-3 py-3 border-2 border-gray-200 rounded-l-xl text-gray-800">
                        <select id="doc-unite-duree" class="px-3 py-3 border-2 border-l-0 border-gray-200 rounded-r-xl text-gray-800">
                            <option value="mois">mois</option>
                            <option value="semaines">semaines</option>
                            <option value="jours">jours</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Date de début</label>
                    <input type="date" id="doc-date-debut" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Date de fin prévue</label>
                    <input type="date" id="doc-date-fin" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
            </div>
        </div>
        
        <!-- Section Prix -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-green-600">payments</span>Montant & Paiement
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Montant HT (FCFA) *</label>
                    <input type="number" id="doc-montant-ht" required min="0" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="0">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">TVA</label>
                    <select id="doc-avec-tva" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="non">Sans TVA</option>
                        <option value="oui">Avec TVA (18%)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Acompte à la signature (%)</label>
                    <input type="number" id="doc-acompte" value="30" min="0" max="100" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Durée garantie (mois)</label>
                    <input type="number" id="doc-garantie" value="12" min="0" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
            </div>
            <div class="mt-4">
                <label class="block text-gray-700 text-sm font-medium mb-1">Échéancier de paiement (optionnel)</label>
                <textarea id="doc-echeancier" rows="2" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="40% à mi-parcours&#10;30% à la réception"></textarea>
            </div>
        </div>
        
        <!-- Section Clauses particulières -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-red-600">gavel</span>Clauses Particulières (optionnel)
            </h3>
            <textarea id="doc-clauses" rows="3" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="Ajoutez ici des clauses spécifiques au contrat..."></textarea>
        </div>
    `;
}

// Formulaire Bail
function generateBailForm(clients) {
    return `
        <!-- Section Locataire -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-amber-600">person</span>Informations Locataire
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Client existant</label>
                    <select id="doc-client-select" onchange="fillClientInfo()" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="">-- Nouveau locataire --</option>
                        ${clients.map(c => `<option value="${c.id || c.nom}">${c.nom}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Nom complet *</label>
                    <input type="text" id="doc-client-nom" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Date de naissance</label>
                    <input type="date" id="doc-locataire-naissance" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">N° CNI / Passeport</label>
                    <input type="text" id="doc-locataire-cni" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Téléphone *</label>
                    <input type="tel" id="doc-client-tel" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Email</label>
                    <input type="email" id="doc-client-email" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Profession</label>
                    <input type="text" id="doc-locataire-profession" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
            </div>
        </div>
        
        <!-- Section Bien -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-green-600">home</span>Description du Bien
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-gray-700 text-sm font-medium mb-1">Adresse complète du bien *</label>
                    <input type="text" id="doc-adresse-bien" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="Numéro, rue, quartier">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Ville</label>
                    <input type="text" id="doc-ville-bien" value="Dakar" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Type de bien</label>
                    <select id="doc-type-bien" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="Appartement">Appartement</option>
                        <option value="Villa">Villa</option>
                        <option value="Studio">Studio</option>
                        <option value="Maison">Maison</option>
                        <option value="Local commercial">Local commercial</option>
                        <option value="Bureau">Bureau</option>
                        <option value="Entrepôt">Entrepôt</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Étage</label>
                    <input type="text" id="doc-etage" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="RDC, 1er, 2ème...">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Surface (m²)</label>
                    <input type="number" id="doc-surface" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Nombre de pièces</label>
                    <input type="number" id="doc-nb-pieces" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Type de bail</label>
                    <select id="doc-type-bail" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="habitation">Habitation</option>
                        <option value="meuble">Meublé</option>
                        <option value="commercial">Commercial</option>
                        <option value="professionnel">Professionnel</option>
                    </select>
                </div>
            </div>
            <div class="mt-4">
                <label class="block text-gray-700 text-sm font-medium mb-1">Composition du logement</label>
                <textarea id="doc-composition" rows="3" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="• Salon/Séjour&#10;• 2 Chambres&#10;• Cuisine équipée&#10;• Salle de bain&#10;• Balcon"></textarea>
            </div>
        </div>
        
        <!-- Section Durée et Loyer -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-blue-600">payments</span>Durée & Conditions Financières
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Durée du bail (mois)</label>
                    <input type="number" id="doc-duree-bail" value="12" min="1" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Date d'entrée *</label>
                    <input type="date" id="doc-date-entree" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Renouvellement</label>
                    <select id="doc-renouvellement" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="tacite">Tacite reconduction</option>
                        <option value="expresse">Renouvellement exprès</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Loyer mensuel (FCFA) *</label>
                    <input type="number" id="doc-loyer" required min="0" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="150000">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Charges mensuelles (FCFA)</label>
                    <input type="number" id="doc-charges" value="0" min="0" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Dépôt de garantie (mois)</label>
                    <input type="number" id="doc-depot-mois" value="2" min="1" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
            </div>
            <div class="mt-4">
                <label class="block text-gray-700 text-sm font-medium mb-1">Détail des charges</label>
                <input type="text" id="doc-detail-charges" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="Eau, électricité parties communes, gardiennage...">
            </div>
        </div>
        
        <!-- Options -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4">Options du bail</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-animaux" class="w-5 h-5 text-green-600 rounded">
                    <span class="text-sm">Animaux autorisés</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-fumeur" class="w-5 h-5 text-green-600 rounded">
                    <span class="text-sm">Fumeur autorisé</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-activite-pro" class="w-5 h-5 text-green-600 rounded">
                    <span class="text-sm">Activité pro</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-revision-loyer" class="w-5 h-5 text-green-600 rounded">
                    <span class="text-sm">Révision loyer</span>
                </label>
            </div>
        </div>
    `;
}

// Formulaire Devis
function generateDevisForm(clients, projets) {
    return `
        <!-- Section Client -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-blue-600">person</span>Client
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Client existant</label>
                    <select id="doc-client-select" onchange="fillClientInfo()" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="">-- Nouveau client --</option>
                        ${clients.map(c => `<option value="${c.id || c.nom}">${c.nom}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Nom / Raison sociale *</label>
                    <input type="text" id="doc-client-nom" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Téléphone</label>
                    <input type="tel" id="doc-client-tel" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Email</label>
                    <input type="email" id="doc-client-email" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-gray-700 text-sm font-medium mb-1">Adresse</label>
                    <input type="text" id="doc-client-adresse" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
            </div>
        </div>
        
        <!-- Objet du devis -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-orange-600">description</span>Objet du Devis
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-gray-700 text-sm font-medium mb-1">Objet *</label>
                    <input type="text" id="doc-objet-devis" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="Travaux de rénovation appartement T3">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Lieu d'exécution</label>
                    <input type="text" id="doc-lieu-travaux" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Référence</label>
                    <input type="text" id="doc-reference" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="REF-2026-001">
                </div>
            </div>
        </div>
        
        <!-- Lignes du devis -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-green-600">list_alt</span>Détail des Prestations
            </h3>
            <div id="devis-lignes-container" class="space-y-3">
                <!-- Lignes dynamiques -->
            </div>
            <button type="button" onclick="addDevisLigne()" class="mt-4 w-full py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-50 transition flex items-center justify-center">
                <span class="material-icons mr-2">add</span>Ajouter une ligne
            </button>
        </div>
        
        <!-- Options financières -->
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-purple-600">settings</span>Options
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">TVA</label>
                    <select id="doc-avec-tva" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="non">Sans TVA</option>
                        <option value="oui">Avec TVA (18%)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Remise (%)</label>
                    <input type="number" id="doc-remise" value="0" min="0" max="100" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Validité (jours)</label>
                    <input type="number" id="doc-validite" value="30" min="1" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Acompte (%)</label>
                    <input type="number" id="doc-acompte" value="30" min="0" max="100" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Délai d'exécution</label>
                    <div class="flex">
                        <input type="number" id="doc-delai" value="15" class="w-20 px-3 py-3 border-2 border-gray-200 rounded-l-xl text-gray-800">
                        <select id="doc-unite-delai" class="px-3 py-3 border-2 border-l-0 border-gray-200 rounded-r-xl text-gray-800">
                            <option value="jours ouvrés">jours ouvrés</option>
                            <option value="jours">jours</option>
                            <option value="semaines">semaines</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Date de début prévue</label>
                    <input type="date" id="doc-date-debut" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
            </div>
        </div>
        
        <!-- Notes -->
        <div class="bg-gray-50 rounded-xl p-5">
            <label class="block text-gray-700 text-sm font-medium mb-1">Notes / Commentaires</label>
            <textarea id="doc-notes" rows="2" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="Informations complémentaires..."></textarea>
        </div>
    `;
}

// Formulaire Attestation
function generateAttestationForm(clients) {
    return `
        <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-purple-600">verified</span>Informations Attestation
            </h3>
            <div class="grid grid-cols-1 gap-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Bénéficiaire</label>
                    <select id="doc-client-select" onchange="fillClientInfo()" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="">-- Sélectionner --</option>
                        ${clients.map(c => `<option value="${c.id || c.nom}">${c.nom}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Nom du bénéficiaire *</label>
                    <input type="text" id="doc-client-nom" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Type d'attestation</label>
                    <select id="doc-type-attestation" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="travail">Attestation de travail</option>
                        <option value="domicile">Attestation de domicile</option>
                        <option value="bonne-execution">Attestation de bonne exécution</option>
                        <option value="paiement">Attestation de paiement</option>
                        <option value="autre">Autre</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Contenu de l'attestation *</label>
                    <textarea id="doc-contenu-attestation" required rows="5" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="Certifie que [NOM] a bien réalisé les travaux de..."></textarea>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">Motif / Usage</label>
                    <input type="text" id="doc-motif" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800" placeholder="Pour faire valoir ce que de droit">
                </div>
            </div>
        </div>
    `;
}

// Note: L'ancienne fonction fillClientInfo a été déplacée vers la section AUTO-REMPLISSAGE CLIENT (ligne ~5159)
// Elle prend maintenant (clientIndex, prefix) en paramètres pour supporter tous les formulaires

// Remplir les infos du projet sélectionné
window.fillProjetInfo = function() {
    const select = document.getElementById('doc-projet-select');
    const projetId = select.value;
    
    if (!projetId) return;
    
    const projet = getProjetInfo(projetId);
    
    if (document.getElementById('doc-description-travaux')) {
        document.getElementById('doc-description-travaux').value = projet.description || '';
    }
    if (document.getElementById('doc-lieu-travaux')) {
        document.getElementById('doc-lieu-travaux').value = projet.adresse || '';
    }
    if (document.getElementById('doc-montant-ht')) {
        document.getElementById('doc-montant-ht').value = projet.budget || '';
    }
    if (document.getElementById('doc-date-debut')) {
        document.getElementById('doc-date-debut').value = projet.dateDebut || '';
    }
    if (document.getElementById('doc-date-fin')) {
        document.getElementById('doc-date-fin').value = projet.dateFin || '';
    }
};

// Gestion des lignes de devis
window.devisLignes = [];

window.addDevisLigne = function() {
    devisLignes.push({ designation: '', quantite: 1, unite: 'u', prixUnit: 0, categorie: 'Général', detail: '' });
    renderDevisLignes();
};

window.removeDevisLigne = function(index) {
    devisLignes.splice(index, 1);
    renderDevisLignes();
};

window.updateDevisLigne = function(index, field, value) {
    devisLignes[index][field] = value;
    renderDevisLignes();
};

function renderDevisLignes() {
    const container = document.getElementById('devis-lignes-container');
    if (!container) return;
    
    const totalHT = devisLignes.reduce((sum, l) => sum + ((parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnit) || 0)), 0);
    
    container.innerHTML = devisLignes.map((ligne, i) => `
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex justify-between items-start mb-3">
                <span class="text-xs font-medium text-gray-500">Ligne ${i + 1}</span>
                <button type="button" onclick="removeDevisLigne(${i})" class="text-red-500 hover:text-red-700">
                    <span class="material-icons text-sm">delete</span>
                </button>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <div class="col-span-5">
                    <input type="text" placeholder="Désignation" value="${ligne.designation}" 
                        onchange="updateDevisLigne(${i}, 'designation', this.value)"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                </div>
                <div class="col-span-2">
                    <input type="number" placeholder="Qté" value="${ligne.quantite}" min="0" step="0.01"
                        onchange="updateDevisLigne(${i}, 'quantite', this.value)"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center">
                </div>
                <div class="col-span-2">
                    <select onchange="updateDevisLigne(${i}, 'unite', this.value)" class="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm">
                        <option value="u" ${ligne.unite === 'u' ? 'selected' : ''}>Unité</option>
                        <option value="m²" ${ligne.unite === 'm²' ? 'selected' : ''}>m²</option>
                        <option value="ml" ${ligne.unite === 'ml' ? 'selected' : ''}>ml</option>
                        <option value="m³" ${ligne.unite === 'm³' ? 'selected' : ''}>m³</option>
                        <option value="kg" ${ligne.unite === 'kg' ? 'selected' : ''}>kg</option>
                        <option value="h" ${ligne.unite === 'h' ? 'selected' : ''}>heure</option>
                        <option value="j" ${ligne.unite === 'j' ? 'selected' : ''}>jour</option>
                        <option value="fft" ${ligne.unite === 'fft' ? 'selected' : ''}>forfait</option>
                    </select>
                </div>
                <div class="col-span-3">
                    <input type="number" placeholder="Prix unit." value="${ligne.prixUnit}" min="0"
                        onchange="updateDevisLigne(${i}, 'prixUnit', this.value)"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right">
                </div>
            </div>
            <div class="flex justify-between items-center mt-2">
                <input type="text" placeholder="Détails (optionnel)" value="${ligne.detail || ''}" 
                    onchange="updateDevisLigne(${i}, 'detail', this.value)"
                    class="flex-1 mr-2 px-3 py-1 border border-gray-200 rounded-lg text-xs text-gray-600">
                <span class="text-sm font-semibold text-blue-600">
                    ${formatMontant((parseFloat(ligne.quantite) || 0) * (parseFloat(ligne.prixUnit) || 0))}
                </span>
            </div>
        </div>
    `).join('');
    
    // Ajouter le total
    container.innerHTML += `
        <div class="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 mt-4">
            <div class="flex justify-between items-center">
                <span class="font-bold text-blue-800">Total HT</span>
                <span class="text-xl font-bold text-blue-600">${formatMontant(totalHT)}</span>
            </div>
        </div>
    `;
}

// Fermer le modal
window.closeDocCreationModal = function() {
    const modal = document.getElementById('doc-creation-modal');
    if (modal) modal.remove();
};

// Prévisualiser le document
window.previewDocument = function() {
    const formData = collectFormData();
    if (!formData) return;
    
    const type = document.getElementById('doc-type').value;
    let doc;
    
    switch(type) {
        case 'contrat':
            doc = generateContratPrestation(formData);
            break;
        case 'bail':
            doc = generateContratBail(formData);
            break;
        case 'devis':
            formData.lignes = devisLignes;
            doc = generateDevisProfessionnel(formData);
            break;
        default:
            showNotification('Erreur', 'Type de document non supporté', 'error');
            return;
    }
    
    // Ouvrir la prévisualisation
    const previewWindow = window.open('', '_blank', 'width=900,height=700');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${doc.titre}</title>
            <style>
                body { margin: 0; padding: 20px; background: #f0f0f0; }
                .document-professionnel { box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                @media print { body { background: white; padding: 0; } .document-professionnel { box-shadow: none; } }
            </style>
        </head>
        <body>
            ${doc.contenuHTML}
            <div style="text-align: center; margin-top: 20px; padding: 10px;">
                <button onclick="window.print()" style="padding: 10px 30px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                    🖨️ Imprimer
                </button>
            </div>
        </body>
        </html>
    `);
};

// Sauvegarder et générer le document
window.saveAndGenerateDocument = function() {
    const formData = collectFormData();
    if (!formData) return;
    
    const type = document.getElementById('doc-type').value;
    let doc;
    
    switch(type) {
        case 'contrat':
            doc = generateContratPrestation(formData);
            break;
        case 'bail':
            doc = generateContratBail(formData);
            break;
        case 'devis':
            formData.lignes = devisLignes;
            doc = generateDevisProfessionnel(formData);
            break;
        default:
            showNotification('Erreur', 'Type de document non supporté', 'error');
            return;
    }
    
    // Sauvegarder dans localStorage
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    documents.push({
        id: Date.now(),
        numero: doc.numero,
        nom: doc.titre,
        type: doc.type,
        categorie: doc.categorie,
        client: doc.client,
        montant: doc.montant,
        contenuHTML: doc.contenuHTML,
        data: doc.data,
        dateCreation: doc.dateCreation,
        statut: 'brouillon'
    });
    localStorage.setItem('documents', JSON.stringify(documents));
    
    // Fermer le modal
    closeDocCreationModal();
    
    // Rafraîchir la liste
    if (typeof renderDocuments === 'function') renderDocuments();
    if (typeof updateDocumentStats === 'function') updateDocumentStats();
    
    // Notification
    showNotification('Document créé', `${doc.titre} a été généré avec succès`, 'success');
    
    // Ouvrir la prévisualisation
    viewDocumentByNumero(doc.numero);
};

// Voir un document par son numéro
window.viewDocumentByNumero = function(numero) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const index = documents.findIndex(d => d.numero === numero);
    if (index >= 0) {
        viewDocument(index);
    }
};

// Collecter les données du formulaire
function collectFormData() {
    const type = document.getElementById('doc-type').value;
    const data = {};
    
    // Client
    data.clientNom = document.getElementById('doc-client-nom')?.value || '';
    data.clientTel = document.getElementById('doc-client-tel')?.value || '';
    data.clientEmail = document.getElementById('doc-client-email')?.value || '';
    data.clientAdresse = document.getElementById('doc-client-adresse')?.value || '';
    data.clientType = document.getElementById('doc-client-type')?.value || 'particulier';
    data.clientNinea = document.getElementById('doc-client-ninea')?.value || '';
    
    // Validation basique
    if (!data.clientNom) {
        showNotification('Erreur', 'Le nom du client est obligatoire', 'error');
        return null;
    }
    
    if (type === 'contrat') {
        data.descriptionTravaux = document.getElementById('doc-description-travaux')?.value || '';
        data.lieuTravaux = document.getElementById('doc-lieu-travaux')?.value || '';
        data.dureeContrat = document.getElementById('doc-duree')?.value || '';
        data.uniteDuree = document.getElementById('doc-unite-duree')?.value || 'mois';
        data.dateDebut = document.getElementById('doc-date-debut')?.value || '';
        data.dateFin = document.getElementById('doc-date-fin')?.value || '';
        data.montantHT = document.getElementById('doc-montant-ht')?.value || 0;
        data.avecTVA = document.getElementById('doc-avec-tva')?.value === 'oui';
        data.pourcentageAcompte = document.getElementById('doc-acompte')?.value || 30;
        data.dureeGarantie = document.getElementById('doc-garantie')?.value || 12;
        data.echeancier = document.getElementById('doc-echeancier')?.value || '';
        data.clausesParticulieres = document.getElementById('doc-clauses')?.value || '';
    }
    
    if (type === 'bail') {
        data.locataireNom = data.clientNom;
        data.locataireTel = data.clientTel;
        data.locataireEmail = data.clientEmail;
        data.locataireDateNaissance = document.getElementById('doc-locataire-naissance')?.value || '';
        data.locataireCNI = document.getElementById('doc-locataire-cni')?.value || '';
        data.locataireProfession = document.getElementById('doc-locataire-profession')?.value || '';
        data.adresseBien = document.getElementById('doc-adresse-bien')?.value || '';
        data.villeBien = document.getElementById('doc-ville-bien')?.value || 'Dakar';
        data.typeBien = document.getElementById('doc-type-bien')?.value || 'Appartement';
        data.etage = document.getElementById('doc-etage')?.value || '';
        data.surface = document.getElementById('doc-surface')?.value || '';
        data.nombrePieces = document.getElementById('doc-nb-pieces')?.value || '';
        data.typeBail = document.getElementById('doc-type-bail')?.value || 'habitation';
        data.compositionLogement = document.getElementById('doc-composition')?.value || '';
        data.dureeBail = document.getElementById('doc-duree-bail')?.value || 12;
        data.dateEntree = document.getElementById('doc-date-entree')?.value || '';
        data.renouvellement = document.getElementById('doc-renouvellement')?.value || 'tacite';
        data.loyer = document.getElementById('doc-loyer')?.value || 0;
        data.charges = document.getElementById('doc-charges')?.value || 0;
        data.moisGarantie = document.getElementById('doc-depot-mois')?.value || 2;
        data.depotGarantie = parseFloat(data.loyer) * parseFloat(data.moisGarantie);
        data.detailCharges = document.getElementById('doc-detail-charges')?.value || '';
        data.animauxAutorises = document.getElementById('doc-animaux')?.checked || false;
        data.fumeurAutorise = document.getElementById('doc-fumeur')?.checked || false;
        data.activiteProfessionnelle = document.getElementById('doc-activite-pro')?.checked || false;
        data.revisionLoyer = document.getElementById('doc-revision-loyer')?.checked || false;
    }
    
    if (type === 'devis') {
        data.objetDevis = document.getElementById('doc-objet-devis')?.value || '';
        data.lieuTravaux = document.getElementById('doc-lieu-travaux')?.value || '';
        data.reference = document.getElementById('doc-reference')?.value || '';
        data.avecTVA = document.getElementById('doc-avec-tva')?.value === 'oui';
        data.remise = document.getElementById('doc-remise')?.value || 0;
        data.validite = document.getElementById('doc-validite')?.value || 30;
        data.acompte = document.getElementById('doc-acompte')?.value || 30;
        data.delaiExecution = document.getElementById('doc-delai')?.value || '';
        data.uniteDelai = document.getElementById('doc-unite-delai')?.value || 'jours ouvrés';
        data.dateDebut = document.getElementById('doc-date-debut')?.value || '';
        data.notes = document.getElementById('doc-notes')?.value || '';
    }
    
    return data;
}

// ===================================================
// MODULE: PWA (Progressive Web App)
// ===================================================
let deferredPrompt = null;

function initPWA() {
    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker enregistré:', registration.scope);
            })
            .catch(error => {
                console.log('Erreur Service Worker:', error);
            });
    }
    
    // Intercepter l'événement d'installation
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Afficher le bouton d'installation
        const prompt = document.getElementById('pwa-install-prompt');
        if (prompt) {
            prompt.classList.remove('hidden');
        }
    });
    
    // Bouton installer
    document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            showNotification('Application installée', 'KFS Admin est maintenant sur votre écran d\'accueil', 'success');
        }
        
        deferredPrompt = null;
        document.getElementById('pwa-install-prompt')?.classList.add('hidden');
    });
    
    // Bouton fermer
    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
        document.getElementById('pwa-install-prompt')?.classList.add('hidden');
    });
    
    // Détecter si déjà installé
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        document.getElementById('pwa-install-prompt')?.classList.add('hidden');
    });
}

// ===================================================
// MODULE: MISES À JOUR
// ===================================================

function initUpdates() {
    // Charger les notes de mise à jour personnalisées
    loadCustomUpdates();
    
    // Formulaire d'ajout de note de version
    const form = document.getElementById('update-note-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addUpdateNote();
        });
    }
}

function loadCustomUpdates() {
    const customUpdates = JSON.parse(localStorage.getItem('siteUpdates') || '[]');
    const container = document.getElementById('changelog-list');
    if (!container || customUpdates.length === 0) return;
    
    // Ajouter les mises à jour personnalisées au début
    const existingContent = container.innerHTML;
    let customHTML = '';
    
    const typeColors = {
        'feature': { border: 'green', bg: 'green' },
        'fix': { border: 'red', bg: 'red' },
        'improvement': { border: 'blue', bg: 'blue' },
        'security': { border: 'yellow', bg: 'yellow' }
    };
    
    const typeEmojis = {
        'feature': '🚀',
        'fix': '🐛',
        'improvement': '⚡',
        'security': '🔐'
    };
    
    customUpdates.reverse().forEach(update => {
        const colors = typeColors[update.type] || typeColors.feature;
        const emoji = typeEmojis[update.type] || '📝';
        const details = update.details ? update.details.split('\n').filter(d => d.trim()).map(d => `<li>✅ ${d.replace(/^[-•]\s*/, '')}</li>`).join('') : '';
        
        customHTML += `
            <div class="border-l-4 border-${colors.border}-500 pl-4 py-2 bg-${colors.bg}-50 rounded-r-xl">
                <div class="flex items-center justify-between">
                    <span class="bg-${colors.bg}-100 text-${colors.bg}-700 px-3 py-1 rounded-full text-sm font-bold">v${update.version}</span>
                    <div class="flex items-center gap-2">
                        <span class="text-gray-500 text-sm">${update.date}</span>
                        <button onclick="deleteUpdateNote('${update.id}')" class="text-red-500 hover:text-red-700">
                            <span class="material-icons text-sm">delete</span>
                        </button>
                    </div>
                </div>
                <h5 class="font-semibold text-gray-800 mt-2">${emoji} ${update.title}</h5>
                ${details ? `<ul class="text-sm text-gray-600 mt-2 space-y-1">${details}</ul>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = customHTML + existingContent;
}

function addUpdateNote() {
    const version = document.getElementById('update-version').value.trim();
    const type = document.getElementById('update-type').value;
    const title = document.getElementById('update-title').value.trim();
    const details = document.getElementById('update-details').value.trim();
    
    if (!version || !title) {
        alert('Veuillez remplir la version et le titre');
        return;
    }
    
    const updates = JSON.parse(localStorage.getItem('siteUpdates') || '[]');
    const newUpdate = {
        id: Date.now().toString(),
        version,
        type,
        title,
        details,
        date: new Date().toLocaleDateString('fr-FR')
    };
    
    updates.push(newUpdate);
    localStorage.setItem('siteUpdates', JSON.stringify(updates));
    
    // Mettre à jour la version courante
    document.getElementById('current-version').textContent = version;
    localStorage.setItem('siteVersion', version);
    
    // Réinitialiser le formulaire
    document.getElementById('update-note-form').reset();
    
    // Afficher notification
    showNotification('Note de version ajoutée !', 'success');
    
    // Recharger la liste
    location.reload();
}

function deleteUpdateNote(id) {
    if (!confirm('Supprimer cette note de version ?')) return;
    
    let updates = JSON.parse(localStorage.getItem('siteUpdates') || '[]');
    updates = updates.filter(u => u.id !== id);
    localStorage.setItem('siteUpdates', JSON.stringify(updates));
    
    showNotification('Note supprimée', 'success');
    location.reload();
}

function clearAllCaches() {
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    
    // Vider aussi le localStorage temporaire
    sessionStorage.clear();
    
    showNotification('Cache vidé ! Rechargez la page.', 'success');
    setTimeout(() => location.reload(true), 1500);
}

function updateServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) {
                reg.update().then(() => {
                    showNotification('Service Worker mis à jour !', 'success');
                });
            } else {
                showNotification('Aucun Service Worker trouvé', 'warning');
            }
        });
    } else {
        showNotification('Service Worker non supporté', 'error');
    }
}

// ===================================================
// MODULE: MAINTENANCE ET MONITORING
// ===================================================

function initMaintenance() {
    // Charger l'état actuel
    loadMaintenanceStatus();
    loadErrorLogs();
    loadHealthCheck();
    
    // Toggle maintenance options
    const toggle = document.getElementById('maintenance-toggle');
    if (toggle) {
        toggle.addEventListener('change', function() {
            const options = document.getElementById('maintenance-options');
            if (this.checked) {
                options.classList.remove('hidden');
            } else {
                options.classList.add('hidden');
                deactivateMaintenance();
            }
        });
    }
}

// Note: Le contenu HTML du module maintenance est maintenant directement dans admin.html
function renderMaintenanceModule() {
    // Cette fonction n'est plus nécessaire car le HTML est statique
    return;
}

function loadMaintenanceStatus() {
    const status = JSON.parse(localStorage.getItem('maintenanceMode') || '{}');
    const toggle = document.getElementById('maintenance-toggle');
    if (toggle && status.active) {
        toggle.checked = true;
        document.getElementById('maintenance-options')?.classList.remove('hidden');
        document.getElementById('maintenance-message').value = status.message || '';
    }
}

function loadHealthCheck() {
    // Calculer l'usage du localStorage
    let totalSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length * 2;
        }
    }
    const sizeKB = (totalSize / 1024).toFixed(2);
    const maxKB = 5120; // 5 MB max
    const percent = ((totalSize / 1024 / maxKB) * 100).toFixed(1);
    
    const storageEl = document.getElementById('storage-usage');
    if (storageEl) {
        storageEl.textContent = `${sizeKB} KB / 5 MB (${percent}%)`;
        if (percent > 80) {
            storageEl.classList.add('text-red-600');
        }
    }
    
    // Vérifier le Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
            const swEl = document.getElementById('sw-status');
            if (swEl) {
                if (reg) {
                    swEl.textContent = 'Actif ✓';
                    swEl.classList.add('text-green-600');
                } else {
                    swEl.textContent = 'Non enregistré';
                    swEl.classList.add('text-yellow-600');
                }
            }
        });
    }
}

function loadErrorLogs() {
    const logs = JSON.parse(localStorage.getItem('kfs_error_logs') || '[]');
    const container = document.getElementById('error-logs-list');
    if (!container) return;
    
    if (logs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <span class="material-icons text-4xl mb-2">check_circle</span>
                <p>Aucune erreur enregistrée</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = logs.slice(0, 20).map((log, index) => `
        <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <p class="font-semibold text-red-800">${escapeHtml(log.type || 'Erreur')}</p>
                    <p class="text-sm text-red-600">${escapeHtml(log.message || 'Message inconnu')}</p>
                    <p class="text-xs text-gray-500 mt-1">${new Date(log.timestamp).toLocaleString('fr-FR')}</p>
                </div>
                <span class="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">#${index + 1}</span>
            </div>
        </div>
    `).join('');
}

function refreshErrorLogs() {
    loadErrorLogs();
    showNotification('Logs rafraîchis', '', 'info');
}

function exportErrorLogs() {
    const logs = JSON.parse(localStorage.getItem('kfs_error_logs') || '[]');
    const report = {
        generated: new Date().toISOString(),
        site: 'KFS BTP',
        totalErrors: logs.length,
        errors: logs
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kfs-btp-errors-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Logs exportés', 'Fichier téléchargé', 'success');
}

function clearErrorLogs() {
    if (confirm('Voulez-vous vraiment effacer tous les logs d\'erreurs ?')) {
        localStorage.removeItem('kfs_error_logs');
        loadErrorLogs();
        showNotification('Logs effacés', '', 'success');
    }
}

function activateMaintenance() {
    const message = document.getElementById('maintenance-message')?.value || '';
    const duration = parseInt(document.getElementById('maintenance-duration')?.value) || 2;
    
    const maintenanceData = {
        active: true,
        message: message,
        startTime: new Date().toISOString(),
        estimatedEnd: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
    };
    
    localStorage.setItem('maintenanceMode', JSON.stringify(maintenanceData));
    
    // Mettre à jour health-check.json (simulation - en production, utilisez une API)
    showNotification('Mode maintenance activé', `Durée estimée: ${duration}h`, 'warning');
    
    // Instructions pour l'utilisateur
    alert(`Mode maintenance activé !

Pour que les visiteurs voient la page de maintenance, vous devez :

1. Sur Vercel: Ajouter une règle de redirection dans vercel.json
2. Sur Netlify: Ajouter une règle dans _redirects

Ou configurer votre hébergeur pour rediriger vers maintenance.html`);
}

function deactivateMaintenance() {
    localStorage.removeItem('maintenanceMode');
    showNotification('Mode maintenance désactivé', 'Le site est de nouveau accessible', 'success');
}

async function clearCache() {
    try {
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
        }
        showNotification('Cache vidé', 'Tous les caches ont été supprimés', 'success');
    } catch (e) {
        showNotification('Erreur', 'Impossible de vider le cache', 'error');
    }
}

async function reloadServiceWorker() {
    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let reg of registrations) {
                await reg.update();
            }
            showNotification('Service Worker mis à jour', '', 'success');
            loadHealthCheck();
        }
    } catch (e) {
        showNotification('Erreur', 'Impossible de mettre à jour le SW', 'error');
    }
}

async function testConnectivity() {
    const startTime = Date.now();
    try {
        const response = await fetch('health-check.json?' + Date.now());
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        if (response.ok) {
            showNotification('Connexion OK', `Latence: ${latency}ms`, 'success');
        } else {
            showNotification('Problème de connexion', `Statut: ${response.status}`, 'warning');
        }
    } catch (e) {
        showNotification('Hors ligne', 'Vérifiez votre connexion internet', 'error');
    }
}

async function runDiagnostics() {
    const results = [];
    
    // Test localStorage
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        results.push('✅ LocalStorage: OK');
    } catch (e) {
        results.push('❌ LocalStorage: Erreur - ' + e.message);
    }
    
    // Test sessionStorage
    try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        results.push('✅ SessionStorage: OK');
    } catch (e) {
        results.push('❌ SessionStorage: Erreur - ' + e.message);
    }
    
    // Test Service Worker
    if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        results.push(reg ? '✅ Service Worker: Enregistré' : '⚠️ Service Worker: Non enregistré');
    } else {
        results.push('⚠️ Service Worker: Non supporté');
    }
    
    // Test connexion
    results.push(navigator.onLine ? '✅ Connexion: En ligne' : '❌ Connexion: Hors ligne');
    
    // Mémoire
    if (performance && performance.memory) {
        const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
        const total = Math.round(performance.memory.totalJSHeapSize / 1048576);
        results.push(`✅ Mémoire JS: ${used} MB / ${total} MB`);
    }
    
    // Nombre d'erreurs
    const errors = JSON.parse(localStorage.getItem('kfs_error_logs') || '[]');
    results.push(`📊 Erreurs enregistrées: ${errors.length}`);
    
    alert('=== DIAGNOSTIC KFS BTP ===\n\n' + results.join('\n'));
}

// Helper pour échapper le HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
