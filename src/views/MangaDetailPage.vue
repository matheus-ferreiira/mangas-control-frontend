<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div v-if="loading" style="display: flex; justify-content: center; padding: 80px 0;">
                <IonSpinner name="crescent" color="primary" />
            </div>

            <div v-else-if="item">
                <!-- Hero header -->
                <div style="position: relative; width: 100%; height: 240px; overflow: hidden;">
                    <img
                        v-if="headerImage"
                        :src="headerImage"
                        style="width: 100%; height: 100%; object-fit: cover; display: block;"
                        alt="Capa"
                    />
                    <div v-else style="width: 100%; height: 100%; background: linear-gradient(135deg, #141825, #1a2035); display: flex; align-items: center; justify-content: center;">
                        <IonIcon :icon="typeIcon" style="font-size: 64px; color: #1e2640;" />
                    </div>
                    <!-- Gradient overlay -->
                    <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(11,15,26,0.2) 0%, rgba(11,15,26,0.7) 60%, rgba(11,15,26,1) 100%);"></div>
                    <!-- Back button -->
                    <div style="position: absolute; left: 12px;" :style="{ top: 'max(12px, env(safe-area-inset-top, 12px))' }">
                        <button
                            style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #eef2ff; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;"
                            @click="$router.back()"
                        >‹</button>
                    </div>
                    <!-- Title area -->
                    <div style="position: absolute; bottom: 14px; left: 16px; right: 16px;">
                        <!-- Badges -->
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">
                            <span :style="typeBadgeStyle">{{ typeLabel }}</span>
                            <span v-if="catStatusLabel" :style="catStatusBadgeStyle">{{ catStatusLabel }}</span>
                            <span v-if="fullContent?.is_adult" style="font-size: 9px; font-weight: 800; color: #ef4444; background: rgba(239,68,68,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">+18</span>
                            <span v-if="isHighScore" style="font-size: 9px; font-weight: 800; color: #f59e0b; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">TOP</span>
                        </div>
                        <h1 style="font-size: 22px; font-weight: 800; color: #eef2ff; margin: 0; line-height: 1.25; letter-spacing: -0.02em;">{{ item.content?.name }}</h1>
                        <div v-if="fullContent?.alternative_names?.length" style="font-size: 11px; color: #5a6480; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ fullContent.alternative_names[0] }}</div>
                    </div>
                </div>

                <div style="padding: 14px 16px 96px;">
                    <!-- Stats grid -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
                        <div v-if="fullContent?.rating != null" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 15px; font-weight: 800; color: #f59e0b;">★ {{ fullContent.rating }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Nota</div>
                        </div>
                        <div v-if="fullContent?.score != null" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 15px; font-weight: 800; color: #00d4aa;">{{ fullContent.score }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Score</div>
                        </div>
                        <div v-if="fullContent?.release_year" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 15px; font-weight: 800; color: #eef2ff;">{{ fullContent.release_year }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Ano</div>
                        </div>
                        <!-- Type-specific stat -->
                        <div v-if="isMovie && fullContent?.duration_formatted" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 13px; font-weight: 800; color: #eef2ff;">{{ fullContent.duration_formatted }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Duração</div>
                        </div>
                        <div v-else-if="isTv && fullContent?.total_seasons" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 15px; font-weight: 800; color: #eef2ff;">{{ fullContent.total_seasons }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Temporadas</div>
                        </div>
                        <div v-else-if="fullContent?.total_units" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 15px; font-weight: 800; color: #eef2ff;">{{ fullContent.total_units }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">{{ unitShort }}</div>
                        </div>
                        <div v-if="fullContent?.country" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 14px; font-weight: 800; color: #eef2ff;">{{ fullContent.country }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">País</div>
                        </div>
                    </div>

                    <!-- Genres -->
                    <div v-if="genres.length" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;">
                        <span
                            v-for="g in genres"
                            :key="g"
                            style="font-size: 10px; font-weight: 600; color: #7a88aa; background: #141825; border: 1px solid #1e2640; padding: 3px 8px; border-radius: 6px;"
                        >{{ g }}</span>
                    </div>

                    <!-- Synopsis -->
                    <div v-if="synopsis" style="background: #141825; border: 1px solid #1e2640; border-radius: 14px; padding: 14px; margin-bottom: 16px;">
                        <div style="font-size: 12px; font-weight: 800; color: #eef2ff; margin-bottom: 8px; letter-spacing: 0.02em; text-transform: uppercase;">Sinopse</div>
                        <div
                            style="font-size: 12px; color: #7a88aa; line-height: 1.7; transition: all 0.2s;"
                            :style="synopsisExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: '4', WebkitBoxOrient: 'vertical', overflow: 'hidden' }"
                        >{{ synopsis }}</div>
                        <button
                            style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #00d4aa; background: none; border: none; cursor: pointer; padding: 0;"
                            @click="synopsisExpanded = !synopsisExpanded"
                        >{{ synopsisExpanded ? 'Ver menos ↑' : 'Ver mais ↓' }}</button>
                    </div>

                    <!-- Trailer -->
                    <div v-if="trailerEmbedUrl" style="background: #141825; border: 1px solid #1e2640; border-radius: 14px; overflow: hidden; margin-bottom: 16px;">
                        <iframe
                            :src="trailerEmbedUrl"
                            style="width: 100%; aspect-ratio: 16/9; border: none; display: block;"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        ></iframe>
                    </div>

                    <!-- My Record panel -->
                    <div style="background: #1a2035; border: 1px solid #1e2640; border-radius: 16px; padding: 16px; margin-bottom: 16px;">
                        <div style="font-size: 13px; font-weight: 800; color: #eef2ff; margin-bottom: 14px; letter-spacing: -0.01em;">Meu Registro</div>

                        <!-- Status -->
                        <div style="margin-bottom: 14px;">
                            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">Status</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                <div
                                    v-for="s in availableStatuses"
                                    :key="s.value"
                                    style="display: flex; align-items: center; gap: 5px; height: 30px; padding: 0 12px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s; white-space: nowrap;"
                                    :style="item.status === s.value
                                        ? { background: getStatusColor(s.value) + '22', color: getStatusColor(s.value), borderColor: getStatusColor(s.value) + '88' }
                                        : { background: '#141825', color: '#5a6480', borderColor: '#222840' }"
                                    @click="changeStatus(s.value)"
                                >
                                    <span style="width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;" :style="{ background: item.status === s.value ? getStatusColor(s.value) : '#4a5570' }"></span>
                                    {{ s.label }}
                                </div>
                            </div>
                        </div>

                        <!-- Progress (not for movie) -->
                        <template v-if="!isMovie">
                            <!-- Season (TV/Anime) -->
                            <div v-if="isTv" style="margin-bottom: 14px;">
                                <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">Temporada</div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <button
                                        style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid #1e2640; background: transparent; color: #eef2ff; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
                                        :disabled="saving || (item.current_season ?? 1) <= 1"
                                        @click="decrementSeason"
                                    >−</button>
                                    <div style="flex: 1; text-align: center; font-size: 28px; font-weight: 800; color: #eef2ff;">{{ item.current_season ?? 1 }}</div>
                                    <button
                                        style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid #00d4aa; background: #00d4aa; color: #000; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
                                        :disabled="saving"
                                        @click="incrementSeason"
                                    >+</button>
                                </div>
                            </div>

                            <!-- Episode / Chapter -->
                            <div style="margin-bottom: 14px;">
                                <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">
                                    {{ isTv ? 'Episódio' : (contentType === 'anime' ? 'Episódio' : 'Capítulo') }}
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <button
                                        style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid #1e2640; background: transparent; color: #eef2ff; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
                                        :disabled="saving || item.current_units <= 0"
                                        @click="decrement"
                                    >−</button>
                                    <div style="flex: 1; text-align: center;">
                                        <IonInput
                                            v-if="editingUnits"
                                            :value="unitsInput"
                                            type="number"
                                            inputmode="numeric"
                                            class="unit-input"
                                            min="0"
                                            ref="unitsField"
                                            @ionBlur="saveUnits"
                                            @ionInput="unitsInput = Number(($event as CustomEvent).detail.value) || 0"
                                        />
                                        <span
                                            v-else
                                            style="font-size: 32px; font-weight: 800; color: #eef2ff; cursor: pointer; line-height: 1;"
                                            @click="startEditUnits"
                                        >{{ item.current_units }}</span>
                                    </div>
                                    <button
                                        style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid #00d4aa; background: #00d4aa; color: #000; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
                                        :disabled="saving"
                                        @click="increment"
                                    >+</button>
                                </div>
                                <!-- Progress bar -->
                                <div v-if="!isOngoing" style="margin-top: 10px;">
                                    <div style="height: 3px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                                        <div style="height: 100%; border-radius: 3px; transition: width 0.3s;" :style="{ width: progressPct + '%', background: statusColor }"></div>
                                    </div>
                                    <div style="font-size: 10px; color: #4a5470; margin-top: 4px;">{{ item.current_units }} / {{ item.content?.total_units }} {{ unitShort }} · {{ progressPct }}%</div>
                                </div>
                            </div>
                        </template>

                        <!-- Rating grid -->
                        <div style="margin-bottom: 14px;">
                            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">Avaliação (0–10)</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                <div
                                    v-for="n in ratingOptions"
                                    :key="n"
                                    style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s;"
                                    :style="item.rating === n
                                        ? { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.4)' }
                                        : { background: '#141825', color: '#5a6480', borderColor: '#222840' }"
                                    @click="changeRating(item.rating === n ? null : n)"
                                >{{ n }}</div>
                            </div>
                        </div>

                        <!-- Site -->
                        <div v-if="sites.length">
                            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #4a5470; text-transform: uppercase; margin-bottom: 8px;">Fonte</div>
                            <IonSelect
                                v-model="selectedSiteId"
                                :compareWith="(o1: any, o2: any) => Number(o1) === Number(o2)"
                                placeholder="Sem fonte"
                                fill="outline"
                                interface="action-sheet"
                                class="neon-select"
                                @ionChange="changeSite"
                            >
                                <IonSelectOption value="">Sem fonte</IonSelectOption>
                                <IonSelectOption v-for="site in sites" :key="site.id" :value="site.id">{{ site.name }}</IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>

                    <!-- Votes info -->
                    <div v-if="fullContent?.votes_count" style="text-align: center; font-size: 11px; color: #4a5470; margin-bottom: 12px;">
                        {{ fullContent.votes_count.toLocaleString('pt-BR') }} avaliações
                    </div>

                    <!-- Delete — subtle link-style -->
                    <div style="display: flex; justify-content: center; padding-top: 4px;">
                        <button
                            style="background: none; border: none; cursor: pointer; font-size: 12px; font-weight: 600; color: #3a4460; display: flex; align-items: center; gap: 5px; padding: 8px 16px; border-radius: 10px; transition: color 0.15s;"
                            @click="confirmDelete"
                            onmouseenter="this.style.color='#ef4444'"
                            onmouseleave="this.style.color='#3a4460'"
                        >
                            <IonIcon :icon="trashOutline" style="font-size: 13px;" />
                            Remover da biblioteca
                        </button>
                    </div>
                </div>
            </div>
        </IonContent>

        <IonLoading :is-open="saving" message="Salvando..." spinner="crescent" />
    </IonPage>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import {
    IonPage, IonContent, IonIcon, IonSpinner, IonLoading,
    IonButton, IonSelect, IonSelectOption, IonInput,
    toastController, alertController,
} from '@ionic/vue';
import { bookOutline, tvOutline, libraryOutline, filmOutline, desktopOutline, trashOutline } from 'ionicons/icons';
import { userContentService, UserContent, ContentStatus, STATUS_LABELS, getStatusLabel } from '@/services/userContentService';
import { siteService, Site } from '@/services/siteService';
import { contentService, Content, ContentType, CONTENT_TYPE_LABELS, UNIT_LABEL, CATALOG_STATUS_LABELS, CATALOG_STATUS_COLORS } from '@/services/contentService';

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

const STATUS_COLORS: Record<ContentStatus, string> = {
    reading: '#3b82f6',
    completed: '#10b981',
    paused: '#f59e0b',
    dropped: '#ef4444',
    plan_to_read: '#8b5cf6',
};

const MOVIE_STATUSES: ContentStatus[] = ['plan_to_read', 'reading', 'completed'];

export default defineComponent({
    name: 'MangaDetailPage',
    components: { IonPage, IonContent, IonIcon, IonSpinner, IonLoading, IonButton, IonSelect, IonSelectOption, IonInput },
    data() {
        return {
            loading: false,
            saving: false,
            item: null as UserContent | null,
            fullContent: null as Content | null,
            sites: [] as Site[],
            editingUnits: false,
            unitsInput: 0,
            selectedSiteId: '' as string | number,
            synopsisExpanded: false,
            ratingOptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            trashOutline,
        };
    },
    computed: {
        contentType(): ContentType {
            return this.item?.content?.type ?? 'manga';
        },
        typeIcon(): string {
            return TYPE_ICONS[this.contentType];
        },
        typeLabel(): string {
            return CONTENT_TYPE_LABELS[this.contentType];
        },
        typeBadgeStyle(): Record<string, string> {
            const col = TYPE_BADGE_STYLES[this.contentType]?.color ?? '#00d4aa';
            return {
                fontSize: '9px', fontWeight: '800', letterSpacing: '0.07em',
                color: col, background: col + '20',
                padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase',
            };
        },
        catStatusLabel(): string {
            const s = this.fullContent?.status ?? this.item?.content?.status;
            return s ? (CATALOG_STATUS_LABELS[s] ?? '') : '';
        },
        catStatusBadgeStyle(): Record<string, string> {
            const s = this.fullContent?.status ?? this.item?.content?.status;
            const col = s ? (CATALOG_STATUS_COLORS[s] ?? '#4a5470') : '#4a5470';
            return {
                fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em',
                color: col, background: col + '18',
                padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase',
            };
        },
        isMovie(): boolean { return this.contentType === 'movie'; },
        isTv(): boolean { return this.contentType === 'tv' || this.contentType === 'anime'; },
        isOngoing(): boolean { return !this.item?.content?.total_units; },
        isHighScore(): boolean {
            const s = this.fullContent?.score ?? this.fullContent?.rating ?? this.item?.content?.score ?? 0;
            return s >= 9;
        },
        unitShort(): string { return UNIT_LABEL[this.contentType]?.short ?? 'cap.'; },
        statusColor(): string { return this.item ? (STATUS_COLORS[this.item.status] ?? '#5a6480') : '#5a6480'; },
        progressPct(): number {
            const total = this.item?.content?.total_units;
            const current = this.item?.current_units ?? 0;
            if (!total) return 0;
            return Math.min(Math.round((current / total) * 100), 100);
        },
        headerImage(): string {
            return this.fullContent?.background || this.fullContent?.cover || this.item?.content?.cover || '';
        },
        synopsis(): string {
            return this.fullContent?.synopsis || '';
        },
        trailerEmbedUrl(): string {
            return this.fullContent?.trailer_embed_url || '';
        },
        genres(): string[] {
            return this.fullContent?.genres ?? this.item?.content?.genres ?? [];
        },
        availableStatuses() {
            const keys: ContentStatus[] = this.isMovie ? MOVIE_STATUSES : (Object.keys(STATUS_LABELS) as ContentStatus[]);
            return keys.map((value) => ({ value, label: getStatusLabel(value, this.contentType) }));
        },
    },
    async ionViewWillEnter() {
        await this.loadData();
    },
    methods: {
        async loadData() {
            this.loading = true;
            const id = Number(this.$route.params.id);
            try {
                const [item, sites] = await Promise.all([userContentService.getOne(id), siteService.getAll()]);
                this.item = item;
                this.sites = Array.isArray(sites) ? sites : (sites as any)?.data ?? [];
                this.selectedSiteId = item?.site?.id ? String(item.site.id) : '';
                if (item.content_id) {
                    contentService.getById(item.content_id).then((c) => { if (c) this.fullContent = c; });
                }
            } catch {
                const toast = await toastController.create({ message: 'Falha ao carregar.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
                this.$router.back();
            } finally {
                this.loading = false;
            }
        },

        patchItem(updated: UserContent) {
            if (updated.content === undefined && this.item?.content) updated.content = this.item.content;
            if (updated.site === undefined && this.item?.site) updated.site = this.item.site;
            this.item = updated;
        },

        getStatusColor(status: ContentStatus): string { return STATUS_COLORS[status] ?? '#5a6480'; },

        async increment() {
            if (!this.item) return;
            this.saving = true;
            try { this.patchItem(await userContentService.increment(this.item.id)); }
            catch { await this.showError('Falha ao atualizar progresso.'); }
            finally { this.saving = false; }
        },

        async decrement() {
            if (!this.item || this.item.current_units <= 0) return;
            this.saving = true;
            try { this.patchItem(await userContentService.update(this.item.id, { current_units: this.item.current_units - 1 })); }
            catch { await this.showError('Falha ao atualizar progresso.'); }
            finally { this.saving = false; }
        },

        async incrementSeason() {
            if (!this.item) return;
            this.saving = true;
            try { this.patchItem(await userContentService.update(this.item.id, { current_season: (this.item.current_season ?? 1) + 1 })); }
            catch { await this.showError('Falha ao atualizar temporada.'); }
            finally { this.saving = false; }
        },

        async decrementSeason() {
            if (!this.item || (this.item.current_season ?? 1) <= 1) return;
            this.saving = true;
            try { this.patchItem(await userContentService.update(this.item.id, { current_season: (this.item.current_season ?? 1) - 1 })); }
            catch { await this.showError('Falha ao atualizar temporada.'); }
            finally { this.saving = false; }
        },

        async startEditUnits() {
            if (!this.item) return;
            this.unitsInput = this.item.current_units;
            this.editingUnits = true;
            await nextTick();
            (this.$refs.unitsField as HTMLInputElement)?.focus();
        },

        async saveUnits() {
            if (!this.item) return;
            this.editingUnits = false;
            if (this.unitsInput === this.item.current_units) return;
            this.saving = true;
            try { this.patchItem(await userContentService.update(this.item.id, { current_units: this.unitsInput })); }
            catch { await this.showError('Falha ao salvar progresso.'); }
            finally { this.saving = false; }
        },

        async changeStatus(status: ContentStatus) {
            if (!this.item || this.item.status === status) return;
            this.saving = true;
            try { this.patchItem(await userContentService.update(this.item.id, { status })); }
            catch { await this.showError('Falha ao atualizar status.'); }
            finally { this.saving = false; }
        },

        async changeRating(value: number | null) {
            if (!this.item) return;
            this.saving = true;
            try { this.patchItem(await userContentService.update(this.item.id, { rating: value ?? undefined })); }
            catch { await this.showError('Falha ao salvar avaliação.'); }
            finally { this.saving = false; }
        },

        async changeSite() {
            if (!this.item) return;
            this.saving = true;
            try {
                this.patchItem(await userContentService.update(this.item.id, {
                    site_id: this.selectedSiteId ? Number(this.selectedSiteId) : undefined,
                }));
            } catch { await this.showError('Falha ao atualizar fonte.'); }
            finally { this.saving = false; }
        },

        async confirmDelete() {
            const alert = await alertController.create({
                header: 'Remover',
                message: 'Remover este item da sua biblioteca?',
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Remover', role: 'destructive', handler: () => this.deleteItem() },
                ],
            });
            await alert.present();
        },

        async deleteItem() {
            if (!this.item) return;
            this.saving = true;
            try {
                await userContentService.delete(this.item.id);
                const toast = await toastController.create({ message: 'Removido da biblioteca.', duration: 2000, color: 'success', position: 'top' });
                await toast.present();
                this.$router.back();
            } catch { await this.showError('Falha ao remover.'); }
            finally { this.saving = false; }
        },

        async showError(msg: string) {
            const toast = await toastController.create({ message: msg, duration: 2000, color: 'danger', position: 'top' });
            await toast.present();
        },
    },
});
</script>

<style scoped>
.unit-input {
    --background: transparent;
    --color: #eef2ff;
    --highlight-color-focused: #00d4aa;
    --border-color: #00d4aa;
    --padding-start: 0;
    --padding-end: 0;
    font-size: 32px;
    font-weight: 800;
    text-align: center;
    width: 80px;
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

button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
