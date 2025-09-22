<template>
  <div class="organization-profile">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-office-building</v-icon>
        Профиль организации
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveProfile">
          <!-- Логотип -->
          <div class="d-flex align-center mb-6">
            <v-avatar size="120" class="me-6" rounded="lg">
              <v-img
                v-if="organization.logo"
                :src="organization.logo"
                alt="Логотип"
              />
              <v-icon
                v-else
                size="60"
                color="grey-lighten-1"
              >
                mdi-office-building
              </v-icon>
            </v-avatar>
            <div>
              <v-btn
                color="primary"
                variant="outlined"
                @click="uploadLogo"
                class="mb-2"
              >
                <v-icon class="me-2">mdi-image</v-icon>
                Загрузить логотип
              </v-btn>
              <div class="text-caption text-medium-emphasis">
                Рекомендуемый размер: 300x300 пикселей
              </div>
            </div>
          </div>

          <!-- Основная информация -->
          <div class="organization-section">
            <h3 class="text-h6 mb-4">Основная информация</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.name"
                  label="Название организации"
                  variant="outlined"
                  required
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.legalName"
                  label="Юридическое название"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="organization.industry"
                  :items="industries"
                  label="Отрасль"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="organization.size"
                  :items="companySizes"
                  label="Размер компании"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="organization.description"
                  label="Описание организации"
                  variant="outlined"
                  rows="3"
                  counter="500"
                  :rules="[rules.maxLength(500)]"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.website"
                  label="Веб-сайт"
                  variant="outlined"
                  type="url"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.foundedYear"
                  label="Год основания"
                  variant="outlined"
                  type="number"
                  min="1800"
                  :max="new Date().getFullYear()"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Контактная информация -->
          <div class="organization-section">
            <h3 class="text-h6 mb-4">Контактная информация</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.email"
                  label="Email"
                  variant="outlined"
                  type="email"
                  required
                  :rules="[rules.required, rules.email]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.phone"
                  label="Телефон"
                  variant="outlined"
                  type="tel"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="organization.address"
                  label="Адрес"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="organization.city"
                  label="Город"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="organization.region"
                  label="Регион/Область"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="organization.postalCode"
                  label="Почтовый индекс"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="organization.country"
                  :items="countries"
                  label="Страна"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="organization.timezone"
                  :items="timezones"
                  label="Часовой пояс"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Юридическая информация -->
          <div class="organization-section">
            <h3 class="text-h6 mb-4">Юридическая информация</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.taxId"
                  label="ИНН"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.registrationNumber"
                  label="ОГРН"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.kpp"
                  label="КПП"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.okpo"
                  label="ОКПО"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Социальные сети -->
          <div class="organization-section">
            <h3 class="text-h6 mb-4">Социальные сети</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.linkedin"
                  label="LinkedIn"
                  variant="outlined"
                  prepend-inner-icon="mdi-linkedin"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.facebook"
                  label="Facebook"
                  variant="outlined"
                  prepend-inner-icon="mdi-facebook"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.twitter"
                  label="Twitter"
                  variant="outlined"
                  prepend-inner-icon="mdi-twitter"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="organization.instagram"
                  label="Instagram"
                  variant="outlined"
                  prepend-inner-icon="mdi-instagram"
                />
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Статистика организации -->
    <v-card class="mt-6">
      <v-card-title>
        <v-icon class="me-2">mdi-chart-box</v-icon>
        Статистика организации
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-primary">
                  {{ organizationStats.totalUsers }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Пользователей
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-success">
                  {{ organizationStats.activeProjects }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Активных проектов
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-info">
                  {{ organizationStats.totalBudget }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Общий бюджет
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-warning">
                  {{ organizationStats.accountAge }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Дней с регистрации
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Скрытое поле для загрузки файлов -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileUpload"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
// import { useOrganizationStore } from '@/stores/organizationStore'
import { useAppStore } from '@/stores/appStore'

export default {
  name: 'OrganizationProfile',
  setup() {
    // const organizationStore = useOrganizationStore()
    const appStore = useAppStore()

    const fileInput = ref(null)

    const organization = ref({
      name: 'Креола',
      legalName: 'ООО "Креола"',
      industry: 'cosmetics',
      size: '50-200',
      description: 'Российский производитель натуральной косметики с использованием экологически чистых ингредиентов.',
      website: 'https://kreola.ru',
      foundedYear: 2015,
      email: 'info@kreola.ru',
      phone: '+7 (495) 123-45-67',
      address: 'ул. Тверская, 15, офис 301',
      city: 'Москва',
      region: 'Московская область',
      postalCode: '125009',
      country: 'russia',
      timezone: 'Europe/Moscow',
      taxId: '7701234567',
      registrationNumber: '1027700123456',
      kpp: '770101001',
      okpo: '12345678',
      linkedin: 'https://linkedin.com/company/kreola',
      facebook: 'https://facebook.com/kreola.cosmetics',
      twitter: '@kreola_beauty',
      instagram: '@kreola.cosmetics',
      logo: null
    })

    const organizationStats = ref({
      totalUsers: 12,
      activeProjects: 8,
      totalBudget: '12.5М ₽',
      accountAge: 847
    })

    const industries = ref([
      { title: 'Косметика и красота', value: 'cosmetics' },
      { title: 'Технологии', value: 'technology' },
      { title: 'Финансы', value: 'finance' },
      { title: 'Образование', value: 'education' },
      { title: 'Здравоохранение', value: 'healthcare' },
      { title: 'Розничная торговля', value: 'retail' },
      { title: 'Производство', value: 'manufacturing' },
      { title: 'Другое', value: 'other' }
    ])

    const companySizes = ref([
      { title: '1-10 сотрудников', value: '1-10' },
      { title: '11-50 сотрудников', value: '11-50' },
      { title: '51-200 сотрудников', value: '51-200' },
      { title: '201-500 сотрудников', value: '201-500' },
      { title: '501-1000 сотрудников', value: '501-1000' },
      { title: '1000+ сотрудников', value: '1000+' }
    ])

    const countries = ref([
      { title: 'Россия', value: 'russia' },
      { title: 'США', value: 'usa' },
      { title: 'Германия', value: 'germany' },
      { title: 'Великобритания', value: 'uk' },
      { title: 'Франция', value: 'france' },
      { title: 'Китай', value: 'china' }
    ])

    const timezones = ref([
      { title: 'Москва (UTC+3)', value: 'Europe/Moscow' },
      { title: 'Лондон (UTC+0)', value: 'Europe/London' },
      { title: 'Нью-Йорк (UTC-5)', value: 'America/New_York' },
      { title: 'Берлин (UTC+1)', value: 'Europe/Berlin' },
      { title: 'Токио (UTC+9)', value: 'Asia/Tokyo' }
    ])

    const rules = {
      required: (value) => !!value || 'Поле обязательно для заполнения',
      email: (value) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return pattern.test(value) || 'Введите корректный email'
      },
      maxLength: (max) => (value) =>
        !value || value.length <= max || `Максимум ${max} символов`
    }

    const uploadLogo = () => {
      fileInput.value?.click()
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          appStore.showError('Размер файла не должен превышать 5 МБ')
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          organization.value.logo = e.target.result
          appStore.showSuccess('Логотип загружен успешно')
        }
        reader.readAsDataURL(file)
      }
    }

    const saveProfile = async () => {
      try {
        // await organizationStore.updateProfile(organization.value)
        console.log('Сохранение организации:', organization.value)
        appStore.showSuccess('Профиль организации сохранен успешно')
      } catch (error) {
        console.error('Error saving organization profile:', error)
        appStore.showError('Ошибка сохранения профиля организации')
      }
    }

    onMounted(async () => {
      try {
        // const savedProfile = await organizationStore.getProfile()
        // Загружается из моковых данных выше
        // if (savedProfile) {
        //   organization.value = { ...organization.value, ...savedProfile }
        // }
      } catch (error) {
        console.error('Error loading organization profile:', error)
      }
    })

    return {
      organization,
      organizationStats,
      industries,
      companySizes,
      countries,
      timezones,
      rules,
      fileInput,
      uploadLogo,
      handleFileUpload,
      saveProfile
    }
  }
}
</script>

<style scoped>
.organization-profile {
  max-width: 100%;
}

.organization-section {
  margin-bottom: 24px;
}

.organization-section:last-child {
  margin-bottom: 0;
}
</style>