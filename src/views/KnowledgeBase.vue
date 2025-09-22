<template>
  <div class="knowledge-base-view">
    <!-- Заголовок -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">База знаний ИИ</h1>
        <p class="text-body-1 text-medium-emphasis">
          Управление историческими данными и промптами для искусственного интеллекта
        </p>
      </div>
    </div>

    <v-row>
      <!-- Боковое меню -->
      <v-col cols="12" md="3">
        <v-card>
          <v-list nav>
            <v-list-subheader>База знаний</v-list-subheader>

            <v-list-item
              v-for="item in menuItems"
              :key="item.id"
              :value="item.id"
              :active="selectedSection === item.id"
              @click="selectedSection = item.id"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon" />
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Основной контент -->
      <v-col cols="12" md="9">
        <!-- Исторические данные по каналам -->
        <template v-if="selectedSection === 'channels'">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-chart-timeline-variant</v-icon>
              Исторические данные по каналам
              <v-spacer />
              <div class="d-flex ga-2">
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-upload"
                  @click="showImportDialog = true"
                >
                  Импорт
                </v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  @click="showAddChannelDialog = true"
                >
                  Добавить данные
                </v-btn>
              </div>
            </v-card-title>

            <v-card-text>
              <v-alert type="info" variant="tonal" class="mb-4">
                Эти данные используются ИИ для генерации и оптимизации медиамиксов
              </v-alert>

              <!-- Фильтры -->
              <v-row class="mb-4">
                <v-col cols="12" md="3">
                  <v-select
                    v-model="channelFilters.channel"
                    :items="channelOptions"
                    label="Канал"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="channelFilters.format"
                    :items="formatOptions"
                    label="Формат"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="channelFilters.audience"
                    :items="audienceOptions"
                    label="Аудитория"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-btn
                    variant="outlined"
                    prepend-icon="mdi-filter-off"
                    @click="clearChannelFilters"
                  >
                    Сбросить
                  </v-btn>
                </v-col>
              </v-row>

              <v-data-table
                :headers="channelHeaders"
                :items="filteredChannelData"
                :loading="isLoadingChannels"
                class="elevation-0"
                item-value="kb_channel_id"
              >
                <template #item.channel_name="{ item }">
                  <div class="d-flex align-center">
                    <v-avatar :color="getChannelColor(item.channel_name)" size="small" class="me-2">
                      <v-icon color="white" size="small">{{ getChannelIcon(item.channel_name) }}</v-icon>
                    </v-avatar>
                    {{ item.channel_name }}
                  </div>
                </template>

                <template #item.kpi_value="{ item }">
                  <div class="text-right">
                    {{ formatKPIValue(item.kpi_value, item.kpi_type) }}
                  </div>
                </template>

                <template #item.reliability="{ item }">
                  <v-chip
                    :color="getReliabilityColor(item.reliability)"
                    size="small"
                    variant="tonal"
                  >
                    {{ item.reliability }}
                  </v-chip>
                </template>

                <template #item.actions="{ item }">
                  <div class="d-flex ga-1">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editChannelData(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteChannelData(item)"
                    />
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </template>

        <!-- Управление промптами -->
        <template v-if="selectedSection === 'prompts'">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-script-text</v-icon>
              Промпты для ИИ
              <v-spacer />
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                @click="showAddPromptDialog = true"
              >
                Добавить промпт
              </v-btn>
            </v-card-title>

            <v-card-text>
              <v-alert type="info" variant="tonal" class="mb-4">
                Настройка инструкций для LLM модели. Изменения влияют на качество генерируемых данных.
              </v-alert>

              <v-row>
                <!-- Список промптов -->
                <v-col cols="12" md="4">
                  <v-card variant="outlined">
                    <v-list nav density="compact">
                      <v-list-subheader>Доступные промпты</v-list-subheader>
                      <v-list-item
                        v-for="prompt in prompts"
                        :key="prompt.prompt_id"
                        :value="prompt.prompt_id"
                        :active="selectedPrompt?.prompt_id === prompt.prompt_id"
                        @click="selectPrompt(prompt)"
                      >
                        <v-list-item-title>{{ prompt.name }}</v-list-item-title>
                        <template v-slot:append>
                          <v-btn
                            icon="mdi-delete"
                            size="x-small"
                            variant="text"
                            color="error"
                            @click.stop="deletePrompt(prompt)"
                          />
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-col>

                <!-- Редактор промпта -->
                <v-col cols="12" md="8">
                  <v-card variant="outlined" v-if="selectedPrompt">
                    <v-card-title>{{ selectedPrompt.name }}</v-card-title>
                    <v-card-text>
                      <v-text-field
                        v-model="selectedPrompt.name"
                        label="Название промпта"
                        variant="outlined"
                        class="mb-4"
                      />

                      <v-textarea
                        v-model="selectedPrompt.role_description"
                        label="Описание роли"
                        variant="outlined"
                        rows="3"
                        class="mb-4"
                        hint="Определение роли и контекста для ИИ"
                      />

                      <v-textarea
                        v-model="selectedPrompt.instruction_text"
                        label="Текст инструкции"
                        variant="outlined"
                        rows="10"
                        class="mb-4"
                        hint="Основной текст промпта с инструкциями для ИИ"
                      />

                      <v-select
                        v-model="selectedPrompt.output_format"
                        :items="outputFormatOptions"
                        label="Формат вывода"
                        variant="outlined"
                        class="mb-4"
                      />

                      <div class="d-flex justify-end ga-2">
                        <v-btn
                          variant="outlined"
                          @click="resetPrompt"
                        >
                          Сбросить
                        </v-btn>
                        <v-btn
                          color="primary"
                          :loading="isSavingPrompt"
                          @click="savePrompt"
                        >
                          Сохранить
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>

                  <v-card variant="outlined" v-else>
                    <v-card-text class="text-center py-8">
                      <v-icon size="64" color="grey-lighten-1" class="mb-4">
                        mdi-script-text-outline
                      </v-icon>
                      <h3 class="text-h6 mb-2">Выберите промпт для редактирования</h3>
                      <p class="text-body-2 text-medium-emphasis">
                        Выберите промпт из списка слева или создайте новый
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>
      </v-col>
    </v-row>

    <!-- Диалог добавления данных канала -->
    <v-dialog v-model="showAddChannelDialog" max-width="600">
      <v-card>
        <v-card-title>Добавить исторические данные</v-card-title>
        <v-card-text>
          <v-form ref="channelForm" v-model="isChannelFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newChannelData.channel_name"
                  :items="channelOptions"
                  label="Канал"
                  variant="outlined"
                  :rules="[v => !!v || 'Канал обязателен']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newChannelData.ad_format"
                  :items="formatOptions"
                  label="Формат рекламы"
                  variant="outlined"
                  :rules="[v => !!v || 'Формат обязателен']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newChannelData.audience_segment"
                  :items="audienceOptions"
                  label="Сегмент аудитории"
                  variant="outlined"
                  :rules="[v => !!v || 'Аудитория обязательна']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newChannelData.period"
                  label="Период"
                  variant="outlined"
                  placeholder="Q4 2024"
                  :rules="[v => !!v || 'Период обязателен']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newChannelData.kpi_type"
                  :items="kpiTypeOptions"
                  label="Тип KPI"
                  variant="outlined"
                  :rules="[v => !!v || 'Тип KPI обязателен']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newChannelData.kpi_value"
                  label="Значение KPI"
                  variant="outlined"
                  type="number"
                  step="0.01"
                  :rules="[v => v !== null && v !== '' || 'Значение обязательно']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newChannelData.source"
                  label="Источник данных"
                  variant="outlined"
                  placeholder="Google Analytics, Facebook Ads"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newChannelData.reliability"
                  :items="reliabilityOptions"
                  label="Надежность"
                  variant="outlined"
                  :rules="[v => !!v || 'Надежность обязательна']"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showAddChannelDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!isChannelFormValid"
            :loading="isSavingChannel"
            @click="saveChannelData"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог добавления промпта -->
    <v-dialog v-model="showAddPromptDialog" max-width="600">
      <v-card>
        <v-card-title>Добавить новый промпт</v-card-title>
        <v-card-text>
          <v-form ref="promptForm" v-model="isPromptFormValid">
            <v-text-field
              v-model="newPrompt.name"
              label="Название промпта"
              variant="outlined"
              :rules="[v => !!v || 'Название обязательно']"
              required
              class="mb-4"
            />

            <v-textarea
              v-model="newPrompt.role_description"
              label="Описание роли"
              variant="outlined"
              rows="3"
              class="mb-4"
            />

            <v-textarea
              v-model="newPrompt.instruction_text"
              label="Текст инструкции"
              variant="outlined"
              rows="6"
              :rules="[v => !!v || 'Инструкция обязательна']"
              required
              class="mb-4"
            />

            <v-select
              v-model="newPrompt.output_format"
              :items="outputFormatOptions"
              label="Формат вывода"
              variant="outlined"
              :rules="[v => !!v || 'Формат обязателен']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showAddPromptDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!isPromptFormValid"
            :loading="isSavingNewPrompt"
            @click="saveNewPrompt"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог импорта -->
    <v-dialog v-model="showImportDialog" max-width="500">
      <v-card>
        <v-card-title>Импорт исторических данных</v-card-title>
        <v-card-text>
          <v-file-input
            v-model="importFile"
            label="Выберите файл Excel"
            variant="outlined"
            accept=".xlsx,.xls,.csv"
            prepend-icon="mdi-file-excel"
            show-size
          />
          <v-alert type="info" variant="tonal" class="mt-4">
            Поддерживаемые форматы: Excel (.xlsx, .xls), CSV (.csv)
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showImportDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!importFile"
            :loading="isImporting"
            @click="importChannelData"
          >
            Импортировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

// Reactive data
const selectedSection = ref('channels')
const selectedPrompt = ref(null)
const isLoadingChannels = ref(false)
const isSavingPrompt = ref(false)
const isSavingChannel = ref(false)
const isSavingNewPrompt = ref(false)
const isImporting = ref(false)
const showAddChannelDialog = ref(false)
const showAddPromptDialog = ref(false)
const showImportDialog = ref(false)
const isChannelFormValid = ref(false)
const isPromptFormValid = ref(false)
const importFile = ref(null)

const channelFilters = ref({
  channel: null,
  format: null,
  audience: null
})

const newChannelData = ref({
  channel_name: '',
  ad_format: '',
  audience_segment: '',
  period: '',
  kpi_type: '',
  kpi_value: null,
  source: '',
  reliability: ''
})

const newPrompt = ref({
  name: '',
  role_description: '',
  instruction_text: '',
  output_format: ''
})

const menuItems = ref([
  {
    id: 'channels',
    title: 'Исторические данные',
    icon: 'mdi-chart-timeline-variant'
  },
  {
    id: 'prompts',
    title: 'Управление промптами',
    icon: 'mdi-script-text'
  }
])

// Mock data
const knowledgeBaseChannels = ref([
  {
    kb_channel_id: '1',
    channel_name: 'Instagram',
    ad_format: 'Stories',
    audience_segment: 'Молодежь 18-25',
    period: 'Q4 2024',
    kpi_type: 'CTR',
    kpi_value: 2.5,
    source: 'Facebook Ads Manager',
    reliability: 'высокий'
  },
  {
    kb_channel_id: '2',
    channel_name: 'Instagram',
    ad_format: 'Feed',
    audience_segment: 'Молодежь 18-25',
    period: 'Q4 2024',
    kpi_type: 'CPC',
    kpi_value: 45.50,
    source: 'Facebook Ads Manager',
    reliability: 'высокий'
  },
  {
    kb_channel_id: '3',
    channel_name: 'YouTube',
    ad_format: 'Pre-roll',
    audience_segment: 'Взрослые 25-35',
    period: 'Q4 2024',
    kpi_type: 'CPM',
    kpi_value: 250.00,
    source: 'Google Ads',
    reliability: 'средний'
  },
  {
    kb_channel_id: '4',
    channel_name: 'VK',
    ad_format: 'Лента новостей',
    audience_segment: 'Молодежь 18-30',
    period: 'Q4 2024',
    kpi_type: 'CTR',
    kpi_value: 1.8,
    source: 'VK Ads',
    reliability: 'средний'
  }
])

const prompts = ref([
  {
    prompt_id: '1',
    name: 'Промпт 1: Анализ документов',
    role_description: 'Эксперт по анализу маркетинговых документов и извлечению ключевой информации',
    instruction_text: 'Проанализируйте предоставленный документ и извлеките следующую информацию:\n\n1. Цель кампании\n2. Целевая аудитория\n3. Бюджет кампании\n4. География размещения\n5. Ключевые KPI\n6. Временные рамки\n\nОтветьте в структурированном формате JSON.',
    output_format: 'JSON'
  },
  {
    prompt_id: '2',
    name: 'Промпт 2: Формирование параметров',
    role_description: 'Специалист по медиапланированию и стратегическому планированию кампаний',
    instruction_text: 'На основе анализа документов создайте детализированную таблицу параметров кампании.\n\nДля каждого параметра укажите:\n- Название параметра\n- Тип (ЦА, география, каналы, форматы, стратегия, KPI, ограничение, период)\n- Значение\n- Источник (document/calculated)\n- Уровень уверенности\n\nЕсли информации недостаточно, сделайте обоснованные предположения на основе лучших практик.',
    output_format: 'JSON'
  },
  {
    prompt_id: '4',
    name: 'Промпт 4: Генерация медиамикса',
    role_description: 'Эксперт по медиапланированию с глубоким пониманием различных рекламных каналов',
    instruction_text: 'Создайте оптимальный медиамикс на основе:\n\n1. Параметров кампании\n2. Исторических данных по каналам\n3. Бюджетных ограничений\n4. Целевой аудитории\n\nРаспределите бюджет между каналами, учитывая:\n- Эффективность каналов для данной ЦА\n- Охват и частоту контактов\n- CPM и другие стоимостные показатели\n- Синергетический эффект между каналами',
    output_format: 'JSON'
  },
  {
    prompt_id: '5',
    name: 'Промпт 5: Оптимизация медиамикса',
    role_description: 'Аналитик по оптимизации рекламных кампаний',
    instruction_text: 'Оптимизируйте существующий медиамикс под указанную цель:\n\n- Максимизация ROI\n- Максимизация охвата\n- Снижение CPM\n\nПерераспределите бюджет между каналами, исключите неэффективные каналы или добавьте новые. Обоснуйте каждое изменение.',
    output_format: 'JSON'
  }
])

const channelHeaders = [
  { title: 'Канал', key: 'channel_name', sortable: true },
  { title: 'Формат', key: 'ad_format', sortable: true },
  { title: 'Аудитория', key: 'audience_segment', sortable: true },
  { title: 'Период', key: 'period', sortable: true },
  { title: 'KPI', key: 'kpi_type', sortable: true },
  { title: 'Значение', key: 'kpi_value', sortable: true },
  { title: 'Источник', key: 'source', sortable: true },
  { title: 'Надежность', key: 'reliability', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

const channelOptions = [
  'Instagram', 'Facebook', 'VK', 'YouTube', 'ТВ', 'Радио', 'Яндекс.Директ', 'Google Ads', 'Telegram'
]

const formatOptions = [
  'Stories', 'Feed', 'Реклама в ленте', 'Pre-roll', 'Баннер', 'Видеореклама', 'Аудиореклама', 'Поиск', 'КМС'
]

const audienceOptions = [
  'Молодежь 18-25', 'Взрослые 25-35', 'Средний возраст 35-45', 'Зрелые 45+', 'Женщины', 'Мужчины', 'Универсальная'
]

const kpiTypeOptions = [
  'CTR', 'CPC', 'CPM', 'CPA', 'ROAS', 'Конверсия', 'Охват', 'Частота'
]

const reliabilityOptions = [
  { title: 'Высокий', value: 'высокий' },
  { title: 'Средний', value: 'средний' },
  { title: 'Низкий', value: 'низкий' }
]

const outputFormatOptions = [
  { title: 'JSON', value: 'JSON' },
  { title: 'XML', value: 'XML' },
  { title: 'Plain Text', value: 'TEXT' }
]

// Computed
const filteredChannelData = computed(() => {
  let result = knowledgeBaseChannels.value

  if (channelFilters.value.channel) {
    result = result.filter(item => item.channel_name === channelFilters.value.channel)
  }
  if (channelFilters.value.format) {
    result = result.filter(item => item.ad_format === channelFilters.value.format)
  }
  if (channelFilters.value.audience) {
    result = result.filter(item => item.audience_segment === channelFilters.value.audience)
  }

  return result
})

// Helper functions
const getChannelColor = (channel) => {
  const colors = {
    'Instagram': 'pink',
    'Facebook': 'blue',
    'VK': 'indigo',
    'YouTube': 'red',
    'ТВ': 'green',
    'Радио': 'orange',
    'Яндекс.Директ': 'yellow',
    'Google Ads': 'teal',
    'Telegram': 'blue-grey'
  }
  return colors[channel] || 'grey'
}

const getChannelIcon = (channel) => {
  const icons = {
    'Instagram': 'mdi-instagram',
    'Facebook': 'mdi-facebook',
    'VK': 'mdi-vk',
    'YouTube': 'mdi-youtube',
    'ТВ': 'mdi-television',
    'Радио': 'mdi-radio',
    'Яндекс.Директ': 'mdi-yandex',
    'Google Ads': 'mdi-google-ads',
    'Telegram': 'mdi-telegram'
  }
  return icons[channel] || 'mdi-web'
}

const getReliabilityColor = (reliability) => {
  const colors = {
    'высокий': 'green',
    'средний': 'orange',
    'низкий': 'red'
  }
  return colors[reliability] || 'grey'
}

const formatKPIValue = (value, type) => {
  if (type === 'CTR' || type === 'Конверсия') {
    return `${value}%`
  }
  if (type === 'CPC' || type === 'CPM' || type === 'CPA') {
    return `${value} ₽`
  }
  if (type === 'ROAS') {
    return `${value}x`
  }
  return value?.toLocaleString() || '—'
}

// Methods
const clearChannelFilters = () => {
  channelFilters.value = {
    channel: null,
    format: null,
    audience: null
  }
}

const selectPrompt = (prompt) => {
  selectedPrompt.value = { ...prompt }
}

const resetPrompt = () => {
  if (selectedPrompt.value) {
    const original = prompts.value.find(p => p.prompt_id === selectedPrompt.value.prompt_id)
    if (original) {
      selectedPrompt.value = { ...original }
    }
  }
}

const savePrompt = async () => {
  isSavingPrompt.value = true
  try {
    // TODO: API call updatePrompt(selectedPrompt.value.prompt_id, selectedPrompt.value)

    // Обновляем в массиве
    const index = prompts.value.findIndex(p => p.prompt_id === selectedPrompt.value.prompt_id)
    if (index > -1) {
      prompts.value[index] = { ...selectedPrompt.value }
    }

    appStore.showSuccess('Промпт сохранен')
  } catch (error) {
    console.error('Error saving prompt:', error)
    appStore.showError('Ошибка сохранения промпта')
  } finally {
    isSavingPrompt.value = false
  }
}

const deletePrompt = async (prompt) => {
  if (confirm(`Удалить промпт "${prompt.name}"?`)) {
    try {
      // TODO: API call deletePrompt(prompt.prompt_id)

      const index = prompts.value.findIndex(p => p.prompt_id === prompt.prompt_id)
      if (index > -1) {
        prompts.value.splice(index, 1)
      }

      if (selectedPrompt.value?.prompt_id === prompt.prompt_id) {
        selectedPrompt.value = null
      }

      appStore.showSuccess('Промпт удален')
    } catch (error) {
      console.error('Error deleting prompt:', error)
      appStore.showError('Ошибка удаления промпта')
    }
  }
}

const saveNewPrompt = async () => {
  isSavingNewPrompt.value = true
  try {
    // TODO: API call createPrompt(newPrompt.value)

    const prompt = {
      prompt_id: Date.now().toString(),
      ...newPrompt.value
    }

    prompts.value.push(prompt)
    showAddPromptDialog.value = false

    // Сбрасываем форму
    newPrompt.value = {
      name: '',
      role_description: '',
      instruction_text: '',
      output_format: ''
    }

    appStore.showSuccess('Промпт создан')
  } catch (error) {
    console.error('Error creating prompt:', error)
    appStore.showError('Ошибка создания промпта')
  } finally {
    isSavingNewPrompt.value = false
  }
}

const saveChannelData = async () => {
  isSavingChannel.value = true
  try {
    // TODO: API call addHistoricalData([newChannelData.value])

    const channelData = {
      kb_channel_id: Date.now().toString(),
      ...newChannelData.value
    }

    knowledgeBaseChannels.value.push(channelData)
    showAddChannelDialog.value = false

    // Сбрасываем форму
    newChannelData.value = {
      channel_name: '',
      ad_format: '',
      audience_segment: '',
      period: '',
      kpi_type: '',
      kpi_value: null,
      source: '',
      reliability: ''
    }

    appStore.showSuccess('Данные сохранены')
  } catch (error) {
    console.error('Error saving channel data:', error)
    appStore.showError('Ошибка сохранения данных')
  } finally {
    isSavingChannel.value = false
  }
}

const editChannelData = (item) => {
  // TODO: Открыть диалог редактирования
  console.log('Edit channel data:', item)
}

const deleteChannelData = async (item) => {
  if (confirm(`Удалить данные по ${item.channel_name} ${item.ad_format}?`)) {
    try {
      // TODO: API call deleteHistoricalData(item.kb_channel_id)

      const index = knowledgeBaseChannels.value.findIndex(c => c.kb_channel_id === item.kb_channel_id)
      if (index > -1) {
        knowledgeBaseChannels.value.splice(index, 1)
      }

      appStore.showSuccess('Данные удалены')
    } catch (error) {
      console.error('Error deleting channel data:', error)
      appStore.showError('Ошибка удаления данных')
    }
  }
}

const importChannelData = async () => {
  isImporting.value = true
  try {
    // TODO: Реализовать импорт из Excel/CSV файла

    await new Promise(resolve => setTimeout(resolve, 2000)) // Имитация загрузки

    showImportDialog.value = false
    importFile.value = null
    appStore.showSuccess('Данные импортированы')
  } catch (error) {
    console.error('Error importing data:', error)
    appStore.showError('Ошибка импорта данных')
  } finally {
    isImporting.value = false
  }
}

onMounted(async () => {
  // TODO: Загрузка данных с сервера
  // knowledgeBaseChannels.value = await getKnowledgeBaseChannels()
  // prompts.value = await getPrompts()
})
</script>

<style scoped>
.knowledge-base-view {
  padding: 24px;
}
</style>