// Простой тест API для отладки
import api from './src/api/index.js'

console.log('Testing API...')

try {
  console.log('Testing activity types...')
  const types = await api.activityTypes.getActivityTypes()
  console.log('Activity types:', types)

  console.log('Testing activity type groups...')
  const groups = await api.activityTypes.getActivityTypeGroups()
  console.log('Activity type groups:', groups)

  console.log('Testing activities...')
  const activities = await api.activities.getActivities()
  console.log('Activities:', activities)

} catch (error) {
  console.error('API test failed:', error)
}