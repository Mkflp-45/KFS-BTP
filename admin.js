// Correction bug : fonction dashboard manquante (empêche tout le JS de fonctionner)
function initDashboard() {
    // Mettre à jour les statistiques du dashboard
    updateStats();
    // Afficher les messages récents
    renderRecentMessages();
}

// ================= MODULE : MESSAGES =====================
function initMessages() {
    // Afficher la liste des messages
    renderMessages();
    // Mettre à jour les statistiques
    updateStats();
}
// ================= MODULE : AUTHENTIFICATION ADMIN =====================
function initLogin() {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    // Si déjà authentifié, afficher le dashboard
    if (sessionStorage.getItem('adminAuth') === 'true') {
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboard) dashboard.classList.remove('hidden');
        return;
    }
    // Sinon, afficher l'écran de connexion
    if (loginScreen) loginScreen.style.display = '';
    if (dashboard) dashboard.classList.add('hidden');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            let pwd = document.getElementById('login-password').value;
            let stored = localStorage.getItem('adminPassword');
            if (!stored) stored = btoa('admin123');
            if (btoa(pwd) === stored) {
                sessionStorage.setItem('adminAuth', 'true');
                if (loginScreen) loginScreen.style.display = 'none';
                if (dashboard) dashboard.classList.remove('hidden');
                if (loginError) loginError.classList.add('hidden');
            } else {
                if (loginError) loginError.classList.remove('hidden');
            }
        };
    }
}
// ================= FIN MODULE AUTH =====================
// ================= MODAL UTILS =====================
// ================= MODULE : MODÈLES DE DOCUMENTS =====================
// Catégories et icônes disponibles
const KFS_DOC_CATEGORIES = [
    { value: 'contrat', label: 'Contrat', icon: 'handshake' },
    { value: 'bail', label: 'Bail', icon: 'home' },
    { value: 'devis', label: 'Devis', icon: 'request_quote' },
    { value: 'attestation', label: 'Attestation', icon: 'verified' },
    { value: 'facture', label: 'Facture', icon: 'receipt' },
    { value: 'rapport', label: 'Rapport', icon: 'assignment' },
    { value: 'autre', label: 'Autre', icon: 'folder' }
];

// Initialisation du module (à appeler dans initDocuments)
window.initKFSModeles = function() {
    renderKFSModelesList();
    document.getElementById('btn-add-modele')?.addEventListener('click', openKFSModeleForm);
};

// Affiche la liste des modèles
function renderKFSModelesList() {
    const container = document.getElementById('kfs-modeles-list');
    if (!container) return;
    let modeles = [];
    try {
        modeles = JSON.parse(localStorage.getItem('documentTemplates') || '[]');
    } catch(e) { modeles = []; }
    if (!Array.isArray(modeles)) modeles = [];
    if (modeles.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-6 col-span-full">Aucun modèle. Cliquez sur "Créer un modèle".</p>';
        return;
    }
    container.innerHTML = modeles.map((tpl, i) => `
        <div class="bg-white border-2 border-gray-100 rounded-xl p-4 mb-3 flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-3">
                <span class="material-icons text-blue-600">${getKFSIcon(tpl.categorie)}</span>
                <div>
                    <div class="font-bold text-gray-800">${tpl.nom}</div>
                    <div class="text-xs text-gray-500">${tpl.categorie || 'Autre'}${tpl.description ? ' - ' + tpl.description : ''}</div>
                </div>
            </div>
            <div class="flex gap-2 mt-3 md:mt-0">
                <button onclick="window.openKFSModeleForm(${i})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Éditer</button>
                <button onclick="window.deleteKFSModele(${i})" class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Supprimer</button>
                <button onclick="window.useKFSModele(${i})" class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Utiliser</button>
            </div>
        </div>
    `).join('');
}

function getKFSIcon(cat) {
    const found = KFS_DOC_CATEGORIES.find(c => c.value === cat);
    return found ? found.icon : 'folder';
}

// Ouvre le formulaire d'ajout/édition
window.openKFSModeleForm = function(index = null) {
    let modeles = [];
    try { modeles = JSON.parse(localStorage.getItem('documentTemplates') || '[]'); } catch(e) { modeles = []; }
    const tpl = (index !== null && modeles[index]) ? modeles[index] : { nom: '', description: '', categorie: '', fields: [], content: '' };
    window.openKFSModal(`
        <div class='fixed inset-0 bg-black/60 backdrop-blur-sm' onclick='window.closeKFSModal()'></div>
        <div class='relative min-h-screen flex items-center justify-center p-4'>
            <div class='relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
                <form id='kfs-modele-form' class='p-6 space-y-4'>
                    <h2 class='text-xl font-bold mb-2'>${index !== null ? 'Modifier' : 'Créer'} un modèle</h2>
                    <div><label class='block text-sm font-semibold mb-1'>Nom *</label><input type='text' name='nom' value='${tpl.nom || ''}' required class='w-full px-4 py-3 border-2 border-gray-200 rounded-xl'></div>
                    <div><label class='block text-sm font-semibold mb-1'>Catégorie *</label><select name='categorie' required class='w-full px-4 py-3 border-2 border-gray-200 rounded-xl'>${KFS_DOC_CATEGORIES.map(c => `<option value='${c.value}' ${tpl.categorie === c.value ? 'selected' : ''}>${c.label}</option>`).join('')}</select></div>
                    <div><label class='block text-sm font-semibold mb-1'>Description</label><input type='text' name='description' value='${tpl.description || ''}' class='w-full px-4 py-3 border-2 border-gray-200 rounded-xl'></div>
                    <div><label class='block text-sm font-semibold mb-1'>Champs du formulaire</label><div id='kfs-fields-list'>${renderKFSFields(tpl.fields)}</div><button type='button' onclick='window.addKFSField()' class='mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200'>Ajouter un champ</button></div>
                    <div><label class='block text-sm font-semibold mb-1'>Contenu du modèle (HTML)</label><textarea name='content' rows='6' class='w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-mono'>${tpl.content || ''}</textarea></div>
                    <div class='flex justify-end gap-2 mt-4'><button type='button' onclick='window.closeKFSModal()' class='px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300'>Annuler</button><button type='submit' class='px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold'>${index !== null ? 'Enregistrer' : 'Créer'}</button></div>
                </form>
            </div>
        </div>
    `);
    // Ajout dynamique de champs
    window.addKFSField = function() {
        const list = document.getElementById('kfs-fields-list');
        if (!list) return;
        list.insertAdjacentHTML('beforeend', renderKFSFieldRow({}));
    };
    // Suppression dynamique de champ
    window.removeKFSField = function(btn) {
        btn.closest('.kfs-field-row').remove();
    };
    // Soumission du formulaire
    document.getElementById('kfs-modele-form').onsubmit = function(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this));
        // Récupérer les champs dynamiques
        const fields = Array.from(document.querySelectorAll('.kfs-field-row')).map(row => ({
            name: row.querySelector('input[name="field-name"]').value.trim(),
            type: row.querySelector('select[name="field-type"]').value,
            required: row.querySelector('input[name="field-required"]').checked,
            placeholder: row.querySelector('input[name="field-placeholder"]').value
        })).filter(f => f.name);
        const modele = {
            nom: data.nom,
            categorie: data.categorie,
            description: data.description,
            fields,
            content: data.content,
            createdAt: tpl.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        let modeles = [];
        try { modeles = JSON.parse(localStorage.getItem('documentTemplates') || '[]'); } catch(e) { modeles = []; }
        if (index !== null) modeles[index] = modele; else modeles.push(modele);
        localStorage.setItem('documentTemplates', JSON.stringify(modeles));
        window.closeKFSModal();
        renderKFSModelesList();
    };
};

function renderKFSFields(fields) {
    if (!fields || !fields.length) return '';
    return fields.map(renderKFSFieldRow).join('');
}
function renderKFSFieldRow(field = {}) {
    return `<div class='kfs-field-row flex gap-2 mb-2 items-center'>
        <input type='text' name='field-name' value='${field.name || ''}' placeholder='Nom du champ' class='px-2 py-1 border rounded w-32'>
        <select name='field-type' class='px-2 py-1 border rounded'>
            <option value='text' ${field.type === 'text' ? 'selected' : ''}>Texte</option>
            <option value='number' ${field.type === 'number' ? 'selected' : ''}>Nombre</option>
            <option value='date' ${field.type === 'date' ? 'selected' : ''}>Date</option>
            <option value='email' ${field.type === 'email' ? 'selected' : ''}>Email</option>
            <option value='tel' ${field.type === 'tel' ? 'selected' : ''}>Téléphone</option>
            <option value='textarea' ${field.type === 'textarea' ? 'selected' : ''}>Texte long</option>
        </select>
        <input type='text' name='field-placeholder' value='${field.placeholder || ''}' placeholder='Placeholder' class='px-2 py-1 border rounded w-32'>
        <label class='flex items-center text-xs'><input type='checkbox' name='field-required' ${field.required ? 'checked' : ''}> Requis</label>
        <button type='button' onclick='window.removeKFSField(this)' class='text-red-500 hover:bg-red-100 rounded p-1'><span class='material-icons text-sm'>close</span></button>
    </div>`;
}

// Suppression d'un modèle
window.deleteKFSModele = function(index) {
    if (!confirm('Supprimer ce modèle ?')) return;
    let modeles = [];
    try { modeles = JSON.parse(localStorage.getItem('documentTemplates') || '[]'); } catch(e) { modeles = []; }
    const nom = modeles[index]?.nom || '';
    modeles.splice(index, 1);
    localStorage.setItem('documentTemplates', JSON.stringify(modeles));
    renderKFSModelesList();
    showNotification('Modèle supprimé', nom, 'warning');
};

// Utilisation d'un modèle (formulaire dynamique)
window.useKFSModele = function(index) {
    let modeles = [];
    try { modeles = JSON.parse(localStorage.getItem('documentTemplates') || '[]'); } catch(e) { modeles = []; }
    const tpl = modeles[index];
    if (!tpl) return;
    window.openKFSModal(`
        <div class='fixed inset-0 bg-black/60 backdrop-blur-sm' onclick='window.closeKFSModal()'></div>
        <div class='relative min-h-screen flex items-center justify-center p-4'>
            <div class='relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
                <form id='kfs-use-form' class='p-6 space-y-4'>
                    <h2 class='text-xl font-bold mb-2'>${tpl.nom}</h2>
                    ${(tpl.fields||[]).map(f => renderKFSUseField(f)).join('')}
                    <div class='flex justify-end gap-2 mt-4'><button type='button' onclick='window.closeKFSModal()' class='px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300'>Annuler</button><button type='submit' class='px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold'>Générer le document</button></div>
                </form>
            </div>
        </div>
    `);
    document.getElementById('kfs-use-form').onsubmit = function(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this));
        let content = tpl.content;
        (tpl.fields||[]).forEach(f => {
            const regex = new RegExp(`\\{\\{${f.name}\\}\}`, 'g');
            content = content.replace(regex, data[f.name] || '');
        });
        content = content.replace(/\\{\\{date\\}\}/g, new Date().toLocaleDateString('fr-FR'));
        content = content.replace(/\\{\\{entreprise\\}\}/g, 'KFS BTP');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<!DOCTYPE html><html><head><title>${tpl.nom}</title><style>body{font-family:Arial,sans-serif;margin:0;padding:0;}@media print{body{margin:20px;}}</style></head><body>${content}<script>setTimeout(()=>window.print(),500);<\/script></body></html>`);
        printWindow.document.close();
        window.closeKFSModal();
        showNotification('Document généré', tpl.nom, 'success');
    };
};

function renderKFSUseField(f) {
    const label = `<label class='block text-sm font-semibold mb-1'>${f.name}${f.required ? ' *' : ''}</label>`;
    const base = `class='w-full px-4 py-3 border-2 border-gray-200 rounded-xl' name='${f.name}' ${f.required ? 'required' : ''} placeholder='${f.placeholder||''}'`;
    if (f.type === 'textarea') return `<div>${label}<textarea ${base} rows='3'></textarea></div>`;
    return `<div>${label}<input type='${f.type||'text'}' ${base}></div>`;
}
window.openKFSModal = function(html, modalId = 'kfs-modal') {
    // Fermer tout modal existant
    window.closeKFSModal(modalId);
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 overflow-y-auto';
    modal.innerHTML = html;
    document.body.appendChild(modal);
    // Focus premier champ
    setTimeout(() => {
        const firstInput = modal.querySelector('input, textarea, select, button');
        if (firstInput) firstInput.focus();
    }, 100);
    // Fermeture sur Echap
    setTimeout(() => {
        document.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape') {
                window.closeKFSModal(modalId);
                document.removeEventListener('keydown', escListener);
            }
        });
    }, 10);
};

window.closeKFSModal = function(modalId = 'kfs-modal') {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
};
// --- AUTO-REMPLISSAGE CLIENT POUR FORMULAIRES BAIL/CONTRAT ---
function populateClientSelect(selectId, onChangeCb) {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Sélectionner un client...</option>' +
        clients.map((c, i) => `<option value="${i}">${c.nom} - ${c.telephone || ''}</option>`).join('');
    select.onchange = function() {
        if (this.value !== '') onChangeCb(clients[this.value]);
    };
}

function autoFillClientFields(client, mapping) {
    if (!client) return;
    Object.entries(mapping).forEach(([field, key]) => {
        const el = document.getElementById(field);
        if (el) el.value = client[key] || '';
    });
}

// À appeler sur ouverture de chaque popup/modal/formulaire concerné :
// Ex pour un formulaire de bail :
// populateClientSelect('bail-client-select', c => autoFillClientFields(c, { 'bail-nom': 'nom', 'bail-tel': 'telephone', 'bail-adresse': 'adresse' }));
// Ex pour un formulaire de contrat :
// populateClientSelect('contrat-client-select', c => autoFillClientFields(c, { 'contrat-nom': 'nom', 'contrat-tel': 'telephone', 'contrat-adresse': 'adresse' }));
// ===================================================
// ADMIN DASHBOARD - KFS BTP
// Script complet pour la gestion du site
// Version 3.1 - Avec Comptabilité avancée, IA, CRM, Gestion entreprise, Monitoring
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // === INITIALISATION DE TOUS LES MODULES ===
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
    initFinances(); // Module unifié Comptabilité + Bilans
    initFactures();
    initIAComptable();
    initClients();
    initProjets();
    initEmployes();
    initStocks();
    initDocuments();
    initUpdates();
    
    // Initialiser les modèles de documents (si le conteneur existe)
    if (document.getElementById('kfs-modeles-list')) {
        window.initKFSModeles();
    }
    
    console.log('✅ KFS BTP Admin: Tous les modules initialisés');
});

// ===================================================
// MODULE: NAVIGATION - Gestion des onglets/modules
// ===================================================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-module]');
    const moduleSections = document.querySelectorAll('.module-section');
    const pageTitle = document.getElementById('page-title');
    
    // Titres des modules pour l'affichage
    const titles = {
        'dashboard': 'Tableau de bord',
        'messages': 'Messages',
        'catalogue': 'Catalogue',
        'carousel': 'Carrousel',
        'temoignages': 'Témoignages',
        'faq': 'FAQ',
        'media': 'Médiathèque',
        'settings': 'Paramètres',
        'seo': 'SEO',
        'updates': 'Mises à jour',
        'maintenance': 'Maintenance',
        'backup': 'Sauvegardes',
        'security': 'Sécurité',
        'rdv': 'Rendez-vous',
        'analytics': 'Statistiques',
        'finances': 'Gestion Financière',
        'comptabilite': 'Comptabilité',
        'factures': 'Factures',
        'bilans': 'Bilans',
        'clients': 'Clients',
        'projets': 'Projets',
        'employes': 'Employés',
        'stocks': 'Stocks',
        'documents': 'Documents'
    };
    
    // Fonction pour changer de module
    function switchModule(moduleName) {
        // Cacher toutes les sections
        moduleSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Retirer la classe active de tous les liens
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Afficher la section demandée
        const targetSection = document.getElementById('module-' + moduleName);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Activer le lien correspondant
        const targetLink = document.querySelector('.nav-link[data-module="' + moduleName + '"]');
        if (targetLink) {
            targetLink.classList.add('active');
        }
        
        // Mettre à jour le titre de la page
        if (pageTitle && titles[moduleName]) {
            pageTitle.textContent = titles[moduleName];
        }
        
        console.log('📌 Module activé:', moduleName);
    }
    
    // Ajouter les écouteurs sur les liens de navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const moduleName = this.getAttribute('data-module');
            if (moduleName) {
                switchModule(moduleName);
            }
        });
    });
    
    // Gérer les boutons d'actions rapides (data-goto)
    const quickActionBtns = document.querySelectorAll('[data-goto]');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const moduleName = this.getAttribute('data-goto');
            if (moduleName) {
                switchModule(moduleName);
            }
        });
    });
    
    // Exposer la fonction globalement pour usage externe
    window.switchModule = switchModule;
    
    console.log('✅ Navigation initialisée avec', navLinks.length, 'liens');
}

// ===================================================
// MODULE: STATISTIQUES DASHBOARD
// ===================================================

function updateStats() {
    // Récupérer toutes les données
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const annonces = JSON.parse(localStorage.getItem('annonces') || '[]');
    const rdvs = JSON.parse(localStorage.getItem('rdvs') || '[]');
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    const employes = JSON.parse(localStorage.getItem('employes') || '[]');
    
    // Messages non lus
    const unreadMessages = messages.filter(m => !m.read).length;
    
    // RDV du jour
    const today = new Date().toISOString().split('T')[0];
    const todayRdvs = rdvs.filter(r => r.date === today).length;
    
    // Mettre à jour les compteurs dans le dashboard
    const statsElements = {
        'stat-messages': unreadMessages,
        'stat-annonces': annonces.length,
        'stat-rdv': todayRdvs,
        'stat-clients': clients.length,
        'stat-projets': projets.length,
        'stat-employes': employes.length
    };
    
    Object.entries(statsElements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
    
    // Badge messages non lus
    const messageBadge = document.getElementById('messages-badge');
    if (messageBadge) {
        if (unreadMessages > 0) {
            messageBadge.textContent = unreadMessages;
            messageBadge.classList.remove('hidden');
        } else {
            messageBadge.classList.add('hidden');
        }
    }
}

// ===================================================
// MODULE: MESSAGES
// ===================================================

function renderMessages() {
    const container = document.getElementById('messages-list');
    if (!container) return;
    
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    if (messages.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Aucun message reçu.</p>';
        return;
    }
    
    container.innerHTML = messages.map((m, i) => `
        <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 ${m.read ? 'border-gray-300' : 'border-blue-500'} hover:shadow-md transition">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-bold text-gray-800 ${!m.read ? 'text-blue-700' : ''}">${m.name || 'Anonyme'}</h4>
                    <p class="text-sm text-gray-500">${m.email || ''} ${m.phone ? '• ' + m.phone : ''}</p>
                </div>
                <span class="text-xs text-gray-400">${m.date ? new Date(m.date).toLocaleDateString('fr-FR') : ''}</span>
            </div>
            <p class="text-sm text-gray-500 mb-1"><strong>Sujet:</strong> ${m.subject || 'Sans sujet'}</p>
            <p class="text-gray-700 mb-3">${m.message || ''}</p>
            <div class="flex space-x-2">
                ${!m.read ? `<button onclick="markAsRead(${i})" class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">Marquer lu</button>` : '<span class="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm">Lu ✓</span>'}
                <button onclick="deleteMessage(${i})" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">Supprimer</button>
            </div>
        </div>
    `).join('');
}

function renderRecentMessages() {
    const container = document.getElementById('recent-messages');
    if (!container) return;
    
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const recent = messages.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-4 text-sm">Aucun message récent.</p>';
        return;
    }
    
    container.innerHTML = recent.map((m, i) => `
        <div class="flex items-center py-2 border-b border-gray-100 last:border-0 ${!m.read ? 'bg-blue-50 -mx-2 px-2 rounded' : ''}">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                ${(m.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800 text-sm truncate">${m.name || 'Anonyme'}</p>
                <p class="text-xs text-gray-500 truncate">${m.subject || m.message?.substring(0, 30) || 'Sans sujet'}...</p>
            </div>
            <span class="text-xs text-gray-400">${m.date ? new Date(m.date).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'}) : ''}</span>
        </div>
    `).join('');
}

// ===================================================
// FONCTIONS GLOBALES POUR LES MESSAGES
// ===================================================

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

// ================= MODULE : CATALOGUE =====================
function initCatalogue() {
    // Initialisation basique pour éviter l'erreur JS
    if (typeof renderCatalogue === 'function') {
        renderCatalogue();
    }
    if (typeof initCatalogueDropzone === 'function') {
        initCatalogueDropzone();
    }
    
    // Event listener pour le formulaire
    const form = document.getElementById('catalogue-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const editIndex = document.getElementById('catalogue-edit-index').value;
            const annonces = JSON.parse(localStorage.getItem('annonces') || '[]');
            
            // Combiner images existantes et nouvelles
            const allImages = [...catalogueExistingImages, ...catalogueTempImages];
            
            const annonce = {
                title: document.getElementById('catalogue-title').value,
                description: document.getElementById('catalogue-desc').value,
                price: document.getElementById('catalogue-price').value,
                location: document.getElementById('catalogue-location')?.value || '',
                category: document.getElementById('catalogue-category')?.value || 'vente',
                type: document.getElementById('catalogue-type')?.value || 'maison',
                status: document.getElementById('catalogue-status')?.value || 'actif',
                images: allImages,
                image: allImages[0] || '', // Image principale pour compatibilité
                createdAt: editIndex !== '' ? annonces[parseInt(editIndex)]?.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (editIndex !== '') {
                annonces[parseInt(editIndex)] = annonce;
                showNotification('Annonce modifiée', annonce.title, 'success');
            } else {
                annonces.unshift(annonce);
                showNotification('Annonce ajoutée', annonce.title, 'success');
            }
            
            localStorage.setItem('annonces', JSON.stringify(annonces));
            
            // Reset du formulaire
            form.reset();
            document.getElementById('catalogue-edit-index').value = '';
            catalogueTempImages = [];
            catalogueExistingImages = [];
            
            // Fermer la modale automatiquement
            const modal = document.getElementById('catalogue-modal');
            if (modal) modal.classList.add('hidden');
            
            renderCatalogue();
            updateStats();
        });
    }
}
window.initCatalogue = initCatalogue;

// ===================================================
// MODULE: CATALOGUE - Fonctions auxiliaires
// ===================================================

// Variables globales pour le catalogue
let catalogueTempImages = [];
let catalogueExistingImages = [];

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
    if (!container) return;
    
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
    if (!container) return;
    
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
    if (!container) return;
    
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
    if (!container) return;
    
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
                <button onclick="toggleFaq(${i})" class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-blue-200">${f.visible !== false ? 'Masquer' : 'Afficher'}</button>
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
    if (!container) return;
    
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
    
    // Fonction helper pour remplir les champs
    const setVal = (id, val) => { 
        const el = document.getElementById(id); 
        if (el && val !== undefined && val !== null) {
            if (el.type === 'checkbox') {
                el.checked = val;
            } else {
                el.value = val;
            }
        }
    };
    
    // Charger tous les paramètres dans les champs
    // Entreprise
    setVal('settings-company', settings.company || 'KFS BTP IMMO');
    setVal('settings-slogan', settings.slogan || 'Bâtir l\'avenir au Sénégal');
    setVal('settings-description', settings.description);
    setVal('settings-hours', settings.hours || 'Lun-Ven: 8h-18h, Sam: 9h-13h');
    setVal('settings-closed', settings.closed);
    setVal('settings-available', settings.available !== false);
    
    // Contact
    setVal('settings-phone', settings.phone || '+221 78 584 28 71');
    setVal('settings-phone-france', settings.phoneFrance || '+33 6 05 84 68 07');
    setVal('settings-whatsapp', settings.whatsapp || '221785842871');
    setVal('settings-email', settings.email || 'kfsbtpproimmo@gmail.com');
    setVal('settings-address', settings.address || 'Villa 123 MC, Quartier Medinacoura, Tambacounda');
    setVal('settings-city', settings.city || 'Tambacounda, Sénégal');
    setVal('settings-maps', settings.maps);
    
    // Réseaux sociaux
    setVal('settings-facebook', settings.facebook);
    setVal('settings-instagram', settings.instagram);
    setVal('settings-linkedin', settings.linkedin);
    setVal('settings-youtube', settings.youtube);
    setVal('settings-twitter', settings.twitter);
    setVal('settings-tiktok', settings.tiktok);
    
    // Apparence
    setVal('settings-color-primary', settings.colorPrimary || '#1e3a8a');
    setVal('settings-color-secondary', settings.colorSecondary || '#facc15');
    setVal('settings-logo', settings.logo);
    setVal('settings-favicon', settings.favicon);
    setVal('settings-show-whatsapp-btn', settings.showWhatsappBtn !== false);
    
    // Légal
    setVal('settings-ninea', settings.ninea || '009468499');
    setVal('settings-rccm', settings.rccm || 'SN TBC 2025 M 1361');
    setVal('settings-capital', settings.capital);
    setVal('settings-owner', settings.owner);
    setVal('settings-host', settings.host);
    
    // Synchroniser les couleurs avec les champs hex
    const colorPrimary = document.getElementById('settings-color-primary');
    const colorPrimaryHex = document.getElementById('settings-color-primary-hex');
    const colorSecondary = document.getElementById('settings-color-secondary');
    const colorSecondaryHex = document.getElementById('settings-color-secondary-hex');
    
    if (colorPrimary && colorPrimaryHex) {
        colorPrimary.addEventListener('input', () => colorPrimaryHex.value = colorPrimary.value);
    }
    if (colorSecondary && colorSecondaryHex) {
        colorSecondary.addEventListener('input', () => colorSecondaryHex.value = colorSecondary.value);
    }
    
    // Mettre à jour l'aperçu du footer
    updateSettingsPreview();
    
    // Écouter les changements pour l'aperçu en temps réel
    document.querySelectorAll('#settings-form input, #settings-form textarea').forEach(el => {
        el.addEventListener('input', updateSettingsPreview);
    });
    
    const settingsForm = document.getElementById('settings-form');
    if (!settingsForm) return;
    
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = {
            // Entreprise
            company: document.getElementById('settings-company')?.value || '',
            slogan: document.getElementById('settings-slogan')?.value || '',
            description: document.getElementById('settings-description')?.value || '',
            hours: document.getElementById('settings-hours')?.value || '',
            closed: document.getElementById('settings-closed')?.value || '',
            available: document.getElementById('settings-available')?.checked,
            
            // Contact
            phone: document.getElementById('settings-phone')?.value || '',
            phoneFrance: document.getElementById('settings-phone-france')?.value || '',
            whatsapp: document.getElementById('settings-whatsapp')?.value || '',
            email: document.getElementById('settings-email')?.value || '',
            address: document.getElementById('settings-address')?.value || '',
            city: document.getElementById('settings-city')?.value || '',
            maps: document.getElementById('settings-maps')?.value || '',
            
            // Réseaux sociaux
            facebook: document.getElementById('settings-facebook')?.value || '',
            instagram: document.getElementById('settings-instagram')?.value || '',
            linkedin: document.getElementById('settings-linkedin')?.value || '',
            youtube: document.getElementById('settings-youtube')?.value || '',
            twitter: document.getElementById('settings-twitter')?.value || '',
            tiktok: document.getElementById('settings-tiktok')?.value || '',
            
            // Apparence
            colorPrimary: document.getElementById('settings-color-primary')?.value || '#1e3a8a',
            colorSecondary: document.getElementById('settings-color-secondary')?.value || '#facc15',
            logo: document.getElementById('settings-logo')?.value || '',
            favicon: document.getElementById('settings-favicon')?.value || '',
            showWhatsappBtn: document.getElementById('settings-show-whatsapp-btn')?.checked,
            
            // Légal
            ninea: document.getElementById('settings-ninea')?.value || '',
            rccm: document.getElementById('settings-rccm')?.value || '',
            capital: document.getElementById('settings-capital')?.value || '',
            owner: document.getElementById('settings-owner')?.value || '',
            host: document.getElementById('settings-host')?.value || '',
            
            // Métadonnées
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('siteSettings', JSON.stringify(settings));
        showNotification('✅ Paramètres sauvegardés', 'Les modifications seront appliquées sur le site public', 'success');
        updateSettingsPreview();
    });
}

// Fonction pour changer d'onglet dans les paramètres
window.switchSettingsTab = function(tabName) {
    // Masquer tous les contenus
    document.querySelectorAll('.settings-tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Désactiver tous les boutons
    document.querySelectorAll('.settings-tab').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-50', 'text-blue-600', 'border-b-2', 'border-blue-600');
        btn.classList.add('text-gray-600');
    });
    
    // Afficher le contenu sélectionné
    const content = document.getElementById(`settings-tab-${tabName}`);
    if (content) content.classList.remove('hidden');
    
    // Activer le bouton sélectionné
    const btn = document.querySelector(`.settings-tab[data-tab="${tabName}"]`);
    if (btn) {
        btn.classList.add('active', 'bg-blue-50', 'text-blue-600', 'border-b-2', 'border-blue-600');
        btn.classList.remove('text-gray-600');
    }
};

// Mettre à jour l'aperçu du footer
function updateSettingsPreview() {
    const preview = document.getElementById('settings-footer-preview');
    if (!preview) return;
    
    const company = document.getElementById('settings-company')?.value || 'KFS BTP IMMO';
    const slogan = document.getElementById('settings-slogan')?.value || 'Bâtir l\'avenir au Sénégal';
    const phone = document.getElementById('settings-phone')?.value || '+221 78 584 28 71';
    const phoneFrance = document.getElementById('settings-phone-france')?.value || '+33 6 05 84 68 07';
    const email = document.getElementById('settings-email')?.value || 'kfsbtpproimmo@gmail.com';
    const address = document.getElementById('settings-address')?.value || 'Tambacounda, Sénégal';
    const ninea = document.getElementById('settings-ninea')?.value || '009468499';
    const rccm = document.getElementById('settings-rccm')?.value || 'SN TBC 2025 M 1361';
    const facebook = document.getElementById('settings-facebook')?.value;
    const instagram = document.getElementById('settings-instagram')?.value;
    const linkedin = document.getElementById('settings-linkedin')?.value;
    
    preview.innerHTML = `
        <div class="flex flex-wrap justify-between gap-4">
            <div>
                <p class="font-bold text-lg">${company}</p>
                <p class="text-blue-200">${slogan}</p>
                <div class="flex gap-2 mt-2">
                    ${facebook ? '<span class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">f</span>' : ''}
                    ${instagram ? '<span class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">📷</span>' : ''}
                    ${linkedin ? '<span class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">in</span>' : ''}
                </div>
            </div>
            <div class="text-right">
                <p>📧 ${email}</p>
                <p>📞 ${phone}</p>
                <p>🇫🇷 ${phoneFrance}</p>
                <p>📍 ${address}</p>
                <p class="text-blue-200 mt-2">NINEA: ${ninea} | RCCM: ${rccm}</p>
            </div>
        </div>
        <div class="text-center mt-4 pt-4 border-t border-white/20">
            © ${new Date().getFullYear()} ${company}. Tous droits réservés.
        </div>
    `;
}

// Prévisualiser les changements
window.previewSettingsChanges = function() {
    updateSettingsPreview();
    showNotification('👁️ Aperçu mis à jour', 'Consultez l\'aperçu du footer ci-dessous', 'info');
};

// Réinitialiser les paramètres par défaut
window.resetSettingsToDefault = function() {
    if (!confirm('Réinitialiser tous les paramètres aux valeurs par défaut ?')) return;
    
    const defaultSettings = {
        company: 'KFS BTP IMMO',
        slogan: 'Bâtir l\'avenir au Sénégal',
        phone: '+221 78 584 28 71',
        phoneFrance: '+33 6 05 84 68 07',
        whatsapp: '221785842871',
        email: 'kfsbtpproimmo@gmail.com',
        address: 'Villa 123 MC, Quartier Medinacoura, Tambacounda',
        city: 'Tambacounda, Sénégal',
        hours: 'Lun-Ven: 8h-18h, Sam: 9h-13h',
        ninea: '009468499',
        rccm: 'SN TBC 2025 M 1361',
        colorPrimary: '#1e3a8a',
        colorSecondary: '#facc15',
        showWhatsappBtn: true,
        available: true
    };
    
    localStorage.setItem('siteSettings', JSON.stringify(defaultSettings));
    initSettings();
    showNotification('🔄 Réinitialisé', 'Les paramètres par défaut ont été restaurés', 'success');
};

// Ouvrir le site public dans un nouvel onglet
window.testSettingsOnPublic = function() {
    window.open('index.html', '_blank');
};

// ===================================================
// MODULE: SEO
// ===================================================
function initSeo() {
    const seo = JSON.parse(localStorage.getItem('seoSettings') || '{}');
    
    const setVal = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    setVal('seo-analytics', seo.analytics);
    setVal('seo-search-console', seo.searchConsole);
    setVal('seo-description', seo.description);
    setVal('seo-keywords', seo.keywords);
    
    // Mise à jour de l'aperçu en temps réel
    const seoDesc = document.getElementById('seo-description');
    const seoPreview = document.getElementById('seo-preview-desc');
    if (seoDesc && seoPreview) {
        seoDesc.addEventListener('input', function() {
            seoPreview.textContent = this.value || 'Entreprise de BTP au Sénégal...';
        });
    }
    
    const seoForm = document.getElementById('seo-form');
    if (!seoForm) return;
    seoForm.addEventListener('submit', function(e) {
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
    const backupExport = document.getElementById('backup-export');
    const backupImport = document.getElementById('backup-import');
    const backupReset = document.getElementById('backup-reset');
    if (!backupExport) return;
    backupExport.addEventListener('click', function() {
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
        
        const msg = document.getElementById('backup-message');
        if (msg) {
            msg.textContent = 'Sauvegarde téléchargée !';
            msg.className = 'text-sm text-green-600';
        }
    });
    
    if (!backupImport) return;
    backupImport.addEventListener('change', function(e) {
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
                
                const msg = document.getElementById('backup-message');
                if (msg) {
                    msg.textContent = 'Importation réussie ! Rechargez la page.';
                    msg.className = 'text-sm text-green-600';
                }
                
                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                const msg = document.getElementById('backup-message');
                if (msg) {
                    msg.textContent = 'Erreur lors de l\'importation';
                    msg.className = 'text-sm text-red-600';
                }
            }
        };
        reader.readAsText(file);
    });
    
    if (!backupReset) return;
    backupReset.addEventListener('click', function() {
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
// MODULE: SÉCURITÉ AVANCÉE
// ===================================================
function initSecurity() {
    // Initialiser les données de sécurité si nécessaire
    if (!localStorage.getItem('securityLogs')) {
        localStorage.setItem('securityLogs', JSON.stringify([]));
    }
    if (!localStorage.getItem('employeeAccess')) {
        localStorage.setItem('employeeAccess', JSON.stringify([]));
    }
    if (!localStorage.getItem('securitySettings')) {
        localStorage.setItem('securitySettings', JSON.stringify({
            sessionTimeout: 30,
            autoLogout: true,
            maxAttempts: 5,
            lockoutDuration: 15,
            alertFailed: true,
            alertLogin: false,
            alertDelete: true,
            requireUppercase: true,
            requireNumber: true,
            requireSpecial: false
        }));
    }
    
    // Charger les paramètres
    loadSecuritySettings();
    
    // Rendre les interfaces
    renderSecurityDashboard();
    renderEmployeeAccessList();
    renderSecurityLogs();
    runSecurityAudit();
    
    // Formulaire de changement de mot de passe admin
    const securityForm = document.getElementById('security-form');
    if (securityForm) {
        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('security-current-password')?.value || '';
            const newPassword = document.getElementById('security-password').value;
            const confirmPassword = document.getElementById('security-password-confirm').value;
            const message = document.getElementById('security-message');
            
            // Vérifier le mot de passe actuel
            const storedPassword = localStorage.getItem('adminPassword');
            if (storedPassword && atob(storedPassword) !== currentPassword) {
                message.textContent = 'Mot de passe actuel incorrect';
                message.className = 'text-sm text-red-600';
                return;
            }
            
            // Vérifier la force du mot de passe
            const settings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
            if (newPassword.length < 8) {
                message.textContent = 'Le mot de passe doit contenir au moins 8 caractères';
                message.className = 'text-sm text-red-600';
                return;
            }
            if (settings.requireUppercase && !/[A-Z]/.test(newPassword)) {
                message.textContent = 'Le mot de passe doit contenir au moins une majuscule';
                message.className = 'text-sm text-red-600';
                return;
            }
            if (settings.requireNumber && !/[0-9]/.test(newPassword)) {
                message.textContent = 'Le mot de passe doit contenir au moins un chiffre';
                message.className = 'text-sm text-red-600';
                return;
            }
            if (settings.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
                message.textContent = 'Le mot de passe doit contenir au moins un caractère spécial';
                message.className = 'text-sm text-red-600';
                return;
            }
            
            if (newPassword !== confirmPassword) {
                message.textContent = 'Les mots de passe ne correspondent pas';
                message.className = 'text-sm text-red-600';
                return;
            }
            
            localStorage.setItem('adminPassword', btoa(newPassword));
            logSecurityEvent('action', 'Mot de passe administrateur modifié', 'Admin');
            
            message.textContent = 'Mot de passe modifié avec succès !';
            message.className = 'text-sm text-green-600';
            this.reset();
            
            showNotification('Sécurité', 'Mot de passe mis à jour', 'success');
        });
    }
    
    // Bouton reset mot de passe
    const securityReset = document.getElementById('security-reset');
    if (securityReset) {
        securityReset.addEventListener('click', function() {
            if (confirm('⚠️ Réinitialiser le mot de passe à "admin123" ?\n\nCette action sera enregistrée dans les logs.')) {
                localStorage.setItem('adminPassword', btoa('admin123'));
                logSecurityEvent('action', 'Mot de passe réinitialisé à la valeur par défaut', 'Admin');
                
                const msg = document.getElementById('security-message');
                if (msg) {
                    msg.textContent = 'Mot de passe réinitialisé à "admin123"';
                    msg.className = 'text-sm text-yellow-600';
                }
                showNotification('Sécurité', 'Mot de passe réinitialisé', 'warning');
            }
        });
    }
    
    // Vérificateur de force de mot de passe
    const passwordInput = document.getElementById('security-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    // Formulaire d'accès employé
    const employeeAccessForm = document.getElementById('employee-access-form');
    if (employeeAccessForm) {
        employeeAccessForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveEmployeeAccess();
        });
    }
    
    // Filtre des logs
    document.getElementById('sec-log-filter')?.addEventListener('change', function() {
        renderSecurityLogs(this.value);
    });
    
    // Recherche utilisateur
    document.getElementById('sec-search-user')?.addEventListener('input', function() {
        renderEmployeeAccessList(this.value);
    });
    
    console.log('✅ Module Sécurité initialisé');
}

// Afficher/cacher les onglets de sécurité
window.showSecurityTab = function(tabName) {
    // Cacher tous les contenus
    document.querySelectorAll('.security-tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Retirer la classe active de tous les boutons
    document.querySelectorAll('.security-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Afficher le contenu sélectionné
    const targetTab = document.getElementById('security-tab-' + tabName);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }
    
    // Activer le bouton
    const activeBtn = document.querySelector(`.security-tab[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
};

// Vérificateur de force de mot de passe
function checkPasswordStrength(password) {
    let strength = 0;
    const indicators = ['strength-1', 'strength-2', 'strength-3', 'strength-4'];
    const strengthText = document.getElementById('strength-text');
    
    // Reset
    indicators.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = 'h-1 flex-1 bg-gray-200 rounded';
    });
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    const colors = ['bg-red-500', 'bg-blue-600', 'bg-blue-600', 'bg-green-500'];
    const texts = ['Très faible', 'Faible', 'Moyen', 'Fort'];
    
    for (let i = 0; i < strength; i++) {
        const el = document.getElementById(indicators[i]);
        if (el) el.className = `h-1 flex-1 ${colors[Math.min(strength - 1, 3)]} rounded`;
    }
    
    if (strengthText) {
        if (password.length === 0) {
            strengthText.textContent = 'Min. 8 caractères, majuscule, chiffre, caractère spécial';
            strengthText.className = 'text-xs text-gray-500';
        } else {
            strengthText.textContent = `Force: ${texts[Math.max(0, strength - 1)]}`;
            strengthText.className = `text-xs ${strength >= 3 ? 'text-green-600' : strength >= 2 ? 'text-yellow-600' : 'text-red-600'}`;
        }
    }
}

// Toggle visibilité mot de passe
window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const icon = input.nextElementSibling?.querySelector('.material-icons');
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.textContent = 'visibility_off';
    } else {
        input.type = 'password';
        if (icon) icon.textContent = 'visibility';
    }
};

// Enregistrer un événement de sécurité
function logSecurityEvent(type, description, user = 'Admin') {
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    logs.unshift({
        id: Date.now(),
        type: type, // login, logout, failed, action
        description: description,
        user: user,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1' // Simulation
    });
    
    // Garder seulement les 500 derniers logs
    if (logs.length > 500) logs.pop();
    
    localStorage.setItem('securityLogs', JSON.stringify(logs));
}

// Rendre le tableau de bord sécurité
function renderSecurityDashboard() {
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    const employees = JSON.parse(localStorage.getItem('employeeAccess') || '[]');
    const activeEmployees = employees.filter(e => e.status === 'actif');
    
    // Compter les connexions des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogins = logs.filter(l => l.type === 'login' && new Date(l.timestamp) > sevenDaysAgo).length;
    const failedAttempts = logs.filter(l => l.type === 'failed').length;
    
    // Dernière connexion
    const lastLogin = logs.find(l => l.type === 'login');
    
    // Mettre à jour les KPIs
    const usersCount = document.getElementById('sec-users-count');
    const usersDetail = document.getElementById('sec-users-detail');
    const loginsEl = document.getElementById('sec-logins');
    const lastLoginEl = document.getElementById('sec-last-login');
    const alertsEl = document.getElementById('sec-alerts');
    
    if (usersCount) usersCount.textContent = 1 + activeEmployees.length;
    if (usersDetail) usersDetail.textContent = `1 admin, ${activeEmployees.length} employés`;
    if (loginsEl) loginsEl.textContent = recentLogins;
    if (lastLoginEl && lastLogin) {
        lastLoginEl.textContent = `Dernière: ${new Date(lastLogin.timestamp).toLocaleDateString('fr-FR')}`;
    }
    if (alertsEl) alertsEl.textContent = failedAttempts;
}

// Rendre la liste des accès employés
function renderEmployeeAccessList(searchTerm = '') {
    const container = document.getElementById('sec-users-list');
    if (!container) return;
    
    let employees = JSON.parse(localStorage.getItem('employeeAccess') || '[]');
    
    // Filtrer par recherche
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        employees = employees.filter(e => 
            e.name.toLowerCase().includes(term) || 
            e.email.toLowerCase().includes(term) ||
            e.username.toLowerCase().includes(term)
        );
    }
    
    // Admin par défaut
    let html = `
        <div class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span class="material-icons text-white">admin_panel_settings</span>
                </div>
                <div>
                    <p class="font-bold text-gray-800">Administrateur Principal</p>
                    <p class="text-sm text-gray-500">admin@kfsbtp.sn • Accès complet</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">ADMIN</span>
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Actif</span>
            </div>
        </div>
    `;
    
    if (employees.length === 0) {
        html += `<p class="text-gray-400 text-center py-6">Aucun accès employé créé</p>`;
    } else {
        employees.forEach((emp, index) => {
            const statusColors = {
                actif: 'bg-green-100 text-green-800',
                inactif: 'bg-gray-100 text-gray-800',
                suspendu: 'bg-red-100 text-red-800'
            };
            const roleColors = {
                employe: 'bg-gray-100 text-gray-700',
                manager: 'bg-purple-100 text-purple-700',
                comptable: 'bg-green-100 text-green-700',
                commercial: 'bg-orange-100 text-orange-700'
            };
            
            const moduleIcons = {
                dashboard: '📊', finances: '💰', clients: '👥', projets: '🏗️',
                employes: '👔', stocks: '📦', documents: '📄', rdv: '📅',
                messages: '📧', catalogue: '🏠', factures: '🧾', analytics: '📈'
            };
            
            const modulesDisplay = (emp.modules || []).map(m => moduleIcons[m] || '•').join(' ');
            
            html += `
                <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span class="material-icons text-gray-600">person</span>
                        </div>
                        <div>
                            <p class="font-bold text-gray-800">${emp.name}</p>
                            <p class="text-sm text-gray-500">${emp.email} • @${emp.username}</p>
                            <p class="text-xs text-gray-400 mt-1">Modules: ${modulesDisplay || 'Aucun'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 ${roleColors[emp.role] || roleColors.employe} rounded-full text-xs font-semibold">${emp.role?.toUpperCase() || 'EMPLOYÉ'}</span>
                        <span class="px-3 py-1 ${statusColors[emp.status] || statusColors.actif} rounded-full text-xs font-semibold">${emp.status?.charAt(0).toUpperCase() + emp.status?.slice(1) || 'Actif'}</span>
                        <button onclick="editEmployeeAccess(${index})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Modifier">
                            <span class="material-icons text-sm">edit</span>
                        </button>
                        <button onclick="toggleEmployeeStatus(${index})" class="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Activer/Désactiver">
                            <span class="material-icons text-sm">${emp.status === 'actif' ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button onclick="deleteEmployeeAccess(${index})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer">
                            <span class="material-icons text-sm">delete</span>
                        </button>
                    </div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
}

// Rendre les logs de sécurité
function renderSecurityLogs(filter = 'all') {
    const container = document.getElementById('sec-logs-list');
    if (!container) return;
    
    let logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    
    if (filter !== 'all') {
        logs = logs.filter(l => l.type === filter);
    }
    
    if (logs.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Aucun événement enregistré</p>';
        return;
    }
    
    const typeIcons = {
        login: { icon: 'login', color: 'text-green-600', bg: 'bg-green-100' },
        logout: { icon: 'logout', color: 'text-blue-600', bg: 'bg-blue-100' },
        failed: { icon: 'error', color: 'text-red-600', bg: 'bg-red-100' },
        action: { icon: 'settings', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    };
    
    container.innerHTML = logs.slice(0, 100).map(log => {
        const typeInfo = typeIcons[log.type] || typeIcons.action;
        const date = new Date(log.timestamp);
        
        return `
            <div class="log-item ${log.type} flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 ${typeInfo.bg} rounded-full flex items-center justify-center">
                        <span class="material-icons ${typeInfo.color}">${typeInfo.icon}</span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-800">${log.description}</p>
                        <p class="text-xs text-gray-500">Par: ${log.user} • IP: ${log.ip}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-600">${date.toLocaleDateString('fr-FR')}</p>
                    <p class="text-xs text-gray-400">${date.toLocaleTimeString('fr-FR')}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Modale accès employé
window.openEmployeeAccessModal = function(editIndex = null) {
    const modal = document.getElementById('employee-access-modal');
    const form = document.getElementById('employee-access-form');
    const title = document.getElementById('employee-access-modal-title');
    
    if (!modal) return;
    
    form.reset();
    document.getElementById('emp-access-edit-id').value = '';
    
    // Reset checkboxes
    document.querySelectorAll('input[name="emp-modules"]').forEach(cb => cb.checked = false);
    document.querySelector('input[name="emp-modules"][value="dashboard"]').checked = true;
    
    if (editIndex !== null) {
        const employees = JSON.parse(localStorage.getItem('employeeAccess') || '[]');
        const emp = employees[editIndex];
        if (emp) {
            title.innerHTML = '<span class="material-icons mr-2">edit</span>Modifier l\'accès';
            document.getElementById('emp-access-edit-id').value = editIndex;
            document.getElementById('emp-access-name').value = emp.name;
            document.getElementById('emp-access-email').value = emp.email;
            document.getElementById('emp-access-username').value = emp.username;
            document.getElementById('emp-access-password').value = '';
            document.getElementById('emp-access-password').removeAttribute('required');
            document.getElementById('emp-access-poste').value = emp.poste || '';
            document.getElementById('emp-access-role').value = emp.role || 'employe';
            document.getElementById('emp-access-notes').value = emp.notes || '';
            
            // Status
            document.querySelector(`input[name="emp-access-status"][value="${emp.status || 'actif'}"]`).checked = true;
            
            // Modules
            (emp.modules || []).forEach(mod => {
                const cb = document.querySelector(`input[name="emp-modules"][value="${mod}"]`);
                if (cb) cb.checked = true;
            });
        }
    } else {
        title.innerHTML = '<span class="material-icons mr-2">person_add</span>Nouvel accès employé';
        document.getElementById('emp-access-password').setAttribute('required', 'required');
    }
    
    modal.classList.remove('hidden');
};

window.closeEmployeeAccessModal = function() {
    document.getElementById('employee-access-modal')?.classList.add('hidden');
};

// Sauvegarder accès employé
function saveEmployeeAccess() {
    const employees = JSON.parse(localStorage.getItem('employeeAccess') || '[]');
    const editId = document.getElementById('emp-access-edit-id').value;
    
    // Récupérer les modules cochés
    const modules = [];
    document.querySelectorAll('input[name="emp-modules"]:checked').forEach(cb => {
        modules.push(cb.value);
    });
    
    const password = document.getElementById('emp-access-password').value;
    
    const empData = {
        name: document.getElementById('emp-access-name').value,
        email: document.getElementById('emp-access-email').value,
        username: document.getElementById('emp-access-username').value,
        poste: document.getElementById('emp-access-poste').value,
        role: document.getElementById('emp-access-role').value,
        status: document.querySelector('input[name="emp-access-status"]:checked').value,
        modules: modules,
        notes: document.getElementById('emp-access-notes').value,
        updatedAt: new Date().toISOString()
    };
    
    if (editId !== '') {
        // Mise à jour
        if (password) {
            empData.password = btoa(password);
        } else {
            empData.password = employees[parseInt(editId)].password;
        }
        empData.createdAt = employees[parseInt(editId)].createdAt;
        employees[parseInt(editId)] = empData;
        logSecurityEvent('action', `Accès modifié pour ${empData.name}`, 'Admin');
        showNotification('Accès modifié', `Compte de ${empData.name} mis à jour`, 'success');
    } else {
        // Nouveau
        empData.password = btoa(password);
        empData.createdAt = new Date().toISOString();
        employees.push(empData);
        logSecurityEvent('action', `Nouvel accès créé pour ${empData.name}`, 'Admin');
        showNotification('Accès créé', `Compte créé pour ${empData.name}`, 'success');
    }
    
    localStorage.setItem('employeeAccess', JSON.stringify(employees));
    closeEmployeeAccessModal();
    renderEmployeeAccessList();
    renderSecurityDashboard();
}

window.editEmployeeAccess = function(index) {
    openEmployeeAccessModal(index);
};

window.deleteEmployeeAccess = function(index) {
    const employees = JSON.parse(localStorage.getItem('employeeAccess') || '[]');
    const emp = employees[index];
    
    if (confirm(`Supprimer l'accès de ${emp.name} ?\n\nCette action est irréversible.`)) {
        employees.splice(index, 1);
        localStorage.setItem('employeeAccess', JSON.stringify(employees));
        logSecurityEvent('action', `Accès supprimé pour ${emp.name}`, 'Admin');
        showNotification('Accès supprimé', `Compte de ${emp.name} supprimé`, 'warning');
        renderEmployeeAccessList();
        renderSecurityDashboard();
    }
};

window.toggleEmployeeStatus = function(index) {
    const employees = JSON.parse(localStorage.getItem('employeeAccess') || '[]');
    const emp = employees[index];
    
    emp.status = emp.status === 'actif' ? 'suspendu' : 'actif';
    emp.updatedAt = new Date().toISOString();
    
    employees[index] = emp;
    localStorage.setItem('employeeAccess', JSON.stringify(employees));
    
    const action = emp.status === 'actif' ? 'réactivé' : 'suspendu';
    logSecurityEvent('action', `Compte ${action} pour ${emp.name}`, 'Admin');
    showNotification('Statut modifié', `Compte de ${emp.name} ${action}`, 'info');
    
    renderEmployeeAccessList();
    renderSecurityDashboard();
};

// Générer un mot de passe aléatoire
window.generateRandomPassword = function() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const input = document.getElementById('emp-access-password');
    if (input) {
        input.value = password;
        input.type = 'text';
        setTimeout(() => { input.type = 'password'; }, 3000);
    }
};

// Sélectionner/Désélectionner tous les modules
window.selectAllModules = function() {
    document.querySelectorAll('input[name="emp-modules"]').forEach(cb => cb.checked = true);
};

window.deselectAllModules = function() {
    document.querySelectorAll('input[name="emp-modules"]').forEach(cb => cb.checked = false);
};

// Effacer les logs
window.clearSecurityLogs = function() {
    if (confirm('Effacer tout l\'historique de sécurité ?\n\nCette action est irréversible.')) {
        localStorage.setItem('securityLogs', JSON.stringify([]));
        logSecurityEvent('action', 'Historique de sécurité effacé', 'Admin');
        renderSecurityLogs();
        showNotification('Logs effacés', 'Historique de sécurité vidé', 'warning');
    }
};

// Exporter les logs
window.exportSecurityLogs = function() {
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    
    let csv = 'Date,Heure,Type,Description,Utilisateur,IP\n';
    logs.forEach(log => {
        const date = new Date(log.timestamp);
        csv += `${date.toLocaleDateString('fr-FR')},${date.toLocaleTimeString('fr-FR')},${log.type},"${log.description}",${log.user},${log.ip}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs-securite-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('Export', 'Logs exportés en CSV', 'success');
};

// Charger les paramètres de sécurité
function loadSecuritySettings() {
    const settings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
    
    // Appliquer aux inputs
    const sessionTimeout = document.getElementById('sec-session-timeout');
    const autoLogout = document.getElementById('sec-auto-logout');
    const maxAttempts = document.getElementById('sec-max-attempts');
    const lockoutDuration = document.getElementById('sec-lockout-duration');
    
    if (sessionTimeout) sessionTimeout.value = settings.sessionTimeout || 30;
    if (autoLogout) autoLogout.checked = settings.autoLogout !== false;
    if (maxAttempts) maxAttempts.value = settings.maxAttempts || 5;
    if (lockoutDuration) lockoutDuration.value = settings.lockoutDuration || 15;
    
    // Alertes
    document.getElementById('sec-alert-failed')?.setAttribute('checked', settings.alertFailed ? 'checked' : '');
    document.getElementById('sec-alert-login')?.setAttribute('checked', settings.alertLogin ? 'checked' : '');
    document.getElementById('sec-alert-delete')?.setAttribute('checked', settings.alertDelete ? 'checked' : '');
    
    // Politique mot de passe
    document.getElementById('sec-require-uppercase')?.setAttribute('checked', settings.requireUppercase ? 'checked' : '');
    document.getElementById('sec-require-number')?.setAttribute('checked', settings.requireNumber ? 'checked' : '');
    document.getElementById('sec-require-special')?.setAttribute('checked', settings.requireSpecial ? 'checked' : '');
}

// Sauvegarder les paramètres de sécurité
window.saveSecuritySettings = function() {
    const settings = {
        sessionTimeout: parseInt(document.getElementById('sec-session-timeout')?.value) || 30,
        autoLogout: document.getElementById('sec-auto-logout')?.checked || false,
        maxAttempts: parseInt(document.getElementById('sec-max-attempts')?.value) || 5,
        lockoutDuration: parseInt(document.getElementById('sec-lockout-duration')?.value) || 15,
        alertFailed: document.getElementById('sec-alert-failed')?.checked || false,
        alertLogin: document.getElementById('sec-alert-login')?.checked || false,
        alertDelete: document.getElementById('sec-alert-delete')?.checked || false,
        requireUppercase: document.getElementById('sec-require-uppercase')?.checked || false,
        requireNumber: document.getElementById('sec-require-number')?.checked || false,
        requireSpecial: document.getElementById('sec-require-special')?.checked || false
    };
    
    localStorage.setItem('securitySettings', JSON.stringify(settings));
    logSecurityEvent('action', 'Paramètres de sécurité modifiés', 'Admin');
    showNotification('Paramètres sauvegardés', 'Configuration de sécurité mise à jour', 'success');
};

// Audit de sécurité
window.runSecurityAudit = function() {
    const results = [];
    
    // Vérifier le mot de passe admin
    const adminPwd = localStorage.getItem('adminPassword');
    if (!adminPwd || atob(adminPwd) === 'admin123') {
        results.push({ status: 'warning', title: 'Mot de passe par défaut', desc: 'Changez le mot de passe admin' });
    } else if (atob(adminPwd).length >= 8) {
        results.push({ status: 'success', title: 'Mot de passe admin', desc: 'Mot de passe fort configuré' });
    }
    
    // Vérifier les accès employés
    const employees = JSON.parse(localStorage.getItem('employeeAccess') || '[]');
    const suspendedCount = employees.filter(e => e.status === 'suspendu').length;
    if (suspendedCount > 0) {
        results.push({ status: 'info', title: 'Comptes suspendus', desc: `${suspendedCount} compte(s) suspendu(s)` });
    }
    if (employees.length > 0) {
        results.push({ status: 'success', title: 'Accès employés', desc: `${employees.length} accès configuré(s)` });
    }
    
    // Vérifier les logs
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    const failedAttempts = logs.filter(l => l.type === 'failed').length;
    if (failedAttempts > 10) {
        results.push({ status: 'danger', title: 'Tentatives échouées', desc: `${failedAttempts} échecs détectés` });
    } else if (failedAttempts > 0) {
        results.push({ status: 'warning', title: 'Tentatives échouées', desc: `${failedAttempts} échec(s) enregistré(s)` });
    } else {
        results.push({ status: 'success', title: 'Aucune intrusion', desc: 'Pas de tentative suspecte' });
    }
    
    // Paramètres de sécurité
    const settings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
    if (settings.autoLogout) {
        results.push({ status: 'success', title: 'Déconnexion auto', desc: 'Activée après inactivité' });
    } else {
        results.push({ status: 'warning', title: 'Déconnexion auto', desc: 'Désactivée - risque de session' });
    }
    
    // Sauvegardes
    const lastBackup = localStorage.getItem('lastBackupDate');
    if (lastBackup) {
        const daysSince = Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince > 7) {
            results.push({ status: 'warning', title: 'Sauvegarde', desc: `Dernière il y a ${daysSince} jours` });
        } else {
            results.push({ status: 'success', title: 'Sauvegarde', desc: 'Effectuée récemment' });
        }
    } else {
        results.push({ status: 'danger', title: 'Sauvegarde', desc: 'Aucune sauvegarde effectuée' });
    }
    
    // Afficher les résultats
    const container = document.getElementById('sec-audit-results');
    const dateEl = document.getElementById('sec-audit-date');
    
    if (dateEl) {
        dateEl.textContent = `Dernière vérification: ${new Date().toLocaleString('fr-FR')}`;
    }
    
    if (container) {
        const statusStyles = {
            success: { bg: 'bg-green-50', border: 'border-green-200', icon: 'check_circle', iconColor: 'text-green-600' },
            warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'warning', iconColor: 'text-yellow-600' },
            danger: { bg: 'bg-red-50', border: 'border-red-200', icon: 'error', iconColor: 'text-red-600' },
            info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'info', iconColor: 'text-blue-600' }
        };
        
        container.innerHTML = results.map(r => {
            const style = statusStyles[r.status] || statusStyles.info;
            return `
                <div class="${style.bg} ${style.border} border rounded-xl p-4 flex items-center gap-3">
                    <span class="material-icons ${style.iconColor}">${style.icon}</span>
                    <div>
                        <p class="font-semibold text-gray-800">${r.title}</p>
                        <p class="text-sm text-gray-600">${r.desc}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Mettre à jour le statut global
    const statusEl = document.getElementById('sec-status');
    if (statusEl) {
        const hasDanger = results.some(r => r.status === 'danger');
        const hasWarning = results.some(r => r.status === 'warning');
        
        if (hasDanger) {
            statusEl.textContent = 'À risque';
            statusEl.className = 'text-xl font-bold text-red-600';
        } else if (hasWarning) {
            statusEl.textContent = 'Attention';
            statusEl.className = 'text-xl font-bold text-yellow-600';
        } else {
            statusEl.textContent = 'Sécurisé';
            statusEl.className = 'text-xl font-bold text-green-600';
        }
    }
    
    showNotification('Audit terminé', 'Vérification de sécurité effectuée', 'info');
};

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
    const calPrev = document.getElementById('cal-prev');
    const calNext = document.getElementById('cal-next');
    if (calPrev) {
        calPrev.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (calNext) {
        calNext.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
    }
    
    // Formulaire RDV
    const form = document.getElementById('rdv-form');
    const cancelBtn = document.getElementById('rdv-cancel');
    const rdvDateInput = document.getElementById('rdv-date');
    
    // Date par défaut = aujourd'hui
    if (rdvDateInput) rdvDateInput.value = new Date().toISOString().split('T')[0];
    
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
        
        // Fermer la modale automatiquement
        const modal = document.getElementById('rdv-modal');
        if (modal) modal.classList.add('hidden');
        
        renderCalendar();
        renderUpcomingRdv();
        renderDayRdv(selectedDate || new Date().toISOString().split('T')[0]);
        updateRdvBadge();
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (form) form.reset();
            const editIndex = document.getElementById('rdv-edit-index');
            if (editIndex) editIndex.value = '';
            const dateInput = document.getElementById('rdv-date');
            if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
            cancelBtn.classList.add('hidden');
        });
    }
    // --- Renforcement de l'exposition globale des modals pour compatibilité onclick="open*Modal()" ---
    window.openCatalogueModal = window.openCatalogueModal;
    window.openRdvModal = window.openRdvModal;
    window.openMediaModal = window.openMediaModal;
    window.openCarouselModal = window.openCarouselModal;
    window.openTemoignageModal = window.openTemoignageModal;
    window.openFaqModal = window.openFaqModal;
    
    // Afficher RDV du jour par défaut
    const today = new Date().toISOString().split('T')[0];
    selectedDate = today;
    renderDayRdv(today);
}

function renderCalendar() {
    const container = document.getElementById('calendar-days');
    const monthYear = document.getElementById('cal-month-year');
    
    if (!container || !monthYear) return;
    
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
    
    if (!container || !dateTitle) return;
    
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
    if (!container) return;
    
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
    if (!badge) return;
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
        // ...existing code export CSV...
    });
}

// === Module Fiche de Paie Employé - CONFORME CODE DU TRAVAIL SÉNÉGALAIS ===
// Référence: CLEISS, IPRES, CSS - Cotisations sociales Sénégal 2024
// IPRES Régime général: 8,4% patronal + 5,6% salarial = 14% (plafond 432 000 FCFA)
// IPRES Retraite complémentaire cadres: 3,6% patronal + 2,4% salarial = 6% (tranche 432 000 - 1 296 000)
// Prestations familiales CSS: 7% patronal (plafond 63 000 FCFA)
// Accidents du travail CSS: 1%, 3% ou 5% selon risques (plafond 63 000 FCFA)
// IPM Maladie: ~3% patronal + ~3% salarial (plafond 250 000 FCFA)

function initFicheDePaieModule() {
    const section = document.getElementById('module-fiche-paie');
    if (!section) return;

    renderFicheDePaieForm();
}

// Constantes des cotisations sociales sénégalaises (taux 2024)
const COTISATIONS_SN = {
    // IPRES - Retraite Régime Général
    IPRES_RG: {
        tauxPatronal: 8.4,
        tauxSalarial: 5.6,
        plafond: 432000
    },
    // IPRES - Retraite Complémentaire Cadres
    IPRES_RC: {
        tauxPatronal: 3.6,
        tauxSalarial: 2.4,
        plafondMin: 432000,
        plafondMax: 1296000
    },
    // CSS - Prestations Familiales
    PRESTATIONS_FAMILIALES: {
        tauxPatronal: 7,
        tauxSalarial: 0,
        plafond: 63000
    },
    // CSS - Accidents du Travail
    ACCIDENTS_TRAVAIL: {
        tauxFaible: 1,    // Bureaux, commerces
        tauxMoyen: 3,     // Industrie légère
        tauxEleve: 5,     // BTP, industries lourdes
        plafond: 63000
    },
    // IPM - Maladie
    IPM: {
        tauxPatronal: 3,
        tauxSalarial: 3,
        plafond: 250000
    },
    // CFE - Contribution Forfaitaire à la charge de l'Employeur
    CFE: {
        taux: 3,
        applicable: true
    },
    // TRIMF - Taxe Représentative de l'Impôt Minimum Forfaitaire
    TRIMF: {
        mensuel: 3000  // Forfait mensuel
    }
};

function renderFicheDePaieForm() {
    const section = document.getElementById('module-fiche-paie');
    if (!section) return;
    
    const employes = JSON.parse(localStorage.getItem('employes') || '[]');
    const employesActifs = employes.filter(e => e.statut === 'actif' || !e.statut);
    
    // Date par défaut : mois en cours
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    
    section.innerHTML = `
        <div class="max-w-5xl mx-auto">
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4">
                    <h2 class="text-2xl font-bold text-white flex items-center">
                        <span class="material-icons mr-3">payments</span>
                        Bulletin de Paie - Conforme Code du Travail Sénégalais
                    </h2>
                    <p class="text-blue-200 text-sm mt-1">Avec cotisations IPRES, CSS, IPM - Calcul automatique selon les plafonds légaux</p>
                </div>
                
                <!-- Formulaire -->
                <form id="fiche-paie-form" class="p-6 space-y-6">
                    ${employesActifs.length === 0 ? `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                            <span class="material-icons text-yellow-500 text-4xl mb-2">warning</span>
                            <p class="text-yellow-700 font-medium">Aucun employé enregistré</p>
                            <p class="text-yellow-600 text-sm mt-1">Ajoutez d'abord des employés dans le module "Employés"</p>
                            <button type="button" onclick="window.switchModule && window.switchModule('employes')" 
                                class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                <span class="material-icons text-sm mr-1">person_add</span> Ajouter un employé
                            </button>
                        </div>
                    ` : `
                        <!-- Section 1: Identification Employé -->
                        <div class="bg-blue-50 rounded-xl p-5 border border-blue-200">
                            <h3 class="font-bold text-blue-800 mb-4 flex items-center">
                                <span class="material-icons mr-2 text-blue-600">badge</span>
                                Identification du Salarié
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Employé *</label>
                                    <select id="fiche-paie-employe" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required>
                                        <option value="">-- Sélectionner un employé --</option>
                                        ${employesActifs.map(emp => `
                                            <option value="${emp.matricule}" 
                                                data-nom="${emp.nom || ''}" 
                                                data-prenom="${emp.prenom || ''}"
                                                data-poste="${emp.poste || ''}"
                                                data-salaire="${emp.salaire || 0}"
                                                data-departement="${emp.departement || ''}"
                                                data-categorie="${emp.categorie || ''}"
                                                data-dateembauche="${emp.dateEmbauche || ''}">
                                                ${emp.prenom || ''} ${emp.nom || ''} - ${emp.poste || 'N/A'} (${emp.matricule})
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Période *</label>
                                    <input type="month" id="fiche-paie-mois" value="${currentMonth}" 
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required>
                                </div>
                            </div>
                            
                            <!-- Infos employé -->
                            <div id="employe-info-card" class="mt-4 hidden">
                                <div class="bg-white rounded-xl p-4 border border-blue-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p class="text-xs text-gray-500">Matricule</p>
                                        <p class="font-mono font-bold text-blue-700" id="info-matricule">-</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500">Poste</p>
                                        <p class="font-semibold text-gray-800" id="info-poste">-</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500">Catégorie</p>
                                        <p class="font-semibold text-gray-800" id="info-categorie">-</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500">Date d'embauche</p>
                                        <p class="font-semibold text-gray-800" id="info-embauche">-</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Section 2: Classification -->
                        <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                                <span class="material-icons mr-2 text-gray-600">category</span>
                                Classification Professionnelle
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                                    <select id="fiche-paie-categorie" class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg" required>
                                        <option value="1">1 - Manœuvre</option>
                                        <option value="2">2 - Ouvrier spécialisé</option>
                                        <option value="3">3 - Ouvrier qualifié</option>
                                        <option value="4">4 - Ouvrier hautement qualifié</option>
                                        <option value="5">5 - Employé</option>
                                        <option value="6">6 - Agent de maîtrise</option>
                                        <option value="7" selected>7 - Technicien</option>
                                        <option value="8">8 - Technicien supérieur</option>
                                        <option value="9">9 - Cadre</option>
                                        <option value="10">10 - Cadre supérieur</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Échelon</label>
                                    <select id="fiche-paie-echelon" class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg">
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Convention collective</label>
                                    <select id="fiche-paie-convention" class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg">
                                        <option value="BTP">BTP - Bâtiment et Travaux Publics</option>
                                        <option value="Commerce">Commerce</option>
                                        <option value="Industrie">Industrie</option>
                                        <option value="Services">Services</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                    <select id="fiche-paie-statut-salarie" class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg" onchange="updateCotisationsAffichage()">
                                        <option value="non-cadre">Non-cadre</option>
                                        <option value="cadre">Cadre</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Section 3: Rémunération -->
                        <div class="bg-green-50 rounded-xl p-5 border border-green-200">
                            <h3 class="font-bold text-green-800 mb-4 flex items-center">
                                <span class="material-icons mr-2 text-green-600">account_balance_wallet</span>
                                Éléments de Rémunération
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Salaire de base (FCFA) *</label>
                                    <input type="number" id="fiche-paie-salaire" min="0" step="1000" 
                                        class="w-full px-4 py-3 border-2 border-green-300 rounded-xl bg-white" 
                                        placeholder="Ex: 350000" required onchange="calculerToutesCotisations()">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Heures travaillées</label>
                                    <input type="number" id="fiche-paie-heures" value="173.33" step="0.01" 
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white">
                                    <p class="text-xs text-gray-500 mt-1">Base légale: 173,33h (40h/sem)</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-1">Heures supplémentaires</label>
                                    <input type="number" id="fiche-paie-heures-sup" value="0" min="0" step="1" 
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white" onchange="calculerToutesCotisations()">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Prime d'ancienneté</label>
                                    <input type="number" id="fiche-paie-prime-anciennete" value="0" min="0" step="1000" 
                                        class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg" onchange="calculerToutesCotisations()">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Prime de rendement</label>
                                    <input type="number" id="fiche-paie-prime-rendement" value="0" min="0" step="1000" 
                                        class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg" onchange="calculerToutesCotisations()">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Prime de transport</label>
                                    <input type="number" id="fiche-paie-prime-transport" value="0" min="0" step="1000" 
                                        class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg" onchange="calculerToutesCotisations()">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Indemnité de logement</label>
                                    <input type="number" id="fiche-paie-indemnite-logement" value="0" min="0" step="1000" 
                                        class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg" onchange="calculerToutesCotisations()">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Autres primes</label>
                                    <input type="number" id="fiche-paie-autres-primes" value="0" min="0" step="1000" 
                                        class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg" onchange="calculerToutesCotisations()">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Avantages en nature</label>
                                    <input type="number" id="fiche-paie-avantages-nature" value="0" min="0" step="1000" 
                                        class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg" onchange="calculerToutesCotisations()">
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Description avantages</label>
                                    <input type="text" id="fiche-paie-desc-avantages" placeholder="Véhicule, téléphone..."
                                        class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Section 4: Cotisations sociales -->
                        <div class="bg-blue-50 rounded-xl p-5 border border-blue-200">
                            <h3 class="font-bold text-blue-800 mb-4 flex items-center">
                                <span class="material-icons mr-2 text-blue-600">security</span>
                                Cotisations Sociales - Taux Sénégal
                            </h3>
                            
                            <!-- Toggles pour activer/désactiver les cotisations -->
                            <div class="bg-white rounded-lg p-4 mb-4 border">
                                <p class="text-sm font-medium text-gray-700 mb-3">Activer / Désactiver les cotisations :</p>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" id="toggle-ipres-rg" checked class="w-4 h-4 text-blue-600 rounded" onchange="calculerToutesCotisations()">
                                        <span class="text-sm">IPRES Retraite</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" id="toggle-ipres-rc" checked class="w-4 h-4 text-blue-600 rounded" onchange="calculerToutesCotisations()">
                                        <span class="text-sm">IPRES Compl. (Cadres)</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" id="toggle-ipm" checked class="w-4 h-4 text-blue-600 rounded" onchange="calculerToutesCotisations()">
                                        <span class="text-sm">IPM Maladie</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" id="toggle-trimf" checked class="w-4 h-4 text-blue-600 rounded" onchange="calculerToutesCotisations()">
                                        <span class="text-sm">TRIMF</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" id="toggle-pf" checked class="w-4 h-4 text-blue-600 rounded" onchange="calculerToutesCotisations()">
                                        <span class="text-sm">Prest. Familiales</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" id="toggle-at" checked class="w-4 h-4 text-blue-600 rounded" onchange="calculerToutesCotisations()">
                                        <span class="text-sm">Accidents Travail</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" id="toggle-cfe" checked class="w-4 h-4 text-blue-600 rounded" onchange="calculerToutesCotisations()">
                                        <span class="text-sm">CFE</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Taux AT -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Taux Accidents du Travail (CSS)</label>
                                    <select id="fiche-paie-taux-at" class="w-full px-3 py-2 border-2 border-blue-200 rounded-lg" onchange="calculerToutesCotisations()">
                                        <option value="1">1% - Bureaux, commerces</option>
                                        <option value="3">3% - Industrie légère</option>
                                        <option value="5" selected>5% - BTP, industries lourdes</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre d'enfants à charge</label>
                                    <input type="number" id="fiche-paie-enfants" value="0" min="0" max="10" 
                                        class="w-full px-3 py-2 border-2 border-blue-200 rounded-lg" onchange="calculerToutesCotisations()">
                                </div>
                            </div>
                            
                            <!-- Tableau récapitulatif cotisations -->
                            <div class="mt-4 bg-white rounded-lg border overflow-hidden">
                                <table class="w-full text-sm">
                                    <thead class="bg-blue-100">
                                        <tr>
                                            <th class="text-left p-2">Cotisation</th>
                                            <th class="text-center p-2">Base</th>
                                            <th class="text-center p-2">Part Salariale</th>
                                            <th class="text-center p-2">Part Patronale</th>
                                        </tr>
                                    </thead>
                                    <tbody id="cotisations-tableau">
                                        <tr class="border-b"><td colspan="4" class="p-2 text-center text-gray-400">Sélectionnez un employé...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- Section 5: Retenues diverses -->
                        <div class="bg-red-50 rounded-xl p-5 border border-red-200">
                            <h3 class="font-bold text-red-800 mb-4 flex items-center">
                                <span class="material-icons mr-2 text-red-600">remove_circle</span>
                                Retenues Diverses
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Avance sur salaire</label>
                                    <input type="number" id="fiche-paie-avance" value="0" min="0" step="1000" 
                                        class="w-full px-3 py-2 border-2 border-red-200 rounded-lg" onchange="calculerToutesCotisations()">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Acompte</label>
                                    <input type="number" id="fiche-paie-acompte" value="0" min="0" step="1000" 
                                        class="w-full px-3 py-2 border-2 border-red-200 rounded-lg" onchange="calculerToutesCotisations()">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Prêt employeur</label>
                                    <input type="number" id="fiche-paie-pret" value="0" min="0" step="1000" 
                                        class="w-full px-3 py-2 border-2 border-red-200 rounded-lg" onchange="calculerToutesCotisations()">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Autres retenues</label>
                                    <input type="number" id="fiche-paie-autres-retenues" value="0" min="0" step="1000" 
                                        class="w-full px-3 py-2 border-2 border-red-200 rounded-lg" onchange="calculerToutesCotisations()">
                                </div>
                            </div>
                            <div class="mt-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Motif autres retenues</label>
                                <input type="text" id="fiche-paie-motif-retenues" placeholder="Précisez le motif..."
                                    class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg">
                            </div>
                        </div>
                        
                        <!-- Section 6: Mode de paiement -->
                        <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                                <span class="material-icons mr-2 text-gray-600">payments</span>
                                Mode de Paiement
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Mode *</label>
                                    <select id="fiche-paie-mode-paiement" class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg" required>
                                        <option value="">-- Sélectionner --</option>
                                        <option value="Virement bancaire">Virement bancaire</option>
                                        <option value="Espèces">Espèces</option>
                                        <option value="Chèque">Chèque</option>
                                        <option value="Mobile Money">Mobile Money (Orange/Wave/Free)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Banque / Opérateur</label>
                                    <input type="text" id="fiche-paie-banque" placeholder="Ex: CBAO, Wave..."
                                        class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">N° Compte / Téléphone</label>
                                    <input type="text" id="fiche-paie-numero-compte" placeholder="IBAN ou N° téléphone"
                                        class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Récapitulatif en temps réel -->
                        <div class="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-5 text-white">
                            <h3 class="font-bold mb-4 flex items-center">
                                <span class="material-icons mr-2 text-yellow-400">calculate</span>
                                Récapitulatif du Bulletin
                            </h3>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div class="bg-white/10 rounded-lg p-3">
                                    <p class="text-blue-200 text-xs">Salaire Brut</p>
                                    <p id="recap-brut" class="font-mono font-bold text-lg">0 FCFA</p>
                                </div>
                                <div class="bg-white/10 rounded-lg p-3">
                                    <p class="text-blue-200 text-xs">Cotisations Salariales</p>
                                    <p id="recap-cotis-sal" class="font-mono font-bold text-lg text-red-300">- 0 FCFA</p>
                                </div>
                                <div class="bg-white/10 rounded-lg p-3">
                                    <p class="text-blue-200 text-xs">Cotisations Patronales</p>
                                    <p id="recap-cotis-pat" class="font-mono font-bold text-lg text-blue-300">0 FCFA</p>
                                </div>
                                <div class="bg-blue-500 rounded-lg p-3">
                                    <p class="text-blue-900 text-xs font-bold">NET À PAYER</p>
                                    <p id="recap-net" class="font-mono font-bold text-xl text-blue-900">0 FCFA</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Boutons -->
                        <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            <button type="button" id="btn-apercu-fiche" class="flex-1 min-w-[150px] px-6 py-3 bg-blue-600 text-gray-900 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                <span class="material-icons">preview</span> Aperçu
                            </button>
                            <button type="button" id="btn-generer-pdf" class="flex-1 min-w-[150px] px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2">
                                <span class="material-icons">picture_as_pdf</span> Générer PDF
                            </button>
                            <button type="submit" class="flex-1 min-w-[150px] px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2">
                                <span class="material-icons">save</span> Enregistrer
                            </button>
                        </div>
                    `}
                </form>
            </div>
            
            <!-- Historique des fiches -->
            <div class="mt-6 bg-white rounded-2xl shadow-xl p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span class="material-icons mr-2 text-yellow-500">history</span>
                    Historique des Bulletins de Paie
                </h3>
                <div id="fiches-paie-historique"></div>
            </div>
        </div>
    `;
    
    // Initialiser les événements
    initFichePaieEvents();
    renderFichesPaieHistorique();
}

function initFichePaieEvents() {
    const selectEmploye = document.getElementById('fiche-paie-employe');
    const inputSalaire = document.getElementById('fiche-paie-salaire');
    const btnApercu = document.getElementById('btn-apercu-fiche');
    const btnPDF = document.getElementById('btn-generer-pdf');
    const form = document.getElementById('fiche-paie-form');
    
    if (!selectEmploye) return;
    
    // Sélection d'un employé
    selectEmploye.addEventListener('change', function() {
        const option = this.options[this.selectedIndex];
        const infoCard = document.getElementById('employe-info-card');
        
        if (this.value) {
            const prenom = option.dataset.prenom || '';
            const nom = option.dataset.nom || '';
            const poste = option.dataset.poste || 'N/A';
            const salaire = option.dataset.salaire || 0;
            const categorie = option.dataset.categorie || '';
            const dateEmbauche = option.dataset.dateembauche || '';
            
            // Afficher la carte info
            if (infoCard) infoCard.classList.remove('hidden');
            
            document.getElementById('info-matricule').textContent = this.value;
            document.getElementById('info-poste').textContent = poste;
            document.getElementById('info-categorie').textContent = categorie || 'Non définie';
            document.getElementById('info-embauche').textContent = dateEmbauche || 'Non définie';
            
            // Remplir le salaire
            if (inputSalaire) inputSalaire.value = salaire;
            
            // Calculer les cotisations
            calculerToutesCotisations();
        } else {
            if (infoCard) infoCard.classList.add('hidden');
            if (inputSalaire) inputSalaire.value = '';
        }
    });
    
    // Mise à jour du récapitulatif en temps réel sur tous les champs numériques
    const champsNumeriques = [
        'fiche-paie-salaire', 'fiche-paie-heures-sup', 'fiche-paie-prime-anciennete',
        'fiche-paie-prime-rendement', 'fiche-paie-prime-transport', 'fiche-paie-indemnite-logement',
        'fiche-paie-autres-primes', 'fiche-paie-avantages-nature', 'fiche-paie-avance',
        'fiche-paie-acompte', 'fiche-paie-pret', 'fiche-paie-autres-retenues', 'fiche-paie-enfants'
    ];
    
    champsNumeriques.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculerToutesCotisations);
            input.addEventListener('change', calculerToutesCotisations);
        }
    });
    
    // Bouton Aperçu
    if (btnApercu) {
        btnApercu.addEventListener('click', function() {
            apercuFicheDePaie();
        });
    }
    
    // Bouton PDF
    if (btnPDF) {
        btnPDF.addEventListener('click', function() {
            genererFicheDePaiePDF();
        });
    }
    
    // Formulaire - Enregistrer
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            enregistrerFicheDePaie();
        });
    }
}

// Récupérer l'état des toggles de cotisations
function getTogglesEtat() {
    return {
        ipresRG: document.getElementById('toggle-ipres-rg')?.checked ?? true,
        ipresRC: document.getElementById('toggle-ipres-rc')?.checked ?? true,
        ipm: document.getElementById('toggle-ipm')?.checked ?? true,
        trimf: document.getElementById('toggle-trimf')?.checked ?? true,
        pf: document.getElementById('toggle-pf')?.checked ?? true,
        at: document.getElementById('toggle-at')?.checked ?? true,
        cfe: document.getElementById('toggle-cfe')?.checked ?? true
    };
}

// Calcul des cotisations sociales conformes au Sénégal
function calculerCotisationsSN(salaireBrut, isCadre = false, tauxAT = 5, toggles = null) {
    const plafondIPRES_RG = 432000;
    const plafondIPRES_RC_Max = 1296000;
    const plafondCSS = 63000;
    const plafondIPM = 250000;
    
    // Récupérer l'état des toggles si non fourni
    if (!toggles) {
        toggles = getTogglesEtat();
    }
    
    // Bases de calcul avec plafonds
    const baseIPRES_RG = Math.min(salaireBrut, plafondIPRES_RG);
    const baseCSS = Math.min(salaireBrut, plafondCSS);
    const baseIPM = Math.min(salaireBrut, plafondIPM);
    
    // Base IPRES Retraite Complémentaire (uniquement pour cadres, entre 432k et 1296k)
    let baseIPRES_RC = 0;
    if (isCadre && salaireBrut > plafondIPRES_RG) {
        baseIPRES_RC = Math.min(salaireBrut, plafondIPRES_RC_Max) - plafondIPRES_RG;
    }
    
    // Cotisations salariales (selon toggles actifs)
    const salariales = {
        ipresRG: toggles.ipresRG ? Math.round(baseIPRES_RG * 5.6 / 100) : 0,
        ipresRC: (toggles.ipresRC && isCadre) ? Math.round(baseIPRES_RC * 2.4 / 100) : 0,
        ipm: toggles.ipm ? Math.round(baseIPM * 3 / 100) : 0,
        trimf: toggles.trimf ? 3000 : 0  // Forfait mensuel
    };
    salariales.total = salariales.ipresRG + salariales.ipresRC + salariales.ipm + salariales.trimf;
    
    // Cotisations patronales (selon toggles actifs)
    const patronales = {
        ipresRG: toggles.ipresRG ? Math.round(baseIPRES_RG * 8.4 / 100) : 0,
        ipresRC: (toggles.ipresRC && isCadre) ? Math.round(baseIPRES_RC * 3.6 / 100) : 0,
        prestationsFamiliales: toggles.pf ? Math.round(baseCSS * 7 / 100) : 0,
        accidentsTravail: toggles.at ? Math.round(baseCSS * tauxAT / 100) : 0,
        ipm: toggles.ipm ? Math.round(baseIPM * 3 / 100) : 0,
        cfe: toggles.cfe ? Math.round(salaireBrut * 3 / 100) : 0
    };
    patronales.total = patronales.ipresRG + patronales.ipresRC + patronales.prestationsFamiliales + 
                        patronales.accidentsTravail + patronales.ipm + patronales.cfe;
    
    return {
        bases: {
            ipresRG: baseIPRES_RG,
            ipresRC: baseIPRES_RC,
            css: baseCSS,
            ipm: baseIPM
        },
        salariales,
        patronales,
        totalSalarial: salariales.total,
        totalPatronal: patronales.total,
        toggles  // Sauvegarder l'état des toggles
    };
}

function calculerToutesCotisations() {
    // Récupérer les valeurs
    const salaireBase = parseFloat(document.getElementById('fiche-paie-salaire')?.value) || 0;
    const heuresSup = parseFloat(document.getElementById('fiche-paie-heures-sup')?.value) || 0;
    const primeAnciennete = parseFloat(document.getElementById('fiche-paie-prime-anciennete')?.value) || 0;
    const primeRendement = parseFloat(document.getElementById('fiche-paie-prime-rendement')?.value) || 0;
    const primeTransport = parseFloat(document.getElementById('fiche-paie-prime-transport')?.value) || 0;
    const indemniteLogement = parseFloat(document.getElementById('fiche-paie-indemnite-logement')?.value) || 0;
    const autresPrimes = parseFloat(document.getElementById('fiche-paie-autres-primes')?.value) || 0;
    const avantagesNature = parseFloat(document.getElementById('fiche-paie-avantages-nature')?.value) || 0;
    
    // Retenues diverses
    const avance = parseFloat(document.getElementById('fiche-paie-avance')?.value) || 0;
    const acompte = parseFloat(document.getElementById('fiche-paie-acompte')?.value) || 0;
    const pret = parseFloat(document.getElementById('fiche-paie-pret')?.value) || 0;
    const autresRetenues = parseFloat(document.getElementById('fiche-paie-autres-retenues')?.value) || 0;
    
    // Paramètres
    const isCadre = document.getElementById('fiche-paie-statut-salarie')?.value === 'cadre';
    const tauxAT = parseFloat(document.getElementById('fiche-paie-taux-at')?.value) || 5;
    
    // Calcul heures supplémentaires (majoration 15% pour les 8 premières, 40% au-delà)
    const tauxHoraire = salaireBase / 173.33;
    let montantHeuresSup = 0;
    if (heuresSup <= 8) {
        montantHeuresSup = heuresSup * tauxHoraire * 1.15;
    } else {
        montantHeuresSup = (8 * tauxHoraire * 1.15) + ((heuresSup - 8) * tauxHoraire * 1.40);
    }
    montantHeuresSup = Math.round(montantHeuresSup);
    
    // Total des primes
    const totalPrimes = primeAnciennete + primeRendement + autresPrimes + avantagesNature;
    
    // Indemnités non soumises à cotisations (transport, logement plafonné)
    const indemnitesNonSoumises = primeTransport + Math.min(indemniteLogement, 100000);
    
    // Salaire brut soumis à cotisations
    const salaireBrutSoumis = salaireBase + montantHeuresSup + totalPrimes;
    
    // Salaire brut total
    const salaireBrutTotal = salaireBrutSoumis + primeTransport + indemniteLogement;
    
    // Calculer les cotisations
    const cotisations = calculerCotisationsSN(salaireBrutSoumis, isCadre, tauxAT);
    
    // Retenues diverses totales
    const totalRetenuesDiverses = avance + acompte + pret + autresRetenues;
    
    // Salaire net
    const salaireNet = salaireBrutTotal - cotisations.totalSalarial - totalRetenuesDiverses;
    
    // Afficher le tableau des cotisations
    afficherTableauCotisations(cotisations, salaireBrutSoumis, isCadre);
    
    // Mettre à jour le récapitulatif
    const format = (n) => n.toLocaleString('fr-FR') + ' FCFA';
    
    const recapBrut = document.getElementById('recap-brut');
    const recapCotisSal = document.getElementById('recap-cotis-sal');
    const recapCotisPat = document.getElementById('recap-cotis-pat');
    const recapNet = document.getElementById('recap-net');
    
    if (recapBrut) recapBrut.textContent = format(salaireBrutTotal);
    if (recapCotisSal) recapCotisSal.textContent = '- ' + format(cotisations.totalSalarial);
    if (recapCotisPat) recapCotisPat.textContent = format(cotisations.totalPatronal);
    if (recapNet) recapNet.textContent = format(salaireNet);
    
    return {
        salaireBase,
        montantHeuresSup,
        heuresSup,
        primeAnciennete,
        primeRendement,
        primeTransport,
        indemniteLogement,
        autresPrimes,
        avantagesNature,
        totalPrimes,
        salaireBrutSoumis,
        salaireBrutTotal,
        cotisations,
        avance,
        acompte,
        pret,
        autresRetenues,
        totalRetenuesDiverses,
        salaireNet,
        isCadre,
        tauxAT
    };
}

function afficherTableauCotisations(cotisations, salaireBrut, isCadre) {
    const tableau = document.getElementById('cotisations-tableau');
    if (!tableau) return;
    
    const format = (n) => n.toLocaleString('fr-FR');
    const toggles = cotisations.toggles || getTogglesEtat();
    
    // Fonction pour style selon activation
    const rowClass = (active) => active ? 'border-b hover:bg-blue-50' : 'border-b bg-gray-100 opacity-50';
    const valClass = (active, type) => active ? (type === 'sal' ? 'text-red-600' : 'text-blue-600') : 'text-gray-400';
    
    let html = '';
    
    // IPRES Régime Général
    html += `<tr class="${rowClass(toggles.ipresRG)}">
        <td class="p-2 font-medium">${!toggles.ipresRG ? '<span class="line-through">IPRES Retraite (RG)</span> ❌' : 'IPRES Retraite (RG)'}</td>
        <td class="p-2 text-center text-xs">${format(cotisations.bases.ipresRG)} <span class="text-gray-400">(plafond 432k)</span></td>
        <td class="p-2 text-center ${valClass(toggles.ipresRG, 'sal')} font-mono">${format(cotisations.salariales.ipresRG)} <span class="text-gray-400">(5,6%)</span></td>
        <td class="p-2 text-center ${valClass(toggles.ipresRG, 'pat')} font-mono">${format(cotisations.patronales.ipresRG)} <span class="text-gray-400">(8,4%)</span></td>
    </tr>`;
    
    // IPRES RC (si cadre)
    if (isCadre) {
        html += `<tr class="${rowClass(toggles.ipresRC)} ${toggles.ipresRC ? 'bg-purple-50' : ''}">
            <td class="p-2 font-medium">${!toggles.ipresRC ? '<span class="line-through">IPRES Complémentaire</span> ❌' : 'IPRES Complémentaire (Cadres)'}</td>
            <td class="p-2 text-center text-xs">${format(cotisations.bases.ipresRC)}</td>
            <td class="p-2 text-center ${valClass(toggles.ipresRC, 'sal')} font-mono">${format(cotisations.salariales.ipresRC)} <span class="text-gray-400">(2,4%)</span></td>
            <td class="p-2 text-center ${valClass(toggles.ipresRC, 'pat')} font-mono">${format(cotisations.patronales.ipresRC)} <span class="text-gray-400">(3,6%)</span></td>
        </tr>`;
    }
    
    // IPM Maladie
    html += `<tr class="${rowClass(toggles.ipm)}">
        <td class="p-2 font-medium">${!toggles.ipm ? '<span class="line-through">IPM Maladie</span> ❌' : 'IPM Maladie'}</td>
        <td class="p-2 text-center text-xs">${format(cotisations.bases.ipm)} <span class="text-gray-400">(plafond 250k)</span></td>
        <td class="p-2 text-center ${valClass(toggles.ipm, 'sal')} font-mono">${format(cotisations.salariales.ipm)} <span class="text-gray-400">(3%)</span></td>
        <td class="p-2 text-center ${valClass(toggles.ipm, 'pat')} font-mono">${format(cotisations.patronales.ipm)} <span class="text-gray-400">(3%)</span></td>
    </tr>`;
    
    // TRIMF
    html += `<tr class="${rowClass(toggles.trimf)}">
        <td class="p-2 font-medium">${!toggles.trimf ? '<span class="line-through">TRIMF</span> ❌' : 'TRIMF'}</td>
        <td class="p-2 text-center text-xs">Forfait mensuel</td>
        <td class="p-2 text-center ${valClass(toggles.trimf, 'sal')} font-mono">${format(cotisations.salariales.trimf)}</td>
        <td class="p-2 text-center text-gray-400">-</td>
    </tr>`;
    
    // Prestations Familiales (CSS)
    html += `<tr class="${rowClass(toggles.pf)}">
        <td class="p-2 font-medium">${!toggles.pf ? '<span class="line-through">Prestations Familiales</span> ❌' : 'Prestations Familiales (CSS)'}</td>
        <td class="p-2 text-center text-xs">${format(cotisations.bases.css)} <span class="text-gray-400">(plafond 63k)</span></td>
        <td class="p-2 text-center text-gray-400">-</td>
        <td class="p-2 text-center ${valClass(toggles.pf, 'pat')} font-mono">${format(cotisations.patronales.prestationsFamiliales)} <span class="text-gray-400">(7%)</span></td>
    </tr>`;
    
    // Accidents du Travail (CSS)
    const tauxAT = parseFloat(document.getElementById('fiche-paie-taux-at')?.value) || 5;
    html += `<tr class="${rowClass(toggles.at)}">
        <td class="p-2 font-medium">${!toggles.at ? '<span class="line-through">Accidents du Travail</span> ❌' : 'Accidents du Travail (CSS)'}</td>
        <td class="p-2 text-center text-xs">${format(cotisations.bases.css)}</td>
        <td class="p-2 text-center text-gray-400">-</td>
        <td class="p-2 text-center ${valClass(toggles.at, 'pat')} font-mono">${format(cotisations.patronales.accidentsTravail)} <span class="text-gray-400">(${tauxAT}%)</span></td>
    </tr>`;
    
    // CFE
    html += `<tr class="${rowClass(toggles.cfe)}">
        <td class="p-2 font-medium">${!toggles.cfe ? '<span class="line-through">CFE</span> ❌' : 'CFE (Contribution Forfaitaire)'}</td>
        <td class="p-2 text-center text-xs">${format(salaireBrut)}</td>
        <td class="p-2 text-center text-gray-400">-</td>
        <td class="p-2 text-center ${valClass(toggles.cfe, 'pat')} font-mono">${format(cotisations.patronales.cfe)} <span class="text-gray-400">(3%)</span></td>
    </tr>`;
    
    // TOTAUX
    html += `<tr class="bg-gray-100 font-bold">
        <td class="p-2">TOTAL COTISATIONS</td>
        <td class="p-2 text-center"></td>
        <td class="p-2 text-center text-red-700 font-mono">${format(cotisations.totalSalarial)}</td>
        <td class="p-2 text-center text-blue-700 font-mono">${format(cotisations.totalPatronal)}</td>
    </tr>`;
    
    tableau.innerHTML = html;
}

function updateCotisationsAffichage() {
    calculerToutesCotisations();
}

function getFichePaieData() {
    const selectEmploye = document.getElementById('fiche-paie-employe');
    if (!selectEmploye || !selectEmploye.value) {
        showNotification('Erreur', 'Veuillez sélectionner un employé', 'error');
        return null;
    }
    
    const option = selectEmploye.options[selectEmploye.selectedIndex];
    const mois = document.getElementById('fiche-paie-mois')?.value;
    const modePaiement = document.getElementById('fiche-paie-mode-paiement')?.value;
    
    if (!mois) {
        showNotification('Erreur', 'Veuillez sélectionner une période', 'error');
        return null;
    }
    
    if (!modePaiement) {
        showNotification('Erreur', 'Veuillez sélectionner un mode de paiement', 'error');
        return null;
    }
    
    // Calculer toutes les données
    const calcul = calculerToutesCotisations();
    
    if (calcul.salaireBase <= 0) {
        showNotification('Erreur', 'Le salaire doit être supérieur à 0', 'error');
        return null;
    }
    
    // Récupérer les infos complètes de l'employé
    const employes = JSON.parse(localStorage.getItem('employes') || '[]');
    const employe = employes.find(e => e.matricule === selectEmploye.value);
    
    return {
        // Identification
        matricule: selectEmploye.value,
        nom: option.dataset.nom || employe?.nom || '',
        prenom: option.dataset.prenom || employe?.prenom || '',
        poste: option.dataset.poste || employe?.poste || '',
        departement: option.dataset.departement || employe?.departement || '',
        dateEmbauche: option.dataset.dateembauche || employe?.dateEmbauche || '',
        
        // Classification
        categorie: document.getElementById('fiche-paie-categorie')?.value || '7',
        echelon: document.getElementById('fiche-paie-echelon')?.value || 'A',
        convention: document.getElementById('fiche-paie-convention')?.value || 'BTP',
        statutSalarie: document.getElementById('fiche-paie-statut-salarie')?.value || 'non-cadre',
        isCadre: calcul.isCadre,
        
        // Période
        mois,
        
        // Rémunération
        salaireBase: calcul.salaireBase,
        heuresTravaillees: parseFloat(document.getElementById('fiche-paie-heures')?.value) || 173.33,
        heuresSup: calcul.heuresSup,
        montantHeuresSup: calcul.montantHeuresSup,
        primeAnciennete: calcul.primeAnciennete,
        primeRendement: calcul.primeRendement,
        primeTransport: calcul.primeTransport,
        indemniteLogement: calcul.indemniteLogement,
        autresPrimes: calcul.autresPrimes,
        avantagesNature: calcul.avantagesNature,
        descAvantages: document.getElementById('fiche-paie-desc-avantages')?.value || '',
        totalPrimes: calcul.totalPrimes,
        salaireBrutSoumis: calcul.salaireBrutSoumis,
        salaireBrut: calcul.salaireBrutTotal,
        
        // Cotisations
        cotisations: calcul.cotisations,
        tauxAT: calcul.tauxAT,
        nbEnfants: parseFloat(document.getElementById('fiche-paie-enfants')?.value) || 0,
        
        // Retenues diverses
        avance: calcul.avance,
        acompte: calcul.acompte,
        pret: calcul.pret,
        autresRetenues: calcul.autresRetenues,
        motifRetenues: document.getElementById('fiche-paie-motif-retenues')?.value || '',
        totalRetenuesDiverses: calcul.totalRetenuesDiverses,
        
        // Paiement
        modePaiement,
        banque: document.getElementById('fiche-paie-banque')?.value || '',
        numeroCompte: document.getElementById('fiche-paie-numero-compte')?.value || '',
        
        // Totaux
        totalCotisationsSalariales: calcul.cotisations.totalSalarial,
        totalCotisationsPatronales: calcul.cotisations.totalPatronal,
        net: calcul.salaireNet,
        
        // Métadonnées
        date: new Date().toISOString(),
        
        // Infos entreprise
        entreprise: 'KFS BTP IMMO',
        adresseEntreprise: 'Villa 123 MC, Quartier Medinacoura, Tambacounda, Sénégal',
        telephoneEntreprise: '+221 78 584 28 71',
        emailEntreprise: 'kfsbtpproimmo@gmail.com',
        nineaEntreprise: '009468499',
        rccmEntreprise: 'SN TBC 2025 M 1361',
        ipresEntreprise: 'À compléter'
    };
}

function apercuFicheDePaie() {
    const fiche = getFichePaieData();
    if (!fiche) return;
    
    const moisFormate = new Date(fiche.mois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const dateEmission = new Date().toLocaleDateString('fr-FR');
    const format = (n) => (n || 0).toLocaleString('fr-FR');
    
    // Créer la modale
    const modal = document.createElement('div');
    modal.id = 'modal-apercu-fiche-paie';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.onclick = function(e) {
        if (e.target === modal) fermerApercuFichePaie();
    };
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden animate__animated animate__zoomIn">
            <!-- Header de la modale -->
            <div class="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <span class="material-icons text-yellow-400 text-2xl">receipt_long</span>
                    <div>
                        <h2 class="text-xl font-bold text-white">Bulletin de Paie - Conforme Sénégal</h2>
                        <p class="text-blue-200 text-sm">${fiche.prenom} ${fiche.nom} - ${moisFormate}</p>
                    </div>
                </div>
                <button onclick="fermerApercuFichePaie()" class="text-white hover:text-yellow-400 transition p-2 hover:bg-white/10 rounded-full">
                    <span class="material-icons text-2xl">close</span>
                </button>
            </div>
            
            <!-- Contenu scrollable avec scrollbar toujours visible -->
            <div class="overflow-y-scroll max-h-[calc(95vh-180px)] p-6" style="scrollbar-width: auto; scrollbar-color: #3b82f6 #e5e7eb;">
                <style>
                    .overflow-y-scroll::-webkit-scrollbar {
                        width: 12px;
                    }
                    .overflow-y-scroll::-webkit-scrollbar-track {
                        background: #e5e7eb;
                        border-radius: 6px;
                    }
                    .overflow-y-scroll::-webkit-scrollbar-thumb {
                        background: #3b82f6;
                        border-radius: 6px;
                        border: 2px solid #e5e7eb;
                    }
                    .overflow-y-scroll::-webkit-scrollbar-thumb:hover {
                        background: #1e3a8a;
                    }
                </style>
                <!-- En-tête entreprise -->
                <div class="flex flex-col md:flex-row justify-between items-start gap-4 border-b-2 border-blue-600 pb-4 mb-4">
                    <div>
                        <h1 class="text-2xl font-bold text-blue-800">KFS BTP IMMO</h1>
                        <p class="text-sm text-gray-600">Villa 123 MC, Medinacoura, Tambacounda</p>
                        <p class="text-sm text-gray-600">NINEA: ${fiche.nineaEntreprise} | RCCM: ${fiche.rccmEntreprise}</p>
                        <p class="text-sm text-gray-600">Tél: ${fiche.telephoneEntreprise}</p>
                    </div>
                    <div class="text-right">
                        <div class="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-5 py-3 rounded-xl shadow-lg">
                            <p class="text-xs opacity-80">BULLETIN DE PAIE</p>
                            <p class="font-bold text-lg">${moisFormate.toUpperCase()}</p>
                            <p class="text-xs opacity-80">Émis le ${dateEmission}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Infos employé -->
                <div class="bg-blue-50 rounded-xl p-4 mb-4 border-l-4 border-blue-600">
                    <h3 class="font-bold text-blue-800 mb-2">Identification du Salarié</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><p class="text-gray-500 text-xs">Nom complet</p><p class="font-bold">${fiche.prenom} ${fiche.nom}</p></div>
                        <div><p class="text-gray-500 text-xs">Matricule</p><p class="font-mono font-bold text-blue-700">${fiche.matricule}</p></div>
                        <div><p class="text-gray-500 text-xs">Poste</p><p class="font-bold">${fiche.poste || 'N/D'}</p></div>
                        <div><p class="text-gray-500 text-xs">Catégorie/Échelon</p><p class="font-bold">${fiche.categorie}-${fiche.echelon}</p></div>
                        <div><p class="text-gray-500 text-xs">Convention</p><p class="font-bold">${fiche.convention}</p></div>
                        <div><p class="text-gray-500 text-xs">Statut</p><p class="font-bold">${fiche.isCadre ? 'Cadre' : 'Non-cadre'}</p></div>
                        <div><p class="text-gray-500 text-xs">Date embauche</p><p class="font-bold">${fiche.dateEmbauche || 'N/D'}</p></div>
                        <div><p class="text-gray-500 text-xs">Heures travaillées</p><p class="font-bold">${fiche.heuresTravaillees}h</p></div>
                    </div>
                </div>
                
                <!-- GAINS ET COTISATIONS -->
                <div class="grid md:grid-cols-2 gap-4 mb-4">
                    <!-- Colonne GAINS -->
                    <div class="border rounded-xl overflow-hidden">
                        <div class="bg-green-600 text-white px-4 py-2 font-bold flex items-center gap-2">
                            <span class="material-icons">add_circle</span> GAINS
                        </div>
                        <div class="p-3 space-y-2 text-sm">
                            <div class="flex justify-between border-b pb-1">
                                <span>Salaire de base</span>
                                <span class="font-mono font-bold">${format(fiche.salaireBase)}</span>
                            </div>
                            ${fiche.montantHeuresSup > 0 ? `
                            <div class="flex justify-between border-b pb-1">
                                <span>Heures sup. (${fiche.heuresSup}h)</span>
                                <span class="font-mono text-green-600">${format(fiche.montantHeuresSup)}</span>
                            </div>` : ''}
                            ${fiche.primeAnciennete > 0 ? `
                            <div class="flex justify-between border-b pb-1">
                                <span>Prime d'ancienneté</span>
                                <span class="font-mono text-green-600">${format(fiche.primeAnciennete)}</span>
                            </div>` : ''}
                            ${fiche.primeRendement > 0 ? `
                            <div class="flex justify-between border-b pb-1">
                                <span>Prime de rendement</span>
                                <span class="font-mono text-green-600">${format(fiche.primeRendement)}</span>
                            </div>` : ''}
                            ${fiche.primeTransport > 0 ? `
                            <div class="flex justify-between border-b pb-1">
                                <span>Prime de transport</span>
                                <span class="font-mono text-green-600">${format(fiche.primeTransport)}</span>
                            </div>` : ''}
                            ${fiche.indemniteLogement > 0 ? `
                            <div class="flex justify-between border-b pb-1">
                                <span>Indemnité de logement</span>
                                <span class="font-mono text-green-600">${format(fiche.indemniteLogement)}</span>
                            </div>` : ''}
                            ${fiche.autresPrimes > 0 ? `
                            <div class="flex justify-between border-b pb-1">
                                <span>Autres primes</span>
                                <span class="font-mono text-green-600">${format(fiche.autresPrimes)}</span>
                            </div>` : ''}
                            ${fiche.avantagesNature > 0 ? `
                            <div class="flex justify-between border-b pb-1">
                                <span>Avantages en nature</span>
                                <span class="font-mono text-green-600">${format(fiche.avantagesNature)}</span>
                            </div>` : ''}
                            <div class="flex justify-between pt-2 bg-green-50 -mx-3 px-3 py-2 mt-2 font-bold">
                                <span class="text-green-700">SALAIRE BRUT</span>
                                <span class="text-green-700 font-mono">${format(fiche.salaireBrut)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Colonne COTISATIONS SALARIALES -->
                    <div class="border rounded-xl overflow-hidden">
                        <div class="bg-red-600 text-white px-4 py-2 font-bold flex items-center gap-2">
                            <span class="material-icons">remove_circle</span> COTISATIONS SALARIALES
                        </div>
                        <div class="p-3 space-y-2 text-sm">
                            <div class="flex justify-between border-b pb-1">
                                <span>IPRES Retraite (5,6%)</span>
                                <span class="font-mono text-red-600">-${format(fiche.cotisations.salariales.ipresRG)}</span>
                            </div>
                            ${fiche.isCadre ? `
                            <div class="flex justify-between border-b pb-1">
                                <span>IPRES Complémentaire (2,4%)</span>
                                <span class="font-mono text-red-600">-${format(fiche.cotisations.salariales.ipresRC)}</span>
                            </div>` : ''}
                            <div class="flex justify-between border-b pb-1">
                                <span>IPM Maladie (3%)</span>
                                <span class="font-mono text-red-600">-${format(fiche.cotisations.salariales.ipm)}</span>
                            </div>
                            <div class="flex justify-between border-b pb-1">
                                <span>TRIMF</span>
                                <span class="font-mono text-red-600">-${format(fiche.cotisations.salariales.trimf)}</span>
                            </div>
                            ${fiche.avance > 0 ? `
                            <div class="flex justify-between border-b pb-1 bg-yellow-50 -mx-3 px-3">
                                <span>Avance sur salaire</span>
                                <span class="font-mono text-red-600">-${format(fiche.avance)}</span>
                            </div>` : ''}
                            ${fiche.acompte > 0 ? `
                            <div class="flex justify-between border-b pb-1 bg-yellow-50 -mx-3 px-3">
                                <span>Acompte</span>
                                <span class="font-mono text-red-600">-${format(fiche.acompte)}</span>
                            </div>` : ''}
                            ${fiche.pret > 0 ? `
                            <div class="flex justify-between border-b pb-1 bg-yellow-50 -mx-3 px-3">
                                <span>Remb. prêt</span>
                                <span class="font-mono text-red-600">-${format(fiche.pret)}</span>
                            </div>` : ''}
                            ${fiche.autresRetenues > 0 ? `
                            <div class="flex justify-between border-b pb-1 bg-yellow-50 -mx-3 px-3">
                                <span>Autres retenues</span>
                                <span class="font-mono text-red-600">-${format(fiche.autresRetenues)}</span>
                            </div>` : ''}
                            <div class="flex justify-between pt-2 bg-red-50 -mx-3 px-3 py-2 mt-2 font-bold">
                                <span class="text-red-700">TOTAL RETENUES</span>
                                <span class="text-red-700 font-mono">${format(fiche.totalCotisationsSalariales + fiche.totalRetenuesDiverses)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Cotisations patronales (info) -->
                <div class="bg-blue-50 rounded-xl p-3 mb-4 text-sm">
                    <h4 class="font-bold text-blue-800 mb-2">Cotisations Patronales (pour information)</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div><span class="text-gray-500">IPRES (8,4%)</span><br><span class="font-mono">${format(fiche.cotisations.patronales.ipresRG)}</span></div>
                        ${fiche.isCadre ? `<div><span class="text-gray-500">IPRES Compl. (3,6%)</span><br><span class="font-mono">${format(fiche.cotisations.patronales.ipresRC)}</span></div>` : ''}
                        <div><span class="text-gray-500">Prest. Fam. (7%)</span><br><span class="font-mono">${format(fiche.cotisations.patronales.prestationsFamiliales)}</span></div>
                        <div><span class="text-gray-500">AT (${fiche.tauxAT}%)</span><br><span class="font-mono">${format(fiche.cotisations.patronales.accidentsTravail)}</span></div>
                        <div><span class="text-gray-500">IPM (3%)</span><br><span class="font-mono">${format(fiche.cotisations.patronales.ipm)}</span></div>
                        <div><span class="text-gray-500">CFE (3%)</span><br><span class="font-mono">${format(fiche.cotisations.patronales.cfe)}</span></div>
                        <div class="font-bold"><span class="text-blue-800">TOTAL</span><br><span class="font-mono text-blue-800">${format(fiche.totalCotisationsPatronales)}</span></div>
                    </div>
                </div>
                
                <!-- NET À PAYER -->
                <div class="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl p-5 mb-4 shadow-lg">
                    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div class="flex items-center gap-3">
                            <span class="material-icons text-yellow-400 text-3xl">account_balance_wallet</span>
                            <span class="text-white font-bold text-xl">NET À PAYER</span>
                        </div>
                        <div class="bg-blue-500 text-blue-900 font-bold text-2xl px-6 py-3 rounded-xl shadow-md font-mono">
                            ${format(fiche.net)} FCFA
                        </div>
                    </div>
                </div>
                
                <!-- Mode de paiement -->
                <div class="bg-gray-100 rounded-xl p-4 flex items-center gap-4">
                    <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span class="material-icons text-white">payments</span>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Mode de paiement</p>
                        <p class="font-bold text-gray-800">${fiche.modePaiement} ${fiche.banque ? '- ' + fiche.banque : ''}</p>
                    </div>
                </div>
            </div>
            
            <!-- Footer avec boutons -->
            <div class="bg-gray-50 px-6 py-4 border-t flex flex-wrap justify-between items-center gap-3">
                <p class="text-xs text-gray-500">
                    <span class="material-icons text-sm align-middle">info</span>
                    Conforme au Code du Travail Sénégalais - À conserver sans limitation de durée
                </p>
                <div class="flex gap-3">
                    <button onclick="fermerApercuFichePaie()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center gap-2">
                        <span class="material-icons">close</span> Fermer
                    </button>
                    <button onclick="fermerApercuFichePaie(); genererFicheDePaiePDF();" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2">
                        <span class="material-icons">picture_as_pdf</span> Télécharger PDF
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
}

// Fonction pour fermer l'aperçu
function fermerApercuFichePaie() {
    const modal = document.getElementById('modal-apercu-fiche-paie');
    if (modal) {
        modal.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 200);
    }
}

// Logo KFS BTP - Variable initialisée par logo-base64.js
let logoKFSBase64 = null;

// Précharger le logo au démarrage de l'admin
function preloadLogo() {
    // Utiliser le logo défini dans logo-base64.js
    if (typeof LOGO_KFS_BASE64 !== 'undefined') {
        logoKFSBase64 = LOGO_KFS_BASE64;
        console.log('Logo KFS BTP chargé depuis logo-base64.js');
    } else {
        console.warn('LOGO_KFS_BASE64 non trouvé, le logo ne sera pas affiché');
    }
}

// Appeler au chargement
document.addEventListener('DOMContentLoaded', preloadLogo);

function genererFicheDePaiePDF() {
    const fiche = getFichePaieData();
    if (!fiche) return;
    
    // Vérifier si jsPDF est chargé
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showNotification('Erreur', 'La bibliothèque PDF n\'est pas chargée. Rechargez la page.', 'error');
        console.error('jsPDF non disponible. window.jspdf =', window.jspdf);
        return;
    }
    
    // Fonction de formatage des nombres compatible avec jsPDF
    function formatMontant(nombre) {
        return (nombre || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',');
    }
    
    function formatEntier(nombre) {
        return (nombre || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const moisFormate = new Date(fiche.mois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        const dateEmission = new Date().toLocaleDateString('fr-FR');
        
        // Couleurs KFS BTP
        const bleuFonce = [30, 58, 138];      // #1e3a8a - Bleu KFS principal
        const bleuMoyen = [37, 99, 235];      // #2563eb - Bleu KFS secondaire
        const bleuClair = [219, 234, 254];    // #dbeafe - Bleu très clair
        const noir = [0, 0, 0];
        const gris = [100, 100, 100];
        const grisClair = [245, 245, 245];
        const grisMoyen = [220, 220, 220];
        const blanc = [255, 255, 255];
        
        // Utiliser le logo préchargé
        let logoBase64 = logoKFSBase64;
        
        let y = 8;
        
        // ========== EN-TÊTE ==========
        // Logo à gauche
        if (logoBase64) {
            try {
                doc.addImage(logoBase64, 'JPEG', 10, y, 25, 25);
            } catch (e) {
                console.error('Erreur logo PDF:', e);
                doc.setFillColor(...bleuFonce);
                doc.circle(22, y + 12, 10, 'F');
                doc.setTextColor(...blanc);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('KFS', 22, y + 14, { align: 'center' });
            }
        } else {
            doc.setFillColor(...bleuFonce);
            doc.circle(22, y + 12, 10, 'F');
            doc.setTextColor(...blanc);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('KFS', 22, y + 14, { align: 'center' });
        }
        
        // Infos entreprise sous le logo
        doc.setTextColor(...noir);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('NINEA: ' + (fiche.nineaEntreprise || 'N/D'), 10, y + 30);
        doc.text('RCCM: ' + (fiche.rccmEntreprise || 'N/D'), 10, y + 34);
        
        // BULLETIN DE SALAIRE (bandeau bleu KFS à droite)
        doc.setFillColor(...bleuFonce);
        doc.rect(100, y, 100, 14, 'F');
        doc.setTextColor(...blanc);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('BULLETIN DE SALAIRE', 150, y + 9, { align: 'center' });
        
        // Période sous le bandeau
        doc.setTextColor(...noir);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Periode du 01 au ' + new Date(fiche.mois + '-01').toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).split(' ').slice(1).join(' '), 100, y + 20);
        
        // Zone employé (bandeau bleu KFS)
        y += 38;
        doc.setFillColor(...bleuMoyen);
        doc.rect(100, y, 100, 12, 'F');
        doc.setTextColor(...blanc);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text((fiche.prenom + ' ' + fiche.nom).toUpperCase(), 105, y + 5);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Dakar, Senegal', 105, y + 10);
        
        // Infos employé à gauche
        doc.setTextColor(...noir);
        doc.setFontSize(7);
        const infoY = y - 2;
        doc.text('Matricule: ' + fiche.matricule, 10, infoY);
        doc.text('N IPRES: ' + (fiche.numSecuSociale || 'N/D'), 10, infoY + 4);
        doc.text('Emploi: ' + (fiche.poste || 'N/D'), 10, infoY + 8);
        doc.text('Statut: ' + (fiche.isCadre ? 'Cadre' : 'Non-cadre'), 10, infoY + 12);
        doc.text('Cat./Ech.: ' + fiche.categorie + '-' + fiche.echelon, 50, infoY);
        doc.text('Entree: ' + (fiche.dateEmbauche || 'N/D'), 50, infoY + 4);
        doc.text('Convention: ' + fiche.convention, 50, infoY + 8);
        
        // ========== TABLEAU PRINCIPAL ==========
        y += 18;
        
        // En-têtes du tableau
        const colWidths = [60, 25, 20, 25, 25, 35];
        const colX = [10, 70, 95, 115, 140, 165];
        const tableWidth = 190;
        
        doc.setFillColor(...bleuFonce);
        doc.rect(10, y, tableWidth, 8, 'F');
        doc.setTextColor(...blanc);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Elements de paie', colX[0] + 2, y + 5);
        doc.text('Base', colX[1] + 2, y + 5);
        doc.text('Taux', colX[2] + 2, y + 5);
        doc.text('A deduire', colX[3] + 2, y + 5);
        doc.text('A payer', colX[4] + 2, y + 5);
        doc.text('Charges pat.', colX[5] + 2, y + 5);
        
        y += 8;
        let rowY = y;
        const rowHeight = 5;
        
        // Fonction pour dessiner une ligne du tableau
        function drawRow(label, base, taux, deduire, payer, patronal, isBold, bgColor) {
            if (bgColor) {
                doc.setFillColor(...bgColor);
                doc.rect(10, rowY, tableWidth, rowHeight, 'F');
            }
            doc.setDrawColor(...grisMoyen);
            doc.line(10, rowY + rowHeight, 200, rowY + rowHeight);
            
            doc.setTextColor(...noir);
            doc.setFontSize(6);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            
            doc.text(label, colX[0] + 2, rowY + 3.5);
            if (base !== '') doc.text(base.toString(), colX[1] + 22, rowY + 3.5, { align: 'right' });
            if (taux !== '') doc.text(taux.toString(), colX[2] + 18, rowY + 3.5, { align: 'right' });
            if (deduire !== '') doc.text(deduire.toString(), colX[3] + 23, rowY + 3.5, { align: 'right' });
            if (payer !== '') doc.text(payer.toString(), colX[4] + 23, rowY + 3.5, { align: 'right' });
            if (patronal !== '') doc.text(patronal.toString(), colX[5] + 33, rowY + 3.5, { align: 'right' });
            
            rowY += rowHeight;
        }
        
        // ===== SALAIRE =====
        drawRow('SALAIRE', '', '', '', '', '', true, grisClair);
        drawRow('Salaire de base', formatEntier(fiche.heuresTravaillees) + 'h', formatMontant(fiche.salaireBase / fiche.heuresTravaillees), '', formatMontant(fiche.salaireBase), '', false, null);
        
        // Heures supplémentaires
        if (fiche.montantHeuresSup > 0) {
            drawRow('Heures supplementaires', fiche.heuresSup + 'h', '', '', formatMontant(fiche.montantHeuresSup), '', false, null);
        }
        
        // ===== PRIMES ET INDEMNITÉS =====
        const hasIndemnites = fiche.primeAnciennete > 0 || fiche.primeRendement > 0 || fiche.primeTransport > 0 || fiche.indemniteLogement > 0 || fiche.autresPrimes > 0;
        if (hasIndemnites) {
            drawRow('PRIMES ET INDEMNITES', '', '', '', '', '', true, grisClair);
            if (fiche.primeAnciennete > 0) drawRow('Prime anciennete', '', '', '', formatMontant(fiche.primeAnciennete), '', false, null);
            if (fiche.primeRendement > 0) drawRow('Prime de rendement', '', '', '', formatMontant(fiche.primeRendement), '', false, null);
            if (fiche.primeTransport > 0) drawRow('Prime de transport', '', '', '', formatMontant(fiche.primeTransport), '', false, null);
            if (fiche.indemniteLogement > 0) drawRow('Indemnite de logement', '', '', '', formatMontant(fiche.indemniteLogement), '', false, null);
            if (fiche.autresPrimes > 0) drawRow('Autres primes', '', '', '', formatMontant(fiche.autresPrimes), '', false, null);
        }
        
        // ===== SALAIRE BRUT =====
        drawRow('SALAIRE BRUT', '', '', '', formatMontant(fiche.salaireBrut), '', true, bleuClair);
        
        // ===== COTISATIONS =====
        drawRow('COTISATIONS SOCIALES', '', '', '', '', '', true, grisClair);
        
        // Retraite IPRES RG
        drawRow('IPRES Regime General', formatMontant(fiche.salaireBrut), '5,60%', formatMontant(fiche.cotisations.salariales.ipresRG), '', formatMontant(fiche.cotisations.patronales.ipresRG), false, null);
        
        // Retraite IPRES RC (cadres)
        if (fiche.isCadre) {
            drawRow('IPRES Regime Complementaire', formatMontant(fiche.salaireBrut), '2,40%', formatMontant(fiche.cotisations.salariales.ipresRC), '', formatMontant(fiche.cotisations.patronales.ipresRC), false, null);
        }
        
        // IPM Maladie
        drawRow('IPM Maladie', formatMontant(fiche.salaireBrut), '3,00%', formatMontant(fiche.cotisations.salariales.ipm), '', formatMontant(fiche.cotisations.patronales.ipm), false, null);
        
        // Prestations familiales
        drawRow('Prestations Familiales (CSS)', formatMontant(fiche.salaireBrut), '7,00%', '', '', formatMontant(fiche.cotisations.patronales.prestationsFamiliales), false, null);
        
        // Accidents du travail
        drawRow('Accidents du Travail', formatMontant(fiche.salaireBrut), fiche.tauxAT + '%', '', '', formatMontant(fiche.cotisations.patronales.accidentsTravail), false, null);
        
        // CFE
        drawRow('CFE', formatMontant(fiche.salaireBrut), '3,00%', '', '', formatMontant(fiche.cotisations.patronales.cfe), false, null);
        
        // TRIMF
        drawRow('TRIMF', '', '', formatMontant(fiche.cotisations.salariales.trimf), '', '', false, null);
        
        // Total cotisations
        drawRow('TOTAL COTISATIONS', '', '', formatMontant(fiche.totalCotisationsSalariales), '', formatMontant(fiche.totalCotisationsPatronales), true, bleuClair);
        
        // ===== RETENUES DIVERSES =====
        const hasRetenues = fiche.avance > 0 || fiche.acompte > 0 || fiche.pret > 0 || fiche.autresRetenues > 0;
        if (hasRetenues) {
            drawRow('AUTRES RETENUES', '', '', '', '', '', true, grisClair);
            if (fiche.avance > 0) drawRow('Avance sur salaire', '', '', formatMontant(fiche.avance), '', '', false, null);
            if (fiche.acompte > 0) drawRow('Acompte', '', '', formatMontant(fiche.acompte), '', '', false, null);
            if (fiche.pret > 0) drawRow('Remboursement pret', '', '', formatMontant(fiche.pret), '', '', false, null);
            if (fiche.autresRetenues > 0) drawRow('Autres retenues', '', '', formatMontant(fiche.autresRetenues), '', '', false, null);
            drawRow('TOTAL RETENUES DIVERSES', '', '', formatMontant(fiche.totalRetenuesDiverses), '', '', true, null);
        }
        
        // ===== NET A PAYER =====
        rowY += 2;
        doc.setFillColor(...bleuFonce);
        doc.rect(10, rowY, tableWidth, 10, 'F');
        doc.setTextColor(...blanc);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('NET A PAYER', 15, rowY + 7);
        doc.setFontSize(12);
        doc.text(formatMontant(fiche.net) + ' FCFA', 195, rowY + 7, { align: 'right' });
        
        rowY += 14;
        
        // Cadre latéral des bordures du tableau
        doc.setDrawColor(...grisMoyen);
        doc.rect(10, y, tableWidth, rowY - y - 4, 'S');
        
        // Lignes verticales
        doc.line(colX[1], y, colX[1], rowY - 4);
        doc.line(colX[2], y, colX[2], rowY - 4);
        doc.line(colX[3], y, colX[3], rowY - 4);
        doc.line(colX[4], y, colX[4], rowY - 4);
        doc.line(colX[5], y, colX[5], rowY - 4);
        
        // ========== TABLEAU RECAPITULATIF ==========
        y = rowY + 2;
        const recapCols = [10, 35, 60, 85, 110, 140, 165];
        
        doc.setFillColor(...grisClair);
        doc.rect(10, y, 190, 14, 'F');
        doc.setDrawColor(...grisMoyen);
        doc.rect(10, y, 190, 14, 'S');
        
        doc.setTextColor(...noir);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        
        // Ligne 1 - Titres
        doc.text('Heures', recapCols[0] + 2, y + 4);
        doc.text('Brut', recapCols[1] + 2, y + 4);
        doc.text('Plafond IPRES', recapCols[2] + 2, y + 4);
        doc.text('Net imposable', recapCols[3] + 2, y + 4);
        doc.text('Ch. patronales', recapCols[4] + 2, y + 4);
        doc.text('Cout Global', recapCols[5] + 2, y + 4);
        doc.text('Mode paiement', recapCols[6] + 2, y + 4);
        
        // Ligne 2 - Valeurs
        doc.setFont('helvetica', 'normal');
        doc.text(fiche.heuresTravaillees + 'h', recapCols[0] + 2, y + 10);
        doc.text(formatEntier(fiche.salaireBrut), recapCols[1] + 2, y + 10);
        doc.text(formatEntier(Math.min(fiche.salaireBrut, 630000)), recapCols[2] + 2, y + 10); // Plafond sécu Sénégal
        doc.text(formatEntier(fiche.salaireBrut - fiche.totalCotisationsSalariales), recapCols[3] + 2, y + 10);
        doc.text(formatEntier(fiche.totalCotisationsPatronales), recapCols[4] + 2, y + 10);
        doc.text(formatEntier(fiche.salaireBrut + fiche.totalCotisationsPatronales), recapCols[5] + 2, y + 10);
        doc.text(fiche.modePaiement || 'Virement', recapCols[6] + 2, y + 10);
        
        // ========== MENTIONS LÉGALES ==========
        y += 20;
        doc.setTextColor(...gris);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'italic');
        doc.text('Dans votre interet et pour faire valoir vos droits, conservez ce bulletin de paie sans limitation de duree.', 105, y, { align: 'center' });
        doc.text('Paiement effectue le ' + dateEmission + ' - Mode de paiement: ' + (fiche.modePaiement || 'Virement'), 105, y + 4, { align: 'center' });
        
        // ========== PIED DE PAGE ==========
        doc.setFillColor(...bleuFonce);
        doc.rect(0, 282, 210, 15, 'F');
        
        doc.setTextColor(...blanc);
        doc.setFontSize(6);
        doc.text('Bulletin de paie conforme au Code du Travail Senegalais - Cotisations: IPRES (retraite) - CSS (prestations familiales, AT) - IPM (maladie) - TRIMF', 105, 287, { align: 'center' });
        doc.text('KFS BTP IMMO - NINEA: ' + fiche.nineaEntreprise + ' - RCCM: ' + fiche.rccmEntreprise + ' - Dakar, Senegal', 105, 292, { align: 'center' });
        
        // Sauvegarder le PDF
        const filename = 'Bulletin_Paie_' + fiche.prenom + '_' + fiche.nom + '_' + fiche.mois.replace('-', '_') + '.pdf';
        doc.save(filename);
        
        showNotification('PDF genere', 'Bulletin de paie telecharge: ' + filename, 'success');
        
    } catch (error) {
        console.error('Erreur generation PDF:', error);
        showNotification('Erreur', 'Impossible de generer le PDF: ' + error.message, 'error');
    }
}

function enregistrerFicheDePaie() {
    const fiche = getFichePaieData();
    if (!fiche) return;
    
    // Sauvegarder dans localStorage
    const fiches = JSON.parse(localStorage.getItem('fichesPaie') || '[]');
    fiche.id = Date.now().toString();
    fiches.unshift(fiche);
    localStorage.setItem('fichesPaie', JSON.stringify(fiches));
    
    // 🔗 LIAISON FINANCES: Enregistrer le salaire net comme dépense
    if (fiche.net > 0) {
        autoAddTransaction({
            type: 'depense',
            montant: fiche.net,
            categorie: 'salaires',
            description: `Salaire net ${fiche.mois} - ${fiche.prenom} ${fiche.nom} (${fiche.matricule})`,
            reference: `PAIE_${fiche.matricule}_${fiche.mois.replace(/-/g, '_')}`,
            sourceModule: 'paie',
            date: new Date().toISOString().split('T')[0]
        });
        showNotification('💰 Finances mises à jour', `Salaire net de ${fiche.net.toLocaleString('fr-FR')} FCFA enregistré`, 'info');
    }
    
    // Enregistrer les cotisations patronales comme dépense séparée
    if (fiche.totalCotisationsPatronales > 0) {
        autoAddTransaction({
            type: 'depense',
            montant: fiche.totalCotisationsPatronales,
            categorie: 'charges_sociales',
            description: `Cotisations patronales ${fiche.mois} - ${fiche.prenom} ${fiche.nom} (IPRES, CSS, IPM, CFE)`,
            reference: `COTIS_${fiche.matricule}_${fiche.mois.replace(/-/g, '_')}`,
            sourceModule: 'paie',
            date: new Date().toISOString().split('T')[0]
        });
    }
    
    showNotification('Fiche enregistrée', `Fiche de paie de ${fiche.prenom} ${fiche.nom} enregistrée`, 'success');
    
    // Rafraîchir l'historique
    renderFichesPaieHistorique();
    
    // Afficher l'aperçu
    apercuFicheDePaie();
}

function renderFichesPaieHistorique() {
    const container = document.getElementById('fiches-paie-historique');
    if (!container) return;
    
    const fiches = JSON.parse(localStorage.getItem('fichesPaie') || '[]');
    
    if (fiches.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <span class="material-icons text-4xl mb-2">inbox</span>
                <p>Aucune fiche de paie enregistrée</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="text-left p-3 rounded-tl-lg">Employé</th>
                        <th class="text-left p-3">Période</th>
                        <th class="text-right p-3">Net</th>
                        <th class="text-center p-3 rounded-tr-lg">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${fiches.slice(0, 10).map(f => `
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-3">
                                <p class="font-medium">${f.prenom || ''} ${f.nom || ''}</p>
                                <p class="text-xs text-gray-500">${f.matricule || ''}</p>
                            </td>
                            <td class="p-3">${f.mois || '-'}</td>
                            <td class="p-3 text-right font-mono font-bold text-blue-600">${(f.net || 0).toLocaleString('fr-FR')} FCFA</td>
                            <td class="p-3 text-center">
                                <button onclick="regenererFichePDF('${f.id}')" class="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Télécharger PDF">
                                    <span class="material-icons text-sm">download</span>
                                </button>
                                <button onclick="supprimerFichePaie('${f.id}')" class="p-1 text-red-600 hover:bg-red-50 rounded" title="Supprimer">
                                    <span class="material-icons text-sm">delete</span>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Fonctions globales pour l'historique
window.regenererFichePDF = function(id) {
    const fiches = JSON.parse(localStorage.getItem('fichesPaie') || '[]');
    const fiche = fiches.find(f => f.id === id);
    if (!fiche) return;
    
    // Remplir le formulaire avec les données
    const select = document.getElementById('fiche-paie-employe');
    if (select) select.value = fiche.matricule;
    document.getElementById('fiche-paie-mois').value = fiche.mois;
    document.getElementById('fiche-paie-salaire').value = fiche.salaire;
    document.getElementById('fiche-paie-primes').value = fiche.primes;
    document.getElementById('fiche-paie-retenues').value = fiche.retenues;
    
    updateRecapFiche();
    genererFicheDePaiePDF();
};

window.supprimerFichePaie = function(id) {
    if (!confirm('Supprimer cette fiche de paie ?')) return;
    
    let fiches = JSON.parse(localStorage.getItem('fichesPaie') || '[]');
    fiches = fiches.filter(f => f.id !== id);
    localStorage.setItem('fichesPaie', JSON.stringify(fiches));
    
    renderFichesPaieHistorique();
    showNotification('Supprimée', 'Fiche de paie supprimée', 'info');
};

function genererFicheDePaie() {
    enregistrerFicheDePaie();
}

function renderFichePaieApercu(fiche) {
    apercuFicheDePaie();
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
        'warning': 'bg-blue-600',
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
// MODULE UNIFIÉ: FINANCES (Comptabilité + Bilans)
// ===================================================

// Variables globales pour les charts
let finChartEvolution = null;
let finChartDepenses = null;
let finChartComparaison = null;
let finChartTendance = null;
let finCurrentTab = 'overview';
let finCurrentPage = 1;
const finItemsPerPage = 10;

function initFinances() {
    // Initialisation des filtres
    const periodeSelect = document.getElementById('finance-periode');
    const anneeSelect = document.getElementById('finance-annee');
    const customDates = document.getElementById('finance-custom-dates');
    
    if (periodeSelect) {
        periodeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customDates?.classList.remove('hidden');
            } else {
                customDates?.classList.add('hidden');
            }
        });
    }
    
    // Filtres transactions
    document.getElementById('fin-filter-type')?.addEventListener('change', renderFinTransactions);
    document.getElementById('fin-filter-categorie')?.addEventListener('change', renderFinTransactions);
    document.getElementById('fin-filter-source')?.addEventListener('change', renderFinTransactions);
    document.getElementById('fin-search')?.addEventListener('input', debounce(renderFinTransactions, 300));
    
    // Définir l'année actuelle par défaut
    const currentYear = new Date().getFullYear();
    if (anneeSelect) anneeSelect.value = currentYear.toString();
    
    // Rendre le module
    refreshFinances();
}

// Fonction de rafraîchissement global
window.refreshFinances = function() {
    const transactions = getFilteredTransactions();
    
    updateFinKPIs(transactions);
    renderFinCharts(transactions);
    renderFinTransactions();
    renderFinRecentTransactions(transactions);
    renderFinTopCategories(transactions);
    renderFinHealthIndicators(transactions);
    renderFinAnalyseIA(transactions);
    renderFinBilanDetaille(transactions);
};

// Récupérer les transactions filtrées selon la période
function getFilteredTransactions() {
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    const periode = document.getElementById('finance-periode')?.value || 'annee';
    const annee = document.getElementById('finance-annee')?.value || new Date().getFullYear();
    
    const now = new Date();
    let dateDebut, dateFin;
    
    switch (periode) {
        case 'mois':
            dateDebut = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'trimestre':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            dateDebut = new Date(now.getFullYear(), currentQuarter * 3, 1);
            dateFin = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
            break;
        case 'semestre':
            const currentSemester = now.getMonth() < 6 ? 0 : 1;
            dateDebut = new Date(now.getFullYear(), currentSemester * 6, 1);
            dateFin = new Date(now.getFullYear(), (currentSemester + 1) * 6, 0);
            break;
        case 'annee':
            dateDebut = new Date(parseInt(annee), 0, 1);
            dateFin = new Date(parseInt(annee), 11, 31);
            break;
        case 'tout':
            return transactions;
        case 'custom':
            const debut = document.getElementById('finance-date-debut')?.value;
            const fin = document.getElementById('finance-date-fin')?.value;
            if (debut && fin) {
                dateDebut = new Date(debut);
                dateFin = new Date(fin);
            } else {
                return transactions;
            }
            break;
        default:
            return transactions;
    }
    
    return transactions.filter(t => {
        if (!t.date) return false;
        const tDate = new Date(t.date);
        return tDate >= dateDebut && tDate <= dateFin;
    });
}

// Mise à jour des KPIs
function updateFinKPIs(transactions) {
    const recettes = transactions.filter(t => t.type === 'recette');
    const depenses = transactions.filter(t => t.type === 'depense');
    
    const totalRecettes = recettes.reduce((sum, t) => sum + (t.montant || 0), 0);
    const totalDepenses = depenses.reduce((sum, t) => sum + (t.montant || 0), 0);
    const resultatNet = totalRecettes - totalDepenses;
    const marge = totalRecettes > 0 ? ((resultatNet / totalRecettes) * 100).toFixed(1) : 0;
    
    // Afficher les KPIs
    const elRecettes = document.getElementById('fin-total-recettes');
    const elDepenses = document.getElementById('fin-total-depenses');
    const elResultat = document.getElementById('fin-resultat-net');
    const elMarge = document.getElementById('fin-marge');
    const elNbTrans = document.getElementById('fin-nb-transactions');
    const elNbRec = document.getElementById('fin-nb-recettes');
    const elNbDep = document.getElementById('fin-nb-depenses');
    
    if (elRecettes) elRecettes.textContent = formatMontantDisplay(totalRecettes);
    if (elDepenses) elDepenses.textContent = formatMontantDisplay(totalDepenses);
    if (elResultat) {
        elResultat.textContent = formatMontantDisplay(resultatNet);
        elResultat.className = `text-2xl font-bold ${resultatNet >= 0 ? 'text-green-600' : 'text-red-600'}`;
    }
    if (elMarge) elMarge.textContent = marge + '%';
    if (elNbTrans) elNbTrans.textContent = transactions.length;
    if (elNbRec) elNbRec.textContent = recettes.length;
    if (elNbDep) elNbDep.textContent = depenses.length;
}

// Formater les montants pour l'affichage (avec séparateurs)
function formatMontantDisplay(montant) {
    return Math.abs(montant).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
}

// Gestion des onglets
window.showFinanceTab = function(tabName) {
    finCurrentTab = tabName;
    
    // Masquer tous les contenus
    document.querySelectorAll('.finance-tab-content').forEach(el => el.classList.add('hidden'));
    
    // Désactiver tous les onglets
    document.querySelectorAll('.finance-tab').forEach(el => el.classList.remove('active'));
    
    // Afficher le contenu actif
    const tabContent = document.getElementById(`finance-tab-${tabName}`);
    if (tabContent) tabContent.classList.remove('hidden');
    
    // Activer l'onglet
    const tabBtn = document.querySelector(`.finance-tab[data-tab="${tabName}"]`);
    if (tabBtn) tabBtn.classList.add('active');
    
    // Rafraîchir les graphiques si nécessaire
    if (tabName === 'overview' || tabName === 'analyse') {
        setTimeout(() => {
            const transactions = getFilteredTransactions();
            renderFinCharts(transactions);
        }, 100);
    }
};

// Rendu des graphiques
function renderFinCharts(transactions) {
    renderEvolutionChart(transactions);
    renderDepensesChart(transactions);
    renderComparaisonChart(transactions);
    renderTendanceChart(transactions);
}

function renderEvolutionChart(transactions) {
    const ctx = document.getElementById('fin-chart-evolution');
    if (!ctx) return;
    
    // Détruire l'ancien graphique
    if (finChartEvolution) {
        finChartEvolution.destroy();
    }
    
    // Données mensuelles
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const recettesParMois = Array(12).fill(0);
    const depensesParMois = Array(12).fill(0);
    
    transactions.forEach(t => {
        if (!t.date) return;
        const mois = new Date(t.date).getMonth();
        if (t.type === 'recette') {
            recettesParMois[mois] += t.montant || 0;
        } else {
            depensesParMois[mois] += t.montant || 0;
        }
    });
    
    finChartEvolution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: moisNoms,
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
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCompactNumber(value)
                    }
                }
            }
        }
    });
}

function renderDepensesChart(transactions) {
    const ctx = document.getElementById('fin-chart-depenses');
    if (!ctx) return;
    
    if (finChartDepenses) {
        finChartDepenses.destroy();
    }
    
    // Grouper par catégorie
    const depenses = transactions.filter(t => t.type === 'depense');
    const parCategorie = {};
    
    depenses.forEach(t => {
        const cat = t.categorie || 'Autre';
        parCategorie[cat] = (parCategorie[cat] || 0) + (t.montant || 0);
    });
    
    const labels = Object.keys(parCategorie);
    const data = Object.values(parCategorie);
    const colors = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
        '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#1f2937'
    ];
    
    finChartDepenses = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { boxWidth: 12, font: { size: 11 } }
                }
            }
        }
    });
}

function renderComparaisonChart(transactions) {
    const ctx = document.getElementById('fin-chart-comparaison');
    if (!ctx) return;
    
    if (finChartComparaison) {
        finChartComparaison.destroy();
    }
    
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const resultatParMois = Array(12).fill(0);
    
    transactions.forEach(t => {
        if (!t.date) return;
        const mois = new Date(t.date).getMonth();
        if (t.type === 'recette') {
            resultatParMois[mois] += t.montant || 0;
        } else {
            resultatParMois[mois] -= t.montant || 0;
        }
    });
    
    finChartComparaison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: moisNoms,
            datasets: [{
                label: 'Résultat mensuel',
                data: resultatParMois,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    ticks: { callback: value => formatCompactNumber(value) }
                }
            }
        }
    });
}

function renderTendanceChart(transactions) {
    const ctx = document.getElementById('fin-chart-tendance');
    if (!ctx) return;
    
    if (finChartTendance) {
        finChartTendance.destroy();
    }
    
    // Cumul progressif
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const cumulParMois = Array(12).fill(0);
    let cumul = 0;
    
    // D'abord calculer par mois
    const resultatParMois = Array(12).fill(0);
    transactions.forEach(t => {
        if (!t.date) return;
        const mois = new Date(t.date).getMonth();
        if (t.type === 'recette') {
            resultatParMois[mois] += t.montant || 0;
        } else {
            resultatParMois[mois] -= t.montant || 0;
        }
    });
    
    // Puis cumuler
    for (let i = 0; i < 12; i++) {
        cumul += resultatParMois[i];
        cumulParMois[i] = cumul;
    }
    
    finChartTendance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: moisNoms,
            datasets: [{
                label: 'Résultat cumulé',
                data: cumulParMois,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    ticks: { callback: value => formatCompactNumber(value) }
                }
            }
        }
    });
}

// Format compact pour les axes des graphiques
function formatCompactNumber(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value;
}

// Rendu des transactions
function renderFinTransactions() {
    const container = document.getElementById('fin-transactions-list');
    if (!container) return;
    
    let transactions = getFilteredTransactions();
    
    // Appliquer les filtres
    const filterType = document.getElementById('fin-filter-type')?.value || 'all';
    const filterCat = document.getElementById('fin-filter-categorie')?.value || 'all';
    const filterSource = document.getElementById('fin-filter-source')?.value || 'all';
    const searchTerm = document.getElementById('fin-search')?.value?.toLowerCase() || '';
    
    if (filterType !== 'all') {
        transactions = transactions.filter(t => t.type === filterType);
    }
    if (filterCat !== 'all') {
        transactions = transactions.filter(t => t.categorie === filterCat);
    }
    // Filtre par source (nouveau)
    if (filterSource !== 'all') {
        if (filterSource === 'manual') {
            transactions = transactions.filter(t => !t.autoGenerated);
        } else if (filterSource === 'auto') {
            transactions = transactions.filter(t => t.autoGenerated === true);
        } else {
            transactions = transactions.filter(t => t.sourceModule === filterSource);
        }
    }
    if (searchTerm) {
        transactions = transactions.filter(t => 
            (t.description || '').toLowerCase().includes(searchTerm) ||
            (t.categorie || '').toLowerCase().includes(searchTerm) ||
            (t.reference || '').toLowerCase().includes(searchTerm)
        );
    }
    
    // Trier par date décroissante
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Pagination
    const totalPages = Math.ceil(transactions.length / finItemsPerPage);
    const start = (finCurrentPage - 1) * finItemsPerPage;
    const paginatedTransactions = transactions.slice(start, start + finItemsPerPage);
    
    if (paginatedTransactions.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Aucune transaction trouvée</p>';
        document.getElementById('fin-pagination').innerHTML = '';
        return;
    }
    
    // Récupérer toutes les transactions pour l'index global
    const allTransactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    
    container.innerHTML = paginatedTransactions.map(t => {
        const globalIndex = allTransactions.findIndex(at => 
            at.date === t.date && at.montant === t.montant && at.description === t.description
        );
        const isRecette = t.type === 'recette';
        const dateStr = t.date ? new Date(t.date).toLocaleDateString('fr-FR') : 'N/A';
        const isAuto = t.autoGenerated === true;
        
        // Icônes par source module
        const sourceIcons = {
            'factures': 'receipt',
            'stocks': 'inventory',
            'projets': 'construction',
            'paie': 'badge',
            'employes': 'person'
        };
        const sourceIcon = sourceIcons[t.sourceModule] || '';
        
        return `
            <div class="transaction-item ${t.type} flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition ${isAuto ? 'border-l-4 border-l-blue-400' : ''}">
                <div class="flex items-center flex-1">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isRecette ? 'bg-green-100' : 'bg-red-100'}">
                        <span class="material-icons ${isRecette ? 'text-green-600' : 'text-red-600'}">
                            ${isRecette ? 'arrow_downward' : 'arrow_upward'}
                        </span>
                    </div>
                    <div class="flex-1">
                        <p class="font-semibold text-gray-800">
                            ${t.description || t.categorie}
                            ${isAuto ? `<span class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700" title="Transaction automatique depuis ${t.sourceModule}">
                                <span class="material-icons text-xs mr-0.5">${sourceIcon || 'sync'}</span>Auto
                            </span>` : ''}
                        </p>
                        <p class="text-sm text-gray-500">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(t.categorie)}">
                                ${t.categorie || 'Non classé'}
                            </span>
                            <span class="ml-2">${dateStr}</span>
                            ${t.reference ? `<span class="ml-2 text-gray-400">Réf: ${t.reference}</span>` : ''}
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-lg ${isRecette ? 'text-green-600' : 'text-red-600'}">
                        ${isRecette ? '+' : '-'}${formatMontantDisplay(t.montant)}
                    </span>
                    <div class="flex gap-1">
                        ${!isAuto ? `
                        <button onclick="editFinTransaction(${globalIndex})" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Modifier">
                            <span class="material-icons text-sm">edit</span>
                        </button>` : ''}
                        <button onclick="deleteFinTransaction(${globalIndex})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="${isAuto ? 'Supprimer (attention: transaction liée)' : 'Supprimer'}">
                            <span class="material-icons text-sm">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Pagination
    renderFinPagination(totalPages);
}

function getCategoryColor(cat) {
    const colors = {
        // Recettes
        'ventes': 'bg-green-100 text-green-800',
        'vente': 'bg-green-100 text-green-800',
        'acomptes': 'bg-emerald-100 text-emerald-800',
        'location': 'bg-purple-100 text-purple-800',
        'service': 'bg-cyan-100 text-cyan-800',
        // Dépenses
        'achats': 'bg-orange-100 text-yellow-800',
        'salaires': 'bg-red-100 text-red-800',
        'salaire': 'bg-red-100 text-red-800',
        'charges_sociales': 'bg-pink-100 text-pink-800',
        'chantier': 'bg-amber-100 text-amber-800',
        'materiel': 'bg-yellow-100 text-yellow-800',
        'transport': 'bg-teal-100 text-teal-800',
        'charges': 'bg-gray-100 text-gray-800',
        // Autres
        'autre': 'bg-slate-100 text-slate-800'
    };
    return colors[cat?.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

function renderFinPagination(totalPages) {
    const container = document.getElementById('fin-pagination');
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Bouton précédent
    html += `<button onclick="finChangePage(${finCurrentPage - 1})" 
        class="px-3 py-1 rounded-lg ${finCurrentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}"
        ${finCurrentPage === 1 ? 'disabled' : ''}>
        <span class="material-icons text-sm align-middle">chevron_left</span>
    </button>`;
    
    // Numéros de page
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= finCurrentPage - 1 && i <= finCurrentPage + 1)) {
            html += `<button onclick="finChangePage(${i})" 
                class="px-3 py-1 rounded-lg ${i === finCurrentPage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
                ${i}
            </button>`;
        } else if (i === finCurrentPage - 2 || i === finCurrentPage + 2) {
            html += '<span class="px-2">...</span>';
        }
    }
    
    // Bouton suivant
    html += `<button onclick="finChangePage(${finCurrentPage + 1})" 
        class="px-3 py-1 rounded-lg ${finCurrentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}"
        ${finCurrentPage === totalPages ? 'disabled' : ''}>
        <span class="material-icons text-sm align-middle">chevron_right</span>
    </button>`;
    
    container.innerHTML = html;
}

window.finChangePage = function(page) {
    finCurrentPage = page;
    renderFinTransactions();
};

// Transactions récentes (5 dernières)
function renderFinRecentTransactions(transactions) {
    const container = document.getElementById('fin-recent-transactions');
    if (!container) return;
    
    const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-4">Aucune transaction récente</p>';
        return;
    }
    
    container.innerHTML = recent.map(t => {
        const isRecette = t.type === 'recette';
        const dateStr = t.date ? new Date(t.date).toLocaleDateString('fr-FR') : 'N/A';
        
        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isRecette ? 'bg-green-100' : 'bg-red-100'}">
                        <span class="material-icons text-sm ${isRecette ? 'text-green-600' : 'text-red-600'}">
                            ${isRecette ? 'arrow_downward' : 'arrow_upward'}
                        </span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-800 text-sm">${t.description || t.categorie}</p>
                        <p class="text-xs text-gray-500">${dateStr}</p>
                    </div>
                </div>
                <span class="font-semibold ${isRecette ? 'text-green-600' : 'text-red-600'}">
                    ${isRecette ? '+' : '-'}${formatMontantDisplay(t.montant)}
                </span>
            </div>
        `;
    }).join('');
}

// Top 5 catégories
function renderFinTopCategories(transactions) {
    const containerDepenses = document.getElementById('fin-top-depenses');
    const containerRecettes = document.getElementById('fin-top-recettes');
    
    // Top dépenses
    if (containerDepenses) {
        const depenses = transactions.filter(t => t.type === 'depense');
        const parCategorie = {};
        depenses.forEach(t => {
            const cat = t.categorie || 'Autre';
            parCategorie[cat] = (parCategorie[cat] || 0) + (t.montant || 0);
        });
        
        const totalDepenses = Object.values(parCategorie).reduce((a, b) => a + b, 0);
        const sorted = Object.entries(parCategorie).sort((a, b) => b[1] - a[1]).slice(0, 5);
        
        containerDepenses.innerHTML = sorted.map(([cat, montant]) => {
            const pct = totalDepenses > 0 ? ((montant / totalDepenses) * 100).toFixed(1) : 0;
            return `
                <div class="flex items-center justify-between">
                    <div class="flex-1 mr-4">
                        <div class="flex justify-between mb-1">
                            <span class="text-sm font-medium text-gray-700">${cat}</span>
                            <span class="text-sm text-gray-500">${pct}%</span>
                        </div>
                        <div class="finance-progress-bar">
                            <div class="finance-progress-fill bg-red-500" style="width: ${pct}%"></div>
                        </div>
                    </div>
                    <span class="text-sm font-semibold text-red-600">${formatMontantDisplay(montant)}</span>
                </div>
            `;
        }).join('') || '<p class="text-gray-400 text-center">Aucune dépense</p>';
    }
    
    // Top recettes
    if (containerRecettes) {
        const recettes = transactions.filter(t => t.type === 'recette');
        const parCategorie = {};
        recettes.forEach(t => {
            const cat = t.categorie || 'Autre';
            parCategorie[cat] = (parCategorie[cat] || 0) + (t.montant || 0);
        });
        
        const totalRecettes = Object.values(parCategorie).reduce((a, b) => a + b, 0);
        const sorted = Object.entries(parCategorie).sort((a, b) => b[1] - a[1]).slice(0, 5);
        
        containerRecettes.innerHTML = sorted.map(([cat, montant]) => {
            const pct = totalRecettes > 0 ? ((montant / totalRecettes) * 100).toFixed(1) : 0;
            return `
                <div class="flex items-center justify-between">
                    <div class="flex-1 mr-4">
                        <div class="flex justify-between mb-1">
                            <span class="text-sm font-medium text-gray-700">${cat}</span>
                            <span class="text-sm text-gray-500">${pct}%</span>
                        </div>
                        <div class="finance-progress-bar">
                            <div class="finance-progress-fill bg-green-500" style="width: ${pct}%"></div>
                        </div>
                    </div>
                    <span class="text-sm font-semibold text-green-600">${formatMontantDisplay(montant)}</span>
                </div>
            `;
        }).join('') || '<p class="text-gray-400 text-center">Aucune recette</p>';
    }
}

// Indicateurs de santé financière
function renderFinHealthIndicators(transactions) {
    const recettes = transactions.filter(t => t.type === 'recette');
    const depenses = transactions.filter(t => t.type === 'depense');
    
    const totalRecettes = recettes.reduce((sum, t) => sum + (t.montant || 0), 0);
    const totalDepenses = depenses.reduce((sum, t) => sum + (t.montant || 0), 0);
    const resultat = totalRecettes - totalDepenses;
    
    // Ratio de rentabilité
    const ratioRentabilite = totalRecettes > 0 ? ((resultat / totalRecettes) * 100).toFixed(1) : 0;
    const elRatio = document.getElementById('fin-ratio-rentabilite');
    if (elRatio) {
        elRatio.textContent = ratioRentabilite + '%';
        elRatio.className = `text-2xl font-bold ${parseFloat(ratioRentabilite) >= 0 ? 'text-green-600' : 'text-red-600'}`;
    }
    
    // Taux de croissance (comparaison avec période précédente - simplifié)
    const elCroissance = document.getElementById('fin-taux-croissance');
    if (elCroissance) {
        // Pour simplifier, on indique N/A ou on calcule basé sur les données disponibles
        elCroissance.textContent = 'N/A';
        elCroissance.className = 'text-2xl font-bold text-gray-600';
    }
    
    // Moyenne mensuelle
    const moisActifs = new Set(transactions.map(t => t.date?.substring(0, 7))).size || 1;
    const moyenneMensuelle = resultat / moisActifs;
    const elMoyenne = document.getElementById('fin-moyenne-mensuelle');
    if (elMoyenne) {
        elMoyenne.textContent = formatMontantDisplay(moyenneMensuelle);
        elMoyenne.className = `text-lg font-bold ${moyenneMensuelle >= 0 ? 'text-green-600' : 'text-red-600'}`;
    }
    
    // Prévision fin d'année (extrapolation simple)
    const moisRestants = 12 - new Date().getMonth();
    const prevision = resultat + (moyenneMensuelle * moisRestants);
    const elPrevision = document.getElementById('fin-prevision');
    if (elPrevision) {
        elPrevision.textContent = formatMontantDisplay(prevision);
        elPrevision.className = `text-lg font-bold ${prevision >= 0 ? 'text-green-600' : 'text-red-600'}`;
    }
}

// Analyse IA (recommandations basiques)
function renderFinAnalyseIA(transactions) {
    const container = document.getElementById('fin-ia-analyse');
    if (!container) return;
    
    const recettes = transactions.filter(t => t.type === 'recette');
    const depenses = transactions.filter(t => t.type === 'depense');
    const totalRecettes = recettes.reduce((sum, t) => sum + (t.montant || 0), 0);
    const totalDepenses = depenses.reduce((sum, t) => sum + (t.montant || 0), 0);
    const marge = totalRecettes > 0 ? ((totalRecettes - totalDepenses) / totalRecettes) * 100 : 0;
    
    // Catégorie la plus dépensière
    const depensesParCat = {};
    depenses.forEach(t => {
        const cat = t.categorie || 'Autre';
        depensesParCat[cat] = (depensesParCat[cat] || 0) + (t.montant || 0);
    });
    const topDepense = Object.entries(depensesParCat).sort((a, b) => b[1] - a[1])[0];
    
    // Générer les recommandations
    const recommendations = [];
    
    // Analyse de la marge
    if (marge < 10) {
        recommendations.push({
            icon: 'warning',
            color: 'red',
            title: 'Marge faible',
            text: 'Votre marge est inférieure à 10%. Envisagez de réduire les coûts ou d\'augmenter les prix.'
        });
    } else if (marge > 30) {
        recommendations.push({
            icon: 'thumb_up',
            color: 'green',
            title: 'Excellente rentabilité',
            text: 'Votre marge est supérieure à 30%. Continuez ainsi et pensez à réinvestir.'
        });
    } else {
        recommendations.push({
            icon: 'info',
            color: 'blue',
            title: 'Marge correcte',
            text: 'Votre marge est dans la moyenne. Surveillez vos dépenses pour l\'améliorer.'
        });
    }
    
    // Analyse des dépenses
    if (topDepense) {
        const pctTopDepense = totalDepenses > 0 ? (topDepense[1] / totalDepenses) * 100 : 0;
        if (pctTopDepense > 40) {
            recommendations.push({
                icon: 'pie_chart',
                color: 'orange',
                title: `${topDepense[0]} domine`,
                text: `Cette catégorie représente ${pctTopDepense.toFixed(0)}% de vos dépenses. Cherchez à diversifier.`
            });
        } else {
            recommendations.push({
                icon: 'check_circle',
                color: 'green',
                title: 'Dépenses équilibrées',
                text: 'Vos dépenses sont bien réparties entre les catégories.'
            });
        }
    }
    
    // Conseil de trésorerie
    if (totalRecettes > totalDepenses * 1.5) {
        recommendations.push({
            icon: 'savings',
            color: 'green',
            title: 'Trésorerie saine',
            text: 'Vous avez une bonne trésorerie. Pensez à investir ou épargner.'
        });
    } else if (totalRecettes < totalDepenses) {
        recommendations.push({
            icon: 'error',
            color: 'red',
            title: 'Déficit détecté',
            text: 'Vos dépenses dépassent vos recettes. Agissez rapidement pour rééquilibrer.'
        });
    }
    
    container.innerHTML = recommendations.map(r => `
        <div class="bg-white rounded-xl p-4 border border-${r.color}-200 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
                <span class="material-icons text-${r.color}-500">${r.icon}</span>
                <h5 class="font-semibold text-gray-800">${r.title}</h5>
            </div>
            <p class="text-sm text-gray-600">${r.text}</p>
        </div>
    `).join('');
}

// Bilan détaillé
function renderFinBilanDetaille(transactions) {
    renderCompteResultat(transactions);
    renderBilanMensuel(transactions);
}

function renderCompteResultat(transactions) {
    const tbody = document.getElementById('fin-compte-resultat');
    if (!tbody) return;
    
    const recettes = transactions.filter(t => t.type === 'recette');
    const depenses = transactions.filter(t => t.type === 'depense');
    
    const totalRecettes = recettes.reduce((sum, t) => sum + (t.montant || 0), 0);
    const totalDepenses = depenses.reduce((sum, t) => sum + (t.montant || 0), 0);
    const resultat = totalRecettes - totalDepenses;
    
    // Grouper par catégorie
    const recettesParCat = {};
    recettes.forEach(t => {
        const cat = t.categorie || 'Autre';
        recettesParCat[cat] = (recettesParCat[cat] || 0) + (t.montant || 0);
    });
    
    const depensesParCat = {};
    depenses.forEach(t => {
        const cat = t.categorie || 'Autre';
        depensesParCat[cat] = (depensesParCat[cat] || 0) + (t.montant || 0);
    });
    
    let html = '';
    
    // Section Recettes
    html += `<tr class="bg-green-50"><td colspan="3" class="p-3 font-bold text-green-800">PRODUITS D'EXPLOITATION</td></tr>`;
    Object.entries(recettesParCat).sort((a, b) => b[1] - a[1]).forEach(([cat, montant]) => {
        const pct = totalRecettes > 0 ? ((montant / totalRecettes) * 100).toFixed(1) : 0;
        html += `
            <tr class="border-b border-gray-100">
                <td class="p-3 pl-6 text-gray-700">${cat}</td>
                <td class="p-3 text-right text-green-600 font-medium">${formatMontantDisplay(montant)}</td>
                <td class="p-3 text-right text-gray-500">${pct}%</td>
            </tr>
        `;
    });
    html += `
        <tr class="bg-green-100 font-bold">
            <td class="p-3">Total Produits</td>
            <td class="p-3 text-right text-green-700">${formatMontantDisplay(totalRecettes)}</td>
            <td class="p-3 text-right">100%</td>
        </tr>
    `;
    
    // Section Dépenses
    html += `<tr class="bg-red-50"><td colspan="3" class="p-3 font-bold text-red-800">CHARGES D'EXPLOITATION</td></tr>`;
    Object.entries(depensesParCat).sort((a, b) => b[1] - a[1]).forEach(([cat, montant]) => {
        const pct = totalDepenses > 0 ? ((montant / totalDepenses) * 100).toFixed(1) : 0;
        html += `
            <tr class="border-b border-gray-100">
                <td class="p-3 pl-6 text-gray-700">${cat}</td>
                <td class="p-3 text-right text-red-600 font-medium">${formatMontantDisplay(montant)}</td>
                <td class="p-3 text-right text-gray-500">${pct}%</td>
            </tr>
        `;
    });
    html += `
        <tr class="bg-red-100 font-bold">
            <td class="p-3">Total Charges</td>
            <td class="p-3 text-right text-red-700">${formatMontantDisplay(totalDepenses)}</td>
            <td class="p-3 text-right">100%</td>
        </tr>
    `;
    
    // Résultat
    html += `
        <tr class="bg-blue-100 font-bold text-lg">
            <td class="p-4">RÉSULTAT NET</td>
            <td class="p-4 text-right ${resultat >= 0 ? 'text-green-700' : 'text-red-700'}">${formatMontantDisplay(resultat)}</td>
            <td class="p-4 text-right">${totalRecettes > 0 ? ((resultat / totalRecettes) * 100).toFixed(1) : 0}%</td>
        </tr>
    `;
    
    tbody.innerHTML = html;
}

function renderBilanMensuel(transactions) {
    const tbody = document.getElementById('fin-bilan-mensuel');
    const tfoot = document.getElementById('fin-bilan-total');
    if (!tbody) return;
    
    const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    // Calculer par mois
    const recettesParMois = Array(12).fill(0);
    const depensesParMois = Array(12).fill(0);
    
    transactions.forEach(t => {
        if (!t.date) return;
        const mois = new Date(t.date).getMonth();
        if (t.type === 'recette') {
            recettesParMois[mois] += t.montant || 0;
        } else {
            depensesParMois[mois] += t.montant || 0;
        }
    });
    
    let cumul = 0;
    let totalRecettes = 0;
    let totalDepenses = 0;
    
    let html = '';
    for (let i = 0; i < 12; i++) {
        const rec = recettesParMois[i];
        const dep = depensesParMois[i];
        const res = rec - dep;
        cumul += res;
        totalRecettes += rec;
        totalDepenses += dep;
        
        // Ne montrer que les mois avec des données
        if (rec > 0 || dep > 0) {
            html += `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="p-3 font-medium text-gray-700">${moisNoms[i]}</td>
                    <td class="p-3 text-right text-green-600">${formatMontantDisplay(rec)}</td>
                    <td class="p-3 text-right text-red-600">${formatMontantDisplay(dep)}</td>
                    <td class="p-3 text-right font-medium ${res >= 0 ? 'text-green-600' : 'text-red-600'}">${formatMontantDisplay(res)}</td>
                    <td class="p-3 text-right ${cumul >= 0 ? 'text-blue-600' : 'text-red-600'}">${formatMontantDisplay(cumul)}</td>
                </tr>
            `;
        }
    }
    
    tbody.innerHTML = html || '<tr><td colspan="5" class="p-4 text-center text-gray-400">Aucune donnée pour cette période</td></tr>';
    
    // Total
    if (tfoot) {
        const totalResultat = totalRecettes - totalDepenses;
        tfoot.innerHTML = `
            <tr>
                <td class="p-3">TOTAL ANNÉE</td>
                <td class="p-3 text-right text-green-700">${formatMontantDisplay(totalRecettes)}</td>
                <td class="p-3 text-right text-red-700">${formatMontantDisplay(totalDepenses)}</td>
                <td class="p-3 text-right ${totalResultat >= 0 ? 'text-green-700' : 'text-red-700'}">${formatMontantDisplay(totalResultat)}</td>
                <td class="p-3 text-right ${cumul >= 0 ? 'text-blue-700' : 'text-red-700'}">${formatMontantDisplay(cumul)}</td>
            </tr>
        `;
    }
}

// Édition et suppression de transactions
window.editFinTransaction = function(index) {
    const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
    const t = transactions[index];
    if (!t) return;
    
    // Ouvrir la modale de transaction avec les données
    openTransactionModal(t.type);
    
    setTimeout(() => {
        document.getElementById('compta-edit-index').value = index;
        document.getElementById('compta-type').value = t.type;
        document.getElementById('compta-categorie').value = t.categorie || '';
        document.getElementById('compta-montant').value = t.montant;
        document.getElementById('compta-description').value = t.description || '';
        document.getElementById('compta-date').value = t.date;
    }, 100);
};

window.deleteFinTransaction = function(index) {
    if (confirm('Supprimer cette transaction ?')) {
        const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
        transactions.splice(index, 1);
        localStorage.setItem('comptabilite', JSON.stringify(transactions));
        refreshFinances();
        showNotification('Transaction supprimée', 'La transaction a été supprimée', 'warning');
    }
};

// Export PDF
window.exportFinancesPDF = function() {
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
        showNotification('Erreur', 'Bibliothèque PDF non chargée', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const transactions = getFilteredTransactions();
    const recettes = transactions.filter(t => t.type === 'recette');
    const depenses = transactions.filter(t => t.type === 'depense');
    const totalRecettes = recettes.reduce((sum, t) => sum + (t.montant || 0), 0);
    const totalDepenses = depenses.reduce((sum, t) => sum + (t.montant || 0), 0);
    const resultat = totalRecettes - totalDepenses;
    
    const annee = document.getElementById('finance-annee')?.value || new Date().getFullYear();
    
    // En-tête
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT FINANCIER', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`KFS BTP IMMO - Annee ${annee}`, 105, 30, { align: 'center' });
    
    // Date de génération
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 105, 50, { align: 'center' });
    
    // Résumé
    let y = 65;
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUME FINANCIER', 20, y);
    
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(34, 197, 94);
    doc.text(`Total Recettes: ${formatMontant(totalRecettes)} FCFA`, 20, y);
    
    y += 8;
    doc.setTextColor(239, 68, 68);
    doc.text(`Total Depenses: ${formatMontant(totalDepenses)} FCFA`, 20, y);
    
    y += 8;
    doc.setTextColor(resultat >= 0 ? 34 : 239, resultat >= 0 ? 197 : 68, resultat >= 0 ? 94 : 68);
    doc.setFont('helvetica', 'bold');
    doc.text(`Resultat Net: ${formatMontant(resultat)} FCFA`, 20, y);
    
    // Marge
    const marge = totalRecettes > 0 ? ((resultat / totalRecettes) * 100).toFixed(1) : 0;
    y += 8;
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Marge: ${marge}%`, 20, y);
    
    // Liste des transactions (dernières 20)
    y += 20;
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DERNIERES TRANSACTIONS', 20, y);
    
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    
    y += 5;
    const sortedTrans = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    sortedTrans.forEach(t => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        const isRecette = t.type === 'recette';
        const dateStr = t.date ? new Date(t.date).toLocaleDateString('fr-FR') : 'N/A';
        
        doc.setTextColor(100, 100, 100);
        doc.text(dateStr, 20, y);
        
        doc.setTextColor(60, 60, 60);
        doc.text((t.description || t.categorie || '').substring(0, 40), 45, y);
        
        doc.setTextColor(isRecette ? 34 : 239, isRecette ? 197 : 68, isRecette ? 94 : 68);
        doc.text(`${isRecette ? '+' : '-'}${formatMontant(t.montant)} FCFA`, 150, y, { align: 'right' });
        
        y += 6;
    });
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
        doc.text('KFS BTP IMMO - Document confidentiel', 105, 295, { align: 'center' });
    }
    
    doc.save(`rapport-financier-${annee}.pdf`);
    showNotification('PDF exporté', 'Le rapport financier a été téléchargé', 'success');
};

// Export Excel (CSV)
window.exportFinancesExcel = function() {
    const transactions = getFilteredTransactions();
    
    // En-têtes
    let csv = 'Date,Type,Categorie,Description,Montant\n';
    
    // Données
    transactions.forEach(t => {
        const date = t.date || '';
        const type = t.type === 'recette' ? 'Recette' : 'Depense';
        const categorie = (t.categorie || '').replace(/,/g, ';');
        const description = (t.description || '').replace(/,/g, ';');
        const montant = t.montant || 0;
        
        csv += `${date},${type},${categorie},${description},${montant}\n`;
    });
    
    // Télécharger
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('Excel exporté', 'Le fichier CSV a été téléchargé', 'success');
};

// Fonction debounce pour la recherche
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===================================================
// FONCTION UTILITAIRE: LIAISON AUTOMATIQUE FINANCES
// ===================================================
// Cette fonction permet d'ajouter automatiquement des transactions
// depuis n'importe quel module vers le module Finances unifié

/**
 * Ajoute automatiquement une transaction au module Finances
 * @param {Object} options - Options de la transaction
 * @param {string} options.type - 'recette' ou 'depense'
 * @param {number} options.montant - Montant de la transaction
 * @param {string} options.categorie - Catégorie (salaires, achats, ventes, etc.)
 * @param {string} options.description - Description détaillée
 * @param {string} options.reference - Référence (numéro facture, ID, etc.)
 * @param {string} options.sourceModule - Module source (factures, stocks, projets, paie)
 * @param {string} [options.date] - Date de la transaction (défaut: aujourd'hui)
 * @returns {boolean} - Succès de l'opération
 */
window.autoAddTransaction = function(options) {
    try {
        const {
            type,
            montant,
            categorie,
            description,
            reference = '',
            sourceModule = '',
            date = new Date().toISOString().split('T')[0]
        } = options;

        // Validation
        if (!type || !['recette', 'depense'].includes(type)) {
            console.error('[AutoTransaction] Type invalide:', type);
            return false;
        }
        if (!montant || montant <= 0) {
            console.error('[AutoTransaction] Montant invalide:', montant);
            return false;
        }
        if (!categorie) {
            console.error('[AutoTransaction] Catégorie requise');
            return false;
        }

        // Vérifier si une transaction similaire existe déjà (éviter les doublons)
        const transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
        const existeDeja = transactions.some(t => 
            t.reference === reference && 
            reference !== '' &&
            t.sourceModule === sourceModule &&
            t.montant === montant
        );

        if (existeDeja) {
            console.log('[AutoTransaction] Transaction déjà existante, ignorée:', reference);
            return false;
        }

        // Créer la nouvelle transaction
        const newTransaction = {
            id: 'auto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: type,
            montant: parseFloat(montant),
            categorie: categorie,
            description: description || `Transaction automatique - ${sourceModule}`,
            reference: reference,
            sourceModule: sourceModule,
            date: date,
            createdAt: new Date().toISOString(),
            autoGenerated: true
        };

        // Ajouter au début de la liste
        transactions.unshift(newTransaction);
        localStorage.setItem('comptabilite', JSON.stringify(transactions));

        // Log pour suivi
        console.log(`[AutoTransaction] ${type.toUpperCase()} ajoutée:`, {
            montant: montant,
            categorie: categorie,
            source: sourceModule,
            ref: reference
        });

        // Rafraîchir le module Finances si disponible
        if (typeof refreshFinances === 'function') {
            setTimeout(refreshFinances, 100);
        }

        return true;
    } catch (error) {
        console.error('[AutoTransaction] Erreur:', error);
        return false;
    }
};

/**
 * Supprime une transaction automatique par sa référence
 * @param {string} reference - Référence de la transaction
 * @param {string} sourceModule - Module source
 */
window.autoRemoveTransaction = function(reference, sourceModule) {
    try {
        let transactions = JSON.parse(localStorage.getItem('comptabilite') || '[]');
        const initialLength = transactions.length;
        
        transactions = transactions.filter(t => 
            !(t.reference === reference && t.sourceModule === sourceModule && t.autoGenerated)
        );

        if (transactions.length < initialLength) {
            localStorage.setItem('comptabilite', JSON.stringify(transactions));
            console.log('[AutoTransaction] Transaction supprimée:', reference);
            
            if (typeof refreshFinances === 'function') {
                setTimeout(refreshFinances, 100);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('[AutoTransaction] Erreur suppression:', error);
        return false;
    }
};

// ===================================================
// MODULE: COMPTABILITÉ (Ancien - conservé pour compatibilité)
// ===================================================
function initComptabilite() {
    // Redirigé vers initFinances - conservé pour compatibilité
    // renderComptabilite();
    // updateComptaDashboard();
    
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
            showNotification('Transaction ajoutée', `${transaction.type === 'recette' ? 'Recette' : 'Dépense'} enregistrée`, 'success');
        }
        
        localStorage.setItem('comptabilite', JSON.stringify(transactions));
        form.reset();
        document.getElementById('compta-edit-index').value = '';
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        if (cancelBtn) cancelBtn.classList.add('hidden');
        
        // Fermer la modale automatiquement
        const modal = document.getElementById('transaction-modal');
        if (modal) modal.classList.add('hidden');
        
        // Rafraîchir le module Finances unifié
        if (typeof refreshFinances === 'function') {
            refreshFinances();
        }
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
                    <button onclick="changeFactureStatus(${globalIndex})" class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-blue-200">
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
    const oldStatus = f.status;
    
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
        
        // 🔗 LIAISON FINANCES: Si facture passe à "payée", créer une recette
        if (f.type === 'facture' && newStatus === 'payee' && oldStatus !== 'payee') {
            autoAddTransaction({
                type: 'recette',
                montant: f.totalTTC,
                categorie: 'ventes',
                description: `Paiement facture ${f.numero} - Client: ${f.client}`,
                reference: f.numero,
                sourceModule: 'factures',
                date: new Date().toISOString().split('T')[0]
            });
            showNotification('💰 Finances mises à jour', `Recette de ${f.totalTTC.toLocaleString('fr-FR')} FCFA ajoutée`, 'success');
        }
        
        // 🔗 LIAISON FINANCES: Si facture annulée et était payée, supprimer la recette
        if (f.type === 'facture' && newStatus === 'annulee' && oldStatus === 'payee') {
            autoRemoveTransaction(f.numero, 'factures');
            showNotification('💰 Finances mises à jour', `Recette de ${f.totalTTC.toLocaleString('fr-FR')} FCFA annulée`, 'warning');
        }
        
        // 🔗 LIAISON FINANCES: Si devis accepté, créer un acompte (30%)
        if (f.type === 'devis' && newStatus === 'accepte' && oldStatus !== 'accepte') {
            const acompte = Math.round(f.totalTTC * 0.3);
            autoAddTransaction({
                type: 'recette',
                montant: acompte,
                categorie: 'acomptes',
                description: `Acompte devis ${f.numero} (30%) - Client: ${f.client}`,
                reference: f.numero + '_acompte',
                sourceModule: 'factures',
                date: new Date().toISOString().split('T')[0]
            });
            showNotification('💰 Finances mises à jour', `Acompte de ${acompte.toLocaleString('fr-FR')} FCFA enregistré`, 'success');
        }
        
        renderFactures();
        showNotification('Statut modifié', `${f.numero} → ${statusLabels[newStatus]}`, 'success');
    }
};

window.deleteFacture = function(index) {
    if (confirm('Supprimer cette facture/devis ?\n\n⚠️ Les transactions financières associées seront également supprimées.')) {
        const factures = JSON.parse(localStorage.getItem('factures') || '[]');
        const f = factures[index];
        
        // 🔗 LIAISON FINANCES: Supprimer les transactions associées
        if (f.status === 'payee') {
            autoRemoveTransaction(f.numero, 'factures');
        }
        if (f.type === 'devis' && f.status === 'accepte') {
            autoRemoveTransaction(f.numero + '_acompte', 'factures');
        }
        
        factures.splice(index, 1);
        localStorage.setItem('factures', JSON.stringify(factures));
        renderFactures();
        showNotification('Supprimé', `${f.numero} a été supprimé (avec transactions)`, 'warning');
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
        
        // Fermer la modale automatiquement
        const modal = document.getElementById('client-modal');
        if (modal) modal.classList.add('hidden');
        
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
            
            // 🔗 LIAISON FINANCES: Enregistrer l'acompte reçu comme recette
            if (projet.acompte > 0) {
                autoAddTransaction({
                    type: 'recette',
                    montant: projet.acompte,
                    categorie: 'acomptes',
                    description: `Acompte projet ${projet.nom} - Client: ${projet.client || 'Non spécifié'}`,
                    reference: `${projet.reference}_acompte_init`,
                    sourceModule: 'projets',
                    date: new Date().toISOString().split('T')[0]
                });
            }
            
            // 🔗 LIAISON FINANCES: Enregistrer les dépenses initiales
            if (projet.depenses > 0) {
                autoAddTransaction({
                    type: 'depense',
                    montant: projet.depenses,
                    categorie: 'chantier',
                    description: `Dépenses initiales projet ${projet.nom}`,
                    reference: `${projet.reference}_dep_init`,
                    sourceModule: 'projets',
                    date: new Date().toISOString().split('T')[0]
                });
            }
        }
        
        localStorage.setItem('projets', JSON.stringify(projets));
        form.reset();
        document.getElementById('projet-edit-index').value = '';
        if (dateDebut) dateDebut.value = new Date().toISOString().split('T')[0];
        if (avancementSlider) avancementSlider.value = 0;
        if (avancementValue) avancementValue.textContent = '0%';
        
        // Fermer la modale automatiquement
        const modal = document.getElementById('projet-modal');
        if (modal) modal.classList.add('hidden');
        
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
                            <div class="h-2 rounded-full ${depassement ? 'bg-red-500' : progression > 80 ? 'bg-blue-600' : 'bg-blue-500'}" 
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
                    <button onclick="viewProjet(${globalIndex})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200" title="Voir détails">
                        <span class="material-icons text-sm align-middle">visibility</span> Détails
                    </button>
                    <button onclick="editProjet(${globalIndex})" class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-blue-200" title="Modifier">
                        <span class="material-icons text-sm align-middle">edit</span>
                    </button>
                    <button onclick="recevoirAcompteProjet(${globalIndex})" class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200" title="Recevoir acompte">
                        <span class="material-icons text-sm align-middle">account_balance_wallet</span>
                    </button>
                    <button onclick="addProjetDepense(${globalIndex})" class="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200" title="Ajouter dépense">
                        <span class="material-icons text-sm align-middle">payments</span>
                    </button>
                    <button onclick="deleteProjet(${globalIndex})" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200" title="Supprimer">
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
    if (!montant || isNaN(montant) || parseFloat(montant) <= 0) return;
    
    const description = prompt('Description de la dépense:') || 'Dépense projet';
    
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    projets[index].depenses = (projets[index].depenses || 0) + parseFloat(montant);
    projets[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem('projets', JSON.stringify(projets));
    
    // 🔗 LIAISON FINANCES: Créer une dépense via la fonction utilitaire
    autoAddTransaction({
        type: 'depense',
        montant: parseFloat(montant),
        categorie: 'chantier',
        description: `Projet ${projets[index].nom} - ${description}`,
        reference: `${projets[index].reference}_dep_${Date.now()}`,
        sourceModule: 'projets',
        date: new Date().toISOString().split('T')[0]
    });
    
    renderProjets();
    showNotification('💰 Dépense ajoutée', `${parseFloat(montant).toLocaleString('fr-FR')} FCFA enregistrés en dépense chantier`, 'success');
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
            
            <div class="mt-6 grid grid-cols-2 gap-2">
                <button onclick="recevoirAcompteProjet(${index}); this.closest('.fixed').remove();" 
                    class="py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition">
                    <span class="material-icons align-middle mr-1">account_balance_wallet</span> Recevoir acompte
                </button>
                <button onclick="addProjetDepense(${index}); this.closest('.fixed').remove();" 
                    class="py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition">
                    <span class="material-icons align-middle mr-1">payments</span> Ajouter dépense
                </button>
                <button onclick="finaliserPaiementProjet(${index}); this.closest('.fixed').remove();" 
                    class="py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition">
                    <span class="material-icons align-middle mr-1">check_circle</span> Paiement final
                </button>
                <button onclick="editProjet(${index}); this.closest('.fixed').remove();" 
                    class="py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                    <span class="material-icons align-middle mr-1">edit</span> Modifier
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// Fonction pour recevoir un acompte sur un projet
window.recevoirAcompteProjet = function(index) {
    const montant = prompt('Montant de l\'acompte reçu (FCFA):');
    if (!montant || isNaN(montant) || parseFloat(montant) <= 0) return;
    
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    const p = projets[index];
    
    projets[index].acompte = (projets[index].acompte || 0) + parseFloat(montant);
    projets[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem('projets', JSON.stringify(projets));
    
    // 🔗 LIAISON FINANCES: Créer une recette pour l'acompte
    autoAddTransaction({
        type: 'recette',
        montant: parseFloat(montant),
        categorie: 'acomptes',
        description: `Acompte projet ${p.nom} - Client: ${p.client || 'Non spécifié'}`,
        reference: `${p.reference}_acompte_${Date.now()}`,
        sourceModule: 'projets',
        date: new Date().toISOString().split('T')[0]
    });
    
    renderProjets();
    updateProjetStats();
    showNotification('💰 Acompte reçu', `${parseFloat(montant).toLocaleString('fr-FR')} FCFA enregistrés`, 'success');
};

// Fonction pour finaliser le paiement d'un projet terminé
window.finaliserPaiementProjet = function(index) {
    const projets = JSON.parse(localStorage.getItem('projets') || '[]');
    const p = projets[index];
    
    const resteAPayer = (p.budget || 0) - (p.acompte || 0);
    
    if (resteAPayer <= 0) {
        showNotification('Info', 'Le projet est déjà entièrement payé', 'info');
        return;
    }
    
    const montant = prompt(`Montant du paiement final (reste à payer: ${resteAPayer.toLocaleString('fr-FR')} FCFA):`, resteAPayer);
    if (!montant || isNaN(montant) || parseFloat(montant) <= 0) return;
    
    projets[index].acompte = (projets[index].acompte || 0) + parseFloat(montant);
    projets[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem('projets', JSON.stringify(projets));
    
    // 🔗 LIAISON FINANCES: Créer une recette pour le paiement final
    autoAddTransaction({
        type: 'recette',
        montant: parseFloat(montant),
        categorie: 'ventes',
        description: `Paiement final projet ${p.nom} - Client: ${p.client || 'Non spécifié'}`,
        reference: `${p.reference}_final_${Date.now()}`,
        sourceModule: 'projets',
        date: new Date().toISOString().split('T')[0]
    });
    
    renderProjets();
    updateProjetStats();
    showNotification('💰 Paiement enregistré', `${parseFloat(montant).toLocaleString('fr-FR')} FCFA finalisés`, 'success');
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
        
        // Fermer la modale automatiquement
        const modal = document.getElementById('employe-modal');
        if (modal) modal.classList.add('hidden');
        
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
        'technique': 'bg-blue-600',
        'administratif': 'bg-green-500',
        'chantier': 'bg-blue-600'
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
        // 🔗 LIAISON FINANCES: Enregistrer le paiement via la fonction utilitaire
        autoAddTransaction({
            type: 'depense',
            montant: e.salaire,
            categorie: 'salaires',
            description: `Salaire ${moisActuel} ${now.getFullYear()} - ${e.prenom} ${e.nom} (${e.matricule})`,
            reference: `SAL_${e.matricule}_${moisActuel}_${now.getFullYear()}`,
            sourceModule: 'employes',
            date: now.toISOString().split('T')[0]
        });
        
        showNotification('💰 Salaire payé', `${e.salaire.toLocaleString('fr-FR')} FCFA pour ${e.prenom} ${e.nom}`, 'success');
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
            
            // 🔗 LIAISON FINANCES: Créer une dépense pour l'achat de stock
            if (stock.prixAchat > 0 && stock.quantite > 0) {
                const totalAchat = stock.prixAchat * stock.quantite;
                autoAddTransaction({
                    type: 'depense',
                    montant: totalAchat,
                    categorie: 'achats',
                    description: `Achat stock: ${stock.nom} (${stock.quantite} ${stock.unite}) - ${stock.fournisseur || 'Fournisseur non spécifié'}`,
                    reference: stock.reference,
                    sourceModule: 'stocks',
                    date: new Date().toISOString().split('T')[0]
                });
                showNotification('💰 Finances mises à jour', `Dépense de ${totalAchat.toLocaleString('fr-FR')} FCFA enregistrée`, 'info');
            }
        }
        
        localStorage.setItem('stocks', JSON.stringify(stocks));
        form.reset();
        document.getElementById('stock-edit-index').value = '';
        
        // Fermer la modale automatiquement
        const modal = document.getElementById('stock-modal');
        if (modal) modal.classList.add('hidden');
        
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
        'materiaux': 'bg-blue-600',
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
            <div class="bg-white rounded-xl shadow-sm border ${enRupture ? 'border-red-300 bg-red-50' : enAlerte ? 'border-orange-300 bg-yellow-50' : 'border-gray-100'} hover:shadow-md transition overflow-hidden">
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
                            <p class="text-3xl font-bold ${enRupture ? 'text-red-600' : enAlerte ? 'text-yellow-600' : 'text-gray-800'}">${s.quantite}</p>
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
    
    // Demander le coût d'achat pour les finances
    const coutAchat = prompt('Coût total de cet achat (en FCFA, 0 si gratuit):', '0');
    const montantAchat = parseFloat(coutAchat) || 0;
    
    const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    stocks[index].quantite += parseInt(quantite);
    stocks[index].updatedAt = new Date().toISOString();
    
    if (!stocks[index].mouvements) stocks[index].mouvements = [];
    stocks[index].mouvements.unshift({
        type: 'entree',
        quantite: parseInt(quantite),
        date: new Date().toISOString(),
        motif: motif,
        cout: montantAchat
    });
    
    localStorage.setItem('stocks', JSON.stringify(stocks));
    
    // 🔗 LIAISON FINANCES: Créer une dépense pour le réapprovisionnement
    if (montantAchat > 0) {
        autoAddTransaction({
            type: 'depense',
            montant: montantAchat,
            categorie: 'achats',
            description: `Réappro stock: ${stocks[index].nom} (+${quantite} ${stocks[index].unite}) - ${motif}`,
            reference: `${stocks[index].reference}_reappro_${Date.now()}`,
            sourceModule: 'stocks',
            date: new Date().toISOString().split('T')[0]
        });
        showNotification('💰 Finances mises à jour', `Dépense de ${montantAchat.toLocaleString('fr-FR')} FCFA enregistrée`, 'info');
    }
    
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
    // Ajout des modèles prédéfinis manquants
    if (!localStorage.getItem('documentTemplates')) {
        const defaultTemplates = [
            {
                nom: 'Devis professionnel BTP',
                description: 'Modèle de devis professionnel pour travaux BTP',
                type: 'devis',
                createdAt: new Date().toISOString(),
                predefini: true,
                fields: [],
                content: '<h1>Devis</h1>'
            },
            {
                nom: 'Location courte durée',
                description: 'Modèle de contrat pour location courte durée',
                type: 'location-courte',
                createdAt: new Date().toISOString(),
                predefini: true,
                fields: [],
                content: '<h1>Location Courte Durée</h1>'
            }
        ];
        localStorage.setItem('documentTemplates', JSON.stringify(defaultTemplates));
    } else {
        // Ajout si manquant (évite doublons)
        let templates = JSON.parse(localStorage.getItem('documentTemplates'));
        let changed = false;
        if (!templates.some(t => t.type === 'devis')) {
            templates.push({
                nom: 'Devis professionnel BTP',
                description: 'Modèle de devis professionnel pour travaux BTP',
                type: 'devis',
                createdAt: new Date().toISOString(),
                predefini: true,
                fields: [],
                content: '<h1>Devis</h1>'
            });
            changed = true;
        }
        if (!templates.some(t => t.type === 'location-courte')) {
            templates.push({
                nom: 'Location courte durée',
                description: 'Modèle de contrat pour location courte durée',
                type: 'location-courte',
                createdAt: new Date().toISOString(),
                predefini: true,
                fields: [],
                content: '<h1>Location Courte Durée</h1>'
            });
            changed = true;
        }
        if (changed) localStorage.setItem('documentTemplates', JSON.stringify(templates));
    }

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
        'technique': 'bg-blue-600',
        'commercial': 'bg-green-500',
        'juridique': 'bg-red-500',
        'comptable': 'bg-purple-500',
        'projet': 'bg-blue-600',
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
        showNotification(`${typeLabel} ajouté`, `${formatMontantDisplay(transaction.montantTTC)}`, 'success');
    }
    
    localStorage.setItem('comptabilite', JSON.stringify(transactions));
    closeTransactionModal();
    
    // Rafraîchir le module Finances unifié
    if (typeof refreshFinances === 'function') {
        refreshFinances();
    }
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
        nom: settings.companyName || 'KFS BTP IMMO',
        slogan: settings.companySlogan || 'Bâtiment - Travaux Publics - Immobilier',
        adresse: settings.companyAddress || 'Villa 123 MC, Quartier Medinacoura, Tambacounda',
        telephone: settings.companyPhone || '+221 78 584 28 71 / +33 6 05 84 68 07',
        email: settings.companyEmail || 'kfsbtpproimmo@gmail.com',
        site: settings.companySite || 'www.kfs-btp.sn',
        capital: settings.companyCapital || '',
        banque: settings.companyBank || '',
        ninea: '009468499',
        rccm: 'SN TBC 2025 M 1361',
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
                <p style="margin: 5px 0;"><strong>${client.nom || data.clientNom || '<span style="color:#dc2626; background:#fee2e2; padding:2px 8px; border-radius:4px;">Nom à compléter</span>'}</strong></p>
                <p style="margin: 5px 0; font-size: 13px;">Adresse: ${client.adresse || data.clientAdresse || '<span style="color:#dc2626;">À compléter</span>'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Téléphone: ${client.telephone || data.clientTel || '<span style="color:#dc2626;">À compléter</span>'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Email: ${client.email || data.clientEmail || '<span style="color:#9ca3af;">Non renseigné</span>'}</p>
                ${client.type === 'entreprise' || data.clientType === 'entreprise' ? `
                <p style="margin: 5px 0; font-size: 13px;">NINEA: ${client.ninea || data.clientNinea || '<span style="color:#9ca3af;">Non renseigné</span>'}</p>
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
            <strong>Lieu d'exécution:</strong> ${data.lieuTravaux || '<span style="color:#dc2626;">À compléter</span>'}
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
            <strong>2.2.</strong> Date prévisionnelle de début des travaux: <strong>${data.dateDebut ? new Date(data.dateDebut).toLocaleDateString('fr-FR') : '<span style="color:#dc2626;">À définir</span>'}</strong>
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.3.</strong> Date prévisionnelle de fin des travaux: <strong>${data.dateFin ? new Date(data.dateFin).toLocaleDateString('fr-FR') : '<span style="color:#dc2626;">À définir</span>'}</strong>
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
                <p style="font-size: 12px; margin-bottom: 80px;">${data.representantPrestataire || 'Le Directeur Général'}</p>
                <div style="border-top: 1px solid #333; padding-top: 10px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Signature et cachet</p>
                    <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">(Précédé de la mention "Lu et approuvé")</p>
                </div>
            </div>
            <div style="text-align: center;">
                <p style="font-weight: bold; color: #10b981; margin-bottom: 15px; font-size: 13px;">LE CLIENT</p>
                <p style="font-size: 12px; color: #666; margin-bottom: 10px;">${client.nom || data.clientNom || '<span style="color:#dc2626;">Nom du client</span>'}</p>
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
                <p style="margin: 5px 0;"><strong>${client.nom || data.locataireNom || '<span style="color:#dc2626; background:#fee2e2; padding:2px 8px; border-radius:4px;">Nom à compléter</span>'}</strong></p>
                <p style="margin: 5px 0; font-size: 13px;">Né(e) le: ${data.locataireDateNaissance || '<span style="color:#dc2626;">À compléter</span>'}</p>
                <p style="margin: 5px 0; font-size: 13px;">CNI/Passeport: ${data.locataireCNI || '<span style="color:#dc2626;">À compléter</span>'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Téléphone: ${client.telephone || data.locataireTel || '<span style="color:#dc2626;">À compléter</span>'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Email: ${client.email || data.locataireEmail || '<span style="color:#9ca3af;">Non renseigné</span>'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Profession: ${data.locataireProfession || '<span style="color:#9ca3af;">Non renseignée</span>'}</p>
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
                    <td style="padding: 10px 0;">${data.adresseBien || '<span style="color:#dc2626;">À compléter</span>'}</td>
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
            <strong>2.2.</strong> Date de prise d'effet: <strong>${data.dateEntree ? new Date(data.dateEntree).toLocaleDateString('fr-FR') : '<span style="color:#dc2626;">À définir</span>'}</strong>
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.3.</strong> Date d'expiration: <strong>${data.dateFin ? new Date(data.dateFin).toLocaleDateString('fr-FR') : '<span style="color:#dc2626;">À définir</span>'}</strong>
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
                <p style="font-size: 12px; margin-bottom: 80px;">${data.representantBailleur || 'Le Directeur Général'}</p>
                <div style="border-top: 1px solid #333; padding-top: 10px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Signature et cachet</p>
                    <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">(Précédé de la mention "Lu et approuvé")</p>
                </div>
            </div>
            <div style="text-align: center;">
                <p style="font-weight: bold; color: #b45309; margin-bottom: 15px; font-size: 14px;">LE LOCATAIRE</p>
                <p style="font-size: 12px; color: #666; margin-bottom: 10px;">${client.nom || data.locataireNom || '<span style="color:#dc2626;">Nom du locataire</span>'}</p>
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
            <p style="margin: 5px 0; font-weight: bold; font-size: 16px;">${client.nom || data.clientNom || '<span style="color:#dc2626;">Nom à compléter</span>'}</p>
            ${client.type === 'entreprise' || data.clientType === 'entreprise' ? `<p style="margin: 3px 0; font-size: 12px;">NINEA: ${client.ninea || data.clientNinea || '-'}</p>` : ''}
            <p style="margin: 3px 0; font-size: 12px;">${client.adresse || data.clientAdresse || '<span style="color:#9ca3af;">Adresse non renseignée</span>'}</p>
            <p style="margin: 3px 0; font-size: 12px;">Tél: ${client.telephone || data.clientTel || '<span style="color:#dc2626;">À compléter</span>'}</p>
            <p style="margin: 3px 0; font-size: 12px;">Email: ${client.email || data.clientEmail || '<span style="color:#9ca3af;">Non renseigné</span>'}</p>
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
    
    // Formulaire par défaut pour les modèles prédéfinis
    let formHtml = '';
    if (template.type === 'devis') {
        formHtml = `
            <form id="use-template-form" class="space-y-4">
                <input type="hidden" id="use-template-index" value="${index}">
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Nom du client *</label><input type="text" id="tpl-field-clientNom" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" required></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label><input type="tel" id="tpl-field-clientTel" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Email</label><input type="email" id="tpl-field-clientEmail" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Adresse</label><input type="text" id="tpl-field-clientAdresse" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Objet du devis *</label><input type="text" id="tpl-field-objetDevis" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" required></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Lieu des travaux</label><input type="text" id="tpl-field-lieuTravaux" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Validité (jours)</label><input type="number" id="tpl-field-validite" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" value="30"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Référence</label><input type="text" id="tpl-field-reference" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Lignes de devis (tableau simplifié)</label><textarea id="tpl-field-lignes" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" rows="4" placeholder="Désignation;Quantité;Unité;Prix Unitaire\n...\nExemple :\nMaçonnerie;10;m2;5000"></textarea></div>
            </form>
        `;
    } else if (template.type === 'location-courte') {
        formHtml = `
            <form id="use-template-form" class="space-y-4">
                <input type="hidden" id="use-template-index" value="${index}">
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Nom du locataire *</label><input type="text" id="tpl-field-clientNom" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" required></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label><input type="tel" id="tpl-field-clientTel" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Email</label><input type="email" id="tpl-field-clientEmail" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Adresse</label><input type="text" id="tpl-field-clientAdresse" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Date de début *</label><input type="date" id="tpl-field-dateDebut" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" required></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Date de fin *</label><input type="date" id="tpl-field-dateFin" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" required></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Montant du loyer *</label><input type="number" id="tpl-field-loyer" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" required></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Caution</label><input type="number" id="tpl-field-caution" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-2">Adresse du bien</label><input type="text" id="tpl-field-adresseBien" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"></div>
            </form>
        `;
    } else {
        formHtml = `<form id="use-template-form" class="space-y-4"><input type="hidden" id="use-template-index" value="${index}">${template.fields.map(field => `<div><label class="block text-sm font-semibold text-gray-700 mb-2">${field.name} ${field.required ? '<span class="text-red-500">*</span>' : ''}</label>${field.type === 'textarea' ? `<textarea id="tpl-field-${field.name.replace(/\s+/g, '_')}" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} rows="3"></textarea>` : `<input type="${field.type}" id="tpl-field-${field.name.replace(/\s+/g, '_')}" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`}</div>`).join('')}</form>`;
    }

    window.openKFSModal(`
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" onclick="window.closeKFSModal('kfs-modal')"></div>
        <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 z-10">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-bold">${template.nom}</h2>
                            <p class="text-blue-200 text-sm mt-1">Remplissez les informations pour générer le document</p>
                        </div>
                        <button onclick="window.closeKFSModal('kfs-modal')" class="p-2 hover:bg-white/20 rounded-full transition">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                </div>
                <!-- Content -->
                <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 180px);">
                    ${formHtml}
                </div>
                <!-- Footer -->
                <div class="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end space-x-3">
                    <button type="button" onclick="window.closeKFSModal('kfs-modal')" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition">Annuler</button>
                    <button type="button" onclick="generateFromTemplate(${index})" class="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition font-semibold"><span class="material-icons align-middle text-sm mr-1">print</span>Générer le document</button>
                </div>
            </div>
        </div>
    `, 'kfs-modal');
};

// Obsolète : remplacé par closeKFSModal
window.closeUseTemplateModal = function() { window.closeKFSModal('kfs-modal'); };

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
        'location-courte': 'Contrat de Location Courte Durée',
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
                        ${type === 'location-courte' ? generateLocationCourteForm(clients) : ''}
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
        <div class="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 class="font-bold text-blue-800 mb-6 flex items-center">
                <span class="material-icons mr-2 text-yellow-600">description</span>Informations du contrat
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Client existant</label>
                    <select id="doc-client-select" onchange="fillDocClientInfo()" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                        <option value="">-- Nouveau client --</option>
                        ${clients.map((c, i) => `<option value="${i}">${c.nom || c.raisonSociale || 'Client ' + (i+1)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Nom complet / Raison sociale *</label>
                    <input type="text" id="doc-client-nom" required class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Type de client</label>
                    <select id="doc-client-type" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                        <option value="particulier">Particulier</option>
                        <option value="entreprise">Entreprise</option>
                    </select>
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Téléphone *</label>
                    <input type="tel" id="doc-client-tel" required class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Email</label>
                    <input type="email" id="doc-client-email" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Adresse</label>
                    <input type="text" id="doc-client-adresse" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">NINEA</label>
                    <input type="text" id="doc-client-ninea" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Projet (optionnel)</label>
                    <select id="doc-projet-select" onchange="fillProjetInfo()" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                        <option value="">-- Sélectionner un projet --</option>
                        ${projets.map(p => `<option value="${p.id || p.nom}">${p.nom}</option>`).join('')}
                    </select>
                </div>
                <div class="md:col-span-3">
                    <label class="block text-blue-800 text-sm font-bold mb-2">Description détaillée des travaux *</label>
                    <textarea id="doc-description-travaux" required rows="2" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500"></textarea>
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Lieu d'exécution *</label>
                    <input type="text" id="doc-lieu-travaux" required class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Durée du contrat</label>
                    <input type="number" id="doc-duree" value="3" min="1" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Unité durée</label>
                    <select id="doc-unite-duree" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                        <option value="mois">mois</option>
                        <option value="semaines">semaines</option>
                        <option value="jours">jours</option>
                    </select>
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Date de début</label>
                    <input type="date" id="doc-date-debut" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Date de fin prévue</label>
                    <input type="date" id="doc-date-fin" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Montant HT (FCFA) *</label>
                    <input type="number" id="doc-montant-ht" required min="0" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">TVA</label>
                    <select id="doc-avec-tva" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                        <option value="non">Sans TVA</option>
                        <option value="oui">Avec TVA (18%)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Acompte à la signature (%)</label>
                    <input type="number" id="doc-acompte" value="30" min="0" max="100" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Durée garantie (mois)</label>
                    <input type="number" id="doc-garantie" value="12" min="0" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div class="md:col-span-3">
                    <label class="block text-blue-800 text-sm font-bold mb-2">Échéancier de paiement (optionnel)</label>
                    <textarea id="doc-echeancier" rows="2" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500"></textarea>
                </div>
                <div class="md:col-span-3">
                    <label class="block text-blue-800 text-sm font-bold mb-2">Clauses particulières (optionnel)</label>
                    <textarea id="doc-clauses" rows="2" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500"></textarea>
                </div>
            </div>
        </div>
    `;
}

// Formulaire Bail
function generateBailForm(clients) {
    return `
        <div class="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 class="font-bold text-blue-800 mb-6 flex items-center">
                <span class="material-icons mr-2 text-yellow-600">home</span>Informations du bail
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Client existant</label>
                    <select id="doc-client-select" onchange="fillDocClientInfo()" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                        <option value="">-- Nouveau locataire --</option>
                        ${clients.map((c, i) => `<option value="${i}">${c.nom || c.raisonSociale || 'Client ' + (i+1)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Nom complet *</label>
                    <input type="text" id="doc-client-nom" required class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Date de naissance</label>
                    <input type="date" id="doc-locataire-naissance" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">N° CNI / Passeport</label>
                    <input type="text" id="doc-locataire-cni" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Téléphone *</label>
                    <input type="tel" id="doc-client-tel" required class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Email</label>
                    <input type="email" id="doc-client-email" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Profession</label>
                    <input type="text" id="doc-locataire-profession" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div class="md:col-span-3">
                    <label class="block text-blue-800 text-sm font-bold mb-2">Adresse complète du bien *</label>
                    <input type="text" id="doc-adresse-bien" required class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Ville</label>
                    <input type="text" id="doc-ville-bien" value="Dakar" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Type de bien</label>
                    <select id="doc-type-bien" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
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
                    <label class="block text-blue-800 text-sm font-bold mb-2">Étage</label>
                    <input type="text" id="doc-etage" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Surface (m²)</label>
                    <input type="number" id="doc-surface" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Nombre de pièces</label>
                    <input type="number" id="doc-nb-pieces" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Type de bail</label>
                    <select id="doc-type-bail" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                        <option value="habitation">Habitation</option>
                        <option value="meuble">Meublé</option>
                        <option value="commercial">Commercial</option>
                        <option value="professionnel">Professionnel</option>
                    </select>
                </div>
                <div class="md:col-span-3">
                    <label class="block text-blue-800 text-sm font-bold mb-2">Composition du logement</label>
                    <textarea id="doc-composition" rows="2" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500"></textarea>
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Durée du bail (mois)</label>
                    <input type="number" id="doc-duree-bail" value="12" min="1" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Date d'entrée *</label>
                    <input type="date" id="doc-date-entree" required class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Renouvellement</label>
                    <select id="doc-renouvellement" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                        <option value="tacite">Tacite reconduction</option>
                        <option value="expresse">Renouvellement exprès</option>
                    </select>
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Loyer mensuel (FCFA) *</label>
                    <input type="number" id="doc-loyer" required min="0" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Charges mensuelles (FCFA)</label>
                    <input type="number" id="doc-charges" value="0" min="0" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-blue-800 text-sm font-bold mb-2">Dépôt de garantie (mois)</label>
                    <input type="number" id="doc-depot-mois" value="2" min="1" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div class="md:col-span-3">
                    <label class="block text-blue-800 text-sm font-bold mb-2">Détail des charges</label>
                    <input type="text" id="doc-detail-charges" class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-gray-800 focus:border-blue-500">
                </div>
                <div class="md:col-span-3">
                    <label class="block text-blue-800 text-sm font-bold mb-2">Options du bail</label>
                    <div class="flex flex-wrap gap-4 mt-2">
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
            </div>
        </div>
    `;
}

// Formulaire Location Courte Durée (similaire au bail classique)
function generateLocationCourteForm(clients) {
    return `
        <!-- Section Locataire -->
        <div class="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
            <h3 class="font-bold text-yellow-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-yellow-600">person</span>Informations Locataire
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Client existant</label>
                    <select id="doc-client-select" onchange="fillDocClientInfo()" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                        <option value="">-- Nouveau locataire --</option>
                        ${clients.map((c, i) => `<option value="${i}">${c.nom || c.raisonSociale || 'Client ' + (i+1)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Nom complet *</label>
                    <input type="text" id="doc-client-nom" required class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Date de naissance</label>
                    <input type="date" id="doc-locataire-naissance" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">N° CNI / Passeport</label>
                    <input type="text" id="doc-locataire-cni" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Téléphone *</label>
                    <input type="tel" id="doc-client-tel" required class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Email</label>
                    <input type="email" id="doc-client-email" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Nationalité</label>
                    <input type="text" id="doc-locataire-nationalite" value="Sénégalaise" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Profession</label>
                    <input type="text" id="doc-locataire-profession" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                </div>
            </div>
        </div>
        
        <!-- Section Bien -->
        <div class="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
            <h3 class="font-bold text-yellow-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-yellow-600">hotel</span>Description du Bien Loué
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Adresse complète du bien *</label>
                    <input type="text" id="doc-adresse-bien" required class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white" placeholder="Numéro, rue, quartier">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Ville</label>
                    <input type="text" id="doc-ville-bien" value="Dakar" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Type de bien</label>
                    <select id="doc-type-bien" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                        <option value="appartement-meuble">Appartement meublé</option>
                        <option value="studio-meuble">Studio meublé</option>
                        <option value="chambre-meublee">Chambre meublée</option>
                        <option value="villa-meublee">Villa meublée</option>
                        <option value="residence">Résidence</option>
                    </select>
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Nombre de pièces</label>
                    <input type="number" id="doc-nb-pieces" min="1" value="2" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Surface (m²)</label>
                    <input type="number" id="doc-surface" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white" placeholder="Ex: 45">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Équipements inclus</label>
                    <textarea id="doc-equipements" rows="2" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white" placeholder="Ex: Climatisation, TV, WiFi, Cuisine équipée..."></textarea>
                </div>
            </div>
        </div>
        
        <!-- Section Durée et Tarifs -->
        <div class="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
            <h3 class="font-bold text-yellow-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-yellow-600">event</span>Durée et Tarification
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Date d'entrée *</label>
                    <input type="date" id="doc-date-entree" required class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Date de sortie *</label>
                    <input type="date" id="doc-date-sortie" required class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Durée (calculée)</label>
                    <input type="text" id="doc-duree-sejour" readonly class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-500 bg-gray-100" placeholder="Auto">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Tarif journalier (FCFA) *</label>
                    <input type="number" id="doc-tarif-jour" required class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white" placeholder="Ex: 25000">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Caution (FCFA)</label>
                    <input type="number" id="doc-caution" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white" placeholder="Ex: 50000">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Total estimé (FCFA)</label>
                    <input type="text" id="doc-total-estime" readonly class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-500 bg-gray-100 font-bold" placeholder="Auto">
                </div>
            </div>
        </div>
        
        <!-- Section Services inclus -->
        <div class="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
            <h3 class="font-bold text-yellow-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-yellow-600">room_service</span>Services Inclus
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-service-wifi" checked class="w-5 h-5 text-yellow-600 rounded">
                    <span class="text-gray-700">WiFi</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-service-electricite" checked class="w-5 h-5 text-yellow-600 rounded">
                    <span class="text-gray-700">Électricité</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-service-eau" checked class="w-5 h-5 text-yellow-600 rounded">
                    <span class="text-gray-700">Eau</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-service-menage" class="w-5 h-5 text-yellow-600 rounded">
                    <span class="text-gray-700">Ménage</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-service-gardien" class="w-5 h-5 text-yellow-600 rounded">
                    <span class="text-gray-700">Gardiennage</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-service-parking" class="w-5 h-5 text-yellow-600 rounded">
                    <span class="text-gray-700">Parking</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-service-linge" class="w-5 h-5 text-yellow-600 rounded">
                    <span class="text-gray-700">Linge de maison</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="doc-service-clim" checked class="w-5 h-5 text-yellow-600 rounded">
                    <span class="text-gray-700">Climatisation</span>
                </label>
            </div>
            <div class="mt-4">
                <label class="block text-yellow-800 text-sm font-medium mb-1">Conditions particulières</label>
                <textarea id="doc-conditions" rows="2" class="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl text-gray-800 bg-white" placeholder="Ex: Heure d'arrivée 14h, départ 12h..."></textarea>
            </div>
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
                    <select id="doc-client-select" onchange="fillDocClientInfo()" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800">
                        <option value="">-- Sélectionner --</option>
                        ${clients.map((c, i) => `<option value="${i}">${c.nom || c.raisonSociale || 'Client ' + (i+1)}</option>`).join('')}
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
            </div>
        </div>
    `;
}

// ===================================================
// FORMULAIRE DEVIS PROFESSIONNEL
// ===================================================
function generateDevisForm(clients, projets) {
    return `
        <!-- Section Client -->
        <div class="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
            <h3 class="font-bold text-yellow-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-yellow-600">person</span>Informations Client
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Client existant</label>
                    <select id="doc-client-select" onchange="fillDocClientInfo()" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                        <option value="">-- Nouveau client --</option>
                        ${clients.map((c, i) => `<option value="${i}">${c.nom || c.raisonSociale || 'Client ' + (i+1)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Nom / Raison sociale *</label>
                    <input type="text" id="doc-client-nom" required class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Type</label>
                    <select id="doc-client-type" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                        <option value="particulier">Particulier</option>
                        <option value="entreprise">Entreprise</option>
                    </select>
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Téléphone *</label>
                    <input type="tel" id="doc-client-tel" required class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Email</label>
                    <input type="email" id="doc-client-email" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Adresse</label>
                    <input type="text" id="doc-client-adresse" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">NINEA (entreprise)</label>
                    <input type="text" id="doc-client-ninea" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Projet lié</label>
                    <select id="doc-projet-select" onchange="fillProjetInfo()" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                        <option value="">-- Aucun --</option>
                        ${projets.map((p, i) => `<option value="${i}">${p.nom || 'Projet ' + (i+1)}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>
        
        <!-- Section Devis -->
        <div class="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
            <h3 class="font-bold text-yellow-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-yellow-600">request_quote</span>Détails du Devis
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Objet du devis *</label>
                    <input type="text" id="doc-objet-devis" required class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white" placeholder="Ex: Travaux de rénovation appartement">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Référence</label>
                    <input type="text" id="doc-reference" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white" placeholder="Auto-générée">
                </div>
                <div class="md:col-span-3">
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Lieu des travaux *</label>
                    <input type="text" id="doc-lieu-travaux" required class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white" placeholder="Adresse du chantier">
                </div>
            </div>
        </div>
        
        <!-- Lignes du devis -->
        <div class="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-yellow-800 flex items-center">
                    <span class="material-icons mr-2 text-yellow-600">list</span>Prestations / Articles
                </h3>
                <button type="button" onclick="addDevisLigne()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <span class="material-icons align-middle text-sm">add</span> Ajouter une ligne
                </button>
            </div>
            <div id="devis-lignes-container" class="space-y-2">
                <!-- Lignes ajoutées dynamiquement -->
            </div>
        </div>
        
        <!-- Totaux et conditions -->
        <div class="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
            <h3 class="font-bold text-yellow-800 mb-4 flex items-center">
                <span class="material-icons mr-2 text-yellow-600">calculate</span>Montants et Conditions
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">TVA</label>
                    <select id="doc-avec-tva" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                        <option value="non">Sans TVA</option>
                        <option value="oui">Avec TVA (18%)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Remise (%)</label>
                    <input type="number" id="doc-remise" value="0" min="0" max="100" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Validité (jours)</label>
                    <input type="number" id="doc-validite" value="30" min="1" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Acompte (%)</label>
                    <input type="number" id="doc-acompte" value="30" min="0" max="100" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Délai d'exécution</label>
                    <input type="number" id="doc-delai" min="1" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white" placeholder="Ex: 15">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Unité délai</label>
                    <select id="doc-unite-delai" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                        <option value="jours ouvrés">Jours ouvrés</option>
                        <option value="jours">Jours</option>
                        <option value="semaines">Semaines</option>
                        <option value="mois">Mois</option>
                    </select>
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Date début prévue</label>
                    <input type="date" id="doc-date-debut" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white">
                </div>
                <div>
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Total HT</label>
                    <input type="text" id="doc-total-ht-display" readonly class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-500 bg-gray-100 font-bold">
                </div>
                <div class="md:col-span-4">
                    <label class="block text-yellow-800 text-sm font-medium mb-1">Notes / Conditions particulières</label>
                    <textarea id="doc-notes" rows="2" class="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-gray-800 bg-white" placeholder="Conditions de paiement, garanties, etc."></textarea>
                </div>
            </div>
        </div>
    `;
}

// ===================================================
// FONCTIONS MODAL CRÉATION DOCUMENTS
// ===================================================

// Fermer le modal de création de document
window.closeDocCreationModal = function() {
    const modal = document.getElementById('doc-creation-modal');
    if (modal) modal.remove();
};

// Aperçu du document avant génération
window.previewDocument = function() {
    const type = document.getElementById('doc-type')?.value;
    if (!type) {
        showNotification('Erreur', 'Type de document non défini', 'error');
        return;
    }
    
    const data = collectFormData();
    if (!data) return;
    
    const content = generateDocumentHTML(type, data, true);
    
    const previewWindow = window.open('', '_blank', 'width=900,height=700');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Aperçu - ${type.toUpperCase()}</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .preview-banner { background: #fbbf24; color: #92400e; padding: 10px 20px; text-align: center; font-weight: bold; margin-bottom: 20px; border-radius: 8px; }
                .document-container { background: white; max-width: 210mm; margin: 0 auto; padding: 20mm; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            </style>
        </head>
        <body>
            <div class="preview-banner">⚠️ APERÇU - Document non enregistré</div>
            <div class="document-container">${content}</div>
        </body>
        </html>
    `);
    previewWindow.document.close();
};

// Sauvegarder et générer le document final
window.saveAndGenerateDocument = function() {
    const type = document.getElementById('doc-type')?.value;
    if (!type) {
        showNotification('Erreur', 'Type de document non défini', 'error');
        return;
    }
    
    const data = collectFormData();
    if (!data) return;
    
    // Générer le numéro de document
    const prefix = {
        'contrat': 'CTR',
        'bail': 'BAIL',
        'location-courte': 'LCD',
        'devis': 'DEV',
        'attestation': 'ATT'
    }[type] || 'DOC';
    
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const numero = `${prefix}-${new Date().getFullYear()}-${String(documents.length + 1).padStart(4, '0')}`;
    
    // Générer le contenu HTML du document
    const contenuHTML = generateDocumentHTML(type, data, false);
    
    // Créer l'objet document
    const newDoc = {
        numero: numero,
        type: type,
        nom: `${prefix} - ${data.clientNom || 'Client'}`,
        categorie: type,
        clientNom: data.clientNom,
        clientTel: data.clientTel,
        clientEmail: data.clientEmail,
        contenuHTML: contenuHTML,
        data: data,
        createdAt: new Date().toISOString(),
        statut: 'genere'
    };
    
    // Sauvegarder
    documents.push(newDoc);
    localStorage.setItem('documents', JSON.stringify(documents));
    
    // Fermer le modal
    closeDocCreationModal();
    
    // Rafraîchir la liste
    if (typeof renderDocuments === 'function') renderDocuments();
    if (typeof updateDocumentStats === 'function') updateDocumentStats();
    
    // Afficher le document généré
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${newDoc.nom} - ${numero}</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f0f0f0; }
                .document-container { background: white; max-width: 210mm; margin: 0 auto; padding: 20mm; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                .no-print { margin-top: 20px; text-align: center; }
                .no-print button { padding: 12px 30px; margin: 5px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
                .btn-print { background: #3b82f6; color: white; }
                .btn-print:hover { background: #2563eb; }
                @media print { 
                    body { background: white; padding: 0; }
                    .document-container { box-shadow: none; padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="document-container">${contenuHTML}</div>
            <div class="no-print">
                <button class="btn-print" onclick="window.print()">🖨️ Imprimer / PDF</button>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    
    showNotification('Document généré !', `${newDoc.nom} (${numero})`, 'success');
};

// Fonction auto-remplissage client pour les formulaires documents
window.fillDocClientInfo = function() {
    const select = document.getElementById('doc-client-select');
    const clientIndex = select?.value;
    
    if (clientIndex === '' || clientIndex === null || clientIndex === undefined) return;
    
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const client = clients[clientIndex];
    
    if (!client) return;
    
    // Remplir les champs du formulaire
    const nom = client.type === 'entreprise' 
        ? (client.raisonSociale || client.nom) 
        : `${client.civilite || ''} ${client.prenom || ''} ${client.nom || ''}`.trim();
    
    if (document.getElementById('doc-client-nom')) document.getElementById('doc-client-nom').value = nom;
    if (document.getElementById('doc-client-tel')) document.getElementById('doc-client-tel').value = client.telephone || '';
    if (document.getElementById('doc-client-email')) document.getElementById('doc-client-email').value = client.email || '';
    if (document.getElementById('doc-client-adresse')) document.getElementById('doc-client-adresse').value = client.adresse || '';
    if (document.getElementById('doc-client-type')) document.getElementById('doc-client-type').value = client.type || 'particulier';
    if (document.getElementById('doc-client-ninea')) document.getElementById('doc-client-ninea').value = client.ninea || '';
    if (document.getElementById('doc-locataire-cni')) document.getElementById('doc-locataire-cni').value = client.cni || '';
    if (document.getElementById('doc-locataire-profession')) document.getElementById('doc-locataire-profession').value = client.profession || '';
    
    // Animation visuelle
    ['doc-client-nom', 'doc-client-tel', 'doc-client-email', 'doc-client-adresse'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.value) {
            el.classList.add('bg-green-50');
            setTimeout(() => el.classList.remove('bg-green-50'), 1500);
        }
    });
};

// Générer le HTML du document selon le type - Style professionnel KFS BTP
function generateDocumentHTML(type, data, isPreview) {
    const now = new Date();
    const dateJour = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const dateHeure = now.toLocaleString('fr-FR');
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    
    // Préfixes par type de document
    const prefixes = {
        'contrat': 'CTR',
        'bail': 'BAIL',
        'location-courte': 'LCD',
        'devis': 'DEV',
        'attestation': 'ATT'
    };
    const prefix = prefixes[type] || 'DOC';
    const numero = isPreview ? 'APERÇU' : `${prefix}-${now.getFullYear()}-${String(documents.length + 1).padStart(4, '0')}`;
    
    // Titres des documents
    const titres = {
        'contrat': 'Contrat de Prestation de Services',
        'bail': 'Contrat de Bail',
        'location-courte': 'Contrat de Location Courte Durée',
        'devis': 'Devis',
        'attestation': 'Attestation'
    };
    
    // Fonction pour convertir un montant en lettres (simplifié)
    function montantEnLettres(montant) {
        const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
        const dizaines = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
        
        if (montant === 0) return 'zéro';
        if (montant >= 1000000) {
            const millions = Math.floor(montant / 1000000);
            const reste = montant % 1000000;
            return (millions === 1 ? 'un million' : montantEnLettres(millions) + ' millions') + (reste > 0 ? ' ' + montantEnLettres(reste) : '');
        }
        if (montant >= 1000) {
            const milliers = Math.floor(montant / 1000);
            const reste = montant % 1000;
            return (milliers === 1 ? 'mille' : montantEnLettres(milliers) + ' mille') + (reste > 0 ? ' ' + montantEnLettres(reste) : '');
        }
        if (montant >= 100) {
            const centaines = Math.floor(montant / 100);
            const reste = montant % 100;
            return (centaines === 1 ? 'cent' : montantEnLettres(centaines) + ' cent') + (reste > 0 ? ' ' + montantEnLettres(reste) : '');
        }
        if (montant >= 20) {
            const dizaine = Math.floor(montant / 10);
            const unite = montant % 10;
            if (dizaine === 7 || dizaine === 9) {
                return dizaines[dizaine] + '-' + unites[10 + unite];
            }
            return dizaines[dizaine] + (unite > 0 ? '-' + unites[unite] : '');
        }
        return unites[montant];
    }
    
    // Structure HTML complète du document professionnel
    let html = `
<div class="document-professionnel" style="font-family: 'Times New Roman', serif; max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; color: #333; line-height: 1.6;">
    
    <!-- EN-TÊTE -->
    <div style="border-bottom: 3px double #1e3a8a; padding-bottom: 20px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h1 style="color: #1e3a8a; font-size: 28px; margin: 0; font-weight: bold;">KFS BTP IMMO</h1>
                <p style="color: #666; font-style: italic; margin: 5px 0;">Bâtiment - Travaux Publics - Immobilier</p>
                <p style="font-size: 12px; color: #555; margin: 10px 0 0 0;">
                    Villa 123 MC, Quartier Medinacoura, Tambacounda<br>
                    Tél: +221 78 584 28 71 / +33 6 05 84 68 07<br>
                    Email: kfsbtpproimmo@gmail.com<br>
                    <strong>NINEA:</strong> 009468499 | <strong>RCCM:</strong> SN TBC 2025 M 1361
                </p>
            </div>
            <div style="text-align: right;">
                <div style="background: #1e3a8a; color: white; padding: 15px 25px; border-radius: 8px;">
                    <p style="margin: 0; font-size: 12px; opacity: 0.9;">${type.toUpperCase().replace('-', ' ')} N°</p>
                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${numero}</p>
                </div>
                <p style="margin-top: 10px; font-size: 12px; color: #666;">Date: ${dateJour}</p>
            </div>
        </div>
    </div>

    <!-- TITRE DU DOCUMENT -->
    <div style="text-align: center; margin: 40px 0; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 10px;">
        <h2 style="color: #1e3a8a; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
            ${titres[type] || 'Document'}
        </h2>
        <p style="color: #64748b; margin: 10px 0 0 0; font-size: 14px;">Secteur Bâtiment et Travaux Publics</p>
    </div>`;

    // PARTIES CONTRACTANTES (pour contrat, bail uniquement - PAS location-courte)
    if (type === 'contrat' || type === 'bail') {
        html += `
    <!-- PARTIES CONTRACTANTES -->
    <div style="margin: 30px 0;">
        <h3 style="color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 16px;">
            ENTRE LES SOUSSIGNÉS
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px;">
            <!-- LE PRESTATAIRE / BAILLEUR -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #1e3a8a;">
                <h4 style="color: #1e3a8a; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">${type === 'bail' ? 'Le Bailleur' : 'Le Prestataire'}</h4>
                <p style="margin: 5px 0;"><strong>KFS BTP IMMO</strong></p>
                <p style="margin: 5px 0; font-size: 13px;">Villa 123 MC, Quartier Medinacoura, Tambacounda</p>
                <p style="margin: 5px 0; font-size: 13px;">Tél: +221 78 584 28 71 / +33 6 05 84 68 07</p>
                <p style="margin: 5px 0; font-size: 13px;">Email: kfsbtpproimmo@gmail.com</p>
                <p style="margin: 5px 0; font-size: 13px;">NINEA: 009468499 | RCCM: SN TBC 2025 M 1361</p>
                <p style="margin: 10px 0 0 0; font-size: 13px;">
                    Représenté par: <strong>Le Directeur Général</strong>
                </p>
                <p style="margin-top: 10px; font-style: italic; color: #666; font-size: 12px;">Ci-après dénommé "${type === 'bail' ? 'LE BAILLEUR' : 'LE PRESTATAIRE'}"</p>
            </div>
            
            <!-- LE CLIENT / LOCATAIRE -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                <h4 style="color: #10b981; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">${type === 'bail' ? 'Le Locataire' : 'Le Client'}</h4>
                <p style="margin: 5px 0;"><strong>${data.clientNom || '<span style="color:#dc2626; background:#fee2e2; padding:2px 8px; border-radius:4px;">Nom à compléter</span>'}</strong></p>
                <p style="margin: 5px 0; font-size: 13px;">Adresse: ${data.clientAdresse || '<span style="color:#dc2626;">À compléter</span>'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Téléphone: ${data.clientTel || '<span style="color:#dc2626;">À compléter</span>'}</p>
                <p style="margin: 5px 0; font-size: 13px;">Email: ${data.clientEmail || '<span style="color:#dc2626;">À compléter</span>'}</p>
                <p style="margin: 5px 0; font-size: 13px;">NINEA: ${data.clientNinea || '<span style="color:#9ca3af;">Non applicable</span>'}</p>
                <p style="margin-top: 10px; font-style: italic; color: #666; font-size: 12px;">Ci-après dénommé "${type === 'bail' ? 'LE LOCATAIRE' : 'LE CLIENT'}"</p>
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
            ${type === 'contrat' ? 'Le Client souhaite faire réaliser des travaux de construction/rénovation et a sollicité le Prestataire, entreprise spécialisée dans le secteur du Bâtiment et des Travaux Publics, pour l\'exécution desdits travaux. Le Prestataire a accepté cette mission aux conditions définies ci-après.' : ''}
            ${type === 'bail' ? 'Le Bailleur est propriétaire d\'un bien immobilier qu\'il souhaite donner en location. Le Locataire souhaite prendre ce bien en location aux conditions définies ci-après.' : ''}
        </p>
    </div>

    <!-- IL A ÉTÉ CONVENU CE QUI SUIT -->
    <div style="text-align: center; margin: 30px 0; padding: 15px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
        <p style="font-weight: bold; font-size: 16px; color: #1e3a8a; margin: 0; letter-spacing: 3px;">IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT</p>
    </div>`;
    }
    
    // Pour location-courte: seulement Préambule et "IL A ÉTÉ CONVENU" (pas de "Entre les soussignés" ni cartes Bailleur/Locataire)
    if (type === 'location-courte') {
        html += `
    <!-- PRÉAMBULE -->
    <div style="margin: 30px 0; padding: 20px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h3 style="color: #b45309; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">Préambule</h3>
        <p style="text-align: justify; font-size: 13px; margin: 0;">
            Le Bailleur met à disposition du Locataire un logement meublé pour une courte durée, aux conditions définies ci-après.
        </p>
    </div>

    <!-- IL A ÉTÉ CONVENU CE QUI SUIT -->
    <div style="text-align: center; margin: 30px 0; padding: 15px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
        <p style="font-weight: bold; font-size: 16px; color: #1e3a8a; margin: 0; letter-spacing: 3px;">IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT</p>
    </div>`;
    }

    // Corps du document selon le type
    if (type === 'contrat') {
        const montantHT = parseFloat(data.montantHT) || 0;
        const tva = data.avecTVA ? montantHT * 0.18 : 0;
        const montantTTC = montantHT + tva;
        const pourcentageAcompte = parseFloat(data.pourcentageAcompte) || 30;
        const acompte = montantTTC * pourcentageAcompte / 100;
        const solde = montantTTC - acompte;
        const dureeGarantie = data.dureeGarantie || 12;
        
        html += `
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
            <p style="margin: 0; white-space: pre-line;">${data.descriptionTravaux || 'À définir'}</p>
        </div>
        <p style="font-size: 13px;">
            <strong>Lieu d'exécution:</strong> ${data.lieuTravaux || 'À définir'}
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
            <strong>2.2.</strong> Date prévisionnelle de début des travaux: <strong>${data.dateDebut ? new Date(data.dateDebut).toLocaleDateString('fr-FR') : '___/___/______'}</strong>
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.3.</strong> Date prévisionnelle de fin des travaux: <strong>${data.dateFin ? new Date(data.dateFin).toLocaleDateString('fr-FR') : '___/___/______'}</strong>
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
                    <td style="text-align: right; font-weight: bold;">${montantHT.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                ${data.avecTVA ? `
                <tr>
                    <td style="padding: 8px 0;">TVA (18%)</td>
                    <td style="text-align: right;">${tva.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #10b981;">
                    <td style="padding: 12px 0; font-weight: bold; font-size: 15px;">MONTANT TOTAL ${data.avecTVA ? 'TTC' : 'HT'}</td>
                    <td style="text-align: right; font-weight: bold; font-size: 15px; color: #059669;">${montantTTC.toLocaleString('fr-FR')} FCFA</td>
                </tr>
            </table>
            <p style="margin: 15px 0 0 0; font-style: italic; font-size: 12px; color: #666;">
                Arrêté le présent montant à la somme de: <strong>${montantEnLettres(Math.round(montantTTC))} francs CFA</strong>
            </p>
        </div>
        
        <p style="text-align: justify; font-size: 13px;"><strong>3.2. Modalités de paiement</strong></p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <table style="width: 100%; font-size: 13px;">
                <tr>
                    <td style="padding: 8px 0;">▸ Acompte à la signature (${pourcentageAcompte}%)</td>
                    <td style="text-align: right; font-weight: bold;">${acompte.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">▸ Solde à la réception des travaux (${100 - pourcentageAcompte}%)</td>
                    <td style="text-align: right; font-weight: bold;">${solde.toLocaleString('fr-FR')} FCFA</td>
                </tr>
            </table>
        </div>
        
        <p style="text-align: justify; font-size: 13px;">
            <strong>3.3.</strong> Les paiements seront effectués par virement bancaire, chèque ou espèces.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>3.4.</strong> En cas de retard de paiement, des pénalités de retard au taux de 1,5% par mois 
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
            <li>Garantir la conformité des travaux pendant une durée de ${dureeGarantie} mois après réception</li>
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
    </div>

    <!-- ARTICLE 7: GARANTIES -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 7</span>
            GARANTIES
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>7.1.</strong> Le Prestataire accorde au Client une garantie de parfait achèvement d'une durée de 
            <strong>${dureeGarantie} mois</strong> à compter de la réception.
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
            le présent contrat de plein droit, après mise en demeure restée infructueuse pendant 15 jours.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>8.2.</strong> En cas de résiliation du fait du Client, celui-ci devra régler au Prestataire les travaux 
            déjà réalisés majorés d'une indemnité de 10%.
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
            <strong>9.2.</strong> À défaut d'accord amiable dans un délai de 30 jours, 
            le litige sera soumis aux tribunaux compétents de Dakar, Sénégal.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>9.3.</strong> Le présent contrat est soumis au droit sénégalais et aux Actes Uniformes OHADA.
        </p>
    </div>

    ${data.clausesParticulieres ? `
    <!-- CLAUSES PARTICULIÈRES -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 10</span>
            CLAUSES PARTICULIÈRES
        </h3>
        <p style="text-align: justify; font-size: 13px; white-space: pre-line;">${data.clausesParticulieres}</p>
    </div>
    ` : ''}`;
    }
    
    // BAIL
    if (type === 'bail') {
        const loyer = parseFloat(data.loyer) || 0;
        const charges = parseFloat(data.charges) || 0;
        const moisGarantie = parseFloat(data.moisGarantie) || 2;
        const depotGarantie = loyer * moisGarantie;
        
        html += `
    <!-- ARTICLE 1: DÉSIGNATION DU BIEN -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 1</span>
            DÉSIGNATION DU BIEN LOUÉ
        </h3>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Type de bien:</strong> ${data.typeBien || 'Appartement'}</p>
            <p style="margin: 5px 0;"><strong>Adresse:</strong> ${data.adresseBien || '<span style="color:#dc2626;">À compléter</span>'}, ${data.villeBien || 'Dakar'}</p>
            ${data.surface ? `<p style="margin: 5px 0;"><strong>Surface:</strong> ${data.surface} m²</p>` : ''}
            ${data.nombrePieces ? `<p style="margin: 5px 0;"><strong>Nombre de pièces:</strong> ${data.nombrePieces}</p>` : ''}
            ${data.etage ? `<p style="margin: 5px 0;"><strong>Étage:</strong> ${data.etage}</p>` : ''}
            ${data.compositionLogement ? `<p style="margin: 5px 0;"><strong>Composition:</strong> ${data.compositionLogement}</p>` : ''}
        </div>
    </div>

    <!-- ARTICLE 2: DURÉE -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 2</span>
            DURÉE DU BAIL
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.1.</strong> Le présent bail est consenti pour une durée de <strong>${data.dureeBail || 12} mois</strong>.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.2.</strong> Date d'effet: <strong>${data.dateEntree ? new Date(data.dateEntree).toLocaleDateString('fr-FR') : '___/___/______'}</strong>
        </p>
        <p style="text-align: justify; font-size: 13px;">
            <strong>2.3.</strong> Renouvellement: ${data.renouvellement === 'tacite' ? 'Par tacite reconduction' : 'Par accord exprès des parties'}
        </p>
    </div>

    <!-- ARTICLE 3: LOYER ET CHARGES -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 3</span>
            LOYER ET CHARGES
        </h3>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #bbf7d0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                    <td style="padding: 8px 0;">Loyer mensuel</td>
                    <td style="text-align: right; font-weight: bold;">${loyer.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">Charges mensuelles</td>
                    <td style="text-align: right;">${charges.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr style="border-top: 2px solid #10b981;">
                    <td style="padding: 12px 0; font-weight: bold;">TOTAL MENSUEL</td>
                    <td style="text-align: right; font-weight: bold; font-size: 15px; color: #059669;">${(loyer + charges).toLocaleString('fr-FR')} FCFA</td>
                </tr>
            </table>
        </div>
        <p style="text-align: justify; font-size: 13px;">
            Le loyer est payable d'avance, au plus tard le 5 de chaque mois.
        </p>
    </div>

    <!-- ARTICLE 4: DÉPÔT DE GARANTIE -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 4</span>
            DÉPÔT DE GARANTIE
        </h3>
        <p style="text-align: justify; font-size: 13px;">
            Le Locataire verse au Bailleur un dépôt de garantie équivalent à <strong>${moisGarantie} mois</strong> de loyer, 
            soit la somme de <strong>${depotGarantie.toLocaleString('fr-FR')} FCFA</strong>.
        </p>
        <p style="text-align: justify; font-size: 13px;">
            Ce dépôt sera restitué au Locataire dans un délai de deux mois après la remise des clés, 
            déduction faite des sommes dues au Bailleur.
        </p>
    </div>

    <!-- ARTICLE 5: OBLIGATIONS -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 5</span>
            OBLIGATIONS DES PARTIES
        </h3>
        <p style="text-align: justify; font-size: 13px;"><strong>Le Bailleur s'engage à:</strong></p>
        <ul style="font-size: 13px; line-height: 1.8;">
            <li>Délivrer un logement en bon état</li>
            <li>Assurer la jouissance paisible du logement</li>
            <li>Entretenir les locaux et effectuer les réparations nécessaires</li>
        </ul>
        <p style="text-align: justify; font-size: 13px;"><strong>Le Locataire s'engage à:</strong></p>
        <ul style="font-size: 13px; line-height: 1.8;">
            <li>Payer le loyer et les charges aux termes convenus</li>
            <li>User paisiblement des locaux loués</li>
            <li>Répondre des dégradations survenant pendant la location</li>
            <li>Ne pas sous-louer sans accord écrit du Bailleur</li>
        </ul>
    </div>

    <!-- ARTICLE 6: CONDITIONS -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 6</span>
            CONDITIONS PARTICULIÈRES
        </h3>
        <ul style="font-size: 13px; line-height: 1.8;">
            <li>Animaux: ${data.animauxAutorises ? 'Autorisés' : 'Non autorisés'}</li>
            <li>Activité professionnelle: ${data.activiteProfessionnelle ? 'Autorisée' : 'Non autorisée'}</li>
            ${data.revisionLoyer ? '<li>Révision annuelle du loyer selon l\'indice de référence</li>' : ''}
        </ul>
    </div>`;
    }
    
    // LOCATION COURTE DURÉE
    if (type === 'location-courte') {
        const tarifJour = parseFloat(data.tarifJour) || 0;
        const caution = parseFloat(data.caution) || 0;
        const dateEntree = data.dateEntree ? new Date(data.dateEntree) : null;
        const dateSortie = data.dateSortie ? new Date(data.dateSortie) : null;
        const nbJours = dateEntree && dateSortie ? Math.ceil((dateSortie - dateEntree) / (1000 * 60 * 60 * 24)) : 0;
        const totalLocation = tarifJour * nbJours;
        
        // Services inclus
        const services = [];
        if (data.serviceWifi) services.push('WiFi');
        if (data.serviceElectricite) services.push('Électricité');
        if (data.serviceEau) services.push('Eau');
        if (data.serviceMenage) services.push('Ménage');
        if (data.serviceGardien) services.push('Gardiennage');
        if (data.serviceParking) services.push('Parking');
        if (data.serviceLinge) services.push('Linge de maison');
        if (data.serviceClim) services.push('Climatisation');
        
        html += `
    <!-- ARTICLE 1: DÉSIGNATION DU BIEN -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 1</span>
            DÉSIGNATION DU BIEN LOUÉ
        </h3>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Type de bien:</strong> ${data.typeBien || 'Appartement meublé'}</p>
            <p style="margin: 5px 0;"><strong>Adresse:</strong> ${data.adresseBien || '<span style="color:#dc2626;">À compléter</span>'}, ${data.villeBien || 'Dakar'}</p>
            ${data.surface ? `<p style="margin: 5px 0;"><strong>Surface:</strong> ${data.surface} m²</p>` : ''}
            ${data.nombrePieces ? `<p style="margin: 5px 0;"><strong>Nombre de pièces:</strong> ${data.nombrePieces}</p>` : ''}
            ${data.equipements ? `<p style="margin: 5px 0;"><strong>Équipements:</strong> ${data.equipements}</p>` : ''}
        </div>
    </div>

    <!-- ARTICLE 2: DURÉE DU SÉJOUR -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 2</span>
            DURÉE DU SÉJOUR
        </h3>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #fcd34d;">
            <p style="margin: 5px 0;"><strong>Date d'arrivée:</strong> ${dateEntree ? dateEntree.toLocaleDateString('fr-FR') : '<span style="color:#dc2626;">À compléter</span>'}</p>
            <p style="margin: 5px 0;"><strong>Date de départ:</strong> ${dateSortie ? dateSortie.toLocaleDateString('fr-FR') : '<span style="color:#dc2626;">À compléter</span>'}</p>
            <p style="margin: 5px 0;"><strong>Durée:</strong> ${nbJours > 0 ? nbJours + ' jour(s)' : '<span style="color:#dc2626;">À calculer</span>'}</p>
        </div>
        <p style="font-size: 13px;">Heure d'arrivée: 14h00 | Heure de départ: 12h00</p>
    </div>

    <!-- ARTICLE 3: TARIFICATION -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 3</span>
            TARIFICATION
        </h3>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #bbf7d0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                    <td style="padding: 8px 0;">Tarif journalier</td>
                    <td style="text-align: right;">${tarifJour.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">Nombre de jours</td>
                    <td style="text-align: right;">${nbJours} jour(s)</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">Sous-total location</td>
                    <td style="text-align: right; font-weight: bold;">${totalLocation.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">Caution (restituable)</td>
                    <td style="text-align: right;">${caution.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                <tr style="border-top: 2px solid #10b981;">
                    <td style="padding: 12px 0; font-weight: bold; font-size: 15px;">TOTAL À PAYER</td>
                    <td style="text-align: right; font-weight: bold; font-size: 15px; color: #059669;">${(totalLocation + caution).toLocaleString('fr-FR')} FCFA</td>
                </tr>
            </table>
        </div>
    </div>

    <!-- ARTICLE 4: SERVICES INCLUS -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 4</span>
            SERVICES INCLUS
        </h3>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <p style="margin: 0;">${services.length > 0 ? services.join(' • ') : 'Aucun service spécifié'}</p>
        </div>
    </div>

    ${data.conditions ? `
    <!-- CONDITIONS PARTICULIÈRES -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">
            <span style="background: #1e3a8a; color: white; padding: 3px 10px; border-radius: 4px; margin-right: 10px;">ARTICLE 5</span>
            CONDITIONS PARTICULIÈRES
        </h3>
        <p style="text-align: justify; font-size: 13px;">${data.conditions}</p>
    </div>
    ` : ''}`;
    }
    
    // DEVIS
    if (type === 'devis') {
        const lignes = window.devisLignes || [];
        let totalHT = 0;
        
        let lignesHTML = lignes.map(l => {
            const total = (parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnit) || 0);
            totalHT += total;
            return `<tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${l.designation || '-'}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${l.quantite || 0}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${l.unite || 'u'}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right;">${(parseFloat(l.prixUnit) || 0).toLocaleString('fr-FR')}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${total.toLocaleString('fr-FR')}</td>
            </tr>`;
        }).join('');
        
        const remise = totalHT * (parseFloat(data.remise) || 0) / 100;
        const totalApresRemise = totalHT - remise;
        const tva = data.avecTVA ? totalApresRemise * 0.18 : 0;
        const totalTTC = totalApresRemise + tva;
        const acompte = totalTTC * (parseFloat(data.acompte) || 30) / 100;
        
        html += `
    <!-- INFORMATIONS CLIENT -->
    <div style="margin: 30px 0;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h4 style="color: #10b981; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">Client</h4>
            <p style="margin: 5px 0;"><strong>${data.clientNom || '<span style="color:#dc2626;">Nom à compléter</span>'}</strong></p>
            <p style="margin: 5px 0; font-size: 13px;">${data.clientAdresse || '<span style="color:#9ca3af;">Adresse non renseignée</span>'}</p>
            <p style="margin: 5px 0; font-size: 13px;">Tél: ${data.clientTel || '<span style="color:#dc2626;">À compléter</span>'}</p>
            <p style="margin: 5px 0; font-size: 13px;">Email: ${data.clientEmail || '<span style="color:#9ca3af;">Non renseigné</span>'}</p>
        </div>
    </div>

    <!-- OBJET DU DEVIS -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">OBJET DU DEVIS</h3>
        <p style="font-size: 13px;"><strong>${data.objetDevis || 'À définir'}</strong></p>
        ${data.lieuTravaux ? `<p style="font-size: 13px;">Lieu d'intervention: ${data.lieuTravaux}</p>` : ''}
    </div>

    <!-- TABLEAU DES PRESTATIONS -->
    <div style="margin: 25px 0;">
        <h3 style="color: #1e3a8a; font-size: 14px; margin-bottom: 15px;">DÉTAIL DES PRESTATIONS</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="background: #1e3a8a; color: white;">
                    <th style="padding: 12px; text-align: left; border: 1px solid #1e3a8a;">Désignation</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #1e3a8a; width: 60px;">Qté</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #1e3a8a; width: 60px;">Unité</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #1e3a8a; width: 100px;">P.U. (FCFA)</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #1e3a8a; width: 120px;">Total (FCFA)</th>
                </tr>
            </thead>
            <tbody>
                ${lignesHTML || '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #999; border: 1px solid #e2e8f0;">Aucune prestation</td></tr>'}
            </tbody>
        </table>
    </div>

    <!-- TOTAUX -->
    <div style="display: flex; justify-content: flex-end; margin: 25px 0;">
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0; width: 350px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                    <td style="padding: 8px 0;">Total HT</td>
                    <td style="text-align: right;">${totalHT.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                ${remise > 0 ? `
                <tr>
                    <td style="padding: 8px 0;">Remise (${data.remise}%)</td>
                    <td style="text-align: right; color: #dc2626;">-${remise.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                ` : ''}
                ${data.avecTVA ? `
                <tr>
                    <td style="padding: 8px 0;">TVA (18%)</td>
                    <td style="text-align: right;">${tva.toLocaleString('fr-FR')} FCFA</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #10b981;">
                    <td style="padding: 12px 0; font-weight: bold; font-size: 16px;">TOTAL ${data.avecTVA ? 'TTC' : 'HT'}</td>
                    <td style="text-align: right; font-weight: bold; font-size: 16px; color: #059669;">${totalTTC.toLocaleString('fr-FR')} FCFA</td>
                </tr>
            </table>
            <p style="margin: 15px 0 0 0; font-style: italic; font-size: 11px; color: #666;">
                Soit: ${montantEnLettres(Math.round(totalTTC))} francs CFA
            </p>
        </div>
    </div>

    <!-- CONDITIONS -->
    <div style="margin: 25px 0; padding: 20px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h4 style="color: #b45309; margin: 0 0 15px 0; font-size: 14px;">CONDITIONS</h4>
        <ul style="font-size: 13px; margin: 0; padding-left: 20px;">
            <li>Validité du devis: <strong>${data.validite || 30} jours</strong></li>
            <li>Acompte à la commande: <strong>${data.acompte || 30}%</strong> soit ${acompte.toLocaleString('fr-FR')} FCFA</li>
            ${data.delaiExecution ? `<li>Délai d'exécution: <strong>${data.delaiExecution} ${data.uniteDelai || 'jours ouvrés'}</strong></li>` : ''}
            ${data.dateDebut ? `<li>Date de début prévue: <strong>${new Date(data.dateDebut).toLocaleDateString('fr-FR')}</strong></li>` : ''}
        </ul>
    </div>

    ${data.notes ? `
    <div style="margin: 25px 0;">
        <h4 style="color: #1e3a8a; font-size: 14px; margin-bottom: 10px;">Notes</h4>
        <p style="font-size: 13px; color: #666;">${data.notes}</p>
    </div>
    ` : ''}

    <!-- MENTION ACCEPTATION -->
    <div style="margin: 30px 0; padding: 15px; background: #f8fafc; border-radius: 8px; text-align: center;">
        <p style="font-size: 12px; color: #666; margin: 0;">
            Devis reçu avant l'exécution des travaux. Bon pour accord et exécution des travaux.
        </p>
    </div>`;
    }
    
    // ATTESTATION
    if (type === 'attestation') {
        const typeAttestation = {
            'travail': 'Attestation de Travail',
            'domicile': 'Attestation de Domicile',
            'bonne-execution': 'Attestation de Bonne Exécution',
            'paiement': 'Attestation de Paiement',
            'autre': 'Attestation'
        };
        
        html += `
    <!-- INFORMATIONS BÉNÉFICIAIRE -->
    <div style="margin: 30px 0;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h4 style="color: #10b981; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">Bénéficiaire</h4>
            <p style="margin: 5px 0; font-size: 16px;"><strong>${data.clientNom || '<span style="color:#dc2626;">Nom à compléter</span>'}</strong></p>
        </div>
    </div>

    <!-- CORPS DE L'ATTESTATION -->
    <div style="margin: 40px 0;">
        <p style="text-align: justify; font-size: 14px; line-height: 2;">
            Je soussigné, <strong>Le Directeur Général de KFS BTP IMMO</strong>, entreprise spécialisée dans le secteur 
            du Bâtiment, des Travaux Publics et de l'Immobilier, dont le siège social est situé à Villa 123 MC, Quartier Medinacoura, Tambacounda,
            immatriculée au RCCM sous le numéro <strong>SN TBC 2025 M 1361</strong>, NINEA <strong>009468499</strong>,
        </p>
        
        <p style="text-align: center; font-size: 16px; font-weight: bold; color: #1e3a8a; margin: 30px 0; padding: 15px; background: #f8fafc; border-radius: 8px;">
            ATTESTE PAR LA PRÉSENTE QUE
        </p>
        
        <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; border-left: 4px solid #10b981; margin: 30px 0;">
            <p style="text-align: justify; font-size: 14px; line-height: 1.8; margin: 0;">
                ${data.contenuAttestation || '[Contenu de l\'attestation à compléter]'}
            </p>
        </div>
        
        <p style="text-align: justify; font-size: 14px; line-height: 2; margin-top: 30px;">
            Cette attestation est délivrée à <strong>${data.clientNom || '<span style="color:#dc2626;">Bénéficiaire</span>'}</strong>.
        </p>
    </div>`;
    }

    // SIGNATURES
    if (type === 'attestation') {
        // Pour les attestations : seulement la signature de l'émetteur (centrée)
        html += `
    <!-- SIGNATURE ÉMETTEUR UNIQUEMENT -->
    <div style="margin-top: 50px; page-break-inside: avoid;">
        <p style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 13px;">
            Fait à Dakar, le ${dateJour}, en un (1) exemplaire original.
        </p>
        
        <div style="max-width: 300px; margin: 0 auto; text-align: center;">
            <p style="font-weight: bold; color: #1e3a8a; margin-bottom: 15px; font-size: 13px;">L'ÉMETTEUR</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 10px;">KFS BTP IMMO</p>
            <p style="font-size: 12px; margin-bottom: 80px;">Le Directeur Général</p>
            <div style="border-top: 1px solid #333; padding-top: 10px;">
                <p style="font-size: 11px; color: #666; margin: 0;">Signature et cachet</p>
            </div>
        </div>
    </div>`;
    } else {
        // Pour les autres documents : deux signatures
        html += `
    <!-- SIGNATURES -->
    <div style="margin-top: 50px; page-break-inside: avoid;">
        <p style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 13px;">
            Fait à Dakar, le ${dateJour}, en deux (2) exemplaires originaux.
        </p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px;">
            <div style="text-align: center;">
                <p style="font-weight: bold; color: #1e3a8a; margin-bottom: 15px; font-size: 13px;">${type === 'bail' || type === 'location-courte' ? 'LE BAILLEUR' : 'LE PRESTATAIRE'}</p>
                <p style="font-size: 12px; color: #666; margin-bottom: 10px;">KFS BTP IMMO</p>
                <p style="font-size: 12px; margin-bottom: 80px;">Le Directeur Général</p>
                <div style="border-top: 1px solid #333; padding-top: 10px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Signature et cachet</p>
                    <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">(Précédé de la mention "Lu et approuvé")</p>
                </div>
            </div>
            <div style="text-align: center;">
                <p style="font-weight: bold; color: #10b981; margin-bottom: 15px; font-size: 13px;">${type === 'bail' || type === 'location-courte' ? 'LE LOCATAIRE' : type === 'devis' ? 'BON POUR ACCORD' : 'LE CLIENT'}</p>
                <p style="font-size: 12px; color: #666; margin-bottom: 10px;">${data.clientNom || data.locataireNom || '<span style="color:#dc2626;">Nom</span>'}</p>
                <p style="font-size: 12px; margin-bottom: 80px;">&nbsp;</p>
                <div style="border-top: 1px solid #333; padding-top: 10px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Signature</p>
                    <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">(Précédé de la mention "Lu et approuvé")</p>
                </div>
            </div>
        </div>
    </div>`;
    }

    // PIED DE PAGE
    html += `
    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #999;">
        <p style="margin: 0;">
            KFS BTP IMMO - Villa 123 MC, Quartier Medinacoura, Tambacounda | Tél: +221 78 584 28 71 / +33 6 05 84 68 07 | Email: kfsbtpproimmo@gmail.com
        </p>
        <p style="margin: 5px 0 0 0;">
            NINEA: 009468499 | RCCM: SN TBC 2025 M 1361
        </p>
        <p style="margin: 10px 0 0 0; font-style: italic;">
            Document généré le ${dateHeure} - ${isPreview ? 'APERÇU' : numero}
        </p>
    </div>

</div>`;
    
    return html;
}

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

    if (devisLignes.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-4">Aucune ligne de devis</p>';
        return;
    }

    container.innerHTML = devisLignes.map((ligne, i) => `
        <div class="flex items-center space-x-2 py-1 border-b">
            <input type="text" class="input input-sm w-32" placeholder="Désignation" value="${ligne.designation}" onchange="updateDevisLigne(${i}, 'designation', this.value)">
            <input type="number" class="input input-sm w-16" min="0" value="${ligne.quantite}" onchange="updateDevisLigne(${i}, 'quantite', this.value)">
            <input type="text" class="input input-sm w-12" value="${ligne.unite}" onchange="updateDevisLigne(${i}, 'unite', this.value)">
            <input type="number" class="input input-sm w-20" min="0" value="${ligne.prixUnit}" onchange="updateDevisLigne(${i}, 'prixUnit', this.value)">
            <input type="text" class="input input-sm w-24" value="${ligne.categorie}" onchange="updateDevisLigne(${i}, 'categorie', this.value)">
            <input type="text" class="input input-sm w-32" placeholder="Détail" value="${ligne.detail}" onchange="updateDevisLigne(${i}, 'detail', this.value)">
            <button class="btn btn-xs btn-error" onclick="removeDevisLigne(${i})">Supprimer</button>
        </div>
    `).join('') +
    `<div class="text-right font-bold mt-2">Total HT : <span id="devis-total-ht">${totalHT.toFixed(2)} €</span></div>`;
}

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
    
    if (type === 'location-courte') {
        // Infos locataire
        data.locataireNom = data.clientNom;
        data.locataireTel = data.clientTel;
        data.locataireEmail = data.clientEmail;
        data.locataireDateNaissance = document.getElementById('doc-locataire-naissance')?.value || '';
        data.locataireCNI = document.getElementById('doc-locataire-cni')?.value || '';
        data.locataireNationalite = document.getElementById('doc-locataire-nationalite')?.value || 'Sénégalaise';
        data.locataireProfession = document.getElementById('doc-locataire-profession')?.value || '';
        
        // Infos bien
        data.adresseBien = document.getElementById('doc-adresse-bien')?.value || '';
        data.villeBien = document.getElementById('doc-ville-bien')?.value || 'Dakar';
        data.typeBien = document.getElementById('doc-type-bien')?.value || 'Appartement meublé';
        data.nombrePieces = document.getElementById('doc-nb-pieces')?.value || '';
        data.surface = document.getElementById('doc-surface')?.value || '';
        data.equipements = document.getElementById('doc-equipements')?.value || '';
        
        // Durée et tarifs
        data.dateEntree = document.getElementById('doc-date-entree')?.value || '';
        data.dateSortie = document.getElementById('doc-date-sortie')?.value || '';
        data.tarifJour = document.getElementById('doc-tarif-jour')?.value || 0;
        data.caution = document.getElementById('doc-caution')?.value || 0;
        
        // Services inclus
        data.serviceWifi = document.getElementById('doc-service-wifi')?.checked || false;
        data.serviceElectricite = document.getElementById('doc-service-electricite')?.checked || false;
        data.serviceEau = document.getElementById('doc-service-eau')?.checked || false;
        data.serviceMenage = document.getElementById('doc-service-menage')?.checked || false;
        data.serviceGardien = document.getElementById('doc-service-gardien')?.checked || false;
        data.serviceParking = document.getElementById('doc-service-parking')?.checked || false;
        data.serviceLinge = document.getElementById('doc-service-linge')?.checked || false;
        data.serviceClim = document.getElementById('doc-service-clim')?.checked || false;
        
        // Conditions
        data.conditions = document.getElementById('doc-conditions')?.value || '';
    }
    
    if (type === 'attestation') {
        data.beneficiaireNom = data.clientNom;
        data.typeAttestation = document.getElementById('doc-type-attestation')?.value || 'autre';
        data.contenuAttestation = document.getElementById('doc-contenu-attestation')?.value || '';
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

window.clearAllCaches = function() {
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    
    // Vider aussi le localStorage temporaire
    sessionStorage.clear();
    
    showNotification('Cache vidé ! Rechargez la page.', 'success');
    setTimeout(() => location.reload(true), 1500);
};

window.updateServiceWorker = function() {
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
};

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

// ===================================================
// EXPOSITION GLOBALE - Toutes les fonctions onclick
// ===================================================
// Catalogue
window.editAnnonce = typeof editAnnonce !== 'undefined' ? editAnnonce : function(i) { if (typeof openCatalogueModal === 'function') openCatalogueModal(i); };
window.deleteAnnonce = typeof deleteAnnonce !== 'undefined' ? deleteAnnonce : function() {};
window.openImageGallery = window.openImageGallery || function() {};
window.removeCatalogueTempImage = window.removeCatalogueTempImage || function() {};
window.removeCatalogueExistingImage = window.removeCatalogueExistingImage || function() {};

// Carrousel
window.editSlide = typeof editSlide !== 'undefined' ? editSlide : function(i) { if (typeof openCarouselModal === 'function') openCarouselModal(i); };
window.deleteSlide = typeof deleteSlide !== 'undefined' ? deleteSlide : function() {};

// Témoignages
window.editTemoignage = typeof editTemoignage !== 'undefined' ? editTemoignage : function(i) { if (typeof openTemoignageModal === 'function') openTemoignageModal(i); };
window.toggleTemoignage = typeof toggleTemoignage !== 'undefined' ? toggleTemoignage : function() {};
window.deleteTemoignage = typeof deleteTemoignage !== 'undefined' ? deleteTemoignage : function() {};

// FAQ
window.editFaq = typeof editFaq !== 'undefined' ? editFaq : function(i) { if (typeof openFaqModal === 'function') openFaqModal(i); };
window.toggleFaq = typeof toggleFaq !== 'undefined' ? toggleFaq : function() {};
window.deleteFaq = typeof deleteFaq !== 'undefined' ? deleteFaq : function() {};

// Médias
window.deleteMedia = typeof deleteMedia !== 'undefined' ? deleteMedia : function() {};

// Messages
window.markAsRead = typeof markAsRead !== 'undefined' ? markAsRead : function() {};
window.deleteMessage = typeof deleteMessage !== 'undefined' ? deleteMessage : function() {};

// RDV
window.editRdv = window.editRdv || function() {};
window.deleteRdv = window.deleteRdv || function() {};
window.selectCalendarDay = window.selectCalendarDay || function() {};
window.goToToday = window.goToToday || function() { window.selectCalendarDay(new Date().toISOString().split('T')[0]); };

// Comptabilité
window.editCompta = typeof editCompta !== 'undefined' ? editCompta : function() {};
window.deleteCompta = typeof deleteCompta !== 'undefined' ? deleteCompta : function() {};

// Factures
window.viewFacture = typeof viewFacture !== 'undefined' ? viewFacture : function() {};
window.printFacture = typeof printFacture !== 'undefined' ? printFacture : function() {};
window.changeFactureStatus = typeof changeFactureStatus !== 'undefined' ? changeFactureStatus : function() {};
window.deleteFacture = typeof deleteFacture !== 'undefined' ? deleteFacture : function() {};
window.removeFactureLine = typeof removeFactureLine !== 'undefined' ? removeFactureLine : function() {};

// Clients
window.editClient = typeof editClient !== 'undefined' ? editClient : function() {};
window.viewClientHistory = typeof viewClientHistory !== 'undefined' ? viewClientHistory : function() {};
window.addClientInteraction = typeof addClientInteraction !== 'undefined' ? addClientInteraction : function() {};
window.deleteClient = typeof deleteClient !== 'undefined' ? deleteClient : function() {};

// Projets
window.viewProjet = typeof viewProjet !== 'undefined' ? viewProjet : function() {};
window.editProjet = typeof editProjet !== 'undefined' ? editProjet : function() {};
window.addProjetDepense = typeof addProjetDepense !== 'undefined' ? addProjetDepense : function() {};
window.deleteProjet = typeof deleteProjet !== 'undefined' ? deleteProjet : function() {};

// Employés
window.editEmploye = typeof editEmploye !== 'undefined' ? editEmploye : function() {};
window.deleteEmploye = typeof deleteEmploye !== 'undefined' ? deleteEmploye : function() {};
window.viewEmployeFiche = typeof viewEmployeFiche !== 'undefined' ? viewEmployeFiche : function() {};

// Stocks
window.editStock = typeof editStock !== 'undefined' ? editStock : function() {};
window.deleteStock = typeof deleteStock !== 'undefined' ? deleteStock : function() {};
window.adjustStock = typeof adjustStock !== 'undefined' ? adjustStock : function() {};

// Documents
window.editDocument = typeof editDocument !== 'undefined' ? editDocument : function() {};
window.deleteDocument = typeof deleteDocument !== 'undefined' ? deleteDocument : function() {};
window.downloadDocument = typeof downloadDocument !== 'undefined' ? downloadDocument : function() {};

// Fiche de paie - Aperçu modale
window.fermerApercuFichePaie = typeof fermerApercuFichePaie !== 'undefined' ? fermerApercuFichePaie : function() {
    const modal = document.getElementById('modal-apercu-fiche-paie');
    if (modal) { modal.remove(); document.body.style.overflow = ''; }
};

// Modals (déjà exposées mais on renforce)
window.openCatalogueModal = window.openCatalogueModal || function() { console.warn('openCatalogueModal non définie'); };
window.closeCatalogueModal = window.closeCatalogueModal || function() { const m = document.getElementById('catalogue-modal'); if (m) m.classList.add('hidden'); };
window.openCarouselModal = window.openCarouselModal || function() { console.warn('openCarouselModal non définie'); };
window.closeCarouselModal = window.closeCarouselModal || function() { const m = document.getElementById('carousel-modal'); if (m) m.classList.add('hidden'); };
window.openTemoignageModal = window.openTemoignageModal || function() { console.warn('openTemoignageModal non définie'); };
window.closeTemoignageModal = window.closeTemoignageModal || function() { const m = document.getElementById('temoignage-modal'); if (m) m.classList.add('hidden'); };
window.openFaqModal = window.openFaqModal || function() { console.warn('openFaqModal non définie'); };
window.closeFaqModal = window.closeFaqModal || function() { const m = document.getElementById('faq-modal'); if (m) m.classList.add('hidden'); };
window.openMediaModal = window.openMediaModal || function() { console.warn('openMediaModal non définie'); };
window.closeMediaModal = window.closeMediaModal || function() { const m = document.getElementById('media-modal'); if (m) m.classList.add('hidden'); };
window.openRdvModal = window.openRdvModal || function() { console.warn('openRdvModal non définie'); };
window.closeRdvModal = window.closeRdvModal || function() { const m = document.getElementById('rdv-modal'); if (m) m.classList.add('hidden'); };
window.openClientModal = window.openClientModal || function() { console.warn('openClientModal non définie'); };
window.closeClientModal = window.closeClientModal || function() { const m = document.getElementById('client-modal'); if (m) m.classList.add('hidden'); };
window.openProjetModal = window.openProjetModal || function() { console.warn('openProjetModal non définie'); };
window.closeProjetModal = window.closeProjetModal || function() { const m = document.getElementById('projet-modal'); if (m) m.classList.add('hidden'); };
window.openEmployeModal = window.openEmployeModal || function() { console.warn('openEmployeModal non définie'); };
window.closeEmployeModal = window.closeEmployeModal || function() { const m = document.getElementById('employe-modal'); if (m) m.classList.add('hidden'); };
window.openStockModal = window.openStockModal || function() { console.warn('openStockModal non définie'); };
window.closeStockModal = window.closeStockModal || function() { const m = document.getElementById('stock-modal'); if (m) m.classList.add('hidden'); };
window.openDocumentModal = window.openDocumentModal || function() { console.warn('openDocumentModal non définie'); };
window.closeDocumentModal = window.closeDocumentModal || function() { const m = document.getElementById('document-modal'); if (m) m.classList.add('hidden'); };
window.openTransactionModal = window.openTransactionModal || function() { console.warn('openTransactionModal non définie'); };
window.closeTransactionModal = window.closeTransactionModal || function() { const m = document.getElementById('transaction-modal'); if (m) m.classList.add('hidden'); };
window.openFactureModal = window.openFactureModal || function() { console.warn('openFactureModal non définie'); };
window.closeFactureModal = window.closeFactureModal || function() { const m = document.getElementById('facture-modal'); if (m) m.classList.add('hidden'); };

// Notifications
window.showNotification = window.showNotification || function(title, message, type) { console.log(`[${type || 'info'}] ${title}: ${message}`); };

// Utilitaires - fonctions réellement implémentées
window.updateStats = typeof updateStats !== 'undefined' ? updateStats : function() {};
window.renderRecentMessages = typeof renderRecentMessages !== 'undefined' ? renderRecentMessages : function() {};
window.renderMessages = typeof renderMessages !== 'undefined' ? renderMessages : function() {};
window.markAsRead = typeof markAsRead !== 'undefined' ? markAsRead : function() {};
window.deleteMessage = typeof deleteMessage !== 'undefined' ? deleteMessage : function() {};

// Fonctions de rendu principales
window.renderCatalogue = typeof renderCatalogue !== 'undefined' ? renderCatalogue : function() {};
window.renderCarousel = typeof renderCarousel !== 'undefined' ? renderCarousel : function() {};
window.renderTemoignages = typeof renderTemoignages !== 'undefined' ? renderTemoignages : function() {};
window.renderFaq = typeof renderFaq !== 'undefined' ? renderFaq : function() {};
window.renderMedia = typeof renderMedia !== 'undefined' ? renderMedia : function() {};
window.renderComptabilite = typeof renderComptabilite !== 'undefined' ? renderComptabilite : function() {};
window.renderFactures = typeof renderFactures !== 'undefined' ? renderFactures : function() {};
window.renderClients = typeof renderClients !== 'undefined' ? renderClients : function() {};
window.renderProjets = typeof renderProjets !== 'undefined' ? renderProjets : function() {};
window.renderEmployes = typeof renderEmployes !== 'undefined' ? renderEmployes : function() {};
window.renderStocks = typeof renderStocks !== 'undefined' ? renderStocks : function() {};
window.renderDocuments = typeof renderDocuments !== 'undefined' ? renderDocuments : function() {};

// Fonction pour aller au module Fiche de Paie
window.gotoFichePaieModule = function() {
    // Masquer toutes les sections
    const allSections = document.querySelectorAll('.module-section');
    allSections.forEach(s => s.classList.remove('active'));
    
    // Afficher la section fiche de paie
    const fichePaieSection = document.getElementById('module-fiche-paie');
    if (fichePaieSection) {
        fichePaieSection.classList.add('active');
        
        // Initialiser le module si nécessaire
        if (typeof initFicheDePaieModule === 'function') {
            initFicheDePaieModule();
        }
        
        // Mettre à jour le titre de la page
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.innerHTML = '<span class="material-icons mr-3 text-2xl">payments</span>Fiche de Paie';
        }
        
        // Mettre à jour la navigation active
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    } else {
        console.warn('Module fiche-paie non trouvé');
        showNotification('Module non disponible', 'Le module Fiche de paie n\'est pas disponible', 'warning');
    }
};

// Exposer les fonctions fiche de paie
window.initFicheDePaieModule = typeof initFicheDePaieModule !== 'undefined' ? initFicheDePaieModule : function() {};
window.genererFicheDePaiePDF = typeof genererFicheDePaiePDF !== 'undefined' ? genererFicheDePaiePDF : function() {};
window.apercuFicheDePaie = typeof apercuFicheDePaie !== 'undefined' ? apercuFicheDePaie : function() {};
window.enregistrerFicheDePaie = typeof enregistrerFicheDePaie !== 'undefined' ? enregistrerFicheDePaie : function() {};

console.log('✅ KFS BTP Admin: Toutes les fonctions exposées globalement');

// Fin du script principal