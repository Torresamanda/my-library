<script setup lang="ts">
import { computed } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { PhStar } from '../../../icons'
import { reviewDraftSchema, reviewLength, type Review } from '../domain/review'

const props = defineProps<{ review: Review | null; rating: number | null }>()
const emit = defineEmits<{
  'update:review': [value: Review | null]
  'update:rating': [value: number | null]
  invalid: [value: boolean]
}>()
const empty: Review = { type: 'doc', content: [{ type: 'paragraph' }] }
const count = computed(() => (props.review ? reviewLength(props.review) : 0))
const editor = useEditor({
  content: props.review ?? empty,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      blockquote: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      listKeymap: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      italic: false,
      strike: false,
      link: false,
      underline: false,
    }),
  ],
  editorProps: {
    attributes: {
      'aria-label': 'Comentário pessoal',
      'aria-describedby': 'review-count',
      role: 'textbox',
      'aria-multiline': 'true',
    },
  },
  onUpdate: ({ editor: instance }) => {
    const parsed = reviewDraftSchema.safeParse(instance.getJSON())
    emit('invalid', !parsed.success)
    if (parsed.success) emit('update:review', reviewLength(parsed.data) ? parsed.data : null)
  },
})
</script>
<template>
  <fieldset class="rating-field">
    <legend>Avaliação (opcional)</legend>
    <label
      ><input
        type="radio"
        name="rating"
        :checked="rating === null"
        @change="emit('update:rating', null)"
      />
      Sem avaliação</label
    >
    <label v-for="n in 5" :key="n"
      ><input
        type="radio"
        name="rating"
        :checked="rating === n"
        @change="emit('update:rating', n)"
      />
      <span aria-hidden="true"
        ><PhStar v-for="star in n" :key="star" :size="16" weight="fill" /></span
      ><span class="sr-only">{{ n }} {{ n === 1 ? 'estrela' : 'estrelas' }}</span></label
    >
  </fieldset>
  <div class="review-field">
    <p id="review-label">Comentário pessoal (opcional)</p>
    <div v-if="editor" class="review-toolbar" role="group" aria-label="Formatação do comentário">
      <button
        type="button"
        :aria-pressed="editor.isActive('bold')"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <strong>Negrito</strong>
      </button>
      <button
        type="button"
        :aria-pressed="editor.isActive('paragraph')"
        @click="editor.chain().focus().setParagraph().run()"
      >
        Texto
      </button>
      <button
        v-for="level in [1, 2, 3] as const"
        :key="level"
        type="button"
        :aria-pressed="editor.isActive('heading', { level })"
        @click="editor.chain().focus().toggleHeading({ level }).run()"
      >
        Título {{ level }}
      </button>
    </div>
    <EditorContent :editor="editor" class="review-editor" />
    <p id="review-count" :class="{ 'review-over': count > 500 }" aria-live="polite">
      {{ count }} de 500 caracteres. Cada ponto de código Unicode conta como um caractere; alguns
      emojis contam mais de um. Cada quebra de linha conta um.
    </p>
  </div>
</template>
