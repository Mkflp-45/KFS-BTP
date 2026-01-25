// =====================================================
// CONFIGURATION GLOBALE - KFS BTP
// =====================================================
// 
// Ce fichier centralise toutes les configurations du site.
// Modifiez ces valeurs AVANT de publier le site.
// 
// =====================================================

const SITE_CONFIG = {
    // === INFORMATIONS ENTREPRISE ===
    entreprise: {
        nom: "KFS BTP",
        slogan: "Bâtir l'avenir au Sénégal",
        description: "Entreprise de BTP et immobilier au Sénégal. Vente, location, rénovation à Dakar.",
        anneeCreation: 2014,
        gerant: "El Hadji Bacheikhou Kanté",
        ninea: "En cours d'obtention",
        rc: "En cours d'obtention"
    },
    
    // === CONTACT ===
    contact: {
        telephone: "+221 78 584 28 71",
        telephoneWhatsApp: "+221785842871",
        email: "contact@kfs-btp.sn",
        adresse: {
            rue: "Fann Hock",
            ville: "Dakar",
            pays: "Sénégal"
        }
    },
    
    // === SITE WEB ===
    site: {
        url: "https://kfs-btp.sn",
        domaine: "kfs-btp.sn"
    },
    
    // === RÉSEAUX SOCIAUX ===
    reseauxSociaux: {
        facebook: "https://www.facebook.com/kfsbtp",      // À compléter avec votre vraie page
        instagram: "https://www.instagram.com/kfsbtp",    // À compléter
        linkedin: "https://www.linkedin.com/company/kfsbtp"  // À compléter
    },
    
    // === HORAIRES ===
    horaires: {
        semaine: "Lundi - Vendredi: 8h00 - 18h00",
        samedi: "Samedi: 9h00 - 14h00",
        dimanche: "Dimanche: Fermé"
    },
    
    // === SERVICES EXTERNES (À CONFIGURER) ===
    services: {
        // Google Analytics - ✅ CONFIGURÉ
        googleAnalyticsId: "G-F0SXNRNGS1",
        
        // Google Search Console - ✅ CONFIGURÉ
        googleSiteVerification: "oy3NvVwRaOri6w8iCcRwmjWWKlH3Y70VtY6vdrThE04",
        
        // EmailJS - ✅ CONFIGURÉ
        emailjs: {
            publicKey: "yxVQCoozjUaXnBalb",
            serviceId: "service_i1w406r",
            templateId: "template_6mxlab7"
        },
        
        // Firebase (optionnel) - https://console.firebase.google.com/
        firebase: {
            configured: false,  // Mettre true après configuration
            apiKey: "VOTRE_API_KEY",
            authDomain: "votre-projet.firebaseapp.com",
            projectId: "votre-projet"
        }
    }
};

// === HELPER FUNCTIONS ===

// Vérifier si les services sont configurés
function isGoogleAnalyticsConfigured() {
    return SITE_CONFIG.services.googleAnalyticsId !== "G-XXXXXXXXXX";
}

function isEmailJSConfigured() {
    return SITE_CONFIG.services.emailjs.publicKey !== "VOTRE_PUBLIC_KEY";
}

function isFirebaseConfigured() {
    return SITE_CONFIG.services.firebase.configured;
}

// Afficher les alertes de configuration manquante (en mode dev)
function checkConfiguration() {
    const warnings = [];
    
    if (!isGoogleAnalyticsConfigured()) {
        warnings.push("⚠️ Google Analytics non configuré");
    }
    if (!isEmailJSConfigured()) {
        warnings.push("⚠️ EmailJS non configuré - Les formulaires de contact ne fonctionneront pas");
    }
    if (SITE_CONFIG.entreprise.ninea === "[À COMPLÉTER]") {
        warnings.push("⚠️ NINEA de l'entreprise non renseigné");
    }
    if (SITE_CONFIG.contact.adresse.rue === "[Adresse complète à compléter]") {
        warnings.push("⚠️ Adresse complète non renseignée");
    }
    
    if (warnings.length > 0 && window.location.hostname === 'localhost') {
        console.group("🔧 Configuration KFS BTP");
        warnings.forEach(w => console.warn(w));
        console.log("📄 Modifiez le fichier site-config.js pour compléter la configuration");
        console.groupEnd();
    }
    
    return warnings;
}

// Exécuter la vérification au chargement
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', checkConfiguration);
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SITE_CONFIG;
}
