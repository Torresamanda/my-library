<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { normalizeIsbn } from '../domain/isbn'
import BarcodeScanner from './BarcodeScanner.vue'
import BookCover from './BookCover.vue'
import CoverSearch from './CoverSearch.vue'
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
import { PhHeart } from '../../../icons'
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
const extraOpen = ref(
  Boolean(form.publisher || form.pageCount || form.seriesName || form.seriesVolume),
)
const hasExtra = computed(() =>
  Boolean(form.publisher || form.pageCount || form.seriesName || form.seriesVolume),
)

function revealInvalid(event: Event) {
  if (event.target instanceof HTMLElement && event.target.closest('.edition-details'))
    extraOpen.value = true
}
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
const closing = ref(false)
const drawer = ref<InstanceType<typeof BaseDrawer> | null>(null)
const rating = ref<number | null>(props.book?.rating ?? null)
const review = ref<Review | null>(props.book?.review ?? null)
const initialValues = JSON.stringify({ form, rating: rating.value, review: review.value })
const discardToastId = 'discard-book-changes'

async function finishClose(event: 'cancel' | 'saved') {
  if (closing.value) return
  closing.value = true
  toast.dismiss(discardToastId)
  await drawer.value?.animateClose()
  if (event === 'cancel') emit('cancel')
  else emit('saved')
}

function requestCancel() {
  if (saving.value || closing.value) return
  const changed =
    JSON.stringify({ form, rating: rating.value, review: review.value }) !== initialValues ||
    coverUrl.value !== (props.book?.coverUrl ?? null)
  if (!changed) {
    void finishClose('cancel')
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
        if (!saving.value) void finishClose('cancel')
      },
    },
  })
}
const reviewInvalid = ref(false)
const lookingUp = ref(false)
const cameraActive = ref(false)
const lookupMessage = ref('')
const coverUrl = ref<string | null>(props.book?.coverUrl ?? null)
const coverSearchOpen = ref(false)
let coverChoiceVersion = 0
function chooseCover(url: string) {
  coverChoiceVersion++
  coverUrl.value = url
  coverSearchOpen.value = false
}
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
  const initialCoverChoiceVersion = coverChoiceVersion
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
    if (publisher || pageCount) extraOpen.value = true
    form.genres = genres
    automaticIsbn = isbn
    form.title = title
    form.author = author
    if (initialCoverChoiceVersion === coverChoiceVersion)
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
  if (closing.value || saving.value) return
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
    extraOpen.value = true
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
    extraOpen.value = true
    error.value = 'O número de páginas deve ser um inteiro entre 1 e 1000000.'
    return
  }
  const quantityValid =
    Number.isInteger(form.quantity) && form.quantity >= 1 && form.quantity <= 10000
  if (
    (ownsCopies.value && !quantityValid) ||
    (volume !== null && (!Number.isInteger(volume) || volume < 1 || volume > 10000))
  ) {
    if (volume !== null && (!Number.isInteger(volume) || volume < 1 || volume > 10000))
      extraOpen.value = true
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
    await finishClose('saved')
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
    ref="drawer"
    :title="book ? 'Editar livro' : 'Adicionar livro'"
    :close-disabled="saving"
    @close="requestCancel"
  >
    <div class="book-form redesigned-form">
      <p>
        Comece pelo ISBN ou preencha os dados manualmente. Apenas título e autor são obrigatórios.
      </p>
      <form @submit.prevent="submit" @invalid.capture="revealInvalid">
        <section class="form-section" aria-labelledby="find-book-title">
          <h3 id="find-book-title">Encontre seu livro</h3>
          <p class="section-hint">O ISBN pode ajudar a preencher os dados da edição.</p>
          <div :class="['isbn-lookup', { 'is-scanning': cameraActive }]">
            <label
              >ISBN <span class="field-hint">Opcional</span
              ><input
                v-model="form.isbn"
                maxlength="32"
                inputmode="text"
                placeholder="Digite o ISBN"
                @input="isbnChanged"
            /></label>
            <div :class="['isbn-actions', { 'is-scanning': cameraActive }]">
              <button
                type="button"
                class="secondary-button"
                :disabled="lookingUp || saving"
                @click="lookup"
              >
                <LoadingIndicator v-if="lookingUp" compact text="Consultando..." /><template v-else
                  >Consultar</template
                >
              </button>
              <BarcodeScanner @scanned="scanned" @active-change="cameraActive = $event" />
            </div>
          </div>
          <p class="section-hint">
            Sem ISBN? Continue preenchendo abaixo. Um ISBN válido é consultado automaticamente.
          </p>
          <p v-if="lookupMessage" class="feedback-message" role="status">{{ lookupMessage }}</p>
        </section>
        <section class="form-section" aria-labelledby="book-info-title">
          <h3 id="book-info-title">Sobre o livro</h3>
          <p class="section-hint">Confira ou complete as informações principais.</p>
          <div class="form-book-preview">
            <div class="form-cover">
              <BookCover :url="coverUrl" :title="form.title || 'livro'" hide-source /><span
                >Prévia da capa</span
              >
            </div>
            <div class="form-book-fields">
              <label
                >Título *<input v-model="form.title" required maxlength="250" autocomplete="off"
              /></label>
              <label
                >Autor *<input v-model="form.author" required maxlength="250" autocomplete="off"
              /></label>
            </div>
          </div>
          <button
            type="button"
            class="secondary-button field-block"
            @click="coverSearchOpen = !coverSearchOpen"
          >
            Pesquisar capa
          </button>
          <CoverSearch
            v-if="coverSearchOpen"
            :title="form.title"
            :author="form.author"
            :isbn="form.isbn"
            :token="token"
            @close="coverSearchOpen = false"
            @choose="chooseCover"
          />
          <fieldset class="form-choice-group field-block">
            <legend>Tipo de obra <span class="field-hint">· opcional</span></legend>
            <div class="form-choices">
              <label
                v-for="option in [
                  { value: 'livro', label: 'Livro' },
                  { value: 'quadrinho', label: 'Quadrinho' },
                  { value: 'manga', label: 'Mangá' },
                  { value: 'outro', label: 'Outro' },
                ]"
                :key="option.value"
                class="form-choice"
                ><input
                  v-model="form.mediaType"
                  type="radio"
                  name="mediaType"
                  :value="option.value"
                /><span>{{ option.label }}</span></label
              >
              <button
                v-if="form.mediaType"
                type="button"
                class="form-text-button"
                @click="form.mediaType = ''"
              >
                Limpar tipo
              </button>
            </div>
          </fieldset>
          <div class="genre-field field-block">
            <label for="book-genres"
              >Gêneros <span class="field-hint">Até 4, separados por vírgula</span></label
            ><input id="book-genres" v-model="form.genres" placeholder="Ex.: Fantasia, Romance" />
            <ul v-if="genreTags.length" class="genre-tags" aria-label="Gêneros informados">
              <li v-for="(genre, index) in genreTags" :key="`${index}-${genre}`">
                <span>{{ genre }}</span><button
                  type="button"
                  :aria-label="`Remover gênero ${genre}`"
                  @click="removeGenre(index)"
                >
                  ×
                </button>
              </li>
            </ul>
          </div>
          <details
            class="edition-details field-block"
            :open="extraOpen"
            @toggle="extraOpen = ($event.target as HTMLDetailsElement).open"
          >
            <summary>
              Mais dados da edição
              <span class="field-hint"
                >· editora, páginas e série<span v-if="hasExtra"> · preenchido</span></span
              >
            </summary>
            <div class="edition-fields">
              <label
                >Editora <span class="field-hint">Opcional</span
                ><input v-model="form.publisher" maxlength="250"
              /></label>
              <label
                >Páginas <span class="field-hint">Opcional</span
                ><input v-model="form.pageCount" type="number" min="1" max="1000000" step="1"
              /></label>
              <label
                >Série <span class="field-hint">Opcional</span
                ><input
                  v-model="form.seriesName"
                  maxlength="200"
                  :aria-invalid="Boolean(form.seriesVolume && !form.seriesName.trim())"
                  :aria-describedby="
                    form.seriesVolume && !form.seriesName.trim() ? 'series-error' : undefined
                  "
                /><span
                  v-if="form.seriesVolume && !form.seriesName.trim()"
                  id="series-error"
                  class="field-error"
                  >Informe a série para adicionar um volume.</span
                ></label
              >
              <label
                >Volume <span class="field-hint">Opcional</span
                ><input v-model="form.seriesVolume" type="number" min="1" max="10000" step="1"
              /></label>
            </div>
          </details>
        </section>
        <section class="form-section" aria-labelledby="collection-title">
          <h3 id="collection-title">Na minha biblioteca</h3>
          <p class="section-hint">Conte como você tem acesso a esta edição.</p>
          <fieldset class="form-choice-group">
            <legend>
              Formato ou origem
              <span class="field-hint">· opcional; escolha quantos se aplicarem</span>
            </legend>
            <div class="form-choices">
              <label class="form-choice"
                ><input v-model="form.ownership" type="checkbox" value="fisico" /><span
                  >Tenho físico</span
                ></label
              >
              <label class="form-choice"
                ><input v-model="form.ownership" type="checkbox" value="ebook" /><span
                  >Tenho e-book</span
                ></label
              >
              <label class="form-choice"
                ><input v-model="unowned" type="checkbox" /><span>Não tenho</span></label
              >
            </div>
            <p class="section-hint">Por exemplo, uma leitura por empréstimo ou assinatura.</p>
          </fieldset>
          <label v-if="ownsCopies" class="quantity-field field-block"
            >Exemplares *<input
              v-model.number="form.quantity"
              type="number"
              required
              min="1"
              max="10000"
              step="1"
            /><span class="section-hint"
              >Cada edição que você tem conta uma vez no painel, independentemente da quantidade ou
              do formato.</span
            ></label
          >
          <p v-else class="section-hint field-block">
            Para contabilizar exemplares, marque “Tenho físico” ou “Tenho e-book”.
          </p>
        </section>
        <section class="form-section" aria-labelledby="reading-title">
          <h3 id="reading-title">Minha leitura</h3>
          <p class="section-hint">Você pode preencher esta parte depois.</p>
          <fieldset class="form-choice-group">
            <legend>Status de leitura</legend>
            <div class="form-choices">
              <label
                v-for="option in [
                  { value: 'nao_lido', label: 'Não lido' },
                  { value: 'lendo', label: 'Lendo' },
                  { value: 'concluido', label: 'Concluído' },
                  { value: 'abandonado', label: 'Abandonado' },
                ]"
                :key="option.value"
                class="form-choice"
                ><input
                  v-model="form.status"
                  type="radio"
                  name="status"
                  :value="option.value"
                /><span>{{ option.label }}</span></label
              >
            </div>
          </fieldset>
          <label class="favorite-field field-block">
            <input v-model="form.favorite" type="checkbox" />
            <PhHeart :size="24" :weight="form.favorite ? 'fill' : 'regular'" aria-hidden="true" />
            <span>Marcar como favorito</span>
          </label>
          <ReviewEditor
            v-model:rating="rating"
            v-model:review="review"
            @invalid="reviewInvalid = $event"
          />
        </section>
        <p v-if="error" role="alert" class="form-error">{{ error }}</p>
        <div class="form-actions">
          <button type="submit" :disabled="saving || lookingUp || closing">
            <LoadingIndicator v-if="saving" compact text="Salvando..." /><template v-else
              >Salvar livro</template
            ></button
          ><button type="button" class="secondary-button" :disabled="saving" @click="requestCancel">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </BaseDrawer>
</template>
