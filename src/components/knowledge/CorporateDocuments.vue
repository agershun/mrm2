<template>
  <div class="corporate-documents">
    <v-card>
      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Поиск документов"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterType"
              :items="documentTypes"
              label="Тип документа"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn color="primary" @click="showUploadDialog = true">
              <v-icon>mdi-plus</v-icon>
              Добавить документ
            </v-btn>
          </v-col>
        </v-row>

        <!-- Список документов -->
        <v-row>
          <v-col
            v-for="document in filteredDocuments"
            :key="document.document_id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card variant="outlined" class="h-100">
              <v-card-text>
                <div class="d-flex align-start">
                  <v-avatar
                    :color="getTypeColor(document.type)"
                    class="me-3"
                  >
                    <v-icon>{{ getTypeIcon(document.type) }}</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <h4 class="text-subtitle-1 mb-1">{{ document.title }}</h4>
                    <p class="text-caption text-grey mb-2">{{ document.description }}</p>

                    <div class="d-flex align-center mb-2">
                      <v-chip
                        size="x-small"
                        :color="getTypeColor(document.type)"
                        class="me-2"
                      >
                        {{ getTypeLabel(document.type) }}
                      </v-chip>
                      <v-switch
                        v-model="document.ai_enabled"
                        :label="document.ai_enabled ? 'Включен в ИИ' : 'Выключен'"
                        density="compact"
                        hide-details
                        @change="toggleAIEnabled(document)"
                      />
                    </div>

                    <div class="text-caption text-grey mb-3">
                      {{ formatFileSize(document.file_size) }} •
                      {{ formatDate(document.uploaded_at) }}
                    </div>

                    <v-progress-linear
                      v-if="document.processing_status === 'processing'"
                      indeterminate
                      color="primary"
                      height="4"
                      class="mb-2"
                    />

                    <div v-if="document.processing_status" class="mb-2">
                      <v-chip
                        size="x-small"
                        :color="getStatusColor(document.processing_status)"
                      >
                        {{ getStatusLabel(document.processing_status) }}
                      </v-chip>
                    </div>

                    <div v-if="document.keywords && document.keywords.length > 0" class="mb-2">
                      <div class="text-caption text-grey mb-1">Ключевые слова:</div>
                      <div class="d-flex flex-wrap gap-1">
                        <v-chip
                          v-for="keyword in document.keywords.slice(0, 3)"
                          :key="keyword"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ keyword }}
                        </v-chip>
                        <v-chip
                          v-if="document.keywords.length > 3"
                          size="x-small"
                          variant="tonal"
                          color="grey"
                        >
                          +{{ document.keywords.length - 3 }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="viewDocument(document)"
                />
                <v-btn
                  icon="mdi-download"
                  size="small"
                  variant="text"
                  @click="downloadDocument(document)"
                />
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="editDocument(document)"
                />
                <v-spacer />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteDocument(document)"
                />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <div v-if="filteredDocuments.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2">mdi-office-building</v-icon>
          <h3 class="text-h6 mt-2">Корпоративные документы отсутствуют</h3>
          <p class="text-grey">Загрузите описания компании и стратегии для улучшения генерации кампаний</p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Диалог загрузки документа -->
    <CorporateDocumentUploadDialog
      v-model="showUploadDialog"
      @uploaded="handleDocumentUploaded"
    />

    <!-- Диалог просмотра документа -->
    <DocumentViewDialog
      v-model="showViewDialog"
      :document="selectedDocument"
    />

    <!-- Диалог редактирования документа -->
    <CorporateDocumentEditDialog
      v-model="showEditDialog"
      :document="selectedDocument"
      @saved="handleDocumentSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore'
import CorporateDocumentUploadDialog from './CorporateDocumentUploadDialog.vue'
import CorporateDocumentEditDialog from './CorporateDocumentEditDialog.vue'
import DocumentViewDialog from './DocumentViewDialog.vue'

const knowledgeStore = useKnowledgeBaseStore()

const searchQuery = ref('')
const filterType = ref(null)
const showUploadDialog = ref(false)
const showViewDialog = ref(false)
const showEditDialog = ref(false)
const selectedDocument = ref(null)

const documentTypes = [
  { title: 'Описание компании', value: 'company_description' },
  { title: 'Маркетинговая стратегия', value: 'marketing_strategy' },
  { title: 'Бренд-гайд', value: 'brand_guide' },
  { title: 'Позиционирование', value: 'positioning' },
  { title: 'Целевая аудитория', value: 'target_audience' },
  { title: 'Конкуренты', value: 'competitors' }
]

const filteredDocuments = computed(() => {
  let documents = knowledgeStore.corporateDocuments

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    documents = documents.filter(doc =>
      doc.title.toLowerCase().includes(query) ||
      doc.description.toLowerCase().includes(query) ||
      (doc.keywords && doc.keywords.some(keyword =>
        keyword.toLowerCase().includes(query)
      ))
    )
  }

  if (filterType.value) {
    documents = documents.filter(doc => doc.type === filterType.value)
  }

  return documents
})

const getTypeColor = (type) => {
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

const getTypeIcon = (type) => {
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

const getTypeLabel = (type) => {
  const labels = {
    company_description: 'Описание компании',
    marketing_strategy: 'Стратегия',
    brand_guide: 'Бренд-гайд',
    positioning: 'Позиционирование',
    target_audience: 'ЦА',
    competitors: 'Конкуренты'
  }
  return labels[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    processing: 'warning',
    processed: 'success',
    failed: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    processing: 'Обрабатывается',
    processed: 'Обработан',
    failed: 'Ошибка обработки'
  }
  return labels[status] || status
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
    year: 'numeric'
  }).format(new Date(dateString))
}

const toggleAIEnabled = async (document) => {
  await knowledgeStore.updateCorporateDocument(document.document_id, {
    ai_enabled: document.ai_enabled
  })
}

const viewDocument = (document) => {
  selectedDocument.value = document
  showViewDialog.value = true
}

const editDocument = (document) => {
  selectedDocument.value = document
  showEditDialog.value = true
}

const downloadDocument = (document) => {
  const link = document.createElement('a')
  link.href = document.file_url || '#'
  link.download = document.file_name || document.title
  link.click()
}

const deleteDocument = async (document) => {
  if (confirm(`Удалить документ "${document.title}"?`)) {
    await knowledgeStore.deleteCorporateDocument(document.document_id)
  }
}

const handleDocumentUploaded = () => {
  showUploadDialog.value = false
}

const handleDocumentSaved = () => {
  showEditDialog.value = false
  selectedDocument.value = null
}

onMounted(async () => {
  await knowledgeStore.fetchCorporateDocuments()
})
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}
</style>