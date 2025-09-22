<template>
  <div class="test-api pa-4">
    <h2>API Test Component</h2>

    <v-card class="mb-4">
      <v-card-title>Activity Types</v-card-title>
      <v-card-text>
        <v-btn @click="testActivityTypes" color="primary" class="mb-2">
          Test Activity Types API
        </v-btn>
        <pre v-if="activityTypesResult">{{ activityTypesResult }}</pre>
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-card-title>Activities</v-card-title>
      <v-card-text>
        <v-btn @click="testActivities" color="primary" class="mb-2">
          Test Activities API
        </v-btn>
        <pre v-if="activitiesResult">{{ activitiesResult }}</pre>
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-card-title>Store Test</v-card-title>
      <v-card-text>
        <v-btn @click="testStore" color="success" class="mb-2">
          Test Activities Store
        </v-btn>
        <pre v-if="storeResult">{{ storeResult }}</pre>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api'
import { useActivitiesStore } from '@/stores/activitiesStore'

const activityTypesResult = ref(null)
const activitiesResult = ref(null)
const storeResult = ref(null)

const activitiesStore = useActivitiesStore()

const testActivityTypes = async () => {
  try {
    console.log('Testing activity types API...')
    const types = await api.activityTypes.getActivityTypes()
    const groups = await api.activityTypes.getActivityTypeGroups()

    activityTypesResult.value = {
      types: types,
      groups: groups,
      typesCount: types?.length || 0,
      groupsCount: groups?.length || 0
    }
    console.log('Activity types result:', activityTypesResult.value)
  } catch (error) {
    console.error('Activity types test failed:', error)
    activityTypesResult.value = { error: error.message }
  }
}

const testActivities = async () => {
  try {
    console.log('Testing activities API...')
    const activities = await api.activities.getActivities()

    activitiesResult.value = {
      activities: activities,
      count: activities?.length || 0
    }
    console.log('Activities result:', activitiesResult.value)
  } catch (error) {
    console.error('Activities test failed:', error)
    activitiesResult.value = { error: error.message }
  }
}

const testStore = async () => {
  try {
    console.log('Testing activities store...')
    await activitiesStore.initialize()

    storeResult.value = {
      activities: activitiesStore.activities,
      activityTypes: activitiesStore.activityTypes,
      activitiesCount: activitiesStore.activities.length,
      activityTypesCount: activitiesStore.activityTypes.length
    }
    console.log('Store result:', storeResult.value)
  } catch (error) {
    console.error('Store test failed:', error)
    storeResult.value = { error: error.message }
  }
}
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}
</style>