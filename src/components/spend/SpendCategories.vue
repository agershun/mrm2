<template>
  <div class="spend-categories">
    <v-card>
      <v-card-title>
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon class="me-2">mdi-folder-multiple</v-icon>
            Категории расходов
          </div>
          <div class="d-flex align-center gap-2">
            <!-- Поиск -->
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск категорий"
              variant="outlined"
              density="compact"
              style="width: 300px"
              clearable
            />
            <v-btn
              color="primary"
              variant="outlined"
              @click="showCreateDialog = true"
            >
              <v-icon class="me-2">mdi-plus</v-icon>
              Добавить
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <!-- Иерархическое дерево категорий -->
        <v-treeview
          :items="filteredCategories"
          item-title="name"
          item-value="id"
          open-on-click
          density="compact"
          class="category-tree"
        >
          <template v-slot:prepend="{ item }">
            <v-icon
              :color="item.isActive ? 'success' : 'grey'"
              size="small"
            >
              {{ item.icon }}
            </v-icon>
          </template>

          <template v-slot:append="{ item }">
            <div class="d-flex align-center gap-2">
              <!-- Статус -->
              <v-chip
                :color="item.isActive ? 'success' : 'grey'"
                size="small"
                variant="tonal"
              >
                {{ item.isActive ? 'Активна' : 'Неактивна' }}
              </v-chip>

              <!-- Лимит -->
              <v-chip
                v-if="item.defaultLimit"
                color="primary"
                size="small"
                variant="outlined"
              >
                {{ formatCurrency(item.defaultLimit) }}
              </v-chip>

              <!-- Действия -->
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    size="small"
                    variant="text"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="editCategory(item)">
                    <v-list-item-title>
                      <v-icon class="me-2">mdi-pencil</v-icon>
                      Редактировать
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="duplicateCategory(item)">
                    <v-list-item-title>
                      <v-icon class="me-2">mdi-content-copy</v-icon>
                      Дублировать
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="viewSubcategories(item)">
                    <v-list-item-title>
                      <v-icon class="me-2">mdi-folder-open</v-icon>
                      Подкатегории
                    </v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item
                    @click="deleteCategory(item)"
                    :disabled="item.children?.length > 0"
                  >
                    <v-list-item-title class="text-error">
                      <v-icon class="me-2">mdi-delete</v-icon>
                      Удалить
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-treeview>
      </v-card-text>
    </v-card>

    <!-- Статистика -->
    <v-row class="mt-6">
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold text-primary">
              {{ categoryStats.total }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Всего категорий
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold text-success">
              {{ categoryStats.active }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Активных
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold text-info">
              {{ categoryStats.withLimits }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              С лимитами
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold text-warning">
              {{ formatCurrency(categoryStats.totalLimits) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Общий лимит
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог создания/редактирования -->
    <v-dialog v-model="showCreateDialog" max-width="800">
      <v-card>
        <v-card-title>
          {{ editingCategory ? 'Редактировать категорию' : 'Создать категорию' }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveCategory">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="categoryForm.name"
                  label="Название категории"
                  variant="outlined"
                  required
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="categoryForm.code"
                  label="Код категории"
                  variant="outlined"
                  required
                  :rules="[rules.required]"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="categoryForm.description"
                  label="Описание"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="categoryForm.parentId"
                  :items="parentCategories"
                  label="Родительская категория"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="categoryForm.icon"
                  :items="iconOptions"
                  label="Иконка"
                  variant="outlined"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon :icon="item.value" />
                      </template>
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    <div class="d-flex align-center">
                      <v-icon class="me-2" :icon="item.value" />
                      {{ item.title }}
                    </div>
                  </template>
                </v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="categoryForm.defaultLimit"
                  label="Лимит по умолчанию"
                  variant="outlined"
                  type="number"
                  min="0"
                  suffix="₽"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="categoryForm.approvalLevel"
                  :items="approvalLevels"
                  label="Уровень утверждения"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="categoryForm.requiresApproval"
                  label="Требует утверждения"
                  color="primary"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="categoryForm.allowSubcategories"
                  label="Разрешить подкатегории"
                  color="primary"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="categoryForm.isActive"
                  label="Активна"
                  color="primary"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelEdit">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="saveCategory"
            :loading="isSaving"
          >
            {{ editingCategory ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="showDeleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-error">Удаление категории</v-card-title>
        <v-card-text>
          <p>Вы уверены, что хотите удалить категорию "{{ categoryToDelete?.name }}"?</p>
          <p class="text-caption text-medium-emphasis">
            Это действие нельзя отменить.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
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

<script>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'

export default {
  name: 'SpendCategories',
  setup() {
    const appStore = useAppStore()

    const searchQuery = ref('')
    const showCreateDialog = ref(false)
    const showDeleteDialog = ref(false)
    const isSaving = ref(false)
    const isDeleting = ref(false)
    const editingCategory = ref(null)
    const categoryToDelete = ref(null)

    const categories = ref([
      {
        id: '1',
        name: 'Маркетинг',
        code: 'MKT',
        description: 'Маркетинговые расходы',
        icon: 'mdi-bullhorn',
        defaultLimit: 5000000,
        approvalLevel: 'director',
        requiresApproval: true,
        allowSubcategories: true,
        isActive: true,
        children: [
          {
            id: '1.1',
            name: 'Цифровая реклама',
            code: 'MKT-DIG',
            description: 'Онлайн реклама и продвижение',
            icon: 'mdi-monitor',
            defaultLimit: 2000000,
            approvalLevel: 'manager',
            requiresApproval: true,
            allowSubcategories: true,
            isActive: true,
            children: [
              {
                id: '1.1.1',
                name: 'Google Ads',
                code: 'MKT-DIG-GGL',
                description: 'Реклама в Google',
                icon: 'mdi-google',
                defaultLimit: 800000,
                approvalLevel: 'manager',
                requiresApproval: false,
                allowSubcategories: false,
                isActive: true
              },
              {
                id: '1.1.2',
                name: 'Facebook Ads',
                code: 'MKT-DIG-FB',
                description: 'Реклама в Facebook и Instagram',
                icon: 'mdi-facebook',
                defaultLimit: 600000,
                approvalLevel: 'manager',
                requiresApproval: false,
                allowSubcategories: false,
                isActive: true
              }
            ]
          },
          {
            id: '1.2',
            name: 'Традиционная реклама',
            code: 'MKT-TRAD',
            description: 'ТВ, радио, печать',
            icon: 'mdi-television',
            defaultLimit: 1500000,
            approvalLevel: 'director',
            requiresApproval: true,
            allowSubcategories: true,
            isActive: true
          }
        ]
      },
      {
        id: '2',
        name: 'Операционные расходы',
        code: 'OPS',
        description: 'Операционные расходы компании',
        icon: 'mdi-cog',
        defaultLimit: 3000000,
        approvalLevel: 'cfo',
        requiresApproval: true,
        allowSubcategories: true,
        isActive: true,
        children: [
          {
            id: '2.1',
            name: 'Офисные расходы',
            code: 'OPS-OFF',
            description: 'Аренда, коммунальные услуги',
            icon: 'mdi-office-building',
            defaultLimit: 800000,
            approvalLevel: 'manager',
            requiresApproval: false,
            allowSubcategories: true,
            isActive: true
          }
        ]
      }
    ])

    const categoryForm = ref({
      name: '',
      code: '',
      description: '',
      parentId: null,
      icon: 'mdi-folder',
      defaultLimit: 0,
      approvalLevel: 'manager',
      requiresApproval: false,
      allowSubcategories: true,
      isActive: true
    })

    const iconOptions = ref([
      { title: 'Папка', value: 'mdi-folder' },
      { title: 'Маркетинг', value: 'mdi-bullhorn' },
      { title: 'Цифровые технологии', value: 'mdi-monitor' },
      { title: 'Операции', value: 'mdi-cog' },
      { title: 'Офис', value: 'mdi-office-building' },
      { title: 'Персонал', value: 'mdi-account-group' },
      { title: 'Финансы', value: 'mdi-wallet' },
      { title: 'IT', value: 'mdi-laptop' },
      { title: 'Производство', value: 'mdi-factory' },
      { title: 'Логистика', value: 'mdi-truck' }
    ])

    const approvalLevels = ref([
      { title: 'Менеджер', value: 'manager' },
      { title: 'Директор', value: 'director' },
      { title: 'Финансовый директор', value: 'cfo' },
      { title: 'Генеральный директор', value: 'ceo' }
    ])

    const rules = {
      required: (value) => !!value || 'Поле обязательно для заполнения'
    }

    // Computed
    const filteredCategories = computed(() => {
      if (!searchQuery.value) return categories.value

      const filterRecursive = (items, query) => {
        return items.filter(item => {
          const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase()) ||
                              item.code.toLowerCase().includes(query.toLowerCase()) ||
                              item.description?.toLowerCase().includes(query.toLowerCase())

          if (matchesQuery) return true

          if (item.children) {
            const filteredChildren = filterRecursive(item.children, query)
            if (filteredChildren.length > 0) {
              return true
            }
          }

          return false
        }).map(item => ({
          ...item,
          children: item.children ? filterRecursive(item.children, query) : undefined
        }))
      }

      return filterRecursive(categories.value, searchQuery.value)
    })

    const parentCategories = computed(() => {
      const flattenCategories = (items, level = 0) => {
        let result = []
        items.forEach(item => {
          if (item.allowSubcategories && (!editingCategory.value || item.id !== editingCategory.value.id)) {
            result.push({
              title: '  '.repeat(level) + item.name,
              value: item.id
            })
            if (item.children) {
              result = result.concat(flattenCategories(item.children, level + 1))
            }
          }
        })
        return result
      }
      return flattenCategories(categories.value)
    })

    const categoryStats = computed(() => {
      const flattenCategories = (items) => {
        let result = []
        items.forEach(item => {
          result.push(item)
          if (item.children) {
            result = result.concat(flattenCategories(item.children))
          }
        })
        return result
      }

      const allCategories = flattenCategories(categories.value)
      return {
        total: allCategories.length,
        active: allCategories.filter(c => c.isActive).length,
        withLimits: allCategories.filter(c => c.defaultLimit > 0).length,
        totalLimits: allCategories.reduce((sum, c) => sum + (c.defaultLimit || 0), 0)
      }
    })

    // Methods
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const editCategory = (category) => {
      editingCategory.value = category
      categoryForm.value = { ...category }
      showCreateDialog.value = true
    }

    const duplicateCategory = (category) => {
      categoryForm.value = {
        ...category,
        name: category.name + ' (копия)',
        code: category.code + '_COPY',
        id: undefined
      }
      editingCategory.value = null
      showCreateDialog.value = true
    }

    const viewSubcategories = (category) => {
      console.log('View subcategories for:', category)
      // TODO: Implement subcategory view
    }

    const deleteCategory = (category) => {
      categoryToDelete.value = category
      showDeleteDialog.value = true
    }

    const saveCategory = async () => {
      try {
        isSaving.value = true
        // TODO: Implement save logic
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (editingCategory.value) {
          appStore.showSuccess('Категория обновлена успешно')
        } else {
          appStore.showSuccess('Категория создана успешно')
        }

        cancelEdit()
      } catch (error) {
        console.error('Error saving category:', error)
        appStore.showError('Ошибка сохранения категории')
      } finally {
        isSaving.value = false
      }
    }

    const confirmDelete = async () => {
      try {
        isDeleting.value = true
        // TODO: Implement delete logic
        await new Promise(resolve => setTimeout(resolve, 1000))
        appStore.showSuccess('Категория удалена успешно')
        showDeleteDialog.value = false
        categoryToDelete.value = null
      } catch (error) {
        console.error('Error deleting category:', error)
        appStore.showError('Ошибка удаления категории')
      } finally {
        isDeleting.value = false
      }
    }

    const cancelEdit = () => {
      showCreateDialog.value = false
      editingCategory.value = null
      categoryForm.value = {
        name: '',
        code: '',
        description: '',
        parentId: null,
        icon: 'mdi-folder',
        defaultLimit: 0,
        approvalLevel: 'manager',
        requiresApproval: false,
        allowSubcategories: true,
        isActive: true
      }
    }

    return {
      searchQuery,
      showCreateDialog,
      showDeleteDialog,
      isSaving,
      isDeleting,
      editingCategory,
      categoryToDelete,
      categories,
      categoryForm,
      iconOptions,
      approvalLevels,
      rules,
      filteredCategories,
      parentCategories,
      categoryStats,
      formatCurrency,
      editCategory,
      duplicateCategory,
      viewSubcategories,
      deleteCategory,
      saveCategory,
      confirmDelete,
      cancelEdit
    }
  }
}
</script>

<style scoped>
.spend-categories {
  max-width: 100%;
}

.category-tree {
  max-height: 600px;
  overflow-y: auto;
}

:deep(.v-treeview-item) {
  padding: 4px 0;
}

:deep(.v-treeview-item__content) {
  padding-left: 8px;
}
</style>