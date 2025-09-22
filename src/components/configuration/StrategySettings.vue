<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-target</v-icon>
      Настройки стратегии
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Создать период
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Вложенное меню настроек стратегии -->
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-list nav density="compact">
              <v-list-subheader>Настройки стратегии</v-list-subheader>

              <v-list-item
                v-for="item in strategySections"
                :key="item.id"
                :value="item.id"
                :active="selectedStrategySection === item.id"
                @click="selectedStrategySection = item.id"
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

        <!-- Контент настроек стратегии -->
        <v-col cols="12" md="8">
          <!-- Периоды планирования -->
          <template v-if="selectedStrategySection === 'periods'">
            <v-card variant="outlined">
              <v-card-title>Периоды планирования</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка временных периодов для целей и KPI (месячные, квартальные, годовые)
                </v-alert>

                <v-data-table
                  :headers="periodHeaders"
                  :items="periods"
                  class="elevation-1"
                  item-value="period_id"
                >
                  <template #item.period_type="{ item }">
                    <v-chip
                      :color="getPeriodTypeColor(item.period_type)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getPeriodTypeText(item.period_type) }}
                    </v-chip>
                  </template>

                  <template #item.is_active="{ item }">
                    <v-switch
                      v-model="item.is_active"
                      color="primary"
                      hide-details
                      @change="updatePeriod(item)"
                    />
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editPeriod(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deletePeriod(item.period_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Типы целей -->
          <template v-if="selectedStrategySection === 'objective-types'">
            <v-card variant="outlined">
              <v-card-title>Типы целей</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка категорий и типов стратегических целей
                </v-alert>

                <v-data-table
                  :headers="objectiveTypeHeaders"
                  :items="objectiveTypes"
                  class="elevation-1"
                  item-value="type_id"
                >
                  <template #item.level="{ item }">
                    <v-chip
                      :color="getLevelColor(item.level)"
                      size="small"
                      variant="flat"
                    >
                      {{ getLevelText(item.level) }}
                    </v-chip>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editObjectiveType(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteObjectiveType(item.type_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Категории KPI -->
          <template v-if="selectedStrategySection === 'kpi-categories'">
            <v-card variant="outlined">
              <v-card-title>Категории KPI</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка категорий для организации ключевых показателей эффективности
                </v-alert>

                <v-data-table
                  :headers="kpiCategoryHeaders"
                  :items="kpiCategories"
                  class="elevation-1"
                  item-value="category_id"
                >
                  <template #item.color="{ item }">
                    <div class="d-flex align-center">
                      <div
                        :style="{ backgroundColor: item.color }"
                        class="color-preview me-2"
                      ></div>
                      {{ item.color }}
                    </div>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editKPICategory(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteKPICategory(item.category_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Правила связывания -->
          <template v-if="selectedStrategySection === 'linking-rules'">
            <v-card variant="outlined">
              <v-card-title>Правила связывания</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка автоматических правил связывания целей с активностями, бюджетами и инвестициями
                </v-alert>
                <!-- TODO: Реализовать правила связывания -->
                <v-alert type="info" variant="tonal">
                  Правила связывания будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Диалог создания периода -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Создать новый период</v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="isFormValid">
            <v-text-field
              v-model="newPeriod.name"
              label="Название периода"
              variant="outlined"
              :rules="[v => !!v || 'Название обязательно']"
              required
            />
            <v-select
              v-model="newPeriod.period_type"
              :items="periodTypeOptions"
              label="Тип периода"
              variant="outlined"
              :rules="[v => !!v || 'Тип обязателен']"
              required
            />
            <v-text-field
              v-model="newPeriod.start_date"
              label="Дата начала"
              type="date"
              variant="outlined"
              :rules="[v => !!v || 'Дата начала обязательна']"
              required
            />
            <v-text-field
              v-model="newPeriod.end_date"
              label="Дата окончания"
              type="date"
              variant="outlined"
              :rules="[v => !!v || 'Дата окончания обязательна']"
              required
            />
            <v-switch
              v-model="newPeriod.is_active"
              label="Активный период"
              color="primary"
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
            @click="createPeriod"
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

const selectedStrategySection = ref('periods')
const showCreateDialog = ref(false)
const isFormValid = ref(false)
const isSaving = ref(false)

const newPeriod = ref({
  name: '',
  period_type: '',
  start_date: '',
  end_date: '',
  is_active: true
})

const strategySections = ref([
  {
    id: 'periods',
    title: 'Периоды планирования',
    icon: 'mdi-calendar-range',
    badge: null
  },
  {
    id: 'objective-types',
    title: 'Типы целей',
    icon: 'mdi-bullseye-arrow',
    badge: null
  },
  {
    id: 'kpi-categories',
    title: 'Категории KPI',
    icon: 'mdi-tag-multiple',
    badge: null
  },
  {
    id: 'linking-rules',
    title: 'Правила связывания',
    icon: 'mdi-link-variant',
    badge: 'Soon'
  }
])

const periodHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Тип', key: 'period_type', sortable: true },
  { title: 'Начало', key: 'start_date', sortable: true },
  { title: 'Окончание', key: 'end_date', sortable: true },
  { title: 'Активный', key: 'is_active', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const objectiveTypeHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Уровень', key: 'level', sortable: true },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const kpiCategoryHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Цвет', key: 'color', sortable: false },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const periods = ref([
  {
    period_id: '1',
    name: '2025-Q1',
    period_type: 'quarterly',
    start_date: '2025-01-01',
    end_date: '2025-03-31',
    is_active: true
  },
  {
    period_id: '2',
    name: '2025',
    period_type: 'annual',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    is_active: true
  }
])

const objectiveTypes = ref([
  {
    type_id: '1',
    name: 'Финансовые цели',
    level: 'corporate',
    description: 'Цели связанные с доходами и прибыльностью'
  },
  {
    type_id: '2',
    name: 'Маркетинговые цели',
    level: 'marketing',
    description: 'Цели маркетинговых кампаний и привлечения клиентов'
  }
])

const kpiCategories = ref([
  {
    category_id: '1',
    name: 'Реклама',
    color: '#2196F3',
    description: 'Показатели рекламных кампаний'
  },
  {
    category_id: '2',
    name: 'Конверсия',
    color: '#4CAF50',
    description: 'Показатели конверсии и эффективности'
  }
])

const periodTypeOptions = [
  { title: 'Месячный', value: 'monthly' },
  { title: 'Квартальный', value: 'quarterly' },
  { title: 'Полугодовой', value: 'semi-annual' },
  { title: 'Годовой', value: 'annual' }
]

// Helper functions
const getPeriodTypeColor = (type) => {
  const colors = {
    'monthly': 'blue',
    'quarterly': 'green',
    'semi-annual': 'orange',
    'annual': 'purple'
  }
  return colors[type] || 'grey'
}

const getPeriodTypeText = (type) => {
  const texts = {
    'monthly': 'Месячный',
    'quarterly': 'Квартальный',
    'semi-annual': 'Полугодовой',
    'annual': 'Годовой'
  }
  return texts[type] || type
}

const getLevelColor = (level) => {
  const colors = {
    'corporate': 'purple',
    'marketing': 'blue',
    'team': 'green'
  }
  return colors[level] || 'grey'
}

const getLevelText = (level) => {
  const texts = {
    'corporate': 'Корпоративный',
    'marketing': 'Маркетинговый',
    'team': 'Командный'
  }
  return texts[level] || level
}

// CRUD methods
const createPeriod = async () => {
  try {
    isSaving.value = true
    console.log('Создание периода:', newPeriod.value)
    appStore.showSuccess('Период создан успешно')
    showCreateDialog.value = false
    newPeriod.value = {
      name: '',
      period_type: '',
      start_date: '',
      end_date: '',
      is_active: true
    }
  } catch (error) {
    console.error('Error creating period:', error)
    appStore.showError('Ошибка создания периода')
  } finally {
    isSaving.value = false
  }
}

const updatePeriod = async (period) => {
  try {
    console.log('Обновление периода:', period)
    appStore.showSuccess('Период обновлен')
  } catch (error) {
    console.error('Error updating period:', error)
    appStore.showError('Ошибка обновления периода')
  }
}

const editPeriod = (period) => {
  console.log('Редактирование периода:', period)
}

const deletePeriod = async (periodId) => {
  try {
    console.log('Удаление периода:', periodId)
    appStore.showSuccess('Период удален')
  } catch (error) {
    console.error('Error deleting period:', error)
    appStore.showError('Ошибка удаления периода')
  }
}

const editObjectiveType = (objectiveType) => {
  console.log('Редактирование типа цели:', objectiveType)
}

const deleteObjectiveType = async (typeId) => {
  try {
    console.log('Удаление типа цели:', typeId)
    appStore.showSuccess('Тип цели удален')
  } catch (error) {
    console.error('Error deleting objective type:', error)
    appStore.showError('Ошибка удаления типа цели')
  }
}

const editKPICategory = (category) => {
  console.log('Редактирование категории KPI:', category)
}

const deleteKPICategory = async (categoryId) => {
  try {
    console.log('Удаление категории KPI:', categoryId)
    appStore.showSuccess('Категория KPI удалена')
  } catch (error) {
    console.error('Error deleting KPI category:', error)
    appStore.showError('Ошибка удаления категории KPI')
  }
}
</script>

<style scoped>
.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}
</style>