<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title>Редактирование кампании</v-card-title>
      <v-card-text>
        <v-text-field v-model="form.name" label="Название кампании" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">Отмена</v-btn>
        <v-btn color="primary" @click="updateCampaign">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  campaign: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'updated'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const form = ref({ name: '' })

watch(() => props.campaign, (campaign) => {
  if (campaign) form.value = { ...campaign }
}, { immediate: true })

const updateCampaign = () => {
  emit('updated', form.value)
  dialog.value = false
}
</script>