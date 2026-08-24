import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { IconChevronLeftOutline14, IconEllipsisOutline16, IconPlayOutline16, IconPauseOutline16, IconSendOutline16, IconStopFill16, } from '@deepseek-ai/dsh-client-ui-primitives';
import { Avatar } from "./avatars.js";
import { OpenAIRealtimeCall } from "./openai-realtime.js";
import { SpeechPlayer } from "./speech-player.js";
import css from './WechatAssistantWorkspace.module.css';
const DEFINITIONS = [
    { id: 'self', nameKey: 'conversation.self', subtitleKey: 'conversation.self.subtitle', role: 'bot' },
    { id: 'teacher', nameKey: 'conversation.teacher', subtitleKey: 'conversation.teacher.subtitle', role: 'teacher' },
    { id: 'claude', nameKey: 'conversation.claude', subtitleKey: 'conversation.claude.subtitle', role: 'claude' },
    { id: 'chatgpt', nameKey: 'conversation.chatgpt', subtitleKey: 'conversation.chatgpt.subtitle', role: 'chatgpt' },
];
const EMPTY_MESSAGES = { self: [], teacher: [], claude: [], chatgpt: [] };
const STORAGE_KEY = 'dsh.wechat-assistant.beta.minimax';
const LEGACY_STORAGE_KEYS = ['dsh.wechat-assistant.beta'];
const ASSISTANT_MESSAGES_PATH = '/api/wechat-assistant/messages';
const ASSISTANT_REPLIES_PATH = '/api/wechat-assistant/replies';
function loadMessages() {
    for (const key of LEGACY_STORAGE_KEYS)
        localStorage.removeItem(key);
    try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
        return {
            self: Array.isArray(value.self) ? value.self : [],
            teacher: Array.isArray(value.teacher) ? value.teacher : [],
            claude: Array.isArray(value.claude) ? value.claude : [],
            chatgpt: Array.isArray(value.chatgpt) ? value.chatgpt : [],
        };
    }
    catch {
        return EMPTY_MESSAGES;
    }
}
function assistantText(blocks) {
    return blocks.filter(block => block.kind === 'text').map(block => block.text ?? '').join('\n').trim();
}
function formatTime(value) {
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}
function definitionOf(definitions, id) {
    const definition = definitions.find(candidate => candidate.id === id);
    if (definition === undefined)
        throw new Error(`ui-a2a-assistant: missing conversation definition for ${id}`);
    return definition;
}
async function fetchHostMessages() {
    const response = await fetch(ASSISTANT_MESSAGES_PATH, { cache: 'no-store' });
    if (!response.ok)
        throw new Error(`Assistant bridge returned ${response.status}`);
    const body = await response.json();
    return Array.isArray(body.messages) ? body.messages : [];
}
async function postHostReply(messageId, text) {
    const response = await fetch(ASSISTANT_REPLIES_PATH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messageId, text }),
    });
    if (!response.ok)
        throw new Error(`Assistant bridge returned ${response.status}`);
}
/** Independent WeChat Assistant page, preserving the original dashboard layout. */
export function WechatAssistantWorkspace({ useSessions, workspace, settings, resolveSession, send, t }) {
    const open = useSyncExternalStore(workspace.subscribe, workspace.getSnapshot).open;
    const settingsSnapshot = useSyncExternalStore(listener => settings.subscribe(listener), () => settings.getSnapshot());
    const sessionId = useSessions(snapshot => snapshot.current);
    const session = resolveSession(sessionId);
    const subscribeSession = useCallback((listener) => session?.subscribe(listener) ?? (() => { }), [session]);
    const readSession = useCallback(() => session?.getSnapshot(), [session]);
    const snapshot = useSyncExternalStore(subscribeSession, readSession, readSession);
    const [sidebarWidth, setSidebarWidth] = useState(0);
    const [conversation, setConversation] = useState('self');
    const [messages, setMessages] = useState(loadMessages);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [calling, setCalling] = useState(false);
    const [callState, setCallState] = useState('idle');
    const [audioLevel, setAudioLevel] = useState(0);
    const [voiceSpeaker, setVoiceSpeaker] = useState('user');
    const [liveUserText, setLiveUserText] = useState('');
    const [liveAssistantText, setLiveAssistantText] = useState('');
    const [liveUserActive, setLiveUserActive] = useState(false);
    const [callPaused, setCallPaused] = useState(false);
    const [voiceError, setVoiceError] = useState(null);
    const [mobileChat, setMobileChat] = useState(false);
    const rootRef = useRef(null);
    const endRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const recognition = useRef(null);
    const recognitionPaused = useRef(false);
    const realtimeCall = useRef(null);
    const speechPlayer = useRef(null);
    const speechSeq = useRef(0);
    const voiceSubmitTimer = useRef(undefined);
    const pendingVoiceText = useRef('');
    const voiceSilenceMs = useRef(settingsSnapshot.value?.voiceSilenceMs ?? 2800);
    const lastVoiceSubmission = useRef();
    const pendingConversation = useRef(null);
    const pendingHostReplyId = useRef(null);
    const displayedHostMessageIds = useRef(new Set());
    const processingHostMessageIds = useRef(new Set());
    const seenAssistantSeq = useRef(0);
    const busy = useRef(false);
    const definitions = useMemo(() => DEFINITIONS.map(definition => ({
        ...definition,
        name: t(definition.nameKey),
        subtitle: t(definition.subtitleKey),
    })), [t]);
    const active = definitionOf(definitions, conversation);
    const selfDefinition = definitionOf(definitions, 'self');
    const callStatus = callPaused
        ? t('call.paused')
        : callState === 'connecting'
            ? t('call.connecting')
            : voiceSpeaker === 'assistant'
                ? t(conversation === 'chatgpt' ? 'call.chatgptSpeaking' : 'call.secretarySpeaking')
                : liveUserActive || liveUserText !== ''
                    ? t('call.transcribing')
                    : t('call.listening');
    const callHint = callPaused ? t('call.pausedHint') : t('call.liveHint');
    useLayoutEffect(() => {
        if (!open)
            return;
        const layer = rootRef.current?.closest('[data-shell-overlay]');
        const frame = layer?.parentElement;
        const sidebar = frame?.firstElementChild;
        if (!(frame instanceof HTMLElement) || !(sidebar instanceof HTMLElement))
            return;
        const coveredSurfaces = Array.from(frame.children).slice(1).filter((child) => child instanceof HTMLElement && child !== layer);
        const previousInert = coveredSurfaces.map(surface => surface.inert);
        const previousAriaHidden = coveredSurfaces.map(surface => surface.getAttribute('aria-hidden'));
        for (const surface of coveredSurfaces) {
            surface.inert = true;
            surface.setAttribute('aria-hidden', 'true');
        }
        const update = () => { setSidebarWidth(sidebar.getBoundingClientRect().width); };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(sidebar);
        return () => {
            observer.disconnect();
            coveredSurfaces.forEach((surface, index) => {
                surface.inert = previousInert[index] ?? false;
                const ariaHidden = previousAriaHidden[index];
                if (ariaHidden === null || ariaHidden === undefined)
                    surface.removeAttribute('aria-hidden');
                else
                    surface.setAttribute('aria-hidden', ariaHidden);
            });
        };
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const closeFromSidebar = (event) => {
            const root = rootRef.current;
            if (root === null || !(event.target instanceof Node))
                return;
            if (!root.contains(event.target) && event.clientX < sidebarWidth)
                workspace.setOpen(false);
        };
        document.addEventListener('pointerdown', closeFromSidebar, true);
        return () => { document.removeEventListener('pointerdown', closeFromSidebar, true); };
    }, [open, sidebarWidth, workspace]);
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }, [messages]);
    useEffect(() => {
        voiceSilenceMs.current = settingsSnapshot.value?.voiceSilenceMs ?? voiceSilenceMs.current;
    }, [settingsSnapshot]);
    useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'end' });
    }, [conversation, liveAssistantText, liveUserActive, liveUserText, messages, sending]);
    useEffect(() => {
        const nodes = snapshot?.nodes ?? [];
        let latest;
        for (let index = nodes.length - 1; index >= 0; index -= 1) {
            if (nodes[index]?.kind === 'assistant') {
                latest = nodes[index];
                break;
            }
        }
        if (latest?.kind !== 'assistant' || latest.seq <= seenAssistantSeq.current)
            return;
        seenAssistantSeq.current = latest.seq;
        const target = pendingConversation.current;
        if (target === null)
            return;
        const text = assistantText(latest.blocks);
        if (text === '')
            return;
        setMessages(current => ({
            ...current,
            [target]: [...current[target], { id: `assistant-${latest.seq}`, role: 'assistant', text, time: latest.time }],
        }));
        pendingConversation.current = null;
        const hostReplyId = pendingHostReplyId.current;
        pendingHostReplyId.current = null;
        busy.current = false;
        setSending(false);
        if (hostReplyId !== null) {
            void postHostReply(hostReplyId, text).catch((failure) => {
                setError(failure instanceof Error ? failure.message : String(failure));
            });
        }
        if (calling && target === 'self') {
            const player = speechPlayer.current ?? new SpeechPlayer();
            speechPlayer.current = player;
            const seq = speechSeq.current + 1;
            speechSeq.current = seq;
            setVoiceSpeaker('assistant');
            void player.speak(text)
                .catch((failure) => { setVoiceError(failure instanceof Error ? failure.message : String(failure)); })
                .finally(() => { if (speechSeq.current === seq)
                setVoiceSpeaker('user'); });
        }
    }, [calling, snapshot]);
    useEffect(() => {
        if (!open)
            return;
        let disposed = false;
        const sync = async () => {
            const hostMessages = await fetchHostMessages();
            if (disposed)
                return;
            const freshMessages = hostMessages.filter(message => message.source === 'telegram' && !displayedHostMessageIds.current.has(message.id));
            if (freshMessages.length > 0) {
                for (const message of freshMessages)
                    displayedHostMessageIds.current.add(message.id);
                setMessages(current => {
                    const next = { ...current };
                    for (const message of freshMessages) {
                        next[message.conversation] = [
                            ...next[message.conversation],
                            { id: `bridge-${message.id}`, role: message.role, text: message.text, time: message.time },
                        ];
                    }
                    return next;
                });
            }
            if (sessionId === undefined || busy.current || snapshot?.running === true)
                return;
            const pending = hostMessages.find(message => (message.source === 'telegram'
                && message.conversation === 'self'
                && message.role === 'user'
                && message.status === 'pending'
                && !processingHostMessageIds.current.has(message.id)));
            if (pending === undefined)
                return;
            processingHostMessageIds.current.add(pending.id);
            setError(null);
            setSending(true);
            busy.current = true;
            pendingConversation.current = 'self';
            pendingHostReplyId.current = pending.id;
            const failure = await send(sessionId, 'self', pending.text);
            if (failure !== null) {
                pendingConversation.current = null;
                pendingHostReplyId.current = null;
                busy.current = false;
                setSending(false);
                setError(failure);
                processingHostMessageIds.current.delete(pending.id);
            }
        };
        const interval = window.setInterval(() => {
            void sync().catch((failure) => {
                if (!disposed)
                    setError(failure instanceof Error ? failure.message : String(failure));
            });
        }, settingsSnapshot.value?.bridgePollIntervalMs ?? 1500);
        void sync().catch((failure) => {
            if (!disposed)
                setError(failure instanceof Error ? failure.message : String(failure));
        });
        return () => {
            disposed = true;
            window.clearInterval(interval);
        };
    }, [open, send, sessionId, settingsSnapshot.value?.bridgePollIntervalMs, snapshot?.running]);
    useEffect(() => () => {
        recognition.current?.stop();
        realtimeCall.current?.stop();
        speechPlayer.current?.stop();
    }, []);
    function clearPendingVoiceSubmit() {
        if (voiceSubmitTimer.current !== undefined)
            window.clearTimeout(voiceSubmitTimer.current);
        voiceSubmitTimer.current = undefined;
        pendingVoiceText.current = '';
    }
    function playRemoteAudio() {
        const audio = remoteAudioRef.current;
        if (audio === null || audio.srcObject === null)
            return;
        audio.muted = false;
        audio.volume = 1;
        void audio.play().catch(() => { setVoiceError(t('call.playback')); });
    }
    function bindRemoteAudio(stream) {
        const audio = remoteAudioRef.current;
        if (audio === null)
            return;
        if (stream === null) {
            audio.pause();
            audio.srcObject = null;
            return;
        }
        audio.muted = false;
        audio.volume = 1;
        audio.srcObject = stream;
        playRemoteAudio();
    }
    function submitVoiceTranscript(raw) {
        const text = raw.trim();
        clearPendingVoiceSubmit();
        setLiveUserText('');
        setLiveUserActive(false);
        if (text === '')
            return;
        const normalized = text.replace(/\s+/gu, ' ');
        const now = Date.now();
        const previous = lastVoiceSubmission.current;
        if (previous !== undefined && previous.text === normalized && now - previous.time < 3_000)
            return;
        lastVoiceSubmission.current = { text: normalized, time: now };
        void submit(text);
    }
    function scheduleVoiceSubmit(raw) {
        const text = raw.trim();
        if (text === '')
            return;
        pendingVoiceText.current = text;
        if (voiceSubmitTimer.current !== undefined)
            window.clearTimeout(voiceSubmitTimer.current);
        voiceSubmitTimer.current = window.setTimeout(() => {
            submitVoiceTranscript(pendingVoiceText.current);
        }, voiceSilenceMs.current);
    }
    async function submit(raw) {
        const text = raw.trim();
        if (text === '')
            return;
        if (conversation === 'chatgpt') {
            const call = realtimeCall.current;
            if (call === null || callState !== 'connected') {
                setError(t('call.chatgptRequired'));
                return;
            }
            setDraft('');
            setError(null);
            setMessages(current => ({
                ...current,
                chatgpt: [...current.chatgpt, { id: `user-${Date.now()}`, role: 'user', text, time: Date.now() }],
            }));
            try {
                call.sendText(text);
            }
            catch (failure) {
                setError(failure instanceof Error ? failure.message : String(failure));
            }
            return;
        }
        if (busy.current || snapshot?.running === true)
            return;
        setDraft('');
        setError(null);
        setSending(true);
        busy.current = true;
        pendingConversation.current = conversation;
        setMessages(current => ({
            ...current,
            [conversation]: [...current[conversation], { id: `user-${Date.now()}`, role: 'user', text, time: Date.now() }],
        }));
        const failure = await send(sessionId, conversation, text);
        if (failure !== null) {
            pendingConversation.current = null;
            busy.current = false;
            setSending(false);
            setError(failure);
        }
    }
    const stopCall = () => {
        clearPendingVoiceSubmit();
        recognition.current?.stop();
        recognition.current = null;
        speechSeq.current += 1;
        speechPlayer.current?.stop();
        realtimeCall.current?.stop();
        realtimeCall.current = null;
        setCallState('idle');
        setAudioLevel(0);
        setVoiceSpeaker('user');
        setLiveUserText('');
        setLiveAssistantText('');
        setLiveUserActive(false);
        bindRemoteAudio(null);
        recognitionPaused.current = false;
        setCallPaused(false);
        setCalling(false);
    };
    const startBrowserCall = () => {
        const voiceWindow = window;
        const Constructor = voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition;
        if (Constructor === undefined) {
            setVoiceError(t('call.unsupported'));
            return;
        }
        setVoiceError(null);
        bindRemoteAudio(null);
        const engine = new Constructor();
        clearPendingVoiceSubmit();
        lastVoiceSubmission.current = undefined;
        engine.continuous = true;
        engine.interimResults = true;
        engine.lang = navigator.language.startsWith('zh') ? 'zh-CN' : navigator.language;
        engine.onresult = (event) => {
            if (recognitionPaused.current)
                return;
            let interim = '';
            let final = '';
            for (let index = event.resultIndex; index < event.results.length; index += 1) {
                const result = event.results[index];
                if (result?.isFinal === true) {
                    final += result[0].transcript;
                }
                else if (result !== undefined) {
                    interim += result[0].transcript;
                }
            }
            if (final !== '') {
                submitVoiceTranscript(final);
                return;
            }
            if (interim !== '') {
                setLiveUserText(interim);
                setLiveUserActive(true);
                scheduleVoiceSubmit(interim);
            }
        };
        engine.onerror = () => { setVoiceError(t('call.permission')); stopCall(); };
        engine.onend = () => {
            if (recognition.current === engine && !recognitionPaused.current) {
                try {
                    engine.start();
                }
                catch {
                    stopCall();
                }
            }
        };
        recognition.current = engine;
        recognitionPaused.current = false;
        setCallPaused(false);
        setCallState('connected');
        setCalling(true);
        try {
            engine.start();
        }
        catch {
            setVoiceError(t('call.permission'));
            stopCall();
        }
    };
    const startRealtimeCall = async () => {
        setVoiceError(null);
        recognitionPaused.current = false;
        setCallPaused(false);
        const call = new OpenAIRealtimeCall({
            onUserTranscriptDelta: (text) => {
                setLiveUserText(current => current + text);
            },
            onUserTranscript: (text) => {
                const transcript = text.trim();
                setLiveUserText('');
                setLiveUserActive(false);
                if (transcript === '')
                    return;
                setMessages(current => ({
                    ...current,
                    chatgpt: [...current.chatgpt, { id: `user-voice-${Date.now()}`, role: 'user', text: transcript, time: Date.now() }],
                }));
            },
            onAssistantTranscriptDelta: (text) => {
                const audio = remoteAudioRef.current;
                if (audio !== null && audio.paused) {
                    void audio.play().catch(() => { setVoiceError(t('call.playback')); });
                }
                setLiveAssistantText(current => current + text);
            },
            onAssistantTranscript: (text) => {
                const transcript = text.trim();
                setLiveAssistantText('');
                if (transcript === '')
                    return;
                setMessages(current => ({
                    ...current,
                    chatgpt: [...current.chatgpt, { id: `assistant-live-${Date.now()}`, role: 'assistant', text: transcript, time: Date.now() }],
                }));
            },
            onUserSpeechState: (active) => { setLiveUserActive(active); },
            onError: (message) => { setVoiceError(message); },
            onState: (state) => {
                setCallState(state);
                if (state !== 'idle')
                    setCalling(true);
            },
            onAudioLevel: (level) => { setAudioLevel(level); },
            onRemoteStream: bindRemoteAudio,
            onRemoteAudioStart: () => {
                playRemoteAudio();
                setVoiceSpeaker('assistant');
            },
            onRemoteAudioStop: () => { setVoiceSpeaker('user'); },
        });
        realtimeCall.current = call;
        try {
            await call.start();
        }
        catch (failure) {
            setVoiceError(failure instanceof Error ? failure.message : String(failure));
            realtimeCall.current = null;
        }
    };
    const startCall = () => {
        if (conversation === 'chatgpt')
            void startRealtimeCall();
        else
            startBrowserCall();
    };
    const togglePause = () => {
        const next = !recognitionPaused.current;
        recognitionPaused.current = next;
        setCallPaused(next);
        if (next) {
            setAudioLevel(0);
            clearPendingVoiceSubmit();
            setLiveUserText('');
            setLiveUserActive(false);
        }
        if (conversation === 'chatgpt') {
            realtimeCall.current?.setMuted(next);
            return;
        }
        const engine = recognition.current;
        if (engine === null)
            return;
        try {
            if (next)
                engine.stop();
            else
                engine.start();
        }
        catch {
            setVoiceError(t('call.permission'));
        }
    };
    const selectConversation = (id) => {
        if (conversation !== id)
            stopCall();
        setConversation(id);
        setMobileChat(true);
        setError(null);
    };
    if (!open)
        return null;
    const activeMessages = messages[conversation];
    return (_jsxs("div", { ref: rootRef, className: css.workspace, style: { left: sidebarWidth }, children: [_jsxs("aside", { className: `${css.conversationSidebar}${mobileChat ? ` ${css.mobileHidden}` : ''}`, children: [_jsxs("header", { className: css.sidebarHeader, children: [_jsx("strong", { children: t('workspace.title') }), _jsxs("span", { children: [_jsx("i", { className: session === undefined ? css.offlineDot : css.onlineDot }), session === undefined ? t('status.offline') : t('status.connected')] })] }), _jsx("div", { className: css.groupLabel, children: t('group.mine') }), _jsx(ConversationButton, { definition: selfDefinition, messages: messages.self, active: conversation === 'self', onSelect: () => { selectConversation('self'); } }), _jsx("div", { className: css.groupLabel, children: t('group.system') }), definitions.slice(1).map(definition => (_jsx(ConversationButton, { definition: definition, messages: messages[definition.id], active: conversation === definition.id, onSelect: () => { selectConversation(definition.id); } }, definition.id))), _jsx("div", { className: css.groupLabel, children: t('group.pairs') }), _jsx("div", { className: css.pairEmpty, children: t('group.pairs.empty') }), _jsxs("footer", { className: css.connection, children: [_jsx("i", { className: session === undefined ? css.offlineDot : css.onlineDot }), session === undefined ? t('status.noSession') : t('status.currentSession')] })] }), _jsxs("section", { className: `${css.chat}${mobileChat ? ` ${css.mobileChat}` : ''}`, children: [_jsxs("header", { className: css.chatHeader, children: [_jsxs("div", { className: css.chatIdentity, children: [_jsx("button", { type: "button", className: css.mobileBack, "aria-label": t('action.back'), onClick: () => { setMobileChat(false); }, children: _jsx(IconChevronLeftOutline14, {}) }), _jsxs("div", { children: [_jsx("strong", { children: active.name }), _jsx("span", { children: active.subtitle })] })] }), _jsxs("div", { className: css.headerActions, children: [_jsxs("div", { className: css.participants, children: [_jsx("span", { children: _jsx(Avatar, { role: "user", size: 30 }) }), _jsx("span", { children: _jsx(Avatar, { role: active.role, size: 30 }) })] }), (conversation === 'self' || conversation === 'chatgpt') && (_jsxs("button", { type: "button", className: calling ? css.callActive : css.call, "aria-label": calling ? t('call.stop') : t('call.start'), onClick: calling ? stopCall : startCall, children: [calling ? _jsx(IconStopFill16, {}) : _jsx(IconPlayOutline16, {}), _jsx("span", { children: calling ? t('call.stop') : t('call.start') })] })), _jsx("button", { type: "button", className: css.more, "aria-label": t('action.more'), children: _jsx(IconEllipsisOutline16, {}) })] })] }), calling && (_jsxs("div", { className: css.callStrip, children: [_jsx("i", { className: callState === 'connecting' ? css.connectingDot : css.onlineDot }), callStatus, _jsx("span", { children: callHint }), _jsxs("button", { type: "button", className: callPaused ? css.resumeListening : css.pauseListening, onClick: togglePause, "aria-label": callPaused ? t('call.resume') : t('call.pause'), title: callPaused ? t('call.resume') : t('call.pause'), children: [callPaused ? _jsx(IconPlayOutline16, {}) : _jsx(IconPauseOutline16, {}), _jsx("b", { children: callPaused ? t('call.resume') : t('call.pause') })] })] })), conversation === 'chatgpt' && _jsx("audio", { ref: remoteAudioRef, className: css.remoteAudio, autoPlay: true, playsInline: true }), _jsx("div", { className: css.messages, "aria-live": "polite", children: _jsxs("div", { className: css.messageFlow, children: [activeMessages.length === 0 && !calling && _jsx("div", { className: css.empty, children: t('message.empty') }), activeMessages.map(message => (_jsx(MessageRow, { message: message, agentRole: active.role, agentName: active.name, t: t }, message.id))), calling && conversation === 'chatgpt' && (liveUserActive || liveUserText !== '') && (_jsx(LiveVoiceRow, { mine: true, text: liveUserText, level: audioLevel, agentRole: active.role, agentName: active.name, t: t })), calling && conversation === 'chatgpt' && liveAssistantText !== '' && (_jsx(LiveVoiceRow, { mine: false, text: liveAssistantText, level: audioLevel, agentRole: active.role, agentName: active.name, t: t })), sending && _jsxs("div", { className: css.replying, children: [t('status.sending'), "..."] }), _jsx("div", { ref: endRef })] }) }), _jsxs("footer", { className: css.composer, children: [(error !== null || voiceError !== null) && _jsx("div", { className: css.error, role: "status", children: voiceError ?? `${t('status.failed')}: ${error}` }), _jsxs("div", { className: css.inputRow, children: [_jsx("textarea", { value: draft, rows: 1, placeholder: t('composer.placeholder'), onChange: (event) => { setDraft(event.target.value); }, onKeyDown: (event) => {
                                            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                                                event.preventDefault();
                                                void submit(draft);
                                            }
                                        } }), _jsx("button", { type: "button", "aria-label": t('composer.send'), disabled: draft.trim() === '' || sending || snapshot?.running === true, onClick: () => { void submit(draft); }, children: _jsx(IconSendOutline16, {}) })] }), _jsx("span", { className: css.sendHint, children: t('composer.hint') })] })] })] }));
}
function LiveVoiceRow({ mine, text, level, agentRole, agentName, t }) {
    const activeLevel = Math.max(0.08, level);
    return (_jsxs("article", { className: mine ? css.messageMine : css.messageAgent, "aria-live": "polite", children: [_jsx(Avatar, { role: mine ? 'user' : agentRole, size: 34 }), _jsxs("div", { className: css.bubbleWrap, children: [_jsx("span", { children: mine ? t('message.you') : agentName }), _jsx("p", { className: css.liveBubble, children: text !== '' ? text : (_jsx("span", { className: css.voiceBars, "aria-label": mine ? t('call.transcribing') : t('call.chatgptSpeaking'), children: [0.55, 0.9, 0.7, 1, 0.62].map((weight, index) => (_jsx("i", { style: { height: `${String(7 + activeLevel * weight * 17)}px` } }, String(index)))) })) })] })] }));
}
function ConversationButton({ definition, messages, active, onSelect }) {
    const last = messages.at(-1);
    return (_jsxs("button", { type: "button", className: active ? css.conversationActive : css.conversationRow, onClick: onSelect, children: [_jsx(Avatar, { role: definition.role, size: 36 }), _jsxs("span", { className: css.conversationCopy, children: [_jsx("strong", { children: definition.name }), _jsx("small", { children: last?.text ?? definition.subtitle })] }), last !== undefined && _jsx("time", { children: formatTime(last.time) })] }));
}
function MessageRow({ message, agentRole, agentName, t }) {
    if (message.role === 'system')
        return _jsx("div", { className: css.systemMessage, children: message.text });
    const mine = message.role === 'user';
    return (_jsxs("article", { className: mine ? css.messageMine : css.messageAgent, children: [_jsx(Avatar, { role: mine ? 'user' : agentRole, size: 34 }), _jsxs("div", { className: css.bubbleWrap, children: [_jsx("span", { children: mine ? t('message.you') : agentName }), _jsx("p", { children: message.text }), _jsx("time", { children: formatTime(message.time) })] })] }));
}
//# sourceMappingURL=WechatAssistantWorkspace.js.map