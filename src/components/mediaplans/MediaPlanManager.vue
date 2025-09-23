<template>
  <div class="media-plan-manager">
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5">Медиа-планы</h2>
      <v-btn color="primary" @click="showCreateDialog = true">
        <v-icon>mdi-plus</v-icon>
        Создать медиа-план
      </v-btn>
    </div>

    <v-tabs v-model="activeTab" class="mb-4">
      <v-tab value="list">Список планов</v-tab>
      <v-tab value="calendar">Календарь</v-tab>
      <v-tab value="analytics">Аналитика</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <!-- Список планов -->
      <v-tabs-window-item value="list">
        <v-card>
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="Поиск медиа-планов"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  hide-details
                  clearable
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
              <v-col cols="12" md="3">
                <v-select
                  v-model="filterChannel"
                  :items="channels"
                  label="Канал"
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

            <!-- Таблица планов -->
            <div v-if="viewMode === 'list'">
              <v-data-table
                :headers="headers"
                :items="filteredMediaPlans"
                :loading="loading"
                item-value="plan_id"
                @click:row="viewPlan"
              >
                <template #item.status="{ item }">
                  <v-chip size="small" :color="getStatusColor(item.status)">
                    {{ getStatusLabel(item.status) }}
                  </v-chip>
                </template>

                <template #item.start_date="{ item }">
                  {{ formatDate(item.start_date) }}
                </template>

                <template #item.end_date="{ item }">
                  {{ formatDate(item.end_date) }}
                </template>

                <template #item.total_budget="{ item }">
                  {{ formatCurrency(item.total_budget) }}
                </template>

                <template #item.progress="{ item }">
                  <div class="d-flex align-center">
                    <v-progress-linear
                      :model-value="item.progress"
                      height="8"
                      rounded
                      :color="getProgressColor(item.progress)"
                      class="me-2"
                      style="min-width: 80px;"
                    />
                    <span class="text-caption">{{ item.progress }}%</span>
                  </div>
                </template>

                <template #item.actions="{ item }">
                  <v-btn
                    icon="mdi-eye"
                    size="small"
                    variant="text"
                    @click.stop="viewPlan(item)"
                  />
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click.stop="editPlan(item)"
                  />
                  <v-btn
                    icon="mdi-play"
                    size="small"
                    variant="text"
                    color="primary"
                    @click.stop="executePlan(item)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click.stop="deletePlan(item)"
                  />
                </template>
              </v-data-table>
            </div>

            <!-- Карточки планов -->
            <div v-else>
              <v-row>
                <v-col
                  v-for="plan in filteredMediaPlans"
                  :key="plan.plan_id"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <v-card @click="viewPlan(plan)">
                    <v-card-text>
                      <div class="d-flex justify-space-between align-start mb-3">
                        <div>
                          <h4 class="text-subtitle-1 mb-1">{{ plan.name }}</h4>
                          <p class="text-caption text-grey">{{ plan.description }}</p>
                        </div>
                        <v-chip size="small" :color="getStatusColor(plan.status)">
                          {{ getStatusLabel(plan.status) }}
                        </v-chip>
                      </div>

                      <v-divider class="mb-3" />

                      <div class="mb-3">
                        <div class="d-flex justify-space-between align-center mb-1">
                          <span class="text-body-2">Прогресс</span>
                          <span class="text-body-2 font-weight-medium">{{ plan.progress }}%</span>
                        </div>
                        <v-progress-linear
                          :model-value="plan.progress"
                          :color="getProgressColor(plan.progress)"
                          height="6"
                          rounded
                        />
                      </div>

                      <div class="d-flex justify-space-between align-center mb-2">
                        <span class="text-body-2">Бюджет:</span>
                        <span class="font-weight-medium">{{ formatCurrency(plan.total_budget) }}</span>
                      </div>

                      <div class="d-flex justify-space-between align-center mb-2">
                        <span class="text-body-2">Период:</span>
                        <span class="text-body-2">{{ formatDate(plan.start_date) }} - {{ formatDate(plan.end_date) }}</span>
                      </div>

                      <div class="d-flex flex-wrap gap-2 mt-3">
                        <v-chip
                          v-for="channel in plan.channels"
                          :key="channel"
                          size="x-small"
                          :color="getChannelColor(channel)"
                          variant="tonal"
                        >
                          {{ channel }}
                        </v-chip>
                      </div>
                    </v-card-text>

                    <v-card-actions>
                      <v-btn
                        icon="mdi-eye"
                        size="small"
                        variant="text"
                        @click.stop="viewPlan(plan)"
                      />
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        variant="text"
                        @click.stop="editPlan(plan)"
                      />
                      <v-spacer />
                      <v-btn
                        icon="mdi-play"
                        size="small"
                        variant="text"
                        color="primary"
                        @click.stop="executePlan(plan)"
                      />
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <div v-if="filteredMediaPlans.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2">mdi-calendar-clock</v-icon>
              <h3 class="text-h6 mt-2">Медиа-планы не найдены</h3>
              <p class="text-grey">Создайте новый медиа-план для планирования размещений</p>
            </div>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- Календарь -->
      <v-tabs-window-item value="calendar">
        <MediaPlanCalendar :mediaplans="mediaPlanStore.mediaPlans" />
      </v-tabs-window-item>

      <!-- Аналитика -->
      <v-tabs-window-item value="analytics">
        <MediaPlanAnalytics :mediaplans="mediaPlanStore.mediaPlans" />
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Диалог создания/редактирования медиа-плана -->
    <MediaPlanEditDialog
      v-model="showCreateDialog"
      :mediaPlan="editingMediaPlan"
      @saved="handleMediaPlanSaved"
    />

    <!-- Диалог просмотра медиа-плана -->
    <MediaPlanViewDialog
      v-model="showViewDialog"
      :mediaPlan="selectedMediaPlan"
    />

    <!-- Диалог выполнения медиа-плана -->
    <MediaPlanExecuteDialog
      v-model="showExecuteDialog"
      :mediaPlan="executingMediaPlan"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMediaPlanStore } from '@/stores/mediaPlanStore'
import MediaPlanEditDialog from './MediaPlanEditDialog.vue'
import MediaPlanViewDialog from './MediaPlanViewDialog.vue'
import MediaPlanExecuteDialog from './MediaPlanExecuteDialog.vue'
import MediaPlanCalendar from './MediaPlanCalendar.vue'
import MediaPlanAnalytics from './MediaPlanAnalytics.vue'

const mediaPlanStore = useMediaPlanStore()

const activeTab = ref('list')
const searchQuery = ref('')
const filterStatus = ref(null)
const filterChannel = ref(null)
const viewMode = ref('list')
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const showExecuteDialog = ref(false)
const editingMediaPlan = ref(null)
const selectedMediaPlan = ref(null)
const executingMediaPlan = ref(null)
const loading = ref(false)

const headers = [
  { title: 'Название', value: 'name', width: '25%' },
  { title: 'Статус', value: 'status', width: '12%' },
  { title: 'Начало', value: 'start_date', width: '12%' },
  { title: 'Конец', value: 'end_date', width: '12%' },
  { title: 'Бюджет', value: 'total_budget', width: '12%' },
  { title: 'Прогресс', value: 'progress', width: '15%' },
  { title: 'Действия', value: 'actions', width: '12%', sortable: false }
]

const statusOptions = [
  { title: 'Черновик', value: 'draft' },
  { title: 'Активный', value: 'active' },
  { title: 'Приостановлен', value: 'paused' },
  { title: 'Завершен', value: 'completed' },
  { title: 'Отменен', value: 'cancelled' }
]

const channels = computed(() =>
  [...new Set(mediaPlanStore.mediaPlans.flatMap(plan => plan.channels))]
)

const filteredMediaPlans = computed(() => {
  let plans = mediaPlanStore.mediaPlans

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    plans = plans.filter(plan =>
      plan.name.toLowerCase().includes(query) ||
      plan.description.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value) {
    plans = plans.filter(plan => plan.status === filterStatus.value)
  }

  if (filterChannel.value) {
    plans = plans.filter(plan => plan.channels.includes(filterChannel.value))
  }

  return plans.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
})

const getStatusColor = (status) => {
  const colors = {
    draft: 'grey',
    active: 'success',
    paused: 'warning',
    completed: 'info',
    cancelled: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    draft: 'Черновик',
    active: 'Активный',
    paused: 'Приостановлен',
    completed: 'Завершен',
    cancelled: 'Отменен'
  }
  return labels[status] || status
}

const getProgressColor = (progress) => {
  if (progress >= 80) return 'success'
  if (progress >= 50) return 'warning'
  return 'primary'
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

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'cards' : 'list'
}

const viewPlan = (plan) => {
  selectedMediaPlan.value = plan
  showViewDialog.value = true
}

const editPlan = (plan) => {
  editingMediaPlan.value = plan
  showCreateDialog.value = true
}

const executePlan = (plan) => {
  executingMediaPlan.value = plan
  showExecuteDialog.value = true
}

const deletePlan = async (plan) => {
  if (confirm(`Удалить медиа-план "${plan.name}"?`)) {
    await mediaPlanStore.deleteMediaPlan(plan.plan_id)
  }
}

const handleMediaPlanSaved = () => {
  showCreateDialog.value = false
  editingMediaPlan.value = null
}

onMounted(async () => {
  loading.value = true
  await mediaPlanStore.fetchMediaPlans()
  loading.value = false
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>