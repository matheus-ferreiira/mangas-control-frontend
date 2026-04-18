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
            <div class="content-pad">
                <!-- Add / Edit form -->
                <div class="form-card">
                    <h3 class="form-title">
                        {{ editingId ? 'Editar Manga' : 'Adicionar ao Catálogo' }}
                    </h3>

                    <div class="field-group">
                        <span class="neon-label">Nome</span>
                        <div class="input-row">
                            <input v-model="form.name" placeholder="Título da série..." class="field-input" />
                        </div>
                    </div>

                    <div class="field-group">
                        <span class="neon-label">URL da Capa</span>
                        <div class="input-row">
                            <input v-model="form.cover_url" placeholder="https://..." class="field-input" />
                        </div>
                    </div>

                    <div class="field-group">
                        <span class="neon-label">Total de Capítulos</span>
                        <div class="input-row">
                            <input
                                v-model.number="form.total_chapters"
                                type="number"
                                placeholder="Opcional"
                                class="field-input"
                                min="0"
                            />
                        </div>
                    </div>

                    <div class="btn-row">
                        <ion-button
                            class="save-btn"
                            :disabled="saving || !form.name.trim()"
                            @click="editingId ? updateManga() : createManga()"
                            expand="block"
                        >
                            <ion-spinner v-if="saving" name="crescent" />
                            <span v-else>{{ editingId ? 'Atualizar' : 'Adicionar Manga' }}</span>
                        </ion-button>
                        <ion-button v-if="editingId" class="cancel-btn" fill="solid" @click="cancelEdit" expand="block">
                            Cancelar
                        </ion-button>
                    </div>
                </div>

                <!-- List -->
                <div class="section-header">
                    <h2 class="section-title">Catálogo</h2>
                    <span class="count-badge" v-if="mangas.length">{{ mangas.length }}</span>
                </div>

                <div v-if="loading" class="loading-state">
                    <ion-spinner name="crescent" color="primary" />
                </div>

                <div v-else-if="mangas.length === 0" class="empty-state">
                    <ion-icon :icon="bookOutline" class="empty-icon" />
                    <p>Nenhum manga no catálogo ainda.</p>
                </div>

                <div v-else>
                    <div v-for="manga in mangas" :key="manga.id" class="manga-row">
                        <div class="manga-cover-wrap">
                            <img v-if="manga.cover_url" :src="manga.cover_url" class="manga-cover" />
                            <div v-else class="manga-cover-ph">
                                <ion-icon :icon="bookOutline" />
                            </div>
                        </div>
                        <div class="manga-info">
                            <span class="manga-name">{{ manga.name }}</span>
                            <span class="manga-ch" v-if="manga.total_chapters">{{ manga.total_chapters }} capítulos</span>
                        </div>
                        <div class="manga-actions">
                            <button class="action-btn edit-btn" @click="startEdit(manga)">
                                <ion-icon :icon="pencilOutline" />
                            </button>
                            <button class="action-btn del-btn" @click="confirmDelete(manga)">
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
import { bookOutline, pencilOutline, trashOutline } from 'ionicons/icons';
import { mangaService, Manga } from '@/services/mangaService';

export default defineComponent({
    name: 'ManageMangasPage',
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
        IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
    },
    data() {
        return {
            loading: false,
            saving: false,
            mangas: [] as Manga[],
            editingId: null as number | null,
            form: { name: '', cover_url: '', total_chapters: null as number | null },
            bookOutline, pencilOutline, trashOutline,
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
                const manga = await mangaService.create({
                    name: this.form.name.trim(),
                    cover_url: this.form.cover_url || undefined,
                    total_chapters: this.form.total_chapters || undefined,
                });
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
            this.form = {
                name: manga.name,
                cover_url: manga.cover_url || '',
                total_chapters: manga.total_chapters || null,
            };
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
                const updated = await mangaService.update(this.editingId, {
                    name: this.form.name.trim(),
                    cover_url: this.form.cover_url || undefined,
                    total_chapters: this.form.total_chapters || undefined,
                });
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
            this.form = { name: '', cover_url: '', total_chapters: null };
        },

        async showToast(message: string, color: string) {
            const toast = await toastController.create({ message, duration: 2000, color, position: 'top' });
            await toast.present();
        },
    },
});
</script>

<style scoped>
.content-pad { padding: 20px 20px 100px; }

.form-card {
    background: var(--neon-surface); border: 1px solid var(--neon-border);
    border-radius: 20px; padding: 20px; margin-bottom: 28px;
}

.form-title { font-size: 17px; font-weight: 700; color: #e8eaf0; margin: 0 0 16px; }

.field-group { margin-bottom: 14px; }

.neon-label {
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--neon-text-muted);
    margin-bottom: 8px; display: block;
}

.input-row {
    background: var(--neon-surface-elevated); border: 1px solid var(--neon-border);
    border-radius: 12px; transition: border-color 0.2s;
}
.input-row:focus-within { border-color: rgba(0, 229, 176, 0.3); }

.field-input {
    width: 100%; background: transparent; border: none; outline: none;
    color: #e8eaf0; font-size: 15px; padding: 13px 16px; box-sizing: border-box;
}
.field-input::placeholder { color: #4a5568; }

.btn-row { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }

.save-btn { --background: var(--neon-accent); --color: #000; --border-radius: 12px; font-weight: 700; height: 48px; }
.cancel-btn { --background: var(--neon-surface-elevated); --color: #e8eaf0; --border-radius: 12px; height: 44px; }

.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.section-title { font-size: 18px; font-weight: 800; color: #e8eaf0; margin: 0; }
.count-badge {
    background: var(--neon-accent-dim); border: 1px solid rgba(0, 229, 176, 0.2);
    color: var(--neon-accent); border-radius: 20px; padding: 2px 10px; font-size: 12px; font-weight: 700;
}

.loading-state { display: flex; justify-content: center; padding: 40px 0; }
.empty-state { text-align: center; padding: 30px 0; }
.empty-icon { font-size: 40px; color: var(--neon-text-muted); display: block; margin-bottom: 10px; }
.empty-state p { font-size: 14px; color: var(--neon-text-muted); margin: 0; }

.manga-row {
    display: flex; align-items: center; gap: 12px;
    background: var(--neon-surface); border: 1px solid var(--neon-border);
    border-radius: 14px; padding: 12px; margin-bottom: 10px;
}

.manga-cover-wrap { width: 48px; height: 66px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.manga-cover { width: 100%; height: 100%; object-fit: cover; }
.manga-cover-ph {
    width: 100%; height: 100%; background: var(--neon-surface-elevated);
    display: flex; align-items: center; justify-content: center;
    color: var(--neon-text-muted); font-size: 24px;
}

.manga-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.manga-name { font-size: 14px; font-weight: 700; color: #e8eaf0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.manga-ch { font-size: 12px; color: var(--neon-text-muted); }

.manga-actions { display: flex; gap: 8px; flex-shrink: 0; }

.action-btn {
    width: 34px; height: 34px; border-radius: 10px;
    background: var(--neon-surface-elevated); border: 1px solid var(--neon-border);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.edit-btn { color: #7b8ff5; }
.del-btn { color: var(--neon-danger); }
</style>
