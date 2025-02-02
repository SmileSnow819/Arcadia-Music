<template>
  <div class="mini-lyric-container" :style="stateStore.background">
    <v-btn class="enter-btn" :ripple="false" variant="text" icon @click="FGotoLyric">
      <v-icon icon="mdi-details" size="small"> </v-icon>
    </v-btn>
    <Lyric v-if="currentTrack.id" />
  </div>
</template>

<script setup lang="ts">
  import Lyric from '@components/playPage/Lyric.vue'
  import { inject } from 'vue'
  import type Player from '@renderer/utils/player'
  import { useStateStore } from '@renderer/store/stateStore'
  import { useRouter } from 'vue-router'
  const router = useRouter()
  const stateStore = useStateStore()
  const player = inject('player') as Player
  const currentTrack = player.currentTrack
  function FGotoLyric() {
    if (currentTrack.value.id) router.push({ name: 'playPage' })
  }
</script>

<style lang="scss" scoped>
  .mini-lyric-container {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
    backdrop-filter: blur(50px);
    border-radius: 20px;
  }
  :deep(.ordinary-lyric) {
    font-size: 1rem;
    opacity: 0.5;
  }
  :deep(.trans-lyric) {
    font-size: 0.8rem;
    opacity: 0.5;
  }
  :deep(.lyric-container) {
    padding: 0;
    min-height: 10px;
  }
  :deep(.active) {
    transform: scale(1.25);
    .ordinary-lyric {
      opacity: 1;
    }
    .trans-lyric {
      opacity: 1;
    }
  }
  :deep(.time) {
    font-size: 0.6rem;
  }
  .enter-btn {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1500;
  }
</style>
