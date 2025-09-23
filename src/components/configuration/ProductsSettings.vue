<template>
  <div class="products-settings">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-package-variant</v-icon>
        Управление продуктами
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Добавить продукт
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Настройка продуктовых линий компании и их основных характеристик
        </p>

        <!-- Фильтры и поиск -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск продуктов"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedCategory"
              :items="categories"
              label="Категория"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedStatus"
              :items="statuses"
              label="Статус"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
        </v-row>

        <!-- Таблица продуктов -->
        <v-data-table
          :headers="headers"
          :items="filteredProducts"
          :loading="loading"
          item-key="product_id"
          @click:row="editProduct"
        >
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click.stop="editProduct(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click.stop="deleteProduct(item)"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Диалог создания/редактирования продукта -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ editingProduct ? 'Редактирование продукта' : 'Новый продукт' }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Название продукта"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.category"
                  :items="categoryOptions"
                  label="Категория"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Описание"
                  :rules="[rules.required]"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.product_owner_id"
                  :items="owners"
                  item-title="name"
                  item-value="id"
                  label="Владелец продукта"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.status"
                  :items="statusOptions"
                  label="Статус"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.launch_date"
                  label="Дата запуска"
                  type="date"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.target_revenue"
                  label="Целевая выручка (млн руб)"
                  type="number"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="closeDialog"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            :loading="saving"
            @click="saveProduct"
          >
            {{ editingProduct ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтвердите удаление</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить продукт "{{ productToDelete?.name }}"?
          Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Отмена</v-btn>
          <v-btn color="error" @click="confirmDelete">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/productsStore'
import { useSnackbar } from '@/composables/useSnackbar'

// Stores
const productsStore = useProductsStore()
const { showSnackbar } = useSnackbar()

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const formValid = ref(false)
const saving = ref(false)
const editingProduct = ref(null)
const productToDelete = ref(null)
const form = ref(null)

// Form data
const formData = ref({
  name: '',
  description: '',
  category: '',
  product_owner_id: '',
  status: 'development',
  launch_date: '',
  target_revenue: null
})

// Computed
const loading = computed(() => productsStore.loading)
const products = computed(() => productsStore.products)

const filteredProducts = computed(() => {
  let filtered = products.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category === selectedCategory.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(product => product.status === selectedStatus.value)
  }

  return filtered
})

const categories = computed(() => {
  return [...new Set(products.value.map(p => p.category))]
})

// Data options
const headers = [
  { title: 'Название', key: 'name' },
  { title: 'Категория', key: 'category' },
  { title: 'Описание', key: 'description' },
  { title: 'Статус', key: 'status' },
  { title: 'Действия', key: 'actions', sortable: false }
]

const categoryOptions = [
  { title: 'Уход за кожей', value: 'skincare' },
  { title: 'Декоративная косметика', value: 'makeup' },
  { title: 'Мужская линия', value: 'men' },
  { title: 'Детская линия', value: 'baby' },
  { title: 'Эко-серия', value: 'eco' }
]

const statusOptions = [
  { title: 'В разработке', value: 'development' },
  { title: 'Активный', value: 'active' },
  { title: 'Приостановлен', value: 'paused' },
  { title: 'Снят с производства', value: 'discontinued' }
]

const statuses = computed(() => statusOptions.map(s => s.value))

const owners = ref([
  { id: 'user_1', name: 'Иванова А.В.' },
  { id: 'user_2', name: 'Петров П.П.' },
  { id: 'user_3', name: 'Сидорова С.С.' }
])

// Validation rules
const rules = {
  required: value => !!value || 'Поле обязательно для заполнения'
}

// Methods
const openCreateDialog = () => {
  editingProduct.value = null
  formData.value = {
    name: '',
    description: '',
    category: '',
    product_owner_id: '',
    status: 'development',
    launch_date: '',
    target_revenue: null
  }
  dialog.value = true
}

const editProduct = (product) => {
  editingProduct.value = product
  formData.value = { ...product }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editingProduct.value = null
  if (form.value) {
    form.value.reset()
  }
}

const saveProduct = async () => {
  if (!formValid.value) return

  saving.value = true
  try {
    if (editingProduct.value) {
      await productsStore.updateProduct(editingProduct.value.product_id, formData.value)
      showSnackbar('Продукт успешно обновлен', 'success')
    } else {
      await productsStore.createProduct(formData.value)
      showSnackbar('Продукт успешно создан', 'success')
    }
    closeDialog()
  } catch (error) {
    showSnackbar('Ошибка при сохранении продукта', 'error')
  } finally {
    saving.value = false
  }
}

const deleteProduct = (product) => {
  productToDelete.value = product
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await productsStore.deleteProduct(productToDelete.value.product_id)
    showSnackbar('Продукт успешно удален', 'success')
    deleteDialog.value = false
    productToDelete.value = null
  } catch (error) {
    showSnackbar('Ошибка при удалении продукта', 'error')
  }
}

const getStatusColor = (status) => {
  const colors = {
    development: 'orange',
    active: 'success',
    paused: 'warning',
    discontinued: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    development: 'В разработке',
    active: 'Активный',
    paused: 'Приостановлен',
    discontinued: 'Снят с производства'
  }
  return texts[status] || status
}

// Lifecycle
onMounted(async () => {
  await productsStore.fetchProducts()
})
</script>

<style scoped>
.products-settings {
  height: 100%;
}

:deep(.v-data-table tbody tr) {
  cursor: pointer;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>