<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { cameraError, createScanner } from '../services/scanner'

const emit = defineEmits<{ scanned: [isbn: string]; 'active-change': [value: boolean] }>()
const video = ref<HTMLVideoElement | null>(null)
const active = ref(false)
const stopButton = ref<HTMLButtonElement | null>(null)
const startButton = ref<HTMLButtonElement | null>(null)
watch(active, (value) => emit('active-change', value))
const message = ref('')
const scanner = createScanner(
  (constraints) => navigator.mediaDevices.getUserMedia(constraints),
  async (stream, element, onValue) => {
    const { BrowserMultiFormatOneDReader } = await import('@zxing/browser')
    const reader = new BrowserMultiFormatOneDReader()
    return reader.decodeFromStream(stream, element, (result) => {
      if (result) onValue(result.getText())
    })
  },
  (isbn) => {
    active.value = false
    message.value = 'ISBN reconhecido. Confira os dados antes de salvar.'
    emit('scanned', isbn)
    void nextTick(() => startButton.value?.focus())
  },
  () => {
    active.value = false
    message.value = 'A câmera foi interrompida. Tente novamente ou digite o ISBN.'
    void nextTick(() => startButton.value?.focus())
  },
)
async function start() {
  if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
    message.value = 'Câmera indisponível neste navegador ou conexão. Digite o ISBN.'
    return
  }
  active.value = true
  message.value = 'Aguardando a câmera.'
  await nextTick()
  if (!active.value || !video.value) return
  stopButton.value?.focus()
  try {
    await scanner.start(video.value)
    if (active.value) message.value = 'Câmera ativa. A leitura acontece automaticamente.'
  } catch (error) {
    active.value = false
    message.value = cameraError(error)
    await nextTick()
    startButton.value?.focus()
  }
}

async function stop() {
  scanner.stop()
  active.value = false
  message.value = 'Leitura encerrada. Você pode digitar o ISBN.'
  await nextTick()
  startButton.value?.focus()
}
onBeforeUnmount(() => scanner.stop())
</script>
<template>
  <div :class="['scanner', { 'is-scanning': active }]">
    <button v-if="!active" ref="startButton" type="button" @click="start">
      Ler código pela câmera
    </button>
    <template v-else>
      <p>Aponte para o código de barras na contracapa do livro.</p>
      <div class="scanner-viewfinder">
        <video
          ref="video"
          autoplay
          muted
          playsinline
          aria-label="Prévia da câmera para leitura do código de barras"
        ></video>
        <span class="scanner-frame" aria-hidden="true"></span>
        <span class="scanner-line" aria-hidden="true"></span>
      </div>
      <p class="scanner-hint">Alinhe o código com a linha e mantenha o celular firme.</p>
      <button ref="stopButton" type="button" @click="stop">Parar câmera</button>
      <p class="scanner-manual">Se preferir, pare a câmera e digite o ISBN no formulário.</p>
    </template>
    <p v-if="message" class="feedback-message" role="status">{{ message }}</p>
  </div>
</template>
