<template>
    <IonPage>
        <IonContent :fullscreen="true" @ionScroll="onScroll">
            <div style="padding-bottom: 100px; background: #0d1117; min-height: 100%;">
                <!-- Header -->
                <div style="padding: 20px 18px 12px; background: #0d1117; position: sticky; top: 0; z-index: 10;">
                    <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: 11px; color: #6b738a; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 2px;">DESCOBRIR</div>
                            <div style="font-size: 24px; font-weight: 900; color: #eef0f5; letter-spacing: -0.03em; line-height: 1.1;">Explorar</div>
                        </div>
                        <button
                            v-if="isAdmin"
                            style="width: 34px; height: 34px; border-radius: 10px; border: 1px solid #262d40; background: transparent; color: #6b738a; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; margin-bottom: 2px;"
                            @click="$router.push('/manage-contents')"
                        >⚙</button>
                    </div>

                    <!-- Search bar -->
                    <div style="position: relative; display: flex; align-items: center;">
                        <span style="position: absolute; left: 13px; color: #6b738a; pointer-events: none; display: flex; align-items: center;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                        </span>
                        <input
                            :value="query"
                            placeholder="Buscar animes, mangás, filmes..."
                            style="width: 100%; padding: 10px 36px 10px 36px; border-radius: 12px; border: 1px solid #262d40; background: #1a1f2e; color: #eef0f5; font-size: 13px; outline: none; box-sizing: border-box; transition: border-color 0.2s;"
                            @input="onSearchInput"
                        />
                        <button
                            v-if="query"
                            style="position: absolute; right: 8px; width: 24px; height: 24px; border-radius: 12px; border: none; background: transparent; color: #6b738a; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                            @click="clearQuery"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Type filter chips -->
                <div class="no-scrollbar" style="overflow-x: auto; padding: 0 18px 12px;">
                    <div style="display: flex; gap: 6px; min-width: max-content;">
                        <button
                            v-for="opt in typeOptions"
                            :key="opt.value ?? 'all'"
                            :style="typeChipStyle(opt.value)"
                            @click="setType(opt.value)"
                        >{{ opt.label }}</button>
                    </div>
                </div>

                <!-- ─── HOME MODE: hero + carousels ─── -->
                <template v-if="!isSearchMode">
                    <!-- Loading home -->
                    <div v-if="homeLoading" style="padding: 0 18px;">
                        <div style="height: 260px; border-radius: 18px; background: #1a1f2e; border: 1px solid #262d40; margin-bottom: 24px;" class="skeleton"></div>
                        <div style="height: 18px; width: 160px; border-radius: 6px; margin-bottom: 12px;" class="skeleton"></div>
                        <div style="display: flex; gap: 10px; overflow: hidden;">
                            <div v-for="i in 4" :key="i" style="width: 128px; flex-shrink: 0;">
                                <div style="height: 185px; border-radius: 10px;" class="skeleton"></div>
                                <div style="height: 13px; border-radius: 4px; margin-top: 8px; width: 90%;" class="skeleton"></div>
                            </div>
                        </div>
                    </div>

                    <template v-else>
                        <!-- Hero featured -->
                        <div
                            v-if="featured"
                            style="position: relative; height: 260px; border-radius: 18px; overflow: hidden; cursor: pointer; margin: 0 18px 24px;"
                            @click="openDetail(featured)"
                        >
                            <img
                                v-if="featured.cover"
                                :src="featured.cover"
                                alt=""
                                style="width: 100%; height: 100%; object-fit: cover; display: block;"
                            />
                            <div v-else :style="heroFallbackStyle(featured.type)" style="width: 100%; height: 100%;"></div>
                            <!-- Overlay -->
                            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,17,23,0.05) 0%, rgba(13,17,23,0.35) 50%, rgba(13,17,23,0.95) 100%);"></div>
                            <!-- EM ALTA badge -->
                            <div style="position: absolute; top: 14px; left: 14px; display: flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 20px; background: rgba(13,17,23,0.7); backdrop-filter: blur(8px); color: #5eead4; font-size: 10px; font-weight: 800; letter-spacing: 0.06em;">
                                🔥 EM ALTA
                            </div>
                            <!-- Content bottom -->
                            <div style="position: absolute; bottom: 16px; left: 16px; right: 16px;">
                                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                                    <span :style="typePillStyle(featured.type)">{{ typeLabel(featured.type) }}</span>
                                    <span v-if="featured.rating" style="display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 700; color: #eef0f5;">
                                        <span style="color: #fbbf24;">★</span> {{ featured.rating.toFixed(1) }}
                                    </span>
                                </div>
                                <div style="font-size: 22px; font-weight: 900; color: #fff; letter-spacing: -0.03em; margin-bottom: 4px; line-height: 1.15;">{{ featured.name }}</div>
                                <div style="font-size: 11px; color: rgba(255,255,255,0.65); margin-bottom: 12px;">{{ featured.release_year }} · {{ (featured.genres ?? []).slice(0,3).join(' · ') }}</div>
                                <button
                                    style="padding: 9px 18px; border-radius: 24px; border: none; background: #eef0f5; color: #0d1117; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;"
                                    @click.stop="openDetail(featured)"
                                >▶ Ver detalhes</button>
                            </div>
                        </div>

                        <!-- Continue watching (user in-progress) -->
                        <section v-if="continueItems.length > 0" style="margin-bottom: 24px;">
                            <div style="display: flex; align-items: flex-end; justify-content: space-between; padding: 0 18px; margin-bottom: 10px;">
                                <div>
                                    <div style="font-size: 17px; font-weight: 800; color: #eef0f5; letter-spacing: -0.02em;">Continue acompanhando</div>
                                    <div style="font-size: 11px; color: #6b738a; margin-top: 1px;">{{ continueItems.length }} em andamento</div>
                                </div>
                            </div>
                            <div class="no-scrollbar" style="overflow-x: auto;">
                                <div style="display: flex; gap: 10px; padding: 0 18px; min-width: max-content;">
                                    <div
                                        v-for="ci in continueItems"
                                        :key="ci.id"
                                        style="width: 200px; flex-shrink: 0; cursor: pointer;"
                                        @click="$router.push(`/catalog/${ci.contentId}`)"
                                    >
                                        <div style="position: relative; border-radius: 12px; overflow: hidden; height: 112px; background: #1a1f2e;">
                                            <img v-if="ci.cover" :src="ci.cover" alt="" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                                            <div v-else :style="heroFallbackStyle(ci.type)" style="width: 100%; height: 100%;"></div>
                                            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,17,23,0) 40%, rgba(13,17,23,0.95) 100%);"></div>
                                            <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 8px 10px;">
                                                <div style="font-size: 12px; font-weight: 800; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 5px;">{{ ci.title }}</div>
                                                <div style="height: 3px; background: rgba(255,255,255,0.12); border-radius: 3px; overflow: hidden;">
                                                    <div style="height: 100%; border-radius: 3px; transition: width 0.3s ease;" :style="{ width: ci.pct + '%', background: ci.statusColor }"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; padding: 0 2px;">
                                            <div style="font-size: 10px; color: #9aa3b8;">{{ ci.nextLabel }}</div>
                                            <div style="font-size: 10px; color: #6b738a;">{{ ci.pct }}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Carousel sections -->
                        <section v-for="section in homeSections" :key="section.id" style="margin-bottom: 24px;">
                            <div style="display: flex; align-items: flex-end; justify-content: space-between; padding: 0 18px; margin-bottom: 10px;">
                                <div>
                                    <div style="font-size: 17px; font-weight: 800; color: #eef0f5; letter-spacing: -0.02em;">{{ section.title }}</div>
                                    <div v-if="section.sub" style="font-size: 11px; color: #6b738a; margin-top: 1px;">{{ section.sub }}</div>
                                </div>
                            </div>
                            <div class="no-scrollbar" style="overflow-x: auto;">
                                <div style="display: flex; gap: 10px; padding: 0 18px; min-width: max-content;">
                                    <div
                                        v-for="item in section.items"
                                        :key="item.id"
                                        style="width: 128px; flex-shrink: 0; cursor: pointer;"
                                        @click="openDetail(item)"
                                    >
                                        <!-- Poster -->
                                        <div style="position: relative; border-radius: 10px; overflow: hidden; height: 185px; background: #1a1f2e;">
                                            <img v-if="item.cover && !coverErrors[item.id]" :src="item.cover" :alt="item.name" style="width: 100%; height: 100%; object-fit: cover; display: block;" @error="coverErrors[item.id] = true" />
                                            <div v-else :style="heroFallbackStyle(item.type)" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 900; letter-spacing: -0.04em; color: rgba(255,255,255,0.3);">{{ typeShortLabel(item.type) }}</div>
                                            <!-- Type pill overlay -->
                                            <div style="position: absolute; top: 6px; left: 6px;">
                                                <span :style="typePillStyle(item.type)" style="font-size: 8px; padding: 2px 6px;">{{ typeLabel(item.type) }}</span>
                                            </div>
                                            <!-- Score badge top-right -->
                                            <div v-if="item.rating && item.rating >= 8.5" style="position: absolute; top: 6px; right: 6px; padding: 2px 6px; border-radius: 10px; background: rgba(13,17,23,0.85); backdrop-filter: blur(4px); font-size: 9px; font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 2px;">
                                                ★ {{ item.rating.toFixed(1) }}
                                            </div>
                                            <!-- In library badge -->
                                            <div v-if="item.is_in_library" style="position: absolute; bottom: 6px; right: 6px; width: 20px; height: 20px; border-radius: 10px; background: rgba(94,234,212,0.9); display: flex; align-items: center; justify-content: center;">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0d1117" stroke-width="2.5" stroke-linecap="round"><path d="m4 12 5 5 11-11"/></svg>
                                            </div>
                                        </div>
                                        <!-- Info below poster -->
                                        <div style="margin-top: 8px;">
                                            <div style="font-size: 12px; font-weight: 700; color: #eef0f5; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">{{ item.name }}</div>
                                            <div style="font-size: 10px; color: #6b738a; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.release_year }}{{ (item.genres ?? [])[0] ? ' · ' + item.genres![0] : '' }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </template>
                </template>

                <!-- ─── SEARCH/FILTER MODE: grid ─── -->
                <template v-else>
                    <!-- Toolbar: count + sort + filter -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 18px 12px;">
                        <span style="font-size: 12px; font-weight: 600; color: #6b738a;">
                            <template v-if="meta.total > 0">{{ meta.total.toLocaleString('pt-BR') }} obras</template>
                            <template v-else-if="!loading">Nenhum resultado</template>
                        </span>
                        <div style="display: flex; gap: 8px;">
                            <button :style="sortBtnStyle" @click="isSortOpen = true">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" :stroke="isSortDefault ? '#6b738a' : '#5eead4'" stroke-width="1.7" stroke-linecap="round"><path d="M3 7h13M3 12h9M3 17h5M17 17V7M14 14l3 3 3-3"/></svg>
                                <span :style="{ fontSize: '11px', fontWeight: '700', color: isSortDefault ? '#6b738a' : '#5eead4', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }">{{ sortMeta.label }}</span>
                            </button>
                            <button :style="filterBtnStyle" @click="isFilterOpen = true">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" :stroke="activeFilterCount > 0 ? '#a78bfa' : '#6b738a'" stroke-width="1.7" stroke-linecap="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>
                                <span :style="{ fontSize: '11px', fontWeight: '700', color: activeFilterCount > 0 ? '#a78bfa' : '#6b738a' }">Filtros</span>
                                <span v-if="activeFilterCount > 0" style="width: 16px; height: 16px; border-radius: 8px; background: #a78bfa; color: #0d1117; font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center;">{{ activeFilterCount }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Skeleton grid -->
                    <div v-if="loading && contents.length === 0" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 14px;">
                        <div v-for="i in 9" :key="i" style="aspect-ratio: 0.69;">
                            <div style="border-radius: 10px; height: 100%;" class="skeleton"></div>
                            <div style="height: 12px; border-radius: 4px; margin-top: 8px; width: 80%;" class="skeleton"></div>
                        </div>
                    </div>

                    <!-- Empty state -->
                    <div v-else-if="!loading && contents.length === 0" style="text-align: center; padding: 56px 28px;">
                        <div style="width: 72px; height: 72px; border-radius: 36px; background: #1a1f2e; border: 1px solid #262d40; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b738a" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                        </div>
                        <div style="font-size: 15px; font-weight: 700; color: #eef0f5; margin-bottom: 6px;">Nada encontrado</div>
                        <div style="font-size: 12px; color: #6b738a; margin-bottom: 16px;">Tente outros termos ou filtros</div>
                        <button v-if="hasActiveFilters" style="padding: 9px 18px; border-radius: 20px; border: 1px solid #262d40; background: transparent; color: #9aa3b8; cursor: pointer; font-size: 12px; font-weight: 700;" @click="resetFilters">Limpar filtros</button>
                    </div>

                    <!-- Grid 3 cols -->
                    <div v-else style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 14px;">
                        <div
                            v-for="content in contents"
                            :key="content.id"
                            style="cursor: pointer;"
                            @click="openDetail(content)"
                        >
                            <div style="position: relative; border-radius: 10px; overflow: hidden; background: #1a1f2e; aspect-ratio: 0.69;">
                                <img
                                    v-if="content.cover && !coverErrors[content.id]"
                                    :src="content.cover"
                                    :alt="content.name"
                                    style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                    @error="coverErrors[content.id] = true"
                                />
                                <div v-else :style="heroFallbackStyle(content.type)" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 900; color: rgba(255,255,255,0.3);">{{ typeShortLabel(content.type) }}</div>
                                <!-- Type pill -->
                                <div style="position: absolute; top: 5px; left: 5px;">
                                    <span :style="typePillStyle(content.type)" style="font-size: 8px; padding: 1px 5px;">{{ typeLabel(content.type) }}</span>
                                </div>
                                <!-- Score -->
                                <div v-if="content.rating && content.rating >= 8.5" style="position: absolute; top: 5px; right: 5px; padding: 2px 5px; border-radius: 8px; background: rgba(13,17,23,0.85); font-size: 9px; font-weight: 800; color: #fbbf24;">★ {{ content.rating.toFixed(1) }}</div>
                                <!-- In library -->
                                <div v-if="content.is_in_library" style="position: absolute; bottom: 5px; right: 5px; width: 18px; height: 18px; border-radius: 9px; background: rgba(94,234,212,0.9); display: flex; align-items: center; justify-content: center;">
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0d1117" stroke-width="2.5" stroke-linecap="round"><path d="m4 12 5 5 11-11"/></svg>
                                </div>
                            </div>
                            <div style="margin-top: 6px;">
                                <div style="font-size: 11px; font-weight: 700; color: #eef0f5; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">{{ content.name }}</div>
                                <div style="font-size: 10px; color: #6b738a; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ content.release_year }}{{ (content.genres ?? [])[0] ? ' · ' + content.genres![0] : '' }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Infinite scroll -->
                    <IonInfiniteScroll
                        :disabled="meta.current_page >= meta.last_page"
                        threshold="200px"
                        @ionInfinite="handleInfiniteScroll"
                    >
                        <IonInfiniteScrollContent loading-text="Carregando mais..." />
                    </IonInfiniteScroll>
                </template>
            </div>
        </IonContent>

        <!-- Sort Sheet -->
        <IonModal :is-open="isSortOpen" :initial-breakpoint="0.65" :breakpoints="[0, 0.65, 1]" :handle="true" handle-behavior="cycle" class="bottom-sheet-modal" @didDismiss="isSortOpen = false">
            <IonContent class="sheet-content">
                <div style="padding: 4px 16px 32px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                        <div style="font-size: 16px; font-weight: 800; color: #eef0f5; letter-spacing: -0.02em;">Ordenar por</div>
                        <button style="width: 30px; height: 30px; border-radius: 15px; border: none; background: #222837; color: #9aa3b8; cursor: pointer; display: flex; align-items: center; justify-content: center;" @click="isSortOpen = false">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>
                        </button>
                    </div>
                    <button v-for="opt in sortOptions" :key="opt.id" :style="sortOptionStyle(opt.id)" @click="setSort(opt.id)">
                        <div :style="sortIconStyle(opt.id)">{{ opt.icon }}</div>
                        <div style="flex: 1; text-align: left;">
                            <div :style="{ fontSize: '13px', fontWeight: '700', color: sortById === opt.id ? '#5eead4' : '#eef0f5' }">{{ opt.label }}</div>
                            <div style="font-size: 11px; color: #6b738a; margin-top: 1px;">{{ opt.desc }}</div>
                        </div>
                        <svg v-if="sortById === opt.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round"><path d="m4 12 5 5 11-11"/></svg>
                    </button>
                </div>
            </IonContent>
        </IonModal>

        <!-- Filter Sheet -->
        <IonModal :is-open="isFilterOpen" :initial-breakpoint="0.9" :breakpoints="[0, 0.9, 1]" :handle="true" handle-behavior="cycle" class="bottom-sheet-modal" @didDismiss="isFilterOpen = false">
            <IonHeader class="sheet-header">
                <div style="padding: 8px 20px 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: 18px; font-weight: 800; color: #eef0f5; letter-spacing: -0.02em;">Filtros avançados</div>
                            <div v-if="activeFilterCount > 0" style="font-size: 11px; color: #5eead4; font-weight: 600; margin-top: 2px;">{{ activeFilterCount }} ativo{{ activeFilterCount > 1 ? 's' : '' }}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button style="padding: 7px 14px; border-radius: 10px; border: 1px solid #262d40; background: transparent; color: #6b738a; cursor: pointer; font-size: 12px; font-weight: 700;" @click="clearAdvancedFilters">Limpar</button>
                            <button style="width: 32px; height: 32px; border-radius: 16px; border: none; background: #222837; color: #9aa3b8; cursor: pointer; display: flex; align-items: center; justify-content: center;" @click="isFilterOpen = false">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </IonHeader>
            <IonContent class="sheet-content">
                <div style="padding: 0 20px 120px;">
                    <div style="margin-bottom: 22px;">
                        <div class="filter-label">Status de publicação</div>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <button v-for="[key, val] in Object.entries(catStatusOptions)" :key="key" :style="catStatusChipStyle(key, val.color)" @click="toggleCatStatus(key)">
                                <span :style="{ width: '7px', height: '7px', borderRadius: '50%', background: filterCatStatuses.includes(key) ? val.color : '#6b738a' }"></span>
                                {{ val.label }}
                            </button>
                        </div>
                    </div>
                    <div style="margin-bottom: 22px;">
                        <div class="filter-label">Gêneros</div>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <button v-for="g in genresList" :key="g" :style="genreChipStyle(g)" @click="toggleGenre(g)">{{ g }}</button>
                        </div>
                    </div>
                    <div>
                        <div class="filter-label">Outros</div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 12px; background: #1a1f2e; border: 1px solid #262d40; cursor: pointer;" @click="filterRecentOnly = !filterRecentOnly">
                                <div style="font-size: 13px; font-weight: 700; color: #eef0f5;">Atualizados recentemente</div>
                                <div :style="toggleTrack(filterRecentOnly)"><div :style="toggleKnob(filterRecentOnly)"></div></div>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 12px; background: #1a1f2e; border: 1px solid #262d40; cursor: pointer;" @click="filterIsAdult = filterIsAdult === true ? null : true">
                                <div style="font-size: 13px; font-weight: 700; color: #eef0f5;">+18 apenas</div>
                                <div :style="toggleTrack(filterIsAdult === true)"><div :style="toggleKnob(filterIsAdult === true)"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
            <IonFooter class="sheet-footer">
                <div style="padding: 12px 20px;">
                    <button style="width: 100%; padding: 14px; border-radius: 12px; border: none; background: #5eead4; color: #0d1117; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;" @click="applyFilters">
                        Aplicar filtros
                        <span v-if="activeFilterCount > 0" style="background: rgba(0,0,0,0.2); border-radius: 10px; padding: 2px 8px; font-size: 11px;">{{ activeFilterCount }}</span>
                    </button>
                </div>
            </IonFooter>
        </IonModal>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonContent, IonInfiniteScroll, IonInfiniteScrollContent,
    IonModal, IonHeader, IonFooter, toastController,
} from '@ionic/vue';
import { contentService, Content, ContentMeta, ContentType, ContentCatalogStatus, ContentSortField } from '@/services/contentService';
import { userContentService, UserContent, ContentStatus } from '@/services/userContentService';
import { authStore } from '@/store/auth';

const SORT_OPTIONS = [
    { id: 'score_desc',  label: 'Mais relevantes',  icon: '◆', desc: 'Score combinado',     apiSort: 'score' as ContentSortField,      apiOrder: 'desc' as const },
    { id: 'popular',     label: 'Mais populares',   icon: '🔥', desc: 'Maior audiência',    apiSort: 'popularity' as ContentSortField, apiOrder: 'desc' as const },
    { id: 'note_desc',   label: 'Melhor avaliação', icon: '★',  desc: 'Maior nota primeiro', apiSort: 'rating' as ContentSortField,     apiOrder: 'desc' as const },
    { id: 'votes_desc',  label: 'Mais votados',     icon: '👍', desc: 'Mais avaliações',    apiSort: 'votes_count' as ContentSortField, apiOrder: 'desc' as const },
    { id: 'updated_desc',label: 'Recentes',         icon: '⚡', desc: 'Atualizados primeiro',apiSort: 'updated_at' as ContentSortField, apiOrder: 'desc' as const },
    { id: 'name_asc',    label: 'Nome A → Z',       icon: '↑',  desc: 'Ordem alfabética',   apiSort: 'name' as ContentSortField,       apiOrder: 'asc' as const },
];

const TYPE_META: Record<string, { color: string; label: string; short: string }> = {
    manga:  { color: '#5eead4', label: 'MANGA', short: 'M' },
    anime:  { color: '#a78bfa', label: 'ANIME', short: 'A' },
    novel:  { color: '#fbbf24', label: 'NOVEL', short: 'N' },
    movie:  { color: '#f472b6', label: 'FILME', short: 'F' },
    tv:     { color: '#22d3ee', label: 'SÉRIE', short: 'S' },
};

const CAT_STATUS: Record<string, { label: string; color: string }> = {
    ongoing:   { label: 'Em andamento', color: '#5eead4' },
    completed: { label: 'Completo',     color: '#34d399' },
    hiatus:    { label: 'Hiato',        color: '#fbbf24' },
    cancelled: { label: 'Cancelado',    color: '#f87171' },
};

const STATUS_COLORS: Record<ContentStatus, string> = {
    reading: '#60a5fa', completed: '#34d399', paused: '#fbbf24', dropped: '#f87171', plan_to_read: '#a78bfa',
};

const GENRES = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica', 'Horror', 'Mistério', 'Romance', 'Seinen', 'Shounen', 'Slice of Life', 'Supernatural', 'Thriller'];
const EMPTY_META: ContentMeta = { current_page: 1, last_page: 1, per_page: 20, total: 0, from: 0, to: 0 };

interface ContinueItem { id: number; contentId: number; title: string; cover: string | undefined; type: string; pct: number; statusColor: string; nextLabel: string; }
interface HomeSection { id: string; title: string; sub?: string; items: Content[]; }

export default defineComponent({
    name: 'DiscoverPage',
    components: { IonPage, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonModal, IonHeader, IonFooter },
    data() {
        return {
            // Search/filter mode
            loading: false,
            contents: [] as Content[],
            meta: { ...EMPTY_META } as ContentMeta,
            query: '',
            activeType: null as ContentType | null,
            sortById: 'score_desc',
            filterCatStatuses: [] as string[],
            filterGenres: [] as string[],
            filterRecentOnly: false,
            filterIsAdult: null as boolean | null,
            searchTimer: null as ReturnType<typeof setTimeout> | null,
            isSortOpen: false,
            isFilterOpen: false,
            coverErrors: {} as Record<number, boolean>,
            // Home mode
            homeLoading: false,
            featured: null as Content | null,
            homeSections: [] as HomeSection[],
            continueItems: [] as ContinueItem[],
            // Statics
            sortOptions: SORT_OPTIONS,
            catStatusOptions: CAT_STATUS,
            genresList: GENRES,
            typeOptions: [
                { label: 'Tudo',  value: null as ContentType | null },
                { label: 'Anime', value: 'anime' as ContentType },
                { label: 'Mangá', value: 'manga' as ContentType },
                { label: 'Novel', value: 'novel' as ContentType },
                { label: 'Filmes',value: 'movie' as ContentType },
                { label: 'Séries',value: 'tv' as ContentType },
            ],
        };
    },
    computed: {
        isSearchMode(): boolean { return !!(this.query || this.activeType); },
        sortMeta() { return SORT_OPTIONS.find(o => o.id === this.sortById) ?? SORT_OPTIONS[0]; },
        isSortDefault(): boolean { return this.sortById === 'score_desc'; },
        activeFilterCount(): number {
            let n = 0;
            if (this.filterCatStatuses.length) n++;
            if (this.filterGenres.length) n++;
            if (this.filterRecentOnly) n++;
            if (this.filterIsAdult != null) n++;
            return n;
        },
        hasActiveFilters(): boolean { return !!(this.query || this.activeType || this.activeFilterCount > 0); },
        isAdmin(): boolean { return authStore.user?.role === 'admin'; },
        sortBtnStyle(): Record<string, string> {
            return { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: '#1a1f2e', outline: '1px solid #262d40', transition: 'all 0.18s' };
        },
        filterBtnStyle(): Record<string, string> {
            const active = this.activeFilterCount > 0;
            return { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: active ? 'rgba(167,139,250,0.1)' : '#1a1f2e', outline: active ? '1px solid rgba(167,139,250,0.4)' : '1px solid #262d40', transition: 'all 0.18s' };
        },
    },
    async ionViewWillEnter() {
        if (!this.isSearchMode && this.homeSections.length === 0) {
            await this.loadHome();
        }
    },
    methods: {
        async loadHome() {
            this.homeLoading = true;
            try {
                const [topRated, trending, recent, userContents] = await Promise.all([
                    contentService.getAll({ sort: 'score', order: 'desc', per_page: 10 }),
                    contentService.getAll({ sort: 'popularity', order: 'desc', per_page: 8 }),
                    contentService.getAll({ sort: 'updated_at', order: 'desc', per_page: 8 }),
                    userContentService.getAll().catch(() => [] as UserContent[]),
                ]);

                this.featured = topRated.items[0] ?? null;

                // Continue watching
                const inProgress = userContents.filter(u => u.status === 'reading');
                this.continueItems = inProgress.slice(0, 6).map(u => {
                    const max = u.content?.total_units;
                    const pct = max ? Math.min(Math.round((u.current_units / max) * 100), 100) : 30;
                    const isWatch = u.content?.type === 'anime' || u.content?.type === 'tv';
                    const nextLabel = isWatch ? `Próximo: Ep ${u.current_units + 1}` : `Próximo: Cap ${u.current_units + 1}`;
                    return {
                        id: u.id,
                        contentId: u.content?.id ?? u.content_id,
                        title: u.content?.name ?? '',
                        cover: u.content?.cover,
                        type: u.content?.type ?? 'manga',
                        pct,
                        statusColor: STATUS_COLORS[u.status] ?? '#60a5fa',
                        nextLabel,
                    };
                });

                this.homeSections = [
                    { id: 'top', title: 'Melhor avaliados', sub: 'Notas acima de 8.5', items: topRated.items.slice(1, 9) },
                    { id: 'trending', title: 'Em alta agora', sub: 'Os mais populares', items: trending.items },
                    { id: 'recent', title: 'Atualizados recentemente', items: recent.items },
                ];
            } catch { /* silent */ } finally {
                this.homeLoading = false;
            }
        },

        buildFilters() {
            const opt = this.sortMeta;
            return {
                type: this.activeType ?? undefined,
                search: this.query.trim() || undefined,
                sort: opt.apiSort, order: opt.apiOrder, per_page: 18,
                ...(this.filterCatStatuses.length === 1 ? { status: this.filterCatStatuses[0] as ContentCatalogStatus } : {}),
                ...(this.filterGenres.length ? { genres: this.filterGenres } : {}),
                ...(this.filterRecentOnly ? { recent: true } : {}),
                ...(this.filterIsAdult != null ? { is_adult: this.filterIsAdult } : {}),
            };
        },

        async loadContents() {
            this.loading = true;
            this.contents = [];
            try {
                const result = await contentService.getAll({ ...this.buildFilters(), page: 1 });
                this.contents = result.items;
                this.meta = result.meta;
            } catch { /* silent */ } finally {
                this.loading = false;
            }
        },

        async handleInfiniteScroll(event: any) {
            const nextPage = this.meta.current_page + 1;
            if (nextPage > this.meta.last_page) { event.target.complete(); return; }
            try {
                const result = await contentService.getAll({ ...this.buildFilters(), page: nextPage });
                this.contents.push(...result.items);
                this.meta = result.meta;
            } catch { /* silent */ } finally { event.target.complete(); }
        },

        onSearchInput(ev: Event) {
            this.query = (ev.target as HTMLInputElement).value;
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => { if (this.isSearchMode) this.loadContents(); }, 400);
        },

        clearQuery() { this.query = ''; if (!this.activeType) { /* stay home */ } else { this.loadContents(); } },

        setType(type: ContentType | null) {
            this.activeType = type;
            if (type) this.loadContents();
        },

        setSort(id: string) { this.sortById = id; this.isSortOpen = false; if (this.isSearchMode) this.loadContents(); },

        applyFilters() { this.isFilterOpen = false; if (this.isSearchMode) this.loadContents(); },

        clearAdvancedFilters() {
            this.filterCatStatuses = [];
            this.filterGenres = [];
            this.filterRecentOnly = false;
            this.filterIsAdult = null;
        },

        resetFilters() {
            this.query = '';
            this.activeType = null;
            this.clearAdvancedFilters();
        },

        toggleCatStatus(key: string) {
            const idx = this.filterCatStatuses.indexOf(key);
            if (idx >= 0) this.filterCatStatuses.splice(idx, 1);
            else this.filterCatStatuses.push(key);
        },

        toggleGenre(g: string) {
            const idx = this.filterGenres.indexOf(g);
            if (idx >= 0) this.filterGenres.splice(idx, 1);
            else this.filterGenres.push(g);
        },

        openDetail(content: Content) {
            this.$router.push(`/catalog/${content.id}`);
        },

        onScroll() { /* placeholder */ },

        // Style helpers
        typeChipStyle(val: ContentType | null): Record<string, string> {
            const active = this.activeType === val;
            const col = val ? (TYPE_META[val]?.color ?? '#5eead4') : '#eef0f5';
            return {
                padding: '7px 14px', borderRadius: '20px', border: 'none',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: '0',
                background: active ? col : 'transparent',
                color: active ? '#0d1117' : '#9aa3b8',
                transition: 'all 0.18s',
            };
        },
        typePillStyle(type: string): Record<string, string> {
            const col = TYPE_META[type]?.color ?? '#5eead4';
            return { fontSize: '9px', fontWeight: '700', letterSpacing: '0.06em', color: col, background: col + '1f', padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase', flexShrink: '0' };
        },
        typeLabel(type: string): string { return TYPE_META[type]?.label ?? type.toUpperCase(); },
        typeShortLabel(type: string): string { return TYPE_META[type]?.short ?? '?'; },
        heroFallbackStyle(type: string): Record<string, string> {
            const col = TYPE_META[type]?.color ?? '#5eead4';
            return { background: `linear-gradient(135deg, ${col}33, #1a1f2e)` };
        },
        sortOptionStyle(id: string): Record<string, string> {
            const active = this.sortById === id;
            return { width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer', marginBottom: '4px', background: active ? 'rgba(94,234,212,0.08)' : 'transparent', outline: active ? '1px solid rgba(94,234,212,0.3)' : '1px solid #262d40', textAlign: 'left', transition: 'all 0.15s' };
        },
        sortIconStyle(id: string): Record<string, string> {
            const active = this.sortById === id;
            return { width: '36px', height: '36px', borderRadius: '10px', flexShrink: '0', background: active ? 'rgba(94,234,212,0.2)' : '#222837', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', color: active ? '#5eead4' : '#6b738a' };
        },
        catStatusChipStyle(key: string, color: string): Record<string, string> {
            const active = this.filterCatStatuses.includes(key);
            return { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', background: active ? color + '20' : '#1a1f2e', color: active ? color : '#9aa3b8', outline: active ? `1.5px solid ${color}55` : '1px solid #262d40', transition: 'all 0.15s' };
        },
        genreChipStyle(g: string): Record<string, string> {
            const active = this.filterGenres.includes(g);
            return { padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', background: active ? 'rgba(94,234,212,0.15)' : '#1a1f2e', color: active ? '#5eead4' : '#9aa3b8', outline: active ? '1.5px solid rgba(94,234,212,0.35)' : '1px solid #262d40', transition: 'all 0.15s' };
        },
        toggleTrack(active: boolean): Record<string, string> {
            return { width: '44px', height: '26px', borderRadius: '13px', position: 'relative', background: active ? '#5eead4' : '#262d40', transition: 'background 0.2s', flexShrink: '0' };
        },
        toggleKnob(active: boolean): Record<string, string> {
            return { position: 'absolute', top: '3px', borderRadius: '10px', left: active ? '21px' : '3px', width: '20px', height: '20px', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' };
        },
    },
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.filter-label {
    font-size: 10px; font-weight: 800; color: #6b738a;
    text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;
}

.skeleton {
    background: #1a1f2e;
    animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
</style>

<style>
ion-modal.bottom-sheet-modal::part(content) {
    background: #131826;
    border-top: 1px solid #262d40;
    border-radius: 24px 24px 0 0;
}
.sheet-content  { --background: #131826; }
.sheet-header   { --background: #131826; box-shadow: none; }
.sheet-footer   { --background: #131826; border-top: 1px solid #262d40; box-shadow: none; }
</style>
