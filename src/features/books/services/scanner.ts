import { normalizeIsbn } from '../domain/isbn'

export type ScannerControls = { stop: () => void }
type StartDecoder = (
  stream: MediaStream,
  video: HTMLVideoElement,
  onValue: (value: string) => void,
) => Promise<ScannerControls>
type Camera = (constraints: MediaStreamConstraints) => Promise<MediaStream>

export function cameraError(error: unknown): string {
  const name = error instanceof Error ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Permissão para usar a câmera negada. Você pode digitar o ISBN.'
  if (name === 'NotFoundError' || name === 'OverconstrainedError')
    return 'Câmera indisponível. Você pode digitar o ISBN.'
  return 'Não foi possível iniciar a câmera. Você pode digitar o ISBN.'
}

export function createScanner(
  camera: Camera,
  decode: StartDecoder,
  onIsbn: (isbn: string) => void,
  onInterrupted: () => void,
) {
  let generation = 0
  let stream: MediaStream | undefined
  let controls: ScannerControls | undefined
  function stop() {
    generation++
    controls?.stop()
    controls = undefined
    stream?.getTracks().forEach((track) => track.stop())
    stream = undefined
  }

  async function start(video: HTMLVideoElement) {
    stop()
    const current = generation
    try {
      const opened = await camera({ audio: false, video: { facingMode: { ideal: 'environment' } } })
      if (current !== generation) {
        opened.getTracks().forEach((track) => track.stop())
        return
      }
      stream = opened
      opened.getVideoTracks().forEach((track) =>
        track.addEventListener(
          'ended',
          () => {
            if (current === generation) {
              stop()
              onInterrupted()
            }
          },
          { once: true },
        ),
      )
      const started = await decode(opened, video, (value) => {
        if (current !== generation) return
        const isbn = normalizeIsbn(value)
        if (isbn) {
          stop()
          onIsbn(isbn)
        }
      })
      if (current !== generation) started.stop()
      else controls = started
    } catch (error) {
      if (current !== generation) return
      stop()
      throw error
    }
  }
  return { start, stop }
}
