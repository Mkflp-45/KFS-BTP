// ===================================================
// PERFORMANCE.JS - Optimisations de performance KFS BTP
// ===================================================

(function() {
    'use strict';

    // ===================================================
    // 1. LAZY LOADING IMAGES
    // ===================================================
    function initLazyLoading() {
        // Utiliser Intersection Observer pour le lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Charger l'image depuis data-src
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        // Charger le srcset si présent
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                            img.removeAttribute('data-srcset');
                        }
                        
                        // Ajouter classe loaded pour animation
                        img.classList.add('lazy-loaded');
                        img.classList.remove('lazy');
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',  // Charger 50px avant d'être visible
                threshold: 0.01
            });

            // Observer toutes les images avec classe lazy ou data-src
            document.querySelectorAll('img.lazy, img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback pour navigateurs anciens
            document.querySelectorAll('img.lazy, img[data-src]').forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        }
    }

    // ===================================================
    // 2. PRELOAD CRITICAL RESOURCES
    // ===================================================
    function preloadCriticalResources() {
        const criticalResources = [
            { href: 'style.css', as: 'style' },
            { href: 'utils.js', as: 'script' },
            { href: 'fragments.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    }

    // ===================================================
    // 3. DEFER NON-CRITICAL JS
    // ===================================================
    function loadDeferredScripts() {
        // Charger les scripts non-critiques après le chargement
        const deferredScripts = document.querySelectorAll('script[data-defer]');
        deferredScripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.src = script.dataset.src;
            document.body.appendChild(newScript);
        });
    }

    // ===================================================
    // 4. IMAGE OPTIMIZATION HELPER
    // ===================================================
    function optimizeImages() {
        document.querySelectorAll('img:not([loading])').forEach(img => {
            // Ajouter loading="lazy" aux images sans attribut
            img.setAttribute('loading', 'lazy');
            
            // Ajouter decoding async
            img.setAttribute('decoding', 'async');
        });
    }

    // ===================================================
    // 5. RESOURCE HINTS
    // ===================================================
    function addResourceHints() {
        const preconnectDomains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com',
            'https://images.unsplash.com'
        ];

        preconnectDomains.forEach(domain => {
            // Preconnect
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = domain;
            preconnect.crossOrigin = 'anonymous';
            document.head.appendChild(preconnect);
            
            // DNS Prefetch comme fallback
            const dnsPrefetch = document.createElement('link');
            dnsPrefetch.rel = 'dns-prefetch';
            dnsPrefetch.href = domain;
            document.head.appendChild(dnsPrefetch);
        });
    }

    // ===================================================
    // 6. PERFORMANCE MONITORING
    // ===================================================
    function monitorPerformance() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            // Observer les Largest Contentful Paint
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.startTime.toFixed(2) + 'ms');
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {}

            // Observer les First Input Delay
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        console.log('FID:', entry.processingStart - entry.startTime + 'ms');
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {}

            // Mesurer le temps de chargement total
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        console.log('📊 Performance KFS BTP:');
                        console.log('  - DOM Ready:', perfData.domContentLoadedEventEnd.toFixed(0) + 'ms');
                        console.log('  - Page Load:', perfData.loadEventEnd.toFixed(0) + 'ms');
                        console.log('  - TTFB:', perfData.responseStart.toFixed(0) + 'ms');
                    }
                }, 0);
            });
        }
    }

    // ===================================================
    // 7. SMOOTH SCROLL OPTIMIZATION
    // ===================================================
    function optimizeSmoothScroll() {
        // Utiliser requestAnimationFrame pour le scroll
        let ticking = false;
        
        document.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // Animation au scroll optimisée
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ===================================================
    // 8. REDUCE MOTION FOR ACCESSIBILITY
    // ===================================================
    function respectReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.classList.add('reduce-motion');
            
            // Désactiver les animations CSS
            const style = document.createElement('style');
            style.textContent = `
                .reduce-motion *,
                .reduce-motion *::before,
                .reduce-motion *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ===================================================
    // 9. MEMORY CLEANUP
    // ===================================================
    function setupMemoryCleanup() {
        // Nettoyer les event listeners sur les éléments supprimés
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        // Déclencher un event pour cleanup personnalisé
                        node.dispatchEvent(new CustomEvent('cleanup'));
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ===================================================
    // 10. CRITICAL CSS INLINING HELPER
    // ===================================================
    function inlineCriticalCSS() {
        const criticalStyles = `
            /* Critical CSS - Above the fold */
            body { margin: 0; font-family: 'Inter', sans-serif; }
            .hero { min-height: 100vh; }
            nav { position: fixed; width: 100%; z-index: 50; }
            img.lazy { opacity: 0; transition: opacity 0.3s; }
            img.lazy-loaded { opacity: 1; }
            .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                        background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; }
            @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        `;
        
        const style = document.createElement('style');
        style.id = 'critical-css';
        style.textContent = criticalStyles;
        document.head.insertBefore(style, document.head.firstChild);
    }

    // ===================================================
    // INITIALISATION
    // ===================================================
    function init() {
        // Appliquer les optimisations
        inlineCriticalCSS();
        addResourceHints();
        respectReducedMotion();
        
        // Attendre le DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initLazyLoading();
                optimizeImages();
                optimizeSmoothScroll();
            });
        } else {
            initLazyLoading();
            optimizeImages();
            optimizeSmoothScroll();
        }

        // Après le chargement complet
        window.addEventListener('load', () => {
            loadDeferredScripts();
            setupMemoryCleanup();
            monitorPerformance();
        });
    }

    // Lancer l'initialisation
    init();

    // Exposer les fonctions utiles globalement
    window.KFSPerformance = {
        lazyLoad: initLazyLoading,
        monitor: monitorPerformance,
        optimize: optimizeImages
    };

})();
