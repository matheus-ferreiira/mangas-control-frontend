<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="light" />
        </ion-buttons>
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
      <!-- Hero -->
      <div class="hero-section">
        <div class="badge-pill">REGISTRY PHASE</div>
        <h1 class="hero-title">
          Expand Your<br />
          <span class="title-gradient">Digital Archives</span>
        </h1>
        <p class="hero-sub">
          Integrate new manga sources into your curator's cloud. Our system will index
          metadata and chapter updates automatically.
        </p>
      </div>

      <div class="page-body">
        <!-- Add form -->
        <div class="form-card">
          <div class="field-group">
            <span class="neon-label">Site Name</span>
            <div class="input-row">
              <input
                v-model="form.name"
                placeholder="e.g. Manga Vault"
                class="field-input"
              />
            </div>
          </div>

          <div class="field-group">
            <span class="neon-label">Site URL</span>
            <div class="input-row">
              <input
                v-model="form.url"
                placeholder="https://mangavault.com"
                type="url"
                class="field-input"
              />
            </div>
          </div>

          <ion-button
            expand="block"
            class="add-btn"
            :disabled="saving || !canSubmit"
            @click="editingId ? updateSite() : addSite()"
          >
            <ion-spinner v-if="saving" name="crescent" />
            <span v-else>{{ editingId ? 'Update Source' : 'Add Source' }}</span>
          </ion-button>

          <ion-button
            v-if="editingId"
            expand="block"
            fill="solid"
            class="cancel-btn"
            @click="cancelEdit"
          >
            Cancel
          </ion-button>

          <p class="form-disclaimer">
            By adding a source, you confirm that the URL points to a valid web archive.
            Encrypted synchronization will begin immediately.
          </p>
        </div>

        <!-- Trust badges -->
        <div class="trust-row">
          <div class="trust-badge">
            <div class="trust-icon-wrap trust-green">
              <ion-icon :icon="shieldCheckmarkOutline" />
            </div>
            <div class="trust-text">
              <span class="trust-cat">SECURITY</span>
              <span class="trust-val">SSL Verified</span>
            </div>
          </div>
          <div class="trust-badge">
            <div class="trust-icon-wrap trust-blue">
              <ion-icon :icon="serverOutline" />
            </div>
            <div class="trust-text">
              <span class="trust-cat">STORAGE</span>
              <span class="trust-val">Cloud Sync</span>
            </div>
          </div>
        </div>

        <!-- Sites list -->
        <div class="sites-section">
          <div class="section-header">
            <h2 class="section-title">Registered Sources</h2>
            <span class="count-badge" v-if="sites.length">{{ sites.length }}</span>
          </div>

          <div v-if="loading" class="loading-state">
            <ion-spinner name="crescent" color="primary" />
          </div>

          <div v-else-if="sites.length === 0" class="empty-state">
            <ion-icon :icon="cloudDownloadOutline" class="empty-icon" />
            <p>No sources registered yet.</p>
          </div>

          <div v-else>
            <div v-for="site in sites" :key="site.id" class="site-row">
              <div class="site-info">
                <div class="site-icon-wrap">
                  <ion-icon :icon="globeOutline" />
                </div>
                <div class="site-text">
                  <span class="site-name">{{ site.name }}</span>
                  <span class="site-url">{{ site.url }}</span>
                </div>
              </div>
              <div class="site-actions">
                <button class="action-btn edit-btn" @click="startEdit(site)">
                  <ion-icon :icon="pencilOutline" />
                </button>
                <button class="action-btn del-btn" @click="confirmDelete(site)">
                  <ion-icon :icon="trashOutline" />
                </button>
              </div>
            </div>
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
  IonMenuButton, IonButton, IonIcon, IonSpinner,
  toastController, alertController,
} from '@ionic/vue'
import {
  personCircleOutline, shieldCheckmarkOutline, serverOutline,
  cloudDownloadOutline, globeOutline, pencilOutline, trashOutline,
} from 'ionicons/icons'
import { siteService, Site } from '@/services/siteService'

export default defineComponent({
  name: 'ManageSitesPage',
  components: {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonButton, IonIcon, IonSpinner,
  },
  data() {
    return {
      loading: false,
      saving: false,
      sites: [] as Site[],
      editingId: null as number | null,
      form: { name: '', url: '' },
      personCircleOutline, shieldCheckmarkOutline, serverOutline,
      cloudDownloadOutline, globeOutline, pencilOutline, trashOutline,
    }
  },
  computed: {
    canSubmit(): boolean {
      return !!(this.form.name.trim() && this.form.url.trim())
    },
  },
  async ionViewWillEnter() {
    await this.loadSites()
  },
  methods: {
    async loadSites() {
      this.loading = true
      try {
        this.sites = await siteService.getAll()
      } catch {
        // non-blocking
      } finally {
        this.loading = false
      }
    },

    async addSite() {
      if (!this.canSubmit) return
      this.saving = true
      try {
        const site = await siteService.create({ name: this.form.name.trim(), url: this.form.url.trim() })
        this.sites.push(site)
        this.form = { name: '', url: '' }
        await this.showToast('Source added!', 'success')
      } catch {
        await this.showToast('Failed to add source.', 'danger')
      } finally {
        this.saving = false
      }
    },

    startEdit(site: Site) {
      this.editingId = site.id
      this.form = { name: site.name, url: site.url }
    },

    cancelEdit() {
      this.editingId = null
      this.form = { name: '', url: '' }
    },

    async updateSite() {
      if (!this.editingId || !this.canSubmit) return
      this.saving = true
      try {
        const updated = await siteService.update(this.editingId, {
          name: this.form.name.trim(),
          url: this.form.url.trim(),
        })
        const idx = this.sites.findIndex((s) => s.id === this.editingId)
        if (idx !== -1) this.sites[idx] = updated
        this.cancelEdit()
        await this.showToast('Source updated!', 'success')
      } catch {
        await this.showToast('Failed to update source.', 'danger')
      } finally {
        this.saving = false
      }
    },

    async confirmDelete(site: Site) {
      const alert = await alertController.create({
        header: 'Remove Source',
        message: `Remove "${site.name}" from your archive?`,
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Remove',
            role: 'destructive',
            handler: () => this.deleteSite(site.id),
          },
        ],
      })
      await alert.present()
    },

    async deleteSite(id: number) {
      try {
        await siteService.delete(id)
        this.sites = this.sites.filter((s) => s.id !== id)
        await this.showToast('Source removed.', 'success')
      } catch {
        await this.showToast('Failed to remove source.', 'danger')
      }
    },

    async showToast(message: string, color: string) {
      const toast = await toastController.create({ message, duration: 2000, color, position: 'top' })
      await toast.present()
    },
  },
})
</script>

<style scoped>
.toolbar-title { font-weight: 800; font-size: 18px; }

.title-gradient {
  background: linear-gradient(135deg, #5b6ee1, #00e5b0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-avatar-btn {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--neon-surface-elevated); border: 1.5px solid var(--neon-border);
  display: flex; align-items: center; justify-content: center; margin-right: 4px;
}
.user-avatar-btn ion-icon { font-size: 22px; color: var(--neon-text-muted); }

/* Hero */
.hero-section {
  padding: 28px 20px 0;
}

.badge-pill {
  display: inline-block;
  background: rgba(0, 229, 176, 0.12);
  border: 1px solid rgba(0, 229, 176, 0.3);
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--neon-accent);
  margin-bottom: 14px;
}

.hero-title {
  font-size: 30px;
  font-weight: 900;
  color: #e8eaf0;
  line-height: 1.2;
  margin: 0 0 12px;
}

.hero-sub {
  font-size: 14px;
  color: var(--neon-text-muted);
  line-height: 1.6;
  margin: 0 0 24px;
}

/* Page body */
.page-body { padding: 0 20px 100px; }

/* Form card */
.form-card {
  background: var(--neon-surface);
  border: 1px solid var(--neon-border);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
}

.field-group { margin-bottom: 16px; }

.neon-label {
  font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; color: var(--neon-text-muted);
  margin-bottom: 8px; display: block;
}

.input-row {
  background: var(--neon-surface-elevated);
  border: 1px solid var(--neon-border);
  border-radius: 12px;
  transition: border-color 0.2s;
}
.input-row:focus-within { border-color: rgba(0, 229, 176, 0.3); }

.field-input {
  width: 100%; background: transparent; border: none; outline: none;
  color: #e8eaf0; font-size: 15px; padding: 14px 16px; box-sizing: border-box;
}
.field-input::placeholder { color: #4a5568; }

.add-btn {
  --background: var(--neon-accent); --color: #000;
  --border-radius: 14px; font-weight: 700; height: 52px;
  margin-bottom: 10px;
}

.cancel-btn {
  --background: var(--neon-surface-elevated); --color: #e8eaf0;
  --border-radius: 14px; height: 44px; margin-bottom: 10px;
}

.form-disclaimer {
  font-size: 11px; color: #4a5568; text-align: center;
  margin: 8px 0 0; line-height: 1.5;
}

/* Trust badges */
.trust-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px;
}

.trust-badge {
  background: var(--neon-surface); border: 1px solid var(--neon-border);
  border-radius: 14px; padding: 14px; display: flex; align-items: center; gap: 12px;
}

.trust-icon-wrap {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
}
.trust-green { background: rgba(0, 229, 176, 0.12); color: var(--neon-accent); }
.trust-blue { background: rgba(91, 110, 225, 0.12); color: #7b8ff5; }

.trust-text { display: flex; flex-direction: column; min-width: 0; }
.trust-cat { font-size: 9px; font-weight: 700; letter-spacing: 1px; color: var(--neon-text-muted); }
.trust-val { font-size: 13px; font-weight: 700; color: #e8eaf0; }

/* Sites list */
.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.section-title { font-size: 18px; font-weight: 800; color: #e8eaf0; margin: 0; }
.count-badge {
  background: var(--neon-accent-dim); border: 1px solid rgba(0, 229, 176, 0.2);
  color: var(--neon-accent); border-radius: 20px; padding: 2px 10px;
  font-size: 12px; font-weight: 700;
}

.loading-state { display: flex; justify-content: center; padding: 30px 0; }

.empty-state { text-align: center; padding: 30px 0; }
.empty-icon { font-size: 40px; color: var(--neon-text-muted); display: block; margin-bottom: 10px; }
.empty-state p { font-size: 14px; color: var(--neon-text-muted); margin: 0; }

.site-row {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--neon-surface); border: 1px solid var(--neon-border);
  border-radius: 14px; padding: 14px; margin-bottom: 10px;
}

.site-info { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }

.site-icon-wrap {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--neon-surface-elevated); border: 1px solid var(--neon-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--neon-accent); font-size: 18px; flex-shrink: 0;
}

.site-text { display: flex; flex-direction: column; min-width: 0; }
.site-name { font-size: 14px; font-weight: 700; color: #e8eaf0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.site-url { font-size: 12px; color: var(--neon-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.site-actions { display: flex; gap: 8px; flex-shrink: 0; margin-left: 8px; }

.action-btn {
  width: 34px; height: 34px; border-radius: 10px;
  background: var(--neon-surface-elevated); border: 1px solid var(--neon-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.edit-btn { color: #7b8ff5; }
.del-btn { color: var(--neon-danger); }
</style>
