import adFormatsData from '../mocks/adFormats.mock.json'

// Имитация задержки сети
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

export const adFormatsApi = {
  // Получить все рекламные форматы
  async getAdFormats(filters = {}) {
    await delay()
    let filtered = [...adFormatsData]

    // Фильтрация по категории
    if (filters.category) {
      filtered = filtered.filter(format => format.category === filters.category)
    }

    // Фильтрация по платформе
    if (filters.platform) {
      filtered = filtered.filter(format => format.platform === filters.platform)
    }

    // Фильтрация только активных
    if (filters.active_only) {
      filtered = filtered.filter(format => format.is_active)
    }

    // Фильтрация по поддержке анимации
    if (filters.animation_allowed !== undefined) {
      filtered = filtered.filter(format => format.animation_allowed === filters.animation_allowed)
    }

    // Фильтрация по поддержке видео
    if (filters.video_allowed !== undefined) {
      filtered = filtered.filter(format => format.video_allowed === filters.video_allowed)
    }

    // Фильтрация по поддержке аудио
    if (filters.audio_allowed !== undefined) {
      filtered = filtered.filter(format => format.audio_allowed === filters.audio_allowed)
    }

    // Фильтрация по типам файлов
    if (filters.file_type) {
      filtered = filtered.filter(format => format.file_types.includes(filters.file_type))
    }

    // Фильтрация по модели ценообразования
    if (filters.pricing_model) {
      filtered = filtered.filter(format => format.pricing_model.includes(filters.pricing_model))
    }

    // Поиск по названию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(format =>
        format.name.toLowerCase().includes(searchLower) ||
        format.description?.toLowerCase().includes(searchLower)
      )
    }

    return {
      data: filtered,
      total: filtered.length,
      page: filters.page || 1,
      limit: filters.limit || 50
    }
  },

  // Получить формат по ID
  async getAdFormat(formatId) {
    await delay()
    const format = adFormatsData.find(f => f.format_id === formatId)
    if (!format) {
      throw new Error(`Рекламный формат с ID ${formatId} не найден`)
    }
    return { data: format }
  },

  // Создать новый рекламный формат
  async createAdFormat(formatData) {
    await delay()
    const newFormat = {
      format_id: `format_${Date.now()}`,
      ...formatData,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Creating ad format:', newFormat)
    return { data: newFormat }
  },

  // Обновить рекламный формат
  async updateAdFormat(formatId, updates) {
    await delay()
    const formatIndex = adFormatsData.findIndex(f => f.format_id === formatId)
    if (formatIndex === -1) {
      throw new Error(`Рекламный формат с ID ${formatId} не найден`)
    }

    const updatedFormat = {
      ...adFormatsData[formatIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    console.log('Updating ad format:', updatedFormat)
    return { data: updatedFormat }
  },

  // Удалить рекламный формат
  async deleteAdFormat(formatId) {
    await delay()
    const formatIndex = adFormatsData.findIndex(f => f.format_id === formatId)
    if (formatIndex === -1) {
      throw new Error(`Рекламный формат с ID ${formatId} не найден`)
    }

    console.log('Deleting ad format:', formatId)
    return { success: true }
  },

  // Получить форматы по категории
  async getFormatsByCategory(category) {
    await delay()
    const formats = adFormatsData.filter(f => f.category === category && f.is_active)
    return { data: formats }
  },

  // Получить форматы по платформе
  async getFormatsByPlatform(platform) {
    await delay()
    const formats = adFormatsData.filter(f => f.platform === platform && f.is_active)
    return { data: formats }
  },

  // Валидация файла по формату
  async validateFile(formatId, fileData) {
    await delay()
    const format = adFormatsData.find(f => f.format_id === formatId)
    if (!format) {
      throw new Error(`Рекламный формат с ID ${formatId} не найден`)
    }

    const validationResult = {
      is_valid: true,
      errors: [],
      warnings: []
    }

    // Проверка типа файла
    if (!format.file_types.includes(fileData.file_type)) {
      validationResult.is_valid = false
      validationResult.errors.push(`Неподдерживаемый тип файла. Разрешены: ${format.file_types.join(', ')}`)
    }

    // Проверка размера файла
    if (format.max_file_size && fileData.file_size > format.max_file_size) {
      validationResult.is_valid = false
      validationResult.errors.push(`Размер файла превышает максимальный (${format.max_file_size} МБ)`)
    }

    // Проверка размеров
    if (format.dimensions && fileData.dimensions) {
      const [reqWidth, reqHeight] = format.dimensions.split('x').map(Number)
      const [fileWidth, fileHeight] = fileData.dimensions.split('x').map(Number)

      if (reqWidth !== fileWidth || reqHeight !== fileHeight) {
        validationResult.errors.push(`Неверные размеры. Требуется: ${format.dimensions}`)
      }
    }

    // Проверка длительности для видео
    if (format.duration && fileData.duration) {
      if (fileData.duration > format.duration) {
        validationResult.is_valid = false
        validationResult.errors.push(`Длительность превышает максимальную (${format.duration} сек)`)
      }
    }

    // Проверка технических спецификаций
    if (format.technical_specs && fileData.technical_specs) {
      const specs = format.technical_specs
      const fileSpecs = fileData.technical_specs

      if (specs.frame_rate_max && fileSpecs.frame_rate > specs.frame_rate_max) {
        validationResult.warnings.push(`Частота кадров выше рекомендуемой (${specs.frame_rate_max} fps)`)
      }

      if (specs.bitrate_max && fileSpecs.bitrate > specs.bitrate_max) {
        validationResult.warnings.push(`Битрейт выше рекомендуемого (${specs.bitrate_max})`)
      }
    }

    return { data: validationResult }
  },

  // Получить рекомендации по форматам
  async getFormatRecommendations(criteria = {}) {
    await delay()
    let recommended = adFormatsData.filter(f => f.is_active)

    // Фильтрация по критериям
    if (criteria.campaign_type) {
      // Логика рекомендаций в зависимости от типа кампании
      switch (criteria.campaign_type) {
        case 'brand_awareness':
          recommended = recommended.filter(f =>
            f.category === 'Video' || f.category === 'Display' || f.category === 'TV'
          )
          break
        case 'performance':
          recommended = recommended.filter(f =>
            f.category === 'Social' || f.category === 'Display'
          )
          break
        case 'engagement':
          recommended = recommended.filter(f =>
            f.category === 'Social' || f.category === 'Video'
          )
          break
      }
    }

    if (criteria.target_platform) {
      recommended = recommended.filter(f => f.platform === criteria.target_platform)
    }

    if (criteria.budget_level) {
      // Простая логика фильтрации по бюджету
      if (criteria.budget_level === 'low') {
        recommended = recommended.filter(f =>
          f.category === 'Social' || f.category === 'Display'
        )
      } else if (criteria.budget_level === 'high') {
        recommended = recommended.filter(f =>
          f.category === 'TV' || f.category === 'Video'
        )
      }
    }

    // Сортировка по популярности (заглушка)
    recommended.sort((a, b) => {
      const popularityScore = {
        'Social': 5,
        'Video': 4,
        'Display': 3,
        'Native': 2,
        'TV': 1
      }
      return (popularityScore[b.category] || 0) - (popularityScore[a.category] || 0)
    })

    return {
      data: recommended.slice(0, 10),
      total: recommended.length
    }
  },

  // Получить категории форматов
  async getCategories() {
    await delay()
    const categories = [...new Set(adFormatsData.map(f => f.category))]
    return { data: categories }
  },

  // Получить платформы
  async getPlatforms() {
    await delay()
    const platforms = [...new Set(adFormatsData.map(f => f.platform))]
    return { data: platforms }
  },

  // Получить поддерживаемые типы файлов
  async getFileTypes() {
    await delay()
    const fileTypes = new Set()
    adFormatsData.forEach(format => {
      format.file_types.forEach(type => fileTypes.add(type))
    })
    return { data: Array.from(fileTypes) }
  },

  // Получить модели ценообразования
  async getPricingModels() {
    await delay()
    const pricingModels = new Set()
    adFormatsData.forEach(format => {
      format.pricing_model.forEach(model => pricingModels.add(model))
    })
    return { data: Array.from(pricingModels) }
  },

  // Сравнение форматов
  async compareFormats(formatIds) {
    await delay()
    const formats = adFormatsData.filter(f => formatIds.includes(f.format_id))

    if (formats.length !== formatIds.length) {
      const found = formats.map(f => f.format_id)
      const missing = formatIds.filter(id => !found.includes(id))
      throw new Error(`Форматы не найдены: ${missing.join(', ')}`)
    }

    const comparison = {
      formats: formats,
      comparison_matrix: {}
    }

    // Создание матрицы сравнения
    const compareFields = [
      'category', 'platform', 'max_file_size', 'animation_allowed',
      'video_allowed', 'audio_allowed', 'pricing_model'
    ]

    compareFields.forEach(field => {
      comparison.comparison_matrix[field] = formats.map(format => ({
        format_id: format.format_id,
        name: format.name,
        value: format[field]
      }))
    })

    return { data: comparison }
  },

  // Получить статистику по форматам
  async getAdFormatStats() {
    await delay()
    const stats = {
      total_formats: adFormatsData.length,
      active_formats: adFormatsData.filter(f => f.is_active).length,
      by_category: {},
      by_platform: {},
      features: {
        animation_supported: adFormatsData.filter(f => f.animation_allowed).length,
        video_supported: adFormatsData.filter(f => f.video_allowed).length,
        audio_supported: adFormatsData.filter(f => f.audio_allowed).length
      }
    }

    adFormatsData.forEach(format => {
      // Группировка по категории
      if (!stats.by_category[format.category]) {
        stats.by_category[format.category] = 0
      }
      stats.by_category[format.category]++

      // Группировка по платформе
      if (!stats.by_platform[format.platform]) {
        stats.by_platform[format.platform] = 0
      }
      stats.by_platform[format.platform]++
    })

    return { data: stats }
  }
}