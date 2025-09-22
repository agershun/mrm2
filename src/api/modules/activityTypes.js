/**
 * API модуль для работы с типами активностей
 * Реализует методы из TABLES.md для таблиц ActivityTypes и ActivityTypeGroups
 */

import apiClient from '../client.js'

// Импортируем моки
import activityTypesMock from '../mocks/activityTypes.mock.json'
import activityTypeGroupsMock from '../mocks/activityTypeGroups.mock.json'

/**
 * Получает список всех типов активностей
 * @returns {Promise<Array>} - Массив типов активностей
 */
export const getActivityTypes = async () => {
  try {
    console.log(18);
    const response = await apiClient.get('/activity-types')
    console.log(20);
    // Возвращаем данные из мока
    return [...activityTypesMock]
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый тип активности
 * @param {Object} data - Данные типа активности
 * @returns {Promise<Object>} - Созданный тип активности
 */
export const createActivityType = async (data) => {
  try {
    const response = await apiClient.post('/activity-types', data)

    // TODO: Заменить на реальное создание
    return {
      activity_type_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет настройки типа активности
 * @param {string} id - ID типа активности
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный тип активности
 */
export const updateActivityType = async (id, data) => {
  try {
    const response = await apiClient.put(`/activity-types/${id}`, data)

    // TODO: Заменить на реальное обновление
    return {
      activity_type_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Отключает тип активности
 * @param {string} id - ID типа активности
 * @returns {Promise<void>}
 */
export const disableActivityType = async (id) => {
  return updateActivityType(id, { is_disabled: true })
}

/**
 * Удаляет тип активности
 * @param {string} id - ID типа активности
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteActivityType = async (id) => {
  try {
    const response = await apiClient.delete(`/activity-types/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

// ===== Activity Type Groups =====

/**
 * Получает список всех групп типов активностей
 * @returns {Promise<Array>} - Массив групп типов активностей
 */
export const getActivityTypeGroups = async () => {
  try {
    const response = await apiClient.get('/activity-type-groups')

    // Возвращаем данные из мока
    return [...activityTypeGroupsMock]
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую логическую группу для типов активностей
 * @param {Object} data - Данные группы
 * @returns {Promise<Object>} - Созданная группа
 */
export const createActivityTypeGroup = async (data) => {
  try {
    const response = await apiClient.post('/activity-type-groups', data)

    // TODO: Заменить на реальное создание
    return {
      activity_type_group_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет название или настройки группы
 * @param {string} id - ID группы
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная группа
 */
export const updateActivityTypeGroup = async (id, data) => {
  try {
    const response = await apiClient.put(`/activity-type-groups/${id}`, data)

    // TODO: Заменить на реальное обновление
    return {
      activity_type_group_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Отключает группу типов активностей
 * @param {string} id - ID группы
 * @returns {Promise<void>}
 */
export const disableActivityTypeGroup = async (id) => {
  return updateActivityTypeGroup(id, { is_disabled: true })
}

/**
 * Удаляет группу типов активностей
 * @param {string} id - ID группы
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteActivityTypeGroup = async (id) => {
  try {
    const response = await apiClient.delete(`/activity-type-groups/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}