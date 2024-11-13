<template>
  <v-dialog v-model="dialog" width="30%" height="30%" persistent @after-leave="FClose">
    <v-sheet rounded="lg" class="dialog">
      <div class="options">
        <v-spacer></v-spacer>
        <v-btn icon @click="FCheck">
          <v-icon icon="mdi-check" size="x-large"></v-icon>
        </v-btn>
        <v-btn icon @click="dialog = false">
          <v-icon icon="mdi-close" size="x-large"></v-icon>
        </v-btn>
      </div>
      <v-divider thickness="2px" opacity="100" class="divider" color="secondary"></v-divider>
      <v-text-field
        label="主题名"
        prepend-icon="mdi-palette"
        v-model="name"
        :rules="[rules.required, rules.unique]"
      ></v-text-field>
    </v-sheet>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, defineEmits, inject } from 'vue'
  import type { Setting } from '@renderer/utils/setting'
  const globalSetting = inject('setting') as Setting
  const allThemes = globalSetting.settings.theme.customThemes.map((theme) => theme.name)
  const name = ref('')
  const emit = defineEmits(['close-dialog'])
  const dialog = ref(true)
  const rules = {
    required: (value) => !!value || '必须填入此字段',
    unique: (value) => {
      if (value === '') return true
      return !allThemes.includes(value) || '已存在此主题'
    }
  }
  function FClose() {
    emit('close-dialog')
  }
  function FCheck() {
    //如果没有名字，发出警告
    if (name.value === '' || allThemes.includes(name.value)) return
    emit('close-dialog', name.value)
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
