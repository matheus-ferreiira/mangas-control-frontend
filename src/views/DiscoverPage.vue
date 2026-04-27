<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="px-4 pb-24 page-top">
                <!-- Header -->
                <div class="flex items-center justify-between mb-3">
                    <h2 class="text-[20px] font-extrabold text-neon-text m-0 tracking-[-0.02em]">Descobrir</h2>
                    <IonButton fill="outline" class="settings-btn" @click="$router.push('/manage-contents')">
                        <IonIcon slot="icon-only" :icon="settingsOutline" />
                    </IonButton>
                </div>

                <!-- Search bar -->
                <IonSearchbar
                    :value="query"
                    placeholder="Buscar no acervo..."
                    show-clear-button="focus"
                    class="neon-search"
                    @ionInput="onSearch"
                />

                <!-- Type filters -->
                <div class="flex bg-neon-surface border border-neon-border rounded-xl p-1 gap-0.5 mt-3 mb-2">
                    <div
                        v-for="opt in typeOptions"
                        :key="opt.value ?? 'all'"
                        class="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[9px] text-[12px] font-bold transition-colors cursor-pointer select-none"
                        :class="activeType === opt.value ? 'bg-neon-accent text-black' : 'text-neon-muted'"
                        @click="setType(opt.value)"
                    >
                        <IonIcon v-if="opt.icon" :icon="opt.icon" class="text-[14px]" />
                        {{ opt.label }}
                    </div>
                </div>

                <!-- Catalog status filter -->
                <div class="flex gap-1.5 overflow-x-auto pb-1 mb-3 no-scrollbar">
                    <div
                        v-for="opt in catalogStatusOptions"
                        :key="opt.value ?? 'all-status'"
                        class="flex-shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer select-none border transition-colors"
                        :style="activeCatalogStatus === opt.value
                            ? { background: opt.color + '22', color: opt.color, borderColor: opt.color + '66' }
                            : { background: '#141825', color: '#5a6480', borderColor: '#222840' }"
                        @click="setCatalogStatus(opt.value)"
                    >
                        <span
                            class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            :style="activeCatalogStatus === opt.value ? { background: opt.color } : { background: '#4a5570' }"
                        ></span>
                        {{ opt.label }}
                    </div>
                </div>

                <!-- Counter -->
                <div class="pb-1.5 mb-1.5">
                    <span class="text-[11px] font-semibold text-neon-muted">
                        Acervo · {{ contents.length }} conteúdos
                        <template v-if="activeType || activeCatalogStatus || query"> · filtrado</template>
                    </span>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex justify-center py-16">
                    <IonSpinner name="crescent" color="primary" />
                </div>

                <!-- Empty -->
                <div v-else-if="contents.length === 0" class="text-center py-10">
                    <IonIcon :icon="compassOutline" class="text-[48px] text-neon-muted block mb-3.5" />
                    <h3 class="text-lg font-bold text-neon-text m-0 mb-2">Nenhum resultado</h3>
                    <p class="text-sm text-neon-muted m-0 mb-5">
                        {{ query ? 'Tente uma busca diferente' : 'Nenhum conteúdo encontrado' }}
                    </p>
                    <div class="flex flex-col gap-2">
                        <IonButton router-link="/manage-contents" fill="outline" class="btn-outline">Gerenciar Acervo</IonButton>
                        <IonButton router-link="/content-requests" fill="outline" class="btn-outline-muted">Solicitar Novo Conteúdo</IonButton>
                    </div>
                </div>

                <!-- List -->
                <div v-else class="flex flex-col gap-2">
                    <div
                        v-for="content in contents"
                        :key="content.id"
                        class="bg-neon-card border border-neon-border rounded-xl overflow-hidden"
                    >
                        <div
                            class="flex items-center gap-2.5 p-3 cursor-pointer"
                            @click="addToLibrary(content)"
                        >
                            <div class="w-10 h-[56px] rounded-md overflow-hidden flex-shrink-0">
                                <img v-if="content.cover" :src="content.cover" :alt="content.name" class="w-full h-full object-cover" />
                                <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted text-xl">
                                    <IonIcon :icon="typeIcon(content.type)" />
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-1.5 mb-1 flex-wrap">
                                    <span class="text-[9px] font-bold tracking-[0.08em] uppercase px-1.5 py-0.5 rounded" :class="typeColorClass(content.type)">
                                        {{ typeLabel(content.type) }}
                                    </span>
                                    <span
                                        v-if="content.status"
                                        class="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                        :style="{ background: catalogStatusColor(content.status) + '22', color: catalogStatusColor(content.status) }"
                                    >
                                        {{ catalogStatusLabel(content.status) }}
                                    </span>
                                </div>
                                <div class="text-sm font-bold text-neon-text truncate">{{ content.name }}</div>
                                <div v-if="content.alternative_names?.length" class="text-[10px] text-neon-muted truncate">
                                    {{ content.alternative_names.slice(0, 2).join(' · ') }}
                                </div>
                                <div class="text-[11px] text-neon-muted flex items-center gap-1.5 mt-0.5">
                                    <span>{{ content.total_units ? `${content.total_units} ${unitLabel(content.type)}` : 'Em andamento' }}</span>
                                    <template v-if="content.last_unit_update">
                                        <span class="text-neon-border">·</span>
                                        <span>{{ formatRelativeDate(content.last_unit_update) }}</span>
                                    </template>
                                </div>
                            </div>
                            <!-- Action buttons -->
                            <div class="flex gap-1.5 flex-shrink-0">
                                <IonButton fill="outline" class="icon-btn" @click.stop="$router.push('/manage-contents')">
                                    <IonIcon slot="icon-only" :icon="pencilOutline" />
                                </IonButton>
                                <IonButton fill="outline" class="icon-btn add-btn" @click.stop="addToLibrary(content)">
                                    <IonIcon slot="icon-only" :icon="addCircleOutline" />
                                </IonButton>
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
    IonPage, IonContent, IonButton, IonIcon, IonSpinner, IonSearchbar,
} from '@ionic/vue';
import { compassOutline, bookOutline, tvOutline, libraryOutline, addCircleOutline, settingsOutline, pencilOutline } from 'ionicons/icons';
import {
    contentService, Content, ContentType, ContentCatalogStatus,
    CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS, UNIT_LABEL,
    CATALOG_STATUS_LABELS, CATALOG_STATUS_COLORS,
} from '@/services/contentService';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
};

export default defineComponent({
    name: 'DiscoverPage',
    components: { IonPage, IonContent, IonButton, IonIcon, IonSpinner, IonSearchbar },
    data() {
        return {
            loading: false,
            contents: [] as Content[],
            query: '',
            activeType: null as ContentType | null,
            activeCatalogStatus: null as ContentCatalogStatus | null,
            searchTimer: null as ReturnType<typeof setTimeout> | null,
            typeOptions: [
                { label: 'Todos', value: null as ContentType | null, icon: null as string | null },
                { label: CONTENT_TYPE_LABELS.manga, value: 'manga' as ContentType, icon: bookOutline },
                { label: CONTENT_TYPE_LABELS.anime, value: 'anime' as ContentType, icon: tvOutline },
                { label: CONTENT_TYPE_LABELS.novel, value: 'novel' as ContentType, icon: libraryOutline },
            ],
            catalogStatusOptions: [
                { label: 'Todos', value: null as ContentCatalogStatus | null, color: '#00d4aa' },
                ...Object.entries(CATALOG_STATUS_LABELS).map(([value, label]) => ({
                    value: value as ContentCatalogStatus,
                    label,
                    color: CATALOG_STATUS_COLORS[value as ContentCatalogStatus],
                })),
            ],
            compassOutline, addCircleOutline, settingsOutline, pencilOutline,
        };
    },
    async ionViewWillEnter() {
        await this.loadContents();
    },
    methods: {
        async loadContents() {
            this.loading = true;
            try {
                this.contents = await contentService.getAll({
                    type: this.activeType ?? undefined,
                    status: this.activeCatalogStatus ?? undefined,
                    search: this.query || undefined,
                });
            } catch {
                // non-blocking
            } finally {
                this.loading = false;
            }
        },

        setType(type: ContentType | null) {
            this.activeType = type;
            this.loadContents();
        },

        setCatalogStatus(status: ContentCatalogStatus | null) {
            this.activeCatalogStatus = status;
            this.loadContents();
        },

        onSearch(ev: Event) {
            this.query = (ev as CustomEvent).detail.value ?? '';
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.loadContents(), 400);
        },

        addToLibrary(content: Content) {
            this.$router.push({ path: '/tabs/add', query: { content_id: content.id } });
        },

        typeIcon(type: ContentType): string {
            return TYPE_ICONS[type] ?? bookOutline;
        },

        typeColorClass(type: ContentType): string {
            return CONTENT_TYPE_COLORS[type] ?? '';
        },

        typeLabel(type: ContentType): string {
            return CONTENT_TYPE_LABELS[type] ?? type;
        },

        unitLabel(type: ContentType): string {
            return UNIT_LABEL[type]?.plural ?? 'capítulos';
        },

        catalogStatusColor(status: ContentCatalogStatus): string {
            return CATALOG_STATUS_COLORS[status] ?? '#5a6480';
        },

        catalogStatusLabel(status: ContentCatalogStatus): string {
            return CATALOG_STATUS_LABELS[status] ?? status;
        },

        formatRelativeDate(dateStr: string): string {
            const diff = Date.now() - new Date(dateStr).getTime();
            const mins = Math.floor(diff / 60000);
            if (mins < 1) return 'agora';
            if (mins < 60) return `há ${mins}min`;
            const hours = Math.floor(mins / 60);
            if (hours < 24) return `há ${hours}h`;
            const days = Math.floor(hours / 24);
            if (days < 30) return `há ${days}d`;
            return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        },
    },
});
</script>

<style scoped>
.btn-outline { --border-radius: 12px; --color: var(--neon-accent); --border-color: var(--neon-accent); }
.btn-outline-muted { --border-radius: 12px; --color: #5a6480; --border-color: #222840; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.neon-search {
    --background: #141825;
    --color: #f0f4ff;
    --placeholder-color: #5a6480;
    --icon-color: #5a6480;
    --clear-button-color: #5a6480;
    --border-radius: 10px;
    --box-shadow: 0 0 0 1px #222840;
    padding-inline: 0;
    padding-top: 0;
    padding-bottom: 4px;
}

.settings-btn {
    --border-radius: 10px;
    --background: transparent;
    --color: #5a6480;
    --border-color: #222840;
    --border-width: 1px;
    --height: 32px;
    --padding-start: 0;
    --padding-end: 0;
    width: 32px;
    margin: 0;
}

.icon-btn {
    --border-radius: 8px;
    --background: transparent;
    --color: #5a6480;
    --border-color: #222840;
    --border-width: 1px;
    --height: 28px;
    --padding-start: 0;
    --padding-end: 0;
    width: 28px;
    margin: 0;
}

.add-btn { --color: #5a6480; }
</style>
