<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
                <IonRefresherContent pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" pulling-text="" refreshing-text="" />
            </IonRefresher>

            <div style="padding: 0 0 100px; background: hsl(220 30% 3%); min-height: 100%;">

                <!-- ─── Header ─── -->
                <div style="padding: 22px 18px 0;">
                    <div style="font-size: 10px; color: rgba(233,237,242,0.42); font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 5px;">BIBLIOTECA</div>
                    <div style="font-size: 30px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; font-family: 'Sora', system-ui, sans-serif; background: linear-gradient(135deg, #00F5A0, #00D9FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Minha coleção</div>

                    <!-- Airy stat row — no boxes, just numbers with dividers -->
                    <div style="display: flex; align-items: stretch; gap: 0; margin-top: 18px; margin-bottom: 4px;">
                        <div v-for="(stat, i) in quickStats" :key="stat.label" style="display: flex; align-items: stretch; flex: 1;">
                            <div v-if="i > 0" style="width: 1px; background: rgba(255,255,255,0.06); margin: 0;"></div>
                            <div style="flex: 1; padding: 4px 0 4px 14px;">
                                <div :style="{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1', color: stat.accent ? '#00F5A0' : 'hsl(213 25% 92%)', fontFamily: '\'Sora\', system-ui, sans-serif' }">{{ stat.value }}</div>
                                <div style="font-size: 9px; color: rgba(233,237,242,0.42); font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 6px;">{{ stat.label }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ─── Search ─── -->
                <div style="padding: 18px 18px 10px;">
                    <div style="position: relative;">
                        <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(233,237,242,0.22); font-size: 14px; pointer-events: none;">⌕</span>
                        <input
                            :value="search"
                            placeholder="Buscar na biblioteca..."
                            style="width: 100%; padding: 12px 14px 12px 38px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025); color: #e9edf2; font-size: 13px; outline: none; box-sizing: border-box; font-family: inherit; transition: border-color 0.15s;"
                            @input="onSearch"
                            @focus="($event.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.10)'"
                            @blur="($event.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.06)'"
                        />
                        <button
                            v-if="search"
                            style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 11px; border: none; background: rgba(255,255,255,0.07); color: rgba(233,237,242,0.62); cursor: pointer; display: flex; align-items: center; justify-content: center;"
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
                            <span :style="{ fontSize: '10px', opacity: '0.55', marginLeft: '2px' }">{{ t.count }}</span>
                        </button>
                    </div>
                </div>

                <!-- ─── Toolbar ─── -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 18px 14px;">
                    <div style="font-size: 11px; color: rgba(233,237,242,0.42); font-weight: 700; letter-spacing: 0.04em;">
                        {{ sortedFiltered.length }} {{ sortedFiltered.length === 1 ? 'obra' : 'obras' }}
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button
                            v-if="activeFilterCount > 0"
                            :style="filterBtnStyle(true)"
                            @click="isFilterOpen = true"
                        >
                            <span style="opacity: 0.7;">≡</span> Filtros
                            <span style="min-width: 16px; height: 16px; padding: 0 4px; border-radius: 8px; background: #00F5A0; color: #050608; font-size: 9px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;">{{ activeFilterCount }}</span>
                        </button>
                        <button
                            style="background: transparent; border: none; cursor: pointer; color: rgba(233,237,242,0.62); font-size: 11px; font-weight: 700; letter-spacing: 0.04em; display: flex; align-items: center; gap: 6px; padding: 4px 8px;"
                            @click="isSortOpen = true"
                        >
                            <span style="opacity: 0.6;">↕</span> {{ sortMeta.label }}
                        </button>
                    </div>
                </div>

                <!-- ─── Loading skeleton ─── -->
                <div v-if="loading" style="padding: 0 16px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
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
                <div v-else-if="userContents.length === 0" style="text-align: center; padding: 64px 28px; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <div style="font-size: 30px; color: rgba(233,237,242,0.22); margin-bottom: 6px;">◌</div>
                    <div style="font-size: 15px; font-weight: 700; color: #e9edf2;">Sua biblioteca está vazia</div>
                    <div style="font-size: 12px; color: rgba(233,237,242,0.42); line-height: 1.6; max-width: 240px;">Encontre obras no catálogo e adicione à sua coleção pessoal.</div>
                    <div style="margin-top: 14px;">
                        <button
                            style="padding: 13px 20px; border-radius: 12px; border: none; background: #00F5A0; color: #050608; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 6px 22px hsl(158 100% 48% / 0.45);"
                            @click="$router.push('/tabs/discover')"
                        >Explorar catálogo</button>
                    </div>
                </div>

                <!-- ─── Empty: no filter results ─── -->
                <div v-else-if="sortedFiltered.length === 0" style="text-align: center; padding: 48px 28px;">
                    <div style="font-size: 30px; color: rgba(233,237,242,0.22); margin-bottom: 8px;">∅</div>
                    <div style="font-size: 15px; font-weight: 700; color: #e9edf2; margin-bottom: 4px;">Nenhum resultado</div>
                    <div style="font-size: 12px; color: rgba(233,237,242,0.42);">{{ search ? 'Tente outro termo' : 'Tente outros filtros' }}</div>
                </div>

                <!-- ─── Status groups — 3-col poster grid ─── -->
                <template v-else>
                    <div v-for="group in groupedByStatus" :key="group.status" style="margin-bottom: 28px; animation: fade 0.25s ease;">
                        <!-- Section label — small caps, muted -->
                        <div style="display: flex; align-items: baseline; justify-content: space-between; padding: 0 18px; margin-bottom: 12px;">
                            <div style="display: flex; align-items: baseline; gap: 8px;">
                                <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(233,237,242,0.42);">{{ group.label }}</span>
                                <span style="font-size: 10px; color: rgba(233,237,242,0.22); font-weight: 700;">· {{ group.items.length }}</span>
                            </div>
                        </div>
                        <!-- 3-column poster grid -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 0 18px; align-items: start;">
                            <div
                                v-for="item in group.items"
                                :key="item.id"
                                class="cover-card"
                                style="display: flex; flex-direction: column; gap: 7px; cursor: pointer; animation: fade 0.22s ease; min-width: 0;"
                                @click="$router.push(`/catalog/${item.content?.id ?? item.content_id}`)"
                            >
                                <!-- Poster -->
                                <div style="position: relative; border-radius: 10px; overflow: hidden;" :style="{ aspectRatio: '2/3' }">
                                    <img
                                        v-if="item.content?.cover"
                                        :src="item.content.cover"
                                        :alt="item.content?.name"
                                        style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;"
                                    />
                                    <!-- No cover gradient -->
                                    <div
                                        v-else
                                        style="position: absolute; inset: 0;"
                                        :style="{ background: `linear-gradient(155deg, ${typeGrad(item.content?.type ?? '')[0]}, ${typeGrad(item.content?.type ?? '')[1]})` }"
                                    >
                                        <div style="position: absolute; inset: 0; padding: 10px; display: flex; align-items: flex-end; background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55) 100%);">
                                            <div style="font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.92); line-height: 1.15; font-family: 'Sora', system-ui, sans-serif;">{{ item.content?.name }}</div>
                                        </div>
                                    </div>
                                    <!-- Shadow overlay -->
                                    <div style="position: absolute; inset: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04); pointer-events: none; border-radius: 10px;"></div>
                                    <!-- Status dot — top right -->
                                    <span style="position: absolute; top: 7px; right: 7px; width: 9px; height: 9px; border-radius: 5px; box-shadow: 0 0 0 2px rgba(0,0,0,0.55);"
                                          :style="{ background: group.color }"></span>
                                    <!-- +1 button — top left, only for non-movies -->
                                    <button
                                        v-if="item.content?.type !== 'movie' && !isAtLimit(item)"
                                        style="position: absolute; top: 5px; left: 5px; width: 24px; height: 24px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; line-height: 1; background: #00F5A0; color: #050608;"
                                        @click.stop="incrementItem(item.id)"
                                    >+</button>
                                    <!-- Progress bar — bottom, only if reading -->
                                    <div
                                        v-if="item.content?.type !== 'movie' && item.status === 'reading' && item.content?.total_units"
                                        style="position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(0,0,0,0.45);"
                                    >
                                        <div :style="{ height: '100%', width: progressPct(item) + '%', background: '#00F5A0' }"></div>
                                    </div>
                                </div>
                                <!-- Title + meta below poster -->
                                <div style="padding: 0 1px;">
                                    <div style="font-size: 12px; font-weight: 700; color: #e9edf2; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">{{ item.content?.name }}</div>
                                    <div v-if="item.status === 'reading' && item.content?.type !== 'movie'" style="font-size: 10px; color: rgba(233,237,242,0.42); margin-top: 3px;">
                                        <template v-if="item.content?.type === 'tv'">
                                            T{{ item.current_season ?? 1 }} · Ep {{ item.current_units }}<template v-if="item.content.season_episodes?.[String(item.current_season ?? 1)]">/{{ item.content.season_episodes[String(item.current_season ?? 1)] }}</template>
                                        </template>
                                        <template v-else>
                                            {{ unitLabel(item.content?.type) }} {{ item.current_units }}{{ item.content?.total_units ? ` / ${item.content.total_units}` : '' }}
                                        </template>
                                    </div>
                                    <div v-else-if="item.status === 'completed'" style="font-size: 10px; color: rgba(233,237,242,0.42); margin-top: 3px;">
                                        {{ item.rating != null ? `★ ${item.rating}/10` : 'Concluído' }}
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
            :initial-breakpoint="0.55"
            :breakpoints="[0, 0.55, 1]"
            :handle="true"
            handle-behavior="cycle"
            class="bottom-sheet-modal"
            @didDismiss="isSortOpen = false"
        >
            <IonContent class="sheet-content">
                <div style="padding: 4px 8px 24px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 18px 14px;">
                        <div style="font-size: 18px; font-weight: 800; color: #e9edf2; letter-spacing: -0.02em;">Ordenar</div>
                        <button style="background: transparent; border: none; cursor: pointer; color: rgba(233,237,242,0.42); font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;" @click="isSortOpen = false">Fechar</button>
                    </div>
                    <button
                        v-for="opt in sortOptions"
                        :key="opt.id"
                        @click="setSort(opt.id)"
                        style="width: 100%; text-align: left; padding: 14px 18px; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 14px; font-weight: 600; transition: color 0.15s;"
                        :style="{ color: sortBy === opt.id ? '#00F5A0' : '#e9edf2' }"
                    >
                        <span>{{ opt.label }}</span>
                        <span v-if="sortBy === opt.id" style="color: #00F5A0;">✓</span>
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
                <div style="padding: 8px 18px 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px;">
                        <div style="font-size: 18px; font-weight: 800; color: #e9edf2; letter-spacing: -0.02em;">Filtros</div>
                        <div style="display: flex; gap: 8px;">
                            <button
                                style="background: transparent; border: none; cursor: pointer; font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; transition: color 0.15s;"
                                :style="{ color: activeFilterCount > 0 ? '#00F5A0' : 'rgba(233,237,242,0.42)' }"
                                @click="clearFilters"
                            >Limpar</button>
                            <button
                                style="background: transparent; border: none; cursor: pointer; color: rgba(233,237,242,0.42); font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;"
                                @click="isFilterOpen = false"
                            >Fechar</button>
                        </div>
                    </div>
                </div>
            </IonHeader>
            <IonContent class="sheet-content">
                <div style="padding: 0 18px 120px;">
                    <div style="margin-bottom: 22px;">
                        <div class="filter-label">Gêneros</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <button v-for="g in genresList" :key="g" :style="genreChipStyle(g)" @click="toggleGenre(g)">{{ g }}</button>
                        </div>
                    </div>
                    <div>
                        <div class="filter-label">Outros</div>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 12px 0; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <span :style="toggleTrackStyle(filterRecentOnly)"><span :style="toggleKnobStyle(filterRecentOnly)"></span></span>
                            <span style="flex: 1; font-size: 13px; color: #e9edf2; font-weight: 600;">Atualizados recentemente</span>
                            <input type="checkbox" :checked="filterRecentOnly" @change="filterRecentOnly = !filterRecentOnly" style="display: none;" />
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 12px 0; cursor: pointer;">
                            <span :style="toggleTrackStyle(filterHasRating)"><span :style="toggleKnobStyle(filterHasRating)"></span></span>
                            <span style="flex: 1; font-size: 13px; color: #e9edf2; font-weight: 600;">★ Com avaliação</span>
                            <input type="checkbox" :checked="filterHasRating" @change="filterHasRating = !filterHasRating" style="display: none;" />
                        </label>
                    </div>
                </div>
            </IonContent>
            <IonFooter class="sheet-footer">
                <div style="padding: 14px 18px;">
                    <button
                        style="width: 100%; padding: 13px; border-radius: 12px; border: none; background: #00F5A0; color: #050608; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 6px 22px hsl(158 100% 48% / 0.45); display: flex; align-items: center; justify-content: center; gap: 8px;"
                        @click="isFilterOpen = false"
                    >
                        Aplicar{{ activeFilterCount > 0 ? ` · ${activeFilterCount}` : '' }}
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
    { id: 'updated_desc', label: 'Atualizado recentemente' },
    { id: 'name_asc',     label: 'Nome A → Z' },
    { id: 'name_desc',    label: 'Nome Z → A' },
    { id: 'note_desc',    label: 'Melhor avaliação' },
    { id: 'score_desc',   label: 'Mais relevantes' },
];

const GENRES_LIST = [
    'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica',
    'Horror', 'Mistério', 'Romance', 'Seinen', 'Shounen', 'Slice of Life', 'Supernatural', 'Thriller',
];

// Cover gradient palettes for no-cover fallback
const COVER_PALETTES = [
    ['#1f2937', '#111827'], ['#172554', '#0c1226'], ['#1f1126', '#13101e'],
    ['#10241e', '#0a1410'], ['#241818', '#140d0d'], ['#1a2536', '#0e1a2a'],
    ['#2b1d2c', '#161018'], ['#1a2a1e', '#0c1410'],
];

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
            filterGenres: [] as string[],
            filterRecentOnly: false,
            filterHasRating: false,
            sortOptions: SORT_OPTIONS,
            genresList: GENRES_LIST,
        };
    },
    computed: {
        quickStats(): { label: string; value: number; accent?: boolean }[] {
            const inProgress = this.userContents.filter(uc => uc.status === 'reading').length;
            const done = this.userContents.filter(uc => uc.status === 'completed').length;
            return [
                { label: 'TOTAL',     value: this.userContents.length },
                { label: 'EM CURSO',  value: inProgress, accent: true },
                { label: 'COMPLETOS', value: done },
            ];
        },
        sortMeta() {
            return SORT_OPTIONS.find(o => o.id === this.sortBy) ?? SORT_OPTIONS[0];
        },
        activeFilterCount(): number {
            let n = 0;
            if (this.filterGenres.length) n++;
            if (this.filterRecentOnly)    n++;
            if (this.filterHasRating)     n++;
            return n;
        },
        typeChips(): { value: ContentType | null; label: string; count: number }[] {
            const labels: Record<string, string> = { manga: 'Manga', anime: 'Anime', novel: 'Novel', movie: 'Filme', tv: 'Série' };
            const types = ['manga', 'anime', 'novel', 'movie', 'tv'] as ContentType[];
            const chips: { value: ContentType | null; label: string; count: number }[] = [
                { value: null, label: 'Todos', count: this.userContents.length },
            ];
            for (const t of types) {
                const count = this.userContents.filter(i => i.content?.type === t).length;
                if (count > 0) chips.push({ value: t, label: labels[t], count });
            }
            return chips;
        },
        groupedByStatus(): { status: ContentStatus; label: string; color: string; items: UserContent[] }[] {
            const STATUS_ORDER: ContentStatus[] = ['reading', 'plan_to_read', 'completed', 'paused', 'dropped'];
            const STATUS_COLOR: Record<string, string> = {
                reading: '#00F5A0', completed: '#7CAEFF', paused: '#F5C542', dropped: '#FF5E5E', plan_to_read: '#B8A4FF',
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
                return { status: s as ContentStatus, label, color: STATUS_COLOR[s] ?? 'rgba(233,237,242,0.42)', items };
            });
        },
        sortedFiltered(): UserContent[] {
            let result = [...this.userContents];

            if (this.activeType) result = result.filter(i => i.content?.type === this.activeType);

            if (this.search.trim()) {
                const q = this.search.toLowerCase();
                result = result.filter(i =>
                    i.content?.name?.toLowerCase().includes(q) ||
                    i.content?.alternative_names?.some((n: string) => n.toLowerCase().includes(q))
                );
            }

            if (this.filterGenres.length) result = result.filter(i => i.content?.genres?.some((g: string) => this.filterGenres.includes(g)));

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
            if (!uc.current_units) return 0;
            const seasonEps = uc.content?.season_episodes;
            const season = String(uc.current_season ?? 1);
            const total = (uc.content?.type === 'tv' && seasonEps)
                ? (seasonEps[season] ?? uc.content?.total_units)
                : uc.content?.total_units;
            if (!total) return 0;
            return Math.min(Math.round((uc.current_units / total) * 100), 100);
        },
        isAtLimit(uc: UserContent): boolean {
            const seasonEps = uc.content?.season_episodes;
            const season = String(uc.current_season ?? 1);
            const total = (uc.content?.type === 'tv' && seasonEps)
                ? (seasonEps[season] ?? uc.content?.total_units)
                : uc.content?.total_units;
            if (!total) return false;
            return uc.current_units >= total;
        },
        typeGrad(type: string): [string, string] {
            const seed = type === 'manga' ? 0 : type === 'anime' ? 1 : type === 'novel' ? 2 : type === 'movie' ? 4 : 5;
            return COVER_PALETTES[seed % COVER_PALETTES.length] as [string, string];
        },
        unitLabel(type?: string): string {
            if (type === 'anime' || type === 'tv') return 'Ep';
            if (type === 'movie') return '';
            return 'Cap';
        },
        onSearch(ev: Event) {
            this.search = (ev.target as HTMLInputElement).value;
        },
        setSort(id: string) {
            this.sortBy = id;
            this.isSortOpen = false;
        },
        toggleGenre(g: string) {
            const idx = this.filterGenres.indexOf(g);
            if (idx >= 0) this.filterGenres.splice(idx, 1);
            else this.filterGenres.push(g);
        },
        clearFilters() {
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
            return {
                padding: '8px 14px', borderRadius: '999px', cursor: 'pointer',
                fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px',
                border: `1px solid ${active ? '#00F5A0' : 'rgba(255,255,255,0.06)'}`,
                background: active ? 'rgba(52,211,153,0.10)' : 'transparent',
                color: active ? '#00F5A0' : 'rgba(233,237,242,0.62)',
                transition: 'all 0.15s', flexShrink: '0', whiteSpace: 'nowrap',
            };
        },
        filterBtnStyle(active: boolean): Record<string, string> {
            return {
                background: active ? 'rgba(52,211,153,0.10)' : 'transparent',
                border: `1px solid ${active ? '#00F5A0' : 'rgba(255,255,255,0.06)'}`,
                color: active ? '#00F5A0' : 'rgba(233,237,242,0.62)',
                cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                padding: '6px 12px', borderRadius: '999px',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.15s',
            };
        },
        genreChipStyle(g: string): Record<string, string> {
            const active = this.filterGenres.includes(g);
            return {
                padding: '6px 11px', borderRadius: '999px', cursor: 'pointer',
                fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap',
                border: `1px solid ${active ? 'rgba(52,211,153,0.66)' : 'rgba(255,255,255,0.06)'}`,
                background: active ? 'rgba(52,211,153,0.10)' : 'transparent',
                color: active ? '#00F5A0' : 'rgba(233,237,242,0.62)',
                transition: 'all 0.15s',
            };
        },
        toggleTrackStyle(active: boolean): Record<string, string> {
            return {
                width: '38px', height: '22px', borderRadius: '11px', padding: '2px',
                background: active ? '#00F5A0' : 'rgba(255,255,255,0.06)',
                transition: 'background 0.15s', flexShrink: '0', position: 'relative',
                display: 'inline-block',
            };
        },
        toggleKnobStyle(active: boolean): Record<string, string> {
            return {
                width: '18px', height: '18px', borderRadius: '9px', background: '#fff',
                display: 'block', transform: `translateX(${active ? 16 : 0}px)`,
                transition: 'transform 0.15s',
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
    color: rgba(233,237,242,0.42);
    text-transform: uppercase;
    letter-spacing: 0.22em;
    margin-bottom: 12px;
}

.skeleton {
    background: rgba(255,255,255,0.04);
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

@keyframes fade {
    from { opacity: 0; }
    to   { opacity: 1; }
}
</style>

<style>
ion-modal.bottom-sheet-modal::part(content) {
    background: hsl(222 24% 7%);
    border-top: 1px solid hsl(0 0% 100% / 0.06);
    border-radius: 18px 18px 0 0;
}
.sheet-content  { --background: hsl(222 24% 7%); }
.sheet-header   { --background: hsl(222 24% 7%); box-shadow: none; border-bottom: 1px solid hsl(0 0% 100% / 0.06); }
.sheet-footer   { --background: hsl(222 24% 7%); border-top: 1px solid hsl(0 0% 100% / 0.06); box-shadow: none; }
</style>
