<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Группировка активностей</span>
        <v-btn
          icon
          variant="text"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="groupby-form">
          <p class="text-body-2 text-grey-darken-1 mb-4">
            Выберите поле для группировки активностей в основном списке
          </p>

          <!-- Поиск по атрибутам -->
          <v-text-field
            v-model="searchTerm"
            label="Поиск атрибутов"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="mb-4"
          />

          <!-- Список доступных атрибутов для группировки -->
          <v-list class="groupby-list">
            <v-list-subheader>Основные поля</v-list-subheader>

            <v-list-item
              v-for="field in filteredBasicFields"
              :key="field.value"
              @click="selectField(field.value)"
              :class="{ 'v-list-item--active': selectedField === field.value }"
            >
              <template v-slot:prepend>
                <v-icon :icon="field.icon" />
              </template>
              <v-list-item-title>{{ field.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ field.description }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-subheader>Пользовательские атрибуты</v-list-subheader>

            <v-list-item
              v-for="attribute in filteredCustomAttributes"
              :key="attribute.value"
              @click="selectField(attribute.value)"
              :class="{ 'v-list-item--active': selectedField === attribute.value }"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-tag" />
              </template>
              <v-list-item-title>{{ attribute.title }}</v-list-item-title>
              <v-list-item-subtitle>Пользовательский атрибут</v-list-item-subtitle>
            </v-list-item>

            <div
              v-if="filteredCustomAttributes.length === 0 && filteredBasicFields.length === 0"
              class="text-center pa-4 text-grey-darken-1"
            >
              Нет атрибутов, соответствующих поиску
            </div>
          </v-list>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn
          variant="outlined"
          @click="clearGrouping"
        >
          Убрать группировку
        </v-btn>

        <v-spacer />

        <v-btn
          variant="outlined"
          @click="close"
        >
          Отмена
        </v-btn>

        <v-btn
          color="primary"
          :disabled="!selectedField"
          @click="apply"
        >
          Применить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'apply'])

const activitiesStore = useActivitiesStore()

// State
const selectedField = ref(null)
const searchTerm = ref('')

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const basicFields = ref([
  {
    value: 'activity_type_id',
    title: 'Тип активности',
    description: 'Группировка по типу активности (План, Кампания, Тактика)',
    icon: 'mdi-shape'
  },
  {
    value: 'status',
    title: 'Статус',
    description: 'Группировка по статусу выполнения',
    icon: 'mdi-flag'
  },
  {
    value: 'created_by',
    title: 'Автор',
    description: 'Группировка по создателю активности',
    icon: 'mdi-account'
  },
  {
    value: 'currency_code',
    title: 'Валюта',
    description: 'Группировка по валюте',
    icon: 'mdi-wallet'
  },
  {
    value: 'parent_activity_id',
    title: 'Родительская активность',
    description: 'Группировка по родительской активности',
    icon: 'mdi-file-tree'
  }
])

const customAttributes = ref([
  {
    value: 'region',
    title: 'Регион',
    description: 'Пользовательский атрибут'
  },
  {
    value: 'product',
    title: 'Продукт',
    description: 'Пользовательский атрибут'
  },
  {
    value: 'channel',
    title: 'Канал продвижения',
    description: 'Пользовательский атрибут'
  },
  {
    value: 'business_unit',
    title: 'Бизнес-юнит',
    description: 'Пользовательский атрибут'
  },
  {
    value: 'priority',
    title: 'Приоритет',
    description: 'Пользовательский атрибут'
  }
])

const filteredBasicFields = computed(() => {
  if (!searchTerm.value) return basicFields.value

  const search = searchTerm.value.toLowerCase()
  return basicFields.value.filter(field =>
    field.title.toLowerCase().includes(search) ||
    field.description.toLowerCase().includes(search)
  )
})

const filteredCustomAttributes = computed(() => {
  if (!searchTerm.value) return customAttributes.value

  const search = searchTerm.value.toLowerCase()
  return customAttributes.value.filter(attr =>
    attr.title.toLowerCase().includes(search)
  )
})

// Methods
const close = () => {
  isOpen.value = false
}

const selectField = (fieldValue) => {
  selectedField.value = fieldValue
}

const apply = () => {
  if (selectedField.value) {
    emit('apply', selectedField.value)
    close()
  }
}

const clearGrouping = () => {
  selectedField.value = null
  emit('apply', null)
  close()
}

// Инициализация с текущей группировкой
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedField.value = activitiesStore.groupBy
  }
})
</script>

<style scoped>
.groupby-form {
  max-height: 60vh;
}

.groupby-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.v-list-item--active {
  background-color: rgba(25, 118, 210, 0.08);
  color: #1976D2;
}

.v-list-item--active .v-icon {
  color: #1976D2;
}
</style>