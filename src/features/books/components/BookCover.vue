<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { PhBookOpen } from '../../../icons'
const props = defineProps<{ url?: string | null; title: string }>()
const failed = ref(false)
watch(
  () => props.url,
  () => {
    failed.value = false
  },
)
const safeUrl = computed(() =>
  props.url &&
  /^https:\/\/covers\.openlibrary\.org\/b\/id\/[1-9][0-9]{0,15}-M\.jpg$/.test(props.url)
    ? props.url
    : null,
)
</script>
<template>
  <div class="book-cover">
    <img
      v-if="safeUrl && !failed"
      :src="safeUrl"
      :alt="`Capa de ${title}`"
      referrerpolicy="no-referrer"
      loading="lazy"
      @error="failed = true"
    />
    <span
      v-else
      class="cover-placeholder"
      role="img"
      :aria-label="`Capa indisponível para ${title}`"
      ><PhBookOpen :size="28" aria-hidden="true"
    /></span>
  </div>
</template>
