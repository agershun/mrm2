<template>
  <v-dialog v-model="show" max-width="800px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-billboard</v-icon>
        {{ placement ? 'Редактирование площадки' : 'Новая рекламная площадка' }}
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="close"
        />
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="formValid">
          <v-row>
            <!-- Основная информация -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="Название площадки"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-billboard"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.type"
                :items="placementTypes"
                label="Тип площадки"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-view-grid"
              />
            </v-col>

            <!-- Контактная информация -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.contact_person"
                label="Контактное лицо"
                variant="outlined"
                prepend-inner-icon="mdi-account"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.contact_email"
                label="Email"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email"
              />
            </v-col>

            <!-- Статистики -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="formData.subscribers"
                label="Количество подписчиков"
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-account-group"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="formData.engagement_rate"
                label="Уровень вовлеченности (%)"
                type="number"
                step="0.1"
                variant="outlined"
                prepend-inner-icon="mdi-heart"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="formData.avg_views"
                label="Средние просмотры"
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-eye"
              />
            </v-col>

            <!-- URL и дополнительная информация -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.url"
                label="URL площадки"
                type="url"
                variant="outlined"
                prepend-inner-icon="mdi-web"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.category"
                :items="categories"
                label="Категория"
                variant="outlined"
                prepend-inner-icon="mdi-tag"
              />
            </v-col>

            <!-- Теги и статус -->
            <v-col cols="12" md="6">
              <v-combobox
                v-model="formData.tags"
                label="Теги"
                multiple
                chips
                variant="outlined"
                prepend-inner-icon="mdi-tag-multiple"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.is_active"
                label="Активна"
                color="success"
                inset
              />
            </v-col>

            <!-- Описание -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="Описание"
                variant="outlined"
                rows="3"
                prepend-inner-icon="mdi-text"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="close"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!formValid"
          :loading="saving"
          @click="save"
        >
          {{ placement ? 'Сохранить' : 'Создать' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  placement: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'save'])

// Data
const form = ref(null)
const formValid = ref(false)
const saving = ref(false)

const formData = ref({
  name: '',
  type: '',
  contact_person: '',
  contact_email: '',
  subscribers: null,
  engagement_rate: null,
  avg_views: null,
  url: '',
  category: '',
  tags: [],
  is_active: true,
  description: ''
})

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const placementTypes = [
  { title: 'Социальная сеть', value: 'social' },
  { title: 'Блог', value: 'blog' },
  { title: 'YouTube канал', value: 'youtube' },
  { title: 'Подкаст', value: 'podcast' },
  { title: 'Telegram канал', value: 'telegram' },
  { title: 'Веб-сайт', value: 'website' },
  { title: 'Мобильное приложение', value: 'mobile_app' },
  { title: 'Email рассылка', value: 'email' }
]

const categories = [
  { title: 'Технологии', value: 'tech' },
  { title: 'Мода и красота', value: 'fashion' },
  { title: 'Еда и напитки', value: 'food' },
  { title: 'Путешествия', value: 'travel' },
  { title: 'Спорт и фитнес', value: 'sports' },
  { title: 'Образование', value: 'education' },
  { title: 'Развлечения', value: 'entertainment' },
  { title: 'Бизнес и финансы', value: 'business' },
  { title: 'Здоровье', value: 'health' },
  { title: 'Автомобили', value: 'automotive' }
]

// Validation rules
const rules = {
  required: value => !!value || 'Поле обязательно для заполнения'
}

// Methods
const resetForm = () => {
  formData.value = {
    name: '',
    type: '',
    contact_person: '',
    contact_email: '',
    subscribers: null,
    engagement_rate: null,
    avg_views: null,
    url: '',
    category: '',
    tags: [],
    is_active: true,
    description: ''
  }
}

const loadPlacement = () => {
  if (props.placement) {
    formData.value = { ...props.placement }
  } else {
    resetForm()
  }
}

const save = async () => {
  if (!formValid.value) return

  saving.value = true
  try {
    emit('save', { ...formData.value })
    close()
  } catch (error) {
    console.error('Ошибка при сохранении площадки:', error)
  } finally {
    saving.value = false
  }
}

const close = () => {
  show.value = false
  if (form.value) {
    form.value.reset()
  }
}

// Watchers
watch(() => props.placement, loadPlacement, { immediate: true })
watch(show, (newValue) => {
  if (newValue) {
    loadPlacement()
  }
})
</script>

<style scoped>
/* Additional styles can be added here */
</style>