<template>
  <div class="investment-details-panel" :class="{ 'panel-open': isOpen }">
    <v-card v-if="isOpen" class="details-card h-100" variant="outlined">
      <!-- Заголовок панели -->
      <v-card-title class="pa-3 border-bottom">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon
              :icon="getItemIcon(selectedItem)"
              :color="getItemColor(selectedItem)"
              class="me-2"
            />
            <div>
              <div class="text-subtitle-1">{{ selectedItem?.name || 'Детали' }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ getItemTypeText(selectedItem?.type) }}
              </div>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            @click="closePanel"
          />
        </div>
      </v-card-title>

      <!-- Содержимое панели -->
      <v-card-text class="pa-0 h-100" style="overflow-y: auto;">
        <v-tabs v-model="activeTab" class="border-bottom">
          <v-tab value="general">Общие</v-tab>
          <v-tab value="attributes">Атрибуты</v-tab>
          <v-tab value="activities">Активности</v-tab>
          <v-tab value="history">История</v-tab>
        </v-tabs>

        <v-tabs-window v-model="activeTab" class="pa-3">
          <!-- Вкладка: Общие -->
          <v-tabs-window-item value="general">
            <div class="general-info">
              <!-- Основная информация -->
              <div class="info-section mb-4">
                <h4 class="text-subtitle-2 mb-3">Основная информация</h4>
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title class="text-caption">Название</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedItem?.name }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="text-caption">Описание</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedItem?.description || 'Не указано' }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="text-caption">Тип</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip :color="getItemColor(selectedItem)" size="small">
                        {{ getItemTypeText(selectedItem?.type) }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="text-caption">Kreola ID</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedItem?.kreola_id || 'Не назначен' }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="text-caption">Статус прогноза</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip
                        v-if="selectedItem?.forecast_status"
                        :color="getForecastStatusColor(selectedItem.forecast_status)"
                        size="small"
                      >
                        {{ getForecastStatusText(selectedItem.forecast_status) }}
                      </v-chip>
                      <span v-else class="text-medium-emphasis">Не указан</span>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>

              <!-- Финансовая информация -->
              <div class="info-section mb-4">
                <h4 class="text-subtitle-2 mb-3">Финансовая информация</h4>
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title class="text-caption">Общая сумма</v-list-item-title>
                    <v-list-item-subtitle class="font-weight-medium">
                      {{ formatCurrency(getTotalAmount(selectedItem)) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="text-caption">Потрачено</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatCurrency(getSpentAmount(selectedItem)) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="text-caption">Остаток</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatCurrency(getRemainingAmount(selectedItem)) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="text-caption">Прогресс</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-progress-linear
                        :model-value="getProgressPercentage(selectedItem)"
                        height="8"
                        rounded
                        :color="getProgressColor(selectedItem)"
                        class="mt-1"
                      />
                      <span class="text-caption">{{ getProgressPercentage(selectedItem) }}%</span>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>

              <!-- Связи -->
              <div class="info-section mb-4">
                <h4 class="text-subtitle-2 mb-3">Связи</h4>
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title class="text-caption">Родительский элемент</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip
                        v-if="parentItem"
                        size="small"
                        variant="outlined"
                        @click="selectParent"
                      >
                        {{ parentItem.name }}
                      </v-chip>
                      <span v-else class="text-medium-emphasis">Корневой элемент</span>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="text-caption">Дочерние элементы</v-list-item-title>
                    <v-list-item-subtitle>
                      <div v-if="childItems.length > 0" class="d-flex flex-wrap gap-1">
                        <v-chip
                          v-for="child in childItems"
                          :key="child.id"
                          size="small"
                          variant="outlined"
                          @click="selectChild(child)"
                        >
                          {{ child.name }}
                        </v-chip>
                      </div>
                      <span v-else class="text-medium-emphasis">Нет дочерних элементов</span>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="text-caption">Связано с активностями</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-icon
                        :icon="selectedItem?.connected_to_activities ? 'mdi-check' : 'mdi-close'"
                        :color="selectedItem?.connected_to_activities ? 'success' : 'error'"
                        size="16"
                      />
                      {{ selectedItem?.connected_to_activities ? 'Да' : 'Нет' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>

              <!-- Метаданные -->
              <div class="info-section">
                <h4 class="text-subtitle-2 mb-3">Метаданные</h4>
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title class="text-caption">Создано</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatDate(selectedItem?.created_at) }}
                      <span class="text-medium-emphasis">
                        ({{ selectedItem?.created_by || 'Неизвестно' }})
                      </span>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="text-caption">Обновлено</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatDate(selectedItem?.updated_at) }}
                      <span class="text-medium-emphasis">
                        ({{ selectedItem?.updated_by || 'Неизвестно' }})
                      </span>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- Вкладка: Атрибуты -->
          <v-tabs-window-item value="attributes">
            <div class="attributes-info">
              <div class="d-flex align-center justify-space-between mb-3">
                <h4 class="text-subtitle-2">Атрибуты</h4>
                <v-btn
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-plus"
                  @click="addAttribute"
                  :disabled="!canUpdate"
                >
                  Добавить
                </v-btn>
              </div>

              <div v-if="attributes.length > 0">
                <v-card
                  v-for="attribute in attributes"
                  :key="attribute.id"
                  variant="outlined"
                  class="mb-3"
                >
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="text-subtitle-2">{{ attribute.name }}</span>
                      <v-menu>
                        <template #activator="{ props }">
                          <v-btn
                            icon="mdi-dots-vertical"
                            size="x-small"
                            variant="text"
                            v-bind="props"
                          />
                        </template>
                        <v-list density="compact">
                          <v-list-item @click="editAttribute(attribute)">
                            <v-list-item-title>Редактировать</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="deleteAttribute(attribute)">
                            <v-list-item-title>Удалить</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                    <div class="text-body-2">{{ attribute.value }}</div>
                    <div class="text-caption text-medium-emphasis mt-1">
                      {{ attribute.type }} • {{ formatDate(attribute.updated_at) }}
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <div v-else class="text-center pa-8">
                <v-icon icon="mdi-tag-outline" size="48" color="grey-lighten-2" class="mb-2"/>
                <div class="text-body-2 text-medium-emphasis">Атрибуты не найдены</div>
                <div class="text-caption text-medium-emphasis">
                  Добавьте атрибуты для дополнительной информации
                </div>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- Вкладка: Активности -->
          <v-tabs-window-item value="activities">
            <div class="activities-info">
              <div class="d-flex align-center justify-space-between mb-3">
                <h4 class="text-subtitle-2">Связанные активности</h4>
                <v-btn
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-link"
                  @click="linkActivity"
                  :disabled="!canUpdate"
                >
                  Связать
                </v-btn>
              </div>

              <div v-if="linkedActivities.length > 0">
                <v-card
                  v-for="activity in linkedActivities"
                  :key="activity.id"
                  variant="outlined"
                  class="mb-3"
                  @click="openActivity(activity)"
                  style="cursor: pointer;"
                >
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="text-subtitle-2">{{ activity.name }}</span>
                      <div class="d-flex align-center gap-2">
                        <v-chip size="small" color="info">
                          {{ activity.allocation_percentage }}%
                        </v-chip>
                        <v-btn
                          icon="mdi-unlink"
                          size="x-small"
                          variant="text"
                          color="error"
                          @click.stop="unlinkActivity(activity)"
                        />
                      </div>
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ activity.description }}
                    </div>
                    <div class="d-flex align-center justify-space-between mt-2">
                      <v-chip size="x-small" :color="getActivityStatusColor(activity.status)">
                        {{ activity.status }}
                      </v-chip>
                      <span class="text-caption">
                        Распределено: {{ formatCurrency(activity.allocated_amount) }}
                      </span>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <div v-else class="text-center pa-8">
                <v-icon icon="mdi-link-off" size="48" color="grey-lighten-2" class="mb-2"/>
                <div class="text-body-2 text-medium-emphasis">Активности не связаны</div>
                <div class="text-caption text-medium-emphasis">
                  Свяжите инвестицию с активностями для отслеживания расходов
                </div>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- Вкладка: История -->
          <v-tabs-window-item value="history">
            <div class="history-info">
              <h4 class="text-subtitle-2 mb-3">История изменений</h4>

              <v-timeline density="compact" side="end" class="pa-0">
                <v-timeline-item
                  v-for="change in changeHistory"
                  :key="change.id"
                  :dot-color="getChangeTypeColor(change.type)"
                  size="small"
                >
                  <template #icon>
                    <v-icon :icon="getChangeTypeIcon(change.type)" size="12"/>
                  </template>

                  <div class="change-item">
                    <div class="text-subtitle-2">{{ change.description }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatDate(change.timestamp) }} • {{ change.user }}
                    </div>
                    <div v-if="change.details" class="text-body-2 mt-1">
                      {{ change.details }}
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>

              <div v-if="changeHistory.length === 0" class="text-center pa-8">
                <v-icon icon="mdi-history" size="48" color="grey-lighten-2" class="mb-2"/>
                <div class="text-body-2 text-medium-emphasis">История изменений пуста</div>
              </div>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

      <!-- Действия в футере -->
      <v-card-actions class="pa-3 border-top">
        <v-btn
          v-if="canUpdate"
          size="small"
          color="primary"
          variant="outlined"
          prepend-icon="mdi-pencil"
          @click="editItem"
        >
          Редактировать
        </v-btn>
        <v-btn
          v-if="canDelete"
          size="small"
          color="error"
          variant="outlined"
          prepend-icon="mdi-delete"
          @click="deleteItem"
        >
          Удалить
        </v-btn>
        <v-spacer/>
        <v-btn
          size="small"
          variant="outlined"
          prepend-icon="mdi-export"
          @click="exportDetails"
        >
          Экспорт
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePermissions } from '@/composables/usePermissions'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  selectedItem: {
    type: Object,
    default: null
  },
  hierarchyData: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'item-selected', 'item-updated', 'item-deleted'])

// Composables
const { canUpdate, canDelete } = usePermissions()

// Reactive data
const activeTab = ref('general')

// Mock данные для атрибутов
const attributes = ref([
  {
    id: 'attr_1',
    name: 'Целевая аудитория',
    value: 'Мужчины 25-45 лет',
    type: 'string',
    updated_at: '2025-09-20T10:00:00Z'
  },
  {
    id: 'attr_2',
    name: 'География',
    value: 'Москва, СПб',
    type: 'string',
    updated_at: '2025-09-21T15:30:00Z'
  },
  {
    id: 'attr_3',
    name: 'Приоритет',
    value: 'Высокий',
    type: 'enum',
    updated_at: '2025-09-22T09:15:00Z'
  }
])

// Mock данные для связанных активностей
const linkedActivities = ref([
  {
    id: 'activity_1',
    name: 'Instagram Stories Campaign',
    description: 'Рекламная кампания в Instagram Stories',
    status: 'Active',
    allocation_percentage: 60,
    allocated_amount: 240000
  },
  {
    id: 'activity_2',
    name: 'Instagram Feed Ads',
    description: 'Реклама в ленте Instagram',
    status: 'Planning',
    allocation_percentage: 40,
    allocated_amount: 160000
  }
])

// Mock данные для истории изменений
const changeHistory = ref([
  {
    id: 'change_1',
    type: 'created',
    description: 'Элемент создан',
    details: 'Создана новая статья расходов Instagram Ads',
    user: 'Иван Петров',
    timestamp: '2025-08-17T09:00:00Z'
  },
  {
    id: 'change_2',
    type: 'updated',
    description: 'Обновлен бюджет',
    details: 'Бюджет изменен с 350,000₽ на 400,000₽',
    user: 'Мария Сидорова',
    timestamp: '2025-09-15T14:30:00Z'
  },
  {
    id: 'change_3',
    type: 'linked',
    description: 'Связана активность',
    details: 'Добавлена связь с активностью Instagram Stories Campaign',
    user: 'Алексей Козлов',
    timestamp: '2025-09-20T11:45:00Z'
  }
])

// Computed properties
const parentItem = computed(() => {
  if (!props.selectedItem?.parent_id) return null
  return props.hierarchyData.find(item => item.id === props.selectedItem.parent_id)
})

const childItems = computed(() => {
  if (!props.selectedItem?.id) return []
  return props.hierarchyData.filter(item => item.parent_id === props.selectedItem.id)
})

// Methods
const closePanel = () => {
  emit('close')
}

const getItemIcon = (item) => {
  if (!item) return 'mdi-information'
  const icons = {
    category: 'mdi-folder',
    subcategory: 'mdi-folder-outline',
    line_item: 'mdi-file-document',
    placeholder: 'mdi-bookmark'
  }
  return icons[item.type] || 'mdi-help'
}

const getItemColor = (item) => {
  if (!item) return 'grey'
  const colors = {
    category: 'primary',
    subcategory: 'info',
    line_item: 'success',
    placeholder: 'warning'
  }
  return colors[item.type] || 'grey'
}

const getItemTypeText = (type) => {
  const types = {
    category: 'Категория',
    subcategory: 'Подкатегория',
    line_item: 'Статья расходов',
    placeholder: 'Резерв'
  }
  return types[type] || type
}

const getForecastStatusColor = (status) => {
  const colors = {
    confident: 'success',
    likely: 'info',
    speculative: 'warning',
    unlikely: 'error'
  }
  return colors[status] || 'grey'
}

const getForecastStatusText = (status) => {
  const texts = {
    confident: 'Уверенный',
    likely: 'Вероятный',
    speculative: 'Гипотетический',
    unlikely: 'Маловероятный'
  }
  return texts[status] || status
}

const getTotalAmount = (item) => {
  if (!item?.values) return 0
  return Object.values(item.values).reduce((sum, value) => sum + (value || 0), 0)
}

const getSpentAmount = (item) => {
  // Mock calculation - обычно это должно приходить с сервера
  return getTotalAmount(item) * 0.6
}

const getRemainingAmount = (item) => {
  return getTotalAmount(item) - getSpentAmount(item)
}

const getProgressPercentage = (item) => {
  const total = getTotalAmount(item)
  const spent = getSpentAmount(item)
  return total > 0 ? Math.round((spent / total) * 100) : 0
}

const getProgressColor = (item) => {
  const percentage = getProgressPercentage(item)
  if (percentage >= 90) return 'error'
  if (percentage >= 75) return 'warning'
  return 'success'
}

const getActivityStatusColor = (status) => {
  const colors = {
    Active: 'success',
    Planning: 'info',
    Paused: 'warning',
    Completed: 'primary'
  }
  return colors[status] || 'grey'
}

const getChangeTypeColor = (type) => {
  const colors = {
    created: 'success',
    updated: 'info',
    deleted: 'error',
    linked: 'primary',
    unlinked: 'warning'
  }
  return colors[type] || 'grey'
}

const getChangeTypeIcon = (type) => {
  const icons = {
    created: 'mdi-plus',
    updated: 'mdi-pencil',
    deleted: 'mdi-delete',
    linked: 'mdi-link',
    unlinked: 'mdi-link-off'
  }
  return icons[type] || 'mdi-information'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return 'Не указано'
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const selectParent = () => {
  if (parentItem.value) {
    emit('item-selected', parentItem.value)
  }
}

const selectChild = (child) => {
  emit('item-selected', child)
}

const addAttribute = () => {
  console.log('Adding attribute')
}

const editAttribute = (attribute) => {
  console.log('Editing attribute:', attribute)
}

const deleteAttribute = (attribute) => {
  console.log('Deleting attribute:', attribute)
}

const linkActivity = () => {
  console.log('Linking activity')
}

const unlinkActivity = (activity) => {
  console.log('Unlinking activity:', activity)
}

const openActivity = (activity) => {
  console.log('Opening activity:', activity)
}

const editItem = () => {
  console.log('Editing item:', props.selectedItem)
  emit('item-updated', props.selectedItem)
}

const deleteItem = () => {
  console.log('Deleting item:', props.selectedItem)
  emit('item-deleted', props.selectedItem)
}

const exportDetails = () => {
  console.log('Exporting details')
}

// Watchers
watch(() => props.selectedItem, () => {
  // Сбрасываем на первую вкладку при смене элемента
  activeTab.value = 'general'
})

// Expose methods
defineExpose({
  closePanel
})
</script>

<style scoped>
.investment-details-panel {
  position: relative;
  transition: all 0.3s ease;
}

.panel-open {
  /* Стили для открытой панели */
}

.details-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-section {
  /* Стили для секций информации */
}

.change-item {
  /* Стили для элементов истории изменений */
}

/* Настройка вкладок */
.v-tabs :deep(.v-tab) {
  min-width: 80px;
  font-size: 0.875rem;
}

/* Временная шкала */
.v-timeline :deep(.v-timeline-item__body) {
  padding-bottom: 16px;
}

/* Прогресс бар */
.v-progress-linear {
  border-radius: 4px;
}
</style>