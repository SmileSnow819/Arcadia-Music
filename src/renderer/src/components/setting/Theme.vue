<template>
  <div class="theme">
    <div class="theme-color">
      <h2
        v-for="(name, i) in Object.keys(themeDefine.colors as any)"
        :key="name"
        class="color-item"
      >
        <div class="color-name">{{ name }}</div>
        <v-btn :ripple="false" variant="text" icon size="large" @click="index = name">
          <div class="color-value" :style="{ backgroundColor: themeDefine.colors[name] }"></div>
          <v-tooltip activator="parent" location="top" :text="toolTip[i]"></v-tooltip>
        </v-btn>
        <v-icon
          v-if="index === name"
          icon="mdi-arrow-left"
          color="on-background"
          class="arrow"
        ></v-icon>
      </h2>
    </div>
    <v-color-picker
      v-model="themeDefine.colors[index]"
      show-swatches
      class="color-picker"
      canvas-height="200"
      width="30%"
      swatches-max-height="200"
    ></v-color-picker>
    <div class="theme-custom">
      <v-tabs class="tabs" v-model="tab" color="primary" fixed-tabs>
        <v-tab value="custom">保存</v-tab>
        <v-tab value="buffer">预设</v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item value="custom">
          <div v-for="theme in customThemes" :key="theme.name" class="theme-option">
            <div>{{ theme.name }}</div>
            <v-spacer></v-spacer>
            <v-btn :ripple="false" variant="text" icon @click="FLoadTheme(theme)">
              <v-icon icon="mdi-upload" size="x-large"></v-icon>
              <v-tooltip activator="parent" location="top" text="加载"></v-tooltip>
            </v-btn>
            <v-btn :ripple="false" variant="text" icon @click="FDeleteTheme(theme)">
              <v-icon icon="mdi-delete" size="x-large"></v-icon>
              <v-tooltip activator="parent" location="top" text="删除"></v-tooltip>
            </v-btn>
          </div>
        </v-window-item>
        <v-window-item value="buffer">
          <div v-for="theme in presetThemes" :key="theme.name" class="theme-option">
            <div>{{ theme.name }}</div>
            <v-btn :ripple="false" variant="text" icon @click="FLoadTheme(theme)">
              <v-icon icon="mdi-upload" size="x-large"></v-icon>
            </v-btn>
          </div>
        </v-window-item>
      </v-window>
    </div>
    <div class="options">
      <div class="option" @click="FUseTheme">
        <h3>使用主题</h3>
        <v-icon icon="mdi-check" size="x-large"></v-icon>
      </div>
      <div class="option" @click="saveThemeDialog = true">
        <h3>保存主题</h3>
        <v-icon icon="mdi-content-save" size="x-large"></v-icon>
      </div>
      <div class="option" @click="FResetTheme">
        <h3>恢复默认</h3>
        <v-icon icon="mdi-reload" size="x-large"></v-icon>
      </div>
      <div class="option" @click="FSetAutoColor">
        <h3>自动颜色</h3>
        <v-switch :model-value="autoColor" hide-details color="primary" height="40"> </v-switch>
        <v-tooltip
          max-width="300"
          activator="parent"
          location="right"
          text="设置播放条和按钮是否自动取色"
        ></v-tooltip>
      </div>
      <div class="option" @click="FDeskLyricAutoColor">
        <h3>歌词颜色</h3>
        <v-switch :model-value="deskLyricAutoColor" hide-details color="primary" height="40">
        </v-switch>
        <v-tooltip
          max-width="300"
          activator="parent"
          location="right"
          text="设置桌面歌词是否自动取色"
        ></v-tooltip>
      </div>
      <div class="option">
        <h3>歌词大小</h3>
        <v-text-field
          density="compact"
          variant="outlined"
          color="on-secondary"
          hide-details
          v-model="deskLyricSize"
          @keyup.enter="FSetDeskLyricSize"
          width="32"
          class="font-size"
        ></v-text-field>
        <v-tooltip
          max-width="300"
          activator="parent"
          location="right"
          text="1-5之间，按回车确认"
        ></v-tooltip>
      </div>
      <div class="option" @click="FToggleTheme">
        <h3>夜间模式</h3>
        <v-switch :model-value="darkMode" hide-details color="primary" :min-height="40"> </v-switch>
      </div>
      <div class="option" @click="FImageBackground">
        <h3>图片背景</h3>
        <v-icon icon="mdi-upload" size="x-large"></v-icon>
        <v-tooltip
          max-width="300"
          activator="parent"
          location="right"
          text="上传图片后设置背景色将失效，需要恢复默认后才能使用"
        ></v-tooltip>
      </div>
    </div>
    <ThemeSelectDialogs v-if="saveThemeDialog" @close-dialog="FSaveTheme"></ThemeSelectDialogs>
  </div>
</template>

<script setup lang="ts">
  import { ref, inject, watch } from 'vue'
  import { useTheme } from 'vuetify'
  import { type Setting } from '@renderer/utils/setting'
  import ThemeSelectDialogs from '../publicComponents/ThemeSelectDialogs.vue'
  import { useStateStore } from '@renderer/store/stateStore'
  const stateStore = useStateStore()
  const globalSetting = inject('setting') as Setting
  const theme = useTheme()
  const autoColor = ref(globalSetting.settings.theme.autoColor)
  const deskLyricAutoColor = ref(globalSetting.settings.theme.deskLyricAutoColor)
  const darkMode = ref(globalSetting.settings.theme.darkMode)
  const deskLyricSize = ref(globalSetting.settings.theme.deskLyricSize)
  const customThemes = ref(globalSetting.settings.theme.customThemes)
  const presetThemes = ref(globalSetting.settings.theme.presetThemes)
  const themeDefine = ref({}) as any
  const deskLyricColor = ref(globalSetting.settings.theme.deskLyricFontColor)
  const saveThemeDialog = ref(false)
  const tab = ref('custom')
  function FUpdateLyricColor() {
    const color = globalSetting.settings.theme.deskLyricAutoColor
      ? stateStore.trackMainColor.color
      : globalSetting.settings.theme.deskLyricFontColor
    const fontSize = globalSetting.settings.theme.deskLyricSize + 'rem'
    window.electron.ipcRenderer.send('update-lyric', {
      style: {
        color,
        fontSize
      }
    })
  }
  watch(deskLyricColor, () => {
    globalSetting.settings.theme.deskLyricFontColor = deskLyricColor.value
    FUpdateLyricColor()
  })
  watch(
    theme.global.name,
    () => {
      const currentTheme = theme.computedThemes.value[theme.global.name.value]
      themeDefine.value = {
        dark: true,
        colors: {
          background: currentTheme.colors.background as string,
          surface: currentTheme.colors.surface as string,
          primary: currentTheme.colors.primary as string,
          secondary: currentTheme.colors.secondary as string,
          'on-background': currentTheme.colors['on-background'] as string,
          'on-surface': currentTheme.colors['on-surface'] as string,
          deskTopLyric: deskLyricColor
        }
      }
    },
    { immediate: true }
  )

  const toolTip = [
    '背景色',
    '前景色',
    '主要色',
    '辅助色',
    '背景上的字体色',
    '前景上的字体色',
    '桌面歌词颜色'
  ]
  const index = ref('background')
  const myCustomLightThemeDef = theme.computedThemes.value['myCustomTheme'] as any
  const bufferThemeDef = theme.computedThemes.value['bufferTheme'] as any
  function FUseTheme() {
    //取消夜间模式
    darkMode.value = false
    globalSetting.settings.theme.darkMode = darkMode.value
    for (const key of Object.keys(themeDefine.value.colors)) {
      if (key === 'deskTopLyric') continue
      myCustomLightThemeDef.colors[key] = themeDefine.value.colors[key]
      bufferThemeDef.colors[key] = themeDefine.value.colors[key]
    }
    theme.global.name.value === 'myCustomTheme'
      ? (theme.global.name.value = 'bufferTheme')
      : (theme.global.name.value = 'myCustomTheme')
    globalSetting.settings.theme.colors = themeDefine.value.colors
  }

  function FToggleTheme() {
    darkMode.value = !darkMode.value
    theme.global.name.value = darkMode.value ? 'dark' : 'light'
    stateStore.tip = '切换主题： ' + theme.global.name.value
    globalSetting.settings.theme.darkMode = darkMode.value
  }
  function FSetAutoColor() {
    autoColor.value = !autoColor.value
    if (autoColor.value) stateStore.tip = '设置自动颜色'
    else stateStore.tip = '关闭自动颜色'

    globalSetting.settings.theme.autoColor = autoColor.value
  }
  function FDeskLyricAutoColor() {
    deskLyricAutoColor.value = !deskLyricAutoColor.value
    if (deskLyricAutoColor.value) stateStore.tip = '设置桌面歌词自动颜色'
    else stateStore.tip = '关闭桌面歌词自动颜色'
    globalSetting.settings.theme.deskLyricAutoColor = deskLyricAutoColor.value
    FUpdateLyricColor()
  }
  function FImageBackground() {
    window.electron.ipcRenderer.invoke('custom-img-background').then((img: any) => {
      if (!img) {
        stateStore.tip = '未选择图片'
        return
      }
      stateStore.tip = '使用图片背景'
      globalSetting.settings.imgDir = img
      stateStore.background.background = 'none'
      window.electron.ipcRenderer
        .invoke('read-img', globalSetting.settings.imgDir)
        .then((img: Uint8Array) => {
          //转化为二进制
          const blob = new Blob([img])
          stateStore.backgroundImage.backgroundImage = `url(${URL.createObjectURL(blob)})`
        })
    })
  }
  function FResetTheme() {
    //重置自定义主题的颜色
    stateStore.tip = '重置成功'
    const darkThem = theme.computedThemes.value['dark'] as any
    for (const key of Object.keys(themeDefine.value.colors)) {
      themeDefine.value.colors[key] = darkThem.colors[key]
    }
    //重置自动取色
    autoColor.value = true
    globalSetting.settings.theme.autoColor = autoColor.value
    //重置主题
    globalSetting.settings.imgDir = ''
    stateStore.background.background = 'rgb(var(--v-theme-surface))'
    stateStore.backgroundImage.backgroundImage = ''
    FUseTheme()
  }
  function FLoadTheme(theme: any) {
    stateStore.tip = '加载主题： ' + theme.name
    themeDefine.value.colors = theme.colors
    FUseTheme()
  }
  function FDeleteTheme(theme: any) {
    customThemes.value = customThemes.value.filter((item: any) => item.name !== theme.name)
    globalSetting.settings.theme.customThemes = customThemes.value
    stateStore.tip = '删除主题成功'
  }
  function FSaveTheme(name: string | undefined) {
    if (name) {
      stateStore.tip = '保存主题成功'
      const theme = {
        name,
        colors: { ...themeDefine.value.colors }
      }
      //删除桌面歌词属性
      delete theme.colors.deskTopLyric
      customThemes.value.push(theme)
      globalSetting.settings.theme.customThemes = customThemes.value
    }
    saveThemeDialog.value = false
  }
  function FSetDeskLyricSize() {
    if (deskLyricSize.value > 5) deskLyricSize.value = 5
    if (deskLyricSize.value < 1) deskLyricSize.value = 1
    stateStore.tip = '设置歌词大小为' + deskLyricSize.value
    globalSetting.settings.theme.deskLyricSize = deskLyricSize.value
    FUpdateLyricColor()
  }
</script>

<style lang="scss" scoped>
  .theme {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .theme-color {
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: flex-end;
    position: relative;
  }
  .arrow {
    position: absolute;
    left: 100%;
  }
  .theme-define {
    display: flex;
    height: 100%;
    gap: 30px;
  }
  .theme-custom {
    overflow: auto;
    min-width: 20%;
    height: 100%;
    border-radius: 20px;
  }
  .theme-option {
    width: 100%;
    padding: 2% 8%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    opacity: 0.5;
    transition: all 0.3s;
    border-radius: 20px;
    &:hover {
      opacity: 1;
      background-color: rgb(var(--v-theme-surface));
    }
  }
  .color-item {
    flex-grow: 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .color-value {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
  .color-picker {
    align-self: center;
    max-height: 100%;
    min-width: 20%;
  }
  .options {
    height: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
  }
  .option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  .active {
    transform: scale(1.1);
  }
  .font-size {
    height: 32px !important;
  }
  :deep(.v-input--density-compact) {
    --v-input-control-height: 32px;
  }
  :deep(.v-field__input) {
    padding-inline: 0;
    padding-inline-start: 3px;
  }
  :deep(.v-field) {
    --v-field-input-padding-top: 0px;
  }
  :deep(.v-field--no-label) {
    --v-field-padding-bottom: 0px;
  }
</style>
