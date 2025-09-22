import { createRouter, createWebHistory } from 'vue-router'

// Lazy load views для оптимизации
const Main = () => import('@/views/Main.vue')
const Campaigns = () => import('@/views/Campaigns.vue')
const CampaignWorkspace = () => import('@/views/CampaignWorkspace.vue')
const KnowledgeBase = () => import('@/views/KnowledgeBase.vue')
const Strategy = () => import('@/views/Strategy.vue')
const Activities = () => import('@/views/Activities.vue')
const Budgets = () => import('@/views/Budgets.vue')
const Investments = () => import('@/views/Investments.vue')
const Insights = () => import('@/views/Insights.vue')
const Configuration = () => import('@/views/Configuration.vue')
const Settings = () => import('@/views/Settings.vue')
const Profile = () => import('@/views/Profile.vue')
const Organization = () => import('@/views/Organization.vue')

const routes = [
  {
    path: '/',
    name: 'Main',
    component: Main,
    redirect: '/campaigns',
    children: [
      {
        path: '/campaigns',
        name: 'Campaigns',
        component: Campaigns,
        meta: {
          title: 'Кампании',
          icon: 'mdi-robot'
        }
      },
      {
        path: '/campaigns/:id',
        name: 'CampaignWorkspace',
        component: CampaignWorkspace,
        meta: {
          title: 'Рабочее пространство кампании',
          icon: 'mdi-robot'
        }
      },
      {
        path: '/knowledge-base',
        name: 'KnowledgeBase',
        component: KnowledgeBase,
        meta: {
          title: 'База знаний ИИ',
          icon: 'mdi-brain'
        }
      },
      {
        path: '/strategy',
        name: 'Strategy',
        component: Strategy,
        meta: {
          title: 'Стратегия',
          icon: 'mdi-target'
        }
      },
      {
        path: '/activities',
        name: 'Activities',
        component: Activities,
        meta: {
          title: 'Активности',
          icon: 'mdi-calendar-multiple'
        }
      },
      {
        path: '/budgets',
        name: 'Budgets',
        component: Budgets,
        meta: {
          title: 'Бюджеты',
          icon: 'mdi-currency-usd'
        }
      },
      {
        path: '/investments',
        name: 'Investments',
        component: Investments,
        meta: {
          title: 'Инвестиции',
          icon: 'mdi-chart-line'
        }
      },
      {
        path: '/insights',
        name: 'Insights',
        component: Insights,
        meta: {
          title: 'Аналитика',
          icon: 'mdi-chart-bar'
        }
      },
      {
        path: '/configuration',
        name: 'Configuration',
        component: Configuration,
        meta: {
          title: 'Конфигурация',
          icon: 'mdi-tune'
        }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: Settings,
        meta: {
          title: 'Настройки системы',
          icon: 'mdi-cog'
        }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: {
          title: 'Профиль пользователя',
          icon: 'mdi-account'
        }
      },
      {
        path: '/organization',
        name: 'Organization',
        component: Organization,
        meta: {
          title: 'Организация',
          icon: 'mdi-domain'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Глобальная защита маршрутов
router.beforeEach((to, from, next) => {
  // Устанавливаем заголовок страницы
  if (to.meta.title) {
    document.title = `${to.meta.title} - Kreola MRM`
  }
  next()
})

export default router