/** Browser audio client for the assistant's speech output. */

const TTS_PATH = '/api/wechat-assistant/tts'

/** One cancellable speech playback request. */
export class SpeechPlayer {
  private audio: HTMLAudioElement | undefined
  private objectURL: string | undefined
  private aborter: AbortController | undefined

  /** Request synthesized speech from the Harness host and play it.
   * @param text - Assistant text to read aloud.
   */
  async speak(text: string): Promise<void> {
    this.stop()
    const aborter = new AbortController()
    this.aborter = aborter
    try {
      const response = await fetch(TTS_PATH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: aborter.signal,
      })
      if (!response.ok) throw new Error(await readSpeechError(response))
      const blob = await response.blob()
      if (aborter.signal.aborted) return
      const objectURL = URL.createObjectURL(blob)
      const audio = new Audio(objectURL)
      this.audio = audio
      this.objectURL = objectURL
      await audio.play()
      await waitForPlayback(audio, aborter.signal)
    } catch (error) {
      if (!isAbortError(error)) throw error
    } finally {
      if (this.aborter === aborter) this.release()
    }
  }

  /** Stop active network work and playback. */
  stop(): void {
    this.aborter?.abort()
    this.aborter = undefined
    this.release()
  }

  private release(): void {
    this.audio?.pause()
    this.audio = undefined
    if (this.objectURL !== undefined) URL.revokeObjectURL(this.objectURL)
    this.objectURL = undefined
  }
}

function waitForPlayback(audio: HTMLAudioElement, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = (): void => {
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      signal.removeEventListener('abort', onAbort)
    }
    const onEnded = (): void => { cleanup(); resolve() }
    const onError = (): void => { cleanup(); reject(new Error('TTS audio playback failed')) }
    const onAbort = (): void => { cleanup(); resolve() }
    audio.addEventListener('ended', onEnded, { once: true })
    audio.addEventListener('error', onError, { once: true })
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function readSpeechError(response: Response): Promise<string> {
  const body = await response.text()
  try {
    const parsed = JSON.parse(body) as { readonly error?: unknown }
    if (typeof parsed.error === 'string' && parsed.error !== '') return parsed.error
  } catch {
    return body === '' ? `TTS failed (${String(response.status)})` : body
  }
  return `TTS failed (${String(response.status)})`
}
