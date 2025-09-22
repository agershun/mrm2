import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useInvestmentsStore = defineStore('investments', () => {
  const appStore = useAppStore()

  // State
  const investments = ref([])
  const investmentValues = ref([])
  const manualAllocations = ref([])
  const activityInvestments = ref([])
  const selectedInvestment = ref(null)
  const isLoading = ref(false)
  const currentView = ref('planning') // 'planning', 'allocation', 'dashboard', 'forecast'
  const filters = ref({})
  const selectedPeriod = ref('current') // 'current', 'next', 'all'
  const allocationMode = ref('auto') // 'auto', 'manual', 'hybrid'

  // Getters
  const totalInvestmentBudget = computed(() => {
    return investments.value.reduce((sum, investment) => {
      return sum + (investment.total_budget || 0)
    }, 0)
  })

  const allocatedBudget = computed(() => {
    return investments.value.reduce((sum, investment) => {
      return sum + (investment.allocated_amount || 0)
    }, 0)
  })

  const pendingBudget = computed(() => {
    return totalInvestmentBudget.value - allocatedBudget.value
  })

  const activeInvestments = computed(() => {
    return investments.value.filter(investment => investment.status === 'Active')
  })

  const investmentsByType = computed(() => {
    const grouped = {}
    investments.value.forEach(investment => {
      const type = investment.investment_type || 'Other'
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(investment)
    })
    return grouped
  })

  const filteredInvestments = computed(() => {
    let filtered = investments.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(investment =>
        investment.name.toLowerCase().includes(search) ||
        investment.description?.toLowerCase().includes(search)
      )
    }

    if (filters.value.type) {
      filtered = filtered.filter(investment => investment.investment_type === filters.value.type)
    }

    if (filters.value.status) {
      filtered = filtered.filter(investment => investment.status === filters.value.status)
    }

    if (filters.value.period && filters.value.period !== 'all') {
      const currentYear = new Date().getFullYear()
      const targetYear = filters.value.period === 'current' ? currentYear : currentYear + 1
      filtered = filtered.filter(investment =>
        new Date(investment.start_date).getFullYear() === targetYear
      )
    }

    return filtered
  })

  const investmentTrends = computed(() => {
    // Группировка инвестиций по месяцам для трендов
    const trends = {}
    investmentValues.value.forEach(value => {
      const month = value.value_date.substring(0, 7) // YYYY-MM
      if (!trends[month]) {
        trends[month] = {
          month,
          planned: 0,
          actual: 0,
          committed: 0
        }
      }
      trends[month].planned += value.planned_value || 0
      trends[month].actual += value.actual_value || 0
      trends[month].committed += value.committed_value || 0
    })
    return Object.values(trends).sort((a, b) => a.month.localeCompare(b.month))
  })

  const allocationEfficiency = computed(() => {
    if (allocatedBudget.value === 0) return 0
    const actualSpent = investments.value.reduce((sum, inv) => sum + (inv.actual_spent || 0), 0)
    return Math.round((actualSpent / allocatedBudget.value) * 100)
  })

  const selectedInvestmentData = computed(() => {
    if (!selectedInvestment.value) return null
    return investments.value.find(inv => inv.investment_id === selectedInvestment.value)
  })

  // Actions
  const fetchInvestments = async (filterParams = {}) => {
    try {
      isLoading.value = true
      console.log('[InvestmentsStore] Fetching investments...')
      const data = await api.investments.getInvestments(filterParams)
      console.log('[InvestmentsStore] Received investments:', data)
      investments.value = data || []
    } catch (error) {
      console.error('[InvestmentsStore] Error fetching investments:', error)
      appStore.showError('Ошибка загрузки инвестиций: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchInvestmentValues = async (investmentId) => {
    try {
      console.log('[InvestmentsStore] Fetching investment values for:', investmentId)
      const data = await api.investments.getInvestmentValues(investmentId)
      console.log('[InvestmentsStore] Received investment values:', data)

      if (investmentId) {
        // Фильтруем значения для конкретной инвестиции
        investmentValues.value = investmentValues.value.filter(v => v.investment_id !== investmentId)
        investmentValues.value.push(...data)
      } else {
        investmentValues.value = data || []
      }
    } catch (error) {
      console.error('[InvestmentsStore] Error fetching investment values:', error)
      appStore.showError('Ошибка загрузки данных инвестиций: ' + error.message)
    }
  }

  const fetchManualAllocations = async () => {
    try {
      console.log('[InvestmentsStore] Fetching manual allocations...')
      const data = await api.investments.getManualAllocations()
      console.log('[InvestmentsStore] Received manual allocations:', data)
      manualAllocations.value = data || []
    } catch (error) {
      console.error('[InvestmentsStore] Error fetching manual allocations:', error)
      appStore.showError('Ошибка загрузки ручных распределений: ' + error.message)
    }
  }

  const fetchActivityInvestments = async (activityId) => {
    try {
      console.log('[InvestmentsStore] Fetching activity investments for:', activityId)
      const data = await api.investments.getActivityInvestments(activityId)
      console.log('[InvestmentsStore] Received activity investments:', data)

      if (activityId) {
        // Фильтруем связи для конкретной активности
        activityInvestments.value = activityInvestments.value.filter(ai => ai.activity_id !== activityId)
        activityInvestments.value.push(...data)
      } else {
        activityInvestments.value = data || []
      }
    } catch (error) {
      console.error('[InvestmentsStore] Error fetching activity investments:', error)
      appStore.showError('Ошибка загрузки связей активностей и инвестиций: ' + error.message)
    }
  }

  const createInvestment = async (investmentData) => {
    try {
      isLoading.value = true
      console.log('[InvestmentsStore] Creating investment:', investmentData)
      const newInvestment = await api.investments.createInvestment(investmentData)
      investments.value.push(newInvestment)
      appStore.showSuccess('Инвестиция создана успешно')
      return newInvestment
    } catch (error) {
      console.error('[InvestmentsStore] Error creating investment:', error)
      appStore.showError('Ошибка создания инвестиции: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateInvestment = async (investmentId, updateData) => {
    try {
      isLoading.value = true
      const updatedInvestment = await api.investments.updateInvestment(investmentId, updateData)

      const index = investments.value.findIndex(inv => inv.investment_id === investmentId)
      if (index !== -1) {
        investments.value[index] = { ...investments.value[index], ...updatedInvestment }
      }

      appStore.showSuccess('Инвестиция обновлена успешно')
      return updatedInvestment
    } catch (error) {
      console.error('[InvestmentsStore] Error updating investment:', error)
      appStore.showError('Ошибка обновления инвестиции: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteInvestment = async (investmentId) => {
    try {
      isLoading.value = true
      await api.investments.deleteInvestment(investmentId)

      investments.value = investments.value.filter(inv => inv.investment_id !== investmentId)

      if (selectedInvestment.value === investmentId) {
        selectedInvestment.value = null
      }

      appStore.showSuccess('Инвестиция удалена')
    } catch (error) {
      console.error('[InvestmentsStore] Error deleting investment:', error)
      appStore.showError('Ошибка удаления инвестиции: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createManualAllocation = async (allocationData) => {
    try {
      isLoading.value = true
      console.log('[InvestmentsStore] Creating manual allocation:', allocationData)
      const newAllocation = await api.investments.createManualAllocation(allocationData)
      manualAllocations.value.push(newAllocation)
      appStore.showSuccess('Ручное распределение создано')
      return newAllocation
    } catch (error) {
      console.error('[InvestmentsStore] Error creating manual allocation:', error)
      appStore.showError('Ошибка создания ручного распределения: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const linkActivityToInvestment = async (activityId, investmentId, allocation) => {
    try {
      const linkData = {
        activity_id: activityId,
        investment_id: investmentId,
        allocation_percentage: allocation
      }

      const newLink = await api.investments.linkActivityToInvestment(linkData)
      activityInvestments.value.push(newLink)
      appStore.showSuccess('Активность связана с инвестицией')
      return newLink
    } catch (error) {
      console.error('[InvestmentsStore] Error linking activity to investment:', error)
      appStore.showError('Ошибка связывания активности с инвестицией: ' + error.message)
      throw error
    }
  }

  const unlinkActivityFromInvestment = async (linkId) => {
    try {
      await api.investments.unlinkActivityFromInvestment(linkId)
      activityInvestments.value = activityInvestments.value.filter(link => link.link_id !== linkId)
      appStore.showSuccess('Связь удалена')
    } catch (error) {
      console.error('[InvestmentsStore] Error unlinking activity from investment:', error)
      appStore.showError('Ошибка удаления связи: ' + error.message)
      throw error
    }
  }

  const calculateROI = async (investmentId) => {
    try {
      console.log('[InvestmentsStore] Calculating ROI for investment:', investmentId)
      const roiData = await api.investments.calculateROI(investmentId)
      return roiData
    } catch (error) {
      console.error('[InvestmentsStore] Error calculating ROI:', error)
      appStore.showError('Ошибка расчета ROI: ' + error.message)
      throw error
    }
  }

  const generateForecast = async (params = {}) => {
    try {
      console.log('[InvestmentsStore] Generating investment forecast:', params)
      const forecastData = await api.investments.generateForecast(params)
      return forecastData
    } catch (error) {
      console.error('[InvestmentsStore] Error generating forecast:', error)
      appStore.showError('Ошибка генерации прогноза: ' + error.message)
      throw error
    }
  }

  const optimizeAllocation = async (optimizationParams) => {
    try {
      isLoading.value = true
      console.log('[InvestmentsStore] Optimizing allocation:', optimizationParams)
      const optimization = await api.investments.optimizeAllocation(optimizationParams)
      appStore.showSuccess('Оптимизация распределения завершена')
      return optimization
    } catch (error) {
      console.error('[InvestmentsStore] Error optimizing allocation:', error)
      appStore.showError('Ошибка оптимизации распределения: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const selectInvestment = (investmentId) => {
    selectedInvestment.value = investmentId
  }

  const setView = (view) => {
    currentView.value = view
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const setPeriod = (period) => {
    selectedPeriod.value = period
    setFilters({ period })
  }

  const setAllocationMode = (mode) => {
    allocationMode.value = mode
  }

  const searchInvestments = async (keyword) => {
    if (!keyword?.trim()) {
      await fetchInvestments()
      return
    }

    try {
      isLoading.value = true
      const results = await api.investments.searchInvestments(keyword)
      investments.value = results || []
    } catch (error) {
      console.error('[InvestmentsStore] Error searching investments:', error)
      appStore.showError('Ошибка поиска: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  // Инициализация
  const initialize = async () => {
    console.log('[InvestmentsStore] Initializing...')
    try {
      await Promise.all([
        fetchInvestments(),
        fetchInvestmentValues(),
        fetchManualAllocations(),
        fetchActivityInvestments()
      ])
      console.log('[InvestmentsStore] Initialization completed successfully')
      console.log('[InvestmentsStore] Investments count:', investments.value.length)
      console.log('[InvestmentsStore] Investment values count:', investmentValues.value.length)
      console.log('[InvestmentsStore] Manual allocations count:', manualAllocations.value.length)
      console.log('[InvestmentsStore] Activity investments count:', activityInvestments.value.length)
    } catch (error) {
      console.error('[InvestmentsStore] Initialization failed:', error)
    }
  }

  return {
    // State
    investments,
    investmentValues,
    manualAllocations,
    activityInvestments,
    selectedInvestment,
    isLoading,
    currentView,
    filters,
    selectedPeriod,
    allocationMode,

    // Getters
    totalInvestmentBudget,
    allocatedBudget,
    pendingBudget,
    activeInvestments,
    investmentsByType,
    filteredInvestments,
    investmentTrends,
    allocationEfficiency,
    selectedInvestmentData,

    // Actions
    fetchInvestments,
    fetchInvestmentValues,
    fetchManualAllocations,
    fetchActivityInvestments,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    createManualAllocation,
    linkActivityToInvestment,
    unlinkActivityFromInvestment,
    calculateROI,
    generateForecast,
    optimizeAllocation,
    selectInvestment,
    setView,
    setFilters,
    clearFilters,
    setPeriod,
    setAllocationMode,
    searchInvestments,
    initialize
  }
})