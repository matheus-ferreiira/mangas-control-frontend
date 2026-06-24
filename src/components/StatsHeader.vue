<template>
    <div class="stats-header">
        <div v-for="(s, i) in stats" :key="i" class="stats-col" :class="{ divider: i > 0 }">
            <div class="stats-value" :style="{ color: valueColor(s) }">{{ s.value }}</div>
            <div class="stats-label">{{ s.label }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export interface StatItem {
    value: string | number;
    label: string;
    accent?: boolean;
    color?: string;
}

export default defineComponent({
    name: 'StatsHeader',
    props: {
        stats: { type: Array as PropType<StatItem[]>, default: () => [] },
    },
    methods: {
        valueColor(s: StatItem): string {
            return s.color ?? (s.accent ? 'var(--accent-primary)' : 'var(--text-primary)');
        },
    },
});
</script>

<style scoped>
.stats-header {
    display: flex;
    align-items: stretch;
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: 12px;
    overflow: hidden;
    padding: 14px 0;
}
.stats-col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 16px;
}
.stats-col.divider {
    border-left: 1px solid var(--border-default);
}
.stats-value {
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 1;
    font-family: 'Sora', system-ui, sans-serif;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}
.stats-label {
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 4px;
}
</style>
