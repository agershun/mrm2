<template>
  <div class="activity-investment-link">
    <!-- Заголовок -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">Связь активностей и инвестиций</h3>
      <v-btn-group variant="outlined" density="compact">
        <v-btn
          :variant="viewMode === 'activities' ? 'flat' : 'outlined'"
          @click="viewMode = 'activities'"
        >
          <v-icon>mdi-calendar-multiple</v-icon>
          По активностям
        </v-btn>
        <v-btn
          :variant="viewMode === 'investments' ? 'flat' : 'outlined'"
          @click="viewMode = 'investments'"
        >
          <v-icon>mdi-chart-pie</v-icon>
          По инвестициям
        </v-btn>
        <v-btn
          :variant="viewMode === 'matrix' ? 'flat' : 'outlined'"
          @click="viewMode = 'matrix'"
        >
          <v-icon>mdi-matrix</v-icon>
          Матрица
        </v-btn>
      </v-btn-group>
    </div>

    <!-- Статистика связей -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Активностей</div>
          <div class="text-h6 font-weight-bold text-primary">
            {{ activities.length }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Инвестиций</div>
          <div class="text-h6 font-weight-bold text-success">
            {{ investments.length }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Связей</div>
          <div class="text-h6 font-weight-bold text-info">
            {{ activityInvestmentLinks.length }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Покрытие</div>
          <div class="text-h6 font-weight-bold text-warning">
            {{ coveragePercentage }}%
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Представление по активностям -->
    <template v-if="viewMode === 'activities'">
      <v-card elevation="1">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="me-2">mdi-calendar-multiple</v-icon>
            Активности и их инвестиции
          </div>
          <v-btn
            color="primary"
            size="small"
            @click="showLinkDialog = true"
          >
            <v-icon>mdi-link</v-icon>
            Связать
          </v-btn>
        </v-card-title>

        <v-data-table
          :headers="activityHeaders"
          :items="activitiesWithInvestments"
          item-key="id"
          class="elevation-0"
          :expanded="expanded"
          show-expand
        >
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center">
              <v-icon :color="getActivityTypeColor(item.type)" class="me-2">
                {{ getActivityTypeIcon(item.type) }}
              </v-icon>
              <span class="font-weight-medium">{{ item.name }}</span>
            </div>
          </template>

          <template v-slot:item.totalInvestment="{ item }">
            <span class="font-weight-medium">
              {{ formatCurrency(item.totalInvestment) }}
            </span>
          </template>

          <template v-slot:item.investmentCount="{ item }">
            <v-chip
              size="small"
              :color="item.investmentCount > 0 ? 'success' : 'grey'"
              variant="tonal"
            >
              {{ item.investmentCount }}
            </v-chip>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <template v-slot:expanded-row="{ item }">
            <td :colspan="activityHeaders.length">
              <div class="pa-4">
                <h4 class="text-subtitle-2 mb-3">Связанные инвестиции:</h4>
                <v-row v-if="item.investments.length > 0">
                  <v-col
                    v-for="investment in item.investments"
                    :key="investment.id"
                    cols="12" md="6" lg="4"
                  >
                    <v-card variant="outlined" class="pa-3">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <span class="text-subtitle-2">{{ investment.name }}</span>
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          color="error"
                          @click="unlinkInvestment(item.id, investment.id)"
                        >
                          <v-icon>mdi-link-off</v-icon>
                        </v-btn>
                      </div>
                      <div class="text-body-2 text-medium-emphasis mb-2">
                        {{ investment.type }}
                      </div>
                      <div class="text-h6 font-weight-bold">
                        {{ formatCurrency(investment.amount) }}
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
                <div v-else class="text-center text-medium-emphasis pa-4">
                  <v-icon size="48" class="mb-2">mdi-link-off</v-icon>
                  <p>Инвестиции не связаны</p>
                </div>
              </div>
            </td>
          </template>

          <template v-slot:no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2">mdi-calendar-multiple</v-icon>
              <p class="text-body-1 mt-4 text-medium-emphasis">
                Активности не найдены
              </p>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </template>

    <!-- Представление по инвестициям -->
    <template v-if="viewMode === 'investments'">
      <v-card elevation="1">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-pie</v-icon>
            Инвестиции и их активности
          </div>
          <v-btn
            color="primary"
            size="small"
            @click="showLinkDialog = true"
          >
            <v-icon>mdi-link</v-icon>
            Связать
          </v-btn>
        </v-card-title>

        <v-data-table
          :headers="investmentHeaders"
          :items="investmentsWithActivities"
          item-key="id"
          class="elevation-0"
          :expanded="expanded"
          show-expand
        >
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center">
              <v-icon :color="getCategoryColor(item.category)" class="me-2">
                {{ getCategoryIcon(item.category) }}
              </v-icon>
              <span class="font-weight-medium">{{ item.name }}</span>
            </div>
          </template>

          <template v-slot:item.amount="{ item }">
            <span class="font-weight-medium">
              {{ formatCurrency(item.amount) }}
            </span>
          </template>

          <template v-slot:item.activityCount="{ item }">
            <v-chip
              size="small"
              :color="item.activityCount > 0 ? 'success' : 'grey'"
              variant="tonal"
            >
              {{ item.activityCount }}
            </v-chip>
          </template>

          <template v-slot:item.utilization="{ item }">
            <div class="d-flex align-center">
              <span class="me-2">{{ item.utilization }}%</span>
              <v-progress-linear
                :model-value="item.utilization"
                :color="getUtilizationColor(item.utilization)"
                height="4"
                style="width: 60px;"
              />
            </div>
          </template>

          <template v-slot:expanded-row="{ item }">
            <td :colspan="investmentHeaders.length">
              <div class="pa-4">
                <h4 class="text-subtitle-2 mb-3">Связанные активности:</h4>
                <v-row v-if="item.activities.length > 0">
                  <v-col
                    v-for="activity in item.activities"
                    :key="activity.id"
                    cols="12" md="6" lg="4"
                  >
                    <v-card variant="outlined" class="pa-3">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <span class="text-subtitle-2">{{ activity.name }}</span>
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          color="error"
                          @click="unlinkInvestment(activity.id, item.id)"
                        >
                          <v-icon>mdi-link-off</v-icon>
                        </v-btn>
                      </div>
                      <div class="text-body-2 text-medium-emphasis mb-2">
                        {{ activity.type }}
                      </div>
                      <v-chip
                        :color="getStatusColor(activity.status)"
                        size="small"
                        variant="tonal"
                      >
                        {{ getStatusText(activity.status) }}
                      </v-chip>
                    </v-card>
                  </v-col>
                </v-row>
                <div v-else class="text-center text-medium-emphasis pa-4">
                  <v-icon size="48" class="mb-2">mdi-link-off</v-icon>
                  <p>Активности не связаны</p>
                </div>
              </div>
            </td>
          </template>
        </v-data-table>
      </v-card>
    </template>

    <!-- Матрица связей -->
    <template v-if="viewMode === 'matrix'">
      <v-card elevation="1">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2">mdi-matrix</v-icon>
          Матрица связей активностей и инвестиций
        </v-card-title>

        <v-card-text>
          <div class="matrix-container">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th class="matrix-header">Активности \ Инвестиции</th>
                  <th
                    v-for="investment in investments"
                    :key="investment.id"
                    class="matrix-header investment-header"
                  >
                    <div class="header-content">
                      <div class="header-text">{{ investment.name }}</div>
                      <div class="header-amount">{{ formatCurrency(investment.amount) }}</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="activity in activities" :key="activity.id">
                  <td class="matrix-row-header">
                    <div class="row-header-content">
                      <div class="activity-name">{{ activity.name }}</div>
                      <div class="activity-type">{{ activity.type }}</div>
                    </div>
                  </td>
                  <td
                    v-for="investment in investments"
                    :key="investment.id"
                    class="matrix-cell"
                  >
                    <v-btn
                      :icon="isLinked(activity.id, investment.id)"
                      :color="isLinked(activity.id, investment.id) ? 'success' : 'grey-lighten-2'"
                      size="small"
                      @click="toggleLink(activity.id, investment.id)"
                    >
                      <v-icon>
                        {{ isLinked(activity.id, investment.id) ? 'mdi-check' : 'mdi-plus' }}
                      </v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card-text>
      </v-card>
    </template>

    <!-- Диалог связывания -->
    <v-dialog v-model="showLinkDialog" max-width="600">
      <v-card>
        <v-card-title>Создать связь</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="linkForm.activityId"
                  label="Активность"
                  :items="activitySelectOptions"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="linkForm.investmentId"
                  label="Инвестиция"
                  :items="investmentSelectOptions"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="linkForm.allocation"
                  label="Процент распределения (%)"
                  type="number"
                  min="0"
                  max="100"
                  hint="Какая часть инвестиции относится к этой активности"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="linkForm.notes"
                  label="Примечания"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showLinkDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="createLink">Создать связь</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ActivityInvestmentLink',
  setup() {
    const viewMode = ref('activities')
    const showLinkDialog = ref(false)
    const expanded = ref([])

    const linkForm = ref({
      activityId: null,
      investmentId: null,
      allocation: 100,
      notes: ''
    })

    // Демо-данные активностей
    const activities = ref([
      {
        id: 1,
        name: 'Поисковая реклама Google',
        type: 'Цифровая реклама',
        status: 'active'
      },
      {
        id: 2,
        name: 'SMM кампания в Instagram',
        type: 'Социальные сети',
        status: 'active'
      },
      {
        id: 3,
        name: 'Разработка MVP',
        type: 'Продукт',
        status: 'in_progress'
      },
      {
        id: 4,
        name: 'UX исследование',
        type: 'Исследования',
        status: 'planned'
      }
    ])

    // Демо-данные инвестиций
    const investments = ref([
      {
        id: 1,
        name: 'Цифровая реклама Q1',
        category: 'Marketing',
        amount: 2500000,
        type: 'Маркетинговая кампания'
      },
      {
        id: 2,
        name: 'Разработка продукта',
        category: 'Product',
        amount: 3000000,
        type: 'Продуктовая инициатива'
      },
      {
        id: 3,
        name: 'Исследования рынка',
        category: 'Research',
        amount: 500000,
        type: 'Исследования'
      }
    ])

    // Связи между активностями и инвестициями
    const activityInvestmentLinks = ref([
      { activityId: 1, investmentId: 1, allocation: 60 },
      { activityId: 2, investmentId: 1, allocation: 40 },
      { activityId: 3, investmentId: 2, allocation: 80 },
      { activityId: 4, investmentId: 3, allocation: 100 }
    ])

    const activityHeaders = [
      { title: 'Активность', key: 'name', sortable: true },
      { title: 'Тип', key: 'type', sortable: true },
      { title: 'Общие инвестиции', key: 'totalInvestment', sortable: true },
      { title: 'Кол-во инвестиций', key: 'investmentCount', sortable: true },
      { title: 'Статус', key: 'status', sortable: true }
    ]

    const investmentHeaders = [
      { title: 'Инвестиция', key: 'name', sortable: true },
      { title: 'Сумма', key: 'amount', sortable: true },
      { title: 'Кол-во активностей', key: 'activityCount', sortable: true },
      { title: 'Использование', key: 'utilization', sortable: true }
    ]

    const activitiesWithInvestments = computed(() => {
      return activities.value.map(activity => {
        const linkedInvestments = activityInvestmentLinks.value
          .filter(link => link.activityId === activity.id)
          .map(link => {
            const investment = investments.value.find(inv => inv.id === link.investmentId)
            return {
              ...investment,
              allocation: link.allocation,
              amount: Math.round(investment.amount * link.allocation / 100)
            }
          })

        return {
          ...activity,
          investments: linkedInvestments,
          investmentCount: linkedInvestments.length,
          totalInvestment: linkedInvestments.reduce((sum, inv) => sum + inv.amount, 0)
        }
      })
    })

    const investmentsWithActivities = computed(() => {
      return investments.value.map(investment => {
        const linkedActivities = activityInvestmentLinks.value
          .filter(link => link.investmentId === investment.id)
          .map(link => {
            const activity = activities.value.find(act => act.id === link.activityId)
            return {
              ...activity,
              allocation: link.allocation
            }
          })

        const totalAllocation = linkedActivities.reduce((sum, act) => sum + act.allocation, 0)

        return {
          ...investment,
          activities: linkedActivities,
          activityCount: linkedActivities.length,
          utilization: Math.min(totalAllocation, 100)
        }
      })
    })

    const coveragePercentage = computed(() => {
      const activitiesWithLinks = activities.value.filter(activity =>
        activityInvestmentLinks.value.some(link => link.activityId === activity.id)
      ).length

      return Math.round((activitiesWithLinks / activities.value.length) * 100)
    })

    const activitySelectOptions = computed(() => {
      return activities.value.map(activity => ({
        title: activity.name,
        value: activity.id
      }))
    })

    const investmentSelectOptions = computed(() => {
      return investments.value.map(investment => ({
        title: investment.name,
        value: investment.id
      }))
    })

    const formatCurrency = (amount) => {
      if (!amount && amount !== 0) return '0 ₽'
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    const getActivityTypeColor = (type) => {
      const colors = {
        'Цифровая реклама': 'blue',
        'Социальные сети': 'purple',
        'Продукт': 'green',
        'Исследования': 'orange'
      }
      return colors[type] || 'grey'
    }

    const getActivityTypeIcon = (type) => {
      const icons = {
        'Цифровая реклама': 'mdi-google-ads',
        'Социальные сети': 'mdi-instagram',
        'Продукт': 'mdi-cube',
        'Исследования': 'mdi-magnify'
      }
      return icons[type] || 'mdi-circle'
    }

    const getCategoryColor = (category) => {
      const colors = {
        'Marketing': 'blue',
        'Product': 'green',
        'Research': 'orange'
      }
      return colors[category] || 'grey'
    }

    const getCategoryIcon = (category) => {
      const icons = {
        'Marketing': 'mdi-bullhorn',
        'Product': 'mdi-cube',
        'Research': 'mdi-magnify'
      }
      return icons[category] || 'mdi-circle'
    }

    const getStatusColor = (status) => {
      const colors = {
        'active': 'success',
        'in_progress': 'warning',
        'planned': 'info',
        'completed': 'grey'
      }
      return colors[status] || 'grey'
    }

    const getStatusText = (status) => {
      const texts = {
        'active': 'Активная',
        'in_progress': 'В работе',
        'planned': 'Запланирована',
        'completed': 'Завершена'
      }
      return texts[status] || status
    }

    const getUtilizationColor = (utilization) => {
      if (utilization < 50) return 'success'
      if (utilization < 90) return 'warning'
      return 'error'
    }

    const isLinked = (activityId, investmentId) => {
      return activityInvestmentLinks.value.some(
        link => link.activityId === activityId && link.investmentId === investmentId
      )
    }

    const toggleLink = (activityId, investmentId) => {
      const linkIndex = activityInvestmentLinks.value.findIndex(
        link => link.activityId === activityId && link.investmentId === investmentId
      )

      if (linkIndex > -1) {
        activityInvestmentLinks.value.splice(linkIndex, 1)
      } else {
        activityInvestmentLinks.value.push({
          activityId,
          investmentId,
          allocation: 100
        })
      }
    }

    const unlinkInvestment = (activityId, investmentId) => {
      const linkIndex = activityInvestmentLinks.value.findIndex(
        link => link.activityId === activityId && link.investmentId === investmentId
      )

      if (linkIndex > -1) {
        activityInvestmentLinks.value.splice(linkIndex, 1)
      }
    }

    const createLink = () => {
      if (linkForm.value.activityId && linkForm.value.investmentId) {
        const existingLink = activityInvestmentLinks.value.find(
          link => link.activityId === linkForm.value.activityId &&
                 link.investmentId === linkForm.value.investmentId
        )

        if (!existingLink) {
          activityInvestmentLinks.value.push({
            activityId: linkForm.value.activityId,
            investmentId: linkForm.value.investmentId,
            allocation: linkForm.value.allocation || 100,
            notes: linkForm.value.notes
          })
        }

        showLinkDialog.value = false
        linkForm.value = {
          activityId: null,
          investmentId: null,
          allocation: 100,
          notes: ''
        }
      }
    }

    return {
      viewMode,
      showLinkDialog,
      expanded,
      linkForm,
      activities,
      investments,
      activityInvestmentLinks,
      activityHeaders,
      investmentHeaders,
      activitiesWithInvestments,
      investmentsWithActivities,
      coveragePercentage,
      activitySelectOptions,
      investmentSelectOptions,
      formatCurrency,
      getActivityTypeColor,
      getActivityTypeIcon,
      getCategoryColor,
      getCategoryIcon,
      getStatusColor,
      getStatusText,
      getUtilizationColor,
      isLinked,
      toggleLink,
      unlinkInvestment,
      createLink
    }
  }
}
</script>

<style scoped>
.activity-investment-link {
  height: 100%;
}

.matrix-container {
  overflow: auto;
  max-height: 600px;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
}

.matrix-header {
  background-color: #f5f5f5;
  padding: 12px 8px;
  border: 1px solid #ddd;
  text-align: center;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 1;
}

.matrix-row-header {
  background-color: #f9f9f9;
  padding: 8px 12px;
  border: 1px solid #ddd;
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 200px;
}

.matrix-cell {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: center;
}

.investment-header {
  min-width: 120px;
  max-width: 150px;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-text {
  font-size: 12px;
  line-height: 1.2;
  margin-bottom: 4px;
}

.header-amount {
  font-size: 10px;
  color: #666;
}

.row-header-content {
  display: flex;
  flex-direction: column;
}

.activity-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.activity-type {
  font-size: 12px;
  color: #666;
}
</style>