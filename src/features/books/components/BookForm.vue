<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { normalizeIsbn } from '../domain/isbn'
import BarcodeScanner from './BarcodeScanner.vue'
import ReviewEditor from './ReviewEditor.vue'
import { reviewLength, type Review } from '../domain/review'
import BaseDrawer from '../../../ui/BaseDrawer.vue'
import LoadingIndicator from '../../../ui/LoadingIndicator.vue'
import { lookupIsbn } from '../services/lookup'
import { autofillField, createLookupScheduler } from '../services/automaticLookup'
import {
  createBook,
  updateBook,
  LibraryRequestError,
  type BookDraft,
  type LibraryBook,
} from '../../library/services/books'

const props = defineProps<{ token: () => Promise<string>; book?: LibraryBook }>()
const emit = defineEmits<{ cancel: []; saved: [] }>()
const form = reactive({
  title: props.book?.title ?? '',
  author: props.book?.author ?? '',
  isbn: props.book?.isbn ?? '',
  genres: props.book?.genres.join(', ') ?? '',
  publisher: props.book?.publisher ?? '',
  pageCount: props.book?.pageCount?.toString() ?? '',
  seriesName: props.book?.seriesName ?? '',
  seriesVolume: props.book?.seriesVolume?.toString() ?? '',
  quantity: props.book?.quantity ?? 1,
  status: (props.book?.status ?? 'nao_lido') as BookDraft['status'],
})
const error = ref('')
const saving = ref(false)
const rating = ref<number | null>(props.book?.rating ?? null)
const review = ref<Review | null>(props.book?.review ?? null)
const initialValues = JSON.stringify({ form, rating: rating.value, review: review.value })

function requestCancel() {
  if (saving.value) return
  const changed =
    JSON.stringify({ form, rating: rating.value, review: review.value }) !== initialValues
  if (!changed || window.confirm('Descartar as alterações feitas neste livro?')) emit('cancel')
}
const reviewInvalid = ref(false)
const lookingUp = ref(false)
const lookupMessage = ref('')
const coverUrl = ref<string | null>(props.book?.coverUrl ?? null)
const coverFailed = ref(false)
const originalIsbn = props.book?.isbn ? normalizeIsbn(props.book.isbn) : null
let lookupVersion = 0
let automaticTitle = ''
let automaticAuthor = ''
let automaticPublisher = ''
let automaticPageCount = ''
let automaticGenres = ''
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
    if (automaticPublisher && form.publisher === automaticPublisher) form.publisher = ''
    if (automaticPageCount && form.pageCount === automaticPageCount) form.pageCount = ''
    if (automaticGenres && form.genres === automaticGenres) form.genres = ''
    automaticTitle = ''
    automaticAuthor = ''
    automaticPublisher = ''
    automaticPageCount = ''
    automaticGenres = ''
    automaticIsbn = null
  }
  lookupVersion++
  coverUrl.value =
    originalIsbn && normalizeIsbn(form.isbn) === originalIsbn
      ? (props.book?.coverUrl ?? null)
      : null
  coverFailed.value = false
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
  const initialPublisher = form.publisher
  const initialPageCount = form.pageCount
  const initialGenres = form.genres
  lookingUp.value = true
  lookupMessage.value = ''
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
    const publisher = autofillField(
      form.publisher,
      initialPublisher,
      automaticPublisher,
      result.publisher,
    )
    const pages = result.pageCount?.toString() ?? ''
    const pageCount = autofillField(form.pageCount, initialPageCount, automaticPageCount, pages)
    const foundGenres = result.genres.join(', ')
    const genres = autofillField(form.genres, initialGenres, automaticGenres, foundGenres)
    automaticPublisher = publisher === result.publisher ? publisher : ''
    automaticPageCount = pageCount === pages ? pageCount : ''
    automaticGenres = genres === foundGenres ? genres : ''
    form.publisher = publisher
    form.pageCount = pageCount
    form.genres = genres
    automaticIsbn = isbn
    form.title = title
    form.author = author
    coverUrl.value =
      result.coverUrl ?? (originalIsbn === isbn ? (props.book?.coverUrl ?? null) : null)
    coverFailed.value = false
    lookupMessage.value = result.author
      ? 'Confira e complete os dados encontrados antes de salvar.'
      : 'A fonte não informou a autoria. Preencha o autor ou os autores antes de salvar.'
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
  if (reviewInvalid.value || (review.value && reviewLength(review.value) > 500)) {
    error.value =
      'O comentário deve ter no máximo 500 caracteres e usar apenas as formatações permitidas.'
    return
  }
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
    genres.length > 4 ||
    genres.some((genre) => genre.length > 80) ||
    new Set(genres.map((genre) => genre.toLowerCase())).size !== genres.length
  ) {
    error.value = 'Informe até 4 gêneros diferentes, com até 80 caracteres cada.'
    return
  }
  const volume = form.seriesVolume ? Number(form.seriesVolume) : null
  const pageCount = form.pageCount ? Number(form.pageCount) : null
  if (
    pageCount !== null &&
    (!Number.isInteger(pageCount) || pageCount < 1 || pageCount > 1000000)
  ) {
    error.value = 'O número de páginas deve ser um inteiro entre 1 e 1000000.'
    return
  }
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
    const draft: BookDraft = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim() || null,
      coverUrl: coverUrl.value,
      publisher: form.publisher.trim() || null,
      pageCount,
      rating: rating.value,
      review: review.value,
      genres,
      seriesName: form.seriesName.trim() || null,
      seriesVolume: volume,
      quantity: form.quantity,
      status: form.status,
    }
    const token = await props.token()
    if (props.book) await updateBook(token, props.book.id, draft)
    else await createBook(token, draft)
    emit('saved')
  } catch (cause) {
    error.value =
      cause instanceof LibraryRequestError && cause.status === 409
        ? 'Este livro já está na biblioteca.'
        : cause instanceof LibraryRequestError && cause.status === 401
          ? 'Sua sessão expirou ou o acesso foi negado. Entre novamente.'
          : 'Não foi possível salvar. Confira os dados e tente novamente.'
    toast.error(error.value, { toasterId: 'drawer' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseDrawer
    :title="book ? 'Editar livro' : 'Adicionar livro'"
    :close-disabled="saving"
    @close="requestCancel"
  >
    <div class="book-form">
      <p>Preencha os dados desta edição. Campos com * são obrigatórios.</p>
      <form @submit.prevent="submit">
        <div class="form-grid">
          <h3 class="form-section-title full">Identificação</h3>
          <div class="isbn-lookup full">
            <label
              >ISBN (opcional)<input
                v-model="form.isbn"
                maxlength="32"
                inputmode="text"
                @input="isbnChanged"
            /></label>
            <div class="isbn-actions">
              <button
                type="button"
                class="secondary-button"
                :disabled="lookingUp || saving"
                @click="lookup"
              >
                <LoadingIndicator v-if="lookingUp" compact text="Consultando..." />
                <template v-else>Consultar ISBN</template>
              </button>
              <BarcodeScanner @scanned="scanned" />
            </div>
          </div>
          <label class="full"
            ><span>Título <span aria-hidden="true">*</span></span
            ><input v-model="form.title" required maxlength="250" autocomplete="off"
          /></label>
          <label class="full"
            ><span>Autor <span aria-hidden="true">*</span></span
            ><input v-model="form.author" required maxlength="250" autocomplete="off"
          /></label>
          <div class="full">
            <p v-if="lookupMessage" role="status">{{ lookupMessage }}</p>
            <img
              v-if="coverUrl && !coverFailed"
              :src="coverUrl"
              alt="Capa encontrada na Open Library"
              class="lookup-cover"
              referrerpolicy="no-referrer"
              @error="coverFailed = true"
            />
          </div>
          <h3 class="form-section-title full">Sobre a edição</h3>
          <label
            >Gêneros (até 4, separados por vírgula)<input
              v-model="form.genres"
              placeholder="Ex.: Fantasia, Romance"
          /></label>
          <label>Editora (opcional)<input v-model="form.publisher" maxlength="250" /></label>
          <label
            >Número de páginas (opcional)<input
              v-model="form.pageCount"
              type="number"
              min="1"
              max="1000000"
              step="1"
          /></label>
          <h3 class="form-section-title full">Organização</h3>
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
            ><span>Quantidade de exemplares <span aria-hidden="true">*</span></span
            ><input
              v-model.number="form.quantity"
              type="number"
              required
              min="1"
              max="10000"
              step="1"
          /></label>
          <label class="full"
            >Status de leitura<select v-model="form.status">
              <option value="nao_lido">Não lido</option>
              <option value="lendo">Lendo</option>
              <option value="concluido">Concluído</option>
              <option value="abandonado">Abandonado</option>
            </select></label
          >
        </div>
        <h3 class="form-section-title">Sua leitura</h3>
        <ReviewEditor
          v-model:rating="rating"
          v-model:review="review"
          @invalid="reviewInvalid = $event"
        />
        <p v-if="error" role="alert" class="form-error">{{ error }}</p>
        <div class="form-actions">
          <button type="submit" :disabled="saving || lookingUp">
            <LoadingIndicator v-if="saving" compact text="Salvando..." />
            <template v-else>Salvar livro</template></button
          ><button type="button" class="secondary-button" :disabled="saving" @click="requestCancel">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </BaseDrawer>
</template>
