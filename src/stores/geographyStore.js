import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { geographyApi } from '@/api/modules/geography'

export const useGeographyStore = defineStore('geography', () => {
  // State
  const geographies = ref([])
  const currentGeography = ref(null)
  const hierarchyTree = ref([])
  const loading = ref(false)
  const error = ref(null)
  const types = ref([])
  const stats = ref({})

  // Getters
  const activeGeographies = computed(() =>
    geographies.value.filter(geo => geo.is_active)
  )

  const geographiesByType = computed(() => {
    const grouped = {}
    geographies.value.forEach(geo => {
      if (!grouped[geo.type]) {
        grouped[geo.type] = []
      }
      grouped[geo.type].push(geo)
    })
    return grouped
  })

  const countries = computed(() =>
    geographies.value.filter(geo => geo.type === 'Country' && geo.is_active)
  )

  const regions = computed(() =>
    geographies.value.filter(geo => geo.type === 'Region' && geo.is_active)
  )

  const cities = computed(() =>
    geographies.value.filter(geo => geo.type === 'City' && geo.is_active)
  )

  const getGeographyById = computed(() => {
    return (geographyId) => geographies.value.find(g => g.geography_id === geographyId)
  })

  const getChildrenOf = computed(() => {
    return (parentId) => geographies.value.filter(geo => geo.parent_id === parentId && geo.is_active)
  })

  // Actions
  const fetchGeographies = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await geographyApi.getGeographies(filters)
      geographies.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchGeography = async (geographyId) => {
    loading.value = true
    error.value = null
    try {
      const response = await geographyApi.getGeography(geographyId)
      currentGeography.value = response.data

      // Обновить географию в списке, если она уже загружена
      const index = geographies.value.findIndex(g => g.geography_id === geographyId)
      if (index !== -1) {
        geographies.value[index] = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchHierarchy = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await geographyApi.getGeographyHierarchy()
      hierarchyTree.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchChildren = async (parentId) => {
    loading.value = true
    error.value = null
    try {
      const response = await geographyApi.getGeographyChildren(parentId)

      // Обновить детей в основном списке
      response.data.forEach(child => {
        const index = geographies.value.findIndex(g => g.geography_id === child.geography_id)
        if (index === -1) {
          geographies.value.push(child)
        } else {
          geographies.value[index] = child
        }
      })

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPath = async (geographyId) => {
    loading.value = true
    error.value = null
    try {
      const response = await geographyApi.getGeographyPath(geographyId)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createGeography = async (geographyData) => {
    loading.value = true
    error.value = null
    try {
      const response = await geographyApi.createGeography(geographyData)
      geographies.value.push(response.data)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateGeography = async (geographyId, updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await geographyApi.updateGeography(geographyId, updates)

      // Обновить географию в списке
      const index = geographies.value.findIndex(g => g.geography_id === geographyId)
      if (index !== -1) {
        geographies.value[index] = response.data
      }

      // Обновить текущую географию, если это она
      if (currentGeography.value?.geography_id === geographyId) {
        currentGeography.value = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTypes = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await geographyApi.getGeographyTypes()
      types.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchGeographiesByType = async (type) => {
    loading.value = true
    error.value = null
    try {
      const response = await geographyApi.getGeographiesByType(type)

      // Обновить географии в основном списке
      response.data.forEach(geo => {
        const index = geographies.value.findIndex(g => g.geography_id === geo.geography_id)
        if (index === -1) {
          geographies.value.push(geo)
        } else {
          geographies.value[index] = geo
        }
      })

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchMillionCities = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await geographyApi.getMillionCities()
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
      const response = await geographyApi.getGeographyStats()
      stats.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utilities
  const clearError = () => {
    error.value = null
  }

  const setCurrentGeography = (geography) => {
    currentGeography.value = geography
  }

  const clearCurrentGeography = () => {
    currentGeography.value = null
  }

  const buildBreadcrumbs = async (geographyId) => {
    try {
      const pathResponse = await fetchPath(geographyId)
      return pathResponse.data
    } catch (err) {
      console.error('Error building breadcrumbs:', err)
      return []
    }
  }

  const reset = () => {
    geographies.value = []
    currentGeography.value = null
    hierarchyTree.value = []
    loading.value = false
    error.value = null
    types.value = []
    stats.value = {}
  }

  return {
    // State
    geographies,
    currentGeography,
    hierarchyTree,
    loading,
    error,
    types,
    stats,

    // Getters
    activeGeographies,
    geographiesByType,
    countries,
    regions,
    cities,
    getGeographyById,
    getChildrenOf,

    // Actions
    fetchGeographies,
    fetchGeography,
    fetchHierarchy,
    fetchChildren,
    fetchPath,
    createGeography,
    updateGeography,
    fetchTypes,
    fetchGeographiesByType,
    fetchMillionCities,
    fetchStats,

    // Utilities
    clearError,
    setCurrentGeography,
    clearCurrentGeography,
    buildBreadcrumbs,
    reset
  }
})