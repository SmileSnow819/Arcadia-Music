<template>
  <div class="app">
    <Navbar :style="background" />
    <v-main class="main">
      <div class="main-page">
        <div class="main-context">
          <div class="mode-select">
            <div class="mode-select-container" :style="stateStore.background">
              <RouterLink :to="{ name: 'local' }" active-class="active" class="icon-link">
                <v-icon icon="mdi-folder-play-outline" size="46" class="icon"> </v-icon>
              </RouterLink>
              <RouterLink :to="{ name: 'netEaseCloud' }" active-class="active" class="icon-link">
                <v-icon icon="mdi-music" size="46" class="icon"> </v-icon>
              </RouterLink>
            </div>
          </div>
          <div class="main-view">
            <RouterView v-slot="{ Component }">
              <Transition>
                <Component :is="Component" />
              </Transition>
            </RouterView>
          </div>
        </div>
        <PlayBar />
      </div>
      <Panel class="panel" />
    </v-main>
  </div>
</template>

<script lang="ts" setup>
  import PlayBar from '@components/player/PlayBar.vue'
  import Navbar from '@components/navigator/NavBar.vue'
  import Panel from '@components/panel/Panel.vue'
  import { inject, computed } from 'vue'
  import { type Setting } from '@renderer/utils/setting'
  import { useStateStore } from '@renderer/store/stateStore'

  const stateStore = useStateStore()
  const globalSetting = inject('setting') as Setting
  const background = computed(() => {
    if (globalSetting.settings.imgDir) {
      return {
        background: 'none'
      }
    }
    return {}
  })
</script>

<style lang="scss" scoped>
  .app {
    position: absolute;
    z-index: 2;
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
  }
  .main {
    flex: 1;
    padding: 0;
    margin: 0;
    display: flex;
    column-gap: 5px;
    padding: 8px;
  }
  .main-page {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .main-context {
    flex: 1;
    display: flex;
    position: relative;
  }
  .mode-select {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    z-index: 1000;
    pointer-events: none;
  }
  .mode-select-container {
    pointer-events: fill;
    backdrop-filter: blur(50px);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease-in-out;
    transform: translate(-85%, 0%);
    padding-right: 15px;
    &:hover {
      transform: translate(0%, 0%);
      padding-right: 0px;
    }
  }
  .main-view {
    flex: 1;
    position: relative;
  }
  .v-enter-active {
    animation: enter 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  }
  .v-leave-active {
    animation: leave 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  }
  @keyframes leave {
    0% {
      transform: translate(0%, 0%);
    }
    100% {
      transform: translate(100%, 0%);
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
  .panel {
    width: 22%;
  }
  .icon-link {
    margin: 5px;
    padding: 2px;
    color: inherit;
    display: block;
  }
  .icon {
    font-size: 2rem;
  }
  .active {
    color: rgb(var(--v-theme-primary));
  }
</style>
