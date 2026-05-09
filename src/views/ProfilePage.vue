<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
                <IonRefresherContent pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" pulling-text="" refreshing-text="" />
            </IonRefresher>

            <div style="padding: 0 0 100px; background: #0d1117; min-height: 100%;">

                <!-- Hero header -->
                <div style="position: relative; overflow: hidden;">
                    <!-- Gradient background -->
                    <div style="height: 140px; background: linear-gradient(135deg, rgba(94,234,212,0.12) 0%, rgba(167,139,250,0.08) 50%, rgba(244,114,182,0.10) 100%); position: relative;">
                        <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 0%, #0d1117 100%);"></div>
                    </div>

                    <!-- Avatar + name (overlapping the gradient) -->
                    <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 0;">
                        <!-- Avatar -->
                        <div style="width: 88px; height: 88px; border-radius: 44px; background: linear-gradient(135deg, #5eead4, #f472b6); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 900; color: #0d1117; box-shadow: 0 0 0 4px #0d1117, 0 8px 28px rgba(94,234,212,0.28); overflow: hidden; flex-shrink: 0;">
                            <img v-if="user?.avatar" :src="user.avatar" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
                            <span v-else>{{ userInitial }}</span>
                        </div>
                    </div>
                </div>

                <!-- Name + username (below hero) -->
                <div style="text-align: center; padding: 10px 18px 20px;">
                    <div style="font-size: 22px; font-weight: 900; color: #eef0f5; letter-spacing: -0.02em; line-height: 1.2;">{{ user?.name || 'Curador' }}</div>
                    <div style="font-size: 12px; color: #6b738a; margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;">
                        <span v-if="user?.username" style="color: #9aa3b8;">@{{ user.username }}</span>
                        <span v-if="user?.username" style="color: #4a5169;">·</span>
                        <span>Curador</span>
                        <span v-if="isAdmin" style="padding: 2px 8px; border-radius: 6px; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3); color: #f59e0b; font-size: 10px; font-weight: 700;">ADMIN</span>
                    </div>
                </div>

                <!-- Stats grid -->
                <div style="padding: 0 18px; margin-bottom: 10px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                        <div v-for="s in statsCards" :key="s.label" style="background: #1a1f2e; border: 1px solid #262d40; border-radius: 14px; padding: 14px 6px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 900; color: #eef0f5; letter-spacing: -0.03em; line-height: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ s.value }}</div>
                            <div style="font-size: 9px; color: #6b738a; font-weight: 700; letter-spacing: 0.07em; margin-top: 5px; text-transform: uppercase;">{{ s.label }}</div>
                        </div>
                    </div>
                </div>

                <!-- Activity metrics -->
                <div style="padding: 0 18px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1; background: #1a1f2e; border: 1px solid #262d40; border-radius: 14px; padding: 14px; display: flex; align-items: center; gap: 10px; min-width: 0;">
                            <div style="width: 38px; height: 38px; border-radius: 12px; background: rgba(167,139,250,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                            </div>
                            <div style="min-width: 0;">
                                <div style="font-size: 20px; font-weight: 900; color: #eef0f5; line-height: 1; white-space: nowrap;">{{ totalHours }}h</div>
                                <div style="font-size: 10px; color: #6b738a; margin-top: 3px; white-space: nowrap;">assistidas</div>
                            </div>
                        </div>
                        <div style="flex: 1; background: #1a1f2e; border: 1px solid #262d40; border-radius: 14px; padding: 14px; display: flex; align-items: center; gap: 10px; min-width: 0;">
                            <div style="width: 38px; height: 38px; border-radius: 12px; background: rgba(94,234,212,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            </div>
                            <div style="min-width: 0;">
                                <div style="font-size: 20px; font-weight: 900; color: #eef0f5; line-height: 1; white-space: nowrap;">{{ totalChapters }}</div>
                                <div style="font-size: 10px; color: #6b738a; margin-top: 3px; white-space: nowrap;">capítulos</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Type distribution -->
                <div v-if="userContents.length > 0" style="padding: 0 18px; margin-bottom: 20px;">
                    <div style="font-size: 10px; color: #6b738a; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px;">Distribuição</div>
                    <div style="background: #1a1f2e; border: 1px solid #262d40; border-radius: 14px; padding: 14px 16px;">
                        <template v-for="t in typeDistribution" :key="t.type">
                            <div v-if="t.count > 0" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <div style="width: 56px; flex-shrink: 0;">
                                    <span :style="{ fontSize: '10px', fontWeight: '700', color: t.color, background: t.color + '18', padding: '2px 7px', borderRadius: '20px' }">{{ t.label }}</span>
                                </div>
                                <div style="flex: 1; height: 6px; background: #262d40; border-radius: 3px; overflow: hidden;">
                                    <div :style="{ height: '100%', width: t.pct + '%', background: t.color, borderRadius: '3px', transition: 'width 0.6s ease' }"></div>
                                </div>
                                <div style="width: 24px; text-align: right; font-size: 12px; color: #eef0f5; font-weight: 700; flex-shrink: 0;">{{ t.count }}</div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Favorite genres -->
                <div v-if="topGenres.length > 0" style="padding: 0 18px; margin-bottom: 20px;">
                    <div style="font-size: 10px; color: #6b738a; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px;">Gêneros favoritos</div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <span
                            v-for="[genre, count] in topGenres"
                            :key="genre"
                            style="padding: 6px 11px; border-radius: 20px; background: #1a1f2e; border: 1px solid #262d40; font-size: 11px; color: #eef0f5; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;"
                        >
                            {{ genre }}
                            <span style="color: #4a5169; font-size: 10px; font-weight: 700;">{{ count }}</span>
                        </span>
                    </div>
                </div>

                <!-- GERENCIAMENTO -->
                <div style="padding: 0 18px; margin-bottom: 8px;">
                    <div style="font-size: 10px; color: #6b738a; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px;">Gerenciamento</div>

                    <!-- Admin: catalog -->
                    <div
                        v-if="isAdmin"
                        style="background: #1a1f2e; border: 1px solid #262d40; border-radius: 12px; padding: 14px 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 12px; cursor: pointer;"
                        @click="$router.push('/manage-contents')"
                    >
                        <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(94,234,212,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 13px; font-weight: 700; color: #eef0f5;">Catálogo de Obras</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b738a" stroke-width="1.7" stroke-linecap="round" style="flex-shrink: 0;"><path d="m9 6 6 6-6 6"/></svg>
                    </div>

                    <!-- Content requests -->
                    <div
                        style="background: #1a1f2e; border: 1px solid #262d40; border-radius: 12px; padding: 14px 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 12px; cursor: pointer;"
                        @click="$router.push('/content-requests')"
                    >
                        <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(96,165,250,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 13px; font-weight: 700; color: #eef0f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ isAdmin ? 'Solicitações de Conteúdo' : 'Sugerir Conteúdo' }}</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b738a" stroke-width="1.7" stroke-linecap="round" style="flex-shrink: 0;"><path d="m9 6 6 6-6 6"/></svg>
                    </div>

                    <!-- Sources (collapsible) -->
                    <div style="background: #1a1f2e; border: 1px solid #262d40; border-radius: 12px; overflow: hidden; margin-bottom: 6px;">
                        <div style="padding: 14px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;" @click="sitesExpanded = !sitesExpanded">
                            <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(139,92,246,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            </div>
                            <div style="flex: 1; min-width: 0; font-size: 13px; font-weight: 700; color: #eef0f5;">Minhas Fontes</div>
                            <button
                                style="width: 28px; height: 28px; border-radius: 8px; border: 1px solid #262d40; background: transparent; color: #5eead4; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; line-height: 1;"
                                @click.stop="openSiteModal(null)"
                            >+</button>
                            <svg
                                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b738a" stroke-width="1.7" stroke-linecap="round" style="flex-shrink: 0;"
                                :style="{ transform: sitesExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }"
                            ><path d="m9 6 6 6-6 6"/></svg>
                        </div>
                        <div v-if="sitesExpanded" style="border-top: 1px solid #262d40; padding: 8px 12px 12px;">
                            <div v-if="sitesLoading" style="display: flex; justify-content: center; padding: 12px 0;">
                                <IonSpinner name="crescent" style="width: 20px; height: 20px; --color: #4a5169;" />
                            </div>
                            <div v-else-if="sites.length === 0" style="text-align: center; padding: 12px 0; font-size: 12px; color: #4a5169;">Nenhuma fonte cadastrada</div>
                            <div v-else style="display: flex; flex-direction: column; gap: 6px;">
                                <div
                                    v-for="site in sites"
                                    :key="site.id"
                                    style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; border: 1px solid #262d40; background: #131826;"
                                >
                                    <button
                                        style="background: none; border: none; cursor: pointer; font-size: 14px; padding: 0; flex-shrink: 0; line-height: 1; color: #fbbf24;"
                                        :style="{ opacity: site.is_favorite ? 1 : 0.3 }"
                                        @click="toggleFavorite(site)"
                                    >★</button>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-size: 12px; font-weight: 700; color: #eef0f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ site.name }}</div>
                                        <div style="font-size: 10px; color: #4a5169; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ site.url }}</div>
                                    </div>
                                    <button
                                        style="width: 28px; height: 28px; border-radius: 8px; border: 1px solid #262d40; background: transparent; color: #6b738a; font-size: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
                                        @click="openSiteModal(site)"
                                    >✏</button>
                                    <button
                                        style="width: 28px; height: 28px; border-radius: 8px; border: 1px solid rgba(239,68,68,0.2); background: transparent; color: #ef4444; font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; line-height: 1;"
                                        @click="deleteSite(site)"
                                    >×</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PWA install -->
                <template v-if="canInstall">
                    <div style="padding: 0 18px; margin-bottom: 8px;">
                        <div style="font-size: 10px; color: #6b738a; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px;">Aplicativo</div>
                        <div
                            style="background: #1a1f2e; border: 1px solid #262d40; border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;"
                            @click="installPwa"
                        >
                            <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(96,165,250,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 13px; font-weight: 700; color: #eef0f5;">Instalar como App</div>
                                <div style="font-size: 10px; color: #6b738a; margin-top: 1px;">Adicionar à tela inicial</div>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b738a" stroke-width="1.7" stroke-linecap="round" style="flex-shrink: 0;"><path d="m9 6 6 6-6 6"/></svg>
                        </div>
                    </div>
                </template>

                <!-- Conta -->
                <div style="padding: 0 18px; margin-top: 8px;">
                    <div style="font-size: 10px; color: #6b738a; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px;">Conta</div>
                    <button
                        @click="confirmLogout"
                        style="width: 100%; padding: 14px; border-radius: 12px; border: 1px solid rgba(239,68,68,0.25); background: rgba(239,68,68,0.06); color: #ef4444; cursor: pointer; font-size: 13px; font-weight: 700; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sair da conta
                    </button>
                </div>

                <div style="text-align: center; margin-top: 28px; margin-bottom: 8px; font-size: 10px; color: #2a3040; letter-spacing: 0.04em;">Neon Curator · v1.0.0</div>
            </div>
        </IonContent>

        <!-- Site modal -->
        <IonModal
            :is-open="siteModalOpen"
            :initial-breakpoint="0.72"
            :breakpoints="[0, 0.72, 1]"
            :handle="true"
            @didDismiss="siteModalOpen = false"
        >
            <IonContent style="--background: #131826;">
                <div style="padding: 8px 20px 40px;">
                    <div style="font-size: 16px; font-weight: 800; color: #eef0f5; margin-bottom: 16px;">
                        {{ editingSite ? 'Editar Fonte' : 'Nova Fonte' }}
                    </div>
                    <div style="margin-bottom: 12px;">
                        <div style="font-size: 10px; font-weight: 800; color: #6b738a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">Nome</div>
                        <input
                            v-model="siteForm.name"
                            placeholder="Ex: MangaDex"
                            style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #262d40; background: #1a1f2e; color: #eef0f5; font-size: 14px; outline: none; box-sizing: border-box;"
                        />
                    </div>
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 10px; font-weight: 800; color: #6b738a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">URL</div>
                        <input
                            v-model="siteForm.url"
                            placeholder="https://mangadex.org"
                            type="url"
                            style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #262d40; background: #1a1f2e; color: #eef0f5; font-size: 14px; outline: none; box-sizing: border-box;"
                        />
                    </div>
                    <div
                        style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 12px; border: 1px solid #262d40; background: #1a1f2e; margin-bottom: 20px; cursor: pointer;"
                        @click="siteForm.is_favorite = !siteForm.is_favorite"
                    >
                        <span style="font-size: 13px; font-weight: 600; color: #eef0f5;">Marcar como favorita</span>
                        <div :style="toggleStyle(siteForm.is_favorite)">
                            <div :style="toggleKnobStyle(siteForm.is_favorite)"></div>
                        </div>
                    </div>
                    <button
                        :disabled="!siteForm.name.trim() || !siteForm.url.trim() || siteSaving"
                        style="width: 100%; padding: 14px; border-radius: 14px; border: none; font-size: 14px; font-weight: 800; cursor: pointer; transition: opacity 0.2s;"
                        :style="{ background: '#5eead4', color: '#0d1117', opacity: (!siteForm.name.trim() || !siteForm.url.trim()) ? 0.5 : 1 }"
                        @click="saveSite"
                    >{{ siteSaving ? 'Salvando...' : (editingSite ? 'Salvar' : 'Adicionar') }}</button>
                </div>
            </IonContent>
        </IonModal>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent, IonModal, IonSpinner, IonRefresher, IonRefresherContent, alertController, toastController,
} from '@ionic/vue';
import { authStore } from '@/store/auth';
import { authService } from '@/services/authService';
import { userContentService, UserContent } from '@/services/userContentService';
import { userSiteService, UserSite } from '@/services/userSiteService';

const TYPE_META: Record<string, { label: string; color: string }> = {
    manga:  { label: 'Manga',  color: '#5eead4' },
    anime:  { label: 'Anime',  color: '#a78bfa' },
    novel:  { label: 'Novel',  color: '#fbbf24' },
    movie:  { label: 'Filme',  color: '#f472b6' },
    tv:     { label: 'Série',  color: '#22d3ee' },
};

function emptySiteForm() {
    return { name: '', url: '', is_favorite: false };
}

export default defineComponent({
    name: 'ProfilePage',
    components: { IonPage, IonContent, IonModal, IonSpinner, IonRefresher, IonRefresherContent },
    data() {
        return {
            userContents: [] as UserContent[],
            canInstall: false,
            deferredPrompt: null as any,
            sitesExpanded: false,
            sites: [] as UserSite[],
            sitesLoading: false,
            siteModalOpen: false,
            siteSaving: false,
            editingSite: null as UserSite | null,
            siteForm: emptySiteForm(),
        };
    },
    mounted() {
        window.addEventListener('beforeinstallprompt', (e: Event) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.canInstall = true;
        });
        window.addEventListener('appinstalled', () => {
            this.canInstall = false;
            this.deferredPrompt = null;
        });
    },
    computed: {
        user() { return authStore.user; },
        isAdmin(): boolean { return authStore.user?.role === 'admin'; },
        userInitial(): string {
            return (authStore.user?.name ?? '').charAt(0).toUpperCase() || 'U';
        },
        statsCards(): { label: string; value: number }[] {
            const watching = this.userContents.filter((m) => m.status === 'reading').length;
            const completed = this.userContents.filter((m) => m.status === 'completed').length;
            return [
                { label: 'Títulos',   value: this.userContents.length },
                { label: 'Completos', value: completed },
                { label: 'Em Curso',  value: watching },
            ];
        },
        totalHours(): number {
            let minutes = 0;
            for (const uc of this.userContents) {
                const t = uc.content?.type;
                if (t === 'anime' || t === 'tv') {
                    minutes += uc.current_units * (uc.content?.duration ?? 24);
                } else if (t === 'movie' && uc.status === 'completed') {
                    minutes += uc.content?.duration ?? 90;
                }
            }
            return Math.round(minutes / 60);
        },
        totalChapters(): number {
            return this.userContents
                .filter((uc) => uc.content?.type === 'manga' || uc.content?.type === 'novel')
                .reduce((sum, uc) => sum + uc.current_units, 0);
        },
        typeDistribution(): { type: string; label: string; color: string; count: number; pct: number }[] {
            const counts: Record<string, number> = {};
            for (const uc of this.userContents) {
                const t = uc.content?.type ?? 'manga';
                counts[t] = (counts[t] ?? 0) + 1;
            }
            const max = Math.max(...Object.values(counts), 1);
            return Object.keys(TYPE_META).map((t) => ({
                type: t,
                label: TYPE_META[t].label,
                color: TYPE_META[t].color,
                count: counts[t] ?? 0,
                pct: counts[t] ? Math.round((counts[t] / max) * 100) : 0,
            }));
        },
        topGenres(): [string, number][] {
            const genreCount: Record<string, number> = {};
            for (const uc of this.userContents) {
                for (const g of uc.content?.genres ?? []) {
                    genreCount[g] = (genreCount[g] ?? 0) + 1;
                }
            }
            return (Object.entries(genreCount) as [string, number][])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8);
        },
    },
    async ionViewWillEnter() {
        await Promise.all([this.loadUserContents(), this.loadSites()]);
    },
    methods: {
        async loadUserContents() {
            try {
                this.userContents = await userContentService.getAll();
            } catch {
                // non-blocking
            }
        },
        async loadSites() {
            this.sitesLoading = true;
            try {
                this.sites = await userSiteService.getAll();
            } catch {
                // non-blocking
            } finally {
                this.sitesLoading = false;
            }
        },
        async handleRefresh(event: CustomEvent) {
            await Promise.all([this.loadUserContents(), this.loadSites()]);
            (event.target as HTMLIonRefresherElement).complete();
        },
        openSiteModal(site: UserSite | null) {
            this.editingSite = site;
            this.siteForm = site
                ? { name: site.name, url: site.url, is_favorite: site.is_favorite }
                : emptySiteForm();
            this.siteModalOpen = true;
        },
        async saveSite() {
            if (!this.siteForm.name.trim() || !this.siteForm.url.trim()) return;
            this.siteSaving = true;
            try {
                if (this.editingSite) {
                    const updated = await userSiteService.update(this.editingSite.id, this.siteForm);
                    const idx = this.sites.findIndex((s) => s.id === this.editingSite!.id);
                    if (idx >= 0) this.sites.splice(idx, 1, updated);
                } else {
                    const created = await userSiteService.create(this.siteForm);
                    this.sites.push(created);
                    this.sites.sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
                }
                this.siteModalOpen = false;
            } catch {
                const toast = await toastController.create({ message: 'Falha ao salvar fonte.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.siteSaving = false;
            }
        },
        async toggleFavorite(site: UserSite) {
            try {
                const updated = await userSiteService.toggleFavorite(site);
                const idx = this.sites.findIndex((s) => s.id === site.id);
                if (idx >= 0) this.sites.splice(idx, 1, updated);
                this.sites.sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
            } catch {
                // silent
            }
        },
        async deleteSite(site: UserSite) {
            const alert = await alertController.create({
                header: 'Remover fonte',
                message: `Remover "${site.name}"?`,
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    {
                        text: 'Remover', role: 'destructive',
                        handler: async () => {
                            try {
                                await userSiteService.delete(site.id);
                                this.sites = this.sites.filter((s) => s.id !== site.id);
                            } catch {
                                const toast = await toastController.create({ message: 'Falha ao remover.', duration: 2000, color: 'danger', position: 'top' });
                                await toast.present();
                            }
                        },
                    },
                ],
            });
            await alert.present();
        },
        toggleStyle(active: boolean): Record<string, string> {
            return {
                width: '44px', height: '26px', borderRadius: '13px', position: 'relative',
                background: active ? '#5eead4' : '#262d40',
                transition: 'background 0.2s', flexShrink: '0',
            };
        },
        toggleKnobStyle(active: boolean): Record<string, string> {
            return {
                position: 'absolute', top: '3px', borderRadius: '10px',
                left: active ? '21px' : '3px', width: '20px', height: '20px',
                background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            };
        },
        async confirmLogout() {
            const alert = await alertController.create({
                header: 'Sair',
                message: 'Tem certeza que deseja sair?',
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Sair', role: 'destructive', handler: () => this.logout() },
                ],
            });
            await alert.present();
        },
        async installPwa() {
            if (!this.deferredPrompt) return;
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                this.canInstall = false;
                this.deferredPrompt = null;
            }
        },
        async logout() {
            try {
                await authService.logout();
            } catch {
                // proceed regardless
            } finally {
                authStore.clearAuth();
                this.$router.replace('/login');
            }
        },
    },
});
</script>
