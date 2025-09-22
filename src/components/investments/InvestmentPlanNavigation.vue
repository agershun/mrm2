<template>
  <div class="investment-plan-navigation">
    <v-autocomplete
      v-model="selectedPlan"
      :items="availablePlans"
      :loading="isLoading"
      item-title="name"
      item-value="investment_plan_id"
      label="Выберите план инвестиций"
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="mdi-briefcase-outline"
      clearable
      no-filter
      @update:search="onSearchUpdate"
      @update:model-value="onPlanChange"
      class="investment-plan-selector"
    >
      <template #prepend-item>
        <div class="pa-3 border-bottom">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Поиск планов..."
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </div>
      </template>

      <template #item="{ props, item }">
        <v-list-item v-bind="props" class="plan-item">
          <template #prepend>
            <v-avatar size="32" :color="getPlanStatusColor(item.raw.status)">
              <v-icon color="white" size="16">
                {{ getPlanStatusIcon(item.raw.status) }}
              </v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ item.raw.name }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ item.raw.description || 'Без описания' }}
          </v-list-item-subtitle>

          <template #append>
            <div class="text-end">
              <v-chip
                :color="getPlanStatusColor(item.raw.status)"
                size="small"
                variant="flat"
                class="mb-1"
              >
                {{ getPlanStatusText(item.raw.status) }}
              </v-chip>
              <div class="text-caption text-medium-emphasis">
                {{ formatCurrency(item.raw.total_budget || 0) }}
              </div>
            </div>
          </template>
        </v-list-item>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <v-icon icon="mdi-briefcase-search" size="48" color="grey-lighten-2" class="mb-2"/>
          <div class="text-body-2 text-medium-emphasis">
            {{ searchQuery ? 'Планы не найдены' : 'Загрузка планов...' }}
          </div>
        </div>
      </template>

      <template #append-inner>
        <v-menu v-if="selectedPlanData" offset-y>
          <template #activator="{ props }">
            <v-btn
              icon="mdi-information"
              size="small"
              variant="text"
              v-bind="props"
              :disabled="!selectedPlanData"
            />
          </template>
          <v-card min-width="300">
            <v-card-text class="pa-3">
              <div class="d-flex align-center mb-2">
                <v-avatar size="24" :color="getPlanStatusColor(selectedPlanData.status)" class="me-2">
                  <v-icon color="white" size="12">
                    {{ getPlanStatusIcon(selectedPlanData.status) }}
                  </v-icon>
                </v-avatar>
                <span class="text-body-2 font-weight-medium">{{ selectedPlanData.name }}</span>
              </div>
              <div class="text-caption text-medium-emphasis mb-2">
                {{ selectedPlanData.description || 'Без описания' }}
              </div>
              <v-divider class="my-2"/>
              <div class="text-caption">
                <div class="d-flex justify-space-between mb-1">
                  <span>Общий бюджет:</span>
                  <span class="font-weight-medium">{{ formatCurrency(selectedPlanData.total_budget || 0) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-1">
                  <span>Валюта:</span>
                  <span class="font-weight-medium">{{ selectedPlanData.currency_code || 'RUB' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-1">
                  <span>Статус:</span>
                  <v-chip size="x-small" :color="getPlanStatusColor(selectedPlanData.status)">
                    {{ getPlanStatusText(selectedPlanData.status) }}
                  </v-chip>
                </div>
                <div class="d-flex justify-space-between">
                  <span>Последнее обновление:</span>
                  <span class="font-weight-medium">{{ formatDate(selectedPlanData.updated_at) }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-autocomplete>

    <!-- Быстрые действия -->
    <div v-if="selectedPlanData" class="quick-actions mt-2">
      <v-chip-group>
        <v-chip
          size="small"
          variant="outlined"
          prepend-icon="mdi-clock"
        >
          Последний визит: {{ formatRelativeTime(lastVisitTime) }}
        </v-chip>
        <v-chip
          size="small"
          variant="outlined"
          prepend-icon="mdi-account"
        >
          Участников: {{ selectedPlanData.participants_count || 0 }}
        </v-chip>
        <v-chip
          v-if="selectedPlanData.has_pending_approvals"
          size="small"
          color="warning"
          prepend-icon="mdi-clock-alert"
        >
          Ожидают утверждения
        </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useInvestmentsStore } from '@/stores/investmentsStore'
import { usePermissions } from '@/composables/usePermissions'
import api from '@/api'

// Props
const props = defineProps({
  dense: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['plan-changed'])

// Stores
const investmentsStore = useInvestmentsStore()
const { canRead } = usePermissions()

// Reactive data
const selectedPlan = ref(null)
const searchQuery = ref('')
const isLoading = ref(false)
const lastVisitTime = ref(null)
const investmentPlans = ref([])

// Computed properties
const availablePlans = computed(() => {
  let plans = investmentPlans.value.filter(plan => canRead('investments'))

  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    plans = plans.filter(plan =>
      plan.name.toLowerCase().includes(search) ||
      plan.description?.toLowerCase().includes(search)
    )
  }

  return plans.sort((a, b) => {
    // Сортировка: активные сверху, затем по дате обновления
    const statusOrder = { active: 0, approved: 1, planning: 2, draft: 3, on_hold: 4 }
    const aOrder = statusOrder[a.status] || 5
    const bOrder = statusOrder[b.status] || 5

    if (aOrder !== bOrder) return aOrder - bOrder
    return new Date(b.updated_at) - new Date(a.updated_at)
  })
})

const selectedPlanData = computed(() => {
  return availablePlans.value.find(plan => plan.investment_plan_id === selectedPlan.value)
})

// Methods
const onSearchUpdate = (value) => {
  searchQuery.value = value
}

const onPlanChange = (planId) => {
  if (planId) {
    const plan = availablePlans.value.find(p => p.investment_plan_id === planId)
    if (plan) {
      // Сохраняем выбранный план в localStorage
      localStorage.setItem('lastSelectedInvestmentPlan', planId)
      localStorage.setItem('lastInvestmentPlanVisit', new Date().toISOString())

      // Обновляем время последнего визита
      lastVisitTime.value = new Date()

      // Эмитим событие изменения плана
      emit('plan-changed', plan)

      // Обновляем store если нужно
      if (investmentsStore.setSelectedPlan) {
        investmentsStore.setSelectedPlan(plan)
      }
    }
  }
}

const getPlanStatusColor = (status) => {
  const colors = {
    active: 'success',
    approved: 'info',
    planning: 'warning',
    draft: 'grey',
    on_hold: 'error'
  }
  return colors[status] || 'grey'
}

const getPlanStatusIcon = (status) => {
  const icons = {
    active: 'mdi-play',
    approved: 'mdi-check',
    planning: 'mdi-clock',
    draft: 'mdi-file-document-edit',
    on_hold: 'mdi-pause'
  }
  return icons[status] || 'mdi-help'
}

const getPlanStatusText = (status) => {
  const texts = {
    active: 'Активный',
    approved: 'Утвержден',
    planning: 'Планирование',
    draft: 'Черновик',
    on_hold: 'Приостановлен'
  }
  return texts[status] || status
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU')
}

const formatRelativeTime = (date) => {
  if (!date) return 'никогда'

  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 60) return `${minutes} мин назад`
  if (hours < 24) return `${hours} ч назад`
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} дн назад`
  return formatDate(date)
}

const loadInvestmentPlans = async () => {
  try {
    isLoading.value = true
    const data = await api.investments.getInvestmentPlans()
    investmentPlans.value = data || []
  } catch (error) {
    console.error('Error loading investment plans:', error)
  } finally {
    isLoading.value = false
  }
}

const loadLastSelectedPlan = () => {
  const lastPlanId = localStorage.getItem('lastSelectedInvestmentPlan')
  const lastVisit = localStorage.getItem('lastInvestmentPlanVisit')

  if (lastPlanId && availablePlans.value.find(p => p.investment_plan_id === lastPlanId)) {
    selectedPlan.value = lastPlanId
    lastVisitTime.value = lastVisit ? new Date(lastVisit) : null
  } else if (availablePlans.value.length > 0) {
    // Выбираем первый активный план по умолчанию
    const activePlan = availablePlans.value.find(p => p.status === 'active')
    selectedPlan.value = activePlan?.investment_plan_id || availablePlans.value[0]?.investment_plan_id
  }
}

// Watchers
watch(selectedPlan, (newPlanId) => {
  if (newPlanId) {
    onPlanChange(newPlanId)
  }
}, { immediate: false })

// Lifecycle
onMounted(async () => {
  await loadInvestmentPlans()
  loadLastSelectedPlan()
})

// Expose methods for parent components
defineExpose({
  selectedPlan: selectedPlan,
  selectedPlanData: selectedPlanData,
  refreshPlans: loadInvestmentPlans
})
</script>

<style scoped>
.investment-plan-navigation {
  min-width: 300px;
  max-width: 500px;
}

.investment-plan-selector {
  /* Стилизация селектора */
}

.plan-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.quick-actions {
  /* Стили для быстрых действий */
}
</style>