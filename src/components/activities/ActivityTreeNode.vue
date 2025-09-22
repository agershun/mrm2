<template>
  <div class="activity-tree-node">
    <div
      class="node-content"
      :class="{
        'selected': isSelected,
        'has-children': hasChildren,
        'highlighted': isHighlighted
      }"
      :style="{ paddingLeft: `${(level * 24) + 16}px` }"
      @click="handleSelect"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <!-- Кнопка раскрытия/сворачивания -->
      <v-btn
        v-if="hasChildren"
        icon
        size="x-small"
        variant="text"
        class="expand-btn"
        @click.stop="handleToggle"
      >
        <v-icon size="16">
          {{ isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
        </v-icon>
      </v-btn>
      <div v-else class="expand-spacer"></div>

      <!-- Иконка типа активности -->
      <v-icon
        :icon="activityTypeIcon"
        :color="activityTypeColor"
        size="16"
        class="me-2"
      />

      <!-- Название активности -->
      <div class="node-title flex-grow-1">
        <span class="text-body-2">{{ node.name }}</span>
        <div class="node-meta text-caption text-grey-darken-1">
          {{ formatDateRange(node.in_market_start_date, node.in_market_end_date) }}
          <v-chip
            v-if="node.status"
            :color="getStatusColor(node.status)"
            size="x-small"
            variant="outlined"
            class="ml-2"
          >
            {{ getStatusText(node.status) }}
          </v-chip>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="node-actions" v-show="isHovered || isSelected">
        <v-btn
          icon
          size="x-small"
          variant="text"
          color="primary"
          @click.stop="handleAddChild"
          title="Добавить дочернюю активность"
          class="add-child-btn"
        >
          <v-icon size="14">mdi-plus</v-icon>
        </v-btn>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="x-small"
              variant="text"
              @click.stop
              title="Действия"
            >
              <v-icon size="14">mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list density="compact" min-width="160">
            <v-list-item @click="handleEdit">
              <template v-slot:prepend>
                <v-icon size="16">mdi-pencil</v-icon>
              </template>
              <v-list-item-title>Редактировать</v-list-item-title>
            </v-list-item>

            <v-list-item @click="handleDuplicate">
              <template v-slot:prepend>
                <v-icon size="16">mdi-content-copy</v-icon>
              </template>
              <v-list-item-title>Дублировать</v-list-item-title>
            </v-list-item>

            <v-divider />

            <v-list-item @click="handleDelete" class="text-error">
              <template v-slot:prepend>
                <v-icon size="16" color="error">mdi-delete</v-icon>
              </template>
              <v-list-item-title>Удалить</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Дочерние узлы -->
    <template v-if="isExpanded && hasChildren">
      <activity-tree-node
        v-for="child in node.children"
        :key="child.activity_id"
        :node="child"
        :level="level + 1"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @duplicate="$emit('duplicate', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'select',
  'toggle',
  'add-child',
  'edit',
  'delete',
  'duplicate'
])

const activitiesStore = useActivitiesStore()
const isHovered = ref(false)

// Computed
const isSelected = computed(() => {
  return activitiesStore.selectedActivity === props.node.activity_id
})

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const isExpanded = computed(() => {
  return activitiesStore.hierarchyExpanded[props.node.activity_id] || false
})

const isHighlighted = computed(() => {
  return activitiesStore.isActivityHighlighted(props.node.activity_id)
})

const activityTypeIcon = computed(() => {
  // Иконки по типам активности
  const typeIcons = {
    '1': 'mdi-file-document-outline', // План
    '2': 'mdi-calendar-check',        // Годовой план
    '3': 'mdi-bullhorn',              // Кампания
    '4': 'mdi-folder-multiple',       // Программа
    '5': 'mdi-video',                 // Вебинар
    '6': 'mdi-email',                 // Email рассылка
    '7': 'mdi-presentation',          // Конференция
    '8': 'mdi-google-ads',            // Контекстная реклама
    '9': 'mdi-search-web',            // SEO
    '10': 'mdi-share-variant'         // Социальные сети
  }
  return typeIcons[props.node.activity_type_id] || 'mdi-circle'
})

const activityTypeColor = computed(() => {
  // Цвета по типам активности
  const typeColors = {
    '1': 'blue-darken-2',    // План
    '2': 'blue',             // Годовой план
    '3': 'purple',           // Кампания
    '4': 'indigo',           // Программа
    '5': 'green',            // Вебинар
    '6': 'orange',           // Email рассылка
    '7': 'red',              // Конференция
    '8': 'teal',             // Контекстная реклама
    '9': 'brown',            // SEO
    '10': 'pink'             // Социальные сети
  }
  return typeColors[props.node.activity_type_id] || 'grey'
})

// Methods
const handleSelect = () => {
  emit('select', props.node.activity_id)
}

const handleToggle = () => {
  emit('toggle', props.node.activity_id)
}

const handleAddChild = () => {
  emit('add-child', props.node.activity_id)
}

const handleEdit = () => {
  emit('edit', props.node.activity_id)
}

const handleDelete = () => {
  emit('delete', props.node.activity_id)
}

const handleDuplicate = () => {
  emit('duplicate', props.node.activity_id)
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return ''

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const start = formatDate(startDate)
  const end = formatDate(endDate)

  if (start && end) {
    if (start === end) {
      return start
    }
    return `${start} - ${end}`
  }

  return start || end
}

const getStatusColor = (status) => {
  const statusColors = {
    'Planning': 'blue',
    'Active': 'green',
    'Completed': 'grey',
    'Cancelled': 'red',
    'On Hold': 'orange'
  }
  return statusColors[status] || 'grey'
}

const getStatusText = (status) => {
  const statusTexts = {
    'Planning': 'Планирование',
    'Active': 'Активна',
    'Completed': 'Завершена',
    'Cancelled': 'Отменена',
    'On Hold': 'Приостановлена'
  }
  return statusTexts[status] || status
}
</script>

<style scoped>
.activity-tree-node {
  position: relative;
}

.node-content {
  display: flex;
  align-items: flex-start;
  padding: 8px 16px 8px 0;
  min-height: 44px;
  cursor: pointer;
  border-radius: 8px;
  margin: 0 8px;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.node-content:hover {
  background-color: rgba(0, 0, 0, 0.04);
  border-left-color: var(--v-theme-primary);
}

.node-content.selected {
  background-color: rgba(25, 118, 210, 0.08);
  border-left-color: var(--v-theme-primary);
}

.node-content.highlighted {
  background-color: rgba(255, 235, 59, 0.15);
  border-left-color: #ffeb3b;
  animation: search-highlight 2s ease-in-out;
}

.node-content.highlighted.selected {
  background-color: rgba(25, 118, 210, 0.12);
  border-left-color: var(--v-theme-primary);
}

@keyframes search-highlight {
  0% {
    background-color: rgba(255, 235, 59, 0.3);
  }
  100% {
    background-color: rgba(255, 235, 59, 0.15);
  }
}

.expand-btn {
  margin-right: 4px;
  margin-top: 2px;
}

.expand-spacer {
  width: 28px;
  height: 28px;
  margin-right: 4px;
}

.node-title {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}

.node-title span {
  display: block;
  font-weight: 500;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-meta {
  margin-top: 2px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.node-actions {
  display: flex;
  align-items: flex-start;
  gap: 2px;
  margin-left: 8px;
  padding-top: 2px;
}

.add-child-btn:hover {
  background-color: rgba(25, 118, 210, 0.08);
  transform: scale(1.1);
  transition: all 0.2s ease;
}

/* Отступ для детей */
.activity-tree-node .activity-tree-node {
  position: relative;
}

.activity-tree-node .activity-tree-node::before {
  content: '';
  position: absolute;
  left: calc(var(--level) * 24px + 24px);
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(0, 0, 0, 0.12);
}
</style>