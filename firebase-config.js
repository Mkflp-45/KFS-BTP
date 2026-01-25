// =====================================================
// CONFIGURATION FIREBASE - KFS BTP
// =====================================================
// 
// INSTRUCTIONS POUR CONFIGURER FIREBASE :
// 
// 1. Créez un projet sur https://console.firebase.google.com/
// 2. Activez "Firestore Database" (mode test pour commencer)
// 3. Activez "Authentication" > "Email/Password"
// 4. Allez dans Project Settings > General > Your apps > Web app
// 5. Copiez la configuration Firebase ci-dessous
// 
// =====================================================

const FIREBASE_CONFIG = {
    // Remplacez par vos vraies valeurs depuis Firebase Console
    apiKey: "VOTRE_API_KEY",
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Variable globale pour l'état Firebase
let firebaseApp = null;
let firebaseDb = null;
let firebaseAuth = null;
let isFirebaseConfigured = false;

// =====================================================
// INITIALISATION FIREBASE
// =====================================================
(function() {
    // Vérifier si Firebase est configuré
    if (FIREBASE_CONFIG.apiKey === "VOTRE_API_KEY") {
        console.warn('⚠️ Firebase non configuré - Mode localStorage');
        return;
    }
    
    // Charger les SDK Firebase
    const scripts = [
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js'
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
        firebaseDb = firebase.firestore();
        firebaseAuth = firebase.auth();
        isFirebaseConfigured = true;
        
        console.log('✅ Firebase initialisé');
        
        // Synchroniser les données locales vers Firebase
        syncLocalToFirebase();
        
    } catch (error) {
        console.error('❌ Erreur initialisation Firebase:', error);
    }
}

// =====================================================
// SYNCHRONISATION localStorage <-> Firebase
// =====================================================
async function syncLocalToFirebase() {
    if (!isFirebaseConfigured) return;
    
    const collections = ['annonces', 'messages', 'temoignages', 'clients', 'factures', 'rdv'];
    
    for (const collectionName of collections) {
        const localData = JSON.parse(localStorage.getItem(collectionName) || '[]');
        
        if (localData.length > 0) {
            console.log(`📤 Sync ${collectionName}: ${localData.length} items`);
            
            for (const item of localData) {
                try {
                    const docId = item.id ? String(item.id) : firebaseDb.collection(collectionName).doc().id;
                    await firebaseDb.collection(collectionName).doc(docId).set({
                        ...item,
                        syncedAt: new Date().toISOString()
                    }, { merge: true });
                } catch (e) {
                    console.warn(`Erreur sync ${collectionName}:`, e);
                }
            }
        }
    }
    
    console.log('✅ Synchronisation terminée');
}

// =====================================================
// API UNIFIÉE : localStorage ou Firebase
// =====================================================
const DataStore = {
    // Obtenir tous les éléments d'une collection
    async getAll(collectionName) {
        if (isFirebaseConfigured) {
            try {
                const snapshot = await firebaseDb.collection(collectionName).get();
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Mettre à jour le localStorage
                localStorage.setItem(collectionName, JSON.stringify(data));
                return data;
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
                const doc = await firebaseDb.collection(collectionName).doc(String(id)).get();
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
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
        const newItem = {
            ...item,
            id: item.id || Date.now(),
            createdAt: new Date().toISOString()
        };
        
        // Toujours sauvegarder en local
        const data = JSON.parse(localStorage.getItem(collectionName) || '[]');
        data.unshift(newItem);
        localStorage.setItem(collectionName, JSON.stringify(data));
        
        // Sync avec Firebase si configuré
        if (isFirebaseConfigured) {
            try {
                await firebaseDb.collection(collectionName).doc(String(newItem.id)).set(newItem);
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
                await firebaseDb.collection(collectionName).doc(String(id)).update(updatedData);
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
                await firebaseDb.collection(collectionName).doc(String(id)).delete();
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
        
        return firebaseDb.collection(collectionName).onSnapshot(snapshot => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            localStorage.setItem(collectionName, JSON.stringify(data));
            callback(data);
        });
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
