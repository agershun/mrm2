<template>
  <v-data-table :items="campaigns" :loading="loading" class="campaigns-list">
    <template #item.name="{ item }">
      <div class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-rocket-launch</v-icon>
        {{ item.name }}
      </div>
    </template>
    <template #item.actions="{ item }">
      <v-btn icon="mdi-eye" size="small" @click="$emit('view-details', item)" />
      <v-btn icon="mdi-pencil" size="small" @click="$emit('edit', item)" />
    </template>
  </v-data-table>
</template>

<script setup>
defineProps({
  campaigns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] }
})

defineEmits(['select', 'edit', 'duplicate', 'delete', 'view-details'])
</script>