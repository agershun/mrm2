<template>
  <v-card>
    <v-card-title>Матрица эффективности каналов</v-card-title>
    <v-card-text>
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-2">Анализ эффективности...</p>
      </div>
      <div v-else-if="!data || data.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-2">mdi-matrix</v-icon>
        <p class="text-grey mt-2">Нет данных для анализа</p>
      </div>
      <div v-else class="matrix-container">
        <div class="matrix-grid">
          <div
            v-for="(channel, index) in data"
            :key="channel.channel"
            class="matrix-item"
            :style="getMatrixItemStyle(channel)"
            @click="selectChannel(channel)"
          >
            <div class="matrix-content">
              <div class="matrix-title">{{ getChannelName(channel.channel) }}</div>
              <div class="matrix-value">{{ channel.efficiency_score }}</div>
              <div class="matrix-subtitle">ROMI: {{ channel.romi }}%</div>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['channel-selected'])

const selectedChannel = ref(null)

const getMatrixItemStyle = (channel) => {
  const score = channel.efficiency_score || 0
  let backgroundColor = 'rgba(244, 67, 54, 0.8)' // red

  if (score >= 80) backgroundColor = 'rgba(76, 175, 80, 0.8)' // green
  else if (score >= 60) backgroundColor = 'rgba(33, 150, 243, 0.8)' // blue
  else if (score >= 40) backgroundColor = 'rgba(255, 152, 0, 0.8)' // orange

  return {
    backgroundColor,
    width: `${Math.max(100, score * 2)}px`,
    height: `${Math.max(80, score * 1.5)}px`
  }
}

const getChannelName = (channel) => {
  const names = {
    'google_ads': 'Google Ads',
    'yandex_direct': 'Яндекс.Директ',
    'facebook_ads': 'Facebook',
    'vk_ads': 'VK Реклама'
  }
  return names[channel] || channel
}

const selectChannel = (channel) => {
  selectedChannel.value = channel
  emit('channel-selected', channel)
}
</script>

<style scoped>
.matrix-container {
  padding: 16px;
}

.matrix-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.matrix-item {
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.matrix-item:hover {
  transform: scale(1.05);
}

.matrix-content {
  padding: 8px;
}

.matrix-title {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.matrix-value {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.matrix-subtitle {
  font-size: 0.75rem;
  opacity: 0.9;
}
</style>