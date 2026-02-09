// Script pour KFS BTP

// Marquer que le gestionnaire WhatsApp est actif (évite conflit avec utils.js)
window.whatsappFormHandlerActive = true;

// Note: Le menu mobile et l'année sont gérés par fragments.js après injection du header

// Gestion des formulaires - Envoi vers WhatsApp Direct
document.querySelectorAll('form').forEach(form => {
    // Ignorer les formulaires admin ou de recherche
    if (form.closest('#dashboard-container') || form.closest('.filters')) return;
    
    // Marquer le formulaire comme géré par WhatsApp
    form.dataset.whatsapp = 'true';
    form.dataset.handled = 'true';
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const telInput = form.querySelector('input[type="tel"]');
        const messageInput = form.querySelector('textarea');
        const serviceInput = form.querySelector('select');
        
        let valid = true;
        let errorMsg = '';
        
        // Validation email
        if (emailInput && !/^\S+@\S+\.\S+$/.test(emailInput.value)) {
            valid = false;
            errorMsg += 'Veuillez entrer un email valide.\n';
        }
        // Validation téléphone
        if (telInput && !/^[0-9\s+()-]{6,}$/.test(telInput.value)) {
            valid = false;
            errorMsg += 'Veuillez entrer un numéro de téléphone valide.\n';
        }
        // Validation message
        if (messageInput && messageInput.value.trim().length < 10) {
            valid = false;
            errorMsg += 'Le message doit contenir au moins 10 caractères.\n';
        }
        
        if (!valid) {
            alert(errorMsg);
            return;
        }
        
        // Préparer les données
        const nom = nameInput ? nameInput.value : 'Visiteur';
        const email = emailInput ? emailInput.value : 'Non fourni';
        const telephone = telInput ? telInput.value : 'Non fourni';
        const sujet = serviceInput ? serviceInput.value : 'Contact';
        const message = messageInput ? messageInput.value : '';
        
        // Sauvegarder en local pour l'admin (backup)
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.unshift({
            name: nom,
            email: email,
            phone: telephone,
            message: message,
            service: sujet,
            date: new Date().toISOString(),
            read: false
        });
        localStorage.setItem('messages', JSON.stringify(messages));
        
        // Créer le message WhatsApp
        const whatsappMessage = `🏗️ *NOUVEAU CONTACT - KFS BTP*
        
👤 *Nom:* ${nom}
📧 *Email:* ${email}
📱 *Téléphone:* ${telephone}
📋 *Sujet:* ${sujet}

💬 *Message:*
${message}

---
_Envoyé depuis kfs-btp.com_`;

        // Numéro WhatsApp KFS BTP (sans le +)
        const whatsappNumber = '221785842871';
        
        // Ouvrir WhatsApp
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappURL, '_blank');
        
        // Message de confirmation
        form.reset();
        const successMsg = form.querySelector('#contact-success');
        if (successMsg) {
            successMsg.classList.remove('hidden');
            setTimeout(() => successMsg.classList.add('hidden'), 6000);
        } else {
            const confirmDiv = document.createElement('div');
            confirmDiv.textContent = '✅ Redirection vers WhatsApp... Envoyez le message pour nous contacter !';
            confirmDiv.className = 'bg-green-100 text-green-800 p-4 rounded-lg mt-4 text-center animate__animated animate__fadeIn';
            form.parentNode.insertBefore(confirmDiv, form.nextSibling);
            setTimeout(() => confirmDiv.remove(), 6000);
        }
    });
});

// Animation au scroll (simple)
(function() {
    const observerOptions = {
        threshold: 0.1
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    }, observerOptions);
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
})();