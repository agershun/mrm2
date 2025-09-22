<template>
  <div class="budget-history">
    <!-- Заголовок с фильтрами -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">История изменений бюджета</h3>
      <v-btn
        variant="outlined"
        prepend-icon="mdi-download"
        @click="exportHistory"
      >
        Экспорт
      </v-btn>
    </div>

    <!-- Фильтры и поиск -->
    <v-card class="mb-4" elevation="1">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.action"
              label="Тип действия"
              :items="actionFilterOptions"
              clearable
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.user"
              label="Пользователь"
              :items="userOptions"
              clearable
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.dateFrom"
              label="С даты"
              type="date"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.dateTo"
              label="По дату"
              type="date"
              density="compact"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="9">
            <v-text-field
              v-model="searchQuery"
              label="Поиск по описанию"
              prepend-inner-icon="mdi-magnify"
              clearable
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-btn
              @click="clearFilters"
              variant="outlined"
              block
            >
              Сбросить фильтры
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Таймлайн изменений -->
    <v-card elevation="1">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-history</v-icon>
        Хронология изменений
      </v-card-title>

      <v-card-text v-if="filteredHistory.length > 0">
        <v-timeline
          align="start"
          density="compact"
          truncate-line="both"
        >
          <v-timeline-item
            v-for="item in paginatedHistory"
            :key="item.id"
            :dot-color="getActionColor(item.action)"
            size="small"
            class="mb-4"
          >
            <template v-slot:icon>
              <v-icon
                size="16"
                :color="getActionIconColor(item.action)"
              >
                {{ getActionIcon(item.action) }}
              </v-icon>
            </template>

            <div class="history-item">
              <div class="d-flex justify-space-between align-start mb-2">
                <div>
                  <div class="text-subtitle-2 font-weight-medium">
                    {{ getActionText(item.action) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDateTime(item.timestamp) }}
                  </div>
                </div>
                <v-chip
                  :color="getActionColor(item.action)"
                  size="small"
                  variant="tonal"
                >
                  {{ getActionText(item.action) }}
                </v-chip>
              </div>

              <div class="text-body-2 mb-2">
                {{ item.description }}
              </div>

              <div v-if="item.changes && item.changes.length > 0" class="mb-2">
                <div class="text-caption text-medium-emphasis mb-1">Изменения:</div>
                <div
                  v-for="change in item.changes"
                  :key="change.field"
                  class="d-flex align-center mb-1"
                >
                  <strong class="me-2">{{ change.field }}:</strong>
                  <span v-if="change.oldValue" class="text-error me-2">
                    {{ formatChangeValue(change.field, change.oldValue) }}
                  </span>
                  <v-icon v-if="change.oldValue" size="16" class="mx-1">mdi-arrow-right</v-icon>
                  <span class="text-success">
                    {{ formatChangeValue(change.field, change.newValue) }}
                  </span>
                </div>
              </div>

              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-avatar size="24" class="me-2">
                    <v-icon size="14">mdi-account</v-icon>
                  </v-avatar>
                  <span class="text-caption">{{ item.user }}</span>
                </div>

                <div v-if="item.ipAddress" class="text-caption text-medium-emphasis">
                  IP: {{ item.ipAddress }}
                </div>
              </div>

              <div v-if="item.comment" class="mt-2 pa-2 bg-grey-lighten-5 rounded">
                <div class="text-caption text-medium-emphasis mb-1">Комментарий:</div>
                <div class="text-body-2">{{ item.comment }}</div>
              </div>
            </div>
          </v-timeline-item>
        </v-timeline>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="d-flex justify-center mt-4">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="7"
          />
        </div>
      </v-card-text>

      <v-card-text v-else>
        <div class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2">
            mdi-history
          </v-icon>
          <p class="text-body-1 mt-4 text-medium-emphasis">
            История изменений не найдена
          </p>
          <p class="text-caption text-medium-emphasis">
            Попробуйте изменить фильтры поиска
          </p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'BudgetPanelHistory',
  props: {
    budget: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10

    const filters = ref({
      action: null,
      user: null,
      dateFrom: '',
      dateTo: ''
    })

    const historyItems = ref([
      {
        id: 1,
        action: 'created',
        description: 'Бюджет создан',
        user: 'Иванов И.И.',
        timestamp: '2024-01-15T09:00:00Z',
        ipAddress: '192.168.1.100',
        changes: [
          { field: 'Название', newValue: 'Маркетинговый бюджет Q1' },
          { field: 'Сумма', newValue: '1000000' },
          { field: 'Статус', newValue: 'Черновик' }
        ]
      },
      {
        id: 2,
        action: 'updated',
        description: 'Обновлена сумма бюджета',
        user: 'Петрова П.П.',
        timestamp: '2024-01-16T14:30:00Z',
        ipAddress: '192.168.1.101',
        changes: [
          { field: 'Плановая сумма', oldValue: '1000000', newValue: '1200000' }
        ],
        comment: 'Увеличение бюджета согласовано с руководством'
      },
      {
        id: 3,
        action: 'status_changed',
        description: 'Статус изменен на "Активный"',
        user: 'Сидоров С.С.',
        timestamp: '2024-01-17T10:15:00Z',
        ipAddress: '192.168.1.102',
        changes: [
          { field: 'Статус', oldValue: 'Черновик', newValue: 'Активный' }
        ]
      },
      {
        id: 4,
        action: 'allocation_added',
        description: 'Добавлено распределение "Цифровая реклама"',
        user: 'Козлова К.К.',
        timestamp: '2024-01-18T11:45:00Z',
        ipAddress: '192.168.1.103',
        changes: [
          { field: 'Новое распределение', newValue: 'Цифровая реклама - 500000 ₽' }
        ]
      },
      {
        id: 5,
        action: 'request_created',
        description: 'Создан запрос на увеличение бюджета',
        user: 'Николаев Н.Н.',
        timestamp: '2024-01-20T16:20:00Z',
        ipAddress: '192.168.1.104',
        changes: [
          { field: 'Запрос', newValue: 'Увеличение на 200000 ₽' }
        ],
        comment: 'Необходимо для запуска новой кампании'
      },
      {
        id: 6,
        action: 'shared',
        description: 'Бюджет расшарен с командой маркетинга',
        user: 'Иванов И.И.',
        timestamp: '2024-01-21T09:30:00Z',
        ipAddress: '192.168.1.100',
        changes: [
          { field: 'Доступ', newValue: 'Команда маркетинга' }
        ]
      }
    ])

    const actionFilterOptions = [
      { title: 'Создание', value: 'created' },
      { title: 'Обновление', value: 'updated' },
      { title: 'Изменение статуса', value: 'status_changed' },
      { title: 'Добавление распределения', value: 'allocation_added' },
      { title: 'Создание запроса', value: 'request_created' },
      { title: 'Предоставление доступа', value: 'shared' },
      { title: 'Архивирование', value: 'archived' },
      { title: 'Удаление', value: 'deleted' }
    ]

    const userOptions = [
      'Иванов И.И.',
      'Петрова П.П.',
      'Сидоров С.С.',
      'Козлова К.К.',
      'Николаев Н.Н.'
    ]

    const filteredHistory = computed(() => {
      let filtered = historyItems.value

      // Фильтр по типу действия
      if (filters.value.action) {
        filtered = filtered.filter(item => item.action === filters.value.action)
      }

      // Фильтр по пользователю
      if (filters.value.user) {
        filtered = filtered.filter(item => item.user === filters.value.user)
      }

      // Фильтр по дате (от)
      if (filters.value.dateFrom) {
        const fromDate = new Date(filters.value.dateFrom)
        filtered = filtered.filter(item => new Date(item.timestamp) >= fromDate)
      }

      // Фильтр по дате (до)
      if (filters.value.dateTo) {
        const toDate = new Date(filters.value.dateTo + 'T23:59:59')
        filtered = filtered.filter(item => new Date(item.timestamp) <= toDate)
      }

      // Поиск по описанию
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(item =>
          item.description.toLowerCase().includes(query) ||
          (item.comment && item.comment.toLowerCase().includes(query))
        )
      }

      return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredHistory.value.length / itemsPerPage)
    })

    const paginatedHistory = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredHistory.value.slice(start, end)
    })

    const formatDateTime = (timestamp) => {
      return new Date(timestamp).toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatChangeValue = (field, value) => {
      if (field.toLowerCase().includes('сумма') || field.toLowerCase().includes('стоимость')) {
        return formatCurrency(value)
      }
      return value
    }

    const formatCurrency = (amount) => {
      if (!amount && amount !== 0) return '0 ₽'
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    const getActionColor = (action) => {
      const colors = {
        'created': 'success',
        'updated': 'info',
        'status_changed': 'warning',
        'allocation_added': 'primary',
        'request_created': 'purple',
        'shared': 'cyan',
        'archived': 'grey',
        'deleted': 'error'
      }
      return colors[action] || 'grey'
    }

    const getActionIconColor = (action) => {
      return 'white'
    }

    const getActionIcon = (action) => {
      const icons = {
        'created': 'mdi-plus',
        'updated': 'mdi-pencil',
        'status_changed': 'mdi-swap-horizontal',
        'allocation_added': 'mdi-chart-pie',
        'request_created': 'mdi-clipboard-plus',
        'shared': 'mdi-share',
        'archived': 'mdi-archive',
        'deleted': 'mdi-delete'
      }
      return icons[action] || 'mdi-circle'
    }

    const getActionText = (action) => {
      const texts = {
        'created': 'Создание',
        'updated': 'Обновление',
        'status_changed': 'Изменение статуса',
        'allocation_added': 'Добавление распределения',
        'request_created': 'Создание запроса',
        'shared': 'Предоставление доступа',
        'archived': 'Архивирование',
        'deleted': 'Удаление'
      }
      return texts[action] || action
    }

    const clearFilters = () => {
      filters.value = {
        action: null,
        user: null,
        dateFrom: '',
        dateTo: ''
      }
      searchQuery.value = ''
      currentPage.value = 1
    }

    const exportHistory = () => {
      // Логика экспорта истории
      const data = filteredHistory.value.map(item => ({
        'Дата и время': formatDateTime(item.timestamp),
        'Действие': getActionText(item.action),
        'Описание': item.description,
        'Пользователь': item.user,
        'IP адрес': item.ipAddress || '',
        'Комментарий': item.comment || ''
      }))

      // Простой экспорт в CSV (можно заменить на более сложную логику)
      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `budget_history_${props.budget.name}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    return {
      searchQuery,
      currentPage,
      filters,
      historyItems,
      actionFilterOptions,
      userOptions,
      filteredHistory,
      totalPages,
      paginatedHistory,
      formatDateTime,
      formatChangeValue,
      formatCurrency,
      getActionColor,
      getActionIconColor,
      getActionIcon,
      getActionText,
      clearFilters,
      exportHistory
    }
  }
}
</script>

<style scoped>
.budget-history {
  height: 100%;
}

.history-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.v-timeline-item:not(:last-child) .history-item {
  border-bottom: 2px solid #f5f5f5;
}
</style>