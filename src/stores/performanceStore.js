/**
 * Pinia store для работы с производительностью
 * Управляет PerformanceData, KPIs, ActivityKPIValues, FunnelStages, FunnelExceptions
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as performanceApi from '@/api/modules/performance'

export const usePerformanceStore = defineStore('performance', () => {
  // State
  const performanceData = ref([])
  const kpis = ref([])
  const activityKpiValues = ref([])
  const funnelStages = ref([])
  const funnelExceptions = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const performanceByChannel = computed(() => {
    const grouped = {}
    performanceData.value.forEach(item => {
      if (!grouped[item.channel]) {
        grouped[item.channel] = []
      }
      grouped[item.channel].push(item)
    })
    return grouped
  })

  const performanceByActivity = computed(() => {
    const grouped = {}
    performanceData.value.forEach(item => {
      if (!grouped[item.activity_id]) {
        grouped[item.activity_id] = []
      }
      grouped[item.activity_id].push(item)
    })
    return grouped
  })

  const totalMetrics = computed(() => {
    return performanceData.value.reduce((totals, item) => {
      totals.impressions += item.impressions || 0
      totals.clicks += item.clicks || 0
      totals.conversions += item.conversions || 0
      totals.revenue += item.revenue || 0
      totals.cost += item.cost || 0
      return totals
    }, {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      cost: 0
    })
  })

  const averageCTR = computed(() => {
    const total = totalMetrics.value
    return total.impressions > 0 ? (total.clicks / total.impressions * 100) : 0
  })

  const averageConversionRate = computed(() => {
    const total = totalMetrics.value
    return total.clicks > 0 ? (total.conversions / total.clicks * 100) : 0
  })

  const totalROI = computed(() => {
    const total = totalMetrics.value
    return total.cost > 0 ? ((total.revenue - total.cost) / total.cost * 100) : 0
  })

  const kpisByCategory = computed(() => {
    const grouped = {}
    kpis.value.forEach(kpi => {
      if (!grouped[kpi.category]) {
        grouped[kpi.category] = []
      }
      grouped[kpi.category].push(kpi)
    })
    return grouped
  })

  const activityKpiMap = computed(() => {
    const map = {}
    activityKpiValues.value.forEach(value => {
      if (!map[value.activity_id]) {
        map[value.activity_id] = {}
      }
      map[value.activity_id][value.kpi_id] = value
    })
    return map
  })

  const funnelStagesByActivity = computed(() => {
    const grouped = {}
    funnelStages.value.forEach(stage => {
      if (!grouped[stage.activity_id]) {
        grouped[stage.activity_id] = []
      }
      grouped[stage.activity_id].push(stage)
    })

    // Сортируем этапы по порядку
    Object.keys(grouped).forEach(activityId => {
      grouped[activityId].sort((a, b) => a.stage_order - b.stage_order)
    })

    return grouped
  })

  // Actions
  const fetchPerformanceData = async (filters = {}) => {
    try {
      isLoading.value = true
      error.value = null
      performanceData.value = await performanceApi.getPerformanceData(filters)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching performance data:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchKPIs = async () => {
    try {
      kpis.value = await performanceApi.getKPIs()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching KPIs:', err)
    }
  }

  const fetchActivityKPIValues = async (activityId) => {
    try {
      const values = await performanceApi.getActivityKPIValues(activityId)
      // Обновляем значения для конкретной активности
      activityKpiValues.value = activityKpiValues.value.filter(
        v => v.activity_id !== activityId
      )
      activityKpiValues.value.push(...values)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching activity KPI values:', err)
    }
  }

  const fetchFunnelStages = async (activityId) => {
    try {
      const stages = await performanceApi.getFunnelStages(activityId)
      // Обновляем этапы воронки для конкретной активности
      funnelStages.value = funnelStages.value.filter(
        s => s.activity_id !== activityId
      )
      funnelStages.value.push(...stages)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching funnel stages:', err)
    }
  }

  const updateKPIValue = async (activityId, kpiId, value) => {
    try {
      const updatedValue = await performanceApi.updateActivityKPIValue(
        activityId,
        kpiId,
        value
      )

      const existingIndex = activityKpiValues.value.findIndex(
        v => v.activity_id === activityId && v.kpi_id === kpiId
      )

      if (existingIndex !== -1) {
        activityKpiValues.value[existingIndex] = updatedValue
      } else {
        activityKpiValues.value.push(updatedValue)
      }

      return updatedValue
    } catch (err) {
      error.value = err.message
      console.error('Error updating KPI value:', err)
      throw err
    }
  }

  const createFunnelStage = async (activityId, stageData) => {
    try {
      const newStage = await performanceApi.createFunnelStage(activityId, stageData)
      funnelStages.value.push(newStage)
      return newStage
    } catch (err) {
      error.value = err.message
      console.error('Error creating funnel stage:', err)
      throw err
    }
  }

  const updateFunnelStage = async (stageId, stageData) => {
    try {
      const updatedStage = await performanceApi.updateFunnelStage(stageId, stageData)
      const index = funnelStages.value.findIndex(s => s.stage_id === stageId)
      if (index !== -1) {
        funnelStages.value[index] = updatedStage
      }
      return updatedStage
    } catch (err) {
      error.value = err.message
      console.error('Error updating funnel stage:', err)
      throw err
    }
  }

  const fetchFunnelExceptions = async (activityId = null) => {
    try {
      funnelExceptions.value = await performanceApi.getFunnelExceptions(activityId)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching funnel exceptions:', err)
    }
  }

  const generatePerformanceReport = async (filters = {}) => {
    try {
      isLoading.value = true
      return await performanceApi.generatePerformanceReport(filters)
    } catch (err) {
      error.value = err.message
      console.error('Error generating performance report:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const comparePerformance = async (activityIds, dateRange) => {
    try {
      return await performanceApi.compareActivityPerformance(activityIds, dateRange)
    } catch (err) {
      error.value = err.message
      console.error('Error comparing performance:', err)
      throw err
    }
  }

  const getFunnelConversion = (activityId) => {
    const stages = funnelStagesByActivity.value[activityId] || []
    if (stages.length === 0) return 0

    const firstStage = stages[0]
    const lastStage = stages[stages.length - 1]

    if (firstStage.users_count === 0) return 0
    return (lastStage.users_count / firstStage.users_count * 100)
  }

  const getChannelPerformance = (channel) => {
    return performanceByChannel.value[channel] || []
  }

  const getActivityPerformance = (activityId) => {
    return performanceByActivity.value[activityId] || []
  }

  const getActivityKPIs = (activityId) => {
    return activityKpiMap.value[activityId] || {}
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    performanceData.value = []
    kpis.value = []
    activityKpiValues.value = []
    funnelStages.value = []
    funnelExceptions.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    performanceData,
    kpis,
    activityKpiValues,
    funnelStages,
    funnelExceptions,
    isLoading,
    error,

    // Computed
    performanceByChannel,
    performanceByActivity,
    totalMetrics,
    averageCTR,
    averageConversionRate,
    totalROI,
    kpisByCategory,
    activityKpiMap,
    funnelStagesByActivity,

    // Actions
    fetchPerformanceData,
    fetchKPIs,
    fetchActivityKPIValues,
    fetchFunnelStages,
    updateKPIValue,
    createFunnelStage,
    updateFunnelStage,
    fetchFunnelExceptions,
    generatePerformanceReport,
    comparePerformance,
    getFunnelConversion,
    getChannelPerformance,
    getActivityPerformance,
    getActivityKPIs,
    clearError,
    resetStore
  }
})