<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-funnel</v-icon>
      Настройки воронки продаж
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Создать стадию
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Вложенное меню настроек воронки -->
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-list nav density="compact">
              <v-list-subheader>Настройки воронки</v-list-subheader>

              <v-list-item
                v-for="item in funnelSections"
                :key="item.id"
                :value="item.id"
                :active="selectedFunnelSection === item.id"
                @click="selectedFunnelSection = item.id"
              >
                <template v-slot:prepend>
                  <v-icon :icon="item.icon" />
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
                <template v-slot:append v-if="item.badge">
                  <v-chip size="small" color="primary">{{ item.badge }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Контент настроек воронки -->
        <v-col cols="12" md="8">
          <!-- Стадии воронки -->
          <template v-if="selectedFunnelSection === 'stages'">
            <v-card variant="outlined">
              <v-card-title>Стадии воронки продаж</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка этапов продажного цикла и их характеристик
                </v-alert>

                <v-data-table
                  :headers="stageHeaders"
                  :items="funnelStages"
                  class="elevation-1"
                  item-value="stage_id"
                >
                  <template #item.stage_type="{ item }">
                    <v-chip
                      :color="getStageTypeColor(item.stage_type)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getStageTypeText(item.stage_type) }}
                    </v-chip>
                  </template>

                  <template #item.conversion_rate="{ item }">
                    <div class="d-flex align-center">
                      <v-progress-linear
                        :model-value="item.conversion_rate"
                        color="primary"
                        height="6"
                        class="me-2"
                        style="flex: 1"
                      />
                      {{ item.conversion_rate }}%
                    </div>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-arrow-up"
                      size="small"
                      variant="text"
                      @click="moveStageUp(item)"
                      :disabled="item.sort_order === 1"
                    />
                    <v-btn
                      icon="mdi-arrow-down"
                      size="small"
                      variant="text"
                      @click="moveStageDown(item)"
                    />
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editStage(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteStage(item.stage_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Исключения -->
          <template v-if="selectedFunnelSection === 'exceptions'">
            <v-card variant="outlined">
              <v-card-title>Исключения из воронки</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка правил исключения определенных активностей из анализа воронки
                </v-alert>

                <v-data-table
                  :headers="exceptionHeaders"
                  :items="funnelExceptions"
                  class="elevation-1"
                  item-value="exception_id"
                >
                  <template #item.exception_type="{ item }">
                    <v-chip
                      :color="getExceptionTypeColor(item.exception_type)"
                      size="small"
                      variant="flat"
                    >
                      {{ getExceptionTypeText(item.exception_type) }}
                    </v-chip>
                  </template>

                  <template #item.is_active="{ item }">
                    <v-switch
                      v-model="item.is_active"
                      color="primary"
                      hide-details
                      @change="updateException(item)"
                    />
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editException(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteException(item.exception_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Конверсии -->
          <template v-if="selectedFunnelSection === 'conversions'">
            <v-card variant="outlined">
              <v-card-title>Настройки конверсий</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Управление правилами расчета конверсии между стадиями воронки
                </v-alert>
                <!-- TODO: Реализовать настройки конверсий -->
                <v-alert type="info" variant="tonal">
                  Настройки конверсий будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Временные рамки -->
          <template v-if="selectedFunnelSection === 'timeframes'">
            <v-card variant="outlined">
              <v-card-title>Временные рамки</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка временных рамок для анализа движения по воронке
                </v-alert>
                <!-- TODO: Реализовать временные рамки -->
                <v-alert type="info" variant="tonal">
                  Временные рамки будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Отчеты по воронке -->
          <template v-if="selectedFunnelSection === 'reports'">
            <v-card variant="outlined">
              <v-card-title>Отчеты по воронке</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка автоматических отчетов по эффективности воронки продаж
                </v-alert>
                <!-- TODO: Реализовать отчеты -->
                <v-alert type="info" variant="tonal">
                  Отчеты по воронке будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Интеграции CRM -->
          <template v-if="selectedFunnelSection === 'crm-integration'">
            <v-card variant="outlined">
              <v-card-title>Интеграция с CRM</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка синхронизации данных воронки с CRM системами
                </v-alert>
                <!-- TODO: Реализовать интеграции CRM -->
                <v-alert type="info" variant="tonal">
                  Интеграция с CRM будет добавлена позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Диалог создания стадии -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Создать новую стадию воронки</v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="isFormValid">
            <v-text-field
              v-model="newStage.name"
              label="Название стадии"
              variant="outlined"
              :rules="[v => !!v || 'Название обязательно']"
              required
            />
            <v-select
              v-model="newStage.stage_type"
              :items="stageTypeOptions"
              label="Тип стадии"
              variant="outlined"
              :rules="[v => !!v || 'Тип обязателен']"
              required
            />
            <v-textarea
              v-model="newStage.description"
              label="Описание"
              variant="outlined"
              rows="3"
            />
            <v-text-field
              v-model.number="newStage.conversion_rate"
              label="Средняя конверсия (%)"
              variant="outlined"
              type="number"
              min="0"
              max="100"
            />
            <v-text-field
              v-model.number="newStage.sort_order"
              label="Порядок сортировки"
              variant="outlined"
              type="number"
              min="1"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreateDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!isFormValid"
            :loading="isSaving"
            @click="createStage"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const selectedFunnelSection = ref('stages')
const showCreateDialog = ref(false)
const isFormValid = ref(false)
const isSaving = ref(false)

const newStage = ref({
  name: '',
  stage_type: '',
  description: '',
  conversion_rate: 0,
  sort_order: 1
})

const funnelSections = ref([
  {
    id: 'stages',
    title: 'Стадии воронки',
    icon: 'mdi-stairs',
    badge: null
  },
  {
    id: 'exceptions',
    title: 'Исключения',
    icon: 'mdi-block-helper',
    badge: null
  },
  {
    id: 'conversions',
    title: 'Конверсии',
    icon: 'mdi-percent',
    badge: 'Soon'
  },
  {
    id: 'timeframes',
    title: 'Временные рамки',
    icon: 'mdi-clock-outline',
    badge: 'Soon'
  },
  {
    id: 'reports',
    title: 'Отчеты',
    icon: 'mdi-chart-line',
    badge: 'Soon'
  },
  {
    id: 'crm-integration',
    title: 'Интеграция CRM',
    icon: 'mdi-sync',
    badge: 'Soon'
  }
])

const stageHeaders = [
  { title: 'Порядок', key: 'sort_order', sortable: true },
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Тип', key: 'stage_type', sortable: true },
  { title: 'Конверсия', key: 'conversion_rate', sortable: true },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const exceptionHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Тип исключения', key: 'exception_type', sortable: true },
  { title: 'Условие', key: 'condition', sortable: false },
  { title: 'Активное', key: 'is_active', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const funnelStages = ref([
  {
    stage_id: '1',
    name: 'Знакомство',
    stage_type: 'awareness',
    description: 'Первоначальное знакомство с брендом',
    conversion_rate: 100,
    sort_order: 1
  },
  {
    stage_id: '2',
    name: 'Интерес',
    stage_type: 'interest',
    description: 'Проявление интереса к продукту',
    conversion_rate: 45,
    sort_order: 2
  },
  {
    stage_id: '3',
    name: 'Рассмотрение',
    stage_type: 'consideration',
    description: 'Активное рассмотрение покупки',
    conversion_rate: 25,
    sort_order: 3
  },
  {
    stage_id: '4',
    name: 'Намерение',
    stage_type: 'intent',
    description: 'Намерение совершить покупку',
    conversion_rate: 15,
    sort_order: 4
  },
  {
    stage_id: '5',
    name: 'Покупка',
    stage_type: 'purchase',
    description: 'Совершение покупки',
    conversion_rate: 8,
    sort_order: 5
  }
])

const funnelExceptions = ref([
  {
    exception_id: '1',
    name: 'Исключить внутренний трафик',
    exception_type: 'traffic_source',
    condition: 'IP адрес = внутренняя сеть',
    is_active: true
  },
  {
    exception_id: '2',
    name: 'Исключить тестовые заказы',
    exception_type: 'order_type',
    condition: 'Статус заказа = тестовый',
    is_active: true
  },
  {
    exception_id: '3',
    name: 'Исключить возвраты',
    exception_type: 'transaction_type',
    condition: 'Тип транзакции = возврат',
    is_active: false
  }
])

const stageTypeOptions = ref([
  { title: 'Знакомство', value: 'awareness' },
  { title: 'Интерес', value: 'interest' },
  { title: 'Рассмотрение', value: 'consideration' },
  { title: 'Намерение', value: 'intent' },
  { title: 'Покупка', value: 'purchase' },
  { title: 'Удержание', value: 'retention' }
])

// Helper functions
const getStageTypeColor = (type) => {
  const colors = {
    'awareness': 'blue',
    'interest': 'teal',
    'consideration': 'orange',
    'intent': 'purple',
    'purchase': 'green',
    'retention': 'indigo'
  }
  return colors[type] || 'grey'
}

const getStageTypeText = (type) => {
  const texts = {
    'awareness': 'Знакомство',
    'interest': 'Интерес',
    'consideration': 'Рассмотрение',
    'intent': 'Намерение',
    'purchase': 'Покупка',
    'retention': 'Удержание'
  }
  return texts[type] || type
}

const getExceptionTypeColor = (type) => {
  const colors = {
    'traffic_source': 'blue',
    'order_type': 'orange',
    'transaction_type': 'purple',
    'user_segment': 'green',
    'device_type': 'teal'
  }
  return colors[type] || 'grey'
}

const getExceptionTypeText = (type) => {
  const texts = {
    'traffic_source': 'Источник трафика',
    'order_type': 'Тип заказа',
    'transaction_type': 'Тип транзакции',
    'user_segment': 'Сегмент пользователей',
    'device_type': 'Тип устройства'
  }
  return texts[type] || type
}

// CRUD methods
const createStage = async () => {
  try {
    isSaving.value = true
    console.log('Создание стадии воронки:', newStage.value)
    appStore.showSuccess('Стадия воронки создана успешно')
    showCreateDialog.value = false
    newStage.value = {
      name: '',
      stage_type: '',
      description: '',
      conversion_rate: 0,
      sort_order: 1
    }
  } catch (error) {
    console.error('Error creating stage:', error)
    appStore.showError('Ошибка создания стадии воронки')
  } finally {
    isSaving.value = false
  }
}

const editStage = (stage) => {
  console.log('Редактирование стадии:', stage)
}

const deleteStage = async (stageId) => {
  try {
    console.log('Удаление стадии:', stageId)
    appStore.showSuccess('Стадия удалена')
  } catch (error) {
    console.error('Error deleting stage:', error)
    appStore.showError('Ошибка удаления стадии')
  }
}

const moveStageUp = (stage) => {
  console.log('Перемещение стадии вверх:', stage)
  appStore.showSuccess('Порядок стадий обновлен')
}

const moveStageDown = (stage) => {
  console.log('Перемещение стадии вниз:', stage)
  appStore.showSuccess('Порядок стадий обновлен')
}

const updateException = async (exception) => {
  try {
    console.log('Обновление исключения:', exception)
    appStore.showSuccess('Исключение обновлено')
  } catch (error) {
    console.error('Error updating exception:', error)
    appStore.showError('Ошибка обновления исключения')
  }
}

const editException = (exception) => {
  console.log('Редактирование исключения:', exception)
}

const deleteException = async (exceptionId) => {
  try {
    console.log('Удаление исключения:', exceptionId)
    appStore.showSuccess('Исключение удалено')
  } catch (error) {
    console.error('Error deleting exception:', error)
    appStore.showError('Ошибка удаления исключения')
  }
}
</script>