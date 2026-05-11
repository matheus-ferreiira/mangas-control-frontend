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
                    <div v-else style="width: 100%; height: 100%; background: linear-gradient(135deg, rgba(8,10,16,0.8), rgba(5,7,11,1)); display: flex; align-items: center; justify-content: center;">
                        <IonIcon :icon="typeIcon" style="font-size: 64px; color: rgba(255,255,255,0.06);" />
                    </div>
                    <!-- Gradient overlay -->
                    <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(5,7,11,0.2) 0%, rgba(5,7,11,0.7) 60%, rgba(5,7,11,1) 100%);"></div>
                    <!-- Back button -->
                    <div style="position: absolute; left: 12px;" :style="{ top: 'max(12px, env(safe-area-inset-top, 12px))' }">
                        <button
                            style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #e9edf2; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;"
                            @click="$router.back()"
                        >‹</button>
                    </div>
                    <!-- Title area -->
                    <div style="position: absolute; bottom: 14px; left: 16px; right: 16px;">
                        <!-- Badges -->
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">
                            <span :style="typeBadgeStyle">{{ typeLabel }}</span>
                            <span v-if="catStatusLabel" :style="catStatusBadgeStyle">{{ catStatusLabel }}</span>
                            <span v-if="fullContent?.is_adult" style="font-size: 9px; font-weight: 800; color: #FF5E5E; background: rgba(239,107,107,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">+18</span>
                            <span v-if="isHighScore" style="font-size: 9px; font-weight: 800; color: #F5C542; background: rgba(230,184,92,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">TOP</span>
                        </div>
                        <h1 style="font-size: 22px; font-weight: 800; color: #e9edf2; margin: 0; line-height: 1.25; letter-spacing: -0.02em; font-family: 'Sora', system-ui, sans-serif;">{{ item.content?.name }}</h1>
                        <div v-if="fullContent?.alternative_names?.length" style="font-size: 11px; color: rgba(233,237,242,0.42); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ fullContent.alternative_names[0] }}</div>
                    </div>
                </div>

                <div style="padding: 14px 16px 96px;">
                    <!-- Stats row -->
                    <div style="display: flex; align-items: stretch; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden;">
                        <div v-if="fullContent?.rating != null" style="flex: 1; padding: 12px 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06);">
                            <div style="font-size: 18px; font-weight: 800; color: #F5C542; font-family: 'Sora', system-ui, sans-serif;">★ {{ fullContent.rating }}</div>
                            <div style="font-size: 9px; color: rgba(233,237,242,0.42); text-transform: uppercase; letter-spacing: 0.14em; margin-top: 3px;">Nota</div>
                        </div>
                        <div v-if="fullContent?.score != null" style="flex: 1; padding: 12px 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06);">
                            <div style="font-size: 18px; font-weight: 800; color: #00F5A0; font-family: 'Sora', system-ui, sans-serif;">{{ fullContent.score }}</div>
                            <div style="font-size: 9px; color: rgba(233,237,242,0.42); text-transform: uppercase; letter-spacing: 0.14em; margin-top: 3px;">Score</div>
                        </div>
                        <div v-if="fullContent?.release_year" style="flex: 1; padding: 12px 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06);">
                            <div style="font-size: 18px; font-weight: 800; color: #e9edf2; font-family: 'Sora', system-ui, sans-serif;">{{ fullContent.release_year }}</div>
                            <div style="font-size: 9px; color: rgba(233,237,242,0.42); text-transform: uppercase; letter-spacing: 0.14em; margin-top: 3px;">Ano</div>
                        </div>
                        <div v-if="isMovie && fullContent?.duration_formatted" style="flex: 1; padding: 12px 8px; text-align: center;">
                            <div style="font-size: 15px; font-weight: 800; color: #e9edf2; font-family: 'Sora', system-ui, sans-serif;">{{ fullContent.duration_formatted }}</div>
                            <div style="font-size: 9px; color: rgba(233,237,242,0.42); text-transform: uppercase; letter-spacing: 0.14em; margin-top: 3px;">Duração</div>
                        </div>
                        <div v-else-if="isTv && fullContent?.total_seasons" style="flex: 1; padding: 12px 8px; text-align: center;">
                            <div style="font-size: 18px; font-weight: 800; color: #e9edf2; font-family: 'Sora', system-ui, sans-serif;">{{ fullContent.total_seasons }}</div>
                            <div style="font-size: 9px; color: rgba(233,237,242,0.42); text-transform: uppercase; letter-spacing: 0.14em; margin-top: 3px;">Temporadas</div>
                        </div>
                        <div v-else-if="fullContent?.total_units" style="flex: 1; padding: 12px 8px; text-align: center;">
                            <div style="font-size: 18px; font-weight: 800; color: #e9edf2; font-family: 'Sora', system-ui, sans-serif;">{{ fullContent.total_units }}</div>
                            <div style="font-size: 9px; color: rgba(233,237,242,0.42); text-transform: uppercase; letter-spacing: 0.14em; margin-top: 3px;">{{ unitShort }}</div>
                        </div>
                    </div>

                    <!-- Genres -->
                    <div v-if="genres.length" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;">
                        <span
                            v-for="g in genres"
                            :key="g"
                            style="font-size: 10px; font-weight: 600; color: rgba(233,237,242,0.42); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 6px;"
                        >{{ g }}</span>
                    </div>

                    <!-- Synopsis -->
                    <div v-if="synopsis" style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 14px; margin-bottom: 16px;">
                        <div style="font-size: 10px; font-weight: 800; color: rgba(233,237,242,0.42); margin-bottom: 8px; letter-spacing: 0.22em; text-transform: uppercase;">Sinopse</div>
                        <div
                            style="font-size: 12px; color: rgba(233,237,242,0.62); line-height: 1.7; transition: all 0.2s;"
                            :style="synopsisExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: '4', WebkitBoxOrient: 'vertical', overflow: 'hidden' }"
                        >{{ synopsis }}</div>
                        <button
                            style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #00F5A0; background: none; border: none; cursor: pointer; padding: 0;"
                            @click="synopsisExpanded = !synopsisExpanded"
                        >{{ synopsisExpanded ? 'Ver menos ↑' : 'Ver mais ↓' }}</button>
                    </div>

                    <!-- Trailer -->
                    <div v-if="trailerEmbedUrl" style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; margin-bottom: 16px;">
                        <iframe
                            :src="trailerEmbedUrl"
                            style="width: 100%; aspect-ratio: 16/9; border: none; display: block;"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        ></iframe>
                    </div>

                    <!-- My Record panel -->
                    <div style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px; margin-bottom: 16px;">
                        <div style="font-size: 13px; font-weight: 800; color: #e9edf2; margin-bottom: 14px; letter-spacing: -0.01em;">Meu Registro</div>

                        <!-- Status -->
                        <div style="margin-bottom: 14px;">
                            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; color: rgba(233,237,242,0.42); text-transform: uppercase; margin-bottom: 8px;">Status</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                <div
                                    v-for="s in availableStatuses"
                                    :key="s.value"
                                    style="display: flex; align-items: center; gap: 5px; height: 30px; padding: 0 12px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s; white-space: nowrap;"
                                    :style="item.status === s.value
                                        ? { background: getStatusColor(s.value) + '22', color: getStatusColor(s.value), borderColor: getStatusColor(s.value) + '88' }
                                        : { background: 'rgba(255,255,255,0.025)', color: 'rgba(233,237,242,0.42)', borderColor: 'rgba(255,255,255,0.06)' }"
                                    @click="changeStatus(s.value)"
                                >
                                    <span style="width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;" :style="{ background: item.status === s.value ? getStatusColor(s.value) : 'rgba(255,255,255,0.12)' }"></span>
                                    {{ s.label }}
                                </div>
                            </div>
                        </div>

                        <!-- Progress (not for movie) -->
                        <template v-if="!isMovie">
                            <!-- Season (TV only — anime tracks season as separate entries) -->
                            <div v-if="isTv" style="margin-bottom: 14px;">
                                <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; color: rgba(233,237,242,0.42); text-transform: uppercase; margin-bottom: 8px;">Temporada</div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <button
                                        style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025); color: #e9edf2; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
                                        :disabled="saving || (item.current_season ?? 1) <= 1"
                                        @click="decrementSeason"
                                    >−</button>
                                    <div style="flex: 1; text-align: center; line-height: 1.1;">
                                        <div style="font-size: 28px; font-weight: 800; color: #e9edf2; font-family: 'Sora', system-ui, sans-serif;">{{ item.current_season ?? 1 }}</div>
                                        <div v-if="item.content?.total_seasons" style="font-size: 10px; color: rgba(233,237,242,0.42);">de {{ item.content.total_seasons }}</div>
                                    </div>
                                    <button
                                        style="width: 36px; height: 36px; border-radius: 10px; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;"
                                        :style="atSeasonLimit
                                            ? { border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.025)', color: 'rgba(233,237,242,0.18)', cursor: 'not-allowed' }
                                            : { border: '1px solid #00F5A0', background: '#00F5A0', color: '#05070b' }"
                                        :disabled="saving || atSeasonLimit"
                                        @click="incrementSeason"
                                    >+</button>
                                </div>
                                <div v-if="item.content?.season_episodes?.[String(item.current_season ?? 1)]" style="margin-top: 6px; font-size: 11px; color: rgba(233,237,242,0.42); text-align: center;">
                                    {{ item.content.season_episodes[String(item.current_season ?? 1)] }} eps nesta temporada
                                </div>
                            </div>

                            <!-- Episode / Chapter -->
                            <div style="margin-bottom: 14px;">
                                <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; color: rgba(233,237,242,0.42); text-transform: uppercase; margin-bottom: 8px;">
                                    {{ isTv ? 'Episódio' : (contentType === 'anime' ? 'Episódio' : 'Capítulo') }}
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <button
                                        style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025); color: #e9edf2; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
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
                                            :max="seasonEpisodeLimit ?? undefined"
                                            ref="unitsField"
                                            @ionBlur="saveUnits"
                                            @ionInput="unitsInput = Math.min(Number(($event as CustomEvent).detail.value) || 0, seasonEpisodeLimit ?? Infinity)"
                                        />
                                        <span
                                            v-else
                                            style="font-size: 32px; font-weight: 800; color: #e9edf2; cursor: pointer; line-height: 1; font-family: 'Sora', system-ui, sans-serif;"
                                            @click="startEditUnits"
                                        >{{ item.current_units }}</span>
                                    </div>
                                    <button
                                        style="width: 36px; height: 36px; border-radius: 10px; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;"
                                        :style="atLimit
                                            ? { border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.025)', color: 'rgba(233,237,242,0.18)', cursor: 'not-allowed' }
                                            : { border: '1px solid #00F5A0', background: '#00F5A0', color: '#05070b' }"
                                        :disabled="saving || atLimit"
                                        @click="increment"
                                    >+</button>
                                </div>
                                <!-- Progress bar -->
                                <div v-if="!isOngoing" style="margin-top: 10px;">
                                    <div style="height: 3px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                                        <div style="height: 100%; border-radius: 3px; transition: width 0.3s;" :style="{ width: progressPct + '%', background: statusColor }"></div>
                                    </div>
                                    <div style="font-size: 10px; color: rgba(233,237,242,0.42); margin-top: 4px;">{{ item.current_units }} / {{ seasonEpisodeLimit ?? '?' }} {{ unitShort }} · {{ progressPct }}%</div>
                                </div>
                            </div>
                        </template>

                        <!-- Rating grid -->
                        <div style="margin-bottom: 14px;">
                            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; color: rgba(233,237,242,0.42); text-transform: uppercase; margin-bottom: 8px;">Avaliação (0–10)</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                <div
                                    v-for="n in ratingOptions"
                                    :key="n"
                                    style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s;"
                                    :style="item.rating === n
                                        ? { background: 'rgba(230,184,92,0.15)', color: '#F5C542', borderColor: 'rgba(230,184,92,0.4)' }
                                        : { background: 'rgba(255,255,255,0.025)', color: 'rgba(233,237,242,0.42)', borderColor: 'rgba(255,255,255,0.06)' }"
                                    @click="changeRating(item.rating === n ? null : n)"
                                >{{ n }}</div>
                            </div>
                        </div>

                        <!-- Site -->
                        <div v-if="sites.length">
                            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; color: rgba(233,237,242,0.42); text-transform: uppercase; margin-bottom: 8px;">Fonte</div>
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
                    <div v-if="fullContent?.votes_count" style="text-align: center; font-size: 11px; color: rgba(233,237,242,0.42); margin-bottom: 12px;">
                        {{ fullContent.votes_count.toLocaleString('pt-BR') }} avaliações
                    </div>

                    <!-- Delete — subtle link-style -->
                    <div style="display: flex; justify-content: center; padding-top: 4px;">
                        <button
                            style="background: none; border: none; cursor: pointer; font-size: 12px; font-weight: 600; color: rgba(233,237,242,0.28); display: flex; align-items: center; gap: 5px; padding: 8px 16px; border-radius: 10px; transition: color 0.15s;"
                            @click="confirmDelete"
                            onmouseenter="this.style.color='#FF5E5E'"
                            onmouseleave="this.style.color='rgba(233,237,242,0.28)'"
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
    manga:  { color: '#00F5A0' },
    anime:  { color: '#B8A4FF' },
    novel:  { color: '#F5C542' },
    movie:  { color: '#FF7EC7' },
    tv:     { color: '#7CAEFF' },
};

const STATUS_COLORS: Record<ContentStatus, string> = {
    reading:      '#7CAEFF',
    completed:    '#00F5A0',
    paused:       '#F5C542',
    dropped:      '#FF5E5E',
    plan_to_read: '#B8A4FF',
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
            const col = TYPE_BADGE_STYLES[this.contentType]?.color ?? '#00F5A0';
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
        isTv(): boolean { return this.contentType === 'tv'; },
        isOngoing(): boolean { return !this.item?.content?.total_units; },
        seasonEpisodeLimit(): number | null {
            const seasonEps = this.item?.content?.season_episodes;
            if (this.contentType === 'tv' && seasonEps) {
                const key = String(this.item?.current_season ?? 1);
                return seasonEps[key] ?? this.item?.content?.total_units ?? null;
            }
            return this.item?.content?.total_units ?? null;
        },
        atSeasonLimit(): boolean {
            const total = this.item?.content?.total_seasons;
            if (!total) return false;
            return (this.item?.current_season ?? 1) >= total;
        },
        isHighScore(): boolean {
            const s = this.fullContent?.score ?? this.fullContent?.rating ?? this.item?.content?.score ?? 0;
            return s >= 9;
        },
        unitShort(): string { return UNIT_LABEL[this.contentType]?.short ?? 'cap.'; },
        statusColor(): string { return this.item ? (STATUS_COLORS[this.item.status] ?? '#5a6480') : '#5a6480'; },
        progressPct(): number {
            const total = this.seasonEpisodeLimit;
            const current = this.item?.current_units ?? 0;
            if (!total) return 0;
            return Math.min(Math.round((current / total) * 100), 100);
        },
        atLimit(): boolean {
            const total = this.seasonEpisodeLimit;
            if (!total) return false;
            return (this.item?.current_units ?? 0) >= total;
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
            catch (err: any) {
                const msg = err?.response?.data?.message ?? 'Falha ao atualizar progresso.';
                await this.showError(msg);
            }
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
            try { this.patchItem(await userContentService.update(this.item.id, { current_season: (this.item.current_season ?? 1) + 1, current_units: 0 })); }
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
    --color: #e9edf2;
    --highlight-color-focused: #00F5A0;
    --border-color: #00F5A0;
    --padding-start: 0;
    --padding-end: 0;
    font-size: 32px;
    font-weight: 800;
    text-align: center;
    width: 80px;
}

.neon-select {
    --background: rgba(255,255,255,0.025);
    --color: #e9edf2;
    --placeholder-color: rgba(233,237,242,0.28);
    --border-color: rgba(255,255,255,0.06);
    --border-radius: 12px;
    --highlight-color-focused: #00F5A0;
    --padding-start: 14px;
    --padding-end: 14px;
    min-height: 48px;
    width: 100%;
}

button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
