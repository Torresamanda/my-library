<script setup lang="ts">
import { ref } from 'vue'
import LibraryStats from './components/LibraryStats.vue'
import {
  PhBookOpen,
  PhBooks,
  PhMagnifyingGlass,
  PhMoon,
  PhPlus,
  PhSlidersHorizontal,
  PhSun,
} from './icons'
const dark = ref(true)
const query = ref('')
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
        <button
          class="theme"
          type="button"
          :aria-label="dark ? 'Ativar tema claro' : 'Ativar tema escuro'"
          @click="dark = !dark"
        >
          <PhSun v-if="dark" :size="22" /><PhMoon v-else :size="22" />
        </button>
      </header>
      <LibraryStats />
      <div class="tools">
        <label class="search"
          ><PhMagnifyingGlass :size="22" aria-hidden="true" /><span class="sr-only"
            >Buscar na biblioteca</span
          ><input
            v-model="query"
            type="search"
            placeholder="Buscar na minha biblioteca..."
            disabled /></label
        ><button class="filter" disabled>
          <PhSlidersHorizontal :size="20" aria-hidden="true" /> Filtros
        </button>
      </div>
      <section class="empty">
        <PhBooks :size="48" aria-hidden="true" />
        <h2>Sua biblioteca está tomando forma</h2>
        <p>
          Estamos preparando sua estante. O cadastro e o acesso seguro estarão disponíveis após a
          configuração do serviço.
        </p>
        <button disabled><PhPlus :size="20" aria-hidden="true" /> Adicionar livro</button>
      </section>
      <p class="notice">Prévia em desenvolvimento: nenhuma informação é salva nesta tela.</p>
    </main>
  </div>
</template>
