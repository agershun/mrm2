/**
 * API модуль для работы с атрибутами
 * Реализует методы из TABLES.md для таблиц Attributes, AttributeListOptions,
 * ActivityAttributeValues, AttributeDependencies
 */

import apiClient from '../client.js'

// Импорт моков
import attributesMock from '../mocks/attributes.mock.json'
import attributeOptionsMock from '../mocks/attributeOptions.mock.json'
import activityAttributeValuesMock from '../mocks/activityAttributeValues.mock.json'
import attributeDependenciesMock from '../mocks/attributeDependencies.mock.json'

// ===== Attributes =====

/**
 * Получает справочник всех доступных атрибутов
 * @returns {Promise<Array>} - Массив атрибутов
 */
export const getAttributes = async () => {
  try {
    await apiClient.get('/attributes')
    return attributesMock
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает один атрибут по ID
 * @param {string} id - ID атрибута
 * @returns {Promise<Object|null>} - Атрибут или null
 */
export const getAttribute = async (id) => {
  try {
    await apiClient.get(`/attributes/${id}`)
    return attributesMock.find(attr => attr.attribute_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый настраиваемый атрибут
 * @param {Object} data - Данные атрибута
 * @returns {Promise<Object>} - Созданный атрибут
 */
export const createAttribute = async (data) => {
  try {
    await apiClient.post('/attributes', data)

    // TODO: Заменить на реальное создание
    return {
      attribute_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет настройки атрибута
 * @param {string} id - ID атрибута
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный атрибут
 */
export const updateAttribute = async (id, data) => {
  try {
    await apiClient.put(`/attributes/${id}`, data)

    // TODO: Заменить на реальное обновление
    return {
      attribute_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет атрибут из системы
 * @param {string} id - ID атрибута
 * @returns {Promise<void>}
 */
export const deleteAttribute = async (id) => {
  try {
    await apiClient.delete(`/attributes/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

// ===== Attribute Groups =====

/**
 * Получает список всех групп атрибутов
 * @returns {Promise<Array>} - Массив групп атрибутов
 */
export const getAttributeGroups = async () => {
  try {
    await apiClient.get('/attribute-groups')

    // TODO: Заменить на реальные данные из мока
    return []
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую логическую группу для атрибутов
 * @param {Object} data - Данные группы
 * @returns {Promise<Object>} - Созданная группа
 */
export const createAttributeGroup = async (data) => {
  try {
    await apiClient.post('/attribute-groups', data)

    // TODO: Заменить на реальное создание
    return {
      group_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет состав атрибутов в группе
 * @param {string} id - ID группы
 * @param {Object} data - Новые данные
 * @returns {Promise<void>}
 */
export const updateAttributeGroup = async (id, data) => {
  try {
    await apiClient.put(`/attribute-groups/${id}`, data)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Изменяет порядок отображения групп атрибутов
 * @param {Object} orderData - Данные о новом порядке
 * @returns {Promise<void>}
 */
export const reorderAttributeGroups = async (orderData) => {
  try {
    await apiClient.put('/attribute-groups/reorder', orderData)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

// ===== Attribute List Options =====

/**
 * Получает все возможные значения для атрибута типа "список"
 * @param {string} attributeId - ID атрибута
 * @returns {Promise<Array>} - Массив опций
 */
export const getAttributeOptions = async (attributeId) => {
  try {
    await apiClient.get(`/attributes/${attributeId}/options`)
    return attributeOptionsMock.filter(option => option.attribute_id === attributeId)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую опцию для атрибута
 * @param {string} attributeId - ID атрибута
 * @param {Object} optionData - Данные опции
 * @returns {Promise<Object>} - Созданная опция
 */
export const createAttributeOption = async (attributeId, optionData) => {
  try {
    await apiClient.post(`/attributes/${attributeId}/options`, optionData)
    return {
      option_id: Date.now().toString(),
      attribute_id: attributeId,
      ...optionData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Добавляет новые опции в список значений атрибута
 * @param {string} attributeId - ID атрибута
 * @param {Array} options - Массив новых опций
 * @returns {Promise<void>}
 */
export const addAttributeOptions = async (attributeId, options) => {
  try {
    await apiClient.post(`/attributes/${attributeId}/options`, { options })
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет существующие опции списка
 * @param {string} attributeId - ID атрибута
 * @param {Array} options - Массив обновленных опций
 * @returns {Promise<void>}
 */
export const updateAttributeOptions = async (attributeId, options) => {
  try {
    await apiClient.put(`/attributes/${attributeId}/options`, { options })
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет опцию из списка значений атрибута
 * @param {string} optionId - ID опции
 * @returns {Promise<void>}
 */
export const deleteAttributeOption = async (optionId) => {
  try {
    await apiClient.delete(`/attribute-options/${optionId}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Импортирует опции списка из текстового формата
 * @param {string} attributeId - ID атрибута
 * @param {Object} data - Данные для импорта
 * @returns {Promise<void>}
 */
export const importAttributeOptions = async (attributeId, data) => {
  try {
    await apiClient.post(`/attributes/${attributeId}/options/import`, data)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Экспортирует существующие опции списка в текстовый формат
 * @param {string} attributeId - ID атрибута
 * @returns {Promise<Object>} - Экспортированные данные
 */
export const exportAttributeOptions = async (attributeId) => {
  try {
    await apiClient.get(`/attributes/${attributeId}/options/export`)

    // TODO: Заменить на реальный экспорт
    return { format: 'text', data: '' }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Изменяет порядок отображения опций в выпадающем списке
 * @param {Object} orderData - Данные о новом порядке
 * @returns {Promise<void>}
 */
export const reorderAttributeOptions = async (orderData) => {
  try {
    await apiClient.put('/attribute-options/reorder', orderData)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

// ===== Activity Attribute Values =====

/**
 * Получает значения всех атрибутов для конкретной активности
 * @param {string} activityId - ID активности
 * @returns {Promise<Array>} - Массив значений атрибутов
 */
export const getActivityAttributeValues = async (activityId) => {
  try {
    await apiClient.get(`/activities/${activityId}/attributes`)
    return activityAttributeValuesMock.filter(value => value.activity_id === activityId)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает значения всех атрибутов для конкретной активности (alias)
 * @param {string} activityId - ID активности
 * @returns {Promise<Array>} - Массив значений атрибутов
 */
export const getActivityAttributes = async (activityId) => {
  return getActivityAttributeValues(activityId)
}

/**
 * Обновляет значение конкретного атрибута для активности
 * @param {string} activityId - ID активности
 * @param {string} attributeId - ID атрибута
 * @param {string|number} value - Новое значение
 * @param {number|null} percentage - Процентное значение (для multi-select)
 * @returns {Promise<Object>} - Обновленное значение
 */
export const updateActivityAttributeValue = async (activityId, attributeId, value, percentage = null) => {
  try {
    await apiClient.put(`/activities/${activityId}/attributes/${attributeId}`, { value, percentage })
    return {
      value_id: Date.now().toString(),
      activity_id: activityId,
      attribute_id: attributeId,
      value,
      percentage,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет значения атрибутов для активности
 * @param {string} activityId - ID активности
 * @param {Object} attributeValues - Объект со значениями атрибутов
 * @returns {Promise<void>}
 */
export const updateActivityAttributes = async (activityId, attributeValues) => {
  try {
    await apiClient.put(`/activities/${activityId}/attributes`, attributeValues)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

// ===== Attribute Dependencies =====

/**
 * Получает все настроенные зависимости между атрибутами
 * @returns {Promise<Array>} - Массив зависимостей
 */
export const getAttributeDependencies = async () => {
  try {
    await apiClient.get('/attribute-dependencies')
    return attributeDependenciesMock
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Валидирует значения атрибутов согласно настроенным зависимостям
 * @param {Object} attributeValues - Объект со значениями атрибутов {attributeId: value}
 * @returns {Promise<Object>} - Результат валидации
 */
export const validateAttributeValues = async (attributeValues) => {
  try {
    await apiClient.post('/attribute-dependencies/validate', { attributeValues })

    // Простая валидация на основе зависимостей
    const dependencies = attributeDependenciesMock
    const errors = []
    const warnings = []

    for (const dep of dependencies) {
      if (!dep.is_active) continue

      const parentValue = attributeValues[dep.parent_attribute_id]
      const childValue = attributeValues[dep.child_attribute_id]

      if (dep.dependency_type === 'require_any' && parentValue === dep.parent_option_id) {
        if (!childValue || !dep.child_option_ids.includes(childValue)) {
          errors.push({
            attribute_id: dep.child_attribute_id,
            message: dep.description
          })
        }
      }

      if (dep.dependency_type === 'minimum_value' && parentValue === dep.parent_option_id) {
        const numValue = parseFloat(childValue)
        if (dep.validation_rule && !eval(dep.validation_rule.replace('value', numValue))) {
          errors.push({
            attribute_id: dep.child_attribute_id,
            message: dep.description
          })
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает атрибуты, доступные для конкретного типа активности
 * @param {string} activityTypeId - ID типа активности
 * @returns {Promise<Array>} - Массив атрибутов
 */
export const getAttributesByActivityType = async (activityTypeId) => {
  try {
    await apiClient.get(`/activity-types/${activityTypeId}/attributes`)
    // В данной реализации возвращаем все атрибуты
    // В реальной системе это может быть фильтрация по типу активности
    return attributesMock
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает правило зависимости между атрибутами
 * @param {Object} data - Данные зависимости
 * @returns {Promise<Object>} - Созданная зависимость
 */
export const createAttributeDependency = async (data) => {
  try {
    await apiClient.post('/attribute-dependencies', data)

    // TODO: Заменить на реальное создание
    return {
      dependency_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет существующее правило зависимости
 * @param {string} id - ID зависимости
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная зависимость
 */
export const updateAttributeDependency = async (id, data) => {
  try {
    await apiClient.put(`/attribute-dependencies/${id}`, data)

    // TODO: Заменить на реальное обновление
    return {
      dependency_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет зависимость между атрибутами
 * @param {string} id - ID зависимости
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteAttributeDependency = async (id) => {
  try {
    await apiClient.delete(`/attribute-dependencies/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}