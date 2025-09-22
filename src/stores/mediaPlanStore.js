/**
 * Pinia store для управления медиа-планами
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as mediaPlanAPI from '@/api/modules/mediaPlans'

export const useMediaPlanStore = defineStore('mediaPlan', () => {
  // State
  const mediaPlans = ref([])
  const mediaPlanTemplates = ref([])
  const flightSchedules = ref([])
  const planExecutions = ref([])
  const currentExecution = ref(null)
  const validationResults = ref(null)

  const loading = ref(false)
  const error = ref(null)

  // Getters
  const mediaPlansByCampaign = computed(() => {
    const grouped = {}
    mediaPlans.value.forEach(plan => {
      const campaignId = plan.campaign_id
      if (!grouped[campaignId]) {
        grouped[campaignId] = []
      }
      grouped[campaignId].push(plan)
    })
    return grouped
  })

  const mediaPlansByStatus = computed(() => {
    const grouped = {}
    mediaPlans.value.forEach(plan => {
      const status = plan.status
      if (!grouped[status]) {
        grouped[status] = []
      }
      grouped[status].push(plan)
    })
    return grouped
  })

  const activePlans = computed(() => {
    return mediaPlans.value.filter(plan => plan.status === 'active')
  })

  const draftPlans = computed(() => {
    return mediaPlans.value.filter(plan => plan.status === 'draft')
  })

  const templatesByType = computed(() => {
    const grouped = {}
    mediaPlanTemplates.value.forEach(template => {
      const type = template.plan_type
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(template)
    })
    return grouped
  })

  const upcomingFlights = computed(() => {
    const now = new Date()
    const upcoming = []

    flightSchedules.value.forEach(schedule => {
      schedule.weekly_schedule.forEach(week => {
        const startDate = new Date(week.start_date)
        if (startDate > now) {
          upcoming.push({
            ...week,
            flight_name: schedule.flight_name,
            plan_id: schedule.plan_id
          })
        }
      })
    })

    return upcoming.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
  })

  const totalBudgetByPlan = computed(() => {
    const totals = {}
    mediaPlans.value.forEach(plan => {
      totals[plan.plan_id] = plan.total_budget
    })
    return totals
  })

  const flightsByPlan = computed(() => {
    const grouped = {}
    mediaPlans.value.forEach(plan => {
      grouped[plan.plan_id] = plan.flights || []
    })
    return grouped
  })

  // Actions - Media Plans
  const loadMediaPlans = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await mediaPlanAPI.getMediaPlans(filters)
      mediaPlans.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadMediaPlanById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const plan = await mediaPlanAPI.getMediaPlanById(id)

      const index = mediaPlans.value.findIndex(p => p.plan_id === id)
      if (index !== -1) {
        mediaPlans.value[index] = plan
      } else {
        mediaPlans.value.push(plan)
      }

      return plan
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMediaPlan = async (planData) => {
    loading.value = true
    error.value = null

    try {
      const newPlan = await mediaPlanAPI.createMediaPlan(planData)
      mediaPlans.value.push(newPlan)
      return newPlan
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMediaPlan = async (id, updates) => {
    loading.value = true
    error.value = null

    try {
      const updatedPlan = await mediaPlanAPI.updateMediaPlan(id, updates)

      const index = mediaPlans.value.findIndex(p => p.plan_id === id)
      if (index !== -1) {
        mediaPlans.value[index] = updatedPlan
      }

      return updatedPlan
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMediaPlan = async (id) => {
    loading.value = true
    error.value = null

    try {
      await mediaPlanAPI.deleteMediaPlan(id)
      const index = mediaPlans.value.findIndex(p => p.plan_id === id)
      if (index !== -1) {
        mediaPlans.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const duplicateMediaPlan = async (planId, newParams = {}) => {
    loading.value = true
    error.value = null

    try {
      const duplicatedPlan = await mediaPlanAPI.duplicatePlan(planId, newParams)
      mediaPlans.value.push(duplicatedPlan)
      return duplicatedPlan
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Templates
  const loadMediaPlanTemplates = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await mediaPlanAPI.getMediaPlanTemplates(filters)
      mediaPlanTemplates.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Plan Generation
  const generateMediaPlan = async (mixId, planParams) => {
    loading.value = true
    error.value = null

    try {
      const generatedPlan = await mediaPlanAPI.generateMediaPlan(mixId, planParams)
      mediaPlans.value.push(generatedPlan)
      return generatedPlan
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Flight Schedules
  const loadFlightSchedules = async (planId) => {
    loading.value = true
    error.value = null

    try {
      const response = await mediaPlanAPI.getFlightSchedules(planId)

      // Заменяем или добавляем расписания для данного плана
      flightSchedules.value = flightSchedules.value.filter(s => s.plan_id !== planId)
      flightSchedules.value.push(...response.data)

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFlightSchedule = async (flightId, scheduleData) => {
    loading.value = true
    error.value = null

    try {
      const updatedSchedule = await mediaPlanAPI.updateFlightSchedule(flightId, scheduleData)

      const index = flightSchedules.value.findIndex(s => s.flight_id === flightId)
      if (index !== -1) {
        flightSchedules.value[index] = updatedSchedule
      }

      return updatedSchedule
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Plan Execution
  const executePlan = async (planId, executionParams = {}) => {
    loading.value = true
    error.value = null

    try {
      const execution = await mediaPlanAPI.executePlan(planId, executionParams)
      currentExecution.value = execution
      planExecutions.value.push(execution)
      return execution
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadPlanExecution = async (planId) => {
    loading.value = true
    error.value = null

    try {
      const execution = await mediaPlanAPI.getPlanExecution(planId)
      if (execution) {
        currentExecution.value = execution

        const index = planExecutions.value.findIndex(e => e.plan_id === planId)
        if (index !== -1) {
          planExecutions.value[index] = execution
        } else {
          planExecutions.value.push(execution)
        }
      }
      return execution
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Validation
  const validatePlan = async (planData) => {
    loading.value = true
    error.value = null

    try {
      const validation = await mediaPlanAPI.validatePlan(planData)
      validationResults.value = validation
      return validation
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  const getMediaPlansByCampaign = (campaignId) => {
    return mediaPlans.value.filter(plan => plan.campaign_id === campaignId)
  }

  const getPlanById = (planId) => {
    return mediaPlans.value.find(plan => plan.plan_id === planId)
  }

  const getFlightsByPlan = (planId) => {
    const plan = getPlanById(planId)
    return plan ? plan.flights : []
  }

  const getPlanExecution = (planId) => {
    return planExecutions.value.find(exec => exec.plan_id === planId)
  }

  const getFlightSchedule = (planId, flightId) => {
    const schedule = flightSchedules.value.find(s =>
      s.plan_id === planId && s.flight_id === flightId
    )
    return schedule
  }

  const getTotalBudgetUtilization = (planId) => {
    const plan = getPlanById(planId)
    if (!plan) return 0

    const totalFlightsBudget = plan.flights.reduce((sum, flight) => sum + flight.budget, 0)
    return (totalFlightsBudget / plan.total_budget) * 100
  }

  const getPlansByDateRange = (startDate, endDate) => {
    return mediaPlans.value.filter(plan => {
      const planStart = new Date(plan.plan_period.start_date)
      const planEnd = new Date(plan.plan_period.end_date)
      const filterStart = new Date(startDate)
      const filterEnd = new Date(endDate)

      return planStart <= filterEnd && planEnd >= filterStart
    })
  }

  const clearError = () => {
    error.value = null
  }

  const clearValidation = () => {
    validationResults.value = null
  }

  const clearExecution = () => {
    currentExecution.value = null
  }

  return {
    // State
    mediaPlans,
    mediaPlanTemplates,
    flightSchedules,
    planExecutions,
    currentExecution,
    validationResults,
    loading,
    error,

    // Getters
    mediaPlansByCampaign,
    mediaPlansByStatus,
    activePlans,
    draftPlans,
    templatesByType,
    upcomingFlights,
    totalBudgetByPlan,
    flightsByPlan,

    // Actions
    loadMediaPlans,
    loadMediaPlanById,
    createMediaPlan,
    updateMediaPlan,
    deleteMediaPlan,
    duplicateMediaPlan,
    loadMediaPlanTemplates,
    generateMediaPlan,
    loadFlightSchedules,
    updateFlightSchedule,
    executePlan,
    loadPlanExecution,
    validatePlan,

    // Utilities
    getMediaPlansByCampaign,
    getPlanById,
    getFlightsByPlan,
    getPlanExecution,
    getFlightSchedule,
    getTotalBudgetUtilization,
    getPlansByDateRange,
    clearError,
    clearValidation,
    clearExecution
  }
})