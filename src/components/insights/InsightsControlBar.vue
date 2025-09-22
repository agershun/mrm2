<template>
  <v-toolbar
    density="compact"
    class="insights-control-bar border-b"
    elevation="0"
  >
    <v-container fluid class="px-4">
      <v-row align="center" no-gutters>
        <!-- Левая часть - Переключатель проектов -->
        <v-col cols="3">
          <v-select
            v-model="selectedProject"
            :items="projectItems"
            item-title="name"
            item-value="id"
            label="Проект"
            density="compact"
            variant="outlined"
            hide-details
            class="project-selector"
            @update:model-value="$emit('project-changed', $event)"
          >
            <template #prepend-inner>
              <v-icon size="small">mdi-folder-open</v-icon>
            </template>
          </v-select>
        </v-col>

        <!-- Центральная часть - Сохраненные виды -->
        <v-col cols="6" class="d-flex justify-center">
          <v-menu
            v-if="savedViews.length > 0"
            :close-on-content-click="false"
            location="bottom"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="outlined"
                size="small"
                prepend-icon="mdi-bookmark"
                class="me-2"
              >
                Сохраненные виды
                <v-chip size="x-small" class="ms-1">{{ savedViews.length }}</v-chip>
              </v-btn>
            </template>

            <v-card width="320">
              <v-card-title class="text-subtitle-2 pa-3">
                Сохраненные виды
              </v-card-title>

              <v-divider />

              <v-list density="compact" class="py-0">
                <v-list-item
                  v-for="view in savedViews"
                  :key="view.view_id"
                  :title="view.name"
                  :subtitle="view.description"
                  @click="$emit('load-view', view)"
                >
                  <template #prepend>
                    <v-icon size="small" color="primary">
                      {{ getViewIcon(view) }}
                    </v-icon>
                  </template>

                  <template #append>
                    <v-btn
                      icon="mdi-delete"
                      size="x-small"
                      variant="text"
                      @click.stop="deleteView(view)"
                    />
                  </template>
                </v-list-item>
              </v-list>

              <v-divider v-if="savedViews.length > 0" />

              <v-card-actions class="pa-2">
                <v-btn
                  variant="text"
                  size="small"
                  prepend-icon="mdi-content-save"
                  @click="$emit('save-view')"
                >
                  Сохранить текущий вид
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>

          <v-btn
            v-else
            variant="outlined"
            size="small"
            prepend-icon="mdi-content-save"
            @click="$emit('save-view')"
          >
            Сохранить вид
          </v-btn>
        </v-col>

        <!-- Правая часть - Действия -->
        <v-col cols="3" class="d-flex justify-end">
          <!-- Обновление данных -->
          <v-tooltip text="Обновить данные">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-refresh"
                size="small"
                variant="text"
                :loading="isRefreshing"
                @click="handleRefresh"
              />
            </template>
          </v-tooltip>

          <!-- Информация об обновлении -->
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                size="small"
                class="text-caption text-grey me-2"
              >
                {{ lastRefreshText }}
              </v-btn>
            </template>

            <v-card width="280">
              <v-card-title class="text-subtitle-2 pa-3">
                История обновлений
              </v-card-title>

              <v-divider />

              <v-list density="compact" class="py-0">
                <v-list-item
                  v-for="refresh in refreshHistory"
                  :key="refresh.timestamp"
                  :title="refresh.status"
                  :subtitle="formatRefreshTime(refresh.timestamp)"
                >
                  <template #prepend>
                    <v-icon
                      size="small"
                      :color="refresh.success ? 'success' : 'error'"
                    >
                      {{ refresh.success ? 'mdi-check' : 'mdi-alert' }}
                    </v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>

          <!-- Режим редактирования (только для админов) -->
          <v-tooltip v-if="canEdit" text="Режим редактирования">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="isEditing ? 'mdi-pencil' : 'mdi-pencil-outline'"
                size="small"
                :variant="isEditing ? 'tonal' : 'text'"
                :color="isEditing ? 'primary' : undefined"
                @click="$emit('toggle-edit')"
              />
            </template>
          </v-tooltip>

          <!-- Меню дополнительных действий -->
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-dots-vertical"
                size="small"
                variant="text"
              />
            </template>

            <v-list density="compact">
              <v-list-item
                prepend-icon="mdi-download"
                title="Экспорт дашборда"
                @click="exportDashboard"
              />

              <v-list-item
                prepend-icon="mdi-share"
                title="Поделиться"
                @click="shareDashboard"
              />

              <v-divider />

              <v-list-item
                prepend-icon="mdi-fullscreen"
                title="Полноэкранный режим"
                @click="toggleFullscreen"
              />

              <v-list-item
                prepend-icon="mdi-settings"
                title="Настройки"
                @click="openSettings"
              />
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-container>
  </v-toolbar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  currentProject: {
    type: String,
    default: ''
  },
  projects: {
    type: Array,
    default: () => []
  },
  savedViews: {
    type: Array,
    default: () => []
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

// Emits
defineEmits([
  'project-changed',
  'refresh-data',
  'save-view',
  'load-view',
  'toggle-edit'
])

// Reactive data
const selectedProject = ref(props.currentProject)
const isRefreshing = ref(false)
const refreshHistory = ref([
  {
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 минут назад
    status: 'Успешно обновлено',
    success: true
  },
  {
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 час назад
    status: 'Успешно обновлено',
    success: true
  },
  {
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 день назад
    status: 'Ошибка загрузки данных CRM',
    success: false
  }
])

// Computed
const projectItems = computed(() => {
  return props.projects.map(project => ({
    id: project.project_id || project.id,
    name: project.name,
    description: project.description
  }))
})

const lastRefreshText = computed(() => {
  if (refreshHistory.value.length === 0) return 'Никогда'

  const lastRefresh = refreshHistory.value[0]
  const now = new Date()
  const diff = now - lastRefresh.timestamp

  if (diff < 60000) { // Менее минуты
    return 'Только что'
  } else if (diff < 3600000) { // Менее часа
    const minutes = Math.floor(diff / 60000)
    return `${minutes} мин назад`
  } else if (diff < 86400000) { // Менее дня
    const hours = Math.floor(diff / 3600000)
    return `${hours} ч назад`
  } else {
    const days = Math.floor(diff / 86400000)
    return `${days} дн назад`
  }
})

// Methods
const handleRefresh = async () => {
  isRefreshing.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Симуляция загрузки

    // Добавляем запись об успешном обновлении
    refreshHistory.value.unshift({
      timestamp: new Date(),
      status: 'Успешно обновлено',
      success: true
    })

    // Ограничиваем историю 10 записями
    if (refreshHistory.value.length > 10) {
      refreshHistory.value = refreshHistory.value.slice(0, 10)
    }

    // Эмитим событие обновления
    emit('refresh-data')
  } catch (error) {
    refreshHistory.value.unshift({
      timestamp: new Date(),
      status: 'Ошибка обновления',
      success: false
    })
  } finally {
    isRefreshing.value = false
  }
}

const deleteView = async (view) => {
  // TODO: Реализовать удаление сохраненного вида
  console.log('Удаление вида:', view)
}

const getViewIcon = (view) => {
  if (view.dashboard_id) {
    return 'mdi-view-dashboard'
  } else if (view.report_id) {
    return 'mdi-file-chart'
  }
  return 'mdi-bookmark'
}

const formatRefreshTime = (timestamp) => {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(timestamp)
}

const exportDashboard = () => {
  // TODO: Реализовать экспорт дашборда
  console.log('Экспорт дашборда')
}

const shareDashboard = () => {
  // TODO: Реализовать функцию "Поделиться"
  console.log('Поделиться дашбордом')
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

const openSettings = () => {
  // TODO: Открыть настройки
  console.log('Открыть настройки')
}

// Lifecycle
onMounted(() => {
  selectedProject.value = props.currentProject
})
</script>

<style scoped>
.insights-control-bar {
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.project-selector {
  max-width: 250px;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Кастомизация select */
:deep(.v-field__input) {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

:deep(.v-field--variant-outlined) {
  --v-field-border-width: 1px;
}

:deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-opacity: 0.38;
}
</style>