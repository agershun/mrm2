<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title>Создание кампании</v-card-title>
      <v-card-text>
        <v-text-field v-model="form.name" label="Название кампании" />
        <v-select v-model="form.channel" :items="channelOptions" label="Канал" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">Отмена</v-btn>
        <v-btn color="primary" @click="createCampaign">Создать</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'created'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const form = ref({
  name: '',
  channel: null
})

const channelOptions = [
  { title: 'Google', value: 'google' },
  { title: 'Facebook', value: 'facebook' },
  { title: 'Instagram', value: 'instagram' }
]

const createCampaign = () => {
  emit('created', form.value)
  dialog.value = false
  form.value = { name: '', channel: null }
}
</script>