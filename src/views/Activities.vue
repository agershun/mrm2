<template>
  <div class="activities-page">
    <!-- Временный компонент для тестирования API -->
    <TestApi v-if="showTestApi" />

    <!-- Панель инструментов -->
    <div class="toolbar-section" v-if="!showTestApi">
      <ActivityToolbar />
    </div>

    <!-- Основная область -->
    <div class="main-content" v-if="!showTestApi">
      <!-- Левая панель - иерархия активностей -->
      <div class="hierarchy-panel">
        <ActivityHierarchy />
      </div>

      <!-- Правая панель - отображение данных -->
      <div class="display-panel">
        <div class="display-content">
          <ActivityRightPanel />
        </div>
      </div>

      <!-- Панель деталей (появляется справа при выборе активности) -->
      <div
        v-if="selectedActivity"
        class="details-panel"
      >
        <DetailsPanel />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'
import ActivityHierarchy from '@/components/activities/ActivityHierarchy.vue'
import ActivityToolbar from '@/components/activities/ActivityToolbar.vue'
import ActivityRightPanel from '@/components/activities/ActivityRightPanel.vue'
import DetailsPanel from '@/components/activities/DetailsPanel.vue'
import TestApi from '@/components/TestApi.vue'

const activitiesStore = useActivitiesStore()

// State
const showTestApi = ref(false) // Временно включаем для тестирования

// Computed
const selectedActivity = computed(() => activitiesStore.selectedActivity)

// Lifecycle
onMounted(async () => {
  // Инициализируем store активностей
  await activitiesStore.initialize()
})
</script>

<style scoped>
.activities-page {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.toolbar-section {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
}

.main-content {
  flex: 1;
  display: flex;
  min-height: 0;
}

.hierarchy-panel {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
  overflow: hidden;
}

.display-panel {
  flex: 1;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.display-content {
  flex: 1;
  overflow: hidden;
}

.details-panel {
  width: 400px;
  flex-shrink: 0;
  background: white;
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .hierarchy-panel {
    width: 280px;
  }

  .details-panel {
    width: 360px;
  }
}

@media (max-width: 960px) {
  .main-content {
    flex-direction: column;
  }

  .hierarchy-panel {
    width: 100%;
    height: 300px;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  .details-panel {
    width: 100%;
    max-height: 400px;
    border-left: none;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>