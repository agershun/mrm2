import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Загружаем переменные окружения
  const env = loadEnv(mode, process.cwd(), '')

  // Парсим хост и порт из VITE_HOST
  const viteHost = env.VITE_HOST || 'http://localhost:5173'
  const url = new URL(viteHost)
  const host = url.hostname
  const port = parseInt(url.port) || 5173

  return {
    plugins: [
      vue(),
      vuetify({
        autoImport: true,
        theme: {
          defaultTheme: 'light'
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
          additionalData: `@use "@/styles/variables.scss" as vars;\n`
        }
      }
    },
    server: {
      host: host,
      port: port,
      strictPort: true,
      open: false, // Можно изменить на true для автоматического открытия браузера
      cors: true,
      proxy: {
        // Проксирование API запросов (если нужно)
        '/api': {
          target: env.VITE_API_URL || viteHost,
          changeOrigin: true,
          secure: false
        }
      }
    },
    preview: {
      host: host,
      port: port + 1, // Порт для preview на 1 больше
      strictPort: true,
      open: false,
      cors: true
    },
    define: {
      // Делаем переменные окружения доступными в приложении
      __VITE_HOST__: JSON.stringify(viteHost),
      __VITE_API_URL__: JSON.stringify(env.VITE_API_URL)
    }
  }
})