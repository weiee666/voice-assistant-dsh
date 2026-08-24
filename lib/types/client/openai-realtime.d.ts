/** Browser WebRTC client for the assistant's OpenAI Realtime conversation. */
/** Observable Realtime call state. */
export type RealtimeCallState = 'idle' | 'connecting' | 'connected';
/** UI callbacks emitted by one Realtime call. */
export interface OpenAIRealtimeCallbacks {
    /** Receive an incremental user speech transcript. */
    readonly onUserTranscriptDelta: (text: string) => void;
    /** Receive a completed user speech transcript. */
    readonly onUserTranscript: (text: string) => void;
    /** Receive an incremental model audio transcript. */
    readonly onAssistantTranscriptDelta: (text: string) => void;
    /** Receive a completed model audio transcript. */
    readonly onAssistantTranscript: (text: string) => void;
    /** Observe whether turn detection currently hears the user speaking. */
    readonly onUserSpeechState: (active: boolean) => void;
    /** Receive a user-safe connection or model error. */
    readonly onError: (message: string) => void;
    /** Observe call lifecycle changes. */
    readonly onState: (state: RealtimeCallState) => void;
    /** Drive the visible voice meter from local or remote audio. */
    readonly onAudioLevel: (level: number, speaker: 'user' | 'assistant') => void;
    /** Attach or clear the remote WebRTC media stream used for native playback. */
    readonly onRemoteStream: (stream: MediaStream | null) => void;
    /** Ensure native playback is active when the remote output buffer starts. */
    readonly onRemoteAudioStart: () => void;
    /** Observe that the remote output buffer has drained or been cleared. */
    readonly onRemoteAudioStop: () => void;
}
/** One browser-to-OpenAI speech-to-speech session. */
export declare class OpenAIRealtimeCall {
    private readonly callbacks;
    private peer;
    private channel;
    private input;
    private audioContext;
    private inputSource;
    private outputSource;
    private inputAnalyser;
    private outputAnalyser;
    private meterFrame;
    private smoothedLevel;
    private responseInFlight;
    private responseTimer;
    private muted;
    constructor(callbacks: OpenAIRealtimeCallbacks);
    /** Establish the microphone and WebRTC session through the Harness host. */
    start(): Promise<void>;
    /** Add one typed user turn to the active Realtime conversation.
     * @param text - final user text.
     */
    sendText(text: string): void;
    /** Pause or resume microphone transmission without ending the call.
     * @param muted - whether local audio tracks should stop transmitting.
     */
    setMuted(muted: boolean): void;
    /** Close media, data, and peer resources. */
    stop(): void;
    private createMeter;
    private startMeter;
    private receive;
    private scheduleVoiceResponse;
    private clearResponseTimer;
    private syncInputTracks;
}
//# sourceMappingURL=openai-realtime.d.ts.map