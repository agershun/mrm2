<template>
  <div class="campaign-details">
    <!-- Основная информация -->
    <div class="details-section">
      <h3 class="section-title">
        <v-icon class="me-2">mdi-information</v-icon>
        Основная информация
      </h3>
      <v-row>
        <v-col cols="12" md="6">
          <div class="detail-card">
            <div class="detail-label">Статус кампании</div>
            <v-chip
              :color="getStatusColor(campaign.status)"
              size="small"
              variant="flat"
            >
              {{ getStatusText(campaign.status) }}
            </v-chip>
          </div>
          <div class="detail-card">
            <div class="detail-label">Канал</div>
            <div class="detail-value">{{ campaign.channel }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-label">Продукт</div>
            <div class="detail-value">{{ campaign.product || '—' }}</div>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="detail-card">
            <div class="detail-label">Период проведения</div>
            <div class="detail-value">{{ campaign.period }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-label">Целевая аудитория</div>
            <div class="detail-value">{{ campaign.audience || '—' }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-label">Регион</div>
            <div class="detail-value">{{ campaign.region || '—' }}</div>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- KPI метрики -->
    <div class="details-section">
      <h3 class="section-title">
        <v-icon class="me-2">mdi-chart-box</v-icon>
        Ключевые показатели
      </h3>
      <v-row>
        <v-col cols="6" md="3">
          <div class="kpi-card">
            <div class="kpi-icon">
              <v-icon color="success">mdi-trending-up</v-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value" :class="getRoiColor(campaign.roi)">
                {{ formatPercent(campaign.roi) }}
              </div>
              <div class="kpi-label">ROI</div>
            </div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="kpi-card">
            <div class="kpi-icon">
              <v-icon color="primary">mdi-currency-rub</v-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value text-primary">
                {{ formatCurrency(campaign.revenue) }}
              </div>
              <div class="kpi-label">Доход</div>
            </div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="kpi-card">
            <div class="kpi-icon">
              <v-icon color="warning">mdi-cash</v-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value text-warning">
                {{ formatCurrency(campaign.cost) }}
              </div>
              <div class="kpi-label">Затраты</div>
            </div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="kpi-card">
            <div class="kpi-icon">
              <v-icon color="info">mdi-target</v-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value text-info">
                {{ formatNumber(campaign.conversions) }}
              </div>
              <div class="kpi-label">Конверсии</div>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- Дополнительные метрики -->
    <div class="details-section">
      <h3 class="section-title">
        <v-icon class="me-2">mdi-chart-line-variant</v-icon>
        Дополнительные метрики
      </h3>
      <v-row>
        <v-col cols="6" md="3">
          <div class="metric-item">
            <div class="metric-label">CTR</div>
            <div class="metric-value">{{ formatPercent(campaign.ctr) }}</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="metric-item">
            <div class="metric-label">CPC</div>
            <div class="metric-value">{{ formatCurrency(campaign.cpc) }}</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="metric-item">
            <div class="metric-label">CPM</div>
            <div class="metric-value">{{ formatCurrency(campaign.cpm) }}</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="metric-item">
            <div class="metric-label">CPA</div>
            <div class="metric-value">{{ formatCurrency(campaign.cpa) }}</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="metric-item">
            <div class="metric-label">Показы</div>
            <div class="metric-value">{{ formatNumber(campaign.impressions) }}</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="metric-item">
            <div class="metric-label">Клики</div>
            <div class="metric-value">{{ formatNumber(campaign.clicks) }}</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="metric-item">
            <div class="metric-label">Качество</div>
            <div class="metric-value">{{ campaign.qualityScore || '—' }}</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="metric-item">
            <div class="metric-label">Бюджет</div>
            <div class="metric-value">{{ formatCurrency(campaign.budget) }}</div>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- График динамики -->
    <div class="details-section">
      <h3 class="section-title">
        <v-icon class="me-2">mdi-chart-timeline-variant</v-icon>
        Динамика показателей
        <v-spacer />
        <v-btn-toggle
          v-model="chartMetric"
          mandatory
          size="small"
          variant="outlined"
        >
          <v-btn value="conversions">Конверсии</v-btn>
          <v-btn value="revenue">Доход</v-btn>
          <v-btn value="cost">Затраты</v-btn>
        </v-btn-toggle>
      </h3>
      <div class="chart-container">
        <TrendChart
          :data="chartData"
          :metric="chartMetric"
          type="line"
          :height="250"
        />
      </div>
    </div>

    <!-- Описание и заметки -->
    <div class="details-section">
      <h3 class="section-title">
        <v-icon class="me-2">mdi-text</v-icon>
        Описание и заметки
      </h3>
      <div class="description-content">
        <div class="description-text">
          {{ campaign.description || 'Описание кампании не указано.' }}
        </div>

        <div
          v-if="campaign.notes && campaign.notes.length > 0"
          class="notes-section"
        >
          <h4 class="notes-title">Заметки:</h4>
          <div
            v-for="note in campaign.notes"
            :key="note.id"
            class="note-item"
          >
            <div class="note-header">
              <span class="note-author">{{ note.author }}</span>
              <span class="note-date">{{ formatDate(note.date) }}</span>
            </div>
            <div class="note-text">{{ note.text }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Связанные активности -->
    <div
      v-if="campaign.relatedActivities && campaign.relatedActivities.length > 0"
      class="details-section"
    >
      <h3 class="section-title">
        <v-icon class="me-2">mdi-link-variant</v-icon>
        Связанные активности
      </h3>
      <div class="activities-list">
        <div
          v-for="activity in campaign.relatedActivities"
          :key="activity.id"
          class="activity-item"
          @click="$emit('activity-click', activity)"
        >
          <div class="activity-info">
            <div class="activity-name">{{ activity.name }}</div>
            <div class="activity-type">{{ activity.type }}</div>
          </div>
          <div class="activity-metrics">
            <div class="activity-metric">
              <span class="metric-label">ROI:</span>
              <span class="metric-value" :class="getRoiColor(activity.roi)">
                {{ formatPercent(activity.roi) }}
              </span>
            </div>
          </div>
          <v-icon class="activity-arrow">mdi-chevron-right</v-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import TrendChart from '../charts/TrendChart.vue'

export default {
  name: 'CampaignDetailsWidget',
  components: {
    TrendChart
  },
  emits: ['activity-click'],
  props: {
    campaign: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const chartMetric = ref('conversions')

    // Computed properties
    const chartData = computed(() => {
      // Имитация данных динамики - в реальном приложении это будет приходить из API
      const daysInMonth = 30
      const data = []

      for (let i = 1; i <= daysInMonth; i++) {
        let value = 0
        switch (chartMetric.value) {
          case 'conversions':
            value = Math.floor(Math.random() * 50) + 10
            break
          case 'revenue':
            value = Math.floor(Math.random() * 100000) + 50000
            break
          case 'cost':
            value = Math.floor(Math.random() * 30000) + 20000
            break
        }

        data.push({
          period: `День ${i}`,
          value: value
        })
      }

      return data
    })

    // Methods
    const formatCurrency = (value) => {
      if (value === null || value === undefined) return '—'
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(value)
    }

    const formatPercent = (value) => {
      if (value === null || value === undefined) return '—'
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
    }

    const formatNumber = (value) => {
      if (value === null || value === undefined) return '—'
      return new Intl.NumberFormat('ru-RU').format(value)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const getStatusColor = (status) => {
      const colors = {
        'active': 'success',
        'paused': 'warning',
        'completed': 'primary',
        'draft': 'grey'
      }
      return colors[status] || 'grey'
    }

    const getStatusText = (status) => {
      const texts = {
        'active': 'Активна',
        'paused': 'Приостановлена',
        'completed': 'Завершена',
        'draft': 'Черновик'
      }
      return texts[status] || status
    }

    const getRoiColor = (roi) => {
      if (roi > 20) return 'text-success'
      if (roi > 0) return 'text-primary'
      return 'text-error'
    }

    return {
      chartMetric,
      chartData,
      formatCurrency,
      formatPercent,
      formatNumber,
      formatDate,
      getStatusColor,
      getStatusText,
      getRoiColor
    }
  }
}
</script>

<style scoped>
.campaign-details {
  max-height: 70vh;
  overflow-y: auto;
}

.details-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.detail-card {
  margin-bottom: 16px;
}

.detail-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.kpi-card {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  height: 80px;
}

.kpi-icon {
  margin-right: 12px;
}

.kpi-content {
  flex: 1;
}

.kpi-value {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.kpi-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-item {
  text-align: center;
  padding: 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.chart-container {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  height: 300px;
}

.description-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.description-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 16px;
}

.notes-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

.notes-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.note-item {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  border-left: 3px solid #1976d2;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.note-author {
  font-size: 12px;
  font-weight: 600;
  color: #1976d2;
}

.note-date {
  font-size: 11px;
  color: #666;
}

.note-text {
  font-size: 13px;
  line-height: 1.5;
  color: #333;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.activity-item:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
}

.activity-info {
  flex: 1;
}

.activity-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.activity-type {
  font-size: 12px;
  color: #666;
}

.activity-metrics {
  margin-right: 16px;
}

.activity-metric {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.activity-arrow {
  color: #666;
}

@media (max-width: 768px) {
  .kpi-card {
    height: 60px;
    padding: 12px;
  }

  .kpi-value {
    font-size: 16px;
  }

  .chart-container {
    height: 250px;
    padding: 12px;
  }

  .activity-item {
    padding: 8px 12px;
  }

  .section-title {
    font-size: 14px;
  }
}
</style>