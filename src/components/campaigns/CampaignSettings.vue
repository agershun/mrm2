<template>
  <div class="campaign-settings">
    <v-row>
      <!-- Basic Settings -->
      <v-col cols="12" lg="8">
        <v-card class="mb-6">
          <v-card-title>Основные настройки</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="localCampaign.name"
                  label="Название кампании"
                  outlined
                  @blur="updateField('name')"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="localCampaign.description"
                  label="Описание"
                  rows="3"
                  outlined
                  @blur="updateField('description')"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="localCampaign.status"
                  :items="statusOptions"
                  label="Статус"
                  outlined
                  @update:model-value="updateField('status')"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="localCampaign.phase"
                  :items="phaseOptions"
                  label="Фаза кампании"
                  outlined
                  @update:model-value="updateField('phase')"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="localCampaign.objective"
                  :items="objectiveOptions"
                  label="Цель кампании"
                  outlined
                  @update:model-value="updateField('objective')"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="localCampaign.channel"
                  :items="channelOptions"
                  label="Канал размещения"
                  outlined
                  disabled
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Budget Settings -->
        <v-card class="mb-6">
          <v-card-title>Бюджет</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="localCampaign.budget_type"
                  :items="budgetTypeOptions"
                  label="Тип бюджета"
                  outlined
                  @update:model-value="updateField('budget_type')"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="localCampaign.budget_value"
                  label="Размер бюджета"
                  type="number"
                  prefix="₽"
                  outlined
                  @blur="updateField('budget_value')"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="localCampaign.bid_amount"
                  label="Базовая ставка"
                  type="number"
                  prefix="₽"
                  outlined
                  @blur="updateField('bid_amount')"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="localCampaign.bid_strategy"
                  :items="bidStrategyOptions"
                  label="Стратегия ставок"
                  outlined
                  @update:model-value="updateField('bid_strategy')"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Schedule Settings -->
        <v-card class="mb-6">
          <v-card-title>Расписание</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="localCampaign.start_date"
                  label="Дата начала"
                  type="date"
                  outlined
                  @blur="updateField('start_date')"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="localCampaign.end_date"
                  label="Дата окончания"
                  type="date"
                  outlined
                  clearable
                  @blur="updateField('end_date')"
                />
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="localCampaign.schedule_enabled"
                  label="Включить расписание показов"
                  @update:model-value="updateField('schedule_enabled')"
                />
              </v-col>

              <v-col v-if="localCampaign.schedule_enabled" cols="12">
                <v-card variant="outlined">
                  <v-card-subtitle>Расписание по дням недели</v-card-subtitle>
                  <v-card-text>
                    <div v-for="day in weekDays" :key="day.value" class="d-flex align-center mb-2">
                      <v-checkbox
                        v-model="localCampaign.schedule_days"
                        :value="day.value"
                        :label="day.title"
                        hide-details
                        @update:model-value="updateField('schedule_days')"
                      />
                      <v-spacer />
                      <v-text-field
                        v-if="localCampaign.schedule_days.includes(day.value)"
                        v-model="localCampaign.schedule_hours[day.value + '_start']"
                        label="Начало"
                        type="time"
                        density="compact"
                        style="width: 120px;"
                        class="me-2"
                        @blur="updateField('schedule_hours')"
                      />
                      <v-text-field
                        v-if="localCampaign.schedule_days.includes(day.value)"
                        v-model="localCampaign.schedule_hours[day.value + '_end']"
                        label="Конец"
                        type="time"
                        density="compact"
                        style="width: 120px;"
                        @blur="updateField('schedule_hours')"
                      />
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- UTM Parameters -->
        <v-card>
          <v-card-title>UTM параметры</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="localCampaign.utm_source"
                  label="utm_source"
                  outlined
                  readonly
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="localCampaign.utm_medium"
                  label="utm_medium"
                  outlined
                  readonly
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="localCampaign.utm_campaign"
                  label="utm_campaign"
                  outlined
                  @blur="updateField('utm_campaign')"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="localCampaign.utm_term"
                  label="utm_term"
                  outlined
                  @blur="updateField('utm_term')"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="localCampaign.utm_content"
                  label="utm_content"
                  outlined
                  @blur="updateField('utm_content')"
                />
              </v-col>

              <v-col cols="12">
                <v-card variant="outlined" class="pa-3">
                  <div class="text-body-2 text-medium-emphasis mb-2">Полная UTM ссылка:</div>
                  <div class="text-body-2 font-family-monospace">
                    {{ generateUtmUrl() }}
                  </div>
                  <v-btn
                    size="small"
                    variant="outlined"
                    prepend-icon="mdi-content-copy"
                    class="mt-2"
                    @click="copyUtmUrl"
                  >
                    Копировать
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Sidebar -->
      <v-col cols="12" lg="4">
        <!-- Campaign Manager -->
        <v-card class="mb-6">
          <v-card-title>Ответственный менеджер</v-card-title>
          <v-card-text>
            <v-select
              v-model="localCampaign.responsible_manager"
              :items="managerOptions"
              label="Менеджер"
              outlined
              @update:model-value="updateField('responsible_manager')"
            />
          </v-card-text>
        </v-card>

        <!-- Tags -->
        <v-card class="mb-6">
          <v-card-title>Теги</v-card-title>
          <v-card-text>
            <v-chip-group
              v-model="localCampaign.tags"
              multiple
              column
            >
              <v-chip
                v-for="tag in availableTags"
                :key="tag"
                :value="tag"
                filter
                variant="outlined"
                @update:model-value="updateField('tags')"
              >
                {{ tag }}
              </v-chip>
            </v-chip-group>
            <v-text-field
              v-model="newTag"
              label="Добавить новый тег"
              density="compact"
              outlined
              append-icon="mdi-plus"
              @click:append="addTag"
              @keyup.enter="addTag"
            />
          </v-card-text>
        </v-card>

        <!-- Notes -->
        <v-card>
          <v-card-title>Заметки</v-card-title>
          <v-card-text>
            <v-textarea
              v-model="localCampaign.notes"
              label="Внутренние заметки"
              rows="4"
              outlined
              @blur="updateField('notes')"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
    >
      Настройки сохранены
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

// Local state
const localCampaign = ref({ ...props.campaign })
const newTag = ref('')
const showSuccess = ref(false)

// Options
const statusOptions = [
  { title: 'Активна', value: 'active' },
  { title: 'На паузе', value: 'paused' },
  { title: 'Черновик', value: 'draft' },
  { title: 'Завершена', value: 'completed' },
  { title: 'Архив', value: 'archived' }
]

const phaseOptions = [
  { title: 'Подготовка', value: 'pre_launch' },
  { title: 'A/B тестирование', value: 'ab_testing' },
  { title: 'Активный запуск', value: 'active_launch' },
  { title: 'Оптимизация', value: 'optimization' },
  { title: 'Ретаргетинг', value: 'retargeting' },
  { title: 'Завершение', value: 'wrap_up' },
  { title: 'Пост-анализ', value: 'post_analysis' }
]

const objectiveOptions = [
  { title: 'Узнаваемость бренда', value: 'brand_awareness' },
  { title: 'Трафик', value: 'traffic' },
  { title: 'Лиды', value: 'leads' },
  { title: 'Конверсии', value: 'conversions' },
  { title: 'Установки приложения', value: 'app_installs' },
  { title: 'Охват', value: 'reach' },
  { title: 'Вовлечение', value: 'engagement' }
]

const channelOptions = [
  { title: 'Meta Ads', value: 'meta' },
  { title: 'Google Ads', value: 'google' },
  { title: 'Яндекс Директ', value: 'yandex' },
  { title: 'TikTok Ads', value: 'tiktok' },
  { title: 'VK Реклама', value: 'vk' }
]

const budgetTypeOptions = [
  { title: 'Дневной', value: 'daily' },
  { title: 'За весь период', value: 'lifetime' },
  { title: 'Без ограничений', value: 'unlimited' }
]

const bidStrategyOptions = [
  { title: 'Наименьшая стоимость', value: 'lowest_cost' },
  { title: 'Целевая стоимость', value: 'target_cost' },
  { title: 'Ручные ставки', value: 'manual' },
  { title: 'Максимизация конверсий', value: 'maximize_conversions' }
]

const weekDays = [
  { title: 'Понедельник', value: 'monday' },
  { title: 'Вторник', value: 'tuesday' },
  { title: 'Среда', value: 'wednesday' },
  { title: 'Четверг', value: 'thursday' },
  { title: 'Пятница', value: 'friday' },
  { title: 'Суббота', value: 'saturday' },
  { title: 'Воскресенье', value: 'sunday' }
]

const managerOptions = [
  'alexey.petrov@kreola.ru',
  'maria.sidorova@kreola.ru',
  'dmitry.volkov@kreola.ru',
  'elena.kozlova@kreola.ru'
]

const availableTags = [
  'B2B',
  'B2C',
  'Сезонная',
  'Акция',
  'Запуск продукта',
  'Ретаргетинг',
  'Lookalike',
  'Премиум',
  'Массовый рынок'
]

// Methods
const updateField = async (field) => {
  try {
    const updates = { [field]: localCampaign.value[field] }
    emit('update', updates)
    showSuccess.value = true
  } catch (error) {
    console.error('Error updating campaign:', error)
  }
}

const addTag = () => {
  if (newTag.value.trim() && !localCampaign.value.tags?.includes(newTag.value.trim())) {
    if (!localCampaign.value.tags) {
      localCampaign.value.tags = []
    }
    localCampaign.value.tags.push(newTag.value.trim())
    newTag.value = ''
    updateField('tags')
  }
}

const generateUtmUrl = () => {
  const baseUrl = localCampaign.value.landing_page || 'https://example.com'
  const params = new URLSearchParams()

  if (localCampaign.value.utm_source) params.append('utm_source', localCampaign.value.utm_source)
  if (localCampaign.value.utm_medium) params.append('utm_medium', localCampaign.value.utm_medium)
  if (localCampaign.value.utm_campaign) params.append('utm_campaign', localCampaign.value.utm_campaign)
  if (localCampaign.value.utm_term) params.append('utm_term', localCampaign.value.utm_term)
  if (localCampaign.value.utm_content) params.append('utm_content', localCampaign.value.utm_content)

  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
}

const copyUtmUrl = async () => {
  try {
    await navigator.clipboard.writeText(generateUtmUrl())
    showSuccess.value = true
  } catch (error) {
    console.error('Error copying URL:', error)
  }
}

// Initialize default values
if (!localCampaign.value.schedule_days) {
  localCampaign.value.schedule_days = []
}
if (!localCampaign.value.schedule_hours) {
  localCampaign.value.schedule_hours = {}
}
if (!localCampaign.value.tags) {
  localCampaign.value.tags = []
}

// Watchers
watch(() => props.campaign, (newCampaign) => {
  localCampaign.value = { ...newCampaign }
}, { deep: true })
</script>

<style scoped>
.campaign-settings {
  max-width: 100%;
}

.font-family-monospace {
  font-family: 'Courier New', Courier, monospace;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  word-break: break-all;
}
</style>