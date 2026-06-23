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

                <!-- Stats row — airy, hairline dividers -->
                <div style="margin: 0 18px 20px; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; display: flex; align-items: stretch;">
                    <div
                        v-for="(s, i) in statsCards"
                        :key="s.label"
                        :style="{ flex: '1', padding: '16px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }"
                    >
                        <div :style="{ fontSize: '26px', fontWeight: '800', color: s.color, letterSpacing: '-0.03em', lineHeight: '1', fontFamily: '\'Sora\', system-ui, sans-serif' }">{{ s.value }}</div>
                        <div style="font-size: 9px; color: rgba(233,237,242,0.42); font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; margin-top: 5px;">{{ s.label }}</div>
                    </div>
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

                    <!-- Admin: catalog -->
                    <div
                        v-if="isAdmin"
                        style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 12px; cursor: pointer;"
                        @click="$router.push('/manage-contents')"
                    >
                        <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(245,166,35,0.10); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f5a623" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 13px; font-weight: 700; color: #e9edf2;">Catálogo de Obras</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(233,237,242,0.28)" stroke-width="1.7" stroke-linecap="round" style="flex-shrink: 0;"><path d="m9 6 6 6-6 6"/></svg>
                    </div>

                    <!-- Content requests -->
                    <div
                        style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 12px; cursor: pointer;"
                        @click="$router.push('/content-requests')"
                    >
                        <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(125,167,255,0.10); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7CAEFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 13px; font-weight: 700; color: #e9edf2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ isAdmin ? 'Solicitações de Conteúdo' : 'Sugerir Conteúdo' }}</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(233,237,242,0.28)" stroke-width="1.7" stroke-linecap="round" style="flex-shrink: 0;"><path d="m9 6 6 6-6 6"/></svg>
                    </div>

                    <!-- Sources (collapsible) -->
                    <div style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; margin-bottom: 6px;">
                        <div style="padding: 14px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;" @click="sitesExpanded = !sitesExpanded">
                            <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(167,139,250,0.10); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B8A4FF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            </div>
                            <div style="flex: 1; min-width: 0; font-size: 13px; font-weight: 700; color: #e9edf2;">Minhas Fontes</div>
                            <button
                                style="width: 28px; height: 28px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); background: transparent; color: #f5a623; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; line-height: 1;"
                                @click.stop="openSiteModal(null)"
                            >+</button>
                            <svg
                                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(233,237,242,0.28)" stroke-width="1.7" stroke-linecap="round" style="flex-shrink: 0;"
                                :style="{ transform: sitesExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }"
                            ><path d="m9 6 6 6-6 6"/></svg>
                        </div>
                        <div v-if="sitesExpanded" style="border-top: 1px solid rgba(255,255,255,0.06); padding: 8px 12px 12px;">
                            <div v-if="sitesLoading" style="display: flex; justify-content: center; padding: 12px 0;">
                                <IonSpinner name="crescent" style="width: 20px; height: 20px; --color: rgba(233,237,242,0.28);" />
                            </div>
                            <div v-else-if="sites.length === 0" style="text-align: center; padding: 12px 0; font-size: 12px; color: rgba(233,237,242,0.28);">Nenhuma fonte cadastrada</div>
                            <div v-else style="display: flex; flex-direction: column; gap: 6px;">
                                <div
                                    v-for="site in sites"
                                    :key="site.id"
                                    style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02);"
                                >
                                    <button
                                        style="background: none; border: none; cursor: pointer; font-size: 14px; padding: 0; flex-shrink: 0; line-height: 1; color: #F5C542;"
                                        :style="{ opacity: site.is_favorite ? 1 : 0.3 }"
                                        @click="toggleFavorite(site)"
                                    >★</button>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-size: 12px; font-weight: 700; color: #e9edf2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ site.name }}</div>
                                        <div v-if="site.url" style="font-size: 10px; color: rgba(233,237,242,0.28); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ site.url }}</div>
                                        <div v-else style="font-size: 10px; color: rgba(233,237,242,0.18); font-style: italic;">sem URL</div>
                                    </div>
                                    <button
                                        style="width: 28px; height: 28px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); background: transparent; color: rgba(233,237,242,0.42); font-size: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
                                        @click="openSiteModal(site)"
                                    >✏</button>
                                    <button
                                        style="width: 28px; height: 28px; border-radius: 8px; border: 1px solid rgba(239,107,107,0.2); background: transparent; color: #FF5E5E; font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; line-height: 1;"
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

        <!-- Site modal -->
        <IonModal
            :is-open="siteModalOpen"
            :initial-breakpoint="0.72"
            :breakpoints="[0, 0.72, 1]"
            :handle="true"
            @didDismiss="siteModalOpen = false"
        >
            <IonContent style="--background: hsl(222 24% 7%);">
                <div style="padding: 8px 20px 40px;">
                    <div style="font-size: 16px; font-weight: 800; color: #e9edf2; margin-bottom: 16px;">
                        {{ editingSite ? 'Editar Fonte' : 'Nova Fonte' }}
                    </div>
                    <div style="margin-bottom: 12px;">
                        <div style="font-size: 10px; font-weight: 800; color: rgba(233,237,242,0.42); text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 6px;">Nome</div>
                        <input
                            v-model="siteForm.name"
                            placeholder="Ex: MangaDex"
                            style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025); color: #e9edf2; font-size: 14px; outline: none; box-sizing: border-box;"
                        />
                    </div>
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 10px; font-weight: 800; color: rgba(233,237,242,0.42); text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 6px;">URL <span style="font-weight: 600; text-transform: none; letter-spacing: 0; color: rgba(233,237,242,0.28);">— opcional</span></div>
                        <input
                            v-model="siteForm.url"
                            placeholder="mangadex.org  (deixe vazio para apps)"
                            type="text"
                            style="width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025); color: #e9edf2; font-size: 14px; outline: none; box-sizing: border-box;"
                        />
                    </div>
                    <div
                        style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025); margin-bottom: 20px; cursor: pointer;"
                        @click="siteForm.is_favorite = !siteForm.is_favorite"
                    >
                        <span style="font-size: 13px; font-weight: 600; color: #e9edf2;">Marcar como favorita</span>
                        <div :style="toggleStyle(siteForm.is_favorite)">
                            <div :style="toggleKnobStyle(siteForm.is_favorite)"></div>
                        </div>
                    </div>
                    <button
                        :disabled="!siteForm.name.trim() || siteSaving"
                        style="width: 100%; padding: 14px; border-radius: 14px; border: none; font-size: 14px; font-weight: 800; cursor: pointer; transition: opacity 0.2s;"
                        :style="{ background: '#f5a623', color: '#050608', opacity: !siteForm.name.trim() ? 0.5 : 1 }"
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
    manga:  { label: 'Manga',  color: '#f5a623' },
    anime:  { label: 'Anime',  color: '#B8A4FF' },
    novel:  { label: 'Novel',  color: '#F5C542' },
    movie:  { label: 'Filme',  color: '#FF7EC7' },
    tv:     { label: 'Série',  color: '#7CAEFF' },
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
            adultSaving: false,
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
        await Promise.all([this.loadUserContents(), this.loadSites()]);
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
        normalizeUrl(url: string): string {
            const trimmed = url?.trim() ?? '';
            if (!trimmed) return '';
            if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
                return 'https://' + trimmed;
            }
            return trimmed;
        },
        async saveSite() {
            if (!this.siteForm.name.trim()) return;
            this.siteForm.url = this.normalizeUrl(this.siteForm.url);
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
                background: active ? '#f5a623' : 'rgba(255,255,255,0.08)',
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
            await (window as any).installPWA?.();
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
