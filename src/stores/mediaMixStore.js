/**
 * Pinia store для управления медиа-миксом
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as mediaMixAPI from '@/api/modules/mediaMix'

export const useMediaMixStore = defineStore('mediaMix', () => {
  // State
  const mediaMixes = ref([])
  const mediaMixTemplates = ref([])
  const channelPerformance = ref([])
  const optimizationResults = ref([])
  const currentOptimization = ref(null)

  const loading = ref(false)
  const error = ref(null)

  // Getters
  const mediaMixesByCampaign = computed(() => {
    const grouped = {}
    mediaMixes.value.forEach(mix => {
      const campaignId = mix.campaign_id
      if (!grouped[campaignId]) {
        grouped[campaignId] = []
      }
      grouped[campaignId].push(mix)
    })
    return grouped
  })

  const mediaMixesByStatus = computed(() => {
    const grouped = {}
    mediaMixes.value.forEach(mix => {
      const status = mix.status
      if (!grouped[status]) {
        grouped[status] = []
      }
      grouped[status].push(mix)
    })
    return grouped
  })

  const activeMixes = computed(() => {
    return mediaMixes.value.filter(mix => mix.status === 'active')
  })

  const templatesByIndustry = computed(() => {
    const grouped = {}
    mediaMixTemplates.value.forEach(template => {
      const industry = template.industry
      if (!grouped[industry]) {
        grouped[industry] = []
      }
      grouped[industry].push(template)
    })
    return grouped
  })

  const channelPerformanceByChannel = computed(() => {
    const grouped = {}
    channelPerformance.value.forEach(perf => {
      const channel = perf.channel
      if (!grouped[channel]) {
        grouped[channel] = []
      }
      grouped[channel].push(perf)
    })
    return grouped
  })

  const topPerformingChannels = computed(() => {
    return channelPerformance.value
      .sort((a, b) => (b.metrics.roas || 0) - (a.metrics.roas || 0))
      .slice(0, 5)
  })

  const totalBudgetsByChannel = computed(() => {
    const totals = {}
    mediaMixes.value.forEach(mix => {
      mix.channels.forEach(channel => {
        if (!totals[channel.channel_name]) {
          totals[channel.channel_name] = 0
        }
        totals[channel.channel_name] += channel.budget_allocation
      })
    })
    return totals
  })

  // Actions - Media Mixes
  const loadMediaMixes = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await mediaMixAPI.getMediaMixes(filters)
      mediaMixes.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadMediaMixById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const mix = await mediaMixAPI.getMediaMixById(id)

      const index = mediaMixes.value.findIndex(m => m.mix_id === id)
      if (index !== -1) {
        mediaMixes.value[index] = mix
      } else {
        mediaMixes.value.push(mix)
      }

      return mix
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMediaMix = async (mixData) => {
    loading.value = true
    error.value = null

    try {
      const newMix = await mediaMixAPI.createMediaMix(mixData)
      mediaMixes.value.push(newMix)
      return newMix
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMediaMix = async (id, updates) => {
    loading.value = true
    error.value = null

    try {
      const updatedMix = await mediaMixAPI.updateMediaMix(id, updates)

      const index = mediaMixes.value.findIndex(m => m.mix_id === id)
      if (index !== -1) {
        mediaMixes.value[index] = updatedMix
      }

      return updatedMix
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMediaMix = async (id) => {
    loading.value = true
    error.value = null

    try {
      await mediaMixAPI.deleteMediaMix(id)
      const index = mediaMixes.value.findIndex(m => m.mix_id === id)
      if (index !== -1) {
        mediaMixes.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Templates
  const loadMediaMixTemplates = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await mediaMixAPI.getMediaMixTemplates(filters)
      mediaMixTemplates.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Channel Performance
  const loadChannelPerformance = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await mediaMixAPI.getChannelPerformance(filters)
      channelPerformance.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Optimization
  const optimizeMediaMix = async (mixId, optimizationParams) => {
    loading.value = true
    error.value = null

    try {
      const result = await mediaMixAPI.optimizeMediaMix(mixId, optimizationParams)
      currentOptimization.value = result
      optimizationResults.value.push(result)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const calculateROI = async (mixData) => {
    loading.value = true
    error.value = null

    try {
      const calculation = await mediaMixAPI.calculateMediaMixROI(mixData)
      return calculation
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const compareMediaMixes = async (mixIds) => {
    loading.value = true
    error.value = null

    try {
      const comparison = await mediaMixAPI.compareMediaMixes(mixIds)
      return comparison
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  const getMediaMixesByCampaign = (campaignId) => {
    return mediaMixes.value.filter(mix => mix.campaign_id === campaignId)
  }

  const getChannelAllocation = (mixId, channelName) => {
    const mix = mediaMixes.value.find(m => m.mix_id === mixId)
    if (!mix) return null

    const channel = mix.channels.find(ch => ch.channel_name === channelName)
    return channel || null
  }

  const getTotalBudgetByMix = (mixId) => {
    const mix = mediaMixes.value.find(m => m.mix_id === mixId)
    return mix ? mix.total_budget : 0
  }

  const getChannelPerformanceData = (channel, period) => {
    return channelPerformance.value.find(perf =>
      perf.channel === channel && perf.period === period
    )
  }

  const getOptimizationHistory = (mixId) => {
    return optimizationResults.value.filter(opt => opt.mix_id === mixId)
  }

  const clearError = () => {
    error.value = null
  }

  const clearOptimization = () => {
    currentOptimization.value = null
  }

  return {
    // State
    mediaMixes,
    mediaMixTemplates,
    channelPerformance,
    optimizationResults,
    currentOptimization,
    loading,
    error,

    // Getters
    mediaMixesByCampaign,
    mediaMixesByStatus,
    activeMixes,
    templatesByIndustry,
    channelPerformanceByChannel,
    topPerformingChannels,
    totalBudgetsByChannel,

    // Actions
    loadMediaMixes,
    loadMediaMixById,
    createMediaMix,
    updateMediaMix,
    deleteMediaMix,
    loadMediaMixTemplates,
    loadChannelPerformance,
    optimizeMediaMix,
    calculateROI,
    compareMediaMixes,

    // Utilities
    getMediaMixesByCampaign,
    getChannelAllocation,
    getTotalBudgetByMix,
    getChannelPerformanceData,
    getOptimizationHistory,
    clearError,
    clearOptimization
  }
})