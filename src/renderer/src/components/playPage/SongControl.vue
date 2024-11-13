<template>
  <div class="song-control">
    <div class="song-control-container-horizontal" @contextmenu.prevent="FCopy">
      <div class="song-control-container-vertical">
        <v-img
          v-if="currentTrack.al.picUrl"
          cover
          aspect-ratio="1"
          rounded="xl"
          :src="coverImg"
          class="cover"
        ></v-img>
        <div
          v-if="horizontalInfo.name"
          :class="{
            'appear-animation-horizontal': !isVertical,
            'disappear-animation-horizontal': isVertical
          }"
          class="container-horizontal"
        >
          <v-divider thickness="2px" opacity="100" class="divider-vertical" vertical></v-divider>
          <div style="position: relative; flex: 1">
            <div class="song-info-container-horizontal">
              <div
                class="song-album text-horizontal"
                @click="FLookAlbum(horizontalInfo.al.id)"
                song-name
              >
                {{ horizontalInfo.name }}
              </div>
              -
              <div
                v-for="ar in horizontalInfo.ar.slice(0, 2)"
                :key="ar.id"
                class="song-artist text-horizontal"
                @click="FLookArtist(ar.id)"
                artist-id
              >
                {{ ar.name }}
              </div>
              <div v-if="horizontalInfo.ar.length > 3">...</div>
            </div>
          </div>
        </div>
        <ProgressLinear />
        <div class="volume-and-time">
          <VolumeBar></VolumeBar>
          <v-spacer></v-spacer>
          <div class="current-time">{{ currentMinutes() }}:{{ currentSeconds() }}</div>
          <div class="total-time">/ {{ minutes }}:{{ seconds }}</div>
        </div>
        <PlayBtn />
      </div>
      <div class="placeholder-vertical">
        <div
          v-if="verticalInfo.name"
          :class="{
            'appear-animation-vertical': isVertical,
            'disappear-animation-vertical': !isVertical
          }"
          class="container-vertical"
        >
          <v-divider thickness="2px" opacity="100" class="divider" color="secondary"></v-divider>
          <div style="position: relative; flex: 1">
            <div class="song-info-container">
              <div
                class="song-album text-vertical"
                @click="FLookAlbum(verticalInfo.al.id)"
                song-name
              >
                {{ verticalInfo.name }}
              </div>
              <div class="text-vertical">-</div>
              <div
                v-for="ar in verticalInfo.ar.slice(0, 2)"
                :key="ar.id"
                class="song-artist text-vertical"
                @click="FLookArtist(ar.id)"
                artist-id
              >
                {{ ar.name }}
              </div>
              <div v-if="verticalInfo.ar.length > 3">...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import PlayBtn from '../player/components/PlayBtn.vue'
  import ProgressLinear from '../player/components/ProgressLinear.vue'
  import { computed, inject, defineProps, ref, onUnmounted, watch } from 'vue'
  import type Player from '@renderer/utils/player'
  import { useRouter } from 'vue-router'
  import VolumeBar from '../player/components/VolumeBar.vue'
  import { useStateStore } from '@renderer/store/stateStore'

  const stateStore = useStateStore()
  const props = defineProps({
    imgSize: {
      type: Number,
      default: 450
    }
  })
  const imgSize = props.imgSize
  const coverImg = computed(() => {
    if (currentTrack.value.local) {
      return currentTrack.value.al.picUrl
    } else {
      return currentTrack.value.al.picUrl + `?param=${imgSize}y${imgSize}`
    }
  })
  const seconds = ref('00')
  const minutes = ref('00')
  const currentTime = ref(0)
  const currentMinutes = () => {
    return Math.floor(currentTime.value / 60)
      .toString()
      .padStart(2, '0')
  }
  const currentSeconds = () => {
    return Math.floor(currentTime.value % 60)
      .toString()
      .padStart(2, '0')
  }
  const router = useRouter()
  const player = inject('player') as Player
  const currentTrack = player.currentTrack
  const verticalInfo = ref({}) as any
  const horizontalInfo = ref({}) as any
  function FIsVertical() {
    const info = currentTrack.value.name + currentTrack.value.ar.map((ar) => ar.name).join('')
    //如果有字母，显示为横向
    return !/[a-zA-Z]/.test(info)
  }
  //当前歌曲是否是垂直显示信息
  const isVertical = ref(FIsVertical())
  function FLookArtist(id: number) {
    if (!currentTrack.value.al.id) return
    if (currentTrack.value.local) {
      router.push({ name: 'localArtist', params: { id: id } })
    } else {
      router.push({ name: 'artist', params: { id: id } })
    }
  }
  function FLookAlbum(id: number) {
    if (!currentTrack.value.al.id) return
    if (currentTrack.value.local) {
      router.push({ name: 'localAlbum', params: { id: id } })
    } else {
      router.push({ name: 'album', params: { id: id } })
    }
  }
  function FCopy(event) {
    let text = ''
    if (
      event.target.hasAttribute('artist-id') ||
      event.target.hasAttribute('song-name') ||
      event.target.hasAttribute('album-id')
    ) {
      text = event.target.textContent
      stateStore.tip = '复制：' + text
      navigator.clipboard.writeText(text)
    }
  }
  watch(
    currentTrack,
    () => {
      //改变时长
      const dt = Math.floor(currentTrack.value.dt / 1000 || currentTrack.value.duration / 1000)
      seconds.value = Math.floor(dt % 60)
        .toString()
        .padStart(2, '0')
      minutes.value = Math.floor(dt / 60)
        .toString()
        .padStart(2, '0')
      //确定水平还是垂直显示信息
      isVertical.value = FIsVertical()
      //更新正确的信息
      if (isVertical.value) {
        verticalInfo.value = currentTrack.value
      } else {
        horizontalInfo.value = currentTrack.value
      }
    },
    { immediate: true }
  )
  let preTime = 0
  const f = player.onTimeUpdate((time) => {
    if (Math.abs(time - preTime) < 1) return
    preTime = Math.floor(time)
    currentTime.value = preTime
  })
  onUnmounted(() => {
    player.removeTimeUpdate(f)
  })
</script>

<style lang="scss" scoped>
  .cover {
    width: 100%;
    transition: all 0.3s;
  }
  .song-control {
    display: flex;
    height: 100%;
    width: 100%;
    align-items: center;
  }
  .song-control-container-horizontal {
    width: 100%;
    display: flex;
    gap: 10px;
    transition: all 0.3s;
  }
  .song-control-container-vertical {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: all 0.3s;
  }
  .container-horizontal {
    width: 100%;
    position: relative;
    display: flex;
  }
  .container-vertical {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .placeholder-vertical {
    width: 2rem;
    position: relative;
    display: flex;
  }
  .song-info-container {
    display: flex;
    gap: 5px;
    flex-direction: column;
    position: absolute;
    // transform: translate(-50%, -50%);
  }
  .song-info-container-horizontal {
    width: 100%;
    height: 100%;
    gap: 5px;
    display: flex;
    place-items: center;
    overflow: hidden;
    position: absolute;
  }
  .text-vertical {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    writing-mode: vertical-rl;
    font-size: 1.3rem;
    max-height: 30%;
  }
  .text-horizontal {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: 1.3rem;
    max-width: 30%;
  }
  .song-artist,
  .song-album {
    transition: all 0.3s;
    text-orientation: upright;
    cursor: pointer;
  }
  .song-album {
    &:hover {
      color: rgb(var(--v-theme-secondary));
    }
  }
  .song-artist {
    &:hover {
      color: rgb(var(--v-theme-primary));
    }
  }
  .divider {
    width: 100%;
    margin: 5px 0px;
  }
  .divider-vertical {
    height: 100%;
    margin: 0px 5px;
  }
  .volume-and-time {
    width: 100%;
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
  }
  :deep(.volume-bar) {
    .linear {
      height: 5px;
    }
    .icon {
      height: 10px;
      width: 10px;
    }
    width: 60%;
    button {
      display: none;
    }
  }
  @keyframes appearH {
    0% {
      opacity: 0;
      height: 0;
    }
    100% {
      opacity: 1;
      height: 2rem;
    }
  }
  @keyframes disappearH {
    0% {
      opacity: 1;
      height: 2rem;
    }
    100% {
      opacity: 0;
      height: 0;
    }
  }
  @keyframes appearV {
    0% {
      opacity: 0;
      height: 0;
    }
    100% {
      opacity: 1;
      height: 100%;
    }
  }
  @keyframes disappearV {
    0% {
      opacity: 1;
      height: 100%;
    }
    100% {
      opacity: 0;
      height: 0;
    }
  }
  .disappear-animation-horizontal {
    animation: disappearH 0.5s forwards;
  }
  .appear-animation-horizontal {
    animation: appearH 0.5s forwards;
  }
  .disappear-animation-vertical {
    animation: disappearV 0.5s forwards;
  }
  .appear-animation-vertical {
    animation: appearV 0.5s forwards;
  }
  .current-time,
  .total-time {
    z-index: 1000;
  }
</style>
