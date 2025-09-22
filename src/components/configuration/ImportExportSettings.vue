<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-import</v-icon>
      Настройки импорта и экспорта
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Создать шаблон
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Вложенное меню настроек импорта/экспорта -->
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-list nav density="compact">
              <v-list-subheader>Настройки импорта/экспорта</v-list-subheader>

              <v-list-item
                v-for="item in importExportSections"
                :key="item.id"
                :value="item.id"
                :active="selectedImportExportSection === item.id"
                @click="selectedImportExportSection = item.id"
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

        <!-- Контент настроек импорта/экспорта -->
        <v-col cols="12" md="8">
          <!-- Шаблоны импорта -->
          <template v-if="selectedImportExportSection === 'import-templates'">
            <v-card variant="outlined">
              <v-card-title>Шаблоны импорта</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Управление шаблонами для импорта данных из внешних источников
                </v-alert>

                <v-data-table
                  :headers="templateHeaders"
                  :items="importTemplates"
                  class="elevation-1"
                  item-value="template_id"
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

                  <template #item.status="{ item }">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      size="small"
                      variant="flat"
                    >
                      {{ getStatusText(item.status) }}
                    </v-chip>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-download"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="downloadTemplate(item)"
                    />
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editTemplate(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteTemplate(item.template_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Запланированные импорты -->
          <template v-if="selectedImportExportSection === 'scheduled-imports'">
            <v-card variant="outlined">
              <v-card-title>Запланированные импорты</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Управление автоматическими импортами данных по расписанию
                </v-alert>

                <v-data-table
                  :headers="scheduledHeaders"
                  :items="scheduledImports"
                  class="elevation-1"
                  item-value="schedule_id"
                >
                  <template #item.frequency="{ item }">
                    <v-chip
                      :color="getFrequencyColor(item.frequency)"
                      size="small"
                      variant="outlined"
                    >
                      {{ getFrequencyText(item.frequency) }}
                    </v-chip>
                  </template>

                  <template #item.is_active="{ item }">
                    <v-switch
                      v-model="item.is_active"
                      color="primary"
                      hide-details
                      @change="updateScheduledImport(item)"
                    />
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-play"
                      size="small"
                      variant="text"
                      color="success"
                      @click="runScheduledImport(item)"
                    />
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editScheduledImport(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteScheduledImport(item.schedule_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- История импорта -->
          <template v-if="selectedImportExportSection === 'import-history'">
            <v-card variant="outlined">
              <v-card-title>История импорта</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Журнал выполненных операций импорта и их результаты
                </v-alert>

                <v-data-table
                  :headers="historyHeaders"
                  :items="importHistory"
                  class="elevation-1"
                  item-value="import_id"
                >
                  <template #item.status="{ item }">
                    <v-chip
                      :color="getImportStatusColor(item.status)"
                      size="small"
                      variant="flat"
                    >
                      {{ getImportStatusText(item.status) }}
                    </v-chip>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-eye"
                      size="small"
                      variant="text"
                      @click="viewImportDetails(item)"
                    />
                    <v-btn
                      icon="mdi-download"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="downloadImportLog(item)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Настройки экспорта -->
          <template v-if="selectedImportExportSection === 'export-settings'">
            <v-card variant="outlined">
              <v-card-title>Настройки экспорта</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Конфигурация параметров экспорта данных
                </v-alert>
                <!-- TODO: Реализовать настройки экспорта -->
                <v-alert type="info" variant="tonal">
                  Настройки экспорта будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Интеграции -->
          <template v-if="selectedImportExportSection === 'integrations'">
            <v-card variant="outlined">
              <v-card-title>Интеграции</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка интеграций с внешними системами и API
                </v-alert>
                <!-- TODO: Реализовать интеграции -->
                <v-alert type="info" variant="tonal">
                  Интеграции будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Валидация данных -->
          <template v-if="selectedImportExportSection === 'validation'">
            <v-card variant="outlined">
              <v-card-title>Правила валидации</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка правил проверки данных при импорте
                </v-alert>
                <!-- TODO: Реализовать валидацию -->
                <v-alert type="info" variant="tonal">
                  Правила валидации будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Диалог создания шаблона -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Создать новый шаблон импорта</v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="isFormValid">
            <v-text-field
              v-model="newTemplate.name"
              label="Название шаблона"
              variant="outlined"
              :rules="[v => !!v || 'Название обязательно']"
              required
            />
            <v-select
              v-model="newTemplate.data_type"
              :items="dataTypeOptions"
              label="Тип данных"
              variant="outlined"
              :rules="[v => !!v || 'Тип обязателен']"
              required
            />
            <v-textarea
              v-model="newTemplate.description"
              label="Описание"
              variant="outlined"
              rows="3"
            />
            <v-select
              v-model="newTemplate.file_format"
              :items="fileFormatOptions"
              label="Формат файла"
              variant="outlined"
              :rules="[v => !!v || 'Формат обязателен']"
              required
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
            @click="createTemplate"
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

const selectedImportExportSection = ref('import-templates')
const showCreateDialog = ref(false)
const isFormValid = ref(false)
const isSaving = ref(false)

const newTemplate = ref({
  name: '',
  data_type: '',
  description: '',
  file_format: ''
})

const importExportSections = ref([
  {
    id: 'import-templates',
    title: 'Шаблоны импорта',
    icon: 'mdi-file-import',
    badge: null
  },
  {
    id: 'scheduled-imports',
    title: 'Запланированные импорты',
    icon: 'mdi-clock',
    badge: null
  },
  {
    id: 'import-history',
    title: 'История импорта',
    icon: 'mdi-history',
    badge: null
  },
  {
    id: 'export-settings',
    title: 'Настройки экспорта',
    icon: 'mdi-export',
    badge: 'Soon'
  },
  {
    id: 'integrations',
    title: 'Интеграции',
    icon: 'mdi-api',
    badge: 'Soon'
  },
  {
    id: 'validation',
    title: 'Валидация данных',
    icon: 'mdi-check-circle',
    badge: 'Soon'
  }
])

const templateHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Тип данных', key: 'data_type', sortable: true },
  { title: 'Формат', key: 'file_format', sortable: true },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Создан', key: 'created_date', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

const scheduledHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Шаблон', key: 'template_name', sortable: true },
  { title: 'Частота', key: 'frequency', sortable: true },
  { title: 'Следующий запуск', key: 'next_run', sortable: true },
  { title: 'Активный', key: 'is_active', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const historyHeaders = [
  { title: 'Файл', key: 'filename', sortable: true },
  { title: 'Шаблон', key: 'template_name', sortable: true },
  { title: 'Дата импорта', key: 'import_date', sortable: true },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Записей', key: 'records_processed', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

const importTemplates = ref([
  {
    template_id: '1',
    name: 'Шаблон бюджетов',
    data_type: 'budgets',
    file_format: 'Excel',
    status: 'active',
    created_date: '2025-01-15'
  },
  {
    template_id: '2',
    name: 'Шаблон активностей',
    data_type: 'activities',
    file_format: 'CSV',
    status: 'active',
    created_date: '2025-01-10'
  },
  {
    template_id: '3',
    name: 'Шаблон KPI',
    data_type: 'kpis',
    file_format: 'Excel',
    status: 'draft',
    created_date: '2025-01-20'
  }
])

const scheduledImports = ref([
  {
    schedule_id: '1',
    name: 'Ежедневный импорт бюджетов',
    template_name: 'Шаблон бюджетов',
    frequency: 'daily',
    next_run: '2025-01-23 09:00',
    is_active: true
  },
  {
    schedule_id: '2',
    name: 'Еженедельный импорт активностей',
    template_name: 'Шаблон активностей',
    frequency: 'weekly',
    next_run: '2025-01-27 08:00',
    is_active: true
  },
  {
    schedule_id: '3',
    name: 'Месячный импорт KPI',
    template_name: 'Шаблон KPI',
    frequency: 'monthly',
    next_run: '2025-02-01 10:00',
    is_active: false
  }
])

const importHistory = ref([
  {
    import_id: '1',
    filename: 'budgets_2025_q1.xlsx',
    template_name: 'Шаблон бюджетов',
    import_date: '2025-01-22 09:15',
    status: 'success',
    records_processed: 156
  },
  {
    import_id: '2',
    filename: 'activities_jan.csv',
    template_name: 'Шаблон активностей',
    import_date: '2025-01-21 14:30',
    status: 'success',
    records_processed: 43
  },
  {
    import_id: '3',
    filename: 'kpi_data.xlsx',
    template_name: 'Шаблон KPI',
    import_date: '2025-01-20 11:45',
    status: 'error',
    records_processed: 0
  }
])

const dataTypeOptions = ref([
  { title: 'Бюджеты', value: 'budgets' },
  { title: 'Активности', value: 'activities' },
  { title: 'KPI', value: 'kpis' },
  { title: 'Инвестиции', value: 'investments' },
  { title: 'Фактические данные', value: 'actuals' },
  { title: 'Пользователи', value: 'users' }
])

const fileFormatOptions = ref([
  { title: 'Excel (.xlsx)', value: 'Excel' },
  { title: 'CSV (.csv)', value: 'CSV' },
  { title: 'JSON (.json)', value: 'JSON' },
  { title: 'XML (.xml)', value: 'XML' }
])

// Helper functions
const getDataTypeColor = (type) => {
  const colors = {
    'budgets': 'green',
    'activities': 'blue',
    'kpis': 'orange',
    'investments': 'purple',
    'actuals': 'teal',
    'users': 'pink'
  }
  return colors[type] || 'grey'
}

const getDataTypeText = (type) => {
  const texts = {
    'budgets': 'Бюджеты',
    'activities': 'Активности',
    'kpis': 'KPI',
    'investments': 'Инвестиции',
    'actuals': 'Факты',
    'users': 'Пользователи'
  }
  return texts[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    'active': 'green',
    'draft': 'orange',
    'archived': 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'active': 'Активный',
    'draft': 'Черновик',
    'archived': 'Архивный'
  }
  return texts[status] || status
}

const getFrequencyColor = (frequency) => {
  const colors = {
    'daily': 'blue',
    'weekly': 'green',
    'monthly': 'orange',
    'quarterly': 'purple'
  }
  return colors[frequency] || 'grey'
}

const getFrequencyText = (frequency) => {
  const texts = {
    'daily': 'Ежедневно',
    'weekly': 'Еженедельно',
    'monthly': 'Ежемесячно',
    'quarterly': 'Ежеквартально'
  }
  return texts[frequency] || frequency
}

const getImportStatusColor = (status) => {
  const colors = {
    'success': 'green',
    'error': 'red',
    'warning': 'orange',
    'processing': 'blue'
  }
  return colors[status] || 'grey'
}

const getImportStatusText = (status) => {
  const texts = {
    'success': 'Успешно',
    'error': 'Ошибка',
    'warning': 'С предупреждениями',
    'processing': 'Обрабатывается'
  }
  return texts[status] || status
}

// CRUD methods
const createTemplate = async () => {
  try {
    isSaving.value = true
    console.log('Создание шаблона импорта:', newTemplate.value)
    appStore.showSuccess('Шаблон импорта создан успешно')
    showCreateDialog.value = false
    newTemplate.value = {
      name: '',
      data_type: '',
      description: '',
      file_format: ''
    }
  } catch (error) {
    console.error('Error creating template:', error)
    appStore.showError('Ошибка создания шаблона импорта')
  } finally {
    isSaving.value = false
  }
}

const downloadTemplate = (template) => {
  console.log('Скачивание шаблона:', template)
  appStore.showSuccess('Шаблон скачан')
}

const editTemplate = (template) => {
  console.log('Редактирование шаблона:', template)
}

const deleteTemplate = async (templateId) => {
  try {
    console.log('Удаление шаблона:', templateId)
    appStore.showSuccess('Шаблон удален')
  } catch (error) {
    console.error('Error deleting template:', error)
    appStore.showError('Ошибка удаления шаблона')
  }
}

const updateScheduledImport = async (scheduledImport) => {
  try {
    console.log('Обновление запланированного импорта:', scheduledImport)
    appStore.showSuccess('Запланированный импорт обновлен')
  } catch (error) {
    console.error('Error updating scheduled import:', error)
    appStore.showError('Ошибка обновления запланированного импорта')
  }
}

const runScheduledImport = (scheduledImport) => {
  console.log('Запуск импорта:', scheduledImport)
  appStore.showSuccess('Импорт запущен')
}

const editScheduledImport = (scheduledImport) => {
  console.log('Редактирование запланированного импорта:', scheduledImport)
}

const deleteScheduledImport = async (scheduleId) => {
  try {
    console.log('Удаление запланированного импорта:', scheduleId)
    appStore.showSuccess('Запланированный импорт удален')
  } catch (error) {
    console.error('Error deleting scheduled import:', error)
    appStore.showError('Ошибка удаления запланированного импорта')
  }
}

const viewImportDetails = (importRecord) => {
  console.log('Просмотр деталей импорта:', importRecord)
}

const downloadImportLog = (importRecord) => {
  console.log('Скачивание лога импорта:', importRecord)
  appStore.showSuccess('Лог скачан')
}
</script>