<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>
                    <span class="bg-gradient-to-br from-neon-blue to-neon-accent bg-clip-text text-transparent font-extrabold text-lg">
                        Descobrir
                    </span>
                </ion-title>
                <ion-buttons slot="end">
                    <ion-button fill="clear" router-link="/manage-mangas">
                        <ion-icon slot="icon-only" :icon="settingsOutline" color="light" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="px-5 pt-3">
                <div class="flex items-center gap-2.5 bg-neon-elevated border border-neon-border rounded-[14px] px-3.5 py-2.5 transition-colors focus-within:border-neon-accent/30">
                    <ion-icon :icon="searchOutline" class="text-[20px] text-[#4a5568] flex-shrink-0" />
                    <input
                        v-model="query"
                        placeholder="Buscar mangás..."
                        class="flex-1 bg-transparent border-none outline-none text-neon-text text-[15px] min-w-0 placeholder:text-[#4a5568]"
                        @input="filterMangas"
                    />
                    <button v-if="query" class="bg-transparent border-none text-[#4a5568] text-lg flex items-center cursor-pointer p-0" @click="clearSearch">
                        <ion-icon :icon="closeOutline" />
                    </button>
                </div>
            </div>

            <div class="px-5 pt-5 pb-24">
                <div class="flex items-center gap-2.5 mb-4">
                    <h2 class="text-xl font-extrabold text-neon-text m-0">Todos os Mangás</h2>
                    <span v-if="filtered.length" class="bg-neon-accent/12 border border-neon-accent/20 text-neon-accent rounded-full px-2.5 py-0.5 text-xs font-bold">
                        {{ filtered.length }}
                    </span>
                </div>

                <div v-if="loading" class="flex justify-center py-16">
                    <ion-spinner name="crescent" color="primary" />
                </div>

                <div v-else-if="filtered.length === 0" class="text-center py-10">
                    <ion-icon :icon="compassOutline" class="text-[48px] text-neon-muted block mb-3.5" />
                    <h3 class="text-lg font-bold text-neon-text m-0 mb-2">Nenhum manga encontrado</h3>
                    <p class="text-sm text-neon-muted m-0 mb-5">{{ query ? 'Tente uma busca diferente' : 'Adicione mangás pelo Catálogo' }}</p>
                    <ion-button router-link="/manage-mangas" fill="outline" class="btn-outline">Gerenciar Catálogo</ion-button>
                </div>

                <div v-else class="flex flex-col gap-2.5">
                    <div
                        v-for="manga in filtered"
                        :key="manga.id"
                        class="flex items-center gap-3.5 bg-neon-surface border border-neon-border rounded-[14px] p-3 cursor-pointer transition-colors active:border-neon-accent"
                        @click="addToLibrary(manga)"
                    >
                        <div class="w-12 h-[66px] rounded-lg overflow-hidden flex-shrink-0">
                            <img v-if="manga.cover" :src="manga.cover" :alt="manga.name" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full bg-neon-elevated flex items-center justify-center text-neon-muted text-2xl">
                                <ion-icon :icon="bookOutline" />
                            </div>
                        </div>
                        <div class="flex-1 min-w-0 flex flex-col gap-1">
                            <span class="text-sm font-bold text-neon-text whitespace-nowrap overflow-hidden text-ellipsis">{{ manga.name }}</span>
                            <span v-if="manga.total_chapters" class="text-xs text-neon-muted">{{ manga.total_chapters }} cap.</span>
                        </div>
                        <ion-icon :icon="addCircleOutline" class="text-neon-accent text-2xl flex-shrink-0" />
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
    IonButtons, IonButton, IonIcon, IonSpinner,
} from '@ionic/vue';
import { searchOutline, closeOutline, compassOutline, bookOutline, addCircleOutline, settingsOutline } from 'ionicons/icons';
import { mangaService, Manga } from '@/services/mangaService';

export default defineComponent({
    name: 'DiscoverPage',
    components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSpinner },
    data() {
        return {
            loading: false,
            mangas: [] as Manga[],
            filtered: [] as Manga[],
            query: '',
            searchOutline, closeOutline, compassOutline, bookOutline, addCircleOutline, settingsOutline,
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
                this.filtered = [...this.mangas];
            } catch {
                // non-blocking
            } finally {
                this.loading = false;
            }
        },
        filterMangas() {
            const q = this.query.toLowerCase();
            this.filtered = q ? this.mangas.filter((m) => m.name.toLowerCase().includes(q)) : [...this.mangas];
        },
        clearSearch() {
            this.query = '';
            this.filtered = [...this.mangas];
        },
        addToLibrary(manga: Manga) {
            this.$router.push({ path: '/tabs/add', query: { manga_id: manga.id } });
        },
    },
});
</script>

<style scoped>
.btn-outline { --border-radius: 12px; --color: var(--neon-accent); --border-color: var(--neon-accent); }
</style>
