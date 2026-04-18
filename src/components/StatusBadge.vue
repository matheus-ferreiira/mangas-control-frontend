<template>
  <span class="status-badge" :class="statusClass">{{ label }}</span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { MangaStatus, STATUS_LABELS } from '@/services/userMangaService'

export default defineComponent({
  name: 'StatusBadge',
  props: {
    status: {
      type: String as PropType<MangaStatus>,
      required: true,
    },
  },
  computed: {
    label(): string {
      return STATUS_LABELS[this.status] || this.status
    },
    statusClass(): string {
      return `status-${this.status.replace('_', '-')}`
    },
  },
})
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.status-reading {
  background: rgba(0, 229, 176, 0.15);
  color: #00e5b0;
  border: 1px solid rgba(0, 229, 176, 0.3);
}

.status-completed {
  background: rgba(91, 110, 225, 0.15);
  color: #7b8ff5;
  border: 1px solid rgba(91, 110, 225, 0.3);
}

.status-plan-to-read {
  background: rgba(107, 122, 153, 0.15);
  color: #8892a4;
  border: 1px solid rgba(107, 122, 153, 0.3);
}

.status-dropped {
  background: rgba(255, 71, 87, 0.15);
  color: #ff6b7a;
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.status-on-hold {
  background: rgba(255, 162, 107, 0.15);
  color: #ffa26b;
  border: 1px solid rgba(255, 162, 107, 0.3);
}
</style>
