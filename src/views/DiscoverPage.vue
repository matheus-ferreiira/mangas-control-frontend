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

                <!-- Type pills -->
                <div class="flex gap-1.5 overflow-x-auto pb-1 mb-3 no-scrollbar">
                    <IonButton
                        v-for="opt in typeOptions"
                        :key="opt.value ?? 'all'"
                        shape="round"
                        size="small"
                        fill="outline"
                        class="pill"
                        :style="activeType === opt.value
                            ? { '--background': '#00d4aa', '--color': '#000', '--border-color': '#00d4aa' }
                            : { '--background': '#1c2644', '--color': '#8892aa', '--border-color': '#4a5a80' }"
                        @click="setType(opt.value)"
                    >{{ opt.label }}</IonButton>
                </div>

                <!-- Counter -->
                <div class="pb-1.5 mb-1.5">
                    <span class="text-[11px] font-semibold text-neon-muted">
                        Acervo · {{ filtered.length }} conteúdos
                    </span>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex justify-center py-16">
                    <IonSpinner name="crescent" color="primary" />
                </div>

                <!-- Empty -->
                <div v-else-if="filtered.length === 0" class="text-center py-10">
                    <IonIcon :icon="compassOutline" class="text-[48px] text-neon-muted block mb-3.5" />
                    <h3 class="text-lg font-bold text-neon-text m-0 mb-2">Nenhum resultado</h3>
                    <p class="text-sm text-neon-muted m-0 mb-5">
                        {{ query ? 'Tente uma busca diferente' : 'Adicione conteúdo pelo Acervo' }}
                    </p>
                    <IonButton router-link="/manage-contents" fill="outline" class="btn-outline">Gerenciar Acervo</IonButton>
                </div>

                <!-- List -->
                <div v-else class="flex flex-col gap-2">
                    <div
                        v-for="content in filtered"
                        :key="content.id"
                        class="bg-neon-card border border-neon-border rounded-xl overflow-hidden"
                    >
                        <!-- Main row -->
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
                                <div class="mb-1">
                                    <span class="text-[9px] font-bold tracking-[0.08em] uppercase px-1.5 py-0.5 rounded" :class="typeColorClass(content.type)">
                                        {{ typeLabel(content.type) }}
                                    </span>
                                </div>
                                <div class="text-sm font-bold text-neon-text truncate">{{ content.name }}</div>
                                <div class="text-[11px] text-neon-muted">
                                    {{ content.total_units ? `${content.total_units} ${unitLabel(content.type)}` : 'Em andamento' }}
                                </div>
                            </div>
                            <!-- Add button -->
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
import { contentService, Content, ContentType, CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS, UNIT_LABEL } from '@/services/contentService';

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
            filtered: [] as Content[],
            query: '',
            activeType: null as ContentType | null,
            typeOptions: [
                { label: 'Todos', value: null as ContentType | null },
                ...Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => ({ label, value: value as ContentType })),
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

        onSearch(ev: Event) {
            this.query = (ev as CustomEvent).detail.value ?? '';
            this.applyFilters();
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
.btn-outline { --border-radius: 12px; --color: var(--neon-accent); --border-color: var(--neon-accent); }
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

.pill {
    --height: 30px;
    --padding-start: 12px;
    --padding-end: 12px;
    --border-width: 1px;
    --letter-spacing: 0;
    margin: 0;
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
