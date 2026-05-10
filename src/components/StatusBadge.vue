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
    background: rgba(125, 167, 255, 0.15);
    color: #7CAEFF;
}

.status-completed {
    background: rgba(52, 211, 153, 0.15);
    color: #00F5A0;
}

.status-plan-to-read {
    background: rgba(167, 139, 250, 0.15);
    color: #B8A4FF;
}

.status-dropped {
    background: rgba(239, 107, 107, 0.15);
    color: #FF5E5E;
}

.status-paused {
    background: rgba(230, 184, 92, 0.15);
    color: #F5C542;
}
</style>
