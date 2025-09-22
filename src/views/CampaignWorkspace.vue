<template>
  <div class="campaign-workspace">
    <!-- Заголовок -->
    <div class="d-flex align-center mb-6">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        @click="goBack"
        class="me-3"
      />
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">{{ campaign?.name || 'Загрузка...' }}</h1>
        <p class="text-body-1 text-medium-emphasis">
          {{ campaign?.description || 'Рабочее пространство кампании' }}
        </p>
      </div>
      <v-spacer />

      <div class="d-flex align-center ga-3">
        <!-- Статус кампании -->
        <v-chip
          v-if="campaign"
          :color="getStatusColor(campaign.status)"
          size="large"
          variant="flat"
        >
          {{ getStatusText(campaign.status) }}
        </v-chip>

        <!-- Действия -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              v-bind="props"
            />
          </template>
          <v-list>
            <v-list-item @click="createVersion">
              <v-list-item-title>Создать версию</v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportCampaign">
              <v-list-item-title>Экспортировать</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item
              @click="promoteToActivity"
              :disabled="campaign?.status !== 'approved'"
            >
              <v-list-item-title>Перенести в Activities</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <v-card v-if="campaign">
      <!-- Навигация по шагам -->
      <v-tabs
        v-model="activeStep"
        bg-color="grey-lighten-4"
        color="primary"
        align-tabs="start"
      >
        <v-tab value="documents">
          <v-icon start>mdi-file-document</v-icon>
          Документы и Параметры
          <v-badge
            v-if="documentsCount > 0"
            :content="documentsCount"
            color="primary"
            class="ml-2"
          />
        </v-tab>

        <v-tab value="checklist">
          <v-icon start>mdi-clipboard-check</v-icon>
          Чек-лист
          <v-badge
            v-if="checklistCompletionRate < 100"
            :content="`${checklistCompletionRate}%`"
            :color="checklistCompletionRate === 100 ? 'success' : 'warning'"
            class="ml-2"
          />
        </v-tab>

        <v-tab value="mediamix">
          <v-icon start>mdi-chart-donut</v-icon>
          Медиамикс
          <v-badge
            v-if="mediaMixVariantsCount > 0"
            :content="mediaMixVariantsCount"
            color="info"
            class="ml-2"
          />
        </v-tab>

        <v-tab value="mediaplan">
          <v-icon start>mdi-calendar-clock</v-icon>
          Медиаплан
          <v-badge
            v-if="mediaPlanVariantsCount > 0"
            :content="mediaPlanVariantsCount"
            color="success"
            class="ml-2"
          />
        </v-tab>
      </v-tabs>

      <!-- Контент шагов -->
      <v-card-text class="pa-0">
        <v-tabs-window v-model="activeStep">
          <!-- Шаг 1: Документы и параметры -->
          <v-tabs-window-item value="documents">
            <div class="pa-6">
              <v-row>
                <!-- Загрузка документов -->
                <v-col cols="12" lg="4">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="me-2">mdi-upload</v-icon>
                      Документы кампании
                    </v-card-title>
                    <v-card-text>
                      <v-file-input
                        v-model="newDocuments"
                        label="Выберите файлы"
                        variant="outlined"
                        multiple
                        accept=".pdf,.doc,.docx"
                        prepend-icon="mdi-paperclip"
                        show-size
                        @update:model-value="uploadDocuments"
                      />

                      <div v-if="campaignDocuments.length > 0" class="mt-4">
                        <h4 class="text-subtitle-1 mb-2">Загруженные документы:</h4>
                        <v-list density="compact">
                          <v-list-item
                            v-for="doc in campaignDocuments"
                            :key="doc.document_id"
                            class="px-0"
                          >
                            <v-list-item-title>{{ doc.file_name }}</v-list-item-title>
                            <template v-slot:append>
                              <v-chip
                                :color="getDocumentStatusColor(doc.processing_status)"
                                size="x-small"
                                variant="flat"
                              >
                                {{ getDocumentStatusText(doc.processing_status) }}
                              </v-chip>
                            </template>
                          </v-list-item>
                        </v-list>
                      </div>

                      <v-btn
                        v-if="campaignDocuments.length > 0"
                        color="primary"
                        variant="flat"
                        prepend-icon="mdi-robot"
                        @click="processDocumentsWithAI"
                        :loading="isProcessingDocuments"
                        class="mt-4"
                        block
                      >
                        Запустить анализ ИИ
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Параметры кампании -->
                <v-col cols="12" lg="8">
                  <v-tabs v-model="parametersView" color="primary">
                    <v-tab value="card">
                      <v-icon start>mdi-card-text</v-icon>
                      Карточка кампании
                    </v-tab>
                    <v-tab value="table">
                      <v-icon start>mdi-table</v-icon>
                      Таблица параметров
                    </v-tab>
                  </v-tabs>

                  <v-tabs-window v-model="parametersView">
                    <!-- Карточка кампании -->
                    <v-tabs-window-item value="card">
                      <v-card variant="outlined" class="mt-4">
                        <v-card-title>Карточка рекламной кампании</v-card-title>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.name"
                                label="Название кампании"
                                variant="outlined"
                                readonly
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.category"
                                label="Категория"
                                variant="outlined"
                                readonly
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-textarea
                                v-model="campaignCard.objective"
                                label="Цель кампании"
                                variant="outlined"
                                rows="2"
                                readonly
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.target_audience"
                                label="Целевая аудитория"
                                variant="outlined"
                                readonly
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.budget_total"
                                label="Общий бюджет"
                                variant="outlined"
                                readonly
                              />
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tabs-window-item>

                    <!-- Таблица параметров -->
                    <v-tabs-window-item value="table">
                      <v-card variant="outlined" class="mt-4">
                        <v-card-title>Таблица параметров</v-card-title>
                        <v-card-text>
                          <v-data-table
                            :headers="parameterHeaders"
                            :items="campaignParameters"
                            density="compact"
                            item-value="param_id"
                          >
                            <template #item.param_type="{ item }">
                              <v-chip
                                :color="getParamTypeColor(item.param_type)"
                                size="small"
                                variant="tonal"
                              >
                                {{ item.param_type }}
                              </v-chip>
                            </template>

                            <template #item.confidence_level="{ item }">
                              <v-chip
                                :color="getConfidenceColor(item.confidence_level)"
                                size="small"
                                variant="outlined"
                              >
                                {{ item.confidence_level }}
                              </v-chip>
                            </template>

                            <template #item.param_value="{ item }">
                              <v-text-field
                                v-model="item.param_value"
                                variant="plain"
                                density="compact"
                                hide-details
                                @blur="updateParameter(item)"
                              />
                            </template>

                            <template #item.comment="{ item }">
                              <v-text-field
                                v-model="item.comment"
                                variant="plain"
                                density="compact"
                                hide-details
                                placeholder="Добавить комментарий"
                                @blur="updateParameter(item)"
                              />
                            </template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </v-tabs-window-item>
                  </v-tabs-window>
                </v-col>
              </v-row>
            </div>
          </v-tabs-window-item>

          <!-- Шаг 2: Чек-лист -->
          <v-tabs-window-item value="checklist">
            <div class="pa-6">
              <v-card variant="outlined">
                <v-card-title class="d-flex align-center">
                  <v-icon class="me-2">mdi-clipboard-check</v-icon>
                  Чек-лист готовности к моделированию
                  <v-spacer />
                  <v-btn
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-refresh"
                    @click="validateCampaignData"
                  >
                    Обновить статус
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item
                      v-for="item in checklistItems"
                      :key="item.checklist_item_id"
                      class="px-0"
                    >
                      <template v-slot:prepend>
                        <v-icon
                          :color="getChecklistStatusColor(item.status)"
                          :icon="getChecklistStatusIcon(item.status)"
                          class="me-4"
                        />
                      </template>

                      <v-list-item-title>{{ item.item_name }}</v-list-item-title>

                      <template v-slot:append>
                        <v-chip
                          :color="getChecklistStatusColor(item.status)"
                          size="small"
                          variant="flat"
                        >
                          {{ item.status }}
                        </v-chip>
                      </template>

                      <v-list-item-subtitle v-if="item.comment">
                        {{ item.comment }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </div>
          </v-tabs-window-item>

          <!-- Шаг 3: Медиамикс -->
          <v-tabs-window-item value="mediamix">
            <div class="pa-6">
              <div class="d-flex align-center mb-4">
                <h3 class="text-h6">Моделирование медиамикса</h3>
                <v-spacer />
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-robot"
                  @click="generateMediaMix"
                  :loading="isGeneratingMediaMix"
                  :disabled="checklistCompletionRate < 100"
                >
                  Сгенерировать медиамикс
                </v-btn>
              </div>

              <v-alert
                v-if="checklistCompletionRate < 100"
                type="warning"
                variant="tonal"
                class="mb-4"
              >
                Завершите чек-лист перед генерацией медиамикса
              </v-alert>

              <!-- Варианты медиамикса -->
              <div v-if="mediaMixVariants.length > 0">
                <v-select
                  v-model="selectedMediaMixVariant"
                  :items="mediaMixVariantOptions"
                  label="Выберите вариант медиамикса"
                  variant="outlined"
                  class="mb-4"
                />

                <v-card variant="outlined" v-if="selectedMediaMixVariant">
                  <v-card-title class="d-flex align-center">
                    Медиамикс: {{ selectedMediaMixVariant.name }}
                    <v-spacer />
                    <v-btn
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-tune"
                      @click="showOptimizationDialog = true"
                    >
                      Оптимизировать
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <MediaMixTable
                      :items="currentMediaMixItems"
                      @update:item="updateMediaMixItem"
                    />
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- Шаг 4: Медиаплан -->
          <v-tabs-window-item value="mediaplan">
            <div class="pa-6">
              <div class="d-flex align-center mb-4">
                <h3 class="text-h6">Медиаплан</h3>
                <v-spacer />
                <div class="d-flex ga-2">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-calendar-plus"
                    @click="generateMediaPlan"
                    :loading="isGeneratingMediaPlan"
                    :disabled="!selectedMediaMixVariant"
                  >
                    Создать медиаплан
                  </v-btn>

                  <v-btn
                    v-if="currentMediaPlan"
                    color="success"
                    variant="flat"
                    prepend-icon="mdi-download"
                    @click="exportMediaPlan"
                  >
                    Экспорт
                  </v-btn>
                </div>
              </div>

              <v-card variant="outlined" v-if="currentMediaPlan">
                <v-card-title>
                  {{ currentMediaPlan.name }}
                </v-card-title>
                <v-card-text>
                  <MediaPlanTable
                    :items="currentMediaPlanItems"
                    @update:item="updateMediaPlanItem"
                  />
                </v-card-text>
              </v-card>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>

    <!-- Диалог оптимизации -->
    <v-dialog v-model="showOptimizationDialog" max-width="400">
      <v-card>
        <v-card-title>Цель оптимизации</v-card-title>
        <v-card-text>
          <v-radio-group v-model="optimizationGoal">
            <v-radio label="Максимизировать ROI" value="roi" />
            <v-radio label="Максимизировать охват" value="reach" />
            <v-radio label="Снизить CPM" value="cpm" />
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showOptimizationDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :loading="isOptimizing"
            @click="optimizeMediaMix"
          >
            Оптимизировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'

// Создам заглушки для компонентов, которые создам позже
const MediaMixTable = {
  props: ['items'],
  emits: ['update:item'],
  template: `
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th>Канал</th>
            <th>Бюджет</th>
            <th>Охват</th>
            <th>CPM</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.mix_item_id">
            <td>{{ item.channel_name }}</td>
            <td>{{ formatCurrency(item.budget) }}</td>
            <td>{{ item.reach?.toLocaleString() }}</td>
            <td>{{ formatCurrency(item.cpm) }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  `,
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount || 0)
    }
  }
}

const MediaPlanTable = {
  props: ['items'],
  emits: ['update:item'],
  template: `
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th>Название</th>
            <th>Канал</th>
            <th>Период</th>
            <th>Стоимость</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.plan_item_id">
            <td>{{ item.name }}</td>
            <td>{{ item.channel_name }}</td>
            <td>{{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}</td>
            <td>{{ formatCurrency(item.cost) }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  `,
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount || 0)
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('ru-RU')
    }
  }
}

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const campaignId = route.params.id

// Reactive data
const campaign = ref(null)
const activeStep = ref('documents')
const parametersView = ref('card')
const newDocuments = ref([])
const isProcessingDocuments = ref(false)
const isGeneratingMediaMix = ref(false)
const isGeneratingMediaPlan = ref(false)
const isOptimizing = ref(false)
const showOptimizationDialog = ref(false)
const optimizationGoal = ref('roi')
const selectedMediaMixVariant = ref(null)

// Mock data
const campaignDocuments = ref([])
const campaignParameters = ref([])
const checklistItems = ref([
  {
    checklist_item_id: '1',
    item_name: 'Цель кампании определена',
    status: 'Да',
    comment: 'Извлечено из брифа'
  },
  {
    checklist_item_id: '2',
    item_name: 'Целевая аудитория описана',
    status: 'Частично',
    comment: 'Нужно уточнить возрастные группы'
  },
  {
    checklist_item_id: '3',
    item_name: 'Бюджет указан',
    status: 'Да',
    comment: ''
  },
  {
    checklist_item_id: '4',
    item_name: 'География размещения',
    status: 'Нет',
    comment: 'Не указана в документах'
  },
  {
    checklist_item_id: '5',
    item_name: 'KPI определены',
    status: 'Да',
    comment: 'Лиды, ROI'
  }
])

const mediaMixVariants = ref([])
const currentMediaMixItems = ref([])
const mediaPlanVariants = ref([])
const currentMediaPlan = ref(null)
const currentMediaPlanItems = ref([])

const campaignCard = ref({
  name: '',
  category: '',
  objective: '',
  target_audience: '',
  budget_total: ''
})

const parameterHeaders = [
  { title: 'Параметр', key: 'param_name', sortable: true },
  { title: 'Тип', key: 'param_type', sortable: true },
  { title: 'Значение', key: 'param_value', sortable: false },
  { title: 'Источник', key: 'source', sortable: true },
  { title: 'Уверенность', key: 'confidence_level', sortable: true },
  { title: 'Комментарий', key: 'comment', sortable: false }
]

// Computed
const documentsCount = computed(() => campaignDocuments.value.length)
const checklistCompletionRate = computed(() => {
  const completed = checklistItems.value.filter(item => item.status === 'Да').length
  return Math.round((completed / checklistItems.value.length) * 100)
})
const mediaMixVariantsCount = computed(() => mediaMixVariants.value.length)
const mediaPlanVariantsCount = computed(() => mediaPlanVariants.value.length)

const mediaMixVariantOptions = computed(() =>
  mediaMixVariants.value.map(variant => ({
    title: variant.name,
    value: variant,
    subtitle: variant.description
  }))
)

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    'draft': 'grey',
    'processing': 'blue',
    'review': 'orange',
    'approved': 'green',
    'rejected': 'red'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'draft': 'Черновик',
    'processing': 'Обрабатывается',
    'review': 'На рассмотрении',
    'approved': 'Утверждена',
    'rejected': 'Отклонена'
  }
  return texts[status] || status
}

const getDocumentStatusColor = (status) => {
  const colors = {
    'uploaded': 'blue',
    'processing': 'orange',
    'processed': 'green',
    'error': 'red'
  }
  return colors[status] || 'grey'
}

const getDocumentStatusText = (status) => {
  const texts = {
    'uploaded': 'Загружен',
    'processing': 'Обработка',
    'processed': 'Обработан',
    'error': 'Ошибка'
  }
  return texts[status] || status
}

const getParamTypeColor = (type) => {
  const colors = {
    'ЦА': 'blue',
    'география': 'green',
    'каналы': 'purple',
    'форматы': 'orange',
    'стратегия': 'teal',
    'KPI': 'red',
    'ограничение': 'brown',
    'период': 'indigo'
  }
  return colors[type] || 'grey'
}

const getConfidenceColor = (confidence) => {
  const colors = {
    'высокий': 'green',
    'средний': 'orange',
    'низкий': 'red',
    'предположено': 'grey'
  }
  return colors[confidence] || 'grey'
}

const getChecklistStatusColor = (status) => {
  const colors = {
    'Да': 'success',
    'Частично': 'warning',
    'Нет': 'error'
  }
  return colors[status] || 'grey'
}

const getChecklistStatusIcon = (status) => {
  const icons = {
    'Да': 'mdi-check-circle',
    'Частично': 'mdi-alert-circle',
    'Нет': 'mdi-close-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

// Methods
const goBack = () => {
  router.push('/campaigns')
}

const loadCampaign = async () => {
  try {
    // TODO: API call getCampaign(campaignId)
    // Mock data
    campaign.value = {
      ai_campaign_id: campaignId,
      name: 'Кампания "Живи на своём" Q1 2025',
      description: 'Продвижение банковских услуг для молодежи',
      objective: 'Увеличить количество лидов на 30%',
      campaign_category: 'performance',
      status: 'draft',
      version: 'v1',
      created_by: 'Иван Петров',
      budget_limit: {
        online: 8000000,
        offline: 1500000
      }
    }

    // Загружаем связанные данные
    await loadCampaignData()
  } catch (error) {
    console.error('Error loading campaign:', error)
    appStore.showError('Ошибка загрузки кампании')
  }
}

const loadCampaignData = async () => {
  // TODO: Загрузка документов, параметров и другой связанной информации
}

const uploadDocuments = async () => {
  if (newDocuments.value.length === 0) return

  try {
    // TODO: API call uploadDocument(campaignId, file)
    newDocuments.value.forEach((file, index) => {
      campaignDocuments.value.push({
        document_id: `doc_${Date.now()}_${index}`,
        file_name: file.name,
        file_type: file.type,
        processing_status: 'uploaded',
        uploaded_at: new Date()
      })
    })

    appStore.showSuccess('Документы загружены')
    newDocuments.value = []
  } catch (error) {
    console.error('Error uploading documents:', error)
    appStore.showError('Ошибка загрузки документов')
  }
}

const processDocumentsWithAI = async () => {
  isProcessingDocuments.value = true
  try {
    // TODO: API call processDocumentWithLlm для каждого документа

    // Имитация обработки
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Обновляем статус документов
    campaignDocuments.value.forEach(doc => {
      doc.processing_status = 'processed'
    })

    // Генерируем параметры
    campaignParameters.value = [
      {
        param_id: '1',
        param_name: 'Целевая аудитория',
        param_type: 'ЦА',
        param_value: 'Молодежь 18-25 лет, средний доход',
        source: 'document',
        confidence_level: 'высокий',
        comment: ''
      },
      {
        param_id: '2',
        param_name: 'География',
        param_type: 'география',
        param_value: 'Москва, СПб, крупные города',
        source: 'document',
        confidence_level: 'средний',
        comment: ''
      },
      {
        param_id: '3',
        param_name: 'Каналы размещения',
        param_type: 'каналы',
        param_value: 'Instagram, VK, YouTube, ТВ',
        source: 'calculated',
        confidence_level: 'высокий',
        comment: 'Рекомендация на основе ЦА'
      }
    ]

    // Обновляем карточку кампании
    campaignCard.value = {
      name: campaign.value.name,
      category: 'Performance',
      objective: campaign.value.objective,
      target_audience: 'Молодежь 18-25 лет',
      budget_total: '9.5 млн ₽'
    }

    appStore.showSuccess('Документы обработаны ИИ')
  } catch (error) {
    console.error('Error processing documents:', error)
    appStore.showError('Ошибка обработки документов')
  } finally {
    isProcessingDocuments.value = false
  }
}

const updateParameter = async (parameter) => {
  try {
    // TODO: API call updateCampaignParam
    console.log('Updating parameter:', parameter)
  } catch (error) {
    console.error('Error updating parameter:', error)
  }
}

const validateCampaignData = async () => {
  try {
    // TODO: API call validateCampaignData
    appStore.showSuccess('Статус чек-листа обновлен')
  } catch (error) {
    console.error('Error validating campaign data:', error)
    appStore.showError('Ошибка проверки данных')
  }
}

const generateMediaMix = async () => {
  isGeneratingMediaMix.value = true
  try {
    // TODO: API call generateInitialMediaMix

    // Имитация генерации
    await new Promise(resolve => setTimeout(resolve, 3000))

    const newVariant = {
      mix_variant_id: `mix_${Date.now()}`,
      name: 'Черновой медиамикс',
      description: 'Первичный вариант, сгенерированный ИИ',
      status: 'draft',
      total_budget: 8000000,
      total_reach: 2500000,
      source: 'generated_llm'
    }

    mediaMixVariants.value.push(newVariant)
    selectedMediaMixVariant.value = newVariant

    // Генерируем строки медиамикса
    currentMediaMixItems.value = [
      {
        mix_item_id: '1',
        channel_name: 'Instagram',
        budget: 3000000,
        reach: 1200000,
        cpm: 250
      },
      {
        mix_item_id: '2',
        channel_name: 'VK',
        budget: 2000000,
        reach: 800000,
        cpm: 250
      },
      {
        mix_item_id: '3',
        channel_name: 'YouTube',
        budget: 2000000,
        reach: 400000,
        cpm: 500
      },
      {
        mix_item_id: '4',
        channel_name: 'ТВ',
        budget: 1000000,
        reach: 100000,
        cpm: 10000
      }
    ]

    appStore.showSuccess('Медиамикс сгенерирован')
  } catch (error) {
    console.error('Error generating media mix:', error)
    appStore.showError('Ошибка генерации медиамикса')
  } finally {
    isGeneratingMediaMix.value = false
  }
}

const optimizeMediaMix = async () => {
  isOptimizing.value = true
  try {
    // TODO: API call optimizeMediaMix

    await new Promise(resolve => setTimeout(resolve, 2000))

    const optimizedVariant = {
      mix_variant_id: `mix_${Date.now()}`,
      name: `Оптимизированный (${optimizationGoal.value.toUpperCase()})`,
      description: `Оптимизирован для ${optimizationGoal.value}`,
      status: 'active',
      total_budget: 8000000,
      total_reach: 2800000,
      source: 'optimized_llm'
    }

    mediaMixVariants.value.push(optimizedVariant)
    selectedMediaMixVariant.value = optimizedVariant

    // Обновляем строки с оптимизированными значениями
    currentMediaMixItems.value = [
      {
        mix_item_id: '1',
        channel_name: 'Instagram',
        budget: 3500000,
        reach: 1400000,
        cpm: 250
      },
      {
        mix_item_id: '2',
        channel_name: 'YouTube',
        budget: 3000000,
        reach: 600000,
        cpm: 500
      },
      {
        mix_item_id: '3',
        channel_name: 'ТВ',
        budget: 1500000,
        reach: 150000,
        cpm: 10000
      }
    ]

    showOptimizationDialog.value = false
    appStore.showSuccess('Медиамикс оптимизирован')
  } catch (error) {
    console.error('Error optimizing media mix:', error)
    appStore.showError('Ошибка оптимизации медиамикса')
  } finally {
    isOptimizing.value = false
  }
}

const updateMediaMixItem = (item) => {
  // TODO: API call updateMediaMixItem
  console.log('Updating media mix item:', item)
}

const generateMediaPlan = async () => {
  isGeneratingMediaPlan.value = true
  try {
    // TODO: API call generateMediaPlan

    await new Promise(resolve => setTimeout(resolve, 2000))

    currentMediaPlan.value = {
      plan_variant_id: `plan_${Date.now()}`,
      name: 'Медиаплан Q1 2025',
      status: 'draft',
      total_budget: selectedMediaMixVariant.value.total_budget,
      start_date: '2025-01-01',
      end_date: '2025-03-31'
    }

    // Генерируем строки медиаплана
    currentMediaPlanItems.value = [
      {
        plan_item_id: '1',
        name: 'Instagram Stories + Feed',
        channel_name: 'Instagram',
        start_date: '2025-01-01',
        end_date: '2025-03-31',
        cost: 3500000
      },
      {
        plan_item_id: '2',
        name: 'YouTube Pre-roll',
        channel_name: 'YouTube',
        start_date: '2025-01-15',
        end_date: '2025-03-15',
        cost: 3000000
      },
      {
        plan_item_id: '3',
        name: 'ТВ Прайм-тайм',
        channel_name: 'ТВ',
        start_date: '2025-02-01',
        end_date: '2025-02-28',
        cost: 1500000
      }
    ]

    appStore.showSuccess('Медиаплан создан')
  } catch (error) {
    console.error('Error generating media plan:', error)
    appStore.showError('Ошибка создания медиаплана')
  } finally {
    isGeneratingMediaPlan.value = false
  }
}

const updateMediaPlanItem = (item) => {
  // TODO: API call updateMediaPlanItem
  console.log('Updating media plan item:', item)
}

const exportMediaPlan = async () => {
  try {
    // TODO: API call exportMediaPlan
    appStore.showSuccess('Медиаплан экспортирован')
  } catch (error) {
    console.error('Error exporting media plan:', error)
    appStore.showError('Ошибка экспорта медиаплана')
  }
}

const createVersion = async () => {
  try {
    // TODO: API call createCampaignVersion
    appStore.showSuccess('Версия кампании создана')
  } catch (error) {
    console.error('Error creating version:', error)
    appStore.showError('Ошибка создания версии')
  }
}

const exportCampaign = async () => {
  try {
    appStore.showSuccess('Кампания экспортирована')
  } catch (error) {
    console.error('Error exporting campaign:', error)
    appStore.showError('Ошибка экспорта кампании')
  }
}

const promoteToActivity = async () => {
  try {
    // TODO: API call promoteToActivity
    campaign.value.status = 'approved'
    appStore.showSuccess('Кампания перенесена в Activities')
  } catch (error) {
    console.error('Error promoting to activity:', error)
    appStore.showError('Ошибка переноса в Activities')
  }
}

// Watch для обновления строк медиамикса при смене варианта
watch(selectedMediaMixVariant, (newVariant) => {
  if (newVariant) {
    // TODO: Загрузить строки для выбранного варианта
    console.log('Loading media mix items for variant:', newVariant.mix_variant_id)
  }
})

onMounted(() => {
  loadCampaign()
})
</script>

<style scoped>
.campaign-workspace {
  padding: 24px;
}
</style>