import teamAllocationsData from '../mocks/teamAllocations.mock.json'

// Имитация задержки сети
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

export const teamAllocationsApi = {
  // Получить все аллокации команд
  async getTeamAllocations(filters = {}) {
    await delay()
    let filtered = [...teamAllocationsData]

    // Фильтрация по команде
    if (filters.team_id) {
      filtered = filtered.filter(allocation => allocation.team_id === filters.team_id)
    }

    // Фильтрация по продукту
    if (filters.product_id) {
      filtered = filtered.filter(allocation => allocation.product_id === filters.product_id)
    }

    // Фильтрация по активности
    if (filters.activity_id) {
      filtered = filtered.filter(allocation => allocation.activity_id === filters.activity_id)
    }

    // Фильтрация по типу аллокации
    if (filters.allocation_type) {
      filtered = filtered.filter(allocation => allocation.allocation_type === filters.allocation_type)
    }

    // Фильтрация по периоду
    if (filters.period_start || filters.period_end) {
      filtered = filtered.filter(allocation => {
        const allocationStart = new Date(allocation.period_start)
        const allocationEnd = new Date(allocation.period_end)
        const filterStart = filters.period_start ? new Date(filters.period_start) : null
        const filterEnd = filters.period_end ? new Date(filters.period_end) : null

        if (filterStart && allocationEnd < filterStart) return false
        if (filterEnd && allocationStart > filterEnd) return false
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

  // Получить аллокацию по ID
  async getTeamAllocation(allocationId) {
    await delay()
    const allocation = teamAllocationsData.find(a => a.allocation_id === allocationId)
    if (!allocation) {
      throw new Error(`Аллокация с ID ${allocationId} не найдена`)
    }
    return { data: allocation }
  },

  // Создать новую аллокацию
  async createTeamAllocation(allocationData) {
    await delay()
    const newAllocation = {
      allocation_id: `alloc_${Date.now()}`,
      ...allocationData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Creating team allocation:', newAllocation)
    return { data: newAllocation }
  },

  // Обновить аллокацию
  async updateTeamAllocation(allocationId, updates) {
    await delay()
    const allocationIndex = teamAllocationsData.findIndex(a => a.allocation_id === allocationId)
    if (allocationIndex === -1) {
      throw new Error(`Аллокация с ID ${allocationId} не найдена`)
    }

    const updatedAllocation = {
      ...teamAllocationsData[allocationIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    console.log('Updating team allocation:', updatedAllocation)
    return { data: updatedAllocation }
  },

  // Удалить аллокацию
  async deleteTeamAllocation(allocationId) {
    await delay()
    const allocationIndex = teamAllocationsData.findIndex(a => a.allocation_id === allocationId)
    if (allocationIndex === -1) {
      throw new Error(`Аллокация с ID ${allocationId} не найдена`)
    }

    console.log('Deleting team allocation:', allocationId)
    return { success: true }
  },

  // Получить аллокации по команде
  async getAllocationsByTeam(teamId) {
    await delay()
    const allocations = teamAllocationsData.filter(a => a.team_id === teamId)
    return { data: allocations }
  },

  // Получить аллокации по продукту
  async getAllocationsByProduct(productId) {
    await delay()
    const allocations = teamAllocationsData.filter(a => a.product_id === productId)
    return { data: allocations }
  },

  // Получить загрузку команды по периодам
  async getTeamUtilization(teamId, periodStart, periodEnd) {
    await delay()
    const allocations = teamAllocationsData.filter(allocation => {
      if (allocation.team_id !== teamId) return false

      const allocationStart = new Date(allocation.period_start)
      const allocationEnd = new Date(allocation.period_end)
      const filterStart = new Date(periodStart)
      const filterEnd = new Date(periodEnd)

      return !(allocationEnd < filterStart || allocationStart > filterEnd)
    })

    const totalFTE = allocations.reduce((sum, allocation) => sum + allocation.fte_allocated, 0)
    const totalCost = allocations.reduce((sum, allocation) => {
      const months = Math.max(1, Math.ceil((new Date(allocation.period_end) - new Date(allocation.period_start)) / (1000 * 60 * 60 * 24 * 30)))
      return sum + (allocation.cost_per_month * months)
    }, 0)

    return {
      data: {
        team_id: teamId,
        period_start: periodStart,
        period_end: periodEnd,
        total_fte: totalFTE,
        total_cost: totalCost,
        allocations: allocations
      }
    }
  },

  // Получить статистику по аллокациям
  async getAllocationStats() {
    await delay()
    const stats = {
      total_allocations: teamAllocationsData.length,
      total_fte: teamAllocationsData.reduce((sum, a) => sum + a.fte_allocated, 0),
      total_monthly_cost: teamAllocationsData.reduce((sum, a) => sum + a.cost_per_month, 0),
      by_type: {},
      by_team: {}
    }

    teamAllocationsData.forEach(allocation => {
      // Группировка по типу
      if (!stats.by_type[allocation.allocation_type]) {
        stats.by_type[allocation.allocation_type] = {
          count: 0,
          total_fte: 0,
          total_cost: 0
        }
      }
      stats.by_type[allocation.allocation_type].count++
      stats.by_type[allocation.allocation_type].total_fte += allocation.fte_allocated
      stats.by_type[allocation.allocation_type].total_cost += allocation.cost_per_month

      // Группировка по команде
      if (!stats.by_team[allocation.team_id]) {
        stats.by_team[allocation.team_id] = {
          count: 0,
          total_fte: 0,
          total_cost: 0
        }
      }
      stats.by_team[allocation.team_id].count++
      stats.by_team[allocation.team_id].total_fte += allocation.fte_allocated
      stats.by_team[allocation.team_id].total_cost += allocation.cost_per_month
    })

    return { data: stats }
  },

  // Проверить конфликты аллокации
  async checkAllocationConflicts(teamId, periodStart, periodEnd, excludeAllocationId = null) {
    await delay()
    const conflicts = teamAllocationsData.filter(allocation => {
      if (allocation.team_id !== teamId) return false
      if (excludeAllocationId && allocation.allocation_id === excludeAllocationId) return false

      const allocationStart = new Date(allocation.period_start)
      const allocationEnd = new Date(allocation.period_end)
      const newStart = new Date(periodStart)
      const newEnd = new Date(periodEnd)

      return !(allocationEnd < newStart || allocationStart > newEnd)
    })

    return { data: conflicts }
  }
}