/** Host transport for the WeChat Assistant's voice services. */
import { createHmac, randomUUID } from 'node:crypto';
import z from '@deepseek-ai/schemastery';
import { credentialRef } from '@deepseek-ai/dsh-credentials';
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings';
import { A2A_ASSISTANT_SETTINGS_NAMESPACE, } from "./settings-contract.js";
/** Stable Cordis plugin name. */
export const name = 'client-ui-a2a-assistant';
/** Host services needed to create a secret-backed Realtime call. */
export const inject = ['credentials', 'webServer'];
const REALTIME_PATH = '/api/wechat-assistant/openai/realtime';
const SECRETARY_TTS_PATH = '/api/wechat-assistant/tts';
const SECRETARY_ASR_PATH = '/api/wechat-assistant/asr';
const ASSISTANT_MESSAGES_PATH = '/api/wechat-assistant/messages';
const ASSISTANT_REPLIES_PATH = '/api/wechat-assistant/replies';
const MAX_TTS_TEXT_LENGTH = 4_000;
const MAX_MESSAGE_TEXT_LENGTH = 8_000;
const MAX_ASR_BYTES = 2 * 1024 * 1024;
const MAX_BRIDGE_MESSAGES = 500;
export const Config = z.object({
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
    aliyunNlsTokenEnv: z.string().role('credential-ref').default('ALIYUN_NLS_TOKEN'),
    aliyunAccessKeyIdEnv: z.string().role('credential-ref').default('ALIYUN_AK_ID'),
    aliyunAccessKeySecretEnv: z.string().role('credential-ref').default('ALIYUN_AK_SECRET'),
    aliyunTokenRegionId: z.string().default('cn-shanghai'),
    aliyunTokenURL: z.string().default('https://nls-meta.cn-shanghai.aliyuncs.com/'),
    aliyunNlsAppKey: z.string().default(''),
    aliyunAsrURL: z.string().default('https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/asr'),
    aliyunAsrFormat: z.string().default('pcm'),
    aliyunAsrSampleRate: z.natural().min(8000).default(16000),
    publicDashboardUrl: z.string().default(''),
    bridgeDeviceName: z.string().default('local-harness'),
    bridgePollIntervalMs: z.natural().min(500).default(1500),
    telegramBotTokenEnv: z.string().role('credential-ref').default('TELEGRAM_BOT_TOKEN'),
    telegramAllowedUserIds: z.string().default(''),
});
function realtimeSession(config) {
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
    };
}
/** Mint a short-lived OpenAI Realtime client secret.
 * @param apiKey - server-resolved OpenAI API key.
 * @param config - validated Realtime settings.
 * @param fetcher - HTTP implementation, replaceable by focused tests.
 * @returns the upstream client-secret response.
 */
export async function createRealtimeClientSecret(apiKey, config, fetcher = fetch) {
    return fetcher(`${config.baseURL.replace(/\/$/u, '')}/realtime/client_secrets`, {
        method: 'POST',
        headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json',
        },
        body: JSON.stringify({ session: realtimeSession(config) }),
    });
}
/** Request speech audio from MiniMax's T2A endpoint.
 * @param apiKey - server-resolved MiniMax API key.
 * @param text - Text to synthesize.
 * @param config - validated MiniMax settings.
 * @param fetcher - HTTP implementation, replaceable by focused tests.
 * @returns an audio response decoded from the upstream hex payload.
 */
export async function createMiniMaxSpeech(apiKey, text, config, fetcher = fetch) {
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
    });
    const body = await response.text();
    if (!response.ok) {
        return new Response(body, {
            status: response.status,
            headers: { 'content-type': response.headers.get('content-type') ?? 'application/json; charset=utf-8' },
        });
    }
    const audio = readMiniMaxAudio(body);
    if (audio === undefined) {
        return new Response(JSON.stringify({ error: 'MiniMax returned an invalid TTS response' }), {
            status: 502,
            headers: { 'content-type': 'application/json; charset=utf-8' },
        });
    }
    const audioBody = new ArrayBuffer(audio.byteLength);
    new Uint8Array(audioBody).set(audio);
    return new Response(audioBody, { status: 200, headers: { 'content-type': contentTypeForAudioFormat(config.minimaxFormat) } });
}
/** Request a short-sentence transcript from Aliyun Intelligent Speech Interaction.
 * @param token - server-resolved Aliyun NLS token.
 * @param audio - PCM audio bytes captured by the browser.
 * @param config - validated Aliyun ASR settings.
 * @param fetcher - HTTP implementation, replaceable by focused tests.
 * @returns the Aliyun ASR response.
 */
export async function createAliyunAsrTranscript(token, audio, config, fetcher = fetch) {
    const url = new URL(config.aliyunAsrURL);
    url.searchParams.set('appkey', config.aliyunNlsAppKey);
    url.searchParams.set('format', config.aliyunAsrFormat);
    url.searchParams.set('sample_rate', String(config.aliyunAsrSampleRate));
    url.searchParams.set('enable_punctuation_prediction', 'true');
    url.searchParams.set('enable_inverse_text_normalization', 'true');
    url.searchParams.set('enable_voice_detection', 'true');
    return fetcher(url, {
        method: 'POST',
        headers: {
            'X-NLS-Token': token,
            'content-type': 'application/octet-stream',
        },
        body: bodyBuffer(audio),
    });
}
/** Create an Aliyun NLS token with POP OpenAPI signing.
 * @param accessKeyId - Aliyun AccessKey ID.
 * @param accessKeySecret - Aliyun AccessKey Secret.
 * @param config - validated Aliyun token settings.
 * @param fetcher - HTTP implementation, replaceable by focused tests.
 * @returns the temporary NLS token and expiry.
 */
export async function createAliyunNlsToken(accessKeyId, accessKeySecret, config, fetcher = fetch) {
    const parameters = {
        AccessKeyId: accessKeyId,
        Action: 'CreateToken',
        Format: 'JSON',
        RegionId: config.aliyunTokenRegionId,
        SignatureMethod: 'HMAC-SHA1',
        SignatureNonce: randomUUID(),
        SignatureVersion: '1.0',
        Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/u, 'Z'),
        Version: '2019-02-28',
    };
    const canonical = canonicalQuery(parameters);
    const stringToSign = `GET&%2F&${percentEncode(canonical)}`;
    parameters.Signature = createHmac('sha1', `${accessKeySecret}&`).update(stringToSign).digest('base64');
    const url = new URL(config.aliyunTokenURL);
    for (const [key, value] of Object.entries(parameters))
        url.searchParams.set(key, value);
    const response = await fetcher(url);
    const body = await response.text();
    if (!response.ok)
        throw new Error(body.trim() || `Aliyun CreateToken failed (${String(response.status)})`);
    return readAliyunToken(body);
}
function readClientSecret(body) {
    try {
        const parsed = JSON.parse(body);
        return typeof parsed.value === 'string' && parsed.value !== '' ? parsed.value : undefined;
    }
    catch {
        return undefined;
    }
}
function readMiniMaxAudio(body) {
    try {
        const parsed = JSON.parse(body);
        const statusCode = parsed.base_resp?.status_code;
        if (statusCode !== undefined && statusCode !== 0)
            return undefined;
        return typeof parsed.data?.audio === 'string' ? hexToBytes(parsed.data.audio) : undefined;
    }
    catch {
        return undefined;
    }
}
function hexToBytes(hex) {
    if (hex.length % 2 !== 0 || !/^[\da-f]*$/iu.test(hex))
        return undefined;
    const bytes = new Uint8Array(hex.length / 2);
    for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
    }
    return bytes;
}
function contentTypeForAudioFormat(format) {
    switch (format) {
        case 'mp3': return 'audio/mpeg';
        case 'wav': return 'audio/wav';
        case 'flac': return 'audio/flac';
        case 'pcm': return 'audio/L16';
        default: return 'application/octet-stream';
    }
}
function percentEncode(value) {
    return encodeURIComponent(value)
        .replace(/\+/gu, '%20')
        .replace(/\*/gu, '%2A')
        .replace(/%7E/gu, '~');
}
function canonicalQuery(parameters) {
    return Object.keys(parameters)
        .sort()
        .map(key => `${percentEncode(key)}=${percentEncode(parameters[key] ?? '')}`)
        .join('&');
}
function readAliyunToken(body) {
    const parsed = JSON.parse(body);
    const id = parsed.Token?.Id;
    const expireTime = parsed.Token?.ExpireTime;
    if (typeof id !== 'string' || id === '' || typeof expireTime !== 'number') {
        throw new Error('Aliyun CreateToken returned an invalid token response');
    }
    return { id, expireTime };
}
function bodyBuffer(bytes) {
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return body;
}
function answer(res, status, contentType, body) {
    res.writeHead(status, { 'content-type': contentType, 'cache-control': 'no-store' });
    res.end(body);
}
function answerBytes(res, status, contentType, body) {
    res.writeHead(status, { 'content-type': contentType, 'cache-control': 'no-store' });
    res.end(body);
}
async function readBody(req) {
    const chunks = [];
    for await (const chunk of req)
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    return Buffer.concat(chunks).toString('utf8');
}
function readAsrAudio(body) {
    try {
        const parsed = JSON.parse(body);
        if (typeof parsed.audio !== 'string' || parsed.audio === '')
            return undefined;
        const bytes = Buffer.from(parsed.audio, 'base64');
        return bytes.byteLength > MAX_ASR_BYTES ? undefined : new Uint8Array(bytes);
    }
    catch {
        return undefined;
    }
}
function readTtsText(body) {
    try {
        const parsed = JSON.parse(body);
        if (typeof parsed.text !== 'string')
            return undefined;
        const text = parsed.text.trim();
        return text === '' || text.length > MAX_TTS_TEXT_LENGTH ? undefined : text;
    }
    catch {
        return undefined;
    }
}
function readJsonBody(body) {
    try {
        return JSON.parse(body);
    }
    catch {
        return undefined;
    }
}
function readConversation(value) {
    return value === 'self' || value === 'teacher' || value === 'claude' || value === 'chatgpt' ? value : undefined;
}
function readMessageRole(value) {
    return value === 'user' || value === 'assistant' || value === 'system' ? value : undefined;
}
function readMessageText(value) {
    if (typeof value !== 'string')
        return undefined;
    const text = value.trim();
    return text === '' || text.length > MAX_MESSAGE_TEXT_LENGTH ? undefined : text;
}
function readNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function parseAllowedTelegramUsers(raw) {
    const ids = raw
        .split(',')
        .map(part => Number.parseInt(part.trim(), 10))
        .filter(Number.isFinite);
    return new Set(ids);
}
function isDashboardCommand(text) {
    const normalized = text.trim().toLowerCase();
    return normalized === '看板' || normalized === '/dashboard' || normalized === 'dashboard';
}
function dashboardReply(settings) {
    const url = settings.publicDashboardUrl.trim();
    return url === ''
        ? '公网看板地址还没有配置。请先在微信助手设置里填写 Vercel 生产地址。'
        : `看板地址：${url}`;
}
function createBridgeStore() {
    let nextMessageId = 1;
    const messages = [];
    const append = (message) => {
        const stored = {
            ...message,
            id: String(nextMessageId),
            time: message.time ?? Date.now(),
        };
        messages.push(stored);
        if (messages.length > MAX_BRIDGE_MESSAGES)
            messages.splice(0, messages.length - MAX_BRIDGE_MESSAGES);
        nextMessageId += 1;
        return stored;
    };
    return {
        append,
        list: () => messages,
        find: (id) => messages.find(message => message.id === id),
    };
}
async function resolveOptionalCredential(ctx, ref) {
    const credential = await ctx.credentials.resolve(credentialRef(ref));
    return credential?.value;
}
async function telegramRequest(token, method, body) {
    const init = body === undefined
        ? { method: 'GET' }
        : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, init);
    if (!response.ok)
        throw new Error(`Telegram ${method} failed with ${response.status}`);
    return response.json();
}
async function sendTelegramMessage(token, chatId, text) {
    await telegramRequest(token, 'sendMessage', { chat_id: chatId, text });
}
async function createSecretarySpeech(ctx, text, config) {
    const credential = await ctx.credentials.resolve(credentialRef(config.minimaxApiKeyEnv));
    if (credential === undefined) {
        return new Response(JSON.stringify({ error: `${config.minimaxApiKeyEnv} is not configured` }), {
            status: 503,
            headers: { 'content-type': 'application/json; charset=utf-8' },
        });
    }
    return createMiniMaxSpeech(credential.value, text, config);
}
async function createSecretaryAsr(audio, config, readToken) {
    if (config.aliyunNlsAppKey.trim() === '') {
        return new Response(JSON.stringify({ error: 'Aliyun NLS AppKey is not configured' }), {
            status: 503,
            headers: { 'content-type': 'application/json; charset=utf-8' },
        });
    }
    const token = await readToken(config);
    if (token === undefined) {
        return new Response(JSON.stringify({ error: 'Aliyun AccessKey or NLS Token is not configured' }), {
            status: 503,
            headers: { 'content-type': 'application/json; charset=utf-8' },
        });
    }
    return createAliyunAsrTranscript(token, audio, config);
}
/** Register the voice service routes.
 * @param ctx - host context carrying credentials and the Web route registry.
 * @param config - validated voice settings.
 */
export function apply(ctx, config) {
    let current = () => config;
    const bridge = createBridgeStore();
    let telegramOffset = 0;
    let telegramPolling = false;
    let aliyunTokenCache;
    const readAliyunNlsToken = async (settings) => {
        const nowSeconds = Math.floor(Date.now() / 1000);
        if (aliyunTokenCache !== undefined && aliyunTokenCache.expireTime - nowSeconds > 300)
            return aliyunTokenCache.id;
        const accessKeyId = await resolveOptionalCredential(ctx, settings.aliyunAccessKeyIdEnv);
        const accessKeySecret = await resolveOptionalCredential(ctx, settings.aliyunAccessKeySecretEnv);
        if (accessKeyId !== undefined && accessKeySecret !== undefined) {
            aliyunTokenCache = await createAliyunNlsToken(accessKeyId, accessKeySecret, settings);
            return aliyunTokenCache.id;
        }
        return resolveOptionalCredential(ctx, settings.aliyunNlsTokenEnv);
    };
    installSettingsSection(ctx, settingsNamespace(A2A_ASSISTANT_SETTINGS_NAMESPACE), Config, config, { setSource: source => { current = source; }, onChange: () => { } });
    ctx.effect(() => ctx.webServer.register({
        kind: 'exact',
        path: ASSISTANT_MESSAGES_PATH,
        handler: async (req, res) => {
            if (req.method === 'GET') {
                answer(res, 200, 'application/json; charset=utf-8', JSON.stringify({ messages: bridge.list() }));
                return;
            }
            if (req.method !== 'POST') {
                answer(res, 405, 'application/json; charset=utf-8', JSON.stringify({ error: 'Method not allowed' }));
                return;
            }
            const parsed = readJsonBody(await readBody(req));
            const conversation = readConversation(parsed?.conversation);
            const role = readMessageRole(parsed?.role);
            const text = readMessageText(parsed?.text);
            if (conversation === undefined || role === undefined || text === undefined) {
                answer(res, 400, 'application/json; charset=utf-8', JSON.stringify({ error: 'conversation, role and text are required' }));
                return;
            }
            const message = bridge.append({ conversation, role, text, source: 'web', status: 'handled' });
            answer(res, 200, 'application/json; charset=utf-8', JSON.stringify({ message }));
        },
    }), 'ui-a2a-assistant: bridge message route');
    ctx.effect(() => ctx.webServer.register({
        kind: 'exact',
        path: ASSISTANT_REPLIES_PATH,
        handler: async (req, res) => {
            if (req.method !== 'POST') {
                answer(res, 405, 'application/json; charset=utf-8', JSON.stringify({ error: 'Method not allowed' }));
                return;
            }
            const parsed = readJsonBody(await readBody(req));
            const messageId = typeof parsed?.messageId === 'string' ? parsed.messageId : undefined;
            const text = readMessageText(parsed?.text);
            const source = messageId === undefined ? undefined : bridge.find(messageId);
            if (messageId === undefined || text === undefined || source === undefined) {
                answer(res, 400, 'application/json; charset=utf-8', JSON.stringify({ error: 'messageId and text are required' }));
                return;
            }
            source.status = 'handled';
            bridge.append({ conversation: source.conversation, role: 'assistant', text, source: 'web', status: 'handled' });
            if (source.telegramChatId !== undefined) {
                const token = await resolveOptionalCredential(ctx, current().telegramBotTokenEnv);
                if (token !== undefined)
                    await sendTelegramMessage(token, source.telegramChatId, text);
            }
            answer(res, 200, 'application/json; charset=utf-8', JSON.stringify({ ok: true }));
        },
    }), 'ui-a2a-assistant: bridge reply route');
    ctx.effect(() => {
        const poll = async () => {
            if (telegramPolling)
                return;
            telegramPolling = true;
            try {
                const settings = current();
                const token = await resolveOptionalCredential(ctx, settings.telegramBotTokenEnv);
                if (token === undefined)
                    return;
                const result = await telegramRequest(token, `getUpdates?timeout=0&offset=${telegramOffset}`);
                const allowed = parseAllowedTelegramUsers(settings.telegramAllowedUserIds);
                for (const update of result.result ?? []) {
                    const updateId = readNumber(update.update_id);
                    if (updateId !== undefined)
                        telegramOffset = Math.max(telegramOffset, updateId + 1);
                    const message = update.message;
                    const chatId = readNumber(message?.chat?.id);
                    const userId = readNumber(message?.from?.id);
                    const messageId = readNumber(message?.message_id);
                    const text = readMessageText(message?.text);
                    if (chatId === undefined || text === undefined)
                        continue;
                    if (allowed.size > 0 && (userId === undefined || !allowed.has(userId)))
                        continue;
                    if (isDashboardCommand(text)) {
                        await sendTelegramMessage(token, chatId, dashboardReply(settings));
                        continue;
                    }
                    const bridgeMessage = {
                        conversation: 'self',
                        role: 'user',
                        text,
                        source: 'telegram',
                        telegramChatId: chatId,
                        status: 'pending',
                    };
                    if (messageId !== undefined) {
                        bridge.append({ ...bridgeMessage, telegramMessageId: messageId });
                    }
                    else {
                        bridge.append(bridgeMessage);
                    }
                }
            }
            finally {
                telegramPolling = false;
            }
        };
        const timer = setInterval(() => { void poll().catch(() => { }); }, Math.max(500, current().bridgePollIntervalMs));
        void poll().catch(() => { });
        return () => { clearInterval(timer); };
    }, 'ui-a2a-assistant: Telegram polling bridge');
    ctx.effect(() => ctx.webServer.register({
        kind: 'exact',
        path: REALTIME_PATH,
        handler: async (req, res) => {
            if (req.method !== 'POST') {
                answer(res, 405, 'application/json; charset=utf-8', JSON.stringify({ error: 'Method not allowed' }));
                return;
            }
            const settings = current();
            const credential = await ctx.credentials.resolve(credentialRef(settings.apiKeyEnv));
            if (credential === undefined) {
                answer(res, 503, 'application/json; charset=utf-8', JSON.stringify({ error: `${settings.apiKeyEnv} is not configured` }));
                return;
            }
            const secretResponse = await createRealtimeClientSecret(credential.value, settings);
            const secretBody = await secretResponse.text();
            if (!secretResponse.ok) {
                answer(res, secretResponse.status, secretResponse.headers.get('content-type') ?? 'application/json; charset=utf-8', secretBody);
                return;
            }
            const clientSecret = readClientSecret(secretBody);
            if (clientSecret === undefined) {
                answer(res, 502, 'application/json; charset=utf-8', JSON.stringify({ error: 'OpenAI returned an invalid Realtime client secret' }));
                return;
            }
            answer(res, 200, 'application/json; charset=utf-8', JSON.stringify({
                value: clientSecret,
                callsURL: `${settings.baseURL.replace(/\/$/u, '')}/realtime/calls`,
            }));
        },
    }), 'ui-a2a-assistant: OpenAI Realtime call route');
    ctx.effect(() => ctx.webServer.register({
        kind: 'exact',
        path: SECRETARY_TTS_PATH,
        handler: async (req, res) => {
            if (req.method !== 'POST') {
                answer(res, 405, 'application/json; charset=utf-8', JSON.stringify({ error: 'Method not allowed' }));
                return;
            }
            const text = readTtsText(await readBody(req));
            if (text === undefined) {
                answer(res, 400, 'application/json; charset=utf-8', JSON.stringify({ error: 'Text is required and must be at most 4000 characters' }));
                return;
            }
            const speechResponse = await createSecretarySpeech(ctx, text, current());
            const speechBody = new Uint8Array(await speechResponse.arrayBuffer());
            const contentType = speechResponse.headers.get('content-type') ?? 'audio/mpeg';
            answerBytes(res, speechResponse.status, contentType, speechBody);
        },
    }), 'ui-a2a-assistant: Secretary TTS route');
    ctx.effect(() => ctx.webServer.register({
        kind: 'exact',
        path: SECRETARY_ASR_PATH,
        handler: async (req, res) => {
            if (req.method !== 'POST') {
                answer(res, 405, 'application/json; charset=utf-8', JSON.stringify({ error: 'Method not allowed' }));
                return;
            }
            const audio = readAsrAudio(await readBody(req));
            if (audio === undefined || audio.byteLength === 0) {
                answer(res, 400, 'application/json; charset=utf-8', JSON.stringify({ error: 'Audio is required and must be at most 2MB' }));
                return;
            }
            const asrResponse = await createSecretaryAsr(audio, current(), readAliyunNlsToken);
            const body = await asrResponse.text();
            answer(res, asrResponse.status, asrResponse.headers.get('content-type') ?? 'application/json; charset=utf-8', body);
        },
    }), 'ui-a2a-assistant: Secretary Aliyun ASR route');
}
//# sourceMappingURL=index.js.map