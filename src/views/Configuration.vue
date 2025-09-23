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

        <!-- Products Settings -->
        <template v-if="selectedSection === 'products'">
          <ProductsSettings />
        </template>

        <!-- Geography Settings -->
        <template v-if="selectedSection === 'geography'">
          <GeographySettings />
        </template>

        <!-- Team Allocations Settings -->
        <template v-if="selectedSection === 'team-allocations'">
          <TeamAllocationsSettings />
        </template>

        <!-- Placements Settings -->
        <template v-if="selectedSection === 'placements'">
          <PlacementsSettings />
        </template>

        <!-- KPI Hierarchies Settings -->
        <template v-if="selectedSection === 'kpi-hierarchies'">
          <KPIHierarchiesSettings />
        </template>

        <!-- Cross Channel Links Settings -->
        <template v-if="selectedSection === 'cross-channel-links'">
          <CrossChannelLinksSettings />
        </template>

        <!-- Ad Formats Settings -->
        <template v-if="selectedSection === 'ad-formats'">
          <AdFormatsSettings />
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
import ProductsSettings from '@/components/configuration/ProductsSettings.vue'
import GeographySettings from '@/components/configuration/GeographySettings.vue'
import TeamAllocationsSettings from '@/components/configuration/TeamAllocationsSettings.vue'
import PlacementsSettings from '@/components/configuration/PlacementsSettings.vue'
import KPIHierarchiesSettings from '@/components/configuration/KPIHierarchiesSettings.vue'
import CrossChannelLinksSettings from '@/components/configuration/CrossChannelLinksSettings.vue'
import AdFormatsSettings from '@/components/configuration/AdFormatsSettings.vue'

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
  },
  {
    id: 'products',
    title: 'Продукты',
    icon: 'mdi-package-variant',
    description: 'Управление продуктовыми линиями и их характеристиками'
  },
  {
    id: 'geography',
    title: 'География',
    icon: 'mdi-map',
    description: 'Настройка географической структуры планирования'
  },
  {
    id: 'team-allocations',
    title: 'Распределение команды',
    icon: 'mdi-account-group',
    description: 'Планирование FTE и ресурсов команды'
  },
  {
    id: 'placements',
    title: 'Размещения',
    icon: 'mdi-web',
    description: 'Директория рекламных размещений'
  },
  {
    id: 'kpi-hierarchies',
    title: 'Иерархии KPI',
    icon: 'mdi-chart-timeline-variant',
    description: 'Настройка иерархических связей показателей'
  },
  {
    id: 'cross-channel-links',
    title: 'Кросс-канальные связи',
    icon: 'mdi-link-variant',
    description: 'Связи влияния между каналами маркетинга'
  },
  {
    id: 'ad-formats',
    title: 'Рекламные форматы',
    icon: 'mdi-format-size',
    description: 'Технические характеристики рекламных форматов'
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