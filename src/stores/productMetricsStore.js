import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productMetricsApi } from '@/api/modules/productMetrics'

export const useProductMetricsStore = defineStore('productMetrics', () => {
  // State
  const metrics = ref([])
  const currentMetric = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const dashboards = ref({})
  const trends = ref({})
  const comparisons = ref({})
  const alerts = ref([])
  const stats = ref({})

  // Getters
  const metricsByProduct = computed(() => {
    const grouped = {}
    metrics.value.forEach(metric => {
      if (!grouped[metric.product_id]) {
        grouped[metric.product_id] = []
      }
      grouped[metric.product_id].push(metric)
    })
    return grouped
  })

  const metricsByCategory = computed(() => {
    const grouped = {}
    metrics.value.forEach(metric => {
      if (!grouped[metric.metric_category]) {
        grouped[metric.metric_category] = []
      }
      grouped[metric.metric_category].push(metric)
    })
    return grouped
  })

  const metricsByPlatform = computed(() => {
    const grouped = {}
    metrics.value.forEach(metric => {
      if (!grouped[metric.platform]) {
        grouped[metric.platform] = []
      }
      grouped[metric.platform].push(metric)
    })
    return grouped
  })

  const metricsOnTarget = computed(() => {
    return metrics.value.filter(metric =>
      metric.target_value && metric.value >= metric.target_value
    )
  })

  const metricsBelowTarget = computed(() => {
    return metrics.value.filter(metric =>
      metric.target_value && metric.value < metric.target_value
    )
  })

  const topPerformingMetrics = computed(() => {
    return metrics.value
      .filter(metric => metric.target_value && metric.target_value > 0)
      .map(metric => ({
        ...metric,
        achievement_rate: metric.value / metric.target_value
      }))
      .sort((a, b) => b.achievement_rate - a.achievement_rate)
      .slice(0, 10)
  })

  const worstPerformingMetrics = computed(() => {
    return metrics.value
      .filter(metric => metric.target_value && metric.target_value > 0)
      .map(metric => ({
        ...metric,
        achievement_rate: metric.value / metric.target_value
      }))
      .sort((a, b) => a.achievement_rate - b.achievement_rate)
      .slice(0, 10)
  })

  const getMetricById = computed(() => {
    return (metricId) => metrics.value.find(m => m.metric_id === metricId)
  })

  const getMetricsForProduct = computed(() => {
    return (productId) => metricsByProduct.value[productId] || []
  })

  // Actions
  const fetchMetrics = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await productMetricsApi.getProductMetrics(filters)
      metrics.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchMetric = async (metricId) => {
    loading.value = true
    error.value = null
    try {
      const response = await productMetricsApi.getProductMetric(metricId)
      currentMetric.value = response.data

      // Обновить метрику в списке, если она уже загружена
      const index = metrics.value.findIndex(m => m.metric_id === metricId)
      if (index !== -1) {
        metrics.value[index] = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMetric = async (metricData) => {
    loading.value = true
    error.value = null
    try {
      const response = await productMetricsApi.createProductMetric(metricData)
      metrics.value.push(response.data)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMetric = async (metricId, updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await productMetricsApi.updateProductMetric(metricId, updates)

      // Обновить метрику в списке
      const index = metrics.value.findIndex(m => m.metric_id === metricId)
      if (index !== -1) {
        metrics.value[index] = response.data
      }

      // Обновить текущую метрику, если это она
      if (currentMetric.value?.metric_id === metricId) {
        currentMetric.value = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMetric = async (metricId) => {
    loading.value = true
    error.value = null
    try {
      const response = await productMetricsApi.deleteProductMetric(metricId)

      // Удалить метрику из списка
      const index = metrics.value.findIndex(m => m.metric_id === metricId)
      if (index !== -1) {
        metrics.value.splice(index, 1)
      }

      // Очистить текущую метрику, если это она
      if (currentMetric.value?.metric_id === metricId) {
        currentMetric.value = null
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchMetricsByProduct = async (productId) => {
    loading.value = true
    error.value = null
    try {
      const response = await productMetricsApi.getMetricsByProduct(productId)

      // Обновить метрики в основном списке
      response.data.forEach(metric => {
        const index = metrics.value.findIndex(m => m.metric_id === metric.metric_id)
        if (index === -1) {
          metrics.value.push(metric)
        } else {
          metrics.value[index] = metric
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

  const fetchMetricsByCategory = async (category) => {
    loading.value = true
    error.value = null
    try {
      const response = await productMetricsApi.getMetricsByCategory(category)

      // Обновить метрики в основном списке
      response.data.forEach(metric => {
        const index = metrics.value.findIndex(m => m.metric_id === metric.metric_id)
        if (index === -1) {
          metrics.value.push(metric)
        } else {
          metrics.value[index] = metric
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

  const fetchMetricTrends = async (productId, metricNames = [], periodDays = 30) => {
    loading.value = true
    error.value = null
    try {
      const response = await productMetricsApi.getProductMetricTrends(productId, metricNames, periodDays)
      trends.value[productId] = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchKPIDashboard = async (productId) => {
    loading.value = true
    error.value = null
    try {
      const response = await productMetricsApi.getProductKPIDashboard(productId)
      dashboards.value[productId] = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const compareProducts = async (productIds, metricNames = []) => {
    loading.value = true
    error.value = null
    try {
      const response = await productMetricsApi.compareProducts(productIds, metricNames)
      const comparisonKey = productIds.sort().join('-')
      comparisons.value[comparisonKey] = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAlerts = async (productId = null) => {
    loading.value = true
    error.value = null
    try {
      const response = await productMetricsApi.getMetricAlerts(productId)
      if (productId) {
        alerts.value = alerts.value.filter(alert => alert.product_id !== productId)
        alerts.value.push(...response.data)
      } else {
        alerts.value = response.data
      }
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
      const response = await productMetricsApi.getProductMetricsStats()
      stats.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  const getMetricAchievementRate = (metric) => {
    if (!metric.target_value || metric.target_value <= 0) return null
    return metric.value / metric.target_value
  }

  const getMetricStatus = (metric) => {
    const achievementRate = getMetricAchievementRate(metric)
    if (!achievementRate) return 'no-target'

    if (achievementRate >= 1) return 'on-target'
    if (achievementRate >= 0.8) return 'warning'
    return 'critical'
  }

  const getMetricTrend = (metric) => {
    if (!metric.previous_period_value || metric.previous_period_value <= 0) return null
    return (metric.value - metric.previous_period_value) / metric.previous_period_value
  }

  const filterMetricsByPerformance = (threshold = 0.8) => {
    return metrics.value.filter(metric => {
      const achievementRate = getMetricAchievementRate(metric)
      return achievementRate && achievementRate >= threshold
    })
  }

  const getProductPerformanceSummary = (productId) => {
    const productMetrics = getMetricsForProduct.value(productId)

    if (productMetrics.length === 0) {
      return {
        total_metrics: 0,
        on_target: 0,
        warning: 0,
        critical: 0,
        avg_achievement: 0
      }
    }

    let onTarget = 0
    let warning = 0
    let critical = 0
    let totalAchievement = 0
    let achievementCount = 0

    productMetrics.forEach(metric => {
      const status = getMetricStatus(metric)
      if (status === 'on-target') onTarget++
      else if (status === 'warning') warning++
      else if (status === 'critical') critical++

      const achievement = getMetricAchievementRate(metric)
      if (achievement) {
        totalAchievement += achievement
        achievementCount++
      }
    })

    return {
      total_metrics: productMetrics.length,
      on_target: onTarget,
      warning: warning,
      critical: critical,
      avg_achievement: achievementCount > 0 ? totalAchievement / achievementCount : 0
    }
  }

  // Utilities
  const clearError = () => {
    error.value = null
  }

  const setCurrentMetric = (metric) => {
    currentMetric.value = metric
  }

  const clearCurrentMetric = () => {
    currentMetric.value = null
  }

  const clearAlerts = (productId = null) => {
    if (productId) {
      alerts.value = alerts.value.filter(alert => alert.product_id !== productId)
    } else {
      alerts.value = []
    }
  }

  const reset = () => {
    metrics.value = []
    currentMetric.value = null
    loading.value = false
    error.value = null
    dashboards.value = {}
    trends.value = {}
    comparisons.value = {}
    alerts.value = []
    stats.value = {}
  }

  return {
    // State
    metrics,
    currentMetric,
    loading,
    error,
    dashboards,
    trends,
    comparisons,
    alerts,
    stats,

    // Getters
    metricsByProduct,
    metricsByCategory,
    metricsByPlatform,
    metricsOnTarget,
    metricsBelowTarget,
    topPerformingMetrics,
    worstPerformingMetrics,
    getMetricById,
    getMetricsForProduct,

    // Actions
    fetchMetrics,
    fetchMetric,
    createMetric,
    updateMetric,
    deleteMetric,
    fetchMetricsByProduct,
    fetchMetricsByCategory,
    fetchMetricTrends,
    fetchKPIDashboard,
    compareProducts,
    fetchAlerts,
    fetchStats,

    // Utility functions
    getMetricAchievementRate,
    getMetricStatus,
    getMetricTrend,
    filterMetricsByPerformance,
    getProductPerformanceSummary,

    // Utilities
    clearError,
    setCurrentMetric,
    clearCurrentMetric,
    clearAlerts,
    reset
  }
})