<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { compareCoverEdition } from '../domain/coverEdition'
import {
  searchCovers,
  type CoverSearchResult,
  LibraryRequestError,
} from '../../library/services/books'
import LoadingIndicator from '../../../ui/LoadingIndicator.vue'
import { useCoverSearchFields } from '../services/coverSearchFields'

const props = defineProps<{
  title: string
  author: string
  isbn: string
  token: () => Promise<string>
}>()
const emit = defineEmits<{ close: []; choose: [result: CoverSearchResult] }>()
const { title, author, titleEdited, authorEdited } = useCoverSearchFields(props)
const loading = ref(false)
const searched = ref(false)
const error = ref('')
const results = ref<CoverSearchResult[]>([])
const selected = ref('')
const failedImages = ref(new Set<string>())
let controller: AbortController | undefined
let active = true
onBeforeUnmount(() => {
  active = false
  controller?.abort()
})
function comparison(result: CoverSearchResult) {
  return compareCoverEdition(props.isbn, result.isbns)
}
const comparisonLabels = {
  same: 'Mesmo ISBN',
  different: 'Outra edição',
  unknown: 'ISBN não informado ou não comparável',
}
const chosen = computed(() => results.value.find((item) => item.id === selected.value))
function imageFailed(id: string) {
  failedImages.value = new Set([...failedImages.value, id])
  if (selected.value === id) selected.value = ''
}

async function search() {
  if (loading.value) return
  if (!title.value.trim() && !author.value.trim()) {
    error.value = 'Informe o título ou o autor para pesquisar.'
    return
  }
  loading.value = true
  error.value = ''
  searched.value = false
  results.value = []
  selected.value = ''
  failedImages.value = new Set()
  controller = new AbortController()
  try {
    const token = await props.token()
    if (!active) return
    results.value = await searchCovers(
      token,
      title.value.trim(),
      author.value.trim(),
      controller.signal,
    )
    if (active) searched.value = true
  } catch (cause) {
    if (active)
      error.value =
        cause instanceof LibraryRequestError && cause.status === 401
          ? 'Não foi possível confirmar seu acesso. Entre novamente.'
          : 'Não foi possível pesquisar agora. Tente novamente mais tarde.'
  } finally {
    if (active) loading.value = false
  }
}

function confirm() {
  if (chosen.value?.coverUrl && !failedImages.value.has(chosen.value.id))
    emit('choose', chosen.value)
}
</script>
<template>
  <section class="cover-search" aria-labelledby="cover-search-title">
    <h4 id="cover-search-title">Escolher capa</h4>
    <p class="cover-search-intro">
      Pesquise pelo título e autor e confira a edição antes de escolher.
    </p>
    <div class="cover-search-fields">
      <label
        >Título<input
          v-model="title"
          maxlength="250"
          @input="titleEdited = true"
          @keydown.enter.prevent="search"
      /></label>
      <label
        >Autor<input
          v-model="author"
          maxlength="250"
          @input="authorEdited = true"
          @keydown.enter.prevent="search"
      /></label>
      <button type="button" class="secondary-button" :disabled="loading" @click="search">
        <LoadingIndicator v-if="loading" compact text="Pesquisando..." /><template v-else
          >Pesquisar</template
        >
      </button>
    </div>
    <div class="cover-search-heading">
      <div>
        <h5>Resultados da pesquisa</h5>
        <p>Fornecidos pelo Google Books</p>
      </div>
      <img
        class="cover-attribution"
        src="https://storage.googleapis.com/geo-devrel-public-buckets/powered_by_google_on_white.png"
        alt="Powered by Google"
        referrerpolicy="no-referrer"
      />
    </div>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="feedback-message" role="status">Pesquisando capas…</p>
    <p v-else-if="searched && !results.length" class="feedback-message" role="status">
      Não encontramos resultados. Confira o título ou o autor e pesquise novamente.
    </p>
    <p v-else-if="!searched" class="cover-search-hint">
      Informe o título ou o autor e selecione Pesquisar.
    </p>
    <div
      v-if="results.length"
      class="cover-results"
      role="radiogroup"
      aria-label="Escolha uma capa"
    >
      <article
        v-for="result in results"
        :key="result.id"
        :class="[
          'cover-result',
          {
            'is-selected': selected === result.id,
            'is-unavailable': !result.coverUrl || failedImages.has(result.id),
          },
        ]"
      >
        <label class="cover-result-choice">
          <input
            v-model="selected"
            type="radio"
            name="cover-selection"
            :value="result.id"
            :disabled="!result.coverUrl || failedImages.has(result.id)"
          />
          <img
            v-if="result.coverUrl && !failedImages.has(result.id)"
            :src="result.coverUrl"
            alt=""
            referrerpolicy="no-referrer"
            loading="lazy"
            @error="imageFailed(result.id)"
          />
          <span v-else class="cover-result-placeholder">Capa indisponível</span>
          <strong>{{ result.title || 'Título não informado' }}</strong>
          <span class="cover-result-meta">{{
            result.authors.join(', ') || 'Autoria não informada'
          }}</span>
          <span class="cover-result-meta">{{
            [result.publisher, result.publishedDate].filter(Boolean).join(' · ') ||
            'Edição sem detalhes'
          }}</span>
          <span class="cover-edition">{{ comparisonLabels[comparison(result)] }}</span>
          <span class="cover-choice-state">{{
            !result.coverUrl || failedImages.has(result.id)
              ? 'Capa indisponível'
              : selected === result.id
                ? '✓ Selecionada'
                : 'Selecionar capa'
          }}</span>
        </label>
        <a
          class="cover-source-link"
          :href="`https://books.google.com/books?id=${result.id}`"
          target="_blank"
          rel="noopener noreferrer"
          >Ver no Google Books ↗</a
        >
      </article>
    </div>
    <div class="cover-search-footer">
      <div class="cover-selection" aria-live="polite">
        <p>
          {{
            chosen
              ? `Selecionada: ${chosen.title || 'Título não informado'}`
              : 'Nenhuma capa selecionada'
          }}
        </p>
        <p v-if="chosen && comparison(chosen) === 'different'" class="cover-warning">
          Esta capa é de outra edição. Os dados do cadastro não serão preenchidos automaticamente.
        </p>
        <p
          v-else-if="chosen && isbn.trim() && comparison(chosen) === 'unknown'"
          class="cover-warning"
        >
          Não foi possível confirmar a edição. Os dados do cadastro não serão preenchidos
          automaticamente.
        </p>
      </div>
      <div class="cover-search-actions">
        <button type="button" class="secondary-button" @click="emit('close')">
          Cancelar pesquisa</button
        ><button
          type="button"
          :disabled="!chosen?.coverUrl || loading || (chosen && failedImages.has(chosen.id))"
          @click="confirm"
        >
          Usar esta capa
        </button>
      </div>
    </div>
  </section>
</template>
