/**
 * API модуль для работы с показателями эффективности
 * Реализует методы из TABLES.md для таблиц PerformanceData, KPIs, ActivityKPIValues, FunnelStages, FunnelExceptions
 */

import apiClient from '../client.js'

// Импортируем моки
import performanceDataMock from '../mocks/performanceData.mock.json'
import kpisMock from '../mocks/kpis.mock.json'
import activityKPIValuesMock from '../mocks/activityKPIValues.mock.json'
import funnelStagesMock from '../mocks/funnelStages.mock.json'
import funnelExceptionsMock from '../mocks/funnelExceptions.mock.json'

/**
 * ===== PERFORMANCE DATA =====
 */

/**
 * Получает данные показателей эффективности
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив данных показателей
 */
export const getPerformanceData = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/performance/data', params)

    let data = [...performanceDataMock]

    // Применяем фильтры
    if (filters.activity_id) {
      data = data.filter(item => item.activity_id === filters.activity_id)
    }

    if (filters.kpi_id) {
      data = data.filter(item => item.kpi_id === filters.kpi_id)
    }

    if (filters.date_from) {
      data = data.filter(item => new Date(item.date) >= new Date(filters.date_from))
    }

    if (filters.date_to) {
      data = data.filter(item => new Date(item.date) <= new Date(filters.date_to))
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую запись данных показателей
 * @param {Object} data - Данные показателя
 * @returns {Promise<Object>} - Созданная запись
 */
export const createPerformanceData = async (data) => {
  try {
    const response = await apiClient.post('/performance/data', data)
    return { performance_data_id: Date.now().toString(), ...data, created_at: new Date().toISOString() }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет данные показателя
 * @param {string} id - ID записи
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная запись
 */
export const updatePerformanceData = async (id, data) => {
  try {
    const response = await apiClient.put(`/performance/data/${id}`, data)
    return { performance_data_id: id, ...data, updated_at: new Date().toISOString() }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет данные показателя
 * @param {string} id - ID записи
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deletePerformanceData = async (id) => {
  try {
    const response = await apiClient.delete(`/performance/data/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== KPIs =====
 */

/**
 * Получает список KPI
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив KPI
 */
export const getKPIs = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/performance/kpis', params)

    let data = [...kpisMock]

    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(kpi =>
        kpi.name.toLowerCase().includes(search) ||
        kpi.description?.toLowerCase().includes(search)
      )
    }

    if (filters.category) {
      data = data.filter(kpi => kpi.category === filters.category)
    }

    if (filters.is_active !== undefined) {
      data = data.filter(kpi => kpi.is_active === filters.is_active)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает KPI по ID
 * @param {string} id - ID KPI
 * @returns {Promise<Object>} - Объект KPI
 */
export const getKPI = async (id) => {
  try {
    const response = await apiClient.get(`/performance/kpis/${id}`)
    return kpisMock.find(kpi => kpi.kpi_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый KPI
 * @param {Object} data - Данные KPI
 * @returns {Promise<Object>} - Созданный KPI
 */
export const createKPI = async (data) => {
  try {
    const response = await apiClient.post('/performance/kpis', data)
    return { kpi_id: Date.now().toString(), ...data, created_at: new Date().toISOString() }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет KPI
 * @param {string} id - ID KPI
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный KPI
 */
export const updateKPI = async (id, data) => {
  try {
    const response = await apiClient.put(`/performance/kpis/${id}`, data)
    return { kpi_id: id, ...data, updated_at: new Date().toISOString() }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет KPI
 * @param {string} id - ID KPI
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteKPI = async (id) => {
  try {
    const response = await apiClient.delete(`/performance/kpis/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ACTIVITY KPI VALUES =====
 */

/**
 * Получает значения KPI для активностей
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив значений KPI
 */
export const getActivityKPIValues = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/performance/activity-kpi-values', params)

    let data = [...activityKPIValuesMock]

    if (filters.activity_id) {
      data = data.filter(item => item.activity_id === filters.activity_id)
    }

    if (filters.kpi_id) {
      data = data.filter(item => item.kpi_id === filters.kpi_id)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает значение KPI для активности
 * @param {Object} data - Данные значения KPI
 * @returns {Promise<Object>} - Созданное значение
 */
export const createActivityKPIValue = async (data) => {
  try {
    const response = await apiClient.post('/performance/activity-kpi-values', data)
    return { activity_kpi_value_id: Date.now().toString(), ...data, created_at: new Date().toISOString() }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет значение KPI активности
 * @param {string} id - ID значения
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленное значение
 */
export const updateActivityKPIValue = async (id, data) => {
  try {
    const response = await apiClient.put(`/performance/activity-kpi-values/${id}`, data)
    return { activity_kpi_value_id: id, ...data, updated_at: new Date().toISOString() }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет значение KPI активности
 * @param {string} id - ID значения
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteActivityKPIValue = async (id) => {
  try {
    const response = await apiClient.delete(`/performance/activity-kpi-values/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== FUNNEL STAGES =====
 */

/**
 * Получает стадии воронки
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив стадий воронки
 */
export const getFunnelStages = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/performance/funnel-stages', params)

    let data = [...funnelStagesMock]

    if (filters.funnel_id) {
      data = data.filter(stage => stage.funnel_id === filters.funnel_id)
    }

    if (filters.is_active !== undefined) {
      data = data.filter(stage => stage.is_active === filters.is_active)
    }

    return data.sort((a, b) => a.stage_order - b.stage_order)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает стадию воронки
 * @param {Object} data - Данные стадии
 * @returns {Promise<Object>} - Созданная стадия
 */
export const createFunnelStage = async (data) => {
  try {
    const response = await apiClient.post('/performance/funnel-stages', data)
    return { funnel_stage_id: Date.now().toString(), ...data, created_at: new Date().toISOString() }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет стадию воронки
 * @param {string} id - ID стадии
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная стадия
 */
export const updateFunnelStage = async (id, data) => {
  try {
    const response = await apiClient.put(`/performance/funnel-stages/${id}`, data)
    return { funnel_stage_id: id, ...data, updated_at: new Date().toISOString() }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет стадию воронки
 * @param {string} id - ID стадии
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteFunnelStage = async (id) => {
  try {
    const response = await apiClient.delete(`/performance/funnel-stages/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== FUNNEL EXCEPTIONS =====
 */

/**
 * Получает исключения воронки
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив исключений
 */
export const getFunnelExceptions = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/performance/funnel-exceptions', params)

    let data = [...funnelExceptionsMock]

    if (filters.activity_id) {
      data = data.filter(exception => exception.activity_id === filters.activity_id)
    }

    if (filters.funnel_stage_id) {
      data = data.filter(exception => exception.funnel_stage_id === filters.funnel_stage_id)
    }

    if (filters.exception_type) {
      data = data.filter(exception => exception.exception_type === filters.exception_type)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает исключение воронки
 * @param {Object} data - Данные исключения
 * @returns {Promise<Object>} - Созданное исключение
 */
export const createFunnelException = async (data) => {
  try {
    const response = await apiClient.post('/performance/funnel-exceptions', data)
    return { funnel_exception_id: Date.now().toString(), ...data, created_at: new Date().toISOString() }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет исключение воронки
 * @param {string} id - ID исключения
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленное исключение
 */
export const updateFunnelException = async (id, data) => {
  try {
    const response = await apiClient.put(`/performance/funnel-exceptions/${id}`, data)
    return { funnel_exception_id: id, ...data, updated_at: new Date().toISOString() }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет исключение воронки
 * @param {string} id - ID исключения
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteFunnelException = async (id) => {
  try {
    const response = await apiClient.delete(`/performance/funnel-exceptions/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
 */

/**
 * Получает агрегированные данные по KPI
 * @param {Object} params - Параметры агрегации
 * @returns {Promise<Object>} - Агрегированные данные
 */
export const getKPIAggregation = async (params) => {
  try {
    const response = await apiClient.get('/performance/kpi-aggregation', params)
    // TODO: Реализовать агрегацию в моке
    return { total: 0, average: 0, min: 0, max: 0 }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Поиск по показателям эффективности
 * @param {string} keyword - Ключевое слово
 * @returns {Promise<Array>} - Найденные данные
 */
export const searchPerformanceData = async (keyword) => {
  return getPerformanceData({ search: keyword })
}

/**
 * Поиск по KPI
 * @param {string} keyword - Ключевое слово
 * @returns {Promise<Array>} - Найденные KPI
 */
export const searchKPIs = async (keyword) => {
  return getKPIs({ search: keyword })
}

/**
 * Генерирует отчет по показателям эффективности
 * @param {Object} filters - Фильтры для отчета
 * @returns {Promise<Object>} - Данные отчета
 */
export const generatePerformanceReport = async (filters = {}) => {
  try {
    const response = await apiClient.get('/performance/reports/generate', filters)

    // Получаем данные для отчета
    const performanceData = await getPerformanceData(filters)
    const kpis = await getKPIs({ is_active: true })

    // Агрегируем данные для отчета
    const report = {
      period: filters,
      summary: {
        total_activities: new Set(performanceData.map(d => d.activity_id)).size,
        total_kpis: kpis.length,
        data_points: performanceData.length
      },
      kpi_performance: kpis.map(kpi => {
        const kpiData = performanceData.filter(d => d.kpi_id === kpi.kpi_id)
        const values = kpiData.map(d => parseFloat(d.actual_value || 0))

        return {
          kpi_id: kpi.kpi_id,
          name: kpi.name,
          category: kpi.category,
          total_value: values.reduce((sum, val) => sum + val, 0),
          average_value: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
          min_value: values.length > 0 ? Math.min(...values) : 0,
          max_value: values.length > 0 ? Math.max(...values) : 0,
          data_points: values.length
        }
      }),
      generated_at: new Date().toISOString()
    }

    return report
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Сравнивает показатели эффективности между активностями
 * @param {Array} activityIds - Массив ID активностей для сравнения
 * @param {Object} dateRange - Диапазон дат для сравнения
 * @returns {Promise<Object>} - Данные сравнения
 */
export const compareActivityPerformance = async (activityIds, dateRange = {}) => {
  try {
    const response = await apiClient.post('/performance/compare', { activityIds, dateRange })

    // Получаем данные для каждой активности
    const comparison = {
      activities: [],
      comparison_period: dateRange,
      generated_at: new Date().toISOString()
    }

    for (const activityId of activityIds) {
      const activityData = await getPerformanceData({
        activity_id: activityId,
        ...dateRange
      })

      const kpiValues = await getActivityKPIValues({ activity_id: activityId })

      // Агрегируем данные по активности
      const activitySummary = {
        activity_id: activityId,
        total_data_points: activityData.length,
        kpi_summary: kpiValues.map(kpiVal => {
          const relatedData = activityData.filter(d => d.kpi_id === kpiVal.kpi_id)
          const values = relatedData.map(d => parseFloat(d.actual_value || 0))

          return {
            kpi_id: kpiVal.kpi_id,
            target_value: parseFloat(kpiVal.target_value || 0),
            current_value: parseFloat(kpiVal.current_value || 0),
            variance: parseFloat(kpiVal.current_value || 0) - parseFloat(kpiVal.target_value || 0),
            performance_score: kpiVal.target_value > 0 ?
              (parseFloat(kpiVal.current_value || 0) / parseFloat(kpiVal.target_value)) * 100 : 0,
            trend_data: values
          }
        })
      }

      comparison.activities.push(activitySummary)
    }

    return comparison
  } catch (error) {
    apiClient.handleError(error)
  }
}