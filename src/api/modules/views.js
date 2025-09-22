/**
 * API модуль для работы с представлениями
 * Реализует методы из TABLES.md для таблиц Views, ViewSettings
 */

import apiClient from '../client.js'

// Импортируем моки
import viewsMock from '../mocks/views.mock.json'
import viewSettingsMock from '../mocks/viewSettings.mock.json'

/**
 * ===== VIEWS =====
 */

/**
 * Получает список представлений
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив представлений
 */
export const getViews = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/views', params)

    let data = [...viewsMock]

    // Применяем фильтры
    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(view =>
        view.name.toLowerCase().includes(search) ||
        view.description?.toLowerCase().includes(search)
      )
    }

    if (filters.view_type) {
      data = data.filter(view => view.view_type === filters.view_type)
    }

    if (filters.entity_type) {
      data = data.filter(view => view.entity_type === filters.entity_type)
    }

    if (filters.is_default !== undefined) {
      data = data.filter(view => view.is_default === filters.is_default)
    }

    if (filters.is_public !== undefined) {
      data = data.filter(view => view.is_public === filters.is_public)
    }

    if (filters.created_by) {
      data = data.filter(view => view.created_by === filters.created_by)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает представление по ID
 * @param {string} id - ID представления
 * @returns {Promise<Object>} - Объект представления
 */
export const getView = async (id) => {
  try {
    const response = await apiClient.get(`/views/${id}`)
    return viewsMock.find(view => view.view_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новое представление
 * @param {Object} data - Данные представления
 * @returns {Promise<Object>} - Созданное представление
 */
export const createView = async (data) => {
  try {
    const response = await apiClient.post('/views', data)
    return {
      view_id: Date.now().toString(),
      ...data,
      is_public: false,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет представление
 * @param {string} id - ID представления
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленное представление
 */
export const updateView = async (id, data) => {
  try {
    const response = await apiClient.put(`/views/${id}`, data)
    return {
      view_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет представление
 * @param {string} id - ID представления
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteView = async (id) => {
  try {
    const response = await apiClient.delete(`/views/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== VIEW SETTINGS =====
 */

/**
 * Получает настройки представлений
 * @param {string} viewId - ID представления (опционально)
 * @returns {Promise<Array>} - Массив настроек
 */
export const getViewSettings = async (viewId = null) => {
  try {
    const params = viewId ? { view_id: viewId } : {}
    const response = await apiClient.get('/views/settings', params)

    let data = [...viewSettingsMock]

    if (viewId) {
      data = data.filter(setting => setting.view_id === viewId)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает настройку по ID
 * @param {string} id - ID настройки
 * @returns {Promise<Object>} - Объект настройки
 */
export const getViewSetting = async (id) => {
  try {
    const response = await apiClient.get(`/views/settings/${id}`)
    return viewSettingsMock.find(setting => setting.setting_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую настройку представления
 * @param {Object} data - Данные настройки
 * @returns {Promise<Object>} - Созданная настройка
 */
export const createViewSetting = async (data) => {
  try {
    const response = await apiClient.post('/views/settings', data)
    return {
      setting_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет настройку представления
 * @param {string} id - ID настройки
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная настройка
 */
export const updateViewSetting = async (id, data) => {
  try {
    const response = await apiClient.put(`/views/settings/${id}`, data)
    return {
      setting_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет настройку представления
 * @param {string} id - ID настройки
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteViewSetting = async (id) => {
  try {
    const response = await apiClient.delete(`/views/settings/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== УПРАВЛЕНИЕ ПРЕДСТАВЛЕНИЯМИ =====
 */

/**
 * Дублирует представление
 * @param {string} viewId - ID представления
 * @param {string} newName - Новое название
 * @returns {Promise<Object>} - Дублированное представление
 */
export const duplicateView = async (viewId, newName) => {
  try {
    const response = await apiClient.post(`/views/${viewId}/duplicate`, { name: newName })

    // Мок дублирования
    const original = await getView(viewId)
    if (!original) throw new Error('Представление не найдено')

    return {
      ...original,
      view_id: Date.now().toString(),
      name: newName,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Сохраняет макет представления
 * @param {string} viewId - ID представления
 * @param {Object} layoutData - Данные макета
 * @returns {Promise<Object>} - Результат сохранения
 */
export const saveViewLayout = async (viewId, layoutData) => {
  try {
    const response = await apiClient.post(`/views/${viewId}/layout`, layoutData)

    return {
      view_id: viewId,
      layout_data: layoutData,
      saved_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает макет представления
 * @param {string} viewId - ID представления
 * @returns {Promise<Object>} - Данные макета
 */
export const getViewLayout = async (viewId) => {
  try {
    const response = await apiClient.get(`/views/${viewId}/layout`)

    // Мок макета
    return {
      view_id: viewId,
      layout_data: {
        columns: [
          { field: 'name', width: 200, visible: true },
          { field: 'status', width: 100, visible: true },
          { field: 'created_at', width: 150, visible: true }
        ],
        filters: {},
        sort: { field: 'name', direction: 'asc' }
      },
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Предоставляет представление для совместного использования
 * @param {string} viewId - ID представления
 * @param {Object} shareData - Данные предоставления доступа
 * @returns {Promise<Object>} - Результат предоставления доступа
 */
export const shareView = async (viewId, shareData) => {
  try {
    const response = await apiClient.post(`/views/${viewId}/share`, shareData)

    return {
      view_id: viewId,
      share_token: 'share-token-' + Date.now(),
      shared_with: shareData.user_ids || [],
      permissions: shareData.permissions || ['read'],
      shared_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Отзывает доступ к представлению
 * @param {string} viewId - ID представления
 * @param {string} userId - ID пользователя
 * @returns {Promise<boolean>} - Результат отзыва доступа
 */
export const unshareView = async (viewId, userId) => {
  try {
    const response = await apiClient.delete(`/views/${viewId}/share/${userId}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Устанавливает представление по умолчанию
 * @param {string} viewId - ID представления
 * @param {string} entityType - Тип сущности
 * @returns {Promise<Object>} - Результат установки
 */
export const setAsDefault = async (viewId, entityType) => {
  try {
    const response = await apiClient.post(`/views/${viewId}/set-default`, { entity_type: entityType })

    return {
      view_id: viewId,
      entity_type: entityType,
      set_as_default_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ЭКСПОРТ И ИМПОРТ =====
 */

/**
 * Экспортирует представление
 * @param {string} viewId - ID представления
 * @param {string} format - Формат экспорта
 * @returns {Promise<Object>} - Экспортированные данные
 */
export const exportView = async (viewId, format = 'json') => {
  try {
    const response = await apiClient.get(`/views/${viewId}/export`, { format })

    const view = await getView(viewId)
    const settings = await getViewSettings(viewId)

    return {
      view,
      settings,
      exported_at: new Date().toISOString(),
      format
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Импортирует представление
 * @param {Object} viewData - Данные представления
 * @returns {Promise<Object>} - Импортированное представление
 */
export const importView = async (viewData) => {
  try {
    const response = await apiClient.post('/views/import', viewData)

    // Мок импорта
    return {
      view_id: Date.now().toString(),
      ...viewData.view,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
 */

/**
 * Получает представления по типу
 * @param {string} viewType - Тип представления
 * @returns {Promise<Array>} - Массив представлений
 */
export const getViewsByType = async (viewType) => {
  return getViews({ view_type: viewType })
}

/**
 * Получает представления по сущности
 * @param {string} entityType - Тип сущности
 * @returns {Promise<Array>} - Массив представлений
 */
export const getViewsByEntity = async (entityType) => {
  return getViews({ entity_type: entityType })
}

/**
 * Получает публичные представления
 * @returns {Promise<Array>} - Массив публичных представлений
 */
export const getPublicViews = async () => {
  return getViews({ is_public: true })
}

/**
 * Получает представления по умолчанию
 * @param {string} entityType - Тип сущности
 * @returns {Promise<Array>} - Массив представлений по умолчанию
 */
export const getDefaultViews = async (entityType = null) => {
  const filters = { is_default: true }
  if (entityType) {
    filters.entity_type = entityType
  }
  return getViews(filters)
}

/**
 * Получает пользовательские представления
 * @param {string} userId - ID пользователя
 * @returns {Promise<Array>} - Массив пользовательских представлений
 */
export const getUserViews = async (userId) => {
  return getViews({ created_by: userId })
}

/**
 * Клонирует настройки представления
 * @param {string} sourceViewId - ID исходного представления
 * @param {string} targetViewId - ID целевого представления
 * @returns {Promise<Array>} - Скопированные настройки
 */
export const cloneViewSettings = async (sourceViewId, targetViewId) => {
  try {
    const sourceSettings = await getViewSettings(sourceViewId)
    const clonedSettings = []

    for (const setting of sourceSettings) {
      const clonedSetting = await createViewSetting({
        ...setting,
        view_id: targetViewId,
        setting_id: undefined
      })
      clonedSettings.push(clonedSetting)
    }

    return clonedSettings
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Валидирует конфигурацию представления
 * @param {string} viewId - ID представления
 * @returns {Promise<Object>} - Результат валидации
 */
export const validateViewConfiguration = async (viewId) => {
  try {
    const response = await apiClient.post(`/views/${viewId}/validate`)

    // Мок валидации
    return {
      view_id: viewId,
      is_valid: true,
      errors: [],
      warnings: [],
      validated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает историю изменений представления
 * @param {string} viewId - ID представления
 * @returns {Promise<Array>} - История изменений
 */
export const getViewHistory = async (viewId) => {
  try {
    const response = await apiClient.get(`/views/${viewId}/history`)

    // Мок истории
    return [
      {
        change_id: '1',
        view_id: viewId,
        change_type: 'update',
        changed_by: '1',
        changes: { name: 'Новое название' },
        changed_at: new Date().toISOString()
      }
    ]
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Поиск представлений
 * @param {string} keyword - Ключевое слово
 * @returns {Promise<Array>} - Найденные представления
 */
export const searchViews = async (keyword) => {
  return getViews({ search: keyword })
}