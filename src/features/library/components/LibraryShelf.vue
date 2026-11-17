<script setup lang="ts">
import { computed, ref } from 'vue'
import BookCover from '../../books/components/BookCover.vue'
import { PhHeart, PhPlus } from '../../../icons'
import { groupBooks, type LibraryFilters } from '../domain/groupBooks'
import type { LibraryBook } from '../services/books'
const props = defineProps<{ books: LibraryBook[]; search: string; filters: LibraryFilters }>()
const emit = defineEmits<{
  select: [book: LibraryBook]
  clear: []
  add: []
  addSeries: [seriesName: string]
}>()
const groups = computed(() => groupBooks(props.books, props.search, props.filters))
const openSeries = ref(new Set<string>())

function toggleSeries(name: string) {
  const next = new Set(openSeries.value)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  openSeries.value = next
}
const mediaLabels = { livro: 'Livro', quadrinho: 'Quadrinho', manga: 'Mangá', outro: 'Outro' }
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
        <div v-for="(series, index) in groups.series" :key="series.name" class="series-card">
          <button
            type="button"
            class="series-add secondary-button"
            :aria-label="`Adicionar livro à série ${series.name}`"
            :title="`Adicionar livro à série ${series.name}`"
            @click="emit('addSeries', series.name)"
          >
            <PhPlus :size="20" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="series-toggle"
            :aria-expanded="openSeries.has(series.name)"
            :aria-controls="`series-panel-${index}`"
            @click="toggleSeries(series.name)"
          >
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
              <span>{{ openSeries.has(series.name) ? 'Fechar série ▴' : 'Abrir série ▾' }}</span>
            </div>
          </button>
          <div
            :id="`series-panel-${index}`"
            :class="['series-panel', { 'is-open': openSeries.has(series.name) }]"
            :inert="!openSeries.has(series.name)"
            :aria-hidden="!openSeries.has(series.name)"
          >
            <div class="series-panel-inner">
              <ul class="book-list">
                <li v-for="book in series.books" :key="book.id" class="series-book">
                  <BookCover :url="book.coverUrl" :title="book.title" />
                  <div class="series-book-content">
                    <span v-if="book.seriesVolume" class="series-volume"
                      >Volume {{ book.seriesVolume }}</span
                    >
                    <button class="book-link" type="button" @click="emit('select', book)">
                      {{ book.title }}
                    </button>
                    <p class="series-book-author">{{ book.author }}</p>
                    <p
                      v-if="book.publisher || book.pageCount || book.mediaType"
                      class="series-book-meta"
                    >
                      {{
                        [
                          book.publisher,
                          book.pageCount ? `${book.pageCount} páginas` : null,
                          book.mediaType ? mediaLabels[book.mediaType] : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')
                      }}
                    </p>
                    <p v-if="book.genres.length" class="series-book-meta">
                      {{ book.genres.join(' · ') }}
                    </p>
                    <div class="series-book-badges">
                      <span class="badge">{{ labels[book.status] }}</span><span
                        v-if="book.favorite"
                        class="badge favorite-badge"
                        ><PhHeart :size="16" weight="fill" aria-hidden="true" /> Favorito</span
                      >
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section v-if="groups.standalone.length">
      <h2>Livros sem série</h2>
      <ul class="book-list standalone">
        <li v-for="book in groups.standalone" :key="book.id" class="standalone-card">
          <button class="standalone-button" type="button" @click="emit('select', book)">
            <BookCover :url="book.coverUrl" :title="book.title" />
            <div>
              <strong class="standalone-title">
                {{ book.title }}
              </strong>
              <p>{{ book.author }}</p>
              <p v-if="book.mediaType">{{ mediaLabels[book.mediaType] }}</p>
              <span class="badge">{{ labels[book.status] }}</span>
              <span v-if="book.favorite" class="badge">Favorito</span>
            </div>
          </button>
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
          ? 'Confira a busca ou os filtros selecionados. Você pode ajustá-los ou limpar tudo para ver a estante completa.'
          : 'Adicione seu primeiro livro para começar sua estante.'
      }}
    </p>
    <button
      v-if="search.trim() || filters.genre || filters.status || filters.series"
      type="button"
      @click="emit('clear')"
    >
      Limpar busca e filtros
    </button>
    <button v-else type="button" @click="emit('add')">Adicionar primeiro livro</button>
  </section>
</template>
