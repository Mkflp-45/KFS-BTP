// =====================================================
// FIREBASE PUBLIC - Lecture des données pour le site public
// Charge les annonces, témoignages, carousel, FAQ, etc.
// depuis Firebase pour les afficher aux visiteurs
// =====================================================
(function() {
    'use strict';

    // Ne pas charger si firebase-config.js est déjà actif (page admin)
    if (window.DataStore) {
        console.log('⚡ Firebase admin déjà actif, firebase-public ignoré');
        return;
    }

    var FIREBASE_CONFIG = {
        apiKey: "AIzaSyCQ4irjOZQOy3DmpTjmxxUyDXYXbs6En94",
        authDomain: "kfs-btp.firebaseapp.com",
        databaseURL: "https://kfs-btp-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "kfs-btp",
        storageBucket: "kfs-btp.firebasestorage.app",
        messagingSenderId: "932551681151",
        appId: "1:932551681151:web:64ba159486a01de6f3cb4a"
    };

    // Collections publiques à charger (lecture seule)
    var PUBLIC_COLLECTIONS = ['annonces', 'temoignages', 'carousel', 'faq', 'siteSettings', 'media'];

    // Collections qui sont des objets simples (pas des tableaux)
    var OBJECT_COLLECTIONS = ['siteSettings'];

    // Charger les SDK Firebase (app + database uniquement, pas besoin d'auth)
    var sdks = [
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-database-compat.js'
    ];

    var loaded = 0;
    var toLoad = sdks.filter(function(src) {
        return ![].slice.call(document.scripts).some(function(s) { return s.src === src; });
    });

    if (toLoad.length === 0) {
        // SDKs déjà chargés
        setTimeout(initPublicFirebase, 0);
        return;
    }

    toLoad.forEach(function(src) {
        var s = document.createElement('script');
        s.src = src;
        s.async = false;
        s.onload = function() {
            loaded++;
            if (loaded === toLoad.length) initPublicFirebase();
        };
        s.onerror = function() {
            loaded++;
            console.warn('❌ Erreur chargement SDK:', src);
            if (loaded === toLoad.length) initPublicFirebase();
        };
        document.head.appendChild(s);
    });

    function initPublicFirebase() {
        try {
            if (typeof firebase === 'undefined') {
                console.warn('Firebase SDK non disponible');
                return;
            }

            // Initialiser seulement si pas déjà fait
            if (!firebase.apps || !firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }

            var db = firebase.database();
            console.log('🌐 Firebase public initialisé');

            // Vérifier le mode maintenance AVANT de charger les données
            checkMaintenanceMode(db);

            // Charger les données publiques
            loadPublicData(db);

            // Exposer la base de données pour les messages
            window._firebasePublicDb = db;

        } catch(e) {
            console.warn('Erreur init Firebase public:', e);
        }
    }

    function loadPublicData(db) {
        var loadedCount = 0;
        var total = PUBLIC_COLLECTIONS.length;

        PUBLIC_COLLECTIONS.forEach(function(col) {
            db.ref(col).once('value').then(function(snap) {
                var data = snap.val();
                if (data && typeof data === 'object') {
                    if (OBJECT_COLLECTIONS.indexOf(col) !== -1) {
                        // Objet simple (siteSettings, etc.)
                        localStorage.setItem(col, JSON.stringify(data));
                    } else if (Array.isArray(data)) {
                        // Déjà un tableau (sauvé directement)
                        localStorage.setItem(col, JSON.stringify(data));
                    } else {
                        // Objet Firebase → convertir en tableau, filtrer les métadonnées
                        var arr = Object.keys(data)
                            .filter(function(k) { return typeof data[k] === 'object' && data[k] !== null; })
                            .map(function(k) {
                                return Object.assign({ id: k }, data[k]);
                            });
                        localStorage.setItem(col, JSON.stringify(arr));
                    }
                    console.log('📥 ' + col + ': chargé depuis Firebase');
                }
                loadedCount++;
                if (loadedCount === total) {
                    // Toutes les données sont chargées → signaler aux autres scripts
                    console.log('✅ Données publiques Firebase chargées');
                    window.dispatchEvent(new CustomEvent('firebase-data-loaded'));
                }
            }).catch(function(e) {
                console.warn('Erreur chargement ' + col + ':', e);
                loadedCount++;
                if (loadedCount === total) {
                    window.dispatchEvent(new CustomEvent('firebase-data-loaded'));
                }
            });
        });
    }

    // =====================================================
    // SAUVEGARDE DES MESSAGES DE CONTACT VERS FIREBASE
    // =====================================================
    window.saveMessageToFirebase = function(messageData) {
        try {
            var db = window._firebasePublicDb;
            if (!db) {
                // Firebase pas encore prêt, réessayer dans 2s
                setTimeout(function() { window.saveMessageToFirebase(messageData); }, 2000);
                return;
            }
            var newKey = db.ref('messages').push().key;
            db.ref('messages/' + newKey).set(Object.assign({}, messageData, {
                id: newKey,
                createdAt: new Date().toISOString(),
                syncedAt: new Date().toISOString()
            }));
            console.log('📤 Message envoyé à Firebase');
        } catch(e) {
            console.warn('Erreur envoi message Firebase:', e);
        }
    };

    // =====================================================
    // VÉRIFICATION DU MODE MAINTENANCE
    // =====================================================
    function checkMaintenanceMode(db) {
        // Ne pas rediriger si on est déjà sur maintenance.html ou admin.html
        var path = window.location.pathname.toLowerCase();
        if (path.indexOf('maintenance') !== -1 || path.indexOf('admin') !== -1) return;

        db.ref('maintenanceMode').once('value').then(function(snap) {
            var data = snap.val();
            if (data && data.active === true) {
                // Rediriger vers la page de maintenance
                window.location.href = 'maintenance.html';
            }
        }).catch(function() {
            // En cas d'erreur, ne pas bloquer le site
        });
    }

})();
