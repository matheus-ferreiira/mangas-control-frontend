<template>
    <IonPage>
        <IonHeader :translucent="false">
            <IonToolbar>
                <IonTitle>
                    <span class="bg-gradient-to-br from-neon-blue to-neon-accent bg-clip-text text-transparent font-extrabold text-lg">
                        Neon Curator
                    </span>
                </IonTitle>
                <IonButtons slot="end">
                    <div
                        class="w-[34px] h-[34px] rounded-full overflow-hidden bg-neon-elevated border border-neon-border flex items-center justify-center cursor-pointer mr-1"
                        @click="$router.push('/tabs/profile')"
                    >
                        <img v-if="user?.avatar" :src="user.avatar" alt="Usuário" class="w-full h-full object-cover" />
                        <IonIcon v-else :icon="personCircleOutline" class="text-[22px] text-neon-muted" />
                    </div>
                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true">
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
                <IonRefresherContent pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" pulling-text="" refreshing-text="" />
            </IonRefresher>

            <div class="px-5 pt-5 pb-24">
                <!-- Header -->
                <div class="flex items-center gap-2.5 mb-4">
                    <h2 class="text-[22px] font-extrabold text-neon-text m-0">Minha Biblioteca</h2>
                    <span v-if="filtered.length" class="bg-neon-accent/12 border border-neon-accent/20 text-neon-accent rounded-full px-2.5 py-0.5 text-xs font-bold">
                        {{ filtered.length }}
                    </span>
                </div>

                <!-- Type filter -->
                <div class="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
                    <button
                        v-for="opt in typeOptions"
                        :key="opt.value ?? 'all'"
                        class="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border"
                        :class="activeType === opt.value
                            ? 'bg-neon-accent text-black border-neon-accent'
                            : 'bg-neon-elevated border-neon-border text-neon-muted'"
                        @click="activeType = opt.value; applyFilters()"
                    >
                        {{ opt.label }}
                    </button>
                </div>

                <!-- Status filter -->
                <div class="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
                    <button
                        v-for="opt in statusOptions"
                        :key="opt.value ?? 'all'"
                        class="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border"
                        :class="activeStatus === opt.value
                            ? 'bg-neon-surface-elevated border-neon-accent/60 text-neon-accent'
                            : 'bg-neon-elevated border-neon-border text-neon-muted'"
                        @click="activeStatus = opt.value; applyFilters()"
                    >
                        {{ opt.label }}
                    </button>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex justify-center py-16">
                    <IonSpinner name="crescent" color="primary" />
                </div>

                <!-- Empty -->
                <div v-else-if="filtered.length === 0 && userContents.length === 0" class="text-center py-16">
                    <div class="w-20 h-20 bg-neon-surface border border-neon-border rounded-[24px] flex items-center justify-center mx-auto mb-5">
                        <IonIcon :icon="bookOutline" class="text-[40px] text-neon-muted" />
                    </div>
                    <h3 class="text-xl font-bold text-neon-text m-0 mb-2">Nenhum conteúdo ainda</h3>
                    <p class="text-sm text-neon-muted m-0 mb-6">Comece a construir sua coleção</p>
                    <IonButton router-link="/tabs/add" expand="block" class="btn-primary">
                        Adicionar Primeiro Item
                    </IonButton>
                </div>

                <!-- No results from filter -->
                <div v-else-if="filtered.length === 0" class="text-center py-10">
                    <IonIcon :icon="filterOutline" class="text-[40px] text-neon-muted block mb-3" />
                    <p class="text-sm text-neon-muted m-0">Nenhum resultado para os filtros selecionados.</p>
                </div>

                <!-- List -->
                <div v-else>
                    <ContentCard
                        v-for="item in filtered"
                        :key="item.id"
                        :item="item"
                        @click="$router.push(`/content/${item.id}`)"
                    />
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonIcon, IonSpinner, IonButton,
    IonRefresher, IonRefresherContent, toastController,
} from '@ionic/vue';
import { bookOutline, personCircleOutline, filterOutline } from 'ionicons/icons';
import { userContentService, UserContent, ContentStatus, STATUS_LABELS } from '@/services/userContentService';
import { ContentType, CONTENT_TYPE_LABELS } from '@/services/contentService';
import { authStore } from '@/store/auth';
import ContentCard from '@/components/ContentCard.vue';

type FilterType = ContentType | null;
type FilterStatus = ContentStatus | null;

export default defineComponent({
    name: 'LibraryPage',
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
        IonButtons, IonIcon, IonSpinner, IonButton,
        IonRefresher, IonRefresherContent, ContentCard,
    },
    data() {
        return {
            loading: false,
            userContents: [] as UserContent[],
            filtered: [] as UserContent[],
            activeType: null as FilterType,
            activeStatus: null as FilterStatus,
            typeOptions: [
                { label: 'Todos', value: null as FilterType },
                ...Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => ({ label, value: value as ContentType })),
            ],
            statusOptions: [
                { label: 'Todos', value: null as FilterStatus },
                ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value: value as ContentStatus })),
            ],
            bookOutline, personCircleOutline, filterOutline,
        };
    },
    computed: {
        user() { return authStore.user; },
    },
    async ionViewWillEnter() {
        await this.loadContents();
    },
    methods: {
        async loadContents() {
            this.loading = true;
            try {
                this.userContents = await userContentService.getAll();
                this.applyFilters();
            } catch {
                const toast = await toastController.create({ message: 'Falha ao carregar biblioteca.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.loading = false;
            }
        },

        applyFilters() {
            let result = [...this.userContents];
            if (this.activeType) {
                result = result.filter((i) => i.content?.type === this.activeType);
            }
            if (this.activeStatus) {
                result = result.filter((i) => i.status === this.activeStatus);
            }
            this.filtered = result;
        },

        async handleRefresh(event: CustomEvent) {
            await this.loadContents();
            (event.target as HTMLIonRefresherElement).complete();
        },
    },
});
</script>

<style scoped>
.btn-primary { --background: var(--neon-accent); --color: #000; --border-radius: 14px; font-weight: 700; height: 52px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
