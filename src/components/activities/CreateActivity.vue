<template>
  <v-dialog
    v-model="isOpen"
    max-width="900"
    persistent
    scrollable
  >
    <v-card>
      <!-- Заголовок -->
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <div>
          <span class="text-h6">Создание новой активности</span>
          <div class="text-caption text-grey-darken-1 mt-1">
            Шаг {{ currentStep }} из {{ totalSteps }}
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          @click="closeWizard"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Индикатор прогресса -->
      <div class="step-progress pa-4 pt-0">
        <v-stepper
          v-model="currentStep"
          :items="stepItems"
          hide-actions
          flat
        >
        </v-stepper>
      </div>

      <v-divider />

      <!-- Содержимое шагов -->
      <v-card-text class="pa-0" style="height: 500px;">
        <v-window v-model="currentStep" style="height: 100%;">
          <!-- Шаг 1: Основная информация -->
          <v-window-item :value="1" class="step-content">
            <v-container fluid class="pa-6">
              <div class="step-header mb-4">
                <h4 class="text-h6 mb-2">Основная информация</h4>
                <p class="text-body-2 text-grey-darken-1">
                  Укажите название, тип и базовые параметры активности
                </p>
              </div>

              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.name"
                    label="Название активности"
                    placeholder="Введите название активности"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required]"
                    counter="100"
                    maxlength="100"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.activity_type_id"
                    :items="activityTypes"
                    item-title="name"
                    item-value="activity_type_id"
                    label="Тип активности"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.parent_activity_id"
                    :items="parentActivities"
                    item-title="name"
                    item-value="activity_id"
                    label="Родительская активность"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="formData.description"
                    label="Описание"
                    placeholder="Опишите цели и задачи активности"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    counter="500"
                    maxlength="500"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.status"
                    :items="statusOptions"
                    label="Статус"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.currency_code"
                    :items="currencyOptions"
                    label="Валюта"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required]"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Шаг 2: Временные рамки -->
          <v-window-item :value="2" class="step-content">
            <v-container fluid class="pa-6">
              <div class="step-header mb-4">
                <h4 class="text-h6 mb-2">Временные рамки</h4>
                <p class="text-body-2 text-grey-darken-1">
                  Определите периоды планирования и проведения активности
                </p>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.planning_start_date"
                    label="Начало планирования"
                    type="date"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.planning_end_date"
                    label="Окончание планирования"
                    type="date"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required, rules.endDateAfterStart]"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.in_market_start_date"
                    label="Начало проведения"
                    type="date"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.in_market_end_date"
                    label="Окончание проведения"
                    type="date"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required, rules.marketEndAfterStart]"
                  />
                </v-col>

                <v-col cols="12">
                  <v-alert
                    v-if="dateValidationMessage"
                    :type="dateValidationMessage.type"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ dateValidationMessage.text }}
                  </v-alert>
                </v-col>

                <v-col cols="12">
                  <div class="timeline-preview pa-3 rounded border">
                    <h5 class="text-subtitle-1 mb-3">Предварительная временная шкала</h5>
                    <div class="timeline-bars">
                      <div v-if="formData.planning_start_date && formData.planning_end_date" class="timeline-bar planning">
                        <div class="bar-label">Планирование</div>
                        <div class="bar-dates">{{ formatDateRange(formData.planning_start_date, formData.planning_end_date) }}</div>
                      </div>
                      <div v-if="formData.in_market_start_date && formData.in_market_end_date" class="timeline-bar market">
                        <div class="bar-label">Проведение</div>
                        <div class="bar-dates">{{ formatDateRange(formData.in_market_start_date, formData.in_market_end_date) }}</div>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Шаг 3: Бюджет -->
          <v-window-item :value="3" class="step-content">
            <v-container fluid class="pa-6">
              <div class="step-header mb-4">
                <h4 class="text-h6 mb-2">Планирование бюджета</h4>
                <p class="text-body-2 text-grey-darken-1">
                  Укажите планируемые затраты по категориям
                </p>
              </div>

              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model.number="formData.total_budget"
                    label="Общий бюджет"
                    type="number"
                    variant="outlined"
                    density="compact"
                    :suffix="formData.currency_code"
                    :rules="[rules.required, rules.positiveNumber]"
                  />
                </v-col>

                <v-col cols="12">
                  <div class="budget-categories">
                    <h5 class="text-subtitle-1 mb-3">Распределение по категориям</h5>
                    <div
                      v-for="category in budgetCategories"
                      :key="category.key"
                      class="category-row mb-3"
                    >
                      <v-row align="center">
                        <v-col cols="12" md="4">
                          <div class="d-flex align-center">
                            <v-icon :color="category.color" class="me-2">{{ category.icon }}</v-icon>
                            <span class="text-body-2">{{ category.name }}</span>
                          </div>
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model.number="formData.budget_categories[category.key]"
                            type="number"
                            variant="outlined"
                            density="compact"
                            :suffix="formData.currency_code"
                            hide-details
                            @input="updateBudgetDistribution"
                          />
                        </v-col>
                        <v-col cols="12" md="4">
                          <div class="text-body-2 text-grey-darken-1">
                            {{ getBudgetPercentage(category.key) }}% от общего бюджета
                          </div>
                        </v-col>
                      </v-row>
                    </div>

                    <v-divider class="my-3" />

                    <div class="budget-summary">
                      <v-row>
                        <v-col cols="12" md="6">
                          <div class="text-subtitle-2">
                            Распределено: {{ formatCurrency(totalAllocated) }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-subtitle-2" :class="remainingBudgetClass">
                            Остаток: {{ formatCurrency(remainingBudget) }}
                          </div>
                        </v-col>
                      </v-row>
                      <v-progress-linear
                        :model-value="budgetAllocationPercent"
                        :color="budgetAllocationPercent > 100 ? 'error' : 'success'"
                        height="6"
                        rounded
                        class="mt-2"
                      />
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Шаг 4: Цели и KPI -->
          <v-window-item :value="4" class="step-content">
            <v-container fluid class="pa-6">
              <div class="step-header mb-4">
                <h4 class="text-h6 mb-2">Цели и ключевые показатели</h4>
                <p class="text-body-2 text-grey-darken-1">
                  Определите измеримые цели для оценки эффективности
                </p>
              </div>

              <v-row>
                <v-col cols="12">
                  <div class="objectives-section mb-4">
                    <div class="d-flex justify-space-between align-center mb-3">
                      <h5 class="text-subtitle-1">Бизнес-цели</h5>
                      <v-btn
                        variant="outlined"
                        size="small"
                        prepend-icon="mdi-plus"
                        @click="addObjective"
                      >
                        Добавить цель
                      </v-btn>
                    </div>

                    <div
                      v-for="(objective, index) in formData.objectives"
                      :key="index"
                      class="objective-item pa-3 mb-3 rounded border"
                    >
                      <v-row>
                        <v-col cols="12" md="8">
                          <v-text-field
                            v-model="objective.description"
                            label="Описание цели"
                            variant="outlined"
                            density="compact"
                            hide-details
                          />
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-select
                            v-model="objective.priority"
                            :items="priorityOptions"
                            label="Приоритет"
                            variant="outlined"
                            density="compact"
                            hide-details
                          />
                        </v-col>
                        <v-col cols="12" md="1">
                          <v-btn
                            icon
                            variant="text"
                            color="error"
                            @click="removeObjective(index)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12">
                  <div class="kpis-section">
                    <div class="d-flex justify-space-between align-center mb-3">
                      <h5 class="text-subtitle-1">Ключевые показатели эффективности</h5>
                      <v-btn
                        variant="outlined"
                        size="small"
                        prepend-icon="mdi-plus"
                        @click="addKPI"
                      >
                        Добавить KPI
                      </v-btn>
                    </div>

                    <div
                      v-for="(kpi, index) in formData.kpis"
                      :key="index"
                      class="kpi-item pa-3 mb-3 rounded border"
                    >
                      <v-row>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model="kpi.name"
                            label="Название KPI"
                            variant="outlined"
                            density="compact"
                            hide-details
                          />
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-text-field
                            v-model.number="kpi.target_value"
                            label="Целевое значение"
                            type="number"
                            variant="outlined"
                            density="compact"
                            hide-details
                          />
                        </v-col>
                        <v-col cols="12" md="2">
                          <v-text-field
                            v-model="kpi.unit"
                            label="Единица"
                            variant="outlined"
                            density="compact"
                            hide-details
                            placeholder="шт, %, руб"
                          />
                        </v-col>
                        <v-col cols="12" md="2">
                          <v-text-field
                            v-model="kpi.deadline"
                            label="Срок"
                            type="date"
                            variant="outlined"
                            density="compact"
                            hide-details
                          />
                        </v-col>
                        <v-col cols="12" md="1">
                          <v-btn
                            icon
                            variant="text"
                            color="error"
                            @click="removeKPI(index)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Шаг 5: Подтверждение -->
          <v-window-item :value="5" class="step-content">
            <v-container fluid class="pa-6">
              <div class="step-header mb-4">
                <h4 class="text-h6 mb-2">Подтверждение создания</h4>
                <p class="text-body-2 text-grey-darken-1">
                  Проверьте введенную информацию перед созданием активности
                </p>
              </div>

              <div class="summary-sections">
                <!-- Основная информация -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1 pa-3">
                    <v-icon class="me-2">mdi-information</v-icon>
                    Основная информация
                  </v-card-title>
                  <v-card-text class="pa-3">
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="summary-field">
                          <div class="field-label">Название:</div>
                          <div class="field-value">{{ formData.name }}</div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="summary-field">
                          <div class="field-label">Тип:</div>
                          <div class="field-value">{{ getActivityTypeName(formData.activity_type_id) }}</div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="summary-field">
                          <div class="field-label">Статус:</div>
                          <div class="field-value">{{ getStatusText(formData.status) }}</div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="summary-field">
                          <div class="field-label">Валюта:</div>
                          <div class="field-value">{{ formData.currency_code }}</div>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- Временные рамки -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1 pa-3">
                    <v-icon class="me-2">mdi-calendar</v-icon>
                    Временные рамки
                  </v-card-title>
                  <v-card-text class="pa-3">
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="summary-field">
                          <div class="field-label">Планирование:</div>
                          <div class="field-value">{{ formatDateRange(formData.planning_start_date, formData.planning_end_date) }}</div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="summary-field">
                          <div class="field-label">Проведение:</div>
                          <div class="field-value">{{ formatDateRange(formData.in_market_start_date, formData.in_market_end_date) }}</div>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- Бюджет -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1 pa-3">
                    <v-icon class="me-2">mdi-wallet</v-icon>
                    Бюджет
                  </v-card-title>
                  <v-card-text class="pa-3">
                    <div class="summary-field mb-3">
                      <div class="field-label">Общий бюджет:</div>
                      <div class="field-value text-h6 font-weight-bold text-primary">
                        {{ formatCurrency(formData.total_budget) }}
                      </div>
                    </div>
                    <div class="text-body-2 text-grey-darken-1">
                      Распределено: {{ formatCurrency(totalAllocated) }}
                      ({{ budgetAllocationPercent.toFixed(1) }}%)
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Цели и KPI -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1 pa-3">
                    <v-icon class="me-2">mdi-target</v-icon>
                    Цели и KPI
                  </v-card-title>
                  <v-card-text class="pa-3">
                    <div class="mb-3">
                      <div class="field-label mb-2">Бизнес-цели ({{ formData.objectives.length }}):</div>
                      <ul class="field-value">
                        <li v-for="(objective, index) in formData.objectives" :key="index">
                          {{ objective.description }} ({{ objective.priority }})
                        </li>
                      </ul>
                    </div>
                    <div>
                      <div class="field-label mb-2">KPI ({{ formData.kpis.length }}):</div>
                      <ul class="field-value">
                        <li v-for="(kpi, index) in formData.kpis" :key="index">
                          {{ kpi.name }}: {{ kpi.target_value }} {{ kpi.unit }}
                        </li>
                      </ul>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-container>
          </v-window-item>
        </v-window>
      </v-card-text>

      <!-- Кнопки навигации -->
      <v-card-actions class="pa-4">
        <v-btn
          v-if="currentStep > 1"
          variant="outlined"
          @click="previousStep"
        >
          <v-icon start>mdi-chevron-left</v-icon>
          Назад
        </v-btn>

        <v-spacer />

        <v-btn
          variant="outlined"
          @click="closeWizard"
        >
          Отмена
        </v-btn>

        <v-btn
          v-if="currentStep < totalSteps"
          color="primary"
          :disabled="!isCurrentStepValid"
          @click="nextStep"
        >
          Далее
          <v-icon end>mdi-chevron-right</v-icon>
        </v-btn>

        <v-btn
          v-if="currentStep === totalSteps"
          color="primary"
          :loading="isCreating"
          @click="createActivity"
        >
          <v-icon start>mdi-check</v-icon>
          Создать активность
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'
import { useAppStore } from '@/stores/appStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

const activitiesStore = useActivitiesStore()
const appStore = useAppStore()

// State
const currentStep = ref(1)
const totalSteps = 5
const isCreating = ref(false)

// Form data
const formData = ref({
  name: '',
  description: '',
  activity_type_id: '',
  parent_activity_id: null,
  status: 'Planning',
  currency_code: 'RUB',
  planning_start_date: '',
  planning_end_date: '',
  in_market_start_date: '',
  in_market_end_date: '',
  total_budget: 0,
  budget_categories: {
    media: 0,
    creative: 0,
    production: 0,
    analytics: 0,
    other: 0
  },
  objectives: [],
  kpis: []
})

// Static data
const stepItems = [
  'Основная информация',
  'Временные рамки',
  'Бюджет',
  'Цели и KPI',
  'Подтверждение'
]

const statusOptions = [
  { title: 'Планирование', value: 'Planning' },
  { title: 'Активна', value: 'Active' },
  { title: 'Приостановлена', value: 'On Hold' }
]

const currencyOptions = [
  { title: 'Российский рубль (RUB)', value: 'RUB' },
  { title: 'Доллар США (USD)', value: 'USD' },
  { title: 'Евро (EUR)', value: 'EUR' }
]

const priorityOptions = [
  { title: 'Высокий', value: 'high' },
  { title: 'Средний', value: 'medium' },
  { title: 'Низкий', value: 'low' }
]

const budgetCategories = ref([
  { key: 'media', name: 'Медиа размещение', icon: 'mdi-television', color: 'primary' },
  { key: 'creative', name: 'Креативы и контент', icon: 'mdi-palette', color: 'success' },
  { key: 'production', name: 'Производство', icon: 'mdi-camera', color: 'warning' },
  { key: 'analytics', name: 'Аналитика', icon: 'mdi-chart-bar', color: 'info' },
  { key: 'other', name: 'Прочие расходы', icon: 'mdi-dots-horizontal', color: 'secondary' }
])

// Validation rules
const rules = {
  required: value => !!value || 'Поле обязательно для заполнения',
  positiveNumber: value => (value > 0) || 'Значение должно быть больше нуля',
  endDateAfterStart: value => {
    if (!formData.value.planning_start_date || !value) return true
    return new Date(value) >= new Date(formData.value.planning_start_date) || 'Дата окончания должна быть не раньше даты начала'
  },
  marketEndAfterStart: value => {
    if (!formData.value.in_market_start_date || !value) return true
    return new Date(value) >= new Date(formData.value.in_market_start_date) || 'Дата окончания должна быть не раньше даты начала'
  }
}

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activityTypes = computed(() => activitiesStore.activityTypes)

const parentActivities = computed(() => {
  const items = [{ name: 'Корневая активность', activity_id: null }]
  return items.concat(activitiesStore.activities.map(a => ({
    name: a.name,
    activity_id: a.activity_id
  })))
})

const totalAllocated = computed(() => {
  return Object.values(formData.value.budget_categories).reduce((sum, val) => sum + (val || 0), 0)
})

const remainingBudget = computed(() => {
  return formData.value.total_budget - totalAllocated.value
})

const remainingBudgetClass = computed(() => {
  return remainingBudget.value < 0 ? 'text-error' : 'text-success'
})

const budgetAllocationPercent = computed(() => {
  if (formData.value.total_budget === 0) return 0
  return (totalAllocated.value / formData.value.total_budget) * 100
})

const dateValidationMessage = computed(() => {
  const { planning_start_date, planning_end_date, in_market_start_date, in_market_end_date } = formData.value

  if (planning_start_date && planning_end_date && new Date(planning_end_date) < new Date(planning_start_date)) {
    return { type: 'error', text: 'Дата окончания планирования не может быть раньше даты начала' }
  }

  if (in_market_start_date && in_market_end_date && new Date(in_market_end_date) < new Date(in_market_start_date)) {
    return { type: 'error', text: 'Дата окончания проведения не может быть раньше даты начала' }
  }

  if (planning_end_date && in_market_start_date && new Date(in_market_start_date) < new Date(planning_end_date)) {
    return { type: 'warning', text: 'Рекомендуется завершить планирование до начала проведения активности' }
  }

  return null
})

const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.value.name && formData.value.activity_type_id && formData.value.status && formData.value.currency_code
    case 2:
      return formData.value.planning_start_date && formData.value.planning_end_date &&
             formData.value.in_market_start_date && formData.value.in_market_end_date &&
             !dateValidationMessage.value?.type?.includes('error')
    case 3:
      return formData.value.total_budget > 0
    case 4:
      return true
    case 5:
      return true
    default:
      return false
  }
})

// Methods
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const closeWizard = () => {
  if (confirm('Вы уверены, что хотите закрыть мастер? Все введенные данные будут потеряны.')) {
    resetForm()
    isOpen.value = false
  }
}

const resetForm = () => {
  currentStep.value = 1
  formData.value = {
    name: '',
    description: '',
    activity_type_id: '',
    parent_activity_id: null,
    status: 'Planning',
    currency_code: 'RUB',
    planning_start_date: '',
    planning_end_date: '',
    in_market_start_date: '',
    in_market_end_date: '',
    total_budget: 0,
    budget_categories: {
      media: 0,
      creative: 0,
      production: 0,
      analytics: 0,
      other: 0
    },
    objectives: [],
    kpis: []
  }
}

const createActivity = async () => {
  isCreating.value = true

  try {
    const activityData = {
      ...formData.value,
      created_by: 'Текущий пользователь',
      created_date: new Date().toISOString()
    }

    await activitiesStore.createActivity(activityData)

    appStore.showSuccess('Активность успешно создана')
    emit('created')
    isOpen.value = false
    resetForm()
  } catch (error) {
    appStore.showError('Ошибка создания активности')
  } finally {
    isCreating.value = false
  }
}

const addObjective = () => {
  formData.value.objectives.push({
    description: '',
    priority: 'medium'
  })
}

const removeObjective = (index) => {
  formData.value.objectives.splice(index, 1)
}

const addKPI = () => {
  formData.value.kpis.push({
    name: '',
    target_value: 0,
    unit: '',
    deadline: ''
  })
}

const removeKPI = (index) => {
  formData.value.kpis.splice(index, 1)
}

const updateBudgetDistribution = () => {
  // Логика для автоматического пересчета распределения бюджета
}

const getBudgetPercentage = (categoryKey) => {
  if (formData.value.total_budget === 0) return 0
  const amount = formData.value.budget_categories[categoryKey] || 0
  return ((amount / formData.value.total_budget) * 100).toFixed(1)
}

const getActivityTypeName = (typeId) => {
  const type = activitiesStore.activityTypes.find(t => t.activity_type_id === typeId)
  return type ? type.name : 'Неизвестный тип'
}

const getStatusText = (status) => {
  const option = statusOptions.find(o => o.value === status)
  return option ? option.title : status
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: formData.value.currency_code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Не указан'

  const start = new Date(startDate).toLocaleDateString('ru-RU')
  const end = new Date(endDate).toLocaleDateString('ru-RU')

  return `${start} — ${end}`
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm()

    // Если есть выбранный родитель для создания, устанавливаем его
    if (activitiesStore.selectedParentForCreation) {
      formData.value.parent_activity_id = activitiesStore.selectedParentForCreation
      // Очищаем выбранного родителя после установки
      activitiesStore.clearSelectedParentForCreation()
    }
  }
})
</script>

<style scoped>
.step-content {
  height: 100%;
  overflow-y: auto;
}

.step-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 16px;
}

.timeline-preview {
  background: #fafafa;
}

.timeline-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-bar {
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 4px solid;
}

.timeline-bar.planning {
  background: rgba(25, 118, 210, 0.1);
  border-left-color: #1976D2;
}

.timeline-bar.market {
  background: rgba(76, 175, 80, 0.1);
  border-left-color: #4CAF50;
}

.bar-label {
  font-weight: 500;
  margin-bottom: 2px;
}

.bar-dates {
  font-size: 0.875rem;
  color: #666;
}

.category-row {
  background: #fafafa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.budget-summary {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.objective-item,
.kpi-item {
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.summary-field {
  margin-bottom: 12px;
}

.field-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 4px;
}

.field-value {
  font-weight: 500;
}

.step-progress {
  background: #fafafa;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .step-content .v-container {
    padding: 16px;
  }

  .timeline-bars {
    flex-direction: column;
  }

  .category-row .v-row {
    flex-direction: column;
  }
}
</style>