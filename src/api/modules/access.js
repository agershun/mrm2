/**
 * API модуль для работы с контролем доступа
 * Реализует методы из TABLES.md для таблиц AccessControlPolicies, AccessControlStatements, PolicyLinks
 */

import apiClient from '../client.js'

// Импортируем моки
import accessControlPoliciesMock from '../mocks/accessControlPolicies.mock.json'
import accessControlStatementsMock from '../mocks/accessControlStatements.mock.json'
import policyLinksMock from '../mocks/policyLinks.mock.json'

/**
 * ===== ACCESS CONTROL POLICIES =====
 */

/**
 * Получает список политик контроля доступа
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив политик
 */
export const getAccessControlPolicies = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/access/policies', params)

    let data = [...accessControlPoliciesMock]

    // Применяем фильтры
    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(policy =>
        policy.name.toLowerCase().includes(search) ||
        policy.description?.toLowerCase().includes(search)
      )
    }

    if (filters.status) {
      data = data.filter(policy => policy.status === filters.status)
    }

    if (filters.type) {
      data = data.filter(policy => policy.type === filters.type)
    }

    if (filters.created_by) {
      data = data.filter(policy => policy.created_by === filters.created_by)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает политику по ID
 * @param {string} id - ID политики
 * @returns {Promise<Object>} - Объект политики
 */
export const getAccessControlPolicy = async (id) => {
  try {
    const response = await apiClient.get(`/access/policies/${id}`)
    return accessControlPoliciesMock.find(policy => policy.policy_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую политику контроля доступа
 * @param {Object} data - Данные политики
 * @returns {Promise<Object>} - Созданная политика
 */
export const createAccessControlPolicy = async (data) => {
  try {
    const response = await apiClient.post('/access/policies', data)
    return {
      policy_id: Date.now().toString(),
      ...data,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет политику контроля доступа
 * @param {string} id - ID политики
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная политика
 */
export const updateAccessControlPolicy = async (id, data) => {
  try {
    const response = await apiClient.put(`/access/policies/${id}`, data)
    return {
      policy_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет политику контроля доступа
 * @param {string} id - ID политики
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteAccessControlPolicy = async (id) => {
  try {
    const response = await apiClient.delete(`/access/policies/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ACCESS CONTROL STATEMENTS =====
 */

/**
 * Получает утверждения контроля доступа
 * @param {string} policyId - ID политики (опционально)
 * @returns {Promise<Array>} - Массив утверждений
 */
export const getAccessControlStatements = async (policyId = null) => {
  try {
    const params = policyId ? { policy_id: policyId } : {}
    const response = await apiClient.get('/access/statements', params)

    let data = [...accessControlStatementsMock]

    if (policyId) {
      data = data.filter(statement => statement.policy_id === policyId)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает утверждение по ID
 * @param {string} id - ID утверждения
 * @returns {Promise<Object>} - Объект утверждения
 */
export const getAccessControlStatement = async (id) => {
  try {
    const response = await apiClient.get(`/access/statements/${id}`)
    return accessControlStatementsMock.find(statement => statement.statement_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новое утверждение контроля доступа
 * @param {Object} data - Данные утверждения
 * @returns {Promise<Object>} - Созданное утверждение
 */
export const createAccessControlStatement = async (data) => {
  try {
    const response = await apiClient.post('/access/statements', data)
    return {
      statement_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет утверждение контроля доступа
 * @param {string} id - ID утверждения
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленное утверждение
 */
export const updateAccessControlStatement = async (id, data) => {
  try {
    const response = await apiClient.put(`/access/statements/${id}`, data)
    return {
      statement_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет утверждение контроля доступа
 * @param {string} id - ID утверждения
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteAccessControlStatement = async (id) => {
  try {
    const response = await apiClient.delete(`/access/statements/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== POLICY LINKS =====
 */

/**
 * Получает связи политик
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив связей
 */
export const getPolicyLinks = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/access/policy-links', params)

    let data = [...policyLinksMock]

    if (filters.policy_id) {
      data = data.filter(link => link.policy_id === filters.policy_id)
    }

    if (filters.entity_type) {
      data = data.filter(link => link.entity_type === filters.entity_type)
    }

    if (filters.entity_id) {
      data = data.filter(link => link.entity_id === filters.entity_id)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает связь политики
 * @param {Object} data - Данные связи
 * @returns {Promise<Object>} - Созданная связь
 */
export const createPolicyLink = async (data) => {
  try {
    const response = await apiClient.post('/access/policy-links', data)
    return {
      policy_link_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет связь политики
 * @param {string} policyId - ID политики
 * @param {string} entityType - Тип сущности
 * @param {string} entityId - ID сущности
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deletePolicyLink = async (policyId, entityType, entityId) => {
  try {
    const response = await apiClient.delete(`/access/policy-links/${policyId}/${entityType}/${entityId}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ПРОВЕРКА ДОСТУПА =====
 */

/**
 * Проверяет доступ пользователя к ресурсу
 * @param {string} userId - ID пользователя
 * @param {string} resource - Ресурс
 * @param {string} action - Действие
 * @returns {Promise<Object>} - Результат проверки доступа
 */
export const checkAccess = async (userId, resource, action) => {
  try {
    const response = await apiClient.post('/access/check', {
      user_id: userId,
      resource,
      action
    })

    // Мок проверки доступа
    // Получаем политики пользователя
    const userPolicies = policyLinksMock.filter(
      link => link.entity_type === 'user' && link.entity_id === userId
    )

    // Получаем политики ролей пользователя (упрощенная логика)
    const rolesPolicies = policyLinksMock.filter(
      link => link.entity_type === 'role'
    )

    const allUserPolicies = [...userPolicies, ...rolesPolicies]

    // Проверяем утверждения
    let allowed = false
    let reason = 'Нет соответствующих политик'

    for (const policyLink of allUserPolicies) {
      const statements = accessControlStatementsMock.filter(
        stmt => stmt.policy_id === policyLink.policy_id
      )

      for (const statement of statements) {
        if (statement.resource === resource || statement.resource === '*') {
          if (statement.actions.includes(action) || statement.actions.includes('*')) {
            if (statement.effect === 'Allow') {
              allowed = true
              reason = `Разрешено политикой ${policyLink.policy_id}`
            } else if (statement.effect === 'Deny') {
              allowed = false
              reason = `Запрещено политикой ${policyLink.policy_id}`
              break // Deny имеет приоритет
            }
          }
        }
      }

      if (!allowed && reason.includes('Запрещено')) {
        break // Если есть явный запрет, прекращаем проверку
      }
    }

    return {
      allowed,
      reason,
      user_id: userId,
      resource,
      action,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает разрешения пользователя
 * @param {string} userId - ID пользователя
 * @returns {Promise<Array>} - Массив разрешений
 */
export const getUserPermissions = async (userId) => {
  try {
    const response = await apiClient.get(`/access/users/${userId}/permissions`)

    // Мок получения разрешений
    const userPolicies = policyLinksMock.filter(
      link => link.entity_type === 'user' && link.entity_id === userId
    )

    const rolesPolicies = policyLinksMock.filter(
      link => link.entity_type === 'role'
    )

    const allUserPolicies = [...userPolicies, ...rolesPolicies]

    const permissions = []

    for (const policyLink of allUserPolicies) {
      const statements = accessControlStatementsMock.filter(
        stmt => stmt.policy_id === policyLink.policy_id && stmt.effect === 'Allow'
      )

      for (const statement of statements) {
        statement.actions.forEach(action => {
          permissions.push({
            resource: statement.resource,
            action,
            policy_id: policyLink.policy_id,
            policy_name: accessControlPoliciesMock.find(p => p.policy_id === policyLink.policy_id)?.name
          })
        })
      }
    }

    return permissions
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
 */

/**
 * Получает политики пользователя
 * @param {string} userId - ID пользователя
 * @returns {Promise<Array>} - Массив политик
 */
export const getUserPolicies = async (userId) => {
  try {
    const userLinks = await getPolicyLinks({ entity_type: 'user', entity_id: userId })
    const policyIds = userLinks.map(link => link.policy_id)

    const allPolicies = await getAccessControlPolicies()
    return allPolicies.filter(policy => policyIds.includes(policy.policy_id))
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает политики роли
 * @param {string} roleId - ID роли
 * @returns {Promise<Array>} - Массив политик
 */
export const getRolePolicies = async (roleId) => {
  try {
    const roleLinks = await getPolicyLinks({ entity_type: 'role', entity_id: roleId })
    const policyIds = roleLinks.map(link => link.policy_id)

    const allPolicies = await getAccessControlPolicies()
    return allPolicies.filter(policy => policyIds.includes(policy.policy_id))
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает политики команды
 * @param {string} teamId - ID команды
 * @returns {Promise<Array>} - Массив политик
 */
export const getTeamPolicies = async (teamId) => {
  try {
    const teamLinks = await getPolicyLinks({ entity_type: 'team', entity_id: teamId })
    const policyIds = teamLinks.map(link => link.policy_id)

    const allPolicies = await getAccessControlPolicies()
    return allPolicies.filter(policy => policyIds.includes(policy.policy_id))
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Дублирует политику
 * @param {string} policyId - ID политики
 * @param {string} newName - Новое название
 * @returns {Promise<Object>} - Дублированная политика
 */
export const duplicatePolicy = async (policyId, newName) => {
  try {
    const response = await apiClient.post(`/access/policies/${policyId}/duplicate`, { name: newName })

    // Мок дублирования
    const original = await getAccessControlPolicy(policyId)
    if (!original) throw new Error('Политика не найдена')

    return {
      ...original,
      policy_id: Date.now().toString(),
      name: newName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает журнал доступа
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив записей журнала
 */
export const getAccessLog = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/access/log', params)

    // Мок журнала доступа
    return [
      {
        log_id: '1',
        user_id: '1',
        resource: 'activities',
        action: 'read',
        allowed: true,
        timestamp: new Date().toISOString(),
        ip_address: '192.168.1.1'
      }
    ]
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Тестирует политику
 * @param {string} policyId - ID политики
 * @param {Object} testCase - Тестовый случай
 * @returns {Promise<Object>} - Результат теста
 */
export const testPolicy = async (policyId, testCase) => {
  try {
    const response = await apiClient.post(`/access/policies/${policyId}/test`, testCase)

    // Мок тестирования политики
    return {
      policy_id: policyId,
      test_case: testCase,
      result: 'allow',
      reason: 'Политика разрешает доступ',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Поиск политик
 * @param {string} keyword - Ключевое слово
 * @returns {Promise<Array>} - Найденные политики
 */
export const searchPolicies = async (keyword) => {
  return getAccessControlPolicies({ search: keyword })
}