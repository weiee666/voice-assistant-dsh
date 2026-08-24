/** Host transport for the WeChat Assistant's voice services. */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { type AssistantSettings } from './settings-contract.ts';
/** Stable Cordis plugin name. */
export declare const name = "client-ui-a2a-assistant";
/** Host services needed to create a secret-backed Realtime call. */
export declare const inject: string[];
interface AliyunNlsToken {
    readonly id: string;
    readonly expireTime: number;
}
/** Voice service settings owned by the assistant deployment. */
export interface Config extends AssistantSettings {
}
export declare const Config: z<Config>;
/** Mint a short-lived OpenAI Realtime client secret.
 * @param apiKey - server-resolved OpenAI API key.
 * @param config - validated Realtime settings.
 * @param fetcher - HTTP implementation, replaceable by focused tests.
 * @returns the upstream client-secret response.
 */
export declare function createRealtimeClientSecret(apiKey: string, config: Config, fetcher?: typeof fetch): Promise<Response>;
/** Request speech audio from MiniMax's T2A endpoint.
 * @param apiKey - server-resolved MiniMax API key.
 * @param text - Text to synthesize.
 * @param config - validated MiniMax settings.
 * @param fetcher - HTTP implementation, replaceable by focused tests.
 * @returns an audio response decoded from the upstream hex payload.
 */
export declare function createMiniMaxSpeech(apiKey: string, text: string, config: Config, fetcher?: typeof fetch): Promise<Response>;
/** Request a short-sentence transcript from Aliyun Intelligent Speech Interaction.
 * @param token - server-resolved Aliyun NLS token.
 * @param audio - PCM audio bytes captured by the browser.
 * @param config - validated Aliyun ASR settings.
 * @param fetcher - HTTP implementation, replaceable by focused tests.
 * @returns the Aliyun ASR response.
 */
export declare function createAliyunAsrTranscript(token: string, audio: Uint8Array, config: Config, fetcher?: typeof fetch): Promise<Response>;
/** Create an Aliyun NLS token with POP OpenAPI signing.
 * @param accessKeyId - Aliyun AccessKey ID.
 * @param accessKeySecret - Aliyun AccessKey Secret.
 * @param config - validated Aliyun token settings.
 * @param fetcher - HTTP implementation, replaceable by focused tests.
 * @returns the temporary NLS token and expiry.
 */
export declare function createAliyunNlsToken(accessKeyId: string, accessKeySecret: string, config: Config, fetcher?: typeof fetch): Promise<AliyunNlsToken>;
/** Register the voice service routes.
 * @param ctx - host context carrying credentials and the Web route registry.
 * @param config - validated voice settings.
 */
export declare function apply(ctx: Context, config: Config): void;
export {};
//# sourceMappingURL=index.d.ts.map