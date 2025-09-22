<template>
  <div class="budget-overview">
    <!-- Основная информация о бюджете -->
    <v-card class="mb-4" elevation="1">
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon class="me-2">mdi-information</v-icon>
        Основная информация
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="info-field mb-3">
              <div class="text-caption text-medium-emphasis">Название бюджета</div>
              <div class="text-subtitle-1 font-weight-medium">{{ budget.name }}</div>
            </div>

            <div class="info-field mb-3">
              <div class="text-caption text-medium-emphasis">Описание</div>
              <div class="text-body-2">{{ budget.description || 'Не указано' }}</div>
            </div>

            <div class="info-field mb-3">
              <div class="text-caption text-medium-emphasis">Категория</div>
              <v-chip
                :color="getCategoryColor(budget.category)"
                size="small"
                variant="tonal"
              >
                {{ budget.category }}
              </v-chip>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="info-field mb-3">
              <div class="text-caption text-medium-emphasis">Статус</div>
              <v-chip
                :color="getStatusColor(budget.status)"
                size="small"
                variant="tonal"
              >
                {{ getStatusText(budget.status) }}
              </v-chip>
            </div>

            <div class="info-field mb-3">
              <div class="text-caption text-medium-emphasis">Владелец</div>
              <div class="d-flex align-center">
                <v-avatar size="24" class="me-2">
                  <v-icon size="16">mdi-account</v-icon>
                </v-avatar>
                <span class="text-body-2">{{ budget.owner }}</span>
              </div>
            </div>

            <div class="info-field mb-3">
              <div class="text-caption text-medium-emphasis">Отдел</div>
              <div class="text-body-2">{{ budget.department || 'Не указан' }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Финансовая сводка -->
    <v-card class="mb-4" elevation="1">
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon class="me-2">mdi-wallet</v-icon>
        Финансовая сводка
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <div class="text-center">
              <div class="text-caption text-medium-emphasis">Плановый бюджет</div>
              <div class="text-h6 font-weight-bold text-primary">
                {{ formatCurrency(budget.plannedAmount) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="text-center">
              <div class="text-caption text-medium-emphasis">Потрачено</div>
              <div class="text-h6 font-weight-bold text-warning">
                {{ formatCurrency(budget.spentAmount) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="text-center">
              <div class="text-caption text-medium-emphasis">Остаток</div>
              <div class="text-h6 font-weight-bold" :class="getRemainingColor(budget.remainingAmount)">
                {{ formatCurrency(budget.remainingAmount) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="text-center">
              <div class="text-caption text-medium-emphasis">Использовано</div>
              <div class="text-h6 font-weight-bold">
                {{ getUsagePercentage(budget.spentAmount, budget.plannedAmount) }}%
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Прогресс-бар -->
        <v-progress-linear
          :model-value="getUsagePercentage(budget.spentAmount, budget.plannedAmount)"
          :color="getProgressColor(getUsagePercentage(budget.spentAmount, budget.plannedAmount))"
          height="8"
          rounded
          class="mt-4"
        />
      </v-card-text>
    </v-card>

    <!-- Временные рамки -->
    <v-card class="mb-4" elevation="1">
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon class="me-2">mdi-calendar</v-icon>
        Временные рамки
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <div class="info-field">
              <div class="text-caption text-medium-emphasis">Дата начала</div>
              <div class="text-body-1">{{ formatDate(budget.startDate) }}</div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="info-field">
              <div class="text-caption text-medium-emphasis">Дата окончания</div>
              <div class="text-body-1">{{ formatDate(budget.endDate) }}</div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="info-field">
              <div class="text-caption text-medium-emphasis">Продолжительность</div>
              <div class="text-body-1">{{ getDuration(budget.startDate, budget.endDate) }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Дополнительная информация -->
    <v-card elevation="1">
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon class="me-2">mdi-text-box-outline</v-icon>
        Дополнительная информация
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="info-field mb-3">
              <div class="text-caption text-medium-emphasis">Дата создания</div>
              <div class="text-body-2">{{ formatDateTime(budget.createdAt) }}</div>
            </div>

            <div class="info-field mb-3">
              <div class="text-caption text-medium-emphasis">Создал</div>
              <div class="text-body-2">{{ budget.createdBy || 'Система' }}</div>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="info-field mb-3">
              <div class="text-caption text-medium-emphasis">Последнее изменение</div>
              <div class="text-body-2">{{ formatDateTime(budget.updatedAt) }}</div>
            </div>

            <div class="info-field mb-3">
              <div class="text-caption text-medium-emphasis">Изменил</div>
              <div class="text-body-2">{{ budget.updatedBy || 'Система' }}</div>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-3" />

        <div class="info-field">
          <div class="text-caption text-medium-emphasis mb-2">Теги</div>
          <div v-if="budget.tags && budget.tags.length > 0">
            <v-chip
              v-for="tag in budget.tags"
              :key="tag"
              size="small"
              variant="outlined"
              class="me-2 mb-1"
            >
              {{ tag }}
            </v-chip>
          </div>
          <div v-else class="text-body-2 text-medium-emphasis">
            Теги не установлены
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'BudgetPanelOverview',
  props: {
    budget: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatCurrency(amount) {
      if (!amount && amount !== 0) return '0 ₽'
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    },

    formatDate(date) {
      if (!date) return 'Не указана'
      return new Date(date).toLocaleDateString('ru-RU')
    },

    formatDateTime(date) {
      if (!date) return 'Не указана'
      return new Date(date).toLocaleString('ru-RU')
    },

    getDuration(startDate, endDate) {
      if (!startDate || !endDate) return 'Не определена'

      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 30) {
        return `${diffDays} дн.`
      } else if (diffDays < 365) {
        const months = Math.round(diffDays / 30)
        return `${months} мес.`
      } else {
        const years = Math.round(diffDays / 365)
        return `${years} г.`
      }
    },

    getUsagePercentage(spent, planned) {
      if (!planned || planned === 0) return 0
      return Math.round((spent / planned) * 100)
    },

    getStatusColor(status) {
      const colors = {
        'draft': 'grey',
        'active': 'success',
        'on-hold': 'warning',
        'completed': 'info',
        'cancelled': 'error'
      }
      return colors[status] || 'grey'
    },

    getStatusText(status) {
      const texts = {
        'draft': 'Черновик',
        'active': 'Активный',
        'on-hold': 'Приостановлен',
        'completed': 'Завершен',
        'cancelled': 'Отменен'
      }
      return texts[status] || status
    },

    getCategoryColor(category) {
      const colors = {
        'Marketing': 'blue',
        'Sales': 'green',
        'Product': 'purple',
        'Support': 'orange',
        'Operations': 'teal'
      }
      return colors[category] || 'grey'
    },

    getRemainingColor(amount) {
      if (amount > 0) return 'text-success'
      if (amount < 0) return 'text-error'
      return 'text-medium-emphasis'
    },

    getProgressColor(percentage) {
      if (percentage < 50) return 'success'
      if (percentage < 80) return 'warning'
      return 'error'
    }
  }
}
</script>

<style scoped>
.budget-overview {
  height: 100%;
}

.info-field {
  min-height: 40px;
}

.v-progress-linear {
  border-radius: 8px;
}
</style>