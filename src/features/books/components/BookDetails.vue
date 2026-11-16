<script setup lang="ts">
import { nextTick, ref } from 'vue'
import BaseDrawer from '../../../ui/BaseDrawer.vue'
import LoadingIndicator from '../../../ui/LoadingIndicator.vue'
import { deleteBook, LibraryRequestError, type LibraryBook } from '../../library/services/books'
const props = defineProps<{ book: LibraryBook; token: () => Promise<string> }>()
const emit = defineEmits<{ close: []; edit: []; deleted: [] }>()
const confirming = ref(false)
const cancelButton = ref<HTMLButtonElement | null>(null)
const deleteButton = ref<HTMLButtonElement | null>(null)
const deleting = ref(false)
const error = ref('')
const labels = {
  nao_lido: 'Não lido',
  lendo: 'Lendo',
  concluido: 'Concluído',
  abandonado: 'Abandonado',
}
async function startConfirmation() {
  confirming.value = true
  await nextTick()
  cancelButton.value?.focus()
}

async function cancelDeletion() {
  confirming.value = false
  error.value = ''
  await nextTick()
  deleteButton.value?.focus()
}

async function remove() {
  error.value = ''
  deleting.value = true
  try {
    await deleteBook(await props.token(), props.book.id)
    emit('deleted')
  } catch (cause) {
    error.value =
      cause instanceof LibraryRequestError && cause.status === 401
        ? 'Sua sessão expirou ou o acesso foi negado. Entre novamente.'
        : cause instanceof LibraryRequestError && cause.status === 404
          ? 'Este livro não foi encontrado. Feche os detalhes e atualize a estante.'
          : 'Não foi possível excluir. Confira sua conexão e tente novamente.'
  } finally {
    deleting.value = false
  }
}
</script>
<template>
  <BaseDrawer title="Detalhes do livro" :close-disabled="deleting" @close="emit('close')">
    <div class="book-details">
      <h3>{{ book.title }}</h3>
      <dl>
        <div>
          <dt>Autor</dt>
          <dd>{{ book.author }}</dd>
        </div>
        <div>
          <dt>ISBN</dt>
          <dd>{{ book.isbn || 'Não informado' }}</dd>
        </div>
        <div>
          <dt>Gêneros</dt>
          <dd>{{ book.genres.length ? book.genres.join(', ') : 'Não informados' }}</dd>
        </div>
        <div>
          <dt>Série</dt>
          <dd>
            {{ book.seriesName || 'Não informada'
            }}<template v-if="book.seriesVolume"> · Volume {{ book.seriesVolume }}</template>
          </dd>
        </div>
        <div>
          <dt>Editora</dt>
          <dd>{{ book.publisher || 'Não informada' }}</dd>
        </div>
        <div>
          <dt>Páginas</dt>
          <dd>{{ book.pageCount ?? 'Não informado' }}</dd>
        </div>
        <div>
          <dt>Quantidade de exemplares</dt>
          <dd>{{ book.quantity }}</dd>
        </div>
        <div>
          <dt>Status de leitura</dt>
          <dd>{{ labels[book.status] }}</dd>
        </div>
      </dl>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <div v-if="!confirming" class="form-actions">
        <button type="button" @click="emit('edit')">Editar livro</button>
        <button
          ref="deleteButton"
          type="button"
          class="secondary-button"
          @click="startConfirmation"
        >
          Excluir livro
        </button>
      </div>
      <div v-else class="delete-confirmation" role="group" aria-labelledby="delete-question">
        <p id="delete-question">
          Excluir “{{ book.title }}” e
          {{ book.quantity === 1 ? 'seu exemplar' : 'seus exemplares' }} da biblioteca?
        </p>
        <p>Esta ação não pode ser desfeita.</p>
        <div class="form-actions">
          <button type="button" :disabled="deleting" @click="remove">
            <LoadingIndicator v-if="deleting" compact text="Excluindo..." /><template v-else
              >Confirmar exclusão</template
            ></button
          ><button
            ref="cancelButton"
            type="button"
            class="secondary-button"
            :disabled="deleting"
            @click="cancelDeletion"
          >
            Cancelar exclusão
          </button>
        </div>
      </div>
    </div>
  </BaseDrawer>
</template>
