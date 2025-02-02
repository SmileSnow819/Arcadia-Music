<template>
  <v-card class="artist-card" variant="text">
    <template #prepend>
      <div class="cover-container" :artist-id="id">
        <v-icon icon="mdi-play" size="x-large" class="play-cover"> </v-icon>
        <v-img
          :width="imgSize"
          rounded="lg"
          aspect-ratio="1"
          cover
          :src="cover.startsWith('http') ? cover + `?param=${imgSize}y${imgSize}` : cover"
          class="cover"
        ></v-img>
      </div>
    </template>
    <template #title>
      {{ name }}
      <span v-if="transName">({{ transName }})</span>
    </template>
    <template #subtitle>
      <div>
        {{ alias }}
      </div>
      <div v-if="artist.tracks">{{ artist.tracks.length }}首</div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
  import { defineProps } from 'vue'
  const props = defineProps({
    artist: Object,
    imgSize: {
      type: Number,
      default: 128
    }
  })
  const artist = props.artist as any
  const imgSize = props.imgSize
  const cover = artist.picUrl
  const name = artist.name
  const transName = artist.trans || ''
  const id = artist.id
  let alias = artist.alias ? artist.alias[0] : ''
</script>

<style lang="scss" scoped>
  .artist-card {
    height: 100%;
    width: 100%;
    border-radius: 20px;
  }
  .artist {
    margin-right: 5px;
    &:last-child {
      margin-right: 0;
    }
    &:hover {
      cursor: pointer;
      color: rgb(var(--v-theme-primary));
    }
  }
  .cover {
    transition: all 0.3s;
  }
  .cover:hover {
    cursor: pointer;
    filter: blur(2px);
  }
  .cover-container {
    position: relative;
    &:hover .play-cover {
      opacity: 1;
    }
  }
  .play-cover {
    opacity: 0;
    position: absolute;
    z-index: 1000;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
</style>
