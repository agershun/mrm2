/**
 * Composable для управления ролевой моделью доступа
 * Централизованное управление правами пользователей
 */

import { computed } from 'vue'
import { useUsersStore } from '@/stores/usersStore'

export function usePermissions() {
  const usersStore = useUsersStore()

  // Определение иерархии ролей (от наивысшей к низшей)
  const roleHierarchy = [
    'Owner',
    'Administrator',
    'Editor',
    'Editor - Data Entry Only',
    'Viewer'
  ]

  // Базовые права по ролям
  const rolePermissions = {
    'Owner': {
      // Полные права на все функции
      budgets: { create: true, read: true, update: true, delete: true, approve: true },
      users: { create: true, read: true, update: true, delete: true, invite: true },
      settings: { create: true, read: true, update: true, delete: true },
      transfers: { create: true, read: true, update: true, delete: true, approve: true },
      approvals: { create: true, read: true, update: true, delete: true, process: true },
      notes: { create: true, read: true, update: true, delete: true },
      audit: { read: true },
      imports: { create: true, read: true, update: true, delete: true },
      mapping: { create: true, read: true, update: true, delete: true }
    },
    'Administrator': {
      // Административные права, кроме удаления критичных данных
      budgets: { create: true, read: true, update: true, delete: false, approve: true },
      users: { create: true, read: true, update: true, delete: false, invite: true },
      settings: { create: true, read: true, update: true, delete: false },
      transfers: { create: true, read: true, update: true, delete: false, approve: true },
      approvals: { create: true, read: true, update: true, delete: false, process: true },
      notes: { create: true, read: true, update: true, delete: true },
      audit: { read: true },
      imports: { create: true, read: true, update: true, delete: true },
      mapping: { create: true, read: true, update: true, delete: true }
    },
    'Editor': {
      // Права редактирования без административных функций
      budgets: { create: true, read: true, update: true, delete: false, approve: false },
      users: { create: false, read: true, update: false, delete: false, invite: false },
      settings: { create: false, read: true, update: false, delete: false },
      transfers: { create: true, read: true, update: true, delete: false, approve: false },
      approvals: { create: true, read: true, update: false, delete: false, process: false },
      notes: { create: true, read: true, update: true, delete: true },
      audit: { read: true },
      imports: { create: true, read: true, update: true, delete: false },
      mapping: { create: true, read: true, update: true, delete: false }
    },
    'Editor - Data Entry Only': {
      // Только ввод данных, без редактирования структуры
      budgets: { create: false, read: true, update: false, delete: false, approve: false },
      users: { create: false, read: true, update: false, delete: false, invite: false },
      settings: { create: false, read: true, update: false, delete: false },
      transfers: { create: false, read: true, update: false, delete: false, approve: false },
      approvals: { create: false, read: true, update: false, delete: false, process: false },
      notes: { create: true, read: true, update: true, delete: false },
      audit: { read: true },
      imports: { create: true, read: true, update: false, delete: false },
      mapping: { create: false, read: true, update: false, delete: false }
    },
    'Viewer': {
      // Только просмотр
      budgets: { create: false, read: true, update: false, delete: false, approve: false },
      users: { create: false, read: true, update: false, delete: false, invite: false },
      settings: { create: false, read: true, update: false, delete: false },
      transfers: { create: false, read: true, update: false, delete: false, approve: false },
      approvals: { create: false, read: true, update: false, delete: false, process: false },
      notes: { create: false, read: true, update: false, delete: false },
      audit: { read: true },
      imports: { create: false, read: true, update: false, delete: false },
      mapping: { create: false, read: true, update: false, delete: false }
    }
  }

  // Текущий пользователь
  const currentUser = computed(() => usersStore.currentUser)

  // Роль текущего пользователя
  const currentUserRole = computed(() => currentUser.value?.role || 'Viewer')

  // Уровень роли (чем меньше число, тем выше роль)
  const getRoleLevel = (role) => {
    return roleHierarchy.indexOf(role)
  }

  // Проверка, имеет ли роль более высокий уровень доступа
  const hasHigherOrEqualRole = (requiredRole) => {
    const currentLevel = getRoleLevel(currentUserRole.value)
    const requiredLevel = getRoleLevel(requiredRole)
    return currentLevel <= requiredLevel && currentLevel !== -1
  }

  // Получение прав для конкретного модуля
  const getModulePermissions = (module) => {
    const rolePerms = rolePermissions[currentUserRole.value]
    return rolePerms?.[module] || {}
  }

  // Проверка конкретного права
  const hasPermission = (module, action) => {
    const modulePerms = getModulePermissions(module)
    return modulePerms[action] === true
  }

  // Проверка права на создание
  const canCreate = (module) => hasPermission(module, 'create')

  // Проверка права на чтение
  const canRead = (module) => hasPermission(module, 'read')

  // Проверка права на редактирование
  const canUpdate = (module) => hasPermission(module, 'update')

  // Проверка права на удаление
  const canDelete = (module) => hasPermission(module, 'delete')

  // Проверка права на утверждение
  const canApprove = (module) => hasPermission(module, 'approve')

  // Проверка права на обработку
  const canProcess = (module) => hasPermission(module, 'process')

  // Проверка права на приглашение пользователей
  const canInvite = () => hasPermission('users', 'invite')

  // Проверка, является ли пользователь владельцем ресурса
  const isResourceOwner = (resourceOwnerId) => {
    return currentUser.value?.user_id === resourceOwnerId
  }

  // Проверка права на редактирование ресурса (владелец или достаточные права)
  const canEditResource = (module, resourceOwnerId = null) => {
    return canUpdate(module) || isResourceOwner(resourceOwnerId)
  }

  // Проверка права на удаление ресурса (владелец или достаточные права)
  const canDeleteResource = (module, resourceOwnerId = null) => {
    return canDelete(module) || isResourceOwner(resourceOwnerId)
  }

  // Проверка прав доступа к административным функциям
  const isAdmin = computed(() => {
    return hasHigherOrEqualRole('Administrator')
  })

  // Проверка прав суперпользователя
  const isOwner = computed(() => {
    return currentUserRole.value === 'Owner'
  })

  // Проверка возможности просмотра определенных колонок в таблицах
  const getVisibleColumns = (allColumns, module) => {
    return allColumns.filter(column => {
      // Определяем видимость колонок в зависимости от роли
      switch (column.key) {
        case 'actions':
          return canUpdate(module) || canDelete(module)
        case 'settings':
          return isAdmin.value
        case 'users':
          return canRead('users')
        case 'audit':
          return canRead('audit')
        default:
          return true
      }
    })
  }

  // Фильтрация пунктов меню в зависимости от прав
  const getVisibleMenuItems = (menuItems) => {
    return menuItems.filter(item => {
      if (item.requiresPermission) {
        const [module, action] = item.requiresPermission.split('.')
        return hasPermission(module, action)
      }
      if (item.requiresRole) {
        return hasHigherOrEqualRole(item.requiresRole)
      }
      return true
    })
  }

  // Получение списка доступных действий для кнопок
  const getAvailableActions = (module, resourceOwnerId = null) => {
    const actions = []

    if (canCreate(module)) actions.push('create')
    if (canRead(module)) actions.push('read')
    if (canEditResource(module, resourceOwnerId)) actions.push('edit')
    if (canDeleteResource(module, resourceOwnerId)) actions.push('delete')
    if (canApprove(module)) actions.push('approve')
    if (canProcess(module)) actions.push('process')

    return actions
  }

  // Проверка возможности выполнения массовых операций
  const canPerformBulkActions = (module) => {
    return isAdmin.value && (canUpdate(module) || canDelete(module))
  }

  // Получение ограничений для пользователя
  const getUserLimitations = () => {
    const limitations = {
      maxBudgets: Infinity,
      maxTransfers: Infinity,
      maxUsers: Infinity,
      canAccessSettings: false,
      canViewAudit: false,
      canExportData: false
    }

    switch (currentUserRole.value) {
      case 'Owner':
        limitations.canAccessSettings = true
        limitations.canViewAudit = true
        limitations.canExportData = true
        break
      case 'Administrator':
        limitations.canAccessSettings = true
        limitations.canViewAudit = true
        limitations.canExportData = true
        break
      case 'Editor':
        limitations.maxBudgets = 50
        limitations.maxTransfers = 20
        limitations.canViewAudit = true
        limitations.canExportData = true
        break
      case 'Editor - Data Entry Only':
        limitations.maxBudgets = 10
        limitations.maxTransfers = 5
        limitations.canViewAudit = true
        limitations.canExportData = false
        break
      case 'Viewer':
        limitations.maxBudgets = 0
        limitations.maxTransfers = 0
        limitations.canViewAudit = true
        limitations.canExportData = false
        break
    }

    return limitations
  }

  return {
    // Computed properties
    currentUser,
    currentUserRole,
    isAdmin,
    isOwner,

    // Role checking methods
    hasHigherOrEqualRole,
    getRoleLevel,

    // Permission checking methods
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canApprove,
    canProcess,
    canInvite,

    // Resource-specific methods
    isResourceOwner,
    canEditResource,
    canDeleteResource,

    // UI helper methods
    getVisibleColumns,
    getVisibleMenuItems,
    getAvailableActions,
    canPerformBulkActions,

    // User limitations
    getUserLimitations,

    // Module permissions
    getModulePermissions,

    // Role hierarchy
    roleHierarchy,
    rolePermissions
  }
}