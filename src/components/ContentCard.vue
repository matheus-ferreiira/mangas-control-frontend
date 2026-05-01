<template>
    <div
        class="relative overflow-hidden cursor-pointer"
        style="background: #1a2035; border: 1px solid #1e2640; border-radius: 16px; margin-bottom: 10px; transition: transform 0.15s;"
        :style="{ boxShadow: `inset 3px 0 0 ${statusColor}` }"
        @click="$emit('click')"
    >
        <div style="display: flex; gap: 12px; padding: 14px 14px 12px;">
            <!-- Cover -->
            <div style="flex-shrink: 0; border-radius: 8px; overflow: hidden; width: 48px; height: 68px; background: #141825; display: flex; align-items: center; justify-content: center;">
                <img
                    v-if="item.content?.cover"
                    :src="item.content.cover"
                    :alt="item.content?.name"
                    style="width: 100%; height: 100%; object-fit: cover; display: block;"
                />
                <IonIcon v-else :icon="typeIcon" style="font-size: 22px; color: #4a5470;" />
            </div>

            <!-- Info -->
            <div style="flex: 1; min-width: 0;">
                <!-- Row 1: badges -->
                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 5px; flex-wrap: wrap;">
                    <span :style="typeBadgeStyle">{{ typeBadgeLabel }}</span>
                    <span :style="statusBadgeStyle">{{ statusLabel }}</span>
                    <span v-if="isHighScore" style="font-size: 9px; font-weight: 800; color: #f59e0b; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em; flex-shrink: 0;">TOP</span>
                </div>

                <!-- Row 2: title -->
                <div style="font-size: 14px; font-weight: 800; color: #eef2ff; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em;">
                    {{ item.content?.name || 'Desconhecido' }}
                </div>

                <!-- Row 3: meta (type-specific) -->
                <div style="font-size: 11px; color: #4a5470; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <template v-if="isMovie">
                        <span v-if="item.content?.release_year">{{ item.content.release_year }}</span>
                        <span v-if="item.content?.genres?.[0]">· {{ item.content.genres[0] }}</span>
                        <span v-if="item.rating != null" style="color: #f59e0b;">★ {{ item.rating }}</span>
                        <span v-if="lastUpdateText">· {{ lastUpdateText }}</span>
                    </template>
                    <template v-else-if="isTv">
                        <span>Ep. {{ item.current_units }}{{ item.content?.total_units ? ` / ${item.content.total_units}` : '' }}</span>
                        <span v-if="item.rating != null" style="color: #f59e0b;">★ {{ item.rating }}</span>
                        <span v-if="lastUpdateText">· {{ lastUpdateText }}</span>
                    </template>
                    <template v-else>
                        <span>{{ item.current_units }}{{ isOngoing ? ` ${unitShort}` : ` / ${item.content?.total_units} ${unitShort}` }}</span>
                        <span v-if="item.rating != null" style="color: #f59e0b;">★ {{ item.rating }}</span>
                        <span v-if="lastUpdateText">· {{ lastUpdateText }}</span>
                    </template>
                </div>

                <!-- Row 4: genre chips -->
                <div v-if="genres.length" style="display: flex; gap: 4px; margin-top: 5px; overflow: hidden; flex-wrap: nowrap;">
                    <span
                        v-for="g in genres.slice(0, 2)"
                        :key="g"
                        style="font-size: 9px; color: #4a5470; background: #141825; padding: 2px 6px; border-radius: 4px; white-space: nowrap; border: 1px solid #1e2640; flex-shrink: 0;"
                    >{{ g }}</span>
                    <span v-if="genres.length > 2" style="font-size: 9px; color: #4a5470; white-space: nowrap;">+{{ genres.length - 2 }}</span>
                </div>

                <!-- Site label -->
                <div v-if="siteLabel" style="margin-top: 4px; font-size: 9px; color: #3a4460; font-weight: 600; display: flex; align-items: center; gap: 3px;">
                    <span style="color: #2e3a55;">⊙</span> {{ siteLabel }}
                </div>

                <!-- Row 5: progress bar (not for movies) -->
                <div v-if="!isMovie" style="margin-top: 7px;">
                    <div style="height: 3px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                        <div
                            v-if="isOngoing"
                            class="shimmer-bar"
                            style="height: 100%; width: 38%; border-radius: 3px;"
                            :style="{ background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)` }"
                        ></div>
                        <div
                            v-else
                            style="height: 100%; border-radius: 3px; transition: width 0.4s ease;"
                            :style="{ width: progressPct + '%', background: statusColor }"
                        ></div>
                    </div>
                    <div v-if="!isOngoing && progressPct > 0" style="font-size: 9px; color: #4a5470; margin-top: 3px;">{{ progressPct }}% concluído</div>
                </div>
            </div>

            <!-- +1 button (not for movies) -->
            <button
                v-if="!isMovie"
                style="width: 34px; height: 34px; border-radius: 17px; border: 1px solid #1e2640; cursor: pointer; font-size: 20px; font-weight: 700; flex-shrink: 0; align-self: center; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                :style="plusActive
                    ? { background: '#00d4aa', color: '#000', transform: 'scale(1.2)', borderColor: '#00d4aa' }
                    : { background: '#141825', color: '#00d4aa' }"
                @click.stop="handlePlus"
            >+</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IonIcon } from '@ionic/vue';
import { bookOutline, tvOutline, libraryOutline, filmOutline, desktopOutline } from 'ionicons/icons';
import { UserContent, ContentStatus, getStatusLabel } from '@/services/userContentService';
import { UNIT_LABEL, ContentType } from '@/services/contentService';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
    movie: filmOutline,
    tv: desktopOutline,
};

const TYPE_BADGE: Record<ContentType, { color: string; label: string }> = {
    manga:  { color: '#00d4aa', label: 'MANGA' },
    anime:  { color: '#8b5cf6', label: 'ANIME' },
    novel:  { color: '#f59e0b', label: 'NOVEL' },
    movie:  { color: '#ec4899', label: 'FILME' },
    tv:     { color: '#06b6d4', label: 'SÉRIE' },
};

const STATUS_COLORS: Record<ContentStatus, string> = {
    reading: '#3b82f6',
    completed: '#10b981',
    paused: '#f59e0b',
    dropped: '#ef4444',
    plan_to_read: '#8b5cf6',
};

export default defineComponent({
    name: 'ContentCard',
    components: { IonIcon },
    emits: ['click', 'plusOne'],
    props: {
        item: { type: Object as PropType<UserContent>, required: true },
    },
    data() {
        return { plusActive: false };
    },
    computed: {
        contentType(): ContentType {
            return this.item.content?.type ?? 'manga';
        },
        typeIcon(): string {
            return TYPE_ICONS[this.contentType];
        },
        typeBadgeLabel(): string {
            return TYPE_BADGE[this.contentType]?.label ?? this.contentType.toUpperCase();
        },
        typeBadgeStyle(): Record<string, string> {
            const col = TYPE_BADGE[this.contentType]?.color ?? '#00d4aa';
            return {
                fontSize: '9px', fontWeight: '800', letterSpacing: '0.07em',
                color: col, background: col + '20',
                padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase', flexShrink: '0',
            };
        },
        statusColor(): string {
            return STATUS_COLORS[this.item.status] ?? '#4a5470';
        },
        statusLabel(): string {
            return getStatusLabel(this.item.status, this.contentType);
        },
        statusBadgeStyle(): Record<string, string> {
            const col = this.statusColor;
            return {
                fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em',
                color: col, background: col + '18',
                padding: '2px 7px', borderRadius: '20px', flexShrink: '0',
            };
        },
        isMovie(): boolean {
            return this.contentType === 'movie';
        },
        isTv(): boolean {
            return this.contentType === 'tv';
        },
        isOngoing(): boolean {
            return !this.item.content?.total_units;
        },
        isHighScore(): boolean {
            const score = this.item.content?.score ?? this.item.content?.rating ?? 0;
            return score >= 9;
        },
        unitShort(): string {
            return UNIT_LABEL[this.contentType]?.short ?? 'cap.';
        },
        progressPct(): number {
            const total = this.item.content?.total_units;
            if (!total) return 0;
            return Math.min(Math.round((this.item.current_units / total) * 100), 100);
        },
        genres(): string[] {
            return this.item.content?.genres ?? [];
        },
        siteLabel(): string {
            return this.item.site?.name ?? '';
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
.shimmer-bar {
    animation: shimmer 1.8s infinite;
}
</style>
