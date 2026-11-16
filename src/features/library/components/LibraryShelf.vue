<script setup lang="ts">
import { computed } from 'vue'
import { groupBooks } from '../domain/groupBooks'
import type { LibraryBook } from '../services/books'
const props = defineProps<{ books: LibraryBook[]; search: string }>()
const groups = computed(() => groupBooks(props.books, props.search))
const labels = {
  nao_lido: 'Não lido',
  lendo: 'Lendo',
  concluido: 'Concluído',
  abandonado: 'Abandonado',
}
</script>
<template>
  <div v-if="groups.series.length || groups.standalone.length" class="shelf">
    <section v-if="groups.series.length">
      <h2>Minhas séries</h2>
      <div class="series-grid">
        <details v-for="series in groups.series" :key="series.name" class="series-card">
          <summary>
            <div class="cover-grid" aria-hidden="true">
              <span v-for="n in 4" :key="n">{{
                series.books[n - 1]?.title?.slice(0, 1) || '✦'
              }}</span>
            </div>
            <div>
              <small>SÉRIE</small>
              <h3>Série {{ series.name }}</h3>
              <p>
                {{ series.books.length }} {{ series.books.length === 1 ? 'edição' : 'edições' }}
              </p>
              <span>Abrir série ▾</span>
            </div>
          </summary>
          <ul class="book-list">
            <li v-for="book in series.books" :key="book.id">
              <div>
                <strong>{{ book.title }}</strong>
                <p>
                  {{ book.author
                  }}<template v-if="book.seriesVolume"> · Volume {{ book.seriesVolume }}</template>
                </p>
              </div>
              <span class="badge">{{ labels[book.status] }}</span>
            </li>
          </ul>
        </details>
      </div>
    </section>
    <section v-if="groups.standalone.length">
      <h2>Livros sem série</h2>
      <ul class="book-list standalone">
        <li v-for="book in groups.standalone" :key="book.id">
          <div>
            <strong>{{ book.title }}</strong>
            <p>{{ book.author }}</p>
          </div>
          <span class="badge">{{ labels[book.status] }}</span>
        </li>
      </ul>
    </section>
  </div>
  <section v-else class="empty">
    <h2>{{ search.trim() ? 'Nenhum livro encontrado' : 'Sua estante ainda está vazia' }}</h2>
    <p>
      {{
        search.trim()
          ? 'Tente buscar por outro título, autor, gênero ou série.'
          : 'Os livros cadastrados aparecerão aqui.'
      }}
    </p>
  </section>
</template>
