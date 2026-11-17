import { nextTick, reactive } from 'vue'
import { describe, expect, it } from 'vitest'
import { useCoverSearchFields } from '../../../src/features/books/services/coverSearchFields'

describe('cover search fields', () => {
  it('follows later updates from the book form', async () => {
    const props = reactive({ title: '', author: '' })
    const fields = useCoverSearchFields(props)
    props.title = 'Título'
    props.author = 'Autora'
    await nextTick()
    expect(fields.title.value).toBe('Título')
    expect(fields.author.value).toBe('Autora')
  })
  it('preserves a manually edited search while updating the untouched field', async () => {
    const props = reactive({ title: 'Antigo', author: 'Antiga' })
    const fields = useCoverSearchFields(props)
    fields.title.value = 'Busca ajustada'
    fields.titleEdited.value = true
    props.title = 'Atualizado'
    props.author = 'Atualizada'
    await nextTick()
    expect(fields.title.value).toBe('Busca ajustada')
    expect(fields.author.value).toBe('Atualizada')
  })
})
