<template>
  <div class="local-option">
    <div class="options">
      <div
        class="option"
        :style="stateStore.background"
        @click="$router.push({ name: 'netEaseCloud' })"
      >
        <h3>返回网易云</h3>
      </div>
      <div class="option" :style="stateStore.background" @click="$router.push({ name: 'local' })">
        <h3>返回本地主页</h3>
      </div>
      <div
        class="option"
        :style="stateStore.background"
        @click="$router.push({ name: 'download' })"
      >
        <h3>查看下载</h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useStateStore } from '@renderer/store/stateStore'

  const stateStore = useStateStore()
</script>

<style lang="scss" scoped>
  .current-playlist {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
  .options {
    width: 100%;
    height: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
  }
  .option {
    border-radius: 5px;
    width: 100%;
    padding: 10px;
    backdrop-filter: blur(50px);
    text-align: center;
    transition: all 0.3s;
    transform: scale(1);
    cursor: pointer;
    &:hover {
      transform: scale(1.1);
    }
  }
</style>
