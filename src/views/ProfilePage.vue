<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <div class="px-4 pb-24 page-top">
                <!-- Title -->
                <div class="text-[20px] font-extrabold text-neon-accent tracking-[-0.02em] mb-5">Perfil</div>

                <!-- Avatar block -->
                <div class="flex flex-col items-center mb-6 gap-2">
                    <div
                        class="w-[72px] h-[72px] rounded-full flex items-center justify-center text-[28px] font-extrabold text-white border-[3px]"
                        style="background: linear-gradient(135deg, #00d4aa, #8b5cf6); border-color: rgba(0,212,170,0.2)"
                    >
                        <img v-if="user?.avatar" :src="user.avatar" alt="Avatar" class="w-full h-full object-cover rounded-full" />
                        <span v-else>{{ userInitial }}</span>
                    </div>
                    <div class="text-[18px] font-extrabold text-neon-text">{{ user?.name || 'Curador' }}</div>
                    <div class="text-[12px] text-neon-muted">{{ user?.email }}</div>
                    <div class="px-3.5 py-1.5 rounded-full text-[11px] font-bold text-neon-accent border"
                        style="background: rgba(0,212,170,0.1); border-color: rgba(0,212,170,0.3)">
                        🏆 Arquivista Digital
                    </div>
                </div>

                <!-- Stats grid -->
                <div class="grid grid-cols-3 gap-2 mb-6">
                    <div class="bg-neon-surface border border-neon-border rounded-[10px] p-3 text-center">
                        <div class="text-[24px] font-black text-neon-text leading-none mb-1">{{ stats.total }}</div>
                        <div class="text-[9px] font-bold uppercase tracking-[0.08em] text-neon-muted">Total</div>
                    </div>
                    <div class="bg-neon-surface border border-neon-border rounded-[10px] p-3 text-center">
                        <div class="text-[24px] font-black leading-none mb-1" style="color: #3b82f6">{{ stats.reading }}</div>
                        <div class="text-[9px] font-bold uppercase tracking-[0.08em] text-neon-muted">Lendo</div>
                    </div>
                    <div class="bg-neon-surface border border-neon-border rounded-[10px] p-3 text-center">
                        <div class="text-[24px] font-black leading-none mb-1" style="color: #10b981">{{ stats.completed }}</div>
                        <div class="text-[9px] font-bold uppercase tracking-[0.08em] text-neon-muted">Completo</div>
                    </div>
                </div>

                <!-- Gerenciamento -->
                <div class="text-[10px] font-bold uppercase tracking-[0.1em] text-neon-muted mb-2.5">Gerenciamento</div>
                <div class="bg-neon-surface border border-neon-border rounded-[14px] p-3.5 mb-2 flex items-center gap-3.5 cursor-pointer transition-colors active:border-neon-accent" @click="$router.push('/manage-mangas')">
                    <div class="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-xl flex-shrink-0" style="background: rgba(0,212,170,0.12); color: #00d4aa">
                        <ion-icon :icon="bookOutline" />
                    </div>
                    <span class="flex-1 text-[15px] font-semibold text-neon-text">Catálogo de Mangás</span>
                    <ion-icon :icon="chevronForwardOutline" class="text-neon-muted text-lg" />
                </div>
                <div class="bg-neon-surface border border-neon-border rounded-[14px] p-3.5 mb-2 flex items-center gap-3.5 cursor-pointer transition-colors active:border-neon-accent" @click="$router.push('/tabs/sources')">
                    <div class="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-xl flex-shrink-0" style="background: rgba(139,92,246,0.12); color: #8b5cf6">
                        <ion-icon :icon="cloudDownloadOutline" />
                    </div>
                    <span class="flex-1 text-[15px] font-semibold text-neon-text">Gerenciar Fontes</span>
                    <ion-icon :icon="chevronForwardOutline" class="text-neon-muted text-lg" />
                </div>

                <!-- Conta -->
                <div class="text-[10px] font-bold uppercase tracking-[0.1em] text-neon-muted mb-2.5 mt-5">Conta</div>
                <div class="bg-neon-surface border rounded-[14px] p-3.5 flex items-center gap-3.5 cursor-pointer transition-colors" style="border-color: rgba(239,68,68,0.2)" @click="confirmLogout">
                    <div class="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-xl flex-shrink-0" style="background: rgba(239,68,68,0.12); color: #ef4444">
                        <ion-icon :icon="logOutOutline" />
                    </div>
                    <span class="flex-1 text-[15px] font-semibold" style="color: #ef4444">Sair</span>
                    <ion-icon :icon="chevronForwardOutline" class="text-neon-muted text-lg" />
                </div>

                <p class="text-center text-[11px] text-neon-muted mt-6">© 2025 Content Tracker · v1.0.0</p>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent, IonIcon, alertController,
} from '@ionic/vue';
import {
    bookOutline, cloudDownloadOutline, chevronForwardOutline, logOutOutline,
} from 'ionicons/icons';
import { authStore } from '@/store/auth';
import { authService } from '@/services/authService';
import { userContentService, UserContent } from '@/services/userContentService';

export default defineComponent({
    name: 'ProfilePage',
    components: { IonPage, IonContent, IonIcon },
    data() {
        return {
            userContents: [] as UserContent[],
            bookOutline, cloudDownloadOutline, chevronForwardOutline, logOutOutline,
        };
    },
    computed: {
        user() { return authStore.user; },
        userInitial(): string {
            return (authStore.user?.name ?? '').charAt(0).toUpperCase() || 'U';
        },
        stats() {
            return {
                total: this.userContents.length,
                reading: this.userContents.filter((m) => m.status === 'reading').length,
                completed: this.userContents.filter((m) => m.status === 'completed').length,
            };
        },
    },
    async ionViewWillEnter() {
        try {
            this.userContents = await userContentService.getAll();
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
