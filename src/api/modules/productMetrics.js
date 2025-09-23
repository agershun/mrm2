import productMetricsData from '../mocks/productMetrics.mock.json'

// Имитация задержки сети
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

export const productMetricsApi = {
  // Получить все метрики продуктов
  async getProductMetrics(filters = {}) {
    await delay()
    let filtered = [...productMetricsData]

    // Фильтрация по продукту
    if (filters.product_id) {
      filtered = filtered.filter(metric => metric.product_id === filters.product_id)
    }

    // Фильтрация по категории метрики
    if (filters.metric_category) {
      filtered = filtered.filter(metric => metric.metric_category === filters.metric_category)
    }

    // Фильтрация по платформе
    if (filters.platform) {
      filtered = filtered.filter(metric => metric.platform === filters.platform)
    }

    // Фильтрация по источнику
    if (filters.source) {
      filtered = filtered.filter(metric => metric.source === filters.source)
    }

    // Фильтрация по периоду
    if (filters.period_start || filters.period_end) {
      filtered = filtered.filter(metric => {
        const metricPeriod = new Date(metric.period)
        const periodStart = filters.period_start ? new Date(filters.period_start) : null
        const periodEnd = filters.period_end ? new Date(filters.period_end) : null

        if (periodStart && metricPeriod < periodStart) return false
        if (periodEnd && metricPeriod > periodEnd) return false
        return true
      })
    }

    // Поиск по названию метрики
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(metric =>
        metric.metric_name.toLowerCase().includes(searchLower)
      )
    }

    return {
      data: filtered,
      total: filtered.length,
      page: filters.page || 1,
      limit: filters.limit || 50
    }
  },

  // Получить метрику по ID
  async getProductMetric(metricId) {
    await delay()
    const metric = productMetricsData.find(m => m.metric_id === metricId)
    if (!metric) {
      throw new Error(`Метрика с ID ${metricId} не найдена`)
    }
    return { data: metric }
  },

  // Создать новую метрику
  async createProductMetric(metricData) {
    await delay()
    const newMetric = {
      metric_id: `metric_${Date.now()}`,
      ...metricData,
      created_at: new Date().toISOString()
    }

    console.log('Creating product metric:', newMetric)
    return { data: newMetric }
  },

  // Обновить метрику
  async updateProductMetric(metricId, updates) {
    await delay()
    const metricIndex = productMetricsData.findIndex(m => m.metric_id === metricId)
    if (metricIndex === -1) {
      throw new Error(`Метрика с ID ${metricId} не найдена`)
    }

    const updatedMetric = {
      ...productMetricsData[metricIndex],
      ...updates
    }

    console.log('Updating product metric:', updatedMetric)
    return { data: updatedMetric }
  },

  // Удалить метрику
  async deleteProductMetric(metricId) {
    await delay()
    const metricIndex = productMetricsData.findIndex(m => m.metric_id === metricId)
    if (metricIndex === -1) {
      throw new Error(`Метрика с ID ${metricId} не найдена`)
    }

    console.log('Deleting product metric:', metricId)
    return { success: true }
  },

  // Получить метрики по продукту
  async getMetricsByProduct(productId) {
    await delay()
    const metrics = productMetricsData.filter(m => m.product_id === productId)
    return { data: metrics }
  },

  // Получить метрики по категории
  async getMetricsByCategory(category) {
    await delay()
    const metrics = productMetricsData.filter(m => m.metric_category === category)
    return { data: metrics }
  },

  // Получить тренды метрик для продукта
  async getProductMetricTrends(productId, metricNames = [], periodDays = 30) {
    await delay()
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (periodDays * 24 * 60 * 60 * 1000))

    let metrics = productMetricsData.filter(metric => {
      if (metric.product_id !== productId) return false

      const metricDate = new Date(metric.period)
      if (metricDate < startDate || metricDate > endDate) return false

      if (metricNames.length > 0 && !metricNames.includes(metric.metric_name)) return false

      return true
    })

    // Группировка по названию метрики и сортировка по дате
    const trends = {}
    metrics.forEach(metric => {
      if (!trends[metric.metric_name]) {
        trends[metric.metric_name] = []
      }
      trends[metric.metric_name].push({
        period: metric.period,
        value: metric.value,
        previous_value: metric.previous_period_value,
        change_percent: metric.change_percent,
        target_value: metric.target_value
      })
    })

    // Сортировка по дате
    Object.keys(trends).forEach(metricName => {
      trends[metricName].sort((a, b) => new Date(a.period) - new Date(b.period))
    })

    return { data: trends }
  },

  // Получить KPI дашборд для продукта
  async getProductKPIDashboard(productId) {
    await delay()
    const metrics = productMetricsData.filter(m => m.product_id === productId)

    const dashboard = {
      product_id: productId,
      last_updated: new Date().toISOString(),
      metrics_count: metrics.length,
      categories: {}
    }

    metrics.forEach(metric => {
      if (!dashboard.categories[metric.metric_category]) {
        dashboard.categories[metric.metric_category] = {
          metrics: [],
          avg_achievement: 0,
          metrics_on_target: 0,
          metrics_below_target: 0
        }
      }

      const category = dashboard.categories[metric.metric_category]
      const achievement = metric.target_value ? (metric.value / metric.target_value) : 1

      category.metrics.push({
        metric_id: metric.metric_id,
        metric_name: metric.metric_name,
        value: metric.value,
        target_value: metric.target_value,
        achievement_rate: achievement,
        change_percent: metric.change_percent,
        unit: metric.unit,
        platform: metric.platform
      })

      if (achievement >= 1) {
        category.metrics_on_target++
      } else {
        category.metrics_below_target++
      }
    })

    // Вычисление средних достижений по категориям
    Object.keys(dashboard.categories).forEach(categoryName => {
      const category = dashboard.categories[categoryName]
      const totalAchievement = category.metrics.reduce((sum, m) => sum + m.achievement_rate, 0)
      category.avg_achievement = totalAchievement / category.metrics.length
    })

    return { data: dashboard }
  },

  // Получить сравнение продуктов по метрикам
  async compareProducts(productIds, metricNames = []) {
    await delay()
    const comparison = {}

    productIds.forEach(productId => {
      const productMetrics = productMetricsData.filter(m => m.product_id === productId)
      comparison[productId] = {}

      if (metricNames.length === 0) {
        // Если метрики не указаны, берем все уникальные для этого продукта
        metricNames = [...new Set(productMetrics.map(m => m.metric_name))]
      }

      metricNames.forEach(metricName => {
        const metric = productMetrics.find(m => m.metric_name === metricName)
        comparison[productId][metricName] = metric ? {
          value: metric.value,
          target_value: metric.target_value,
          change_percent: metric.change_percent,
          unit: metric.unit
        } : null
      })
    })

    return { data: comparison }
  },

  // Получить алерты по метрикам
  async getMetricAlerts(productId = null) {
    await delay()
    let metrics = [...productMetricsData]

    if (productId) {
      metrics = metrics.filter(m => m.product_id === productId)
    }

    const alerts = []

    metrics.forEach(metric => {
      // Алерт если значение сильно ниже цели
      if (metric.target_value && metric.value < (metric.target_value * 0.8)) {
        alerts.push({
          type: 'below_target',
          severity: 'high',
          metric_id: metric.metric_id,
          metric_name: metric.metric_name,
          product_id: metric.product_id,
          current_value: metric.value,
          target_value: metric.target_value,
          message: `${metric.metric_name} значительно ниже цели`
        })
      }

      // Алерт если большое негативное изменение
      if (metric.change_percent < -20) {
        alerts.push({
          type: 'negative_trend',
          severity: 'medium',
          metric_id: metric.metric_id,
          metric_name: metric.metric_name,
          product_id: metric.product_id,
          change_percent: metric.change_percent,
          message: `${metric.metric_name} сильно снизилась за период`
        })
      }
    })

    return { data: alerts }
  },

  // Получить статистику по метрикам продуктов
  async getProductMetricsStats() {
    await delay()
    const stats = {
      total_metrics: productMetricsData.length,
      by_product: {},
      by_category: {},
      by_platform: {},
      avg_achievement_rate: 0
    }

    let totalAchievement = 0
    let achievementCount = 0

    productMetricsData.forEach(metric => {
      // Группировка по продукту
      if (!stats.by_product[metric.product_id]) {
        stats.by_product[metric.product_id] = 0
      }
      stats.by_product[metric.product_id]++

      // Группировка по категории
      if (!stats.by_category[metric.metric_category]) {
        stats.by_category[metric.metric_category] = 0
      }
      stats.by_category[metric.metric_category]++

      // Группировка по платформе
      if (!stats.by_platform[metric.platform]) {
        stats.by_platform[metric.platform] = 0
      }
      stats.by_platform[metric.platform]++

      // Расчет среднего достижения целей
      if (metric.target_value && metric.target_value > 0) {
        totalAchievement += metric.value / metric.target_value
        achievementCount++
      }
    })

    if (achievementCount > 0) {
      stats.avg_achievement_rate = totalAchievement / achievementCount
    }

    return { data: stats }
  }
}