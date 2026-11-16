<script setup lang="ts">
import { computed } from 'vue'
import type { LibraryBook } from '../services/books'
import type { LibraryFilters } from '../domain/groupBooks'
const props = defineProps<{ books: LibraryBook[]; filters: LibraryFilters }>()
const emit = defineEmits<{ change: [value: LibraryFilters] }>()
function choices(values: string[]) {
  const unique = new Map<string, string>()
  for (const value of values) {
    const clean = value.trim()
    if (clean && !unique.has(clean.toLocaleLowerCase('pt-BR')))
      unique.set(clean.toLocaleLowerCase('pt-BR'), clean)
  }
  return [...unique.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
const genres = computed(() => choices(props.books.flatMap((book) => book.genres)))
const series = computed(() => choices(props.books.map((book) => book.seriesName ?? '')))
function change(key: keyof LibraryFilters, event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('change', { ...props.filters, [key]: value })
}
</script>
<template>
  <div class="library-filters" aria-label="Filtros da estante">
    <label
      >Gênero<select :value="filters.genre" @change="change('genre', $event)">
        <option value="">Todos os gêneros</option>
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select></label
    >
    <label
      >Status<select :value="filters.status" @change="change('status', $event)">
        <option value="">Todos os status</option>
        <option value="nao_lido">Não lido</option>
        <option value="lendo">Lendo</option>
        <option value="concluido">Concluído</option>
        <option value="abandonado">Abandonado</option>
      </select></label
    >
    <label
      >Série<select :value="filters.series" @change="change('series', $event)">
        <option value="">Todas as séries</option>
        <option value="none">Sem série</option>
        <option v-for="name in series" :key="name" :value="`name:${name}`">{{ name }}</option>
      </select></label
    >
    <label
      >Ordenar por título<select :value="filters.order" @change="change('order', $event)">
        <option value="title-asc">A–Z</option>
        <option value="title-desc">Z–A</option>
      </select></label
    >
  </div>
</template>
