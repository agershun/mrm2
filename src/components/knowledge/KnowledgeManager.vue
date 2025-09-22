<template>
  <div class="knowledge-manager">
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5">База знаний</h2>
      <v-btn color="primary" @click="showUploadDialog = true">
        <v-icon>mdi-plus</v-icon>
        Добавить документ
      </v-btn>
    </div>

    <v-tabs v-model="activeTab" class="mb-4">
      <v-tab value="documents">Документы</v-tab>
      <v-tab value="kpis">KPI каналов</v-tab>
      <v-tab value="historical">История</v-tab>
      <v-tab value="practices">Лучшие практики</v-tab>
      <v-tab value="corporate">Корпоративные документы</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <!-- Маркетинговые документы -->
      <v-tabs-window-item value="documents">
        <MarketingDocuments />
      </v-tabs-window-item>

      <!-- KPI каналов -->
      <v-tabs-window-item value="kpis">
        <ChannelKPIs />
      </v-tabs-window-item>

      <!-- Исторические данные -->
      <v-tabs-window-item value="historical">
        <HistoricalData />
      </v-tabs-window-item>

      <!-- Лучшие практики -->
      <v-tabs-window-item value="practices">
        <BestPractices />
      </v-tabs-window-item>

      <!-- Корпоративные документы -->
      <v-tabs-window-item value="corporate">
        <CorporateDocuments />
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Диалог загрузки документа -->
    <DocumentUploadDialog
      v-model="showUploadDialog"
      @uploaded="handleDocumentUploaded"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MarketingDocuments from './MarketingDocuments.vue'
import ChannelKPIs from './ChannelKPIs.vue'
import HistoricalData from './HistoricalData.vue'
import BestPractices from './BestPractices.vue'
import CorporateDocuments from './CorporateDocuments.vue'
import DocumentUploadDialog from './DocumentUploadDialog.vue'

const activeTab = ref('documents')
const showUploadDialog = ref(false)

const handleDocumentUploaded = () => {
  showUploadDialog.value = false
}
</script>