/** Browser audio client for the assistant's speech output. */
/** One cancellable speech playback request. */
export declare class SpeechPlayer {
    private audio;
    private objectURL;
    private aborter;
    /** Request synthesized speech from the Harness host and play it.
     * @param text - Assistant text to read aloud.
     */
    speak(text: string): Promise<void>;
    /** Stop active network work and playback. */
    stop(): void;
    private release;
}
//# sourceMappingURL=speech-player.d.ts.map