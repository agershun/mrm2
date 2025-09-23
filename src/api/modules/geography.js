import geographyData from '../mocks/geography.mock.json'

// Имитация задержки сети
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

export const geographyApi = {
  // Получить все географические объекты
  async getGeographies(filters = {}) {
    await delay()
    let filtered = [...geographyData]

    // Фильтрация по типу
    if (filters.type) {
      filtered = filtered.filter(geo => geo.type === filters.type)
    }

    // Фильтрация по родительскому объекту
    if (filters.parent_id) {
      filtered = filtered.filter(geo => geo.parent_id === filters.parent_id)
    }

    // Фильтрация только активных
    if (filters.active_only) {
      filtered = filtered.filter(geo => geo.is_active)
    }

    // Поиск по названию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(geo =>
        geo.name.toLowerCase().includes(searchLower) ||
        geo.code.toLowerCase().includes(searchLower)
      )
    }

    return {
      data: filtered,
      total: filtered.length,
      page: filters.page || 1,
      limit: filters.limit || 50
    }
  },

  // Получить географический объект по ID
  async getGeography(geographyId) {
    await delay()
    const geography = geographyData.find(g => g.geography_id === geographyId)
    if (!geography) {
      throw new Error(`Географический объект с ID ${geographyId} не найден`)
    }
    return { data: geography }
  },

  // Получить иерархическую структуру
  async getGeographyHierarchy() {
    await delay()
    const buildHierarchy = (parentId = null) => {
      return geographyData
        .filter(geo => geo.parent_id === parentId && geo.is_active)
        .map(geo => ({
          ...geo,
          children: buildHierarchy(geo.geography_id)
        }))
    }

    return { data: buildHierarchy() }
  },

  // Получить детей для указанного объекта
  async getGeographyChildren(parentId) {
    await delay()
    const children = geographyData.filter(geo => geo.parent_id === parentId && geo.is_active)
    return { data: children }
  },

  // Получить путь до корня
  async getGeographyPath(geographyId) {
    await delay()
    const path = []
    let currentId = geographyId

    while (currentId) {
      const current = geographyData.find(g => g.geography_id === currentId)
      if (!current) break

      path.unshift(current)
      currentId = current.parent_id
    }

    return { data: path }
  },

  // Создать новый географический объект
  async createGeography(geographyData) {
    await delay()
    const newGeography = {
      geography_id: `geo_${Date.now()}`,
      ...geographyData,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Creating geography:', newGeography)
    return { data: newGeography }
  },

  // Обновить географический объект
  async updateGeography(geographyId, updates) {
    await delay()
    const geographyIndex = geographyData.findIndex(g => g.geography_id === geographyId)
    if (geographyIndex === -1) {
      throw new Error(`Географический объект с ID ${geographyId} не найден`)
    }

    const updatedGeography = {
      ...geographyData[geographyIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    console.log('Updating geography:', updatedGeography)
    return { data: updatedGeography }
  },

  // Получить типы географических объектов
  async getGeographyTypes() {
    await delay()
    const types = [...new Set(geographyData.map(g => g.type))]
    return { data: types }
  },

  // Получить объекты по типу
  async getGeographiesByType(type) {
    await delay()
    const filtered = geographyData.filter(geo => geo.type === type && geo.is_active)
    return { data: filtered }
  },

  // Получить города-миллионники
  async getMillionCities() {
    await delay()
    const millionGroup = geographyData.find(g => g.geography_id === 'geo_cities_million')
    if (!millionGroup || !millionGroup.cities_included) {
      return { data: [] }
    }

    const cities = geographyData.filter(geo =>
      millionGroup.cities_included.includes(geo.geography_id)
    )
    return { data: cities }
  },

  // Получить статистику по географии
  async getGeographyStats() {
    await delay()
    const stats = {
      total: geographyData.length,
      by_type: {},
      total_population: 0
    }

    geographyData.forEach(geo => {
      if (!stats.by_type[geo.type]) {
        stats.by_type[geo.type] = 0
      }
      stats.by_type[geo.type]++

      if (geo.population) {
        stats.total_population += geo.population
      }
    })

    return { data: stats }
  }
}