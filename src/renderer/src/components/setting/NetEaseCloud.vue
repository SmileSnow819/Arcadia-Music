<template>
  <div class="theme">
    <div class="select-container">
      <v-select
        v-model="playQuality"
        :items="qualityChoiceMap"
        item-title="title"
        item-value="value"
        label="播放音质"
        variant="underlined"
        class="select"
      ></v-select>
    </div>

    <!-- <div class="options">
      <div class="option" @click="FResetIndex">
        <h3>重置索引</h3>
        <v-icon icon="mdi-refresh" size="x-large"></v-icon>
        <v-tooltip
          max-width="300"
          activator="parent"
          location="left"
          text="重新构建本地歌曲、歌手、专辑索引来修复本地歌曲错误(注意：此操作会删除所有歌单数据)"
        ></v-tooltip>
      </div>
      <div class="option" @click="FSelectPath">
        <h3>选择路径</h3>
        <v-icon icon="mdi-folder" size="x-large"></v-icon>
        <v-tooltip
          max-width="300"
          activator="parent"
          location="left"
          text="更改本地歌曲的保存和读取目录"
        ></v-tooltip>
      </div>
      <div class="option">
        <h3>图片背景</h3>
        <v-icon icon="mdi-upload" size="x-large"></v-icon>
        <v-tooltip
          max-width="300"
          activator="parent"
          location="left"
          text="上传图片后设置背景色将失效，需要恢复默认后才能使用"
        ></v-tooltip>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
  import { ref, inject, watch } from 'vue'
  import { type Setting } from '@renderer/utils/setting'
  import { useStateStore } from '@renderer/store/stateStore'
  const stateStore = useStateStore()
  const globalSetting = inject('setting') as Setting
  const qualityChoiceMap = [
    { title: '标准', value: 'standard' },
    { title: '极高', value: 'exhigh' },
    { title: '无损', value: 'lossless' },
    { title: 'Hi-Res', value: 'hires' },
    { title: '高清环绕声', value: 'jyeffect' },
    { title: '沉浸环绕声', value: 'sky' },
    { title: '超清母带', value: 'jymaster' }
  ]

  const playQuality = ref(globalSetting.settings.playQuality)
  watch(playQuality, () => {
    globalSetting.settings.playQuality = playQuality.value
    stateStore.tip = '播放音质： ' + playQuality.value
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
