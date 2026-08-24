import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionFace, SessionId, SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import {
  IconChevronLeftOutline14, IconEllipsisOutline16, IconPlayOutline16,
  IconPauseOutline16, IconSendOutline16, IconStopFill16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { Avatar, type AvatarRole } from './avatars.tsx'
import { OpenAIRealtimeCall, type RealtimeCallState } from './openai-realtime.ts'
import { SpeechPlayer } from './speech-player.ts'
import type { WechatAssistantWorkspaceStore } from './workspace-store.ts'
import type { AssistantSettings } from '../settings-contract.ts'
import css from './WechatAssistantWorkspace.module.css'

/** Direct conversation ids retained from the original dashboard. */
export type ConversationId = 'self' | 'teacher' | 'claude' | 'chatgpt'

interface Message {
  readonly id: string
  readonly role: 'user' | 'assistant' | 'system'
  readonly text: string
  readonly time: number
}

interface AssistantHostMessage {
  readonly id: string
  readonly conversation: ConversationId
  readonly role: 'user' | 'assistant' | 'system'
  readonly text: string
  readonly time: number
  readonly source: 'web' | 'telegram'
  readonly status?: 'pending' | 'handled'
}

interface AssistantBridgeState {
  readonly secretarySessionId?: string
}

type ConversationMessages = Record<ConversationId, readonly Message[]>

interface ConversationDefinition {
  readonly id: ConversationId
  readonly nameKey: 'conversation.self' | 'conversation.teacher' | 'conversation.claude' | 'conversation.chatgpt'
  readonly subtitleKey: 'conversation.self.subtitle' | 'conversation.teacher.subtitle' | 'conversation.claude.subtitle' | 'conversation.chatgpt.subtitle'
  readonly role: AvatarRole
}

interface SessionListSnapshot {
  readonly ids: readonly SessionId[]
  readonly byId: Readonly<Record<SessionId, {
    readonly id: SessionId
    readonly blank: boolean
    readonly updatedAt: number
  } | undefined>>
  readonly current: SessionId | undefined
}

type AssistantSessionSummary = NonNullable<SessionListSnapshot['byId'][SessionId]>

/** Application-page operations supplied by the browser plugin. */
export interface WechatAssistantWorkspaceInjected {
  readonly workspace: WechatAssistantWorkspaceStore
  readonly settings: SettingsScope<AssistantSettings>
  readonly resolveSession: (sessionId: SessionId | undefined) => SessionFace | undefined
  readonly send: (sessionId: SessionId | undefined, conversation: ConversationId, text: string) => Promise<string | null>
}

type Props = PropsRuntime<'shell.overlay'>
  & InjectFace<WechatAssistantWorkspaceInjected>
  & PropsLocale<'a2a-assistant'>

const DEFINITIONS: readonly ConversationDefinition[] = [
  { id: 'self', nameKey: 'conversation.self', subtitleKey: 'conversation.self.subtitle', role: 'bot' },
  { id: 'teacher', nameKey: 'conversation.teacher', subtitleKey: 'conversation.teacher.subtitle', role: 'teacher' },
  { id: 'claude', nameKey: 'conversation.claude', subtitleKey: 'conversation.claude.subtitle', role: 'claude' },
  { id: 'chatgpt', nameKey: 'conversation.chatgpt', subtitleKey: 'conversation.chatgpt.subtitle', role: 'chatgpt' },
]

const EMPTY_MESSAGES: ConversationMessages = { self: [], teacher: [], claude: [], chatgpt: [] }
const ASSISTANT_MESSAGES_PATH = '/api/wechat-assistant/messages'
const ASSISTANT_REPLIES_PATH = '/api/wechat-assistant/replies'
const ASSISTANT_STATE_PATH = '/api/wechat-assistant/state'
const SECRETARY_ASR_PATH = '/api/wechat-assistant/asr'
const SECRETARY_ASR_SAMPLE_RATE = 16_000
const SECRETARY_VOICE_THRESHOLD = 0.038
const SECRETARY_PREFIX_MS = 450
const SECRETARY_MAX_SEGMENT_MS = 8_000

function assistantText(blocks: readonly { readonly kind: string; readonly text?: string }[]): string {
  return blocks.filter(block => block.kind === 'text').map(block => block.text ?? '').join('\n').trim()
}

function formatTime(value: number): string {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function rms(samples: Float32Array): number {
  let sum = 0
  for (const sample of samples) sum += sample * sample
  return Math.sqrt(sum / samples.length)
}

function downsampleToPcm16(input: Float32Array, inputSampleRate: number, outputSampleRate: number): Int16Array {
  const ratio = inputSampleRate / outputSampleRate
  const outputLength = Math.max(1, Math.floor(input.length / ratio))
  const output = new Int16Array(outputLength)
  for (let index = 0; index < outputLength; index += 1) {
    const start = Math.floor(index * ratio)
    const end = Math.min(input.length, Math.floor((index + 1) * ratio))
    let sum = 0
    for (let inputIndex = start; inputIndex < end; inputIndex += 1) sum += input[inputIndex] ?? 0
    const sample = Math.max(-1, Math.min(1, sum / Math.max(1, end - start)))
    output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
  }
  return output
}

function readAsrTranscript(body: string): string {
  try {
    const parsed = JSON.parse(body) as { readonly status?: unknown; readonly result?: unknown; readonly Result?: unknown }
    const result = typeof parsed.result === 'string' ? parsed.result : parsed.Result
    return typeof result === 'string' ? result.trim() : ''
  } catch {
    return ''
  }
}

function readAsrError(body: string, status: number): string {
  try {
    const parsed = JSON.parse(body) as {
      readonly message?: unknown
      readonly Message?: unknown
      readonly status_text?: unknown
      readonly error_message?: unknown
      readonly status?: unknown
      readonly Code?: unknown
      readonly code?: unknown
    }
    const message = typeof parsed.message === 'string'
      ? parsed.message
      : typeof parsed.Message === 'string'
        ? parsed.Message
      : typeof parsed.status_text === 'string'
        ? parsed.status_text
        : typeof parsed.error_message === 'string'
          ? parsed.error_message
        : undefined
    const code = typeof parsed.Code === 'string'
      ? parsed.Code
      : typeof parsed.code === 'string'
        ? parsed.code
        : typeof parsed.status === 'number'
          ? String(parsed.status)
          : undefined
    const detail = [code, message].filter(Boolean).join(': ')
    return detail === '' ? `Aliyun ASR failed (${String(status)}): ${body}` : `Aliyun ASR failed (${String(status)}): ${detail}`
  } catch {
    return body.trim() || `Aliyun ASR failed (${String(status)})`
  }
}

function base64FromBytes(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

function definitionOf<T extends ConversationDefinition>(definitions: readonly T[], id: ConversationId): T {
  const definition = definitions.find(candidate => candidate.id === id)
  if (definition === undefined) throw new Error(`ui-a2a-assistant: missing conversation definition for ${id}`)
  return definition
}

function fallbackSessionId(snapshot: SessionListSnapshot): SessionId | undefined {
  if (snapshot.current !== undefined) return snapshot.current
  const sessions = snapshot.ids
    .map(id => snapshot.byId[id])
    .filter((session): session is AssistantSessionSummary => session !== undefined && !session.blank)
    .sort((left, right) => right.updatedAt - left.updatedAt)
  return sessions[0]?.id
}

async function fetchHostMessages(): Promise<readonly AssistantHostMessage[]> {
  const response = await fetch(ASSISTANT_MESSAGES_PATH, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Assistant bridge returned ${response.status}`)
  const body = await response.json() as { readonly messages?: readonly AssistantHostMessage[] }
  return Array.isArray(body.messages) ? body.messages : []
}

function hostMessagesToConversations(hostMessages: readonly AssistantHostMessage[]): ConversationMessages {
  const next: Record<ConversationId, Message[]> = { self: [], teacher: [], claude: [], chatgpt: [] }
  for (const message of hostMessages) {
    next[message.conversation].push({
      id: `bridge-${message.id}`,
      role: message.role,
      text: message.text,
      time: message.time,
    })
  }
  return next
}

async function postHostMessage(conversation: ConversationId, role: Message['role'], text: string): Promise<AssistantHostMessage> {
  const response = await fetch(ASSISTANT_MESSAGES_PATH, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ conversation, role, text }),
  })
  if (!response.ok) throw new Error(`Assistant bridge returned ${response.status}`)
  const body = await response.json() as { readonly message?: AssistantHostMessage }
  if (body.message === undefined) throw new Error('Assistant bridge returned an invalid message')
  return body.message
}

async function postHostReply(messageId: string, text: string): Promise<void> {
  const response = await fetch(ASSISTANT_REPLIES_PATH, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messageId, text }),
  })
  if (!response.ok) throw new Error(`Assistant bridge returned ${response.status}`)
}

async function fetchAssistantState(): Promise<AssistantBridgeState> {
  const response = await fetch(ASSISTANT_STATE_PATH, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Assistant bridge state returned ${response.status}`)
  return response.json() as Promise<AssistantBridgeState>
}

async function postAssistantState(secretarySessionId: SessionId): Promise<AssistantBridgeState> {
  const response = await fetch(ASSISTANT_STATE_PATH, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secretarySessionId }),
  })
  if (!response.ok) throw new Error(`Assistant bridge state returned ${response.status}`)
  return response.json() as Promise<AssistantBridgeState>
}

/** Independent WeChat Assistant page, preserving the original dashboard layout. */
export function WechatAssistantWorkspace({ useSessions, workspace, settings, resolveSession, send, t }: Props) {
  const open = useSyncExternalStore(workspace.subscribe, workspace.getSnapshot).open
  const settingsSnapshot = useSyncExternalStore(
    listener => settings.subscribe(listener),
    () => settings.getSnapshot(),
  )
  const fallbackId = useSessions(fallbackSessionId)
  const [boundSessionId, setBoundSessionId] = useState<SessionId | undefined>(undefined)
  const boundSession = resolveSession(boundSessionId)
  const sessionId = boundSession === undefined ? fallbackId : boundSessionId
  const session = resolveSession(sessionId)
  const subscribeSession = useCallback((listener: () => void) => session?.subscribe(listener) ?? (() => {}), [session])
  const readSession = useCallback(() => session?.getSnapshot(), [session])
  const snapshot = useSyncExternalStore(subscribeSession, readSession, readSession)
  const [sidebarWidth, setSidebarWidth] = useState(0)
  const [conversation, setConversation] = useState<ConversationId>('self')
  const [messages, setMessages] = useState<ConversationMessages>(EMPTY_MESSAGES)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calling, setCalling] = useState(false)
  const [callState, setCallState] = useState<RealtimeCallState>('idle')
  const [audioLevel, setAudioLevel] = useState(0)
  const [voiceSpeaker, setVoiceSpeaker] = useState<'user' | 'assistant'>('user')
  const [liveUserText, setLiveUserText] = useState('')
  const [liveAssistantText, setLiveAssistantText] = useState('')
  const [liveUserActive, setLiveUserActive] = useState(false)
  const [callPaused, setCallPaused] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [mobileChat, setMobileChat] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const microphoneStream = useRef<MediaStream | null>(null)
  const secretaryAudioContext = useRef<AudioContext | null>(null)
  const secretarySource = useRef<MediaStreamAudioSourceNode | null>(null)
  const secretaryProcessor = useRef<ScriptProcessorNode | null>(null)
  const secretarySilentOutput = useRef<GainNode | null>(null)
  const secretaryRecording = useRef(false)
  const secretaryChunks = useRef<Int16Array[]>([])
  const secretaryPrefix = useRef<Int16Array[]>([])
  const secretaryPrefixSamples = useRef(0)
  const secretarySilentSince = useRef<number | undefined>(undefined)
  const secretarySegmentStartedAt = useRef<number | undefined>(undefined)
  const secretarySubmitting = useRef(false)
  const recognitionPaused = useRef(false)
  const realtimeCall = useRef<OpenAIRealtimeCall | null>(null)
  const speechPlayer = useRef<SpeechPlayer | null>(null)
  const speechSeq = useRef(0)
  const voiceSubmitTimer = useRef<number | undefined>(undefined)
  const pendingVoiceText = useRef('')
  const voiceSilenceMs = useRef(settingsSnapshot.value?.voiceSilenceMs ?? 1500)
  const lastVoiceSubmission = useRef<{ readonly text: string; readonly time: number } | undefined>()
  const pendingConversation = useRef<ConversationId | null>(null)
  const pendingHostReplyId = useRef<string | null>(null)
  const processingHostMessageIds = useRef(new Set<string>())
  const seenAssistantSeq = useRef(0)
  const busy = useRef(false)

  const definitions = useMemo(() => DEFINITIONS.map(definition => ({
    ...definition,
    name: t(definition.nameKey),
    subtitle: t(definition.subtitleKey),
  })), [t])
  const active = definitionOf(definitions, conversation)
  const selfDefinition = definitionOf(definitions, 'self')
  const callStatus = callPaused
    ? t('call.paused')
    : callState === 'connecting'
      ? t('call.connecting')
      : voiceSpeaker === 'assistant'
        ? t(conversation === 'chatgpt' ? 'call.chatgptSpeaking' : 'call.secretarySpeaking')
        : liveUserActive || liveUserText !== ''
          ? t('call.transcribing')
          : t('call.listening')
  const callHint = callPaused ? t('call.pausedHint') : t('call.liveHint')

  useLayoutEffect(() => {
    if (!open) return
    const layer = rootRef.current?.closest('[data-shell-overlay]')
    const frame = layer?.parentElement
    const sidebar = frame?.firstElementChild
    if (!(frame instanceof HTMLElement) || !(sidebar instanceof HTMLElement)) return
    const coveredSurfaces = Array.from(frame.children).slice(1).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child !== layer,
    )
    const previousInert = coveredSurfaces.map(surface => surface.inert)
    const previousAriaHidden = coveredSurfaces.map(surface => surface.getAttribute('aria-hidden'))
    for (const surface of coveredSurfaces) {
      surface.inert = true
      surface.setAttribute('aria-hidden', 'true')
    }
    const update = (): void => { setSidebarWidth(sidebar.getBoundingClientRect().width) }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(sidebar)
    return () => {
      observer.disconnect()
      coveredSurfaces.forEach((surface, index) => {
        surface.inert = previousInert[index] ?? false
        const ariaHidden = previousAriaHidden[index]
        if (ariaHidden === null || ariaHidden === undefined) surface.removeAttribute('aria-hidden')
        else surface.setAttribute('aria-hidden', ariaHidden)
      })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const closeFromSidebar = (event: PointerEvent): void => {
      const root = rootRef.current
      if (root === null || !(event.target instanceof Node)) return
      if (!root.contains(event.target) && event.clientX < sidebarWidth) workspace.setOpen(false)
    }
    document.addEventListener('pointerdown', closeFromSidebar, true)
    return () => { document.removeEventListener('pointerdown', closeFromSidebar, true) }
  }, [open, sidebarWidth, workspace])

  useEffect(() => {
    voiceSilenceMs.current = settingsSnapshot.value?.voiceSilenceMs ?? voiceSilenceMs.current
  }, [settingsSnapshot])

  useEffect(() => {
    if (!open || boundSessionId !== undefined || sessionId === undefined) return
    void postAssistantState(sessionId)
      .then(state => { setBoundSessionId(state.secretarySessionId as SessionId | undefined) })
      .catch((failure) => {
        setError(failure instanceof Error ? failure.message : String(failure))
      })
  }, [boundSessionId, open, sessionId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [conversation, liveAssistantText, liveUserActive, liveUserText, messages, sending])

  useEffect(() => {
    const nodes = snapshot?.nodes ?? []
    let latest: (typeof nodes)[number] | undefined
    for (let index = nodes.length - 1; index >= 0; index -= 1) {
      if (nodes[index]?.kind === 'assistant') { latest = nodes[index]; break }
    }
    if (latest?.kind !== 'assistant' || latest.seq <= seenAssistantSeq.current) return
    seenAssistantSeq.current = latest.seq
    const target = pendingConversation.current
    if (target === null) return
    const text = assistantText(latest.blocks)
    if (text === '') return
    pendingConversation.current = null
    const hostReplyId = pendingHostReplyId.current
    pendingHostReplyId.current = null
    busy.current = false
    setSending(false)
    if (hostReplyId !== null) {
      void postHostReply(hostReplyId, text)
        .then(fetchHostMessages)
        .then(hostMessages => { setMessages(hostMessagesToConversations(hostMessages)) })
        .catch((failure) => {
          setError(failure instanceof Error ? failure.message : String(failure))
        })
    }
    if (calling && target === 'self') {
      const player = speechPlayer.current ?? new SpeechPlayer()
      speechPlayer.current = player
      const seq = speechSeq.current + 1
      speechSeq.current = seq
      setVoiceSpeaker('assistant')
      void player.speak(text)
        .catch((failure) => { setVoiceError(failure instanceof Error ? failure.message : String(failure)) })
        .finally(() => { if (speechSeq.current === seq) setVoiceSpeaker('user') })
    }
  }, [calling, snapshot])

  useEffect(() => {
    if (!open) return
    let disposed = false
    const sync = async (): Promise<void> => {
      const [hostMessages, state] = await Promise.all([fetchHostMessages(), fetchAssistantState()])
      if (disposed) return
      if (state.secretarySessionId !== undefined && state.secretarySessionId !== boundSessionId) {
        setBoundSessionId(state.secretarySessionId as SessionId)
      }
      setMessages(hostMessagesToConversations(hostMessages))
      if (sessionId === undefined || busy.current || snapshot?.running === true) return
      const pending = hostMessages.find(message => (
        message.source === 'telegram'
        && message.conversation === 'self'
        && message.role === 'user'
        && message.status === 'pending'
        && !processingHostMessageIds.current.has(message.id)
      ))
      if (pending === undefined) return
      processingHostMessageIds.current.add(pending.id)
      setError(null)
      setSending(true)
      busy.current = true
      pendingConversation.current = 'self'
      pendingHostReplyId.current = pending.id
      const failure = await send(sessionId, 'self', pending.text)
      if (failure !== null) {
        pendingConversation.current = null
        pendingHostReplyId.current = null
        busy.current = false
        setSending(false)
        setError(failure)
        processingHostMessageIds.current.delete(pending.id)
      }
    }
    const interval = window.setInterval(() => {
      void sync().catch((failure) => {
        if (!disposed) setError(failure instanceof Error ? failure.message : String(failure))
      })
    }, settingsSnapshot.value?.bridgePollIntervalMs ?? 1500)
    void sync().catch((failure) => {
      if (!disposed) setError(failure instanceof Error ? failure.message : String(failure))
    })
    return () => {
      disposed = true
      window.clearInterval(interval)
    }
  }, [boundSessionId, open, send, sessionId, settingsSnapshot.value?.bridgePollIntervalMs, snapshot?.running])

  useEffect(() => () => {
    stopSecretaryCapture()
    realtimeCall.current?.stop()
    speechPlayer.current?.stop()
  }, [])

  function clearPendingVoiceSubmit(): void {
    if (voiceSubmitTimer.current !== undefined) window.clearTimeout(voiceSubmitTimer.current)
    voiceSubmitTimer.current = undefined
    pendingVoiceText.current = ''
  }

  function playRemoteAudio(): void {
    const audio = remoteAudioRef.current
    if (audio === null || audio.srcObject === null) return
    audio.muted = false
    audio.volume = 1
    void audio.play().catch(() => { setVoiceError(t('call.playback')) })
  }

  function bindRemoteAudio(stream: MediaStream | null): void {
    const audio = remoteAudioRef.current
    if (audio === null) return
    if (stream === null) {
      audio.pause()
      audio.srcObject = null
      return
    }
    audio.muted = false
    audio.volume = 1
    audio.srcObject = stream
    playRemoteAudio()
  }

  function submitVoiceTranscript(raw: string): void {
    const text = raw.trim()
    clearPendingVoiceSubmit()
    setLiveUserText('')
    setLiveUserActive(false)
    if (text === '') return
    const normalized = text.replace(/\s+/gu, ' ')
    const now = Date.now()
    const previous = lastVoiceSubmission.current
    if (previous !== undefined && previous.text === normalized && now - previous.time < 3_000) return
    lastVoiceSubmission.current = { text: normalized, time: now }
    void submit(text)
  }

  function resetSecretarySegment(): void {
    secretaryRecording.current = false
    secretaryChunks.current = []
    secretarySilentSince.current = undefined
    secretarySegmentStartedAt.current = undefined
  }

  function resetSecretaryPrefix(): void {
    secretaryPrefix.current = []
    secretaryPrefixSamples.current = 0
  }

  function appendSecretaryPrefix(chunk: Int16Array): void {
    secretaryPrefix.current.push(chunk)
    secretaryPrefixSamples.current += chunk.length
    const maxSamples = Math.round((settingsSnapshot.value?.aliyunAsrSampleRate ?? SECRETARY_ASR_SAMPLE_RATE) * SECRETARY_PREFIX_MS / 1000)
    while (secretaryPrefixSamples.current > maxSamples && secretaryPrefix.current.length > 0) {
      const removed = secretaryPrefix.current.shift()
      secretaryPrefixSamples.current -= removed?.length ?? 0
    }
  }

  function stopSecretaryCapture(): void {
    secretaryProcessor.current?.disconnect()
    secretaryProcessor.current = null
    secretarySource.current?.disconnect()
    secretarySource.current = null
    secretarySilentOutput.current?.disconnect()
    secretarySilentOutput.current = null
    void secretaryAudioContext.current?.close().catch(() => {})
    secretaryAudioContext.current = null
    resetSecretarySegment()
    resetSecretaryPrefix()
  }

  function finishSecretarySegment(): void {
    const chunks = secretaryChunks.current
    const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    resetSecretarySegment()
    resetSecretaryPrefix()
    setAudioLevel(0)
    setLiveUserActive(false)
    if (total < Math.round((settingsSnapshot.value?.aliyunAsrSampleRate ?? SECRETARY_ASR_SAMPLE_RATE) * 0.35)) return
    const bytes = new Uint8Array(total * 2)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength), offset)
      offset += chunk.byteLength
    }
    void submitSecretaryAudio(bytes)
  }

  async function submitSecretaryAudio(audio: Uint8Array): Promise<void> {
    if (secretarySubmitting.current) return
    secretarySubmitting.current = true
    setVoiceError(null)
    try {
      const response = await fetch(SECRETARY_ASR_PATH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ audio: base64FromBytes(audio) }),
      })
      const body = await response.text()
      if (!response.ok) throw new Error(readAsrError(body, response.status))
      const transcript = readAsrTranscript(body)
      if (transcript !== '') submitVoiceTranscript(transcript)
    } catch (failure) {
      setVoiceError(failure instanceof Error ? failure.message : String(failure))
    } finally {
      secretarySubmitting.current = false
    }
  }

  async function submit(raw: string): Promise<void> {
    const text = raw.trim()
    if (text === '') return
    if (conversation === 'chatgpt') {
      const call = realtimeCall.current
      if (call === null || callState !== 'connected') {
        setError(t('call.chatgptRequired'))
        return
      }
      setDraft('')
      setError(null)
      setMessages(current => ({
        ...current,
        chatgpt: [...current.chatgpt, { id: `user-${Date.now()}`, role: 'user', text, time: Date.now() }],
      }))
      void postHostMessage('chatgpt', 'user', text).catch(() => {})
      try { call.sendText(text) } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)) }
      return
    }
    if (busy.current || snapshot?.running === true) return
    setDraft('')
    setError(null)
    setSending(true)
    busy.current = true
    pendingConversation.current = conversation
    let hostMessage: AssistantHostMessage
    try {
      hostMessage = await postHostMessage(conversation, 'user', text)
      pendingHostReplyId.current = hostMessage.id
      setMessages(current => ({
        ...current,
        [conversation]: [...current[conversation], {
          id: `bridge-${hostMessage.id}`,
          role: hostMessage.role,
          text: hostMessage.text,
          time: hostMessage.time,
        }],
      }))
    } catch (failure) {
      pendingConversation.current = null
      pendingHostReplyId.current = null
      busy.current = false
      setSending(false)
      setError(failure instanceof Error ? failure.message : String(failure))
      return
    }
    const failure = await send(sessionId, conversation, text)
    if (failure !== null) {
      pendingConversation.current = null
      pendingHostReplyId.current = null
      busy.current = false
      setSending(false)
      setError(failure)
    }
  }

  const stopCall = (): void => {
    clearPendingVoiceSubmit()
    stopSecretaryCapture()
    microphoneStream.current?.getTracks().forEach(track => { track.stop() })
    microphoneStream.current = null
    speechSeq.current += 1
    speechPlayer.current?.stop()
    realtimeCall.current?.stop()
    realtimeCall.current = null
    setCallState('idle')
    setAudioLevel(0)
    setVoiceSpeaker('user')
    setLiveUserText('')
    setLiveAssistantText('')
    setLiveUserActive(false)
    bindRemoteAudio(null)
    recognitionPaused.current = false
    setCallPaused(false)
    setCalling(false)
  }

  const startSecretaryCall = async (): Promise<void> => {
    setVoiceError(null)
    bindRemoteAudio(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      microphoneStream.current?.getTracks().forEach(track => { track.stop() })
      microphoneStream.current = stream
    } catch (failure) {
      setVoiceError(failure instanceof Error ? `${t('call.permission')}: ${failure.message}` : t('call.permission'))
      stopCall()
      return
    }
    clearPendingVoiceSubmit()
    stopSecretaryCapture()
    lastVoiceSubmission.current = undefined
    resetSecretarySegment()
    resetSecretaryPrefix()
    const audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(microphoneStream.current)
    const processor = audioContext.createScriptProcessor(4096, 1, 1)
    const silentOutput = audioContext.createGain()
    silentOutput.gain.value = 0
    processor.onaudioprocess = (event) => {
      if (recognitionPaused.current) return
      handleSecretaryAudio(event.inputBuffer.getChannelData(0), audioContext.sampleRate)
    }
    source.connect(processor)
    processor.connect(silentOutput)
    silentOutput.connect(audioContext.destination)
    secretaryAudioContext.current = audioContext
    secretarySource.current = source
    secretaryProcessor.current = processor
    secretarySilentOutput.current = silentOutput
    recognitionPaused.current = false
    setCallPaused(false)
    setCallState('connected')
    setCalling(true)
  }

  function handleSecretaryAudio(input: Float32Array, inputSampleRate: number): void {
    const targetRate = settingsSnapshot.value?.aliyunAsrSampleRate ?? SECRETARY_ASR_SAMPLE_RATE
    const chunk = downsampleToPcm16(input, inputSampleRate, targetRate)
    const level = rms(input)
    setAudioLevel(level)
    if (level >= SECRETARY_VOICE_THRESHOLD) {
      setLiveUserActive(true)
      setLiveUserText('')
      const now = Date.now()
      if (!secretaryRecording.current) {
        secretaryRecording.current = true
        secretarySegmentStartedAt.current = now
        secretaryChunks.current = [...secretaryPrefix.current, chunk]
      } else {
        secretaryChunks.current.push(chunk)
      }
      secretarySilentSince.current = undefined
      if (secretarySegmentStartedAt.current !== undefined && now - secretarySegmentStartedAt.current >= SECRETARY_MAX_SEGMENT_MS) {
        finishSecretarySegment()
      }
      return
    }
    if (!secretaryRecording.current) {
      appendSecretaryPrefix(chunk)
      setLiveUserActive(false)
      return
    }
    secretaryChunks.current.push(chunk)
    const now = Date.now()
    secretarySilentSince.current ??= now
    if (now - secretarySilentSince.current >= voiceSilenceMs.current) finishSecretarySegment()
  }

  const ensureSecretaryAudioContext = async (): Promise<void> => {
    if (secretaryAudioContext.current?.state === 'suspended') {
      await secretaryAudioContext.current.resume()
    }
  }

  const recoverSecretaryAudioContext = (): void => {
    void ensureSecretaryAudioContext().catch((failure) => {
      setVoiceError(failure instanceof Error ? `${t('call.permission')}: ${failure.message}` : t('call.permission'))
      stopCall()
    })
  }

  const startRealtimeCall = async (): Promise<void> => {
    setVoiceError(null)
    recognitionPaused.current = false
    setCallPaused(false)
    const call = new OpenAIRealtimeCall({
      onUserTranscriptDelta: (text) => {
        setLiveUserText(current => current + text)
      },
      onUserTranscript: (text) => {
        const transcript = text.trim()
        setLiveUserText('')
        setLiveUserActive(false)
        if (transcript === '') return
        setMessages(current => ({
          ...current,
          chatgpt: [...current.chatgpt, { id: `user-voice-${Date.now()}`, role: 'user', text: transcript, time: Date.now() }],
        }))
        void postHostMessage('chatgpt', 'user', transcript).catch(() => {})
      },
      onAssistantTranscriptDelta: (text) => {
        const audio = remoteAudioRef.current
        if (audio !== null && audio.paused) {
          void audio.play().catch(() => { setVoiceError(t('call.playback')) })
        }
        setLiveAssistantText(current => current + text)
      },
      onAssistantTranscript: (text) => {
        const transcript = text.trim()
        setLiveAssistantText('')
        if (transcript === '') return
        setMessages(current => ({
          ...current,
          chatgpt: [...current.chatgpt, { id: `assistant-live-${Date.now()}`, role: 'assistant', text: transcript, time: Date.now() }],
        }))
        void postHostMessage('chatgpt', 'assistant', transcript).catch(() => {})
      },
      onUserSpeechState: (active) => { setLiveUserActive(active) },
      onError: (message) => { setVoiceError(message) },
      onState: (state) => {
        setCallState(state)
        if (state !== 'idle') setCalling(true)
      },
      onAudioLevel: (level) => { setAudioLevel(level) },
      onRemoteStream: bindRemoteAudio,
      onRemoteAudioStart: () => {
        playRemoteAudio()
        setVoiceSpeaker('assistant')
      },
      onRemoteAudioStop: () => { setVoiceSpeaker('user') },
    })
    realtimeCall.current = call
    try {
      await call.start()
    } catch (failure) {
      setVoiceError(failure instanceof Error ? failure.message : String(failure))
      realtimeCall.current = null
    }
  }

  const startCall = (): void => {
    if (conversation === 'chatgpt') void startRealtimeCall()
    else void startSecretaryCall()
  }

  const togglePause = (): void => {
    const next = !recognitionPaused.current
    recognitionPaused.current = next
    setCallPaused(next)
    if (next) {
      setAudioLevel(0)
      clearPendingVoiceSubmit()
      setLiveUserText('')
      setLiveUserActive(false)
    }
    if (conversation === 'chatgpt') {
      realtimeCall.current?.setMuted(next)
      return
    }
    if (!next) recoverSecretaryAudioContext()
  }

  const selectConversation = (id: ConversationId): void => {
    if (conversation !== id) stopCall()
    setConversation(id)
    setMobileChat(true)
    setError(null)
  }

  if (!open) return null
  const activeMessages = messages[conversation]

  return (
    <div ref={rootRef} className={css.workspace} style={{ left: sidebarWidth }}>
      <aside className={`${css.conversationSidebar}${mobileChat ? ` ${css.mobileHidden}` : ''}`}>
        <header className={css.sidebarHeader}>
          <strong>{t('workspace.title')}</strong>
        </header>
        <div className={css.groupLabel}>{t('group.mine')}</div>
        <ConversationButton
          definition={selfDefinition}
          messages={messages.self}
          active={conversation === 'self'}
          onSelect={() => { selectConversation('self') }}
        />
        <div className={css.groupLabel}>{t('group.system')}</div>
        {definitions.slice(1).map(definition => (
          <ConversationButton
            key={definition.id}
            definition={definition}
            messages={messages[definition.id]}
            active={conversation === definition.id}
            onSelect={() => { selectConversation(definition.id) }}
          />
        ))}
        <div className={css.groupLabel}>{t('group.pairs')}</div>
        <div className={css.pairEmpty}>{t('group.pairs.empty')}</div>
      </aside>
      <section className={`${css.chat}${mobileChat ? ` ${css.mobileChat}` : ''}`}>
        <header className={css.chatHeader}>
          <div className={css.chatIdentity}>
            <button type="button" className={css.mobileBack} aria-label={t('action.back')} onClick={() => { setMobileChat(false) }}><IconChevronLeftOutline14 /></button>
            <div><strong>{active.name}</strong><span>{active.subtitle}</span></div>
          </div>
          <div className={css.headerActions}>
            <div className={css.participants}><span><Avatar role="user" size={30} /></span><span><Avatar role={active.role} size={30} /></span></div>
            {(conversation === 'self' || conversation === 'chatgpt') && (
              <button type="button" className={calling ? css.callActive : css.call} aria-label={calling ? t('call.stop') : t('call.start')} onClick={calling ? stopCall : startCall}>
                {calling ? <IconStopFill16 /> : <IconPlayOutline16 />}
                <span>{calling ? t('call.stop') : t('call.start')}</span>
              </button>
            )}
            <button type="button" className={css.more} aria-label={t('action.more')}><IconEllipsisOutline16 /></button>
          </div>
        </header>
        {calling && (
          <div className={css.callStrip}>
            <i className={callState === 'connecting' ? css.connectingDot : css.onlineDot} />
            {callStatus}
            <span>{callHint}</span>
            <button type="button" className={callPaused ? css.resumeListening : css.pauseListening} onClick={togglePause} aria-label={callPaused ? t('call.resume') : t('call.pause')} title={callPaused ? t('call.resume') : t('call.pause')}>
              {callPaused ? <IconPlayOutline16 /> : <IconPauseOutline16 />}
              <b>{callPaused ? t('call.resume') : t('call.pause')}</b>
            </button>
          </div>
        )}
        {conversation === 'chatgpt' && <audio ref={remoteAudioRef} className={css.remoteAudio} autoPlay playsInline />}
        <div className={css.messages} aria-live="polite">
          <div className={css.messageFlow}>
            {activeMessages.length === 0 && !calling && <div className={css.empty}>{t('message.empty')}</div>}
            {activeMessages.map(message => (
              <MessageRow key={message.id} message={message} agentRole={active.role} agentName={active.name} t={t} />
            ))}
            {calling && (liveUserActive || liveUserText !== '') && (
              <LiveVoiceRow mine text={liveUserText} level={audioLevel} agentRole={active.role} agentName={active.name} t={t} />
            )}
            {calling && conversation === 'chatgpt' && liveAssistantText !== '' && (
              <LiveVoiceRow mine={false} text={liveAssistantText} level={audioLevel} agentRole={active.role} agentName={active.name} t={t} />
            )}
            {sending && <div className={css.replying}>{t('status.sending')}...</div>}
            <div ref={endRef} />
          </div>
        </div>
        <footer className={css.composer}>
          {(error !== null || voiceError !== null) && <div className={css.error} role="status">{voiceError ?? `${t('status.failed')}: ${error}`}</div>}
          <div className={css.inputRow}>
            <textarea
              value={draft}
              rows={1}
              placeholder={t('composer.placeholder')}
              onChange={(event) => { setDraft(event.target.value) }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); void submit(draft) }
              }}
            />
            <button type="button" aria-label={t('composer.send')} disabled={draft.trim() === '' || sending || snapshot?.running === true} onClick={() => { void submit(draft) }}><IconSendOutline16 /></button>
          </div>
          <span className={css.sendHint}>{t('composer.hint')}</span>
        </footer>
      </section>
    </div>
  )
}

function LiveVoiceRow({ mine, text, level, agentRole, agentName, t }: {
  readonly mine: boolean
  readonly text: string
  readonly level: number
  readonly agentRole: AvatarRole
  readonly agentName: string
  readonly t: PropsLocale<'a2a-assistant'>['t']
}) {
  const activeLevel = Math.max(0.08, level)
  return (
    <article className={mine ? css.messageMine : css.messageAgent} aria-live="polite">
      <Avatar role={mine ? 'user' : agentRole} size={34} />
      <div className={css.bubbleWrap}>
        <span>{mine ? t('message.you') : agentName}</span>
        <p className={css.liveBubble}>
          {text !== '' ? text : (
            <span className={css.voiceBars} aria-label={mine ? t('call.transcribing') : t('call.chatgptSpeaking')}>
              {[0.55, 0.9, 0.7, 1, 0.62].map((weight, index) => (
                <i key={String(index)} style={{ height: `${String(7 + activeLevel * weight * 17)}px` }} />
              ))}
            </span>
          )}
        </p>
      </div>
    </article>
  )
}

function ConversationButton({ definition, messages, active, onSelect }: {
  readonly definition: ConversationDefinition & { readonly name: string; readonly subtitle: string }
  readonly messages: readonly Message[]
  readonly active: boolean
  readonly onSelect: () => void
}) {
  const last = messages.at(-1)
  return (
    <button type="button" className={active ? css.conversationActive : css.conversationRow} onClick={onSelect}>
      <Avatar role={definition.role} size={36} />
      <span className={css.conversationCopy}><strong>{definition.name}</strong><small>{last?.text ?? definition.subtitle}</small></span>
      {last !== undefined && <time>{formatTime(last.time)}</time>}
    </button>
  )
}

function MessageRow({ message, agentRole, agentName, t }: {
  readonly message: Message
  readonly agentRole: AvatarRole
  readonly agentName: string
  readonly t: PropsLocale<'a2a-assistant'>['t']
}) {
  if (message.role === 'system') return <div className={css.systemMessage}>{message.text}</div>
  const mine = message.role === 'user'
  return (
    <article className={mine ? css.messageMine : css.messageAgent}>
      <Avatar role={mine ? 'user' : agentRole} size={34} />
      <div className={css.bubbleWrap}>
        <span>{mine ? t('message.you') : agentName}</span>
        <p>{message.text}</p>
        <time>{formatTime(message.time)}</time>
      </div>
    </article>
  )
}
