import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adFormatsApi } from '@/api/modules/adFormats'

export const useAdFormatsStore = defineStore('adFormats', () => {
  // State
  const formats = ref([])
  const currentFormat = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const categories = ref([])
  const platforms = ref([])
  const fileTypes = ref([])
  const pricingModels = ref([])
  const stats = ref({})
  const recommendations = ref([])

  // Getters
  const activeFormats = computed(() =>
    formats.value.filter(format => format.is_active)
  )

  const formatsByCategory = computed(() => {
    const grouped = {}
    formats.value.forEach(format => {
      if (!grouped[format.category]) {
        grouped[format.category] = []
      }
      grouped[format.category].push(format)
    })
    return grouped
  })

  const formatsByPlatform = computed(() => {
    const grouped = {}
    formats.value.forEach(format => {
      if (!grouped[format.platform]) {
        grouped[format.platform] = []
      }
      grouped[format.platform].push(format)
    })
    return grouped
  })

  const videoFormats = computed(() =>
    activeFormats.value.filter(format => format.video_allowed)
  )

  const animationFormats = computed(() =>
    activeFormats.value.filter(format => format.animation_allowed)
  )

  const audioFormats = computed(() =>
    activeFormats.value.filter(format => format.audio_allowed)
  )

  const staticFormats = computed(() =>
    activeFormats.value.filter(format =>
      !format.video_allowed && !format.animation_allowed && !format.audio_allowed
    )
  )

  const getFormatById = computed(() => {
    return (formatId) => formats.value.find(f => f.format_id === formatId)
  })

  const getFormatsForPlatform = computed(() => {
    return (platform) => formatsByPlatform.value[platform] || []
  })

  const getFormatsForCategory = computed(() => {
    return (category) => formatsByCategory.value[category] || []
  })

  // Actions
  const fetchFormats = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.getAdFormats(filters)
      formats.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchFormat = async (formatId) => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.getAdFormat(formatId)
      currentFormat.value = response.data

      // Обновить формат в списке, если он уже загружен
      const index = formats.value.findIndex(f => f.format_id === formatId)
      if (index !== -1) {
        formats.value[index] = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createFormat = async (formatData) => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.createAdFormat(formatData)
      formats.value.push(response.data)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFormat = async (formatId, updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.updateAdFormat(formatId, updates)

      // Обновить формат в списке
      const index = formats.value.findIndex(f => f.format_id === formatId)
      if (index !== -1) {
        formats.value[index] = response.data
      }

      // Обновить текущий формат, если это он
      if (currentFormat.value?.format_id === formatId) {
        currentFormat.value = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteFormat = async (formatId) => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.deleteAdFormat(formatId)

      // Удалить формат из списка
      const index = formats.value.findIndex(f => f.format_id === formatId)
      if (index !== -1) {
        formats.value.splice(index, 1)
      }

      // Очистить текущий формат, если это он
      if (currentFormat.value?.format_id === formatId) {
        currentFormat.value = null
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchFormatsByCategory = async (category) => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.getFormatsByCategory(category)

      // Обновить форматы в основном списке
      response.data.forEach(format => {
        const index = formats.value.findIndex(f => f.format_id === format.format_id)
        if (index === -1) {
          formats.value.push(format)
        } else {
          formats.value[index] = format
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

  const fetchFormatsByPlatform = async (platform) => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.getFormatsByPlatform(platform)

      // Обновить форматы в основном списке
      response.data.forEach(format => {
        const index = formats.value.findIndex(f => f.format_id === format.format_id)
        if (index === -1) {
          formats.value.push(format)
        } else {
          formats.value[index] = format
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

  const validateFile = async (formatId, fileData) => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.validateFile(formatId, fileData)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchRecommendations = async (criteria = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.getFormatRecommendations(criteria)
      recommendations.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.getCategories()
      categories.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPlatforms = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.getPlatforms()
      platforms.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchFileTypes = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.getFileTypes()
      fileTypes.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPricingModels = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.getPricingModels()
      pricingModels.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const compareFormats = async (formatIds) => {
    loading.value = true
    error.value = null
    try {
      const response = await adFormatsApi.compareFormats(formatIds)
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
      const response = await adFormatsApi.getAdFormatStats()
      stats.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  const getFormatsForCampaign = (campaignType, platform = null, budget = null) => {
    let filteredFormats = activeFormats.value

    // Фильтрация по платформе
    if (platform) {
      filteredFormats = filteredFormats.filter(f => f.platform === platform)
    }

    // Логика рекомендаций по типу кампании
    switch (campaignType) {
      case 'brand_awareness':
        filteredFormats = filteredFormats.filter(f =>
          ['Video', 'Display', 'TV', 'OOH'].includes(f.category)
        )
        break
      case 'performance':
        filteredFormats = filteredFormats.filter(f =>
          ['Social', 'Display', 'Native'].includes(f.category)
        )
        break
      case 'engagement':
        filteredFormats = filteredFormats.filter(f =>
          ['Social', 'Video'].includes(f.category)
        )
        break
    }

    return filteredFormats
  }

  const getCompatibleFormats = (fileType, hasAnimation = false, hasVideo = false, hasAudio = false) => {
    return activeFormats.value.filter(format => {
      // Проверка типа файла
      if (!format.file_types.includes(fileType)) return false

      // Проверка требований к контенту
      if (hasVideo && !format.video_allowed) return false
      if (hasAnimation && !format.animation_allowed) return false
      if (hasAudio && !format.audio_allowed) return false

      return true
    })
  }

  const getFormatConstraints = (formatId) => {
    const format = getFormatById.value(formatId)
    if (!format) return null

    return {
      dimensions: format.dimensions,
      duration: format.duration,
      max_file_size: format.max_file_size,
      file_types: format.file_types,
      technical_specs: format.technical_specs,
      content_restrictions: {
        animation_allowed: format.animation_allowed,
        video_allowed: format.video_allowed,
        audio_allowed: format.audio_allowed,
        text_overlay_allowed: format.text_overlay_allowed,
        cta_required: format.cta_required
      }
    }
  }

  const isFileCompatible = (formatId, fileData) => {
    const format = getFormatById.value(formatId)
    if (!format) return false

    // Проверка типа файла
    if (!format.file_types.includes(fileData.file_type)) return false

    // Проверка размера
    if (format.max_file_size && fileData.file_size > format.max_file_size) return false

    // Проверка размеров
    if (format.dimensions && fileData.dimensions) {
      const [reqWidth, reqHeight] = format.dimensions.split('x').map(Number)
      const [fileWidth, fileHeight] = fileData.dimensions.split('x').map(Number)
      if (reqWidth !== fileWidth || reqHeight !== fileHeight) return false
    }

    // Проверка длительности
    if (format.duration && fileData.duration && fileData.duration > format.duration) return false

    return true
  }

  const getFormatsByFeature = (feature) => {
    const featureMap = {
      video: (f) => f.video_allowed,
      animation: (f) => f.animation_allowed,
      audio: (f) => f.audio_allowed,
      text_overlay: (f) => f.text_overlay_allowed,
      cta_required: (f) => f.cta_required
    }

    const filterFn = featureMap[feature]
    if (!filterFn) return []

    return activeFormats.value.filter(filterFn)
  }

  // Utilities
  const clearError = () => {
    error.value = null
  }

  const setCurrentFormat = (format) => {
    currentFormat.value = format
  }

  const clearCurrentFormat = () => {
    currentFormat.value = null
  }

  const reset = () => {
    formats.value = []
    currentFormat.value = null
    loading.value = false
    error.value = null
    categories.value = []
    platforms.value = []
    fileTypes.value = []
    pricingModels.value = []
    stats.value = {}
    recommendations.value = []
  }

  return {
    // State
    formats,
    currentFormat,
    loading,
    error,
    categories,
    platforms,
    fileTypes,
    pricingModels,
    stats,
    recommendations,

    // Getters
    activeFormats,
    formatsByCategory,
    formatsByPlatform,
    videoFormats,
    animationFormats,
    audioFormats,
    staticFormats,
    getFormatById,
    getFormatsForPlatform,
    getFormatsForCategory,

    // Actions
    fetchFormats,
    fetchFormat,
    createFormat,
    updateFormat,
    deleteFormat,
    fetchFormatsByCategory,
    fetchFormatsByPlatform,
    validateFile,
    fetchRecommendations,
    fetchCategories,
    fetchPlatforms,
    fetchFileTypes,
    fetchPricingModels,
    compareFormats,
    fetchStats,

    // Utility functions
    getFormatsForCampaign,
    getCompatibleFormats,
    getFormatConstraints,
    isFileCompatible,
    getFormatsByFeature,

    // Utilities
    clearError,
    setCurrentFormat,
    clearCurrentFormat,
    reset
  }
})