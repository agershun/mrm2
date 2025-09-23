<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-rocket-launch</v-icon>
        Создание кампании
      </v-card-title>

      <v-card-text>
        <v-tabs v-model="activeTab">
          <v-tab value="manual">Ручное создание</v-tab>
          <v-tab value="ai">ИИ-генерация</v-tab>
        </v-tabs>

        <v-tabs-window v-model="activeTab">
          <!-- Ручное создание -->
          <v-tabs-window-item value="manual">
            <v-form ref="manualForm" v-model="manualValid" class="mt-4">
              <v-text-field
                v-model="form.name"
                label="Название кампании"
                :rules="[rules.required]"
                variant="outlined"
              />

              <v-select
                v-model="form.channel"
                :items="channelOptions"
                label="Канал"
                :rules="[rules.required]"
                variant="outlined"
              />

              <v-textarea
                v-model="form.description"
                label="Описание"
                variant="outlined"
                rows="3"
              />

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.budget"
                    label="Бюджет"
                    type="number"
                    variant="outlined"
                    suffix="₽"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.status"
                    :items="statusOptions"
                    label="Статус"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-tabs-window-item>

          <!-- ИИ-генерация -->
          <v-tabs-window-item value="ai">
            <div class="mt-4">
              <h4 class="text-h6 mb-3">
                <v-icon class="me-2">mdi-magic-staff</v-icon>
                Генерация кампании с помощью ИИ
              </h4>

              <v-alert v-if="!aiEnabled" type="info" variant="tonal" class="mb-4">
                <template #title>ИИ-генерация недоступна</template>
                Для использования ИИ-генерации необходимо настроить промпты в базе знаний.
              </v-alert>

              <div v-else>
                <!-- Выбор шаблона -->
                <v-select
                  v-model="aiForm.template"
                  :items="availableTemplates"
                  item-title="name"
                  item-value="template_id"
                  label="Шаблон кампании"
                  variant="outlined"
                  class="mb-4"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-avatar :color="getTemplateColor(item.raw.industry)">
                          <v-icon color="white">{{ getTemplateIcon(item.raw.industry) }}</v-icon>
                        </v-avatar>
                      </template>
                      <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-select>

                <!-- Входные данные для ИИ -->
                <v-textarea
                  v-model="aiForm.inputData"
                  label="Описание кампании / маркетинговый кейс"
                  placeholder="Опишите цели кампании, целевую аудиторию, продукт/услугу, бюджет и другие важные детали..."
                  variant="outlined"
                  rows="6"
                  :rules="[rules.required]"
                  class="mb-4"
                />

                <!-- Корпоративные документы -->
                <div v-if="enabledCorporateDocuments.length > 0" class="mb-4">
                  <h5 class="text-subtitle-1 mb-2">Корпоративные документы для контекста</h5>
                  <div class="d-flex flex-wrap gap-2">
                    <v-chip
                      v-for="doc in enabledCorporateDocuments"
                      :key="doc.document_id"
                      :color="getDocumentTypeColor(doc.type)"
                      variant="tonal"
                      size="small"
                    >
                      <v-icon start>{{ getDocumentTypeIcon(doc.type) }}</v-icon>
                      {{ doc.title }}
                    </v-chip>
                  </div>
                  <p class="text-caption text-grey mt-2">
                    Эти документы будут использованы ИИ для лучшего понимания вашей компании
                  </p>
                </div>

                <!-- Дополнительные настройки -->
                <v-expansion-panels variant="accordion">
                  <v-expansion-panel title="Дополнительные настройки">
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="aiForm.includeMediaMix"
                            label="Генерировать медиа-микс"
                            hide-details
                          />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="aiForm.includeMediaPlan"
                            label="Генерировать медиа-план"
                            hide-details
                          />
                        </v-col>
                      </v-row>

                      <v-select
                        v-model="aiForm.channels"
                        :items="channelOptions"
                        label="Предпочтительные каналы"
                        variant="outlined"
                        multiple
                        chips
                        closable-chips
                        class="mt-3"
                      />
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <!-- Прогресс генерации -->
                <div v-if="generatingCampaign" class="mt-4">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="d-flex align-center mb-3">
                        <v-progress-circular
                          indeterminate
                          color="primary"
                          size="32"
                          class="me-3"
                        />
                        <div>
                          <h4 class="text-subtitle-1">Генерация кампании</h4>
                          <p class="text-body-2 text-grey mb-0">{{ generationStatus }}</p>
                        </div>
                      </div>
                      <v-progress-linear
                        :model-value="generationProgress"
                        color="primary"
                        height="6"
                        rounded
                      />
                    </v-card-text>
                  </v-card>
                </div>

                <!-- Результат генерации -->
                <div v-if="generatedCampaign" class="mt-4">
                  <v-card variant="outlined">
                    <v-card-title>
                      <v-icon class="me-2" color="success">mdi-check-circle</v-icon>
                      Сгенерированная кампания
                    </v-card-title>
                    <v-card-text>
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title>Название</v-list-item-title>
                          <v-list-item-subtitle>{{ generatedCampaign.name }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Описание</v-list-item-title>
                          <v-list-item-subtitle>{{ generatedCampaign.description }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Бюджет</v-list-item-title>
                          <v-list-item-subtitle>{{ formatCurrency(generatedCampaign.budget) }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Каналы</v-list-item-title>
                          <v-list-item-subtitle>
                            <div class="d-flex flex-wrap gap-1 mt-1">
                              <v-chip
                                v-for="channel in generatedCampaign.channels"
                                :key="channel"
                                size="x-small"
                                color="primary"
                                variant="tonal"
                              >
                                {{ channel }}
                              </v-chip>
                            </div>
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="activeTab === 'ai' && aiEnabled && !generatingCampaign"
          color="secondary"
          variant="outlined"
          @click="generateCampaign"
          :disabled="!aiForm.inputData.trim()"
        >
          <v-icon>mdi-magic-staff</v-icon>
          Генерировать с ИИ
        </v-btn>

        <v-spacer />

        <v-btn @click="dialog = false">Отмена</v-btn>

        <v-btn
          v-if="activeTab === 'manual'"
          color="primary"
          :disabled="!manualValid"
          @click="createCampaign"
        >
          Создать
        </v-btn>

        <v-btn
          v-if="activeTab === 'ai' && generatedCampaign"
          color="primary"
          @click="createAICampaign"
        >
          Создать кампанию
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePromptsStore } from '@/stores/promptsStore'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'created'])

const promptsStore = usePromptsStore()
const knowledgeStore = useKnowledgeBaseStore()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref('manual')
const manualValid = ref(false)
const generatingCampaign = ref(false)
const generationStatus = ref('')
const generationProgress = ref(0)
const generatedCampaign = ref(null)

const form = ref({
  name: '',
  channel: null,
  description: '',
  budget: 0,
  status: 'draft'
})

const aiForm = ref({
  template: null,
  inputData: '',
  includeMediaMix: true,
  includeMediaPlan: true,
  channels: []
})

const rules = {
  required: v => !!v || 'Поле обязательно для заполнения'
}

const channelOptions = [
  { title: 'Google Ads', value: 'Google Ads' },
  { title: 'Yandex Direct', value: 'Yandex Direct' },
  { title: 'Facebook', value: 'Facebook' },
  { title: 'Instagram', value: 'Instagram' },
  { title: 'YouTube', value: 'YouTube' },
  { title: 'VKontakte', value: 'VKontakte' },
  { title: 'Telegram', value: 'Telegram' },
  { title: 'Email', value: 'Email' }
]

const statusOptions = [
  { title: 'Черновик', value: 'draft' },
  { title: 'Активная', value: 'active' },
  { title: 'Приостановлена', value: 'paused' },
  { title: 'Завершена', value: 'completed' }
]

const aiEnabled = computed(() => {
  return promptsStore.prompts.length > 0 && availableTemplates.value.length > 0
})

const availableTemplates = computed(() => promptsStore.templates)

const enabledCorporateDocuments = computed(() =>
  knowledgeStore.corporateDocuments.filter(doc => doc.ai_enabled)
)

const getTemplateColor = (industry) => {
  const colors = {
    'E-commerce': 'purple',
    'Финансы': 'green',
    'Здравоохранение': 'red',
    'Образование': 'blue',
    'Технологии': 'cyan'
  }
  return colors[industry] || 'grey'
}

const getTemplateIcon = (industry) => {
  const icons = {
    'E-commerce': 'mdi-cart',
    'Финансы': 'mdi-bank',
    'Здравоохранение': 'mdi-medical-bag',
    'Образование': 'mdi-school',
    'Технологии': 'mdi-laptop'
  }
  return icons[industry] || 'mdi-briefcase'
}

const getDocumentTypeColor = (type) => {
  const colors = {
    company_description: 'primary',
    marketing_strategy: 'success',
    brand_guide: 'purple',
    positioning: 'info',
    target_audience: 'orange',
    competitors: 'red'
  }
  return colors[type] || 'grey'
}

const getDocumentTypeIcon = (type) => {
  const icons = {
    company_description: 'mdi-office-building',
    marketing_strategy: 'mdi-strategy',
    brand_guide: 'mdi-palette',
    positioning: 'mdi-target',
    target_audience: 'mdi-account-group',
    competitors: 'mdi-sword-cross'
  }
  return icons[type] || 'mdi-file'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const generateCampaign = async () => {
  generatingCampaign.value = true
  generationProgress.value = 0
  generatedCampaign.value = null

  try {
    // Симуляция прогресса генерации
    const steps = [
      'Анализ входных данных...',
      'Создание карточки кампании...',
      'Извлечение параметров...',
      'Генерация медиа-микса...',
      'Оптимизация стратегии...',
      'Создание медиа-плана...',
      'Финализация результатов...'
    ]

    for (let i = 0; i < steps.length; i++) {
      generationStatus.value = steps[i]
      generationProgress.value = ((i + 1) / steps.length) * 100
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Запуск конвейера промптов
    const pipelineResult = await promptsStore.executePipeline({
      input_data: aiForm.value.inputData,
      template_id: aiForm.value.template,
      settings: {
        include_media_mix: aiForm.value.includeMediaMix,
        include_media_plan: aiForm.value.includeMediaPlan,
        preferred_channels: aiForm.value.channels,
        corporate_documents: enabledCorporateDocuments.value.map(doc => doc.document_id)
      }
    })

    // Парсим результат (в реальном приложении это будет JSON из ИИ)
    generatedCampaign.value = {
      name: `AI-сгенерированная кампания ${new Date().toLocaleDateString()}`,
      description: pipelineResult.campaign_description || 'Описание сгенерировано ИИ',
      budget: pipelineResult.recommended_budget || 500000,
      channels: pipelineResult.recommended_channels || ['Google Ads', 'Facebook', 'Instagram'],
      status: 'draft',
      ai_generated: true,
      pipeline_id: pipelineResult.execution_id
    }

  } catch (error) {
    console.error('Ошибка генерации кампании:', error)
    generationStatus.value = 'Ошибка генерации'
  } finally {
    generatingCampaign.value = false
  }
}

const createCampaign = () => {
  emit('created', form.value)
  resetDialog()
}

const createAICampaign = () => {
  emit('created', generatedCampaign.value)
  resetDialog()
}

const resetDialog = () => {
  dialog.value = false
  activeTab.value = 'manual'
  form.value = {
    name: '',
    channel: null,
    description: '',
    budget: 0,
    status: 'draft'
  }
  aiForm.value = {
    template: null,
    inputData: '',
    includeMediaMix: true,
    includeMediaPlan: true,
    channels: []
  }
  generatedCampaign.value = null
  generatingCampaign.value = false
  generationProgress.value = 0
}

onMounted(async () => {
  // Загружаем данные для ИИ-генерации
  await Promise.all([
    promptsStore.loadPrompts(),
    promptsStore.loadCampaignTemplates(),
    knowledgeStore.loadMarketingDocuments({ category: 'corporate' })
  ])
})
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>