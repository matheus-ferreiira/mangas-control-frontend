<template>
    <div
        class="relative overflow-hidden bg-neon-card border border-neon-border rounded-xl mb-2.5 cursor-pointer transition-[border-color] duration-150 active:border-neon-accent"
        @click="$emit('click')"
    >
        <!-- Left colored status border -->
        <div class="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" :style="{ background: statusColor }"></div>

        <div class="flex gap-2.5 p-3 pl-[14px]">
            <!-- Cover -->
            <div class="flex-shrink-0 w-11 h-[62px] rounded-md overflow-hidden">
                <img
                    v-if="item.content?.cover"
                    :src="item.content.cover"
                    :alt="item.content?.name"
                    class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted text-xl">
                    <IonIcon :icon="typeIcon" />
                </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
                <!-- Badges row -->
                <div class="flex items-center gap-1.5 mb-[5px] flex-wrap">
                    <span class="text-[9px] font-bold tracking-[0.08em] uppercase px-1.5 py-0.5 rounded" :class="typeColorClass">
                        {{ typeLabel }}
                    </span>
                    <StatusBadge :status="item.status" :type="item.content?.type ?? 'manga'" />
                    <span v-if="isOngoing" class="text-[9px] font-bold text-amber-400 bg-amber-400/15 px-1.5 py-0.5 rounded">
                        EM ANDAMENTO
                    </span>
                </div>

                <!-- Name -->
                <div class="text-sm font-bold text-neon-text truncate mb-1">
                    {{ item.content?.name || 'Desconhecido' }}
                </div>

                <!-- Progress + rating -->
                <div class="text-[11px] text-neon-muted mb-1.5">
                    <template v-if="isOngoing">
                        {{ item.current_units }} {{ unitShort }} lidos
                    </template>
                    <template v-else>
                        {{ item.current_units }} / {{ item.content?.total_units }} {{ unitShort }}
                    </template>
                    <span v-if="item.rating != null" class="ml-2 text-amber-400">★ {{ item.rating }}</span>
                </div>

                <!-- Progress bar -->
                <div class="h-[3px] bg-white/[0.07] rounded overflow-hidden">
                    <div
                        v-if="isOngoing"
                        class="shimmer-bar h-full w-[40%] rounded"
                        :style="{ background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)` }"
                    ></div>
                    <div
                        v-else
                        class="h-full rounded transition-[width] duration-300"
                        :style="{ width: progressPct + '%', background: statusColor }"
                    ></div>
                </div>
            </div>

            <!-- +1 button -->
            <button
                class="w-8 h-8 rounded-full flex-shrink-0 self-center flex items-center justify-center text-base font-bold border-none cursor-pointer transition-all duration-200"
                :class="plusActive ? 'bg-neon-accent text-black scale-[1.2]' : 'bg-neon-elevated text-neon-accent'"
                @click.stop="handlePlus"
            >+</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IonIcon } from '@ionic/vue';
import { bookOutline, tvOutline, libraryOutline } from 'ionicons/icons';
import { UserContent, ContentStatus } from '@/services/userContentService';
import { CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS, UNIT_LABEL, ContentType } from '@/services/contentService';
import StatusBadge from './StatusBadge.vue';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
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
    components: { IonIcon, StatusBadge },
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
        typeColorClass(): string {
            return CONTENT_TYPE_COLORS[this.contentType];
        },
        typeLabel(): string {
            return CONTENT_TYPE_LABELS[this.contentType];
        },
        unitShort(): string {
            return UNIT_LABEL[this.contentType].short;
        },
        isOngoing(): boolean {
            return !this.item.content?.total_units;
        },
        statusColor(): string {
            return STATUS_COLORS[this.item.status] ?? '#5a6480';
        },
        progressPct(): number {
            const total = this.item.content?.total_units;
            if (!total) return 0;
            return Math.min((this.item.current_units / total) * 100, 100);
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
