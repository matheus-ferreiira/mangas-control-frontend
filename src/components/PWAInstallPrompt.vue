<template>
    <div v-if="showInstallPrompt" class="fixed bottom-24 left-5 right-5 bg-neon-surface border border-neon-accent rounded-2xl p-4 shadow-lg z-50 animate-slideUp">
        <div class="flex items-start gap-3">
            <div class="flex-1">
                <h3 class="text-sm font-bold text-neon-text mb-1">Instalar Neon Curator</h3>
                <p class="text-xs text-neon-muted">Instale o app para acesso rápido e funcionalidade offline</p>
            </div>
            <button
                class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-neon-elevated border border-neon-border text-neon-muted cursor-pointer hover:bg-neon-border transition-colors"
                @click="dismissPrompt"
            >
                <IonIcon :icon="closeOutline" class="text-sm" />
            </button>
        </div>
        <div class="flex gap-2 mt-3">
            <IonButton
                fill="clear"
                size="small"
                class="flex-1 btn-secondary-sm"
                @click="dismissPrompt"
            >
                Depois
            </IonButton>
            <IonButton
                fill="solid"
                size="small"
                class="flex-1 btn-primary-sm"
                @click="installPWA"
            >
                Instalar
            </IonButton>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';

export default defineComponent({
    name: 'PWAInstallPrompt',
    components: {
        IonButton,
        IonIcon,
    },
    data() {
        return {
            showInstallPrompt: false,
            dismissedTimes: 0,
            closeOutline,
        };
    },
    mounted() {
        // Ouvir o evento customizado de PWA
        window.addEventListener('pwa-installprompt-ready', this.onInstallPromptReady);
        window.addEventListener('pwa-installed', this.onPWAInstalled);

        // Se o browser suporta a API mas não dispara o evento,
        // mostrar um ícone alternativo ou link
        this.checkPWASupport();
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
            console.log('App instalado com sucesso!');
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
.btn-primary-sm {
    --background: var(--neon-accent);
    --color: #000;
    --border-radius: 10px;
    font-weight: 600;
    font-size: 12px;
}

.btn-secondary-sm {
    --background: transparent;
    --color: var(--neon-text);
    --border-radius: 10px;
    font-weight: 600;
    font-size: 12px;
    border: 1px solid var(--neon-border);
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.animate-slideUp {
    animation: slideUp 0.3s ease-out;
}
</style>
