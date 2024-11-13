<template>
  <div class="play-btn" :style="stateStore.trackMainColor">
    <v-spacer></v-spacer>
    <v-btn class="v-btn" :ripple="false" variant="text" icon @click="FPlayModeChange">
      <v-icon :icon="MODE[playMode]" size="x-large"> </v-icon>
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn variant="text" :ripple="false" icon class="control-btn" @click="FPreviousSong">
      <v-icon icon="mdi-skip-previous" size="x-large"> </v-icon>
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn size="large" variant="text" :ripple="false" icon class="control-btn" @click="FPlay">
      <v-icon :icon="playState[state]" size="x-large"> </v-icon>
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn variant="text" :ripple="false" icon class="control-btn" @click="FNextSong">
      <v-icon icon="mdi-skip-next" size="x-large"> </v-icon>
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn variant="text" :ripple="false" icon @click="FHeartChange">
      <v-icon
        :icon="stateStore.isHeart ? heartIcon[1] : heartIcon[0]"
        size="x-large"
        :class="{ 'scale-up': heartClicked, 'heart-color': stateStore.isHeart }"
        @animationend="heartClicked = false"
      >
      </v-icon>
    </v-btn>
    <v-spacer></v-spacer>
  </div>
</template>

<script setup lang="ts">
  import { inject, ref, watch, onBeforeUnmount } from 'vue'
  import type Player from '@renderer/utils/player'
  import type { Setting } from '@renderer/utils/setting'
  import { useStateStore } from '@renderer/store/stateStore'
  import { useUserStore } from '@renderer/store/userStore'
  import { preTrack, checkHeart } from '@renderer/hooks/localTrackHook'
  const stateStore = useStateStore()
  const userStore = useUserStore()
  const player = inject('player') as Player
  const globalSetting = inject('setting') as Setting
  const playState = ['mdi-play', 'mdi-pause']
  const heartClicked = ref(false)
  const playMode = ref(player.playMode)
  const heartIcon = ['mdi-heart-outline', 'mdi-heart']
  const MODE = ['mdi-repeat', 'mdi-repeat-once', 'mdi-shuffle-variant', 'mdi-radio-fm']
  const state = ref(player.getPlayState())
  const currentTrack = player.currentTrack
  function FPlayStateChange(isPlaying) {
    isPlaying ? (state.value = 1) : (state.value = 0)
    if (currentTrack.value.name && isPlaying) stateStore.tip = '播放：' + currentTrack.value.name
  }
  const ids = player.onPlay(FPlayStateChange)
  onBeforeUnmount(() => {
    player.removeOnPlay(ids)
  })
  watch(
    currentTrack,
    async () => {
      if (player.playMode !== playMode.value) {
        playMode.value = player.playMode
        if (playMode.value === 0) {
          stateStore.tip = '列表循环'
        }
      }
      if (Object.keys(currentTrack.value).length === 0) {
        state.value = 0
        return
      }
      let res = {} as any
      if (currentTrack.value.local) {
        res = await checkHeart([currentTrack.value])
      } else {
        res = await window.api.netEaseCloud.song_like_check([currentTrack.value.id])
      }
      if (res.ids.includes(currentTrack.value.id)) {
        stateStore.isHeart = true
      } else {
        stateStore.isHeart = false
      }
    },
    { immediate: true }
  )

  function FHeartChange() {
    stateStore.isHeart = !stateStore.isHeart
    stateStore.tip = `${currentTrack.value.name} ${stateStore.isHeart ? '添加' : '取消'}喜欢`
    if (currentTrack.value.local) {
      preTrack('heart', [currentTrack.value])
    } else {
      heartClicked.value = true
      window.api.netEaseCloud.song_like(currentTrack.value.id, stateStore.isHeart).then(() => {
        setTimeout(() => {
          userStore.getNetEaseCloudPlaylist()
        }, 1000)
      })
    }
  }
  function FPlayModeChange() {
    if (playMode.value === 3) {
      playMode.value = 0
    } else {
      playMode.value = (playMode.value + 1) % 3
    }

    player.modelChange(playMode.value)
    const modeMap = ['列表循环', '单曲循环', '随机播放']
    stateStore.tip = modeMap[playMode.value]
    //不是随即播放和fm才储存，否则恢复默认模式
    if (playMode.value === 0 || playMode.value === 1) {
      globalSetting.settings.playMode = playMode.value
    } else {
      globalSetting.settings.playMode = 0
    }
  }
  function FNextSong() {
    if (playMode.value === 3) {
      player.getFmTrack()
    } else {
      player.nextPlay()
    }
  }
  function FPreviousSong() {
    player.prePlay()
  }
  function FPlay() {
    player.pause(state.value)
    state.value ? (state.value = 0) : (state.value = 1)
  }
</script>

<style lang="scss" scoped>
  .control-btn {
    transition: all 0.3s;
    &:hover {
      transform: scale(1.2);
    }
  }
  .heart-color {
    color: rgb(239, 79, 79);
  }
  :deep(.v-btn__overlay) {
    display: none;
  }
  .play-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .heart-song {
    transform: scale(1.2);
  }
  @keyframes scale-up {
    0% {
      transform: scale(1);
      animation-timing-function: ease-in;
    }
    50% {
      transform: scale(1.2);
      animation-timing-function: linear;
    }
    100% {
      transform: scale(1);
      animation-timing-function: ease-out;
    }
  }
  .scale-up {
    animation: scale-up 0.5s;
  }
</style>
