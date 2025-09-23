import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { kpiHierarchiesApi } from '@/api/modules/kpiHierarchies'

export const useKpiHierarchiesStore = defineStore('kpiHierarchies', () => {
  // State
  const hierarchies = ref([])
  const currentHierarchy = ref(null)
  const hierarchyTree = ref([])
  const loading = ref(false)
  const error = ref(null)
  const relationshipTypes = ref([])
  const calculationMethods = ref([])
  const stats = ref({})

  // Getters
  const activeHierarchies = computed(() =>
    hierarchies.value.filter(hierarchy => hierarchy.is_active)
  )

  const hierarchiesByType = computed(() => {
    const grouped = {}
    hierarchies.value.forEach(hierarchy => {
      if (!grouped[hierarchy.relationship_type]) {
        grouped[hierarchy.relationship_type] = []
      }
      grouped[hierarchy.relationship_type].push(hierarchy)
    })
    return grouped
  })

  const hierarchiesByParent = computed(() => {
    const grouped = {}
    hierarchies.value.forEach(hierarchy => {
      if (!grouped[hierarchy.parent_kpi_id]) {
        grouped[hierarchy.parent_kpi_id] = []
      }
      grouped[hierarchy.parent_kpi_id].push(hierarchy)
    })
    return grouped
  })

  const hierarchiesByChild = computed(() => {
    const grouped = {}
    hierarchies.value.forEach(hierarchy => {
      if (!grouped[hierarchy.child_kpi_id]) {
        grouped[hierarchy.child_kpi_id] = []
      }
      grouped[hierarchy.child_kpi_id].push(hierarchy)
    })
    return grouped
  })

  const getHierarchyById = computed(() => {
    return (hierarchyId) => hierarchies.value.find(h => h.hierarchy_id === hierarchyId)
  })

  const getChildrenOf = computed(() => {
    return (parentKpiId) => hierarchiesByParent.value[parentKpiId] || []
  })

  const getParentsOf = computed(() => {
    return (childKpiId) => hierarchiesByChild.value[childKpiId] || []
  })

  // Actions
  const fetchHierarchies = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.getKpiHierarchies(filters)
      hierarchies.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchHierarchy = async (hierarchyId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.getKpiHierarchy(hierarchyId)
      currentHierarchy.value = response.data

      // Обновить иерархию в списке, если она уже загружена
      const index = hierarchies.value.findIndex(h => h.hierarchy_id === hierarchyId)
      if (index !== -1) {
        hierarchies.value[index] = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createHierarchy = async (hierarchyData) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.createKpiHierarchy(hierarchyData)
      hierarchies.value.push(response.data)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateHierarchy = async (hierarchyId, updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.updateKpiHierarchy(hierarchyId, updates)

      // Обновить иерархию в списке
      const index = hierarchies.value.findIndex(h => h.hierarchy_id === hierarchyId)
      if (index !== -1) {
        hierarchies.value[index] = response.data
      }

      // Обновить текущую иерархию, если это она
      if (currentHierarchy.value?.hierarchy_id === hierarchyId) {
        currentHierarchy.value = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteHierarchy = async (hierarchyId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.deleteKpiHierarchy(hierarchyId)

      // Удалить иерархию из списка
      const index = hierarchies.value.findIndex(h => h.hierarchy_id === hierarchyId)
      if (index !== -1) {
        hierarchies.value.splice(index, 1)
      }

      // Очистить текущую иерархию, если это она
      if (currentHierarchy.value?.hierarchy_id === hierarchyId) {
        currentHierarchy.value = null
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchChildrenKpis = async (parentKpiId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.getChildrenKpis(parentKpiId)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchParentKpis = async (childKpiId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.getParentKpis(childKpiId)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const buildHierarchyTree = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.buildKpiHierarchyTree()
      hierarchyTree.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchKpiPath = async (targetKpiId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.getKpiPath(targetKpiId)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const calculateInfluence = async (kpiId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.calculateKpiInfluence(kpiId)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchRelationshipTypes = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.getRelationshipTypes()
      relationshipTypes.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCalculationMethods = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.getCalculationMethods()
      calculationMethods.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const validateHierarchy = async (parentKpiId, childKpiId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.validateHierarchy(parentKpiId, childKpiId)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiHierarchiesApi.getKpiHierarchyStats()
      stats.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  const hasCircularDependency = (parentKpiId, childKpiId) => {
    const visited = new Set()

    const checkCycle = (currentKpiId, targetKpiId) => {
      if (currentKpiId === targetKpiId) return true
      if (visited.has(currentKpiId)) return false

      visited.add(currentKpiId)
      const children = getChildrenOf.value(currentKpiId)

      return children.some(child => checkCycle(child.child_kpi_id, targetKpiId))
    }

    return checkCycle(childKpiId, parentKpiId)
  }

  const getKpiLevel = (kpiId) => {
    const parents = getParentsOf.value(kpiId)
    if (parents.length === 0) return 0 // Root level

    let maxLevel = 0
    const visited = new Set()

    const traverse = (currentKpiId, level = 0) => {
      if (visited.has(currentKpiId)) return level
      visited.add(currentKpiId)

      const kpiParents = getParentsOf.value(currentKpiId)
      if (kpiParents.length === 0) return level

      kpiParents.forEach(parent => {
        const parentLevel = traverse(parent.parent_kpi_id, level + 1)
        maxLevel = Math.max(maxLevel, parentLevel)
      })

      return maxLevel
    }

    return traverse(kpiId)
  }

  const getTotalWeight = (parentKpiId) => {
    const children = getChildrenOf.value(parentKpiId)
    return children.reduce((sum, child) => sum + child.weight, 0)
  }

  const isWeightBalanced = (parentKpiId, tolerance = 0.05) => {
    const totalWeight = getTotalWeight(parentKpiId)
    return Math.abs(totalWeight - 1.0) <= tolerance
  }

  const getUnbalancedParents = () => {
    const parentKpiIds = [...new Set(hierarchies.value.map(h => h.parent_kpi_id))]
    return parentKpiIds.filter(parentId => !isWeightBalanced(parentId))
  }

  // Utilities
  const clearError = () => {
    error.value = null
  }

  const setCurrentHierarchy = (hierarchy) => {
    currentHierarchy.value = hierarchy
  }

  const clearCurrentHierarchy = () => {
    currentHierarchy.value = null
  }

  const reset = () => {
    hierarchies.value = []
    currentHierarchy.value = null
    hierarchyTree.value = []
    loading.value = false
    error.value = null
    relationshipTypes.value = []
    calculationMethods.value = []
    stats.value = {}
  }

  return {
    // State
    hierarchies,
    currentHierarchy,
    hierarchyTree,
    loading,
    error,
    relationshipTypes,
    calculationMethods,
    stats,

    // Getters
    activeHierarchies,
    hierarchiesByType,
    hierarchiesByParent,
    hierarchiesByChild,
    getHierarchyById,
    getChildrenOf,
    getParentsOf,

    // Actions
    fetchHierarchies,
    fetchHierarchy,
    createHierarchy,
    updateHierarchy,
    deleteHierarchy,
    fetchChildrenKpis,
    fetchParentKpis,
    buildHierarchyTree,
    fetchKpiPath,
    calculateInfluence,
    fetchRelationshipTypes,
    fetchCalculationMethods,
    validateHierarchy,
    fetchStats,

    // Utility functions
    hasCircularDependency,
    getKpiLevel,
    getTotalWeight,
    isWeightBalanced,
    getUnbalancedParents,

    // Utilities
    clearError,
    setCurrentHierarchy,
    clearCurrentHierarchy,
    reset
  }
})