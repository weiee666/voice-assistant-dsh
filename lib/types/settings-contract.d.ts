/** Settings values shared by the WeChat Assistant Host and browser faces. */
/** Durable settings namespace owned by the WeChat Assistant. */
export declare const A2A_ASSISTANT_SETTINGS_NAMESPACE = "ui-a2a-assistant";
/** Assistant voice settings visible to the browser settings page. */
export interface AssistantSettings {
    /** Credential reference resolved for every new call. */
    apiKeyEnv: string;
    /** OpenAI-compatible API root without a trailing slash. */
    baseURL: string;
    /** Realtime speech-to-speech model id. */
    model: string;
    /** Output voice id supported by the selected Realtime model. */
    voice: string;
    /** Input transcription model used to project the user's speech into chat. */
    transcriptionModel: string;
    /** System instructions applied to each ChatGPT call. */
    instructions: string;
    /** Silence window shared by ChatGPT Realtime VAD and Secretary browser speech. */
    voiceSilenceMs: number;
    /** Credential reference resolved for MiniMax TTS requests. */
    minimaxApiKeyEnv: string;
    /** MiniMax API root without a trailing slash. */
    minimaxBaseURL: string;
    /** MiniMax TTS model id. */
    minimaxModel: string;
    /** MiniMax voice id. */
    minimaxVoice: string;
    /** MiniMax audio response format. */
    minimaxFormat: string;
    /** Credential reference resolved for Aliyun short-sentence ASR requests. */
    aliyunNlsTokenEnv: string;
    /** Aliyun Intelligent Speech Interaction project AppKey. */
    aliyunNlsAppKey: string;
    /** Aliyun short-sentence ASR endpoint. */
    aliyunAsrURL: string;
    /** Audio format sent to Aliyun ASR. */
    aliyunAsrFormat: string;
    /** Audio sample rate sent to Aliyun ASR. */
    aliyunAsrSampleRate: number;
    /** Public dashboard origin used by Telegram Mini Apps and remote browsers. */
    publicDashboardUrl: string;
    /** Local device label shown when the Harness bridge checks in. */
    bridgeDeviceName: string;
    /** Interval used by the local bridge when polling the public relay. */
    bridgePollIntervalMs: number;
    /** Credential reference resolved for Telegram Bot API polling. */
    telegramBotTokenEnv: string;
    /** Comma-separated Telegram user ids allowed to reach the Secretary. */
    telegramAllowedUserIds: string;
}
//# sourceMappingURL=settings-contract.d.ts.map