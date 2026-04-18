<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title class="toolbar-title">
          <span class="title-gradient">Neon Curator</span>
        </ion-title>
        <ion-buttons slot="end">
          <div class="user-avatar-btn">
            <ion-icon :icon="personCircleOutline" />
          </div>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Hero section matching screenshot -->
      <div class="hero-section">
        <div class="hero-bg"></div>
        <div class="hero-overlay">
          <div class="badge-pill">
            <ion-icon :icon="ellipseOutline" class="badge-dot" />
            AWAITING CURATOR
          </div>
          <h1 class="hero-title">Catalog New Entry</h1>
          <p class="hero-sub">Initialize a new series in the neon archives. Every volume is a legacy.</p>
        </div>
      </div>

      <div class="form-body">
        <!-- Curator's note -->
        <div class="curator-note">
          <div class="note-header">
            <ion-icon :icon="informationCircleOutline" class="note-icon" />
            <span class="note-title">Curator's Note</span>
          </div>
          <p class="note-text">
            "The quality of the metadata defines the clarity of the collection. Ensure high-resolution imagery for the digital shelf."
          </p>
        </div>

        <!-- Form -->
        <div class="form-section">
          <div class="field-group">
            <span class="neon-label">Manga Name</span>
            <div class="select-wrap" v-if="mangas.length">
              <ion-icon :icon="bookOutline" class="field-icon" />
              <select v-model="form.manga_id" class="native-select">
                <option value="">Select series title...</option>
                <option v-for="m in mangas" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>
            <div v-else class="input-row">
              <ion-icon :icon="bookOutline" class="field-icon-abs" />
              <input v-model="form.manga_name" placeholder="Enter series title..." class="field-input" />
            </div>
          </div>

          <div class="field-group">
            <span class="neon-label">Cover Image URL</span>
            <div class="input-row">
              <ion-icon :icon="linkOutline" class="field-icon-abs" />
              <input v-model="form.cover_url" placeholder="https://..." class="field-input" />
            </div>
            <span class="field-hint">Suggested: High-resolution vertical assets (minimum 800×1200px)</span>
          </div>

          <div class="field-group">
            <span class="neon-label">Total Chapters (Optional)</span>
            <div class="input-row">
              <ion-icon :icon="layersOutline" class="field-icon-abs" />
              <input v-model.number="form.total_chapters" type="number" placeholder="00" class="field-input" min="0" />
            </div>
          </div>

          <div class="field-group">
            <span class="neon-label">Reading Source</span>
            <div class="select-wrap">
              <ion-icon :icon="cloudDownloadOutline" class="field-icon" />
              <select v-model="form.site_id" class="native-select">
                <option value="">Select source...</option>
                <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
          </div>

          <div class="field-group">
            <span class="neon-label">Initial Status</span>
            <div class="select-wrap">
              <ion-icon :icon="bookmarkOutline" class="field-icon" />
              <select v-model="form.status" class="native-select">
                <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>
          </div>

          <div class="field-group">
            <span class="neon-label">Current Chapter</span>
            <div class="input-row">
              <ion-icon :icon="layersOutline" class="field-icon-abs" />
              <input v-model.number="form.current_chapter" type="number" placeholder="0" class="field-input" min="0" />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <ion-button
          expand="block"
          class="add-btn"
          :disabled="saving || !canSubmit"
          @click="addManga"
        >
          <ion-spinner v-if="saving" name="crescent" />
          <template v-else>
            Add Manga
            <ion-icon slot="end" :icon="addCircleOutline" />
          </template>
        </ion-button>

        <ion-button
          expand="block"
          fill="solid"
          class="discard-btn"
          @click="discard"
        >
          Discard
        </ion-button>

        <!-- Feature tiles -->
        <div class="feature-grid">
          <div class="feature-tile">
            <ion-icon :icon="flashOutline" class="feat-icon" />
            <span class="feat-label">FAST SYNC</span>
          </div>
          <div class="feature-tile">
            <ion-icon :icon="tvOutline" class="feat-icon" />
            <span class="feat-label">HD COVER</span>
          </div>
          <div class="feature-tile">
            <ion-icon :icon="cloudUploadOutline" class="feat-icon" />
            <span class="feat-label">AUTO-BACKUP</span>
          </div>
          <div class="feature-tile">
            <ion-icon :icon="searchOutline" class="feat-icon" />
            <span class="feat-label">METADATA FETCH</span>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonSpinner, toastController,
} from '@ionic/vue'
import {
  personCircleOutline, ellipseOutline, informationCircleOutline,
  bookOutline, linkOutline, layersOutline, cloudDownloadOutline,
  bookmarkOutline, addCircleOutline, flashOutline, tvOutline,
  cloudUploadOutline, searchOutline,
} from 'ionicons/icons'
import { mangaService, Manga } from '@/services/mangaService'
import { siteService, Site } from '@/services/siteService'
import { userMangaService, MangaStatus, STATUS_LABELS } from '@/services/userMangaService'

export default defineComponent({
  name: 'AddUserMangaPage',
  components: {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonSpinner,
  },
  data() {
    return {
      saving: false,
      mangas: [] as Manga[],
      sites: [] as Site[],
      form: {
        manga_id: '' as string | number,
        manga_name: '',
        cover_url: '',
        total_chapters: null as number | null,
        site_id: '' as string | number,
        status: 'plan_to_read' as MangaStatus,
        current_chapter: 0,
      },
      statuses: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
      personCircleOutline, ellipseOutline, informationCircleOutline,
      bookOutline, linkOutline, layersOutline, cloudDownloadOutline,
      bookmarkOutline, addCircleOutline, flashOutline, tvOutline,
      cloudUploadOutline, searchOutline,
    }
  },
  computed: {
    canSubmit(): boolean {
      return !!(this.form.manga_id || this.form.manga_name.trim())
    },
  },
  async ionViewWillEnter() {
    await this.loadData()
    this.resetForm()
    const mangaId = this.$route.query.manga_id
    if (mangaId) {
      this.form.manga_id = Number(mangaId)
    }
  },
  methods: {
    async loadData() {
      try {
        const [mangas, sites] = await Promise.all([
          mangaService.getAll(),
          siteService.getAll(),
        ])
        this.mangas = mangas
        this.sites = sites
      } catch {
        // non-blocking
      }
    },

    resetForm() {
      this.form = {
        manga_id: '',
        manga_name: '',
        cover_url: '',
        total_chapters: null,
        site_id: '',
        status: 'plan_to_read',
        current_chapter: 0,
      }
    },

    async addManga() {
      this.saving = true
      try {
        let mangaId = this.form.manga_id ? Number(this.form.manga_id) : null

        if (!mangaId && this.form.manga_name.trim()) {
          const created = await mangaService.create({
            name: this.form.manga_name.trim(),
            cover_url: this.form.cover_url || undefined,
            total_chapters: this.form.total_chapters || undefined,
          })
          mangaId = created.id
        }

        if (!mangaId) return

        await userMangaService.create({
          manga_id: mangaId,
          site_id: this.form.site_id ? Number(this.form.site_id) : undefined,
          status: this.form.status,
          current_chapter: this.form.current_chapter,
        })

        const toast = await toastController.create({
          message: 'Manga added to your library!',
          duration: 2000,
          color: 'success',
          position: 'top',
        })
        await toast.present()
        this.resetForm()
        this.$router.push('/tabs/library')
      } catch {
        const toast = await toastController.create({
          message: 'Failed to add manga.',
          duration: 2000,
          color: 'danger',
          position: 'top',
        })
        await toast.present()
      } finally {
        this.saving = false
      }
    },

    discard() {
      this.resetForm()
      this.$router.push('/tabs/library')
    },
  },
})
</script>

<style scoped>
.toolbar-title {
  font-weight: 800;
  font-size: 18px;
}

.title-gradient {
  background: linear-gradient(135deg, #5b6ee1, #00e5b0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-avatar-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--neon-surface-elevated);
  border: 1.5px solid var(--neon-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
}

.user-avatar-btn ion-icon {
  font-size: 22px;
  color: var(--neon-text-muted);
}

/* Hero */
.hero-section {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, #1a2040 0%, #0a0e1a 70%);
}

.hero-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e2538' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 20px;
  background: linear-gradient(to top, rgba(10, 14, 26, 1) 0%, transparent 100%);
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 229, 176, 0.12);
  border: 1px solid rgba(0, 229, 176, 0.3);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--neon-accent);
  margin-bottom: 12px;
}

.badge-dot {
  font-size: 8px;
  color: var(--neon-accent);
}

.hero-title {
  font-size: 26px;
  font-weight: 800;
  color: #e8eaf0;
  margin: 0 0 6px;
  line-height: 1.2;
}

.hero-sub {
  font-size: 13px;
  color: #6b7a99;
  margin: 0;
  line-height: 1.5;
}

/* Form body */
.form-body {
  padding: 20px 20px 100px;
}

/* Curator note */
.curator-note {
  background: rgba(91, 110, 225, 0.08);
  border: 1px solid rgba(91, 110, 225, 0.2);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 24px;
}

.note-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.note-icon {
  color: #5b6ee1;
  font-size: 18px;
}

.note-title {
  font-size: 13px;
  font-weight: 700;
  color: #7b8ff5;
}

.note-text {
  font-size: 13px;
  color: #6b7a99;
  margin: 0;
  font-style: italic;
  line-height: 1.5;
}

/* Form section */
.form-section {
  margin-bottom: 20px;
}

.field-group {
  margin-bottom: 16px;
}

.neon-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--neon-text-muted);
  margin-bottom: 8px;
  display: block;
}

.input-row {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--neon-surface-elevated);
  border: 1px solid var(--neon-border);
  border-radius: 12px;
  transition: border-color 0.2s;
}

.input-row:focus-within {
  border-color: rgba(0, 229, 176, 0.3);
}

.field-icon-abs {
  position: absolute;
  left: 14px;
  color: #4a5568;
  font-size: 18px;
  pointer-events: none;
}

.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e8eaf0;
  font-size: 15px;
  padding: 14px 14px 14px 44px;
  width: 100%;
}

.field-input::placeholder {
  color: #4a5568;
}

.field-hint {
  font-size: 11px;
  color: #4a5568;
  margin-top: 6px;
  display: block;
}

.select-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--neon-surface-elevated);
  border: 1px solid var(--neon-border);
  border-radius: 12px;
  padding: 0 14px;
}

.field-icon {
  color: #4a5568;
  font-size: 18px;
  flex-shrink: 0;
}

.native-select {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e8eaf0;
  font-size: 15px;
  padding: 14px 0;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}

.native-select option {
  background: #131929;
}

/* Buttons */
.add-btn {
  --background: var(--neon-accent);
  --color: #000;
  --border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  height: 52px;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.discard-btn {
  --background: #1a2035;
  --color: #e8eaf0;
  --border-radius: 14px;
  font-weight: 600;
  height: 52px;
  margin-bottom: 28px;
}

/* Feature grid */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.feature-tile {
  background: var(--neon-surface);
  border: 1px solid var(--neon-border);
  border-radius: 14px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.feat-icon {
  font-size: 28px;
  color: var(--neon-accent);
}

.feat-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--neon-text-muted);
  text-align: center;
}
</style>
