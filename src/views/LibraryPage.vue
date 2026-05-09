<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
                <IonRefresherContent pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" pulling-text="" refreshing-text="" />
            </IonRefresher>

            <div style="padding: 0 0 100px;">
                <!-- ─── Header ─── -->
                <div style="padding: 20px 18px 0;">
                    <div style="font-size: 10px; color: #4a5169; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;">BIBLIOTECA</div>
                    <div style="font-size: 26px; font-weight: 900; color: #eef0f5; letter-spacing: -0.03em; line-height: 1.1;">Minha coleção</div>

                    <!-- Quick stats row — transparent -->
                    <div style="display: flex; gap: 8px; margin-top: 14px;">
                        <div
                            v-for="stat in quickStats"
                            :key="stat.label"
                            style="flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 11px 10px; text-align: center;"
                        >
                            <div :style="{ fontSize: '20px', fontWeight: '900', color: stat.color, letterSpacing: '-0.03em', lineHeight: '1' }">{{ stat.value }}</div>
                            <div style="font-size: 9px; color: #4a5169; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px;">{{ stat.label }}</div>
                        </div>
                    </div>
                </div>

                <!-- ─── Search ─── -->
                <div style="padding: 18px 18px 10px;">
                    <div style="position: relative; display: flex; align-items: center;">
                        <span style="position: absolute; left: 13px; color: #4a5169; pointer-events: none; display: flex; align-items: center;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                        </span>
                        <input
                            :value="search"
                            placeholder="Buscar na biblioteca..."
                            style="width: 100%; padding: 10px 36px 10px 38px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.09); background: transparent; color: #eef0f5; font-size: 13px; outline: none; box-sizing: border-box;"
                            @input="onSearch"
                        />
                        <button
                            v-if="search"
                            style="position: absolute; right: 8px; width: 22px; height: 22px; border-radius: 11px; border: none; background: rgba(255,255,255,0.07); color: #6b738a; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                            @click="search = ''"
                        >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>
                        </button>
                    </div>
                </div>

                <!-- ─── Type chips ─── -->
                <div class="no-scrollbar" style="overflow-x: auto; padding: 0 18px 10px;">
                    <div style="display: flex; gap: 6px; min-width: max-content;">
                        <button
                            v-for="t in typeChips"
                            :key="t.value ?? 'all'"
                            :style="typeChipStyle(t.value)"
                            @click="activeType = activeType === t.value ? null : t.value"
                        >
                            {{ t.label }}
                            <span :style="{ fontSize: '10px', opacity: '0.65', marginLeft: '2px' }">{{ t.count }}</span>
                        </button>
                    </div>
                </div>

                <!-- ─── Sort row ─── -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 18px 14px;">
                    <button
                        v-if="activeFilterCount > 0"
                        style="display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 20px; border: none; cursor: pointer; font-size: 11px; font-weight: 700; background: rgba(167,139,250,0.12); color: #a78bfa;"
                        @click="isFilterOpen = true"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>
                        Filtros
                        <span style="background: #a78bfa; color: #0d1117; border-radius: 8px; padding: 1px 6px; font-size: 9px; font-weight: 800;">{{ activeFilterCount }}</span>
                    </button>
                    <div v-else style="flex: 1;"></div>
                    <button
                        style="display: flex; align-items: center; gap: 5px; background: transparent; border: none; cursor: pointer; padding: 0;"
                        @click="isSortOpen = true"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b738a" stroke-width="1.7" stroke-linecap="round"><path d="M3 7h13M3 12h9M3 17h5M17 17V7M14 14l3 3 3-3"/></svg>
                        <span :style="{ fontSize: '11px', fontWeight: '700', color: isSortDefault ? '#6b738a' : '#5eead4' }">{{ sortMeta.label }}</span>
                    </button>
                </div>

                <!-- ─── Loading skeleton ─── -->
                <div v-if="loading" style="padding: 0 16px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                        <div
                            v-for="i in 12"
                            :key="i"
                            class="skeleton"
                            style="border-radius: 10px;"
                            :style="{ aspectRatio: '2/3', opacity: 1 - i * 0.06 }"
                        ></div>
                    </div>
                </div>

                <!-- ─── Empty: library empty ─── -->
                <div v-else-if="userContents.length === 0" style="text-align: center; padding: 64px 28px;">
                    <div style="width: 72px; height: 72px; border-radius: 36px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a5169" stroke-width="1.7" stroke-linecap="round"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>
                    </div>
                    <div style="font-size: 15px; font-weight: 700; color: #eef0f5; margin-bottom: 6px;">Sua biblioteca está vazia</div>
                    <div style="font-size: 12px; color: #6b738a; line-height: 1.6; margin-bottom: 20px;">Adicione conteúdo do Catálogo para começar</div>
                    <button
                        style="padding: 10px 20px; border-radius: 24px; border: none; background: #5eead4; color: #0d1117; font-weight: 800; font-size: 13px; cursor: pointer;"
                        @click="$router.push('/tabs/discover')"
                    >Explorar Catálogo</button>
                </div>

                <!-- ─── Empty: no filter results ─── -->
                <div v-else-if="sortedFiltered.length === 0" style="text-align: center; padding: 48px 28px;">
                    <div style="font-size: 15px; font-weight: 700; color: #9aa3b8; margin-bottom: 6px;">Nenhum resultado</div>
                    <div style="font-size: 12px; color: #6b738a;">{{ search ? 'Tente outro termo' : 'Tente outros filtros' }}</div>
                </div>

                <!-- ─── Status groups — 3-col poster grid ─── -->
                <template v-else>
                    <div v-for="group in groupedByStatus" :key="group.status" style="margin-bottom: 20px;">
                        <!-- Group header -->
                        <div style="display: flex; align-items: center; gap: 10px; padding: 6px 18px 12px;">
                            <div :style="{ width: '3px', height: '18px', borderRadius: '2px', background: group.color, flexShrink: '0', boxShadow: `0 0 8px ${group.color}55` }"></div>
                            <span style="font-size: 11px; font-weight: 800; color: #eef0f5; text-transform: uppercase; letter-spacing: 0.08em;">{{ group.label }}</span>
                            <span style="font-size: 11px; color: #4a5169; font-weight: 600;">{{ group.items.length }}</span>
                        </div>
                        <!-- 3-column poster grid -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 0 16px;">
                            <div
                                v-for="item in group.items"
                                :key="item.id"
                                class="cover-card"
                                style="position: relative; border-radius: 10px; overflow: hidden; cursor: pointer;"
                                :style="{ aspectRatio: '2/3' }"
                                @click="$router.push(`/catalog/${item.content?.id ?? item.content_id}`)"
                            >
                                <!-- Cover image -->
                                <img
                                    v-if="item.content?.cover"
                                    :src="item.content.cover"
                                    :alt="item.content?.name"
                                    style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;"
                                />
                                <!-- No cover fallback -->
                                <div
                                    v-else
                                    style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;"
                                    :style="{ background: `linear-gradient(135deg, ${typeColor(item.content?.type ?? '')}18, #0a0d14)` }"
                                >
                                    <span
                                        style="font-size: 34px; font-weight: 900; opacity: 0.35;"
                                        :style="{ color: typeColor(item.content?.type ?? '') }"
                                    >{{ typeShortLabel(item.content?.type ?? '') }}</span>
                                </div>
                                <!-- Bottom gradient overlay -->
                                <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,8,14,0.98) 0%, rgba(5,8,14,0.7) 28%, rgba(5,8,14,0.1) 55%, transparent 75%);"></div>
                                <!-- Top-right: status dot -->
                                <div
                                    style="position: absolute; top: 6px; right: 6px; width: 7px; height: 7px; border-radius: 50%;"
                                    :style="{ background: group.color, boxShadow: `0 0 0 2px rgba(5,8,14,0.7)` }"
                                ></div>
                                <!-- Top-left: +1 button -->
                                <button
                                    v-if="item.content?.type !== 'movie' && !isAtLimit(item)"
                                    style="position: absolute; top: 5px; left: 5px; width: 22px; height: 22px; border-radius: 11px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; line-height: 1;"
                                    :style="{ background: typeColor(item.content?.type ?? '') + 'dd', color: '#060a10' }"
                                    @click.stop="incrementItem(item.id)"
                                >+</button>
                                <!-- Bottom: title + progress bar -->
                                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 7px 7px;">
                                    <div
                                        style="font-size: 10.5px; font-weight: 700; color: #eef0f5; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; letter-spacing: -0.01em; margin-bottom: 5px;"
                                    >{{ item.content?.name }}</div>
                                    <!-- Progress bar -->
                                    <div v-if="item.content?.type !== 'movie'" style="height: 2px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                                        <div :style="{ width: progressPct(item) + '%', height: '100%', background: typeColor(item.content?.type ?? ''), borderRadius: '2px', transition: 'width 0.3s' }"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </IonContent>

        <!-- ─── Sort Sheet ─── -->
        <IonModal
            :is-open="isSortOpen"
            :initial-breakpoint="0.6"
            :breakpoints="[0, 0.6, 1]"
            :handle="true"
            handle-behavior="cycle"
            class="bottom-sheet-modal"
            @didDismiss="isSortOpen = false"
        >
            <IonContent class="sheet-content">
                <div style="padding: 4px 16px 32px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                        <div style="font-size: 16px; font-weight: 800; color: #eef0f5; letter-spacing: -0.02em;">Ordenar por</div>
                        <button style="width: 30px; height: 30px; border-radius: 15px; border: none; background: rgba(255,255,255,0.06); color: #9aa3b8; cursor: pointer; display: flex; align-items: center; justify-content: center;" @click="isSortOpen = false">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>
                        </button>
                    </div>
                    <button
                        v-for="opt in sortOptions"
                        :key="opt.id"
                        :style="sortOptionStyle(opt.id)"
                        @click="setSort(opt.id)"
                    >
                        <div :style="sortIconStyle(opt.id)">{{ opt.icon }}</div>
                        <div style="flex: 1; text-align: left;">
                            <div :style="{ fontSize: '13px', fontWeight: '700', color: sortBy === opt.id ? '#5eead4' : '#eef0f5' }">{{ opt.label }}</div>
                            <div style="font-size: 11px; color: #6b738a; margin-top: 1px;">{{ opt.desc }}</div>
                        </div>
                        <svg v-if="sortBy === opt.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round"><path d="m4 12 5 5 11-11"/></svg>
                    </button>
                </div>
            </IonContent>
        </IonModal>

        <!-- ─── Filter Sheet ─── -->
        <IonModal
            :is-open="isFilterOpen"
            :initial-breakpoint="0.88"
            :breakpoints="[0, 0.88, 1]"
            :handle="true"
            handle-behavior="cycle"
            class="bottom-sheet-modal"
            @didDismiss="isFilterOpen = false"
        >
            <IonHeader class="sheet-header">
                <div style="padding: 8px 20px 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: 18px; font-weight: 800; color: #eef0f5; letter-spacing: -0.02em;">Filtros</div>
                            <div v-if="activeFilterCount > 0" style="font-size: 11px; color: #5eead4; font-weight: 600; margin-top: 2px;">{{ activeFilterCount }} ativo{{ activeFilterCount > 1 ? 's' : '' }}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button style="padding: 7px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: #6b738a; cursor: pointer; font-size: 12px; font-weight: 700;" @click="clearFilters">Limpar</button>
                            <button style="width: 32px; height: 32px; border-radius: 16px; border: none; background: rgba(255,255,255,0.06); color: #9aa3b8; cursor: pointer; display: flex; align-items: center; justify-content: center;" @click="isFilterOpen = false">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </IonHeader>
            <IonContent class="sheet-content">
                <div style="padding: 0 20px 120px;">
                    <div style="margin-bottom: 22px;">
                        <div class="filter-label">Tipo</div>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <button v-for="opt in typeOptions" :key="opt.value ?? 'all'" :style="typeFilterChipStyle(opt.value)" @click="toggleType(opt.value)">{{ opt.label }}</button>
                        </div>
                    </div>
                    <div style="margin-bottom: 22px;">
                        <div class="filter-label">Gêneros</div>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <button v-for="g in genresList" :key="g" :style="genreChipStyle(g)" @click="toggleGenre(g)">{{ g }}</button>
                        </div>
                    </div>
                    <div>
                        <div class="filter-label">Outros</div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.07); cursor: pointer;" @click="filterRecentOnly = !filterRecentOnly">
                                <div>
                                    <div style="font-size: 13px; font-weight: 700; color: #eef0f5;">Atualizados recentemente</div>
                                    <div style="font-size: 11px; color: #6b738a; margin-top: 2px;">Últimos 5 dias</div>
                                </div>
                                <div :style="toggleTrackStyle(filterRecentOnly)"><div :style="toggleKnobStyle(filterRecentOnly)"></div></div>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.07); cursor: pointer;" @click="filterHasRating = !filterHasRating">
                                <div>
                                    <div style="font-size: 13px; font-weight: 700; color: #eef0f5;">★ Com avaliação</div>
                                    <div style="font-size: 11px; color: #6b738a; margin-top: 2px;">Que você avaliou</div>
                                </div>
                                <div :style="toggleTrackStyle(filterHasRating)"><div :style="toggleKnobStyle(filterHasRating)"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
            <IonFooter class="sheet-footer">
                <div style="padding: 12px 20px;">
                    <button style="width: 100%; padding: 14px; border-radius: 12px; border: none; background: #5eead4; color: #0d1117; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;" @click="isFilterOpen = false">
                        Aplicar filtros
                        <span v-if="activeFilterCount > 0" style="background: rgba(0,0,0,0.2); border-radius: 10px; padding: 2px 8px; font-size: 11px;">{{ activeFilterCount }}</span>
                    </button>
                </div>
            </IonFooter>
        </IonModal>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent, IonModal, IonHeader, IonFooter,
    IonRefresher, IonRefresherContent, toastController,
} from '@ionic/vue';
import { userContentService, UserContent, ContentStatus } from '@/services/userContentService';
import { ContentType, CONTENT_TYPE_LABELS } from '@/services/contentService';

const SORT_OPTIONS = [
    { id: 'updated_desc', label: 'Atualizado recentemente', icon: '⚡', desc: 'Mais recentes primeiro' },
    { id: 'name_asc',     label: 'Nome A → Z',              icon: '↑',  desc: 'Ordem alfabética' },
    { id: 'name_desc',    label: 'Nome Z → A',              icon: '↓',  desc: 'Ordem inversa' },
    { id: 'note_desc',    label: 'Melhor avaliação',         icon: '★',  desc: 'Maior nota que dei' },
    { id: 'score_desc',   label: 'Mais relevantes',          icon: '◆',  desc: 'Score do conteúdo' },
];

const GENRES_LIST = [
    'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica',
    'Horror', 'Mistério', 'Romance', 'Seinen', 'Shounen', 'Slice of Life', 'Supernatural', 'Thriller',
];

const TYPE_COLORS: Record<string, string> = {
    manga: '#5eead4', anime: '#a78bfa', novel: '#fbbf24', movie: '#f472b6', tv: '#22d3ee',
};

const TYPE_SHORT: Record<string, string> = {
    manga: 'M', anime: 'A', novel: 'N', movie: 'F', tv: 'S',
};

export default defineComponent({
    name: 'LibraryPage',
    components: { IonPage, IonContent, IonModal, IonHeader, IonFooter, IonRefresher, IonRefresherContent },
    data() {
        return {
            loading: false,
            userContents: [] as UserContent[],
            search: '',
            activeType: null as ContentType | null,
            sortBy: 'updated_desc',
            isSortOpen: false,
            isFilterOpen: false,
            filterTypes: [] as (ContentType | null)[],
            filterGenres: [] as string[],
            filterRecentOnly: false,
            filterHasRating: false,
            sortOptions: SORT_OPTIONS,
            genresList: GENRES_LIST,
            typeOptions: [
                { label: 'Todos',                         value: null as ContentType | null },
                { label: CONTENT_TYPE_LABELS.manga,       value: 'manga'  as ContentType },
                { label: CONTENT_TYPE_LABELS.anime,       value: 'anime'  as ContentType },
                { label: CONTENT_TYPE_LABELS.novel,       value: 'novel'  as ContentType },
                { label: CONTENT_TYPE_LABELS.movie,       value: 'movie'  as ContentType },
                { label: CONTENT_TYPE_LABELS.tv,          value: 'tv'     as ContentType },
            ],
        };
    },
    computed: {
        quickStats(): { label: string; value: number; color: string }[] {
            return [
                { label: 'Total',     value: this.userContents.length,                                         color: '#5eead4' },
                { label: 'Em curso',  value: this.userContents.filter(uc => uc.status === 'reading').length,   color: '#60a5fa' },
                { label: 'Completos', value: this.userContents.filter(uc => uc.status === 'completed').length, color: '#34d399' },
            ];
        },
        sortMeta() {
            return SORT_OPTIONS.find(o => o.id === this.sortBy) ?? SORT_OPTIONS[0];
        },
        isSortDefault(): boolean {
            return this.sortBy === 'updated_desc';
        },
        activeFilterCount(): number {
            let n = 0;
            if (this.filterTypes.length)  n++;
            if (this.filterGenres.length) n++;
            if (this.filterRecentOnly)    n++;
            if (this.filterHasRating)     n++;
            return n;
        },
        typeChips(): { value: ContentType | null; label: string; color: string; count: number }[] {
            const labels: Record<string, string> = { manga: 'Manga', anime: 'Anime', novel: 'Novel', movie: 'Filme', tv: 'Série' };
            const types = ['manga', 'anime', 'novel', 'movie', 'tv'] as ContentType[];
            const chips: { value: ContentType | null; label: string; color: string; count: number }[] = [
                { value: null, label: 'Todos', color: '#5eead4', count: this.userContents.length },
            ];
            for (const t of types) {
                const count = this.userContents.filter(i => i.content?.type === t).length;
                if (count > 0) chips.push({ value: t, label: labels[t], color: TYPE_COLORS[t] ?? '#5eead4', count });
            }
            return chips;
        },
        groupedByStatus(): { status: ContentStatus; label: string; color: string; items: UserContent[] }[] {
            const STATUS_ORDER: ContentStatus[] = ['reading', 'plan_to_read', 'completed', 'paused', 'dropped'];
            const STATUS_COLOR: Record<string, string> = {
                reading: '#60a5fa', completed: '#34d399', paused: '#fbbf24', dropped: '#f87171', plan_to_read: '#a78bfa',
            };
            const groups: Record<string, UserContent[]> = {};
            for (const item of this.sortedFiltered) {
                (groups[item.status] = groups[item.status] || []).push(item);
            }
            return STATUS_ORDER.filter(s => groups[s]?.length).map(s => {
                const items = groups[s];
                const isAllVideo   = items.every(i => ['anime', 'tv', 'movie'].includes(i.content?.type ?? ''));
                const isAllReading = items.every(i => ['manga', 'novel'].includes(i.content?.type ?? ''));
                let label: string;
                if (s === 'reading') {
                    label = isAllVideo ? 'Assistindo' : isAllReading ? 'Lendo' : 'Em andamento';
                } else if (s === 'plan_to_read') {
                    label = isAllVideo ? 'Quero assistir' : isAllReading ? 'Quero ler' : 'Quero ver / ler';
                } else if (s === 'completed') {
                    label = 'Completos';
                } else if (s === 'paused') {
                    label = 'Pausados';
                } else {
                    label = 'Abandonados';
                }
                return { status: s as ContentStatus, label, color: STATUS_COLOR[s] ?? '#6b738a', items };
            });
        },
        sortedFiltered(): UserContent[] {
            let result = [...this.userContents];

            if (this.activeType) result = result.filter(i => i.content?.type === this.activeType);

            if (this.search.trim()) {
                const q = this.search.toLowerCase();
                result = result.filter(i =>
                    i.content?.name?.toLowerCase().includes(q) ||
                    i.content?.alternative_names?.some(n => n.toLowerCase().includes(q))
                );
            }

            if (this.filterTypes.length) result = result.filter(i => this.filterTypes.includes(i.content?.type ?? null));
            if (this.filterGenres.length) result = result.filter(i => i.content?.genres?.some(g => this.filterGenres.includes(g)));

            if (this.filterRecentOnly) {
                result = result.filter(i => {
                    const d = i.last_unit_update ?? i.content?.last_unit_update;
                    return d ? (Date.now() - new Date(d).getTime()) < 5 * 86400000 : false;
                });
            }

            if (this.filterHasRating) result = result.filter(i => i.rating != null);

            return result.sort((a, b) => {
                switch (this.sortBy) {
                    case 'updated_desc': {
                        const da = new Date(a.last_unit_update ?? a.content?.last_unit_update ?? 0).getTime();
                        const db = new Date(b.last_unit_update ?? b.content?.last_unit_update ?? 0).getTime();
                        return db - da;
                    }
                    case 'name_asc':   return (a.content?.name ?? '').localeCompare(b.content?.name ?? '', 'pt');
                    case 'name_desc':  return (b.content?.name ?? '').localeCompare(a.content?.name ?? '', 'pt');
                    case 'note_desc':  return (b.rating ?? -1) - (a.rating ?? -1);
                    case 'score_desc': return (b.content?.score ?? 0) - (a.content?.score ?? 0);
                    default: return 0;
                }
            });
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
                const toast = await toastController.create({
                    message: 'Falha ao carregar biblioteca.',
                    duration: 2000, color: 'danger', position: 'top',
                });
                await toast.present();
            } finally {
                this.loading = false;
            }
        },
        progressPct(uc: UserContent): number {
            if (!uc.content?.total_units || !uc.current_units) return 0;
            return Math.min(Math.round((uc.current_units / uc.content.total_units) * 100), 100);
        },
        isAtLimit(uc: UserContent): boolean {
            const total = uc.content?.total_units;
            if (!total) return false;
            return uc.current_units >= total;
        },
        typeColor(type: string): string {
            return TYPE_COLORS[type] ?? '#5eead4';
        },
        typeShortLabel(type: string): string {
            return TYPE_SHORT[type] ?? '?';
        },
        onSearch(ev: Event) {
            this.search = (ev.target as HTMLInputElement).value;
        },
        setSort(id: string) {
            this.sortBy = id;
            this.isSortOpen = false;
        },
        toggleType(val: ContentType | null) {
            const idx = this.filterTypes.indexOf(val);
            if (idx >= 0) this.filterTypes.splice(idx, 1);
            else this.filterTypes.push(val);
        },
        toggleGenre(g: string) {
            const idx = this.filterGenres.indexOf(g);
            if (idx >= 0) this.filterGenres.splice(idx, 1);
            else this.filterGenres.push(g);
        },
        clearFilters() {
            this.filterTypes = [];
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
            } catch { /* silent */ }
        },
        async handleRefresh(event: CustomEvent) {
            await this.loadContents();
            (event.target as HTMLIonRefresherElement).complete();
        },
        typeChipStyle(val: ContentType | null): Record<string, string> {
            const active = this.activeType === val;
            const col = val ? (TYPE_COLORS[val] ?? '#5eead4') : '#5eead4';
            return {
                padding: '6px 13px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px',
                background: active ? col : 'transparent',
                color: active ? '#0d1117' : '#9aa3b8',
                outline: active ? 'none' : '1px solid rgba(255,255,255,0.09)',
                transition: 'all 0.15s', flexShrink: '0',
            };
        },
        typeFilterChipStyle(val: ContentType | null): Record<string, string> {
            const active = this.filterTypes.includes(val);
            const col = val ? (TYPE_COLORS[val] ?? '#5eead4') : '#5eead4';
            return {
                padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: '700',
                background: active ? col + '22' : 'transparent',
                color: active ? col : '#9aa3b8',
                outline: active ? `1.5px solid ${col}44` : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.15s',
            };
        },
        genreChipStyle(g: string): Record<string, string> {
            const active = this.filterGenres.includes(g);
            return {
                padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: '600',
                background: active ? 'rgba(94,234,212,0.15)' : 'transparent',
                color: active ? '#5eead4' : '#9aa3b8',
                outline: active ? '1.5px solid rgba(94,234,212,0.35)' : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.15s',
            };
        },
        sortOptionStyle(id: string): Record<string, string> {
            const active = this.sortBy === id;
            return {
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                marginBottom: '4px',
                background: active ? 'rgba(94,234,212,0.08)' : 'transparent',
                outline: active ? '1px solid rgba(94,234,212,0.3)' : '1px solid rgba(255,255,255,0.07)',
                textAlign: 'left', transition: 'all 0.15s',
            };
        },
        sortIconStyle(id: string): Record<string, string> {
            const active = this.sortBy === id;
            return {
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: '0',
                background: active ? 'rgba(94,234,212,0.2)' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', color: active ? '#5eead4' : '#6b738a',
            };
        },
        toggleTrackStyle(active: boolean): Record<string, string> {
            return {
                width: '44px', height: '26px', borderRadius: '13px', position: 'relative',
                background: active ? '#5eead4' : 'rgba(255,255,255,0.1)',
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

.filter-label {
    font-size: 10px;
    font-weight: 800;
    color: #6b738a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
}

.skeleton {
    background: rgba(255,255,255,0.05);
    animation: pulse 1.4s ease-in-out infinite;
}

.cover-card:active {
    transform: scale(0.96);
    transition: transform 0.12s;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
}
</style>

<style>
ion-modal.bottom-sheet-modal::part(content) {
    background: #0d1117;
    border-top: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px 24px 0 0;
}
.sheet-content  { --background: #0d1117; }
.sheet-header   { --background: #0d1117; box-shadow: none; }
.sheet-footer   { --background: #0d1117; border-top: 1px solid rgba(255,255,255,0.07); box-shadow: none; }
</style>
