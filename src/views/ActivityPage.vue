<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
                <IonRefresherContent pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" pulling-text="" refreshing-text="" />
            </IonRefresher>

            <div style="padding: 0 0 100px; background: hsl(220 30% 3%); min-height: 100%;">
                <!-- ─── Header ─── -->
                <div style="padding: 20px 18px 0;">
                    <div style="font-size: 10px; color: rgba(233,237,242,0.42); font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 4px;">Atividade</div>
                    <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; font-family: 'Sora', system-ui, sans-serif; background: linear-gradient(135deg, #00F5A0, #00D9FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Histórico</div>

                    <!-- Stats row — airy, hairline dividers -->
                    <div v-if="!loading && allItems.length > 0" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px;">
                        <div style="background: rgba(245,197,66,0.07); border: 1px solid rgba(245,197,66,0.18); border-radius: 12px; padding: 14px 8px; text-align: center;">
                            <div style="font-size: 26px; font-weight: 800; color: #F5C542; letter-spacing: -0.03em; line-height: 1; font-family: 'Sora', system-ui, sans-serif;">{{ stats.streak }}</div>
                            <div style="font-size: 9px; color: rgba(233,237,242,0.42); font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; margin-top: 5px;">Streak</div>
                        </div>
                        <div style="background: rgba(124,174,255,0.07); border: 1px solid rgba(124,174,255,0.18); border-radius: 12px; padding: 14px 8px; text-align: center;">
                            <div style="font-size: 26px; font-weight: 800; color: #7CAEFF; letter-spacing: -0.03em; line-height: 1; font-family: 'Sora', system-ui, sans-serif;">{{ stats.thisWeek }}</div>
                            <div style="font-size: 9px; color: rgba(233,237,242,0.42); font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; margin-top: 5px;">Semana</div>
                        </div>
                        <div :style="{ background: typeColor(stats.favType) + '12', border: '1px solid ' + typeColor(stats.favType) + '28', borderRadius: '12px', padding: '14px 8px', textAlign: 'center' }">
                            <div :style="{ fontSize: '17px', fontWeight: '800', color: typeColor(stats.favType), letterSpacing: '-0.02em', lineHeight: '1.2', fontFamily: '\'Sora\', system-ui, sans-serif' }">{{ favTypeLabel }}</div>
                            <div style="font-size: 9px; color: rgba(233,237,242,0.42); font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; margin-top: 5px;">Fav. tipo</div>
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
                    <div v-for="i in 6" :key="i" :style="{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', marginBottom: '8px', display: 'flex', gap: '14px', padding: '12px 14px', alignItems: 'center', opacity: 1 - i * 0.1 }">
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
                    <div style="width: 72px; height: 72px; border-radius: 36px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(233,237,242,0.28)" stroke-width="1.7" stroke-linecap="round"><path d="M3 12h4l3-7 4 14 3-7h4"/></svg>
                    </div>
                    <div style="font-size: 15px; font-weight: 700; color: #e9edf2; margin-bottom: 6px;">Nenhuma atividade ainda</div>
                    <div style="font-size: 12px; color: rgba(233,237,242,0.42); line-height: 1.6;">Adicione itens à biblioteca e registre seu progresso</div>
                </div>

                <!-- ─── Timeline ─── -->
                <div v-else style="padding: 0 16px;">
                    <template v-for="group in groupedActivity" :key="group.day">
                        <div style="margin-bottom: 24px;">
                            <!-- Day header -->
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 0 2px;">
                                <span style="font-size: 10px; color: rgba(233,237,242,0.62); font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap;">{{ group.day }}</span>
                                <div style="flex: 1; height: 1px; background: linear-gradient(to right, rgba(255,255,255,0.06), transparent);"></div>
                                <span style="font-size: 10px; color: rgba(233,237,242,0.28); font-weight: 600; white-space: nowrap;">{{ group.items.length }}x</span>
                            </div>

                            <!-- Activity row — clean editorial style -->
                            <div
                                v-for="item in group.items"
                                :key="item.id"
                                :style="{ display: 'flex', gap: '12px', padding: '12px 0 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', borderLeft: '2px solid ' + typeColor(item.type) + '60', cursor: 'pointer', alignItems: 'center' }"
                                @click="$router.push(`/catalog/${item.contentId}`)"
                            >
                                <!-- Cover thumbnail -->
                                <div :style="coverStyle(item.type)">
                                    <img
                                        v-if="item.cover"
                                        :src="item.cover"
                                        :alt="item.title"
                                        style="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 8px;"
                                    />
                                    <span v-else style="font-size: 16px; font-weight: 900; color: inherit;">{{ typeShort(item.type) }}</span>
                                    <!-- Type dot -->
                                    <div :style="{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', background: typeColor(item.type) }"></div>
                                </div>

                                <!-- Info -->
                                <div style="flex: 1; min-width: 0;">
                                    <div style="margin-bottom: 4px;">
                                        <span :style="eventBadgeStyle(item.eventType)">
                                            {{ eventIcon(item.eventType) }} {{ eventLabel(item.eventType) }}
                                        </span>
                                    </div>
                                    <div style="font-size: 14px; font-weight: 700; color: #e9edf2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em; margin-bottom: 2px;">{{ item.title }}</div>
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <span style="font-size: 12px; color: rgba(233,237,242,0.62);">{{ item.description }}</span>
                                        <span style="font-size: 11px; color: rgba(233,237,242,0.28);">·</span>
                                        <span style="font-size: 11px; color: rgba(233,237,242,0.42);">{{ item.timeAgo }}</span>
                                    </div>
                                </div>

                                <!-- Chevron -->
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(233,237,242,0.28)" stroke-width="1.7" stroke-linecap="round" style="flex-shrink: 0;"><path d="m9 6 6 6-6 6"/></svg>
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
const TYPE_COLORS: Record<string, string> = { manga: '#00F5A0', anime: '#B8A4FF', novel: '#F5C542', movie: '#FF7EC7', tv: '#7CAEFF' };
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
                { value: null, label: 'Todos', color: '#00F5A0' },
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
        typeColor(type: string): string { return TYPE_COLORS[type] ?? '#00F5A0'; },
        typeShort(type: string): string { return TYPE_SHORT[type] ?? '?'; },
        eventColor(t: ActivityItem['eventType']): string {
            const m: Record<string, string> = {
                progress: '#7CAEFF', completed: '#00F5A0', rated: '#F5C542', added: '#00F5A0', paused: '#F5C542',
            };
            return m[t] ?? 'rgba(233,237,242,0.42)';
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
                background: col + '22',
                color: col,
                fontSize: '10px', fontWeight: '800', letterSpacing: '0.04em',
            };
        },
        coverStyle(type: string): Record<string, string> {
            const col = TYPE_COLORS[type] ?? '#00F5A0';
            return {
                width: '54px', height: '76px', borderRadius: '8px', flexShrink: '0',
                background: `linear-gradient(135deg, ${col}22, rgba(255,255,255,0.02))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: col, overflow: 'hidden', position: 'relative',
            };
        },
        typeChipStyle(val: ContentType | null): Record<string, string> {
            const active = this.activeType === val;
            const col = val ? (TYPE_COLORS[val] ?? '#00F5A0') : '#00F5A0';
            return {
                padding: '6px 13px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: '700',
                background: active ? col + '22' : 'transparent',
                color: active ? col : 'rgba(233,237,242,0.62)',
                outline: active ? `1.5px solid ${col}55` : '1px solid rgba(255,255,255,0.06)',
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
</style>
