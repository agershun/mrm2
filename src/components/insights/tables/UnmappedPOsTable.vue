<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Не сопоставленные заказы на покупку</span>
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

      <div v-else-if="!pos || pos.length === 0" class="text-center pa-8">
        <v-icon size="64" color="success">mdi-check-circle</v-icon>
        <p class="text-success mt-2">Все заказы сопоставлены!</p>
      </div>

      <div v-else>
        <!-- Сводная информация -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="error" size="32" class="mb-2">mdi-file-question</v-icon>
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
              <v-icon color="info" size="32" class="mb-2">mdi-calendar</v-icon>
              <div class="text-h6 font-weight-bold text-info">{{ avgAge }}</div>
              <div class="text-caption text-grey">Средний возраст</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="primary" size="32" class="mb-2">mdi-account-group</v-icon>
              <div class="text-h6 font-weight-bold text-primary">{{ suppliersCount }}</div>
              <div class="text-caption text-grey">Поставщиков</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Таблица -->
        <v-data-table
          :headers="headers"
          :items="filteredPOs"
          :items-per-page="itemsPerPage"
          :search="searchQuery"
          density="compact"
          @click:row="handleRowClick"
        >
          <template #item.po_number="{ item }">
            <div class="d-flex align-center">
              <v-avatar
                size="24"
                :color="getStatusColor(item.status)"
                class="me-2"
              >
                <v-icon size="12" color="white">{{ getStatusIcon(item.status) }}</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.po_number }}</div>
                <div class="text-caption text-grey">{{ item.supplier_name }}</div>
              </div>
            </div>
          </template>

          <template #item.amount="{ item }">
            <div class="text-right">
              <div class="font-weight-medium">{{ formatCurrency(item.amount) }}</div>
              <div class="text-caption text-grey">{{ item.currency }}</div>
            </div>
          </template>

          <template #item.created_date="{ item }">
            <div class="text-center">
              <div>{{ formatDate(item.created_date) }}</div>
              <div class="text-caption" :class="getAgeClass(item.age_days)">
                {{ item.age_days }} дней назад
              </div>
            </div>
          </template>

          <template #item.matching_suggestions="{ item }">
            <div v-if="item.matching_suggestions && item.matching_suggestions.length > 0">
              <v-chip
                v-for="suggestion in item.matching_suggestions.slice(0, 2)"
                :key="suggestion.activity_id"
                size="x-small"
                color="info"
                variant="tonal"
                class="me-1 mb-1"
                @click.stop="applySuggestion(item, suggestion)"
              >
                {{ suggestion.activity_name }}
              </v-chip>
              <div v-if="item.matching_suggestions.length > 2" class="text-caption text-grey">
                +{{ item.matching_suggestions.length - 2 }} еще
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
  pos: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  itemsPerPage: { type: Number, default: 10 }
})

const emit = defineEmits([
  'refresh', 'map-manually', 'view-details', 'exclude-from-mapping',
  'apply-suggestion'
])

const searchQuery = ref('')

const headers = [
  { title: 'Номер заказа', key: 'po_number', sortable: true, width: '20%' },
  { title: 'Сумма', key: 'amount', sortable: true, align: 'end' },
  { title: 'Дата создания', key: 'created_date', sortable: true, align: 'center' },
  { title: 'Предложения', key: 'matching_suggestions', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false, align: 'center', width: '80px' }
]

const filteredPOs = computed(() => {
  if (!searchQuery.value) return props.pos

  return props.pos.filter(po =>
    po.po_number.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    po.supplier_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    po.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const unmappedCount = computed(() => {
  return props.pos.length
})

const totalAmount = computed(() => {
  return props.pos.reduce((sum, po) => sum + (po.amount || 0), 0)
})

const avgAge = computed(() => {
  if (props.pos.length === 0) return '0 дней'
  const totalAge = props.pos.reduce((sum, po) => sum + (po.age_days || 0), 0)
  const avgDays = Math.round(totalAge / props.pos.length)
  return `${avgDays} дней`
})

const suppliersCount = computed(() => {
  const uniqueSuppliers = new Set(props.pos.map(po => po.supplier_name))
  return uniqueSuppliers.size
})

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    draft: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'mdi-clock',
    approved: 'mdi-check',
    rejected: 'mdi-close',
    draft: 'mdi-pencil'
  }
  return icons[status] || 'mdi-help'
}

const getAgeClass = (ageDays) => {
  if (ageDays > 30) return 'text-error'
  if (ageDays > 14) return 'text-warning'
  return 'text-grey'
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

const handleRowClick = (event, { item }) => {
  mapManually(item)
}

const mapManually = (po) => {
  emit('map-manually', po)
}

const viewDetails = (po) => {
  emit('view-details', po)
}

const excludeFromMapping = (po) => {
  emit('exclude-from-mapping', po)
}

const applySuggestion = (po, suggestion) => {
  emit('apply-suggestion', { po, suggestion })
}
</script>