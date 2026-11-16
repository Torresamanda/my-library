<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Toaster } from 'vue-sonner'
import { PhX } from '../icons'

const props = defineProps<{ title: string; closeDisabled?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const closing = ref(false)
const toastTheme = document.querySelector('.app.light') ? 'light' : 'dark'

async function animateClose() {
  if (!dialog.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  closing.value = true
  await new Promise<void>((resolve) => window.setTimeout(resolve, 240))
}

defineExpose({ animateClose })

function cancel(event: Event) {
  event.preventDefault()
  if (!props.closeDisabled && !closing.value) emit('close')
}

function backdropClick(event: MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  ) {
    if (!props.closeDisabled && !closing.value) emit('close')
  }
}

onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())
</script>

<template>
  <dialog
    ref="dialog"
    :class="['drawer', { 'is-closing': closing }]"
    aria-labelledby="drawer-title"
    @cancel="cancel"
    @click="backdropClick"
  >
    <div class="drawer-header">
      <h2 id="drawer-title">{{ title }}</h2>
      <button
        type="button"
        class="secondary-button"
        :disabled="closeDisabled || closing"
        aria-label="Fechar painel"
        title="Fechar painel"
        autofocus
        @click="emit('close')"
      >
        <PhX :size="22" aria-hidden="true" />
      </button>
    </div>
    <slot />
    <Toaster id="drawer" :theme="toastTheme" position="top-center" />
  </dialog>
</template>
