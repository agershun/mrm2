/**
 * API модуль для работы с конфигурацией
 * Реализует методы из TABLES.md для таблиц NColumns, ForecastStatusTags, ScenarioTags
 */

import apiClient from '../client.js'

// Импортируем моки
import nColumnsMock from '../mocks/nColumns.mock.json'
import forecastStatusTagsMock from '../mocks/forecastStatusTags.mock.json'
import scenarioTagsMock from '../mocks/scenarioTags.mock.json'

/**
 * ===== NCOLUMNS =====
 */

/**
 * Получает настраиваемые колонки
 * @param {string} tableName - Название таблицы (опционально)
 * @returns {Promise<Array>} - Массив настраиваемых колонок
 */
export const getNColumns = async (tableName = null) => {
  try {
    const params = tableName ? { table_name: tableName } : {}
    const response = await apiClient.get('/config/ncolumns', params)

    let data = [...nColumnsMock]

    if (tableName) {
      data = data.filter(column => column.table_name === tableName)
    }

    return data.sort((a, b) => a.display_order - b.display_order)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает настраиваемую колонку по ID
 * @param {string} id - ID колонки
 * @returns {Promise<Object>} - Объект колонки
 */
export const getNColumn = async (id) => {
  try {
    const response = await apiClient.get(`/config/ncolumns/${id}`)
    return nColumnsMock.find(column => column.ncolumn_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую настраиваемую колонку
 * @param {Object} data - Данные колонки
 * @returns {Promise<Object>} - Созданная колонка
 */
export const createNColumn = async (data) => {
  try {
    const response = await apiClient.post('/config/ncolumns', data)
    return {
      ncolumn_id: Date.now().toString(),
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
 * Обновляет настраиваемую колонку
 * @param {string} id - ID колонки
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная колонка
 */
export const updateNColumn = async (id, data) => {
  try {
    const response = await apiClient.put(`/config/ncolumns/${id}`, data)
    return {
      ncolumn_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет настраиваемую колонку
 * @param {string} id - ID колонки
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteNColumn = async (id) => {
  try {
    const response = await apiClient.delete(`/config/ncolumns/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Изменяет порядок колонок
 * @param {string} tableName - Название таблицы
 * @param {Array} columnIds - Массив ID колонок в новом порядке
 * @returns {Promise<boolean>} - Результат изменения порядка
 */
export const reorderNColumns = async (tableName, columnIds) => {
  try {
    const response = await apiClient.post('/config/ncolumns/reorder', {
      table_name: tableName,
      column_ids: columnIds
    })
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== FORECAST STATUS TAGS =====
 */

/**
 * Получает теги статуса прогноза
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив тегов
 */
export const getForecastStatusTags = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/config/forecast-status-tags', params)

    let data = [...forecastStatusTagsMock]

    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(tag =>
        tag.name.toLowerCase().includes(search) ||
        tag.description?.toLowerCase().includes(search)
      )
    }

    if (filters.status) {
      data = data.filter(tag => tag.status === filters.status)
    }

    if (filters.is_active !== undefined) {
      data = data.filter(tag => tag.is_active === filters.is_active)
    }

    return data.sort((a, b) => a.display_order - b.display_order)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает тег статуса прогноза по ID
 * @param {string} id - ID тега
 * @returns {Promise<Object>} - Объект тега
 */
export const getForecastStatusTag = async (id) => {
  try {
    const response = await apiClient.get(`/config/forecast-status-tags/${id}`)
    return forecastStatusTagsMock.find(tag => tag.tag_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый тег статуса прогноза
 * @param {Object} data - Данные тега
 * @returns {Promise<Object>} - Созданный тег
 */
export const createForecastStatusTag = async (data) => {
  try {
    const response = await apiClient.post('/config/forecast-status-tags', data)
    return {
      tag_id: Date.now().toString(),
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
 * Обновляет тег статуса прогноза
 * @param {string} id - ID тега
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный тег
 */
export const updateForecastStatusTag = async (id, data) => {
  try {
    const response = await apiClient.put(`/config/forecast-status-tags/${id}`, data)
    return {
      tag_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет тег статуса прогноза
 * @param {string} id - ID тега
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteForecastStatusTag = async (id) => {
  try {
    const response = await apiClient.delete(`/config/forecast-status-tags/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== SCENARIO TAGS =====
 */

/**
 * Получает теги сценариев
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив тегов
 */
export const getScenarioTags = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/config/scenario-tags', params)

    let data = [...scenarioTagsMock]

    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(tag =>
        tag.name.toLowerCase().includes(search) ||
        tag.description?.toLowerCase().includes(search)
      )
    }

    if (filters.category) {
      data = data.filter(tag => tag.category === filters.category)
    }

    if (filters.is_active !== undefined) {
      data = data.filter(tag => tag.is_active === filters.is_active)
    }

    return data.sort((a, b) => a.display_order - b.display_order)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает тег сценария по ID
 * @param {string} id - ID тега
 * @returns {Promise<Object>} - Объект тега
 */
export const getScenarioTag = async (id) => {
  try {
    const response = await apiClient.get(`/config/scenario-tags/${id}`)
    return scenarioTagsMock.find(tag => tag.tag_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый тег сценария
 * @param {Object} data - Данные тега
 * @returns {Promise<Object>} - Созданный тег
 */
export const createScenarioTag = async (data) => {
  try {
    const response = await apiClient.post('/config/scenario-tags', data)
    return {
      tag_id: Date.now().toString(),
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
 * Обновляет тег сценария
 * @param {string} id - ID тега
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный тег
 */
export const updateScenarioTag = async (id, data) => {
  try {
    const response = await apiClient.put(`/config/scenario-tags/${id}`, data)
    return {
      tag_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет тег сценария
 * @param {string} id - ID тега
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteScenarioTag = async (id) => {
  try {
    const response = await apiClient.delete(`/config/scenario-tags/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== УПРАВЛЕНИЕ КОНФИГУРАЦИЕЙ =====
 */

/**
 * Экспортирует конфигурацию
 * @param {string} configType - Тип конфигурации (all, ncolumns, tags)
 * @returns {Promise<Object>} - Экспортированная конфигурация
 */
export const exportConfig = async (configType = 'all') => {
  try {
    const response = await apiClient.get('/config/export', { config_type: configType })

    const config = {}

    if (configType === 'all' || configType === 'ncolumns') {
      config.ncolumns = await getNColumns()
    }

    if (configType === 'all' || configType === 'tags') {
      config.forecast_status_tags = await getForecastStatusTags()
      config.scenario_tags = await getScenarioTags()
    }

    return {
      config,
      config_type: configType,
      exported_at: new Date().toISOString(),
      version: '1.0'
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Импортирует конфигурацию
 * @param {Object} configData - Данные конфигурации
 * @returns {Promise<Object>} - Результат импорта
 */
export const importConfig = async (configData) => {
  try {
    const response = await apiClient.post('/config/import', configData)

    // Мок импорта
    return {
      imported_items: {
        ncolumns: configData.config?.ncolumns?.length || 0,
        forecast_status_tags: configData.config?.forecast_status_tags?.length || 0,
        scenario_tags: configData.config?.scenario_tags?.length || 0
      },
      imported_at: new Date().toISOString(),
      success: true
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Сбрасывает конфигурацию к значениям по умолчанию
 * @param {string} configType - Тип конфигурации для сброса
 * @returns {Promise<boolean>} - Результат сброса
 */
export const resetConfig = async (configType = 'all') => {
  try {
    const response = await apiClient.post('/config/reset', { config_type: configType })
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
 */

/**
 * Получает колонки по таблице и типу
 * @param {string} tableName - Название таблицы
 * @param {string} dataType - Тип данных
 * @returns {Promise<Array>} - Массив колонок
 */
export const getNColumnsByTableAndType = async (tableName, dataType) => {
  try {
    const columns = await getNColumns(tableName)
    return columns.filter(column => column.data_type === dataType)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает активные колонки таблицы
 * @param {string} tableName - Название таблицы
 * @returns {Promise<Array>} - Массив активных колонок
 */
export const getActiveNColumns = async (tableName) => {
  try {
    const columns = await getNColumns(tableName)
    return columns.filter(column => column.is_active)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Валидирует конфигурацию колонки
 * @param {Object} columnData - Данные колонки
 * @returns {Promise<Object>} - Результат валидации
 */
export const validateNColumnConfig = async (columnData) => {
  try {
    const response = await apiClient.post('/config/ncolumns/validate', columnData)

    // Мок валидации
    const errors = []
    const warnings = []

    if (!columnData.name) {
      errors.push('Название колонки обязательно')
    }

    if (!columnData.data_type) {
      errors.push('Тип данных обязателен')
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      validated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает схему таблицы
 * @param {string} tableName - Название таблицы
 * @returns {Promise<Object>} - Схема таблицы
 */
export const getTableSchema = async (tableName) => {
  try {
    const response = await apiClient.get(`/config/tables/${tableName}/schema`)

    // Мок схемы таблицы
    return {
      table_name: tableName,
      columns: [
        { name: 'id', type: 'string', required: true, primary_key: true },
        { name: 'name', type: 'string', required: true },
        { name: 'created_at', type: 'datetime', required: true }
      ],
      indexes: ['id', 'name'],
      relationships: []
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает теги по категории
 * @param {string} tagType - Тип тега (forecast_status, scenario)
 * @param {string} category - Категория
 * @returns {Promise<Array>} - Массив тегов
 */
export const getTagsByCategory = async (tagType, category) => {
  try {
    if (tagType === 'forecast_status') {
      const tags = await getForecastStatusTags()
      return tags.filter(tag => tag.status === category)
    } else if (tagType === 'scenario') {
      const tags = await getScenarioTags()
      return tags.filter(tag => tag.category === category)
    }

    return []
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Изменяет порядок тегов
 * @param {string} tagType - Тип тега
 * @param {Array} tagIds - Массив ID тегов в новом порядке
 * @returns {Promise<boolean>} - Результат изменения порядка
 */
export const reorderTags = async (tagType, tagIds) => {
  try {
    const response = await apiClient.post(`/config/${tagType}-tags/reorder`, {
      tag_ids: tagIds
    })
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Копирует конфигурацию между таблицами
 * @param {string} sourceTable - Исходная таблица
 * @param {string} targetTable - Целевая таблица
 * @returns {Promise<Object>} - Результат копирования
 */
export const copyTableConfig = async (sourceTable, targetTable) => {
  try {
    const response = await apiClient.post('/config/ncolumns/copy', {
      source_table: sourceTable,
      target_table: targetTable
    })

    return {
      source_table: sourceTable,
      target_table: targetTable,
      copied_columns: 0,
      copied_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает историю изменений конфигурации
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - История изменений
 */
export const getConfigHistory = async (filters = {}) => {
  try {
    const response = await apiClient.get('/config/history', filters)

    // Мок истории
    return [
      {
        change_id: '1',
        config_type: 'ncolumn',
        entity_id: '1',
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