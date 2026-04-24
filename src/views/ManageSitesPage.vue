<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>
                    <span class="bg-gradient-to-br from-neon-blue to-neon-accent bg-clip-text text-transparent font-extrabold text-lg">
                        Neon Curator
                    </span>
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="pb-24">
                <!-- Hero -->
                <div class="px-5 pt-7">
                    <div class="inline-block bg-neon-accent/12 border border-neon-accent/30 rounded-full px-3.5 py-1 text-[10px] font-bold tracking-[1.5px] uppercase text-neon-accent mb-3.5">
                        FASE DE REGISTRO
                    </div>
                    <h1 class="text-[30px] font-black text-neon-text leading-tight m-0 mb-3">
                        Expanda Seus<br />
                        <span class="bg-gradient-to-br from-neon-blue to-neon-accent bg-clip-text text-transparent">Arquivos Digitais</span>
                    </h1>
                    <p class="text-sm text-neon-muted leading-relaxed m-0 mb-6">
                        Integre novas fontes de manga ao seu arquivo de curador.
                    </p>
                </div>

                <div class="px-5">
                    <!-- Form -->
                    <div class="bg-neon-surface border border-neon-border rounded-2xl p-5 mb-4">
                        <div class="mb-4">
                            <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Nome do Site</span>
                            <div class="bg-neon-elevated border border-neon-border rounded-xl transition-colors focus-within:border-neon-accent/30">
                                <input v-model="form.name" placeholder="ex: Manga Vault" class="w-full bg-transparent border-none outline-none text-neon-text text-[15px] px-4 py-[14px] placeholder:text-[#4a5568] box-border" />
                            </div>
                        </div>
                        <div class="mb-4">
                            <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">URL do Site</span>
                            <div class="bg-neon-elevated border border-neon-border rounded-xl transition-colors focus-within:border-neon-accent/30">
                                <input v-model="form.url" placeholder="https://mangavault.com" type="url" class="w-full bg-transparent border-none outline-none text-neon-text text-[15px] px-4 py-[14px] placeholder:text-[#4a5568] box-border" />
                            </div>
                        </div>
                        <ion-button expand="block" class="btn-primary mb-2.5" :disabled="saving || !canSubmit" @click="editingId ? updateSite() : addSite()">
                            <ion-spinner v-if="saving" name="crescent" />
                            <span v-else>{{ editingId ? 'Atualizar Fonte' : 'Adicionar Fonte' }}</span>
                        </ion-button>
                        <ion-button v-if="editingId" expand="block" class="btn-cancel mb-2.5" @click="cancelEdit">Cancelar</ion-button>
                        <p class="text-[11px] text-[#4a5568] text-center mt-2 mb-0 leading-relaxed">
                            Ao adicionar uma fonte, você confirma que a URL aponta para um arquivo web válido.
                        </p>
                    </div>

                    <!-- Trust badges -->
                    <div class="grid grid-cols-2 gap-2.5 mb-7">
                        <div class="bg-neon-surface border border-neon-border rounded-[14px] p-3.5 flex items-center gap-3">
                            <div class="w-9 h-9 rounded-[10px] bg-neon-accent/12 text-neon-accent flex items-center justify-center text-xl flex-shrink-0">
                                <ion-icon :icon="shieldCheckmarkOutline" />
                            </div>
                            <div class="flex flex-col min-w-0">
                                <span class="text-[9px] font-bold tracking-[1px] text-neon-muted uppercase">SEGURANÇA</span>
                                <span class="text-[13px] font-bold text-neon-text">SSL Verificado</span>
                            </div>
                        </div>
                        <div class="bg-neon-surface border border-neon-border rounded-[14px] p-3.5 flex items-center gap-3">
                            <div class="w-9 h-9 rounded-[10px] bg-neon-blue/12 text-[#7b8ff5] flex items-center justify-center text-xl flex-shrink-0">
                                <ion-icon :icon="serverOutline" />
                            </div>
                            <div class="flex flex-col min-w-0">
                                <span class="text-[9px] font-bold tracking-[1px] text-neon-muted uppercase">ARMAZENAMENTO</span>
                                <span class="text-[13px] font-bold text-neon-text">Sync em Nuvem</span>
                            </div>
                        </div>
                    </div>

                    <!-- Sites list -->
                    <div class="flex items-center gap-2.5 mb-3.5">
                        <h2 class="text-lg font-extrabold text-neon-text m-0">Fontes Cadastradas</h2>
                        <span v-if="sites.length" class="bg-neon-accent/12 border border-neon-accent/20 text-neon-accent rounded-full px-2.5 py-0.5 text-xs font-bold">{{ sites.length }}</span>
                    </div>

                    <div v-if="loading" class="flex justify-center py-8">
                        <ion-spinner name="crescent" color="primary" />
                    </div>

                    <div v-else-if="sites.length === 0" class="text-center py-8">
                        <ion-icon :icon="cloudDownloadOutline" class="text-[40px] text-neon-muted block mb-2.5" />
                        <p class="text-sm text-neon-muted m-0">Nenhuma fonte cadastrada ainda.</p>
                    </div>

                    <div v-else>
                        <div v-for="site in sites" :key="site.id" class="flex items-center justify-between bg-neon-surface border border-neon-border rounded-[14px] p-3.5 mb-2.5">
                            <div class="flex items-center gap-3 min-w-0 flex-1">
                                <div class="w-9 h-9 rounded-[10px] bg-neon-elevated border border-neon-border flex items-center justify-center text-neon-accent text-lg flex-shrink-0">
                                    <ion-icon :icon="globeOutline" />
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <span class="text-sm font-bold text-neon-text truncate">{{ site.name }}</span>
                                    <span class="text-xs text-neon-muted truncate">{{ site.url }}</span>
                                </div>
                            </div>
                            <div class="flex gap-2 flex-shrink-0 ml-2">
                                <button class="w-[34px] h-[34px] rounded-[10px] bg-neon-elevated border border-neon-border flex items-center justify-center text-base text-[#7b8ff5] cursor-pointer" @click="startEdit(site)">
                                    <ion-icon :icon="pencilOutline" />
                                </button>
                                <button class="w-[34px] h-[34px] rounded-[10px] bg-neon-elevated border border-neon-border flex items-center justify-center text-base text-neon-danger cursor-pointer" @click="confirmDelete(site)">
                                    <ion-icon :icon="trashOutline" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonIcon, IonSpinner, toastController, alertController,
} from '@ionic/vue';
import { shieldCheckmarkOutline, serverOutline, cloudDownloadOutline, globeOutline, pencilOutline, trashOutline } from 'ionicons/icons';
import { siteService, Site } from '@/services/siteService';

export default defineComponent({
    name: 'ManageSitesPage',
    components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonSpinner },
    data() {
        return {
            loading: false,
            saving: false,
            sites: [] as Site[],
            editingId: null as number | null,
            form: { name: '', url: '' },
            shieldCheckmarkOutline, serverOutline, cloudDownloadOutline, globeOutline, pencilOutline, trashOutline,
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
                message: `Remover "${site.name}" do arquivo?`,
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
.btn-primary { --background: var(--neon-accent); --color: #000; --border-radius: 14px; font-weight: 700; height: 52px; }
.btn-cancel { --background: var(--neon-surface-elevated); --color: #e8eaf0; --border-radius: 14px; height: 44px; }
</style>
