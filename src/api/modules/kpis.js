/**
 * API модуль для работы с KPI
 * Реализует методы для управления KPI с поддержкой временных периодов и связей
 */

import apiClient from '../client.js'

// Импортируем моки
import kpisMock from '../mocks/kpis.mock.json'
import activityKPIValuesMock from '../mocks/activityKPIValues.mock.json'

/**
 * ===== KPIs =====
 */

/**
 * Получает список KPI
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Object>} - Объект с массивом KPI
 */
export const getKPIs = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/kpis', params)

    let data = [...kpisMock]

    // Применяем фильтры
    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(kpi =>
        kpi.name.toLowerCase().includes(search) ||
        kpi.description?.toLowerCase().includes(search)
      )
    }

    if (filters.status) {
      data = data.filter(kpi => kpi.status === filters.status)
    }

    if (filters.type) {
      data = data.filter(kpi => kpi.type === filters.type)
    }

    if (filters.period) {
      data = data.filter(kpi => kpi.period === filters.period)
    }

    if (filters.cross_period_id) {
      data = data.filter(kpi => kpi.cross_period_id === filters.cross_period_id)
    }

    if (filters.category) {
      data = data.filter(kpi => kpi.category === filters.category)
    }

    if (filters.owner) {
      data = data.filter(kpi => kpi.owner === filters.owner)
    }

    return { data }
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
    const response = await apiClient.get(`/kpis/${id}`)
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
    const response = await apiClient.post('/kpis', data)
    return {
      data: {
        kpi_id: Date.now().toString(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
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
    const response = await apiClient.put(`/kpis/${id}`, data)
    return {
      data: {
        kpi_id: id,
        ...data,
        updated_at: new Date().toISOString()
      }
    }
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
    const response = await apiClient.delete(`/kpis/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Связывает KPI с активностями
 * @param {string} kpiId - ID KPI
 * @param {Array} activityIds - Массив ID активностей
 * @returns {Promise<Object>} - Результат связывания
 */
export const linkToActivities = async (kpiId, activityIds) => {
  try {
    const response = await apiClient.post(`/kpis/${kpiId}/activities`, { activity_ids: activityIds })
    return { success: true, kpi_id: kpiId, activity_ids: activityIds }
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
    const response = await apiClient.get('/kpis/activity-values', params)

    let data = [...activityKPIValuesMock]

    if (filters.activity_id) {
      data = data.filter(value => value.activity_id === filters.activity_id)
    }

    if (filters.kpi_id) {
      data = data.filter(value => value.kpi_id === filters.kpi_id)
    }

    if (filters.period) {
      data = data.filter(value => value.period === filters.period)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает значение KPI для активности
 * @param {Object} data - Данные значения KPI
 * @returns {Promise<Object>} - Созданное значение KPI
 */
export const createActivityKPIValue = async (data) => {
  try {
    const response = await apiClient.post('/kpis/activity-values', data)
    return {
      activity_kpi_value_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет значение KPI для активности
 * @param {string} id - ID значения KPI
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленное значение KPI
 */
export const updateActivityKPIValue = async (id, data) => {
  try {
    const response = await apiClient.put(`/kpis/activity-values/${id}`, data)
    return {
      activity_kpi_value_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет значение KPI для активности
 * @param {string} id - ID значения KPI
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteActivityKPIValue = async (id) => {
  try {
    const response = await apiClient.delete(`/kpis/activity-values/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
 */

/**
 * Получает KPI по активности
 * @param {string} activityId - ID активности
 * @returns {Promise<Array>} - Массив KPI для активности
 */
export const getKPIsByActivity = async (activityId) => {
  try {
    const values = await getActivityKPIValues({ activity_id: activityId })
    const kpiIds = [...new Set(values.map(value => value.kpi_id))]

    const allKPIs = await getKPIs()
    return allKPIs.data.filter(kpi => kpiIds.includes(kpi.kpi_id))
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает KPI по периоду и типу
 * @param {string} period - Период
 * @param {string} type - Тип KPI
 * @returns {Promise<Array>} - Массив KPI
 */
export const getKPIsByPeriodType = async (period, type) => {
  try {
    const filters = {}
    if (period) filters.period = period
    if (type) filters.type = type

    const response = await getKPIs(filters)
    return response.data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает прогресс KPI
 * @param {string} kpiId - ID KPI
 * @returns {Promise<Object>} - Прогресс KPI
 */
export const getKPIProgress = async (kpiId) => {
  try {
    const response = await apiClient.get(`/kpis/${kpiId}/progress`)

    // Мок расчета прогресса
    const kpi = await getKPI(kpiId)
    if (!kpi) {
      return { progress: 0, current_value: 0, target_value: 0 }
    }

    const currentValue = kpi.current_value || 0
    const targetValue = kpi.target_value || 1
    const progress = Math.min(Math.round((currentValue / targetValue) * 100), 100)

    return {
      progress,
      current_value: currentValue,
      target_value: targetValue,
      unit: kpi.unit || '',
      status: progress >= 100 ? 'achieved' : progress >= 80 ? 'on_track' : 'at_risk'
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет значение KPI
 * @param {string} kpiId - ID KPI
 * @param {number} currentValue - Текущее значение
 * @returns {Promise<Object>} - Обновленный KPI
 */
export const updateKPIValue = async (kpiId, currentValue) => {
  return updateKPI(kpiId, {
    current_value: currentValue,
    updated_at: new Date().toISOString()
  })
}

/**
 * Получает KPI по сквозному идентификатору
 * @param {string} crossPeriodId - Сквозной идентификатор
 * @returns {Promise<Array>} - Массив KPI с одним сквозным ID
 */
export const getKPIsByCrossPeriodId = async (crossPeriodId) => {
  try {
    const response = await getKPIs({ cross_period_id: crossPeriodId })
    return response.data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Дублирует KPI на новый период
 * @param {string} kpiId - ID KPI для дублирования
 * @param {string} newPeriod - Новый период
 * @param {string} newName - Новое название (опционально)
 * @returns {Promise<Object>} - Дублированный KPI
 */
export const duplicateKPIForPeriod = async (kpiId, newPeriod, newName = null) => {
  try {
    const response = await apiClient.post(`/kpis/${kpiId}/duplicate`, {
      period: newPeriod,
      name: newName
    })

    // Мок дублирования
    const original = await getKPI(kpiId)
    if (!original) throw new Error('KPI не найден')

    return {
      data: {
        ...original,
        kpi_id: Date.now().toString(),
        name: newName || original.name,
        period: newPeriod,
        current_value: 0, // Сбрасываем текущее значение
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Поиск KPI
 * @param {string} keyword - Ключевое слово
 * @returns {Promise<Array>} - Найденные KPI
 */
export const searchKPIs = async (keyword) => {
  return getKPIs({ search: keyword })
}

/**
 * Получает агрегированные данные по KPI
 * @param {Object} filters - Фильтры
 * @returns {Promise<Object>} - Агрегированные данные
 */
export const getKPIAggregates = async (filters = {}) => {
  try {
    const response = await getKPIs(filters)
    const kpis = response.data

    const totalKPIs = kpis.length
    const achievedKPIs = kpis.filter(kpi => {
      const progress = kpi.current_value / (kpi.target_value || 1) * 100
      return progress >= 100
    }).length
    const onTrackKPIs = kpis.filter(kpi => {
      const progress = kpi.current_value / (kpi.target_value || 1) * 100
      return progress >= 80 && progress < 100
    }).length
    const atRiskKPIs = kpis.filter(kpi => {
      const progress = kpi.current_value / (kpi.target_value || 1) * 100
      return progress < 80
    }).length

    return {
      total: totalKPIs,
      achieved: achievedKPIs,
      on_track: onTrackKPIs,
      at_risk: atRiskKPIs,
      achievement_rate: totalKPIs > 0 ? Math.round((achievedKPIs / totalKPIs) * 100) : 0
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}