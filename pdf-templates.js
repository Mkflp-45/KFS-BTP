/* ============================================================
   PDF-TEMPLATES.JS
   Templates HTML structurés pour génération PDF A4.
   NON affichés sur le site — utilisés par admin.js via
   la fonction window.KFS_PDF.render(type, data).
   ============================================================ */

(function () {
    'use strict';

    // ---- Données entreprise (centralisées) ----
    var COMPANY = {
        nom: 'KFS BTP IMMO',
        slogan: 'Construire – Gérer – Valoriser',
        adresse: 'Villa 123 MC, Quartier Medinacoura, Tambacounda',
        phone: '+221 78 584 28 71',
        phone2: '+33 6 05 84 68 07',
        email: 'kfsbtpproimmo@gmail.com',
        ninea: '009468499',
        rccm: 'SN TBC 2025 M 1361',
        pays: 'Sénégal',
        ville: 'Tambacounda'
    };

    // ---- Utilitaires ----
    function esc(val) { return val || ''; }
    function v(val, fallback) {
        if (val && String(val).trim()) return '<span class="pdf-var">' + val + '</span>';
        return '<span class="pdf-var error">' + (fallback || 'À compléter') + '</span>';
    }

    function dateFR(iso) {
        if (!iso) return '';
        try { return new Date(iso).toLocaleDateString('fr-FR'); } catch (e) { return iso; }
    }

    function dateLongueFR() {
        return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function montantFR(n) {
        return (parseFloat(n) || 0).toLocaleString('fr-FR');
    }

    function logoSrc() {
        return window.logoKFSBase64 || 'assets/logo-kfs-btp.jpeg';
    }

    // ---- Fragments réutilisables ----

    function headerHTML(docType, numero) {
        return '' +
            '<div class="pdf-header">' +
                '<div style="display:flex;align-items:flex-start;gap:12px;">' +
                    '<img src="' + logoSrc() + '" alt="Logo KFS BTP" class="pdf-header-logo">' +
                    '<div class="pdf-header-company">' +
                        '<h1>' + COMPANY.nom + '</h1>' +
                        '<p class="subtitle">Bâtiment – Travaux Publics – Immobilier</p>' +
                        '<p class="info">' +
                            COMPANY.adresse + '<br>' +
                            'Tél: ' + COMPANY.phone + ' / ' + COMPANY.phone2 + '<br>' +
                            'Email: ' + COMPANY.email + '<br>' +
                            '<strong>NINEA:</strong> ' + COMPANY.ninea + ' | <strong>RCCM:</strong> ' + COMPANY.rccm +
                        '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="pdf-header-ref">' +
                    '<div class="ref-badge">' +
                        '<p class="ref-label">' + (docType || 'Document') + ' N°</p>' +
                        '<p class="ref-number">' + (numero || '—') + '</p>' +
                    '</div>' +
                    '<p class="ref-date">Date : ' + dateLongueFR() + '</p>' +
                '</div>' +
            '</div>';
    }

    function titleHTML(titre, sousTitre) {
        return '' +
            '<div class="pdf-title">' +
                '<h2>' + titre + '</h2>' +
                (sousTitre ? '<p class="subtitle">' + sousTitre + '</p>' : '') +
            '</div>';
    }

    function partiesHTML(labelA, dataA, labelB, dataB) {
        function partieCard(label, d, cls) {
            return '' +
                '<div class="pdf-partie ' + cls + '">' +
                    '<h4>' + label + '</h4>' +
                    '<p><strong>' + esc(d.nom) + '</strong></p>' +
                    (d.adresse ? '<p>Adresse : ' + d.adresse + '</p>' : '') +
                    (d.tel ? '<p>Tél : ' + d.tel + '</p>' : '') +
                    (d.email ? '<p>Email : ' + d.email + '</p>' : '') +
                    (d.ninea ? '<p>NINEA : ' + d.ninea + '</p>' : '') +
                    (d.cni ? '<p>CNI/Passeport : ' + d.cni + '</p>' : '') +
                    (d.extra ? d.extra : '') +
                '</div>';
        }
        return '<div class="pdf-parties">' +
            partieCard(labelA, dataA, 'employeur') +
            partieCard(labelB, dataB, 'salarie') +
            '</div>';
    }

    function sectionHTML(num, titre, contenu) {
        return '' +
            '<div class="pdf-section">' +
                '<div class="pdf-section-title">' +
                    '<div class="num">' + num + '</div>' +
                    '<div class="label">' + titre + '</div>' +
                '</div>' +
                '<div class="pdf-section-body">' + contenu + '</div>' +
            '</div>';
    }

    function signaturesHTML(labelA, nameA, labelB, nameB) {
        return '' +
            '<div class="pdf-date-lieu">' +
                'Fait à <strong>' + COMPANY.ville + '</strong>, le <strong>' + dateLongueFR() + '</strong>, en deux exemplaires originaux.' +
            '</div>' +
            '<div class="pdf-signatures">' +
                '<div class="pdf-signature-box">' +
                    '<div class="title">' + labelA + '</div>' +
                    '<div class="name">' + esc(nameA) + '</div>' +
                    '<div class="space"></div>' +
                    '<div class="label">Signature et cachet</div>' +
                '</div>' +
                '<div class="pdf-signature-box">' +
                    '<div class="title">' + labelB + '</div>' +
                    '<div class="name">' + esc(nameB) + '</div>' +
                    '<div class="space"></div>' +
                    '<div class="label">Lu et approuvé, signature</div>' +
                '</div>' +
            '</div>';
    }

    function footerHTML() {
        return '' +
            '<div class="pdf-footer">' +
                '<div class="slogan">' + COMPANY.slogan.toUpperCase().replace('–', '—') + '</div>' +
                '<div class="contact">' + COMPANY.nom + ' | ' + COMPANY.adresse + ' | Tél: ' + COMPANY.phone + ' | ' + COMPANY.email + '</div>' +
            '</div>';
    }

    // ---- TEMPLATE : Certificat de travail ----
    function templateCertificat(data) {
        var drapeauSn = 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Flag_of_Senegal.svg';
        var today = dateLongueFR();
        var nom = '', prenom = '';
        if (data.nom_salarie) {
            var parts = data.nom_salarie.trim().split(' ');
            nom = parts[0] || '';
            prenom = parts.length > 1 ? parts.slice(1).join(' ') : '';
        }

        return '<div class="pdf-page">' +

            // En-tête bilingue avec logo + drapeau
            '<div class="pdf-block" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">' +
                '<div style="display:flex;flex-direction:column;align-items:center;">' +
                    '<img src="' + logoSrc() + '" alt="Logo KFS BTP" class="pdf-header-logo">' +
                    '<div style="margin-top:6px;font-size:9pt;color:#facc15;font-weight:700;letter-spacing:1px;">' + COMPANY.slogan + '</div>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;align-items:center;">' +
                    '<img src="' + drapeauSn + '" alt="Drapeau Sénégal" style="width:44px;height:30px;border-radius:3px;">' +
                    '<div style="margin-top:6px;font-size:9pt;color:#1e3a8a;font-weight:600;">Un Peuple – Un But – Une Foi</div>' +
                '</div>' +
            '</div>' +

            titleHTML('CERTIFICAT DE TRAVAIL') +

            // Infos entreprise
            '<div class="pdf-block" style="text-align:center;margin-bottom:16px;font-size:10pt;color:#1e3a8a;">' +
                '<div style="font-weight:600;color:#2563eb;font-size:11pt;">' + COMPANY.nom + '</div>' +
                '<div>' + COMPANY.adresse + '</div>' +
                '<div>NINEA: ' + COMPANY.ninea + ' | RCCM: ' + COMPANY.rccm + '</div>' +
                '<div>Tél: ' + COMPANY.phone + ' | Email: ' + COMPANY.email + '</div>' +
            '</div>' +

            // Corps
            '<div class="pdf-section">' +
                '<div style="font-size:11pt;color:#222;line-height:1.9;text-align:justify;">' +
                    '<p>Je soussigné(e), <strong style="color:#1e3a8a;">Le Directeur Général de ' + COMPANY.nom + '</strong>, ' +
                    'entreprise spécialisée dans le secteur du Bâtiment, des Travaux Publics et de l\'Immobilier, ' +
                    'dont le siège social est situé à <strong>' + COMPANY.adresse + '</strong>, ' +
                    'immatriculée au RCCM sous le numéro <strong>' + COMPANY.rccm + '</strong>, ' +
                    'NINEA <strong>' + COMPANY.ninea + '</strong>, certifie que :</p>' +

                    '<p>' + v(nom + ' ' + prenom, 'Nom du salarié') + ' (<strong class="pdf-var">' + esc(data.nom_salarie) + '</strong>), ' +
                    'demeurant à ' + v(data.adresse_salarie, 'Adresse') + ', ' +
                    'a travaillé dans notre société en qualité de ' + v(data.poste, 'Poste') + ' ' +
                    'du <strong class="pdf-var">' + esc(data.date_debut) + '</strong> ' +
                    'au <strong class="pdf-var">' + (data.date_fin || 'à ce jour') + '</strong>.</p>' +

                    '<p>Ce certificat est délivré à la demande de l\'intéressé(e) pour servir et valoir ce que de droit, ' +
                    'conformément à la législation du travail en vigueur au Sénégal.</p>' +

                    (data.motif_depart ? '<p>Motif de départ : ' + v(data.motif_depart) + '</p>' : '') +
                    (data.num_identification ? '<p>Numéro d\'identification : ' + v(data.num_identification) + '</p>' : '') +
                '</div>' +
            '</div>' +

            // Signature
            '<div class="pdf-block" style="margin-top:60px;text-align:right;font-size:11pt;color:#1e3a8a;">' +
                '<div>Fait à ' + COMPANY.ville + ', le <strong>' + today + '</strong></div>' +
                '<div style="margin-top:60px;font-weight:600;color:#222;">Signature et cachet de l\'entreprise</div>' +
            '</div>' +

            '<hr style="border:none;border-top:2px solid #2563eb;margin:60px 0 0;">' +
            footerHTML() +
        '</div>';
    }

    // ---- TEMPLATE : Contrat de travail ----
    function templateContrat(data) {
        var typeContrat = data.type_contrat || 'CDD';
        var dureeContrat = data.duree_contrat || '';
        var dateDebut = dateFR(data.date_debut);
        var dateFin = dateFR(data.date_fin);
        var periodeEssai = data.periode_essai || '';
        var lieuTravail = data.lieu_travail || COMPANY.ville;
        var horaires = data.horaires || '08h00 – 17h00, du lundi au vendredi';
        var salaireNum = parseFloat(data.salaire_brut) || 0;

        var articles = '';

        // Art 1 - Objet
        articles += sectionHTML(1, 'OBJET DU CONTRAT',
            '<p>' + COMPANY.nom + ' engage ' + v(data.nom_salarie, 'Nom du salarié') +
            ' en qualité de ' + v(data.poste, 'Poste') +
            ' dans le cadre d\'un contrat à durée ' +
            (typeContrat === 'CDI' ? 'indéterminée (CDI)' : 'déterminée (CDD)' + (dureeContrat ? ' de <strong>' + dureeContrat + '</strong>' : '')) +
            ', conformément au Code du travail sénégalais (Loi n° 97-17 du 1er décembre 1997).</p>'
        );

        // Art 2 - Durée
        articles += sectionHTML(2, 'PRISE D\'EFFET ET DURÉE',
            '<p>Le présent contrat prend effet à compter du <strong class="pdf-var">' + dateDebut + '</strong>' +
            (typeContrat === 'CDD' && dateFin ? ' et prendra fin le <strong class="pdf-var">' + dateFin + '</strong>' : '') + '.</p>' +
            (periodeEssai ? '<p>Une période d\'essai de <strong>' + periodeEssai + '</strong> est convenue. Durant cette période, chacune des parties peut mettre fin au contrat sans préavis ni indemnité.</p>' : '')
        );

        // Art 3 - Lieu et horaires
        articles += sectionHTML(3, 'LIEU DE TRAVAIL ET HORAIRES',
            '<p>Le salarié exercera ses fonctions à <strong>' + lieuTravail + '</strong>. ' +
            'Les horaires de travail sont : <strong>' + horaires + '</strong>, soit 40 heures hebdomadaires, ' +
            'conformément à la réglementation en vigueur.</p>'
        );

        // Art 4 - Rémunération
        articles += sectionHTML(4, 'RÉMUNÉRATION',
            '<div class="pdf-montant-box">' +
                '<div class="row"><span>Salaire mensuel brut :</span><span class="total">' + montantFR(salaireNum) + ' FCFA</span></div>' +
            '</div>' +
            (data.avantages ? '<p>Avantages : ' + data.avantages + '</p>' : '') +
            '<p>Le salaire est payable mensuellement, au plus tard le 5 du mois suivant, par virement bancaire ou tout autre moyen convenu.</p>'
        );

        // Art 5 - Obligations
        articles += sectionHTML(5, 'OBLIGATIONS DU SALARIÉ',
            '<p>Le salarié s\'engage à :</p>' +
            '<ul>' +
                '<li>Exécuter les tâches liées à son poste avec diligence et professionnalisme</li>' +
                '<li>Respecter le règlement intérieur de l\'entreprise et les consignes de sécurité</li>' +
                '<li>Préserver la confidentialité des informations relatives à l\'entreprise</li>' +
                '<li>Informer l\'employeur de toute absence dans les plus brefs délais</li>' +
            '</ul>'
        );

        // Art 6 - Congés
        articles += sectionHTML(6, 'CONGÉS ET ABSENCES',
            '<p>Le salarié bénéficie de <strong>24 jours ouvrables</strong> de congés payés par an, ' +
            'conformément aux dispositions du Code du travail sénégalais.</p>'
        );

        // Art 7 - Rupture
        articles += sectionHTML(7, 'RUPTURE DU CONTRAT',
            '<p>' + (typeContrat === 'CDI'
                ? 'Chacune des parties peut mettre fin au présent contrat en respectant un préavis de <strong>un (1) mois</strong>, conformément aux articles L.48 à L.54 du Code du travail.'
                : 'Le présent CDD prendra fin à son terme sans formalité particulière. Toute rupture anticipée devra respecter les dispositions de l\'article L.47 du Code du travail.'
            ) + '</p>'
        );

        // Art 8 - Dispositions
        articles += sectionHTML(8, 'DISPOSITIONS GÉNÉRALES',
            '<p>Le présent contrat est régi par la législation du travail en vigueur au Sénégal. ' +
            'Tout litige sera porté devant le Tribunal du travail compétent de ' + COMPANY.ville + '. ' +
            'Le contrat est établi en deux exemplaires originaux, un pour chaque partie.</p>' +
            (data.clauses_particulieres ?
                '<div class="pdf-clause-speciale"><div class="label">Clauses particulières :</div><p>' + data.clauses_particulieres + '</p></div>'
                : '')
        );

        return '<div class="pdf-page">' +
            headerHTML('CONTRAT DE TRAVAIL', 'CT-' + Date.now().toString(36).toUpperCase()) +
            titleHTML('CONTRAT DE TRAVAIL', typeContrat + (dureeContrat ? ' — Durée : ' + dureeContrat : '')) +
            partiesHTML(
                'L\'Employeur',
                { nom: COMPANY.nom, adresse: COMPANY.adresse, tel: COMPANY.phone, email: COMPANY.email, ninea: COMPANY.ninea, extra: '<p>Représenté par : <strong>' + (data.representant || 'Le Directeur Général') + '</strong></p>' },
                'Le Salarié',
                { nom: data.nom_salarie || '', adresse: data.adresse_salarie || '', cni: data.num_identification || '', extra: (data.nationalite ? '<p>Nationalité : ' + data.nationalite + '</p>' : '') }
            ) +
            articles +
            signaturesHTML('L\'Employeur', COMPANY.nom, 'Le Salarié', data.nom_salarie || '') +
            footerHTML() +
        '</div>';
    }

    // ---- TEMPLATE : Attestation de travail (générique) ----
    function templateAttestation(data) {
        var today = dateLongueFR();

        return '<div class="pdf-page">' +
            headerHTML('ATTESTATION', data.numero || '') +
            titleHTML(data.titre || 'ATTESTATION DE TRAVAIL', 'Document officiel') +

            '<div class="pdf-section">' +
                '<div style="font-size:11pt;color:#222;line-height:1.9;text-align:justify;">' +
                    '{{CONTENU}}' +
                '</div>' +
            '</div>' +

            '<div class="pdf-block" style="margin-top:60px;text-align:right;font-size:11pt;color:#1e3a8a;">' +
                '<div>Fait à ' + COMPANY.ville + ', le <strong>' + today + '</strong></div>' +
                '<div style="margin-top:60px;font-weight:600;color:#222;">Signature et cachet de l\'entreprise</div>' +
            '</div>' +

            footerHTML() +
        '</div>';
    }

    // ---- API PUBLIQUE ----

    /**
     * Charge le CSS PDF dans le <head> s'il n'est pas déjà chargé.
     */
    function injectCSS() {
        if (document.getElementById('pdf-template-css')) return;
        var link = document.createElement('link');
        link.id = 'pdf-template-css';
        link.rel = 'stylesheet';
        link.href = 'pdf-template.css';
        document.head.appendChild(link);
    }

    /**
     * Crée le conteneur de rendu PDF (hors écran) et retourne l'élément.
     */
    function createRenderContainer(html) {
        injectCSS();

        var container = document.createElement('div');
        container.id = 'kfs-pdf-render';
        container.setAttribute('aria-hidden', 'true');
        container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;width:210mm;';
        container.innerHTML = html;
        document.body.appendChild(container);
        return container;
    }

    /**
     * Génère un PDF via html2pdf.js avec les bonnes options A4.
     * @param {string}   html      - Le HTML du template rendu
     * @param {string}   filename  - Nom du fichier PDF
     * @param {Function} [onDone]  - Callback après téléchargement
     */
    function generatePDF(html, filename, onDone) {
        var container = createRenderContainer(html);

        if (!window.html2pdf) {
            alert('html2pdf.js non chargé.');
            document.body.removeChild(container);
            return;
        }

        html2pdf().set({
            margin: [15, 15, 15, 15],
            filename: filename || 'document.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                scrollY: 0,
                windowWidth: 794  // 210mm @ 96dpi
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: {
                mode: ['avoid-all', 'css', 'legacy'],
                before: '.page-break',
                after: '.page-break-after',
                avoid: ['.pdf-block', '.pdf-section', '.pdf-header', '.pdf-title', '.pdf-signatures', '.pdf-footer', '.pdf-table', '.pdf-parties', '.pdf-preambule', '.pdf-montant-box']
            }
        }).from(container).save().then(function () {
            document.body.removeChild(container);
            if (typeof onDone === 'function') onDone();
        }).catch(function (err) {
            console.error('Erreur PDF:', err);
            try { document.body.removeChild(container); } catch (e) { /* ignore */ }
        });
    }

    /**
     * Ouvre un aperçu dans un nouvel onglet.
     */
    function openPreview(html, title) {
        var cssHref = window.location.href.replace(/[^/]*$/, '') + 'pdf-template.css';
        var previewWindow = window.open('', '_blank');
        if (!previewWindow) return;
        previewWindow.document.write(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + (title || 'Aperçu PDF') + '</title>' +
            '<link rel="stylesheet" href="' + cssHref + '">' +
            '<style>body{background:#e5e7eb;margin:0;padding:20px;} .pdf-page{box-shadow:0 4px 24px rgba(0,0,0,.12);}</style>' +
            '</head><body>' + html + '</body></html>'
        );
        previewWindow.document.close();
    }

    // ---- Exposition globale ----
    window.KFS_PDF = {
        COMPANY: COMPANY,

        // Templates
        templates: {
            certificat: templateCertificat,
            contrat: templateContrat,
            attestation: templateAttestation
        },

        // Fragments
        fragments: {
            header: headerHTML,
            title: titleHTML,
            parties: partiesHTML,
            section: sectionHTML,
            signatures: signaturesHTML,
            footer: footerHTML
        },

        // Utilitaires
        utils: {
            v: v,
            esc: esc,
            dateFR: dateFR,
            dateLongueFR: dateLongueFR,
            montantFR: montantFR
        },

        // Actions
        render: function (type, data) {
            var fn = this.templates[type];
            if (!fn) {
                console.error('KFS_PDF: template "' + type + '" inconnu.');
                return '';
            }
            return fn(data);
        },

        download: function (type, data, filename, onDone) {
            var html = this.render(type, data);
            if (html) generatePDF(html, filename, onDone);
        },

        preview: function (type, data, title) {
            var html = this.render(type, data);
            if (html) openPreview(html, title);
        },

        // Rendu libre (pour generateDocumentHTML ou custom)
        downloadHTML: function (html, filename, onDone) {
            generatePDF(html, filename, onDone);
        },

        previewHTML: function (html, title) {
            openPreview(html, title);
        },

        injectCSS: injectCSS
    };
})();
