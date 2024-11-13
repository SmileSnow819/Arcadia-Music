<template>
  <v-dialog v-model="dialog" @after-leave="FQuit" persistent>
    <div class="login-wyy">
      <div class="mask"></div>
      <div class="user-login">
        <div class="qr-code">
          <v-btn icon class="close-btn" @click="FQuit">
            <v-icon icon="mdi-close"></v-icon>
          </v-btn>
          <v-img :src="qrImg" width="300" aspect-ratio="1" cover rounded="lg"></v-img>
        </div>
        <div class="status">
          <v-icon :icon="statusIcon[status]"></v-icon>
          <span> {{ statusMessage[status] }}</span>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, defineEmits } from 'vue'
  import { useUserStore } from '@renderer/store/userStore'
  const emit = defineEmits(['close-dialog'])
  const statusIcon = ['mdi-qrcode', 'mdi-reload', 'mdi-check']
  const statusMessage = ['等待扫码', '等待确认', '登录成功']
  const dialog = ref(true)
  const userStore = useUserStore()
  const qrImg = ref('')
  const qrKey = ref('')
  const status = ref(0)
  function FQuit(): void {
    if (intervalID) clearInterval(intervalID)
    dialog.value = false
    emit('close-dialog', status.value === 2)
  }

  let intervalID = null as any
  // 获取二维码
  async function FGetLoginQrCode(): Promise<void> {
    window.api.netEaseCloud.login_qr_key().then((resQrKey) => {
      window.api.netEaseCloud.login_qr_create(resQrKey.unikey).then((resQrImg) => {
        qrKey.value = resQrKey.unikey
        qrImg.value = resQrImg.qrimg
      })
    })
  }
  function FLoginQrCheck(): void {
    //   '800': '二维码过期',
    //   '801': '等待扫码',
    //   '802': '等待确认',
    //   '803': '授权登录成功'
    //轮询状态
    intervalID = setInterval(() => {
      if (!qrKey.value) return
      window.api.netEaseCloud.login_qr_check(qrKey.value).then((res) => {
        const resStatus = res.code
        if (resStatus === 800) {
          //二维码过期,重新获取
          FGetLoginQrCode()
        } else if (resStatus === 803) {
          //登录成功取消轮询
          status.value = 2
          userStore.netEaseCloud.login = true
          userStore.netEaseCloud.profile = res.profile
          userStore.netEaseCloud.account = res.account
          setTimeout(FQuit, 500)
        } else if (resStatus === 802) {
          status.value = 1
        }
      })
    }, 1000)
  }
  FGetLoginQrCode()
  FLoginQrCheck()
</script>

<style lang="scss" scoped>
  .login-wyy {
    z-index: 10000;
    width: 100%;
    height: 100%;
    left: 0%;
    top: 0%;
    position: absolute;
  }
  .mask {
    z-index: 1000;
    width: 100%;
    height: 100%;
    background-color: rgb(var(--v-theme-surface));
    opacity: 0.8;
  }
  .user-login {
    z-index: 1000;
    padding: 10px;
    display: flex;
    left: 50%;
    top: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgb(var(--v-theme-surface));
    border-radius: 20px;
  }
  .qr-code {
    position: relative;
    padding: 48px 48px 0px 48px;
  }
  .close-btn {
    position: absolute;
    right: 0%;
    top: 0%;
  }
  .status {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
</style>
