/** Browser WebRTC client for the assistant's OpenAI Realtime conversation. */

const SESSION_PATH = '/api/wechat-assistant/openai/realtime'
const VOICE_RESPONSE_SETTLE_MS = 500

/** Observable Realtime call state. */
export type RealtimeCallState = 'idle' | 'connecting' | 'connected'

/** UI callbacks emitted by one Realtime call. */
export interface OpenAIRealtimeCallbacks {
  /** Receive an incremental user speech transcript. */
  readonly onUserTranscriptDelta: (text: string) => void
  /** Receive a completed user speech transcript. */
  readonly onUserTranscript: (text: string) => void
  /** Receive an incremental model audio transcript. */
  readonly onAssistantTranscriptDelta: (text: string) => void
  /** Receive a completed model audio transcript. */
  readonly onAssistantTranscript: (text: string) => void
  /** Observe whether turn detection currently hears the user speaking. */
  readonly onUserSpeechState: (active: boolean) => void
  /** Receive a user-safe connection or model error. */
  readonly onError: (message: string) => void
  /** Observe call lifecycle changes. */
  readonly onState: (state: RealtimeCallState) => void
  /** Drive the visible voice meter from local or remote audio. */
  readonly onAudioLevel: (level: number, speaker: 'user' | 'assistant') => void
  /** Attach or clear the remote WebRTC media stream used for native playback. */
  readonly onRemoteStream: (stream: MediaStream | null) => void
  /** Ensure native playback is active when the remote output buffer starts. */
  readonly onRemoteAudioStart: () => void
  /** Observe that the remote output buffer has drained or been cleared. */
  readonly onRemoteAudioStop: () => void
}

interface RealtimeEvent {
  readonly type?: string
  readonly delta?: string
  readonly transcript?: string
  readonly error?: { readonly message?: string }
}

interface RealtimeToken {
  readonly value?: unknown
  readonly callsURL?: unknown
}

/** One browser-to-OpenAI speech-to-speech session. */
export class OpenAIRealtimeCall {
  private peer: RTCPeerConnection | undefined
  private channel: RTCDataChannel | undefined
  private input: MediaStream | undefined
  private audioContext: AudioContext | undefined
  private inputSource: MediaStreamAudioSourceNode | undefined
  private outputSource: MediaStreamAudioSourceNode | undefined
  private inputAnalyser: AnalyserNode | undefined
  private outputAnalyser: AnalyserNode | undefined
  private meterFrame: number | undefined
  private smoothedLevel = 0
  private responseInFlight = false
  private responseTimer: ReturnType<typeof setTimeout> | undefined
  private muted = false

  constructor(private readonly callbacks: OpenAIRealtimeCallbacks) {}

  /** Establish the microphone and WebRTC session through the Harness host. */
  async start(): Promise<void> {
    if (this.peer !== undefined) return
    this.callbacks.onState('connecting')
    const peer = new RTCPeerConnection()
    this.peer = peer
    try {
      peer.ontrack = (event) => {
        const stream = event.streams[0] ?? new MediaStream([event.track])
        this.callbacks.onRemoteStream(stream)
        this.outputSource?.disconnect()
        this.outputAnalyser?.disconnect()
        const outputMeter = this.createMeter(stream)
        this.outputSource = outputMeter.source
        this.outputAnalyser = outputMeter.analyser
      }

      const input = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      this.input = input
      for (const track of input.getAudioTracks()) {
        track.contentHint = 'speech'
        peer.addTrack(track, input)
      }
      const context = new AudioContext()
      this.audioContext = context
      try {
        await context.resume()
      } catch {
        // Native media playback remains available when the optional meter stays suspended.
      }
      const inputMeter = this.createMeter(input)
      this.inputSource = inputMeter.source
      this.inputAnalyser = inputMeter.analyser
      this.startMeter()

      const channel = peer.createDataChannel('oai-events')
      this.channel = channel
      channel.onopen = () => { this.callbacks.onState('connected') }
      channel.onmessage = (event) => { this.receive(event.data) }
      channel.onerror = () => { this.callbacks.onError('OpenAI Realtime data channel failed') }

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'failed') this.callbacks.onError('OpenAI Realtime connection failed')
      }

      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)
      const sdp = offer.sdp
      if (sdp === undefined || sdp.trim() === '') throw new Error('Browser did not create a WebRTC SDP offer')
      const tokenResponse = await fetch(SESSION_PATH, {
        method: 'POST',
      })
      const tokenBody = await tokenResponse.text()
      if (!tokenResponse.ok) throw new Error(readError(tokenBody, tokenResponse.status))
      const token = readToken(tokenBody)
      const response = await fetch(token.callsURL, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token.value}`,
          'content-type': 'application/sdp',
        },
        body: sdp,
      })
      const answer = await response.text()
      if (!response.ok) throw new Error(readError(answer, response.status))
      await peer.setRemoteDescription({ type: 'answer', sdp: answer })
    } catch (error) {
      this.stop()
      throw error
    }
  }

  /** Add one typed user turn to the active Realtime conversation.
   * @param text - final user text.
   */
  sendText(text: string): void {
    const channel = this.channel
    if (channel?.readyState !== 'open') throw new Error('Start the ChatGPT Live call first')
    channel.send(JSON.stringify({
      type: 'conversation.item.create',
      item: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] },
    }))
    this.responseInFlight = true
    channel.send(JSON.stringify({ type: 'response.create', response: { output_modalities: ['audio'] } }))
  }

  /** Pause or resume microphone transmission without ending the call.
   * @param muted - whether local audio tracks should stop transmitting.
   */
  setMuted(muted: boolean): void {
    this.muted = muted
    this.syncInputTracks()
  }

  /** Close media, data, and peer resources. */
  stop(): void {
    this.channel?.close()
    this.channel = undefined
    for (const track of this.input?.getTracks() ?? []) track.stop()
    this.input = undefined
    this.peer?.close()
    this.peer = undefined
    if (this.meterFrame !== undefined) cancelAnimationFrame(this.meterFrame)
    this.meterFrame = undefined
    this.clearResponseTimer()
    this.inputSource?.disconnect()
    this.inputSource = undefined
    this.outputSource?.disconnect()
    this.outputSource = undefined
    this.inputAnalyser?.disconnect()
    this.inputAnalyser = undefined
    this.outputAnalyser?.disconnect()
    this.outputAnalyser = undefined
    if (this.audioContext !== undefined) void this.audioContext.close()
    this.audioContext = undefined
    this.smoothedLevel = 0
    this.responseInFlight = false
    this.muted = false
    this.callbacks.onRemoteStream(null)
    this.callbacks.onUserSpeechState(false)
    this.callbacks.onRemoteAudioStop()
    this.callbacks.onAudioLevel(0, 'user')
    this.callbacks.onState('idle')
  }

  private createMeter(stream: MediaStream): { source: MediaStreamAudioSourceNode; analyser: AnalyserNode } {
    const context = this.audioContext
    if (context === undefined) throw new Error('Audio meter is not initialized')
    const source = context.createMediaStreamSource(stream)
    const analyser = context.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.72
    source.connect(analyser)
    return { source, analyser }
  }

  private startMeter(): void {
    const inputSamples = new Uint8Array(256)
    const outputSamples = new Uint8Array(256)
    const measure = (): void => {
      const input = audioLevel(this.inputAnalyser, inputSamples)
      const output = audioLevel(this.outputAnalyser, outputSamples)
      const assistantSpeaking = output > 0.025
      const next = Math.min(1, (assistantSpeaking ? output : input) * 4.8)
      this.smoothedLevel += (next - this.smoothedLevel) * (next > this.smoothedLevel ? 0.38 : 0.14)
      this.callbacks.onAudioLevel(this.smoothedLevel, assistantSpeaking ? 'assistant' : 'user')
      this.meterFrame = requestAnimationFrame(measure)
    }
    this.meterFrame = requestAnimationFrame(measure)
  }

  private receive(raw: unknown): void {
    if (typeof raw !== 'string') return
    let event: RealtimeEvent
    try {
      event = JSON.parse(raw) as RealtimeEvent
    } catch {
      return
    }
    if (event.type === 'conversation.item.input_audio_transcription.delta' && event.delta !== undefined) {
      this.callbacks.onUserTranscriptDelta(event.delta)
    } else if (event.type === 'conversation.item.input_audio_transcription.completed' && event.transcript !== undefined) {
      this.callbacks.onUserTranscript(event.transcript)
    } else if (event.type === 'response.output_audio_transcript.delta' && event.delta !== undefined) {
      this.callbacks.onAssistantTranscriptDelta(event.delta)
    } else if (event.type === 'response.output_audio_transcript.done' && event.transcript !== undefined) {
      this.callbacks.onAssistantTranscript(event.transcript)
    } else if (event.type === 'input_audio_buffer.speech_started') {
      this.clearResponseTimer()
      this.callbacks.onUserSpeechState(true)
    } else if (event.type === 'input_audio_buffer.speech_stopped') {
      this.callbacks.onUserSpeechState(false)
      this.scheduleVoiceResponse()
    } else if (event.type === 'output_audio_buffer.started') {
      this.callbacks.onRemoteAudioStart()
    } else if (event.type === 'output_audio_buffer.stopped' || event.type === 'output_audio_buffer.cleared') {
      this.callbacks.onRemoteAudioStop()
    } else if (event.type === 'response.done') {
      this.responseInFlight = false
    } else if (event.type === 'error') {
      this.responseInFlight = false
      this.callbacks.onError(event.error?.message ?? 'OpenAI Realtime returned an error')
    }
  }

  private scheduleVoiceResponse(): void {
    this.clearResponseTimer()
    if (this.muted || this.responseInFlight) return
    this.responseTimer = setTimeout(() => {
      this.responseTimer = undefined
      const channel = this.channel
      if (channel?.readyState !== 'open' || this.muted || this.responseInFlight) return
      this.responseInFlight = true
      channel.send(JSON.stringify({ type: 'response.create', response: { output_modalities: ['audio'] } }))
    }, VOICE_RESPONSE_SETTLE_MS)
  }

  private clearResponseTimer(): void {
    if (this.responseTimer !== undefined) clearTimeout(this.responseTimer)
    this.responseTimer = undefined
  }

  private syncInputTracks(): void {
    for (const track of this.input?.getAudioTracks() ?? []) {
      track.enabled = !this.muted
    }
  }
}

function readToken(body: string): { value: string; callsURL: string } {
  let parsed: RealtimeToken
  try {
    parsed = JSON.parse(body) as RealtimeToken
  } catch {
    throw new Error('Harness returned an invalid OpenAI Realtime token')
  }
  if (typeof parsed.value !== 'string' || parsed.value === ''
    || typeof parsed.callsURL !== 'string' || parsed.callsURL === '') {
    throw new Error('Harness returned an invalid OpenAI Realtime token')
  }
  return { value: parsed.value, callsURL: parsed.callsURL }
}

function audioLevel(analyser: AnalyserNode | undefined, samples: Uint8Array<ArrayBuffer>): number {
  if (analyser === undefined) return 0
  analyser.getByteTimeDomainData(samples)
  let sum = 0
  for (const sample of samples) {
    const centered = (sample - 128) / 128
    sum += centered * centered
  }
  return Math.sqrt(sum / samples.length)
}

function readError(body: string, status: number): string {
  try {
    const parsed = JSON.parse(body) as { readonly error?: string | { readonly message?: string } }
    if (typeof parsed.error === 'string') return parsed.error
    if (parsed.error?.message !== undefined) return parsed.error.message
  } catch {
    // The upstream may return plain text for SDP and transport failures.
  }
  return body.trim() || `OpenAI Realtime request failed (${String(status)})`
}
