<template>
  <div class="cross-channel-links-settings">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-link-variant</v-icon>
        Кросс-канальные связи
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Добавить связь
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Настройка связей влияния между различными каналами маркетинга
        </p>

        <!-- Статистика -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-primary">{{ totalLinks }}</div>
                <div class="text-caption">Всего связей</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-success">{{ activeLinks }}</div>
                <div class="text-caption">Активных</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-warning">{{ averageInfluence }}</div>
                <div class="text-caption">Среднее влияние (%)</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 text-info">{{ uniqueChannels }}</div>
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
              label="Поиск связей"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedSource"
              :items="availableChannels"
              label="Канал-источник"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedTarget"
              :items="availableChannels"
              label="Канал-цель"
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

        <!-- Таблица связей -->
        <v-data-table
          :headers="headers"
          :items="filteredLinks"
          :loading="loading"
          item-key="id"
          @click:row="editLink"
        >
          <template v-slot:item.source_channel="{ item }">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary">
                {{ getChannelIcon(item.source_channel) }}
              </v-icon>
              {{ item.source_channel }}
            </div>
          </template>

          <template v-slot:item.target_channel="{ item }">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="secondary">
                {{ getChannelIcon(item.target_channel) }}
              </v-icon>
              {{ item.target_channel }}
            </div>
          </template>

          <template v-slot:item.influence_coefficient="{ item }">
            <v-chip
              :color="getInfluenceColor(item.influence_coefficient)"
              size="small"
            >
              {{ formatPercentage(item.influence_coefficient) }}
            </v-chip>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <template v-slot:item.attribution_model="{ item }">
            <v-chip
              color="info"
              size="small"
              variant="outlined"
            >
              {{ getModelText(item.attribution_model) }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click.stop="editLink(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click.stop="deleteLink(item)"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Диалог создания/редактирования -->
    <v-dialog v-model="dialog" max-width="700px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ editingLink ? 'Редактирование связи' : 'Новая кросс-канальная связь' }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.source_channel"
                  :items="channelOptions"
                  label="Канал-источник"
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
                <v-select
                  v-model="formData.target_channel"
                  :items="channelOptions"
                  label="Канал-цель"
                  :rules="[rules.required, rules.notSameAsSource]"
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
                  v-model="formData.influence_coefficient"
                  label="Коэффициент влияния (%)"
                  type="number"
                  :rules="[rules.required, rules.percentage]"
                  variant="outlined"
                  suffix="%"
                  min="0"
                  max="100"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.attribution_model"
                  :items="attributionModels"
                  label="Модель атрибуции"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.time_delay_days"
                  label="Задержка (дни)"
                  type="number"
                  variant="outlined"
                  min="0"
                  max="365"
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
                <v-text-field
                  v-model="formData.measurement_period"
                  label="Период измерения"
                  placeholder="Например: 30 дней"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Описание связи"
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
            @click="saveLink"
          >
            {{ editingLink ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтвердите удаление</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить связь между каналами "{{ linkToDelete?.source_channel }}" и "{{ linkToDelete?.target_channel }}"?
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
import { useCrossChannelLinksStore } from '@/stores/crossChannelLinksStore'
import { useSnackbar } from '@/composables/useSnackbar'

// Stores
const crossChannelLinksStore = useCrossChannelLinksStore()
const { showSnackbar } = useSnackbar()

// Reactive data
const searchQuery = ref('')
const selectedSource = ref('')
const selectedTarget = ref('')
const selectedStatus = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const formValid = ref(false)
const saving = ref(false)
const editingLink = ref(null)
const linkToDelete = ref(null)
const form = ref(null)

// Form data
const formData = ref({
  source_channel: '',
  target_channel: '',
  influence_coefficient: null,
  attribution_model: '',
  time_delay_days: 0,
  measurement_period: '',
  status: 'active',
  description: ''
})

// Computed
const loading = computed(() => crossChannelLinksStore.loading)
const links = computed(() => crossChannelLinksStore.links)

const filteredLinks = computed(() => {
  let filtered = links.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(link =>
      link.source_channel.toLowerCase().includes(query) ||
      link.target_channel.toLowerCase().includes(query) ||
      link.description.toLowerCase().includes(query)
    )
  }

  if (selectedSource.value) {
    filtered = filtered.filter(link => link.source_channel === selectedSource.value)
  }

  if (selectedTarget.value) {
    filtered = filtered.filter(link => link.target_channel === selectedTarget.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(link => link.status === selectedStatus.value)
  }

  return filtered
})

const availableChannels = computed(() => {
  const channels = new Set()
  links.value.forEach(link => {
    channels.add(link.source_channel)
    channels.add(link.target_channel)
  })
  return Array.from(channels).sort()
})

const totalLinks = computed(() => links.value.length)
const activeLinks = computed(() => links.value.filter(link => link.status === 'active').length)
const averageInfluence = computed(() => {
  if (links.value.length === 0) return 0
  const sum = links.value.reduce((acc, link) => acc + link.influence_coefficient, 0)
  return Math.round(sum / links.value.length)
})
const uniqueChannels = computed(() => availableChannels.value.length)

// Data options
const headers = [
  { title: 'Канал-источник', key: 'source_channel' },
  { title: 'Канал-цель', key: 'target_channel' },
  { title: 'Влияние', key: 'influence_coefficient' },
  { title: 'Модель', key: 'attribution_model' },
  { title: 'Статус', key: 'status' },
  { title: 'Действия', key: 'actions', sortable: false }
]

const channelOptions = [
  { title: 'Поисковая реклама', value: 'Search' },
  { title: 'Медийная реклама', value: 'Display' },
  { title: 'Социальные сети', value: 'Social' },
  { title: 'Видеореклама', value: 'Video' },
  { title: 'Email маркетинг', value: 'Email' },
  { title: 'Прямая почта', value: 'Direct Mail' },
  { title: 'Радио', value: 'Radio' },
  { title: 'Телевидение', value: 'TV' },
  { title: 'Наружная реклама', value: 'OOH' },
  { title: 'PR', value: 'PR' }
]

const attributionModels = [
  { title: 'Первое касание', value: 'first_touch' },
  { title: 'Последнее касание', value: 'last_touch' },
  { title: 'Линейная', value: 'linear' },
  { title: 'U-образная', value: 'u_shaped' },
  { title: 'Временное затухание', value: 'time_decay' },
  { title: 'По позиции', value: 'position_based' },
  { title: 'Алгоритмическая', value: 'algorithmic' }
]

const statusOptions = [
  { title: 'Активная', value: 'active' },
  { title: 'Неактивная', value: 'inactive' },
  { title: 'Тестируется', value: 'testing' },
  { title: 'Архивная', value: 'archived' }
]

// Validation rules
const rules = {
  required: value => !!value || 'Поле обязательно для заполнения',
  notSameAsSource: value => value !== formData.value.source_channel || 'Канал-цель не может совпадать с каналом-источником',
  percentage: value => (value >= 0 && value <= 100) || 'Значение должно быть от 0 до 100'
}

// Methods
const openCreateDialog = () => {
  editingLink.value = null
  formData.value = {
    source_channel: '',
    target_channel: '',
    influence_coefficient: null,
    attribution_model: 'linear',
    time_delay_days: 0,
    measurement_period: '30 дней',
    status: 'active',
    description: ''
  }
  dialog.value = true
}

const editLink = (link) => {
  editingLink.value = link
  formData.value = { ...link }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editingLink.value = null
  if (form.value) {
    form.value.reset()
  }
}

const saveLink = async () => {
  if (!formValid.value) return

  saving.value = true
  try {
    if (editingLink.value) {
      await crossChannelLinksStore.updateLink(editingLink.value.id, formData.value)
      showSnackbar('Кросс-канальная связь успешно обновлена', 'success')
    } else {
      await crossChannelLinksStore.createLink(formData.value)
      showSnackbar('Кросс-канальная связь успешно создана', 'success')
    }
    closeDialog()
  } catch (error) {
    showSnackbar('Ошибка при сохранении связи', 'error')
  } finally {
    saving.value = false
  }
}

const deleteLink = (link) => {
  linkToDelete.value = link
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await crossChannelLinksStore.deleteLink(linkToDelete.value.id)
    showSnackbar('Кросс-канальная связь успешно удалена', 'success')
    deleteDialog.value = false
    linkToDelete.value = null
  } catch (error) {
    showSnackbar('Ошибка при удалении связи', 'error')
  }
}

const getChannelIcon = (channel) => {
  const icons = {
    Search: 'mdi-magnify',
    Display: 'mdi-monitor',
    Social: 'mdi-account-group',
    Video: 'mdi-play-circle',
    Email: 'mdi-email',
    'Direct Mail': 'mdi-mailbox',
    Radio: 'mdi-radio',
    TV: 'mdi-television',
    OOH: 'mdi-billboard',
    PR: 'mdi-microphone'
  }
  return icons[channel] || 'mdi-link'
}

const getInfluenceColor = (coefficient) => {
  if (coefficient >= 70) return 'success'
  if (coefficient >= 40) return 'warning'
  return 'error'
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    inactive: 'error',
    testing: 'warning',
    archived: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Активная',
    inactive: 'Неактивная',
    testing: 'Тестируется',
    archived: 'Архивная'
  }
  return texts[status] || status
}

const getModelText = (model) => {
  const texts = {
    first_touch: 'Первое касание',
    last_touch: 'Последнее касание',
    linear: 'Линейная',
    u_shaped: 'U-образная',
    time_decay: 'Временное затухание',
    position_based: 'По позиции',
    algorithmic: 'Алгоритмическая'
  }
  return texts[model] || model
}

const formatPercentage = (value) => {
  return `${value}%`
}

// Lifecycle
onMounted(async () => {
  await crossChannelLinksStore.fetchLinks()
})
</script>

<style scoped>
.cross-channel-links-settings {
  height: 100%;
}

:deep(.v-data-table tbody tr) {
  cursor: pointer;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>