<template>
  <div class="placements-settings">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-billboard</v-icon>
        Справочник рекламных площадок
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Добавить площадку
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Управление базой рекламных площадок и каналов размещения
        </p>

        <!-- Сводная информация -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card color="primary" variant="tonal">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">{{ activePlacements.length }}</div>
                <div class="text-body-2">Активные площадки</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="success" variant="tonal">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">{{ formatNumber(totalSubscribers) }}</div>
                <div class="text-body-2">Общий охват</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="warning" variant="tonal">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">{{ averageEngagement.toFixed(1) }}%</div>
                <div class="text-body-2">Средний ER</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="info" variant="tonal">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">{{ platforms.length }}</div>
                <div class="text-body-2">Платформы</div>
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
              label="Поиск площадок"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedPlatform"
              :items="platforms"
              label="Платформа"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedCategory"
              :items="categories"
              label="Категория"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="minBudget"
              label="Мин. бюджет"
              type="number"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="maxBudget"
              label="Макс. бюджет"
              type="number"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="1">
            <v-switch
              v-model="activeOnly"
              label="Активные"
              density="compact"
            />
          </v-col>
        </v-row>

        <!-- Таблица площадок -->
        <v-data-table
          :headers="headers"
          :items="filteredPlacements"
          :loading="loading"
          item-key="placement_id"
          @click:row="editPlacement"
        >
          <template v-slot:item.platform="{ item }">
            <div class="d-flex align-center">
              <v-icon class="mr-2">{{ getPlatformIcon(item.platform) }}</v-icon>
              {{ item.platform }}
            </div>
          </template>

          <template v-slot:item.category="{ item }">
            <v-chip
              size="small"
              :color="getCategoryColor(item.category)"
            >
              {{ item.category }}
            </v-chip>
          </template>

          <template v-slot:item.subscribers="{ item }">
            {{ formatNumber(item.subscribers) }}
          </template>

          <template v-slot:item.avg_reach="{ item }">
            {{ formatNumber(item.avg_reach) }}
          </template>

          <template v-slot:item.avg_engagement_rate="{ item }">
            <span :class="getEngagementClass(item.avg_engagement_rate)">
              {{ item.avg_engagement_rate }}%
            </span>
          </template>

          <template v-slot:item.price_range="{ item }">
            {{ getPriceRange(item) }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              @click.stop="viewPlacement(item)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click.stop="editPlacement(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click.stop="deletePlacement(item)"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Диалог создания/редактирования -->
    <v-dialog v-model="dialog" max-width="900px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ editingPlacement ? 'Редактирование площадки' : 'Новая площадка' }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Название площадки"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.platform"
                  :items="platformOptions"
                  label="Платформа"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.category"
                  :items="categoryOptions"
                  label="Категория"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.url"
                  label="URL"
                  type="url"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.subscribers"
                  label="Подписчики"
                  type="number"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.avg_reach"
                  label="Средний охват"
                  type="number"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.avg_engagement_rate"
                  label="ER (%)"
                  type="number"
                  step="0.1"
                  variant="outlined"
                />
              </v-col>

              <!-- Цены -->
              <v-col cols="12">
                <v-divider class="my-4" />
                <h4 class="mb-3">Прайс-лист</h4>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.price_per_post"
                  label="Цена за пост (руб)"
                  type="number"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.price_per_story"
                  label="Цена за сторис (руб)"
                  type="number"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.price_per_video"
                  label="Цена за видео (руб)"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <!-- Аудитория -->
              <v-col cols="12">
                <v-divider class="my-4" />
                <h4 class="mb-3">Демография аудитории (%)</h4>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="formData.audience_demographics.age_18_24"
                  label="18-24 года"
                  type="number"
                  max="100"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="formData.audience_demographics.age_25_34"
                  label="25-34 года"
                  type="number"
                  max="100"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="formData.audience_demographics.female"
                  label="Женщины"
                  type="number"
                  max="100"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="formData.audience_demographics.male"
                  label="Мужчины"
                  type="number"
                  max="100"
                  variant="outlined"
                />
              </v-col>

              <!-- Контакты и примечания -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.contact_email"
                  label="Email для связи"
                  type="email"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.contact_phone"
                  label="Телефон"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.notes"
                  label="Примечания"
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
            @click="savePlacement"
          >
            {{ editingPlacement ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог просмотра -->
    <PlacementDetailDialog
      v-model="detailDialog"
      :placement="selectedPlacement"
    />

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтвердите удаление</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить площадку "{{ placementToDelete?.name }}"?
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
import { ref, computed, onMounted } from 'vue'
import { useplacementsStore } from '@/stores/placementsStore'
import { useSnackbar } from '@/composables/useSnackbar'
import PlacementDetailDialog from './PlacementDetailDialog.vue'

// Stores
const placementsStore = useplacementsStore()
const { showSnackbar } = useSnackbar()

// Reactive data
const searchQuery = ref('')
const selectedPlatform = ref('')
const selectedCategory = ref('')
const minBudget = ref(null)
const maxBudget = ref(null)
const activeOnly = ref(true)
const dialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const formValid = ref(false)
const saving = ref(false)
const editingPlacement = ref(null)
const placementToDelete = ref(null)
const selectedPlacement = ref(null)
const form = ref(null)

// Form data
const formData = ref({
  name: '',
  platform: '',
  category: '',
  url: '',
  subscribers: null,
  avg_reach: null,
  avg_engagement_rate: null,
  price_per_post: null,
  price_per_story: null,
  price_per_video: null,
  audience_demographics: {
    age_18_24: null,
    age_25_34: null,
    age_35_44: null,
    age_45_plus: null,
    female: null,
    male: null
  },
  contact_email: '',
  contact_phone: '',
  notes: ''
})

// Computed
const loading = computed(() => placementsStore.loading)
const placements = computed(() => placementsStore.placements)
const activePlacements = computed(() => placementsStore.activePlacements)
const platforms = computed(() => placementsStore.platforms)
const categories = computed(() => placementsStore.categories)

const filteredPlacements = computed(() => {
  let filtered = activeOnly.value ? activePlacements.value : placements.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.notes?.toLowerCase().includes(query)
    )
  }

  if (selectedPlatform.value) {
    filtered = filtered.filter(p => p.platform === selectedPlatform.value)
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }

  if (minBudget.value || maxBudget.value) {
    filtered = filtered.filter(p => {
      const price = p.price_per_post || p.price_per_video || 0
      if (minBudget.value && price < minBudget.value) return false
      if (maxBudget.value && price > maxBudget.value) return false
      return true
    })
  }

  return filtered
})

const totalSubscribers = computed(() => {
  return activePlacements.value.reduce((sum, p) => sum + (p.subscribers || 0), 0)
})

const averageEngagement = computed(() => {
  const rates = activePlacements.value.filter(p => p.avg_engagement_rate)
  if (rates.length === 0) return 0
  return rates.reduce((sum, p) => sum + p.avg_engagement_rate, 0) / rates.length
})

// Data options
const headers = [
  { title: 'Название', key: 'name' },
  { title: 'Платформа', key: 'platform' },
  { title: 'Категория', key: 'category' },
  { title: 'Подписчики', key: 'subscribers' },
  { title: 'Охват', key: 'avg_reach' },
  { title: 'ER', key: 'avg_engagement_rate' },
  { title: 'Цена', key: 'price_range' },
  { title: 'Действия', key: 'actions', sortable: false }
]

const platformOptions = [
  'Instagram', 'YouTube', 'TikTok', 'VKontakte', 'Telegram',
  'Website', 'Radio', 'TV', 'Outdoor'
]

const categoryOptions = [
  'beauty_blogger', 'fashion_channel', 'lifestyle_blogger',
  'makeup_artist', 'womens_portal', 'beauty_radio'
]

// Validation rules
const rules = {
  required: value => !!value || 'Поле обязательно для заполнения'
}

// Methods
const openCreateDialog = () => {
  editingPlacement.value = null
  formData.value = {
    name: '',
    platform: '',
    category: '',
    url: '',
    subscribers: null,
    avg_reach: null,
    avg_engagement_rate: null,
    price_per_post: null,
    price_per_story: null,
    price_per_video: null,
    audience_demographics: {
      age_18_24: null,
      age_25_34: null,
      age_35_44: null,
      age_45_plus: null,
      female: null,
      male: null
    },
    contact_email: '',
    contact_phone: '',
    notes: ''
  }
  dialog.value = true
}

const editPlacement = (placement) => {
  editingPlacement.value = placement
  formData.value = {
    ...placement,
    audience_demographics: { ...placement.audience_demographics }
  }
  dialog.value = true
}

const viewPlacement = (placement) => {
  selectedPlacement.value = placement
  detailDialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editingPlacement.value = null
  if (form.value) {
    form.value.reset()
  }
}

const savePlacement = async () => {
  if (!formValid.value) return

  saving.value = true
  try {
    if (editingPlacement.value) {
      await placementsStore.updatePlacement(editingPlacement.value.placement_id, formData.value)
      showSnackbar('Площадка успешно обновлена', 'success')
    } else {
      await placementsStore.createPlacement(formData.value)
      showSnackbar('Площадка успешно создана', 'success')
    }
    closeDialog()
  } catch (error) {
    showSnackbar('Ошибка при сохранении площадки', 'error')
  } finally {
    saving.value = false
  }
}

const deletePlacement = (placement) => {
  placementToDelete.value = placement
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await placementsStore.deletePlacement(placementToDelete.value.placement_id)
    showSnackbar('Площадка успешно удалена', 'success')
    deleteDialog.value = false
    placementToDelete.value = null
  } catch (error) {
    showSnackbar('Ошибка при удалении площадки', 'error')
  }
}

const getPlatformIcon = (platform) => {
  const icons = {
    Instagram: 'mdi-instagram',
    YouTube: 'mdi-youtube',
    TikTok: 'mdi-music-note',
    VKontakte: 'mdi-vk',
    Telegram: 'mdi-telegram',
    Website: 'mdi-web',
    Radio: 'mdi-radio',
    TV: 'mdi-television',
    Outdoor: 'mdi-billboard'
  }
  return icons[platform] || 'mdi-web'
}

const getCategoryColor = (category) => {
  const colors = {
    beauty_blogger: 'pink',
    fashion_channel: 'purple',
    lifestyle_blogger: 'orange',
    makeup_artist: 'red',
    womens_portal: 'green',
    beauty_radio: 'blue'
  }
  return colors[category] || 'grey'
}

const getEngagementClass = (rate) => {
  if (rate >= 5) return 'text-success font-weight-bold'
  if (rate >= 3) return 'text-warning'
  return 'text-error'
}

const getPriceRange = (placement) => {
  const prices = [
    placement.price_per_post,
    placement.price_per_story,
    placement.price_per_video
  ].filter(Boolean)

  if (prices.length === 0) return '-'

  const min = Math.min(...prices)
  const max = Math.max(...prices)

  if (min === max) {
    return formatNumber(min) + ' ₽'
  }

  return `${formatNumber(min)} - ${formatNumber(max)} ₽`
}

const formatNumber = (number) => {
  if (!number) return '0'
  return new Intl.NumberFormat('ru-RU').format(number)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    placementsStore.fetchPlacements(),
    placementsStore.fetchPlatforms(),
    placementsStore.fetchCategories()
  ])
})
</script>

<style scoped>
.placements-settings {
  height: 100%;
}

:deep(.v-data-table tbody tr) {
  cursor: pointer;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>