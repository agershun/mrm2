import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { placementsApi } from '@/api/modules/placements'

export const useplacementsStore = defineStore('placements', () => {
  // State
  const placements = ref([])
  const currentPlacement = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const platforms = ref([])
  const categories = ref([])
  const stats = ref({})
  const recommendations = ref([])

  // Getters
  const activePlacements = computed(() =>
    placements.value.filter(placement => placement.is_active)
  )

  const placementsByPlatform = computed(() => {
    const grouped = {}
    placements.value.forEach(placement => {
      if (!grouped[placement.platform]) {
        grouped[placement.platform] = []
      }
      grouped[placement.platform].push(placement)
    })
    return grouped
  })

  const placementsByCategory = computed(() => {
    const grouped = {}
    placements.value.forEach(placement => {
      if (!grouped[placement.category]) {
        grouped[placement.category] = []
      }
      grouped[placement.category].push(placement)
    })
    return grouped
  })

  const topPerformingPlacements = computed(() => {
    return activePlacements.value
      .sort((a, b) => (b.avg_engagement_rate || 0) - (a.avg_engagement_rate || 0))
      .slice(0, 10)
  })

  const mostAffordablePlacements = computed(() => {
    return activePlacements.value
      .filter(p => p.price_per_post || p.price_per_video || p.price_per_banner)
      .sort((a, b) => {
        const priceA = a.price_per_post || a.price_per_video || a.price_per_banner || Infinity
        const priceB = b.price_per_post || b.price_per_video || b.price_per_banner || Infinity
        return priceA - priceB
      })
      .slice(0, 10)
  })

  const getPlacementById = computed(() => {
    return (placementId) => placements.value.find(p => p.placement_id === placementId)
  })

  // Actions
  const fetchPlacements = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await placementsApi.getPlacements(filters)
      placements.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPlacement = async (placementId) => {
    loading.value = true
    error.value = null
    try {
      const response = await placementsApi.getPlacement(placementId)
      currentPlacement.value = response.data

      // Обновить площадку в списке, если она уже загружена
      const index = placements.value.findIndex(p => p.placement_id === placementId)
      if (index !== -1) {
        placements.value[index] = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPlacement = async (placementData) => {
    loading.value = true
    error.value = null
    try {
      const response = await placementsApi.createPlacement(placementData)
      placements.value.push(response.data)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePlacement = async (placementId, updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await placementsApi.updatePlacement(placementId, updates)

      // Обновить площадку в списке
      const index = placements.value.findIndex(p => p.placement_id === placementId)
      if (index !== -1) {
        placements.value[index] = response.data
      }

      // Обновить текущую площадку, если это она
      if (currentPlacement.value?.placement_id === placementId) {
        currentPlacement.value = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePlacement = async (placementId) => {
    loading.value = true
    error.value = null
    try {
      const response = await placementsApi.deletePlacement(placementId)

      // Удалить площадку из списка
      const index = placements.value.findIndex(p => p.placement_id === placementId)
      if (index !== -1) {
        placements.value.splice(index, 1)
      }

      // Очистить текущую площадку, если это она
      if (currentPlacement.value?.placement_id === placementId) {
        currentPlacement.value = null
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPlacementsByPlatform = async (platform) => {
    loading.value = true
    error.value = null
    try {
      const response = await placementsApi.getPlacementsByPlatform(platform)

      // Обновить площадки в основном списке
      response.data.forEach(placement => {
        const index = placements.value.findIndex(p => p.placement_id === placement.placement_id)
        if (index === -1) {
          placements.value.push(placement)
        } else {
          placements.value[index] = placement
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

  const fetchPlacementsByCategory = async (category) => {
    loading.value = true
    error.value = null
    try {
      const response = await placementsApi.getPlacementsByCategory(category)

      // Обновить площадки в основном списке
      response.data.forEach(placement => {
        const index = placements.value.findIndex(p => p.placement_id === placement.placement_id)
        if (index === -1) {
          placements.value.push(placement)
        } else {
          placements.value[index] = placement
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

  const fetchRecommendations = async (criteria = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await placementsApi.getPlacementRecommendations(criteria)
      recommendations.value = response.data
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
      const response = await placementsApi.getPlacementStats()
      stats.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPlatforms = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await placementsApi.getPlatforms()
      platforms.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await placementsApi.getCategories()
      categories.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchContentTypes = async (placementId) => {
    loading.value = true
    error.value = null
    try {
      const response = await placementsApi.getContentTypes(placementId)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  const getPlacementEfficiency = (placement) => {
    if (!placement.price_per_post || !placement.avg_reach) return 0
    return placement.avg_reach / placement.price_per_post
  }

  const filterPlacementsByBudget = (maxBudget) => {
    return activePlacements.value.filter(placement => {
      const price = placement.price_per_post || placement.price_per_video || placement.price_per_banner
      return price && price <= maxBudget
    })
  }

  const filterPlacementsByAudience = (targetDemographics) => {
    return activePlacements.value.filter(placement => {
      if (!placement.audience_demographics) return false

      const demographics = placement.audience_demographics
      let score = 0

      // Оценка соответствия по возрасту
      if (targetDemographics.age_18_24) {
        score += (demographics.age_18_24 || 0) * (targetDemographics.age_18_24 / 100)
      }
      if (targetDemographics.age_25_34) {
        score += (demographics.age_25_34 || 0) * (targetDemographics.age_25_34 / 100)
      }
      if (targetDemographics.age_35_44) {
        score += (demographics.age_35_44 || 0) * (targetDemographics.age_35_44 / 100)
      }
      if (targetDemographics.age_45_plus) {
        score += (demographics.age_45_plus || 0) * (targetDemographics.age_45_plus / 100)
      }

      // Оценка соответствия по полу
      if (targetDemographics.female) {
        score += (demographics.female || 0) * (targetDemographics.female / 100)
      }
      if (targetDemographics.male) {
        score += (demographics.male || 0) * (targetDemographics.male / 100)
      }

      return score >= 30 // Минимум 30% совпадения
    })
  }

  // Utilities
  const clearError = () => {
    error.value = null
  }

  const setCurrentPlacement = (placement) => {
    currentPlacement.value = placement
  }

  const clearCurrentPlacement = () => {
    currentPlacement.value = null
  }

  const reset = () => {
    placements.value = []
    currentPlacement.value = null
    loading.value = false
    error.value = null
    platforms.value = []
    categories.value = []
    stats.value = {}
    recommendations.value = []
  }

  return {
    // State
    placements,
    currentPlacement,
    loading,
    error,
    platforms,
    categories,
    stats,
    recommendations,

    // Getters
    activePlacements,
    placementsByPlatform,
    placementsByCategory,
    topPerformingPlacements,
    mostAffordablePlacements,
    getPlacementById,

    // Actions
    fetchPlacements,
    fetchPlacement,
    createPlacement,
    updatePlacement,
    deletePlacement,
    fetchPlacementsByPlatform,
    fetchPlacementsByCategory,
    fetchRecommendations,
    fetchStats,
    fetchPlatforms,
    fetchCategories,
    fetchContentTypes,

    // Utility functions
    getPlacementEfficiency,
    filterPlacementsByBudget,
    filterPlacementsByAudience,

    // Utilities
    clearError,
    setCurrentPlacement,
    clearCurrentPlacement,
    reset
  }
})