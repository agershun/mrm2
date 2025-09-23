# Система упрвавления маркетингом Kreola MRM

## ЗАДАНИЕ
- docs/base/TABLES.md - Описание таблиц (полей, методов для работы с данными) приведено
- docs/base/SCREENS.md - Описание экранов/окон/панелей, а также методов для работы с экранами и пользовательских сценариев для работы с экранами
- docs/base/CAMPAIGNS.md - Описание теблиц и экранов для модуля Campaigns
- docs/base/KREOLA.md - Описание компании Креола и ее маркетинговой компании, на основе которой можно будет делать демо-данные
- docs/base/screens/*.md - Здесь находятся описания функциональности основных экранов

## Технологический стек
Фронтэнд:
- Vue 3 (Composition API)
- Vuetify 3
- Vite
- Pinia
- Vue Router
- ECharts

## Данные
1. Работа с данными организуется через специальный модуль API, которые обеспечивает доступ к данным с помощью методов, описанных в TABLES.md. 
2. В программе должны быть демо-данные в формате JSON (mocks). Используй кейс KREOLA.md для создания демо-данных. API для работы с данными должен быть реализован так, чтобы его потом можно было легко перевести на взаимодействие с бэкэнд по REST API.

## Правила разработки
1. Не делай слишком больших файлов (не более 300 строк), дели их на логические части
2. Система должна быть на русском языке (интерфейс)
3. URL и роутинг на английском языке
4. Следуй принципам компонентной архитектуры
5. Используй TypeScript-like подходы в комментариях
6. Логичная структура, допускающая работу по улучшению системы с отдельными компонентами и файлами.
7. Не делай моков данных внутри Vue-компонент. Всегда используй stores и mock-файлы. Перед созданием новых таблиц всегда проверяй, нет ли уже таблиц с такой же функциональностью.

## Структура проекта
src/
├── components/    # Переиспользуемые компоненты
├── views/         # Страницы/экраны
├── stores/        # Pinia хранилища
├── api/           # API модуль и моки
│   ├── modules/
│   │   ├── activities.js       # API методы
│   │   ├── budgets.js
│   │   └── ...
│   ├── mocks/					# Демо-данные
│   ├── activities.mock.json
│   ├── budgets.mock.json
│   └── ...
├── router/        # Роутинг
├── types/         # TypeScript типы (в комментариях)
└── utils/         # Вспомогательные функции

## Соглашения об именовании
- Компоненты: PascalCase (CampaignCard.vue)
- Composables: use + название (useCampaigns.js)
- Stores: название + Store (campaignStore.js)
- API методы: глагол + сущность (getCampaigns, createBudget)
- Файлы моков: название camelCase + .mock.json

## Паттерны работы
- API модуль возвращает промисы, как настоящий REST API
- Компоненты только отображают данные, логика в composables
- Валидация форм через правила Vuetify

## Stores
stores/
├── activitiesStore.js      // Activities, ActivityTypes, ActivityTypeGroups, HierarchyRules
├── attributesStore.js      // Attributes, AttributeListOptions, ActivityAttributeValues, AttributeDependencies
├── budgetsStore.js         // Budgets, BudgetRequests
├── investmentsStore.js     // Investments, InvestmentValues, ManualAllocations, ActivityInvestments
├── financialsStore.js      // Actuals, ActualsSplits, PurchaseOrders, POSplits, Costs
├── performanceStore.js     // PerformanceData, KPIs, ActivityKPIValues, FunnelStages, FunnelExceptions
├── objectivesStore.js      // Objectives, ObjectiveKeyResults, InvestmentObjectives
├── usersStore.js           // Users, Roles, Teams, UserTeams, RolePermissions
├── accessStore.js          // AccessControlPolicies, AccessControlStatements, PolicyLinks
├── workflowsStore.js       // WorkflowTypes, Workflows, WorkflowVariables
├── viewsStore.js           // Views, ViewSettings
├── configStore.js          // NColumns, ForecastStatusTags, ScenarioTags
├── importsStore.js         // ImportTemplates, ScheduledImports, ImportHistory
├── campaignsStore.js       // Для таблиц Campaigns
├── mediaMixStore.js        // Для таблиц медиа-миксов
├── mediaPlanStore.js       // Для таблиц медиа-планов
├── knowledgeStore.js       // Для таблиц Knowledge Base
├── promptsStore.js         // Для таблиц Prompts
└── appStore.js             // Глобальное состояние, уведомления, loading states

## Обработка состояний
- Loading states для асинхронных операций
- Error handling с понятными сообщениями на русском
- Success notifications через Vuetify snackbar
- В экранных таблицах выделяй выбранную строку (selected row) цветом