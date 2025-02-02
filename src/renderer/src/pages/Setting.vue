<template>
  <div class="setting-page">
    <div class="nav-bar">
      <v-btn class="v-btn" variant="text" icon @click="$router.go(-1)">
        <v-icon icon="mdi-arrow-left" size="large"> </v-icon>
      </v-btn>
      <v-spacer class="drag"></v-spacer>
      <Menu />
    </div>
    <div class="setting">
      <v-tabs v-model="tab" color="primary" class="tabs">
        <v-tab value="theme"> 主题 </v-tab>
        <v-tab value="local"> 本地 </v-tab>
        <v-tab value="netEaseCloud"> 网易云 </v-tab>
        <v-tab value="other"> 杂项 </v-tab>
      </v-tabs>
      <v-window v-model="tab" class="tab-window">
        <v-window-item value="theme" class="tab-window-item">
          <Theme />
        </v-window-item>
        <v-window-item value="local" class="tab-window-item">
          <Local />
        </v-window-item>
        <v-window-item value="netEaseCloud" class="tab-window-item">
          <NetEaseCloud />
        </v-window-item>
        <v-window-item value="other" class="tab-window-item">
          <Other />
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Local from '@renderer/components/setting/Local.vue'
  import Theme from '@renderer/components/setting/Theme.vue'
  import NetEaseCloud from '@renderer/components/setting/NetEaseCloud.vue'
  import Other from '@renderer/components/setting/Other.vue'
  import { ref } from 'vue'
  const tab = ref('theme')
</script>

<style lang="scss" scoped>
  .setting-page {
    width: 100vw;
    height: 100vh;
    position: absolute;
    z-index: 2;
  }
  .setting {
    width: 100%;
    height: 100%;
    padding: 8%;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }
  .nav-bar {
    height: 12%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 84%;
    left: 8%;
  }
  .drag {
    height: 100%;
    -webkit-app-region: drag;
  }
  .tab-window {
    flex: 1;
  }
  :deep(.v-window__container) {
    width: 100%;
    height: 100%;
  }
  :deep(.v-input--density-default) {
    --v-input-control-height: 32px;
  }
  :deep(.v-selection-control--density-default) {
    --v-selection-control-size: 32px;
  }
  .tab-window-item {
    width: 100%;
    height: 100%;
  }
</style>
