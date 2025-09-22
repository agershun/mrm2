<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-speedometer</v-icon>
      Настройки KPI и метрик
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Создать KPI
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Вложенное меню настроек KPI -->
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-list nav density="compact">
              <v-list-subheader>Настройки KPI</v-list-subheader>

              <v-list-item
                v-for="item in kpiSections"
                :key="item.id"
                :value="item.id"
                :active="selectedKPISection === item.id"
                @click="selectedKPISection = item.id"
              >
                <template v-slot:prepend>
                  <v-icon :icon="item.icon" />
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
                <template v-slot:append v-if="item.badge">
                  <v-chip size="small" color="primary">{{ item.badge }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Контент настроек KPI -->
        <v-col cols="12" md="8">
          <!-- Справочник KPI -->
          <template v-if="selectedKPISection === 'kpi-directory'">
            <v-card variant="outlined">
              <v-card-title>Справочник KPI</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Управление каталогом ключевых показателей эффективности
                </v-alert>

                <v-data-table
                  :headers="kpiHeaders"
                  :items="kpis"
                  class="elevation-1"
                  item-value="kpi_id"
                >
                  <template #item.category="{ item }">
                    <v-chip
                      :color="getCategoryColor(item.category)"
                      size="small"
                      variant="tonal"
                    >
                      {{ item.category }}
                    </v-chip>
                  </template>

                  <template #item.data_type="{ item }">
                    <v-chip
                      :color="getDataTypeColor(item.data_type)"
                      size="small"
                      variant="outlined"
                    >
                      {{ getDataTypeText(item.data_type) }}
                    </v-chip>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editKPI(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteKPI(item.kpi_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Формулы расчетов -->
          <template v-if="selectedKPISection === 'formulas'">
            <v-card variant="outlined">
              <v-card-title>Формулы расчетов</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка формул для автоматического расчета составных KPI
                </v-alert>

                <v-data-table
                  :headers="formulaHeaders"
                  :items="formulas"
                  class="elevation-1"
                  item-value="formula_id"
                >
                  <template #item.formula_type="{ item }">
                    <v-chip
                      :color="getFormulaTypeColor(item.formula_type)"
                      size="small"
                      variant="flat"
                    >
                      {{ getFormulaTypeText(item.formula_type) }}
                    </v-chip>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editFormula(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteFormula(item.formula_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Целевые значения -->
          <template v-if="selectedKPISection === 'targets'">
            <v-card variant="outlined">
              <v-card-title>Целевые значения</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка целевых значений и порогов для KPI
                </v-alert>

                <v-data-table
                  :headers="targetHeaders"
                  :items="targets"
                  class="elevation-1"
                  item-value="target_id"
                >
                  <template #item.threshold_type="{ item }">
                    <v-chip
                      :color="getThresholdTypeColor(item.threshold_type)"
                      size="small"
                      variant="outlined"
                    >
                      {{ getThresholdTypeText(item.threshold_type) }}
                    </v-chip>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editTarget(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteTarget(item.target_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Дашборды -->
          <template v-if="selectedKPISection === 'dashboards'">
            <v-card variant="outlined">
              <v-card-title>Настройки дашбордов</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Конфигурация дашбордов для отображения KPI
                </v-alert>
                <!-- TODO: Реализовать настройки дашбордов -->
                <v-alert type="info" variant="tonal">
                  Настройки дашбордов будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Уведомления -->
          <template v-if="selectedKPISection === 'notifications'">
            <v-card variant="outlined">
              <v-card-title>Уведомления по KPI</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка автоматических уведомлений при достижении пороговых значений
                </v-alert>
                <!-- TODO: Реализовать уведомления -->
                <v-alert type="info" variant="tonal">
                  Уведомления по KPI будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Экспорт данных -->
          <template v-if="selectedKPISection === 'export'">
            <v-card variant="outlined">
              <v-card-title>Экспорт данных KPI</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка автоматического экспорта данных KPI
                </v-alert>
                <!-- TODO: Реализовать экспорт -->
                <v-alert type="info" variant="tonal">
                  Экспорт данных KPI будет добавлен позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Диалог создания KPI -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Создать новый KPI</v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="isFormValid">
            <v-text-field
              v-model="newKPI.name"
              label="Название KPI"
              variant="outlined"
              :rules="[v => !!v || 'Название обязательно']"
              required
            />
            <v-select
              v-model="newKPI.category"
              :items="categoryOptions"
              label="Категория"
              variant="outlined"
              :rules="[v => !!v || 'Категория обязательна']"
              required
            />
            <v-select
              v-model="newKPI.data_type"
              :items="dataTypeOptions"
              label="Тип данных"
              variant="outlined"
              :rules="[v => !!v || 'Тип обязателен']"
              required
            />
            <v-textarea
              v-model="newKPI.description"
              label="Описание"
              variant="outlined"
              rows="3"
            />
            <v-text-field
              v-model="newKPI.unit"
              label="Единица измерения"
              variant="outlined"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreateDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!isFormValid"
            :loading="isSaving"
            @click="createKPI"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const selectedKPISection = ref('kpi-directory')
const showCreateDialog = ref(false)
const isFormValid = ref(false)
const isSaving = ref(false)

const newKPI = ref({
  name: '',
  category: '',
  data_type: '',
  description: '',
  unit: ''
})

const kpiSections = ref([
  {
    id: 'kpi-directory',
    title: 'Справочник KPI',
    icon: 'mdi-book-open',
    badge: null
  },
  {
    id: 'formulas',
    title: 'Формулы расчетов',
    icon: 'mdi-calculator',
    badge: null
  },
  {
    id: 'targets',
    title: 'Целевые значения',
    icon: 'mdi-target',
    badge: null
  },
  {
    id: 'dashboards',
    title: 'Дашборды',
    icon: 'mdi-view-dashboard',
    badge: 'Soon'
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    icon: 'mdi-bell',
    badge: 'Soon'
  },
  {
    id: 'export',
    title: 'Экспорт данных',
    icon: 'mdi-download',
    badge: 'Soon'
  }
])

const kpiHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Категория', key: 'category', sortable: true },
  { title: 'Тип данных', key: 'data_type', sortable: true },
  { title: 'Единица', key: 'unit', sortable: false },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const formulaHeaders = [
  { title: 'KPI', key: 'kpi_name', sortable: true },
  { title: 'Тип формулы', key: 'formula_type', sortable: true },
  { title: 'Формула', key: 'formula_expression', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const targetHeaders = [
  { title: 'KPI', key: 'kpi_name', sortable: true },
  { title: 'Тип порога', key: 'threshold_type', sortable: true },
  { title: 'Целевое значение', key: 'target_value', sortable: true },
  { title: 'Период', key: 'period', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

const kpis = ref([
  {
    kpi_id: '1',
    name: 'CTR (Click-Through Rate)',
    category: 'Реклама',
    data_type: 'percentage',
    unit: '%',
    description: 'Отношение кликов к показам рекламы'
  },
  {
    kpi_id: '2',
    name: 'CPA (Cost Per Acquisition)',
    category: 'Конверсия',
    data_type: 'currency',
    unit: '₽',
    description: 'Стоимость привлечения одного клиента'
  },
  {
    kpi_id: '3',
    name: 'ROAS (Return on Ad Spend)',
    category: 'ROI',
    data_type: 'ratio',
    unit: 'x',
    description: 'Возврат на рекламные инвестиции'
  },
  {
    kpi_id: '4',
    name: 'Email Open Rate',
    category: 'Email маркетинг',
    data_type: 'percentage',
    unit: '%',
    description: 'Процент открытий email сообщений'
  }
])

const formulas = ref([
  {
    formula_id: '1',
    kpi_name: 'CTR',
    formula_type: 'division',
    formula_expression: 'Клики / Показы * 100'
  },
  {
    formula_id: '2',
    kpi_name: 'CPA',
    formula_type: 'division',
    formula_expression: 'Затраты / Конверсии'
  },
  {
    formula_id: '3',
    kpi_name: 'ROAS',
    formula_type: 'division',
    formula_expression: 'Доход / Затраты на рекламу'
  }
])

const targets = ref([
  {
    target_id: '1',
    kpi_name: 'CTR',
    threshold_type: 'minimum',
    target_value: '2.5',
    period: 'Q1 2025'
  },
  {
    target_id: '2',
    kpi_name: 'CPA',
    threshold_type: 'maximum',
    target_value: '1500',
    period: 'Q1 2025'
  },
  {
    target_id: '3',
    kpi_name: 'ROAS',
    threshold_type: 'minimum',
    target_value: '4.0',
    period: 'Q1 2025'
  }
])

const categoryOptions = ref([
  { title: 'Реклама', value: 'advertising' },
  { title: 'Конверсия', value: 'conversion' },
  { title: 'ROI', value: 'roi' },
  { title: 'Email маркетинг', value: 'email' },
  { title: 'Социальные сети', value: 'social' },
  { title: 'Веб-аналитика', value: 'web_analytics' }
])

const dataTypeOptions = ref([
  { title: 'Процент', value: 'percentage' },
  { title: 'Валюта', value: 'currency' },
  { title: 'Число', value: 'number' },
  { title: 'Коэффициент', value: 'ratio' },
  { title: 'Время', value: 'duration' }
])

// Helper functions
const getCategoryColor = (category) => {
  const colors = {
    'Реклама': 'blue',
    'Конверсия': 'green',
    'ROI': 'orange',
    'Email маркетинг': 'purple',
    'Социальные сети': 'pink',
    'Веб-аналитика': 'teal'
  }
  return colors[category] || 'grey'
}

const getDataTypeColor = (type) => {
  const colors = {
    'percentage': 'green',
    'currency': 'orange',
    'number': 'blue',
    'ratio': 'purple',
    'duration': 'indigo'
  }
  return colors[type] || 'grey'
}

const getDataTypeText = (type) => {
  const texts = {
    'percentage': 'Процент',
    'currency': 'Валюта',
    'number': 'Число',
    'ratio': 'Коэффициент',
    'duration': 'Время'
  }
  return texts[type] || type
}

const getFormulaTypeColor = (type) => {
  const colors = {
    'sum': 'green',
    'division': 'orange',
    'multiplication': 'blue',
    'average': 'purple',
    'custom': 'red'
  }
  return colors[type] || 'grey'
}

const getFormulaTypeText = (type) => {
  const texts = {
    'sum': 'Сумма',
    'division': 'Деление',
    'multiplication': 'Умножение',
    'average': 'Среднее',
    'custom': 'Произвольная'
  }
  return texts[type] || type
}

const getThresholdTypeColor = (type) => {
  const colors = {
    'minimum': 'green',
    'maximum': 'orange',
    'target': 'blue',
    'range': 'purple'
  }
  return colors[type] || 'grey'
}

const getThresholdTypeText = (type) => {
  const texts = {
    'minimum': 'Минимум',
    'maximum': 'Максимум',
    'target': 'Цель',
    'range': 'Диапазон'
  }
  return texts[type] || type
}

// CRUD methods
const createKPI = async () => {
  try {
    isSaving.value = true
    console.log('Создание KPI:', newKPI.value)
    appStore.showSuccess('KPI создан успешно')
    showCreateDialog.value = false
    newKPI.value = {
      name: '',
      category: '',
      data_type: '',
      description: '',
      unit: ''
    }
  } catch (error) {
    console.error('Error creating KPI:', error)
    appStore.showError('Ошибка создания KPI')
  } finally {
    isSaving.value = false
  }
}

const editKPI = (kpi) => {
  console.log('Редактирование KPI:', kpi)
}

const deleteKPI = async (kpiId) => {
  try {
    console.log('Удаление KPI:', kpiId)
    appStore.showSuccess('KPI удален')
  } catch (error) {
    console.error('Error deleting KPI:', error)
    appStore.showError('Ошибка удаления KPI')
  }
}

const editFormula = (formula) => {
  console.log('Редактирование формулы:', formula)
}

const deleteFormula = async (formulaId) => {
  try {
    console.log('Удаление формулы:', formulaId)
    appStore.showSuccess('Формула удалена')
  } catch (error) {
    console.error('Error deleting formula:', error)
    appStore.showError('Ошибка удаления формулы')
  }
}

const editTarget = (target) => {
  console.log('Редактирование целевого значения:', target)
}

const deleteTarget = async (targetId) => {
  try {
    console.log('Удаление целевого значения:', targetId)
    appStore.showSuccess('Целевое значение удалено')
  } catch (error) {
    console.error('Error deleting target:', error)
    appStore.showError('Ошибка удаления целевого значения')
  }
}
</script>