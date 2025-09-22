<template>
  <v-dialog v-model="dialog" max-width="900px">
    <v-card v-if="document">
      <v-card-title>
        <v-icon class="me-2">{{ getTypeIcon(document.type) }}</v-icon>
        {{ document.title }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="8">
            <div class="document-content">
              <div v-if="document.content">
                <h5 class="mb-3">Содержание документа:</h5>
                <div class="content-preview pa-3 bg-grey-lighten-5 rounded">
                  <pre class="text-wrap">{{ document.content }}</pre>
                </div>
              </div>
              <div v-else class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-2">mdi-file-outline</v-icon>
                <p class="text-grey mt-2">Содержание документа недоступно для предварительного просмотра</p>
                <v-btn
                  color="primary"
                  @click="downloadDocument"
                >
                  <v-icon>mdi-download</v-icon>
                  Скачать файл
                </v-btn>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <v-card variant="outlined">
              <v-card-title>Информация о документе</v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title>Тип</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip size="small" :color="getTypeColor(document.type)">
                        {{ getTypeLabel(document.type) }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="document.industry">
                    <v-list-item-title>Индустрия</v-list-item-title>
                    <v-list-item-subtitle>{{ document.industry }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-title>Размер файла</v-list-item-title>
                    <v-list-item-subtitle>{{ formatFileSize(document.file_size) }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-title>Загружен</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(document.uploaded_at) }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="document.updated_at">
                    <v-list-item-title>Обновлен</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(document.updated_at) }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <v-card v-if="document.description" variant="outlined" class="mt-4">
              <v-card-title>Описание</v-card-title>
              <v-card-text>
                <p class="text-body-2">{{ document.description }}</p>
              </v-card-text>
            </v-card>

            <v-card v-if="document.tags && document.tags.length > 0" variant="outlined" class="mt-4">
              <v-card-title>Теги</v-card-title>
              <v-card-text>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="tag in document.tags"
                    :key="tag"
                    size="small"
                    variant="tonal"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>

            <v-card v-if="document.keywords && document.keywords.length > 0" variant="outlined" class="mt-4">
              <v-card-title>Ключевые слова</v-card-title>
              <v-card-text>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="keyword in document.keywords"
                    :key="keyword"
                    size="small"
                    color="primary"
                    variant="tonal"
                  >
                    {{ keyword }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>

            <div v-if="document.ai_enabled !== undefined" class="mt-4">
              <v-card variant="outlined">
                <v-card-title>Настройки ИИ</v-card-title>
                <v-card-text>
                  <v-switch
                    :model-value="document.ai_enabled"
                    label="Использовать в генерации ИИ"
                    readonly
                    hide-details
                  />
                  <p class="text-caption text-grey mt-2">
                    {{ document.ai_enabled
                      ? 'Документ используется при генерации кампаний с помощью ИИ'
                      : 'Документ не используется в генерации ИИ'
                    }}
                  </p>
                </v-card-text>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="primary"
          @click="downloadDocument"
        >
          <v-icon>mdi-download</v-icon>
          Скачать
        </v-btn>
        <v-btn
          color="secondary"
          @click="editDocument"
        >
          <v-icon>mdi-pencil</v-icon>
          Редактировать
        </v-btn>
        <v-spacer />
        <v-btn @click="dialog = false">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  document: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'edit'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const getTypeColor = (type) => {
  const colors = {
    strategy: 'primary',
    case_study: 'success',
    presentation: 'info',
    report: 'warning',
    research: 'purple',
    company_description: 'primary',
    marketing_strategy: 'success',
    brand_guide: 'purple',
    positioning: 'info',
    target_audience: 'orange',
    competitors: 'red'
  }
  return colors[type] || 'grey'
}

const getTypeIcon = (type) => {
  const icons = {
    strategy: 'mdi-strategy',
    case_study: 'mdi-file-document-multiple',
    presentation: 'mdi-presentation',
    report: 'mdi-file-chart',
    research: 'mdi-flask',
    company_description: 'mdi-office-building',
    marketing_strategy: 'mdi-strategy',
    brand_guide: 'mdi-palette',
    positioning: 'mdi-target',
    target_audience: 'mdi-account-group',
    competitors: 'mdi-sword-cross'
  }
  return icons[type] || 'mdi-file'
}

const getTypeLabel = (type) => {
  const labels = {
    strategy: 'Стратегия',
    case_study: 'Кейс-стади',
    presentation: 'Презентация',
    report: 'Отчет',
    research: 'Исследование',
    company_description: 'Описание компании',
    marketing_strategy: 'Маркетинговая стратегия',
    brand_guide: 'Бренд-гайд',
    positioning: 'Позиционирование',
    target_audience: 'Целевая аудитория',
    competitors: 'Конкуренты'
  }
  return labels[type] || type
}

const formatFileSize = (bytes) => {
  if (!bytes) return '—'
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

const downloadDocument = () => {
  const link = document.createElement('a')
  link.href = props.document.file_url || '#'
  link.download = props.document.file_name || props.document.title
  link.click()
}

const editDocument = () => {
  emit('edit', props.document)
  dialog.value = false
}
</script>

<style scoped>
.content-preview {
  max-height: 400px;
  overflow-y: auto;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: 0.875rem;
  margin: 0;
}

.gap-2 {
  gap: 8px;
}
</style>