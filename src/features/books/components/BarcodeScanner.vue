<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { cameraError, createScanner } from '../services/scanner'

const emit = defineEmits<{ scanned: [isbn: string] }>()
const video = ref<HTMLVideoElement | null>(null)
const active = ref(false)
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
  },
  () => {
    active.value = false
    message.value = 'A câmera foi interrompida. Tente novamente ou digite o ISBN.'
  },
)
async function start() {
  if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
    message.value = 'Câmera indisponível neste navegador ou conexão. Digite o ISBN.'
    return
  }
  active.value = true
  message.value = 'Aguardando a câmera. Aponte para o código de barras do livro.'
  await nextTick()
  if (!active.value || !video.value) return
  try {
    await scanner.start(video.value)
  } catch (error) {
    active.value = false
    message.value = cameraError(error)
  }
}

function stop() {
  scanner.stop()
  active.value = false
  message.value = 'Leitura encerrada. Você pode digitar o ISBN.'
}
onBeforeUnmount(() => scanner.stop())
</script>
<template>
  <div class="scanner">
    <button v-if="!active" type="button" @click="start">Ler código de barras com a câmera</button>
    <template v-else>
      <video
        ref="video"
        autoplay
        muted
        playsinline
        aria-label="Prévia da câmera para leitura do código de barras"
      ></video>
      <button type="button" @click="stop">Parar câmera</button>
    </template>
    <p v-if="message" role="status">{{ message }}</p>
  </div>
</template>
