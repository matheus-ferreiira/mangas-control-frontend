<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
                <IonRefresherContent pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" pulling-text="" refreshing-text="" />
            </IonRefresher>

            <div class="page-top" style="padding: 0 16px 80px;">
                <!-- Header -->
                <div style="display: flex; align-items: flex-start; justify-content: space-between; padding-top: 18px; margin-bottom: 14px;">
                    <div>
                        <div style="font-size: 11px; font-weight: 700; color: #4a5470; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px;">Bem-vindo de volta</div>
                        <div style="font-size: 22px; font-weight: 900; color: #eef2ff; letter-spacing: -0.03em;">Minha Biblioteca</div>
                    </div>
                    <div
                        style="width: 40px; height: 40px; border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; margin-top: 2px;"
                        :style="{ background: 'linear-gradient(135deg, #00d4aa, #8b5cf6)' }"
                        @click="$router.push('/tabs/profile')"
                    >
                        <img v-if="user?.avatar" :src="user.avatar" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
                        <span v-else style="font-size: 16px; font-weight: 900; color: #fff; line-height: 1;">{{ userInitial }}</span>
                    </div>
                </div>

                <!-- Search bar -->
                <div style="position: relative; margin-bottom: 10px;">
                    <span style="position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #4a5470; font-size: 14px; pointer-events: none;">⌕</span>
                    <input
                        :value="search"
                        placeholder="Buscar na biblioteca..."
                        style="width: 100%; padding: 10px 36px 10px 36px; border-radius: 12px; border: 1px solid #1e2640; background: #141825; color: #eef2ff; font-size: 13px; outline: none; box-sizing: border-box;"
                        @input="onSearch"
                    />
                    <button
                        v-if="search"
                        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #4a5470; cursor: pointer; font-size: 18px; width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center;"
                        @click="search = ''"
                    >×</button>
                </div>

                <!-- Type chips -->
                <div class="no-scrollbar" style="overflow-x: auto; padding-bottom: 2px; margin-bottom: 10px;">
                    <div style="display: flex; gap: 6px; min-width: max-content;">
                        <button
                            v-for="opt in typeOptions"
                            :key="opt.value ?? 'all'"
                            :style="typeChipStyle(opt.value)"
                            @click="activeType = opt.value"
                        >{{ opt.icon }} {{ opt.label }}</button>
                    </div>
                </div>

                <!-- Toolbar: count + sort + filter -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; margin-bottom: 2px;">
                    <span style="font-size: 11px; font-weight: 600; color: #4a5470; flex: 1;">
                        {{ sortedFiltered.length }} {{ sortedFiltered.length === 1 ? 'item' : 'itens' }}
                        <template v-if="search || activeType || activeFilterCount > 0"> · filtrado</template>
                    </span>
                    <div style="display: flex; gap: 6px;">
                        <!-- Sort button -->
                        <button :style="sortBtnStyle" @click="isSortOpen = true">
                            <span :style="{ fontSize: '12px', color: isSortDefault ? '#4a5470' : '#00d4aa' }">{{ sortMeta.icon }}</span>
                            <span :style="{ fontSize: '11px', fontWeight: '700', color: isSortDefault ? '#4a5470' : '#00d4aa', maxWidth: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }">{{ sortMeta.label }}</span>
                            <span :style="{ fontSize: '10px', color: isSortDefault ? '#4a5470' : '#00d4aa', opacity: '0.7' }">▾</span>
                        </button>
                        <!-- Filter button -->
                        <button :style="filterBtnStyle" @click="isFilterOpen = true">
                            <span :style="{ fontSize: '12px', color: activeFilterCount > 0 ? '#8b5cf6' : '#4a5470' }">⊟</span>
                            <span :style="{ fontSize: '11px', fontWeight: '700', color: activeFilterCount > 0 ? '#8b5cf6' : '#4a5470' }">Filtros</span>
                            <span v-if="activeFilterCount > 0" style="width: 16px; height: 16px; border-radius: 8px; background: #8b5cf6; color: #fff; font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center;">{{ activeFilterCount }}</span>
                        </button>
                    </div>
                </div>

                <!-- Loading -->
                <div v-if="loading" style="display: flex; justify-content: center; padding: 64px 0;">
                    <IonSpinner name="crescent" color="primary" />
                </div>

                <!-- Empty library (no items at all) -->
                <div v-else-if="sortedFiltered.length === 0 && userContents.length === 0" style="text-align: center; padding: 64px 0;">
                    <div style="width: 80px; height: 80px; background: #141825; border: 1px solid #1e2640; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <IonIcon :icon="bookOutline" style="font-size: 40px; color: #4a5470;" />
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #eef2ff; margin-bottom: 8px;">Nenhum conteúdo ainda</div>
                    <div style="font-size: 14px; color: #4a5470; margin-bottom: 24px;">Comece a construir sua coleção</div>
                    <button
                        style="padding: 14px 28px; border-radius: 14px; border: none; background: #00d4aa; color: #000; font-size: 14px; font-weight: 800; cursor: pointer;"
                        @click="$router.push('/tabs/add')"
                    >Adicionar Primeiro Item</button>
                </div>

                <!-- No filter results -->
                <div v-else-if="sortedFiltered.length === 0" style="text-align: center; padding: 40px 24px;">
                    <div style="font-size: 40px; margin-bottom: 14px; opacity: 0.6;">📭</div>
                    <div style="font-size: 15px; font-weight: 700; color: #7a87a8; margin-bottom: 6px;">Nenhum item encontrado</div>
                    <div style="font-size: 12px; color: #4a5470;">Tente ajustar os filtros ou explore o acervo</div>
                </div>

                <!-- Cards list -->
                <div v-else>
                    <ContentCard
                        v-for="item in sortedFiltered"
                        :key="item.id"
                        :item="item"
                        @click="$router.push(`/content/${item.id}`)"
                        @plusOne="incrementItem"
                    />
                </div>
            </div>
        </IonContent>

        <!-- ── Sort Sheet ── -->
        <IonModal
            :is-open="isSortOpen"
            :initial-breakpoint="0.72"
            :breakpoints="[0, 0.72, 1]"
            :handle="true"
            handle-behavior="cycle"
            class="sort-modal"
            @didDismiss="isSortOpen = false"
        >
            <IonContent class="sort-modal-content">
                <div style="padding: 4px 16px 8px;">
                    <div style="font-size: 16px; font-weight: 800; color: #eef2ff; letter-spacing: -0.02em; margin-bottom: 12px;">Ordenar por</div>
                    <button
                        v-for="opt in sortOptions"
                        :key="opt.id"
                        :style="sortOptionStyle(opt.id)"
                        @click="setSort(opt.id)"
                    >
                        <div :style="sortIconBoxStyle(opt.id)">{{ opt.icon }}</div>
                        <div style="flex: 1; min-width: 0; text-align: left;">
                            <div :style="{ fontSize: '13px', fontWeight: '700', color: sortBy === opt.id ? '#00d4aa' : '#eef2ff' }">{{ opt.label }}</div>
                            <div style="font-size: 11px; color: #4a5470; margin-top: 1px;">{{ opt.desc }}</div>
                        </div>
                        <div v-if="sortBy === opt.id" style="width: 22px; height: 22px; border-radius: 11px; background: #00d4aa; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <span style="font-size: 11px; color: #000; font-weight: 900;">✓</span>
                        </div>
                    </button>
                </div>
            </IonContent>
        </IonModal>

        <!-- ── Filter Modal ── -->
        <IonModal
            :is-open="isFilterOpen"
            :initial-breakpoint="0.92"
            :breakpoints="[0, 0.92, 1]"
            :handle="true"
            handle-behavior="cycle"
            class="filter-modal"
            @didDismiss="isFilterOpen = false"
        >
            <IonHeader class="filter-modal-header">
                <div style="padding: 8px 20px 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: 18px; font-weight: 800; color: #eef2ff; letter-spacing: -0.02em;">Filtros avançados</div>
                            <div v-if="activeFilterCount > 0" style="font-size: 11px; color: #00d4aa; font-weight: 600; margin-top: 2px;">{{ activeFilterCount }} filtro{{ activeFilterCount > 1 ? 's' : '' }} ativo{{ activeFilterCount > 1 ? 's' : '' }}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button
                                style="padding: 7px 14px; border-radius: 10px; border: 1px solid #1e2640; background: transparent; color: #4a5470; cursor: pointer; font-size: 12px; font-weight: 700;"
                                @click="clearFilters"
                            >Limpar</button>
                            <button
                                style="width: 32px; height: 32px; border-radius: 16px; border: 1px solid #1e2640; background: transparent; color: #4a5470; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;"
                                @click="isFilterOpen = false"
                            >×</button>
                        </div>
                    </div>
                </div>
            </IonHeader>

            <IonContent class="filter-modal-content">
                <div style="padding: 0 20px 100px;">
                    <!-- Status do usuário -->
                    <div style="margin-bottom: 24px;">
                        <div class="section-label">Status</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button
                                v-for="opt in statusOptions"
                                :key="opt.value"
                                :style="userStatusChipStyle(opt.value, opt.color)"
                                @click="toggleStatus(opt.value)"
                            >
                                <span :style="{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: '0', background: filterStatuses.includes(opt.value) ? opt.color : '#4a5470', boxShadow: filterStatuses.includes(opt.value) ? `0 0 6px ${opt.color}` : 'none' }"></span>
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Status de publicação -->
                    <div style="margin-bottom: 24px;">
                        <div class="section-label">Status de publicação</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button
                                v-for="[key, val] in catStatusEntries"
                                :key="key"
                                :style="catStatusChipStyle(key, val.color)"
                                @click="toggleCatStatus(key)"
                            >
                                <span :style="{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: '0', background: filterCatStatuses.includes(key) ? val.color : '#4a5470', boxShadow: filterCatStatuses.includes(key) ? `0 0 6px ${val.color}` : 'none' }"></span>
                                {{ val.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Gêneros -->
                    <div style="margin-bottom: 24px;">
                        <div class="section-label">Gêneros</div>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <button
                                v-for="g in genresList"
                                :key="g"
                                :style="genreChipStyle(g)"
                                @click="toggleGenre(g)"
                            >{{ g }}</button>
                        </div>
                    </div>

                    <!-- Outros -->
                    <div style="margin-bottom: 8px;">
                        <div class="section-label">Outros</div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div
                                style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 14px; background: #1a2035; border: 1px solid #1e2640; cursor: pointer;"
                                @click="filterRecentOnly = !filterRecentOnly"
                            >
                                <div>
                                    <div style="font-size: 13px; font-weight: 700; color: #eef2ff;">⚡ Atualizados recentemente</div>
                                    <div style="font-size: 11px; color: #4a5470; margin-top: 2px;">Últimos 5 dias</div>
                                </div>
                                <div :style="toggleStyle(filterRecentOnly)">
                                    <div :style="toggleKnobStyle(filterRecentOnly)"></div>
                                </div>
                            </div>
                            <div
                                style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 14px; background: #1a2035; border: 1px solid #1e2640; cursor: pointer;"
                                @click="filterHasRating = !filterHasRating"
                            >
                                <div>
                                    <div style="font-size: 13px; font-weight: 700; color: #eef2ff;">★ Com avaliação</div>
                                    <div style="font-size: 11px; color: #4a5470; margin-top: 2px;">Que você avaliou</div>
                                </div>
                                <div :style="toggleStyle(filterHasRating)">
                                    <div :style="toggleKnobStyle(filterHasRating)"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>

            <IonFooter class="filter-modal-footer">
                <div style="padding: 12px 20px;">
                    <button :style="applyBtnStyle" @click="isFilterOpen = false">
                        Aplicar filtros
                        <span v-if="activeFilterCount > 0" style="background: rgba(0,0,0,0.25); border-radius: 10px; padding: 2px 8px; font-size: 11px; font-weight: 800;">{{ activeFilterCount }}</span>
                    </button>
                </div>
            </IonFooter>
        </IonModal>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent, IonIcon, IonSpinner, IonModal, IonHeader, IonFooter,
    IonRefresher, IonRefresherContent, toastController,
} from '@ionic/vue';
import { bookOutline } from 'ionicons/icons';
import { userContentService, UserContent, ContentStatus } from '@/services/userContentService';
import { ContentType, CONTENT_TYPE_LABELS } from '@/services/contentService';
import { authStore } from '@/store/auth';
import ContentCard from '@/components/ContentCard.vue';

const SORT_OPTIONS = [
    { id: 'updated_desc', label: 'Atualizado recentemente', icon: '⚡', desc: 'Mais recentes primeiro' },
    { id: 'name_asc',     label: 'Nome A → Z',              icon: '↑',  desc: 'Ordem alfabética' },
    { id: 'name_desc',    label: 'Nome Z → A',              icon: '↓',  desc: 'Ordem inversa' },
    { id: 'note_desc',    label: 'Melhor avaliação',         icon: '★',  desc: 'Maior nota que dei' },
    { id: 'score_desc',   label: 'Mais relevantes',          icon: '◆',  desc: 'Score do conteúdo' },
    { id: 'votes_desc',   label: 'Mais votados',             icon: '👍', desc: 'Mais avaliações' },
];

const TYPE_BADGE: Record<ContentType, { color: string }> = {
    manga:  { color: '#00d4aa' },
    anime:  { color: '#8b5cf6' },
    novel:  { color: '#f59e0b' },
    movie:  { color: '#ec4899' },
    tv:     { color: '#06b6d4' },
};

const STATUS_OPTIONS = [
    { value: 'reading' as ContentStatus,      label: 'Lendo',       color: '#3b82f6' },
    { value: 'completed' as ContentStatus,    label: 'Completo',    color: '#10b981' },
    { value: 'paused' as ContentStatus,       label: 'Pausado',     color: '#f59e0b' },
    { value: 'dropped' as ContentStatus,      label: 'Abandonado',  color: '#ef4444' },
    { value: 'plan_to_read' as ContentStatus, label: 'Quero Ler',   color: '#8b5cf6' },
];

const CAT_STATUS_MAP: Record<string, { label: string; color: string }> = {
    ongoing:   { label: 'Em andamento', color: '#00d4aa' },
    completed: { label: 'Completo',     color: '#10b981' },
    hiatus:    { label: 'Hiato',        color: '#f59e0b' },
    cancelled: { label: 'Cancelado',    color: '#ef4444' },
};

const GENRES_LIST = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica', 'Horror', 'Mistério', 'Romance', 'Seinen', 'Shonen', 'Slice of Life', 'Supernatural', 'Thriller', 'Esportes'];

export default defineComponent({
    name: 'LibraryPage',
    components: {
        IonPage, IonContent, IonIcon, IonSpinner, IonModal, IonHeader, IonFooter,
        IonRefresher, IonRefresherContent, ContentCard,
    },
    data() {
        return {
            loading: false,
            userContents: [] as UserContent[],
            search: '',
            activeType: null as ContentType | null,
            sortBy: 'updated_desc',
            isSortOpen: false,
            isFilterOpen: false,
            filterStatuses: [] as ContentStatus[],
            filterCatStatuses: [] as string[],
            filterGenres: [] as string[],
            filterRecentOnly: false,
            filterHasRating: false,
            // Statics
            sortOptions: SORT_OPTIONS,
            statusOptions: STATUS_OPTIONS,
            genresList: GENRES_LIST,
            catStatusEntries: Object.entries(CAT_STATUS_MAP) as [string, { label: string; color: string }][],
            typeOptions: [
                { label: 'Todos', value: null as ContentType | null, icon: '◈' },
                { label: CONTENT_TYPE_LABELS.manga, value: 'manga' as ContentType, icon: '📖' },
                { label: CONTENT_TYPE_LABELS.anime, value: 'anime' as ContentType, icon: '🎬' },
                { label: CONTENT_TYPE_LABELS.novel, value: 'novel' as ContentType, icon: '📝' },
                { label: CONTENT_TYPE_LABELS.movie, value: 'movie' as ContentType, icon: '🎥' },
                { label: CONTENT_TYPE_LABELS.tv,    value: 'tv' as ContentType,    icon: '📺' },
            ],
            bookOutline,
        };
    },
    computed: {
        user() { return authStore.user; },
        userInitial(): string {
            const name = authStore.user?.name ?? '';
            return name.charAt(0).toUpperCase() || 'U';
        },
        sortMeta() {
            return SORT_OPTIONS.find(o => o.id === this.sortBy) ?? SORT_OPTIONS[0];
        },
        isSortDefault(): boolean {
            return this.sortBy === 'updated_desc';
        },
        activeFilterCount(): number {
            let n = 0;
            if (this.filterStatuses.length)    n++;
            if (this.filterCatStatuses.length) n++;
            if (this.filterGenres.length)      n++;
            if (this.filterRecentOnly)         n++;
            if (this.filterHasRating)          n++;
            return n;
        },
        sortedFiltered(): UserContent[] {
            let result = [...this.userContents];

            // Type (quick chip)
            if (this.activeType) {
                result = result.filter(i => i.content?.type === this.activeType);
            }

            // Search
            if (this.search.trim()) {
                const q = this.search.toLowerCase();
                result = result.filter(i =>
                    i.content?.name?.toLowerCase().includes(q) ||
                    i.content?.alternative_names?.some(n => n.toLowerCase().includes(q))
                );
            }

            // Advanced: user status
            if (this.filterStatuses.length) {
                result = result.filter(i => this.filterStatuses.includes(i.status));
            }

            // Advanced: catalog status
            if (this.filterCatStatuses.length) {
                result = result.filter(i =>
                    i.content?.status && this.filterCatStatuses.includes(i.content.status)
                );
            }

            // Advanced: genres
            if (this.filterGenres.length) {
                result = result.filter(i =>
                    i.content?.genres?.some(g => this.filterGenres.includes(g))
                );
            }

            // Advanced: recent only
            if (this.filterRecentOnly) {
                result = result.filter(i => {
                    const d = i.last_unit_update ?? i.content?.last_unit_update;
                    return d ? (Date.now() - new Date(d).getTime()) < 5 * 86400000 : false;
                });
            }

            // Advanced: has rating
            if (this.filterHasRating) {
                result = result.filter(i => i.rating != null);
            }

            // Sort
            return result.sort((a, b) => {
                switch (this.sortBy) {
                    case 'updated_desc': {
                        const da = new Date(a.last_unit_update ?? a.content?.last_unit_update ?? 0).getTime();
                        const db = new Date(b.last_unit_update ?? b.content?.last_unit_update ?? 0).getTime();
                        return db - da;
                    }
                    case 'name_asc':  return (a.content?.name ?? '').localeCompare(b.content?.name ?? '', 'pt');
                    case 'name_desc': return (b.content?.name ?? '').localeCompare(a.content?.name ?? '', 'pt');
                    case 'note_desc': return (b.rating ?? -1) - (a.rating ?? -1);
                    case 'score_desc': return (b.content?.score ?? 0) - (a.content?.score ?? 0);
                    case 'votes_desc': return (b.content?.votes_count ?? 0) - (a.content?.votes_count ?? 0);
                    default: return 0;
                }
            });
        },
        sortBtnStyle(): Record<string, string> {
            const active = !this.isSortDefault;
            return {
                display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
                borderRadius: '20px', border: 'none', cursor: 'pointer',
                background: active ? 'rgba(0,212,170,0.1)' : '#141825',
                outline: active ? '1.5px solid rgba(0,212,170,0.4)' : '1px solid #1e2640',
                transition: 'all 0.18s',
            };
        },
        filterBtnStyle(): Record<string, string> {
            const active = this.activeFilterCount > 0;
            return {
                display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
                borderRadius: '20px', border: 'none', cursor: 'pointer', position: 'relative',
                background: active ? 'rgba(139,92,246,0.1)' : '#141825',
                outline: active ? '1.5px solid rgba(139,92,246,0.4)' : '1px solid #1e2640',
                transition: 'all 0.18s',
            };
        },
        applyBtnStyle(): Record<string, string> {
            return {
                width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                background: '#00d4aa', color: '#000', cursor: 'pointer', fontSize: '14px',
                fontWeight: '800', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
            };
        },
    },
    async ionViewWillEnter() {
        await this.loadContents();
    },
    methods: {
        async loadContents() {
            this.loading = true;
            try {
                this.userContents = await userContentService.getAll();
            } catch {
                const toast = await toastController.create({ message: 'Falha ao carregar biblioteca.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.loading = false;
            }
        },

        onSearch(ev: Event) {
            this.search = (ev.target as HTMLInputElement).value;
        },

        setSort(id: string) {
            this.sortBy = id;
            this.isSortOpen = false;
        },

        toggleStatus(val: ContentStatus) {
            const idx = this.filterStatuses.indexOf(val);
            if (idx >= 0) this.filterStatuses.splice(idx, 1);
            else this.filterStatuses.push(val);
        },

        toggleCatStatus(key: string) {
            const idx = this.filterCatStatuses.indexOf(key);
            if (idx >= 0) this.filterCatStatuses.splice(idx, 1);
            else this.filterCatStatuses.push(key);
        },

        toggleGenre(g: string) {
            const idx = this.filterGenres.indexOf(g);
            if (idx >= 0) this.filterGenres.splice(idx, 1);
            else this.filterGenres.push(g);
        },

        clearFilters() {
            this.filterStatuses = [];
            this.filterCatStatuses = [];
            this.filterGenres = [];
            this.filterRecentOnly = false;
            this.filterHasRating = false;
        },

        async incrementItem(itemId: number) {
            try {
                const updated = await userContentService.increment(itemId);
                const idx = this.userContents.findIndex(i => i.id === itemId);
                if (idx !== -1) {
                    if (updated.content === undefined && this.userContents[idx].content) {
                        updated.content = this.userContents[idx].content;
                    }
                    this.userContents[idx] = updated;
                }
            } catch {
                // silent
            }
        },

        async handleRefresh(event: CustomEvent) {
            await this.loadContents();
            (event.target as HTMLIonRefresherElement).complete();
        },

        // ── Style helpers ──
        typeChipStyle(type: ContentType | null): Record<string, string> {
            const active = this.activeType === type;
            const col = type ? (TYPE_BADGE[type]?.color ?? '#00d4aa') : '#00d4aa';
            return {
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: '20px', border: 'none',
                cursor: 'pointer', flexShrink: '0', fontSize: '11px', fontWeight: '700',
                whiteSpace: 'nowrap',
                background: active ? col + '22' : '#141825',
                color: active ? col : '#7a87a8',
                outline: active ? `1.5px solid ${col}44` : '1px solid #1e2640',
                transition: 'all 0.18s ease',
            };
        },

        userStatusChipStyle(val: ContentStatus, color: string): Record<string, string> {
            const active = this.filterStatuses.includes(val);
            return {
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: '700',
                background: active ? color + '20' : '#1a2035',
                color: active ? color : '#7a87a8',
                outline: active ? `1.5px solid ${color}55` : '1px solid #1e2640',
                transition: 'all 0.18s',
            };
        },

        catStatusChipStyle(key: string, color: string): Record<string, string> {
            const active = this.filterCatStatuses.includes(key);
            return {
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: '700',
                background: active ? color + '20' : '#1a2035',
                color: active ? color : '#7a87a8',
                outline: active ? `1.5px solid ${color}55` : '1px solid #1e2640',
                transition: 'all 0.18s',
            };
        },

        genreChipStyle(g: string): Record<string, string> {
            const active = this.filterGenres.includes(g);
            return {
                padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: '700',
                background: active ? 'rgba(0,212,170,0.2)' : '#1a2035',
                color: active ? '#00d4aa' : '#7a87a8',
                outline: active ? '1.5px solid rgba(0,212,170,0.4)' : '1px solid #1e2640',
                transition: 'all 0.15s',
            };
        },

        sortOptionStyle(id: string): Record<string, string> {
            const active = this.sortBy === id;
            return {
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                marginBottom: '6px',
                background: active ? 'rgba(0,212,170,0.1)' : 'transparent',
                outline: active ? '1.5px solid rgba(0,212,170,0.4)' : '1px solid #1e2640',
                textAlign: 'left', transition: 'all 0.15s',
            };
        },

        sortIconBoxStyle(id: string): Record<string, string> {
            const active = this.sortBy === id;
            return {
                width: '38px', height: '38px', borderRadius: '12px', flexShrink: '0',
                background: active ? 'rgba(0,212,170,0.25)' : '#1a2035',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', color: active ? '#00d4aa' : '#4a5470',
            };
        },

        toggleStyle(active: boolean): Record<string, string> {
            return {
                width: '44px', height: '26px', borderRadius: '13px', position: 'relative',
                background: active ? '#00d4aa' : '#1e2640',
                transition: 'background 0.2s', flexShrink: '0',
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
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.section-label {
    font-size: 10px;
    font-weight: 800;
    color: #4a5470;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
}
</style>

<style>
ion-modal.sort-modal::part(content) {
    background: #141825;
    border-top: 1px solid #1e2640;
}
ion-modal.filter-modal::part(content) {
    background: #0b0f1a;
    border-top: 1px solid #1e2640;
}
.sort-modal-content   { --background: #141825; }
.filter-modal-content { --background: #0b0f1a; }
.filter-modal-header  { --background: #0b0f1a; box-shadow: none; }
.filter-modal-footer  { --background: #0b0f1a; border-top: 1px solid #1e2640; box-shadow: none; }
</style>
