/** Browser registration and Session routing for the WeChat Assistant workspace. */

import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotRegistry, type SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import { WechatAssistantEntry, type WechatAssistantEntryInjected } from '../src/client/WechatAssistantEntry.tsx'
import {
  WechatAssistantWorkspace, type WechatAssistantWorkspaceInjected,
} from '../src/client/WechatAssistantWorkspace.tsx'
import { AssistantSettingsSection } from '../src/client/AssistantSettingsSection.tsx'
import { OpenAIRealtimeCall } from '../src/client/openai-realtime.ts'
import { apply, inject } from '../src/client/index.ts'
import {
  createMiniMaxSpeech, createRealtimeClientSecret, inject as nodeInject, type Config,
} from '../src/index.ts'

const SID = 'session-wechat-assistant' as SessionId

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const slots = ctx.get('slots') as SlotRegistry
  slots.register({
    name: 'root',
    children: {
      'sidebar.footer.action': { kind: 'list', scope: 'root' },
      'shell.overlay': { kind: 'list', scope: 'root' },
      'settings.section': { kind: 'list', scope: 'root' },
    },
  } as never, () => null)
  const prompt = vi.fn((
    _content: readonly { readonly type: 'text'; readonly text: string }[],
    _mode: 'queue' | 'steer',
  ) => Promise.resolve({ ok: true, value: { accepted: true as const } }))
  const session = { prompt }
  ctx.provide('sessions', {
    binding: (id: SessionId) => id === SID ? { session } : undefined,
  })
  ctx.provide('locale', new LocaleRuntime(ctx))
  const settingsSnapshot = {
    status: 'ready' as const,
    value: {
      apiKeyEnv: 'OPENAI_API_KEY',
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-realtime-2.1',
      voice: 'marin',
      transcriptionModel: 'gpt-4o-mini-transcribe',
      instructions: 'Be concise.',
      voiceSilenceMs: 2800,
      minimaxApiKeyEnv: 'MINIMAX_API_KEY',
      minimaxBaseURL: 'https://api.minimaxi.com/v1',
      minimaxModel: 'speech-2.8-turbo',
      minimaxVoice: 'male-qn-qingse',
      minimaxFormat: 'mp3',
      publicDashboardUrl: '',
      bridgeDeviceName: 'local-harness',
      bridgePollIntervalMs: 1500,
      telegramBotTokenEnv: 'TELEGRAM_BOT_TOKEN',
      telegramAllowedUserIds: '',
    },
    base: undefined,
    user: undefined,
    revision: 0,
    writable: true,
    mode: 'host' as const,
  }
  ctx.provide('settingsScope', {
    bind: () => ({
      getSnapshot: () => settingsSnapshot,
      subscribe: () => () => {},
      set: () => Promise.resolve(),
      unset: () => Promise.resolve(),
    }),
  })
  ctx.provide('connection', {
    api: {
      credentials: {
        describe: () => Promise.resolve({
          rpcId: 'describe' as never,
          result: {
            ok: true as const,
            value: {
              credentials: {
                OPENAI_API_KEY: { configured: false, writable: true },
                MINIMAX_API_KEY: { configured: false, writable: true },
                TELEGRAM_BOT_TOKEN: { configured: false, writable: true },
              },
            },
          },
        }),
        set: () => Promise.resolve({ rpcId: 'set' as never, result: { ok: true as const, value: undefined } }),
        unset: () => Promise.resolve({ rpcId: 'unset' as never, result: { ok: true as const, value: undefined } }),
      },
    },
  })
  return { ctx, slots, prompt }
}

describe('ui-a2a-assistant browser apply', () => {
  it('declares every service each face binds', () => {
    expect(inject).toEqual(['slots', 'sessions', 'locale', 'connection', 'settingsScope'])
    expect(nodeInject).toEqual(['credentials', 'webServer'])
  })

  it('registers one entry and one workspace sharing selection state', async () => {
    const b = await bench()
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()

    const [entry] = b.slots.entries('sidebar.footer.action')
    const [surface] = b.slots.entries('shell.overlay')
    const [settings] = b.slots.entries('settings.section')
    expect(entry?.component).toBe(WechatAssistantEntry)
    expect(surface?.component).toBe(WechatAssistantWorkspace)
    expect(settings?.component).toBe(AssistantSettingsSection)
    expect(settings?.options).toMatchObject({ id: 'wechat-assistant', order: 12 })

    const entryFace = (entry?.inject as unknown as () => WechatAssistantEntryInjected)()
    const surfaceFace = (surface?.inject as unknown as () => WechatAssistantWorkspaceInjected)()
    expect(surfaceFace.workspace).toBe(entryFace.workspace)
    entryFace.workspace.setOpen(true)
    expect(surfaceFace.workspace.getSnapshot().open).toBe(true)

    await expect(surfaceFace.send(SID, 'self', 'hello')).resolves.toBeNull()
    expect(b.prompt).toHaveBeenLastCalledWith([{ type: 'text', text: 'hello' }], 'queue')
    await expect(surfaceFace.send(SID, 'teacher', 'explain this')).resolves.toBeNull()
    expect(b.prompt.mock.calls.at(-1)?.[0]?.[0]?.text).toContain('[A2A channel: teacher]')
    await expect(surfaceFace.send(undefined, 'self', 'hello')).resolves.toBe('Select a Harness Session from the sidebar first')

    await fiber.dispose()
    expect(b.slots.entries('sidebar.footer.action')).toHaveLength(0)
    expect(b.slots.entries('shell.overlay')).toHaveLength(0)
  })

  it('creates a short-lived OpenAI Realtime client secret without returning the API key', async () => {
    const config: Config = {
      apiKeyEnv: 'OPENAI_API_KEY',
      baseURL: 'https://api.openai.test/v1/',
      model: 'gpt-realtime-test',
      voice: 'marin',
      transcriptionModel: 'gpt-transcribe-test',
      instructions: 'Be concise.',
      voiceSilenceMs: 1600,
      minimaxApiKeyEnv: 'MINIMAX_API_KEY',
      minimaxBaseURL: 'https://api.minimaxi.com/v1',
      minimaxModel: 'speech-2.8-turbo',
      minimaxVoice: 'male-qn-qingse',
      minimaxFormat: 'mp3',
      publicDashboardUrl: '',
      bridgeDeviceName: 'local-harness',
      bridgePollIntervalMs: 1500,
      telegramBotTokenEnv: 'TELEGRAM_BOT_TOKEN',
      telegramAllowedUserIds: '',
    }
    let seenInput: string | URL | Request | undefined
    let seenInit: RequestInit | undefined
    const fetcher = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      seenInput = input
      seenInit = init
      return new Response('{"value":"ek-test"}', { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const response = await createRealtimeClientSecret('sk-secret', config, fetcher)

    expect(await response.text()).toBe('{"value":"ek-test"}')
    expect(seenInput).toBe('https://api.openai.test/v1/realtime/client_secrets')
    expect(seenInit?.headers).toEqual({ authorization: 'Bearer sk-secret', 'content-type': 'application/json' })
    const body = String(seenInit?.body)
    expect(JSON.parse(body)).toMatchObject({
      session: {
        type: 'realtime',
        model: 'gpt-realtime-test',
        output_modalities: ['audio'],
        audio: {
          input: {
            transcription: { model: 'gpt-transcribe-test' },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.32,
              prefix_padding_ms: 900,
              silence_duration_ms: 1600,
              create_response: false,
              interrupt_response: false,
            },
          },
          output: { voice: 'marin' },
        },
      },
    })
    expect(body).not.toContain('sk-secret')
  })

  it('requests MiniMax speech and decodes the upstream hex audio', async () => {
    const config: Config = {
      apiKeyEnv: 'OPENAI_API_KEY',
      baseURL: 'https://api.openai.test/v1/',
      model: 'gpt-realtime-test',
      voice: 'marin',
      transcriptionModel: 'gpt-transcribe-test',
      instructions: 'Be concise.',
      voiceSilenceMs: 2800,
      minimaxApiKeyEnv: 'MINIMAX_API_KEY',
      minimaxBaseURL: 'https://api.minimaxi.test/v1/',
      minimaxModel: 'speech-2.8-turbo',
      minimaxVoice: 'male-qn-qingse',
      minimaxFormat: 'mp3',
      publicDashboardUrl: '',
      bridgeDeviceName: 'local-harness',
      bridgePollIntervalMs: 1500,
      telegramBotTokenEnv: 'TELEGRAM_BOT_TOKEN',
      telegramAllowedUserIds: '',
    }
    let seenInput: string | URL | Request | undefined
    let seenInit: RequestInit | undefined
    const fetcher = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      seenInput = input
      seenInit = init
      return new Response(JSON.stringify({
        data: { audio: '010203' },
        base_resp: { status_code: 0, status_msg: 'success' },
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const response = await createMiniMaxSpeech('sk-minimax', '你好，今天安排如下。', config, fetcher)

    expect(response.headers.get('content-type')).toBe('audio/mpeg')
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([1, 2, 3])
    expect(seenInput).toBe('https://api.minimaxi.test/v1/t2a_v2')
    expect(seenInit?.headers).toEqual({ authorization: 'Bearer sk-minimax', 'content-type': 'application/json' })
    const body = String(seenInit?.body)
    expect(body).not.toContain('sk-minimax')
    expect(JSON.parse(body)).toMatchObject({
      model: 'speech-2.8-turbo',
      text: '你好，今天安排如下。',
      output_format: 'hex',
      voice_setting: { voice_id: 'male-qn-qingse' },
      audio_setting: { sample_rate: 32000, bitrate: 128000, format: 'mp3', channel: 1 },
    })
  })

  it('coalesces adjacent speech fragments and allows one response at a time', () => {
    vi.useFakeTimers()
    const sent: string[] = []
    const userDeltas: string[] = []
    const assistantDeltas: string[] = []
    const call = new OpenAIRealtimeCall({
      onUserTranscriptDelta: text => { userDeltas.push(text) },
      onUserTranscript: () => {},
      onAssistantTranscriptDelta: text => { assistantDeltas.push(text) },
      onAssistantTranscript: () => {},
      onUserSpeechState: () => {},
      onError: () => {},
      onState: () => {},
      onAudioLevel: () => {},
      onRemoteStream: () => {},
      onRemoteAudioStart: () => {},
      onRemoteAudioStop: () => {},
    })
    Object.assign(call, {
      channel: {
        readyState: 'open',
        send: (payload: string) => { sent.push(payload) },
      },
    })
    const receive = (call as unknown as { receive: (raw: unknown) => void }).receive.bind(call)

    receive(JSON.stringify({ type: 'input_audio_buffer.speech_started' }))
    receive(JSON.stringify({ type: 'conversation.item.input_audio_transcription.delta', delta: '你好' }))
    receive(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    vi.advanceTimersByTime(250)
    receive(JSON.stringify({ type: 'input_audio_buffer.speech_started' }))
    receive(JSON.stringify({ type: 'conversation.item.input_audio_transcription.delta', delta: '，我继续说' }))
    receive(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    receive(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    vi.advanceTimersByTime(500)
    receive(JSON.stringify({ type: 'input_audio_buffer.speech_started' }))
    receive(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    vi.advanceTimersByTime(500)
    receive(JSON.stringify({ type: 'response.done' }))
    call.setMuted(true)
    receive(JSON.stringify({ type: 'input_audio_buffer.speech_started' }))
    receive(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    vi.advanceTimersByTime(500)
    call.setMuted(false)
    receive(JSON.stringify({ type: 'input_audio_buffer.speech_started' }))
    receive(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    vi.advanceTimersByTime(500)
    receive(JSON.stringify({ type: 'response.output_audio_transcript.delta', delta: '你好！' }))

    expect(sent.map(payload => (JSON.parse(payload) as { type: string }).type)).toEqual([
      'response.create',
      'response.create',
    ])
    expect(userDeltas).toEqual(['你好', '，我继续说'])
    expect(assistantDeltas).toEqual(['你好！'])
    vi.useRealTimers()
  })

  it('keeps media analysis separate from native remote playback', () => {
    const source = { connect: vi.fn() }
    const analyser = { connect: vi.fn(), fftSize: 0, smoothingTimeConstant: 0 }
    const call = new OpenAIRealtimeCall({
      onUserTranscriptDelta: () => {},
      onUserTranscript: () => {},
      onAssistantTranscriptDelta: () => {},
      onAssistantTranscript: () => {},
      onUserSpeechState: () => {},
      onError: () => {},
      onState: () => {},
      onAudioLevel: () => {},
      onRemoteStream: () => {},
      onRemoteAudioStart: () => {},
      onRemoteAudioStop: () => {},
    })
    Object.assign(call, {
      audioContext: {
        createMediaStreamSource: () => source,
        createAnalyser: () => analyser,
      },
    })
    const createMeter = (call as unknown as {
      createMeter: (stream: MediaStream) => unknown
    }).createMeter.bind(call)

    createMeter({} as MediaStream)

    expect(source.connect).toHaveBeenCalledWith(analyser)
    expect(analyser.connect).not.toHaveBeenCalled()
  })

  it('keeps microphone transmission independent from remote playback', () => {
    const track = { enabled: true }
    const onRemoteAudioStart = vi.fn()
    const onRemoteAudioStop = vi.fn()
    const call = new OpenAIRealtimeCall({
      onUserTranscriptDelta: () => {},
      onUserTranscript: () => {},
      onAssistantTranscriptDelta: () => {},
      onAssistantTranscript: () => {},
      onUserSpeechState: () => {},
      onError: () => {},
      onState: () => {},
      onAudioLevel: () => {},
      onRemoteStream: () => {},
      onRemoteAudioStart,
      onRemoteAudioStop,
    })
    Object.assign(call, { input: { getAudioTracks: () => [track] } })
    const receive = (call as unknown as { receive: (raw: unknown) => void }).receive.bind(call)

    receive(JSON.stringify({ type: 'output_audio_buffer.started' }))
    expect(track.enabled).toBe(true)
    receive(JSON.stringify({ type: 'output_audio_buffer.stopped' }))
    call.setMuted(true)
    receive(JSON.stringify({ type: 'output_audio_buffer.started' }))
    expect(track.enabled).toBe(false)
    receive(JSON.stringify({ type: 'output_audio_buffer.cleared' }))
    expect(onRemoteAudioStart).toHaveBeenCalledTimes(2)
    expect(onRemoteAudioStop).toHaveBeenCalledTimes(2)
  })

})
