<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>
                    <span class="bg-gradient-to-br from-neon-blue to-neon-accent bg-clip-text text-transparent font-extrabold text-lg">
                        Neon Curator
                    </span>
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="px-5 pt-5 pb-24">

                <!-- Manga search -->
                <div class="mb-5">
                    <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Manga</span>

                    <!-- Selected manga -->
                    <div v-if="selectedManga" class="flex items-center gap-3 bg-neon-surface border border-neon-accent/40 rounded-xl p-3">
                        <div class="w-10 h-[54px] rounded-lg overflow-hidden flex-shrink-0">
                            <img v-if="selectedManga.cover" :src="selectedManga.cover" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-content-center text-neon-muted">
                                <ion-icon :icon="bookOutline" class="text-xl" />
                            </div>
                        </div>
                        <span class="flex-1 text-sm font-bold text-neon-text">{{ selectedManga.name }}</span>
                        <button class="w-8 h-8 rounded-lg bg-neon-elevated border border-neon-border flex items-center justify-center text-neon-muted cursor-pointer" @click="clearManga">
                            <ion-icon :icon="closeOutline" />
                        </button>
                    </div>

                    <!-- Search input + results -->
                    <div v-else class="relative">
                        <div class="flex items-center gap-2.5 bg-neon-elevated border border-neon-border rounded-xl px-4 py-[14px] transition-colors focus-within:border-neon-accent/30">
                            <ion-icon :icon="searchOutline" class="text-[18px] text-[#4a5568] flex-shrink-0" />
                            <input
                                v-model="mangaSearch"
                                placeholder="Buscar no catálogo..."
                                class="flex-1 bg-transparent border-none outline-none text-neon-text text-[15px] placeholder:text-[#4a5568]"
                            />
                        </div>
                        <div v-if="filteredMangas.length" class="mt-1 bg-neon-surface border border-neon-border rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                            <div
                                v-for="m in filteredMangas"
                                :key="m.id"
                                class="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-neon-elevated active:bg-neon-elevated border-b border-neon-border last:border-b-0"
                                @click="selectManga(m)"
                            >
                                <div class="w-8 h-11 rounded-md overflow-hidden flex-shrink-0">
                                    <img v-if="m.cover" :src="m.cover" class="w-full h-full object-cover" />
                                    <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted text-sm">
                                        <ion-icon :icon="bookOutline" />
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <span class="block text-sm font-semibold text-neon-text truncate">{{ m.name }}</span>
                                    <span v-if="m.total_chapters" class="text-xs text-neon-muted">{{ m.total_chapters }} cap.</span>
                                </div>
                            </div>
                        </div>
                        <p v-if="mangaSearch && !filteredMangas.length" class="text-xs text-neon-muted mt-2 text-center">
                            Manga não encontrado. <a class="text-neon-accent cursor-pointer" @click="$router.push('/manage-mangas')">Adicionar ao catálogo</a>
                        </p>
                    </div>
                </div>

                <!-- Site (required) -->
                <div class="mb-5">
                    <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Fonte de Leitura *</span>
                    <div class="flex items-center gap-3 bg-neon-elevated border border-neon-border rounded-xl px-4 transition-colors focus-within:border-neon-accent/30">
                        <ion-icon :icon="cloudDownloadOutline" class="text-[18px] text-[#4a5568] flex-shrink-0" />
                        <select v-model="form.site_id" class="flex-1 bg-transparent border-none outline-none text-neon-text text-[15px] py-[14px] cursor-pointer appearance-none">
                            <option value="">Selecionar fonte...</option>
                            <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.name }}</option>
                        </select>
                    </div>
                </div>

                <!-- Status -->
                <div class="mb-5">
                    <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Status</span>
                    <div class="grid grid-cols-2 gap-2.5">
                        <button
                            v-for="s in statuses"
                            :key="s.value"
                            class="py-3 rounded-xl bg-neon-surface border border-neon-border text-neon-muted text-[13px] font-semibold cursor-pointer transition-colors text-center"
                            :class="form.status === s.value ? 'bg-neon-accent/12 border-neon-accent/40 text-neon-accent' : ''"
                            @click="form.status = s.value"
                        >
                            {{ s.label }}
                        </button>
                    </div>
                </div>

                <!-- Current chapters -->
                <div class="mb-8">
                    <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Capítulo Atual</span>
                    <div class="bg-neon-elevated border border-neon-border rounded-xl transition-colors focus-within:border-neon-accent/30">
                        <input
                            v-model.number="form.current_chapters"
                            type="number"
                            placeholder="0"
                            min="0"
                            class="w-full bg-transparent border-none outline-none text-neon-text text-[15px] px-4 py-[14px] placeholder:text-[#4a5568] box-border"
                        />
                    </div>
                </div>

                <ion-button expand="block" :disabled="saving || !canSubmit" @click="addManga" class="btn-primary mb-3">
                    <ion-spinner v-if="saving" name="crescent" />
                    <template v-else>
                        Adicionar à Biblioteca
                        <ion-icon slot="end" :icon="addCircleOutline" />
                    </template>
                </ion-button>

                <ion-button expand="block" class="btn-cancel" @click="discard">Descartar</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonIcon, IonSpinner, toastController,
} from '@ionic/vue';
import { bookOutline, searchOutline, closeOutline, cloudDownloadOutline, addCircleOutline } from 'ionicons/icons';
import { mangaService, Manga } from '@/services/mangaService';
import { siteService, Site } from '@/services/siteService';
import { userMangaService, MangaStatus, STATUS_LABELS } from '@/services/userMangaService';

export default defineComponent({
    name: 'AddUserMangaPage',
    components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonSpinner },
    data() {
        return {
            saving: false,
            mangas: [] as Manga[],
            sites: [] as Site[],
            mangaSearch: '',
            form: {
                manga_id: null as number | null,
                site_id: '' as string | number,
                status: 'plan_to_read' as MangaStatus,
                current_chapters: 0,
            },
            statuses: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value: value as MangaStatus, label })),
            bookOutline, searchOutline, closeOutline, cloudDownloadOutline, addCircleOutline,
        };
    },
    computed: {
        filteredMangas(): Manga[] {
            if (!this.mangaSearch.trim()) return [];
            const q = this.mangaSearch.toLowerCase();
            return this.mangas.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 8);
        },
        selectedManga(): Manga | null {
            if (!this.form.manga_id) return null;
            return this.mangas.find((m) => m.id === this.form.manga_id) ?? null;
        },
        canSubmit(): boolean {
            return !!(this.form.manga_id && this.form.site_id);
        },
    },
    async ionViewWillEnter() {
        await this.loadData();
        this.resetForm();
        const mangaId = this.$route.query.manga_id;
        if (mangaId) this.form.manga_id = Number(mangaId);
    },
    methods: {
        async loadData() {
            try {
                const [mangas, sites] = await Promise.all([mangaService.getAll(), siteService.getAll()]);
                this.mangas = Array.isArray(mangas) ? mangas : (mangas as any)?.data ?? [];
                this.sites = Array.isArray(sites) ? sites : (sites as any)?.data ?? [];
            } catch {
                // non-blocking
            }
        },

        selectManga(manga: Manga) {
            this.form.manga_id = manga.id;
            this.mangaSearch = '';
        },

        clearManga() {
            this.form.manga_id = null;
            this.mangaSearch = '';
        },

        resetForm() {
            this.form = { manga_id: null, site_id: '', status: 'plan_to_read', current_chapters: 0 };
            this.mangaSearch = '';
        },

        async addManga() {
            if (!this.canSubmit) return;
            this.saving = true;
            try {
                await userMangaService.create({
                    manga_id: this.form.manga_id!,
                    site_id: Number(this.form.site_id),
                    status: this.form.status,
                    current_chapters: this.form.current_chapters,
                });
                const toast = await toastController.create({ message: 'Manga adicionado à biblioteca!', duration: 2000, color: 'success', position: 'top' });
                await toast.present();
                this.resetForm();
                this.$router.push('/tabs/library');
            } catch {
                const toast = await toastController.create({ message: 'Falha ao adicionar manga.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.saving = false;
            }
        },

        discard() {
            this.resetForm();
            this.$router.push('/tabs/library');
        },
    },
});
</script>

<style scoped>
.btn-primary { --background: var(--neon-accent); --color: #000; --border-radius: 14px; font-weight: 700; height: 52px; }
.btn-cancel { --background: #1a2035; --color: #e8eaf0; --border-radius: 14px; height: 52px; }
</style>
