<template>
  <div class="netEaseCloud-view">
    <RouterView>
      <template #default="{ Component, route }">
        <Transition>
          <Component :is="Component" :key="route.path" />
        </Transition>
      </template>
    </RouterView>
    <LoginWYYDialogs
      v-if="!userStore.netEaseCloud.login && $route.name !== 'search'"
      @close-dialog="FReLoad"
    />
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@renderer/store/userStore'
  import { watch, inject } from 'vue'
  import { useRouter } from 'vue-router'
  const router = useRouter()
  const player = inject('player') as any
  const userStore = useUserStore()
  watch(
    () => userStore.netEaseCloud.login,
    async () => {
      if (userStore.netEaseCloud.login) {
        await userStore.getNetEaseCloudAccount()
        window.location.reload()
      } else {
        player.clearPlayList()
      }
    }
  )
  const FReLoad = (status) => {
    if (status) window.location.reload()
    else router.push({ name: 'local' })
  }
</script>

<style lang="scss" scoped>
  .netEaseCloud-view {
    height: 100%;
    width: 100%;
    position: absolute;
  }
  .v-enter-active {
    animation: enter 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  }
  .v-leave-active {
    animation: leave 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  }

  @keyframes leave {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0.5);
      opacity: 0;
    }
  }
  @keyframes enter {
    0% {
      transform: translate(100%, 0%);
    }
    100% {
      transform: translate(0%, 0%);
    }
  }
</style>
