import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  autofillField,
  createLookupScheduler,
} from '../../../src/features/books/services/automaticLookup'

afterEach(() => vi.useRealTimers())
describe('automatic ISBN lookup', () => {
  it('waits for a valid ISBN and cancels superseded requests', () => {
    vi.useFakeTimers()
    const lookup = vi.fn()
    const scheduler = createLookupScheduler(lookup)
    scheduler.schedule('123')
    vi.advanceTimersByTime(1000)
    expect(lookup).not.toHaveBeenCalled()
    scheduler.schedule('0306406152')
    vi.advanceTimersByTime(500)
    scheduler.schedule('9780306406157')
    vi.advanceTimersByTime(699)
    expect(lookup).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(lookup).toHaveBeenCalledOnce()
    scheduler.schedule('9780306406157')
    scheduler.cancel()
    vi.advanceTimersByTime(1000)
    expect(lookup).toHaveBeenCalledOnce()
  })
  it('preserves manually entered or changed values', () => {
    expect(autofillField('', '', '', 'Título')).toBe('Título')
    expect(autofillField('Anterior', 'Anterior', 'Anterior', 'Novo')).toBe('Novo')
    expect(autofillField('Meu título', 'Meu título', '', 'Novo')).toBe('Meu título')
    expect(autofillField('Editado', '', '', 'Novo')).toBe('Editado')
    expect(autofillField('Anterior', 'Anterior', 'Anterior', '')).toBe('Anterior')
  })
})
