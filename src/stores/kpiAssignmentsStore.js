import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { kpiAssignmentsApi } from '@/api/modules/kpiAssignments'

export const useKpiAssignmentsStore = defineStore('kpiAssignments', () => {
  // State
  const assignments = ref([])
  const currentAssignment = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const dashboard = ref({})
  const alerts = ref([])
  const stats = ref({})
  const assignmentTypes = ref([])
  const assignedToTypes = ref([])

  // Getters
  const activeAssignments = computed(() =>
    assignments.value.filter(assignment => assignment.is_active)
  )

  const assignmentsByKpi = computed(() => {
    const grouped = {}
    assignments.value.forEach(assignment => {
      if (!grouped[assignment.kpi_id]) {
        grouped[assignment.kpi_id] = []
      }
      grouped[assignment.kpi_id].push(assignment)
    })
    return grouped
  })

  const assignmentsByEntity = computed(() => {
    const grouped = {}
    assignments.value.forEach(assignment => {
      const key = `${assignment.assigned_to_type}:${assignment.assigned_to_id}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(assignment)
    })
    return grouped
  })

  const assignmentsByResponsible = computed(() => {
    const grouped = {}
    assignments.value.forEach(assignment => {
      if (!grouped[assignment.responsible_user_id]) {
        grouped[assignment.responsible_user_id] = []
      }
      grouped[assignment.responsible_user_id].push(assignment)
    })
    return grouped
  })

  const assignmentsByType = computed(() => {
    const grouped = {}
    assignments.value.forEach(assignment => {
      if (!grouped[assignment.assignment_type]) {
        grouped[assignment.assignment_type] = []
      }
      grouped[assignment.assignment_type].push(assignment)
    })
    return grouped
  })

  const currentPeriodAssignments = computed(() => {
    const now = new Date()
    return activeAssignments.value.filter(assignment => {
      const start = new Date(assignment.period_start)
      const end = new Date(assignment.period_end)
      return start <= now && now <= end
    })
  })

  const onTargetAssignments = computed(() => {
    return currentPeriodAssignments.value.filter(assignment => {
      if (!assignment.target_value || assignment.target_value <= 0) return false
      return assignment.current_value >= assignment.target_value
    })
  })

  const belowTargetAssignments = computed(() => {
    return currentPeriodAssignments.value.filter(assignment => {
      if (!assignment.target_value || assignment.target_value <= 0) return false
      return assignment.current_value < assignment.target_value
    })
  })

  const criticalAssignments = computed(() => {
    return currentPeriodAssignments.value.filter(assignment => {
      if (!assignment.target_value || assignment.target_value <= 0) return false
      const achievementRate = assignment.current_value / assignment.target_value
      return achievementRate < assignment.alert_threshold
    })
  })

  const getAssignmentById = computed(() => {
    return (assignmentId) => assignments.value.find(a => a.assignment_id === assignmentId)
  })

  const getAssignmentsForEntity = computed(() => {
    return (entityType, entityId) => {
      const key = `${entityType}:${entityId}`
      return assignmentsByEntity.value[key] || []
    }
  })

  const getAssignmentsForUser = computed(() => {
    return (userId) => assignmentsByResponsible.value[userId] || []
  })

  // Actions
  const fetchAssignments = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.getKpiAssignments(filters)
      assignments.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAssignment = async (assignmentId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.getKpiAssignment(assignmentId)
      currentAssignment.value = response.data

      // Обновить назначение в списке, если оно уже загружено
      const index = assignments.value.findIndex(a => a.assignment_id === assignmentId)
      if (index !== -1) {
        assignments.value[index] = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAssignment = async (assignmentData) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.createKpiAssignment(assignmentData)
      assignments.value.push(response.data)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAssignment = async (assignmentId, updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.updateKpiAssignment(assignmentId, updates)

      // Обновить назначение в списке
      const index = assignments.value.findIndex(a => a.assignment_id === assignmentId)
      if (index !== -1) {
        assignments.value[index] = response.data
      }

      // Обновить текущее назначение, если это оно
      if (currentAssignment.value?.assignment_id === assignmentId) {
        currentAssignment.value = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAssignment = async (assignmentId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.deleteKpiAssignment(assignmentId)

      // Удалить назначение из списка
      const index = assignments.value.findIndex(a => a.assignment_id === assignmentId)
      if (index !== -1) {
        assignments.value.splice(index, 1)
      }

      // Очистить текущее назначение, если это оно
      if (currentAssignment.value?.assignment_id === assignmentId) {
        currentAssignment.value = null
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAssignmentsByEntity = async (entityType, entityId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.getAssignmentsByEntity(entityType, entityId)

      // Обновить назначения в основном списке
      response.data.forEach(assignment => {
        const index = assignments.value.findIndex(a => a.assignment_id === assignment.assignment_id)
        if (index === -1) {
          assignments.value.push(assignment)
        } else {
          assignments.value[index] = assignment
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

  const fetchAssignmentsByResponsible = async (userId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.getAssignmentsByResponsible(userId)

      // Обновить назначения в основном списке
      response.data.forEach(assignment => {
        const index = assignments.value.findIndex(a => a.assignment_id === assignment.assignment_id)
        if (index === -1) {
          assignments.value.push(assignment)
        } else {
          assignments.value[index] = assignment
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

  const fetchAssignmentsByKpi = async (kpiId) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.getAssignmentsByKpi(kpiId)

      // Обновить назначения в основном списке
      response.data.forEach(assignment => {
        const index = assignments.value.findIndex(a => a.assignment_id === assignment.assignment_id)
        if (index === -1) {
          assignments.value.push(assignment)
        } else {
          assignments.value[index] = assignment
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

  const fetchPerformanceDashboard = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.getPerformanceDashboard(filters)
      dashboard.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAlerts = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.getKpiAlerts(filters)
      alerts.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const bulkUpdateAssignments = async (updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.bulkUpdateAssignments(updates)

      // Обновить успешно обновленные назначения в списке
      response.data.forEach(result => {
        if (result.success) {
          const index = assignments.value.findIndex(a => a.assignment_id === result.assignment_id)
          if (index !== -1) {
            assignments.value[index] = result.data
          }
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

  const fetchStats = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.getKpiAssignmentStats()
      stats.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAssignmentTypes = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.getAssignmentTypes()
      assignmentTypes.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAssignedToTypes = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await kpiAssignmentsApi.getAssignedToTypes()
      assignedToTypes.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  const getAssignmentAchievementRate = (assignment) => {
    if (!assignment.target_value || assignment.target_value <= 0) return null
    return assignment.current_value / assignment.target_value
  }

  const getAssignmentStatus = (assignment) => {
    const achievementRate = getAssignmentAchievementRate(assignment)
    if (!achievementRate) return 'no-target'

    if (achievementRate >= 1) return 'on-target'
    if (achievementRate >= assignment.alert_threshold) return 'warning'
    return 'critical'
  }

  const getDaysToDeadline = (assignment) => {
    const endDate = new Date(assignment.period_end)
    const now = new Date()
    const timeDiff = endDate.getTime() - now.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  const isOverdue = (assignment) => {
    return getDaysToDeadline(assignment) < 0
  }

  const isNearDeadline = (assignment, daysBefore = 7) => {
    const daysLeft = getDaysToDeadline(assignment)
    return daysLeft >= 0 && daysLeft <= daysBefore
  }

  const getEntityPerformanceSummary = (entityType, entityId) => {
    const entityAssignments = getAssignmentsForEntity.value(entityType, entityId)

    if (entityAssignments.length === 0) {
      return {
        total_assignments: 0,
        on_target: 0,
        warning: 0,
        critical: 0,
        avg_achievement: 0
      }
    }

    let onTarget = 0
    let warning = 0
    let critical = 0
    let totalAchievement = 0
    let achievementCount = 0

    entityAssignments.forEach(assignment => {
      const status = getAssignmentStatus(assignment)
      if (status === 'on-target') onTarget++
      else if (status === 'warning') warning++
      else if (status === 'critical') critical++

      const achievement = getAssignmentAchievementRate(assignment)
      if (achievement) {
        totalAchievement += achievement
        achievementCount++
      }
    })

    return {
      total_assignments: entityAssignments.length,
      on_target: onTarget,
      warning: warning,
      critical: critical,
      avg_achievement: achievementCount > 0 ? totalAchievement / achievementCount : 0
    }
  }

  const getUserPerformanceSummary = (userId) => {
    const userAssignments = getAssignmentsForUser.value(userId)

    if (userAssignments.length === 0) {
      return {
        total_assignments: 0,
        on_target: 0,
        warning: 0,
        critical: 0,
        overdue: 0,
        near_deadline: 0,
        avg_achievement: 0
      }
    }

    let onTarget = 0
    let warning = 0
    let critical = 0
    let overdue = 0
    let nearDeadline = 0
    let totalAchievement = 0
    let achievementCount = 0

    userAssignments.forEach(assignment => {
      const status = getAssignmentStatus(assignment)
      if (status === 'on-target') onTarget++
      else if (status === 'warning') warning++
      else if (status === 'critical') critical++

      if (isOverdue(assignment)) overdue++
      else if (isNearDeadline(assignment)) nearDeadline++

      const achievement = getAssignmentAchievementRate(assignment)
      if (achievement) {
        totalAchievement += achievement
        achievementCount++
      }
    })

    return {
      total_assignments: userAssignments.length,
      on_target: onTarget,
      warning: warning,
      critical: critical,
      overdue: overdue,
      near_deadline: nearDeadline,
      avg_achievement: achievementCount > 0 ? totalAchievement / achievementCount : 0
    }
  }

  // Utilities
  const clearError = () => {
    error.value = null
  }

  const setCurrentAssignment = (assignment) => {
    currentAssignment.value = assignment
  }

  const clearCurrentAssignment = () => {
    currentAssignment.value = null
  }

  const clearAlerts = () => {
    alerts.value = []
  }

  const reset = () => {
    assignments.value = []
    currentAssignment.value = null
    loading.value = false
    error.value = null
    dashboard.value = {}
    alerts.value = []
    stats.value = {}
    assignmentTypes.value = []
    assignedToTypes.value = []
  }

  return {
    // State
    assignments,
    currentAssignment,
    loading,
    error,
    dashboard,
    alerts,
    stats,
    assignmentTypes,
    assignedToTypes,

    // Getters
    activeAssignments,
    assignmentsByKpi,
    assignmentsByEntity,
    assignmentsByResponsible,
    assignmentsByType,
    currentPeriodAssignments,
    onTargetAssignments,
    belowTargetAssignments,
    criticalAssignments,
    getAssignmentById,
    getAssignmentsForEntity,
    getAssignmentsForUser,

    // Actions
    fetchAssignments,
    fetchAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    fetchAssignmentsByEntity,
    fetchAssignmentsByResponsible,
    fetchAssignmentsByKpi,
    fetchPerformanceDashboard,
    fetchAlerts,
    bulkUpdateAssignments,
    fetchStats,
    fetchAssignmentTypes,
    fetchAssignedToTypes,

    // Utility functions
    getAssignmentAchievementRate,
    getAssignmentStatus,
    getDaysToDeadline,
    isOverdue,
    isNearDeadline,
    getEntityPerformanceSummary,
    getUserPerformanceSummary,

    // Utilities
    clearError,
    setCurrentAssignment,
    clearCurrentAssignment,
    clearAlerts,
    reset
  }
})