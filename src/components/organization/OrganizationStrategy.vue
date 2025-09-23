<template>
  <div class="organization-strategy">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-target</v-icon>
        Стратегия и ограничения
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="saveStrategy">
          <!-- Описание стратегии -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">Маркетинговая стратегия</h3>
            <v-textarea
              v-model="strategyData.strategy_description"
              label="Описание стратегии"
              variant="outlined"
              rows="4"
              placeholder="Опишите позиционирование бренда, ключевые цели и особенности..."
              hint="Например: позиционирование как бренд премиальной натуральной косметики для женщин 25-45 лет"
            />
          </div>

          <v-divider class="my-6" />

          <!-- Целевая аудитория -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">Целевая аудитория</h3>
            <v-textarea
              v-model="strategyData.target_audience"
              label="Описание целевой аудитории"
              variant="outlined"
              rows="3"
              placeholder="Опишите демографию, интересы, поведение и потребности..."
              hint="Включите возраст, доход, географию, интересы и особенности поведения"
            />
          </div>

          <v-divider class="my-6" />

          <!-- Маркетинговые ограничения -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">Маркетинговые ограничения</h3>
            <p class="text-body-2 text-medium-emphasis mb-3">
              Укажите ограничения и требования для маркетинговых материалов
            </p>

            <v-combobox
              v-model="strategyData.marketing_constraints"
              label="Добавить ограничение"
              variant="outlined"
              multiple
              chips
              closable-chips
              hint="Введите ограничение и нажмите Enter для добавления"
              placeholder="Например: Запрет на использование изображений животных"
            >
              <template v-slot:chip="{ props, item }">
                <v-chip
                  v-bind="props"
                  closable
                  size="small"
                >
                  {{ item.raw }}
                </v-chip>
              </template>
            </v-combobox>

            <!-- Предустановленные ограничения -->
            <div class="mt-3">
              <p class="text-body-2 text-medium-emphasis mb-2">Быстрое добавление:</p>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="suggestion in constraintSuggestions"
                  :key="suggestion"
                  size="small"
                  variant="outlined"
                  @click="addConstraint(suggestion)"
                  class="cursor-pointer"
                >
                  <v-icon start>mdi-plus</v-icon>
                  {{ suggestion }}
                </v-chip>
              </div>
            </div>
          </div>

          <v-divider class="my-6" />

          <!-- Брендбук и документы -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">Брендбук и руководящие документы</h3>

            <v-text-field
              v-model="strategyData.brand_guidelines_url"
              label="Ссылка на брендбук"
              variant="outlined"
              type="url"
              placeholder="https://example.com/brandbook.pdf"
              hint="Ссылка на основной документ с правилами использования бренда"
              class="mb-4"
            />

            <!-- Загруженные документы (если есть) -->
            <div v-if="organizationDocuments.length > 0">
              <h4 class="text-subtitle-1 mb-3">Загруженные документы</h4>
              <v-list density="compact">
                <v-list-item
                  v-for="document in strategyDocuments"
                  :key="document.document_id"
                  :href="document.file_url === '#' ? undefined : document.file_url"
                  target="_blank"
                  @click="document.file_url === '#' ? handlePlaceholderClick(document) : undefined"
                >
                  <template v-slot:prepend>
                    <v-icon>{{ getDocumentIcon(document.file_type) }}</v-icon>
                  </template>
                  <v-list-item-title>{{ document.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ document.description }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
          </div>

          <v-divider class="my-6" />

          <!-- Ключевые сообщения -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">Ключевые сообщения</h3>
            <v-combobox
              v-model="strategyData.key_messages"
              label="Добавить ключевое сообщение"
              variant="outlined"
              multiple
              chips
              closable-chips
              hint="Основные сообщения бренда для использования в коммуникациях"
              placeholder="Например: Натуральная косметика без вреда для природы"
            >
              <template v-slot:chip="{ props, item }">
                <v-chip
                  v-bind="props"
                  closable
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  {{ item.raw }}
                </v-chip>
              </template>
            </v-combobox>
          </div>

          <!-- Конкуренты -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">Основные конкуренты</h3>
            <v-combobox
              v-model="strategyData.competitors"
              label="Добавить конкурента"
              variant="outlined"
              multiple
              chips
              closable-chips
              hint="Список основных конкурентов для анализа и сравнения"
              placeholder="Например: L'Oréal, Nivea"
            >
              <template v-slot:chip="{ props, item }">
                <v-chip
                  v-bind="props"
                  closable
                  size="small"
                  color="warning"
                  variant="tonal"
                >
                  {{ item.raw }}
                </v-chip>
              </template>
            </v-combobox>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          color="primary"
          @click="saveStrategy"
          :loading="isSaving"
        >
          <v-icon class="me-2">mdi-content-save</v-icon>
          Сохранить стратегию
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrganizationsStore } from '@/stores/organizationsStore'
import { useAppStore } from '@/stores/appStore'

const organizationsStore = useOrganizationsStore()
const appStore = useAppStore()

// Локальное состояние
const isSaving = ref(false)

const strategyData = ref({
  strategy_description: '',
  target_audience: '',
  marketing_constraints: [],
  brand_guidelines_url: '',
  key_messages: [],
  competitors: []
})

// Предложения для ограничений
const constraintSuggestions = ref([
  'Запрет на использование изображений животных',
  'Обязательное указание натурального состава',
  'Недопустимость размещения на площадках 18+',
  'Все модели старше 21 года',
  'Запрет на агрессивные продажи',
  'Указание реальных сроков поставки',
  'Сертификация органических продуктов',
  'Указание противопоказаний',
  'Недопустимость дискриминации',
  'Запрет на сравнение с конкурентами'
])

// Вычисляемые свойства
const currentOrganization = computed(() => organizationsStore.getCurrentOrganization)
const organizationDocuments = computed(() => organizationsStore.currentOrganizationDocuments)

const strategyDocuments = computed(() =>
  organizationDocuments.value.filter(doc =>
    ['strategy', 'brand_guidelines', 'constraints'].includes(doc.category)
  )
)

// Методы
const getDocumentIcon = (fileType) => {
  const icons = {
    pdf: 'mdi-file-pdf-box',
    doc: 'mdi-file-word-box',
    docx: 'mdi-file-word-box',
    ppt: 'mdi-file-powerpoint-box',
    pptx: 'mdi-file-powerpoint-box',
    default: 'mdi-file-document'
  }
  return icons[fileType] || icons.default
}

const addConstraint = (constraint) => {
  if (!strategyData.value.marketing_constraints.includes(constraint)) {
    strategyData.value.marketing_constraints.push(constraint)
  }
}

const handlePlaceholderClick = (document) => {
  appStore.showInfo(`Документ "${document.name}" недоступен (placeholder)`)
}

const saveStrategy = async () => {
  if (!currentOrganization.value) {
    appStore.showError('Организация не выбрана')
    return
  }

  try {
    isSaving.value = true

    await organizationsStore.updateOrganization(
      currentOrganization.value.organization_id,
      strategyData.value
    )

    appStore.showSuccess('Стратегия организации успешно сохранена')
  } catch (error) {
    console.error('Error saving strategy:', error)
    appStore.showError('Ошибка сохранения стратегии')
  } finally {
    isSaving.value = false
  }
}

const loadStrategyData = () => {
  if (currentOrganization.value) {
    const org = currentOrganization.value
    strategyData.value = {
      strategy_description: org.strategy_description || '',
      target_audience: org.target_audience || '',
      marketing_constraints: Array.isArray(org.marketing_constraints)
        ? [...org.marketing_constraints]
        : [],
      brand_guidelines_url: org.brand_guidelines_url || '',
      key_messages: Array.isArray(org.key_messages)
        ? [...org.key_messages]
        : [],
      competitors: Array.isArray(org.competitors)
        ? [...org.competitors]
        : []
    }
  }
}

// Хуки жизненного цикла
onMounted(async () => {
  loadStrategyData()

  // Загружаем документы, если есть текущая организация
  if (currentOrganization.value) {
    try {
      await organizationsStore.loadCurrentOrganizationDocuments()
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }
})
</script>

<style scoped>
.organization-strategy {
  max-width: 100%;
}

.gap-2 {
  gap: 8px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>