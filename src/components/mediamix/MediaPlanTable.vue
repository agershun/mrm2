<template>
  <div class="media-plan-table">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Медиа-план</span>
        <div>
          <v-btn
            size="small"
            variant="outlined"
            @click="addMediaPlanItem"
            prepend-icon="mdi-plus"
          >
            Добавить размещение
          </v-btn>
          <v-btn
            size="small"
            variant="outlined"
            @click="distributeBudget"
            prepend-icon="mdi-shuffle-variant"
            class="ml-2"
          >
            Распределить бюджет
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="editableItems"
          :loading="loading"
          item-key="placement_id"
          hide-default-footer
          class="media-plan-data-table"
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

          <template #item.placement_type="{ item }">
            <v-select
              v-model="item.placement_type"
              :items="getPlacementTypes(item.channel)"
              variant="plain"
              density="compact"
              hide-details
              @update:model-value="updateItem(item)"
            />
          </template>

          <template #item.start_date="{ item }">
            <v-text-field
              v-model="item.start_date"
              type="date"
              variant="plain"
              density="compact"
              hide-details
              @update:model-value="updateItem(item)"
            />
          </template>

          <template #item.end_date="{ item }">
            <v-text-field
              v-model="item.end_date"
              type="date"
              variant="plain"
              density="compact"
              hide-details
              @update:model-value="updateItem(item)"
            />
          </template>

          <template #item.budget="{ item }">
            <v-text-field
              v-model.number="item.budget"
              type="number"
              variant="plain"
              density="compact"
              hide-details
              suffix="₽"
              @update:model-value="updateItem(item)"
            />
          </template>

          <template #item.impressions="{ item }">
            <v-text-field
              v-model.number="item.impressions"
              type="number"
              variant="plain"
              density="compact"
              hide-details
              @update:model-value="updateItem(item)"
            />
          </template>

          <template #item.clicks="{ item }">
            <span class="font-weight-medium">{{ formatNumber(item.clicks) }}</span>
          </template>

          <template #item.ctr="{ item }">
            <span class="font-weight-medium">{{ item.ctr }}%</span>
          </template>

          <template #item.cpm="{ item }">
            <span class="font-weight-medium">{{ formatCurrency(item.cpm) }}</span>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-content-copy"
              size="small"
              variant="text"
              @click="duplicateItem(item)"
              title="Дублировать"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="removeItem(item)"
              title="Удалить"
            />
          </template>
        </v-data-table>

        <!-- Итоговая строка -->
        <v-card
          variant="outlined"
          class="mt-4 pa-3"
          color="info"
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
                <div class="text-caption text-grey-darken-1">Показы</div>
                <div class="text-h6">{{ formatNumber(totalImpressions) }}</div>
              </div>
              <div class="text-center">
                <div class="text-caption text-grey-darken-1">Клики</div>
                <div class="text-h6">{{ formatNumber(totalClicks) }}</div>
              </div>
              <div class="text-center">
                <div class="text-caption text-grey-darken-1">Средний CTR</div>
                <div class="text-h6">{{ averageCtr }}%</div>
              </div>
              <div class="text-center">
                <div class="text-caption text-grey-darken-1">Средний CPM</div>
                <div class="text-h6">{{ formatCurrency(averageCpm) }}</div>
              </div>
            </div>
          </div>
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
  }
})

const emit = defineEmits(['update:items', 'item-updated'])

const editableItems = ref([])

const headers = [
  { title: 'Канал', key: 'channel', sortable: false, width: '120px' },
  { title: 'Тип размещения', key: 'placement_type', sortable: false, width: '140px' },
  { title: 'Начало', key: 'start_date', sortable: false, width: '120px' },
  { title: 'Конец', key: 'end_date', sortable: false, width: '120px' },
  { title: 'Бюджет (₽)', key: 'budget', sortable: false, width: '120px' },
  { title: 'Показы', key: 'impressions', sortable: false, width: '100px' },
  { title: 'Клики', key: 'clicks', sortable: false, width: '80px' },
  { title: 'CTR (%)', key: 'ctr', sortable: false, width: '80px' },
  { title: 'CPM (₽)', key: 'cpm', sortable: false, width: '90px' },
  { title: 'Действия', key: 'actions', sortable: false, width: '100px', align: 'center' }
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
  'Display',
  'Programmatic'
]

const placementTypes = {
  'Google Ads': ['Search', 'Display', 'Shopping', 'Video', 'App'],
  'Yandex Direct': ['Поиск', 'РСЯ', 'Медийная реклама'],
  'Facebook': ['News Feed', 'Stories', 'Reel', 'Marketplace'],
  'Instagram': ['Feed', 'Stories', 'Reels', 'IGTV'],
  'YouTube': ['In-Stream', 'Discovery', 'Shorts', 'Masthead'],
  'VKontakte': ['Лента', 'Истории', 'Клипы', 'Промопосты'],
  'Telegram': ['Каналы', 'Боты', 'Sponsored Messages'],
  'Email Marketing': ['Newsletter', 'Promo', 'Trigger'],
  'Display': ['Banner', 'Rich Media', 'Video'],
  'Programmatic': ['RTB', 'Private Marketplace', 'Preferred Deals']
}

// Computed properties
const totalBudget = computed(() => {
  return editableItems.value.reduce((sum, item) => sum + (item.budget || 0), 0)
})

const totalImpressions = computed(() => {
  return editableItems.value.reduce((sum, item) => sum + (item.impressions || 0), 0)
})

const totalClicks = computed(() => {
  return editableItems.value.reduce((sum, item) => sum + (item.clicks || 0), 0)
})

const averageCtr = computed(() => {
  if (totalImpressions.value === 0) return '0.00'
  return ((totalClicks.value / totalImpressions.value) * 100).toFixed(2)
})

const averageCpm = computed(() => {
  if (totalImpressions.value === 0) return 0
  return Math.round((totalBudget.value / totalImpressions.value) * 1000)
})

// Methods
const getPlacementTypes = (channel) => {
  return placementTypes[channel] || ['Standard']
}

const calculateClicks = (impressions, ctr) => {
  if (!impressions || !ctr) return 0
  return Math.round((impressions * ctr) / 100)
}

const calculateCtr = (clicks, impressions) => {
  if (!clicks || !impressions) return 0
  return ((clicks / impressions) * 100).toFixed(2)
}

const calculateCpm = (budget, impressions) => {
  if (!budget || !impressions) return 0
  return Math.round((budget / impressions) * 1000)
}

const updateItem = (item) => {
  // Пересчитываем метрики
  if (item.impressions && item.budget) {
    if (!item.ctr) item.ctr = 1.5 // Дефолтный CTR
    item.clicks = calculateClicks(item.impressions, item.ctr)
    item.cpm = calculateCpm(item.budget, item.impressions)
  }

  if (item.clicks && item.impressions) {
    item.ctr = parseFloat(calculateCtr(item.clicks, item.impressions))
  }

  emitUpdate()
}

const addMediaPlanItem = () => {
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const newItem = {
    placement_id: `placement_${Date.now()}`,
    channel: availableChannels[0],
    placement_type: 'Standard',
    start_date: today,
    end_date: nextWeek,
    budget: 100000,
    impressions: 50000,
    clicks: 750,
    ctr: 1.5,
    cpm: 2000
  }

  editableItems.value.push(newItem)
  emitUpdate()
}

const duplicateItem = (item) => {
  const duplicatedItem = {
    ...item,
    placement_id: `placement_${Date.now()}`,
  }

  editableItems.value.push(duplicatedItem)
  emitUpdate()
}

const removeItem = (item) => {
  const index = editableItems.value.findIndex(i => i.placement_id === item.placement_id)
  if (index > -1) {
    editableItems.value.splice(index, 1)
    emitUpdate()
  }
}

const distributeBudget = () => {
  // Равномерное распределение бюджета между размещениями
  const totalCurrentBudget = totalBudget.value
  const itemCount = editableItems.value.length

  if (itemCount === 0) return

  const budgetPerItem = Math.round(totalCurrentBudget / itemCount)

  editableItems.value.forEach(item => {
    item.budget = budgetPerItem
    updateItem(item)
  })

  emitUpdate()
}

const emitUpdate = () => {
  emit('update:items', editableItems.value)
  emit('item-updated', editableItems.value)
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
    // Добавляем начальное размещение если нет данных
    addMediaPlanItem()
  }
})
</script>

<style scoped>
.media-plan-table {
  width: 100%;
}

.media-plan-data-table :deep(.v-text-field .v-field__input) {
  padding: 4px 8px;
  min-height: auto;
}

.media-plan-data-table :deep(.v-select .v-field__input) {
  padding: 4px 8px;
  min-height: auto;
}

.gap-4 {
  gap: 1rem;
}
</style>