<template>
  <v-dialog v-model="dialog" width="30%" max-height="50%" persistent @after-leave="FClose">
    <v-sheet rounded="lg" class="dialog">
      <div class="options">
        <v-spacer></v-spacer>
        <v-btn icon @click="FAddNewPlaylist">
          <v-icon icon="mdi-check" size="x-large"></v-icon>
        </v-btn>
        <v-btn icon @click="dialog = false">
          <v-icon icon="mdi-close" size="x-large"></v-icon>
        </v-btn>
      </div>
      <v-divider thickness="2px" opacity="100" class="divider" color="secondary"></v-divider>
      <div v-if="!local" class="playlist-info">
        <v-text-field
          label="歌单名"
          prepend-icon="mdi-music-note-plus"
          variant="underlined"
          v-model="playlistName"
          :rules="[rules.required]"
        ></v-text-field>
        <v-checkbox label="隐私歌单" v-model="isPrivate"></v-checkbox>
      </div>
      <div v-else class="playlist-info">
        <v-text-field
          label="歌单名"
          variant="underlined"
          prepend-icon="mdi-music-note-plus"
          v-model="playlistName"
          :rules="[rules.required]"
        ></v-text-field>
        <v-text-field
          label="描述"
          variant="underlined"
          prepend-icon="mdi-details"
          v-model="playlistDescription"
        ></v-text-field>
      </div>
    </v-sheet>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, defineEmits, defineProps } from 'vue'
  import { useUserStore } from '@renderer/store/userStore'
  import { newPlaylist } from '@renderer/hooks/localTrackHook'
  const props = defineProps({
    local: {
      type: Boolean,
      default: false
    }
  })

  const local = props.local
  const userStore = useUserStore()
  const emit = defineEmits(['close-dialog'])
  const dialog = ref(true)
  const playlistName = ref('')
  const playlistDescription = ref('')
  const isPrivate = ref(false)
  const rules = {
    required: (value) => !!value || '必须填入此字段'
  }
  let state = false
  function FClose() {
    emit('close-dialog', state)
  }
  async function FAddNewPlaylist() {
    if (!playlistName.value) return
    if (local) {
      const name = playlistName.value
      const description = playlistDescription.value
      await newPlaylist(name, description)
    } else {
      await window.api.netEaseCloud.playlist_create(playlistName.value, isPrivate.value)
      userStore.getNetEaseCloudPlaylist()
    }
    dialog.value = false
    state = true
  }
</script>

<style lang="scss" scoped>
  .dialog {
    padding: 5% 5% 0% 5%;
    display: flex;
    flex-direction: column;
  }
  ::-webkit-scrollbar {
    width: 5px;
  }
  .close-btn {
    align-self: end;
  }
  .divider {
    margin: 5px 0px;
  }
  .options {
    display: flex;
    gap: 5px;
  }
  .playlist-info {
    margin: 5px 0px;
  }
</style>
