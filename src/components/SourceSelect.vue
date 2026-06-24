<template>
    <div>
        <!-- Trigger -->
        <button type="button" class="source-trigger" @click="open = true">
            <span class="source-logo">
                <img v-if="current?.logo_url" :src="current.logo_url" alt="" />
                <IonIcon v-else :icon="globeOutline" />
            </span>
            <span class="source-name" :style="{ color: current ? 'var(--text-primary)' : 'var(--text-muted)' }">{{ current?.name ?? 'Sem fonte' }}</span>
            <IonIcon :icon="chevronDownOutline" class="source-caret" />
        </button>

        <!-- Bottom sheet -->
        <IonModal :is-open="open" :initial-breakpoint="0.6" :breakpoints="[0, 0.6, 1]" :handle="true" class="source-modal" @didDismiss="open = false">
            <IonContent class="source-sheet">
                <div style="padding: 14px 16px 40px;">
                    <div class="source-sheet-title">Fonte</div>
                    <button type="button" class="source-option" :class="{ active: normalized === null }" @click="select(null)">
                        <span class="source-logo"><IonIcon :icon="globeOutline" /></span>
                        <span class="source-name">Sem fonte</span>
                        <IonIcon v-if="normalized === null" :icon="checkmarkOutline" class="source-check" />
                    </button>
                    <button v-for="s in sites" :key="s.id" type="button" class="source-option" :class="{ active: normalized === s.id }" @click="select(s.id)">
                        <span class="source-logo">
                            <img v-if="s.logo_url" :src="s.logo_url" alt="" />
                            <IonIcon v-else :icon="globeOutline" />
                        </span>
                        <span class="source-name">{{ s.name }}</span>
                        <IonIcon v-if="normalized === s.id" :icon="checkmarkOutline" class="source-check" />
                    </button>
                </div>
            </IonContent>
        </IonModal>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IonModal, IonContent, IonIcon } from '@ionic/vue';
import { globeOutline, chevronDownOutline, checkmarkOutline } from 'ionicons/icons';
import { UserSite } from '@/services/userSiteService';

export default defineComponent({
    name: 'SourceSelect',
    components: { IonModal, IonContent, IonIcon },
    props: {
        modelValue: { type: [Number, String, null] as PropType<number | string | null>, default: null },
        sites: { type: Array as PropType<UserSite[]>, default: () => [] },
    },
    emits: ['update:modelValue'],
    data() {
        return { open: false, globeOutline, chevronDownOutline, checkmarkOutline };
    },
    computed: {
        normalized(): number | null {
            return this.modelValue === null || this.modelValue === '' ? null : Number(this.modelValue);
        },
        current(): UserSite | null {
            return this.normalized === null ? null : (this.sites.find((s) => s.id === this.normalized) ?? null);
        },
    },
    methods: {
        select(id: number | null) {
            this.open = false;
            this.$emit('update:modelValue', id);
        },
    },
});
</script>

<style scoped>
.source-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-default);
    cursor: pointer;
    min-height: 48px;
}
.source-name {
    flex: 1;
    min-width: 0;
    text-align: left;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.source-caret {
    font-size: 16px;
    color: var(--text-muted);
    flex-shrink: 0;
}
.source-logo {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--bg-tertiary);
}
.source-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
.source-logo ion-icon {
    font-size: 15px;
    color: var(--text-muted);
}
.source-sheet {
    --background: var(--bg-secondary);
}
.source-sheet-title {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 12px;
}
.source-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    margin-bottom: 4px;
}
.source-option.active {
    background: var(--bg-tertiary);
    border-color: var(--border-default);
}
.source-modal::part(handle) {
    background: var(--border-hover);
}
.source-option .source-name {
    font-weight: 600;
    color: var(--text-primary);
}
.source-check {
    font-size: 18px;
    color: var(--accent-primary);
    flex-shrink: 0;
}
</style>
