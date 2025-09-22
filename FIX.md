# Список исправлений для MRM-системы Kreola

### 1. Отсутствующие экраны и компоненты
Из SCREENS.md не реализованы следующие экраны:

#### Основные экраны
- `ViewOptions` - Настройки представления
- `SelectInvestmentItem` - Выбор статьи инвестиций
- `EditColumns` - Редактирование столбцов
- `ChangeTimeGranularityAndDateRange` - Изменение временной детализации
- `DeleteActivity` - Удаление активности
- `DeleteView` - Удаление представления
- `DeleteAttribute` - Удаление атрибута
- `DeleteTypeGroup` - Удаление группы типов
- `DeleteType` - Удаление типа
- `DeleteRule` - Удаление правила

#### Экраны конфигурации активностей
- `AttributeDefinitions` - Определения атрибутов
- `AttributeGroups` - Группы атрибутов
- `AttributeDependencies` - Зависимости атрибутов
- `ActivityTypeGroups` - Группы типов активностей
- `ActivityTypes` - Типы активностей
- `ActivityRules` - Правила активностей
- `ActivityKPIs` - KPI активностей
- `ActivityImpactModeler` - Моделирование влияния
- `ActivityPolicies` - Политики доступа

#### Экраны бюджета
- `BudgetRollupPanel` - Панель сводных данных бюджета
- `InviteUsersDialog` - Приглашение пользователей
- `Investments` - Сетка инвестиций
- `InvestmentDetails` - Детали инвестиции
- `InvestmentDetailsDetails` - Детали инвестиции (вкладка)
- `InvestmentDetailsActivities` - Активности инвестиции
- `InvestmentDetailsPOs` - Заказы на закупку инвестиции
- `InvestmentDetailsActuals` - Фактические расходы инвестиции
- `ActivityFundingPanel` - Панель финансирования активности
- `MapPOActuals` - Сопоставление PO/фактических расходов
- `ManageSplitForPOActuals` - Управление разделением
- `POActualsDetails` - Детали PO/фактических расходов
- `TransferRequests` - Запросы на перераспределение
- `RequestATransferAdjustment` - Запрос на перевод/корректировку

#### Экраны стратегии
- `Strategy` - Стратегия
- `ObjectiveDetails` - Детали цели

#### Экраны организации
- `OrganizationSettings` - Настройки организации
- `UserManagement` - Управление пользователями
- `RoleManagement` - Управление ролями

#### Экраны импорта
- `ImportDialog` - Диалог импорта
- `ImportHistoryPanel` - Панель истории импорта

#### Экраны конфигурации расходов
- `SpendNColumnsSettings` - Настройки колонок расходов
- `SpendViewsSettings` - Настройки представлений расходов
- `SpendTagsScenariosSettings` - Настройки тегов и сценариев

#### Диалоговые окна
- `DisableTypeGroupDialog` - Отключение группы типов
- `DisableTypeDialog` - Отключение типа
- `DisableRuleDialog` - Отключение правила

#### Компоненты активностей
- `CreateActivityType` - Создание типа активности
- `CreateActivityDetails` - Детали создания активности
- `CreateActivityBudget` - Бюджет создания активности
- `CreateActivityImpact` - Влияние создания активности
- `CreateActivityWorkflow` - Рабочий процесс создания активности

#### Компоненты бюджета
- `BudgetHierarchy` - Иерархия бюджета (уже есть, но проверить)
- `InvestmentDetails` - Детали инвестиции
- `ActivityFundingPanel` - Панель финансирования активности
