<script setup lang="ts">
import { PhBookOpen, PhBooks, PhCheckCircle, PhXCircle } from '../../../icons'
const stats = [
  { label: 'Exemplares', icon: PhBooks },
  { label: 'Lidos', icon: PhCheckCircle },
  { label: 'Lendo', icon: PhBookOpen },
  { label: 'Abandonados', icon: PhXCircle },
]
</script>
<template>
  <section aria-label="Resumo da biblioteca" class="stats">
    <article v-for="stat in stats" :key="stat.label" class="stat">
      <component :is="stat.icon" :size="27" aria-hidden="true" />
      <div>
        <span>{{ stat.label }}</span>
        <strong>—</strong>
      </div>
    </article>
  </section>
</template>
