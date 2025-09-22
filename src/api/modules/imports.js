/**
 * API модуль для работы с импортом данных
 * Реализует методы из TABLES.md для таблиц ImportTemplates, ScheduledImports, ImportHistory
 */

import apiClient from '../client.js'

// Импортируем моки
import importTemplatesMock from '../mocks/importTemplates.mock.json'
import scheduledImportsMock from '../mocks/scheduledImports.mock.json'
import importHistoryMock from '../mocks/importHistory.mock.json'

/**
 * ===== IMPORT TEMPLATES =====
 */

/**
 * Получает список шаблонов импорта
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив шаблонов импорта
 */
export const getImportTemplates = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/imports/templates', params)

    let data = [...importTemplatesMock]

    // Применяем фильтры
    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(template =>
        template.name.toLowerCase().includes(search) ||
        template.description?.toLowerCase().includes(search)
      )
    }

    if (filters.entity_type) {
      data = data.filter(template => template.entity_type === filters.entity_type)
    }

    if (filters.is_active !== undefined) {
      data = data.filter(template => template.is_active === filters.is_active)
    }

    if (filters.created_by) {
      data = data.filter(template => template.created_by === filters.created_by)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает шаблон импорта по ID
 * @param {string} id - ID шаблона
 * @returns {Promise<Object>} - Объект шаблона импорта
 */
export const getImportTemplate = async (id) => {
  try {
    const response = await apiClient.get(`/imports/templates/${id}`)
    return importTemplatesMock.find(template => template.template_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый шаблон импорта
 * @param {Object} data - Данные шаблона
 * @returns {Promise<Object>} - Созданный шаблон
 */
export const createImportTemplate = async (data) => {
  try {
    const response = await apiClient.post('/imports/templates', data)
    return {
      template_id: Date.now().toString(),
      ...data,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет шаблон импорта
 * @param {string} id - ID шаблона
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный шаблон
 */
export const updateImportTemplate = async (id, data) => {
  try {
    const response = await apiClient.put(`/imports/templates/${id}`, data)
    return {
      template_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет шаблон импорта
 * @param {string} id - ID шаблона
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteImportTemplate = async (id) => {
  try {
    const response = await apiClient.delete(`/imports/templates/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== SCHEDULED IMPORTS =====
 */

/**
 * Получает список запланированных импортов
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив запланированных импортов
 */
export const getScheduledImports = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/imports/scheduled', params)

    let data = [...scheduledImportsMock]

    if (filters.template_id) {
      data = data.filter(scheduled => scheduled.template_id === filters.template_id)
    }

    if (filters.is_enabled !== undefined) {
      data = data.filter(scheduled => scheduled.is_enabled === filters.is_enabled)
    }

    if (filters.schedule_type) {
      data = data.filter(scheduled => scheduled.schedule_type === filters.schedule_type)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает запланированный импорт по ID
 * @param {string} id - ID запланированного импорта
 * @returns {Promise<Object>} - Объект запланированного импорта
 */
export const getScheduledImport = async (id) => {
  try {
    const response = await apiClient.get(`/imports/scheduled/${id}`)
    return scheduledImportsMock.find(scheduled => scheduled.schedule_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый запланированный импорт
 * @param {Object} data - Данные запланированного импорта
 * @returns {Promise<Object>} - Созданный запланированный импорт
 */
export const createScheduledImport = async (data) => {
  try {
    const response = await apiClient.post('/imports/scheduled', data)
    return {
      schedule_id: Date.now().toString(),
      ...data,
      is_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет запланированный импорт
 * @param {string} id - ID запланированного импорта
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный запланированный импорт
 */
export const updateScheduledImport = async (id, data) => {
  try {
    const response = await apiClient.put(`/imports/scheduled/${id}`, data)
    return {
      schedule_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет запланированный импорт
 * @param {string} id - ID запланированного импорта
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteScheduledImport = async (id) => {
  try {
    const response = await apiClient.delete(`/imports/scheduled/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== IMPORT HISTORY =====
 */

/**
 * Получает историю импорта
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив записей истории
 */
export const getImportHistory = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/imports/history', params)

    let data = [...importHistoryMock]

    if (filters.template_id) {
      data = data.filter(history => history.template_id === filters.template_id)
    }

    if (filters.status) {
      data = data.filter(history => history.status === filters.status)
    }

    if (filters.date_from) {
      data = data.filter(history =>
        new Date(history.created_at) >= new Date(filters.date_from)
      )
    }

    if (filters.date_to) {
      data = data.filter(history =>
        new Date(history.created_at) <= new Date(filters.date_to)
      )
    }

    if (filters.limit) {
      data = data.slice(0, filters.limit)
    }

    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает запись истории импорта по ID
 * @param {string} id - ID записи истории
 * @returns {Promise<Object>} - Объект записи истории
 */
export const getImportHistoryRecord = async (id) => {
  try {
    const response = await apiClient.get(`/imports/history/${id}`)
    return importHistoryMock.find(history => history.import_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ВЫПОЛНЕНИЕ ИМПОРТА =====
 */

/**
 * Запускает импорт
 * @param {string} templateId - ID шаблона импорта
 * @param {Object} fileData - Данные файла
 * @param {Object} options - Дополнительные опции
 * @returns {Promise<Object>} - Результат запуска импорта
 */
export const runImport = async (templateId, fileData = null, options = {}) => {
  try {
    const response = await apiClient.post(`/imports/templates/${templateId}/run`, {
      file_data: fileData,
      options
    })

    // Мок запуска импорта
    return {
      import_id: Date.now().toString(),
      template_id: templateId,
      status: 'running',
      file_name: fileData?.name || 'manual_import.csv',
      total_records: 0,
      processed_records: 0,
      successful_records: 0,
      failed_records: 0,
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Отменяет импорт
 * @param {string} importId - ID импорта
 * @returns {Promise<boolean>} - Результат отмены
 */
export const cancelImport = async (importId) => {
  try {
    const response = await apiClient.post(`/imports/history/${importId}/cancel`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Повторно запускает импорт
 * @param {string} importId - ID импорта
 * @returns {Promise<Object>} - Результат повторного запуска
 */
export const retryImport = async (importId) => {
  try {
    const response = await apiClient.post(`/imports/history/${importId}/retry`)

    // Мок повторного запуска
    return {
      import_id: Date.now().toString(),
      original_import_id: importId,
      status: 'running',
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает статус импорта
 * @param {string} importId - ID импорта
 * @returns {Promise<Object>} - Статус импорта
 */
export const getImportStatus = async (importId) => {
  try {
    const response = await apiClient.get(`/imports/history/${importId}/status`)

    // Мок статуса
    const history = importHistoryMock.find(h => h.import_id === importId)
    if (!history) return null

    return {
      import_id: importId,
      status: history.status,
      progress: Math.floor((history.processed_records / history.total_records) * 100) || 0,
      total_records: history.total_records,
      processed_records: history.processed_records,
      successful_records: history.successful_records,
      failed_records: history.failed_records,
      current_step: 'Обработка данных',
      estimated_completion: new Date(Date.now() + 300000).toISOString(),
      last_updated: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает лог импорта
 * @param {string} importId - ID импорта
 * @returns {Promise<Object>} - Лог импорта
 */
export const getImportLog = async (importId) => {
  try {
    const response = await apiClient.get(`/imports/history/${importId}/log`)

    // Мок лога
    return {
      import_id: importId,
      log_entries: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Импорт запущен',
          details: { template_id: '1' }
        },
        {
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Ошибка в строке 5: Неверный формат даты',
          details: { row: 5, column: 'date', value: 'invalid-date' }
        }
      ],
      generated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ВАЛИДАЦИЯ И ПРЕДПРОСМОТР =====
 */

/**
 * Валидирует файл импорта
 * @param {string} templateId - ID шаблона импорта
 * @param {Object} fileData - Данные файла
 * @returns {Promise<Object>} - Результат валидации
 */
export const validateImportFile = async (templateId, fileData) => {
  try {
    const response = await apiClient.post(`/imports/templates/${templateId}/validate`, fileData)

    // Мок валидации
    return {
      is_valid: true,
      errors: [],
      warnings: [
        {
          row: 3,
          column: 'budget',
          message: 'Значение может быть слишком большим',
          value: '1000000'
        }
      ],
      total_rows: 100,
      valid_rows: 99,
      invalid_rows: 1,
      validated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Предварительный просмотр импорта
 * @param {string} templateId - ID шаблона импорта
 * @param {Object} fileData - Данные файла
 * @param {Object} options - Опции предпросмотра
 * @returns {Promise<Object>} - Предварительный просмотр
 */
export const previewImport = async (templateId, fileData, options = {}) => {
  try {
    const response = await apiClient.post(`/imports/templates/${templateId}/preview`, {
      file_data: fileData,
      options
    })

    // Мок предпросмотра
    return {
      template_id: templateId,
      preview_data: [
        {
          row: 1,
          data: { name: 'Кампания 1', budget: 50000, start_date: '2025-01-01' },
          status: 'valid'
        },
        {
          row: 2,
          data: { name: 'Кампания 2', budget: 75000, start_date: '2025-02-01' },
          status: 'valid'
        },
        {
          row: 3,
          data: { name: 'Кампания 3', budget: '', start_date: '2025-03-01' },
          status: 'warning',
          warnings: ['Отсутствует бюджет']
        }
      ],
      total_rows: 3,
      preview_rows: 3,
      mapping: {
        name: 'activity_name',
        budget: 'planned_investment',
        start_date: 'in_market_start_date'
      },
      generated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
 */

/**
 * Дублирует шаблон импорта
 * @param {string} templateId - ID шаблона
 * @param {string} newName - Новое название
 * @returns {Promise<Object>} - Дублированный шаблон
 */
export const duplicateImportTemplate = async (templateId, newName) => {
  try {
    const response = await apiClient.post(`/imports/templates/${templateId}/duplicate`, { name: newName })

    // Мок дублирования
    const original = await getImportTemplate(templateId)
    if (!original) throw new Error('Шаблон не найден')

    return {
      ...original,
      template_id: Date.now().toString(),
      name: newName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает статистику по шаблону импорта
 * @param {string} templateId - ID шаблона
 * @returns {Promise<Object>} - Статистика шаблона
 */
export const getImportTemplateStats = async (templateId) => {
  try {
    const response = await apiClient.get(`/imports/templates/${templateId}/stats`)

    // Мок статистики
    const history = importHistoryMock.filter(h => h.template_id === templateId)

    return {
      template_id: templateId,
      total_imports: history.length,
      successful_imports: history.filter(h => h.status === 'completed').length,
      failed_imports: history.filter(h => h.status === 'failed').length,
      total_records_processed: history.reduce((sum, h) => sum + h.processed_records, 0),
      average_processing_time: 120, // секунды
      last_import_date: history.length > 0 ? history[0].created_at : null,
      success_rate: history.length > 0 ? Math.round((history.filter(h => h.status === 'completed').length / history.length) * 100) : 0
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Экспортирует результаты импорта
 * @param {string} importId - ID импорта
 * @param {string} format - Формат экспорта
 * @returns {Promise<Object>} - Экспортированные данные
 */
export const exportImportResults = async (importId, format = 'csv') => {
  try {
    const response = await apiClient.get(`/imports/history/${importId}/export`, { format })

    return {
      import_id: importId,
      format,
      download_url: `/api/imports/history/${importId}/download`,
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 час
      generated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает шаблоны по типу сущности
 * @param {string} entityType - Тип сущности
 * @returns {Promise<Array>} - Массив шаблонов
 */
export const getImportTemplatesByEntity = async (entityType) => {
  return getImportTemplates({ entity_type: entityType })
}

/**
 * Получает активные расписания
 * @returns {Promise<Array>} - Массив активных расписаний
 */
export const getActiveSchedules = async () => {
  return getScheduledImports({ is_enabled: true })
}

/**
 * Поиск шаблонов импорта
 * @param {string} keyword - Ключевое слово
 * @returns {Promise<Array>} - Найденные шаблоны
 */
export const searchImportTemplates = async (keyword) => {
  return getImportTemplates({ search: keyword })
}