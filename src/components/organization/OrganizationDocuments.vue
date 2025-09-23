<template>
  <div class="organization-documents">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-file-document</v-icon>
          Документы организации
        </div>

        <v-btn
          color="primary"
          prepend-icon="mdi-upload"
          @click="uploadDialog = true"
        >
          Загрузить документ
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Фильтры -->
        <div class="d-flex align-center gap-3 mb-6">
          <v-select
            v-model="categoryFilter"
            :items="categoryOptions"
            label="Категория"
            variant="outlined"
            density="compact"
            style="width: 200px"
            clearable
          />

          <v-text-field
            v-model="searchQuery"
            placeholder="Поиск документов..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            style="width: 250px"
            clearable
          />
        </div>

        <!-- Список документов -->
        <div v-if="isLoading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" class="mb-4" />
          <p>Загрузка документов...</p>
        </div>

        <div v-else-if="filteredDocuments.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">
            mdi-file-document-outline
          </v-icon>
          <h3 class="text-h6 mb-2">
            {{ searchQuery || categoryFilter ? 'Документы не найдены' : 'Нет документов' }}
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ searchQuery || categoryFilter
              ? 'Попробуйте изменить параметры поиска'
              : 'Загрузите первый документ для организации'
            }}
          </p>
          <v-btn
            v-if="!searchQuery && !categoryFilter"
            color="primary"
            prepend-icon="mdi-upload"
            @click="uploadDialog = true"
          >
            Загрузить документ
          </v-btn>
        </div>

        <div v-else>
          <!-- Группировка по категориям -->
          <div
            v-for="category in documentsByCategory"
            :key="category.name"
            class="mb-6"
          >
            <h3 class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
              <v-icon class="me-2" :color="category.color">{{ category.icon }}</v-icon>
              {{ category.label }}
              <v-chip size="small" class="ms-2">{{ category.documents.length }}</v-chip>
            </h3>

            <v-row>
              <v-col
                v-for="document in category.documents"
                :key="document.document_id"
                cols="12"
                md="6"
                lg="4"
              >
                <DocumentCard
                  :document="document"
                  @download="downloadDocument"
                  @delete="deleteDocument"
                />
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Диалог загрузки документа -->
    <v-dialog
      v-model="uploadDialog"
      max-width="500"
      persistent
    >
      <v-card>
        <v-card-title>
          <v-icon class="me-2">mdi-upload</v-icon>
          Загрузить документ
        </v-card-title>

        <v-card-text>
          <v-form ref="uploadForm" v-model="uploadFormValid">
            <v-text-field
              v-model="uploadData.name"
              label="Название документа *"
              variant="outlined"
              :rules="[rules.required]"
              class="mb-4"
            />

            <v-select
              v-model="uploadData.category"
              :items="categoryOptions"
              label="Категория *"
              variant="outlined"
              :rules="[rules.required]"
              class="mb-4"
            />

            <v-textarea
              v-model="uploadData.description"
              label="Описание"
              variant="outlined"
              rows="3"
              class="mb-4"
            />

            <!-- Загрузка файла -->
            <v-file-input
              v-model="uploadData.file"
              label="Выберите файл *"
              variant="outlined"
              :rules="[rules.required]"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              prepend-icon="mdi-file"
              show-size
            />

            <v-alert
              type="info"
              variant="tonal"
              class="mt-4"
            >
              Поддерживаемые форматы: PDF, DOC, DOCX, PPT, PPTX, TXT.
              Максимальный размер: 10 МБ.
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeUploadDialog"
            :disabled="isUploading"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="uploadDocument"
            :loading="isUploading"
            :disabled="!uploadFormValid"
          >
            Загрузить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog
      v-model="deleteDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>Удалить документ?</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить документ
          <strong>{{ documentToDelete?.name }}</strong>?
          Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="deleteDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="isDeleting"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrganizationsStore } from '@/stores/organizationsStore'
import { useAppStore } from '@/stores/appStore'
import DocumentCard from './DocumentCard.vue'

const organizationsStore = useOrganizationsStore()
const appStore = useAppStore()

// Локальное состояние
const isLoading = ref(false)
const uploadDialog = ref(false)
const deleteDialog = ref(false)
const uploadForm = ref(null)
const uploadFormValid = ref(false)
const isUploading = ref(false)
const isDeleting = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('')
const documentToDelete = ref(null)

const uploadData = ref({
  name: '',
  category: '',
  description: '',
  file: null
})

// Опции категорий
const categoryOptions = ref([
  { title: 'Брендбук', value: 'brand_guidelines' },
  { title: 'Стратегия', value: 'strategy' },
  { title: 'Ограничения', value: 'constraints' },
  { title: 'Шаблоны', value: 'templates' },
  { title: 'Исследования', value: 'research' },
  { title: 'Отчеты', value: 'reports' },
  { title: 'Другое', value: 'other' }
])

// Правила валидации
const rules = {
  required: (value) => !!value || 'Поле обязательно для заполнения'
}

// Вычисляемые свойства
const currentOrganization = computed(() => organizationsStore.getCurrentOrganization)
const organizationDocuments = computed(() => organizationsStore.currentOrganizationDocuments)

const filteredDocuments = computed(() => {
  let result = organizationDocuments.value

  if (categoryFilter.value) {
    result = result.filter(doc => doc.category === categoryFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(doc =>
      doc.name.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query)
    )
  }

  return result
})

const documentsByCategory = computed(() => {
  const categories = []
  const categoryMap = {
    brand_guidelines: { label: 'Брендбук', icon: 'mdi-palette', color: 'primary' },
    strategy: { label: 'Стратегия', icon: 'mdi-target', color: 'success' },
    constraints: { label: 'Ограничения', icon: 'mdi-shield-alert', color: 'warning' },
    templates: { label: 'Шаблоны', icon: 'mdi-file-multiple', color: 'info' },
    research: { label: 'Исследования', icon: 'mdi-chart-line', color: 'purple' },
    reports: { label: 'Отчеты', icon: 'mdi-file-chart', color: 'orange' },
    other: { label: 'Другое', icon: 'mdi-file', color: 'grey' }
  }

  // Группируем документы по категориям
  const grouped = filteredDocuments.value.reduce((acc, doc) => {
    const category = doc.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(doc)
    return acc
  }, {})

  // Преобразуем в массив для отображения
  Object.keys(grouped).forEach(categoryKey => {
    const categoryInfo = categoryMap[categoryKey] || categoryMap.other
    categories.push({
      name: categoryKey,
      ...categoryInfo,
      documents: grouped[categoryKey].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      )
    })
  })

  // Сортируем категории по приоритету
  const priorityOrder = ['brand_guidelines', 'strategy', 'constraints', 'templates', 'research', 'reports', 'other']
  categories.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.name)
    const bIndex = priorityOrder.indexOf(b.name)
    return aIndex - bIndex
  })

  return categories
})

// Методы
const loadDocuments = async () => {
  if (!currentOrganization.value) return

  try {
    isLoading.value = true
    await organizationsStore.loadCurrentOrganizationDocuments()
  } catch (error) {
    console.error('Error loading documents:', error)
    appStore.showError('Ошибка загрузки документов')
  } finally {
    isLoading.value = false
  }
}

const uploadDocument = async () => {
  if (!uploadFormValid.value || !currentOrganization.value) return

  try {
    isUploading.value = true

    // В реальном приложении здесь была бы загрузка файла
    const documentData = {
      name: uploadData.value.name,
      category: uploadData.value.category,
      description: uploadData.value.description,
      file_type: getFileExtension(uploadData.value.file.name),
      file_url: '#' // Заглушка
    }

    await organizationsStore.uploadDocument(documentData)

    appStore.showSuccess('Документ успешно загружен')
    closeUploadDialog()
  } catch (error) {
    console.error('Error uploading document:', error)
    appStore.showError('Ошибка загрузки документа')
  } finally {
    isUploading.value = false
  }
}

const downloadDocument = (document) => {
  // В реальном приложении здесь была бы загрузка файла
  window.open(document.file_url, '_blank')
}

const deleteDocument = (document) => {
  documentToDelete.value = document
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!documentToDelete.value) return

  try {
    isDeleting.value = true

    // В реальном приложении здесь был бы API вызов для удаления
    const index = organizationsStore.currentOrganizationDocuments.findIndex(
      doc => doc.document_id === documentToDelete.value.document_id
    )
    if (index > -1) {
      organizationsStore.currentOrganizationDocuments.splice(index, 1)
    }

    appStore.showSuccess('Документ удален')
    deleteDialog.value = false
    documentToDelete.value = null
  } catch (error) {
    console.error('Error deleting document:', error)
    appStore.showError('Ошибка удаления документа')
  } finally {
    isDeleting.value = false
  }
}

const closeUploadDialog = () => {
  uploadDialog.value = false
  uploadData.value = {
    name: '',
    category: '',
    description: '',
    file: null
  }
  if (uploadForm.value) {
    uploadForm.value.resetValidation()
  }
}

const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase()
}

// Хуки жизненного цикла
onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.organization-documents {
  max-width: 100%;
}

.gap-3 {
  gap: 12px;
}
</style>