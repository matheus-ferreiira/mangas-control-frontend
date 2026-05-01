<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div style="padding: 0 16px 96px; padding-top: max(16px, env(safe-area-inset-top, 16px));">
                <!-- Header -->
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 20px; font-weight: 800; color: #eef2ff; letter-spacing: -0.02em; margin-bottom: 2px;">Adicionar à Biblioteca</div>
                    <div style="font-size: 12px; color: #4a5470;">Busque e adicione uma obra ao seu registro</div>
                </div>

                <!-- Content search / selected -->
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">Obra</div>

                    <!-- Selected card -->
                    <div v-if="selectedContent" style="background: #1a2035; border: 1px solid rgba(0,212,170,0.35); border-radius: 14px; padding: 14px; display: flex; gap: 12px;">
                        <div style="flex-shrink: 0; width: 60px; height: 84px; border-radius: 8px; overflow: hidden; background: #141825; display: flex; align-items: center; justify-content: center;">
                            <img v-if="selectedContent.cover" :src="selectedContent.cover" style="width: 100%; height: 100%; object-fit: cover;" />
                            <IonIcon v-else :icon="getTypeIcon(selectedContent.type)" style="font-size: 24px; color: #4a5470;" />
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                                <div style="font-size: 15px; font-weight: 800; color: #eef2ff; line-height: 1.3; flex: 1; min-width: 0;">{{ selectedContent.name }}</div>
                                <button
                                    style="width: 28px; height: 28px; border-radius: 8px; border: 1px solid #1e2640; background: #141825; color: #8892aa; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
                                    @click="clearContent"
                                >×</button>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">
                                <span :style="getTypeBadgeStyle(selectedContent.type)">{{ getTypeLabel(selectedContent.type) }}</span>
                                <span v-if="selectedContent.release_year" style="font-size: 11px; color: #4a5470;">{{ selectedContent.release_year }}</span>
                                <span v-if="selectedContent.rating != null" style="font-size: 11px; color: #f59e0b;">★ {{ selectedContent.rating }}</span>
                            </div>
                            <div v-if="selectedContent.genres?.length" style="display: flex; gap: 4px; flex-wrap: wrap;">
                                <span v-for="g in selectedContent.genres.slice(0, 3)" :key="g" style="font-size: 9px; color: #4a5470; background: #141825; padding: 2px 6px; border-radius: 4px; border: 1px solid #1e2640;">{{ g }}</span>
                            </div>
                            <div v-if="selectedContent.alternative_names?.length" style="font-size: 10px; color: #4a5470; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ selectedContent.alternative_names.slice(0, 2).join(' · ') }}</div>
                            <div v-if="selectedContent.synopsis" style="font-size: 11px; color: #5a6480; margin-top: 6px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{{ selectedContent.synopsis }}</div>
                            <!-- Type-specific info -->
                            <div style="font-size: 10px; color: #4a5470; margin-top: 4px;">
                                <template v-if="selectedContent.type === 'movie'">
                                    <span v-if="selectedContent.duration_formatted">{{ selectedContent.duration_formatted }}</span>
                                </template>
                                <template v-else-if="selectedContent.type === 'tv'">
                                    <span v-if="selectedContent.total_seasons">{{ selectedContent.total_seasons }} temp. · </span>
                                    <span v-if="selectedContent.total_units">{{ selectedContent.total_units }} ep.</span>
                                    <span v-else>Em andamento</span>
                                </template>
                                <template v-else>
                                    <span v-if="selectedContent.total_units">{{ selectedContent.total_units }} {{ getUnitShort(selectedContent.type) }}</span>
                                    <span v-else>Em andamento</span>
                                </template>
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
                                style="width: 100%; box-sizing: border-box; background: #141825; border: 1px solid #1e2640; border-radius: 12px; padding: 12px 16px; font-size: 14px; color: #eef2ff; outline: none;"
                                @input="onContentSearch"
                            />
                        </div>
                        <div v-if="searchResults.length" style="margin-top: 4px; background: #141825; border: 1px solid #1e2640; border-radius: 12px; overflow: hidden; max-height: 240px; overflow-y: auto;">
                            <div
                                v-for="c in searchResults"
                                :key="c.id"
                                style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; cursor: pointer; border-bottom: 1px solid #1e2640;"
                                @click="selectContent(c)"
                            >
                                <div style="width: 36px; height: 50px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: #0b0f1a; display: flex; align-items: center; justify-content: center;">
                                    <img v-if="c.cover" :src="c.cover" style="width: 100%; height: 100%; object-fit: cover;" />
                                    <IonIcon v-else :icon="getTypeIcon(c.type)" style="font-size: 18px; color: #4a5470;" />
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-size: 13px; font-weight: 700; color: #eef2ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ c.name }}</div>
                                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px; flex-wrap: wrap;">
                                        <span :style="getTypeBadgeStyle(c.type)">{{ getTypeLabel(c.type) }}</span>
                                        <span v-if="c.total_units" style="font-size: 10px; color: #4a5470;">{{ c.total_units }} {{ getUnitShort(c.type) }}</span>
                                        <span v-if="c.rating != null" style="font-size: 10px; color: #f59e0b;">★ {{ c.rating }}</span>
                                        <span v-if="c.is_in_library" style="font-size: 9px; font-weight: 800; color: #00d4aa; background: rgba(0,212,170,0.12); padding: 2px 7px; border-radius: 20px; letter-spacing: 0.04em;">✓ Na lista</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Already in library warning -->
                <div
                    v-if="selectedContent?.is_in_library"
                    style="margin-bottom: 20px; background: rgba(0,212,170,0.08); border: 1px solid rgba(0,212,170,0.25); border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; gap: 12px;"
                >
                    <span style="font-size: 20px; flex-shrink: 0;">✓</span>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 13px; font-weight: 700; color: #00d4aa; margin-bottom: 2px;">Já está na sua biblioteca</div>
                        <div style="font-size: 11px; color: #4a5470;">Este conteúdo já foi adicionado ao seu registro.</div>
                    </div>
                    <button
                        style="flex-shrink: 0; height: 34px; padding: 0 14px; border-radius: 10px; border: 1px solid rgba(0,212,170,0.4); background: rgba(0,212,170,0.12); color: #00d4aa; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;"
                        @click="$router.push('/tabs/library')"
                    >Ver na biblioteca</button>
                </div>

                <template v-if="selectedContent && !selectedContent.is_in_library">
                    <!-- Status -->
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">Status</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <div
                                v-for="s in availableStatuses"
                                :key="s.value"
                                style="display: flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s; white-space: nowrap;"
                                :style="form.status === s.value
                                    ? { background: getStatusColor(s.value) + '22', color: getStatusColor(s.value), borderColor: getStatusColor(s.value) + '88' }
                                    : { background: '#141825', color: '#5a6480', borderColor: '#222840' }"
                                @click="form.status = s.value"
                            >
                                <span style="width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;" :style="{ background: form.status === s.value ? getStatusColor(s.value) : '#4a5570' }"></span>
                                {{ s.label }}
                            </div>
                        </div>
                    </div>

                    <!-- Progress (not for movie) -->
                    <template v-if="!isMovie">
                        <!-- Current season (TV/Anime) -->
                        <div v-if="isTv" style="margin-bottom: 16px;">
                            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">Temporada atual</div>
                            <IonInput
                                :value="form.current_season"
                                type="number"
                                inputmode="numeric"
                                placeholder="1"
                                :min="1"
                                fill="outline"
                                class="neon-input"
                                @ionInput="form.current_season = Number(($event as CustomEvent).detail.value) || 1"
                            />
                        </div>

                        <!-- Current units -->
                        <div style="margin-bottom: 20px;">
                            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">
                                {{ isTv ? 'Episódio atual' : (selectedContent.type === 'anime' ? 'Episódio atual' : 'Capítulo atual') }}
                            </div>
                            <IonInput
                                :value="form.current_units"
                                type="number"
                                inputmode="numeric"
                                placeholder="0"
                                :min="0"
                                :max="selectedContent.total_units ?? undefined"
                                fill="outline"
                                class="neon-input"
                                @ionInput="form.current_units = Math.min(Number(($event as CustomEvent).detail.value) || 0, selectedContent.total_units ?? Infinity)"
                            />
                        </div>
                    </template>

                    <!-- Rating -->
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">Avaliação (opcional)</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <div
                                v-for="n in ratingOptions"
                                :key="n"
                                style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s;"
                                :style="form.rating === n
                                    ? { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.4)' }
                                    : { background: '#141825', color: '#5a6480', borderColor: '#222840' }"
                                @click="form.rating = (form.rating === n ? null : n)"
                            >{{ n }}</div>
                        </div>
                    </div>

                    <!-- Site (optional) -->
                    <div style="margin-bottom: 24px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">Fonte <span style="color: #2e3650; font-weight: 600;">(opcional)</span></div>
                        <IonSelect
                            v-model="form.site_id"
                            placeholder="Sem fonte"
                            fill="outline"
                            interface="action-sheet"
                            class="neon-select"
                        >
                            <IonSelectOption value="">Sem fonte</IonSelectOption>
                            <IonSelectOption v-for="s in sites" :key="s.id" :value="s.id">{{ s.name }}</IonSelectOption>
                        </IonSelect>
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
    IonButton, IonIcon, IonSpinner, IonInput, IonSelect, IonSelectOption,
    toastController,
} from '@ionic/vue';
import { bookOutline, tvOutline, libraryOutline, filmOutline, desktopOutline } from 'ionicons/icons';
import { contentService, Content, ContentType, CONTENT_TYPE_LABELS, UNIT_LABEL } from '@/services/contentService';
import { userSiteService, UserSite } from '@/services/userSiteService';
import { userContentService, ContentStatus, STATUS_LABELS, getStatusLabel } from '@/services/userContentService';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
    movie: filmOutline,
    tv: desktopOutline,
};

const TYPE_BADGE_STYLES: Record<ContentType, { color: string }> = {
    manga:  { color: '#00d4aa' },
    anime:  { color: '#8b5cf6' },
    novel:  { color: '#f59e0b' },
    movie:  { color: '#ec4899' },
    tv:     { color: '#06b6d4' },
};

const STATUS_COLORS: Record<string, string> = {
    reading: '#3b82f6',
    completed: '#10b981',
    paused: '#f59e0b',
    dropped: '#ef4444',
    plan_to_read: '#8b5cf6',
};

const MOVIE_STATUSES: ContentStatus[] = ['plan_to_read', 'reading', 'completed'];

export default defineComponent({
    name: 'AddUserMangaPage',
    components: { IonPage, IonContent, IonButton, IonIcon, IonSpinner, IonInput, IonSelect, IonSelectOption },
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
        isMovie(): boolean {
            return this.selectedContent?.type === 'movie';
        },
        isTv(): boolean {
            return this.selectedContent?.type === 'tv' || this.selectedContent?.type === 'anime';
        },
        canSubmit(): boolean {
            return !!this.form.content_id && !this.selectedContent?.is_in_library;
        },
        availableStatuses() {
            const type = this.selectedContent?.type ?? 'manga';
            const keys: ContentStatus[] = this.isMovie ? MOVIE_STATUSES : (Object.keys(STATUS_LABELS) as ContentStatus[]);
            return keys.map((value) => ({ value, label: getStatusLabel(value, type) }));
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

        resetForm() {
            this.form = { content_id: null, site_id: '', status: 'plan_to_read', current_units: 0, current_season: 1, rating: null };
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
                if (this.form.site_id) payload.site_id = Number(this.form.site_id);
                if (!this.isMovie) {
                    payload.current_units = this.form.current_units;
                    if (this.isTv) payload.current_season = this.form.current_season;
                }
                if (this.form.rating != null) payload.rating = this.form.rating;
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

        getStatusColor(value: string): string { return STATUS_COLORS[value] ?? '#5a6480'; },
        getTypeIcon(type: ContentType): string { return TYPE_ICONS[type] ?? bookOutline; },
        getTypeLabel(type: ContentType): string { return CONTENT_TYPE_LABELS[type] ?? type; },
        getUnitShort(type: ContentType): string { return UNIT_LABEL[type]?.short ?? 'cap.'; },
        getTypeBadgeStyle(type: ContentType): Record<string, string> {
            const col = TYPE_BADGE_STYLES[type]?.color ?? '#00d4aa';
            return {
                fontSize: '9px', fontWeight: '800', letterSpacing: '0.07em',
                color: col, background: col + '20',
                padding: '2px 7px', borderRadius: '20px',
            };
        },
    },
});
</script>

<style scoped>
.btn-primary { --background: #00d4aa; --color: #000; --border-radius: 14px; font-weight: 700; height: 50px; }
.btn-cancel { --background: #1a2035; --color: #8892aa; --border-radius: 14px; height: 50px; }

.neon-input {
    --background: #1a2035;
    --color: #eef2ff;
    --placeholder-color: #4a5570;
    --border-color: #1e2640;
    --border-radius: 12px;
    --highlight-color-focused: #00d4aa;
    --padding-start: 14px;
    --padding-end: 14px;
    min-height: 48px;
    width: 100%;
}

.neon-select {
    --background: #1a2035;
    --color: #eef2ff;
    --placeholder-color: #4a5570;
    --border-color: #1e2640;
    --border-radius: 12px;
    --highlight-color-focused: #00d4aa;
    --padding-start: 14px;
    --padding-end: 14px;
    min-height: 48px;
    width: 100%;
}
</style>
