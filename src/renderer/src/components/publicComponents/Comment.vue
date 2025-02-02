<template>
  <div class="comment-container">
    <v-tabs v-model="tab" color="primary">
      <v-tab value="time"> 时间 </v-tab>
      <v-tab value="hot"> 热门 </v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="time">
        <div class="comment-content">
          <div class="single-comment" v-for="comment in comments">
            <v-card variant="text">
              <template #prepend>
                <div class="user-avatar">
                  <v-avatar :image="comment.user.avatarUrl" size="48"></v-avatar>
                </div>
              </template>
              <template #title>
                <div class="user-name">{{ comment.user.nickname }}</div>
              </template>
              <template #subtitle>
                <span class="comment-time">
                  {{ formatTime(comment.time) }}
                </span>
                <span class="location">
                  {{ comment.ipLocation.location }}
                </span>
              </template>
              <template #text>
                <div class="comment-text">{{ comment.content }}</div>
              </template>
            </v-card>
            <v-divider thickness="1px" opacity="100" class="divider"></v-divider>
          </div>
        </div>
      </v-tabs-window-item>
      <v-tabs-window-item value="hot">
        <div class="comment-content">
          <div class="single-comment" v-for="comment in hotComments">
            <v-card variant="text">
              <template #prepend>
                <div class="user-avatar">
                  <v-avatar :image="comment.user.avatarUrl" size="48"></v-avatar>
                </div>
              </template>
              <template #title>
                <div class="user-name">{{ comment.user.nickname }}</div>
              </template>
              <template #subtitle>
                <span class="comment-time">
                  {{ formatTime(comment.time) }}
                </span>
                <span class="location">
                  {{ comment.ipLocation.location }}
                </span>
              </template>
              <template #text>
                <div class="comment-text">{{ comment.content }}</div>
              </template>
            </v-card>
            <v-divider thickness="1px" opacity="100" class="divider"></v-divider>
          </div>
        </div>
      </v-tabs-window-item>
    </v-tabs-window>
    <div class="comment-input">
      <v-textarea
        label="评论"
        v-model="text"
        variant="outlined"
        @keydown.enter="FPublicComment"
        rounded="lg"
      >
        <template #details>
          <v-btn variant="text" @click="FPublicComment">
            <v-icon icon="mdi-send"></v-icon>
          </v-btn>
        </template>
      </v-textarea>
    </div>

    <v-pagination
      v-if="tab !== 'hot'"
      v-model="page"
      :length="totalComments / 20"
      rounded="circle"
      class="pagination"
    ></v-pagination>
  </div>
</template>

<script setup lang="ts">
  import { inject, ref, shallowRef, type ShallowRef, watch } from 'vue'
  import type Player from '@renderer/utils/player'
  const player = inject('player') as Player
  const currentTrack = player.currentTrack
  const comments = shallowRef([]) as ShallowRef<Array<any>>
  const hotComments = shallowRef([]) as ShallowRef<Array<any>>
  const page = ref(1)
  const totalComments = ref(0)
  const tab = ref('time')
  const text = ref('')
  let offset = 0
  async function getComments() {
    const data = {
      id: currentTrack.value.id,
      limit: 20,
      offset
    }
    const res = (await window.api.netEaseCloud.song_comments(data)) as any
    comments.value = res.comments
    hotComments.value = res.hotComments
    totalComments.value = res.total
  }

  //把时间转换为年月日
  function formatTime(time: number) {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return year + '年' + month + '月' + day + '日'
  }
  function FPublicComment() {
    if (!text.value) return
    const data = {
      t: 'add',
      id: currentTrack.value.id,
      content: text.value
    }
    window.api.netEaseCloud.comments(data)
    text.value = ''
  }
  watch(
    currentTrack,
    () => {
      offset = 0
      page.value = 1
      getComments()
    },
    { immediate: true }
  )
  watch(page, () => {
    offset = (page.value - 1) * 20
    getComments()
  })
</script>

<style lang="scss" scoped>
  :deep(.v-window-item) {
    width: 100%;
  }
  :deep(.v-tabs-window) {
    width: 100%;
    height: auto !important;
  }
  .comment-container {
    height: 100%;
    width: 100%;
    overflow: auto;
  }
  ::-webkit-scrollbar {
    display: none;
  }
  .comment-content {
    width: 100%;
  }
  .single-comment {
    width: 100%;
  }
  .user-avatar {
    display: flex;
    align-items: center;
  }
  .user-name {
    font-size: 14px;
  }
  .comment-time,
  .location {
    font-size: 12px;
  }
  .location {
    margin-left: 16px;
  }
  .comment-text {
    margin-left: 56px;
    font-size: 16px;
  }
  .divider {
    margin-left: 56px;
    opacity: 0.5;
  }
  .comment-input {
    width: auto;
    margin: 1rem 0 1rem 56px;
  }
  :deep(.v-field){
    backdrop-filter: blur(50px);
  }
</style>
