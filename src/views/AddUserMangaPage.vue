<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="px-4 pt-4 pb-24">
                <!-- Header -->
                <div class="mb-4">
                    <div class="text-[20px] font-extrabold text-neon-text tracking-[-0.02em] mb-0.5">Adicionar</div>
                    <div class="text-[12px] text-neon-muted">Adicione uma obra à sua biblioteca</div>
                </div>

                <!-- Content search -->
                <div class="mb-4">
                    <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-1.5">Conteúdo</div>

                    <!-- Selected content -->
                    <div v-if="selectedContent" class="flex items-center gap-3 bg-neon-surface border rounded-xl p-3" style="border-color: rgba(0,212,170,0.4)">
                        <div class="w-10 h-[54px] rounded-lg overflow-hidden flex-shrink-0">
                            <img v-if="selectedContent.cover" :src="selectedContent.cover" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted">
                                <IonIcon :icon="typeIcon(selectedContent.type)" class="text-xl" />
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="block text-sm font-bold text-neon-text truncate">{{ selectedContent.name }}</span>
                            <span class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded mt-0.5 inline-block" :class="typeColorClass(selectedContent.type)">
                                {{ typeLabel(selectedContent.type) }}
                            </span>
                        </div>
                        <button class="w-8 h-8 rounded-lg bg-neon-elevated border border-neon-border flex items-center justify-center text-neon-muted cursor-pointer" @click="clearContent">
                            <IonIcon :icon="closeOutline" />
                        </button>
                    </div>

                    <!-- Search -->
                    <div v-else class="relative">
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neon-muted text-sm pointer-events-none">🔍</span>
                            <input
                                v-model="contentSearch"
                                placeholder="Buscar no acervo..."
                                class="w-full pl-8 pr-4 py-[10px] rounded-[10px] border border-neon-border bg-neon-surface text-neon-text text-[13px] outline-none placeholder:text-neon-muted"
                            />
                        </div>
                        <div v-if="filteredContents.length" class="mt-1 bg-neon-surface border border-neon-border rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                            <div
                                v-for="c in filteredContents"
                                :key="c.id"
                                class="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-neon-elevated active:bg-neon-elevated border-b border-neon-border last:border-b-0"
                                @click="selectContent(c)"
                            >
                                <div class="w-8 h-11 rounded-md overflow-hidden flex-shrink-0">
                                    <img v-if="c.cover" :src="c.cover" class="w-full h-full object-cover" />
                                    <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted">
                                        <IonIcon :icon="typeIcon(c.type)" />
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <span class="block text-sm font-semibold text-neon-text truncate">{{ c.name }}</span>
                                    <div class="flex items-center gap-1.5 mt-0.5">
                                        <span class="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" :class="typeColorClass(c.type)">
                                            {{ typeLabel(c.type) }}
                                        </span>
                                        <span v-if="c.total_units" class="text-xs text-neon-muted">{{ c.total_units }} {{ unitShort(c.type) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p v-if="contentSearch && !filteredContents.length" class="text-xs text-neon-muted mt-2 text-center">
                            Não encontrado. <a class="text-neon-accent cursor-pointer" @click="$router.push('/manage-contents')">Adicionar ao acervo</a>
                        </p>
                    </div>
                </div>

                <!-- Site -->
                <div class="mb-4">
                    <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-1.5">Fonte de Leitura *</div>
                    <IonSelect
                        v-model="form.site_id"
                        placeholder="Selecionar fonte..."
                        fill="outline"
                        interface="action-sheet"
                        class="neon-select"
                    >
                        <IonSelectOption v-for="s in sites" :key="s.id" :value="s.id">{{ s.name }}</IonSelectOption>
                    </IonSelect>
                </div>

                <!-- Status -->
                <div class="mb-4">
                    <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-1.5">Status</div>
                    <div class="flex flex-wrap gap-1.5">
                        <button
                            v-for="s in statuses"
                            :key="s.value"
                            class="px-3 py-1.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all font-sans"
                            :class="form.status === s.value ? 'border-transparent text-white' : 'bg-transparent border-neon-border text-neon-muted'"
                            :style="form.status === s.value ? { background: statusColor(s.value) } : {}"
                            @click="form.status = s.value"
                        >{{ s.label }}</button>
                    </div>
                </div>

                <!-- Current units -->
                <div class="mb-4">
                    <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-1.5">
                        {{ selectedContent ? unitPlural(selectedContent.type) : 'Progresso' }} atual
                    </div>
                    <IonInput
                        :value="form.current_units"
                        type="number"
                        inputmode="numeric"
                        placeholder="0"
                        :min="0"
                        fill="outline"
                        class="neon-input"
                        @ionInput="form.current_units = Number(($event as CustomEvent).detail.value) || 0"
                    />
                </div>

                <!-- Rating -->
                <div class="mb-6">
                    <div class="text-[10px] font-bold uppercase tracking-[0.08em] text-neon-muted mb-1.5">Avaliação (opcional, 0–10)</div>
                    <div class="flex flex-wrap gap-1.5">
                        <button
                            v-for="n in ratingOptions"
                            :key="n"
                            class="w-7 h-7 rounded-md border text-[11px] font-bold cursor-pointer transition-all font-sans"
                            :class="form.rating === n
                                ? 'border-transparent bg-amber-400 text-black'
                                : 'border-neon-border bg-transparent text-neon-muted'"
                            @click="form.rating = (form.rating === n ? null : n)"
                        >{{ n }}</button>
                    </div>
                </div>

                <IonButton expand="block" :disabled="saving || !canSubmit" @click="addContent" class="btn-primary mb-3">
                    <IonSpinner v-if="saving" name="crescent" />
                    <template v-else>Adicionar à Biblioteca</template>
                </IonButton>

                <IonButton expand="block" class="btn-cancel" @click="discard">Descartar</IonButton>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent,
    IonButton, IonIcon, IonSpinner, IonInput, IonSelect, IonSelectOption,
    toastController,
} from '@ionic/vue';
import { bookOutline, tvOutline, libraryOutline, closeOutline } from 'ionicons/icons';
import { contentService, Content, ContentType, CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS, UNIT_LABEL } from '@/services/contentService';
import { siteService, Site } from '@/services/siteService';
import { userContentService, ContentStatus, STATUS_LABELS, getStatusLabel } from '@/services/userContentService';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
};

const STATUS_COLORS: Record<string, string> = {
    reading: '#3b82f6',
    completed: '#10b981',
    paused: '#f59e0b',
    dropped: '#ef4444',
    plan_to_read: '#8b5cf6',
};

export default defineComponent({
    name: 'AddUserMangaPage',
    components: { IonPage, IonContent, IonButton, IonIcon, IonSpinner, IonInput, IonSelect, IonSelectOption },
    data() {
        return {
            saving: false,
            contents: [] as Content[],
            sites: [] as Site[],
            contentSearch: '',
            ratingOptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            form: {
                content_id: null as number | null,
                site_id: '' as string | number,
                status: 'plan_to_read' as ContentStatus,
                current_units: 0,
                rating: null as number | null,
            },
            closeOutline,
        };
    },
    computed: {
        filteredContents(): Content[] {
            if (!this.contentSearch.trim()) return [];
            const q = this.contentSearch.toLowerCase();
            return this.contents.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
        },
        selectedContent(): Content | null {
            if (!this.form.content_id) return null;
            return this.contents.find((c) => c.id === this.form.content_id) ?? null;
        },
        canSubmit(): boolean {
            return !!(this.form.content_id && this.form.site_id);
        },
        statuses() {
            const type = this.selectedContent?.type ?? 'manga';
            return Object.entries(STATUS_LABELS).map(([value]) => ({
                value: value as ContentStatus,
                label: getStatusLabel(value as ContentStatus, type),
            }));
        },
    },
    async ionViewWillEnter() {
        await this.loadData();
        this.resetForm();
        const contentId = this.$route.query.content_id;
        if (contentId) this.form.content_id = Number(contentId);
    },
    methods: {
        async loadData() {
            try {
                const [contents, sites] = await Promise.all([contentService.getAll(), siteService.getAll()]);
                this.contents = contents;
                this.sites = Array.isArray(sites) ? sites : (sites as any)?.data ?? [];
            } catch {
                // non-blocking
            }
        },

        selectContent(content: Content) {
            this.form.content_id = content.id;
            this.contentSearch = '';
        },

        clearContent() {
            this.form.content_id = null;
            this.contentSearch = '';
        },

        resetForm() {
            this.form = { content_id: null, site_id: '', status: 'plan_to_read', current_units: 0, rating: null };
            this.contentSearch = '';
        },

        async addContent() {
            if (!this.canSubmit) return;
            this.saving = true;
            try {
                await userContentService.create({
                    content_id: this.form.content_id!,
                    site_id: Number(this.form.site_id),
                    status: this.form.status,
                    current_units: this.form.current_units,
                    ...(this.form.rating != null ? { rating: this.form.rating } : {}),
                });
                const toast = await toastController.create({ message: 'Adicionado à biblioteca!', duration: 2000, color: 'success', position: 'top' });
                await toast.present();
                this.resetForm();
                this.$router.push('/tabs/library');
            } catch {
                const toast = await toastController.create({ message: 'Falha ao adicionar.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.saving = false;
            }
        },

        discard() {
            this.resetForm();
            this.$router.push('/tabs/library');
        },

        statusColor(value: string): string {
            return STATUS_COLORS[value] ?? '#5a6480';
        },

        typeIcon(type: ContentType): string { return TYPE_ICONS[type] ?? bookOutline; },
        typeColorClass(type: ContentType): string { return CONTENT_TYPE_COLORS[type] ?? ''; },
        typeLabel(type: ContentType): string { return CONTENT_TYPE_LABELS[type] ?? type; },
        unitShort(type: ContentType): string { return UNIT_LABEL[type]?.short ?? 'cap.'; },
        unitPlural(type: ContentType): string { return UNIT_LABEL[type]?.plural ?? 'capítulos'; },
    },
});
</script>

<style scoped>
.btn-primary { --background: var(--neon-accent); --color: #000; --border-radius: 12px; font-weight: 700; height: 50px; }
.btn-cancel { --background: #1a2035; --color: #f0f4ff; --border-radius: 12px; height: 50px; }

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
