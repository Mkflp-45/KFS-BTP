// =====================================================
// CONFIGURATION EMAILJS - KFS BTP
// =====================================================
// 
// INSTRUCTIONS POUR CONFIGURER EMAILJS :
// 
// 1. Créez un compte gratuit sur https://www.emailjs.com/
// 2. Allez dans "Email Services" et ajoutez votre service email (Gmail, Outlook, etc.)
// 3. Allez dans "Email Templates" et créez un template avec ces variables :
//    - {{from_name}} : Nom de l'expéditeur
//    - {{from_email}} : Email de l'expéditeur
//    - {{phone}} : Téléphone
//    - {{subject}} : Sujet
//    - {{message}} : Message
// 4. Copiez vos identifiants ci-dessous
// 
// =====================================================

const EMAILJS_CONFIG = {
    // ✅ CONFIGURÉ
    PUBLIC_KEY: 'yxVQCoozjUaXnBalb',
    SERVICE_ID: 'service_i1w406r',
    TEMPLATE_ID: 'template_6mxlab7'
};

// Initialisation d'EmailJS
(function() {
    // Charger le SDK EmailJS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = function() {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        console.log('✅ EmailJS initialisé');
    };
    document.head.appendChild(script);
})();

// =====================================================
// FONCTION D'ENVOI D'EMAIL
// =====================================================
async function sendEmail(formData) {
    // Vérifier que EmailJS est chargé
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS non chargé');
        return { success: false, error: 'Service email non disponible' };
    }
    
    // Configuration OK - Envoyer l'email
    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            {
                from_name: formData.nom || formData.name || formData.from_name || 'Visiteur',
                from_email: formData.email || formData.from_email || '',
                phone: formData.telephone || formData.phone || '',
                subject: formData.sujet || formData.subject || 'Message du site',
                message: formData.message || ''
            }
        );
        
        console.log('✅ Email envoyé avec succès', response);
        
        // Sauvegarder aussi en local pour l'admin
        saveToLocalCRM(formData);
        
        return { success: true, response };
        
    } catch (error) {
        console.error('❌ Erreur envoi email:', error);
        
        // Sauvegarder en local même si l'email échoue
        saveToLocalCRM(formData);
        
        return { success: false, error: error.text || error.message };
    }
}

// =====================================================
// MODE SIMULATION (quand EmailJS non configuré)
// =====================================================
function simulateEmail(formData) {
    console.log('📧 Mode simulation - Email "envoyé":', formData);
    
    // Sauvegarder en local
    saveToLocalCRM(formData);
    
    return { 
        success: true, 
        simulated: true,
        message: 'Email simulé (configurez EmailJS pour de vrais envois)' 
    };
}

// =====================================================
// SAUVEGARDE DANS LE CRM LOCAL
// =====================================================
function saveToLocalCRM(formData) {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    const newMessage = {
        id: Date.now(),
        nom: formData.nom || formData.name || 'Anonyme',
        email: formData.email || '',
        telephone: formData.telephone || formData.phone || '',
        sujet: formData.sujet || formData.subject || 'Contact',
        message: formData.message || '',
        date: new Date().toISOString(),
        lu: false,
        source: 'formulaire-site'
    };
    
    messages.unshift(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    console.log('💾 Message sauvegardé dans le CRM local');
    
    return newMessage;
}

// =====================================================
// GESTIONNAIRE DE FORMULAIRES
// =====================================================
function initContactForms() {
    // Formulaire de contact principal
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Formulaires de devis sur les pages services
    document.querySelectorAll('form[data-emailjs="true"]').forEach(form => {
        form.addEventListener('submit', handleContactSubmit);
    });
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    
    // UI Loading
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-pulse">Envoi en cours...</span>';
    }
    
    // Collecter les données du formulaire
    const formData = {};
    new FormData(form).forEach((value, key) => {
        formData[key] = value;
    });
    
    // Ajouter des infos supplémentaires
    formData.page = window.location.pathname;
    formData.date = new Date().toLocaleString('fr-FR');
    
    try {
        const result = await sendEmail(formData);
        
        if (result.success) {
            // Succès
            showFormMessage(form, 'success', '✅ Message envoyé avec succès ! Nous vous répondrons rapidement.');
            form.reset();
        } else {
            // Erreur mais sauvegardé en local
            showFormMessage(form, 'warning', '⚠️ Message enregistré. Nous vous contacterons bientôt.');
        }
        
    } catch (error) {
        showFormMessage(form, 'error', '❌ Erreur. Veuillez réessayer ou nous contacter directement.');
    }
    
    // Restaurer le bouton
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function showFormMessage(form, type, message) {
    // Supprimer les anciens messages
    form.querySelectorAll('.form-message').forEach(el => el.remove());
    
    const colors = {
        success: 'bg-green-100 text-green-700 border-green-300',
        warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        error: 'bg-red-100 text-red-700 border-red-300'
    };
    
    const div = document.createElement('div');
    div.className = `form-message mt-4 p-4 rounded-lg border ${colors[type]} animate__animated animate__fadeIn`;
    div.textContent = message;
    
    form.appendChild(div);
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
        div.classList.add('animate__fadeOut');
        setTimeout(() => div.remove(), 500);
    }, 5000);
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', initContactForms);

// Exporter pour utilisation globale
window.sendEmail = sendEmail;
window.EMAILJS_CONFIG = EMAILJS_CONFIG;
