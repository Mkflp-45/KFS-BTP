/* ============================================================
   KFS BTP IMMO — Moteur Documentaire Professionnel
   documents.js — Moteur unique, dynamique, scalable
   
   Architecture :
   ┌─ DOCUMENT_TYPES    → Registre central de tous les types
   ├─ FormEngine        → Génération dynamique des formulaires
   ├─ DocRenderer       → Rendu HTML A4 professionnel
   ├─ DocHistory        → Historique localStorage
   ├─ DocExport         → Export PDF / impression
   └─ DocEngine         → Orchestrateur principal
   ============================================================ */

(function() {
'use strict';

// ═══════════════════════════════════════════════════
// 1. CONFIGURATION ENTREPRISE
// ═══════════════════════════════════════════════════

var COMPANY = {
    nom: 'KFS BTP IMMO',
    slogan: 'B\u00e2timent \u2013 Travaux Publics \u2013 Immobilier',
    adresse: 'Villa 123 MC, Quartier Medinacoura, Tambacounda, S\u00e9n\u00e9gal',
    telephone: '+221 78 584 28 71',
    email: 'kfsbtpproimmo@gmail.com',
    ninea: '009468499',
    rccm: 'SN TBC 2025 M 1361',
    ville: 'Tambacounda',
    pays: 'S\u00e9n\u00e9gal',
    gerant: 'Directeur G\u00e9n\u00e9ral'
};

// Essayer de charger depuis SITE_CONFIG si disponible
if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.entreprise) {
    var sc = SITE_CONFIG;
    COMPANY.nom = sc.entreprise.nom || COMPANY.nom;
    COMPANY.slogan = sc.entreprise.slogan || COMPANY.slogan;
    COMPANY.ninea = sc.entreprise.ninea || COMPANY.ninea;
    COMPANY.rccm = sc.entreprise.rccm || COMPANY.rccm;
    COMPANY.gerant = sc.entreprise.gerant || COMPANY.gerant;
    if (sc.contact) {
        COMPANY.telephone = sc.contact.telephone || COMPANY.telephone;
        COMPANY.email = sc.contact.email || COMPANY.email;
        if (sc.contact.adresse) {
            COMPANY.adresse = (sc.contact.adresse.rue || '') + ', ' + (sc.contact.adresse.ville || '') + ', ' + (sc.contact.adresse.pays || '');
            COMPANY.ville = sc.contact.adresse.ville || COMPANY.ville;
            COMPANY.pays = sc.contact.adresse.pays || COMPANY.pays;
        }
    }
}

// ═══════════════════════════════════════════════════
// 2. REGISTRE CENTRAL DES TYPES DE DOCUMENTS
// ═══════════════════════════════════════════════════

var DOCUMENT_TYPES = {

    // ─── DEVIS ───
    devis: {
        label: 'Devis',
        icon: 'request_quote',
        category: 'commercial',
        watermark: 'DEVIS',
        titleText: 'DEVIS',
        hasLineItems: true,
        hasParties: true,
        hasMentions: true,
        hasArticles: false,
        lineItemColumns: ['D\u00e9signation', 'Quantit\u00e9', 'Prix unitaire (FCFA)', 'Montant (FCFA)'],
        fields: [
            { section: 'Informations du devis', icon: 'info' },
            { id: 'numero', label: 'N\u00b0 du devis', type: 'text', placeholder: 'DEV-2026-001', required: true },
            { id: 'date', label: 'Date', type: 'date', required: true },
            { id: 'validite', label: 'Validit\u00e9 (jours)', type: 'number', placeholder: '30', value: '30' },
            { id: 'objet', label: 'Objet du devis', type: 'text', placeholder: 'Travaux de r\u00e9novation...', required: true, fullWidth: true },
            { section: 'Client', icon: 'person' },
            { id: 'client_nom', label: 'Nom / Raison sociale', type: 'text', required: true },
            { id: 'client_adresse', label: 'Adresse', type: 'text' },
            { id: 'client_telephone', label: 'T\u00e9l\u00e9phone', type: 'tel' },
            { id: 'client_email', label: 'Email', type: 'email' },
            { section: 'Conditions', icon: 'gavel' },
            { id: 'conditions_paiement', label: 'Conditions de paiement', type: 'text', placeholder: '50% \u00e0 la commande, 50% \u00e0 la livraison' },
            { id: 'delai_execution', label: 'D\u00e9lai d\'ex\u00e9cution', type: 'text', placeholder: '15 jours ouvr\u00e9s' },
            { id: 'notes', label: 'Notes / Observations', type: 'textarea', fullWidth: true }
        ],
        mentions: [
            'Ce devis est valable pour la dur\u00e9e indiqu\u00e9e \u00e0 compter de sa date d\'\u00e9mission.',
            'Les prix sont exprim\u00e9s en Francs CFA (FCFA), hors taxes.',
            'Tout devis sign\u00e9 vaut bon de commande et engage les deux parties.',
            'Les travaux d\u00e9buteront apr\u00e8s r\u00e9ception de l\'acompte convenu.'
        ],
        signatures: [
            { label: 'L\'entreprise', name: COMPANY.nom, fonction: COMPANY.gerant },
            { label: 'Le client', name: '____________________', fonction: 'Bon pour accord' }
        ]
    },

    // ─── LOCATION COURTE DUR\u00c9E ───
    location_courte: {
        label: 'Location courte dur\u00e9e',
        icon: 'hotel',
        category: 'immobilier',
        watermark: 'KFS BTP',
        titleText: 'CONTRAT DE LOCATION COURTE DUR\u00c9E',
        hasLineItems: false,
        hasParties: true,
        hasMentions: true,
        hasArticles: true,
        fields: [
            { section: 'Informations du contrat', icon: 'info' },
            { id: 'numero', label: 'N\u00b0 du contrat', type: 'text', placeholder: 'LC-2026-001', required: true },
            { id: 'date', label: 'Date du contrat', type: 'date', required: true },
            { section: 'Locataire', icon: 'person' },
            { id: 'locataire_nom', label: 'Nom complet', type: 'text', required: true },
            { id: 'locataire_cni', label: 'N\u00b0 CNI / Passeport', type: 'text', required: true },
            { id: 'locataire_telephone', label: 'T\u00e9l\u00e9phone', type: 'tel' },
            { id: 'locataire_adresse', label: 'Adresse', type: 'text' },
            { section: 'Bien lou\u00e9', icon: 'home' },
            { id: 'bien_designation', label: 'D\u00e9signation du bien', type: 'text', required: true, placeholder: 'Appartement meubl\u00e9 T3' },
            { id: 'bien_adresse', label: 'Adresse du bien', type: 'text', required: true },
            { id: 'bien_description', label: 'Description / \u00c9quipements', type: 'textarea', fullWidth: true },
            { section: 'Conditions de location', icon: 'event' },
            { id: 'date_debut', label: 'Date d\'entr\u00e9e', type: 'date', required: true },
            { id: 'date_fin', label: 'Date de sortie', type: 'date', required: true },
            { id: 'montant_total', label: 'Montant total (FCFA)', type: 'number', required: true },
            { id: 'caution', label: 'Caution (FCFA)', type: 'number' },
            { id: 'mode_paiement', label: 'Mode de paiement', type: 'select', options: ['Esp\u00e8ces', 'Virement', 'Ch\u00e8que', 'Mobile Money'] }
        ],
        articles: [
            { title: 'Objet du contrat', content: 'Le bailleur met \u00e0 la disposition du locataire le bien d\u00e9sign\u00e9 ci-dessus, pour une dur\u00e9e d\u00e9termin\u00e9e.' },
            { title: 'Dur\u00e9e', content: 'La location est consentie pour la p\u00e9riode allant du {date_debut} au {date_fin}.' },
            { title: 'Loyer et paiement', content: 'Le montant total de la location est fix\u00e9 \u00e0 {montant_total} FCFA, payable selon le mode de paiement convenu.' },
            { title: 'Caution', content: 'Une caution de {caution} FCFA est vers\u00e9e par le locataire. Elle sera restitu\u00e9e dans un d\u00e9lai de 7 jours apr\u00e8s l\'\u00e9tat des lieux de sortie, d\u00e9duction faite des \u00e9ventuelles d\u00e9gradations.' },
            { title: 'Obligations du locataire', content: 'Le locataire s\'engage \u00e0 : utiliser le bien en bon p\u00e8re de famille, ne pas sous-louer sans autorisation, signaler toute d\u00e9gradation, restituer le bien dans l\'\u00e9tat o\u00f9 il l\'a re\u00e7u.' },
            { title: 'R\u00e9siliation', content: 'En cas de non-respect des clauses du pr\u00e9sent contrat, celui-ci pourra \u00eatre r\u00e9sili\u00e9 de plein droit, sans pr\u00e9avis ni indemnit\u00e9.' }
        ],
        mentions: [
            'Ce contrat est soumis aux dispositions du Code des Obligations Civiles et Commerciales du S\u00e9n\u00e9gal.',
            'Tout litige sera soumis aux tribunaux comp\u00e9tents de ' + COMPANY.ville + '.'
        ],
        signatures: [
            { label: 'Le bailleur', name: COMPANY.nom, fonction: COMPANY.gerant },
            { label: 'Le locataire', name: '', fonction: 'Lu et approuv\u00e9' }
        ]
    },

    // ─── LOCATION LONGUE DUR\u00c9E ───
    location_longue: {
        label: 'Location longue dur\u00e9e',
        icon: 'apartment',
        category: 'immobilier',
        watermark: 'KFS BTP',
        titleText: 'CONTRAT DE LOCATION LONGUE DUR\u00c9E',
        hasLineItems: false,
        hasParties: true,
        hasMentions: true,
        hasArticles: true,
        fields: [
            { section: 'Informations du contrat', icon: 'info' },
            { id: 'numero', label: 'N\u00b0 du contrat', type: 'text', placeholder: 'LL-2026-001', required: true },
            { id: 'date', label: 'Date du contrat', type: 'date', required: true },
            { section: 'Locataire', icon: 'person' },
            { id: 'locataire_nom', label: 'Nom complet', type: 'text', required: true },
            { id: 'locataire_cni', label: 'N\u00b0 CNI / Passeport', type: 'text', required: true },
            { id: 'locataire_telephone', label: 'T\u00e9l\u00e9phone', type: 'tel' },
            { id: 'locataire_adresse', label: 'Adresse actuelle', type: 'text' },
            { id: 'locataire_profession', label: 'Profession', type: 'text' },
            { section: 'Bien lou\u00e9', icon: 'home' },
            { id: 'bien_designation', label: 'D\u00e9signation', type: 'text', required: true, placeholder: 'Villa 4 pi\u00e8ces avec jardin' },
            { id: 'bien_adresse', label: 'Adresse du bien', type: 'text', required: true },
            { id: 'bien_surface', label: 'Surface (m\u00b2)', type: 'number' },
            { id: 'bien_description', label: 'Description d\u00e9taill\u00e9e', type: 'textarea', fullWidth: true },
            { section: 'Conditions financi\u00e8res', icon: 'payments' },
            { id: 'loyer_mensuel', label: 'Loyer mensuel (FCFA)', type: 'number', required: true },
            { id: 'charges', label: 'Charges mensuelles (FCFA)', type: 'number', value: '0' },
            { id: 'caution', label: 'Caution / D\u00e9p\u00f4t de garantie (FCFA)', type: 'number', required: true },
            { id: 'avance', label: 'Avance sur loyer (mois)', type: 'number', value: '2' },
            { id: 'mode_paiement', label: 'Mode de paiement', type: 'select', options: ['Esp\u00e8ces', 'Virement', 'Ch\u00e8que', 'Mobile Money'] },
            { id: 'jour_paiement', label: 'Jour de paiement', type: 'number', placeholder: '5', value: '5' },
            { section: 'Dur\u00e9e et dates', icon: 'event' },
            { id: 'date_debut', label: 'Date de d\u00e9but', type: 'date', required: true },
            { id: 'duree', label: 'Dur\u00e9e (ann\u00e9es)', type: 'number', value: '1' },
            { id: 'renouvelable', label: 'Renouvelable', type: 'select', options: ['Oui', 'Non'] }
        ],
        articles: [
            { title: 'Objet', content: 'Le bailleur donne en location au locataire le bien immobilier d\u00e9sign\u00e9 ci-dessus, \u00e0 usage exclusif d\'habitation.' },
            { title: 'Dur\u00e9e', content: 'Le pr\u00e9sent bail est consenti pour une dur\u00e9e de {duree} an(s) \u00e0 compter du {date_debut}, renouvelable par tacite reconduction sauf cong\u00e9 donn\u00e9 dans les formes l\u00e9gales.' },
            { title: 'Loyer', content: 'Le loyer mensuel est fix\u00e9 \u00e0 {loyer_mensuel} FCFA, charges de {charges} FCFA en sus, payable d\'avance le {jour_paiement} de chaque mois.' },
            { title: 'D\u00e9p\u00f4t de garantie', content: 'Le locataire verse un d\u00e9p\u00f4t de garantie de {caution} FCFA, restituable en fin de bail apr\u00e8s \u00e9tat des lieux de sortie.' },
            { title: 'Obligations du locataire', content: 'Le locataire s\'engage \u00e0 :\n\u2022 Payer le loyer aux \u00e9ch\u00e9ances convenues\n\u2022 Entretenir le bien en bon \u00e9tat\n\u2022 Ne pas transformer les lieux sans autorisation \u00e9crite\n\u2022 Ne pas sous-louer sans accord pr\u00e9alable\n\u2022 Souscrire une assurance habitation' },
            { title: 'Obligations du bailleur', content: 'Le bailleur s\'engage \u00e0 :\n\u2022 D\u00e9livrer le bien en bon \u00e9tat\n\u2022 Effectuer les r\u00e9parations \u00e0 sa charge (gros \u0153uvre)\n\u2022 Garantir la jouissance paisible du bien\n\u2022 Fournir les quittances de loyer' },
            { title: '\u00c9tat des lieux', content: 'Un \u00e9tat des lieux contradictoire sera \u00e9tabli \u00e0 l\'entr\u00e9e et \u00e0 la sortie du locataire.' },
            { title: 'R\u00e9siliation', content: 'Le bail pourra \u00eatre r\u00e9sili\u00e9 par l\'une ou l\'autre des parties moyennant un pr\u00e9avis de trois (3) mois, adress\u00e9 par courrier recommand\u00e9. En cas de non-paiement de deux loyers cons\u00e9cutifs, le bail sera r\u00e9sili\u00e9 de plein droit.' },
            { title: 'Loi applicable', content: 'Le pr\u00e9sent contrat est r\u00e9gi par la loi s\u00e9n\u00e9galaise, notamment le d\u00e9cret n\u00b0 81-1035 du 2 novembre 1981 et le Code des Obligations Civiles et Commerciales.' }
        ],
        mentions: [
            'Contrat \u00e9tabli en deux exemplaires originaux.',
            'Chaque partie reconna\u00eet avoir re\u00e7u un exemplaire du pr\u00e9sent contrat.'
        ],
        signatures: [
            { label: 'Le bailleur', name: COMPANY.nom, fonction: COMPANY.gerant },
            { label: 'Le locataire', name: '', fonction: 'Lu et approuv\u00e9' }
        ]
    },

    // ─── CONTRAT DE PRESTATION DE SERVICE ───
    contrat_prestation: {
        label: 'Contrat de prestation de service',
        icon: 'handshake',
        category: 'commercial',
        watermark: 'KFS BTP',
        titleText: 'CONTRAT DE PRESTATION DE SERVICE',
        hasLineItems: false,
        hasParties: true,
        hasMentions: true,
        hasArticles: true,
        fields: [
            { section: 'Informations du contrat', icon: 'info' },
            { id: 'numero', label: 'N\u00b0 du contrat', type: 'text', placeholder: 'CPS-2026-001', required: true },
            { id: 'date', label: 'Date du contrat', type: 'date', required: true },
            { section: 'Le client (Donneur d\'ordre)', icon: 'person' },
            { id: 'client_nom', label: 'Nom / Raison sociale', type: 'text', required: true },
            { id: 'client_adresse', label: 'Adresse', type: 'text' },
            { id: 'client_telephone', label: 'T\u00e9l\u00e9phone', type: 'tel' },
            { id: 'client_representant', label: 'Repr\u00e9sentant', type: 'text' },
            { section: 'D\u00e9tails de la prestation', icon: 'build' },
            { id: 'objet', label: 'Objet de la prestation', type: 'textarea', required: true, fullWidth: true, placeholder: 'D\u00e9crire la nature des travaux ou services...' },
            { id: 'lieu', label: 'Lieu d\'ex\u00e9cution', type: 'text' },
            { id: 'date_debut', label: 'Date de d\u00e9but', type: 'date', required: true },
            { id: 'date_fin', label: 'Date de fin pr\u00e9vue', type: 'date' },
            { id: 'duree', label: 'Dur\u00e9e', type: 'text', placeholder: '3 mois' },
            { section: 'Conditions financi\u00e8res', icon: 'payments' },
            { id: 'montant_total', label: 'Montant total HT (FCFA)', type: 'number', required: true },
            { id: 'tva', label: 'TVA (%)', type: 'number', value: '18' },
            { id: 'acompte', label: 'Acompte (%)', type: 'number', value: '30' },
            { id: 'conditions_paiement', label: 'Modalit\u00e9s de paiement', type: 'textarea', fullWidth: true, placeholder: '30% \u00e0 la signature, 40% \u00e0 mi-parcours, 30% \u00e0 la r\u00e9ception' },
            { section: 'Garanties', icon: 'verified' },
            { id: 'garantie', label: 'P\u00e9riode de garantie', type: 'text', placeholder: '12 mois' },
            { id: 'penalites', label: 'P\u00e9nalit\u00e9s de retard', type: 'text', placeholder: '1% par semaine de retard' }
        ],
        articles: [
            { title: 'Objet du contrat', content: 'Le prestataire s\'engage \u00e0 r\u00e9aliser pour le compte du client la prestation suivante :\n{objet}' },
            { title: 'Dur\u00e9e et calendrier', content: 'La prestation d\u00e9butera le {date_debut} pour une dur\u00e9e de {duree}. La date de fin pr\u00e9visionnelle est fix\u00e9e au {date_fin}.' },
            { title: 'Prix et modalit\u00e9s de paiement', content: 'Le prix total de la prestation est fix\u00e9 \u00e0 {montant_total} FCFA HT, soit {montant_ttc} FCFA TTC (TVA {tva}%).\n\nModalit\u00e9s de paiement :\n{conditions_paiement}' },
            { title: 'Obligations du prestataire', content: 'Le prestataire s\'engage \u00e0 :\n\u2022 Ex\u00e9cuter la prestation dans les r\u00e8gles de l\'art\n\u2022 Respecter les d\u00e9lais convenus\n\u2022 Informer le client de toute difficult\u00e9\n\u2022 Fournir les rapports d\'avancement demand\u00e9s' },
            { title: 'Obligations du client', content: 'Le client s\'engage \u00e0 :\n\u2022 Fournir les acc\u00e8s et informations n\u00e9cessaires\n\u2022 R\u00e9gler les montants aux \u00e9ch\u00e9ances convenues\n\u2022 R\u00e9ceptionner les travaux dans les d\u00e9lais convenus' },
            { title: 'R\u00e9ception des travaux', content: 'La r\u00e9ception des travaux fera l\'objet d\'un proc\u00e8s-verbal sign\u00e9 par les deux parties. Le client dispose de {garantie} pour signaler tout d\u00e9faut ou malfacon.' },
            { title: 'P\u00e9nalit\u00e9s', content: 'En cas de retard dans l\'ex\u00e9cution, des p\u00e9nalit\u00e9s de {penalites} seront appliqu\u00e9es, plafonn\u00e9es \u00e0 10% du montant total du contrat.' },
            { title: 'R\u00e9siliation', content: 'Chaque partie peut r\u00e9silier le contrat en cas de manquement grave de l\'autre partie, apr\u00e8s mise en demeure rest\u00e9e infructueuse pendant 15 jours.' },
            { title: 'Litiges', content: 'En cas de diff\u00e9rend, les parties s\'efforceront de trouver une solution amiable. \u00c0 d\u00e9faut, le litige sera port\u00e9 devant les tribunaux comp\u00e9tents de ' + COMPANY.ville + '.' }
        ],
        mentions: [
            'Contrat \u00e9tabli en deux exemplaires originaux, un pour chaque partie.',
            'Les annexes \u00e9ventuelles font partie int\u00e9grante du pr\u00e9sent contrat.'
        ],
        signatures: [
            { label: 'Le prestataire', name: COMPANY.nom, fonction: COMPANY.gerant },
            { label: 'Le client', name: '', fonction: 'Lu et approuv\u00e9' }
        ]
    },

    // ─── CONTRAT DE BAIL ───
    contrat_bail: {
        label: 'Contrat de bail',
        icon: 'gavel',
        category: 'immobilier',
        watermark: 'BAIL',
        titleText: 'CONTRAT DE BAIL',
        hasLineItems: false,
        hasParties: true,
        hasMentions: true,
        hasArticles: true,
        fields: [
            { section: 'Informations du bail', icon: 'info' },
            { id: 'numero', label: 'N\u00b0 du bail', type: 'text', placeholder: 'BAIL-2026-001', required: true },
            { id: 'date', label: 'Date', type: 'date', required: true },
            { id: 'type_bail', label: 'Type de bail', type: 'select', options: ['Bail d\'habitation', 'Bail commercial', 'Bail professionnel'] },
            { section: 'Locataire / Preneur', icon: 'person' },
            { id: 'locataire_nom', label: 'Nom complet', type: 'text', required: true },
            { id: 'locataire_cni', label: 'N\u00b0 CNI / Passeport', type: 'text' },
            { id: 'locataire_telephone', label: 'T\u00e9l\u00e9phone', type: 'tel' },
            { id: 'locataire_profession', label: 'Profession', type: 'text' },
            { id: 'locataire_adresse', label: 'Adresse actuelle', type: 'text' },
            { section: 'D\u00e9signation des lieux', icon: 'home' },
            { id: 'bien_designation', label: 'D\u00e9signation', type: 'text', required: true },
            { id: 'bien_adresse', label: 'Adresse du bien', type: 'text', required: true },
            { id: 'bien_surface', label: 'Surface (m\u00b2)', type: 'number' },
            { id: 'bien_composition', label: 'Composition', type: 'textarea', placeholder: '3 chambres, 1 salon, 1 cuisine, 2 SDB', fullWidth: true },
            { section: 'Conditions financi\u00e8res', icon: 'payments' },
            { id: 'loyer_mensuel', label: 'Loyer mensuel (FCFA)', type: 'number', required: true },
            { id: 'charges', label: 'Charges (FCFA)', type: 'number', value: '0' },
            { id: 'caution', label: 'D\u00e9p\u00f4t de garantie (FCFA)', type: 'number', required: true },
            { id: 'avance', label: 'Avance (mois)', type: 'number', value: '2' },
            { id: 'mode_paiement', label: 'Mode de paiement', type: 'select', options: ['Esp\u00e8ces', 'Virement', 'Ch\u00e8que', 'Mobile Money'] },
            { id: 'jour_paiement', label: 'Jour de paiement', type: 'number', value: '5' },
            { section: 'Dur\u00e9e', icon: 'event' },
            { id: 'date_debut', label: 'Date d\'effet', type: 'date', required: true },
            { id: 'duree', label: 'Dur\u00e9e (ann\u00e9es)', type: 'number', value: '1' }
        ],
        articles: [
            { title: 'Objet', content: 'Le bailleur donne \u00e0 bail au preneur, qui accepte, les locaux d\u00e9sign\u00e9s ci-dessus, \u00e0 usage de {type_bail}.' },
            { title: 'Dur\u00e9e', content: 'Le pr\u00e9sent bail est consenti pour une dur\u00e9e de {duree} an(s) commen\u00e7ant le {date_debut}, renouvelable par tacite reconduction.' },
            { title: 'Loyer', content: 'Le loyer mensuel est fix\u00e9 \u00e0 {loyer_mensuel} FCFA, charges de {charges} FCFA en sus, payable d\'avance le {jour_paiement} de chaque mois.' },
            { title: 'D\u00e9p\u00f4t de garantie', content: 'Le preneur verse \u00e0 la signature un d\u00e9p\u00f4t de garantie de {caution} FCFA ainsi qu\'une avance de {avance} mois de loyer.' },
            { title: 'Usage des lieux', content: 'Le preneur s\'engage \u00e0 n\'utiliser les lieux que pour l\'usage pr\u00e9vu au pr\u00e9sent bail. Toute modification de la destination est interdite sans accord \u00e9crit du bailleur.' },
            { title: 'Entretien et r\u00e9parations', content: 'Le preneur assurera l\'entretien courant des lieux et les menues r\u00e9parations. Les r\u00e9parations majeures et structurelles sont \u00e0 la charge du bailleur.' },
            { title: 'Sous-location', content: 'Toute sous-location, totale ou partielle, est strictement interdite sans l\'accord \u00e9crit et pr\u00e9alable du bailleur.' },
            { title: 'Assurance', content: 'Le preneur est tenu de souscrire une assurance couvrant les risques locatifs et d\'en justifier annuellement aupr\u00e8s du bailleur.' },
            { title: 'Cong\u00e9 et pr\u00e9avis', content: 'Chaque partie peut donner cong\u00e9 moyennant un pr\u00e9avis de trois (3) mois, notifi\u00e9 par lettre recommand\u00e9e avec accus\u00e9 de r\u00e9ception. Le cong\u00e9 prend effet au dernier jour du mois civil.' },
            { title: '\u00c9tat des lieux', content: 'Un \u00e9tat des lieux d\'entr\u00e9e et de sortie sera \u00e9tabli contradictoirement entre les parties et annex\u00e9 au pr\u00e9sent bail.' },
            { title: 'R\u00e9siliation', content: 'Le bail sera r\u00e9sili\u00e9 de plein droit en cas de d\u00e9faut de paiement de deux termes de loyer cons\u00e9cutifs, apr\u00e8s mise en demeure rest\u00e9e infructueuse pendant un mois.' },
            { title: 'Loi applicable', content: 'Le pr\u00e9sent bail est r\u00e9gi par les dispositions du Code des Obligations Civiles et Commerciales du S\u00e9n\u00e9gal et du d\u00e9cret n\u00b0 81-1035.' }
        ],
        mentions: [
            'Bail \u00e9tabli en deux exemplaires originaux ayant m\u00eame force et valeur.',
            'Les parties d\u00e9clarent avoir eu le temps de lire et comprendre l\'int\u00e9gralit\u00e9 du pr\u00e9sent contrat.'
        ],
        signatures: [
            { label: 'Le bailleur', name: COMPANY.nom, fonction: COMPANY.gerant },
            { label: 'Le preneur', name: '', fonction: 'Lu et approuv\u00e9' }
        ]
    },

    // ─── CONTRAT DE TRAVAIL ───
    contrat_travail: {
        label: 'Contrat de travail',
        icon: 'work',
        category: 'rh',
        watermark: 'CONFIDENTIEL',
        titleText: 'CONTRAT DE TRAVAIL',
        hasLineItems: false,
        hasParties: true,
        hasMentions: true,
        hasArticles: true,
        fields: [
            { section: 'Informations du contrat', icon: 'info' },
            { id: 'numero', label: 'N\u00b0 du contrat', type: 'text', placeholder: 'CT-2026-001', required: true },
            { id: 'date', label: 'Date du contrat', type: 'date', required: true },
            { id: 'type_contrat', label: 'Type de contrat', type: 'select', options: ['CDI', 'CDD', 'Stage', 'Int\u00e9rim', 'Apprentissage'], required: true },
            { section: 'Employ\u00e9', icon: 'person' },
            { id: 'employe_nom', label: 'Nom complet', type: 'text', required: true },
            { id: 'employe_date_naissance', label: 'Date de naissance', type: 'date' },
            { id: 'employe_lieu_naissance', label: 'Lieu de naissance', type: 'text' },
            { id: 'employe_nationalite', label: 'Nationalit\u00e9', type: 'text', value: 'S\u00e9n\u00e9galaise' },
            { id: 'employe_cni', label: 'N\u00b0 CNI', type: 'text' },
            { id: 'employe_adresse', label: 'Adresse', type: 'text' },
            { id: 'employe_telephone', label: 'T\u00e9l\u00e9phone', type: 'tel' },
            { section: 'Poste et conditions', icon: 'badge' },
            { id: 'poste', label: 'Poste / Fonction', type: 'text', required: true },
            { id: 'categorie', label: 'Cat\u00e9gorie professionnelle', type: 'text' },
            { id: 'lieu_travail', label: 'Lieu de travail', type: 'text', value: COMPANY.ville },
            { id: 'date_debut', label: 'Date de prise de fonction', type: 'date', required: true },
            { id: 'date_fin', label: 'Date de fin (CDD)', type: 'date' },
            { id: 'periode_essai', label: 'P\u00e9riode d\'essai', type: 'text', placeholder: '3 mois' },
            { id: 'horaires', label: 'Horaires de travail', type: 'text', placeholder: 'Lundi au vendredi, 8h-17h' },
            { section: 'R\u00e9mun\u00e9ration', icon: 'payments' },
            { id: 'salaire_base', label: 'Salaire de base mensuel (FCFA)', type: 'number', required: true },
            { id: 'prime_transport', label: 'Prime de transport (FCFA)', type: 'number', value: '0' },
            { id: 'prime_logement', label: 'Indemnit\u00e9 de logement (FCFA)', type: 'number', value: '0' },
            { id: 'autres_avantages', label: 'Autres avantages', type: 'textarea', fullWidth: true }
        ],
        articles: [
            { title: 'Engagement', content: 'La soci\u00e9t\u00e9 ' + COMPANY.nom + ' engage {employe_nom} en qualit\u00e9 de {poste}, \u00e0 compter du {date_debut}.' },
            { title: 'Type de contrat', content: 'Le pr\u00e9sent contrat est conclu sous forme de {type_contrat}.' },
            { title: 'P\u00e9riode d\'essai', content: 'L\'employ\u00e9 est soumis \u00e0 une p\u00e9riode d\'essai de {periode_essai}, renouvelable une fois. Pendant cette p\u00e9riode, chaque partie peut rompre le contrat sans pr\u00e9avis ni indemnit\u00e9.' },
            { title: 'Fonctions', content: 'L\'employ\u00e9 exercera les fonctions de {poste}. Il pourra \u00eatre amen\u00e9 \u00e0 effectuer toute t\u00e2che li\u00e9e \u00e0 sa qualification et \u00e0 sa cat\u00e9gorie professionnelle.' },
            { title: 'Lieu de travail', content: 'Le lieu de travail est fix\u00e9 \u00e0 {lieu_travail}. Il pourra \u00eatre modifi\u00e9 en fonction des n\u00e9cessit\u00e9s du service, apr\u00e8s information de l\'employ\u00e9.' },
            { title: 'Horaires', content: 'Les horaires de travail sont : {horaires}. La dur\u00e9e l\u00e9gale du travail est de 40 heures par semaine.' },
            { title: 'R\u00e9mun\u00e9ration', content: 'L\'employ\u00e9 percevra une r\u00e9mun\u00e9ration mensuelle brute de {salaire_base} FCFA, \u00e0 laquelle s\'ajoutent les indemnit\u00e9s et primes suivantes :\n\u2022 Prime de transport : {prime_transport} FCFA\n\u2022 Indemnit\u00e9 de logement : {prime_logement} FCFA' },
            { title: 'Obligations de l\'employ\u00e9', content: 'L\'employ\u00e9 s\'engage \u00e0 :\n\u2022 Ex\u00e9cuter ses t\u00e2ches avec diligence et loyaut\u00e9\n\u2022 Respecter le r\u00e8glement int\u00e9rieur de l\'entreprise\n\u2022 Respecter la confidentialit\u00e9 des informations de l\'entreprise\n\u2022 Se conformer aux directives de sa hi\u00e9rarchie' },
            { title: 'Cong\u00e9s', content: 'L\'employ\u00e9 b\u00e9n\u00e9ficie de 24 jours ouvrables de cong\u00e9s pay\u00e9s par an, conform\u00e9ment au Code du Travail s\u00e9n\u00e9galais.' },
            { title: 'Rupture du contrat', content: 'Le contrat pourra \u00eatre rompu conform\u00e9ment aux dispositions du Code du Travail du S\u00e9n\u00e9gal. Le pr\u00e9avis est fix\u00e9 conform\u00e9ment \u00e0 la convention collective applicable.' },
            { title: 'Dispositions finales', content: 'Le pr\u00e9sent contrat est r\u00e9gi par le Code du Travail du S\u00e9n\u00e9gal (loi n\u00b0 97-17 du 1er d\u00e9cembre 1997) et la convention collective applicable.' }
        ],
        mentions: [
            'Contrat \u00e9tabli en deux exemplaires originaux, un pour chaque partie.',
            'L\'employ\u00e9 d\u00e9clare avoir pris connaissance du r\u00e8glement int\u00e9rieur de l\'entreprise.'
        ],
        signatures: [
            { label: 'L\'employeur', name: COMPANY.nom, fonction: COMPANY.gerant },
            { label: 'L\'employ\u00e9', name: '', fonction: 'Lu et approuv\u00e9' }
        ]
    },

    // ─── CERTIFICAT DE TRAVAIL ───
    certificat_travail: {
        label: 'Certificat de travail',
        icon: 'badge',
        category: 'rh',
        watermark: 'KFS BTP',
        titleText: 'CERTIFICAT DE TRAVAIL',
        hasLineItems: false,
        hasParties: false,
        hasMentions: false,
        hasArticles: false,
        isFreeform: true,
        fields: [
            { section: 'Informations du certificat', icon: 'info' },
            { id: 'numero', label: 'N\u00b0 du certificat', type: 'text', placeholder: 'CERT-2026-001', required: true },
            { id: 'date', label: 'Date', type: 'date', required: true },
            { section: 'Employ\u00e9 concern\u00e9', icon: 'person' },
            { id: 'employe_nom', label: 'Nom complet', type: 'text', required: true },
            { id: 'employe_date_naissance', label: 'Date de naissance', type: 'date' },
            { id: 'employe_lieu_naissance', label: 'Lieu de naissance', type: 'text' },
            { id: 'employe_cni', label: 'N\u00b0 CNI', type: 'text' },
            { section: 'Emploi occup\u00e9', icon: 'work' },
            { id: 'poste', label: 'Poste / Fonction', type: 'text', required: true },
            { id: 'categorie', label: 'Cat\u00e9gorie professionnelle', type: 'text' },
            { id: 'date_entree', label: 'Date d\'entr\u00e9e', type: 'date', required: true },
            { id: 'date_sortie', label: 'Date de sortie', type: 'date', required: true },
            { id: 'motif_depart', label: 'Motif du d\u00e9part', type: 'select', options: ['D\u00e9mission', 'Fin de contrat', 'Licenciement', 'Rupture conventionnelle', 'D\u00e9part \u00e0 la retraite', 'Fin de stage'] }
        ],
        renderBody: function(data) {
            var d = data;
            var dateEntreeStr = DocUtils.dateLongueFR(d.date_entree);
            var dateSortieStr = DocUtils.dateLongueFR(d.date_sortie);
            var dateNaissStr = d.employe_date_naissance ? DocUtils.dateLongueFR(d.employe_date_naissance) : '';
            
            var html = '<div class="kfs-articles">';
            html += '<div class="kfs-article"><div class="kfs-article-content">';
            html += '<p>Je soussign\u00e9, <strong>' + DocUtils.esc(COMPANY.gerant) + '</strong>, agissant en qualit\u00e9 de Directeur G\u00e9n\u00e9ral de la soci\u00e9t\u00e9 <strong>' + DocUtils.esc(COMPANY.nom) + '</strong>,</p>';
            html += '<p>certifie que <strong>' + DocUtils.esc(d.employe_nom || '') + '</strong>';
            if (dateNaissStr) html += ', n\u00e9(e) le ' + dateNaissStr;
            if (d.employe_lieu_naissance) html += ' \u00e0 ' + DocUtils.esc(d.employe_lieu_naissance);
            if (d.employe_cni) html += ', titulaire de la CNI n\u00b0 ' + DocUtils.esc(d.employe_cni);
            html += ',</p>';
            html += '<p>a \u00e9t\u00e9 employ\u00e9(e) dans notre entreprise du <strong>' + dateEntreeStr + '</strong> au <strong>' + dateSortieStr + '</strong>';
            html += ' en qualit\u00e9 de <strong>' + DocUtils.esc(d.poste || '') + '</strong>';
            if (d.categorie) html += ' (cat\u00e9gorie : ' + DocUtils.esc(d.categorie) + ')';
            html += '.</p>';
            if (d.motif_depart) {
                html += '<p>Motif de d\u00e9part : <strong>' + DocUtils.esc(d.motif_depart) + '</strong>.</p>';
            }
            html += '<p>Durant la totalit\u00e9 de son emploi, ' + DocUtils.esc(d.employe_nom || '') + ' a donn\u00e9 enti\u00e8re satisfaction dans l\'exercice de ses fonctions.</p>';
            html += '<p>Le pr\u00e9sent certificat est \u00e9tabli pour servir et valoir ce que de droit.</p>';
            html += '</div></div>';
            html += '</div>';
            return html;
        },
        signatures: [
            { label: 'Le Directeur G\u00e9n\u00e9ral', name: COMPANY.nom, fonction: COMPANY.gerant }
        ]
    },

    // ─── FICHE DE PAIE ───
    fiche_paie: {
        label: 'Fiche de paie',
        icon: 'payments',
        category: 'rh',
        watermark: 'CONFIDENTIEL',
        titleText: 'BULLETIN DE PAIE',
        hasLineItems: false,
        hasParties: false,
        hasMentions: true,
        hasArticles: false,
        isPayslip: true,
        hasPayslipLines: true,
        fields: [
            { section: 'P\u00e9riode', icon: 'calendar_month' },
            { id: 'mois', label: 'Mois', type: 'select', options: ['Janvier', 'F\u00e9vrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Ao\u00fbt', 'Septembre', 'Octobre', 'Novembre', 'D\u00e9cembre'], required: true },
            { id: 'annee', label: 'Ann\u00e9e', type: 'number', value: new Date().getFullYear().toString(), required: true },
            { id: 'date_paiement', label: 'Date de paiement', type: 'date', required: true },
            { id: 'numero', label: 'N\u00b0 bulletin', type: 'text', placeholder: 'BP-2026-001' },
            { section: 'Employ\u00e9', icon: 'person' },
            { id: 'employe_nom', label: 'Nom complet', type: 'text', required: true },
            { id: 'employe_matricule', label: 'Matricule', type: 'text' },
            { id: 'employe_num_ss', label: 'N\u00b0 S\u00e9curit\u00e9 Sociale', type: 'text' },
            { id: 'employe_date_naissance', label: 'Date de naissance', type: 'date' },
            { id: 'employe_lieu_naissance', label: 'Lieu de naissance', type: 'text' },
            { id: 'employe_nationalite', label: 'Nationalit\u00e9', type: 'text', value: 'S\u00e9n\u00e9galaise' },
            { id: 'employe_adresse', label: 'Adresse', type: 'text' },
            { id: 'employe_telephone', label: 'T\u00e9l\u00e9phone', type: 'tel' },
            { id: 'employe_poste', label: 'Emploi / Fonction', type: 'text', required: true },
            { id: 'employe_statut', label: 'Statut professionnel', type: 'text', placeholder: 'Ex: Ouvrier, Cadre, Agent de ma\u00eetrise' },
            { id: 'employe_categorie', label: 'Cat\u00e9gorie / Niveau', type: 'text' },
            { id: 'employe_coefficient', label: 'Coefficient', type: 'text' },
            { id: 'employe_date_embauche', label: 'Date d\'embauche', type: 'date' },
            { id: 'employe_anciennete', label: 'Anciennet\u00e9', type: 'text', placeholder: 'Ex: 2 ans 3 mois' },
            { section: 'R\u00e9mun\u00e9ration', icon: 'payments' },
            { id: 'salaire_base', label: 'Salaire de base (FCFA)', type: 'number', required: true },
            { id: 'heures_sup', label: 'Heures suppl\u00e9mentaires (FCFA)', type: 'number', value: '0' },
            { id: 'prime_transport', label: 'Prime de transport (FCFA)', type: 'number', value: '0' },
            { id: 'prime_logement', label: 'Indemnit\u00e9 logement (FCFA)', type: 'number', value: '0' },
            { id: 'prime_anciennete', label: 'Prime anciennet\u00e9 (FCFA)', type: 'number', value: '0' },
            { id: 'autres_primes', label: 'Autres primes (FCFA)', type: 'number', value: '0' },
            { section: 'Retenues', icon: 'remove_circle' },
            { id: 'ipres_general', label: 'IPRES R\u00e9gime g\u00e9n\u00e9ral (%)', type: 'number', value: '5.6' },
            { id: 'ipres_cadre', label: 'IPRES R\u00e9gime cadre (%)', type: 'number', value: '0' },
            { id: 'ir', label: 'Imp\u00f4t sur le revenu (%)', type: 'number', value: '0' },
            { id: 'css', label: 'CSS (%)', type: 'number', value: '1' },
            { id: 'autres_retenues', label: 'Autres retenues (FCFA)', type: 'number', value: '0' },
            { id: 'avance_salaire', label: 'Avance sur salaire (FCFA)', type: 'number', value: '0' }
        ],
        mentions: [
            'Ce bulletin de paie doit \u00eatre conserv\u00e9 sans limitation de dur\u00e9e.',
            'Conform\u00e9ment au Code du Travail s\u00e9n\u00e9galais (loi n\u00b0 97-17).'
        ],
        signatures: [
            { label: 'L\'employeur', name: COMPANY.nom, fonction: COMPANY.gerant },
            { label: 'L\'employ\u00e9', name: '', fonction: 'Re\u00e7u pour solde' }
        ]
    },

    // ─── CONTRAT DE GESTION LOCATIVE ───
    contrat_gestion_locative: {
        label: 'Mandat de gestion locative',
        icon: 'real_estate_agent',
        category: 'immobilier',
        watermark: 'MANDAT',
        titleText: 'MANDAT DE GESTION LOCATIVE',
        hasLineItems: false,
        hasParties: true,
        hasMentions: true,
        hasArticles: true,
        fields: [
            { section: 'Informations du contrat', icon: 'info' },
            { id: 'numero', label: 'N\u00b0 du contrat', type: 'text', placeholder: 'GL-2026-001', required: true },
            { id: 'date', label: 'Date du contrat', type: 'date', required: true },
            { section: 'Propri\u00e9taire (Mandant)', icon: 'person' },
            { id: 'proprietaire_nom', label: 'Nom / Raison sociale', type: 'text', required: true },
            { id: 'proprietaire_cni', label: 'N\u00b0 CNI / Passeport', type: 'text' },
            { id: 'proprietaire_adresse', label: 'Adresse', type: 'text' },
            { id: 'proprietaire_telephone', label: 'T\u00e9l\u00e9phone', type: 'tel', required: true },
            { id: 'proprietaire_email', label: 'Email', type: 'email' },
            { section: 'Bien \u00e0 g\u00e9rer', icon: 'home' },
            { id: 'bien_designation', label: 'D\u00e9signation du bien', type: 'text', required: true, placeholder: 'Villa 4 pi\u00e8ces, r\u00e9f. V-001' },
            { id: 'bien_adresse', label: 'Adresse du bien', type: 'text', required: true },
            { id: 'bien_surface', label: 'Surface (m\u00b2)', type: 'number' },
            { id: 'bien_description', label: 'Description d\u00e9taill\u00e9e', type: 'textarea', fullWidth: true, placeholder: 'Nombre de pi\u00e8ces, \u00e9quipements, \u00e9tat...' },
            { id: 'bien_type_location', label: 'Type de location pr\u00e9vu', type: 'select', options: ['Location longue dur\u00e9e', 'Location courte dur\u00e9e', 'Les deux'] },
            { section: 'Conditions financi\u00e8res', icon: 'payments' },
            { id: 'loyer_prevu', label: 'Loyer mensuel pr\u00e9vu (FCFA)', type: 'number', required: true },
            { id: 'commission_pourcentage', label: 'Commission de gestion (%)', type: 'number', value: '10', required: true },
            { id: 'frais_mise_location', label: 'Frais de mise en location (FCFA)', type: 'number', value: '0' },
            { id: 'mode_reversement', label: 'Mode de reversement', type: 'select', options: ['Virement bancaire', 'Esp\u00e8ces', 'Mobile Money', 'Ch\u00e8que'] },
            { id: 'periodicite_reversement', label: 'P\u00e9riodicit\u00e9 du reversement', type: 'select', options: ['Mensuel', 'Trimestriel'] },
            { section: 'Dur\u00e9e du mandat', icon: 'event' },
            { id: 'date_debut', label: 'Date de d\u00e9but', type: 'date', required: true },
            { id: 'duree', label: 'Dur\u00e9e (ann\u00e9es)', type: 'number', value: '1' },
            { id: 'renouvelable', label: 'Renouvelable', type: 'select', options: ['Par tacite reconduction', 'Non'] },
            { id: 'preavis', label: 'Pr\u00e9avis de r\u00e9siliation (mois)', type: 'number', value: '3' }
        ],
        articles: [
            { title: 'Objet du mandat', content: 'Par le présent mandat, le propriétaire (ci-après le \u00ab Mandant \u00bb) autorise expressément ' + COMPANY.nom + ' (ci-après le \u00ab Mandataire \u00bb) \u00e0 exploiter, gérer et mettre en location le bien immobilier désigné ci-dessus, en son nom et pour son compte.\n\nLe Mandant conf\u00e8re au Mandataire tous les pouvoirs nécessaires pour accomplir les actes de gestion courante liés \u00e0 la mise en location du bien, y compris la recherche de locataires, la fixation du loyer, la signature des baux, l\'encaissement des loyers et la gestion des entrées/sorties.\n\nLe présent mandat constitue la preuve que le Mandant a confié au Mandataire l\'exploitation et la mise en location de son bien immobilier.' },
            { title: 'Dur\u00e9e du mandat', content: 'Le pr\u00e9sent mandat est consenti pour une dur\u00e9e de {duree} an(s) \u00e0 compter du {date_debut}.\n\nRenouvellement : {renouvelable}.\nPr\u00e9avis de r\u00e9siliation : {preavis} mois.' },
            { title: 'Missions du Mandataire', content: 'Le Mandataire s\'engage \u00e0 :\n\u2022 Rechercher des locataires solvables\n\u2022 R\u00e9diger et signer les baux au nom du Mandant\n\u2022 \u00c9tablir les \u00e9tats des lieux d\'entr\u00e9e et de sortie\n\u2022 Encaisser les loyers et charges\n\u2022 Reverser les sommes dues au Mandant, d\u00e9duction faite de la commission\n\u2022 Assurer le suivi des r\u00e9parations courantes\n\u2022 G\u00e9rer les imp\u00e9ratifs locatifs (cong\u00e9s, renouvellements, \u00e9ventuels contentieux)' },
            { title: 'Obligations du Mandant', content: 'Le Mandant s\'engage \u00e0 :\n\u2022 Fournir un bien en bon \u00e9tat de location\n\u2022 Remettre les cl\u00e9s et documents n\u00e9cessaires\n\u2022 Informer le Mandataire de toute modification concernant le bien\n\u2022 Prendre en charge les grosses r\u00e9parations (article 606 du COCC)\n\u2022 Ne pas conclure de bail directement sans en informer le Mandataire' },
            { title: 'R\u00e9mun\u00e9ration du Mandataire', content: 'En contrepartie de ses services, le Mandataire percevra :\n\u2022 Une commission de gestion de {commission_pourcentage}% sur les loyers encaiss\u00e9s\n\u2022 Des frais de mise en location de {frais_mise_location} FCFA par nouveau locataire trouv\u00e9\n\nLa commission est pr\u00e9lev\u00e9e directement sur les loyers avant reversement au Mandant.' },
            { title: 'Reversement des loyers', content: 'Les loyers encaiss\u00e9s, d\u00e9duction faite de la commission et des frais \u00e9ventuels, seront revers\u00e9s au Mandant selon la p\u00e9riodicit\u00e9 convenue ({periodicite_reversement}) par {mode_reversement}.\n\nLe Mandataire fournira un relev\u00e9 de gestion d\u00e9taill\u00e9 accompagnant chaque reversement.' },
            { title: 'Assurance et responsabilit\u00e9', content: 'Le Mandant s\'engage \u00e0 souscrire une assurance propri\u00e9taire non-occupant couvrant le bien. Le Mandataire ne saurait \u00eatre tenu responsable des d\u00e9g\u00e2ts caus\u00e9s par le locataire au-del\u00e0 de la caution d\u00e9tenue.' },
            { title: 'Compte rendu de gestion', content: 'Le Mandataire rendra compte de sa gestion au Mandant de mani\u00e8re {periodicite_reversement} et fournira un bilan annuel complet comprenant :\n\u2022 R\u00e9capitulatif des loyers per\u00e7us\n\u2022 D\u00e9tail des charges et frais\n\u2022 \u00c9tat des lieux et travaux \u00e9ventuels\n\u2022 Situation des locataires' },
            { title: 'R\u00e9siliation', content: 'Le mandat peut \u00eatre r\u00e9sili\u00e9 :\n\u2022 Par accord amiable entre les parties\n\u2022 Par l\'une ou l\'autre partie moyennant un pr\u00e9avis de {preavis} mois\n\u2022 De plein droit en cas de manquement grave d\'une partie apr\u00e8s mise en demeure rest\u00e9e sans effet pendant 30 jours\n\nEn cas de r\u00e9siliation, le Mandataire remettra au Mandant l\'ensemble des documents, cl\u00e9s et fonds d\u00e9tenus.' },
            { title: 'Loi applicable', content: 'Le pr\u00e9sent contrat est r\u00e9gi par le Code des Obligations Civiles et Commerciales du S\u00e9n\u00e9gal et les dispositions l\u00e9gales relatives au mandat de gestion immobili\u00e8re.' }
        ],
        mentions: [
            'Contrat \u00e9tabli en deux exemplaires originaux, un pour chaque partie.',
            'Les annexes (inventaire du bien, \u00e9tat des lieux) font partie int\u00e9grante du contrat.'
        ],
        signatures: [
            { label: 'Le Mandataire (Gestionnaire)', name: COMPANY.nom, fonction: COMPANY.gerant },
            { label: 'Le Mandant (Propri\u00e9taire)', name: '', fonction: 'Lu et approuv\u00e9' }
        ]
    },

    // ─── QUITTANCE DE LOYER ───
    quittance_loyer: {
        label: 'Quittance de loyer',
        icon: 'receipt_long',
        category: 'immobilier',
        watermark: 'PAYÉ',
        titleText: 'QUITTANCE DE LOYER',
        hasLineItems: false,
        hasParties: false,
        hasMentions: true,
        hasArticles: false,
        isFreeform: true,
        fields: [
            { section: 'Informations de la quittance', icon: 'info' },
            { id: 'numero', label: 'N\u00b0 quittance', type: 'text', placeholder: 'QTL-2026-001', required: true },
            { id: 'date', label: 'Date d\'\u00e9mission', type: 'date', required: true },
            { id: 'type_bail', label: 'Type de bail', type: 'select', options: ['Location longue dur\u00e9e', 'Location courte dur\u00e9e', 'Contrat de bail', 'Gestion locative'], required: true },
            { section: 'Locataire', icon: 'person' },
            { id: 'locataire_nom', label: 'Nom complet du locataire', type: 'text', required: true },
            { id: 'locataire_adresse', label: 'Adresse du locataire', type: 'text' },
            { id: 'locataire_telephone', label: 'T\u00e9l\u00e9phone', type: 'tel' },
            { section: 'Bien lou\u00e9', icon: 'home' },
            { id: 'bien_designation', label: 'D\u00e9signation du bien', type: 'text', required: true },
            { id: 'bien_adresse', label: 'Adresse du bien', type: 'text', required: true },
            { section: 'P\u00e9riode et montants', icon: 'payments' },
            { id: 'periode_debut', label: 'P\u00e9riode du', type: 'date', required: true },
            { id: 'periode_fin', label: 'Au', type: 'date', required: true },
            { id: 'loyer', label: 'Loyer (FCFA)', type: 'number', required: true },
            { id: 'charges', label: 'Charges (FCFA)', type: 'number', value: '0' },
            { id: 'taxe_ordures', label: 'Taxe d\'ordures (FCFA)', type: 'number', value: '0' },
            { id: 'eau', label: 'Eau (FCFA)', type: 'number', value: '0' },
            { id: 'electricite', label: '\u00c9lectricit\u00e9 (FCFA)', type: 'number', value: '0' },
            { id: 'autres_frais', label: 'Autres frais (FCFA)', type: 'number', value: '0' },
            { id: 'autres_frais_label', label: 'Libell\u00e9 autres frais', type: 'text', placeholder: 'Ex: Entretien parties communes' },
            { section: 'Paiement', icon: 'account_balance' },
            { id: 'mode_paiement', label: 'Mode de paiement', type: 'select', options: ['Esp\u00e8ces', 'Virement bancaire', 'Ch\u00e8que', 'Mobile Money'] },
            { id: 'date_paiement', label: 'Date de paiement', type: 'date' },
            { id: 'reference_paiement', label: 'R\u00e9f\u00e9rence du paiement', type: 'text', placeholder: 'N\u00b0 virement, ch\u00e8que...' }
        ],
        renderBody: function(data) {
            var esc = DocUtils.esc;
            var mF = DocUtils.montantFR;
            var mN = DocUtils.montantNum;
            var html = '';

            // Bandeau numéro et date
            html += '<div class="qtl-receipt-header">';
            html += '<div class="qtl-receipt-num"><span class="qtl-label-small">N° Quittance</span><span class="qtl-value-big">' + esc(data.numero || 'QTL-000') + '</span></div>';
            html += '<div class="qtl-receipt-date"><span class="qtl-label-small">Date d\'\u00e9mission</span><span class="qtl-value-big">' + (data.date ? DocUtils.dateFR(data.date) : '') + '</span></div>';
            html += '</div>';

            // Bailleur / Locataire
            html += '<div class="qtl-parties-grid">';
            html += '<div class="qtl-party-block qtl-bailleur">';
            html += '<div class="qtl-party-title">BAILLEUR</div>';
            html += '<div class="qtl-party-name">' + esc(COMPANY.nom) + '</div>';
            html += '<div class="qtl-party-detail">' + esc(COMPANY.adresse) + '</div>';
            html += '<div class="qtl-party-detail">T\u00e9l : ' + esc(COMPANY.telephone) + '</div>';
            html += '<div class="qtl-party-detail">NINEA : ' + esc(COMPANY.ninea) + '</div>';
            html += '</div>';
            html += '<div class="qtl-party-block qtl-locataire">';
            html += '<div class="qtl-party-title">LOCATAIRE</div>';
            html += '<div class="qtl-party-name">' + esc(data.locataire_nom || '') + '</div>';
            if (data.locataire_adresse) html += '<div class="qtl-party-detail">' + esc(data.locataire_adresse) + '</div>';
            if (data.locataire_telephone) html += '<div class="qtl-party-detail">T\u00e9l : ' + esc(data.locataire_telephone) + '</div>';
            html += '</div>';
            html += '</div>';

            // Bien et période
            html += '<div class="qtl-bien-periode">';
            html += '<div class="qtl-bp-row"><span class="qtl-bp-label">Bien lou\u00e9 :</span><span class="qtl-bp-value">' + esc(data.bien_designation || '') + ' \u2014 ' + esc(data.bien_adresse || '') + '</span></div>';
            html += '<div class="qtl-bp-row"><span class="qtl-bp-label">Type de bail :</span><span class="qtl-bp-value">' + esc(data.type_bail || '') + '</span></div>';
            var pDeb = data.periode_debut ? DocUtils.dateLongueFR(data.periode_debut) : '';
            var pFin = data.periode_fin ? DocUtils.dateLongueFR(data.periode_fin) : '';
            html += '<div class="qtl-bp-row"><span class="qtl-bp-label">P\u00e9riode :</span><span class="qtl-bp-value">Du ' + pDeb + ' au ' + pFin + '</span></div>';
            html += '</div>';

            // Tableau détaillé façon facture
            var loyer = parseFloat(data.loyer) || 0;
            var charges = parseFloat(data.charges) || 0;
            var taxe = parseFloat(data.taxe_ordures) || 0;
            var eau = parseFloat(data.eau) || 0;
            var elec = parseFloat(data.electricite) || 0;
            var autres = parseFloat(data.autres_frais) || 0;
            var total = loyer + charges + taxe + eau + elec + autres;

            html += '<table class="qtl-invoice-table">';
            html += '<thead><tr>';
            html += '<th class="qtl-inv-col-ref">#</th>';
            html += '<th class="qtl-inv-col-desc">D\u00e9signation</th>';
            html += '<th class="qtl-inv-col-amount">Montant (FCFA)</th>';
            html += '</tr></thead>';
            html += '<tbody>';
            var rowNum = 1;
            html += '<tr><td class="qtl-inv-ref">' + rowNum++ + '</td><td>Loyer</td><td class="qtl-inv-num">' + mN(loyer) + '</td></tr>';
            if (charges > 0) html += '<tr><td class="qtl-inv-ref">' + rowNum++ + '</td><td>Charges locatives</td><td class="qtl-inv-num">' + mN(charges) + '</td></tr>';
            if (taxe > 0) html += '<tr><td class="qtl-inv-ref">' + rowNum++ + '</td><td>Taxe d\'ordures m\u00e9nag\u00e8res</td><td class="qtl-inv-num">' + mN(taxe) + '</td></tr>';
            if (eau > 0) html += '<tr><td class="qtl-inv-ref">' + rowNum++ + '</td><td>Eau</td><td class="qtl-inv-num">' + mN(eau) + '</td></tr>';
            if (elec > 0) html += '<tr><td class="qtl-inv-ref">' + rowNum++ + '</td><td>\u00c9lectricit\u00e9</td><td class="qtl-inv-num">' + mN(elec) + '</td></tr>';
            if (autres > 0) html += '<tr><td class="qtl-inv-ref">' + rowNum++ + '</td><td>' + esc(data.autres_frais_label || 'Autres frais') + '</td><td class="qtl-inv-num">' + mN(autres) + '</td></tr>';
            html += '</tbody>';
            html += '<tfoot>';
            html += '<tr class="qtl-inv-total"><td colspan="2"><strong>TOTAL \u00c0 PAYER</strong></td><td class="qtl-inv-num"><strong>' + mN(total) + '</strong></td></tr>';
            html += '</tfoot>';
            html += '</table>';

            // Encadré montant total (style reçu)
            html += '<div class="qtl-receipt-total">';
            html += '<div class="qtl-receipt-total-inner">';
            html += '<div class="qtl-receipt-total-label">MONTANT ACQUITT\u00c9</div>';
            html += '<div class="qtl-receipt-total-amount">' + mF(total) + '</div>';
            html += '<div class="qtl-receipt-total-lettres">Arr\u00eat\u00e9e la pr\u00e9sente quittance \u00e0 la somme de :<br><em>' + DocUtils.montantEnLettres(total) + '</em></div>';
            html += '</div>';
            html += '<div class="qtl-stamp">PAY\u00c9</div>';
            html += '</div>';

            // Infos paiement
            html += '<div class="qtl-paiement-section">';
            html += '<div class="qtl-paiement-title">D\u00c9TAILS DU PAIEMENT</div>';
            html += '<div class="qtl-paiement-grid">';
            if (data.mode_paiement) html += '<div class="qtl-pay-item"><span class="qtl-pay-label">Mode :</span><span class="qtl-pay-value">' + esc(data.mode_paiement) + '</span></div>';
            if (data.date_paiement) html += '<div class="qtl-pay-item"><span class="qtl-pay-label">Date :</span><span class="qtl-pay-value">' + DocUtils.dateFR(data.date_paiement) + '</span></div>';
            if (data.reference_paiement) html += '<div class="qtl-pay-item"><span class="qtl-pay-label">R\u00e9f. :</span><span class="qtl-pay-value">' + esc(data.reference_paiement) + '</span></div>';
            html += '</div></div>';

            return html;
        },
        mentions: [
            'La pr\u00e9sente quittance fait foi du paiement effectu\u00e9 et vaut re\u00e7u.',
            'Conform\u00e9ment \u00e0 la loi, le bailleur est tenu de transmettre gratuitement la quittance au locataire qui en fait la demande.',
            'Cette quittance ne pr\u00e9juge pas du paiement des termes ant\u00e9rieurs.'
        ],
        signatures: [
            { label: 'Le bailleur', name: COMPANY.nom, fonction: COMPANY.gerant }
        ]
    },

    // ─── ÉTAT DES LIEUX ───
    etat_des_lieux: {
        label: '\u00c9tat des lieux',
        icon: 'fact_check',
        category: 'immobilier',
        watermark: 'KFS BTP',
        titleText: '\u00c9TAT DES LIEUX',
        hasLineItems: false,
        hasParties: true,
        hasMentions: true,
        hasArticles: false,
        isFreeform: true,
        fields: [
            { section: 'Informations g\u00e9n\u00e9rales', icon: 'info' },
            { id: 'numero', label: 'N\u00b0 du document', type: 'text', placeholder: 'EDL-2026-001', required: true },
            { id: 'date', label: 'Date de l\'\u00e9tat des lieux', type: 'date', required: true },
            { id: 'type_edl', label: 'Type d\'\u00e9tat des lieux', type: 'select', options: ['\u00c9tat des lieux d\'entr\u00e9e', '\u00c9tat des lieux de sortie'], required: true },
            { id: 'ref_bail', label: 'R\u00e9f\u00e9rence du bail / contrat', type: 'text', placeholder: 'LL-2026-001' },
            { section: 'Locataire', icon: 'person' },
            { id: 'locataire_nom', label: 'Nom complet', type: 'text', required: true },
            { id: 'locataire_cni', label: 'N\u00b0 CNI / Passeport', type: 'text' },
            { id: 'locataire_telephone', label: 'T\u00e9l\u00e9phone', type: 'tel' },
            { id: 'locataire_adresse', label: 'Adresse du locataire', type: 'text' },
            { section: 'Bien concern\u00e9', icon: 'home' },
            { id: 'bien_designation', label: 'D\u00e9signation du bien', type: 'text', required: true, placeholder: 'Appartement T3, Villa...' },
            { id: 'bien_adresse', label: 'Adresse du bien', type: 'text', required: true },
            { id: 'bien_surface', label: 'Surface (m\u00b2)', type: 'number' },
            { section: '\u00c9tat des pi\u00e8ces', icon: 'room_preferences' },
            { id: 'etat_salon', label: 'Salon \u2014 \u00c9tat', type: 'select', options: ['Neuf', 'Bon \u00e9tat', 'Usure normale', 'D\u00e9grad\u00e9', 'Tr\u00e8s d\u00e9grad\u00e9', 'N/A'] },
            { id: 'obs_salon', label: 'Salon \u2014 Observations', type: 'text', placeholder: 'D\u00e9crire les d\u00e9g\u00e2ts \u00e9ventuels...' },
            { id: 'etat_cuisine', label: 'Cuisine \u2014 \u00c9tat', type: 'select', options: ['Neuf', 'Bon \u00e9tat', 'Usure normale', 'D\u00e9grad\u00e9', 'Tr\u00e8s d\u00e9grad\u00e9', 'N/A'] },
            { id: 'obs_cuisine', label: 'Cuisine \u2014 Observations', type: 'text', placeholder: 'D\u00e9crire les d\u00e9g\u00e2ts \u00e9ventuels...' },
            { id: 'etat_chambre1', label: 'Chambre 1 \u2014 \u00c9tat', type: 'select', options: ['Neuf', 'Bon \u00e9tat', 'Usure normale', 'D\u00e9grad\u00e9', 'Tr\u00e8s d\u00e9grad\u00e9', 'N/A'] },
            { id: 'obs_chambre1', label: 'Chambre 1 \u2014 Observations', type: 'text', placeholder: 'D\u00e9crire les d\u00e9g\u00e2ts \u00e9ventuels...' },
            { id: 'etat_chambre2', label: 'Chambre 2 \u2014 \u00c9tat', type: 'select', options: ['Neuf', 'Bon \u00e9tat', 'Usure normale', 'D\u00e9grad\u00e9', 'Tr\u00e8s d\u00e9grad\u00e9', 'N/A'] },
            { id: 'obs_chambre2', label: 'Chambre 2 \u2014 Observations', type: 'text', placeholder: 'D\u00e9crire si applicable...' },
            { id: 'etat_chambre3', label: 'Chambre 3 \u2014 \u00c9tat', type: 'select', options: ['Neuf', 'Bon \u00e9tat', 'Usure normale', 'D\u00e9grad\u00e9', 'Tr\u00e8s d\u00e9grad\u00e9', 'N/A'] },
            { id: 'obs_chambre3', label: 'Chambre 3 \u2014 Observations', type: 'text', placeholder: 'D\u00e9crire si applicable...' },
            { id: 'etat_sdb', label: 'Salle de bain / Toilettes \u2014 \u00c9tat', type: 'select', options: ['Neuf', 'Bon \u00e9tat', 'Usure normale', 'D\u00e9grad\u00e9', 'Tr\u00e8s d\u00e9grad\u00e9', 'N/A'] },
            { id: 'obs_sdb', label: 'Salle de bain \u2014 Observations', type: 'text', placeholder: 'D\u00e9crire les d\u00e9g\u00e2ts \u00e9ventuels...' },
            { id: 'etat_exterieur', label: 'Ext\u00e9rieur / Terrasse \u2014 \u00c9tat', type: 'select', options: ['Neuf', 'Bon \u00e9tat', 'Usure normale', 'D\u00e9grad\u00e9', 'Tr\u00e8s d\u00e9grad\u00e9', 'N/A'] },
            { id: 'obs_exterieur', label: 'Ext\u00e9rieur \u2014 Observations', type: 'text', placeholder: 'D\u00e9crire si applicable...' },
            { section: '\u00c9l\u00e9ments g\u00e9n\u00e9raux', icon: 'build' },
            { id: 'etat_electricite', label: '\u00c9lectricit\u00e9 \u2014 \u00c9tat', type: 'select', options: ['Fonctionnel', 'Partiellement d\u00e9faillant', 'D\u00e9faillant', 'N/A'] },
            { id: 'obs_electricite', label: '\u00c9lectricit\u00e9 \u2014 Observations', type: 'text' },
            { id: 'etat_plomberie', label: 'Plomberie \u2014 \u00c9tat', type: 'select', options: ['Fonctionnel', 'Partiellement d\u00e9faillant', 'D\u00e9faillant', 'N/A'] },
            { id: 'obs_plomberie', label: 'Plomberie \u2014 Observations', type: 'text' },
            { id: 'etat_peinture', label: 'Peinture g\u00e9n\u00e9rale \u2014 \u00c9tat', type: 'select', options: ['Neuf', 'Bon \u00e9tat', 'Usure normale', 'D\u00e9grad\u00e9', 'Tr\u00e8s d\u00e9grad\u00e9'] },
            { id: 'obs_peinture', label: 'Peinture \u2014 Observations', type: 'text' },
            { id: 'etat_menuiseries', label: 'Portes / Fen\u00eatres \u2014 \u00c9tat', type: 'select', options: ['Neuf', 'Bon \u00e9tat', 'Usure normale', 'D\u00e9grad\u00e9', 'Tr\u00e8s d\u00e9grad\u00e9'] },
            { id: 'obs_menuiseries', label: 'Portes / Fen\u00eatres \u2014 Observations', type: 'text' },
            { id: 'etat_sols', label: 'Carrelage / Sols \u2014 \u00c9tat', type: 'select', options: ['Neuf', 'Bon \u00e9tat', 'Usure normale', 'D\u00e9grad\u00e9', 'Tr\u00e8s d\u00e9grad\u00e9'] },
            { id: 'obs_sols', label: 'Sols \u2014 Observations', type: 'text' },
            { id: 'releve_compteur_eau', label: 'Relev\u00e9 compteur eau', type: 'text', placeholder: 'Ex: 12345' },
            { id: 'releve_compteur_elec', label: 'Relev\u00e9 compteur \u00e9lectricit\u00e9', type: 'text', placeholder: 'Ex: 67890' },
            { id: 'nombre_cles', label: 'Nombre de cl\u00e9s remises', type: 'number', placeholder: '3' },
            { section: 'D\u00e9gâts constat\u00e9s et r\u00e9parations', icon: 'construction' },
            { id: 'degat1_desc', label: 'D\u00e9g\u00e2t 1 \u2014 Description', type: 'text', placeholder: 'Ex: Vitre cass\u00e9e chambre 1' },
            { id: 'degat1_cout', label: 'D\u00e9g\u00e2t 1 \u2014 Co\u00fbt r\u00e9paration (FCFA)', type: 'number', placeholder: '0' },
            { id: 'degat2_desc', label: 'D\u00e9g\u00e2t 2 \u2014 Description', type: 'text', placeholder: 'Ex: Porte endommag\u00e9e cuisine' },
            { id: 'degat2_cout', label: 'D\u00e9g\u00e2t 2 \u2014 Co\u00fbt r\u00e9paration (FCFA)', type: 'number', placeholder: '0' },
            { id: 'degat3_desc', label: 'D\u00e9g\u00e2t 3 \u2014 Description', type: 'text', placeholder: 'Ex: Peinture tr\u00e8s ab\u00eem\u00e9e' },
            { id: 'degat3_cout', label: 'D\u00e9g\u00e2t 3 \u2014 Co\u00fbt r\u00e9paration (FCFA)', type: 'number', placeholder: '0' },
            { id: 'degat4_desc', label: 'D\u00e9g\u00e2t 4 \u2014 Description', type: 'text' },
            { id: 'degat4_cout', label: 'D\u00e9g\u00e2t 4 \u2014 Co\u00fbt r\u00e9paration (FCFA)', type: 'number' },
            { id: 'degat5_desc', label: 'D\u00e9g\u00e2t 5 \u2014 Description', type: 'text' },
            { id: 'degat5_cout', label: 'D\u00e9g\u00e2t 5 \u2014 Co\u00fbt r\u00e9paration (FCFA)', type: 'number' },
            { section: 'Caution et bilan financier', icon: 'account_balance_wallet' },
            { id: 'caution_versee', label: 'Caution vers\u00e9e (FCFA)', type: 'number', required: true },
            { id: 'autres_deductions', label: 'Autres d\u00e9ductions (FCFA)', type: 'number', value: '0', placeholder: 'Loyers impay\u00e9s, nettoyage...' },
            { id: 'autres_deductions_motif', label: 'Motif autres d\u00e9ductions', type: 'text', placeholder: 'Ex: Nettoyage profond n\u00e9cessaire' },
            { section: 'Observations g\u00e9n\u00e9rales', icon: 'notes' },
            { id: 'observation_generale', label: 'Observations / Commentaires', type: 'textarea', fullWidth: true, placeholder: '\u00c9tat g\u00e9n\u00e9ral du bien, remarques particuli\u00e8res...' },
            { id: 'conclusion', label: 'Conclusion', type: 'select', options: ['Caution int\u00e9gralement remboursable', 'Caution partiellement remboursable (d\u00e9ductions)', 'Caution non remboursable (d\u00e9g\u00e2ts sup\u00e9rieurs)', 'Compl\u00e9ment \u00e0 r\u00e9clamer au locataire'] }
        ],
        renderBody: function(data) {
            var esc = DocUtils.esc;
            var mF = DocUtils.montantFR;
            var mN = DocUtils.montantNum;
            var html = '';

            // ── Type d'état des lieux + infos bien ──
            html += '<div class="edl-type-banner edl-type-' + (data.type_edl === '\u00c9tat des lieux de sortie' ? 'sortie' : 'entree') + '">';
            html += '<span class="material-icons" style="font-size:1.6rem">' + (data.type_edl === '\u00c9tat des lieux de sortie' ? 'logout' : 'login') + '</span>';
            html += '<strong>' + esc(data.type_edl || '\u00c9tat des lieux') + '</strong>';
            if (data.ref_bail) html += '<span style="margin-left:auto;font-size:0.85rem;opacity:0.8">R\u00e9f. bail : ' + esc(data.ref_bail) + '</span>';
            html += '</div>';

            // ── Infos du bien ──
            html += '<div class="edl-bien-info">';
            html += '<div class="edl-bien-row"><span class="edl-bien-label">Bien :</span><span>' + esc(data.bien_designation || '') + '</span></div>';
            html += '<div class="edl-bien-row"><span class="edl-bien-label">Adresse :</span><span>' + esc(data.bien_adresse || '') + '</span></div>';
            if (data.bien_surface) html += '<div class="edl-bien-row"><span class="edl-bien-label">Surface :</span><span>' + esc(data.bien_surface) + ' m\u00b2</span></div>';
            html += '<div class="edl-bien-row"><span class="edl-bien-label">Date :</span><span>' + DocUtils.dateLongueFR(data.date) + '</span></div>';
            html += '</div>';

            // ── Tableau état des pièces ──
            var pieces = [
                { key: 'salon', label: 'Salon' },
                { key: 'cuisine', label: 'Cuisine' },
                { key: 'chambre1', label: 'Chambre 1' },
                { key: 'chambre2', label: 'Chambre 2' },
                { key: 'chambre3', label: 'Chambre 3' },
                { key: 'sdb', label: 'Salle de bain / WC' },
                { key: 'exterieur', label: 'Ext\u00e9rieur / Terrasse' }
            ];

            html += '<div class="edl-section-title"><span class="material-icons">room_preferences</span> \u00c9TAT DES PI\u00c8CES</div>';
            html += '<table class="edl-table">';
            html += '<thead><tr><th style="width:25%">Pi\u00e8ce</th><th style="width:25%">\u00c9tat</th><th>Observations</th></tr></thead>';
            html += '<tbody>';
            for (var i = 0; i < pieces.length; i++) {
                var p = pieces[i];
                var etat = data['etat_' + p.key] || '';
                var obs = data['obs_' + p.key] || '';
                if (etat && etat !== 'N/A') {
                    var badgeClass = 'edl-etat-bon';
                    if (etat === 'D\u00e9grad\u00e9') badgeClass = 'edl-etat-degrade';
                    else if (etat === 'Tr\u00e8s d\u00e9grad\u00e9') badgeClass = 'edl-etat-tres-degrade';
                    else if (etat === 'Usure normale') badgeClass = 'edl-etat-usure';
                    else if (etat === 'Neuf') badgeClass = 'edl-etat-neuf';

                    html += '<tr>';
                    html += '<td class="edl-piece-name">' + esc(p.label) + '</td>';
                    html += '<td><span class="edl-etat-badge ' + badgeClass + '">' + esc(etat) + '</span></td>';
                    html += '<td class="edl-obs">' + esc(obs) + '</td>';
                    html += '</tr>';
                }
            }
            html += '</tbody></table>';

            // ── Éléments techniques ──
            var elems = [
                { key: 'electricite', label: '\u00c9lectricit\u00e9' },
                { key: 'plomberie', label: 'Plomberie' },
                { key: 'peinture', label: 'Peinture g\u00e9n\u00e9rale' },
                { key: 'menuiseries', label: 'Portes / Fen\u00eatres' },
                { key: 'sols', label: 'Carrelage / Sols' }
            ];

            html += '<div class="edl-section-title"><span class="material-icons">build</span> \u00c9L\u00c9MENTS TECHNIQUES</div>';
            html += '<table class="edl-table">';
            html += '<thead><tr><th style="width:25%">\u00c9l\u00e9ment</th><th style="width:25%">\u00c9tat</th><th>Observations</th></tr></thead>';
            html += '<tbody>';
            for (var j = 0; j < elems.length; j++) {
                var el = elems[j];
                var etatEl = data['etat_' + el.key] || '';
                var obsEl = data['obs_' + el.key] || '';
                if (etatEl) {
                    var badgeClassEl = 'edl-etat-bon';
                    if (etatEl === 'D\u00e9grad\u00e9' || etatEl === 'Partiellement d\u00e9faillant') badgeClassEl = 'edl-etat-degrade';
                    else if (etatEl === 'Tr\u00e8s d\u00e9grad\u00e9' || etatEl === 'D\u00e9faillant') badgeClassEl = 'edl-etat-tres-degrade';
                    else if (etatEl === 'Usure normale') badgeClassEl = 'edl-etat-usure';
                    else if (etatEl === 'Neuf' || etatEl === 'Fonctionnel') badgeClassEl = 'edl-etat-neuf';

                    html += '<tr>';
                    html += '<td class="edl-piece-name">' + esc(el.label) + '</td>';
                    html += '<td><span class="edl-etat-badge ' + badgeClassEl + '">' + esc(etatEl) + '</span></td>';
                    html += '<td class="edl-obs">' + esc(obsEl) + '</td>';
                    html += '</tr>';
                }
            }
            html += '</tbody></table>';

            // ── Relevés compteurs + clés ──
            if (data.releve_compteur_eau || data.releve_compteur_elec || data.nombre_cles) {
                html += '<div class="edl-compteurs">';
                if (data.releve_compteur_eau) html += '<div class="edl-compteur-item"><span class="material-icons">water_drop</span>Compteur eau : <strong>' + esc(data.releve_compteur_eau) + '</strong></div>';
                if (data.releve_compteur_elec) html += '<div class="edl-compteur-item"><span class="material-icons">electrical_services</span>Compteur \u00e9lectricit\u00e9 : <strong>' + esc(data.releve_compteur_elec) + '</strong></div>';
                if (data.nombre_cles) html += '<div class="edl-compteur-item"><span class="material-icons">key</span>Cl\u00e9s remises : <strong>' + esc(data.nombre_cles) + '</strong></div>';
                html += '</div>';
            }

            // ── Tableau des dégâts et coûts ──
            var degats = [];
            for (var d = 1; d <= 5; d++) {
                var desc = data['degat' + d + '_desc'] || '';
                var cout = parseFloat(data['degat' + d + '_cout']) || 0;
                if (desc) degats.push({ desc: desc, cout: cout });
            }
            var totalDegats = 0;

            if (degats.length > 0) {
                html += '<div class="edl-section-title"><span class="material-icons">construction</span> D\u00c9G\u00c2TS CONSTAT\u00c9S & CO\u00dbTS DE R\u00c9PARATION</div>';
                html += '<table class="edl-table edl-degats-table">';
                html += '<thead><tr><th style="width:8%">#</th><th>Description du d\u00e9g\u00e2t</th><th style="width:25%">Co\u00fbt r\u00e9paration (FCFA)</th></tr></thead>';
                html += '<tbody>';
                for (var k = 0; k < degats.length; k++) {
                    totalDegats += degats[k].cout;
                    html += '<tr>';
                    html += '<td style="text-align:center;font-weight:600">' + (k + 1) + '</td>';
                    html += '<td>' + esc(degats[k].desc) + '</td>';
                    html += '<td style="text-align:right;font-weight:600">' + mN(degats[k].cout) + '</td>';
                    html += '</tr>';
                }
                html += '</tbody>';
                html += '<tfoot><tr class="edl-total-row"><td colspan="2"><strong>TOTAL R\u00c9PARATIONS</strong></td><td style="text-align:right"><strong>' + mN(totalDegats) + '</strong></td></tr></tfoot>';
                html += '</table>';
            }

            // ── Bilan financier caution ──
            var cautionVersee = parseFloat(data.caution_versee) || 0;
            var autresDeductions = parseFloat(data.autres_deductions) || 0;
            var totalDeductions = totalDegats + autresDeductions;
            var solde = cautionVersee - totalDeductions;

            html += '<div class="edl-section-title"><span class="material-icons">account_balance_wallet</span> BILAN FINANCIER \u2014 CAUTION</div>';
            html += '<div class="edl-bilan-box">';
            html += '<table class="edl-bilan-table">';
            html += '<tr><td>Caution vers\u00e9e</td><td class="edl-bilan-amount">' + mF(cautionVersee) + '</td></tr>';
            if (totalDegats > 0) html += '<tr class="edl-bilan-deduction"><td>\u2212 R\u00e9parations d\u00e9g\u00e2ts</td><td class="edl-bilan-amount">\u2212 ' + mF(totalDegats) + '</td></tr>';
            if (autresDeductions > 0) html += '<tr class="edl-bilan-deduction"><td>\u2212 ' + esc(data.autres_deductions_motif || 'Autres d\u00e9ductions') + '</td><td class="edl-bilan-amount">\u2212 ' + mF(autresDeductions) + '</td></tr>';
            html += '<tr class="edl-bilan-separateur"><td colspan="2"></td></tr>';
            
            var soldeClass = solde >= 0 ? 'edl-solde-positif' : 'edl-solde-negatif';
            var soldeLabel = solde >= 0 ? 'MONTANT \u00c0 RESTITUER AU LOCATAIRE' : 'COMPL\u00c9MENT \u00c0 R\u00c9CLAMER AU LOCATAIRE';
            html += '<tr class="edl-bilan-solde ' + soldeClass + '"><td><strong>' + soldeLabel + '</strong></td><td class="edl-bilan-amount"><strong>' + mF(Math.abs(solde)) + '</strong></td></tr>';
            html += '</table>';

            // Montant en lettres
            html += '<div class="edl-montant-lettres">Arr\u00eat\u00e9 \u00e0 la somme de : <em>' + DocUtils.montantEnLettres(Math.abs(solde)) + '</em></div>';
            html += '</div>';

            // ── Conclusion ──
            if (data.conclusion) {
                var conclusionIcon = 'info';
                var conclusionClass = 'edl-conclusion-info';
                if (data.conclusion.indexOf('int\u00e9gralement') !== -1) { conclusionIcon = 'check_circle'; conclusionClass = 'edl-conclusion-ok'; }
                else if (data.conclusion.indexOf('partiellement') !== -1) { conclusionIcon = 'warning'; conclusionClass = 'edl-conclusion-warn'; }
                else if (data.conclusion.indexOf('non remboursable') !== -1 || data.conclusion.indexOf('Compl\u00e9ment') !== -1) { conclusionIcon = 'error'; conclusionClass = 'edl-conclusion-danger'; }

                html += '<div class="edl-conclusion ' + conclusionClass + '">';
                html += '<span class="material-icons">' + conclusionIcon + '</span>';
                html += '<strong>Conclusion : </strong>' + esc(data.conclusion);
                html += '</div>';
            }

            // ── Observations ──
            if (data.observation_generale) {
                html += '<div class="edl-observations">';
                html += '<div class="edl-obs-title">OBSERVATIONS G\u00c9N\u00c9RALES</div>';
                html += '<p>' + esc(data.observation_generale) + '</p>';
                html += '</div>';
            }

            return html;
        },
        mentions: [
            'Le pr\u00e9sent \u00e9tat des lieux a \u00e9t\u00e9 \u00e9tabli contradictoirement entre les parties.',
            'Il constitue une pi\u00e8ce annexe au contrat de bail et en fait partie int\u00e9grante.',
            'Les d\u00e9gradations constat\u00e9es, hors usure normale, sont \u00e0 la charge du locataire.',
            'Le montant des r\u00e9parations sera d\u00e9duit de la caution conform\u00e9ment au Code des Obligations Civiles et Commerciales du S\u00e9n\u00e9gal.',
            'En cas de d\u00e9saccord sur l\'\u00e9tat des lieux, les parties pourront recourir \u00e0 un expert ind\u00e9pendant.'
        ],
        signatures: [
            { label: 'Le bailleur', name: COMPANY.nom, fonction: COMPANY.gerant },
            { label: 'Le locataire', name: '', fonction: 'Lu et approuv\u00e9' }
        ]
    }
};

// ═══════════════════════════════════════════════════
// 3. UTILITAIRES
// ═══════════════════════════════════════════════════

var DocUtils = {
    /** \u00c9chappe les caract\u00e8res HTML */
    esc: function(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    },

    /** Valeur par d\u00e9faut */
    v: function(val, def) {
        return (val !== undefined && val !== null && val !== '') ? val : (def || '');
    },

    /** Date FR courte : 12/02/2026 */
    dateFR: function(dateStr) {
        if (!dateStr) return '';
        var parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    },

    /** Date FR longue : 12 f\u00e9vrier 2026 */
    dateLongueFR: function(dateStr) {
        if (!dateStr) return '';
        var mois = ['janvier', 'f\u00e9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00fbt', 'septembre', 'octobre', 'novembre', 'd\u00e9cembre'];
        var parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return parseInt(parts[2], 10) + ' ' + mois[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
    },

    /** Montant FR : 1 500 000 FCFA */
    montantFR: function(val) {
        var n = parseFloat(val);
        if (isNaN(n)) return '0 FCFA';
        return n.toLocaleString('fr-FR') + ' FCFA';
    },

    /** Montant num\u00e9rique : 1 500 000 */
    montantNum: function(val) {
        var n = parseFloat(val);
        if (isNaN(n)) return '0';
        return n.toLocaleString('fr-FR');
    },

    /** G\u00e9n\u00e8re un ID unique */
    uid: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    /** Date du jour au format YYYY-MM-DD */
    today: function() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },

    /** Convertit un montant en lettres (français) */
    montantEnLettres: function(n) {
        if (isNaN(n) || n === 0) return 'zéro franc CFA';
        var unite = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
            'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
        var dizaine = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
        function convertGroupe(num) {
            if (num === 0) return '';
            if (num < 20) return unite[num];
            if (num < 100) {
                var d = Math.floor(num / 10);
                var u = num % 10;
                if (d === 7 || d === 9) return dizaine[d] + '-' + unite[10 + u];
                if (d === 8 && u === 0) return 'quatre-vingts';
                return dizaine[d] + (u > 0 ? '-' + unite[u] : '');
            }
            var c = Math.floor(num / 100);
            var r = num % 100;
            var prefix = (c === 1) ? 'cent' : unite[c] + ' cent';
            if (r === 0 && c > 1) return prefix + 's';
            return prefix + (r > 0 ? ' ' + convertGroupe(r) : '');
        }
        n = Math.floor(n);
        if (n < 1000) return convertGroupe(n) + ' francs CFA';
        var result = '';
        var milliard = Math.floor(n / 1000000000);
        var million = Math.floor((n % 1000000000) / 1000000);
        var mille = Math.floor((n % 1000000) / 1000);
        var reste = n % 1000;
        if (milliard > 0) result += convertGroupe(milliard) + ' milliard' + (milliard > 1 ? 's' : '') + ' ';
        if (million > 0) result += convertGroupe(million) + ' million' + (million > 1 ? 's' : '') + ' ';
        if (mille > 0) result += (mille === 1 ? 'mille' : convertGroupe(mille) + ' mille') + ' ';
        if (reste > 0) result += convertGroupe(reste);
        return result.trim() + ' francs CFA';
    },

    /** Toast notification */
    toast: function(message, type) {
        var existing = document.querySelector('.doc-toast');
        if (existing) existing.remove();
        var t = document.createElement('div');
        t.className = 'doc-toast ' + (type || '');
        t.innerHTML = '<span class="material-icons" style="font-size:1.2rem">' + (type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info') + '</span>' + DocUtils.esc(message);
        document.body.appendChild(t);
        setTimeout(function() { t.remove(); }, 3500);
    }
};

// ═══════════════════════════════════════════════════
// 4. MOTEUR DE FORMULAIRE
// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
// 3b. AUTO-REMPLISSAGE (Employés / Clients)
// ═══════════════════════════════════════════════════

var AutoFill = {

    /** Mapping type de document → source de données */
    SOURCE_MAP: {
        // Documents RH → employés
        contrat_travail:    { source: 'employes', label: 'un employé', icon: 'person' },
        certificat_travail: { source: 'employes', label: 'un employé', icon: 'person' },
        fiche_paie:         { source: 'employes', label: 'un employé', icon: 'person' },
        // Documents commerciaux / immobilier → clients
        devis:              { source: 'clients', label: 'un client', icon: 'groups' },
        contrat_prestation: { source: 'clients', label: 'un client', icon: 'groups' },
        location_courte:    { source: 'clients', label: 'un client / locataire', icon: 'groups' },
        location_longue:    { source: 'clients', label: 'un client / locataire', icon: 'groups' },
        contrat_bail:       { source: 'clients', label: 'un client / locataire', icon: 'groups' },
        contrat_gestion_locative: { source: 'clients', label: 'un propriétaire', icon: 'groups' },
        quittance_loyer:    { source: 'clients', label: 'un locataire', icon: 'groups' },
        etat_des_lieux:     { source: 'clients', label: 'un locataire', icon: 'groups' }
    },

    /** Mapping champ document ← champ employé */
    EMPLOYEE_MAP: {
        employe_nom:            function(e) { return ((e.civilite || '') + ' ' + (e.prenom || '') + ' ' + (e.nom || '')).trim(); },
        employe_date_naissance: function(e) { return e.dateNaissance || ''; },
        employe_lieu_naissance: function(e) { return e.lieuNaissance || ''; },
        employe_nationalite:    function(e) { return e.nationalite || 'Sénégalaise'; },
        employe_cni:            function(e) { return e.cni || ''; },
        employe_adresse:        function(e) { return e.adresse || ''; },
        employe_telephone:      function(e) { return e.telephone || ''; },
        employe_matricule:      function(e) { return e.matricule || ''; },
        employe_poste:          function(e) { return e.poste || ''; },
        employe_categorie:      function(e) { return e.departement || ''; },
        employe_date_embauche:  function(e) { return e.dateEmbauche || ''; },
        poste:                  function(e) { return e.poste || ''; },
        categorie:              function(e) { return e.departement || ''; },
        salaire_base:           function(e) { return e.salaire ? String(e.salaire) : ''; },
        date_entree:            function(e) { return e.dateEmbauche || ''; },
        lieu_travail:           function(e) { return COMPANY.ville || ''; }
    },

    /** Mapping champ document ← champ client */
    CLIENT_MAP: {
        client_nom:         function(c) {
            if (c.type === 'entreprise') return c.raisonSociale || c.nom || '';
            return ((c.civilite || '') + ' ' + (c.prenom || '') + ' ' + (c.nom || '')).trim();
        },
        client_adresse:     function(c) { return (c.adresse || '') + (c.ville ? ', ' + c.ville : ''); },
        client_telephone:   function(c) { return c.telephone || ''; },
        client_email:       function(c) { return c.email || ''; },
        client_representant: function(c) {
            if (c.type === 'entreprise') return c.contactPrincipal || '';
            return ((c.prenom || '') + ' ' + (c.nom || '')).trim();
        },
        // Pour locataires (location / bail)
        locataire_nom:      function(c) {
            return ((c.civilite || '') + ' ' + (c.prenom || '') + ' ' + (c.nom || '')).trim();
        },
        locataire_cni:      function(c) { return c.cni || ''; },
        locataire_telephone: function(c) { return c.telephone || ''; },
        locataire_adresse:  function(c) { return (c.adresse || '') + (c.ville ? ', ' + c.ville : ''); },
        locataire_profession: function(c) { return c.profession || ''; }
    },

    /** Charger les données depuis localStorage */
    loadData: function(source) {
        try {
            return JSON.parse(localStorage.getItem(source) || '[]');
        } catch(e) { return []; }
    },

    /** Générer le HTML du sélecteur */
    renderSelector: function(typeKey) {
        var mapping = AutoFill.SOURCE_MAP[typeKey];
        if (!mapping) return '';

        var items = AutoFill.loadData(mapping.source);
        if (items.length === 0) return '';

        var html = '<div class="doc-autofill-bar" style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:2px dashed #38bdf8;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">';
        html += '<span class="material-icons" style="color:#0284c7;font-size:1.5rem">' + mapping.icon + '</span>';
        html += '<label style="font-weight:600;color:#0369a1;white-space:nowrap">Sélectionner ' + mapping.label + ' :</label>';
        html += '<select id="doc-autofill-select" style="flex:1;min-width:200px;padding:8px 12px;border:1px solid #7dd3fc;border-radius:8px;font-size:0.95rem;background:white;cursor:pointer">';
        html += '<option value="">-- Remplissage manuel --</option>';

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var displayName = '';
            if (mapping.source === 'employes') {
                displayName = ((item.prenom || '') + ' ' + (item.nom || '')).trim();
                if (item.matricule) displayName += ' (' + item.matricule + ')';
                if (item.poste) displayName += ' — ' + item.poste;
            } else {
                if (item.type === 'entreprise') {
                    displayName = item.raisonSociale || item.nom || '';
                    if (item.contactPrincipal) displayName += ' (c/o ' + item.contactPrincipal + ')';
                } else {
                    displayName = ((item.prenom || '') + ' ' + (item.nom || '')).trim();
                }
                if (item.telephone) displayName += ' — ' + item.telephone;
            }
            html += '<option value="' + i + '">' + DocUtils.esc(displayName) + '</option>';
        }

        html += '</select>';
        html += '</div>';
        return html;
    },

    /** Appliquer les données sélectionnées */
    apply: function(typeKey) {
        var select = document.getElementById('doc-autofill-select');
        if (!select || select.value === '') return;

        var mapping = AutoFill.SOURCE_MAP[typeKey];
        if (!mapping) return;

        var items = AutoFill.loadData(mapping.source);
        var idx = parseInt(select.value, 10);
        if (isNaN(idx) || !items[idx]) return;

        var item = items[idx];
        var fieldMap = mapping.source === 'employes' ? AutoFill.EMPLOYEE_MAP : AutoFill.CLIENT_MAP;

        var filled = 0;
        for (var fieldId in fieldMap) {
            var el = document.getElementById('doc-' + fieldId);
            if (el) {
                var val = fieldMap[fieldId](item);
                if (val) {
                    el.value = val;
                    // Animation visuelle
                    el.style.transition = 'background 0.3s';
                    el.style.background = '#f0fdf4';
                    setTimeout((function(element) {
                        return function() { element.style.background = ''; };
                    })(el), 1500);
                    filled++;
                }
            }
        }

        if (filled > 0) {
            DocUtils.toast(filled + ' champ(s) rempli(s) automatiquement', 'success');
        }
    },

    /** Lier l'événement change du sélecteur */
    bind: function(typeKey) {
        var select = document.getElementById('doc-autofill-select');
        if (select) {
            select.addEventListener('change', function() {
                AutoFill.apply(typeKey);
            });
        }
    }
};

window.AutoFill = AutoFill;

var FormEngine = {

    /** Génère le HTML complet du formulaire pour un type donné */
    render: function(typeKey) {
        var config = DOCUMENT_TYPES[typeKey];
        if (!config) return '';

        var html = '<div class="doc-form-title"><span class="material-icons">' + config.icon + '</span>' + DocUtils.esc(config.label) + '</div>';

        // Barre d'auto-remplissage (employé ou client)
        html += AutoFill.renderSelector(typeKey);

        html += '<div class="doc-fields-grid">';

        for (var i = 0; i < config.fields.length; i++) {
            var f = config.fields[i];

            // Séparateur de section
            if (f.section) {
                html += '<div class="doc-form-section"><span class="material-icons">' + (f.icon || 'label') + '</span>' + DocUtils.esc(f.section) + '</div>';
                continue;
            }

            var cls = 'doc-field' + (f.fullWidth ? ' full-width' : '');
            html += '<div class="' + cls + '">';
            html += '<label for="doc-' + f.id + '">' + DocUtils.esc(f.label);
            if (f.required) html += ' <span class="required">*</span>';
            html += '</label>';

            if (f.type === 'select' && f.options) {
                html += '<select id="doc-' + f.id + '" data-field="' + f.id + '">';
                html += '<option value="">-- S\u00e9lectionner --</option>';
                for (var o = 0; o < f.options.length; o++) {
                    html += '<option value="' + DocUtils.esc(f.options[o]) + '">' + DocUtils.esc(f.options[o]) + '</option>';
                }
                html += '</select>';
            } else if (f.type === 'textarea') {
                html += '<textarea id="doc-' + f.id + '" data-field="' + f.id + '" placeholder="' + DocUtils.esc(f.placeholder || '') + '" rows="3">' + DocUtils.esc(f.value || '') + '</textarea>';
            } else {
                html += '<input type="' + f.type + '" id="doc-' + f.id + '" data-field="' + f.id + '"';
                if (f.placeholder) html += ' placeholder="' + DocUtils.esc(f.placeholder) + '"';
                if (f.value) html += ' value="' + DocUtils.esc(f.value) + '"';
                if (f.required) html += ' required';
                html += '>';
            }

            html += '</div>';
        }

        html += '</div>';

        // Lignes pour devis
        if (config.hasLineItems) {
            html += FormEngine.renderLineItems(config);
        }

        // Lignes dynamiques fiche de paie (gains + retenues)
        if (config.hasPayslipLines) {
            html += FormEngine.renderPayslipLines();
        }

        // Boutons d'action
        html += '<div class="doc-actions">';
        html += '<button type="button" class="doc-btn doc-btn-outline" onclick="DocEngine.reset()"><span class="material-icons">refresh</span>R\u00e9initialiser</button>';
        html += '<button type="button" class="doc-btn doc-btn-accent" onclick="DocEngine.preview()"><span class="material-icons">visibility</span>Aper\u00e7u</button>';
        html += '<button type="button" class="doc-btn doc-btn-primary" onclick="DocEngine.downloadPDF()"><span class="material-icons">picture_as_pdf</span>T\u00e9l\u00e9charger PDF</button>';
        html += '<button type="button" class="doc-btn doc-btn-success" onclick="DocEngine.saveAndPrint()"><span class="material-icons">print</span>Enregistrer & Imprimer</button>';
        html += '</div>';

        return html;
    },

    /** Lignes d'articles (devis) */
    renderLineItems: function(config) {
        var cols = config.lineItemColumns || ['D\u00e9signation', 'Qt\u00e9', 'PU', 'Total'];
        var html = '<div class="doc-line-items" id="doc-line-items">';
        html += '<div class="doc-line-items-header">';
        for (var c = 0; c < cols.length; c++) {
            html += '<span>' + DocUtils.esc(cols[c]) + '</span>';
        }
        html += '<span></span>';
        html += '</div>';
        html += '<div id="doc-lines-body">';
        // Ligne initiale
        html += FormEngine.renderLineRow(0);
        html += '</div>';
        html += '<button type="button" class="doc-add-line" onclick="FormEngine.addLine()"><span class="material-icons" style="font-size:1rem">add</span>Ajouter une ligne</button>';
        html += '</div>';
        return html;
    },

    /** Une ligne d'article */
    renderLineRow: function(idx) {
        return '<div class="doc-line-items-row" data-line="' + idx + '">' +
            '<input type="text" data-col="designation" placeholder="Description...">' +
            '<input type="number" data-col="quantite" value="1" min="1">' +
            '<input type="number" data-col="prix_unitaire" value="0" min="0">' +
            '<input type="number" data-col="montant" value="0" readonly tabindex="-1" style="background:#f8fafc;font-weight:600">' +
            '<button type="button" class="doc-line-remove" onclick="FormEngine.removeLine(this)" title="Supprimer"><span class="material-icons" style="font-size:1rem">close</span></button>' +
            '</div>';
    },

    /** Ajouter une ligne */
    addLine: function() {
        var body = document.getElementById('doc-lines-body');
        if (!body) return;
        var idx = body.children.length;
        body.insertAdjacentHTML('beforeend', FormEngine.renderLineRow(idx));
        FormEngine.bindLineCalc();
    },

    /** Supprimer une ligne */
    removeLine: function(btn) {
        var row = btn.closest('.doc-line-items-row');
        if (row) {
            row.remove();
            FormEngine.recalcLines();
        }
    },

    // ─── Lignes dynamiques fiche de paie ───

    /** Rendu des blocs de lignes dynamiques gains + retenues */
    renderPayslipLines: function() {
        var html = '';

        // Bloc gains supplémentaires
        html += '<div class="doc-payslip-lines-block" id="doc-payslip-gains">';
        html += '<div class="doc-payslip-lines-title"><span class="material-icons" style="font-size:1.1rem;color:var(--doc-success)">add_circle</span>Gains supplémentaires</div>';
        html += '<div class="doc-payslip-lines-header">';
        html += '<span>Désignation</span><span>Montant (FCFA)</span><span></span>';
        html += '</div>';
        html += '<div id="doc-payslip-gains-body">';
        html += FormEngine.renderPayslipLineRow('gain', 0);
        html += '</div>';
        html += '<button type="button" class="doc-add-line" onclick="FormEngine.addPayslipLine(\'gain\')">';
        html += '<span class="material-icons" style="font-size:1rem">add</span>Ajouter un gain</button>';
        html += '</div>';

        // Bloc retenues supplémentaires
        html += '<div class="doc-payslip-lines-block" id="doc-payslip-retenues">';
        html += '<div class="doc-payslip-lines-title"><span class="material-icons" style="font-size:1.1rem;color:#ef4444">remove_circle</span>Retenues supplémentaires</div>';
        html += '<div class="doc-payslip-lines-header doc-payslip-lines-header--retenue">';
        html += '<span>Désignation</span><span>Montant (FCFA)</span><span></span>';
        html += '</div>';
        html += '<div id="doc-payslip-retenues-body">';
        html += FormEngine.renderPayslipLineRow('retenue', 0);
        html += '</div>';
        html += '<button type="button" class="doc-add-line" onclick="FormEngine.addPayslipLine(\'retenue\')">';
        html += '<span class="material-icons" style="font-size:1rem">add</span>Ajouter une retenue</button>';
        html += '</div>';

        return html;
    },

    /** Une ligne de gain ou retenue */
    renderPayslipLineRow: function(type, idx) {
        return '<div class="doc-payslip-line-row" data-payslip-type="' + type + '" data-payslip-idx="' + idx + '">' +
            '<input type="text" data-pcol="designation" placeholder="Ex: Prime de chantier...">' +
            '<input type="number" data-pcol="montant" value="0" min="0" placeholder="0">' +
            '<button type="button" class="doc-line-remove" onclick="FormEngine.removePayslipLine(this)" title="Supprimer">' +
            '<span class="material-icons" style="font-size:1rem">close</span></button>' +
            '</div>';
    },

    /** Ajouter une ligne gain ou retenue */
    addPayslipLine: function(type) {
        var bodyId = type === 'gain' ? 'doc-payslip-gains-body' : 'doc-payslip-retenues-body';
        var body = document.getElementById(bodyId);
        if (!body) return;
        var idx = body.children.length;
        body.insertAdjacentHTML('beforeend', FormEngine.renderPayslipLineRow(type, idx));
    },

    /** Supprimer une ligne gain/retenue */
    removePayslipLine: function(btn) {
        var row = btn.closest('.doc-payslip-line-row');
        if (row) row.remove();
    },

    /** Collecter les lignes dynamiques paie */
    collectPayslipLines: function() {
        var result = { gains: [], retenues: [] };
        // Gains
        var gainRows = document.querySelectorAll('#doc-payslip-gains-body .doc-payslip-line-row');
        gainRows.forEach(function(row) {
            var desig = (row.querySelector('[data-pcol="designation"]') || {}).value || '';
            var montant = parseFloat((row.querySelector('[data-pcol="montant"]') || {}).value) || 0;
            if (desig && montant > 0) result.gains.push({ designation: desig, montant: montant });
        });
        // Retenues
        var retRows = document.querySelectorAll('#doc-payslip-retenues-body .doc-payslip-line-row');
        retRows.forEach(function(row) {
            var desig = (row.querySelector('[data-pcol="designation"]') || {}).value || '';
            var montant = parseFloat((row.querySelector('[data-pcol="montant"]') || {}).value) || 0;
            if (desig && montant > 0) result.retenues.push({ designation: desig, montant: montant });
        });
        return result;
    },

    /** Lier les calculs des lignes */
    bindLineCalc: function() {
        var rows = document.querySelectorAll('.doc-line-items-row');
        rows.forEach(function(row) {
            var qte = row.querySelector('[data-col="quantite"]');
            var pu = row.querySelector('[data-col="prix_unitaire"]');
            if (qte && pu) {
                qte.oninput = pu.oninput = function() { FormEngine.recalcLine(row); };
            }
        });
    },

    /** Recalculer une ligne */
    recalcLine: function(row) {
        var qte = parseFloat(row.querySelector('[data-col="quantite"]').value) || 0;
        var pu = parseFloat(row.querySelector('[data-col="prix_unitaire"]').value) || 0;
        var mtInput = row.querySelector('[data-col="montant"]');
        if (mtInput) mtInput.value = (qte * pu);
    },

    /** Recalculer toutes les lignes */
    recalcLines: function() {
        var rows = document.querySelectorAll('.doc-line-items-row');
        rows.forEach(function(row) { FormEngine.recalcLine(row); });
    },

    /** Extraire toutes les donn\u00e9es du formulaire */
    collectData: function() {
        var data = {};
        // Champs simples
        var fields = document.querySelectorAll('#doc-form-container [data-field]');
        fields.forEach(function(el) {
            data[el.getAttribute('data-field')] = el.value;
        });

        // Lignes d'articles
        var rows = document.querySelectorAll('#doc-lines-body .doc-line-items-row');
        if (rows.length > 0) {
            data._lines = [];
            var totalHT = 0;
            rows.forEach(function(row) {
                var line = {
                    designation: (row.querySelector('[data-col="designation"]') || {}).value || '',
                    quantite: parseFloat((row.querySelector('[data-col="quantite"]') || {}).value) || 0,
                    prix_unitaire: parseFloat((row.querySelector('[data-col="prix_unitaire"]') || {}).value) || 0,
                    montant: 0
                };
                line.montant = line.quantite * line.prix_unitaire;
                totalHT += line.montant;
                if (line.designation) data._lines.push(line);
            });
            data._totalHT = totalHT;
            var tva = parseFloat(data.tva) || 0;
            data._totalTVA = totalHT * tva / 100;
            data._totalTTC = totalHT + data._totalTVA;
        }

        // Lignes dynamiques fiche de paie
        var payslipGainsBody = document.getElementById('doc-payslip-gains-body');
        if (payslipGainsBody) {
            data._payslipLines = FormEngine.collectPayslipLines();
        }

        // Calculs sp\u00e9cifiques fiche de paie
        if (data.salaire_base && document.querySelector('#doc-mois')) {
            data._payslip = FormEngine.calcPayslip(data);
        }

        // Calcul montant TTC pour contrat prestation
        if (data.montant_total && data.tva) {
            data.montant_ttc = DocUtils.montantFR(parseFloat(data.montant_total) * (1 + parseFloat(data.tva) / 100));
        }

        return data;
    },

    /** Calculs fiche de paie */
    calcPayslip: function(d) {
        var base = parseFloat(d.salaire_base) || 0;
        var heuresSup = parseFloat(d.heures_sup) || 0;
        var transport = parseFloat(d.prime_transport) || 0;
        var logement = parseFloat(d.prime_logement) || 0;
        var anciennete = parseFloat(d.prime_anciennete) || 0;
        var autresPrimes = parseFloat(d.autres_primes) || 0;

        // Gains supplémentaires dynamiques
        var gainsCustom = [];
        var totalGainsCustom = 0;
        if (d._payslipLines && d._payslipLines.gains) {
            gainsCustom = d._payslipLines.gains;
            for (var g = 0; g < gainsCustom.length; g++) {
                totalGainsCustom += gainsCustom[g].montant;
            }
        }

        var brutTotal = base + heuresSup + transport + logement + anciennete + autresPrimes + totalGainsCustom;

        var ipresGen = brutTotal * (parseFloat(d.ipres_general) || 0) / 100;
        var ipresCadre = brutTotal * (parseFloat(d.ipres_cadre) || 0) / 100;
        var ir = brutTotal * (parseFloat(d.ir) || 0) / 100;
        var css = brutTotal * (parseFloat(d.css) || 0) / 100;
        var autresRet = parseFloat(d.autres_retenues) || 0;
        var avance = parseFloat(d.avance_salaire) || 0;

        // Retenues supplémentaires dynamiques
        var retenuesCustom = [];
        var totalRetenuesCustom = 0;
        if (d._payslipLines && d._payslipLines.retenues) {
            retenuesCustom = d._payslipLines.retenues;
            for (var r = 0; r < retenuesCustom.length; r++) {
                totalRetenuesCustom += retenuesCustom[r].montant;
            }
        }

        var totalRetenues = ipresGen + ipresCadre + ir + css + autresRet + avance + totalRetenuesCustom;
        var net = brutTotal - totalRetenues;

        return {
            salaire_base: base,
            heures_sup: heuresSup,
            prime_transport: transport,
            prime_logement: logement,
            prime_anciennete: anciennete,
            autres_primes: autresPrimes,
            gains_custom: gainsCustom,
            total_gains_custom: totalGainsCustom,
            brut: brutTotal,
            ipres_general: ipresGen,
            ipres_cadre: ipresCadre,
            ir: ir,
            css: css,
            autres_retenues: autresRet,
            avance_salaire: avance,
            retenues_custom: retenuesCustom,
            total_retenues_custom: totalRetenuesCustom,
            total_retenues: totalRetenues,
            net: net
        };
    },

    /** V\u00e9rifier les champs requis */
    validate: function(typeKey) {
        var config = DOCUMENT_TYPES[typeKey];
        if (!config) {
            console.error('[DocEngine] Type inconnu:', typeKey);
            DocUtils.toast('Type de document inconnu', 'error');
            return false;
        }
        var valid = true;
        var missing = [];
        var firstInvalid = null;
        var container = document.getElementById('doc-form-container');

        for (var i = 0; i < config.fields.length; i++) {
            var f = config.fields[i];
            if (f.section || !f.required) continue;

            // Chercher dans le conteneur du formulaire
            var el = container ? container.querySelector('#doc-' + f.id) : document.getElementById('doc-' + f.id);
            var val = el ? (el.value || '').trim() : '';

            if (!el || !val) {
                if (el) {
                    el.style.borderColor = '#ef4444';
                    el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
                }
                missing.push(f.label);
                if (!firstInvalid && el) firstInvalid = el;
                valid = false;
            } else {
                el.style.borderColor = '';
                el.style.boxShadow = '';
            }
        }

        if (!valid) {
            var msg = missing.length <= 3
                ? 'Champs manquants : ' + missing.join(', ')
                : missing.length + ' champs obligatoires manquants';
            DocUtils.toast(msg, 'error');
            console.warn('[DocEngine] Validation:', typeKey, '- Manquants:', missing);
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                try { firstInvalid.focus(); } catch(e) {}
            }
        }
        return valid;
    }
};

// Rendre accessible globalement
window.FormEngine = FormEngine;

// ═══════════════════════════════════════════════════
// 5. MOTEUR DE RENDU DOCUMENT A4
// ═══════════════════════════════════════════════════

var DocRenderer = {

    /** G\u00e9n\u00e8re le HTML complet du document A4 */
    render: function(typeKey, data) {
        var config = DOCUMENT_TYPES[typeKey];
        if (!config) return '<p>Type de document inconnu</p>';

        var html = '<div class="kfs-doc" data-watermark="' + DocUtils.esc(config.watermark || '') + '">';

        // 1. Header
        html += DocRenderer.renderHeader(data);

        // 2. S\u00e9parateur
        html += '<div class="kfs-header-separator"></div>';

        // 3. Titre
        html += DocRenderer.renderTitle(config, data);

        // 4. Parties (si applicable)
        if (config.hasParties) {
            html += DocRenderer.renderParties(typeKey, data);
        }

        // 5. Corps : fiche de paie, articles, ou rendu libre
        if (config.isPayslip) {
            html += DocRenderer.renderPayslip(data);
        } else if (config.isFreeform && config.renderBody) {
            html += config.renderBody(data);
        } else if (config.hasArticles && config.articles) {
            html += DocRenderer.renderArticles(config, data);
        }

        // 6. Tableau (devis / lignes)
        if (config.hasLineItems && data._lines && data._lines.length > 0) {
            html += DocRenderer.renderTable(config, data);
            html += DocRenderer.renderTotals(data);
        }

        // 7. Mentions
        if (config.hasMentions && config.mentions) {
            html += DocRenderer.renderMentions(config);
        }

        // 8. Footer + signatures
        html += DocRenderer.renderFooter(config, data);

        // 9. Zone QR (placeholder)
        html += '<div class="kfs-qr-zone">QR</div>';

        html += '</div>';
        return html;
    },

    /** Header 2 colonnes */
    renderHeader: function(data) {
        var logoSrc = (typeof LOGO_KFS_BASE64 !== 'undefined') ? LOGO_KFS_BASE64 : 'assets/logo-kfs-btp.jpeg';
        
        var html = '<div class="kfs-doc-header">';
        // Colonne gauche
        html += '<div class="kfs-header-left">';
        html += '<img src="' + logoSrc + '" alt="Logo ' + DocUtils.esc(COMPANY.nom) + '" class="kfs-header-logo">';
        html += '<div class="kfs-header-company">';
        html += '<h1>' + DocUtils.esc(COMPANY.nom) + '</h1>';
        html += '<div class="kfs-slogan">' + DocUtils.esc(COMPANY.slogan) + '</div>';
        html += '<div class="kfs-header-contact">';
        html += '<span>' + DocUtils.esc(COMPANY.adresse) + '</span>';
        html += '<span>NINEA : ' + DocUtils.esc(COMPANY.ninea) + ' | RCCM : ' + DocUtils.esc(COMPANY.rccm) + '</span>';
        html += '<span>T\u00e9l : ' + DocUtils.esc(COMPANY.telephone) + ' | Email : ' + DocUtils.esc(COMPANY.email) + '</span>';
        html += '</div></div></div>';
        
        // Colonne droite
        html += '<div class="kfs-header-right">';
        html += '<div class="kfs-flag-container">';
        html += '<div class="kfs-flag" style="width:60px;height:40px;display:flex;border-radius:4px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.15)">';
        html += '<div class="kfs-flag-green" style="flex:1;background:#00853F;-webkit-print-color-adjust:exact;print-color-adjust:exact"></div>';
        html += '<div class="kfs-flag-yellow" style="flex:1;background:#FDEF42;display:flex;align-items:center;justify-content:center;-webkit-print-color-adjust:exact;print-color-adjust:exact"><span class="kfs-flag-star" style="color:#00853F;font-size:14px;line-height:1">\u2605</span></div>';
        html += '<div class="kfs-flag-red" style="flex:1;background:#E31B23;-webkit-print-color-adjust:exact;print-color-adjust:exact"></div>';
        html += '</div>';
        html += '<div class="kfs-devise">Un Peuple \u2013 Un But \u2013 Une Foi</div>';
        html += '</div>';
        if (data.numero) {
            html += '<div class="kfs-doc-ref">R\u00e9f : ' + DocUtils.esc(data.numero) + '</div>';
        }
        html += '</div>';
        html += '</div>';
        return html;
    },

    /** Titre centr\u00e9 */
    renderTitle: function(config, data) {
        var html = '<div class="kfs-doc-title">';
        html += '<h2>' + DocUtils.esc(config.titleText) + '</h2>';
        html += '<div class="kfs-title-line"></div>';
        // Sous-titre p\u00e9riode pour fiche de paie
        if (config.isPayslip && data.mois && data.annee) {
            html += '<div class="kfs-doc-subtitle bp-periode">P\u00e9riode : ' + DocUtils.esc(data.mois) + ' ' + DocUtils.esc(data.annee) + '</div>';
        }
        if (data.type_contrat) {
            html += '<div class="kfs-doc-subtitle">' + DocUtils.esc(data.type_contrat) + '</div>';
        }
        if (data.type_bail) {
            html += '<div class="kfs-doc-subtitle">' + DocUtils.esc(data.type_bail) + '</div>';
        }
        html += '</div>';
        return html;
    },

    /** Entre les parties */
    renderParties: function(typeKey, data) {
        var html = '<div class="kfs-parties">';

        // Partie 1 : l'entreprise (toujours)
        html += '<div class="kfs-party employer">';
        html += '<div class="kfs-party-label">D\'une part</div>';
        html += '<div class="kfs-party-name">' + DocUtils.esc(COMPANY.nom) + '</div>';
        html += '<div class="kfs-party-details">';
        html += DocUtils.esc(COMPANY.adresse) + '<br>';
        html += 'NINEA : ' + DocUtils.esc(COMPANY.ninea) + ' | RCCM : ' + DocUtils.esc(COMPANY.rccm) + '<br>';
        html += 'Repr\u00e9sent\u00e9e par ' + DocUtils.esc(COMPANY.gerant);
        html += '</div></div>';

        // Partie 2 : selon le type
        html += '<div class="kfs-party client">';
        html += '<div class="kfs-party-label">D\'autre part</div>';

        if (typeKey === 'contrat_travail') {
            html += '<div class="kfs-party-name">' + DocUtils.esc(data.employe_nom || '') + '</div>';
            html += '<div class="kfs-party-details">';
            if (data.employe_adresse) html += DocUtils.esc(data.employe_adresse) + '<br>';
            if (data.employe_cni) html += 'CNI : ' + DocUtils.esc(data.employe_cni) + '<br>';
            if (data.employe_nationalite) html += 'Nationalit\u00e9 : ' + DocUtils.esc(data.employe_nationalite);
            html += '</div>';
        } else if (typeKey.indexOf('location') !== -1 || typeKey === 'contrat_bail' || typeKey === 'quittance_loyer' || typeKey === 'etat_des_lieux') {
            html += '<div class="kfs-party-name">' + DocUtils.esc(data.locataire_nom || '') + '</div>';
            html += '<div class="kfs-party-details">';
            if (data.locataire_adresse) html += DocUtils.esc(data.locataire_adresse) + '<br>';
            if (data.locataire_cni) html += 'CNI/Passeport : ' + DocUtils.esc(data.locataire_cni) + '<br>';
            if (data.locataire_telephone) html += 'T\u00e9l : ' + DocUtils.esc(data.locataire_telephone);
            html += '</div>';
        } else if (typeKey === 'contrat_gestion_locative') {
            html += '<div class="kfs-party-name">' + DocUtils.esc(data.proprietaire_nom || '') + '</div>';
            html += '<div class="kfs-party-details">';
            if (data.proprietaire_adresse) html += DocUtils.esc(data.proprietaire_adresse) + '<br>';
            if (data.proprietaire_cni) html += 'CNI/Passeport : ' + DocUtils.esc(data.proprietaire_cni) + '<br>';
            if (data.proprietaire_telephone) html += 'T\u00e9l : ' + DocUtils.esc(data.proprietaire_telephone) + '<br>';
            if (data.proprietaire_email) html += 'Email : ' + DocUtils.esc(data.proprietaire_email);
            html += '</div>';
        } else {
            html += '<div class="kfs-party-name">' + DocUtils.esc(data.client_nom || '') + '</div>';
            html += '<div class="kfs-party-details">';
            if (data.client_adresse) html += DocUtils.esc(data.client_adresse) + '<br>';
            if (data.client_telephone) html += 'T\u00e9l : ' + DocUtils.esc(data.client_telephone) + '<br>';
            if (data.client_email) html += 'Email : ' + DocUtils.esc(data.client_email);
            if (data.client_representant) html += '<br>Repr\u00e9sent\u00e9 par : ' + DocUtils.esc(data.client_representant);
            html += '</div>';
        }
        html += '</div></div>';
        return html;
    },

    /** Articles num\u00e9rot\u00e9s */
    renderArticles: function(config, data) {
        var html = '<div class="kfs-articles">';
        for (var i = 0; i < config.articles.length; i++) {
            var art = config.articles[i];
            html += '<div class="kfs-article">';
            html += '<div class="kfs-article-header">Article ' + (i + 1) + ' \u2014 ' + DocUtils.esc(art.title) + '</div>';
            html += '<div class="kfs-article-content">';
            // Remplacer les placeholders {xxx} par les valeurs du formulaire
            var content = art.content;
            content = content.replace(/\{(\w+)\}/g, function(match, key) {
                if (data[key] !== undefined && data[key] !== '') {
                    // Formater les montants
                    if (key.indexOf('montant') !== -1 || key === 'loyer_mensuel' || key === 'loyer_prevu' || key === 'caution' || key === 'charges' || key === 'salaire_base' || key === 'prime_transport' || key === 'prime_logement' || key === 'frais_mise_location') {
                        return DocUtils.montantFR(data[key]);
                    }
                    // Formater les dates
                    if (key.indexOf('date') !== -1) {
                        return DocUtils.dateLongueFR(data[key]);
                    }
                    return DocUtils.esc(data[key]);
                }
                return '<span style="color:#999">[' + key + ']</span>';
            });
            // Convertir les sauts de ligne en <p> ou <br>
            var paragraphs = content.split('\n');
            for (var p = 0; p < paragraphs.length; p++) {
                if (paragraphs[p].trim()) {
                    html += '<p>' + paragraphs[p] + '</p>';
                }
            }
            html += '</div></div>';
        }
        html += '</div>';
        return html;
    },

    /** Tableau de lignes (devis) */
    renderTable: function(config, data) {
        var cols = config.lineItemColumns || ['D\u00e9signation', 'Qt\u00e9', 'PU', 'Total'];
        var html = '<div class="kfs-table-wrapper">';
        html += '<table class="kfs-table">';
        html += '<thead><tr>';
        for (var c = 0; c < cols.length; c++) {
            html += '<th>' + DocUtils.esc(cols[c]) + '</th>';
        }
        html += '</tr></thead><tbody>';
        for (var i = 0; i < data._lines.length; i++) {
            var ln = data._lines[i];
            html += '<tr>';
            html += '<td>' + DocUtils.esc(ln.designation) + '</td>';
            html += '<td>' + ln.quantite + '</td>';
            html += '<td>' + DocUtils.montantNum(ln.prix_unitaire) + '</td>';
            html += '<td>' + DocUtils.montantNum(ln.montant) + '</td>';
            html += '</tr>';
        }
        html += '</tbody></table>';
        html += '</div>';
        return html;
    },

    /** Totaux */
    renderTotals: function(data) {
        var html = '<div class="kfs-totals"><div class="kfs-totals-box">';
        html += '<div class="kfs-totals-row"><span>Total HT</span><span>' + DocUtils.montantFR(data._totalHT) + '</span></div>';
        if (data._totalTVA > 0) {
            html += '<div class="kfs-totals-row"><span>TVA (' + (data.tva || 0) + '%)</span><span>' + DocUtils.montantFR(data._totalTVA) + '</span></div>';
        }
        html += '<div class="kfs-totals-row total"><span>Total TTC</span><span>' + DocUtils.montantFR(data._totalTTC || data._totalHT) + '</span></div>';
        html += '</div></div>';
        return html;
    },

    /** Rendu fiche de paie */
    renderPayslip: function(data) {
        var p = data._payslip;
        if (!p) return '';

        var mF = DocUtils.montantNum;
        var esc = DocUtils.esc;

        var html = '';

        // ── Bandeau période de paie ──
        html += '<div class="bp-periode-band">';
        html += '<span class="bp-periode-label">P\u00e9riode de paie :</span> ';
        html += '<span class="bp-periode-value">' + esc(data.mois || '') + ' ' + esc(data.annee || '') + '</span>';
        if (data.date_paiement) {
            html += ' &mdash; <span class="bp-date-paiement">Pay\u00e9 le ' + DocUtils.dateLongueFR(data.date_paiement) + '</span>';
        }
        html += '</div>';

        // ── Bloc infos employé / entreprise ──
        html += '<div class="bp-info-grid">';
        // Colonne gauche : infos entreprise + employé professionnel
        html += '<div class="bp-info-left">';
        html += '<div class="bp-section-title">EMPLOYEUR</div>';
        html += '<div class="bp-info-row"><span class="bp-lbl">Soci\u00e9t\u00e9 :</span> <span>' + esc(COMPANY.nom) + '</span></div>';
        html += '<div class="bp-info-row"><span class="bp-lbl">Adresse :</span> <span>' + esc(COMPANY.adresse) + '</span></div>';
        html += '<div class="bp-info-row"><span class="bp-lbl">NINEA :</span> <span>' + esc(COMPANY.ninea) + '</span></div>';
        html += '<div class="bp-info-row"><span class="bp-lbl">RCCM :</span> <span>' + esc(COMPANY.rccm) + '</span></div>';
        html += '<div class="bp-info-spacer"></div>';
        html += '<div class="bp-section-title">CLASSIFICATION</div>';
        html += '<div class="bp-info-row"><span class="bp-lbl">Emploi :</span> <span>' + esc(data.employe_poste) + '</span></div>';
        if (data.employe_statut) html += '<div class="bp-info-row"><span class="bp-lbl">Statut prof. :</span> <span>' + esc(data.employe_statut) + '</span></div>';
        if (data.employe_categorie) html += '<div class="bp-info-row"><span class="bp-lbl">Cat\u00e9gorie / Niveau :</span> <span>' + esc(data.employe_categorie) + '</span></div>';
        if (data.employe_coefficient) html += '<div class="bp-info-row"><span class="bp-lbl">Coefficient :</span> <span>' + esc(data.employe_coefficient) + '</span></div>';
        if (data.employe_date_embauche) {
            html += '<div class="bp-info-row"><span class="bp-lbl">Date d\'embauche :</span> <span>' + DocUtils.dateFR(data.employe_date_embauche) + '</span></div>';
        }
        if (data.employe_anciennete) html += '<div class="bp-info-row"><span class="bp-lbl">Anciennet\u00e9 :</span> <span>' + esc(data.employe_anciennete) + '</span></div>';
        html += '</div>';
        // Colonne droite : infos personnelles salarié
        html += '<div class="bp-info-right">';
        html += '<div class="bp-salarie-box">';
        html += '<div class="bp-section-title">SALARI\u00c9</div>';
        html += '<div class="bp-salarie-nom">' + esc(data.employe_nom) + '</div>';
        if (data.employe_matricule) html += '<div class="bp-salarie-details"><strong>Matricule :</strong> ' + esc(data.employe_matricule) + '</div>';
        if (data.employe_num_ss) html += '<div class="bp-salarie-details"><strong>N\u00b0 S\u00e9curit\u00e9 Sociale :</strong> ' + esc(data.employe_num_ss) + '</div>';
        // Infos personnelles
        if (data.employe_date_naissance) {
            var naissance = 'N\u00e9(e) le ' + DocUtils.dateFR(data.employe_date_naissance);
            if (data.employe_lieu_naissance) naissance += ' \u00e0 ' + esc(data.employe_lieu_naissance);
            html += '<div class="bp-salarie-details">' + naissance + '</div>';
        }
        if (data.employe_nationalite) html += '<div class="bp-salarie-details"><strong>Nationalit\u00e9 :</strong> ' + esc(data.employe_nationalite) + '</div>';
        if (data.employe_adresse) html += '<div class="bp-salarie-details"><strong>Adresse :</strong> ' + esc(data.employe_adresse) + '</div>';
        if (data.employe_telephone) html += '<div class="bp-salarie-details"><strong>T\u00e9l :</strong> ' + esc(data.employe_telephone) + '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        // ── Tableau principal des éléments de paie ──
        html += '<table class="bp-table">';
        html += '<thead><tr>';
        html += '<th class="bp-col-element">\u00c9l\u00e9ments de paie</th>';
        html += '<th class="bp-col-base">Base</th>';
        html += '<th class="bp-col-taux">Taux</th>';
        html += '<th class="bp-col-deduire">\u00c0 d\u00e9duire</th>';
        html += '<th class="bp-col-payer">\u00c0 payer</th>';
        html += '</tr></thead>';
        html += '<tbody>';

        // ── Section Rémunération ──
        // Salaire de base
        html += '<tr><td class="bp-el">Salaire de base</td><td class="bp-num">' + mF(p.salaire_base) + '</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-payer">' + mF(p.salaire_base) + '</td></tr>';

        // Heures supplémentaires
        if (p.heures_sup > 0) {
            html += '<tr><td class="bp-el">Heures suppl\u00e9mentaires</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-payer">' + mF(p.heures_sup) + '</td></tr>';
        }

        // Prime de transport
        if (p.prime_transport > 0) {
            html += '<tr><td class="bp-el">Prime de transport</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-payer">' + mF(p.prime_transport) + '</td></tr>';
        }

        // Indemnité logement
        if (p.prime_logement > 0) {
            html += '<tr><td class="bp-el">Indemnit\u00e9 de logement</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-payer">' + mF(p.prime_logement) + '</td></tr>';
        }

        // Prime ancienneté
        if (p.prime_anciennete > 0) {
            html += '<tr><td class="bp-el">Prime d\'anciennet\u00e9</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-payer">' + mF(p.prime_anciennete) + '</td></tr>';
        }

        // Autres primes
        if (p.autres_primes > 0) {
            html += '<tr><td class="bp-el">Autres primes</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-payer">' + mF(p.autres_primes) + '</td></tr>';
        }

        // Gains supplémentaires dynamiques
        if (p.gains_custom && p.gains_custom.length > 0) {
            for (var gi = 0; gi < p.gains_custom.length; gi++) {
                html += '<tr><td class="bp-el">' + esc(p.gains_custom[gi].designation) + '</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-payer">' + mF(p.gains_custom[gi].montant) + '</td></tr>';
            }
        }

        // Ligne SALAIRE BRUT
        html += '<tr class="bp-row-brut"><td class="bp-el bp-bold">Salaire brut</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-payer bp-bold">' + mF(p.brut) + '</td></tr>';

        // ── Ligne séparatrice ──
        html += '<tr class="bp-separator"><td colspan="5"></td></tr>';

        // ── Section Retenues ──
        if (p.ipres_general > 0) {
            html += '<tr><td class="bp-el">IPRES R\u00e9gime g\u00e9n\u00e9ral</td><td class="bp-num">' + mF(p.brut) + '</td><td class="bp-num">' + (parseFloat(data.ipres_general) || 0) + '%</td><td class="bp-num bp-deduire">' + mF(p.ipres_general) + '</td><td class="bp-num"></td></tr>';
        }
        if (p.ipres_cadre > 0) {
            html += '<tr><td class="bp-el">IPRES R\u00e9gime cadre</td><td class="bp-num">' + mF(p.brut) + '</td><td class="bp-num">' + (parseFloat(data.ipres_cadre) || 0) + '%</td><td class="bp-num bp-deduire">' + mF(p.ipres_cadre) + '</td><td class="bp-num"></td></tr>';
        }
        if (p.css > 0) {
            html += '<tr><td class="bp-el">CSS (Contribution Sociale)</td><td class="bp-num">' + mF(p.brut) + '</td><td class="bp-num">' + (parseFloat(data.css) || 0) + '%</td><td class="bp-num bp-deduire">' + mF(p.css) + '</td><td class="bp-num"></td></tr>';
        }
        if (p.ir > 0) {
            html += '<tr><td class="bp-el">Imp\u00f4t sur le revenu</td><td class="bp-num">' + mF(p.brut) + '</td><td class="bp-num">' + (parseFloat(data.ir) || 0) + '%</td><td class="bp-num bp-deduire">' + mF(p.ir) + '</td><td class="bp-num"></td></tr>';
        }
        if (p.autres_retenues > 0) {
            html += '<tr><td class="bp-el">Autres retenues</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-deduire">' + mF(p.autres_retenues) + '</td><td class="bp-num"></td></tr>';
        }
        if (p.avance_salaire > 0) {
            html += '<tr><td class="bp-el">Avance sur salaire</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-deduire">' + mF(p.avance_salaire) + '</td><td class="bp-num"></td></tr>';
        }

        // Retenues supplémentaires dynamiques
        if (p.retenues_custom && p.retenues_custom.length > 0) {
            for (var ri = 0; ri < p.retenues_custom.length; ri++) {
                html += '<tr><td class="bp-el">' + esc(p.retenues_custom[ri].designation) + '</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-deduire">' + mF(p.retenues_custom[ri].montant) + '</td><td class="bp-num"></td></tr>';
            }
        }

        // Ligne TOTAL RETENUES
        html += '<tr class="bp-row-retenues"><td class="bp-el bp-bold">Total des retenues</td><td class="bp-num"></td><td class="bp-num"></td><td class="bp-num bp-deduire bp-bold">' + mF(p.total_retenues) + '</td><td class="bp-num"></td></tr>';

        html += '</tbody></table>';

        // ── Tableau récapitulatif bas ──
        html += '<table class="bp-summary-table">';
        html += '<thead><tr>';
        html += '<th>Salaire brut</th>';
        html += '<th>Total retenues</th>';
        html += '<th>Net \u00e0 payer</th>';
        html += '</tr></thead>';
        html += '<tbody><tr>';
        html += '<td>' + DocUtils.montantFR(p.brut) + '</td>';
        html += '<td>' + DocUtils.montantFR(p.total_retenues) + '</td>';
        html += '<td class="bp-bold">' + DocUtils.montantFR(p.net) + '</td>';
        html += '</tr></tbody></table>';

        // ── Encadré NET À PAYER ──
        html += '<div class="bp-net-box">';
        html += '<span class="bp-net-label">Net pay\u00e9 :</span>';
        html += '<span class="bp-net-amount">' + DocUtils.montantFR(p.net) + '</span>';
        html += '</div>';

        // ── Paiement info ──
        var datePaie = data.date_paiement ? DocUtils.dateLongueFR(data.date_paiement) : (data.date ? DocUtils.dateLongueFR(data.date) : DocUtils.dateLongueFR(DocUtils.today()));
        html += '<div class="bp-paiement-info">';
        html += '<strong>Mode de paiement :</strong> Virement / Esp\u00e8ces';
        html += ' &mdash; <strong>Pay\u00e9 le :</strong> ' + datePaie;
        html += '</div>';

        // ── Période rappel ──
        html += '<div class="bp-paiement-info bp-periode-rappel">';
        html += 'Bulletin correspondant \u00e0 la p\u00e9riode : <strong>' + DocUtils.esc(data.mois || '') + ' ' + DocUtils.esc(data.annee || '') + '</strong>';
        html += '</div>';

        return html;
    },

    /** Mentions l\u00e9gales */
    renderMentions: function(config) {
        var html = '<div class="kfs-mentions">';
        html += '<div class="kfs-mentions-title">Mentions l\u00e9gales & conditions</div>';
        html += '<ul>';
        for (var i = 0; i < config.mentions.length; i++) {
            html += '<li>' + DocUtils.esc(config.mentions[i]) + '</li>';
        }
        html += '</ul></div>';
        return html;
    },

    /** Footer : fait \u00e0, signatures */
    renderFooter: function(config, data) {
        var html = '<div class="kfs-doc-footer">';
        var dateStr = data.date ? DocUtils.dateLongueFR(data.date) : DocUtils.dateLongueFR(DocUtils.today());
        html += '<div class="kfs-fait-a">Fait \u00e0 ' + DocUtils.esc(COMPANY.ville) + ', le ' + dateStr + '</div>';

        if (config.signatures && config.signatures.length > 0) {
            html += '<div class="kfs-signatures">';
            for (var i = 0; i < config.signatures.length; i++) {
                var sig = config.signatures[i];
                html += '<div class="kfs-signature-block">';
                html += '<div class="kfs-signature-label">' + DocUtils.esc(sig.label) + '</div>';
                html += '<div class="kfs-signature-line"></div>';

                // Nom : soit fixe, soit rempli depuis le formulaire
                var sigName = sig.name;
                if (!sigName && data.employe_nom) sigName = data.employe_nom;
                if (!sigName && data.locataire_nom) sigName = data.locataire_nom;
                if (!sigName && data.client_nom) sigName = data.client_nom;
                html += '<div class="kfs-signature-name">' + DocUtils.esc(sigName || '') + '</div>';
                html += '<div class="kfs-signature-function">' + DocUtils.esc(sig.fonction || '') + '</div>';
                html += '</div>';
            }
            html += '</div>';
        }

        html += '</div>';
        return html;
    }
};

// ═══════════════════════════════════════════════════
// 6. HISTORIQUE DES DOCUMENTS (localStorage + Firebase)
// ═══════════════════════════════════════════════════

var DocHistory = {
    STORAGE_KEY: 'kfs_documents_v2',
    _firebaseLoaded: false,

    getAll: function() {
        try {
            return JSON.parse(localStorage.getItem(DocHistory.STORAGE_KEY) || '[]');
        } catch (e) { return []; }
    },

    /** Charger les documents depuis Firebase */
    loadFromFirebase: function(callback) {
        if (typeof DataStore === 'undefined' || !window.isFirebaseConfigured || !window.isFirebaseConfigured()) {
            if (callback) callback();
            return;
        }
        DataStore.getAll(DocHistory.STORAGE_KEY).then(function(firebaseDocs) {
            if (firebaseDocs && firebaseDocs.length > 0) {
                var localDocs = DocHistory.getAll();
                var firebaseIds = {};
                for (var i = 0; i < firebaseDocs.length; i++) {
                    firebaseIds[firebaseDocs[i].id] = true;
                }
                for (var j = 0; j < localDocs.length; j++) {
                    if (!firebaseIds[localDocs[j].id]) {
                        firebaseDocs.push(localDocs[j]);
                        DocHistory._syncToFirebase(localDocs[j]);
                    }
                }
                firebaseDocs.sort(function(a, b) {
                    return (b.createdAt || '').localeCompare(a.createdAt || '');
                });
                localStorage.setItem(DocHistory.STORAGE_KEY, JSON.stringify(firebaseDocs));
                console.log('Documents Firebase: ' + firebaseDocs.length + ' docs');
            } else {
                var localOnly = DocHistory.getAll();
                if (localOnly.length > 0) {
                    console.log('Upload initial de ' + localOnly.length + ' documents vers Firebase...');
                    for (var k = 0; k < localOnly.length; k++) {
                        DocHistory._syncToFirebase(localOnly[k]);
                    }
                }
            }
            DocHistory._firebaseLoaded = true;
            if (callback) callback();
        }).catch(function(e) {
            console.warn('Erreur chargement documents Firebase:', e);
            DocHistory._firebaseLoaded = true;
            if (callback) callback();
        });
    },

    save: function(doc) {
        var docs = DocHistory.getAll();
        doc.id = DocUtils.uid();
        doc.createdAt = new Date().toISOString();
        docs.unshift(doc);
        // Limiter \u00e0 200 documents
        if (docs.length > 200) docs = docs.slice(0, 200);
        localStorage.setItem(DocHistory.STORAGE_KEY, JSON.stringify(docs));
        DocHistory._syncToFirebase(doc);
        return doc;
    },

    _syncToFirebase: function(doc) {
        if (typeof DataStore === 'undefined' || !window.isFirebaseConfigured || !window.isFirebaseConfigured()) return;
        try {
            DataStore.add(DocHistory.STORAGE_KEY, doc).then(function() {
                console.log('Document sync Firebase: ' + (doc.title || doc.id));
            }).catch(function(e) {
                console.warn('Erreur sync document Firebase:', e);
            });
        } catch(e) {
            console.warn('Erreur sync Firebase:', e);
        }
    },

    remove: function(id) {
        var docs = DocHistory.getAll().filter(function(d) { return d.id !== id; });
        localStorage.setItem(DocHistory.STORAGE_KEY, JSON.stringify(docs));
        if (typeof DataStore !== 'undefined' && window.isFirebaseConfigured && window.isFirebaseConfigured()) {
            DataStore.delete(DocHistory.STORAGE_KEY, id).then(function() {
                console.log('Document supprime de Firebase: ' + id);
            }).catch(function(e) {
                console.warn('Erreur suppression Firebase:', e);
            });
        }
    },

    getStats: function() {
        var docs = DocHistory.getAll();
        var stats = { total: docs.length };
        var types = {};
        for (var i = 0; i < docs.length; i++) {
            types[docs[i].type] = (types[docs[i].type] || 0) + 1;
        }
        stats.byType = types;
        return stats;
    },

    /** Rendu de la liste */
    renderList: function() {
        var container = document.getElementById('doc-history-list');
        if (!container) return;
        var docs = DocHistory.getAll();

        if (docs.length === 0) {
            container.innerHTML = '<div class="doc-history-empty"><span class="material-icons">folder_open</span>Aucun document g\u00e9n\u00e9r\u00e9</div>';
            return;
        }

        var html = '';
        for (var i = 0; i < docs.length; i++) {
            var doc = docs[i];
            var config = DOCUMENT_TYPES[doc.type] || {};
            var bgColors = { commercial: '#2563eb', immobilier: '#059669', rh: '#7c3aed' };
            var bg = bgColors[config.category] || '#64748b';

            html += '<div class="doc-history-item" data-doc-id="' + doc.id + '">';
            html += '<div class="doc-history-icon" style="background:' + bg + '"><span class="material-icons">' + (config.icon || 'description') + '</span></div>';
            html += '<div class="doc-history-info">';
            html += '<h4>' + DocUtils.esc(doc.title || config.label || doc.type) + '</h4>';
            html += '<p>' + DocUtils.esc(doc.numero || '') + ' \u2014 ' + DocUtils.dateFR(doc.date || doc.createdAt.substring(0, 10)) + '</p>';
            html += '</div>';
            html += '<div class="doc-history-actions">';
            html += '<button onclick="DocEngine.reopen(\'' + doc.id + '\')" title="R\u00e9ouvrir"><span class="material-icons">open_in_new</span></button>';
            html += '<button onclick="DocEngine.redownload(\'' + doc.id + '\')" title="Re-t\u00e9l\u00e9charger PDF"><span class="material-icons">download</span></button>';
            html += '<button onclick="DocEngine.deleteDoc(\'' + doc.id + '\')" title="Supprimer"><span class="material-icons">delete</span></button>';
            html += '</div></div>';
        }
        container.innerHTML = html;
    },

    /** Rendu des stats */
    renderStats: function() {
        var container = document.getElementById('doc-stats-grid');
        if (!container) return;
        var stats = DocHistory.getStats();
        var html = '<div class="doc-stat-card"><div class="doc-stat-number">' + stats.total + '</div><div class="doc-stat-label">Documents</div></div>';
        
        // Stats par cat\u00e9gorie
        var catLabels = { commercial: 'Commercial', immobilier: 'Immobilier', rh: 'RH' };
        var catCounts = {};
        for (var type in stats.byType) {
            var cfg = DOCUMENT_TYPES[type];
            if (cfg) {
                var cat = cfg.category || 'autre';
                catCounts[cat] = (catCounts[cat] || 0) + stats.byType[type];
            }
        }
        for (var cat in catCounts) {
            html += '<div class="doc-stat-card"><div class="doc-stat-number">' + catCounts[cat] + '</div><div class="doc-stat-label">' + (catLabels[cat] || cat) + '</div></div>';
        }
        container.innerHTML = html;
    }
};

// ═══════════════════════════════════════════════════
// 7. EXPORT PDF
// ═══════════════════════════════════════════════════

var DocExport = {

    /** Cache du CSS documents.css (chargé une fois) */
    _cssCache: null,

    /** Charge le CSS depuis le fichier documents.css en texte brut via fetch */
    loadCSS: function(callback) {
        // Si déjà en cache, retourner directement
        if (DocExport._cssCache !== null) {
            callback(DocExport._cssCache);
            return;
        }

        // Trouver l'URL du CSS
        var cssUrl = '';
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for (var i = 0; i < links.length; i++) {
            if ((links[i].href || '').indexOf('documents.css') !== -1) {
                cssUrl = links[i].href;
                break;
            }
        }

        if (!cssUrl) {
            // Essayer chemin relatif
            cssUrl = 'admin/documents/documents.css';
        }

        fetch(cssUrl).then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.text();
        }).then(function(cssText) {
            DocExport._cssCache = cssText;
            callback(cssText);
        }).catch(function(err) {
            console.warn('[DocExport] Fetch CSS échoué:', err);
            // Fallback : lire depuis styleSheets
            var css = '';
            try {
                var sheets = document.styleSheets;
                for (var s = 0; s < sheets.length; s++) {
                    if ((sheets[s].href || '').indexOf('documents.css') === -1) continue;
                    var rules = sheets[s].cssRules || sheets[s].rules;
                    if (!rules) continue;
                    for (var r = 0; r < rules.length; r++) {
                        css += rules[r].cssText + '\n';
                    }
                }
            } catch(e) { /* CORS */ }
            DocExport._cssCache = css;
            callback(css);
        });
    },

    /** CSS de renforcement — toutes les couleurs en valeurs fixes, pas de var() */
    BOOST_CSS: [
        '*, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }',
        '.kfs-doc { font-family: Georgia, "Times New Roman", serif; width: 794px; min-height: 1123px; padding: 68px 76px 83px; color: #1a1a1a; line-height: 1.65; font-size: 11pt; background: #fff !important; box-sizing: border-box; position: relative; }',
        '.kfs-doc::before { content: attr(data-watermark); position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 72pt; font-weight: 800; color: rgba(30,58,138,0.035); white-space: nowrap; pointer-events: none; z-index: 0; }',
        '.kfs-doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0; position: relative; z-index: 1; }',
        '.kfs-header-left { display: flex; gap: 14px; align-items: flex-start; }',
        '.kfs-header-logo { width: 70px; height: 70px; border-radius: 8px; object-fit: contain; border: 2px solid #1e3a8a; }',
        '.kfs-header-company { display: flex; flex-direction: column; }',
        '.kfs-header-company h1 { font-size: 16pt; font-weight: 800; color: #1e3a8a; margin: 0; letter-spacing: 0.04em; line-height: 1.2; font-family: Inter, sans-serif; }',
        '.kfs-header-company .kfs-slogan { font-size: 8.5pt; font-weight: 600; color: #d4a017; margin-top: 2px; font-family: Inter, sans-serif; }',
        '.kfs-header-contact { margin-top: 6px; font-size: 7.5pt; color: #555; line-height: 1.6; font-family: Inter, sans-serif; }',
        '.kfs-header-contact span { display: block; }',
        '.kfs-header-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }',
        '.kfs-flag-container { display: flex; flex-direction: column; align-items: center; gap: 4px; }',
        '.kfs-flag { width: 60px; height: 40px; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.15); display: flex; }',
        '.kfs-flag-green { background: #00853F !important; flex: 1; }',
        '.kfs-flag-yellow { background: #FDEF42 !important; flex: 1; display: flex; align-items: center; justify-content: center; }',
        '.kfs-flag-red { background: #E31B23 !important; flex: 1; }',
        '.kfs-flag-star { color: #00853F; font-size: 14px; line-height: 1; }',
        '.kfs-devise { font-size: 7pt; color: #555; font-style: italic; text-align: center; margin-top: 2px; }',
        '.kfs-doc-ref { margin-top: 8px; background: #1e3a8a !important; color: #fff !important; padding: 4px 12px; border-radius: 4px; font-size: 7.5pt; font-weight: 700; font-family: Inter, sans-serif; }',
        '.kfs-header-separator { height: 4px; background: linear-gradient(90deg, #1e3a8a 0%, #d4a017 50%, #1e3a8a 100%) !important; margin: 16px 0 20px; border-radius: 2px; }',
        '.kfs-doc-title { text-align: center; margin: 24px 0; position: relative; z-index: 1; }',
        '.kfs-doc-title h2 { font-size: 18pt; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 6px; line-height: 1.3; font-family: Inter, sans-serif; }',
        '.kfs-doc-title .kfs-title-line { width: 80px; height: 3px; background: #d4a017 !important; margin: 8px auto 0; border-radius: 2px; }',
        '.kfs-doc-title .kfs-doc-subtitle { font-size: 9pt; color: #666; margin-top: 6px; font-style: italic; }',
        '.kfs-parties { margin: 20px 0; position: relative; z-index: 1; }',
        '.kfs-party { background: #f8fafc !important; border-left: 4px solid #1e3a8a; padding: 14px 18px; margin-bottom: 14px; border-radius: 0 8px 8px 0; }',
        '.kfs-party.employee, .kfs-party.client { border-left-color: #d4a017; }',
        '.kfs-party-label { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px; font-family: Inter, sans-serif; }',
        '.kfs-party-name { font-size: 11pt; font-weight: 700; color: #0f172a; }',
        '.kfs-party-details { font-size: 9pt; color: #555; margin-top: 4px; line-height: 1.7; }',
        '.kfs-articles { margin: 24px 0; position: relative; z-index: 1; }',
        '.kfs-article { margin-bottom: 18px; break-inside: avoid; }',
        '.kfs-article-header { font-size: 11pt; font-weight: 700; color: #1e3a8a; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; font-family: Inter, sans-serif; }',
        '.kfs-article-content { text-align: justify; font-size: 10pt; color: #333; line-height: 1.75; padding-left: 4px; }',
        '.kfs-article-content p { margin-bottom: 8px; }',
        '.kfs-table-wrapper { margin: 20px 0; position: relative; z-index: 1; break-inside: avoid; }',
        '.kfs-table { width: 100%; border-collapse: collapse; font-size: 9pt; }',
        '.kfs-table thead th { background: #1e3a8a !important; color: #fff !important; padding: 10px 12px; text-align: left; font-weight: 700; font-size: 8pt; text-transform: uppercase; font-family: Inter, sans-serif; }',
        '.kfs-table thead th:first-child { border-radius: 6px 0 0 0; }',
        '.kfs-table thead th:last-child { border-radius: 0 6px 0 0; text-align: right; }',
        '.kfs-table tbody td { padding: 10px 12px; border-bottom: 1px solid #e8ecf1; color: #333; }',
        '.kfs-table tbody tr:nth-child(even) { background: #f8fafc !important; }',
        '.kfs-table tbody td:last-child { text-align: right; font-weight: 600; }',
        '.kfs-table tfoot td { padding: 10px 12px; font-weight: 700; font-family: Inter, sans-serif; }',
        '.kfs-table-total { background: #1e3a8a !important; color: #fff !important; font-size: 10pt; border-radius: 0 0 6px 6px; }',
        '.kfs-totals { margin: 16px 0 24px; display: flex; justify-content: flex-end; position: relative; z-index: 1; }',
        '.kfs-totals-box { width: 260px; border: 2px solid #e2e8f0; border-radius: 8px; overflow: hidden; }',
        '.kfs-totals-row { display: flex; justify-content: space-between; padding: 8px 14px; font-size: 9pt; border-bottom: 1px solid #e2e8f0; }',
        '.kfs-totals-row:last-child { border-bottom: none; }',
        '.kfs-totals-row.total { background: #1e3a8a !important; color: #fff !important; font-weight: 800; font-size: 10pt; font-family: Inter, sans-serif; }',
        '.kfs-mentions { margin: 24px 0 16px; padding: 14px 18px; background: #f8fafc !important; border-radius: 8px; border: 1px solid #e2e8f0; position: relative; z-index: 1; break-inside: avoid; }',
        '.kfs-mentions-title { font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #1e3a8a; margin-bottom: 6px; font-family: Inter, sans-serif; }',
        '.kfs-mentions p, .kfs-mentions li { font-size: 8pt; color: #666; line-height: 1.6; }',
        '.kfs-mentions ul { padding-left: 16px; margin: 4px 0; }',
        '.kfs-payslip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 16px 0; position: relative; z-index: 1; }',
        '.kfs-payslip-section { break-inside: avoid; }',
        '.kfs-payslip-section-title { font-size: 9pt; font-weight: 700; text-transform: uppercase; color: #1e3a8a; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #d4a017; font-family: Inter, sans-serif; }',
        '.kfs-payslip-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 9pt; color: #333; border-bottom: 1px dotted #e2e8f0; }',
        '.kfs-payslip-row .label { color: #555; }',
        '.kfs-payslip-row .value { font-weight: 600; }',
        '.kfs-net-box { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%) !important; color: #fff !important; padding: 16px 20px; border-radius: 8px; text-align: center; margin: 18px 0; break-inside: avoid; }',
        '.kfs-net-box .label { font-size: 9pt; font-weight: 600; text-transform: uppercase; opacity: .85; }',
        '.kfs-net-box .amount { font-size: 20pt; font-weight: 800; margin-top: 4px; font-family: Inter, sans-serif; }',
        '.kfs-doc-footer { margin-top: 40px; position: relative; z-index: 1; }',
        '.kfs-fait-a { text-align: right; font-size: 10pt; margin-bottom: 30px; color: #333; font-style: italic; }',
        '.kfs-signatures { display: flex; justify-content: space-between; gap: 40px; margin-top: 10px; }',
        '.kfs-signature-block { flex: 1; text-align: center; break-inside: avoid; }',
        '.kfs-signature-label { font-size: 9pt; font-weight: 700; text-transform: uppercase; color: #1e3a8a; margin-bottom: 8px; font-family: Inter, sans-serif; }',
        '.kfs-signature-line { border-bottom: 2px solid #ccc; height: 60px; margin-bottom: 8px; }',
        '.kfs-signature-name { font-size: 9pt; font-weight: 600; color: #0f172a; }',
        '.kfs-signature-fonction { font-size: 8pt; color: #64748b; font-style: italic; }'
    ].join('\n'),

    /** Génère un PDF depuis le HTML A4 via html2pdf.js */
    downloadPDF: function(htmlContent, filename) {
        if (typeof html2pdf === 'undefined') {
            DocUtils.toast('html2pdf.js non chargé', 'error');
            return;
        }

        DocUtils.toast('Génération du PDF...', 'info');

        // Charger le CSS puis générer
        DocExport.loadCSS(function(cssText) {

            // Construire un HTML autoportant avec TOUT le CSS intégré
            var container = document.createElement('div');
            container.id = 'pdf-offscreen-container';
            container.style.cssText = 'position:fixed;left:0;top:0;width:794px;z-index:99999;background:#fff;';

            // Injecter le style complet : CSS du fichier + renforcement hardcodé
            var styleEl = document.createElement('style');
            styleEl.textContent = (cssText || '') + '\n' + DocExport.BOOST_CSS;
            container.appendChild(styleEl);

            // Injecter le contenu HTML
            var wrapper = document.createElement('div');
            wrapper.innerHTML = htmlContent;
            container.appendChild(wrapper);

            document.body.appendChild(container);

            // Cibler le .kfs-doc ou le wrapper entier
            var target = container.querySelector('.kfs-doc') || wrapper;

            // Attendre le rendu complet (layout + images)
            setTimeout(function() {

                var opt = {
                    margin: [0, 0, 0, 0],
                    filename: filename || 'document.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        letterRendering: true,
                        width: 794,
                        windowWidth: 794,
                        scrollX: 0,
                        scrollY: 0,
                        x: 0,
                        y: 0,
                        backgroundColor: '#ffffff',
                        logging: false,
                        onclone: function(clonedDoc) {
                            // Rendre le clone entièrement visible
                            var root = clonedDoc.getElementById('pdf-offscreen-container');
                            if (root) {
                                root.style.position = 'static';
                                root.style.zIndex = 'auto';
                                root.style.opacity = '1';
                            }
                            var doc = clonedDoc.querySelector('.kfs-doc');
                            if (doc) {
                                doc.style.background = '#fff';
                                doc.style.width = '794px';
                                doc.style.visibility = 'visible';
                                doc.style.opacity = '1';
                            }
                        }
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait'
                    },
                    pagebreak: {
                        mode: ['avoid-all', 'css', 'legacy'],
                        before: '.page-break-before',
                        after: '.page-break-after',
                        avoid: '.kfs-article, .kfs-table-wrapper, .kfs-mentions, .kfs-signature-block, .kfs-net-box, .kfs-payslip-section'
                    }
                };

                html2pdf().set(opt).from(target).save().then(function() {
                    if (container.parentNode) document.body.removeChild(container);
                    DocUtils.toast('PDF téléchargé avec succès', 'success');
                }).catch(function(err) {
                    if (container.parentNode) document.body.removeChild(container);
                    console.error('[DocExport] Erreur PDF:', err);
                    DocUtils.toast('Erreur lors de la génération du PDF', 'error');
                });
            }, 600);
        });
    },

    /** Ouvre une fen\u00eatre pour impression */
    print: function(htmlContent) {
        var cssLink = '';
        // Charger le CSS du document
        var docCSS = document.querySelector('link[href*="documents.css"]');
        if (docCSS) {
            cssLink = '<link rel="stylesheet" href="' + docCSS.href + '">';
        } else {
            // Inline fallback : r\u00e9cup\u00e9rer les styles
            var styles = document.querySelectorAll('style');
            for (var i = 0; i < styles.length; i++) {
                cssLink += '<style>' + styles[i].textContent + '</style>';
            }
        }

        var printHTML = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">';
        printHTML += '<title>Impression</title>';
        printHTML += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">';
        printHTML += '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">';
        printHTML += cssLink;
        printHTML += '<style>@page { size: A4 portrait; margin: 0; } body { margin: 0; } .kfs-doc { box-shadow: none; }</style>';
        printHTML += '</head><body>' + htmlContent + '</body></html>';

        var win = window.open('', '_blank');
        if (win) {
            win.document.write(printHTML);
            win.document.close();
            setTimeout(function() { win.print(); }, 700);
        } else {
            DocUtils.toast('Popup bloqu\u00e9e, autorisez les pop-ups', 'error');
        }
    }
};

// ═══════════════════════════════════════════════════
// 8. ORCHESTRATEUR PRINCIPAL
// ═══════════════════════════════════════════════════

var DocEngine = {
    currentType: null,
    _initialized: false,

    /** Initialisation */
    init: function() {
        if (DocEngine._initialized) {
            console.log('[DocEngine] Déjà initialisé, skip');
            return;
        }
        var selector = document.getElementById('doc-type-select');
        if (!selector) {
            console.warn('[DocEngine] #doc-type-select introuvable');
            return;
        }

        selector.addEventListener('change', function() {
            DocEngine.selectType(this.value);
        });
        DocEngine._initialized = true;

        // Initialiser le rendu
        // Charger depuis Firebase puis rendre
        DocHistory.loadFromFirebase(function() {
            DocHistory.renderStats();
            DocHistory.renderList();
        });

        // Pr\u00e9-s\u00e9lectionner depuis URL hash
        var hash = window.location.hash.replace('#doc-', '');
        if (DOCUMENT_TYPES[hash]) {
            selector.value = hash;
            DocEngine.selectType(hash);
        }

        console.log('\u2705 Module Documents initialis\u00e9 (' + Object.keys(DOCUMENT_TYPES).length + ' types)');
    },

    /** S\u00e9lection d'un type */
    selectType: function(typeKey) {
        var formContainer = document.getElementById('doc-form-container');
        var previewPanel = document.getElementById('doc-preview-panel');

        if (!typeKey || !DOCUMENT_TYPES[typeKey]) {
            DocEngine.currentType = null;
            if (formContainer) { formContainer.classList.add('hidden'); formContainer.innerHTML = ''; }
            if (previewPanel) previewPanel.style.display = 'none';
            return;
        }

        DocEngine.currentType = typeKey;

        // Générer le formulaire
        if (formContainer) {
            formContainer.classList.remove('hidden');
            formContainer.innerHTML = FormEngine.render(typeKey);
            // Pré-remplir la date du jour
            var dateField = document.getElementById('doc-date');
            if (dateField && !dateField.value) dateField.value = DocUtils.today();
            // Activer l'auto-remplissage
            AutoFill.bind(typeKey);
        }

        // Lier les calculs des lignes
        if (DOCUMENT_TYPES[typeKey].hasLineItems) {
            FormEngine.bindLineCalc();
        }

        // Masquer la pr\u00e9visualisation
        if (previewPanel) previewPanel.style.display = 'none';
    },

    /** Aper\u00e7u */
    preview: function() {
        if (!DocEngine.currentType) {
            DocUtils.toast('Veuillez s\u00e9lectionner un type de document', 'error');
            return;
        }
        try {
            if (!FormEngine.validate(DocEngine.currentType)) return;

            var data = FormEngine.collectData();
            var html = DocRenderer.render(DocEngine.currentType, data);

            var previewPanel = document.getElementById('doc-preview-panel');
            var previewContainer = document.getElementById('doc-preview-render');
            if (previewPanel && previewContainer) {
                previewContainer.innerHTML = html;
                previewPanel.style.display = 'block';
                previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch(e) {
            console.error('[DocEngine] Erreur aper\u00e7u:', e);
            DocUtils.toast('Erreur : ' + e.message, 'error');
        }
    },

    /** T\u00e9l\u00e9charger en PDF */
    downloadPDF: function() {
        if (!DocEngine.currentType) {
            DocUtils.toast('Veuillez s\u00e9lectionner un type de document', 'error');
            return;
        }
        try {
            if (!FormEngine.validate(DocEngine.currentType)) return;

            var data = FormEngine.collectData();
            var config = DOCUMENT_TYPES[DocEngine.currentType];
            var html = DocRenderer.render(DocEngine.currentType, data);
            var filename = (config.label || 'document').replace(/\s+/g, '_') + '_' + (data.numero || DocUtils.uid()) + '.pdf';
            
            // Sauvegarder dans l'historique + Firebase
            var doc = {
                type: DocEngine.currentType,
                title: config.label + (data.numero ? ' - ' + data.numero : ''),
                numero: data.numero || '',
                date: data.date || DocUtils.today(),
                data: data,
                html: html
            };
            var savedDoc = DocHistory.save(doc);
            DocHistory.renderStats();
            DocHistory.renderList();

            // Sync finances
            DocEngine.syncToFinances(DocEngine.currentType, data, savedDoc);

            DocExport.downloadPDF(html, filename);
            DocUtils.toast('Document enregistr\u00e9 & PDF t\u00e9l\u00e9charg\u00e9', 'success');
        } catch(e) {
            console.error('[DocEngine] Erreur PDF:', e);
            DocUtils.toast('Erreur : ' + e.message, 'error');
        }
    },

    /** Enregistrer et imprimer */
    saveAndPrint: function() {
        if (!DocEngine.currentType) {
            DocUtils.toast('Veuillez sélectionner un type de document', 'error');
            return;
        }
        try {
        if (!FormEngine.validate(DocEngine.currentType)) return;

        var data = FormEngine.collectData();
        var config = DOCUMENT_TYPES[DocEngine.currentType];
        var html = DocRenderer.render(DocEngine.currentType, data);

        // Sauvegarder en localStorage
        var doc = {
            type: DocEngine.currentType,
            title: config.label + (data.numero ? ' - ' + data.numero : ''),
            numero: data.numero || '',
            date: data.date || DocUtils.today(),
            data: data,
            html: html
        };
        var savedDoc = DocHistory.save(doc);
        DocHistory.renderStats();
        DocHistory.renderList();

        // ══ SYNC FINANCES / BILAN ══
        DocEngine.syncToFinances(DocEngine.currentType, data, savedDoc);

        DocUtils.toast('Document enregistré & synchronisé', 'success');

        // Lancer l'impression
        DocExport.print(html);
        } catch(e) {
            console.error('[DocEngine] Erreur enregistrement:', e);
            DocUtils.toast('Erreur : ' + e.message, 'error');
        }
    },

    /** Synchroniser un document enregistré avec le module Finances */
    syncToFinances: function(typeKey, data, savedDoc) {
        // Vérifier que autoAddTransaction existe (admin.js chargé)
        if (typeof window.autoAddTransaction !== 'function') {
            console.log('[DocEngine] autoAddTransaction non disponible, sync ignorée');
            return;
        }

        var config = DOCUMENT_TYPES[typeKey];
        if (!config) return;

        var ref = savedDoc.numero || savedDoc.id;
        var dateDoc = data.date || DocUtils.today();

        try {
            switch(typeKey) {

                // ── DEVIS → Recette potentielle (montant TTC) ──
                case 'devis':
                    if (data._totalTTC && data._totalTTC > 0) {
                        window.autoAddTransaction({
                            type: 'recette',
                            montant: data._totalTTC,
                            categorie: 'vente',
                            description: 'Devis ' + ref + ' — ' + (data.objet || 'Prestation') + ' — Client: ' + (data.client_nom || ''),
                            reference: 'DOC-' + ref,
                            sourceModule: 'documents',
                            date: dateDoc
                        });
                    }
                    break;

                // ── CONTRAT PRESTATION → Recette (montant TTC) ──
                case 'contrat_prestation':
                    var mt = parseFloat(data.montant_total) || 0;
                    var tva = parseFloat(data.tva) || 0;
                    var ttc = mt * (1 + tva / 100);
                    if (ttc > 0) {
                        window.autoAddTransaction({
                            type: 'recette',
                            montant: ttc,
                            categorie: 'vente',
                            description: 'Contrat prestation ' + ref + ' — ' + (data.objet || 'Service') + ' — Client: ' + (data.client_nom || ''),
                            reference: 'DOC-' + ref,
                            sourceModule: 'documents',
                            date: dateDoc
                        });
                    }
                    break;

                // ── LOCATION COURTE → Recette (montant total) ──
                case 'location_courte':
                    var montantLC = parseFloat(data.montant_total) || 0;
                    if (montantLC > 0) {
                        window.autoAddTransaction({
                            type: 'recette',
                            montant: montantLC,
                            categorie: 'location',
                            description: 'Location courte ' + ref + ' — ' + (data.bien_designation || 'Bien') + ' — Locataire: ' + (data.locataire_nom || ''),
                            reference: 'DOC-' + ref,
                            sourceModule: 'documents',
                            date: dateDoc
                        });
                    }
                    break;

                // ── LOCATION LONGUE → Recette mensuelle (loyer + charges) ──
                case 'location_longue':
                    var loyerLL = (parseFloat(data.loyer_mensuel) || 0) + (parseFloat(data.charges) || 0);
                    if (loyerLL > 0) {
                        window.autoAddTransaction({
                            type: 'recette',
                            montant: loyerLL,
                            categorie: 'location',
                            description: 'Location longue ' + ref + ' — ' + (data.bien_designation || 'Bien') + ' — Loyer mensuel — Locataire: ' + (data.locataire_nom || ''),
                            reference: 'DOC-' + ref,
                            sourceModule: 'documents',
                            date: dateDoc
                        });
                    }
                    // Caution aussi
                    var cautionLL = parseFloat(data.caution) || 0;
                    if (cautionLL > 0) {
                        window.autoAddTransaction({
                            type: 'recette',
                            montant: cautionLL,
                            categorie: 'location',
                            description: 'Caution location ' + ref + ' — ' + (data.locataire_nom || ''),
                            reference: 'DOC-' + ref + '_caution',
                            sourceModule: 'documents',
                            date: dateDoc
                        });
                    }
                    break;

                // ── BAIL → Recette (loyer + caution + avance) ──
                case 'contrat_bail':
                    var loyerBail = (parseFloat(data.loyer_mensuel) || 0) + (parseFloat(data.charges) || 0);
                    if (loyerBail > 0) {
                        window.autoAddTransaction({
                            type: 'recette',
                            montant: loyerBail,
                            categorie: 'location',
                            description: 'Bail ' + ref + ' — ' + (data.bien_designation || 'Bien') + ' — Loyer mensuel — Preneur: ' + (data.locataire_nom || ''),
                            reference: 'DOC-' + ref,
                            sourceModule: 'documents',
                            date: dateDoc
                        });
                    }
                    var cautionBail = parseFloat(data.caution) || 0;
                    if (cautionBail > 0) {
                        window.autoAddTransaction({
                            type: 'recette',
                            montant: cautionBail,
                            categorie: 'location',
                            description: 'Caution bail ' + ref + ' — ' + (data.locataire_nom || ''),
                            reference: 'DOC-' + ref + '_caution',
                            sourceModule: 'documents',
                            date: dateDoc
                        });
                    }
                    break;

                // ── FICHE DE PAIE → Dépense (salaire net + cotisations) ──
                case 'fiche_paie':
                    if (data._payslip) {
                        var netPaie = data._payslip.net || 0;
                        if (netPaie > 0) {
                            window.autoAddTransaction({
                                type: 'depense',
                                montant: netPaie,
                                categorie: 'salaires',
                                description: 'Salaire net ' + (data.mois || '') + ' ' + (data.annee || '') + ' — ' + (data.employe_nom || '') + ' (' + (data.employe_poste || '') + ')',
                                reference: 'DOC-' + ref,
                                sourceModule: 'documents',
                                date: dateDoc
                            });
                        }
                        var cotisations = (data._payslip.ipres_general || 0) + (data._payslip.ipres_cadre || 0) + (data._payslip.css || 0);
                        if (cotisations > 0) {
                            window.autoAddTransaction({
                                type: 'depense',
                                montant: cotisations,
                                categorie: 'charges_sociales',
                                description: 'Cotisations patronales ' + (data.mois || '') + ' ' + (data.annee || '') + ' — ' + (data.employe_nom || ''),
                                reference: 'DOC-' + ref + '_cotisations',
                                sourceModule: 'documents',
                                date: dateDoc
                            });
                        }
                    }
                    break;

                // contrat_travail et certificat_travail : pas de transaction financière

                // ── GESTION LOCATIVE → Pas de transaction immédiate (c'est un mandat) ──
                case 'contrat_gestion_locative':
                    break;

                // ── QUITTANCE DE LOYER → Recette (total quittance) ──
                case 'quittance_loyer':
                    var loyerQ = parseFloat(data.loyer) || 0;
                    var chargesQ = parseFloat(data.charges) || 0;
                    var taxeQ = parseFloat(data.taxe_ordures) || 0;
                    var eauQ = parseFloat(data.eau) || 0;
                    var elecQ = parseFloat(data.electricite) || 0;
                    var autresQ = parseFloat(data.autres_frais) || 0;
                    var totalQ = loyerQ + chargesQ + taxeQ + eauQ + elecQ + autresQ;
                    if (totalQ > 0) {
                        window.autoAddTransaction({
                            type: 'recette',
                            montant: totalQ,
                            categorie: 'location',
                            description: 'Quittance ' + ref + ' — ' + (data.type_bail || 'Location') + ' — ' + (data.bien_designation || 'Bien') + ' — ' + (data.locataire_nom || ''),
                            reference: 'DOC-' + ref,
                            sourceModule: 'documents',
                            date: dateDoc
                        });
                    }
                    break;

                default:
                    break;
            }
        } catch(e) {
            console.error('[DocEngine] Erreur sync finances:', e);
        }
    },

    /** Réinitialiser le formulaire */
    reset: function() {
        if (DocEngine.currentType) {
            DocEngine.selectType(DocEngine.currentType);
            var previewPanel = document.getElementById('doc-preview-panel');
            if (previewPanel) previewPanel.style.display = 'none';
            DocUtils.toast('Formulaire r\u00e9initialis\u00e9', 'success');
        }
    },

    /** R\u00e9ouvrir un document depuis l'historique */
    reopen: function(docId) {
        var docs = DocHistory.getAll();
        var doc = null;
        for (var i = 0; i < docs.length; i++) {
            if (docs[i].id === docId) { doc = docs[i]; break; }
        }
        if (!doc) return;

        // S\u00e9lectionner le type
        var selector = document.getElementById('doc-type-select');
        if (selector) selector.value = doc.type;
        DocEngine.selectType(doc.type);

        // Remplir les champs
        if (doc.data) {
            setTimeout(function() {
                for (var key in doc.data) {
                    if (key.charAt(0) === '_') continue;
                    var el = document.getElementById('doc-' + key);
                    if (el) el.value = doc.data[key];
                }
                DocUtils.toast('Document recharg\u00e9', 'success');
            }, 100);
        }
    },

    /** Re-t\u00e9l\u00e9charger un document depuis l'historique */
    redownload: function(docId) {
        var docs = DocHistory.getAll();
        var doc = null;
        for (var i = 0; i < docs.length; i++) {
            if (docs[i].id === docId) { doc = docs[i]; break; }
        }
        if (!doc || !doc.html) return;

        var config = DOCUMENT_TYPES[doc.type] || {};
        var filename = (config.label || 'document').replace(/\s+/g, '_') + '_' + (doc.numero || doc.id) + '.pdf';
        DocExport.downloadPDF(doc.html, filename);
    },

    /** Supprimer un document */
    deleteDoc: function(docId) {
        if (!confirm('Supprimer ce document ?')) return;
        DocHistory.remove(docId);
        DocHistory.renderStats();
        DocHistory.renderList();
        DocUtils.toast('Document supprim\u00e9', 'success');
    }
};

// ═══════════════════════════════════════════════════
// 9. EXPOSITION GLOBALE (pour les onclick dans le HTML)
// ═══════════════════════════════════════════════════

window.DocEngine = DocEngine;
window.DocRenderer = DocRenderer;
window.DocHistory = DocHistory;
window.DocExport = DocExport;
window.DocUtils = DocUtils;
window.DOCUMENT_TYPES = DOCUMENT_TYPES;

// ═══════════════════════════════════════════════════
// 10. INITIALISATION AU DOM READY
// ═══════════════════════════════════════════════════

// L'init sera appelée par admin.js quand le module est activé,
// ou automatiquement si la page est documents.html standalone

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('doc-type-select')) DocEngine.init();
    });
} else {
    if (document.getElementById('doc-type-select')) DocEngine.init();
}

})();
