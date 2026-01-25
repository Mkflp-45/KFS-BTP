// =====================================================
// GESTIONNAIRE D'ERREURS ET MONITORING - KFS BTP
// =====================================================
// 
// Ce script gère :
// - Capture des erreurs JavaScript
// - Logging des erreurs
// - Vérification de la santé du site
// - Notifications d'erreurs
// 
// =====================================================

const ErrorHandler = (function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        maxErrors: 50,           // Nombre max d'erreurs à stocker
        storageKey: 'kfs_error_logs',
        enableConsole: true,     // Afficher dans la console
        enableStorage: true,     // Sauvegarder dans localStorage
        criticalErrors: ['TypeError', 'ReferenceError', 'SyntaxError']
    };
    
    // Initialisation
    function init() {
        // Capturer les erreurs globales
        window.onerror = function(message, source, lineno, colno, error) {
            logError({
                type: 'javascript',
                message: message,
                source: source,
                line: lineno,
                column: colno,
                stack: error ? error.stack : null
            });
            return false; // Ne pas supprimer l'erreur de la console
        };
        
        // Capturer les rejets de promesses non gérés
        window.addEventListener('unhandledrejection', function(event) {
            logError({
                type: 'promise',
                message: event.reason ? event.reason.message : 'Promise rejected',
                stack: event.reason ? event.reason.stack : null
            });
        });
        
        // Capturer les erreurs de ressources (images, scripts, etc.)
        window.addEventListener('error', function(event) {
            if (event.target !== window) {
                logError({
                    type: 'resource',
                    message: 'Échec de chargement: ' + (event.target.src || event.target.href),
                    element: event.target.tagName
                });
            }
        }, true);
        
        console.log('✅ ErrorHandler initialisé');
    }
    
    // Logger une erreur
    function logError(errorData) {
        const error = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...errorData
        };
        
        // Console
        if (CONFIG.enableConsole) {
            console.error('🚨 Erreur capturée:', error);
        }
        
        // Stockage local
        if (CONFIG.enableStorage) {
            saveToStorage(error);
        }
        
        // Notification pour erreurs critiques
        if (CONFIG.criticalErrors.includes(errorData.type)) {
            notifyCriticalError(error);
        }
        
        return error;
    }
    
    // Sauvegarder dans localStorage
    function saveToStorage(error) {
        try {
            let errors = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
            errors.unshift(error);
            
            // Limiter le nombre d'erreurs
            if (errors.length > CONFIG.maxErrors) {
                errors = errors.slice(0, CONFIG.maxErrors);
            }
            
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(errors));
        } catch (e) {
            console.warn('Impossible de sauvegarder l\'erreur:', e);
        }
    }
    
    // Récupérer les erreurs stockées
    function getErrors() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
        } catch (e) {
            return [];
        }
    }
    
    // Effacer les erreurs
    function clearErrors() {
        localStorage.removeItem(CONFIG.storageKey);
        console.log('✅ Logs d\'erreurs effacés');
    }
    
    // Notification pour erreurs critiques
    function notifyCriticalError(error) {
        // Afficher une notification si l'API est disponible
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Erreur KFS BTP', {
                body: error.message,
                icon: 'assets/logo-kfs-btp.jpeg'
            });
        }
    }
    
    // Générer un ID unique
    function generateId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Vérifier la santé du site
    async function healthCheck() {
        const checks = {
            timestamp: new Date().toISOString(),
            localStorage: checkLocalStorage(),
            sessionStorage: checkSessionStorage(),
            serviceWorker: await checkServiceWorker(),
            online: navigator.onLine,
            memory: getMemoryUsage()
        };
        
        return checks;
    }
    
    function checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return { status: 'ok', available: true };
        } catch (e) {
            return { status: 'error', available: false, message: e.message };
        }
    }
    
    function checkSessionStorage() {
        try {
            sessionStorage.setItem('test', 'test');
            sessionStorage.removeItem('test');
            return { status: 'ok', available: true };
        } catch (e) {
            return { status: 'error', available: false, message: e.message };
        }
    }
    
    async function checkServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                return {
                    status: 'ok',
                    registered: !!registration,
                    scope: registration ? registration.scope : null
                };
            } catch (e) {
                return { status: 'error', message: e.message };
            }
        }
        return { status: 'unavailable' };
    }
    
    function getMemoryUsage() {
        if (performance && performance.memory) {
            return {
                usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
                totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB'
            };
        }
        return { status: 'unavailable' };
    }
    
    // Exporter le rapport d'erreurs
    function exportErrors() {
        const errors = getErrors();
        const report = {
            generated: new Date().toISOString(),
            site: 'KFS BTP',
            url: window.location.origin,
            totalErrors: errors.length,
            errors: errors
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kfs-btp-errors-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // API publique
    return {
        init,
        logError,
        getErrors,
        clearErrors,
        healthCheck,
        exportErrors
    };
})();

// Auto-initialisation
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', ErrorHandler.init);
}
