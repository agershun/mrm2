<template>
  <div class="geography-settings">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-map</v-icon>
        Управление географией
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Добавить регион
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Настройка географической структуры для планирования кампаний
        </p>

        <!-- Фильтры и поиск -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск регионов"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedType"
              :items="types"
              label="Тип"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedParent"
              :items="parentOptions"
              item-title="name"
              item-value="geography_id"
              label="Родительский регион"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-switch
              v-model="showHierarchy"
              label="Иерархия"
              density="compact"
            />
          </v-col>
        </v-row>

        <!-- Иерархическое представление -->
        <template v-if="showHierarchy">
          <v-treeview
            :items="hierarchyTree"
            item-key="geography_id"
            item-title="name"
            :open-all="true"
          >
            <template v-slot:prepend="{ item }">
              <v-icon>{{ getTypeIcon(item.type) }}</v-icon>
            </template>

            <template v-slot:append="{ item }">
              <div class="d-flex align-center">
                <v-chip
                  size="x-small"
                  :color="getTypeColor(item.type)"
                  class="mr-2"
                >
                  {{ item.type }}
                </v-chip>
                <span class="text-caption text-medium-emphasis mr-2">
                  {{ formatPopulation(item.population) }}
                </span>
                <v-btn
                  icon="mdi-pencil"
                  size="x-small"
                  variant="text"
                  @click="editGeography(item)"
                />
                <v-btn
                  icon="mdi-delete"
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="deleteGeography(item)"
                />
              </div>
            </template>
          </v-treeview>
        </template>

        <!-- Табличное представление -->
        <template v-else>
          <v-data-table
            :headers="headers"
            :items="filteredGeographies"
            :loading="loading"
            item-key="geography_id"
            @click:row="editGeography"
          >
            <template v-slot:item.type="{ item }">
              <div class="d-flex align-center">
                <v-icon class="mr-2">{{ getTypeIcon(item.type) }}</v-icon>
                <v-chip
                  size="small"
                  :color="getTypeColor(item.type)"
                >
                  {{ item.type }}
                </v-chip>
              </div>
            </template>

            <template v-slot:item.population="{ item }">
              {{ formatPopulation(item.population) }}
            </template>

            <template v-slot:item.parent_name="{ item }">
              {{ getParentName(item.parent_id) }}
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click.stop="editGeography(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click.stop="deleteGeography(item)"
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
            {{ editingGeography ? 'Редактирование региона' : 'Новый регион' }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Название"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.code"
                  label="Код"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.type"
                  :items="typeOptions"
                  label="Тип"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.parent_id"
                  :items="parentOptions"
                  item-title="name"
                  item-value="geography_id"
                  label="Родительский регион"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.population"
                  label="Население"
                  type="number"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.timezone"
                  label="Часовой пояс"
                  placeholder="UTC+3"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.currency"
                  label="Валюта"
                  placeholder="RUB"
                  variant="outlined"
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
            @click="saveGeography"
          >
            {{ editingGeography ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтвердите удаление</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить регион "{{ geographyToDelete?.name }}"?
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
import { useGeographyStore } from '@/stores/geographyStore'
import { useSnackbar } from '@/composables/useSnackbar'

// Stores
const geographyStore = useGeographyStore()
const { showSnackbar } = useSnackbar()

// Reactive data
const searchQuery = ref('')
const selectedType = ref('')
const selectedParent = ref('')
const showHierarchy = ref(true)
const dialog = ref(false)
const deleteDialog = ref(false)
const formValid = ref(false)
const saving = ref(false)
const editingGeography = ref(null)
const geographyToDelete = ref(null)
const form = ref(null)

// Form data
const formData = ref({
  name: '',
  code: '',
  type: '',
  parent_id: null,
  population: null,
  timezone: 'UTC+3',
  currency: 'RUB'
})

// Computed
const loading = computed(() => geographyStore.loading)
const geographies = computed(() => geographyStore.geographies)
const hierarchyTree = computed(() => geographyStore.hierarchyTree)

const filteredGeographies = computed(() => {
  let filtered = geographies.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(geo =>
      geo.name.toLowerCase().includes(query) ||
      geo.code.toLowerCase().includes(query)
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter(geo => geo.type === selectedType.value)
  }

  if (selectedParent.value) {
    filtered = filtered.filter(geo => geo.parent_id === selectedParent.value)
  }

  return filtered
})

const types = computed(() => {
  return [...new Set(geographies.value.map(g => g.type))]
})

const parentOptions = computed(() => {
  return geographies.value.filter(geo => geo.type !== 'City')
})

// Data options
const headers = [
  { title: 'Название', key: 'name' },
  { title: 'Тип', key: 'type' },
  { title: 'Код', key: 'code' },
  { title: 'Население', key: 'population' },
  { title: 'Родительский регион', key: 'parent_name' },
  { title: 'Действия', key: 'actions', sortable: false }
]

const typeOptions = [
  { title: 'Страна', value: 'Country' },
  { title: 'Регион', value: 'Region' },
  { title: 'Город', value: 'City' },
  { title: 'Группа', value: 'Group' }
]

// Validation rules
const rules = {
  required: value => !!value || 'Поле обязательно для заполнения'
}

// Methods
const openCreateDialog = () => {
  editingGeography.value = null
  formData.value = {
    name: '',
    code: '',
    type: '',
    parent_id: null,
    population: null,
    timezone: 'UTC+3',
    currency: 'RUB'
  }
  dialog.value = true
}

const editGeography = (geography) => {
  editingGeography.value = geography
  formData.value = { ...geography }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editingGeography.value = null
  if (form.value) {
    form.value.reset()
  }
}

const saveGeography = async () => {
  if (!formValid.value) return

  saving.value = true
  try {
    if (editingGeography.value) {
      await geographyStore.updateGeography(editingGeography.value.geography_id, formData.value)
      showSnackbar('Регион успешно обновлен', 'success')
    } else {
      await geographyStore.createGeography(formData.value)
      showSnackbar('Регион успешно создан', 'success')
    }
    closeDialog()
  } catch (error) {
    showSnackbar('Ошибка при сохранении региона', 'error')
  } finally {
    saving.value = false
  }
}

const deleteGeography = (geography) => {
  geographyToDelete.value = geography
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await geographyStore.deleteGeography(geographyToDelete.value.geography_id)
    showSnackbar('Регион успешно удален', 'success')
    deleteDialog.value = false
    geographyToDelete.value = null
  } catch (error) {
    showSnackbar('Ошибка при удалении региона', 'error')
  }
}

const getTypeIcon = (type) => {
  const icons = {
    Country: 'mdi-earth',
    Region: 'mdi-map-outline',
    City: 'mdi-city',
    Group: 'mdi-group'
  }
  return icons[type] || 'mdi-map-marker'
}

const getTypeColor = (type) => {
  const colors = {
    Country: 'blue',
    Region: 'green',
    City: 'orange',
    Group: 'purple'
  }
  return colors[type] || 'grey'
}

const formatPopulation = (population) => {
  if (!population) return '-'
  return new Intl.NumberFormat('ru-RU').format(population)
}

const getParentName = (parentId) => {
  if (!parentId) return '-'
  const parent = geographies.value.find(g => g.geography_id === parentId)
  return parent?.name || '-'
}

// Lifecycle
onMounted(async () => {
  await geographyStore.fetchGeographies()
  await geographyStore.fetchHierarchy()
})
</script>

<style scoped>
.geography-settings {
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