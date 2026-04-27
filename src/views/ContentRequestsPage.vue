<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="px-4 pb-24 page-top">
                <!-- Header -->
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <button class="flex items-center gap-1.5 text-neon-muted mb-1" @click="$router.back()">
                            <IonIcon :icon="chevronBackOutline" class="text-sm" />
                            <span class="text-[11px] font-semibold">Voltar</span>
                        </button>
                        <h2 class="text-[20px] font-extrabold text-neon-text m-0 tracking-[-0.02em]">Solicitações</h2>
                    </div>
                </div>

                <!-- Segment tabs -->
                <div class="flex bg-neon-surface border border-neon-border rounded-xl p-1 gap-0.5 mb-4">
                    <div
                        v-for="tab in availableTabs"
                        :key="tab.value"
                        class="flex-1 flex items-center justify-center h-9 rounded-[9px] text-[12px] font-bold transition-colors cursor-pointer select-none"
                        :class="activeTab === tab.value ? 'bg-neon-accent text-black' : 'text-neon-muted'"
                        @click="activeTab = tab.value"
                    >{{ tab.label }}</div>
                </div>

                <!-- ===== TAB: SOLICITAR ===== -->
                <template v-if="activeTab === 'new'">
                    <div class="text-[12px] text-neon-muted mb-4">
                        Solicite a adição de um novo conteúdo ao acervo. Nossa equipe irá revisar e aprovar.
                    </div>

                    <!-- Nome -->
                    <div class="mb-4">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Nome *</span>
                        <IonInput v-model="newForm.name" placeholder="Título da série..." fill="outline" class="neon-input" />
                    </div>

                    <!-- Nomes alternativos -->
                    <div class="mb-4">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-1">Nomes Alternativos</span>
                        <span class="block text-[10px] text-neon-muted mb-2">Separe por vírgula</span>
                        <IonInput v-model="newForm.alternativeNamesInput" placeholder="Nome 1, Nome 2, ..." fill="outline" class="neon-input" />
                    </div>

                    <!-- Tipo -->
                    <div class="mb-4">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">Tipo *</span>
                        <div class="grid grid-cols-3 gap-2">
                            <IonButton
                                v-for="opt in typeOptions"
                                :key="opt.value"
                                expand="block"
                                fill="outline"
                                class="type-btn"
                                :style="newForm.type === opt.value
                                    ? typeActiveStyle(opt.value)
                                    : { '--background': '#141825', '--color': '#5a6480', '--border-color': '#222840' }"
                                @click="newForm.type = opt.value"
                            >{{ opt.label }}</IonButton>
                        </div>
                    </div>

                    <!-- URL da capa -->
                    <div class="mb-6">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-2">URL da Capa (opcional)</span>
                        <IonInput v-model="newForm.cover" placeholder="https://..." fill="outline" class="neon-input" />
                    </div>

                    <IonButton
                        expand="block"
                        class="btn-primary"
                        :disabled="submitting || !newForm.name.trim()"
                        @click="submitRequest"
                    >
                        <IonSpinner v-if="submitting" name="crescent" />
                        <span v-else>Enviar Solicitação</span>
                    </IonButton>

                    <!-- Success message -->
                    <div v-if="submitSuccess" class="mt-4 p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl text-center">
                        <div class="text-[#10b981] font-bold mb-1">✓ Solicitação enviada!</div>
                        <div class="text-[12px] text-neon-muted">Você será notificado quando for revisada.</div>
                    </div>
                </template>

                <!-- ===== TAB: MINHAS ===== -->
                <template v-else-if="activeTab === 'my'">
                    <div v-if="loadingMy" class="flex justify-center py-10">
                        <IonSpinner name="crescent" color="primary" />
                    </div>
                    <div v-else-if="myRequests.length === 0" class="text-center py-12">
                        <IonIcon :icon="documentTextOutline" class="text-[40px] text-neon-muted block mx-auto mb-3" />
                        <p class="text-sm text-neon-muted m-0">Nenhuma solicitação enviada ainda.</p>
                    </div>
                    <div v-else class="flex flex-col gap-2">
                        <div
                            v-for="req in myRequests"
                            :key="req.id"
                            class="bg-neon-card border border-neon-border rounded-xl p-3.5"
                        >
                            <div class="flex items-start gap-3">
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-1.5 mb-1">
                                        <span class="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" :class="typeColorClass(req.type)">
                                            {{ typeLabel(req.type) }}
                                        </span>
                                        <span
                                            class="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                            :style="{ background: requestStatusColor(req.status) + '22', color: requestStatusColor(req.status) }"
                                        >{{ requestStatusLabel(req.status) }}</span>
                                    </div>
                                    <div class="text-sm font-bold text-neon-text">{{ req.name }}</div>
                                    <div v-if="req.alternative_names?.length" class="text-[10px] text-neon-muted mt-0.5">
                                        {{ req.alternative_names.join(' · ') }}
                                    </div>
                                    <div v-if="req.created_at" class="text-[10px] text-neon-muted mt-1">
                                        {{ formatDate(req.created_at) }}
                                    </div>
                                    <div
                                        v-if="req.rejection_reason"
                                        class="mt-2 p-2 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-[11px] text-[#ef4444]"
                                    >
                                        <span class="font-bold">Motivo: </span>{{ req.rejection_reason }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- ===== TAB: ADMIN ===== -->
                <template v-else-if="activeTab === 'admin'">
                    <div v-if="loadingAdmin" class="flex justify-center py-10">
                        <IonSpinner name="crescent" color="primary" />
                    </div>
                    <div v-else-if="allRequests.length === 0" class="text-center py-12">
                        <IonIcon :icon="documentTextOutline" class="text-[40px] text-neon-muted block mx-auto mb-3" />
                        <p class="text-sm text-neon-muted m-0">Nenhuma solicitação pendente.</p>
                    </div>
                    <div v-else class="flex flex-col gap-2">
                        <div
                            v-for="req in allRequests"
                            :key="req.id"
                            class="bg-neon-card border border-neon-border rounded-xl p-3.5"
                        >
                            <div class="flex items-center gap-1.5 mb-1">
                                <span class="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" :class="typeColorClass(req.type)">
                                    {{ typeLabel(req.type) }}
                                </span>
                                <span
                                    class="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                    :style="{ background: requestStatusColor(req.status) + '22', color: requestStatusColor(req.status) }"
                                >{{ requestStatusLabel(req.status) }}</span>
                            </div>
                            <div class="text-sm font-bold text-neon-text mb-0.5">{{ req.name }}</div>
                            <div v-if="req.alternative_names?.length" class="text-[10px] text-neon-muted mb-1">
                                {{ req.alternative_names.join(' · ') }}
                            </div>
                            <div v-if="req.user" class="text-[10px] text-neon-muted mb-2">
                                Por: <span class="text-neon-subtle">{{ req.user.name }}</span>
                                <template v-if="req.created_at"> · {{ formatDate(req.created_at) }}</template>
                            </div>

                            <!-- Admin actions (only for pending) -->
                            <div v-if="req.status === 'pending'" class="flex gap-2 mt-2">
                                <IonButton expand="block" class="approve-btn" @click="approveRequest(req.id)">
                                    <IonSpinner v-if="actioningId === req.id + '-approve'" name="crescent" />
                                    <span v-else>Aprovar</span>
                                </IonButton>
                                <IonButton expand="block" fill="outline" class="reject-btn" @click="openRejectDialog(req.id)">
                                    Rejeitar
                                </IonButton>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </IonContent>

        <!-- Reject reason alert -->
        <IonAlert
            :is-open="rejectAlertOpen"
            header="Motivo da Rejeição"
            :inputs="[{ name: 'reason', type: 'text', placeholder: 'Explique o motivo...' }]"
            :buttons="[
                { text: 'Cancelar', role: 'cancel', handler: () => rejectAlertOpen = false },
                { text: 'Rejeitar', role: 'destructive', handler: (data: any) => rejectRequest(rejectingId!, data.reason) },
            ]"
            @didDismiss="rejectAlertOpen = false"
        />
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent, IonIcon, IonButton, IonSpinner, IonInput, IonAlert,
    toastController,
} from '@ionic/vue';
import { chevronBackOutline, documentTextOutline } from 'ionicons/icons';
import {
    contentRequestService, ContentRequest, ContentRequestStatus,
    REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS,
} from '@/services/contentRequestService';
import { ContentType, CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS } from '@/services/contentService';
import { authStore } from '@/store/auth';

export default defineComponent({
    name: 'ContentRequestsPage',
    components: { IonPage, IonContent, IonIcon, IonButton, IonSpinner, IonInput, IonAlert },
    data() {
        return {
            activeTab: 'new' as 'new' | 'my' | 'admin',
            submitting: false,
            submitSuccess: false,
            loadingMy: false,
            loadingAdmin: false,
            actioningId: '' as string,
            rejectAlertOpen: false,
            rejectingId: null as number | null,
            myRequests: [] as ContentRequest[],
            allRequests: [] as ContentRequest[],
            newForm: {
                name: '',
                alternativeNamesInput: '',
                type: 'manga' as ContentType,
                cover: '',
            },
            typeOptions: Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => ({
                value: value as ContentType,
                label,
            })),
            chevronBackOutline, documentTextOutline,
        };
    },
    computed: {
        isAdmin(): boolean {
            return authStore.user?.role === 'admin';
        },
        availableTabs() {
            const tabs = [
                { label: 'Solicitar', value: 'new' as const },
                { label: 'Minhas', value: 'my' as const },
            ];
            if (this.isAdmin) tabs.push({ label: 'Admin', value: 'admin' as const });
            return tabs;
        },
    },
    watch: {
        activeTab(val: string) {
            if (val === 'my' && this.myRequests.length === 0) this.loadMyRequests();
            if (val === 'admin' && this.allRequests.length === 0) this.loadAllRequests();
        },
    },
    async ionViewWillEnter() {
        this.activeTab = 'new';
        this.submitSuccess = false;
    },
    methods: {
        async submitRequest() {
            if (!this.newForm.name.trim()) return;
            this.submitting = true;
            this.submitSuccess = false;
            try {
                const alternative_names = this.newForm.alternativeNamesInput
                    .split(',')
                    .map((n) => n.trim())
                    .filter(Boolean);
                await contentRequestService.create({
                    name: this.newForm.name.trim(),
                    type: this.newForm.type,
                    alternative_names: alternative_names.length ? alternative_names : undefined,
                    cover: this.newForm.cover.trim() || undefined,
                });
                this.submitSuccess = true;
                this.newForm = { name: '', alternativeNamesInput: '', type: 'manga', cover: '' };
            } catch {
                const toast = await toastController.create({ message: 'Falha ao enviar solicitação.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.submitting = false;
            }
        },

        async loadMyRequests() {
            this.loadingMy = true;
            try {
                this.myRequests = await contentRequestService.getMy();
            } catch {
                // non-blocking
            } finally {
                this.loadingMy = false;
            }
        },

        async loadAllRequests() {
            this.loadingAdmin = true;
            try {
                this.allRequests = await contentRequestService.getAll();
            } catch {
                // non-blocking
            } finally {
                this.loadingAdmin = false;
            }
        },

        async approveRequest(id: number) {
            this.actioningId = `${id}-approve`;
            try {
                const updated = await contentRequestService.approve(id);
                this.updateInList(updated);
                const toast = await toastController.create({ message: 'Solicitação aprovada!', duration: 2000, color: 'success', position: 'top' });
                await toast.present();
            } catch {
                const toast = await toastController.create({ message: 'Falha ao aprovar.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.actioningId = '';
            }
        },

        openRejectDialog(id: number) {
            this.rejectingId = id;
            this.rejectAlertOpen = true;
        },

        async rejectRequest(id: number, reason: string) {
            this.rejectAlertOpen = false;
            this.actioningId = `${id}-reject`;
            try {
                const updated = await contentRequestService.reject(id, reason || '');
                this.updateInList(updated);
                const toast = await toastController.create({ message: 'Solicitação rejeitada.', duration: 2000, color: 'warning', position: 'top' });
                await toast.present();
            } catch {
                const toast = await toastController.create({ message: 'Falha ao rejeitar.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.actioningId = '';
                this.rejectingId = null;
            }
        },

        updateInList(updated: ContentRequest) {
            const idx = this.allRequests.findIndex((r) => r.id === updated.id);
            if (idx !== -1) this.allRequests[idx] = updated;
        },

        typeLabel(type: ContentType): string { return CONTENT_TYPE_LABELS[type] ?? type; },
        typeColorClass(type: ContentType): string { return CONTENT_TYPE_COLORS[type] ?? ''; },
        requestStatusLabel(status: ContentRequestStatus): string { return REQUEST_STATUS_LABELS[status] ?? status; },
        requestStatusColor(status: ContentRequestStatus): string { return REQUEST_STATUS_COLORS[status] ?? '#5a6480'; },

        typeActiveStyle(type: ContentType): Record<string, string> {
            const map: Record<ContentType, Record<string, string>> = {
                manga: { '--background': 'rgba(0,212,170,0.15)', '--color': '#00d4aa', '--border-color': 'rgba(0,212,170,0.5)' },
                anime: { '--background': 'rgba(139,92,246,0.15)', '--color': '#8b5cf6', '--border-color': 'rgba(139,92,246,0.5)' },
                novel: { '--background': 'rgba(245,158,11,0.15)', '--color': '#f59e0b', '--border-color': 'rgba(245,158,11,0.5)' },
            };
            return map[type] ?? {};
        },

        formatDate(dateStr: string): string {
            return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        },
    },
});
</script>

<style scoped>
.neon-input {
    --background: #1a2035;
    --color: #f0f4ff;
    --placeholder-color: #4a5570;
    --border-color: #222840;
    --border-radius: 12px;
    --highlight-color-focused: #00d4aa;
    --padding-start: 16px;
    --padding-end: 16px;
    min-height: 52px;
    width: 100%;
}

.type-btn {
    --border-radius: 12px;
    --border-width: 1px;
    --letter-spacing: 0;
    height: 46px;
    margin: 0;
}

.btn-primary { --background: var(--neon-accent); --color: #000; --border-radius: 12px; font-weight: 700; height: 50px; }

.approve-btn {
    --background: #10b981;
    --color: #000;
    --border-radius: 10px;
    font-weight: 700;
    height: 40px;
    flex: 1;
}

.reject-btn {
    --color: #ef4444;
    --border-color: rgba(239,68,68,0.4);
    --border-radius: 10px;
    height: 40px;
    flex: 1;
}
</style>
