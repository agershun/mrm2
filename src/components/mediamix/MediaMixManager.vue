<template>
  <div class="media-mix-manager">
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5">Медиа-микс</h2>
      <v-btn color="primary" @click="showCreateDialog = true">
        <v-icon>mdi-plus</v-icon>
        Создать медиа-микс
      </v-btn>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="Поиск медиа-миксов"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  hide-details
                  clearable
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
              <v-col cols="12" md="3">
                <v-select
                  v-model="filterStatus"
                  :items="statusOptions"
                  label="Статус"
                  variant="outlined"
                  clearable
                  hide-details
                />
              </v-col>
            </v-row>

            <!-- Список медиа-миксов -->
            <div v-for="mix in filteredMediaMixes" :key="mix.mix_id" class="mb-4">
              <v-card variant="outlined" @click="selectMediaMix(mix)">
                <v-card-text>
                  <div class="d-flex justify-space-between align-start">
                    <div>
                      <h4 class="text-h6 mb-2">{{ mix.name }}</h4>
                      <p class="text-body-2 text-grey mb-3">{{ mix.description }}</p>

                      <div class="d-flex align-center mb-2">
                        <v-chip
                          size="small"
                          :color="getStatusColor(mix.status)"
                          class="me-2"
                        >
                          {{ getStatusLabel(mix.status) }}
                        </v-chip>
                        <v-chip size="small" color="info" class="me-2">
                          {{ mix.industry }}
                        </v-chip>
                        <span class="text-caption text-grey">
                          Бюджет: {{ formatCurrency(mix.total_budget) }}
                        </span>
                      </div>

                      <!-- Каналы в миксе -->
                      <div class="d-flex flex-wrap gap-2 mb-2">
                        <v-chip
                          v-for="channel in mix.channels"
                          :key="channel.channel"
                          size="small"
                          :color="getChannelColor(channel.channel)"
                          variant="tonal"
                        >
                          {{ channel.channel }} ({{ channel.budget_share }}%)
                        </v-chip>
                      </div>
                    </div>

                    <div class="text-right">
                      <div class="text-h6 mb-1" :class="getRoiColor(mix.expected_roi)">
                        ROI: {{ mix.expected_roi }}%
                      </div>
                      <div class="text-caption text-grey">
                        {{ formatDate(mix.updated_at) }}
                      </div>
                      <v-menu>
                        <template #activator="{ props }">
                          <v-btn
                            icon="mdi-dots-vertical"
                            size="small"
                            variant="text"
                            v-bind="props"
                            @click.stop
                          />
                        </template>
                        <v-list>
                          <v-list-item @click="editMediaMix(mix)">
                            <v-list-item-title>Редактировать</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="optimizeMediaMix(mix)">
                            <v-list-item-title>Оптимизировать</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="duplicateMediaMix(mix)">
                            <v-list-item-title>Дублировать</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="deleteMediaMix(mix)" class="text-error">
                            <v-list-item-title>Удалить</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <div v-if="filteredMediaMixes.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2">mdi-chart-pie</v-icon>
              <h3 class="text-h6 mt-2">Медиа-миксы не найдены</h3>
              <p class="text-grey">Создайте новый медиа-микс для планирования распределения бюджета</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <MediaMixPreview :mediaMix="selectedMediaMix" />
      </v-col>
    </v-row>

    <!-- Диалог создания/редактирования медиа-микса -->
    <MediaMixEditDialog
      v-model="showCreateDialog"
      :mediaMix="editingMediaMix"
      @saved="handleMediaMixSaved"
    />

    <!-- Диалог оптимизации -->
    <MediaMixOptimizeDialog
      v-model="showOptimizeDialog"
      :mediaMix="optimizingMediaMix"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMediaMixStore } from '@/stores/mediaMixStore'
import MediaMixPreview from './MediaMixPreview.vue'
import MediaMixEditDialog from './MediaMixEditDialog.vue'
import MediaMixOptimizeDialog from './MediaMixOptimizeDialog.vue'

const mediaMixStore = useMediaMixStore()

const searchQuery = ref('')
const filterIndustry = ref(null)
const filterStatus = ref(null)
const selectedMediaMix = ref(null)
const showCreateDialog = ref(false)
const showOptimizeDialog = ref(false)
const editingMediaMix = ref(null)
const optimizingMediaMix = ref(null)

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

const statusOptions = [
  { title: 'Активный', value: 'active' },
  { title: 'Черновик', value: 'draft' },
  { title: 'Архивный', value: 'archived' }
]

const filteredMediaMixes = computed(() => {
  let mixes = mediaMixStore.mediaMixes

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    mixes = mixes.filter(mix =>
      mix.name.toLowerCase().includes(query) ||
      mix.description.toLowerCase().includes(query)
    )
  }

  if (filterIndustry.value) {
    mixes = mixes.filter(mix => mix.industry === filterIndustry.value)
  }

  if (filterStatus.value) {
    mixes = mixes.filter(mix => mix.status === filterStatus.value)
  }

  return mixes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
})

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    draft: 'warning',
    archived: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Активный',
    draft: 'Черновик',
    archived: 'Архивный'
  }
  return labels[status] || status
}

const getChannelColor = (channel) => {
  const colors = {
    'Google Ads': 'primary',
    'Yandex Direct': 'warning',
    'Facebook': 'blue',
    'Instagram': 'purple',
    'YouTube': 'red',
    'VKontakte': 'blue-grey',
    'Telegram': 'cyan',
    'Email': 'orange'
  }
  return colors[channel] || 'grey'
}

const getRoiColor = (roi) => {
  if (roi >= 300) return 'text-success'
  if (roi >= 200) return 'text-warning'
  return 'text-error'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}

const selectMediaMix = (mix) => {
  selectedMediaMix.value = mix
}

const editMediaMix = (mix) => {
  editingMediaMix.value = mix
  showCreateDialog.value = true
}

const optimizeMediaMix = (mix) => {
  optimizingMediaMix.value = mix
  showOptimizeDialog.value = true
}

const duplicateMediaMix = async (mix) => {
  await mediaMixStore.duplicateMediaMix(mix.mix_id)
}

const deleteMediaMix = async (mix) => {
  if (confirm(`Удалить медиа-микс "${mix.name}"?`)) {
    await mediaMixStore.deleteMediaMix(mix.mix_id)
    if (selectedMediaMix.value?.mix_id === mix.mix_id) {
      selectedMediaMix.value = null
    }
  }
}

const handleMediaMixSaved = () => {
  showCreateDialog.value = false
  editingMediaMix.value = null
}

onMounted(async () => {
  await mediaMixStore.fetchMediaMixes()
  if (mediaMixStore.mediaMixes.length > 0) {
    selectedMediaMix.value = mediaMixStore.mediaMixes[0]
  }
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>