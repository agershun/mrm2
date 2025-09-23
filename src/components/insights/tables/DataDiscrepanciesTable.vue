<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Расхождения в данных</span>
        <div class="d-flex align-center">
          <v-btn-toggle v-model="filterSeverity" mandatory size="small" class="me-2">
            <v-btn value="all" size="small">Все</v-btn>
            <v-btn value="high" size="small">Высокие</v-btn>
            <v-btn value="critical" size="small">Критичные</v-btn>
          </v-btn-toggle>
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
        <p class="mt-2">Анализ расхождений...</p>
      </div>

      <div v-else-if="!discrepancies || discrepancies.length === 0" class="text-center pa-8">
        <v-icon size="64" color="success">mdi-check-circle</v-icon>
        <p class="text-success mt-2">Расхождений не обнаружено!</p>
      </div>

      <div v-else>
        <!-- Сводная информация -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="error" size="32" class="mb-2">mdi-alert-circle</v-icon>
              <div class="text-h6 font-weight-bold text-error">{{ criticalCount }}</div>
              <div class="text-caption text-grey">Критичные</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="warning" size="32" class="mb-2">mdi-alert</v-icon>
              <div class="text-h6 font-weight-bold text-warning">{{ highCount }}</div>
              <div class="text-caption text-grey">Высокие</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="info" size="32" class="mb-2">mdi-information</v-icon>
              <div class="text-h6 font-weight-bold text-info">{{ mediumCount }}</div>
              <div class="text-caption text-grey">Средние</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="primary" size="32" class="mb-2">mdi-currency-rub</v-icon>
              <div class="text-h6 font-weight-bold text-primary">{{ formatCurrency(totalAmount) }}</div>
              <div class="text-caption text-grey">Сумма расхождений</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Таблица расхождений -->
        <v-data-table
          :headers="headers"
          :items="filteredDiscrepancies"
          :items-per-page="itemsPerPage"
          density="compact"
          @click:row="handleRowClick"
        >
          <template #item.discrepancy_type="{ item }">
            <div class="d-flex align-center">
              <v-avatar
                size="32"
                :color="getSeverityColor(item.severity)"
                class="me-3"
              >
                <v-icon size="16" color="white">
                  {{ getDiscrepancyIcon(item.discrepancy_type) }}
                </v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ getDiscrepancyTypeName(item.discrepancy_type) }}</div>
                <div class="text-caption text-grey">{{ item.source_comparison }}</div>
              </div>
            </div>
          </template>

          <template #item.activity_name="{ item }">
            <div>
              <div class="font-weight-medium">{{ item.activity_name }}</div>
              <div class="text-caption text-grey">{{ item.activity_id }}</div>
            </div>
          </template>

          <template #item.amount_difference="{ item }">
            <div class="text-right">
              <div class="font-weight-medium" :class="getAmountDifferenceClass(item.amount_difference)">
                {{ formatCurrency(item.amount_difference) }}
              </div>
              <div class="text-caption text-grey">
                {{ getPercentageDifference(item) }}%
              </div>
            </div>
          </template>

          <template #item.severity="{ item }">
            <v-chip
              size="small"
              :color="getSeverityColor(item.severity)"
              variant="tonal"
            >
              {{ getSeverityLabel(item.severity) }}
            </v-chip>
          </template>

          <template #item.detected_date="{ item }">
            <div class="text-center">
              <div>{{ formatDate(item.detected_date) }}</div>
              <div class="text-caption text-grey">
                {{ getRelativeDate(item.detected_date) }}
              </div>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="getStatusColor(item.status)"
              variant="tonal"
            >
              {{ getStatusLabel(item.status) }}
            </v-chip>
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
                <v-list-item @click="resolveDiscrepancy(item)">
                  <v-list-item-title>Исправить</v-list-item-title>
                </v-list-item>
                <v-list-item @click="viewDetails(item)">
                  <v-list-item-title>Посмотреть детали</v-list-item-title>
                </v-list-item>
                <v-list-item @click="ignoreDiscrepancy(item)">
                  <v-list-item-title>Игнорировать</v-list-item-title>
                </v-list-item>
                <v-list-item @click="escalateDiscrepancy(item)">
                  <v-list-item-title>Эскалировать</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <template #expanded-row="{ item }">
            <td :colspan="headers.length">
              <v-card variant="outlined" class="ma-4">
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="text-subtitle-2 mb-2">Источник 1: {{ item.source1_name }}</div>
                      <div class="text-body-2 mb-1">
                        <strong>Значение:</strong> {{ formatCurrency(item.source1_value) }}
                      </div>
                      <div class="text-body-2 mb-1">
                        <strong>Дата:</strong> {{ formatDate(item.source1_date) }}
                      </div>
                      <div class="text-body-2">
                        <strong>Описание:</strong> {{ item.source1_description }}
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="text-subtitle-2 mb-2">Источник 2: {{ item.source2_name }}</div>
                      <div class="text-body-2 mb-1">
                        <strong>Значение:</strong> {{ formatCurrency(item.source2_value) }}
                      </div>
                      <div class="text-body-2 mb-1">
                        <strong>Дата:</strong> {{ formatDate(item.source2_date) }}
                      </div>
                      <div class="text-body-2">
                        <strong>Описание:</strong> {{ item.source2_description }}
                      </div>
                    </v-col>
                  </v-row>

                  <v-divider class="my-3" />

                  <div v-if="item.resolution_suggestions && item.resolution_suggestions.length > 0">
                    <div class="text-subtitle-2 mb-2">Предложения по решению:</div>
                    <ul>
                      <li
                        v-for="suggestion in item.resolution_suggestions"
                        :key="suggestion"
                        class="text-body-2 mb-1"
                      >
                        {{ suggestion }}
                      </li>
                    </ul>
                  </div>
                </v-card-text>
              </v-card>
            </td>
          </template>
        </v-data-table>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  discrepancies: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  itemsPerPage: { type: Number, default: 10 }
})

const emit = defineEmits([
  'refresh', 'resolve-discrepancy', 'view-details',
  'ignore-discrepancy', 'escalate-discrepancy'
])

const filterSeverity = ref('all')

const headers = [
  { title: 'Тип расхождения', key: 'discrepancy_type', sortable: true, width: '25%' },
  { title: 'Активность', key: 'activity_name', sortable: true },
  { title: 'Разница', key: 'amount_difference', sortable: true, align: 'end' },
  { title: 'Серьезность', key: 'severity', sortable: true, align: 'center' },
  { title: 'Обнаружено', key: 'detected_date', sortable: true, align: 'center' },
  { title: 'Статус', key: 'status', sortable: true, align: 'center' },
  { title: 'Действия', key: 'actions', sortable: false, align: 'center', width: '80px' }
]

const filteredDiscrepancies = computed(() => {
  if (filterSeverity.value === 'all') {
    return props.discrepancies
  }
  return props.discrepancies.filter(disc => disc.severity === filterSeverity.value)
})

const criticalCount = computed(() => {
  return props.discrepancies.filter(disc => disc.severity === 'critical').length
})

const highCount = computed(() => {
  return props.discrepancies.filter(disc => disc.severity === 'high').length
})

const mediumCount = computed(() => {
  return props.discrepancies.filter(disc => disc.severity === 'medium').length
})

const totalAmount = computed(() => {
  return props.discrepancies.reduce((sum, disc) => sum + Math.abs(disc.amount_difference || 0), 0)
})

const getSeverityColor = (severity) => {
  const colors = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success'
  }
  return colors[severity] || 'grey'
}

const getSeverityLabel = (severity) => {
  const labels = {
    critical: 'Критичная',
    high: 'Высокая',
    medium: 'Средняя',
    low: 'Низкая'
  }
  return labels[severity] || severity
}

const getStatusColor = (status) => {
  const colors = {
    open: 'error',
    investigating: 'warning',
    resolved: 'success',
    ignored: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    open: 'Открыто',
    investigating: 'Исследуется',
    resolved: 'Решено',
    ignored: 'Игнорируется'
  }
  return labels[status] || status
}

const getDiscrepancyIcon = (type) => {
  const icons = {
    amount_mismatch: 'mdi-currency-usd-off',
    date_mismatch: 'mdi-calendar-alert',
    vendor_mismatch: 'mdi-account-alert',
    category_mismatch: 'mdi-tag-alert',
    missing_data: 'mdi-database-alert',
    duplicate_data: 'mdi-content-duplicate'
  }
  return icons[type] || 'mdi-alert'
}

const getDiscrepancyTypeName = (type) => {
  const names = {
    amount_mismatch: 'Несоответствие сумм',
    date_mismatch: 'Несоответствие дат',
    vendor_mismatch: 'Несоответствие поставщиков',
    category_mismatch: 'Несоответствие категорий',
    missing_data: 'Отсутствующие данные',
    duplicate_data: 'Дублирующие данные'
  }
  return names[type] || type
}

const getAmountDifferenceClass = (amount) => {
  if (amount > 0) return 'text-error'
  if (amount < 0) return 'text-success'
  return 'text-grey'
}

const getPercentageDifference = (discrepancy) => {
  const source1Value = Math.abs(discrepancy.source1_value || 0)
  const difference = Math.abs(discrepancy.amount_difference || 0)

  if (source1Value === 0) return 0

  return Math.round((difference / source1Value) * 100)
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
  if (diffDays < 7) return `${diffDays} дн. назад`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`
  return `${Math.floor(diffDays / 30)} мес. назад`
}

const handleRowClick = (event, { item }) => {
  viewDetails(item)
}

const resolveDiscrepancy = (discrepancy) => {
  emit('resolve-discrepancy', discrepancy)
}

const viewDetails = (discrepancy) => {
  emit('view-details', discrepancy)
}

const ignoreDiscrepancy = (discrepancy) => {
  emit('ignore-discrepancy', discrepancy)
}

const escalateDiscrepancy = (discrepancy) => {
  emit('escalate-discrepancy', discrepancy)
}
</script>