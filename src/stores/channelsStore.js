import { defineStore } from 'pinia'
import * as channelsApi from '@/api/modules/channels'

/**
 * Store для управления каналами трафика
 * Управляет категориями каналов, источниками трафика и детальными источниками
 */
export const useChannelsStore = defineStore('channels', {
  state: () => ({
    // Категории каналов
    channelCategories: [],

    // Источники трафика
    trafficSources: [],

    // Детальные источники трафика
    detailedTrafficSources: [],

    // Состояния загрузки
    loading: {
      categories: false,
      sources: false,
      detailedSources: false,
      hierarchy: false,
      stats: false
    },

    // Ошибки
    errors: {
      categories: null,
      sources: null,
      detailedSources: null,
      hierarchy: null,
      stats: null
    },

    // Кэшированные данные
    channelsHierarchy: [],
    channelsStats: null,

    // Фильтры и поиск
    filters: {
      categories: { is_active: true },
      sources: { is_active: true },
      detailedSources: { is_active: true }
    },
    searchResults: null,

    // Выбранные элементы
    selectedCategory: null,
    selectedSource: null,
    selectedDetailedSource: null
  }),

  getters: {
    // Активные категории каналов
    activeChannelCategories: (state) => {
      return state.channelCategories.filter(category => category.is_active)
    },

    // Активные источники трафика
    activeTrafficSources: (state) => {
      return state.trafficSources.filter(source => source.is_active)
    },

    // Активные детальные источники
    activeDetailedTrafficSources: (state) => {
      return state.detailedTrafficSources.filter(source => source.is_active)
    },

    // Источники по категории
    getSourcesByCategory: (state) => (categoryId) => {
      return state.trafficSources.filter(source => source.category_id === categoryId)
    },

    // Детальные источники по источнику
    getDetailedSourcesBySource: (state) => (sourceId) => {
      return state.detailedTrafficSources.filter(detailed => detailed.source_id === sourceId)
    },

    // Получить категорию по ID
    getCategoryById: (state) => (categoryId) => {
      return state.channelCategories.find(category => category.category_id === categoryId)
    },

    // Получить источник по ID
    getSourceById: (state) => (sourceId) => {
      return state.trafficSources.find(source => source.source_id === sourceId)
    },

    // Получить детальный источник по ID
    getDetailedSourceById: (state) => (detailedSourceId) => {
      return state.detailedTrafficSources.find(detailed => detailed.detailed_source_id === detailedSourceId)
    },

    // Проверка состояния загрузки
    isLoading: (state) => {
      return Object.values(state.loading).some(loading => loading)
    },

    // Проверка наличия ошибок
    hasErrors: (state) => {
      return Object.values(state.errors).some(error => error !== null)
    },

    // Статистика каналов
    getChannelsStatsSummary: (state) => {
      if (!state.channelsStats) return null

      return {
        totalChannels: state.channelsStats.total_categories + state.channelsStats.total_sources + state.channelsStats.total_detailed_sources,
        activeChannels: state.channelsStats.active_categories + state.channelsStats.active_sources + state.channelsStats.active_detailed_sources,
        categoriesCount: state.channelsStats.total_categories,
        sourcesCount: state.channelsStats.total_sources,
        detailedSourcesCount: state.channelsStats.total_detailed_sources
      }
    }
  },

  actions: {
    // === КАТЕГОРИИ КАНАЛОВ ===

    /**
     * Загрузить категории каналов
     */
    async loadChannelCategories() {
      this.loading.categories = true
      this.errors.categories = null

      try {
        this.channelCategories = await channelsApi.getChannelCategories()
      } catch (error) {
        this.errors.categories = error.message
        console.error('Ошибка загрузки категорий каналов:', error)
      } finally {
        this.loading.categories = false
      }
    },

    /**
     * Создать категорию канала
     */
    async createChannelCategory(categoryData) {
      try {
        const newCategory = await channelsApi.createChannelCategory(categoryData)
        this.channelCategories.push(newCategory)
        return newCategory
      } catch (error) {
        console.error('Ошибка создания категории канала:', error)
        throw error
      }
    },

    /**
     * Обновить категорию канала
     */
    async updateChannelCategory(categoryId, updateData) {
      try {
        const updatedCategory = await channelsApi.updateChannelCategory(categoryId, updateData)
        if (updatedCategory) {
          const index = this.channelCategories.findIndex(c => c.category_id === categoryId)
          if (index !== -1) {
            this.channelCategories[index] = updatedCategory
          }
        }
        return updatedCategory
      } catch (error) {
        console.error('Ошибка обновления категории канала:', error)
        throw error
      }
    },

    /**
     * Удалить категорию канала
     */
    async deleteChannelCategory(categoryId) {
      try {
        const result = await channelsApi.deleteChannelCategory(categoryId)
        if (result) {
          this.channelCategories = this.channelCategories.filter(c => c.category_id !== categoryId)
        }
        return result
      } catch (error) {
        console.error('Ошибка удаления категории канала:', error)
        throw error
      }
    },

    // === ИСТОЧНИКИ ТРАФИКА ===

    /**
     * Загрузить источники трафика
     */
    async loadTrafficSources(filters = {}) {
      this.loading.sources = true
      this.errors.sources = null

      try {
        const combinedFilters = { ...this.filters.sources, ...filters }
        this.trafficSources = await channelsApi.getTrafficSources(combinedFilters)
      } catch (error) {
        this.errors.sources = error.message
        console.error('Ошибка загрузки источников трафика:', error)
      } finally {
        this.loading.sources = false
      }
    },

    /**
     * Создать источник трафика
     */
    async createTrafficSource(sourceData) {
      try {
        const newSource = await channelsApi.createTrafficSource(sourceData)
        this.trafficSources.push(newSource)
        return newSource
      } catch (error) {
        console.error('Ошибка создания источника трафика:', error)
        throw error
      }
    },

    /**
     * Обновить источник трафика
     */
    async updateTrafficSource(sourceId, updateData) {
      try {
        const updatedSource = await channelsApi.updateTrafficSource(sourceId, updateData)
        if (updatedSource) {
          const index = this.trafficSources.findIndex(s => s.source_id === sourceId)
          if (index !== -1) {
            this.trafficSources[index] = updatedSource
          }
        }
        return updatedSource
      } catch (error) {
        console.error('Ошибка обновления источника трафика:', error)
        throw error
      }
    },

    /**
     * Удалить источник трафика
     */
    async deleteTrafficSource(sourceId) {
      try {
        const result = await channelsApi.deleteTrafficSource(sourceId)
        if (result) {
          this.trafficSources = this.trafficSources.filter(s => s.source_id !== sourceId)
        }
        return result
      } catch (error) {
        console.error('Ошибка удаления источника трафика:', error)
        throw error
      }
    },

    // === ДЕТАЛЬНЫЕ ИСТОЧНИКИ ТРАФИКА ===

    /**
     * Загрузить детальные источники трафика
     */
    async loadDetailedTrafficSources(filters = {}) {
      this.loading.detailedSources = true
      this.errors.detailedSources = null

      try {
        const combinedFilters = { ...this.filters.detailedSources, ...filters }
        this.detailedTrafficSources = await channelsApi.getDetailedTrafficSources(combinedFilters)
      } catch (error) {
        this.errors.detailedSources = error.message
        console.error('Ошибка загрузки детальных источников трафика:', error)
      } finally {
        this.loading.detailedSources = false
      }
    },

    /**
     * Создать детальный источник трафика
     */
    async createDetailedTrafficSource(sourceData) {
      try {
        const newSource = await channelsApi.createDetailedTrafficSource(sourceData)
        this.detailedTrafficSources.push(newSource)
        return newSource
      } catch (error) {
        console.error('Ошибка создания детального источника трафика:', error)
        throw error
      }
    },

    /**
     * Обновить детальный источник трафика
     */
    async updateDetailedTrafficSource(detailedSourceId, updateData) {
      try {
        const updatedSource = await channelsApi.updateDetailedTrafficSource(detailedSourceId, updateData)
        if (updatedSource) {
          const index = this.detailedTrafficSources.findIndex(s => s.detailed_source_id === detailedSourceId)
          if (index !== -1) {
            this.detailedTrafficSources[index] = updatedSource
          }
        }
        return updatedSource
      } catch (error) {
        console.error('Ошибка обновления детального источника трафика:', error)
        throw error
      }
    },

    /**
     * Удалить детальный источник трафика
     */
    async deleteDetailedTrafficSource(detailedSourceId) {
      try {
        const result = await channelsApi.deleteDetailedTrafficSource(detailedSourceId)
        if (result) {
          this.detailedTrafficSources = this.detailedTrafficSources.filter(s => s.detailed_source_id !== detailedSourceId)
        }
        return result
      } catch (error) {
        console.error('Ошибка удаления детального источника трафика:', error)
        throw error
      }
    },

    // === ИЕРАРХИЯ И ПОИСК ===

    /**
     * Загрузить полную иерархию каналов
     */
    async loadChannelsHierarchy() {
      this.loading.hierarchy = true
      this.errors.hierarchy = null

      try {
        this.channelsHierarchy = await channelsApi.getChannelsHierarchy()
      } catch (error) {
        this.errors.hierarchy = error.message
        console.error('Ошибка загрузки иерархии каналов:', error)
      } finally {
        this.loading.hierarchy = false
      }
    },

    /**
     * Поиск каналов
     */
    async searchChannels(query) {
      try {
        this.searchResults = await channelsApi.searchChannels(query)
        return this.searchResults
      } catch (error) {
        console.error('Ошибка поиска каналов:', error)
        throw error
      }
    },

    /**
     * Очистить результаты поиска
     */
    clearSearchResults() {
      this.searchResults = null
    },

    // === СТАТИСТИКА ===

    /**
     * Загрузить статистику каналов
     */
    async loadChannelsStats() {
      this.loading.stats = true
      this.errors.stats = null

      try {
        this.channelsStats = await channelsApi.getChannelsStats()
      } catch (error) {
        this.errors.stats = error.message
        console.error('Ошибка загрузки статистики каналов:', error)
      } finally {
        this.loading.stats = false
      }
    },

    // === ВЫБОР ЭЛЕМЕНТОВ ===

    /**
     * Выбрать категорию канала
     */
    selectCategory(category) {
      this.selectedCategory = category
      this.selectedSource = null
      this.selectedDetailedSource = null
    },

    /**
     * Выбрать источник трафика
     */
    selectSource(source) {
      this.selectedSource = source
      this.selectedDetailedSource = null
    },

    /**
     * Выбрать детальный источник трафика
     */
    selectDetailedSource(detailedSource) {
      this.selectedDetailedSource = detailedSource
    },

    /**
     * Очистить выбор
     */
    clearSelection() {
      this.selectedCategory = null
      this.selectedSource = null
      this.selectedDetailedSource = null
    },

    // === ФИЛЬТРЫ ===

    /**
     * Установить фильтры для категорий
     */
    setCategoriesFilters(filters) {
      this.filters.categories = { ...this.filters.categories, ...filters }
    },

    /**
     * Установить фильтры для источников
     */
    setSourcesFilters(filters) {
      this.filters.sources = { ...this.filters.sources, ...filters }
    },

    /**
     * Установить фильтры для детальных источников
     */
    setDetailedSourcesFilters(filters) {
      this.filters.detailedSources = { ...this.filters.detailedSources, ...filters }
    },

    /**
     * Сбросить все фильтры
     */
    resetFilters() {
      this.filters = {
        categories: { is_active: true },
        sources: { is_active: true },
        detailedSources: { is_active: true }
      }
    },

    // === ИНИЦИАЛИЗАЦИЯ ===

    /**
     * Инициализировать store - загрузить все основные данные
     */
    async initialize() {
      await Promise.all([
        this.loadChannelCategories(),
        this.loadTrafficSources(),
        this.loadDetailedTrafficSources(),
        this.loadChannelsStats()
      ])
    },

    /**
     * Очистить все данные store
     */
    reset() {
      this.$reset()
    }
  }
})