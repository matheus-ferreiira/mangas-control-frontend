<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div style="padding: 0 16px 96px; padding-top: max(16px, env(safe-area-inset-top, 16px));">
                <!-- Header -->
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 20px; font-weight: 800; color: #eef2ff; letter-spacing: -0.02em; margin-bottom: 2px;">Minhas Fontes</div>
                    <div style="font-size: 12px; color: #4a5470;">Sites onde você acompanha seus conteúdos</div>
                </div>

                <!-- Add button -->
                <button
                    style="width: 100%; padding: 14px; border-radius: 14px; border: 1.5px dashed #1e2640; background: transparent; color: #00d4aa; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; transition: all 0.15s;"
                    @click="openForm(null)"
                >
                    <span style="font-size: 18px;">+</span> Nova Fonte
                </button>

                <!-- Loading -->
                <div v-if="loading" style="display: flex; justify-content: center; padding: 48px 0;">
                    <IonSpinner name="crescent" color="primary" />
                </div>

                <!-- Empty -->
                <div v-else-if="sites.length === 0" style="text-align: center; padding: 48px 0;">
                    <div style="font-size: 40px; margin-bottom: 12px; opacity: 0.5;">🌐</div>
                    <div style="font-size: 15px; font-weight: 700; color: #7a87a8; margin-bottom: 6px;">Nenhuma fonte ainda</div>
                    <div style="font-size: 12px; color: #4a5470;">Adicione sites onde você lê seus conteúdos</div>
                </div>

                <!-- Sites list -->
                <div v-else>
                    <!-- Favorites first -->
                    <div v-if="favoriteSites.length" style="margin-bottom: 6px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #f59e0b; text-transform: uppercase; margin-bottom: 8px;">⭐ Favoritas</div>
                        <div
                            v-for="site in favoriteSites"
                            :key="site.id"
                            :style="siteCardStyle(site)"
                        >
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(245,158,11,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <span style="font-size: 18px;">⭐</span>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 14px; font-weight: 700; color: #eef2ff;">{{ site.name }}</div>
                                <div style="font-size: 11px; color: #4a5470; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ site.url }}</div>
                            </div>
                            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                                <button :style="actionBtnStyle('#f59e0b')" title="Remover dos favoritos" @click="toggleFavorite(site)">★</button>
                                <button :style="actionBtnStyle('#8b5cf6')" @click="openForm(site)">✏</button>
                                <button :style="actionBtnStyle('#ef4444', true)" @click="confirmDelete(site)">✕</button>
                            </div>
                        </div>
                    </div>

                    <div v-if="regularSites.length">
                        <div v-if="favoriteSites.length" style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px; margin-top: 16px;">Outras</div>
                        <div
                            v-for="site in regularSites"
                            :key="site.id"
                            :style="siteCardStyle(site)"
                        >
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(0,212,170,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #4a5470; font-size: 18px;">
                                🌐
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 14px; font-weight: 700; color: #eef2ff;">{{ site.name }}</div>
                                <div style="font-size: 11px; color: #4a5470; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ site.url }}</div>
                            </div>
                            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                                <button :style="actionBtnStyle('#4a5470')" title="Marcar como favorito" @click="toggleFavorite(site)">☆</button>
                                <button :style="actionBtnStyle('#8b5cf6')" @click="openForm(site)">✏</button>
                                <button :style="actionBtnStyle('#ef4444', true)" @click="confirmDelete(site)">✕</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </IonContent>

        <!-- Form Modal -->
        <IonModal
            :is-open="isFormOpen"
            :initial-breakpoint="0.7"
            :breakpoints="[0, 0.7, 1]"
            :handle="true"
            class="site-form-modal"
            @didDismiss="closeForm"
        >
            <IonContent class="site-form-content">
                <div style="padding: 12px 20px 40px;">
                    <div style="font-size: 17px; font-weight: 800; color: #eef2ff; margin-bottom: 20px; letter-spacing: -0.02em;">
                        {{ editingId ? 'Editar Fonte' : 'Nova Fonte' }}
                    </div>

                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">Nome</div>
                        <IonInput
                            v-model="form.name"
                            placeholder="ex: MangaDex, Crunchyroll..."
                            fill="outline"
                            class="neon-input"
                        />
                    </div>

                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">URL</div>
                        <IonInput
                            v-model="form.url"
                            placeholder="https://..."
                            type="url"
                            inputmode="url"
                            fill="outline"
                            class="neon-input"
                        />
                        <div v-if="urlError" style="font-size: 11px; color: #ef4444; margin-top: 4px;">{{ urlError }}</div>
                    </div>

                    <!-- Favorite toggle -->
                    <div
                        style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 14px; background: #1a2035; border: 1px solid #1e2640; cursor: pointer; margin-bottom: 20px;"
                        @click="form.is_favorite = !form.is_favorite"
                    >
                        <div>
                            <div style="font-size: 13px; font-weight: 700; color: #eef2ff;">⭐ Fonte favorita</div>
                            <div style="font-size: 11px; color: #4a5470; margin-top: 2px;">Aparece primeiro na lista</div>
                        </div>
                        <div :style="toggleTrackStyle(form.is_favorite)">
                            <div :style="toggleKnobStyle(form.is_favorite)"></div>
                        </div>
                    </div>

                    <IonButton expand="block" class="btn-primary" :disabled="saving || !canSubmit" @click="saveSite">
                        <IonSpinner v-if="saving" name="crescent" />
                        <span v-else>{{ editingId ? 'Salvar alterações' : 'Adicionar Fonte' }}</span>
                    </IonButton>

                    <IonButton v-if="editingId" expand="block" class="btn-cancel" style="margin-top: 8px;" @click="closeForm">
                        Cancelar
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent, IonSpinner, IonButton, IonInput, IonModal,
    toastController, alertController,
} from '@ionic/vue';
import { userSiteService, UserSite } from '@/services/userSiteService';

export default defineComponent({
    name: 'ManageSitesPage',
    components: { IonPage, IonContent, IonSpinner, IonButton, IonInput, IonModal },
    data() {
        return {
            loading: false,
            saving: false,
            sites: [] as UserSite[],
            isFormOpen: false,
            editingId: null as number | null,
            form: { name: '', url: '', is_favorite: false },
        };
    },
    computed: {
        canSubmit(): boolean {
            return !!(this.form.name.trim() && this.form.url.trim());
        },
        urlError(): string {
            if (!this.form.url.trim()) return '';
            try { new URL(this.form.url); return ''; }
            catch { return 'URL inválida. Use o formato https://site.com'; }
        },
        favoriteSites(): UserSite[] { return this.sites.filter((s) => s.is_favorite); },
        regularSites(): UserSite[] { return this.sites.filter((s) => !s.is_favorite); },
    },
    async ionViewWillEnter() {
        await this.loadSites();
    },
    methods: {
        async loadSites() {
            this.loading = true;
            try { this.sites = await userSiteService.getAll(); }
            catch { /* non-blocking */ }
            finally { this.loading = false; }
        },

        openForm(site: UserSite | null) {
            if (site) {
                this.editingId = site.id;
                this.form = { name: site.name, url: site.url, is_favorite: site.is_favorite };
            } else {
                this.editingId = null;
                this.form = { name: '', url: '', is_favorite: false };
            }
            this.isFormOpen = true;
        },

        closeForm() {
            this.isFormOpen = false;
            this.editingId = null;
            this.form = { name: '', url: '', is_favorite: false };
        },

        async saveSite() {
            if (!this.canSubmit || this.urlError) return;
            this.saving = true;
            try {
                if (this.editingId) {
                    const updated = await userSiteService.update(this.editingId, this.form);
                    const idx = this.sites.findIndex((s) => s.id === this.editingId);
                    if (idx !== -1) this.sites[idx] = updated;
                    this.sites = [...this.sites].sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
                    await this.toast('Fonte atualizada!', 'success');
                } else {
                    const site = await userSiteService.create(this.form);
                    this.sites = [...this.sites, site].sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
                    await this.toast('Fonte adicionada!', 'success');
                }
                this.closeForm();
            } catch { await this.toast('Falha ao salvar fonte.', 'danger'); }
            finally { this.saving = false; }
        },

        async toggleFavorite(site: UserSite) {
            try {
                const updated = await userSiteService.toggleFavorite(site);
                const idx = this.sites.findIndex((s) => s.id === site.id);
                if (idx !== -1) this.sites[idx] = updated;
                this.sites = [...this.sites].sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
            } catch { await this.toast('Falha ao atualizar favorito.', 'danger'); }
        },

        async confirmDelete(site: UserSite) {
            const alert = await alertController.create({
                header: 'Remover Fonte',
                message: `Remover "${site.name}" da lista?`,
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Remover', role: 'destructive', handler: () => this.deleteSite(site.id) },
                ],
            });
            await alert.present();
        },

        async deleteSite(id: number) {
            try {
                await userSiteService.delete(id);
                this.sites = this.sites.filter((s) => s.id !== id);
                await this.toast('Fonte removida.', 'success');
            } catch { await this.toast('Falha ao remover.', 'danger'); }
        },

        async toast(message: string, color: string) {
            const t = await toastController.create({ message, duration: 2000, color, position: 'top' });
            await t.present();
        },

        siteCardStyle(site: UserSite): Record<string, string> {
            return {
                display: 'flex', alignItems: 'center', gap: '12px',
                background: '#1a2035',
                border: `1px solid ${site.is_favorite ? 'rgba(245,158,11,0.3)' : '#1e2640'}`,
                borderRadius: '14px', padding: '12px 14px', marginBottom: '8px',
                transition: 'all 0.15s',
            };
        },

        actionBtnStyle(color: string, muted = false): Record<string, string> {
            return {
                width: '30px', height: '30px', borderRadius: '8px',
                border: `1px solid ${muted ? 'rgba(239,68,68,0.25)' : '#1e2640'}`,
                background: 'transparent', color,
                cursor: 'pointer', fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: '0',
            };
        },

        toggleTrackStyle(active: boolean): Record<string, string> {
            return {
                width: '44px', height: '26px', borderRadius: '13px', position: 'relative', flexShrink: '0',
                background: active ? '#f59e0b' : '#1e2640', transition: 'background 0.2s',
            };
        },

        toggleKnobStyle(active: boolean): Record<string, string> {
            return {
                position: 'absolute', top: '3px', borderRadius: '10px',
                left: active ? '21px' : '3px', width: '20px', height: '20px',
                background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            };
        },
    },
});
</script>

<style scoped>
.btn-primary { --background: #00d4aa; --color: #000; --border-radius: 14px; font-weight: 800; height: 50px; }
.btn-cancel { --background: #1a2035; --color: #8892aa; --border-radius: 14px; height: 46px; }

.neon-input {
    --background: #1a2035;
    --color: #eef2ff;
    --placeholder-color: #4a5570;
    --border-color: #1e2640;
    --border-radius: 12px;
    --highlight-color-focused: #00d4aa;
    --padding-start: 14px;
    --padding-end: 14px;
    min-height: 48px;
    width: 100%;
}
</style>

<style>
ion-modal.site-form-modal::part(content) { background: #0b0f1a; border-top: 1px solid #1e2640; }
.site-form-content { --background: #0b0f1a; }
</style>
