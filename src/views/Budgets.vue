<template>
  <div class="budgets-view">
    <!-- Заголовок страницы -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Бюджеты</h1>
        <p class="text-body-1 text-medium-emphasis">
          Управление иерархией бюджетов и запросами на финансирование
        </p>
      </div>
      <v-spacer />

      <!-- Переключатель представлений -->
      <v-btn-toggle v-model="currentView" mandatory variant="outlined" class="me-4">
        <v-btn value="hierarchy" size="small">
          <v-icon>mdi-file-tree</v-icon>
          Иерархия
        </v-btn>
        <v-btn value="rollup" size="small">
          <v-icon>mdi-chart-box</v-icon>
          Сводка
        </v-btn>
        <v-btn value="requests" size="small">
          <v-icon>mdi-clipboard-list</v-icon>
          Запросы
        </v-btn>
      </v-btn-toggle>

      <!-- Фильтр по году -->
      <v-select
        v-model="selectedYear"
        :items="fiscalYears"
        label="Финансовый год"
        variant="outlined"
        density="compact"
        style="width: 150px"
        class="me-4"
        @update:modelValue="onYearChange"
      />

      <!-- Действия -->
      <v-btn
        color="primary"
        @click="refreshData"
        :loading="isLoading"
      >
        <v-icon>mdi-refresh</v-icon>
        Обновить
      </v-btn>
    </div>

    <!-- Статистика -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="primary" size="40" class="me-4">
                mdi-wallet
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Общий бюджет</p>
                <h3 class="text-h6">{{ formatCurrency(totalBudgetAmount) }}</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="success" size="40" class="me-4">
                mdi-check-circle
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Распределено</p>
                <h3 class="text-h6">{{ formatCurrency(allocatedAmount) }}</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="warning" size="40" class="me-4">
                mdi-clock-outline
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Остаток</p>
                <h3 class="text-h6">{{ formatCurrency(remainingAmount) }}</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="info" size="40" class="me-4">
                mdi-clipboard-list
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Запросы</p>
                <h3 class="text-h6">{{ pendingRequests.length }}</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Основной контент -->
    <v-row>
      <!-- Левая панель -->
      <v-col cols="12" :lg="selectedItem ? 6 : 12">
        <v-card class="h-100">
          <!-- Представление иерархии -->
          <template v-if="currentView === 'hierarchy'">
            <!-- Action Bar -->
            <BudgetActionBar
              @new-item="handleNewItem"
              @delete-items="handleDeleteItems"
              @copy-items="handleCopyItems"
              @move-items="handleMoveItems"
              @import-data="handleImportData"
            />

            <v-divider />

            <!-- Иерархическая таблица -->
            <v-card-text class="pa-0" style="height: calc(100vh - 450px);">
              <BudgetHierarchyTable
                @open-user-management="handleUserManagement"
                @open-po-mapping="handlePOMapping"
                @open-actuals-mapping="handleActualsMapping"
                @open-approvals="handleApprovals"
                @open-transfers="handleTransfers"
                @open-settings="handleSettings"
                @open-notes="handleNotes"
                @open-audit-trail="handleAuditTrail"
                @row-selected="handleRowSelected"
              />
            </v-card-text>
          </template>

          <!-- Представление сводки -->
          <template v-if="currentView === 'rollup'">
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-chart-box</v-icon>
              Сводка по бюджетам

              <v-spacer />

              <v-btn-toggle v-model="rollupView" variant="outlined" size="small">
                <v-btn value="table">
                  <v-icon>mdi-table</v-icon>
                  Таблица
                </v-btn>
                <v-btn value="chart">
                  <v-icon>mdi-chart-donut</v-icon>
                  График
                </v-btn>
              </v-btn-toggle>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0" v-if="rollupView === 'table'">
              <v-data-table
                :headers="rollupHeaders"
                :items="budgetRollupData"
                :loading="isLoading"
                item-key="budget_id"
                class="elevation-0"
                @click:row="selectBudgetFromRollup"
              >
                <template v-slot:item.name="{ item }">
                  <div class="d-flex align-center">
                    <v-icon
                      :icon="getBudgetTypeIcon(item.budget_type)"
                      :color="getBudgetStatusColor(item.status)"
                      class="me-2"
                    />
                    <div>
                      <div class="font-weight-medium">{{ item.name }}</div>
                      <div class="text-caption text-medium-emphasis">{{ item.budget_type }}</div>
                    </div>
                  </div>
                </template>

                <template v-slot:item.total_amount="{ item }">
                  <span class="font-weight-bold">{{ formatCurrency(item.total_amount) }}</span>
                </template>

                <template v-slot:item.allocated_amount="{ item }">
                  <span class="text-success">{{ formatCurrency(item.allocated_amount) }}</span>
                </template>

                <template v-slot:item.spent_amount="{ item }">
                  <span class="text-warning">{{ formatCurrency(item.spent_amount) }}</span>
                </template>

                <template v-slot:item.remaining_amount="{ item }">
                  <span :class="item.remaining_amount < 0 ? 'text-error' : 'text-info'">
                    {{ formatCurrency(item.remaining_amount) }}
                  </span>
                </template>

                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="getBudgetStatusColor(item.status)"
                    size="small"
                    variant="tonal"
                  >
                    {{ getBudgetStatusText(item.status) }}
                  </v-chip>
                </template>

                <template v-slot:item.utilization="{ item }">
                  <div class="d-flex align-center">
                    <v-progress-linear
                      :model-value="getBudgetUtilization(item)"
                      :color="getUtilizationColor(getBudgetUtilization(item))"
                      height="6"
                      style="width: 80px;"
                      class="me-2"
                    />
                    <span class="text-caption">{{ getBudgetUtilization(item) }}%</span>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>

            <v-card-text v-else>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1">mdi-chart-donut</v-icon>
                <p class="text-body-1 mt-4">Графическое представление будет реализовано позже</p>
              </div>
            </v-card-text>
          </template>

          <!-- Представление запросов -->
          <template v-if="currentView === 'requests'">
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-clipboard-list</v-icon>
              Запросы на бюджет

              <v-spacer />

              <!-- Фильтр по статусу -->
              <v-select
                v-model="requestStatusFilter"
                :items="requestStatusOptions"
                label="Статус"
                variant="outlined"
                density="compact"
                style="width: 150px"
                class="me-4"
                clearable
                @update:modelValue="onRequestStatusFilter"
              />

              <v-btn
                color="primary"
                @click="showCreateRequestDialog"
              >
                <v-icon>mdi-plus</v-icon>
                Новый запрос
              </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0">
              <v-data-table
                :headers="requestHeaders"
                :items="filteredBudgetRequests"
                :loading="isLoading"
                item-key="request_id"
                class="elevation-0"
                @click:row="selectBudgetRequest"
              >
                <template v-slot:item.requested_amount="{ item }">
                  <span class="font-weight-bold">{{ formatCurrency(item.requested_amount) }}</span>
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

                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="getRequestStatusColor(item.status)"
                    size="small"
                    variant="tonal"
                  >
                    {{ getRequestStatusText(item.status) }}
                  </v-chip>
                </template>

                <template v-slot:item.requested_date="{ item }">
                  {{ formatDate(item.requested_date) }}
                </template>

                <template v-slot:item.expected_roi="{ item }">
                  <span class="text-success">{{ item.expected_roi }}%</span>
                </template>

                <template v-slot:item.actions="{ item }">
                  <div class="d-flex align-center">
                    <v-btn
                      v-if="item.status === 'pending'"
                      icon="mdi-check"
                      size="small"
                      color="success"
                      variant="text"
                      @click.stop="approveBudgetRequest(item.request_id)"
                    />
                    <v-btn
                      v-if="item.status === 'pending'"
                      icon="mdi-close"
                      size="small"
                      color="error"
                      variant="text"
                      @click.stop="rejectBudgetRequest(item.request_id)"
                    />
                    <v-btn
                      icon="mdi-information"
                      size="small"
                      variant="text"
                      @click.stop="viewRequestDetails(item)"
                    />
                  </div>
                </template>

                <template v-slot:no-data>
                  <div class="text-center pa-8">
                    <v-icon size="64" color="grey-lighten-2">mdi-clipboard-list</v-icon>
                    <p class="text-body-1 mt-4 text-medium-emphasis">
                      Нет запросов на бюджет
                    </p>
                    <v-btn
                      color="primary"
                      @click="showCreateRequestDialog"
                    >
                      Создать первый запрос
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </template>
        </v-card>
      </v-col>

      <!-- Правая панель с деталями -->
      <v-col v-if="selectedItem" cols="12" lg="6">
        <v-card class="h-100">
          <!-- Детали бюджета -->
          <template v-if="selectedItem.type === 'budget'">
            <BudgetDetailsPanel
              :selected-budget="selectedItem"
              @close="selectedItem = null"
              @manage-users="handleUserManagement"
              @edit-budget="handleEditBudget"
              @copy-budget="handleCopyItems"
              @transfers="handleTransfers"
              @approvals="handleApprovals"
              @notes="handleNotes"
              @audit-trail="handleAuditTrail"
            />
          </template>

          <!-- Детали запроса -->
          <template v-if="selectedItem.type === 'request'">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="me-2">mdi-clipboard-list</v-icon>
                Детали запроса
              </div>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="selectedItem = null"
              />
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <!-- Основная информация -->
              <div class="mb-4">
                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="text-h6">Запрос #{{ selectedItem.request_id }}</h3>
                  <v-chip
                    :color="getRequestStatusColor(selectedItem.status)"
                    variant="tonal"
                  >
                    {{ getRequestStatusText(selectedItem.status) }}
                  </v-chip>
                </div>

                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis">Обоснование</div>
                  <p class="text-body-2">{{ selectedItem.justification }}</p>
                </div>

                <v-row dense class="mb-3">
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Приоритет</div>
                    <v-chip
                      :color="getPriorityColor(selectedItem.priority)"
                      size="small"
                      variant="outlined"
                    >
                      {{ getPriorityText(selectedItem.priority) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Отдел</div>
                    <div class="font-weight-medium">{{ selectedItem.department }}</div>
                  </v-col>
                </v-row>

                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis">Бизнес-кейс</div>
                  <p class="text-body-2">{{ selectedItem.business_case }}</p>
                </div>
              </div>

              <v-divider class="mb-4" />

              <!-- Финансовая информация -->
              <div class="mb-4">
                <h4 class="text-subtitle-1 mb-3">Финансовая информация</h4>

                <v-row dense class="mb-3">
                  <v-col cols="6">
                    <div class="text-center pa-2">
                      <div class="text-h6 font-weight-bold text-primary">
                        {{ formatCurrency(selectedItem.requested_amount) }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Запрашиваемая сумма</div>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-center pa-2">
                      <div class="text-h6 font-weight-bold text-success">
                        {{ selectedItem.expected_roi }}%
                      </div>
                      <div class="text-caption text-medium-emphasis">Ожидаемый ROI</div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="mb-4" />

              <!-- Временные рамки -->
              <div class="mb-4">
                <h4 class="text-subtitle-1 mb-3">Временные рамки</h4>
                <v-row dense>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Дата запроса</div>
                    <div class="text-body-2">{{ formatDate(selectedItem.requested_date) }}</div>
                  </v-col>
                  <v-col cols="6" v-if="selectedItem.approved_date">
                    <div class="text-caption text-medium-emphasis">Дата одобрения</div>
                    <div class="text-body-2">{{ formatDate(selectedItem.approved_date) }}</div>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="mb-4" />

              <!-- Действия -->
              <div>
                <h4 class="text-subtitle-1 mb-3">Действия</h4>
                <div class="d-flex flex-column gap-2">
                  <v-btn
                    v-if="selectedItem.status === 'pending'"
                    color="success"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-check"
                    @click="approveBudgetRequest(selectedItem.request_id)"
                  >
                    Одобрить запрос
                  </v-btn>
                  <v-btn
                    v-if="selectedItem.status === 'pending'"
                    color="error"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-close"
                    @click="rejectBudgetRequest(selectedItem.request_id)"
                  >
                    Отклонить запрос
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-pencil"
                  >
                    Редактировать запрос
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-chart-timeline"
                  >
                    История запроса
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог создания запроса -->
    <v-dialog v-model="showCreateRequest" max-width="700">
      <v-card>
        <v-card-title>Создать запрос на бюджет</v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-form @submit.prevent="onRequestSubmit">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newRequest.budget_id"
                  :items="availableBudgets"
                  item-title="name"
                  item-value="budget_id"
                  label="Бюджет *"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newRequest.requested_amount"
                  label="Запрашиваемая сумма *"
                  variant="outlined"
                  type="number"
                  min="1"
                  required
                  suffix="₽"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newRequest.priority"
                  :items="priorityOptions"
                  label="Приоритет *"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newRequest.department"
                  label="Отдел"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="newRequest.justification"
                  label="Обоснование *"
                  variant="outlined"
                  required
                  rows="3"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="newRequest.business_case"
                  label="Бизнес-кейс"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newRequest.expected_roi"
                  label="Ожидаемый ROI (%)"
                  variant="outlined"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeCreateRequestDialog">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="submitBudgetRequest"
            :loading="isSubmittingRequest"
            :disabled="!isRequestFormValid"
          >
            Создать запрос
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог управления пользователями -->
    <BudgetUserManagement
      v-model="showUserManagement"
      :budget="selectedBudgetForUserManagement"
      @users-updated="handleUsersUpdated"
    />

    <!-- Диалог маппинга POs -->
    <FinancialMapping
      v-model="showPOMapping"
      :budget="selectedBudgetForMapping"
      type="pos"
      @mapping-updated="handleMappingUpdated"
    />

    <!-- Диалог маппинга Actuals -->
    <FinancialMapping
      v-model="showActualsMapping"
      :budget="selectedBudgetForMapping"
      type="actuals"
      @mapping-updated="handleMappingUpdated"
    />
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'
import { useBudgetsStore } from '@/stores/budgetsStore'
import BudgetActionBar from '@/components/budgets/BudgetActionBar.vue'
import BudgetHierarchyTable from '@/components/budgets/BudgetHierarchyTable.vue'
import BudgetDetailsPanel from '@/components/budgets/BudgetDetailsPanel.vue'
import BudgetUserManagement from '@/components/budgets/BudgetUserManagement.vue'
import FinancialMapping from '@/components/budgets/FinancialMapping.vue'

export default {
  name: 'BudgetsView',
  components: {
    BudgetActionBar,
    BudgetHierarchyTable,
    BudgetDetailsPanel,
    BudgetUserManagement,
    FinancialMapping
  },
  setup() {
    const budgetsStore = useBudgetsStore()

    // Reactive state
    const currentView = ref('hierarchy')
    const selectedYear = ref(2025)
    const searchQuery = ref('')
    const showCreateRequest = ref(false)
    const selectedItem = ref(null)
    const rollupView = ref('table')
    const requestStatusFilter = ref(null)
    const isSubmittingRequest = ref(false)
    const showUserManagement = ref(false)
    const selectedBudgetForUserManagement = ref(null)
    const showPOMapping = ref(false)
    const showActualsMapping = ref(false)
    const selectedBudgetForMapping = ref(null)
    const newRequest = ref({
      budget_id: '',
      requested_amount: null,
      justification: '',
      priority: 'Medium',
      department: 'Маркетинг',
      business_case: '',
      expected_roi: null
    })

    // Computed properties
    const isLoading = computed(() => budgetsStore.isLoading)
    const selectedBudget = computed(() => budgetsStore.selectedBudget)
    const totalBudgetAmount = computed(() => budgetsStore.totalBudgetAmount)
    const allocatedAmount = computed(() => budgetsStore.allocatedAmount)
    const remainingAmount = computed(() => budgetsStore.remainingAmount)
    const pendingRequests = computed(() => budgetsStore.pendingRequests)

    const fiscalYears = computed(() => [
      2024, 2025, 2026
    ])

    const budgetRollupData = computed(() => budgetsStore.budgets)

    const filteredBudgetRequests = computed(() => {
      let filtered = budgetsStore.budgetRequests
      if (requestStatusFilter.value) {
        filtered = filtered.filter(request => request.status === requestStatusFilter.value)
      }
      return filtered
    })

    const rollupHeaders = [
      { title: 'Бюджет', key: 'name', sortable: true },
      { title: 'Общий бюджет', key: 'total_amount', sortable: true },
      { title: 'Распределено', key: 'allocated_amount', sortable: true },
      { title: 'Потрачено', key: 'spent_amount', sortable: true },
      { title: 'Остаток', key: 'remaining_amount', sortable: true },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Использование', key: 'utilization', sortable: false }
    ]

    const requestHeaders = [
      { title: 'Сумма', key: 'requested_amount', sortable: true },
      { title: 'Обоснование', key: 'justification', sortable: false },
      { title: 'Приоритет', key: 'priority', sortable: true },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Дата запроса', key: 'requested_date', sortable: true },
      { title: 'ROI (%)', key: 'expected_roi', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const requestStatusOptions = [
      { title: 'Ожидает', value: 'pending' },
      { title: 'Одобрен', value: 'approved' },
      { title: 'Отклонен', value: 'rejected' }
    ]

    const availableBudgets = computed(() => {
      return budgetsStore.budgets.filter(budget =>
        budget.budget_type === 'Investment Plan' && budget.status === 'Active'
      )
    })

    const priorityOptions = [
      { title: 'Высокий', value: 'High' },
      { title: 'Средний', value: 'Medium' },
      { title: 'Низкий', value: 'Low' }
    ]

    const isRequestFormValid = computed(() => {
      return newRequest.value.budget_id &&
             newRequest.value.requested_amount &&
             newRequest.value.justification &&
             newRequest.value.priority
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

    const refreshData = async () => {
      await Promise.all([
        budgetsStore.fetchBudgets({ fiscalYear: selectedYear.value }),
        budgetsStore.fetchBudgetRequests()
      ])
    }

    const onYearChange = (year) => {
      budgetsStore.fetchBudgets({ fiscalYear: year })
    }

    const onSearch = (query) => {
      if (query?.trim()) {
        budgetsStore.searchBudgets(query)
      } else {
        budgetsStore.fetchBudgets({ fiscalYear: selectedYear.value })
      }
    }

    const showCreateRequestDialog = () => {
      // Сброс формы
      newRequest.value = {
        budget_id: '',
        requested_amount: null,
        justification: '',
        priority: 'Medium',
        department: 'Маркетинг',
        business_case: '',
        expected_roi: null
      }
      showCreateRequest.value = true
    }

    const closeCreateRequestDialog = () => {
      showCreateRequest.value = false
    }

    const submitBudgetRequest = async () => {
      if (!isRequestFormValid.value) return

      try {
        isSubmittingRequest.value = true
        const requestData = {
          ...newRequest.value,
          status: 'pending',
          requested_date: new Date().toISOString(),
          currency: 'RUB'
        }
        await budgetsStore.createBudgetRequest(requestData)
        showCreateRequest.value = false
      } catch (error) {
        console.error('Error creating request:', error)
      } finally {
        isSubmittingRequest.value = false
      }
    }

    const onRequestSubmit = (requestData) => {
      budgetsStore.createBudgetRequest(requestData)
      showCreateRequest.value = false
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getBudgetTypeIcon = (type) => {
      switch (type) {
        case 'Folder':
          return 'mdi-folder'
        case 'Investment Plan':
          return 'mdi-chart-timeline-variant'
        default:
          return 'mdi-wallet'
      }
    }

    const getBudgetTypeColor = (type) => {
      switch (type) {
        case 'Folder':
          return 'warning'
        case 'Investment Plan':
          return 'primary'
        default:
          return 'info'
      }
    }

    const getBudgetStatusColor = (status) => {
      switch (status) {
        case 'Active':
          return 'success'
        case 'Planning':
          return 'warning'
        case 'Reserved':
          return 'info'
        default:
          return 'grey'
      }
    }

    const getBudgetStatusText = (status) => {
      const statusMap = {
        'Active': 'Активный',
        'Planning': 'Планирование',
        'Reserved': 'Резерв'
      }
      return statusMap[status] || status
    }

    const getBudgetUtilization = (budget) => {
      if (!budget.total_amount) return 0
      return Math.min(Math.round((budget.spent_amount / budget.total_amount) * 100), 100)
    }

    const getUtilizationColor = (utilization) => {
      if (utilization >= 90) return 'error'
      if (utilization >= 75) return 'warning'
      if (utilization >= 50) return 'info'
      return 'success'
    }

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'High':
          return 'error'
        case 'Medium':
          return 'warning'
        case 'Low':
          return 'success'
        default:
          return 'grey'
      }
    }

    const getPriorityText = (priority) => {
      const priorityMap = {
        'High': 'Высокий',
        'Medium': 'Средний',
        'Low': 'Низкий'
      }
      return priorityMap[priority] || priority
    }

    const getRequestStatusColor = (status) => {
      switch (status) {
        case 'pending':
          return 'warning'
        case 'approved':
          return 'success'
        case 'rejected':
          return 'error'
        default:
          return 'grey'
      }
    }

    const getRequestStatusText = (status) => {
      const statusMap = {
        'pending': 'Ожидает',
        'approved': 'Одобрен',
        'rejected': 'Отклонен'
      }
      return statusMap[status] || status
    }

    const selectBudgetFromRollup = (event, { item }) => {
      selectedItem.value = { ...item, type: 'budget' }
      budgetsStore.selectBudget(item.budget_id)
    }

    const selectBudgetRequest = (event, { item }) => {
      selectedItem.value = { ...item, type: 'request' }
    }

    const viewRequestDetails = (request) => {
      selectedItem.value = { ...request, type: 'request' }
    }

    const onRequestStatusFilter = () => {
      // Фильтрация происходит через computed свойство
    }

    const approveBudgetRequest = async (requestId) => {
      try {
        await budgetsStore.approveBudgetRequest(requestId)
        await budgetsStore.fetchBudgetRequests()
      } catch (error) {
        console.error('Error approving request:', error)
      }
    }

    const rejectBudgetRequest = async (requestId) => {
      const reason = prompt('Укажите причину отклонения:')
      if (reason !== null) {
        try {
          await budgetsStore.rejectBudgetRequest(requestId, reason)
          await budgetsStore.fetchBudgetRequests()
        } catch (error) {
          console.error('Error rejecting request:', error)
        }
      }
    }

    // Event handlers for new functionality
    const handleNewItem = (itemData) => {
      console.log('Creating new item:', itemData)
      // TODO: Implement creation logic
    }

    const handleDeleteItems = (items) => {
      console.log('Deleting items:', items)
      // TODO: Implement deletion logic
    }

    const handleCopyItems = (items) => {
      console.log('Copying items:', items)
      // TODO: Implement copy logic
    }

    const handleMoveItems = (items) => {
      console.log('Moving items:', items)
      // TODO: Implement move logic
    }

    const handleImportData = (dataType) => {
      console.log('Importing data type:', dataType)
      // TODO: Implement import logic
    }

    const handleUserManagement = (item) => {
      selectedBudgetForUserManagement.value = item
      showUserManagement.value = true
    }

    const handlePOMapping = (item) => {
      selectedBudgetForMapping.value = item
      showPOMapping.value = true
    }

    const handleActualsMapping = (item) => {
      selectedBudgetForMapping.value = item
      showActualsMapping.value = true
    }

    const handleApprovals = (item) => {
      console.log('Opening approvals for:', item)
      // TODO: Implement approvals dialog
    }

    const handleTransfers = (item) => {
      console.log('Opening transfers for:', item)
      // TODO: Implement transfers dialog
    }

    const handleSettings = (item) => {
      console.log('Opening settings for:', item)
      // TODO: Implement settings dialog
    }

    const handleNotes = (item) => {
      console.log('Opening notes for:', item)
      // TODO: Implement notes dialog
    }

    const handleAuditTrail = (item) => {
      console.log('Opening audit trail for:', item)
      // TODO: Implement audit trail dialog
    }

    const handleRowSelected = (item) => {
      selectedItem.value = { ...item, type: 'budget' }
      budgetsStore.selectBudget(item.budget_id)
    }

    const handleEditBudget = (budget) => {
      console.log('Editing budget:', budget)
      // TODO: Implement budget editing dialog
    }

    const handleUsersUpdated = () => {
      // Обновляем данные бюджета после изменения пользователей
      budgetsStore.fetchBudgets({ fiscalYear: selectedYear.value })
    }

    const handleMappingUpdated = () => {
      // Обновляем данные бюджета после изменения маппинга
      budgetsStore.fetchBudgets({ fiscalYear: selectedYear.value })
    }

    // Watchers
    watch(currentView, (newView) => {
      budgetsStore.setView(newView)
    })

    // Lifecycle
    onMounted(async () => {
      await budgetsStore.initialize()
    })

    return {
      // Store state
      isLoading,
      selectedBudget,
      totalBudgetAmount,
      allocatedAmount,
      remainingAmount,
      pendingRequests,
      budgetRollupData,
      filteredBudgetRequests,

      // Local state
      currentView,
      selectedYear,
      searchQuery,
      showCreateRequest,
      selectedItem,
      rollupView,
      requestStatusFilter,
      fiscalYears,
      rollupHeaders,
      requestHeaders,
      requestStatusOptions,
      availableBudgets,
      priorityOptions,
      isRequestFormValid,
      isSubmittingRequest,
      newRequest,
      showUserManagement,
      selectedBudgetForUserManagement,
      showPOMapping,
      showActualsMapping,
      selectedBudgetForMapping,

      // Methods
      formatCurrency,
      formatDate,
      refreshData,
      onYearChange,
      onSearch,
      showCreateRequestDialog,
      closeCreateRequestDialog,
      submitBudgetRequest,
      onRequestSubmit,
      getBudgetTypeIcon,
      getBudgetTypeColor,
      getBudgetStatusColor,
      getBudgetStatusText,
      getBudgetUtilization,
      getUtilizationColor,
      getPriorityColor,
      getPriorityText,
      getRequestStatusColor,
      getRequestStatusText,
      selectBudgetFromRollup,
      selectBudgetRequest,
      viewRequestDetails,
      onRequestStatusFilter,
      approveBudgetRequest,
      rejectBudgetRequest,

      // New event handlers
      handleNewItem,
      handleDeleteItems,
      handleCopyItems,
      handleMoveItems,
      handleImportData,
      handleUserManagement,
      handlePOMapping,
      handleActualsMapping,
      handleApprovals,
      handleTransfers,
      handleSettings,
      handleNotes,
      handleAuditTrail,
      handleRowSelected,
      handleEditBudget,
      handleUsersUpdated,
      handleMappingUpdated
    }
  }
}
</script>

<style scoped>
.budgets-view {
  padding: 24px;
  height: 100vh;
  overflow: auto;
}

.h-100 {
  height: 100%;
}
</style>