<template>
  <div class="ad-formats-settings">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-format-size</v-icon>
        Рекламные форматы
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Добавить формат
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Настройка доступных рекламных форматов и их технических характеристик
        </p>

        <!-- Статистика -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-primary">{{ totalFormats }}</div>
                <div class="text-caption">Всего форматов</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-success">{{ activeFormats }}</div>
                <div class="text-caption">Активных</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-info">{{ digitalFormats }}</div>
                <div class="text-caption">Цифровых</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-warning">{{ uniqueChannels }}</div>
                <div class="text-caption">Каналов</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Фильтры и поиск -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск форматов"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedChannel"
              :items="channels"
              label="Канал"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedType"
              :items="types"
              label="Тип"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              label="Статус"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
        </v-row>

        <!-- Таблица форматов -->
        <v-data-table
          :headers="headers"
          :items="filteredFormats"
          :loading="loading"
          item-key="id"
          @click:row="editFormat"
        >
          <template v-slot:item.channel="{ item }">
            <div class="d-flex align-center">
              <v-icon class="mr-2" :color="getChannelColor(item.channel)">
                {{ getChannelIcon(item.channel) }}
              </v-icon>
              {{ item.channel }}
            </div>
          </template>

          <template v-slot:item.dimensions="{ item }">
            <v-chip
              size="small"
              color="info"
              variant="outlined"
            >
              {{ formatDimensions(item) }}
            </v-chip>
          </template>

          <template v-slot:item.file_types="{ item }">
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="type in item.file_types"
                :key="type"
                size="x-small"
                color="secondary"
                variant="outlined"
              >
                {{ type }}
              </v-chip>
            </div>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click.stop="editFormat(item)"
            />
            <v-btn
              icon="mdi-content-copy"
              size="small"
              variant="text"
              color="info"
              @click.stop="duplicateFormat(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click.stop="deleteFormat(item)"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Диалог создания/редактирования -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ editingFormat ? 'Редактирование формата' : 'Новый рекламный формат' }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Название формата"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.channel"
                  :items="channelOptions"
                  label="Канал"
                  :rules="[rules.required]"
                  variant="outlined"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon>{{ getChannelIcon(item.value) }}</v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.width"
                  label="Ширина (px)"
                  type="number"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.height"
                  label="Высота (px)"
                  type="number"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.max_file_size_mb"
                  label="Макс. размер файла (MB)"
                  type="number"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.duration_seconds"
                  label="Длительность (сек)"
                  type="number"
                  variant="outlined"
                  :disabled="!isVideoFormat"
                />
              </v-col>
              <v-col cols="12">
                <v-combobox
                  v-model="formData.file_types"
                  :items="fileTypeOptions"
                  label="Поддерживаемые форматы файлов"
                  multiple
                  chips
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.type"
                  :items="typeOptions"
                  label="Тип формата"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.status"
                  :items="statusOptions"
                  label="Статус"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Описание"
                  variant="outlined"
                  rows="2"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.technical_requirements"
                  label="Технические требования"
                  placeholder="Например: разрешение не менее 300 DPI, цветовая модель RGB"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            :loading="saving"
            @click="saveFormat"
          >
            {{ editingFormat ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтвердите удаление</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить формат "{{ formatToDelete?.name }}"?
          Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Отмена</v-btn>
          <v-btn color="error" @click="confirmDelete">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAdFormatsStore } from '@/stores/adFormatsStore'
import { useSnackbar } from '@/composables/useSnackbar'

// Stores
const adFormatsStore = useAdFormatsStore()
const { showSnackbar } = useSnackbar()

// Reactive data
const searchQuery = ref('')
const selectedChannel = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const formValid = ref(false)
const saving = ref(false)
const editingFormat = ref(null)
const formatToDelete = ref(null)
const form = ref(null)

// Form data
const formData = ref({
  name: '',
  channel: '',
  width: null,
  height: null,
  file_types: [],
  max_file_size_mb: null,
  duration_seconds: null,
  type: '',
  status: 'active',
  description: '',
  technical_requirements: ''
})

// Computed
const loading = computed(() => adFormatsStore.loading)
const formats = computed(() => adFormatsStore.formats)

const filteredFormats = computed(() => {
  let filtered = formats.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(format =>
      format.name.toLowerCase().includes(query) ||
      format.description.toLowerCase().includes(query)
    )
  }

  if (selectedChannel.value) {
    filtered = filtered.filter(format => format.channel === selectedChannel.value)
  }

  if (selectedType.value) {
    filtered = filtered.filter(format => format.type === selectedType.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(format => format.status === selectedStatus.value)
  }

  return filtered
})

const channels = computed(() => {
  return [...new Set(formats.value.map(f => f.channel))].sort()
})

const types = computed(() => {
  return [...new Set(formats.value.map(f => f.type))].sort()
})

const totalFormats = computed(() => formats.value.length)
const activeFormats = computed(() => formats.value.filter(f => f.status === 'active').length)
const digitalFormats = computed(() => formats.value.filter(f => ['Display', 'Social', 'Video', 'Search'].includes(f.channel)).length)
const uniqueChannels = computed(() => channels.value.length)

const isVideoFormat = computed(() => {
  return formData.value.type === 'video' || formData.value.channel === 'Video'
})

// Data options
const headers = [
  { title: 'Название', key: 'name' },
  { title: 'Канал', key: 'channel' },
  { title: 'Размер', key: 'dimensions' },
  { title: 'Форматы файлов', key: 'file_types' },
  { title: 'Статус', key: 'status' },
  { title: 'Действия', key: 'actions', sortable: false }
]

const channelOptions = [
  { title: 'Медийная реклама', value: 'Display' },
  { title: 'Поисковая реклама', value: 'Search' },
  { title: 'Социальные сети', value: 'Social' },
  { title: 'Видеореклама', value: 'Video' },
  { title: 'Email маркетинг', value: 'Email' },
  { title: 'Мобильная реклама', value: 'Mobile' },
  { title: 'Наружная реклама', value: 'OOH' },
  { title: 'Печатная реклама', value: 'Print' }
]

const typeOptions = [
  { title: 'Статичный баннер', value: 'static_banner' },
  { title: 'Анимированный баннер', value: 'animated_banner' },
  { title: 'Видео', value: 'video' },
  { title: 'Rich media', value: 'rich_media' },
  { title: 'Интерактивный', value: 'interactive' },
  { title: 'Нативный', value: 'native' }
]

const statusOptions = [
  { title: 'Активный', value: 'active' },
  { title: 'Неактивный', value: 'inactive' },
  { title: 'Устаревший', value: 'deprecated' },
  { title: 'В тестировании', value: 'testing' }
]

const fileTypeOptions = [
  'JPG', 'JPEG', 'PNG', 'GIF', 'SVG', 'WebP',
  'MP4', 'MOV', 'AVI', 'WebM',
  'HTML5', 'SWF', 'DCM',
  'PDF', 'AI', 'PSD', 'EPS'
]

// Validation rules
const rules = {
  required: value => {
    if (Array.isArray(value)) {
      return value.length > 0 || 'Поле обязательно для заполнения'
    }
    return !!value || 'Поле обязательно для заполнения'
  }
}

// Methods
const openCreateDialog = () => {
  editingFormat.value = null
  formData.value = {
    name: '',
    channel: '',
    width: null,
    height: null,
    file_types: [],
    max_file_size_mb: 5,
    duration_seconds: null,
    type: 'static_banner',
    status: 'active',
    description: '',
    technical_requirements: ''
  }
  dialog.value = true
}

const editFormat = (format) => {
  editingFormat.value = format
  formData.value = { ...format }
  dialog.value = true
}

const duplicateFormat = (format) => {
  editingFormat.value = null
  formData.value = {
    ...format,
    name: `${format.name} (копия)`,
    id: undefined
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editingFormat.value = null
  if (form.value) {
    form.value.reset()
  }
}

const saveFormat = async () => {
  if (!formValid.value) return

  saving.value = true
  try {
    if (editingFormat.value) {
      await adFormatsStore.updateFormat(editingFormat.value.id, formData.value)
      showSnackbar('Формат успешно обновлен', 'success')
    } else {
      await adFormatsStore.createFormat(formData.value)
      showSnackbar('Формат успешно создан', 'success')
    }
    closeDialog()
  } catch (error) {
    showSnackbar('Ошибка при сохранении формата', 'error')
  } finally {
    saving.value = false
  }
}

const deleteFormat = (format) => {
  formatToDelete.value = format
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await adFormatsStore.deleteFormat(formatToDelete.value.id)
    showSnackbar('Формат успешно удален', 'success')
    deleteDialog.value = false
    formatToDelete.value = null
  } catch (error) {
    showSnackbar('Ошибка при удалении формата', 'error')
  }
}

const getChannelIcon = (channel) => {
  const icons = {
    Display: 'mdi-monitor',
    Search: 'mdi-magnify',
    Social: 'mdi-account-group',
    Video: 'mdi-play-circle',
    Email: 'mdi-email',
    Mobile: 'mdi-cellphone',
    OOH: 'mdi-billboard',
    Print: 'mdi-printer'
  }
  return icons[channel] || 'mdi-advertisement'
}

const getChannelColor = (channel) => {
  const colors = {
    Display: 'blue',
    Search: 'green',
    Social: 'purple',
    Video: 'red',
    Email: 'orange',
    Mobile: 'teal',
    OOH: 'brown',
    Print: 'grey'
  }
  return colors[channel] || 'primary'
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    inactive: 'error',
    deprecated: 'warning',
    testing: 'info'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Активный',
    inactive: 'Неактивный',
    deprecated: 'Устаревший',
    testing: 'В тестировании'
  }
  return texts[status] || status
}

const formatDimensions = (format) => {
  return `${format.width}×${format.height}`
}

// Watchers
watch(() => formData.value.type, (newType) => {
  if (newType !== 'video') {
    formData.value.duration_seconds = null
  }
})

watch(() => formData.value.channel, (newChannel) => {
  if (newChannel === 'Video' && formData.value.type === 'static_banner') {
    formData.value.type = 'video'
  }
})

// Lifecycle
onMounted(async () => {
  await adFormatsStore.fetchFormats()
})
</script>

<style scoped>
.ad-formats-settings {
  height: 100%;
}

:deep(.v-data-table tbody tr) {
  cursor: pointer;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>