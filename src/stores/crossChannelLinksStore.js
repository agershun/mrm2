import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { crossChannelLinksApi } from '@/api/modules/crossChannelLinks'

export const useCrossChannelLinksStore = defineStore('crossChannelLinks', () => {
  // State
  const links = ref([])
  const currentLink = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const linkTypes = ref([])
  const influenceGraph = ref({ nodes: [], edges: [] })
  const stats = ref({})
  const analysis = ref({})

  // Getters
  const linksByType = computed(() => {
    const grouped = {}
    links.value.forEach(link => {
      if (!grouped[link.link_type]) {
        grouped[link.link_type] = []
      }
      grouped[link.link_type].push(link)
    })
    return grouped
  })

  const linksBySource = computed(() => {
    const grouped = {}
    links.value.forEach(link => {
      if (!grouped[link.source_activity_id]) {
        grouped[link.source_activity_id] = []
      }
      grouped[link.source_activity_id].push(link)
    })
    return grouped
  })

  const linksByTarget = computed(() => {
    const grouped = {}
    links.value.forEach(link => {
      if (!grouped[link.target_activity_id]) {
        grouped[link.target_activity_id] = []
      }
      grouped[link.target_activity_id].push(link)
    })
    return grouped
  })

  const highInfluenceLinks = computed(() => {
    return links.value.filter(link => link.influence_strength >= 0.7)
  })

  const highConfidenceLinks = computed(() => {
    return links.value.filter(link => link.confidence_level >= 0.8)
  })

  const getLinkById = computed(() => {
    return (linkId) => links.value.find(l => l.link_id === linkId)
  })

  const getLinksForActivity = computed(() => {
    return (activityId) => {
      const outgoing = links.value.filter(l => l.source_activity_id === activityId)
      const incoming = links.value.filter(l => l.target_activity_id === activityId)
      return { outgoing, incoming }
    }
  })

  // Actions
  const fetchLinks = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.getCrossChannelLinks(filters)
      links.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchLink = async (linkId) => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.getCrossChannelLink(linkId)
      currentLink.value = response.data

      // Обновить связь в списке, если она уже загружена
      const index = links.value.findIndex(l => l.link_id === linkId)
      if (index !== -1) {
        links.value[index] = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createLink = async (linkData) => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.createCrossChannelLink(linkData)
      links.value.push(response.data)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLink = async (linkId, updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.updateCrossChannelLink(linkId, updates)

      // Обновить связь в списке
      const index = links.value.findIndex(l => l.link_id === linkId)
      if (index !== -1) {
        links.value[index] = response.data
      }

      // Обновить текущую связь, если это она
      if (currentLink.value?.link_id === linkId) {
        currentLink.value = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteLink = async (linkId) => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.deleteCrossChannelLink(linkId)

      // Удалить связь из списка
      const index = links.value.findIndex(l => l.link_id === linkId)
      if (index !== -1) {
        links.value.splice(index, 1)
      }

      // Очистить текущую связь, если это она
      if (currentLink.value?.link_id === linkId) {
        currentLink.value = null
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchLinksFromActivity = async (activityId) => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.getLinksFromActivity(activityId)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchLinksToActivity = async (activityId) => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.getLinksToActivity(activityId)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAllLinksForActivity = async (activityId) => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.getAllLinksForActivity(activityId)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchInfluenceGraph = async (activityIds = []) => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.getInfluenceGraph(activityIds)
      influenceGraph.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchLinkTypes = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.getLinkTypes()
      linkTypes.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchInfluenceAnalysis = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.getInfluenceAnalysis()
      analysis.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const findPotentialLinks = async (activityId, threshold = 0.7) => {
    loading.value = true
    error.value = null
    try {
      const response = await crossChannelLinksApi.findPotentialLinks(activityId, threshold)
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
      const response = await crossChannelLinksApi.getCrossChannelStats()
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
  const getInfluenceChain = (startActivityId, maxDepth = 3) => {
    const visited = new Set()
    const chain = []

    const traverse = (activityId, depth = 0) => {
      if (depth >= maxDepth || visited.has(activityId)) return

      visited.add(activityId)
      const outgoingLinks = linksBySource.value[activityId] || []

      outgoingLinks.forEach(link => {
        chain.push({
          from: link.source_activity_id,
          to: link.target_activity_id,
          influence: link.influence_strength,
          type: link.link_type,
          depth: depth + 1
        })

        traverse(link.target_activity_id, depth + 1)
      })
    }

    traverse(startActivityId)
    return chain
  }

  const calculateTotalInfluence = (activityId) => {
    const outgoingLinks = linksBySource.value[activityId] || []
    const incomingLinks = linksByTarget.value[activityId] || []

    const outgoingInfluence = outgoingLinks.reduce((sum, link) => sum + link.influence_strength, 0)
    const incomingInfluence = incomingLinks.reduce((sum, link) => sum + link.influence_strength, 0)

    return {
      outgoing: outgoingInfluence,
      incoming: incomingInfluence,
      total: outgoingInfluence + incomingInfluence,
      ratio: outgoingInfluence / (incomingInfluence || 1)
    }
  }

  const getStrongestInfluencers = (targetActivityId) => {
    const incomingLinks = linksByTarget.value[targetActivityId] || []
    return incomingLinks
      .sort((a, b) => b.influence_strength - a.influence_strength)
      .slice(0, 5)
  }

  const getTopInfluenced = (sourceActivityId) => {
    const outgoingLinks = linksBySource.value[sourceActivityId] || []
    return outgoingLinks
      .sort((a, b) => b.influence_strength - a.influence_strength)
      .slice(0, 5)
  }

  // Utilities
  const clearError = () => {
    error.value = null
  }

  const setCurrentLink = (link) => {
    currentLink.value = link
  }

  const clearCurrentLink = () => {
    currentLink.value = null
  }

  const reset = () => {
    links.value = []
    currentLink.value = null
    loading.value = false
    error.value = null
    linkTypes.value = []
    influenceGraph.value = { nodes: [], edges: [] }
    stats.value = {}
    analysis.value = {}
  }

  return {
    // State
    links,
    currentLink,
    loading,
    error,
    linkTypes,
    influenceGraph,
    stats,
    analysis,

    // Getters
    linksByType,
    linksBySource,
    linksByTarget,
    highInfluenceLinks,
    highConfidenceLinks,
    getLinkById,
    getLinksForActivity,

    // Actions
    fetchLinks,
    fetchLink,
    createLink,
    updateLink,
    deleteLink,
    fetchLinksFromActivity,
    fetchLinksToActivity,
    fetchAllLinksForActivity,
    fetchInfluenceGraph,
    fetchLinkTypes,
    fetchInfluenceAnalysis,
    findPotentialLinks,
    fetchStats,

    // Utility functions
    getInfluenceChain,
    calculateTotalInfluence,
    getStrongestInfluencers,
    getTopInfluenced,

    // Utilities
    clearError,
    setCurrentLink,
    clearCurrentLink,
    reset
  }
})