import kpiHierarchiesData from '../mocks/kpiHierarchies.mock.json'

// Имитация задержки сети
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

export const kpiHierarchiesApi = {
  // Получить все иерархии KPI
  async getKpiHierarchies(filters = {}) {
    await delay()
    let filtered = [...kpiHierarchiesData]

    // Фильтрация по родительскому KPI
    if (filters.parent_kpi_id) {
      filtered = filtered.filter(hierarchy => hierarchy.parent_kpi_id === filters.parent_kpi_id)
    }

    // Фильтрация по дочернему KPI
    if (filters.child_kpi_id) {
      filtered = filtered.filter(hierarchy => hierarchy.child_kpi_id === filters.child_kpi_id)
    }

    // Фильтрация по типу связи
    if (filters.relationship_type) {
      filtered = filtered.filter(hierarchy => hierarchy.relationship_type === filters.relationship_type)
    }

    // Фильтрация только активных
    if (filters.active_only) {
      filtered = filtered.filter(hierarchy => hierarchy.is_active)
    }

    // Фильтрация по создателю
    if (filters.created_by) {
      filtered = filtered.filter(hierarchy => hierarchy.created_by === filters.created_by)
    }

    return {
      data: filtered,
      total: filtered.length,
      page: filters.page || 1,
      limit: filters.limit || 50
    }
  },

  // Получить иерархию по ID
  async getKpiHierarchy(hierarchyId) {
    await delay()
    const hierarchy = kpiHierarchiesData.find(h => h.hierarchy_id === hierarchyId)
    if (!hierarchy) {
      throw new Error(`Иерархия KPI с ID ${hierarchyId} не найдена`)
    }
    return { data: hierarchy }
  },

  // Создать новую иерархию KPI
  async createKpiHierarchy(hierarchyData) {
    await delay()
    const newHierarchy = {
      hierarchy_id: `kpi_hierarchy_${Date.now()}`,
      ...hierarchyData,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Creating KPI hierarchy:', newHierarchy)
    return { data: newHierarchy }
  },

  // Обновить иерархию KPI
  async updateKpiHierarchy(hierarchyId, updates) {
    await delay()
    const hierarchyIndex = kpiHierarchiesData.findIndex(h => h.hierarchy_id === hierarchyId)
    if (hierarchyIndex === -1) {
      throw new Error(`Иерархия KPI с ID ${hierarchyId} не найдена`)
    }

    const updatedHierarchy = {
      ...kpiHierarchiesData[hierarchyIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    console.log('Updating KPI hierarchy:', updatedHierarchy)
    return { data: updatedHierarchy }
  },

  // Удалить иерархию KPI
  async deleteKpiHierarchy(hierarchyId) {
    await delay()
    const hierarchyIndex = kpiHierarchiesData.findIndex(h => h.hierarchy_id === hierarchyId)
    if (hierarchyIndex === -1) {
      throw new Error(`Иерархия KPI с ID ${hierarchyId} не найдена`)
    }

    console.log('Deleting KPI hierarchy:', hierarchyId)
    return { success: true }
  },

  // Получить дочерние KPI для родительского
  async getChildrenKpis(parentKpiId) {
    await delay()
    const children = kpiHierarchiesData.filter(h => h.parent_kpi_id === parentKpiId && h.is_active)
    return { data: children }
  },

  // Получить родительские KPI для дочернего
  async getParentKpis(childKpiId) {
    await delay()
    const parents = kpiHierarchiesData.filter(h => h.child_kpi_id === childKpiId && h.is_active)
    return { data: parents }
  },

  // Построить полную иерархию KPI
  async buildKpiHierarchyTree() {
    await delay()
    const activeHierarchies = kpiHierarchiesData.filter(h => h.is_active)

    // Найти корневые KPI (те, которые не являются дочерними)
    const childKpiIds = new Set(activeHierarchies.map(h => h.child_kpi_id))
    const rootKpiIds = new Set()

    activeHierarchies.forEach(h => {
      if (!childKpiIds.has(h.parent_kpi_id)) {
        rootKpiIds.add(h.parent_kpi_id)
      }
    })

    // Рекурсивная функция построения дерева
    const buildNode = (kpiId, visited = new Set()) => {
      if (visited.has(kpiId)) {
        // Предотвращение бесконечной рекурсии
        return { kpi_id: kpiId, children: [], circular_reference: true }
      }

      visited.add(kpiId)

      const children = activeHierarchies
        .filter(h => h.parent_kpi_id === kpiId)
        .map(h => ({
          ...h,
          child_node: buildNode(h.child_kpi_id, new Set(visited))
        }))

      return {
        kpi_id: kpiId,
        children: children
      }
    }

    const tree = Array.from(rootKpiIds).map(rootId => buildNode(rootId))

    return { data: tree }
  },

  // Получить путь в иерархии от корня до KPI
  async getKpiPath(targetKpiId) {
    await delay()
    const paths = []

    const findPaths = (currentKpiId, currentPath = []) => {
      // Найти всех родителей текущего KPI
      const parentRelations = kpiHierarchiesData.filter(h =>
        h.child_kpi_id === currentKpiId && h.is_active
      )

      if (parentRelations.length === 0) {
        // Это корневой KPI
        paths.push([...currentPath, currentKpiId])
      } else {
        // Рекурсивно найти пути через всех родителей
        parentRelations.forEach(relation => {
          findPaths(relation.parent_kpi_id, [...currentPath, currentKpiId])
        })
      }
    }

    findPaths(targetKpiId)

    // Обратить пути (они идут от листа к корню)
    const reversedPaths = paths.map(path => path.reverse())

    return { data: reversedPaths }
  },

  // Рассчитать влияние KPI
  async calculateKpiInfluence(kpiId) {
    await delay()

    // Получить все связи, где этот KPI является родительским
    const directInfluences = kpiHierarchiesData.filter(h =>
      h.parent_kpi_id === kpiId && h.is_active
    )

    // Рекурсивно рассчитать косвенное влияние
    const calculateIndirectInfluence = (currentKpiId, depth = 0, maxDepth = 5) => {
      if (depth >= maxDepth) return []

      const children = kpiHierarchiesData.filter(h =>
        h.parent_kpi_id === currentKpiId && h.is_active
      )

      const influences = []
      children.forEach(child => {
        influences.push({
          kpi_id: child.child_kpi_id,
          influence_strength: child.weight,
          depth: depth + 1,
          relationship_type: child.relationship_type
        })

        // Рекурсивно добавить влияние на внуков
        const grandchildren = calculateIndirectInfluence(child.child_kpi_id, depth + 1, maxDepth)
        grandchildren.forEach(grandchild => {
          influences.push({
            ...grandchild,
            influence_strength: grandchild.influence_strength * child.weight
          })
        })
      })

      return influences
    }

    const allInfluences = calculateIndirectInfluence(kpiId)

    return {
      data: {
        kpi_id: kpiId,
        direct_influences: directInfluences.length,
        total_influences: allInfluences.length,
        influences: allInfluences
      }
    }
  },

  // Получить типы связей
  async getRelationshipTypes() {
    await delay()
    const types = [...new Set(kpiHierarchiesData.map(h => h.relationship_type))]
    return { data: types }
  },

  // Получить методы расчета
  async getCalculationMethods() {
    await delay()
    const methods = [...new Set(kpiHierarchiesData.map(h => h.calculation_method))]
    return { data: methods }
  },

  // Валидация иерархии (проверка на циклы)
  async validateHierarchy(parentKpiId, childKpiId) {
    await delay()

    const visited = new Set()
    const hasCycle = (currentKpiId, targetKpiId) => {
      if (currentKpiId === targetKpiId) return true
      if (visited.has(currentKpiId)) return false

      visited.add(currentKpiId)

      const children = kpiHierarchiesData.filter(h =>
        h.parent_kpi_id === currentKpiId && h.is_active
      )

      return children.some(child => hasCycle(child.child_kpi_id, targetKpiId))
    }

    const wouldCreateCycle = hasCycle(childKpiId, parentKpiId)

    return {
      data: {
        is_valid: !wouldCreateCycle,
        would_create_cycle: wouldCreateCycle,
        message: wouldCreateCycle
          ? 'Добавление этой связи создаст циклическую зависимость'
          : 'Связь валидна'
      }
    }
  },

  // Получить статистику по иерархиям KPI
  async getKpiHierarchyStats() {
    await delay()
    const stats = {
      total_hierarchies: kpiHierarchiesData.length,
      active_hierarchies: kpiHierarchiesData.filter(h => h.is_active).length,
      by_relationship_type: {},
      by_calculation_method: {},
      avg_weight: 0
    }

    let totalWeight = 0

    kpiHierarchiesData.forEach(hierarchy => {
      // Группировка по типу связи
      if (!stats.by_relationship_type[hierarchy.relationship_type]) {
        stats.by_relationship_type[hierarchy.relationship_type] = 0
      }
      stats.by_relationship_type[hierarchy.relationship_type]++

      // Группировка по методу расчета
      if (!stats.by_calculation_method[hierarchy.calculation_method]) {
        stats.by_calculation_method[hierarchy.calculation_method] = 0
      }
      stats.by_calculation_method[hierarchy.calculation_method]++

      totalWeight += hierarchy.weight
    })

    if (kpiHierarchiesData.length > 0) {
      stats.avg_weight = totalWeight / kpiHierarchiesData.length
    }

    return { data: stats }
  }
}