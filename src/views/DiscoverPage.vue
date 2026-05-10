<template>
    <IonPage>
        <IonContent :fullscreen="true" @ionScroll="onScroll">
            <div style="padding-bottom: 100px; background: hsl(220 30% 3%); min-height: 100%;">

                <!-- ── Sticky Header ─────────────────────────────────────────── -->
                <div style="padding: 22px 18px 12px; background: hsl(222 24% 7% / 0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); position: sticky; top: 0; z-index: 10; border-bottom: 1px solid hsl(0 0% 100% / 0.06);">
                    <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 14px;">
                        <div>
                            <div style="font-size: 10px; color: rgba(233,237,242,0.42); font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 5px;">CATÁLOGO</div>
                            <div style="font-size: 30px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; font-family: 'Sora', system-ui, sans-serif; background: linear-gradient(135deg, #00F5A0, #00D9FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Explorar</div>
                        </div>
                        <button
                            v-if="isAdmin"
                            style="width: 36px; height: 36px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025); color: rgba(233,237,242,0.62); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px;"
                            @click="$router.push('/manage-contents')"
                        >⚙</button>
                    </div>

                    <!-- Search bar -->
                    <div style="position: relative;">
                        <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(233,237,242,0.22); font-size: 14px; pointer-events: none;">⌕</span>
                        <input
                            :value="query"
                            placeholder="Buscar animes, mangás, filmes..."
                            class="search-input"
                            style="width: 100%; padding: 12px 14px 12px 38px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025); color: #e9edf2; font-size: 13px; outline: none; box-sizing: border-box; font-family: inherit; transition: border-color 0.15s;"
                            @input="onSearchInput"
                            @focus="searchFocused = true; ($event.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.10)'"
                            @blur="searchFocused = false; ($event.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.06)'"
                        />
                        <button
                            v-if="query"
                            style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 11px; border: none; background: rgba(255,255,255,0.07); color: rgba(233,237,242,0.62); cursor: pointer; display: flex; align-items: center; justify-content: center;"
                            @click="clearQuery"
                        >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>
                        </button>
                    </div>

                    <!-- Type filter chips — inside sticky header so they don't scroll under it -->
                    <div class="no-scrollbar" style="overflow-x: auto; padding: 10px 0 4px; margin: 0 -18px;">
                        <div style="display: flex; gap: 6px; min-width: max-content; padding: 0 18px;">
                            <button
                                v-for="opt in typeOptions"
                                :key="opt.value ?? 'all'"
                                :style="typeChipStyle(opt.value)"
                                @click="setType(opt.value)"
                            >{{ opt.label }}</button>
                        </div>
                    </div>
                </div>

                <!-- ─── HOME MODE ─────────────────────────────────────────────── -->
                <template v-if="!isSearchMode">

                    <!-- Loading skeleton -->
                    <div v-if="homeLoading" style="padding: 0 18px;">
                        <div style="height: 280px; border-radius: 20px; background: hsl(222 24% 7%); border: 1px solid hsl(220 20% 14%); margin-bottom: 28px;" class="skeleton"></div>
                        <div style="height: 16px; width: 140px; border-radius: 6px; margin-bottom: 14px;" class="skeleton"></div>
                        <div style="display: flex; gap: 10px; overflow: hidden;">
                            <div v-for="i in 4" :key="i" style="width: 128px; flex-shrink: 0;">
                                <div style="height: 185px; border-radius: 10px;" class="skeleton"></div>
                                <div style="height: 12px; border-radius: 4px; margin-top: 8px; width: 85%;" class="skeleton"></div>
                            </div>
                        </div>
                    </div>

                    <template v-else>

                        <!-- ── Hero Featured ──────────────────────────────────── -->
                        <div
                            v-if="homeData?.featured"
                            style="position: relative; height: 280px; border-radius: 20px; overflow: hidden; cursor: pointer; margin: 0 18px 28px;"
                            @click="openDetail(homeData.featured!)"
                        >
                            <img
                                v-if="homeData.featured.cover"
                                :src="homeData.featured.cover"
                                alt=""
                                style="width: 100%; height: 100%; object-fit: cover; display: block;"
                            />
                            <div v-else :style="heroFallbackStyle(homeData.featured.type)" style="width: 100%; height: 100%;"></div>
                            <!-- Multi-layer overlay for depth -->
                            <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(13,17,23,0.2) 0%, transparent 50%);"></div>
                            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,17,23,0.08) 0%, rgba(13,17,23,0.45) 55%, rgba(13,17,23,0.97) 100%);"></div>
                            <!-- Badge top-left -->
                            <div style="position: absolute; top: 14px; left: 14px; display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; background: rgba(13,17,23,0.72); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: #f472b6;">
                                🔥 EM ALTA
                            </div>
                            <!-- Bottom content -->
                            <div style="position: absolute; bottom: 18px; left: 18px; right: 18px;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                                    <span :style="typePillStyle(homeData.featured.type)">{{ typeLabel(homeData.featured.type) }}</span>
                                    <span v-if="homeData.featured.rating" style="display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 700; color: #fbbf24;">
                                        ★ {{ homeData.featured.rating.toFixed(1) }}
                                    </span>
                                    <span v-if="homeData.featured.release_year" style="font-size: 11px; color: rgba(255,255,255,0.5);">{{ homeData.featured.release_year }}</span>
                                </div>
                                <div style="font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.04em; margin-bottom: 4px; line-height: 1.15; text-shadow: 0 2px 20px rgba(0,0,0,0.7); font-family: 'Sora', system-ui, sans-serif;">{{ homeData.featured.name }}</div>
                                <div style="font-size: 11px; color: rgba(255,255,255,0.55); margin-bottom: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ (homeData.featured.genres ?? []).slice(0, 3).join(' · ') }}</div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <button
                                        style="padding: 10px 20px; border-radius: 12px; border: none; background: #00F5A0; color: #050608; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 0 24px hsl(158 100% 48% / 0.45);"
                                        @click.stop="openDetail(homeData!.featured!)"
                                    >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#0d1117"><polygon points="5,3 19,12 5,21"/></svg>
                                        Ver detalhes
                                    </button>
                                    <div v-if="homeData.featured.is_in_library" style="width: 36px; height: 36px; border-radius: 18px; background: rgba(52,211,153,0.18); border: 1.5px solid rgba(52,211,153,0.4); display: flex; align-items: center; justify-content: center;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00F5A0" stroke-width="2.5" stroke-linecap="round"><path d="m4 12 5 5 11-11"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ── Continue acompanhando ──────────────────────────── -->
                        <section v-if="homeData?.continue_items?.length" style="margin-bottom: 28px;">
                            <div style="display: flex; align-items: flex-end; justify-content: space-between; padding: 0 18px; margin-bottom: 12px;">
                                <div>
                                    <div style="font-size: 20px; font-weight: 700; color: hsl(213 25% 92%); letter-spacing: -0.03em; font-family: 'Sora', system-ui, sans-serif;">Continue</div>
                                    <div style="font-size: 11px; color: rgba(233,237,242,0.42); margin-top: 2px;">{{ homeData.continue_items.length }} em andamento</div>
                                </div>
                            </div>
                            <div class="no-scrollbar" style="overflow-x: auto;">
                                <div style="display: flex; gap: 10px; padding: 0 18px; min-width: max-content;">
                                    <div
                                        v-for="ci in homeData.continue_items"
                                        :key="ci.user_content_id"
                                        style="width: 200px; flex-shrink: 0; cursor: pointer;"
                                        @click="$router.push(`/catalog/${ci.content_id}`)"
                                    >
                                        <div style="position: relative; border-radius: 12px; overflow: hidden; height: 116px; background: rgba(255,255,255,0.025);">
                                            <img v-if="ci.cover" :src="ci.cover" alt="" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                                            <div v-else :style="heroFallbackStyle(ci.type)" style="width: 100%; height: 100%;"></div>
                                            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,7,11,0) 30%, rgba(5,7,11,0.96) 100%);"></div>
                                            <div style="position: absolute; top: 8px; left: 8px;">
                                                <span :style="typePillStyle(ci.type)" style="font-size: 8px; padding: 2px 6px;">{{ typeLabel(ci.type) }}</span>
                                            </div>
                                            <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 8px 10px;">
                                                <div style="font-size: 12px; font-weight: 800; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 6px;">{{ ci.title }}</div>
                                                <div style="height: 3px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                                    <div style="height: 100%; border-radius: 3px; transition: width 0.3s ease; background: #00F5A0;" :style="{ width: ci.progress_pct + '%' }"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; padding: 0 2px;">
                                            <div style="font-size: 10px; color: rgba(233,237,242,0.62); font-weight: 600;">
                                                {{ (ci.type === 'anime' || ci.type === 'tv') ? 'Ep' : ci.type === 'movie' ? 'Filme' : 'Cap' }}
                                                {{ ci.current_units }}
                                                {{ ci.total_units ? `/ ${ci.total_units}` : '' }}
                                            </div>
                                            <div style="font-size: 10px; color: rgba(233,237,242,0.42); font-weight: 700;">{{ ci.progress_pct }}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- ── Type category quick links ─────────────────────── -->
                        <section style="margin-bottom: 28px;">
                            <div class="no-scrollbar" style="overflow-x: auto;">
                                <div style="display: flex; gap: 8px; padding: 0 18px; min-width: max-content;">
                                    <div
                                        v-for="cat in typeCategories"
                                        :key="cat.type"
                                        style="width: 96px; height: 60px; border-radius: 16px; cursor: pointer; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; transition: transform 0.15s, opacity 0.15s;"
                                        :style="{ background: `linear-gradient(135deg, ${cat.color}1a 0%, ${cat.color}2e 100%)`, border: `1.5px solid ${cat.color}33` }"
                                        @click="goToType(cat.type)"
                                    >
                                        <span style="font-size: 20px; line-height: 1;">{{ cat.icon }}</span>
                                        <span :style="{ fontSize: '11px', fontWeight: '800', color: cat.color, letterSpacing: '0.03em' }">{{ cat.label }}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- ── Dynamic content sections ──────────────────────── -->
                        <section v-for="section in homeSections" :key="section.id" style="margin-bottom: 28px; animation: fade 0.3s ease;">
                            <div style="display: flex; align-items: flex-end; justify-content: space-between; padding: 0 18px; margin-bottom: 12px;">
                                <div>
                                    <div style="font-size: 20px; font-weight: 700; color: hsl(213 25% 92%); letter-spacing: -0.03em; font-family: 'Sora', system-ui, sans-serif;">{{ section.title }}</div>
                                    <div v-if="section.sub" style="font-size: 11px; color: rgba(233,237,242,0.42); margin-top: 2px;">{{ section.sub }}</div>
                                </div>
                                <button
                                    v-if="section.filterType"
                                    style="display: flex; align-items: center; gap: 3px; background: transparent; border: none; cursor: pointer; font-size: 11px; font-weight: 700; color: #00F5A0; letter-spacing: 0.04em;"
                                    @click="goToType(section.filterType!)"
                                >
                                    Ver todos ›
                                </button>
                            </div>
                            <div class="no-scrollbar" style="overflow-x: auto;">
                                <div style="display: flex; gap: 10px; padding: 0 18px; min-width: max-content;">
                                    <div
                                        v-for="item in section.items"
                                        :key="item.id"
                                        class="poster-card"
                                        style="width: 112px; flex-shrink: 0; cursor: pointer;"
                                        @click="openDetail(item)"
                                    >
                                        <!-- Poster -->
                                        <div style="position: relative; border-radius: 10px; overflow: hidden; height: 165px; background: rgba(255,255,255,0.025);">
                                            <img
                                                v-if="item.cover && !coverErrors[item.id]"
                                                :src="item.cover"
                                                :alt="item.name"
                                                style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                                @error="coverErrors[item.id] = true"
                                            />
                                            <div v-else :style="heroFallbackStyle(item.type)" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 900; letter-spacing: -0.04em; color: rgba(255,255,255,0.3);">{{ typeShortLabel(item.type) }}</div>
                                            <!-- Bottom gradient -->
                                            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 70px; background: linear-gradient(0deg, rgba(13,17,23,0.85) 0%, transparent 100%); pointer-events: none;"></div>
                                            <!-- Type pill -->
                                            <div style="position: absolute; top: 6px; left: 6px;">
                                                <span :style="typePillStyle(item.type)" style="font-size: 8px; padding: 2px 6px;">{{ typeLabel(item.type) }}</span>
                                            </div>
                                            <!-- Score badge -->
                                            <div v-if="item.rating && item.rating >= 8.5" style="position: absolute; top: 6px; right: 6px; padding: 2px 6px; border-radius: 10px; background: rgba(13,17,23,0.85); backdrop-filter: blur(4px); font-size: 9px; font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 2px;">
                                                ★ {{ item.rating.toFixed(1) }}
                                            </div>
                                            <!-- In library badge -->
                                            <div v-if="item.is_in_library" style="position: absolute; bottom: 6px; right: 6px; width: 20px; height: 20px; border-radius: 10px; background: rgba(94,234,212,0.9); display: flex; align-items: center; justify-content: center;">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0d1117" stroke-width="2.5" stroke-linecap="round"><path d="m4 12 5 5 11-11"/></svg>
                                            </div>
                                        </div>
                                        <!-- Info below -->
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

                <!-- ─── SEARCH / FILTER MODE ──────────────────────────────────── -->
                <template v-else>
                    <!-- Toolbar: count + sort + filter -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 18px 12px;">
                        <span style="font-size: 12px; font-weight: 600; color: rgba(233,237,242,0.42);">
                            <template v-if="meta.total > 0">{{ meta.total.toLocaleString('pt-BR') }} obras</template>
                            <template v-else-if="!loading">Nenhum resultado</template>
                        </span>
                        <div style="display: flex; gap: 8px;">
                            <button :style="sortBtnStyle" @click="isSortOpen = true">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" :stroke="isSortDefault ? 'rgba(233,237,242,0.42)' : '#00F5A0'" stroke-width="1.7" stroke-linecap="round"><path d="M3 7h13M3 12h9M3 17h5M17 17V7M14 14l3 3 3-3"/></svg>
                                <span :style="{ fontSize: '11px', fontWeight: '700', color: isSortDefault ? 'rgba(233,237,242,0.42)' : '#00F5A0', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }">{{ sortMeta.label }}</span>
                            </button>
                            <button :style="filterBtnStyle" @click="isFilterOpen = true">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" :stroke="activeFilterCount > 0 ? '#B8A4FF' : 'rgba(233,237,242,0.42)'" stroke-width="1.7" stroke-linecap="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>
                                <span :style="{ fontSize: '11px', fontWeight: '700', color: activeFilterCount > 0 ? '#B8A4FF' : 'rgba(233,237,242,0.42)' }">Filtros</span>
                                <span v-if="activeFilterCount > 0" style="width: 16px; height: 16px; border-radius: 8px; background: #B8A4FF; color: #05070b; font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center;">{{ activeFilterCount }}</span>
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
                        <div style="width: 72px; height: 72px; border-radius: 36px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b738a" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                        </div>
                        <div style="font-size: 15px; font-weight: 700; color: #e9edf2; margin-bottom: 6px;">Nada encontrado</div>
                        <div style="font-size: 12px; color: rgba(233,237,242,0.42); margin-bottom: 16px;">Tente outros termos ou filtros</div>
                        <button v-if="hasActiveFilters" style="padding: 9px 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.06); background: transparent; color: rgba(233,237,242,0.62); cursor: pointer; font-size: 12px; font-weight: 700;" @click="resetFilters">Limpar filtros</button>
                    </div>

                    <!-- Grid 3 cols -->
                    <div v-else style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 14px;">
                        <div
                            v-for="content in contents"
                            :key="content.id"
                            style="cursor: pointer;"
                            @click="openDetail(content)"
                        >
                            <div style="position: relative; border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.025); aspect-ratio: 0.69;">
                                <img
                                    v-if="content.cover && !coverErrors[content.id]"
                                    :src="content.cover"
                                    :alt="content.name"
                                    style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                    @error="coverErrors[content.id] = true"
                                />
                                <div v-else :style="heroFallbackStyle(content.type)" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 900; color: rgba(255,255,255,0.3);">{{ typeShortLabel(content.type) }}</div>
                                <!-- Bottom gradient -->
                                <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 60px; background: linear-gradient(0deg, rgba(13,17,23,0.85) 0%, transparent 100%); pointer-events: none;"></div>
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

        <!-- ── Sort Sheet ─────────────────────────────────────────────────── -->
        <IonModal :is-open="isSortOpen" :initial-breakpoint="0.65" :breakpoints="[0, 0.65, 1]" :handle="true" handle-behavior="cycle" class="bottom-sheet-modal" @didDismiss="isSortOpen = false">
            <IonContent class="sheet-content">
                <div style="padding: 4px 16px 32px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                        <div style="font-size: 16px; font-weight: 800; color: #e9edf2; letter-spacing: -0.02em;">Ordenar por</div>
                        <button style="width: 30px; height: 30px; border-radius: 15px; border: none; background: rgba(255,255,255,0.06); color: rgba(233,237,242,0.62); cursor: pointer; display: flex; align-items: center; justify-content: center;" @click="isSortOpen = false">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>
                        </button>
                    </div>
                    <button v-for="opt in sortOptions" :key="opt.id" :style="sortOptionStyle(opt.id)" @click="setSort(opt.id)">
                        <div :style="sortIconStyle(opt.id)">{{ opt.icon }}</div>
                        <div style="flex: 1; text-align: left;">
                            <div :style="{ fontSize: '13px', fontWeight: '700', color: sortById === opt.id ? '#00F5A0' : '#e9edf2' }">{{ opt.label }}</div>
                            <div style="font-size: 11px; color: rgba(233,237,242,0.42); margin-top: 1px;">{{ opt.desc }}</div>
                        </div>
                        <svg v-if="sortById === opt.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00F5A0" stroke-width="2" stroke-linecap="round"><path d="m4 12 5 5 11-11"/></svg>
                    </button>
                </div>
            </IonContent>
        </IonModal>

        <!-- ── Filter Sheet ────────────────────────────────────────────────── -->
        <IonModal :is-open="isFilterOpen" :initial-breakpoint="0.9" :breakpoints="[0, 0.9, 1]" :handle="true" handle-behavior="cycle" class="bottom-sheet-modal" @didDismiss="isFilterOpen = false">
            <IonHeader class="sheet-header">
                <div style="padding: 8px 20px 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: 18px; font-weight: 800; color: #e9edf2; letter-spacing: -0.02em;">Filtros avançados</div>
                            <div v-if="activeFilterCount > 0" style="font-size: 11px; color: #00F5A0; font-weight: 600; margin-top: 2px;">{{ activeFilterCount }} ativo{{ activeFilterCount > 1 ? 's' : '' }}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button style="padding: 7px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); background: transparent; color: rgba(233,237,242,0.42); cursor: pointer; font-size: 12px; font-weight: 700;" @click="clearAdvancedFilters">Limpar</button>
                            <button style="width: 32px; height: 32px; border-radius: 16px; border: none; background: rgba(255,255,255,0.06); color: rgba(233,237,242,0.62); cursor: pointer; display: flex; align-items: center; justify-content: center;" @click="isFilterOpen = false">
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
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); cursor: pointer;" @click="filterRecentOnly = !filterRecentOnly">
                                <div style="font-size: 13px; font-weight: 700; color: #e9edf2;">Atualizados recentemente</div>
                                <div :style="toggleTrack(filterRecentOnly)"><div :style="toggleKnob(filterRecentOnly)"></div></div>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); cursor: pointer;" @click="filterIsAdult = filterIsAdult === true ? null : true">
                                <div style="font-size: 13px; font-weight: 700; color: #e9edf2;">+18 apenas</div>
                                <div :style="toggleTrack(filterIsAdult === true)"><div :style="toggleKnob(filterIsAdult === true)"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
            <IonFooter class="sheet-footer">
                <div style="padding: 12px 20px;">
                    <button style="width: 100%; padding: 13px; border-radius: 12px; border: none; background: #00F5A0; color: #050608; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 0 24px hsl(158 100% 48% / 0.45);" @click="applyFilters">
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
    IonModal, IonHeader, IonFooter,
} from '@ionic/vue';
import { contentService, Content, ContentMeta, ContentType, ContentCatalogStatus, ContentSortField } from '@/services/contentService';
import { discoverService, DiscoverHome } from '@/services/discoverService';
import { authStore } from '@/store/auth';

const SORT_OPTIONS = [
    { id: 'score_desc',   label: 'Mais relevantes',  icon: '◆', desc: 'Score combinado',      apiSort: 'score' as ContentSortField,       apiOrder: 'desc' as const },
    { id: 'popular',      label: 'Mais populares',   icon: '🔥', desc: 'Maior audiência',     apiSort: 'popularity' as ContentSortField,  apiOrder: 'desc' as const },
    { id: 'note_desc',    label: 'Melhor avaliação', icon: '★',  desc: 'Maior nota primeiro',  apiSort: 'rating' as ContentSortField,      apiOrder: 'desc' as const },
    { id: 'votes_desc',   label: 'Mais votados',     icon: '👍', desc: 'Mais avaliações',     apiSort: 'votes_count' as ContentSortField, apiOrder: 'desc' as const },
    { id: 'updated_desc', label: 'Recentes',         icon: '⚡', desc: 'Atualizados primeiro', apiSort: 'updated_at' as ContentSortField,  apiOrder: 'desc' as const },
    { id: 'name_asc',     label: 'Nome A → Z',       icon: '↑',  desc: 'Ordem alfabética',    apiSort: 'name' as ContentSortField,        apiOrder: 'asc' as const },
];

const TYPE_META: Record<string, { color: string; label: string; short: string }> = {
    manga:  { color: '#00F5A0', label: 'MANGA', short: 'M' },
    anime:  { color: '#B8A4FF', label: 'ANIME', short: 'A' },
    novel:  { color: '#F5C542', label: 'NOVEL', short: 'N' },
    movie:  { color: '#FF7EC7', label: 'FILME', short: 'F' },
    tv:     { color: '#7CAEFF', label: 'SÉRIE', short: 'S' },
};

const CAT_STATUS: Record<string, { label: string; color: string }> = {
    ongoing:   { label: 'Em andamento', color: '#00F5A0' },
    completed: { label: 'Completo',     color: '#7da7ff' },
    hiatus:    { label: 'Hiato',        color: '#e6b85c' },
    cancelled: { label: 'Cancelado',    color: '#ef6b6b' },
};

const GENRES = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica', 'Horror', 'Mistério', 'Romance', 'Seinen', 'Shounen', 'Slice of Life', 'Supernatural', 'Thriller'];
const EMPTY_META: ContentMeta = { current_page: 1, last_page: 1, per_page: 20, total: 0, from: 0, to: 0 };

interface HomeSection {
    id: string;
    title: string;
    sub?: string;
    accentColor: string;
    filterType?: ContentType;
    items: Content[];
}

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
            searchFocused: false,
            // Home mode
            homeLoading: false,
            homeData: null as DiscoverHome | null,
            // Statics
            sortOptions: SORT_OPTIONS,
            catStatusOptions: CAT_STATUS,
            genresList: GENRES,
            typeOptions: [
                { label: 'Tudo',   value: null as ContentType | null },
                { label: 'Anime',  value: 'anime' as ContentType },
                { label: 'Mangá',  value: 'manga' as ContentType },
                { label: 'Novel',  value: 'novel' as ContentType },
                { label: 'Filmes', value: 'movie' as ContentType },
                { label: 'Séries', value: 'tv' as ContentType },
            ],
            typeCategories: [
                { type: 'anime' as ContentType,  label: 'Anime',  icon: '🎌', color: '#B8A4FF' },
                { type: 'manga' as ContentType,  label: 'Mangá',  icon: '📖', color: '#00F5A0' },
                { type: 'movie' as ContentType,  label: 'Filme',  icon: '🎬', color: '#f472b6' },
                { type: 'tv' as ContentType,     label: 'Série',  icon: '📺', color: '#22d3ee' },
                { type: 'novel' as ContentType,  label: 'Novel',  icon: '✍️', color: '#fbbf24' },
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
        homeSections(): HomeSection[] {
            if (!this.homeData) return [];
            const d = this.homeData;
            const sections: HomeSection[] = [];

            if (d.trending?.length) {
                sections.push({ id: 'trending', title: 'Em alta agora', sub: 'Os mais populares do momento', accentColor: '#f472b6', items: d.trending });
            }
            if (d.top_anime?.length) {
                sections.push({ id: 'top_anime', title: 'Animes em destaque', sub: 'Os mais bem avaliados', accentColor: '#B8A4FF', filterType: 'anime', items: d.top_anime });
            }
            if (d.popular_manga?.length) {
                sections.push({ id: 'popular_manga', title: 'Mangás mais populares', sub: 'Maior audiência no catálogo', accentColor: '#00F5A0', filterType: 'manga', items: d.popular_manga });
            }
            if (d.movies_and_tv?.length) {
                sections.push({ id: 'movies_and_tv', title: 'Filmes & Séries', sub: 'Para assistir agora', accentColor: '#22d3ee', items: d.movies_and_tv });
            }
            if (d.recommendations?.length) {
                const genres = (d.user_top_genres ?? []).slice(0, 2).join(', ');
                sections.push({ id: 'recommendations', title: 'Recomendado para você', sub: genres ? `Baseado em: ${genres}` : 'Baseado no seu histórico', accentColor: '#fbbf24', items: d.recommendations });
            }
            if (d.top_rated?.length) {
                sections.push({ id: 'top_rated', title: 'Melhor avaliados', sub: 'Score acima de 7.5', accentColor: '#00F5A0', items: d.top_rated });
            }
            if (d.completed_works?.length) {
                sections.push({ id: 'completed_works', title: 'Obras finalizadas', sub: 'Completas para maratonar', accentColor: '#60a5fa', items: d.completed_works });
            }
            if (d.top_novels?.length) {
                sections.push({ id: 'top_novels', title: 'Novels em destaque', sub: 'Light novels e Web novels', accentColor: '#fbbf24', filterType: 'novel', items: d.top_novels });
            }
            if (d.recently_updated?.length) {
                sections.push({ id: 'recently_updated', title: 'Atualizados recentemente', sub: 'Novos capítulos disponíveis', accentColor: '#00F5A0', items: d.recently_updated });
            }
            if (d.new_additions?.length) {
                sections.push({ id: 'new_additions', title: 'Recém adicionados', sub: 'Chegaram no catálogo', accentColor: '#B8A4FF', items: d.new_additions });
            }
            return sections;
        },
        sortBtnStyle(): Record<string, string> {
            return { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.025)', outline: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.18s' };
        },
        filterBtnStyle(): Record<string, string> {
            const active = this.activeFilterCount > 0;
            return { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: active ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.025)', outline: active ? '1px solid rgba(167,139,250,0.4)' : '1px solid rgba(255,255,255,0.06)', transition: 'all 0.18s' };
        },
    },
    async ionViewWillEnter() {
        if (!this.isSearchMode && !this.homeData) {
            await this.loadHome();
        }
    },
    methods: {
        async loadHome() {
            this.homeLoading = true;
            try {
                this.homeData = await discoverService.getHome();
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

        async handleInfiniteScroll(event: CustomEvent) {
            const nextPage = this.meta.current_page + 1;
            if (nextPage > this.meta.last_page) { (event.target as HTMLElement & { complete(): void }).complete(); return; }
            try {
                const result = await contentService.getAll({ ...this.buildFilters(), page: nextPage });
                this.contents.push(...result.items);
                this.meta = result.meta;
            } catch { /* silent */ } finally { (event.target as HTMLElement & { complete(): void }).complete(); }
        },

        onSearchInput(ev: Event) {
            this.query = (ev.target as HTMLInputElement).value;
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => { if (this.isSearchMode) this.loadContents(); }, 400);
        },

        clearQuery() {
            this.query = '';
            if (!this.activeType) { /* stay home */ }
            else { this.loadContents(); }
        },

        setType(type: ContentType | null) {
            this.activeType = type;
            if (type) this.loadContents();
        },

        goToType(type: ContentType) {
            this.activeType = type;
            this.loadContents();
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
            const col = val ? (TYPE_META[val]?.color ?? '#00F5A0') : '#e9edf2';
            return {
                padding: '7px 15px', borderRadius: '20px', border: 'none',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: '0',
                background: active ? col + '22' : 'transparent',
                color: active ? col : 'rgba(233,237,242,0.62)',
                outline: active ? `1.5px solid ${col}55` : '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.18s',
            };
        },
        typePillStyle(type: string): Record<string, string> {
            const col = TYPE_META[type]?.color ?? '#00F5A0';
            return { fontSize: '9px', fontWeight: '700', letterSpacing: '0.06em', color: col, background: col + '22', padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase', flexShrink: '0', display: 'inline-block' };
        },
        typeLabel(type: string): string { return TYPE_META[type]?.label ?? type.toUpperCase(); },
        typeShortLabel(type: string): string { return TYPE_META[type]?.short ?? '?'; },
        heroFallbackStyle(type: string): Record<string, string> {
            const col = TYPE_META[type]?.color ?? '#00F5A0';
            return { background: `linear-gradient(135deg, ${col}22, rgba(255,255,255,0.02))` };
        },
        sortOptionStyle(id: string): Record<string, string> {
            const active = this.sortById === id;
            return { width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer', marginBottom: '4px', background: active ? 'hsl(158 100% 48% / 0.08)' : 'transparent', outline: active ? '1px solid hsl(158 100% 48% / 0.3)' : '1px solid hsl(0 0% 100% / 0.06)', textAlign: 'left', transition: 'all 0.15s' };
        },
        sortIconStyle(id: string): Record<string, string> {
            const active = this.sortById === id;
            return { width: '36px', height: '36px', borderRadius: '10px', flexShrink: '0', background: active ? 'hsl(158 100% 48% / 0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', color: active ? '#00F5A0' : 'hsl(213 10% 45%)' };
        },
        catStatusChipStyle(key: string, color: string): Record<string, string> {
            const active = this.filterCatStatuses.includes(key);
            return { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', background: active ? color + '22' : 'hsl(222 24% 7%)', color: active ? color : 'hsl(213 15% 65%)', outline: active ? `1.5px solid ${color}55` : '1px solid hsl(0 0% 100% / 0.06)', transition: 'all 0.15s' };
        },
        genreChipStyle(g: string): Record<string, string> {
            const active = this.filterGenres.includes(g);
            return { padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', background: active ? 'hsl(158 100% 48% / 0.12)' : 'hsl(222 24% 7%)', color: active ? '#00F5A0' : 'hsl(213 15% 65%)', outline: active ? '1.5px solid hsl(158 100% 48% / 0.35)' : '1px solid hsl(0 0% 100% / 0.06)', transition: 'all 0.15s' };
        },
        toggleTrack(active: boolean): Record<string, string> {
            return { width: '44px', height: '26px', borderRadius: '13px', position: 'relative', background: active ? '#00F5A0' : 'hsl(0 0% 100% / 0.08)', transition: 'background 0.2s', flexShrink: '0' };
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

.search-input::placeholder { color: hsl(213 10% 40%); }
.search-input:focus { border-color: #00F5A0 !important; box-shadow: 0 0 0 3px hsl(158 100% 48% / 0.12) !important; }

.filter-label {
    font-size: 10px; font-weight: 800; color: rgba(233,237,242,0.42);
    text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 10px;
}

.poster-card:active { opacity: 0.85; transform: scale(0.97); }

.skeleton {
    background: rgba(255,255,255,0.04);
    animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
</style>

<style>
ion-modal.bottom-sheet-modal::part(content) {
    background: hsl(222 24% 7%);
    border-top: 1px solid hsl(0 0% 100% / 0.06);
    border-radius: 24px 24px 0 0;
}
.sheet-content  { --background: hsl(222 24% 7%); }
.sheet-header   { --background: hsl(222 24% 7%); box-shadow: none; }
.sheet-footer   { --background: hsl(222 24% 7%); border-top: 1px solid hsl(0 0% 100% / 0.06); box-shadow: none; }
</style>
