<template>
  <v-card flat>
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-cog" color="primary" class="me-2"/>
        <span class="text-h6">Настройки бюджетов</span>
      </div>
      <v-chip
        :color="hasUnsavedChanges ? 'warning' : 'success'"
        variant="flat"
        size="small"
      >
        {{ hasUnsavedChanges ? 'Есть несохраненные изменения' : 'Сохранено' }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-0">
      <v-row class="ma-0 h-100">
        <!-- Левая панель: Категории настроек -->
        <v-col cols="3" class="pa-0 border-end">
          <div class="settings-nav h-100">
            <v-list nav density="compact" class="py-0">
              <v-list-item
                v-for="category in settingsCategories"
                :key="category.key"
                :value="category.key"
                :active="selectedCategory === category.key"
                @click="selectCategory(category.key)"
                class="border-bottom"
              >
                <template #prepend>
                  <v-icon :icon="category.icon" class="me-2"/>
                </template>
                <v-list-item-title class="text-body-2">{{ category.title }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ category.description }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </v-col>

        <!-- Правая панель: Настройки -->
        <v-col cols="9" class="pa-0">
          <div class="settings-content h-100">
            <!-- Заголовок категории -->
            <div class="pa-4 border-bottom bg-surface-variant">
              <h3 class="text-h6 mb-1">{{ getCurrentCategory()?.title }}</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ getCurrentCategory()?.description }}
              </p>
            </div>

            <v-card-text class="pa-4" style="overflow-y: auto;">
              <!-- Общие настройки -->
              <div v-if="selectedCategory === 'general'">
                <v-expansion-panels variant="accordion" multiple v-model="expandedPanels">
                  <v-expansion-panel value="fiscal-year">
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-calendar" class="me-2"/>
                      Финансовый год
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="6">
                          <v-select
                            v-model="settings.defaultFiscalYear"
                            :items="fiscalYearOptions"
                            label="Финансовый год по умолчанию"
                            variant="outlined"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-select
                            v-model="settings.fiscalYearStart"
                            :items="monthOptions"
                            label="Начало финансового года"
                            variant="outlined"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

                  <v-expansion-panel value="currency">
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-currency-rub" class="me-2"/>
                      Валюта
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="6">
                          <v-select
                            v-model="settings.defaultCurrency"
                            :items="currencyOptions"
                            label="Валюта по умолчанию"
                            variant="outlined"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-switch
                            v-model="settings.enableMultiCurrency"
                            label="Поддержка мультивалютности"
                            color="primary"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

                  <v-expansion-panel value="formatting">
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-format-text" class="me-2"/>
                      Форматирование
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="6">
                          <v-select
                            v-model="settings.numberFormat"
                            :items="numberFormatOptions"
                            label="Формат чисел"
                            variant="outlined"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-select
                            v-model="settings.dateFormat"
                            :items="dateFormatOptions"
                            label="Формат даты"
                            variant="outlined"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <!-- Настройки иерархии -->
              <div v-if="selectedCategory === 'hierarchy'">
                <v-expansion-panels variant="accordion" multiple v-model="expandedPanels">
                  <v-expansion-panel value="structure">
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-file-tree" class="me-2"/>
                      Структура иерархии
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="6">
                          <v-text-field
                            v-model="settings.maxHierarchyLevels"
                            label="Максимальное количество уровней"
                            type="number"
                            variant="outlined"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-switch
                            v-model="settings.allowCrossReferences"
                            label="Разрешить перекрестные ссылки"
                            color="primary"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

                  <v-expansion-panel value="naming">
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-tag" class="me-2"/>
                      Правила именования
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.namingPattern"
                            label="Шаблон именования (regex)"
                            variant="outlined"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-switch
                            v-model="settings.enforceUniqueNames"
                            label="Уникальные имена в рамках уровня"
                            color="primary"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-switch
                            v-model="settings.autoGenerateIds"
                            label="Автогенерация ID"
                            color="primary"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <!-- Настройки доступа -->
              <div v-if="selectedCategory === 'access'">
                <v-expansion-panels variant="accordion" multiple v-model="expandedPanels">
                  <v-expansion-panel value="permissions">
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-shield-account" class="me-2"/>
                      Права доступа
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-data-table
                        :headers="permissionHeaders"
                        :items="rolePermissions"
                        density="compact"
                        hide-default-footer
                      >
                        <template #item.create="{ item }">
                          <v-switch
                            v-model="item.create"
                            color="primary"
                            density="compact"
                            hide-details
                            @update:model-value="markAsChanged"
                          />
                        </template>
                        <template #item.read="{ item }">
                          <v-switch
                            v-model="item.read"
                            color="primary"
                            density="compact"
                            hide-details
                            @update:model-value="markAsChanged"
                          />
                        </template>
                        <template #item.update="{ item }">
                          <v-switch
                            v-model="item.update"
                            color="primary"
                            density="compact"
                            hide-details
                            @update:model-value="markAsChanged"
                          />
                        </template>
                        <template #item.delete="{ item }">
                          <v-switch
                            v-model="item.delete"
                            color="primary"
                            density="compact"
                            hide-details
                            @update:model-value="markAsChanged"
                          />
                        </template>
                      </v-data-table>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

                  <v-expansion-panel value="approval">
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-check-circle" class="me-2"/>
                      Утверждения
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="6">
                          <v-text-field
                            v-model="settings.approvalThreshold"
                            label="Лимит для автоутверждения"
                            type="number"
                            variant="outlined"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-switch
                            v-model="settings.requireApprovalForTransfers"
                            label="Обязательное утверждение трансферов"
                            color="primary"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <!-- Интеграции -->
              <div v-if="selectedCategory === 'integrations'">
                <v-expansion-panels variant="accordion" multiple v-model="expandedPanels">
                  <v-expansion-panel value="kreola">
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-sync" class="me-2"/>
                      Интеграция с Kreola
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="6">
                          <v-switch
                            v-model="settings.kreolaIntegrationEnabled"
                            label="Включить интеграцию с Kreola"
                            color="primary"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-select
                            v-model="settings.kreolaSyncFrequency"
                            :items="syncFrequencyOptions"
                            label="Частота синхронизации"
                            variant="outlined"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.kreolaApiUrl"
                            label="URL API Kreola"
                            variant="outlined"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

                  <v-expansion-panel value="external">
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-cloud-sync" class="me-2"/>
                      Внешние системы
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="6">
                          <v-switch
                            v-model="settings.sapIntegration"
                            label="Интеграция с SAP"
                            color="primary"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-switch
                            v-model="settings.excelImportEnabled"
                            label="Импорт из Excel"
                            color="primary"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <!-- Уведомления -->
              <div v-if="selectedCategory === 'notifications'">
                <v-expansion-panels variant="accordion" multiple v-model="expandedPanels">
                  <v-expansion-panel value="email">
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-email" class="me-2"/>
                      Email уведомления
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="6">
                          <v-switch
                            v-model="settings.emailNotificationsEnabled"
                            label="Включить email уведомления"
                            color="primary"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-text-field
                            v-model="settings.emailServer"
                            label="SMTP сервер"
                            variant="outlined"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

                  <v-expansion-panel value="alerts">
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-bell" class="me-2"/>
                      Оповещения
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="6">
                          <v-switch
                            v-model="settings.budgetExceededAlert"
                            label="Превышение бюджета"
                            color="primary"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-switch
                            v-model="settings.approvalPendingAlert"
                            label="Ожидающие утверждения"
                            color="primary"
                            @update:model-value="markAsChanged"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <!-- Кастомные поля -->
              <div v-if="selectedCategory === 'custom'">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="pa-3">
                    <v-icon icon="mdi-plus" class="me-2"/>
                    Добавить кастомное поле
                  </v-card-title>
                  <v-card-text class="pa-3">
                    <v-row>
                      <v-col cols="4">
                        <v-text-field
                          v-model="newCustomField.name"
                          label="Название поля"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="3">
                        <v-select
                          v-model="newCustomField.type"
                          :items="fieldTypeOptions"
                          label="Тип поля"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="3">
                        <v-switch
                          v-model="newCustomField.required"
                          label="Обязательное"
                          color="primary"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="2">
                        <v-btn
                          color="primary"
                          @click="addCustomField"
                          :disabled="!newCustomField.name || !newCustomField.type"
                          block
                        >
                          Добавить
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <v-data-table
                  :headers="customFieldHeaders"
                  :items="settings.customFields"
                  density="compact"
                >
                  <template #item.required="{ item }">
                    <v-icon
                      :icon="item.required ? 'mdi-check' : 'mdi-close'"
                      :color="item.required ? 'success' : 'error'"
                    />
                  </template>
                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-delete"
                      color="error"
                      variant="text"
                      size="small"
                      @click="removeCustomField(item)"
                    />
                  </template>
                </v-data-table>
              </div>

              <!-- Действия -->
              <div class="mt-6 d-flex justify-end">
                <v-btn
                  variant="outlined"
                  class="me-2"
                  @click="resetSettings"
                  :disabled="!hasUnsavedChanges"
                >
                  Сбросить
                </v-btn>
                <v-btn
                  color="primary"
                  @click="saveSettings"
                  :disabled="!hasUnsavedChanges"
                  :loading="isSaving"
                >
                  Сохранить настройки
                </v-btn>
              </div>
            </v-card-text>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  currentUser: {
    type: Object,
    default: () => ({})
  }
})

// Reactive data
const selectedCategory = ref('general')
const hasUnsavedChanges = ref(false)
const isSaving = ref(false)
const expandedPanels = ref(['fiscal-year', 'currency', 'formatting'])

// Настройки
const settings = ref({
  // Общие настройки
  defaultFiscalYear: 2025,
  fiscalYearStart: 'january',
  defaultCurrency: 'RUB',
  enableMultiCurrency: false,
  numberFormat: 'ru-RU',
  dateFormat: 'dd.MM.yyyy',

  // Иерархия
  maxHierarchyLevels: 5,
  allowCrossReferences: false,
  namingPattern: '^[A-Za-zА-Яа-я0-9\\s\\-_]+$',
  enforceUniqueNames: true,
  autoGenerateIds: true,

  // Доступ
  approvalThreshold: 100000,
  requireApprovalForTransfers: true,

  // Интеграции
  kreolaIntegrationEnabled: true,
  kreolaSyncFrequency: 'daily',
  kreolaApiUrl: 'https://api.kreola.com/v1',
  sapIntegration: false,
  excelImportEnabled: true,

  // Уведомления
  emailNotificationsEnabled: true,
  emailServer: 'smtp.company.com',
  budgetExceededAlert: true,
  approvalPendingAlert: true,

  // Кастомные поля
  customFields: [
    { name: 'Центр затрат', type: 'text', required: false },
    { name: 'Приоритет', type: 'select', required: false },
    { name: 'Планируемый ROI', type: 'number', required: false }
  ]
})

const originalSettings = ref({})

// Новое кастомное поле
const newCustomField = ref({
  name: '',
  type: '',
  required: false
})

// Категории настроек
const settingsCategories = [
  {
    key: 'general',
    title: 'Общие настройки',
    description: 'Основные параметры системы',
    icon: 'mdi-cog'
  },
  {
    key: 'hierarchy',
    title: 'Иерархия',
    description: 'Настройки структуры бюджетов',
    icon: 'mdi-file-tree'
  },
  {
    key: 'access',
    title: 'Доступ и права',
    description: 'Управление правами пользователей',
    icon: 'mdi-shield-account'
  },
  {
    key: 'integrations',
    title: 'Интеграции',
    description: 'Настройки внешних систем',
    icon: 'mdi-sync'
  },
  {
    key: 'notifications',
    title: 'Уведомления',
    description: 'Email и push уведомления',
    icon: 'mdi-bell'
  },
  {
    key: 'custom',
    title: 'Кастомные поля',
    description: 'Дополнительные поля форм',
    icon: 'mdi-form-textbox'
  }
]

// Опции для селектов
const fiscalYearOptions = [
  { title: '2024', value: 2024 },
  { title: '2025', value: 2025 },
  { title: '2026', value: 2026 }
]

const monthOptions = [
  { title: 'Январь', value: 'january' },
  { title: 'Апрель', value: 'april' },
  { title: 'Июль', value: 'july' },
  { title: 'Октябрь', value: 'october' }
]

const currencyOptions = [
  { title: 'Российский рубль (RUB)', value: 'RUB' },
  { title: 'Доллар США (USD)', value: 'USD' },
  { title: 'Евро (EUR)', value: 'EUR' }
]

const numberFormatOptions = [
  { title: 'Русский (1 234,56)', value: 'ru-RU' },
  { title: 'Английский (1,234.56)', value: 'en-US' },
  { title: 'Европейский (1.234,56)', value: 'de-DE' }
]

const dateFormatOptions = [
  { title: 'dd.MM.yyyy', value: 'dd.MM.yyyy' },
  { title: 'MM/dd/yyyy', value: 'MM/dd/yyyy' },
  { title: 'yyyy-MM-dd', value: 'yyyy-MM-dd' }
]

const syncFrequencyOptions = [
  { title: 'Ежечасно', value: 'hourly' },
  { title: 'Ежедневно', value: 'daily' },
  { title: 'Еженедельно', value: 'weekly' },
  { title: 'Вручную', value: 'manual' }
]

const fieldTypeOptions = [
  { title: 'Текст', value: 'text' },
  { title: 'Число', value: 'number' },
  { title: 'Дата', value: 'date' },
  { title: 'Выбор', value: 'select' },
  { title: 'Да/Нет', value: 'boolean' }
]

// Права доступа по ролям
const rolePermissions = ref([
  { role: 'Owner', create: true, read: true, update: true, delete: true },
  { role: 'Administrator', create: true, read: true, update: true, delete: false },
  { role: 'Editor', create: true, read: true, update: true, delete: false },
  { role: 'Editor - Data Entry Only', create: false, read: true, update: false, delete: false },
  { role: 'Viewer', create: false, read: true, update: false, delete: false }
])

const permissionHeaders = [
  { title: 'Роль', key: 'role', sortable: false },
  { title: 'Создание', key: 'create', sortable: false },
  { title: 'Чтение', key: 'read', sortable: false },
  { title: 'Редактирование', key: 'update', sortable: false },
  { title: 'Удаление', key: 'delete', sortable: false }
]

const customFieldHeaders = [
  { title: 'Название', key: 'name' },
  { title: 'Тип', key: 'type' },
  { title: 'Обязательное', key: 'required' },
  { title: 'Действия', key: 'actions', sortable: false }
]

// Computed properties
const getCurrentCategory = computed(() => {
  return settingsCategories.find(cat => cat.key === selectedCategory.value)
})

// Methods
const selectCategory = (categoryKey) => {
  selectedCategory.value = categoryKey
}

const markAsChanged = () => {
  hasUnsavedChanges.value = true
}

const saveSettings = async () => {
  try {
    isSaving.value = true

    // Симуляция сохранения
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Обновляем оригинальные настройки
    originalSettings.value = JSON.parse(JSON.stringify(settings.value))
    hasUnsavedChanges.value = false

    console.log('Settings saved:', settings.value)
  } catch (error) {
    console.error('Error saving settings:', error)
  } finally {
    isSaving.value = false
  }
}

const resetSettings = () => {
  settings.value = JSON.parse(JSON.stringify(originalSettings.value))
  hasUnsavedChanges.value = false
}

const addCustomField = () => {
  if (newCustomField.value.name && newCustomField.value.type) {
    settings.value.customFields.push({ ...newCustomField.value })
    newCustomField.value = { name: '', type: '', required: false }
    markAsChanged()
  }
}

const removeCustomField = (field) => {
  const index = settings.value.customFields.indexOf(field)
  if (index > -1) {
    settings.value.customFields.splice(index, 1)
    markAsChanged()
  }
}

onMounted(() => {
  // Сохраняем оригинальные настройки
  originalSettings.value = JSON.parse(JSON.stringify(settings.value))
})
</script>

<style scoped>
.settings-nav {
  border-right: 1px solid rgb(var(--v-border-color));
}

.settings-content {
  overflow: hidden;
}

.h-100 {
  height: 100vh;
  max-height: 80vh;
}
</style>