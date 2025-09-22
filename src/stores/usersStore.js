import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useUsersStore = defineStore('users', () => {
  const appStore = useAppStore()

  // State
  const users = ref([])
  const roles = ref([])
  const teams = ref([])
  const userTeams = ref([])
  const rolePermissions = ref([])
  const selectedUser = ref(null)
  const isLoading = ref(false)
  const filters = ref({})

  // Getters
  const activeUsers = computed(() =>
    users.value.filter(user => user.status === 'active')
  )

  const usersByTeam = computed(() => {
    const groups = {}
    userTeams.value.forEach(ut => {
      const team = teams.value.find(t => t.team_id === ut.team_id)
      const user = users.value.find(u => u.user_id === ut.user_id)

      if (team && user) {
        if (!groups[team.name]) {
          groups[team.name] = []
        }
        groups[team.name].push(user)
      }
    })
    return groups
  })

  const selectedUserData = computed(() => {
    if (!selectedUser.value) return null
    const user = users.value.find(u => u.user_id === selectedUser.value)
    if (!user) return null

    const userTeamsList = userTeams.value
      .filter(ut => ut.user_id === user.user_id)
      .map(ut => teams.value.find(t => t.team_id === ut.team_id))
      .filter(Boolean)

    const userRole = roles.value.find(r => r.role_id === user.role_id)

    return {
      ...user,
      teams: userTeamsList,
      role: userRole,
      permissions: userRole ? rolePermissions.value.filter(rp => rp.role_id === userRole.role_id) : []
    }
  })

  const filteredUsers = computed(() => {
    let filtered = users.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(user =>
        user.first_name.toLowerCase().includes(search) ||
        user.last_name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      )
    }

    if (filters.value.status) {
      filtered = filtered.filter(user => user.status === filters.value.status)
    }

    if (filters.value.role) {
      filtered = filtered.filter(user => user.role_id === filters.value.role)
    }

    if (filters.value.team) {
      const teamUserIds = userTeams.value
        .filter(ut => ut.team_id === filters.value.team)
        .map(ut => ut.user_id)
      filtered = filtered.filter(user => teamUserIds.includes(user.user_id))
    }

    return filtered
  })

  const roleHierarchy = computed(() => {
    const hierarchy = {}
    roles.value.forEach(role => {
      hierarchy[role.role_id] = {
        ...role,
        permissions: rolePermissions.value.filter(rp => rp.role_id === role.role_id)
      }
    })
    return hierarchy
  })

  // Actions
  const fetchUsers = async (filterParams = {}) => {
    try {
      isLoading.value = true
      const data = await api.users.getUsers(filterParams)
      users.value = data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      appStore.showError('Ошибка загрузки пользователей: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchRoles = async () => {
    try {
      const data = await api.users.getRoles()
      roles.value = data || []
    } catch (error) {
      console.error('Error fetching roles:', error)
      appStore.showError('Ошибка загрузки ролей: ' + error.message)
    }
  }

  const fetchTeams = async () => {
    try {
      const data = await api.users.getTeams()
      teams.value = data || []
    } catch (error) {
      console.error('Error fetching teams:', error)
      appStore.showError('Ошибка загрузки команд: ' + error.message)
    }
  }

  const fetchUserTeams = async () => {
    try {
      const data = await api.users.getUserTeams()
      userTeams.value = data || []
    } catch (error) {
      console.error('Error fetching user teams:', error)
      appStore.showError('Ошибка загрузки связей пользователей и команд: ' + error.message)
    }
  }

  const fetchRolePermissions = async () => {
    try {
      const data = await api.users.getRolePermissions()
      rolePermissions.value = data || []
    } catch (error) {
      console.error('Error fetching role permissions:', error)
      appStore.showError('Ошибка загрузки разрешений ролей: ' + error.message)
    }
  }

  const selectUser = (userId) => {
    selectedUser.value = userId
  }

  const createUser = async (userData) => {
    try {
      isLoading.value = true
      const newUser = await api.users.createUser(userData)
      users.value.push(newUser)
      appStore.showSuccess('Пользователь создан успешно')
      return newUser
    } catch (error) {
      appStore.showError('Ошибка создания пользователя: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (userId, updateData) => {
    try {
      isLoading.value = true
      const updatedUser = await api.users.updateUser(userId, updateData)

      const index = users.value.findIndex(u => u.user_id === userId)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...updatedUser }
      }

      appStore.showSuccess('Пользователь обновлен')
      return updatedUser
    } catch (error) {
      appStore.showError('Ошибка обновления пользователя: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (userId) => {
    try {
      isLoading.value = true
      await api.users.deleteUser(userId)

      users.value = users.value.filter(u => u.user_id !== userId)

      if (selectedUser.value === userId) {
        selectedUser.value = null
      }

      appStore.showSuccess('Пользователь удален')
    } catch (error) {
      appStore.showError('Ошибка удаления пользователя: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deactivateUser = async (userId) => {
    return updateUser(userId, { status: 'inactive' })
  }

  const activateUser = async (userId) => {
    return updateUser(userId, { status: 'active' })
  }

  const changeUserRole = async (userId, roleId) => {
    return updateUser(userId, { role_id: roleId })
  }

  const createRole = async (roleData) => {
    try {
      const newRole = await api.users.createRole(roleData)
      roles.value.push(newRole)
      appStore.showSuccess('Роль создана успешно')
      return newRole
    } catch (error) {
      appStore.showError('Ошибка создания роли: ' + error.message)
      throw error
    }
  }

  const updateRole = async (roleId, updateData) => {
    try {
      const updatedRole = await api.users.updateRole(roleId, updateData)

      const index = roles.value.findIndex(r => r.role_id === roleId)
      if (index !== -1) {
        roles.value[index] = { ...roles.value[index], ...updatedRole }
      }

      appStore.showSuccess('Роль обновлена')
      return updatedRole
    } catch (error) {
      appStore.showError('Ошибка обновления роли: ' + error.message)
      throw error
    }
  }

  const deleteRole = async (roleId) => {
    try {
      await api.users.deleteRole(roleId)
      roles.value = roles.value.filter(r => r.role_id !== roleId)
      appStore.showSuccess('Роль удалена')
    } catch (error) {
      appStore.showError('Ошибка удаления роли: ' + error.message)
      throw error
    }
  }

  const createTeam = async (teamData) => {
    try {
      const newTeam = await api.users.createTeam(teamData)
      teams.value.push(newTeam)
      appStore.showSuccess('Команда создана успешно')
      return newTeam
    } catch (error) {
      appStore.showError('Ошибка создания команды: ' + error.message)
      throw error
    }
  }

  const updateTeam = async (teamId, updateData) => {
    try {
      const updatedTeam = await api.users.updateTeam(teamId, updateData)

      const index = teams.value.findIndex(t => t.team_id === teamId)
      if (index !== -1) {
        teams.value[index] = { ...teams.value[index], ...updatedTeam }
      }

      appStore.showSuccess('Команда обновлена')
      return updatedTeam
    } catch (error) {
      appStore.showError('Ошибка обновления команды: ' + error.message)
      throw error
    }
  }

  const deleteTeam = async (teamId) => {
    try {
      await api.users.deleteTeam(teamId)
      teams.value = teams.value.filter(t => t.team_id !== teamId)
      // Удаляем связи пользователей с командой
      userTeams.value = userTeams.value.filter(ut => ut.team_id !== teamId)
      appStore.showSuccess('Команда удалена')
    } catch (error) {
      appStore.showError('Ошибка удаления команды: ' + error.message)
      throw error
    }
  }

  const addUserToTeam = async (userId, teamId, role = null) => {
    try {
      const userTeam = await api.users.createUserTeam({
        user_id: userId,
        team_id: teamId,
        role
      })
      userTeams.value.push(userTeam)
      appStore.showSuccess('Пользователь добавлен в команду')
      return userTeam
    } catch (error) {
      appStore.showError('Ошибка добавления пользователя в команду: ' + error.message)
      throw error
    }
  }

  const removeUserFromTeam = async (userId, teamId) => {
    try {
      await api.users.deleteUserTeam(userId, teamId)
      userTeams.value = userTeams.value.filter(
        ut => !(ut.user_id === userId && ut.team_id === teamId)
      )
      appStore.showSuccess('Пользователь удален из команды')
    } catch (error) {
      appStore.showError('Ошибка удаления пользователя из команды: ' + error.message)
      throw error
    }
  }

  const assignRolePermission = async (roleId, permission, resource) => {
    try {
      const rolePermission = await api.users.createRolePermission({
        role_id: roleId,
        permission,
        resource
      })
      rolePermissions.value.push(rolePermission)
      appStore.showSuccess('Разрешение назначено роли')
      return rolePermission
    } catch (error) {
      appStore.showError('Ошибка назначения разрешения роли: ' + error.message)
      throw error
    }
  }

  const revokeRolePermission = async (roleId, permission, resource) => {
    try {
      await api.users.deleteRolePermission(roleId, permission, resource)
      rolePermissions.value = rolePermissions.value.filter(
        rp => !(rp.role_id === roleId && rp.permission === permission && rp.resource === resource)
      )
      appStore.showSuccess('Разрешение отозвано у роли')
    } catch (error) {
      appStore.showError('Ошибка отзыва разрешения у роли: ' + error.message)
      throw error
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const searchUsers = async (keyword) => {
    if (!keyword.trim()) {
      await fetchUsers()
      return
    }

    try {
      isLoading.value = true
      const results = await api.users.searchUsers(keyword)
      users.value = results || []
    } catch (error) {
      appStore.showError('Ошибка поиска: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  // Инициализация
  const initialize = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchRoles(),
        fetchTeams(),
        fetchUserTeams(),
        fetchRolePermissions()
      ])
    } catch (error) {
      console.error('Users store initialization failed:', error)
    }
  }

  return {
    // State
    users,
    roles,
    teams,
    userTeams,
    rolePermissions,
    selectedUser,
    isLoading,
    filters,

    // Getters
    activeUsers,
    usersByTeam,
    selectedUserData,
    filteredUsers,
    roleHierarchy,

    // Actions
    fetchUsers,
    fetchRoles,
    fetchTeams,
    fetchUserTeams,
    fetchRolePermissions,
    selectUser,
    createUser,
    updateUser,
    deleteUser,
    deactivateUser,
    activateUser,
    changeUserRole,
    createRole,
    updateRole,
    deleteRole,
    createTeam,
    updateTeam,
    deleteTeam,
    addUserToTeam,
    removeUserFromTeam,
    assignRolePermission,
    revokeRolePermission,
    setFilters,
    clearFilters,
    searchUsers,
    initialize
  }
})