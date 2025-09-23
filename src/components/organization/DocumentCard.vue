<template>
  <v-card
    hover
    class="document-card"
    @click="$emit('download', document)"
  >
    <v-card-text class="pa-4">
      <!-- Заголовок с иконкой и меню -->
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-avatar
            :color="getFileTypeColor(document.file_type)"
            size="40"
            class="me-3"
          >
            <v-icon color="white" size="20">
              {{ getFileTypeIcon(document.file_type) }}
            </v-icon>
          </v-avatar>

          <div>
            <div class="text-subtitle-2 font-weight-medium">
              {{ document.name }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ getCategoryLabel(document.category) }}
            </div>
          </div>
        </div>

        <!-- Меню действий -->
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              variant="text"
              size="small"
              @click.stop
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list density="compact">
            <v-list-item @click="$emit('download', document)">
              <template v-slot:prepend>
                <v-icon>mdi-download</v-icon>
              </template>
              <v-list-item-title>Скачать</v-list-item-title>
            </v-list-item>

            <v-list-item @click="copyLink">
              <template v-slot:prepend>
                <v-icon>mdi-link</v-icon>
              </template>
              <v-list-item-title>Копировать ссылку</v-list-item-title>
            </v-list-item>

            <v-divider />

            <v-list-item
              @click="$emit('delete', document)"
              class="text-error"
            >
              <template v-slot:prepend>
                <v-icon color="error">mdi-delete</v-icon>
              </template>
              <v-list-item-title>Удалить</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Описание -->
      <p
        v-if="document.description"
        class="text-body-2 text-medium-emphasis mb-3"
        style="
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        "
      >
        {{ document.description }}
      </p>

      <!-- Метаинформация -->
      <div class="document-meta">
        <div class="d-flex align-center mb-1">
          <v-icon size="14" color="grey" class="me-2">mdi-file</v-icon>
          <span class="text-caption">
            {{ getFileTypeLabel(document.file_type) }}
          </span>
        </div>

        <div class="d-flex align-center mb-1">
          <v-icon size="14" color="grey" class="me-2">mdi-calendar</v-icon>
          <span class="text-caption">
            Добавлен {{ formatDate(document.created_at) }}
          </span>
        </div>

        <div
          v-if="document.uploaded_by"
          class="d-flex align-center"
        >
          <v-icon size="14" color="grey" class="me-2">mdi-account</v-icon>
          <span class="text-caption">
            {{ getUserName(document.uploaded_by) }}
          </span>
        </div>
      </div>
    </v-card-text>

    <!-- Категория как цветная полоска снизу -->
    <div
      class="category-indicator"
      :style="{ backgroundColor: getCategoryColor(document.category) }"
    />
  </v-card>
</template>

<script setup>
import { useAppStore } from '@/stores/appStore'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

defineEmits(['download', 'delete'])

const appStore = useAppStore()

// Методы
const getFileTypeIcon = (fileType) => {
  const icons = {
    pdf: 'mdi-file-pdf-box',
    doc: 'mdi-file-word-box',
    docx: 'mdi-file-word-box',
    ppt: 'mdi-file-powerpoint-box',
    pptx: 'mdi-file-powerpoint-box',
    txt: 'mdi-file-document-outline',
    jpg: 'mdi-file-image',
    jpeg: 'mdi-file-image',
    png: 'mdi-file-image',
    gif: 'mdi-file-image'
  }
  return icons[fileType] || 'mdi-file'
}

const getFileTypeColor = (fileType) => {
  const colors = {
    pdf: '#d32f2f',
    doc: '#1976d2',
    docx: '#1976d2',
    ppt: '#ff5722',
    pptx: '#ff5722',
    txt: '#616161',
    jpg: '#4caf50',
    jpeg: '#4caf50',
    png: '#4caf50',
    gif: '#4caf50'
  }
  return colors[fileType] || '#757575'
}

const getFileTypeLabel = (fileType) => {
  const labels = {
    pdf: 'PDF документ',
    doc: 'Word документ',
    docx: 'Word документ',
    ppt: 'PowerPoint презентация',
    pptx: 'PowerPoint презентация',
    txt: 'Текстовый файл',
    jpg: 'Изображение',
    jpeg: 'Изображение',
    png: 'Изображение',
    gif: 'Изображение'
  }
  return labels[fileType] || 'Документ'
}

const getCategoryLabel = (category) => {
  const labels = {
    brand_guidelines: 'Брендбук',
    strategy: 'Стратегия',
    constraints: 'Ограничения',
    templates: 'Шаблоны',
    research: 'Исследования',
    reports: 'Отчеты',
    other: 'Другое'
  }
  return labels[category] || 'Документ'
}

const getCategoryColor = (category) => {
  const colors = {
    brand_guidelines: '#1976d2',
    strategy: '#388e3c',
    constraints: '#f57c00',
    templates: '#0288d1',
    research: '#7b1fa2',
    reports: '#f57c00',
    other: '#616161'
  }
  return colors[category] || '#616161'
}

const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

const getUserName = (userId) => {
  // В реальном приложении здесь был бы поиск пользователя по ID
  return 'Пользователь'
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.document.file_url)
    appStore.showSuccess('Ссылка скопирована в буфер обмена')
  } catch (error) {
    appStore.showError('Не удалось скопировать ссылку')
  }
}
</script>

<style scoped>
.document-card {
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.document-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.document-meta {
  min-height: 60px;
}

.category-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}
</style>