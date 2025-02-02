<template>
  <div class="song-card" :track-index="index">
    <slot name="index"></slot>
    <v-card class="song-info" variant="text">
      <template #prepend>
        <div class="song-cover-container">
          <div class="play-icon-container" :img-id="id">
            <v-icon icon="mdi-play" size="x-large" class="play-icon"> </v-icon>
          </div>
          <v-img
            class="song-cover"
            :width="imgSize"
            rounded="lg"
            aspect-ratio="1"
            cover
            :src="cover"
          >
          </v-img>
        </div>
      </template>
      <template #title>
        <div class="song-name-container" :track-id="id">
          <div class="song-name text" :song-name="name" :album-id="album.id">{{ name }}</div>
          <div v-if="song.tns && showAlbum" class="song-tns text">({{ song.tns[0] }})</div>
        </div>
      </template>
      <template #subtitle>
        <div class="song-artist-album-container" :track-id="id">
          <div
            v-for="artist in artists"
            :key="artist.id"
            class="song-artist text"
            :artist-id="artist.id"
          >
            {{ artist.name }}
          </div>
          <div v-if="showAlbum && album.id">-</div>
          <div v-if="showAlbum && album.id" class="song-album text" :album-id="album.id">
            {{ album.name }}
          </div>
        </div>
      </template>
      <template #append>
        <div class="song-slot">
          <span v-if="showTime">{{ minutes }}:{{ seconds }}</span>
          <v-btn v-if="heart.showHeart" variant="text" :ripple="false" icon :is-heart="id">
            <v-icon
              :icon="heart.isHeart ? heartIcon[1] : heartIcon[0]"
              size="large"
              :color="heart.isHeart ? 'rgb(239, 79, 79)' : 'rgb(var(--v-theme-on-surface))'"
            >
            </v-icon>
          </v-btn>
          <slot></slot>
        </div>
      </template>
    </v-card>
  </div>
</template>

<script setup lang="ts">
  import { defineProps } from 'vue'
  import defaultImg from '@renderer/public/test.png'
  // import { useRouter } from 'vue-router'
  // import type Player from '@renderer/utils/player'

  // const player = inject('player') as Player
  // const router = useRouter()
  const props = defineProps({
    song: {
      type: Object,
      default: {
        al: {}
      }
    },
    imgSize: { type: Number, default: 64 },
    showAlbum: { type: Boolean, default: true },
    showTime: { type: Boolean, default: true },
    index: { type: Number, default: 0 },
    heart: {
      type: Object,
      default: {
        showHeart: false,
        isHeart: true
      }
    }
  })
  const song = props.song as any
  const imgSize = props.imgSize
  const showAlbum = props.showAlbum
  const showTime = props.showTime
  const heartIcon = ['mdi-heart-outline', 'mdi-heart']
  let name = song.name
  let dt = Math.floor(song.dt / 1000 || song.duration / 1000)
  let seconds = Math.floor(dt % 60)
    .toString()
    .padStart(2, '0')
  let minutes = Math.floor(dt / 60)
    .toString()
    .padStart(2, '0')
  let id = song.id
  let artists = song.ar
  let album = song.al
  let cover = song.al.picUrl
  if (cover) cover = cover.startsWith('http') ? cover + `?param=${imgSize}y${imgSize}` : cover
  else cover = defaultImg
</script>

<style lang="scss" scoped>
  .song-card {
    width: 100%;
    position: relative;
  }
  .song-info {
    border-radius: 15px;
    // margin: 2.5px;
    &:hover {
      background-color: rgb(var(--v-theme-surface));
    }
  }
  .song-name-container {
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
  }
  .song-artist-album-container {
    display: flex;
    flex-wrap: nowrap;
    gap: 5px;
    opacity: 0.6;
  }
  .text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.3s;
  }
  .song-name {
    cursor: pointer;
    &:hover {
      opacity: 1;
      color: rgb(var(--v-theme-secondary));
    }
  }
  .song-album {
    cursor: pointer;
    &:hover {
      opacity: 1;
      color: rgb(var(--v-theme-secondary));
    }
  }
  .song-artist {
    cursor: pointer;
    &:hover {
      opacity: 1;
      color: rgb(var(--v-theme-primary));
    }
  }
  .song-tns {
    opacity: 0.6;
    font-size: 1rem;
  }
  .song-cover-container {
    position: relative;
  }
  .play-icon-container {
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: all 0.3s;
    &:hover .play-icon {
      opacity: 1;
    }
    &:hover {
      backdrop-filter: blur(2px);
      cursor: pointer;
    }
  }
  .play-icon {
    transition: all 0.3s;
    opacity: 0;
    pointer-events: none;
  }
  .song-slot {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .heart-container {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1000;
  }
  :deep(.v-btn__overlay) {
    display: none;
  }
</style>
