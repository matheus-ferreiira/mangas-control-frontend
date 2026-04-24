<template>
    <div
        class="flex items-center gap-3.5 bg-neon-surface border border-neon-border rounded-2xl p-3 mb-3 cursor-pointer transition-[border-color,transform] duration-150 active:scale-[0.98] active:border-neon-accent"
        @click="$emit('click')"
    >
        <!-- Cover -->
        <div class="flex-shrink-0 w-16 h-[88px] rounded-[10px] overflow-hidden relative">
            <img
                v-if="item.content?.cover"
                :src="item.content.cover"
                :alt="item.content?.name"
                class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted text-[28px]">
                <IonIcon :icon="typeIcon" />
            </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 mb-1">
                <span class="text-[9px] font-bold tracking-[1px] uppercase px-1.5 py-0.5 rounded" :class="typeColorClass">
                    {{ typeLabel }}
                </span>
            </div>

            <h3 class="text-[15px] font-bold text-neon-text m-0 mb-1 truncate">
                {{ item.content?.name || 'Desconhecido' }}
            </h3>

            <p class="text-[13px] text-neon-muted m-0 mb-2">
                {{ unitShort }} {{ item.current_units }}
                <span v-if="item.content?.total_units" class="opacity-50"> / {{ item.content.total_units }}</span>
            </p>

            <div class="flex items-center gap-2 flex-wrap">
                <StatusBadge :status="item.status" :type="item.content?.type ?? 'manga'" />
                <span v-if="item.site" class="text-[11px] text-neon-muted bg-neon-elevated rounded-md px-2 py-0.5">
                    {{ item.site.name }}
                </span>
                <span v-if="item.rating != null" class="text-[11px] text-yellow-400 bg-neon-elevated rounded-md px-2 py-0.5">
                    ★ {{ item.rating }}
                </span>
            </div>
        </div>

        <IonIcon :icon="chevronForwardOutline" class="text-neon-muted text-lg flex-shrink-0" />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IonIcon } from '@ionic/vue';
import { bookOutline, tvOutline, libraryOutline, chevronForwardOutline } from 'ionicons/icons';
import { UserContent } from '@/services/userContentService';
import { CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS, UNIT_LABEL, ContentType } from '@/services/contentService';
import StatusBadge from './StatusBadge.vue';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
};

export default defineComponent({
    name: 'ContentCard',
    components: { IonIcon, StatusBadge },
    emits: ['click'],
    props: {
        item: { type: Object as PropType<UserContent>, required: true },
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
    },
    data() {
        return { chevronForwardOutline };
    },
});
</script>
