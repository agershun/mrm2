import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as objectivesAPI from '@/api/modules/objectives'
import * as kpisAPI from '@/api/modules/kpis'

export const useStrategyStore = defineStore('strategy', () => {
  // State
  const objectives = ref([])
  const kpis = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const selectedObjective = ref(null)
  const selectedKPI = ref(null)
  const currentPeriod = ref('current')
  const currentView = ref('overview')

  // Filters
  const filters = ref({
    period: 'all',
    type: 'all',
    status: 'all',
    owner: 'all'
  })

  // Computed
  const filteredObjectives = computed(() => {
    let filtered = objectives.value

    if (filters.value.period !== 'all') {
      filtered = filtered.filter(obj => obj.period === filters.value.period)
    }

    if (filters.value.type !== 'all') {
      filtered = filtered.filter(obj => obj.type === filters.value.type)
    }

    if (filters.value.status !== 'all') {
      filtered = filtered.filter(obj => obj.status === filters.value.status)
    }

    if (filters.value.owner !== 'all') {
      filtered = filtered.filter(obj => obj.owner === filters.value.owner)
    }

    return filtered
  })

  const filteredKPIs = computed(() => {
    let filtered = kpis.value

    if (filters.value.period !== 'all') {
      filtered = filtered.filter(kpi => kpi.period === filters.value.period)
    }

    if (filters.value.type !== 'all') {
      filtered = filtered.filter(kpi => kpi.type === filters.value.type)
    }

    if (filters.value.status !== 'all') {
      filtered = filtered.filter(kpi => kpi.status === filters.value.status)
    }

    if (filters.value.owner !== 'all') {
      filtered = filtered.filter(kpi => kpi.owner === filters.value.owner)
    }

    return filtered
  })

  const objectivesByPeriod = computed(() => {
    const grouped = {}
    objectives.value.forEach(obj => {
      const period = obj.period || 'other'
      if (!grouped[period]) {
        grouped[period] = []
      }
      grouped[period].push(obj)
    })
    return grouped
  })

  const kpisByPeriod = computed(() => {
    const grouped = {}
    kpis.value.forEach(kpi => {
      const period = kpi.period || 'other'
      if (!grouped[period]) {
        grouped[period] = []
      }
      grouped[period].push(kpi)
    })
    return grouped
  })

  const strategicProgress = computed(() => {
    if (objectives.value.length === 0) return 0

    const completedObjectives = objectives.value.filter(obj => obj.status === 'completed').length
    return Math.round((completedObjectives / objectives.value.length) * 100)
  })

  const kpiProgress = computed(() => {
    if (kpis.value.length === 0) return 0

    const achievedKPIs = kpis.value.filter(kpi => kpi.status === 'achieved').length
    return Math.round((achievedKPIs / kpis.value.length) * 100)
  })

  const overallProgress = computed(() => {
    return Math.round((strategicProgress.value + kpiProgress.value) / 2)
  })

  // Actions
  const initialize = async () => {
    try {
      isLoading.value = true
      await Promise.all([
        fetchObjectives(),
        fetchKPIs()
      ])
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchObjectives = async (params = {}) => {
    try {
      isLoading.value = true
      const response = await objectivesAPI.getObjectives(params)
      objectives.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchKPIs = async (params = {}) => {
    try {
      isLoading.value = true
      const response = await kpisAPI.getKPIs(params)
      kpis.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createObjective = async (objectiveData) => {
    try {
      isLoading.value = true
      const response = await objectivesAPI.createObjective(objectiveData)
      objectives.value.push(response.data)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateObjective = async (id, objectiveData) => {
    try {
      isLoading.value = true
      const response = await objectivesAPI.updateObjective(id, objectiveData)
      const index = objectives.value.findIndex(obj => obj.id === id)
      if (index > -1) {
        objectives.value[index] = response.data
      }
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteObjective = async (id) => {
    try {
      isLoading.value = true
      await objectivesAPI.deleteObjective(id)
      const index = objectives.value.findIndex(obj => obj.id === id)
      if (index > -1) {
        objectives.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createKPI = async (kpiData) => {
    try {
      isLoading.value = true
      const response = await kpisAPI.createKPI(kpiData)
      kpis.value.push(response.data)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateKPI = async (id, kpiData) => {
    try {
      isLoading.value = true
      const response = await kpisAPI.updateKPI(id, kpiData)
      const index = kpis.value.findIndex(kpi => kpi.id === id)
      if (index > -1) {
        kpis.value[index] = response.data
      }
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteKPI = async (id) => {
    try {
      isLoading.value = true
      await kpisAPI.deleteKPI(id)
      const index = kpis.value.findIndex(kpi => kpi.id === id)
      if (index > -1) {
        kpis.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const linkObjectiveToActivities = async (objectiveId, activityIds) => {
    try {
      const response = await objectivesAPI.linkToActivities(objectiveId, activityIds)
      // Обновляем локальные данные
      const objective = objectives.value.find(obj => obj.id === objectiveId)
      if (objective) {
        objective.linkedActivities = activityIds
      }
      return response
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const linkKPIToActivities = async (kpiId, activityIds) => {
    try {
      const response = await kpisAPI.linkToActivities(kpiId, activityIds)
      // Обновляем локальные данные
      const kpi = kpis.value.find(k => k.id === kpiId)
      if (kpi) {
        kpi.linkedActivities = activityIds
      }
      return response
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const getObjectivesByActivity = (activityId) => {
    return objectives.value.filter(obj =>
      obj.linkedActivities && obj.linkedActivities.includes(activityId)
    )
  }

  const getKPIsByActivity = (activityId) => {
    return kpis.value.filter(kpi =>
      kpi.linkedActivities && kpi.linkedActivities.includes(activityId)
    )
  }

  const getObjectivesByPeriodType = (period, type) => {
    return objectives.value.filter(obj =>
      obj.period === period && obj.type === type
    )
  }

  const getKPIsByPeriodType = (period, type) => {
    return kpis.value.filter(kpi =>
      kpi.period === period && kpi.type === type
    )
  }

  // Setters
  const setSelectedObjective = (objective) => {
    selectedObjective.value = objective
  }

  const setSelectedKPI = (kpi) => {
    selectedKPI.value = kpi
  }

  const setPeriod = (period) => {
    currentPeriod.value = period
  }

  const setView = (view) => {
    currentView.value = view
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      period: 'all',
      type: 'all',
      status: 'all',
      owner: 'all'
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    objectives,
    kpis,
    isLoading,
    error,
    selectedObjective,
    selectedKPI,
    currentPeriod,
    currentView,
    filters,

    // Computed
    filteredObjectives,
    filteredKPIs,
    objectivesByPeriod,
    kpisByPeriod,
    strategicProgress,
    kpiProgress,
    overallProgress,

    // Actions
    initialize,
    fetchObjectives,
    fetchKPIs,
    createObjective,
    updateObjective,
    deleteObjective,
    createKPI,
    updateKPI,
    deleteKPI,
    linkObjectiveToActivities,
    linkKPIToActivities,
    getObjectivesByActivity,
    getKPIsByActivity,
    getObjectivesByPeriodType,
    getKPIsByPeriodType,

    // Setters
    setSelectedObjective,
    setSelectedKPI,
    setPeriod,
    setView,
    setFilters,
    clearFilters,
    clearError
  }
})