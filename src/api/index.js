/**
 * Главный модуль API для Kreola MRM
 * Объединяет все API модули и предоставляет единую точку доступа
 */

// Импортируем все API модули
import * as activitiesApi from './modules/activities.js'
import * as activityTypesApi from './modules/activityTypes.js'
import * as attributesApi from './modules/attributes.js'
import * as budgetsApi from './modules/budgets.js'
import * as investmentsApi from './modules/investments.js'
import * as financialsApi from './modules/financials.js'
import * as performanceApi from './modules/performance.js'
import * as objectivesApi from './modules/objectives.js'
import * as usersApi from './modules/users.js'
import * as accessApi from './modules/access.js'
import * as workflowsApi from './modules/workflows.js'
import * as viewsApi from './modules/views.js'
import * as configApi from './modules/config.js'
import * as importsApi from './modules/imports.js'
import * as insightsApi from './modules/insights.js'

/**
 * Объединенный API объект со всеми методами
 */
const api = {
  // Activities
  activities: {
    getActivities: activitiesApi.getActivities,
    getActivity: activitiesApi.getActivity,
    createActivity: activitiesApi.createActivity,
    updateActivity: activitiesApi.updateActivity,
    updateActivityDates: activitiesApi.updateActivityDates,
    updateActivityAttributes: activitiesApi.updateActivityAttributes,
    deleteActivity: activitiesApi.deleteActivity,
    duplicateActivity: activitiesApi.duplicateActivity,
    moveActivity: activitiesApi.moveActivity,
    syncActivityData: activitiesApi.syncActivityData,
    searchActivities: activitiesApi.searchActivities,
    fetchActivities: activitiesApi.fetchActivities // псевдоним
  },

  // Activity Types & Groups
  activityTypes: {
    getActivityTypes: activityTypesApi.getActivityTypes,
    createActivityType: activityTypesApi.createActivityType,
    updateActivityType: activityTypesApi.updateActivityType,
    disableActivityType: activityTypesApi.disableActivityType,
    deleteActivityType: activityTypesApi.deleteActivityType,

    getActivityTypeGroups: activityTypesApi.getActivityTypeGroups,
    createActivityTypeGroup: activityTypesApi.createActivityTypeGroup,
    updateActivityTypeGroup: activityTypesApi.updateActivityTypeGroup,
    disableActivityTypeGroup: activityTypesApi.disableActivityTypeGroup,
    deleteActivityTypeGroup: activityTypesApi.deleteActivityTypeGroup
  },

  // Attributes
  attributes: {
    getAttributes: attributesApi.getAttributes,
    createAttribute: attributesApi.createAttribute,
    updateAttribute: attributesApi.updateAttribute,
    deleteAttribute: attributesApi.deleteAttribute,

    getAttributeGroups: attributesApi.getAttributeGroups,
    createAttributeGroup: attributesApi.createAttributeGroup,
    updateAttributeGroup: attributesApi.updateAttributeGroup,
    reorderAttributeGroups: attributesApi.reorderAttributeGroups,

    getAttributeOptions: attributesApi.getAttributeOptions,
    addAttributeOptions: attributesApi.addAttributeOptions,
    updateAttributeOptions: attributesApi.updateAttributeOptions,
    deleteAttributeOption: attributesApi.deleteAttributeOption,
    importAttributeOptions: attributesApi.importAttributeOptions,
    exportAttributeOptions: attributesApi.exportAttributeOptions,
    reorderAttributeOptions: attributesApi.reorderAttributeOptions,

    getActivityAttributes: attributesApi.getActivityAttributes,
    updateActivityAttributes: attributesApi.updateActivityAttributes,

    getAttributeDependencies: attributesApi.getAttributeDependencies,
    createAttributeDependency: attributesApi.createAttributeDependency,
    updateAttributeDependency: attributesApi.updateAttributeDependency,
    deleteAttributeDependency: attributesApi.deleteAttributeDependency
  },

  // Budgets
  budgets: {
    getBudgetHierarchy: budgetsApi.getBudgetHierarchy,
    createBudgetFolder: budgetsApi.createBudgetFolder,
    createInvestmentPlan: budgetsApi.createInvestmentPlan,
    updateBudgetHierarchyItem: budgetsApi.updateBudgetHierarchyItem,
    getBudgetRollup: budgetsApi.getBudgetRollup,
    deleteBudgetHierarchyItem: budgetsApi.deleteBudgetHierarchyItem,
    getBudgetRequests: budgetsApi.getBudgetRequests,
    createBudgetRequest: budgetsApi.createBudgetRequest,
    approveBudgetRequest: budgetsApi.approveBudgetRequest,
    rejectBudgetRequest: budgetsApi.rejectBudgetRequest,
    searchBudgets: budgetsApi.searchBudgets,
    fetchRollupData: budgetsApi.fetchRollupData // псевдоним
  },

  // Investments
  investments: investmentsApi,

  // Financials (Actuals, POs, Costs)
  financials: financialsApi,

  // Performance & KPIs
  performance: performanceApi,

  // Objectives
  objectives: objectivesApi,

  // Users & Roles
  users: usersApi,

  // Access Control
  access: accessApi,

  // Workflows
  workflows: workflowsApi,

  // Views
  views: viewsApi,

  // Configuration
  config: configApi,

  // Imports
  imports: importsApi,

  // Insights
  insights: insightsApi
}

export default api

// Также экспортируем отдельные модули для прямого использования
export {
  activitiesApi,
  activityTypesApi,
  attributesApi,
  budgetsApi,
  investmentsApi,
  financialsApi,
  performanceApi,
  objectivesApi,
  usersApi,
  accessApi,
  workflowsApi,
  viewsApi,
  configApi,
  importsApi,
  insightsApi
}