import kpiAssignmentsData from '../mocks/kpiAssignments.mock.json'

// Имитация задержки сети
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

export const kpiAssignmentsApi = {
  // Получить все назначения KPI
  async getKpiAssignments(filters = {}) {
    await delay()
    let filtered = [...kpiAssignmentsData]

    // Фильтрация по KPI
    if (filters.kpi_id) {
      filtered = filtered.filter(assignment => assignment.kpi_id === filters.kpi_id)
    }

    // Фильтрация по типу объекта назначения
    if (filters.assigned_to_type) {
      filtered = filtered.filter(assignment => assignment.assigned_to_type === filters.assigned_to_type)
    }

    // Фильтрация по объекту назначения
    if (filters.assigned_to_id) {
      filtered = filtered.filter(assignment => assignment.assigned_to_id === filters.assigned_to_id)
    }

    // Фильтрация по типу назначения
    if (filters.assignment_type) {
      filtered = filtered.filter(assignment => assignment.assignment_type === filters.assignment_type)
    }

    // Фильтрация по ответственному
    if (filters.responsible_user_id) {
      filtered = filtered.filter(assignment => assignment.responsible_user_id === filters.responsible_user_id)
    }

    // Фильтрация только активных
    if (filters.active_only) {
      filtered = filtered.filter(assignment => assignment.is_active)
    }

    // Фильтрация по периоду
    if (filters.period_start || filters.period_end) {
      filtered = filtered.filter(assignment => {
        const assignmentStart = new Date(assignment.period_start)
        const assignmentEnd = new Date(assignment.period_end)
        const filterStart = filters.period_start ? new Date(filters.period_start) : null
        const filterEnd = filters.period_end ? new Date(filters.period_end) : null

        if (filterStart && assignmentEnd < filterStart) return false
        if (filterEnd && assignmentStart > filterEnd) return false
        return true
      })
    }

    return {
      data: filtered,
      total: filtered.length,
      page: filters.page || 1,
      limit: filters.limit || 50
    }
  },

  // Получить назначение по ID
  async getKpiAssignment(assignmentId) {
    await delay()
    const assignment = kpiAssignmentsData.find(a => a.assignment_id === assignmentId)
    if (!assignment) {
      throw new Error(`Назначение KPI с ID ${assignmentId} не найдено`)
    }
    return { data: assignment }
  },

  // Создать новое назначение KPI
  async createKpiAssignment(assignmentData) {
    await delay()
    const newAssignment = {
      assignment_id: `assign_${Date.now()}`,
      ...assignmentData,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Creating KPI assignment:', newAssignment)
    return { data: newAssignment }
  },

  // Обновить назначение KPI
  async updateKpiAssignment(assignmentId, updates) {
    await delay()
    const assignmentIndex = kpiAssignmentsData.findIndex(a => a.assignment_id === assignmentId)
    if (assignmentIndex === -1) {
      throw new Error(`Назначение KPI с ID ${assignmentId} не найдено`)
    }

    const updatedAssignment = {
      ...kpiAssignmentsData[assignmentIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    console.log('Updating KPI assignment:', updatedAssignment)
    return { data: updatedAssignment }
  },

  // Удалить назначение KPI
  async deleteKpiAssignment(assignmentId) {
    await delay()
    const assignmentIndex = kpiAssignmentsData.findIndex(a => a.assignment_id === assignmentId)
    if (assignmentIndex === -1) {
      throw new Error(`Назначение KPI с ID ${assignmentId} не найдено`)
    }

    console.log('Deleting KPI assignment:', assignmentId)
    return { success: true }
  },

  // Получить назначения по объекту
  async getAssignmentsByEntity(entityType, entityId) {
    await delay()
    const assignments = kpiAssignmentsData.filter(a =>
      a.assigned_to_type === entityType && a.assigned_to_id === entityId && a.is_active
    )
    return { data: assignments }
  },

  // Получить назначения по ответственному
  async getAssignmentsByResponsible(userId) {
    await delay()
    const assignments = kpiAssignmentsData.filter(a =>
      a.responsible_user_id === userId && a.is_active
    )
    return { data: assignments }
  },

  // Получить назначения по KPI
  async getAssignmentsByKpi(kpiId) {
    await delay()
    const assignments = kpiAssignmentsData.filter(a => a.kpi_id === kpiId && a.is_active)
    return { data: assignments }
  },

  // Получить дашборд производительности
  async getPerformanceDashboard(filters = {}) {
    await delay()
    let assignments = [...kpiAssignmentsData].filter(a => a.is_active)

    // Применение фильтров
    if (filters.assigned_to_type) {
      assignments = assignments.filter(a => a.assigned_to_type === filters.assigned_to_type)
    }
    if (filters.assigned_to_id) {
      assignments = assignments.filter(a => a.assigned_to_id === filters.assigned_to_id)
    }
    if (filters.responsible_user_id) {
      assignments = assignments.filter(a => a.responsible_user_id === filters.responsible_user_id)
    }

    const dashboard = {
      total_assignments: assignments.length,
      on_target: 0,
      below_target: 0,
      above_target: 0,
      avg_achievement: 0,
      assignments_by_type: {},
      performance_details: []
    }

    let totalAchievement = 0

    assignments.forEach(assignment => {
      const achievement = assignment.target_value && assignment.target_value > 0
        ? assignment.current_value / assignment.target_value
        : 1

      if (achievement >= 1) {
        dashboard.on_target++
      } else if (achievement >= assignment.alert_threshold) {
        dashboard.below_target++
      } else {
        dashboard.below_target++
      }

      if (achievement > 1) {
        dashboard.above_target++
      }

      totalAchievement += achievement

      // Группировка по типу назначения
      if (!dashboard.assignments_by_type[assignment.assignment_type]) {
        dashboard.assignments_by_type[assignment.assignment_type] = {
          count: 0,
          avg_achievement: 0,
          total_achievement: 0
        }
      }

      const typeGroup = dashboard.assignments_by_type[assignment.assignment_type]
      typeGroup.count++
      typeGroup.total_achievement += achievement

      dashboard.performance_details.push({
        assignment_id: assignment.assignment_id,
        kpi_id: assignment.kpi_id,
        assigned_to_type: assignment.assigned_to_type,
        assigned_to_id: assignment.assigned_to_id,
        current_value: assignment.current_value,
        target_value: assignment.target_value,
        achievement_rate: achievement,
        status: achievement >= 1 ? 'on_target' : (achievement >= assignment.alert_threshold ? 'warning' : 'critical')
      })
    })

    if (assignments.length > 0) {
      dashboard.avg_achievement = totalAchievement / assignments.length
    }

    // Вычисление средних по типам
    Object.keys(dashboard.assignments_by_type).forEach(type => {
      const typeData = dashboard.assignments_by_type[type]
      typeData.avg_achievement = typeData.total_achievement / typeData.count
      delete typeData.total_achievement
    })

    return { data: dashboard }
  },

  // Получить алерты по назначениям
  async getKpiAlerts(filters = {}) {
    await delay()
    let assignments = [...kpiAssignmentsData].filter(a => a.is_active)

    // Применение фильтров
    if (filters.responsible_user_id) {
      assignments = assignments.filter(a => a.responsible_user_id === filters.responsible_user_id)
    }

    const alerts = []

    assignments.forEach(assignment => {
      const achievement = assignment.target_value && assignment.target_value > 0
        ? assignment.current_value / assignment.target_value
        : 1

      if (achievement < assignment.alert_threshold) {
        alerts.push({
          type: 'below_threshold',
          severity: achievement < 0.5 ? 'critical' : 'warning',
          assignment_id: assignment.assignment_id,
          kpi_id: assignment.kpi_id,
          assigned_to_type: assignment.assigned_to_type,
          assigned_to_id: assignment.assigned_to_id,
          responsible_user_id: assignment.responsible_user_id,
          current_value: assignment.current_value,
          target_value: assignment.target_value,
          achievement_rate: achievement,
          alert_threshold: assignment.alert_threshold,
          message: `KPI ${assignment.kpi_id} ниже порогового значения`
        })
      }

      // Проверка истечения периода
      const endDate = new Date(assignment.period_end)
      const now = new Date()
      const daysToEnd = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))

      if (daysToEnd <= 7 && daysToEnd > 0 && achievement < 0.9) {
        alerts.push({
          type: 'deadline_approaching',
          severity: 'warning',
          assignment_id: assignment.assignment_id,
          kpi_id: assignment.kpi_id,
          days_to_end: daysToEnd,
          achievement_rate: achievement,
          message: `KPI ${assignment.kpi_id} истекает через ${daysToEnd} дней, цель не достигнута`
        })
      }
    })

    return { data: alerts }
  },

  // Массовое обновление назначений
  async bulkUpdateAssignments(updates) {
    await delay()
    const results = []

    for (const update of updates) {
      try {
        const result = await this.updateKpiAssignment(update.assignment_id, update.data)
        results.push({ assignment_id: update.assignment_id, success: true, data: result.data })
      } catch (error) {
        results.push({ assignment_id: update.assignment_id, success: false, error: error.message })
      }
    }

    return { data: results }
  },

  // Получить статистику по назначениям
  async getKpiAssignmentStats() {
    await delay()
    const stats = {
      total_assignments: kpiAssignmentsData.length,
      active_assignments: kpiAssignmentsData.filter(a => a.is_active).length,
      by_type: {},
      by_assigned_to_type: {},
      by_assignment_type: {},
      avg_achievement_rate: 0
    }

    let totalAchievement = 0
    let achievementCount = 0

    kpiAssignmentsData.forEach(assignment => {
      // Группировка по типу объекта назначения
      if (!stats.by_assigned_to_type[assignment.assigned_to_type]) {
        stats.by_assigned_to_type[assignment.assigned_to_type] = 0
      }
      stats.by_assigned_to_type[assignment.assigned_to_type]++

      // Группировка по типу назначения
      if (!stats.by_assignment_type[assignment.assignment_type]) {
        stats.by_assignment_type[assignment.assignment_type] = 0
      }
      stats.by_assignment_type[assignment.assignment_type]++

      // Расчет среднего достижения
      if (assignment.target_value && assignment.target_value > 0) {
        totalAchievement += assignment.current_value / assignment.target_value
        achievementCount++
      }
    })

    if (achievementCount > 0) {
      stats.avg_achievement_rate = totalAchievement / achievementCount
    }

    return { data: stats }
  },

  // Получить типы назначений
  async getAssignmentTypes() {
    await delay()
    const types = [...new Set(kpiAssignmentsData.map(a => a.assignment_type))]
    return { data: types }
  },

  // Получить типы объектов назначения
  async getAssignedToTypes() {
    await delay()
    const types = [...new Set(kpiAssignmentsData.map(a => a.assigned_to_type))]
    return { data: types }
  }
}