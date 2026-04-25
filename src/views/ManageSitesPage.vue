<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="pb-24">
                <div class="px-4 pb-3 page-top">
                    <div class="text-[20px] font-extrabold text-neon-text tracking-[-0.02em] mb-1">Fontes</div>
                    <div class="text-[12px] text-neon-muted">Sites onde você lê seus conteúdos</div>
                </div>

                <div class="px-4">
                    <!-- Add form -->
                    <div class="bg-neon-surface border border-neon-border rounded-xl p-3.5 mb-5">
                        <div class="text-[13px] font-bold text-neon-text mb-3">Nova Fonte</div>

                        <div class="mb-2.5">
                            <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-1.5">Nome do site</div>
                            <IonInput
                                v-model="form.name"
                                placeholder="ex: Manga Vault"
                                fill="outline"
                                class="neon-input"
                            />
                        </div>
                        <div class="mb-3">
                            <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-1.5">URL do site</div>
                            <IonInput
                                v-model="form.url"
                                placeholder="https://.."
                                type="url"
                                inputmode="url"
                                fill="outline"
                                class="neon-input"
                            />
                        </div>

                        <IonButton expand="block" class="btn-primary mb-2" :disabled="saving || !canSubmit" @click="editingId ? updateSite() : addSite()">
                            <IonSpinner v-if="saving" name="crescent" />
                            <span v-else>{{ editingId ? 'Atualizar Fonte' : 'Adicionar Fonte' }}</span>
                        </IonButton>
                        <IonButton v-if="editingId" expand="block" class="btn-cancel" @click="cancelEdit">Cancelar</IonButton>

                        <div class="text-center mt-2 text-[10px] text-neon-muted">
                            🔒 SSL verificado · ☁️ Sync em nuvem
                        </div>
                    </div>

                    <!-- Sites list -->
                    <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-2.5">
                        Fontes Cadastradas · {{ sites.length }}
                    </div>

                    <div v-if="loading" class="flex justify-center py-8">
                        <IonSpinner name="crescent" color="primary" />
                    </div>

                    <div v-else-if="sites.length === 0" class="text-center py-8">
                        <IonIcon :icon="cloudDownloadOutline" class="text-[40px] text-neon-muted block mb-2.5" />
                        <p class="text-sm text-neon-muted m-0">Nenhuma fonte cadastrada ainda.</p>
                    </div>

                    <div v-else>
                        <div
                            v-for="site in sites"
                            :key="site.id"
                            class="flex items-center gap-3 bg-neon-card border border-neon-border rounded-[10px] p-3 mb-2"
                        >
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background: rgba(0,212,170,0.12); color: #00d4aa">
                                <IonIcon :icon="globeOutline" class="text-base" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="text-[13px] font-bold text-neon-text">{{ site.name }}</div>
                                <div class="text-[11px] text-neon-muted truncate">{{ site.url }}</div>
                            </div>
                            <div class="flex gap-1.5 flex-shrink-0">
                                <button
                                    class="w-7 h-7 rounded-md border border-neon-border bg-transparent flex items-center justify-center text-sm cursor-pointer"
                                    style="color: #8b5cf6"
                                    @click="startEdit(site)"
                                >
                                    <IonIcon :icon="pencilOutline" />
                                </button>
                                <button
                                    class="w-7 h-7 rounded-md bg-transparent flex items-center justify-center text-sm cursor-pointer"
                                    style="border: 1px solid rgba(239,68,68,0.3); color: #ef4444"
                                    @click="confirmDelete(site)"
                                >
                                    <IonIcon :icon="trashOutline" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent,
    IonButton, IonIcon, IonSpinner, IonInput, toastController, alertController,
} from '@ionic/vue';
import { cloudDownloadOutline, globeOutline, pencilOutline, trashOutline } from 'ionicons/icons';
import { siteService, Site } from '@/services/siteService';

export default defineComponent({
    name: 'ManageSitesPage',
    components: { IonPage, IonContent, IonButton, IonIcon, IonSpinner, IonInput },
    data() {
        return {
            loading: false,
            saving: false,
            sites: [] as Site[],
            editingId: null as number | null,
            form: { name: '', url: '' },
            cloudDownloadOutline, globeOutline, pencilOutline, trashOutline,
        };
    },
    computed: {
        canSubmit(): boolean { return !!(this.form.name.trim() && this.form.url.trim()); },
    },
    async ionViewWillEnter() {
        await this.loadSites();
    },
    methods: {
        async loadSites() {
            this.loading = true;
            try {
                const result = await siteService.getAll();
                this.sites = Array.isArray(result) ? result : (result as any)?.data ?? [];
            } catch {
                // non-blocking
            } finally {
                this.loading = false;
            }
        },
        async addSite() {
            if (!this.canSubmit) return;
            this.saving = true;
            try {
                const site = await siteService.create({ name: this.form.name.trim(), url: this.form.url.trim() });
                this.sites.push(site);
                this.form = { name: '', url: '' };
                await this.showToast('Fonte adicionada!', 'success');
            } catch {
                await this.showToast('Falha ao adicionar fonte.', 'danger');
            } finally {
                this.saving = false;
            }
        },
        startEdit(site: Site) {
            this.editingId = site.id;
            this.form = { name: site.name, url: site.url };
        },
        cancelEdit() {
            this.editingId = null;
            this.form = { name: '', url: '' };
        },
        async updateSite() {
            if (!this.editingId || !this.canSubmit) return;
            this.saving = true;
            try {
                const updated = await siteService.update(this.editingId, { name: this.form.name.trim(), url: this.form.url.trim() });
                const idx = this.sites.findIndex((s) => s.id === this.editingId);
                if (idx !== -1) this.sites[idx] = updated;
                this.cancelEdit();
                await this.showToast('Fonte atualizada!', 'success');
            } catch {
                await this.showToast('Falha ao atualizar fonte.', 'danger');
            } finally {
                this.saving = false;
            }
        },
        async confirmDelete(site: Site) {
            const alert = await alertController.create({
                header: 'Remover Fonte',
                message: `Remover "${site.name}"?`,
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Remover', role: 'destructive', handler: () => this.deleteSite(site.id) },
                ],
            });
            await alert.present();
        },
        async deleteSite(id: number) {
            try {
                await siteService.delete(id);
                this.sites = this.sites.filter((s) => s.id !== id);
                await this.showToast('Fonte removida.', 'success');
            } catch {
                await this.showToast('Falha ao remover fonte.', 'danger');
            }
        },
        async showToast(message: string, color: string) {
            const toast = await toastController.create({ message, duration: 2000, color, position: 'top' });
            await toast.present();
        },
    },
});
</script>

<style scoped>
.btn-primary { --background: var(--neon-accent); --color: #000; --border-radius: 12px; font-weight: 700; height: 48px; }
.btn-cancel { --background: #1a2035; --color: #f0f4ff; --border-radius: 12px; height: 44px; }

.neon-input {
    --background: #1a2035;
    --color: #f0f4ff;
    --placeholder-color: #4a5570;
    --border-color: #222840;
    --border-radius: 10px;
    --highlight-color-focused: #00d4aa;
    --padding-start: 14px;
    --padding-end: 14px;
    min-height: 48px;
    width: 100%;
}
</style>
