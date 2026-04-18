<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/tabs/library" text="" />
                </ion-buttons>
                <ion-title>Detail</ion-title>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="confirmDelete">
                        <ion-icon
                            slot="icon-only"
                            :icon="trashOutline"
                            color="danger"
                        />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <!-- Loading -->
            <div v-if="loading" class="loading-state">
                <ion-spinner name="crescent" color="primary" />
            </div>

            <div v-else-if="item">
                <!-- Hero cover -->
                <div class="hero-section">
                    <img
                        v-if="item.manga?.cover_url"
                        :src="item.manga.cover_url"
                        class="hero-img"
                        alt="Cover"
                    />
                    <div v-else class="hero-placeholder">
                        <ion-icon :icon="bookOutline" />
                    </div>
                    <div class="hero-overlay">
                        <status-badge :status="item.status" />
                        <h1 class="hero-title">{{ item.manga?.name }}</h1>
                    </div>
                </div>

                <div class="detail-body">
                    <!-- Stats row -->
                    <div class="stats-row">
                        <div class="stat-item">
                            <span class="stat-label">Current</span>
                            <span class="stat-value"
                                >Ch. {{ item.current_chapter }}</span
                            >
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <span class="stat-label">Total</span>
                            <span class="stat-value">
                                {{
                                    item.manga?.total_chapters
                                        ? `Ch. ${item.manga.total_chapters}`
                                        : '—'
                                }}
                            </span>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <span class="stat-label">Source</span>
                            <span class="stat-value">{{
                                item.site?.name || '—'
                            }}</span>
                        </div>
                    </div>

                    <!-- Chapter controls -->
                    <div class="section-block">
                        <span class="neon-label">Chapter Progress</span>
                        <div class="chapter-controls">
                            <button
                                class="ctrl-btn"
                                @click="decrement"
                                :disabled="saving"
                            >
                                <ion-icon :icon="removeOutline" />
                            </button>
                            <div class="chapter-display">
                                <input
                                    v-if="editingChapter"
                                    v-model.number="chapterInput"
                                    type="number"
                                    class="chapter-input"
                                    @blur="saveChapter"
                                    @keyup.enter="saveChapter"
                                    ref="chapterField"
                                    min="0"
                                />
                                <span
                                    v-else
                                    class="chapter-number"
                                    @click="startEditChapter"
                                >
                                    {{ item.current_chapter }}
                                </span>
                                <span class="chapter-sub">Tap to edit</span>
                            </div>
                            <button
                                class="ctrl-btn ctrl-add"
                                @click="increment"
                                :disabled="saving"
                            >
                                <ion-icon :icon="addOutline" />
                            </button>
                        </div>
                    </div>

                    <!-- Status -->
                    <div class="section-block">
                        <span class="neon-label">Status</span>
                        <div class="status-grid">
                            <button
                                v-for="s in statuses"
                                :key="s.value"
                                class="status-opt"
                                :class="{ active: item.status === s.value }"
                                @click="changeStatus(s.value)"
                            >
                                {{ s.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Site -->
                    <div class="section-block" v-if="sites.length">
                        <span class="neon-label">Reading Source</span>
                        <div class="site-select-wrap">
                            <select
                                v-model="selectedSiteId"
                                class="site-select"
                                @change="changeSite"
                            >
                                <option value="">No site</option>
                                <option
                                    v-for="site in sites"
                                    :key="site.id"
                                    :value="site.id"
                                >
                                    {{ site.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Delete -->
                    <ion-button
                        expand="block"
                        fill="outline"
                        color="danger"
                        class="delete-btn"
                        @click="confirmDelete"
                    >
                        <ion-icon slot="start" :icon="trashOutline" />
                        Remove from Library
                    </ion-button>
                </div>
            </div>
        </ion-content>

        <!-- Loading overlay -->
        <ion-loading :is-open="saving" message="Saving..." spinner="crescent" />
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonSpinner,
    IonLoading,
    toastController,
    alertController,
} from '@ionic/vue';
import {
    bookOutline,
    addOutline,
    removeOutline,
    trashOutline,
} from 'ionicons/icons';
import {
    userMangaService,
    UserManga,
    MangaStatus,
    STATUS_LABELS,
} from '@/services/userMangaService';
import { siteService, Site } from '@/services/siteService';
import StatusBadge from '@/components/StatusBadge.vue';

export default defineComponent({
    name: 'MangaDetailPage',
    components: {
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonButtons,
        IonBackButton,
        IonButton,
        IonIcon,
        IonSpinner,
        IonLoading,
        StatusBadge,
    },
    data() {
        return {
            loading: false,
            saving: false,
            item: null as UserManga | null,
            sites: [] as Site[],
            editingChapter: false,
            chapterInput: 0,
            selectedSiteId: '' as string | number,
            bookOutline,
            addOutline,
            removeOutline,
            trashOutline,
            statuses: Object.entries(STATUS_LABELS).map(([value, label]) => ({
                value: value as MangaStatus,
                label,
            })),
        };
    },
    async ionViewWillEnter() {
        await this.loadData();
    },
    methods: {
        async loadData() {
            this.loading = true;
            const id = Number(this.$route.params.id);
            try {
                const [item, sites] = await Promise.all([
                    userMangaService.getOne(id),
                    siteService.getAll(),
                ]);
                this.item = item;
                this.sites = sites;
                this.selectedSiteId = item.site_id ?? '';
            } catch {
                const toast = await toastController.create({
                    message: 'Failed to load manga.',
                    duration: 2000,
                    color: 'danger',
                    position: 'top',
                });
                await toast.present();
                this.$router.back();
            } finally {
                this.loading = false;
            }
        },

        async increment() {
            if (!this.item) return;
            this.saving = true;
            try {
                this.item = await userMangaService.increment(this.item.id);
            } catch {
                await this.showError('Failed to update chapter.');
            } finally {
                this.saving = false;
            }
        },

        async decrement() {
            if (!this.item) return;
            this.saving = true;
            try {
                this.item = await userMangaService.decrement(this.item.id);
            } catch {
                await this.showError('Failed to update chapter.');
            } finally {
                this.saving = false;
            }
        },

        async startEditChapter() {
            if (!this.item) return;
            this.chapterInput = this.item.current_chapter;
            this.editingChapter = true;
            await nextTick();
            (this.$refs.chapterField as HTMLInputElement)?.focus();
        },

        async saveChapter() {
            if (!this.item) return;
            this.editingChapter = false;
            if (this.chapterInput === this.item.current_chapter) return;
            this.saving = true;
            try {
                this.item = await userMangaService.update(this.item.id, {
                    current_chapter: this.chapterInput,
                });
            } catch {
                await this.showError('Failed to save chapter.');
            } finally {
                this.saving = false;
            }
        },

        async changeStatus(status: MangaStatus) {
            if (!this.item || this.item.status === status) return;
            this.saving = true;
            try {
                this.item = await userMangaService.update(this.item.id, {
                    status,
                });
            } catch {
                await this.showError('Failed to update status.');
            } finally {
                this.saving = false;
            }
        },

        async changeSite() {
            if (!this.item) return;
            this.saving = true;
            try {
                this.item = await userMangaService.update(this.item.id, {
                    site_id: this.selectedSiteId
                        ? Number(this.selectedSiteId)
                        : undefined,
                });
            } catch {
                await this.showError('Failed to update source.');
            } finally {
                this.saving = false;
            }
        },

        async confirmDelete() {
            const alert = await alertController.create({
                header: 'Remove Manga',
                message: 'Remove this manga from your library?',
                cssClass: 'neon-alert',
                buttons: [
                    { text: 'Cancel', role: 'cancel' },
                    {
                        text: 'Remove',
                        role: 'destructive',
                        cssClass: 'danger-btn',
                        handler: () => this.deleteManga(),
                    },
                ],
            });
            await alert.present();
        },

        async deleteManga() {
            if (!this.item) return;
            this.saving = true;
            try {
                await userMangaService.delete(this.item.id);
                const toast = await toastController.create({
                    message: 'Manga removed from library.',
                    duration: 2000,
                    color: 'success',
                    position: 'top',
                });
                await toast.present();
                this.$router.back();
            } catch {
                await this.showError('Failed to remove manga.');
            } finally {
                this.saving = false;
            }
        },

        async showError(msg: string) {
            const toast = await toastController.create({
                message: msg,
                duration: 2000,
                color: 'danger',
                position: 'top',
            });
            await toast.present();
        },
    },
});
</script>

<style scoped>
/* Hero */
.hero-section {
    position: relative;
    width: 100%;
    height: 280px;
}

.hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #0d1a2d 0%, #1a0d2e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80px;
    color: #2a3550;
}

.hero-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background: linear-gradient(
        to top,
        rgba(10, 14, 26, 1) 0%,
        transparent 100%
    );
}

.hero-title {
    font-size: 24px;
    font-weight: 800;
    color: #e8eaf0;
    margin: 8px 0 0;
    line-height: 1.2;
}

/* Body */
.detail-body {
    padding: 20px 20px 100px;
}

/* Stats */
.stats-row {
    display: flex;
    align-items: center;
    background: var(--neon-surface);
    border: 1px solid var(--neon-border);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 24px;
}

.stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.stat-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--neon-text-muted);
}

.stat-value {
    font-size: 15px;
    font-weight: 700;
    color: #e8eaf0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80px;
    text-align: center;
}

.stat-divider {
    width: 1px;
    height: 32px;
    background: var(--neon-border);
}

/* Section block */
.section-block {
    margin-bottom: 24px;
}

.neon-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--neon-text-muted);
    margin-bottom: 12px;
    display: block;
}

/* Chapter controls */
.chapter-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--neon-surface);
    border: 1px solid var(--neon-border);
    border-radius: 16px;
    padding: 16px;
}

.ctrl-btn {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--neon-surface-elevated);
    border: 1px solid var(--neon-border);
    color: #e8eaf0;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s;
    -webkit-tap-highlight-color: transparent;
}

.ctrl-btn:active {
    background: #212b45;
}

.ctrl-btn:disabled {
    opacity: 0.4;
}

.ctrl-add {
    background: var(--neon-accent-dim);
    border-color: rgba(0, 229, 176, 0.3);
    color: var(--neon-accent);
}

.chapter-display {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.chapter-number {
    font-size: 36px;
    font-weight: 800;
    color: #e8eaf0;
    cursor: pointer;
    line-height: 1;
}

.chapter-input {
    font-size: 36px;
    font-weight: 800;
    color: #e8eaf0;
    background: transparent;
    border: none;
    border-bottom: 2px solid var(--neon-accent);
    outline: none;
    width: 80px;
    text-align: center;
    line-height: 1;
}

.chapter-sub {
    font-size: 11px;
    color: var(--neon-text-muted);
    margin-top: 4px;
}

/* Status grid */
.status-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.status-opt {
    padding: 12px;
    border-radius: 12px;
    background: var(--neon-surface);
    border: 1px solid var(--neon-border);
    color: var(--neon-text-muted);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
    text-align: center;
}

.status-opt.active {
    background: var(--neon-accent-dim);
    border-color: rgba(0, 229, 176, 0.4);
    color: var(--neon-accent);
}

/* Site select */
.site-select-wrap {
    background: var(--neon-surface-elevated);
    border: 1px solid var(--neon-border);
    border-radius: 12px;
    padding: 4px 16px;
}

.site-select {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: #e8eaf0;
    font-size: 15px;
    padding: 12px 0;
    cursor: pointer;
}

.site-select option {
    background: #131929;
}

.delete-btn {
    --border-radius: 14px;
    margin-top: 8px;
}

.loading-state {
    display: flex;
    justify-content: center;
    padding: 80px 0;
}
</style>
