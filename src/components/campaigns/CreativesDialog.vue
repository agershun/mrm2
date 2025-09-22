<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="1200"
    fullscreen
  >
    <v-card>
      <v-toolbar color="primary" density="compact">
        <v-toolbar-title>
          Креативы: {{ adGroup?.name }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-toolbar>

      <v-card-text class="pa-0">
        <!-- Toolbar -->
        <v-toolbar density="compact" class="border-b">
          <v-text-field
            v-model="searchQuery"
            placeholder="Поиск креативов..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            density="compact"
            variant="outlined"
            class="ma-2"
            style="max-width: 300px;"
          />

          <v-spacer />

          <v-btn-toggle
            v-model="viewMode"
            mandatory
            variant="outlined"
            density="compact"
            class="me-2"
          >
            <v-btn value="grid" icon="mdi-view-grid" />
            <v-btn value="list" icon="mdi-view-list" />
          </v-btn-toggle>

          <v-menu>
            <template #activator="{ props }">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-filter"
                v-bind="props"
                class="me-2"
              >
                Фильтры
              </v-btn>
            </template>
            <v-card min-width="300">
              <v-card-text>
                <v-select
                  v-model="filterStatus"
                  :items="statusOptions"
                  label="Статус"
                  clearable
                  multiple
                  chips
                  density="compact"
                />
                <v-select
                  v-model="filterType"
                  :items="typeOptions"
                  label="Тип креатива"
                  clearable
                  multiple
                  chips
                  density="compact"
                />
              </v-card-text>
            </v-card>
          </v-menu>

          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="$emit('create')"
          >
            Создать креатив
          </v-btn>
        </v-toolbar>

        <!-- Content -->
        <div class="pa-4">
          <!-- Empty state -->
          <v-card v-if="filteredCreatives.length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-image-outline
            </v-icon>
            <h3 class="text-h6 mb-2">Нет креативов</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Создайте первый креатив для этой группы объявлений
            </p>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-plus"
              @click="$emit('create')"
            >
              Создать креатив
            </v-btn>
          </v-card>

          <!-- Grid View -->
          <v-row v-else-if="viewMode === 'grid'" class="creatives-grid">
            <v-col
              v-for="creative in filteredCreatives"
              :key="creative.creative_id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card class="creative-card h-100" hover>
                <!-- Preview -->
                <div class="creative-preview">
                  <v-img
                    v-if="creative.creative_type === 'image' && creative.image_url"
                    :src="creative.image_url"
                    :alt="creative.name"
                    height="200"
                    cover
                  />
                  <div
                    v-else-if="creative.creative_type === 'video'"
                    class="video-preview d-flex align-center justify-center"
                    style="height: 200px; background: #f5f5f5;"
                  >
                    <v-icon size="48" color="grey">mdi-play-circle</v-icon>
                  </div>
                  <div
                    v-else
                    class="text-preview d-flex align-center justify-center pa-4"
                    style="height: 200px; background: #f5f5f5;"
                  >
                    <div class="text-center">
                      <v-icon size="48" color="grey" class="mb-2">
                        {{ getCreativeTypeIcon(creative.creative_type) }}
                      </v-icon>
                      <div class="text-body-2">{{ getCreativeTypeText(creative.creative_type) }}</div>
                    </div>
                  </div>

                  <!-- Status overlay -->
                  <v-chip
                    :color="getStatusColor(creative.status)"
                    size="small"
                    variant="flat"
                    class="status-chip"
                  >
                    {{ getStatusText(creative.status) }}
                  </v-chip>
                </div>

                <v-card-text>
                  <div class="d-flex align-start justify-space-between mb-2">
                    <h4 class="text-subtitle-2">{{ creative.name }}</h4>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn
                          icon="mdi-dots-vertical"
                          variant="text"
                          size="small"
                          v-bind="props"
                        />
                      </template>
                      <v-list density="compact">
                        <v-list-item @click="$emit('edit', creative)">
                          <v-list-item-title>
                            <v-icon class="me-2" size="16">mdi-pencil</v-icon>
                            Редактировать
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="duplicateCreative(creative)">
                          <v-list-item-title>
                            <v-icon class="me-2" size="16">mdi-content-copy</v-icon>
                            Дублировать
                          </v-list-item-title>
                        </v-list-item>
                        <v-divider />
                        <v-list-item @click="$emit('delete', creative.creative_id)" class="text-error">
                          <v-list-item-title>
                            <v-icon class="me-2" size="16">mdi-delete</v-icon>
                            Удалить
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>

                  <div class="text-body-2 text-medium-emphasis mb-2">
                    {{ getCreativeTypeText(creative.creative_type) }}
                  </div>

                  <!-- Performance metrics -->
                  <div v-if="creative.performance" class="performance-metrics">
                    <v-row dense>
                      <v-col cols="4">
                        <div class="text-caption text-medium-emphasis">CTR</div>
                        <div class="text-body-2 font-weight-medium">
                          {{ creative.performance.ctr }}%
                        </div>
                      </v-col>
                      <v-col cols="4">
                        <div class="text-caption text-medium-emphasis">CPC</div>
                        <div class="text-body-2 font-weight-medium">
                          {{ formatCurrency(creative.performance.cpc) }}
                        </div>
                      </v-col>
                      <v-col cols="4">
                        <div class="text-caption text-medium-emphasis">Conv</div>
                        <div class="text-body-2 font-weight-medium">
                          {{ creative.performance.conversions }}
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- List View -->
          <v-data-table
            v-else
            :headers="listHeaders"
            :items="filteredCreatives"
            :search="searchQuery"
            item-value="creative_id"
            class="elevation-1"
          >
            <!-- Name -->
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar
                  :color="getCreativeTypeColor(item.creative_type)"
                  size="32"
                  class="me-3"
                >
                  <v-icon color="white" size="18">
                    {{ getCreativeTypeIcon(item.creative_type) }}
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ getCreativeTypeText(item.creative_type) }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Status -->
            <template #item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                variant="flat"
              >
                {{ getStatusText(item.status) }}
              </v-chip>
            </template>

            <!-- Performance -->
            <template #item.performance="{ item }">
              <div v-if="item.performance">
                <div class="text-body-2">
                  CTR: {{ item.performance.ctr }}%
                </div>
                <div class="text-body-2">
                  CPC: {{ formatCurrency(item.performance.cpc) }}
                </div>
              </div>
              <span v-else class="text-medium-emphasis">Нет данных</span>
            </template>

            <!-- Actions -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-pencil"
                  @click="$emit('edit', item)"
                />
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      size="small"
                      variant="text"
                      icon="mdi-dots-vertical"
                      v-bind="props"
                    />
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="duplicateCreative(item)">
                      <v-list-item-title>
                        <v-icon class="me-2" size="16">mdi-content-copy</v-icon>
                        Дублировать
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="$emit('delete', item.creative_id)" class="text-error">
                      <v-list-item-title>
                        <v-icon class="me-2" size="16">mdi-delete</v-icon>
                        Удалить
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  adGroup: {
    type: Object,
    default: null
  },
  creatives: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'create', 'edit', 'delete'])

// Local state
const viewMode = ref('grid')
const searchQuery = ref('')
const filterStatus = ref([])
const filterType = ref([])

// Computed
const filteredCreatives = computed(() => {
  let result = props.creatives || []

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(creative =>
      creative.name.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (filterStatus.value.length > 0) {
    result = result.filter(creative =>
      filterStatus.value.includes(creative.status)
    )
  }

  // Filter by type
  if (filterType.value.length > 0) {
    result = result.filter(creative =>
      filterType.value.includes(creative.creative_type)
    )
  }

  return result
})

// Options
const statusOptions = [
  { title: 'Активен', value: 'active' },
  { title: 'На паузе', value: 'paused' },
  { title: 'Черновик', value: 'draft' },
  { title: 'Отклонен', value: 'rejected' }
]

const typeOptions = [
  { title: 'Изображение', value: 'image' },
  { title: 'Видео', value: 'video' },
  { title: 'Карусель', value: 'carousel' },
  { title: 'Коллекция', value: 'collection' },
  { title: 'Текст', value: 'text' }
]

// Table headers for list view
const listHeaders = [
  { title: 'Название', key: 'name', sortable: true, width: '30%' },
  { title: 'Статус', key: 'status', sortable: true, width: '15%' },
  { title: 'Производительность', key: 'performance', sortable: false, width: '20%' },
  { title: 'Создан', key: 'created_at', sortable: true, width: '15%' },
  { title: 'Действия', key: 'actions', sortable: false, width: '20%' }
]

// Methods
const duplicateCreative = (creative) => {
  console.log('Duplicate creative:', creative)
}

// Utility methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    paused: 'warning',
    draft: 'grey',
    rejected: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Активен',
    paused: 'На паузе',
    draft: 'Черновик',
    rejected: 'Отклонен'
  }
  return texts[status] || status
}

const getCreativeTypeColor = (type) => {
  const colors = {
    image: 'blue',
    video: 'purple',
    carousel: 'orange',
    collection: 'green',
    text: 'grey'
  }
  return colors[type] || 'primary'
}

const getCreativeTypeIcon = (type) => {
  const icons = {
    image: 'mdi-image',
    video: 'mdi-play',
    carousel: 'mdi-view-carousel',
    collection: 'mdi-view-grid',
    text: 'mdi-text'
  }
  return icons[type] || 'mdi-file'
}

const getCreativeTypeText = (type) => {
  const texts = {
    image: 'Изображение',
    video: 'Видео',
    carousel: 'Карусель',
    collection: 'Коллекция',
    text: 'Текст'
  }
  return texts[type] || type
}
</script>

<style scoped>
.creatives-grid {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.creative-card {
  transition: transform 0.2s;
}

.creative-card:hover {
  transform: translateY(-2px);
}

.creative-preview {
  position: relative;
}

.status-chip {
  position: absolute;
  top: 8px;
  right: 8px;
}

.performance-metrics {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding-top: 8px;
  margin-top: 8px;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>