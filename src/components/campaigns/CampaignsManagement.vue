<template>
  <div class="campaigns-management">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-bullhorn</v-icon>
        Управление кампаниями
        <v-spacer />
        <div class="d-flex align-center ga-2">
          <v-btn
            color="success"
            prepend-icon="mdi-plus"
            @click="openCreateDialog"
          >
            Новая кампания
          </v-btn>
          <v-btn
            color="info"
            prepend-icon="mdi-import"
            variant="outlined"
            @click="importDialog = true"
          >
            Импорт
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <!-- Статистика кампаний -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-primary">{{ totalCampaigns }}</div>
                <div class="text-caption">Всего кампаний</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-success">{{ activeCampaigns }}</div>
                <div class="text-caption">Активных</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-info">{{ formatBudget(totalBudget) }}</div>
                <div class="text-caption">Общий бюджет</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-warning">{{ formatBudget(spentBudget) }}</div>
                <div class="text-caption">Потрачено</div>
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
              label="Поиск кампаний"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              label="Статус"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedProduct"
              :items="productOptions"
              label="Продукт"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedGeography"
              :items="geographyOptions"
              label="География"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedHierarchy"
              :items="hierarchyOptions"
              label="Уровень"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="1">
            <v-btn
              icon="mdi-tune"
              variant="outlined"
              @click="advancedFilters = !advancedFilters"
            />
          </v-col>
        </v-row>

        <!-- Расширенные фильтры -->
        <v-expand-transition>
          <v-card v-if="advancedFilters" variant="outlined" class="mb-4">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="budgetRange.min"
                    label="Мин. бюджет"
                    type="number"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="budgetRange.max"
                    label="Макс. бюджет"
                    type="number"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="dateRange.start"
                    label="Дата начала"
                    type="date"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="dateRange.end"
                    label="Дата окончания"
                    type="date"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Иерархическое представление -->
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="d-flex align-center ga-2">
              <v-switch
                v-model="showHierarchy"
                label="Иерархическое представление"
                density="compact"
              />
              <v-spacer />
              <v-btn-toggle v-model="viewMode" density="compact">
                <v-btn icon="mdi-view-list" value="list" />
                <v-btn icon="mdi-view-grid" value="cards" />
                <v-btn icon="mdi-chart-gantt" value="timeline" />
              </v-btn-toggle>
            </div>
          </v-col>
        </v-row>

        <!-- Иерархическое дерево -->
        <template v-if="showHierarchy">
          <v-treeview
            :items="campaignTree"
            item-key="id"
            item-title="name"
            :open-all="true"
          >
            <template v-slot:prepend="{ item }">
              <v-icon :color="getHierarchyColor(item.hierarchy_level)">
                {{ getHierarchyIcon(item.hierarchy_level) }}
              </v-icon>
            </template>

            <template v-slot:append="{ item }">
              <div class="d-flex align-center ga-2">
                <v-chip
                  size="x-small"
                  :color="getStatusColor(item.status)"
                >
                  {{ getStatusText(item.status) }}
                </v-chip>
                <v-chip
                  size="x-small"
                  color="info"
                  variant="outlined"
                >
                  {{ formatBudget(item.budget) }}
                </v-chip>
                <v-btn
                  icon="mdi-eye"
                  size="x-small"
                  variant="text"
                  @click="viewCampaign(item)"
                />
                <v-btn
                  icon="mdi-pencil"
                  size="x-small"
                  variant="text"
                  @click="editCampaign(item)"
                />
              </div>
            </template>
          </v-treeview>
        </template>

        <!-- Представление списком -->
        <template v-else-if="viewMode === 'list'">
          <v-data-table
            :headers="headers"
            :items="filteredCampaigns"
            :loading="loading"
            item-key="campaign_id"
            @click:row="viewCampaign"
          >
            <template v-slot:item.hierarchy_level="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  class="mr-2"
                  :color="getHierarchyColor(item.hierarchy_level)"
                >
                  {{ getHierarchyIcon(item.hierarchy_level) }}
                </v-icon>
                {{ item.hierarchy_level }}
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

            <template v-slot:item.budget="{ item }">
              {{ formatBudget(item.budget) }}
            </template>

            <template v-slot:item.progress="{ item }">
              <div class="d-flex align-center ga-2">
                <v-progress-linear
                  :model-value="calculateProgress(item)"
                  :color="getProgressColor(calculateProgress(item))"
                  height="6"
                  rounded
                  style="min-width: 100px"
                />
                <span class="text-caption">{{ calculateProgress(item) }}%</span>
              </div>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                @click.stop="viewCampaign(item)"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click.stop="editCampaign(item)"
              />
              <v-btn
                icon="mdi-content-copy"
                size="small"
                variant="text"
                color="info"
                @click.stop="duplicateCampaign(item)"
              />
            </template>
          </v-data-table>
        </template>

        <!-- Представление карточками -->
        <template v-else-if="viewMode === 'cards'">
          <v-row>
            <v-col
              v-for="campaign in filteredCampaigns"
              :key="campaign.campaign_id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card @click="viewCampaign(campaign)">
                <v-card-title class="d-flex align-center">
                  <v-icon
                    class="mr-2"
                    :color="getHierarchyColor(campaign.hierarchy_level)"
                  >
                    {{ getHierarchyIcon(campaign.hierarchy_level) }}
                  </v-icon>
                  <span class="text-truncate">{{ campaign.name }}</span>
                  <v-spacer />
                  <v-chip
                    :color="getStatusColor(campaign.status)"
                    size="small"
                  >
                    {{ getStatusText(campaign.status) }}
                  </v-chip>
                </v-card-title>

                <v-card-text>
                  <div class="text-body-2 mb-2">{{ campaign.description }}</div>
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-caption">Бюджет:</span>
                    <span class="font-weight-bold">{{ formatBudget(campaign.budget) }}</span>
                  </div>
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-caption">Прогресс:</span>
                    <span>{{ calculateProgress(campaign) }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="calculateProgress(campaign)"
                    :color="getProgressColor(calculateProgress(campaign))"
                    height="6"
                    rounded
                  />
                </v-card-text>

                <v-card-actions>
                  <v-btn
                    size="small"
                    @click.stop="editCampaign(campaign)"
                  >
                    Редактировать
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    icon="mdi-content-copy"
                    size="small"
                    variant="text"
                    @click.stop="duplicateCampaign(campaign)"
                  />
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-card-text>
    </v-card>

    <!-- Диалог создания/редактирования кампании -->
    <v-dialog v-model="dialog" max-width="900px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ editingCampaign ? 'Редактирование кампании' : 'Новая кампания' }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Название кампании"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.hierarchy_level"
                  :items="hierarchyOptions"
                  label="Уровень иерархии"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Описание"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.product_id"
                  :items="productOptions"
                  item-title="name"
                  item-value="product_id"
                  label="Продукт"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.geography_id"
                  :items="geographyOptions"
                  item-title="name"
                  item-value="geography_id"
                  label="География"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.start_date"
                  label="Дата начала"
                  type="date"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.end_date"
                  label="Дата окончания"
                  type="date"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.budget"
                  label="Бюджет"
                  type="number"
                  variant="outlined"
                  suffix="₽"
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
            @click="saveCampaign"
          >
            {{ editingCampaign ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCampaignsStore } from '@/stores/campaignsStore'
import { useProductsStore } from '@/stores/productsStore'
import { useGeographyStore } from '@/stores/geographyStore'
import { useSnackbar } from '@/composables/useSnackbar'

// Stores
const campaignsStore = useCampaignsStore()
const productsStore = useProductsStore()
const geographyStore = useGeographyStore()
const { showSnackbar } = useSnackbar()

// Reactive data
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedProduct = ref('')
const selectedGeography = ref('')
const selectedHierarchy = ref('')
const advancedFilters = ref(false)
const showHierarchy = ref(false)
const viewMode = ref('list')
const dialog = ref(false)
const importDialog = ref(false)
const formValid = ref(false)
const saving = ref(false)
const editingCampaign = ref(null)
const form = ref(null)

const budgetRange = ref({ min: null, max: null })
const dateRange = ref({ start: '', end: '' })

// Form data
const formData = ref({
  name: '',
  description: '',
  hierarchy_level: '',
  product_id: '',
  geography_id: '',
  start_date: '',
  end_date: '',
  budget: null,
  status: 'draft'
})

// Computed
const loading = computed(() => campaignsStore.loading)
const campaigns = computed(() => campaignsStore.campaigns)
const campaignTree = computed(() => campaignsStore.campaignTree)
const productOptions = computed(() => productsStore.products)
const geographyOptions = computed(() => geographyStore.geographies)

const filteredCampaigns = computed(() => {
  let filtered = campaigns.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(campaign =>
      campaign.name.toLowerCase().includes(query) ||
      campaign.description.toLowerCase().includes(query)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(campaign => campaign.status === selectedStatus.value)
  }

  if (selectedProduct.value) {
    filtered = filtered.filter(campaign => campaign.product_id === selectedProduct.value)
  }

  if (selectedGeography.value) {
    filtered = filtered.filter(campaign => campaign.geography_id === selectedGeography.value)
  }

  if (selectedHierarchy.value) {
    filtered = filtered.filter(campaign => campaign.hierarchy_level === selectedHierarchy.value)
  }

  if (budgetRange.value.min) {
    filtered = filtered.filter(campaign => campaign.budget >= budgetRange.value.min)
  }

  if (budgetRange.value.max) {
    filtered = filtered.filter(campaign => campaign.budget <= budgetRange.value.max)
  }

  return filtered
})

const totalCampaigns = computed(() => campaigns.value.length)
const activeCampaigns = computed(() => campaigns.value.filter(c => c.status === 'active').length)
const totalBudget = computed(() => campaigns.value.reduce((sum, c) => sum + (c.budget || 0), 0))
const spentBudget = computed(() => campaigns.value.reduce((sum, c) => sum + (c.spent || 0), 0))

// Data options
const headers = [
  { title: 'Название', key: 'name' },
  { title: 'Уровень', key: 'hierarchy_level' },
  { title: 'Статус', key: 'status' },
  { title: 'Бюджет', key: 'budget' },
  { title: 'Прогресс', key: 'progress' },
  { title: 'Действия', key: 'actions', sortable: false }
]

const statusOptions = [
  { title: 'Черновик', value: 'draft' },
  { title: 'Активная', value: 'active' },
  { title: 'Приостановлена', value: 'paused' },
  { title: 'Завершена', value: 'completed' },
  { title: 'Отменена', value: 'cancelled' }
]

const hierarchyOptions = [
  { title: 'Программа', value: 'Program' },
  { title: 'Кампания', value: 'Campaign' },
  { title: 'Флайт', value: 'Flight' },
  { title: 'Тактика', value: 'Tactic' },
  { title: 'Размещение', value: 'Placement' }
]

// Validation rules
const rules = {
  required: value => !!value || 'Поле обязательно для заполнения'
}

// Methods
const openCreateDialog = () => {
  editingCampaign.value = null
  formData.value = {
    name: '',
    description: '',
    hierarchy_level: 'Campaign',
    product_id: '',
    geography_id: '',
    start_date: '',
    end_date: '',
    budget: null,
    status: 'draft'
  }
  dialog.value = true
}

const editCampaign = (campaign) => {
  editingCampaign.value = campaign
  formData.value = { ...campaign }
  dialog.value = true
}

const viewCampaign = (campaign) => {
  // Navigate to campaign details view
  console.log('View campaign:', campaign)
}

const duplicateCampaign = (campaign) => {
  editingCampaign.value = null
  formData.value = {
    ...campaign,
    name: `${campaign.name} (копия)`,
    campaign_id: undefined,
    status: 'draft'
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editingCampaign.value = null
  if (form.value) {
    form.value.reset()
  }
}

const saveCampaign = async () => {
  if (!formValid.value) return

  saving.value = true
  try {
    if (editingCampaign.value) {
      await campaignsStore.updateCampaign(editingCampaign.value.campaign_id, formData.value)
      showSnackbar('Кампания успешно обновлена', 'success')
    } else {
      await campaignsStore.createCampaign(formData.value)
      showSnackbar('Кампания успешно создана', 'success')
    }
    closeDialog()
  } catch (error) {
    showSnackbar('Ошибка при сохранении кампании', 'error')
  } finally {
    saving.value = false
  }
}

const getHierarchyIcon = (level) => {
  const icons = {
    Program: 'mdi-folder-multiple',
    Campaign: 'mdi-bullhorn',
    Flight: 'mdi-airplane',
    Tactic: 'mdi-strategy',
    Placement: 'mdi-web'
  }
  return icons[level] || 'mdi-circle'
}

const getHierarchyColor = (level) => {
  const colors = {
    Program: 'purple',
    Campaign: 'primary',
    Flight: 'blue',
    Tactic: 'green',
    Placement: 'orange'
  }
  return colors[level] || 'grey'
}

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

const getStatusText = (status) => {
  const texts = {
    draft: 'Черновик',
    active: 'Активная',
    paused: 'Приостановлена',
    completed: 'Завершена',
    cancelled: 'Отменена'
  }
  return texts[status] || status
}

const getProgressColor = (progress) => {
  if (progress >= 80) return 'success'
  if (progress >= 50) return 'warning'
  return 'error'
}

const calculateProgress = (campaign) => {
  if (!campaign.budget || campaign.budget === 0) return 0
  return Math.round((campaign.spent || 0) / campaign.budget * 100)
}

const formatBudget = (amount) => {
  if (!amount) return '0 ₽'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    campaignsStore.fetchCampaigns(),
    productsStore.fetchProducts(),
    geographyStore.fetchGeographies()
  ])
})
</script>

<style scoped>
.campaigns-management {
  height: 100%;
}

:deep(.v-data-table tbody tr) {
  cursor: pointer;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.v-treeview-item) {
  cursor: pointer;
}

:deep(.v-card) {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}
</style>