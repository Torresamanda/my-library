import { normalizeIsbn } from '../domain/isbn'

export function createLookupScheduler(run: () => void, delay = 700) {
  let timer: ReturnType<typeof setTimeout> | undefined
  function cancel() {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  function schedule(isbn: string) {
    cancel()
    if (normalizeIsbn(isbn))
      timer = setTimeout(() => {
        timer = undefined
        run()
      }, delay)
  }
  return { schedule, cancel }
}

export function autofillField(
  current: string,
  initial: string,
  previousAutomatic: string,
  found: string,
): string {
  if (!found || current !== initial) return current
  return !current.trim() || current === previousAutomatic ? found : current
}
