/**
 * API модуль для работы с рабочими процессами
 * Реализует методы из TABLES.md для таблиц WorkflowTypes, Workflows, WorkflowVariables
 */

import apiClient from '../client.js'

// Импортируем моки
import workflowTypesMock from '../mocks/workflowTypes.mock.json'
import workflowsMock from '../mocks/workflows.mock.json'
import workflowVariablesMock from '../mocks/workflowVariables.mock.json'

/**
 * ===== WORKFLOW TYPES =====
 */

/**
 * Получает список типов рабочих процессов
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив типов рабочих процессов
 */
export const getWorkflowTypes = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/workflows/types', params)

    let data = [...workflowTypesMock]

    // Применяем фильтры
    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(type =>
        type.name.toLowerCase().includes(search) ||
        type.description?.toLowerCase().includes(search)
      )
    }

    if (filters.category) {
      data = data.filter(type => type.category === filters.category)
    }

    if (filters.is_template !== undefined) {
      data = data.filter(type => type.is_template === filters.is_template)
    }

    if (filters.is_active !== undefined) {
      data = data.filter(type => type.is_active === filters.is_active)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает тип рабочего процесса по ID
 * @param {string} id - ID типа
 * @returns {Promise<Object>} - Объект типа рабочего процесса
 */
export const getWorkflowType = async (id) => {
  try {
    const response = await apiClient.get(`/workflows/types/${id}`)
    return workflowTypesMock.find(type => type.workflow_type_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый тип рабочего процесса
 * @param {Object} data - Данные типа
 * @returns {Promise<Object>} - Созданный тип
 */
export const createWorkflowType = async (data) => {
  try {
    const response = await apiClient.post('/workflows/types', data)
    return {
      workflow_type_id: Date.now().toString(),
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
 * Обновляет тип рабочего процесса
 * @param {string} id - ID типа
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный тип
 */
export const updateWorkflowType = async (id, data) => {
  try {
    const response = await apiClient.put(`/workflows/types/${id}`, data)
    return {
      workflow_type_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет тип рабочего процесса
 * @param {string} id - ID типа
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteWorkflowType = async (id) => {
  try {
    const response = await apiClient.delete(`/workflows/types/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== WORKFLOWS =====
 */

/**
 * Получает список рабочих процессов
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив рабочих процессов
 */
export const getWorkflows = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/workflows', params)

    let data = [...workflowsMock]

    // Применяем фильтры
    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(workflow =>
        workflow.name.toLowerCase().includes(search) ||
        workflow.description?.toLowerCase().includes(search)
      )
    }

    if (filters.status) {
      data = data.filter(workflow => workflow.status === filters.status)
    }

    if (filters.workflow_type_id) {
      data = data.filter(workflow => workflow.workflow_type_id === filters.workflow_type_id)
    }

    if (filters.entity_type) {
      data = data.filter(workflow => workflow.entity_type === filters.entity_type)
    }

    if (filters.entity_id) {
      data = data.filter(workflow => workflow.entity_id === filters.entity_id)
    }

    if (filters.created_by) {
      data = data.filter(workflow => workflow.created_by === filters.created_by)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает рабочий процесс по ID
 * @param {string} id - ID рабочего процесса
 * @returns {Promise<Object>} - Объект рабочего процесса
 */
export const getWorkflow = async (id) => {
  try {
    const response = await apiClient.get(`/workflows/${id}`)
    return workflowsMock.find(workflow => workflow.workflow_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый рабочий процесс
 * @param {Object} data - Данные рабочего процесса
 * @returns {Promise<Object>} - Созданный рабочий процесс
 */
export const createWorkflow = async (data) => {
  try {
    const response = await apiClient.post('/workflows', data)
    return {
      workflow_id: Date.now().toString(),
      ...data,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет рабочий процесс
 * @param {string} id - ID рабочего процесса
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный рабочий процесс
 */
export const updateWorkflow = async (id, data) => {
  try {
    const response = await apiClient.put(`/workflows/${id}`, data)
    return {
      workflow_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет рабочий процесс
 * @param {string} id - ID рабочего процесса
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteWorkflow = async (id) => {
  try {
    const response = await apiClient.delete(`/workflows/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== WORKFLOW VARIABLES =====
 */

/**
 * Получает переменные рабочих процессов
 * @param {string} workflowId - ID рабочего процесса (опционально)
 * @returns {Promise<Array>} - Массив переменных
 */
export const getWorkflowVariables = async (workflowId = null) => {
  try {
    const params = workflowId ? { workflow_id: workflowId } : {}
    const response = await apiClient.get('/workflows/variables', params)

    let data = [...workflowVariablesMock]

    if (workflowId) {
      data = data.filter(variable => variable.workflow_id === workflowId)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает переменную по ID
 * @param {string} id - ID переменной
 * @returns {Promise<Object>} - Объект переменной
 */
export const getWorkflowVariable = async (id) => {
  try {
    const response = await apiClient.get(`/workflows/variables/${id}`)
    return workflowVariablesMock.find(variable => variable.variable_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую переменную рабочего процесса
 * @param {Object} data - Данные переменной
 * @returns {Promise<Object>} - Созданная переменная
 */
export const createWorkflowVariable = async (data) => {
  try {
    const response = await apiClient.post('/workflows/variables', data)
    return {
      variable_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет переменную рабочего процесса
 * @param {string} id - ID переменной
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная переменная
 */
export const updateWorkflowVariable = async (id, data) => {
  try {
    const response = await apiClient.put(`/workflows/variables/${id}`, data)
    return {
      variable_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет переменную рабочего процесса
 * @param {string} id - ID переменной
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteWorkflowVariable = async (id) => {
  try {
    const response = await apiClient.delete(`/workflows/variables/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== УПРАВЛЕНИЕ РАБОЧИМИ ПРОЦЕССАМИ =====
 */

/**
 * Запускает рабочий процесс
 * @param {string} workflowId - ID рабочего процесса
 * @param {Object} inputData - Входные данные
 * @returns {Promise<Object>} - Результат запуска
 */
export const startWorkflow = async (workflowId, inputData = {}) => {
  try {
    const response = await apiClient.post(`/workflows/${workflowId}/start`, inputData)

    // Мок запуска рабочего процесса
    return {
      workflow_id: workflowId,
      execution_id: Date.now().toString(),
      status: 'running',
      started_at: new Date().toISOString(),
      input_data: inputData
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Останавливает рабочий процесс
 * @param {string} workflowId - ID рабочего процесса
 * @returns {Promise<Object>} - Результат остановки
 */
export const stopWorkflow = async (workflowId) => {
  try {
    const response = await apiClient.post(`/workflows/${workflowId}/stop`)

    return {
      workflow_id: workflowId,
      status: 'stopped',
      stopped_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Возобновляет рабочий процесс
 * @param {string} workflowId - ID рабочего процесса
 * @returns {Promise<Object>} - Результат возобновления
 */
export const resumeWorkflow = async (workflowId) => {
  try {
    const response = await apiClient.post(`/workflows/${workflowId}/resume`)

    return {
      workflow_id: workflowId,
      status: 'running',
      resumed_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает статус выполнения рабочего процесса
 * @param {string} workflowId - ID рабочего процесса
 * @returns {Promise<Object>} - Статус выполнения
 */
export const getWorkflowStatus = async (workflowId) => {
  try {
    const response = await apiClient.get(`/workflows/${workflowId}/status`)

    // Мок статуса
    const workflow = workflowsMock.find(w => w.workflow_id === workflowId)
    if (!workflow) return null

    return {
      workflow_id: workflowId,
      status: workflow.status || 'draft',
      current_step: 1,
      total_steps: 5,
      progress: 20,
      started_at: workflow.started_at,
      last_updated: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает историю выполнения рабочего процесса
 * @param {string} workflowId - ID рабочего процесса
 * @returns {Promise<Array>} - История выполнения
 */
export const getWorkflowHistory = async (workflowId) => {
  try {
    const response = await apiClient.get(`/workflows/${workflowId}/history`)

    // Мок истории
    return [
      {
        execution_id: '1',
        workflow_id: workflowId,
        status: 'completed',
        started_at: '2024-01-01T10:00:00Z',
        completed_at: '2024-01-01T10:30:00Z',
        duration: 1800000
      }
    ]
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
 */

/**
 * Копирует рабочий процесс
 * @param {string} workflowId - ID рабочего процесса
 * @param {string} newName - Новое название
 * @returns {Promise<Object>} - Скопированный рабочий процесс
 */
export const cloneWorkflow = async (workflowId, newName) => {
  try {
    const response = await apiClient.post(`/workflows/${workflowId}/clone`, { name: newName })

    // Мок копирования
    const original = await getWorkflow(workflowId)
    if (!original) throw new Error('Рабочий процесс не найден')

    return {
      ...original,
      workflow_id: Date.now().toString(),
      name: newName,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Валидирует рабочий процесс
 * @param {string} workflowId - ID рабочего процесса
 * @returns {Promise<Object>} - Результат валидации
 */
export const validateWorkflow = async (workflowId) => {
  try {
    const response = await apiClient.post(`/workflows/${workflowId}/validate`)

    // Мок валидации
    return {
      workflow_id: workflowId,
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
 * Экспортирует рабочий процесс
 * @param {string} workflowId - ID рабочего процесса
 * @param {string} format - Формат экспорта
 * @returns {Promise<Object>} - Экспортированные данные
 */
export const exportWorkflow = async (workflowId, format = 'json') => {
  try {
    const response = await apiClient.get(`/workflows/${workflowId}/export`, { format })

    const workflow = await getWorkflow(workflowId)
    const variables = await getWorkflowVariables(workflowId)

    return {
      workflow,
      variables,
      exported_at: new Date().toISOString(),
      format
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Импортирует рабочий процесс
 * @param {Object} workflowData - Данные рабочего процесса
 * @returns {Promise<Object>} - Импортированный рабочий процесс
 */
export const importWorkflow = async (workflowData) => {
  try {
    const response = await apiClient.post('/workflows/import', workflowData)

    // Мок импорта
    return {
      workflow_id: Date.now().toString(),
      ...workflowData.workflow,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает рабочие процессы по типу
 * @param {string} workflowTypeId - ID типа рабочего процесса
 * @returns {Promise<Array>} - Массив рабочих процессов
 */
export const getWorkflowsByType = async (workflowTypeId) => {
  return getWorkflows({ workflow_type_id: workflowTypeId })
}

/**
 * Получает рабочие процессы по сущности
 * @param {string} entityType - Тип сущности
 * @param {string} entityId - ID сущности
 * @returns {Promise<Array>} - Массив рабочих процессов
 */
export const getWorkflowsByEntity = async (entityType, entityId) => {
  return getWorkflows({ entity_type: entityType, entity_id: entityId })
}

/**
 * Поиск рабочих процессов
 * @param {string} keyword - Ключевое слово
 * @returns {Promise<Array>} - Найденные рабочие процессы
 */
export const searchWorkflows = async (keyword) => {
  return getWorkflows({ search: keyword })
}