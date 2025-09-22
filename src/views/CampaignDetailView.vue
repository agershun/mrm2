<template>
  <div class="campaign-detail">
    <!-- Breadcrumbs -->
    <v-breadcrumbs
      :items="breadcrumbs"
      class="px-0 py-2"
    >
      <template #prepend>
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          size="small"
          @click="$router.go(-1)"
        />
      </template>
    </v-breadcrumbs>

    <!-- Campaign Header -->
    <v-card class="mb-6">
      <v-card-text class="pa-6">
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" :size="40" />
          <div class="mt-2 text-body-2">Загрузка кампании...</div>
        </div>

        <div v-else-if="campaign">
          <div class="d-flex align-center mb-4">
            <v-avatar :color="getChannelColor(campaign.channel)" class="me-3">
              <v-icon color="white">{{ getChannelIcon(campaign.channel) }}</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <h1 class="text-h4 mb-2">{{ campaign.name }}</h1>
              <div class="d-flex align-center gap-3">
                <v-chip
                  :color="getStatusColor(campaign.status)"
                  size="small"
                  variant="flat"
                >
                  <v-icon :icon="getStatusIcon(campaign.status)" size="16" class="me-1" />
                  {{ getStatusText(campaign.status) }}
                </v-chip>
                <v-chip
                  :color="getPhaseColor(campaign.phase)"
                  size="small"
                  variant="tonal"
                >
                  {{ getPhaseText(campaign.phase) }}
                </v-chip>
                <span class="text-body-2 text-medium-emphasis">
                  ID: {{ campaign.campaign_id }}
                </span>
              </div>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-pencil"
                @click="editCampaign"
              >
                Редактировать
              </v-btn>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    v-bind="props"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item @click="duplicateCampaign">
                    <v-list-item-title>
                      <v-icon class="me-2" size="16">mdi-content-copy</v-icon>
                      Дублировать
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="toggleStatus">
                    <v-list-item-title>
                      <v-icon class="me-2" size="16">
                        {{ campaign.status === 'active' ? 'mdi-pause' : 'mdi-play' }}
                      </v-icon>
                      {{ campaign.status === 'active' ? 'Приостановить' : 'Запустить' }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="deleteCampaign" class="text-error">
                    <v-list-item-title>
                      <v-icon class="me-2" size="16">mdi-delete</v-icon>
                      Удалить
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- Campaign Stats -->
          <v-row>
            <v-col cols="12" md="3">
              <v-card variant="outlined" class="pa-3 text-center">
                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(campaign.budget_value) }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ getBudgetTypeText(campaign.budget_type) }}
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="3">
              <v-card variant="outlined" class="pa-3 text-center">
                <div class="text-h5 font-weight-bold primary--text">
                  {{ adGroups.length }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Групп объявлений
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="3">
              <v-card variant="outlined" class="pa-3 text-center">
                <div class="text-h5 font-weight-bold success--text">
                  {{ totalCreatives }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Креативов
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="3">
              <v-card variant="outlined" class="pa-3 text-center">
                <div class="text-h5 font-weight-bold">
                  {{ formatDate(campaign.start_date) }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Дата запуска
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs Navigation -->
    <v-tabs v-model="activeTab" class="mb-4">
      <v-tab value="structure">Структура</v-tab>
      <v-tab value="performance">Производительность</v-tab>
      <v-tab value="settings">Настройки</v-tab>
      <v-tab value="history">История</v-tab>
    </v-tabs>

    <!-- Tab Content -->
    <v-window v-model="activeTab">
      <!-- Structure Tab -->
      <v-window-item value="structure">
        <CampaignStructure
          :campaign="campaign"
          :ad-groups="adGroups"
          :loading="structureLoading"
          @create-ad-group="createAdGroup"
          @edit-ad-group="editAdGroup"
          @delete-ad-group="deleteAdGroup"
          @view-creatives="viewCreatives"
        />
      </v-window-item>

      <!-- Performance Tab -->
      <v-window-item value="performance">
        <CampaignPerformance
          :campaign="campaign"
          :performance-data="performanceData"
          :loading="performanceLoading"
        />
      </v-window-item>

      <!-- Settings Tab -->
      <v-window-item value="settings">
        <CampaignSettings
          :campaign="campaign"
          @update="updateCampaign"
        />
      </v-window-item>

      <!-- History Tab -->
      <v-window-item value="history">
        <CampaignHistory
          :campaign="campaign"
          :history="campaignHistory"
          :loading="historyLoading"
        />
      </v-window-item>
    </v-window>

    <!-- Dialogs -->
    <AdGroupCreateDialog
      v-model="showAdGroupDialog"
      :campaign="campaign"
      :ad-group="selectedAdGroup"
      @save="saveAdGroup"
    />

    <CreativesDialog
      v-model="showCreativesDialog"
      :ad-group="selectedAdGroup"
      :creatives="adGroupCreatives"
      @create="createCreative"
      @edit="editCreative"
      @delete="deleteCreative"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCampaignsStore } from '@/stores/campaignsStore'
import CampaignStructure from '@/components/campaigns/CampaignStructure.vue'
import CampaignPerformance from '@/components/campaigns/CampaignPerformance.vue'
import CampaignSettings from '@/components/campaigns/CampaignSettings.vue'
import CampaignHistory from '@/components/campaigns/CampaignHistory.vue'
import AdGroupCreateDialog from '@/components/campaigns/AdGroupCreateDialog.vue'
import CreativesDialog from '@/components/campaigns/CreativesDialog.vue'

const route = useRoute()
const router = useRouter()
const campaignsStore = useCampaignsStore()

// Reactive state
const loading = ref(true)
const structureLoading = ref(false)
const performanceLoading = ref(false)
const historyLoading = ref(false)
const activeTab = ref('structure')
const showAdGroupDialog = ref(false)
const showCreativesDialog = ref(false)
const selectedAdGroup = ref(null)

// Computed
const campaign = computed(() => campaignsStore.currentCampaign)
const adGroups = computed(() => campaignsStore.currentAdGroups)
const adGroupCreatives = computed(() => campaignsStore.currentCreatives)
const performanceData = computed(() => campaignsStore.currentPerformanceData)
const campaignHistory = computed(() => campaignsStore.currentCampaignHistory)

const totalCreatives = computed(() => {
  return adGroups.value.reduce((total, group) => {
    return total + (group.creatives_count || 0)
  }, 0)
})

const breadcrumbs = computed(() => [
  { title: 'Кампании', to: '/campaigns' },
  { title: campaign.value?.name || 'Загрузка...', disabled: true }
])

// Methods
const loadCampaign = async () => {
  loading.value = true
  try {
    await campaignsStore.loadCampaignDetails(route.params.id)
  } catch (error) {
    console.error('Error loading campaign:', error)
  } finally {
    loading.value = false
  }
}

const loadStructure = async () => {
  structureLoading.value = true
  try {
    await campaignsStore.loadAdGroups(route.params.id)
  } catch (error) {
    console.error('Error loading ad groups:', error)
  } finally {
    structureLoading.value = false
  }
}

const editCampaign = () => {
  router.push(`/campaigns/${campaign.value.campaign_id}/edit`)
}

const duplicateCampaign = async () => {
  try {
    await campaignsStore.duplicateCampaign(campaign.value.campaign_id)
  } catch (error) {
    console.error('Error duplicating campaign:', error)
  }
}

const toggleStatus = async () => {
  const newStatus = campaign.value.status === 'active' ? 'paused' : 'active'
  try {
    await campaignsStore.updateCampaign(campaign.value.campaign_id, { status: newStatus })
  } catch (error) {
    console.error('Error updating campaign status:', error)
  }
}

const deleteCampaign = async () => {
  if (confirm('Вы уверены, что хотите удалить эту кампанию?')) {
    try {
      await campaignsStore.deleteCampaign(campaign.value.campaign_id)
      router.push('/campaigns')
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }
}

const createAdGroup = () => {
  selectedAdGroup.value = null
  showAdGroupDialog.value = true
}

const editAdGroup = (adGroup) => {
  selectedAdGroup.value = adGroup
  showAdGroupDialog.value = true
}

const deleteAdGroup = async (adGroupId) => {
  if (confirm('Вы уверены, что хотите удалить эту группу объявлений?')) {
    try {
      await campaignsStore.deleteAdGroup(adGroupId)
      await loadStructure()
    } catch (error) {
      console.error('Error deleting ad group:', error)
    }
  }
}

const saveAdGroup = async (adGroupData) => {
  try {
    if (selectedAdGroup.value) {
      await campaignsStore.updateAdGroup(selectedAdGroup.value.ad_group_id, adGroupData)
    } else {
      await campaignsStore.createAdGroup({ ...adGroupData, campaign_id: campaign.value.campaign_id })
    }
    await loadStructure()
    showAdGroupDialog.value = false
  } catch (error) {
    console.error('Error saving ad group:', error)
  }
}

const viewCreatives = async (adGroup) => {
  selectedAdGroup.value = adGroup
  try {
    await campaignsStore.loadCreatives(adGroup.ad_group_id)
    showCreativesDialog.value = true
  } catch (error) {
    console.error('Error loading creatives:', error)
  }
}

const createCreative = () => {
  // Navigate to creative creation
  router.push(`/campaigns/${campaign.value.campaign_id}/ad-groups/${selectedAdGroup.value.ad_group_id}/creatives/new`)
}

const editCreative = (creative) => {
  router.push(`/campaigns/${campaign.value.campaign_id}/ad-groups/${selectedAdGroup.value.ad_group_id}/creatives/${creative.creative_id}/edit`)
}

const deleteCreative = async (creativeId) => {
  if (confirm('Вы уверены, что хотите удалить этот креатив?')) {
    try {
      await campaignsStore.deleteCreative(creativeId)
      await campaignsStore.loadCreatives(selectedAdGroup.value.ad_group_id)
    } catch (error) {
      console.error('Error deleting creative:', error)
    }
  }
}

const updateCampaign = async (updates) => {
  try {
    await campaignsStore.updateCampaign(campaign.value.campaign_id, updates)
  } catch (error) {
    console.error('Error updating campaign:', error)
  }
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const getChannelColor = (channel) => {
  const colors = {
    meta: 'blue',
    google: 'green',
    yandex: 'red',
    tiktok: 'pink',
    vk: 'indigo'
  }
  return colors[channel] || 'grey'
}

const getChannelIcon = (channel) => {
  const icons = {
    meta: 'mdi-facebook',
    google: 'mdi-google',
    yandex: 'mdi-yandex',
    tiktok: 'mdi-music-note',
    vk: 'mdi-vk'
  }
  return icons[channel] || 'mdi-web'
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

const getStatusIcon = (status) => {
  const icons = {
    active: 'mdi-play',
    paused: 'mdi-pause',
    draft: 'mdi-file-document-outline',
    completed: 'mdi-check',
    archived: 'mdi-archive'
  }
  return icons[status] || 'mdi-help'
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

const getPhaseColor = (phase) => {
  const colors = {
    pre_launch: 'grey',
    ab_testing: 'orange',
    active_launch: 'success',
    optimization: 'info',
    retargeting: 'purple',
    wrap_up: 'warning',
    post_analysis: 'secondary'
  }
  return colors[phase] || 'grey'
}

const getPhaseText = (phase) => {
  const texts = {
    pre_launch: 'Подготовка',
    ab_testing: 'A/B тест',
    active_launch: 'Запуск',
    optimization: 'Оптимизация',
    retargeting: 'Ретаргетинг',
    wrap_up: 'Завершение',
    post_analysis: 'Анализ'
  }
  return texts[phase] || phase
}

const getBudgetTypeText = (budgetType) => {
  const texts = {
    daily: 'В день',
    lifetime: 'За период',
    unlimited: 'Без ограничений'
  }
  return texts[budgetType] || budgetType
}

// Lifecycle
onMounted(async () => {
  await loadCampaign()
  await loadStructure()
})

watch(activeTab, (newTab) => {
  if (newTab === 'performance' && !performanceData.value) {
    performanceLoading.value = true
    campaignsStore.loadPerformanceData(route.params.id).finally(() => {
      performanceLoading.value = false
    })
  } else if (newTab === 'history' && !campaignHistory.value) {
    historyLoading.value = true
    campaignsStore.loadCampaignHistory(route.params.id).finally(() => {
      historyLoading.value = false
    })
  }
})
</script>

<style scoped>
.campaign-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
</style>