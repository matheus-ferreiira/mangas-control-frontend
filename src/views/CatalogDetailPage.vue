<template>
    <IonPage>
        <IonContent :fullscreen="true">

            <!-- ══ SKELETON LOADER ══ -->
            <template v-if="loading">
                <!-- Hero skeleton -->
                <div style="position: relative; height: 300px; background: linear-gradient(135deg, #131826, #1a1f2e); animation: pulse 1.4s ease-in-out infinite;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(13,17,23,0.95) 100%);" />
                    <div style="position: absolute; bottom: 18px; left: 16px; right: 16px;">
                        <div style="display: flex; gap: 6px; margin-bottom: 10px;">
                            <div style="width: 44px; height: 18px; border-radius: 20px; background: #1e2535;" />
                            <div style="width: 60px; height: 18px; border-radius: 20px; background: #1e2535;" />
                        </div>
                        <div style="height: 26px; width: 75%; border-radius: 8px; background: #1e2535; margin-bottom: 8px;" />
                        <div style="height: 14px; width: 50%; border-radius: 6px; background: #1e2535;" />
                    </div>
                </div>
                <!-- Back button always visible -->
                <div style="position: fixed; left: 12px; z-index: 200;" :style="{ top: 'max(12px, env(safe-area-inset-top, 12px))' }">
                    <button style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #eef0f5; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;" @click="$router.back()">‹</button>
                </div>
                <!-- Skeleton body -->
                <div style="padding: 16px 16px 80px;">
                    <div style="display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 18px;">
                        <div v-for="i in 4" :key="i" style="height: 64px; border-radius: 14px; background: #131826; animation: pulse 1.4s ease-in-out infinite;" />
                    </div>
                    <div style="display: flex; gap: 6px; margin-bottom: 18px;">
                        <div v-for="i in 4" :key="i" :style="{ width: `${40 + i * 12}px`, height: '26px', borderRadius: '8px', background: '#131826', animation: 'pulse 1.4s ease-in-out infinite' }" />
                    </div>
                    <div style="height: 120px; border-radius: 16px; background: #131826; animation: pulse 1.4s ease-in-out infinite;" />
                </div>
            </template>

            <!-- ══ CONTENT LOADED ══ -->
            <div v-else-if="content">
                <!-- Hero header -->
                <div style="position: relative; width: 100%; height: 300px; overflow: hidden;">
                    <img
                        v-if="headerImage"
                        :src="headerImage"
                        style="width: 100%; height: 100%; object-fit: cover; display: block;"
                        alt="Capa"
                    />
                    <div v-else style="width: 100%; height: 100%; background: linear-gradient(135deg, #1a1f2e, #222837); display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 80px; opacity: 0.15;">{{ typeEmoji }}</span>
                    </div>
                    <!-- Gradient overlay -->
                    <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(13,17,23,0.1) 0%, rgba(13,17,23,0.6) 55%, rgba(13,17,23,1) 100%);" />
                    <!-- Title area -->
                    <div style="position: absolute; bottom: 18px; left: 16px; right: 16px;">
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
                            <span :style="typeBadgeStyle">{{ typeLabel }}</span>
                            <span v-if="catStatusLabel" :style="catStatusBadgeStyle">{{ catStatusLabel }}</span>
                            <span v-if="content.is_adult" style="font-size: 9px; font-weight: 800; color: #ef4444; background: rgba(239,68,68,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">+18</span>
                            <span v-if="content.age_rating && !content.is_adult" style="font-size: 9px; font-weight: 700; color: #9aa3b8; background: rgba(154,163,184,0.12); padding: 2px 6px; border-radius: 20px;">{{ content.age_rating }}</span>
                            <span v-if="isHighScore" style="font-size: 9px; font-weight: 800; color: #f59e0b; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">TOP</span>
                            <span v-if="isInLibrary" style="font-size: 9px; font-weight: 800; color: #5eead4; background: rgba(94,234,212,0.12); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">✓ Na lista</span>
                        </div>
                        <h1 style="font-size: 24px; font-weight: 900; color: #eef0f5; margin: 0; line-height: 1.2; letter-spacing: -0.03em;">{{ content.name }}</h1>
                        <div v-if="content.tagline" style="font-size: 12px; color: #9aa3b8; margin-top: 5px; font-style: italic; line-height: 1.4;">{{ content.tagline }}</div>
                        <div v-else-if="content.alternative_names?.length" style="font-size: 12px; color: #6b738a; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            {{ content.alternative_names[0] }}
                        </div>
                    </div>
                </div>

                <div style="padding: 16px 16px 140px;">
                    <!-- Stats grid -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px;">
                        <div v-if="content.rating != null" :style="statCellStyle">
                            <div style="font-size: 16px; font-weight: 800; color: #f59e0b;">★ {{ content.rating.toFixed(1) }}</div>
                            <div :style="statLabelStyle">Nota</div>
                        </div>
                        <div v-if="content.score != null" :style="statCellStyle">
                            <div style="font-size: 16px; font-weight: 800; color: #5eead4;">{{ content.score }}</div>
                            <div :style="statLabelStyle">Score</div>
                        </div>
                        <div v-if="content.release_year" :style="statCellStyle">
                            <div style="font-size: 16px; font-weight: 800; color: #eef0f5;">{{ content.release_year }}</div>
                            <div :style="statLabelStyle">Ano</div>
                        </div>
                        <div v-if="isMovie && content.duration_formatted" :style="statCellStyle">
                            <div style="font-size: 13px; font-weight: 800; color: #eef0f5;">{{ content.duration_formatted }}</div>
                            <div :style="statLabelStyle">Duração</div>
                        </div>
                        <div v-else-if="isTv && content.total_seasons" :style="statCellStyle">
                            <div style="font-size: 16px; font-weight: 800; color: #eef0f5;">{{ content.total_seasons }}</div>
                            <div :style="statLabelStyle">Temp.</div>
                        </div>
                        <div v-else-if="content.total_units" :style="statCellStyle">
                            <div style="font-size: 16px; font-weight: 800; color: #eef0f5;">{{ content.total_units }}</div>
                            <div :style="statLabelStyle">{{ unitShort }}</div>
                        </div>
                        <div v-if="content.country" :style="statCellStyle">
                            <div style="font-size: 14px; font-weight: 800; color: #eef0f5;">{{ content.country }}</div>
                            <div :style="statLabelStyle">País</div>
                        </div>
                        <div v-if="content.votes_count" :style="statCellStyle">
                            <div style="font-size: 13px; font-weight: 800; color: #eef0f5;">{{ formatVotes(content.votes_count) }}</div>
                            <div :style="statLabelStyle">Votos</div>
                        </div>
                    </div>

                    <!-- Genres -->
                    <div v-if="content.genres?.length" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px;">
                        <span
                            v-for="g in content.genres"
                            :key="g"
                            :style="genreTagStyle"
                        >{{ g }}</span>
                    </div>

                    <!-- Studios / Authors -->
                    <div v-if="content.studios?.length" style="background: #131826; border: 1px solid #1e2535; border-radius: 16px; padding: 14px 16px; margin-bottom: 14px;">
                        <div style="font-size: 10px; font-weight: 700; color: #6b738a; margin-bottom: 10px; letter-spacing: 0.08em; text-transform: uppercase;">
                            {{ content.type === 'manga' ? 'Autores' : 'Estúdios' }}
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <span
                                v-for="s in content.studios"
                                :key="s"
                                style="font-size: 12px; font-weight: 600; color: #9aa3b8; background: #1a1f2e; border: 1px solid #1e2535; padding: 4px 12px; border-radius: 8px;"
                            >{{ s }}</span>
                        </div>
                    </div>

                    <!-- Networks (TV) -->
                    <div v-if="content.networks?.length" style="background: #131826; border: 1px solid #1e2535; border-radius: 16px; padding: 14px 16px; margin-bottom: 14px;">
                        <div style="font-size: 10px; font-weight: 700; color: #6b738a; margin-bottom: 10px; letter-spacing: 0.08em; text-transform: uppercase;">Plataformas</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <span
                                v-for="n in content.networks"
                                :key="n"
                                style="font-size: 12px; font-weight: 700; color: #a78bfa; background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.2); padding: 4px 12px; border-radius: 8px;"
                            >{{ n }}</span>
                        </div>
                    </div>

                    <!-- Demographics + Themes (Jikan) -->
                    <div v-if="content.demographics?.length || content.themes?.length" style="background: #131826; border: 1px solid #1e2535; border-radius: 16px; padding: 14px 16px; margin-bottom: 14px;">
                        <div v-if="content.demographics?.length" :style="{ marginBottom: content.themes?.length ? '12px' : '0' }">
                            <div style="font-size: 10px; font-weight: 700; color: #6b738a; margin-bottom: 8px; letter-spacing: 0.08em; text-transform: uppercase;">Público</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                <span
                                    v-for="d in content.demographics"
                                    :key="d"
                                    style="font-size: 12px; font-weight: 700; color: #5eead4; background: rgba(94,234,212,0.1); border: 1px solid rgba(94,234,212,0.2); padding: 4px 12px; border-radius: 8px;"
                                >{{ d }}</span>
                            </div>
                        </div>
                        <div v-if="content.themes?.length" :style="{ marginTop: content.demographics?.length ? '12px' : '0' }">
                            <div style="font-size: 10px; font-weight: 700; color: #6b738a; margin-bottom: 8px; letter-spacing: 0.08em; text-transform: uppercase;">Temas</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                <span
                                    v-for="t in content.themes"
                                    :key="t"
                                    style="font-size: 12px; font-weight: 600; color: #9aa3b8; background: #1a1f2e; border: 1px solid #1e2535; padding: 4px 10px; border-radius: 8px;"
                                >{{ t }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Synopsis -->
                    <div v-if="content.synopsis" style="background: #131826; border: 1px solid #1e2535; border-radius: 16px; padding: 16px; margin-bottom: 14px;">
                        <div style="font-size: 10px; font-weight: 700; color: #6b738a; margin-bottom: 10px; letter-spacing: 0.08em; text-transform: uppercase;">Sinopse</div>
                        <div
                            style="font-size: 13px; color: #9aa3b8; line-height: 1.75; transition: all 0.2s;"
                            :style="synopsisExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: '4', WebkitBoxOrient: 'vertical', overflow: 'hidden' }"
                        >{{ content.synopsis }}</div>
                        <button
                            style="margin-top: 10px; font-size: 12px; font-weight: 700; color: #5eead4; background: none; border: none; cursor: pointer; padding: 0;"
                            @click="synopsisExpanded = !synopsisExpanded"
                        >{{ synopsisExpanded ? 'Ver menos ↑' : 'Ver mais ↓' }}</button>
                    </div>

                    <!-- Trailer -->
                    <div v-if="content.trailer_embed_url" style="background: #131826; border: 1px solid #1e2535; border-radius: 16px; overflow: hidden; margin-bottom: 14px;">
                        <iframe
                            :src="content.trailer_embed_url"
                            style="width: 100%; aspect-ratio: 16/9; border: none; display: block;"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        />
                    </div>

                    <!-- Alternative names -->
                    <div v-if="content.alternative_names && content.alternative_names.length > 1" style="background: #131826; border: 1px solid #1e2535; border-radius: 16px; padding: 16px; margin-bottom: 14px;">
                        <div style="font-size: 10px; font-weight: 700; color: #6b738a; margin-bottom: 10px; letter-spacing: 0.08em; text-transform: uppercase;">Títulos Alternativos</div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div v-for="(alt, i) in content.alternative_names" :key="i" style="font-size: 13px; color: #9aa3b8;">{{ alt }}</div>
                        </div>
                    </div>

                    <!-- Meta info -->
                    <div v-if="content.original_language || content.origin_type || content.popularity" style="background: #131826; border: 1px solid #1e2535; border-radius: 16px; padding: 16px; margin-bottom: 14px;">
                        <div style="font-size: 10px; font-weight: 700; color: #6b738a; margin-bottom: 10px; letter-spacing: 0.08em; text-transform: uppercase;">Informações</div>
                        <div v-if="content.original_language" :style="metaRowStyle">
                            <span :style="metaKeyStyle">Idioma</span>
                            <span :style="metaValStyle">{{ content.original_language }}</span>
                        </div>
                        <div v-if="content.origin_type" :style="metaRowStyle">
                            <span :style="metaKeyStyle">Origem</span>
                            <span :style="metaValStyle">{{ content.origin_type }}</span>
                        </div>
                        <div v-if="content.popularity" :style="{ ...metaRowStyle, borderBottom: 'none' }">
                            <span :style="metaKeyStyle">Popularidade</span>
                            <span :style="metaValStyle">{{ content.popularity.toLocaleString('pt-BR') }}</span>
                        </div>
                    </div>

                    <!-- ══ MEU REGISTRO (only when in library) ══ -->
                    <div v-if="isInLibrary && userContent" style="background: #131826; border-radius: 18px; padding: 18px; margin-bottom: 16px; border: 1px solid #1e2535;" :style="{ borderLeft: `3px solid ${typeColor}` }">
                        <!-- Section header -->
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
                            <div style="font-size: 15px; font-weight: 800; color: #eef0f5; letter-spacing: -0.01em;">Meu Registro</div>
                            <div v-if="lastUpdateText" style="font-size: 11px; color: #4a5169; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                                <span style="font-size: 10px;">⏱</span> {{ lastUpdateText }}
                            </div>
                        </div>

                        <!-- Status selector -->
                        <div style="margin-bottom: 18px;">
                            <div :style="sectionLabelStyle">Status</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                <div
                                    v-for="s in availableStatuses"
                                    :key="s.value"
                                    style="display: flex; align-items: center; gap: 5px; height: 34px; padding: 0 14px; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s; white-space: nowrap;"
                                    :style="userContent.status === s.value
                                        ? { background: getStatusColor(s.value) + '22', color: getStatusColor(s.value), borderColor: getStatusColor(s.value) + '88' }
                                        : { background: '#1a1f2e', color: '#6b738a', borderColor: '#1e2535' }"
                                    @click="changeStatus(s.value)"
                                >
                                    <span style="width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;" :style="{ background: userContent.status === s.value ? getStatusColor(s.value) : '#4a5169' }" />
                                    {{ s.label }}
                                </div>
                            </div>
                        </div>

                        <!-- Progress — hidden for movie -->
                        <template v-if="!isMovie">
                            <!-- Season (TV / Anime) -->
                            <div v-if="isTv" style="margin-bottom: 18px;">
                                <div :style="sectionLabelStyle">Temporada atual</div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <button :style="stepBtnStyle(false)" :disabled="saving || (userContent.current_season ?? 1) <= 1" @click="decrementSeason">−</button>
                                    <div style="flex: 1; text-align: center;">
                                        <div style="font-size: 40px; font-weight: 900; color: #eef0f5; line-height: 1; letter-spacing: -0.03em;">{{ userContent.current_season ?? 1 }}</div>
                                        <div style="font-size: 11px; color: #4a5169; margin-top: 2px;">de {{ content.total_seasons ?? '?' }}</div>
                                    </div>
                                    <button :style="stepBtnStyle(true)" :disabled="saving" @click="incrementSeason">+</button>
                                </div>
                            </div>

                            <!-- Chapter / Episode -->
                            <div style="margin-bottom: 18px;">
                                <div :style="sectionLabelStyle">{{ isTv || contentType === 'anime' ? 'Episódio atual' : 'Capítulo atual' }}</div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <button :style="stepBtnStyle(false)" :disabled="saving || userContent.current_units <= 0" @click="decrement">−</button>
                                    <div style="flex: 1; text-align: center;">
                                        <IonInput
                                            v-if="editingUnits"
                                            :value="unitsInput"
                                            type="number"
                                            inputmode="numeric"
                                            class="unit-input"
                                            min="0"
                                            :max="content.total_units ?? undefined"
                                            ref="unitsField"
                                            @ionBlur="saveUnits"
                                            @ionInput="unitsInput = Math.min(Number(($event as CustomEvent).detail.value) || 0, content.total_units ?? Infinity)"
                                        />
                                        <div v-else @click="startEditUnits" style="cursor: pointer;">
                                            <div style="font-size: 40px; font-weight: 900; color: #eef0f5; line-height: 1; letter-spacing: -0.03em;">{{ userContent.current_units }}</div>
                                            <div v-if="content.total_units" style="font-size: 11px; color: #4a5169; margin-top: 2px;">de {{ content.total_units }} {{ unitShort }}</div>
                                        </div>
                                    </div>
                                    <button
                                        :style="atLimit ? stepBtnStyleDisabled : stepBtnStyle(true)"
                                        :disabled="saving || atLimit"
                                        @click="increment"
                                    >+</button>
                                </div>
                                <!-- Progress bar -->
                                <div v-if="!isOngoing && content.total_units" style="margin-top: 14px;">
                                    <div style="height: 5px; background: #1e2535; border-radius: 4px; overflow: hidden;">
                                        <div style="height: 100%; border-radius: 4px; transition: width 0.35s;" :style="{ width: progressPct + '%', background: statusColor }" />
                                    </div>
                                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #4a5169; margin-top: 5px;">
                                        <span>{{ userContent.current_units }} / {{ content.total_units }} {{ unitShort }}</span>
                                        <span style="font-weight: 700; color: #6b738a;">{{ progressPct }}%</span>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- Rating 0–10 -->
                        <div style="margin-bottom: 18px;">
                            <div :style="sectionLabelStyle">Minha Avaliação</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 7px;">
                                <div
                                    v-for="n in ratingOptions"
                                    :key="n"
                                    style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s; flex-shrink: 0;"
                                    :style="userContent.rating === n
                                        ? { background: ratingBg(n), color: ratingColor(n), borderColor: ratingBorderColor(n) }
                                        : { background: '#1a1f2e', color: '#6b738a', borderColor: '#1e2535' }"
                                    @click="changeRating(userContent.rating === n ? null : n)"
                                >{{ n }}</div>
                            </div>
                            <div v-if="userContent.rating != null" style="margin-top: 8px; font-size: 12px; color: #9aa3b8; text-align: center;">
                                {{ ratingLabel(userContent.rating) }}
                            </div>
                        </div>

                        <!-- Site -->
                        <div v-if="sites.length">
                            <div :style="sectionLabelStyle">Fonte de leitura</div>
                            <IonSelect
                                v-model="selectedSiteId"
                                :compareWith="compareSiteId"
                                placeholder="Sem fonte"
                                fill="outline"
                                interface="action-sheet"
                                class="neon-select"
                                @ionChange="changeSite"
                            >
                                <IonSelectOption value="">Sem fonte</IonSelectOption>
                                <IonSelectOption v-for="site in sites" :key="site.id" :value="site.id">{{ site.name }}</IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>

                    <!-- Remove button -->
                    <div v-if="isInLibrary && userContent" style="display: flex; justify-content: center; padding-bottom: 4px;">
                        <button
                            class="remove-btn"
                            @click="confirmDelete"
                        >
                            <IonIcon :icon="trashOutline" style="font-size: 13px;" />
                            Remover da biblioteca
                        </button>
                    </div>
                </div>
            </div>

            <!-- Error state -->
            <div v-else-if="!loading" style="text-align: center; padding: 80px 24px;">
                <div style="font-size: 40px; margin-bottom: 14px; opacity: 0.5;">😕</div>
                <div style="font-size: 15px; font-weight: 700; color: #9aa3b8; margin-bottom: 20px;">Conteúdo não encontrado</div>
                <button
                    style="padding: 10px 24px; border-radius: 12px; border: 1px solid #1e2535; background: transparent; color: #6b738a; cursor: pointer; font-size: 13px; font-weight: 700;"
                    @click="$router.back()"
                >Voltar</button>
            </div>

        </IonContent>

        <!-- ── Back button (always visible) ── -->
        <div style="position: fixed; left: 12px; z-index: 200; pointer-events: none;" :style="{ top: 'max(12px, env(safe-area-inset-top, 12px))' }">
            <button
                style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.12); color: #eef0f5; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; pointer-events: all; backdrop-filter: blur(8px);"
                @click="$router.back()"
            >‹</button>
        </div>

        <!-- ── FAB: Add to library (only when NOT in library) ── -->
        <div v-if="content && !isInLibrary && !loading" style="position: fixed; bottom: 0; left: 0; right: 0; padding: 16px 16px max(16px, env(safe-area-inset-bottom, 16px)); background: linear-gradient(to top, #0d1117 70%, transparent); pointer-events: none; z-index: 100;">
            <button
                style="width: 100%; padding: 16px; border-radius: 16px; border: none; background: #5eead4; color: #0d1117; font-size: 16px; font-weight: 800; cursor: pointer; pointer-events: all; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 28px rgba(94,234,212,0.35); transition: all 0.2s;"
                @click="addToLibrary"
            >
                <span style="font-size: 20px; font-weight: 900; line-height: 1;">+</span> Adicionar à Biblioteca
            </button>
        </div>

        <IonLoading :is-open="saving || actionLoading" message="Aguarde..." spinner="crescent" />
    </IonPage>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import {
    IonPage, IonContent, IonIcon, IonLoading,
    IonSelect, IonSelectOption, IonInput,
    toastController, alertController,
} from '@ionic/vue';
import { trashOutline } from 'ionicons/icons';
import {
    contentService, Content, ContentType,
    CONTENT_TYPE_LABELS, CATALOG_STATUS_LABELS, CATALOG_STATUS_COLORS, UNIT_LABEL,
} from '@/services/contentService';
import {
    userContentService, UserContent, ContentStatus, STATUS_LABELS, getStatusLabel,
} from '@/services/userContentService';
import { siteService, Site } from '@/services/siteService';

const TYPE_BADGE_COLOR: Record<ContentType, string> = {
    manga: '#5eead4',
    anime: '#a78bfa',
    novel: '#fbbf24',
    movie: '#f472b6',
    tv:    '#22d3ee',
};

const TYPE_EMOJI: Record<ContentType, string> = {
    manga: '📖',
    anime: '🎬',
    novel: '📝',
    movie: '🎥',
    tv:    '📺',
};

const STATUS_COLORS: Record<ContentStatus, string> = {
    reading:      '#60a5fa',
    completed:    '#34d399',
    paused:       '#fbbf24',
    dropped:      '#f87171',
    plan_to_read: '#a78bfa',
};

const MOVIE_STATUSES: ContentStatus[] = ['plan_to_read', 'reading', 'completed'];

export default defineComponent({
    name: 'CatalogDetailPage',
    components: { IonPage, IonContent, IonIcon, IonLoading, IonSelect, IonSelectOption, IonInput },
    data() {
        return {
            loading: false,
            saving: false,
            actionLoading: false,
            content: null as Content | null,
            userContent: null as UserContent | null,
            sites: [] as Site[],
            editingUnits: false,
            unitsInput: 0,
            selectedSiteId: '' as string | number,
            synopsisExpanded: false,
            ratingOptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            trashOutline,
        };
    },

    computed: {
        contentType(): ContentType { return this.content?.type ?? 'manga'; },
        typeColor(): string { return TYPE_BADGE_COLOR[this.contentType] ?? '#5eead4'; },
        typeLabel(): string { return CONTENT_TYPE_LABELS[this.contentType]; },
        typeEmoji(): string { return TYPE_EMOJI[this.contentType]; },
        typeBadgeStyle(): Record<string, string> {
            const col = this.typeColor;
            return { fontSize: '9px', fontWeight: '800', letterSpacing: '0.07em', color: col, background: col + '1a', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase' };
        },
        genreTagStyle(): Record<string, string> {
            const col = this.typeColor;
            return { fontSize: '11px', fontWeight: '600', color: col + 'cc', background: col + '12', border: `1px solid ${col}28`, padding: '4px 10px', borderRadius: '8px' };
        },
        catStatusLabel(): string {
            const s = this.content?.status;
            return s ? (CATALOG_STATUS_LABELS[s] ?? '') : '';
        },
        catStatusBadgeStyle(): Record<string, string> {
            const s = this.content?.status;
            const col = s ? (CATALOG_STATUS_COLORS[s] ?? '#4a5470') : '#4a5470';
            return { fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em', color: col, background: col + '18', padding: '2px 8px', borderRadius: '20px' };
        },
        isInLibrary(): boolean { return !!(this.content?.is_in_library) || !!this.userContent; },
        isHighScore(): boolean { return (this.content?.score ?? this.content?.rating ?? 0) >= 9; },
        isMovie(): boolean { return this.contentType === 'movie'; },
        isTv(): boolean { return this.contentType === 'tv' || this.contentType === 'anime'; },
        isOngoing(): boolean { return !this.content?.total_units; },
        unitShort(): string { return UNIT_LABEL[this.contentType]?.short ?? 'cap.'; },
        headerImage(): string { return this.content?.background || this.content?.cover || ''; },
        statusColor(): string { return this.userContent ? (STATUS_COLORS[this.userContent.status] ?? '#5a6480') : '#5a6480'; },
        progressPct(): number {
            const total = this.content?.total_units;
            const current = this.userContent?.current_units ?? 0;
            if (!total) return 0;
            return Math.min(Math.round((current / total) * 100), 100);
        },
        atLimit(): boolean {
            const total = this.content?.total_units;
            if (!total) return false;
            return (this.userContent?.current_units ?? 0) >= total;
        },
        availableStatuses(): { value: ContentStatus; label: string }[] {
            const keys: ContentStatus[] = this.isMovie ? MOVIE_STATUSES : (Object.keys(STATUS_LABELS) as ContentStatus[]);
            return keys.map((value) => ({ value, label: getStatusLabel(value, this.contentType) }));
        },
        lastUpdateText(): string {
            if (!this.userContent) return '';
            const date = this.userContent.last_interacted_at ?? this.userContent.last_unit_update ?? this.content?.last_unit_update;
            if (!date) return '';
            const diff = Date.now() - new Date(date).getTime();
            const mins = Math.floor(diff / 60000);
            if (mins < 1) return 'agora';
            if (mins < 60) return `${mins}min atrás`;
            const hours = Math.floor(mins / 60);
            if (hours < 24) return `${hours}h atrás`;
            const days = Math.floor(hours / 24);
            if (days < 7) return `${days}d atrás`;
            if (days < 30) return `${Math.floor(days / 7)}sem atrás`;
            return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        },

        // ── Static style helpers ──
        statCellStyle(): Record<string, string> {
            return { background: '#131826', border: '1px solid #1e2535', borderRadius: '14px', padding: '12px 6px', textAlign: 'center' };
        },
        statLabelStyle(): Record<string, string> {
            return { fontSize: '9px', fontWeight: '600', color: '#6b738a', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '3px' };
        },
        sectionLabelStyle(): Record<string, string> {
            return { fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', color: '#6b738a', textTransform: 'uppercase', marginBottom: '10px' };
        },
        metaRowStyle(): Record<string, string> {
            return { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #1e2535' };
        },
        metaKeyStyle(): Record<string, string> { return { fontSize: '13px', color: '#6b738a' }; },
        metaValStyle(): Record<string, string> { return { fontSize: '13px', fontWeight: '600', color: '#9aa3b8' }; },
        stepBtnStyleDisabled(): Record<string, string> {
            return { width: '52px', height: '52px', borderRadius: '26px', border: '1px solid #1e2535', background: '#1a1f2e', color: '#2a3045', fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'not-allowed', flexShrink: '0' };
        },
    },

    async ionViewWillEnter() {
        this.synopsisExpanded = false;
        await this.loadContent();
    },

    methods: {
        stepBtnStyle(active: boolean): Record<string, string> {
            return {
                width: '52px', height: '52px', borderRadius: '26px', fontSize: '24px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: '0', transition: 'all 0.2s',
                ...(active
                    ? { border: `1px solid ${this.typeColor}`, background: this.typeColor, color: '#0d1117' }
                    : { border: '1px solid #1e2535', background: '#1a1f2e', color: '#eef0f5' }
                ),
            };
        },
        ratingBg(n: number): string {
            if (n >= 9) return 'rgba(94,234,212,0.15)';
            if (n >= 7) return 'rgba(96,165,250,0.15)';
            if (n >= 5) return 'rgba(251,191,36,0.15)';
            return 'rgba(248,113,113,0.12)';
        },
        ratingColor(n: number): string {
            if (n >= 9) return '#5eead4';
            if (n >= 7) return '#60a5fa';
            if (n >= 5) return '#fbbf24';
            return '#f87171';
        },
        ratingBorderColor(n: number): string {
            return this.ratingColor(n) + '55';
        },
        ratingLabel(n: number): string {
            const labels: Record<number, string> = { 0: 'Horrível', 1: 'Muito ruim', 2: 'Ruim', 3: 'Fraco', 4: 'Abaixo da média', 5: 'Mediano', 6: 'Bom', 7: 'Muito bom', 8: 'Ótimo', 9: 'Excelente', 10: 'Obra-prima' };
            return labels[n] ?? '';
        },

        async loadContent() {
            this.loading = true;
            this.content = null;
            this.userContent = null;
            const rawId = this.$route.params.id;
            const id = Number(rawId);

            // Step 1: content is critical — show error state only if this fails
            try {
                this.content = await contentService.getById(id);
            } catch (err) {
                this.content = null;
            }

            if (this.content) {
                // Step 2: userContent — always try, don't rely solely on is_in_library flag
                try {
                    const all = await userContentService.getAll({ content_id: id } as any);
                    // Try matching by content_id (string or number), then by nested content.id,
                    // then fall back to the first item when the backend already filtered by content_id
                    const uc = all.find((u) => Number(u.content_id) === id)
                             ?? all.find((u) => Number(u.content?.id) === id)
                             ?? null;
                    this.userContent = uc ?? null;
                    if (uc) {
                        this.content.is_in_library = true;
                        this.selectedSiteId = uc.user_site?.id
                            ? String(uc.user_site.id)
                            : uc.site?.id ? String(uc.site.id) : '';
                        // Fill catalog fields that the detail endpoint may omit
                        // but the /user-contents endpoint eagerly loads on the nested content
                        if (uc.content) {
                            const src = uc.content;
                            if (!this.content.total_units   && src.total_units)   this.content.total_units   = src.total_units;
                            if (!this.content.total_seasons && src.total_seasons) this.content.total_seasons = src.total_seasons;
                            if (!this.content.genres?.length && src.genres?.length) this.content.genres     = src.genres;
                            if (!this.content.synopsis      && src.synopsis)      this.content.synopsis      = src.synopsis;
                            if (!this.content.cover         && src.cover)         this.content.cover         = src.cover;
                            if (!this.content.background    && src.background)    this.content.background    = src.background;
                            if (src.rating   != null && this.content.rating   == null) this.content.rating   = src.rating;
                            if (src.score    != null && this.content.score    == null) this.content.score    = src.score;
                        }
                    }
                } catch {
                    this.userContent = null;
                }

                // Step 3: sites are non-critical, don't block render
                siteService.getAll()
                    .then((s) => { this.sites = Array.isArray(s) ? s : []; })
                    .catch(() => { this.sites = []; });
            }

            this.loading = false;
        },

        patchUserContent(updated: UserContent) {
            if (updated.content === undefined && this.userContent?.content) updated.content = this.userContent.content;
            if (updated.site === undefined && this.userContent?.site) updated.site = this.userContent.site;
            this.userContent = updated;
        },

        getStatusColor(status: ContentStatus): string { return STATUS_COLORS[status] ?? '#5a6480'; },
        compareSiteId: (o1: any, o2: any) => Number(o1) === Number(o2),

        formatVotes(v: number): string {
            if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
            if (v >= 1_000) return (v / 1_000).toFixed(1) + 'k';
            return v.toLocaleString('pt-BR');
        },

        async increment() {
            if (!this.userContent) return;
            this.saving = true;
            try { this.patchUserContent(await userContentService.increment(this.userContent.id)); }
            catch (err: any) { await this.showError(err?.response?.data?.message ?? 'Falha ao atualizar progresso.'); }
            finally { this.saving = false; }
        },

        async decrement() {
            if (!this.userContent || this.userContent.current_units <= 0) return;
            this.saving = true;
            try { this.patchUserContent(await userContentService.update(this.userContent.id, { current_units: this.userContent.current_units - 1 })); }
            catch { await this.showError('Falha ao atualizar progresso.'); }
            finally { this.saving = false; }
        },

        async incrementSeason() {
            if (!this.userContent) return;
            this.saving = true;
            try { this.patchUserContent(await userContentService.update(this.userContent.id, { current_season: (this.userContent.current_season ?? 1) + 1 })); }
            catch { await this.showError('Falha ao atualizar temporada.'); }
            finally { this.saving = false; }
        },

        async decrementSeason() {
            if (!this.userContent || (this.userContent.current_season ?? 1) <= 1) return;
            this.saving = true;
            try { this.patchUserContent(await userContentService.update(this.userContent.id, { current_season: (this.userContent.current_season ?? 1) - 1 })); }
            catch { await this.showError('Falha ao atualizar temporada.'); }
            finally { this.saving = false; }
        },

        async startEditUnits() {
            if (!this.userContent) return;
            this.unitsInput = this.userContent.current_units;
            this.editingUnits = true;
            await nextTick();
            (this.$refs.unitsField as any)?.$el?.querySelector('input')?.focus();
        },

        async saveUnits() {
            if (!this.userContent) return;
            this.editingUnits = false;
            if (this.unitsInput === this.userContent.current_units) return;
            this.saving = true;
            try { this.patchUserContent(await userContentService.update(this.userContent.id, { current_units: this.unitsInput })); }
            catch { await this.showError('Falha ao salvar progresso.'); }
            finally { this.saving = false; }
        },

        async changeStatus(status: ContentStatus) {
            if (!this.userContent || this.userContent.status === status) return;
            this.saving = true;
            try { this.patchUserContent(await userContentService.update(this.userContent.id, { status })); }
            catch { await this.showError('Falha ao atualizar status.'); }
            finally { this.saving = false; }
        },

        async changeRating(value: number | null) {
            if (!this.userContent) return;
            this.saving = true;
            try { this.patchUserContent(await userContentService.update(this.userContent.id, { rating: value ?? undefined })); }
            catch { await this.showError('Falha ao salvar avaliação.'); }
            finally { this.saving = false; }
        },

        async changeSite() {
            if (!this.userContent) return;
            this.saving = true;
            try {
                this.patchUserContent(await userContentService.update(this.userContent.id, {
                    site_id: this.selectedSiteId ? Number(this.selectedSiteId) : undefined,
                }));
            }
            catch { await this.showError('Falha ao atualizar fonte.'); }
            finally { this.saving = false; }
        },

        async confirmDelete() {
            const alert = await alertController.create({
                header: 'Remover',
                message: 'Remover este item da sua biblioteca?',
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Remover', role: 'destructive', handler: () => this.deleteItem() },
                ],
            });
            await alert.present();
        },

        async deleteItem() {
            if (!this.userContent) return;
            this.saving = true;
            try {
                await userContentService.delete(this.userContent.id);
                this.userContent = null;
                if (this.content) this.content.is_in_library = false;
                const toast = await toastController.create({ message: 'Removido da biblioteca.', duration: 2000, color: 'success', position: 'top' });
                await toast.present();
            }
            catch { await this.showError('Falha ao remover.'); }
            finally { this.saving = false; }
        },

        addToLibrary() {
            if (!this.content) return;
            this.$router.push({ path: '/tabs/add', query: { content_id: this.content.id } });
        },

        async showError(msg: string) {
            const toast = await toastController.create({ message: msg, duration: 2000, color: 'danger', position: 'top' });
            await toast.present();
        },
    },
});
</script>

<style scoped>
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
}

.unit-input {
    --background: transparent;
    --color: #eef0f5;
    --highlight-color-focused: #5eead4;
    --border-color: #5eead4;
    --padding-start: 0;
    --padding-end: 0;
    font-size: 40px;
    font-weight: 900;
    text-align: center;
    width: 100%;
}

.neon-select {
    --background: #1a1f2e;
    --color: #eef0f5;
    --placeholder-color: #6b738a;
    --border-color: #1e2535;
    --border-radius: 12px;
    --highlight-color-focused: #5eead4;
    --padding-start: 14px;
    --padding-end: 14px;
    min-height: 48px;
    width: 100%;
}

.remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: #4a5169;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 10px;
    transition: color 0.15s;
}
.remove-btn:hover { color: #ef4444; }

button:disabled { opacity: 0.38; cursor: not-allowed; }
</style>
