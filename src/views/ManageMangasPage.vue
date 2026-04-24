<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/tabs/discover" text="" />
                </ion-buttons>
                <ion-title>Catálogo de Mangás</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="px-5 pt-5 pb-24">
                <!-- Form -->
                <div class="bg-neon-surface border border-neon-border rounded-2xl p-5 mb-7">
                    <h3 class="text-[17px] font-bold text-neon-text m-0 mb-4">
                        {{ editingId ? 'Editar Manga' : 'Adicionar ao Catálogo' }}
                    </h3>

                    <div class="mb-4">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Nome</span>
                        <div class="bg-neon-elevated border border-neon-border rounded-xl transition-colors focus-within:border-neon-accent/30">
                            <input v-model="form.name" placeholder="Título da série..." class="w-full bg-transparent border-none outline-none text-neon-text text-[15px] px-4 py-[14px] placeholder:text-[#4a5568] box-border" />
                        </div>
                    </div>

                    <div class="mb-4">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Capa</span>
                        <div
                            class="w-full h-[150px] rounded-xl overflow-hidden bg-neon-elevated border border-dashed border-neon-border flex items-center justify-center cursor-pointer transition-colors active:border-neon-accent/40"
                            @click="triggerCoverPick"
                        >
                            <img v-if="coverPreview || form.cover" :src="coverPreview || form.cover" class="w-full h-full object-cover" alt="Capa" />
                            <div v-else class="flex flex-col items-center gap-2 text-neon-muted text-[13px]">
                                <ion-icon :icon="imageOutline" class="text-[36px]" />
                                <span>Selecionar da galeria</span>
                            </div>
                        </div>
                        <input ref="coverInput" type="file" accept="image/*" class="hidden" @change="onCoverSelected" />
                    </div>

                    <div class="mb-4">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Total de Capítulos</span>
                        <div class="bg-neon-elevated border border-neon-border rounded-xl transition-colors focus-within:border-neon-accent/30">
                            <input v-model.number="form.total_chapters" type="number" placeholder="Opcional" min="0" class="w-full bg-transparent border-none outline-none text-neon-text text-[15px] px-4 py-[14px] placeholder:text-[#4a5568] box-border" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-2.5 mt-1">
                        <ion-button expand="block" class="btn-primary" :disabled="saving || !form.name.trim()" @click="editingId ? updateManga() : createManga()">
                            <ion-spinner v-if="saving" name="crescent" />
                            <span v-else>{{ editingId ? 'Atualizar' : 'Adicionar Manga' }}</span>
                        </ion-button>
                        <ion-button v-if="editingId" expand="block" class="btn-cancel" @click="cancelEdit">Cancelar</ion-button>
                    </div>
                </div>

                <!-- List -->
                <div class="flex items-center gap-2.5 mb-3.5">
                    <h2 class="text-lg font-extrabold text-neon-text m-0">Catálogo</h2>
                    <span v-if="mangas.length" class="bg-neon-accent/12 border border-neon-accent/20 text-neon-accent rounded-full px-2.5 py-0.5 text-xs font-bold">{{ mangas.length }}</span>
                </div>

                <div v-if="loading" class="flex justify-center py-10">
                    <ion-spinner name="crescent" color="primary" />
                </div>

                <div v-else-if="mangas.length === 0" class="text-center py-8">
                    <ion-icon :icon="bookOutline" class="text-[40px] text-neon-muted block mb-2.5" />
                    <p class="text-sm text-neon-muted m-0">Nenhum manga no catálogo ainda.</p>
                </div>

                <div v-else>
                    <div v-for="manga in mangas" :key="manga.id" class="flex items-center gap-3 bg-neon-surface border border-neon-border rounded-[14px] p-3 mb-2.5">
                        <div class="w-12 h-[66px] rounded-lg overflow-hidden flex-shrink-0">
                            <img v-if="manga.cover" :src="manga.cover" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted text-2xl">
                                <ion-icon :icon="bookOutline" />
                            </div>
                        </div>
                        <div class="flex-1 min-w-0 flex flex-col gap-1">
                            <span class="text-sm font-bold text-neon-text truncate">{{ manga.name }}</span>
                            <span v-if="manga.total_chapters" class="text-xs text-neon-muted">{{ manga.total_chapters }} capítulos</span>
                        </div>
                        <div class="flex gap-2 flex-shrink-0">
                            <button class="w-[34px] h-[34px] rounded-[10px] bg-neon-elevated border border-neon-border flex items-center justify-center text-base text-[#7b8ff5] cursor-pointer" @click="startEdit(manga)">
                                <ion-icon :icon="pencilOutline" />
                            </button>
                            <button class="w-[34px] h-[34px] rounded-[10px] bg-neon-elevated border border-neon-border flex items-center justify-center text-base text-neon-danger cursor-pointer" @click="confirmDelete(manga)">
                                <ion-icon :icon="trashOutline" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
    toastController, alertController,
} from '@ionic/vue';
import { bookOutline, pencilOutline, trashOutline, imageOutline } from 'ionicons/icons';
import { mangaService, Manga } from '@/services/mangaService';

export default defineComponent({
    name: 'ManageMangasPage',
    components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner },
    data() {
        return {
            loading: false,
            saving: false,
            mangas: [] as Manga[],
            editingId: null as number | null,
            form: { name: '', cover: '', total_chapters: null as number | null },
            coverFile: null as File | null,
            coverPreview: '' as string,
            bookOutline, pencilOutline, trashOutline, imageOutline,
        };
    },
    async ionViewWillEnter() {
        await this.loadMangas();
    },
    methods: {
        async loadMangas() {
            this.loading = true;
            try {
                const result = await mangaService.getAll();
                this.mangas = Array.isArray(result) ? result : (result as any)?.data ?? [];
            } catch {
                // non-blocking
            } finally {
                this.loading = false;
            }
        },

        async createManga() {
            if (!this.form.name.trim()) return;
            this.saving = true;
            try {
                let cover: string | undefined = this.form.cover || undefined;
                if (this.coverFile) cover = await mangaService.uploadCover(this.coverFile);
                const manga = await mangaService.create({ name: this.form.name.trim(), cover, total_chapters: this.form.total_chapters || undefined });
                this.mangas.unshift(manga);
                this.resetForm();
                await this.showToast('Manga adicionado ao catálogo!', 'success');
            } catch {
                await this.showToast('Falha ao adicionar manga.', 'danger');
            } finally {
                this.saving = false;
            }
        },

        startEdit(manga: Manga) {
            this.editingId = manga.id;
            this.form = { name: manga.name, cover: manga.cover || '', total_chapters: manga.total_chapters || null };
            this.coverFile = null;
            if (this.coverPreview) URL.revokeObjectURL(this.coverPreview);
            this.coverPreview = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        cancelEdit() {
            this.editingId = null;
            this.resetForm();
        },

        async updateManga() {
            if (!this.editingId || !this.form.name.trim()) return;
            this.saving = true;
            try {
                let cover: string | undefined = this.form.cover || undefined;
                if (this.coverFile) cover = await mangaService.uploadCover(this.coverFile);
                const updated = await mangaService.update(this.editingId, { name: this.form.name.trim(), cover, total_chapters: this.form.total_chapters || undefined });
                const idx = this.mangas.findIndex((m) => m.id === this.editingId);
                if (idx !== -1) this.mangas[idx] = updated;
                this.cancelEdit();
                await this.showToast('Manga atualizado!', 'success');
            } catch {
                await this.showToast('Falha ao atualizar manga.', 'danger');
            } finally {
                this.saving = false;
            }
        },

        async confirmDelete(manga: Manga) {
            const alert = await alertController.create({
                header: 'Excluir Manga',
                message: `Excluir "${manga.name}" do catálogo?`,
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Excluir', role: 'destructive', handler: () => this.deleteManga(manga.id) },
                ],
            });
            await alert.present();
        },

        async deleteManga(id: number) {
            try {
                await mangaService.delete(id);
                this.mangas = this.mangas.filter((m) => m.id !== id);
                await this.showToast('Manga excluído.', 'success');
            } catch {
                await this.showToast('Falha ao excluir manga.', 'danger');
            }
        },

        resetForm() {
            this.form = { name: '', cover: '', total_chapters: null };
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

        async showToast(message: string, color: string) {
            const toast = await toastController.create({ message, duration: 2000, color, position: 'top' });
            await toast.present();
        },
    },
});
</script>

<style scoped>
.btn-primary { --background: var(--neon-accent); --color: #000; --border-radius: 12px; font-weight: 700; height: 48px; }
.btn-cancel { --background: var(--neon-surface-elevated); --color: #e8eaf0; --border-radius: 12px; height: 44px; }
</style>
