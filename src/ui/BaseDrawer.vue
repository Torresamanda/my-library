<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Toaster } from 'vue-sonner'

const props = defineProps<{ title: string; closeDisabled?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const toastTheme = document.querySelector('.app.light') ? 'light' : 'dark'

function cancel(event: Event) {
  event.preventDefault()
  if (!props.closeDisabled) emit('close')
}

onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())
</script>

<template>
  <dialog ref="dialog" class="drawer" aria-labelledby="drawer-title" @cancel="cancel">
    <div class="drawer-header">
      <h2 id="drawer-title">{{ title }}</h2>
      <button
        type="button"
        class="secondary-button"
        :disabled="closeDisabled"
        autofocus
        @click="emit('close')"
      >
        Fechar
      </button>
    </div>
    <slot />
    <Toaster id="drawer" :theme="toastTheme" position="top-center" />
  </dialog>
</template>
