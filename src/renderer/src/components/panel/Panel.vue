<template>
  <div class="panel">
    <div class="list">
      <div class="tabs" :style="stateStore.background">
        <v-tabs v-model="tab" color="primary" fixed-tabs height="40px">
          <v-tab value="nowPlaying">
            <v-icon icon="mdi-playlist-music-outline"></v-icon>
          </v-tab>
          <v-tab value="playlist">
            <v-icon icon="mdi-view-list"></v-icon>
          </v-tab>
          <v-tab value="recentPlay">
            <v-icon icon="mdi-folder"></v-icon>
          </v-tab>
        </v-tabs>
      </div>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="nowPlaying" class="item">
          <CurrentPlay />
        </v-tabs-window-item>
        <v-tabs-window-item value="playlist" class="item">
          <UserPlaylist />
        </v-tabs-window-item>
        <v-tabs-window-item value="recentPlay" class="item">
          <RecentPlay />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <div class="canvas">
      <MiniLyric />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import CurrentPlay from './components/CurrentPlay.vue'
  import { ref } from 'vue'
  import UserPlaylist from './components/UserPlaylist.vue'
  import MiniLyric from './components/MiniLyric.vue'
  import { useStateStore } from '@renderer/store/stateStore'
  import RecentPlay from './components/RecentPlay.vue'
  const stateStore = useStateStore()
  const tab = ref('nowPlaying')
</script>

<style lang="scss" scoped>
  .panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 5px;
  }
  .tabs {
    border-radius: 20px 20px 0px 0px;
    backdrop-filter: blur(50px);
    color: rgb(var(--v-theme-on-surface));
  }
  :deep(.v-btn) {
    display: flex;
    padding: 0px;
    font-size: 1.2rem;
  }
  :deep(.v-btn__overlay) {
    display: none;
  }
  :deep(.v-btn__underlay) {
    display: none;
  }
  :deep(.v-btn__content) {
    display: flex;
    padding: 0px;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
  .item {
    width: 100%;
    height: 100%;
  }
  :deep(.v-tabs-window) {
    flex: 1;
  }
  :deep(.v-window__container) {
    width: 100%;
    height: 100%;
  }
  .canvas {
    height: 35%;
    width: 100%;
    border-radius: 20px;
  }
  .list {
    flex: 1;
    gap: 5px;
    display: flex;
    flex-direction: column;
  }
  :deep(::-webkit-scrollbar) {
    width: 5px;
  }
</style>
