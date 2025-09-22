/**
 * Pinia store для работы с атрибутами
 * Управляет Attributes, AttributeListOptions, ActivityAttributeValues, AttributeDependencies
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as attributesApi from '@/api/modules/attributes'

export const useAttributesStore = defineStore('attributes', () => {
  // State
  const attributes = ref([])
  const attributeListOptions = ref([])
  const activityAttributeValues = ref([])
  const attributeDependencies = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const attributesByType = computed(() => {
    const grouped = {}
    attributes.value.forEach(attr => {
      if (!grouped[attr.attribute_type]) {
        grouped[attr.attribute_type] = []
      }
      grouped[attr.attribute_type].push(attr)
    })
    return grouped
  })

  const attributeOptionsMap = computed(() => {
    const map = {}
    attributeListOptions.value.forEach(option => {
      if (!map[option.attribute_id]) {
        map[option.attribute_id] = []
      }
      map[option.attribute_id].push(option)
    })
    return map
  })

  const activityAttributesMap = computed(() => {
    const map = {}
    activityAttributeValues.value.forEach(value => {
      if (!map[value.activity_id]) {
        map[value.activity_id] = {}
      }
      map[value.activity_id][value.attribute_id] = value
    })
    return map
  })

  // Actions
  const fetchAttributes = async (filters = {}) => {
    try {
      isLoading.value = true
      error.value = null
      attributes.value = await attributesApi.getAttributes(filters)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching attributes:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchAttributeOptions = async (attributeId) => {
    try {
      const options = await attributesApi.getAttributeOptions(attributeId)
      attributeListOptions.value.push(...options)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching attribute options:', err)
    }
  }

  const fetchActivityAttributeValues = async (activityId) => {
    try {
      const values = await attributesApi.getActivityAttributeValues(activityId)
      activityAttributeValues.value = activityAttributeValues.value.filter(
        v => v.activity_id !== activityId
      )
      activityAttributeValues.value.push(...values)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching activity attribute values:', err)
    }
  }

  const createAttribute = async (attributeData) => {
    try {
      isLoading.value = true
      const newAttribute = await attributesApi.createAttribute(attributeData)
      attributes.value.push(newAttribute)
      return newAttribute
    } catch (err) {
      error.value = err.message
      console.error('Error creating attribute:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateAttribute = async (attributeId, attributeData) => {
    try {
      isLoading.value = true
      const updatedAttribute = await attributesApi.updateAttribute(attributeId, attributeData)
      const index = attributes.value.findIndex(a => a.attribute_id === attributeId)
      if (index !== -1) {
        attributes.value[index] = updatedAttribute
      }
      return updatedAttribute
    } catch (err) {
      error.value = err.message
      console.error('Error updating attribute:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateActivityAttributeValue = async (activityId, attributeId, value) => {
    try {
      const updatedValue = await attributesApi.updateActivityAttributeValue(
        activityId,
        attributeId,
        value
      )

      const existingIndex = activityAttributeValues.value.findIndex(
        v => v.activity_id === activityId && v.attribute_id === attributeId
      )

      if (existingIndex !== -1) {
        activityAttributeValues.value[existingIndex] = updatedValue
      } else {
        activityAttributeValues.value.push(updatedValue)
      }

      return updatedValue
    } catch (err) {
      error.value = err.message
      console.error('Error updating activity attribute value:', err)
      throw err
    }
  }

  const createAttributeOption = async (attributeId, optionData) => {
    try {
      const newOption = await attributesApi.createAttributeOption(attributeId, optionData)
      attributeListOptions.value.push(newOption)
      return newOption
    } catch (err) {
      error.value = err.message
      console.error('Error creating attribute option:', err)
      throw err
    }
  }

  const fetchAttributeDependencies = async () => {
    try {
      attributeDependencies.value = await attributesApi.getAttributeDependencies()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching attribute dependencies:', err)
    }
  }

  const validateAttributeValue = (attributeId, value) => {
    const attribute = attributes.value.find(a => a.attribute_id === attributeId)
    if (!attribute) return { valid: false, error: 'Атрибут не найден' }

    // Проверка обязательности
    if (attribute.is_required && (!value || value === '')) {
      return { valid: false, error: 'Поле обязательно для заполнения' }
    }

    // Проверка типа данных
    switch (attribute.data_type) {
      case 'integer':
        if (value && !Number.isInteger(Number(value))) {
          return { valid: false, error: 'Должно быть целым числом' }
        }
        break
      case 'decimal':
        if (value && isNaN(Number(value))) {
          return { valid: false, error: 'Должно быть числом' }
        }
        break
      case 'date':
        if (value && isNaN(Date.parse(value))) {
          return { valid: false, error: 'Неверный формат даты' }
        }
        break
    }

    return { valid: true }
  }

  const getAttributeOptionsFor = (attributeId) => {
    return attributeOptionsMap.value[attributeId] || []
  }

  const getActivityAttributes = (activityId) => {
    return activityAttributesMap.value[activityId] || {}
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    attributes.value = []
    attributeListOptions.value = []
    activityAttributeValues.value = []
    attributeDependencies.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    attributes,
    attributeListOptions,
    activityAttributeValues,
    attributeDependencies,
    isLoading,
    error,

    // Computed
    attributesByType,
    attributeOptionsMap,
    activityAttributesMap,

    // Actions
    fetchAttributes,
    fetchAttributeOptions,
    fetchActivityAttributeValues,
    createAttribute,
    updateAttribute,
    updateActivityAttributeValue,
    createAttributeOption,
    fetchAttributeDependencies,
    validateAttributeValue,
    getAttributeOptionsFor,
    getActivityAttributes,
    clearError,
    resetStore
  }
})