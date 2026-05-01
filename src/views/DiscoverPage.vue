<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page-top" style="padding: 0 16px 80px;">
                <!-- Header -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 18px; margin-bottom: 14px;">
                    <div style="font-size: 22px; font-weight: 900; color: #eef2ff; letter-spacing: -0.03em;">Catálogo</div>
                    <button
                        v-if="isAdmin"
                        style="width: 32px; height: 32px; border-radius: 10px; border: 1px solid #1e2640; background: transparent; color: #4a5470; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px;"
                        @click="$router.push('/manage-contents')"
                    >⚙</button>
                </div>

                <!-- Search bar -->
                <div style="position: relative; margin-bottom: 10px;">
                    <span style="position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #4a5470; font-size: 14px; pointer-events: none;">⌕</span>
                    <input
                        :value="query"
                        placeholder="Buscar por nome ou título alternativo..."
                        style="width: 100%; padding: 10px 36px 10px 36px; border-radius: 12px; border: 1px solid #1e2640; background: #141825; color: #eef2ff; font-size: 13px; outline: none; box-sizing: border-box; transition: border-color 0.2s;"
                        @input="onSearchInput"
                    />
                    <button
                        v-if="query"
                        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #4a5470; cursor: pointer; font-size: 18px; width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center;"
                        @click="clearQuery"
                    >×</button>
                </div>

                <!-- Type chips -->
                <div class="no-scrollbar" style="overflow-x: auto; padding-bottom: 2px; margin-bottom: 10px;">
                    <div style="display: flex; gap: 6px; min-width: max-content;">
                        <button
                            v-for="opt in typeOptions"
                            :key="opt.value ?? 'all'"
                            :style="typeChipStyle(opt.value)"
                            @click="setType(opt.value)"
                        >{{ opt.icon }} {{ opt.label }}</button>
                    </div>
                </div>

                <!-- Toolbar: count + sort + filter -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; margin-bottom: 2px;">
                    <span style="font-size: 11px; font-weight: 600; color: #4a5470; flex: 1;">
                        <template v-if="meta.total > 0">{{ meta.total.toLocaleString('pt-BR') }} obras</template>
                        <template v-else-if="!loading">Nenhum resultado</template>
                        <template v-if="hasActiveFilters"> · filtrado</template>
                    </span>
                    <div style="display: flex; gap: 6px;">
                        <!-- Sort button -->
                        <button
                            :style="sortBtnStyle"
                            @click="isSortOpen = true"
                        >
                            <span :style="{ fontSize: '12px', color: isSortDefault ? '#4a5470' : '#00d4aa' }">{{ sortMeta.icon }}</span>
                            <span :style="{ fontSize: '11px', fontWeight: '700', color: isSortDefault ? '#4a5470' : '#00d4aa', maxWidth: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }">{{ sortMeta.label }}</span>
                            <span :style="{ fontSize: '10px', color: isSortDefault ? '#4a5470' : '#00d4aa', opacity: '0.7' }">▾</span>
                        </button>
                        <!-- Filter button -->
                        <button
                            :style="filterBtnStyle"
                            @click="openFilterModal"
                        >
                            <span :style="{ fontSize: '12px', color: activeFilterCount > 0 ? '#8b5cf6' : '#4a5470' }">⊟</span>
                            <span :style="{ fontSize: '11px', fontWeight: '700', color: activeFilterCount > 0 ? '#8b5cf6' : '#4a5470' }">Filtros</span>
                            <span v-if="activeFilterCount > 0" style="width: 16px; height: 16px; border-radius: 8px; background: #8b5cf6; color: #fff; font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center;">{{ activeFilterCount }}</span>
                        </button>
                    </div>
                </div>

                <!-- Skeleton loading -->
                <div v-if="loading && contents.length === 0">
                    <div
                        v-for="i in 8"
                        :key="i"
                        style="background: #1a2035; border: 1px solid #1e2640; border-radius: 16px; padding: 14px; display: flex; gap: 12px; margin-bottom: 10px; animation: pulse 1.4s ease-in-out infinite;"
                    >
                        <div style="width: 44px; height: 62px; border-radius: 8px; background: #141825; flex-shrink: 0;"></div>
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px; padding-top: 4px;">
                            <div style="height: 10px; border-radius: 4px; width: 30%; background: #141825;"></div>
                            <div style="height: 14px; border-radius: 4px; width: 65%; background: #141825;"></div>
                            <div style="height: 10px; border-radius: 4px; width: 50%; background: #141825;"></div>
                        </div>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-else-if="!loading && contents.length === 0" style="text-align: center; padding: 60px 24px;">
                    <div style="font-size: 40px; margin-bottom: 14px; opacity: 0.6;">🔍</div>
                    <div style="font-size: 15px; font-weight: 700; color: #7a87a8; margin-bottom: 6px;">Nenhuma obra encontrada</div>
                    <div style="font-size: 12px; color: #4a5470; margin-bottom: 20px;">{{ query ? 'Tente uma busca diferente' : 'Tente ajustar os filtros' }}</div>
                    <button
                        v-if="hasActiveFilters"
                        style="padding: 10px 20px; border-radius: 12px; border: 1px solid #1e2640; background: transparent; color: #4a5470; cursor: pointer; font-size: 13px; font-weight: 700;"
                        @click="resetFilters"
                    >Limpar filtros</button>
                </div>

                <!-- Cards list -->
                <div v-else>
                    <template v-for="content in contents" :key="content.id">
                        <!-- CatalogCard -->
                        <div style="background: #1a2035; border: 1px solid #1e2640; border-radius: 16px; margin-bottom: 10px; overflow: hidden;">
                            <div style="display: flex; gap: 12px; padding: 14px; cursor: pointer; align-items: flex-start;" @click="openDetail(content)">
                                <!-- Cover 44px -->
                                <div style="flex-shrink: 0; border-radius: 8px; overflow: hidden; width: 44px; height: 62px; background: #141825; display: flex; align-items: center; justify-content: center;">
                                    <img
                                        v-if="content.cover && !coverErrors[content.id]"
                                        :src="content.cover"
                                        :alt="content.name"
                                        style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                        @error="coverErrors[content.id] = true"
                                    />
                                    <span v-else :style="{ fontSize: '20px', color: typeBadgeColor(content.type) + '88' }">{{ typeIcon(content.type) }}</span>
                                </div>

                                <!-- Info -->
                                <div style="flex: 1; min-width: 0;">
                                    <!-- Badges row -->
                                    <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 5px; flex-wrap: wrap;">
                                        <span :style="typeBadgeStyle(content.type)">{{ typeLabel(content.type) }}</span>
                                        <span v-if="content.status" :style="catStatusBadgeStyle(content.status)">{{ catalogStatusLabel(content.status) }}</span>
                                        <span v-if="content.is_adult" style="font-size: 9px; font-weight: 800; color: #ef4444; background: rgba(239,68,68,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em; flex-shrink: 0;">+18</span>
                                        <span v-if="content.score && content.score >= 9" style="font-size: 9px; font-weight: 800; color: #f59e0b; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em; flex-shrink: 0;">TOP</span>
                                        <span v-if="content.is_in_library" style="font-size: 9px; font-weight: 800; color: #00d4aa; background: rgba(0,212,170,0.12); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em; flex-shrink: 0;">✓ Na lista</span>
                                    </div>

                                    <!-- Title -->
                                    <div style="font-size: 14px; font-weight: 800; color: #eef2ff; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em;">
                                        {{ content.name }}
                                    </div>

                                    <!-- Alt names -->
                                    <div
                                        v-if="content.alternative_names?.length"
                                        style="font-size: 10px; color: #4a5470; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                                    >{{ content.alternative_names[0] }}</div>

                                    <!-- Meta row -->
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px; flex-wrap: wrap;">
                                        <span v-if="content.rating != null" style="display: inline-flex; align-items: center; gap: 3px; font-size: 11px; color: #f59e0b; font-weight: 700;">★ <span style="color: #7a87a8;">{{ content.rating.toFixed(1) }}</span></span>
                                        <span v-if="content.release_year" style="font-size: 10px; color: #4a5470;">{{ content.release_year }}</span>
                                        <span v-if="content.total_units" style="font-size: 10px; color: #4a5470;">· {{ content.total_units }} {{ typeUnit(content.type) }}</span>
                                        <span v-else-if="content.release_year" style="font-size: 10px; color: #4a5470;">· Em andamento</span>
                                        <span v-if="content.last_unit_update" style="font-size: 10px; color: #4a5470;">· {{ timeAgo(content.last_unit_update) }}</span>
                                    </div>

                                    <!-- Genres -->
                                    <div v-if="content.genres?.length" style="display: flex; gap: 4px; flex-wrap: nowrap; overflow: hidden;">
                                        <span
                                            v-for="g in content.genres.slice(0, 3)"
                                            :key="g"
                                            style="font-size: 9px; color: #4a5470; background: #141825; padding: 2px 6px; border-radius: 4px; white-space: nowrap; border: 1px solid #1e2640;"
                                        >{{ g }}</span>
                                        <span v-if="content.genres.length > 3" style="font-size: 9px; color: #4a5470;">+{{ content.genres.length - 3 }}</span>
                                    </div>
                                </div>

                                <!-- Action buttons -->
                                <div style="display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;">
                                    <button
                                        v-if="isAdmin"
                                        style="width: 32px; height: 32px; border-radius: 10px; border: 1px solid #1e2640; cursor: pointer; background: transparent; color: #4a5470; font-size: 13px; display: flex; align-items: center; justify-content: center;"
                                        @click.stop="$router.push('/manage-contents')"
                                    >✏</button>
                                    <button
                                        :style="addBtnStyle(content)"
                                        @click.stop="addToLibrary(content)"
                                    >{{ content.is_in_library ? '✓' : '+' }}</button>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Infinite Scroll -->
            <IonInfiniteScroll
                :disabled="meta.current_page >= meta.last_page"
                threshold="200px"
                @ionInfinite="handleInfiniteScroll"
            >
                <IonInfiniteScrollContent loading-text="Carregando mais..." />
            </IonInfiniteScroll>
        </IonContent>

        <!-- ── Sort Sheet Modal ── -->
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
                            <div :style="{ fontSize: '13px', fontWeight: '700', color: sortById === opt.id ? '#00d4aa' : '#eef2ff' }">{{ opt.label }}</div>
                            <div style="font-size: 11px; color: #4a5470; margin-top: 1px;">{{ opt.desc }}</div>
                        </div>
                        <div v-if="sortById === opt.id" style="width: 22px; height: 22px; border-radius: 11px; background: #00d4aa; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
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
                                @click="clearAdvancedFilters"
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
                    <!-- Tipo -->
                    <div style="margin-bottom: 24px;">
                        <div class="section-label">Tipo</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button
                                v-for="opt in typeOptions.filter(o => o.value !== null)"
                                :key="opt.value ?? 'none'"
                                :style="filterTypeChipStyle(opt.value as ContentType)"
                                @click="toggleFilterType(opt.value as ContentType)"
                            >
                                <span style="font-size: 14px;">{{ opt.icon }}</span>
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Status de publicação -->
                    <div style="margin-bottom: 24px;">
                        <div class="section-label">Status de publicação</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button
                                v-for="[key, val] in Object.entries(catStatusOptions)"
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

                    <!-- Ano de lançamento -->
                    <div style="margin-bottom: 24px; background: #1a2035; border-radius: 16px; padding: 16px 18px; border: 1px solid #1e2640;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <div class="section-label" style="margin-bottom: 0;">Ano de lançamento</div>
                            <span style="font-size: 11px; font-weight: 700; color: #00d4aa;">{{ filterYearMin ?? 1970 }} – {{ filterYearMax ?? currentYear }}</span>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <div style="flex: 1;">
                                <div style="font-size: 10px; color: #4a5470; margin-bottom: 4px;">De</div>
                                <input
                                    :value="filterYearMin ?? ''"
                                    type="number"
                                    placeholder="1970"
                                    class="filter-input"
                                    @input="filterYearMin = ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null"
                                />
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 10px; color: #4a5470; margin-bottom: 4px;">Até</div>
                                <input
                                    :value="filterYearMax ?? ''"
                                    type="number"
                                    :placeholder="String(currentYear)"
                                    class="filter-input"
                                    @input="filterYearMax = ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Avaliação mínima -->
                    <div style="margin-bottom: 24px; background: #1a2035; border-radius: 16px; padding: 16px 18px; border: 1px solid #1e2640;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <div class="section-label" style="margin-bottom: 0;">Avaliação mínima</div>
                            <span style="font-size: 11px; font-weight: 700; color: #00d4aa;">{{ filterScoreMin ? filterScoreMin.toFixed(1) : 'Qualquer' }}</span>
                        </div>
                        <input
                            :value="filterScoreMin ?? 0"
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            style="width: 100%; accent-color: #00d4aa;"
                            @input="filterScoreMin = Number(($event.target as HTMLInputElement).value) || null"
                        />
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #4a5470; margin-top: 4px;"><span>0</span><span>5</span><span>10</span></div>
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
                        </div>
                    </div>
                </div>
            </IonContent>

            <IonFooter class="filter-modal-footer">
                <div style="padding: 12px 20px;">
                    <button :style="applyBtnStyle" @click="applyFilters">
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
    IonPage, IonContent, IonInfiniteScroll, IonInfiniteScrollContent,
    IonModal, IonHeader, IonFooter, toastController,
} from '@ionic/vue';
import {
    contentService, Content, ContentType, ContentCatalogStatus, ContentSortField, ContentMeta,
    CONTENT_TYPE_LABELS, CATALOG_STATUS_LABELS, CATALOG_STATUS_COLORS,
} from '@/services/contentService';
import { authStore } from '@/store/auth';

const SORT_OPTIONS = [
    { id: 'updated_desc', label: 'Atualizado recentemente', icon: '⚡', desc: 'Mais recentes primeiro', apiSort: 'updated_at' as ContentSortField, apiOrder: 'desc' as const },
    { id: 'score_desc',   label: 'Mais relevantes',         icon: '◆',  desc: 'Score combinado',        apiSort: 'score' as ContentSortField,      apiOrder: 'desc' as const },
    { id: 'popular',      label: 'Mais populares',          icon: '🔥', desc: 'Maior audiência',        apiSort: 'popularity' as ContentSortField, apiOrder: 'desc' as const },
    { id: 'note_desc',    label: 'Melhor avaliação',        icon: '★',  desc: 'Maior nota primeiro',    apiSort: 'rating' as ContentSortField,     apiOrder: 'desc' as const },
    { id: 'votes_desc',   label: 'Mais votados',            icon: '👍', desc: 'Mais avaliações',        apiSort: 'votes_count' as ContentSortField, apiOrder: 'desc' as const },
    { id: 'name_asc',     label: 'Nome A → Z',              icon: '↑',  desc: 'Ordem alfabética',       apiSort: 'name' as ContentSortField,       apiOrder: 'asc' as const },
    { id: 'name_desc',    label: 'Nome Z → A',              icon: '↓',  desc: 'Ordem inversa',           apiSort: 'name' as ContentSortField,       apiOrder: 'desc' as const },
];

const TYPE_BADGE: Record<ContentType, { color: string; icon: string; unit: string }> = {
    manga:  { color: '#00d4aa', icon: '📖', unit: 'cap.' },
    anime:  { color: '#8b5cf6', icon: '🎬', unit: 'ep.' },
    novel:  { color: '#f59e0b', icon: '📝', unit: 'cap.' },
    movie:  { color: '#ec4899', icon: '🎥', unit: '' },
    tv:     { color: '#06b6d4', icon: '📺', unit: 'ep.' },
};

const CAT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
    ongoing:   { label: 'Em andamento', color: '#00d4aa' },
    completed: { label: 'Completo',     color: '#10b981' },
    hiatus:    { label: 'Hiato',        color: '#f59e0b' },
    cancelled: { label: 'Cancelado',    color: '#ef4444' },
};

const GENRES_LIST = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica', 'Horror', 'Mistério', 'Romance', 'Seinen', 'Shonen', 'Slice of Life', 'Supernatural', 'Thriller', 'Esportes'];

const EMPTY_META: ContentMeta = { current_page: 1, last_page: 1, per_page: 20, total: 0, from: 0, to: 0 };

export default defineComponent({
    name: 'DiscoverPage',
    components: {
        IonPage, IonContent, IonInfiniteScroll, IonInfiniteScrollContent,
        IonModal, IonHeader, IonFooter,
    },
    data() {
        return {
            loading: false,
            contents: [] as Content[],
            meta: { ...EMPTY_META } as ContentMeta,
            query: '',
            activeType: null as ContentType | null,
            sortById: 'score_desc',
            // Advanced filters
            filterCatStatuses: [] as string[],
            filterGenres: [] as string[],
            filterYearMin: null as number | null,
            filterYearMax: null as number | null,
            filterScoreMin: null as number | null,
            filterRecentOnly: false,
            filterIsAdult: null as boolean | null,
            // UI state
            searchTimer: null as ReturnType<typeof setTimeout> | null,
            isSortOpen: false,
            isFilterOpen: false,
            coverErrors: {} as Record<number, boolean>,
            currentYear: new Date().getFullYear(),
            // Statics
            sortOptions: SORT_OPTIONS,
            catStatusOptions: CAT_STATUS_LABELS,
            genresList: GENRES_LIST,
            typeOptions: [
                { label: 'Todos', value: null as ContentType | null, icon: '◈' },
                { label: 'Manga',  value: 'manga' as ContentType,  icon: '📖' },
                { label: 'Anime',  value: 'anime' as ContentType,  icon: '🎬' },
                { label: 'Novel',  value: 'novel' as ContentType,  icon: '📝' },
                { label: 'Filme',  value: 'movie' as ContentType,  icon: '🎥' },
                { label: 'Série',  value: 'tv' as ContentType,     icon: '📺' },
            ],
        };
    },
    computed: {
        sortMeta() {
            return SORT_OPTIONS.find(o => o.id === this.sortById) ?? SORT_OPTIONS[0];
        },
        isSortDefault(): boolean {
            return this.sortById === 'score_desc';
        },
        activeFilterCount(): number {
            let n = 0;
            if (this.filterCatStatuses.length) n++;
            if (this.filterGenres.length) n++;
            if (this.filterYearMin || this.filterYearMax) n++;
            if (this.filterScoreMin) n++;
            if (this.filterRecentOnly) n++;
            if (this.filterIsAdult != null) n++;
            return n;
        },
        hasActiveFilters(): boolean {
            return !!(this.query || this.activeType || this.activeFilterCount > 0);
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
        isAdmin(): boolean {
            return authStore.user?.role === 'admin';
        },
    },
    async ionViewWillEnter() {
        this.readURL();
        await this.loadContents();
    },
    methods: {
        buildFilters() {
            const opt = this.sortMeta;
            return {
                type: this.activeType ?? undefined,
                search: this.query.trim() || undefined,
                sort: opt.apiSort,
                order: opt.apiOrder,
                per_page: 20,
                ...(this.filterCatStatuses.length === 1 ? { status: this.filterCatStatuses[0] as ContentCatalogStatus } : {}),
                ...(this.filterGenres.length ? { genres: this.filterGenres } : {}),
                ...(this.filterYearMin ? { year_min: this.filterYearMin } : {}),
                ...(this.filterYearMax ? { year_max: this.filterYearMax } : {}),
                ...(this.filterScoreMin ? { rating_min: this.filterScoreMin } : {}),
                ...(this.filterRecentOnly ? { recent: true } : {}),
                ...(this.filterIsAdult != null ? { is_adult: this.filterIsAdult } : {}),
            };
        },

        async loadContents() {
            this.loading = true;
            this.contents = [];
            try {
                const result = await contentService.getAll({ ...this.buildFilters(), page: 1 });
                this.contents = result.items;
                this.meta = result.meta;
                this.syncURL();
            } catch {
                // silencioso
            } finally {
                this.loading = false;
            }
        },

        async handleInfiniteScroll(event: any) {
            const nextPage = this.meta.current_page + 1;
            if (nextPage > this.meta.last_page) { event.target.complete(); return; }
            try {
                const result = await contentService.getAll({ ...this.buildFilters(), page: nextPage });
                this.contents.push(...result.items);
                this.meta = result.meta;
            } catch {
                // silencioso
            } finally {
                event.target.complete();
            }
        },

        onSearchInput(ev: Event) {
            this.query = (ev.target as HTMLInputElement).value;
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.loadContents(), 400);
        },

        clearQuery() {
            this.query = '';
            this.loadContents();
        },

        setType(type: ContentType | null) {
            this.activeType = type;
            this.loadContents();
        },

        setSort(id: string) {
            this.sortById = id;
            this.isSortOpen = false;
            this.loadContents();
        },

        openFilterModal() {
            this.isFilterOpen = true;
        },

        applyFilters() {
            this.isFilterOpen = false;
            this.loadContents();
        },

        clearAdvancedFilters() {
            this.filterCatStatuses = [];
            this.filterGenres = [];
            this.filterYearMin = null;
            this.filterYearMax = null;
            this.filterScoreMin = null;
            this.filterRecentOnly = false;
            this.filterIsAdult = null;
        },

        resetFilters() {
            this.query = '';
            this.activeType = null;
            this.clearAdvancedFilters();
            this.loadContents();
        },

        toggleFilterType(type: ContentType | null) {
            if (!type) return;
            if (this.activeType === type) this.activeType = null;
            else this.activeType = type;
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

        syncURL() {
            const q: Record<string, string> = {};
            if (this.query) q.q = this.query;
            if (this.activeType) q.type = this.activeType;
            if (this.sortById !== 'score_desc') q.sort = this.sortById;
            this.$router.replace({ query: q }).catch(() => {});
        },

        readURL() {
            const q = this.$route.query;
            if (q.q) this.query = String(q.q);
            if (q.type) this.activeType = q.type as ContentType;
            if (q.sort) this.sortById = String(q.sort);
        },

        openDetail(content: Content) {
            this.$router.push(`/catalog/${content.id}`);
        },

        async addToLibrary(content: Content) {
            if (content.is_in_library) {
                const toast = await toastController.create({
                    message: 'Já está na sua biblioteca.',
                    duration: 1800,
                    color: 'success',
                    position: 'top',
                });
                await toast.present();
                this.$router.push('/tabs/library');
                return;
            }
            this.$router.push({ path: '/tabs/add', query: { content_id: content.id } });
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

        typeBadgeStyle(type: ContentType): Record<string, string> {
            const col = TYPE_BADGE[type]?.color ?? '#00d4aa';
            return {
                fontSize: '9px', fontWeight: '800', letterSpacing: '0.07em',
                color: col, background: col + '20',
                padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase', flexShrink: '0',
            };
        },

        catStatusBadgeStyle(status: string): Record<string, string> {
            const col = CAT_STATUS_LABELS[status]?.color ?? '#4a5470';
            return {
                fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em',
                color: col, background: col + '18',
                padding: '2px 7px', borderRadius: '20px', flexShrink: '0',
            };
        },

        filterTypeChipStyle(type: ContentType | null): Record<string, string> {
            if (!type) return {};
            const m = TYPE_BADGE[type];
            const active = this.activeType === type;
            return {
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: '800',
                background: active ? m.color + '25' : '#1a2035',
                color: active ? m.color : '#7a87a8',
                outline: active ? `1.5px solid ${m.color}55` : '1px solid #1e2640',
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

        addBtnStyle(content: any): Record<string, string> {
            if (content.is_in_library) {
                return {
                    width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer',
                    border: '1px solid rgba(0,212,170,0.4)', background: 'rgba(0,212,170,0.1)',
                    color: '#00d4aa', fontSize: '14px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', transition: 'all 0.2s',
                };
            }
            return {
                width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer',
                border: '1px solid #1e2640', background: 'transparent', color: '#4a5470',
                fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
            };
        },

        sortOptionStyle(id: string): Record<string, string> {
            const active = this.sortById === id;
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
            const active = this.sortById === id;
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

        typeBadgeColor(type: ContentType): string {
            return TYPE_BADGE[type]?.color ?? '#4a5470';
        },

        typeIcon(type: ContentType): string {
            return TYPE_BADGE[type]?.icon ?? '📄';
        },

        typeLabel(type: ContentType): string {
            return CONTENT_TYPE_LABELS[type] ?? type.toUpperCase();
        },

        catalogStatusLabel(status: ContentCatalogStatus): string {
            return CATALOG_STATUS_LABELS[status] ?? status;
        },

        typeUnit(type: ContentType): string {
            return TYPE_BADGE[type]?.unit ?? 'cap.';
        },

        timeAgo(iso: string): string {
            const d = (Date.now() - new Date(iso).getTime()) / 1000;
            if (d < 60) return 'agora';
            if (d < 3600) return `${Math.floor(d / 60)}min`;
            if (d < 86400) return `${Math.floor(d / 3600)}h`;
            if (d < 604800) return `${Math.floor(d / 86400)}d`;
            return `${Math.floor(d / 604800)}sem`;
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

.filter-input {
    width: 100%;
    background: #0b0f1a;
    border: 1px solid #1e2640;
    border-radius: 10px;
    padding: 9px 12px;
    color: #eef2ff;
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
}

.filter-input::placeholder { color: #4a5470; }
.filter-input:focus { border-color: rgba(0,212,170,0.4); }

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
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
.sort-modal-content { --background: #141825; }
.filter-modal-content { --background: #0b0f1a; }
.filter-modal-header { --background: #0b0f1a; box-shadow: none; }
.filter-modal-footer { --background: #0b0f1a; border-top: 1px solid #1e2640; box-shadow: none; }
</style>
