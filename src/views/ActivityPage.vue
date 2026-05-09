<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
                <IonRefresherContent pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" pulling-text="" refreshing-text="" />
            </IonRefresher>

            <div style="padding: 0 0 100px;">
                <!-- Header -->
                <div style="padding: 20px 18px 12px;">
                    <div style="font-size: 11px; color: #6b738a; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 2px;">ATIVIDADE</div>
                    <div style="font-size: 24px; font-weight: 900; color: #eef0f5; letter-spacing: -0.03em; line-height: 1.1;">Histórico</div>
                </div>

                <!-- Type filter chips -->
                <div v-if="!loading && allItems.length > 0" class="no-scrollbar" style="overflow-x: auto; padding: 0 18px 14px;">
                    <div style="display: flex; gap: 6px; min-width: max-content;">
                        <button
                            v-for="chip in typeChips"
                            :key="chip.value ?? 'all'"
                            :style="typeChipStyle(chip.value)"
                            @click="activeType = chip.value"
                        >{{ chip.label }}</button>
                    </div>
                </div>

                <!-- Loading skeleton -->
                <div v-if="loading" style="padding: 0 18px;">
                    <div v-for="i in 6" :key="i" style="background: #1a1f2e; border: 1px solid #262d40; border-radius: 12px; margin-bottom: 8px; display: flex; gap: 12px; padding: 10px; align-items: center;" :style="{ opacity: 1 - i * 0.12 }">
                        <div style="width: 42px; height: 60px; border-radius: 6px; background: #222837; flex-shrink: 0;"></div>
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 7px;">
                            <div style="height: 12px; border-radius: 4px; width: 35%;" class="skeleton"></div>
                            <div style="height: 14px; border-radius: 4px; width: 65%;" class="skeleton"></div>
                            <div style="height: 11px; border-radius: 4px; width: 50%;" class="skeleton"></div>
                        </div>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-else-if="allItems.length === 0" style="text-align: center; padding: 64px 28px;">
                    <div style="width: 72px; height: 72px; border-radius: 36px; background: #1a1f2e; border: 1px solid #262d40; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b738a" stroke-width="1.7" stroke-linecap="round"><path d="M3 12h4l3-7 4 14 3-7h4"/></svg>
                    </div>
                    <div style="font-size: 15px; font-weight: 700; color: #eef0f5; margin-bottom: 6px;">Nenhuma atividade ainda</div>
                    <div style="font-size: 12px; color: #6b738a; line-height: 1.6;">Adicione itens à biblioteca e registre seu progresso</div>
                </div>

                <!-- Timeline grouped by day -->
                <div v-else style="padding: 0 18px;">
                    <template v-for="group in groupedActivity" :key="group.day">
                        <div style="margin-bottom: 24px;">
                            <div style="font-size: 10px; color: #6b738a; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px;">{{ group.day }}</div>
                            <div
                                v-for="item in group.items"
                                :key="item.id"
                                style="display: flex; gap: 14px; padding: 12px 14px; border-radius: 14px; cursor: pointer; margin-bottom: 8px; align-items: center; background: #1a1f2e; border: 1px solid #262d40; animation: fadeIn 0.2s ease;"
                                @click="$router.push(`/catalog/${item.contentId}`)"
                            >
                                <!-- Cover -->
                                <div :style="coverStyle(item.type)">
                                    <img
                                        v-if="item.cover"
                                        :src="item.cover"
                                        :alt="item.title"
                                        style="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 7px;"
                                    />
                                    <span v-else style="font-size: 16px; font-weight: 900; color: inherit;">{{ typeShort(item.type) }}</span>
                                </div>

                                <!-- Info -->
                                <div style="flex: 1; min-width: 0;">
                                    <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 5px;">
                                        <span :style="eventIconStyle(item.eventType)">
                                            <component :is="'span'" v-html="eventIcon(item.eventType)"></component>
                                        </span>
                                        <span :style="{ fontSize: '11px', fontWeight: '700', color: eventColor(item.eventType) }">{{ eventLabel(item.eventType) }}</span>
                                        <span style="font-size: 11px; color: #4a5169;">·</span>
                                        <span style="font-size: 11px; color: #6b738a;">{{ item.timeAgo }}</span>
                                    </div>
                                    <div style="font-size: 14px; font-weight: 800; color: #eef0f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em;">{{ item.title }}</div>
                                    <div style="font-size: 12px; color: #9aa3b8; margin-top: 3px;">{{ item.description }}</div>
                                </div>

                                <!-- Chevron -->
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b738a" stroke-width="1.7" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { userContentService, UserContent } from '@/services/userContentService';
import { ContentType } from '@/services/contentService';

interface ActivityItem {
    id: number;
    contentId: number;
    title: string;
    cover: string | undefined;
    type: string;
    eventType: 'progress' | 'completed' | 'rated' | 'added' | 'paused';
    description: string;
    timeAgo: string;
    sortDate: number;
    dayKey: string;
}

const TYPE_SHORT: Record<string, string> = { manga: 'M', anime: 'A', novel: 'N', movie: 'F', tv: 'S' };
const TYPE_COLOR: Record<string, string> = { manga: '#5eead4', anime: '#a78bfa', novel: '#fbbf24', movie: '#f472b6', tv: '#22d3ee' };

function fmtTimeAgo(iso: string): string {
    const d = (Date.now() - new Date(iso).getTime()) / 1000;
    if (d < 60)     return 'agora';
    if (d < 3600)   return `${Math.floor(d / 60)}min`;
    if (d < 86400)  return `${Math.floor(d / 3600)}h`;
    if (d < 604800) return `${Math.floor(d / 86400)}d`;
    return `${Math.floor(d / 604800)}sem`;
}

function dayKey(iso: string): string {
    const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (d === 0) return 'Hoje';
    if (d === 1) return 'Ontem';
    if (d < 7)   return 'Esta semana';
    if (d < 30)  return 'Este mês';
    return 'Mais antigo';
}

const DAY_ORDER = ['Hoje', 'Ontem', 'Esta semana', 'Este mês', 'Mais antigo'];

export default defineComponent({
    name: 'ActivityPage',
    components: { IonPage, IonContent, IonRefresher, IonRefresherContent },
    data() {
        return {
            loading: false,
            allItems: [] as ActivityItem[],
            activeType: null as ContentType | null,
        };
    },
    computed: {
        typeChips(): { value: ContentType | null; label: string; color: string }[] {
            const TYPE_COLORS: Record<string, string> = { manga: '#5eead4', anime: '#a78bfa', novel: '#fbbf24', movie: '#f472b6', tv: '#22d3ee' };
            const TYPE_LABELS: Record<string, string> = { manga: 'Manga', anime: 'Anime', novel: 'Novel', movie: 'Filme', tv: 'Série' };
            const present = new Set(this.allItems.map(i => i.type));
            const chips: { value: ContentType | null; label: string; color: string }[] = [
                { value: null, label: 'Todos', color: '#5eead4' },
            ];
            for (const t of ['manga', 'anime', 'novel', 'movie', 'tv']) {
                if (present.has(t)) chips.push({ value: t as ContentType, label: TYPE_LABELS[t], color: TYPE_COLORS[t] });
            }
            return chips;
        },
        filteredItems(): ActivityItem[] {
            return this.activeType ? this.allItems.filter(i => i.type === this.activeType) : this.allItems;
        },
        groupedActivity(): { day: string; items: ActivityItem[] }[] {
            const groups: Record<string, ActivityItem[]> = {};
            for (const item of this.filteredItems) {
                (groups[item.dayKey] = groups[item.dayKey] || []).push(item);
            }
            return DAY_ORDER.filter(d => groups[d]?.length).map(d => ({ day: d, items: groups[d] }));
        },
    },
    async ionViewWillEnter() {
        await this.loadActivity();
    },
    methods: {
        async loadActivity() {
            this.loading = true;
            try {
                const contents = await userContentService.getAll();
                this.allItems = this.buildActivityItems(contents);
            } catch { /* silent */ } finally {
                this.loading = false;
            }
        },
        buildActivityItems(contents: UserContent[]): ActivityItem[] {
            const items: ActivityItem[] = [];
            for (const uc of contents) {
                const dateStr = uc.last_interacted_at ?? uc.last_unit_update ?? uc.content?.last_unit_update;
                if (!dateStr) continue;
                const title = uc.content?.name ?? 'Desconhecido';
                const type = uc.content?.type ?? 'manga';
                const isWatch = type === 'anime' || type === 'tv' || type === 'movie';
                const unit = (type === 'anime' || type === 'tv') ? 'Ep' : type === 'movie' ? '' : 'Cap';

                let eventType: ActivityItem['eventType'] = 'progress';
                let description = '';

                if (uc.status === 'completed') {
                    eventType = 'completed';
                    description = type === 'movie' ? 'Concluiu o filme' : `Concluiu ${isWatch ? 'a série' : 'a obra'}`;
                } else if (uc.status === 'paused') {
                    eventType = 'paused';
                    description = 'Pausado';
                } else if (uc.current_units > 0) {
                    eventType = 'progress';
                    description = unit ? `${unit} ${uc.current_units}` : 'Assistiu';
                } else {
                    eventType = 'added';
                    description = 'Adicionou à biblioteca';
                }

                items.push({
                    id: uc.id,
                    contentId: uc.content?.id ?? uc.content_id,
                    title,
                    cover: uc.content?.cover,
                    type,
                    eventType,
                    description,
                    timeAgo: fmtTimeAgo(dateStr),
                    sortDate: new Date(dateStr).getTime(),
                    dayKey: dayKey(dateStr),
                });
            }
            return items.sort((a, b) => b.sortDate - a.sortDate);
        },
        async handleRefresh(event: CustomEvent) {
            await this.loadActivity();
            (event.target as HTMLIonRefresherElement).complete();
        },
        typeChipStyle(val: ContentType | null): Record<string, string> {
            const active = this.activeType === val;
            const TYPE_COLORS: Record<string, string> = { manga: '#5eead4', anime: '#a78bfa', novel: '#fbbf24', movie: '#f472b6', tv: '#22d3ee' };
            const col = val ? (TYPE_COLORS[val] ?? '#5eead4') : '#5eead4';
            return {
                padding: '6px 13px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: '700',
                background: active ? col : '#1a1f2e',
                color: active ? '#0d1117' : '#9aa3b8',
                outline: active ? 'none' : '1px solid #262d40',
                transition: 'all 0.15s', flexShrink: '0',
            };
        },
        coverStyle(type: string): Record<string, string> {
            const col = TYPE_COLOR[type] ?? '#5eead4';
            return {
                width: '54px', height: '76px', borderRadius: '7px', flexShrink: '0',
                background: `linear-gradient(135deg, ${col}22, #222837)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: col, overflow: 'hidden', position: 'relative',
            };
        },
        typeShort(type: string): string { return TYPE_SHORT[type] ?? '?'; },
        eventColor(t: ActivityItem['eventType']): string {
            const m: Record<string, string> = {
                progress: '#60a5fa', completed: '#34d399', rated: '#fbbf24', added: '#5eead4', paused: '#fbbf24',
            };
            return m[t] ?? '#9aa3b8';
        },
        eventLabel(t: ActivityItem['eventType']): string {
            const m: Record<string, string> = {
                progress: 'Progresso', completed: 'Concluído', rated: 'Avaliação', added: 'Adicionado', paused: 'Pausado',
            };
            return m[t] ?? 'Atualizado';
        },
        eventIcon(t: ActivityItem['eventType']): string {
            const m: Record<string, string> = {
                progress: '▶', completed: '✓', rated: '★', added: '+', paused: '⏸',
            };
            return m[t] ?? '·';
        },
        eventIconStyle(t: ActivityItem['eventType']): Record<string, string> {
            return { fontSize: '10px', color: this.eventColor(t), fontWeight: '700' };
        },
    },
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.skeleton {
    background: #222837;
    animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(3px); }
    to   { opacity: 1; transform: translateY(0); }
}
</style>
