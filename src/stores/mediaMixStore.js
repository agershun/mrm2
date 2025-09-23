import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as mediaMixAPI from '@/api/modules/mediaMix'

export const useMediaMixStore = defineStore('mediaMix', () => {
  // State
  const mediaMixes = ref([])
  const currentMediaMix = ref(null)
  const mediaMixItems = ref([])
  const mediaMixVariants = ref([])
  const selectedVariant = ref(null)
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const isOptimizing = ref(false)
  const lastError = ref(null)

  // Getters
  const getAllMediaMixes = computed(() => mediaMixes.value)

  const getCurrentMediaMix = computed(() => currentMediaMix.value)

  const getMediaMixItems = computed(() => mediaMixItems.value)

  const getMediaMixVariants = computed(() => mediaMixVariants.value)

  const getSelectedVariant = computed(() => selectedVariant.value)

  const getTotalBudget = computed(() => {
    return mediaMixItems.value.reduce((sum, item) => sum + (item.budget_allocation || 0), 0)
  })

  const getTotalConversions = computed(() => {
    return mediaMixItems.value.reduce((sum, item) => sum + (item.expected_conversions || 0), 0)
  })

  const getAverageRoi = computed(() => {
    if (mediaMixItems.value.length === 0) return 0
    const totalRoi = mediaMixItems.value.reduce((sum, item) => sum + (item.expected_roi || 0), 0)
    return Math.round(totalRoi / mediaMixItems.value.length)
  })

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setGenerating = (generating) => {
    isGenerating.value = generating
  }

  const setOptimizing = (optimizing) => {
    isOptimizing.value = optimizing
  }

  const setError = (error) => {
    lastError.value = error
  }

  const clearError = () => {
    lastError.value = null
  }

  // Load all media mixes
  const loadMediaMixes = async () => {
    try {
      setLoading(true)
      clearError()
      const data = await mediaMixAPI.getMediaMixes()
      mediaMixes.value = data
      return data
    } catch (error) {
      console.error('Error loading media mixes:', error)
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Load specific media mix
  const loadMediaMix = async (mixId) => {
    try {
      setLoading(true)
      clearError()
      const mix = await mediaMixAPI.getMediaMix(mixId)
      currentMediaMix.value = mix

      // Load associated items
      const items = await mediaMixAPI.getMediaMixItems(mixId)
      mediaMixItems.value = items

      return mix
    } catch (error) {
      console.error('Error loading media mix:', error)
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Generate new media mix
  const generateMediaMix = async (campaignData) => {
    try {
      setGenerating(true)
      clearError()

      const newMix = await mediaMixAPI.generateMediaMix(campaignData)
      currentMediaMix.value = newMix

      // Generate initial media mix items
      const items = await mediaMixAPI.generateMediaMixItems(newMix.mix_id, campaignData)
      mediaMixItems.value = items

      // Add to variants
      const variant = {
        variant_id: `variant_${Date.now()}`,
        name: 'Основной медиа-микс',
        status: 'active',
        total_budget: getTotalBudget.value,
        total_reach: items.reduce((sum, item) => sum + (item.expected_conversions || 0), 0),
        source: 'generated_llm'
      }

      mediaMixVariants.value.push(variant)
      selectedVariant.value = variant

      return newMix
    } catch (error) {
      console.error('Error generating media mix:', error)
      setError(error)
      throw error
    } finally {
      setGenerating(false)
    }
  }

  // Optimize media mix
  const optimizeMediaMix = async (optimizationParams) => {
    try {
      setOptimizing(true)
      clearError()

      const optimizedItems = await mediaMixAPI.optimizeMediaMix(currentMediaMix.value.mix_id, optimizationParams)
      mediaMixItems.value = optimizedItems

      // Create optimized variant
      const variant = {
        variant_id: `variant_${Date.now()}`,
        name: 'Оптимизированный медиа-микс',
        status: 'active',
        total_budget: getTotalBudget.value,
        total_reach: optimizedItems.reduce((sum, item) => sum + (item.expected_conversions || 0), 0),
        source: 'optimized_llm'
      }

      mediaMixVariants.value.push(variant)
      selectedVariant.value = variant

      return optimizedItems
    } catch (error) {
      console.error('Error optimizing media mix:', error)
      setError(error)
      throw error
    } finally {
      setOptimizing(false)
    }
  }

  // Update media mix items
  const updateMediaMixItems = (items) => {
    mediaMixItems.value = items
  }

  // Create new variant
  const createVariant = async (name, items) => {
    try {
      const variant = {
        variant_id: `variant_${Date.now()}`,
        name: name,
        status: 'active',
        total_budget: items.reduce((sum, item) => sum + (item.budget_allocation || 0), 0),
        total_reach: items.reduce((sum, item) => sum + (item.expected_conversions || 0), 0),
        source: 'manual'
      }

      mediaMixVariants.value.push(variant)
      return variant
    } catch (error) {
      console.error('Error creating variant:', error)
      setError(error)
      throw error
    }
  }

  // Select variant
  const selectVariant = (variant) => {
    selectedVariant.value = variant
  }

  // Delete variant
  const deleteVariant = (variantId) => {
    const index = mediaMixVariants.value.findIndex(v => v.variant_id === variantId)
    if (index > -1) {
      mediaMixVariants.value.splice(index, 1)

      // If deleted variant was selected, select first available
      if (selectedVariant.value?.variant_id === variantId) {
        selectedVariant.value = mediaMixVariants.value[0] || null
      }
    }
  }

  // Clear current data
  const clearCurrentData = () => {
    currentMediaMix.value = null
    mediaMixItems.value = []
    mediaMixVariants.value = []
    selectedVariant.value = null
    clearError()
  }

  // Initialize with demo data for development
  const initializeWithDemoData = () => {
    mediaMixVariants.value = [
      {
        variant_id: 'demo_variant_1',
        name: 'Основной медиа-микс',
        status: 'active',
        total_budget: 8000000,
        total_reach: 8667,
        source: 'generated_llm'
      }
    ]

    selectedVariant.value = mediaMixVariants.value[0]

    mediaMixItems.value = [
      {
        channel: 'Instagram',
        budget_allocation: 3000000,
        budget_share: 37.5,
        expected_cpa: 1200,
        expected_conversions: 2500,
        expected_roi: 350
      },
      {
        channel: 'VKontakte',
        budget_allocation: 2000000,
        budget_share: 25.0,
        expected_cpa: 800,
        expected_conversions: 2500,
        expected_roi: 400
      },
      {
        channel: 'YouTube',
        budget_allocation: 2000000,
        budget_share: 25.0,
        expected_cpa: 1000,
        expected_conversions: 2000,
        expected_roi: 300
      },
      {
        channel: 'Google Ads',
        budget_allocation: 1000000,
        budget_share: 12.5,
        expected_cpa: 1500,
        expected_conversions: 667,
        expected_roi: 250
      }
    ]
  }

  return {
    // State
    mediaMixes,
    currentMediaMix,
    mediaMixItems,
    mediaMixVariants,
    selectedVariant,
    isLoading,
    isGenerating,
    isOptimizing,
    lastError,

    // Getters
    getAllMediaMixes,
    getCurrentMediaMix,
    getMediaMixItems,
    getMediaMixVariants,
    getSelectedVariant,
    getTotalBudget,
    getTotalConversions,
    getAverageRoi,

    // Actions
    setLoading,
    setGenerating,
    setOptimizing,
    setError,
    clearError,
    loadMediaMixes,
    loadMediaMix,
    generateMediaMix,
    optimizeMediaMix,
    updateMediaMixItems,
    createVariant,
    selectVariant,
    deleteVariant,
    clearCurrentData,
    initializeWithDemoData
  }
})