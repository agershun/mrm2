<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-tune</v-icon>
        Оптимизация медиа-микса: {{ mediaMix?.name }}
      </v-card-title>

      <v-card-text>
        <v-tabs v-model="activeTab">
          <v-tab value="parameters">Параметры</v-tab>
          <v-tab value="results">Результаты</v-tab>
          <v-tab value="comparison">Сравнение</v-tab>
        </v-tabs>

        <v-tabs-window v-model="activeTab">
          <!-- Параметры оптимизации -->
          <v-tabs-window-item value="parameters">
            <v-form ref="form" v-model="valid" class="mt-4">
              <h4 class="text-h6 mb-3">Цели оптимизации</h4>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="optimizationParams.objective"
                    :items="objectives"
                    label="Основная цель"
                    :rules="[rules.required]"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="optimizationParams.target_roi"
                    label="Целевой ROI (%)"
                    type="number"
                    :rules="[rules.required, rules.positive]"
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <h4 class="text-h6 mb-3 mt-4">Ограничения</h4>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="optimizationParams.min_channel_share"
                    label="Мин. доля канала (%)"
                    type="number"
                    variant="outlined"
                    suffix="%"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="optimizationParams.max_channel_share"
                    label="Макс. доля канала (%)"
                    type="number"
                    variant="outlined"
                    suffix="%"
                  />
                </v-col>
              </v-row>

              <v-select
                v-model="optimizationParams.preferred_channels"
                :items="availableChannels"
                label="Приоритетные каналы"
                variant="outlined"
                multiple
                chips
                closable-chips
              />

              <h4 class="text-h6 mb-3 mt-4">Дополнительные параметры</h4>
              <v-row>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="optimizationParams.consider_seasonality"
                    label="Учитывать сезонность"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="optimizationParams.consider_competition"
                    label="Учитывать конкуренцию"
                    hide-details
                  />
                </v-col>
              </v-row>

              <v-slider
                v-model="optimizationParams.risk_tolerance"
                label="Толерантность к риску"
                :min="1"
                :max="5"
                :step="1"
                show-ticks="always"
                tick-size="4"
                class="mt-4"
              >
                <template #tick-label="{ tick }">
                  {{ getRiskLabel(tick) }}
                </template>
              </v-slider>
            </v-form>
          </v-tabs-window-item>

          <!-- Результаты оптимизации -->
          <v-tabs-window-item value="results">
            <div v-if="!optimizationResults" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2">mdi-chart-line</v-icon>
              <h3 class="text-h6 mt-2">Запустите оптимизацию</h3>
              <p class="text-grey">Настройте параметры и нажмите "Оптимизировать"</p>
            </div>

            <div v-else>
              <div class="mb-4">
                <v-alert
                  :type="getResultAlertType(optimizationResults.improvement)"
                  variant="tonal"
                >
                  <template #title>
                    Результат оптимизации
                  </template>
                  <div>
                    Улучшение ROI: {{ optimizationResults.improvement > 0 ? '+' : '' }}{{ optimizationResults.improvement }}%
                    <br>
                    Новый ожидаемый ROI: {{ optimizationResults.new_roi }}%
                  </div>
                </v-alert>
              </div>

              <h4 class="text-h6 mb-3">Оптимизированное распределение</h4>
              <v-row>
                <v-col
                  v-for="channel in optimizationResults.optimized_channels"
                  :key="channel.channel"
                  cols="12"
                  md="6"
                >
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="d-flex justify-space-between align-center mb-2">
                        <div class="d-flex align-center">
                          <v-avatar size="24" :color="getChannelColor(channel.channel)" class="me-2">
                            <v-icon size="16" color="white">{{ getChannelIcon(channel.channel) }}</v-icon>
                          </v-avatar>
                          <span class="font-weight-medium">{{ channel.channel }}</span>
                        </div>
                        <v-chip
                          size="small"
                          :color="getChangeColor(channel.change)"
                        >
                          {{ channel.change > 0 ? '+' : '' }}{{ channel.change }}%
                        </v-chip>
                      </div>
                      <div class="d-flex justify-space-between align-center">
                        <span>Новая доля:</span>
                        <span class="font-weight-bold">{{ channel.new_share }}%</span>
                      </div>
                      <div class="d-flex justify-space-between align-center">
                        <span>Бюджет:</span>
                        <span>{{ formatCurrency(channel.new_budget) }}</span>
                      </div>
                      <v-progress-linear
                        :model-value="channel.new_share"
                        :color="getChannelColor(channel.channel)"
                        height="6"
                        rounded
                        class="mt-2"
                      />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <div v-if="optimizationResults.recommendations" class="mt-4">
                <h4 class="text-h6 mb-3">Рекомендации</h4>
                <v-list density="compact">
                  <v-list-item
                    v-for="(rec, index) in optimizationResults.recommendations"
                    :key="index"
                  >
                    <template #prepend>
                      <v-icon color="primary">mdi-lightbulb-outline</v-icon>
                    </template>
                    <v-list-item-title>{{ rec }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- Сравнение до/после -->
          <v-tabs-window-item value="comparison">
            <div v-if="!optimizationResults" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2">mdi-compare</v-icon>
              <h3 class="text-h6 mt-2">Сравнение недоступно</h3>
              <p class="text-grey">Сначала выполните оптимизацию</p>
            </div>

            <div v-else>
              <v-row>
                <v-col cols="12" md="6">
                  <h4 class="text-h6 mb-3">Текущий микс</h4>
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="mb-3">
                        <div class="text-h6 text-center">
                          ROI: {{ mediaMix.expected_roi }}%
                        </div>
                      </div>
                      <div v-for="channel in mediaMix.channels" :key="channel.channel" class="mb-2">
                        <div class="d-flex justify-space-between align-center mb-1">
                          <span class="text-body-2">{{ channel.channel }}</span>
                          <span class="font-weight-medium">{{ channel.budget_share }}%</span>
                        </div>
                        <v-progress-linear
                          :model-value="channel.budget_share"
                          :color="getChannelColor(channel.channel)"
                          height="4"
                        />
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <h4 class="text-h6 mb-3">Оптимизированный микс</h4>
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="mb-3">
                        <div class="text-h6 text-center text-success">
                          ROI: {{ optimizationResults.new_roi }}%
                        </div>
                      </div>
                      <div v-for="channel in optimizationResults.optimized_channels" :key="channel.channel" class="mb-2">
                        <div class="d-flex justify-space-between align-center mb-1">
                          <span class="text-body-2">{{ channel.channel }}</span>
                          <div class="d-flex align-center">
                            <span class="font-weight-medium me-2">{{ channel.new_share }}%</span>
                            <v-chip
                              size="x-small"
                              :color="getChangeColor(channel.change)"
                            >
                              {{ channel.change > 0 ? '+' : '' }}{{ channel.change }}
                            </v-chip>
                          </div>
                        </div>
                        <v-progress-linear
                          :model-value="channel.new_share"
                          :color="getChannelColor(channel.channel)"
                          height="4"
                        />
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="!optimizing && !optimizationResults"
          color="primary"
          :disabled="!valid"
          :loading="optimizing"
          @click="runOptimization"
        >
          <v-icon>mdi-play</v-icon>
          Оптимизировать
        </v-btn>
        <v-btn
          v-if="optimizationResults"
          color="success"
          @click="applyOptimization"
        >
          <v-icon>mdi-check</v-icon>
          Применить изменения
        </v-btn>
        <v-btn
          v-if="optimizationResults"
          color="secondary"
          @click="resetOptimization"
        >
          <v-icon>mdi-refresh</v-icon>
          Новая оптимизация
        </v-btn>
        <v-spacer />
        <v-btn @click="dialog = false">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMediaMixStore } from '@/stores/mediaMixStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mediaMix: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

const mediaMixStore = useMediaMixStore()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref('parameters')
const valid = ref(false)
const optimizing = ref(false)
const optimizationResults = ref(null)

const optimizationParams = ref({
  objective: 'maximize_roi',
  target_roi: 250,
  min_channel_share: 5,
  max_channel_share: 50,
  preferred_channels: [],
  consider_seasonality: true,
  consider_competition: true,
  risk_tolerance: 3
})

const rules = {
  required: v => !!v || 'Поле обязательно для заполнения',
  positive: v => v > 0 || 'Значение должно быть больше нуля'
}

const objectives = [
  { title: 'Максимизировать ROI', value: 'maximize_roi' },
  { title: 'Минимизировать CPA', value: 'minimize_cpa' },
  { title: 'Максимизировать охват', value: 'maximize_reach' },
  { title: 'Сбалансированный подход', value: 'balanced' }
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

const getChannelColor = (channel) => {
  const colors = {
    'Google Ads': 'primary',
    'Yandex Direct': 'warning',
    'Facebook': 'blue',
    'Instagram': 'purple',
    'YouTube': 'red',
    'VKontakte': 'blue-grey',
    'Telegram': 'cyan',
    'Email': 'orange'
  }
  return colors[channel] || 'grey'
}

const getChannelIcon = (channel) => {
  const icons = {
    'Google Ads': 'mdi-google',
    'Yandex Direct': 'mdi-yandex',
    'Facebook': 'mdi-facebook',
    'Instagram': 'mdi-instagram',
    'YouTube': 'mdi-youtube',
    'VKontakte': 'mdi-vk',
    'Telegram': 'mdi-telegram',
    'Email': 'mdi-email'
  }
  return icons[channel] || 'mdi-bullhorn'
}

const getRiskLabel = (value) => {
  const labels = {
    1: 'Низкий',
    2: 'Ниже среднего',
    3: 'Средний',
    4: 'Выше среднего',
    5: 'Высокий'
  }
  return labels[value] || ''
}

const getResultAlertType = (improvement) => {
  if (improvement > 10) return 'success'
  if (improvement > 0) return 'info'
  return 'warning'
}

const getChangeColor = (change) => {
  if (change > 0) return 'success'
  if (change < 0) return 'error'
  return 'grey'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const runOptimization = async () => {
  optimizing.value = true
  try {
    const result = await mediaMixStore.optimizeMediaMix(props.mediaMix.mix_id, optimizationParams.value)
    optimizationResults.value = result
    activeTab.value = 'results'
  } finally {
    optimizing.value = false
  }
}

const resetOptimization = () => {
  optimizationResults.value = null
  activeTab.value = 'parameters'
}

const applyOptimization = async () => {
  if (!optimizationResults.value) return

  // Обновляем медиа-микс с оптимизированными значениями
  const updatedChannels = optimizationResults.value.optimized_channels.map(channel => ({
    channel: channel.channel,
    budget_share: channel.new_share,
    budget_amount: channel.new_budget,
    expected_roi: channel.expected_roi,
    target_cpa: channel.target_cpa
  }))

  const updatedMediaMix = {
    ...props.mediaMix,
    channels: updatedChannels,
    expected_roi: optimizationResults.value.new_roi
  }

  await mediaMixStore.updateMediaMix(props.mediaMix.mix_id, updatedMediaMix)
  dialog.value = false
}
</script>