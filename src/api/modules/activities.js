/**
 * API модуль для работы с активностями
 * Реализует методы из TABLES.md для таблицы Activities
 */

import apiClient from '../client.js'

// Импортируем моки
import activitiesMock from '../mocks/activities.mock.json'

/**
 * Получает массив объектов Activity, соответствующих фильтрам
 * @param {Object} filters - Фильтры для поиска
 * @param {string} groupBy - Поле для группировки
 * @returns {Promise<Array>} - Массив активностей
 */
export const getActivities = async (filters = {}, groupBy = null) => {
  try {
    // console.log(19);
    const params = { ...filters }
    if (groupBy) {
      params.groupBy = groupBy
    }
    // console.log(24);
    const response = await apiClient.get('/activities', params)
    // console.log(26);
// console.log(26,activitiesMock);

    // Возвращаем данные из мока
    let data = [...activitiesMock]

    // console.log(28, data);

    // Применяем фильтры если есть
    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(activity =>
        activity.name.toLowerCase().includes(search)
      )
    }

    if (filters.status) {
      data = data.filter(activity => activity.status === filters.status)
    }

    if (filters.activity_type_id) {
      data = data.filter(activity => activity.activity_type_id === filters.activity_type_id)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает один объект Activity по его ID
 * @param {string} id - ID активности
 * @returns {Promise<Object>} - Объект активности
 */
export const getActivity = async (id) => {
  try {
    const response = await apiClient.get(`/activities/${id}`)

    // Находим активность в моке
    const activity = activitiesMock.find(a => a.activity_id === id)
    return activity || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую активность
 * @param {Object} data - Данные активности
 * @returns {Promise<Object>} - Созданная активность
 */
export const createActivity = async (data) => {
  try {
    const response = await apiClient.post('/activities', data)

    // TODO: Заменить на реальное создание
    return { id: Date.now().toString(), ...data }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет данные активности
 * @param {string} id - ID активности
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная активность
 */
export const updateActivity = async (id, data) => {
  try {
    const response = await apiClient.put(`/activities/${id}`, data)

    // TODO: Заменить на реальное обновление
    return { id, ...data }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет даты активности
 * @param {string} activityId - ID активности
 * @param {Object} newDates - Новые даты
 * @returns {Promise<Object>} - Обновленная активность
 */
export const updateActivityDates = async (activityId, newDates) => {
  return updateActivity(activityId, {
    in_market_start_date: newDates.startDate,
    in_market_end_date: newDates.endDate
  })
}

/**
 * Обновляет атрибуты активности
 * @param {string} activityId - ID активности
 * @param {Object} attributeValues - Значения атрибутов
 * @returns {Promise<Object>} - Обновленная активность
 */
export const updateActivityAttributes = async (activityId, attributeValues) => {
  try {
    const response = await apiClient.patch(`/activities/${activityId}/attributes`, attributeValues)

    // TODO: Заменить на реальное обновление атрибутов
    return { activityId, attributeValues }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет активность
 * @param {string} id - ID активности
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteActivity = async (id) => {
  try {
    const response = await apiClient.delete(`/activities/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает полную копию иерархии активности
 * @param {string} id - ID активности для дублирования
 * @returns {Promise<Object>} - Дублированная активность
 */
export const duplicateActivity = async (id) => {
  try {
    const response = await apiClient.post(`/activities/${id}/duplicate`)

    // TODO: Заменить на реальное дублирование
    return { id: Date.now().toString(), duplicatedFrom: id }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Перемещает активность в иерархии
 * @param {string} id - ID активности
 * @param {string} newParentId - ID нового родителя
 * @returns {Promise<Object>} - Обновленная активность
 */
export const moveActivity = async (id, newParentId) => {
  return updateActivity(id, { parent_activity_id: newParentId })
}

/**
 * Синхронизирует данные активности с рабочим процессом
 * @param {string} id - ID активности
 * @returns {Promise<Object>} - Результат синхронизации
 */
export const syncActivityData = async (id) => {
  try {
    const response = await apiClient.post(`/activities/${id}/sync`)

    // TODO: Заменить на реальную синхронизацию
    return { activityId: id, syncedAt: new Date().toISOString() }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Поиск активностей по ключевому слову
 * @param {string} keyword - Ключевое слово для поиска
 * @returns {Promise<Array>} - Найденные активности
 */
export const searchActivities = async (keyword) => {
  return getActivities({ search: keyword })
}

// Псевдоним для совместимости со сценариями
export const fetchActivities = getActivities