<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Capacitor } from '@capacitor/core';

export default defineComponent({
    name: 'ReaderToolbar',
    data() { return { native: Capacitor.isNativePlatform() }; },
    props: {
        chapters: { type: Array as PropType<number[]>, required: true },
        chapter: { type: Number, required: true },
        fontSize: { type: Number, required: true },
        light: Boolean,
        browserUrl: { type: String, default: '' },
    },
    emits: {
        navigate: (chapter: number) => Number.isInteger(chapter),
        font: (size: number) => size >= 16 && size <= 32,
        theme: () => true,
    },
    methods: {
        select(event: Event) {
            this.$emit('navigate', Number((event.target as HTMLSelectElement).value));
        },
    },
});
</script>

<template>
    <div class="reader-tools" aria-label="Opções de leitura">
        <label>Capítulo
            <select :value="chapter" @change="select">
                <option v-for="number in chapters" :key="number" :value="number">{{ number }}</option>
            </select>
        </label>
        <div class="font-controls" aria-label="Tamanho do texto">
            <button :disabled="fontSize <= 16" aria-label="Diminuir fonte" @click="$emit('font', fontSize - 2)">A−</button>
            <button :disabled="fontSize >= 32" aria-label="Aumentar fonte" @click="$emit('font', fontSize + 2)">A+</button>
        </div>
        <button :aria-pressed="light" @click="$emit('theme')">{{ light ? 'Tema escuro' : 'Tema claro' }}</button>
        <a v-if="browserUrl" :href="browserUrl" :target="native ? '_self' : '_blank'" rel="noopener noreferrer">Traduzir no navegador ↗</a>
    </div>
</template>

<style scoped>
.reader-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; font: 13px/1.5 system-ui, sans-serif; }
label { display: flex; align-items: center; gap: 8px; }
button, select, a { min-height: 42px; padding: 9px 12px; border: 1px solid currentColor; border-radius: 8px; color: inherit; background: transparent; text-decoration: none; }
select { color-scheme: dark; } option { background: #202126; color: #eee; }
.font-controls { display: flex; gap: 5px; }
button:disabled { opacity: .35; }
button, select { cursor: pointer; }
a { color: #c58d3e; }
</style>
