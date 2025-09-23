<template>
  <v-overlay
    v-model="isVisible"
    class="loading-overlay"
    :persistent="persistent"
    :contained="contained"
    :opacity="opacity"
  >
    <div class="loading-content">
      <v-progress-circular
        v-if="type === 'circular'"
        indeterminate
        :size="size"
        :width="width"
        :color="color"
      />
      <v-progress-linear
        v-else-if="type === 'linear'"
        indeterminate
        :color="color"
        class="mb-4"
        height="4"
      />
      <v-skeleton-loader
        v-else-if="type === 'skeleton'"
        :type="skeletonType"
        class="mb-4"
      />
      <div v-if="showText" class="mt-4 text-center">
        <div class="text-h6" v-if="title">{{ title }}</div>
        <div class="text-body-2 text-grey-darken-1" v-if="subtitle">{{ subtitle }}</div>
      </div>
    </div>
  </v-overlay>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: null
  },
  type: {
    type: String,
    default: 'circular',
    validator: value => ['circular', 'linear', 'skeleton'].includes(value)
  },
  title: {
    type: String,
    default: 'Загрузка...'
  },
  subtitle: {
    type: String,
    default: null
  },
  showText: {
    type: Boolean,
    default: true
  },
  size: {
    type: [String, Number],
    default: 64
  },
  width: {
    type: [String, Number],
    default: 4
  },
  color: {
    type: String,
    default: 'primary'
  },
  opacity: {
    type: [String, Number],
    default: 0.8
  },
  persistent: {
    type: Boolean,
    default: true
  },
  contained: {
    type: Boolean,
    default: false
  },
  skeletonType: {
    type: String,
    default: 'card'
  },
  useGlobalState: {
    type: Boolean,
    default: true
  }
})

const appStore = useAppStore()

// Computed
const isVisible = computed(() => {
  if (props.modelValue !== null) {
    return props.modelValue
  }
  return props.useGlobalState ? appStore.loadingState : false
})
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
  min-width: 200px;
  padding: 24px;
}

.loading-content .v-progress-linear {
  width: 200px;
}

.loading-content .v-skeleton-loader {
  width: 300px;
}

/* Анимация появления */
.loading-content {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Темная тема */
:deep(.v-theme--dark) .loading-overlay {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>