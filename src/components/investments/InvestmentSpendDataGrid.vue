<template>
  <div class="investment-spend-data-grid">
    <!-- Заголовок таблицы с действиями -->
    <div class="grid-header pa-3 border-bottom">
      <div class="d-flex align-center justify-space-between mb-3">
        <h3 class="text-h6">Данные о расходах</h3>
        <div class="d-flex align-center gap-2">
          <!-- Переключатель валют -->
          <v-select
            v-model="selectedCurrency"
            :items="availableCurrencies"
            item-title="name"
            item-value="code"
            label="Валюта отображения"
            variant="outlined"
            density="compact"
            style="min-width: 160px;"
            @update:model-value="onCurrencyChange"
          >
            <template #selection="{ item }">
              {{ item.raw.symbol }} {{ item.raw.code }}
            </template>
            <template #item="{ item, props }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <span class="me-2">{{ item.raw.symbol }}</span>
                </template>
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle v-if="!item.raw.isBase">
                  1 {{ item.raw.code }} = {{ formatNumber(exchangeRates[item.raw.code]) }} ₽
                </v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>

          <!-- Кнопка конвертера валют -->
          <v-btn
            icon="mdi-currency-usd"
            size="small"
            variant="text"
            @click="showCurrencyConverter = true"
            title="Конвертер валют"
          />

          <!-- Кнопка экспорта -->
          <v-btn
            icon="mdi-download"
            size="small"
            variant="text"
            @click="exportData"
            title="Экспорт данных"
          />

          <!-- Меню действий -->
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                size="small"
                variant="text"
                v-bind="props"
              />
            </template>
            <v-list density="compact">
              <v-list-item @click="addPeriodColumn">
                <template #prepend>
                  <v-icon icon="mdi-calendar-plus"/>
                </template>
                <v-list-item-title>Добавить период</v-list-item-title>
              </v-list-item>
              <v-list-item @click="showCalculator = true">
                <template #prepend>
                  <v-icon icon="mdi-calculator"/>
                </template>
                <v-list-item-title>Калькулятор</v-list-item-title>
              </v-list-item>
              <v-list-item @click="showCurrencyConverter = true">
                <template #prepend>
                  <v-icon icon="mdi-currency-usd"/>
                </template>
                <v-list-item-title>Конвертер валют</v-list-item-title>
              </v-list-item>
              <v-list-item @click="updateExchangeRates">
                <template #prepend>
                  <v-icon icon="mdi-refresh"/>
                </template>
                <v-list-item-title>Обновить курсы</v-list-item-title>
              </v-list-item>
              <v-list-item @click="showForecastTagManager = true">
                <template #prepend>
                  <v-icon icon="mdi-tag-multiple"/>
                </template>
                <v-list-item-title>Управление тегами статусов</v-list-item-title>
              </v-list-item>
              <v-list-item @click="showActivityLinkManager = true">
                <template #prepend>
                  <v-icon icon="mdi-link-variant"/>
                </template>
                <v-list-item-title>Управление связями с активностями</v-list-item-title>
              </v-list-item>
              <v-list-item @click="resetView">
                <template #prepend>
                  <v-icon icon="mdi-refresh"/>
                </template>
                <v-list-item-title>Сбросить вид</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <!-- Индикаторы статуса -->
      <div class="status-indicators mb-3">
        <v-chip-group>
          <v-chip
            size="small"
            variant="flat"
            color="success"
            prepend-icon="mdi-check-circle"
          >
            Утверждено: {{ formatCurrency(approvedAmount) }}
          </v-chip>
          <v-chip
            size="small"
            variant="flat"
            color="warning"
            prepend-icon="mdi-clock"
          >
            На утверждении: {{ formatCurrency(pendingAmount) }}
          </v-chip>
          <v-chip
            size="small"
            variant="flat"
            color="info"
            prepend-icon="mdi-pencil"
          >
            Черновик: {{ formatCurrency(draftAmount) }}
          </v-chip>
        </v-chip-group>
      </div>
    </div>

    <!-- Основная таблица -->
    <div class="grid-content" style="height: calc(100vh - 400px); overflow: auto;">
      <v-data-table
        v-model:expanded="expandedRows"
        :headers="dynamicHeaders"
        :items="hierarchicalData"
        :loading="isLoading"
        item-key="id"
        show-expand
        expand-on-click
        class="spend-data-table"
        fixed-header
        :items-per-page="-1"
        disable-pagination
      >
        <!-- Колонка названия с отступами для иерархии -->
        <template #item.name="{ item }">
          <div class="d-flex align-center" :style="{ paddingLeft: (item.level * 24) + 'px' }">
            <v-icon
              :icon="getItemIcon(item)"
              :color="getItemColor(item)"
              size="16"
              class="me-2"
            />
            <span
              :class="{
                'font-weight-bold': item.type === 'category',
                'font-weight-medium': item.type === 'subcategory',
                'font-italic': item.type === 'placeholder'
              }"
            >
              {{ item.name }}
            </span>
            <v-icon
              v-if="item.connected_to_activities"
              icon="mdi-link"
              size="12"
              color="warning"
              class="ml-1"
              title="Связано с активностями"
            />
          </div>
        </template>

        <!-- Колонки периодов с редактируемыми ячейками -->
        <template v-for="period in dynamicPeriods" :key="period.key" #[`item.${period.key}`]="{ item }">
          <div class="period-cell">
            <v-text-field
              v-if="canEdit(item, period)"
              v-model="item.values[period.key]"
              variant="plain"
              density="compact"
              hide-details
              class="editable-cell"
              :class="getForecastStatusClass(item, period)"
              @blur="onCellBlur(item, period)"
              @keydown.enter="onCellEnter($event, item, period)"
              @focus="onCellFocus(item, period)"
            >
              <template #append-inner>
                <v-icon
                  v-if="hasPendingChanges(item, period)"
                  icon="mdi-circle"
                  size="6"
                  color="warning"
                  title="Есть несохраненные изменения"
                />
                <v-btn
                  icon="mdi-calculator"
                  size="x-small"
                  variant="text"
                  @click="openCalculator(item, period)"
                  title="Открыть калькулятор"
                />
              </template>
            </v-text-field>
            <div v-else class="readonly-cell" :class="getForecastStatusClass(item, period)">
              {{ formatCurrency(item.values[period.key] || 0) }}
            </div>
          </div>
        </template>

        <!-- Колонка статуса прогноза -->
        <template #item.forecast_status="{ item }">
          <div v-if="item.forecast_status" class="forecast-status-cell">
            <v-menu>
              <template #activator="{ props }">
                <v-chip
                  v-bind="props"
                  :color="getForecastStatusColor(item.forecast_status)"
                  size="small"
                  variant="flat"
                  :prepend-icon="getForecastStatusIcon(item.forecast_status)"
                  class="cursor-pointer"
                  @click.stop
                >
                  {{ getForecastStatusText(item.forecast_status) }}
                  <template #append>
                    <v-icon icon="mdi-chevron-down" size="12"/>
                  </template>
                </v-chip>
              </template>

              <v-list density="compact">
                <v-list-subheader>Изменить статус прогноза</v-list-subheader>
                <v-list-item
                  v-for="status in forecastStatusTags"
                  :key="status.id"
                  @click="changeForecastStatus(item, status.id)"
                  :class="{ 'v-list-item--active': item.forecast_status === status.id }"
                >
                  <template #prepend>
                    <v-icon :icon="status.icon" :color="status.color" class="me-2"/>
                  </template>
                  <v-list-item-title>{{ status.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ status.confidence }}% • {{ status.description }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-menu>

            <!-- Индикатор уверенности -->
            <v-progress-linear
              :model-value="getForecastConfidence(item.forecast_status)"
              :color="getForecastStatusColor(item.forecast_status)"
              height="2"
              class="mt-1"
            />
          </div>
        </template>

        <!-- Колонка действий -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center gap-1">
            <v-btn
              icon="mdi-information"
              size="x-small"
              variant="text"
              @click="openDetails(item)"
              title="Детали"
            />
            <v-btn
              v-if="canLinkToActivities(item)"
              :icon="hasLinkedActivities(item) ? 'mdi-link' : 'mdi-link-plus'"
              size="x-small"
              variant="text"
              :color="hasLinkedActivities(item) ? 'success' : 'primary'"
              @click="openActivityLinkManager(item)"
              :title="hasLinkedActivities(item) ? 'Управление связями' : 'Связать с активностями'"
            />
            <v-btn
              v-if="hasLinkedActivities(item)"
              icon="mdi-chart-pie"
              size="x-small"
              variant="text"
              color="info"
              @click="openAllocationDistributor(item)"
              title="Распределение средств"
            />
            <v-btn
              v-if="canEdit(item)"
              icon="mdi-content-copy"
              size="x-small"
              variant="text"
              @click="duplicateItem(item)"
              title="Дублировать"
            />
            <v-btn
              v-if="canDelete(item)"
              icon="mdi-delete"
              size="x-small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              title="Удалить"
            />
          </div>
        </template>

        <!-- Состояние загрузки -->
        <template #loading>
          <v-skeleton-loader type="table-tbody"/>
        </template>

        <!-- Пустое состояние -->
        <template #no-data>
          <div class="text-center pa-8">
            <v-icon icon="mdi-table" size="64" color="grey-lighten-2" class="mb-4"/>
            <h4 class="text-h6 text-medium-emphasis mb-2">Нет данных</h4>
            <p class="text-body-2 text-medium-emphasis">
              Выберите план инвестиций для отображения данных о расходах
            </p>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Встроенный калькулятор -->
    <v-dialog v-model="showCalculator" max-width="480">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between pa-4">
          <div class="d-flex align-center">
            <v-icon icon="mdi-calculator" class="me-2"/>
            Калькулятор
          </div>
          <div class="d-flex align-center gap-2">
            <v-btn
              icon="mdi-history"
              size="small"
              variant="text"
              @click="showCalculatorHistory = !showCalculatorHistory"
              :color="showCalculatorHistory ? 'primary' : ''"
              title="История вычислений"
            />
            <v-btn
              icon="mdi-backspace"
              size="small"
              variant="text"
              @click="backspaceCalculator"
              title="Удалить символ"
            />
          </div>
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Выражение -->
          <v-text-field
            v-model="calculatorExpression"
            variant="outlined"
            readonly
            class="calculator-expression mb-2"
            style="font-size: 0.9em; color: rgba(var(--v-theme-on-surface), 0.6);"
            hide-details
          />

          <!-- Результат -->
          <v-text-field
            v-model="calculatorDisplay"
            variant="outlined"
            readonly
            class="calculator-display mb-3"
            style="font-size: 1.4em; text-align: right; font-weight: 500;"
            hide-details
          />

          <!-- История вычислений -->
          <v-expand-transition>
            <div v-if="showCalculatorHistory" class="calculator-history mb-3">
              <v-card variant="tonal" class="pa-2">
                <div class="text-caption text-medium-emphasis mb-2">История вычислений:</div>
                <div v-if="calculatorHistory.length === 0" class="text-caption text-disabled">
                  История пуста
                </div>
                <div
                  v-for="(item, index) in calculatorHistory.slice(-5)"
                  :key="index"
                  class="history-item d-flex justify-space-between align-center mb-1 cursor-pointer"
                  @click="useHistoryItem(item)"
                >
                  <span class="text-caption">{{ item.expression }}</span>
                  <span class="text-caption font-weight-medium">= {{ formatNumber(item.result) }}</span>
                </div>
                <v-btn
                  v-if="calculatorHistory.length > 0"
                  size="x-small"
                  variant="text"
                  @click="clearCalculatorHistory"
                  class="mt-1"
                >
                  Очистить историю
                </v-btn>
              </v-card>
            </div>
          </v-expand-transition>

          <!-- Быстрые функции -->
          <div class="quick-functions mb-3">
            <v-chip-group>
              <v-chip
                v-for="func in quickFunctions"
                :key="func.value"
                size="small"
                variant="outlined"
                @click="applyQuickFunction(func.value)"
                class="cursor-pointer"
              >
                {{ func.label }}
              </v-chip>
            </v-chip-group>
          </div>

          <!-- Кнопки калькулятора -->
          <div class="calculator-buttons">
            <v-row no-gutters>
              <v-col v-for="(row, rowIndex) in calculatorButtons" :key="rowIndex" cols="12">
                <v-row no-gutters>
                  <v-col v-for="button in row" :key="button.value" :cols="button.cols || 3">
                    <v-btn
                      :color="button.color"
                      :variant="button.variant || 'outlined'"
                      class="calculator-btn ma-1"
                      @click="handleCalculatorClick(button.value)"
                      :disabled="button.disabled"
                      block
                    >
                      {{ button.label }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>

          <!-- Поле для ввода формул -->
          <v-text-field
            v-model="calculatorCustomFormula"
            variant="outlined"
            label="Введите формулу"
            placeholder="Например: (100000 * 1.2) + 50000"
            class="mt-3"
            @keydown.enter="calculateCustomFormula"
            hide-details
          >
            <template #append-inner>
              <v-btn
                icon="mdi-equal"
                size="small"
                variant="text"
                @click="calculateCustomFormula"
                title="Вычислить формулу"
              />
            </template>
          </v-text-field>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn @click="closeCalculator">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="applyCalculatorResult"
            :disabled="calculatorResult === null"
          >
            Применить ({{ formatCurrency(calculatorResult || 0) }})
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Конвертер валют -->
    <v-dialog v-model="showCurrencyConverter" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon icon="mdi-currency-usd" class="me-2"/>
          Конвертер валют
          <v-spacer/>
          <v-btn
            icon="mdi-refresh"
            size="small"
            variant="text"
            @click="updateExchangeRates"
            title="Обновить курсы"
          />
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Курсы валют -->
          <div class="exchange-rates mb-4">
            <h4 class="text-subtitle-1 mb-2">Текущие курсы (к рублю):</h4>
            <v-row>
              <v-col
                v-for="currency in availableCurrencies.filter(c => !c.isBase)"
                :key="currency.code"
                cols="6"
              >
                <v-card variant="tonal" class="pa-2">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <span class="text-h6 me-2">{{ currency.symbol }}</span>
                      <span class="text-body-2">{{ currency.code }}</span>
                    </div>
                    <span class="text-subtitle-2">{{ formatNumber(exchangeRates[currency.code]) }} ₽</span>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Конвертер -->
          <v-divider class="mb-4"/>
          <h4 class="text-subtitle-1 mb-3">Конвертация:</h4>

          <v-row align="center">
            <!-- Исходная валюта -->
            <v-col cols="5">
              <v-select
                v-model="convertFromCurrency"
                :items="availableCurrencies"
                item-title="name"
                item-value="code"
                label="Из валюты"
                variant="outlined"
                density="compact"
              >
                <template #selection="{ item }">
                  {{ item.raw.symbol }} {{ item.raw.code }}
                </template>
              </v-select>
              <v-text-field
                v-model.number="convertAmount"
                label="Сумма"
                variant="outlined"
                density="compact"
                type="number"
                min="0"
                step="0.01"
                @input="onConvertAmountChange"
              />
            </v-col>

            <!-- Кнопка переключения -->
            <v-col cols="2" class="text-center">
              <v-btn
                icon="mdi-swap-horizontal"
                size="small"
                variant="text"
                @click="swapConversionCurrencies"
                title="Поменять местами"
              />
            </v-col>

            <!-- Целевая валюта -->
            <v-col cols="5">
              <v-select
                v-model="convertToCurrency"
                :items="availableCurrencies"
                item-title="name"
                item-value="code"
                label="В валюту"
                variant="outlined"
                density="compact"
              >
                <template #selection="{ item }">
                  {{ item.raw.symbol }} {{ item.raw.code }}
                </template>
              </v-select>
              <v-text-field
                :model-value="convertedAmount"
                label="Результат"
                variant="outlined"
                density="compact"
                readonly
                :suffix="getCurrencySymbol(convertToCurrency)"
              />
            </v-col>
          </v-row>

          <!-- Детали конвертации -->
          <v-card variant="tonal" class="pa-3 mt-3">
            <div class="text-caption text-medium-emphasis">
              <div>Курс: 1 {{ convertFromCurrency }} = {{ getConversionRate(convertFromCurrency, convertToCurrency) }} {{ convertToCurrency }}</div>
              <div class="mt-1">
                {{ formatNumber(convertAmount || 0) }} {{ getCurrencySymbol(convertFromCurrency) }} =
                {{ formatCurrency(convertedAmount, convertToCurrency) }}
              </div>
            </div>
          </v-card>

          <!-- Опции автоконвертации -->
          <v-divider class="my-4"/>
          <div class="conversion-options">
            <v-switch
              v-model="autoConvertOnCurrencyChange"
              label="Автоматически конвертировать при смене валюты отображения"
              color="primary"
              density="compact"
              hide-details
            />

            <div class="mt-3 d-flex gap-2">
              <v-btn
                variant="outlined"
                size="small"
                @click="convertAllTableData"
                :disabled="selectedCurrency === 'RUB'"
              >
                Конвертировать всю таблицу в {{ selectedCurrency }}
              </v-btn>

              <v-btn
                variant="outlined"
                size="small"
                @click="resetTableToBaseCurrency"
                :disabled="selectedCurrency === 'RUB'"
              >
                Вернуть к рублям
              </v-btn>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn @click="closeCurrencyConverter">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Управление тегами статусов прогноза -->
    <v-dialog v-model="showForecastTagManager" max-width="800">
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon icon="mdi-tag-multiple" class="me-2"/>
          Управление тегами статусов прогноза
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Существующие теги -->
          <h4 class="text-subtitle-1 mb-3">Настройка статусов:</h4>

          <v-row>
            <v-col
              v-for="(tag, index) in forecastStatusTags"
              :key="tag.id"
              cols="12"
              md="6"
            >
              <v-card
                variant="outlined"
                class="pa-3"
                :class="{ 'card-disabled': tag.isDefault && !tag.isEditable }"
              >
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center">
                    <v-icon :icon="tag.icon" :color="tag.color" class="me-2"/>
                    <span class="text-subtitle-2">{{ tag.name }}</span>
                    <v-chip
                      v-if="tag.isDefault"
                      size="x-small"
                      variant="tonal"
                      class="ml-2"
                    >
                      По умолчанию
                    </v-chip>
                  </div>

                  <div class="d-flex align-center gap-1">
                    <v-btn
                      icon="mdi-pencil"
                      size="x-small"
                      variant="text"
                      @click="editForecastTag(tag)"
                      title="Редактировать"
                    />
                    <v-btn
                      v-if="!tag.isDefault"
                      icon="mdi-delete"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="deleteForecastTag(tag.id)"
                      title="Удалить"
                    />
                  </div>
                </div>

                <div class="text-caption text-medium-emphasis mb-2">
                  {{ tag.description }}
                </div>

                <div class="d-flex align-center justify-space-between">
                  <v-chip
                    :color="tag.color"
                    size="small"
                    variant="tonal"
                    :prepend-icon="tag.icon"
                  >
                    {{ tag.confidence }}% уверенности
                  </v-chip>

                  <v-progress-linear
                    :model-value="tag.confidence"
                    :color="tag.color"
                    height="4"
                    style="width: 80px;"
                  />
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Кнопка добавления нового тега -->
          <v-divider class="my-4"/>
          <v-btn
            prepend-icon="mdi-plus"
            variant="outlined"
            @click="addNewForecastTag"
            block
          >
            Добавить новый статус
          </v-btn>

          <!-- Статистика использования -->
          <v-divider class="my-4"/>
          <h4 class="text-subtitle-1 mb-3">Статистика использования в таблице:</h4>

          <v-row>
            <v-col
              v-for="stat in forecastStatusStats"
              :key="stat.status"
              cols="6"
              md="3"
            >
              <v-card variant="tonal" class="pa-2 text-center">
                <v-icon
                  :icon="getForecastStatusIcon(stat.status)"
                  :color="getForecastStatusColor(stat.status)"
                  class="mb-1"
                />
                <div class="text-caption">{{ getForecastStatusText(stat.status) }}</div>
                <div class="text-h6">{{ stat.count }}</div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn @click="resetForecastTagsToDefault" variant="outlined">
            Сбросить к умолчанию
          </v-btn>
          <v-btn @click="closeForecastTagManager" color="primary">
            Готово
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог редактирования/создания тега -->
    <v-dialog v-model="showForecastTagEditor" max-width="500">
      <v-card>
        <v-card-title>
          {{ editingForecastTag?.id ? 'Редактировать статус' : 'Создать новый статус' }}
        </v-card-title>

        <v-card-text class="pa-4">
          <v-text-field
            v-model="forecastTagForm.name"
            label="Название статуса"
            variant="outlined"
            :rules="[v => !!v || 'Название обязательно']"
          />

          <v-textarea
            v-model="forecastTagForm.description"
            label="Описание"
            variant="outlined"
            rows="2"
          />

          <v-row>
            <v-col cols="6">
              <v-slider
                v-model="forecastTagForm.confidence"
                label="Уровень уверенности (%)"
                min="0"
                max="100"
                step="5"
                thumb-label
                color="primary"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="forecastTagForm.color"
                :items="availableColors"
                label="Цвет"
                variant="outlined"
              >
                <template #selection="{ item }">
                  <v-chip :color="item.value" size="small" class="me-2"/>
                  {{ item.title }}
                </template>
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip :color="item.value" size="small" class="me-2"/>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-select
            v-model="forecastTagForm.icon"
            :items="availableIcons"
            label="Иконка"
            variant="outlined"
          >
            <template #selection="{ item }">
              <v-icon :icon="item.value" class="me-2"/>
              {{ item.title }}
            </template>
            <template #item="{ item, props }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon :icon="item.value" class="me-2"/>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <!-- Превью -->
          <v-divider class="my-3"/>
          <div class="text-caption mb-2">Превью:</div>
          <v-chip
            :color="forecastTagForm.color"
            :prepend-icon="forecastTagForm.icon"
            variant="flat"
          >
            {{ forecastTagForm.name || 'Название статуса' }}
          </v-chip>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn @click="cancelForecastTagEdit">Отмена</v-btn>
          <v-btn
            @click="saveForecastTag"
            color="primary"
            :disabled="!forecastTagForm.name"
          >
            {{ editingForecastTag?.id ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Управление связями с активностями -->
    <v-dialog v-model="showActivityLinkManager" max-width="900">
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon icon="mdi-link-variant" class="me-2"/>
          Связи с активностями
          <v-spacer/>
          <v-chip
            v-if="selectedItemForLinking"
            :color="getItemColor(selectedItemForLinking)"
            size="small"
            :prepend-icon="getItemIcon(selectedItemForLinking)"
          >
            {{ selectedItemForLinking.name }}
          </v-chip>
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Текущие связи -->
          <div v-if="getLinkedActivitiesForItem(selectedItemForLinking).length > 0" class="mb-4">
            <h4 class="text-subtitle-1 mb-3">Текущие связи:</h4>
            <v-row>
              <v-col
                v-for="activity in getLinkedActivitiesForItem(selectedItemForLinking)"
                :key="activity.id"
                cols="12"
                md="6"
              >
                <v-card variant="outlined" class="pa-3">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-play" color="primary" class="me-2"/>
                      <span class="text-subtitle-2">{{ activity.name }}</span>
                    </div>
                    <v-btn
                      icon="mdi-close"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="unlinkActivity(selectedItemForLinking, activity.id)"
                      title="Отвязать"
                    />
                  </div>

                  <div class="text-caption text-medium-emphasis mb-2">
                    {{ activity.type }} • {{ activity.status }}
                  </div>

                  <div class="d-flex align-center justify-space-between">
                    <span class="text-body-2">
                      Выделено: {{ formatCurrency(activity.allocated_amount || 0) }}
                    </span>
                    <v-progress-linear
                      :model-value="(activity.allocated_amount / getTotalInvestmentAmount(selectedItemForLinking)) * 100"
                      color="primary"
                      height="4"
                      style="width: 60px;"
                    />
                  </div>
                </v-card>
              </v-col>
            </v-row>
            <v-divider class="my-4"/>
          </div>

          <!-- Форма связывания -->
          <h4 class="text-subtitle-1 mb-3">Добавить новые связи:</h4>

          <!-- Поиск и выбор активностей -->
          <v-autocomplete
            v-model="activityLinkForm.selectedActivities"
            :items="getAvailableActivitiesForLinking()"
            item-title="name"
            item-value="id"
            label="Выберите активности"
            multiple
            chips
            closable-chips
            variant="outlined"
            clearable
          >
            <template #selection="{ item }">
              <v-chip
                size="small"
                color="primary"
                :prepend-icon="getActivityTypeIcon(item.raw.type)"
                closable
                @click:close="removeActivityFromSelection(item.raw.id)"
              >
                {{ item.raw.name }}
              </v-chip>
            </template>

            <template #item="{ item, props }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon :icon="getActivityTypeIcon(item.raw.type)" color="primary"/>
                </template>
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.raw.type }} • Бюджет: {{ formatCurrency(item.raw.budget || 0) }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-autocomplete>

          <!-- Метод распределения -->
          <v-select
            v-model="activityLinkForm.distributionMethod"
            :items="distributionMethods"
            item-title="name"
            item-value="id"
            label="Метод распределения средств"
            variant="outlined"
            class="mt-3"
          >
            <template #item="{ item, props }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon :icon="item.raw.icon" class="me-2"/>
                </template>
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>

          <!-- Настройки распределения -->
          <div v-if="activityLinkForm.selectedActivities.length > 0" class="mt-4">
            <h4 class="text-subtitle-1 mb-3">Настройки распределения:</h4>

            <!-- Равномерное распределение -->
            <div v-if="activityLinkForm.distributionMethod === 'equal'" class="pa-3 bg-surface-variant rounded">
              <div class="text-body-2 mb-2">
                <v-icon icon="mdi-information" size="16" class="me-1"/>
                Средства будут распределены поровну между {{ activityLinkForm.selectedActivities.length }} активностями
              </div>
              <div class="text-caption">
                Каждая активность получит: {{ formatCurrency(getTotalInvestmentAmount(selectedItemForLinking) / activityLinkForm.selectedActivities.length) }}
              </div>
            </div>

            <!-- Ручное распределение -->
            <div v-else-if="activityLinkForm.distributionMethod === 'manual'">
              <v-row>
                <v-col
                  v-for="activityId in activityLinkForm.selectedActivities"
                  :key="activityId"
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model.number="activityLinkForm.allocations[activityId]"
                    :label="`Сумма для ${getActivityById(activityId)?.name}`"
                    variant="outlined"
                    type="number"
                    min="0"
                    :suffix="selectedCurrency"
                  />
                </v-col>
              </v-row>
              <div class="d-flex justify-space-between mt-2">
                <span>Всего распределено:</span>
                <span class="font-weight-bold">
                  {{ formatCurrency(Object.values(activityLinkForm.allocations).reduce((a, b) => (a || 0) + (b || 0), 0)) }}
                </span>
              </div>
            </div>

            <!-- Взвешенное распределение -->
            <div v-else-if="activityLinkForm.distributionMethod === 'weighted'">
              <v-row>
                <v-col
                  v-for="activityId in activityLinkForm.selectedActivities"
                  :key="activityId"
                  cols="12"
                  md="6"
                >
                  <v-slider
                    v-model="activityLinkForm.weights[activityId]"
                    :label="`Вес для ${getActivityById(activityId)?.name}`"
                    min="0"
                    max="100"
                    step="5"
                    thumb-label
                    :suffix="`% (${formatCurrency(calculateWeightedAmount(activityId))})`"
                  />
                </v-col>
              </v-row>
            </div>
          </div>

          <!-- Заметки -->
          <v-textarea
            v-model="activityLinkForm.notes"
            label="Заметки о связи"
            variant="outlined"
            rows="2"
            class="mt-3"
            placeholder="Опишите причину связи или особенности распределения"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn @click="closeActivityLinkManager">Отмена</v-btn>
          <v-btn
            @click="saveActivityLinks"
            color="primary"
            :disabled="activityLinkForm.selectedActivities.length === 0"
          >
            Сохранить связи
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Распределитель средств -->
    <v-dialog v-model="showAllocationDistributor" max-width="700">
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon icon="mdi-chart-pie" class="me-2"/>
          Распределение средств
          <v-spacer/>
          <v-chip
            v-if="selectedItemForLinking"
            :color="getItemColor(selectedItemForLinking)"
            size="small"
          >
            {{ formatCurrency(getTotalInvestmentAmount(selectedItemForLinking)) }}
          </v-chip>
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Визуализация распределения -->
          <div class="allocation-chart mb-4">
            <h4 class="text-subtitle-1 mb-3">Текущее распределение:</h4>

            <div class="allocation-bars">
              <div
                v-for="activity in getLinkedActivitiesForItem(selectedItemForLinking)"
                :key="activity.id"
                class="allocation-bar mb-3"
              >
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-body-2">{{ activity.name }}</span>
                  <span class="text-caption">{{ formatCurrency(activity.allocated_amount || 0) }}</span>
                </div>
                <v-progress-linear
                  :model-value="(activity.allocated_amount / getTotalInvestmentAmount(selectedItemForLinking)) * 100"
                  :color="getActivityAllocationColor(activity)"
                  height="8"
                />
              </div>
            </div>
          </div>

          <!-- Быстрые действия -->
          <v-divider class="mb-4"/>
          <h4 class="text-subtitle-1 mb-3">Быстрые действия:</h4>

          <v-row>
            <v-col cols="6">
              <v-btn
                variant="outlined"
                block
                @click="redistributeEvenly"
                prepend-icon="mdi-equal-box"
              >
                Поровну
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                variant="outlined"
                block
                @click="redistributeByPerformance"
                prepend-icon="mdi-chart-line"
              >
                По результативности
              </v-btn>
            </v-col>
          </v-row>

          <!-- Статистика -->
          <v-divider class="my-4"/>
          <div class="allocation-stats">
            <v-row>
              <v-col cols="4">
                <div class="text-center">
                  <div class="text-h6">{{ getLinkedActivitiesForItem(selectedItemForLinking).length }}</div>
                  <div class="text-caption">Активностей</div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="text-center">
                  <div class="text-h6">{{ formatCurrency(getTotalAllocatedAmount(selectedItemForLinking)) }}</div>
                  <div class="text-caption">Распределено</div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="text-center">
                  <div class="text-h6">{{ formatCurrency(getUnallocatedAmount(selectedItemForLinking)) }}</div>
                  <div class="text-caption">Остаток</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn @click="closeAllocationDistributor">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useInvestmentsStore } from '@/stores/investmentsStore'
import { usePermissions } from '@/composables/usePermissions'
import { getActivitiesForLinking, getActivityInvestmentLinks, linkActivityToInvestment, unlinkActivityFromInvestment } from '@/api/modules/activities'

// Props
const props = defineProps({
  selectedPlanId: {
    type: String,
    default: null
  },
  selectedInvestmentId: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['item-selected', 'cell-changed', 'details-open'])

// Stores
const investmentsStore = useInvestmentsStore()
const { canUpdate, canDelete } = usePermissions()

// Reactive data
const expandedRows = ref([])
const isLoading = ref(false)
const selectedCurrency = ref('RUB')
const showCalculator = ref(false)
const calculatorDisplay = ref('0')
const calculatorExpression = ref('')
const calculatorResult = ref(null)
const calculatorContext = ref(null)
const calculatorHistory = ref([])
const pendingChanges = ref(new Map())
const showCalculatorHistory = ref(false)

// Валюты и курсы
const availableCurrencies = ref([
  { code: 'RUB', name: 'Рубли (₽)', symbol: '₽', isBase: true },
  { code: 'USD', name: 'Доллары ($)', symbol: '$', isBase: false },
  { code: 'EUR', name: 'Евро (€)', symbol: '€', isBase: false },
  { code: 'CNY', name: 'Юани (¥)', symbol: '¥', isBase: false }
])

// Курсы валют (базовая валюта - RUB)
const exchangeRates = ref({
  RUB: 1,
  USD: 91.50,
  EUR: 99.25,
  CNY: 12.75
})

// Состояния для конвертации
const showCurrencyConverter = ref(false)
const convertFromCurrency = ref('RUB')
const convertToCurrency = ref('USD')
const convertAmount = ref(0)
const autoConvertOnCurrencyChange = ref(true)

// Состояния для тегирования статусов прогноза
const showForecastTagManager = ref(false)
const showForecastTagEditor = ref(false)
const editingForecastTag = ref(null)
const customForecastTags = ref([])

// Форма для редактирования тегов
const forecastTagForm = ref({
  name: '',
  description: '',
  color: 'primary',
  icon: 'mdi-tag',
  confidence: 50
})

// Доступные цвета и иконки для тегов
const availableColors = ref([
  { title: 'Основной', value: 'primary' },
  { title: 'Успех', value: 'success' },
  { title: 'Информация', value: 'info' },
  { title: 'Предупреждение', value: 'warning' },
  { title: 'Ошибка', value: 'error' },
  { title: 'Зеленый', value: 'green' },
  { title: 'Оранжевый', value: 'orange' },
  { title: 'Фиолетовый', value: 'purple' },
  { title: 'Серый', value: 'grey' }
])

const availableIcons = ref([
  { title: 'Тег', value: 'mdi-tag' },
  { title: 'Галочка', value: 'mdi-check' },
  { title: 'Галочка в круге', value: 'mdi-check-circle' },
  { title: 'Крестик', value: 'mdi-close' },
  { title: 'Крестик в круге', value: 'mdi-close-circle' },
  { title: 'Вопрос', value: 'mdi-help-circle' },
  { title: 'Пауза', value: 'mdi-pause-circle' },
  { title: 'Звезда', value: 'mdi-star' },
  { title: 'Сердце', value: 'mdi-heart' },
  { title: 'Молния', value: 'mdi-lightning-bolt' },
  { title: 'Часы', value: 'mdi-clock' },
  { title: 'Флаг', value: 'mdi-flag' }
])

// Расширенные статусы прогноза с тегами
const forecastStatusTags = ref([
  {
    id: 'confident',
    name: 'Уверенный',
    color: 'success',
    description: 'Высокая вероятность исполнения',
    confidence: 95,
    icon: 'mdi-check-circle',
    isDefault: true
  },
  {
    id: 'likely',
    name: 'Вероятный',
    color: 'info',
    description: 'Хорошие шансы на исполнение',
    confidence: 75,
    icon: 'mdi-check',
    isDefault: true
  },
  {
    id: 'speculative',
    name: 'Гипотетический',
    color: 'warning',
    description: 'Требует дополнительного анализа',
    confidence: 50,
    icon: 'mdi-help-circle',
    isDefault: true
  },
  {
    id: 'unlikely',
    name: 'Маловероятный',
    color: 'error',
    description: 'Низкая вероятность исполнения',
    confidence: 25,
    icon: 'mdi-close-circle',
    isDefault: true
  },
  {
    id: 'on_hold',
    name: 'Приостановлен',
    color: 'orange',
    description: 'Временно приостановлен',
    confidence: 0,
    icon: 'mdi-pause-circle',
    isDefault: false
  },
  {
    id: 'approved',
    name: 'Утвержден',
    color: 'green',
    description: 'Официально утвержден',
    confidence: 100,
    icon: 'mdi-check-decagram',
    isDefault: false
  },
  {
    id: 'draft',
    name: 'Черновик',
    color: 'grey',
    description: 'В стадии разработки',
    confidence: 10,
    icon: 'mdi-file-document-edit',
    isDefault: false
  }
])

// Состояние для активностей (загружается из API)
const availableActivitiesData = ref([])

// Периоды для колонок (динамические)
const dynamicPeriods = ref([
  { key: 'jan_2025', title: 'Янв 2025', type: 'actual' },
  { key: 'feb_2025', title: 'Фев 2025', type: 'actual' },
  { key: 'mar_2025', title: 'Мар 2025', type: 'forecast' },
  { key: 'apr_2025', title: 'Апр 2025', type: 'forecast' },
  { key: 'may_2025', title: 'Май 2025', type: 'forecast' },
  { key: 'jun_2025', title: 'Июн 2025', type: 'forecast' }
])

// Заголовки таблицы
const dynamicHeaders = computed(() => {
  const headers = [
    {
      title: 'Название',
      key: 'name',
      sortable: false,
      width: '300px'
    }
  ]

  // Добавляем колонки периодов
  dynamicPeriods.value.forEach(period => {
    headers.push({
      title: period.title,
      key: period.key,
      sortable: false,
      width: '120px',
      align: 'end'
    })
  })

  headers.push(
    {
      title: 'Статус прогноза',
      key: 'forecast_status',
      sortable: false,
      width: '150px'
    },
    {
      title: 'Действия',
      key: 'actions',
      sortable: false,
      width: '120px'
    }
  )

  return headers
})

// Mock данные для таблицы
const hierarchicalData = ref([
  {
    id: 'inv_cat_001',
    name: 'Digital Marketing',
    type: 'category',
    level: 0,
    connected_to_activities: false,
    forecast_status: 'confident',
    values: {
      jan_2025: 500000,
      feb_2025: 550000,
      mar_2025: 600000,
      apr_2025: 620000,
      may_2025: 640000,
      jun_2025: 650000
    }
  },
  {
    id: 'inv_subcat_001',
    name: 'Social Media',
    type: 'subcategory',
    level: 1,
    connected_to_activities: true,
    forecast_status: 'likely',
    values: {
      jan_2025: 200000,
      feb_2025: 220000,
      mar_2025: 250000,
      apr_2025: 260000,
      may_2025: 270000,
      jun_2025: 280000
    }
  },
  {
    id: 'inv_line_001',
    name: 'Instagram Ads',
    type: 'line_item',
    level: 2,
    connected_to_activities: true,
    forecast_status: 'confident',
    values: {
      jan_2025: 80000,
      feb_2025: 90000,
      mar_2025: 100000,
      apr_2025: 105000,
      may_2025: 110000,
      jun_2025: 115000
    }
  },
  {
    id: 'inv_line_002',
    name: 'TikTok Campaigns',
    type: 'line_item',
    level: 2,
    connected_to_activities: true,
    forecast_status: 'speculative',
    values: {
      jan_2025: 60000,
      feb_2025: 65000,
      mar_2025: 70000,
      apr_2025: 75000,
      may_2025: 80000,
      jun_2025: 85000
    }
  },
  {
    id: 'inv_placeholder_001',
    name: 'Additional Social Budget',
    type: 'placeholder',
    level: 2,
    connected_to_activities: false,
    forecast_status: 'unlikely',
    values: {
      jan_2025: 60000,
      feb_2025: 65000,
      mar_2025: 80000,
      apr_2025: 80000,
      may_2025: 80000,
      jun_2025: 80000
    }
  }
])

// Computed properties
const approvedAmount = computed(() => {
  return hierarchicalData.value
    .filter(item => item.forecast_status === 'confident')
    .reduce((sum, item) => {
      return sum + Object.values(item.values || {}).reduce((a, b) => a + b, 0)
    }, 0)
})

const pendingAmount = computed(() => {
  return hierarchicalData.value
    .filter(item => item.forecast_status === 'likely')
    .reduce((sum, item) => {
      return sum + Object.values(item.values || {}).reduce((a, b) => a + b, 0)
    }, 0)
})

const draftAmount = computed(() => {
  return hierarchicalData.value
    .filter(item => ['speculative', 'unlikely'].includes(item.forecast_status))
    .reduce((sum, item) => {
      return sum + Object.values(item.values || {}).reduce((a, b) => a + b, 0)
    }, 0)
})

// Статистика использования статусов прогноза
const forecastStatusStats = computed(() => {
  const stats = {}

  hierarchicalData.value.forEach(item => {
    if (item.forecast_status) {
      stats[item.forecast_status] = (stats[item.forecast_status] || 0) + 1
    }
  })

  return Object.entries(stats).map(([status, count]) => ({
    status,
    count
  }))
})

// Кнопки калькулятора
// Дополнительные переменные для калькулятора
const calculatorCustomFormula = ref('')

// Быстрые функции
const quickFunctions = ref([
  { label: '+10%', value: 'increase10' },
  { label: '-10%', value: 'decrease10' },
  { label: '+20%', value: 'increase20' },
  { label: '-20%', value: 'decrease20' },
  { label: 'x2', value: 'double' },
  { label: '÷2', value: 'half' }
])

// Кнопки калькулятора
const calculatorButtons = [
  [
    { label: 'C', value: 'clear', color: 'error', variant: 'flat' },
    { label: 'CE', value: 'clear_entry' },
    { label: '⌫', value: 'backspace' },
    { label: '÷', value: '/', color: 'primary' }
  ],
  [
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '×', value: '*', color: 'primary' }
  ],
  [
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '−', value: '-', color: 'primary' }
  ],
  [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '+', value: '+', color: 'primary' }
  ],
  [
    { label: '±', value: 'negate' },
    { label: '0', value: '0' },
    { label: '.', value: '.' },
    { label: '=', value: '=', color: 'success', variant: 'flat' }
  ]
]

// Methods
const canEdit = (item, period = null) => {
  return canUpdate('investments') &&
         item.type !== 'category' &&
         (!period || period.type !== 'actual')
}

const getItemIcon = (item) => {
  const icons = {
    category: 'mdi-folder',
    subcategory: 'mdi-folder-outline',
    line_item: 'mdi-file-document',
    placeholder: 'mdi-bookmark'
  }
  return icons[item.type] || 'mdi-help'
}

const getItemColor = (item) => {
  const colors = {
    category: 'primary',
    subcategory: 'info',
    line_item: 'success',
    placeholder: 'warning'
  }
  return colors[item.type] || 'grey'
}

const getForecastStatusClass = (item, period) => {
  if (period?.type === 'actual') return 'actual-period'

  const statusClasses = {
    confident: 'forecast-confident',
    likely: 'forecast-likely',
    speculative: 'forecast-speculative',
    unlikely: 'forecast-unlikely'
  }
  return statusClasses[item.forecast_status] || ''
}

const getForecastStatusColor = (status) => {
  const tag = forecastStatusTags.value.find(t => t.id === status)
  return tag ? tag.color : 'grey'
}

const getForecastStatusText = (status) => {
  const tag = forecastStatusTags.value.find(t => t.id === status)
  return tag ? tag.name : status
}

const getForecastStatusIcon = (status) => {
  const tag = forecastStatusTags.value.find(t => t.id === status)
  return tag ? tag.icon : 'mdi-tag'
}

const getForecastConfidence = (status) => {
  const tag = forecastStatusTags.value.find(t => t.id === status)
  return tag ? tag.confidence : 0
}

const formatCurrency = (amount, currencyCode = null) => {
  const targetCurrency = currencyCode || selectedCurrency.value
  const currencies = {
    RUB: { symbol: '₽', locale: 'ru-RU' },
    USD: { symbol: '$', locale: 'en-US' },
    EUR: { symbol: '€', locale: 'de-DE' },
    CNY: { symbol: '¥', locale: 'zh-CN' }
  }

  const currency = currencies[targetCurrency] || currencies.RUB

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 0
    }).format(amount || 0)
  } catch (error) {
    // Fallback если валюта не поддерживается Intl
    return `${formatNumber(amount || 0)} ${currency.symbol}`
  }
}

const getCurrencySymbol = (currencyCode) => {
  const currency = availableCurrencies.value.find(c => c.code === currencyCode)
  return currency ? currency.symbol : '₽'
}

const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount

  // Конвертируем в базовую валюту (RUB) если нужно
  const amountInRub = fromCurrency === 'RUB'
    ? amount
    : amount * exchangeRates.value[fromCurrency]

  // Конвертируем из базовой валюты в целевую
  const result = toCurrency === 'RUB'
    ? amountInRub
    : amountInRub / exchangeRates.value[toCurrency]

  return Math.round(result * 100) / 100
}

const getConversionRate = (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1

  const rate = convertCurrency(1, fromCurrency, toCurrency)
  return formatNumber(rate)
}

const hasPendingChanges = (item, period) => {
  const key = `${item.id}_${period.key}`
  return pendingChanges.value.has(key)
}

const onCellBlur = (item, period) => {
  const key = `${item.id}_${period.key}`
  pendingChanges.value.delete(key)

  emit('cell-changed', {
    item,
    period,
    value: item.values[period.key]
  })
}

const onCellEnter = (event, item, period) => {
  event.target.blur()
}

const onCellFocus = (item, period) => {
  const key = `${item.id}_${period.key}`
  pendingChanges.value.set(key, true)
}

// Computed для конвертера
const convertedAmount = computed(() => {
  if (!convertAmount.value) return 0
  return convertCurrency(convertAmount.value, convertFromCurrency.value, convertToCurrency.value)
})

// Обработчики событий для валют
const onCurrencyChange = (newCurrency) => {
  console.log('Currency changed to:', newCurrency)

  if (autoConvertOnCurrencyChange.value && newCurrency !== 'RUB') {
    // Автоматически конвертируем отображаемые значения
    convertDisplayValues(newCurrency)
  }
}

const onConvertAmountChange = () => {
  // Обновляем результат конвертации при изменении суммы
  // Это происходит автоматически через computed convertedAmount
}

const swapConversionCurrencies = () => {
  const temp = convertFromCurrency.value
  convertFromCurrency.value = convertToCurrency.value
  convertToCurrency.value = temp
}

const updateExchangeRates = async () => {
  try {
    // Имитация обновления курсов (в реальном приложении здесь был бы API вызов)
    console.log('Updating exchange rates...')

    // Симулируем небольшое изменение курсов
    const variation = 0.02 // 2% вариация
    exchangeRates.value.USD = 91.50 + (Math.random() - 0.5) * variation * 91.50
    exchangeRates.value.EUR = 99.25 + (Math.random() - 0.5) * variation * 99.25
    exchangeRates.value.CNY = 12.75 + (Math.random() - 0.5) * variation * 12.75

    // Округляем до 2 знаков
    Object.keys(exchangeRates.value).forEach(currency => {
      if (currency !== 'RUB') {
        exchangeRates.value[currency] = Math.round(exchangeRates.value[currency] * 100) / 100
      }
    })

    console.log('Exchange rates updated:', exchangeRates.value)
  } catch (error) {
    console.error('Failed to update exchange rates:', error)
  }
}

const convertDisplayValues = (targetCurrency) => {
  if (targetCurrency === 'RUB') return

  // Конвертируем все значения в таблице для отображения
  hierarchicalData.value.forEach(item => {
    if (item.values) {
      Object.keys(item.values).forEach(periodKey => {
        if (item.values[periodKey]) {
          item.values[periodKey] = convertCurrency(item.values[periodKey], 'RUB', targetCurrency)
        }
      })
    }
  })
}

const convertAllTableData = () => {
  if (selectedCurrency.value === 'RUB') return

  convertDisplayValues(selectedCurrency.value)
  console.log(`All data converted to ${selectedCurrency.value}`)
}

const resetTableToBaseCurrency = () => {
  // Сброс к базовой валюте - перезагружаем данные
  // В реальном приложении здесь был бы повторный запрос к API
  console.log('Resetting table data to base currency (RUB)')

  // Имитация перезагрузки исходных данных в рублях
  hierarchicalData.value.forEach(item => {
    if (item.id === 'inv_cat_001') {
      item.values = {
        jan_2025: 500000,
        feb_2025: 550000,
        mar_2025: 600000,
        apr_2025: 620000,
        may_2025: 640000,
        jun_2025: 650000
      }
    }
    // ... остальные элементы
  })

  selectedCurrency.value = 'RUB'
}

const closeCurrencyConverter = () => {
  showCurrencyConverter.value = false
}

// Методы для управления тегами статусов прогноза
const changeForecastStatus = (item, newStatus) => {
  item.forecast_status = newStatus
  emit('cell-changed', {
    item,
    field: 'forecast_status',
    value: newStatus
  })
}

const editForecastTag = (tag) => {
  editingForecastTag.value = tag
  forecastTagForm.value = {
    name: tag.name,
    description: tag.description,
    color: tag.color,
    icon: tag.icon,
    confidence: tag.confidence
  }
  showForecastTagEditor.value = true
}

const addNewForecastTag = () => {
  editingForecastTag.value = null
  forecastTagForm.value = {
    name: '',
    description: '',
    color: 'primary',
    icon: 'mdi-tag',
    confidence: 50
  }
  showForecastTagEditor.value = true
}

const saveForecastTag = () => {
  if (!forecastTagForm.value.name) return

  if (editingForecastTag.value) {
    // Редактирование существующего тега
    const index = forecastStatusTags.value.findIndex(t => t.id === editingForecastTag.value.id)
    if (index !== -1) {
      forecastStatusTags.value[index] = {
        ...editingForecastTag.value,
        ...forecastTagForm.value
      }
    }
  } else {
    // Создание нового тега
    const newTag = {
      id: `custom_${Date.now()}`,
      ...forecastTagForm.value,
      isDefault: false
    }
    forecastStatusTags.value.push(newTag)
  }

  cancelForecastTagEdit()
}

const cancelForecastTagEdit = () => {
  showForecastTagEditor.value = false
  editingForecastTag.value = null
  forecastTagForm.value = {
    name: '',
    description: '',
    color: 'primary',
    icon: 'mdi-tag',
    confidence: 50
  }
}

const deleteForecastTag = (tagId) => {
  const index = forecastStatusTags.value.findIndex(t => t.id === tagId)
  if (index !== -1 && !forecastStatusTags.value[index].isDefault) {
    forecastStatusTags.value.splice(index, 1)

    // Заменяем удаленный статус на базовый для всех элементов таблицы
    hierarchicalData.value.forEach(item => {
      if (item.forecast_status === tagId) {
        item.forecast_status = 'speculative'
      }
    })
  }
}

const resetForecastTagsToDefault = () => {
  // Удаляем все кастомные теги
  forecastStatusTags.value = forecastStatusTags.value.filter(tag => tag.isDefault)

  // Сбрасываем все кастомные статусы на базовые
  hierarchicalData.value.forEach(item => {
    if (item.forecast_status && !forecastStatusTags.value.find(t => t.id === item.forecast_status)) {
      item.forecast_status = 'speculative'
    }
  })
}

const closeForecastTagManager = () => {
  showForecastTagManager.value = false
}

// Методы для работы с активностями и связями
const canLinkToActivities = (item) => {
  return item.type === 'line_item' || item.type === 'placeholder'
}

const hasLinkedActivities = (item) => {
  return linkedActivities.value.has(item.id) && linkedActivities.value.get(item.id).length > 0
}

const getLinkedActivitiesForItem = (item) => {
  if (!item || !linkedActivities.value.has(item.id)) return []

  const activityIds = linkedActivities.value.get(item.id)
  return availableActivitiesData.value.filter(activity => activityIds.includes(activity.id))
}

const getAvailableActivitiesForLinking = () => {
  if (!selectedItemForLinking.value) return availableActivitiesData.value

  const linkedIds = linkedActivities.value.get(selectedItemForLinking.value.id) || []
  return availableActivitiesData.value.filter(activity => !linkedIds.includes(activity.id))
}

const getActivityById = (activityId) => {
  return availableActivitiesData.value.find(activity => activity.id === activityId)
}

const getActivityTypeIcon = (type) => {
  const icons = {
    'Campaign': 'mdi-bullhorn',
    'Digital Campaign': 'mdi-instagram',
    'Traditional Campaign': 'mdi-television',
    'Social Media': 'mdi-share-variant',
    'Display Advertising': 'mdi-monitor',
    'Search Marketing': 'mdi-magnify',
    'Email Marketing': 'mdi-email',
    'Content Marketing': 'mdi-text-box',
    'Outdoor Advertising': 'mdi-billboard',
    'Event': 'mdi-calendar-star',
    'TV Advertising': 'mdi-television',
    'Public Relations': 'mdi-account-group',
    'Sponsorship': 'mdi-handshake'
  }
  return icons[type] || 'mdi-play'
}

const getActivityAllocationColor = (activity) => {
  const score = activity.performance_score
  if (score >= 90) return 'success'
  if (score >= 80) return 'info'
  if (score >= 70) return 'warning'
  return 'error'
}

const getTotalInvestmentAmount = (item) => {
  if (!item || !item.values) return 0
  return Object.values(item.values).reduce((sum, value) => sum + (value || 0), 0)
}

const getTotalAllocatedAmount = (item) => {
  const linkedActivitiesData = getLinkedActivitiesForItem(item)
  return linkedActivitiesData.reduce((sum, activity) => sum + (activity.allocated_amount || 0), 0)
}

const getUnallocatedAmount = (item) => {
  return getTotalInvestmentAmount(item) - getTotalAllocatedAmount(item)
}

const calculateWeightedAmount = (activityId) => {
  if (!selectedItemForLinking.value) return 0

  const totalAmount = getTotalInvestmentAmount(selectedItemForLinking.value)
  const weight = activityLinkForm.value.weights[activityId] || 0
  const totalWeights = Object.values(activityLinkForm.value.weights).reduce((sum, w) => sum + (w || 0), 0)

  if (totalWeights === 0) return 0
  return (weight / totalWeights) * totalAmount
}

const openActivityLinkManager = (item) => {
  selectedItemForLinking.value = item

  // Сброс формы
  activityLinkForm.value = {
    selectedActivities: [],
    distributionMethod: 'equal',
    allocations: {},
    weights: {},
    notes: ''
  }

  showActivityLinkManager.value = true
}

const closeActivityLinkManager = () => {
  showActivityLinkManager.value = false
  selectedItemForLinking.value = null
}

const openAllocationDistributor = (item) => {
  selectedItemForLinking.value = item
  showAllocationDistributor.value = true
}

const closeAllocationDistributor = () => {
  showAllocationDistributor.value = false
  selectedItemForLinking.value = null
}

const removeActivityFromSelection = (activityId) => {
  const index = activityLinkForm.value.selectedActivities.indexOf(activityId)
  if (index > -1) {
    activityLinkForm.value.selectedActivities.splice(index, 1)
  }
}

const unlinkActivity = async (item, activityId) => {
  try {
    // Вызываем API для удаления связи
    await unlinkActivityFromInvestment(activityId, item.id)

    // Обновляем локальное состояние
    const linkedIds = linkedActivities.value.get(item.id) || []
    const updatedIds = linkedIds.filter(id => id !== activityId)

    if (updatedIds.length === 0) {
      linkedActivities.value.delete(item.id)
    } else {
      linkedActivities.value.set(item.id, updatedIds)
    }

    // Сбрасываем выделенную сумму для активности
    const activity = getActivityById(activityId)
    if (activity) {
      activity.allocated_amount = 0
    }

    // Обновляем индикатор связи в таблице
    item.connected_to_activities = hasLinkedActivities(item)
  } catch (error) {
    console.error('Failed to unlink activity:', error)
  }
}

const saveActivityLinks = async () => {
  if (!selectedItemForLinking.value || activityLinkForm.value.selectedActivities.length === 0) return

  try {
    const existingLinks = linkedActivities.value.get(selectedItemForLinking.value.id) || []
    const newLinks = [...existingLinks, ...activityLinkForm.value.selectedActivities]

    // Распределяем средства согласно выбранному методу
    const totalAmount = getTotalInvestmentAmount(selectedItemForLinking.value)

    // Создаем связи через API
    for (const activityId of activityLinkForm.value.selectedActivities) {
      const activity = getActivityById(activityId)
      if (!activity) continue

      let allocatedAmount = 0

      switch (activityLinkForm.value.distributionMethod) {
        case 'equal':
          allocatedAmount = totalAmount / newLinks.length
          break
        case 'manual':
          allocatedAmount = activityLinkForm.value.allocations[activityId] || 0
          break
        case 'weighted':
          allocatedAmount = calculateWeightedAmount(activityId)
          break
        case 'performance':
          const totalPerformance = newLinks.reduce((sum, id) => {
            const act = getActivityById(id)
            return sum + (act ? act.performance_score : 0)
          }, 0)
          allocatedAmount = (activity.performance_score / totalPerformance) * totalAmount
          break
      }

      // Создаем связь через API
      await linkActivityToInvestment(activityId, selectedItemForLinking.value.id, {
        allocation_type: activityLinkForm.value.distributionMethod === 'equal' ? 'Auto' : 'Manual',
        allocated_amount: allocatedAmount,
        allocation_percentage: (allocatedAmount / totalAmount) * 100,
        priority: 'Medium',
        notes: activityLinkForm.value.notes
      })

      // Обновляем локальные данные
      activity.allocated_amount = allocatedAmount
    }

    // Обновляем локальное состояние связей
    linkedActivities.value.set(selectedItemForLinking.value.id, newLinks)

    // Обновляем индикатор связи в таблице
    selectedItemForLinking.value.connected_to_activities = true

    closeActivityLinkManager()
  } catch (error) {
    console.error('Failed to save activity links:', error)
  }
}

const redistributeEvenly = () => {
  if (!selectedItemForLinking.value) return

  const linkedActivitiesData = getLinkedActivitiesForItem(selectedItemForLinking.value)
  const totalAmount = getTotalInvestmentAmount(selectedItemForLinking.value)
  const amountPerActivity = totalAmount / linkedActivitiesData.length

  linkedActivitiesData.forEach(activity => {
    activity.allocated_amount = amountPerActivity
  })
}

const redistributeByPerformance = () => {
  if (!selectedItemForLinking.value) return

  const linkedActivitiesData = getLinkedActivitiesForItem(selectedItemForLinking.value)
  const totalAmount = getTotalInvestmentAmount(selectedItemForLinking.value)
  const totalPerformance = linkedActivitiesData.reduce((sum, activity) => sum + activity.performance_score, 0)

  linkedActivitiesData.forEach(activity => {
    activity.allocated_amount = (activity.performance_score / totalPerformance) * totalAmount
  })
}

// Состояния для связи инвестиций с активностями
const showActivityLinkManager = ref(false)
const selectedItemForLinking = ref(null)
const availableActivities = ref([])
const linkedActivities = ref(new Map())
const allocationMethod = ref('equal') // equal, manual, weighted
const showAllocationDistributor = ref(false)

// Методы распределения средств
const distributionMethods = ref([
  {
    id: 'equal',
    name: 'Равномерное распределение',
    description: 'Деньги делятся поровну между всеми связанными активностями',
    icon: 'mdi-equal-box'
  },
  {
    id: 'manual',
    name: 'Ручное распределение',
    description: 'Вы указываете точную сумму для каждой активности',
    icon: 'mdi-account-edit'
  },
  {
    id: 'weighted',
    name: 'Взвешенное распределение',
    description: 'Распределение по весам/процентам для каждой активности',
    icon: 'mdi-percent'
  },
  {
    id: 'performance',
    name: 'По результативности',
    description: 'Распределение на основе KPI активностей',
    icon: 'mdi-chart-line'
  }
])

// Форма для настройки связей
const activityLinkForm = ref({
  selectedActivities: [],
  distributionMethod: 'equal',
  allocations: {},
  weights: {},
  notes: ''
})

const formatNumber = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value || 0)
}

const evaluateExpression = (expression) => {
  try {
    // Заменяем символы калькулятора на JavaScript операторы
    const cleanExpression = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\s/g, '')

    // Проверяем на безопасность (только числа и математические операторы)
    if (!/^[0-9+\-*/.() ]+$/.test(cleanExpression)) {
      throw new Error('Недопустимые символы в выражении')
    }

    // Вычисляем результат
    const result = Function('"use strict"; return (' + cleanExpression + ')')()

    if (!isFinite(result)) {
      throw new Error('Результат вычисления не является конечным числом')
    }

    return result
  } catch (error) {
    throw new Error('Ошибка в вычислении: ' + error.message)
  }
}

const openCalculator = (item, period) => {
  calculatorContext.value = { item, period }
  const currentValue = item.values[period.key] || 0
  calculatorDisplay.value = String(currentValue)
  calculatorExpression.value = String(currentValue)
  calculatorResult.value = currentValue
  calculatorCustomFormula.value = ''
  showCalculatorHistory.value = false
  showCalculator.value = true
}

const handleCalculatorClick = (value) => {
  if (value === 'clear') {
    calculatorDisplay.value = '0'
    calculatorExpression.value = ''
    calculatorResult.value = null
  } else if (value === 'clear_entry') {
    calculatorDisplay.value = '0'
  } else if (value === 'backspace') {
    backspaceCalculator()
  } else if (value === '=') {
    calculateResult()
  } else if (value === 'negate') {
    if (calculatorDisplay.value !== '0' && calculatorDisplay.value !== '') {
      const current = parseFloat(calculatorDisplay.value)
      calculatorDisplay.value = String(-current)
      calculatorExpression.value = calculatorExpression.value.replace(/[^+\-*/÷×()]*$/, calculatorDisplay.value)
    }
  } else {
    // Ввод чисел и операторов
    if (calculatorDisplay.value === '0' && !isNaN(value)) {
      calculatorDisplay.value = value
      calculatorExpression.value = value
    } else {
      if (isNaN(value) && value !== '.') {
        // Операторы
        calculatorExpression.value += value
        calculatorDisplay.value = value
      } else {
        // Числа и точка
        if (calculatorDisplay.value === '0' || isNaN(calculatorDisplay.value)) {
          calculatorDisplay.value = value
        } else {
          calculatorDisplay.value += value
        }

        // Обновляем выражение
        if (calculatorExpression.value.match(/[+\-*/÷×]$/)) {
          calculatorExpression.value += value
        } else {
          calculatorExpression.value = calculatorExpression.value.replace(/[^+\-*/÷×()]*$/, calculatorDisplay.value)
        }
      }
    }
  }
}

const calculateResult = () => {
  try {
    const result = evaluateExpression(calculatorExpression.value)
    calculatorResult.value = result
    calculatorDisplay.value = String(result)

    // Добавляем в историю
    if (calculatorExpression.value && calculatorExpression.value !== String(result)) {
      calculatorHistory.value.push({
        expression: calculatorExpression.value,
        result: result,
        timestamp: new Date()
      })

      // Ограничиваем историю 20 записями
      if (calculatorHistory.value.length > 20) {
        calculatorHistory.value = calculatorHistory.value.slice(-20)
      }
    }
  } catch (error) {
    calculatorDisplay.value = 'Ошибка'
    calculatorResult.value = null
  }
}

const calculateCustomFormula = () => {
  if (!calculatorCustomFormula.value.trim()) return

  try {
    const result = evaluateExpression(calculatorCustomFormula.value)
    calculatorResult.value = result
    calculatorDisplay.value = String(result)
    calculatorExpression.value = calculatorCustomFormula.value

    // Добавляем в историю
    calculatorHistory.value.push({
      expression: calculatorCustomFormula.value,
      result: result,
      timestamp: new Date()
    })

    calculatorCustomFormula.value = ''
  } catch (error) {
    calculatorDisplay.value = 'Ошибка в формуле'
    calculatorResult.value = null
  }
}

const backspaceCalculator = () => {
  if (calculatorDisplay.value.length > 1) {
    calculatorDisplay.value = calculatorDisplay.value.slice(0, -1)
    calculatorExpression.value = calculatorExpression.value.slice(0, -1)
  } else {
    calculatorDisplay.value = '0'
    calculatorExpression.value = '0'
  }
}

const applyQuickFunction = (func) => {
  const currentValue = parseFloat(calculatorDisplay.value) || 0
  let newValue = currentValue

  switch (func) {
    case 'increase10':
      newValue = currentValue * 1.1
      break
    case 'decrease10':
      newValue = currentValue * 0.9
      break
    case 'increase20':
      newValue = currentValue * 1.2
      break
    case 'decrease20':
      newValue = currentValue * 0.8
      break
    case 'double':
      newValue = currentValue * 2
      break
    case 'half':
      newValue = currentValue / 2
      break
  }

  calculatorResult.value = newValue
  calculatorDisplay.value = String(newValue)
  calculatorExpression.value = String(newValue)
}

const useHistoryItem = (item) => {
  calculatorExpression.value = item.expression
  calculatorDisplay.value = String(item.result)
  calculatorResult.value = item.result
}

const clearCalculatorHistory = () => {
  calculatorHistory.value = []
}

const applyCalculatorResult = () => {
  if (calculatorContext.value && calculatorResult.value !== null) {
    const roundedResult = Math.round(calculatorResult.value * 100) / 100
    calculatorContext.value.item.values[calculatorContext.value.period.key] = roundedResult

    emit('cell-changed', {
      item: calculatorContext.value.item,
      period: calculatorContext.value.period,
      value: roundedResult
    })

    closeCalculator()
  }
}

const closeCalculator = () => {
  showCalculator.value = false
  calculatorContext.value = null
  calculatorResult.value = null
  calculatorDisplay.value = '0'
  calculatorExpression.value = ''
  calculatorCustomFormula.value = ''
  showCalculatorHistory.value = false
}

const openDetails = (item) => {
  emit('details-open', item)
}

const duplicateItem = (item) => {
  console.log('Duplicating item:', item)
}

const deleteItem = (item) => {
  console.log('Deleting item:', item)
}

const addPeriodColumn = () => {
  console.log('Adding period column')
}

const exportData = () => {
  console.log('Exporting data')
}

const resetView = () => {
  console.log('Resetting view')
}

// Watchers
watch(() => props.selectedPlanId, (newPlanId) => {
  if (newPlanId) {
    // Загружаем данные для выбранного плана
    console.log('Loading spend data for plan:', newPlanId)
  }
})

// Методы загрузки данных из API
const loadAvailableActivities = async () => {
  try {
    const activities = await getActivitiesForLinking()
    availableActivitiesData.value = activities
  } catch (error) {
    console.error('Failed to load activities:', error)
  }
}

const loadActivityInvestmentLinks = async () => {
  try {
    const links = await getActivityInvestmentLinks()

    // Группируем связи по инвестициям
    const linksByInvestment = new Map()

    links.forEach(link => {
      const investmentId = link.investment_id
      if (!linksByInvestment.has(investmentId)) {
        linksByInvestment.set(investmentId, [])
      }
      linksByInvestment.get(investmentId).push(link.activity_id)

      // Обновляем allocated_amount в активности
      const activity = availableActivitiesData.value.find(a => a.id === link.activity_id)
      if (activity) {
        activity.allocated_amount = link.allocated_amount || 0
      }
    })

    linkedActivities.value = linksByInvestment
  } catch (error) {
    console.error('Failed to load activity investment links:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await loadAvailableActivities()
  await loadActivityInvestmentLinks()
})

// Expose methods
defineExpose({
  refreshData: () => {
    console.log('Refreshing spend data')
  }
})
</script>

<style scoped>
.investment-spend-data-grid {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.grid-header {
  background-color: rgb(var(--v-theme-surface-variant));
  flex-shrink: 0;
}

.grid-content {
  flex: 1;
  overflow: hidden;
}

.spend-data-table {
  height: 100%;
}

.spend-data-table :deep(.v-data-table__thead) {
  background-color: rgb(var(--v-theme-surface-bright));
}

.period-cell {
  position: relative;
}

.editable-cell {
  min-width: 100px;
}

.editable-cell :deep(.v-field__input) {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.readonly-cell {
  text-align: right;
  padding: 8px 12px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-variant-numeric: tabular-nums;
}

/* Стили для статусов прогноза */
.forecast-confident {
  border-left: 3px solid rgb(var(--v-theme-success));
}

.forecast-likely {
  border-left: 3px solid rgb(var(--v-theme-info));
}

.forecast-speculative {
  border-left: 3px solid rgb(var(--v-theme-warning));
}

.forecast-unlikely {
  border-left: 3px solid rgb(var(--v-theme-error));
}

.actual-period {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* Калькулятор */
.calculator-display,
.calculator-expression {
  font-family: 'Roboto Mono', monospace;
}

.calculator-btn {
  min-height: 50px;
  font-size: 1.1em;
  font-weight: 500;
}

.calculator-history {
  max-height: 150px;
  overflow-y: auto;
}

.history-item {
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.quick-functions {
  max-height: 60px;
  overflow-y: auto;
}

.cursor-pointer {
  cursor: pointer;
}

/* Индикаторы статуса */
.status-indicators {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Конвертер валют */
.exchange-rates {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 16px;
}

.conversion-options {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-radius: 8px;
  padding: 16px;
}

/* Тегирование статусов прогноза */
.forecast-status-cell {
  min-width: 140px;
}

.forecast-status-cell .v-progress-linear {
  border-radius: 1px;
}

.card-disabled {
  opacity: 0.7;
  pointer-events: none;
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

/* Связи с активностями */
.allocation-chart {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 16px;
}

.allocation-bar {
  padding: 8px;
  background-color: rgba(var(--v-theme-surface), 0.5);
  border-radius: 4px;
}

.allocation-stats {
  background-color: rgba(var(--v-theme-info), 0.05);
  border-radius: 8px;
  padding: 16px;
}
</style>