<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/tabs/library" text="" />
                </ion-buttons>
                <ion-title>Detalhes</ion-title>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="confirmDelete">
                        <ion-icon slot="icon-only" :icon="trashOutline" color="danger" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div v-if="loading" class="flex justify-center py-20">
                <ion-spinner name="crescent" color="primary" />
            </div>

            <div v-else-if="item">
                <!-- Hero -->
                <div class="relative w-full h-[280px]">
                    <img v-if="item.manga?.cover" :src="item.manga.cover" class="w-full h-full object-cover" alt="Capa" />
                    <div v-else class="w-full h-full bg-gradient-to-br from-[#0d1a2d] to-[#1a0d2e] flex items-center justify-center text-[80px] text-[#2a3550]">
                        <ion-icon :icon="bookOutline" />
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 px-5 pb-5 bg-gradient-to-t from-[rgba(10,14,26,1)] to-transparent">
                        <status-badge :status="item.status" />
                        <h1 class="text-2xl font-extrabold text-neon-text mt-2 mb-0 leading-tight">{{ item.manga?.name }}</h1>
                    </div>
                </div>

                <div class="px-5 pt-5 pb-24">
                    <!-- Stats -->
                    <div class="flex items-center bg-neon-surface border border-neon-border rounded-2xl p-4 mb-6">
                        <div class="flex-1 flex flex-col items-center gap-1">
                            <span class="text-[11px] font-bold uppercase tracking-[1px] text-neon-muted">Atual</span>
                            <span class="text-[15px] font-bold text-neon-text">Cap. {{ item.current_chapters }}</span>
                        </div>
                        <div class="w-px h-8 bg-neon-border"></div>
                        <div class="flex-1 flex flex-col items-center gap-1">
                            <span class="text-[11px] font-bold uppercase tracking-[1px] text-neon-muted">Total</span>
                            <span class="text-[15px] font-bold text-neon-text">
                                {{ item.manga?.total_chapters ? `Cap. ${item.manga.total_chapters}` : '—' }}
                            </span>
                        </div>
                        <div class="w-px h-8 bg-neon-border"></div>
                        <div class="flex-1 flex flex-col items-center gap-1 min-w-0 px-1">
                            <span class="text-[11px] font-bold uppercase tracking-[1px] text-neon-muted">Fonte</span>
                            <span class="text-[15px] font-bold text-neon-text truncate max-w-[80px] text-center">{{ item.site?.name || '—' }}</span>
                        </div>
                    </div>

                    <!-- Chapter controls -->
                    <div class="mb-6">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-3">Progresso do Capítulo</span>
                        <div class="flex items-center gap-4 bg-neon-surface border border-neon-border rounded-2xl p-4">
                            <button
                                class="w-12 h-12 rounded-xl bg-neon-elevated border border-neon-border text-neon-text text-[22px] flex items-center justify-center cursor-pointer transition-colors active:bg-[#212b45] disabled:opacity-40"
                                @click="decrement"
                                :disabled="saving || item.current_chapters <= 0"
                            >
                                <ion-icon :icon="removeOutline" />
                            </button>
                            <div class="flex-1 flex flex-col items-center">
                                <input
                                    v-if="editingChapter"
                                    v-model.number="chapterInput"
                                    type="number"
                                    class="text-[36px] font-extrabold text-neon-text bg-transparent border-b-2 border-neon-accent outline-none w-20 text-center leading-none"
                                    @blur="saveChapter"
                                    @keyup.enter="saveChapter"
                                    ref="chapterField"
                                    min="0"
                                />
                                <span
                                    v-else
                                    class="text-[36px] font-extrabold text-neon-text cursor-pointer leading-none"
                                    @click="startEditChapter"
                                >
                                    {{ item.current_chapters }}
                                </span>
                                <span class="text-[11px] text-neon-muted mt-1">Toque para editar</span>
                            </div>
                            <button
                                class="w-12 h-12 rounded-xl bg-neon-accent/12 border border-neon-accent/30 text-neon-accent text-[22px] flex items-center justify-center cursor-pointer transition-colors active:bg-neon-accent/20 disabled:opacity-40"
                                @click="increment"
                                :disabled="saving"
                            >
                                <ion-icon :icon="addOutline" />
                            </button>
                        </div>
                    </div>

                    <!-- Status -->
                    <div class="mb-6">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-3">Status</span>
                        <div class="grid grid-cols-2 gap-2.5">
                            <button
                                v-for="s in statuses"
                                :key="s.value"
                                class="py-3 rounded-xl bg-neon-surface border border-neon-border text-neon-muted text-[13px] font-semibold cursor-pointer transition-colors text-center"
                                :class="item.status === s.value ? 'bg-neon-accent/12 border-neon-accent/40 text-neon-accent' : ''"
                                @click="changeStatus(s.value)"
                            >
                                {{ s.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Site -->
                    <div class="mb-6" v-if="sites.length">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-3">Fonte de Leitura</span>
                        <div class="bg-neon-elevated border border-neon-border rounded-xl px-4">
                            <select v-model="selectedSiteId" class="w-full bg-transparent border-none outline-none text-neon-text text-[15px] py-3 cursor-pointer" @change="changeSite">
                                <option value="">Sem fonte</option>
                                <option v-for="site in sites" :key="site.id" :value="site.id">{{ site.name }}</option>
                            </select>
                        </div>
                    </div>

                    <!-- Delete -->
                    <ion-button expand="block" fill="outline" color="danger" class="btn-delete" @click="confirmDelete">
                        <ion-icon slot="start" :icon="trashOutline" />
                        Remover da Biblioteca
                    </ion-button>
                </div>
            </div>
        </ion-content>

        <ion-loading :is-open="saving" message="Salvando..." spinner="crescent" />
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonButton, IonIcon, IonSpinner, IonLoading,
    toastController, alertController,
} from '@ionic/vue';
import { bookOutline, addOutline, removeOutline, trashOutline } from 'ionicons/icons';
import { userMangaService, UserManga, MangaStatus, STATUS_LABELS } from '@/services/userMangaService';
import { siteService, Site } from '@/services/siteService';
import StatusBadge from '@/components/StatusBadge.vue';

export default defineComponent({
    name: 'MangaDetailPage',
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
        IonBackButton, IonButton, IonIcon, IonSpinner, IonLoading, StatusBadge,
    },
    data() {
        return {
            loading: false,
            saving: false,
            item: null as UserManga | null,
            sites: [] as Site[],
            editingChapter: false,
            chapterInput: 0,
            selectedSiteId: '' as string | number,
            bookOutline, addOutline, removeOutline, trashOutline,
            statuses: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value: value as MangaStatus, label })),
        };
    },
    async ionViewWillEnter() {
        await this.loadData();
    },
    methods: {
        async loadData() {
            this.loading = true;
            const id = Number(this.$route.params.id);
            try {
                const [item, sites] = await Promise.all([userMangaService.getOne(id), siteService.getAll()]);
                this.item = item;
                this.sites = Array.isArray(sites) ? sites : (sites as any)?.data ?? [];
                this.selectedSiteId = item.site_id ?? '';
            } catch {
                const toast = await toastController.create({ message: 'Falha ao carregar manga.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
                this.$router.back();
            } finally {
                this.loading = false;
            }
        },

        patchItem(updated: UserManga) {
            if (updated.manga === undefined && this.item?.manga) updated.manga = this.item.manga;
            if (updated.site === undefined && this.item?.site) updated.site = this.item.site;
            this.item = updated;
        },

        async increment() {
            if (!this.item) return;
            this.saving = true;
            try {
                this.patchItem(await userMangaService.increment(this.item.id));
            } catch {
                await this.showError('Falha ao atualizar capítulo.');
            } finally {
                this.saving = false;
            }
        },

        async decrement() {
            if (!this.item || this.item.current_chapters <= 0) return;
            this.saving = true;
            try {
                this.patchItem(await userMangaService.update(this.item.id, { current_chapters: this.item.current_chapters - 1 }));
            } catch {
                await this.showError('Falha ao atualizar capítulo.');
            } finally {
                this.saving = false;
            }
        },

        async startEditChapter() {
            if (!this.item) return;
            this.chapterInput = this.item.current_chapters;
            this.editingChapter = true;
            await nextTick();
            (this.$refs.chapterField as HTMLInputElement)?.focus();
        },

        async saveChapter() {
            if (!this.item) return;
            this.editingChapter = false;
            if (this.chapterInput === this.item.current_chapters) return;
            this.saving = true;
            try {
                this.patchItem(await userMangaService.update(this.item.id, { current_chapters: this.chapterInput }));
            } catch {
                await this.showError('Falha ao salvar capítulo.');
            } finally {
                this.saving = false;
            }
        },

        async changeStatus(status: MangaStatus) {
            if (!this.item || this.item.status === status) return;
            this.saving = true;
            try {
                this.patchItem(await userMangaService.update(this.item.id, { status }));
            } catch {
                await this.showError('Falha ao atualizar status.');
            } finally {
                this.saving = false;
            }
        },

        async changeSite() {
            if (!this.item) return;
            this.saving = true;
            try {
                this.patchItem(await userMangaService.update(this.item.id, {
                    site_id: this.selectedSiteId ? Number(this.selectedSiteId) : undefined,
                }));
            } catch {
                await this.showError('Falha ao atualizar fonte.');
            } finally {
                this.saving = false;
            }
        },

        async confirmDelete() {
            const alert = await alertController.create({
                header: 'Remover Manga',
                message: 'Remover este manga da sua biblioteca?',
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Remover', role: 'destructive', handler: () => this.deleteManga() },
                ],
            });
            await alert.present();
        },

        async deleteManga() {
            if (!this.item) return;
            this.saving = true;
            try {
                await userMangaService.delete(this.item.id);
                const toast = await toastController.create({ message: 'Manga removido da biblioteca.', duration: 2000, color: 'success', position: 'top' });
                await toast.present();
                this.$router.back();
            } catch {
                await this.showError('Falha ao remover manga.');
            } finally {
                this.saving = false;
            }
        },

        async showError(msg: string) {
            const toast = await toastController.create({ message: msg, duration: 2000, color: 'danger', position: 'top' });
            await toast.present();
        },
    },
});
</script>

<style scoped>
.btn-delete { --border-radius: 14px; margin-top: 8px; }
</style>
