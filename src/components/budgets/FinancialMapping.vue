<template>
  <v-dialog v-model="dialogVisible" max-width="1200px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-link</v-icon>
          <div>
            <span class="text-h6">{{ title }}</span>
            <div class="text-caption text-grey">{{ budget.name }}</div>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="close"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <div class="financial-mapping-content">
          <!-- Панель управления -->
          <div class="mapping-toolbar pa-4">
            <v-row align="center">
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="Поиск записей..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="statusFilter"
                  :items="mappingStatusOptions"
                  label="Статус сопоставления"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-btn-toggle
                  v-model="viewMode"
                  variant="outlined"
                  size="small"
                  mandatory
                >
                  <v-btn value="unmapped">
                    <v-icon>mdi-link-off</v-icon>
                    Не сопоставлено
                  </v-btn>
                  <v-btn value="mapped">
                    <v-icon>mdi-link</v-icon>
                    Сопоставлено
                  </v-btn>
                  <v-btn value="all">
                    <v-icon>mdi-view-list</v-icon>
                    Все
                  </v-btn>
                </v-btn-toggle>
              </v-col>
              <v-col cols="12" md="3">
                <div class="d-flex gap-2">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-auto-fix"
                    @click="autoMap"
                    :loading="isAutoMapping"
                  >
                    Авто-сопоставление
                  </v-btn>
                  <v-btn
                    color="success"
                    variant="flat"
                    size="small"
                    prepend-icon="mdi-upload"
                    @click="openImportDialog"
                  >
                    Импорт
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </div>

          <v-divider />

          <!-- Основной контент -->
          <div class="mapping-content" style="height: 500px;">
            <v-row class="h-100 ma-0">
              <!-- Левая панель - источник данных -->
              <v-col cols="6" class="pa-0">
                <div class="source-panel h-100">
                  <div class="panel-header pa-3 bg-grey-lighten-4">
                    <h4 class="text-subtitle-1">
                      <v-icon class="me-2">{{ sourceIcon }}</v-icon>
                      {{ sourceTitle }} ({{ sourceData.length }})
                    </h4>
                  </div>
                  <div class="panel-content" style="height: calc(100% - 60px); overflow-y: auto;">
                    <v-data-table
                      v-model:selected="selectedSourceItems"
                      :headers="sourceHeaders"
                      :items="filteredSourceData"
                      :search="searchQuery"
                      item-key="id"
                      show-select
                      density="compact"
                      class="elevation-0"
                      @click:row="selectSourceItem"
                    >
                      <!-- Номер/ID -->
                      <template #item.number="{ item }">
                        <div class="font-weight-medium">{{ item.number }}</div>
                      </template>

                      <!-- Описание -->
                      <template #item.description="{ item }">
                        <div class="text-body-2">{{ item.description }}</div>
                        <div v-if="item.vendor" class="text-caption text-grey">{{ item.vendor }}</div>
                      </template>

                      <!-- Сумма -->
                      <template #item.amount="{ item }">
                        <div class="font-weight-bold">{{ formatCurrency(item.amount) }}</div>
                      </template>

                      <!-- Дата -->
                      <template #item.date="{ item }">
                        <div class="text-caption">{{ formatDate(item.date) }}</div>
                      </template>

                      <!-- Статус сопоставления -->
                      <template #item.mapping_status="{ item }">
                        <v-chip
                          :color="getMappingStatusColor(item.mapping_status)"
                          size="small"
                          variant="tonal"
                        >
                          <v-icon
                            :icon="getMappingStatusIcon(item.mapping_status)"
                            size="16"
                            class="me-1"
                          />
                          {{ getMappingStatusText(item.mapping_status) }}
                        </v-chip>
                      </template>

                      <!-- Действия -->
                      <template #item.actions="{ item }">
                        <div class="d-flex align-center">
                          <v-btn
                            v-if="item.mapping_status === 'unmapped'"
                            icon="mdi-link"
                            size="small"
                            variant="text"
                            color="primary"
                            @click="startMapping(item)"
                          />
                          <v-btn
                            v-else
                            icon="mdi-link-off"
                            size="small"
                            variant="text"
                            color="warning"
                            @click="removeMapping(item)"
                          />
                        </div>
                      </template>
                    </v-data-table>
                  </div>
                </div>
              </v-col>

              <!-- Правая панель - целевые данные -->
              <v-col cols="6" class="pa-0">
                <div class="target-panel h-100">
                  <div class="panel-header pa-3 bg-grey-lighten-4">
                    <h4 class="text-subtitle-1">
                      <v-icon class="me-2">mdi-target</v-icon>
                      Бюджетные позиции ({{ targetData.length }})
                    </h4>
                  </div>
                  <div class="panel-content" style="height: calc(100% - 60px); overflow-y: auto;">
                    <v-data-table
                      v-model:selected="selectedTargetItems"
                      :headers="targetHeaders"
                      :items="filteredTargetData"
                      item-key="id"
                      show-select
                      density="compact"
                      class="elevation-0"
                      @click:row="selectTargetItem"
                    >
                      <!-- Название -->
                      <template #item.name="{ item }">
                        <div class="font-weight-medium">{{ item.name }}</div>
                        <div class="text-caption text-grey">{{ item.category }}</div>
                      </template>

                      <!-- Плановая сумма -->
                      <template #item.planned_amount="{ item }">
                        <div class="font-weight-bold text-primary">{{ formatCurrency(item.planned_amount) }}</div>
                      </template>

                      <!-- Сопоставленная сумма -->
                      <template #item.mapped_amount="{ item }">
                        <div class="font-weight-bold text-success">{{ formatCurrency(item.mapped_amount) }}</div>
                      </template>

                      <!-- Остаток -->
                      <template #item.remaining="{ item }">
                        <div
                          class="font-weight-bold"
                          :class="item.remaining < 0 ? 'text-error' : 'text-info'"
                        >
                          {{ formatCurrency(item.remaining) }}
                        </div>
                      </template>

                      <!-- Прогресс -->
                      <template #item.progress="{ item }">
                        <v-progress-linear
                          :model-value="getProgress(item)"
                          :color="getProgressColor(item)"
                          height="6"
                        />
                        <div class="text-caption mt-1">{{ getProgress(item) }}%</div>
                      </template>
                    </v-data-table>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Панель сопоставления -->
          <div v-if="mappingMode" class="mapping-panel pa-4 bg-primary-lighten-5">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon color="primary" class="me-2">mdi-link-variant</v-icon>
                <div>
                  <div class="font-weight-bold">Режим сопоставления активен</div>
                  <div class="text-caption">
                    Выберите источник: {{ selectedSourceItems.length }},
                    цель: {{ selectedTargetItems.length }}
                  </div>
                </div>
              </div>
              <div class="d-flex align-center gap-2">
                <v-text-field
                  v-model="mappingAmount"
                  label="Сумма сопоставления"
                  type="number"
                  variant="outlined"
                  density="compact"
                  style="width: 200px"
                  suffix="₽"
                />
                <v-btn
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-check"
                  @click="confirmMapping"
                  :disabled="!canConfirmMapping"
                >
                  Применить
                </v-btn>
                <v-btn
                  variant="outlined"
                  @click="cancelMapping"
                >
                  Отмена
                </v-btn>
              </div>
            </div>
          </div>

          <!-- Статистика -->
          <div class="statistics-section pa-4 bg-grey-lighten-5">
            <v-row>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-primary">{{ totalItems }}</div>
                  <div class="text-caption">Всего записей</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-success">{{ mappedItems }}</div>
                  <div class="text-caption">Сопоставлено</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-warning">{{ unmappedItems }}</div>
                  <div class="text-caption">Не сопоставлено</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-info">{{ Math.round(mappingProgress) }}%</div>
                  <div class="text-caption">Прогресс</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <div class="d-flex align-center justify-space-between w-100">
          <!-- Массовые действия -->
          <div class="d-flex align-center gap-2">
            <v-btn
              variant="outlined"
              size="small"
              prepend-icon="mdi-link-variant"
              @click="bulkMapping"
              :disabled="selectedSourceItems.length === 0 || selectedTargetItems.length === 0"
            >
              Массовое сопоставление
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              color="warning"
              prepend-icon="mdi-link-off"
              @click="clearAllMappings"
            >
              Очистить все
            </v-btn>
          </div>

          <!-- Основные действия -->
          <div class="d-flex align-center gap-2">
            <v-btn variant="text" @click="close">
              Отмена
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="saveChanges"
              :loading="isSaving"
            >
              Сохранить изменения
            </v-btn>
          </div>
        </div>
      </v-card-actions>
    </v-card>

    <!-- Диалог импорта -->
    <v-dialog v-model="showImportDialog" max-width="600px">
      <v-card>
        <v-card-title>Импорт {{ sourceTitle }}</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-file-input
            v-model="importFile"
            label="Выберите файл"
            accept=".csv,.xlsx,.xls"
            variant="outlined"
            prepend-icon="mdi-paperclip"
            show-size
          />
          <div class="text-caption text-grey mt-2">
            Поддерживаемые форматы: CSV, Excel (.xlsx, .xls)
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeImportDialog">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="importData"
            :loading="isImporting"
            :disabled="!importFile"
          >
            Импортировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useBudgetsStore } from '@/stores/budgetsStore'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  budget: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['pos', 'actuals'].includes(value)
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'mapping-updated'])

// Store
const budgetsStore = useBudgetsStore()

// Reactive state
const searchQuery = ref('')
const statusFilter = ref(null)
const viewMode = ref('unmapped')
const selectedSourceItems = ref([])
const selectedTargetItems = ref([])
const mappingMode = ref(false)
const mappingAmount = ref(null)
const isAutoMapping = ref(false)
const isSaving = ref(false)
const showImportDialog = ref(false)
const importFile = ref(null)
const isImporting = ref(false)

// Computed properties
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const title = computed(() => {
  return props.type === 'pos' ? 'Сопоставление POs' : 'Сопоставление Actuals'
})

const sourceTitle = computed(() => {
  return props.type === 'pos' ? 'Purchase Orders' : 'Фактические расходы'
})

const sourceIcon = computed(() => {
  return props.type === 'pos' ? 'mdi-file-document' : 'mdi-cash'
})

// Mock данные - в реальном приложении должны загружаться из API
const sourceData = computed(() => {
  if (props.type === 'pos') {
    return [
      {
        id: 'po_1',
        number: 'PO-2025-001',
        description: 'Реклама в соцсетях',
        vendor: 'Facebook Inc.',
        amount: 500000,
        date: '2025-01-15',
        mapping_status: 'unmapped'
      },
      {
        id: 'po_2',
        number: 'PO-2025-002',
        description: 'Контекстная реклама',
        vendor: 'Google LLC',
        amount: 750000,
        date: '2025-01-20',
        mapping_status: 'mapped'
      }
    ]
  } else {
    return [
      {
        id: 'act_1',
        number: 'ACT-2025-001',
        description: 'Фактические расходы на рекламу',
        amount: 480000,
        date: '2025-01-30',
        mapping_status: 'unmapped'
      },
      {
        id: 'act_2',
        number: 'ACT-2025-002',
        description: 'Оплата за контекст',
        amount: 720000,
        date: '2025-02-01',
        mapping_status: 'mapped'
      }
    ]
  }
})

const targetData = ref([
  {
    id: 'budget_1',
    name: 'Интернет-реклама',
    category: 'Маркетинг',
    planned_amount: 1000000,
    mapped_amount: 720000,
    remaining: 280000
  },
  {
    id: 'budget_2',
    name: 'Социальные сети',
    category: 'Маркетинг',
    planned_amount: 600000,
    mapped_amount: 0,
    remaining: 600000
  }
])

const filteredSourceData = computed(() => {
  let filtered = sourceData.value

  if (viewMode.value === 'mapped') {
    filtered = filtered.filter(item => item.mapping_status === 'mapped')
  } else if (viewMode.value === 'unmapped') {
    filtered = filtered.filter(item => item.mapping_status === 'unmapped')
  }

  if (statusFilter.value) {
    filtered = filtered.filter(item => item.mapping_status === statusFilter.value)
  }

  return filtered
})

const filteredTargetData = computed(() => {
  return targetData.value
})

// Headers для таблиц
const sourceHeaders = computed(() => [
  { title: 'Номер', key: 'number', sortable: true },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Сумма', key: 'amount', sortable: true },
  { title: 'Дата', key: 'date', sortable: true },
  { title: 'Статус', key: 'mapping_status', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
])

const targetHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Плановая сумма', key: 'planned_amount', sortable: true },
  { title: 'Сопоставлено', key: 'mapped_amount', sortable: true },
  { title: 'Остаток', key: 'remaining', sortable: true },
  { title: 'Прогресс', key: 'progress', sortable: false }
]

// Опции
const mappingStatusOptions = [
  { title: 'Сопоставлено', value: 'mapped' },
  { title: 'Не сопоставлено', value: 'unmapped' },
  { title: 'Частично', value: 'partial' }
]

// Статистика
const totalItems = computed(() => sourceData.value.length)
const mappedItems = computed(() => sourceData.value.filter(item => item.mapping_status === 'mapped').length)
const unmappedItems = computed(() => sourceData.value.filter(item => item.mapping_status === 'unmapped').length)
const mappingProgress = computed(() => totalItems.value > 0 ? (mappedItems.value / totalItems.value) * 100 : 0)

const canConfirmMapping = computed(() => {
  return selectedSourceItems.value.length > 0 &&
         selectedTargetItems.value.length > 0 &&
         mappingAmount.value > 0
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}

const getMappingStatusColor = (status) => {
  switch (status) {
    case 'mapped':
      return 'success'
    case 'unmapped':
      return 'warning'
    case 'partial':
      return 'info'
    default:
      return 'grey'
  }
}

const getMappingStatusIcon = (status) => {
  switch (status) {
    case 'mapped':
      return 'mdi-link'
    case 'unmapped':
      return 'mdi-link-off'
    case 'partial':
      return 'mdi-link-variant'
    default:
      return 'mdi-help-circle'
  }
}

const getMappingStatusText = (status) => {
  const statusMap = {
    'mapped': 'Сопоставлено',
    'unmapped': 'Не сопоставлено',
    'partial': 'Частично'
  }
  return statusMap[status] || status
}

const getProgress = (item) => {
  return item.planned_amount > 0 ? Math.round((item.mapped_amount / item.planned_amount) * 100) : 0
}

const getProgressColor = (item) => {
  const progress = getProgress(item)
  if (progress >= 100) return 'success'
  if (progress >= 75) return 'info'
  if (progress >= 50) return 'warning'
  return 'error'
}

// Event handlers
const selectSourceItem = (event, { item }) => {
  if (mappingMode.value) {
    const index = selectedSourceItems.value.findIndex(selected => selected.id === item.id)
    if (index > -1) {
      selectedSourceItems.value.splice(index, 1)
    } else {
      selectedSourceItems.value.push(item)
    }
  }
}

const selectTargetItem = (event, { item }) => {
  if (mappingMode.value) {
    const index = selectedTargetItems.value.findIndex(selected => selected.id === item.id)
    if (index > -1) {
      selectedTargetItems.value.splice(index, 1)
    } else {
      selectedTargetItems.value.push(item)
    }
  }
}

const startMapping = (item) => {
  mappingMode.value = true
  selectedSourceItems.value = [item]
  selectedTargetItems.value = []
  mappingAmount.value = item.amount
}

const cancelMapping = () => {
  mappingMode.value = false
  selectedSourceItems.value = []
  selectedTargetItems.value = []
  mappingAmount.value = null
}

const confirmMapping = () => {
  // TODO: Implement actual mapping logic
  console.log('Mapping confirmed:', {
    source: selectedSourceItems.value,
    target: selectedTargetItems.value,
    amount: mappingAmount.value
  })

  // Обновить статусы
  selectedSourceItems.value.forEach(item => {
    item.mapping_status = 'mapped'
  })

  selectedTargetItems.value.forEach(item => {
    item.mapped_amount += mappingAmount.value
    item.remaining = item.planned_amount - item.mapped_amount
  })

  cancelMapping()
}

const removeMapping = (item) => {
  if (confirm('Удалить сопоставление?')) {
    item.mapping_status = 'unmapped'
    // TODO: Implement removal logic
  }
}

const autoMap = async () => {
  isAutoMapping.value = true
  try {
    // TODO: Implement auto-mapping logic
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call

    // Mock auto-mapping
    sourceData.value.forEach(item => {
      if (item.mapping_status === 'unmapped') {
        item.mapping_status = 'mapped'
      }
    })
  } catch (error) {
    console.error('Auto-mapping failed:', error)
  } finally {
    isAutoMapping.value = false
  }
}

const bulkMapping = () => {
  if (selectedSourceItems.value.length === 0 || selectedTargetItems.value.length === 0) return

  mappingMode.value = true
  const totalAmount = selectedSourceItems.value.reduce((sum, item) => sum + item.amount, 0)
  mappingAmount.value = totalAmount
}

const clearAllMappings = () => {
  if (confirm('Очистить все сопоставления?')) {
    sourceData.value.forEach(item => {
      item.mapping_status = 'unmapped'
    })

    targetData.value.forEach(item => {
      item.mapped_amount = 0
      item.remaining = item.planned_amount
    })
  }
}

const openImportDialog = () => {
  showImportDialog.value = true
}

const closeImportDialog = () => {
  showImportDialog.value = false
  importFile.value = null
}

const importData = async () => {
  if (!importFile.value) return

  isImporting.value = true
  try {
    // TODO: Implement file import logic
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate upload

    closeImportDialog()
    // TODO: Refresh data
  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    isImporting.value = false
  }
}

const saveChanges = async () => {
  try {
    isSaving.value = true
    // TODO: Save mapping changes to API
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('mapping-updated')
    close()
  } catch (error) {
    console.error('Failed to save changes:', error)
  } finally {
    isSaving.value = false
  }
}

const close = () => {
  dialogVisible.value = false
  cancelMapping()
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Reset state when opening
    searchQuery.value = ''
    statusFilter.value = null
    viewMode.value = 'unmapped'
    cancelMapping()
  }
})
</script>

<style scoped>
.financial-mapping-content {
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mapping-toolbar {
  flex-shrink: 0;
  background-color: #f8f9fa;
}

.mapping-content {
  flex: 1;
  overflow: hidden;
}

.source-panel,
.target-panel {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.panel-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.mapping-panel {
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.statistics-section {
  flex-shrink: 0;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .mapping-toolbar .v-row {
    gap: 12px;
  }

  .d-flex.gap-2 {
    gap: 8px;
  }
}
</style>