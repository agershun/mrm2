<template>
  <div class="campaign-workspace">
    <!-- Заголовок -->
    <div class="d-flex align-center mb-6">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        @click="goBack"
        class="me-3"
      />
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">{{ campaign?.name || 'Загрузка...' }}</h1>
        <p class="text-body-1 text-medium-emphasis">
          {{ campaign?.description || 'Рабочее пространство кампании' }}
        </p>
      </div>
      <v-spacer />

      <div class="d-flex align-center ga-3">
        <!-- Статус кампании -->
        <v-chip
          v-if="campaign"
          :color="getStatusColor(campaign.status)"
          size="large"
          variant="flat"
        >
          {{ getStatusText(campaign.status) }}
        </v-chip>

        <!-- Действия -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              v-bind="props"
            />
          </template>
          <v-list>
            <v-list-item @click="createVersion">
              <v-list-item-title>Создать версию</v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportCampaign">
              <v-list-item-title>Экспортировать</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item
              @click="promoteToActivity"
              :disabled="campaign?.status !== 'approved'"
            >
              <v-list-item-title>Перенести в Activities</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <v-card v-if="campaign">
      <!-- Навигация по шагам -->
      <v-tabs
        v-model="activeStep"
        bg-color="grey-lighten-4"
        color="primary"
        align-tabs="start"
      >
        <v-tab value="documents">
          <v-icon start>mdi-file-document</v-icon>
          Документы и Параметры
          <v-badge
            v-if="documentsCount > 0"
            :content="documentsCount"
            color="primary"
            class="ml-2"
          />
        </v-tab>

        <v-tab value="checklist">
          <v-icon start>mdi-clipboard-check</v-icon>
          Чек-лист
          <v-badge
            v-if="checklistCompletionRate < 100"
            :content="`${checklistCompletionRate}%`"
            :color="checklistCompletionRate === 100 ? 'success' : 'warning'"
            class="ml-2"
          />
        </v-tab>

        <v-tab value="mediamix">
          <v-icon start>mdi-chart-donut</v-icon>
          Медиамикс
          <v-badge
            v-if="mediaMixVariantsCount > 0"
            :content="mediaMixVariantsCount"
            color="info"
            class="ml-2"
          />
        </v-tab>

        <v-tab value="mediaplan">
          <v-icon start>mdi-calendar-clock</v-icon>
          Медиаплан
          <v-badge
            v-if="mediaPlanVariantsCount > 0"
            :content="mediaPlanVariantsCount"
            color="success"
            class="ml-2"
          />
        </v-tab>

        <v-tab value="versions">
          <v-icon start>mdi-source-branch</v-icon>
          Версии и варианты
          <v-badge
            v-if="totalVariantsCount > 0"
            :content="totalVariantsCount"
            color="purple"
            class="ml-2"
          />
        </v-tab>

        <v-tab value="approval">
          <v-icon start>mdi-check-circle</v-icon>
          Утверждение
          <v-badge
            v-if="campaign?.status === 'approved'"
            content="✓"
            color="success"
            class="ml-2"
          />
        </v-tab>
      </v-tabs>

      <!-- Контент шагов -->
      <v-card-text class="pa-0">
        <v-tabs-window v-model="activeStep">
          <!-- Шаг 1: Документы и параметры -->
          <v-tabs-window-item value="documents">
            <div class="pa-6">
              <v-row>
                <!-- Загрузка документов -->
                <v-col cols="12" lg="4">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="me-2">mdi-upload</v-icon>
                      Документы кампании
                    </v-card-title>
                    <v-card-text>
                      <v-file-input
                        v-model="newDocuments"
                        label="Выберите файлы"
                        variant="outlined"
                        multiple
                        accept=".pdf,.doc,.docx"
                        prepend-icon="mdi-paperclip"
                        show-size
                        @update:model-value="uploadDocuments"
                      />

                      <div v-if="campaignDocuments.length > 0" class="mt-4">
                        <h4 class="text-subtitle-1 mb-2">Загруженные документы:</h4>
                        <v-list density="compact">
                          <v-list-item
                            v-for="doc in campaignDocuments"
                            :key="doc.document_id"
                            class="px-0"
                          >
                            <v-list-item-title>{{ doc.file_name }}</v-list-item-title>
                            <template v-slot:append>
                              <v-chip
                                :color="getDocumentStatusColor(doc.processing_status)"
                                size="x-small"
                                variant="flat"
                              >
                                {{ getDocumentStatusText(doc.processing_status) }}
                              </v-chip>
                            </template>
                          </v-list-item>
                        </v-list>
                      </div>

                      <v-btn
                        v-if="campaignDocuments.length > 0"
                        color="primary"
                        variant="flat"
                        prepend-icon="mdi-robot"
                        @click="processDocumentsWithAI"
                        :loading="isProcessingDocuments"
                        class="mt-4"
                        block
                      >
                        Запустить анализ ИИ
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Параметры кампании -->
                <v-col cols="12" lg="8">
                  <v-tabs v-model="parametersView" color="primary">
                    <v-tab value="card">
                      <v-icon start>mdi-card-text</v-icon>
                      Карточка кампании
                    </v-tab>
                    <v-tab value="table">
                      <v-icon start>mdi-table</v-icon>
                      Таблица параметров
                    </v-tab>
                  </v-tabs>

                  <v-tabs-window v-model="parametersView">
                    <!-- Карточка кампании -->
                    <v-tabs-window-item value="card">
                      <v-card variant="outlined" class="mt-4" style="max-height: calc(100vh - 350px); overflow-y: auto;">
                        <v-card-title>Карточка рекламной кампании</v-card-title>
                        <v-card-text>
                          <v-row>
                            <!-- Основная информация -->
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.name"
                                label="Название кампании"
                                variant="outlined"
                                readonly
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-select
                                v-model="campaignCard.objective"
                                label="Цель кампании"
                                variant="outlined"
                                :items="objectiveOptions"
                                item-title="text"
                                item-value="value"
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-select
                                v-model="campaignCard.channel"
                                label="Канал"
                                variant="outlined"
                                :items="channelOptions"
                                item-title="text"
                                item-value="value"
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-select
                                v-model="campaignCard.status"
                                label="Статус"
                                variant="outlined"
                                :items="statusOptions"
                                item-title="text"
                                item-value="value"
                              />
                            </v-col>

                            <!-- Бюджет и даты -->
                            <v-col cols="12" md="4">
                              <v-select
                                v-model="campaignCard.budget_type"
                                label="Тип бюджета"
                                variant="outlined"
                                :items="budgetTypeOptions"
                                item-title="text"
                                item-value="value"
                              />
                            </v-col>
                            <v-col cols="12" md="4">
                              <v-text-field
                                v-model="campaignCard.budget_value"
                                label="Бюджет"
                                variant="outlined"
                                type="number"
                                suffix="₽"
                              />
                            </v-col>
                            <v-col cols="12" md="4">
                              <v-select
                                v-model="campaignCard.currency"
                                label="Валюта"
                                variant="outlined"
                                :items="currencyOptions"
                                item-title="text"
                                item-value="value"
                              />
                            </v-col>

                            <!-- Период кампании -->
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.start_date"
                                label="Дата начала"
                                variant="outlined"
                                type="date"
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.end_date"
                                label="Дата окончания"
                                variant="outlined"
                                type="date"
                              />
                            </v-col>

                            <!-- Категоризация -->
                            <v-col cols="12" md="6">
                              <v-select
                                v-model="campaignCard.campaign_category"
                                label="Категория кампании"
                                variant="outlined"
                                :items="campaignCategoryOptions"
                                item-title="text"
                                item-value="value"
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.product_line"
                                label="Продуктовая линейка"
                                variant="outlined"
                              />
                            </v-col>

                            <!-- Таргетинг -->
                            <v-col cols="12" md="6">
                              <v-combobox
                                v-model="campaignCard.geo_targeting"
                                label="Географический таргетинг"
                                variant="outlined"
                                multiple
                                chips
                                :items="geoOptions"
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-combobox
                                v-model="campaignCard.language_targeting"
                                label="Языковой таргетинг"
                                variant="outlined"
                                multiple
                                chips
                                :items="languageOptions"
                                item-title="text"
                                item-value="value"
                              />
                            </v-col>

                            <!-- UTM и трекинг -->
                            <v-col cols="12">
                              <v-expansion-panels>
                                <v-expansion-panel>
                                  <v-expansion-panel-title>
                                    <v-icon start>mdi-link-variant</v-icon>
                                    UTM параметры и трекинг
                                  </v-expansion-panel-title>
                                  <v-expansion-panel-text>
                                    <v-row>
                                      <v-col cols="12" md="4">
                                        <v-text-field
                                          v-model="campaignCard.utm_source"
                                          label="UTM Source"
                                          variant="outlined"
                                        />
                                      </v-col>
                                      <v-col cols="12" md="4">
                                        <v-text-field
                                          v-model="campaignCard.utm_medium"
                                          label="UTM Medium"
                                          variant="outlined"
                                        />
                                      </v-col>
                                      <v-col cols="12" md="4">
                                        <v-text-field
                                          v-model="campaignCard.utm_campaign"
                                          label="UTM Campaign"
                                          variant="outlined"
                                        />
                                      </v-col>
                                      <v-col cols="12">
                                        <v-text-field
                                          v-model="campaignCard.tracking_template"
                                          label="Шаблон трекинга"
                                          variant="outlined"
                                        />
                                      </v-col>
                                    </v-row>
                                  </v-expansion-panel-text>
                                </v-expansion-panel>
                              </v-expansion-panels>
                            </v-col>

                            <!-- KPI цели -->
                            <v-col cols="12">
                              <v-expansion-panels>
                                <v-expansion-panel>
                                  <v-expansion-panel-title>
                                    <v-icon start>mdi-target</v-icon>
                                    KPI цели
                                  </v-expansion-panel-title>
                                  <v-expansion-panel-text>
                                    <div v-for="(kpi, index) in campaignCard.kpi_targets" :key="index" class="mb-3">
                                      <v-row>
                                        <v-col cols="12" md="4">
                                          <v-select
                                            v-model="kpi.type"
                                            label="Тип KPI"
                                            variant="outlined"
                                            :items="kpiTypeOptions"
                                            item-title="text"
                                            item-value="value"
                                          />
                                        </v-col>
                                        <v-col cols="12" md="4">
                                          <v-text-field
                                            v-model="kpi.target"
                                            label="Целевое значение"
                                            variant="outlined"
                                            type="number"
                                          />
                                        </v-col>
                                        <v-col cols="12" md="4" class="d-flex align-center">
                                          <v-btn
                                            icon="mdi-delete"
                                            variant="text"
                                            color="error"
                                            size="small"
                                            @click="removeKPI(index)"
                                          />
                                        </v-col>
                                      </v-row>
                                      <v-divider v-if="index < campaignCard.kpi_targets.length - 1" class="my-3" />
                                    </div>
                                    <v-btn
                                      variant="outlined"
                                      prepend-icon="mdi-plus"
                                      @click="addKPI"
                                    >
                                      Добавить KPI
                                    </v-btn>
                                  </v-expansion-panel-text>
                                </v-expansion-panel>
                              </v-expansion-panels>
                            </v-col>

                            <!-- Версионность и группировка -->
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.campaign_group_id"
                                label="ID группы кампаний"
                                variant="outlined"
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.version"
                                label="Версия"
                                variant="outlined"
                              />
                            </v-col>

                            <!-- Ответственные -->
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.responsible_manager"
                                label="Ответственный менеджер"
                                variant="outlined"
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="campaignCard.frequency_cap_limit"
                                label="Ограничение частоты показов"
                                variant="outlined"
                                type="number"
                              />
                            </v-col>

                            <!-- Комментарии -->
                            <v-col cols="12">
                              <v-textarea
                                v-model="campaignCard.notes"
                                label="Комментарии и заметки"
                                variant="outlined"
                                rows="3"
                              />
                            </v-col>

                            <!-- Кнопки действий -->
                            <v-col cols="12" class="d-flex gap-3">
                              <v-btn
                                color="primary"
                                variant="flat"
                                prepend-icon="mdi-content-save"
                                @click="saveCampaignCard"
                                :loading="isSaving"
                              >
                                Сохранить изменения
                              </v-btn>
                              <v-btn
                                variant="outlined"
                                prepend-icon="mdi-refresh"
                                @click="resetCampaignCard"
                              >
                                Сбросить
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tabs-window-item>

                    <!-- Таблица параметров -->
                    <v-tabs-window-item value="table">
                      <v-card variant="outlined" class="mt-4">
                        <v-card-title>Таблица параметров</v-card-title>
                        <v-card-text>
                          <v-data-table
                            :headers="parameterHeaders"
                            :items="campaignParameters"
                            density="compact"
                            item-value="param_id"
                          >
                            <template #item.param_type="{ item }">
                              <v-chip
                                :color="getParamTypeColor(item.param_type)"
                                size="small"
                                variant="tonal"
                              >
                                {{ item.param_type }}
                              </v-chip>
                            </template>

                            <template #item.confidence_level="{ item }">
                              <v-chip
                                :color="getConfidenceColor(item.confidence_level)"
                                size="small"
                                variant="outlined"
                              >
                                {{ item.confidence_level }}
                              </v-chip>
                            </template>

                            <template #item.param_value="{ item }">
                              <v-text-field
                                v-model="item.param_value"
                                variant="plain"
                                density="compact"
                                hide-details
                                @blur="updateParameter(item)"
                              />
                            </template>

                            <template #item.comment="{ item }">
                              <v-text-field
                                v-model="item.comment"
                                variant="plain"
                                density="compact"
                                hide-details
                                placeholder="Добавить комментарий"
                                @blur="updateParameter(item)"
                              />
                            </template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </v-tabs-window-item>
                  </v-tabs-window>
                </v-col>
              </v-row>
            </div>
          </v-tabs-window-item>

          <!-- Шаг 2: Чек-лист -->
          <v-tabs-window-item value="checklist">
            <div class="pa-6">
              <v-card variant="outlined">
                <v-card-title class="d-flex align-center">
                  <v-icon class="me-2">mdi-clipboard-check</v-icon>
                  Чек-лист готовности к моделированию
                  <v-spacer />
                  <v-btn
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-refresh"
                    @click="validateCampaignData"
                  >
                    Обновить статус
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item
                      v-for="item in checklistItems"
                      :key="item.checklist_item_id"
                      class="px-0"
                    >
                      <template v-slot:prepend>
                        <v-icon
                          :color="getChecklistStatusColor(item.status)"
                          :icon="getChecklistStatusIcon(item.status)"
                          class="me-4"
                        />
                      </template>

                      <v-list-item-title>{{ item.item_name }}</v-list-item-title>

                      <template v-slot:append>
                        <v-chip
                          :color="getChecklistStatusColor(item.status)"
                          size="small"
                          variant="flat"
                        >
                          {{ item.status }}
                        </v-chip>
                      </template>

                      <v-list-item-subtitle v-if="item.comment">
                        {{ item.comment }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </div>
          </v-tabs-window-item>

          <!-- Шаг 3: Медиамикс -->
          <v-tabs-window-item value="mediamix">
            <div class="pa-6">
              <div class="d-flex align-center mb-4">
                <h3 class="text-h6">Моделирование медиамикса</h3>
                <v-spacer />
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-robot"
                  @click="generateMediaMix"
                  :loading="isGeneratingMediaMix"
                >
                  Сгенерировать медиамикс
                </v-btn>
              </div>

              <v-alert
                v-if="checklistCompletionRate < 100"
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Рекомендуется завершить чек-лист для более точной генерации медиамикса
              </v-alert>

              <!-- Варианты медиамикса -->
              <div v-if="mediaMixVariants.length > 0">
                <v-select
                  v-model="selectedMediaMixVariant"
                  :items="mediaMixVariantOptions"
                  label="Выберите вариант медиамикса"
                  variant="outlined"
                  class="mb-4"
                />

                <v-card variant="outlined" v-if="selectedMediaMixVariant">
                  <v-card-title class="d-flex align-center">
                    Медиамикс: {{ selectedMediaMixVariant.name }}
                    <v-spacer />
                    <v-btn
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-tune"
                      @click="showOptimizationDialog = true"
                    >
                      Оптимизировать
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <MediaMixTable
                      :items="currentMediaMixItems"
                      :loading="isGeneratingMediaMix"
                      :totalBudgetLimit="campaignCard.budget_value"
                      @update:items="updateMediaMixItems"
                      @item-updated="handleMediaMixItemUpdated"
                      @mix-optimized="handleMediaMixOptimized"
                    />
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-tabs-window-item>

          <!-- Шаг 4: Медиаплан -->
          <v-tabs-window-item value="mediaplan">
            <div class="pa-6">
              <div class="d-flex align-center mb-4">
                <h3 class="text-h6">Медиаплан</h3>
                <v-spacer />
                <div class="d-flex ga-2">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-calendar-plus"
                    @click="generateMediaPlan"
                    :loading="isGeneratingMediaPlan"
                    :disabled="!selectedMediaMixVariant"
                  >
                    Создать медиаплан
                  </v-btn>

                  <v-btn
                    v-if="currentMediaPlan"
                    color="success"
                    variant="flat"
                    prepend-icon="mdi-download"
                    @click="exportMediaPlan"
                  >
                    Экспорт
                  </v-btn>
                </div>
              </div>

              <v-card variant="outlined" v-if="currentMediaPlan">
                <v-card-title>
                  {{ currentMediaPlan.name }}
                </v-card-title>
                <v-card-text>
                  <MediaPlanTable
                    :items="currentMediaPlanItems"
                    :loading="isGeneratingMediaPlan"
                    @update:items="updateMediaPlanItems"
                    @item-updated="handleMediaPlanItemUpdated"
                  />
                </v-card-text>
              </v-card>
            </div>
          </v-tabs-window-item>

          <!-- Шаг 5: Версии и варианты -->
          <v-tabs-window-item value="versions">
            <div class="pa-6">
              <div class="d-flex align-center mb-4">
                <h3 class="text-h6">Управление версиями медиамиксов и медиапланов</h3>
                <v-spacer />
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-plus"
                  @click="createNewVariant"
                >
                  Создать новый вариант
                </v-btn>
              </div>

              <v-row>
                <!-- Медиамиксы -->
                <v-col cols="12" lg="6">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="me-2">mdi-chart-donut</v-icon>
                      Варианты медиамиксов
                    </v-card-title>
                    <v-card-text>
                      <div v-if="mediaMixVariants.length === 0" class="text-center py-8">
                        <v-icon size="64" color="grey-lighten-2" class="mb-4">
                          mdi-chart-donut-variant
                        </v-icon>
                        <p class="text-body-2 text-grey-darken-1">
                          Нет созданных вариантов медиамикса
                        </p>
                      </div>

                      <v-list v-else density="compact">
                        <v-list-item
                          v-for="variant in mediaMixVariants"
                          :key="variant.mix_variant_id"
                          :active="selectedMediaMixVariant?.mix_variant_id === variant.mix_variant_id"
                          @click="selectMediaMixVariant(variant)"
                        >
                          <v-list-item-title>{{ variant.name }}</v-list-item-title>
                          <v-list-item-subtitle>{{ variant.description }}</v-list-item-subtitle>

                          <template #prepend>
                            <v-avatar size="32" :color="getVariantStatusColor(variant.status)">
                              <v-icon size="16">{{ getVariantStatusIcon(variant.status) }}</v-icon>
                            </v-avatar>
                          </template>

                          <template #append>
                            <div class="d-flex align-center ga-1">
                              <v-chip size="x-small" variant="outlined">
                                {{ formatCurrency(variant.total_budget) }}
                              </v-chip>
                              <v-menu>
                                <template #activator="{ props }">
                                  <v-btn
                                    icon="mdi-dots-vertical"
                                    variant="text"
                                    size="small"
                                    v-bind="props"
                                  />
                                </template>
                                <v-list>
                                  <v-list-item @click="duplicateVariant('mediamix', variant)">
                                    <v-list-item-title>Дублировать</v-list-item-title>
                                  </v-list-item>
                                  <v-list-item @click="renameVariant('mediamix', variant)">
                                    <v-list-item-title>Переименовать</v-list-item-title>
                                  </v-list-item>
                                  <v-divider />
                                  <v-list-item @click="deleteVariant('mediamix', variant)" class="text-error">
                                    <v-list-item-title>Удалить</v-list-item-title>
                                  </v-list-item>
                                </v-list>
                              </v-menu>
                            </div>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Медиапланы -->
                <v-col cols="12" lg="6">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="me-2">mdi-calendar-clock</v-icon>
                      Варианты медиапланов
                    </v-card-title>
                    <v-card-text>
                      <div v-if="mediaPlanVariants.length === 0" class="text-center py-8">
                        <v-icon size="64" color="grey-lighten-2" class="mb-4">
                          mdi-calendar-outline
                        </v-icon>
                        <p class="text-body-2 text-grey-darken-1">
                          Нет созданных вариантов медиаплана
                        </p>
                      </div>

                      <v-list v-else density="compact">
                        <v-list-item
                          v-for="variant in mediaPlanVariants"
                          :key="variant.plan_variant_id"
                          :active="currentMediaPlan?.plan_variant_id === variant.plan_variant_id"
                          @click="selectMediaPlanVariant(variant)"
                        >
                          <v-list-item-title>{{ variant.name }}</v-list-item-title>
                          <v-list-item-subtitle>{{ variant.description }}</v-list-item-subtitle>

                          <template #prepend>
                            <v-avatar size="32" :color="getVariantStatusColor(variant.status)">
                              <v-icon size="16">{{ getVariantStatusIcon(variant.status) }}</v-icon>
                            </v-avatar>
                          </template>

                          <template #append>
                            <div class="d-flex align-center ga-1">
                              <v-chip size="x-small" variant="outlined">
                                {{ variant.period_weeks }}нед
                              </v-chip>
                              <v-menu>
                                <template #activator="{ props }">
                                  <v-btn
                                    icon="mdi-dots-vertical"
                                    variant="text"
                                    size="small"
                                    v-bind="props"
                                  />
                                </template>
                                <v-list>
                                  <v-list-item @click="duplicateVariant('mediaplan', variant)">
                                    <v-list-item-title>Дублировать</v-list-item-title>
                                  </v-list-item>
                                  <v-list-item @click="renameVariant('mediaplan', variant)">
                                    <v-list-item-title>Переименовать</v-list-item-title>
                                  </v-list-item>
                                  <v-divider />
                                  <v-list-item @click="deleteVariant('mediaplan', variant)" class="text-error">
                                    <v-list-item-title>Удалить</v-list-item-title>
                                  </v-list-item>
                                </v-list>
                              </v-menu>
                            </div>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Сравнение вариантов -->
              <v-card variant="outlined" class="mt-6" v-if="selectedMediaMixVariant || currentMediaPlan">
                <v-card-title>Сравнение вариантов</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="6" v-if="selectedMediaMixVariant">
                      <h4 class="text-subtitle-1 mb-3">Активный медиамикс</h4>
                      <v-table density="compact">
                        <tbody>
                          <tr>
                            <td><strong>Название:</strong></td>
                            <td>{{ selectedMediaMixVariant.name }}</td>
                          </tr>
                          <tr>
                            <td><strong>Бюджет:</strong></td>
                            <td>{{ formatCurrency(selectedMediaMixVariant.total_budget) }}</td>
                          </tr>
                          <tr>
                            <td><strong>Охват:</strong></td>
                            <td>{{ formatNumber(selectedMediaMixVariant.total_reach) }}</td>
                          </tr>
                          <tr>
                            <td><strong>Статус:</strong></td>
                            <td>
                              <v-chip
                                :color="getVariantStatusColor(selectedMediaMixVariant.status)"
                                size="small"
                                variant="flat"
                              >
                                {{ getVariantStatusText(selectedMediaMixVariant.status) }}
                              </v-chip>
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </v-col>

                    <v-col cols="12" md="6" v-if="currentMediaPlan">
                      <h4 class="text-subtitle-1 mb-3">Активный медиаплан</h4>
                      <v-table density="compact">
                        <tbody>
                          <tr>
                            <td><strong>Название:</strong></td>
                            <td>{{ currentMediaPlan.name }}</td>
                          </tr>
                          <tr>
                            <td><strong>Период:</strong></td>
                            <td>{{ currentMediaPlan.period_weeks }} недель</td>
                          </tr>
                          <tr>
                            <td><strong>Каналов:</strong></td>
                            <td>{{ currentMediaPlanItems.length }}</td>
                          </tr>
                          <tr>
                            <td><strong>Статус:</strong></td>
                            <td>
                              <v-chip
                                :color="getVariantStatusColor(currentMediaPlan.status)"
                                size="small"
                                variant="flat"
                              >
                                {{ getVariantStatusText(currentMediaPlan.status) }}
                              </v-chip>
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>
          </v-tabs-window-item>

          <!-- Шаг 6: Утверждение -->
          <v-tabs-window-item value="approval">
            <div class="pa-6">
              <div class="d-flex align-center mb-6">
                <h3 class="text-h6">Утверждение рекламной кампании</h3>
                <v-spacer />
                <v-chip
                  :color="getStatusColor(campaign?.status)"
                  size="large"
                  variant="flat"
                >
                  {{ getStatusText(campaign?.status) }}
                </v-chip>
              </div>

              <!-- Резюме кампании -->
              <v-card variant="outlined" class="mb-6">
                <v-card-title>
                  <v-icon class="me-2">mdi-clipboard-text</v-icon>
                  Резюме кампании
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title>Название кампании</v-list-item-title>
                          <v-list-item-subtitle>{{ campaign?.name }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Описание</v-list-item-title>
                          <v-list-item-subtitle>{{ campaign?.description }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Период проведения</v-list-item-title>
                          <v-list-item-subtitle>
                            {{ formatDate(campaign?.start_date) }} - {{ formatDate(campaign?.end_date) }}
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title>Общий бюджет</v-list-item-title>
                          <v-list-item-subtitle>{{ formatCurrency(campaign?.budget_value) }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Целевая аудитория</v-list-item-title>
                          <v-list-item-subtitle>{{ campaign?.target_audience }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Каналы</v-list-item-title>
                          <v-list-item-subtitle>{{ campaign?.channels?.join(', ') || 'Не указаны' }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Проверки готовности -->
              <v-card variant="outlined" class="mb-6">
                <v-card-title>
                  <v-icon class="me-2">mdi-checkbox-marked-circle</v-icon>
                  Проверки готовности
                </v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon :color="documentsCount > 0 ? 'success' : 'warning'">
                          {{ documentsCount > 0 ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                        </v-icon>
                      </template>
                      <v-list-item-title>Документы кампании загружены</v-list-item-title>
                      <v-list-item-subtitle>{{ documentsCount }} документов</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon :color="checklistCompletionRate === 100 ? 'success' : 'warning'">
                          {{ checklistCompletionRate === 100 ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                        </v-icon>
                      </template>
                      <v-list-item-title>Чек-лист выполнен</v-list-item-title>
                      <v-list-item-subtitle>{{ checklistCompletionRate }}% выполнено</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon :color="mediaMixVariantsCount > 0 ? 'success' : 'warning'">
                          {{ mediaMixVariantsCount > 0 ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                        </v-icon>
                      </template>
                      <v-list-item-title>Медиамикс настроен</v-list-item-title>
                      <v-list-item-subtitle>{{ mediaMixVariantsCount }} вариантов</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon :color="mediaPlanVariantsCount > 0 ? 'success' : 'warning'">
                          {{ mediaPlanVariantsCount > 0 ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                        </v-icon>
                      </template>
                      <v-list-item-title>Медиаплан создан</v-list-item-title>
                      <v-list-item-subtitle>{{ mediaPlanVariantsCount }} планов</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>

              <!-- Действия утверждения -->
              <v-card variant="outlined">
                <v-card-title>
                  <v-icon class="me-2">mdi-gavel</v-icon>
                  Действия утверждения
                </v-card-title>
                <v-card-text>
                  <div v-if="campaign?.status !== 'approved'" class="text-center">
                    <p class="text-body-1 mb-4">
                      Убедитесь, что все проверки пройдены, затем утвердите кампанию для переноса в Activities.
                    </p>
                    <v-btn
                      color="success"
                      size="large"
                      prepend-icon="mdi-check-bold"
                      :disabled="!isReadyForApproval"
                      @click="approveCampaign"
                      :loading="isApproving"
                    >
                      Утвердить кампанию
                    </v-btn>
                    <p v-if="!isReadyForApproval" class="text-caption text-warning mt-2">
                      Завершите все проверки для активации кнопки утверждения
                    </p>
                  </div>

                  <div v-else class="text-center">
                    <v-alert type="success" class="mb-4">
                      <v-alert-title>Кампания утверждена!</v-alert-title>
                      Кампания готова к переносу в систему Activities для запуска.
                    </v-alert>
                    <v-btn
                      color="primary"
                      size="large"
                      prepend-icon="mdi-transfer-right"
                      @click="promoteToActivity"
                      :loading="isPromoting"
                    >
                      Перенести в Activities
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>

    <!-- Диалог оптимизации -->
    <v-dialog v-model="showOptimizationDialog" max-width="400">
      <v-card>
        <v-card-title>Цель оптимизации</v-card-title>
        <v-card-text>
          <v-radio-group v-model="optimizationGoal">
            <v-radio label="Максимизировать ROI" value="roi" />
            <v-radio label="Максимизировать охват" value="reach" />
            <v-radio label="Снизить CPM" value="cpm" />
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showOptimizationDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :loading="isOptimizing"
            @click="optimizeMediaMix"
          >
            Оптимизировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useMediaMixStore } from '@/stores/mediaMixStore'
import { useMediaPlanStore } from '@/stores/mediaPlanStore'
import MediaMixTable from '@/components/mediamix/MediaMixTable.vue'
import MediaPlanTable from '@/components/mediamix/MediaPlanTable.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const mediaMixStore = useMediaMixStore()
const mediaPlanStore = useMediaPlanStore()

const campaignId = route.params.id

// Reactive data
const campaign = ref(null)
const activeStep = ref('documents')
const parametersView = ref('card')
const newDocuments = ref([])
const isProcessingDocuments = ref(false)
const isGeneratingMediaMix = ref(false)
const isGeneratingMediaPlan = ref(false)
const isOptimizing = ref(false)
const showOptimizationDialog = ref(false)
const optimizationGoal = ref('roi')
const selectedMediaMixVariant = ref(null)
const isApproving = ref(false)
const isPromoting = ref(false)

// Mock data
const campaignDocuments = ref([])
const campaignParameters = ref([])
const checklistItems = ref([
  {
    checklist_item_id: '1',
    item_name: 'Цель кампании определена',
    status: 'Да',
    comment: 'Извлечено из брифа'
  },
  {
    checklist_item_id: '2',
    item_name: 'Целевая аудитория описана',
    status: 'Частично',
    comment: 'Нужно уточнить возрастные группы'
  },
  {
    checklist_item_id: '3',
    item_name: 'Бюджет указан',
    status: 'Да',
    comment: ''
  },
  {
    checklist_item_id: '4',
    item_name: 'География размещения',
    status: 'Нет',
    comment: 'Не указана в документах'
  },
  {
    checklist_item_id: '5',
    item_name: 'KPI определены',
    status: 'Да',
    comment: 'Лиды, ROI'
  }
])

// Use stores for media mix and media plan data
const mediaMixVariants = computed(() => mediaMixStore.getMediaMixVariants)
const currentMediaMixItems = computed(() => mediaMixStore.getMediaMixItems)
const mediaPlanVariants = computed(() => mediaPlanStore.getMediaPlanVariants)
const currentMediaPlan = computed(() => mediaPlanStore.getCurrentMediaPlan)
const currentMediaPlanItems = computed(() => mediaPlanStore.getMediaPlanItems)

const campaignCard = ref({
  name: '',
  objective: '',
  channel: '',
  status: 'draft',
  budget_type: 'lifetime',
  budget_value: 0,
  currency: 'RUB',
  start_date: '',
  end_date: '',
  campaign_category: '',
  product_line: '',
  geo_targeting: [],
  language_targeting: [],
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  tracking_template: '',
  kpi_targets: [],
  campaign_group_id: '',
  version: 'v1',
  responsible_manager: '',
  frequency_cap_limit: null,
  notes: ''
})

// Флаги состояния
const isSaving = ref(false)

// Опции для селектов
const objectiveOptions = [
  { text: 'Конверсии', value: 'conversions' },
  { text: 'Охват', value: 'reach' },
  { text: 'Узнаваемость бренда', value: 'awareness' },
  { text: 'Трафик', value: 'traffic' },
  { text: 'Вовлечение', value: 'engagement' },
  { text: 'Установки приложения', value: 'app_installs' },
  { text: 'Лидогенерация', value: 'leads' }
]

const channelOptions = [
  { text: 'Meta (Facebook/Instagram)', value: 'meta' },
  { text: 'Google Ads', value: 'google' },
  { text: 'Яндекс Директ', value: 'yandex' },
  { text: 'ВКонтакте', value: 'vkontakte' },
  { text: 'Telegram', value: 'telegram' },
  { text: 'Программатик', value: 'programmatic' },
  { text: 'Другое', value: 'other' }
]

const statusOptions = [
  { text: 'Черновик', value: 'draft' },
  { text: 'Активна', value: 'active' },
  { text: 'Приостановлена', value: 'paused' },
  { text: 'Завершена', value: 'completed' },
  { text: 'Отменена', value: 'cancelled' },
  { text: 'В архиве', value: 'archived' }
]

const budgetTypeOptions = [
  { text: 'На весь период', value: 'lifetime' },
  { text: 'Ежедневно', value: 'daily' },
  { text: 'Неограниченно', value: 'unlimited' }
]

const currencyOptions = [
  { text: 'Российский рубль (₽)', value: 'RUB' },
  { text: 'Доллар США ($)', value: 'USD' },
  { text: 'Евро (€)', value: 'EUR' }
]

const campaignCategoryOptions = [
  { text: 'Промо-акция', value: 'promo' },
  { text: 'Запуск продукта', value: 'launch' },
  { text: 'Ретаргетинг', value: 'retargeting' },
  { text: 'Тестовая кампания', value: 'test' },
  { text: 'Постоянная кампания', value: 'always_on' },
  { text: 'Другое', value: 'other' }
]

const geoOptions = [
  'Россия',
  'Москва',
  'Санкт-Петербург',
  'Екатеринбург',
  'Новосибирск',
  'Нижний Новгород',
  'Казань',
  'Челябинск',
  'Омск',
  'Самара',
  'Уфа',
  'Красноярск',
  'Пермь',
  'Волгоград'
]

const languageOptions = [
  { text: 'Русский', value: 'ru' },
  { text: 'Английский', value: 'en' },
  { text: 'Татарский', value: 'tt' },
  { text: 'Украинский', value: 'uk' },
  { text: 'Белорусский', value: 'be' }
]

const kpiTypeOptions = [
  { text: 'Конверсии', value: 'conversions' },
  { text: 'ROI/ROAS', value: 'roi' },
  { text: 'CPA (Стоимость привлечения)', value: 'cpa' },
  { text: 'CPC (Стоимость клика)', value: 'cpc' },
  { text: 'CTR (Кликабельность)', value: 'ctr' },
  { text: 'Охват', value: 'reach' },
  { text: 'Частота показов', value: 'frequency' },
  { text: 'Лиды', value: 'leads' },
  { text: 'Установки приложения', value: 'app_installs' }
]

const parameterHeaders = [
  { title: 'Параметр', key: 'param_name', sortable: true },
  { title: 'Тип', key: 'param_type', sortable: true },
  { title: 'Значение', key: 'param_value', sortable: false },
  { title: 'Источник', key: 'source', sortable: true },
  { title: 'Уверенность', key: 'confidence_level', sortable: true },
  { title: 'Комментарий', key: 'comment', sortable: false }
]

// Computed
const documentsCount = computed(() => campaignDocuments.value.length)
const checklistCompletionRate = computed(() => {
  const completed = checklistItems.value.filter(item => item.status === 'Да').length
  return Math.round((completed / checklistItems.value.length) * 100)
})
const mediaMixVariantsCount = computed(() => mediaMixVariants.value.length)
const mediaPlanVariantsCount = computed(() => mediaPlanVariants.value.length)
const totalVariantsCount = computed(() => mediaMixVariants.value.length + mediaPlanVariants.value.length)

const isReadyForApproval = computed(() => {
  return documentsCount.value > 0 &&
         checklistCompletionRate.value === 100 &&
         mediaMixVariantsCount.value > 0 &&
         mediaPlanVariantsCount.value > 0
})

const mediaMixVariantOptions = computed(() =>
  mediaMixVariants.value.map(variant => ({
    title: variant.name,
    value: variant,
    subtitle: variant.description
  }))
)

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    'draft': 'grey',
    'processing': 'blue',
    'review': 'orange',
    'approved': 'green',
    'rejected': 'red'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'draft': 'Черновик',
    'processing': 'Обрабатывается',
    'review': 'На рассмотрении',
    'approved': 'Утверждена',
    'rejected': 'Отклонена'
  }
  return texts[status] || status
}

const getDocumentStatusColor = (status) => {
  const colors = {
    'uploaded': 'blue',
    'processing': 'orange',
    'processed': 'green',
    'error': 'red'
  }
  return colors[status] || 'grey'
}

const getDocumentStatusText = (status) => {
  const texts = {
    'uploaded': 'Загружен',
    'processing': 'Обработка',
    'processed': 'Обработан',
    'error': 'Ошибка'
  }
  return texts[status] || status
}

const getParamTypeColor = (type) => {
  const colors = {
    'ЦА': 'blue',
    'география': 'green',
    'каналы': 'purple',
    'форматы': 'orange',
    'стратегия': 'teal',
    'KPI': 'red',
    'ограничение': 'brown',
    'период': 'indigo'
  }
  return colors[type] || 'grey'
}

const getConfidenceColor = (confidence) => {
  const colors = {
    'высокий': 'green',
    'средний': 'orange',
    'низкий': 'red',
    'предположено': 'grey'
  }
  return colors[confidence] || 'grey'
}

const getChecklistStatusColor = (status) => {
  const colors = {
    'Да': 'success',
    'Частично': 'warning',
    'Нет': 'error'
  }
  return colors[status] || 'grey'
}

const getChecklistStatusIcon = (status) => {
  const icons = {
    'Да': 'mdi-check-circle',
    'Частично': 'mdi-alert-circle',
    'Нет': 'mdi-close-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

// Methods
const goBack = () => {
  router.push('/campaigns')
}

const loadCampaign = async () => {
  try {
    // TODO: API call getCampaign(campaignId)
    // Mock data
    campaign.value = {
      ai_campaign_id: campaignId,
      name: 'Кампания "Живи на своём" Q1 2025',
      description: 'Продвижение банковских услуг для молодежи',
      objective: 'Увеличить количество лидов на 30%',
      campaign_category: 'performance',
      status: 'draft',
      version: 'v1',
      created_by: 'Иван Петров',
      budget_limit: {
        online: 8000000,
        offline: 1500000
      }
    }

    // Загружаем связанные данные
    await loadCampaignData()
  } catch (error) {
    console.error('Error loading campaign:', error)
    appStore.showError('Ошибка загрузки кампании')
  }
}

const loadCampaignData = async () => {
  // TODO: Загрузка документов, параметров и другой связанной информации
}

const uploadDocuments = async () => {
  if (newDocuments.value.length === 0) return

  try {
    // TODO: API call uploadDocument(campaignId, file)
    newDocuments.value.forEach((file, index) => {
      campaignDocuments.value.push({
        document_id: `doc_${Date.now()}_${index}`,
        file_name: file.name,
        file_type: file.type,
        processing_status: 'uploaded',
        uploaded_at: new Date()
      })
    })

    appStore.showSuccess('Документы загружены')
    newDocuments.value = []
  } catch (error) {
    console.error('Error uploading documents:', error)
    appStore.showError('Ошибка загрузки документов')
  }
}

const processDocumentsWithAI = async () => {
  isProcessingDocuments.value = true
  try {
    // TODO: API call processDocumentWithLlm для каждого документа

    // Имитация обработки
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Обновляем статус документов
    campaignDocuments.value.forEach(doc => {
      doc.processing_status = 'processed'
    })

    // Генерируем параметры
    campaignParameters.value = [
      {
        param_id: '1',
        param_name: 'Целевая аудитория',
        param_type: 'ЦА',
        param_value: 'Молодежь 18-25 лет, средний доход',
        source: 'document',
        confidence_level: 'высокий',
        comment: ''
      },
      {
        param_id: '2',
        param_name: 'География',
        param_type: 'география',
        param_value: 'Москва, СПб, крупные города',
        source: 'document',
        confidence_level: 'средний',
        comment: ''
      },
      {
        param_id: '3',
        param_name: 'Каналы размещения',
        param_type: 'каналы',
        param_value: 'Instagram, VK, YouTube, ТВ',
        source: 'calculated',
        confidence_level: 'высокий',
        comment: 'Рекомендация на основе ЦА'
      }
    ]

    // Обновляем карточку кампании
    campaignCard.value = {
      name: campaign.value.name,
      category: 'Performance',
      objective: campaign.value.objective,
      target_audience: 'Молодежь 18-25 лет',
      budget_total: '9.5 млн ₽'
    }

    appStore.showSuccess('Документы обработаны ИИ')
  } catch (error) {
    console.error('Error processing documents:', error)
    appStore.showError('Ошибка обработки документов')
  } finally {
    isProcessingDocuments.value = false
  }
}

const updateParameter = async (parameter) => {
  try {
    // TODO: API call updateCampaignParam
    console.log('Updating parameter:', parameter)
  } catch (error) {
    console.error('Error updating parameter:', error)
  }
}

const validateCampaignData = async () => {
  try {
    // TODO: API call validateCampaignData
    appStore.showSuccess('Статус чек-листа обновлен')
  } catch (error) {
    console.error('Error validating campaign data:', error)
    appStore.showError('Ошибка проверки данных')
  }
}

const generateMediaMix = async () => {
  isGeneratingMediaMix.value = true
  try {
    // TODO: API call generateInitialMediaMix

    // Имитация генерации
    await new Promise(resolve => setTimeout(resolve, 3000))

    const newVariant = {
      mix_variant_id: `mix_${Date.now()}`,
      name: 'Черновой медиамикс',
      description: 'Первичный вариант, сгенерированный ИИ',
      status: 'draft',
      total_budget: 8000000,
      total_reach: 2500000,
      source: 'generated_llm'
    }

    mediaMixVariants.value.push(newVariant)
    selectedMediaMixVariant.value = newVariant

    // Генерируем строки медиамикса
    currentMediaMixItems.value = [
      {
        channel: 'Instagram',
        budget_allocation: 3000000,
        budget_share: 37.5,
        expected_cpa: 1200,
        expected_conversions: 2500,
        expected_roi: 350
      },
      {
        channel: 'VKontakte',
        budget_allocation: 2000000,
        budget_share: 25.0,
        expected_cpa: 800,
        expected_conversions: 2500,
        expected_roi: 400
      },
      {
        channel: 'YouTube',
        budget_allocation: 2000000,
        budget_share: 25.0,
        expected_cpa: 1000,
        expected_conversions: 2000,
        expected_roi: 300
      },
      {
        channel: 'Google Ads',
        budget_allocation: 1000000,
        budget_share: 12.5,
        expected_cpa: 1500,
        expected_conversions: 667,
        expected_roi: 250
      }
    ]

    appStore.showSuccess('Медиамикс сгенерирован')
  } catch (error) {
    console.error('Error generating media mix:', error)
    appStore.showError('Ошибка генерации медиамикса')
  } finally {
    isGeneratingMediaMix.value = false
  }
}

const optimizeMediaMix = async () => {
  isOptimizing.value = true
  try {
    // TODO: API call optimizeMediaMix

    await new Promise(resolve => setTimeout(resolve, 2000))

    const optimizedVariant = {
      mix_variant_id: `mix_${Date.now()}`,
      name: `Оптимизированный (${optimizationGoal.value.toUpperCase()})`,
      description: `Оптимизирован для ${optimizationGoal.value}`,
      status: 'active',
      total_budget: 8000000,
      total_reach: 2800000,
      source: 'optimized_llm'
    }

    mediaMixVariants.value.push(optimizedVariant)
    selectedMediaMixVariant.value = optimizedVariant

    // Обновляем строки с оптимизированными значениями
    currentMediaMixItems.value = [
      {
        channel: 'Instagram',
        budget_allocation: 3500000,
        budget_share: 43.8,
        expected_cpa: 1000,
        expected_conversions: 3500,
        expected_roi: 450
      },
      {
        channel: 'YouTube',
        budget_allocation: 3000000,
        budget_share: 37.5,
        expected_cpa: 900,
        expected_conversions: 3333,
        expected_roi: 420
      },
      {
        channel: 'Google Ads',
        budget_allocation: 1500000,
        budget_share: 18.8,
        expected_cpa: 1200,
        expected_conversions: 1250,
        expected_roi: 350
      }
    ]

    showOptimizationDialog.value = false
    appStore.showSuccess('Медиамикс оптимизирован')
  } catch (error) {
    console.error('Error optimizing media mix:', error)
    appStore.showError('Ошибка оптимизации медиамикса')
  } finally {
    isOptimizing.value = false
  }
}

const updateMediaMixItems = (items) => {
  mediaMixStore.updateMediaMixItems(items)
}

const handleMediaMixItemUpdated = (items) => {
  mediaMixStore.updateMediaMixItems(items)
  // Здесь можно добавить логику автосохранения или валидации
  console.log('Media mix items updated:', items)
}

const handleMediaMixOptimized = (optimizedItems) => {
  mediaMixStore.updateMediaMixItems(optimizedItems)
  // Можно добавить уведомление об оптимизации
  appStore.showNotification('Медиа-микс оптимизирован', 'success')
}

const updateMediaPlanItems = (items) => {
  mediaPlanStore.updateMediaPlanItems(items)
}

const handleMediaPlanItemUpdated = (items) => {
  mediaPlanStore.updateMediaPlanItems(items)
  // Здесь можно добавить логику автосохранения или валидации
  console.log('Media plan items updated:', items)
}

const generateMediaPlan = async () => {
  isGeneratingMediaPlan.value = true
  try {
    // TODO: API call generateMediaPlan

    await new Promise(resolve => setTimeout(resolve, 2000))

    currentMediaPlan.value = {
      plan_variant_id: `plan_${Date.now()}`,
      name: 'Медиаплан Q1 2025',
      status: 'draft',
      total_budget: selectedMediaMixVariant.value.total_budget,
      start_date: '2025-01-01',
      end_date: '2025-03-31'
    }

    // Генерируем строки медиаплана
    currentMediaPlanItems.value = [
      {
        placement_id: 'placement_1',
        channel: 'Instagram',
        placement_type: 'Stories',
        start_date: '2025-01-01',
        end_date: '2025-03-31',
        budget: 3500000,
        impressions: 1400000,
        clicks: 21000,
        ctr: 1.5,
        cpm: 2500
      },
      {
        placement_id: 'placement_2',
        channel: 'YouTube',
        placement_type: 'In-Stream',
        start_date: '2025-01-15',
        end_date: '2025-03-15',
        budget: 3000000,
        impressions: 600000,
        clicks: 12000,
        ctr: 2.0,
        cpm: 5000
      },
      {
        placement_id: 'placement_3',
        channel: 'Google Ads',
        placement_type: 'Search',
        start_date: '2025-02-01',
        end_date: '2025-02-28',
        budget: 1500000,
        impressions: 150000,
        clicks: 7500,
        ctr: 5.0,
        cpm: 10000
      }
    ]

    appStore.showSuccess('Медиаплан создан')
  } catch (error) {
    console.error('Error generating media plan:', error)
    appStore.showError('Ошибка создания медиаплана')
  } finally {
    isGeneratingMediaPlan.value = false
  }
}


const exportMediaPlan = async () => {
  try {
    // TODO: API call exportMediaPlan
    appStore.showSuccess('Медиаплан экспортирован')
  } catch (error) {
    console.error('Error exporting media plan:', error)
    appStore.showError('Ошибка экспорта медиаплана')
  }
}

const createVersion = async () => {
  try {
    // TODO: API call createCampaignVersion
    appStore.showSuccess('Версия кампании создана')
  } catch (error) {
    console.error('Error creating version:', error)
    appStore.showError('Ошибка создания версии')
  }
}

const exportCampaign = async () => {
  try {
    appStore.showSuccess('Кампания экспортирована')
  } catch (error) {
    console.error('Error exporting campaign:', error)
    appStore.showError('Ошибка экспорта кампании')
  }
}

const approveCampaign = async () => {
  if (!isReadyForApproval.value) {
    appStore.showError('Завершите все проверки перед утверждением')
    return
  }

  isApproving.value = true
  try {
    // TODO: API call approveCampaign(campaignId)
    await new Promise(resolve => setTimeout(resolve, 1500)) // Имитация API запроса

    campaign.value.status = 'approved'
    appStore.showSuccess('Кампания успешно утверждена!')

    // Автоматически переключаемся на вкладку утверждения после утверждения
    activeStep.value = 'approval'
  } catch (error) {
    console.error('Error approving campaign:', error)
    appStore.showError('Ошибка при утверждении кампании')
  } finally {
    isApproving.value = false
  }
}

const promoteToActivity = async () => {
  if (campaign.value?.status !== 'approved') {
    appStore.showError('Кампания должна быть утверждена перед переносом в Activities')
    return
  }

  isPromoting.value = true
  try {
    // TODO: API call promoteToActivity(campaignId)
    await new Promise(resolve => setTimeout(resolve, 2000)) // Имитация API запроса

    appStore.showSuccess('Кампания успешно перенесена в Activities!')

    // Переход к списку Activities или к самой Activity
    router.push('/activities')
  } catch (error) {
    console.error('Error promoting to activity:', error)
    appStore.showError('Ошибка переноса в Activities')
  } finally {
    isPromoting.value = false
  }
}

// Методы для работы с карточкой кампании
const addKPI = () => {
  campaignCard.value.kpi_targets.push({
    type: '',
    target: 0
  })
}

const removeKPI = (index) => {
  campaignCard.value.kpi_targets.splice(index, 1)
}

const saveCampaignCard = async () => {
  isSaving.value = true
  try {
    // TODO: API call to save campaign data
    console.log('Saving campaign card:', campaignCard.value)

    // Имитация сохранения
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Обновляем campaign если оно существует
    if (campaign.value) {
      Object.assign(campaign.value, campaignCard.value)
    }

    console.log('Campaign card saved successfully')
  } catch (error) {
    console.error('Error saving campaign card:', error)
  } finally {
    isSaving.value = false
  }
}

const resetCampaignCard = () => {
  if (campaign.value) {
    // Сбрасываем к исходным данным кампании
    Object.assign(campaignCard.value, {
      name: campaign.value.name || '',
      objective: campaign.value.objective || '',
      channel: campaign.value.channel || '',
      status: campaign.value.status || 'draft',
      budget_type: campaign.value.budget_type || 'lifetime',
      budget_value: campaign.value.budget_value || 0,
      currency: campaign.value.currency || 'RUB',
      start_date: campaign.value.start_date ? campaign.value.start_date.split('T')[0] : '',
      end_date: campaign.value.end_date ? campaign.value.end_date.split('T')[0] : '',
      campaign_category: campaign.value.campaign_category || '',
      product_line: campaign.value.product_line || '',
      geo_targeting: campaign.value.geo_targeting || [],
      language_targeting: campaign.value.language_targeting || [],
      utm_source: campaign.value.utm_params?.source || '',
      utm_medium: campaign.value.utm_params?.medium || '',
      utm_campaign: campaign.value.utm_params?.campaign || '',
      tracking_template: campaign.value.tracking_template || '',
      kpi_targets: campaign.value.kpi_targets || [],
      campaign_group_id: campaign.value.campaign_group_id || '',
      version: campaign.value.version || 'v1',
      responsible_manager: campaign.value.responsible_manager || '',
      frequency_cap_limit: campaign.value.frequency_cap?.limit || null,
      notes: campaign.value.notes || ''
    })
  }
}

// Методы для работы с вариантами медиамикса и медиаплана
const selectMediaMixVariant = (variant) => {
  selectedMediaMixVariant.value = variant
}

const selectMediaPlanVariant = (variant) => {
  currentMediaPlan.value = variant
  // TODO: Загрузить элементы медиаплана для выбранного варианта
}

const getVariantStatusColor = (status) => {
  const colors = {
    draft: 'grey',
    active: 'success',
    archived: 'warning',
    approved: 'primary'
  }
  return colors[status] || 'grey'
}

const getVariantStatusIcon = (status) => {
  const icons = {
    draft: 'mdi-pencil',
    active: 'mdi-check-circle',
    archived: 'mdi-archive',
    approved: 'mdi-check-all'
  }
  return icons[status] || 'mdi-circle'
}

const getVariantStatusText = (status) => {
  const texts = {
    draft: 'Черновик',
    active: 'Активен',
    archived: 'Архив',
    approved: 'Утвержден'
  }
  return texts[status] || status
}

const formatNumber = (value) => {
  if (!value) return '—'
  return new Intl.NumberFormat('ru-RU').format(value)
}

const formatCurrency = (value) => {
  if (!value) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const createNewVariant = () => {
  // TODO: Открыть диалог создания нового варианта
  console.log('Creating new variant')
}

const duplicateVariant = (type, variant) => {
  if (type === 'mediamix') {
    const newVariant = {
      ...variant,
      mix_variant_id: `mix_${Date.now()}`,
      name: `${variant.name} (копия)`,
      status: 'draft',
      source: 'duplicated'
    }
    mediaMixVariants.value.push(newVariant)
  } else if (type === 'mediaplan') {
    const newVariant = {
      ...variant,
      plan_variant_id: `plan_${Date.now()}`,
      name: `${variant.name} (копия)`,
      status: 'draft'
    }
    mediaPlanVariants.value.push(newVariant)
  }
}

const renameVariant = (type, variant) => {
  // TODO: Открыть диалог переименования
  const newName = prompt('Введите новое название:', variant.name)
  if (newName && newName.trim()) {
    variant.name = newName.trim()
  }
}

const deleteVariant = (type, variant) => {
  if (confirm(`Удалить вариант "${variant.name}"?`)) {
    if (type === 'mediamix') {
      const index = mediaMixVariants.value.findIndex(v => v.mix_variant_id === variant.mix_variant_id)
      if (index !== -1) {
        mediaMixVariants.value.splice(index, 1)
        if (selectedMediaMixVariant.value?.mix_variant_id === variant.mix_variant_id) {
          selectedMediaMixVariant.value = null
        }
      }
    } else if (type === 'mediaplan') {
      const index = mediaPlanVariants.value.findIndex(v => v.plan_variant_id === variant.plan_variant_id)
      if (index !== -1) {
        mediaPlanVariants.value.splice(index, 1)
        if (currentMediaPlan.value?.plan_variant_id === variant.plan_variant_id) {
          currentMediaPlan.value = null
        }
      }
    }
  }
}

// Watch для обновления строк медиамикса при смене варианта
watch(selectedMediaMixVariant, (newVariant) => {
  if (newVariant) {
    // TODO: Загрузить строки для выбранного варианта
    console.log('Loading media mix items for variant:', newVariant.mix_variant_id)
  }
})

// Watch для инициализации карточки кампании при загрузке
watch(campaign, (newCampaign) => {
  if (newCampaign) {
    resetCampaignCard()
  }
})

onMounted(() => {
  loadCampaign()

  // Initialize stores with demo data
  mediaMixStore.initializeWithDemoData()
  mediaPlanStore.initializeWithDemoData()
})
</script>

<style scoped>
.campaign-workspace {
  padding: 24px;
}
</style>