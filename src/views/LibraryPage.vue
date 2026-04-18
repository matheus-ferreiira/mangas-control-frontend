<template>
    <ion-page>
        <ion-header :translucent="false">
            <ion-toolbar>
                <ion-title class="toolbar-title">
                    <span class="title-gradient">Neon Curator</span>
                </ion-title>
                <ion-buttons slot="end">
                    <div
                        class="user-avatar-btn"
                        @click="$router.push('/tabs/profile')"
                    >
                        <img v-if="user?.avatar" :src="user.avatar" alt="Usuário" />
                        <ion-icon v-else :icon="personCircleOutline" />
                    </div>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
                <ion-refresher-content
                    pulling-icon="chevron-down-circle-outline"
                    refreshing-spinner="crescent"
                    pulling-text=""
                    refreshing-text=""
                />
            </ion-refresher>

            <div class="content-pad">
                <div class="section-header">
                    <h2 class="section-title">Minha Biblioteca</h2>
                    <span class="count-badge" v-if="userMangas.length">{{ userMangas.length }}</span>
                </div>

                <div v-if="loading" class="loading-state">
                    <ion-spinner name="crescent" color="primary" />
                </div>

                <div v-else-if="userMangas.length === 0" class="empty-state">
                    <div class="empty-icon-wrap">
                        <ion-icon :icon="bookOutline" />
                    </div>
                    <h3>Nenhum manga ainda</h3>
                    <p>Comece a construir sua coleção</p>
                    <ion-button router-link="/tabs/add" class="neon-btn-primary" expand="block">
                        Adicionar Primeiro Manga
                    </ion-button>
                </div>

                <div v-else>
                    <manga-card
                        v-for="item in userMangas"
                        :key="item.id"
                        :user-manga="item"
                        @click="$router.push(`/manga/${item.id}`)"
                    />
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonIcon, IonSpinner, IonButton,
    IonRefresher, IonRefresherContent, toastController,
} from '@ionic/vue';
import { bookOutline, personCircleOutline } from 'ionicons/icons';
import { userMangaService, UserManga } from '@/services/userMangaService';
import { authStore } from '@/store/auth';
import MangaCard from '@/components/MangaCard.vue';

export default defineComponent({
    name: 'LibraryPage',
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
        IonButtons, IonIcon, IonSpinner, IonButton,
        IonRefresher, IonRefresherContent, MangaCard,
    },
    data() {
        return {
            loading: false,
            userMangas: [] as UserManga[],
            bookOutline,
            personCircleOutline,
        };
    },
    computed: {
        user() {
            return authStore.user;
        },
    },
    async ionViewWillEnter() {
        await this.loadMangas();
    },
    methods: {
        async loadMangas() {
            this.loading = true;
            try {
                this.userMangas = await userMangaService.getAll();
            } catch {
                const toast = await toastController.create({
                    message: 'Falha ao carregar biblioteca.',
                    duration: 2000, color: 'danger', position: 'top',
                });
                await toast.present();
            } finally {
                this.loading = false;
            }
        },

        async handleRefresh(event: CustomEvent) {
            await this.loadMangas();
            (event.target as HTMLIonRefresherElement).complete();
        },
    },
});
</script>

<style scoped>
.toolbar-title { font-weight: 800; font-size: 18px; }

.title-gradient {
    background: linear-gradient(135deg, #5b6ee1, #00e5b0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.user-avatar-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--neon-surface-elevated);
    border: 1.5px solid var(--neon-border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-right: 4px;
}

.user-avatar-btn img { width: 100%; height: 100%; object-fit: cover; }
.user-avatar-btn ion-icon { font-size: 22px; color: var(--neon-text-muted); }

.content-pad { padding: 20px 20px 100px; }

.section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.section-title { font-size: 22px; font-weight: 800; color: #e8eaf0; margin: 0; }

.count-badge {
    background: var(--neon-accent-dim);
    border: 1px solid rgba(0, 229, 176, 0.2);
    color: var(--neon-accent);
    border-radius: 20px;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 700;
}

.loading-state { display: flex; justify-content: center; padding: 60px 0; }

.empty-state { text-align: center; padding: 60px 0; }

.empty-icon-wrap {
    width: 80px;
    height: 80px;
    background: var(--neon-surface);
    border: 1px solid var(--neon-border);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
}

.empty-icon-wrap ion-icon { font-size: 40px; color: var(--neon-text-muted); }

.empty-state h3 { font-size: 20px; font-weight: 700; color: #e8eaf0; margin: 0 0 8px; }
.empty-state p { font-size: 14px; color: var(--neon-text-muted); margin: 0 0 24px; }

.neon-btn-primary {
    --background: var(--neon-accent);
    --color: #000;
    --border-radius: 14px;
    font-weight: 700;
    height: 52px;
}
</style>
