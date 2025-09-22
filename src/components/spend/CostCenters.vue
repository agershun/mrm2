<template>
  <div class="cost-centers">
    <v-card>
      <v-card-title>
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon class="me-2">mdi-office-building-marker</v-icon>
            Центры затрат
          </div>
          <div class="d-flex align-center gap-2">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск центров затрат"
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
        <!-- Таблица центров затрат -->
        <v-data-table
          :headers="headers"
          :items="filteredCostCenters"
          :search="searchQuery"
          class="elevation-0"
          item-value="id"
        >
          <template v-slot:item.isActive="{ item }">
            <v-chip
              :color="item.isActive ? 'success' : 'grey'"
              size="small"
              variant="tonal"
            >
              {{ item.isActive ? 'Активен' : 'Неактивен' }}
            </v-chip>
          </template>

          <template v-slot:item.manager="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" class="me-2">
                <span class="text-caption">{{ getInitials(item.manager) }}</span>
              </v-avatar>
              {{ item.manager }}
            </div>
          </template>

          <template v-slot:item.budget="{ item }">
            <div class="text-right">
              {{ formatCurrency(item.budget) }}
            </div>
          </template>

          <template v-slot:item.spent="{ item }">
            <div class="text-right">
              <div>{{ formatCurrency(item.spent) }}</div>
              <v-progress-linear
                :model-value="(item.spent / item.budget) * 100"
                :color="getSpentColor(item.spent, item.budget)"
                height="4"
                class="mt-1"
              />
            </div>
          </template>

          <template v-slot:item.actions="{ item }">
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
                <v-list-item @click="editCostCenter(item)">
                  <v-list-item-title>
                    <v-icon class="me-2">mdi-pencil</v-icon>
                    Редактировать
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="viewDetails(item)">
                  <v-list-item-title>
                    <v-icon class="me-2">mdi-eye</v-icon>
                    Подробнее
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="assignUsers(item)">
                  <v-list-item-title>
                    <v-icon class="me-2">mdi-account-group</v-icon>
                    Пользователи
                  </v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item @click="deleteCostCenter(item)">
                  <v-list-item-title class="text-error">
                    <v-icon class="me-2">mdi-delete</v-icon>
                    Удалить
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Диалог создания/редактирования -->
    <v-dialog v-model="showCreateDialog" max-width="800">
      <v-card>
        <v-card-title>
          {{ editingCostCenter ? 'Редактировать центр затрат' : 'Создать центр затрат' }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveCostCenter">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="costCenterForm.name"
                  label="Название центра затрат"
                  variant="outlined"
                  required
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="costCenterForm.code"
                  label="Код центра затрат"
                  variant="outlined"
                  required
                  :rules="[rules.required]"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="costCenterForm.description"
                  label="Описание"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="costCenterForm.manager"
                  :items="managers"
                  label="Менеджер центра затрат"
                  variant="outlined"
                  required
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="costCenterForm.department"
                  :items="departments"
                  label="Отдел"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="costCenterForm.budget"
                  label="Годовой бюджет"
                  variant="outlined"
                  type="number"
                  min="0"
                  suffix="₽"
                  required
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="costCenterForm.currency"
                  :items="currencies"
                  label="Валюта"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="costCenterForm.location"
                  label="Местоположение"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="costCenterForm.type"
                  :items="costCenterTypes"
                  label="Тип центра затрат"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="costCenterForm.isActive"
                  label="Активен"
                  color="primary"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="costCenterForm.allowOverspend"
                  label="Разрешить превышение бюджета"
                  color="primary"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="costCenterForm.requireApproval"
                  label="Требует утверждения расходов"
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
            @click="saveCostCenter"
            :loading="isSaving"
          >
            {{ editingCostCenter ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог назначения пользователей -->
    <v-dialog v-model="showUsersDialog" max-width="600">
      <v-card>
        <v-card-title>
          Пользователи центра затрат: {{ selectedCostCenter?.name }}
        </v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="assignedUsers"
            :items="allUsers"
            label="Назначенные пользователи"
            variant="outlined"
            multiple
            chips
            closable-chips
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showUsersDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="saveUserAssignments"
            :loading="isAssigning"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/appStore'

export default {
  name: 'CostCenters',
  setup() {
    const appStore = useAppStore()

    const searchQuery = ref('')
    const showCreateDialog = ref(false)
    const showUsersDialog = ref(false)
    const isSaving = ref(false)
    const isAssigning = ref(false)
    const editingCostCenter = ref(null)
    const selectedCostCenter = ref(null)
    const assignedUsers = ref([])

    const headers = ref([
      { title: 'Название', key: 'name', sortable: true },
      { title: 'Код', key: 'code', sortable: true },
      { title: 'Менеджер', key: 'manager', sortable: true },
      { title: 'Отдел', key: 'department', sortable: true },
      { title: 'Бюджет', key: 'budget', sortable: true, align: 'end' },
      { title: 'Потрачено', key: 'spent', sortable: true, align: 'end' },
      { title: 'Статус', key: 'isActive', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false, width: '100px' }
    ])

    const costCenters = ref([
      {
        id: '1',
        name: 'Маркетинг и продажи',
        code: 'MKT-001',
        description: 'Центр затрат отдела маркетинга',
        manager: 'Анна Петрова',
        department: 'Маркетинг',
        budget: 5000000,
        spent: 3200000,
        currency: 'RUB',
        location: 'Москва',
        type: 'marketing',
        isActive: true,
        allowOverspend: false,
        requireApproval: true
      },
      {
        id: '2',
        name: 'IT и разработка',
        code: 'IT-001',
        description: 'Центр затрат IT отдела',
        manager: 'Дмитрий Иванов',
        department: 'IT',
        budget: 3000000,
        spent: 1800000,
        currency: 'RUB',
        location: 'Москва',
        type: 'technology',
        isActive: true,
        allowOverspend: true,
        requireApproval: true
      },
      {
        id: '3',
        name: 'Операционные расходы',
        code: 'OPS-001',
        description: 'Операционные расходы компании',
        manager: 'Елена Сидорова',
        department: 'Операции',
        budget: 2000000,
        spent: 1200000,
        currency: 'RUB',
        location: 'Москва',
        type: 'operations',
        isActive: true,
        allowOverspend: false,
        requireApproval: false
      }
    ])

    const costCenterForm = ref({
      name: '',
      code: '',
      description: '',
      manager: '',
      department: '',
      budget: 0,
      currency: 'RUB',
      location: '',
      type: '',
      isActive: true,
      allowOverspend: false,
      requireApproval: true
    })

    const managers = ref([
      'Анна Петрова',
      'Дмитрий Иванов',
      'Елена Сидорова',
      'Михаил Козлов',
      'Ольга Смирнова'
    ])

    const departments = ref([
      { title: 'Маркетинг', value: 'Маркетинг' },
      { title: 'IT', value: 'IT' },
      { title: 'Операции', value: 'Операции' },
      { title: 'Финансы', value: 'Финансы' },
      { title: 'HR', value: 'HR' }
    ])

    const currencies = ref([
      { title: 'Российский рубль (₽)', value: 'RUB' },
      { title: 'Доллар США ($)', value: 'USD' },
      { title: 'Евро (€)', value: 'EUR' }
    ])

    const costCenterTypes = ref([
      { title: 'Маркетинг', value: 'marketing' },
      { title: 'Технологии', value: 'technology' },
      { title: 'Операции', value: 'operations' },
      { title: 'Финансы', value: 'finance' },
      { title: 'HR', value: 'hr' },
      { title: 'Другое', value: 'other' }
    ])

    const allUsers = ref([
      'Анна Петрова',
      'Дмитрий Иванов',
      'Елена Сидорова',
      'Михаил Козлов',
      'Ольга Смирнова',
      'Сергей Волков',
      'Мария Николаева',
      'Александр Федоров'
    ])

    const rules = {
      required: (value) => !!value || 'Поле обязательно для заполнения'
    }

    // Computed
    const filteredCostCenters = computed(() => {
      if (!searchQuery.value) return costCenters.value

      const query = searchQuery.value.toLowerCase()
      return costCenters.value.filter(center =>
        center.name.toLowerCase().includes(query) ||
        center.code.toLowerCase().includes(query) ||
        center.manager.toLowerCase().includes(query) ||
        center.department.toLowerCase().includes(query)
      )
    })

    // Methods
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const getInitials = (name) => {
      return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
    }

    const getSpentColor = (spent, budget) => {
      const percentage = (spent / budget) * 100
      if (percentage >= 90) return 'error'
      if (percentage >= 75) return 'warning'
      return 'success'
    }

    const editCostCenter = (costCenter) => {
      editingCostCenter.value = costCenter
      costCenterForm.value = { ...costCenter }
      showCreateDialog.value = true
    }

    const viewDetails = (costCenter) => {
      console.log('View details for:', costCenter)
      // TODO: Implement details view
    }

    const assignUsers = (costCenter) => {
      selectedCostCenter.value = costCenter
      assignedUsers.value = costCenter.users || []
      showUsersDialog.value = true
    }

    const deleteCostCenter = (costCenter) => {
      // TODO: Implement delete with confirmation
      console.log('Delete cost center:', costCenter)
    }

    const saveCostCenter = async () => {
      try {
        isSaving.value = true
        // TODO: Implement save logic
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (editingCostCenter.value) {
          appStore.showSuccess('Центр затрат обновлен успешно')
        } else {
          appStore.showSuccess('Центр затрат создан успешно')
        }

        cancelEdit()
      } catch (error) {
        console.error('Error saving cost center:', error)
        appStore.showError('Ошибка сохранения центра затрат')
      } finally {
        isSaving.value = false
      }
    }

    const saveUserAssignments = async () => {
      try {
        isAssigning.value = true
        // TODO: Implement user assignment logic
        await new Promise(resolve => setTimeout(resolve, 1000))
        appStore.showSuccess('Пользователи назначены успешно')
        showUsersDialog.value = false
      } catch (error) {
        console.error('Error assigning users:', error)
        appStore.showError('Ошибка назначения пользователей')
      } finally {
        isAssigning.value = false
      }
    }

    const cancelEdit = () => {
      showCreateDialog.value = false
      editingCostCenter.value = null
      costCenterForm.value = {
        name: '',
        code: '',
        description: '',
        manager: '',
        department: '',
        budget: 0,
        currency: 'RUB',
        location: '',
        type: '',
        isActive: true,
        allowOverspend: false,
        requireApproval: true
      }
    }

    return {
      searchQuery,
      showCreateDialog,
      showUsersDialog,
      isSaving,
      isAssigning,
      editingCostCenter,
      selectedCostCenter,
      assignedUsers,
      headers,
      costCenters,
      costCenterForm,
      managers,
      departments,
      currencies,
      costCenterTypes,
      allUsers,
      rules,
      filteredCostCenters,
      formatCurrency,
      getInitials,
      getSpentColor,
      editCostCenter,
      viewDetails,
      assignUsers,
      deleteCostCenter,
      saveCostCenter,
      saveUserAssignments,
      cancelEdit
    }
  }
}
</script>

<style scoped>
.cost-centers {
  max-width: 100%;
}
</style>