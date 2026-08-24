# @deepseek-ai/dsh-client-ui-a2a-assistant

English | [中文](README.zh.md)

This repository packages the Voice Assistant DSH plugin as an out-of-tree DeepSeek Harness bundle. The GitHub repository name is `voice-assistant-dsh`; the first extracted package intentionally keeps the internal package name `@deepseek-ai/dsh-client-ui-a2a-assistant` so its prebuilt browser bundle can be installed by current Harness builds without a custom external build pipeline.

Install it into a local Harness web profile:

```sh
dsh plugin --profile web add github:weiee666/voice-assistant-dsh
dsh web --no-open
```

Update it after a GitHub push:

```sh
dsh plugin --profile web update @deepseek-ai/dsh-client-ui-a2a-assistant
dsh web --no-open
```

Restart the web profile after adding or updating the bundle. Vercel points at `apps/public-dashboard`; the deployment first hosts the public entry page and can later host the relay. Telegram polling, model credentials, local files, and Agent execution stay on the local Harness host.

This browser plugin adds a `WeChat Assistant (beta)` action immediately above Settings in the Harness sidebar. The action opens an application-level workspace over the center and details columns while leaving the Harness sidebar available. It is independent of the selected Session's Chat and Trajectory tabs; selecting another sidebar destination closes the workspace.

The workspace ports the original `wechat-Agent-helper` dashboard presentation: its stable DiceBear avatar seeds, role colors, grouped conversation list, participant stack, directional message bubbles, connection status, desktop split view, and mobile list-to-chat transition. The first roster is Me and Secretary, Teacher Agent, Claude, and ChatGPT. Peer Agent conversations remain an explicit empty group until the Host A2A directory supplies real pairs.

The current compatibility transport sends messages through the selected Harness Session. Secretary text is unchanged; Teacher and Claude add a visible role-routing prefix. This transport does not claim independent Agent identity, history, tools, or permissions. Presentation transcripts are stored under one browser-local workspace key while Harness events remain authoritative for model-visible content.

The Secretary header retains the compatibility speech call. Browser recognition text uses the ordinary Harness message path after the shared voice silence window; interim recognition state stays in the call strip, and only finalized user text enters the chat flow. Finalized assistant text is sent through the Harness Host to MiniMax text-to-speech while the call is active. The pause button only stops microphone capture; it does not request a reply. This is transcription plus text-to-speech, not a speech-to-speech model. MiniMax `speech-2.8-turbo` uses the domestic `https://api.minimaxi.com/v1` endpoint with the write-only `MINIMAX_API_KEY` credential.

ChatGPT uses a separate OpenAI Realtime WebRTC call. The Harness Host resolves `OPENAI_API_KEY` and mints a short-lived Realtime client secret; the browser uses that temporary credential to exchange its raw SDP offer directly with `/v1/realtime/calls`. The stored API key never reaches the browser. Microphone audio and model audio then travel over WebRTC. A mounted native audio element owns default playback of the remote media stream. The WebRTC stream is assigned directly to its `srcObject` and remains attached independently of React status renders; each remote playback-started event asks the element to play before updating the visible speaking state. A separate analyser observes the same stream without becoming its output path. Playback-started, playback-stopped, and playback-cleared events own the visible speaking state, while frame-by-frame audio levels animate the meter without changing the status label. Transcript events independently update subtitles and do not replace audio playback. Browser capture requests echo cancellation, noise suppression, and automatic gain control. Automatic response interruption is disabled, while microphone transmission remains controlled only by the user's pause action. Spoken barge-in remains deferred. During a call, incremental input transcripts grow in a user-side message bubble and incremental output transcripts grow in an Agent-side bubble; finalized transcripts remain as ordinary conversation messages. Server VAD retains 900 milliseconds before detected speech and waits for the shared voice silence window before ending the turn. The client then holds the response for a 500-millisecond merge window; resumed speech cancels the pending request, and an in-flight response blocks duplicate requests until `response.done`. These controls preserve longer thoughts and prevent adjacent speech fragments from producing two assistant replies. The call strip can pause microphone transmission without requesting a reply and resume listening without closing the connection. The header Hang up action alone ends the call. Typed messages sent during the call use the same Realtime conversation. The configurable defaults are `gpt-realtime-2.1`, the `marin` voice, `gpt-4o-mini-transcribe` for input transcripts, and a 2,800-millisecond shared voice silence window.

Settings includes a dedicated **WeChat Assistant** page. Its write-only API-key fields report only configured state and write through the Harness credentials domain; they never read stored literals. The same page edits the Realtime model, voice, transcription model, system instructions, shared voice silence window, and MiniMax speech options. These settings are live and apply to the next call or speech request without restarting Harness.

The same settings page includes public-dashboard and channel bridge settings. `publicDashboardUrl` points at the Vercel deployment that hosts the remote WeChat Assistant page. When a Telegram user sends `看板`, `dashboard`, or `/dashboard`, the Secretary replies with this URL; if it is empty, the bot asks the user to configure the public dashboard URL first. `bridgeDeviceName` and `bridgePollIntervalMs` identify the local Harness bridge. `telegramBotTokenEnv` is a write-only credential reference for Telegram Bot API polling, and `telegramAllowedUserIds` limits which Telegram accounts may reach the Secretary.

The Telegram Secretary bridge now runs on the Host side. Local Harness actively polls the Telegram Bot API, so Telegram does not need public access to local port 3080. Ordinary Telegram text enters the Secretary conversation and appears in the dashboard; the dashboard submits that message to the selected Harness Session, then sends the Harness assistant reply back to the same Telegram chat. This MVP still reuses the currently selected Session. A dedicated per-user Secretary Session and a public relay queue remain deferred.

The root `vercel.json` builds `apps/public-dashboard` and serves `apps/public-dashboard/dist`. Vercel cannot directly expose `127.0.0.1:3080` from your laptop as a public service; it can host the public frontend or relay. Remote-page control of local files still requires the local DSH process to stay online and actively poll a relay or Telegram.

## Model Experience

### Compatibility routing

#### What the model sees

Secretary messages are unchanged. Teacher and Claude messages begin with a short `[A2A channel: ...]` instruction followed by the user's text.

#### Token effect

Secretary adds no tokens. Teacher and Claude add one fixed routing prefix per submitted message.

#### KV Cache effect

The prefix is appended with the new user message and does not modify earlier request content.

## Known Limitations and Deferred Work

- **Named conversations still share the selected Session** — independent Harness Sessions and the Host assistant directory remain deferred.
- **The A2A group is intentionally empty** — no sample pairs pretend that the iLink/A2A backend has been migrated.
- **Secretary voice depends on browser and MiniMax availability** — recognition quality varies by browser, and playback requires a configured MiniMax API key.
- **ChatGPT Live requires OpenAI API billing** — a ChatGPT Web subscription is not an API credential; configure `OPENAI_API_KEY` in Harness Settings or its credential sources.
- **Realtime text requires an active call** — the first integration keeps typed and spoken ChatGPT turns in one WebRTC session rather than creating a second REST conversation.
- **Realtime history is currently browser-local** — transcripts are not yet projected into Harness Session events and clearing site data removes them.
- **Browser transcript state is disposable** — clearing site data removes the workspace grouping but does not remove Harness logs.
- **The public relay is not implemented yet** — the Vercel entry page has deployment configuration, and Telegram polling now runs in the local Host; the remote-page-to-local relay queue remains deferred.
