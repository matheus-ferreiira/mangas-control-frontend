<template>
    <div v-if="showInstallPrompt" class="pwa-overlay" @click.self="dismissPrompt">
        <div class="pwa-sheet">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
                <img src="/icon-192.png" alt="Neon Curator" style="width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; object-fit: cover;" />
                <div style="min-width: 0;">
                    <div style="font-size: 1rem; font-weight: 600; color: var(--text-primary); line-height: 1.25;">Instalar Neon Curator</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">Acesso rápido e offline</div>
                </div>
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="pwa-btn-ghost" @click="dismissPrompt">Agora não</button>
                <button class="pwa-btn-primary" @click="installPWA">
                    <IonIcon :icon="downloadOutline" style="font-size: 16px;" /> Instalar
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonIcon } from '@ionic/vue';
import { downloadOutline } from 'ionicons/icons';

export default defineComponent({
    name: 'PWAInstallPrompt',
    components: {
        IonIcon,
    },
    data() {
        return {
            showInstallPrompt: false,
            dismissedTimes: 0,
            downloadOutline,
        };
    },
    mounted() {
        window.addEventListener('pwa-installprompt-ready', this.onInstallPromptReady);
        window.addEventListener('pwa-installed', this.onPWAInstalled);
        this.checkPWASupport();

        // O evento beforeinstallprompt pode ter disparado antes deste componente montar;
        // se o prompt já foi capturado em main.ts, mostrar o banner imediatamente.
        if ((window as any).__pwaPrompt) {
            this.onInstallPromptReady();
        }
    },
    beforeUnmount() {
        window.removeEventListener('pwa-installprompt-ready', this.onInstallPromptReady);
        window.removeEventListener('pwa-installed', this.onPWAInstalled);
    },
    methods: {
        onInstallPromptReady() {
            // Mostrar apenas uma vez por sessão ou cada vez que o usuário fecha
            if (this.dismissedTimes < 2) {
                this.showInstallPrompt = true;
            }
        },

        async installPWA() {
            (window as any).installPWA?.();
            this.showInstallPrompt = false;
        },

        dismissPrompt() {
            this.showInstallPrompt = false;
            this.dismissedTimes++;
            localStorage.setItem('pwa-dismiss-count', this.dismissedTimes.toString());
        },

        onPWAInstalled() {
            this.showInstallPrompt = false;
        },

        checkPWASupport() {
            const dismissCount = localStorage.getItem('pwa-dismiss-count');
            if (dismissCount) {
                this.dismissedTimes = parseInt(dismissCount, 10);
            }
        },
    },
});
</script>

<style scoped>
.pwa-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    animation: pwaFade 0.3s ease-out;
}

.pwa-sheet {
    width: 100%;
    margin: 12px;
    margin-bottom: max(12px, env(safe-area-inset-bottom, 12px));
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
    animation: pwaSlideUp 0.3s ease-out;
}

.pwa-btn-ghost {
    flex: 1;
    padding: 12px 20px;
    border-radius: 8px;
    background: transparent;
    border: 1px solid var(--border-default);
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
}

.pwa-btn-primary {
    flex: 1;
    padding: 12px 20px;
    border-radius: 8px;
    background: var(--accent-primary);
    border: none;
    color: #000000;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

@keyframes pwaFade {
    from { opacity: 0; }
    to   { opacity: 1; }
}

@keyframes pwaSlideUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
}
</style>
