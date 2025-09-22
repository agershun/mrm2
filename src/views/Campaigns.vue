<template>
  <div class="campaigns-view">
    <!-- Заголовок -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Кампании</h1>
        <p class="text-body-1 text-medium-emphasis">
          Создание и управление рекламными кампаниями с помощью искусственного интеллекта
        </p>
      </div>
      <v-spacer />

      <div class="d-flex align-center ga-3">
        <!-- Поиск -->
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Поиск кампаний"
          variant="outlined"
          density="compact"
          style="width: 300px"
          clearable
        />

        <!-- Кнопка создания -->
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-plus"
          @click="createCampaign"
        >
          Создать кампанию
        </v-btn>
      </div>
    </div>

    <!-- Фильтры -->
    <v-card class="mb-4">
      <v-card-text class="py-3">
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Статус"
              variant="outlined"
              density="compact"
              clearable
              @update:modelValue="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.category"
              :items="categoryOptions"
              label="Категория"
              variant="outlined"
              density="compact"
              clearable
              @update:modelValue="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.owner"
              :items="ownerOptions"
              label="Ответственный"
              variant="outlined"
              density="compact"
              clearable
              @update:modelValue="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-filter-off"
              @click="clearFilters"
            >
              Сбросить фильтры
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Таблица кампаний -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredCampaigns"
        :loading="isLoading"
        :search="searchQuery"
        class="elevation-0"
        item-value="ai_campaign_id"
        @click:row="openCampaign"
      >
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="flat"
          >
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template #item.campaign_category="{ item }">
          <v-chip
            :color="getCategoryColor(item.campaign_category)"
            size="small"
            variant="tonal"
          >
            {{ getCategoryText(item.campaign_category) }}
          </v-chip>
        </template>

        <template #item.budget_limit="{ item }">
          <div v-if="item.budget_limit">
            <div class="text-body-2">
              Online: {{ formatCurrency(item.budget_limit.online || 0) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Offline: {{ formatCurrency(item.budget_limit.offline || 0) }}
            </div>
          </div>
          <span v-else class="text-medium-emphasis">Не указан</span>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              @click.stop="openCampaign(null, { item })"
            >
              <v-icon>mdi-eye</v-icon>
              <v-tooltip activator="parent" location="top">
                Открыть кампанию
              </v-tooltip>
            </v-btn>

            <v-btn
              icon="mdi-content-copy"
              size="small"
              variant="text"
              @click.stop="createVersion(item)"
            >
              <v-icon>mdi-content-copy</v-icon>
              <v-tooltip activator="parent" location="top">
                Создать версию
              </v-tooltip>
            </v-btn>

            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click.stop="deleteCampaign(item)"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">
                Удалить
              </v-tooltip>
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-robot-outline
            </v-icon>
            <h3 class="text-h6 mb-2">Кампании не найдены</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Создайте вашу первую кампанию с помощью ИИ
            </p>
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-plus"
              @click="createCampaign"
            >
              Создать кампанию
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания кампании -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Создать новую кампанию ИИ</v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="isFormValid">
            <v-text-field
              v-model="newCampaign.name"
              label="Название кампании"
              variant="outlined"
              :rules="[v => !!v || 'Название обязательно']"
              required
              class="mb-4"
            />

            <v-textarea
              v-model="newCampaign.description"
              label="Описание"
              variant="outlined"
              rows="3"
              class="mb-4"
            />

            <v-text-field
              v-model="newCampaign.objective"
              label="Цель кампании"
              variant="outlined"
              placeholder="Например: Увеличить продажи на 20%"
              class="mb-4"
            />

            <v-select
              v-model="newCampaign.campaign_category"
              :items="categoryOptions"
              label="Категория кампании"
              variant="outlined"
              :rules="[v => !!v || 'Категория обязательна']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreateDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!isFormValid"
            :loading="isSaving"
            @click="saveCampaign"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'

const router = useRouter()
const appStore = useAppStore()

const isLoading = ref(false)
const searchQuery = ref('')
const showCreateDialog = ref(false)
const isFormValid = ref(false)
const isSaving = ref(false)

const newCampaign = ref({
  name: '',
  description: '',
  objective: '',
  campaign_category: ''
})

const filters = ref({
  status: null,
  category: null,
  owner: null
})

// Mock data - в реальном приложении будет из API
const campaigns = ref([
  {
    ai_campaign_id: '1',
    name: 'Кампания "Живи на своём" Q1 2025',
    description: 'Продвижение банковских услуг для молодежи',
    objective: 'Увеличить количество лидов на 30%',
    campaign_category: 'performance',
    status: 'approved',
    version: 'v1',
    created_by: 'Иван Петров',
    budget_limit: {
      online: 8000000,
      offline: 1500000
    },
    created_at: '2025-01-15',
    linked_activity_id: null
  },
  {
    ai_campaign_id: '2',
    name: 'Ребрендинг продукта A',
    description: 'Информирование о новом бренде продукта',
    objective: 'Повысить узнаваемость бренда на 25%',
    campaign_category: 'branding',
    status: 'review',
    version: 'v2',
    created_by: 'Мария Сидорова',
    budget_limit: {
      online: 5000000,
      offline: 2000000
    },
    created_at: '2025-01-20',
    linked_activity_id: null
  },
  {
    ai_campaign_id: '3',
    name: 'Удержание клиентов сегмента Premium',
    description: 'Кампания по сохранению VIP-клиентов',
    objective: 'Снизить отток премиум-клиентов на 15%',
    campaign_category: 'retention',
    status: 'draft',
    version: 'v1',
    created_by: 'Алексей Козлов',
    budget_limit: {
      online: 3000000,
      offline: 500000
    },
    created_at: '2025-01-22',
    linked_activity_id: null
  }
])

const headers = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Категория', key: 'campaign_category', sortable: true },
  { title: 'Версия', key: 'version', sortable: true },
  { title: 'Ответственный', key: 'created_by', sortable: true },
  { title: 'Бюджет', key: 'budget_limit', sortable: false },
  { title: 'Создана', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

const statusOptions = [
  { title: 'Черновик', value: 'draft' },
  { title: 'Обрабатывается', value: 'processing' },
  { title: 'На рассмотрении', value: 'review' },
  { title: 'Утверждена', value: 'approved' },
  { title: 'Отклонена', value: 'rejected' }
]

const categoryOptions = [
  { title: 'Брендинг', value: 'branding' },
  { title: 'Перформанс', value: 'performance' },
  { title: 'Удержание', value: 'retention' }
]

const ownerOptions = [
  { title: 'Иван Петров', value: 'Иван Петров' },
  { title: 'Мария Сидорова', value: 'Мария Сидорова' },
  { title: 'Алексей Козлов', value: 'Алексей Козлов' }
]

const filteredCampaigns = computed(() => {
  let result = campaigns.value

  if (filters.value.status) {
    result = result.filter(c => c.status === filters.value.status)
  }
  if (filters.value.category) {
    result = result.filter(c => c.campaign_category === filters.value.category)
  }
  if (filters.value.owner) {
    result = result.filter(c => c.created_by === filters.value.owner)
  }

  return result
})

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    'draft': 'grey',
    'processing': 'blue',
    'review': 'orange',
    'approved': 'green',
    'rejected': 'red'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'draft': 'Черновик',
    'processing': 'Обрабатывается',
    'review': 'На рассмотрении',
    'approved': 'Утверждена',
    'rejected': 'Отклонена'
  }
  return texts[status] || status
}

const getCategoryColor = (category) => {
  const colors = {
    'branding': 'purple',
    'performance': 'blue',
    'retention': 'teal'
  }
  return colors[category] || 'grey'
}

const getCategoryText = (category) => {
  const texts = {
    'branding': 'Брендинг',
    'performance': 'Перформанс',
    'retention': 'Удержание'
  }
  return texts[category] || category
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

// Methods
const createCampaign = () => {
  showCreateDialog.value = true
}

const saveCampaign = async () => {
  try {
    isSaving.value = true

    // TODO: Реализовать API вызов createCampaign(newCampaign.value)
    const newId = Date.now().toString()
    const campaign = {
      ai_campaign_id: newId,
      ...newCampaign.value,
      status: 'draft',
      version: 'v1',
      created_by: 'Текущий пользователь',
      created_at: new Date().toISOString().split('T')[0],
      budget_limit: null,
      linked_activity_id: null
    }

    campaigns.value.unshift(campaign)

    appStore.showSuccess('Кампания создана успешно')
    showCreateDialog.value = false

    // Переходим к рабочему пространству новой кампании
    router.push(`/campaigns/${newId}`)

    // Сбрасываем форму
    newCampaign.value = {
      name: '',
      description: '',
      objective: '',
      campaign_category: ''
    }

  } catch (error) {
    console.error('Error creating campaign:', error)
    appStore.showError('Ошибка создания кампании')
  } finally {
    isSaving.value = false
  }
}

const openCampaign = (event, { item }) => {
  router.push(`/campaigns/${item.ai_campaign_id}`)
}

const createVersion = async (campaign) => {
  try {
    // TODO: Реализовать API вызов createCampaignVersion(campaign.ai_campaign_id)
    appStore.showSuccess('Версия кампании создана')
  } catch (error) {
    console.error('Error creating campaign version:', error)
    appStore.showError('Ошибка создания версии кампании')
  }
}

const deleteCampaign = async (campaign) => {
  if (confirm(`Удалить кампанию "${campaign.name}"?`)) {
    try {
      // TODO: Реализовать API вызов deleteCampaign(campaign.ai_campaign_id)
      const index = campaigns.value.findIndex(c => c.ai_campaign_id === campaign.ai_campaign_id)
      if (index > -1) {
        campaigns.value.splice(index, 1)
      }
      appStore.showSuccess('Кампания удалена')
    } catch (error) {
      console.error('Error deleting campaign:', error)
      appStore.showError('Ошибка удаления кампании')
    }
  }
}

const applyFilters = () => {
  // Фильтрация происходит автоматически через computed
}

const clearFilters = () => {
  filters.value = {
    status: null,
    category: null,
    owner: null
  }
}

onMounted(async () => {
  // TODO: Загрузка кампаний с сервера
  // campaigns.value = await getCampaigns()
})
</script>

<style scoped>
.campaigns-view {
  padding: 24px;
}

.v-data-table tbody tr:hover {
  cursor: pointer;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}
</style>