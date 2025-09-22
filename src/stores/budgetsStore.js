import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useBudgetsStore = defineStore('budgets', () => {
  const appStore = useAppStore()

  // State
  const budgets = ref([])
  const budgetRequests = ref([])
  const selectedBudget = ref(null)
  const isLoading = ref(false)
  const currentView = ref('hierarchy') // 'hierarchy', 'rollup', 'requests'
  const filters = ref({})
  const expandedNodes = ref({})

  // Getters
  const budgetHierarchy = computed(() => {
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_budget_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.budget_id)
        }))
    }
    return buildTree(budgets.value)
  })

  const selectedBudgetData = computed(() => {
    if (!selectedBudget.value) return null
    return budgets.value.find(b => b.budget_id === selectedBudget.value)
  })

  const filteredBudgets = computed(() => {
    let filtered = budgets.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(budget =>
        budget.name.toLowerCase().includes(search) ||
        budget.description?.toLowerCase().includes(search)
      )
    }

    if (filters.value.type) {
      filtered = filtered.filter(budget => budget.type === filters.value.type)
    }

    if (filters.value.status) {
      filtered = filtered.filter(budget => budget.status === filters.value.status)
    }

    return filtered
  })

  const totalBudgetAmount = computed(() => {
    return budgets.value.reduce((sum, budget) => {
      return sum + (budget.total_amount || 0)
    }, 0)
  })

  const allocatedAmount = computed(() => {
    return budgets.value.reduce((sum, budget) => {
      return sum + (budget.allocated_amount || 0)
    }, 0)
  })

  const remainingAmount = computed(() => {
    return totalBudgetAmount.value - allocatedAmount.value
  })

  const pendingRequests = computed(() => {
    return budgetRequests.value.filter(request => request.status === 'pending')
  })

  // Actions
  const fetchBudgets = async (filterParams = {}) => {
    try {
      isLoading.value = true
      console.log('[BudgetsStore] Fetching budgets...')
      const data = await api.budgets.getBudgetHierarchy(filterParams)
      console.log('[BudgetsStore] Received budgets:', data)
      budgets.value = data || []
      console.log('[BudgetsStore] Budgets loaded:', budgets.value.length)
    } catch (error) {
      console.error('[BudgetsStore] Error fetching budgets:', error)
      appStore.showError('Ошибка загрузки бюджетов: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchBudgetRequests = async () => {
    try {
      console.log('[BudgetsStore] Fetching budget requests...')
      const data = await api.budgets.getBudgetRequests()
      console.log('[BudgetsStore] Received budget requests:', data)
      budgetRequests.value = data || []
    } catch (error) {
      console.error('[BudgetsStore] Error fetching budget requests:', error)
      appStore.showError('Ошибка загрузки запросов бюджета: ' + error.message)
    }
  }

  const selectBudget = (budgetId) => {
    selectedBudget.value = budgetId
  }

  const createBudgetFolder = async (folderData) => {
    try {
      isLoading.value = true
      console.log('[BudgetsStore] Creating budget folder:', folderData)
      const newFolder = await api.budgets.createBudgetFolder(folderData)
      budgets.value.push(newFolder)
      appStore.showSuccess('Папка бюджета создана успешно')
      return newFolder
    } catch (error) {
      console.error('[BudgetsStore] Error creating budget folder:', error)
      appStore.showError('Ошибка создания папки бюджета: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createInvestmentPlan = async (planData) => {
    try {
      isLoading.value = true
      console.log('[BudgetsStore] Creating investment plan:', planData)
      const newPlan = await api.budgets.createInvestmentPlan(planData)
      budgets.value.push(newPlan)
      appStore.showSuccess('План инвестиций создан успешно')
      return newPlan
    } catch (error) {
      console.error('[BudgetsStore] Error creating investment plan:', error)
      appStore.showError('Ошибка создания плана инвестиций: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateBudget = async (budgetId, updateData) => {
    try {
      isLoading.value = true
      const updatedBudget = await api.budgets.updateBudgetHierarchyItem(budgetId, updateData)

      const index = budgets.value.findIndex(b => b.budget_id === budgetId)
      if (index !== -1) {
        budgets.value[index] = { ...budgets.value[index], ...updatedBudget }
      }

      appStore.showSuccess('Бюджет обновлен успешно')
      return updatedBudget
    } catch (error) {
      console.error('[BudgetsStore] Error updating budget:', error)
      appStore.showError('Ошибка обновления бюджета: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteBudget = async (budgetId) => {
    try {
      isLoading.value = true
      await api.budgets.deleteBudgetHierarchyItem(budgetId)

      budgets.value = budgets.value.filter(b => b.budget_id !== budgetId)

      if (selectedBudget.value === budgetId) {
        selectedBudget.value = null
      }

      appStore.showSuccess('Бюджет удален')
    } catch (error) {
      console.error('[BudgetsStore] Error deleting budget:', error)
      appStore.showError('Ошибка удаления бюджета: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createBudgetRequest = async (requestData) => {
    try {
      isLoading.value = true
      const newRequest = await api.budgets.createBudgetRequest(requestData)
      budgetRequests.value.push(newRequest)
      appStore.showSuccess('Запрос на бюджет создан')
      return newRequest
    } catch (error) {
      console.error('[BudgetsStore] Error creating budget request:', error)
      appStore.showError('Ошибка создания запроса на бюджет: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const approveBudgetRequest = async (requestId) => {
    try {
      await api.budgets.approveBudgetRequest(requestId)

      const request = budgetRequests.value.find(r => r.request_id === requestId)
      if (request) {
        request.status = 'approved'
        request.approved_date = new Date().toISOString()
      }

      appStore.showSuccess('Запрос на бюджет одобрен')
    } catch (error) {
      console.error('[BudgetsStore] Error approving budget request:', error)
      appStore.showError('Ошибка одобрения запроса: ' + error.message)
      throw error
    }
  }

  const rejectBudgetRequest = async (requestId, reason = '') => {
    try {
      await api.budgets.rejectBudgetRequest(requestId, reason)

      const request = budgetRequests.value.find(r => r.request_id === requestId)
      if (request) {
        request.status = 'rejected'
        request.rejection_reason = reason
      }

      appStore.showSuccess('Запрос на бюджет отклонен')
    } catch (error) {
      console.error('[BudgetsStore] Error rejecting budget request:', error)
      appStore.showError('Ошибка отклонения запроса: ' + error.message)
      throw error
    }
  }

  const fetchRollupData = async (budgetId) => {
    try {
      console.log('[BudgetsStore] Fetching rollup data for budget:', budgetId)
      const rollupData = await api.budgets.getBudgetRollup(budgetId)
      return rollupData
    } catch (error) {
      console.error('[BudgetsStore] Error fetching rollup data:', error)
      appStore.showError('Ошибка загрузки сводных данных: ' + error.message)
      throw error
    }
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

  const toggleNode = (nodeId) => {
    expandedNodes.value[nodeId] = !expandedNodes.value[nodeId]
  }

  const expandAllNodes = () => {
    budgets.value.forEach(budget => {
      expandedNodes.value[budget.budget_id] = true
    })
  }

  const collapseAllNodes = () => {
    expandedNodes.value = {}
  }

  const searchBudgets = async (keyword) => {
    if (!keyword?.trim()) {
      await fetchBudgets()
      return
    }

    try {
      isLoading.value = true
      const results = await api.budgets.searchBudgets(keyword)
      budgets.value = results || []
    } catch (error) {
      console.error('[BudgetsStore] Error searching budgets:', error)
      appStore.showError('Ошибка поиска: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  // Инициализация
  const initialize = async () => {
    console.log('[BudgetsStore] Initializing...')
    try {
      await Promise.all([
        fetchBudgets(),
        fetchBudgetRequests()
      ])
      console.log('[BudgetsStore] Initialization completed successfully')
      console.log('[BudgetsStore] Budgets count:', budgets.value.length)
      console.log('[BudgetsStore] Budget requests count:', budgetRequests.value.length)
    } catch (error) {
      console.error('[BudgetsStore] Initialization failed:', error)
    }
  }

  return {
    // State
    budgets,
    budgetRequests,
    selectedBudget,
    isLoading,
    currentView,
    filters,
    expandedNodes,

    // Getters
    budgetHierarchy,
    selectedBudgetData,
    filteredBudgets,
    totalBudgetAmount,
    allocatedAmount,
    remainingAmount,
    pendingRequests,

    // Actions
    fetchBudgets,
    fetchBudgetRequests,
    selectBudget,
    createBudgetFolder,
    createInvestmentPlan,
    updateBudget,
    deleteBudget,
    createBudgetRequest,
    approveBudgetRequest,
    rejectBudgetRequest,
    fetchRollupData,
    setView,
    setFilters,
    clearFilters,
    toggleNode,
    expandAllNodes,
    collapseAllNodes,
    searchBudgets,
    initialize
  }
})