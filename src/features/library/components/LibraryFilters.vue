<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LibraryBook } from '../services/books'
import type { LibraryFilters } from '../domain/groupBooks'
const props = defineProps<{ books: LibraryBook[]; filters: LibraryFilters }>()
const emit = defineEmits<{ change: [value: LibraryFilters] }>()
const expanded = ref(false)
const activeCount = computed(
  () => [props.filters.genre, props.filters.status, props.filters.series].filter(Boolean).length,
)
const statusLabels: Record<string, string> = {
  nao_lido: 'Não lido',
  lendo: 'Lendo',
  concluido: 'Concluído',
  abandonado: 'Abandonado',
}
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
  <div class="filters-panel" aria-label="Filtros da estante">
    <button
      class="filter-toggle secondary-button"
      type="button"
      :aria-expanded="expanded"
      aria-controls="library-filter-fields"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Ocultar filtros' : 'Mostrar filtros'
      }}<template v-if="activeCount"> ({{ activeCount }})</template>
    </button>
    <div id="library-filter-fields" :class="['library-filters', { expanded }]">
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
    <div v-if="activeCount" class="active-filters" aria-label="Filtros ativos">
      <button
        v-if="filters.genre"
        type="button"
        :aria-label="`Remover filtro de gênero ${filters.genre}`"
        @click="emit('change', { ...filters, genre: '' })"
      >
        {{ filters.genre }} ×
      </button>
      <button
        v-if="filters.status"
        type="button"
        :aria-label="`Remover filtro de status ${statusLabels[filters.status]}`"
        @click="emit('change', { ...filters, status: '' })"
      >
        {{ statusLabels[filters.status] }} ×
      </button>
      <button
        v-if="filters.series"
        type="button"
        :aria-label="`Remover filtro de série ${filters.series === 'none' ? 'Sem série' : filters.series.slice(5)}`"
        @click="emit('change', { ...filters, series: '' })"
      >
        {{ filters.series === 'none' ? 'Sem série' : filters.series.slice(5) }} ×
      </button>
    </div>
  </div>
</template>
