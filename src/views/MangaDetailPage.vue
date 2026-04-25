<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div v-if="loading" class="flex justify-center py-20">
                <IonSpinner name="crescent" color="primary" />
            </div>

            <div v-else-if="item">
                <!-- Hero cover -->
                <div class="relative w-full h-[210px] flex-shrink-0">
                    <img v-if="item.content?.cover" :src="item.content.cover" class="w-full h-full object-cover" alt="Capa" />
                    <div v-else class="w-full h-full flex items-center justify-center text-[80px]"
                        :style="{ background: 'linear-gradient(135deg, #141825, #1a2035)' }">
                        <IonIcon :icon="typeIcon" class="text-neon-border" />
                    </div>
                    <!-- Gradient overlay -->
                    <div class="absolute inset-0" style="background: linear-gradient(to bottom, rgba(11,15,26,0.3) 0%, rgba(11,15,26,0.98) 100%)"></div>
                    <!-- Back button -->
                    <div class="absolute left-2" style="top: max(10px, env(safe-area-inset-top, 10px))">
                        <IonButton fill="clear" class="back-btn" @click="$router.back()">
                            <IonIcon slot="icon-only" :icon="chevronBackOutline" />
                        </IonButton>
                    </div>
                    <!-- Content info -->
                    <div class="absolute bottom-3.5 left-4 right-4">
                        <div class="flex items-center gap-1.5 mb-1.5">
                            <span class="text-[10px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded" :class="typeColorClass">
                                {{ typeLabel }}
                            </span>
                            <span v-if="isOngoing" class="text-[9px] font-bold text-amber-400 bg-amber-400/15 px-1.5 py-0.5 rounded uppercase">
                                Em andamento
                            </span>
                        </div>
                        <h1 class="text-[21px] font-extrabold text-neon-text m-0 leading-tight">{{ item.content?.name }}</h1>
                    </div>
                </div>

                <div class="px-4 pt-3.5 pb-24">
                    <!-- Stats pills -->
                    <div class="flex gap-2 mb-4">
                        <div class="flex-1 bg-neon-surface rounded-[10px] p-[9px] border border-neon-border text-center">
                            <div class="text-base font-extrabold text-neon-accent">{{ item.content?.total_units ?? '?' }}</div>
                            <div class="text-[9px] font-semibold uppercase tracking-[0.05em] text-neon-muted mt-0.5">
                                {{ contentType === 'anime' ? 'Episódios' : 'Capítulos' }}
                            </div>
                        </div>
                        <div class="flex-1 bg-neon-surface rounded-[10px] p-[9px] border border-neon-border text-center">
                            <div class="text-base font-extrabold text-neon-accent">{{ typeLabel }}</div>
                            <div class="text-[9px] font-semibold uppercase tracking-[0.05em] text-neon-muted mt-0.5">Tipo</div>
                        </div>
                        <div class="flex-1 bg-neon-surface rounded-[10px] p-[9px] border text-center" :style="{ borderColor: statusColor + '44' }">
                            <div class="text-base font-extrabold" :style="{ color: statusColor }">{{ item.current_units }}</div>
                            <div class="text-[9px] font-semibold uppercase tracking-[0.05em] text-neon-muted mt-0.5">Progresso</div>
                        </div>
                    </div>

                    <!-- My record panel -->
                    <div class="bg-neon-surface border border-neon-border rounded-xl p-3.5 mb-4">
                        <div class="text-[13px] font-extrabold text-neon-text mb-3">📖 Meu registro</div>

                        <!-- Status -->
                        <div class="mb-3">
                            <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-1.5">Status</div>
                            <div class="flex flex-wrap gap-1.5">
                                <IonButton
                                    v-for="s in statuses"
                                    :key="s.value"
                                    shape="round"
                                    size="small"
                                    fill="outline"
                                    class="pill"
                                    :style="item.status === s.value
                                        ? { '--background': getStatusColor(s.value), '--color': '#fff', '--border-color': getStatusColor(s.value) }
                                        : { '--background': '#1c2644', '--color': '#8892aa', '--border-color': '#4a5a80' }"
                                    @click="changeStatus(s.value)"
                                >{{ s.label }}</IonButton>
                            </div>
                        </div>

                        <!-- Progress controls -->
                        <div class="mb-3">
                            <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-1.5">
                                {{ contentType === 'anime' ? 'Episódio atual' : 'Capítulo atual' }}
                            </div>
                            <div class="flex items-center gap-2">
                                <IonButton fill="outline" class="unit-btn" :disabled="saving || item.current_units <= 0" @click="decrement">−</IonButton>
                                <div class="flex-1 text-center">
                                    <IonInput
                                        v-if="editingUnits"
                                        :value="unitsInput"
                                        type="number"
                                        inputmode="numeric"
                                        class="unit-input"
                                        @ionBlur="saveUnits"
                                        @ionInput="unitsInput = Number(($event as CustomEvent).detail.value) || 0"
                                        ref="unitsField"
                                        min="0"
                                    />
                                    <span
                                        v-else
                                        class="text-[32px] font-extrabold text-neon-text cursor-pointer leading-none"
                                        @click="startEditUnits"
                                    >{{ item.current_units }}</span>
                                </div>
                                <IonButton fill="solid" class="unit-btn unit-plus" :disabled="saving" @click="increment">+</IonButton>
                            </div>
                            <!-- Progress bar -->
                            <div v-if="!isOngoing" class="mt-2">
                                <div class="h-[3px] bg-white/[0.07] rounded overflow-hidden">
                                    <div class="h-full rounded transition-[width] duration-300" :style="{ width: progressPct + '%', background: statusColor }"></div>
                                </div>
                                <div class="text-[10px] text-neon-muted mt-1">
                                    {{ item.current_units }} / {{ item.content?.total_units }} {{ unitShort }} · {{ progressPct }}%
                                </div>
                            </div>
                        </div>

                        <!-- Rating grid -->
                        <div class="mb-3">
                            <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-1.5">Avaliação (0–10)</div>
                            <div class="flex flex-wrap gap-1.5">
                                <IonButton
                                    v-for="n in ratingOptions"
                                    :key="n"
                                    size="small"
                                    fill="outline"
                                    class="rating-btn"
                                    :style="item.rating === n
                                        ? { '--background': '#f59e0b', '--color': '#000', '--border-color': '#f59e0b' }
                                        : { '--background': '#1c2644', '--color': '#8892aa', '--border-color': '#4a5a80' }"
                                    @click="changeRating(item.rating === n ? null : n)"
                                >{{ n }}</IonButton>
                            </div>
                        </div>

                        <!-- Site -->
                        <div v-if="sites.length">
                            <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-1.5">Site de leitura</div>
                            <IonSelect
                                v-model="selectedSiteId"
                                :compareWith="(o1, o2) => Number(o1) === Number(o2)"
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
    IonPage, IonContent, IonIcon, IonSpinner, IonLoading,
    IonButton, IonSelect, IonSelectOption,
    toastController, alertController,
} from '@ionic/vue';
import { bookOutline, tvOutline, libraryOutline, trashOutline, chevronBackOutline } from 'ionicons/icons';
import { userContentService, UserContent, ContentStatus, STATUS_LABELS, getStatusLabel } from '@/services/userContentService';
import { siteService, Site } from '@/services/siteService';
import { ContentType, CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS, UNIT_LABEL } from '@/services/contentService';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
};

const STATUS_COLORS: Record<ContentStatus, string> = {
    reading: '#3b82f6',
    completed: '#10b981',
    paused: '#f59e0b',
    dropped: '#ef4444',
    plan_to_read: '#8b5cf6',
};

export default defineComponent({
    name: 'MangaDetailPage',
    components: {
        IonPage, IonContent, IonIcon, IonSpinner, IonLoading,
        IonButton, IonSelect, IonSelectOption,
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
            ratingOptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            trashOutline, chevronBackOutline,
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
        isOngoing(): boolean {
            return !this.item?.content?.total_units;
        },
        statusColor(): string {
            return this.item ? (STATUS_COLORS[this.item.status] ?? '#5a6480') : '#5a6480';
        },
        progressPct(): number {
            const total = this.item?.content?.total_units;
            const current = this.item?.current_units ?? 0;
            if (!total) return 0;
            return Math.round((current / total) * 100);
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
                this.selectedSiteId = item?.site?.id ? String(item.site.id) : '';
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

        getStatusColor(status: ContentStatus): string {
            return STATUS_COLORS[status] ?? '#5a6480';
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

        async changeRating(value: number | null) {
            if (!this.item) return;
            this.saving = true;
            try {
                this.patchItem(await userContentService.update(this.item.id, { rating: value ?? undefined }));
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

.back-btn {
    --border-radius: 50%;
    --background: rgba(0,0,0,0.55);
    --color: #f0f4ff;
    --padding-start: 0;
    --padding-end: 0;
    width: 34px;
    height: 34px;
    margin: 0;
}

.unit-btn {
    --border-radius: 10px;
    --border-width: 1px;
    --border-color: #222840;
    --background: transparent;
    --color: #f0f4ff;
    --padding-start: 0;
    --padding-end: 0;
    --letter-spacing: 0;
    width: 34px;
    height: 34px;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;
    margin: 0;
}

.unit-plus {
    --background: #00d4aa;
    --color: #000;
    --border-color: #00d4aa;
}

.unit-input {
    --background: transparent;
    --color: #f0f4ff;
    --highlight-color-focused: #00d4aa;
    --border-color: #00d4aa;
    --padding-start: 0;
    --padding-end: 0;
    font-size: 32px;
    font-weight: 800;
    text-align: center;
    width: 80px;
}

.pill {
    --height: 30px;
    --padding-start: 12px;
    --padding-end: 12px;
    --border-width: 1px;
    --letter-spacing: 0;
    margin: 0;
}

.rating-btn {
    --border-radius: 6px;
    --border-width: 1px;
    --padding-start: 0;
    --padding-end: 0;
    --height: 28px;
    --letter-spacing: 0;
    width: 28px;
    margin: 0;
}

.neon-select {
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
