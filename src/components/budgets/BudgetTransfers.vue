<template>
  <v-card flat>
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-swap-horizontal" color="primary" class="me-2"/>
        <span class="text-h6">Трансферы и перераспределение бюджетов</span>
      </div>
      <v-chip
        :color="getTransferStatusColor(selectedTransfer?.status)"
        variant="flat"
        size="small"
        v-if="selectedTransfer"
      >
        {{ getTransferStatusText(selectedTransfer.status) }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-0">
      <v-row class="ma-0 h-100">
        <!-- Левая панель: Список трансферов -->
        <v-col cols="4" class="pa-0 border-end">
          <div class="transfer-list-panel h-100">
            <div class="pa-4 border-bottom bg-surface-variant">
              <v-text-field
                v-model="transferSearch"
                prepend-inner-icon="mdi-magnify"
                label="Поиск трансферов"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
              <v-row class="mt-2">
                <v-col cols="6">
                  <v-select
                    v-model="transferStatusFilter"
                    :items="transferStatusOptions"
                    label="Статус"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="6">
                  <v-btn
                    color="primary"
                    variant="flat"
                    size="small"
                    prepend-icon="mdi-plus"
                    @click="createNewTransfer"
                    :disabled="!canCreateTransfer"
                    block
                  >
                    Новый трансфер
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <v-list class="py-0" density="compact">
              <v-list-item
                v-for="transfer in filteredTransfers"
                :key="transfer.transfer_id"
                :active="selectedTransfer?.transfer_id === transfer.transfer_id"
                @click="selectTransfer(transfer)"
                class="border-bottom"
              >
                <template #prepend>
                  <v-avatar
                    size="32"
                    :color="getTransferStatusColor(transfer.status)"
                    class="me-3"
                  >
                    <v-icon color="white" size="16">
                      {{ getTransferStatusIcon(transfer.status) }}
                    </v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-body-2 font-weight-medium">
                  {{ transfer.title }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ formatCurrency(transfer.amount) }} • {{ formatDate(transfer.created_at) }}
                </v-list-item-subtitle>

                <template #append>
                  <v-chip
                    :color="getTransferStatusColor(transfer.status)"
                    size="x-small"
                    variant="flat"
                  >
                    {{ getTransferStatusText(transfer.status) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-col>

        <!-- Правая панель: Детали трансфера -->
        <v-col cols="8" class="pa-0">
          <div class="transfer-details-panel h-100" v-if="selectedTransfer">
            <div class="pa-4 border-bottom bg-surface-variant">
              <v-row align="center">
                <v-col>
                  <h3 class="text-h6 mb-1">{{ selectedTransfer.title }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ selectedTransfer.description }}
                  </p>
                </v-col>
                <v-col cols="auto">
                  <v-btn-group v-if="canManageTransfer(selectedTransfer)">
                    <v-btn
                      color="success"
                      variant="flat"
                      size="small"
                      prepend-icon="mdi-check"
                      @click="approveTransfer"
                      :disabled="selectedTransfer.status !== 'pending'"
                    >
                      Утвердить
                    </v-btn>
                    <v-btn
                      color="error"
                      variant="outlined"
                      size="small"
                      prepend-icon="mdi-close"
                      @click="rejectTransfer"
                      :disabled="selectedTransfer.status !== 'pending'"
                    >
                      Отклонить
                    </v-btn>
                  </v-btn-group>
                </v-col>
              </v-row>
            </div>

            <v-card-text class="pa-4" style="overflow-y: auto;">
              <!-- Общая информация -->
              <v-expansion-panels variant="accordion" class="mb-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon icon="mdi-information" class="me-2"/>
                    Общая информация
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="6">
                        <v-text-field
                          label="ID трансфера"
                          :model-value="selectedTransfer.transfer_id"
                          readonly
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          label="Тип трансфера"
                          :model-value="getTransferTypeText(selectedTransfer.transfer_type)"
                          readonly
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          label="Сумма"
                          :model-value="formatCurrency(selectedTransfer.amount)"
                          readonly
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          label="Валюта"
                          :model-value="selectedTransfer.currency_code"
                          readonly
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          label="Обоснование"
                          :model-value="selectedTransfer.justification"
                          readonly
                          variant="outlined"
                          rows="3"
                        />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <!-- Источник и получатель -->
              <v-expansion-panels variant="accordion" class="mb-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon icon="mdi-swap-horizontal" class="me-2"/>
                    Движение средств
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="6">
                        <v-card variant="outlined" class="pa-3">
                          <v-card-title class="text-body-1 pa-0 mb-2">
                            <v-icon icon="mdi-arrow-up" color="error" class="me-1"/>
                            Источник
                          </v-card-title>
                          <v-text-field
                            label="Бюджет-источник"
                            :model-value="selectedTransfer.source_budget_name"
                            readonly
                            variant="outlined"
                            density="compact"
                            class="mb-2"
                          />
                          <v-text-field
                            label="Статья затрат"
                            :model-value="selectedTransfer.source_line_item"
                            readonly
                            variant="outlined"
                            density="compact"
                          />
                        </v-card>
                      </v-col>
                      <v-col cols="6">
                        <v-card variant="outlined" class="pa-3">
                          <v-card-title class="text-body-1 pa-0 mb-2">
                            <v-icon icon="mdi-arrow-down" color="success" class="me-1"/>
                            Получатель
                          </v-card-title>
                          <v-text-field
                            label="Бюджет-получатель"
                            :model-value="selectedTransfer.target_budget_name"
                            readonly
                            variant="outlined"
                            density="compact"
                            class="mb-2"
                          />
                          <v-text-field
                            label="Статья затрат"
                            :model-value="selectedTransfer.target_line_item"
                            readonly
                            variant="outlined"
                            density="compact"
                          />
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <!-- Временные рамки -->
              <v-expansion-panels variant="accordion" class="mb-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon icon="mdi-calendar" class="me-2"/>
                    Временные рамки
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="6">
                        <v-text-field
                          label="Дата создания"
                          :model-value="formatDateTime(selectedTransfer.created_at)"
                          readonly
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          label="Дата исполнения"
                          :model-value="selectedTransfer.execution_date ? formatDate(selectedTransfer.execution_date) : 'Не назначена'"
                          readonly
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          label="Действует с"
                          :model-value="formatDate(selectedTransfer.effective_from)"
                          readonly
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          label="Действует до"
                          :model-value="selectedTransfer.effective_to ? formatDate(selectedTransfer.effective_to) : 'Без ограничений'"
                          readonly
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <!-- История утверждений -->
              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon icon="mdi-history" class="me-2"/>
                    История утверждений
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-timeline density="compact" class="pt-0">
                      <v-timeline-item
                        v-for="(approval, index) in selectedTransfer.approval_history"
                        :key="index"
                        :dot-color="getApprovalStatusColor(approval.action)"
                        size="small"
                      >
                        <template #icon>
                          <v-icon size="16">{{ getApprovalStatusIcon(approval.action) }}</v-icon>
                        </template>
                        <div class="text-body-2">
                          <div class="font-weight-medium">{{ approval.approver_name }}</div>
                          <div class="text-medium-emphasis">{{ approval.action }} • {{ formatDateTime(approval.timestamp) }}</div>
                          <div v-if="approval.comment" class="mt-1 text-caption">{{ approval.comment }}</div>
                        </div>
                      </v-timeline-item>
                    </v-timeline>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </div>

          <!-- Пустое состояние -->
          <div v-else class="d-flex flex-column align-center justify-center h-100 text-center pa-8">
            <v-icon icon="mdi-swap-horizontal" size="64" color="grey-lighten-2" class="mb-4"/>
            <h3 class="text-h6 text-medium-emphasis mb-2">Выберите трансфер</h3>
            <p class="text-body-2 text-medium-emphasis">
              Выберите трансфер из списка для просмотра деталей
            </p>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Диалог создания нового трансфера -->
    <v-dialog v-model="showCreateDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon icon="mdi-plus" class="me-2"/>
          Создать новый трансфер
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="transferForm" v-model="transferFormValid">
            <v-stepper v-model="createStep" hide-actions flat>
              <v-stepper-header>
                <v-stepper-item title="Основные данные" value="1"/>
                <v-divider/>
                <v-stepper-item title="Источник и получатель" value="2"/>
                <v-divider/>
                <v-stepper-item title="Подтверждение" value="3"/>
              </v-stepper-header>

              <v-stepper-window>
                <!-- Шаг 1: Основные данные -->
                <v-stepper-window-item value="1">
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="newTransfer.title"
                        label="Название трансфера"
                        variant="outlined"
                        :rules="[v => !!v || 'Название обязательно']"
                        required
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="newTransfer.description"
                        label="Описание"
                        variant="outlined"
                        rows="3"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-select
                        v-model="newTransfer.transfer_type"
                        :items="transferTypeOptions"
                        label="Тип трансфера"
                        variant="outlined"
                        :rules="[v => !!v || 'Тип обязателен']"
                        required
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="newTransfer.amount"
                        label="Сумма"
                        variant="outlined"
                        type="number"
                        :rules="[v => !!v || 'Сумма обязательна', v => v > 0 || 'Сумма должна быть больше 0']"
                        required
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="newTransfer.justification"
                        label="Обоснование трансфера"
                        variant="outlined"
                        rows="3"
                        :rules="[v => !!v || 'Обоснование обязательно']"
                        required
                      />
                    </v-col>
                  </v-row>
                </v-stepper-window-item>

                <!-- Шаг 2: Источник и получатель -->
                <v-stepper-window-item value="2">
                  <v-row>
                    <v-col cols="6">
                      <v-card variant="outlined" class="pa-3">
                        <v-card-title class="text-body-1 pa-0 mb-3">Источник средств</v-card-title>
                        <v-select
                          v-model="newTransfer.source_budget_id"
                          :items="availableBudgets"
                          item-title="name"
                          item-value="budget_id"
                          label="Бюджет-источник"
                          variant="outlined"
                          :rules="[v => !!v || 'Источник обязателен']"
                          required
                        />
                        <v-text-field
                          v-model="newTransfer.source_line_item"
                          label="Статья затрат"
                          variant="outlined"
                          :rules="[v => !!v || 'Статья затрат обязательна']"
                          required
                        />
                      </v-card>
                    </v-col>
                    <v-col cols="6">
                      <v-card variant="outlined" class="pa-3">
                        <v=card-title class="text-body-1 pa-0 mb-3">Получатель средств</v-card-title>
                        <v-select
                          v-model="newTransfer.target_budget_id"
                          :items="availableBudgets"
                          item-title="name"
                          item-value="budget_id"
                          label="Бюджет-получатель"
                          variant="outlined"
                          :rules="[v => !!v || 'Получатель обязателен']"
                          required
                        />
                        <v-text-field
                          v-model="newTransfer.target_line_item"
                          label="Статья затрат"
                          variant="outlined"
                          :rules="[v => !!v || 'Статья затрат обязательна']"
                          required
                        />
                      </v-card>
                    </v-col>
                  </v-row>
                </v-stepper-window-item>

                <!-- Шаг 3: Подтверждение -->
                <v-stepper-window-item value="3">
                  <v-card variant="outlined" class="pa-4">
                    <h4 class="text-h6 mb-3">Подтверждение создания трансфера</h4>
                    <v-row>
                      <v-col cols="6">
                        <div class="text-body-2 text-medium-emphasis mb-1">Название:</div>
                        <div class="text-body-1 font-weight-medium">{{ newTransfer.title }}</div>
                      </v-col>
                      <v-col cols="6">
                        <div class="text-body-2 text-medium-emphasis mb-1">Сумма:</div>
                        <div class="text-body-1 font-weight-medium">{{ formatCurrency(newTransfer.amount || 0) }}</div>
                      </v-col>
                      <v-col cols="6">
                        <div class="text-body-2 text-medium-emphasis mb-1">Источник:</div>
                        <div class="text-body-1">{{ getSelectedBudgetName(newTransfer.source_budget_id) }}</div>
                      </v-col>
                      <v-col cols="6">
                        <div class="text-body-2 text-medium-emphasis mb-1">Получатель:</div>
                        <div class="text-body-1">{{ getSelectedBudgetName(newTransfer.target_budget_id) }}</div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-stepper-window-item>
              </v-stepper-window>
            </v-stepper>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn @click="showCreateDialog = false">Отмена</v-btn>
          <v-btn
            v-if="createStep > 1"
            @click="createStep--"
            variant="outlined"
          >
            Назад
          </v-btn>
          <v-btn
            v-if="createStep < 3"
            color="primary"
            @click="createStep++"
            :disabled="!canProceedToNextStep"
          >
            Далее
          </v-btn>
          <v-btn
            v-if="createStep === 3"
            color="primary"
            @click="submitNewTransfer"
            :disabled="!transferFormValid"
          >
            Создать трансфер
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  budgets: {
    type: Array,
    default: () => []
  },
  currentUser: {
    type: Object,
    default: () => ({})
  }
})

// Reactive data
const transferSearch = ref('')
const transferStatusFilter = ref('')
const selectedTransfer = ref(null)
const showCreateDialog = ref(false)
const transferFormValid = ref(false)
const createStep = ref(1)

// Mock data для трансферов
const transfers = ref([
  {
    transfer_id: 'tr_001',
    title: 'Перераспределение медиабюджета',
    description: 'Перенос средств с Google Ads на Яндекс.Директ',
    transfer_type: 'budget_reallocation',
    amount: 50000,
    currency_code: 'RUB',
    status: 'approved',
    source_budget_id: 'budget_004',
    source_budget_name: 'Google Ads кампании',
    source_line_item: 'Медиазакупки',
    target_budget_id: 'budget_005',
    target_budget_name: 'Яндекс.Директ',
    target_line_item: 'Медиазакупки',
    justification: 'Превышение эффективности Яндекс.Директ над Google Ads по CPA',
    effective_from: '2025-10-01',
    effective_to: '2025-12-31',
    execution_date: '2025-09-25',
    created_by: 'user_010',
    created_at: '2025-09-22T10:30:00Z',
    approval_history: [
      {
        approver_name: 'Анна Петрова',
        action: 'created',
        timestamp: '2025-09-22T10:30:00Z',
        comment: 'Создан запрос на перераспределение'
      },
      {
        approver_name: 'Михаил Сидоров',
        action: 'approved',
        timestamp: '2025-09-22T14:15:00Z',
        comment: 'Утверждено по результатам анализа эффективности'
      }
    ]
  },
  {
    transfer_id: 'tr_002',
    title: 'Дополнительное финансирование YouTube',
    description: 'Увеличение бюджета YouTube интеграций за счет экономии на билбордах',
    transfer_type: 'budget_increase',
    amount: 100000,
    currency_code: 'RUB',
    status: 'pending',
    source_budget_id: 'budget_007',
    source_budget_name: 'Наружная реклама',
    source_line_item: 'Аренда площадей',
    target_budget_id: 'budget_003',
    target_budget_name: 'YouTube интеграции',
    target_line_item: 'Оплата блогерам',
    justification: 'Экономия 100к на билбордах из-за скидки поставщика, предлагается направить на YouTube',
    effective_from: '2025-10-01',
    effective_to: null,
    execution_date: null,
    created_by: 'user_005',
    created_at: '2025-09-21T16:20:00Z',
    approval_history: [
      {
        approver_name: 'Дмитрий Иванов',
        action: 'created',
        timestamp: '2025-09-21T16:20:00Z',
        comment: 'Запрос на увеличение бюджета YouTube'
      }
    ]
  },
  {
    transfer_id: 'tr_003',
    title: 'Резерв на непредвиденные расходы',
    description: 'Формирование резерва на случай изменения планов кампании',
    transfer_type: 'reserve_creation',
    amount: 75000,
    currency_code: 'RUB',
    status: 'rejected',
    source_budget_id: 'budget_006',
    source_budget_name: 'Email маркетинг',
    source_line_item: 'Техническая поддержка',
    target_budget_id: 'budget_999',
    target_budget_name: 'Резервный фонд',
    target_line_item: 'Непредвиденные расходы',
    justification: 'Создание резерва для быстрого реагирования на изменения в кампании',
    effective_from: '2025-09-15',
    effective_to: '2025-12-31',
    execution_date: null,
    created_by: 'user_012',
    created_at: '2025-09-20T11:45:00Z',
    approval_history: [
      {
        approver_name: 'Елена Михайлова',
        action: 'created',
        timestamp: '2025-09-20T11:45:00Z',
        comment: 'Запрос на создание резерва'
      },
      {
        approver_name: 'Михаил Сидоров',
        action: 'rejected',
        timestamp: '2025-09-20T15:30:00Z',
        comment: 'Резерв не требуется на данном этапе'
      }
    ]
  }
])

// Новый трансфер
const newTransfer = ref({
  title: '',
  description: '',
  transfer_type: '',
  amount: null,
  source_budget_id: '',
  source_line_item: '',
  target_budget_id: '',
  target_line_item: '',
  justification: ''
})

// Опции для селектов
const transferStatusOptions = [
  { title: 'На рассмотрении', value: 'pending' },
  { title: 'Утвержден', value: 'approved' },
  { title: 'Отклонен', value: 'rejected' },
  { title: 'Исполнен', value: 'executed' }
]

const transferTypeOptions = [
  { title: 'Перераспределение бюджета', value: 'budget_reallocation' },
  { title: 'Увеличение бюджета', value: 'budget_increase' },
  { title: 'Создание резерва', value: 'reserve_creation' },
  { title: 'Корректировка планов', value: 'plan_adjustment' }
]

// Computed properties
const filteredTransfers = computed(() => {
  let filtered = transfers.value

  if (transferSearch.value) {
    const search = transferSearch.value.toLowerCase()
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(search) ||
      t.description.toLowerCase().includes(search)
    )
  }

  if (transferStatusFilter.value) {
    filtered = filtered.filter(t => t.status === transferStatusFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const availableBudgets = computed(() => {
  return props.budgets.filter(b => b.budget_type !== 'folder')
})

const canCreateTransfer = computed(() => {
  return ['Owner', 'Administrator', 'Editor'].includes(props.currentUser.role)
})

const canProceedToNextStep = computed(() => {
  if (createStep.value === 1) {
    return newTransfer.value.title && newTransfer.value.transfer_type &&
           newTransfer.value.amount && newTransfer.value.justification
  }
  if (createStep.value === 2) {
    return newTransfer.value.source_budget_id && newTransfer.value.target_budget_id &&
           newTransfer.value.source_line_item && newTransfer.value.target_line_item
  }
  return true
})

// Methods
const selectTransfer = (transfer) => {
  selectedTransfer.value = transfer
}

const canManageTransfer = (transfer) => {
  return ['Owner', 'Administrator'].includes(props.currentUser.role) &&
         transfer.status === 'pending'
}

const createNewTransfer = () => {
  showCreateDialog.value = true
  createStep.value = 1
  newTransfer.value = {
    title: '',
    description: '',
    transfer_type: '',
    amount: null,
    source_budget_id: '',
    source_line_item: '',
    target_budget_id: '',
    target_line_item: '',
    justification: ''
  }
}

const submitNewTransfer = () => {
  const transfer = {
    transfer_id: `tr_${String(transfers.value.length + 1).padStart(3, '0')}`,
    ...newTransfer.value,
    currency_code: 'RUB',
    status: 'pending',
    source_budget_name: getSelectedBudgetName(newTransfer.value.source_budget_id),
    target_budget_name: getSelectedBudgetName(newTransfer.value.target_budget_id),
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: null,
    execution_date: null,
    created_by: props.currentUser.user_id,
    created_at: new Date().toISOString(),
    approval_history: [
      {
        approver_name: props.currentUser.name,
        action: 'created',
        timestamp: new Date().toISOString(),
        comment: 'Создан новый трансфер'
      }
    ]
  }

  transfers.value.unshift(transfer)
  selectedTransfer.value = transfer
  showCreateDialog.value = false
}

const approveTransfer = () => {
  if (selectedTransfer.value) {
    selectedTransfer.value.status = 'approved'
    selectedTransfer.value.execution_date = new Date().toISOString().split('T')[0]
    selectedTransfer.value.approval_history.push({
      approver_name: props.currentUser.name,
      action: 'approved',
      timestamp: new Date().toISOString(),
      comment: 'Трансфер утвержден'
    })
  }
}

const rejectTransfer = () => {
  if (selectedTransfer.value) {
    selectedTransfer.value.status = 'rejected'
    selectedTransfer.value.approval_history.push({
      approver_name: props.currentUser.name,
      action: 'rejected',
      timestamp: new Date().toISOString(),
      comment: 'Трансфер отклонен'
    })
  }
}

const getSelectedBudgetName = (budgetId) => {
  const budget = availableBudgets.value.find(b => b.budget_id === budgetId)
  return budget ? budget.name : ''
}

// Utility methods
const getTransferStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    executed: 'info'
  }
  return colors[status] || 'grey'
}

const getTransferStatusText = (status) => {
  const texts = {
    pending: 'На рассмотрении',
    approved: 'Утвержден',
    rejected: 'Отклонен',
    executed: 'Исполнен'
  }
  return texts[status] || status
}

const getTransferStatusIcon = (status) => {
  const icons = {
    pending: 'mdi-clock',
    approved: 'mdi-check',
    rejected: 'mdi-close',
    executed: 'mdi-check-all'
  }
  return icons[status] || 'mdi-help'
}

const getTransferTypeText = (type) => {
  const types = {
    budget_reallocation: 'Перераспределение бюджета',
    budget_increase: 'Увеличение бюджета',
    reserve_creation: 'Создание резерва',
    plan_adjustment: 'Корректировка планов'
  }
  return types[type] || type
}

const getApprovalStatusColor = (action) => {
  const colors = {
    created: 'info',
    approved: 'success',
    rejected: 'error',
    executed: 'success'
  }
  return colors[action] || 'grey'
}

const getApprovalStatusIcon = (action) => {
  const icons = {
    created: 'mdi-plus',
    approved: 'mdi-check',
    rejected: 'mdi-close',
    executed: 'mdi-check-all'
  }
  return icons[action] || 'mdi-help'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU')
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('ru-RU')
}

onMounted(() => {
  // Выбираем первый трансфер по умолчанию
  if (transfers.value.length > 0) {
    selectedTransfer.value = transfers.value[0]
  }
})
</script>

<style scoped>
.transfer-list-panel {
  border-right: 1px solid rgb(var(--v-border-color));
}

.transfer-details-panel {
  overflow: hidden;
}

.h-100 {
  height: 100vh;
  max-height: 80vh;
}
</style>