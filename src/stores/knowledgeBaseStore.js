/**
 * Pinia store для управления базой знаний
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as knowledgeBaseAPI from '@/api/modules/knowledgeBase'

export const useKnowledgeBaseStore = defineStore('knowledgeBase', () => {
  // State
  const channelKpis = ref([])
  const historicalData = ref([])
  const marketingDocuments = ref([])
  const bestPractices = ref([])
  const knowledgeBaseStats = ref({})
  const searchResults = ref({})

  const loading = ref(false)
  const error = ref(null)

  // Getters
  const kpisByChannel = computed(() => {
    const grouped = {}
    channelKpis.value.forEach(kpi => {
      const channel = kpi.channel
      if (!grouped[channel]) {
        grouped[channel] = []
      }
      grouped[channel].push(kpi)
    })
    return grouped
  })

  const kpisByType = computed(() => {
    const grouped = {}
    channelKpis.value.forEach(kpi => {
      const type = kpi.kpi_type
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(kpi)
    })
    return grouped
  })

  const historicalDataByChannel = computed(() => {
    const grouped = {}
    historicalData.value.forEach(data => {
      const channel = data.channel
      if (!grouped[channel]) {
        grouped[channel] = []
      }
      grouped[channel].push(data)
    })
    return grouped
  })

  const documentsByCategory = computed(() => {
    const grouped = {}
    marketingDocuments.value.forEach(doc => {
      const category = doc.category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(doc)
    })
    return grouped
  })

  const documentsByType = computed(() => {
    const grouped = {}
    marketingDocuments.value.forEach(doc => {
      const type = doc.document_type || 'other'
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(doc)
    })
    return grouped
  })

  const practicesByCategory = computed(() => {
    const grouped = {}
    bestPractices.value.forEach(practice => {
      const category = practice.category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(practice)
    })
    return grouped
  })

  const topDocuments = computed(() => {
    return marketingDocuments.value
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .slice(0, 10)
  })

  const recentDocuments = computed(() => {
    return marketingDocuments.value
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 10)
  })

  // Actions - Channel KPIs
  const loadChannelKpis = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await knowledgeBaseAPI.getChannelKpis(filters)
      channelKpis.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadChannelKpiById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const kpi = await knowledgeBaseAPI.getChannelKpiById(id)

      const index = channelKpis.value.findIndex(k => k.kpi_id === id)
      if (index !== -1) {
        channelKpis.value[index] = kpi
      } else {
        channelKpis.value.push(kpi)
      }

      return kpi
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createChannelKpi = async (kpiData) => {
    loading.value = true
    error.value = null

    try {
      const newKpi = await knowledgeBaseAPI.createChannelKpi(kpiData)
      channelKpis.value.push(newKpi)
      return newKpi
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateChannelKpi = async (id, updates) => {
    loading.value = true
    error.value = null

    try {
      const updatedKpi = await knowledgeBaseAPI.updateChannelKpi(id, updates)

      const index = channelKpis.value.findIndex(k => k.kpi_id === id)
      if (index !== -1) {
        channelKpis.value[index] = updatedKpi
      }

      return updatedKpi
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteChannelKpi = async (id) => {
    loading.value = true
    error.value = null

    try {
      await knowledgeBaseAPI.deleteChannelKpi(id)
      const index = channelKpis.value.findIndex(k => k.kpi_id === id)
      if (index !== -1) {
        channelKpis.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Historical Data
  const loadHistoricalData = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await knowledgeBaseAPI.getHistoricalData(filters)
      historicalData.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createHistoricalData = async (data) => {
    loading.value = true
    error.value = null

    try {
      const newData = await knowledgeBaseAPI.createHistoricalData(data)
      historicalData.value.push(newData)
      return newData
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Marketing Documents
  const loadMarketingDocuments = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await knowledgeBaseAPI.getMarketingDocuments(filters)
      marketingDocuments.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadMarketingDocumentById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const document = await knowledgeBaseAPI.getMarketingDocumentById(id)

      const index = marketingDocuments.value.findIndex(d => d.document_id === id)
      if (index !== -1) {
        marketingDocuments.value[index] = document
      } else {
        marketingDocuments.value.push(document)
      }

      return document
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMarketingDocument = async (documentData) => {
    loading.value = true
    error.value = null

    try {
      const newDocument = await knowledgeBaseAPI.createMarketingDocument(documentData)
      marketingDocuments.value.push(newDocument)
      return newDocument
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMarketingDocument = async (id, updates) => {
    loading.value = true
    error.value = null

    try {
      const updatedDocument = await knowledgeBaseAPI.updateMarketingDocument(id, updates)

      const index = marketingDocuments.value.findIndex(d => d.document_id === id)
      if (index !== -1) {
        marketingDocuments.value[index] = updatedDocument
      }

      return updatedDocument
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMarketingDocument = async (id) => {
    loading.value = true
    error.value = null

    try {
      await knowledgeBaseAPI.deleteMarketingDocument(id)
      const index = marketingDocuments.value.findIndex(d => d.document_id === id)
      if (index !== -1) {
        marketingDocuments.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Best Practices
  const loadBestPractices = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await knowledgeBaseAPI.getBestPractices(filters)
      bestPractices.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadBestPracticeById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const practice = await knowledgeBaseAPI.getBestPracticeById(id)

      const index = bestPractices.value.findIndex(p => p.practice_id === id)
      if (index !== -1) {
        bestPractices.value[index] = practice
      } else {
        bestPractices.value.push(practice)
      }

      return practice
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Analytics & Search
  const loadKnowledgeBaseStats = async () => {
    loading.value = true
    error.value = null

    try {
      const stats = await knowledgeBaseAPI.getKnowledgeBaseStats()
      knowledgeBaseStats.value = stats
      return stats
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchKnowledgeBase = async (query, filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const results = await knowledgeBaseAPI.searchKnowledgeBase(query, filters)
      searchResults.value = results
      return results
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getRecommendations = async (context) => {
    loading.value = true
    error.value = null

    try {
      const recommendations = await knowledgeBaseAPI.getRecommendations(context)
      return recommendations
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  const getKpisByChannel = (channel) => {
    return channelKpis.value.filter(kpi => kpi.channel === channel)
  }

  const getKpisByType = (type) => {
    return channelKpis.value.filter(kpi => kpi.kpi_type === type)
  }

  const getHistoricalDataForChannel = (channel) => {
    return historicalData.value.filter(data => data.channel === channel)
  }

  const getDocumentsByCategory = (category) => {
    return marketingDocuments.value.filter(doc => doc.category === category)
  }

  const getPracticesForChannel = (channel) => {
    return bestPractices.value.filter(practice =>
      practice.applicable_channels.includes(channel)
    )
  }

  const clearError = () => {
    error.value = null
  }

  const clearSearchResults = () => {
    searchResults.value = {}
  }

  return {
    // State
    channelKpis,
    historicalData,
    marketingDocuments,
    bestPractices,
    knowledgeBaseStats,
    searchResults,
    loading,
    error,

    // Getters
    kpisByChannel,
    kpisByType,
    historicalDataByChannel,
    documentsByCategory,
    documentsByType,
    practicesByCategory,
    topDocuments,
    recentDocuments,

    // Actions
    loadChannelKpis,
    loadChannelKpiById,
    createChannelKpi,
    updateChannelKpi,
    deleteChannelKpi,
    loadHistoricalData,
    createHistoricalData,
    loadMarketingDocuments,
    loadMarketingDocumentById,
    createMarketingDocument,
    updateMarketingDocument,
    deleteMarketingDocument,
    loadBestPractices,
    loadBestPracticeById,
    loadKnowledgeBaseStats,
    searchKnowledgeBase,
    getRecommendations,

    // Utilities
    getKpisByChannel,
    getKpisByType,
    getHistoricalDataForChannel,
    getDocumentsByCategory,
    getPracticesForChannel,
    clearError,
    clearSearchResults
  }
})