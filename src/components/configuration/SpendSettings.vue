<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-wallet-circle</v-icon>
      Управление расходами
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Создать категорию
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Вложенное меню настроек расходов -->
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-list nav density="compact">
              <v-list-subheader>Настройки расходов</v-list-subheader>

              <v-list-item
                v-for="item in spendSections"
                :key="item.id"
                :value="item.id"
                :active="selectedSpendSection === item.id"
                @click="selectedSpendSection = item.id"
              >
                <template v-slot:prepend>
                  <v-icon :icon="item.icon" />
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
                <template v-slot:append v-if="item.badge">
                  <v-chip size="small" color="primary">{{ item.badge }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Контент настроек расходов -->
        <v-col cols="12" md="8">
          <!-- Категории расходов -->
          <template v-if="selectedSpendSection === 'categories'">
            <SpendCategories />
          </template>

          <!-- Центры затрат -->
          <template v-if="selectedSpendSection === 'cost-centers'">
            <CostCenters />
          </template>

          <!-- Правила распределения -->
          <template v-if="selectedSpendSection === 'allocation-rules'">
            <AllocationRules />
          </template>

          <!-- Бюджетные лимиты -->
          <template v-if="selectedSpendSection === 'budget-limits'">
            <v-alert type="info" variant="tonal">
              Лимиты бюджета будут добавлены позже
            </v-alert>
          </template>

          <!-- Процессы утверждения -->
          <template v-if="selectedSpendSection === 'approval-workflows'">
            <v-alert type="info" variant="tonal">
              Процессы утверждения будут добавлены позже
            </v-alert>
          </template>

          <!-- Отчетность -->
          <template v-if="selectedSpendSection === 'reporting'">
            <v-alert type="info" variant="tonal">
              Отчетность расходов будет добавлена позже
            </v-alert>
          </template>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Диалог создания категории -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Создать новую категорию расходов</v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="isFormValid">
            <v-text-field
              v-model="newCategory.name"
              label="Название категории"
              variant="outlined"
              :rules="[v => !!v || 'Название обязательно']"
              required
            />
            <v-textarea
              v-model="newCategory.description"
              label="Описание"
              variant="outlined"
              rows="3"
            />
            <v-select
              v-model="newCategory.parent_id"
              :items="categoryOptions"
              label="Родительская категория"
              variant="outlined"
              clearable
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreateDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!isFormValid"
            :loading="isSaving"
            @click="createCategory"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/appStore'
import SpendCategories from '@/components/spend/SpendCategories.vue'
import CostCenters from '@/components/spend/CostCenters.vue'
import AllocationRules from '@/components/spend/AllocationRules.vue'

const appStore = useAppStore()

const selectedSpendSection = ref('categories')
const showCreateDialog = ref(false)
const isFormValid = ref(false)
const isSaving = ref(false)

const newCategory = ref({
  name: '',
  description: '',
  parent_id: null
})

const spendSections = ref([
  {
    id: 'categories',
    title: 'Категории расходов',
    icon: 'mdi-tag-multiple',
    badge: null
  },
  {
    id: 'cost-centers',
    title: 'Центры затрат',
    icon: 'mdi-office-building',
    badge: null
  },
  {
    id: 'allocation-rules',
    title: 'Правила распределения',
    icon: 'mdi-chart-pie',
    badge: null
  },
  {
    id: 'budget-limits',
    title: 'Бюджетные лимиты',
    icon: 'mdi-speedometer',
    badge: 'Soon'
  },
  {
    id: 'approval-workflows',
    title: 'Процессы утверждения',
    icon: 'mdi-check-circle',
    badge: 'Soon'
  },
  {
    id: 'reporting',
    title: 'Отчетность',
    icon: 'mdi-file-chart',
    badge: 'Soon'
  }
])

const categoryOptions = ref([
  { title: 'Маркетинг', value: 'marketing' },
  { title: 'Реклама', value: 'advertising' },
  { title: 'Мероприятия', value: 'events' }
])

const createCategory = async () => {
  try {
    isSaving.value = true
    // TODO: Реализовать API вызов
    console.log('Создание категории:', newCategory.value)
    appStore.showSuccess('Категория расходов создана успешно')
    showCreateDialog.value = false
    newCategory.value = { name: '', description: '', parent_id: null }
  } catch (error) {
    console.error('Error creating category:', error)
    appStore.showError('Ошибка создания категории')
  } finally {
    isSaving.value = false
  }
}
</script>