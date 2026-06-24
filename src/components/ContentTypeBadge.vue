<template>
    <span class="content-type-badge">{{ label }}</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

const LABELS: Record<string, string> = {
    manga: 'MANGÁ',
    manhwa: 'MANHWA',
    manhua: 'MANHUA',
    anime: 'ANIME',
    movie: 'FILME',
    tv: 'SÉRIE',
    novel: 'NOVEL',
};

export default defineComponent({
    name: 'ContentTypeBadge',
    props: {
        type: { type: String, default: '' },
    },
    computed: {
        label(): string {
            return LABELS[this.type] ?? (this.type ?? '').toUpperCase();
        },
    },
});
</script>

<style scoped>
.content-type-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    color: #ffffff;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 2px 6px;
    border-radius: 3px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
    text-transform: uppercase;
    line-height: 1.4;
}
</style>
