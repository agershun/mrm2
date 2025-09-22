<template>
  <div class="configuration-view">
    <!-- Заголовок -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Конфигурация</h1>
        <p class="text-body-1 text-medium-emphasis">
          Настройка основного функционала системы: стратегия, активности, бюджеты и инвестиции
        </p>
      </div>
      <v-spacer />

      <!-- Поиск настроек -->
      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        label="Поиск настроек"
        variant="outlined"
        density="compact"
        style="width: 300px"
        clearable
      />
    </div>

    <v-row>
      <!-- Боковое меню -->
      <v-col cols="12" md="3">
        <v-card>
          <v-list nav>
            <v-list-subheader>Конфигурация системы</v-list-subheader>

            <v-list-item
              v-for="item in filteredMenuItems"
              :key="item.id"
              :value="item.id"
              :active="selectedSection === item.id"
              @click="selectedSection = item.id"
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

      <!-- Основной контент -->
      <v-col cols="12" md="9">
        <!-- Strategy Settings -->
        <template v-if="selectedSection === 'strategy'">
          <StrategySettings />
        </template>

        <!-- Activities Settings -->
        <template v-if="selectedSection === 'activities'">
          <ActivitiesSettings />
        </template>

        <!-- Attributes Settings -->
        <template v-if="selectedSection === 'attributes'">
          <AttributesSettings />
        </template>

        <!-- Budgets & Investments Settings -->
        <template v-if="selectedSection === 'budgets-investments'">
          <BudgetsInvestmentsSettings />
        </template>

        <!-- Spend Settings -->
        <template v-if="selectedSection === 'spend'">
          <SpendSettings />
        </template>

        <!-- KPI Settings -->
        <template v-if="selectedSection === 'kpis'">
          <KPISettings />
        </template>

        <!-- Import & Export Settings -->
        <template v-if="selectedSection === 'import-export'">
          <ImportExportSettings />
        </template>

        <!-- Funnel Settings -->
        <template v-if="selectedSection === 'funnel'">
          <FunnelSettings />
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StrategySettings from '@/components/configuration/StrategySettings.vue'
import ActivitiesSettings from '@/components/configuration/ActivitiesSettings.vue'
import AttributesSettings from '@/components/configuration/AttributesSettings.vue'
import BudgetsInvestmentsSettings from '@/components/configuration/BudgetsInvestmentsSettings.vue'
import SpendSettings from '@/components/configuration/SpendSettings.vue'
import KPISettings from '@/components/configuration/KPISettings.vue'
import ImportExportSettings from '@/components/configuration/ImportExportSettings.vue'
import FunnelSettings from '@/components/configuration/FunnelSettings.vue'

const selectedSection = ref('strategy')
const searchQuery = ref('')

const configurationSections = ref([
  {
    id: 'strategy',
    title: 'Настройки стратегии',
    icon: 'mdi-target',
    description: 'Настройки периодов, типов целей и KPI категорий'
  },
  {
    id: 'activities',
    title: 'Настройки активностей',
    icon: 'mdi-calendar-multiple',
    description: 'Типы активностей, группы и правила иерархии'
  },
  {
    id: 'attributes',
    title: 'Атрибуты и поля',
    icon: 'mdi-form-textbox',
    description: 'Определения атрибутов, списки значений и зависимости'
  },
  {
    id: 'budgets-investments',
    title: 'Бюджеты и инвестиции',
    icon: 'mdi-chart-line',
    description: 'Настройки колонок, тегов и сценариев'
  },
  {
    id: 'spend',
    title: 'Управление расходами',
    icon: 'mdi-wallet',
    description: 'Категории расходов, центры затрат и правила'
  },
  {
    id: 'kpis',
    title: 'KPI и метрики',
    icon: 'mdi-speedometer',
    description: 'Справочник KPI и настройки расчетов'
  },
  {
    id: 'import-export',
    title: 'Импорт и экспорт',
    icon: 'mdi-import',
    description: 'Шаблоны импорта и запланированные операции'
  },
  {
    id: 'funnel',
    title: 'Настройки воронки',
    icon: 'mdi-funnel',
    description: 'Стадии воронки продаж и исключения'
  }
])

const filteredMenuItems = computed(() => {
  if (!searchQuery.value) {
    return configurationSections.value
  }

  const query = searchQuery.value.toLowerCase()
  return configurationSections.value.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  )
})
</script>

<style scoped>
.configuration-view {
  padding: 24px;
  height: 100vh;
  overflow: auto;
}
</style>