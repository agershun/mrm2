import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useAccessStore = defineStore('access', () => {
  const appStore = useAppStore()

  // State
  const accessControlPolicies = ref([])
  const accessControlStatements = ref([])
  const policyLinks = ref([])
  const selectedPolicy = ref(null)
  const isLoading = ref(false)
  const filters = ref({})

  // Getters
  const policiesWithStatements = computed(() => {
    return accessControlPolicies.value.map(policy => ({
      ...policy,
      statements: accessControlStatements.value.filter(stmt => stmt.policy_id === policy.policy_id)
    }))
  })

  const selectedPolicyData = computed(() => {
    if (!selectedPolicy.value) return null
    const policy = accessControlPolicies.value.find(p => p.policy_id === selectedPolicy.value)
    if (!policy) return null

    return {
      ...policy,
      statements: accessControlStatements.value.filter(stmt => stmt.policy_id === policy.policy_id),
      links: policyLinks.value.filter(link => link.policy_id === policy.policy_id)
    }
  })

  const filteredPolicies = computed(() => {
    let filtered = accessControlPolicies.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(policy =>
        policy.name.toLowerCase().includes(search) ||
        policy.description?.toLowerCase().includes(search)
      )
    }

    if (filters.value.status) {
      filtered = filtered.filter(policy => policy.status === filters.value.status)
    }

    if (filters.value.type) {
      filtered = filtered.filter(policy => policy.type === filters.value.type)
    }

    return filtered
  })

  const policiesByType = computed(() => {
    const groups = {
      'user': [],
      'role': [],
      'team': [],
      'global': []
    }
    accessControlPolicies.value.forEach(policy => {
      const type = policy.type || 'global'
      if (groups[type]) {
        groups[type].push(policy)
      }
    })
    return groups
  })

  const userPolicies = computed(() => (userId) => {
    const userLinks = policyLinks.value.filter(
      link => link.entity_type === 'user' && link.entity_id === userId
    )
    return userLinks.map(link =>
      accessControlPolicies.value.find(policy => policy.policy_id === link.policy_id)
    ).filter(Boolean)
  })

  const rolePolicies = computed(() => (roleId) => {
    const roleLinks = policyLinks.value.filter(
      link => link.entity_type === 'role' && link.entity_id === roleId
    )
    return roleLinks.map(link =>
      accessControlPolicies.value.find(policy => policy.policy_id === link.policy_id)
    ).filter(Boolean)
  })

  const teamPolicies = computed(() => (teamId) => {
    const teamLinks = policyLinks.value.filter(
      link => link.entity_type === 'team' && link.entity_id === teamId
    )
    return teamLinks.map(link =>
      accessControlPolicies.value.find(policy => policy.policy_id === link.policy_id)
    ).filter(Boolean)
  })

  // Actions
  const fetchAccessControlPolicies = async (filterParams = {}) => {
    try {
      isLoading.value = true
      const data = await api.access.getAccessControlPolicies(filterParams)
      accessControlPolicies.value = data || []
    } catch (error) {
      console.error('Error fetching access control policies:', error)
      appStore.showError('Ошибка загрузки политик доступа: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchAccessControlStatements = async (policyId = null) => {
    try {
      const data = await api.access.getAccessControlStatements(policyId)
      accessControlStatements.value = data || []
    } catch (error) {
      console.error('Error fetching access control statements:', error)
      appStore.showError('Ошибка загрузки утверждений доступа: ' + error.message)
    }
  }

  const fetchPolicyLinks = async () => {
    try {
      const data = await api.access.getPolicyLinks()
      policyLinks.value = data || []
    } catch (error) {
      console.error('Error fetching policy links:', error)
      appStore.showError('Ошибка загрузки связей политик: ' + error.message)
    }
  }

  const selectPolicy = (policyId) => {
    selectedPolicy.value = policyId
  }

  const createPolicy = async (policyData) => {
    try {
      isLoading.value = true
      const newPolicy = await api.access.createAccessControlPolicy(policyData)
      accessControlPolicies.value.push(newPolicy)
      appStore.showSuccess('Политика доступа создана успешно')
      return newPolicy
    } catch (error) {
      appStore.showError('Ошибка создания политики доступа: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updatePolicy = async (policyId, updateData) => {
    try {
      isLoading.value = true
      const updatedPolicy = await api.access.updateAccessControlPolicy(policyId, updateData)

      const index = accessControlPolicies.value.findIndex(p => p.policy_id === policyId)
      if (index !== -1) {
        accessControlPolicies.value[index] = { ...accessControlPolicies.value[index], ...updatedPolicy }
      }

      appStore.showSuccess('Политика доступа обновлена')
      return updatedPolicy
    } catch (error) {
      appStore.showError('Ошибка обновления политики доступа: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deletePolicy = async (policyId) => {
    try {
      isLoading.value = true
      await api.access.deleteAccessControlPolicy(policyId)

      accessControlPolicies.value = accessControlPolicies.value.filter(p => p.policy_id !== policyId)
      // Удаляем связанные утверждения и связи
      accessControlStatements.value = accessControlStatements.value.filter(stmt => stmt.policy_id !== policyId)
      policyLinks.value = policyLinks.value.filter(link => link.policy_id !== policyId)

      if (selectedPolicy.value === policyId) {
        selectedPolicy.value = null
      }

      appStore.showSuccess('Политика доступа удалена')
    } catch (error) {
      appStore.showError('Ошибка удаления политики доступа: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createStatement = async (statementData) => {
    try {
      const newStatement = await api.access.createAccessControlStatement(statementData)
      accessControlStatements.value.push(newStatement)
      appStore.showSuccess('Утверждение доступа создано')
      return newStatement
    } catch (error) {
      appStore.showError('Ошибка создания утверждения доступа: ' + error.message)
      throw error
    }
  }

  const updateStatement = async (statementId, updateData) => {
    try {
      const updatedStatement = await api.access.updateAccessControlStatement(statementId, updateData)

      const index = accessControlStatements.value.findIndex(stmt => stmt.statement_id === statementId)
      if (index !== -1) {
        accessControlStatements.value[index] = { ...accessControlStatements.value[index], ...updatedStatement }
      }

      appStore.showSuccess('Утверждение доступа обновлено')
      return updatedStatement
    } catch (error) {
      appStore.showError('Ошибка обновления утверждения доступа: ' + error.message)
      throw error
    }
  }

  const deleteStatement = async (statementId) => {
    try {
      await api.access.deleteAccessControlStatement(statementId)
      accessControlStatements.value = accessControlStatements.value.filter(stmt => stmt.statement_id !== statementId)
      appStore.showSuccess('Утверждение доступа удалено')
    } catch (error) {
      appStore.showError('Ошибка удаления утверждения доступа: ' + error.message)
      throw error
    }
  }

  const linkPolicyToEntity = async (policyId, entityType, entityId) => {
    try {
      const link = await api.access.createPolicyLink({
        policy_id: policyId,
        entity_type: entityType,
        entity_id: entityId
      })
      policyLinks.value.push(link)
      appStore.showSuccess('Политика привязана к сущности')
      return link
    } catch (error) {
      appStore.showError('Ошибка привязки политики к сущности: ' + error.message)
      throw error
    }
  }

  const unlinkPolicyFromEntity = async (policyId, entityType, entityId) => {
    try {
      await api.access.deletePolicyLink(policyId, entityType, entityId)
      policyLinks.value = policyLinks.value.filter(
        link => !(link.policy_id === policyId && link.entity_type === entityType && link.entity_id === entityId)
      )
      appStore.showSuccess('Политика отвязана от сущности')
    } catch (error) {
      appStore.showError('Ошибка отвязки политики от сущности: ' + error.message)
      throw error
    }
  }

  const checkAccess = async (userId, resource, action) => {
    try {
      const result = await api.access.checkAccess(userId, resource, action)
      return result.allowed || false
    } catch (error) {
      console.error('Error checking access:', error)
      return false
    }
  }

  const getUserPermissions = async (userId) => {
    try {
      const permissions = await api.access.getUserPermissions(userId)
      return permissions || []
    } catch (error) {
      console.error('Error getting user permissions:', error)
      appStore.showError('Ошибка получения разрешений пользователя: ' + error.message)
      return []
    }
  }

  const activatePolicy = async (policyId) => {
    return updatePolicy(policyId, { status: 'active' })
  }

  const deactivatePolicy = async (policyId) => {
    return updatePolicy(policyId, { status: 'inactive' })
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const searchPolicies = async (keyword) => {
    if (!keyword.trim()) {
      await fetchAccessControlPolicies()
      return
    }

    try {
      isLoading.value = true
      const results = await api.access.searchPolicies(keyword)
      accessControlPolicies.value = results || []
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
        fetchAccessControlPolicies(),
        fetchAccessControlStatements(),
        fetchPolicyLinks()
      ])
    } catch (error) {
      console.error('Access store initialization failed:', error)
    }
  }

  return {
    // State
    accessControlPolicies,
    accessControlStatements,
    policyLinks,
    selectedPolicy,
    isLoading,
    filters,

    // Getters
    policiesWithStatements,
    selectedPolicyData,
    filteredPolicies,
    policiesByType,
    userPolicies,
    rolePolicies,
    teamPolicies,

    // Actions
    fetchAccessControlPolicies,
    fetchAccessControlStatements,
    fetchPolicyLinks,
    selectPolicy,
    createPolicy,
    updatePolicy,
    deletePolicy,
    createStatement,
    updateStatement,
    deleteStatement,
    linkPolicyToEntity,
    unlinkPolicyFromEntity,
    checkAccess,
    getUserPermissions,
    activatePolicy,
    deactivatePolicy,
    setFilters,
    clearFilters,
    searchPolicies,
    initialize
  }
})