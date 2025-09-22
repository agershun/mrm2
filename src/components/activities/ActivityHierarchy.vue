<template>
  <div class="activity-hierarchy">
    <div class="hierarchy-header">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-subtitle-2 font-weight-medium">
          Иерархия активностей
        </span>
        <div class="d-flex">
          <v-btn
            icon
            size="small"
            variant="text"
            @click="expandAll"
            title="Развернуть все"
          >
            <v-icon size="16">mdi-unfold-more-horizontal</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            @click="collapseAll"
            title="Свернуть все"
          >
            <v-icon size="16">mdi-unfold-less-horizontal</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <div class="hierarchy-tree">
      <v-progress-linear
        v-if="activitiesStore.isLoading"
        indeterminate
        color="primary"
        height="2"
        class="mb-3"
      />

      <div
        v-if="!activitiesStore.isLoading && activitiesTree.length === 0"
        class="empty-state text-center pa-6"
      >
        <v-icon size="48" color="grey-lighten-1" class="mb-2">
          mdi-file-tree-outline
        </v-icon>
        <div class="text-body-2 text-grey-darken-1">
          Нет активностей для отображения
        </div>
        <v-btn
          color="primary"
          variant="text"
          class="mt-2"
          @click="createActivity"
        >
          Создать первую активность
        </v-btn>
      </div>

      <activity-tree-node
        v-for="node in activitiesTree"
        :key="node.activity_id"
        :node="node"
        :level="0"
        @select="selectActivity"
        @toggle="toggleNode"
        @add-child="addChildActivity"
        @edit="editActivity"
        @delete="deleteActivity"
        @duplicate="duplicateActivity"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'
import ActivityTreeNode from './ActivityTreeNode.vue'

const activitiesStore = useActivitiesStore()

// Computed
const activitiesTree = computed(() => activitiesStore.activitiesTree)

// Methods
const selectActivity = (activityId) => {
  activitiesStore.selectActivity(activityId)
}

const toggleNode = (activityId) => {
  activitiesStore.toggleHierarchyNode(activityId)
}

const expandAll = () => {
  activitiesStore.expandAllNodes()
}

const collapseAll = () => {
  activitiesStore.collapseAllNodes()
}

const createActivity = () => {
  // TODO: Открыть мастер создания активности
  console.log('Create new activity')
}

const addChildActivity = (parentId) => {
  // TODO: Открыть мастер создания дочерней активности
  console.log('Add child activity to:', parentId)
}

const editActivity = (activityId) => {
  selectActivity(activityId)
  // TODO: Открыть панель редактирования
  console.log('Edit activity:', activityId)
}

const deleteActivity = async (activityId) => {
  if (confirm('Вы уверены, что хотите удалить эту активность?')) {
    try {
      await activitiesStore.deleteActivity(activityId)
    } catch (error) {
      console.error('Error deleting activity:', error)
    }
  }
}

const duplicateActivity = async (activityId) => {
  try {
    await activitiesStore.duplicateActivity(activityId)
  } catch (error) {
    console.error('Error duplicating activity:', error)
  }
}

// Lifecycle
onMounted(() => {
  // Инициализируем загрузку активностей если они еще не загружены
  if (activitiesStore.activities.length === 0) {
    activitiesStore.fetchActivities()
  }
})
</script>

<style scoped>
.activity-hierarchy {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.hierarchy-header {
  flex-shrink: 0;
  padding: 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.hierarchy-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.empty-state {
  color: #666;
}
</style>