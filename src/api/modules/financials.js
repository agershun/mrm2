/**
 * API модуль для работы с финансовыми данными
 * Реализует методы из TABLES.md для таблиц Actuals, ActualsSplits, PurchaseOrders, POSplits, Costs, CellComments, AuditTrail
 */

import apiClient from '../client.js'

// Импортируем моки
import actualsMock from '../mocks/actuals.mock.json'
import actualsSplitsMock from '../mocks/actualsSplits.mock.json'
import purchaseOrdersMock from '../mocks/purchaseOrders.mock.json'
import poSplitsMock from '../mocks/poSplits.mock.json'
import costsMock from '../mocks/costs.mock.json'
import cellCommentsMock from '../mocks/cellComments.mock.json'
import auditTrailMock from '../mocks/auditTrail.mock.json'

/**
 * Получает отфильтрованный список фактических расходов
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Список фактических расходов
 */
export const getActuals = async (filters = {}) => {
  try {
    const response = await apiClient.get('/actuals', filters)

    // Возвращаем данные из мока
    let actuals = [...actualsMock]

    // Применяем фильтры
    if (filters.mapped !== undefined) {
      actuals = actuals.filter(actual => actual.is_mapped === filters.mapped)
    }
    if (filters.vendor) {
      actuals = actuals.filter(actual =>
        actual.vendor?.toLowerCase().includes(filters.vendor.toLowerCase())
      )
    }
    if (filters.dateFrom) {
      actuals = actuals.filter(actual =>
        new Date(actual.transaction_date) >= new Date(filters.dateFrom)
      )
    }
    if (filters.dateTo) {
      actuals = actuals.filter(actual =>
        new Date(actual.transaction_date) <= new Date(filters.dateTo)
      )
    }

    return actuals
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает запись о фактических расходах вручную
 * @param {Object} data - Данные о фактическом расходе
 * @returns {Promise<Object>} - Созданная запись
 */
export const createActual = async (data) => {
  try {
    const response = await apiClient.post('/actuals', data)

    // TODO: Заменить на реальное создание
    return {
      actual_id: Date.now().toString(),
      is_mapped: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Импортирует фактические расходы из внешней финансовой системы
 * @param {Object} data - Данные для импорта
 * @param {Object} options - Опции импорта
 * @returns {Promise<Object>} - Результат импорта
 */
export const importActuals = async (data, options = {}) => {
  try {
    const response = await apiClient.post('/actuals/import', { data, options })

    // TODO: Заменить на реальный импорт
    return {
      imported_count: data.length || 0,
      errors: [],
      success: true
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Привязывает фактический расход к статье бюджета
 * @param {string} actualId - ID фактического расхода
 * @param {string} investmentId - ID статьи инвестиций
 * @returns {Promise<void>}
 */
export const mapActual = async (actualId, investmentId) => {
  try {
    const response = await apiClient.put(`/actuals/${actualId}/map`, { investmentId })

    // TODO: Заменить на реальное обновление
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Отвязывает фактический расход от статьи бюджета
 * @param {string} actualId - ID фактического расхода
 * @returns {Promise<void>}
 */
export const unmapActual = async (actualId) => {
  try {
    const response = await apiClient.put(`/actuals/${actualId}/unmap`)

    // TODO: Заменить на реальное обновление
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает все части (сплиты) для конкретного фактического расхода
 * @param {string} actualId - ID фактического расхода
 * @returns {Promise<Array>} - Список сплитов
 */
export const getActualSplits = async (actualId) => {
  try {
    const response = await apiClient.get(`/actuals/${actualId}/splits`)

    // Возвращаем данные из мока
    return actualsSplitsMock.filter(split => split.actual_id === actualId)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает список заказов на закупку
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Список заказов на закупку
 */
export const getPurchaseOrders = async (filters = {}) => {
  try {
    const response = await apiClient.get('/purchase-orders', filters)

    // Возвращаем данные из мока
    let pos = [...purchaseOrdersMock]

    // Применяем фильтры
    if (filters.mapped !== undefined) {
      pos = pos.filter(po => po.is_mapped === filters.mapped)
    }
    if (filters.vendor) {
      pos = pos.filter(po =>
        po.vendor_name?.toLowerCase().includes(filters.vendor.toLowerCase())
      )
    }
    if (filters.status) {
      pos = pos.filter(po => po.status === filters.status)
    }

    return pos
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает запись о PO вручную
 * @param {Object} data - Данные о заказе на закупку
 * @returns {Promise<Object>} - Созданная запись
 */
export const createPurchaseOrder = async (data) => {
  try {
    const response = await apiClient.post('/purchase-orders', data)

    // TODO: Заменить на реальное создание
    return {
      po_id: Date.now().toString(),
      is_mapped: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет данные существующего PO
 * @param {string} poId - ID заказа на закупку
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная запись
 */
export const updatePurchaseOrder = async (poId, data) => {
  try {
    const response = await apiClient.put(`/purchase-orders/${poId}`, data)

    // TODO: Заменить на реальное обновление
    return {
      po_id: poId,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет PO
 * @param {string} poId - ID заказа на закупку
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deletePurchaseOrder = async (poId) => {
  try {
    const response = await apiClient.delete(`/purchase-orders/${poId}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Импортирует данные о PO из внешней финансовой системы
 * @param {Object} data - Данные для импорта
 * @param {Object} options - Опции импорта
 * @returns {Promise<Object>} - Результат импорта
 */
export const importPurchaseOrders = async (data, options = {}) => {
  try {
    const response = await apiClient.post('/purchase-orders/import', { data, options })

    // TODO: Заменить на реальный импорт
    return {
      imported_count: data.length || 0,
      errors: [],
      success: true
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Привязывает (сопоставляет) импортированный PO к статье бюджета
 * @param {string} poId - ID заказа на закупку
 * @param {string} investmentId - ID статьи инвестиций
 * @returns {Promise<void>}
 */
export const mapPurchaseOrder = async (poId, investmentId) => {
  try {
    const response = await apiClient.put(`/purchase-orders/${poId}/map`, { investmentId })

    // TODO: Заменить на реальное обновление
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Отвязывает PO от статьи бюджета
 * @param {string} poId - ID заказа на закупку
 * @returns {Promise<void>}
 */
export const unmapPurchaseOrder = async (poId) => {
  try {
    const response = await apiClient.put(`/purchase-orders/${poId}/unmap`)

    // TODO: Заменить на реальное обновление
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Управляет амортизацией (распределением суммы PO по периодам)
 * @param {string} poId - ID заказа на закупку
 * @param {Object} data - Данные амортизации
 * @returns {Promise<void>}
 */
export const manageAmortization = async (poId, data) => {
  try {
    const response = await apiClient.put(`/purchase-orders/${poId}/amortization`, data)

    // TODO: Заменить на реальное управление амортизацией
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает все части (сплиты) для конкретного заказа на закупку
 * @param {string} poId - ID заказа на закупку
 * @returns {Promise<Array>} - Список сплитов
 */
export const getPurchaseOrderSplits = async (poId) => {
  try {
    const response = await apiClient.get(`/purchase-orders/${poId}/splits`)

    // Возвращаем данные из мока
    return poSplitsMock.filter(split => split.po_id === poId)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает или обновляет сплиты для PO
 * @param {string} poId - ID заказа на закупку
 * @param {Array} splitData - Данные о разделении
 * @returns {Promise<void>}
 */
export const splitPurchaseOrder = async (poId, splitData) => {
  try {
    const response = await apiClient.put(`/purchase-orders/${poId}/splits`, { splits: splitData })

    // TODO: Заменить на реальное создание/обновление сплитов
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает все виды затрат для конкретной активности
 * @param {string} activityId - ID активности
 * @returns {Promise<Array>} - Список затрат
 */
export const getActivityCosts = async (activityId) => {
  try {
    const response = await apiClient.get(`/activities/${activityId}/costs`)

    // Возвращаем данные из мока
    return costsMock.filter(cost => cost.activity_id === activityId)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет данные о затратах активности
 * @param {string} activityId - ID активности
 * @param {Object} costData - Данные о затратах
 * @returns {Promise<void>}
 */
export const updateActivityCosts = async (activityId, costData) => {
  try {
    const response = await apiClient.put(`/activities/${activityId}/costs`, costData)

    // TODO: Заменить на реальное обновление
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает все комментарии для конкретной ячейки
 * @param {string} valueId - ID значения ячейки
 * @returns {Promise<Array>} - Список комментариев
 */
export const getCellComments = async (valueId) => {
  try {
    const response = await apiClient.get(`/cell-comments/${valueId}`)

    // Возвращаем данные из мока
    return cellCommentsMock.filter(comment => comment.value_id === valueId)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Добавляет новый комментарий к ячейке
 * @param {string} valueId - ID значения ячейки
 * @param {Object} commentData - Данные комментария
 * @returns {Promise<void>}
 */
export const addCellComment = async (valueId, commentData) => {
  try {
    const response = await apiClient.post(`/cell-comments/${valueId}`, commentData)

    // TODO: Заменить на реальное добавление
    return {
      comment_id: Date.now().toString(),
      value_id: valueId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...commentData
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Редактирует существующий комментарий
 * @param {string} commentId - ID комментария
 * @param {Object} commentData - Новые данные комментария
 * @returns {Promise<Object>} - Обновленный комментарий
 */
export const updateCellComment = async (commentId, commentData) => {
  try {
    const response = await apiClient.put(`/cell-comments/${commentId}`, commentData)

    // TODO: Заменить на реальное обновление
    return {
      comment_id: commentId,
      ...commentData,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет комментарий
 * @param {string} commentId - ID комментария
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteCellComment = async (commentId) => {
  try {
    const response = await apiClient.delete(`/cell-comments/${commentId}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает журнал всех действий пользователей, связанных с определенным объектом
 * @param {string} objectId - ID объекта
 * @param {string} objectType - Тип объекта (Investment, Budget, PO, Actual, Activity, Comment)
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Журнал аудита
 */
export const getAuditTrail = async (objectId, objectType, filters = {}) => {
  try {
    const response = await apiClient.get('/audit-trail', { objectId, objectType, ...filters })

    // Возвращаем данные из мока
    let trail = auditTrailMock.filter(entry =>
      entry.object_id === objectId && entry.object_type === objectType
    )

    // Применяем фильтры
    if (filters.actionType) {
      trail = trail.filter(entry => entry.action_type === filters.actionType)
    }
    if (filters.userId) {
      trail = trail.filter(entry => entry.user_id === filters.userId)
    }
    if (filters.dateFrom) {
      trail = trail.filter(entry =>
        new Date(entry.action_timestamp) >= new Date(filters.dateFrom)
      )
    }
    if (filters.dateTo) {
      trail = trail.filter(entry =>
        new Date(entry.action_timestamp) <= new Date(filters.dateTo)
      )
    }

    return trail.sort((a, b) => new Date(b.action_timestamp) - new Date(a.action_timestamp))
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Поиск фактических расходов по ключевому слову
 * @param {string} keyword - Ключевое слово для поиска
 * @returns {Promise<Array>} - Результаты поиска
 */
export const searchActuals = async (keyword) => {
  try {
    const response = await apiClient.get('/actuals/search', { keyword })

    // Поиск в моках
    const searchTerm = keyword.toLowerCase()
    return actualsMock.filter(actual =>
      actual.vendor?.toLowerCase().includes(searchTerm) ||
      actual.description?.toLowerCase().includes(searchTerm) ||
      actual.po_number?.toLowerCase().includes(searchTerm) ||
      actual.invoice_number?.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Поиск заказов на закупку по ключевому слову
 * @param {string} keyword - Ключевое слово для поиска
 * @returns {Promise<Array>} - Результаты поиска
 */
export const searchPurchaseOrders = async (keyword) => {
  try {
    const response = await apiClient.get('/purchase-orders/search', { keyword })

    // Поиск в моках
    const searchTerm = keyword.toLowerCase()
    return purchaseOrdersMock.filter(po =>
      po.vendor_name?.toLowerCase().includes(searchTerm) ||
      po.description?.toLowerCase().includes(searchTerm) ||
      po.po_number?.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    apiClient.handleError(error)
  }
}

// Псевдонимы для совместимости со сценариями
export const fetchConnectedPOs = getPurchaseOrders
export const manageAmortizationForActuals = manageAmortization