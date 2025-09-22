# TODO List - Kreola MRM

## ✅ Модуль Strategy

### 📋 Store и API
- [x] strategyStore.js - Pinia store
- [x] objectives API module + mocks
- [x] kpis API module + mocks

### 🎯 Управление целями
- [x] Strategy View - главное представление
- [x] Objectives management - управление целями
- [x] Temporal periods support - поддержка временных периодов
- [x] Cross-period tracking - сквозное отслеживание по периодам
- [x] Period types (monthly, quarterly, annual) - типы периодов
- [x] Links with activities, budgets, investments - связи с активностями, бюджетами, инвестициями

### 📊 KPI мониторинг
- [x] KPIs management - управление KPI
- [x] Progress tracking - отслеживание прогресса
- [x] Status indicators - индикаторы статуса
- [x] Category-based organization - организация по категориям
- [x] Real-time progress calculation - расчет прогресса в реальном времени

### 📈 Стратегический обзор
- [x] Overview dashboard - дашборд обзора
- [x] Strategic progress metrics - метрики стратегического прогресса
- [x] Top objectives and KPIs visualization - визуализация топ целей и KPI
- [x] Achievement statistics - статистика достижений

### 🔗 Связи ресурсов
- [x] Objectives-Activities links - связи целей с активностями
- [x] KPIs-Budgets links - связи KPI с бюджетами
- [x] Investment allocation tracking - отслеживание распределения инвестиций
- [ ] Resource allocation analytics - аналитика распределения ресурсов

## ✅ Модуль Activities

### ✅ Завершено
- [x] ActivityHierarchy - иерархическое дерево
- [x] ActivityToolbar - панель инструментов
- [x] ActivityTimeline - временная шкала
- [x] ActivitySummary - табличное представление
- [x] ActivityRightPanel - переключатель представлений
- [x] DetailsPanel - боковая панель деталей
- [x] DetailsPanelDetails - вкладка основной информации
- [x] DetailsPanelBudget - вкладка бюджета
- [x] DetailsPanelImpact - вкладка эффективности
- [x] DetailsPanelKPIs - вкладка показателей
- [x] DetailsPanelWorkflow - вкладка процессов
- [x] CreateActivity - мастер создания (5 шагов)
- [x] ActivitiesFilterBy - диалог фильтрации
- [x] ActivitiesGroupBy - диалог группировки
- [x] activitiesStore.js - Pinia store
- [x] activities API + mocks

## ✅ Модуль Budgets

### 📋 Store и API
- [x] budgetsStore.js - Pinia store
- [x] budgets API module + mocks
- [x] budgetRequests API module + mocks
- [x] Демо-данные на 2025-2026 годы (расширены)

### 🎨 Основные компоненты
- [x] BudgetHierarchy - иерархия бюджетов (папки/планы)
- [x] Budgets View - главное представление
- [x] BudgetToolbar - панель инструментов
- [x] BudgetRollup - сводка по бюджетам
- [ ] CreateBudgetFolder - создание папки
- [ ] CreateInvestmentPlan - создание плана инвестиций

### 📊 Детальные панели
- [x] BudgetDetailsPanel - боковая панель
- [x] BudgetPanelOverview - обзор бюджета
- [x] BudgetPanelAllocations - распределения
- [x] BudgetPanelRequests - запросы на бюджет
- [x] BudgetPanelHistory - история изменений

### 💰 Управление запросами
- [x] BudgetRequestForm - форма запроса (встроена в BudgetPanelRequests)
- [x] BudgetRequestsList - список запросов (встроен в BudgetPanelRequests)
- [x] Демо-запросы на 2025-2026 годы (15 запросов)
- [ ] BudgetApprovalWorkflow - процесс утверждения

## ✅ Модуль Investments

### 📋 Store и API
- [x] investmentsStore.js - Pinia store
- [x] investments API module + mocks
- [x] investmentValues API module + mocks
- [x] manualAllocations API module + mocks
- [x] activityInvestments API module + mocks

### 🎨 Основные компоненты
- [x] InvestmentPlanning - планирование инвестиций
- [x] Investments View - главное представление
- [x] InvestmentToolbar - панель инструментов
- [x] InvestmentAllocation - распределение средств
- [x] ActivityInvestmentLink - связь с активностями

### 📈 Аналитика и отчеты
- [x] InvestmentDashboard - дашборд инвестиций
- [ ] InvestmentTrends - тренды инвестиций
- [ ] ROIAnalysis - анализ ROI
- [ ] InvestmentForecast - прогнозирование

### 🔧 Управление
- [ ] ManualAllocationForm - ручное распределение
- [ ] InvestmentRules - правила распределения
- [ ] InvestmentApproval - утверждение инвестиций

## ✅ Модуль Financials

### 📋 Store и API
- [x] financialsStore.js - Pinia store
- [x] financials API module + mocks
- [x] actuals API + mocks (фактические расходы)
- [x] purchaseOrders API + mocks (заказы на закупку)
- [x] costs API + mocks (затраты активностей)
- [x] cellComments API + mocks (комментарии ячеек)
- [x] auditTrail API + mocks (журнал аудита)

### 💰 Финансовые операции
- [x] Создание и управление фактическими расходами
- [x] Управление заказами на закупку (PO)
- [x] Привязка/отвязка расходов к статьям бюджета
- [x] Разделение (сплиты) расходов между инвестициями
- [x] Импорт/экспорт финансовых данных
- [x] Управление затратами по активностям
- [x] Комментирование финансовых ячеек
- [x] Полный журнал аудита операций

## ✅ Модуль Insights

### 📋 Store и API
- [x] insightsStore.js - Pinia store (полностью функционален)
- [x] insights API module + mocks (все методы реализованы)
- [x] performanceData API + mocks
- [x] kpis API + mocks
- [x] funnelData API + mocks
- [x] revenueData API + mocks
- [x] channelData API + mocks
- [x] geoData API + mocks
- [x] campaignsData API + mocks
- [x] performanceTimeData API + mocks
- [x] roiKPIs API + mocks

### 📈 Дашборды
- [x] MainDashboard - главный дашборд (полностью функционален)
- [x] PerformanceDashboard - производительность (полностью функционален)
- [x] ROIDashboard - анализ возврата инвестиций (полностью функционален)
- [x] FunnelDashboard - воронка конверсии (полностью функционален)

### 📊 Виджеты аналитики
- [x] KPIWidget - виджет KPI (полностью функционален)
- [x] TrendChart - график трендов (полностью функционален)
- [x] ComparisonChart - сравнительные графики (полностью функционален)
- [x] FunnelWidget - виджет воронки (полностью функционален)
- [x] GeographyWidget - географическая аналитика (полностью функционален)
- [x] HeatmapWidget - тепловая карта (полностью функционален)
- [x] CorrelationMatrix - матрица корреляций (полностью функционален)
- [x] CampaignDetailsWidget - детали кампаний (полностью функционален)

### 📋 Отчеты
- [ ] ReportBuilder - конструктор отчетов
- [ ] ScheduledReports - запланированные отчеты
- [ ] ExportManager - экспорт данных
- [ ] ReportTemplates - шаблоны отчетов

### 🔍 Аналитические инструменты
- [ ] DataExplorer - исследователь данных
- [ ] AttributionAnalysis - анализ атрибуции
- [ ] CohortAnalysis - когортный анализ
- [ ] PredictiveModels - прогнозные модели

## 🔧 Общая инфраструктура

### ✅ Завершено
- [x] Vite + Vue 3 настройка
- [x] Vuetify 3 интеграция
- [x] Pinia stores
- [x] Vue Router (все маршруты работают)
- [x] API client + mock система
- [x] ESLint конфигурация
- [x] Responsive layouts
- [x] Navigation sidebar
- [x] Top bar + user menu
- [x] .gitignore файл
- [x] .env конфигурация

## ✅ Модуль Settings

### 📋 Store и API
- [ ] settingsStore.js - Pinia store
- [ ] settings API module + mocks
- [ ] userProfiles API + mocks
- [ ] organizations API + mocks

### 🏢 Настройки организации
- [x] Organization.vue - главная страница организации
- [x] OrganizationProfile - профиль организации
- [ ] OrganizationUsers - управление пользователями
- [ ] OrganizationBilling - биллинг и подписки
- [ ] OrganizationSecurity - безопасность
- [ ] OrganizationIntegrations - интеграции организации

### 👤 Настройки профиля
- [x] Profile.vue - главная страница профиля
- [x] UserProfile - профиль пользователя
- [ ] UserPreferences - пользовательские настройки
- [ ] UserNotifications - настройки уведомлений
- [ ] UserSecurity - безопасность аккаунта
- [ ] UserActivity - история активности

### 🔧 Системные настройки
- [x] Settings.vue - главная страница настроек
- [x] SystemSettings - общие настройки системы
- [x] IntegrationSettings - настройки интеграций
- [ ] DataSettings - настройки данных
- [ ] BackupSettings - настройки резервного копирования
- [ ] SystemLogs - системные логи
- [ ] SecuritySettings - настройки безопасности

### 🎯 Приоритеты реализации
1. **Settings** (завершение модуля - stores, API, оставшиеся компоненты)
2. **Budgets** (завершение модуля - детальные панели и управление)
3. **Investments** (завершение модуля - аналитика и управление)
4. **Insights** (завершение модуля - отчеты и инструменты)
5. **Strategy** (доработка аналитики распределения ресурсов)
6. **Оптимизация и полировка**

## 📊 Общий прогресс

### ✅ Полностью завершено
- **Strategy** - 95% (модуль полностью функционален, остается только аналитика ресурсов)
- **Activities** - 100% (все компоненты + store + API)
- **Financials** - 100% (все операции + store + API)
- **Insights** - 95% (дашборды + виджеты полностью функциональны, осталось отчеты и продвинутая аналитика)

### 🔧 В разработке
- **Settings** - 60% (основные экраны созданы, нужны stores + API)
- **Budgets** - 85% (основные компоненты завершены, осталось создание папок/планов)
- **Investments** - 80% (основные компоненты завершены, осталось управление и дополнительная аналитика)

### 🔧 Последние обновления
- ✅ Исправлены все ошибки API методов в insightsStore
- ✅ Добавлены отсутствующие маршруты `/profile` и `/organization`
- ✅ Улучшена обработка ошибок в API модулях
- ✅ Стабилизирована работа графиков ECharts
- ✅ Расширены демо-данные бюджетов на 2025-2026 годы
- ✅ Добавлены 15 новых запросов на бюджет
- ✅ Создан .gitignore файл
- ✅ Настроена конфигурация проекта

### 📈 Статистика
- **Всего задач**: ~135
- **Завершено**: ~105 (78%)
- **В работе**: ~15 (11%)
- **Осталось**: ~15 (11%)

### 📊 Демо-данные (полностью готовы)
- **Strategy** - цели, KPI, стратегические периоды
- **Activities** - иерархия активностей, временные планы
- **Budgets** - 26 бюджетов на 2025-2026 годы (143 млн ₽)
- **Budget Requests** - 15 запросов с различными статусами
- **Investments** - планы инвестиций и распределения
- **Financials** - фактические расходы, заказы, затраты
- **Insights** - KPI, производительность, аналитика
- **Users & Settings** - пользователи, роли, настройки

### 🎯 Ближайшие приоритеты
1. **Settings** - завершение stores и API (недостающие компоненты)
2. **Budgets** - создание папок и планов инвестиций
3. **Investments** - дополнительная аналитика и управление
4. **Insights** - отчеты и продвинутые инструменты аналитики
5. **UI/UX** - выделение выбранных строк в таблицах
6. **Общая полировка и оптимизация**