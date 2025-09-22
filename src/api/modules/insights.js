/**
 * API модуль для работы с аналитикой и инсайтами
 * Реализует методы из TABLES.md для таблиц PerformanceData, KPIs, FunnelStages
 */

import apiClient from '../client.js'

// Импортируем моки
import performanceDataMock from '../mocks/performanceData.mock.json'
import kpiDataMock from '../mocks/kpiData.mock.json'
import funnelDataMock from '../mocks/funnelData.mock.json'
import dashboardsMock from '../mocks/dashboards.mock.json'
import reportsMock from '../mocks/reports.mock.json'
import widgetsMock from '../mocks/widgets.mock.json'

/**
 * Получает данные производительности с фильтрацией
 * @param {Object} filters - Фильтры: {start_date, end_date, activity_id, channel, campaign}
 * @returns {Promise<Array>} - Данные производительности
 */
export const getPerformanceData = async (filters = {}) => {
  try {
    const response = await apiClient.get('/performance-data', filters)

    // Возвращаем данные из мока с применением фильтров
    let data = [...performanceDataMock]

    if (filters.start_date) {
      data = data.filter(item => item.date >= filters.start_date)
    }

    if (filters.end_date) {
      data = data.filter(item => item.date <= filters.end_date)
    }

    if (filters.activity_id) {
      data = data.filter(item => item.activity_id === filters.activity_id)
    }

    if (filters.channel) {
      data = data.filter(item => item.channel === filters.channel)
    }

    if (filters.campaign) {
      data = data.filter(item =>
        item.campaign_name?.toLowerCase().includes(filters.campaign.toLowerCase())
      )
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает KPI данные
 * @param {Object} filters - Фильтры: {category, metric_type, status}
 * @returns {Promise<Array>} - KPI данные
 */
export const getKPIData = async (filters = {}) => {
  try {
    const response = await apiClient.get('/kpis', filters)

    // Возвращаем данные из мока с применением фильтров
    let data = [...kpiDataMock]

    if (filters.category) {
      data = data.filter(item => item.category === filters.category)
    }

    if (filters.metric_type) {
      data = data.filter(item => item.metric_type === filters.metric_type)
    }

    if (filters.status) {
      data = data.filter(item => item.status === filters.status)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает данные воронки конверсии
 * @param {Object} filters - Фильтры: {start_date, end_date, funnel_type, activity_id}
 * @returns {Promise<Array>} - Данные воронки
 */
export const getFunnelData = async (filters = {}) => {
  try {
    const response = await apiClient.get('/funnel-data', filters)

    // Возвращаем данные из мока с применением фильтров
    let data = [...funnelDataMock]

    if (filters.start_date) {
      data = data.filter(item => item.date >= filters.start_date)
    }

    if (filters.end_date) {
      data = data.filter(item => item.date <= filters.end_date)
    }

    if (filters.funnel_type) {
      data = data.filter(item => item.funnel_type === filters.funnel_type)
    }

    if (filters.activity_id) {
      data = data.filter(item => item.activity_id === filters.activity_id)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Генерирует отчет по заданным параметрам
 * @param {Object} config - Конфигурация отчета: {type, metrics, filters, format}
 * @returns {Promise<Object>} - Сгенерированный отчет
 */
export const generateReport = async (config) => {
  try {
    const response = await apiClient.post('/reports/generate', config)

    // TODO: Заменить на реальную генерацию отчета
    const report = {
      report_id: Date.now().toString(),
      title: config.title || 'Аналитический отчет',
      type: config.type || 'performance',
      format: config.format || 'json',
      data: {
        summary: {
          total_revenue: 12683000,
          total_conversions: 2485,
          average_roi: 285.5,
          total_impressions: 1317500
        },
        charts: [
          {
            type: 'line',
            title: 'Тренд выручки',
            data: [
              { date: '2024-12-01', value: 1155000 },
              { date: '2024-12-02', value: 486000 },
              { date: '2024-12-03', value: 590000 },
              { date: '2024-12-04', value: 252000 },
              { date: '2024-12-05', value: 370000 }
            ]
          },
          {
            type: 'bar',
            title: 'ROI по каналам',
            data: [
              { channel: 'Email', roi: 1580.0 },
              { channel: 'Yandex Direct', roi: 300.0 },
              { channel: 'Google Ads', roi: 275.0 },
              { channel: 'YouTube', roi: 276.5 },
              { channel: 'Instagram', roi: 254.0 }
            ]
          }
        ],
        tables: [
          {
            title: 'Топ активности по выручке',
            headers: ['Активность', 'Выручка', 'ROI', 'Конверсии'],
            rows: [
              ['Запуск нового продукта Kreola Premium', '1,395,000 ₽', '275%', '279'],
              ['Influencer кампания', '2,000,000 ₽', '233%', '400'],
              ['Контекстная реклама Google', '1,220,000 ₽', '251%', '244'],
              ['SEO оптимизация', '875,000 ₽', '∞', '175'],
              ['Видеореклама YouTube', '1,330,000 ₽', '276%', '266']
            ]
          }
        ]
      },
      filters_applied: config.filters || {},
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 дней
    }

    return report
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Экспортирует данные в различных форматах
 * @param {Object} config - Конфигурация экспорта: {data_type, format, filters}
 * @returns {Promise<Object>} - Результат экспорта
 */
export const exportData = async (config) => {
  try {
    const response = await apiClient.post('/export', config)

    // TODO: Заменить на реальный экспорт
    const exportResult = {
      export_id: Date.now().toString(),
      file_name: `kreola_${config.data_type}_${new Date().toISOString().split('T')[0]}.${config.format}`,
      format: config.format,
      size: '2.5 MB',
      records_count: 1500,
      download_url: `/downloads/${Date.now()}.${config.format}`,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней
      created_at: new Date().toISOString()
    }

    return exportResult
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Создает пользовательский виджет для дашборда
 * @param {Object} config - Конфигурация виджета: {name, type, data_source, settings}
 * @returns {Promise<Object>} - Созданный виджет
 */
export const createWidget = async (config) => {
  try {
    const response = await apiClient.post('/widgets', config)

    // TODO: Заменить на реальное создание виджета
    const widget = {
      widget_id: Date.now().toString(),
      name: config.name,
      type: config.type,
      data_source: config.data_source,
      settings: config.settings || {},
      position: { x: 0, y: 0, width: 4, height: 3 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return widget
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Обновляет макет дашборда
 * @param {Object} layout - Конфигурация макета: {dashboard_id, widgets, settings}
 * @returns {Promise<Object>} - Обновленный макет
 */
export const updateDashboardLayout = async (layout) => {
  try {
    const response = await apiClient.put('/dashboards/layout', layout)

    // TODO: Заменить на реальное обновление
    return {
      layout_id: layout.dashboard_id,
      updated_at: new Date().toISOString(),
      widgets_count: layout.widgets?.length || 0
    }
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Выполняет анализ атрибуции
 * @param {Object} params - Параметры анализа: {model_type, touchpoints, attribution_window}
 * @returns {Promise<Object>} - Результат анализа атрибуции
 */
export const performAttributionAnalysis = async (params) => {
  try {
    const response = await apiClient.post('/analytics/attribution', params)

    // TODO: Заменить на реальный анализ атрибуции
    const analysis = {
      analysis_id: Date.now().toString(),
      model_type: params.model_type || 'last_click',
      attribution_window: params.attribution_window || 30,
      results: {
        channels: [
          {
            channel: 'Google Ads',
            attribution_value: 35.5,
            touches: 1250,
            conversions: 445,
            revenue_attributed: 4500000
          },
          {
            channel: 'Email',
            attribution_value: 28.2,
            touches: 890,
            conversions: 376,
            revenue_attributed: 3580000
          },
          {
            channel: 'Yandex Direct',
            attribution_value: 22.1,
            touches: 675,
            conversions: 287,
            revenue_attributed: 2800000
          },
          {
            channel: 'Instagram',
            attribution_value: 14.2,
            touches: 432,
            conversions: 189,
            revenue_attributed: 1803000
          }
        ],
        insights: [
          'Google Ads показывает наивысшую атрибуцию с 35.5% от общих конверсий',
          'Email кампании демонстрируют сильное влияние на поздних этапах воронки',
          'Комбинация Google Ads и Email дает синергетический эффект +15% к конверсии'
        ]
      },
      generated_at: new Date().toISOString()
    }

    return analysis
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Выполняет когортный анализ
 * @param {Object} params - Параметры анализа: {cohort_type, time_period, metrics}
 * @returns {Promise<Object>} - Результат когортного анализа
 */
export const runCohortAnalysis = async (params) => {
  try {
    const response = await apiClient.post('/analytics/cohort', params)

    // TODO: Заменить на реальный когортный анализ
    const analysis = {
      analysis_id: Date.now().toString(),
      cohort_type: params.cohort_type || 'monthly',
      time_period: params.time_period || 12,
      cohorts: [
        {
          cohort_name: 'Октябрь 2024',
          cohort_size: 1200,
          periods: [
            { period: 0, retention: 100.0, revenue: 6000000 },
            { period: 1, retention: 65.2, revenue: 4800000 },
            { period: 2, retention: 45.8, revenue: 3600000 },
            { period: 3, retention: 32.1, revenue: 2400000 }
          ]
        },
        {
          cohort_name: 'Ноябрь 2024',
          cohort_size: 1450,
          periods: [
            { period: 0, retention: 100.0, revenue: 7250000 },
            { period: 1, retention: 68.7, revenue: 5600000 },
            { period: 2, retention: 48.9, revenue: 4200000 }
          ]
        },
        {
          cohort_name: 'Декабрь 2024',
          cohort_size: 1680,
          periods: [
            { period: 0, retention: 100.0, revenue: 8400000 },
            { period: 1, retention: 71.2, revenue: 6300000 }
          ]
        }
      ],
      insights: [
        'Удержание клиентов улучшается: декабрьская когорта показывает +6% удержания',
        'Средний LTV клиента составляет 18,750 ₽',
        'Пик падения удержания приходится на 2-3 месяц после регистрации'
      ],
      generated_at: new Date().toISOString()
    }

    return analysis
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Генерирует прогнозную модель
 * @param {Object} config - Конфигурация модели: {model_type, features, target_metric, time_horizon}
 * @returns {Promise<Object>} - Результат прогнозной модели
 */
export const generatePredictiveModel = async (config) => {
  try {
    const response = await apiClient.post('/analytics/predictive-model', config)

    // TODO: Заменить на реальную прогнозную модель
    const model = {
      model_id: Date.now().toString(),
      model_type: config.model_type || 'revenue_forecast',
      target_metric: config.target_metric || 'revenue',
      time_horizon: config.time_horizon || 90,
      accuracy_score: 0.87,
      predictions: [
        {
          date: '2025-01-01',
          predicted_value: 15800000,
          confidence_interval: [14200000, 17400000],
          factors: {
            seasonality: 0.15,
            trend: 0.08,
            marketing_spend: 0.25,
            external_factors: 0.05
          }
        },
        {
          date: '2025-02-01',
          predicted_value: 14200000,
          confidence_interval: [12800000, 15600000],
          factors: {
            seasonality: -0.10,
            trend: 0.08,
            marketing_spend: 0.20,
            external_factors: 0.02
          }
        },
        {
          date: '2025-03-01',
          predicted_value: 16500000,
          confidence_interval: [14900000, 18100000],
          factors: {
            seasonality: 0.12,
            trend: 0.08,
            marketing_spend: 0.28,
            external_factors: 0.07
          }
        }
      ],
      feature_importance: [
        { feature: 'marketing_spend', importance: 0.45 },
        { feature: 'seasonality', importance: 0.28 },
        { feature: 'previous_performance', importance: 0.18 },
        { feature: 'external_factors', importance: 0.09 }
      ],
      recommendations: [
        'Увеличить маркетинговые инвестиции в марте на 15% для максимизации сезонного эффекта',
        'Сфокусироваться на каналах с высоким ROI в февральский спад',
        'Подготовить дополнительный бюджет на Q2 для поддержания роста'
      ],
      generated_at: new Date().toISOString()
    }

    return model
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает трендовые данные
 * @param {Object} params - Параметры: {metric, time_period, granularity, comparison}
 * @returns {Promise<Object>} - Трендовые данные
 */
export const getTrendData = async (params) => {
  try {
    const response = await apiClient.get('/analytics/trends', params)

    // TODO: Заменить на реальные тренды
    const trends = {
      metric: params.metric || 'revenue',
      time_period: params.time_period || 30,
      granularity: params.granularity || 'daily',
      data: [
        { date: '2024-12-01', value: 1155000, previous_value: 890000 },
        { date: '2024-12-02', value: 486000, previous_value: 520000 },
        { date: '2024-12-03', value: 590000, previous_value: 445000 },
        { date: '2024-12-04', value: 252000, previous_value: 280000 },
        { date: '2024-12-05', value: 370000, previous_value: 315000 }
      ],
      statistics: {
        total_change: 29.8,
        average_daily_change: 5.96,
        volatility: 0.24,
        trend_direction: 'up'
      },
      generated_at: new Date().toISOString()
    }

    return trends
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Поиск по данным производительности
 * @param {string} query - Поисковый запрос
 * @returns {Promise<Array>} - Результаты поиска
 */
export const searchPerformanceData = async (query) => {
  try {
    const response = await apiClient.get('/performance-data/search', { q: query })

    // Поиск в моках
    const searchTerm = query.toLowerCase()
    return performanceDataMock.filter(item =>
      item.activity_name?.toLowerCase().includes(searchTerm) ||
      item.campaign_name?.toLowerCase().includes(searchTerm) ||
      item.channel?.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает сравнительный анализ
 * @param {Object} params - Параметры сравнения: {period1, period2, metrics}
 * @returns {Promise<Object>} - Результат сравнения
 */
export const getComparativeAnalysis = async (params) => {
  try {
    const response = await apiClient.post('/analytics/compare', params)

    // TODO: Заменить на реальное сравнение
    const comparison = {
      comparison_id: Date.now().toString(),
      period1: params.period1,
      period2: params.period2,
      metrics: {
        revenue: {
          period1_value: 12683000,
          period2_value: 10245000,
          change: 23.8,
          trend: 'up'
        },
        conversions: {
          period1_value: 2485,
          period2_value: 2156,
          change: 15.3,
          trend: 'up'
        },
        roi: {
          period1_value: 285.5,
          period2_value: 267.8,
          change: 6.6,
          trend: 'up'
        },
        cost: {
          period1_value: 3105750,
          period2_value: 2987500,
          change: 4.0,
          trend: 'up'
        }
      },
      insights: [
        'Выручка выросла на 23.8% при увеличении затрат всего на 4%',
        'ROI улучшился на 6.6 п.п., показывая повышение эффективности',
        'Количество конверсий выросло на 15.3%, что указывает на улучшение качества трафика'
      ],
      generated_at: new Date().toISOString()
    }

    return comparison
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает основные KPI для главного дашборда
 * @param {Object} params - Параметры: {start_date, end_date}
 * @returns {Promise<Object>} - Основные KPI с трендами
 */
export const getMainKPIs = async (params = {}) => {
  try {
    const response = await apiClient.get('/analytics/main-kpis', params)

    // TODO: Заменить на реальные данные KPI
    const mainKPIs = {
      revenue: {
        current: 12683000,
        previous: 10245000,
        trend: 23.8,
        target: 15000000,
        forecast: 14200000
      },
      roi: {
        current: 285.5,
        previous: 267.8,
        trend: 6.6,
        target: 300.0,
        forecast: 291.2
      },
      conversions: {
        current: 2485,
        previous: 2156,
        trend: 15.3,
        target: 2800,
        forecast: 2650
      },
      cpa: {
        current: 1250,
        previous: 1385,
        trend: -9.7,
        target: 1100,
        forecast: 1180
      },
      impressions: {
        current: 1317500,
        previous: 1156400,
        trend: 13.9,
        target: 1500000,
        forecast: 1425000
      },
      ctr: {
        current: 3.8,
        previous: 3.2,
        trend: 18.8,
        target: 4.2,
        forecast: 4.1
      }
    }

    return mainKPIs
  } catch (error) {
    apiClient.handleError(error)
    return {} // Return empty object for KPIs
  }
}

/**
 * Получает данные доходов по периодам
 * @param {Object} params - Параметры: {period}
 * @returns {Promise<Array>} - Данные доходов
 */
export const getRevenueData = async (params = {}) => {
  try {
    const response = await apiClient.get('/analytics/revenue-data', params)

    // TODO: Заменить на реальные данные
    const period = params.period || 'month'

    if (period === 'month') {
      return [
        { date: '2024-12-01', revenue: 1155000, roi: 275.5 },
        { date: '2024-12-02', revenue: 486000, roi: 245.2 },
        { date: '2024-12-03', revenue: 590000, roi: 298.7 },
        { date: '2024-12-04', revenue: 252000, roi: 234.1 },
        { date: '2024-12-05', revenue: 370000, roi: 289.3 },
        { date: '2024-12-06', revenue: 815000, roi: 312.8 },
        { date: '2024-12-07', revenue: 695000, roi: 267.9 }
      ]
    } else if (period === 'quarter') {
      return [
        { date: 'Q1 2024', revenue: 35000000, roi: 265.5 },
        { date: 'Q2 2024', revenue: 42000000, roi: 285.2 },
        { date: 'Q3 2024', revenue: 38000000, roi: 278.7 },
        { date: 'Q4 2024', revenue: 45000000, roi: 295.1 }
      ]
    } else {
      return [
        { date: '2022', revenue: 120000000, roi: 245.5 },
        { date: '2023', revenue: 145000000, roi: 268.2 },
        { date: '2024', revenue: 160000000, roi: 281.1 }
      ]
    }
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает данные по каналам
 * @returns {Promise<Array>} - Данные по каналам
 */
export const getChannelData = async () => {
  try {
    const response = await apiClient.get('/analytics/channel-data')

    // TODO: Заменить на реальные данные
    return [
      { name: 'Google Ads', value: 4500000, percentage: 35.5 },
      { name: 'Email', value: 3580000, percentage: 28.2 },
      { name: 'Yandex Direct', value: 2800000, percentage: 22.1 },
      { name: 'Instagram', value: 1803000, percentage: 14.2 }
    ]
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает географические данные
 * @param {Object} params - Параметры: {metric}
 * @returns {Promise<Array>} - Географические данные
 */
export const getGeoData = async (params = {}) => {
  try {
    const response = await apiClient.get('/analytics/geo-data', params)

    // TODO: Заменить на реальные данные
    const metric = params.metric || 'revenue'

    return [
      {
        id: 'moscow',
        name: 'Москва',
        value: metric === 'revenue' ? 5200000 : 1245,
        growth: 12.5,
        latitude: 55.7558,
        longitude: 37.6176
      },
      {
        id: 'spb',
        name: 'Санкт-Петербург',
        value: metric === 'revenue' ? 3800000 : 890,
        growth: 8.3,
        latitude: 59.9311,
        longitude: 30.3609
      },
      {
        id: 'ekb',
        name: 'Екатеринбург',
        value: metric === 'revenue' ? 1500000 : 345,
        growth: 15.7,
        latitude: 56.8431,
        longitude: 60.6454
      },
      {
        id: 'nsk',
        name: 'Новосибирск',
        value: metric === 'revenue' ? 1200000 : 278,
        growth: 18.2,
        latitude: 55.0084,
        longitude: 82.9357
      },
      {
        id: 'kzn',
        name: 'Казань',
        value: metric === 'revenue' ? 983000 : 234,
        growth: 22.1,
        latitude: 55.8304,
        longitude: 49.0661
      }
    ]
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает список дашбордов
 * @returns {Promise<Array>} - Список дашбордов
 */
export const getDashboards = async () => {
  try {
    const response = await apiClient.get('/dashboards')
    return [...dashboardsMock]
  } catch (error) {
    apiClient.handleError(error)
    return []
  }
}

/**
 * Получает конкретный дашборд по ID
 * @param {string} dashboardId - ID дашборда
 * @returns {Promise<Object>} - Данные дашборда
 */
export const getDashboard = async (dashboardId) => {
  try {
    const response = await apiClient.get(`/dashboards/${dashboardId}`)

    const dashboard = dashboardsMock.find(d => d.dashboard_id === dashboardId)
    if (!dashboard) return null

    // Получаем отчеты и виджеты для дашборда
    const reports = reportsMock.filter(r => r.dashboard_id === dashboardId)
    const widgets = widgetsMock.filter(w => w.dashboard_id === dashboardId)

    return {
      ...dashboard,
      reports,
      widgets
    }
  } catch (error) {
    apiClient.handleError(error)
    return null
  }
}

/**
 * Получает отчеты для дашборда
 * @param {string} dashboardId - ID дашборда
 * @param {string} tabId - ID вкладки (опционально)
 * @returns {Promise<Array>} - Список отчетов
 */
export const getDashboardReports = async (dashboardId, tabId = null) => {
  try {
    const params = { dashboard_id: dashboardId }
    if (tabId) params.tab_id = tabId

    const response = await apiClient.get('/dashboard-reports', params)

    let reports = reportsMock.filter(r => r.dashboard_id === dashboardId)
    if (tabId) {
      reports = reports.filter(r => r.tab_id === tabId)
    }

    return reports
  } catch (error) {
    apiClient.handleError(error)
    return []
  }
}

/**
 * Получает виджеты для дашборда
 * @param {string} dashboardId - ID дашборда
 * @param {string} tabId - ID вкладки (опционально)
 * @returns {Promise<Array>} - Список виджетов
 */
export const getDashboardWidgets = async (dashboardId, tabId = null) => {
  try {
    const params = { dashboard_id: dashboardId }
    if (tabId) params.tab_id = tabId

    const response = await apiClient.get('/dashboard-widgets', params)

    let widgets = widgetsMock.filter(w => w.dashboard_id === dashboardId)
    if (tabId) {
      widgets = widgets.filter(w => w.tab_id === tabId)
    }

    return widgets
  } catch (error) {
    apiClient.handleError(error)
    return []
  }
}

/**
 * Получает все отчеты
 * @param {Object} filters - Фильтры: {category, type}
 * @returns {Promise<Array>} - Список отчетов
 */
export const getReports = async (filters = {}) => {
  try {
    const response = await apiClient.get('/reports', filters)

    let reports = [...reportsMock]

    if (filters.category) {
      reports = reports.filter(r => r.category === filters.category)
    }

    if (filters.type) {
      reports = reports.filter(r => r.type === filters.type)
    }

    return reports
  } catch (error) {
    apiClient.handleError(error)
    return []
  }
}

/**
 * Получает топ кампании
 * @returns {Promise<Array>} - Топ кампании
 */
export const getTopCampaigns = async () => {
  try {
    const response = await apiClient.get('/analytics/top-campaigns')

    // TODO: Заменить на реальные данные
    return [
      {
        id: 'camp_001',
        name: 'Запуск Kreola Premium',
        channel: 'Google Ads',
        revenue: 2000000,
        roi: 345.5,
        period: 'Дек 2024'
      },
      {
        id: 'camp_002',
        name: 'Influencer кампания',
        channel: 'Instagram',
        revenue: 1800000,
        roi: 289.3,
        period: 'Дек 2024'
      },
      {
        id: 'camp_003',
        name: 'Email-рассылка',
        channel: 'Email',
        revenue: 1550000,
        roi: 1580.0,
        period: 'Дек 2024'
      },
      {
        id: 'camp_004',
        name: 'Контекстная реклама',
        channel: 'Yandex Direct',
        revenue: 1220000,
        roi: 275.8,
        period: 'Дек 2024'
      },
      {
        id: 'camp_005',
        name: 'Видеореклама',
        channel: 'YouTube',
        revenue: 1100000,
        roi: 267.2,
        period: 'Дек 2024'
      }
    ]
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает быстрорастущие сегменты
 * @returns {Promise<Array>} - Быстрорастущие сегменты
 */
export const getGrowingSegments = async () => {
  try {
    const response = await apiClient.get('/analytics/growing-segments')

    // TODO: Заменить на реальные данные
    return [
      {
        id: 'seg_001',
        name: 'Молодые профессионалы',
        category: 'Демография',
        growth: 28.5,
        customers: 1245
      },
      {
        id: 'seg_002',
        name: 'Премиум сегмент',
        category: 'Продукт',
        growth: 35.2,
        customers: 890
      },
      {
        id: 'seg_003',
        name: 'Мобильные пользователи',
        category: 'Устройство',
        growth: 22.1,
        customers: 2340
      },
      {
        id: 'seg_004',
        name: 'Повторные покупатели',
        category: 'Поведение',
        growth: 18.7,
        customers: 1567
      }
    ]
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает данные кампаний для анализа производительности
 * @returns {Promise<Array>} - Данные кампаний
 */
export const getCampaignsData = async () => {
  try {
    const response = await apiClient.get('/analytics/campaigns-data')

    // TODO: Заменить на реальные данные
    return [
      {
        id: 'camp_001',
        name: 'Запуск Kreola Premium',
        channel: 'Google Ads',
        status: 'active',
        product: 'Kreola Premium',
        region: 'Москва',
        revenue: 2000000,
        cost: 580000,
        roi: 345.5,
        conversions: 487,
        impressions: 125000,
        clicks: 4750,
        ctr: 3.8,
        cpa: 1190
      },
      {
        id: 'camp_002',
        name: 'Influencer кампания',
        channel: 'Instagram',
        status: 'active',
        product: 'Kreola Basic',
        region: 'Санкт-Петербург',
        revenue: 1800000,
        cost: 620000,
        roi: 289.3,
        conversions: 356,
        impressions: 89000,
        clicks: 3560,
        ctr: 4.0,
        cpa: 1742
      },
      {
        id: 'camp_003',
        name: 'Email-рассылка',
        channel: 'Email',
        status: 'completed',
        product: 'Kreola Enterprise',
        region: 'Москва',
        revenue: 1550000,
        cost: 98000,
        roi: 1580.0,
        conversions: 423,
        impressions: 45000,
        clicks: 2700,
        ctr: 6.0,
        cpa: 232
      },
      {
        id: 'camp_004',
        name: 'Контекстная реклама',
        channel: 'Yandex Direct',
        status: 'active',
        product: 'Kreola Premium',
        region: 'Екатеринбург',
        revenue: 1220000,
        cost: 442000,
        roi: 275.8,
        conversions: 298,
        impressions: 156000,
        clicks: 4680,
        ctr: 3.0,
        cpa: 1483
      },
      {
        id: 'camp_005',
        name: 'Видеореклама',
        channel: 'YouTube',
        status: 'paused',
        product: 'Kreola Basic',
        region: 'Новосибирск',
        revenue: 1100000,
        cost: 411000,
        roi: 267.2,
        conversions: 267,
        impressions: 78000,
        clicks: 2340,
        ctr: 3.0,
        cpa: 1539
      },
      {
        id: 'camp_006',
        name: 'SMM кампания',
        channel: 'Instagram',
        status: 'active',
        product: 'Kreola Premium',
        region: 'Казань',
        revenue: 890000,
        cost: 345000,
        roi: 258.0,
        conversions: 189,
        impressions: 67000,
        clicks: 2010,
        ctr: 3.0,
        cpa: 1825
      }
    ]
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает временные данные производительности
 * @param {Object} params - Параметры: {period, metric}
 * @returns {Promise<Array>} - Временные данные производительности
 */
export const getPerformanceTimeData = async (params = {}) => {
  try {
    const response = await apiClient.get('/analytics/performance-time-data', params)

    // TODO: Заменить на реальные данные
    const metric = params.metric || 'conversions'
    const period = params.period || 'month'

    if (period === 'month') {
      return [
        { date: '2024-12-01', value: metric === 'conversions' ? 487 : 2000000 },
        { date: '2024-12-02', value: metric === 'conversions' ? 356 : 1800000 },
        { date: '2024-12-03', value: metric === 'conversions' ? 423 : 1550000 },
        { date: '2024-12-04', value: metric === 'conversions' ? 298 : 1220000 },
        { date: '2024-12-05', value: metric === 'conversions' ? 267 : 1100000 },
        { date: '2024-12-06', value: metric === 'conversions' ? 189 : 890000 },
        { date: '2024-12-07', value: metric === 'conversions' ? 345 : 1450000 }
      ]
    } else if (period === 'quarter') {
      return [
        { date: 'Q1 2024', value: metric === 'conversions' ? 2840 : 35000000 },
        { date: 'Q2 2024', value: metric === 'conversions' ? 3120 : 42000000 },
        { date: 'Q3 2024', value: metric === 'conversions' ? 2980 : 38000000 },
        { date: 'Q4 2024', value: metric === 'conversions' ? 3365 : 45000000 }
      ]
    } else {
      return [
        { date: '2022', value: metric === 'conversions' ? 8400 : 120000000 },
        { date: '2023', value: metric === 'conversions' ? 9800 : 145000000 },
        { date: '2024', value: metric === 'conversions' ? 12305 : 160000000 }
      ]
    }
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}

/**
 * Получает ROI KPI данные
 * @returns {Promise<Array>} - ROI KPI данные
 */
export const getROIKPIs = async () => {
  try {
    const response = await apiClient.get('/analytics/roi-kpis')

    // TODO: Заменить на реальные данные
    return [
      {
        id: 'overall_roi',
        title: 'Общий ROI',
        value: 285.5,
        target: 300.0,
        trend: 6.6,
        format: 'percent',
        color: 'success'
      },
      {
        id: 'marketing_roi',
        title: 'ROI маркетинга',
        value: 312.8,
        target: 350.0,
        trend: 8.2,
        format: 'percent',
        color: 'success'
      },
      {
        id: 'digital_roi',
        title: 'ROI цифровых каналов',
        value: 275.3,
        target: 280.0,
        trend: 4.8,
        format: 'percent',
        color: 'warning'
      },
      {
        id: 'traditional_roi',
        title: 'ROI традиционных каналов',
        value: 189.7,
        target: 200.0,
        trend: -2.1,
        format: 'percent',
        color: 'error'
      },
      {
        id: 'customer_roi',
        title: 'ROI по клиентам',
        value: 425.6,
        target: 400.0,
        trend: 12.3,
        format: 'percent',
        color: 'success'
      },
      {
        id: 'campaign_roi',
        title: 'ROI кампаний',
        value: 298.4,
        target: 300.0,
        trend: 5.7,
        format: 'percent',
        color: 'primary'
      }
    ]
  } catch (error) {
    apiClient.handleError(error)
    return [] // Always return empty array as fallback
  }
}