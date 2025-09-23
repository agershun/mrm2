import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as mediaPlanAPI from '@/api/modules/mediaplan'

export const useMediaPlanStore = defineStore('mediaPlan', () => {
  // State
  const mediaPlans = ref([])
  const currentMediaPlan = ref(null)
  const mediaPlanItems = ref([])
  const mediaPlanVariants = ref([])
  const selectedVariant = ref(null)
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const lastError = ref(null)

  // Getters
  const getAllMediaPlans = computed(() => mediaPlans.value)

  const getCurrentMediaPlan = computed(() => currentMediaPlan.value)

  const getMediaPlanItems = computed(() => mediaPlanItems.value)

  const getMediaPlanVariants = computed(() => mediaPlanVariants.value)

  const getSelectedVariant = computed(() => selectedVariant.value)

  const getTotalBudget = computed(() => {
    return mediaPlanItems.value.reduce((sum, item) => sum + (item.budget || 0), 0)
  })

  const getTotalImpressions = computed(() => {
    return mediaPlanItems.value.reduce((sum, item) => sum + (item.impressions || 0), 0)
  })

  const getTotalClicks = computed(() => {
    return mediaPlanItems.value.reduce((sum, item) => sum + (item.clicks || 0), 0)
  })

  const getAverageCtr = computed(() => {
    if (getTotalImpressions.value === 0) return 0
    return ((getTotalClicks.value / getTotalImpressions.value) * 100).toFixed(2)
  })

  const getAverageCpm = computed(() => {
    if (getTotalImpressions.value === 0) return 0
    return Math.round((getTotalBudget.value / getTotalImpressions.value) * 1000)
  })

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setGenerating = (generating) => {
    isGenerating.value = generating
  }

  const setError = (error) => {
    lastError.value = error
  }

  const clearError = () => {
    lastError.value = null
  }

  // Load all media plans
  const loadMediaPlans = async () => {
    try {
      setLoading(true)
      clearError()
      const data = await mediaPlanAPI.getMediaPlans()
      mediaPlans.value = data
      return data
    } catch (error) {
      console.error('Error loading media plans:', error)
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Load specific media plan
  const loadMediaPlan = async (planId) => {
    try {
      setLoading(true)
      clearError()
      const plan = await mediaPlanAPI.getMediaPlan(planId)
      currentMediaPlan.value = plan

      // Load associated items
      const items = await mediaPlanAPI.getMediaPlanItems(planId)
      mediaPlanItems.value = items

      return plan
    } catch (error) {
      console.error('Error loading media plan:', error)
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Generate new media plan
  const generateMediaPlan = async (campaignData) => {
    try {
      setGenerating(true)
      clearError()

      const newPlan = await mediaPlanAPI.generateMediaPlan(campaignData)
      currentMediaPlan.value = newPlan

      // Generate initial media plan items
      const items = await mediaPlanAPI.generateMediaPlanItems(newPlan.plan_id, campaignData)
      mediaPlanItems.value = items

      return newPlan
    } catch (error) {
      console.error('Error generating media plan:', error)
      setError(error)
      throw error
    } finally {
      setGenerating(false)
    }
  }

  // Update media plan items
  const updateMediaPlanItems = (items) => {
    mediaPlanItems.value = items
  }

  // Clear current data
  const clearCurrentData = () => {
    currentMediaPlan.value = null
    mediaPlanItems.value = []
    mediaPlanVariants.value = []
    selectedVariant.value = null
    clearError()
  }

  // Add variant management
  const createVariant = async (name, planData) => {
    try {
      const variant = {
        plan_variant_id: `plan_variant_${Date.now()}`,
        name: name,
        status: 'draft',
        total_budget: planData?.total_budget || 0,
        start_date: planData?.start_date || '2025-01-01',
        end_date: planData?.end_date || '2025-03-31',
        source: 'manual'
      }

      mediaPlanVariants.value.push(variant)
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
    currentMediaPlan.value = variant
  }

  // Delete variant
  const deleteVariant = (variantId) => {
    const index = mediaPlanVariants.value.findIndex(v => v.plan_variant_id === variantId)
    if (index > -1) {
      mediaPlanVariants.value.splice(index, 1)

      // If deleted variant was selected, select first available
      if (currentMediaPlan.value?.plan_variant_id === variantId) {
        currentMediaPlan.value = mediaPlanVariants.value[0] || null
        selectedVariant.value = mediaPlanVariants.value[0] || null
      }
    }
  }

  // Initialize with demo data for development
  const initializeWithDemoData = () => {
    // Create demo variants
    mediaPlanVariants.value = [
      {
        plan_variant_id: 'demo_plan_1',
        name: 'Медиаплан Q1 2025',
        status: 'draft',
        total_budget: 8000000,
        start_date: '2025-01-01',
        end_date: '2025-03-31',
        source: 'generated_llm'
      },
      {
        plan_variant_id: 'demo_plan_2',
        name: 'Альтернативный план',
        status: 'draft',
        total_budget: 7500000,
        start_date: '2025-01-15',
        end_date: '2025-03-15',
        source: 'manual'
      }
    ]

    // Set current plan to first variant
    currentMediaPlan.value = mediaPlanVariants.value[0]
    selectedVariant.value = mediaPlanVariants.value[0]

    mediaPlanItems.value = [
      {
        placement_id: 'placement_1',
        channel: 'Instagram',
        placement_type: 'Stories',
        start_date: '2025-01-01',
        end_date: '2025-03-31',
        budget: 3500000,
        impressions: 1400000,
        clicks: 21000,
        ctr: 1.5,
        cpm: 2500
      },
      {
        placement_id: 'placement_2',
        channel: 'YouTube',
        placement_type: 'In-Stream',
        start_date: '2025-01-15',
        end_date: '2025-03-15',
        budget: 3000000,
        impressions: 600000,
        clicks: 12000,
        ctr: 2.0,
        cpm: 5000
      },
      {
        placement_id: 'placement_3',
        channel: 'Google Ads',
        placement_type: 'Search',
        start_date: '2025-02-01',
        end_date: '2025-02-28',
        budget: 1500000,
        impressions: 150000,
        clicks: 7500,
        ctr: 5.0,
        cpm: 10000
      }
    ]
  }

  return {
    // State
    mediaPlans,
    currentMediaPlan,
    mediaPlanItems,
    mediaPlanVariants,
    selectedVariant,
    isLoading,
    isGenerating,
    lastError,

    // Getters
    getAllMediaPlans,
    getCurrentMediaPlan,
    getMediaPlanItems,
    getMediaPlanVariants,
    getSelectedVariant,
    getTotalBudget,
    getTotalImpressions,
    getTotalClicks,
    getAverageCtr,
    getAverageCpm,

    // Actions
    setLoading,
    setGenerating,
    setError,
    clearError,
    loadMediaPlans,
    loadMediaPlan,
    generateMediaPlan,
    updateMediaPlanItems,
    clearCurrentData,
    createVariant,
    selectVariant,
    deleteVariant,
    initializeWithDemoData
  }
})