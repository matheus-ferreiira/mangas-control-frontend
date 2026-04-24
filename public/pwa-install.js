const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            });
            console.log('Service Worker registered:', registration);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
};

// Registrar o service worker quando a app carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
} else {
    registerServiceWorker();
}

// Detectar a possibilidade de instalação
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Emitir um evento customizado que pode ser ouvido em componentes Vue
    window.dispatchEvent(new CustomEvent('pwa-installprompt-ready', { detail: e }));
});

window.addEventListener('appinstalled', () => {
    console.log('PWA instalada!');
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
});

// Expor função global para instalar
window.installPWA = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
    }
};
