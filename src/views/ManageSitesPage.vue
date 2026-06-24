<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div style="padding: 0 16px 96px; padding-top: max(16px, env(safe-area-inset-top, 16px));">
                <!-- Header -->
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 20px; font-weight: 800; color: #e9edf2; letter-spacing: -0.02em; margin-bottom: 2px; font-family: 'Sora', system-ui, sans-serif;">Minhas Fontes</div>
                    <div style="font-size: 12px; color: rgba(233,237,242,0.42);">Sites onde você acompanha seus conteúdos</div>
                </div>

                <!-- Add button -->
                <button
                    style="width: 100%; padding: 14px; border-radius: 14px; border: 1.5px dashed rgba(255,255,255,0.08); background: transparent; color: #f5a623; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; transition: all 0.15s;"
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
                    <div style="font-size: 15px; font-weight: 700; color: rgba(233,237,242,0.62); margin-bottom: 6px;">Nenhuma fonte ainda</div>
                    <div style="font-size: 12px; color: rgba(233,237,242,0.42);">Adicione sites onde você lê seus conteúdos</div>
                </div>

                <!-- Sites list -->
                <div v-else>
                    <!-- Favorites first -->
                    <div v-if="favoriteSites.length" style="margin-bottom: 6px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; color: #e6b85c; text-transform: uppercase; margin-bottom: 8px;">⭐ Favoritas</div>
                        <div
                            v-for="site in favoriteSites"
                            :key="site.id"
                            :style="siteCardStyle(site)"
                        >
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(245,158,11,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;">
                                <img v-if="site.logo_url" :src="site.logo_url" style="width: 100%; height: 100%; object-fit: contain;" />
                                <span v-else style="font-size: 18px;">⭐</span>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 14px; font-weight: 700; color: #e9edf2;">{{ site.name }}</div>
                                <div style="font-size: 11px; color: rgba(233,237,242,0.42); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ site.url || (site.type === 'app' ? 'Aplicativo' : 'Site') }}</div>
                            </div>
                            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                                <button :style="actionBtnStyle('#e6b85c')" title="Remover dos favoritos" @click="toggleFavorite(site)">★</button>
                                <button :style="actionBtnStyle('#a78bfa')" @click="openForm(site)">✏</button>
                                <button :style="actionBtnStyle('#ef6b6b', true)" @click="confirmDelete(site)">✕</button>
                            </div>
                        </div>
                    </div>

                    <div v-if="regularSites.length">
                        <div v-if="favoriteSites.length" style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; color: rgba(233,237,242,0.42); text-transform: uppercase; margin-bottom: 8px; margin-top: 16px;">Outras</div>
                        <div
                            v-for="site in regularSites"
                            :key="site.id"
                            :style="siteCardStyle(site)"
                        >
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(245,166,35,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: rgba(233,237,242,0.42); font-size: 18px; overflow: hidden;">
                                <img v-if="site.logo_url" :src="site.logo_url" style="width: 100%; height: 100%; object-fit: contain;" />
                                <span v-else>{{ site.type === 'app' ? '📱' : '🌐' }}</span>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 14px; font-weight: 700; color: #e9edf2;">{{ site.name }}</div>
                                <div style="font-size: 11px; color: rgba(233,237,242,0.42); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ site.url || (site.type === 'app' ? 'Aplicativo' : 'Site') }}</div>
                            </div>
                            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                                <button :style="actionBtnStyle('rgba(233,237,242,0.42)')" title="Marcar como favorito" @click="toggleFavorite(site)">☆</button>
                                <button :style="actionBtnStyle('#a78bfa')" @click="openForm(site)">✏</button>
                                <button :style="actionBtnStyle('#ef6b6b', true)" @click="confirmDelete(site)">✕</button>
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
                    <div style="font-size: 17px; font-weight: 800; color: #e9edf2; margin-bottom: 20px; letter-spacing: -0.02em; font-family: 'Sora', system-ui, sans-serif;">
                        {{ editingId ? 'Editar Fonte' : 'Nova Fonte' }}
                    </div>

                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; color: rgba(233,237,242,0.42); text-transform: uppercase; margin-bottom: 8px;">Nome</div>
                        <IonInput
                            v-model="form.name"
                            placeholder="ex: MangaDex, Crunchyroll..."
                            fill="outline"
                            class="neon-input"
                        />
                    </div>

                    <!-- Tipo -->
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; color: rgba(233,237,242,0.42); text-transform: uppercase; margin-bottom: 8px;">Tipo</div>
                        <div style="display: flex; gap: 8px;">
                            <button :style="typeBtnStyle('website')" @click="form.type = 'website'">🌐 Site</button>
                            <button :style="typeBtnStyle('app')" @click="form.type = 'app'">📱 Aplicativo</button>
                        </div>
                    </div>

                    <!-- URL (opcional) -->
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; color: rgba(233,237,242,0.42); text-transform: uppercase; margin-bottom: 8px;">
                            URL <span style="font-weight: 600; color: rgba(233,237,242,0.28); text-transform: none; letter-spacing: 0;">(opcional)</span>
                        </div>
                        <IonInput
                            v-model="form.url"
                            placeholder="https://..."
                            type="url"
                            inputmode="url"
                            fill="outline"
                            class="neon-input"
                        />
                        <div v-if="urlError" style="font-size: 11px; color: #ef6b6b; margin-top: 4px;">{{ urlError }}</div>
                    </div>

                    <!-- Logo (opcional): upload ou colar URL -->
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; color: rgba(233,237,242,0.42); text-transform: uppercase; margin-bottom: 8px;">
                            Logo <span style="font-weight: 600; color: rgba(233,237,242,0.28); text-transform: none; letter-spacing: 0;">(opcional)</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                <img v-if="form.logo_url" :src="form.logo_url" style="width: 100%; height: 100%; object-fit: contain;" />
                                <span v-else style="font-size: 15px; opacity: 0.4;">🖼️</span>
                            </div>
                            <IonInput
                                v-model="form.logo_url"
                                placeholder="Cole a URL ou envie um arquivo"
                                fill="outline"
                                class="neon-input"
                                style="flex: 1;"
                            />
                            <button
                                :disabled="uploadingLogo"
                                style="height: 48px; min-width: 64px; padding: 0 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025); color: #f5a623; font-size: 12px; font-weight: 700; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center;"
                                @click="triggerLogoUpload"
                            >
                                <IonSpinner v-if="uploadingLogo" name="crescent" style="width: 18px; height: 18px;" />
                                <span v-else>Enviar</span>
                            </button>
                        </div>
                        <input ref="logoInput" type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" style="display: none;" @change="onLogoFile" />
                    </div>

                    <!-- Favorite toggle -->
                    <div
                        style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 14px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); cursor: pointer; margin-bottom: 20px;"
                        @click="form.is_favorite = !form.is_favorite"
                    >
                        <div>
                            <div style="font-size: 13px; font-weight: 700; color: #e9edf2;">⭐ Fonte favorita</div>
                            <div style="font-size: 11px; color: rgba(233,237,242,0.42); margin-top: 2px;">Aparece primeiro na lista</div>
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
            uploadingLogo: false,
            sites: [] as UserSite[],
            isFormOpen: false,
            editingId: null as number | null,
            form: { name: '', url: '', logo_url: '', type: 'website' as 'website' | 'app', is_favorite: false },
        };
    },
    computed: {
        canSubmit(): boolean {
            // URL é opcional (apps não têm URL). Só o nome é obrigatório.
            return !!this.form.name.trim() && !this.urlError;
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
                this.form = {
                    name: site.name,
                    url: site.url ?? '',
                    logo_url: site.logo_url ?? '',
                    type: site.type ?? 'website',
                    is_favorite: site.is_favorite,
                };
            } else {
                this.editingId = null;
                this.form = { name: '', url: '', logo_url: '', type: 'website', is_favorite: false };
            }
            this.isFormOpen = true;
        },

        closeForm() {
            this.isFormOpen = false;
            this.editingId = null;
            this.form = { name: '', url: '', logo_url: '', type: 'website', is_favorite: false };
        },

        async saveSite() {
            if (!this.canSubmit || this.urlError) return;
            this.saving = true;
            const payload = {
                name: this.form.name.trim(),
                url: this.form.url.trim() || null,
                logo_url: this.form.logo_url.trim() || null,
                type: this.form.type,
                is_favorite: this.form.is_favorite,
            };
            try {
                if (this.editingId) {
                    const updated = await userSiteService.update(this.editingId, payload);
                    const idx = this.sites.findIndex((s) => s.id === this.editingId);
                    if (idx !== -1) this.sites[idx] = updated;
                    this.sites = [...this.sites].sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
                    await this.toast('Fonte atualizada!', 'success');
                } else {
                    const site = await userSiteService.create(payload);
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

        triggerLogoUpload() {
            (this.$refs.logoInput as HTMLInputElement | undefined)?.click();
        },

        async onLogoFile(event: Event) {
            const input = event.target as HTMLInputElement;
            const file = input.files?.[0];
            input.value = ''; // permite reenviar o mesmo arquivo
            if (!file) return;

            if (file.size > 500 * 1024) {
                await this.toast('A logo deve ter no máximo 500KB.', 'danger');
                return;
            }

            this.uploadingLogo = true;
            try {
                this.form.logo_url = await userSiteService.uploadLogo(file);
            } catch {
                await this.toast('Falha ao enviar a logo.', 'danger');
            } finally {
                this.uploadingLogo = false;
            }
        },

        typeBtnStyle(t: 'website' | 'app'): Record<string, string> {
            const active = this.form.type === t;
            return {
                flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                height: '42px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                border: `1px solid ${active ? 'rgba(245,166,35,0.66)' : 'rgba(255,255,255,0.06)'}`,
                background: active ? 'rgba(245,166,35,0.10)' : 'rgba(255,255,255,0.025)',
                color: active ? '#f5a623' : 'rgba(233,237,242,0.62)',
                transition: 'all 0.15s',
            };
        },

        siteCardStyle(site: UserSite): Record<string, string> {
            return {
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid ${site.is_favorite ? 'rgba(230,184,92,0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '14px', padding: '12px 14px', marginBottom: '8px',
                transition: 'all 0.15s',
            };
        },

        actionBtnStyle(color: string, muted = false): Record<string, string> {
            return {
                width: '30px', height: '30px', borderRadius: '8px',
                border: `1px solid ${muted ? 'rgba(239,107,107,0.25)' : 'rgba(255,255,255,0.06)'}`,
                background: 'transparent', color,
                cursor: 'pointer', fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: '0',
            };
        },

        toggleTrackStyle(active: boolean): Record<string, string> {
            return {
                width: '44px', height: '26px', borderRadius: '13px', position: 'relative', flexShrink: '0',
                background: active ? '#e6b85c' : 'rgba(255,255,255,0.06)', transition: 'background 0.2s',
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
.btn-primary { --background: #f5a623; --color: #050608; --border-radius: 14px; font-weight: 800; height: 50px; }
.btn-cancel { --background: rgba(255,255,255,0.04); --color: rgba(233,237,242,0.42); --border-radius: 14px; height: 46px; }

.neon-input {
    --background: rgba(255,255,255,0.025);
    --color: #e9edf2;
    --placeholder-color: rgba(233,237,242,0.28);
    --border-color: rgba(255,255,255,0.06);
    --border-radius: 12px;
    --highlight-color-focused: #f5a623;
    --padding-start: 14px;
    --padding-end: 14px;
    min-height: 48px;
    width: 100%;
}
</style>

<style>
ion-modal.site-form-modal::part(content) { background: #080a10; border-top: 1px solid rgba(255,255,255,0.06); }
.site-form-content { --background: #080a10; }
</style>
