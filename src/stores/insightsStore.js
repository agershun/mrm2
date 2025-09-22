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

  // Состояние для новой архитектуры дашбордов
  const dashboards = ref([])
  const reportsData = ref([])
  const currentDashboardData = ref(null)
  const currentReportData = ref(null)
  const projects = ref([
    {
      project_id: 'q4_2025',
      name: 'Q4 2025',
      description: 'Четвертый квартал 2025 года',
      type: 'quarterly'
    },
    {
      project_id: 'year_2025',
      name: '2025 год',
      description: 'Годовой проект 2025',
      type: 'yearly'
    },
    {
      project_id: 'yoy_comparison',
      name: 'Год к году',
      description: 'Сравнение с предыдущим годом',
      type: 'comparison'
    }
  ])
  const savedViews = ref([])

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

  // Новые методы для дашбордов
  const loadDashboards = async () => {
    try {
      console.log('[InsightsStore] Loading dashboards...')
      const data = await api.insights.getDashboards()
      dashboards.value = data || []
      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading dashboards:', error)
      appStore.showError('Ошибка загрузки дашбордов: ' + error.message)
      throw error
    }
  }

  const loadReports = async (filters = {}) => {
    try {
      console.log('[InsightsStore] Loading reports with filters:', filters)
      const data = await api.insights.getReports(filters)
      reportsData.value = data || []
      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading reports:', error)
      appStore.showError('Ошибка загрузки отчетов: ' + error.message)
      throw error
    }
  }

  const loadDashboardData = async (dashboardId, project = null) => {
    try {
      isLoading.value = true
      console.log('[InsightsStore] Loading dashboard data for:', dashboardId)

      const dashboard = await api.insights.getDashboard(dashboardId)
      const dashboardReports = await api.insights.getDashboardReports(dashboardId)
      const dashboardWidgetsData = await api.insights.getDashboardWidgets(dashboardId)

      // Загружаем данные в зависимости от типа дашборда
      let data = {}

      if (dashboardId === 'investment_planning') {
        console.log('[InsightsStore] Loading Investment Planning data with real integration...')
        data = await loadRealInvestmentPlanningData({ project })
      } else if (dashboardId === 'romi') {
        console.log('[InsightsStore] Loading ROMI data with real integration...')
        data = await loadRealROMIData({ project })
      } else if (dashboardId === 'health_check') {
        console.log('[InsightsStore] Loading Health Check data with real integration...')
        data = await loadRealHealthCheckData()
      } else if (dashboardId === 'performance_overview') {
        console.log('[InsightsStore] Loading Performance Overview data with real integration...')
        data = await loadRealPerformanceOverviewData({ project })
      } else {
        // Fallback для других дашбордов
        const [mainKPIs, revData, chData, topCamp] = await Promise.all([
          loadMainKPIs(),
          loadRevenueData(),
          loadChannelData(),
          loadTopCampaigns()
        ])
        data = { mainKPIs, revenueData: revData, channelData: chData, topCampaigns: topCamp }
      }

      currentDashboardData.value = {
        dashboard,
        reports: dashboardReports,
        widgets: dashboardWidgetsData,
        data
      }

      console.log('[InsightsStore] Dashboard data loaded with integration:', currentDashboardData.value)
      return currentDashboardData.value
    } catch (error) {
      console.error('[InsightsStore] Error loading dashboard data:', error)
      appStore.showError('Ошибка загрузки данных дашборда: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const loadReportData = async (reportId, project = null) => {
    try {
      isLoading.value = true
      console.log('[InsightsStore] Loading report data for:', reportId)

      // Находим отчет в списке
      const report = reportsData.value.find(r => r.report_id === reportId)
      if (!report) {
        throw new Error('Отчет не найден')
      }

      // Загружаем данные в зависимости от источника данных отчета
      let data = {}
      switch (report.data_source) {
        case 'main_kpis':
          data = await loadMainKPIs()
          break
        case 'channel_revenue':
          data = await loadChannelData()
          break
        case 'top_campaigns':
          data = await loadTopCampaigns()
          break
        default:
          data = await generateReport({
            type: report.type,
            source: report.data_source,
            project
          })
      }

      currentReportData.value = {
        report,
        data
      }

      return currentReportData.value
    } catch (error) {
      console.error('[InsightsStore] Error loading report data:', error)
      appStore.showError('Ошибка загрузки данных отчета: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const loadProjects = async () => {
    try {
      console.log('[InsightsStore] Loading projects...')
      // Проекты уже определены в state, но можно добавить загрузку с API
      return projects.value
    } catch (error) {
      console.error('[InsightsStore] Error loading projects:', error)
      throw error
    }
  }

  const loadSavedViews = async () => {
    try {
      console.log('[InsightsStore] Loading saved views...')
      // TODO: Реализовать загрузку с API
      savedViews.value = [
        {
          view_id: 'view_001',
          name: 'Q4 Performance Overview',
          description: 'Обзор производительности за Q4',
          dashboard_id: 'performance_overview',
          tab_id: 'kpi_summary',
          filters: { period: 'Q4', year: '2025' },
          project: 'q4_2025',
          created_at: '2025-09-15T10:00:00Z'
        },
        {
          view_id: 'view_002',
          name: 'ROI by Channels',
          description: 'ROI анализ по каналам',
          dashboard_id: 'romi',
          tab_id: 'channel_performance',
          filters: { channels: ['Google Ads', 'Email', 'Instagram'] },
          project: 'q4_2025',
          created_at: '2025-09-10T14:30:00Z'
        }
      ]
      return savedViews.value
    } catch (error) {
      console.error('[InsightsStore] Error loading saved views:', error)
      throw error
    }
  }

  const saveView = async (viewData) => {
    try {
      console.log('[InsightsStore] Saving view:', viewData)
      const newView = {
        view_id: `view_${Date.now()}`,
        ...viewData,
        created_at: new Date().toISOString()
      }
      savedViews.value.push(newView)
      appStore.showSuccess('Представление сохранено')
      return newView
    } catch (error) {
      console.error('[InsightsStore] Error saving view:', error)
      appStore.showError('Ошибка сохранения представления: ' + error.message)
      throw error
    }
  }

  const deleteView = async (viewId) => {
    try {
      console.log('[InsightsStore] Deleting view:', viewId)
      const index = savedViews.value.findIndex(v => v.view_id === viewId)
      if (index !== -1) {
        savedViews.value.splice(index, 1)
        appStore.showSuccess('Представление удалено')
      }
    } catch (error) {
      console.error('[InsightsStore] Error deleting view:', error)
      appStore.showError('Ошибка удаления представления: ' + error.message)
      throw error
    }
  }

  const updateWidget = async (widget) => {
    try {
      console.log('[InsightsStore] Updating widget:', widget)
      // TODO: Реализовать обновление через API
      return widget
    } catch (error) {
      console.error('[InsightsStore] Error updating widget:', error)
      throw error
    }
  }

  // Методы для работы с отчетами
  const getReportData = async (params) => {
    try {
      console.log('[InsightsStore] Getting report data:', params)

      // Симуляция данных отчета в зависимости от типа
      let data = []

      switch (params.reportId) {
        case 'revenue_analysis':
          data = await loadRevenueData(params.timeRange)
          break
        case 'roi_trends':
          data = await loadROIKPIs()
          break
        case 'channel_performance':
          data = await loadChannelData()
          break
        case 'geographic_performance':
          data = await loadGeoData()
          break
        case 'funnel_analysis':
          data = await loadFunnelData()
          break
        case 'attribution_analysis':
          data = await performAttributionAnalysis({
            model_type: 'multi_touch',
            timeRange: params.timeRange
          })
          break
        default:
          // Генерируем моковые данные для других отчетов
          data = generateMockReportData(params)
      }

      return { data }
    } catch (error) {
      console.error('[InsightsStore] Error getting report data:', error)
      throw error
    }
  }

  const getDrillDownData = async (params) => {
    try {
      console.log('[InsightsStore] Getting drill-down data:', params)

      // Генерируем детализированные данные на основе точки клика
      const mockDrillDown = [
        {
          id: 1,
          name: `Детализация для ${params.point.label}`,
          revenue: Math.random() * 1000000,
          roi: Math.random() * 200,
          trend: (Math.random() - 0.5) * 40,
          period: params.timeRange
        },
        {
          id: 2,
          name: `Подкатегория A`,
          revenue: Math.random() * 800000,
          roi: Math.random() * 180,
          trend: (Math.random() - 0.5) * 30,
          period: params.timeRange
        },
        {
          id: 3,
          name: `Подкатегория B`,
          revenue: Math.random() * 600000,
          roi: Math.random() * 150,
          trend: (Math.random() - 0.5) * 25,
          period: params.timeRange
        }
      ]

      return { data: mockDrillDown }
    } catch (error) {
      console.error('[InsightsStore] Error getting drill-down data:', error)
      throw error
    }
  }

  const generateMockReportData = (params) => {
    const timeRanges = {
      'last_7_days': 7,
      'last_30_days': 30,
      'last_90_days': 90,
      'current_quarter': 90,
      'current_year': 365
    }

    const days = timeRanges[params.timeRange] || 30
    const data = []

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      data.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('ru-RU'),
        revenue: Math.random() * 100000 + 50000,
        roi: Math.random() * 150 + 50,
        conversions: Math.floor(Math.random() * 500 + 100),
        impressions: Math.floor(Math.random() * 10000 + 5000),
        channel: ['Google Ads', 'Email', 'Social Media', 'Direct'][Math.floor(Math.random() * 4)],
        region: ['Москва', 'Санкт-Петербург', 'Екатеринбург'][Math.floor(Math.random() * 3)]
      })
    }

    return data.reverse() // Сортируем по возрастанию даты
  }

  // Методы интеграции с Activities и Investments
  const loadRealInvestmentPlanningData = async (dateRange = {}) => {
    try {
      console.log('[InsightsStore] Loading real investment planning data...')

      // Динамический импорт для избежания circular dependencies
      const { insightsIntegration } = await import('@/services/insightsIntegration')
      await insightsIntegration.initialize()

      const data = await insightsIntegration.getInvestmentPlanningData(dateRange)
      console.log('[InsightsStore] Real investment planning data loaded:', data)

      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading real investment planning data:', error)
      // Fallback to mock data
      return generateMockInvestmentPlanningData()
    }
  }

  const loadRealROMIData = async (dateRange = {}) => {
    try {
      console.log('[InsightsStore] Loading real ROMI data...')

      const { insightsIntegration } = await import('@/services/insightsIntegration')
      await insightsIntegration.initialize()

      const data = await insightsIntegration.getROMIData(dateRange)
      console.log('[InsightsStore] Real ROMI data loaded:', data)

      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading real ROMI data:', error)
      return generateMockROMIData()
    }
  }

  const loadRealHealthCheckData = async () => {
    try {
      console.log('[InsightsStore] Loading real health check data...')

      const { insightsIntegration } = await import('@/services/insightsIntegration')
      await insightsIntegration.initialize()

      const data = await insightsIntegration.getHealthCheckData()
      console.log('[InsightsStore] Real health check data loaded:', data)

      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading real health check data:', error)
      return generateMockHealthCheckData()
    }
  }

  const loadRealPerformanceOverviewData = async (dateRange = {}) => {
    try {
      console.log('[InsightsStore] Loading real performance overview data...')

      const { insightsIntegration } = await import('@/services/insightsIntegration')
      await insightsIntegration.initialize()

      const data = await insightsIntegration.getPerformanceOverviewData(dateRange)
      console.log('[InsightsStore] Real performance overview data loaded:', data)

      return data
    } catch (error) {
      console.error('[InsightsStore] Error loading real performance overview data:', error)
      return generateMockPerformanceOverviewData()
    }
  }

  // Mock data generators for fallback
  const generateMockInvestmentPlanningData = () => ({
    mainKPIs: {
      totalBudget: { current: 25000000, target: 27500000, trend: 5.2, previous: 23750000 },
      allocatedBudget: { current: 20000000, target: 22500000, trend: 12.3, previous: 17600000 },
      actualSpent: { current: 8500000, target: 16000000, trend: -3.1, previous: 8763000 },
      efficiency: { current: 80, target: 85, trend: 8.5, previous: 78.2 }
    },
    budgetAllocation: [
      { type: 'Marketing', amount: 12000000, percentage: 60 },
      { type: 'Product Development', amount: 5000000, percentage: 25 },
      { type: 'Infrastructure', amount: 3000000, percentage: 15 }
    ],
    investmentHierarchy: {
      name: 'Все инвестиции',
      children: [
        { name: 'Marketing', value: 12000000, children: [] },
        { name: 'Product Development', value: 5000000, children: [] },
        { name: 'Infrastructure', value: 3000000, children: [] }
      ]
    },
    strategicAlignment: [
      { priority: 'High', count: 8, percentage: 53, budget: 15000000 },
      { priority: 'Medium', count: 5, percentage: 33, budget: 7000000 },
      { priority: 'Low', count: 2, percentage: 14, budget: 3000000 }
    ]
  })

  const generateMockROMIData = () => ({
    overviewKPIs: {
      averageROI: { current: 185, target: 200, trend: 8.7, previous: 165 },
      totalRevenue: { current: 18500000, target: 20000000, trend: 15.2, previous: 12500000 },
      costPerAcquisition: { current: 450, target: 400, trend: -5.3, previous: 475 },
      ltv: { current: 2800, target: 3000, trend: 12.1, previous: 2200 }
    },
    channelROI: [
      { channel: 'Digital', revenue: 8000000, investment: 4000000, roi: 200, conversions: 1200 },
      { channel: 'TV', revenue: 6000000, investment: 4500000, roi: 133, conversions: 800 },
      { channel: 'Social Media', revenue: 3000000, investment: 1500000, roi: 200, conversions: 600 },
      { channel: 'Email', revenue: 1500000, investment: 500000, roi: 300, conversions: 400 }
    ]
  })

  const generateMockHealthCheckData = () => ({
    dataQuality: {
      overallScore: 78,
      checks: [
        { name: 'Заполненность активностей', score: 85 },
        { name: 'Заполненность инвестиций', score: 92 },
        { name: 'Консистентность дат', score: 65 },
        { name: 'Валидность бюджетов', score: 71 }
      ]
    },
    unmappedData: {
      summary: {
        totalUnmappedActivities: 12,
        totalUnmappedInvestments: 3,
        mappingCoverage: 85
      }
    },
    consistencyIssues: {
      summary: {
        totalIssues: 8,
        highSeverity: 2,
        mediumSeverity: 4,
        lowSeverity: 2
      }
    }
  })

  const generateMockPerformanceOverviewData = () => ({
    mainKPIs: {
      revenue: { current: 15420000, target: 18000000, trend: 15.2, previous: 12500000 },
      roi: { current: 165, target: 250, trend: 8.7, previous: 152 },
      conversions: { current: 720, target: 850, trend: 12.1, previous: 620 },
      ctr: { current: 3.7, target: 3.5, trend: -2.3, previous: 3.8 }
    },
    geoPerformance: [
      { region: 'Москва', revenue: 6000000, roi: 180, activities: 8 },
      { region: 'Санкт-Петербург', revenue: 3500000, roi: 165, activities: 5 },
      { region: 'Екатеринбург', revenue: 2200000, roi: 145, activities: 4 }
    ]
  })

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
    dashboards,
    reportsData,
    currentDashboardData,
    currentReportData,
    projects,
    savedViews,

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
    loadDashboards,
    loadReports,
    loadDashboardData,
    loadReportData,
    loadProjects,
    loadSavedViews,
    saveView,
    deleteView,
    updateWidget,
    getReportData,
    getDrillDownData,
    generateMockReportData,
    initialize
  }
})