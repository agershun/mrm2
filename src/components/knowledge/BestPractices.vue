<template>
  <div class="best-practices">
    <v-card>
      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Поиск практик"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterCategory"
              :items="categories"
              label="Категория"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterChannel"
              :items="channels"
              label="Канал"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn color="primary" @click="showAddDialog = true">
              <v-icon>mdi-plus</v-icon>
              Добавить
            </v-btn>
          </v-col>
        </v-row>

        <!-- Список лучших практик -->
        <v-row>
          <v-col
            v-for="practice in filteredPractices"
            :key="practice.practice_id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card variant="outlined" class="h-100">
              <v-card-text>
                <div class="d-flex align-start mb-3">
                  <v-avatar
                    :color="getCategoryColor(practice.category)"
                    class="me-3"
                  >
                    <v-icon>{{ getCategoryIcon(practice.category) }}</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <h4 class="text-subtitle-1 mb-1">{{ practice.title }}</h4>
                    <div class="d-flex align-center mb-2">
                      <v-chip
                        size="x-small"
                        :color="getCategoryColor(practice.category)"
                        class="me-2"
                      >
                        {{ getCategoryLabel(practice.category) }}
                      </v-chip>
                      <v-chip
                        v-if="practice.channel"
                        size="x-small"
                        :color="getChannelColor(practice.channel)"
                      >
                        {{ practice.channel }}
                      </v-chip>
                    </div>
                  </div>
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon="mdi-dots-vertical"
                        size="small"
                        variant="text"
                        v-bind="props"
                      />
                    </template>
                    <v-list>
                      <v-list-item @click="editPractice(practice)">
                        <v-list-item-title>Редактировать</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="deletePractice(practice)" class="text-error">
                        <v-list-item-title>Удалить</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>

                <p class="text-body-2 text-grey mb-3">{{ practice.description }}</p>

                <v-divider class="mb-3" />

                <div class="practice-content">
                  <div class="mb-3">
                    <h5 class="text-subtitle-2 mb-2">Рекомендации:</h5>
                    <ul class="text-body-2">
                      <li v-for="rec in practice.recommendations.slice(0, 3)" :key="rec">
                        {{ rec }}
                      </li>
                      <li v-if="practice.recommendations.length > 3" class="text-grey">
                        +{{ practice.recommendations.length - 3 }} еще...
                      </li>
                    </ul>
                  </div>

                  <div v-if="practice.metrics && practice.metrics.length > 0" class="mb-3">
                    <h5 class="text-subtitle-2 mb-2">Ключевые метрики:</h5>
                    <div class="d-flex flex-wrap gap-1">
                      <v-chip
                        v-for="metric in practice.metrics"
                        :key="metric"
                        size="x-small"
                        variant="tonal"
                      >
                        {{ metric }}
                      </v-chip>
                    </div>
                  </div>

                  <div v-if="practice.expected_results" class="mb-3">
                    <h5 class="text-subtitle-2 mb-2">Ожидаемые результаты:</h5>
                    <p class="text-body-2">{{ practice.expected_results }}</p>
                  </div>

                  <div class="d-flex justify-space-between align-center">
                    <div class="text-caption text-grey">
                      Обновлено: {{ formatDate(practice.updated_at) }}
                    </div>
                    <v-rating
                      :model-value="practice.effectiveness_score"
                      density="compact"
                      size="small"
                      readonly
                      half-increments
                    />
                  </div>
                </div>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  size="small"
                  variant="text"
                  @click="viewFullPractice(practice)"
                >
                  Подробнее
                </v-btn>
                <v-spacer />
                <v-btn
                  icon="mdi-bookmark-outline"
                  size="small"
                  variant="text"
                  @click="bookmarkPractice(practice)"
                />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <div v-if="filteredPractices.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2">mdi-lightbulb-outline</v-icon>
          <h3 class="text-h6 mt-2">Лучшие практики не найдены</h3>
          <p class="text-grey">Добавьте проверенные методы и рекомендации</p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Диалог добавления/редактирования практики -->
    <BestPracticeEditDialog
      v-model="showAddDialog"
      :practice="selectedPractice"
      @saved="handlePracticeSaved"
    />

    <!-- Диалог полного просмотра практики -->
    <BestPracticeViewDialog
      v-model="showViewDialog"
      :practice="selectedPractice"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore'
import BestPracticeEditDialog from './BestPracticeEditDialog.vue'
import BestPracticeViewDialog from './BestPracticeViewDialog.vue'

const knowledgeStore = useKnowledgeBaseStore()

const searchQuery = ref('')
const filterCategory = ref(null)
const filterChannel = ref(null)
const showAddDialog = ref(false)
const showViewDialog = ref(false)
const selectedPractice = ref(null)

const categories = [
  { title: 'Таргетинг', value: 'targeting' },
  { title: 'Креативы', value: 'creative' },
  { title: 'Бюджетирование', value: 'budgeting' },
  { title: 'Оптимизация', value: 'optimization' },
  { title: 'A/B тестирование', value: 'ab_testing' },
  { title: 'Аналитика', value: 'analytics' }
]

const channels = computed(() =>
  [...new Set(knowledgeStore.bestPractices.map(p => p.channel).filter(c => c))]
)

const filteredPractices = computed(() => {
  let practices = knowledgeStore.bestPractices

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    practices = practices.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.recommendations.some(rec => rec.toLowerCase().includes(query))
    )
  }

  if (filterCategory.value) {
    practices = practices.filter(p => p.category === filterCategory.value)
  }

  if (filterChannel.value) {
    practices = practices.filter(p => p.channel === filterChannel.value)
  }

  return practices.sort((a, b) => b.effectiveness_score - a.effectiveness_score)
})

const getCategoryColor = (category) => {
  const colors = {
    targeting: 'primary',
    creative: 'purple',
    budgeting: 'success',
    optimization: 'warning',
    ab_testing: 'info',
    analytics: 'orange'
  }
  return colors[category] || 'grey'
}

const getCategoryIcon = (category) => {
  const icons = {
    targeting: 'mdi-target',
    creative: 'mdi-palette',
    budgeting: 'mdi-currency-usd',
    optimization: 'mdi-tune',
    ab_testing: 'mdi-ab-testing',
    analytics: 'mdi-chart-line'
  }
  return icons[category] || 'mdi-lightbulb'
}

const getCategoryLabel = (category) => {
  const labels = {
    targeting: 'Таргетинг',
    creative: 'Креативы',
    budgeting: 'Бюджетирование',
    optimization: 'Оптимизация',
    ab_testing: 'A/B тестирование',
    analytics: 'Аналитика'
  }
  return labels[category] || category
}

const getChannelColor = (channel) => {
  const colors = {
    'Google Ads': 'primary',
    'Yandex Direct': 'warning',
    'Facebook': 'blue',
    'Instagram': 'purple',
    'YouTube': 'red',
    'VKontakte': 'blue-grey',
    'Telegram': 'cyan',
    'Email': 'orange'
  }
  return colors[channel] || 'grey'
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}

const editPractice = (practice) => {
  selectedPractice.value = practice
  showAddDialog.value = true
}

const deletePractice = async (practice) => {
  if (confirm(`Удалить практику "${practice.title}"?`)) {
    await knowledgeStore.deleteBestPractice(practice.practice_id)
  }
}

const viewFullPractice = (practice) => {
  selectedPractice.value = practice
  showViewDialog.value = true
}

const bookmarkPractice = async (practice) => {
  // Добавление в закладки
  console.log('Bookmark practice:', practice.title)
}

const handlePracticeSaved = () => {
  showAddDialog.value = false
  selectedPractice.value = null
}

onMounted(async () => {
  await knowledgeStore.fetchBestPractices()
})
</script>

<style scoped>
.practice-content {
  font-size: 0.875rem;
}

.gap-1 {
  gap: 4px;
}

ul {
  padding-left: 16px;
  margin: 0;
}

li {
  margin-bottom: 4px;
}
</style>