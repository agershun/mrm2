/**
 * API модуль для работы с пользователями
 * Реализует методы из TABLES.md для таблиц Users, Roles, Teams, UserTeams, RolePermissions
 */

import apiClient from '../client.js'

// Импортируем моки
import usersMock from '../mocks/users.mock.json'
import rolesMock from '../mocks/roles.mock.json'
import teamsMock from '../mocks/teams.mock.json'
import userTeamsMock from '../mocks/userTeams.mock.json'
import rolePermissionsMock from '../mocks/rolePermissions.mock.json'

/**
 * ===== USERS =====
 */

/**
 * Получает список пользователей
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив пользователей
 */
export const getUsers = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/users', params)

    let data = [...usersMock]

    // Применяем фильтры
    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(user =>
        user.first_name.toLowerCase().includes(search) ||
        user.last_name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      )
    }

    if (filters.status) {
      data = data.filter(user => user.status === filters.status)
    }

    if (filters.role_id) {
      data = data.filter(user => user.role_id === filters.role_id)
    }

    if (filters.team_id) {
      const teamUserIds = userTeamsMock
        .filter(ut => ut.team_id === filters.team_id)
        .map(ut => ut.user_id)
      data = data.filter(user => teamUserIds.includes(user.user_id))
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает пользователя по ID
 * @param {string} id - ID пользователя
 * @returns {Promise<Object>} - Объект пользователя
 */
export const getUser = async (id) => {
  try {
    const response = await apiClient.get(`/users/${id}`)
    return usersMock.find(user => user.user_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает нового пользователя
 * @param {Object} data - Данные пользователя
 * @returns {Promise<Object>} - Созданный пользователь
 */
export const createUser = async (data) => {
  try {
    const response = await apiClient.post('/users', data)
    return {
      user_id: Date.now().toString(),
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
 * Обновляет пользователя
 * @param {string} id - ID пользователя
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленный пользователь
 */
export const updateUser = async (id, data) => {
  try {
    const response = await apiClient.put(`/users/${id}`, data)
    return {
      user_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет пользователя
 * @param {string} id - ID пользователя
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`/users/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ROLES =====
 */

/**
 * Получает список ролей
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив ролей
 */
export const getRoles = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/users/roles', params)

    let data = [...rolesMock]

    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(role =>
        role.name.toLowerCase().includes(search) ||
        role.description?.toLowerCase().includes(search)
      )
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает роль по ID
 * @param {string} id - ID роли
 * @returns {Promise<Object>} - Объект роли
 */
export const getRole = async (id) => {
  try {
    const response = await apiClient.get(`/users/roles/${id}`)
    return rolesMock.find(role => role.role_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую роль
 * @param {Object} data - Данные роли
 * @returns {Promise<Object>} - Созданная роль
 */
export const createRole = async (data) => {
  try {
    const response = await apiClient.post('/users/roles', data)
    return {
      role_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет роль
 * @param {string} id - ID роли
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная роль
 */
export const updateRole = async (id, data) => {
  try {
    const response = await apiClient.put(`/users/roles/${id}`, data)
    return {
      role_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет роль
 * @param {string} id - ID роли
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteRole = async (id) => {
  try {
    const response = await apiClient.delete(`/users/roles/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== TEAMS =====
 */

/**
 * Получает список команд
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив команд
 */
export const getTeams = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/users/teams', params)

    let data = [...teamsMock]

    if (filters.search) {
      const search = filters.search.toLowerCase()
      data = data.filter(team =>
        team.name.toLowerCase().includes(search) ||
        team.description?.toLowerCase().includes(search)
      )
    }

    if (filters.is_active !== undefined) {
      data = data.filter(team => team.is_active === filters.is_active)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает команду по ID
 * @param {string} id - ID команды
 * @returns {Promise<Object>} - Объект команды
 */
export const getTeam = async (id) => {
  try {
    const response = await apiClient.get(`/users/teams/${id}`)
    return teamsMock.find(team => team.team_id === id) || null
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую команду
 * @param {Object} data - Данные команды
 * @returns {Promise<Object>} - Созданная команда
 */
export const createTeam = async (data) => {
  try {
    const response = await apiClient.post('/users/teams', data)
    return {
      team_id: Date.now().toString(),
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
 * Обновляет команду
 * @param {string} id - ID команды
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная команда
 */
export const updateTeam = async (id, data) => {
  try {
    const response = await apiClient.put(`/users/teams/${id}`, data)
    return {
      team_id: id,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет команду
 * @param {string} id - ID команды
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteTeam = async (id) => {
  try {
    const response = await apiClient.delete(`/users/teams/${id}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== USER TEAMS =====
 */

/**
 * Получает связи пользователей с командами
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив связей
 */
export const getUserTeams = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/users/user-teams', params)

    let data = [...userTeamsMock]

    if (filters.user_id) {
      data = data.filter(ut => ut.user_id === filters.user_id)
    }

    if (filters.team_id) {
      data = data.filter(ut => ut.team_id === filters.team_id)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает связь пользователя с командой
 * @param {Object} data - Данные связи
 * @returns {Promise<Object>} - Созданная связь
 */
export const createUserTeam = async (data) => {
  try {
    const response = await apiClient.post('/users/user-teams', data)
    return {
      user_team_id: Date.now().toString(),
      ...data,
      joined_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет связь пользователя с командой
 * @param {string} userId - ID пользователя
 * @param {string} teamId - ID команды
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная связь
 */
export const updateUserTeam = async (userId, teamId, data) => {
  try {
    const response = await apiClient.put(`/users/user-teams/${userId}/${teamId}`, data)
    return {
      user_id: userId,
      team_id: teamId,
      ...data
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет связь пользователя с командой
 * @param {string} userId - ID пользователя
 * @param {string} teamId - ID команды
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteUserTeam = async (userId, teamId) => {
  try {
    const response = await apiClient.delete(`/users/user-teams/${userId}/${teamId}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ROLE PERMISSIONS =====
 */

/**
 * Получает разрешения ролей
 * @param {Object} filters - Фильтры для поиска
 * @returns {Promise<Array>} - Массив разрешений
 */
export const getRolePermissions = async (filters = {}) => {
  try {
    const params = { ...filters }
    const response = await apiClient.get('/users/role-permissions', params)

    let data = [...rolePermissionsMock]

    if (filters.role_id) {
      data = data.filter(rp => rp.role_id === filters.role_id)
    }

    if (filters.resource) {
      data = data.filter(rp => rp.resource === filters.resource)
    }

    if (filters.permission) {
      data = data.filter(rp => rp.permission === filters.permission)
    }

    return data
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает разрешение для роли
 * @param {Object} data - Данные разрешения
 * @returns {Promise<Object>} - Созданное разрешение
 */
export const createRolePermission = async (data) => {
  try {
    const response = await apiClient.post('/users/role-permissions', data)
    return {
      role_permission_id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет разрешение роли
 * @param {string} roleId - ID роли
 * @param {string} permission - Разрешение
 * @param {string} resource - Ресурс
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteRolePermission = async (roleId, permission, resource) => {
  try {
    const response = await apiClient.delete(`/users/role-permissions/${roleId}/${permission}/${resource}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
 */

/**
 * Получает пользователей команды
 * @param {string} teamId - ID команды
 * @returns {Promise<Array>} - Массив пользователей команды
 */
export const getTeamUsers = async (teamId) => {
  try {
    const userTeams = await getUserTeams({ team_id: teamId })
    const userIds = userTeams.map(ut => ut.user_id)

    const allUsers = await getUsers()
    return allUsers.filter(user => userIds.includes(user.user_id))
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает команды пользователя
 * @param {string} userId - ID пользователя
 * @returns {Promise<Array>} - Массив команд пользователя
 */
export const getUserTeamsList = async (userId) => {
  try {
    const userTeams = await getUserTeams({ user_id: userId })
    const teamIds = userTeams.map(ut => ut.team_id)

    const allTeams = await getTeams()
    return allTeams.filter(team => teamIds.includes(team.team_id))
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
    const user = await getUser(userId)
    if (!user) return []

    const rolePermissions = await getRolePermissions({ role_id: user.role_id })
    return rolePermissions
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Проверяет разрешение пользователя
 * @param {string} userId - ID пользователя
 * @param {string} resource - Ресурс
 * @param {string} permission - Разрешение
 * @returns {Promise<boolean>} - Результат проверки
 */
export const checkUserPermission = async (userId, resource, permission) => {
  try {
    const permissions = await getUserPermissions(userId)
    return permissions.some(p => p.resource === resource && p.permission === permission)
  } catch (error) {
    console.error('Error checking user permission:', error)
    return false
  }
}

/**
 * Получает пользователей по роли
 * @param {string} roleId - ID роли
 * @returns {Promise<Array>} - Массив пользователей
 */
export const getUsersByRole = async (roleId) => {
  return getUsers({ role_id: roleId })
}

/**
 * Аутентификация пользователя
 * @param {string} email - Email
 * @param {string} password - Пароль
 * @returns {Promise<Object>} - Данные пользователя и токен
 */
export const authenticateUser = async (email, password) => {
  try {
    const response = await apiClient.post('/users/auth/login', { email, password })

    // Мок аутентификации
    const user = usersMock.find(u => u.email === email)
    if (!user) {
      throw new Error('Пользователь не найден')
    }

    return {
      user,
      token: 'mock-jwt-token-' + Date.now(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Сброс пароля
 * @param {string} email - Email пользователя
 * @returns {Promise<boolean>} - Результат отправки email
 */
export const resetPassword = async (email) => {
  try {
    const response = await apiClient.post('/users/auth/reset-password', { email })
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Поиск пользователей
 * @param {string} keyword - Ключевое слово
 * @returns {Promise<Array>} - Найденные пользователи
 */
export const searchUsers = async (keyword) => {
  return getUsers({ search: keyword })
}