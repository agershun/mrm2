/**
 * API модуль для работы с целями
 * Реализует методы из TABLES.md для таблиц Objectives, ObjectiveKeyResults, InvestmentObjectives
 */

import apiClient from '../client.js'

// Импортируем моки
import objectivesMock from '../mocks/objectives.mock.json'
import objectiveKeyResultsMock from '../mocks/objectiveKeyResults.mock.json'
import investmentObjectivesMock from '../mocks/investmentObjectives.mock.json'

/**
 * ===== OBJECTIVES =====
 */

/**
 * Получает список целей
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив целей
 */
export const getObjectives = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/objectives', params)

    let data = [...objectivesMock]

    // Применяем фильтры
    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(objective =>
        objective.name.toLowerCase().includes(search) ||
        objective.description?.toLowerCase().includes(search)
      )
    }

    if (filters.status) {
      data = data.filter(objective => objective.status === filters.status)
    }

    if (filters.type) {
      data = data.filter(objective => objective.type === filters.type)
    }

    if (filters.period) {
      data = data.filter(objective => objective.period === filters.period)
    }

    if (filters.cross_period_id) {
      data = data.filter(objective => objective.cross_period_id === filters.cross_period_id)
    }

    if (filters.parent_objective_id) {
      data = data.filter(objective => objective.parent_objective_id === filters.parent_objective_id)
    }

    if (filters.created_by) {
      data = data.filter(objective => objective.created_by === filters.created_by)
    }

    return { data }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает цель по ID
 * @param {string} id - ID цели
 * @returns {Promise<Object>} - Объект цели
 */
export const getObjective = async (id) => {
  try {
    const response = await apiClient.get(`/objectives/${id}`)
    return objectivesMock.find(objective => objective.objective_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую цель
 * @param {Object} data - Данные цели
 * @returns {Promise<Object>} - Созданная цель
 */
export const createObjective = async (data) => {
  try {
    const response = await apiClient.post('/objectives', data)
    return {
      data: {
        objective_id: Date.now().toString(),
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
 * Обновляет цель
 * @param {string} id - ID цели
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная цель
 */
export const updateObjective = async (id, data) => {
  try {
    const response = await apiClient.put(`/objectives/${id}`, data)
    return {
      data: {
        objective_id: id,
        ...data,
        updated_at: new Date().toISOString()
      }
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет цель
 * @param {string} id - ID цели
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteObjective = async (id) => {
  try {
    const response = await apiClient.delete(`/objectives/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Связывает цель с активностями
 * @param {string} objectiveId - ID цели
 * @param {Array} activityIds - Массив ID активностей
 * @returns {Promise<Object>} - Результат связывания
 */
export const linkToActivities = async (objectiveId, activityIds) => {
  try {
    const response = await apiClient.post(`/objectives/${objectiveId}/activities`, { activity_ids: activityIds })
    return { success: true, objective_id: objectiveId, activity_ids: activityIds }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== OBJECTIVE KEY RESULTS =====
 */

/**
 * Получает ключевые результаты
 * @param {string} objectiveId - ID цели (опционально)
 * @returns {Promise<Array>} - Массив ключевых результатов
 */
export const getObjectiveKeyResults = async (objectiveId = null) => {
  try {
    const params = objectiveId ? { objective_id: objectiveId } : {}
    const response = await apiClient.get('/objectives/key-results', params)

    let data = [...objectiveKeyResultsMock]

    if (objectiveId) {
      data = data.filter(kr => kr.objective_id === objectiveId)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает ключевой результат по ID
 * @param {string} id - ID ключевого результата
 * @returns {Promise<Object>} - Объект ключевого результата
 */
export const getKeyResult = async (id) => {
  try {
    const response = await apiClient.get(`/objectives/key-results/${id}`)
    return objectiveKeyResultsMock.find(kr => kr.key_result_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает ключевой результат
 * @param {Object} data - Данные ключевого результата
 * @returns {Promise<Object>} - Созданный ключевой результат
 */
export const createKeyResult = async (data) => {
  try {
    const response = await apiClient.post('/objectives/key-results', data)
    return {
      key_result_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет ключевой результат
 * @param {string} id - ID ключевого результата
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный ключевой результат
 */
export const updateKeyResult = async (id, data) => {
  try {
    const response = await apiClient.put(`/objectives/key-results/${id}`, data)
    return {
      key_result_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет ключевой результат
 * @param {string} id - ID ключевого результата
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteKeyResult = async (id) => {
  try {
    const response = await apiClient.delete(`/objectives/key-results/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== INVESTMENT OBJECTIVES =====
 */

/**
 * Получает связи инвестиций с целями
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив связей
 */
export const getInvestmentObjectives = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/objectives/investment-objectives', params)

    let data = [...investmentObjectivesMock]

    if (filters.investment_id) {
      data = data.filter(io => io.investment_id === filters.investment_id)
    }

    if (filters.objective_id) {
      data = data.filter(io => io.objective_id === filters.objective_id)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает связь инвестиции с целью
 * @param {Object} data - Данные связи
 * @returns {Promise<Object>} - Созданная связь
 */
export const createInvestmentObjective = async (data) => {
  try {
    const response = await apiClient.post('/objectives/investment-objectives', data)
    return {
      investment_objective_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет связь инвестиции с целью
 * @param {string} investmentId - ID инвестиции
 * @param {string} objectiveId - ID цели
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная связь
 */
export const updateInvestmentObjective = async (investmentId, objectiveId, data) => {
  try {
    const response = await apiClient.put(`/objectives/investment-objectives/${investmentId}/${objectiveId}`, data)
    return {
      investment_id: investmentId,
      objective_id: objectiveId,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет связь инвестиции с целью
 * @param {string} investmentId - ID инвестиции
 * @param {string} objectiveId - ID цели
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteInvestmentObjective = async (investmentId, objectiveId) => {
  try {
    const response = await apiClient.delete(`/objectives/investment-objectives/${investmentId}/${objectiveId}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
 */

/**
 * Получает прогресс цели
 * @param {string} objectiveId - ID цели
 * @returns {Promise<Object>} - Прогресс цели
 */
export const getObjectiveProgress = async (objectiveId) => {
  try {
    const response = await apiClient.get(`/objectives/${objectiveId}/progress`)

    // Мок расчета прогресса
    const keyResults = objectiveKeyResultsMock.filter(kr => kr.objective_id === objectiveId)
    if (keyResults.length === 0) {
      return { progress: 0, completed_key_results: 0, total_key_results: 0 }
    }

    const completedKRs = keyResults.filter(kr => kr.current_value >= kr.target_value).length
    const progress = Math.round((completedKRs / keyResults.length) * 100)

    return {
      progress,
      completed_key_results: completedKRs,
      total_key_results: keyResults.length,
      key_results_progress: keyResults.map(kr => ({
        key_result_id: kr.key_result_id,
        name: kr.name,
        progress: Math.min(Math.round((kr.current_value / kr.target_value) * 100), 100)
      }))
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает дерево целей
 * @param {string} parentId - ID родительской цели
 * @returns {Promise<Array>} - Дерево целей
 */
export const getObjectivesTree = async (parentId = null) => {
  try {
    const objectives = await getObjectives({ parent_objective_id: parentId })

    const buildTree = async (items, currentParentId = null) => {
      const children = items.filter(item => item.parent_objective_id === currentParentId)

      for (const child of children) {
        child.children = await buildTree(items, child.objective_id)
        child.key_results = objectiveKeyResultsMock.filter(kr => kr.objective_id === child.objective_id)
      }

      return children
    }

    return buildTree(objectives, parentId)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает цели по инвестиции
 * @param {string} investmentId - ID инвестиции
 * @returns {Promise<Array>} - Массив целей
 */
export const getObjectivesByInvestment = async (investmentId) => {
  try {
    const links = await getInvestmentObjectives({ investment_id: investmentId })
    const objectiveIds = links.map(link => link.objective_id)

    const allObjectives = await getObjectives()
    return allObjectives.filter(objective => objectiveIds.includes(objective.objective_id))
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает инвестиции по цели
 * @param {string} objectiveId - ID цели
 * @returns {Promise<Array>} - Массив инвестиций с весами
 */
export const getInvestmentsByObjective = async (objectiveId) => {
  try {
    const links = await getInvestmentObjectives({ objective_id: objectiveId })
    return links.map(link => ({
      investment_id: link.investment_id,
      allocation_weight: link.allocation_weight
    }))
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет прогресс ключевого результата
 * @param {string} keyResultId - ID ключевого результата
 * @param {number} currentValue - Текущее значение
 * @returns {Promise<Object>} - Обновленный ключевой результат
 */
export const updateKeyResultProgress = async (keyResultId, currentValue) => {
  return updateKeyResult(keyResultId, {
    current_value: currentValue,
    updated_at: new Date().toISOString()
  })
}

/**
 * Дублирует цель
 * @param {string} objectiveId - ID цели для дублирования
 * @param {string} newName - Новое название
 * @returns {Promise<Object>} - Дублированная цель
 */
export const duplicateObjective = async (objectiveId, newName) => {
  try {
    const response = await apiClient.post(`/objectives/${objectiveId}/duplicate`, { name: newName })

    // Мок дублирования
    const original = await getObjective(objectiveId)
    if (!original) throw new Error('Цель не найдена')

    return {
      ...original,
      objective_id: Date.now().toString(),
      name: newName,
      parent_objective_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Поиск целей
 * @param {string} keyword - Ключевое слово
 * @returns {Promise<Array>} - Найденные цели
 */
export const searchObjectives = async (keyword) => {
  return getObjectives({ search: keyword })
}