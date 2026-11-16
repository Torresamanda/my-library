<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import { normalizeIsbn } from '../domain/isbn'
import BarcodeScanner from './BarcodeScanner.vue'
import { lookupIsbn } from '../services/lookup'
import { autofillField, createLookupScheduler } from '../services/automaticLookup'
import { createBook, LibraryRequestError, type BookDraft } from '../../library/services/books'

const props = defineProps<{ token: () => Promise<string> }>()
const emit = defineEmits<{ cancel: []; saved: [] }>()
const form = reactive({
  title: '',
  author: '',
  isbn: '',
  genres: '',
  seriesName: '',
  seriesVolume: '',
  quantity: 1,
  status: 'nao_lido' as BookDraft['status'],
})
const error = ref('')
const saving = ref(false)
const lookingUp = ref(false)
const lookupMessage = ref('')
const coverUrl = ref<string | null>(null)
let lookupVersion = 0
let automaticTitle = ''
let automaticAuthor = ''
let automaticIsbn: string | null = null
const scheduler = createLookupScheduler(() => void lookup())
onBeforeUnmount(() => {
  scheduler.cancel()
  lookupVersion++
})

function isbnChanged() {
  if (automaticIsbn && normalizeIsbn(form.isbn) !== automaticIsbn) {
    if (automaticTitle && form.title === automaticTitle) form.title = ''
    if (automaticAuthor && form.author === automaticAuthor) form.author = ''
    automaticTitle = ''
    automaticAuthor = ''
    automaticIsbn = null
  }
  lookupVersion++
  coverUrl.value = null
  lookupMessage.value = ''
  lookingUp.value = false
  scheduler.schedule(form.isbn)
}

function scanned(isbn: string) {
  form.isbn = isbn
  isbnChanged()
  void lookup()
}

async function lookup() {
  scheduler.cancel()
  const isbn = normalizeIsbn(form.isbn)
  if (!isbn) {
    lookupMessage.value = 'Informe um ISBN válido para consultar.'
    return
  }
  const version = ++lookupVersion
  const initialTitle = form.title
  const initialAuthor = form.author
  lookingUp.value = true
  lookupMessage.value = ''
  coverUrl.value = null
  try {
    const result = await lookupIsbn(isbn, AbortSignal.timeout(10000))
    if (version !== lookupVersion) return
    if (!result) {
      lookupMessage.value = 'Livro não encontrado. Preencha os dados manualmente.'
      return
    }
    const title = autofillField(form.title, initialTitle, automaticTitle, result.title)
    const author = autofillField(form.author, initialAuthor, automaticAuthor, result.author)
    automaticTitle = title === result.title ? title : ''
    automaticAuthor = author === result.author ? author : ''
    automaticIsbn = isbn
    form.title = title
    form.author = author
    coverUrl.value = result.coverUrl
    lookupMessage.value = 'Confira e complete os dados encontrados antes de salvar.'
  } catch {
    if (version === lookupVersion)
      lookupMessage.value =
        'Não foi possível consultar agora. Tente novamente ou preencha os dados manualmente.'
  } finally {
    if (version === lookupVersion) lookingUp.value = false
  }
}

async function submit() {
  scheduler.cancel()
  error.value = ''
  const genres = form.genres
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean)
  if (!form.title.trim() || !form.author.trim()) {
    error.value = 'Informe o título e o autor.'
    return
  }
  if (form.isbn && !normalizeIsbn(form.isbn)) {
    error.value = 'Informe um ISBN válido.'
    return
  }
  if (form.seriesVolume && !form.seriesName.trim()) {
    error.value = 'Informe o nome da série para adicionar um volume.'
    return
  }
  if (
    genres.length > 20 ||
    genres.some((genre) => genre.length > 80) ||
    new Set(genres.map((genre) => genre.toLowerCase())).size !== genres.length
  ) {
    error.value = 'Informe até 20 gêneros diferentes, com até 80 caracteres cada.'
    return
  }
  const volume = form.seriesVolume ? Number(form.seriesVolume) : null
  if (
    !Number.isInteger(form.quantity) ||
    form.quantity < 1 ||
    form.quantity > 10000 ||
    (volume !== null && (!Number.isInteger(volume) || volume < 1 || volume > 10000))
  ) {
    error.value = 'Quantidade e volume devem ser números inteiros entre 1 e 10000.'
    return
  }
  saving.value = true
  try {
    await createBook(await props.token(), {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim() || null,
      coverUrl: coverUrl.value,
      genres,
      seriesName: form.seriesName.trim() || null,
      seriesVolume: volume,
      quantity: form.quantity,
      status: form.status,
    })
    emit('saved')
  } catch (cause) {
    error.value =
      cause instanceof LibraryRequestError && cause.status === 409
        ? 'Este livro já está na biblioteca.'
        : cause instanceof LibraryRequestError && cause.status === 401
          ? 'Sua sessão expirou ou o acesso foi negado. Entre novamente.'
          : 'Não foi possível salvar. Confira os dados e tente novamente.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="book-form" aria-labelledby="form-title">
    <h2 id="form-title">Adicionar livro</h2>
    <p>Preencha os dados desta edição. Título e autor são obrigatórios.</p>
    <BarcodeScanner @scanned="scanned" />
    <form @submit.prevent="submit">
      <div class="form-grid">
        <label
          >Título <span aria-hidden="true">*</span
          ><input v-model="form.title" required maxlength="250" autocomplete="off"
        /></label>
        <label
          >Autor <span aria-hidden="true">*</span
          ><input v-model="form.author" required maxlength="250" autocomplete="off"
        /></label>
        <div class="isbn-lookup">
          <label
            >ISBN (opcional)<input
              v-model="form.isbn"
              maxlength="32"
              inputmode="text"
              @input="isbnChanged" /></label
          ><button
            type="button"
            class="secondary-button"
            :disabled="lookingUp || saving"
            @click="lookup"
          >
            {{ lookingUp ? 'Consultando...' : 'Consultar ISBN' }}
          </button>
        </div>
        <label
          >Gêneros (separados por vírgula)<input
            v-model="form.genres"
            placeholder="Ex.: Fantasia, Romance"
        /></label>
        <label>Série (opcional)<input v-model="form.seriesName" maxlength="200" /></label>
        <label
          >Volume (opcional)<input
            v-model="form.seriesVolume"
            type="number"
            min="1"
            max="10000"
            step="1"
        /></label>
        <label
          >Quantidade de exemplares<input
            v-model.number="form.quantity"
            type="number"
            required
            min="1"
            max="10000"
            step="1"
        /></label>
        <label
          >Status de leitura<select v-model="form.status">
            <option value="nao_lido">Não lido</option>
            <option value="lendo">Lendo</option>
            <option value="concluido">Concluído</option>
            <option value="abandonado">Abandonado</option>
          </select></label
        >
      </div>
      <p v-if="lookupMessage" role="status">{{ lookupMessage }}</p>
      <img
        v-if="coverUrl"
        :src="coverUrl"
        alt="Capa encontrada na Open Library"
        class="lookup-cover"
        referrerpolicy="no-referrer"
        @error="coverUrl = null"
      />
      <p v-if="error" role="alert" class="form-error">{{ error }}</p>
      <div class="form-actions">
        <button type="submit" :disabled="saving || lookingUp">
          {{ saving ? 'Salvando...' : 'Salvar livro' }}</button><button
          type="button"
          class="secondary-button"
          :disabled="saving"
          @click="emit('cancel')"
        >
          Cancelar
        </button>
      </div>
    </form>
  </section>
</template>
