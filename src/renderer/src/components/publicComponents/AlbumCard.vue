<template>
  <v-card class="album-card" variant="text">
    <template #prepend>
      <div class="cover-container" :album-id="id">
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
    </template>
    <template #subtitle>
      <div v-if="album.tracks">{{ album.tracks.length }}首</div>
      <span
        v-if="artists"
        v-for="artist in artists"
        :key="artist.id"
        class="artist"
        :artist-id="artist.id"
      >
        {{ artist.name }}
      </span>
    </template>
  </v-card>
</template>

<script setup lang="ts">
  import { defineProps } from 'vue'
  const props = defineProps({
    album: Object,
    imgSize: {
      type: Number,
      default: 128
    }
  })

  const album = props.album as any
  const cover = album.picUrl
  const name = album.name
  const id = album.id
  const artists = album.artists
</script>

<style lang="scss" scoped>
  .album-card {
    height: 100%;
    width: 100%;
    border-radius: 20px;
  }
  .artist {
    transition: all 0.3s;
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
