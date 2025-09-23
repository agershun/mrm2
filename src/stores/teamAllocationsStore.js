import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { teamAllocationsApi } from '@/api/modules/teamAllocations'

export const useTeamAllocationsStore = defineStore('teamAllocations', () => {
  // State
  const allocations = ref([])
  const currentAllocation = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const stats = ref({})

  // Getters
  const allocationsByTeam = computed(() => {
    const grouped = {}
    allocations.value.forEach(allocation => {
      if (!grouped[allocation.team_id]) {
        grouped[allocation.team_id] = []
      }
      grouped[allocation.team_id].push(allocation)
    })
    return grouped
  })

  const allocationsByProduct = computed(() => {
    const grouped = {}
    allocations.value.forEach(allocation => {
      if (allocation.product_id) {
        if (!grouped[allocation.product_id]) {
          grouped[allocation.product_id] = []
        }
        grouped[allocation.product_id].push(allocation)
      }
    })
    return grouped
  })

  const allocationsByType = computed(() => {
    const grouped = {}
    allocations.value.forEach(allocation => {
      if (!grouped[allocation.allocation_type]) {
        grouped[allocation.allocation_type] = []
      }
      grouped[allocation.allocation_type].push(allocation)
    })
    return grouped
  })

  const getCurrentAllocations = computed(() => {
    const now = new Date()
    return allocations.value.filter(allocation => {
      const start = new Date(allocation.period_start)
      const end = new Date(allocation.period_end)
      return start <= now && now <= end
    })
  })

  const getFutureAllocations = computed(() => {
    const now = new Date()
    return allocations.value.filter(allocation => {
      const start = new Date(allocation.period_start)
      return start > now
    })
  })

  const getTotalFTE = computed(() => {
    return getCurrentAllocations.value.reduce((total, allocation) => total + allocation.fte_allocated, 0)
  })

  const getTotalMonthlyCost = computed(() => {
    return getCurrentAllocations.value.reduce((total, allocation) => total + allocation.cost_per_month, 0)
  })

  const getAllocationById = computed(() => {
    return (allocationId) => allocations.value.find(a => a.allocation_id === allocationId)
  })

  // Actions
  const fetchAllocations = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await teamAllocationsApi.getTeamAllocations(filters)
      allocations.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAllocation = async (allocationId) => {
    loading.value = true
    error.value = null
    try {
      const response = await teamAllocationsApi.getTeamAllocation(allocationId)
      currentAllocation.value = response.data

      // Обновить аллокацию в списке, если она уже загружена
      const index = allocations.value.findIndex(a => a.allocation_id === allocationId)
      if (index !== -1) {
        allocations.value[index] = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAllocation = async (allocationData) => {
    loading.value = true
    error.value = null
    try {
      const response = await teamAllocationsApi.createTeamAllocation(allocationData)
      allocations.value.push(response.data)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAllocation = async (allocationId, updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await teamAllocationsApi.updateTeamAllocation(allocationId, updates)

      // Обновить аллокацию в списке
      const index = allocations.value.findIndex(a => a.allocation_id === allocationId)
      if (index !== -1) {
        allocations.value[index] = response.data
      }

      // Обновить текущую аллокацию, если это она
      if (currentAllocation.value?.allocation_id === allocationId) {
        currentAllocation.value = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAllocation = async (allocationId) => {
    loading.value = true
    error.value = null
    try {
      const response = await teamAllocationsApi.deleteTeamAllocation(allocationId)

      // Удалить аллокацию из списка
      const index = allocations.value.findIndex(a => a.allocation_id === allocationId)
      if (index !== -1) {
        allocations.value.splice(index, 1)
      }

      // Очистить текущую аллокацию, если это она
      if (currentAllocation.value?.allocation_id === allocationId) {
        currentAllocation.value = null
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAllocationsByTeam = async (teamId) => {
    loading.value = true
    error.value = null
    try {
      const response = await teamAllocationsApi.getAllocationsByTeam(teamId)

      // Обновить аллокации в основном списке
      response.data.forEach(allocation => {
        const index = allocations.value.findIndex(a => a.allocation_id === allocation.allocation_id)
        if (index === -1) {
          allocations.value.push(allocation)
        } else {
          allocations.value[index] = allocation
        }
      })

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAllocationsByProduct = async (productId) => {
    loading.value = true
    error.value = null
    try {
      const response = await teamAllocationsApi.getAllocationsByProduct(productId)

      // Обновить аллокации в основном списке
      response.data.forEach(allocation => {
        const index = allocations.value.findIndex(a => a.allocation_id === allocation.allocation_id)
        if (index === -1) {
          allocations.value.push(allocation)
        } else {
          allocations.value[index] = allocation
        }
      })

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTeamUtilization = async (teamId, periodStart, periodEnd) => {
    loading.value = true
    error.value = null
    try {
      const response = await teamAllocationsApi.getTeamUtilization(teamId, periodStart, periodEnd)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await teamAllocationsApi.getAllocationStats()
      stats.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const checkConflicts = async (teamId, periodStart, periodEnd, excludeAllocationId = null) => {
    loading.value = true
    error.value = null
    try {
      const response = await teamAllocationsApi.checkAllocationConflicts(
        teamId,
        periodStart,
        periodEnd,
        excludeAllocationId
      )
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  const getTeamUtilizationSummary = (teamId, period = 'current') => {
    let filteredAllocations = []

    if (period === 'current') {
      filteredAllocations = getCurrentAllocations.value.filter(a => a.team_id === teamId)
    } else if (period === 'future') {
      filteredAllocations = getFutureAllocations.value.filter(a => a.team_id === teamId)
    } else {
      filteredAllocations = allocations.value.filter(a => a.team_id === teamId)
    }

    return {
      total_fte: filteredAllocations.reduce((sum, a) => sum + a.fte_allocated, 0),
      total_cost: filteredAllocations.reduce((sum, a) => sum + a.cost_per_month, 0),
      allocations_count: filteredAllocations.length,
      by_type: filteredAllocations.reduce((grouped, allocation) => {
        if (!grouped[allocation.allocation_type]) {
          grouped[allocation.allocation_type] = { count: 0, fte: 0, cost: 0 }
        }
        grouped[allocation.allocation_type].count++
        grouped[allocation.allocation_type].fte += allocation.fte_allocated
        grouped[allocation.allocation_type].cost += allocation.cost_per_month
        return grouped
      }, {})
    }
  }

  const getProductResourceSummary = (productId) => {
    const productAllocations = allocationsByProduct.value[productId] || []

    return {
      total_fte: productAllocations.reduce((sum, a) => sum + a.fte_allocated, 0),
      total_cost: productAllocations.reduce((sum, a) => sum + a.cost_per_month, 0),
      teams_involved: [...new Set(productAllocations.map(a => a.team_id))],
      allocations_count: productAllocations.length
    }
  }

  // Utilities
  const clearError = () => {
    error.value = null
  }

  const setCurrentAllocation = (allocation) => {
    currentAllocation.value = allocation
  }

  const clearCurrentAllocation = () => {
    currentAllocation.value = null
  }

  const reset = () => {
    allocations.value = []
    currentAllocation.value = null
    loading.value = false
    error.value = null
    stats.value = {}
  }

  return {
    // State
    allocations,
    currentAllocation,
    loading,
    error,
    stats,

    // Getters
    allocationsByTeam,
    allocationsByProduct,
    allocationsByType,
    getCurrentAllocations,
    getFutureAllocations,
    getTotalFTE,
    getTotalMonthlyCost,
    getAllocationById,

    // Actions
    fetchAllocations,
    fetchAllocation,
    createAllocation,
    updateAllocation,
    deleteAllocation,
    fetchAllocationsByTeam,
    fetchAllocationsByProduct,
    fetchTeamUtilization,
    fetchStats,
    checkConflicts,

    // Utility functions
    getTeamUtilizationSummary,
    getProductResourceSummary,

    // Utilities
    clearError,
    setCurrentAllocation,
    clearCurrentAllocation,
    reset
  }
})