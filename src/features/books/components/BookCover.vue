<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { validCoverUrl, googleCoverId } from '../domain/cover'
import { PhBookOpen } from '../../../icons'
const props = defineProps<{ url?: string | null; title: string; hideSource?: boolean }>()
const failed = ref(false)
watch(
  () => props.url,
  () => {
    failed.value = false
  },
)
const safeUrl = computed(() => (props.url && validCoverUrl(props.url) ? props.url : null))
const googleSource = computed(() => (safeUrl.value ? googleCoverId(safeUrl.value) : null))
</script>
<template>
  <div :class="['book-cover', { 'google-cover': googleSource && !failed && !hideSource }]">
    <img
      v-if="safeUrl && !failed"
      :src="safeUrl"
      :alt="`Capa de ${title}`"
      referrerpolicy="no-referrer"
      loading="lazy"
      @error="failed = true"
    />
    <span v-if="googleSource && !failed && !hideSource" class="cover-source">Google Books</span>
    <span
      v-else-if="!safeUrl || failed"
      class="cover-placeholder"
      role="img"
      :aria-label="`Capa indisponível para ${title}`"
      ><PhBookOpen :size="28" aria-hidden="true"
    /></span>
  </div>
</template>
