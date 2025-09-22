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
      <div class="hierarchy-panel" :style="{ width: hierarchyPanelWidth + 'px' }">
        <ActivityHierarchy
          @create-child-activity="handleCreateChildActivity"
          @create-activity="handleCreateActivity"
        />
      </div>

      <!-- Разделитель для изменения размера -->
      <div
        class="panel-divider"
        @mousedown="startResize"
        @dblclick="resetPanelWidth"
        title="Перетащите для изменения ширины панели (двойной клик для сброса)"
      >
        <div class="divider-handle">
          <div class="divider-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
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
const hierarchyPanelWidth = ref(320) // Ширина панели иерархии
const isResizing = ref(false)
const defaultPanelWidth = 320
const minPanelWidth = 200
const maxPanelWidth = 600

// Computed
const selectedActivity = computed(() => activitiesStore.selectedActivity)

// Methods
const handleCreateChildActivity = (parentId) => {
  // Мастер создания активности должен открыться через ActivityToolbar
  // Здесь мы можем дополнительно обработать логику, если нужно
  console.log('Creating child activity for parent:', parentId)
}

const handleCreateActivity = () => {
  // Обрабатываем создание новой активности (без родителя)
  console.log('Creating new root activity')
}

// Методы для изменения размера панели
const startResize = (e) => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  e.preventDefault()
}

const handleResize = (e) => {
  if (!isResizing.value) return

  const newWidth = e.clientX
  if (newWidth >= minPanelWidth && newWidth <= maxPanelWidth) {
    hierarchyPanelWidth.value = newWidth
  }
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''

  // Сохраняем ширину в localStorage
  localStorage.setItem('activities-hierarchy-panel-width', hierarchyPanelWidth.value.toString())
}

const resetPanelWidth = () => {
  hierarchyPanelWidth.value = defaultPanelWidth
  localStorage.removeItem('activities-hierarchy-panel-width')
}

// Lifecycle
onMounted(async () => {
  // Восстанавливаем ширину панели из localStorage
  const savedWidth = localStorage.getItem('activities-hierarchy-panel-width')
  if (savedWidth) {
    const width = parseInt(savedWidth, 10)
    if (width >= minPanelWidth && width <= maxPanelWidth) {
      hierarchyPanelWidth.value = width
    }
  }

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
  flex-shrink: 0;
  background: white;
  overflow: hidden;
  min-width: 200px;
  max-width: 600px;
}

.panel-divider {
  width: 8px;
  flex-shrink: 0;
  background: #f5f5f5;
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  position: relative;
}

.panel-divider:hover {
  background-color: rgba(25, 118, 210, 0.08);
}

.panel-divider:active {
  background-color: rgba(25, 118, 210, 0.12);
}

.divider-handle {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.divider-dots {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  transition: background-color 0.2s ease;
}

.panel-divider:hover .dot {
  background-color: rgba(25, 118, 210, 0.8);
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
  .details-panel {
    width: 360px;
  }
}

@media (max-width: 960px) {
  .main-content {
    flex-direction: column;
  }

  .hierarchy-panel {
    width: 100% !important;
    height: 300px;
    min-width: auto !important;
    max-width: none !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  .panel-divider {
    display: none;
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