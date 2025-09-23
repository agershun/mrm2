<template>
  <div class="campaign-planning">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-strategy</v-icon>
        Планирование кампаний
        <v-spacer />
        <div class="d-flex align-center ga-2">
          <v-select
            v-model="selectedTimeframe"
            :items="timeframeOptions"
            label="Период"
            variant="outlined"
            density="compact"
            style="width: 150px"
          />
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="createPlanDialog = true"
          >
            Новый план
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <!-- Обзор планирования -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-card variant="outlined" color="primary">
              <v-card-text class="text-center">
                <div class="text-h4 text-white">{{ formatBudget(totalPlannedBudget) }}</div>
                <div class="text-subtitle-1 text-white">Планируемый бюджет</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card variant="outlined" color="success">
              <v-card-text class="text-center">
                <div class="text-h4 text-white">{{ formatBudget(allocatedBudget) }}</div>
                <div class="text-subtitle-1 text-white">Распределено</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card variant="outlined" color="warning">
              <v-card-text class="text-center">
                <div class="text-h4 text-white">{{ formatBudget(remainingBudget) }}</div>
                <div class="text-subtitle-1 text-white">Остаток</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Фильтры планирования -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedProduct"
              :items="productOptions"
              item-title="name"
              item-value="product_id"
              label="Продукт"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedGeography"
              :items="geographyOptions"
              item-title="name"
              item-value="geography_id"
              label="География"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedLevel"
              :items="hierarchyLevels"
              label="Уровень планирования"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-switch
              v-model="showBudgetAllocation"
              label="Показать распределение"
              density="compact"
            />
          </v-col>
        </v-row>

        <!-- Иерархическое планирование -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-file-tree</v-icon>
            Иерархия планирования
            <v-spacer />
            <v-btn
              size="small"
              variant="outlined"
              @click="expandAll"
            >
              Развернуть все
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-treeview
              :items="planningTree"
              item-key="id"
              item-title="name"
              :open="openItems"
              @update:open="updateOpenItems"
            >
              <template v-slot:prepend="{ item }">
                <v-icon
                  :color="getHierarchyColor(item.hierarchy_level)"
                  class="mr-2"
                >
                  {{ getHierarchyIcon(item.hierarchy_level) }}
                </v-icon>
              </template>

              <template v-slot:append="{ item }">
                <div class="d-flex align-center ga-2">
                  <!-- Бюджет -->
                  <v-chip
                    size="small"
                    color="info"
                    variant="outlined"
                  >
                    {{ formatBudget(item.budget) }}
                  </v-chip>

                  <!-- Прогресс распределения -->
                  <v-progress-circular
                    v-if="showBudgetAllocation"
                    :model-value="calculateAllocationProgress(item)"
                    :color="getAllocationColor(calculateAllocationProgress(item))"
                    size="24"
                    width="3"
                  >
                    <template v-slot:default>
                      <span class="text-caption">{{ calculateAllocationProgress(item) }}%</span>
                    </template>
                  </v-progress-circular>

                  <!-- Действия -->
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon="mdi-dots-vertical"
                        size="small"
                        variant="text"
                        v-bind="props"
                      />
                    </template>
                    <v-list>
                      <v-list-item @click="editPlanItem(item)">
                        <v-list-item-title>Редактировать</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="addChildItem(item)">
                        <v-list-item-title>Добавить подуровень</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="allocateBudget(item)">
                        <v-list-item-title>Распределить бюджет</v-list-item-title>
                      </v-list-item>
                      <v-divider />
                      <v-list-item @click="deletePlanItem(item)" class="text-error">
                        <v-list-item-title>Удалить</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </template>
            </v-treeview>
          </v-card-text>
        </v-card>

        <!-- Распределение бюджета по продуктам -->
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-card variant="outlined">
              <v-card-title>Распределение по продуктам</v-card-title>
              <v-card-text>
                <div
                  v-for="product in productDistribution"
                  :key="product.id"
                  class="d-flex align-center justify-space-between mb-2"
                >
                  <span>{{ product.name }}</span>
                  <div class="d-flex align-center ga-2">
                    <v-progress-linear
                      :model-value="product.percentage"
                      :color="product.color"
                      height="8"
                      rounded
                      style="width: 100px"
                    />
                    <span class="text-caption">{{ product.percentage }}%</span>
                    <span class="font-weight-bold">{{ formatBudget(product.budget) }}</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined">
              <v-card-title>Распределение по географии</v-card-title>
              <v-card-text>
                <div
                  v-for="geo in geographyDistribution"
                  :key="geo.id"
                  class="d-flex align-center justify-space-between mb-2"
                >
                  <span>{{ geo.name }}</span>
                  <div class="d-flex align-center ga-2">
                    <v-progress-linear
                      :model-value="geo.percentage"
                      :color="geo.color"
                      height="8"
                      rounded
                      style="width: 100px"
                    />
                    <span class="text-caption">{{ geo.percentage }}%</span>
                    <span class="font-weight-bold">{{ formatBudget(geo.budget) }}</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Диалог создания плана -->
    <v-dialog v-model="createPlanDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>Создание нового плана</v-card-title>
        <v-card-text>
          <v-form ref="planForm" v-model="planFormValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="planFormData.name"
                  label="Название плана"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="planFormData.hierarchy_level"
                  :items="hierarchyLevels"
                  label="Уровень"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="planFormData.budget"
                  label="Бюджет"
                  type="number"
                  :rules="[rules.required]"
                  variant="outlined"
                  suffix="₽"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="planFormData.start_date"
                  label="Дата начала"
                  type="date"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="planFormData.end_date"
                  label="Дата окончания"
                  type="date"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="createPlanDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!planFormValid"
            @click="createPlan"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог распределения бюджета -->
    <v-dialog v-model="budgetAllocationDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title>Распределение бюджета</v-card-title>
        <v-card-text>
          <v-alert
            v-if="allocationError"
            type="error"
            class="mb-4"
          >
            {{ allocationError }}
          </v-alert>

          <div class="mb-4">
            <strong>Общий бюджет: </strong>{{ formatBudget(selectedItem?.budget) }}
          </div>

          <v-row>
            <v-col
              v-for="(allocation, index) in budgetAllocations"
              :key="index"
              cols="12"
            >
              <v-card variant="outlined" class="mb-2">
                <v-card-text>
                  <v-row align="center">
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="allocation.name"
                        label="Название"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="allocation.amount"
                        label="Сумма"
                        type="number"
                        variant="outlined"
                        density="compact"
                        suffix="₽"
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="allocation.percentage"
                        label="Процент"
                        type="number"
                        variant="outlined"
                        density="compact"
                        suffix="%"
                        readonly
                      />
                    </v-col>
                    <v-col cols="12" md="2">
                      <v-btn
                        icon="mdi-delete"
                        color="error"
                        variant="text"
                        @click="removeAllocation(index)"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-plus"
            @click="addAllocation"
            class="mb-4"
          >
            Добавить распределение
          </v-btn>

          <div class="d-flex justify-space-between align-center">
            <strong>Итого распределено: </strong>
            <span :class="totalAllocatedPercentage > 100 ? 'text-error' : 'text-success'">
              {{ formatBudget(totalAllocatedAmount) }} ({{ totalAllocatedPercentage }}%)
            </span>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="budgetAllocationDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="totalAllocatedPercentage > 100"
            @click="saveBudgetAllocation"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
const selectedTimeframe = ref('Q1 2025')
const selectedProduct = ref('')
const selectedGeography = ref('')
const selectedLevel = ref('')
const showBudgetAllocation = ref(true)
const openItems = ref([])

const createPlanDialog = ref(false)
const budgetAllocationDialog = ref(false)
const planFormValid = ref(false)
const selectedItem = ref(null)
const allocationError = ref('')

const planFormData = ref({
  name: '',
  hierarchy_level: 'Program',
  budget: null,
  start_date: '',
  end_date: ''
})

const budgetAllocations = ref([])

// Computed
const productOptions = computed(() => productsStore.products)
const geographyOptions = computed(() => geographyStore.geographies)

const planningTree = computed(() => {
  // Mock planning tree structure
  return [
    {
      id: 'program_1',
      name: 'Креола 2025 - Годовая программа',
      hierarchy_level: 'Program',
      budget: 50000000,
      allocated: 35000000,
      children: [
        {
          id: 'campaign_1',
          name: 'Весенняя коллекция',
          hierarchy_level: 'Campaign',
          budget: 15000000,
          allocated: 12000000,
          children: [
            {
              id: 'flight_1',
              name: 'Запуск в марте',
              hierarchy_level: 'Flight',
              budget: 8000000,
              allocated: 6000000
            }
          ]
        },
        {
          id: 'campaign_2',
          name: 'Летняя кампания',
          hierarchy_level: 'Campaign',
          budget: 20000000,
          allocated: 15000000
        }
      ]
    }
  ]
})

const totalPlannedBudget = computed(() => 50000000)
const allocatedBudget = computed(() => 35000000)
const remainingBudget = computed(() => totalPlannedBudget.value - allocatedBudget.value)

const productDistribution = computed(() => [
  { id: 1, name: 'Уход за кожей', budget: 20000000, percentage: 40, color: 'primary' },
  { id: 2, name: 'Декоративная косметика', budget: 15000000, percentage: 30, color: 'secondary' },
  { id: 3, name: 'Мужская линия', budget: 10000000, percentage: 20, color: 'success' },
  { id: 4, name: 'Детская линия', budget: 5000000, percentage: 10, color: 'warning' }
])

const geographyDistribution = computed(() => [
  { id: 1, name: 'Москва', budget: 25000000, percentage: 50, color: 'primary' },
  { id: 2, name: 'СПб', budget: 15000000, percentage: 30, color: 'secondary' },
  { id: 3, name: 'Регионы', budget: 10000000, percentage: 20, color: 'success' }
])

const totalAllocatedAmount = computed(() =>
  budgetAllocations.value.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0)
)

const totalAllocatedPercentage = computed(() => {
  if (!selectedItem.value?.budget) return 0
  return Math.round((totalAllocatedAmount.value / selectedItem.value.budget) * 100)
})

// Data options
const timeframeOptions = [
  { title: 'Q1 2025', value: 'Q1 2025' },
  { title: 'Q2 2025', value: 'Q2 2025' },
  { title: 'Полугодие 2025', value: 'H1 2025' },
  { title: 'Год 2025', value: '2025' }
]

const hierarchyLevels = [
  { title: 'Программа', value: 'Program' },
  { title: 'Кампания', value: 'Campaign' },
  { title: 'Флайт', value: 'Flight' },
  { title: 'Тактика', value: 'Tactic' },
  { title: 'Размещение', value: 'Placement' }
]

const rules = {
  required: value => !!value || 'Поле обязательно для заполнения'
}

// Methods
const updateOpenItems = (items) => {
  openItems.value = items
}

const expandAll = () => {
  const getAllIds = (items) => {
    let ids = []
    items.forEach(item => {
      ids.push(item.id)
      if (item.children) {
        ids = ids.concat(getAllIds(item.children))
      }
    })
    return ids
  }
  openItems.value = getAllIds(planningTree.value)
}

const editPlanItem = (item) => {
  console.log('Edit plan item:', item)
}

const addChildItem = (item) => {
  console.log('Add child to:', item)
}

const allocateBudget = (item) => {
  selectedItem.value = item
  budgetAllocations.value = [
    { name: '', amount: 0, percentage: 0 }
  ]
  budgetAllocationDialog.value = true
}

const deletePlanItem = (item) => {
  console.log('Delete plan item:', item)
}

const createPlan = () => {
  console.log('Create plan:', planFormData.value)
  createPlanDialog.value = false
  showSnackbar('План успешно создан', 'success')
}

const addAllocation = () => {
  budgetAllocations.value.push({
    name: '',
    amount: 0,
    percentage: 0
  })
}

const removeAllocation = (index) => {
  budgetAllocations.value.splice(index, 1)
}

const saveBudgetAllocation = () => {
  console.log('Save budget allocation:', budgetAllocations.value)
  budgetAllocationDialog.value = false
  showSnackbar('Бюджет успешно распределен', 'success')
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

const calculateAllocationProgress = (item) => {
  if (!item.budget) return 0
  return Math.round((item.allocated / item.budget) * 100)
}

const getAllocationColor = (progress) => {
  if (progress >= 80) return 'success'
  if (progress >= 50) return 'warning'
  return 'error'
}

const formatBudget = (amount) => {
  if (!amount) return '0 ₽'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

// Watchers
watch(budgetAllocations, () => {
  budgetAllocations.value.forEach(allocation => {
    if (selectedItem.value?.budget && allocation.amount) {
      allocation.percentage = Math.round((allocation.amount / selectedItem.value.budget) * 100)
    }
  })

  allocationError.value = totalAllocatedPercentage.value > 100
    ? 'Общая сумма распределения превышает доступный бюджет'
    : ''
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    geographyStore.fetchGeographies()
  ])
})
</script>

<style scoped>
.campaign-planning {
  height: 100%;
}

:deep(.v-treeview-item) {
  margin-bottom: 8px;
}

:deep(.v-card[color="primary"]) {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}

:deep(.v-card[color="success"]) {
  background: linear-gradient(135deg, #388e3c 0%, #66bb6a 100%);
}

:deep(.v-card[color="warning"]) {
  background: linear-gradient(135deg, #f57c00 0%, #ffb74d 100%);
}
</style>