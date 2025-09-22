<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-chart-line</v-icon>
      Настройки бюджетов и инвестиций
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Создать колонку
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Вложенное меню настроек бюджетов ---->
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-list nav density="compact">
              <v-list-subheader>Настройки бюджетов</v-list-subheader>

              <v-list-item
                v-for="item in budgetSections"
                :key="item.id"
                :value="item.id"
                :active="selectedBudgetSection === item.id"
                @click="selectedBudgetSection = item.id"
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

        <!-- Контент настроек бюджетов ---->
        <v-col cols="12" md="8">
          <!-- Настройки колонок ---->
          <template v-if="selectedBudgetSection === 'columns'">
            <v-card variant="outlined">
              <v-card-title>Настройки колонок бюджетов</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка отображения и типов колонок в таблицах бюджетов
                </v-alert>

                <v-data-table
                  :headers="columnHeaders"
                  :items="budgetColumns"
                  class="elevation-1"
                  item-value="column_id"
                >
                  <template #item.data_type="{ item }">
                    <v-chip
                      :color="getDataTypeColor(item.data_type)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getDataTypeText(item.data_type) }}
                    </v-chip>
                  </template>

                  <template #item.is_visible="{ item }">
                    <v-switch
                      v-model="item.is_visible"
                      color="primary"
                      hide-details
                      @change="updateBudgetColumn(item)"
                    />
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editBudgetColumn(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteBudgetColumn(item.column_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Теги статусов прогнозов ---->
          <template v-if="selectedBudgetSection === 'forecast-tags'">
            <v-card variant="outlined">
              <v-card-title>Теги статусов прогнозов</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Управление тегами для статусов и категорий прогнозов
                </v-alert>

                <v-data-table
                  :headers="forecastTagHeaders"
                  :items="forecastTags"
                  class="elevation-1"
                  item-value="tag_id"
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
                      @click="editForecastTag(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteForecastTag(item.tag_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Теги сценариев ---->
          <template v-if="selectedBudgetSection === 'scenario-tags'">
            <v-card variant="outlined">
              <v-card-title>Теги сценариев</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Управление тегами для различных сценариев бюджетирования
                </v-alert>

                <v-data-table
                  :headers="scenarioTagHeaders"
                  :items="scenarioTags"
                  class="elevation-1"
                  item-value="tag_id"
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
                      @click="editScenarioTag(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteScenarioTag(item.tag_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Валюты и курсы ---->
          <template v-if="selectedBudgetSection === 'currencies'">
            <v-card variant="outlined">
              <v-card-title>Валюты и курсы</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка валют и обменных курсов для многовалютного бюджетирования
                </v-alert>
                <!-- TODO: Реализовать управление валютами -->
                <v-alert type="info" variant="tonal">
                  Управление валютами будет добавлено позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Правила утверждения ---->
          <template v-if="selectedBudgetSection === 'approval-rules'">
            <v-card variant="outlined">
              <v-card-title>Правила утверждения</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка автоматических правил утверждения бюджетов и инвестиций
                </v-alert>
                <!-- TODO: Реализовать правила утверждения -->
                <v-alert type="info" variant="tonal">
                  Правила утверждения будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Шаблоны бюджетов ---->
          <template v-if="selectedBudgetSection === 'templates'">
            <v-card variant="outlined">
              <v-card-title>Шаблоны бюджетов</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Управление шаблонами для быстрого создания бюджетов
                </v-alert>
                <!-- TODO: Реализовать шаблоны -->
                <v-alert type="info" variant="tonal">
                  Шаблоны бюджетов будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Диалог создания колонки -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Создать новую колонку бюджета</v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="isFormValid">
            <v-text-field
              v-model="newColumn.name"
              label="Название колонки"
              variant="outlined"
              :rules="[v => !!v || 'Название обязательно']"
              required
            />
            <v-select
              v-model="newColumn.data_type"
              :items="dataTypeOptions"
              label="Тип данных"
              variant="outlined"
              :rules="[v => !!v || 'Тип обязателен']"
              required
            />
            <v-text-field
              v-model="newColumn.default_value"
              label="Значение по умолчанию"
              variant="outlined"
            />
            <v-switch
              v-model="newColumn.is_visible"
              label="Видимая по умолчанию"
              color="primary"
            />
            <v-switch
              v-model="newColumn.is_editable"
              label="Редактируемая"
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
            @click="createBudgetColumn"
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

const selectedBudgetSection = ref('columns')
const showCreateDialog = ref(false)
const isFormValid = ref(false)
const isSaving = ref(false)

const newColumn = ref({
  name: '',
  data_type: '',
  default_value: '',
  is_visible: true,
  is_editable: true
})

const budgetSections = ref([
  {
    id: 'columns',
    title: 'Настройки колонок',
    icon: 'mdi-table-column',
    badge: null
  },
  {
    id: 'forecast-tags',
    title: 'Теги прогнозов',
    icon: 'mdi-tag',
    badge: null
  },
  {
    id: 'scenario-tags',
    title: 'Теги сценариев',
    icon: 'mdi-tag-multiple',
    badge: null
  },
  {
    id: 'currencies',
    title: 'Валюты и курсы',
    icon: 'mdi-wallet',
    badge: 'Soon'
  },
  {
    id: 'approval-rules',
    title: 'Правила утверждения',
    icon: 'mdi-check-circle',
    badge: 'Soon'
  },
  {
    id: 'templates',
    title: 'Шаблоны бюджетов',
    icon: 'mdi-file-document-multiple',
    badge: 'Soon'
  }
])

const columnHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Тип данных', key: 'data_type', sortable: true },
  { title: 'По умолчанию', key: 'default_value', sortable: false },
  { title: 'Видимая', key: 'is_visible', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const forecastTagHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Цвет', key: 'color', sortable: false },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const scenarioTagHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Цвет', key: 'color', sortable: false },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const budgetColumns = ref([
  {
    column_id: '1',
    name: 'Q1 План',
    data_type: 'currency',
    default_value: '0',
    is_visible: true,
    is_editable: true
  },
  {
    column_id: '2',
    name: 'Q1 Факт',
    data_type: 'currency',
    default_value: '0',
    is_visible: true,
    is_editable: false
  },
  {
    column_id: '3',
    name: 'Статус',
    data_type: 'text',
    default_value: 'Планируется',
    is_visible: true,
    is_editable: true
  }
])

const forecastTags = ref([
  {
    tag_id: '1',
    name: 'Уверенный прогноз',
    color: '#4CAF50',
    description: 'Высокая степень уверенности в прогнозе'
  },
  {
    tag_id: '2',
    name: 'Предварительный',
    color: '#FF9800',
    description: 'Предварительная оценка, требует уточнения'
  },
  {
    tag_id: '3',
    name: 'Риск',
    color: '#F44336',
    description: 'Прогноз с высокой степенью риска'
  }
])

const scenarioTags = ref([
  {
    tag_id: '1',
    name: 'Базовый сценарий',
    color: '#2196F3',
    description: 'Основной план развития'
  },
  {
    tag_id: '2',
    name: 'Оптимистичный',
    color: '#4CAF50',
    description: 'Лучший возможный исход'
  },
  {
    tag_id: '3',
    name: 'Пессимистичный',
    color: '#FF5722',
    description: 'Худший возможный исход'
  }
])

const dataTypeOptions = ref([
  { title: 'Валюта', value: 'currency' },
  { title: 'Число', value: 'number' },
  { title: 'Текст', value: 'text' },
  { title: 'Дата', value: 'date' },
  { title: 'Процент', value: 'percentage' }
])

// Helper functions
const getDataTypeColor = (type) => {
  const colors = {
    'currency': 'green',
    'number': 'blue',
    'text': 'grey',
    'date': 'orange',
    'percentage': 'purple'
  }
  return colors[type] || 'grey'
}

const getDataTypeText = (type) => {
  const texts = {
    'currency': 'Валюта',
    'number': 'Число',
    'text': 'Текст',
    'date': 'Дата',
    'percentage': 'Процент'
  }
  return texts[type] || type
}

// CRUD methods
const createBudgetColumn = async () => {
  try {
    isSaving.value = true
    console.log('Создание колонки бюджета:', newColumn.value)
    appStore.showSuccess('Колонка бюджета создана успешно')
    showCreateDialog.value = false
    newColumn.value = {
      name: '',
      data_type: '',
      default_value: '',
      is_visible: true,
      is_editable: true
    }
  } catch (error) {
    console.error('Error creating budget column:', error)
    appStore.showError('Ошибка создания колонки бюджета')
  } finally {
    isSaving.value = false
  }
}

const updateBudgetColumn = async (column) => {
  try {
    console.log('Обновление колонки бюджета:', column)
    appStore.showSuccess('Колонка бюджета обновлена')
  } catch (error) {
    console.error('Error updating budget column:', error)
    appStore.showError('Ошибка обновления колонки бюджета')
  }
}

const editBudgetColumn = (column) => {
  console.log('Редактирование колонки бюджета:', column)
}

const deleteBudgetColumn = async (columnId) => {
  try {
    console.log('Удаление колонки бюджета:', columnId)
    appStore.showSuccess('Колонка бюджета удалена')
  } catch (error) {
    console.error('Error deleting budget column:', error)
    appStore.showError('Ошибка удаления колонки бюджета')
  }
}

const editForecastTag = (tag) => {
  console.log('Редактирование тега прогноза:', tag)
}

const deleteForecastTag = async (tagId) => {
  try {
    console.log('Удаление тега прогноза:', tagId)
    appStore.showSuccess('Тег прогноза удален')
  } catch (error) {
    console.error('Error deleting forecast tag:', error)
    appStore.showError('Ошибка удаления тега прогноза')
  }
}

const editScenarioTag = (tag) => {
  console.log('Редактирование тега сценария:', tag)
}

const deleteScenarioTag = async (tagId) => {
  try {
    console.log('Удаление тега сценария:', tagId)
    appStore.showSuccess('Тег сценария удален')
  } catch (error) {
    console.error('Error deleting scenario tag:', error)
    appStore.showError('Ошибка удаления тега сценария')
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