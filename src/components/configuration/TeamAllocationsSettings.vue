<template>
  <div class="team-allocations-settings">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-account-group</v-icon>
        Управление ресурсами команд
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Новая аллокация
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Планирование и отслеживание распределения FTE команд по продуктам и кампаниям
        </p>

        <!-- Сводная информация -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card color="primary" variant="tonal">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">{{ totalFTE }}</div>
                <div class="text-body-2">Общий FTE</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="success" variant="tonal">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">{{ formatCurrency(totalMonthlyCost) }}</div>
                <div class="text-body-2">Месячные затраты</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="warning" variant="tonal">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">{{ currentAllocations.length }}</div>
                <div class="text-body-2">Текущие аллокации</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="info" variant="tonal">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">{{ futureAllocations.length }}</div>
                <div class="text-body-2">Будущие аллокации</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Фильтры и поиск -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedTeam"
              :items="teams"
              item-title="name"
              item-value="id"
              label="Команда"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedType"
              :items="allocationTypes"
              label="Тип аллокации"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedPeriod"
              :items="periodOptions"
              label="Период"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
        </v-row>

        <!-- Таблица аллокаций -->
        <v-data-table
          :headers="headers"
          :items="filteredAllocations"
          :loading="loading"
          item-key="allocation_id"
          @click:row="editAllocation"
        >
          <template v-slot:item.team_name="{ item }">
            {{ getTeamName(item.team_id) }}
          </template>

          <template v-slot:item.product_name="{ item }">
            {{ getProductName(item.product_id) }}
          </template>

          <template v-slot:item.allocation_type="{ item }">
            <v-chip
              size="small"
              :color="getTypeColor(item.allocation_type)"
            >
              {{ item.allocation_type }}
            </v-chip>
          </template>

          <template v-slot:item.fte_allocated="{ item }">
            <span class="font-weight-bold">{{ item.fte_allocated }}</span>
          </template>

          <template v-slot:item.cost_per_month="{ item }">
            {{ formatCurrency(item.cost_per_month) }}
          </template>

          <template v-slot:item.period="{ item }">
            {{ formatDateRange(item.period_start, item.period_end) }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click.stop="editAllocation(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click.stop="deleteAllocation(item)"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Диалог создания/редактирования -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ editingAllocation ? 'Редактирование аллокации' : 'Новая аллокация' }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.team_id"
                  :items="teams"
                  item-title="name"
                  item-value="id"
                  label="Команда"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.allocation_type"
                  :items="allocationTypeOptions"
                  label="Тип аллокации"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6" v-if="formData.allocation_type === 'Product'">
                <v-select
                  v-model="formData.product_id"
                  :items="products"
                  item-title="name"
                  item-value="product_id"
                  label="Продукт"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6" v-if="formData.allocation_type === 'Campaign'">
                <v-select
                  v-model="formData.activity_id"
                  :items="activities"
                  item-title="name"
                  item-value="activity_id"
                  label="Кампания"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.fte_allocated"
                  label="FTE"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  :rules="[rules.required, rules.fte]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.cost_per_month"
                  label="Стоимость в месяц (руб)"
                  type="number"
                  min="0"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.period_start"
                  label="Начало периода"
                  type="date"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.period_end"
                  label="Конец периода"
                  type="date"
                  :rules="[rules.required, rules.endAfterStart]"
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

            <!-- Проверка конфликтов -->
            <v-alert
              v-if="conflicts.length > 0"
              type="warning"
              class="mt-4"
            >
              <div class="font-weight-bold">Обнаружены конфликты аллокации:</div>
              <ul class="mt-2">
                <li v-for="conflict in conflicts" :key="conflict.allocation_id">
                  {{ conflict.notes }} ({{ formatDateRange(conflict.period_start, conflict.period_end) }})
                </li>
              </ul>
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            :loading="saving"
            @click="saveAllocation"
          >
            {{ editingAllocation ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтвердите удаление</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить эту аллокацию?
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
import { ref, computed, onMounted, watch } from 'vue'
import { useTeamAllocationsStore } from '@/stores/teamAllocationsStore'
import { useProductsStore } from '@/stores/productsStore'
import { useSnackbar } from '@/composables/useSnackbar'

// Stores
const teamAllocationsStore = useTeamAllocationsStore()
const productsStore = useProductsStore()
const { showSnackbar } = useSnackbar()

// Reactive data
const selectedTeam = ref('')
const selectedType = ref('')
const selectedPeriod = ref('current')
const searchQuery = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const formValid = ref(false)
const saving = ref(false)
const editingAllocation = ref(null)
const allocationToDelete = ref(null)
const form = ref(null)
const conflicts = ref([])

// Form data
const formData = ref({
  team_id: '',
  product_id: null,
  activity_id: null,
  allocation_type: 'Product',
  fte_allocated: null,
  cost_per_month: null,
  period_start: '',
  period_end: '',
  notes: ''
})

// Computed
const loading = computed(() => teamAllocationsStore.loading)
const allocations = computed(() => teamAllocationsStore.allocations)
const currentAllocations = computed(() => teamAllocationsStore.getCurrentAllocations)
const futureAllocations = computed(() => teamAllocationsStore.getFutureAllocations)
const totalFTE = computed(() => teamAllocationsStore.getTotalFTE)
const totalMonthlyCost = computed(() => teamAllocationsStore.getTotalMonthlyCost)
const products = computed(() => productsStore.products)

const filteredAllocations = computed(() => {
  let filtered = allocations.value

  if (selectedTeam.value) {
    filtered = filtered.filter(a => a.team_id === selectedTeam.value)
  }

  if (selectedType.value) {
    filtered = filtered.filter(a => a.allocation_type === selectedType.value)
  }

  if (selectedPeriod.value === 'current') {
    filtered = currentAllocations.value
  } else if (selectedPeriod.value === 'future') {
    filtered = futureAllocations.value
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.notes?.toLowerCase().includes(query) ||
      getTeamName(a.team_id).toLowerCase().includes(query)
    )
  }

  return filtered
})

const allocationTypes = computed(() => {
  return [...new Set(allocations.value.map(a => a.allocation_type))]
})

// Data options
const headers = [
  { title: 'Команда', key: 'team_name' },
  { title: 'Тип', key: 'allocation_type' },
  { title: 'Продукт/Кампания', key: 'product_name' },
  { title: 'FTE', key: 'fte_allocated' },
  { title: 'Стоимость/мес', key: 'cost_per_month' },
  { title: 'Период', key: 'period' },
  { title: 'Действия', key: 'actions', sortable: false }
]

const allocationTypeOptions = [
  { title: 'Продукт', value: 'Product' },
  { title: 'Кампания', value: 'Campaign' }
]

const periodOptions = [
  { title: 'Текущие', value: 'current' },
  { title: 'Будущие', value: 'future' },
  { title: 'Все', value: 'all' }
]

const teams = ref([
  { id: 'team_marketing', name: 'Маркетинг' },
  { id: 'team_digital', name: 'Digital' },
  { id: 'team_content', name: 'Контент' },
  { id: 'team_analytics', name: 'Аналитика' }
])

const activities = ref([
  { activity_id: 'activity_1', name: 'Q4 Кампания' },
  { activity_id: 'activity_2', name: 'Digital Кампания' }
])

// Validation rules
const rules = {
  required: value => !!value || 'Поле обязательно для заполнения',
  fte: value => (value > 0 && value <= 10) || 'FTE должен быть от 0.1 до 10',
  endAfterStart: value => {
    if (!formData.value.period_start || !value) return true
    return new Date(value) > new Date(formData.value.period_start) || 'Конец периода должен быть после начала'
  }
}

// Methods
const openCreateDialog = () => {
  editingAllocation.value = null
  formData.value = {
    team_id: '',
    product_id: null,
    activity_id: null,
    allocation_type: 'Product',
    fte_allocated: null,
    cost_per_month: null,
    period_start: '',
    period_end: '',
    notes: ''
  }
  conflicts.value = []
  dialog.value = true
}

const editAllocation = (allocation) => {
  editingAllocation.value = allocation
  formData.value = { ...allocation }
  conflicts.value = []
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editingAllocation.value = null
  conflicts.value = []
  if (form.value) {
    form.value.reset()
  }
}

const saveAllocation = async () => {
  if (!formValid.value) return

  saving.value = true
  try {
    if (editingAllocation.value) {
      await teamAllocationsStore.updateAllocation(editingAllocation.value.allocation_id, formData.value)
      showSnackbar('Аллокация успешно обновлена', 'success')
    } else {
      await teamAllocationsStore.createAllocation(formData.value)
      showSnackbar('Аллокация успешно создана', 'success')
    }
    closeDialog()
  } catch (error) {
    showSnackbar('Ошибка при сохранении аллокации', 'error')
  } finally {
    saving.value = false
  }
}

const deleteAllocation = (allocation) => {
  allocationToDelete.value = allocation
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await teamAllocationsStore.deleteAllocation(allocationToDelete.value.allocation_id)
    showSnackbar('Аллокация успешно удалена', 'success')
    deleteDialog.value = false
    allocationToDelete.value = null
  } catch (error) {
    showSnackbar('Ошибка при удалении аллокации', 'error')
  }
}

const getTeamName = (teamId) => {
  const team = teams.value.find(t => t.id === teamId)
  return team?.name || teamId
}

const getProductName = (productId) => {
  if (!productId) return '-'
  const product = products.value.find(p => p.product_id === productId)
  return product?.name || productId
}

const getTypeColor = (type) => {
  const colors = {
    Product: 'primary',
    Campaign: 'success'
  }
  return colors[type] || 'grey'
}

const formatCurrency = (amount) => {
  if (!amount) return '0 ₽'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDateRange = (start, end) => {
  const startDate = new Date(start).toLocaleDateString('ru-RU')
  const endDate = new Date(end).toLocaleDateString('ru-RU')
  return `${startDate} - ${endDate}`
}

// Check for conflicts when form data changes
watch([() => formData.value.team_id, () => formData.value.period_start, () => formData.value.period_end], async () => {
  if (formData.value.team_id && formData.value.period_start && formData.value.period_end) {
    try {
      const result = await teamAllocationsStore.checkConflicts(
        formData.value.team_id,
        formData.value.period_start,
        formData.value.period_end,
        editingAllocation.value?.allocation_id
      )
      conflicts.value = result.data
    } catch (error) {
      conflicts.value = []
    }
  }
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await Promise.all([
    teamAllocationsStore.fetchAllocations(),
    productsStore.fetchProducts()
  ])
})
</script>

<style scoped>
.team-allocations-settings {
  height: 100%;
}

:deep(.v-data-table tbody tr) {
  cursor: pointer;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>