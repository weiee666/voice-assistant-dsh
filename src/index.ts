/** Host transport for the WeChat Assistant's voice services. */

import type { ServerResponse } from 'node:http'
import type { IncomingMessage } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import {
  A2A_ASSISTANT_SETTINGS_NAMESPACE, type AssistantSettings,
} from './settings-contract.ts'

/** Stable Cordis plugin name. */
export const name = 'client-ui-a2a-assistant'

/** Host services needed to create a secret-backed Realtime call. */
export const inject = ['credentials', 'webServer']

const REALTIME_PATH = '/api/wechat-assistant/openai/realtime'
const SECRETARY_TTS_PATH = '/api/wechat-assistant/tts'
const ASSISTANT_MESSAGES_PATH = '/api/wechat-assistant/messages'
const ASSISTANT_REPLIES_PATH = '/api/wechat-assistant/replies'
const MAX_TTS_TEXT_LENGTH = 4_000
const MAX_MESSAGE_TEXT_LENGTH = 8_000
const MAX_BRIDGE_MESSAGES = 500

type ConversationId = 'self' | 'teacher' | 'claude' | 'chatgpt'
type AssistantMessageRole = 'user' | 'assistant' | 'system'
type AssistantMessageSource = 'web' | 'telegram'
type AssistantMessageStatus = 'pending' | 'handled'

interface AssistantBridgeMessage {
  readonly id: string
  readonly conversation: ConversationId
  readonly role: AssistantMessageRole
  readonly text: string
  readonly time: number
  readonly source: AssistantMessageSource
  readonly telegramChatId?: number
  readonly telegramMessageId?: number
  status?: AssistantMessageStatus
}

interface TelegramUpdate {
  readonly update_id?: unknown
  readonly message?: {
    readonly message_id?: unknown
    readonly from?: { readonly id?: unknown }
    readonly chat?: { readonly id?: unknown }
    readonly text?: unknown
  }
}

/** Voice service settings owned by the assistant deployment. */
export interface Config extends AssistantSettings {}

export const Config: z<Config> = z.object({
  apiKeyEnv: z.string().role('credential-ref').default('OPENAI_API_KEY'),
  baseURL: z.string().default('https://api.openai.com/v1'),
  model: z.string().default('gpt-realtime-2.1'),
  voice: z.string().default('marin'),
  transcriptionModel: z.string().default('gpt-4o-mini-transcribe'),
  instructions: z.string().default('You are a concise, warm personal assistant. Speak naturally and support Mandarin-English code-switching.'),
  voiceSilenceMs: z.natural().min(250).default(2800),
  minimaxApiKeyEnv: z.string().role('credential-ref').default('MINIMAX_API_KEY'),
  minimaxBaseURL: z.string().default('https://api.minimaxi.com/v1'),
  minimaxModel: z.string().default('speech-2.8-turbo'),
  minimaxVoice: z.string().default('male-qn-qingse'),
  minimaxFormat: z.string().default('mp3'),
  publicDashboardUrl: z.string().default(''),
  bridgeDeviceName: z.string().default('local-harness'),
  bridgePollIntervalMs: z.natural().min(500).default(1500),
  telegramBotTokenEnv: z.string().role('credential-ref').default('TELEGRAM_BOT_TOKEN'),
  telegramAllowedUserIds: z.string().default(''),
})

function realtimeSession(config: Config): object {
  return {
    type: 'realtime',
    model: config.model,
    output_modalities: ['audio'],
    instructions: config.instructions,
    audio: {
      input: {
        transcription: { model: config.transcriptionModel },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.32,
          prefix_padding_ms: 900,
          silence_duration_ms: config.voiceSilenceMs,
          create_response: false,
          interrupt_response: false,
        },
      },
      output: { voice: config.voice },
    },
  }
}

/** Mint a short-lived OpenAI Realtime client secret.
 * @param apiKey - server-resolved OpenAI API key.
 * @param config - validated Realtime settings.
 * @param fetcher - HTTP implementation, replaceable by focused tests.
 * @returns the upstream client-secret response.
 */
export async function createRealtimeClientSecret(
  apiKey: string,
  config: Config,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  return fetcher(`${config.baseURL.replace(/\/$/u, '')}/realtime/client_secrets`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ session: realtimeSession(config) }),
  })
}

/** Request speech audio from MiniMax's T2A endpoint.
 * @param apiKey - server-resolved MiniMax API key.
 * @param text - Text to synthesize.
 * @param config - validated MiniMax settings.
 * @param fetcher - HTTP implementation, replaceable by focused tests.
 * @returns an audio response decoded from the upstream hex payload.
 */
export async function createMiniMaxSpeech(
  apiKey: string,
  text: string,
  config: Config,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const response = await fetcher(`${config.minimaxBaseURL.replace(/\/$/u, '')}/t2a_v2`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: config.minimaxModel,
      text,
      stream: false,
      language_boost: 'auto',
      output_format: 'hex',
      voice_setting: {
        voice_id: config.minimaxVoice,
        speed: 1,
        vol: 1,
        pitch: 0,
      },
      audio_setting: {
        sample_rate: 32_000,
        bitrate: 128_000,
        format: config.minimaxFormat,
        channel: 1,
      },
    }),
  })
  const body = await response.text()
  if (!response.ok) {
    return new Response(body, {
      status: response.status,
      headers: { 'content-type': response.headers.get('content-type') ?? 'application/json; charset=utf-8' },
    })
  }
  const audio = readMiniMaxAudio(body)
  if (audio === undefined) {
    return new Response(JSON.stringify({ error: 'MiniMax returned an invalid TTS response' }), {
      status: 502,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }
  const audioBody = new ArrayBuffer(audio.byteLength)
  new Uint8Array(audioBody).set(audio)
  return new Response(audioBody, { status: 200, headers: { 'content-type': contentTypeForAudioFormat(config.minimaxFormat) } })
}

function readClientSecret(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as { readonly value?: unknown }
    return typeof parsed.value === 'string' && parsed.value !== '' ? parsed.value : undefined
  } catch {
    return undefined
  }
}

function readMiniMaxAudio(body: string): Uint8Array | undefined {
  try {
    const parsed = JSON.parse(body) as {
      readonly data?: { readonly audio?: unknown }
      readonly base_resp?: { readonly status_code?: unknown; readonly status_msg?: unknown }
    }
    const statusCode = parsed.base_resp?.status_code
    if (statusCode !== undefined && statusCode !== 0) return undefined
    return typeof parsed.data?.audio === 'string' ? hexToBytes(parsed.data.audio) : undefined
  } catch {
    return undefined
  }
}

function hexToBytes(hex: string): Uint8Array | undefined {
  if (hex.length % 2 !== 0 || !/^[\da-f]*$/iu.test(hex)) return undefined
  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  }
  return bytes
}

function contentTypeForAudioFormat(format: string): string {
  switch (format) {
    case 'mp3': return 'audio/mpeg'
    case 'wav': return 'audio/wav'
    case 'flac': return 'audio/flac'
    case 'pcm': return 'audio/L16'
    default: return 'application/octet-stream'
  }
}

function answer(res: ServerResponse, status: number, contentType: string, body: string): void {
  res.writeHead(status, { 'content-type': contentType, 'cache-control': 'no-store' })
  res.end(body)
}

function answerBytes(res: ServerResponse, status: number, contentType: string, body: Uint8Array): void {
  res.writeHead(status, { 'content-type': contentType, 'cache-control': 'no-store' })
  res.end(body)
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks).toString('utf8')
}

function readTtsText(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as { readonly text?: unknown }
    if (typeof parsed.text !== 'string') return undefined
    const text = parsed.text.trim()
    return text === '' || text.length > MAX_TTS_TEXT_LENGTH ? undefined : text
  } catch {
    return undefined
  }
}

function readJsonBody(body: string): unknown {
  try {
    return JSON.parse(body) as unknown
  } catch {
    return undefined
  }
}

function readConversation(value: unknown): ConversationId | undefined {
  return value === 'self' || value === 'teacher' || value === 'claude' || value === 'chatgpt' ? value : undefined
}

function readMessageRole(value: unknown): AssistantMessageRole | undefined {
  return value === 'user' || value === 'assistant' || value === 'system' ? value : undefined
}

function readMessageText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const text = value.trim()
  return text === '' || text.length > MAX_MESSAGE_TEXT_LENGTH ? undefined : text
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function parseAllowedTelegramUsers(raw: string): ReadonlySet<number> {
  const ids = raw
    .split(',')
    .map(part => Number.parseInt(part.trim(), 10))
    .filter(Number.isFinite)
  return new Set(ids)
}

function isDashboardCommand(text: string): boolean {
  const normalized = text.trim().toLowerCase()
  return normalized === '看板' || normalized === '/dashboard' || normalized === 'dashboard'
}

function dashboardReply(settings: Config): string {
  const url = settings.publicDashboardUrl.trim()
  return url === ''
    ? '公网看板地址还没有配置。请先在微信助手设置里填写 Vercel 生产地址。'
    : `看板地址：${url}`
}

function createBridgeStore() {
  let nextMessageId = 1
  const messages: AssistantBridgeMessage[] = []
  const append = (message: Omit<AssistantBridgeMessage, 'id' | 'time'> & { readonly time?: number }): AssistantBridgeMessage => {
    const stored: AssistantBridgeMessage = {
      ...message,
      id: String(nextMessageId),
      time: message.time ?? Date.now(),
    }
    messages.push(stored)
    if (messages.length > MAX_BRIDGE_MESSAGES) messages.splice(0, messages.length - MAX_BRIDGE_MESSAGES)
    nextMessageId += 1
    return stored
  }
  return {
    append,
    list: () => messages,
    find: (id: string) => messages.find(message => message.id === id),
  }
}

async function resolveOptionalCredential(ctx: Context, ref: string): Promise<string | undefined> {
  const credential = await ctx.credentials.resolve(credentialRef(ref))
  return credential?.value
}

async function telegramRequest(token: string, method: string, body?: object): Promise<unknown> {
  const init: RequestInit = body === undefined
    ? { method: 'GET' }
    : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, init)
  if (!response.ok) throw new Error(`Telegram ${method} failed with ${response.status}`)
  return response.json() as Promise<unknown>
}

async function sendTelegramMessage(token: string, chatId: number, text: string): Promise<void> {
  await telegramRequest(token, 'sendMessage', { chat_id: chatId, text })
}

async function createSecretarySpeech(ctx: Context, text: string, config: Config): Promise<Response> {
  const credential = await ctx.credentials.resolve(credentialRef(config.minimaxApiKeyEnv))
  if (credential === undefined) {
    return new Response(JSON.stringify({ error: `${config.minimaxApiKeyEnv} is not configured` }), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }
  return createMiniMaxSpeech(credential.value, text, config)
}

/** Register the voice service routes.
 * @param ctx - host context carrying credentials and the Web route registry.
 * @param config - validated voice settings.
 */
export function apply(ctx: Context, config: Config): void {
  let current: () => Config = () => config
  const bridge = createBridgeStore()
  let telegramOffset = 0
  let telegramPolling = false
  installSettingsSection(
    ctx,
    settingsNamespace(A2A_ASSISTANT_SETTINGS_NAMESPACE),
    Config,
    config,
    { setSource: source => { current = source }, onChange: () => {} },
  )
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ASSISTANT_MESSAGES_PATH,
    handler: async (req, res) => {
      if (req.method === 'GET') {
        answer(res, 200, 'application/json; charset=utf-8', JSON.stringify({ messages: bridge.list() }))
        return
      }
      if (req.method !== 'POST') {
        answer(res, 405, 'application/json; charset=utf-8', JSON.stringify({ error: 'Method not allowed' }))
        return
      }
      const parsed = readJsonBody(await readBody(req)) as {
        readonly conversation?: unknown
        readonly role?: unknown
        readonly text?: unknown
      } | undefined
      const conversation = readConversation(parsed?.conversation)
      const role = readMessageRole(parsed?.role)
      const text = readMessageText(parsed?.text)
      if (conversation === undefined || role === undefined || text === undefined) {
        answer(res, 400, 'application/json; charset=utf-8', JSON.stringify({ error: 'conversation, role and text are required' }))
        return
      }
      const message = bridge.append({ conversation, role, text, source: 'web', status: 'handled' })
      answer(res, 200, 'application/json; charset=utf-8', JSON.stringify({ message }))
    },
  }), 'ui-a2a-assistant: bridge message route')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ASSISTANT_REPLIES_PATH,
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        answer(res, 405, 'application/json; charset=utf-8', JSON.stringify({ error: 'Method not allowed' }))
        return
      }
      const parsed = readJsonBody(await readBody(req)) as { readonly messageId?: unknown; readonly text?: unknown } | undefined
      const messageId = typeof parsed?.messageId === 'string' ? parsed.messageId : undefined
      const text = readMessageText(parsed?.text)
      const source = messageId === undefined ? undefined : bridge.find(messageId)
      if (messageId === undefined || text === undefined || source === undefined) {
        answer(res, 400, 'application/json; charset=utf-8', JSON.stringify({ error: 'messageId and text are required' }))
        return
      }
      source.status = 'handled'
      bridge.append({ conversation: source.conversation, role: 'assistant', text, source: 'web', status: 'handled' })
      if (source.telegramChatId !== undefined) {
        const token = await resolveOptionalCredential(ctx, current().telegramBotTokenEnv)
        if (token !== undefined) await sendTelegramMessage(token, source.telegramChatId, text)
      }
      answer(res, 200, 'application/json; charset=utf-8', JSON.stringify({ ok: true }))
    },
  }), 'ui-a2a-assistant: bridge reply route')
  ctx.effect(() => {
    const poll = async (): Promise<void> => {
      if (telegramPolling) return
      telegramPolling = true
      try {
        const settings = current()
        const token = await resolveOptionalCredential(ctx, settings.telegramBotTokenEnv)
        if (token === undefined) return
        const result = await telegramRequest(token, `getUpdates?timeout=0&offset=${telegramOffset}`) as {
          readonly ok?: unknown
          readonly result?: readonly TelegramUpdate[]
        }
        const allowed = parseAllowedTelegramUsers(settings.telegramAllowedUserIds)
        for (const update of result.result ?? []) {
          const updateId = readNumber(update.update_id)
          if (updateId !== undefined) telegramOffset = Math.max(telegramOffset, updateId + 1)
          const message = update.message
          const chatId = readNumber(message?.chat?.id)
          const userId = readNumber(message?.from?.id)
          const messageId = readNumber(message?.message_id)
          const text = readMessageText(message?.text)
          if (chatId === undefined || text === undefined) continue
          if (allowed.size > 0 && (userId === undefined || !allowed.has(userId))) continue
          if (isDashboardCommand(text)) {
            await sendTelegramMessage(token, chatId, dashboardReply(settings))
            continue
          }
          const bridgeMessage: Omit<AssistantBridgeMessage, 'id' | 'time'> = {
            conversation: 'self',
            role: 'user',
            text,
            source: 'telegram',
            telegramChatId: chatId,
            status: 'pending',
          }
          if (messageId !== undefined) {
            bridge.append({ ...bridgeMessage, telegramMessageId: messageId })
          } else {
            bridge.append(bridgeMessage)
          }
        }
      } finally {
        telegramPolling = false
      }
    }
    const timer = setInterval(() => { void poll().catch(() => {}) }, Math.max(500, current().bridgePollIntervalMs))
    void poll().catch(() => {})
    return () => { clearInterval(timer) }
  }, 'ui-a2a-assistant: Telegram polling bridge')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: REALTIME_PATH,
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        answer(res, 405, 'application/json; charset=utf-8', JSON.stringify({ error: 'Method not allowed' }))
        return
      }
      const settings = current()
      const credential = await ctx.credentials.resolve(credentialRef(settings.apiKeyEnv))
      if (credential === undefined) {
        answer(res, 503, 'application/json; charset=utf-8', JSON.stringify({ error: `${settings.apiKeyEnv} is not configured` }))
        return
      }
      const secretResponse = await createRealtimeClientSecret(credential.value, settings)
      const secretBody = await secretResponse.text()
      if (!secretResponse.ok) {
        answer(
          res,
          secretResponse.status,
          secretResponse.headers.get('content-type') ?? 'application/json; charset=utf-8',
          secretBody,
        )
        return
      }
      const clientSecret = readClientSecret(secretBody)
      if (clientSecret === undefined) {
        answer(res, 502, 'application/json; charset=utf-8', JSON.stringify({ error: 'OpenAI returned an invalid Realtime client secret' }))
        return
      }
      answer(
        res,
        200,
        'application/json; charset=utf-8',
        JSON.stringify({
          value: clientSecret,
          callsURL: `${settings.baseURL.replace(/\/$/u, '')}/realtime/calls`,
        }),
      )
    },
  }), 'ui-a2a-assistant: OpenAI Realtime call route')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: SECRETARY_TTS_PATH,
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        answer(res, 405, 'application/json; charset=utf-8', JSON.stringify({ error: 'Method not allowed' }))
        return
      }
      const text = readTtsText(await readBody(req))
      if (text === undefined) {
        answer(res, 400, 'application/json; charset=utf-8', JSON.stringify({ error: 'Text is required and must be at most 4000 characters' }))
        return
      }
      const speechResponse = await createSecretarySpeech(ctx, text, current())
      const speechBody = new Uint8Array(await speechResponse.arrayBuffer())
      const contentType = speechResponse.headers.get('content-type') ?? 'audio/mpeg'
      answerBytes(res, speechResponse.status, contentType, speechBody)
    },
  }), 'ui-a2a-assistant: Secretary TTS route')
}
