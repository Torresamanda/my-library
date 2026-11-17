import { ref, watch } from 'vue'

export function useCoverSearchFields(props: { title: string; author: string }) {
  const title = ref(props.title)
  const author = ref(props.author)
  const titleEdited = ref(false)
  const authorEdited = ref(false)

  watch(
    () => props.title,
    (value) => {
      if (!titleEdited.value) title.value = value
    },
  )
  watch(
    () => props.author,
    (value) => {
      if (!authorEdited.value) author.value = value
    },
  )

  return { title, author, titleEdited, authorEdited }
}
