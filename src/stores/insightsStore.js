import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useInsightsStore = defineStore('insights', () => {
  const appStore = useAppStore()

  // State
  const performanceData = ref([])
  const kpiData = ref([])
  const funnelData = ref([])
  const dashboardWidgets = ref([])
  const reports = ref([])
  const selectedDateRange = ref({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const selectedMetrics = ref(['revenue', 'roi', 'conversions', 'impressions'])
  const currentDashboard = ref('main')
  const isLoading = ref(false)
  const filters = ref({})
  const comparisonPeriod = ref(null) // Для сравнения с предыдущим периодом

  // Getters
  const totalRevenue = computed(() => {
    return performanceData.value.reduce((sum, item) => {
      return sum + (item.revenue || 0)
    }, 0)
  })

  const averageROI = computed(() => {
    if (performanceData.value.length === 0) return 0
    const totalROI = performanceData.value.reduce((sum, item) => sum + (item.roi || 0), 0)
    return Math.round((totalROI / performanceData.value.length) * 100) / 100
  })

  const totalConversions = computed(() => {
    return performanceData.value.reduce((sum, item) => {
      return sum + (item.conversions || 0)
    }, 0)
  })

  const totalImpressions = computed(() => {
    return performanceData.value.reduce((sum, item) => {
      return sum + (item.impressions || 0)
    }, 0)
  })

  const conversionRate = computed(() => {
    if (totalImpressions.value === 0) return 0
    return Math.round((totalConversions.value / totalImpressions.value) * 10000) / 100
  })

  const performanceTrends = computed(() => {
    // Группировка данных по дням для трендов
    const trends = {}
    performanceData.value.forEach(item => {
      const date = item.date
      if (!trends[date]) {
        trends[date] = {
          date,
          revenue: 0,
          conversions: 0,
          impressions: 0,
          roi: []
        }
      }
      trends[date].revenue += item.revenue || 0
      trends[date].conversions += item.conversions || 0
      trends[date].impressions += item.impressions || 0
      if (item.roi) trends[date].roi.push(item.roi)
    })

    // Вычисляем средний ROI для каждого дня
    Object.keys(trends).forEach(date => {
      const roiArray = trends[date].roi
      trends[date].avgROI = roiArray.length > 0
        ? roiArray.reduce((sum, roi) => sum + roi, 0) / roiArray.length
        : 0
      delete trends[date].roi
    })

    return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date))
  })

  const kpiSummary = computed(() => {
    const summary = {}
    kpiData.value.forEach(kpi => {
      if (!summary[kpi.category]) {
        summary[kpi.category] = {
          category: kpi.category,
          metrics: [],
          totalValue: 0,
          count: 0
        }
      }
      summary[kpi.category].metrics.push(kpi)
      summary[kpi.category].totalValue += kpi.current_value || 0
      summary[kpi.category].count++
    })
    return Object.values(summary)
  })

  const topPerformingActivities = computed(() => {
    return performanceData.value
      .filter(item => item.activity_name)
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 10)
  })

  const funnelSummary = computed(() => {
    if (funnelData.value.length === 0) return null

    const stages = {}
    funnelData.value.forEach(item => {
      if (!stages[item.stage_name]) {
        stages[item.stage_name] = {
          stage: item.stage_name,
          stage_order: item.stage_order,
          totalUsers: 0,
          conversions: 0
        }
      }
      stages[item.stage_name].totalUsers += item.users_count || 0
      stages[item.stage_name].conversions += item.conversions || 0
    })

    const sortedStages = Object.values(stages).sort((a, b) => a.stage_order - b.stage_order)

    // Вычисляем конверсию между этапами
    for (let i = 0; i < sortedStages.length; i++) {
      if (i === 0) {
        sortedStages[i].conversionRate = 100 // Первый этап = 100%
      } else {
        const prevStage = sortedStages[i - 1]
        sortedStages[i].conversionRate = prevStage.totalUsers > 0
          ? Math.round((sortedStages[i].totalUsers / prevStage.totalUsers) * 100)
          : 0
      }
    }

    return sortedStages
  })

  const filteredPerformanceData = computed(() => {
    let filtered = performanceData.value

    if (filters.value.channel) {
      filtered = filtered.filter(item => item.channel === filters.value.channel)
    }

    if (filters.value.campaign) {
      filtered = filtered.filter(item =>
        item.campaign_name?.toLowerCase().includes(filters.value.campaign.toLowerCase())
      )
    }

    if (filters.value.activity) {
      filtered = filtered.filter(item =>
        item.activity_name?.toLowerCase().includes(filters.value.activity.toLowerCase())
      )
    }

    return filtered
  })

  const dashboardConfig = computed(() => {
    const configs = {
      main: {
        title: 'Главный дашборд',
        widgets: ['revenue', 'roi', 'conversions', 'trends', 'top_activities'],
        layout: 'grid'
      },
      performance: {
        title: 'Производительность',
        widgets: ['performance_table', 'channel_comparison', 'time_analysis'],
        layout: 'detailed'
      },
      roi: {
        title: 'ROI Анализ',
        widgets: ['roi_overview', 'roi_trends', 'roi_by_channel', 'investment_efficiency'],
        layout: 'analysis'
      },
      funnel: {
        title: 'Воронка конверсии',
        widgets: ['funnel_overview', 'stage_analysis', 'drop_off_analysis'],
        layout: 'funnel'
      }
    }
    return configs[currentDashboard.value] || configs.main
  })

  // Actions
  const fetchPerformanceData = async (dateRange = null, filters = {}) => {
    try {
      isLoading.value = true
      console.log('[InsightsStore] Fetching performance data...')

      const params = {
        start_date: dateRange?.start || selectedDateRange.value.start,
        end_date: dateRange?.end || selectedDateRange.value.end,
        ...filters
      }

      const data = await api.insights.getPerformanceData(params)
      console.log('[InsightsStore] Received performance data:', data)
      performanceData.value = data || []
    } catch (error) {
      console.error('[InsightsStore] Error fetching performance data:', error)
      appStore.showError('Ошибка загрузки данных производительности: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchKPIData = async () => {
    try {
      console.log('[InsightsStore] Fetching KPI data...')
      const data = await api.insights.getKPIData()
      console.log('[InsightsStore] Received KPI data:', data)
      kpiData.value = data || []
    } catch (error) {
      console.error('[InsightsStore] Error fetching KPI data:', error)
      appStore.showError('Ошибка загрузки KPI: ' + error.message)
    }
  }

  const fetchFunnelData = async (dateRange = null) => {
    try {
      console.log('[InsightsStore] Fetching funnel data...')

      const params = {
        start_date: dateRange?.start || selectedDateRange.value.start,
        end_date: dateRange?.end || selectedDateRange.value.end
      }

      const data = await api.insights.getFunnelData(params)
      console.log('[InsightsStore] Received funnel data:', data)
      funnelData.value = data || []
    } catch (error) {
      console.error('[InsightsStore] Error fetching funnel data:', error)
      appStore.showError('Ошибка загрузки данных воронки: ' + error.message)
    }
  }

  const generateReport = async (reportConfig) => {
    try {
      isLoading.value = true
      console.log('[InsightsStore] Generating report:', reportConfig)
      const report = await api.insights.generateReport(reportConfig)

      reports.value.push({
        ...report,
        generated_at: new Date().toISOString()
      })

      appStore.showSuccess('Отчет сгенерирован успешно')
      return report
    } catch (error) {
      console.error('[InsightsStore] Error generating report:', error)
      appStore.showError('Ошибка генерации отчета: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const exportData = async (exportConfig) => {
    try {
      console.log('[InsightsStore] Exporting data:', exportConfig)
      const exportResult = await api.insights.exportData(exportConfig)
      appStore.showSuccess('Данные экспортированы успешно')
      return exportResult
    } catch (error) {
      console.error('[InsightsStore] Error exporting data:', error)
      appStore.showError('Ошибка экспорта данных: ' + error.message)
      throw error
    }
  }

  const createCustomWidget = async (widgetConfig) => {
    try {
      console.log('[InsightsStore] Creating custom widget:', widgetConfig)
      const widget = await api.insights.createWidget(widgetConfig)

      dashboardWidgets.value.push({
        ...widget,
        created_at: new Date().toISOString()
      })

      appStore.showSuccess('Виджет создан успешно')
      return widget
    } catch (error) {
      console.error('[InsightsStore] Error creating widget:', error)
      appStore.showError('Ошибка создания виджета: ' + error.message)
      throw error
    }
  }

  const updateDashboardLayout = async (layoutConfig) => {
    try {
      console.log('[InsightsStore] Updating dashboard layout:', layoutConfig)
      await api.insights.updateDashboardLayout(layoutConfig)
      appStore.showSuccess('Макет дашборда обновлен')
    } catch (error) {
      console.error('[InsightsStore] Error updating dashboard layout:', error)
      appStore.showError('Ошибка обновления макета: ' + error.message)
      throw error
    }
  }

  const performAttributionAnalysis = async (params) => {
    try {
      console.log('[InsightsStore] Performing attribution analysis:', params)
      const analysis = await api.insights.performAttributionAnalysis(params)
      return analysis
    } catch (error) {
      console.error('[InsightsStore] Error performing attribution analysis:', error)
      appStore.showError('Ошибка анализа атрибуции: ' + error.message)
      throw error
    }
  }

  const runCohortAnalysis = async (params) => {
    try {
      console.log('[InsightsStore] Running cohort analysis:', params)
      const analysis = await api.insights.runCohortAnalysis(params)
      return analysis
    } catch (error) {
      console.error('[InsightsStore] Error running cohort analysis:', error)
      appStore.showError('Ошибка когортного анализа: ' + error.message)
      throw error
    }
  }

  const generatePredictiveModel = async (modelConfig) => {
    try {
      isLoading.value = true
      console.log('[InsightsStore] Generating predictive model:', modelConfig)
      const model = await api.insights.generatePredictiveModel(modelConfig)
      appStore.showSuccess('Прогнозная модель создана успешно')
      return model
    } catch (error) {
      console.error('[InsightsStore] Error generating predictive model:', error)
      appStore.showError('Ошибка создания прогнозной модели: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const setDateRange = (startDate, endDate) => {
    selectedDateRange.value = {
      start: startDate,
      end: endDate
    }
    // Автоматически обновляем данные при изменении диапазона
    fetchPerformanceData(selectedDateRange.value)
    fetchFunnelData(selectedDateRange.value)
  }

  const setDashboard = (dashboardType) => {
    currentDashboard.value = dashboardType
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const setMetrics = (metrics) => {
    selectedMetrics.value = metrics
  }

  const compareWithPreviousPeriod = async () => {
    try {
      const currentStart = new Date(selectedDateRange.value.start)
      const currentEnd = new Date(selectedDateRange.value.end)
      const periodLength = currentEnd.getTime() - currentStart.getTime()

      const previousStart = new Date(currentStart.getTime() - periodLength)
      const previousEnd = new Date(currentStart.getTime() - 1)

      const previousData = await api.insights.getPerformanceData({
        start_date: previousStart.toISOString().split('T')[0],
        end_date: previousEnd.toISOString().split('T')[0]
      })

      comparisonPeriod.value = {
        data: previousData,
        period: {
          start: previousStart.toISOString().split('T')[0],
          end: previousEnd.toISOString().split('T')[0]
        }
      }

      return comparisonPeriod.value
    } catch (error) {
      console.error('[InsightsStore] Error comparing with previous period:', error)
      appStore.showError('Ошибка сравнения с предыдущим периодом: ' + error.message)
      throw error
    }
  }

  const loadMainKPIs = async (dateRange = null) => {
    try {
      isLoading.value = true
      console.log('[InsightsStore] Loading main KPIs...')

      const params = {
        start_date: dateRange?.start || selectedDateRange.value.start,
        end_date: dateRange?.end || selectedDateRange.value.end
      }

      // Загружаем основные KPI
      const mainKPIs = await api.insights.getMainKPIs(params)
      console.log('[InsightsStore] Received main KPIs:', mainKPIs)

      // Возвращаем структурированные данные для главного дашборда
      return {
        revenue: {
          current: mainKPIs.revenue?.current || 0,
          previous: mainKPIs.revenue?.previous || 0,
          trend: mainKPIs.revenue?.trend || 0,
          target: mainKPIs.revenue?.target || 0
        },
        roi: {
          current: mainKPIs.roi?.current || 0,
          previous: mainKPIs.roi?.previous || 0,
          trend: mainKPIs.roi?.trend || 0,
          target: mainKPIs.roi?.target || 0
        },
        conversions: {
          current: mainKPIs.conversions?.current || 0,
          previous: mainKPIs.conversions?.previous || 0,
          trend: mainKPIs.conversions?.trend || 0,
          target: mainKPIs.conversions?.target || 0
        },
        cpa: {
          current: mainKPIs.cpa?.current || 0,
          previous: mainKPIs.cpa?.previous || 0,
          trend: mainKPIs.cpa?.trend || 0,
          target: mainKPIs.cpa?.target || 0
        },
        impressions: {
          current: mainKPIs.impressions?.current || 0,
          previous: mainKPIs.impressions?.previous || 0,
          trend: mainKPIs.impressions?.trend || 0,
          target: mainKPIs.impressions?.target || 0
        },
        ctr: {
          current: mainKPIs.ctr?.current || 0,
          previous: mainKPIs.ctr?.previous || 0,
          trend: mainKPIs.ctr?.trend || 0,
          target: mainKPIs.ctr?.target || 0
        }
      }
    } catch (error) {
      console.error('[InsightsStore] Error loading main KPIs:', error)
      appStore.showError('Ошибка загрузки основных KPI: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Дополнительные состояния для дашборда
  const revenueData = ref([])
  const channelData = ref([])
  const geoData = ref([])
  const topCampaigns = ref([])
  const growingSegments = ref([])
  const activeCampaigns = ref(45) // Default value for demo
  const campaignsData = ref([])
  const availableChannels = ref(['Google Ads', 'Email', 'Yandex Direct', 'Instagram', 'YouTube'])
  const availableProducts = ref(['Kreola Basic', 'Kreola Premium', 'Kreola Enterprise'])
  const availableRegions = ref(['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань'])

  // Методы для главного дашборда
  const loadRevenueData = async (period = 'month') => {
    try {
      console.log('[InsightsStore] Loading revenue data for period:', period)
      const data = await api.insights.getRevenueData({ period })
      revenueData.value = data || []
      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading revenue data:', error)
      appStore.showError('Ошибка загрузки данных доходов: ' + error.message)
      throw error
    }
  }

  const loadChannelData = async () => {
    try {
      console.log('[InsightsStore] Loading channel data...')
      const data = await api.insights.getChannelData()
      channelData.value = data || []
      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading channel data:', error)
      appStore.showError('Ошибка загрузки данных по каналам: ' + error.message)
      throw error
    }
  }

  const loadGeoData = async (metric = 'revenue') => {
    try {
      console.log('[InsightsStore] Loading geo data for metric:', metric)
      const data = await api.insights.getGeoData({ metric })
      geoData.value = data || []
      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading geo data:', error)
      appStore.showError('Ошибка загрузки географических данных: ' + error.message)
      throw error
    }
  }

  const loadTopCampaigns = async () => {
    try {
      console.log('[InsightsStore] Loading top campaigns...')
      const data = await api.insights.getTopCampaigns()
      topCampaigns.value = data || []
      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading top campaigns:', error)
      appStore.showError('Ошибка загрузки топ кампаний: ' + error.message)
      throw error
    }
  }

  const loadGrowingSegments = async () => {
    try {
      console.log('[InsightsStore] Loading growing segments...')
      const data = await api.insights.getGrowingSegments()
      growingSegments.value = data || []
      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading growing segments:', error)
      appStore.showError('Ошибка загрузки растущих сегментов: ' + error.message)
      throw error
    }
  }

  const loadCampaignsData = async () => {
    try {
      console.log('[InsightsStore] Loading campaigns data...')
      const data = await api.insights.getCampaignsData()
      campaignsData.value = data || []
      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading campaigns data:', error)
      appStore.showError('Ошибка загрузки данных кампаний: ' + error.message)
      throw error
    }
  }

  // Метод для загрузки данных воронки (fix для MainDashboard)
  const loadFunnelData = async () => {
    try {
      console.log('[InsightsStore] Loading funnel data...')
      await fetchFunnelData()
      return funnelData.value
    } catch (error) {
      console.error('[InsightsStore] Error loading funnel data:', error)
      throw error
    }
  }

  // Дополнительные состояния для специфичных дашбордов
  const performanceTimeData = ref([])
  const roiKPIs = ref([])

  const loadPerformanceTimeData = async (params = {}) => {
    try {
      console.log('[InsightsStore] Loading performance time data...')
      const data = await api.insights.getPerformanceTimeData(params)
      performanceTimeData.value = data || []
      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading performance time data:', error)
      appStore.showError('Ошибка загрузки временных данных производительности: ' + error.message)
      throw error
    }
  }

  const loadROIKPIs = async () => {
    try {
      console.log('[InsightsStore] Loading ROI KPIs...')
      const data = await api.insights.getROIKPIs()
      roiKPIs.value = data || []
      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading ROI KPIs:', error)
      appStore.showError('Ошибка загрузки ROI KPI: ' + error.message)
      throw error
    }
  }

  // Инициализация
  const initialize = async () => {
    console.log('[InsightsStore] Initializing...')
    try {
      await Promise.all([
        fetchPerformanceData(),
        fetchKPIData(),
        fetchFunnelData()
      ])
      console.log('[InsightsStore] Initialization completed successfully')
      console.log('[InsightsStore] Performance data count:', performanceData.value.length)
      console.log('[InsightsStore] KPI data count:', kpiData.value.length)
      console.log('[InsightsStore] Funnel data count:', funnelData.value.length)
    } catch (error) {
      console.error('[InsightsStore] Initialization failed:', error)
    }
  }

  return {
    // State
    performanceData,
    kpiData,
    funnelData,
    dashboardWidgets,
    reports,
    selectedDateRange,
    selectedMetrics,
    currentDashboard,
    isLoading,
    filters,
    comparisonPeriod,
    revenueData,
    channelData,
    geoData,
    topCampaigns,
    growingSegments,
    activeCampaigns,
    campaignsData,
    availableChannels,
    availableProducts,
    availableRegions,
    performanceTimeData,
    roiKPIs,

    // Getters
    totalRevenue,
    averageROI,
    totalConversions,
    totalImpressions,
    conversionRate,
    performanceTrends,
    kpiSummary,
    topPerformingActivities,
    funnelSummary,
    filteredPerformanceData,
    dashboardConfig,

    // Actions
    fetchPerformanceData,
    fetchKPIData,
    fetchFunnelData,
    generateReport,
    exportData,
    createCustomWidget,
    updateDashboardLayout,
    performAttributionAnalysis,
    runCohortAnalysis,
    generatePredictiveModel,
    setDateRange,
    setDashboard,
    setFilters,
    clearFilters,
    setMetrics,
    compareWithPreviousPeriod,
    loadMainKPIs,
    loadRevenueData,
    loadChannelData,
    loadGeoData,
    loadTopCampaigns,
    loadGrowingSegments,
    loadCampaignsData,
    loadFunnelData,
    loadPerformanceTimeData,
    loadROIKPIs,
    initialize
  }
})