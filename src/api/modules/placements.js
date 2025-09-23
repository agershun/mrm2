import placementsData from '../mocks/placements.mock.json'

// Имитация задержки сети
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

export const placementsApi = {
  // Получить все площадки
  async getPlacements(filters = {}) {
    await delay()
    let filtered = [...placementsData]

    // Фильтрация по платформе
    if (filters.platform) {
      filtered = filtered.filter(placement => placement.platform === filters.platform)
    }

    // Фильтрация по категории
    if (filters.category) {
      filtered = filtered.filter(placement => placement.category === filters.category)
    }

    // Фильтрация только активных
    if (filters.active_only) {
      filtered = filtered.filter(placement => placement.is_active)
    }

    // Фильтрация по диапазону подписчиков
    if (filters.min_subscribers || filters.max_subscribers) {
      filtered = filtered.filter(placement => {
        if (!placement.subscribers) return false
        if (filters.min_subscribers && placement.subscribers < filters.min_subscribers) return false
        if (filters.max_subscribers && placement.subscribers > filters.max_subscribers) return false
        return true
      })
    }

    // Фильтрация по диапазону цен за пост
    if (filters.min_price || filters.max_price) {
      filtered = filtered.filter(placement => {
        const price = placement.price_per_post || placement.price_per_video || placement.price_per_banner || 0
        if (filters.min_price && price < filters.min_price) return false
        if (filters.max_price && price > filters.max_price) return false
        return true
      })
    }

    // Поиск по названию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(placement =>
        placement.name.toLowerCase().includes(searchLower) ||
        placement.notes?.toLowerCase().includes(searchLower)
      )
    }

    // Сортировка
    if (filters.sort_by) {
      filtered.sort((a, b) => {
        let aVal = a[filters.sort_by]
        let bVal = b[filters.sort_by]

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }

        if (filters.sort_order === 'desc') {
          return bVal > aVal ? 1 : -1
        }
        return aVal > bVal ? 1 : -1
      })
    }

    return {
      data: filtered,
      total: filtered.length,
      page: filters.page || 1,
      limit: filters.limit || 50
    }
  },

  // Получить площадку по ID
  async getPlacement(placementId) {
    await delay()
    const placement = placementsData.find(p => p.placement_id === placementId)
    if (!placement) {
      throw new Error(`Площадка с ID ${placementId} не найдена`)
    }
    return { data: placement }
  },

  // Создать новую площадку
  async createPlacement(placementData) {
    await delay()
    const newPlacement = {
      placement_id: `placement_${Date.now()}`,
      ...placementData,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Creating placement:', newPlacement)
    return { data: newPlacement }
  },

  // Обновить площадку
  async updatePlacement(placementId, updates) {
    await delay()
    const placementIndex = placementsData.findIndex(p => p.placement_id === placementId)
    if (placementIndex === -1) {
      throw new Error(`Площадка с ID ${placementId} не найдена`)
    }

    const updatedPlacement = {
      ...placementsData[placementIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    console.log('Updating placement:', updatedPlacement)
    return { data: updatedPlacement }
  },

  // Удалить площадку
  async deletePlacement(placementId) {
    await delay()
    const placementIndex = placementsData.findIndex(p => p.placement_id === placementId)
    if (placementIndex === -1) {
      throw new Error(`Площадка с ID ${placementId} не найдена`)
    }

    console.log('Deleting placement:', placementId)
    return { success: true }
  },

  // Получить площадки по платформе
  async getPlacementsByPlatform(platform) {
    await delay()
    const placements = placementsData.filter(p => p.platform === platform && p.is_active)
    return { data: placements }
  },

  // Получить площадки по категории
  async getPlacementsByCategory(category) {
    await delay()
    const placements = placementsData.filter(p => p.category === category && p.is_active)
    return { data: placements }
  },

  // Получить рекомендации площадок
  async getPlacementRecommendations(criteria = {}) {
    await delay()
    let recommended = placementsData.filter(p => p.is_active)

    // Фильтрация по бюджету
    if (criteria.budget) {
      recommended = recommended.filter(placement => {
        const price = placement.price_per_post || placement.price_per_video || placement.price_per_banner || 0
        return price <= criteria.budget
      })
    }

    // Фильтрация по целевой аудитории (возраст)
    if (criteria.target_age_min || criteria.target_age_max) {
      recommended = recommended.filter(placement => {
        if (!placement.audience_demographics) return false

        const demographics = placement.audience_demographics
        let ageScore = 0

        if (criteria.target_age_min <= 24 && criteria.target_age_max >= 18) {
          ageScore += demographics.age_18_24 || 0
        }
        if (criteria.target_age_min <= 34 && criteria.target_age_max >= 25) {
          ageScore += demographics.age_25_34 || 0
        }
        if (criteria.target_age_min <= 44 && criteria.target_age_max >= 35) {
          ageScore += demographics.age_35_44 || 0
        }
        if (criteria.target_age_max >= 45) {
          ageScore += demographics.age_45_plus || 0
        }

        return ageScore >= 30 // Минимум 30% совпадения с целевой аудиторией
      })
    }

    // Сортировка по эффективности (engagement rate)
    recommended.sort((a, b) => (b.avg_engagement_rate || 0) - (a.avg_engagement_rate || 0))

    return {
      data: recommended.slice(0, 10), // Топ-10 рекомендаций
      total: recommended.length
    }
  },

  // Получить статистику по площадкам
  async getPlacementStats() {
    await delay()
    const stats = {
      total: placementsData.length,
      active: placementsData.filter(p => p.is_active).length,
      by_platform: {},
      by_category: {},
      total_subscribers: 0,
      avg_engagement_rate: 0
    }

    let totalEngagement = 0
    let engagementCount = 0

    placementsData.forEach(placement => {
      // Группировка по платформе
      if (!stats.by_platform[placement.platform]) {
        stats.by_platform[placement.platform] = 0
      }
      stats.by_platform[placement.platform]++

      // Группировка по категории
      if (!stats.by_category[placement.category]) {
        stats.by_category[placement.category] = 0
      }
      stats.by_category[placement.category]++

      // Подсчет подписчиков
      if (placement.subscribers) {
        stats.total_subscribers += placement.subscribers
      }

      // Подсчет среднего engagement rate
      if (placement.avg_engagement_rate) {
        totalEngagement += placement.avg_engagement_rate
        engagementCount++
      }
    })

    if (engagementCount > 0) {
      stats.avg_engagement_rate = totalEngagement / engagementCount
    }

    return { data: stats }
  },

  // Получить список платформ
  async getPlatforms() {
    await delay()
    const platforms = [...new Set(placementsData.map(p => p.platform))]
    return { data: platforms }
  },

  // Получить список категорий
  async getCategories() {
    await delay()
    const categories = [...new Set(placementsData.map(p => p.category))]
    return { data: categories }
  },

  // Получить типы контента для площадки
  async getContentTypes(placementId) {
    await delay()
    const placement = placementsData.find(p => p.placement_id === placementId)
    if (!placement) {
      throw new Error(`Площадка с ID ${placementId} не найдена`)
    }
    return { data: placement.content_types || [] }
  }
}