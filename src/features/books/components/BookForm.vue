<script setup lang="ts">
import { reactive, ref } from 'vue'
import { normalizeIsbn } from '../domain/isbn'
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

async function submit() {
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
        <label>ISBN (opcional)<input v-model="form.isbn" maxlength="32" inputmode="text" /></label>
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
      <p v-if="error" role="alert" class="form-error">{{ error }}</p>
      <div class="form-actions">
        <button type="submit" :disabled="saving">
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
