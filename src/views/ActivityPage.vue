<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
                <IonRefresherContent pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" pulling-text="" refreshing-text="" />
            </IonRefresher>

            <div style="padding: 0 0 100px;">
                <!-- ─── Header ─── -->
                <div style="padding: 20px 18px 0;">
                    <div style="font-size: 10px; color: #6b738a; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;">ATIVIDADE</div>
                    <div style="font-size: 26px; font-weight: 900; color: #eef0f5; letter-spacing: -0.03em; line-height: 1.1;">Histórico</div>

                    <!-- Stats row -->
                    <div v-if="!loading && allItems.length > 0" style="display: flex; gap: 8px; margin-top: 14px;">
                        <div style="flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 11px 10px; text-align: center;">
                            <div style="font-size: 20px; font-weight: 900; color: #f97316; letter-spacing: -0.03em; line-height: 1;">{{ stats.streak }}</div>
                            <div style="font-size: 9px; color: #6b738a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px;">Streak dias</div>
                        </div>
                        <div style="flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 11px 10px; text-align: center;">
                            <div style="font-size: 20px; font-weight: 900; color: #60a5fa; letter-spacing: -0.03em; line-height: 1;">{{ stats.thisWeek }}</div>
                            <div style="font-size: 9px; color: #6b738a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px;">Esta semana</div>
                        </div>
                        <div style="flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 11px 10px; text-align: center;">
                            <div :style="{ fontSize: '20px', fontWeight: '900', color: typeColor(stats.favType), letterSpacing: '-0.03em', lineHeight: '1' }">{{ favTypeLabel }}</div>
                            <div style="font-size: 9px; color: #6b738a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px;">Fav. tipo</div>
                        </div>
                    </div>
                </div>

                <!-- ─── Type chips ─── -->
                <div v-if="!loading && allItems.length > 0" class="no-scrollbar" style="overflow-x: auto; padding: 16px 18px 14px;">
                    <div style="display: flex; gap: 6px; min-width: max-content;">
                        <button
                            v-for="chip in typeChips"
                            :key="chip.value ?? 'all'"
                            :style="typeChipStyle(chip.value)"
                            @click="activeType = chip.value"
                        >{{ chip.label }}</button>
                    </div>
                </div>

                <!-- ─── Loading skeleton ─── -->
                <div v-if="loading" style="padding: 16px 18px 0;">
                    <div v-for="i in 6" :key="i" :style="{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', marginBottom: '8px', display: 'flex', gap: '14px', padding: '12px 14px', alignItems: 'center', opacity: 1 - i * 0.12 }">
                        <div style="width: 54px; height: 76px; border-radius: 8px; background: rgba(255,255,255,0.05); flex-shrink: 0;"></div>
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                            <div style="height: 18px; border-radius: 20px; width: 80px;" class="skeleton"></div>
                            <div style="height: 14px; border-radius: 4px; width: 65%;" class="skeleton"></div>
                            <div style="height: 12px; border-radius: 4px; width: 40%;" class="skeleton"></div>
                        </div>
                    </div>
                </div>

                <!-- ─── Empty state ─── -->
                <div v-else-if="allItems.length === 0" style="text-align: center; padding: 64px 28px;">
                    <div style="width: 72px; height: 72px; border-radius: 36px; background: transparent; border: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a5169" stroke-width="1.7" stroke-linecap="round"><path d="M3 12h4l3-7 4 14 3-7h4"/></svg>
                    </div>
                    <div style="font-size: 15px; font-weight: 700; color: #eef0f5; margin-bottom: 6px;">Nenhuma atividade ainda</div>
                    <div style="font-size: 12px; color: #6b738a; line-height: 1.6;">Adicione itens à biblioteca e registre seu progresso</div>
                </div>

                <!-- ─── Timeline ─── -->
                <div v-else style="padding: 0 16px;">
                    <template v-for="group in groupedActivity" :key="group.day">
                        <div style="margin-bottom: 24px;">
                            <!-- Day header -->
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 0 2px;">
                                <span style="font-size: 10px; color: #9aa3b8; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap;">{{ group.day }}</span>
                                <div style="flex: 1; height: 1px; background: linear-gradient(to right, #1e2535, transparent);"></div>
                                <span style="font-size: 10px; color: #4a5169; font-weight: 600; white-space: nowrap;">{{ group.items.length }}x</span>
                            </div>

                            <!-- Activity card with glassmorphism -->
                            <div
                                v-for="item in group.items"
                                :key="item.id"
                                style="position: relative; border-radius: 14px; overflow: hidden; cursor: pointer; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.06); animation: fadeIn 0.2s ease;"
                                @click="$router.push(`/catalog/${item.contentId}`)"
                            >
                                <!-- Blurred cover backdrop -->
                                <div v-if="item.cover" style="position: absolute; inset: 0; overflow: hidden;">
                                    <img
                                        :src="item.cover"
                                        style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(20px); transform: scale(1.12); opacity: 0.22;"
                                    />
                                </div>
                                <!-- Dark overlay -->
                                <div style="position: absolute; inset: 0; background: rgba(7,10,17,0.84);"></div>

                                <!-- Content -->
                                <div style="position: relative; display: flex; gap: 12px; padding: 12px 14px; align-items: center;">
                                    <!-- Cover thumbnail -->
                                    <div :style="coverStyle(item.type)">
                                        <img
                                            v-if="item.cover"
                                            :src="item.cover"
                                            :alt="item.title"
                                            style="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 8px;"
                                        />
                                        <span v-else style="font-size: 18px; font-weight: 900; color: inherit;">{{ typeShort(item.type) }}</span>
                                        <!-- Type dot -->
                                        <div :style="{ position: 'absolute', top: '5px', right: '5px', width: '7px', height: '7px', borderRadius: '50%', background: typeColor(item.type), boxShadow: '0 0 0 2px rgba(13,17,23,0.7)' }"></div>
                                    </div>

                                    <!-- Info -->
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="margin-bottom: 5px;">
                                            <span :style="eventBadgeStyle(item.eventType)">
                                                {{ eventIcon(item.eventType) }} {{ eventLabel(item.eventType) }}
                                            </span>
                                        </div>
                                        <div style="font-size: 14px; font-weight: 800; color: #eef0f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em; margin-bottom: 3px;">{{ item.title }}</div>
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <span style="font-size: 12px; color: #9aa3b8;">{{ item.description }}</span>
                                            <span style="font-size: 11px; color: #4a5169;">·</span>
                                            <span style="font-size: 11px; color: #6b738a;">{{ item.timeAgo }}</span>
                                        </div>
                                    </div>

                                    <!-- Chevron -->
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a5169" stroke-width="1.7" stroke-linecap="round" style="flex-shrink: 0;"><path d="m9 6 6 6-6 6"/></svg>
                                </div>
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

const TYPE_SHORT: Record<string, string>  = { manga: 'M', anime: 'A', novel: 'N', movie: 'F', tv: 'S' };
const TYPE_COLORS: Record<string, string> = { manga: '#5eead4', anime: '#a78bfa', novel: '#fbbf24', movie: '#f472b6', tv: '#22d3ee' };
const TYPE_LABELS: Record<string, string> = { manga: 'Manga', anime: 'Anime', novel: 'Novel', movie: 'Filme', tv: 'Série' };

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
        stats(): { streak: number; thisWeek: number; favType: string } {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daySet = new Set(
                this.allItems.map(i => {
                    const d = new Date(i.sortDate);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime();
                })
            );
            let streak = 0;
            let cur = today.getTime();
            while (daySet.has(cur)) { streak++; cur -= 86400000; }

            const weekAgo = Date.now() - 7 * 86400000;
            const thisWeek = this.allItems.filter(i => i.sortDate > weekAgo).length;

            const typeCount: Record<string, number> = {};
            for (const i of this.allItems) { typeCount[i.type] = (typeCount[i.type] ?? 0) + 1; }
            const favType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

            return { streak, thisWeek, favType };
        },
        favTypeLabel(): string {
            const t = this.stats.favType;
            return t ? (TYPE_LABELS[t] ?? t) : '–';
        },
        typeChips(): { value: ContentType | null; label: string; color: string }[] {
            const present = new Set(this.allItems.map(i => i.type));
            const chips: { value: ContentType | null; label: string; color: string }[] = [
                { value: null, label: 'Todos', color: '#5eead4' },
            ];
            for (const t of ['manga', 'anime', 'novel', 'movie', 'tv']) {
                if (present.has(t)) {
                    chips.push({ value: t as ContentType, label: TYPE_LABELS[t], color: TYPE_COLORS[t] });
                }
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
        typeColor(type: string): string { return TYPE_COLORS[type] ?? '#5eead4'; },
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
        eventBadgeStyle(t: ActivityItem['eventType']): Record<string, string> {
            const col = this.eventColor(t);
            return {
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 8px', borderRadius: '20px',
                background: col + '20',
                color: col,
                fontSize: '10px', fontWeight: '700',
            };
        },
        coverStyle(type: string): Record<string, string> {
            const col = TYPE_COLORS[type] ?? '#5eead4';
            return {
                width: '66px', height: '94px', borderRadius: '8px', flexShrink: '0',
                background: `linear-gradient(135deg, ${col}22, #1a1f2e)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: col, overflow: 'hidden', position: 'relative',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            };
        },
        typeChipStyle(val: ContentType | null): Record<string, string> {
            const active = this.activeType === val;
            const col = val ? (TYPE_COLORS[val] ?? '#5eead4') : '#5eead4';
            return {
                padding: '6px 13px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: '700',
                background: active ? col : 'transparent',
                color: active ? '#0d1117' : '#9aa3b8',
                outline: active ? 'none' : '1px solid rgba(255,255,255,0.09)',
                transition: 'all 0.15s', flexShrink: '0',
            };
        },
    },
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.skeleton {
    background: rgba(255,255,255,0.06);
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
