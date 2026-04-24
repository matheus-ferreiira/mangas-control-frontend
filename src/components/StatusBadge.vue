<template>
    <span class="status-badge" :class="statusClass">{{ label }}</span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ContentStatus, getStatusLabel } from '@/services/userContentService';
import { ContentType } from '@/services/contentService';

export default defineComponent({
    name: 'StatusBadge',
    props: {
        status: {
            type: String as PropType<ContentStatus>,
            required: true,
        },
        type: {
            type: String as PropType<ContentType>,
            default: 'manga',
        },
    },
    computed: {
        label(): string {
            return getStatusLabel(this.status, this.type);
        },
        statusClass(): string {
            return `status-${this.status.replace(/_/g, '-')}`;
        },
    },
});
</script>

<style scoped>
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
}

.status-reading {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
}

.status-completed {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
}

.status-plan-to-read {
    background: rgba(139, 92, 246, 0.15);
    color: #8b5cf6;
}

.status-dropped {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
}

.status-paused {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
}
</style>
