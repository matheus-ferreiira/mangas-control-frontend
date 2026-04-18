<template>
  <div class="manga-card" @click="$emit('click')">
    <div class="cover-wrap">
      <img
        v-if="userManga.manga?.cover_url"
        :src="userManga.manga.cover_url"
        :alt="userManga.manga?.name"
        class="cover-img"
      />
      <div v-else class="cover-placeholder">
        <ion-icon :icon="bookOutline" />
      </div>
    </div>
    <div class="info">
      <h3 class="manga-name">{{ userManga.manga?.name || 'Unknown' }}</h3>
      <p class="chapter-info">Chapter {{ userManga.current_chapter }}</p>
      <div class="bottom-row">
        <status-badge :status="userManga.status" />
        <span v-if="userManga.site" class="site-tag">{{ userManga.site.name }}</span>
      </div>
    </div>
    <ion-icon :icon="chevronForwardOutline" class="chevron" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonIcon } from '@ionic/vue'
import { bookOutline, chevronForwardOutline } from 'ionicons/icons'
import { UserManga } from '@/services/userMangaService'
import StatusBadge from './StatusBadge.vue'

export default defineComponent({
  name: 'MangaCard',
  components: { IonIcon, StatusBadge },
  emits: ['click'],
  props: {
    userManga: {
      type: Object as PropType<UserManga>,
      required: true,
    },
  },
  data() {
    return { bookOutline, chevronForwardOutline }
  },
})
</script>

<style scoped>
.manga-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--neon-surface);
  border: 1px solid var(--neon-border);
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.manga-card:active {
  transform: scale(0.98);
  border-color: var(--neon-accent);
}

.cover-wrap {
  flex-shrink: 0;
  width: 64px;
  height: 88px;
  border-radius: 10px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: var(--neon-surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neon-text-muted);
  font-size: 28px;
}

.info {
  flex: 1;
  min-width: 0;
}

.manga-name {
  font-size: 15px;
  font-weight: 700;
  color: #e8eaf0;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-info {
  font-size: 13px;
  color: var(--neon-text-muted);
  margin: 0 0 8px;
}

.bottom-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.site-tag {
  font-size: 11px;
  color: var(--neon-text-muted);
  background: var(--neon-surface-elevated);
  border-radius: 6px;
  padding: 2px 8px;
}

.chevron {
  color: var(--neon-text-muted);
  font-size: 18px;
  flex-shrink: 0;
}
</style>
