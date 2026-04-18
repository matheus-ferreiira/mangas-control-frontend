<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title class="toolbar-title">
                    <span class="title-gradient">Descobrir</span>
                </ion-title>
                <ion-buttons slot="end">
                    <ion-button fill="clear" router-link="/manage-mangas">
                        <ion-icon slot="icon-only" :icon="settingsOutline" color="light" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="search-wrap">
                <div class="search-row">
                    <ion-icon :icon="searchOutline" class="search-icon" />
                    <input
                        v-model="query"
                        placeholder="Buscar mangás..."
                        class="search-input"
                        @input="filterMangas"
                    />
                    <button v-if="query" class="clear-btn" @click="clearSearch">
                        <ion-icon :icon="closeOutline" />
                    </button>
                </div>
            </div>

            <div class="content-pad">
                <div class="section-header">
                    <h2 class="section-title">Todos os Mangás</h2>
                    <span class="count-badge" v-if="filtered.length">{{ filtered.length }}</span>
                </div>

                <div v-if="loading" class="loading-state">
                    <ion-spinner name="crescent" color="primary" />
                </div>

                <div v-else-if="filtered.length === 0" class="empty-state">
                    <ion-icon :icon="compassOutline" class="empty-icon" />
                    <h3>Nenhum manga encontrado</h3>
                    <p>{{ query ? 'Tente uma busca diferente' : 'Adicione mangás pelo Catálogo' }}</p>
                    <ion-button router-link="/manage-mangas" class="manage-btn" fill="outline">
                        Gerenciar Catálogo
                    </ion-button>
                </div>

                <div v-else class="manga-grid">
                    <div
                        v-for="manga in filtered"
                        :key="manga.id"
                        class="manga-tile"
                        @click="addToLibrary(manga)"
                    >
                        <div class="tile-cover">
                            <img v-if="manga.cover_url" :src="manga.cover_url" :alt="manga.name" class="tile-img" />
                            <div v-else class="tile-placeholder">
                                <ion-icon :icon="bookOutline" />
                            </div>
                        </div>
                        <div class="tile-info">
                            <span class="tile-name">{{ manga.name }}</span>
                            <span class="tile-chapters" v-if="manga.total_chapters">
                                {{ manga.total_chapters }} cap.
                            </span>
                        </div>
                        <div class="tile-add">
                            <ion-icon :icon="addCircleOutline" />
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
    IonButtons, IonButton, IonIcon, IonSpinner,
} from '@ionic/vue';
import {
    searchOutline, closeOutline, compassOutline, bookOutline,
    addCircleOutline, settingsOutline,
} from 'ionicons/icons';
import { mangaService, Manga } from '@/services/mangaService';

export default defineComponent({
    name: 'DiscoverPage',
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
        IonButtons, IonButton, IonIcon, IonSpinner,
    },
    data() {
        return {
            loading: false,
            mangas: [] as Manga[],
            filtered: [] as Manga[],
            query: '',
            searchOutline, closeOutline, compassOutline, bookOutline,
            addCircleOutline, settingsOutline,
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
            this.filtered = q
                ? this.mangas.filter((m) => m.name.toLowerCase().includes(q))
                : [...this.mangas];
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
.toolbar-title { font-weight: 800; font-size: 18px; }
.title-gradient {
    background: linear-gradient(135deg, #5b6ee1, #00e5b0);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.search-wrap { padding: 12px 20px 0; }

.search-row {
    display: flex; align-items: center; gap: 10px;
    background: var(--neon-surface-elevated); border: 1px solid var(--neon-border);
    border-radius: 14px; padding: 10px 14px; transition: border-color 0.2s;
}
.search-row:focus-within { border-color: rgba(0, 229, 176, 0.3); }

.search-icon { color: #4a5568; font-size: 20px; flex-shrink: 0; }

.search-input {
    flex: 1; background: transparent; border: none; outline: none;
    color: #e8eaf0; font-size: 15px; min-width: 0;
}
.search-input::placeholder { color: #4a5568; }

.clear-btn {
    background: transparent; border: none; color: #4a5568;
    font-size: 18px; display: flex; align-items: center; cursor: pointer; padding: 0;
}

.content-pad { padding: 20px 20px 100px; }

.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.section-title { font-size: 20px; font-weight: 800; color: #e8eaf0; margin: 0; }
.count-badge {
    background: var(--neon-accent-dim); border: 1px solid rgba(0, 229, 176, 0.2);
    color: var(--neon-accent); border-radius: 20px; padding: 2px 10px;
    font-size: 12px; font-weight: 700;
}

.loading-state { display: flex; justify-content: center; padding: 60px 0; }

.empty-state { text-align: center; padding: 40px 0; }
.empty-icon { font-size: 48px; color: var(--neon-text-muted); display: block; margin-bottom: 14px; }
.empty-state h3 { font-size: 18px; font-weight: 700; color: #e8eaf0; margin: 0 0 8px; }
.empty-state p { font-size: 14px; color: var(--neon-text-muted); margin: 0 0 20px; }
.manage-btn { --border-radius: 12px; --color: var(--neon-accent); --border-color: var(--neon-accent); }

.manga-grid { display: flex; flex-direction: column; gap: 10px; }

.manga-tile {
    display: flex; align-items: center; gap: 14px;
    background: var(--neon-surface); border: 1px solid var(--neon-border);
    border-radius: 14px; padding: 12px; cursor: pointer;
    transition: border-color 0.2s; -webkit-tap-highlight-color: transparent;
}
.manga-tile:active { border-color: var(--neon-accent); }

.tile-cover { width: 48px; height: 66px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.tile-img { width: 100%; height: 100%; object-fit: cover; }
.tile-placeholder {
    width: 100%; height: 100%; background: var(--neon-surface-elevated);
    display: flex; align-items: center; justify-content: center;
    color: var(--neon-text-muted); font-size: 24px;
}

.tile-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.tile-name { font-size: 14px; font-weight: 700; color: #e8eaf0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tile-chapters { font-size: 12px; color: var(--neon-text-muted); }
.tile-add { color: var(--neon-accent); font-size: 24px; flex-shrink: 0; }
</style>
