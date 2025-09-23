<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Основная область -->
      <v-col cols="12">
        <!-- Заголовок и управление -->
        <div class="campaigns-header pa-4 border-b">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold mb-1">Рекламные кампании</h1>
              <p class="text-body-2 text-medium-emphasis">
                Управление рекламными кампаниями, группами объявлений и креативами
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                prepend-icon="mdi-plus"
                color="primary"
                @click="showCreateCampaignDialog = true"
              >
                Создать кампанию
              </v-btn>
              <v-btn
                prepend-icon="mdi-chart-line"
                variant="outlined"
                @click="showAnalyticsDialog = true"
              >
                Аналитика
              </v-btn>
              <v-btn
                prepend-icon="mdi-cog"
                variant="outlined"
                @click="showSettingsDialog = true"
              >
                Настройки
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Статистика -->
        <CampaignStatsBar
          :stats="campaignsStats"
          :loading="loading.stats"
          class="ma-4"
        />

        <!-- Фильтры и поиск -->
        <CampaignFilters
          v-model:filters="filters"
          v-model:search="searchQuery"
          :channels="availableChannels"
          :managers="availableManagers"
          :product-lines="availableProductLines"
          @search="handleSearch"
          @clear-filters="handleClearFilters"
          class="ma-4"
        />

        <!-- Список кампаний -->
        <div class="campaigns-content pa-4">
          <!-- Режимы просмотра -->
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center gap-2">
              <v-btn-toggle
                v-model="viewMode"
                mandatory
                variant="outlined"
                density="compact"
              >
                <v-btn value="list" icon="mdi-view-list" />
                <v-btn value="cards" icon="mdi-view-grid" />
                <v-btn value="hierarchy" icon="mdi-file-tree" />
              </v-btn-toggle>

              <v-select
                v-model="groupBy"
                :items="groupByOptions"
                label="Группировать по"
                variant="outlined"
                density="compact"
                style="max-width: 200px"
                clearable
              />
            </div>

            <div class="d-flex align-center gap-2">
              <v-select
                v-model="sortBy"
                :items="sortByOptions"
                label="Сортировка"
                variant="outlined"
                density="compact"
                style="max-width: 150px"
              />

              <v-btn
                :icon="sortOrder === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                variant="outlined"
                density="compact"
                @click="toggleSortOrder"
              />

              <v-btn
                prepend-icon="mdi-refresh"
                variant="outlined"
                density="compact"
                @click="refreshData"
                :loading="loading.campaigns"
              >
                Обновить
              </v-btn>
            </div>
          </div>

          <!-- Компоненты отображения -->
          <CampaignsList
            v-if="viewMode === 'list'"
            :campaigns="filteredCampaigns"
            :loading="loading.campaigns"
            :selected="selectedCampaigns"
            @select="handleCampaignSelect"
            @edit="handleCampaignEdit"
            @duplicate="handleCampaignDuplicate"
            @delete="handleCampaignDelete"
            @view-details="handleViewDetails"
            @open-workspace="handleOpenWorkspace"
          />

          <CampaignsCards
            v-else-if="viewMode === 'cards'"
            :campaigns="filteredCampaigns"
            :loading="loading.campaigns"
            :group-by="groupBy"
            @select="handleCampaignSelect"
            @edit="handleCampaignEdit"
            @duplicate="handleCampaignDuplicate"
            @delete="handleCampaignDelete"
            @view-details="handleViewDetails"
            @open-workspace="handleOpenWorkspace"
          />

          <CampaignsHierarchy
            v-else-if="viewMode === 'hierarchy'"
            :campaigns="filteredCampaigns"
            :loading="loading.campaigns"
            @select="handleCampaignSelect"
            @edit="handleCampaignEdit"
            @view-details="handleViewDetails"
            @open-workspace="handleOpenWorkspace"
          />
        </div>
      </v-col>
    </v-row>

    <!-- Диалоги -->
    <CampaignCreateDialog
      v-model="showCreateCampaignDialog"
      @created="handleCampaignCreated"
    />

    <CampaignEditDialog
      v-model="showEditCampaignDialog"
      :campaign="editingCampaign"
      @updated="handleCampaignUpdated"
    />

    <CampaignDetailsDialog
      v-model="showDetailsDialog"
      :campaign="detailsCampaign"
    />

    <CampaignAnalyticsDialog
      v-model="showAnalyticsDialog"
      :campaigns="selectedCampaigns.length ? selectedCampaigns : filteredCampaigns"
    />

    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Удаление кампании"
      :text="`Вы уверены, что хотите удалить кампанию &quot;${deletingCampaign?.name}&quot;?`"
      @confirm="confirmDelete"
    />

    <!-- Snackbar для уведомлений -->
    <v-snackbar
      v-model="showNotification"
      :color="notificationColor"
      :timeout="4000"
      top
    >
      {{ notificationText }}
      <template #actions>
        <v-btn
          color="white"
          variant="text"
          @click="showNotification = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignsExtendedStore } from '@/stores/campaignsExtendedStore'
import { useChannelsStore } from '@/stores/channelsStore'

// Компоненты
import CampaignStatsBar from '@/components/campaigns/CampaignStatsBar.vue'
import CampaignFilters from '@/components/campaigns/CampaignFilters.vue'
import CampaignsList from '@/components/campaigns/CampaignsList.vue'
import CampaignsCards from '@/components/campaigns/CampaignsCards.vue'
import CampaignsHierarchy from '@/components/campaigns/CampaignsHierarchy.vue'
import CampaignCreateDialog from '@/components/campaigns/CampaignCreateDialog.vue'
import CampaignEditDialog from '@/components/campaigns/CampaignEditDialog.vue'
import CampaignDetailsDialog from '@/components/campaigns/CampaignDetailsDialog.vue'
import CampaignAnalyticsDialog from '@/components/campaigns/CampaignAnalyticsDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

// Router
const router = useRouter()

// Stores
const campaignsStore = useCampaignsExtendedStore()
const channelsStore = useChannelsStore()

// Реактивные данные
const viewMode = ref('list')
const groupBy = ref(null)
const sortBy = ref('updated_at')
const sortOrder = ref('desc')

const filters = ref({
  status: null,
  channel: null,
  objective: null,
  campaign_category: null,
  phase: null,
  campaign_type: null,
  responsible_manager: null,
  product_line: null,
  date_from: null,
  date_to: null
})

const searchQuery = ref('')
const selectedCampaigns = ref([])

// Диалоги
const showCreateCampaignDialog = ref(false)
const showEditCampaignDialog = ref(false)
const showDetailsDialog = ref(false)
const showAnalyticsDialog = ref(false)
const showSettingsDialog = ref(false)
const showDeleteDialog = ref(false)

const editingCampaign = ref(null)
const detailsCampaign = ref(null)
const deletingCampaign = ref(null)

// Уведомления
const showNotification = ref(false)
const notificationText = ref('')
const notificationColor = ref('success')

// Computed
const campaigns = computed(() => campaignsStore.campaigns)
const loading = computed(() => campaignsStore.loading)
const campaignsStats = computed(() => campaignsStore.campaignsStats)

const filteredCampaigns = computed(() => {
  let result = [...campaigns.value]

  // Применяем фильтры
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value !== null && value !== '') {
      if (key === 'date_from') {
        result = result.filter(campaign => new Date(campaign.start_date) >= new Date(value))
      } else if (key === 'date_to') {
        result = result.filter(campaign => {
          const endDate = campaign.end_date ? new Date(campaign.end_date) : new Date('2099-12-31')
          return endDate <= new Date(value)
        })
      } else {
        result = result.filter(campaign => campaign[key] === value)
      }
    }
  })

  // Применяем поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(campaign =>
      campaign.name.toLowerCase().includes(query) ||
      campaign.campaign_id.toLowerCase().includes(query) ||
      campaign.objective.toLowerCase().includes(query) ||
      campaign.channel.toLowerCase().includes(query) ||
      campaign.product_line?.toLowerCase().includes(query) ||
      campaign.responsible_manager?.toLowerCase().includes(query)
    )
  }

  // Применяем сортировку
  result.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return result
})

const availableChannels = computed(() => {
  const channels = [...new Set(campaigns.value.map(c => c.channel))]
  return channels.map(channel => ({ title: channel, value: channel }))
})

const availableManagers = computed(() => {
  const managers = [...new Set(campaigns.value.map(c => c.responsible_manager).filter(Boolean))]
  return managers.map(manager => ({ title: manager, value: manager }))
})

const availableProductLines = computed(() => {
  const lines = [...new Set(campaigns.value.map(c => c.product_line).filter(Boolean))]
  return lines.map(line => ({ title: line, value: line }))
})

// Опции для элементов управления
const groupByOptions = [
  { title: 'По каналу', value: 'channel' },
  { title: 'По статусу', value: 'status' },
  { title: 'По цели', value: 'objective' },
  { title: 'По фазе', value: 'phase' },
  { title: 'По менеджеру', value: 'responsible_manager' },
  { title: 'По продуктовой линейке', value: 'product_line' }
]

const sortByOptions = [
  { title: 'По дате обновления', value: 'updated_at' },
  { title: 'По дате создания', value: 'created_at' },
  { title: 'По названию', value: 'name' },
  { title: 'По бюджету', value: 'budget_value' },
  { title: 'По дате начала', value: 'start_date' }
]

// Методы
const handleSearch = async (query) => {
  searchQuery.value = query
  if (query) {
    try {
      await campaignsStore.searchCampaigns(query)
    } catch (error) {
      showError('Ошибка поиска кампаний')
    }
  }
}

const handleClearFilters = () => {
  filters.value = {
    status: null,
    channel: null,
    objective: null,
    campaign_category: null,
    phase: null,
    campaign_type: null,
    responsible_manager: null,
    product_line: null,
    date_from: null,
    date_to: null
  }
  searchQuery.value = ''
  campaignsStore.clearSearch()
}

const handleCampaignSelect = (campaign, selected) => {
  if (selected) {
    selectedCampaigns.value.push(campaign)
  } else {
    selectedCampaigns.value = selectedCampaigns.value.filter(c => c.campaign_id !== campaign.campaign_id)
  }
}

const handleCampaignEdit = (campaign) => {
  editingCampaign.value = campaign
  showEditCampaignDialog.value = true
}

const handleCampaignDuplicate = async (campaign) => {
  try {
    const options = {
      name: `${campaign.name} - Копия`,
      includeAdGroups: true,
      includeCreatives: true
    }
    await campaignsStore.duplicateCampaign(campaign.campaign_id, options)
    showSuccess('Кампания успешно скопирована')
  } catch (error) {
    showError('Ошибка копирования кампании')
  }
}

const handleCampaignDelete = (campaign) => {
  deletingCampaign.value = campaign
  showDeleteDialog.value = true
}

const handleViewDetails = (campaign) => {
  detailsCampaign.value = campaign
  showDetailsDialog.value = true
}

const handleOpenWorkspace = (campaign) => {
  router.push(`/campaigns/${campaign.campaign_id}`)
}

const handleCampaignCreated = (campaign) => {
  showSuccess('Кампания успешно создана')
  refreshData()
}

const handleCampaignUpdated = (campaign) => {
  showSuccess('Кампания успешно обновлена')
  refreshData()
}

const confirmDelete = async () => {
  try {
    await campaignsStore.deleteCampaign(deletingCampaign.value.campaign_id)
    showSuccess('Кампания успешно удалена')
    deletingCampaign.value = null
  } catch (error) {
    showError('Ошибка удаления кампании')
  }
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const refreshData = async () => {
  try {
    await Promise.all([
      campaignsStore.loadCampaigns(filters.value),
      campaignsStore.loadCampaignsStats(filters.value)
    ])
  } catch (error) {
    showError('Ошибка загрузки данных')
  }
}

const showSuccess = (message) => {
  notificationText.value = message
  notificationColor.value = 'success'
  showNotification.value = true
}

const showError = (message) => {
  notificationText.value = message
  notificationColor.value = 'error'
  showNotification.value = true
}

// Watchers
watch(filters, async (newFilters) => {
  campaignsStore.setCampaignFilters(newFilters)
  await refreshData()
}, { deep: true })

watch(viewMode, (newMode) => {
  campaignsStore.setViewMode(newMode)
})

watch([sortBy, sortOrder], ([newSortBy, newSortOrder]) => {
  campaignsStore.setSorting(newSortBy, newSortOrder)
})

watch(groupBy, (newGroupBy) => {
  campaignsStore.setGroupBy(newGroupBy)
})

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      campaignsStore.initialize(),
      channelsStore.initialize()
    ])
  } catch (error) {
    showError('Ошибка инициализации')
  }
})
</script>

<style scoped>
.campaigns-header {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.campaigns-content {
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>