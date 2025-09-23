<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Не сопоставленные фактические данные</span>
        <div class="d-flex align-center">
          <v-text-field
            v-model="searchQuery"
            density="compact"
            placeholder="Поиск..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            class="me-2"
            style="max-width: 200px;"
          />
          <v-btn
            icon="mdi-refresh"
            size="small"
            variant="text"
            @click="$emit('refresh')"
          />
        </div>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-2">Загрузка данных...</p>
      </div>

      <div v-else-if="!actuals || actuals.length === 0" class="text-center pa-8">
        <v-icon size="64" color="success">mdi-check-circle</v-icon>
        <p class="text-success mt-2">Все фактические данные сопоставлены!</p>
      </div>

      <div v-else>
        <!-- Сводная информация -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="error" size="32" class="mb-2">mdi-database-alert</v-icon>
              <div class="text-h6 font-weight-bold text-error">{{ unmappedCount }}</div>
              <div class="text-caption text-grey">Не сопоставлено</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="warning" size="32" class="mb-2">mdi-currency-rub</v-icon>
              <div class="text-h6 font-weight-bold text-warning">{{ formatCurrency(totalAmount) }}</div>
              <div class="text-caption text-grey">Общая сумма</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="info" size="32" class="mb-2">mdi-source-branch</v-icon>
              <div class="text-h6 font-weight-bold text-info">{{ sourcesCount }}</div>
              <div class="text-caption text-grey">Источников</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="primary" size="32" class="mb-2">mdi-calendar-month</v-icon>
              <div class="text-h6 font-weight-bold text-primary">{{ dateRange }}</div>
              <div class="text-caption text-grey">Период</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Таблица -->
        <v-data-table
          :headers="headers"
          :items="filteredActuals"
          :items-per-page="itemsPerPage"
          :search="searchQuery"
          density="compact"
          @click:row="handleRowClick"
        >
          <template #item.transaction_id="{ item }">
            <div class="d-flex align-center">
              <v-avatar
                size="24"
                :color="getSourceColor(item.source_system)"
                class="me-2"
              >
                <v-icon size="12" color="white">{{ getSourceIcon(item.source_system) }}</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.transaction_id }}</div>
                <div class="text-caption text-grey">{{ item.source_system }}</div>
              </div>
            </div>
          </template>

          <template #item.amount="{ item }">
            <div class="text-right">
              <div class="font-weight-medium">{{ formatCurrency(item.amount) }}</div>
              <div class="text-caption text-grey">{{ item.transaction_type }}</div>
            </div>
          </template>

          <template #item.transaction_date="{ item }">
            <div class="text-center">
              <div>{{ formatDate(item.transaction_date) }}</div>
              <div class="text-caption text-grey">
                {{ getRelativeDate(item.transaction_date) }}
              </div>
            </div>
          </template>

          <template #item.vendor_supplier="{ item }">
            <div>
              <div class="font-weight-medium">{{ item.vendor_supplier }}</div>
              <div v-if="item.vendor_code" class="text-caption text-grey">
                Код: {{ item.vendor_code }}
              </div>
            </div>
          </template>

          <template #item.matching_confidence="{ item }">
            <div class="d-flex align-center">
              <v-progress-linear
                :model-value="item.matching_confidence || 0"
                :color="getConfidenceColor(item.matching_confidence)"
                height="6"
                rounded
                class="me-2"
                style="min-width: 60px;"
              />
              <span class="text-caption">{{ item.matching_confidence || 0 }}%</span>
            </div>
          </template>

          <template #item.suggested_activities="{ item }">
            <div v-if="item.suggested_activities && item.suggested_activities.length > 0">
              <v-chip
                v-for="activity in item.suggested_activities.slice(0, 2)"
                :key="activity.activity_id"
                size="x-small"
                color="info"
                variant="tonal"
                class="me-1 mb-1"
                @click.stop="applySuggestion(item, activity)"
              >
                {{ activity.activity_name }}
              </v-chip>
              <div v-if="item.suggested_activities.length > 2" class="text-caption text-grey">
                +{{ item.suggested_activities.length - 2 }} еще
              </div>
            </div>
            <div v-else class="text-caption text-grey">
              Нет предложений
            </div>
          </template>

          <template #item.actions="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                  v-bind="props"
                />
              </template>
              <v-list density="compact">
                <v-list-item @click="mapManually(item)">
                  <v-list-item-title>Сопоставить вручную</v-list-item-title>
                </v-list-item>
                <v-list-item @click="viewDetails(item)">
                  <v-list-item-title>Посмотреть детали</v-list-item-title>
                </v-list-item>
                <v-list-item @click="markAsProcessed(item)">
                  <v-list-item-title>Отметить как обработанное</v-list-item-title>
                </v-list-item>
                <v-list-item @click="excludeFromMapping(item)">
                  <v-list-item-title>Исключить из сопоставления</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  actuals: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  itemsPerPage: { type: Number, default: 10 }
})

const emit = defineEmits([
  'refresh', 'map-manually', 'view-details', 'mark-as-processed',
  'exclude-from-mapping', 'apply-suggestion'
])

const searchQuery = ref('')

const headers = [
  { title: 'ID транзакции', key: 'transaction_id', sortable: true, width: '20%' },
  { title: 'Сумма', key: 'amount', sortable: true, align: 'end' },
  { title: 'Дата', key: 'transaction_date', sortable: true, align: 'center' },
  { title: 'Поставщик', key: 'vendor_supplier', sortable: true },
  { title: 'Соответствие', key: 'matching_confidence', sortable: true, align: 'center' },
  { title: 'Предложения', key: 'suggested_activities', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false, align: 'center', width: '80px' }
]

const filteredActuals = computed(() => {
  if (!searchQuery.value) return props.actuals

  return props.actuals.filter(actual =>
    actual.transaction_id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    actual.vendor_supplier?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    actual.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const unmappedCount = computed(() => {
  return props.actuals.length
})

const totalAmount = computed(() => {
  return props.actuals.reduce((sum, actual) => sum + Math.abs(actual.amount || 0), 0)
})

const sourcesCount = computed(() => {
  const uniqueSources = new Set(props.actuals.map(actual => actual.source_system))
  return uniqueSources.size
})

const dateRange = computed(() => {
  if (props.actuals.length === 0) return 'Нет данных'

  const dates = props.actuals.map(actual => new Date(actual.transaction_date))
  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))

  const formatMonth = (date) => date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })

  if (minDate.getMonth() === maxDate.getMonth() && minDate.getFullYear() === maxDate.getFullYear()) {
    return formatMonth(minDate)
  }

  return `${formatMonth(minDate)} - ${formatMonth(maxDate)}`
})

const getSourceColor = (source) => {
  const colors = {
    'SAP': 'primary',
    'Oracle': 'warning',
    'Excel': 'success',
    'Manual': 'info',
    'API': 'purple'
  }
  return colors[source] || 'grey'
}

const getSourceIcon = (source) => {
  const icons = {
    'SAP': 'mdi-database',
    'Oracle': 'mdi-database-outline',
    'Excel': 'mdi-file-excel',
    'Manual': 'mdi-account',
    'API': 'mdi-api'
  }
  return icons[source] || 'mdi-help'
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return 'success'
  if (confidence >= 60) return 'warning'
  if (confidence >= 40) return 'info'
  return 'error'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}

const getRelativeDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 30) return `${diffDays} дн. назад`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`
  return `${Math.floor(diffDays / 365)} г. назад`
}

const handleRowClick = (event, { item }) => {
  mapManually(item)
}

const mapManually = (actual) => {
  emit('map-manually', actual)
}

const viewDetails = (actual) => {
  emit('view-details', actual)
}

const markAsProcessed = (actual) => {
  emit('mark-as-processed', actual)
}

const excludeFromMapping = (actual) => {
  emit('exclude-from-mapping', actual)
}

const applySuggestion = (actual, suggestion) => {
  emit('apply-suggestion', { actual, suggestion })
}
</script>