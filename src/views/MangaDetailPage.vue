<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton default-href="/tabs/library" text="" />
                </IonButtons>
                <IonTitle>Detalhes</IonTitle>
                <IonButtons slot="end">
                    <IonButton fill="clear" @click="confirmDelete">
                        <IonIcon slot="icon-only" :icon="trashOutline" color="danger" />
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true">
            <div v-if="loading" class="flex justify-center py-20">
                <IonSpinner name="crescent" color="primary" />
            </div>

            <div v-else-if="item">
                <!-- Hero -->
                <div class="relative w-full h-[280px]">
                    <img v-if="item.content?.cover" :src="item.content.cover" class="w-full h-full object-cover" alt="Capa" />
                    <div v-else class="w-full h-full bg-gradient-to-br from-[#0d1a2d] to-[#1a0d2e] flex items-center justify-center text-[80px] text-[#2a3550]">
                        <IonIcon :icon="typeIcon" />
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 px-5 pb-5 bg-gradient-to-t from-[rgba(10,14,26,1)] to-transparent">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-[10px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded" :class="typeColorClass">
                                {{ typeLabel }}
                            </span>
                            <StatusBadge :status="item.status" :type="item.content?.type ?? 'manga'" />
                        </div>
                        <h1 class="text-2xl font-extrabold text-neon-text mb-0 leading-tight">{{ item.content?.name }}</h1>
                    </div>
                </div>

                <div class="px-5 pt-5 pb-24">
                    <!-- Stats -->
                    <div class="flex items-center bg-neon-surface border border-neon-border rounded-2xl p-4 mb-6">
                        <div class="flex-1 flex flex-col items-center gap-1">
                            <span class="text-[11px] font-bold uppercase tracking-[1px] text-neon-muted">Atual</span>
                            <span class="text-[15px] font-bold text-neon-text">{{ unitShort }} {{ item.current_units }}</span>
                        </div>
                        <div class="w-px h-8 bg-neon-border"></div>
                        <div class="flex-1 flex flex-col items-center gap-1">
                            <span class="text-[11px] font-bold uppercase tracking-[1px] text-neon-muted">Total</span>
                            <span class="text-[15px] font-bold text-neon-text">
                                {{ item.content?.total_units ? `${unitShort} ${item.content.total_units}` : '—' }}
                            </span>
                        </div>
                        <div class="w-px h-8 bg-neon-border"></div>
                        <div class="flex-1 flex flex-col items-center gap-1 min-w-0 px-1">
                            <span class="text-[11px] font-bold uppercase tracking-[1px] text-neon-muted">Nota</span>
                            <span class="text-[15px] font-bold text-neon-text">
                                {{ item.rating != null ? `★ ${item.rating}` : '—' }}
                            </span>
                        </div>
                    </div>

                    <!-- Progress controls -->
                    <div class="mb-6">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-3">
                            Progresso ({{ unitPlural }})
                        </span>
                        <div class="flex items-center gap-4 bg-neon-surface border border-neon-border rounded-2xl p-4">
                            <button
                                class="w-12 h-12 rounded-xl bg-neon-elevated border border-neon-border text-neon-text text-[22px] flex items-center justify-center cursor-pointer transition-colors active:bg-[#212b45] disabled:opacity-40"
                                @click="decrement"
                                :disabled="saving || item.current_units <= 0"
                            >
                                <IonIcon :icon="removeOutline" />
                            </button>
                            <div class="flex-1 flex flex-col items-center">
                                <input
                                    v-if="editingUnits"
                                    v-model.number="unitsInput"
                                    type="number"
                                    class="text-[36px] font-extrabold text-neon-text bg-transparent border-b-2 border-neon-accent outline-none w-24 text-center leading-none"
                                    @blur="saveUnits"
                                    @keyup.enter="saveUnits"
                                    ref="unitsField"
                                    min="0"
                                />
                                <span
                                    v-else
                                    class="text-[36px] font-extrabold text-neon-text cursor-pointer leading-none"
                                    @click="startEditUnits"
                                >
                                    {{ item.current_units }}
                                </span>
                                <span class="text-[11px] text-neon-muted mt-1">Toque para editar</span>
                            </div>
                            <button
                                class="w-12 h-12 rounded-xl bg-neon-accent/12 border border-neon-accent/30 text-neon-accent text-[22px] flex items-center justify-center cursor-pointer transition-colors active:bg-neon-accent/20 disabled:opacity-40"
                                @click="increment"
                                :disabled="saving"
                            >
                                <IonIcon :icon="addOutline" />
                            </button>
                        </div>
                    </div>

                    <!-- Status -->
                    <div class="mb-6">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-3">Status</span>
                        <div class="grid grid-cols-2 gap-3">
                            <button
                                v-for="s in statuses"
                                :key="s.value"
                                class="py-4 px-3 rounded-2xl border text-sm font-semibold cursor-pointer transition-all text-center leading-snug"
                                :class="item.status === s.value
                                    ? 'bg-neon-accent/15 border-neon-accent/50 text-neon-accent font-bold'
                                    : 'bg-neon-surface border-neon-border text-neon-muted'"
                                @click="changeStatus(s.value)"
                            >
                                {{ s.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Rating -->
                    <div class="mb-6">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-3">Avaliação (0–10)</span>
                        <div class="bg-neon-surface border border-neon-border rounded-2xl p-4">
                            <div class="flex items-center gap-3 mb-3">
                                <span class="text-xs text-neon-muted w-4 text-center">0</span>
                                <IonRange
                                    :value="item.rating ?? 0"
                                    :min="0"
                                    :max="10"
                                    :step="0.5"
                                    color="primary"
                                    class="flex-1 rating-range"
                                    @ionChange="changeRating(($event as CustomEvent).detail.value)"
                                />
                                <span class="text-xs text-neon-muted w-4 text-center">10</span>
                            </div>
                            <div class="text-center">
                                <span class="text-[28px] font-extrabold text-neon-accent">
                                    {{ item.rating != null ? item.rating : '—' }}
                                </span>
                                <span v-if="item.rating != null" class="text-neon-muted text-sm ml-1">/ 10</span>
                            </div>
                        </div>
                    </div>

                    <!-- Site -->
                    <div class="mb-6" v-if="sites.length">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-3">Fonte de Leitura</span>
                        <IonSelect
                            v-model="selectedSiteId"
                            placeholder="Sem fonte"
                            fill="outline"
                            interface="action-sheet"
                            class="neon-select"
                            @ionChange="changeSite"
                        >
                            <IonSelectOption value="">Sem fonte</IonSelectOption>
                            <IonSelectOption v-for="site in sites" :key="site.id" :value="site.id">{{ site.name }}</IonSelectOption>
                        </IonSelect>
                    </div>

                    <!-- Delete -->
                    <IonButton expand="block" fill="outline" color="danger" class="btn-delete" @click="confirmDelete">
                        <IonIcon slot="start" :icon="trashOutline" />
                        Remover da Biblioteca
                    </IonButton>
                </div>
            </div>
        </IonContent>

        <IonLoading :is-open="saving" message="Salvando..." spinner="crescent" />
    </IonPage>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonButton, IonIcon, IonSpinner, IonLoading, IonSelect, IonSelectOption, IonRange,
    toastController, alertController,
} from '@ionic/vue';
import { bookOutline, tvOutline, libraryOutline, addOutline, removeOutline, trashOutline } from 'ionicons/icons';
import { userContentService, UserContent, ContentStatus, STATUS_LABELS, getStatusLabel } from '@/services/userContentService';
import { siteService, Site } from '@/services/siteService';
import { ContentType, CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS, UNIT_LABEL } from '@/services/contentService';
import StatusBadge from '@/components/StatusBadge.vue';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
};

export default defineComponent({
    name: 'MangaDetailPage',
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
        IonBackButton, IonButton, IonIcon, IonSpinner, IonLoading, IonSelect, IonSelectOption, IonRange, StatusBadge,
    },
    data() {
        return {
            loading: false,
            saving: false,
            item: null as UserContent | null,
            sites: [] as Site[],
            editingUnits: false,
            unitsInput: 0,
            selectedSiteId: '' as string | number,
            addOutline, removeOutline, trashOutline,
        };
    },
    computed: {
        contentType(): ContentType {
            return this.item?.content?.type ?? 'manga';
        },
        typeIcon(): string {
            return TYPE_ICONS[this.contentType];
        },
        typeColorClass(): string {
            return CONTENT_TYPE_COLORS[this.contentType];
        },
        typeLabel(): string {
            return CONTENT_TYPE_LABELS[this.contentType];
        },
        unitShort(): string {
            return UNIT_LABEL[this.contentType].short;
        },
        unitPlural(): string {
            return UNIT_LABEL[this.contentType].plural;
        },
        statuses() {
            return Object.entries(STATUS_LABELS).map(([value]) => ({
                value: value as ContentStatus,
                label: getStatusLabel(value as ContentStatus, this.contentType),
            }));
        },
    },
    async ionViewWillEnter() {
        await this.loadData();
    },
    methods: {
        async loadData() {
            this.loading = true;
            const id = Number(this.$route.params.id);
            try {
                const [item, sites] = await Promise.all([userContentService.getOne(id), siteService.getAll()]);
                this.item = item;
                this.sites = Array.isArray(sites) ? sites : (sites as any)?.data ?? [];
                this.selectedSiteId = item.site_id ?? '';
            } catch {
                const toast = await toastController.create({ message: 'Falha ao carregar.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
                this.$router.back();
            } finally {
                this.loading = false;
            }
        },

        patchItem(updated: UserContent) {
            if (updated.content === undefined && this.item?.content) updated.content = this.item.content;
            if (updated.site === undefined && this.item?.site) updated.site = this.item.site;
            this.item = updated;
        },

        async increment() {
            if (!this.item) return;
            this.saving = true;
            try {
                this.patchItem(await userContentService.increment(this.item.id));
            } catch {
                await this.showError('Falha ao atualizar progresso.');
            } finally {
                this.saving = false;
            }
        },

        async decrement() {
            if (!this.item || this.item.current_units <= 0) return;
            this.saving = true;
            try {
                this.patchItem(await userContentService.update(this.item.id, { current_units: this.item.current_units - 1 }));
            } catch {
                await this.showError('Falha ao atualizar progresso.');
            } finally {
                this.saving = false;
            }
        },

        async startEditUnits() {
            if (!this.item) return;
            this.unitsInput = this.item.current_units;
            this.editingUnits = true;
            await nextTick();
            (this.$refs.unitsField as HTMLInputElement)?.focus();
        },

        async saveUnits() {
            if (!this.item) return;
            this.editingUnits = false;
            if (this.unitsInput === this.item.current_units) return;
            this.saving = true;
            try {
                this.patchItem(await userContentService.update(this.item.id, { current_units: this.unitsInput }));
            } catch {
                await this.showError('Falha ao salvar progresso.');
            } finally {
                this.saving = false;
            }
        },

        async changeStatus(status: ContentStatus) {
            if (!this.item || this.item.status === status) return;
            this.saving = true;
            try {
                this.patchItem(await userContentService.update(this.item.id, { status }));
            } catch {
                await this.showError('Falha ao atualizar status.');
            } finally {
                this.saving = false;
            }
        },

        async changeRating(value: number) {
            if (!this.item) return;
            this.saving = true;
            try {
                this.patchItem(await userContentService.update(this.item.id, { rating: value }));
            } catch {
                await this.showError('Falha ao salvar avaliação.');
            } finally {
                this.saving = false;
            }
        },

        async changeSite() {
            if (!this.item) return;
            this.saving = true;
            try {
                this.patchItem(await userContentService.update(this.item.id, {
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
                header: 'Remover',
                message: 'Remover este item da sua biblioteca?',
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Remover', role: 'destructive', handler: () => this.deleteItem() },
                ],
            });
            await alert.present();
        },

        async deleteItem() {
            if (!this.item) return;
            this.saving = true;
            try {
                await userContentService.delete(this.item.id);
                const toast = await toastController.create({ message: 'Removido da biblioteca.', duration: 2000, color: 'success', position: 'top' });
                await toast.present();
                this.$router.back();
            } catch {
                await this.showError('Falha ao remover.');
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

.neon-select {
    --background: #1a2035;
    --color: #e8eaf0;
    --placeholder-color: #4a5568;
    --border-color: #1e2538;
    --border-radius: 12px;
    --highlight-color-focused: #00e5b0;
    --padding-start: 16px;
    --padding-end: 16px;
    min-height: 52px;
    width: 100%;
}

.rating-range {
    --bar-background: #1e2538;
    --bar-background-active: #00e5b0;
    --knob-background: #00e5b0;
    --pin-background: #00e5b0;
    --pin-color: #000;
}
</style>
