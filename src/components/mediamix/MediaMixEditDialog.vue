<template>
  <v-dialog v-model="dialog" max-width="900px" persistent>
    <v-card>
      <v-card-title>
        {{ isEdit ? 'Редактирование медиа-микса' : 'Создание медиа-микса' }}
      </v-card-title>

      <v-card-text>
        <v-stepper v-model="currentStep" alt-labels>
          <v-stepper-header>
            <v-stepper-item
              :complete="currentStep > 1"
              :value="1"
              title="Основная информация"
            />
            <v-divider />
            <v-stepper-item
              :complete="currentStep > 2"
              :value="2"
              title="Каналы и бюджет"
            />
            <v-divider />
            <v-stepper-item
              :complete="currentStep > 3"
              :value="3"
              title="Настройки и KPI"
            />
          </v-stepper-header>

          <v-stepper-window>
            <!-- Шаг 1: Основная информация -->
            <v-stepper-window-item :value="1">
              <v-form ref="basicForm" v-model="basicValid">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.name"
                      label="Название медиа-микса"
                      :rules="[rules.required]"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="form.industry"
                      :items="industries"
                      label="Индустрия"
                      :rules="[rules.required]"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>

                <v-textarea
                  v-model="form.description"
                  label="Описание"
                  variant="outlined"
                  rows="3"
                />

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="form.total_budget"
                      label="Общий бюджет"
                      type="number"
                      :rules="[rules.required, rules.positive]"
                      variant="outlined"
                      suffix="₽"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="form.campaign_duration"
                      label="Длительность кампании (дни)"
                      type="number"
                      :rules="[rules.required, rules.positive]"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>

                <v-select
                  v-model="form.status"
                  :items="statusOptions"
                  label="Статус"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-form>
            </v-stepper-window-item>

            <!-- Шаг 2: Каналы и бюджет -->
            <v-stepper-window-item :value="2">
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-3">
                  <h4 class="text-h6">Распределение бюджета по каналам</h4>
                  <v-btn color="primary" @click="addChannel">
                    <v-icon>mdi-plus</v-icon>
                    Добавить канал
                  </v-btn>
                </div>

                <v-card v-if="form.channels.length === 0" variant="outlined" class="text-center pa-8">
                  <v-icon size="48" color="grey-lighten-2">mdi-bullhorn</v-icon>
                  <p class="text-grey mt-2">Добавьте каналы для распределения бюджета</p>
                </v-card>

                <div v-else>
                  <v-row
                    v-for="(channel, index) in form.channels"
                    :key="`channel-${index}`"
                    class="mb-3"
                  >
                    <v-col cols="12">
                      <v-card variant="outlined">
                        <v-card-text>
                          <v-row>
                            <v-col cols="12" md="3">
                              <v-select
                                v-model="channel.channel"
                                :items="availableChannels"
                                label="Канал"
                                :rules="[rules.required]"
                                variant="outlined"
                                density="compact"
                              />
                            </v-col>
                            <v-col cols="12" md="2">
                              <v-text-field
                                v-model.number="channel.budget_share"
                                label="Доля (%)"
                                type="number"
                                :rules="[rules.required, rules.percentage]"
                                variant="outlined"
                                density="compact"
                                @update:model-value="updateBudgetAmount(index)"
                              />
                            </v-col>
                            <v-col cols="12" md="2">
                              <v-text-field
                                v-model="channel.budget_amount"
                                label="Сумма"
                                readonly
                                variant="outlined"
                                density="compact"
                                suffix="₽"
                              />
                            </v-col>
                            <v-col cols="12" md="2">
                              <v-text-field
                                v-model.number="channel.expected_roi"
                                label="ROI (%)"
                                type="number"
                                variant="outlined"
                                density="compact"
                              />
                            </v-col>
                            <v-col cols="12" md="2">
                              <v-text-field
                                v-model.number="channel.target_cpa"
                                label="CPA"
                                type="number"
                                variant="outlined"
                                density="compact"
                                suffix="₽"
                              />
                            </v-col>
                            <v-col cols="12" md="1" class="d-flex align-center">
                              <v-btn
                                icon="mdi-delete"
                                size="small"
                                variant="text"
                                color="error"
                                @click="removeChannel(index)"
                              />
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>

                  <!-- Сводка по бюджету -->
                  <v-card variant="tonal" color="info" class="mt-4">
                    <v-card-text>
                      <div class="d-flex justify-space-between align-center">
                        <span>Распределено:</span>
                        <span class="font-weight-bold">{{ totalBudgetShare }}%</span>
                      </div>
                      <div class="d-flex justify-space-between align-center">
                        <span>Сумма:</span>
                        <span class="font-weight-bold">{{ formatCurrency(totalBudgetAmount) }}</span>
                      </div>
                      <v-progress-linear
                        :model-value="totalBudgetShare"
                        :color="totalBudgetShare === 100 ? 'success' : 'warning'"
                        height="8"
                        rounded
                        class="mt-2"
                      />
                    </v-card-text>
                  </v-card>
                </div>
              </div>
            </v-stepper-window-item>

            <!-- Шаг 3: Настройки и KPI -->
            <v-stepper-window-item :value="3">
              <v-row>
                <v-col cols="12" md="6">
                  <h4 class="text-h6 mb-3">Целевые KPI</h4>
                  <div v-for="(kpi, index) in form.kpis" :key="`kpi-${index}`" class="mb-3">
                    <v-card variant="outlined">
                      <v-card-text>
                        <v-row>
                          <v-col cols="6">
                            <v-text-field
                              v-model="kpi.name"
                              label="Название KPI"
                              variant="outlined"
                              density="compact"
                            />
                          </v-col>
                          <v-col cols="3">
                            <v-text-field
                              v-model.number="kpi.target_value"
                              label="Значение"
                              type="number"
                              variant="outlined"
                              density="compact"
                            />
                          </v-col>
                          <v-col cols="2">
                            <v-select
                              v-model="kpi.unit"
                              :items="kpiUnits"
                              label="Ед."
                              variant="outlined"
                              density="compact"
                            />
                          </v-col>
                          <v-col cols="1" class="d-flex align-center">
                            <v-btn
                              icon="mdi-delete"
                              size="small"
                              variant="text"
                              color="error"
                              @click="removeKpi(index)"
                            />
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </div>
                  <v-btn color="primary" variant="outlined" @click="addKpi">
                    <v-icon>mdi-plus</v-icon>
                    Добавить KPI
                  </v-btn>
                </v-col>

                <v-col cols="12" md="6">
                  <h4 class="text-h6 mb-3">Дополнительные настройки</h4>

                  <v-text-field
                    v-model.number="form.expected_roi"
                    label="Ожидаемый ROI (%)"
                    type="number"
                    variant="outlined"
                    density="compact"
                  />

                  <v-combobox
                    v-model="form.target_audience"
                    label="Целевая аудитория"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                  />

                  <v-textarea
                    v-model="form.notes"
                    label="Заметки"
                    variant="outlined"
                    rows="3"
                  />
                </v-col>
              </v-row>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="currentStep > 1"
          @click="currentStep--"
        >
          Назад
        </v-btn>
        <v-spacer />
        <v-btn @click="dialog = false">Отмена</v-btn>
        <v-btn
          v-if="currentStep < 3"
          color="primary"
          :disabled="!canProceed"
          @click="currentStep++"
        >
          Далее
        </v-btn>
        <v-btn
          v-else
          color="primary"
          :disabled="!isFormValid"
          :loading="saving"
          @click="saveMediaMix"
        >
          {{ isEdit ? 'Сохранить' : 'Создать' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMediaMixStore } from '@/stores/mediaMixStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mediaMix: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const mediaMixStore = useMediaMixStore()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.mediaMix)
const currentStep = ref(1)
const basicValid = ref(false)
const saving = ref(false)

const form = ref({
  name: '',
  description: '',
  industry: '',
  total_budget: 0,
  campaign_duration: 30,
  status: 'draft',
  channels: [],
  kpis: [],
  expected_roi: 200,
  target_audience: [],
  notes: ''
})

const rules = {
  required: v => !!v || 'Поле обязательно для заполнения',
  positive: v => v > 0 || 'Значение должно быть больше нуля',
  percentage: v => (v >= 0 && v <= 100) || 'Значение должно быть от 0 до 100'
}

const industries = [
  'E-commerce',
  'Финансы',
  'Здравоохранение',
  'Образование',
  'Технологии',
  'Автомобили',
  'Недвижимость',
  'Туризм'
]

const statusOptions = [
  { title: 'Активный', value: 'active' },
  { title: 'Черновик', value: 'draft' },
  { title: 'Архивный', value: 'archived' }
]

const availableChannels = [
  'Google Ads',
  'Yandex Direct',
  'Facebook',
  'Instagram',
  'YouTube',
  'VKontakte',
  'Telegram',
  'Email'
]

const kpiUnits = ['%', 'RUB', 'шт', 'чел']

const totalBudgetShare = computed(() => {
  return form.value.channels.reduce((sum, channel) => sum + (channel.budget_share || 0), 0)
})

const totalBudgetAmount = computed(() => {
  return form.value.channels.reduce((sum, channel) => sum + (channel.budget_amount || 0), 0)
})

const canProceed = computed(() => {
  if (currentStep.value === 1) return basicValid.value
  if (currentStep.value === 2) return form.value.channels.length > 0 && totalBudgetShare.value === 100
  return true
})

const isFormValid = computed(() => {
  return basicValid.value &&
         form.value.channels.length > 0 &&
         totalBudgetShare.value === 100
})

const addChannel = () => {
  form.value.channels.push({
    channel: '',
    budget_share: 0,
    budget_amount: 0,
    expected_roi: 200,
    target_cpa: 500
  })
}

const removeChannel = (index) => {
  form.value.channels.splice(index, 1)
}

const updateBudgetAmount = (index) => {
  const channel = form.value.channels[index]
  channel.budget_amount = Math.round((form.value.total_budget * channel.budget_share) / 100)
}

const addKpi = () => {
  form.value.kpis.push({
    name: '',
    target_value: 0,
    unit: '%'
  })
}

const removeKpi = (index) => {
  form.value.kpis.splice(index, 1)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const saveMediaMix = async () => {
  saving.value = true
  try {
    if (isEdit.value) {
      await mediaMixStore.updateMediaMix(props.mediaMix.mix_id, form.value)
    } else {
      await mediaMixStore.createMediaMix(form.value)
    }
    emit('saved')
  } finally {
    saving.value = false
  }
}

watch(() => props.mediaMix, (mediaMix) => {
  if (mediaMix) {
    form.value = { ...mediaMix }
  } else {
    form.value = {
      name: '',
      description: '',
      industry: '',
      total_budget: 0,
      campaign_duration: 30,
      status: 'draft',
      channels: [],
      kpis: [],
      expected_roi: 200,
      target_audience: [],
      notes: ''
    }
  }
  currentStep.value = 1
}, { immediate: true })

// Автоматический пересчет бюджетов при изменении общего бюджета
watch(() => form.value.total_budget, () => {
  form.value.channels.forEach((channel, index) => {
    updateBudgetAmount(index)
  })
})
</script>