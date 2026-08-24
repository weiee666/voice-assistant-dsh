import z from "@deepseek-ai/schemastery";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
//#region lib/types/settings-contract.js
/** Settings values shared by the WeChat Assistant Host and browser faces. */
/** Durable settings namespace owned by the WeChat Assistant. */
const A2A_ASSISTANT_SETTINGS_NAMESPACE = "ui-a2a-assistant";
//#endregion
//#region lib/types/index.js
/** Host transport for the WeChat Assistant's voice services. */
/** Stable Cordis plugin name. */
const name = "client-ui-a2a-assistant";
/** Host services needed to create a secret-backed Realtime call. */
const inject = ["credentials", "webServer"];
const REALTIME_PATH = "/api/wechat-assistant/openai/realtime";
const SECRETARY_TTS_PATH = "/api/wechat-assistant/tts";
const MAX_TTS_TEXT_LENGTH = 4e3;
const Config = z.object({
	apiKeyEnv: z.string().role("credential-ref").default("OPENAI_API_KEY"),
	baseURL: z.string().default("https://api.openai.com/v1"),
	model: z.string().default("gpt-realtime-2.1"),
	voice: z.string().default("marin"),
	transcriptionModel: z.string().default("gpt-4o-mini-transcribe"),
	instructions: z.string().default("You are a concise, warm personal assistant. Speak naturally and support Mandarin-English code-switching."),
	voiceSilenceMs: z.natural().min(250).default(2800),
	minimaxApiKeyEnv: z.string().role("credential-ref").default("MINIMAX_API_KEY"),
	minimaxBaseURL: z.string().default("https://api.minimaxi.com/v1"),
	minimaxModel: z.string().default("speech-2.8-turbo"),
	minimaxVoice: z.string().default("male-qn-qingse"),
	minimaxFormat: z.string().default("mp3"),
	publicDashboardUrl: z.string().default(""),
	bridgeDeviceName: z.string().default("local-harness"),
	bridgePollIntervalMs: z.natural().min(500).default(1500),
	telegramBotTokenEnv: z.string().role("credential-ref").default("TELEGRAM_BOT_TOKEN"),
	telegramAllowedUserIds: z.string().default("")
});
function realtimeSession(config) {
	return {
		type: "realtime",
		model: config.model,
		output_modalities: ["audio"],
		instructions: config.instructions,
		audio: {
			input: {
				transcription: { model: config.transcriptionModel },
				turn_detection: {
					type: "server_vad",
					threshold: .32,
					prefix_padding_ms: 900,
					silence_duration_ms: config.voiceSilenceMs,
					create_response: false,
					interrupt_response: false
				}
			},
			output: { voice: config.voice }
		}
	};
}
/** Mint a short-lived OpenAI Realtime client secret.
* @param apiKey - server-resolved OpenAI API key.
* @param config - validated Realtime settings.
* @param fetcher - HTTP implementation, replaceable by focused tests.
* @returns the upstream client-secret response.
*/
async function createRealtimeClientSecret(apiKey, config, fetcher = fetch) {
	return fetcher(`${config.baseURL.replace(/\/$/u, "")}/realtime/client_secrets`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${apiKey}`,
			"content-type": "application/json"
		},
		body: JSON.stringify({ session: realtimeSession(config) })
	});
}
/** Request speech audio from MiniMax's T2A endpoint.
* @param apiKey - server-resolved MiniMax API key.
* @param text - Text to synthesize.
* @param config - validated MiniMax settings.
* @param fetcher - HTTP implementation, replaceable by focused tests.
* @returns an audio response decoded from the upstream hex payload.
*/
async function createMiniMaxSpeech(apiKey, text, config, fetcher = fetch) {
	const response = await fetcher(`${config.minimaxBaseURL.replace(/\/$/u, "")}/t2a_v2`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${apiKey}`,
			"content-type": "application/json"
		},
		body: JSON.stringify({
			model: config.minimaxModel,
			text,
			stream: false,
			language_boost: "auto",
			output_format: "hex",
			voice_setting: {
				voice_id: config.minimaxVoice,
				speed: 1,
				vol: 1,
				pitch: 0
			},
			audio_setting: {
				sample_rate: 32e3,
				bitrate: 128e3,
				format: config.minimaxFormat,
				channel: 1
			}
		})
	});
	const body = await response.text();
	if (!response.ok) return new Response(body, {
		status: response.status,
		headers: { "content-type": response.headers.get("content-type") ?? "application/json; charset=utf-8" }
	});
	const audio = readMiniMaxAudio(body);
	if (audio === void 0) return new Response(JSON.stringify({ error: "MiniMax returned an invalid TTS response" }), {
		status: 502,
		headers: { "content-type": "application/json; charset=utf-8" }
	});
	const audioBody = new ArrayBuffer(audio.byteLength);
	new Uint8Array(audioBody).set(audio);
	return new Response(audioBody, {
		status: 200,
		headers: { "content-type": contentTypeForAudioFormat(config.minimaxFormat) }
	});
}
function readClientSecret(body) {
	try {
		const parsed = JSON.parse(body);
		return typeof parsed.value === "string" && parsed.value !== "" ? parsed.value : void 0;
	} catch {
		return;
	}
}
function readMiniMaxAudio(body) {
	try {
		const parsed = JSON.parse(body);
		const statusCode = parsed.base_resp?.status_code;
		if (statusCode !== void 0 && statusCode !== 0) return void 0;
		return typeof parsed.data?.audio === "string" ? hexToBytes(parsed.data.audio) : void 0;
	} catch {
		return;
	}
}
function hexToBytes(hex) {
	if (hex.length % 2 !== 0 || !/^[\da-f]*$/iu.test(hex)) return void 0;
	const bytes = new Uint8Array(hex.length / 2);
	for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
	return bytes;
}
function contentTypeForAudioFormat(format) {
	switch (format) {
		case "mp3": return "audio/mpeg";
		case "wav": return "audio/wav";
		case "flac": return "audio/flac";
		case "pcm": return "audio/L16";
		default: return "application/octet-stream";
	}
}
function answer(res, status, contentType, body) {
	res.writeHead(status, {
		"content-type": contentType,
		"cache-control": "no-store"
	});
	res.end(body);
}
function answerBytes(res, status, contentType, body) {
	res.writeHead(status, {
		"content-type": contentType,
		"cache-control": "no-store"
	});
	res.end(body);
}
async function readBody(req) {
	const chunks = [];
	for await (const chunk of req) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
	return Buffer.concat(chunks).toString("utf8");
}
function readTtsText(body) {
	try {
		const parsed = JSON.parse(body);
		if (typeof parsed.text !== "string") return void 0;
		const text = parsed.text.trim();
		return text === "" || text.length > MAX_TTS_TEXT_LENGTH ? void 0 : text;
	} catch {
		return;
	}
}
async function createSecretarySpeech(ctx, text, config) {
	const credential = await ctx.credentials.resolve(credentialRef(config.minimaxApiKeyEnv));
	if (credential === void 0) return new Response(JSON.stringify({ error: `${config.minimaxApiKeyEnv} is not configured` }), {
		status: 503,
		headers: { "content-type": "application/json; charset=utf-8" }
	});
	return createMiniMaxSpeech(credential.value, text, config);
}
/** Register the voice service routes.
* @param ctx - host context carrying credentials and the Web route registry.
* @param config - validated voice settings.
*/
function apply(ctx, config) {
	let current = () => config;
	installSettingsSection(ctx, settingsNamespace(A2A_ASSISTANT_SETTINGS_NAMESPACE), Config, config, {
		setSource: (source) => {
			current = source;
		},
		onChange: () => {}
	});
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: REALTIME_PATH,
		handler: async (req, res) => {
			if (req.method !== "POST") {
				answer(res, 405, "application/json; charset=utf-8", JSON.stringify({ error: "Method not allowed" }));
				return;
			}
			const settings = current();
			const credential = await ctx.credentials.resolve(credentialRef(settings.apiKeyEnv));
			if (credential === void 0) {
				answer(res, 503, "application/json; charset=utf-8", JSON.stringify({ error: `${settings.apiKeyEnv} is not configured` }));
				return;
			}
			const secretResponse = await createRealtimeClientSecret(credential.value, settings);
			const secretBody = await secretResponse.text();
			if (!secretResponse.ok) {
				answer(res, secretResponse.status, secretResponse.headers.get("content-type") ?? "application/json; charset=utf-8", secretBody);
				return;
			}
			const clientSecret = readClientSecret(secretBody);
			if (clientSecret === void 0) {
				answer(res, 502, "application/json; charset=utf-8", JSON.stringify({ error: "OpenAI returned an invalid Realtime client secret" }));
				return;
			}
			answer(res, 200, "application/json; charset=utf-8", JSON.stringify({
				value: clientSecret,
				callsURL: `${settings.baseURL.replace(/\/$/u, "")}/realtime/calls`
			}));
		}
	}), "ui-a2a-assistant: OpenAI Realtime call route");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: SECRETARY_TTS_PATH,
		handler: async (req, res) => {
			if (req.method !== "POST") {
				answer(res, 405, "application/json; charset=utf-8", JSON.stringify({ error: "Method not allowed" }));
				return;
			}
			const text = readTtsText(await readBody(req));
			if (text === void 0) {
				answer(res, 400, "application/json; charset=utf-8", JSON.stringify({ error: "Text is required and must be at most 4000 characters" }));
				return;
			}
			const speechResponse = await createSecretarySpeech(ctx, text, current());
			const speechBody = new Uint8Array(await speechResponse.arrayBuffer());
			const contentType = speechResponse.headers.get("content-type") ?? "audio/mpeg";
			answerBytes(res, speechResponse.status, contentType, speechBody);
		}
	}), "ui-a2a-assistant: Secretary TTS route");
}
//#endregion
export { Config, apply, createMiniMaxSpeech, createRealtimeClientSecret, inject, name };
