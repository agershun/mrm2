<template>
  <div class="marketing-documents">
    <v-card>
      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="12" md="4">
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
            <v-select
              v-model="filterIndustry"
              :items="industries"
              label="Индустрия"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              :icon="viewMode === 'list' ? 'mdi-view-grid' : 'mdi-view-list'"
              variant="outlined"
              @click="toggleViewMode"
            />
          </v-col>
        </v-row>

        <!-- Список документов -->
        <div v-if="viewMode === 'list'">
          <v-data-table
            :headers="headers"
            :items="filteredDocuments"
            :loading="loading"
            item-value="document_id"
          >
            <template #item.type="{ item }">
              <v-chip size="small" :color="getTypeColor(item.type)">
                {{ getTypeLabel(item.type) }}
              </v-chip>
            </template>

            <template #item.file_size="{ item }">
              {{ formatFileSize(item.file_size) }}
            </template>

            <template #item.uploaded_at="{ item }">
              {{ formatDate(item.uploaded_at) }}
            </template>

            <template #item.actions="{ item }">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                @click="viewDocument(item)"
              />
              <v-btn
                icon="mdi-download"
                size="small"
                variant="text"
                @click="downloadDocument(item)"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="editDocument(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteDocument(item)"
              />
            </template>
          </v-data-table>
        </div>

        <!-- Карточки документов -->
        <div v-else>
          <v-row>
            <v-col
              v-for="document in filteredDocuments"
              :key="document.document_id"
              cols="12"
              md="4"
              lg="3"
            >
              <v-card>
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
                      <v-chip
                        size="x-small"
                        :color="getTypeColor(document.type)"
                        class="mb-2"
                      >
                        {{ getTypeLabel(document.type) }}
                      </v-chip>
                      <div class="text-caption text-grey">
                        {{ formatFileSize(document.file_size) }} •
                        {{ formatDate(document.uploaded_at) }}
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
                  <v-spacer />
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                  >
                    <v-menu activator="parent">
                      <v-list>
                        <v-list-item @click="editDocument(document)">
                          <v-list-item-title>Редактировать</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteDocument(document)" class="text-error">
                          <v-list-item-title>Удалить</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- Диалог просмотра документа -->
    <DocumentViewDialog
      v-model="showViewDialog"
      :document="selectedDocument"
    />

    <!-- Диалог редактирования документа -->
    <DocumentEditDialog
      v-model="showEditDialog"
      :document="selectedDocument"
      @saved="handleDocumentSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore'
import DocumentViewDialog from './DocumentViewDialog.vue'
import DocumentEditDialog from './DocumentEditDialog.vue'

const knowledgeStore = useKnowledgeBaseStore()

const searchQuery = ref('')
const filterType = ref(null)
const filterIndustry = ref(null)
const viewMode = ref('list')
const showViewDialog = ref(false)
const showEditDialog = ref(false)
const selectedDocument = ref(null)
const loading = ref(false)

const headers = [
  { title: 'Название', value: 'title', width: '30%' },
  { title: 'Тип', value: 'type', width: '15%' },
  { title: 'Индустрия', value: 'industry', width: '15%' },
  { title: 'Размер', value: 'file_size', width: '10%' },
  { title: 'Загружен', value: 'uploaded_at', width: '15%' },
  { title: 'Действия', value: 'actions', width: '15%', sortable: false }
]

const documentTypes = [
  { title: 'Стратегия', value: 'strategy' },
  { title: 'Кейс-стади', value: 'case_study' },
  { title: 'Презентация', value: 'presentation' },
  { title: 'Отчет', value: 'report' },
  { title: 'Исследование', value: 'research' }
]

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

const filteredDocuments = computed(() => {
  let documents = knowledgeStore.marketingDocuments

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    documents = documents.filter(doc =>
      doc.title.toLowerCase().includes(query) ||
      doc.description.toLowerCase().includes(query)
    )
  }

  if (filterType.value) {
    documents = documents.filter(doc => doc.type === filterType.value)
  }

  if (filterIndustry.value) {
    documents = documents.filter(doc => doc.industry === filterIndustry.value)
  }

  return documents
})

const getTypeColor = (type) => {
  const colors = {
    strategy: 'primary',
    case_study: 'success',
    presentation: 'info',
    report: 'warning',
    research: 'purple'
  }
  return colors[type] || 'grey'
}

const getTypeLabel = (type) => {
  const labels = {
    strategy: 'Стратегия',
    case_study: 'Кейс-стади',
    presentation: 'Презентация',
    report: 'Отчет',
    research: 'Исследование'
  }
  return labels[type] || type
}

const getTypeIcon = (type) => {
  const icons = {
    strategy: 'mdi-strategy',
    case_study: 'mdi-file-document-multiple',
    presentation: 'mdi-presentation',
    report: 'mdi-file-chart',
    research: 'mdi-flask'
  }
  return icons[type] || 'mdi-file'
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

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'cards' : 'list'
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
  // Имитация скачивания файла
  const link = document.createElement('a')
  link.href = document.file_url || '#'
  link.download = document.file_name || document.title
  link.click()
}

const deleteDocument = async (document) => {
  if (confirm(`Удалить документ "${document.title}"?`)) {
    await knowledgeStore.deleteMarketingDocument(document.document_id)
  }
}

const handleDocumentSaved = () => {
  showEditDialog.value = false
  selectedDocument.value = null
}

onMounted(async () => {
  loading.value = true
  await knowledgeStore.fetchMarketingDocuments()
  loading.value = false
})
</script>