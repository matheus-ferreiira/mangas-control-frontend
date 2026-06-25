<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
                <IonRefresherContent pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" pulling-text="" refreshing-text="" />
            </IonRefresher>

            <div style="padding: 0 0 100px; min-height: 100%; background: hsl(220 30% 3%);">

                <!-- Hero header -->
                <div style="position: relative; overflow: hidden;">
                    <div style="height: 190px; background: linear-gradient(135deg, hsl(38 91% 55% / 0.16) 0%, hsl(16 100% 60% / 0.10) 50%, hsl(258 89% 70% / 0.08) 100%); position: relative;">
                        <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 0%, hsl(220 30% 3%) 100%);"></div>
                    </div>
                    <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 0;">
                        <div style="width: 88px; height: 88px; border-radius: 44px; background: linear-gradient(135deg, #f5a623, #ff6b35); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 900; color: #050608; box-shadow: 0 0 0 4px hsl(220 30% 3%), 0 0 30px hsl(38 91% 55% / 0.4); overflow: hidden; flex-shrink: 0;">
                            <img v-if="user?.avatar" :src="user.avatar" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
                            <span v-else>{{ userInitial }}</span>
                        </div>
                    </div>
                </div>

                <!-- Name + username -->
                <div style="text-align: center; padding: 10px 18px 20px;">
                    <div style="font-size: 22px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.2; font-family: 'Sora', system-ui, sans-serif; background: linear-gradient(135deg, #f5a623, #ff6b35); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">{{ user?.name || 'Curador' }}</div>
                    <div style="font-size: 12px; color: rgba(233,237,242,0.42); margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;">
                        <span v-if="user?.username" style="color: rgba(233,237,242,0.62);">@{{ user.username }}</span>
                        <span v-if="user?.username" style="color: rgba(233,237,242,0.22);">·</span>
                        <span>Curador</span>
                        <span v-if="isAdmin" style="padding: 2px 8px; border-radius: 6px; background: rgba(230,184,92,0.12); border: 1px solid rgba(230,184,92,0.3); color: #F5C542; font-size: 10px; font-weight: 800; letter-spacing: 0.06em;">ADMIN</span>
                    </div>
                </div>

                <!-- Stats header compacto -->
                <div style="margin: 0 18px 20px;">
                    <StatsHeader :stats="statsCards" />
                </div>

                <!-- Activity metrics — ghost surface -->
                <div style="padding: 0 18px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 14px; display: flex; align-items: center; gap: 10px; min-width: 0;">
                            <div style="width: 38px; height: 38px; border-radius: 12px; background: rgba(167,139,250,0.10); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B8A4FF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                            </div>
                            <div style="min-width: 0;">
                                <div style="font-size: 20px; font-weight: 800; color: #e9edf2; line-height: 1; font-family: 'Sora', system-ui, sans-serif;">{{ totalHours }}h</div>
                                <div style="font-size: 10px; color: rgba(233,237,242,0.42); margin-top: 3px;">assistidas</div>
                            </div>
                        </div>
                        <div style="flex: 1; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 14px; display: flex; align-items: center; gap: 10px; min-width: 0;">
                            <div style="width: 38px; height: 38px; border-radius: 12px; background: rgba(245,166,35,0.10); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f5a623" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            </div>
                            <div style="min-width: 0;">
                                <div style="font-size: 20px; font-weight: 800; color: #e9edf2; line-height: 1; font-family: 'Sora', system-ui, sans-serif;">{{ totalChapters }}</div>
                                <div style="font-size: 10px; color: rgba(233,237,242,0.42); margin-top: 3px;">capítulos</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Type distribution -->
                <div v-if="userContents.length > 0" style="padding: 0 18px; margin-bottom: 20px;">
                    <div style="font-size: 10px; color: rgba(233,237,242,0.42); font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 10px;">Distribuição</div>
                    <div style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 14px 16px;">
                        <template v-for="t in typeDistribution" :key="t.type">
                            <div v-if="t.count > 0" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <div style="width: 56px; flex-shrink: 0;">
                                    <span :style="{ fontSize: '10px', fontWeight: '800', color: t.color, background: t.color + '1a', padding: '2px 7px', borderRadius: '20px', letterSpacing: '0.04em' }">{{ t.label }}</span>
                                </div>
                                <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                                    <div :style="{ height: '100%', width: t.pct + '%', background: t.color, borderRadius: '3px', transition: 'width 0.6s ease' }"></div>
                                </div>
                                <div style="width: 24px; text-align: right; font-size: 12px; color: #e9edf2; font-weight: 700; flex-shrink: 0;">{{ t.count }}</div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Favorite genres -->
                <div v-if="topGenres.length > 0" style="padding: 0 18px; margin-bottom: 20px;">
                    <div style="font-size: 10px; color: rgba(233,237,242,0.42); font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 10px;">Gêneros favoritos</div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <span
                            v-for="[genre, count] in topGenres"
                            :key="genre"
                            style="padding: 6px 11px; border-radius: 20px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: rgba(233,237,242,0.62); font-weight: 600; display: inline-flex; align-items: center; gap: 5px;"
                        >
                            {{ genre }}
                            <span style="color: rgba(233,237,242,0.28); font-size: 10px; font-weight: 700;">{{ count }}</span>
                        </span>
                    </div>
                </div>

                <!-- GERENCIAMENTO -->
                <div style="padding: 0 18px; margin-bottom: 8px;">
                    <div style="font-size: 10px; color: rgba(233,237,242,0.42); font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 10px;">Gerenciamento</div>

                    <!-- Minhas Fontes (tela dedicada) -->
                    <div
                        style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 12px; cursor: pointer;"
                        @click="$router.push('/tabs/sources')"
                    >
                        <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(167,139,250,0.10); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B8A4FF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 13px; font-weight: 700; color: #e9edf2;">Minhas Fontes</div>
                            <div style="font-size: 10px; color: rgba(233,237,242,0.42); margin-top: 1px;">Gerenciar sites e apps de leitura</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(233,237,242,0.28)" stroke-width="1.7" stroke-linecap="round" style="flex-shrink: 0;"><path d="m9 6 6 6-6 6"/></svg>
                    </div>

                    <!-- Sincronizar capítulos via bookmarklet (apenas admin) -->
                    <div v-if="isAdmin" style="background: var(--bg-tertiary); border: 1px solid var(--border-default); border-radius: 8px; padding: 14px 16px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(74,222,128,0.10); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <IonIcon :icon="refreshOutline" style="font-size: 16px; color: var(--dot-new);" />
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">Sincronizar capítulos (ToonLivre)</div>
                                <div style="font-size: 10px; color: var(--text-muted); margin-top: 1px;">O site bloqueia o servidor — roda no seu navegador via bookmarklet</div>
                            </div>
                        </div>
                        <a
                            :href="bookmarkletHref"
                            @click.prevent
                            style="display: block; text-align: center; background: var(--accent-primary); color: #000; font-weight: 700; font-size: 13px; padding: 10px; border-radius: 8px; text-decoration: none; cursor: grab; margin-bottom: 8px;"
                        >🔖 Sincronizar ToonLivre</a>
                        <button
                            style="width: 100%; background: transparent; border: 1px solid var(--border-default); color: var(--text-secondary); font-size: 12px; font-weight: 600; padding: 8px; border-radius: 8px; cursor: pointer;"
                            @click="copyBookmarklet"
                        >{{ bookmarkletCopied ? '✓ Copiado!' : 'Copiar bookmarklet' }}</button>
                        <ol style="font-size: 11px; color: var(--text-muted); margin: 10px 0 0; padding-left: 18px; line-height: 1.7;">
                            <li><strong>Arraste</strong> o botão laranja para a barra de favoritos (ou copie e crie um favorito colando como URL).</li>
                            <li>Abra <strong>toonlivre.net</strong> e clique no favorito.</li>
                            <li>Ele sincroniza e mostra um alerta com o resultado.</li>
                            <li>Volte aqui e recarregue — os badges "Cap. X disponível" aparecem.</li>
                        </ol>
                    </div>
                </div>

                <!-- PWA install -->
                <template v-if="canInstall">
                    <div style="padding: 0 18px; margin-bottom: 8px;">
                        <div style="font-size: 10px; color: rgba(233,237,242,0.42); font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 10px;">Aplicativo</div>
                        <div
                            style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;"
                            @click="installPwa"
                        >
                            <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(125,167,255,0.10); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7CAEFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 13px; font-weight: 700; color: #e9edf2;">Instalar como App</div>
                                <div style="font-size: 10px; color: rgba(233,237,242,0.42); margin-top: 1px;">Adicionar à tela inicial</div>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(233,237,242,0.28)" stroke-width="1.7" stroke-linecap="round" style="flex-shrink: 0;"><path d="m9 6 6 6-6 6"/></svg>
                        </div>
                    </div>
                </template>

                <!-- Configurações -->
                <div style="padding: 0 18px; margin-top: 8px;">
                    <div style="font-size: 10px; color: rgba(233,237,242,0.42); font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 10px;">Configurações</div>
                    <div style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px 16px;">
                        <div style="display: flex; align-items: center; gap: 12px; cursor: pointer;" @click="toggleAdult">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 0.9rem; font-weight: 700; color: #f0f0f0;">Exibir conteúdo adulto (+18)</div>
                                <div style="font-size: 0.75rem; color: #606060; margin-top: 3px; line-height: 1.4;">Conteúdo explícito será exibido em todo o app</div>
                            </div>
                            <div :style="adultTrackStyle">
                                <div :style="adultKnobStyle"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Conta -->
                <div style="padding: 0 18px; margin-top: 18px;">
                    <div style="font-size: 10px; color: rgba(233,237,242,0.42); font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 10px;">Conta</div>
                    <button
                        @click="confirmLogout"
                        style="width: 100%; padding: 14px; border-radius: 12px; border: 1px solid rgba(239,107,107,0.22); background: rgba(239,107,107,0.06); color: #FF5E5E; cursor: pointer; font-size: 13px; font-weight: 700; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sair da conta
                    </button>
                </div>

                <div style="text-align: center; margin-top: 28px; margin-bottom: 8px; font-size: 10px; color: rgba(233,237,242,0.12); letter-spacing: 0.04em;">Neon Curator · v1.0.0</div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent, IonRefresher, IonRefresherContent, IonIcon, IonSpinner, alertController, toastController,
} from '@ionic/vue';
import { refreshOutline } from 'ionicons/icons';
import { authStore } from '@/store/auth';
import { authService } from '@/services/authService';
import { userContentService, UserContent } from '@/services/userContentService';
import StatsHeader from '@/components/StatsHeader.vue';

const TYPE_META: Record<string, { label: string; color: string }> = {
    manga:  { label: 'Manga',  color: '#f5a623' },
    anime:  { label: 'Anime',  color: '#B8A4FF' },
    novel:  { label: 'Novel',  color: '#F5C542' },
    movie:  { label: 'Filme',  color: '#FF7EC7' },
    tv:     { label: 'Série',  color: '#7CAEFF' },
};

export default defineComponent({
    name: 'ProfilePage',
    components: { IonPage, IonContent, IonRefresher, IonRefresherContent, IonIcon, IonSpinner, StatsHeader },
    data() {
        return {
            userContents: [] as UserContent[],
            canInstall: false,
            adultSaving: false,
            bookmarkletCopied: false,
            refreshOutline,
        };
    },
    mounted() {
        // Check if the global interceptor (main.ts) already captured the prompt
        if ((window as any).__pwaPrompt) {
            this.canInstall = true;
        }
        const onReady = () => { this.canInstall = true; };
        const onInstalled = () => { this.canInstall = false; };
        window.addEventListener('pwa-installprompt-ready', onReady);
        window.addEventListener('pwa-installed', onInstalled);
        (this as any)._pwaListeners = { onReady, onInstalled };
    },
    beforeUnmount() {
        const { onReady, onInstalled } = (this as any)._pwaListeners ?? {};
        if (onReady) window.removeEventListener('pwa-installprompt-ready', onReady);
        if (onInstalled) window.removeEventListener('pwa-installed', onInstalled);
    },
    computed: {
        user() { return authStore.user; },
        isAdmin(): boolean { return authStore.user?.role === 'admin'; },
        bookmarkletHref(): string {
            const apiBase = (import.meta as any).env.VITE_API_URL;
            const token = authStore.token ?? '';
            const js =
                '(async()=>{try{' +
                'var A=[],p=1,n=true;' +
                'while(n&&p<=20){' +
                "var r=await fetch('/api/mangas/releases?page='+p+'&limit=48',{headers:{Accept:'application/json'}});" +
                'if(!r.ok)break;' +
                'var d=await r.json();' +
                'var l=Array.isArray(d)?d:(d.mangas||[]);' +
                'for(var i=0;i<l.length;i++){var it=l[i];var t=it&&it.alternativeTitle;var c=it&&it.recentChapters&&it.recentChapters[0]&&it.recentChapters[0].number;if(t&&c!=null)A.push({alternativeTitle:String(t),chapter:String(c)});}' +
                'n=!!(d&&d.pagination&&d.pagination.hasNextPage)&&p<20;p++;' +
                '}' +
                "if(!A.length){alert('Nenhum lancamento coletado.');return;}" +
                "var x=await fetch('" + apiBase + "/user/sync-chapters',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','Authorization':'Bearer " + token + "'},body:JSON.stringify({releases:A})});" +
                'var j=await x.json();' +
                'var dt=(j&&j.data)||{};' +
                'var nc=dt.new_chapters||[];' +
                'var um=dt.unmatched||[];' +
                "var msg='Sincronizado: '+A.length+' lancamentos do site.\\n'+(dt.linked||0)+' obra(s) vinculadas ao ToonLivre, '+(dt.retitled||0)+' titulo(s) corrigido(s).\\n'+nc.length+' obra(s) com capitulo novo.';" +
                "if(um.length)msg+='\\n\\nSem correspondencia ('+um.length+'): '+um.join(', ');" +
                'alert(msg);' +
                "}catch(e){alert('Erro: '+(e&&e.message));}})();";
            return 'javascript:' + js;
        },
        userInitial(): string {
            return (authStore.user?.name ?? '').charAt(0).toUpperCase() || 'U';
        },
        showAdult(): boolean {
            return !!authStore.user?.show_adult_content;
        },
        adultTrackStyle(): Record<string, string> {
            const on = this.showAdult;
            return {
                width: '44px', height: '26px', borderRadius: '13px', position: 'relative', flexShrink: '0',
                background: on ? 'rgba(245,166,35,0.3)' : '#2a2a2a',
                transition: 'background 0.2s',
                opacity: this.adultSaving ? '0.6' : '1',
            };
        },
        adultKnobStyle(): Record<string, string> {
            const on = this.showAdult;
            return {
                position: 'absolute', top: '3px', borderRadius: '10px',
                left: on ? '21px' : '3px', width: '20px', height: '20px',
                background: on ? '#f5a623' : '#606060',
                transition: 'left 0.2s, background 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            };
        },
        statsCards(): { label: string; value: number; color: string }[] {
            const watching = this.userContents.filter((m) => m.status === 'reading').length;
            const completed = this.userContents.filter((m) => m.status === 'completed').length;
            return [
                { label: 'Títulos',   value: this.userContents.length, color: '#e9edf2' },
                { label: 'Completos', value: completed,                 color: '#7CAEFF' },
                { label: 'Em Curso',  value: watching,                  color: '#f5a623' },
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
            const total = Math.max(this.userContents.length, 1);
            return Object.keys(TYPE_META).map((t) => ({
                type: t,
                label: TYPE_META[t].label,
                color: TYPE_META[t].color,
                count: counts[t] ?? 0,
                pct: counts[t] ? Math.round((counts[t] / total) * 100) : 0,
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
        this.syncUser();
        await this.loadUserContents();
    },
    methods: {
        // Sincroniza o flag show_adult_content de sessões antigas (cache local sem o campo)
        async syncUser() {
            try {
                const fresh = await authService.getUser();
                authStore.setUser(fresh);
            } catch {
                // non-blocking
            }
        },
        async toggleAdult() {
            if (this.adultSaving) return;
            const next = !this.showAdult;
            this.adultSaving = true;
            try {
                const updated = await authService.updateProfile({ show_adult_content: next });
                authStore.setUser(updated);
                const toast = await toastController.create({
                    message: next ? 'Conteúdo adulto ativado' : 'Conteúdo adulto ocultado',
                    duration: 1800, color: 'success', position: 'top',
                });
                await toast.present();
            } catch {
                const toast = await toastController.create({ message: 'Falha ao atualizar configuração.', duration: 2000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.adultSaving = false;
            }
        },
        async loadUserContents() {
            try {
                this.userContents = await userContentService.getAll();
            } catch {
                // non-blocking
            }
        },
        async handleRefresh(event: CustomEvent) {
            await this.loadUserContents();
            (event.target as HTMLIonRefresherElement).complete();
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
            await (window as any).installPWA?.();
        },
        async copyBookmarklet() {
            try {
                await navigator.clipboard.writeText(this.bookmarkletHref);
                this.bookmarkletCopied = true;
                setTimeout(() => { this.bookmarkletCopied = false; }, 2500);
            } catch {
                const t = await toastController.create({ message: 'Não foi possível copiar. Arraste o botão para os favoritos.', duration: 2500, color: 'danger', position: 'top' });
                await t.present();
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
