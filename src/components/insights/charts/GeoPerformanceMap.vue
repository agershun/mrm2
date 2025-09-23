<template>
  <div class="geo-performance-map">
    <v-card>
      <v-card-title>Географическая производительность</v-card-title>
      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-2">Загрузка карты...</p>
        </div>

        <div v-else-if="!data || data.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2">mdi-map-outline</v-icon>
          <p class="text-grey mt-2">Нет данных для отображения</p>
        </div>

        <div v-else class="map-container">
          <!-- Список регионов с показателями -->
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1">Топ регионы по доходам</v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item
                      v-for="region in topRevenueRegions"
                      :key="region.region"
                    >
                      <template #prepend>
                        <v-avatar :color="getRegionColor(region.revenue)" size="24">
                          <span class="text-caption">{{ region.position }}</span>
                        </v-avatar>
                      </template>

                      <v-list-item-title>{{ region.region }}</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ formatCurrency(region.revenue) }} • {{ region.campaigns }} кампаний
                      </v-list-item-subtitle>

                      <template #append>
                        <v-chip size="small" :color="getRoiColor(region.roi)">
                          {{ region.roi }}% ROI
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1">Показатели по федеральным округам</v-card-title>
                <v-card-text>
                  <div v-for="district in federalDistricts" :key="district.name" class="mb-3">
                    <div class="d-flex justify-space-between align-center mb-1">
                      <span class="text-body-2 font-weight-medium">{{ district.name }}</span>
                      <span class="text-caption">{{ formatCurrency(district.revenue) }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="district.percentage"
                      :color="getDistrictColor(district.performance)"
                      height="6"
                      rounded
                    />
                    <div class="d-flex justify-space-between align-center mt-1">
                      <span class="text-caption text-grey">{{ district.regions }} регионов</span>
                      <span class="text-caption text-grey">{{ district.roi }}% ROI</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Сводка по регионам -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1">Детализация по регионам</v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="tableHeaders"
                    :items="regionDetails"
                    :items-per-page="10"
                    density="compact"
                  >
                    <template #item.revenue="{ item }">
                      {{ formatCurrency(item.revenue) }}
                    </template>

                    <template #item.roi="{ item }">
                      <v-chip size="small" :color="getRoiColor(item.roi)">
                        {{ item.roi }}%
                      </v-chip>
                    </template>

                    <template #item.performance="{ item }">
                      <v-progress-linear
                        :model-value="item.performance"
                        :color="getPerformanceColor(item.performance)"
                        height="4"
                        rounded
                      />
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const tableHeaders = [
  { title: 'Регион', key: 'region', sortable: true },
  { title: 'Доходы', key: 'revenue', sortable: true },
  { title: 'ROI', key: 'roi', sortable: true },
  { title: 'Кампании', key: 'campaigns', sortable: true },
  { title: 'Производительность', key: 'performance', sortable: true }
]

const topRevenueRegions = computed(() => {
  return [...props.data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((region, index) => ({
      ...region,
      position: index + 1
    }))
})

const federalDistricts = computed(() => {
  const districts = {}
  const maxRevenue = Math.max(...props.data.map(r => r.revenue))

  props.data.forEach(region => {
    const district = region.federal_district || 'Другие'
    if (!districts[district]) {
      districts[district] = {
        name: district,
        revenue: 0,
        regions: 0,
        totalRoi: 0
      }
    }
    districts[district].revenue += region.revenue
    districts[district].regions += 1
    districts[district].totalRoi += region.roi
  })

  return Object.values(districts).map(district => ({
    ...district,
    roi: Math.round(district.totalRoi / district.regions),
    percentage: (district.revenue / maxRevenue) * 100,
    performance: (district.revenue / maxRevenue) * 100
  }))
})

const regionDetails = computed(() => {
  const maxRevenue = Math.max(...props.data.map(r => r.revenue))

  return props.data.map(region => ({
    ...region,
    performance: (region.revenue / maxRevenue) * 100
  }))
})

const getRegionColor = (revenue) => {
  const maxRevenue = Math.max(...props.data.map(r => r.revenue))
  const percentage = (revenue / maxRevenue) * 100

  if (percentage >= 80) return 'success'
  if (percentage >= 60) return 'info'
  if (percentage >= 40) return 'warning'
  return 'error'
}

const getRoiColor = (roi) => {
  if (roi >= 300) return 'success'
  if (roi >= 200) return 'info'
  if (roi >= 100) return 'warning'
  return 'error'
}

const getDistrictColor = (performance) => {
  if (performance >= 80) return 'success'
  if (performance >= 60) return 'info'
  if (performance >= 40) return 'warning'
  return 'error'
}

const getPerformanceColor = (performance) => {
  if (performance >= 80) return 'success'
  if (performance >= 60) return 'info'
  if (performance >= 40) return 'warning'
  return 'error'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}
</script>

<style scoped>
.map-container {
  min-height: 400px;
}
</style>