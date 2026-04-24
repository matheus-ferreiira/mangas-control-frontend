<template>
    <div
        class="flex items-center gap-3.5 bg-neon-surface border border-neon-border rounded-2xl p-3 mb-3 cursor-pointer transition-[border-color,transform] duration-150 active:scale-[0.98] active:border-neon-accent"
        @click="$emit('click')"
    >
        <div class="flex-shrink-0 w-16 h-[88px] rounded-[10px] overflow-hidden">
            <img
                v-if="userManga.manga?.cover"
                :src="userManga.manga.cover"
                :alt="userManga.manga?.name"
                class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted text-[28px]">
                <ion-icon :icon="bookOutline" />
            </div>
        </div>

        <div class="flex-1 min-w-0">
            <h3 class="text-[15px] font-bold text-neon-text m-0 mb-1 truncate">
                {{ userManga.manga?.name || 'Desconhecido' }}
            </h3>
            <p class="text-[13px] text-neon-muted m-0 mb-2">Capítulo {{ userManga.current_chapters }}</p>
            <div class="flex items-center gap-2 flex-wrap">
                <status-badge :status="userManga.status" />
                <span v-if="userManga.site" class="text-[11px] text-neon-muted bg-neon-elevated rounded-md px-2 py-0.5">
                    {{ userManga.site.name }}
                </span>
            </div>
        </div>

        <ion-icon :icon="chevronForwardOutline" class="text-neon-muted text-lg flex-shrink-0" />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IonIcon } from '@ionic/vue';
import { bookOutline, chevronForwardOutline } from 'ionicons/icons';
import { UserManga } from '@/services/userMangaService';
import StatusBadge from './StatusBadge.vue';

export default defineComponent({
    name: 'MangaCard',
    components: { IonIcon, StatusBadge },
    emits: ['click'],
    props: {
        userManga: { type: Object as PropType<UserManga>, required: true },
    },
    data() {
        return { bookOutline, chevronForwardOutline };
    },
});
</script>
