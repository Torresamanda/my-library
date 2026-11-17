<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
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
import { prefillFromCover } from '../domain/coverPrefill'
import { validateBookFields, type BookFormStep, type FormIssue } from '../domain/bookFormValidation'
import type { SeriesDefaults } from '../../library/domain/seriesDefaults'
import BaseDrawer from '../../../ui/BaseDrawer.vue'
import LoadingIndicator from '../../../ui/LoadingIndicator.vue'
import { PhArrowLeft, PhArrowRight, PhHeart } from '../../../icons'
import { lookupIsbn } from '../services/lookup'
import { autofillField, createLookupScheduler } from '../services/automaticLookup'
import {
  createBook,
  updateBook,
  LibraryRequestError,
  type BookDraft,
  type LibraryBook,
  type CoverSearchResult,
} from '../../library/services/books'

const props = defineProps<{
  token: () => Promise<string>
  book?: LibraryBook
  initialSeries?: SeriesDefaults | null
}>()
const emit = defineEmits<{ cancel: []; saved: [] }>()
const form = reactive({
  favorite: props.book?.favorite ?? false,
  mediaType: (props.book?.mediaType ?? '') as MediaType | '',
  ownership: [...(props.book?.ownership ?? [])] as Ownership,
  title: props.book?.title ?? '',
  author: props.book?.author ?? props.initialSeries?.author ?? '',
  isbn: props.book?.isbn ?? '',
  genres: props.book?.genres.join(', ') ?? props.initialSeries?.genres.join(', ') ?? '',
  publisher: props.book?.publisher ?? props.initialSeries?.publisher ?? '',
  pageCount: props.book?.pageCount?.toString() ?? '',
  seriesName: props.book?.seriesName ?? props.initialSeries?.seriesName ?? '',
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

const step = ref<BookFormStep>(0)
const stepNames = ['Livro', 'Organização', 'Leitura'] as const
const scanner = ref<InstanceType<typeof BarcodeScanner> | null>(null)

async function showIssue(issue: FormIssue) {
  scanner.value?.stopForNavigation()
  step.value = issue.step
  cameraActive.value = false
  if (issue.expandEdition) extraOpen.value = true
  error.value = issue.message
  await nextTick()
  const target = document.getElementById(issue.field)
  target?.focus()
  target?.scrollIntoView({ block: 'nearest' })
}

async function goToStep(next: BookFormStep) {
  if (saving.value || closing.value || lookingUp.value || next === step.value) return
  if (!props.book && step.value === 0 && next > 0) {
    const issue = validateBookFields(form, ownsCopies.value, false, true)
    if (issue) {
      await showIssue(issue)
      return
    }
  }
  error.value = ''
  scanner.value?.stopForNavigation()
  cameraActive.value = false
  step.value = next
  await nextTick()
  const heading = document.getElementById(`book-step-heading-${next}`)
  heading?.focus()
  heading?.scrollIntoView({ block: 'start' })
}

function invalidNumberInput(): FormIssue | null {
  const fields = [
    { id: 'book-pages', label: 'páginas', expandEdition: true },
    { id: 'book-volume', label: 'volume', expandEdition: true },
    { id: 'book-quantity', label: 'quantidade', expandEdition: false },
  ]
  for (const field of fields) {
    const input = document.getElementById(field.id)
    if (input instanceof HTMLInputElement && !input.validity.valid) {
      return {
        step: 1,
        field: field.id,
        expandEdition: field.expandEdition,
        message: `Confira o valor de ${field.label} e informe um número inteiro válido.`,
      }
    }
  }
  return null
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
const lookupScheduled = ref(false)
let disposed = false
const coverUrl = ref<string | null>(props.book?.coverUrl ?? null)
const coverSearchOpen = ref(false)
let coverChoiceVersion = 0
function chooseCover(result: CoverSearchResult) {
  if (!result.coverUrl) return
  coverChoiceVersion++
  coverUrl.value = result.coverUrl
  const fields = prefillFromCover(form, result)
  form.title = fields.title
  form.author = fields.author
  form.publisher = fields.publisher
  form.pageCount = fields.pageCount
  form.genres = fields.genres
  if (form.publisher || form.pageCount) extraOpen.value = true
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
const scheduler = createLookupScheduler(() => {
  lookupScheduled.value = false
  void lookup()
})
onBeforeUnmount(() => {
  disposed = true
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
  lookupScheduled.value = Boolean(normalizeIsbn(form.isbn))
}

function scanned(isbn: string) {
  form.isbn = isbn
  isbnChanged()
  void lookup()
}

async function lookup() {
  scheduler.cancel()
  lookupScheduled.value = false
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
  if (closing.value || saving.value || lookingUp.value) return
  if (lookupScheduled.value) {
    await lookup()
    if (disposed || closing.value || saving.value || lookingUp.value || lookupScheduled.value)
      return
  }
  scheduler.cancel()
  error.value = ''
  const genres = form.genres
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean)
  const issue = validateBookFields(
    form,
    ownsCopies.value,
    reviewInvalid.value || Boolean(review.value && reviewLength(review.value) > 500),
  )
  const numericIssue = issue ? null : invalidNumberInput()
  if (issue || numericIssue) {
    await showIssue((issue ?? numericIssue)!)
    return
  }
  const volume = form.seriesVolume ? Number(form.seriesVolume) : null
  const pageCount = form.pageCount ? Number(form.pageCount) : null
  const quantityValid =
    Number.isInteger(form.quantity) && form.quantity >= 1 && form.quantity <= 10000
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
      <p v-if="initialSeries" class="feedback-message" role="status">
        Novo livro da série {{ initialSeries.seriesName }}. Confira os dados preenchidos antes de
        salvar.
      </p>
      <form novalidate @submit.prevent="submit">
        <nav class="book-steps" aria-label="Etapas do cadastro">
          <button
            v-for="(name, index) in stepNames"
            :key="name"
            type="button"
            class="book-step"
            :aria-current="step === index ? 'step' : undefined"
            :disabled="saving || closing || lookingUp"
            @click="goToStep(index as BookFormStep)"
          >
            <span class="book-step-number" aria-hidden="true">{{ index + 1 }}</span><span>{{
              name
            }}</span>
          </button>
        </nav>
        <section v-show="step === 0" class="form-section" aria-labelledby="book-step-heading-0">
          <p class="book-step-caption">Etapa 1 de 3</p>
          <h3 id="book-step-heading-0" tabindex="-1">Qual livro vamos adicionar?</h3>
          <p class="section-hint">O ISBN pode ajudar a preencher os dados da edição.</p>
          <div :class="['isbn-lookup', { 'is-scanning': cameraActive }]">
            <label
              >ISBN <span class="field-hint">Opcional</span
              ><input
                id="book-isbn"
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
              <BarcodeScanner
                ref="scanner"
                @scanned="scanned"
                @active-change="cameraActive = $event"
              />
            </div>
          </div>
          <p class="section-hint">
            Sem ISBN? Continue preenchendo abaixo. Um ISBN válido é consultado automaticamente.
          </p>
          <p v-if="lookupMessage" class="feedback-message" role="status">{{ lookupMessage }}</p>
        </section>
        <section v-show="step === 0" class="form-section" aria-labelledby="book-info-title">
          <h3 id="book-info-title">Sobre o livro</h3>
          <p class="section-hint">Confira ou complete as informações principais.</p>
          <div class="form-book-preview">
            <div class="form-cover">
              <BookCover :url="coverUrl" :title="form.title || 'livro'" /><span
                >Prévia da capa</span
              >
            </div>
            <div class="form-book-fields">
              <label
                >Título *<input
                  id="book-title"
                  v-model="form.title"
                  required
                  maxlength="250"
                  autocomplete="off"
              /></label>
              <label
                >Autor *<input
                  id="book-author"
                  v-model="form.author"
                  required
                  maxlength="250"
                  autocomplete="off"
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
        </section>
        <section v-show="step === 1" class="form-section" aria-labelledby="book-step-heading-1">
          <p class="book-step-caption">Etapa 2 de 3</p>
          <h3 id="book-step-heading-1" tabindex="-1">Como organizar esta edição?</h3>
          <p class="section-hint">
            Estas informações são opcionais e podem ser preenchidas depois.
          </p>
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
                ><input
                  id="book-pages"
                  v-model="form.pageCount"
                  type="number"
                  min="1"
                  max="1000000"
                  step="1"
              /></label>
              <label
                >Série <span class="field-hint">Opcional</span
                ><input
                  id="book-series"
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
                ><input
                  id="book-volume"
                  v-model="form.seriesVolume"
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
              /></label>
            </div>
          </details>
        </section>
        <section v-show="step === 1" class="form-section" aria-labelledby="collection-title">
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
          </fieldset>
          <label v-if="ownsCopies" class="quantity-field field-block"
            >Exemplares *<input
              id="book-quantity"
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
        </section>
        <section v-show="step === 2" class="form-section" aria-labelledby="book-step-heading-2">
          <p class="book-step-caption">Etapa 3 de 3</p>
          <h3 id="book-step-heading-2" tabindex="-1">Como está sua leitura?</h3>
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
        <div class="step-navigation" aria-label="Navegação entre etapas">
          <button
            v-if="step > 0"
            type="button"
            class="secondary-button step-nav-icon"
            :disabled="saving || closing || lookingUp"
            :aria-label="`Voltar para ${stepNames[step - 1]}`"
            :title="`Voltar para ${stepNames[step - 1]}`"
            @click="goToStep((step - 1) as BookFormStep)"
          >
            <PhArrowLeft :size="20" aria-hidden="true" />
          </button>
          <button
            v-if="step < 2"
            type="button"
            class="secondary-button step-nav-icon next-step"
            :disabled="saving || closing || lookingUp"
            :aria-label="`Continuar para ${stepNames[step + 1]}`"
            :title="`Continuar para ${stepNames[step + 1]}`"
            @click="goToStep((step + 1) as BookFormStep)"
          >
            <PhArrowRight :size="20" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  </BaseDrawer>
</template>
