<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>{{ isEdit ? 'Редактировать группу объявлений' : 'Создать группу объявлений' }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="closeDialog"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <v-stepper
          v-model="currentStep"
          :items="steps"
          hide-actions
        >
          <!-- Step 1: Basic Info -->
          <template #item.1>
            <v-card-text class="pa-6">
              <h3 class="text-h6 mb-4">Основная информация</h3>

              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.name"
                    label="Название группы объявлений"
                    placeholder="Например: Автозапчасти - Москва - 25-45"
                    :rules="[required]"
                    outlined
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.status"
                    :items="statusOptions"
                    label="Статус"
                    outlined
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.optimization_goal"
                    :items="optimizationGoals"
                    label="Цель оптимизации"
                    outlined
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="form.description"
                    label="Описание (опционально)"
                    placeholder="Краткое описание группы объявлений"
                    rows="3"
                    outlined
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </template>

          <!-- Step 2: Budget & Bidding -->
          <template #item.2>
            <v-card-text class="pa-6">
              <h3 class="text-h6 mb-4">Бюджет и ставки</h3>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.budget_value"
                    label="Дневной бюджет"
                    type="number"
                    prefix="₽"
                    :rules="[required, minValue(100)]"
                    outlined
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.bid_strategy"
                    :items="bidStrategies"
                    label="Стратегия ставок"
                    outlined
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.bid_amount"
                    label="Ставка"
                    type="number"
                    prefix="₽"
                    :rules="[required, minValue(1)]"
                    outlined
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.cost_cap"
                    label="Лимит стоимости (опционально)"
                    type="number"
                    prefix="₽"
                    outlined
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </template>

          <!-- Step 3: Targeting -->
          <template #item.3>
            <v-card-text class="pa-6">
              <h3 class="text-h6 mb-4">Таргетирование</h3>

              <v-row>
                <!-- Demographics -->
                <v-col cols="12">
                  <h4 class="text-subtitle-1 mb-3">Демография</h4>
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.gender"
                    :items="genderOptions"
                    label="Пол"
                    outlined
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="form.age_min"
                    label="Возраст от"
                    type="number"
                    min="13"
                    max="65"
                    outlined
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="form.age_max"
                    label="Возраст до"
                    type="number"
                    min="13"
                    max="65"
                    outlined
                  />
                </v-col>

                <!-- Location -->
                <v-col cols="12">
                  <h4 class="text-subtitle-1 mb-3">Местоположение</h4>
                </v-col>

                <v-col cols="12">
                  <v-autocomplete
                    v-model="form.locations"
                    :items="locationOptions"
                    label="Города и регионы"
                    placeholder="Начните вводить название города или региона"
                    multiple
                    chips
                    closable-chips
                    outlined
                  />
                </v-col>

                <!-- Interests -->
                <v-col cols="12">
                  <h4 class="text-subtitle-1 mb-3">Интересы</h4>
                </v-col>

                <v-col cols="12">
                  <v-autocomplete
                    v-model="form.interests"
                    :items="interestOptions"
                    label="Интересы и хобби"
                    placeholder="Выберите интересы целевой аудитории"
                    multiple
                    chips
                    closable-chips
                    outlined
                  />
                </v-col>

                <!-- Behaviors -->
                <v-col cols="12">
                  <v-autocomplete
                    v-model="form.behaviors"
                    :items="behaviorOptions"
                    label="Поведение"
                    placeholder="Выберите поведенческие характеристики"
                    multiple
                    chips
                    closable-chips
                    outlined
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </template>

          <!-- Step 4: Placements -->
          <template #item.4>
            <v-card-text class="pa-6">
              <h3 class="text-h6 mb-4">Размещения</h3>

              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="form.placement_type"
                    :items="placementTypes"
                    label="Тип размещения"
                    outlined
                    @update:model-value="updatePlacements"
                  />
                </v-col>

                <v-col v-if="form.placement_type === 'manual'" cols="12">
                  <v-chip-group
                    v-model="form.placements"
                    multiple
                    column
                  >
                    <v-chip
                      v-for="placement in availablePlacements"
                      :key="placement.value"
                      :value="placement.value"
                      filter
                      variant="outlined"
                    >
                      <v-icon start :icon="placement.icon" />
                      {{ placement.title }}
                    </v-chip>
                  </v-chip-group>
                </v-col>

                <v-col cols="12">
                  <v-select
                    v-model="form.device_platforms"
                    :items="deviceOptions"
                    label="Устройства"
                    multiple
                    chips
                    outlined
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </template>
        </v-stepper>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn
          v-if="currentStep > 1"
          variant="outlined"
          @click="previousStep"
        >
          Назад
        </v-btn>
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="closeDialog"
        >
          Отмена
        </v-btn>
        <v-btn
          v-if="currentStep < steps.length"
          color="primary"
          @click="nextStep"
          :disabled="!canProceed"
        >
          Далее
        </v-btn>
        <v-btn
          v-else
          color="primary"
          @click="saveAdGroup"
          :loading="saving"
        >
          {{ isEdit ? 'Сохранить' : 'Создать' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  campaign: {
    type: Object,
    required: true
  },
  adGroup: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// Local state
const currentStep = ref(1)
const saving = ref(false)

const form = ref({
  name: '',
  description: '',
  status: 'active',
  optimization_goal: 'conversions',
  budget_value: 1000,
  bid_strategy: 'lowest_cost',
  bid_amount: 50,
  cost_cap: null,
  gender: 'all',
  age_min: 18,
  age_max: 65,
  locations: [],
  interests: [],
  behaviors: [],
  placement_type: 'automatic',
  placements: [],
  device_platforms: ['desktop', 'mobile']
})

// Computed
const isEdit = computed(() => !!props.adGroup)

const steps = [
  { title: 'Основная информация', value: 1 },
  { title: 'Бюджет и ставки', value: 2 },
  { title: 'Таргетирование', value: 3 },
  { title: 'Размещения', value: 4 }
]

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return form.value.name.trim().length > 0
    case 2:
      return form.value.budget_value > 0 && form.value.bid_amount > 0
    case 3:
      return true
    case 4:
      return true
    default:
      return false
  }
})

// Options
const statusOptions = [
  { title: 'Активна', value: 'active' },
  { title: 'На паузе', value: 'paused' },
  { title: 'Черновик', value: 'draft' }
]

const optimizationGoals = [
  { title: 'Конверсии', value: 'conversions' },
  { title: 'Клики', value: 'clicks' },
  { title: 'Показы', value: 'impressions' },
  { title: 'Охват', value: 'reach' },
  { title: 'Вовлечение', value: 'engagement' }
]

const bidStrategies = [
  { title: 'Наименьшая стоимость', value: 'lowest_cost' },
  { title: 'Целевая стоимость', value: 'target_cost' },
  { title: 'Ручные ставки', value: 'manual' },
  { title: 'Максимальные конверсии', value: 'maximize_conversions' }
]

const genderOptions = [
  { title: 'Все', value: 'all' },
  { title: 'Мужчины', value: 'male' },
  { title: 'Женщины', value: 'female' }
]

const locationOptions = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Омск',
  'Самара',
  'Ростов-на-Дону'
]

const interestOptions = [
  'Автомобили',
  'Путешествия',
  'Спорт',
  'Мода',
  'Технологии',
  'Еда и кулинария',
  'Фильмы и сериалы',
  'Музыка',
  'Книги',
  'Игры'
]

const behaviorOptions = [
  'Часто путешествуют',
  'Покупают онлайн',
  'Пользуются мобильными платежами',
  'Активны в социальных сетях',
  'Интересуются новинками технологий'
]

const placementTypes = [
  { title: 'Автоматические размещения', value: 'automatic' },
  { title: 'Ручной выбор размещений', value: 'manual' }
]

const availablePlacements = [
  { title: 'Лента новостей', value: 'feed', icon: 'mdi-view-list' },
  { title: 'Истории', value: 'stories', icon: 'mdi-camera' },
  { title: 'Правая колонка', value: 'right_column', icon: 'mdi-view-column' },
  { title: 'Messenger', value: 'messenger', icon: 'mdi-message' },
  { title: 'Поиск', value: 'search', icon: 'mdi-magnify' },
  { title: 'Видео', value: 'video', icon: 'mdi-play' }
]

const deviceOptions = [
  { title: 'Десктоп', value: 'desktop' },
  { title: 'Мобильные', value: 'mobile' },
  { title: 'Планшеты', value: 'tablet' }
]

// Methods
const closeDialog = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  currentStep.value = 1
  form.value = {
    name: '',
    description: '',
    status: 'active',
    optimization_goal: 'conversions',
    budget_value: 1000,
    bid_strategy: 'lowest_cost',
    bid_amount: 50,
    cost_cap: null,
    gender: 'all',
    age_min: 18,
    age_max: 65,
    locations: [],
    interests: [],
    behaviors: [],
    placement_type: 'automatic',
    placements: [],
    device_platforms: ['desktop', 'mobile']
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const updatePlacements = (type) => {
  if (type === 'automatic') {
    form.value.placements = []
  }
}

const saveAdGroup = async () => {
  saving.value = true
  try {
    emit('save', { ...form.value })
  } finally {
    saving.value = false
  }
}

// Validation rules
const required = (value) => !!value || 'Поле обязательно для заполнения'
const minValue = (min) => (value) => value >= min || `Минимальное значение: ${min}`

// Watchers
watch(() => props.adGroup, (adGroup) => {
  if (adGroup) {
    Object.assign(form.value, adGroup)
  }
}, { immediate: true })

watch(() => props.modelValue, (show) => {
  if (!show) {
    resetForm()
  }
})
</script>

<style scoped>
:deep(.v-stepper-item__content) {
  padding: 0;
}
</style>