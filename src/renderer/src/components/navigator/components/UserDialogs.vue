<template>
  <v-sheet rounded="lg" class="dialog">
    <div class="login-body">
      <v-card v-if="userStore.netEaseCloud.login" variant="text">
        <template #prepend>
          <v-btn icon @click="FLookAccount" variant="text" size="x-large">
            <v-avatar size="x-large" :image="userStore.netEaseCloud.profile.avatarUrl"></v-avatar
          ></v-btn>
        </template>
        <template #title>{{ userStore.netEaseCloud.profile.nickname }} </template>
        <template #append>
          <v-btn icon="mdi-logout" @click="FLogoutWYY" variant="text"></v-btn>
        </template>
      </v-card>
      <v-btn v-else @click="FLoginWYY" variant="text">点击登陆网易云</v-btn>

      <!-- <v-card v-if="userStore.bilibili.login" variant="text">
        <template #prepend>
          <v-avatar></v-avatar>
        </template>
        <template #title> </template>
      </v-card>
      <v-btn variant="text">点击登陆B站</v-btn> -->
      <LoginWYYDialogs v-if="loginYYY" @close-dialog="FReLoad" />
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  // import { useStateStore } from '@renderer/store/stateStore'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@renderer/store/userStore'
  // const stateStore = useStateStore()
  const userStore = useUserStore()
  const router = useRouter()
  const dialog = ref(true)
  const loginYYY = ref(false)
  function FLoginWYY() {
    loginYYY.value = true
  }
  const FReLoad = (status) => {
    if (status) window.location.reload()
  }
  function FLogoutWYY() {
    window.api.netEaseCloud.logout()
    //删除全部cookie
    document.cookie = ''
    userStore.netEaseCloud.login = false
    userStore.netEaseCloud.profile = {} as any
    userStore.netEaseCloud.account = {} as any
  }
  function FLookAccount() {
    dialog.value = false
    router.push({ name: 'account' })
  }
</script>

<style lang="scss" scoped>
  .dialog {
    width: 250px;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .login-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
</style>
