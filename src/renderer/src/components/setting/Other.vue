<template>
  <div class="theme">
    <div class="select-container">
      <v-select
        v-model="homePage"
        :items="homePageMap"
        item-title="title"
        item-value="value"
        label="主页"
        variant="underlined"
        class="select"
      ></v-select>
    </div>
    <div>
      <h3>关闭时行为</h3>
      <v-radio-group v-model="behavior">
        <v-radio label="询问" value="query"></v-radio>
        <v-radio label="关闭应用" value="close"></v-radio>
        <v-radio label="最小化" value="minimize"></v-radio>
      </v-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, inject, watch } from 'vue'
  import { type Setting } from '@renderer/utils/setting'
  import { useStateStore } from '@renderer/store/stateStore'
  const stateStore = useStateStore()
  const globalSetting = inject('setting') as Setting
  const homePageMap = [
    { title: '本地', value: 'local' },
    { title: '网易云', value: 'netEaseCloud' }
  ]
  const behaviorMap = {
    query: '询问',
    close: '关闭应用',
    minimize: '最小化'
  }

  const behavior = ref(globalSetting.settings.behaviorWhenClose)

  const homePage = ref(globalSetting.settings.homePage)
  watch(homePage, () => {
    globalSetting.settings.homePage = homePage.value
    stateStore.tip = '更改主页： ' + homePage.value
  })
  watch(behavior, () => {
    globalSetting.settings.behaviorWhenClose = behavior.value
    stateStore.tip = '更改行为： ' + behaviorMap[behavior.value]
  })

  // async function FResetIndex() {
  //   init(globalSetting.settings.tracksDir)
  //   stateStore.tip = '重置完成'
  // }
  // async function FSelectPath() {
  //   const res = await window.electron.ipcRenderer.invoke('choose-dir')
  //   if (!res) {
  //     stateStore.tip = '未选择路径'
  //     return
  //   }
  //   globalSetting.settings.tracksDir = res
  //   await init(globalSetting.settings.tracksDir)
  //   window.location.reload()
  // }
</script>

<style lang="scss" scoped>
  .theme {
    width: 100%;
    height: 100%;
    padding: 8%;
    overflow: auto;
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }
  .select-container {
    width: 200px;
    border-radius: 10px;
  }
  .select {
    backdrop-filter: blur(50px);
    padding: 10px;
    border-radius: 10px;
  }
  .options {
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
    transition: all 0.3s;
    transform: scale(1);
    cursor: pointer;
    &:hover {
      transform: scale(1.1);
    }
  }
</style>
