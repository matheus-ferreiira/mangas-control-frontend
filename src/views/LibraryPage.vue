<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
                <IonRefresherContent pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" pulling-text="" refreshing-text="" />
            </IonRefresher>

            <div class="px-4 pt-4 pb-24">
                <!-- Header -->
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <div class="text-[11px] font-semibold uppercase tracking-[0.1em] text-neon-muted mb-0.5">Bem-vindo de volta</div>
                        <h2 class="text-[20px] font-extrabold text-neon-text m-0 leading-tight tracking-[-0.02em]">Minha Biblioteca</h2>
                    </div>
                    <div
                        class="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center cursor-pointer flex-shrink-0 mt-0.5"
                        style="background: linear-gradient(135deg, #00d4aa, #8b5cf6)"
                        @click="$router.push('/tabs/profile')"
                    >
                        <img v-if="user?.avatar" :src="user.avatar" alt="Usuário" class="w-full h-full object-cover" />
                        <span v-else class="text-base font-bold text-black leading-none">{{ userInitial }}</span>
                    </div>
                </div>

                <!-- Search -->
                <div class="relative mb-2.5">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neon-muted text-sm pointer-events-none">🔍</span>
                    <input
                        v-model="search"
                        placeholder="Buscar na biblioteca..."
                        class="w-full pl-8 pr-9 py-[9px] rounded-[10px] border border-neon-border bg-neon-surface text-neon-text text-[13px] outline-none placeholder:text-neon-muted"
                        @input="applyFilters"
                    />
                    <button
                        v-if="search"
                        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neon-muted text-lg leading-none bg-none border-none cursor-pointer p-0"
                        @click="search = ''; applyFilters()"
                    >×</button>
                </div>

                <!-- Type pills -->
                <div class="flex gap-1.5 overflow-x-auto pb-1.5 mb-2 no-scrollbar">
                    <button
                        v-for="opt in typeOptions"
                        :key="opt.value ?? 'all'"
                        class="flex-shrink-0 px-3.5 py-[5px] rounded-full text-[11px] font-bold transition-all border"
                        :class="activeType === opt.value
                            ? 'bg-neon-accent text-black border-neon-accent'
                            : 'bg-transparent border-neon-border text-neon-subtle'"
                        @click="activeType = opt.value; applyFilters()"
                    >
                        {{ opt.label }}
                    </button>
                </div>

                <!-- Status pills -->
                <div class="flex gap-[5px] overflow-x-auto pb-1.5 mb-3 no-scrollbar">
                    <button
                        v-for="opt in statusOptions"
                        :key="opt.value ?? 'all-status'"
                        class="flex-shrink-0 px-[11px] py-1 rounded-full text-[10px] font-bold transition-all border"
                        :class="activeStatus === opt.value
                            ? 'border-transparent text-white'
                            : 'bg-transparent border-neon-border text-neon-muted'"
                        :style="activeStatus === opt.value ? { background: statusColor(opt.value) } : {}"
                        @click="activeStatus = opt.value; applyFilters()"
                    >
                        {{ opt.label }}
                    </button>
                </div>

                <!-- Counter -->
                <div class="pb-1.5 mb-1">
                    <span class="text-[11px] font-semibold text-neon-muted">
                        {{ filtered.length }} {{ filtered.length === 1 ? 'item' : 'itens' }}
                        <template v-if="activeType || activeStatus || search"> · filtrado</template>
                    </span>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex justify-center py-16">
                    <IonSpinner name="crescent" color="primary" />
                </div>

                <!-- Empty library -->
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

                <!-- No filter results -->
                <div v-else-if="filtered.length === 0" class="text-center py-10">
                    <div class="text-[36px] mb-3">📭</div>
                    <div class="text-sm font-semibold text-neon-text mb-1">Nenhum item encontrado</div>
                    <div class="text-xs text-neon-muted">Tente outro filtro ou explore o acervo</div>
                </div>

                <!-- List -->
                <div v-else>
                    <ContentCard
                        v-for="item in filtered"
                        :key="item.id"
                        :item="item"
                        @click="$router.push(`/content/${item.id}`)"
                        @plusOne="incrementItem"
                    />
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent, IonIcon, IonSpinner, IonButton,
    IonRefresher, IonRefresherContent, toastController,
} from '@ionic/vue';
import { bookOutline } from 'ionicons/icons';
import { userContentService, UserContent, ContentStatus } from '@/services/userContentService';
import { ContentType, CONTENT_TYPE_LABELS } from '@/services/contentService';
import { authStore } from '@/store/auth';
import ContentCard from '@/components/ContentCard.vue';

type FilterType = ContentType | null;
type FilterStatus = ContentStatus | null;

const STATUS_LABEL_MAP: Record<string, string> = {
    reading: 'Lendo',
    completed: 'Completo',
    paused: 'Pausado',
    dropped: 'Abandonado',
    plan_to_read: 'Quero Ler',
};

const STATUS_COLOR_MAP: Record<string, string> = {
    reading: '#3b82f6',
    completed: '#10b981',
    paused: '#f59e0b',
    dropped: '#ef4444',
    plan_to_read: '#8b5cf6',
};

export default defineComponent({
    name: 'LibraryPage',
    components: {
        IonPage, IonContent, IonIcon, IonSpinner, IonButton,
        IonRefresher, IonRefresherContent, ContentCard,
    },
    data() {
        return {
            loading: false,
            userContents: [] as UserContent[],
            filtered: [] as UserContent[],
            search: '',
            activeType: null as FilterType,
            activeStatus: null as FilterStatus,
            typeOptions: [
                { label: 'Todos', value: null as FilterType },
                ...Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => ({ label, value: value as ContentType })),
            ],
            statusOptions: [
                { label: 'Todos status', value: null as FilterStatus },
                ...Object.entries(STATUS_LABEL_MAP).map(([value, label]) => ({ label, value: value as ContentStatus })),
            ],
            bookOutline,
        };
    },
    computed: {
        user() { return authStore.user; },
        userInitial(): string {
            const name = authStore.user?.name ?? '';
            return name.charAt(0).toUpperCase() || 'U';
        },
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
            if (this.search.trim()) {
                const q = this.search.toLowerCase();
                result = result.filter((i) => i.content?.name?.toLowerCase().includes(q));
            }
            this.filtered = result;
        },

        async incrementItem(itemId: number) {
            try {
                const updated = await userContentService.increment(itemId);
                const idx = this.userContents.findIndex((i) => i.id === itemId);
                if (idx !== -1) {
                    if (updated.content === undefined && this.userContents[idx].content) {
                        updated.content = this.userContents[idx].content;
                    }
                    this.userContents[idx] = updated;
                    this.applyFilters();
                }
            } catch {
                // silent fail — visual feedback already shown by card
            }
        },

        async handleRefresh(event: CustomEvent) {
            await this.loadContents();
            (event.target as HTMLIonRefresherElement).complete();
        },

        statusColor(value: FilterStatus): string {
            return value ? (STATUS_COLOR_MAP[value] ?? '#5a6480') : '#5a6480';
        },
    },
});
</script>

<style scoped>
.btn-primary { --background: var(--neon-accent); --color: #000; --border-radius: 14px; font-weight: 700; height: 52px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
