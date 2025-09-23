<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card v-if="organization">
      <v-card-title class="text-h6 pa-6 pb-2">
        <v-icon class="me-2">mdi-pencil</v-icon>
        Редактировать организацию
      </v-card-title>

      <v-card-text class="pa-6 pt-2">
        <v-form ref="form" v-model="formValid" @submit.prevent="updateOrganization">
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

            <!-- Социальные сети -->
            <v-col cols="12">
              <v-divider />
              <h4 class="text-subtitle-1 my-3">Социальные сети</h4>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.social_media.linkedin"
                label="LinkedIn"
                variant="outlined"
                prepend-inner-icon="mdi-linkedin"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.social_media.facebook"
                label="Facebook"
                variant="outlined"
                prepend-inner-icon="mdi-facebook"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.social_media.twitter"
                label="Twitter"
                variant="outlined"
                prepend-inner-icon="mdi-twitter"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.social_media.instagram"
                label="Instagram"
                variant="outlined"
                prepend-inner-icon="mdi-instagram"
              />
            </v-col>

            <!-- Юридическая информация -->
            <v-col cols="12">
              <v-divider />
              <h4 class="text-subtitle-1 my-3">Юридическая информация</h4>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.legal_info.tax_id"
                label="ИНН"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.legal_info.registration_number"
                label="ОГРН"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.legal_info.kpp"
                label="КПП"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.legal_info.okpo"
                label="ОКПО"
                variant="outlined"
              />
            </v-col>

            <!-- Стратегия и ограничения -->
            <v-col cols="12">
              <v-divider />
              <h4 class="text-subtitle-1 my-3">Стратегия и ограничения</h4>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.strategy_description"
                label="Описание стратегии"
                variant="outlined"
                rows="3"
                hint="Позиционирование, цели, ключевые особенности"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.target_audience"
                label="Целевая аудитория"
                variant="outlined"
                rows="2"
                hint="Описание основной целевой аудитории"
              />
            </v-col>

            <v-col cols="12">
              <v-combobox
                v-model="formData.marketing_constraints"
                label="Маркетинговые ограничения"
                variant="outlined"
                multiple
                chips
                closable-chips
                hint="Добавьте ограничения и нажмите Enter"
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
          @click="updateOrganization"
          :loading="isLoading"
          :disabled="!formValid"
        >
          Сохранить изменения
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
  },
  organization: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'updated'])

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
  social_media: {
    linkedin: '',
    facebook: '',
    twitter: '',
    instagram: ''
  },
  legal_info: {
    tax_id: '',
    registration_number: '',
    kpp: '',
    okpo: ''
  },
  strategy_description: '',
  target_audience: '',
  marketing_constraints: [],
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
const loadFormData = () => {
  if (!props.organization) return

  const org = props.organization

  formData.value = {
    name: org.name || '',
    legal_name: org.legal_name || '',
    industry: org.industry || 'other',
    description: org.description || '',
    website: org.website || '',
    email: org.email || '',
    phone: org.phone || '',
    address: {
      street: org.address?.street || '',
      city: org.address?.city || '',
      region: org.address?.region || '',
      postal_code: org.address?.postal_code || '',
      country: org.address?.country || 'russia'
    },
    social_media: {
      linkedin: org.social_media?.linkedin || '',
      facebook: org.social_media?.facebook || '',
      twitter: org.social_media?.twitter || '',
      instagram: org.social_media?.instagram || ''
    },
    legal_info: {
      tax_id: org.legal_info?.tax_id || '',
      registration_number: org.legal_info?.registration_number || '',
      kpp: org.legal_info?.kpp || '',
      okpo: org.legal_info?.okpo || ''
    },
    strategy_description: org.strategy_description || '',
    target_audience: org.target_audience || '',
    marketing_constraints: Array.isArray(org.marketing_constraints)
      ? [...org.marketing_constraints]
      : [],
    is_active: org.is_active !== false
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

const updateOrganization = async () => {
  if (!formValid.value || !props.organization) return

  try {
    isLoading.value = true

    const updatedOrganization = await organizationsStore.updateOrganization(
      props.organization.organization_id,
      formData.value
    )

    emit('updated', updatedOrganization)
    emit('update:modelValue', false)

    appStore.showSuccess(`Организация "${updatedOrganization.name}" успешно обновлена`)
  } catch (error) {
    console.error('Error updating organization:', error)
    appStore.showError('Ошибка обновления организации')
  } finally {
    isLoading.value = false
  }
}

// Загрузка данных при открытии диалога
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.organization) {
    loadFormData()
  }
})

// Загрузка данных при изменении организации
watch(() => props.organization, (newOrganization) => {
  if (newOrganization && props.modelValue) {
    loadFormData()
  }
})
</script>

<style scoped>
.v-card {
  overflow: visible;
}
</style>