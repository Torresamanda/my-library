<script setup lang="ts">
import type { Review } from '../domain/review'
defineProps<{ review: Review }>()
</script>
<template>
  <div class="review-content">
    <component
      :is="block.type === 'heading' ? `h${block.attrs.level}` : 'p'"
      v-for="(block, index) in review.content"
      :key="index"
    >
      <template v-for="(part, partIndex) in block.content ?? []" :key="partIndex"
        ><br v-if="part.type === 'hardBreak'" /><strong v-else-if="part.marks?.length">{{
          part.text
        }}</strong
        ><template v-else>{{ part.text }}</template></template
      >
    </component>
  </div>
</template>
