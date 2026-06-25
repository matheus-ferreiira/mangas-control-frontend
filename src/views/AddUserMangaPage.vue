<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div style="padding: 0 16px 96px; padding-top: max(16px, env(safe-area-inset-top, 16px));">

                <!-- Header -->
                <div style="margin-bottom: 24px;">
                    <div style="font-size: 22px; font-weight: 800; color: #e9edf2; letter-spacing: -0.03em; margin-bottom: 3px; font-family: 'Sora', system-ui, sans-serif;">Adicionar à Biblioteca</div>
                    <div style="font-size: 12px; color: rgba(233,237,242,0.42);">Busque e configure seu registro</div>
                </div>

                <!-- ── Obra section ── -->
                <div style="margin-bottom: 20px;">
                    <div :style="sectionLabelStyle">Obra</div>

                    <!-- Selected content card — glassmorphism -->
                    <div v-if="selectedContent" style="position: relative; border-radius: 16px; overflow: hidden;">
                        <!-- Blurred cover backdrop -->
                        <div style="position: absolute; inset: 0; overflow: hidden;">
                            <img
                                v-if="selectedContent.cover"
                                :src="selectedContent.cover"
                                style="width: 100%; height: 100%; object-fit: cover; filter: blur(22px); transform: scale(1.15); opacity: 0.28;"
                            />
                            <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(5,7,11,0.88) 0%, rgba(8,10,16,0.94) 100%);" />
                        </div>
                        <!-- Border accent using type color -->
                        <div style="position: relative; display: flex; gap: 14px; padding: 16px; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px;" :style="{ borderLeft: `3px solid ${selectedTypeColor}` }">
                            <!-- Cover -->
                            <div style="flex-shrink: 0; width: 88px; height: 124px; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 28px rgba(0,0,0,0.65);">
                                <img v-if="selectedContent.cover" :src="selectedContent.cover" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                                <div v-else style="width: 100%; height: 100%; background: rgba(255,255,255,0.025); display: flex; align-items: center; justify-content: center;">
                                    <IonIcon :icon="getTypeIcon(selectedContent.type)" style="font-size: 32px; color: rgba(233,237,242,0.28);" />
                                </div>
                            </div>

                            <!-- Info -->
                            <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 7px;">
                                <!-- Type badge + clear button -->
                                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                        <span :style="getTypeBadgeStyle(selectedContent.type)">{{ getTypeLabel(selectedContent.type) }}</span>
                                        <span v-if="selectedContent.status" :style="catStatusBadgeStyle(selectedContent.status)">{{ catStatusText(selectedContent.status) }}</span>
                                        <span v-if="selectedContent.is_adult" style="font-size: 9px; font-weight: 800; color: #ef6b6b; background: rgba(239,107,107,0.12); padding: 2px 6px; border-radius: 20px;">+18</span>
                                    </div>
                                    <button
                                        style="width: 26px; height: 26px; flex-shrink: 0; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.35); color: #9aa3b8; cursor: pointer; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center;"
                                        @click="clearContent"
                                    >×</button>
                                </div>

                                <!-- Title -->
                                <div style="font-size: 16px; font-weight: 800; color: #e9edf2; line-height: 1.25; letter-spacing: -0.02em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">{{ selectedContent.name }}</div>

                                <!-- Meta row: year · score · units/duration -->
                                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                    <span v-if="selectedContent.release_year" style="font-size: 11px; color: rgba(233,237,242,0.42);">{{ selectedContent.release_year }}</span>
                                    <template v-if="selectedContent.score != null">
                                        <span style="color: rgba(233,237,242,0.18); font-size: 10px;">·</span>
                                        <span style="font-size: 11px; color: #e6b85c; font-weight: 700;">★ {{ selectedContent.score }}</span>
                                    </template>
                                    <template v-if="selectedContent.type === 'movie' && selectedContent.duration_formatted">
                                        <span style="color: rgba(233,237,242,0.18); font-size: 10px;">·</span>
                                        <span style="font-size: 11px; color: rgba(233,237,242,0.42);">{{ selectedContent.duration_formatted }}</span>
                                    </template>
                                    <template v-else-if="selectedContent.total_units">
                                        <span style="color: rgba(233,237,242,0.18); font-size: 10px;">·</span>
                                        <span style="font-size: 11px; color: rgba(233,237,242,0.42);">{{ selectedContent.total_units }} {{ getUnitShort(selectedContent.type) }}</span>
                                    </template>
                                </div>

                                <!-- Genres -->
                                <div v-if="selectedContent.genres?.length" style="display: flex; gap: 4px; flex-wrap: wrap;">
                                    <span
                                        v-for="g in selectedContent.genres.slice(0, 3)"
                                        :key="g"
                                        style="font-size: 9px; color: rgba(233,237,242,0.42); background: rgba(255,255,255,0.04); padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.06);"
                                    >{{ g }}</span>
                                </div>

                                <!-- Synopsis preview -->
                                <div v-if="selectedContent.synopsis" style="font-size: 11px; color: rgba(233,237,242,0.42); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 2px;">{{ selectedContent.synopsis }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Search -->
                    <div v-else>
                        <div style="position: relative;">
                            <input
                                v-model="contentSearch"
                                type="text"
                                placeholder="Buscar no acervo..."
                                style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.025); border: 1.5px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 16px; font-size: 14px; color: #e9edf2; outline: none;"
                                @input="onContentSearch"
                            />
                        </div>
                        <div v-if="searchResults.length" style="margin-top: 4px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; max-height: 260px; overflow-y: auto;">
                            <div
                                v-for="c in searchResults"
                                :key="c.id"
                                style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.12s;"
                                @click="selectContent(c)"
                            >
                                <div style="width: 38px; height: 54px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center;">
                                    <img v-if="c.cover" :src="c.cover" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                                    <IonIcon v-else :icon="getTypeIcon(c.type)" style="font-size: 18px; color: rgba(233,237,242,0.28);" />
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-size: 13px; font-weight: 700; color: #e9edf2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px;">{{ c.name }}</div>
                                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                        <span :style="getTypeBadgeStyle(c.type)">{{ getTypeLabel(c.type) }}</span>
                                        <span v-if="c.score != null" style="font-size: 10px; color: #e6b85c; font-weight: 700;">★ {{ c.score }}</span>
                                        <span v-if="c.total_units" style="font-size: 10px; color: rgba(233,237,242,0.42);">{{ c.total_units }} {{ getUnitShort(c.type) }}</span>
                                        <span v-if="c.is_in_library" style="font-size: 9px; font-weight: 800; color: #f5a623; background: rgba(245,166,35,0.12); padding: 2px 7px; border-radius: 20px;">✓ Na lista</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Already in library warning -->
                <div
                    v-if="selectedContent?.is_in_library"
                    style="margin-bottom: 20px; background: rgba(245,166,35,0.07); border: 1px solid rgba(245,166,35,0.2); border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; gap: 12px;"
                >
                    <span style="font-size: 18px; flex-shrink: 0; color: #f5a623;">✓</span>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 13px; font-weight: 700; color: #f5a623; margin-bottom: 2px;">Já está na sua biblioteca</div>
                        <div style="font-size: 11px; color: rgba(233,237,242,0.42);">Este conteúdo já foi adicionado ao seu registro.</div>
                    </div>
                    <button
                        style="flex-shrink: 0; height: 34px; padding: 0 14px; border-radius: 10px; border: 1px solid rgba(245,166,35,0.35); background: rgba(245,166,35,0.1); color: #f5a623; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;"
                        @click="$router.push('/tabs/library')"
                    >Ver na biblioteca</button>
                </div>

                <template v-if="selectedContent && !selectedContent.is_in_library">
                    <!-- ── Status ── -->
                    <div style="margin-bottom: 20px;">
                        <div :style="sectionLabelStyle">Status</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <div
                                v-for="s in availableStatuses"
                                :key="s.value"
                                style="display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 13px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s; white-space: nowrap;"
                                :style="form.status === s.value
                                    ? { background: getStatusColor(s.value) + '22', color: getStatusColor(s.value), borderColor: getStatusColor(s.value) + '88' }
                                    : { background: 'rgba(255,255,255,0.025)', color: 'rgba(233,237,242,0.42)', borderColor: 'rgba(255,255,255,0.06)' }"
                                @click="selectStatus(s.value)"
                            >
                                <span style="width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;" :style="{ background: form.status === s.value ? getStatusColor(s.value) : 'rgba(255,255,255,0.12)' }"></span>
                                {{ s.label }}
                            </div>
                        </div>
                    </div>

                    <!-- ── Progress (not for movie) ── -->
                    <template v-if="!isMovie">
                        <!-- Current season (TV only — anime uses separate catalog entries per season) -->
                        <div v-if="isTv" style="margin-bottom: 16px;">
                            <div :style="sectionLabelStyle">Temporada atual</div>
                            <IonInput
                                :value="form.current_season"
                                type="number"
                                inputmode="numeric"
                                placeholder="1"
                                :min="1"
                                :max="selectedContent.total_seasons ?? undefined"
                                fill="outline"
                                class="neon-input"
                                @ionInput="form.current_season = Math.min(Number(($event as CustomEvent).detail.value) || 1, selectedContent.total_seasons ?? Infinity)"
                            />
                            <div v-if="selectedContent.season_episodes?.[String(form.current_season ?? 1)]" style="margin-top: 6px; font-size: 11px; color: rgba(233,237,242,0.42);">
                                {{ selectedContent.season_episodes[String(form.current_season ?? 1)] }} eps nesta temporada
                            </div>
                        </div>

                        <!-- Current units -->
                        <div style="margin-bottom: 20px;">
                            <div :style="sectionLabelStyle">
                                {{ isTv ? 'Episódio atual' : (selectedContent.type === 'anime' ? 'Episódio atual' : 'Capítulo atual') }}
                            </div>
                            <IonInput
                                :value="form.current_units"
                                type="number"
                                inputmode="numeric"
                                placeholder="0"
                                :min="0"
                                :max="seasonEpisodeLimit ?? undefined"
                                fill="outline"
                                class="neon-input"
                                @ionInput="form.current_units = Math.min(Number(($event as CustomEvent).detail.value) || 0, seasonEpisodeLimit ?? Infinity)"
                            />
                        </div>
                    </template>

                    <!-- ── Rating ── -->
                    <div style="margin-bottom: 20px;">
                        <div :style="sectionLabelStyle">Avaliação <span style="font-weight: 600; color: rgba(233,237,242,0.28); text-transform: none; letter-spacing: 0;">(opcional)</span></div>
                        <div style="display: flex; flex-wrap: wrap; gap: 7px;">
                            <div
                                v-for="n in ratingOptions"
                                :key="n"
                                style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s;"
                                :style="form.rating === n
                                    ? { background: ratingBg(n), color: ratingColor(n), borderColor: ratingColor(n) + '55' }
                                    : { background: 'rgba(255,255,255,0.025)', color: 'rgba(233,237,242,0.42)', borderColor: 'rgba(255,255,255,0.06)' }"
                                @click="form.rating = (form.rating === n ? null : n)"
                            >{{ n }}</div>
                        </div>
                        <div v-if="form.rating != null" style="margin-top: 8px; font-size: 12px; color: rgba(233,237,242,0.62); font-weight: 600;">
                            {{ ratingLabel(form.rating) }}
                        </div>
                    </div>

                    <!-- ── Site ── -->
                    <div style="margin-bottom: 20px;">
                        <div :style="sectionLabelStyle">Fonte <span style="font-weight: 600; color: rgba(233,237,242,0.28); text-transform: none; letter-spacing: 0;">(opcional)</span></div>
                        <SourceSelect :model-value="form.site_id" :sites="sites" @update:model-value="(v) => form.site_id = v ?? ''" />
                    </div>

                    <!-- ── Título no site de leitura (verificação de capítulos) ── -->
                    <div v-if="!isMovie" style="margin-bottom: 28px;">
                        <div :style="sectionLabelStyle">Título no site de leitura <span style="font-weight: 600; color: rgba(233,237,242,0.28); text-transform: none; letter-spacing: 0;">(para verificação de capítulos)</span></div>
                        <input
                            v-model="form.site_title"
                            type="text"
                            placeholder="Ex: Nano Machine, Reborn Rich"
                            style="width: 100%; box-sizing: border-box; background: var(--bg-tertiary); border: 1px solid var(--border-default); border-radius: 12px; padding: 12px 14px; font-size: 14px; color: var(--text-primary); outline: none;"
                        />
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.4;">Informe o título alternativo em inglês como aparece no seu site de leitura</div>
                    </div>

                    <IonButton expand="block" :disabled="saving || !canSubmit" @click="addContent" class="btn-primary" style="margin-bottom: 10px;">
                        <IonSpinner v-if="saving" name="crescent" />
                        <template v-else>Adicionar à Biblioteca</template>
                    </IonButton>
                </template>

                <IonButton expand="block" class="btn-cancel" @click="discard">Descartar</IonButton>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent,
    IonButton, IonIcon, IonSpinner, IonInput,
    toastController,
} from '@ionic/vue';
import SourceSelect from '@/components/SourceSelect.vue';
import { bookOutline, tvOutline, libraryOutline, filmOutline, desktopOutline } from 'ionicons/icons';
import {
    contentService, Content, ContentType, ContentCatalogStatus,
    CONTENT_TYPE_LABELS, CATALOG_STATUS_LABELS, CATALOG_STATUS_COLORS, UNIT_LABEL,
} from '@/services/contentService';
import { userSiteService, UserSite } from '@/services/userSiteService';
import { userContentService, ContentStatus, STATUS_LABELS, getStatusLabel } from '@/services/userContentService';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
    movie: filmOutline,
    tv: desktopOutline,
};

const TYPE_COLORS: Record<ContentType, string> = {
    manga:  '#f5a623',
    anime:  '#a78bfa',
    novel:  '#e6b85c',
    movie:  '#f472b6',
    tv:     '#7da7ff',
};

const STATUS_COLORS: Record<string, string> = {
    reading:      '#7da7ff',
    completed:    '#f5a623',
    paused:       '#e6b85c',
    dropped:      '#ef6b6b',
    plan_to_read: '#a78bfa',
};

const MOVIE_STATUSES: ContentStatus[] = ['plan_to_read', 'reading', 'completed'];

export default defineComponent({
    name: 'AddUserMangaPage',
    components: { IonPage, IonContent, IonButton, IonIcon, IonSpinner, IonInput, SourceSelect },
    data() {
        return {
            saving: false,
            searchResults: [] as Content[],
            searchLoading: false,
            selectedContentData: null as Content | null,
            searchTimer: null as ReturnType<typeof setTimeout> | null,
            sites: [] as UserSite[],
            contentSearch: '',
            ratingOptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            form: {
                content_id: null as number | null,
                site_id: '' as string | number,
                site_title: '',
                status: 'plan_to_read' as ContentStatus,
                current_units: 0,
                current_season: 1,
                rating: null as number | null,
            },
        };
    },
    computed: {
        selectedContent(): Content | null {
            return this.selectedContentData;
        },
        selectedTypeColor(): string {
            return TYPE_COLORS[this.selectedContent?.type ?? 'manga'] ?? '#f5a623';
        },
        isMovie(): boolean {
            return this.selectedContent?.type === 'movie';
        },
        isTv(): boolean {
            return this.selectedContent?.type === 'tv';
        },
        seasonEpisodeLimit(): number | null {
            const s = this.selectedContent;
            if (!s) return null;
            if (s.type === 'tv' && s.season_episodes) {
                const key = String(this.form.current_season ?? 1);
                return s.season_episodes[key] ?? s.total_units ?? null;
            }
            return s.total_units ?? null;
        },
        canSubmit(): boolean {
            return !!this.form.content_id && !this.selectedContent?.is_in_library;
        },
        availableStatuses() {
            const type = this.selectedContent?.type ?? 'manga';
            const keys: ContentStatus[] = this.isMovie ? MOVIE_STATUSES : (Object.keys(STATUS_LABELS) as ContentStatus[]);
            return keys.map((value) => ({ value, label: getStatusLabel(value, type) }));
        },
        sectionLabelStyle(): Record<string, string> {
            return {
                fontSize: '10px',
                fontWeight: '800',
                letterSpacing: '0.22em',
                color: 'rgba(233,237,242,0.42)',
                textTransform: 'uppercase',
                marginBottom: '10px',
            };
        },
    },
    async ionViewWillEnter() {
        await this.loadSites();
        this.resetForm();
        const contentId = this.$route.query.content_id;
        if (contentId) {
            await this.loadContentById(Number(contentId));
        }
    },
    methods: {
        async loadSites() {
            try {
                const sites = await userSiteService.getAll();
                this.sites = Array.isArray(sites) ? sites : (sites as any)?.data ?? [];
            } catch { /* non-blocking */ }
        },

        async loadContentById(id: number) {
            const content = await contentService.getById(id);
            if (content) this.selectContent(content);
            else this.form.content_id = id;
        },

        onContentSearch() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.doSearch(), 350);
        },

        async doSearch() {
            if (!this.contentSearch.trim()) { this.searchResults = []; return; }
            this.searchLoading = true;
            try {
                const result = await contentService.getAll({ search: this.contentSearch, per_page: 8 });
                this.searchResults = result.items;
            } catch { this.searchResults = []; }
            finally { this.searchLoading = false; }
        },

        selectContent(content: Content) {
            this.selectedContentData = content;
            this.form.content_id = content.id;
            this.contentSearch = '';
            this.searchResults = [];
            if (content.type === 'movie') this.form.status = 'plan_to_read';
        },

        clearContent() {
            this.selectedContentData = null;
            this.form.content_id = null;
            this.contentSearch = '';
            this.searchResults = [];
        },

        // Seleciona o status e, ao marcar "Completo", auto-preenche o progresso final.
        // Demais status não alteram o progresso.
        selectStatus(value: ContentStatus) {
            this.form.status = value;
            if (value !== 'completed') return;
            const c = this.selectedContent;
            if (!c || this.isMovie) return;

            if (this.isTv) {
                // Série: última temporada + episódios dessa temporada
                if (c.total_seasons) this.form.current_season = c.total_seasons;
                const lastKey = String(c.total_seasons ?? this.form.current_season ?? 1);
                const lastEps = c.season_episodes?.[lastKey];
                if (lastEps != null) this.form.current_units = lastEps;
                else if (c.total_units != null) this.form.current_units = c.total_units;
                // se ambos ausentes (em andamento): deixa em branco
            } else {
                // Manga / novel / anime: total de capítulos/episódios
                if (c.total_units != null) this.form.current_units = c.total_units;
                // se ausente (em andamento): deixa em branco
            }
        },

        resetForm() {
            this.form = { content_id: null, site_id: '', site_title: '', status: 'plan_to_read', current_units: 0, current_season: 1, rating: null };
            this.selectedContentData = null;
            this.searchResults = [];
            this.contentSearch = '';
        },

        async addContent() {
            if (!this.canSubmit) return;
            this.saving = true;
            try {
                const payload: any = {
                    content_id: this.form.content_id!,
                    status: this.form.status,
                };
                // O seletor lista fontes do usuário (user_sites), então envia user_site_id
                if (this.form.site_id) payload.user_site_id = Number(this.form.site_id);
                if (!this.isMovie) {
                    payload.current_units = this.form.current_units;
                    if (this.isTv) payload.current_season = this.form.current_season;
                }
                if (this.form.rating != null) payload.rating = this.form.rating;
                if (this.form.site_title.trim()) payload.site_title = this.form.site_title.trim();
                await userContentService.create(payload);
                const toast = await toastController.create({ message: 'Adicionado à biblioteca!', duration: 2000, color: 'success', position: 'top' });
                await toast.present();
                this.resetForm();
                this.$router.push('/tabs/library');
            } catch (err: any) {
                const apiMsg = err?.response?.data?.errors?.content_id?.[0]
                    ?? err?.response?.data?.message
                    ?? 'Falha ao adicionar.';
                const toast = await toastController.create({ message: apiMsg, duration: 3000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.saving = false;
            }
        },

        discard() {
            this.resetForm();
            this.$router.push('/tabs/library');
        },

        getStatusColor(value: string): string { return STATUS_COLORS[value] ?? '#6b738a'; },
        getTypeIcon(type: ContentType): string { return TYPE_ICONS[type] ?? bookOutline; },
        getTypeLabel(type: ContentType): string { return CONTENT_TYPE_LABELS[type] ?? type; },
        getUnitShort(type: ContentType): string { return UNIT_LABEL[type]?.short ?? 'cap.'; },

        catStatusText(status: ContentCatalogStatus): string {
            return CATALOG_STATUS_LABELS[status] ?? status;
        },
        catStatusBadgeStyle(status: ContentCatalogStatus): Record<string, string> {
            const col = CATALOG_STATUS_COLORS[status] ?? '#6b738a';
            return {
                fontSize: '9px', fontWeight: '700', letterSpacing: '0.04em',
                color: col, background: col + '18',
                padding: '2px 7px', borderRadius: '20px',
            };
        },

        getTypeBadgeStyle(type: ContentType): Record<string, string> {
            const col = TYPE_COLORS[type] ?? '#f5a623';
            return {
                fontSize: '9px', fontWeight: '800', letterSpacing: '0.06em',
                color: col, background: col + '1a',
                padding: '2px 7px', borderRadius: '20px',
            };
        },

        ratingBg(n: number): string {
            if (n >= 9) return 'rgba(245,166,35,0.15)';
            if (n >= 7) return 'rgba(125,167,255,0.15)';
            if (n >= 5) return 'rgba(230,184,92,0.15)';
            return 'rgba(239,107,107,0.12)';
        },
        ratingColor(n: number): string {
            if (n >= 9) return '#f5a623';
            if (n >= 7) return '#7da7ff';
            if (n >= 5) return '#e6b85c';
            return '#ef6b6b';
        },
        ratingLabel(n: number): string {
            const labels: Record<number, string> = {
                0: 'Horrível', 1: 'Muito ruim', 2: 'Ruim', 3: 'Fraco', 4: 'Abaixo da média',
                5: 'Mediano', 6: 'Bom', 7: 'Muito bom', 8: 'Ótimo', 9: 'Excelente', 10: 'Obra-prima',
            };
            return labels[n] ?? '';
        },
    },
});
</script>

<style scoped>
.btn-primary { --background: #f5a623; --color: #050608; --border-radius: 14px; font-weight: 800; height: 50px; }
.btn-cancel { --background: rgba(255,255,255,0.04); --color: rgba(233,237,242,0.42); --border-radius: 14px; height: 50px; }

.neon-input {
    --background: rgba(255,255,255,0.025);
    --color: #e9edf2;
    --placeholder-color: rgba(233,237,242,0.28);
    --border-color: rgba(255,255,255,0.06);
    --border-radius: 12px;
    --highlight-color-focused: #f5a623;
    --padding-start: 14px;
    --padding-end: 14px;
    min-height: 48px;
    width: 100%;
}

.neon-select {
    --background: rgba(255,255,255,0.025);
    --color: #e9edf2;
    --placeholder-color: rgba(233,237,242,0.28);
    --border-color: rgba(255,255,255,0.06);
    --border-radius: 12px;
    --highlight-color-focused: #f5a623;
    --padding-start: 14px;
    --padding-end: 14px;
    min-height: 48px;
    width: 100%;
}
</style>
