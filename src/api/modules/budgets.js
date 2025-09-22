/**
 * API модуль для работы с бюджетами
 * Реализует методы из TABLES.md для таблицы Budgets
 */

import apiClient from '../client.js'

// Импортируем моки
import budgetsMock from '../mocks/budgets.mock.json'
import budgetRequestsMock from '../mocks/budgetRequests.mock.json'

/**
 * Загружает древовидную структуру бюджетов для указанного финансового года
 * @param {Object|number} filterParams - Параметры фильтрации или год
 * @returns {Promise<Array>} - Иерархическая структура бюджетов
 */
export const getBudgetHierarchy = async (filterParams = {}) => {
  try {
    // Поддерживаем как объект, так и число
    let fiscalYear = 2025
    if (typeof filterParams === 'number') {
      fiscalYear = filterParams
    } else if (filterParams?.fiscalYear) {
      fiscalYear = filterParams.fiscalYear
    }

    const response = await apiClient.get('/budgets/hierarchy', { fiscalYear })

    // Возвращаем данные из мока, фильтруем по году
    return [...budgetsMock].filter(budget => budget.fiscal_year === fiscalYear)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую папку в иерархии бюджетов
 * @param {Object} data - Данные папки: {name, parent_budget_id}
 * @returns {Promise<Object>} - Созданная папка
 */
export const createBudgetFolder = async (data) => {
  try {
    const response = await apiClient.post('/budgets/folders', {
      ...data,
      budget_type: 'Folder'
    })

    // TODO: Заменить на реальное создание
    return {
      budget_id: Date.now().toString(),
      budget_type: 'Folder',
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый План Инвестиций
 * @param {Object} data - Данные плана: {name, parent_budget_id}
 * @returns {Promise<Object>} - Созданный план инвестиций
 */
export const createInvestmentPlan = async (data) => {
  try {
    const response = await apiClient.post('/budgets/investment-plans', {
      ...data,
      budget_type: 'Investment Plan'
    })

    // TODO: Заменить на реальное создание
    return {
      budget_id: Date.now().toString(),
      budget_type: 'Investment Plan',
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет элемент иерархии (переименование папки или плана)
 * @param {string} id - ID элемента
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный элемент
 */
export const updateBudgetHierarchyItem = async (id, data) => {
  try {
    const response = await apiClient.put(`/budgets/${id}`, data)

    // TODO: Заменить на реальное обновление
    return {
      budget_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает агрегированные финансовые данные для папки или плана
 * @param {string} budgetId - ID бюджета
 * @returns {Promise<Object>} - Сводные финансовые данные
 */
export const getBudgetRollup = async (budgetId) => {
  try {
    const response = await apiClient.get(`/budgets/${budgetId}/rollup`)

    // TODO: Заменить на реальные данные из мока
    return {
      budgetId,
      totalPlanned: 0,
      totalActual: 0,
      totalCommitted: 0,
      variance: 0,
      currency: 'RUB'
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет элемент иерархии бюджетов
 * @param {string} id - ID элемента
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteBudgetHierarchyItem = async (id) => {
  try {
    const response = await apiClient.delete(`/budgets/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает список запросов на бюджет
 * @param {Object} filters - Фильтры для запросов
 * @returns {Promise<Array>} - Список запросов на бюджет
 */
export const getBudgetRequests = async (filters = {}) => {
  try {
    const response = await apiClient.get('/budget-requests', filters)

    // Возвращаем данные из мока
    let requests = [...budgetRequestsMock]

    // Применяем фильтры
    if (filters.status) {
      requests = requests.filter(request => request.status === filters.status)
    }
    if (filters.budget_id) {
      requests = requests.filter(request => request.budget_id === filters.budget_id)
    }
    if (filters.department) {
      requests = requests.filter(request => request.department === filters.department)
    }

    return requests
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый запрос на бюджет
 * @param {Object} data - Данные запроса
 * @returns {Promise<Object>} - Созданный запрос
 */
export const createBudgetRequest = async (data) => {
  try {
    const response = await apiClient.post('/budget-requests', data)

    // TODO: Заменить на реальное создание
    return {
      request_id: Date.now().toString(),
      status: 'pending',
      requested_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Одобряет запрос на бюджет
 * @param {string} requestId - ID запроса
 * @returns {Promise<Object>} - Обновленный запрос
 */
export const approveBudgetRequest = async (requestId) => {
  try {
    const response = await apiClient.put(`/budget-requests/${requestId}/approve`)

    // TODO: Заменить на реальное одобрение
    return {
      request_id: requestId,
      status: 'approved',
      approved_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Отклоняет запрос на бюджет
 * @param {string} requestId - ID запроса
 * @param {string} reason - Причина отклонения
 * @returns {Promise<Object>} - Обновленный запрос
 */
export const rejectBudgetRequest = async (requestId, reason = '') => {
  try {
    const response = await apiClient.put(`/budget-requests/${requestId}/reject`, { reason })

    // TODO: Заменить на реальное отклонение
    return {
      request_id: requestId,
      status: 'rejected',
      rejection_reason: reason,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Поиск бюджетов по ключевому слову
 * @param {string} keyword - Ключевое слово для поиска
 * @returns {Promise<Array>} - Результаты поиска
 */
export const searchBudgets = async (keyword) => {
  try {
    const response = await apiClient.get('/budgets/search', { keyword })

    // Поиск в моках
    const searchTerm = keyword.toLowerCase()
    return budgetsMock.filter(budget =>
      budget.name.toLowerCase().includes(searchTerm) ||
      budget.description?.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    apiClient.handleError(error)
  }
}

// Псевдоним для совместимости со сценариями
export const fetchRollupData = getBudgetRollup