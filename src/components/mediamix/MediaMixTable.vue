<template>
  <div class="media-mix-table">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Медиа-микс</span>
        <div>
          <v-btn
            size="small"
            variant="outlined"
            @click="addChannel"
            prepend-icon="mdi-plus"
          >
            Добавить канал
          </v-btn>
          <v-btn
            size="small"
            variant="outlined"
            @click="optimizeMix"
            prepend-icon="mdi-auto-fix"
            class="ml-2"
          >
            Оптимизировать
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="editableItems"
          :loading="loading"
          item-key="channel"
          hide-default-footer
          class="media-mix-data-table"
        >
          <template #item.channel="{ item }">
            <v-select
              v-model="item.channel"
              :items="availableChannels"
              variant="plain"
              density="compact"
              hide-details
              @update:model-value="updateItem(item)"
            />
          </template>

          <template #item.budget_allocation="{ item }">
            <v-text-field
              v-model.number="item.budget_allocation"
              type="number"
              variant="plain"
              density="compact"
              hide-details
              suffix="₽"
              @update:model-value="updateItem(item)"
            />
          </template>

          <template #item.budget_share="{ item }">
            <v-text-field
              v-model.number="item.budget_share"
              type="number"
              variant="plain"
              density="compact"
              hide-details
              suffix="%"
              min="0"
              max="100"
              @update:model-value="updateShareItem(item)"
            />
          </template>

          <template #item.expected_cpa="{ item }">
            <v-text-field
              v-model.number="item.expected_cpa"
              type="number"
              variant="plain"
              density="compact"
              hide-details
              suffix="₽"
              @update:model-value="updateItem(item)"
            />
          </template>

          <template #item.expected_conversions="{ item }">
            <span class="font-weight-medium">{{ formatNumber(item.expected_conversions) }}</span>
          </template>

          <template #item.expected_roi="{ item }">
            <v-chip
              :color="getRoiColor(item.expected_roi)"
              size="small"
            >
              {{ item.expected_roi }}%
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="removeChannel(item)"
            />
          </template>
        </v-data-table>

        <!-- Итоговая строка -->
        <v-card
          variant="outlined"
          class="mt-4 pa-3"
          :color="isValidMix ? 'success' : 'warning'"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <h4 class="text-h6">Итого</h4>
            </div>
            <div class="d-flex gap-4">
              <div class="text-center">
                <div class="text-caption text-grey-darken-1">Общий бюджет</div>
                <div class="text-h6">{{ formatCurrency(totalBudget) }}</div>
              </div>
              <div class="text-center">
                <div class="text-caption text-grey-darken-1">Доля бюджета</div>
                <div class="text-h6" :class="isValidMix ? 'text-success' : 'text-warning'">
                  {{ totalShare }}%
                </div>
              </div>
              <div class="text-center">
                <div class="text-caption text-grey-darken-1">Ожидаемые конверсии</div>
                <div class="text-h6">{{ formatNumber(totalConversions) }}</div>
              </div>
              <div class="text-center">
                <div class="text-caption text-grey-darken-1">Средний ROI</div>
                <div class="text-h6" :class="getRoiColor(averageRoi)">{{ averageRoi }}%</div>
              </div>
            </div>
          </div>

          <v-alert
            v-if="!isValidMix"
            type="warning"
            variant="tonal"
            class="mt-3"
          >
            Сумма долей бюджета должна составлять 100%. Текущая сумма: {{ totalShare }}%
          </v-alert>
        </v-card>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  totalBudgetLimit: {
    type: Number,
    default: 1000000
  }
})

const emit = defineEmits(['update:items', 'item-updated', 'mix-optimized'])

const editableItems = ref([])

const headers = [
  { title: 'Канал', key: 'channel', sortable: false, width: '150px' },
  { title: 'Бюджет (₽)', key: 'budget_allocation', sortable: false, width: '120px' },
  { title: 'Доля (%)', key: 'budget_share', sortable: false, width: '100px' },
  { title: 'CPA (₽)', key: 'expected_cpa', sortable: false, width: '100px' },
  { title: 'Конверсии', key: 'expected_conversions', sortable: false, width: '120px' },
  { title: 'ROI', key: 'expected_roi', sortable: false, width: '100px' },
  { title: 'Действия', key: 'actions', sortable: false, width: '80px', align: 'center' }
]

const availableChannels = [
  'Google Ads',
  'Yandex Direct',
  'Facebook',
  'Instagram',
  'YouTube',
  'VKontakte',
  'Telegram',
  'Email Marketing',
  'SEO',
  'Display',
  'Programmatic'
]

// Computed properties
const totalBudget = computed(() => {
  return editableItems.value.reduce((sum, item) => sum + (item.budget_allocation || 0), 0)
})

const totalShare = computed(() => {
  return Math.round(editableItems.value.reduce((sum, item) => sum + (item.budget_share || 0), 0))
})

const totalConversions = computed(() => {
  return editableItems.value.reduce((sum, item) => sum + (item.expected_conversions || 0), 0)
})

const averageRoi = computed(() => {
  if (editableItems.value.length === 0) return 0
  const totalRoi = editableItems.value.reduce((sum, item) => sum + (item.expected_roi || 0), 0)
  return Math.round(totalRoi / editableItems.value.length)
})

const isValidMix = computed(() => {
  return Math.abs(totalShare.value - 100) <= 1 // допускаем погрешность в 1%
})

// Methods
const calculateConversions = (budget, cpa) => {
  if (!budget || !cpa || cpa === 0) return 0
  return Math.round(budget / cpa)
}

const calculateRoi = (budget, conversions, revenuePerConversion = 5000) => {
  if (!budget || !conversions) return 0
  const revenue = conversions * revenuePerConversion
  return Math.round(((revenue - budget) / budget) * 100)
}

const updateItem = (item) => {
  // Пересчитываем метрики при изменении бюджета или CPA
  if (item.budget_allocation && item.expected_cpa) {
    item.expected_conversions = calculateConversions(item.budget_allocation, item.expected_cpa)
    item.expected_roi = calculateRoi(item.budget_allocation, item.expected_conversions)
  }

  // Пересчитываем долю от общего бюджета
  if (totalBudget.value > 0) {
    item.budget_share = Math.round((item.budget_allocation / totalBudget.value) * 100)
  }

  emitUpdate()
}

const updateShareItem = (item) => {
  // Пересчитываем бюджет на основе доли
  if (props.totalBudgetLimit && item.budget_share) {
    item.budget_allocation = Math.round((item.budget_share / 100) * props.totalBudgetLimit)

    // Пересчитываем конверсии и ROI
    if (item.expected_cpa) {
      item.expected_conversions = calculateConversions(item.budget_allocation, item.expected_cpa)
      item.expected_roi = calculateRoi(item.budget_allocation, item.expected_conversions)
    }
  }

  emitUpdate()
}

const addChannel = () => {
  const newChannel = {
    channel: availableChannels.find(ch => !editableItems.value.some(item => item.channel === ch)) || availableChannels[0],
    budget_allocation: 0,
    budget_share: 0,
    expected_cpa: 1000,
    expected_conversions: 0,
    expected_roi: 0
  }

  editableItems.value.push(newChannel)
  emitUpdate()
}

const removeChannel = (item) => {
  const index = editableItems.value.findIndex(i => i.channel === item.channel)
  if (index > -1) {
    editableItems.value.splice(index, 1)
    emitUpdate()
  }
}

const optimizeMix = () => {
  // Простая оптимизация - распределяем бюджет по ROI
  const sortedByRoi = [...editableItems.value].sort((a, b) => (b.expected_roi || 0) - (a.expected_roi || 0))

  // Перераспределяем доли бюджета в пользу каналов с высоким ROI
  sortedByRoi.forEach((item, index) => {
    if (index === 0) {
      item.budget_share = 40 // Лучший канал получает 40%
    } else if (index === 1) {
      item.budget_share = 30 // Второй - 30%
    } else if (index === 2) {
      item.budget_share = 20 // Третий - 20%
    } else {
      item.budget_share = 10 / (sortedByRoi.length - 3) // Остальные делят 10%
    }

    updateShareItem(item)
  })

  emit('mix-optimized', editableItems.value)
}

const emitUpdate = () => {
  emit('update:items', editableItems.value)
  emit('item-updated', editableItems.value)
}

const getRoiColor = (roi) => {
  if (roi >= 300) return 'success'
  if (roi >= 200) return 'warning'
  return 'error'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}

// Watchers
watch(() => props.items, (newItems) => {
  editableItems.value = [...newItems]
}, { immediate: true, deep: true })

onMounted(() => {
  if (props.items.length === 0) {
    // Добавляем начальные каналы если нет данных
    addChannel()
  }
})
</script>

<style scoped>
.media-mix-table {
  width: 100%;
}

.media-mix-data-table :deep(.v-text-field .v-field__input) {
  padding: 4px 8px;
  min-height: auto;
}

.media-mix-data-table :deep(.v-select .v-field__input) {
  padding: 4px 8px;
  min-height: auto;
}

.gap-4 {
  gap: 1rem;
}
</style>