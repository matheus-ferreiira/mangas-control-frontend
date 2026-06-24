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
                    <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; font-family: 'Sora', system-ui, sans-serif; background: linear-gradient(135deg, #f5a623, #ff6b35); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Histórico</div>

                    <!-- Stats header compacto -->
                    <div v-if="!loading && allItems.length > 0" style="margin-top: 16px;">
                        <StatsHeader :stats="statHeaderItems" />
                    </div>
                </div>

                <!-- ─── Type chips ─── -->
                <div v-if="!loading && allItems.length > 0" class="no-scrollbar" style="overflow-x: auto; padding: 16px 18px 14px;">
                    <div style="display: flex; gap: 6px; min-width: max-content;">
                        <button
                            v-for="chip in typeChips"
                            :key="chip.value ?? 'all'"
                            :style="typeChipStyle(chip.value)"
                            @click="setType(chip.value)"
                        >{{ chip.label }}<span style="margin-left: 5px; font-size: 10px; opacity: 0.55; font-weight: 600;">{{ chip.count }}</span></button>
                    </div>
                </div>

                <!-- ─── Toolbar padronizada (FilterBar) ─── -->
                <FilterBar
                    v-if="!loading && allItems.length > 0"
                    :count="filteredItems.length"
                    unit="registro"
                    :active-count="(sortDir === 'oldest' ? 1 : 0) + (activeType ? 1 : 0)"
                >
                    <div style="margin-bottom: 22px;">
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;">Ordenar por</div>
                        <button
                            v-for="opt in sortDirOptions"
                            :key="opt.value"
                            style="width: 100%; text-align: left; padding: 12px 4px; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 14px; font-weight: 600;"
                            :style="{ color: sortDir === opt.value ? '#f5a623' : '#e9edf2' }"
                            @click="setSortDir(opt.value)"
                        >
                            <span>{{ opt.label }}</span>
                            <span v-if="sortDir === opt.value" style="color: #f5a623;">✓</span>
                        </button>
                    </div>
                    <!-- Tipo (apenas os que o usuário tem) -->
                    <div>
                        <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;">Tipo</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <button v-for="chip in typeChips" :key="chip.value ?? 'all'" :style="sheetChipStyle(activeType === chip.value)" @click="setType(chip.value)">{{ chip.label }}</button>
                        </div>
                    </div>
                </FilterBar>

                <!-- ─── Novidades não lidas ─── -->
                <div v-if="!loading && unreadFiltered.length" style="padding: 4px 16px 10px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding: 0 2px;">
                        <span style="font-size: 12px; font-weight: 800; color: #f5a623; letter-spacing: 0.02em;">📬 Novidades não lidas</span>
                        <span style="font-size: 10px; font-weight: 800; color: #050608; background: #f5a623; border-radius: 10px; padding: 1px 7px;">{{ unreadFiltered.length }}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div
                            v-for="uc in unreadFiltered"
                            :key="uc.id"
                            style="display: flex; gap: 12px; align-items: center; padding: 10px; border-radius: 12px; background: rgba(245,166,35,0.06); border: 1px solid rgba(245,166,35,0.22); border-left: 3px solid #f5a623; cursor: pointer;"
                            @click="$router.push(`/catalog/${uc.content?.id ?? uc.content_id}`)"
                        >
                            <div style="width: 48px; height: 68px; border-radius: 8px; overflow: hidden; flex-shrink: 0; position: relative; background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center;">
                                <img v-if="uc.content?.cover" :src="uc.content.cover" :alt="uc.content?.name" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                                <span v-else :style="{ color: typeColor(uc.content?.type ?? 'manga'), fontWeight: '900', fontSize: '15px' }">{{ typeShort(uc.content?.type ?? 'manga') }}</span>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 13px; font-weight: 700; color: #e9edf2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ uc.content?.name }}</div>
                                <div style="font-size: 11px; color: rgba(233,237,242,0.42); margin-top: 3px;">{{ unreadProgressText(uc) }}</div>
                            </div>
                            <button
                                v-if="canIncrement(uc)"
                                :disabled="incrementingId === uc.id"
                                style="width: 34px; height: 34px; border-radius: 17px; border: 1px solid rgba(245,166,35,0.35); background: rgba(245,166,35,0.12); color: #f5a623; font-size: 19px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
                                @click.stop="incrementUc(uc)"
                            >+</button>
                        </div>
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
                                    <!-- Fonte (se houver) -->
                                    <div v-if="item.raw.user_site" style="display: flex; align-items: center; gap: 5px; margin-top: 3px;">
                                        <span style="width: 14px; height: 14px; border-radius: 3px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                            <img v-if="item.raw.user_site.logo_url" :src="item.raw.user_site.logo_url" alt="" style="width: 100%; height: 100%; object-fit: contain;" />
                                            <IonIcon v-else :icon="globeOutline" style="font-size: 12px; color: var(--text-muted);" />
                                        </span>
                                        <span style="font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.raw.user_site.name }}</span>
                                    </div>
                                </div>

                                <!-- +1 rápido (leitura em andamento) -->
                                <button
                                    v-if="canIncrement(item.raw)"
                                    :disabled="incrementingId === item.id"
                                    :aria-label="`+1 ${item.title}`"
                                    style="width: 34px; height: 34px; border-radius: 17px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.04); color: #f5a623; font-size: 19px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
                                    @click.stop="incrementUc(item.raw)"
                                >+</button>
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
import { IonPage, IonContent, IonRefresher, IonRefresherContent, IonIcon, toastController } from '@ionic/vue';
import { globeOutline } from 'ionicons/icons';
import { userContentService, UserContent } from '@/services/userContentService';
import { ContentType } from '@/services/contentService';
import FilterBar from '@/components/FilterBar.vue';
import StatsHeader from '@/components/StatsHeader.vue';

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
    raw: UserContent;
}

const TYPE_SHORT: Record<string, string>  = { manga: 'M', anime: 'A', novel: 'N', movie: 'F', tv: 'S' };
const TYPE_COLORS: Record<string, string> = { manga: '#f5a623', anime: '#B8A4FF', novel: '#F5C542', movie: '#FF7EC7', tv: '#7CAEFF' };
const TYPE_LABELS: Record<string, string> = { manga: 'Manga', anime: 'Anime', novel: 'Novel', movie: 'Filme', tv: 'Série' };

function fmtActivityDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = (now.getTime() - d.getTime()) / 60000;
    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `há ${Math.floor(diffMin)} min`;
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    if (d.toDateString() === now.toDateString()) return `às ${hh}:${mm}`;
    return `${d.toLocaleDateString('pt-BR')} às ${hh}:${mm}`;
}

function dayKey(iso: string): string {
    const now = new Date();
    const item = new Date(iso);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const itemDay = new Date(item.getFullYear(), item.getMonth(), item.getDate()).getTime();
    const diffDays = Math.round((today - itemDay) / 86400000);
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7)   return 'Esta semana';
    if (diffDays < 30)  return 'Este mês';
    return 'Mais antigo';
}

const DAY_ORDER = ['Hoje', 'Ontem', 'Esta semana', 'Este mês', 'Mais antigo'];

export default defineComponent({
    name: 'ActivityPage',
    components: { IonPage, IonContent, IonRefresher, IonRefresherContent, IonIcon, FilterBar, StatsHeader },
    data() {
        return {
            loading: false,
            allItems: [] as ActivityItem[],
            rawContents: [] as UserContent[],
            unread: [] as UserContent[],
            incrementingId: null as number | null,
            activeType: (localStorage.getItem('activity_type_filter') || null) as ContentType | null,
            sortDir: (localStorage.getItem('activity_sort_dir') || 'recent') as 'recent' | 'oldest',
            sortDirOptions: [
                { value: 'recent', label: 'Mais recente' },
                { value: 'oldest', label: 'Mais antigo' },
            ] as { value: 'recent' | 'oldest'; label: string }[],
            globeOutline,
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
        statHeaderItems(): { value: string | number; label: string; accent?: boolean }[] {
            return [
                { value: this.stats.streak, label: 'Streak', accent: true },
                { value: this.stats.thisWeek, label: 'Semana', accent: true },
                { value: this.favTypeLabel, label: 'Tipo favorito' },
            ];
        },
        typeChips(): { value: ContentType | null; label: string; color: string; count: number }[] {
            const countMap: Record<string, number> = {};
            for (const i of this.allItems) { countMap[i.type] = (countMap[i.type] ?? 0) + 1; }
            const chips: { value: ContentType | null; label: string; color: string; count: number }[] = [
                { value: null, label: 'Todos', color: '#f5a623', count: this.allItems.length },
            ];
            for (const t of ['manga', 'anime', 'novel', 'movie', 'tv']) {
                if (countMap[t]) {
                    chips.push({ value: t as ContentType, label: TYPE_LABELS[t], color: TYPE_COLORS[t], count: countMap[t] });
                }
            }
            return chips;
        },
        filteredItems(): ActivityItem[] {
            return this.activeType ? this.allItems.filter(i => i.type === this.activeType) : this.allItems;
        },
        groupedActivity(): { day: string; items: ActivityItem[] }[] {
            const items = this.sortDir === 'oldest' ? [...this.filteredItems].reverse() : this.filteredItems;
            const groups: Record<string, ActivityItem[]> = {};
            for (const item of items) {
                (groups[item.dayKey] = groups[item.dayKey] || []).push(item);
            }
            const ordered = DAY_ORDER.filter(d => groups[d]?.length).map(d => ({ day: d, items: groups[d] }));
            return this.sortDir === 'oldest' ? ordered.reverse() : ordered;
        },
        unreadFiltered(): UserContent[] {
            return this.activeType
                ? this.unread.filter(u => (u.content?.type ?? '') === this.activeType)
                : this.unread;
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
                this.rawContents = contents;
                this.allItems = this.buildActivityItems(contents);
            } catch { /* silent */ } finally {
                this.loading = false;
            }
            userContentService.getWithUpdates()
                .then((items) => { this.unread = items; })
                .catch(() => { this.unread = []; });
        },
        setType(val: ContentType | null) {
            this.activeType = val;
            localStorage.setItem('activity_type_filter', val ?? '');
        },
        setSortDir(val: 'recent' | 'oldest') {
            this.sortDir = val;
            localStorage.setItem('activity_sort_dir', val);
        },
        sheetChipStyle(active: boolean): Record<string, string> {
            return {
                padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                fontSize: '11px', fontWeight: '600',
                border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                background: active ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: active ? '#000' : 'var(--text-secondary)',
                transition: 'all 0.15s',
            };
        },
        canIncrement(uc: UserContent): boolean {
            const t = uc.content?.type;
            if (t === 'movie' || uc.status !== 'reading') return false;
            const se = uc.content?.season_episodes;
            if (t === 'tv' && se) {
                const lim = se[String(uc.current_season ?? 1)];
                if (lim != null) return uc.current_units < lim;
            }
            const total = uc.content?.total_units;
            return total != null ? uc.current_units < total : true;
        },
        async incrementUc(uc: UserContent) {
            if (this.incrementingId) return;
            this.incrementingId = uc.id;
            try {
                const updated = await userContentService.increment(uc.id);
                const idx = this.rawContents.findIndex((c) => c.id === updated.id);
                if (idx >= 0) this.rawContents.splice(idx, 1, updated);
                else this.rawContents.push(updated);
                this.allItems = this.buildActivityItems(this.rawContents);
                this.unread = this.unread.filter((u) => u.id !== updated.id);
            } catch (e: any) {
                const msg = e?.response?.data?.message ?? 'Não foi possível atualizar.';
                const t = await toastController.create({ message: msg, duration: 2000, color: 'warning', position: 'top' });
                await t.present();
            } finally {
                this.incrementingId = null;
            }
        },
        unreadProgressText(uc: UserContent): string {
            const t = uc.content?.type;
            const unit = (t === 'anime' || t === 'tv') ? 'Ep' : 'Cap';
            const total = uc.content?.total_units;
            return total ? `${unit}. ${uc.current_units} / ${total}` : `${unit}. ${uc.current_units}`;
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
                    timeAgo: fmtActivityDate(dateStr),
                    sortDate: new Date(dateStr).getTime(),
                    dayKey: dayKey(dateStr),
                    raw: uc,
                });
            }
            return items.sort((a, b) => b.sortDate - a.sortDate);
        },
        async handleRefresh(event: CustomEvent) {
            await this.loadActivity();
            (event.target as HTMLIonRefresherElement).complete();
        },
        typeColor(type: string): string { return TYPE_COLORS[type] ?? '#f5a623'; },
        typeShort(type: string): string { return TYPE_SHORT[type] ?? '?'; },
        eventColor(t: ActivityItem['eventType']): string {
            const m: Record<string, string> = {
                progress: '#7CAEFF', completed: '#f5a623', rated: '#F5C542', added: '#f5a623', paused: '#F5C542',
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
            const col = TYPE_COLORS[type] ?? '#f5a623';
            return {
                width: '54px', height: '76px', borderRadius: '8px', flexShrink: '0',
                background: `linear-gradient(135deg, ${col}22, rgba(255,255,255,0.02))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: col, overflow: 'hidden', position: 'relative',
            };
        },
        typeChipStyle(val: ContentType | null): Record<string, string> {
            const active = this.activeType === val;
            const col = val ? (TYPE_COLORS[val] ?? '#f5a623') : '#f5a623';
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
