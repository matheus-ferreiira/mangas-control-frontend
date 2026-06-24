<template>
    <div>
        <!-- Toolbar: total + ações + Filtros -->
        <div class="fb-toolbar">
            <span class="fb-count">
                <template v-if="count > 0">{{ count.toLocaleString('pt-BR') }} {{ count === 1 ? unit : unit + 's' }}</template>
                <template v-else>Nenhum resultado</template>
            </span>
            <div class="fb-actions">
                <slot name="actions" />
                <button class="fb-btn" :class="{ active: activeCount > 0 }" @click="open = true">
                    <IonIcon :icon="optionsOutline" style="font-size: 15px;" />
                    <span>Filtros</span>
                    <span v-if="activeCount > 0" class="fb-badge">{{ activeCount }}</span>
                </button>
            </div>
        </div>

        <!-- Bottom sheet -->
        <IonModal :is-open="open" :initial-breakpoint="0.9" :breakpoints="[0, 0.9, 1]" :handle="true" handle-behavior="cycle" class="fb-modal" @didDismiss="onDismiss">
            <IonHeader class="fb-sheet-header">
                <div style="padding: 12px 20px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 18px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em;">Filtros</div>
                            <div v-if="activeCount > 0" style="font-size: 11px; color: var(--accent-primary); font-weight: 600; margin-top: 2px;">{{ activeCount }} ativo{{ activeCount > 1 ? 's' : '' }}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="fb-clear" @click="$emit('clear')">Limpar</button>
                            <button class="fb-close" @click="open = false">
                                <IonIcon :icon="closeOutline" />
                            </button>
                        </div>
                    </div>
                </div>
            </IonHeader>
            <IonContent class="fb-sheet-content">
                <div style="padding: 6px 20px 120px;">
                    <slot />
                </div>
            </IonContent>
            <IonFooter class="fb-sheet-footer">
                <div style="padding: 12px 20px;">
                    <button class="fb-apply" @click="open = false">
                        Aplicar filtros
                        <span v-if="activeCount > 0" class="fb-apply-badge">{{ activeCount }}</span>
                    </button>
                </div>
            </IonFooter>
        </IonModal>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonModal, IonHeader, IonContent, IonFooter, IonIcon } from '@ionic/vue';
import { optionsOutline, closeOutline } from 'ionicons/icons';

export default defineComponent({
    name: 'FilterBar',
    components: { IonModal, IonHeader, IonContent, IonFooter, IonIcon },
    props: {
        count: { type: Number, default: 0 },
        activeCount: { type: Number, default: 0 },
        unit: { type: String, default: 'obra' },
    },
    emits: ['apply', 'clear'],
    data() {
        return { open: false, optionsOutline, closeOutline };
    },
    methods: {
        onDismiss() {
            this.open = false;
            this.$emit('apply');
        },
    },
});
</script>

<style scoped>
.fb-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px 12px;
    gap: 10px;
}
.fb-count {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--text-muted);
}
.fb-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}
.fb-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 10px;
    border: 1px solid var(--border-default);
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
}
.fb-modal::part(handle) {
    background: var(--border-hover);
}
.fb-btn.active {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
}
.fb-badge {
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    background: var(--accent-primary);
    color: #000;
    font-size: 9px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.fb-modal {
    --background: var(--bg-secondary);
}
.fb-sheet-header {
    --background: var(--bg-secondary);
    background: var(--bg-secondary);
}
.fb-sheet-content {
    --background: var(--bg-secondary);
}
.fb-sheet-footer {
    --background: var(--bg-secondary);
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-default);
}
.fb-clear {
    padding: 7px 14px;
    border-radius: 10px;
    border: 1px solid var(--border-default);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
}
.fb-close {
    width: 32px;
    height: 32px;
    border-radius: 16px;
    border: none;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}
.fb-apply {
    width: 100%;
    padding: 13px;
    border-radius: 12px;
    border: none;
    background: var(--accent-primary);
    color: #000;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
.fb-apply-badge {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    padding: 2px 8px;
    font-size: 11px;
}
</style>
