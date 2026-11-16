import { describe, expect, it, vi } from 'vitest'
import {
  cameraError,
  createScanner,
  type ScannerControls,
} from '../../../src/features/books/services/scanner'

function fakeStream() {
  const track = { stop: vi.fn(), addEventListener: vi.fn() }
  return {
    track,
    stream: { getTracks: () => [track], getVideoTracks: () => [track] } as unknown as MediaStream,
  }
}
describe('camera scanner', () => {
  it('ignores invalid codes and stops after a valid ISBN', async () => {
    const { stream, track } = fakeStream()
    let onValue: (value: string) => void = () => {}
    const controls = { stop: vi.fn() }
    const received = vi.fn()
    const scanner = createScanner(
      vi.fn().mockResolvedValue(stream),
      async (_stream, _video, callback) => {
        onValue = callback
        return controls
      },
      received,
      vi.fn(),
    )
    await scanner.start({} as HTMLVideoElement)
    onValue('123456')
    expect(received).not.toHaveBeenCalled()
    onValue('0306406152')
    expect(received).toHaveBeenCalledWith('9780306406157')
    expect(track.stop).toHaveBeenCalledOnce()
    expect(controls.stop).toHaveBeenCalledOnce()
  })
  it('releases a camera granted after cancellation', async () => {
    const { stream, track } = fakeStream()
    let grant: (value: MediaStream) => void = () => {}
    const camera = () =>
      new Promise<MediaStream>((resolve) => {
        grant = resolve
      })
    const decode = vi.fn<() => Promise<ScannerControls>>()
    const scanner = createScanner(camera, decode, vi.fn(), vi.fn())
    const pending = scanner.start({} as HTMLVideoElement)
    scanner.stop()
    grant(stream)
    await pending
    expect(track.stop).toHaveBeenCalledOnce()
    expect(decode).not.toHaveBeenCalled()
  })
  it('explains denied and unavailable cameras', () => {
    expect(cameraError(new DOMException('', 'NotAllowedError'))).toContain('negada')
    expect(cameraError(new DOMException('', 'NotFoundError'))).toContain('indisponível')
  })
})
