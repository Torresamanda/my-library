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
import LibraryStats from './features/library/components/LibraryStats.vue'
import LibraryShelf from './features/library/components/LibraryShelf.vue'
import { libraryStats } from './features/library/domain/libraryStats'
import {
  fetchBooks,
  LibraryRequestError,
  type LibraryBook,
} from './features/library/services/books'
import { PhBookOpen, PhMagnifyingGlass, PhMoon, PhSun } from './icons'

type View = 'checking' | 'signed-out' | 'loading' | 'ready' | 'denied' | 'error' | 'unconfigured'
const view = ref<View>(firebaseConfigured ? 'checking' : 'unconfigured')
const user = ref<User | null>(null)
const books = ref<LibraryBook[]>([])
const search = ref('')
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
  try {
    await login()
  } catch (error) {
    message.value = loginErrorMessage(error)
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
          <PhBookOpen :size="38" aria-hidden="true" />
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
      <section v-if="view === 'unconfigured'" class="empty">
        <h2>Biblioteca em preparação</h2>
        <p>O acesso com Google ainda precisa ser configurado para abrir sua estante.</p>
      </section>
      <section v-else-if="view === 'signed-out'" class="empty">
        <PhBookOpen :size="48" aria-hidden="true" />
        <h2>Bem-vinda à sua biblioteca</h2>
        <p>Entre com a conta Google autorizada para acessar sua estante.</p>
        <button type="button" @click="enter">Entrar com Google</button>
      </section>
      <section v-else-if="view === 'checking' || view === 'loading'" class="empty" role="status">
        <p>Carregando sua biblioteca...</p>
      </section>
      <section v-else-if="view === 'denied'" class="empty">
        <h2>Acesso restrito</h2>
        <p>Esta conta não tem acesso à biblioteca. Saia e entre com a conta autorizada.</p>
        <button type="button" @click="leave">Trocar de conta</button>
      </section>
      <section v-else-if="view === 'error'" class="empty" role="alert">
        <h2>Não foi possível carregar</h2>
        <p>Confira sua conexão e tente novamente.</p>
        <button type="button" @click="user && loadBooks(user)">Tentar novamente</button>
      </section>
      <template v-else
        ><LibraryStats :stats="stats" />
        <div class="tools">
          <label class="search"
            ><PhMagnifyingGlass :size="22" aria-hidden="true" /><span class="sr-only"
              >Buscar na biblioteca</span
            ><input
              v-model="search"
              type="search"
              placeholder="Buscar título, autor, gênero ou série..."
          /></label>
        </div>
        <LibraryShelf :books="books" :search="search" />
        <p class="notice">Cadastro e capas estão em preparação.</p></template
      >
    </main>
  </div>
</template>
