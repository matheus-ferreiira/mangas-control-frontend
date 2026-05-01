<template>
    <IonPage>
        <IonContent :fullscreen="true">
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
                    <div
                        class="px-3.5 py-1.5 rounded-full text-[11px] font-bold border"
                        :style="isAdmin
                            ? { background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b' }
                            : { background: 'rgba(0,212,170,0.1)', borderColor: 'rgba(0,212,170,0.3)', color: '#00d4aa' }"
                    >{{ isAdmin ? '⚡ Administrador' : '📚 Leitor' }}</div>
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
                <!-- Admin only: catalog management -->
                <div v-if="isAdmin" class="bg-neon-surface border border-neon-border rounded-[14px] p-3.5 mb-2 flex items-center gap-3.5 cursor-pointer transition-colors active:border-neon-accent" @click="$router.push('/manage-mangas')">
                    <div class="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-xl flex-shrink-0" style="background: rgba(0,212,170,0.12); color: #00d4aa">
                        <IonIcon :icon="bookOutline" />
                    </div>
                    <span class="flex-1 text-[15px] font-semibold text-neon-text">Catálogo de Obras</span>
                    <IonIcon :icon="chevronForwardOutline" class="text-neon-muted text-lg" />
                </div>
                <!-- All users: content requests (admins manage them, users create them) -->
                <div class="bg-neon-surface border border-neon-border rounded-[14px] p-3.5 mb-2 flex items-center gap-3.5 cursor-pointer transition-colors active:border-neon-accent" @click="$router.push('/content-requests')">
                    <div class="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-xl flex-shrink-0" style="background: rgba(59,130,246,0.12); color: #3b82f6">
                        <IonIcon :icon="addCircleOutline" />
                    </div>
                    <span class="flex-1 text-[15px] font-semibold text-neon-text">{{ isAdmin ? 'Solicitações de Conteúdo' : 'Sugerir Conteúdo' }}</span>
                    <IonIcon :icon="chevronForwardOutline" class="text-neon-muted text-lg" />
                </div>
                <!-- Minhas Fontes inline -->
                <div style="margin-bottom: 8px;">
                    <div
                        style="background: #1a2035; border: 1px solid #1e2640; border-radius: 14px; padding: 14px 14px 10px;"
                    >
                        <!-- Section header -->
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(139,92,246,0.12); color: #8b5cf6; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">
                                    <IonIcon :icon="cloudDownloadOutline" />
                                </div>
                                <span style="font-size: 15px; font-weight: 600; color: #eef2ff;">Minhas Fontes</span>
                            </div>
                            <button
                                style="width: 32px; height: 32px; border-radius: 10px; border: 1px solid #1e2640; background: transparent; color: #00d4aa; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
                                @click="openSiteModal(null)"
                            >+</button>
                        </div>

                        <!-- Sites list -->
                        <div v-if="sitesLoading" style="text-align: center; padding: 10px 0;">
                            <IonSpinner name="crescent" style="width: 20px; height: 20px; color: #4a5470;" />
                        </div>
                        <div v-else-if="sites.length === 0" style="text-align: center; padding: 8px 0;">
                            <span style="font-size: 12px; color: #4a5470;">Nenhuma fonte cadastrada</span>
                        </div>
                        <div v-else style="display: flex; flex-direction: column; gap: 6px;">
                            <div
                                v-for="site in sites"
                                :key="site.id"
                                style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1px solid #1e2640; background: #141825;"
                            >
                                <!-- Favorite indicator -->
                                <button
                                    style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 0; flex-shrink: 0; line-height: 1;"
                                    :style="{ opacity: site.is_favorite ? 1 : 0.3 }"
                                    @click="toggleFavorite(site)"
                                >★</button>
                                <!-- Info -->
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-size: 13px; font-weight: 700; color: #eef2ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ site.name }}</div>
                                    <div style="font-size: 10px; color: #4a5470; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ site.url }}</div>
                                </div>
                                <!-- Edit / Delete -->
                                <button
                                    style="width: 28px; height: 28px; border-radius: 8px; border: 1px solid #1e2640; background: transparent; color: #4a5470; font-size: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
                                    @click="openSiteModal(site)"
                                >✏</button>
                                <button
                                    style="width: 28px; height: 28px; border-radius: 8px; border: 1px solid rgba(239,68,68,0.2); background: transparent; color: #ef4444; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
                                    @click="deleteSite(site)"
                                >×</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Instalar App -->
                <template v-if="canInstall">
                    <div class="text-[10px] font-bold uppercase tracking-[0.1em] text-neon-muted mb-2.5 mt-5">Aplicativo</div>
                    <div class="bg-neon-surface border border-neon-border rounded-[14px] p-3.5 mb-2 flex items-center gap-3.5 cursor-pointer transition-colors active:border-neon-accent" @click="installPwa">
                        <div class="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-xl flex-shrink-0" style="background: rgba(59,130,246,0.12); color: #3b82f6">
                            <IonIcon :icon="downloadOutline" />
                        </div>
                        <div class="flex-1">
                            <div class="text-[15px] font-semibold text-neon-text">Instalar como App</div>
                            <div class="text-[11px] text-neon-muted mt-0.5">Adicionar à tela inicial</div>
                        </div>
                        <IonIcon :icon="chevronForwardOutline" class="text-neon-muted text-lg" />
                    </div>
                </template>

                <!-- Conta -->
                <div class="text-[10px] font-bold uppercase tracking-[0.1em] text-neon-muted mb-2.5 mt-5">Conta</div>
                <div class="bg-neon-surface border rounded-[14px] p-3.5 flex items-center gap-3.5 cursor-pointer transition-colors" style="border-color: rgba(239,68,68,0.2)" @click="confirmLogout">
                    <div class="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-xl flex-shrink-0" style="background: rgba(239,68,68,0.12); color: #ef4444">
                        <IonIcon :icon="logOutOutline" />
                    </div>
                    <span class="flex-1 text-[15px] font-semibold" style="color: #ef4444">Sair</span>
                    <IonIcon :icon="chevronForwardOutline" class="text-neon-muted text-lg" />
                </div>

                <p class="text-center text-[11px] text-neon-muted mt-6">© 2025 Content Tracker · v1.0.0</p>
            </div>
        </IonContent>

        <!-- Site modal -->
        <IonModal
            :is-open="siteModalOpen"
            :initial-breakpoint="0.72"
            :breakpoints="[0, 0.72, 1]"
            :handle="true"
            @didDismiss="siteModalOpen = false"
        >
            <IonContent style="--background: #141825;">
                <div style="padding: 8px 20px 40px;">
                    <div style="font-size: 16px; font-weight: 800; color: #eef2ff; margin-bottom: 16px;">
                        {{ editingSite ? 'Editar Fonte' : 'Nova Fonte' }}
                    </div>
                    <div style="margin-bottom: 12px;">
                        <div style="font-size: 10px; font-weight: 800; color: #4a5470; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">Nome</div>
                        <input
                            v-model="siteForm.name"
                            placeholder="Ex: MangaDex"
                            style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #1e2640; background: #1a2035; color: #eef2ff; font-size: 14px; outline: none; box-sizing: border-box;"
                        />
                    </div>
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 10px; font-weight: 800; color: #4a5470; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">URL</div>
                        <input
                            v-model="siteForm.url"
                            placeholder="https://mangadex.org"
                            type="url"
                            style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #1e2640; background: #1a2035; color: #eef2ff; font-size: 14px; outline: none; box-sizing: border-box;"
                        />
                    </div>
                    <div
                        style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 12px; border: 1px solid #1e2640; background: #1a2035; margin-bottom: 20px; cursor: pointer;"
                        @click="siteForm.is_favorite = !siteForm.is_favorite"
                    >
                        <span style="font-size: 13px; font-weight: 600; color: #eef2ff;">Marcar como favorita</span>
                        <div :style="toggleStyle(siteForm.is_favorite)">
                            <div :style="toggleKnobStyle(siteForm.is_favorite)"></div>
                        </div>
                    </div>
                    <button
                        :disabled="!siteForm.name.trim() || !siteForm.url.trim() || siteSaving"
                        style="width: 100%; padding: 14px; border-radius: 14px; border: none; font-size: 14px; font-weight: 800; cursor: pointer; transition: opacity 0.2s;"
                        :style="{ background: '#00d4aa', color: '#000', opacity: (!siteForm.name.trim() || !siteForm.url.trim()) ? 0.5 : 1 }"
                        @click="saveSite"
                    >{{ siteSaving ? 'Salvando...' : (editingSite ? 'Salvar' : 'Adicionar') }}</button>
                </div>
            </IonContent>
        </IonModal>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent, IonIcon, IonModal, IonSpinner, alertController, toastController,
} from '@ionic/vue';
import {
    bookOutline, cloudDownloadOutline, chevronForwardOutline, logOutOutline, downloadOutline, addCircleOutline,
} from 'ionicons/icons';
import { authStore } from '@/store/auth';
import { authService } from '@/services/authService';
import { userContentService, UserContent } from '@/services/userContentService';
import { userSiteService, UserSite } from '@/services/userSiteService';

function emptySiteForm() {
    return { name: '', url: '', is_favorite: false };
}

export default defineComponent({
    name: 'ProfilePage',
    components: { IonPage, IonContent, IonIcon, IonModal, IonSpinner },
    data() {
        return {
            userContents: [] as UserContent[],
            canInstall: false,
            deferredPrompt: null as any,
            // Sites
            sites: [] as UserSite[],
            sitesLoading: false,
            siteModalOpen: false,
            siteSaving: false,
            editingSite: null as UserSite | null,
            siteForm: emptySiteForm(),
            bookOutline, cloudDownloadOutline, chevronForwardOutline, logOutOutline, downloadOutline, addCircleOutline,
        };
    },
    mounted() {
        window.addEventListener('beforeinstallprompt', (e: Event) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.canInstall = true;
        });
        window.addEventListener('appinstalled', () => {
            this.canInstall = false;
            this.deferredPrompt = null;
        });
    },
    computed: {
        user() { return authStore.user; },
        isAdmin(): boolean { return authStore.user?.role === 'admin'; },
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
        await this.loadSites();
    },
    methods: {
        async loadSites() {
            this.sitesLoading = true;
            try {
                this.sites = await userSiteService.getAll();
            } catch {
                // non-blocking
            } finally {
                this.sitesLoading = false;
            }
        },

        openSiteModal(site: UserSite | null) {
            this.editingSite = site;
            this.siteForm = site
                ? { name: site.name, url: site.url, is_favorite: site.is_favorite }
                : emptySiteForm();
            this.siteModalOpen = true;
        },

        async saveSite() {
            if (!this.siteForm.name.trim() || !this.siteForm.url.trim()) return;
            this.siteSaving = true;
            try {
                if (this.editingSite) {
                    const updated = await userSiteService.update(this.editingSite.id, this.siteForm);
                    const idx = this.sites.findIndex((s) => s.id === this.editingSite!.id);
                    if (idx >= 0) this.sites.splice(idx, 1, updated);
                } else {
                    const created = await userSiteService.create(this.siteForm);
                    this.sites.push(created);
                    this.sites.sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
                }
                this.siteModalOpen = false;
            } catch {
                const toast = await toastController.create({ message: 'Falha ao salvar fonte.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.siteSaving = false;
            }
        },

        async toggleFavorite(site: UserSite) {
            try {
                const updated = await userSiteService.toggleFavorite(site);
                const idx = this.sites.findIndex((s) => s.id === site.id);
                if (idx >= 0) this.sites.splice(idx, 1, updated);
                this.sites.sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
            } catch {
                // silencioso
            }
        },

        async deleteSite(site: UserSite) {
            const alert = await alertController.create({
                header: 'Remover fonte',
                message: `Remover "${site.name}"?`,
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    {
                        text: 'Remover', role: 'destructive',
                        handler: async () => {
                            try {
                                await userSiteService.delete(site.id);
                                this.sites = this.sites.filter((s) => s.id !== site.id);
                            } catch {
                                const toast = await toastController.create({ message: 'Falha ao remover.', duration: 2000, color: 'danger', position: 'top' });
                                await toast.present();
                            }
                        },
                    },
                ],
            });
            await alert.present();
        },

        toggleStyle(active: boolean): Record<string, string> {
            return {
                width: '44px', height: '26px', borderRadius: '13px', position: 'relative',
                background: active ? '#00d4aa' : '#1e2640',
                transition: 'background 0.2s', flexShrink: '0',
            };
        },

        toggleKnobStyle(active: boolean): Record<string, string> {
            return {
                position: 'absolute', top: '3px', borderRadius: '10px',
                left: active ? '21px' : '3px', width: '20px', height: '20px',
                background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            };
        },

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

        async installPwa() {
            if (!this.deferredPrompt) return;
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                this.canInstall = false;
                this.deferredPrompt = null;
            }
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
