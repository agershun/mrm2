<template>
  <div class="budget-requests">
    <!-- Заголовок с действиями -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">Запросы на изменение бюджета</h3>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showRequestDialog = true"
      >
        Создать запрос
      </v-btn>
    </div>

    <!-- Фильтры -->
    <v-card class="mb-4" elevation="1">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              label="Статус"
              :items="statusFilterOptions"
              clearable
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.type"
              label="Тип запроса"
              :items="typeFilterOptions"
              clearable
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.requester"
              label="Инициатор"
              :items="requesterOptions"
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

    <!-- Статистика запросов -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Всего запросов</div>
          <div class="text-h6 font-weight-bold">
            {{ requests.length }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">В ожидании</div>
          <div class="text-h6 font-weight-bold text-warning">
            {{ getRequestCountByStatus('pending') }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Одобрено</div>
          <div class="text-h6 font-weight-bold text-success">
            {{ getRequestCountByStatus('approved') }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Отклонено</div>
          <div class="text-h6 font-weight-bold text-error">
            {{ getRequestCountByStatus('rejected') }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Таблица запросов -->
    <v-card elevation="1">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-clipboard-list</v-icon>
        Список запросов
      </v-card-title>

      <v-data-table
        :headers="requestHeaders"
        :items="filteredRequests"
        :loading="loading"
        item-key="id"
        class="elevation-0"
      >
        <template v-slot:item.type="{ item }">
          <v-chip
            :color="getTypeColor(item.type)"
            size="small"
            variant="tonal"
          >
            {{ getTypeText(item.type) }}
          </v-chip>
        </template>

        <template v-slot:item.requestedAmount="{ item }">
          <div class="d-flex align-center">
            <span class="font-weight-medium me-2">
              {{ formatCurrency(item.requestedAmount) }}
            </span>
            <v-icon
              v-if="item.requestedAmount > 0"
              size="small"
              color="success"
            >
              mdi-arrow-up
            </v-icon>
            <v-icon
              v-else-if="item.requestedAmount < 0"
              size="small"
              color="error"
            >
              mdi-arrow-down
            </v-icon>
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template v-slot:item.priority="{ item }">
          <v-chip
            :color="getPriorityColor(item.priority)"
            size="small"
            variant="outlined"
          >
            {{ getPriorityText(item.priority) }}
          </v-chip>
        </template>

        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            size="small"
            variant="text"
            @click="viewRequest(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            v-if="item.status === 'pending'"
            icon
            size="small"
            variant="text"
            @click="editRequest(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            v-if="canApprove(item)"
            icon
            size="small"
            variant="text"
            color="success"
            @click="approveRequest(item)"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn
            v-if="canReject(item)"
            icon
            size="small"
            variant="text"
            color="error"
            @click="rejectRequest(item)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>

        <template v-slot:no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-2">
              mdi-clipboard-list-outline
            </v-icon>
            <p class="text-body-1 mt-4 text-medium-emphasis">
              Запросы не найдены
            </p>
            <v-btn
              color="primary"
              @click="showRequestDialog = true"
            >
              Создать запрос
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания/редактирования запроса -->
    <v-dialog
      v-model="showRequestDialog"
      max-width="700"
      persistent
    >
      <v-card>
        <v-card-title>
          {{ editingRequest ? 'Редактировать' : 'Создать' }} запрос
        </v-card-title>

        <v-card-text>
          <v-form ref="requestForm" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="requestForm.title"
                  label="Название запроса"
                  :rules="titleRules"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="requestForm.type"
                  label="Тип запроса"
                  :items="typeOptions"
                  :rules="typeRules"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="requestForm.priority"
                  label="Приоритет"
                  :items="priorityOptions"
                  :rules="priorityRules"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="requestForm.requestedAmount"
                  label="Запрашиваемая сумма"
                  type="number"
                  prefix="₽"
                  :rules="amountRules"
                  hint="Положительная сумма для увеличения, отрицательная для уменьшения"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="requestForm.dueDate"
                  label="Срок рассмотрения"
                  type="date"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="requestForm.description"
                  label="Обоснование запроса"
                  rows="4"
                  :rules="descriptionRules"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="requestForm.businessJustification"
                  label="Бизнес-обоснование"
                  rows="3"
                  hint="Укажите как это повлияет на бизнес-результаты"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeRequestDialog">
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            @click="saveRequest"
          >
            {{ editingRequest ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог просмотра запроса -->
    <v-dialog
      v-model="showViewDialog"
      max-width="600"
    >
      <v-card v-if="viewingRequest">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2">mdi-eye</v-icon>
          {{ viewingRequest.title }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Тип запроса</div>
              <div class="text-body-1">{{ getTypeText(viewingRequest.type) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Приоритет</div>
              <div class="text-body-1">{{ getPriorityText(viewingRequest.priority) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Сумма</div>
              <div class="text-h6 font-weight-bold">{{ formatCurrency(viewingRequest.requestedAmount) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Статус</div>
              <div class="text-body-1">{{ getStatusText(viewingRequest.status) }}</div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-2">Обоснование</div>
            <div class="text-body-2">{{ viewingRequest.description }}</div>
          </div>

          <div v-if="viewingRequest.businessJustification" class="mb-4">
            <div class="text-caption text-medium-emphasis mb-2">Бизнес-обоснование</div>
            <div class="text-body-2">{{ viewingRequest.businessJustification }}</div>
          </div>

          <div v-if="viewingRequest.reviewComment">
            <div class="text-caption text-medium-emphasis mb-2">Комментарий рецензента</div>
            <div class="text-body-2">{{ viewingRequest.reviewComment }}</div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="showViewDialog = false">
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'BudgetPanelRequests',
  props: {
    budget: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const loading = ref(false)
    const showRequestDialog = ref(false)
    const showViewDialog = ref(false)
    const editingRequest = ref(null)
    const viewingRequest = ref(null)
    const formValid = ref(false)

    const filters = ref({
      status: null,
      type: null,
      requester: null
    })

    const requestForm = ref({
      title: '',
      type: '',
      priority: 'medium',
      requestedAmount: 0,
      dueDate: '',
      description: '',
      businessJustification: ''
    })

    const requests = ref([
      {
        id: 1,
        title: 'Увеличение бюджета на рекламу',
        type: 'increase',
        priority: 'high',
        requestedAmount: 200000,
        description: 'Необходимо увеличить бюджет для запуска новой рекламной кампании',
        businessJustification: 'Ожидаемый ROI 150%',
        requester: 'Иванов И.И.',
        status: 'pending',
        createdAt: '2024-01-20',
        dueDate: '2024-01-30'
      },
      {
        id: 2,
        title: 'Перераспределение средств',
        type: 'reallocation',
        priority: 'medium',
        requestedAmount: 0,
        description: 'Перенести 100,000 ₽ с контента на события',
        requester: 'Петрова П.П.',
        status: 'approved',
        createdAt: '2024-01-18',
        reviewComment: 'Одобрено после обсуждения с командой'
      },
      {
        id: 3,
        title: 'Сокращение бюджета',
        type: 'decrease',
        priority: 'low',
        requestedAmount: -50000,
        description: 'Сократить расходы на инструменты',
        requester: 'Сидоров С.С.',
        status: 'rejected',
        createdAt: '2024-01-15',
        reviewComment: 'Инструменты критически важны для работы'
      }
    ])

    const requestHeaders = [
      { title: 'Название', key: 'title', sortable: true },
      { title: 'Тип', key: 'type', sortable: true },
      { title: 'Сумма', key: 'requestedAmount', sortable: true },
      { title: 'Приоритет', key: 'priority', sortable: true },
      { title: 'Инициатор', key: 'requester', sortable: true },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Дата создания', key: 'createdAt', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false, width: '150' }
    ]

    const statusFilterOptions = [
      { title: 'В ожидании', value: 'pending' },
      { title: 'Одобрено', value: 'approved' },
      { title: 'Отклонено', value: 'rejected' },
      { title: 'В процессе', value: 'in_review' }
    ]

    const typeFilterOptions = [
      { title: 'Увеличение', value: 'increase' },
      { title: 'Уменьшение', value: 'decrease' },
      { title: 'Перераспределение', value: 'reallocation' },
      { title: 'Новый бюджет', value: 'new_budget' }
    ]

    const typeOptions = [
      { title: 'Увеличение бюджета', value: 'increase' },
      { title: 'Уменьшение бюджета', value: 'decrease' },
      { title: 'Перераспределение средств', value: 'reallocation' },
      { title: 'Создание нового бюджета', value: 'new_budget' }
    ]

    const priorityOptions = [
      { title: 'Низкий', value: 'low' },
      { title: 'Средний', value: 'medium' },
      { title: 'Высокий', value: 'high' },
      { title: 'Критический', value: 'critical' }
    ]

    const requesterOptions = [
      'Иванов И.И.',
      'Петрова П.П.',
      'Сидоров С.С.',
      'Козлова К.К.'
    ]

    const titleRules = [
      v => !!v || 'Название обязательно',
      v => v.length >= 5 || 'Минимум 5 символов'
    ]

    const typeRules = [
      v => !!v || 'Тип запроса обязателен'
    ]

    const priorityRules = [
      v => !!v || 'Приоритет обязателен'
    ]

    const amountRules = [
      v => v !== null && v !== '' || 'Сумма обязательна'
    ]

    const descriptionRules = [
      v => !!v || 'Обоснование обязательно',
      v => v.length >= 10 || 'Минимум 10 символов'
    ]

    const filteredRequests = computed(() => {
      let filtered = requests.value

      if (filters.value.status) {
        filtered = filtered.filter(r => r.status === filters.value.status)
      }

      if (filters.value.type) {
        filtered = filtered.filter(r => r.type === filters.value.type)
      }

      if (filters.value.requester) {
        filtered = filtered.filter(r => r.requester === filters.value.requester)
      }

      return filtered
    })

    const formatCurrency = (amount) => {
      if (!amount && amount !== 0) return '0 ₽'
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    const formatDate = (date) => {
      if (!date) return 'Не указана'
      return new Date(date).toLocaleDateString('ru-RU')
    }

    const getRequestCountByStatus = (status) => {
      return requests.value.filter(r => r.status === status).length
    }

    const getStatusColor = (status) => {
      const colors = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'error',
        'in_review': 'info'
      }
      return colors[status] || 'grey'
    }

    const getStatusText = (status) => {
      const texts = {
        'pending': 'В ожидании',
        'approved': 'Одобрено',
        'rejected': 'Отклонено',
        'in_review': 'В процессе'
      }
      return texts[status] || status
    }

    const getTypeColor = (type) => {
      const colors = {
        'increase': 'success',
        'decrease': 'error',
        'reallocation': 'info',
        'new_budget': 'primary'
      }
      return colors[type] || 'grey'
    }

    const getTypeText = (type) => {
      const texts = {
        'increase': 'Увеличение',
        'decrease': 'Уменьшение',
        'reallocation': 'Перераспределение',
        'new_budget': 'Новый бюджет'
      }
      return texts[type] || type
    }

    const getPriorityColor = (priority) => {
      const colors = {
        'low': 'success',
        'medium': 'warning',
        'high': 'error',
        'critical': 'purple'
      }
      return colors[priority] || 'grey'
    }

    const getPriorityText = (priority) => {
      const texts = {
        'low': 'Низкий',
        'medium': 'Средний',
        'high': 'Высокий',
        'critical': 'Критический'
      }
      return texts[priority] || priority
    }

    const canApprove = (request) => {
      return request.status === 'pending'
    }

    const canReject = (request) => {
      return request.status === 'pending'
    }

    const viewRequest = (request) => {
      viewingRequest.value = request
      showViewDialog.value = true
    }

    const editRequest = (request) => {
      editingRequest.value = request
      requestForm.value = { ...request }
      showRequestDialog.value = true
    }

    const approveRequest = (request) => {
      const index = requests.value.findIndex(r => r.id === request.id)
      if (index > -1) {
        requests.value[index].status = 'approved'
      }
    }

    const rejectRequest = (request) => {
      const index = requests.value.findIndex(r => r.id === request.id)
      if (index > -1) {
        requests.value[index].status = 'rejected'
      }
    }

    const saveRequest = () => {
      if (editingRequest.value) {
        const index = requests.value.findIndex(r => r.id === editingRequest.value.id)
        if (index > -1) {
          requests.value[index] = { ...requestForm.value, id: editingRequest.value.id }
        }
      } else {
        const newRequest = {
          ...requestForm.value,
          id: Date.now(),
          requester: 'Текущий пользователь',
          status: 'pending',
          createdAt: new Date().toISOString().split('T')[0]
        }
        requests.value.push(newRequest)
      }
      closeRequestDialog()
    }

    const closeRequestDialog = () => {
      showRequestDialog.value = false
      editingRequest.value = null
      requestForm.value = {
        title: '',
        type: '',
        priority: 'medium',
        requestedAmount: 0,
        dueDate: '',
        description: '',
        businessJustification: ''
      }
    }

    const clearFilters = () => {
      filters.value = {
        status: null,
        type: null,
        requester: null
      }
    }

    return {
      loading,
      showRequestDialog,
      showViewDialog,
      editingRequest,
      viewingRequest,
      formValid,
      filters,
      requestForm,
      requests,
      requestHeaders,
      statusFilterOptions,
      typeFilterOptions,
      typeOptions,
      priorityOptions,
      requesterOptions,
      titleRules,
      typeRules,
      priorityRules,
      amountRules,
      descriptionRules,
      filteredRequests,
      formatCurrency,
      formatDate,
      getRequestCountByStatus,
      getStatusColor,
      getStatusText,
      getTypeColor,
      getTypeText,
      getPriorityColor,
      getPriorityText,
      canApprove,
      canReject,
      viewRequest,
      editRequest,
      approveRequest,
      rejectRequest,
      saveRequest,
      closeRequestDialog,
      clearFilters
    }
  }
}
</script>

<style scoped>
.budget-requests {
  height: 100%;
}
</style>