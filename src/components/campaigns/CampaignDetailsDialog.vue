<template>
  <v-dialog v-model="dialog" max-width="800px">
    <v-card>
      <v-card-title>Аналитика кампании</v-card-title>
      <v-card-text>
        <div v-if="campaign">
          <h3>{{ campaign.name }}</h3>
          <p>Канал: {{ campaign.channel }}</p>
          <p>Статус: {{ campaign.status }}</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">
          Закрыть
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  campaign: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>