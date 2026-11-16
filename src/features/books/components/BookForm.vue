<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { normalizeIsbn } from '../domain/isbn'
import BarcodeScanner from './BarcodeScanner.vue'
import BookCover from './BookCover.vue'
import ReviewEditor from './ReviewEditor.vue'
import {
  hasOwned,
  hasUnowned,
  setUnowned,
  type MediaType,
  type Ownership,
} from '../domain/collection'
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
  favorite: props.book?.favorite ?? false,
  mediaType: (props.book?.mediaType ?? '') as MediaType | '',
  ownership: [...(props.book?.ownership ?? [])] as Ownership,
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
const ownsCopies = computed(() => hasOwned(form.ownership))
const unowned = computed({
  get: () => hasUnowned(form.ownership),
  set: (checked: boolean) => {
    form.ownership = setUnowned(form.ownership, checked)
  },
})
const genreTags = computed(() =>
  form.genres
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean),
)

function removeGenre(index: number) {
  form.genres = genreTags.value.filter((_, current) => current !== index).join(', ')
}
const error = ref('')
const saving = ref(false)
const rating = ref<number | null>(props.book?.rating ?? null)
const review = ref<Review | null>(props.book?.review ?? null)
const initialValues = JSON.stringify({ form, rating: rating.value, review: review.value })
const discardToastId = 'discard-book-changes'

function requestCancel() {
  if (saving.value) return
  const changed =
    JSON.stringify({ form, rating: rating.value, review: review.value }) !== initialValues
  if (!changed) {
    emit('cancel')
    return
  }
  toast('Descartar as alterações feitas neste livro?', {
    id: discardToastId,
    toasterId: 'drawer',
    position: 'bottom-center',
    duration: Infinity,
    cancel: { label: 'Continuar editando', onClick: () => {} },
    action: {
      label: 'Descartar',
      onClick: () => {
        if (!saving.value) emit('cancel')
      },
    },
  })
}
const reviewInvalid = ref(false)
const lookingUp = ref(false)
const lookupMessage = ref('')
const coverUrl = ref<string | null>(props.book?.coverUrl ?? null)
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
  toast.dismiss(discardToastId)
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
    lookupMessage.value = 'Confira o ISBN e tente novamente. Ele deve ter 10 ou 13 dígitos válidos.'
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
      lookupMessage.value =
        'Não encontramos este ISBN na Open Library. Confira o número ou preencha os dados do livro manualmente abaixo.'
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
    lookupMessage.value = result.author
      ? 'Encontramos dados para este ISBN. Confira as informações e complete o que faltar antes de salvar.'
      : 'Encontramos a edição, mas a fonte não informou a autoria. Preencha o campo Autor antes de salvar.'
  } catch {
    if (version === lookupVersion)
      lookupMessage.value =
        'Não foi possível consultar a Open Library agora. Tente novamente ou preencha os dados manualmente abaixo.'
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
    error.value = 'Preencha o título e o autor para salvar o livro.'
    return
  }
  if (form.isbn && !normalizeIsbn(form.isbn)) {
    error.value =
      'Confira o ISBN: informe um número válido de 10 ou 13 dígitos, ou deixe o campo vazio.'
    return
  }
  if (form.seriesVolume && !form.seriesName.trim()) {
    error.value = 'Para informar o volume, preencha também o nome da série.'
    return
  }
  if (
    genres.length > 4 ||
    genres.some((genre) => genre.length > 80) ||
    new Set(genres.map((genre) => genre.toLowerCase())).size !== genres.length
  ) {
    error.value =
      'Use até 4 gêneros diferentes, separados por vírgula. Cada gênero pode ter até 80 caracteres.'
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
  const quantityValid =
    Number.isInteger(form.quantity) && form.quantity >= 1 && form.quantity <= 10000
  if (
    (ownsCopies.value && !quantityValid) ||
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
      favorite: form.favorite,
      mediaType: form.mediaType || null,
      ownership: form.ownership,
      rating: rating.value,
      review: review.value,
      genres,
      seriesName: form.seriesName.trim() || null,
      seriesVolume: volume,
      quantity: quantityValid ? form.quantity : 1,
      status: form.status,
    }
    const token = await props.token()
    if (props.book) await updateBook(token, props.book.id, draft)
    else await createBook(token, draft)
    emit('saved')
  } catch (cause) {
    error.value =
      cause instanceof LibraryRequestError && cause.status === 409
        ? 'Este ISBN já está cadastrado na biblioteca. Confira a edição existente antes de tentar novamente.'
        : cause instanceof LibraryRequestError && cause.status === 401
          ? 'Não foi possível confirmar seu acesso. Entre novamente e tente salvar o livro.'
          : 'Não foi possível salvar o livro. Seus dados continuam no formulário; confira sua conexão e tente novamente.'
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
          <div class="form-book-preview full">
            <div class="form-cover">
              <BookCover :url="coverUrl" :title="form.title || 'livro'" /><span
                >Prévia da capa</span
              >
            </div>
            <div class="form-book-fields">
              <label
                ><span>Título <span aria-hidden="true">*</span></span
                ><input v-model="form.title" required maxlength="250" autocomplete="off"
              /></label>
              <label
                ><span>Autor <span aria-hidden="true">*</span></span
                ><input v-model="form.author" required maxlength="250" autocomplete="off"
              /></label>
            </div>
          </div>
          <div class="full">
            <p v-if="lookupMessage" class="feedback-message" role="status">{{ lookupMessage }}</p>
          </div>
          <h3 class="form-section-title full">Sobre a edição</h3>
          <div class="genre-field full">
            <label for="book-genres">Gêneros (até 4, separados por vírgula)</label>
            <input id="book-genres" v-model="form.genres" placeholder="Ex.: Fantasia, Romance" />
            <ul v-if="genreTags.length" class="genre-tags" aria-label="Gêneros informados">
              <li v-for="(genre, index) in genreTags" :key="`${index}-${genre}`">
                <span>{{ genre }}</span>
                <button
                  type="button"
                  :aria-label="`Remover gênero ${genre}`"
                  @click="removeGenre(index)"
                >
                  ×
                </button>
              </li>
            </ul>
          </div>
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
          <label
            >Tipo de obra<select v-model="form.mediaType">
              <option value="">Não informado</option>
              <option value="livro">Livro</option>
              <option value="quadrinho">Quadrinho</option>
              <option value="manga">Mangá</option>
              <option value="outro">Outro</option>
            </select></label
          >
          <fieldset class="ownership-field full">
            <legend>Formato ou origem (opcional)</legend>
            <label :class="{ 'choice-selected': form.ownership.includes('fisico') }"
              ><input v-model="form.ownership" type="checkbox" value="fisico" /> Tenho físico</label
            >
            <label :class="{ 'choice-selected': form.ownership.includes('ebook') }"
              ><input v-model="form.ownership" type="checkbox" value="ebook" /> Tenho e-book</label
            >
            <label :class="{ 'choice-selected': unowned }"
              ><input v-model="unowned" type="checkbox" /> Não tenho (ex.: empréstimo ou
              assinatura)</label
            >
          </fieldset>
          <label>Série (opcional)<input v-model="form.seriesName" maxlength="200" /></label>
          <label
            >Volume (opcional)<input
              v-model="form.seriesVolume"
              type="number"
              min="1"
              max="10000"
              step="1"
          /></label>
          <label v-if="ownsCopies"
            ><span>Quantidade de exemplares registrados <span aria-hidden="true">*</span></span
            ><input
              v-model.number="form.quantity"
              type="number"
              required
              min="1"
              max="10000"
              step="1"
          /></label>
          <p v-if="ownsCopies" class="full">
            Cada edição que você tem conta uma vez no painel, independentemente da quantidade ou do
            formato.
          </p>
          <p v-else class="full">
            Para contabilizar exemplares, marque “Tenho físico” ou “Tenho e-book”.
          </p>
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
        <label class="favorite-field"
          ><input v-model="form.favorite" type="checkbox" /> Marcar como favorito</label
        >
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
