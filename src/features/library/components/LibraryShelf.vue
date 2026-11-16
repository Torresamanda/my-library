<script setup lang="ts">
import { computed } from 'vue'
import BookCover from '../../books/components/BookCover.vue'
import { groupBooks, type LibraryFilters } from '../domain/groupBooks'
import type { LibraryBook } from '../services/books'
const props = defineProps<{ books: LibraryBook[]; search: string; filters: LibraryFilters }>()
const emit = defineEmits<{ select: [book: LibraryBook]; clear: [] }>()
const groups = computed(() => groupBooks(props.books, props.search, props.filters))
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
              <template v-for="n in 4" :key="n"
                ><BookCover
                  v-if="series.books[n - 1]"
                  :url="series.books[n - 1]?.coverUrl"
                  :title="series.books[n - 1]?.title ?? ''"
                /><span v-else>✦</span></template
              >
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
              <BookCover :url="book.coverUrl" :title="book.title" />
              <div>
                <button class="book-link" type="button" @click="emit('select', book)">
                  {{ book.title }}
                </button>
                <p>
                  {{ book.author
                  }}<template v-if="book.seriesVolume"> · Volume {{ book.seriesVolume }}</template>
                </p>
                <p v-if="book.publisher || book.pageCount">
                  {{
                    [book.publisher, book.pageCount ? `${book.pageCount} páginas` : null]
                      .filter(Boolean)
                      .join(' · ')
                  }}
                </p>
                <p v-if="book.genres.length">{{ book.genres.join(' · ') }}</p>
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
          <BookCover :url="book.coverUrl" :title="book.title" />
          <div>
            <button class="book-link" type="button" @click="emit('select', book)">
              {{ book.title }}
            </button>
            <p>{{ book.author }}</p>
            <p v-if="book.publisher || book.pageCount">
              {{
                [book.publisher, book.pageCount ? `${book.pageCount} páginas` : null]
                  .filter(Boolean)
                  .join(' · ')
              }}
            </p>
            <p v-if="book.genres.length">{{ book.genres.join(' · ') }}</p>
          </div>
          <span class="badge">{{ labels[book.status] }}</span>
        </li>
      </ul>
    </section>
  </div>
  <section v-else class="empty">
    <h2>
      {{
        search.trim() || filters.genre || filters.status || filters.series
          ? 'Nenhum livro encontrado'
          : 'Sua estante ainda está vazia'
      }}
    </h2>
    <p>
      {{
        search.trim() || filters.genre || filters.status || filters.series
          ? 'Tente buscar por outro título, autor, gênero ou série.'
          : 'Os livros cadastrados aparecerão aqui.'
      }}
    </p>
    <button
      v-if="search.trim() || filters.genre || filters.status || filters.series"
      type="button"
      @click="emit('clear')"
    >
      Limpar busca e filtros
    </button>
  </section>
</template>
