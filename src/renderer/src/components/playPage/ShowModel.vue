<template>
  <div class="show-model-container">
    <!-- <v-switch
      class="switch-btn"
      v-model="model"
      hide-details
      :color="stateStore.trackMainColor.color"
      @click="switchModel"
    ></v-switch> -->

    <v-tabs-window v-model="model">
      <v-tabs-window-item v-if="model === 'lyric'" value="lyric">
        <Lyric />
      </v-tabs-window-item>
      <v-tabs-window-item v-if="model === 'frequency'" value="frequency">
        <Frequency />
      </v-tabs-window-item>
      <v-tabs-window-item v-if="model === 'comment'" value="comment">
        <Comment />
      </v-tabs-window-item>
    </v-tabs-window>
    <v-tabs
      class="switch-btn"
      v-model="model"
      :color="stateStore.trackMainColor.color"
      direction="vertical"
    >
      <v-tab value="lyric">
        <v-icon icon="mdi-text" class="btn"></v-icon>
      </v-tab>
      <v-tab value="frequency">
        <v-icon icon="mdi-sine-wave" class="btn"></v-icon>
      </v-tab>
      <v-tab v-if="!currentTrack.local" value="comment">
        <v-icon icon="mdi-comment-outline" class="btn"></v-icon>
      </v-tab>
    </v-tabs>
  </div>
</template>

<script setup lang="ts">
  import Lyric from './Lyric.vue'
  import Frequency from './Frequency.vue'
  import Comment from '../publicComponents/Comment.vue'
  import { ref, inject } from 'vue'
  import { useStateStore } from '@renderer/store/stateStore'
  import type Player from '@renderer/utils/player'
  const player = inject('player') as Player
  const currentTrack = player.currentTrack
  const stateStore = useStateStore()
  const model = ref('lyric')
</script>

<style lang="scss" scoped>
  .show-model-container {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
  }

  .btn {
    font-size: 24px;
  }

  :deep(.v-window-item) {
    width: 100%;
    height: 100%;
  }
  :deep(.v-tabs-window) {
    width: 100%;
    height: 100%;
  }
  :deep(.v-tab.v-tab.v-btn) {
    min-width: none;
  }
</style>
