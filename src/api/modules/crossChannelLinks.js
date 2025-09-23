import crossChannelLinksData from '../mocks/crossChannelLinks.mock.json'

// Имитация задержки сети
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

export const crossChannelLinksApi = {
  // Получить все связи между каналами
  async getCrossChannelLinks(filters = {}) {
    await delay()
    let filtered = [...crossChannelLinksData]

    // Фильтрация по источнику
    if (filters.source_activity_id) {
      filtered = filtered.filter(link => link.source_activity_id === filters.source_activity_id)
    }

    // Фильтрация по цели
    if (filters.target_activity_id) {
      filtered = filtered.filter(link => link.target_activity_id === filters.target_activity_id)
    }

    // Фильтрация по типу связи
    if (filters.link_type) {
      filtered = filtered.filter(link => link.link_type === filters.link_type)
    }

    // Фильтрация по минимальной силе влияния
    if (filters.min_influence_strength) {
      filtered = filtered.filter(link => link.influence_strength >= filters.min_influence_strength)
    }

    // Фильтрация по минимальному уровню доверия
    if (filters.min_confidence_level) {
      filtered = filtered.filter(link => link.confidence_level >= filters.min_confidence_level)
    }

    // Фильтрация по создателю
    if (filters.created_by) {
      filtered = filtered.filter(link => link.created_by === filters.created_by)
    }

    return {
      data: filtered,
      total: filtered.length,
      page: filters.page || 1,
      limit: filters.limit || 50
    }
  },

  // Получить связь по ID
  async getCrossChannelLink(linkId) {
    await delay()
    const link = crossChannelLinksData.find(l => l.link_id === linkId)
    if (!link) {
      throw new Error(`Связь с ID ${linkId} не найдена`)
    }
    return { data: link }
  },

  // Создать новую связь
  async createCrossChannelLink(linkData) {
    await delay()
    const newLink = {
      link_id: `link_${Date.now()}`,
      ...linkData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Creating cross-channel link:', newLink)
    return { data: newLink }
  },

  // Обновить связь
  async updateCrossChannelLink(linkId, updates) {
    await delay()
    const linkIndex = crossChannelLinksData.findIndex(l => l.link_id === linkId)
    if (linkIndex === -1) {
      throw new Error(`Связь с ID ${linkId} не найдена`)
    }

    const updatedLink = {
      ...crossChannelLinksData[linkIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    console.log('Updating cross-channel link:', updatedLink)
    return { data: updatedLink }
  },

  // Удалить связь
  async deleteCrossChannelLink(linkId) {
    await delay()
    const linkIndex = crossChannelLinksData.findIndex(l => l.link_id === linkId)
    if (linkIndex === -1) {
      throw new Error(`Связь с ID ${linkId} не найдена`)
    }

    console.log('Deleting cross-channel link:', linkId)
    return { success: true }
  },

  // Получить все связи для активности (как источника)
  async getLinksFromActivity(activityId) {
    await delay()
    const links = crossChannelLinksData.filter(l => l.source_activity_id === activityId)
    return { data: links }
  },

  // Получить все связи для активности (как цели)
  async getLinksToActivity(activityId) {
    await delay()
    const links = crossChannelLinksData.filter(l => l.target_activity_id === activityId)
    return { data: links }
  },

  // Получить все связи для активности
  async getAllLinksForActivity(activityId) {
    await delay()
    const outgoingLinks = crossChannelLinksData.filter(l => l.source_activity_id === activityId)
    const incomingLinks = crossChannelLinksData.filter(l => l.target_activity_id === activityId)

    return {
      data: {
        outgoing: outgoingLinks,
        incoming: incomingLinks,
        total_outgoing: outgoingLinks.length,
        total_incoming: incomingLinks.length
      }
    }
  },

  // Построить граф влияния
  async getInfluenceGraph(activityIds = []) {
    await delay()
    let links = [...crossChannelLinksData]

    // Фильтрация по указанным активностям
    if (activityIds.length > 0) {
      links = links.filter(link =>
        activityIds.includes(link.source_activity_id) ||
        activityIds.includes(link.target_activity_id)
      )
    }

    // Построение структуры графа
    const nodes = new Set()
    const edges = []

    links.forEach(link => {
      nodes.add(link.source_activity_id)
      nodes.add(link.target_activity_id)
      edges.push({
        from: link.source_activity_id,
        to: link.target_activity_id,
        weight: link.influence_strength,
        type: link.link_type,
        confidence: link.confidence_level,
        lag_days: link.lag_days
      })
    })

    return {
      data: {
        nodes: Array.from(nodes),
        edges: edges,
        total_nodes: nodes.size,
        total_edges: edges.length
      }
    }
  },

  // Получить типы связей
  async getLinkTypes() {
    await delay()
    const types = [...new Set(crossChannelLinksData.map(l => l.link_type))]
    return { data: types }
  },

  // Анализ силы влияния по типам связей
  async getInfluenceAnalysis() {
    await delay()
    const analysis = {}

    crossChannelLinksData.forEach(link => {
      if (!analysis[link.link_type]) {
        analysis[link.link_type] = {
          count: 0,
          avg_influence: 0,
          avg_confidence: 0,
          avg_lag_days: 0,
          min_influence: 1,
          max_influence: 0
        }
      }

      const type = analysis[link.link_type]
      type.count++
      type.avg_influence += link.influence_strength
      type.avg_confidence += link.confidence_level
      type.avg_lag_days += link.lag_days
      type.min_influence = Math.min(type.min_influence, link.influence_strength)
      type.max_influence = Math.max(type.max_influence, link.influence_strength)
    })

    // Вычисление средних значений
    Object.keys(analysis).forEach(type => {
      const data = analysis[type]
      data.avg_influence = data.avg_influence / data.count
      data.avg_confidence = data.avg_confidence / data.count
      data.avg_lag_days = data.avg_lag_days / data.count
    })

    return { data: analysis }
  },

  // Найти потенциальные связи
  async findPotentialLinks(activityId, threshold = 0.7) {
    await delay()

    // В реальном приложении здесь был бы алгоритм машинного обучения
    // Для демо возвращаем заглушку
    const potentialLinks = [
      {
        suggested_target: "activity_new_1",
        estimated_influence: 0.72,
        estimated_confidence: 0.68,
        suggested_type: "DrivesOrganic",
        reason: "Похожие паттерны в исторических данных"
      },
      {
        suggested_target: "activity_new_2",
        estimated_influence: 0.75,
        estimated_confidence: 0.71,
        suggested_type: "DrivesBrandSearch",
        reason: "Корреляция в брендовых запросах"
      }
    ]

    return { data: potentialLinks }
  },

  // Получить статистику по связям
  async getCrossChannelStats() {
    await delay()
    const stats = {
      total_links: crossChannelLinksData.length,
      by_type: {},
      avg_influence_strength: 0,
      avg_confidence_level: 0,
      avg_lag_days: 0
    }

    let totalInfluence = 0
    let totalConfidence = 0
    let totalLag = 0

    crossChannelLinksData.forEach(link => {
      // Группировка по типу
      if (!stats.by_type[link.link_type]) {
        stats.by_type[link.link_type] = 0
      }
      stats.by_type[link.link_type]++

      totalInfluence += link.influence_strength
      totalConfidence += link.confidence_level
      totalLag += link.lag_days
    })

    if (crossChannelLinksData.length > 0) {
      stats.avg_influence_strength = totalInfluence / crossChannelLinksData.length
      stats.avg_confidence_level = totalConfidence / crossChannelLinksData.length
      stats.avg_lag_days = totalLag / crossChannelLinksData.length
    }

    return { data: stats }
  }
}