<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>
                    <span class="bg-gradient-to-br from-neon-blue to-neon-accent bg-clip-text text-transparent font-extrabold text-lg">
                        Descobrir
                    </span>
                </IonTitle>
                <IonButtons slot="end">
                    <IonButton fill="clear" router-link="/manage-contents">
                        <IonIcon slot="icon-only" :icon="settingsOutline" color="light" />
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true">
            <!-- Search bar -->
            <div class="px-5 pt-3">
                <IonInput
                    v-model="query"
                    placeholder="Buscar no acervo..."
                    fill="outline"
                    class="search-input"
                    @ionInput="filterContents"
                >
                    <IonIcon slot="start" :icon="searchOutline" class="text-[#4a5568]" />
                    <IonIcon v-if="query" slot="end" :icon="closeOutline" class="text-[#4a5568] cursor-pointer" @click="clearSearch" />
                </IonInput>
            </div>

            <div class="px-5 pt-4 pb-24">
                <!-- Type filter chips -->
                <div class="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                    <button
                        v-for="opt in typeOptions"
                        :key="opt.value ?? 'all'"
                        class="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border"
                        :class="activeType === opt.value
                            ? 'bg-neon-accent text-black border-neon-accent'
                            : 'bg-neon-elevated border-neon-border text-neon-muted'"
                        @click="setType(opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>

                <!-- Count -->
                <div class="flex items-center gap-2.5 mb-4">
                    <h2 class="text-xl font-extrabold text-neon-text m-0">Acervo</h2>
                    <span v-if="filtered.length" class="bg-neon-accent/12 border border-neon-accent/20 text-neon-accent rounded-full px-2.5 py-0.5 text-xs font-bold">
                        {{ filtered.length }}
                    </span>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex justify-center py-16">
                    <IonSpinner name="crescent" color="primary" />
                </div>

                <!-- Empty catalog -->
                <div v-else-if="filtered.length === 0" class="text-center py-10">
                    <IonIcon :icon="compassOutline" class="text-[48px] text-neon-muted block mb-3.5" />
                    <h3 class="text-lg font-bold text-neon-text m-0 mb-2">Nenhum resultado</h3>
                    <p class="text-sm text-neon-muted m-0 mb-5">
                        {{ query ? 'Tente uma busca diferente' : 'Adicione conteúdo pelo Acervo' }}
                    </p>
                    <IonButton router-link="/manage-contents" fill="outline" class="btn-outline">Gerenciar Acervo</IonButton>
                </div>

                <!-- List -->
                <div v-else class="flex flex-col gap-2.5">
                    <div
                        v-for="content in filtered"
                        :key="content.id"
                        class="flex items-center gap-3.5 bg-neon-surface border border-neon-border rounded-[14px] p-3 cursor-pointer transition-colors active:border-neon-accent"
                        @click="addToLibrary(content)"
                    >
                        <div class="w-12 h-[66px] rounded-lg overflow-hidden flex-shrink-0">
                            <img v-if="content.cover" :src="content.cover" :alt="content.name" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted text-2xl">
                                <IonIcon :icon="typeIcon(content.type)" />
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5 mb-0.5">
                                <span class="text-[9px] font-bold tracking-[1px] uppercase px-1.5 py-0.5 rounded" :class="typeColorClass(content.type)">
                                    {{ typeLabel(content.type) }}
                                </span>
                            </div>
                            <span class="block text-sm font-bold text-neon-text truncate">{{ content.name }}</span>
                            <span v-if="content.total_units" class="text-xs text-neon-muted">
                                {{ content.total_units }} {{ unitLabel(content.type) }}
                            </span>
                        </div>
                        <IonIcon :icon="addCircleOutline" class="text-neon-accent text-2xl flex-shrink-0" />
                    </div>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, IonSpinner, IonInput,
} from '@ionic/vue';
import { searchOutline, closeOutline, compassOutline, bookOutline, tvOutline, libraryOutline, addCircleOutline, settingsOutline } from 'ionicons/icons';
import { contentService, Content, ContentType, CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS, UNIT_LABEL } from '@/services/contentService';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
};

export default defineComponent({
    name: 'DiscoverPage',
    components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSpinner, IonInput },
    data() {
        return {
            loading: false,
            contents: [] as Content[],
            filtered: [] as Content[],
            query: '',
            activeType: null as ContentType | null,
            typeOptions: [
                { label: 'Todos', value: null as ContentType | null },
                ...Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => ({ label, value: value as ContentType })),
            ],
            searchOutline, closeOutline, compassOutline, addCircleOutline, settingsOutline,
        };
    },
    async ionViewWillEnter() {
        await this.loadContents();
    },
    methods: {
        async loadContents() {
            this.loading = true;
            try {
                this.contents = await contentService.getAll();
                this.applyFilters();
            } catch {
                // non-blocking
            } finally {
                this.loading = false;
            }
        },

        setType(type: ContentType | null) {
            this.activeType = type;
            this.applyFilters();
        },

        filterContents() {
            this.applyFilters();
        },

        applyFilters() {
            let result = [...this.contents];
            if (this.activeType) {
                result = result.filter((c) => c.type === this.activeType);
            }
            if (this.query.trim()) {
                const q = this.query.toLowerCase();
                result = result.filter((c) => c.name.toLowerCase().includes(q));
            }
            this.filtered = result;
        },

        clearSearch() {
            this.query = '';
            this.applyFilters();
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
    },
});
</script>

<style scoped>
.search-input {
    --background: #1a2035;
    --color: #e8eaf0;
    --placeholder-color: #4a5568;
    --border-color: #1e2538;
    --border-radius: 14px;
    --highlight-color-focused: #00e5b0;
    --padding-start: 12px;
    --padding-end: 12px;
    min-height: 48px;
    width: 100%;
}
.btn-outline { --border-radius: 12px; --color: var(--neon-accent); --border-color: var(--neon-accent); }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
