<template>
  <div class="playlist-card">
    <v-card class="playlist-info" variant="text">
      <template #prepend>
        <div class="playlist-cover-container" :playlist-id="id">
          <v-icon icon="mdi-play" size="x-large" class="play-icon"> </v-icon>
          <v-img
            rounded="lg"
            cover
            :src="cover.startsWith('http') ? cover + `?param=${imgSize}y${imgSize}` : cover"
            :width="imgSize"
            aspect-ratio="1"
            class="playlist-cover"
          >
          </v-img>
        </div>
      </template>
      <template #title>
        <div class="playlist-name">{{ name }}</div>
      </template>
      <template #subtitle>
        <div class="playlist-length">{{ length }}首</div>
      </template>
      <template #append>
        <div class="playlist-slot">
          <slot></slot>
        </div>
      </template>
    </v-card>
  </div>
</template>

<script setup lang="ts">
  import { defineProps } from 'vue'
  const props = defineProps({
    playlist: Object,
    imgSize: { type: Number, default: 128 }
  })
  const playlist = props.playlist
  const cover = playlist?.coverImgUrl || playlist?.picUrl
  const name = playlist?.name
  const id = playlist?.id
  const length = playlist?.trackCount
</script>

<style lang="scss" scoped>
  .playlist-card {
    width: 100%;
    position: relative;
  }
  .playlist-info {
    margin: 5px;
    border-radius: 15px;
    &:hover {
      background-color: rgb(var(--v-theme-surface));
    }
  }
  .playlist-cover:hover {
    cursor: pointer;
    filter: blur(2px);
  }
  .playlist-cover-container {
    position: relative;
    &:hover .play-icon {
      opacity: 1;
    }
  }
  .play-icon {
    opacity: 0;
    position: absolute;
    z-index: 1000;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .playlist-name,
  .playlist-length {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .playlist-name {
    font-size: 1.3rem;
  }
  .playlist-length {
    font-size: 1rem;
  }
  .playlist-slot {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  :deep(.v-btn__overlay) {
    display: none;
  }
</style>
