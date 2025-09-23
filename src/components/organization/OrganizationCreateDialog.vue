<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="text-h6 pa-6 pb-2">
        <v-icon class="me-2">mdi-plus</v-icon>
        Создать новую организацию
      </v-card-title>

      <v-card-text class="pa-6 pt-2">
        <v-form ref="form" v-model="formValid" @submit.prevent="createOrganization">
          <v-row>
            <!-- Название организации -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Название организации *"
                variant="outlined"
                :rules="[rules.required]"
                required
              />
            </v-col>

            <!-- Юридическое название -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.legal_name"
                label="Юридическое название"
                variant="outlined"
                hint="Если не указано, будет использовано основное название"
              />
            </v-col>

            <!-- Отрасль -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.industry"
                :items="industries"
                label="Отрасль"
                variant="outlined"
              />
            </v-col>

            <!-- Email -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.email"
                label="Email *"
                variant="outlined"
                type="email"
                :rules="[rules.required, rules.email]"
                required
              />
            </v-col>

            <!-- Телефон -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.phone"
                label="Телефон"
                variant="outlined"
                type="tel"
              />
            </v-col>

            <!-- Веб-сайт -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.website"
                label="Веб-сайт"
                variant="outlined"
                type="url"
                placeholder="https://example.com"
              />
            </v-col>

            <!-- Описание -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="Описание организации"
                variant="outlined"
                rows="3"
                counter="500"
                :rules="[rules.maxLength(500)]"
              />
            </v-col>

            <!-- Адрес -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.address.street"
                label="Адрес"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="formData.address.city"
                label="Город"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="formData.address.region"
                label="Регион/Область"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="formData.address.postal_code"
                label="Почтовый индекс"
                variant="outlined"
              />
            </v-col>

            <!-- Страна -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.address.country"
                :items="countries"
                label="Страна"
                variant="outlined"
              />
            </v-col>

            <!-- Активна -->
            <v-col cols="12" md="6" class="d-flex align-center">
              <v-switch
                v-model="formData.is_active"
                label="Активная организация"
                color="primary"
                true-icon="mdi-check"
                false-icon="mdi-close"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="isLoading"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          @click="createOrganization"
          :loading="isLoading"
          :disabled="!formValid"
        >
          Создать организацию
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useOrganizationsStore } from '@/stores/organizationsStore'
import { useAppStore } from '@/stores/appStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

const organizationsStore = useOrganizationsStore()
const appStore = useAppStore()

// Состояние формы
const form = ref(null)
const formValid = ref(false)
const isLoading = ref(false)

const formData = ref({
  name: '',
  legal_name: '',
  industry: 'other',
  description: '',
  website: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    region: '',
    postal_code: '',
    country: 'russia'
  },
  is_active: true
})

// Справочники
const industries = ref([
  { title: 'Косметика и красота', value: 'cosmetics' },
  { title: 'Технологии', value: 'technology' },
  { title: 'Финансы', value: 'finance' },
  { title: 'Образование', value: 'education' },
  { title: 'Здравоохранение', value: 'healthcare' },
  { title: 'Розничная торговля', value: 'retail' },
  { title: 'Ресторанный бизнес', value: 'restaurant' },
  { title: 'Производство', value: 'manufacturing' },
  { title: 'Другое', value: 'other' }
])

const countries = ref([
  { title: 'Россия', value: 'russia' },
  { title: 'США', value: 'usa' },
  { title: 'Германия', value: 'germany' },
  { title: 'Великобритания', value: 'uk' },
  { title: 'Франция', value: 'france' },
  { title: 'Китай', value: 'china' }
])

// Правила валидации
const rules = {
  required: (value) => !!value || 'Поле обязательно для заполнения',
  email: (value) => {
    if (!value) return true
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Введите корректный email'
  },
  maxLength: (max) => (value) =>
    !value || value.length <= max || `Максимум ${max} символов`
}

// Методы
const resetForm = () => {
  formData.value = {
    name: '',
    legal_name: '',
    industry: 'other',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      region: '',
      postal_code: '',
      country: 'russia'
    },
    is_active: true
  }

  if (form.value) {
    form.value.resetValidation()
  }
}

const closeDialog = () => {
  if (!isLoading.value) {
    emit('update:modelValue', false)
  }
}

const createOrganization = async () => {
  if (!formValid.value) return

  try {
    isLoading.value = true

    // Подготавливаем данные для отправки
    const organizationData = {
      ...formData.value,
      legal_name: formData.value.legal_name || formData.value.name
    }

    const newOrganization = await organizationsStore.createOrganization(organizationData)

    emit('created', newOrganization)
    emit('update:modelValue', false)

    appStore.showSuccess(`Организация "${newOrganization.name}" успешно создана`)
  } catch (error) {
    console.error('Error creating organization:', error)
    appStore.showError('Ошибка создания организации')
  } finally {
    isLoading.value = false
  }
}

// Автозаполнение юридического названия
watch(() => formData.value.name, (newName) => {
  if (!formData.value.legal_name) {
    formData.value.legal_name = newName
  }
})

// Сброс формы при закрытии диалога
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})
</script>

<style scoped>
.v-card {
  overflow: visible;
}
</style>