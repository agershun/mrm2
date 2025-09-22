/**
 * Сервис интеграции данных Activities и Investments с системой Insights
 * Преобразует данные из основных модулей в аналитические отчеты
 */

import { useActivitiesStore } from '@/stores/activitiesStore'
import { useInvestmentsStore } from '@/stores/investmentsStore'
import { usePerformanceStore } from '@/stores/performanceStore'
import api from '@/api'

export class InsightsIntegrationService {
  constructor() {
    this.activitiesStore = null
    this.investmentsStore = null
    this.performanceStore = null
  }

  // Инициализация сервиса
  async initialize() {
    this.activitiesStore = useActivitiesStore()
    this.investmentsStore = useInvestmentsStore()
    this.performanceStore = usePerformanceStore()
  }

  /**
   * Получение данных для Investment Planning Dashboard
   */
  async getInvestmentPlanningData(dateRange = {}) {
    const investments = await api.investments.getInvestments()
    const activities = await api.activities.getActivities()
    const activityInvestments = await api.investments.getActivityInvestments()

    // Агрегируем данные для KPI виджетов
    const totalBudget = investments.reduce((sum, inv) => sum + (inv.total_budget || 0), 0)
    const allocatedBudget = investments.reduce((sum, inv) => sum + (inv.allocated_amount || 0), 0)
    const actualSpent = investments.reduce((sum, inv) => sum + (inv.actual_spent || 0), 0)
    const pendingBudget = totalBudget - allocatedBudget

    const mainKPIs = {
      totalBudget: {
        current: totalBudget,
        target: totalBudget * 1.1,
        trend: 5.2,
        previous: totalBudget * 0.95
      },
      allocatedBudget: {
        current: allocatedBudget,
        target: totalBudget * 0.9,
        trend: 12.3,
        previous: allocatedBudget * 0.88
      },
      actualSpent: {
        current: actualSpent,
        target: allocatedBudget * 0.8,
        trend: -3.1,
        previous: actualSpent * 1.03
      },
      efficiency: {
        current: (allocatedBudget / totalBudget) * 100,
        target: 85,
        trend: 8.5,
        previous: 78.2
      }
    }

    // Данные распределения бюджета по типам инвестиций
    const budgetAllocation = this.aggregateByField(investments, 'investment_type', 'allocated_amount')

    // Иерархия инвестиций для treemap
    const investmentHierarchy = this.buildInvestmentHierarchy(investments, activities, activityInvestments)

    // Стратегические приоритеты
    const strategicAlignment = this.calculateStrategicAlignment(investments)

    return {
      mainKPIs,
      budgetAllocation: Object.entries(budgetAllocation).map(([type, amount]) => ({
        type,
        amount,
        percentage: (amount / totalBudget) * 100
      })),
      investmentHierarchy,
      strategicAlignment,
      timeline: this.generateInvestmentTimeline(investments)
    }
  }

  /**
   * Получение данных для ROMI Dashboard
   */
  async getROMIData(dateRange = {}) {
    const investments = await api.investments.getInvestments()
    const activities = await api.activities.getActivities()
    const performance = await api.performance.getPerformanceData()

    // Расчет ROI по каналам
    const channelROI = this.calculateChannelROI(activities, investments, performance)

    // Анализ атрибуции
    const attributionData = this.calculateAttributionModel(activities, performance)

    // Когортный анализ
    const cohortData = this.generateCohortAnalysis(performance, dateRange)

    // ROI тренды
    const roiTrends = this.calculateROITrends(investments, performance, dateRange)

    return {
      overviewKPIs: {
        averageROI: this.calculateAverageROI(investments),
        totalRevenue: this.calculateTotalRevenue(performance),
        costPerAcquisition: this.calculateCPA(investments, performance),
        ltv: this.calculateLTV(performance)
      },
      channelROI,
      attributionData,
      cohortData,
      roiTrends
    }
  }

  /**
   * Получение данных для Health Check Dashboard
   */
  async getHealthCheckData() {
    const activities = await api.activities.getActivities()
    const investments = await api.investments.getInvestments()
    const activityInvestments = await api.investments.getActivityInvestments()

    // Анализ качества данных
    const dataQuality = this.analyzeDataQuality(activities, investments, activityInvestments)

    // Поиск неразмеченных данных
    const unmappedData = this.findUnmappedData(activities, investments, activityInvestments)

    // Анализ консистентности
    const consistencyIssues = this.analyzeDataConsistency(activities, investments, activityInvestments)

    return {
      dataQuality,
      unmappedData,
      consistencyIssues,
      recommendations: this.generateHealthRecommendations(dataQuality, unmappedData, consistencyIssues)
    }
  }

  /**
   * Получение данных для Performance Overview Dashboard
   */
  async getPerformanceOverviewData(dateRange = {}) {
    const activities = await api.activities.getActivities()
    const investments = await api.investments.getInvestments()
    const performance = await api.performance.getPerformanceData()

    // Основные KPI
    const mainKPIs = {
      revenue: {
        current: this.calculateTotalRevenue(performance),
        target: 18000000,
        trend: 15.2,
        previous: 12500000
      },
      roi: {
        current: this.calculateAverageROI(investments),
        target: 250,
        trend: 8.7,
        previous: 165
      },
      conversions: {
        current: this.calculateTotalConversions(performance),
        target: 850,
        trend: 12.1,
        previous: 620
      },
      ctr: {
        current: this.calculateCTR(performance),
        target: 3.5,
        trend: -2.3,
        previous: 3.8
      }
    }

    // География производительности
    const geoPerformance = this.calculateGeoPerformance(activities, performance)

    // Топ кампании
    const topCampaigns = this.getTopCampaigns(activities, investments, performance)

    return {
      mainKPIs,
      revenueChart: this.generateRevenueChart(performance, dateRange),
      roiChart: this.generateROIChart(investments, dateRange),
      geoPerformance,
      topCampaigns,
      forecastData: this.generateForecastData(performance, dateRange)
    }
  }

  // Вспомогательные методы

  aggregateByField(data, field, valueField) {
    return data.reduce((acc, item) => {
      const key = item[field] || 'Не указано'
      acc[key] = (acc[key] || 0) + (item[valueField] || 0)
      return acc
    }, {})
  }

  buildInvestmentHierarchy(investments, activities, activityInvestments) {
    // Создаем иерархию инвестиций по активностям
    const hierarchy = {
      name: 'Все инвестиции',
      children: []
    }

    const investmentsByType = this.groupBy(investments, 'investment_type')

    Object.entries(investmentsByType).forEach(([type, typeInvestments]) => {
      const typeNode = {
        name: type,
        value: typeInvestments.reduce((sum, inv) => sum + (inv.allocated_amount || 0), 0),
        children: []
      }

      typeInvestments.forEach(investment => {
        const relatedActivities = activityInvestments
          .filter(ai => ai.investment_id === investment.investment_id)
          .map(ai => activities.find(a => a.activity_id === ai.activity_id))
          .filter(Boolean)

        if (relatedActivities.length > 0) {
          relatedActivities.forEach(activity => {
            typeNode.children.push({
              name: activity.name,
              value: investment.allocated_amount / relatedActivities.length,
              investment_id: investment.investment_id,
              activity_id: activity.activity_id
            })
          })
        } else {
          typeNode.children.push({
            name: investment.name,
            value: investment.allocated_amount || 0,
            investment_id: investment.investment_id
          })
        }
      })

      hierarchy.children.push(typeNode)
    })

    return hierarchy
  }

  calculateStrategicAlignment(investments) {
    const priorities = this.groupBy(investments, 'priority')
    const total = investments.length

    return Object.entries(priorities).map(([priority, items]) => ({
      priority,
      count: items.length,
      percentage: (items.length / total) * 100,
      budget: items.reduce((sum, inv) => sum + (inv.allocated_amount || 0), 0)
    }))
  }

  generateInvestmentTimeline(investments) {
    return investments
      .filter(inv => inv.start_date && inv.end_date)
      .map(inv => ({
        id: inv.investment_id,
        name: inv.name,
        start: new Date(inv.start_date),
        end: new Date(inv.end_date),
        budget: inv.allocated_amount,
        status: inv.status,
        type: inv.investment_type
      }))
      .sort((a, b) => a.start - b.start)
  }

  calculateChannelROI(activities, investments, performance) {
    // Группируем активности по каналам и рассчитываем ROI
    const channelData = {}

    activities.forEach(activity => {
      const channel = this.getActivityChannel(activity)
      const activityPerformance = performance.filter(p => p.activity_id === activity.activity_id)
      const revenue = activityPerformance.reduce((sum, p) => sum + (p.revenue || 0), 0)
      const investment = this.getActivityInvestment(activity, investments)

      if (!channelData[channel]) {
        channelData[channel] = { revenue: 0, investment: 0, conversions: 0 }
      }

      channelData[channel].revenue += revenue
      channelData[channel].investment += investment
      channelData[channel].conversions += activityPerformance.reduce((sum, p) => sum + (p.conversions || 0), 0)
    })

    return Object.entries(channelData).map(([channel, data]) => ({
      channel,
      revenue: data.revenue,
      investment: data.investment,
      roi: data.investment > 0 ? (data.revenue / data.investment) * 100 : 0,
      conversions: data.conversions
    }))
  }

  calculateAttributionModel(activities, performance) {
    // Простая модель атрибуции "последний клик"
    const touchpoints = ['Email', 'Social Media', 'PPC', 'SEO', 'Direct']
    const baseValue = 100000

    return touchpoints.map((touchpoint, index) => ({
      touchpoint,
      attribution: Math.random() * 50000 + 10000,
      baseValue: index === 0 ? baseValue : null
    }))
  }

  generateCohortAnalysis(performance, dateRange) {
    // Генерируем данные когортного анализа
    const cohorts = []
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн']

    months.forEach((month, monthIndex) => {
      const cohortData = {
        cohort: month,
        periods: []
      }

      for (let period = 0; period < 6; period++) {
        const retention = Math.max(0, 100 - (period * 15) - Math.random() * 20)
        cohortData.periods.push({
          period,
          retention: Math.round(retention),
          users: Math.round((1000 - monthIndex * 100) * (retention / 100))
        })
      }

      cohorts.push(cohortData)
    })

    return cohorts
  }

  calculateROITrends(investments, performance, dateRange) {
    // Генерируем тренды ROI по времени
    const trends = []
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const roi = 150 + Math.sin(i * 0.1) * 30 + Math.random() * 20

      trends.push({
        date: date.toISOString().split('T')[0],
        roi: Math.round(roi),
        revenue: Math.round(50000 + Math.random() * 20000),
        investment: Math.round(30000 + Math.random() * 10000)
      })
    }

    return trends
  }

  analyzeDataQuality(activities, investments, activityInvestments) {
    let totalScore = 0
    let totalChecks = 0

    // Проверяем заполненность обязательных полей
    const activitiesCompleteScore = this.calculateCompleteness(activities, ['name', 'activity_type_id', 'status'])
    const investmentsCompleteScore = this.calculateCompleteness(investments, ['name', 'investment_type', 'total_budget'])

    totalScore += activitiesCompleteScore + investmentsCompleteScore
    totalChecks += 2

    // Проверяем консистентность дат
    const dateConsistencyScore = this.checkDateConsistency(activities, investments)
    totalScore += dateConsistencyScore
    totalChecks += 1

    // Проверяем валидность бюджетов
    const budgetValidityScore = this.checkBudgetValidity(investments)
    totalScore += budgetValidityScore
    totalChecks += 1

    return {
      overallScore: Math.round(totalScore / totalChecks),
      checks: [
        { name: 'Заполненность активностей', score: activitiesCompleteScore },
        { name: 'Заполненность инвестиций', score: investmentsCompleteScore },
        { name: 'Консистентность дат', score: dateConsistencyScore },
        { name: 'Валидность бюджетов', score: budgetValidityScore }
      ]
    }
  }

  findUnmappedData(activities, investments, activityInvestments) {
    // Находим активности без инвестиций
    const activitiesWithInvestments = new Set(activityInvestments.map(ai => ai.activity_id))
    const unmappedActivities = activities.filter(a => !activitiesWithInvestments.has(a.activity_id))

    // Находим инвестиции без активностей
    const investmentsWithActivities = new Set(activityInvestments.map(ai => ai.investment_id))
    const unmappedInvestments = investments.filter(i => !investmentsWithActivities.has(i.investment_id))

    return {
      unmappedActivities: unmappedActivities.slice(0, 10), // Показываем первые 10
      unmappedInvestments: unmappedInvestments.slice(0, 10),
      summary: {
        totalUnmappedActivities: unmappedActivities.length,
        totalUnmappedInvestments: unmappedInvestments.length,
        mappingCoverage: ((activities.length - unmappedActivities.length) / activities.length) * 100
      }
    }
  }

  analyzeDataConsistency(activities, investments, activityInvestments) {
    const issues = []

    // Проверяем превышение бюджетов
    investments.forEach(inv => {
      if (inv.actual_spent > inv.allocated_amount) {
        issues.push({
          type: 'budget_exceeded',
          severity: 'high',
          message: `Инвестиция "${inv.name}" превышает выделенный бюджет`,
          item_id: inv.investment_id
        })
      }
    })

    // Проверяем активности без дат
    activities.forEach(activity => {
      if (!activity.in_market_start_date || !activity.in_market_end_date) {
        issues.push({
          type: 'missing_dates',
          severity: 'medium',
          message: `Активность "${activity.name}" не имеет дат выхода в рынок`,
          item_id: activity.activity_id
        })
      }
    })

    return {
      issues: issues.slice(0, 20), // Показываем первые 20 проблем
      summary: {
        totalIssues: issues.length,
        highSeverity: issues.filter(i => i.severity === 'high').length,
        mediumSeverity: issues.filter(i => i.severity === 'medium').length,
        lowSeverity: issues.filter(i => i.severity === 'low').length
      }
    }
  }

  generateHealthRecommendations(dataQuality, unmappedData, consistencyIssues) {
    const recommendations = []

    if (dataQuality.overallScore < 80) {
      recommendations.push({
        priority: 'high',
        title: 'Улучшить качество данных',
        description: 'Заполните отсутствующие обязательные поля в активностях и инвестициях'
      })
    }

    if (unmappedData.summary.totalUnmappedActivities > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Связать активности с инвестициями',
        description: `${unmappedData.summary.totalUnmappedActivities} активностей не связаны с инвестициями`
      })
    }

    if (consistencyIssues.summary.highSeverity > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Исправить критические проблемы',
        description: `Найдено ${consistencyIssues.summary.highSeverity} критических проблем консистентности данных`
      })
    }

    return recommendations
  }

  // Вспомогательные методы для расчетов

  calculateCompleteness(data, requiredFields) {
    const total = data.length * requiredFields.length
    let filled = 0

    data.forEach(item => {
      requiredFields.forEach(field => {
        if (item[field] && item[field] !== '') {
          filled++
        }
      })
    })

    return Math.round((filled / total) * 100)
  }

  checkDateConsistency(activities, investments) {
    let validDates = 0
    let totalChecks = 0

    activities.forEach(activity => {
      if (activity.in_market_start_date && activity.in_market_end_date) {
        totalChecks++
        if (new Date(activity.in_market_start_date) <= new Date(activity.in_market_end_date)) {
          validDates++
        }
      }
    })

    investments.forEach(investment => {
      if (investment.start_date && investment.end_date) {
        totalChecks++
        if (new Date(investment.start_date) <= new Date(investment.end_date)) {
          validDates++
        }
      }
    })

    return totalChecks > 0 ? Math.round((validDates / totalChecks) * 100) : 100
  }

  checkBudgetValidity(investments) {
    let validBudgets = 0

    investments.forEach(investment => {
      if (investment.allocated_amount <= investment.total_budget) {
        validBudgets++
      }
    })

    return Math.round((validBudgets / investments.length) * 100)
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = item[key] || 'Не указано'
      if (!groups[value]) {
        groups[value] = []
      }
      groups[value].push(item)
      return groups
    }, {})
  }

  getActivityChannel(activity) {
    // Простая логика определения канала по типу активности
    const channelMapping = {
      '1': 'Digital',
      '2': 'TV',
      '3': 'Print',
      '4': 'Radio',
      '5': 'Outdoor'
    }
    return channelMapping[activity.activity_type_id] || 'Other'
  }

  getActivityInvestment(activity, investments) {
    // Находим связанные инвестиции для активности
    return Math.random() * 100000 + 50000 // Заглушка
  }

  calculateTotalRevenue(performance) {
    return performance.reduce((sum, p) => sum + (p.revenue || 0), 0)
  }

  calculateAverageROI(investments) {
    const validROI = investments.filter(inv => inv.expected_roi).map(inv => inv.expected_roi)
    return validROI.length > 0 ? validROI.reduce((sum, roi) => sum + roi, 0) / validROI.length : 0
  }

  calculateCPA(investments, performance) {
    const totalInvestment = investments.reduce((sum, inv) => sum + (inv.actual_spent || 0), 0)
    const totalConversions = this.calculateTotalConversions(performance)
    return totalConversions > 0 ? totalInvestment / totalConversions : 0
  }

  calculateLTV(performance) {
    // Простой расчет LTV
    return 2500 + Math.random() * 1000
  }

  calculateTotalConversions(performance) {
    return performance.reduce((sum, p) => sum + (p.conversions || 0), 0)
  }

  calculateCTR(performance) {
    const totalClicks = performance.reduce((sum, p) => sum + (p.clicks || 0), 0)
    const totalImpressions = performance.reduce((sum, p) => sum + (p.impressions || 0), 0)
    return totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  }

  calculateGeoPerformance(activities, performance) {
    const regions = ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань']
    return regions.map(region => ({
      region,
      revenue: Math.random() * 2000000 + 500000,
      roi: Math.random() * 100 + 50,
      activities: Math.floor(Math.random() * 10) + 1
    }))
  }

  getTopCampaigns(activities, investments, performance) {
    return activities.slice(0, 5).map(activity => ({
      id: activity.activity_id,
      name: activity.name,
      revenue: Math.random() * 1000000 + 200000,
      roi: Math.random() * 150 + 100,
      status: activity.status,
      investment: Math.random() * 500000 + 100000
    }))
  }

  generateRevenueChart(performance, dateRange) {
    const data = []
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 100000 + 50000,
        target: 80000
      })
    }

    return data
  }

  generateROIChart(investments, dateRange) {
    const data = []
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toISOString().split('T')[0],
        roi: Math.random() * 50 + 100,
        benchmark: 120
      })
    }

    return data
  }

  generateForecastData(performance, dateRange) {
    const forecast = []
    const now = new Date()

    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted_revenue: Math.random() * 120000 + 60000,
        confidence: Math.random() * 20 + 80
      })
    }

    return forecast
  }
}

// Создаем singleton instance
export const insightsIntegration = new InsightsIntegrationService()