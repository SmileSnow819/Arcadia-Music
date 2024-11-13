import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    publicDir: resolve(__dirname, 'resources')
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, './src/renderer/src'),
        '@components': resolve(__dirname, './src/renderer/src/components')
      }
    },
    plugins: [
      vue({
        template: {
          transformAssetUrls,
          compilerOptions: { hoistStatic: false }
        }
      }),
      Vuetify(),
      Components()
    ],
    server: {
      host: process.env.VITE_SERVER_HOST,
      proxy: {
        '/wyyAPI': {
          target: 'http://localhost:26485',
          changeOrigin: true
        }
      }
    },
    html: {
      cspNonce: undefined
    }
  }
})
