<template>
  <div class="local-view">
    <RouterView>
      <template #default="{ Component, route }">
        <Transition>
          <Component :is="Component" :key="route.path" />
        </Transition>
      </template>
    </RouterView>
    <v-dialog v-if="dialog" v-model="dialog" width="30%" height="30%" persistent>
      <v-sheet rounded="lg" class="dialog">
        <div class="options">
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false">
            <v-icon icon="mdi-close" size="x-large"></v-icon>
          </v-btn>
        </div>
        <v-divider thickness="2px" opacity="100" class="divider" color="secondary"
          >选择本地音乐文件目录</v-divider
        >
        <div class="actions">
          <v-btn @click="FGetLocalTracksDir" size="64" variant="text">
            <v-icon icon="mdi-folder" size="64"></v-icon>
          </v-btn>
        </div>
      </v-sheet>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, inject } from 'vue'
  import type { Setting } from '@renderer/utils/setting'
  import { useStateStore } from '@renderer/store/stateStore'
  const stateStore = useStateStore()
  const globalSetting = inject('setting') as Setting
  const dialog = ref(false)
  if (!globalSetting.settings.tracksDir) {
    dialog.value = true
  }
  async function FGetLocalTracksDir() {
    const res = await window.electron.ipcRenderer.invoke('choose-dir')
    if (!res) {
      stateStore.tip = '未选择路径'
      return
    }
    globalSetting.settings.tracksDir = res
    dialog.value = false
    window.location.reload()
  }
</script>

<style lang="scss" scoped>
  .local-view {
    height: 100%;
    width: 100%;
    position: absolute;
  }
  .v-enter-active {
    animation: enter 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  }
  .v-leave-active {
    animation: leave 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  }

  @keyframes leave {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0.5);
      opacity: 0;
    }
  }
  @keyframes enter {
    0% {
      transform: translate(100%, 0%);
    }
    100% {
      transform: translate(0%, 0%);
    }
  }
  .dialog {
    padding: 5% 5% 0% 5%;
    display: flex;
    flex-direction: column;
  }
  .close-btn {
    align-self: end;
  }
  .divider {
    margin: 5px 0px;
  }
  .options {
    display: flex;
    gap: 5px;
  }
  .actions {
    display: flex;
    justify-content: center;
  }
</style>
