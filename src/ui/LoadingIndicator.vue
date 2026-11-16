<script setup lang="ts">
import { PhBookOpen } from '../icons'

defineProps<{ text: string; compact?: boolean }>()
</script>

<template>
  <span :class="['loading', { 'loading-compact': compact }]" role="status" aria-live="polite">
    <span class="loading-book" aria-hidden="true"><PhBookOpen :size="compact ? 20 : 32" /></span>
    <span>{{ text }}</span>
    <span class="loading-dots" aria-hidden="true"><i></i><i></i><i></i></span>
  </span>
</template>
