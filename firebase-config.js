// =====================================================
// CONFIGURATION FIREBASE - KFS BTP
// =====================================================
// 
// Firebase Realtime Database configuré et prêt !
// 
// =====================================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAaG8hkyEt0AqqZ5wESuzZlqPLYM6mYIyI",
    authDomain: "kfs-btp-sn.firebaseapp.com",
    databaseURL: "https://kfs-btp-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "kfs-btp-sn",
    storageBucket: "kfs-btp-sn.appspot.com",
    messagingSenderId: "208534847953",
    appId: "1:208534847953:web:026a00d91b1834269ca0f0"
};

// Variable globale pour l'état Firebase
let firebaseApp = null;
let firebaseDb = null;
let firebaseAuth = null;
let isFirebaseConfigured = false;

// =====================================================
// INITIALISATION FIREBASE REALTIME DATABASE
// =====================================================
(function() {
    // Vérifier si Firebase est configuré
    if (FIREBASE_CONFIG.apiKey === "VOTRE_API_KEY") {
        console.warn('⚠️ Firebase non configuré - Mode localStorage');
        return;
    }
    
    // Charger les SDK Firebase dans l'ordre correct
    const scripts = [
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-database-compat.js'
    ];
    
    let loaded = 0;
    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loaded++;
            if (loaded === scripts.length) {
                initFirebase();
            }
        };
        document.head.appendChild(script);
    });
})();

function initFirebase() {
    try {
        firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
        firebaseDb = firebase.database();
        firebaseAuth = firebase.auth();
        isFirebaseConfigured = true;
        
        console.log('✅ Firebase Realtime Database initialisé');
        
        // Charger les données depuis Firebase puis synchroniser
        onFirebaseReady();
        
    } catch (error) {
        console.error('❌ Erreur initialisation Firebase:', error);
    }
}

// =====================================================
// SYNCHRONISATION localStorage <-> Firebase Realtime
// =====================================================
async function syncLocalToFirebase() {
    if (!isFirebaseConfigured) return;
    
    const collections = ['annonces', 'messages', 'temoignages', 'clients', 'factures', 'rdv', 'employes', 'fichesPaie', 'documents', 'companyInfo'];
    
    for (const collectionName of collections) {
        const localData = JSON.parse(localStorage.getItem(collectionName) || '[]');
        
        if (localData.length > 0 || (typeof localData === 'object' && Object.keys(localData).length > 0)) {
            console.log(`📤 Sync ${collectionName}`);
            
            try {
                // Pour les tableaux
                if (Array.isArray(localData)) {
                    for (const item of localData) {
                        const itemId = item.id ? String(item.id) : firebaseDb.ref(collectionName).push().key;
                        await firebaseDb.ref(`${collectionName}/${itemId}`).set({
                            ...item,
                            id: itemId,
                            syncedAt: new Date().toISOString()
                        });
                    }
                } else {
                    // Pour les objets simples (comme companyInfo)
                    await firebaseDb.ref(collectionName).set({
                        ...localData,
                        syncedAt: new Date().toISOString()
                    });
                }
            } catch (e) {
                console.warn(`Erreur sync ${collectionName}:`, e);
            }
        }
    }
    
    console.log('✅ Synchronisation terminée');
}

// =====================================================
// API UNIFIÉE : localStorage + Firebase Realtime Database
// =====================================================
const DataStore = {
    // Obtenir tous les éléments d'une collection
    async getAll(collectionName) {
        if (isFirebaseConfigured) {
            try {
                const snapshot = await firebaseDb.ref(collectionName).once('value');
                const data = snapshot.val();
                if (data) {
                    // Convertir l'objet en tableau
                    const dataArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                    // Mettre à jour le localStorage
                    localStorage.setItem(collectionName, JSON.stringify(dataArray));
                    return dataArray;
                }
                return [];
            } catch (e) {
                console.warn('Firebase getAll error, fallback localStorage:', e);
            }
        }
        return JSON.parse(localStorage.getItem(collectionName) || '[]');
    },
    
    // Obtenir un élément par ID
    async getById(collectionName, id) {
        if (isFirebaseConfigured) {
            try {
                const snapshot = await firebaseDb.ref(`${collectionName}/${id}`).once('value');
                if (snapshot.exists()) {
                    return { id: snapshot.key, ...snapshot.val() };
                }
            } catch (e) {
                console.warn('Firebase getById error:', e);
            }
        }
        const data = JSON.parse(localStorage.getItem(collectionName) || '[]');
        return data.find(item => item.id == id);
    },
    
    // Ajouter un élément
    async add(collectionName, item) {
        const newId = item.id || Date.now();
        const newItem = {
            ...item,
            id: newId,
            createdAt: new Date().toISOString()
        };
        
        // Toujours sauvegarder en local
        const data = JSON.parse(localStorage.getItem(collectionName) || '[]');
        data.unshift(newItem);
        localStorage.setItem(collectionName, JSON.stringify(data));
        
        // Sync avec Firebase si configuré
        if (isFirebaseConfigured) {
            try {
                await firebaseDb.ref(`${collectionName}/${newId}`).set(newItem);
                console.log(`✅ ${collectionName} ajouté à Firebase`);
            } catch (e) {
                console.warn('Firebase add error:', e);
            }
        }
        
        return newItem;
    },
    
    // Mettre à jour un élément
    async update(collectionName, id, updates) {
        const updatedData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        // Mettre à jour en local
        const data = JSON.parse(localStorage.getItem(collectionName) || '[]');
        const index = data.findIndex(item => item.id == id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updatedData };
            localStorage.setItem(collectionName, JSON.stringify(data));
        }
        
        // Sync avec Firebase
        if (isFirebaseConfigured) {
            try {
                await firebaseDb.ref(`${collectionName}/${id}`).update(updatedData);
            } catch (e) {
                console.warn('Firebase update error:', e);
            }
        }
        
        return data[index];
    },
    
    // Supprimer un élément
    async delete(collectionName, id) {
        // Supprimer en local
        const data = JSON.parse(localStorage.getItem(collectionName) || '[]');
        const filtered = data.filter(item => item.id != id);
        localStorage.setItem(collectionName, JSON.stringify(filtered));
        
        // Sync avec Firebase
        if (isFirebaseConfigured) {
            try {
                await firebaseDb.ref(`${collectionName}/${id}`).remove();
            } catch (e) {
                console.warn('Firebase delete error:', e);
            }
        }
        
        return true;
    },
    
    // Écouter les changements en temps réel (Firebase uniquement)
    onSnapshot(collectionName, callback) {
        if (!isFirebaseConfigured) {
            console.warn('Firebase non configuré - pas de temps réel');
            return () => {};
        }
        
        const ref = firebaseDb.ref(collectionName);
        const listener = ref.on('value', snapshot => {
            const data = snapshot.val();
            if (data) {
                const dataArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                localStorage.setItem(collectionName, JSON.stringify(dataArray));
                callback(dataArray);
            } else {
                callback([]);
            }
        });
        
        // Retourner une fonction pour désabonner
        return () => ref.off('value', listener);
    },
    
    // Sauvegarder un objet simple (comme companyInfo)
    async saveObject(key, obj) {
        localStorage.setItem(key, JSON.stringify(obj));
        
        if (isFirebaseConfigured) {
            try {
                await firebaseDb.ref(key).set({
                    ...obj,
                    updatedAt: new Date().toISOString()
                });
            } catch (e) {
                console.warn('Firebase saveObject error:', e);
            }
        }
    },
    
    // Charger un objet simple
    async getObject(key) {
        if (isFirebaseConfigured) {
            try {
                const snapshot = await firebaseDb.ref(key).once('value');
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    localStorage.setItem(key, JSON.stringify(data));
                    return data;
                }
            } catch (e) {
                console.warn('Firebase getObject error:', e);
            }
        }
        return JSON.parse(localStorage.getItem(key) || '{}');
    }
};

// =====================================================
// AUTHENTIFICATION FIREBASE
// =====================================================
const Auth = {
    // Connexion avec email/mot de passe
    async login(email, password) {
        if (!isFirebaseConfigured) {
            // Mode local : vérification basique
            const storedPassword = localStorage.getItem('adminPassword');
            if (storedPassword && atob(storedPassword) === password) {
                sessionStorage.setItem('adminAuth', 'true');
                return { success: true, user: { email: 'admin@local' } };
            }
            return { success: false, error: 'Mot de passe incorrect' };
        }
        
        try {
            const result = await firebaseAuth.signInWithEmailAndPassword(email, password);
            sessionStorage.setItem('adminAuth', 'true');
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Déconnexion
    async logout() {
        sessionStorage.removeItem('adminAuth');
        if (isFirebaseConfigured) {
            await firebaseAuth.signOut();
        }
    },
    
    // Vérifier si connecté
    isLoggedIn() {
        return sessionStorage.getItem('adminAuth') === 'true';
    },
    
    // Obtenir l'utilisateur courant
    getCurrentUser() {
        if (isFirebaseConfigured && firebaseAuth.currentUser) {
            return firebaseAuth.currentUser;
        }
        return Auth.isLoggedIn() ? { email: 'admin@local' } : null;
    }
};

// Exporter pour utilisation globale
window.DataStore = DataStore;
window.Auth = Auth;
window.isFirebaseConfigured = () => isFirebaseConfigured;
window.FIREBASE_CONFIG = FIREBASE_CONFIG;

// =====================================================
// SYNCHRONISATION AUTOMATIQUE localStorage → Firebase
// =====================================================
// Intercepte tous les setItem pour synchroniser automatiquement

const SYNC_COLLECTIONS = [
    'annonces', 'messages', 'temoignages', 'clients', 'factures', 
    'rdv', 'employes', 'fichesPaie', 'documents', 'companyInfo',
    'projects', 'comptabilite', 'depenses', 'revenus', 'apporteurs'
];

// Sauvegarder la fonction originale
const originalSetItem = localStorage.setItem.bind(localStorage);
const originalRemoveItem = localStorage.removeItem.bind(localStorage);

// Remplacer setItem pour synchroniser avec Firebase
localStorage.setItem = function(key, value) {
    // Appeler la fonction originale
    originalSetItem(key, value);
    
    // Si Firebase est configuré et que c'est une collection à synchroniser
    if (isFirebaseConfigured && SYNC_COLLECTIONS.includes(key)) {
        try {
            const data = JSON.parse(value);
            
            // Synchroniser vers Firebase
            if (Array.isArray(data)) {
                // Pour les tableaux, synchroniser chaque élément
                const updates = {};
                data.forEach(item => {
                    const itemId = item.id || Date.now();
                    updates[`${key}/${itemId}`] = { ...item, id: itemId };
                });
                
                // Remplacer toute la collection
                firebaseDb.ref(key).set(
                    data.reduce((acc, item) => {
                        const itemId = item.id || Date.now();
                        acc[itemId] = { ...item, id: itemId, syncedAt: new Date().toISOString() };
                        return acc;
                    }, {})
                ).then(() => {
                    console.log(`🔄 ${key} synchronisé avec Firebase`);
                }).catch(e => {
                    console.warn(`Erreur sync ${key}:`, e);
                });
            } else if (typeof data === 'object') {
                // Pour les objets simples
                firebaseDb.ref(key).set({
                    ...data,
                    syncedAt: new Date().toISOString()
                }).then(() => {
                    console.log(`🔄 ${key} synchronisé avec Firebase`);
                }).catch(e => {
                    console.warn(`Erreur sync ${key}:`, e);
                });
            }
        } catch (e) {
            // Pas un JSON valide, ignorer
        }
    }
};

// Remplacer removeItem pour synchroniser les suppressions
localStorage.removeItem = function(key) {
    originalRemoveItem(key);
    
    if (isFirebaseConfigured && SYNC_COLLECTIONS.includes(key)) {
        firebaseDb.ref(key).remove().then(() => {
            console.log(`🗑️ ${key} supprimé de Firebase`);
        }).catch(e => {
            console.warn(`Erreur suppression ${key}:`, e);
        });
    }
};

// =====================================================
// CHARGEMENT DES DONNÉES DEPUIS FIREBASE AU DÉMARRAGE
// =====================================================
async function loadFromFirebase() {
    if (!isFirebaseConfigured) return;
    
    console.log('📥 Chargement des données depuis Firebase...');
    
    for (const collectionName of SYNC_COLLECTIONS) {
        try {
            const snapshot = await firebaseDb.ref(collectionName).once('value');
            const data = snapshot.val();
            
            if (data) {
                if (typeof data === 'object' && !Array.isArray(data)) {
                    // Vérifier si c'est une collection (avec des IDs comme clés) ou un objet simple
                    const keys = Object.keys(data);
                    const isCollection = keys.length > 0 && keys.every(k => !isNaN(k) || k.length > 10);
                    
                    if (isCollection && !['companyInfo'].includes(collectionName)) {
                        // C'est une collection - convertir en tableau
                        const dataArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                        originalSetItem(collectionName, JSON.stringify(dataArray));
                        console.log(`📥 ${collectionName}: ${dataArray.length} éléments chargés`);
                    } else {
                        // C'est un objet simple
                        originalSetItem(collectionName, JSON.stringify(data));
                        console.log(`📥 ${collectionName}: objet chargé`);
                    }
                }
            }
        } catch (e) {
            console.warn(`Erreur chargement ${collectionName}:`, e);
        }
    }
    
    console.log('✅ Données Firebase chargées');
    
    // Déclencher un événement pour notifier que les données sont prêtes
    window.dispatchEvent(new CustomEvent('firebase-data-loaded'));
}

// Appeler après l'initialisation de Firebase
function onFirebaseReady() {
    // D'abord charger depuis Firebase (priorité au cloud)
    loadFromFirebase().then(() => {
        // Puis synchroniser les données locales qui ne sont pas dans Firebase
        syncLocalToFirebase();
    });
}

console.log('🔥 Firebase Auto-Sync activé pour:', SYNC_COLLECTIONS.join(', '));
