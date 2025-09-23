import productsData from '../mocks/products.mock.json'

// Имитация задержки сети
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

export const productsApi = {
  // Получить все продукты
  async getProducts(filters = {}) {
    await delay()
    let filtered = [...productsData]

    // Фильтрация по статусу
    if (filters.status) {
      filtered = filtered.filter(product => product.status === filters.status)
    }

    // Фильтрация по категории
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category)
    }

    // Фильтрация по владельцу
    if (filters.product_owner_id) {
      filtered = filtered.filter(product => product.product_owner_id === filters.product_owner_id)
    }

    // Поиск по названию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      )
    }

    return {
      data: filtered,
      total: filtered.length,
      page: filters.page || 1,
      limit: filters.limit || 50
    }
  },

  // Получить продукт по ID
  async getProduct(productId) {
    await delay()
    const product = productsData.find(p => p.product_id === productId)
    if (!product) {
      throw new Error(`Продукт с ID ${productId} не найден`)
    }
    return { data: product }
  },

  // Создать новый продукт
  async createProduct(productData) {
    await delay()
    const newProduct = {
      product_id: `product_${Date.now()}`,
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // В реальном приложении здесь был бы API вызов
    console.log('Creating product:', newProduct)
    return { data: newProduct }
  },

  // Обновить продукт
  async updateProduct(productId, updates) {
    await delay()
    const productIndex = productsData.findIndex(p => p.product_id === productId)
    if (productIndex === -1) {
      throw new Error(`Продукт с ID ${productId} не найден`)
    }

    const updatedProduct = {
      ...productsData[productIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    // В реальном приложении здесь был бы API вызов
    console.log('Updating product:', updatedProduct)
    return { data: updatedProduct }
  },

  // Удалить продукт
  async deleteProduct(productId) {
    await delay()
    const productIndex = productsData.findIndex(p => p.product_id === productId)
    if (productIndex === -1) {
      throw new Error(`Продукт с ID ${productId} не найден`)
    }

    // В реальном приложении здесь был бы API вызов
    console.log('Deleting product:', productId)
    return { success: true }
  },

  // Получить категории продуктов
  async getProductCategories() {
    await delay()
    const categories = [...new Set(productsData.map(p => p.category))]
    return { data: categories }
  },

  // Получить статистику по продуктам
  async getProductStats() {
    await delay()
    const stats = {
      total: productsData.length,
      active: productsData.filter(p => p.status === 'active').length,
      inactive: productsData.filter(p => p.status === 'inactive').length,
      development: productsData.filter(p => p.status === 'development').length,
      by_category: {}
    }

    // Группировка по категориям
    productsData.forEach(product => {
      if (!stats.by_category[product.category]) {
        stats.by_category[product.category] = 0
      }
      stats.by_category[product.category]++
    })

    return { data: stats }
  }
}