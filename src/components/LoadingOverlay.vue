<template>
  <v-overlay
    v-model="isVisible"
    class="loading-overlay"
    persistent
    contained
  >
    <div class="loading-content">
      <v-progress-circular
        indeterminate
        size="64"
        width="4"
        color="primary"
      />
      <div class="mt-4 text-h6 text-center">
        Загрузка...
      </div>
    </div>
  </v-overlay>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

// Computed
const isVisible = computed(() => appStore.loadingState)
</script>

<style scoped>
.loading-overlay {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>