<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton default-href="/tabs/discover" text="" />
                </IonButtons>
                <IonTitle>Acervo</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true">
            <div class="px-5 pt-5 pb-28">

                <!-- Filter chips -->
                <div class="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                    <button
                        v-for="opt in [{ label: 'Todos', value: null }, ...typeOptions]"
                        :key="opt.value ?? 'all'"
                        class="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border"
                        :class="filterType === opt.value
                            ? 'bg-neon-accent text-black border-neon-accent'
                            : 'bg-neon-elevated border-neon-border text-neon-muted'"
                        @click="filterType = opt.value as any; applyFilter()"
                    >
                        {{ opt.label }}
                    </button>
                </div>

                <!-- List header -->
                <div class="flex items-center gap-2.5 mb-3.5">
                    <h2 class="text-lg font-extrabold text-neon-text m-0">Acervo</h2>
                    <span v-if="filteredContents.length" class="bg-neon-accent/12 border border-neon-accent/20 text-neon-accent rounded-full px-2.5 py-0.5 text-xs font-bold">{{ filteredContents.length }}</span>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex justify-center py-10">
                    <IonSpinner name="crescent" color="primary" />
                </div>

                <!-- Empty -->
                <div v-else-if="filteredContents.length === 0" class="text-center py-12">
                    <div class="w-16 h-16 bg-neon-surface border border-neon-border rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <IonIcon :icon="bookOutline" class="text-[32px] text-neon-muted" />
                    </div>
                    <p class="text-sm text-neon-muted m-0 mb-4">Nenhum item no acervo ainda.</p>
                    <IonButton fill="outline" class="btn-outline" @click="openModal(null)">
                        <IonIcon slot="start" :icon="addOutline" />
                        Adicionar primeiro
                    </IonButton>
                </div>

                <!-- List -->
                <div v-else>
                    <div
                        v-for="content in filteredContents"
                        :key="content.id"
                        class="flex items-center gap-3 bg-neon-surface border border-neon-border rounded-[14px] p-3 mb-2.5"
                    >
                        <div class="w-12 h-[66px] rounded-lg overflow-hidden flex-shrink-0">
                            <img v-if="content.cover" :src="content.cover" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted text-2xl">
                                <IonIcon :icon="getTypeIcon(content.type)" />
                            </div>
                        </div>
                        <div class="flex-1 min-w-0 flex flex-col gap-1">
                            <span class="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded inline-block self-start" :class="getTypeColor(content.type)">
                                {{ CONTENT_TYPE_LABELS[content.type] }}
                            </span>
                            <span class="text-sm font-bold text-neon-text truncate">{{ content.name }}</span>
                            <span v-if="content.total_units" class="text-xs text-neon-muted">{{ content.total_units }} {{ UNIT_LABEL[content.type].plural }}</span>
                        </div>
                        <div class="flex gap-2 flex-shrink-0">
                            <button class="w-[34px] h-[34px] rounded-[10px] bg-neon-elevated border border-neon-border flex items-center justify-center text-base text-[#7b8ff5] cursor-pointer" @click="openModal(content)">
                                <IonIcon :icon="pencilOutline" />
                            </button>
                            <button class="w-[34px] h-[34px] rounded-[10px] bg-neon-elevated border border-neon-border flex items-center justify-center text-base text-neon-danger cursor-pointer" @click="confirmDelete(content)">
                                <IonIcon :icon="trashOutline" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </IonContent>

        <!-- FAB para adicionar -->
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton color="primary" @click="openModal(null)">
                <IonIcon :icon="addOutline" />
            </IonFabButton>
        </IonFab>

        <!-- Modal de criação / edição -->
        <IonModal :is-open="isModalOpen" @didDismiss="closeModal" :initial-breakpoint="1" :breakpoints="[0, 1]">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{{ editingId ? 'Editar' : 'Novo Conteúdo' }}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton fill="clear" @click="closeModal">Cancelar</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent class="modal-content">
                <div class="px-5 pt-5 pb-10">

                    <!-- Name -->
                    <div class="mb-4">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Nome</span>
                        <IonInput
                            v-model="form.name"
                            placeholder="Título da série..."
                            fill="outline"
                            class="neon-input"
                        />
                    </div>

                    <!-- Type -->
                    <div class="mb-4">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Tipo</span>
                        <div class="grid grid-cols-3 gap-2">
                            <button
                                v-for="opt in typeOptions"
                                :key="opt.value"
                                class="py-3 rounded-xl border text-[13px] font-semibold cursor-pointer transition-all text-center"
                                :class="form.type === opt.value ? opt.activeClass : 'bg-neon-surface border-neon-border text-neon-muted'"
                                @click="form.type = opt.value"
                            >
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Cover -->
                    <div class="mb-4">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Capa</span>
                        <div
                            class="w-full rounded-xl overflow-hidden bg-neon-elevated border-2 border-dashed border-neon-border flex items-center justify-center cursor-pointer transition-colors active:border-neon-accent/40"
                            :class="(coverPreview || form.cover) ? 'h-[180px] border-neon-accent/20' : 'h-[140px]'"
                            @click="triggerCoverPick"
                        >
                            <img v-if="coverPreview || form.cover" :src="coverPreview || form.cover" class="w-full h-full object-cover" alt="Capa" />
                            <div v-else class="flex flex-col items-center gap-3 p-4 text-center">
                                <div class="w-12 h-12 rounded-2xl bg-neon-surface border border-neon-border flex items-center justify-center">
                                    <IonIcon :icon="imageOutline" class="text-[24px] text-neon-muted" />
                                </div>
                                <div>
                                    <p class="text-sm font-semibold text-neon-text m-0">Selecionar Capa</p>
                                    <p class="text-xs text-neon-muted m-0 mt-0.5">Toque para escolher uma imagem</p>
                                </div>
                            </div>
                        </div>
                        <input ref="coverInput" type="file" accept="image/*" class="hidden" @change="onCoverSelected" />
                        <p v-if="coverPreview || form.cover" class="text-[11px] text-neon-muted mt-1.5 text-center cursor-pointer" @click="triggerCoverPick">
                            Toque para alterar
                        </p>
                    </div>

                    <!-- Total units -->
                    <div class="mb-6">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">
                            Total de {{ unitLabel }} (opcional)
                        </span>
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

                    <IonButton expand="block" class="btn-primary" :disabled="saving || !form.name.trim()" @click="editingId ? updateContent() : createContent()">
                        <IonSpinner v-if="saving" name="crescent" />
                        <span v-else>{{ editingId ? 'Atualizar' : 'Adicionar ao Acervo' }}</span>
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
    IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner, IonInput,
    IonFab, IonFabButton, IonModal,
    toastController, alertController,
} from '@ionic/vue';
import { bookOutline, tvOutline, libraryOutline, pencilOutline, trashOutline, imageOutline, addOutline } from 'ionicons/icons';
import {
    contentService, Content, ContentType,
    CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS, UNIT_LABEL,
} from '@/services/contentService';

const TYPE_ICONS: Record<ContentType, string> = {
    manga: bookOutline,
    anime: tvOutline,
    novel: libraryOutline,
};

const TYPE_ACTIVE_CLASSES: Record<ContentType, string> = {
    manga: 'bg-neon-accent/15 border-neon-accent/50 text-neon-accent',
    anime: 'bg-[#7b8ff5]/15 border-[#7b8ff5]/50 text-[#7b8ff5]',
    novel: 'bg-[#ffa26b]/15 border-[#ffa26b]/50 text-[#ffa26b]',
};

export default defineComponent({
    name: 'ManageMangasPage',
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
        IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner, IonInput,
        IonFab, IonFabButton, IonModal,
    },
    data() {
        return {
            loading: false,
            saving: false,
            isModalOpen: false,
            contents: [] as Content[],
            filteredContents: [] as Content[],
            filterType: null as ContentType | null,
            editingId: null as number | null,
            form: {
                name: '',
                type: 'manga' as ContentType,
                cover: '',
                total_units: null as number | null,
            },
            coverFile: null as File | null,
            coverPreview: '' as string,
            typeOptions: Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => ({
                value: value as ContentType,
                label,
                activeClass: TYPE_ACTIVE_CLASSES[value as ContentType],
            })),
            CONTENT_TYPE_LABELS,
            UNIT_LABEL,
            bookOutline, pencilOutline, trashOutline, imageOutline, addOutline,
        };
    },
    computed: {
        unitLabel(): string {
            return UNIT_LABEL[this.form.type]?.plural ?? 'unidades';
        },
    },
    async ionViewWillEnter() {
        await this.loadContents();
    },
    methods: {
        async loadContents() {
            this.loading = true;
            try {
                this.contents = await contentService.getAll();
                this.applyFilter();
            } catch {
                // non-blocking
            } finally {
                this.loading = false;
            }
        },

        applyFilter() {
            this.filteredContents = this.filterType
                ? this.contents.filter((c) => c.type === this.filterType)
                : [...this.contents];
        },

        openModal(content: Content | null) {
            if (content) {
                this.editingId = content.id;
                this.form = { name: content.name, type: content.type, cover: content.cover || '', total_units: content.total_units || null };
                this.coverFile = null;
                if (this.coverPreview) URL.revokeObjectURL(this.coverPreview);
                this.coverPreview = '';
            } else {
                this.editingId = null;
                this.resetForm();
            }
            this.isModalOpen = true;
        },

        closeModal() {
            this.isModalOpen = false;
            this.editingId = null;
            this.resetForm();
        },

        async createContent() {
            if (!this.form.name.trim()) return;
            this.saving = true;
            try {
                const content = await contentService.create(
                    { name: this.form.name.trim(), type: this.form.type, total_units: this.form.total_units || undefined },
                    this.coverFile ?? undefined,
                );
                this.contents.unshift(content);
                this.applyFilter();
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
                const updated = await contentService.update(
                    this.editingId,
                    { name: this.form.name.trim(), type: this.form.type, total_units: this.form.total_units ?? undefined },
                    this.coverFile ?? undefined,
                );
                const idx = this.contents.findIndex((c) => c.id === this.editingId);
                if (idx !== -1) this.contents[idx] = updated;
                this.applyFilter();
                this.closeModal();
                await this.showToast('Atualizado!', 'success');
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
                this.contents = this.contents.filter((c) => c.id !== id);
                this.applyFilter();
                await this.showToast('Item excluído.', 'success');
            } catch {
                await this.showToast('Falha ao excluir.', 'danger');
            }
        },

        resetForm() {
            this.form = { name: '', type: 'manga', cover: '', total_units: null };
            this.coverFile = null;
            if (this.coverPreview) URL.revokeObjectURL(this.coverPreview);
            this.coverPreview = '';
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

        async showToast(message: string, color: string) {
            const toast = await toastController.create({ message, duration: 2000, color, position: 'top' });
            await toast.present();
        },
    },
});
</script>

<style scoped>
.btn-primary { --background: var(--neon-accent); --color: #000; --border-radius: 12px; font-weight: 700; height: 48px; }
.btn-outline { --border-radius: 12px; --color: var(--neon-accent); --border-color: var(--neon-accent); }

.neon-input {
    --background: #1a2035;
    --color: #e8eaf0;
    --placeholder-color: #4a5568;
    --border-color: #1e2538;
    --border-radius: 12px;
    --highlight-color-focused: #00e5b0;
    --padding-start: 16px;
    --padding-end: 16px;
    min-height: 52px;
    width: 100%;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.modal-content {
    --background: #0a0e1a;
}
</style>
