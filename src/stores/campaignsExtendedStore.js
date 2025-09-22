import { defineStore } from 'pinia'
import * as campaignsApi from '@/api/modules/campaignsExtended'

/**
 * Расширенный Store для управления рекламными кампаниями
 * Поддерживает полную иерархию: Кампания → Группа объявлений → Объявление
 * Включает все параметры из campaign_params.md
 */
export const useCampaignsExtendedStore = defineStore('campaignsExtended', {
  state: () => ({
    // Основные данные
    campaigns: [],
    adGroups: [],
    adCreatives: [],

    // Текущие выбранные элементы
    selectedCampaign: null,
    selectedAdGroup: null,
    selectedCreative: null,

    // Состояния загрузки
    loading: {
      campaigns: false,
      adGroups: false,
      creatives: false,
      hierarchy: false,
      stats: false,
      operations: false
    },

    // Ошибки
    errors: {
      campaigns: null,
      adGroups: null,
      creatives: null,
      hierarchy: null,
      stats: null,
      operations: null
    },

    // Фильтры и поиск
    filters: {
      campaigns: {
        status: null,
        channel: null,
        objective: null,
        campaign_category: null,
        phase: null,
        campaign_type: null,
        responsible_manager: null,
        product_line: null,
        date_from: null,
        date_to: null
      },
      adGroups: {
        status: null,
        optimization_goal: null
      },
      creatives: {
        status: null,
        creative_type: null
      }
    },

    // Результаты поиска
    searchResults: null,
    searchQuery: '',

    // Статистика и аналитика
    campaignsStats: null,
    performanceData: {},

    // Настройки интерфейса
    view: {
      mode: 'list', // 'list', 'cards', 'hierarchy'
      groupBy: null, // 'channel', 'objective', 'phase', 'manager'
      sortBy: 'updated_at',
      sortOrder: 'desc'
    },

    // Операции над кампаниями
    bulkOperations: {
      selectedItems: [],
      operation: null,
      inProgress: false
    }
  }),

  getters: {
    // Активные кампании
    activeCampaigns: (state) => {
      return state.campaigns.filter(campaign => campaign.status === 'active')
    },

    // Кампании по статусам
    campaignsByStatus: (state) => {
      const grouped = {}
      state.campaigns.forEach(campaign => {
        if (!grouped[campaign.status]) {
          grouped[campaign.status] = []
        }
        grouped[campaign.status].push(campaign)
      })
      return grouped
    },

    // Кампании по каналам
    campaignsByChannel: (state) => {
      const grouped = {}
      state.campaigns.forEach(campaign => {
        if (!grouped[campaign.channel]) {
          grouped[campaign.channel] = []
        }
        grouped[campaign.channel].push(campaign)
      })
      return grouped
    },

    // Кампании по фазам
    campaignsByPhase: (state) => {
      const grouped = {}
      state.campaigns.forEach(campaign => {
        const phase = campaign.phase || 'unknown'
        if (!grouped[phase]) {
          grouped[phase] = []
        }
        grouped[phase].push(campaign)
      })
      return grouped
    },

    // Группы объявлений для выбранной кампании
    adGroupsForSelectedCampaign: (state) => {
      if (!state.selectedCampaign) return []
      return state.adGroups.filter(group => group.campaign_id === state.selectedCampaign.campaign_id)
    },

    // Креативы для выбранной группы объявлений
    creativesForSelectedAdGroup: (state) => {
      if (!state.selectedAdGroup) return []
      return state.adCreatives.filter(creative => creative.ad_group_id === state.selectedAdGroup.ad_group_id)
    },

    // Общая статистика
    totalBudget: (state) => {
      return state.campaigns.reduce((total, campaign) => total + (campaign.budget_value || 0), 0)
    },

    // Статистика по производительности
    performanceSummary: (state) => {
      const summary = {
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalSpend: 0,
        avgCtr: 0,
        avgCpc: 0,
        avgRoas: 0
      }

      state.adCreatives.forEach(creative => {
        if (creative.performance_metrics) {
          summary.totalImpressions += creative.performance_metrics.impressions || 0
          summary.totalClicks += creative.performance_metrics.clicks || 0
          summary.totalConversions += creative.performance_metrics.conversions || 0
        }
      })

      if (summary.totalImpressions > 0) {
        summary.avgCtr = (summary.totalClicks / summary.totalImpressions) * 100
      }

      return summary
    },

    // Проверка состояния загрузки
    isLoading: (state) => {
      return Object.values(state.loading).some(loading => loading)
    },

    // Проверка наличия ошибок
    hasErrors: (state) => {
      return Object.values(state.errors).some(error => error !== null)
    },

    // Фильтрованные кампании
    filteredCampaigns: (state) => {
      let filtered = [...state.campaigns]

      Object.entries(state.filters.campaigns).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (key === 'date_from') {
            filtered = filtered.filter(campaign => new Date(campaign.start_date) >= new Date(value))
          } else if (key === 'date_to') {
            filtered = filtered.filter(campaign => {
              const endDate = campaign.end_date ? new Date(campaign.end_date) : new Date('2099-12-31')
              return endDate <= new Date(value)
            })
          } else {
            filtered = filtered.filter(campaign => campaign[key] === value)
          }
        }
      })

      return filtered
    }
  },

  actions: {
    // === КАМПАНИИ ===

    /**
     * Загрузить кампании
     */
    async loadCampaigns(filters = {}) {
      this.loading.campaigns = true
      this.errors.campaigns = null

      try {
        const combinedFilters = { ...this.filters.campaigns, ...filters }
        this.campaigns = await campaignsApi.getCampaignsExtended(combinedFilters)
      } catch (error) {
        this.errors.campaigns = error.message
        console.error('Ошибка загрузки кампаний:', error)
      } finally {
        this.loading.campaigns = false
      }
    },

    /**
     * Получить кампанию по ID
     */
    async getCampaign(campaignId) {
      try {
        const campaign = await campaignsApi.getCampaignExtended(campaignId)

        // Обновляем кампанию в списке если она там есть
        const index = this.campaigns.findIndex(c => c.campaign_id === campaignId)
        if (index !== -1) {
          this.campaigns[index] = campaign
        } else if (campaign) {
          this.campaigns.push(campaign)
        }

        return campaign
      } catch (error) {
        console.error('Ошибка получения кампании:', error)
        throw error
      }
    },

    /**
     * Создать кампанию
     */
    async createCampaign(campaignData) {
      this.loading.operations = true

      try {
        // Валидация данных
        const validation = campaignsApi.validateCampaignData(campaignData)
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '))
        }

        const newCampaign = await campaignsApi.createCampaignExtended(campaignData)
        this.campaigns.unshift(newCampaign)
        return newCampaign
      } catch (error) {
        this.errors.operations = error.message
        console.error('Ошибка создания кампании:', error)
        throw error
      } finally {
        this.loading.operations = false
      }
    },

    /**
     * Обновить кампанию
     */
    async updateCampaign(campaignId, updateData) {
      this.loading.operations = true

      try {
        const updatedCampaign = await campaignsApi.updateCampaignExtended(campaignId, updateData)

        if (updatedCampaign) {
          const index = this.campaigns.findIndex(c => c.campaign_id === campaignId)
          if (index !== -1) {
            this.campaigns[index] = updatedCampaign
          }

          // Обновляем выбранную кампанию если это она
          if (this.selectedCampaign?.campaign_id === campaignId) {
            this.selectedCampaign = updatedCampaign
          }
        }

        return updatedCampaign
      } catch (error) {
        this.errors.operations = error.message
        console.error('Ошибка обновления кампании:', error)
        throw error
      } finally {
        this.loading.operations = false
      }
    },

    /**
     * Удалить кампанию
     */
    async deleteCampaign(campaignId) {
      this.loading.operations = true

      try {
        const result = await campaignsApi.deleteCampaignExtended(campaignId)

        if (result) {
          this.campaigns = this.campaigns.filter(c => c.campaign_id !== campaignId)

          // Очищаем выбор если удалили выбранную кампанию
          if (this.selectedCampaign?.campaign_id === campaignId) {
            this.selectedCampaign = null
          }
        }

        return result
      } catch (error) {
        this.errors.operations = error.message
        console.error('Ошибка удаления кампании:', error)
        throw error
      } finally {
        this.loading.operations = false
      }
    },

    /**
     * Дублировать кампанию
     */
    async duplicateCampaign(campaignId, options = {}) {
      this.loading.operations = true

      try {
        const newCampaign = await campaignsApi.duplicateCampaign(campaignId, options)
        this.campaigns.unshift(newCampaign)
        return newCampaign
      } catch (error) {
        this.errors.operations = error.message
        console.error('Ошибка дублирования кампании:', error)
        throw error
      } finally {
        this.loading.operations = false
      }
    },

    // === ГРУППЫ ОБЪЯВЛЕНИЙ ===

    /**
     * Загрузить группы объявлений
     */
    async loadAdGroups(filters = {}) {
      this.loading.adGroups = true
      this.errors.adGroups = null

      try {
        const combinedFilters = { ...this.filters.adGroups, ...filters }
        this.adGroups = await campaignsApi.getAdGroups(combinedFilters)
      } catch (error) {
        this.errors.adGroups = error.message
        console.error('Ошибка загрузки групп объявлений:', error)
      } finally {
        this.loading.adGroups = false
      }
    },

    /**
     * Создать группу объявлений
     */
    async createAdGroup(adGroupData) {
      try {
        const newAdGroup = await campaignsApi.createAdGroup(adGroupData)
        this.adGroups.push(newAdGroup)
        return newAdGroup
      } catch (error) {
        console.error('Ошибка создания группы объявлений:', error)
        throw error
      }
    },

    /**
     * Обновить группу объявлений
     */
    async updateAdGroup(adGroupId, updateData) {
      try {
        const updatedAdGroup = await campaignsApi.updateAdGroup(adGroupId, updateData)

        if (updatedAdGroup) {
          const index = this.adGroups.findIndex(g => g.ad_group_id === adGroupId)
          if (index !== -1) {
            this.adGroups[index] = updatedAdGroup
          }
        }

        return updatedAdGroup
      } catch (error) {
        console.error('Ошибка обновления группы объявлений:', error)
        throw error
      }
    },

    /**
     * Удалить группу объявлений
     */
    async deleteAdGroup(adGroupId) {
      try {
        const result = await campaignsApi.deleteAdGroup(adGroupId)

        if (result) {
          this.adGroups = this.adGroups.filter(g => g.ad_group_id !== adGroupId)
        }

        return result
      } catch (error) {
        console.error('Ошибка удаления группы объявлений:', error)
        throw error
      }
    },

    // === ОБЪЯВЛЕНИЯ (КРЕАТИВЫ) ===

    /**
     * Загрузить объявления
     */
    async loadAdCreatives(filters = {}) {
      this.loading.creatives = true
      this.errors.creatives = null

      try {
        const combinedFilters = { ...this.filters.creatives, ...filters }
        this.adCreatives = await campaignsApi.getAdCreatives(combinedFilters)
      } catch (error) {
        this.errors.creatives = error.message
        console.error('Ошибка загрузки объявлений:', error)
      } finally {
        this.loading.creatives = false
      }
    },

    /**
     * Создать объявление
     */
    async createAdCreative(creativeData) {
      try {
        const newCreative = await campaignsApi.createAdCreative(creativeData)
        this.adCreatives.push(newCreative)
        return newCreative
      } catch (error) {
        console.error('Ошибка создания объявления:', error)
        throw error
      }
    },

    /**
     * Обновить объявление
     */
    async updateAdCreative(creativeId, updateData) {
      try {
        const updatedCreative = await campaignsApi.updateAdCreative(creativeId, updateData)

        if (updatedCreative) {
          const index = this.adCreatives.findIndex(c => c.creative_id === creativeId)
          if (index !== -1) {
            this.adCreatives[index] = updatedCreative
          }
        }

        return updatedCreative
      } catch (error) {
        console.error('Ошибка обновления объявления:', error)
        throw error
      }
    },

    /**
     * Удалить объявление
     */
    async deleteAdCreative(creativeId) {
      try {
        const result = await campaignsApi.deleteAdCreative(creativeId)

        if (result) {
          this.adCreatives = this.adCreatives.filter(c => c.creative_id !== creativeId)
        }

        return result
      } catch (error) {
        console.error('Ошибка удаления объявления:', error)
        throw error
      }
    },

    // === ИЕРАРХИЯ ===

    /**
     * Загрузить полную иерархию кампании
     */
    async loadCampaignHierarchy(campaignId) {
      this.loading.hierarchy = true
      this.errors.hierarchy = null

      try {
        const hierarchy = await campaignsApi.getCampaignHierarchy(campaignId)

        if (hierarchy) {
          // Обновляем данные в store
          const campaignIndex = this.campaigns.findIndex(c => c.campaign_id === campaignId)
          if (campaignIndex !== -1) {
            this.campaigns[campaignIndex] = hierarchy
          }

          // Обновляем группы объявлений
          hierarchy.ad_groups?.forEach(adGroup => {
            const groupIndex = this.adGroups.findIndex(g => g.ad_group_id === adGroup.ad_group_id)
            if (groupIndex !== -1) {
              this.adGroups[groupIndex] = adGroup
            } else {
              this.adGroups.push(adGroup)
            }

            // Обновляем креативы
            adGroup.creatives?.forEach(creative => {
              const creativeIndex = this.adCreatives.findIndex(c => c.creative_id === creative.creative_id)
              if (creativeIndex !== -1) {
                this.adCreatives[creativeIndex] = creative
              } else {
                this.adCreatives.push(creative)
              }
            })
          })
        }

        return hierarchy
      } catch (error) {
        this.errors.hierarchy = error.message
        console.error('Ошибка загрузки иерархии кампании:', error)
      } finally {
        this.loading.hierarchy = false
      }
    },

    // === ПОИСК И ФИЛЬТРАЦИЯ ===

    /**
     * Поиск кампаний
     */
    async searchCampaigns(query) {
      try {
        this.searchQuery = query
        this.searchResults = await campaignsApi.searchCampaigns(query)
        return this.searchResults
      } catch (error) {
        console.error('Ошибка поиска кампаний:', error)
        throw error
      }
    },

    /**
     * Очистить поиск
     */
    clearSearch() {
      this.searchQuery = ''
      this.searchResults = null
    },

    /**
     * Установить фильтры для кампаний
     */
    setCampaignFilters(filters) {
      this.filters.campaigns = { ...this.filters.campaigns, ...filters }
    },

    /**
     * Очистить фильтры
     */
    clearFilters() {
      this.filters.campaigns = {
        status: null,
        channel: null,
        objective: null,
        campaign_category: null,
        phase: null,
        campaign_type: null,
        responsible_manager: null,
        product_line: null,
        date_from: null,
        date_to: null
      }
    },

    // === СТАТИСТИКА ===

    /**
     * Загрузить статистику кампаний
     */
    async loadCampaignsStats(filters = {}) {
      this.loading.stats = true
      this.errors.stats = null

      try {
        this.campaignsStats = await campaignsApi.getCampaignsStats(filters)
      } catch (error) {
        this.errors.stats = error.message
        console.error('Ошибка загрузки статистики кампаний:', error)
      } finally {
        this.loading.stats = false
      }
    },

    // === ВЫБОР ЭЛЕМЕНТОВ ===

    /**
     * Выбрать кампанию
     */
    selectCampaign(campaign) {
      this.selectedCampaign = campaign
      this.selectedAdGroup = null
      this.selectedCreative = null
    },

    /**
     * Выбрать группу объявлений
     */
    selectAdGroup(adGroup) {
      this.selectedAdGroup = adGroup
      this.selectedCreative = null
    },

    /**
     * Выбрать объявление
     */
    selectCreative(creative) {
      this.selectedCreative = creative
    },

    /**
     * Очистить выбор
     */
    clearSelection() {
      this.selectedCampaign = null
      this.selectedAdGroup = null
      this.selectedCreative = null
    },

    // === МАССОВЫЕ ОПЕРАЦИИ ===

    /**
     * Добавить элементы для массовых операций
     */
    addToBulkOperation(items) {
      items.forEach(item => {
        if (!this.bulkOperations.selectedItems.find(selected => selected.id === item.id)) {
          this.bulkOperations.selectedItems.push(item)
        }
      })
    },

    /**
     * Удалить из массовых операций
     */
    removeFromBulkOperation(items) {
      items.forEach(item => {
        this.bulkOperations.selectedItems = this.bulkOperations.selectedItems.filter(
          selected => selected.id !== item.id
        )
      })
    },

    /**
     * Очистить массовые операции
     */
    clearBulkOperations() {
      this.bulkOperations.selectedItems = []
      this.bulkOperations.operation = null
    },

    // === НАСТРОЙКИ ИНТЕРФЕЙСА ===

    /**
     * Установить режим просмотра
     */
    setViewMode(mode) {
      this.view.mode = mode
    },

    /**
     * Установить группировку
     */
    setGroupBy(groupBy) {
      this.view.groupBy = groupBy
    },

    /**
     * Установить сортировку
     */
    setSorting(sortBy, sortOrder = 'desc') {
      this.view.sortBy = sortBy
      this.view.sortOrder = sortOrder
    },

    // === ИНИЦИАЛИЗАЦИЯ ===

    /**
     * Инициализировать store
     */
    async initialize() {
      await Promise.all([
        this.loadCampaigns(),
        this.loadCampaignsStats()
      ])
    },

    /**
     * Очистить store
     */
    reset() {
      this.$reset()
    }
  }
})