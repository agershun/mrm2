<template>
  <div class="allocation-rules">
    <v-card>
      <v-card-title>
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon class="me-2">mdi-percent</v-icon>
            Правила распределения
          </div>
          <div class="d-flex align-center gap-2">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск правил"
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
              Добавить правило
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <!-- Таблица правил -->
        <v-data-table
          :headers="headers"
          :items="filteredRules"
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
              {{ item.isActive ? 'Активно' : 'Неактивно' }}
            </v-chip>
          </template>

          <template v-slot:item.type="{ item }">
            <v-chip
              :color="getRuleTypeColor(item.type)"
              size="small"
              variant="outlined"
            >
              {{ getRuleTypeLabel(item.type) }}
            </v-chip>
          </template>

          <template v-slot:item.allocations="{ item }">
            <div class="allocations-preview">
              <v-chip
                v-for="allocation in item.allocations.slice(0, 2)"
                :key="allocation.id"
                size="small"
                variant="tonal"
                class="me-1 mb-1"
              >
                {{ allocation.costCenter }}: {{ allocation.percentage }}%
              </v-chip>
              <v-chip
                v-if="item.allocations.length > 2"
                size="small"
                variant="outlined"
                class="me-1"
              >
                +{{ item.allocations.length - 2 }}
              </v-chip>
            </div>
          </template>

          <template v-slot:item.priority="{ item }">
            <v-rating
              :model-value="item.priority"
              readonly
              size="small"
              color="primary"
              length="3"
            />
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
                <v-list-item @click="editRule(item)">
                  <v-list-item-title>
                    <v-icon class="me-2">mdi-pencil</v-icon>
                    Редактировать
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="duplicateRule(item)">
                  <v-list-item-title>
                    <v-icon class="me-2">mdi-content-copy</v-icon>
                    Дублировать
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="testRule(item)">
                  <v-list-item-title>
                    <v-icon class="me-2">mdi-play</v-icon>
                    Тестировать
                  </v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item @click="deleteRule(item)">
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
    <v-dialog v-model="showCreateDialog" max-width="900">
      <v-card>
        <v-card-title>
          {{ editingRule ? 'Редактировать правило' : 'Создать правило распределения' }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveRule">
            <!-- Основная информация -->
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="ruleForm.name"
                  label="Название правила"
                  variant="outlined"
                  required
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="ruleForm.type"
                  :items="ruleTypes"
                  label="Тип правила"
                  variant="outlined"
                  required
                  :rules="[rules.required]"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="ruleForm.description"
                  label="Описание"
                  variant="outlined"
                  rows="2"
                />
              </v-col>
            </v-row>

            <!-- Условия применения -->
            <div class="mb-4">
              <h3 class="text-h6 mb-3">Условия применения</h3>

              <v-row>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="ruleForm.categories"
                    :items="spendCategories"
                    label="Категории расходов"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="ruleForm.departments"
                    :items="departments"
                    label="Отделы"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="ruleForm.minAmount"
                    label="Минимальная сумма"
                    variant="outlined"
                    type="number"
                    min="0"
                    suffix="₽"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="ruleForm.maxAmount"
                    label="Максимальная сумма"
                    variant="outlined"
                    type="number"
                    min="0"
                    suffix="₽"
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Распределение -->
            <div class="mb-4">
              <h3 class="text-h6 mb-3">Распределение по центрам затрат</h3>

              <div
                v-for="(allocation, index) in ruleForm.allocations"
                :key="index"
                class="allocation-item mb-3"
              >
                <v-row>
                  <v-col cols="12" md="5">
                    <v-select
                      v-model="allocation.costCenter"
                      :items="costCenters"
                      label="Центр затрат"
                      variant="outlined"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model.number="allocation.percentage"
                      label="Процент"
                      variant="outlined"
                      type="number"
                      min="0"
                      max="100"
                      suffix="%"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-select
                      v-model="allocation.method"
                      :items="allocationMethods"
                      label="Метод"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="1">
                    <v-btn
                      icon
                      variant="text"
                      color="error"
                      @click="removeAllocation(index)"
                      :disabled="ruleForm.allocations.length <= 1"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </div>

              <v-btn
                variant="outlined"
                @click="addAllocation"
                class="mb-3"
              >
                <v-icon class="me-2">mdi-plus</v-icon>
                Добавить распределение
              </v-btn>

              <!-- Проверка общего процента -->
              <v-alert
                v-if="totalPercentage !== 100"
                :type="totalPercentage > 100 ? 'error' : 'warning'"
                variant="tonal"
                class="mb-3"
              >
                Общий процент распределения: {{ totalPercentage }}%
                {{ totalPercentage !== 100 ? ' (должно быть 100%)' : '' }}
              </v-alert>
            </div>

            <!-- Настройки -->
            <v-row>
              <v-col cols="12" md="4">
                <v-slider
                  v-model="ruleForm.priority"
                  label="Приоритет"
                  min="1"
                  max="3"
                  step="1"
                  thumb-label
                  ticks
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="ruleForm.isActive"
                  label="Активно"
                  color="primary"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="ruleForm.autoApply"
                  label="Автоматическое применение"
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
            @click="saveRule"
            :loading="isSaving"
            :disabled="totalPercentage !== 100"
          >
            {{ editingRule ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог тестирования правила -->
    <v-dialog v-model="showTestDialog" max-width="600">
      <v-card>
        <v-card-title>Тестирование правила</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="runTest">
            <v-text-field
              v-model.number="testAmount"
              label="Сумма для тестирования"
              variant="outlined"
              type="number"
              min="0"
              suffix="₽"
              required
            />

            <v-select
              v-model="testCategory"
              :items="spendCategories"
              label="Категория расходов"
              variant="outlined"
              required
            />

            <v-select
              v-model="testDepartment"
              :items="departments"
              label="Отдел"
              variant="outlined"
              required
            />

            <!-- Результаты тестирования -->
            <div v-if="testResults" class="mt-4">
              <h4 class="text-h6 mb-3">Результат распределения:</h4>
              <v-table>
                <thead>
                  <tr>
                    <th>Центр затрат</th>
                    <th>Процент</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="result in testResults" :key="result.costCenter">
                    <td>{{ result.costCenter }}</td>
                    <td>{{ result.percentage }}%</td>
                    <td>{{ formatCurrency(result.amount) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showTestDialog = false">Закрыть</v-btn>
          <v-btn
            color="primary"
            @click="runTest"
            :loading="isTesting"
          >
            Тестировать
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
  name: 'AllocationRules',
  setup() {
    const appStore = useAppStore()

    const searchQuery = ref('')
    const showCreateDialog = ref(false)
    const showTestDialog = ref(false)
    const isSaving = ref(false)
    const isTesting = ref(false)
    const editingRule = ref(null)
    const testAmount = ref(100000)
    const testCategory = ref('')
    const testDepartment = ref('')
    const testResults = ref(null)

    const headers = ref([
      { title: 'Название', key: 'name', sortable: true },
      { title: 'Тип', key: 'type', sortable: true },
      { title: 'Распределение', key: 'allocations', sortable: false },
      { title: 'Приоритет', key: 'priority', sortable: true },
      { title: 'Статус', key: 'isActive', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false, width: '100px' }
    ])

    const rules = ref([
      {
        id: '1',
        name: 'Маркетинговые расходы',
        description: 'Распределение маркетинговых расходов между центрами затрат',
        type: 'category',
        categories: ['Маркетинг'],
        departments: ['Маркетинг'],
        minAmount: 0,
        maxAmount: null,
        priority: 2,
        isActive: true,
        autoApply: true,
        allocations: [
          { costCenter: 'MKT-001', percentage: 60, method: 'fixed' },
          { costCenter: 'OPS-001', percentage: 40, method: 'proportional' }
        ]
      },
      {
        id: '2',
        name: 'IT инфраструктура',
        description: 'Распределение IT расходов',
        type: 'department',
        categories: ['IT'],
        departments: ['IT'],
        minAmount: 50000,
        maxAmount: null,
        priority: 1,
        isActive: true,
        autoApply: false,
        allocations: [
          { costCenter: 'IT-001', percentage: 80, method: 'fixed' },
          { costCenter: 'OPS-001', percentage: 20, method: 'proportional' }
        ]
      }
    ])

    const ruleForm = ref({
      name: '',
      description: '',
      type: '',
      categories: [],
      departments: [],
      minAmount: 0,
      maxAmount: null,
      priority: 2,
      isActive: true,
      autoApply: true,
      allocations: [
        { costCenter: '', percentage: 100, method: 'fixed' }
      ]
    })

    const ruleTypes = ref([
      { title: 'По категории', value: 'category' },
      { title: 'По отделу', value: 'department' },
      { title: 'По сумме', value: 'amount' },
      { title: 'Комбинированное', value: 'combined' }
    ])

    const spendCategories = ref([
      'Маркетинг',
      'IT',
      'Операции',
      'Персонал',
      'Офисные расходы'
    ])

    const departments = ref([
      'Маркетинг',
      'IT',
      'Операции',
      'Финансы',
      'HR'
    ])

    const costCenters = ref([
      { title: 'Маркетинг и продажи (MKT-001)', value: 'MKT-001' },
      { title: 'IT и разработка (IT-001)', value: 'IT-001' },
      { title: 'Операционные расходы (OPS-001)', value: 'OPS-001' }
    ])

    const allocationMethods = ref([
      { title: 'Фиксированный', value: 'fixed' },
      { title: 'Пропорциональный', value: 'proportional' },
      { title: 'По активности', value: 'activity' }
    ])

    const rules_validation = {
      required: (value) => !!value || 'Поле обязательно для заполнения'
    }

    // Computed
    const filteredRules = computed(() => {
      if (!searchQuery.value) return rules.value

      const query = searchQuery.value.toLowerCase()
      return rules.value.filter(rule =>
        rule.name.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.type.toLowerCase().includes(query)
      )
    })

    const totalPercentage = computed(() => {
      return ruleForm.value.allocations.reduce((sum, allocation) => {
        return sum + (allocation.percentage || 0)
      }, 0)
    })

    // Methods
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const getRuleTypeColor = (type) => {
      const colors = {
        category: 'primary',
        department: 'success',
        amount: 'warning',
        combined: 'info'
      }
      return colors[type] || 'grey'
    }

    const getRuleTypeLabel = (type) => {
      const labels = {
        category: 'По категории',
        department: 'По отделу',
        amount: 'По сумме',
        combined: 'Комбинированное'
      }
      return labels[type] || type
    }

    const editRule = (rule) => {
      editingRule.value = rule
      ruleForm.value = JSON.parse(JSON.stringify(rule))
      showCreateDialog.value = true
    }

    const duplicateRule = (rule) => {
      ruleForm.value = {
        ...JSON.parse(JSON.stringify(rule)),
        name: rule.name + ' (копия)',
        id: undefined
      }
      editingRule.value = null
      showCreateDialog.value = true
    }

    const testRule = (rule) => {
      editingRule.value = rule
      testResults.value = null
      showTestDialog.value = true
    }

    const deleteRule = (rule) => {
      // TODO: Implement delete with confirmation
      console.log('Delete rule:', rule)
    }

    const addAllocation = () => {
      ruleForm.value.allocations.push({
        costCenter: '',
        percentage: 0,
        method: 'fixed'
      })
    }

    const removeAllocation = (index) => {
      ruleForm.value.allocations.splice(index, 1)
    }

    const saveRule = async () => {
      try {
        isSaving.value = true
        // TODO: Implement save logic
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (editingRule.value) {
          appStore.showSuccess('Правило обновлено успешно')
        } else {
          appStore.showSuccess('Правило создано успешно')
        }

        cancelEdit()
      } catch (error) {
        console.error('Error saving rule:', error)
        appStore.showError('Ошибка сохранения правила')
      } finally {
        isSaving.value = false
      }
    }

    const runTest = async () => {
      try {
        isTesting.value = true
        // TODO: Implement test logic
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Симуляция результатов тестирования
        const rule = editingRule.value
        testResults.value = rule.allocations.map(allocation => ({
          costCenter: allocation.costCenter,
          percentage: allocation.percentage,
          amount: (testAmount.value * allocation.percentage) / 100
        }))

      } catch (error) {
        console.error('Error testing rule:', error)
        appStore.showError('Ошибка тестирования правила')
      } finally {
        isTesting.value = false
      }
    }

    const cancelEdit = () => {
      showCreateDialog.value = false
      editingRule.value = null
      ruleForm.value = {
        name: '',
        description: '',
        type: '',
        categories: [],
        departments: [],
        minAmount: 0,
        maxAmount: null,
        priority: 2,
        isActive: true,
        autoApply: true,
        allocations: [
          { costCenter: '', percentage: 100, method: 'fixed' }
        ]
      }
    }

    return {
      searchQuery,
      showCreateDialog,
      showTestDialog,
      isSaving,
      isTesting,
      editingRule,
      testAmount,
      testCategory,
      testDepartment,
      testResults,
      headers,
      rules,
      ruleForm,
      ruleTypes,
      spendCategories,
      departments,
      costCenters,
      allocationMethods,
      rules: rules_validation,
      filteredRules,
      totalPercentage,
      formatCurrency,
      getRuleTypeColor,
      getRuleTypeLabel,
      editRule,
      duplicateRule,
      testRule,
      deleteRule,
      addAllocation,
      removeAllocation,
      saveRule,
      runTest,
      cancelEdit
    }
  }
}
</script>

<style scoped>
.allocation-rules {
  max-width: 100%;
}

.allocations-preview {
  max-width: 200px;
}

.allocation-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}
</style>