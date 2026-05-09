<template>
    <div
        class="content-card"
        :style="cardStyle"
        @click="$emit('click')"
    >
        <div style="display: flex; gap: 12px; padding: 10px 12px;">
            <!-- Cover -->
            <div :style="coverStyle">
                <img
                    v-if="item.content?.cover && !imgError"
                    :src="item.content.cover"
                    :alt="item.content?.name"
                    style="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 8px;"
                    @error="imgError = true"
                />
                <span v-else style="font-size: 26px; font-weight: 900; letter-spacing: -0.04em; position: absolute;">{{ typeShort }}</span>
                <!-- Type corner dot -->
                <div :style="{ position: 'absolute', bottom: '5px', right: '5px', width: '7px', height: '7px', borderRadius: '50%', background: typeColor, boxShadow: `0 0 0 2px rgba(13,17,23,0.7)` }"></div>
            </div>

            <!-- Info -->
            <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between;">
                <!-- Row 1: type badge + status dot + optional badges -->
                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 4px; flex-wrap: wrap;">
                    <span :style="typeBadgeStyle">{{ typeBadgeLabel }}</span>
                    <span v-if="originTypeBadge" style="font-size: 9px; font-weight: 700; color: #6b738a; background: rgba(107,115,138,0.1); padding: 2px 6px; border-radius: 20px; flex-shrink: 0;">{{ originTypeBadge }}</span>
                    <span :style="statusDotStyle"></span>
                    <span v-if="item.content?.is_adult" style="font-size: 9px; font-weight: 800; color: #f87171; background: rgba(248,113,113,0.1); padding: 2px 6px; border-radius: 20px; flex-shrink: 0;">+18</span>
                </div>

                <!-- Row 2: title -->
                <div style="font-size: 15px; font-weight: 800; color: #eef0f5; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -0.02em; line-height: 1.2;">
                    {{ item.content?.name || 'Desconhecido' }}
                </div>

                <!-- Row 3: genres · year -->
                <div style="font-size: 10px; color: #6b738a; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ metaGenreYear }}
                </div>

                <!-- Bottom: progress line + bar -->
                <div>
                    <div style="font-size: 11px; color: #9aa3b8; display: flex; align-items: center; gap: 5px; margin-bottom: 6px;">
                        <template v-if="isMovie">
                            <span :style="{ fontWeight: '700', color: statusColor }">{{ statusLabel }}</span>
                            <template v-if="item.rating != null">
                                <span style="color: #4a5169;">·</span>
                                <span style="color: #fbbf24; font-weight: 700;">★ {{ item.rating }}</span>
                            </template>
                            <template v-if="item.content?.duration_formatted">
                                <span style="color: #4a5169;">·</span>
                                <span>{{ item.content.duration_formatted }}</span>
                            </template>
                        </template>
                        <template v-else-if="isTv">
                            <span style="color: #eef0f5; font-weight: 700;">Ep {{ item.current_units }}{{ item.content?.total_units ? ` / ${item.content.total_units}` : '' }}</span>
                            <template v-if="item.rating != null">
                                <span style="color: #4a5169;">·</span>
                                <span style="color: #fbbf24; font-weight: 700;">★ {{ item.rating }}</span>
                            </template>
                        </template>
                        <template v-else>
                            <span style="color: #eef0f5; font-weight: 700;">{{ unitLabel }} {{ item.current_units }}{{ item.content?.total_units ? ` / ${item.content.total_units}` : '' }}</span>
                            <template v-if="item.rating != null">
                                <span style="color: #4a5169;">·</span>
                                <span style="color: #fbbf24; font-weight: 700;">★ {{ item.rating }}</span>
                            </template>
                        </template>
                        <template v-if="lastUpdateText">
                            <span style="color: #4a5169;">·</span>
                            <span style="color: #4a5169;">{{ lastUpdateText }}</span>
                        </template>
                    </div>

                    <!-- Progress bar -->
                    <div v-if="!isMovie" style="height: 4px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; position: relative;">
                        <div
                            v-if="isOngoing && !item.content?.total_units"
                            class="shimmer-bar"
                            style="position: absolute; height: 100%; width: 40%; border-radius: 4px;"
                            :style="{ background: `linear-gradient(90deg, transparent, ${statusColor}cc, transparent)` }"
                        ></div>
                        <div
                            v-else
                            style="height: 100%; border-radius: 4px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1);"
                            :style="{ width: progressPct + '%', background: statusColor }"
                        ></div>
                    </div>
                </div>
            </div>

            <!-- +1 button -->
            <div v-if="!isMovie" style="display: flex; align-items: center; flex-shrink: 0;">
                <button
                    :disabled="atLimit"
                    style="width: 36px; height: 36px; border-radius: 18px; border: none; font-size: 20px; font-weight: 600; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0;"
                    :style="atLimit
                        ? { background: '#1a1f2e', color: '#3a4255', cursor: 'not-allowed' }
                        : plusActive
                            ? { background: typeColor, color: '#0d1117', transform: 'scale(1.15)', cursor: 'pointer', boxShadow: `0 0 12px ${typeColor}66` }
                            : { background: '#1a1f2e', color: typeColor, cursor: 'pointer', border: '1px solid #262d40' }"
                    @click.stop="handlePlus"
                >+</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { UserContent, ContentStatus, getStatusLabel } from '@/services/userContentService';
import { UNIT_LABEL, ContentType } from '@/services/contentService';

const TYPE_SHORT: Record<ContentType, string> = {
    manga: 'M', anime: 'A', novel: 'N', movie: 'F', tv: 'S',
};

const TYPE_BADGE: Record<ContentType, { color: string; label: string }> = {
    manga:  { color: '#5eead4', label: 'MANGA' },
    anime:  { color: '#a78bfa', label: 'ANIME' },
    novel:  { color: '#fbbf24', label: 'NOVEL' },
    movie:  { color: '#f472b6', label: 'FILME' },
    tv:     { color: '#22d3ee', label: 'SÉRIE' },
};

const STATUS_COLORS: Record<ContentStatus, string> = {
    reading:      '#60a5fa',
    completed:    '#34d399',
    paused:       '#fbbf24',
    dropped:      '#f87171',
    plan_to_read: '#a78bfa',
};

export default defineComponent({
    name: 'ContentCard',
    emits: ['click', 'plusOne'],
    props: {
        item: { type: Object as PropType<UserContent>, required: true },
    },
    data() {
        return { plusActive: false, imgError: false };
    },
    computed: {
        contentType(): ContentType {
            return this.item.content?.type ?? 'manga';
        },
        typeColor(): string {
            return TYPE_BADGE[this.contentType]?.color ?? '#5eead4';
        },
        typeShort(): string {
            return TYPE_SHORT[this.contentType] ?? '?';
        },
        typeBadgeLabel(): string {
            return TYPE_BADGE[this.contentType]?.label ?? this.contentType.toUpperCase();
        },
        typeBadgeStyle(): Record<string, string> {
            const col = this.typeColor;
            return {
                fontSize: '9px', fontWeight: '700', letterSpacing: '0.06em',
                color: col, background: col + '1a',
                padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase',
                flexShrink: '0', lineHeight: '1.4',
            };
        },
        cardStyle(): Record<string, string> {
            const col = this.typeColor;
            return {
                background: `linear-gradient(120deg, ${col}0e 0%, #131826 100%)`,
                borderTop: '1px solid #1e2535',
                borderRight: '1px solid #1e2535',
                borderBottom: '1px solid #1e2535',
                borderLeft: `3px solid ${col}`,
                borderRadius: '12px',
                marginBottom: '8px',
                transition: 'transform 0.15s',
                animation: 'fadeIn 0.25s ease',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
            };
        },
        coverStyle(): Record<string, string> {
            const col = this.typeColor;
            return {
                flexShrink: '0', borderRadius: '8px', overflow: 'hidden',
                width: '80px', height: '114px',
                background: `linear-gradient(135deg, ${col}22, #1a1f2e)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: col, position: 'relative',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            };
        },
        statusColor(): string {
            return STATUS_COLORS[this.item.status] ?? '#6b738a';
        },
        statusLabel(): string {
            return getStatusLabel(this.item.status, this.contentType);
        },
        statusDotStyle(): Record<string, string> {
            const col = this.statusColor;
            return {
                width: '6px', height: '6px', borderRadius: '50%', flexShrink: '0',
                background: col, boxShadow: `0 0 0 2px ${col}22`,
                display: 'inline-block',
            };
        },
        isMovie(): boolean { return this.contentType === 'movie'; },
        isTv(): boolean { return this.contentType === 'tv'; },
        isOngoing(): boolean { return !this.item.content?.total_units; },
        unitLabel(): string {
            return (this.contentType === 'anime' || this.contentType === 'tv') ? 'Ep' : 'Cap';
        },
        originTypeBadge(): string | null {
            const ot = this.item.content?.origin_type;
            if (ot === 'manhwa') return 'Manhwa';
            if (ot === 'manhua') return 'Manhua';
            return null;
        },
        metaGenreYear(): string {
            const genres = (this.item.content?.genres ?? []).slice(0, 2);
            const year = this.item.content?.release_year;
            const parts: string[] = [];
            if (genres.length) parts.push(genres.join(' · '));
            if (year) parts.push(String(year));
            return parts.join(' · ') || '';
        },
        progressPct(): number {
            if (this.item.progress_percent != null) return this.item.progress_percent;
            const total = this.item.content?.total_units;
            if (!total) return 0;
            return Math.min(Math.round((this.item.current_units / total) * 100), 100);
        },
        atLimit(): boolean {
            const total = this.item.content?.total_units;
            if (!total) return false;
            return this.item.current_units >= total;
        },
        lastUpdateText(): string {
            const date = this.item.last_interacted_at ?? this.item.last_unit_update ?? this.item.content?.last_unit_update;
            if (!date) return '';
            const diff = Date.now() - new Date(date).getTime();
            const mins = Math.floor(diff / 60000);
            if (mins < 1) return 'agora';
            if (mins < 60) return `${mins}min`;
            const hours = Math.floor(mins / 60);
            if (hours < 24) return `${hours}h`;
            const days = Math.floor(hours / 24);
            if (days < 7) return `${days}d`;
            if (days < 30) return `${Math.floor(days / 7)}sem`;
            return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        },
    },
    methods: {
        handlePlus() {
            if (this.plusActive) return;
            this.$emit('plusOne', this.item.id);
            this.plusActive = true;
            setTimeout(() => { this.plusActive = false; }, 600);
        },
    },
});
</script>

<style scoped>
@keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(300%); }
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
}
.shimmer-bar {
    animation: shimmer 2.4s ease-in-out infinite;
}
.content-card:active {
    transform: scale(0.985);
}
</style>
