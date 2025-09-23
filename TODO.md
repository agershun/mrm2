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

## ✅ Модуль Organizations (Многоорганизационная система)

### 📋 Store и API
- [x] organizationsStore.js - Pinia store
- [x] organizations API module + mocks
- [x] organizationDocuments API + mocks
- [x] organizationStats API + mocks

### 🏢 Управление организациями
- [x] Organization.vue - главная страница организаций
- [x] OrganizationsList - список организаций
- [x] OrganizationCard - карточка организации
- [x] OrganizationCreateDialog - создание организации
- [x] OrganizationEditDialog - редактирование организации
- [x] OrganizationSelector - селектор организации в TopBar

### 📄 Профили организаций
- [x] OrganizationProfile - базовый профиль
- [x] OrganizationStrategy - стратегия и ограничения
- [x] OrganizationDocuments - управление документами
- [x] DocumentCard - карточка документа
- [ ] OrganizationUsers - управление пользователями
- [ ] OrganizationIntegrations - интеграции организации

### 🔧 Интеграция системы
- [x] Навигация - добавлен пункт "Организации" выше "Стратегии"
- [x] Роутинг - `/organizations` и `/organizations/:id`
- [x] Контекст организации в appStore
- [x] Селектор в TopBar с быстрым переключением
- [x] Сохранение выбора в localStorage

### 📊 Демо-данные
- [x] 5 организаций: Креола, ТехноСтарт, ГринЭко, СпортМакс, КафеБистро
- [x] Полные профили с адресами, контактами, соцсетями
- [x] Стратегические описания и ограничения
- [x] Документы по категориям (брендбук, стратегия, ограничения)

## ✅ Модуль Settings

### 📋 Store и API
- [ ] settingsStore.js - Pinia store
- [ ] settings API module + mocks
- [ ] userProfiles API + mocks

### 🏢 Настройки организации (устаревший модуль - заменен на Organizations)
- [x] ~~Organization.vue~~ - перенесено в Organizations
- [x] ~~OrganizationProfile~~ - перенесено в Organizations

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
1. **Organizations** (расширение функциональности - пользователи, интеграции)
2. **Settings** (завершение модуля - stores, API, оставшиеся компоненты)
3. **Budgets** (завершение модуля - детальные панели и управление)
4. **Investments** (завершение модуля - аналитика и управление)
5. **Insights** (завершение модуля - отчеты и инструменты)
6. **Strategy** (доработка аналитики распределения ресурсов)
7. **Многоорганизационная фильтрация** (фильтрация всех данных по выбранной организации)
8. **Оптимизация и полировка**

## 📊 Общий прогресс

### ✅ Полностью завершено
- **Organizations** - 95% (многоорганизационная система полностью функциональна, осталось управление пользователями и интеграции)
- **Strategy** - 95% (модуль полностью функционален, остается только аналитика ресурсов)
- **Activities** - 100% (все компоненты + store + API)
- **Financials** - 100% (все операции + store + API)
- **Insights** - 95% (дашборды + виджеты полностью функциональны, осталось отчеты и продвинутая аналитика)

### 🔧 В разработке
- **Settings** - 60% (основные экраны созданы, нужны stores + API)
- **Budgets** - 85% (основные компоненты завершены, осталось создание папок/планов)
- **Investments** - 80% (основные компоненты завершены, осталось управление и дополнительная аналитика)

### 🔧 Последние обновления
- ✅ **MAJOR: Создана многоорганизационная система для рекламных агентств**
- ✅ Добавлен полный модуль Organizations с API, store и компонентами
- ✅ Создан OrganizationSelector в TopBar с быстрым переключением
- ✅ Интегрирован контекст организации в appStore с localStorage
- ✅ Добавлены 5 демо-организаций с полными профилями
- ✅ Реализовано управление документами по категориям
- ✅ Добавлена стратегия и маркетинговые ограничения для организаций
- ✅ Обновлена навигация - "Организации" выше "Стратегии"
- ✅ Настроен роутинг `/organizations` и `/organizations/:id`
- ✅ Исправлены все ошибки импортов и зависимостей

### 📈 Статистика
- **Всего задач**: ~150
- **Завершено**: ~120 (80%)
- **В работе**: ~15 (10%)
- **Осталось**: ~15 (10%)

### 📊 Демо-данные (полностью готовы)
- **Organizations** - 5 организаций с полными профилями, стратегиями, документами
- **Strategy** - цели, KPI, стратегические периоды
- **Activities** - иерархия активностей, временные планы
- **Budgets** - 26 бюджетов на 2025-2026 годы (143 млн ₽)
- **Budget Requests** - 15 запросов с различными статусами
- **Investments** - планы инвестиций и распределения
- **Financials** - фактические расходы, заказы, затраты
- **Insights** - KPI, производительность, аналитика
- **Users & Settings** - пользователи, роли, настройки

### 🎯 Ближайшие приоритеты
1. **Organizations** - управление пользователями организаций и интеграции
2. **Многоорганизационная фильтрация** - фильтрация всех данных по выбранной организации
3. **Settings** - завершение stores и API (недостающие компоненты)
4. **Budgets** - создание папок и планов инвестиций
5. **Investments** - дополнительная аналитика и управление
6. **Insights** - отчеты и продвинутые инструменты аналитики
7. **UI/UX** - выделение выбранных строк в таблицах
8. **Общая полировка и оптимизация**

---

## 🚀 НОВЫЙ МОДУЛЬ: Organizations (Многоорганизационная система)

Система успешно трансформирована для работы рекламных агентств с несколькими клиентами:

### ✅ Что реализовано:
- **Полное управление организациями** - создание, редактирование, удаление, поиск
- **Селектор организации в TopBar** - быстрое переключение между клиентами
- **Контекст организации** - сохранение выбора, интеграция с appStore
- **Расширенные профили** - стратегия, ограничения, документы по категориям
- **5 демо-организаций** - Креола, ТехноСтарт, ГринЭко, СпортМакс, КафеБистро
- **Полная техническая архитектура** - API, stores, компоненты, роутинг

### 🎯 Следующие шаги:
- Фильтрация всех модулей (кампании, стратегия и т.д.) по выбранной организации
- Управление пользователями организаций
- Настройки доступа и интеграций