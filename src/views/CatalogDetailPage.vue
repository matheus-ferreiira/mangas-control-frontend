<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div v-if="loading" style="display: flex; justify-content: center; padding: 80px 0;">
                <IonSpinner name="crescent" color="primary" />
            </div>

            <div v-else-if="content">
                <!-- Hero header -->
                <div style="position: relative; width: 100%; height: 260px; overflow: hidden;">
                    <img
                        v-if="headerImage"
                        :src="headerImage"
                        style="width: 100%; height: 100%; object-fit: cover; display: block;"
                        alt="Capa"
                    />
                    <div v-else style="width: 100%; height: 100%; background: linear-gradient(135deg, #141825, #1a2035); display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 72px; opacity: 0.3;">{{ typeEmoji }}</span>
                    </div>
                    <!-- Gradient overlay -->
                    <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(11,15,26,0.2) 0%, rgba(11,15,26,0.65) 55%, rgba(11,15,26,1) 100%);"></div>
                    <!-- Back button -->
                    <div style="position: absolute; left: 12px;" :style="{ top: 'max(12px, env(safe-area-inset-top, 12px))' }">
                        <button
                            style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #eef2ff; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;"
                            @click="$router.back()"
                        >‹</button>
                    </div>
                    <!-- Title area -->
                    <div style="position: absolute; bottom: 16px; left: 16px; right: 16px;">
                        <!-- Badges -->
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 7px;">
                            <span :style="typeBadgeStyle">{{ typeLabel }}</span>
                            <span v-if="catStatusLabel" :style="catStatusBadgeStyle">{{ catStatusLabel }}</span>
                            <span v-if="content.is_adult" style="font-size: 9px; font-weight: 800; color: #ef4444; background: rgba(239,68,68,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">+18</span>
                            <span v-if="isHighScore" style="font-size: 9px; font-weight: 800; color: #f59e0b; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">TOP</span>
                            <span v-if="content.is_in_library" style="font-size: 9px; font-weight: 800; color: #00d4aa; background: rgba(0,212,170,0.12); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">✓ Na lista</span>
                        </div>
                        <h1 style="font-size: 22px; font-weight: 800; color: #eef2ff; margin: 0; line-height: 1.25; letter-spacing: -0.02em;">{{ content.name }}</h1>
                        <div v-if="content.alternative_names?.length" style="font-size: 11px; color: #5a6480; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            {{ content.alternative_names[0] }}
                        </div>
                    </div>
                </div>

                <div style="padding: 14px 16px 100px;">
                    <!-- Stats grid -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
                        <div v-if="content.rating != null" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 15px; font-weight: 800; color: #f59e0b;">★ {{ content.rating.toFixed(1) }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Nota</div>
                        </div>
                        <div v-if="content.score != null" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 15px; font-weight: 800; color: #00d4aa;">{{ content.score }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Score</div>
                        </div>
                        <div v-if="content.release_year" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 15px; font-weight: 800; color: #eef2ff;">{{ content.release_year }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Ano</div>
                        </div>
                        <div v-if="isMovie && content.duration_formatted" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 13px; font-weight: 800; color: #eef2ff;">{{ content.duration_formatted }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Duração</div>
                        </div>
                        <div v-else-if="isTv && content.total_seasons" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 15px; font-weight: 800; color: #eef2ff;">{{ content.total_seasons }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Temporadas</div>
                        </div>
                        <div v-else-if="content.total_units" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 15px; font-weight: 800; color: #eef2ff;">{{ content.total_units }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">{{ unitShort }}</div>
                        </div>
                        <div v-if="content.country" style="background: #1a2035; border: 1px solid #1e2640; border-radius: 12px; padding: 10px 6px; text-align: center;">
                            <div style="font-size: 14px; font-weight: 800; color: #eef2ff;">{{ content.country }}</div>
                            <div style="font-size: 9px; font-weight: 600; color: #4a5470; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">País</div>
                        </div>
                    </div>

                    <!-- Genres -->
                    <div v-if="content.genres?.length" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                        <span
                            v-for="g in content.genres"
                            :key="g"
                            style="font-size: 10px; font-weight: 600; color: #7a88aa; background: #141825; border: 1px solid #1e2640; padding: 3px 8px; border-radius: 6px;"
                        >{{ g }}</span>
                    </div>

                    <!-- Synopsis -->
                    <div v-if="content.synopsis" style="background: #141825; border: 1px solid #1e2640; border-radius: 14px; padding: 14px; margin-bottom: 16px;">
                        <div style="font-size: 12px; font-weight: 800; color: #eef2ff; margin-bottom: 8px; letter-spacing: 0.02em; text-transform: uppercase;">Sinopse</div>
                        <div
                            style="font-size: 12px; color: #7a88aa; line-height: 1.7; transition: all 0.2s;"
                            :style="synopsisExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: '4', WebkitBoxOrient: 'vertical', overflow: 'hidden' }"
                        >{{ content.synopsis }}</div>
                        <button
                            style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #00d4aa; background: none; border: none; cursor: pointer; padding: 0;"
                            @click="synopsisExpanded = !synopsisExpanded"
                        >{{ synopsisExpanded ? 'Ver menos ↑' : 'Ver mais ↓' }}</button>
                    </div>

                    <!-- Trailer -->
                    <div v-if="content.trailer_embed_url" style="background: #141825; border: 1px solid #1e2640; border-radius: 14px; overflow: hidden; margin-bottom: 16px;">
                        <iframe
                            :src="content.trailer_embed_url"
                            style="width: 100%; aspect-ratio: 16/9; border: none; display: block;"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        ></iframe>
                    </div>

                    <!-- Alternative names -->
                    <div v-if="content.alternative_names && content.alternative_names.length > 1" style="background: #141825; border: 1px solid #1e2640; border-radius: 14px; padding: 14px; margin-bottom: 16px;">
                        <div style="font-size: 12px; font-weight: 800; color: #eef2ff; margin-bottom: 10px; letter-spacing: 0.02em; text-transform: uppercase;">Títulos Alternativos</div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div
                                v-for="(alt, i) in content.alternative_names"
                                :key="i"
                                style="font-size: 12px; color: #7a88aa;"
                            >{{ alt }}</div>
                        </div>
                    </div>

                    <!-- Meta info -->
                    <div v-if="content.original_language || content.votes_count" style="background: #141825; border: 1px solid #1e2640; border-radius: 14px; padding: 14px; margin-bottom: 16px;">
                        <div style="font-size: 12px; font-weight: 800; color: #eef2ff; margin-bottom: 10px; letter-spacing: 0.02em; text-transform: uppercase;">Informações</div>
                        <div v-if="content.original_language" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 12px; color: #4a5470;">Idioma original</span>
                            <span style="font-size: 12px; font-weight: 600; color: #7a88aa;">{{ content.original_language }}</span>
                        </div>
                        <div v-if="content.votes_count" style="display: flex; justify-content: space-between;">
                            <span style="font-size: 12px; color: #4a5470;">Avaliações</span>
                            <span style="font-size: 12px; font-weight: 600; color: #7a88aa;">{{ content.votes_count.toLocaleString('pt-BR') }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error state -->
            <div v-else-if="!loading" style="text-align: center; padding: 80px 24px;">
                <div style="font-size: 40px; margin-bottom: 14px; opacity: 0.5;">😕</div>
                <div style="font-size: 15px; font-weight: 700; color: #7a87a8; margin-bottom: 20px;">Conteúdo não encontrado</div>
                <button
                    style="padding: 10px 24px; border-radius: 12px; border: 1px solid #1e2640; background: transparent; color: #4a5470; cursor: pointer; font-size: 13px; font-weight: 700;"
                    @click="$router.back()"
                >Voltar</button>
            </div>
        </IonContent>

        <!-- Floating action button -->
        <div v-if="content" style="position: fixed; bottom: 0; left: 0; right: 0; padding: 16px; background: linear-gradient(to top, #0b0f1a 60%, transparent); pointer-events: none; z-index: 10;">
            <button
                v-if="content.is_in_library"
                style="width: 100%; padding: 15px; border-radius: 16px; border: 1.5px solid rgba(0,212,170,0.4); background: rgba(0,212,170,0.1); color: #00d4aa; font-size: 15px; font-weight: 800; cursor: pointer; pointer-events: all; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;"
                @click="goToLibrary"
            >
                <span>✓</span> Ver na biblioteca
            </button>
            <button
                v-else
                style="width: 100%; padding: 15px; border-radius: 16px; border: none; background: linear-gradient(135deg, #00d4aa, #00b894); color: #000; font-size: 15px; font-weight: 800; cursor: pointer; pointer-events: all; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 20px rgba(0,212,170,0.35); transition: all 0.2s;"
                @click="addToLibrary"
            >
                <span style="font-size: 18px; font-weight: 900;">+</span> Adicionar à Biblioteca
            </button>
        </div>

        <IonLoading :is-open="actionLoading" message="Aguarde..." spinner="crescent" />
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonSpinner, IonLoading, toastController } from '@ionic/vue';
import {
    contentService, Content, ContentType,
    CONTENT_TYPE_LABELS, CATALOG_STATUS_LABELS, CATALOG_STATUS_COLORS, UNIT_LABEL,
} from '@/services/contentService';

const TYPE_BADGE_COLOR: Record<ContentType, string> = {
    manga: '#00d4aa',
    anime: '#8b5cf6',
    novel: '#f59e0b',
    movie: '#ec4899',
    tv:    '#06b6d4',
};

const TYPE_EMOJI: Record<ContentType, string> = {
    manga: '📖',
    anime: '🎬',
    novel: '📝',
    movie: '🎥',
    tv:    '📺',
};

export default defineComponent({
    name: 'CatalogDetailPage',
    components: { IonPage, IonContent, IonSpinner, IonLoading },
    data() {
        return {
            loading: false,
            actionLoading: false,
            content: null as Content | null,
            synopsisExpanded: false,
        };
    },
    computed: {
        contentType(): ContentType {
            return this.content?.type ?? 'manga';
        },
        typeLabel(): string {
            return CONTENT_TYPE_LABELS[this.contentType];
        },
        typeEmoji(): string {
            return TYPE_EMOJI[this.contentType];
        },
        typeBadgeStyle(): Record<string, string> {
            const col = TYPE_BADGE_COLOR[this.contentType] ?? '#00d4aa';
            return {
                fontSize: '9px', fontWeight: '800', letterSpacing: '0.07em',
                color: col, background: col + '20',
                padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase',
            };
        },
        catStatusLabel(): string {
            const s = this.content?.status;
            return s ? (CATALOG_STATUS_LABELS[s] ?? '') : '';
        },
        catStatusBadgeStyle(): Record<string, string> {
            const s = this.content?.status;
            const col = s ? (CATALOG_STATUS_COLORS[s] ?? '#4a5470') : '#4a5470';
            return {
                fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em',
                color: col, background: col + '18',
                padding: '2px 7px', borderRadius: '20px',
            };
        },
        isHighScore(): boolean {
            return (this.content?.score ?? this.content?.rating ?? 0) >= 9;
        },
        isMovie(): boolean { return this.contentType === 'movie'; },
        isTv(): boolean { return this.contentType === 'tv' || this.contentType === 'anime'; },
        unitShort(): string { return UNIT_LABEL[this.contentType]?.short ?? 'cap.'; },
        headerImage(): string {
            return this.content?.background || this.content?.cover || '';
        },
    },
    async ionViewWillEnter() {
        this.synopsisExpanded = false;
        await this.loadContent();
    },
    methods: {
        async loadContent() {
            this.loading = true;
            const id = Number(this.$route.params.id);
            try {
                this.content = await contentService.getById(id);
            } catch {
                this.content = null;
            } finally {
                this.loading = false;
            }
        },

        addToLibrary() {
            if (!this.content) return;
            this.$router.push({ path: '/tabs/add', query: { content_id: this.content.id } });
        },

        goToLibrary() {
            this.$router.push('/tabs/library');
        },
    },
});
</script>
