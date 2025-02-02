/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import { Setting } from '@renderer/utils/setting'

let globalSetting = new Setting() as any

const myCustomTheme: ThemeDefinition = {
  dark: true,
  colors: { ...globalSetting.settings.theme.colors } as any,
  variables: {}
}
const bufferTheme: ThemeDefinition = {
  dark: true,
  colors: { ...globalSetting.settings.theme.colors } as any,
  variables: {}
}
const theme = {
  defaultTheme: globalSetting.settings.theme.darkMode ? 'dark' : 'myCustomTheme',
  themes: {
    myCustomTheme,
    bufferTheme
  }
}
//删除临时的设置对象
globalSetting = null
export default createVuetify({
  theme
})
