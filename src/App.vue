<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { User } from '@firebase/auth'
import {
  completeRedirect,
  firebaseConfigured,
  login,
  logout,
  observeUser,
} from './features/auth/firebase'
import { loginErrorMessage } from './features/auth/loginError'
import { isLibraryPath } from './features/navigation/path'
import BookForm from './features/books/components/BookForm.vue'
import BookDetails from './features/books/components/BookDetails.vue'
import LibraryStats from './features/library/components/LibraryStats.vue'
import LibraryShelf from './features/library/components/LibraryShelf.vue'
import LoadingIndicator from './ui/LoadingIndicator.vue'
import { libraryStats } from './features/library/domain/libraryStats'
import {
  fetchBooks,
  LibraryRequestError,
  type LibraryBook,
} from './features/library/services/books'
import { PhBookOpen, PhLockKey, PhMagnifyingGlass, PhMoon, PhSun, PhWarningCircle } from './icons'

type View = 'checking' | 'signed-out' | 'loading' | 'ready' | 'denied' | 'error' | 'unconfigured'
const view = ref<View>(firebaseConfigured ? 'checking' : 'unconfigured')
const user = ref<User | null>(null)
const books = ref<LibraryBook[]>([])
const search = ref('')
const adding = ref(false)
const selectedBook = ref<LibraryBook | null>(null)
const editingBook = ref<LibraryBook | null>(null)
const loggingIn = ref(false)
const isNotFound = !isLibraryPath(window.location.pathname)
const success = ref('')
const dark = ref(localStorage.getItem('biblioteca-theme') !== 'light')
const message = ref('')
const stats = computed(() => libraryStats(books.value))
let unsubscribe = () => {}
let requestVersion = 0

async function loadBooks(current: User) {
  const version = ++requestVersion
  view.value = 'loading'
  books.value = []
  try {
    const token = await current.getIdToken()
    const loaded = await fetchBooks(token)
    if (version !== requestVersion) return
    books.value = loaded
    view.value = 'ready'
  } catch (error) {
    if (version !== requestVersion) return
    view.value = error instanceof LibraryRequestError && error.status === 401 ? 'denied' : 'error'
  }
}

async function enter() {
  message.value = ''
  loggingIn.value = true
  try {
    await login()
  } catch (error) {
    message.value = loginErrorMessage(error)
  } finally {
    loggingIn.value = false
  }
}

async function leave() {
  message.value = ''
  try {
    await logout()
  } catch {
    message.value = 'Não foi possível sair. Tente novamente.'
  }
}

async function bookSaved() {
  success.value = editingBook.value
    ? 'Livro atualizado na biblioteca.'
    : 'Livro adicionado à biblioteca.'
  adding.value = false
  editingBook.value = null
  selectedBook.value = null
  if (user.value) await loadBooks(user.value)
}

async function bookDeleted() {
  selectedBook.value = null
  success.value = 'Livro excluído da biblioteca.'
  if (user.value) await loadBooks(user.value)
}

function editBook() {
  editingBook.value = selectedBook.value
  selectedBook.value = null
}

function cancelEdit() {
  selectedBook.value = editingBook.value
  editingBook.value = null
}

function selectBook(book: LibraryBook) {
  selectedBook.value = book
  success.value = ''
}

function startAdding() {
  adding.value = true
  success.value = ''
}

function toggleTheme() {
  dark.value = !dark.value
  localStorage.setItem('biblioteca-theme', dark.value ? 'dark' : 'light')
}

onMounted(() => {
  void completeRedirect().catch((error: unknown) => {
    message.value = loginErrorMessage(error)
  })
  unsubscribe = observeUser((current) => {
    user.value = current
    if (current) {
      void loadBooks(current)
      return
    }
    requestVersion++
    books.value = []
    adding.value = false
    selectedBook.value = null
    editingBook.value = null
    success.value = ''
    if (firebaseConfigured) view.value = 'signed-out'
  })
})
onBeforeUnmount(() => {
  requestVersion++
  unsubscribe()
})
</script>
<template>
  <div :class="['app', { light: !dark }]">
    <main class="layout">
      <header class="header">
        <div class="brand">
          <span class="brand-mark"><PhBookOpen :size="24" aria-hidden="true" /></span>
          <div>
            <h1>Minha <em>biblioteca</em></h1>
            <p>Seu cantinho para organizar suas leituras</p>
          </div>
        </div>
        <div class="header-actions">
          <button
            class="theme"
            type="button"
            :aria-label="dark ? 'Ativar tema claro' : 'Ativar tema escuro'"
            @click="toggleTheme"
          >
            <PhSun v-if="dark" :size="22" /><PhMoon v-else :size="22" /></button
          ><button v-if="user" class="filter" type="button" @click="leave">Sair</button>
        </div>
      </header>
      <p v-if="message" role="alert" class="notice">{{ message }}</p>
      <section v-if="isNotFound" class="empty state-page" aria-labelledby="not-found-title">
        <span class="state-icon"><PhBookOpen :size="40" aria-hidden="true" /></span>
        <p class="state-kicker">Página 404</p>
        <h2 id="not-found-title">Esta página saiu da estante</h2>
        <p>Não encontramos este endereço. Volte para sua biblioteca para continuar.</p>
        <a class="primary-link" href="/">Voltar à biblioteca</a>
      </section>
      <section v-else-if="view === 'unconfigured'" class="empty state-page">
        <span class="state-icon"><PhWarningCircle :size="40" aria-hidden="true" /></span>
        <h2>Biblioteca em preparação</h2>
        <p>O acesso com Google ainda precisa ser configurado para abrir sua estante.</p>
      </section>
      <section v-else-if="view === 'signed-out'" class="empty">
        <PhBookOpen :size="48" aria-hidden="true" />
        <h2>Bem-vinda à sua biblioteca</h2>
        <p>Entre com a conta Google autorizada para acessar sua estante.</p>
        <button type="button" :disabled="loggingIn" @click="enter">
          <LoadingIndicator v-if="loggingIn" compact text="Abrindo o Google..." />
          <template v-else>Entrar com Google</template>
        </button>
      </section>
      <section v-else-if="view === 'checking' || view === 'loading'" class="empty">
        <LoadingIndicator text="Preparando sua estante..." />
      </section>
      <section v-else-if="view === 'denied'" class="empty state-page">
        <span class="state-icon"><PhLockKey :size="40" aria-hidden="true" /></span>
        <p class="state-kicker">Acesso não autorizado</p>
        <h2>Acesso restrito</h2>
        <p>Esta conta não tem acesso à biblioteca. Saia e entre com a conta autorizada.</p>
        <button type="button" @click="leave">Trocar de conta</button>
      </section>
      <section v-else-if="view === 'error'" class="empty state-page" role="alert">
        <span class="state-icon"><PhWarningCircle :size="40" aria-hidden="true" /></span>
        <p class="state-kicker">Algo não saiu como esperado</p>
        <h2>Não foi possível carregar</h2>
        <p>Confira sua conexão e tente novamente.</p>
        <button type="button" @click="user && loadBooks(user)">Tentar novamente</button>
      </section>
      <template v-else
        ><p v-if="success" role="status">{{ success }}</p>
        <LibraryStats :stats="stats" />
        <div class="tools">
          <label class="search"
            ><PhMagnifyingGlass :size="22" aria-hidden="true" /><span class="sr-only"
              >Buscar na biblioteca</span
            ><input
              v-model="search"
              type="search"
              placeholder="Buscar título, autor, gênero ou série..."
          /></label>
          <button class="add-book" type="button" @click="startAdding">Adicionar livro</button>
        </div>
        <LibraryShelf :books="books" :search="search" @select="selectBook" />
      </template>
      <BookDetails
        v-if="selectedBook && user && view === 'ready'"
        :book="selectedBook"
        :token="() => user!.getIdToken()"
        @close="selectedBook = null"
        @edit="editBook"
        @deleted="bookDeleted"
      />
      <BookForm
        v-if="editingBook && user && view === 'ready'"
        :book="editingBook"
        :token="() => user!.getIdToken()"
        @cancel="cancelEdit"
        @saved="bookSaved"
      />
      <BookForm
        v-if="adding && user && view === 'ready'"
        :token="() => user!.getIdToken()"
        @cancel="adding = false"
        @saved="bookSaved"
      />
    </main>
  </div>
</template>
