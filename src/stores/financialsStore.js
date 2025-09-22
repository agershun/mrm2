import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useFinancialsStore = defineStore('financials', () => {
  const appStore = useAppStore()

  // State
  const actuals = ref([])
  const actualsSplits = ref([])
  const purchaseOrders = ref([])
  const poSplits = ref([])
  const costs = ref([])
  const cellComments = ref([])
  const auditTrail = ref([])
  const selectedActual = ref(null)
  const selectedPO = ref(null)
  const isLoading = ref(false)
  const filters = ref({})

  // Getters
  const unmappedActuals = computed(() => {
    return actuals.value.filter(actual => !actual.is_mapped)
  })

  const mappedActuals = computed(() => {
    return actuals.value.filter(actual => actual.is_mapped)
  })

  const unmappedPOs = computed(() => {
    return purchaseOrders.value.filter(po => !po.is_mapped)
  })

  const mappedPOs = computed(() => {
    return purchaseOrders.value.filter(po => po.is_mapped)
  })

  const filteredActuals = computed(() => {
    let filtered = actuals.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(actual =>
        actual.vendor?.toLowerCase().includes(search) ||
        actual.description?.toLowerCase().includes(search) ||
        actual.po_number?.toLowerCase().includes(search) ||
        actual.invoice_number?.toLowerCase().includes(search)
      )
    }

    if (filters.value.mapped !== undefined) {
      filtered = filtered.filter(actual => actual.is_mapped === filters.value.mapped)
    }

    if (filters.value.dateFrom) {
      filtered = filtered.filter(actual =>
        new Date(actual.transaction_date) >= new Date(filters.value.dateFrom)
      )
    }

    if (filters.value.dateTo) {
      filtered = filtered.filter(actual =>
        new Date(actual.transaction_date) <= new Date(filters.value.dateTo)
      )
    }

    return filtered
  })

  const filteredPOs = computed(() => {
    let filtered = purchaseOrders.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(po =>
        po.vendor_name?.toLowerCase().includes(search) ||
        po.description?.toLowerCase().includes(search) ||
        po.po_number?.toLowerCase().includes(search)
      )
    }

    if (filters.value.mapped !== undefined) {
      filtered = filtered.filter(po => po.is_mapped === filters.value.mapped)
    }

    return filtered
  })

  const totalActualsAmount = computed(() => {
    return actuals.value.reduce((sum, actual) => sum + (actual.amount || 0), 0)
  })

  const totalPOsAmount = computed(() => {
    return purchaseOrders.value.reduce((sum, po) => sum + (po.amount || 0), 0)
  })

  // Actions - Actuals
  const fetchActuals = async (filterParams = {}) => {
    try {
      isLoading.value = true
      console.log('[FinancialsStore] Fetching actuals...')
      const data = await api.financials.getActuals(filterParams)
      console.log('[FinancialsStore] Received actuals:', data)
      actuals.value = data || []
    } catch (error) {
      console.error('[FinancialsStore] Error fetching actuals:', error)
      appStore.showError('Ошибка загрузки фактических расходов: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const createActual = async (actualData) => {
    try {
      isLoading.value = true
      console.log('[FinancialsStore] Creating actual:', actualData)
      const newActual = await api.financials.createActual(actualData)
      actuals.value.push(newActual)
      appStore.showSuccess('Фактический расход создан успешно')
      return newActual
    } catch (error) {
      console.error('[FinancialsStore] Error creating actual:', error)
      appStore.showError('Ошибка создания фактического расхода: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const importActuals = async (data, options = {}) => {
    try {
      isLoading.value = true
      console.log('[FinancialsStore] Importing actuals...')
      const result = await api.financials.importActuals(data, options)
      await fetchActuals() // Refresh data after import
      appStore.showSuccess(`Импорт завершен: обработано ${result.imported_count} записей`)
      return result
    } catch (error) {
      console.error('[FinancialsStore] Error importing actuals:', error)
      appStore.showError('Ошибка импорта фактических расходов: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const mapActual = async (actualId, investmentId) => {
    try {
      console.log('[FinancialsStore] Mapping actual to investment:', { actualId, investmentId })
      await api.financials.mapActual(actualId, investmentId)

      const actual = actuals.value.find(a => a.actual_id === actualId)
      if (actual) {
        actual.is_mapped = true
        actual.investment_id = investmentId
      }

      appStore.showSuccess('Фактический расход привязан к статье бюджета')
    } catch (error) {
      console.error('[FinancialsStore] Error mapping actual:', error)
      appStore.showError('Ошибка привязки фактического расхода: ' + error.message)
      throw error
    }
  }

  const unmapActual = async (actualId) => {
    try {
      console.log('[FinancialsStore] Unmapping actual:', actualId)
      await api.financials.unmapActual(actualId)

      const actual = actuals.value.find(a => a.actual_id === actualId)
      if (actual) {
        actual.is_mapped = false
        actual.investment_id = null
      }

      appStore.showSuccess('Фактический расход отвязан от статьи бюджета')
    } catch (error) {
      console.error('[FinancialsStore] Error unmapping actual:', error)
      appStore.showError('Ошибка отвязки фактического расхода: ' + error.message)
      throw error
    }
  }

  // Actions - Purchase Orders
  const fetchPurchaseOrders = async (filterParams = {}) => {
    try {
      isLoading.value = true
      console.log('[FinancialsStore] Fetching purchase orders...')
      const data = await api.financials.getPurchaseOrders(filterParams)
      console.log('[FinancialsStore] Received purchase orders:', data)
      purchaseOrders.value = data || []
    } catch (error) {
      console.error('[FinancialsStore] Error fetching purchase orders:', error)
      appStore.showError('Ошибка загрузки заказов на закупку: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const createPurchaseOrder = async (poData) => {
    try {
      isLoading.value = true
      console.log('[FinancialsStore] Creating purchase order:', poData)
      const newPO = await api.financials.createPurchaseOrder(poData)
      purchaseOrders.value.push(newPO)
      appStore.showSuccess('Заказ на закупку создан успешно')
      return newPO
    } catch (error) {
      console.error('[FinancialsStore] Error creating purchase order:', error)
      appStore.showError('Ошибка создания заказа на закупку: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updatePurchaseOrder = async (poId, updateData) => {
    try {
      isLoading.value = true
      const updatedPO = await api.financials.updatePurchaseOrder(poId, updateData)

      const index = purchaseOrders.value.findIndex(po => po.po_id === poId)
      if (index !== -1) {
        purchaseOrders.value[index] = { ...purchaseOrders.value[index], ...updatedPO }
      }

      appStore.showSuccess('Заказ на закупку обновлен')
      return updatedPO
    } catch (error) {
      console.error('[FinancialsStore] Error updating purchase order:', error)
      appStore.showError('Ошибка обновления заказа на закупку: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deletePurchaseOrder = async (poId) => {
    try {
      isLoading.value = true
      await api.financials.deletePurchaseOrder(poId)

      purchaseOrders.value = purchaseOrders.value.filter(po => po.po_id !== poId)

      if (selectedPO.value === poId) {
        selectedPO.value = null
      }

      appStore.showSuccess('Заказ на закупку удален')
    } catch (error) {
      console.error('[FinancialsStore] Error deleting purchase order:', error)
      appStore.showError('Ошибка удаления заказа на закупку: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const importPurchaseOrders = async (data, options = {}) => {
    try {
      isLoading.value = true
      console.log('[FinancialsStore] Importing purchase orders...')
      const result = await api.financials.importPurchaseOrders(data, options)
      await fetchPurchaseOrders() // Refresh data after import
      appStore.showSuccess(`Импорт завершен: обработано ${result.imported_count} записей`)
      return result
    } catch (error) {
      console.error('[FinancialsStore] Error importing purchase orders:', error)
      appStore.showError('Ошибка импорта заказов на закупку: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const mapPurchaseOrder = async (poId, investmentId) => {
    try {
      console.log('[FinancialsStore] Mapping PO to investment:', { poId, investmentId })
      await api.financials.mapPurchaseOrder(poId, investmentId)

      const po = purchaseOrders.value.find(p => p.po_id === poId)
      if (po) {
        po.is_mapped = true
        po.investment_id = investmentId
      }

      appStore.showSuccess('Заказ на закупку привязан к статье бюджета')
    } catch (error) {
      console.error('[FinancialsStore] Error mapping purchase order:', error)
      appStore.showError('Ошибка привязки заказа на закупку: ' + error.message)
      throw error
    }
  }

  const unmapPurchaseOrder = async (poId) => {
    try {
      console.log('[FinancialsStore] Unmapping PO:', poId)
      await api.financials.unmapPurchaseOrder(poId)

      const po = purchaseOrders.value.find(p => p.po_id === poId)
      if (po) {
        po.is_mapped = false
        po.investment_id = null
      }

      appStore.showSuccess('Заказ на закупку отвязан от статьи бюджета')
    } catch (error) {
      console.error('[FinancialsStore] Error unmapping purchase order:', error)
      appStore.showError('Ошибка отвязки заказа на закупку: ' + error.message)
      throw error
    }
  }

  // Actions - Splits
  const fetchActualSplits = async (actualId) => {
    try {
      console.log('[FinancialsStore] Fetching actual splits for:', actualId)
      const data = await api.financials.getActualSplits(actualId)
      actualsSplits.value = data || []
      return data
    } catch (error) {
      console.error('[FinancialsStore] Error fetching actual splits:', error)
      appStore.showError('Ошибка загрузки разделения фактических расходов: ' + error.message)
      throw error
    }
  }

  const fetchPOSplits = async (poId) => {
    try {
      console.log('[FinancialsStore] Fetching PO splits for:', poId)
      const data = await api.financials.getPurchaseOrderSplits(poId)
      poSplits.value = data || []
      return data
    } catch (error) {
      console.error('[FinancialsStore] Error fetching PO splits:', error)
      appStore.showError('Ошибка загрузки разделения заказов на закупку: ' + error.message)
      throw error
    }
  }

  const splitPurchaseOrder = async (poId, splitData) => {
    try {
      console.log('[FinancialsStore] Splitting purchase order:', { poId, splitData })
      await api.financials.splitPurchaseOrder(poId, splitData)
      await fetchPOSplits(poId) // Refresh splits after update
      appStore.showSuccess('Разделение заказа на закупку сохранено')
    } catch (error) {
      console.error('[FinancialsStore] Error splitting purchase order:', error)
      appStore.showError('Ошибка разделения заказа на закупку: ' + error.message)
      throw error
    }
  }

  // Actions - Costs
  const fetchActivityCosts = async (activityId) => {
    try {
      console.log('[FinancialsStore] Fetching activity costs for:', activityId)
      const data = await api.financials.getActivityCosts(activityId)
      costs.value = data || []
      return data
    } catch (error) {
      console.error('[FinancialsStore] Error fetching activity costs:', error)
      appStore.showError('Ошибка загрузки затрат активности: ' + error.message)
      throw error
    }
  }

  const updateActivityCosts = async (activityId, costData) => {
    try {
      console.log('[FinancialsStore] Updating activity costs:', { activityId, costData })
      await api.financials.updateActivityCosts(activityId, costData)
      await fetchActivityCosts(activityId) // Refresh costs after update
      appStore.showSuccess('Затраты активности обновлены')
    } catch (error) {
      console.error('[FinancialsStore] Error updating activity costs:', error)
      appStore.showError('Ошибка обновления затрат активности: ' + error.message)
      throw error
    }
  }

  // Actions - Comments
  const fetchCellComments = async (valueId) => {
    try {
      console.log('[FinancialsStore] Fetching cell comments for:', valueId)
      const data = await api.financials.getCellComments(valueId)
      cellComments.value = data || []
      return data
    } catch (error) {
      console.error('[FinancialsStore] Error fetching cell comments:', error)
      appStore.showError('Ошибка загрузки комментариев: ' + error.message)
      throw error
    }
  }

  const addCellComment = async (valueId, commentData) => {
    try {
      console.log('[FinancialsStore] Adding cell comment:', { valueId, commentData })
      await api.financials.addCellComment(valueId, commentData)
      await fetchCellComments(valueId) // Refresh comments after adding
      appStore.showSuccess('Комментарий добавлен')
    } catch (error) {
      console.error('[FinancialsStore] Error adding cell comment:', error)
      appStore.showError('Ошибка добавления комментария: ' + error.message)
      throw error
    }
  }

  const updateCellComment = async (commentId, commentData) => {
    try {
      console.log('[FinancialsStore] Updating cell comment:', { commentId, commentData })
      await api.financials.updateCellComment(commentId, commentData)

      const index = cellComments.value.findIndex(c => c.comment_id === commentId)
      if (index !== -1) {
        cellComments.value[index] = { ...cellComments.value[index], ...commentData }
      }

      appStore.showSuccess('Комментарий обновлен')
    } catch (error) {
      console.error('[FinancialsStore] Error updating cell comment:', error)
      appStore.showError('Ошибка обновления комментария: ' + error.message)
      throw error
    }
  }

  const deleteCellComment = async (commentId) => {
    try {
      console.log('[FinancialsStore] Deleting cell comment:', commentId)
      await api.financials.deleteCellComment(commentId)

      cellComments.value = cellComments.value.filter(c => c.comment_id !== commentId)

      appStore.showSuccess('Комментарий удален')
    } catch (error) {
      console.error('[FinancialsStore] Error deleting cell comment:', error)
      appStore.showError('Ошибка удаления комментария: ' + error.message)
      throw error
    }
  }

  // Actions - Audit Trail
  const fetchAuditTrail = async (objectId, objectType, filterParams = {}) => {
    try {
      console.log('[FinancialsStore] Fetching audit trail for:', { objectId, objectType })
      const data = await api.financials.getAuditTrail(objectId, objectType, filterParams)
      auditTrail.value = data || []
      return data
    } catch (error) {
      console.error('[FinancialsStore] Error fetching audit trail:', error)
      appStore.showError('Ошибка загрузки журнала аудита: ' + error.message)
      throw error
    }
  }

  // Actions - General
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const selectActual = (actualId) => {
    selectedActual.value = actualId
  }

  const selectPO = (poId) => {
    selectedPO.value = poId
  }

  const searchActuals = async (keyword) => {
    if (!keyword?.trim()) {
      await fetchActuals()
      return
    }

    try {
      isLoading.value = true
      const results = await api.financials.searchActuals(keyword)
      actuals.value = results || []
    } catch (error) {
      console.error('[FinancialsStore] Error searching actuals:', error)
      appStore.showError('Ошибка поиска: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const searchPurchaseOrders = async (keyword) => {
    if (!keyword?.trim()) {
      await fetchPurchaseOrders()
      return
    }

    try {
      isLoading.value = true
      const results = await api.financials.searchPurchaseOrders(keyword)
      purchaseOrders.value = results || []
    } catch (error) {
      console.error('[FinancialsStore] Error searching purchase orders:', error)
      appStore.showError('Ошибка поиска: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  // Инициализация
  const initialize = async () => {
    console.log('[FinancialsStore] Initializing...')
    try {
      await Promise.all([
        fetchActuals(),
        fetchPurchaseOrders()
      ])
      console.log('[FinancialsStore] Initialization completed successfully')
      console.log('[FinancialsStore] Actuals count:', actuals.value.length)
      console.log('[FinancialsStore] Purchase orders count:', purchaseOrders.value.length)
    } catch (error) {
      console.error('[FinancialsStore] Initialization failed:', error)
    }
  }

  return {
    // State
    actuals,
    actualsSplits,
    purchaseOrders,
    poSplits,
    costs,
    cellComments,
    auditTrail,
    selectedActual,
    selectedPO,
    isLoading,
    filters,

    // Getters
    unmappedActuals,
    mappedActuals,
    unmappedPOs,
    mappedPOs,
    filteredActuals,
    filteredPOs,
    totalActualsAmount,
    totalPOsAmount,

    // Actions
    fetchActuals,
    createActual,
    importActuals,
    mapActual,
    unmapActual,
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    importPurchaseOrders,
    mapPurchaseOrder,
    unmapPurchaseOrder,
    fetchActualSplits,
    fetchPOSplits,
    splitPurchaseOrder,
    fetchActivityCosts,
    updateActivityCosts,
    fetchCellComments,
    addCellComment,
    updateCellComment,
    deleteCellComment,
    fetchAuditTrail,
    setFilters,
    clearFilters,
    selectActual,
    selectPO,
    searchActuals,
    searchPurchaseOrders,
    initialize
  }
})