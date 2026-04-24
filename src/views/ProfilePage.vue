<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>
                    <span class="bg-gradient-to-br from-neon-blue to-neon-accent bg-clip-text text-transparent font-extrabold text-lg">Perfil</span>
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="px-5 pt-6 pb-24">
                <!-- Avatar -->
                <div class="flex flex-col items-center pb-7 text-center">
                    <div class="w-[90px] h-[90px] rounded-full border-2 border-neon-accent overflow-hidden bg-neon-elevated flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,229,176,0.25)]">
                        <img v-if="user?.avatar" :src="user.avatar" alt="Avatar" class="w-full h-full object-cover" />
                        <ion-icon v-else :icon="personCircleOutline" class="text-[56px] text-neon-muted" />
                    </div>
                    <h2 class="text-[22px] font-extrabold text-neon-text m-0 mb-1">{{ user?.name || 'Curador' }}</h2>
                    <p class="text-sm text-neon-muted m-0 mb-3.5">{{ user?.email }}</p>
                    <div class="inline-flex items-center gap-1.5 bg-neon-accent/12 border border-neon-accent/30 rounded-full px-3.5 py-1.5 text-xs font-bold text-neon-accent">
                        <ion-icon :icon="shieldCheckmarkOutline" />
                        Arquivista Digital
                    </div>
                </div>

                <!-- Stats -->
                <div class="flex items-center bg-neon-surface border border-neon-border rounded-[18px] p-5 mb-7">
                    <div class="flex-1 flex flex-col items-center gap-1">
                        <span class="text-[28px] font-black text-neon-text leading-none">{{ stats.total }}</span>
                        <span class="text-[11px] font-bold uppercase tracking-[0.5px] text-neon-muted">Total</span>
                    </div>
                    <div class="w-px h-9 bg-neon-border"></div>
                    <div class="flex-1 flex flex-col items-center gap-1">
                        <span class="text-[28px] font-black text-neon-accent leading-none">{{ stats.reading }}</span>
                        <span class="text-[11px] font-bold uppercase tracking-[0.5px] text-neon-muted">Lendo</span>
                    </div>
                    <div class="w-px h-9 bg-neon-border"></div>
                    <div class="flex-1 flex flex-col items-center gap-1">
                        <span class="text-[28px] font-black text-[#7b8ff5] leading-none">{{ stats.completed }}</span>
                        <span class="text-[11px] font-bold uppercase tracking-[0.5px] text-neon-muted">Completo</span>
                    </div>
                </div>

                <!-- Menu -->
                <div class="mb-6">
                    <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2.5">Gerenciamento</span>
                    <div class="bg-neon-surface border border-neon-border rounded-[14px] p-3.5 mb-2 flex items-center gap-3.5 cursor-pointer transition-colors active:border-neon-accent" @click="$router.push('/manage-mangas')">
                        <div class="w-[38px] h-[38px] rounded-[10px] bg-neon-accent/12 text-neon-accent flex items-center justify-center text-xl flex-shrink-0">
                            <ion-icon :icon="bookOutline" />
                        </div>
                        <span class="flex-1 text-[15px] font-semibold text-neon-text">Catálogo de Mangás</span>
                        <ion-icon :icon="chevronForwardOutline" class="text-neon-muted text-lg" />
                    </div>
                    <div class="bg-neon-surface border border-neon-border rounded-[14px] p-3.5 flex items-center gap-3.5 cursor-pointer transition-colors active:border-neon-accent" @click="$router.push('/tabs/sources')">
                        <div class="w-[38px] h-[38px] rounded-[10px] bg-neon-blue/12 text-[#7b8ff5] flex items-center justify-center text-xl flex-shrink-0">
                            <ion-icon :icon="cloudDownloadOutline" />
                        </div>
                        <span class="flex-1 text-[15px] font-semibold text-neon-text">Gerenciar Fontes</span>
                        <ion-icon :icon="chevronForwardOutline" class="text-neon-muted text-lg" />
                    </div>
                </div>

                <div class="mb-6">
                    <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2.5">Conta</span>
                    <div class="bg-neon-surface border border-neon-border rounded-[14px] p-3.5 flex items-center gap-3.5 cursor-pointer transition-colors active:border-neon-danger" @click="confirmLogout">
                        <div class="w-[38px] h-[38px] rounded-[10px] bg-neon-danger/12 text-[#ff6b7a] flex items-center justify-center text-xl flex-shrink-0">
                            <ion-icon :icon="logOutOutline" />
                        </div>
                        <span class="flex-1 text-[15px] font-semibold text-neon-text">Sair</span>
                        <ion-icon :icon="chevronForwardOutline" class="text-neon-muted text-lg" />
                    </div>
                </div>

                <p class="text-center text-[11px] text-[#4a5568] mt-3">© 2025 Protocolo Arquivista Digital</p>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, alertController,
} from '@ionic/vue';
import {
    personCircleOutline, shieldCheckmarkOutline, bookOutline,
    cloudDownloadOutline, chevronForwardOutline, logOutOutline,
} from 'ionicons/icons';
import { authStore } from '@/store/auth';
import { authService } from '@/services/authService';
import { userMangaService, UserManga } from '@/services/userMangaService';

export default defineComponent({
    name: 'ProfilePage',
    components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon },
    data() {
        return {
            userMangas: [] as UserManga[],
            personCircleOutline, shieldCheckmarkOutline, bookOutline,
            cloudDownloadOutline, chevronForwardOutline, logOutOutline,
        };
    },
    computed: {
        user() { return authStore.user; },
        stats() {
            return {
                total: this.userMangas.length,
                reading: this.userMangas.filter((m) => m.status === 'reading').length,
                completed: this.userMangas.filter((m) => m.status === 'completed').length,
            };
        },
    },
    async ionViewWillEnter() {
        try {
            this.userMangas = await userMangaService.getAll();
        } catch {
            // non-blocking
        }
    },
    methods: {
        async confirmLogout() {
            const alert = await alertController.create({
                header: 'Sair',
                message: 'Tem certeza que deseja sair?',
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Sair', role: 'destructive', handler: () => this.logout() },
                ],
            });
            await alert.present();
        },
        async logout() {
            try {
                await authService.logout();
            } catch {
                // proceed regardless
            } finally {
                authStore.clearAuth();
                this.$router.replace('/login');
            }
        },
    },
});
</script>
