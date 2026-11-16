<script setup lang="ts">
import type { LibraryStats } from '../domain/libraryStats'
import { PhBookOpen, PhBooks, PhCheckCircle, PhXCircle } from '../../../icons'
defineProps<{ stats: LibraryStats }>()
</script>
<template>
  <section aria-label="Resumo da biblioteca" class="stats">
    <article class="stat">
      <PhBooks :size="27" aria-hidden="true" />
      <div>
        <span>Exemplares</span><strong>{{ stats.copies }}</strong>
      </div>
    </article>
    <article class="stat">
      <PhCheckCircle :size="27" aria-hidden="true" />
      <div>
        <span>Lidos</span><strong>{{ stats.read }}</strong>
      </div>
    </article>
    <article class="stat">
      <PhBookOpen :size="27" aria-hidden="true" />
      <div>
        <span>Lendo</span><strong>{{ stats.reading }}</strong>
      </div>
    </article>
    <article class="stat">
      <PhXCircle :size="27" aria-hidden="true" />
      <div>
        <span>Abandonados</span><strong>{{ stats.abandoned }}</strong>
      </div>
    </article>
  </section>
</template>
