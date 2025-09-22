<template>
  <div class="investment-hierarchy">
    <!-- Заголовок с действиями -->
    <div class="hierarchy-header pa-3 border-bottom">
      <div class="d-flex align-center justify-space-between mb-3">
        <h3 class="text-h6">Структура инвестиций</h3>
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              size="small"
              variant="text"
              v-bind="props"
            />
          </template>
          <v-list density="compact">
            <v-list-item @click="expandAll">
              <template #prepend>
                <v-icon icon="mdi-arrow-expand-all"/>
              </template>
              <v-list-item-title>Развернуть все</v-list-item-title>
            </v-list-item>
            <v-list-item @click="collapseAll">
              <template #prepend>
                <v-icon icon="mdi-arrow-collapse-all"/>
              </template>
              <v-list-item-title>Свернуть все</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Кнопки создания -->
      <div class="creation-buttons">
        <v-btn-group variant="outlined" divided class="mb-2">
          <v-btn
            size="small"
            prepend-icon="mdi-folder-plus"
            @click="createItem('category')"
            :disabled="!canCreate('investments')"
          >
            Category
          </v-btn>
          <v-btn
            size="small"
            prepend-icon="mdi-folder-multiple"
            @click="createItem('subcategory')"
            :disabled="!canCreate('investments') || !selectedItem"
          >
            Sub-category
          </v-btn>
        </v-btn-group>
        <v-btn-group variant="outlined" divided>
          <v-btn
            size="small"
            prepend-icon="mdi-plus"
            @click="createItem('line_item')"
            :disabled="!canCreate('investments') || !canCreateLineItem"
          >
            Line Item
          </v-btn>
          <v-btn
            size="small"
            prepend-icon="mdi-bookmark-plus"
            @click="createItem('placeholder')"
            :disabled="!canCreate('investments') || !canCreateLineItem"
          >
            Placeholder
          </v-btn>
        </v-btn-group>
        <v-btn
          size="small"
          color="error"
          variant="outlined"
          prepend-icon="mdi-delete"
          @click="deleteSelectedItem"
          :disabled="!canDelete('investments') || !selectedItem"
          class="ml-2"
        >
          Delete
        </v-btn>
      </div>
    </div>

    <!-- Дерево иерархии -->
    <div class="hierarchy-tree" style="height: calc(100vh - 300px); overflow-y: auto;">
      <v-treeview
        v-model:opened="openedNodes"
        v-model:selected="selectedNodes"
        :items="hierarchyTree"
        item-key="id"
        item-title="name"
        item-children="children"
        open-strategy="multiple"
        select-strategy="single"
        activatable
        @update:selected="onItemSelect"
      >
        <template #prepend="{ item }">
          <v-icon
            :icon="getItemIcon(item)"
            :color="getItemColor(item)"
            size="20"
            class="me-2"
          />
        </template>

        <template #label="{ item }">
          <div class="d-flex align-center justify-space-between w-100">
            <div class="d-flex align-center">
              <span
                :class="{
                  'font-italic': item.type === 'placeholder',
                  'font-weight-medium': item.type === 'category',
                  'text-decoration-underline': item.connected_to_activities
                }"
                :style="{ color: item.connected_to_activities ? '#FFA726' : undefined }"
              >
                {{ item.name }}
              </span>
              <v-icon
                v-if="item.connected_to_activities"
                icon="mdi-link"
                size="14"
                color="warning"
                class="ml-1"
                title="Связано с активностями"
              />
            </div>
            <div class="d-flex align-center">
              <v-icon
                icon="mdi-information"
                size="16"
                class="panel-icon ml-2"
                @click.stop="openDetailsPanel(item)"
                title="Открыть панель деталей"
              />
            </div>
          </div>
        </template>

        <template #append="{ item }">
          <div class="d-flex align-center">
            <v-chip
              v-if="item.type === 'line_item' || item.type === 'placeholder'"
              size="x-small"
              :color="getAmountColor(item.total_amount)"
              variant="flat"
            >
              {{ formatCurrency(item.total_amount || 0) }}
            </v-chip>
          </div>
        </template>
      </v-treeview>

      <!-- Пустое состояние -->
      <div v-if="hierarchyTree.length === 0" class="empty-state text-center pa-8">
        <v-icon icon="mdi-file-tree" size="64" color="grey-lighten-2" class="mb-4"/>
        <h4 class="text-h6 text-medium-emphasis mb-2">Структура не создана</h4>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Создайте первую категорию для начала работы
        </p>
        <v-btn
          color="primary"
          prepend-icon="mdi-folder-plus"
          @click="createItem('category')"
          :disabled="!canCreate('investments')"
        >
          Создать категорию
        </v-btn>
      </div>
    </div>

    <!-- Диалог создания элемента -->
    <v-dialog v-model="showCreateDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon :icon="getCreateIcon()" class="me-2"/>
          {{ getCreateTitle() }}
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="createForm" v-model="createFormValid">
            <v-text-field
              v-model="newItem.name"
              label="Название"
              variant="outlined"
              :rules="[v => !!v || 'Название обязательно']"
              required
              autofocus
            />

            <v-textarea
              v-model="newItem.description"
              label="Описание"
              variant="outlined"
              rows="3"
            />

            <v-select
              v-if="newItem.type === 'subcategory' || newItem.type === 'line_item' || newItem.type === 'placeholder'"
              v-model="newItem.parent_id"
              :items="getParentOptions()"
              item-title="name"
              item-value="id"
              label="Родительский элемент"
              variant="outlined"
              :rules="[v => !!v || 'Родительский элемент обязателен']"
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn @click="showCreateDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="submitCreateItem"
            :disabled="!createFormValid"
            :loading="isCreating"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon icon="mdi-delete" color="error" class="me-2"/>
          Подтверждение удаления
        </v-card-title>

        <v-card-text class="pa-4">
          <p class="text-body-1 mb-2">
            Вы уверены, что хотите удалить "{{ itemToDelete?.name }}"?
          </p>
          <v-alert
            v-if="itemToDelete?.children?.length > 0"
            type="warning"
            variant="tonal"
            class="mb-3"
          >
            Внимание! Этот элемент содержит {{ itemToDelete.children.length }} вложенных элементов, которые также будут удалены.
          </v-alert>
          <p class="text-caption text-medium-emphasis">
            Это действие необратимо.
          </p>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn @click="showDeleteDialog = false">Отмена</v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="isDeleting"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useInvestmentsStore } from '@/stores/investmentsStore'
import { usePermissions } from '@/composables/usePermissions'
import api from '@/api'

// Props
const props = defineProps({
  investmentPlanId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['item-selected', 'item-created', 'item-deleted', 'details-panel-open'])

// Stores
const investmentsStore = useInvestmentsStore()

// Composables
const { canCreate, canDelete } = usePermissions()

// Reactive data
const openedNodes = ref([])
const selectedNodes = ref([])
const selectedItem = ref(null)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const createFormValid = ref(false)
const isCreating = ref(false)
const isDeleting = ref(false)
const itemToDelete = ref(null)
const investmentHierarchy = ref([])
const isLoading = ref(false)

// Новый элемент
const newItem = ref({
  name: '',
  description: '',
  type: '',
  parent_id: null
})

// Методы
const loadInvestmentHierarchy = async () => {
  try {
    isLoading.value = true
    const data = await api.investments.getInvestmentHierarchy()
    investmentHierarchy.value = data || []
  } catch (error) {
    console.error('Error loading investment hierarchy:', error)
  } finally {
    isLoading.value = false
  }
}

// Преобразование иерархических данных в три-структуру
const buildHierarchyTree = (items) => {
  const buildTree = (parentId = null) => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        id: item.investment_id,
        name: item.name,
        description: item.description,
        type: item.type,
        parent_id: item.parent_id,
        level: item.level,
        total_amount: item.total_amount,
        connected_to_activities: item.connected_to_activities,
        kreola_id: item.kreola_id,
        children: buildTree(item.investment_id)
      }))
  }
  return buildTree()
}

// Computed properties
const hierarchyTree = computed(() => {
  return buildHierarchyTree(investmentHierarchy.value)
})

const hierarchyItems = computed(() => {
  return investmentHierarchy.value
})

const canCreateLineItem = computed(() => {
  return selectedItem.value &&
         (selectedItem.value.type === 'category' || selectedItem.value.type === 'subcategory')
})

// Methods
const onItemSelect = (selected) => {
  selectedNodes.value = selected
  selectedItem.value = selected.length > 0 ? findItemById(selected[0]) : null
  emit('item-selected', selectedItem.value)
}

const findItemById = (id) => {
  const findInTree = (items) => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findInTree(item.children)
        if (found) return found
      }
    }
    return null
  }
  return findInTree(hierarchyTree.value)
}

const createItem = (type) => {
  newItem.value = {
    name: '',
    description: '',
    type: type,
    parent_id: type === 'category' ? null : selectedItem.value?.id || null
  }
  showCreateDialog.value = true
}

const getCreateIcon = () => {
  const icons = {
    category: 'mdi-folder-plus',
    subcategory: 'mdi-folder-multiple',
    line_item: 'mdi-plus',
    placeholder: 'mdi-bookmark-plus'
  }
  return icons[newItem.value.type] || 'mdi-plus'
}

const getCreateTitle = () => {
  const titles = {
    category: 'Создать категорию',
    subcategory: 'Создать подкатегорию',
    line_item: 'Создать статью расходов',
    placeholder: 'Создать резерв'
  }
  return titles[newItem.value.type] || 'Создать элемент'
}

const getParentOptions = () => {
  const options = []

  if (newItem.value.type === 'subcategory') {
    // Для подкатегорий: категории и другие подкатегории
    options.push(...hierarchyItems.value.filter(item =>
      item.type === 'category' || item.type === 'subcategory'
    ).map(item => ({ id: item.investment_id, name: item.name })))
  } else if (newItem.value.type === 'line_item' || newItem.value.type === 'placeholder') {
    // Для статей расходов: только категории и подкатегории
    options.push(...hierarchyItems.value.filter(item =>
      item.type === 'category' || item.type === 'subcategory'
    ).map(item => ({ id: item.investment_id, name: item.name })))
  }

  return options
}

const submitCreateItem = async () => {
  try {
    isCreating.value = true

    const item = {
      id: `${newItem.value.type}_${Date.now()}`,
      name: newItem.value.name,
      description: newItem.value.description,
      type: newItem.value.type,
      parent_id: newItem.value.parent_id,
      level: newItem.value.parent_id ? findItemById(newItem.value.parent_id).level + 1 : 0,
      total_amount: 0,
      connected_to_activities: false
    }

    // Здесь должен быть вызов API для создания элемента
    // const createdItem = await api.investments.createInvestmentHierarchyItem(item)
    // Пока добавляем локально
    investmentHierarchy.value.push({
      investment_id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      parent_id: item.parent_id,
      level: item.level,
      total_amount: item.total_amount,
      connected_to_activities: item.connected_to_activities
    })

    // Автоматически разворачиваем родительский элемент
    if (item.parent_id && !openedNodes.value.includes(item.parent_id)) {
      openedNodes.value.push(item.parent_id)
    }

    showCreateDialog.value = false
    emit('item-created', item)

  } catch (error) {
    console.error('Error creating item:', error)
  } finally {
    isCreating.value = false
  }
}

const deleteSelectedItem = () => {
  if (selectedItem.value) {
    itemToDelete.value = selectedItem.value
    showDeleteDialog.value = true
  }
}

const confirmDelete = async () => {
  try {
    isDeleting.value = true

    const deleteRecursively = (itemId) => {
      const children = hierarchyItems.value.filter(item => item.parent_id === itemId)
      children.forEach(child => deleteRecursively(child.investment_id))

      const index = hierarchyItems.value.findIndex(item => item.investment_id === itemId)
      if (index > -1) {
        investmentHierarchy.value.splice(index, 1)
      }
    }

    deleteRecursively(itemToDelete.value.id)
    // Здесь должен быть вызов API для удаления
    // await api.investments.deleteInvestmentHierarchyItem(itemToDelete.value.id)

    // Очистить выделение
    selectedNodes.value = []
    selectedItem.value = null

    showDeleteDialog.value = false
    emit('item-deleted', itemToDelete.value)

  } catch (error) {
    console.error('Error deleting item:', error)
  } finally {
    isDeleting.value = false
  }
}

const openDetailsPanel = (item) => {
  emit('details-panel-open', item)
}

const expandAll = () => {
  openedNodes.value = hierarchyItems.value.map(item => item.investment_id)
}

const collapseAll = () => {
  openedNodes.value = []
}

const getItemIcon = (item) => {
  const icons = {
    category: 'mdi-folder',
    subcategory: 'mdi-folder-outline',
    line_item: 'mdi-file-document',
    placeholder: 'mdi-bookmark'
  }
  return icons[item.type] || 'mdi-help'
}

const getItemColor = (item) => {
  const colors = {
    category: 'primary',
    subcategory: 'info',
    line_item: 'success',
    placeholder: 'warning'
  }
  return colors[item.type] || 'grey'
}

const getAmountColor = (amount) => {
  if (amount > 500000) return 'success'
  if (amount > 200000) return 'warning'
  return 'grey'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

// Watchers
watch(() => props.investmentPlanId, async (newPlanId) => {
  if (newPlanId) {
    await loadInvestmentHierarchy()
  }
})

// Lifecycle
onMounted(async () => {
  await loadInvestmentHierarchy()

  // Автоматически разворачиваем первый уровень
  openedNodes.value = hierarchyItems.value
    .filter(item => item.level === 0)
    .map(item => item.investment_id)
})

// Expose methods
defineExpose({
  selectedItem,
  expandAll,
  collapseAll,
  refreshHierarchy: loadInvestmentHierarchy
})
</script>

<style scoped>
.investment-hierarchy {
  border-right: 1px solid rgb(var(--v-border-color));
  height: 100%;
}

.hierarchy-header {
  background-color: rgb(var(--v-theme-surface-variant));
}

.creation-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-icon {
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.2s;
}

.panel-icon:hover {
  opacity: 1;
}

.hierarchy-tree {
  background-color: rgb(var(--v-theme-surface));
}

.empty-state {
  border: 2px dashed rgb(var(--v-border-color));
  border-radius: 8px;
  margin: 16px;
}
</style>