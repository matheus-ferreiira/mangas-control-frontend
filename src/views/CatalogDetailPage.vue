<template>
    <IonPage>
        <IonContent :fullscreen="true">

            <!-- ══ SKELETON LOADER ══ -->
            <template v-if="loading">
                <!-- Hero skeleton -->
                <div style="position: relative; height: 300px; background: rgba(255,255,255,0.025); animation: pulse 1.4s ease-in-out infinite;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(5,7,11,0.95) 100%);" />
                    <div style="position: absolute; bottom: 18px; left: 16px; right: 16px;">
                        <div style="display: flex; gap: 6px; margin-bottom: 10px;">
                            <div style="width: 44px; height: 18px; border-radius: 20px; background: rgba(255,255,255,0.06);" />
                            <div style="width: 60px; height: 18px; border-radius: 20px; background: rgba(255,255,255,0.06);" />
                        </div>
                        <div style="height: 26px; width: 75%; border-radius: 8px; background: rgba(255,255,255,0.06); margin-bottom: 8px;" />
                        <div style="height: 14px; width: 50%; border-radius: 6px; background: rgba(255,255,255,0.06);" />
                    </div>
                </div>
                <!-- Back button always visible -->
                <div style="position: fixed; left: 12px; z-index: 200;" :style="{ top: 'max(12px, env(safe-area-inset-top, 12px))' }">
                    <button style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #e9edf2; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;" @click="$router.back()">‹</button>
                </div>
                <!-- Skeleton body -->
                <div style="padding: 16px 16px 80px;">
                    <div style="display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 18px;">
                        <div v-for="i in 4" :key="i" style="height: 64px; border-radius: 14px; background: rgba(255,255,255,0.04); animation: pulse 1.4s ease-in-out infinite;" />
                    </div>
                    <div style="display: flex; gap: 6px; margin-bottom: 18px;">
                        <div v-for="i in 4" :key="i" :style="{ width: `${40 + i * 12}px`, height: '26px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.4s ease-in-out infinite' }" />
                    </div>
                    <div style="height: 120px; border-radius: 16px; background: rgba(255,255,255,0.04); animation: pulse 1.4s ease-in-out infinite;" />
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
                    <div v-else style="width: 100%; height: 100%; background: linear-gradient(135deg, rgba(245,166,35,0.08), rgba(255,255,255,0.02)); display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 80px; opacity: 0.12;">{{ typeEmoji }}</span>
                    </div>
                    <!-- Gradient overlay -->
                    <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(5,7,11,0.1) 0%, rgba(5,7,11,0.6) 55%, rgba(5,7,11,1) 100%);" />
                    <!-- Title area -->
                    <div style="position: absolute; bottom: 18px; left: 16px; right: 16px;">
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
                            <span :style="typeBadgeStyle">{{ typeLabel }}</span>
                            <span v-if="catStatusLabel" :style="catStatusBadgeStyle">{{ catStatusLabel }}</span>
                            <span v-if="content.is_adult" style="font-size: 9px; font-weight: 800; color: #FF5E5E; background: rgba(239,107,107,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">+18</span>
                            <span v-if="content.age_rating && !content.is_adult" style="font-size: 9px; font-weight: 700; color: rgba(233,237,242,0.62); background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 20px;">{{ content.age_rating }}</span>
                            <span v-if="isHighScore" style="font-size: 9px; font-weight: 800; color: #F5C542; background: rgba(230,184,92,0.15); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">TOP</span>
                            <span v-if="isInLibrary" style="font-size: 9px; font-weight: 800; color: #f5a623; background: rgba(245,166,35,0.12); padding: 2px 6px; border-radius: 20px; letter-spacing: 0.04em;">✓ Na lista</span>
                        </div>
                        <h1 style="font-size: 24px; font-weight: 800; color: #e9edf2; margin: 0; line-height: 1.2; letter-spacing: -0.03em; font-family: 'Sora', system-ui, sans-serif;">{{ content.name }}</h1>
                        <div v-if="content.tagline" style="font-size: 12px; color: rgba(233,237,242,0.62); margin-top: 5px; font-style: italic; line-height: 1.4;">{{ content.tagline }}</div>
                        <div v-else-if="content.alternative_names?.length" style="font-size: 12px; color: rgba(233,237,242,0.42); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            {{ content.alternative_names[0] }}
                        </div>
                    </div>
                </div>

                <div style="padding: 16px 16px 140px;">
                    <!-- Stats row — airy, hairline dividers -->
                    <div style="display: flex; align-items: stretch; margin-bottom: 18px; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; flex-wrap: wrap;">
                        <!-- Minha Nota — só quando o usuário avaliou -->
                        <div v-if="userContent && userContent.rating != null" style="flex: 1; min-width: 64px; padding: 14px 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06);">
                            <div style="font-size: 18px; font-weight: 800; color: #F5C542; font-family: 'Sora', system-ui, sans-serif;">★ {{ userContent.rating }}</div>
                            <div :style="statLabelStyle">Minha Nota</div>
                        </div>
                        <!-- Score da comunidade (API) -->
                        <div v-if="communityScore != null" style="flex: 1; min-width: 64px; padding: 14px 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06);">
                            <div style="font-size: 18px; font-weight: 800; color: #f5a623; font-family: 'Sora', system-ui, sans-serif;">{{ communityScore }}</div>
                            <div :style="statLabelStyle">Score</div>
                            <div style="font-size: 8px; font-weight: 600; color: rgba(233,237,242,0.28); text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2px;">comunidade</div>
                        </div>
                        <div v-if="content.release_year" style="flex: 1; min-width: 60px; padding: 14px 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06);">
                            <div style="font-size: 18px; font-weight: 800; color: #e9edf2; font-family: 'Sora', system-ui, sans-serif;">{{ content.release_year }}</div>
                            <div :style="statLabelStyle">Ano</div>
                        </div>
                        <div v-if="isMovie && content.duration_formatted" style="flex: 1; min-width: 60px; padding: 14px 6px; text-align: center;">
                            <div style="font-size: 14px; font-weight: 800; color: #e9edf2;">{{ content.duration_formatted }}</div>
                            <div :style="statLabelStyle">Duração</div>
                        </div>
                        <div v-else-if="isTv && content.total_seasons" style="flex: 1; min-width: 60px; padding: 14px 6px; text-align: center;">
                            <div style="font-size: 18px; font-weight: 800; color: #e9edf2; font-family: 'Sora', system-ui, sans-serif;">{{ content.total_seasons }}</div>
                            <div :style="statLabelStyle">Temp.</div>
                        </div>
                        <div v-else-if="content.total_units" style="flex: 1; min-width: 60px; padding: 14px 6px; text-align: center;">
                            <div style="font-size: 18px; font-weight: 800; color: #e9edf2; font-family: 'Sora', system-ui, sans-serif;">{{ content.total_units }}</div>
                            <div :style="statLabelStyle">{{ unitShort }}</div>
                        </div>
                        <div v-if="content.country" style="flex: 1; min-width: 60px; padding: 14px 6px; text-align: center; border-left: 1px solid rgba(255,255,255,0.06);">
                            <div style="font-size: 14px; font-weight: 800; color: #e9edf2;">{{ content.country }}</div>
                            <div :style="statLabelStyle">País</div>
                        </div>
                    </div>

                    <!-- ══ MEU REGISTRO — topo da página p/ ação rápida (only when in library) ══ -->
                    <div v-if="isInLibrary && userContent" style="background: var(--bg-secondary); border-radius: 16px; padding: 18px; margin-bottom: 18px; border: 1px solid var(--border-default);">
                        <!-- Section header -->
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                            <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.01em;">Meu Registro</div>
                            <div v-if="lastUpdateText" style="font-size: 11px; color: var(--text-muted); font-weight: 600; display: flex; align-items: center; gap: 4px;">
                                <span style="font-size: 10px;">⏱</span> {{ lastUpdateText }}
                            </div>
                        </div>

                        <!-- Novo capítulo disponível -->
                        <button
                            v-if="hasNewChapter"
                            type="button"
                            style="width: 100%; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border-radius: 10px; border: 1px solid var(--dot-new); background: rgba(74,222,128,0.10); color: var(--dot-new); font-size: 13px; font-weight: 700; cursor: pointer;"
                            @click="openSite"
                        >
                            <IonIcon :icon="sparklesOutline" style="font-size: 15px;" />
                            Cap. {{ userContent.site_last_chapter }} disponível
                            <IonIcon v-if="siteLink" :icon="openOutline" style="font-size: 14px; opacity: 0.8;" />
                        </button>

                        <!-- Status selector — só fundo muda (DESIGN_SYSTEM §5.2) -->
                        <div style="margin-bottom: 18px;">
                            <div :style="sectionLabelStyle">Status</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                <button
                                    v-for="s in availableStatuses"
                                    :key="s.value"
                                    class="status-btn"
                                    :class="{ active: userContent.status === s.value }"
                                    @click="changeStatus(s.value)"
                                >{{ s.label }}</button>
                            </div>
                        </div>

                        <!-- Progress — hidden for movie -->
                        <template v-if="!isMovie">
                            <!-- Season (TV apenas) — anime usa entradas separadas por temporada -->
                            <div v-if="contentType === 'tv'" style="margin-bottom: 16px; width: 100%;">
                                <div :style="sectionLabelStyle">Temporada atual</div>
                                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                    <button :style="stepBtnStyle(false)" :disabled="saving || (userContent.current_season ?? 1) <= 1" @click="decrementSeason">−</button>
                                    <div style="flex: 1; text-align: center;">
                                        <div style="font-size: 2.5rem; font-weight: 700; color: var(--text-primary); line-height: 1;">{{ userContent.current_season ?? 1 }}</div>
                                        <span style="display: block; text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">de {{ content.total_seasons ?? '?' }} temp.</span>
                                    </div>
                                    <button :style="atSeasonLimit ? stepBtnStyleDisabled : stepBtnStyle(true)" :disabled="saving || atSeasonLimit" @click="incrementSeason">+</button>
                                </div>
                            </div>

                            <!-- Chapter / Episode — 100% largura -->
                            <div style="margin-bottom: 18px; width: 100%;">
                                <div :style="sectionLabelStyle">{{ isTv || contentType === 'anime' ? 'Episódio atual' : 'Capítulo atual' }}</div>
                                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                    <button :style="stepBtnStyle(false)" :disabled="saving || userContent.current_units <= 0" @click="decrement">−</button>
                                    <div style="flex: 1; text-align: center; min-width: 0;">
                                        <IonInput
                                            v-if="editingUnits"
                                            :value="unitsInput"
                                            type="number"
                                            inputmode="numeric"
                                            class="unit-input"
                                            min="0"
                                            :max="seasonUnitLimit ?? undefined"
                                            ref="unitsField"
                                            @ionBlur="saveUnits"
                                            @ionInput="unitsInput = Math.min(Number(($event as CustomEvent).detail.value) || 0, seasonUnitLimit ?? Infinity)"
                                        />
                                        <div v-else @click="startEditUnits" style="cursor: pointer;">
                                            <div style="font-size: 2.5rem; font-weight: 700; color: var(--text-primary); line-height: 1;">{{ userContent.current_units }}</div>
                                            <span v-if="seasonUnitLimit" style="display: block; text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">de {{ seasonUnitLimit }} {{ unitShort }}</span>
                                            <span v-else style="display: block; text-align: center; font-size: 0.7rem; color: var(--text-muted); font-style: italic; margin-top: 4px;">em andamento</span>
                                        </div>
                                    </div>
                                    <button
                                        :style="atLimit ? stepBtnStyleDisabled : stepBtnStyle(true)"
                                        :disabled="saving || atLimit"
                                        @click="increment"
                                    >+</button>
                                </div>
                                <!-- Progress bar (100% largura, 4px, laranja) -->
                                <div v-if="!isOngoing && seasonUnitLimit" style="margin-top: 12px; width: 100%;">
                                    <div style="height: 4px; background: var(--border-default); border-radius: 4px; overflow: hidden;">
                                        <div style="height: 100%; border-radius: 4px; transition: width 0.35s; background: var(--accent-primary);" :style="{ width: progressPct + '%' }" />
                                    </div>
                                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 5px;">
                                        <span>{{ userContent.current_units }} / {{ seasonUnitLimit }} {{ unitShort }}</span>
                                        <span style="font-weight: 700; color: var(--text-secondary);">{{ progressPct }}%</span>
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
                                    style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s; flex-shrink: 0;"
                                    :style="userContent.rating === n
                                        ? { background: ratingBg(n), color: ratingColor(n), borderColor: ratingBorderColor(n) }
                                        : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }"
                                    @click="changeRating(userContent.rating === n ? null : n)"
                                >{{ n }}</div>
                            </div>
                            <div v-if="userContent.rating != null" style="margin-top: 8px; font-size: 12px; color: var(--text-secondary); text-align: center;">
                                {{ ratingLabel(userContent.rating) }}
                            </div>
                        </div>

                        <!-- Site -->
                        <div v-if="sites.length" style="margin-bottom: 18px;">
                            <div :style="sectionLabelStyle">Fonte de leitura</div>
                            <SourceSelect :model-value="selectedSiteId" :sites="sites" @update:model-value="onSiteChange" />
                        </div>

                        <!-- Título no site de leitura (verificação de capítulos) -->
                        <div v-if="!isMovie">
                            <div :style="sectionLabelStyle">Título no site de leitura</div>
                            <input
                                :value="userContent.site_title ?? ''"
                                type="text"
                                placeholder="Ex: Nano Machine, Reborn Rich"
                                style="width: 100%; box-sizing: border-box; background: var(--bg-tertiary); border: 1px solid var(--border-default); border-radius: 12px; padding: 12px 14px; font-size: 14px; color: var(--text-primary); outline: none;"
                                @change="changeSiteTitle(($event.target as HTMLInputElement).value)"
                            />
                            <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.4;">Para verificação automática de novos capítulos</div>
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
                    <div v-if="content.studios?.length" style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 14px 16px; margin-bottom: 14px;">
                        <div style="font-size: 10px; font-weight: 800; color: rgba(233,237,242,0.42); margin-bottom: 10px; letter-spacing: 0.22em; text-transform: uppercase;">
                            {{ content.type === 'manga' ? 'Autores' : 'Estúdios' }}
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <span
                                v-for="s in content.studios"
                                :key="s"
                                style="font-size: 12px; font-weight: 600; color: rgba(233,237,242,0.62); background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); padding: 4px 12px; border-radius: 8px;"
                            >{{ s }}</span>
                        </div>
                    </div>

                    <!-- Networks (TV) -->
                    <div v-if="content.networks?.length" style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 14px 16px; margin-bottom: 14px;">
                        <div style="font-size: 10px; font-weight: 800; color: rgba(233,237,242,0.42); margin-bottom: 10px; letter-spacing: 0.22em; text-transform: uppercase;">Plataformas</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <span
                                v-for="n in content.networks"
                                :key="n"
                                style="font-size: 12px; font-weight: 700; color: #B8A4FF; background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.2); padding: 4px 12px; border-radius: 8px;"
                            >{{ n }}</span>
                        </div>
                    </div>

                    <!-- Demographics + Themes (Jikan) -->
                    <div v-if="content.demographics?.length || content.themes?.length" style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 14px 16px; margin-bottom: 14px;">
                        <div v-if="content.demographics?.length" :style="{ marginBottom: content.themes?.length ? '12px' : '0' }">
                            <div style="font-size: 10px; font-weight: 800; color: rgba(233,237,242,0.42); margin-bottom: 8px; letter-spacing: 0.22em; text-transform: uppercase;">Público</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                <span
                                    v-for="d in content.demographics"
                                    :key="d"
                                    style="font-size: 12px; font-weight: 700; color: #f5a623; background: rgba(245,166,35,0.10); border: 1px solid rgba(245,166,35,0.2); padding: 4px 12px; border-radius: 8px;"
                                >{{ d }}</span>
                            </div>
                        </div>
                        <div v-if="content.themes?.length" :style="{ marginTop: content.demographics?.length ? '12px' : '0' }">
                            <div style="font-size: 10px; font-weight: 800; color: rgba(233,237,242,0.42); margin-bottom: 8px; letter-spacing: 0.22em; text-transform: uppercase;">Temas</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                <span
                                    v-for="t in content.themes"
                                    :key="t"
                                    style="font-size: 12px; font-weight: 600; color: rgba(233,237,242,0.62); background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); padding: 4px 10px; border-radius: 8px;"
                                >{{ t }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Synopsis -->
                    <div v-if="content.synopsis" style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px; margin-bottom: 14px;">
                        <div style="font-size: 10px; font-weight: 800; color: rgba(233,237,242,0.42); margin-bottom: 10px; letter-spacing: 0.22em; text-transform: uppercase;">Sinopse</div>
                        <div
                            style="font-size: 13px; color: rgba(233,237,242,0.62); line-height: 1.75; transition: all 0.2s;"
                            :style="synopsisExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: '4', WebkitBoxOrient: 'vertical', overflow: 'hidden' }"
                        >{{ content.synopsis }}</div>
                        <button
                            style="margin-top: 10px; font-size: 12px; font-weight: 700; color: #f5a623; background: none; border: none; cursor: pointer; padding: 0;"
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
                    <div v-if="content.alternative_names && content.alternative_names.length > 1" style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px; margin-bottom: 14px;">
                        <div style="font-size: 10px; font-weight: 800; color: rgba(233,237,242,0.42); margin-bottom: 10px; letter-spacing: 0.22em; text-transform: uppercase;">Títulos Alternativos</div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div v-for="(alt, i) in content.alternative_names" :key="i" style="font-size: 13px; color: #9aa3b8;">{{ alt }}</div>
                        </div>
                    </div>

                    <!-- Meta info -->
                    <div v-if="content.original_language || content.origin_type || content.popularity" style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px; margin-bottom: 14px;">
                        <div style="font-size: 10px; font-weight: 800; color: rgba(233,237,242,0.42); margin-bottom: 10px; letter-spacing: 0.22em; text-transform: uppercase;">Informações</div>
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
        <div v-if="content && !isInLibrary && !loading" style="position: fixed; bottom: 0; left: 0; right: 0; padding: 16px 16px max(16px, env(safe-area-inset-bottom, 16px)); background: linear-gradient(to top, #05070b 70%, transparent); pointer-events: none; z-index: 100;">
            <button
                style="width: 100%; padding: 16px; border-radius: 16px; border: none; background: #f5a623; color: #050608; font-size: 16px; font-weight: 800; cursor: pointer; pointer-events: all; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 28px rgba(245,166,35,0.33); transition: all 0.2s;"
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
    IonInput,
    toastController, alertController,
} from '@ionic/vue';
import SourceSelect from '@/components/SourceSelect.vue';
import { trashOutline, sparklesOutline, openOutline } from 'ionicons/icons';
import {
    contentService, Content, ContentType,
    CONTENT_TYPE_LABELS, CATALOG_STATUS_LABELS, CATALOG_STATUS_COLORS, UNIT_LABEL,
} from '@/services/contentService';
import {
    userContentService, UserContent, ContentStatus, STATUS_LABELS, getStatusLabel,
} from '@/services/userContentService';
import { userSiteService, UserSite } from '@/services/userSiteService';

const TYPE_BADGE_COLOR: Record<ContentType, string> = {
    manga: '#f5a623',
    anime: '#B8A4FF',
    novel: '#fbbf24',
    movie: '#f472b6',
    tv:    '#7CAEFF',
};

const TYPE_EMOJI: Record<ContentType, string> = {
    manga: '📖',
    anime: '🎬',
    novel: '📝',
    movie: '🎥',
    tv:    '📺',
};

const STATUS_COLORS: Record<ContentStatus, string> = {
    reading:      '#f5a623',
    completed:    '#4ade80',
    paused:       '#F5C542',
    dropped:      '#FF5E5E',
    plan_to_read: '#B8A4FF',
};

const MOVIE_STATUSES: ContentStatus[] = ['plan_to_read', 'reading', 'completed'];

export default defineComponent({
    name: 'CatalogDetailPage',
    components: { IonPage, IonContent, IonIcon, IonLoading, IonInput, SourceSelect },
    data() {
        return {
            loading: false,
            saving: false,
            actionLoading: false,
            content: null as Content | null,
            userContent: null as UserContent | null,
            sites: [] as UserSite[],
            editingUnits: false,
            unitsInput: 0,
            selectedSiteId: null as number | null,
            synopsisExpanded: false,
            ratingOptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            trashOutline,
            sparklesOutline,
            openOutline,
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
        // Nota da comunidade vinda da API (score; cai para rating quando ausente).
        // Após a migração AniList, score == rating — exibimos um único campo para evitar redundância.
        communityScore(): string | null {
            const raw = this.content?.score ?? this.content?.rating;
            if (raw == null) return null;
            return Number.isInteger(raw) ? String(raw) : raw.toFixed(1);
        },
        isHighScore(): boolean { return (this.content?.score ?? this.content?.rating ?? 0) >= 9; },
        isMovie(): boolean { return this.contentType === 'movie'; },
        isTv(): boolean { return this.contentType === 'tv' || this.contentType === 'anime'; },
        isOngoing(): boolean { return !this.content?.total_units; },
        unitShort(): string { return UNIT_LABEL[this.contentType]?.short ?? 'cap.'; },
        headerImage(): string { return this.content?.background || this.content?.cover || ''; },
        statusColor(): string { return this.userContent ? (STATUS_COLORS[this.userContent.status] ?? '#5a6480') : '#5a6480'; },
        progressPct(): number {
            const total = this.seasonUnitLimit;
            const current = this.userContent?.current_units ?? 0;
            if (!total) return 0;
            return Math.min(Math.round((current / total) * 100), 100);
        },
        seasonUnitLimit(): number | null {
            const seasonEpisodes = this.content?.season_episodes;
            if (this.contentType === 'tv' && seasonEpisodes) {
                const season = this.userContent?.current_season ?? 1;
                return seasonEpisodes[String(season)] ?? this.content?.total_units ?? null;
            }
            return this.content?.total_units ?? null;
        },
        atLimit(): boolean {
            const seasonEpisodes = this.content?.season_episodes;
            if (this.contentType === 'tv' && seasonEpisodes) {
                const season = this.userContent?.current_season ?? 1;
                const limit = seasonEpisodes[String(season)];
                if (limit) return (this.userContent?.current_units ?? 0) >= limit;
            }
            const total = this.content?.total_units;
            if (!total) return false;
            return (this.userContent?.current_units ?? 0) >= total;
        },
        atSeasonLimit(): boolean {
            const total = this.content?.total_seasons;
            if (!total) return false;
            return (this.userContent?.current_season ?? 1) >= total;
        },
        hasNewChapter(): boolean {
            const last = this.userContent?.site_last_chapter;
            if (last == null || last === '') return false;
            return parseFloat(String(last).replace(',', '.')) > (this.userContent?.current_units ?? 0);
        },
        siteLink(): string | null {
            return this.userContent?.user_site?.url ?? null;
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
            return { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '12px 6px', textAlign: 'center' };
        },
        statLabelStyle(): Record<string, string> {
            return { fontSize: '9px', fontWeight: '700', color: 'rgba(233,237,242,0.42)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: '4px' };
        },
        sectionLabelStyle(): Record<string, string> {
            return { fontSize: '10px', fontWeight: '800', letterSpacing: '0.22em', color: 'rgba(233,237,242,0.42)', textTransform: 'uppercase', marginBottom: '10px' };
        },
        metaRowStyle(): Record<string, string> {
            return { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' };
        },
        metaKeyStyle(): Record<string, string> { return { fontSize: '13px', color: 'rgba(233,237,242,0.42)' }; },
        metaValStyle(): Record<string, string> { return { fontSize: '13px', fontWeight: '600', color: 'rgba(233,237,242,0.62)' }; },
        stepBtnStyleDisabled(): Record<string, string> {
            return { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#3a3a3a', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'not-allowed', flexShrink: '0' };
        },
    },

    async ionViewWillEnter() {
        this.synopsisExpanded = false;
        await this.loadContent();
    },

    methods: {
        // Controles +/- (DESIGN_SYSTEM §5.3): 36×36, neutros, sem cor por status
        stepBtnStyle(_active: boolean): Record<string, string> {
            return {
                width: '36px', height: '36px', borderRadius: '6px', fontSize: '18px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: '0', transition: 'all 0.15s',
                border: '1px solid #3a3a3a', background: '#242424', color: '#f0f0f0',
            };
        },
        ratingBg(n: number): string {
            if (n >= 9) return 'rgba(245,166,35,0.15)';
            if (n >= 7) return 'rgba(125,167,255,0.15)';
            if (n >= 5) return 'rgba(230,184,92,0.15)';
            return 'rgba(239,107,107,0.12)';
        },
        ratingColor(n: number): string {
            if (n >= 9) return '#f5a623';
            if (n >= 7) return '#7CAEFF';
            if (n >= 5) return '#F5C542';
            return '#FF5E5E';
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
                        this.selectedSiteId = uc.user_site?.id ?? null;
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
                userSiteService.getAll()
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
        onSiteChange(val: number | null) {
            this.selectedSiteId = val;
            this.changeSite();
        },
        openSite() {
            if (this.siteLink) window.open(this.siteLink, '_blank');
        },
        async changeSiteTitle(val: string) {
            if (!this.userContent) return;
            const v = val.trim();
            if ((this.userContent.site_title ?? '') === v) return;
            this.saving = true;
            try { this.patchUserContent(await userContentService.update(this.userContent.id, { site_title: v || null })); }
            catch { await this.showError('Falha ao salvar o título do site.'); }
            finally { this.saving = false; }
        },

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
            if (!this.userContent || this.atSeasonLimit) return;
            this.saving = true;
            try { this.patchUserContent(await userContentService.update(this.userContent.id, { current_season: (this.userContent.current_season ?? 1) + 1, current_units: 0 })); }
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

            // Auto-preenchimento ao marcar como Completo (espelhado no backend).
            // TV com episódios por temporada: usa a última temporada; senão, total geral.
            const payload: Partial<Pick<UserContent, 'status' | 'current_units' | 'current_season'>> = { status };
            if (status === 'completed' && this.content) {
                const c = this.content;
                if (c.total_seasons) payload.current_season = c.total_seasons;
                const lastKey = String(c.total_seasons ?? 1);
                const lastEps = c.season_episodes?.[lastKey];
                if (c.type === 'tv' && lastEps != null) {
                    payload.current_units = lastEps;
                } else if (c.total_units != null) {
                    payload.current_units = c.total_units;
                }
            }

            try {
                this.patchUserContent(await userContentService.update(this.userContent.id, payload));
                if (status === 'completed' && payload.current_units != null) {
                    await this.showSuccess(`✓ Marcado como completo — ${this.unitShort} ${payload.current_units}/${payload.current_units}`);
                }
            }
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
                    user_site_id: this.selectedSiteId ? Number(this.selectedSiteId) : null,
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

        async showSuccess(msg: string) {
            const toast = await toastController.create({ message: msg, duration: 2500, color: 'success', position: 'top' });
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
    --color: #e9edf2;
    --highlight-color-focused: #f5a623;
    --border-color: #f5a623;
    --padding-start: 0;
    --padding-end: 0;
    font-size: 40px;
    font-weight: 900;
    text-align: center;
    width: 100%;
}

.neon-select {
    --background: rgba(255,255,255,0.025);
    --color: #e9edf2;
    --placeholder-color: rgba(233,237,242,0.42);
    --border-color: rgba(255,255,255,0.06);
    --border-radius: 12px;
    --highlight-color-focused: #f5a623;
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
    color: rgba(233,237,242,0.28);
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 10px;
    transition: color 0.15s;
}
.remove-btn:hover { color: #FF5E5E; }

/* Botões de status — só fundo muda, sem borda colorida (DESIGN_SYSTEM §5.2) */
.status-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    border: 1px solid var(--border-default);
    background: var(--bg-secondary);
    color: var(--text-secondary);
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.status-btn.active {
    background: var(--accent-primary);
    color: #0f0f0f;
    border-color: var(--accent-primary);
}

button:disabled { opacity: 0.38; cursor: not-allowed; }
</style>
