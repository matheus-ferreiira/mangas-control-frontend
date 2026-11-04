<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonSpinner } from '@ionic/vue';
import ReaderToolbar from '@/components/reader/ReaderToolbar.vue';
import { novelReaderService, ReaderIndex, ReaderChapter, startingChapter } from '@/services/novelReaderService';
import { userContentService, UserContent } from '@/services/userContentService';

interface ReadingPosition { chapter: number; ratio: number }

export default defineComponent({
    name: 'NovelReaderPage',
    components: { IonPage, IonContent, IonSpinner, ReaderToolbar },
    data() {
        return {
            index: null as ReaderIndex | null,
            chapter: null as ReaderChapter | null,
            userContent: null as UserContent | null,
            loading: true, saving: false, error: '', notice: '',
            fontSize: 20, light: false, requestId: 0, currentRatio: 0,
        };
    },
    computed: {
        contentId(): number { return Number(this.$route.params.id); },
        positionKey(): string {
            let userId = 'unknown';
            try { userId = String(JSON.parse(localStorage.getItem('auth_user') || '{}').id ?? 'unknown'); } catch { /* No saved session. */ }
            return `novel-position:${userId}:${this.contentId}`;
        },
        previous(): number | null {
            const i = this.index?.chapters.indexOf(this.chapter?.number ?? 0) ?? -1;
            return this.index?.chapters[i - 1] ?? null;
        },
        next(): number | null {
            const i = this.index?.chapters.indexOf(this.chapter?.number ?? 0) ?? -1;
            return this.index?.chapters[i + 1] ?? null;
        },
        alreadyRead(): boolean { return !!this.chapter && (this.userContent?.current_units ?? 0) >= this.chapter.number; },
    },
    watch: {
        '$route.fullPath'() {
            if (this.$route.name === 'novel-reader') void this.load();
        },
    },
    mounted() {
        try {
            const settings = JSON.parse(localStorage.getItem('novel-reader-settings') || '{}');
            if (Number.isFinite(settings.fontSize)) this.fontSize = Math.max(16, Math.min(32, settings.fontSize));
            this.light = settings.light === true;
        } catch { /* Reading works without storage. */ }
        void this.load();
    },
    ionViewWillLeave() { this.savePosition(); this.requestId++; },
    beforeUnmount() { this.requestId++; },
    methods: {
        savedPosition(): ReadingPosition | null {
            try {
                const saved = JSON.parse(localStorage.getItem(this.positionKey) || 'null');
                return saved && Number.isInteger(saved.chapter) && Number.isFinite(saved.ratio) ? saved : null;
            } catch { return null; }
        },
        savePosition() {
            if (!this.chapter || this.loading) return;
            try { localStorage.setItem(this.positionKey, JSON.stringify({ chapter: this.chapter.number, ratio: this.currentRatio })); } catch { /* Storage may be full or disabled. */ }
        },
        onScroll(event: CustomEvent<{ scrollTop: number }>) {
            const element = event.target as HTMLElement;
            void (element as HTMLElement & { getScrollElement(): Promise<HTMLElement> }).getScrollElement().then((scroll) => {
                if (this.loading) return;
                this.currentRatio = Math.max(0, Math.min(1, event.detail.scrollTop / Math.max(1, scroll.scrollHeight - scroll.clientHeight)));
                this.savePosition();
            });
        },
        async load() {
            const requestId = ++this.requestId;
            const id = this.contentId;
            this.loading = true; this.error = ''; this.notice = ''; this.chapter = null;
            try {
                const [index, library] = await Promise.all([novelReaderService.index(id), userContentService.getAll({ content_id: id })]);
                if (requestId !== this.requestId) return;
                this.index = index;
                this.userContent = library.find((item) => item.content?.id === id || item.content_id === id) ?? null;
                const saved = this.savedPosition();
                if (!this.$route.params.chapter) {
                    const number = startingChapter(index, this.userContent?.current_units ?? 0, saved?.chapter);
                    await this.$router.replace(`/reader/${id}/${number}`);
                    return;
                }
                const number = Number(this.$route.params.chapter);
                if (!index.chapters.includes(number)) throw new Error('Este capítulo não está disponível. Use a seleção de capítulos.');
                const chapter = await novelReaderService.chapter(id, number);
                if (requestId !== this.requestId) return;
                this.chapter = chapter;
                this.currentRatio = saved?.chapter === number ? Math.max(0, Math.min(1, saved.ratio)) : 0;
                this.loading = false;
                await this.$nextTick();
                const content = this.$refs.content as { $el: HTMLIonContentElement } | undefined;
                if (content) {
                    const scroll = await content.$el.getScrollElement();
                    if (requestId === this.requestId) await content.$el.scrollToPoint(0, this.currentRatio * (scroll.scrollHeight - scroll.clientHeight), 0);
                }
                this.savePosition();
            } catch (error: unknown) {
                if (requestId !== this.requestId) return;
                this.error = error instanceof Error && !('response' in error) ? error.message : 'Não foi possível carregar o capítulo. Confira sua conexão e tente novamente.';
            } finally {
                if (requestId === this.requestId) this.loading = false;
            }
        },
        navigate(number: number) {
            if (this.saving) return;
            this.savePosition();
            void this.$router.replace(`/reader/${this.contentId}/${number}`);
        },
        settings(fontSize?: number, light?: boolean) {
            this.fontSize = fontSize ?? this.fontSize; this.light = light ?? this.light;
            try { localStorage.setItem('novel-reader-settings', JSON.stringify({ fontSize: this.fontSize, light: this.light })); } catch { /* Optional preferences. */ }
        },
        async complete() {
            if (!this.chapter || this.saving) return;
            this.saving = true; this.notice = '';
            try {
                // Re-read progress to avoid reducing it after reading an earlier chapter.
                const latest = this.userContent ? await userContentService.getOne(this.userContent.id) : null;
                const number = this.chapter.number;
                this.userContent = latest
                    ? await userContentService.update(latest.id, { current_units: Math.max(latest.current_units, number) })
                    : await userContentService.create({ content_id: this.contentId, status: 'reading', current_units: number });
                this.notice = `Histórico salvo até o capítulo ${this.userContent.current_units}.`;
            } catch {
                this.notice = 'Não foi possível salvar o histórico. Tente novamente antes de sair.';
            } finally { this.saving = false; }
        },
    },
});
</script>

<template>
    <IonPage class="novel-reader" :class="{ 'reader-light': light }">
        <IonContent ref="content" :scroll-events="true" @ionScroll="onScroll">
            <div class="reader-shell">
                <header class="reader-heading" lang="pt-BR">
                    <router-link :to="`/content/${contentId}`" class="reader-back">← Voltar à novel</router-link>
                    <div class="reader-eyebrow">NEON CURATOR / LEITURA</div>
                    <h1>{{ index?.title ?? 'Leitor de novels' }}</h1>
                    <p v-if="index" class="reader-range">Capítulos {{ index.first_chapter }}–{{ index.last_chapter }} · Original em inglês</p>
                    <ReaderToolbar v-if="index" :chapters="index.chapters" :chapter="chapter?.number ?? Number($route.params.chapter)" :font-size="fontSize" :light="light" :browser-url="chapter?.browser_url" @navigate="navigate" @font="settings($event)" @theme="settings(fontSize, !light)" />
                    <p class="translation-help">No navegador, use o menu “Traduzir” para ler em português. Marque o progresso aqui ao terminar.</p>
                </header>
                <div v-if="loading" class="reader-state" role="status"><IonSpinner /><p>Preparando seu capítulo…</p></div>
                <div v-else-if="error" class="reader-state" role="alert"><p>{{ error }}</p><button @click="load">Tentar novamente</button></div>
                <template v-else-if="chapter">
                    <div class="chapter-title"><span>CAPÍTULO</span><strong>{{ chapter.number }}</strong></div>
                    <article :lang="chapter.language" :style="{ fontSize: fontSize + 'px' }" aria-label="Texto do capítulo">
                        <p v-for="(paragraph, i) in chapter.paragraphs" :key="i">{{ paragraph }}</p>
                    </article>
                    <footer lang="pt-BR">
                        <p class="reader-edition">Texto original recuperado, com sugestões e comentários de edição removidos.</p>
                        <button class="complete-button" :disabled="saving || alreadyRead" @click="complete">{{ saving ? 'Salvando…' : alreadyRead ? 'Já registrado no histórico' : `Concluí o capítulo ${chapter.number}` }}</button>
                        <p v-if="notice" role="status">{{ notice }}</p>
                        <nav class="reader-navigation" aria-label="Navegar entre capítulos">
                            <button :disabled="previous == null || saving" @click="previous != null && navigate(previous)">← Anterior</button>
                            <span>{{ chapter.number }} / {{ index?.last_chapter }}</span>
                            <button :disabled="next == null || saving" @click="next != null && navigate(next)">Próximo →</button>
                        </nav>
                    </footer>
                </template>
            </div>
        </IonContent>
    </IonPage>
</template>

<style scoped>
.novel-reader { --paper: #15171b; --ink: #dad8d2; --subtle: #aaa59a; --rule: #373632; --gold: #e4b16b; }
.reader-light { --paper: #f7f2e8; --ink: #30291f; --subtle: #746b5c; --rule: #d9cebc; --gold: #8a4b09; }
ion-content { --background: var(--paper); --color: var(--ink); }
.reader-shell { max-width: 790px; margin: auto; padding: max(26px, env(safe-area-inset-top)) 24px max(48px, env(safe-area-inset-bottom)); }
.reader-heading { border-bottom: 1px solid var(--rule); padding-bottom: 24px; }
.reader-back { display: inline-block; margin-bottom: 35px; color: var(--subtle); font-size: 14px; text-decoration: none; }
.reader-eyebrow, .chapter-title span { font: 11px/1.5 system-ui, sans-serif; letter-spacing: .17em; color: var(--gold); }
h1 { font: 500 clamp(26px, 5vw, 38px)/1.2 Georgia, serif; margin: 12px 0; }
.reader-range, .translation-help, .reader-edition { color: var(--subtle); font-size: 13px; line-height: 1.65; }
.reader-range { margin-bottom: 24px; }.translation-help { margin-bottom: 0; }
.chapter-title { display: flex; flex-direction: column; align-items: center; margin: 48px 0 38px; }
.chapter-title strong { font: 48px/1.3 Georgia, serif; }
article { font-family: Georgia, 'Times New Roman', serif; line-height: 1.85; }
article p { white-space: pre-wrap; overflow-wrap: anywhere; margin: 0 0 1.2em; }
footer { border-top: 1px solid var(--rule); padding-top: 24px; margin-top: 40px; }
button { min-height: 46px; padding: 12px 16px; border-radius: 9px; border: 1px solid var(--rule); background: transparent; color: var(--ink); cursor: pointer; font-size: 14px; }
button:disabled { opacity: .5; cursor: default; }
.complete-button { width: 100%; border-color: var(--gold); color: var(--gold); }
.reader-navigation { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 26px; }
.reader-navigation span { color: var(--subtle); font-size: 12px; }
.reader-state { padding: 80px 0; text-align: center; }
@media (max-width: 480px) { .reader-shell { padding-right: 18px; padding-left: 18px; } }
</style>
