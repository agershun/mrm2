<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-form-textbox</v-icon>
      Атрибуты и поля
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Создать атрибут
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Вложенное меню настроек атрибутов -->
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-list nav density="compact">
              <v-list-subheader>Настройки атрибутов</v-list-subheader>

              <v-list-item
                v-for="item in attributeSections"
                :key="item.id"
                :value="item.id"
                :active="selectedAttributeSection === item.id"
                @click="selectedAttributeSection = item.id"
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

        <!-- Контент настроек атрибутов -->
        <v-col cols="12" md="8">
          <!-- Определения атрибутов -->
          <template v-if="selectedAttributeSection === 'definitions'">
            <v-card variant="outlined">
              <v-card-title>Определения атрибутов</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка пользовательских полей и атрибутов для активностей
                </v-alert>

                <v-data-table
                  :headers="attributeHeaders"
                  :items="attributes"
                  class="elevation-1"
                  item-value="attribute_id"
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

                  <template #item.is_required="{ item }">
                    <v-switch
                      v-model="item.is_required"
                      color="primary"
                      hide-details
                      @change="updateAttribute(item)"
                    />
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editAttribute(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteAttribute(item.attribute_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Списки значений -->
          <template v-if="selectedAttributeSection === 'list-options'">
            <v-card variant="outlined">
              <v-card-title>Списки значений</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Управление предопределенными значениями для атрибутов типа "список"
                </v-alert>

                <v-data-table
                  :headers="listOptionHeaders"
                  :items="listOptions"
                  class="elevation-1"
                  item-value="option_id"
                >
                  <template #item.attribute_name="{ item }">
                    <v-chip
                      color="blue"
                      size="small"
                      variant="outlined"
                    >
                      {{ item.attribute_name }}
                    </v-chip>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editListOption(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteListOption(item.option_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Зависимости между атрибутами -->
          <template v-if="selectedAttributeSection === 'dependencies'">
            <v-card variant="outlined">
              <v-card-title>Зависимости атрибутов</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка условий отображения и валидации между атрибутами
                </v-alert>

                <v-data-table
                  :headers="dependencyHeaders"
                  :items="dependencies"
                  class="elevation-1"
                  item-value="dependency_id"
                >
                  <template #item.condition_type="{ item }">
                    <v-chip
                      :color="getConditionTypeColor(item.condition_type)"
                      size="small"
                      variant="flat"
                    >
                      {{ getConditionTypeText(item.condition_type) }}
                    </v-chip>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editDependency(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteDependency(item.dependency_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Валидация атрибутов -->
          <template v-if="selectedAttributeSection === 'validation'">
            <v-card variant="outlined">
              <v-card-title>Правила валидации</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка правил проверки корректности введенных значений атрибутов
                </v-alert>
                <!-- TODO: Реализовать валидацию -->
                <v-alert type="info" variant="tonal">
                  Правила валидации будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Группировка атрибутов -->
          <template v-if="selectedAttributeSection === 'grouping'">
            <v-card variant="outlined">
              <v-card-title>Группировка атрибутов</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Логическая группировка атрибутов для улучшения пользовательского интерфейса
                </v-alert>
                <!-- TODO: Реализовать группировку -->
                <v-alert type="info" variant="tonal">
                  Группировка атрибутов будет добавлена позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Диалог создания атрибута -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Создать новый атрибут</v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="isFormValid">
            <v-text-field
              v-model="newAttribute.name"
              label="Название атрибута"
              variant="outlined"
              :rules="[v => !!v || 'Название обязательно']"
              required
            />
            <v-select
              v-model="newAttribute.data_type"
              :items="dataTypeOptions"
              label="Тип данных"
              variant="outlined"
              :rules="[v => !!v || 'Тип обязателен']"
              required
            />
            <v-textarea
              v-model="newAttribute.description"
              label="Описание"
              variant="outlined"
              rows="3"
            />
            <v-text-field
              v-model="newAttribute.default_value"
              label="Значение по умолчанию"
              variant="outlined"
            />
            <v-switch
              v-model="newAttribute.is_required"
              label="Обязательное поле"
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
            @click="createAttribute"
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

const selectedAttributeSection = ref('definitions')
const showCreateDialog = ref(false)
const isFormValid = ref(false)
const isSaving = ref(false)

const newAttribute = ref({
  name: '',
  data_type: '',
  description: '',
  default_value: '',
  is_required: false
})

const attributeSections = ref([
  {
    id: 'definitions',
    title: 'Определения атрибутов',
    icon: 'mdi-form-textbox',
    badge: null
  },
  {
    id: 'list-options',
    title: 'Списки значений',
    icon: 'mdi-format-list-bulleted',
    badge: null
  },
  {
    id: 'dependencies',
    title: 'Зависимости',
    icon: 'mdi-link-variant',
    badge: null
  },
  {
    id: 'validation',
    title: 'Валидация',
    icon: 'mdi-check-circle',
    badge: 'Soon'
  },
  {
    id: 'grouping',
    title: 'Группировка',
    icon: 'mdi-folder-multiple',
    badge: 'Soon'
  }
])

const attributeHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Тип данных', key: 'data_type', sortable: true },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Обязательное', key: 'is_required', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const listOptionHeaders = [
  { title: 'Атрибут', key: 'attribute_name', sortable: true },
  { title: 'Значение', key: 'value', sortable: true },
  { title: 'Отображение', key: 'display_value', sortable: true },
  { title: 'Порядок', key: 'sort_order', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

const dependencyHeaders = [
  { title: 'Родительский атрибут', key: 'parent_attribute', sortable: true },
  { title: 'Зависимый атрибут', key: 'dependent_attribute', sortable: true },
  { title: 'Тип условия', key: 'condition_type', sortable: true },
  { title: 'Значение', key: 'condition_value', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const attributes = ref([
  {
    attribute_id: '1',
    name: 'Приоритет кампании',
    data_type: 'select',
    description: 'Уровень приоритета маркетинговой кампании',
    default_value: 'Средний',
    is_required: true
  },
  {
    attribute_id: '2',
    name: 'Целевая аудитория',
    data_type: 'text',
    description: 'Описание целевой аудитории',
    default_value: '',
    is_required: false
  },
  {
    attribute_id: '3',
    name: 'Бюджет кампании',
    data_type: 'currency',
    description: 'Планируемый бюджет на кампанию',
    default_value: '0',
    is_required: true
  }
])

const listOptions = ref([
  {
    option_id: '1',
    attribute_name: 'Приоритет кампании',
    value: 'high',
    display_value: 'Высокий',
    sort_order: 1
  },
  {
    option_id: '2',
    attribute_name: 'Приоритет кампании',
    value: 'medium',
    display_value: 'Средний',
    sort_order: 2
  },
  {
    option_id: '3',
    attribute_name: 'Приоритет кампании',
    value: 'low',
    display_value: 'Низкий',
    sort_order: 3
  }
])

const dependencies = ref([
  {
    dependency_id: '1',
    parent_attribute: 'Тип кампании',
    dependent_attribute: 'Канал размещения',
    condition_type: 'equals',
    condition_value: 'Цифровая реклама'
  },
  {
    dependency_id: '2',
    parent_attribute: 'Приоритет кампании',
    dependent_attribute: 'Требуется утверждение',
    condition_type: 'equals',
    condition_value: 'Высокий'
  }
])

const dataTypeOptions = ref([
  { title: 'Текст', value: 'text' },
  { title: 'Число', value: 'number' },
  { title: 'Валюта', value: 'currency' },
  { title: 'Дата', value: 'date' },
  { title: 'Список', value: 'select' },
  { title: 'Логическое значение', value: 'boolean' },
  { title: 'Email', value: 'email' },
  { title: 'URL', value: 'url' }
])

// Helper functions
const getDataTypeColor = (type) => {
  const colors = {
    'text': 'blue',
    'number': 'green',
    'currency': 'orange',
    'date': 'purple',
    'select': 'teal',
    'boolean': 'indigo',
    'email': 'pink',
    'url': 'cyan'
  }
  return colors[type] || 'grey'
}

const getDataTypeText = (type) => {
  const texts = {
    'text': 'Текст',
    'number': 'Число',
    'currency': 'Валюта',
    'date': 'Дата',
    'select': 'Список',
    'boolean': 'Логическое',
    'email': 'Email',
    'url': 'URL'
  }
  return texts[type] || type
}

const getConditionTypeColor = (type) => {
  const colors = {
    'equals': 'blue',
    'not_equals': 'red',
    'contains': 'green',
    'greater_than': 'orange',
    'less_than': 'purple'
  }
  return colors[type] || 'grey'
}

const getConditionTypeText = (type) => {
  const texts = {
    'equals': 'Равно',
    'not_equals': 'Не равно',
    'contains': 'Содержит',
    'greater_than': 'Больше',
    'less_than': 'Меньше'
  }
  return texts[type] || type
}

// CRUD methods
const createAttribute = async () => {
  try {
    isSaving.value = true
    console.log('Создание атрибута:', newAttribute.value)
    appStore.showSuccess('Атрибут создан успешно')
    showCreateDialog.value = false
    newAttribute.value = {
      name: '',
      data_type: '',
      description: '',
      default_value: '',
      is_required: false
    }
  } catch (error) {
    console.error('Error creating attribute:', error)
    appStore.showError('Ошибка создания атрибута')
  } finally {
    isSaving.value = false
  }
}

const updateAttribute = async (attribute) => {
  try {
    console.log('Обновление атрибута:', attribute)
    appStore.showSuccess('Атрибут обновлен')
  } catch (error) {
    console.error('Error updating attribute:', error)
    appStore.showError('Ошибка обновления атрибута')
  }
}

const editAttribute = (attribute) => {
  console.log('Редактирование атрибута:', attribute)
}

const deleteAttribute = async (attributeId) => {
  try {
    console.log('Удаление атрибута:', attributeId)
    appStore.showSuccess('Атрибут удален')
  } catch (error) {
    console.error('Error deleting attribute:', error)
    appStore.showError('Ошибка удаления атрибута')
  }
}

const editListOption = (option) => {
  console.log('Редактирование опции списка:', option)
}

const deleteListOption = async (optionId) => {
  try {
    console.log('Удаление опции списка:', optionId)
    appStore.showSuccess('Опция списка удалена')
  } catch (error) {
    console.error('Error deleting list option:', error)
    appStore.showError('Ошибка удаления опции списка')
  }
}

const editDependency = (dependency) => {
  console.log('Редактирование зависимости:', dependency)
}

const deleteDependency = async (dependencyId) => {
  try {
    console.log('Удаление зависимости:', dependencyId)
    appStore.showSuccess('Зависимость удалена')
  } catch (error) {
    console.error('Error deleting dependency:', error)
    appStore.showError('Ошибка удаления зависимости')
  }
}
</script>