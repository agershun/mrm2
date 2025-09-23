<template>
  <div class="kpi-hierarchies-settings">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-chart-timeline-variant</v-icon>
        Иерархии показателей KPI
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Добавить связь
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Настройка иерархических связей между показателями эффективности
        </p>

        <!-- Фильтры и поиск -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск по показателям"
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
              v-model="selectedLevel"
              :items="levelOptions"
              label="Уровень иерархии"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-switch
              v-model="showTree"
              label="Дерево"
              density="compact"
            />
          </v-col>
        </v-row>

        <!-- Иерархическое представление -->
        <template v-if="showTree">
          <v-treeview
            :items="hierarchyTree"
            item-key="id"
            item-title="name"
            :open-all="true"
          >
            <template v-slot:prepend="{ item }">
              <v-icon color="primary">{{ getCategoryIcon(item.category) }}</v-icon>
            </template>

            <template v-slot:append="{ item }">
              <div class="d-flex align-center">
                <v-chip
                  size="x-small"
                  :color="getCategoryColor(item.category)"
                  class="mr-2"
                >
                  {{ item.category }}
                </v-chip>
                <span class="text-caption text-medium-emphasis mr-2">
                  {{ item.calculation_method }}
                </span>
                <v-btn
                  icon="mdi-pencil"
                  size="x-small"
                  variant="text"
                  @click="editHierarchy(item)"
                />
                <v-btn
                  icon="mdi-delete"
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="deleteHierarchy(item)"
                />
              </div>
            </template>
          </v-treeview>
        </template>

        <!-- Табличное представление -->
        <template v-else>
          <v-data-table
            :headers="headers"
            :items="filteredHierarchies"
            :loading="loading"
            item-key="id"
            @click:row="editHierarchy"
          >
            <template v-slot:item.parent_kpi_name="{ item }">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="primary">
                  {{ getCategoryIcon(getParentCategory(item.parent_kpi_id)) }}
                </v-icon>
                {{ getKPIName(item.parent_kpi_id) }}
              </div>
            </template>

            <template v-slot:item.child_kpi_name="{ item }">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="secondary">
                  {{ getCategoryIcon(getChildCategory(item.child_kpi_id)) }}
                </v-icon>
                {{ getKPIName(item.child_kpi_id) }}
              </div>
            </template>

            <template v-slot:item.relationship_type="{ item }">
              <v-chip
                size="small"
                :color="getRelationshipColor(item.relationship_type)"
              >
                {{ getRelationshipText(item.relationship_type) }}
              </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click.stop="editHierarchy(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click.stop="deleteHierarchy(item)"
              />
            </template>
          </v-data-table>
        </template>
      </v-card-text>
    </v-card>

    <!-- Диалог создания/редактирования -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ editingHierarchy ? 'Редактирование связи' : 'Новая связь KPI' }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="formData.parent_kpi_id"
                  :items="availableKPIs"
                  item-title="name"
                  item-value="kpi_id"
                  label="Родительский показатель"
                  :rules="[rules.required]"
                  variant="outlined"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon>{{ getCategoryIcon(item.raw.category) }}</v-icon>
                      </template>
                      <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.raw.category }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.child_kpi_id"
                  :items="availableKPIs"
                  item-title="name"
                  item-value="kpi_id"
                  label="Дочерний показатель"
                  :rules="[rules.required, rules.notSameAsParent]"
                  variant="outlined"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon>{{ getCategoryIcon(item.raw.category) }}</v-icon>
                      </template>
                      <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.raw.category }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.relationship_type"
                  :items="relationshipTypes"
                  label="Тип связи"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.weight"
                  label="Вес (%)"
                  type="number"
                  variant="outlined"
                  suffix="%"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.formula"
                  label="Формула расчета"
                  placeholder="Например: sum(children) или avg(children)"
                  variant="outlined"
                  rows="2"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Описание связи"
                  variant="outlined"
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            :loading="saving"
            @click="saveHierarchy"
          >
            {{ editingHierarchy ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтвердите удаление</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить связь между показателями?
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
import { useKpiHierarchiesStore } from '@/stores/kpiHierarchiesStore'
import { usePerformanceStore } from '@/stores/performanceStore'
import { useSnackbar } from '@/composables/useSnackbar'

// Stores
const kpiHierarchiesStore = useKpiHierarchiesStore()
const performanceStore = usePerformanceStore()
const { showSnackbar } = useSnackbar()

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedLevel = ref('')
const showTree = ref(true)
const dialog = ref(false)
const deleteDialog = ref(false)
const formValid = ref(false)
const saving = ref(false)
const editingHierarchy = ref(null)
const hierarchyToDelete = ref(null)
const form = ref(null)

// Form data
const formData = ref({
  parent_kpi_id: '',
  child_kpi_id: '',
  relationship_type: '',
  weight: null,
  formula: '',
  description: ''
})

// Computed
const loading = computed(() => kpiHierarchiesStore.loading)
const hierarchies = computed(() => kpiHierarchiesStore.hierarchies)
const hierarchyTree = computed(() => kpiHierarchiesStore.hierarchyTree)
const availableKPIs = computed(() => performanceStore.kpis)

const filteredHierarchies = computed(() => {
  let filtered = hierarchies.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(hierarchy =>
      getKPIName(hierarchy.parent_kpi_id).toLowerCase().includes(query) ||
      getKPIName(hierarchy.child_kpi_id).toLowerCase().includes(query)
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(hierarchy =>
      getParentCategory(hierarchy.parent_kpi_id) === selectedCategory.value ||
      getChildCategory(hierarchy.child_kpi_id) === selectedCategory.value
    )
  }

  return filtered
})

const categories = computed(() => {
  const allCategories = availableKPIs.value.map(kpi => kpi.category)
  return [...new Set(allCategories)]
})

// Data options
const headers = [
  { title: 'Родительский показатель', key: 'parent_kpi_name' },
  { title: 'Дочерний показатель', key: 'child_kpi_name' },
  { title: 'Тип связи', key: 'relationship_type' },
  { title: 'Вес (%)', key: 'weight' },
  { title: 'Действия', key: 'actions', sortable: false }
]

const relationshipTypes = [
  { title: 'Сумма', value: 'sum' },
  { title: 'Среднее', value: 'average' },
  { title: 'Максимум', value: 'max' },
  { title: 'Минимум', value: 'min' },
  { title: 'Взвешенная сумма', value: 'weighted_sum' },
  { title: 'Пользовательская формула', value: 'custom' }
]

const levelOptions = [
  { title: 'Уровень 1', value: 1 },
  { title: 'Уровень 2', value: 2 },
  { title: 'Уровень 3', value: 3 },
  { title: 'Уровень 4', value: 4 }
]

// Validation rules
const rules = {
  required: value => !!value || 'Поле обязательно для заполнения',
  notSameAsParent: value => value !== formData.value.parent_kpi_id || 'Дочерний показатель не может совпадать с родительским'
}

// Methods
const openCreateDialog = () => {
  editingHierarchy.value = null
  formData.value = {
    parent_kpi_id: '',
    child_kpi_id: '',
    relationship_type: 'sum',
    weight: null,
    formula: '',
    description: ''
  }
  dialog.value = true
}

const editHierarchy = (hierarchy) => {
  editingHierarchy.value = hierarchy
  formData.value = { ...hierarchy }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editingHierarchy.value = null
  if (form.value) {
    form.value.reset()
  }
}

const saveHierarchy = async () => {
  if (!formValid.value) return

  saving.value = true
  try {
    if (editingHierarchy.value) {
      await kpiHierarchiesStore.updateHierarchy(editingHierarchy.value.id, formData.value)
      showSnackbar('Связь KPI успешно обновлена', 'success')
    } else {
      await kpiHierarchiesStore.createHierarchy(formData.value)
      showSnackbar('Связь KPI успешно создана', 'success')
    }
    closeDialog()
  } catch (error) {
    showSnackbar('Ошибка при сохранении связи KPI', 'error')
  } finally {
    saving.value = false
  }
}

const deleteHierarchy = (hierarchy) => {
  hierarchyToDelete.value = hierarchy
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await kpiHierarchiesStore.deleteHierarchy(hierarchyToDelete.value.id)
    showSnackbar('Связь KPI успешно удалена', 'success')
    deleteDialog.value = false
    hierarchyToDelete.value = null
  } catch (error) {
    showSnackbar('Ошибка при удалении связи KPI', 'error')
  }
}

const getCategoryIcon = (category) => {
  const icons = {
    Media: 'mdi-television',
    Brand: 'mdi-star',
    Product: 'mdi-package-variant',
    Financial: 'mdi-currency-usd',
    Business: 'mdi-briefcase',
    Team: 'mdi-account-group'
  }
  return icons[category] || 'mdi-chart-line'
}

const getCategoryColor = (category) => {
  const colors = {
    Media: 'blue',
    Brand: 'purple',
    Product: 'green',
    Financial: 'orange',
    Business: 'red',
    Team: 'teal'
  }
  return colors[category] || 'grey'
}

const getRelationshipColor = (type) => {
  const colors = {
    sum: 'success',
    average: 'info',
    max: 'warning',
    min: 'error',
    weighted_sum: 'purple',
    custom: 'orange'
  }
  return colors[type] || 'grey'
}

const getRelationshipText = (type) => {
  const texts = {
    sum: 'Сумма',
    average: 'Среднее',
    max: 'Максимум',
    min: 'Минимум',
    weighted_sum: 'Взвешенная сумма',
    custom: 'Пользовательская'
  }
  return texts[type] || type
}

const getKPIName = (kpiId) => {
  const kpi = availableKPIs.value.find(k => k.kpi_id === kpiId)
  return kpi?.name || '-'
}

const getParentCategory = (parentId) => {
  const kpi = availableKPIs.value.find(k => k.kpi_id === parentId)
  return kpi?.category || ''
}

const getChildCategory = (childId) => {
  const kpi = availableKPIs.value.find(k => k.kpi_id === childId)
  return kpi?.category || ''
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    kpiHierarchiesStore.fetchHierarchies(),
    performanceStore.fetchKPIs()
  ])
})
</script>

<style scoped>
.kpi-hierarchies-settings {
  height: 100%;
}

:deep(.v-data-table tbody tr) {
  cursor: pointer;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.v-treeview-item) {
  cursor: pointer;
}
</style>