import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productsApi } from '@/api/modules/products'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const categories = ref([])
  const stats = ref({})

  // Getters
  const activeProducts = computed(() =>
    products.value.filter(product => product.status === 'active')
  )

  const productsByCategory = computed(() => {
    const grouped = {}
    products.value.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = []
      }
      grouped[product.category].push(product)
    })
    return grouped
  })

  const getProductById = computed(() => {
    return (productId) => products.value.find(p => p.product_id === productId)
  })

  // Actions
  const fetchProducts = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await productsApi.getProducts(filters)
      products.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchProduct = async (productId) => {
    loading.value = true
    error.value = null
    try {
      const response = await productsApi.getProduct(productId)
      currentProduct.value = response.data

      // Обновить продукт в списке, если он уже загружен
      const index = products.value.findIndex(p => p.product_id === productId)
      if (index !== -1) {
        products.value[index] = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData) => {
    loading.value = true
    error.value = null
    try {
      const response = await productsApi.createProduct(productData)
      products.value.push(response.data)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (productId, updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await productsApi.updateProduct(productId, updates)

      // Обновить продукт в списке
      const index = products.value.findIndex(p => p.product_id === productId)
      if (index !== -1) {
        products.value[index] = response.data
      }

      // Обновить текущий продукт, если это он
      if (currentProduct.value?.product_id === productId) {
        currentProduct.value = response.data
      }

      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (productId) => {
    loading.value = true
    error.value = null
    try {
      const response = await productsApi.deleteProduct(productId)

      // Удалить продукт из списка
      const index = products.value.findIndex(p => p.product_id === productId)
      if (index !== -1) {
        products.value.splice(index, 1)
      }

      // Очистить текущий продукт, если это он
      if (currentProduct.value?.product_id === productId) {
        currentProduct.value = null
      }

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
      const response = await productsApi.getProductCategories()
      categories.value = response.data
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
      const response = await productsApi.getProductStats()
      stats.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utilities
  const clearError = () => {
    error.value = null
  }

  const setCurrentProduct = (product) => {
    currentProduct.value = product
  }

  const clearCurrentProduct = () => {
    currentProduct.value = null
  }

  const reset = () => {
    products.value = []
    currentProduct.value = null
    loading.value = false
    error.value = null
    categories.value = []
    stats.value = {}
  }

  return {
    // State
    products,
    currentProduct,
    loading,
    error,
    categories,
    stats,

    // Getters
    activeProducts,
    productsByCategory,
    getProductById,

    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    fetchStats,

    // Utilities
    clearError,
    setCurrentProduct,
    clearCurrentProduct,
    reset
  }
})