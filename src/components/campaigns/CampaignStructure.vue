<template>
  <div class="campaign-structure">
    <!-- Header with actions -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5">Структура кампании</h2>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="$emit('create-ad-group')"
      >
        Создать группу объявлений
      </v-btn>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" :size="40" />
      <div class="mt-2 text-body-2">Загрузка структуры...</div>
    </div>

    <!-- Empty state -->
    <v-card v-else-if="adGroups.length === 0" class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">
        mdi-folder-outline
      </v-icon>
      <h3 class="text-h6 mb-2">Нет групп объявлений</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Создайте первую группу объявлений для начала работы с кампанией
      </p>
      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-plus"
        @click="$emit('create-ad-group')"
      >
        Создать группу объявлений
      </v-btn>
    </v-card>

    <!-- Ad Groups List -->
    <div v-else class="ad-groups-list">
      <v-expansion-panels
        v-model="expandedPanels"
        multiple
        variant="accordion"
      >
        <v-expansion-panel
          v-for="adGroup in adGroups"
          :key="adGroup.ad_group_id"
          :value="adGroup.ad_group_id"
        >
          <v-expansion-panel-title>
            <div class="d-flex align-center w-100">
              <div class="flex-grow-1">
                <div class="d-flex align-center">
                  <v-icon class="me-3" color="primary">mdi-folder</v-icon>
                  <div>
                    <div class="font-weight-medium">{{ adGroup.name }}</div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ adGroup.creatives_count || 0 }} креативов
                      • {{ getTargetingText(adGroup) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex align-center gap-2 me-4">
                <v-chip
                  :color="getStatusColor(adGroup.status)"
                  size="small"
                  variant="flat"
                >
                  {{ getStatusText(adGroup.status) }}
                </v-chip>
                <v-chip
                  color="info"
                  size="small"
                  variant="outlined"
                >
                  {{ formatCurrency(adGroup.budget_value) }}/день
                </v-chip>
              </div>
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <div class="pa-4">
              <!-- Ad Group Info -->
              <v-row class="mb-4">
                <v-col cols="12" md="3">
                  <div class="text-body-2 text-medium-emphasis mb-1">Бюджет</div>
                  <div class="font-weight-medium">
                    {{ formatCurrency(adGroup.budget_value) }} / день
                  </div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-body-2 text-medium-emphasis mb-1">Ставка</div>
                  <div class="font-weight-medium">
                    {{ formatCurrency(adGroup.bid_amount) }}
                  </div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-body-2 text-medium-emphasis mb-1">Аудитория</div>
                  <div class="font-weight-medium">
                    {{ getAudienceText(adGroup) }}
                  </div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-body-2 text-medium-emphasis mb-1">Размещения</div>
                  <div class="font-weight-medium">
                    {{ adGroup.placements?.join(', ') || 'Все' }}
                  </div>
                </v-col>
              </v-row>

              <!-- Actions -->
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h6">
                  Креативы ({{ adGroup.creatives_count || 0 }})
                </h3>
                <div class="d-flex gap-2">
                  <v-btn
                    size="small"
                    variant="outlined"
                    prepend-icon="mdi-eye"
                    @click="$emit('view-creatives', adGroup)"
                  >
                    Просмотр креативов
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="outlined"
                    prepend-icon="mdi-pencil"
                    @click="$emit('edit-ad-group', adGroup)"
                  >
                    Редактировать
                  </v-btn>
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
                      <v-list-item @click="duplicateAdGroup(adGroup)">
                        <v-list-item-title>
                          <v-icon class="me-2" size="16">mdi-content-copy</v-icon>
                          Дублировать
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="toggleAdGroupStatus(adGroup)">
                        <v-list-item-title>
                          <v-icon class="me-2" size="16">
                            {{ adGroup.status === 'active' ? 'mdi-pause' : 'mdi-play' }}
                          </v-icon>
                          {{ adGroup.status === 'active' ? 'Приостановить' : 'Запустить' }}
                        </v-list-item-title>
                      </v-list-item>
                      <v-divider />
                      <v-list-item @click="$emit('delete-ad-group', adGroup.ad_group_id)" class="text-error">
                        <v-list-item-title>
                          <v-icon class="me-2" size="16">mdi-delete</v-icon>
                          Удалить
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>

              <!-- Creatives Preview -->
              <div v-if="adGroup.creatives_preview && adGroup.creatives_preview.length > 0">
                <v-row>
                  <v-col
                    v-for="creative in adGroup.creatives_preview"
                    :key="creative.creative_id"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-card variant="outlined" class="creative-preview">
                      <v-card-text class="pa-3">
                        <div class="d-flex align-center mb-2">
                          <v-icon
                            :color="getCreativeTypeColor(creative.creative_type)"
                            class="me-2"
                          >
                            {{ getCreativeTypeIcon(creative.creative_type) }}
                          </v-icon>
                          <div class="text-body-2 font-weight-medium">
                            {{ creative.name }}
                          </div>
                        </div>
                        <div class="text-body-2 text-medium-emphasis">
                          {{ getCreativeTypeText(creative.creative_type) }}
                        </div>
                        <v-chip
                          :color="getStatusColor(creative.status)"
                          size="x-small"
                          variant="flat"
                          class="mt-2"
                        >
                          {{ getStatusText(creative.status) }}
                        </v-chip>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <div v-if="(adGroup.creatives_count || 0) > 3" class="text-center mt-3">
                  <v-btn
                    variant="text"
                    size="small"
                    @click="$emit('view-creatives', adGroup)"
                  >
                    Показать еще {{ (adGroup.creatives_count || 0) - 3 }} креатива
                  </v-btn>
                </div>
              </div>

              <!-- No creatives state -->
              <v-card v-else variant="outlined" class="text-center pa-6">
                <v-icon size="48" color="grey-lighten-1" class="mb-2">
                  mdi-image-outline
                </v-icon>
                <div class="text-body-2 text-medium-emphasis mb-3">
                  В этой группе пока нет креативов
                </div>
                <v-btn
                  size="small"
                  variant="outlined"
                  @click="$emit('view-creatives', adGroup)"
                >
                  Создать креатив
                </v-btn>
              </v-card>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  },
  adGroups: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'create-ad-group',
  'edit-ad-group',
  'delete-ad-group',
  'view-creatives'
])

// Local state
const expandedPanels = ref([])

// Methods
const duplicateAdGroup = (adGroup) => {
  // TODO: Implement duplication logic
  console.log('Duplicate ad group:', adGroup)
}

const toggleAdGroupStatus = (adGroup) => {
  // TODO: Implement status toggle
  console.log('Toggle ad group status:', adGroup)
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
    completed: 'info',
    archived: 'grey-darken-2'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Активна',
    paused: 'На паузе',
    draft: 'Черновик',
    completed: 'Завершена',
    archived: 'Архив'
  }
  return texts[status] || status
}

const getTargetingText = (adGroup) => {
  const parts = []

  if (adGroup.age_min || adGroup.age_max) {
    parts.push(`${adGroup.age_min || 18}-${adGroup.age_max || 65} лет`)
  }

  if (adGroup.gender && adGroup.gender !== 'all') {
    const genderTexts = {
      male: 'мужчины',
      female: 'женщины'
    }
    parts.push(genderTexts[adGroup.gender])
  }

  if (adGroup.locations && adGroup.locations.length > 0) {
    parts.push(adGroup.locations.slice(0, 2).join(', '))
    if (adGroup.locations.length > 2) {
      parts.push(`+${adGroup.locations.length - 2}`)
    }
  }

  return parts.join(' • ') || 'Базовое таргетирование'
}

const getAudienceText = (adGroup) => {
  if (adGroup.audience_size) {
    return new Intl.NumberFormat('ru-RU').format(adGroup.audience_size)
  }
  return 'Не определен'
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
.campaign-structure {
  max-width: 100%;
}

.ad-groups-list {
  margin-top: 16px;
}

.creative-preview {
  height: 100%;
}

:deep(.v-expansion-panel-title) {
  padding: 16px 24px;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 0;
}
</style>