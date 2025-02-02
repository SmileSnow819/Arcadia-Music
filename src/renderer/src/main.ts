/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import App from './App.vue'
import { Setting } from './utils/setting'
import { createApp } from 'vue'
const app = createApp(App)
app.provide('setting', new Setting())
app.provide('player', new Player())
import Player from './utils/player'
import { registerPlugins } from './plugins'
registerPlugins(app)
app.mount('#app')
