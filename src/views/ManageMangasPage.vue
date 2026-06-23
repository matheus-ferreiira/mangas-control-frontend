<template>
    <IonPage>
        <IonHeader class="ion-header">
            <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton default-href="/tabs/discover" text="" />
                </IonButtons>
                <IonTitle>Acervo</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true">
            <div class="px-5 pt-4 pb-28">

                <!-- Search -->
                <IonSearchbar
                    :value="filterSearch"
                    placeholder="Buscar no acervo..."
                    show-clear-button="focus"
                    class="neon-search mb-3"
                    @ionInput="onSearch"
                />

                <!-- Type filter -->
                <div class="flex bg-neon-surface border border-neon-border rounded-xl p-1 gap-0.5 mb-4">
                    <div
                        v-for="opt in [{ label: 'Todos', value: null, icon: null }, ...typeOptions]"
                        :key="opt.value ?? 'all'"
                        class="flex-1 flex items-center justify-center gap-1 h-9 rounded-[9px] text-[11px] font-bold transition-colors cursor-pointer select-none"
                        :class="filterType === opt.value ? 'bg-neon-accent text-black' : 'text-neon-muted'"
                        @click="setFilterType(opt.value as any)"
                    >
                        <IonIcon v-if="opt.icon" :icon="opt.icon" class="text-[13px]" />
                        {{ opt.label }}
                    </div>
                </div>

                <!-- List header -->
                <div class="flex items-center gap-2.5 mb-3.5">
                    <h2 class="text-lg font-extrabold text-neon-text m-0">Acervo</h2>
                    <span
                        v-if="meta.total > 0"
                        class="bg-neon-accent/12 border border-neon-accent/20 text-neon-accent rounded-full px-2.5 py-0.5 text-xs font-bold"
                    >{{ meta.total }}</span>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex justify-center py-10">
                    <IonSpinner name="crescent" color="primary" />
                </div>

                <!-- Empty -->
                <div v-else-if="contents.length === 0" class="text-center py-12">
                    <div class="w-16 h-16 bg-neon-surface border border-neon-border rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <IonIcon :icon="bookOutline" class="text-[32px] text-neon-muted" />
                    </div>
                    <p class="text-sm text-neon-muted m-0 mb-4">
                        {{ filterSearch || filterType ? 'Nenhum resultado encontrado.' : 'Nenhum item no acervo ainda.' }}
                    </p>
                    <IonButton fill="outline" class="btn-outline" @click="openModal(null)">
                        <IonIcon slot="start" :icon="addOutline" />
                        Adicionar primeiro
                    </IonButton>
                </div>

                <!-- List -->
                <div v-else>
                    <div
                        v-for="content in contents"
                        :key="content.id"
                        class="flex items-center gap-3 bg-neon-surface border border-neon-border rounded-[14px] p-3 mb-2.5"
                    >
                        <div class="w-12 h-[66px] rounded-lg overflow-hidden flex-shrink-0">
                            <img v-if="content.cover" :src="content.cover" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted text-2xl">
                                <IonIcon :icon="getTypeIcon(content.type)" />
                            </div>
                        </div>
                        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded inline-block" :class="getTypeColor(content.type)">
                                    {{ CONTENT_TYPE_LABELS[content.type] }}
                                </span>
                                <span
                                    v-if="content.status"
                                    class="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                    :style="{ background: getCatalogStatusColor(content.status) + '22', color: getCatalogStatusColor(content.status) }"
                                >
                                    {{ CATALOG_STATUS_LABELS[content.status] }}
                                </span>
                            </div>
                            <span class="text-sm font-bold text-neon-text truncate">{{ content.name }}</span>
                            <span v-if="content.alternative_names?.length" class="text-[10px] text-neon-muted truncate">
                                {{ content.alternative_names.slice(0, 2).join(' · ') }}
                            </span>
                            <span v-if="content.total_units" class="text-xs text-neon-muted">
                                {{ content.total_units }} {{ UNIT_LABEL[content.type]?.plural ?? 'unidades' }}
                            </span>
                        </div>
                        <div class="flex gap-2 flex-shrink-0">
                            <IonButton fill="outline" class="icon-btn edit-btn" @click="openModal(content)">
                                <IonIcon slot="icon-only" :icon="pencilOutline" />
                            </IonButton>
                            <IonButton fill="outline" class="icon-btn delete-btn" @click="confirmDelete(content)">
                                <IonIcon slot="icon-only" :icon="trashOutline" />
                            </IonButton>
                        </div>
                    </div>

                    <!-- Paginação -->
                    <div v-if="meta.last_page > 1" class="flex items-center justify-center gap-4 mt-5 py-2">
                        <button
                            class="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors"
                            :class="meta.current_page <= 1 ? 'border-neon-border text-neon-border opacity-40 cursor-not-allowed' : 'border-neon-border text-neon-muted'"
                            :disabled="meta.current_page <= 1"
                            @click="goToPage(meta.current_page - 1)"
                        >
                            <IonIcon :icon="chevronBackOutline" />
                        </button>
                        <span class="text-sm text-neon-muted">
                            <span class="text-neon-text font-bold">{{ meta.current_page }}</span>
                            &nbsp;/&nbsp;{{ meta.last_page }}
                        </span>
                        <button
                            class="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors"
                            :class="meta.current_page >= meta.last_page ? 'border-neon-border text-neon-border opacity-40 cursor-not-allowed' : 'border-neon-border text-neon-muted'"
                            :disabled="meta.current_page >= meta.last_page"
                            @click="goToPage(meta.current_page + 1)"
                        >
                            <IonIcon :icon="chevronForwardOutline" />
                        </button>
                    </div>
                </div>
            </div>
        </IonContent>

        <!-- FAB -->
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton color="primary" @click="openModal(null)">
                <IonIcon :icon="addOutline" />
            </IonFabButton>
        </IonFab>

        <!-- ====== MODAL CRIAR / EDITAR ====== -->
        <IonModal :is-open="isModalOpen" @didDismiss="closeModal" :initial-breakpoint="1" :breakpoints="[0, 1]">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{{ editingId ? 'Editar Conteúdo' : 'Novo Conteúdo' }}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton fill="clear" @click="closeModal">Cancelar</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent class="modal-content">
                <div class="px-5 pt-5 pb-12">

                    <!-- Capa -->
                    <div class="mb-5">
                        <div
                            class="w-full rounded-[14px] overflow-hidden bg-neon-elevated border-2 border-dashed border-neon-border flex items-center justify-center cursor-pointer transition-colors active:border-neon-accent/40"
                            :class="(coverPreview || form.cover) ? 'h-[160px] border-solid border-neon-accent/20' : 'h-[110px]'"
                            @click="triggerCoverPick"
                        >
                            <img v-if="coverPreview || form.cover" :src="coverPreview || form.cover" class="w-full h-full object-cover" alt="Capa" />
                            <div v-else class="flex items-center gap-3 p-4 text-center">
                                <div class="w-10 h-10 rounded-xl bg-neon-surface border border-neon-border flex items-center justify-center">
                                    <IonIcon :icon="imageOutline" class="text-[20px] text-neon-muted" />
                                </div>
                                <div class="text-left">
                                    <p class="text-sm font-semibold text-neon-text m-0">Selecionar Capa</p>
                                    <p class="text-xs text-neon-muted m-0 mt-0.5">Toque para escolher</p>
                                </div>
                            </div>
                        </div>
                        <p v-if="coverPreview || form.cover" class="text-[11px] text-neon-muted mt-1.5 text-center cursor-pointer" @click="triggerCoverPick">
                            Toque para alterar
                        </p>
                        <input ref="coverInput" type="file" accept="image/*" class="hidden" @change="onCoverSelected" />
                    </div>

                    <!-- ── Seção: Informações principais ── -->
                    <div class="section-label">Informações principais</div>
                    <div class="section-card mb-4">
                        <!-- Nome -->
                        <div class="mb-4">
                            <span class="field-label">Nome *</span>
                            <IonInput v-model="form.name" placeholder="Título da obra..." fill="outline" class="neon-input" />
                        </div>

                        <!-- Tipo -->
                        <div class="mb-4">
                            <span class="field-label">Tipo *</span>
                            <div class="grid grid-cols-5 gap-1.5">
                                <button
                                    v-for="opt in typeOptions"
                                    :key="opt.value"
                                    class="h-[38px] rounded-[10px] text-[11px] font-bold border transition-colors"
                                    :style="form.type === opt.value ? typeActiveStyle(opt.value) : { background: 'rgba(255,255,255,0.025)', color: 'rgba(233,237,242,0.42)', borderColor: 'rgba(255,255,255,0.06)' }"
                                    @click="form.type = opt.value"
                                >{{ opt.label }}</button>
                            </div>
                        </div>

                        <!-- Status de publicação -->
                        <div>
                            <span class="field-label">Status de Publicação</span>
                            <div class="grid grid-cols-2 gap-1.5">
                                <button
                                    v-for="opt in catalogStatusOptions"
                                    :key="opt.value"
                                    class="h-[38px] rounded-[10px] text-[12px] font-semibold border transition-colors"
                                    :style="form.status === opt.value
                                        ? { background: opt.color + '22', color: opt.color, borderColor: opt.color + '88' }
                                        : { background: 'rgba(255,255,255,0.025)', color: 'rgba(233,237,242,0.42)', borderColor: 'rgba(255,255,255,0.06)' }"
                                    @click="form.status = form.status === opt.value ? null : opt.value"
                                >{{ opt.label }}</button>
                            </div>
                        </div>
                    </div>

                    <!-- ── Seção: Unidades (dinâmica por tipo) ── -->
                    <template v-if="form.type !== 'movie'">
                        <div class="section-label">{{ unitsSectionLabel }}</div>
                        <div class="section-card mb-4">
                            <!-- Total de episódios / capítulos -->
                            <div :class="form.type === 'tv' || form.type === 'anime' ? 'mb-4' : ''">
                                <span class="field-label">Total de {{ UNIT_LABEL[form.type]?.plural }} (opcional)</span>
                                <IonInput
                                    :value="form.total_units ?? ''"
                                    type="number"
                                    inputmode="numeric"
                                    placeholder="Opcional"
                                    :min="0"
                                    fill="outline"
                                    class="neon-input"
                                    @ionInput="form.total_units = ($event as CustomEvent).detail.value ? Number(($event as CustomEvent).detail.value) : null"
                                />
                            </div>

                            <!-- Temporadas (só TV) -->
                            <div v-if="form.type === 'tv'" class="mb-4">
                                <span class="field-label">Temporadas (opcional)</span>
                                <IonInput
                                    :value="form.total_seasons ?? ''"
                                    type="number"
                                    inputmode="numeric"
                                    placeholder="Opcional"
                                    :min="1"
                                    fill="outline"
                                    class="neon-input"
                                    @ionInput="form.total_seasons = ($event as CustomEvent).detail.value ? Number(($event as CustomEvent).detail.value) : null"
                                />
                            </div>

                            <!-- Duração por episódio (anime/tv) -->
                            <div v-if="form.type === 'anime' || form.type === 'tv'">
                                <span class="field-label">Duração por episódio — min (opcional)</span>
                                <IonInput
                                    :value="form.duration ?? ''"
                                    type="number"
                                    inputmode="numeric"
                                    placeholder="Ex: 24"
                                    :min="1"
                                    fill="outline"
                                    class="neon-input"
                                    @ionInput="form.duration = ($event as CustomEvent).detail.value ? Number(($event as CustomEvent).detail.value) : null"
                                />
                            </div>
                        </div>
                    </template>

                    <!-- Duração para filmes -->
                    <template v-if="form.type === 'movie'">
                        <div class="section-label">Duração</div>
                        <div class="section-card mb-4">
                            <span class="field-label">Duração — min *</span>
                            <IonInput
                                :value="form.duration ?? ''"
                                type="number"
                                inputmode="numeric"
                                placeholder="Ex: 120"
                                :min="1"
                                fill="outline"
                                class="neon-input"
                                @ionInput="form.duration = ($event as CustomEvent).detail.value ? Number(($event as CustomEvent).detail.value) : null"
                            />
                        </div>
                    </template>

                    <!-- ── Seção: Sinopse ── -->
                    <div class="section-label">Sinopse</div>
                    <div class="section-card mb-4">
                        <IonTextarea
                            v-model="form.synopsis"
                            placeholder="Descrição da obra..."
                            fill="outline"
                            :auto-grow="true"
                            :rows="3"
                            class="neon-input"
                            style="--border-radius: 12px; --padding-start: 14px; --padding-end: 14px; --padding-top: 12px; --padding-bottom: 12px;"
                        />
                    </div>

                    <!-- ── Seção: Gêneros ── -->
                    <div class="section-label">Gêneros</div>
                    <div class="section-card mb-4">
                        <div class="flex gap-2 mb-3">
                            <IonInput
                                v-model="newGenreInput"
                                placeholder="Ex: Ação, Romance..."
                                fill="outline"
                                class="neon-input flex-1"
                                @keyup.enter="addGenre"
                            />
                            <button
                                class="w-[52px] h-[52px] rounded-[12px] flex items-center justify-center flex-shrink-0 border transition-colors"
                                style="background: rgba(245,166,35,0.1); border-color: rgba(245,166,35,0.3); color: #f5a623"
                                @click="addGenre"
                            >
                                <IonIcon :icon="addOutline" class="text-[20px]" />
                            </button>
                        </div>
                        <div v-if="form.genres.length" class="flex flex-wrap gap-1.5">
                            <div
                                v-for="(genre, i) in form.genres"
                                :key="i"
                                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                                style="background: rgba(245,166,35,0.1); color: #f5a623; border: 1px solid rgba(245,166,35,0.25)"
                            >
                                {{ genre }}
                                <button class="flex items-center opacity-60 active:opacity-100" @click="removeGenre(i)">
                                    <IonIcon :icon="closeOutline" class="text-[14px]" />
                                </button>
                            </div>
                        </div>
                        <p v-else class="text-[11px] text-neon-muted m-0">Nenhum gênero adicionado.</p>
                    </div>

                    <!-- ── Seção: Metadados ── -->
                    <div class="section-label">Metadados</div>
                    <div class="section-card mb-4">
                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <span class="field-label">Ano de lançamento</span>
                                <IonInput
                                    :value="form.release_year ?? ''"
                                    type="number"
                                    inputmode="numeric"
                                    placeholder="Ex: 2020"
                                    fill="outline"
                                    class="neon-input"
                                    @ionInput="form.release_year = ($event as CustomEvent).detail.value ? Number(($event as CustomEvent).detail.value) : null"
                                />
                            </div>
                            <div>
                                <span class="field-label">Rating (0–10)</span>
                                <IonInput
                                    :value="form.rating ?? ''"
                                    type="number"
                                    inputmode="decimal"
                                    placeholder="Ex: 8.5"
                                    :min="0"
                                    :max="10"
                                    step="0.1"
                                    fill="outline"
                                    class="neon-input"
                                    @ionInput="form.rating = ($event as CustomEvent).detail.value ? Number(($event as CustomEvent).detail.value) : null"
                                />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <span class="field-label">País</span>
                                <IonInput v-model="form.country" placeholder="Ex: JP" fill="outline" class="neon-input" />
                            </div>
                            <div>
                                <span class="field-label">Idioma original</span>
                                <IonInput v-model="form.original_language" placeholder="Ex: ja" fill="outline" class="neon-input" />
                            </div>
                        </div>
                    </div>

                    <!-- ── Seção: Nomes alternativos ── -->
                    <div class="section-label">
                        Nomes alternativos
                        <span class="ml-1.5 text-neon-muted font-normal normal-case tracking-normal text-[11px]">{{ form.alternative_names.length }}/50</span>
                    </div>
                    <div class="section-card mb-6">
                        <div
                            v-for="(_, i) in form.alternative_names"
                            :key="i"
                            class="flex items-center gap-2 mb-2"
                        >
                            <IonInput
                                :value="form.alternative_names[i]"
                                placeholder="Nome alternativo..."
                                fill="outline"
                                class="neon-input flex-1"
                                @ionInput="updateAltName(i, ($event as CustomEvent).detail.value ?? '')"
                            />
                            <button
                                class="w-[52px] h-[52px] rounded-[12px] flex items-center justify-center flex-shrink-0 border transition-colors"
                                style="background: rgba(239,107,107,0.08); border-color: rgba(239,107,107,0.2); color: #ef6b6b"
                                @click="removeAltName(i)"
                            >
                                <IonIcon :icon="closeOutline" class="text-[18px]" />
                            </button>
                        </div>
                        <button
                            v-if="form.alternative_names.length < 50"
                            class="w-full h-[44px] rounded-[12px] border border-dashed flex items-center justify-center gap-2 text-sm font-semibold transition-colors active:border-neon-accent/50 active:text-neon-accent"
                            style="border-color: rgba(255,255,255,0.06); color: rgba(233,237,242,0.42)"
                            @click="addAltName"
                        >
                            <IonIcon :icon="addOutline" />
                            Adicionar nome
                        </button>
                        <p v-if="form.alternative_names.length === 0" class="text-[11px] text-neon-muted m-0 mt-1">
                            Nenhum nome alternativo.
                        </p>
                    </div>

                    <!-- Botão salvar -->
                    <IonButton
                        expand="block"
                        class="btn-primary"
                        :disabled="saving || !form.name.trim() || (form.type === 'movie' && !form.duration)"
                        @click="editingId ? updateContent() : createContent()"
                    >
                        <IonSpinner v-if="saving" name="crescent" />
                        <span v-else>{{ editingId ? 'Salvar alterações' : 'Adicionar ao Acervo' }}</span>
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
    IonInput, IonTextarea, IonFab, IonFabButton, IonModal, IonSearchbar,
    toastController, alertController,
} from '@ionic/vue';
import {
    bookOutline, tvOutline, libraryOutline, filmOutline, desktopOutline,
    pencilOutline, trashOutline, imageOutline, addOutline, closeOutline,
    chevronBackOutline, chevronForwardOutline,
} from 'ionicons/icons';
import {
    contentService, Content, ContentType, ContentCatalogStatus, ContentMeta,
    CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS, UNIT_LABEL,
    CATALOG_STATUS_LABELS, CATALOG_STATUS_COLORS,
} from '@/services/contentService';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
    movie: filmOutline,
    tv: desktopOutline,
};

const EMPTY_META: ContentMeta = { current_page: 1, last_page: 1, per_page: 50, total: 0, from: 0, to: 0 };

function emptyForm() {
    return {
        name: '',
        type: 'manga' as ContentType,
        cover: '',
        status: null as ContentCatalogStatus | null,
        total_units: null as number | null,
        total_seasons: null as number | null,
        duration: null as number | null,
        synopsis: '',
        genres: [] as string[],
        release_year: null as number | null,
        rating: null as number | null,
        country: '',
        original_language: '',
        alternative_names: [] as string[],
    };
}

export default defineComponent({
    name: 'ManageMangasPage',
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
        IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
        IonInput, IonTextarea, IonFab, IonFabButton, IonModal, IonSearchbar,
    },
    data() {
        return {
            loading: false,
            saving: false,
            isModalOpen: false,
            contents: [] as Content[],
            meta: { ...EMPTY_META } as ContentMeta,
            filterType: null as ContentType | null,
            filterSearch: '',
            searchTimer: null as ReturnType<typeof setTimeout> | null,
            editingId: null as number | null,
            form: emptyForm(),
            newGenreInput: '',
            coverFile: null as File | null,
            coverPreview: '' as string,
            typeOptions: Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => ({
                value: value as ContentType,
                label,
                icon: TYPE_ICONS[value as ContentType],
            })),
            catalogStatusOptions: Object.entries(CATALOG_STATUS_LABELS).map(([value, label]) => ({
                value: value as ContentCatalogStatus,
                label,
                color: CATALOG_STATUS_COLORS[value as ContentCatalogStatus],
            })),
            CONTENT_TYPE_LABELS,
            CATALOG_STATUS_LABELS,
            UNIT_LABEL,
            bookOutline, pencilOutline, trashOutline, imageOutline, addOutline, closeOutline,
            chevronBackOutline, chevronForwardOutline,
        };
    },
    computed: {
        unitsSectionLabel(): string {
            const map: Partial<Record<ContentType, string>> = {
                tv: 'Episódios e Temporadas',
                anime: 'Episódios',
                manga: 'Capítulos',
                novel: 'Capítulos',
            };
            return map[this.form.type] ?? 'Unidades';
        },
    },
    watch: {
        'form.type'(newType: ContentType, oldType: ContentType) {
            if (newType === 'movie') {
                this.form.total_units = null;
                this.form.total_seasons = null;
            }
            if (newType !== 'tv' && oldType === 'tv') {
                this.form.total_seasons = null;
            }
            if (newType === 'manga' || newType === 'novel') {
                this.form.duration = null;
            }
        },
    },
    async ionViewWillEnter() {
        await this.loadContents();
    },
    methods: {
        async loadContents() {
            this.loading = true;
            try {
                const result = await contentService.getAll({
                    type: this.filterType ?? undefined,
                    search: this.filterSearch.trim() || undefined,
                    sort: 'name',
                    order: 'asc',
                    per_page: 50,
                    page: this.meta.current_page,
                });
                this.contents = result.items;
                this.meta = result.meta;
            } catch {
                // non-blocking
            } finally {
                this.loading = false;
            }
        },

        onSearch(ev: Event) {
            this.filterSearch = (ev as CustomEvent).detail.value ?? '';
            this.meta.current_page = 1;
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.loadContents(), 400);
        },

        setFilterType(type: ContentType | null) {
            this.filterType = type;
            this.meta.current_page = 1;
            this.loadContents();
        },

        async goToPage(page: number) {
            this.meta.current_page = page;
            await this.loadContents();
        },

        openModal(content: Content | null) {
            if (content) {
                this.editingId = content.id;
                this.form = {
                    name: content.name,
                    type: content.type,
                    cover: content.cover ?? '',
                    status: content.status ?? null,
                    total_units: content.total_units ?? null,
                    total_seasons: content.total_seasons ?? null,
                    duration: content.duration ?? null,
                    synopsis: content.synopsis ?? '',
                    genres: [...(content.genres ?? [])],
                    release_year: content.release_year ?? null,
                    rating: content.rating ?? null,
                    country: content.country ?? '',
                    original_language: content.original_language ?? '',
                    alternative_names: [...(content.alternative_names ?? [])],
                };
            } else {
                this.editingId = null;
                this.form = emptyForm();
            }
            this.newGenreInput = '';
            this.coverFile = null;
            if (this.coverPreview) URL.revokeObjectURL(this.coverPreview);
            this.coverPreview = '';
            this.isModalOpen = true;
        },

        closeModal() {
            this.isModalOpen = false;
            this.editingId = null;
            this.form = emptyForm();
            this.newGenreInput = '';
            this.coverFile = null;
            if (this.coverPreview) URL.revokeObjectURL(this.coverPreview);
            this.coverPreview = '';
        },

        addGenre() {
            const g = this.newGenreInput.trim();
            if (!g || this.form.genres.includes(g)) return;
            this.form.genres.push(g);
            this.newGenreInput = '';
        },

        removeGenre(index: number) {
            this.form.genres.splice(index, 1);
        },

        addAltName() {
            if (this.form.alternative_names.length >= 50) return;
            this.form.alternative_names.push('');
        },

        removeAltName(index: number) {
            this.form.alternative_names.splice(index, 1);
        },

        updateAltName(index: number, value: string) {
            this.form.alternative_names.splice(index, 1, value);
        },

        buildPayload(): Partial<Omit<Content, 'id'>> {
            return {
                name: this.form.name.trim(),
                type: this.form.type,
                status: this.form.status ?? undefined,
                total_units: this.form.total_units ?? undefined,
                total_seasons: this.form.total_seasons ?? undefined,
                duration: this.form.duration ?? undefined,
                synopsis: this.form.synopsis.trim() || undefined,
                genres: this.form.genres,
                release_year: this.form.release_year ?? undefined,
                rating: this.form.rating ?? undefined,
                country: this.form.country.trim() || undefined,
                original_language: this.form.original_language.trim() || undefined,
                alternative_names: this.form.alternative_names.filter(Boolean),
            };
        },

        async createContent() {
            if (!this.form.name.trim()) return;
            this.saving = true;
            try {
                await contentService.create(this.buildPayload() as Omit<Content, 'id'>, this.coverFile ?? undefined);
                this.meta.current_page = 1;
                await this.loadContents();
                this.closeModal();
                await this.showToast('Item adicionado ao acervo!', 'success');
            } catch {
                await this.showToast('Falha ao adicionar.', 'danger');
            } finally {
                this.saving = false;
            }
        },

        async updateContent() {
            if (!this.editingId || !this.form.name.trim()) return;
            this.saving = true;
            try {
                await contentService.update(this.editingId, this.buildPayload(), this.coverFile ?? undefined);
                await this.loadContents();
                this.closeModal();
                await this.showToast('Conteúdo atualizado!', 'success');
            } catch {
                await this.showToast('Falha ao atualizar.', 'danger');
            } finally {
                this.saving = false;
            }
        },

        async confirmDelete(content: Content) {
            const alert = await alertController.create({
                header: 'Excluir',
                message: `Excluir "${content.name}" do acervo?`,
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Excluir', role: 'destructive', handler: () => this.deleteContent(content.id) },
                ],
            });
            await alert.present();
        },

        async deleteContent(id: number) {
            try {
                await contentService.delete(id);
                await this.loadContents();
                await this.showToast('Item excluído.', 'success');
            } catch {
                await this.showToast('Falha ao excluir.', 'danger');
            }
        },

        triggerCoverPick() {
            (this.$refs.coverInput as HTMLInputElement).click();
        },

        onCoverSelected(e: Event) {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            this.coverFile = file;
            if (this.coverPreview) URL.revokeObjectURL(this.coverPreview);
            this.coverPreview = URL.createObjectURL(file);
        },

        getTypeIcon(type: ContentType): string { return TYPE_ICONS[type] ?? bookOutline; },
        getTypeColor(type: ContentType): string { return CONTENT_TYPE_COLORS[type] ?? ''; },
        getCatalogStatusColor(status: ContentCatalogStatus): string {
            return CATALOG_STATUS_COLORS[status] ?? '#5a6480';
        },

        typeActiveStyle(type: ContentType): Record<string, string> {
            const map: Record<ContentType, Record<string, string>> = {
                manga:  { background: 'rgba(245,166,35,0.15)',   color: '#f5a623', borderColor: 'rgba(245,166,35,0.5)' },
                anime:  { background: 'rgba(167,139,250,0.15)',  color: '#a78bfa', borderColor: 'rgba(167,139,250,0.5)' },
                novel:  { background: 'rgba(230,184,92,0.15)',   color: '#e6b85c', borderColor: 'rgba(230,184,92,0.5)' },
                movie:  { background: 'rgba(244,114,182,0.15)',  color: '#f472b6', borderColor: 'rgba(244,114,182,0.5)' },
                tv:     { background: 'rgba(125,167,255,0.15)',  color: '#7da7ff', borderColor: 'rgba(125,167,255,0.5)' },
            };
            return map[type] ?? {};
        },

        async showToast(message: string, color: string) {
            const toast = await toastController.create({ message, duration: 2000, color, position: 'top' });
            await toast.present();
        },
    },
});
</script>

<style scoped>
.ion-header .toolbar-background { border-bottom: 1px solid #222840; }

.btn-primary  { --background: #f5a623; --color: #050608; --border-radius: 12px; font-weight: 700; height: 48px; }
.btn-outline  { --border-radius: 12px; --color: #f5a623; --border-color: #f5a623; }

.neon-input {
    --background: rgba(255,255,255,0.025);
    --color: #e9edf2;
    --placeholder-color: rgba(233,237,242,0.28);
    --border-color: rgba(255,255,255,0.06);
    --border-radius: 12px;
    --highlight-color-focused: #f5a623;
    --padding-start: 16px;
    --padding-end: 16px;
    min-height: 52px;
    width: 100%;
}

.neon-search {
    --background: rgba(255,255,255,0.025);
    --color: #e9edf2;
    --placeholder-color: rgba(233,237,242,0.28);
    --icon-color: rgba(233,237,242,0.28);
    --clear-button-color: rgba(233,237,242,0.42);
    --border-radius: 10px;
    --box-shadow: 0 0 0 1px rgba(255,255,255,0.06);
    padding-inline: 0;
    padding-top: 0;
    padding-bottom: 0;
}

.icon-btn {
    --border-radius: 10px;
    --border-width: 1px;
    --background: rgba(255,255,255,0.025);
    --padding-start: 0;
    --padding-end: 0;
    width: 34px;
    height: 34px;
    margin: 0;
}
.edit-btn   { --color: #a78bfa; --border-color: rgba(255,255,255,0.06); }
.delete-btn { --color: #ef6b6b; --border-color: rgba(239,107,107,0.3); }

.modal-content { --background: #080a10; }

.section-label {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: rgba(233,237,242,0.42);
    margin-bottom: 10px;
}

.section-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 16px;
}

.field-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: rgba(233,237,242,0.42);
    margin-bottom: 8px;
}
</style>
