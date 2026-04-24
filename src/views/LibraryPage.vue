<template>
    <ion-page>
        <ion-header :translucent="false">
            <ion-toolbar>
                <ion-title>
                    <span class="bg-gradient-to-br from-neon-blue to-neon-accent bg-clip-text text-transparent font-extrabold text-lg">
                        Neon Curator
                    </span>
                </ion-title>
                <ion-buttons slot="end">
                    <div
                        class="w-[34px] h-[34px] rounded-full overflow-hidden bg-neon-elevated border border-neon-border flex items-center justify-center cursor-pointer mr-1"
                        @click="$router.push('/tabs/profile')"
                    >
                        <img v-if="user?.avatar" :src="user.avatar" alt="Usuário" class="w-full h-full object-cover" />
                        <ion-icon v-else :icon="personCircleOutline" class="text-[22px] text-neon-muted" />
                    </div>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
                <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" pulling-text="" refreshing-text="" />
            </ion-refresher>

            <div class="px-5 pt-5 pb-24">
                <div class="flex items-center gap-2.5 mb-5">
                    <h2 class="text-[22px] font-extrabold text-neon-text m-0">Minha Biblioteca</h2>
                    <span v-if="userMangas.length" class="bg-neon-accent/12 border border-neon-accent/20 text-neon-accent rounded-full px-2.5 py-0.5 text-xs font-bold">
                        {{ userMangas.length }}
                    </span>
                </div>

                <div v-if="loading" class="flex justify-center py-16">
                    <ion-spinner name="crescent" color="primary" />
                </div>

                <div v-else-if="userMangas.length === 0" class="text-center py-16">
                    <div class="w-20 h-20 bg-neon-surface border border-neon-border rounded-[24px] flex items-center justify-center mx-auto mb-5">
                        <ion-icon :icon="bookOutline" class="text-[40px] text-neon-muted" />
                    </div>
                    <h3 class="text-xl font-bold text-neon-text m-0 mb-2">Nenhum manga ainda</h3>
                    <p class="text-sm text-neon-muted m-0 mb-6">Comece a construir sua coleção</p>
                    <ion-button router-link="/tabs/add" expand="block" class="btn-primary">
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
        return { loading: false, userMangas: [] as UserManga[], bookOutline, personCircleOutline };
    },
    computed: {
        user() { return authStore.user; },
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
                const toast = await toastController.create({ message: 'Falha ao carregar biblioteca.', duration: 2000, color: 'danger', position: 'top' });
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
.btn-primary { --background: var(--neon-accent); --color: #000; --border-radius: 14px; font-weight: 700; height: 52px; }
</style>
