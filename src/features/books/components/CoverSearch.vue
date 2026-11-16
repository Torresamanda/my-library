<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { normalizeIsbn } from '../domain/isbn'
import {
  searchCovers,
  type CoverSearchResult,
  LibraryRequestError,
} from '../../library/services/books'
import LoadingIndicator from '../../../ui/LoadingIndicator.vue'

const props = defineProps<{
  title: string
  author: string
  isbn: string
  token: () => Promise<string>
}>()
const emit = defineEmits<{ close: []; choose: [url: string] }>()
const title = ref(props.title)
const author = ref(props.author)
const loading = ref(false)
const searched = ref(false)
const error = ref('')
const results = ref<CoverSearchResult[]>([])
const selected = ref('')
let controller: AbortController | undefined
let active = true
onBeforeUnmount(() => {
  active = false
  controller?.abort()
})
function comparison(result: CoverSearchResult): string {
  const current = normalizeIsbn(props.isbn)
  if (!current) return ''
  const found = result.isbns.map(normalizeIsbn).filter((value): value is string => value !== null)
  if (!found.length) return 'ISBN da edição não informado'
  return found.includes(current) ? 'Mesmo ISBN' : 'ISBN diferente: outra edição'
}
const chosen = computed(() => results.value.find((item) => item.id === selected.value))
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
  if (chosen.value?.coverUrl) emit('choose', chosen.value.coverUrl)
}
</script>
<template>
  <section class="cover-search" aria-labelledby="cover-search-title">
    <h4 id="cover-search-title">Escolher capa</h4>
    <p>Pesquise pelo título e autor e confira a edição antes de escolher.</p>
    <div class="cover-search-fields">
      <label>Título<input v-model="title" maxlength="250" /></label
      ><label>Autor<input v-model="author" maxlength="250" /></label>
    </div>
    <button type="button" class="secondary-button" :disabled="loading" @click="search">
      <LoadingIndicator v-if="loading" compact text="Pesquisando..." /><template v-else
        >Pesquisar</template
      >
    </button>
    <div class="cover-provider">
      <img
        src="https://storage.googleapis.com/geo-devrel-public-buckets/powered_by_google_on_white.png"
        alt="Powered by Google"
        referrerpolicy="no-referrer"
      />
    </div>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <p v-else-if="searched && !results.length" role="status">
      Nenhum resultado encontrado. Ajuste a pesquisa ou continue sem escolher uma capa.
    </p>
    <template v-if="results.length">
      <h5>Resultados da pesquisa no Google Books</h5>
      <div class="cover-results" role="radiogroup" aria-label="Escolha uma capa">
        <article v-for="result in results" :key="result.id" class="cover-result">
          <img
            v-if="result.coverUrl"
            :src="result.coverUrl"
            :alt="`Capa de ${result.title}`"
            referrerpolicy="no-referrer"
            loading="lazy"
          />
          <div v-else class="cover-result-placeholder">Sem capa</div>
          <div>
            <strong>{{ result.title }}</strong>
            <p>{{ result.authors.join(', ') || 'Autoria não informada' }}</p>
            <p>
              {{
                [result.publisher, result.publishedDate].filter(Boolean).join(' · ') ||
                'Edição sem detalhes'
              }}
            </p>
            <p v-if="comparison(result)">{{ comparison(result) }}</p>
            <a
              :href="`https://books.google.com/books?id=${result.id}`"
              target="_blank"
              rel="noopener noreferrer"
              >Ver no Google Books</a
            >
          </div>
          <label
            ><input
              v-model="selected"
              type="radio"
              name="cover-selection"
              :value="result.id"
              :disabled="!result.coverUrl"
            />
            Escolher</label
          >
        </article>
      </div>
      <p
        v-if="chosen && comparison(chosen) === 'ISBN diferente: outra edição'"
        class="form-error"
        role="status"
      >
        Esta capa é de outra edição. O ISBN e os demais dados do cadastro não serão alterados.
      </p>
    </template>
    <div class="cover-search-actions">
      <button type="button" :disabled="!chosen?.coverUrl || loading" @click="confirm">
        Usar esta capa</button
      ><button type="button" class="secondary-button" @click="emit('close')">
        Cancelar pesquisa
      </button>
    </div>
  </section>
</template>
