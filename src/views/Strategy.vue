<template>
  <div class="strategy-view">
    <!-- Заголовок страницы -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Стратегия</h1>
        <p class="text-body-1 text-medium-emphasis">
          Управление целями и ключевыми показателями эффективности
        </p>
      </div>
      <v-spacer />

      <!-- Переключатель представлений -->
      <v-btn-toggle v-model="currentView" mandatory variant="outlined" class="me-4">
        <v-btn value="overview" size="small">
          <v-icon>mdi-view-dashboard</v-icon>
          Обзор
        </v-btn>
        <v-btn value="objectives" size="small">
          <v-icon>mdi-target</v-icon>
          Цели
        </v-btn>
        <v-btn value="kpis" size="small">
          <v-icon>mdi-chart-line</v-icon>
          KPI
        </v-btn>
      </v-btn-toggle>

      <!-- Фильтр по периоду -->
      <v-select
        v-model="selectedPeriod"
        :items="periodOptions"
        label="Период"
        variant="outlined"
        density="compact"
        style="width: 150px; margin-top: 4px;"
        class="me-4"
        @update:modelValue="onPeriodChange"
      />

    </div>

    <!-- Обзорная панель стратегии -->
    <v-row v-if="currentView === 'overview'" class="mb-6">
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="primary" size="40" class="me-4">
                mdi-target
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Активные цели</p>
                <h3 class="text-h6">{{ activeObjectivesCount }}</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="success" size="40" class="me-4">
                mdi-chart-line
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Активные KPI</p>
                <h3 class="text-h6">{{ activeKPIsCount }}</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="warning" size="40" class="me-4">
                mdi-progress-check
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Прогресс целей</p>
                <h3 class="text-h6">{{ strategicProgress }}%</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="info" size="40" class="me-4">
                mdi-speedometer
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Прогресс KPI</p>
                <h3 class="text-h6">{{ kpiProgress }}%</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Основной контент -->
    <v-row>
      <!-- Левая панель -->
      <v-col cols="12" :lg="selectedItem ? 6 : 12">
        <v-card class="h-100">
          <!-- Представление обзора -->
          <template v-if="currentView === 'overview'">
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-view-dashboard</v-icon>
              Стратегический обзор
            </v-card-title>

            <v-card-text>
              <!-- Прогресс по целям -->
              <div class="mb-6">
                <h4 class="text-subtitle-1 mb-3">Топ цели по прогрессу</h4>
                <v-row>
                  <v-col
                    v-for="objective in topObjectives"
                    :key="objective.objective_id"
                    cols="12" md="6"
                  >
                    <v-card variant="outlined" class="pa-3">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <span class="text-subtitle-2">{{ objective.name }}</span>
                        <v-chip
                          :color="getStatusColor(objective.status)"
                          size="small"
                          variant="tonal"
                        >
                          {{ getStatusText(objective.status) }}
                        </v-chip>
                      </div>
                      <v-progress-linear
                        :model-value="getObjectiveProgress(objective)"
                        :color="getProgressColor(getObjectiveProgress(objective))"
                        height="8"
                        rounded
                        class="mb-2"
                      />
                      <div class="d-flex justify-space-between text-caption">
                        <span>{{ objective.current_value }} / {{ objective.target_value }} {{ objective.measurement_unit }}</span>
                        <span>{{ getObjectiveProgress(objective) }}%</span>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <!-- Прогресс по KPI -->
              <div>
                <h4 class="text-subtitle-1 mb-3">Топ KPI по прогрессу</h4>
                <v-row>
                  <v-col
                    v-for="kpi in topKPIs"
                    :key="kpi.kpi_id"
                    cols="12" md="6"
                  >
                    <v-card variant="outlined" class="pa-3">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <span class="text-subtitle-2">{{ kpi.name }}</span>
                        <v-chip
                          :color="getKPIStatusColor(kpi.status)"
                          size="small"
                          variant="tonal"
                        >
                          {{ getKPIStatusText(kpi.status) }}
                        </v-chip>
                      </div>
                      <v-progress-linear
                        :model-value="getKPIProgress(kpi)"
                        :color="getProgressColor(getKPIProgress(kpi))"
                        height="8"
                        rounded
                        class="mb-2"
                      />
                      <div class="d-flex justify-space-between text-caption">
                        <span>{{ kpi.current_value }} / {{ kpi.target_value }} {{ kpi.unit }}</span>
                        <span>{{ getKPIProgress(kpi) }}%</span>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </template>

          <!-- Представление целей -->
          <template v-if="currentView === 'objectives'">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="me-2">mdi-target</v-icon>
                Цели организации
              </div>
              <v-btn
                color="primary"
                size="small"
                @click="showCreateObjectiveDialog = true"
              >
                <v-icon>mdi-plus</v-icon>
                Создать цель
              </v-btn>
            </v-card-title>

            <v-data-table
              :headers="objectiveHeaders"
              :items="filteredObjectives"
              :loading="isLoading"
              item-key="objective_id"
              class="elevation-0"
              @click:row="selectObjective"
              :row-props="getRowProps"
            >
              <template v-slot:item.name="{ item }">
                <div class="d-flex align-center">
                  <v-icon
                    :color="getTypeColor(item.type)"
                    class="me-2"
                  >
                    {{ getTypeIcon(item.type) }}
                  </v-icon>
                  <div>
                    <div class="font-weight-medium">{{ item.name }}</div>
                    <div class="text-caption text-medium-emphasis">{{ item.description }}</div>
                  </div>
                </div>
              </template>

              <template v-slot:item.type="{ item }">
                <v-chip
                  :color="getTypeColor(item.type)"
                  size="small"
                  variant="tonal"
                >
                  {{ getTypeText(item.type) }}
                </v-chip>
              </template>

              <template v-slot:item.progress="{ item }">
                <div class="d-flex align-center">
                  <v-progress-linear
                    :model-value="getObjectiveProgress(item)"
                    :color="getProgressColor(getObjectiveProgress(item))"
                    height="6"
                    style="width: 80px;"
                    class="me-2"
                  />
                  <span class="text-caption">{{ getObjectiveProgress(item) }}%</span>
                </div>
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

              <template v-slot:item.priority="{ item }">
                <v-chip
                  :color="getPriorityColor(item.priority)"
                  size="small"
                  variant="outlined"
                >
                  {{ getPriorityText(item.priority) }}
                </v-chip>
              </template>

              <template v-slot:no-data>
                <div class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-2">mdi-target</v-icon>
                  <p class="text-body-1 mt-4 text-medium-emphasis">
                    Цели не созданы
                  </p>
                  <v-btn
                    color="primary"
                    @click="showCreateObjectiveDialog = true"
                  >
                    Создать первую цель
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </template>

          <!-- Представление KPI -->
          <template v-if="currentView === 'kpis'">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="me-2">mdi-chart-line</v-icon>
                Ключевые показатели эффективности
              </div>
              <v-btn
                color="primary"
                size="small"
                @click="showCreateKPIDialog = true"
              >
                <v-icon>mdi-plus</v-icon>
                Создать KPI
              </v-btn>
            </v-card-title>

            <v-data-table
              :headers="kpiHeaders"
              :items="filteredKPIs"
              :loading="isLoading"
              item-key="kpi_id"
              class="elevation-0"
              @click:row="selectKPI"
              :row-props="getKPIRowProps"
            >
              <template v-slot:item.name="{ item }">
                <div class="d-flex align-center">
                  <v-icon
                    :color="getCategoryColor(item.category)"
                    class="me-2"
                  >
                    {{ getCategoryIcon(item.category) }}
                  </v-icon>
                  <div>
                    <div class="font-weight-medium">{{ item.name }}</div>
                    <div class="text-caption text-medium-emphasis">{{ item.period }}</div>
                  </div>
                </div>
              </template>

              <template v-slot:item.current_value="{ item }">
                <span class="font-weight-medium">
                  {{ formatValue(item.current_value, item.unit) }}
                </span>
              </template>

              <template v-slot:item.target_value="{ item }">
                <span>{{ formatValue(item.target_value, item.unit) }}</span>
              </template>

              <template v-slot:item.progress="{ item }">
                <div class="d-flex align-center">
                  <v-progress-linear
                    :model-value="getKPIProgress(item)"
                    :color="getProgressColor(getKPIProgress(item))"
                    height="6"
                    style="width: 80px;"
                    class="me-2"
                  />
                  <span class="text-caption">{{ getKPIProgress(item) }}%</span>
                </div>
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getKPIStatusColor(item.status)"
                  size="small"
                  variant="tonal"
                >
                  {{ getKPIStatusText(item.status) }}
                </v-chip>
              </template>

              <template v-slot:no-data>
                <div class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-2">mdi-chart-line</v-icon>
                  <p class="text-body-1 mt-4 text-medium-emphasis">
                    KPI не созданы
                  </p>
                  <v-btn
                    color="primary"
                    @click="showCreateKPIDialog = true"
                  >
                    Создать первый KPI
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </template>

        </v-card>
      </v-col>

      <!-- Правая панель с деталями -->
      <v-col v-if="selectedItem" cols="12" lg="6">
        <v-card class="h-100">
          <!-- Детали цели -->
          <template v-if="selectedItem.type === 'objective'">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="me-2">mdi-target</v-icon>
                Детали цели
              </div>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="selectedItem = null"
              />
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <!-- Основная информация -->
              <div class="mb-4">
                <h3 class="text-h6 mb-2">{{ selectedItem.name }}</h3>
                <p class="text-body-2 text-medium-emphasis mb-3">
                  {{ selectedItem.description }}
                </p>

                <v-row dense class="mb-3">
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Тип</div>
                    <v-chip
                      :color="getTypeColor(selectedItem.type)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getTypeText(selectedItem.type) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Статус</div>
                    <v-chip
                      :color="getStatusColor(selectedItem.status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getStatusText(selectedItem.status) }}
                    </v-chip>
                  </v-col>
                </v-row>

                <v-row dense class="mb-3">
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Приоритет</div>
                    <v-chip
                      :color="getPriorityColor(selectedItem.priority)"
                      size="small"
                      variant="outlined"
                    >
                      {{ getPriorityText(selectedItem.priority) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Период</div>
                    <div class="font-weight-medium">{{ selectedItem.period }}</div>
                  </v-col>
                </v-row>

                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis">Владелец</div>
                  <div class="font-weight-medium">{{ selectedItem.owner }}</div>
                </div>
              </div>

              <v-divider class="mb-4" />

              <!-- Прогресс -->
              <div class="mb-4">
                <h4 class="text-subtitle-1 mb-3">Прогресс выполнения</h4>

                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-body-2">{{ selectedItem.current_value }} / {{ selectedItem.target_value }} {{ selectedItem.measurement_unit }}</span>
                  <span class="font-weight-bold">{{ getObjectiveProgress(selectedItem) }}%</span>
                </div>

                <v-progress-linear
                  :model-value="getObjectiveProgress(selectedItem)"
                  :color="getProgressColor(getObjectiveProgress(selectedItem))"
                  height="12"
                  rounded
                  class="mb-3"
                />

                <v-row dense>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Начало</div>
                    <div class="text-body-2">{{ formatDate(selectedItem.start_date) }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Окончание</div>
                    <div class="text-body-2">{{ formatDate(selectedItem.end_date) }}</div>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="mb-4" />

              <!-- Связанные элементы -->
              <div class="mb-4">
                <h4 class="text-subtitle-1 mb-3">Связанные элементы</h4>

                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">Активности</div>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="activityId in selectedItem.linkedActivities"
                      :key="activityId"
                      size="x-small"
                      variant="outlined"
                      color="blue"
                    >
                      Активность {{ activityId }}
                    </v-chip>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">Бюджеты</div>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="budgetId in selectedItem.linkedBudgets"
                      :key="budgetId"
                      size="x-small"
                      variant="outlined"
                      color="green"
                    >
                      Бюджет {{ budgetId }}
                    </v-chip>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">Инвестиции</div>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="investmentId in selectedItem.linkedInvestments"
                      :key="investmentId"
                      size="x-small"
                      variant="outlined"
                      color="purple"
                    >
                      Инвестиция {{ investmentId }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <v-divider class="mb-4" />

              <!-- Действия -->
              <div>
                <h4 class="text-subtitle-1 mb-3">Действия</h4>
                <div class="d-flex flex-column gap-2">
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-pencil"
                  >
                    Редактировать
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-chart-line"
                  >
                    Просмотр KPI
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-link"
                  >
                    Управление связями
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </template>

          <!-- Детали KPI -->
          <template v-if="selectedItem.type === 'kpi'">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="me-2">mdi-chart-line</v-icon>
                Детали KPI
              </div>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="selectedItem = null"
              />
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <!-- Основная информация -->
              <div class="mb-4">
                <h3 class="text-h6 mb-2">{{ selectedItem.name }}</h3>
                <p class="text-body-2 text-medium-emphasis mb-3">
                  {{ selectedItem.description }}
                </p>

                <v-row dense class="mb-3">
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Категория</div>
                    <v-chip
                      :color="getCategoryColor(selectedItem.category)"
                      size="small"
                      variant="tonal"
                    >
                      <v-icon :icon="getCategoryIcon(selectedItem.category)" start size="small" />
                      {{ selectedItem.category }}
                    </v-chip>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Статус</div>
                    <v-chip
                      :color="getKPIStatusColor(selectedItem.status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getKPIStatusText(selectedItem.status) }}
                    </v-chip>
                  </v-col>
                </v-row>

                <v-row dense class="mb-3">
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Частота</div>
                    <div class="font-weight-medium">{{ selectedItem.frequency || 'Ежемесячно' }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Период</div>
                    <div class="font-weight-medium">{{ selectedItem.period }}</div>
                  </v-col>
                </v-row>

                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis">Владелец</div>
                  <div class="font-weight-medium">{{ selectedItem.owner }}</div>
                </div>
              </div>

              <v-divider class="mb-4" />

              <!-- Текущие показатели -->
              <div class="mb-4">
                <h4 class="text-subtitle-1 mb-3">Текущие показатели</h4>

                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-body-2">
                    {{ formatValue(selectedItem.current_value, selectedItem.unit) }} /
                    {{ formatValue(selectedItem.target_value, selectedItem.unit) }}
                  </span>
                  <span class="font-weight-bold">{{ getKPIProgress(selectedItem) }}%</span>
                </div>

                <v-progress-linear
                  :model-value="getKPIProgress(selectedItem)"
                  :color="getProgressColor(getKPIProgress(selectedItem))"
                  height="12"
                  rounded
                  class="mb-3"
                />

                <v-row dense>
                  <v-col cols="4">
                    <div class="text-center pa-2">
                      <div class="text-h6 font-weight-bold" :class="`text-${getProgressColor(getKPIProgress(selectedItem))}`">
                        {{ formatValue(selectedItem.current_value, selectedItem.unit) }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Текущее</div>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-center pa-2">
                      <div class="text-h6 font-weight-bold">
                        {{ formatValue(selectedItem.target_value, selectedItem.unit) }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Цель</div>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-center pa-2">
                      <div class="text-h6 font-weight-bold text-info">
                        {{ formatValue(selectedItem.target_value - selectedItem.current_value, selectedItem.unit) }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Осталось</div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="mb-4" />

              <!-- Временные рамки -->
              <div class="mb-4">
                <h4 class="text-subtitle-1 mb-3">Временные рамки</h4>
                <v-row dense>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Начало</div>
                    <div class="text-body-2">{{ formatDate(selectedItem.start_date) }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Окончание</div>
                    <div class="text-body-2">{{ formatDate(selectedItem.end_date) }}</div>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="mb-4" />

              <!-- Связанные элементы -->
              <div class="mb-4">
                <h4 class="text-subtitle-1 mb-3">Связанные элементы</h4>

                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">Цели</div>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="objectiveId in selectedItem.linkedObjectives || []"
                      :key="objectiveId"
                      size="x-small"
                      variant="outlined"
                      color="purple"
                    >
                      Цель {{ objectiveId }}
                    </v-chip>
                    <div v-if="!selectedItem.linkedObjectives || selectedItem.linkedObjectives.length === 0" class="text-caption text-medium-emphasis">
                      Нет связанных целей
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">Активности</div>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="activityId in selectedItem.linkedActivities || []"
                      :key="activityId"
                      size="x-small"
                      variant="outlined"
                      color="blue"
                    >
                      Активность {{ activityId }}
                    </v-chip>
                    <div v-if="!selectedItem.linkedActivities || selectedItem.linkedActivities.length === 0" class="text-caption text-medium-emphasis">
                      Нет связанных активностей
                    </div>
                  </div>
                </div>
              </div>

              <v-divider class="mb-4" />

              <!-- Действия -->
              <div>
                <h4 class="text-subtitle-1 mb-3">Действия</h4>
                <div class="d-flex flex-column gap-2">
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-pencil"
                  >
                    Редактировать
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-chart-timeline"
                  >
                    История изменений
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-export"
                  >
                    Экспортировать данные
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-link"
                  >
                    Управление связями
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалоги создания -->
    <!-- ... диалоги создания будут добавлены позже ... -->
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'
import { useStrategyStore } from '@/stores/strategyStore'

export default {
  name: 'StrategyView',
  setup() {
    const strategyStore = useStrategyStore()

    // Reactive state
    const currentView = ref('overview')
    const selectedPeriod = ref('all')
    const selectedItem = ref(null)
    const showCreateObjectiveDialog = ref(false)
    const showCreateKPIDialog = ref(false)

    // Computed properties
    const isLoading = computed(() => strategyStore.isLoading)
    const objectives = computed(() => strategyStore.objectives)
    const kpis = computed(() => strategyStore.kpis)
    const filteredObjectives = computed(() => strategyStore.filteredObjectives)
    const filteredKPIs = computed(() => strategyStore.filteredKPIs)
    const strategicProgress = computed(() => strategyStore.strategicProgress)
    const kpiProgress = computed(() => strategyStore.kpiProgress)

    const periodOptions = computed(() => [
      { title: 'Все периоды', value: 'all' },
      { title: '2025', value: '2025' },
      { title: '2025-Q1', value: '2025-Q1' },
      { title: '2025-Q2', value: '2025-Q2' },
      { title: '2025-H1', value: '2025-H1' }
    ])

    const activeObjectivesCount = computed(() => {
      return objectives.value.filter(obj => obj.status === 'active').length
    })

    const activeKPIsCount = computed(() => {
      return kpis.value.filter(kpi => kpi.status === 'on_track' || kpi.status === 'achieved').length
    })

    const topObjectives = computed(() => {
      return objectives.value
        .filter(obj => obj.status === 'active')
        .sort((a, b) => getObjectiveProgress(b) - getObjectiveProgress(a))
        .slice(0, 4)
    })

    const topKPIs = computed(() => {
      return kpis.value
        .filter(kpi => kpi.status !== 'at_risk')
        .sort((a, b) => getKPIProgress(b) - getKPIProgress(a))
        .slice(0, 4)
    })

    const objectiveHeaders = [
      { title: 'Цель', key: 'name', sortable: true },
      { title: 'Тип', key: 'type', sortable: true },
      { title: 'Период', key: 'period', sortable: true },
      { title: 'Прогресс', key: 'progress', sortable: false },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Приоритет', key: 'priority', sortable: true },
      { title: 'Владелец', key: 'owner', sortable: true }
    ]

    const kpiHeaders = [
      { title: 'KPI', key: 'name', sortable: true },
      { title: 'Текущее', key: 'current_value', sortable: true },
      { title: 'Цель', key: 'target_value', sortable: true },
      { title: 'Прогресс', key: 'progress', sortable: false },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Владелец', key: 'owner', sortable: true }
    ]

    // Methods
    const formatValue = (value, unit) => {
      if (unit === 'rub') {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      }
      if (unit === 'percent') {
        return `${value}%`
      }
      return `${value} ${unit}`
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getObjectiveProgress = (objective) => {
      if (!objective.target_value) return 0
      return Math.min(Math.round((objective.current_value / objective.target_value) * 100), 100)
    }

    const getKPIProgress = (kpi) => {
      if (!kpi.target_value) return 0
      return Math.min(Math.round((kpi.current_value / kpi.target_value) * 100), 100)
    }

    const getProgressColor = (progress) => {
      if (progress >= 80) return 'success'
      if (progress >= 60) return 'warning'
      return 'error'
    }

    const getStatusColor = (status) => {
      const colors = {
        'active': 'success',
        'paused': 'warning',
        'completed': 'info',
        'cancelled': 'error'
      }
      return colors[status] || 'grey'
    }

    const getStatusText = (status) => {
      const texts = {
        'active': 'Активная',
        'paused': 'Приостановлена',
        'completed': 'Завершена',
        'cancelled': 'Отменена'
      }
      return texts[status] || status
    }

    const getKPIStatusColor = (status) => {
      const colors = {
        'achieved': 'success',
        'on_track': 'info',
        'at_risk': 'error'
      }
      return colors[status] || 'grey'
    }

    const getKPIStatusText = (status) => {
      const texts = {
        'achieved': 'Достигнут',
        'on_track': 'В рамках',
        'at_risk': 'Риск'
      }
      return texts[status] || status
    }

    const getTypeColor = (type) => {
      const colors = {
        'strategic': 'purple',
        'financial': 'green',
        'operational': 'blue',
        'customer': 'orange',
        'marketing': 'pink'
      }
      return colors[type] || 'grey'
    }

    const getTypeIcon = (type) => {
      const icons = {
        'strategic': 'mdi-strategy',
        'financial': 'mdi-wallet',
        'operational': 'mdi-cog',
        'customer': 'mdi-account-group',
        'marketing': 'mdi-bullhorn'
      }
      return icons[type] || 'mdi-circle'
    }

    const getTypeText = (type) => {
      const texts = {
        'strategic': 'стратегическая',
        'financial': 'финансовая',
        'operational': 'операционная',
        'customer': 'клиентская',
        'marketing': 'маркетинговая'
      }
      return texts[type] || type
    }

    const getCategoryColor = (category) => {
      const colors = {
        'advertising': 'blue',
        'acquisition': 'green',
        'retention': 'purple',
        'performance': 'orange',
        'conversion': 'teal',
        'traffic': 'cyan',
        'email': 'pink',
        'satisfaction': 'indigo'
      }
      return colors[category] || 'grey'
    }

    const getCategoryIcon = (category) => {
      const icons = {
        'advertising': 'mdi-google-ads',
        'acquisition': 'mdi-account-plus',
        'retention': 'mdi-account-heart',
        'performance': 'mdi-chart-line',
        'conversion': 'mdi-swap-horizontal',
        'traffic': 'mdi-web',
        'email': 'mdi-email',
        'satisfaction': 'mdi-heart'
      }
      return icons[category] || 'mdi-circle'
    }

    const getPriorityColor = (priority) => {
      const colors = {
        'high': 'error',
        'medium': 'warning',
        'low': 'success'
      }
      return colors[priority] || 'grey'
    }

    const getPriorityText = (priority) => {
      const texts = {
        'high': 'Высокий',
        'medium': 'Средний',
        'low': 'Низкий'
      }
      return texts[priority] || priority
    }

    const selectObjective = (event, { item }) => {
      selectedItem.value = { ...item, type: 'objective' }
      strategyStore.setSelectedObjective(item)
    }

    const selectKPI = (event, { item }) => {
      selectedItem.value = { ...item, type: 'kpi' }
      strategyStore.setSelectedKPI(item)
    }

    const showCreateDialog = () => {
      if (currentView.value === 'objectives') {
        showCreateObjectiveDialog.value = true
      } else if (currentView.value === 'kpis') {
        showCreateKPIDialog.value = true
      }
    }

    const onPeriodChange = (period) => {
      strategyStore.setFilters({ period })
    }

    const getRowProps = (data) => {
      const isSelected = selectedItem.value &&
                        selectedItem.value.type === 'objective' &&
                        selectedItem.value.objective_id === data.item.objective_id
      return {
        class: isSelected ? 'selected-row' : ''
      }
    }

    const getKPIRowProps = (data) => {
      const isSelected = selectedItem.value &&
                        selectedItem.value.type === 'kpi' &&
                        selectedItem.value.kpi_id === data.item.kpi_id
      return {
        class: isSelected ? 'selected-row' : ''
      }
    }

    // Watchers
    watch(currentView, (newView) => {
      strategyStore.setView(newView)
      selectedItem.value = null
    })

    // Lifecycle
    onMounted(async () => {
      await strategyStore.initialize()
    })

    return {
      // Store state
      isLoading,
      objectives,
      kpis,
      filteredObjectives,
      filteredKPIs,
      strategicProgress,
      kpiProgress,

      // Local state
      currentView,
      selectedPeriod,
      selectedItem,
      showCreateObjectiveDialog,
      showCreateKPIDialog,
      periodOptions,
      activeObjectivesCount,
      activeKPIsCount,
      topObjectives,
      topKPIs,
      objectiveHeaders,
      kpiHeaders,

      // Methods
      formatValue,
      formatDate,
      getObjectiveProgress,
      getKPIProgress,
      getProgressColor,
      getStatusColor,
      getStatusText,
      getKPIStatusColor,
      getKPIStatusText,
      getTypeColor,
      getTypeIcon,
      getTypeText,
      getCategoryColor,
      getCategoryIcon,
      getPriorityColor,
      getPriorityText,
      selectObjective,
      selectKPI,
      showCreateDialog,
      onPeriodChange,
      getRowProps,
      getKPIRowProps
    }
  }
}
</script>

<style scoped>
.strategy-view {
  padding: 24px;
  height: 100vh;
  overflow: auto;
}

.h-100 {
  height: 100%;
}

:deep(.selected-row) {
  background-color: rgba(25, 118, 210, 0.08) !important;
}

:deep(.selected-row:hover) {
  background-color: rgba(25, 118, 210, 0.12) !important;
}
</style>